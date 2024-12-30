#ifndef GODOTJS_WEB_EXT_H
#define GODOTJS_WEB_EXT_H
#include "jsb_web_pch.h"

namespace v8
{
    class Isolate;
}

namespace jsb::impl
{
    class BrowserJS
    {
    public:
        static String GetString(JSRuntime ctx, StackPosition value_sp)
        {
            int32_t len;
            if (char* str = jsbi_ToCStringLen(ctx, &len, value_sp))
            {
                String rval = String::utf8(str, (int) len);
                jsbi_free(str);
                return rval;
            }
            return String();
        }
    };
}
#endif
