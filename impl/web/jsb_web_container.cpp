#include "jsb_web_container.h"
#include "jsb_web_local_handle.h"
#include "jsb_web_maybe.h"

namespace v8
{
    Local<Array> Array::New(Isolate* isolate, int length)
    {
        //TODO
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
