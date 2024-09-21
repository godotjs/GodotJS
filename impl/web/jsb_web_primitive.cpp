#include "jsb_web_primitive.h"

#include "jsb_web_handle_scope.h"
#include "jsb_web_isolate.h"
#include "core/error/error_macros.h"

namespace v8
{
    Local<Primitive> Undefined(Isolate* isolate)
    {
        return Local<Primitive>(isolate, isolate->top_->depth_, 0);
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

    Local<Integer> Integer::NewFromUnsigned(Isolate* isolate, uint32_t value)
    {
        return Local<Integer>(isolate, isolate->top_->depth_, jsapi_stack_push_int(isolate->id_, (int32_t) value));
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

    Local<External> External::New(Isolate* isolate, void* data)
    {
        //TODO
    }

    MaybeLocal<String> String::NewFromUtf8(Isolate* isolate, const char* data, NewStringType type, int length)
    {
        //TODO
    }

    Local<String> String::Empty(Isolate* isolate)
    {
        //TODO
    }

    int String::Length() const
    {
        //TODO
    }

    String::Utf8Value::Utf8Value(Isolate* isolate, Local<Value> obj)
    {
        //TODO
    }

    String::Utf8Value::~Utf8Value()
    {
        //TODO
    }

    String::Value::Value(Isolate* isolate, Local<Value> obj)
    {
        //TODO
    }

    String::Value::~Value()
    {
        //TODO
    }

}
