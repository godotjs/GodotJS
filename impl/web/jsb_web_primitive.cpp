#include "jsb_web_primitive.h"
#include "jsb_web_isolate.h"
#include "core/error/error_macros.h"

namespace v8
{
    Local<Primitive> Undefined(Isolate* isolate)
    {
        return Local<Primitive>(isolate, isolate->top_->depth_, jsapi_stack_push_undefined(isolate->id_));
    }

    Local<Primitive> Null(Isolate* isolate)
    {
        return Local<Primitive>(isolate, isolate->top_->depth_, jsapi_stack_push_null(isolate->id_));
    }

    int64_t Int32::Value() const
    {
        return ::jsapi_sv_to_integer(isolate_->id_, stack_, index_);
    }

    Local<Boolean> Boolean::New(Isolate* isolate, bool value)
    {
        return Local<Boolean>(isolate, isolate->top_->depth_, jsapi_stack_push_boolean(isolate->id_, value));
    }

    Local<Int32> Int32::New(Isolate* isolate, int32_t value)
    {
        return Local<Int32>(isolate, isolate->top_->depth_, jsapi_stack_push_int(isolate->id_, value));
    }

    Local<Int32> Int32::New(Isolate* isolate, uint32_t value)
    {
        return Local<Int32>(isolate, isolate->top_->depth_, jsapi_stack_push_int(isolate->id_, (int32_t) value));
    }

    Local<Symbol> Symbol::New(Isolate* isolate)
    {
        return Local<Symbol>(isolate, isolate->top_->depth_, jsapi_stack_push_symbol(isolate->id_));
    }

    Local<Number> Number::New(Isolate* isolate, double value)
    {
        return Local<Number>(isolate, isolate->top_->depth_, jsapi_stack_push_number(isolate->id_, value));
    }

    Local<Object> Object::New(Isolate* isolate)
    {
        return Local<Object>(isolate, isolate->top_->depth_, jsapi_stack_push_object(isolate->id_));
    }

    Local<External> External::New(Isolate* isolate, void* data)
    {
        //TODO
    }

    MaybeLocal<String> String::NewFromUtf8(Isolate* isolate, const char* data, NewStringType type, int length)
    {
        //TODO
    }

    int Object::InternalFieldCount() const
    {
        return jsapi_sv_internal_num(isolate_->id_, stack_, index_);
    }

    void Object::SetAlignedPointerInInternalField(int slot, void* value)
    {
        CRASH_COND_MSG(slot != 0 && slot != 1, "not supported");
        jsapi_sv_internal_set(isolate_->id_, stack_, index_, slot, value);
    }

    void* Object::GetAlignedPointerFromInternalField(int slot)
    {
        CRASH_COND_MSG(slot != 0 && slot != 1, "not supported");
        return jsapi_sv_internal_get(isolate_->id_, stack_, index_, slot);
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

    MaybeLocal<Value> Function::Call(Local<Context> context, Local<Value> recv, int argc, Local<Value> argv[])
    {
        //TODO
    }

}
