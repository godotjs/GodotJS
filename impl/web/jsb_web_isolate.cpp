#include "jsb_web_isolate.h"

#include "jsb_web_catch.h"
#include "jsb_web_handle.h"
#include "jsb_web_context.h"
#include "jsb_web_statistics.h"

namespace v8
{
    struct IsolateInternalFunctions
    {
        // crash val is an exception
        jsb_force_inline static JSValue verified(const JSValue val)
        {
            jsb_check(JS_VALUE_GET_TAG(val) != JS_TAG_EXCEPTION);
            return val;
        }

        jsb_force_inline static int verified(const int val)
        {
            jsb_check(val != -1);
            return val;
        }
    };

    using details = IsolateInternalFunctions;

    Isolate *Isolate::New(const CreateParams &params)
    {
        Isolate* isolate = memnew(Isolate);
        return isolate;
    }

    Isolate::Isolate() : ref_count_(1), disposed_(false), handle_scope_(nullptr), stack_pos_(0)
    {
        rt_ = jsbi_NewEngine(this);
        jsbi_SetHostPromiseRejectionTracker(rt_, _promise_rejection_tracker, this);
    }

    Isolate::~Isolate()
    {
        jsb_check(!rt_);
    }

    void Isolate::_release()
    {
        JSB_WEB_LOG(VeryVerbose, "release web runtime");

        // manually run GC before freeing the context/runtime to ensure all objects free-ed (valuetype objects)
        JS_RunGC(rt_);

        // cleanup
        jsb_check(!handle_scope_);
        jsb_check(phantom_.is_empty());
        jsb_check(stack_pos_ == jsb::impl::StackPos::Num);
        for (int i = 0; i < jsb::impl::StackPos::Num; ++i)
        {
            JS_FreeValue(ctx_, stack_[i]);
        }

        swap_free_queue();
        swap_free_queue();
        jsb_check(front_free_queue_.is_empty());
        jsb_check(back_free_queue_.is_empty());

#if !JSB_STRICT_DISPOSE
        // make it behave like v8, not to trigger gc callback after the isolate disposed
        internal_data_.clear();
#endif

        // dispose the runtime
        JS_FreeContext(ctx_);
        ctx_ = nullptr;
        JS_FreeRuntime(rt_);
        rt_ = nullptr;

#if JSB_STRICT_DISPOSE
        jsb_check(internal_data_.is_empty());
#endif

        memdelete(this);
    }

    void Isolate::Dispose()
    {
        jsb_check(!disposed_);
        disposed_ = true;
        _remove_reference();
    }

    void Isolate::SetData(int index, void* data)
    {
        jsb_check(index == 0);
        embedder_data_ = data;
    }

    uint16_t Isolate::push_map()
    {
        const JSValue val = JS_CallConstructor2(ctx_, details::verified(stack_[jsb::impl::StackPos::MapClass]), JS_UNDEFINED, 0, nullptr);
        jsb_check(JS_IsMap(ctx_, val));
        return push_steal(details::verified(val));
    }

    uint16_t Isolate::push_symbol()
    {
        const JSValue val = JS_CallConstructor2(ctx_, details::verified(stack_[jsb::impl::StackPos::SymbolClass]), JS_UNDEFINED, 0, nullptr);
        jsb_check(JS_VALUE_GET_TAG(val) == JS_TAG_SYMBOL);
        return push_steal(details::verified(val));
    }

    void Isolate::GetHeapStatistics(HeapStatistics* statistics)
    {
        memset(statistics, 0, sizeof(HeapStatistics));

        //TODO fill out available heap info
    }

    Local<Context> Isolate::GetCurrentContext()
    {
        return Local<Context>(Data(this, 0));
    }

    void Isolate::_promise_rejection_tracker(JSContext* ctx, JSValue promise, JSValue reason, int is_handled, void* user_data)
    {
        if (is_handled != 1)
        {
            Isolate* isolate = (Isolate*) user_data;
            if (!isolate->promise_reject_) return;

            HandleScope handle_scope(isolate);
            const PromiseRejectMessage message(isolate,
                kPromiseRejectWithNoHandler,
                isolate->push_copy(promise),
                isolate->push_copy(reason)
            );
            isolate->promise_reject_(message);
        }
    }

    bool Isolate::try_catch()
    {
        const JSValue ex = JS_GetException(ctx_);
        if (JS_IsNull(ex))
        {
            jsb_checkf(JS_IsNull(stack_[jsb::impl::StackPos::Exception]), "exception read but not handled (get_message)");
            return false;
        }
        if (!error_thrown_)
        {
            // it happens in two situations:
            //     1. the worker thread is forcibly terminated (it's OK)
            //     2. an exception was thrown by web API but not handled by web.impl (it's not expected)
            JSB_LOG(Warning, "unexpected exception thrown in web");
        }
        const JSValue last = stack_[jsb::impl::StackPos::Exception];
        jsb_check(JS_IsNull(last));
        stack_[jsb::impl::StackPos::Exception] = ex;
        error_thrown_ = false;
        return !JS_IsNull(ex);
    }

    void Isolate::RequestGarbageCollectionForTesting(GarbageCollectionType type)
    {
        JS_RunGC(rt_);
    }

    void Isolate::LowMemoryNotification()
    {
        JS_RunGC(rt_);
    }

}
