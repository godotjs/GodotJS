#ifndef GODOTJS_WORKER_H
#define GODOTJS_WORKER_H
#include "jsb_bridge_pch.h"
#include "jsb_buffer.h"

namespace jsb
{
    typedef internal::Index32 WorkerID;
    class Environment;
    class WorkerImpl;
    typedef std::shared_ptr<WorkerImpl> WorkerImplPtr;

    class Worker
    {
    private:
        friend class WorkerImpl;

        WorkerID id_ = {};

        static BinaryMutex lock_;
        static internal::SArray<WorkerImplPtr, WorkerID> worker_list_;
        static HashMap<Thread::ID, WorkerID> workers_;

    public:
        static void register_(const v8::Local<v8::Context>& p_context, const v8::Local<v8::Object>& p_self);

        // release all workers
        static void finish();

        static void on_thread_enter(Thread::ID p_thread_id);
        static void on_thread_exit(Thread::ID p_thread_id);

    private:
        static void finalizer(Environment*, void* pointer, bool /* p_persistent */);
        static void constructor(const v8::FunctionCallbackInfo<v8::Value>& info);

        static void terminate(const v8::FunctionCallbackInfo<v8::Value>& info);
        static void onmessage(const v8::FunctionCallbackInfo<v8::Value>& info);
        static void post_message(const v8::FunctionCallbackInfo<v8::Value>& info);


        static WorkerID create(Environment* p_master, const String& p_path, NativeObjectID p_handle);

        // check if a worker valid
        static bool is_valid(WorkerID p_id);

        static bool try_get_worker(WorkerID p_id, NativeObjectID& o_handle, void*& o_token_ptr);

        // terminate a worker
        static void terminate(WorkerID p_id);

        // master -> worker
        static void on_receive(WorkerID p_id, Buffer&& p_buffer);
    };
}

#endif
