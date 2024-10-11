#ifndef GODOTJS_QUICKJS_EXT_H
#define GODOTJS_QUICKJS_EXT_H
#include "jsb_quickjs_pch.h"

namespace v8
{
    class Isolate;
}

namespace jsb::impl
{
    class QuickJS
    {
    public:
        static bool IsNullish(JSValueConst value)
        {
            return JS_IsNull(value) || JS_IsUndefined(value);
        }

        static String GetString(JSContext* ctx, JSValueConst value)
        {
            size_t len;
            const char* str = JS_ToCStringLen(ctx, &len, value);
            String rval = String::utf8(str, (int) len);
            JS_FreeCString(ctx, str);
            return rval;
        }
    };
}
#endif
