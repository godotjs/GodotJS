#include "jsb_jsc_isolate.h"

#include "jsb_jsc_catch.h"
#include "jsb_jsc_handle.h"
#include "jsb_jsc_context.h"

#define JSB_JSC_DEFINE_ATOM_BEGIN() int _atom_index_gen_ = 0
#define JSB_JSC_DEFINE_ATOM(AtomName) \
    jsb_check(jsb::impl::JS_ATOM_##AtomName == _atom_index_gen_); \
    atoms_[_atom_index_gen_++] = jsb::impl::JavaScriptCore::MakeUTF8String<true>(ctx_, #AtomName)
#define JSB_JSC_DEFINE_ATOM_END() jsb_check(_atom_index_gen_ == jsb::impl::JS_ATOM_END)

#define JSB_JSC_DEFINE_BRIDGE_CALL_BEGIN() int _bridge_call_index_gen_ = 0
#define JSB_JSC_DEFINE_BRIDGE_CALL(CallName, CallBody) \
    jsb_check(jsb::impl::JSBridgeCall::CallName == _bridge_call_index_gen_); \
    JSValueRef _rval_##CallName = _compile_bridge_call(CallBody);\
    JSValueProtect(ctx_, _rval_##CallName);\
    bridge_calls_[_bridge_call_index_gen_++] = jsb::impl::JavaScriptCore::AsObject(ctx_, _rval_##CallName)
#define JSB_JSC_DEFINE_BRIDGE_CALL_END() jsb_check(_bridge_call_index_gen_ == jsb::impl::JSBridgeCall::Num)

namespace v8
{
    JSGlobalContextRef _CreateContext(JSContextGroupRef rt)
    {
        JSClassDefinition cd = kJSClassDefinitionEmpty;
        cd.className = "CGlobal";
        const JSClassRef cls = JSClassCreate(&cd);
        JSGlobalContextRef ctx = JSGlobalContextCreateInGroup(rt, cls);
        JSClassRelease(cls);
        return ctx;
    }

    Isolate *Isolate::New(const CreateParams &params)
    {
        Isolate* isolate = memnew(Isolate);
        return isolate;
    }

    Isolate::Isolate() : 
        ref_count_(1), disposed_(false), handle_scope_(nullptr), 
        pending_delete_(nearest_shift(2048)), 
        pending_finalize_(nearest_shift(2048)), 
        stack_pos_(0)
    {
        rt_ = JSContextGroupCreate();
        ctx_ = _CreateContext(rt_);

        const JSObjectRef global = JSContextGetGlobalObject(ctx_);

        JSB_JSC_DEFINE_BRIDGE_CALL_BEGIN();
        {
            JSB_JSC_DEFINE_BRIDGE_CALL(DefineProperty, R"--((
function(key, value, getter, setter) {
    if (typeof value !== "undefined") {
        Object.defineProperty(this, key, {
            value: value,
            writable: true,
            configurable: true,
            enumerable: true
        });
    } else {
        Object.defineProperty(this, key, {
            get: getter,
            set: setter,
            configurable: true,
            enumerable: true
        });
    }
}
))--");
            JSB_JSC_DEFINE_BRIDGE_CALL(GetOwnPropertyDescriptor, "(function(key){ return Object.getOwnPropertyDescriptor(this, key); })");
            JSB_JSC_DEFINE_BRIDGE_CALL(GetOwnPropertyNames, "(function(){ return Object.getOwnPropertyNames(this); })");
            JSB_JSC_DEFINE_BRIDGE_CALL(InstanceOf, "(function(parent){ return this instanceof parent; })");
        }
        JSB_JSC_DEFINE_BRIDGE_CALL_END();

        // init all ATOM (preallocated string values)
        JSB_JSC_DEFINE_ATOM_BEGIN();
        {
            JSB_JSC_DEFINE_ATOM(prototype);
            JSB_JSC_DEFINE_ATOM(constructor);

            JSB_JSC_DEFINE_ATOM(message);
            JSB_JSC_DEFINE_ATOM(stack);
            JSB_JSC_DEFINE_ATOM(name);
            JSB_JSC_DEFINE_ATOM(configurable);
            JSB_JSC_DEFINE_ATOM(writable);
            JSB_JSC_DEFINE_ATOM(enumerable);

            JSB_JSC_DEFINE_ATOM(Map);
            JSB_JSC_DEFINE_ATOM(Promise);
            JSB_JSC_DEFINE_ATOM(ArrayBuffer);

            // the following ATOMs may be unnecessary
            JSB_JSC_DEFINE_ATOM(get);
            JSB_JSC_DEFINE_ATOM(set);
            JSB_JSC_DEFINE_ATOM(value);
            JSB_JSC_DEFINE_ATOM(length);
        }
        JSB_JSC_DEFINE_ATOM_END();

        // Class Definition for JSC.External
        {
            JSClassDefinition cd = kJSClassDefinitionEmpty;
            cd.className = "External";
            cd.attributes = kJSClassAttributeNoAutomaticPrototype;
            classes_[jsb::impl::ClassID::External] = JSClassCreate(&cd);
        }
        // Class Definition for JSC.Instance (instance of constructed)
        {
            JSClassDefinition cd = kJSClassDefinitionEmpty;
            cd.className = "BridgeInstance";
            cd.attributes = kJSClassAttributeNoAutomaticPrototype;
            cd.finalize = &_BridgeInstance_finalizer;
            classes_[jsb::impl::ClassID::Instance] = JSClassCreate(&cd);
        }

        static_assert(sizeof(stack_) == sizeof(JSValueRef) * jsb::impl::kMaxStackSize);

        // should be fine to leave it uninitialized
        // memset(stack_, 0, sizeof(stack_));

        jsb::impl::JavaScriptCore::SetContextOpaque(ctx_, this);
        jsb_check(jsb::impl::JavaScriptCore::GetContextOpaque(ctx_) == this);
        // JS_SetHostPromiseRejectionTracker(rt_, _promise_rejection_tracker, this);
#if JSB_WITH_DEBUGGER
        JSGlobalContextSetInspectable(ctx_, true);
#endif

        //TODO dead loop checker
        // JS_SetInterruptHandler

        jsb_ensure(emplace_(JSValueMakeUndefined(ctx_)) == jsb::impl::StackPos::Undefined);
        jsb_ensure(emplace_(JSValueMakeNull(ctx_)) == jsb::impl::StackPos::Null);
        jsb_ensure(emplace_(JSValueMakeBoolean(ctx_, true)) == jsb::impl::StackPos::True);
        jsb_ensure(emplace_(JSValueMakeBoolean(ctx_, false)) == jsb::impl::StackPos::False);
        jsb_ensure(emplace_(jsb::impl::JavaScriptCore::MakeUTF8String<true>(ctx_, "")) == jsb::impl::StackPos::EmptyString);
        jsb_ensure(emplace_(jsb::impl::JavaScriptCore::MakeUTF8String<true>(ctx_, "Calling constructor as function is not allowed")) == jsb::impl::StackPos::ConstructorCallError);
        jsb_ensure(emplace_(_GetProperty(global, jsb::impl::JS_ATOM_Map)) == jsb::impl::StackPos::MapConstructor);
        jsb_ensure(emplace_(_GetProperty(global, jsb::impl::JS_ATOM_Promise)) == jsb::impl::StackPos::PromiseConstructor);
        jsb_ensure(emplace_(_GetProperty(global, jsb::impl::JS_ATOM_ArrayBuffer)) == jsb::impl::StackPos::ArrayBufferConstructor);
        jsb_ensure(emplace_(JSValueMakeUndefined(ctx_)) == jsb::impl::StackPos::Exception);
        jsb_check(stack_pos_ == jsb::impl::StackPos::Num);
    }

    Isolate::~Isolate()
    {
        jsb_check(!rt_);
    }

    void Isolate::_release()
    {
        JSB_JSC_LOG(VeryVerbose, "release quickjs runtime");

        for (int i = 0; i < jsb::impl::JSBridgeCall::Num; ++i)
        {
            JSValueUnprotect(ctx_, bridge_calls_[i]);
        }

        // manually run GC before freeing the context/runtime to ensure all objects free-ed (valuetype objects)
        JSGarbageCollect(ctx_);
        PerformMicrotaskCheckpoint();

        // cleanup
        jsb_check(!handle_scope_);
        jsb_check(stack_pos_ == jsb::impl::StackPos::Num);
        for (int i = 0; i < jsb::impl::StackPos::Num; ++i)
        {
            JSValueUnprotect(ctx_, stack_[i]);
        }

        for (int i = 0; i < jsb::impl::ClassID::Num; ++i)
        {
            JSClassRelease(classes_[i]);
        }
        for (int i = 0; i < jsb::impl::JS_ATOM_END; ++i)
        {
            JSValueUnprotect(ctx_, atoms_[i]);
        }
        while (!captured_values_.is_empty())
        {
            const jsb::impl::CapturedValueID id = captured_values_.get_first_index();
            const JSValueRef val = captured_values_.get_value(id);
            JSValueUnprotect(ctx_, val);
            captured_values_.remove_at(id);
        }

        // dispose the runtime
        JSGlobalContextRelease(ctx_);
        ctx_ = nullptr;
        JSContextGroupRelease(rt_);
        rt_ = nullptr;

        memdelete(this);
    }

    void Isolate::Dispose()
    {
        jsb_check(!disposed_);
        disposed_ = true;
        _remove_reference();
    }

    void Isolate::SetData(int index, void* data)
    {
        jsb_check(index == 0);
        embedder_data_ = data;
    }

    JSValueRef Isolate::_compile_bridge_call(const char* source)
    {
        const JSStringRef code = JSStringCreateWithUTF8CString(source);
        JSValueRef error = nullptr;
        const JSValueRef rval = JSEvaluateScript(ctx_, code, nullptr, nullptr, 0, &error);
        if (error)
        {
            jsb::impl::JavaScriptCore::MarkExceptionAsTrivial(ctx_, error);
            return nullptr;
        }
        jsb_check(rval);
        JSStringRelease(code);
        return rval;
    }

    uint16_t Isolate::push_map()
    {
        const JSObjectRef constructor = jsb::impl::JavaScriptCore::AsObject(ctx_, stack_[jsb::impl::StackPos::MapConstructor]);
        JSValueRef error = nullptr;
        const JSValueRef val = JSObjectCallAsConstructor(ctx_, constructor, 0, nullptr, &error);
        jsb_check(val);
        if (jsb_unlikely(error))
        {
            jsb::impl::JavaScriptCore::MarkExceptionAsTrivial(ctx_, error);
            return jsb::impl::StackPos::Undefined;
        }
        return push_copy(val);
    }

    void Isolate::PerformMicrotaskCheckpoint()
    {
        while (pending_delete_.data_left())
        {
            const jsb::impl::CapturedValueID id = pending_delete_.read();
            const JSValueRef value = captured_values_.get_value(id);
            JSValueUnprotect(ctx_, value);
            captured_values_.remove_at(id);
        }
        while (pending_finalize_.data_left())
        {
            jsb::impl::InternalData* data = pending_finalize_.read();
            if (const WeakCallbackInfo<void>::Callback callback = (WeakCallbackInfo<void>::Callback) data->weak.callback)
            {
                const WeakCallbackInfo<void> info(this, data->weak.parameter, data->internal_fields);
                callback(info);
            }
            memdelete(data);
        }
    }

    Local<Context> Isolate::GetCurrentContext()
    {
        return Local<Context>(Data(this, 0));
    }

    void Isolate::RequestGarbageCollectionForTesting(GarbageCollectionType type)
    {
        JSGarbageCollect(ctx_);
    }

    void Isolate::LowMemoryNotification()
    {
        JSGarbageCollect(ctx_);
    }

    bool Isolate::_IsPromise(JSValueRef val) const
    {
        const JSObjectRef obj = JSValueToObject(ctx_, stack_[jsb::impl::StackPos::PromiseConstructor], nullptr);
        return obj && JSValueIsInstanceOfConstructor(ctx_, val, obj, nullptr);
    }

    bool Isolate::_IsMap(JSValueRef val) const
    {
        const JSObjectRef obj = JSValueToObject(ctx_, stack_[jsb::impl::StackPos::MapConstructor], nullptr);
        return obj && JSValueIsInstanceOfConstructor(ctx_, val, obj, nullptr);
    }

    bool Isolate::_IsArrayBuffer(JSValueRef val) const
    {
        const JSObjectRef obj = JSValueToObject(ctx_, stack_[jsb::impl::StackPos::ArrayBufferConstructor], nullptr);
        return obj && JSValueIsInstanceOfConstructor(ctx_, val, obj, nullptr);
    }

    bool Isolate::_IsExternal(JSValueRef val) const
    {
        return JSValueIsObjectOfClass(ctx_, val, classes_[jsb::impl::ClassID::External]);
    }

    JSObjectRef Isolate::_NewExternal(void* data)
    {
        return JSObjectMake(ctx_, classes_[jsb::impl::ClassID::External], data);
    }

    JSValueRef Isolate::_GetProperty(JSObjectRef obj, JSAtom atom)
    {
        JSValueRef error = nullptr;
        const JSValueRef rval = JSObjectGetPropertyForKey(ctx_, obj, atoms_[atom], &error);
        if (jsb_unlikely(error))
        {
            jsb::impl::JavaScriptCore::MarkExceptionAsTrivial(ctx_, error);
            return nullptr;
        }
        return rval;
    }

    bool Isolate::_SetProperty(JSObjectRef obj, JSAtom atom, JSValueRef value)
    {
        JSValueRef error = nullptr;
        JSObjectSetPropertyForKey(ctx_, obj, atoms_[atom], value, kJSPropertyAttributeNone, &error);
        if (jsb_unlikely(error))
        {
            jsb::impl::JavaScriptCore::MarkExceptionAsTrivial(ctx_, error);
            return false;
        }
        return true;
    }

    bool Isolate::_DefineProperty(JSObjectRef obj, JSValueRef key, JSValueRef value)
    {
        jsb_check(obj && key && value);
        jsb_check(!JSValueIsUndefined(ctx_, obj));
        jsb_check(!JSValueIsUndefined(ctx_, key) && !JSValueIsNull(ctx_, key));

        const JSObjectRef call = bridge_calls_[jsb::impl::JSBridgeCall::DefineProperty];
        const JSValueRef args[2] = { key, value };
        JSValueRef error = nullptr;
        JSObjectCallAsFunction(ctx_, call, obj, std::size(args), args, &error);
        if (jsb_unlikely(error))
        {
            jsb::impl::JavaScriptCore::MarkExceptionAsTrivial(ctx_, error);
            return false;
        }
        return !error;
    }

    bool Isolate::_DefineProperty(JSObjectRef obj, JSValueRef key, JSObjectRef getter, JSObjectRef setter)
    {
        jsb_check(!JSValueIsUndefined(ctx_, obj));
        jsb_check(JSValueIsString(ctx_, key));
        jsb_check(!getter || JSObjectIsFunction(ctx_, getter));
        jsb_check(!setter || JSObjectIsFunction(ctx_, setter));

        const JSObjectRef call = bridge_calls_[jsb::impl::JSBridgeCall::DefineProperty];
        const JSValueRef args[4] = { 
            key, 
            stack_[jsb::impl::StackPos::Undefined], 
            getter ? getter : stack_[jsb::impl::StackPos::Undefined], 
            setter ? setter : stack_[jsb::impl::StackPos::Undefined]
        };
        JSValueRef error = nullptr;
        JSObjectCallAsFunction(ctx_, call, obj, std::size(args), args, &error);
        if (jsb_unlikely(error))
        {
            jsb::impl::JavaScriptCore::MarkExceptionAsTrivial(ctx_, error);
            return false;
        }
        return !error;
    }

    JSValueRef Isolate::_CallAsConstructor(JSObjectRef func_obj, int argc, JSValueRef* arguments)
    {
        JSValueRef error = nullptr;
        const JSValueRef rval = JSObjectCallAsConstructor(ctx_, func_obj, argc, arguments, &error);
        if (jsb_unlikely(error))
        {
            _ThrowError(error);
            return nullptr;
        }
        return rval;
    }

    JSValueRef Isolate::_GetError()
    {
        const JSValueRef last = stack_[jsb::impl::StackPos::Exception];
        if (last)
        {
            const JSValueRef undefined = stack_[jsb::impl::StackPos::Undefined];
            JSValueProtect(ctx_, undefined);
            stack_[jsb::impl::StackPos::Exception] = undefined;
            JSValueUnprotect(ctx_, last);
        }
        return last;
    }

    void Isolate::_ThrowError(JSValueRef error)
    {
        jsb_check(error && !JSValueIsUndefined(ctx_, error));
        const JSValueRef last = stack_[jsb::impl::StackPos::Exception];
        if (last && !JSValueIsUndefined(ctx_, last))
        {
            JSB_JSC_LOG(Warning, "overwriting the previous exception: %s", jsb::impl::JavaScriptCore::GetString(ctx_, last));
            JSValueUnprotect(ctx_, last);
        }
        JSValueProtect(ctx_, error);
        JSB_JSC_LOG(Verbose, "throw error: %s", jsb::impl::JavaScriptCore::GetString(ctx_, error));
        stack_[jsb::impl::StackPos::Exception] = error;
    }

    JSValueRef Isolate::_GetOwnPropertyDescriptor(JSObjectRef obj, JSValueRef key)
    {
        const JSObjectRef call = bridge_calls_[jsb::impl::JSBridgeCall::GetOwnPropertyDescriptor];
        JSValueRef error = nullptr;
        const JSValueRef rval = JSObjectCallAsFunction(ctx_, call, obj, 1, &key, &error); // NOLINT(readability-suspicious-call-argument)
        if (jsb_unlikely(error))
        {
            jsb::impl::JavaScriptCore::MarkExceptionAsTrivial(ctx_, error);
            return nullptr;
        }
        return rval;
    }

    JSValueRef Isolate::_GetOwnPropertyNames(JSObjectRef obj)
    {
        const JSObjectRef call = bridge_calls_[jsb::impl::JSBridgeCall::GetOwnPropertyNames];
        JSValueRef error = nullptr;
        const JSValueRef rval = JSObjectCallAsFunction(ctx_, call, obj, 0, nullptr, &error);  // NOLINT(readability-suspicious-call-argument)
        if (jsb_unlikely(error))
        {
            jsb::impl::JavaScriptCore::MarkExceptionAsTrivial(ctx_, error);
            return nullptr;
        }
        return rval;
    }

    void _CFunction_finalize(JSObjectRef obj)
    {
        jsb::impl::CFunctionPayload* payload = (jsb::impl::CFunctionPayload*) JSObjectGetPrivate(obj);
        jsb_check(payload);
        payload->isolate->_delete_cfunction(payload->captured_value_id);
        memdelete(payload);
    }

    // no guarantee for main thread
    void Isolate::_BridgeInstance_finalizer(JSObjectRef obj)
    {
        if (jsb::impl::InternalData* data = (jsb::impl::InternalData*) JSObjectGetPrivate(obj))
        {
            v8::Isolate* isolate = (v8::Isolate*) data->isolate;
            JSB_JSC_LOG(VeryVerbose, "remove internal data JSObject:%s id:%s", (uintptr_t) obj, (uintptr_t) data);

            //TODO improve: always handle it in environment
            const ::Error error = isolate->pending_finalize_.write(data);
            jsb_check(error == ::OK);
        }
    }

    JSValueRef _NotAllowedCallAsFunction(JSContextRef ctx, JSObjectRef function, JSObjectRef thisObject, size_t argumentCount, const JSValueRef arguments[], JSValueRef* exception)
    {
        Isolate* isolate = (Isolate*) jsb::impl::JavaScriptCore::GetContextOpaque(ctx);
        //TODO copy or steal?
        *exception = isolate->stack_dup(jsb::impl::StackPos::ConstructorCallError);
        return nullptr;
    }

    bool Isolate::_hasInstance_callback(JSContextRef ctx, JSObjectRef constructor, JSValueRef possibleInstance, JSValueRef* exception)
    {
        Isolate* isolate = (Isolate*) jsb::impl::JavaScriptCore::GetContextOpaque(ctx);
        const JSObjectRef po1 = jsb::impl::JavaScriptCore::AsObject(ctx, JSObjectGetPrototype(ctx, (JSObjectRef) possibleInstance));
        const JSValueRef po2 = isolate->_GetProperty(constructor, jsb::impl::JS_ATOM_prototype);
        jsb_check(po1 && po2);
        const JSObjectRef call = isolate->bridge_calls_[jsb::impl::JSBridgeCall::InstanceOf];
        const JSValueRef rval = JSObjectCallAsFunction(ctx, call, po1, 1, &po2, exception);
        return rval && JSValueToBoolean(ctx, rval);
    }

    JSObjectRef Isolate::_NewObjectProtoClass(JSValueRef prototype, void* data)
    {
        const JSObjectRef obj = JSObjectMake(ctx_, classes_[jsb::impl::ClassID::Instance], data);
        jsb_check(obj);
        JSObjectSetPrototype(ctx_, obj, prototype);
        return obj;
    }

    JSObjectRef Isolate::_NewConstructor(JSObjectCallAsConstructorCallback func, const char* name, v8::FunctionCallback callback, uint32_t class_payload)
    {
        JSClassDefinition def = kJSClassDefinitionEmpty;
        def.className = name;
        def.attributes = kJSClassAttributeNoAutomaticPrototype;
        def.callAsFunction = &_NotAllowedCallAsFunction;
        def.callAsConstructor = func;
        def.hasInstance = &_hasInstance_callback;
        const JSClassRef cls = JSClassCreate(&def);
        jsb::impl::CConstructorPayload* payload = memnew(jsb::impl::CConstructorPayload);
        payload->isolate = this;
        payload->callback = callback;
        payload->class_payload = class_payload;
        const JSObjectRef constructor = JSObjectMake(ctx_, cls, payload);
        JSClassRelease(cls);
        return constructor;
    }

    JSObjectRef Isolate::_NewFunction(JSObjectCallAsFunctionCallback func, const char* name, void* callback, JSValueRef captured_value)
    {
        JSClassDefinition def = kJSClassDefinitionEmpty;
        def.className = name ? name : "CFunction";
        def.attributes = kJSClassAttributeNoAutomaticPrototype;
        def.finalize = &_CFunction_finalize;
        def.callAsFunction = func;
        const JSClassRef cls = JSClassCreate(&def);
        jsb::impl::CFunctionPayload* payload = memnew(jsb::impl::CFunctionPayload);
        JSValueProtect(ctx_, captured_value);
        payload->captured_value_id = captured_values_.add(captured_value);
        payload->isolate = this;
        payload->callback = callback;
        const JSObjectRef func_obj = JSObjectMake(ctx_, cls, payload);
        jsb_check(payload == JSObjectGetPrivate(func_obj));
        JSClassRelease(cls);
        return func_obj;
    }

    void Isolate::_delete_cfunction(jsb::impl::CapturedValueID id)
    {
        //TODO delete FunctionData in a thread safe way
        //TODO JSValueUnprotect(data.data);
        const ::Error error = pending_delete_.write(id);
        jsb_check(error == ::OK);
    }

}
