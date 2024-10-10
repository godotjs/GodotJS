#include "jsb_quickjs_array.h"

#include "jsb_quickjs_typedef.h"
#include "jsb_quickjs_isolate.h"

namespace v8
{
    uint32_t Array::Length() const
    {
        JSContext* ctx = isolate_->ctx();
        const JSValue val = isolate_->operator[](stack_pos_);
        const JSValue len = JS_GetProperty(ctx, val, jsb::impl::JS_ATOM_length);
        if (JS_IsException(len))
        {
            return 0;
        }

        uint32_t rval;
        JS_ToUint32(ctx, &rval, len);
        JS_FreeValue(ctx, len);
        return rval;
    }

}
