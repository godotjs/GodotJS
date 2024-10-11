#include "jsb_quickjs_object.h"
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
        JS_SetPropertyUint32(isolate_->ctx(), self, index, JS_DupValue(isolate_->ctx(), (JSValue) value));
        return Maybe<bool>(true);
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
