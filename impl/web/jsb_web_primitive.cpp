#include "jsb_web_primitive.h"
#include "jsb_web_isolate.h"
#include "core/error/error_macros.h"

namespace v8
{
    int64_t Int32::Value() const
    {
        const jsb::vm::JSValue& jv = isolate_->get_value(address_);
        CRASH_COND(jv.type != jsb::vm::JSValue::Int);
        return jv.u.int32;
    }

    Local<Int32> Int32::New(Isolate* isolate, int32_t value)
    {
        jsb::vm::JSValue jv;
        jv.type = jsb::vm::JSValue::Int;
        jv.u.int32 = value;
        return Local<Int32>(isolate, isolate->alloc_value(jv));
    }

    Local<Int32> Int32::New(Isolate* isolate, uint32_t value)
    {
        jsb::vm::JSValue jv;
        jv.type = jsb::vm::JSValue::Int;
        jv.u.int32 = (int32_t) value;
        return Local<Int32>(isolate, isolate->alloc_value(jv));
    }

    Local<Symbol> Symbol::New(Isolate* isolate)
    {
        jsb::vm::JSValue jv;
        jv.type = jsb::vm::JSValue::Symbol;
        jv.u.ptr = ::jsb_web_new_symbol(isolate->id_);
        const uint32_t addr = isolate->alloc_value(jv);
        ::jsb_web_value_remove_ref(isolate->id_, jv.u.ptr);
        return Local<Symbol>(isolate, addr);
    }

    Local<Object> Object::New(Isolate* isolate)
    {
        jsb::vm::JSValue jv;
        jv.type = jsb::vm::JSValue::Object;
        jv.u.ptr = ::jsb_web_new_object(isolate->id_);
        const uint32_t addr = isolate->alloc_value(jv);
        ::jsb_web_value_remove_ref(isolate->id_, jv.u.ptr);
        return Local<Object>(isolate, addr);
    }

    void Object::SetAlignedPointerInInternalField(int index, void* value)
    {
        CRASH_COND_MSG(index != 0 && index != 1, "not supported");
        jsb::vm::JSValue& jv = isolate_->_at(address_);
        CRASH_COND(jv.type >= 0);
        ::jsb_web_value_set_internal_field(isolate_->id_, jv.u.ptr, index, value);
    }

    Maybe<bool> Object::Set(const Local<Context>& context, Local<Value> key, Local<Value> value)
    {
        //TODO
        return Maybe<bool>(true);
    }

    MaybeLocal<Value> Object::Get(const Local<Context>& context, Local<Value> key)
    {
        //TODO
        return {};
    }

    uint32_t Array::Length() const
    {
        //TODO
        return 0;
    }

    Maybe<bool> Array::Set(const Local<Context>& context, uint32_t index, Local<Value> value)
    {
        //TODO
        return {};
    }

}
