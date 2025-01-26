#include "jsb_worker.h"
#include "jsb_buffer.h"
#include "jsb_environment.h"
#include "../internal/jsb_sarray.h"
#include "../internal/jsb_double_buffered.h"

#if !JSB_WITH_WEB && !JSB_WITH_JAVASCRIPTCORE
#define JSB_WORKER_LOG(Severity, Format, ...) JSB_LOG_IMPL(JSWorker, Severity, Format, ##__VA_ARGS__)

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
        ::Semaphore startup_;

        // object id of this worker object in the master environment
        NativeObjectID handle_;
        std::shared_ptr<Environment> env_;
        internal::DoubleBuffered<Buffer> inbox_;

    public:
        WorkerImpl(Environment* p_master, const String& p_path, NativeObjectID p_handle)
        : token_(p_master), path_(p_path), handle_(p_handle)
        {
        }

        jsb_force_inline WorkerID get_id() const { return id_; }

        jsb_force_inline NativeObjectID get_handle() const { return handle_; }

        jsb_force_inline void* get_token() const { return token_; }

        jsb_force_inline Thread::ID get_thread_id() const { return thread_.get_id(); }

        static void _run(void* data)
        {
            WorkerImpl* impl = (WorkerImpl*) data;

            impl->startup_.wait();
            const OS* os = OS::get_singleton();
            uint64_t last_ticks = os->get_ticks_msec();

            jsb_check(impl->env_);
            const std::shared_ptr<Environment> env = impl->env_;
            env->init();
            {
                // setup global 'postMessage', 'onmessage' for worker
                v8::Isolate* isolate = env->get_isolate();
                v8::Isolate::Scope isolate_scope(isolate);
                v8::HandleScope handle_scope(isolate);
                const v8::Local<v8::Context> context = env->get_context();
                const v8::Local<v8::Object> global = context->Global();

                impl::Helper::set_as_interruptible(isolate);
                global->Set(context,
                    jsb_name(env, postMessage),
                    v8::Function::New(context, &worker_post_message, v8::Uint32::NewFromUnsigned(isolate, *impl->id_)).ToLocalChecked()
                    )
                .Check();
                global->Set(context,
                    jsb_name(env, close),
                    v8::Function::New(context, &worker_close, v8::Uint32::NewFromUnsigned(isolate, *impl->id_)).ToLocalChecked()
                    )
                .Check();
                global->Set(context,
                    jsb_name(env, onmessage),
                    v8::Null(isolate)
                    )
                .Check();
            }

            if (env->load(impl->path_) == OK)
            {
                while (true)
                {
                    // handle messages from master
                    {
                        std::vector<Buffer>& messages = impl->inbox_.swap();
                        if (!messages.empty())
                        {
                            v8::Isolate* isolate = env->get_isolate();
                            v8::Isolate::Scope isolate_scope(isolate);
                            v8::HandleScope handle_scope(isolate);
                            const v8::Local<v8::Context> context = env->get_context();

                            for (const Buffer& message : messages)
                            {
                                if (impl->interrupt_requested_.is_set()) break;
                                impl->_on_message(context, message);
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

            impl->interrupt_requested_.set();
            impl->env_->dispose();
            impl->env_.reset();
            JSB_WORKER_LOG(Verbose, "thread.run exited %d", impl->id_);
        }

        void init(WorkerID p_id)
        {
            jsb_check(!id_);
            jsb_check(p_id);
            id_ = p_id;
            Thread::Settings settings;
            settings.priority = Thread::PRIORITY_LOW;
            const Thread::ID thread_id = thread_.start(_run, this,  settings);

            jsb::Environment::CreateParams params;
            params.initial_class_slots = JSB_WORKER_INITIAL_CLASS_SLOTS;
            params.initial_object_slots = JSB_WORKER_INITIAL_OBJECT_SLOTS;
            params.initial_script_slots = JSB_WORKER_INITIAL_SCRIPT_SLOTS;
            params.deletion_queue_size = JSB_WORKER_VARIANT_DELETION_QUEUE_SIZE - 1;
            params.thread_id = thread_id;

            env_ = std::make_shared<Environment>(params);
            startup_.post();
        }

        void join()
        {
            jsb_check(interrupt_requested_.is_set());
            if (thread_.is_started())
            {
                JSB_WORKER_LOG(Verbose, "wait to finish %d", id_);
                thread_.wait_to_finish();
                JSB_WORKER_LOG(Verbose, "finished %d", id_);
            }
        }

        void finish()
        {
            //TODO race condition issue?
            if (interrupt_requested_.is_set())
            {
                return;
            }

            jsb_check(env_);
            interrupt_requested_.set();

            v8::Isolate* isolate = env_->get_isolate();
            if (isolate->IsExecutionTerminating())
            {
                JSB_WORKER_LOG(Log, "worker is terminating");
                return;
            }
            isolate->TerminateExecution();
        }

        bool on_receive(Buffer&& p_buffer)
        {
            if (interrupt_requested_.is_set())
            {
                return false;
            }
            inbox_.add(std::move(p_buffer));
            return true;
        }

    private:
        void _on_message(const v8::Local<v8::Context>& p_context, const Buffer& p_message)
        {
            const v8::Local<v8::Object> obj = p_context->Global();
            v8::Local<v8::Value> callback;
            if (!obj->Get(p_context, jsb_name(env_, onmessage)).ToLocal(&callback) || !callback->IsFunction())
            {
                JSB_WORKER_LOG(Error, "onmessage is not a function");
                return;
            }
            v8::Isolate* isolate = env_->get_isolate();
            v8::ValueDeserializer deserializer(isolate, p_message.ptr(), p_message.size());
            bool ok;
            if (!deserializer.ReadHeader(p_context).To(&ok) || !ok)
            {
                JSB_WORKER_LOG(Error, "failed to parse message header");
                return;
            }
            v8::Local<v8::Value> value;
            if (!deserializer.ReadValue(p_context).ToLocal(&value))
            {
                JSB_WORKER_LOG(Error, "failed to parse message value");
                return;
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

            v8::ValueSerializer serializer(isolate);
            serializer.WriteHeader();
            serializer.WriteValue(context, info[0]);
            const std::pair<uint8_t*, size_t> data = serializer.Release();
            master->post_message(Message(handle, Message::TYPE_MESSAGE, Buffer::steal(data.first, data.second)));
        }

        // dispatch message to worker.onmessage
        void on_message(Environment* p_env, const Buffer& p_buffer)
        {
            v8::Isolate* isolate = p_env->get_isolate();
            v8::HandleScope handle_scope(isolate);
            const v8::Local<v8::Context> context = p_env->get_context();

            const v8::Local<v8::Object> global = context->Global();
            v8::Local<v8::Value> onmessage;
            if (!global->Get(context, jsb_name(p_env, onmessage)).ToLocal(&onmessage)
                || !onmessage->IsFunction())
            {
                JSB_WORKER_LOG(Error, "no 'onmessage'");
                return;
            }

            v8::ValueDeserializer deserializer(isolate, p_buffer.ptr(), p_buffer.size());
            bool ok;
            if (!deserializer.ReadHeader(context).To(&ok) || !ok)
            {
                JSB_WORKER_LOG(Error, "failed to read message header");
                return;
            }
            v8::Local<v8::Value> result;
            if (!deserializer.ReadValue(context).ToLocal(&result))
            {
                JSB_WORKER_LOG(Error, "failed to read message value");
                return;
            }

            const impl::TryCatch try_catch(isolate);
            const v8::MaybeLocal<v8::Value> rval = onmessage.As<v8::Function>()
                ->Call(context, v8::Undefined(isolate), 1, &result);
            jsb_unused(rval);
            if (try_catch.has_caught())
            {
                JSB_WORKER_LOG(Error, "%s", BridgeHelper::get_exception(try_catch));
            }
        }
    };

    BinaryMutex Worker::lock_;
    internal::SArray<WorkerImplPtr, WorkerID> Worker::worker_list_;
    HashMap<Thread::ID, WorkerID> Worker::workers_;

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

    void Worker::on_receive(WorkerID p_id, Buffer&& p_buffer)
    {
        lock_.lock();
        WorkerImplPtr impl;
        if (!worker_list_.try_get_value(p_id, impl) || !impl->on_receive(std::move(p_buffer)))
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
            WorkerImplPtr impl;
            lock_.lock();
            if (const WorkerID id = worker_list_.get_first_index())
            {
                impl = worker_list_.get_value(id);
                worker_list_.remove_at(id);
            }
            lock_.unlock();
            if (!impl) break;

            impl->finish();
            impl->join();
        }
    }

    void Worker::on_thread_enter(Thread::ID p_thread_id)
    {
    }

    void Worker::on_thread_exit(Thread::ID p_thread_id)
    {
        lock_.lock();
        if (const WorkerID* worker_id = workers_.getptr(p_thread_id))
        {
            workers_.erase(p_thread_id);
            worker_list_.remove_at(*worker_id);
        }
        lock_.unlock();

        // on_thread_exit is the only way which is safe to delete all WorkerImpl objects in any cases,
        // the side effect is Error prompt in ~Thread().
        //TODO the error printed by Thread::~Thread() is not a real ERROR
    }

    void Worker::finalizer(Environment*, void* pointer, bool /* p_persistent */)
    {
        Worker* self = (Worker*) pointer;
        if (Worker::is_valid(self->id_))
        {
            JSB_WORKER_LOG(Warning, "worker is not explicitly terminated before garbage collected");
        }
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
        const NativeObjectID handle = master->bind_pointer(class_id, ptr, self, EBindingPolicy::Managed);
        jsb_check(handle);
        ptr->id_ = Worker::create(master, path, handle);
    }

    // master.onmessage
    void Worker::onmessage(const v8::FunctionCallbackInfo<v8::Value>& info)
    {
    }

    // master.postMessage
    void Worker::post_message(const v8::FunctionCallbackInfo<v8::Value>& info)
    {
        v8::Isolate* isolate = info.GetIsolate();
        v8::HandleScope handle_scope(isolate);
        v8::Isolate::Scope isolate_scope(isolate);
        const v8::Local<v8::Context> context = isolate->GetCurrentContext();
        const v8::Local<v8::Object> self = info.This();
        Environment::wrap(isolate)->check_internal_state();
        jsb_check(self->InternalFieldCount() == IF_ObjectFieldCount);
        const Worker* worker = (Worker*) self->GetAlignedPointerFromInternalField(IF_Pointer);

        v8::ValueSerializer serializer(isolate);
        serializer.WriteHeader();
        serializer.WriteValue(context, info[0]);
        const std::pair<uint8_t*, size_t> data = serializer.Release();
        Worker::on_receive(worker->id_, Buffer::steal(data.first, data.second));
    }

    void Worker::terminate(const v8::FunctionCallbackInfo<v8::Value>& info)
    {
        v8::Isolate* isolate = info.GetIsolate();
        v8::HandleScope handle_scope(isolate);
        v8::Isolate::Scope isolate_scope(isolate);
        const v8::Local<v8::Object> self = info.This();
        jsb_check(self->InternalFieldCount() == IF_ObjectFieldCount);
        const Worker* worker = (Worker*) self->GetAlignedPointerFromInternalField(IF_Pointer);
        if (!Worker::terminate(worker->id_))
        {
            JSB_WORKER_LOG(Warning, "can not terminate a dead worker");
        }
    }

    void Worker::register_(const v8::Local<v8::Context>& p_context, const v8::Local<v8::Object>& p_self)
    {
        Environment* env = Environment::wrap(p_context);
        v8::Isolate* isolate = p_context->GetIsolate();
        const StringName class_name = jsb_string_name(Worker);
        const NativeClassID class_id = env->add_native_class(NativeClassType::Custom, class_name);
        impl::ClassBuilder class_builder = impl::ClassBuilder::New<IF_ObjectFieldCount>(isolate, class_name, &constructor, *class_id);

        class_builder.Instance().Method("postMessage", &post_message);
        class_builder.Instance().Method("onmessage", &onmessage);
        class_builder.Instance().Method("terminate", &terminate);

        const NativeClassInfoPtr class_info = env->get_native_class(class_id);
        class_info->finalizer = &finalizer;
        class_info->clazz = class_builder.Build();
        jsb_check(!class_info->clazz.IsEmpty());
        jsb_check(class_info->name == class_name);
        jsb_check(!class_info->clazz.IsEmpty());
        p_self->Set(p_context, jsb_name(env, Worker), class_info->clazz.Get(isolate));
    }

}

#endif
