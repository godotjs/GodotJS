#include "jsb_web_container.h"

#include "jsb_web_typedef.h"
#include "jsb_web_isolate.h"

namespace v8
{
    Local<Array> Array::New(Isolate* isolate, int length)
    {
        return Local<Array>(Data(isolate, jsbi_NewArray(isolate->rt())));
    }

    uint32_t Array::Length() const
    {
        const int len = jsbi_GetArrayLength(isolate_->rt(), stack_pos_);
        return (uint32_t)len;
    }

    size_t Map::Size() const
    {
        return jsbi_MapSize(isolate_->rt(), stack_pos_);
    }

    Local<Array> Map::AsArray() const
    {
        return Local<Array>(Data(isolate_, jsbi_MapAsArray(isolate_->rt(), stack_pos_)));
    }

    MaybeLocal<Value> Map::Get(Local<Context> context, Local<Value> key)
    {
        const jsb::impl::StackPosition result_sp = jsbi_MapGetEntry(isolate_->rt(), stack_pos_, key->stack_pos_);
        if (result_sp < 0)
        {
            return MaybeLocal<Value>();
        }
        return MaybeLocal<Value>(Data(isolate_, result_sp));
    }

    MaybeLocal<Map> Map::Set(Local<Context> context, Local<Value> key, Local<Value> value)
    {
        const jsb::impl::ResultValue res = jsbi_MapSetEntry(isolate_->rt(), stack_pos_, key->stack_pos_, value->stack_pos_);
        if (res == -1)
        {
            return MaybeLocal<Map>();
        }
        return MaybeLocal<Map>(Data(isolate_, stack_pos_));
    }

    Local<Map> Map::New(Isolate* isolate)
    {
        return Local<Map>(Data(isolate, jsbi_NewMap(isolate->rt())));
    }

    size_t Set::Size() const
    {
        // Reuse MapSize — it checks instanceof and returns .size for both Map and Set
        return jsbi_MapSize(isolate_->rt(), stack_pos_);
    }

    Local<Array> Set::AsArray() const
    {
        return Local<Array>(Data(isolate_, jsbi_SetAsArray(isolate_->rt(), stack_pos_)));
    }

    MaybeLocal<Set> Set::Add(Local<Context> context, Local<Value> key)
    {
        const jsb::impl::ResultValue res = jsbi_SetAdd(isolate_->rt(), stack_pos_, key->stack_pos_);
        if (res == -1)
        {
            return MaybeLocal<Set>();
        }
        return MaybeLocal<Set>(Data(isolate_, stack_pos_));
    }

    Local<Set> Set::New(Isolate* isolate)
    {
        return Local<Set>(Data(isolate, jsbi_NewSet(isolate->rt())));
    }

}
