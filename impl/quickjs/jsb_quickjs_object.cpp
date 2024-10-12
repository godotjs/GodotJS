#include "jsb_quickjs_object.h"
#include "jsb_quickjs_isolate.h"
#include "jsb_quickjs_function_interop.h"

namespace v8
{
    int Object::InternalFieldCount() const
    {
        const JSValue val = isolate_->stack_val(stack_pos_);
        const jsb::internal::Index64 index = (jsb::internal::Index64)(uintptr_t) JS_GetOpaque(val, Isolate::get_class_id());
        const jsb::impl::InternalDataPtr data = isolate_->get_internal_data(index);
        return data->internal_field_count;
    }

    void Object::SetAlignedPointerInInternalField(int slot, void* value)
    {
        const JSValue val = isolate_->stack_val(stack_pos_);
        const jsb::internal::Index64 index = (jsb::internal::Index64)(uintptr_t) JS_GetOpaque(val, Isolate::get_class_id());
        const jsb::impl::InternalDataPtr data = isolate_->get_internal_data(index);
        data->internal_fields[slot] = value;
    }

    void* Object::GetAlignedPointerFromInternalField(int slot) const
    {
        const JSValue val = isolate_->stack_val(stack_pos_);
        const jsb::internal::Index64 index = (jsb::internal::Index64)(uintptr_t) JS_GetOpaque(val, Isolate::get_class_id());
        const jsb::impl::InternalDataPtr data = isolate_->get_internal_data(index);
        return data->internal_fields[slot];
    }

    Maybe<bool> Object::Set(Local<Context> context, uint32_t index, Local<Value> value)
    {
        const JSValue self = isolate_->stack_val(stack_pos_);
        jsb_check(JS_IsArray(isolate_->ctx(), self));
        const int res = JS_SetPropertyUint32(isolate_->ctx(), self, index, JS_DupValue(isolate_->ctx(), (JSValue) value));
        if (res == -1)
        {
            return Maybe<bool>();
        }
        return Maybe<bool>(true);
    }

    MaybeLocal<Value> Object::Get(Local<Context> context, uint32_t index) const
    {
        const JSValue self = isolate_->stack_val(stack_pos_);
        jsb_check(JS_IsArray(isolate_->ctx(), self));
        const JSValue val = JS_GetPropertyUint32(isolate_->ctx(), self, index);
        if (JS_IsException(val))
        {
            return MaybeLocal<Value>();
        }
        return MaybeLocal<Value>(Data(isolate_, isolate_->push_steal(val)));
    }

    Maybe<bool> Object::Set(Local<Context> context, Local<Value> key, Local<Value> value)
    {
        const JSValue self = isolate_->stack_val(stack_pos_);
        JSContext* ctx = isolate_->ctx();
        const JSAtom index = JS_ValueToAtom(ctx, (JSValue) key);
        const int res = JS_SetProperty(ctx, self, index, JS_DupValue(ctx, (JSValue) value));
        JS_FreeAtom(ctx, index);
        if (res == -1)
        {
            return Maybe<bool>();
        }
        return Maybe<bool>(true);
    }

    MaybeLocal<Value> Object::Get(Local<Context> context, Local<Value> key) const
    {
        const JSValue self = isolate_->stack_val(stack_pos_);
        JSContext* ctx = isolate_->ctx();
        const JSAtom index = JS_ValueToAtom(ctx, (JSValue) key);
        const JSValue val = JS_GetProperty(ctx, self, index);
        JS_FreeAtom(ctx, index);
        if (JS_IsException(val))
        {
            return MaybeLocal<Value>();
        }
        return MaybeLocal<Value>(Data(isolate_, isolate_->push_steal(val)));
    }

    Maybe<bool> Object::HasOwnProperty(Local<Context> context, Local<Name> key) const
    {
        //TODO unsure
        JSContext* ctx = isolate_->ctx();
        const JSAtom prop = JS_ValueToAtom(ctx, (JSValue) key);
        const int res = JS_GetOwnProperty(ctx, nullptr, (JSValue) *this, prop);
        JS_FreeAtom(ctx, prop);
        if (res == -1)
        {
            return Maybe<bool>();
        }
        return Maybe<bool>(res);
    }

    Maybe<bool> Object::SetPrototype(Local<Context> context, Local<Value> prototype)
    {
        JSContext* ctx = isolate_->ctx();
        const int res = JS_SetPrototype(ctx, (JSValue) *this, (JSValue) prototype);
        if (res == -1)
        {
            return Maybe<bool>();
        }
        return Maybe<bool>(res);
    }

    MaybeLocal<Value> Object::CallAsConstructor(Local<Context> context, int argc, Local<Value> argv[])
    {
        JSContext* ctx = isolate_->ctx();
        const JSValue self = (JSValue) *this;
        const JSValue constructor = JS_GetProperty(ctx, self, jsb::impl::JS_ATOM_constructor);
        if (JS_IsException(constructor))
        {
            return MaybeLocal<Value>();
        }
        JSValue* argvv = jsb_stackalloc(JSValue, argc);
        for (int i = 0; i < argc; ++i)
        {
            argvv[i] = (JSValue) argv[i];
        }
        const JSValue instance = JS_CallConstructor(ctx, constructor, argc, argvv);
        if (JS_IsException(instance))
        {
            return MaybeLocal<Value>();
        }
        JS_FreeValue(ctx, constructor);
        return MaybeLocal<Value>(Data(isolate_, isolate_->push_steal(instance)));
    }

    Local<Object> Object::New(Isolate* isolate)
    {
        JSContext* ctx = isolate->ctx();
        return Local<Object>(Data(isolate, isolate->push_steal(JS_NewObject(ctx))));
    }

    MaybeLocal<Value> Object::GetOwnPropertyDescriptor(Local<Context> context, Local<Name> key) const
    {
        JSContext* ctx = isolate_->ctx();
        const JSValue self = (JSValue) *this;
        const JSAtom prop = JS_ValueToAtom(ctx, (JSValue) key);
        JSPropertyDescriptor desc;
        const int res = JS_GetOwnProperty(ctx, &desc, self, prop);
        JS_FreeAtom(ctx, prop);
        if (res == -1)
        {
            return MaybeLocal<Value>();
        }
        // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/getOwnPropertyDescriptor
        const JSValue desc_js = JS_NewObject(ctx);

        // JSValues in desc are free-ed by set
        jsb_ensure(JS_SetProperty(ctx, desc_js, jsb::impl::JS_ATOM_get, desc.getter) != -1);
        jsb_ensure(JS_SetProperty(ctx, desc_js, jsb::impl::JS_ATOM_set, desc.setter) != -1);
        jsb_ensure(JS_SetProperty(ctx, desc_js, jsb::impl::JS_ATOM_value, desc.value) != -1);

        // property flags
        jsb_ensure(JS_SetProperty(ctx, desc_js, jsb::impl::JS_ATOM_configurable, JS_MKVAL(JS_TAG_BOOL, !!(desc.flags & JS_PROP_CONFIGURABLE))) != -1);
        jsb_ensure(JS_SetProperty(ctx, desc_js, jsb::impl::JS_ATOM_writable, JS_MKVAL(JS_TAG_BOOL, !!(desc.flags & JS_PROP_WRITABLE))) != -1);
        jsb_ensure(JS_SetProperty(ctx, desc_js, jsb::impl::JS_ATOM_enumerable, JS_MKVAL(JS_TAG_BOOL, !!(desc.flags & JS_PROP_ENUMERABLE))) != -1);

        return MaybeLocal<Value>(Data(isolate_, isolate_->push_steal(desc_js)));
    }

    JSValue Object::_lazy(JSContext* ctx, JSValue this_val, int argc, JSValue* argv, int magic, JSValue* func_data)
    {
        Isolate* isolate = (Isolate*) JS_GetContextOpaque(ctx);
        JSValue rvo;

        // evaluate lazy callback
        {
            const AccessorNameGetterCallback getter = (AccessorNameGetterCallback) JS_VALUE_GET_PTR(func_data[1]);
            HandleScope handle_scope(isolate);

            const uint16_t rvo_pos = isolate->push_copy(JS_UNDEFINED); // return value
            const PropertyCallbackInfo<Value> info(isolate, rvo_pos);
            const Local<Name> prop_v(Data(isolate, isolate->push_copy(func_data[0])));

            getter(prop_v, info);
            rvo = JS_DupValue(isolate->ctx(), isolate->stack_val(rvo_pos));
            jsb_check(!JS_IsException(rvo));
        }

        // overwrite the current lazy getter with rvo
        {
            const JSAtom prop = JS_ValueToAtom(ctx, func_data[0]);
            constexpr int flags = JS_PROP_HAS_CONFIGURABLE | JS_PROP_HAS_ENUMERABLE | JS_PROP_HAS_VALUE;
            JS_DefineProperty(ctx, this_val, prop, JS_DupValue(ctx, rvo), JS_UNDEFINED, JS_UNDEFINED, flags);
            JS_FreeAtom(ctx, prop);
        }

        return rvo;
    }

    Maybe<bool> Object::SetLazyDataProperty(Local<Context> context, Local<Name> name, AccessorNameGetterCallback getter)
    {
        JSContext* ctx = isolate_->ctx();
        const JSValue this_obj = (JSValue) *this;
        const JSAtom prop = JS_ValueToAtom(ctx, (JSValue) name);
        constexpr int flags = JS_PROP_HAS_CONFIGURABLE | JS_PROP_HAS_ENUMERABLE | JS_PROP_HAS_GET;
        JSValue lazy_data[] = { JS_DupValue(ctx, (JSValue) name), JS_MKPTR(jsb::impl::JS_TAG_EXTERNAL, (void *) getter) };
        const JSValue lazy = JS_NewCFunctionData(ctx, _lazy, 0, 0, ::std::size(lazy_data), lazy_data);

        const int res = JS_DefineProperty(ctx, this_obj, prop, JS_UNDEFINED, lazy, JS_UNDEFINED, flags);
        JS_FreeAtom(ctx, prop);

        if (res != -1) return Maybe<bool>(!!res);
        return Maybe<bool>();
    }

    Maybe<bool> Object::DefineOwnProperty(Local<Context> context, Local<Name> key, Local<Value> value, PropertyAttribute attributes)
    {
        JSContext* ctx = isolate_->ctx();
        const JSValue this_obj = (JSValue) *this;
        const JSAtom prop = JS_ValueToAtom(ctx, (JSValue) key);
        const JSValue val = (JSValue) value;
        int flags = JS_PROP_HAS_VALUE;
        if ((attributes & DontEnum) == 0) flags |= JS_PROP_HAS_ENUMERABLE;
        if ((attributes & ReadOnly) == 0) flags |= JS_PROP_HAS_WRITABLE;
        if ((attributes & DontDelete) == 0) flags |= JS_PROP_HAS_CONFIGURABLE;

        const int res = JS_DefineProperty(ctx, this_obj, prop, val, JS_UNDEFINED, JS_UNDEFINED, flags);
        JS_FreeAtom(ctx, prop);

        if (res != -1) return Maybe<bool>(!!res);
        return Maybe<bool>();
    }

    void Object::SetAccessorProperty(Local<Name> name, Local<FunctionTemplate> getter, Local<FunctionTemplate> setter)
    {
        JSContext* ctx = isolate_->ctx();
        const JSValue this_obj = (JSValue) *this;
        const JSAtom prop = JS_ValueToAtom(ctx, (JSValue) name);
        int flags = JS_PROP_HAS_ENUMERABLE | JS_PROP_HAS_CONFIGURABLE; //TODO consider remove 'configurable' flags
        if (!getter.IsEmpty()) flags |= JS_PROP_HAS_GET;
        if (!setter.IsEmpty()) flags |= JS_PROP_HAS_SET | JS_PROP_HAS_WRITABLE;

        const int res = JS_DefineProperty(ctx, this_obj, prop, JS_UNDEFINED, JS_DupValue(ctx, (JSValue) getter), JS_DupValue(ctx, (JSValue) setter), flags);
        JS_FreeAtom(ctx, prop);

        jsb_check(res >= 0);
    }

    // key_conversion is not available in quickjs.impl
    MaybeLocal<Array> Object::GetOwnPropertyNames(Local<Context> context, PropertyFilter filter, KeyConversionMode key_conversion)
    {
        JSContext* ctx = isolate_->ctx();
        JSPropertyEnum *tab;
        uint32_t len;

        int flags = JS_GPN_ENUM_ONLY;
        if ((filter & SKIP_STRINGS) == 0) flags |= JS_GPN_STRING_MASK;
        if ((filter & SKIP_SYMBOLS) == 0) flags |= JS_GPN_SYMBOL_MASK;

        if (JS_GetOwnPropertyNames(ctx, &tab, &len, (JSValue) *this, flags) < 0)
        {
            return MaybeLocal<Array>();
        }

        // build the name table
        const JSValue array = JS_NewArray(ctx);

        for(uint32_t i = 0; i < len; ++i)
        {
            JS_SetPropertyUint32(ctx, array, i, JS_AtomToValue(ctx, tab[i].atom));

            // cleanup
            JS_FreeAtom(ctx, tab[i].atom);
        }
        js_free(ctx, tab);

        return MaybeLocal<Array>(Data(isolate_, isolate_->push_steal(array)));
    }

}