#ifndef GODOTJS_JSC_ISOLATE_H
#define GODOTJS_JSC_ISOLATE_H

#include "jsb_jsc_pch.h"
#include "jsb_jsc_typedef.h"
#include "jsb_jsc_handle_scope.h"
#include "jsb_jsc_array_buffer.h"
#include "jsb_jsc_promise_reject.h"

namespace jsb::impl
{
    namespace JSBridgeCall
    {
        enum
        {
            // (this)+ (key, value, getter, setter)
            DefineProperty,
            // (this)+ (key)
            GetOwnPropertyDescriptor,
            // (this)
            GetOwnPropertyNames,

            // (this)+ (parent)
            InstanceOf,
            Num,
        };
    }

    struct WeakCallbackInfo
    {
        void* parameter = nullptr;
        void* callback = nullptr;  // WeakCallbackInfo::Callback
    };

    struct InternalData
    {
        //NOTE store pointer of isolate on every UniversalBridgeClass object because we do not find any viable solution to get JSContext from JSObjectRef.
        //     a workaround is static global registry, but lock is needed for thread-safety which is not desired at present.
        void* isolate;

        // Support only one callback at a time.
        // In current version, weak callback and valuetype deleter share the same WeakCallbackInfo.
        // Therefore, can not define a Global with SetWeak on a valuetype object.
        WeakCallbackInfo weak;

        uint8_t internal_field_count = 0;
        void* internal_fields[2] = { nullptr, nullptr };
    };

    typedef jsb::internal::Index32 CapturedValueID;

    struct CFunctionPayload
    {
        v8::Isolate* isolate;
        void* callback;
        CapturedValueID captured_value_id;
    };

    struct CConstructorPayload
    {
        v8::Isolate* isolate;
        v8::FunctionCallback callback;
        uint32_t class_payload;
    };

    enum { kMaxStackSize = 512 };

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
            ConstructorCallError,

            MapConstructor,
            PromiseConstructor,
            ArrayBufferConstructor,
            Exception,

            Num,
        };
    }

    // id for JSClassRef registry in isolate
    namespace ClassID
    {
        enum
        {
            External,
            Instance,
            Num,
        };
    }

    class Helper;
    class Broker;
}

namespace v8
{
    template<typename T> class Global;
    template<typename T> class Local;
    template<typename T> class FunctionCallbackInfo;
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
        void SetPromiseRejectCallback(PromiseRejectCallback callback)
        {
            JSB_JSC_LOG(Log, "SetPromiseRejectCallback is not supported");
        }

        bool IsExecutionTerminating() const { return interrupted_.is_set(); }
        void TerminateExecution() { interrupted_.set(); }

        jsb_force_inline JSContextGroupRef rt() const { return rt_; }
        jsb_force_inline JSContextRef ctx() const { return ctx_; }

        bool _IsPromise(JSValueRef val) const;
        bool _IsMap(JSValueRef val) const;
        bool _IsExternal(JSValueRef val) const;
        bool _IsArrayBuffer(JSValueRef val) const;
        JSValueRef _GetProperty(JSObjectRef obj, JSAtom atom);
        bool _SetProperty(JSObjectRef obj, JSAtom atom, JSValueRef value);
        JSObjectRef _NewExternal(void* data);

        bool _DefineProperty(JSObjectRef obj, JSValueRef key, JSValueRef value);
        bool _DefineProperty(JSObjectRef obj, JSValueRef key, JSObjectRef getter, JSObjectRef setter);
        JSValueRef _GetOwnPropertyDescriptor(JSObjectRef obj, JSValueRef key);
        JSValueRef _GetOwnPropertyNames(JSObjectRef obj);

        JSObjectRef _NewFunction(JSObjectCallAsFunctionCallback func, const char* name, void* callback, JSValueRef captured_value);
        static bool _hasInstance_callback(JSContextRef ctx, JSObjectRef constructor, JSValueRef possibleInstance, JSValueRef* exception);
        JSObjectRef _NewConstructor(JSObjectCallAsConstructorCallback func, const char* name, v8::FunctionCallback callback, uint32_t class_payload);
        JSObjectRef _NewObjectProtoClass(JSValueRef prototype, void* data);
        void _delete_cfunction(jsb::impl::CapturedValueID id);
        JSValueRef _get_captured_value(jsb::impl::CapturedValueID id) { return captured_values_.get_value(id); }

        // return nullptr if exception is thrown (saved in stack)
        JSValueRef _CallAsConstructor(JSObjectRef func_obj, int argc, JSValueRef* arguments);
        void _ThrowError(JSValueRef error);

        // will also remove the error value from stack
        JSValueRef _GetError();
        bool _HasError() const
        {
            return !JSValueIsUndefined(ctx_, stack_[jsb::impl::StackPos::Exception]);
        }

        // get stack value
        [[nodiscard]] const JSValueRef& stack_val(const uint16_t index) const
        {
            jsb_check(index < stack_pos_);
            jsb_check(index < jsb::impl::StackPos::Num || handle_scope_);
            return stack_[index];
        }

        // get stack value (duplicated)
        [[nodiscard]] JSValueRef stack_dup(const uint16_t index) const
        {
            JSValueRef val = stack_val(index);
            JSValueProtect(ctx_, val);
            return val;
        }

        // write value to the stack pos 'to' without duplicating
        void set_stack_copy(const uint16_t to, const JSValueRef value)
        {
            jsb_check(to < stack_pos_);
            jsb_check(to < jsb::impl::StackPos::Num || handle_scope_);
            JSValueProtect(ctx_, value);
            JSValueUnprotect(ctx_, stack_[to]);
            stack_[to] = value;
        }

        // duplicate a value 'from' to the stack pos 'to'
        void set_stack_copy(const uint16_t to, const uint16_t from)
        {
            jsb_check(to != from && to < stack_pos_ && from < stack_pos_);
            jsb_check(handle_scope_ || (to < jsb::impl::StackPos::Num && from < jsb::impl::StackPos::Num));
            JSValueProtect(ctx_, stack_[from]);
            JSValueUnprotect(ctx_, stack_[to]);
            stack_[to] = stack_[from];
        }

        // due to the missing API to new Map
        uint16_t push_map();

        uint16_t push_undefined()
        {
            jsb_check(handle_scope_);
            const JSValueRef rval = stack_val(jsb::impl::StackPos::Undefined);
            return push_copy(rval);
        }

        // copy value
        uint16_t push_copy(const JSValueRef value)
        {
            jsb_check(handle_scope_);
            JSValueProtect(ctx_, value);
            return emplace_(value);
        }

        ~Isolate();

        void _add_reference()
        {
            jsb_check(ref_count_ > 0);
            ++ref_count_;
            JSB_JSC_LOG(VeryVerbose, "_add_reference %s", ref_count_);
        }

        void _remove_reference()
        {
            jsb_check(ref_count_ > 0);
            if (--ref_count_ == 0)
            {
                _release();
            }
            JSB_JSC_LOG(VeryVerbose, "_remove_reference %s", ref_count_);
        }

        jsb_force_inline void throw_error(const char* message)
        {
            const JSStringRef str = JSStringCreateWithUTF8CString(message);
            const JSValueRef value = JSValueMakeString(ctx_, str);
            JSStringRelease(str);

            JSValueRef trivial_error = nullptr;
            const JSValueRef created_error = JSObjectMakeError(ctx_, 1, &value, &trivial_error);
            if (trivial_error)
            {
                jsb::impl::JavaScriptCore::MarkExceptionAsTrivial(ctx_, trivial_error);
                return;
            }
            _ThrowError(created_error);
        }

        jsb_force_inline void throw_error(const ::String& message)
        {
            const CharString str8 = message.utf8();
            throw_error(str8.get_data());
        }

    private:
        Isolate();

        void _release();

        // push value to the top of stack (without ref-counting)
        uint16_t emplace_(JSValueRef value)
        {
            jsb_check(stack_pos_ < jsb::impl::kMaxStackSize);
            const uint16_t pos = stack_pos_++;
            stack_[pos] = value;
            return pos;
        }

        static void _BridgeInstance_finalizer(JSObjectRef val);

        // return value is not protected
        JSValueRef _compile_bridge_call(const char* source);

        JSClassRef classes_[jsb::impl::ClassID::Num];
        uint32_t ref_count_;
        bool disposed_;
        JSContextGroupRef rt_;
        JSGlobalContextRef ctx_;
        HandleScope* handle_scope_;

        JSObjectRef bridge_calls_[jsb::impl::JSBridgeCall::Num];

        jsb::internal::SArray<JSValueRef, jsb::impl::CapturedValueID> captured_values_;
        RingBuffer<jsb::impl::CapturedValueID> pending_delete_;
        RingBuffer<jsb::impl::InternalData*> pending_finalize_; //TODO improve

        uint16_t stack_pos_;
        JSValueRef stack_[jsb::impl::kMaxStackSize];
        JSValueRef atoms_[jsb::impl::JS_ATOM_END];

        void* embedder_data_ = nullptr;
        void* context_embedder_data_ = nullptr;

        SafeFlag interrupted_ = SafeFlag(false);
    };
}

#endif
