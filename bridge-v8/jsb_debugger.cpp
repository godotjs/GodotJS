#include "jsb_debugger.h"
#include "jsb_realm.h"
#include "jsb_exception_info.h"
#include "jsb_environment.h"
#include "core/io/tcp_server.h"

#if JSB_WITH_DEBUGGER
#if JSB_WITH_LWS
#include "libwebsockets.h"
#include "../jsb_version.h"

#define JSB_DEBUGGER_LOG(Severity, Format, ...) JSB_LOG_IMPL(JSDebugger, Severity, Format, ##__VA_ARGS__)

namespace jsb
{
    constexpr int kContextGroupId = 1;
    constexpr int kMaxSendBufSize = 1024 * 1024;
    constexpr int kMaxRecvBufSize = 1024 * 1024;
    constexpr int kMaxProtocolBufSize = 1024 * 1024 * 2;

    namespace
    {
        String get_uri(lws* wsi, lws_token_indexes token)
        {
            static char buf[1024];
            const int hlen = lws_hdr_total_length(wsi, token);
            jsb_check(hlen < (int) std::size(buf) - 1);
            const int w = lws_hdr_copy(wsi, buf, (int) std::size(buf), token);
            if (w < 0)
            {
                return String();
            }
            return String(buf, w);
        }

        int _response_json(lws* wsi, http_status code, const char* content, int content_len)
        {
            static unsigned char buf[4096];
            unsigned char* p = buf;
            unsigned char* end = p + sizeof(buf);
            if (lws_add_http_common_headers(wsi, code, "application/json", content_len, &p, end))
            {
                return -1;
            }
            if (end - p - 1 - 2 < content_len)
            {
                return -1;
            }
            p[0] = '\r';
            p[1] = '\n';
            p += 2;
            memcpy(p, content, content_len);
            p[content_len] = '\0';
            if (lws_write_http(wsi, buf, (p - buf) + content_len))
            {
                return -1;
            }

            if (lws_http_transaction_completed(wsi))
            {
                return -1;
            }
            return 0;
        }
    }

	class JSInspectorChannel : public v8_inspector::V8Inspector::Channel
	{
	    v8::Isolate* isolate_;
	    lws* wsi_; // active wsi
        Vector<Ref<StreamPeerBuffer>> _send_queue;
	    std::unique_ptr<v8_inspector::V8InspectorSession> session_;

        Ref<StreamPeerBuffer> recv_buffer_;

	public:
	    JSInspectorChannel(lws* p_wsi, v8::Isolate* p_isolate, v8_inspector::V8Inspector& p_inspector)
        : isolate_(p_isolate), wsi_(p_wsi)
	    {
	        v8_inspector::StringView state;
	        v8_inspector::V8Inspector::ClientTrustLevel trust_level = v8_inspector::V8Inspector::ClientTrustLevel::kFullyTrusted;
	        session_ = p_inspector.connect(kContextGroupId, this, state, trust_level);
	        recv_buffer_.instantiate();
	        recv_buffer_->resize(kMaxRecvBufSize);
	    }

	    virtual ~JSInspectorChannel() override
	    {
	        if (session_)
	        {
	            session_->setSkipAllPauses(true);
	            session_->resume();
	            session_.reset();
	        }
	        // lws_close_reason(wsi_, LWS_CLOSE_STATUS_NORMAL, nullptr, 0);
	    }

	    bool operator==(lws* wsi) const { return wsi_ == wsi; }
	    bool operator!=(lws* wsi) const { return wsi_ != wsi; }

	    bool on_received(const unsigned char* p_buf, size_t p_len)
	    {
	        jsb_check(session_);
	        jsb_check(p_len < (size_t)kMaxRecvBufSize);
	        if (lws_is_first_fragment(wsi_))
	        {
	            recv_buffer_->seek(0);
	        }
	        const int new_len = recv_buffer_->get_position() + (int) p_len;
	        if (new_len > recv_buffer_->get_size())
	        {
	            recv_buffer_->resize(new_len);
	        }

	        recv_buffer_->put_data(p_buf, (int) p_len);
	        if (lws_is_final_fragment(wsi_))
	        {
	            const bool is_binary = lws_frame_is_binary(wsi_) == 1;
	            if (is_binary) { JSB_DEBUGGER_LOG(Debug, "receive binary message: %d", recv_buffer_->get_position()); }
	            else { JSB_DEBUGGER_LOG(Debug, "receive text message: %s", String::utf8((const char*) recv_buffer_->get_data_array().ptr(), recv_buffer_->get_position())); }

	            v8::Isolate* isolate = isolate_;
	            v8::Isolate::Scope isolate_scope(isolate);
	            v8::HandleScope handle_scope(isolate);
	            v8::TryCatch try_catch(isolate);

	            v8_inspector::StringView message(recv_buffer_->get_data_array().ptr(), recv_buffer_->get_position());
	            session_->dispatchProtocolMessage(message);
	            if (JavaScriptExceptionInfo exception_info = JavaScriptExceptionInfo(isolate, try_catch))
	            {
	                JSB_DEBUGGER_LOG(Error, "dispatchProtocolMessage failed: %s", (String) exception_info);
	            }

	            if (!_send_queue.is_empty())
	            {
	                lws_callback_on_writable(wsi_);
	            }
	        }
	        return true;
	    }

	    // wsi is ready to write
	    bool flush()
	    {
	        if (!_send_queue.is_empty())
	        {
	            Ref<StreamPeerBuffer> buffer = _send_queue[0];
	            const int len =  buffer->get_position() - LWS_PRE;
	            const int sent = lws_write(wsi_, buffer->get_data_array().ptrw() + LWS_PRE, len, LWS_WRITE_TEXT);
	            if (sent != len)
	            {
	                JSB_DEBUGGER_LOG(Error, "connection write error, %d bytes in buf but only %d sent", len, sent);
	                return false;
	            }

	            JSB_DEBUGGER_LOG(Verbose, "send message: %d bytes", len);
	            _send_queue.remove_at(0);
	            if (!_send_queue.is_empty())
	            {
	                JSB_DEBUGGER_LOG(Verbose, "messages in queue to be sent: %d", _send_queue.size());
	                lws_callback_on_writable(wsi_);
	            }
	        }
	        return true;
	    }

	    virtual void sendResponse(int callId, std::unique_ptr<v8_inspector::StringBuffer> message) override { send_mseeage(message->string()); }
	    virtual void sendNotification(std::unique_ptr<v8_inspector::StringBuffer> message) override { send_mseeage(message->string()); }
		virtual void flushProtocolNotifications() override {}

	private:
	    void send_mseeage(const v8_inspector::StringView& view)
	    {
	        if (view.is8Bit())
	        {
	            _notify_send(view.characters8(), view.length());
	        }
	        else
	        {
	            const CharString encoded = String::utf16((const char16_t*) view.characters16(), (int) view.length()).utf8();
	            _notify_send((const uint8_t*) encoded.ptr(), encoded.length());
	        }
	    }

        void _notify_send(const uint8_t* p_buf, size_t p_len)
	    {
	        jsb_check(wsi_);
	        jsb_check(p_len < kMaxSendBufSize);
	        const int rlen = (int) p_len + LWS_PRE;
	        Ref<StreamPeerBuffer> buffer;
	        buffer.instantiate();
	        buffer->resize(rlen);
	        buffer->seek(LWS_PRE);
	        buffer->put_data(p_buf, (int) p_len);
	        jsb_check((int) p_len + LWS_PRE == buffer->get_position());
	        _send_queue.append(buffer);
	        lws_callback_on_writable(wsi_);
	    }
	};

    class JavaScriptDebuggerImpl : public JavaScriptDebugger, public v8_inspector::V8InspectorClient
    {
        static void _lws_log_callback(int level, const char* msg)
        {
            JSB_DEBUGGER_LOG(Debug, "[LWS] %s", msg);
        }

        enum EClientState
        {
            ECS_NONE,
            ECS_READY,
            ECS_PAUSED,
        };

        v8::Isolate* isolate_;
        std::unique_ptr<v8_inspector::V8Inspector> inspector_;
        uint16_t port_;

        lws_protocols protocols_[2] = { {}, {} };
        lws_context* wss_;
        std::unique_ptr<JSInspectorChannel> channel_;

        EClientState state_;
        int context_index_;

    public:
        JavaScriptDebuggerImpl(v8::Isolate* p_isolate, uint16_t p_port)
            : isolate_(p_isolate), port_(p_port)
            , wss_(nullptr)
            , state_(ECS_NONE), context_index_(0)
        {
        }

        virtual ~JavaScriptDebuggerImpl() override
        {
            channel_.reset();
            lws_context_destroy(wss_);
        }

	    void init()
        {
            JSB_BENCHMARK_SCOPE(JSDebugger, Init);

	        v8::Isolate* isolate = isolate_;
	        v8::Isolate::Scope isolateScope(isolate);
	        v8::HandleScope handleScope(isolate);

	        inspector_ = v8_inspector::V8Inspector::create(isolate, this);
	        state_ = ECS_READY;

	        //lws_set_log_level(LLL_USER | LLL_DEBUG | LLL_NOTICE | LLL_ERR | LLL_WARN | LLL_INFO | LLL_CLIENT | LLL_THREAD, _lws_log_callback);
	        lws_set_log_level(LLL_USER | LLL_ERR | LLL_WARN, _lws_log_callback);

	        jsb_check(std::size(protocols_) >= 2);
	        protocols_[0].name = "binary";
	        protocols_[0].callback = _v8_protocol_callback;
	        protocols_[0].per_session_data_size = 0;
	        protocols_[0].rx_buffer_size = (size_t)kMaxProtocolBufSize;

	        lws_context_creation_info context_creation_info = {};
            context_creation_info.port = port_;
	        context_creation_info.iface = nullptr;
	        context_creation_info.protocols = protocols_;
	        context_creation_info.extensions = nullptr;
	        context_creation_info.gid = -1;
	        context_creation_info.uid = -1;
	        context_creation_info.user = this;
	        context_creation_info.options = LWS_SERVER_OPTION_DISABLE_IPV6;

	        wss_ = lws_create_context(&context_creation_info);
            JSB_DEBUGGER_LOG(Debug, "devtools://devtools/bundled/inspector.html?experiments=true&v8only=true&ws=127.0.0.1:%d/1", port_);
        }

	    virtual void update() override
	    {
	        lws_service(wss_, -1);
	        lws_callback_on_writable_all_protocol(wss_, protocols_);
	    }

        virtual void runMessageLoopOnPause(int contextGroupId) override
        {
            if (state_ == ECS_READY)
            {
                state_ = ECS_PAUSED;
                while (state_ == ECS_PAUSED)
                {
                    update();
                }
            }
        }

        virtual void quitMessageLoopOnPause() override
        {
            if (state_ == ECS_PAUSED)
            {
                state_ = ECS_READY;
            }
        }

        virtual void runIfWaitingForDebugger(int contextGroupId) override
        {
            JSB_DEBUGGER_LOG(Debug, "%d", contextGroupId);
            //printf("runIfWaitingForDebugger %d\n", _state);
            // if (_ctx && _ctx->_waingForDebuggerCallback)
            // {
            //     _ctx->_waingForDebuggerCallback(_ctx);
            // }
        }

    protected:
        virtual void on_context_created(const v8::Local<v8::Context>& p_context) override
	    {
	        const CharString context_name = vformat("context.%d", ++context_index_).utf8();
	        v8_inspector::StringView name((const uint8_t*) context_name.ptr(), context_name.length());
	        inspector_->contextCreated(v8_inspector::V8ContextInfo(p_context, kContextGroupId, name));
	    }

        virtual void on_context_destroyed(const v8::Local<v8::Context>& p_context) override
	    {
	        inspector_->contextDestroyed(p_context);
	    }

    private:
        void _on_lws_close(lws* wsi)
        {
            if (channel_ && *channel_ == wsi)
            {
		        JSB_DEBUGGER_LOG(Debug, "connection closed");
                channel_.reset();
            }
        }

        bool _on_lws_open(lws* wsi)
        {
            if (channel_)
            {
                JSB_DEBUGGER_LOG(Warning, "last channel not closed");
                return false;
            }

            JSB_DEBUGGER_LOG(Verbose, "new connection established");
            channel_ = std::make_unique<JSInspectorChannel>(wsi, isolate_, *inspector_);
            return true;
        }

	    static int _v8_protocol_callback(lws* wsi, lws_callback_reasons reason, void* user, void* in, size_t len)
        {
	        lws_context* ctx = lws_get_context(wsi);
	        JavaScriptDebuggerImpl* impl = (JavaScriptDebuggerImpl*)lws_context_user(ctx);

	        switch (reason)
	        {
	        case LWS_CALLBACK_ESTABLISHED:
		        if (!impl->_on_lws_open(wsi))
		        {
			        lws_close_reason(wsi, LWS_CLOSE_STATUS_ABNORMAL_CLOSE, nullptr, 0);
		            return -1;
		        }
		        return 0;
	        case LWS_CALLBACK_RECEIVE:
	            if (!impl->channel_ || *impl->channel_ != wsi)
	            {
		            JSB_DEBUGGER_LOG(Error, "unexpected connection");
			        lws_close_reason(wsi, LWS_CLOSE_STATUS_UNEXPECTED_CONDITION, nullptr, 0);
	                return -1;
	            }
	            if (!impl->channel_->on_received((unsigned char*) in, len))
	            {
		            JSB_DEBUGGER_LOG(Error, "failed to receive");
	                lws_close_reason(wsi, LWS_CLOSE_STATUS_ABNORMAL_CLOSE, nullptr, 0);
	                return -1;
	            }

	            JSB_DEBUGGER_LOG(Verbose, "on receive callback");
		        return 0;
	        case LWS_CALLBACK_CLIENT_WRITEABLE:
	        case LWS_CALLBACK_SERVER_WRITEABLE:
	            if (!impl->channel_ || *impl->channel_ != wsi || !impl->channel_->flush())
	            {
		            JSB_DEBUGGER_LOG(Error, "failed to flush");
			        lws_close_reason(wsi, LWS_CLOSE_STATUS_ABNORMAL_CLOSE, nullptr, 0);
	                return -1;
	            }

	            // JSB_DEBUGGER_LOG(Verbose, "on writeable callback");
		        return 0;
	        case LWS_CALLBACK_CLOSED:
		        JSB_DEBUGGER_LOG(Debug, "wsi closed");
		        impl->_on_lws_close(wsi);
		        return -1;
	        case LWS_CALLBACK_CLIENT_CONNECTION_ERROR:
		        JSB_DEBUGGER_LOG(Debug, "close wsi due to connection error");
		        impl->_on_lws_close(wsi);
		        return -1;
	        case LWS_CALLBACK_HTTP:
	            {
	                const String uri = get_uri(wsi, WSI_TOKEN_GET_URI);
	                if (uri == "/json" || uri == "/json/list")
	                {
	                    constexpr static char kJsonListFormat[] = \
                            "[{"
                            "\"description\": \"" JSB_MODULE_NAME_STRING "\","
                            "\"id\": \"0\","
                            "\"title\": \"" JSB_MODULE_NAME_STRING "\","
                            "\"type\": \"node\","
                            "\"webSocketDebuggerUrl\" : \"ws://localhost:%d\""
                            "}]";

	                    const CharString content = vformat(kJsonListFormat, impl->port_).utf8();
	                    JSB_DEBUGGER_LOG(Verbose, "GET /json/list");
	                    _response_json(wsi, HTTP_STATUS_OK, content.ptr(), content.length());
	                }
	                else if (uri == "/json/version")
	                {
	                    constexpr static char kJsonVersionFormat[] = \
                            "{"
                            "    \"Browser\": \"" JSB_MODULE_NAME_STRING "/" V8_S(JSB_MAJOR_VERSION) "." V8_S(JSB_MINOR_VERSION) "\","
                            "    \"Protocol-Version\" : \"1.1\","
                            "    \"User-Agent\" : \"" JSB_MODULE_NAME_STRING "/" V8_S(JSB_MAJOR_VERSION) "." V8_S(JSB_MINOR_VERSION) "\","
                            "    \"V8-Version\" : \"" V8_VERSION_STRING "\","
                            "	 \"webSocketDebuggerUrl\" : \"ws://localhost:%d\""
                            "}";
	                    const CharString content = vformat(kJsonVersionFormat, impl->port_).utf8();
	                    JSB_DEBUGGER_LOG(Verbose, "GET /json/version");
	                    _response_json(wsi, HTTP_STATUS_OK, content.ptr(), content.length());
	                }
	                else
	                {
	                    JSB_DEBUGGER_LOG(Verbose, "GET %s 404", uri);
	                    lws_return_http_status(wsi, HTTP_STATUS_NOT_FOUND, "<html><body>NOT FOUND</body></html>");
	                }
	                return -1;
	            }
	        case LWS_CALLBACK_HTTP_BODY_COMPLETION:
	            JSB_DEBUGGER_LOG(Verbose, "LWS_CALLBACK_HTTP_BODY_COMPLETION");
		        lws_return_http_status(wsi, 200, nullptr);
	            return -1;
	        case LWS_CALLBACK_CLIENT_ESTABLISHED:
	        case LWS_CALLBACK_CLIENT_CLOSED:
	        case LWS_CALLBACK_CLIENT_RECEIVE:
	            JSB_DEBUGGER_LOG(Error, "unexpected %d", reason);
	            return -1;
	        default:
	            // LWS_CALLBACK_EVENT_WAIT_CANCELLED 71
	            // LWS_CALLBACK_PROTOCOL_INIT 27
	            // LWS_CALLBACK_GET_THREAD_ID 31
	            JSB_DEBUGGER_LOG(Verbose, "unhandled %d", reason);
	            return 0;
	        }
        }
    };
}
#else
namespace jsb
{
    class JavaScriptDebuggerImpl : public JavaScriptDebugger
    {
    public:
        JavaScriptDebuggerImpl(v8::Isolate* p_isolate, uint16_t p_port) {}
        virtual ~JavaScriptDebuggerImpl() override {}

        void init() {}
        virtual void update() override {}

    protected:
        virtual void on_context_created(const v8::Local<v8::Context>& p_context) override {}
        virtual void on_context_destroyed(const v8::Local<v8::Context>& p_context) override {}

    };
}
#endif
namespace jsb
{
    std::unique_ptr<JavaScriptDebugger> JavaScriptDebugger::create(v8::Isolate* p_isolate, uint16_t p_port)
    {
        std::unique_ptr<JavaScriptDebuggerImpl> impl = std::make_unique<JavaScriptDebuggerImpl>(p_isolate, p_port);
        impl->init();
        return impl;
    }
}
#endif
