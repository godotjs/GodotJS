#include "jsb_worker.h"
#include "jsb_buffer.h"
#include "jsb_environment.h"
#include "jsb_thread_safe_for_nodes_scope.h"
#include "jsb_type_convert.h"
#include "../internal/jsb_sarray.h"
#include "../internal/jsb_thread_util.h"
#include "../internal/jsb_double_buffered.h"

#if JSB_WITH_WEB
#include <pthread.h>
#include <emscripten/emscripten.h>
#include <emscripten/threading.h>
#include "../impl/web/jsb_web_interop.h"
#endif

#define JSB_WORKER_LOG(Severity, Format, ...) JSB_LOG_IMPL(JSWorker, Severity, Format, ##__VA_ARGS__)
#define JSB_WORKER_MODULE_NAME "godot.worker"

namespace jsb
{
    namespace
    {
#if JSB_WITH_WEB
        v8::Local<v8::Value> restore_transfer_markers_impl(
            v8::Isolate* isolate,
            const v8::Local<v8::Context>& context,
            const v8::Local<v8::Value>& value,
            const std::vector<TransferData>& transfers);
#endif

        static void insert_transfer_variant(
            Environment* from_env,
            internal::ReferentialVariantMap<TransferData>& transfers,
            const Variant& variant)
        {
            if (transfers.getptr(variant))
            {
                return;
            }

            TransferData transfer_data;
            from_env->prepare_transfer_out(NativeObjectID::none(), transfers.size(), variant, transfer_data);
            transfers.insert(variant, transfer_data);
        }

        static void append_node_descendants_for_transfer(
            Environment* from_env,
            internal::ReferentialVariantMap<TransferData>& transfers,
            const Node* node)
        {
            if (!node)
            {
                return;
            }

            const int child_count = node->get_child_count();
            for (int i = 0; i < child_count; i++)
            {
                Node* child = node->get_child(i);
                if (!child)
                {
                    continue;
                }

                Variant child_variant = child;
                insert_transfer_variant(from_env, transfers, child_variant);
                append_node_descendants_for_transfer(from_env, transfers, child);
            }
        }
    }

#if JSB_WITH_WEB
    static SafeNumeric<uint32_t> s_next_transfer_id;
    constexpr int kPostMessageFailed = -1;
    // constexpr int kPostMessageSuccess = 0;
    constexpr int kPostMessageNativeTransfersUnused = 1;
#endif

    class WorkerImpl;

    class WorkerImpl
    {
        WorkerID id_ = {};
        void* const token_ = nullptr;
        const String path_;

        SafeFlag interrupt_requested_ = SafeFlag(false);
        Thread thread_;

        const NativeObjectID handle_;
        std::shared_ptr<Environment> env_;

#if JSB_WITH_WEB
        pthread_t pthread_id_ = 0;
        v8::Global<v8::Object> context_obj_handle_;
        uint64_t web_last_ticks_ = 0;

        SpinLock transfers_lock_;
        HashMap<uint32_t, std::vector<TransferData>> transfers_;
#else
        internal::DoubleBuffered<WorkerMessage> inbox_;
#endif

    public:
        WorkerImpl(Environment* p_master, const String& p_path, NativeObjectID p_handle)
        : token_(p_master), path_(p_path), handle_(p_handle)
        {
        }

        ~WorkerImpl()
        {
            JSB_WORKER_LOG(VeryVerbose, "~WorkerImpl %d", id_);
        }

        jsb_force_inline WorkerID get_id() const { return id_; }

        jsb_force_inline NativeObjectID get_handle() const { return handle_; }

        jsb_force_inline void* get_token() const { return token_; }

        jsb_force_inline Thread::ID get_thread_id() const { return thread_.get_id(); }

#if JSB_WITH_WEB
        jsb_force_inline pthread_t get_pthread_id() const { return pthread_id_; }

        // Queue transfers for a native postMessage (called from main thread)
        bool queue_transfers(uint32_t msg_id, std::vector<TransferData>&& transfers)
        {
            transfers_lock_.lock();
            transfers_.insert(msg_id, std::move(transfers));
            transfers_lock_.unlock();
            return true;
        }

        bool discard_transfers(uint32_t msg_id)
        {
            transfers_lock_.lock();
            const bool exists = transfers_.has(msg_id);

            if (exists)
            {
                transfers_.erase(msg_id);
            }

            transfers_lock_.unlock();
            return exists;
        }

        // Take transfers for a native postMessage (called from worker thread)
        std::vector<TransferData> take_transfers(uint32_t msg_id)
        {
            std::vector<TransferData> result;
            transfers_lock_.lock();
            if (auto* ptr = transfers_.getptr(msg_id))
            {
                result = std::move(*ptr);
                transfers_.erase(msg_id);
            }
            transfers_lock_.unlock();
            return result;
        }

        bool get_or_add_transfer(uint32_t msg_id, const Variant& variant, uint32_t& r_transfer_index, Worker::WebNativeTransferError& r_error)
        {
            r_error = Worker::WebNativeTransferError::None;

            transfers_lock_.lock();

            std::vector<TransferData>* transfers = transfers_.getptr(msg_id);

            if (!transfers)
            {
                transfers_lock_.unlock();
                r_error = Worker::WebNativeTransferError::TransferAppendFailed;
                return false;
            }

            for (const TransferData& transfer : *transfers)
            {
                if (transfer.variant == variant)
                {
                    r_transfer_index = transfer.transfer_index;
                    transfers_lock_.unlock();
                    return true;
                }
            }

            if (variant.get_type() == Variant::OBJECT)
            {
                transfers_lock_.unlock();
                r_error = Worker::WebNativeTransferError::ObjectNotInTransferList;
                return false;
            }

            internal::ReferentialVariantMap<Variant> clone_map;
            clone_map.reserve(transfers->size());

            for (const TransferData& transfer : *transfers)
            {
                clone_map.insert(transfer.variant, transfer.variant);
            }

            bool cloned = false;
            Variant cloned_variant = internal::VariantUtil::structured_clone(variant, clone_map, cloned);

            if (!cloned)
            {
                transfers_lock_.unlock();
                r_error = Worker::WebNativeTransferError::VariantCloneFailed;
                return false;
            }

            TransferData transfer_data;
            transfer_data.transfer_index = transfers->size();
            transfer_data.variant = cloned_variant;
            transfers->push_back(transfer_data);
            r_transfer_index = transfer_data.transfer_index;

            transfers_lock_.unlock();

            return true;
        }

        void on_web_message(jsb::impl::StackPosition data_sp, uint32_t transfer_id)
        {
            if (!env_ || context_obj_handle_.IsEmpty())
            {
                return;
            }

            v8::Isolate* isolate = env_->get_isolate();
            v8::Isolate::Scope isolate_scope(isolate);
            v8::HandleScope handle_scope(isolate);
            const v8::Local<v8::Context> context = env_->get_context();
            v8::Context::Scope context_scope(context);
            const v8::Local<v8::Object> context_obj = context_obj_handle_.Get(isolate);

            v8::Local<v8::Value> callback;
            if (!context_obj->Get(context, jsb_name(env_, onmessage)).ToLocal(&callback) || !callback->IsFunction())
            {
                return;
            }

            v8::Local<v8::Value> data = v8::Local<v8::Value>(v8::Data(isolate, data_sp));
            std::vector<TransferData> transfers = take_transfers(transfer_id);

            if (!transfers.empty())
            {
                ThreadSafeForNodesScope node_safe_scope;
                for (const auto& transfer : transfers)
                {
                    v8::HandleScope transfer_bind_scope(isolate);
                    env_->transfer_in_bind(context, transfer);
                }

                for (const auto& transfer : transfers)
                {
                    v8::HandleScope transfer_state_scope(isolate);
                    env_->transfer_in_apply_state(transfer);
                }

                data = Worker::web_restore_transfer_markers(isolate, context, data, transfers);
            }

            const impl::TryCatch try_catch(isolate);
            v8::Local<v8::Value> argv[] = { data };
            const v8::MaybeLocal<v8::Value> rval = callback.As<v8::Function>()->Call(context, context_obj, 1, argv);
            jsb_unused(rval);
            if (try_catch.has_caught())
            {
                JSB_WORKER_LOG(Error, "%s", BridgeHelper::get_exception(try_catch));
            }
        }

        bool _web_tick()
        {
            const std::shared_ptr<Environment> env = env_;
            if (!env)
            {
                return false;
            }

            if (interrupt_requested_.is_set())
            {
                _shutdown_environment(nullptr);
                return false;
            }

            _update_environment(env, OS::get_singleton(), web_last_ticks_);
            emscripten_current_thread_process_queued_calls();

            if (interrupt_requested_.is_set())
            {
                _shutdown_environment(nullptr);
                return false;
            }

            return true;
        }

        static void _web_loop_tick(void* p_user_data)
        {
            WorkerImpl* impl = static_cast<WorkerImpl*>(p_user_data);
            if (!impl || !impl->_web_tick())
            {
                emscripten_cancel_main_loop();
            }
        }
#else
        void _dispatch_inbox(const std::shared_ptr<Environment>& p_env, const v8::Global<v8::Object>& p_context_obj_handle)
        {
            std::vector<WorkerMessage>& messages = inbox_.swap();

            if (messages.empty())
            {
                return;
            }

            v8::Isolate* isolate = p_env->get_isolate();
            v8::Isolate::Scope isolate_scope(isolate);
            v8::HandleScope handle_scope(isolate);
            const v8::Local<v8::Context> context = p_env->get_context();
            v8::Context::Scope context_scope(context);

            if (p_context_obj_handle.IsEmpty())
            {
                messages.clear();
                return;
            }

            const v8::Local<v8::Object> context_obj = p_context_obj_handle.Get(isolate);

            for (const WorkerMessage& message : messages)
            {
                if (interrupt_requested_.is_set()) break;
                v8::HandleScope message_handle_scope(isolate);
                _on_message(p_env, context, context_obj, message);
            }

            messages.clear();
        }

        bool on_receive(WorkerMessage&& p_message)
        {
            if (interrupt_requested_.is_set())
            {
                return false;
            }
            inbox_.add(std::move(p_message));
            return true;
        }
#endif

        static void _update_environment(const std::shared_ptr<Environment>& p_env, const OS* p_os, uint64_t& p_last_ticks)
        {
            const uint64_t ticks = p_os->get_ticks_msec();
            const uint64_t delta = ticks - p_last_ticks;
            p_env->update(delta);
            p_last_ticks = ticks;
        }

        void _shutdown_environment(v8::Global<v8::Object>* p_local_context_obj_handle)
        {
#if JSB_WITH_WEB
            context_obj_handle_.Reset();
#endif
            if (p_local_context_obj_handle)
            {
                p_local_context_obj_handle->Reset();
            }

            interrupt_requested_.set();
            if (env_)
            {
                env_->dispose();
                env_.reset();
            }
        }

        static void _run(void* data)
        {
            WorkerImpl* impl = (WorkerImpl*) data;
            internal::ThreadUtil::set_name(jsb_format("JSWorker_%d", *impl->id_));

#if JSB_WITH_WEB
            impl->pthread_id_ = pthread_self();
#else
            const OS* os = OS::get_singleton();
            uint64_t last_ticks = os->get_ticks_msec();
#endif

            jsb_check(!impl->env_);
            if (!impl->interrupt_requested_.is_set())
            {
                Environment::CreateParams params;
                params.initial_class_slots = JSB_WORKER_INITIAL_CLASS_SLOTS;
                params.initial_object_slots = JSB_WORKER_INITIAL_OBJECT_SLOTS;
                params.initial_script_slots = JSB_WORKER_INITIAL_SCRIPT_SLOTS;
                params.thread_id = Thread::get_caller_id();
                params.type = Environment::Type::Worker;

                const std::shared_ptr<Environment> env = std::make_shared<Environment>(params);
                impl->env_ = env;
                env->init();

                v8::Global<v8::Object> context_obj_handle;
                {
                    // setup 'postMessage, onmessage, transfer etc.' for worker

                    JavaScriptModule* module = nullptr;
                    jsb_ensuref(env->load(JSB_WORKER_MODULE_NAME, &module) == OK,
                        "failed to load '%s' module in worker thread %d", JSB_WORKER_MODULE_NAME, impl->get_id());

                    v8::Isolate* isolate = env->get_isolate();
                    v8::Isolate::Scope isolate_scope(isolate);
                    v8::HandleScope handle_scope(isolate);
                    const v8::Local<v8::Context> context = env->get_context();
                    v8::Context::Scope context_scope(context);

                    const v8::Local<v8::Object> context_obj = v8::Object::New(isolate);
                    const v8::Local<v8::Value> exports_val = module->exports.Get(isolate);
                    jsb_check(!exports_val.IsEmpty() && exports_val->IsObject() && !exports_val->IsNullOrUndefined());
                    const v8::Local<v8::Object> exports = exports_val.As<v8::Object>();
                    exports->Set(context, jsb_name(env, JSWorkerParent), context_obj).Check();
                    context_obj_handle.Reset(isolate, context_obj);
#if JSB_WITH_WEB
                    impl->context_obj_handle_.Reset(isolate, context_obj);
#endif

                    impl::Helper::set_as_interruptible(isolate);
                    context_obj->Set(context,
                        jsb_name(env, transfer),
                        v8::Function::New(context, &worker_transfer, v8::Uint32::NewFromUnsigned(isolate, *impl->id_)).ToLocalChecked()
                        )
                    .Check();
                    context_obj->Set(context,
                        jsb_name(env, postMessage),
                        v8::Function::New(context, &worker_post_message, v8::Uint32::NewFromUnsigned(isolate, *impl->id_)).ToLocalChecked()
                        )
                    .Check();
                    context_obj->Set(context,
                        jsb_name(env, close),
                        v8::Function::New(context, &worker_close, v8::Uint32::NewFromUnsigned(isolate, *impl->id_)).ToLocalChecked()
                        )
                    .Check();
                    context_obj->Set(context,
                        jsb_name(env, onmessage),
                        v8::Null(isolate)
                        )
                    .Check();
                }

                if (env->load(impl->path_) == OK)
                {
                    // notify master
                    impl->_on_ready();

#if JSB_WITH_WEB
                    if (const OS* os = OS::get_singleton())
                    {
                        impl->web_last_ticks_ = os->get_ticks_msec();
                    }
                    else
                    {
                        impl->web_last_ticks_ = 0;
                    }
                    emscripten_set_main_loop_arg(&WorkerImpl::_web_loop_tick, impl, 0, true);
#else
                    while (!impl->interrupt_requested_.is_set())
                    {
                        impl->_dispatch_inbox(env, context_obj_handle);
                        WorkerImpl::_update_environment(env, os, last_ticks);
                        os->delay_usec(10 * 1000);
                    }
#endif
                }

                impl->_shutdown_environment(&context_obj_handle);
            }
            // impl->finished_.post();
            JSB_WORKER_LOG(VeryVerbose, "thread.run exited %d", impl->id_);
        }

        // call from master thread
        void init(WorkerID p_id)
        {
            jsb_check(!id_);
            jsb_check(p_id);
            id_ = p_id;
            JSB_WORKER_LOG(VeryVerbose, "starting Worker %d", p_id);
            Thread::Settings settings;
            settings.priority = Thread::PRIORITY_LOW;
            thread_.start(_run, this,  settings);
        }

        // call from main thread
        void join()
        {
            jsb_check(interrupt_requested_.is_set());
            JSB_WORKER_LOG(VeryVerbose, "wait to finish %d", id_);
            // finished_.wait();
            if (thread_.is_started())
            {
                thread_.wait_to_finish();
            }
            JSB_WORKER_LOG(VeryVerbose, "finished %d", id_);
        }

        void finish()
        {
            if (interrupt_requested_.is_set())
            {
                return;
            }

            interrupt_requested_.set();
            if (const std::shared_ptr<Environment> env = env_)
            {
                v8::Isolate* isolate = env->get_isolate();
                if (isolate->IsExecutionTerminating())
                {
                    JSB_WORKER_LOG(Log, "worker is terminating %d", id_);
                    return;
                }
                isolate->TerminateExecution();
            }
        }

    private:

        // (worker) handle message from master
#if !JSB_WITH_WEB
        void _on_message(const std::shared_ptr<Environment>& p_env, const v8::Local<v8::Context>& p_context, const v8::Local<v8::Object>& p_context_obj, const WorkerMessage& p_message)
        {
            v8::Isolate* isolate = p_env->get_isolate();
            v8::Local<v8::Value> callback;
            if (!p_context_obj->Get(p_context, jsb_name(p_env, onmessage)).ToLocal(&callback) || !callback->IsFunction())
            {
                JSB_WORKER_LOG(Error, "onmessage is not a function");
                return;
            }

            Environment* worker_env = env_.get();

            if (p_message.get_transfers().size() > 0)
            {
                const std::shared_ptr<Environment> owner_env = Environment::_access(token_);

                if (!owner_env)
                {
                    JSB_WORKER_LOG(Error, "failed to access worker owner environment from worker onmessage");
                    return;
                }

                ThreadSafeForNodesScope node_safe_scope;
                for (const auto& transfer : p_message.get_transfers())
                {
                    v8::HandleScope transfer_bind_scope(isolate);
                    p_env->transfer_in_bind(p_context, transfer);
                }

                for (const auto& transfer : p_message.get_transfers())
                {
                    v8::HandleScope transfer_state_scope(isolate);
                    p_env->transfer_in_apply_state(transfer);
                }
            }

            Serialization::VariantDeserializerDelegate delegate(worker_env, p_message.get_transfers());
            v8::ValueDeserializer deserializer(isolate, p_message.get_data().ptr(), p_message.get_data().size(), &delegate);
            delegate.SetSerializer(&deserializer);

            bool ok;
            if (!deserializer.ReadHeader(p_context).To(&ok) || !ok)
            {
                JSB_WORKER_LOG(Error, "failed to parse message header");
                return;
            }

            v8::Local<v8::Value> value;

            {
                Environment::ExecutionDeferredScope defer(worker_env);

                if (!deserializer.ReadValue(p_context).ToLocal(&value))
                {
                    JSB_WORKER_LOG(Error, "failed to parse message value");
                    return;
                }
            }

            const impl::TryCatch try_catch(isolate);
            const v8::Local<v8::Function> call = callback.As<v8::Function>();
            const v8::MaybeLocal<v8::Value> rval = call->Call(p_context, v8::Undefined(isolate), 1, &value);
            jsb_unused(rval);
            if (try_catch.has_caught())
            {
                JSB_WORKER_LOG(Error, "%s", BridgeHelper::get_exception(try_catch));
            }
        }
#endif

        void _on_ready()
        {
            v8::Isolate* isolate = env_->get_isolate();
            v8::HandleScope handle_scope(isolate);
            v8::Isolate::Scope isolate_scope(isolate);

            WorkerImplPtr worker_impl_ptr;
            if (!Worker::try_get_worker(get_id(), worker_impl_ptr))
            {
                jsb_throw(isolate, "invalid worker id");
                return;
            }

#if JSB_WITH_WEB
            const uintptr_t sender_pthread_id = static_cast<uintptr_t>(pthread_self());
            if (!sender_pthread_id)
            {
                jsb_throw(isolate, "ready: failed to resolve worker pthread id");
                return;
            }

            const uintptr_t env_token = reinterpret_cast<uintptr_t>(env_.get());
            const int message_result = jsbi_PostMessage(
                sender_pthread_id,
                static_cast<jsb::impl::JSRuntime>(env_token),
                jsb::impl::StackBase::Undefined,
                0,
                jsb::impl::StackBase::Undefined);
            if (message_result == kPostMessageFailed)
            {
                jsb_throw(isolate, "ready: native web postMessage failed");
            }
#else
            const std::shared_ptr<Environment> master = Environment::_access(worker_impl_ptr->token_);
            if (!master)
            {
                jsb_throw(isolate, "invalid environment");
                return;
            }

            master->post_message(Message(Message::TYPE_READY, worker_impl_ptr->handle_));
#endif
        }

        // worker.close()
        static void worker_close(const v8::FunctionCallbackInfo<v8::Value>& info)
        {
            v8::Isolate* isolate = info.GetIsolate();
            v8::HandleScope handle_scope(isolate);
            v8::Isolate::Scope isolate_scope(isolate);
            const WorkerID worker_id = (WorkerID) info.Data().As<v8::Uint32>()->Value();
            Worker::request_termination(worker_id);
        }

        // worker -> master (run in worker env)
        static void worker_transfer(const v8::FunctionCallbackInfo<v8::Value>& info)
        {
            v8::Isolate* isolate = info.GetIsolate();
            Environment* env = Environment::wrap(isolate);
            v8::HandleScope handle_scope(isolate);
            v8::Isolate::Scope isolate_scope(isolate);
            const v8::Local<v8::Context> context = isolate->GetCurrentContext();
            const WorkerID worker_id = (WorkerID) info.Data().As<v8::Uint32>()->Value();

            WorkerImplPtr worker_impl_ptr;
            if (!Worker::try_get_worker(worker_id, worker_impl_ptr))
            {
                jsb_throw(isolate, "invalid worker id");
                return;
            }

            const std::shared_ptr<Environment> master = Environment::_access(worker_impl_ptr->token_);
            if (!master)
            {
                jsb_throw(isolate, "invalid environment");
                return;
            }

            Variant target;
            if (!TypeConvert::js_to_gd_var(isolate, context, info[0], target))
            {
                jsb_throw(isolate, "bad parameter");
                return;
            }
            Environment::transfer_to_host(env, master.get(), worker_impl_ptr->handle_, target);
        }

        // worker -> master (run in worker env)
        static void worker_post_message(const v8::FunctionCallbackInfo<v8::Value>& info)
        {
            v8::Isolate* isolate = info.GetIsolate();
            v8::HandleScope handle_scope(isolate);
            v8::Isolate::Scope isolate_scope(isolate);
            Environment* from_env = Environment::wrap(isolate);
            from_env->check_internal_state();
            const WorkerID worker_id = (WorkerID) info.Data().As<v8::Uint32>()->Value();

            WorkerImplPtr worker_impl_ptr;
            if (!Worker::try_get_worker(worker_id, worker_impl_ptr))
            {
                jsb_throw(isolate, "invalid worker id");
                return;
            }

#if JSB_WITH_WEB
            const v8::Local<v8::Context> context = isolate->GetCurrentContext();
            if (info.Length() == 0)
            {
                jsb_throw(isolate, "postMessage requires at least 1 argument");
                return;
            }

            internal::ReferentialVariantMap<TransferData> transfer_map;

            if (!Worker::parse_transfer_list(isolate, context, from_env, info, transfer_map))
            {
                return;
            }

            uint32_t transfer_id = s_next_transfer_id.increment();

            if (transfer_id == 0)
            {
                transfer_id = s_next_transfer_id.increment();
            }

            std::vector<TransferData> transfers_vec(transfer_map.size());

            for (const auto& entry : transfer_map)
            {
                transfers_vec[entry.value.transfer_index] = entry.value;
            }

            const uintptr_t sender_pthread_id = static_cast<uintptr_t>(pthread_self());

            if (!sender_pthread_id)
            {
                jsb_throw(isolate, "postMessage: failed to resolve worker pthread id");
                return;
            }

            if (!Worker::web_queue_transfers(sender_pthread_id, transfer_id, std::move(transfers_vec)))
            {
                jsb_throw(isolate, "postMessage: failed to queue native transfers");
                return;
            }

            const impl::StackPosition data_sp = static_cast<impl::StackPosition>(info[0]);
            const impl::StackPosition transfer_sp = info.Length() > 1
                ? static_cast<impl::StackPosition>(info[1])
                : jsb::impl::StackBase::Undefined;
            const uintptr_t env_token = reinterpret_cast<uintptr_t>(from_env);
            const int message_result = jsbi_PostMessage(
                sender_pthread_id,
                static_cast<jsb::impl::JSRuntime>(env_token),
                data_sp,
                transfer_id,
                transfer_sp);

            if (message_result == kPostMessageFailed)
            {
                Worker::web_discard_transfers(sender_pthread_id, transfer_id);
                jsb_throw(isolate, "postMessage: native web postMessage failed");
                return;
            }
            else if (message_result == kPostMessageNativeTransfersUnused)
            {
                Worker::web_discard_transfers(sender_pthread_id, transfer_id);
            }

            for (const auto& entry : transfer_map)
            {
                from_env->finalize_transfer_out(entry.value);
            }
            return;
#else
            const std::shared_ptr<Environment> master = Environment::_access(worker_impl_ptr->token_);
            if (!master)
            {
                jsb_throw(isolate, "invalid environment");
                return;
            }

            internal::ReferentialVariantMap<TransferData> transfer_map;
            const std::pair<uint8_t*, size_t> data = Worker::handle_post_message(info, transfer_map);

            if (data.first)
            {
                // Use indexed placement to ensure correct ordering by transfer_index
                std::vector<TransferData> transfers(transfer_map.size());
                for (const auto& transfer : transfer_map)
                {
                    transfers[transfer.value.transfer_index] = transfer.value;
                }

                master->post_message(Message(Message::TYPE_MESSAGE, worker_impl_ptr->handle_, Buffer::steal(data.first, data.second), std::move(transfers)));
            }
#endif
        }
    };

    WorkerLock Worker::lock_;
    internal::SArray<WorkerImplPtr, WorkerID> Worker::worker_list_;
    HashMap<Thread::ID, WorkerID> Worker::workers_;

    class JSWorkerModuleLoader : public IModuleLoader
    {
    public:
        virtual ~JSWorkerModuleLoader() override = default;

        virtual bool load(Environment* p_env, JavaScriptModule& p_module) override
        {
            v8::Isolate* isolate = p_env->get_isolate();
            v8::Isolate::Scope isolate_scope(isolate);
            v8::HandleScope handle_scope(isolate);
            const v8::Local<v8::Context> context = p_env->get_context();
            v8::Context::Scope context_scope(context);

            const v8::Local<v8::Object> exports = v8::Object::New(isolate);
            p_module.exports.Reset(isolate, exports);

            const StringName class_name = jsb_string_name(JSWorker);
            const NativeClassID class_id = p_env->add_native_class(NativeClassType::Worker, class_name);
            impl::ClassBuilder class_builder = impl::ClassBuilder::New<IF_ObjectFieldCount>(isolate, class_name, &Worker::constructor, *class_id);

            class_builder.Instance().Method("postMessage", &Worker::post_message);
            class_builder.Instance().Method("onready", &Worker::_placeholder);
            class_builder.Instance().Method("onerror", &Worker::_placeholder);
            class_builder.Instance().Method("onmessage", &Worker::_placeholder);
            class_builder.Instance().Method("ontransfer", &Worker::_placeholder);
            class_builder.Instance().Method("terminate", &Worker::terminate);

            const NativeClassInfoPtr class_info = p_env->get_native_class(class_id);
            class_info->finalizer = &Worker::finalizer;
            class_info->clazz = class_builder.Build();
            jsb_check(!class_info->clazz.IsEmpty());
            jsb_check(class_info->name == class_name);
            jsb_check(!class_info->clazz.IsEmpty());
            exports->Set(context, jsb_name(p_env, JSWorker), class_info->clazz.Get(isolate));
            return true;
        }

    };

    // construct a Worker object (called from master thread)
    WorkerID Worker::create(Environment* p_master, const String& p_path, NativeObjectID p_handle)
    {
        lock_.lock();
        WorkerImplPtr worker = std::make_shared<WorkerImpl>(p_master, p_path, p_handle);
        const WorkerID id = worker_list_.add(worker);
        worker->init(id);
        jsb_check(worker->get_thread_id() != Thread::UNASSIGNED_ID);
        workers_.insert(worker->get_thread_id(), id);
        lock_.unlock();

        return id;
    }

    bool Worker::is_valid(WorkerID p_id)
    {
        lock_.lock();
        const bool valid = worker_list_.is_valid_index(p_id);
        lock_.unlock();
        return valid;
    }

#if JSB_WITH_WEB
    void Worker::on_web_message(jsb::impl::StackPosition p_data_sp, uint32_t p_transfer_id)
    {
        const Thread::ID thread_id = Thread::get_caller_id();
        lock_.lock();
        if (!workers_.has(thread_id))
        {
            lock_.unlock();
            // Transfers are stored in WorkerImpl::transfers_, cleaned up when WorkerImpl is destroyed
            return;
        }
        const WorkerID worker_id = workers_[thread_id];
        WorkerImplPtr impl;
        if (!worker_list_.try_get_value(worker_id, impl))
        {
            lock_.unlock();
            return;
        }
        lock_.unlock();
        impl->on_web_message(p_data_sp, p_transfer_id);
    }

    void Worker::on_web_message_from_pthread(uintptr_t p_sender_pthread_id, jsb::impl::StackPosition p_data_sp, uint32_t p_transfer_id)
    {
        WorkerImplPtr worker;

        if (!Worker::web_try_get_worker_by_pthread_id(p_sender_pthread_id, worker))
        {
            return;
        }

        const std::shared_ptr<Environment> master = Environment::_access(worker->get_token());

        if (!master)
        {
            worker->discard_transfers(p_transfer_id);
            return;
        }

        v8::Isolate* isolate = master->get_isolate();
        v8::Isolate::Scope isolate_scope(isolate);
        v8::HandleScope handle_scope(isolate);
        const v8::Local<v8::Context> context = master->get_context();
        v8::Context::Scope context_scope(context);

        v8::Local<v8::Object> worker_obj;
        if (!master->try_get_object(worker->get_handle(), worker_obj))
        {
            worker->discard_transfers(p_transfer_id);
            return;
        }

        if (p_transfer_id == 0)
        {
            const uintptr_t env_token = reinterpret_cast<uintptr_t>(master.get());
            const impl::StackPosition worker_owner_sp = static_cast<impl::StackPosition>(worker_obj);
            if (!jsbi_RegisterWorkerOwner(p_sender_pthread_id, static_cast<jsb::impl::JSRuntime>(env_token), worker_owner_sp))
            {
                JSB_WORKER_LOG(Error, "failed to register worker owner for pthread %s", String::num_uint64(p_sender_pthread_id));
                return;
            }

            v8::Local<v8::Value> callback;
            if (!worker_obj->Get(context, jsb_name(master.get(), onready)).ToLocal(&callback) || !callback->IsFunction())
            {
                JSB_WORKER_LOG(Error, "onready is not a function");
                return;
            }

            const impl::TryCatch try_catch(isolate);
            const v8::MaybeLocal<v8::Value> rval = callback.As<v8::Function>()->Call(context, v8::Undefined(isolate), 0, nullptr);
            jsb_unused(rval);
            if (try_catch.has_caught())
            {
                JSB_WORKER_LOG(Error, "%s", BridgeHelper::get_exception(try_catch));
            }
            return;
        }

        v8::Local<v8::Value> callback;
        if (!worker_obj->Get(context, jsb_name(master.get(), onmessage)).ToLocal(&callback) || !callback->IsFunction())
        {
            worker->discard_transfers(p_transfer_id);
            return;
        }

        v8::Local<v8::Value> data = v8::Local<v8::Value>(v8::Data(isolate, p_data_sp));
        std::vector<TransferData> transfers = worker->take_transfers(p_transfer_id);

        if (!transfers.empty())
        {
            ThreadSafeForNodesScope node_safe_scope;
            for (const auto& transfer : transfers)
            {
                v8::HandleScope transfer_bind_scope(isolate);
                master->transfer_in_bind(context, transfer);
            }

            for (const auto& transfer : transfers)
            {
                v8::HandleScope transfer_state_scope(isolate);
                master->transfer_in_apply_state(transfer);
            }

            data = Worker::web_restore_transfer_markers(isolate, context, data, transfers);
        }

        const impl::TryCatch try_catch(isolate);

        v8::Local<v8::Value> argv[] = { data };
        const v8::MaybeLocal<v8::Value> rval = callback.As<v8::Function>()->Call(context, v8::Undefined(isolate), 1, argv);
        jsb_unused(rval);

        if (try_catch.has_caught())
        {
            JSB_WORKER_LOG(Error, "%s", BridgeHelper::get_exception(try_catch));
        }
    }

    bool Worker::web_queue_transfers(uintptr_t p_pthread_id, uint32_t p_transfer_id, std::vector<TransferData>&& p_transfers)
    {
        WorkerImplPtr worker;

        if (!Worker::web_try_get_worker_by_pthread_id(p_pthread_id, worker))
        {
            return false;
        }

        return worker->queue_transfers(p_transfer_id, std::move(p_transfers));
    }

    bool Worker::web_discard_transfers(uintptr_t p_pthread_id, uint32_t p_transfer_id)
    {
        WorkerImplPtr worker;

        if (!Worker::web_try_get_worker_by_pthread_id(p_pthread_id, worker))
        {
            return false;
        }

        return worker->discard_transfers(p_transfer_id);
    }

    bool Worker::web_get_or_add_transfer(uintptr_t p_pthread_id, uint32_t p_transfer_id, const Variant& p_variant, uint32_t& r_transfer_index, WebNativeTransferError& r_error)
    {
        r_error = WebNativeTransferError::None;
        WorkerImplPtr worker;

        if (!Worker::web_try_get_worker_by_pthread_id(p_pthread_id, worker))
        {
            r_error = WebNativeTransferError::TransferAppendFailed;
            return false;
        }

        return worker->get_or_add_transfer(p_transfer_id, p_variant, r_transfer_index, r_error);
    }

    bool Worker::web_try_get_worker_by_pthread_id(uintptr_t p_pthread_id, WorkerImplPtr& o_worker_impl)
    {
        lock_.lock();
        for (WorkerID id = worker_list_.get_first_index(); id; id = worker_list_.get_next_index(id))
        {
            WorkerImplPtr current;
            if (!worker_list_.try_get_value(id, current))
            {
                continue;
            }
            if ((uintptr_t) current->get_pthread_id() == p_pthread_id)
            {
                o_worker_impl = current;
                break;
            }
        }
        lock_.unlock();
        return (bool) o_worker_impl;
    }
#else
    void Worker::on_receive(WorkerID p_id, WorkerMessage&& p_message)
    {
        lock_.lock();
        WorkerImplPtr impl;
        if (!worker_list_.try_get_value(p_id, impl) || !impl->on_receive(std::move(p_message)))
        {
            JSB_WORKER_LOG(Error, "can't post message to a dead worker (%d)", p_id);
        }
        lock_.unlock();
    }
#endif

    bool Worker::try_get_worker(WorkerID p_id, WorkerImplPtr& o_worker_impl)
    {
        lock_.lock();
        WorkerImplPtr impl;
        if (!worker_list_.try_get_value(p_id, o_worker_impl))
        {
            o_worker_impl = nullptr;
        }
        lock_.unlock();
        return (bool) o_worker_impl;
    }

    bool Worker::request_termination(WorkerID p_id)
    {
        bool res = false;
        lock_.lock();
        WorkerImplPtr impl;
        if (worker_list_.try_get_value(p_id, impl))
        {
            res = true;
            impl->finish();
        }
        lock_.unlock();
        return res;
    }

    bool Worker::terminate(WorkerID p_id)
    {
        WorkerImplPtr impl;
        lock_.lock();
        const bool found = worker_list_.try_get_value(p_id, impl);
        if (found)
        {
            impl->finish();
        }
        lock_.unlock();

        if (!found)
        {
            return false;
        }

        const Thread::ID thread_id = impl->get_thread_id();
        jsb_check(thread_id != Thread::get_caller_id());
        impl->join();

        lock_.lock();
        const WorkerID* mapped_id = workers_.getptr(thread_id);
        if (mapped_id && *mapped_id == p_id)
        {
            workers_.erase(thread_id);
        }
        if (worker_list_.is_valid_index(p_id))
        {
            worker_list_.remove_at(p_id);
        }
        lock_.unlock();

        return true;
    }

    void Worker::finish()
    {
        bool has_remaining_workers = true;
        while (has_remaining_workers)
        {
            lock_.lock();
            const WorkerID id = worker_list_.get_first_index();
            has_remaining_workers = (bool) id;
            if (!has_remaining_workers)
            {
                lock_.unlock();
                continue;
            }
            jsb_check(worker_list_.is_valid_index(id));
            jsb_check(!worker_list_.is_empty());
            WorkerImplPtr impl;
            worker_list_.try_get_value(id, impl);
            lock_.unlock();

            if (impl)
            {
                impl->finish();
                impl->join();

                lock_.lock();
                if (worker_list_.is_valid_index(id))
                {
                    worker_list_.remove_at(id);
                }
                lock_.unlock();
            }
        }
    }

    void Worker::on_thread_enter()
    {
    }

    void Worker::on_thread_exit()
    {
        const Thread::ID p_thread_id = Thread::get_caller_id();

        lock_.lock();
        if (workers_.getptr(p_thread_id))
        {
            workers_.erase(p_thread_id);
        }
        lock_.unlock();
    }

    void Worker::finalizer(Environment*, void* pointer, FinalizationType /* p_finalize */)
    {
        Worker* self = (Worker*) pointer;
        if (Worker::is_valid(self->id_))
        {
            JSB_WORKER_LOG(Debug, "worker is not explicitly terminated before garbage collected");
            Worker::terminate(self->id_);
        }
        JSB_WORKER_LOG(VeryVerbose, "deleting Worker %d", self->id_);
        memdelete(self);
    }

    void Worker::constructor(const v8::FunctionCallbackInfo<v8::Value>& info)
    {
        v8::Isolate* isolate = info.GetIsolate();
        v8::HandleScope handle_scope(isolate);
        v8::Isolate::Scope isolate_scope(isolate);
        const v8::Local<v8::Object> self = info.This();
        const internal::Index32 class_id(info.Data().As<v8::Uint32>()->Value());

        const String path = impl::Helper::to_string(isolate, info[0]);
        if (path.is_empty())
        {
            jsb_throw(isolate, "bad param");
            return;
        }

        Environment* master = Environment::wrap(isolate);
        Worker* ptr = memnew(Worker);
        const NativeObjectID handle = master->bind_pointer(class_id, NativeClassType::Worker, ptr, self, 0);
        jsb_check(handle);
        ptr->id_ = Worker::create(master, path, handle);
    }

    // placeholder func for ontransfer/onmessage/onready/onerror of worker (in master)
    void Worker::_placeholder(const v8::FunctionCallbackInfo<v8::Value>& info) {}

    // master.postMessage
    void Worker::post_message(const v8::FunctionCallbackInfo<v8::Value>& info)
    {
        v8::Isolate* isolate = info.GetIsolate();
        v8::HandleScope handle_scope(isolate);
        v8::Isolate::Scope isolate_scope(isolate);
        Environment* from_env = Environment::wrap(isolate);
        from_env->check_internal_state();

        const v8::Local<v8::Object> self = info.This();

        if (!TypeConvert::is_object(self, NativeClassType::Worker))
        {
            jsb_throw(isolate, "bad this: postMessage must be called on a Worker instance");
            return;
        }

        const Worker* worker = (Worker*) self->GetAlignedPointerFromInternalField(IF_Pointer);

        if (!worker || !Worker::is_valid(worker->id_))
        {
            jsb_throw(isolate, "JSWorker is not running");
            return;
        }

#if JSB_WITH_WEB
        const v8::Local<v8::Context> context = isolate->GetCurrentContext();

        if (info.Length() == 0)
        {
            jsb_throw(isolate, "postMessage requires at least 1 argument");
            return;
        }

        internal::ReferentialVariantMap<TransferData> transfer_map;
        if (!parse_transfer_list(isolate, context, from_env, info, transfer_map))
        {
            return;
        }

        uint32_t transfer_id = s_next_transfer_id.increment();
        if (transfer_id == 0)
        {
            transfer_id = s_next_transfer_id.increment();
        }

        std::vector<TransferData> transfers_vec(transfer_map.size());
        for (const auto& entry : transfer_map)
        {
            transfers_vec[entry.value.transfer_index] = entry.value;
        }

        WorkerImplPtr impl;
        pthread_t pthread_id = 0;
        {
            lock_.lock();
            if (!worker_list_.try_get_value(worker->id_, impl))
            {
                lock_.unlock();
                jsb_throw(isolate, "postMessage: worker not found");
                return;
            }
            impl->queue_transfers(transfer_id, std::move(transfers_vec));
            pthread_id = impl->get_pthread_id();
            lock_.unlock();
        }

        if (!pthread_id)
        {
            if (impl)
            {
                impl->discard_transfers(transfer_id);
            }
            jsb_throw(isolate, "postMessage: failed to resolve worker pthread id");
            return;
        }

        const impl::StackPosition data_sp = static_cast<impl::StackPosition>(info[0]);
        const impl::StackPosition transfer_sp = info.Length() > 1 ? static_cast<impl::StackPosition>(info[1]) : jsb::impl::StackBase::Undefined;
        const uintptr_t env_token = reinterpret_cast<uintptr_t>(from_env);

        const int message_result = jsbi_PostMessage(
            (uintptr_t) pthread_id,
            static_cast<jsb::impl::JSRuntime>(env_token),
            data_sp,
            transfer_id,
            transfer_sp);

        if (message_result == kPostMessageFailed)
        {
            if (impl)
            {
                impl->discard_transfers(transfer_id);
            }
            jsb_throw(isolate, "postMessage: native web postMessage failed");
            return;
        }
        else if (message_result == kPostMessageNativeTransfersUnused)
        {
            if (impl)
            {
                impl->discard_transfers(transfer_id);
            }
        }

        // Mirror native worker transfer lifecycle: after a successful enqueue/post,
        // finalize transfer-out ownership in the source environment.
        for (const auto& entry : transfer_map)
        {
            from_env->finalize_transfer_out(entry.value);
        }
#else
        internal::ReferentialVariantMap<TransferData> transfer_map;
        const std::pair<uint8_t*, size_t> data = Worker::handle_post_message(info, transfer_map);

        if (data.first)
        {
            // Use indexed placement to ensure correct ordering by transfer_index
            std::vector<TransferData> transfers(transfer_map.size());
            for (const auto& transfer : transfer_map)
            {
                transfers[transfer.value.transfer_index] = transfer.value;
            }

            Worker::on_receive(worker->id_, WorkerMessage(Buffer::steal(data.first, data.second), std::move(transfers)));
        }
#endif
    }

    void Worker::terminate(const v8::FunctionCallbackInfo<v8::Value>& info)
    {
        v8::Isolate* isolate = info.GetIsolate();
        v8::HandleScope handle_scope(isolate);
        v8::Isolate::Scope isolate_scope(isolate);
        const v8::Local<v8::Object> self = info.This();
        if (!TypeConvert::is_object(self, NativeClassType::Worker))
        {
            jsb_throw(isolate, "bad this");
            return;
        }
        Worker* worker = (Worker*) self->GetAlignedPointerFromInternalField(IF_Pointer);
        if (!Worker::terminate(worker->id_))
        {
            JSB_WORKER_LOG(Warning, "can not terminate a dead worker");
        }
        else
        {
            worker->id_ = {};
        }
    }

    void Worker::register_(const v8::Local<v8::Context>& p_context, const v8::Local<v8::Object>& p_self)
    {
        Environment::wrap(p_context)->add_module_loader<JSWorkerModuleLoader>(JSB_WORKER_MODULE_NAME);
    }

    namespace
    {

#if JSB_WITH_QUICKJS
        jsb_force_inline void* quickjs_object_identity(const v8::Local<v8::Object>& obj)
        {
            const JSValue value = (JSValue) obj;
            return JS_VALUE_GET_TAG(value) < 0 ? JS_VALUE_GET_PTR(value) : nullptr;
        }
#endif

        struct VisitedEntry
        {
#if JSB_WITH_QUICKJS
            void* original_identity;
            v8::Global<v8::Value> replacement;

            VisitedEntry(v8::Isolate* isolate, const v8::Local<v8::Object>& original, const v8::Local<v8::Value>& replacement_value)
                : original_identity(quickjs_object_identity(original)), replacement(isolate, replacement_value)
            {
            }
#else
            v8::Global<v8::Object> original;
            v8::Global<v8::Value> replacement;

            VisitedEntry(v8::Isolate* isolate, const v8::Local<v8::Object>& original, const v8::Local<v8::Value>& replacement_value)
                : original(isolate, original), replacement(isolate, replacement_value)
            {
            }
#endif
        };

        jsb_force_inline bool visited_matches(const VisitedEntry& entry, const v8::Local<v8::Object>& obj)
        {
#if JSB_WITH_QUICKJS
            return entry.original_identity == quickjs_object_identity(obj);
#else
            return entry.original.Get(obj->GetIsolate()) == obj;
#endif
        }

        jsb_force_inline v8::Local<v8::Value> visited_replacement(v8::Isolate* isolate, const VisitedEntry& entry)
        {
#if JSB_WITH_QUICKJS
            return entry.replacement.Get(isolate);
#else
            return entry.replacement.Get(isolate);
#endif
        }

        jsb_force_inline bool is_array_buffer_object(const v8::Local<v8::Object>& obj)
        {
            return obj->IsArrayBuffer();
        }

        jsb_force_inline bool is_array_buffer_value(const v8::Local<v8::Value>& value)
        {
            return value->IsObject() && is_array_buffer_object(value.As<v8::Object>());
        }

#if JSB_WITH_WEB
        constexpr int kMaxTransferRestoreDepth = 64;

        bool web_try_get_transfer_marker_index(
            Environment* env,
            v8::Isolate* isolate,
            const v8::Local<v8::Context>& context,
            const v8::Local<v8::Object>& obj,
            uint32_t& r_index)
        {
            v8::Local<v8::Value> marker_type;
            if (obj->Get(context, jsb_name(env, __jsb_type)).ToLocal(&marker_type) && marker_type->IsString())
            {
                if (marker_type == jsb_name(env, transfer))
                {
                    v8::Local<v8::Value> marker_data;

                    if (obj->Get(context, jsb_name(env, data)).ToLocal(&marker_data)
                        && marker_data->IsUint32())
                    {
                        r_index = marker_data.As<v8::Uint32>()->Value();
                        return true;
                    }
                }
            }

            return false;
        }

        v8::Local<v8::Value> web_restore_transfer_markers_recursive(
            Environment* env,
            v8::Isolate* isolate,
            const v8::Local<v8::Context>& context,
            const v8::Local<v8::Value>& value,
            const std::vector<TransferData>& transfers,
            std::vector<VisitedEntry>& visited,
            int depth)
        {
            if (!value->IsObject())
            {
                return value;
            }

            if (depth > kMaxTransferRestoreDepth)
            {
                JSB_WORKER_LOG(Error, "worker message restore: max recursion depth exceeded");
                return value;
            }

            const v8::Local<v8::Object> obj = value.As<v8::Object>();

            for (const auto& entry : visited)
            {
                if (visited_matches(entry, obj))
                {
                    return visited_replacement(isolate, entry);
                }
            }

            uint32_t idx = 0;
            if (web_try_get_transfer_marker_index(env, isolate, context, obj, idx))
            {
                if (idx < (uint32_t) transfers.size())
                {
                    const TransferData& transfer_data = transfers[idx];
                    const Variant& transfer_variant = transfer_data.variant;
                    v8::Local<v8::Value> restored;
                    if (TypeConvert::gd_var_to_js(isolate, context, transfer_variant, restored))
                    {
                        return restored;
                    }
                }

                JSB_WORKER_LOG(Error, "worker message restore: failed to restore transfer %d", idx);
                return value;
            }

            if (obj->InternalFieldCount() > 0 || obj->IsFunction() || is_array_buffer_object(obj))
            {
                return value;
            }

            if (obj->IsMap())
            {
                const v8::Local<v8::Map> map = obj.As<v8::Map>();
                const v8::Local<v8::Array> entries = map->AsArray();
                const uint32_t len = entries->Length();

                v8::Local<v8::Map> new_map = v8::Map::New(isolate);
                visited.emplace_back(isolate, obj, new_map);

                for (uint32_t i = 0; i + 1 < len; i += 2)
                {
                    v8::HandleScope loop_scope(isolate);

                    v8::Local<v8::Value> key;
                    v8::Local<v8::Value> val;

                    if (!entries->Get(context, i).ToLocal(&key) || !entries->Get(context, i + 1).ToLocal(&val))
                    {
                        continue;
                    }

                    v8::Local<v8::Value> restored_key = web_restore_transfer_markers_recursive(env, isolate, context, key, transfers, visited, depth + 1);
                    v8::Local<v8::Value> restored_val = web_restore_transfer_markers_recursive(env, isolate, context, val, transfers, visited, depth + 1);
                    new_map->Set(context, restored_key, restored_val);
                }

                return new_map;
            }

            if (obj->IsSet())
            {
                const v8::Local<v8::Set> set = obj.As<v8::Set>();
                const v8::Local<v8::Array> values = set->AsArray();
                const uint32_t len = values->Length();

                v8::Local<v8::Set> new_set = v8::Set::New(isolate);
                visited.emplace_back(isolate, obj, new_set);

                for (uint32_t i = 0; i < len; i++)
                {
                    v8::HandleScope loop_scope(isolate);

                    v8::Local<v8::Value> val;
                    if (!values->Get(context, i).ToLocal(&val))
                    {
                        continue;
                    }

                    v8::Local<v8::Value> restored = web_restore_transfer_markers_recursive(
                        env, isolate, context, val, transfers, visited, depth + 1);
                    new_set->Add(context, restored);
                }

                return new_set;
            }

            if (obj->IsArray())
            {
                visited.emplace_back(isolate, obj, obj);

                const v8::Local<v8::Array> arr = obj.As<v8::Array>();
                const uint32_t len = arr->Length();

                for (uint32_t i = 0; i < len; i++)
                {
                    v8::HandleScope loop_scope(isolate);

                    v8::Local<v8::Value> elem;
                    if (!arr->Get(context, i).ToLocal(&elem) || !elem->IsObject())
                    {
                        continue;
                    }

                    v8::Local<v8::Value> restored = web_restore_transfer_markers_recursive(
                        env, isolate, context, elem, transfers, visited, depth + 1);

                    if (!(restored == elem))
                    {
                        arr->Set(context, i, restored).Check();
                    }
                }

                return obj;
            }

            visited.emplace_back(isolate, obj, obj);

            v8::MaybeLocal<v8::Array> maybe_keys = obj->GetOwnPropertyNames(
                context,
                v8::ALL_PROPERTIES,
                v8::KeyConversionMode::kNoNumbers);

            if (maybe_keys.IsEmpty())
            {
                return value;
            }

            v8::Local<v8::Array> keys = maybe_keys.ToLocalChecked();
            const uint32_t key_count = keys->Length();
            for (uint32_t i = 0; i < key_count; i++)
            {
                v8::HandleScope loop_scope(isolate);
                v8::Local<v8::Value> key;
                v8::Local<v8::Value> val;

                if (!keys->Get(context, i).ToLocal(&key)
                    || !obj->Get(context, key).ToLocal(&val)
                    || !val->IsObject())
                {
                    continue;
                }

                v8::Local<v8::Value> restored = web_restore_transfer_markers_recursive(
                    env, isolate, context, val, transfers, visited, depth + 1);

                if (!(restored == val))
                {
                    obj->Set(context, key, restored).Check();
                }
            }

            return obj;
        }

        v8::Local<v8::Value> web_restore_transfer_markers_impl(
            Environment* env,
            v8::Isolate* isolate,
            const v8::Local<v8::Context>& context,
            const v8::Local<v8::Value>& value,
            const std::vector<TransferData>& transfers)
        {
            if (transfers.empty())
            {
                return value;
            }

            std::vector<VisitedEntry> visited;
            return web_restore_transfer_markers_recursive(env, isolate, context, value, transfers, visited, 0);
        }
#endif
    }

    bool Worker::parse_transfer_list(
        v8::Isolate* isolate,
        const v8::Local<v8::Context>& context,
        Environment* from_env,
        const v8::FunctionCallbackInfo<v8::Value>& info,
        internal::ReferentialVariantMap<TransferData>& transfers)
    {
        std::vector<Variant> explicit_node_transfers;

        if (info.Length() <= 1 || info[1]->IsUndefined())
        {
            return true; // no transfer list, not an error
        }

        v8::Local<v8::Value> transfer_arg = info[1];

        if (!transfer_arg->IsArray() && !transfer_arg->IsObject())
        {
            jsb_throw(isolate, "transfer list must be an array");
            return false;
        }

        if (transfer_arg->IsArray())
        {
            v8::Local<v8::Array> transfer_array = transfer_arg.As<v8::Array>();

            for (uint32_t i = 0, len = transfer_array->Length(); i < len; i++)
            {
                v8::HandleScope transfer_item_scope(isolate);
                v8::Local<v8::Value> item = transfer_array->Get(context, i).ToLocalChecked();

                if (!item->IsObject())
                {
                    // JS primitive, no underlying Variant exists to transfer. Since JS primitives are automatically
                    // coerced to variants, it's more consistent if we permit (but ignore) them.
                    continue;
                }

                Variant variant;

                if (!TypeConvert::js_to_gd_var(isolate, context, item.As<v8::Object>(), variant))
                {
                    jsb_throw(isolate, "transfer list must contain Godot object/variant types only");
                    return false;
                }

                insert_transfer_variant(from_env, transfers, variant);
                explicit_node_transfers.push_back(variant);
            }
        }
        else
        {
            Variant transfer_var;

            if (!TypeConvert::js_to_gd_var(isolate, context, transfer_arg.As<v8::Object>(), Variant::Type::ARRAY, transfer_var))
            {
                jsb_throw(isolate, "transfer list must be an array");
                return false;
            }

            if (!transfer_var.is_array())
            {
                jsb_throw(isolate, "transfer list must be an array");
                return false;
            }

            Array transfer_arr = transfer_var;

            for (int i = 0, size = transfer_arr.size(); i < size; i++)
            {
                Variant& variant = transfer_arr[i];
                insert_transfer_variant(from_env, transfers, variant);
                explicit_node_transfers.push_back(variant);
            }
        }

        for (const Variant& explicit_transfer : explicit_node_transfers)
        {
            if (explicit_transfer.get_type() == Variant::OBJECT)
            {
                Object* object = explicit_transfer;

                if (const Node* node = Object::cast_to<Node>(object))
                {
                    append_node_descendants_for_transfer(from_env, transfers, node);
                }
            }
        }

        return true;
    }

#if JSB_WITH_WEB
    v8::Local<v8::Value> Worker::web_restore_transfer_markers(
        v8::Isolate* isolate,
        const v8::Local<v8::Context>& context,
        const v8::Local<v8::Value>& value,
        const std::vector<TransferData>& transfers)
    {
        Environment* env = Environment::wrap(isolate);
        return web_restore_transfer_markers_impl(env, isolate, context, value, transfers);
    }
#else
    std::pair<uint8_t*, size_t> Worker::handle_post_message(const v8::FunctionCallbackInfo<v8::Value>& info, internal::ReferentialVariantMap<TransferData>& transfers)
    {
        v8::Isolate* isolate = info.GetIsolate();
        const v8::Local<v8::Context> context = isolate->GetCurrentContext();
        Environment* from_env = Environment::wrap(isolate);
        from_env->check_internal_state();

        if (info.Length() == 0)
        {
            jsb_throw(isolate, "postMessage requires at least 1 argument");
            return {nullptr, 0};
        }

        if (!parse_transfer_list(isolate, context, from_env, info, transfers))
        {
            return {nullptr, 0};
        }

        const impl::TryCatch try_catch(isolate);

        Serialization::VariantSerializerDelegate delegate(from_env, transfers);
        v8::ValueSerializer serializer(isolate, &delegate);
        delegate.SetSerializer(&serializer);
        serializer.WriteHeader();
        v8::Maybe<bool> write_result = serializer.WriteValue(context, info[0]);

        if (write_result.IsNothing())
        {
            if (try_catch.has_caught())
            {
                JSB_WORKER_LOG(Error, "serializer.WriteValue failed: %s", BridgeHelper::get_exception(try_catch));
            }
            else
            {
                JSB_WORKER_LOG(Error, "serializer.WriteValue returned empty result");
            }
            return {nullptr, 0};
        }

        for (const auto& entry : transfers)
        {
            from_env->finalize_transfer_out(entry.value);
        }

        return serializer.Release();
    }
#endif
}
