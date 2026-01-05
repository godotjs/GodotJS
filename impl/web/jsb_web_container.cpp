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
        return (uint32_t) len;
    }

    MaybeLocal<Map> Map::Set(Local<Context> context, Local<Value> key, Local<Value> value)
    {
        const jsb::impl::ResultValue res = jsbi_SetProperty(isolate_->rt(), stack_pos_, key->stack_pos_, value->stack_pos_);
        if (res == -1)
        {
            return MaybeLocal<Map>();
        }
        return MaybeLocal<Map>(Data(isolate_, stack_pos_));
    }

    Local<Map> Map::New(Isolate* isolate)
    {
        return Local<Array>(Data(isolate, jsbi_NewMap(isolate->rt())));
    }

} // namespace v8
