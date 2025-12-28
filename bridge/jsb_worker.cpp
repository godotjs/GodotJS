#include "jsb_worker.h"
#include "jsb_buffer.h"
#include "jsb_environment.h"
#include "jsb_type_convert.h"
#include "../internal/jsb_sarray.h"
#include "../internal/jsb_thread_util.h"
#include "../internal/jsb_double_buffered.h"

#if !JSB_WITH_WEB && !JSB_WITH_JAVASCRIPTCORE
#define JSB_WORKER_LOG(Severity, Format, ...) JSB_LOG_IMPL(JSWorker, Severity, Format, ##__VA_ARGS__)
#define JSB_WORKER_MODULE_NAME "godot.worker"

namespace jsb
{
    class WorkerImpl;

    class WorkerImpl
    {
        WorkerID id_ = {};
        void* token_ = nullptr;
        String path_;

        SafeFlag interrupt_requested_ = SafeFlag(false);
        Thread thread_;
        // ::Semaphore finished_;

        // object id of this worker object in the master environment
        NativeObjectID handle_;
        std::shared_ptr<Environment> env_;
        internal::DoubleBuffered<WorkerMessage> inbox_;

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

        static void _run(void* data)
        {
            WorkerImpl* impl = (WorkerImpl*) data;

            internal::ThreadUtil::set_name(jsb_format("JSWorker_%d", *impl->id_));
            const OS* os = OS::get_singleton();
            uint64_t last_ticks = os->get_ticks_msec();

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
                    exports->Set(context, impl::Helper::new_string(isolate, "JSWorkerParent"), context_obj).Check();
                    context_obj_handle.Reset(isolate, context_obj);

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

                    while (true)
                    {
                        // handle messages from master
                        {
                            std::vector<WorkerMessage>& messages = impl->inbox_.swap();
                            if (!messages.empty())
                            {
                                v8::Isolate* isolate = env->get_isolate();
                                v8::Isolate::Scope isolate_scope(isolate);
                                v8::HandleScope handle_scope(isolate);
                                const v8::Local<v8::Context> context = env->get_context();
                                v8::Context::Scope context_scope(context);
                                const v8::Local<v8::Object> context_obj = context_obj_handle.Get(isolate);

                                for (const WorkerMessage& message : messages)
                                {
                                    if (impl->interrupt_requested_.is_set()) break;
                                    v8::HandleScope message_handle_scope(isolate);
                                    impl->_on_message(env, context, context_obj, message);
                                }
                                messages.clear();
                            }
                        }

                        if (impl->interrupt_requested_.is_set()) break;
                        const uint64_t ticks = os->get_ticks_msec();
                        env->update(ticks - last_ticks);
                        last_ticks = ticks;
                        os->delay_usec(10 * 1000);
                    }
                }
                context_obj_handle.Reset();

                impl->interrupt_requested_.set();
                impl->env_->dispose();
                impl->env_.reset();
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

        bool on_receive(WorkerMessage&& p_message)
        {
            if (interrupt_requested_.is_set())
            {
                return false;
            }
            inbox_.add(std::move(p_message));
            return true;
        }

    private:
        // (worker) handle message from master
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

                for (const auto& transfer : p_message.get_transfers())
                {
                    p_env->transfer_in(p_context, transfer);
                }
            }

#if JSB_WITH_V8
            Serialization::VariantDeserializerDelegate delegate(worker_env, p_message.get_transfers());
            v8::ValueDeserializer deserializer(isolate, p_message.get_data().ptr(), p_message.get_data().size(), &delegate);
            delegate.SetSerializer(&deserializer);
#else
            v8::ValueDeserializer deserializer(isolate, p_message.get_data().ptr(), p_message.get_data().size());
#endif

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

        void _on_ready()
        {
            v8::Isolate* isolate = env_->get_isolate();
            v8::HandleScope handle_scope(isolate);
            v8::Isolate::Scope isolate_scope(isolate);

            NativeObjectID handle;
            void* token_ptr = nullptr;
            if (!Worker::try_get_worker(get_id(), handle, token_ptr))
            {
                jsb_throw(isolate, "invalid worker id");
                return;
            }

            jsb_check(handle);
            const std::shared_ptr<Environment> master = Environment::_access(token_ptr);
            if (!master)
            {
                jsb_throw(isolate, "invalid environment");
                return;
            }

            master->post_message(Message(Message::TYPE_READY, handle));
        }

        // worker.close()
        static void worker_close(const v8::FunctionCallbackInfo<v8::Value>& info)
        {
            v8::Isolate* isolate = info.GetIsolate();
            v8::HandleScope handle_scope(isolate);
            v8::Isolate::Scope isolate_scope(isolate);
            const WorkerID worker_id = (WorkerID) info.Data().As<v8::Uint32>()->Value();
            Worker::terminate(worker_id);
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

            NativeObjectID handle;
            void* token_ptr = nullptr;
            if (!Worker::try_get_worker(worker_id, handle, token_ptr))
            {
                jsb_throw(isolate, "invalid worker id");
                return;
            }

            jsb_check(handle);
            const std::shared_ptr<Environment> master = Environment::_access(token_ptr);
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
            Environment::transfer_to_host(env, master.get(), handle, target);
        }

        // worker -> master (run in worker env)
        static void worker_post_message(const v8::FunctionCallbackInfo<v8::Value>& info)
        {
            v8::Isolate* isolate = info.GetIsolate();
            v8::HandleScope handle_scope(isolate);
            v8::Isolate::Scope isolate_scope(isolate);
            const v8::Local<v8::Context> context = isolate->GetCurrentContext();
            const WorkerID worker_id = (WorkerID) info.Data().As<v8::Uint32>()->Value();

            NativeObjectID handle;
            void* token_ptr = nullptr;
            if (!Worker::try_get_worker(worker_id, handle, token_ptr))
            {
                jsb_throw(isolate, "invalid worker id");
                return;
            }

            jsb_check(handle);
            const std::shared_ptr<Environment> master = Environment::_access(token_ptr);
            if (!master)
            {
                jsb_throw(isolate, "invalid environment");
                return;
            }

            internal::ReferentialVariantMap<TransferData> transfer_map;
            const std::pair<uint8_t*, size_t> data = Worker::handle_post_message(info, transfer_map);

            if (data.first)
            {
                std::vector<TransferData> transfers;
                transfers.reserve(transfer_map.size());

                for (const auto& transfer : transfer_map)
                {
                    transfers.push_back(transfer.value);
                }

                master->post_message(Message(Message::TYPE_MESSAGE, handle, Buffer::steal(data.first, data.second), std::move(transfers)));
            }
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

    bool Worker::try_get_worker(WorkerID p_id, NativeObjectID& o_handle, void*& o_token_ptr)
    {
        lock_.lock();
        WorkerImplPtr impl;
        if (worker_list_.try_get_value(p_id, impl))
        {
            o_handle = impl->get_handle();
            o_token_ptr = impl->get_token();
        }
        else
        {
            o_handle = {};
            o_token_ptr = nullptr;
        }
        lock_.unlock();
        return (bool) o_handle;
    }

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

    bool Worker::terminate(WorkerID p_id)
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

    void Worker::finish()
    {
        while (true)
        {
            lock_.lock();
            const WorkerID id = worker_list_.get_first_index();
            if (!id)
            {
                lock_.unlock();
                break;
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
        if (const WorkerID* worker_id = workers_.getptr(p_thread_id))
        {
            worker_list_.remove_at(*worker_id);
            jsb_check(!worker_list_.is_valid_index(*worker_id));
            workers_.erase(p_thread_id);
        }
        lock_.unlock();

        // on_thread_exit is the only way which is safe to delete all WorkerImpl objects in any cases,
        // the side effect is Error prompt in ~Thread().
        //TODO the error printed by Thread::~Thread() is not a real ERROR
    }

    void Worker::finalizer(Environment*, void* pointer, FinalizationType /* p_finalize */)
    {
        Worker* self = (Worker*) pointer;
        if (Worker::is_valid(self->id_))
        {
            JSB_WORKER_LOG(Debug, "worker is not explicitly terminated before garbage collected");
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

        internal::ReferentialVariantMap<TransferData> transfer_map;
        const std::pair<uint8_t*, size_t> data = Worker::handle_post_message(info, transfer_map);

        if (data.first)
        {
            std::vector<TransferData> transfers;
            transfers.reserve(transfer_map.size());

            for (const auto& transfer : transfer_map)
            {
                transfers.push_back(transfer.value);
            }

            Worker::on_receive(worker->id_, WorkerMessage(Buffer::steal(data.first, data.second), std::move(transfers)));
        }
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
        const Worker* worker = (Worker*) self->GetAlignedPointerFromInternalField(IF_Pointer);
        if (!Worker::terminate(worker->id_))
        {
            JSB_WORKER_LOG(Warning, "can not terminate a dead worker");
        }
    }

    void Worker::register_(const v8::Local<v8::Context>& p_context, const v8::Local<v8::Object>& p_self)
    {
        Environment::wrap(p_context)->add_module_loader<JSWorkerModuleLoader>(JSB_WORKER_MODULE_NAME);
    }

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

        if (info.Length() > 1 && !info[1]->IsUndefined())
        {
            v8::Local<v8::Value> transfer_arg = info[1];

            if (!transfer_arg->IsArray() && !transfer_arg->IsObject())
            {
                jsb_throw(isolate, "transfer list must be an array");
                return {nullptr, 0};
            }

            if (transfer_arg->IsArray())
            {
                v8::Local<v8::Array> transfer_array = transfer_arg.As<v8::Array>();

                for (uint32_t i = 0, len = transfer_array->Length(); i < len; i++)
                {
                    v8::Local<v8::Value> item = transfer_array->Get(context, i).ToLocalChecked();

                    if (!item->IsObject())
                    {
                        // JS primitive, no underling Variant exists to transfer. Since JS primitives are automatically
                        // coerced to variants, it's more consistent if we permit (but ignore) them.
                        continue;
                    }

                    Variant variant;

                    if (!TypeConvert::js_to_gd_var(isolate, context, item.As<v8::Object>(), variant))
                    {
                        jsb_throw(isolate, "transfer list must contain Godot object/variant types only");
                        return {nullptr, 0};
                    }

                    TransferData transfer_data;
                    from_env->prepare_transfer_out(NativeObjectID::none(), transfers.size(), variant, transfer_data);
                    transfers.insert(variant, transfer_data);
                }
            }
            else
            {
                Variant transfer_var;

                if (!TypeConvert::js_to_gd_var(isolate, context, transfer_arg.As<v8::Object>(), Variant::Type::OBJECT, transfer_var))
                {
                    jsb_throw(isolate, "transfer list must be an array");
                    return std::pair<uint8_t*, size_t>();
                }

                if (!transfer_var.is_array())
                {
                    jsb_throw(isolate, "transfer list must be an array");
                    return std::pair<uint8_t*, size_t>();
                }

                Array transfer_arr = transfer_var;

                for (int i = 0, size = transfer_arr.size(); i < size; i++)
                {
                    Variant& variant = transfer_arr[i];
                    TransferData transfer_data;
                    from_env->prepare_transfer_out(NativeObjectID::none(), i, variant, transfer_data);
                    transfers.insert(variant, transfer_data);
                }
            }
        }

        Vector<TransferData> transferred;

        // TODO: Transfer support non-V8.
#if JSB_WITH_V8
        Serialization::VariantSerializerDelegate delegate(from_env, transfers);
        v8::ValueSerializer serializer(isolate, &delegate);
        delegate.SetSerializer(&serializer);
#else
        v8::ValueSerializer serializer(isolate);
#endif

        serializer.WriteHeader();
        v8::Maybe<bool> write_result = serializer.WriteValue(context, info[0]);

        if (write_result.IsNothing())
        {
            return {nullptr, 0};
        }

        for (const auto& entry : transfers)
        {
            from_env->finalize_transfer_out(entry.value);
        }

        return serializer.Release();
    }
}

#endif
