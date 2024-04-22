#ifndef GODOTJS_HELPERS_H
#define GODOTJS_HELPERS_H
#include "jsb_pch.h"
namespace jsb
{
    class JavaScriptHelpers
    {
    public:
        static JSValue to_string(JSContext* ctx, const String& p_str)
        {
            const CharString cs = p_str.utf8();
            return JS_NewStringLen(ctx, cs.get_data(), cs.length());
        }

        static JSAtom to_atom(JSContext* ctx, const String& p_str)
        {
            const CharString cs = p_str.utf8();
            return JS_NewAtomLen(ctx, cs.get_data(), cs.length());
        }

        static String to_string(JSContext* ctx, const JSValue p_str)
        {
            size_t len;
            const char* raw = JS_ToCStringLen(ctx, &len, p_str);
            const String result(raw, (int) len);
            JS_FreeCString(ctx, raw);
            return result;
        }

        template<size_t kSize>
        static void free_values(JSContext* ctx, const JSValue (&p_values)[kSize])
        {
            for (int i = 0; i < kSize; ++i)
            {
                JS_FreeValue(ctx, p_values[i]);
            }
        }

    };
}
#endif
