#ifndef GODOTJS_QUICKJS_ISOLATE_H
#define GODOTJS_QUICKJS_ISOLATE_H

#include "jsb_quickjs_pch.h"
#include "jsb_quickjs_typedef.h"
#include "jsb_quickjs_handle_scope.h"
#include "jsb_quickjs_array_buffer.h"

namespace jsb::impl
{
    struct WeakCallbackInfo
    {
        void* parameter;
        void* callback; // WeakCallbackInfo::Callback
    };

    struct InternalData
    {
        // support only one callback
        WeakCallbackInfo weak;

        uint8_t internal_field_count = 0;
        void* internal_fields[2];
    };

    typedef internal::SArray<InternalData>::Pointer InternalDataPtr;
    typedef internal::SArray<InternalData>::ConstPointer InternalDataConstPtr;

    enum { kMaxStackSize = 128 };

    namespace StackPos
    {
        // reserved positions, never released until isolate disposed
        enum
        {
            Undefined,
            Null,
            True,
            False,
            EmptyString,

            Num,
        };
    }

    struct ClassID
    {
        ClassID() { JS_NewClassID(&id_); }
        explicit operator JSClassID() const { return id_; }

    private:
        JSClassID id_;
    };

    class Helper;
}

namespace v8
{
    template<typename T> class Global<T>;
    template<typename T> class Local<T>;
    class HeapStatistics;
    class Context;
    class Value;

    class Isolate
    {
        friend class jsb::impl::Helper;
        friend class Context;

        template<typename T> friend class Global<T>;
        template<typename T> friend class Local<T>;

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
        void PerformMicrotaskCheckpoint();
        void LowMemoryNotification() {}
        void SetBatterySaverMode(bool) {}
        void RequestGarbageCollectionForTesting(GarbageCollectionType type) {}
        Local<Context> GetCurrentContext();

        void AddGCPrologueCallback(GCCallback callback) {}
        void AddGCEpilogueCallback(GCCallback callback) {}
        void GetHeapStatistics(HeapStatistics* statistics);

        const JSValue& operator[](const uint16_t index) const
        {
            jsb_check(index < stack_pos_);
            return stack_[index];
        }

        jsb_force_inline JSRuntime* rt() const { return rt_; }
        jsb_force_inline JSContext* ctx() const { return ctx_; }
        jsb_force_inline void remove_exception_anyway() const
        {
            const JSValue error = JS_GetException(ctx_);
            jsb_check(!JS_IsNull(error));
            JS_FreeValue(ctx_, error);
        }

        jsb::impl::InternalDataConstPtr get_internal_data(const jsb::internal::Index64 index) const
        {
            return internal_data_.get_value_scoped(index);
        }

        jsb::impl::InternalDataPtr get_internal_data(const jsb::internal::Index64 index)
        {
            return internal_data_.get_value_scoped(index);
        }

        static JSClassID get_class_id() { static jsb::impl::ClassID id; return (JSClassID) id; }

        // no copy on value
        uint16_t push_steal(const JSValue value)
        {
            jsb_check(handle_scope_);
            return emplace_(value);
        }

        // copy value
        uint16_t push_copy(const JSValue value)
        {
            jsb_check(handle_scope_);
            JS_DupValueRT(rt_, value);
            return emplace_(value);
        }

    private:
        Isolate();
        ~Isolate();

        uint16_t emplace_(JSValue value);

        static void _finalizer(JSRuntime* rt, JSValue val);

        JSRuntime* rt_;
        JSContext* ctx_;
        HandleScope* handle_scope_;

        jsb::internal::SArray<jsb::impl::InternalData> internal_data_;

        uint16_t stack_pos_;
        JSValue stack_[jsb::impl::kMaxStackSize];

        void* embedder_data_ = nullptr;
        void* context_embedder_data_ = nullptr;
    };
}

#endif
