#ifndef GODOTJS_WORKER_H
#define GODOTJS_WORKER_H
#include "jsb_bridge_pch.h"
#include "jsb_buffer.h"
#include "jsb_class_info.h"
#include "jsb_environment.h"
#include "jsb_type_convert.h"

#if !JSB_WITH_WEB && !JSB_WITH_JAVASCRIPTCORE
namespace jsb
{
    enum class FinalizationType : uint8_t;

    typedef internal::Index32 WorkerID;
    typedef Mutex WorkerLock;
    class Environment;
    class WorkerImpl;
    typedef std::shared_ptr<WorkerImpl> WorkerImplPtr;

    // A message from the master thread to a worker thread.
    // Contains the serialized V8 data and a side-channel list of Godot variants/objects being transferred.
    struct WorkerMessage
    {
    public:
        WorkerMessage() = delete;
        ~WorkerMessage() = default;

        WorkerMessage(const WorkerMessage&) = delete;
        WorkerMessage& operator=(const WorkerMessage&) = delete;

        WorkerMessage(WorkerMessage&&) noexcept = default;
        WorkerMessage& operator=(WorkerMessage&&) noexcept = default;

        WorkerMessage(Buffer&& p_data, std::vector<TransferData>&& p_transfers)
            : data(std::move(p_data)), transfers(std::move(p_transfers))
        {
        }

        const Buffer& get_data() const { return data; }
        const std::vector<TransferData>& get_transfers() const { return transfers; }

    private:
        Buffer data;
        std::vector<TransferData> transfers;
    };

    class Worker
    {
    private:
        friend class WorkerImpl;
        friend class JSWorkerModuleLoader;

        WorkerID id_ = {};

        static WorkerLock lock_;
        static internal::SArray<WorkerImplPtr, WorkerID> worker_list_;
        static HashMap<Thread::ID, WorkerID> workers_;

    public:
        static void register_(const v8::Local<v8::Context>& p_context, const v8::Local<v8::Object>& p_self);

        // release all workers, call from main thread (GodotJSScriptLanguage::finish)
        static void finish();

        static void on_thread_enter();
        static void on_thread_exit();

    private:
        static void finalizer(Environment*, void* pointer, FinalizationType /* p_finalize */);
        static void constructor(const v8::FunctionCallbackInfo<v8::Value>& info);

        static void terminate(const v8::FunctionCallbackInfo<v8::Value>& info);
        static void post_message(const v8::FunctionCallbackInfo<v8::Value>& info);
        static void _placeholder(const v8::FunctionCallbackInfo<v8::Value>& info);

        static WorkerID create(Environment* p_master, const String& p_path, NativeObjectID p_handle);

        // check if a worker valid
        static bool is_valid(WorkerID p_id);

        static bool try_get_worker(WorkerID p_id, NativeObjectID& o_handle, void*& o_token_ptr);

        // terminate a worker
        static bool terminate(WorkerID p_id);

        // master -> worker message passing
        static void on_receive(WorkerID p_id, WorkerMessage&& message);

        // shared master <-> worker postMessage logic
        static std::pair<uint8_t*, size_t> handle_post_message(const v8::FunctionCallbackInfo<v8::Value>& info, internal::ReferentialVariantMap<TransferData>& transfers);
    };
} // namespace jsb
#endif

#endif
