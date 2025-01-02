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
        struct Atom
        {
        private:
            JSContext* ctx_;
            JSAtom atom_;

        public:
            Atom(JSContext* ctx, JSValueConst value)
                : ctx_(ctx), atom_(JS_ValueToAtom(ctx, value))
            {
            }

            ~Atom()
            {
                JS_FreeAtom(ctx_, atom_);
            }

            operator JSAtom() const { return atom_; }
        };

        static void MarkExceptionAsTrivial(JSContext* ctx)
        {
            const JSValue val = JS_GetException(ctx);
#if JSB_DEBUG
            if (!IsNotErrorThrown(val))
            {
                JSB_QUICKJS_LOG(Verbose, "removed a trivial exception: %s", GetString(ctx, val));
            }
#endif
            JS_FreeValue(ctx, val);
        }

        static bool IsNotErrorThrown(JSValueConst value)
        {
#if JSB_PREFER_QUICKJS_NG
            return JS_IsNull(value) || JS_IsUninitialized(value);
#else
            return JS_IsNull(value);
#endif
        }

        static bool IsNullish(JSValueConst value)
        {
            return JS_IsNull(value) || JS_IsUndefined(value);
        }

        static String GetString(JSContext* ctx, JSValueConst value)
        {
            size_t len;
            if (const char* str = JS_ToCStringLen(ctx, &len, value))
            {
                const String rval = String::utf8(str, (int) len);
                JS_FreeCString(ctx, str);
                return rval;
            }

            // silently ignore the error
            const JSValue val = JS_GetException(ctx);
            JS_FreeValue(ctx, val);
            return String();
        }

        static bool Equals(JSValueConst a, JSValueConst b)
        {
            if (JS_VALUE_GET_TAG(a) != JS_VALUE_GET_TAG(b)) return false;

            //TODO unsafe eq check
            if (JS_VALUE_GET_PTR(a) != JS_VALUE_GET_PTR(b)) return false;
            return true;
        }

        static int _RefCount(JSValueConst value)
        {
            if (!JS_VALUE_HAS_REF_COUNT(value)) return 0;
#if JSB_PREFER_QUICKJS_NG
            // unsafe
            typedef struct JSRefCountHeader {
                int ref_count;
            } JSRefCountHeader;
#endif
            const JSRefCountHeader *p = (JSRefCountHeader *)JS_VALUE_GET_PTR(value);
            return p ? p->ref_count : 0;
        }
    };
}
#endif
