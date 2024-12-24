#ifndef GODOTJS_WEB_ISOLATE_H
#define GODOTJS_WEB_ISOLATE_H

#include "jsb_web_pch.h"
#include "jsb_web_typedef.h"
#include "jsb_web_handle_scope.h"
#include "jsb_web_array_buffer.h"
#include "jsb_web_promise_reject.h"

namespace jsb::impl
{
    struct WeakCallbackInfo
    {
        void* parameter = nullptr;
        void* callback = nullptr;  // WeakCallbackInfo::Callback
    };

    struct InternalData
    {
        // Support only one callback at a time.
        // In current version, weak callback and valuetype deleter share the same WeakCallbackInfo.
        // Therefore, can not define a Global with SetWeak on a valuetype object.
        WeakCallbackInfo weak;

        uint8_t internal_field_count = 0;
        void* internal_fields[2] = { nullptr, nullptr };
    };

#if INTPTR_MAX >= INT64_MAX
    typedef internal::Index64 InternalDataID;
#elif INTPTR_MAX >= INT32_MAX
    typedef internal::Index32 InternalDataID;
#else
    #error "web.impl does not support on the current arch"
#endif

    typedef internal::SArray<InternalData, InternalDataID>::Pointer InternalDataPtr;
    typedef internal::SArray<InternalData, InternalDataID>::ConstPointer InternalDataConstPtr;

    class Helper;
    class Broker;
}

namespace v8
{
    template<typename T> class Global;
    template<typename T> class Local;
    template<typename T> class FunctionCallbackInfo;
    class HeapStatistics;
    class Context;
    class Value;

    class Isolate
    {
        friend class jsb::impl::Helper;
        friend class jsb::impl::Broker;
        friend class Context;
        friend struct IsolateInternalFunctions;

        template<typename T> friend class Global;
        template<typename T> friend class Local;
        template<typename T> friend class FunctionCallbackInfo;

        friend class HandleScope;

    public:
        class Scope { public: Scope(Isolate* isolate) {} };

        struct CreateParams
        {
            ArrayBuffer::Allocator* array_buffer_allocator = nullptr;
        };

        static Isolate* New(const CreateParams& params);
        void Dispose();

        void* GetData(int index) const { jsb_check(index == 0); return embedder_data_; }
        void SetData(int index, void* data);
        void PerformMicrotaskCheckpoint() {}
        void LowMemoryNotification();
        void SetBatterySaverMode(bool) {}
        void RequestGarbageCollectionForTesting(GarbageCollectionType type);
        Local<Context> GetCurrentContext();

        void AddGCPrologueCallback(GCCallback callback) {}
        void AddGCEpilogueCallback(GCCallback callback) {}
        void GetHeapStatistics(HeapStatistics* statistics);
        void SetPromiseRejectCallback(PromiseRejectCallback callback) { jsbi_SetHostPromiseRejectionTracker(rt_, (jsb::impl::FunctionPointer) callback); }

        void set_as_interruptible() { }
        bool IsExecutionTerminating() const { return false; }
        void TerminateExecution() { }

        jsb_force_inline jsb::impl::JSRuntime rt() const { return rt_; }

        jsb::impl::InternalDataConstPtr get_internal_data(const jsb::impl::InternalDataID index) const
        {
            return internal_data_.get_value_scoped(index);
        }

        jsb::impl::InternalDataPtr get_internal_data(const jsb::impl::InternalDataID index)
        {
            return internal_data_.get_value_scoped(index);
        }

        jsb::impl::InternalDataID add_internal_data(const uint8_t internal_field_count)
        {
            return internal_data_.add(jsb::impl::InternalData {  { nullptr, nullptr }, internal_field_count, { nullptr, nullptr }});
        }

        ~Isolate();

        void _add_reference()
        {
            jsb_check(ref_count_ > 0);
            ++ref_count_;
            JSB_WEB_LOG(VeryVerbose, "_add_reference %s", ref_count_);
        }

        void _remove_reference()
        {
            jsb_check(ref_count_ > 0);
            if (--ref_count_ == 0)
            {
                _release();
            }
            JSB_WEB_LOG(VeryVerbose, "_remove_reference %s", ref_count_);
        }

        template<int N>
        jsb_force_inline void throw_error(const char (&message)[N])
        {
            throw_error((::String) message);
        }

        jsb_force_inline void throw_error(const ::String& message)
        {
            const CharString str8 = message.utf8();
            jsbi_ThrowError(rt_, str8.get_data());
        }

        jsb::internal::SArray<jsb::impl::InternalData, jsb::impl::InternalDataID> internal_data_;

    private:
        Isolate();

        void _release();

        uint32_t ref_count_;
        bool disposed_;
        jsb::impl::JSRuntime rt_;
        HandleScope* handle_scope_;

        void* embedder_data_ = nullptr;
        void* context_embedder_data_ = nullptr;
    };
}

#endif
