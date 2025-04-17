#include "jsb_jsc_object.h"
#include "jsb_jsc_isolate.h"
#include "jsb_jsc_context.h"
#include "jsb_jsc_function_interop.h"

namespace v8
{
    int Object::InternalFieldCount() const
    {
        const JSObjectRef self = jsb::impl::JavaScriptCore::AsObject(isolate_->ctx(), (JSValueRef) *this);
        const jsb::impl::InternalData* internal_data = (jsb::impl::InternalData*) JSObjectGetPrivate(self);
        return internal_data ? internal_data->internal_field_count : 0;
    }

    void Object::SetAlignedPointerInInternalField(int slot, void* data)
    {
        jsb_check((uintptr_t) data % 2 == 0);
        const JSObjectRef self = jsb::impl::JavaScriptCore::AsObject(isolate_->ctx(), (JSValueRef) *this);
        jsb::impl::InternalData* internal_data = (jsb::impl::InternalData*) JSObjectGetPrivate(self);
        jsb_check(internal_data);
        jsb_checkf(!data || !internal_data->internal_fields[slot], "overwriting the internal field is not allowed");
        internal_data->internal_fields[slot] = data;
    }

    void Object::SetAlignedPointerInInternalFields(int argc, int indices[], void* values[])
    {
        const JSObjectRef self = jsb::impl::JavaScriptCore::AsObject(isolate_->ctx(), (JSValueRef) *this);
        jsb::impl::InternalData* internal_data = (jsb::impl::InternalData*) JSObjectGetPrivate(self);
        jsb_check(internal_data);
        for (int i = 0; i < argc; i++)
        {
            jsb_check((uintptr_t) values[i] % 2 == 0);
            jsb_checkf(!values[i] || !internal_data->internal_fields[indices[i]], "overwriting the internal field #%d is not allowed", indices[i]);
            internal_data->internal_fields[indices[i]] = values[i];
        }
    }

    void* Object::GetAlignedPointerFromInternalField(int slot) const
    {
        const JSObjectRef self = jsb::impl::JavaScriptCore::AsObject(isolate_->ctx(), (JSValueRef) *this);
        const jsb::impl::InternalData* internal_data = (jsb::impl::InternalData*) JSObjectGetPrivate(self);
        jsb_check(internal_data);
        return internal_data->internal_fields[slot];
    }

    Local<String> Object::GetConstructorName()
    {
        const JSObjectRef self = jsb::impl::JavaScriptCore::AsObject(isolate_->ctx(), (JSValueRef) *this);
        const JSValueRef name = isolate_->_GetProperty(self, jsb::impl::JS_ATOM_name);
        if (!JSValueIsString(isolate_->ctx(), name))
        {
            return Local<String>();
        }
        return Local<String>(Data(isolate_, isolate_->push_copy(name)));
    }
    
    Maybe<bool> Object::Set(Local<Context> context, uint32_t index, Local<Value> value)
    {
        const JSObjectRef self = jsb::impl::JavaScriptCore::AsObject(isolate_->ctx(), (JSValueRef) *this);
        JSValueRef error = nullptr;
        JSObjectSetPropertyAtIndex(isolate_->ctx(), self, index, (JSValueRef) value, &error);
        if (jsb_unlikely(error))
        {
            jsb::impl::JavaScriptCore::MarkExceptionAsTrivial(isolate_->ctx(), error);
            return Maybe<bool>();
        }
        return Maybe<bool>(true);
    }

    MaybeLocal<Value> Object::Get(Local<Context> context, uint32_t index) const
    {
        const JSObjectRef self = jsb::impl::JavaScriptCore::AsObject(isolate_->ctx(), (JSValueRef) *this);
        JSValueRef error = nullptr;
        const JSValueRef val = JSObjectGetPropertyAtIndex(isolate_->ctx(), self, index, &error);
        if (jsb_unlikely(error))
        {
            jsb::impl::JavaScriptCore::MarkExceptionAsTrivial(isolate_->ctx(), error);
            return MaybeLocal<Value>();
        }
        return MaybeLocal<Value>(Data(isolate_, isolate_->push_copy(val)));
    }

    Maybe<bool> Object::Set(Local<Context> context, Local<Value> key, Local<Value> value)
    {
        const JSObjectRef self = jsb::impl::JavaScriptCore::AsObject(isolate_->ctx(), (JSValueRef) *this);
        JSValueRef error = nullptr;
        JSObjectSetPropertyForKey(isolate_->ctx(), self, (JSValueRef) key, (JSValueRef) value, kJSPropertyAttributeNone, &error);
        if (jsb_unlikely(error))
        {
            jsb::impl::JavaScriptCore::MarkExceptionAsTrivial(isolate_->ctx(), error);
            return Maybe<bool>();
        }
        return Maybe<bool>(true);
    }

    MaybeLocal<Value> Object::Get(Local<Context> context, Local<Value> key) const
    {
        const JSObjectRef self = jsb::impl::JavaScriptCore::AsObject(isolate_->ctx(), (JSValueRef) *this);
        JSValueRef error = nullptr;
        const JSValueRef val = JSObjectGetPropertyForKey(isolate_->ctx(), self, (JSValueRef) key, &error);
        if (jsb_unlikely(error))
        {
            return MaybeLocal<Value>();
        }
        return MaybeLocal<Value>(Data(isolate_, isolate_->push_copy(val)));
    }

    Maybe<bool> Object::HasOwnProperty(Local<Context> context, Local<Name> key) const
    {
        const JSObjectRef self = jsb::impl::JavaScriptCore::AsObject(isolate_->ctx(), (JSValueRef) *this);
        JSValueRef error = nullptr;
        const bool res = JSObjectHasPropertyForKey(isolate_->ctx(), self, (JSValueRef) key, &error);
        if (jsb_unlikely(error))
        {
            return Maybe<bool>();
        }
        return Maybe<bool>(res);
    }

    Maybe<bool> Object::SetPrototype(Local<Context> context, Local<Value> prototype)
    {
        const JSObjectRef self = jsb::impl::JavaScriptCore::AsObject(isolate_->ctx(), (JSValueRef) *this);

        // no straightforward way to check if it's successfully set
        JSObjectSetPrototype(isolate_->ctx(), self, (JSValueRef) prototype);
        return Maybe<bool>(true);
    }

    // obj.__proto__
    Local<Value> Object::GetPrototype()
    {
        const JSObjectRef self = jsb::impl::JavaScriptCore::AsObject(isolate_->ctx(), (JSValueRef) *this);
        const JSValueRef prototype = JSObjectGetPrototype(isolate_->ctx(), self);
        if (jsb_unlikely(!prototype))
        {
            return Local<Value>();
        }
        return Local<Value>(Data(isolate_, isolate_->push_copy(prototype)));
    }

    MaybeLocal<Value> Object::CallAsConstructor(Local<Context> context, int argc, Local<Value> argv[])
    {
        const JSObjectRef self = jsb::impl::JavaScriptCore::AsObject(isolate_->ctx(), (JSValueRef) *this);
        JSValueRef* argvv = jsb_stackalloc(JSValueRef, argc);
        for (int i = 0; i < argc; ++i)
        {
            argvv[i] = (JSValueRef) argv[i];
        }
        const JSValueRef instance = isolate_->_CallAsConstructor(self, argc, argvv);
        if (jsb_unlikely(!instance))
        {
            // intentionally keep the exception
            return MaybeLocal<Value>();
        }
        return MaybeLocal<Value>(Data(isolate_, isolate_->push_copy(instance)));
    }

    // new plain object
    Local<Object> Object::New(Isolate* isolate)
    {
        const JSObjectRef obj = JSObjectMake(isolate->ctx(), nullptr, nullptr);
        jsb_check(obj);
        return Local<Object>(Data(isolate, isolate->push_copy(obj)));
    }

    MaybeLocal<Value> Object::GetOwnPropertyDescriptor(Local<Context> context, Local<Name> key) const
    {
        const JSObjectRef self = jsb::impl::JavaScriptCore::AsObject(isolate_->ctx(), (JSValueRef) *this);
        const JSValueRef rval = isolate_->_GetOwnPropertyDescriptor(self, (JSValueRef) key);
        if (rval)
        {
            return MaybeLocal<Value>(Data(isolate_, isolate_->push_copy(rval)));
        }
        return MaybeLocal<Value>();
    }

    // JSValue _lazy(JSContext* ctx, JSValue this_val, int argc, JSValue* argv, int magic, JSValue* func_data)
    JSValueRef _lazy(JSContextRef ctx, JSObjectRef function, JSObjectRef thisObject, size_t argumentCount, const JSValueRef arguments[], JSValueRef* exception)
    {
        Isolate* isolate = (Isolate*) jsb::impl::JavaScriptCore::GetContextOpaque(ctx);
        const jsb::impl::CFunctionPayload& payload = *(jsb::impl::CFunctionPayload*) JSObjectGetPrivate(function);
        JSValueRef rvo = nullptr;
        const JSValueRef captured_value = isolate->_get_captured_value(payload.captured_value_id);
        jsb_check(captured_value);

        // evaluate lazy callback
        {
            const AccessorNameGetterCallback getter = (AccessorNameGetterCallback) payload.callback;
            HandleScope handle_scope(isolate);

            const uint16_t rvo_pos = isolate->push_undefined(); // reserved stack position for return value
            const PropertyCallbackInfo<Value> info(isolate, rvo_pos);
            const Local<Name> prop_v(Data(isolate, isolate->push_copy(captured_value)));

            getter(prop_v, info);

            // after back from the impl layer, we need to return JS_EXCEPTION if an error is thrown in quickjs
            if (isolate->_HasError())
            {
                *exception = isolate->_GetError();
                return nullptr;
            }

            // We need a duplicated value for returning.
            // Duplicate the value here because the stack value will become invalid after leaving the handle scope.
            rvo = isolate->stack_dup(rvo_pos);
        }

        // overwrite the current lazy getter with rvo
        {
            const bool rval = isolate->_DefineProperty(thisObject, captured_value, rvo);  // NOLINT(readability-suspicious-call-argument)
            jsb_check(rval);
            jsb_unused(rval);
        }

        //TODO correct?
        JSValueUnprotect(ctx, rvo);
        return rvo;
    }

    Maybe<bool> Object::SetLazyDataProperty(Local<Context> context, Local<Name> name, AccessorNameGetterCallback getter)
    {
        const JSContextRef ctx = isolate_->ctx();
        const JSObjectRef this_obj = jsb::impl::JavaScriptCore::AsObject(isolate_->ctx(), (JSValueRef) *this);
        const JSObjectRef lazy = isolate_->_NewFunction(_lazy, nullptr, (void*) getter, (JSValueRef) name);
        if (!isolate_->_DefineProperty(this_obj, (JSValueRef) name, lazy, nullptr))
        {
            return Maybe<bool>();
        }
        return Maybe<bool>(true);
    }

    Maybe<bool> Object::DefineOwnProperty(Local<Context> context, Local<Name> key, Local<Value> value, PropertyAttribute attributes)
    {
        const JSObjectRef this_obj = jsb::impl::JavaScriptCore::AsObject(isolate_->ctx(), (JSValueRef) *this);
        const JSValueRef val = (JSValueRef) value;
        const JSValueRef prop = (JSValueRef) key;

        if (isolate_->_DefineProperty(this_obj, prop, val))
        {
            return Maybe<bool>(true);
        }
        return Maybe<bool>();
    }

    void Object::SetAccessorProperty(Local<Name> name, Local<FunctionTemplate> getter, Local<FunctionTemplate> setter)
    {
        const JSObjectRef this_obj = jsb::impl::JavaScriptCore::AsObject(isolate_->ctx(), (JSValueRef) *this);
        isolate_->_DefineProperty(this_obj, (JSValueRef) name,
            jsb::impl::JavaScriptCore::AsObject(isolate_->ctx(), (JSValueRef) getter),
            jsb::impl::JavaScriptCore::AsObject(isolate_->ctx(), (JSValueRef) setter));
    }

    MaybeLocal<Array> Object::GetOwnPropertyNames(Local<Context> context, PropertyFilter filter, KeyConversionMode key_conversion)
    {
        //NOTE we use bridge call rather than JSC API here for simplicity (no need to handle JSPropertyNameArrayRef stuff)
        const JSObjectRef this_obj = jsb::impl::JavaScriptCore::AsObject(isolate_->ctx(), (JSValueRef) *this);
        const JSValueRef rval = isolate_->_GetOwnPropertyNames(this_obj);
        if (rval)
        {
            return MaybeLocal<Array>(Data(isolate_, isolate_->push_copy(rval)));
        }
        return MaybeLocal<Array>();
    }

    MaybeLocal<Promise::Resolver> Promise::Resolver::New(Local<Context> context)
    {
        Isolate* isolate = context->GetIsolate();
        const JSContextRef ctx = isolate->ctx();
        JSObjectRef resolve, reject;
        JSValueRef error;
        const JSObjectRef promise = JSObjectMakeDeferredPromise(ctx, &resolve, &reject, &error);
        if (error)
        {
            isolate->_ThrowError(error);
            return MaybeLocal<Promise::Resolver>();
        }

        const JSValueRef args[] = { resolve, reject, promise };
        const JSObjectRef holder = JSObjectMakeArray(ctx, 3, args, &error);
        if (error)
        {
            isolate->_ThrowError(error);
            return MaybeLocal<Promise::Resolver>();
        }
        
        JSObjectSetPropertyAtIndex(ctx, holder, kHolderIndexResolve, args[0], &error);
        jsb_ensure(!error);
        JSObjectSetPropertyAtIndex(ctx, holder, kHolderIndexReject,  args[1], &error);
        jsb_ensure(!error);
        JSObjectSetPropertyAtIndex(ctx, holder, kHolderIndexPromise, args[2], &error);
        jsb_ensure(!error);
        return MaybeLocal<Array>(Data(isolate, isolate->push_copy(holder)));
    }

    Local<Promise> Promise::Resolver::GetPromise()
    {
        const JSContextRef ctx = isolate_->ctx();
        jsb_check(JSValueIsArray(ctx, (JSValueRef) *this));
        const JSObjectRef holder = jsb::impl::JavaScriptCore::AsObject(ctx, (JSValueRef) *this);
        JSValueRef error;
        const JSValueRef rval = JSObjectGetPropertyAtIndex(ctx, holder, kHolderIndexPromise, &error);
        
        // or, just loosely check `!JSValueIsObject(ctx, rval)`
        if (error || !isolate_->_IsPromise(rval))
        {
            jsb::impl::JavaScriptCore::MarkExceptionAsTrivial(ctx, error);
            return Local<Promise>();
        }
        return Local<Promise>(Data(isolate_, isolate_->push_copy(rval)));
    }

    namespace
    {
        template <uint32_t kHolderIndex>
        Maybe<bool> InvokePromise(Local<Context> context, Data* this_, Local<Value> value)
        {
            Isolate* isolate = context->GetIsolate();
            const JSContextRef ctx = isolate->ctx();
            jsb_check(JSValueIsArray(ctx, (JSValueRef) *this_));
            const JSObjectRef holder = jsb::impl::JavaScriptCore::AsObject(ctx, (JSValueRef) *this_);
            JSValueRef error;
            const JSValueRef holderValue = JSObjectGetPropertyAtIndex(ctx, holder, kHolderIndex, &error);
            if (error)
            {
                isolate->_ThrowError(error);
                return Maybe<bool>();
            }
            const JSObjectRef func = jsb::impl::JavaScriptCore::AsObject(ctx, holderValue);
            jsb_check(func && JSObjectIsFunction(ctx, func));
            const JSObjectRef thisObj = jsb::impl::JavaScriptCore::AsObject(ctx, isolate->stack_val(jsb::impl::StackPos::Undefined));
            const JSValueRef args[] = { (JSValueRef) value };
            const JSValueRef rval = JSObjectCallAsFunction(ctx,
                /* func */ func, 
                /* this */ thisObj,
                /* args */ std::size(args), args,
                &error);
            if (error)
            {
                isolate->_ThrowError(error);
                return Maybe<bool>();
            }
            jsb_check(JSValueIsUndefined(ctx, rval));
            return Maybe<bool>(true);
        }
    }
    
    Maybe<bool> Promise::Resolver::Resolve(Local<Context> context, Local<Value> value)
    {
        return InvokePromise<kHolderIndexResolve>(context, this, value);
    }

    Maybe<bool> Promise::Resolver::Reject(Local<Context> context, Local<Value> value)
    {
        return InvokePromise<kHolderIndexReject>(context, this, value);
    }
}
