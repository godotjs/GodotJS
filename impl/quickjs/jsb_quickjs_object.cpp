#include "jsb_quickjs_object.h"
#include "jsb_quickjs_isolate.h"

namespace v8
{
    int Object::InternalFieldCount() const
    {
        const JSValue val = isolate_->operator[](stack_pos_);
        const jsb::internal::Index64 index = (jsb::internal::Index64)(uintptr_t) JS_GetOpaque(val, Isolate::get_class_id());
        const jsb::impl::InternalDataPtr data = isolate_->get_internal_data(index);
        return data->internal_field_count;
    }

    void Object::SetAlignedPointerInInternalField(int slot, void* value)
    {
        const JSValue val = isolate_->operator[](stack_pos_);
        const jsb::internal::Index64 index = (jsb::internal::Index64)(uintptr_t) JS_GetOpaque(val, Isolate::get_class_id());
        const jsb::impl::InternalDataPtr data = isolate_->get_internal_data(index);
        data->internal_fields[slot] = value;
    }

    void* Object::GetAlignedPointerFromInternalField(int slot) const
    {
        const JSValue val = isolate_->operator[](stack_pos_);
        const jsb::internal::Index64 index = (jsb::internal::Index64)(uintptr_t) JS_GetOpaque(val, Isolate::get_class_id());
        const jsb::impl::InternalDataPtr data = isolate_->get_internal_data(index);
        return data->internal_fields[slot];
    }

    Maybe<bool> Object::Set(Local<Context> context, uint32_t index, Local<Value> value)
    {
        const JSValue self = isolate_->operator[](stack_pos_);
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
        const JSValue self = isolate_->operator[](stack_pos_);
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
        const JSValue self = isolate_->operator[](stack_pos_);
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
        const JSValue self = isolate_->operator[](stack_pos_);
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

    Maybe<bool> Object::SetLazyDataProperty(Local<Context> context, Local<Name> name, AccessorNameGetterCallback getter)
    {
        //TODO
        /*
Object.defineProperty(b, "value", {
    get: function () {
        console.log("lazy get");
        Object.defineProperty(this, "value", {
            value: 1,
            enumerable: true,
            writable: false,
            configurable: true
        });
        return 1;
    },
    set: undefined,
    enumerable: true,
    writable: false,
    configurable: true
});
         */
    }

}
