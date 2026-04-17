#ifndef GODOTJS_WORKER_H
#define GODOTJS_WORKER_H
#include "jsb_bridge_pch.h"
#include "jsb_buffer.h"
#include "jsb_class_info.h"
#include "jsb_environment.h"
#include "jsb_type_convert.h"

#if JSB_WITH_WEB
#include <pthread.h>
#endif

namespace jsb
{
    enum class FinalizationType : uint8_t;

    typedef internal::Index32 WorkerID;
    typedef Mutex WorkerLock;
    class Environment;
    class WorkerImpl;
    typedef std::shared_ptr<WorkerImpl> WorkerImplPtr;

#if !JSB_WITH_WEB
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

        WorkerMessage(Buffer&& p_data, std::vector<TransferData>&& p_transfers) :
            data(std::move(p_data)), transfers(std::move(p_transfers))
        {
        }

        const Buffer& get_data() const { return data; }
        const std::vector<TransferData>& get_transfers() const { return transfers; }

    private:

        Buffer data;
        std::vector<TransferData> transfers;
    };
#endif

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
        enum class WebNativeTransferError : int32_t
        {
            None = 0,
            ObjectNotInTransferList = -1,
            EnvMissing = -2,
            IsolateMissing = -3,
            NonObjectValue = -4,
            VariantConversionFailed = -5,
            VariantCloneFailed = -6,
            TransferAppendFailed = -7,
        };

        static void register_(const v8::Local<v8::Context>& p_context, const v8::Local<v8::Object>& p_self);

        // release all workers, call from main thread (GodotJSScriptLanguage::finish)
        static void finish();

        static void on_thread_enter();
        static void on_thread_exit();

#if JSB_WITH_WEB
        static void on_web_message(jsb::impl::StackPosition p_data_sp, uint32_t p_transfer_id);
        static void on_web_message_from_pthread(uintptr_t p_sender_pthread_id, jsb::impl::StackPosition p_data_sp, uint32_t p_transfer_id);

        static bool web_queue_transfers(uintptr_t p_pthread_id, uint32_t p_transfer_id, std::vector<TransferData>&& p_transfers);
        static bool web_discard_transfers(uintptr_t p_pthread_id, uint32_t p_transfer_id);
        static bool web_get_or_add_transfer(uintptr_t p_pthread_id, uint32_t p_transfer_id, const Variant& p_variant, uint32_t& r_transfer_index, WebNativeTransferError& r_error);
        static bool web_try_get_worker_by_pthread_id(uintptr_t p_pthread_id, WorkerImplPtr& o_worker_impl);

        static v8::Local<v8::Value> web_restore_transfer_markers(
            v8::Isolate* isolate,
            const v8::Local<v8::Context>& context,
            const v8::Local<v8::Value>& value,
            const std::vector<TransferData>& transfers);

#endif

    private:
        static void finalizer(Environment*, void* pointer, FinalizationType /* p_finalize */);
        static void constructor(const v8::FunctionCallbackInfo<v8::Value>& info);

        static void terminate(const v8::FunctionCallbackInfo<v8::Value>& info);
        static void post_message(const v8::FunctionCallbackInfo<v8::Value>& info);
        static void _placeholder(const v8::FunctionCallbackInfo<v8::Value>& info);

        static WorkerID create(Environment* p_master, const String& p_path, NativeObjectID p_handle);

        // check if a worker valid
        static bool is_valid(WorkerID p_id);

        static bool try_get_worker(WorkerID p_id, WorkerImplPtr& o_worker_impl);

        // terminate a worker
        static bool terminate(WorkerID p_id);

        static bool parse_transfer_list(
            v8::Isolate* isolate,
            const v8::Local<v8::Context>& context,
            Environment* from_env,
            const v8::FunctionCallbackInfo<v8::Value>& info,
            internal::ReferentialVariantMap<TransferData>& transfers);

#if !JSB_WITH_WEB
        // master -> worker message passing
        static void on_receive(WorkerID p_id, WorkerMessage&& message);

        // shared master <-> worker postMessage logic (non-web: byte-based serialization)
        static std::pair<uint8_t*, size_t> handle_post_message(const v8::FunctionCallbackInfo<v8::Value>& info, internal::ReferentialVariantMap<TransferData>& transfers);
#endif
    };
}

#endif
