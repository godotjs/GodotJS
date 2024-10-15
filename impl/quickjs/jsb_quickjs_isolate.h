#ifndef GODOTJS_QUICKJS_ISOLATE_H
#define GODOTJS_QUICKJS_ISOLATE_H

#include "jsb_quickjs_pch.h"
#include "jsb_quickjs_typedef.h"
#include "jsb_quickjs_handle_scope.h"
#include "jsb_quickjs_array_buffer.h"
#include "jsb_quickjs_promise_reject.h"

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
        void* internal_fields[2] = { nullptr, nullptr };
    };

    static_assert(sizeof(uintptr_t) == sizeof(internal::Index64), "quickjs.impl does not support 32-bit arch");
    typedef internal::Index64 InternalDataID;

    typedef internal::SArray<InternalData, InternalDataID>::Pointer InternalDataPtr;
    typedef internal::SArray<InternalData, InternalDataID>::ConstPointer InternalDataConstPtr;

    struct ConstructorData
    {
        v8::FunctionCallback callback;
        uint32_t data;
    };

    enum { kMaxStackSize = 1024 };

    namespace StackPos
    {
        // reserved absolute stack positions, never released until isolate disposed
        enum
        {
            Undefined,
            Null,
            True,
            False,
            EmptyString,
            SymbolClass,
            MapClass,
            Exception,

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

    struct Phantom
    {
        int watcher_ = 0;
        bool alive_ = false;
    };

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
        void PerformMicrotaskCheckpoint();
        void LowMemoryNotification();
        void SetBatterySaverMode(bool) {}
        void RequestGarbageCollectionForTesting(GarbageCollectionType type);
        Local<Context> GetCurrentContext();

        void AddGCPrologueCallback(GCCallback callback) {}
        void AddGCEpilogueCallback(GCCallback callback) {}
        void GetHeapStatistics(HeapStatistics* statistics);
        void SetPromiseRejectCallback(PromiseRejectCallback callback) { promise_reject_ = callback; }

        jsb_force_inline JSRuntime* rt() const { return rt_; }
        jsb_force_inline JSContext* ctx() const { return ctx_; }
        jsb_force_inline void remove_exception_anyway() const
        {
            const JSValue error = JS_GetException(ctx_);
            jsb_check(!JS_IsNull(error));
            JS_FreeValue(ctx_, error);
        }

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

        static JSClassID get_class_id() { static jsb::impl::ClassID id; return (JSClassID) id; }

        // get stack value
        [[nodiscard]] const JSValue& stack_val(const uint16_t index) const
        {
            jsb_check(index < stack_pos_);
            jsb_check(index < jsb::impl::StackPos::Num || handle_scope_);
            return stack_[index];
        }

        // get stack value (duplicated)
        [[nodiscard]] JSValue stack_dup(const uint16_t index) const
        {
            jsb_check(index < stack_pos_);
            jsb_check(index < jsb::impl::StackPos::Num || handle_scope_);
            return JS_DupValue(ctx_, stack_[index]);
        }

        // write value to the stack pos 'to' without duplicating
        void set_stack_steal(const uint16_t to, const JSValueConst value)
        {
            jsb_check(to < stack_pos_);
            jsb_check(to < jsb::impl::StackPos::Num || handle_scope_);
            JS_FreeValue(ctx_, stack_[to]);
            stack_[to] = value;
        }

        // write value to the stack pos 'to' with duplicating
        void set_stack_copy(const uint16_t to, const uint16_t from)
        {
            jsb_check(to != from && to < stack_pos_ && from < stack_pos_);
            jsb_check(handle_scope_ || (to < jsb::impl::StackPos::Num && from < jsb::impl::StackPos::Num));
            JS_DupValue(ctx_, stack_[from]);
            JS_FreeValue(ctx_, stack_[to]);
            stack_[to] = stack_[from];
        }

        uint16_t push_symbol();
        uint16_t push_map();

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
            JS_DupValue(ctx_, value);
            return emplace_(value);
        }

        bool try_catch();

        // they won't be deleted until the Isolate disposed
        int add_constructor_data(FunctionCallback callback, uint32_t data)
        {
            const int index = constructor_data_.size();
            constructor_data_.append({ callback, data });
            return index;
            // return (int) *constructor_data_.add({ callback, data });
        }
        jsb::impl::ConstructorData get_constructor_data(const int index) const
        {
            return constructor_data_[index];
            // return constructor_data_.get_value((jsb::internal::Index32)(uint32_t) index);
        }

        ~Isolate();

        // phantom is a pointer to JSObject (internal type of quickjs).
        // the caller must ensure that the JSObject is alive when calling add_phantom
        void add_phantom(void* token)
        {
            if (!token) return;

            // JSB_QUICKJS_LOG(VeryVerbose, "add phantom %s", (uintptr_t) token);
            if (jsb::impl::Phantom* p = phantom_.getptr(token))
            {
                ++p->watcher_;
                return;
            }

            phantom_.insert(token, { 1, true });
        }

        void remove_phantom(void* token)
        {
            if (!token) return;

            const auto it = phantom_.find(token);
            // JSB_QUICKJS_LOG(VeryVerbose, "remove phantom %s", (uintptr_t) token);
            if (jsb_ensure(it) && --it->value.watcher_ == 0)
            {
                phantom_.remove(it);
            }
        }

        bool is_phantom_alive(void* token) const
        {
            const jsb::impl::Phantom& p = phantom_.get(token);
            return p.alive_;
        }

        void _invalidate_phantom(void* token)
        {
            if (jsb::impl::Phantom* p = phantom_.getptr(token))
            {
                p->alive_ = false;
            }
        }

        void _add_reference();
        void _remove_reference();

    private:
        Isolate();

        void _release();

        // push value to the top of stack (without ref-counting)
        uint16_t emplace_(JSValue value)
        {
            jsb_check(stack_pos_ < jsb::impl::kMaxStackSize);
            jsb_check(!JS_IsException(value));

            const uint16_t pos = stack_pos_++;
            stack_[pos] = value;
            return pos;
        }

        static void _finalizer(JSRuntime* rt, JSValue val);
        static void _promise_rejection_tracker(JSContext* ctx, JSValueConst promise, JSValueConst reason, JS_BOOL is_handled, void* user_data);

        uint32_t ref_count_;
        bool disposed_;
        JSRuntime* rt_;
        JSContext* ctx_;
        HandleScope* handle_scope_;

        PromiseRejectCallback promise_reject_;

        jsb::internal::SArray<jsb::impl::InternalData, jsb::impl::InternalDataID> internal_data_;
        Vector<jsb::impl::ConstructorData> constructor_data_;
        HashMap<void*, jsb::impl::Phantom> phantom_;

        uint16_t stack_pos_;
        JSValue stack_[jsb::impl::kMaxStackSize];

        void* embedder_data_ = nullptr;
        void* context_embedder_data_ = nullptr;
    };
}

#endif
