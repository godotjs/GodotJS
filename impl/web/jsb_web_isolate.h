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

    struct ConstructorData
    {
        v8::FunctionCallback callback = nullptr;
        uint32_t data = 0;
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
        void SetPromiseRejectCallback(PromiseRejectCallback callback) { promise_reject_ = callback; }

        void set_as_interruptible() { }
        bool IsExecutionTerminating() const { return false; }
        void TerminateExecution() { }

        jsb_force_inline jsb::impl::JSRuntime rt() const { return rt_; }
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

        // they won't be deleted until the Isolate disposed
        int add_constructor_data(FunctionCallback callback, uint32_t data)
        {
            const int index = (int) constructor_data_.size();
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

        // phantom is a pointer to JSObject (internal type of web).
        // the caller must ensure that the JSObject is alive when calling add_phantom
        jsb_force_inline void add_phantom(void* token)
        {
            if (!token) return;

            // JSB_WEB_LOG(VeryVerbose, "add phantom %s", (uintptr_t) token);
            if (jsb::impl::Phantom* p = phantom_.getptr(token))
            {
                ++p->watcher_;
                return;
            }

            phantom_.insert(token, { 1, true });
        }

        jsb_force_inline void remove_phantom(void* token)
        {
            if (!token) return;

            const auto it = phantom_.find(token);
            // JSB_WEB_LOG(VeryVerbose, "remove phantom %s", (uintptr_t) token);
            if (jsb_ensure(it) && --it->value.watcher_ == 0)
            {
                phantom_.remove(it);
            }
        }

        //NOTE it'll crash if `token` does not exist in phantom map
        jsb_force_inline bool is_phantom_alive(void* token) const
        {
            const jsb::impl::Phantom& p = phantom_.get(token);
            return p.alive_;
        }

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

        jsb_force_inline jsb::impl::JSAtom get_atom(jsb::impl::JSAtomIndex p_index) const
        {
            return atom_cache_[p_index];
        }

        jsb_force_inline void mark_as_error_thrown() { jsb_checkf(!error_thrown_, "overwriting another error"); error_thrown_ = true; }
        jsb_force_inline bool is_error_thrown() const { return error_thrown_; }

    private:
        Isolate();

        void _release();

        static void _promise_rejection_tracker(JSContext* ctx, JSValueConst promise, JSValueConst reason, JS_BOOL is_handled, void* user_data);
        static int _interrupt_callback(jsb::impl::JSRuntime rt, void* data) { return ((Isolate*) data)->interrupted_.is_set(); }

        uint32_t ref_count_;
        bool disposed_;
        jsb::impl::JSRuntime rt_;
        HandleScope* handle_scope_;

        PromiseRejectCallback promise_reject_;

        jsb::internal::SArray<jsb::impl::InternalData, jsb::impl::InternalDataID> internal_data_;
        Vector<jsb::impl::ConstructorData> constructor_data_;

        void* embedder_data_ = nullptr;
        void* context_embedder_data_ = nullptr;

        jsb::impl::JSAtom atom_cache_[jsb::impl::_JS_ATOM_Num];
    };
}

#endif
