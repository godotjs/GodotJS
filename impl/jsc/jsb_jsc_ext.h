#ifndef GODOTJS_JSC_EXT_H
#define GODOTJS_JSC_EXT_H
#include "jsb_jsc_pch.h"
#include "jsb_jsc_typedef.h"

namespace v8
{
    class Isolate;
}

namespace jsb::impl
{
    class JavaScriptCore
    {
    public:
        // [unsafe] forcibly cast JSValueRef to JSObjectRef
        static JSObjectRef AsObject(JSContextRef ctx, JSValueRef val)
        {
            // return JSValueToObject(ctx, val, nullptr);
            if (val) return JSValueToObject(ctx, val, nullptr);
            // if (JSValueIsObject(ctx, val)) return (JSObjectRef) val;
            return nullptr;
        }

        static void SetContextOpaque(JSContextRef ctx, void* data)
        {
            const JSObjectRef globalObject = JSContextGetGlobalObject(ctx);
            JSObjectSetPrivate(globalObject, data);
        }

        static void* GetContextOpaque(JSContextRef ctx)
        {
            const JSObjectRef globalObject = JSContextGetGlobalObject(ctx);
            return JSObjectGetPrivate(globalObject);
        }

        static void MarkExceptionAsTrivial(JSContextRef ctx, JSValueRef error)
        {
            if (!error)
            {
                return;
            }
            if (const JSStringRef str = JSValueToStringCopy(ctx, error, nullptr))
            {
                const size_t cap = JSStringGetMaximumUTF8CStringSize(str);
                char* buf = (char*) memalloc(cap);
                const size_t len = JSStringGetUTF8CString(str, buf, cap);
                jsb_unused(len);
                JSB_JSC_LOG(Verbose, "ignoring trivial error: %s", buf);
                JSStringRelease(str);
            }
        }

        template<bool kProtected>
        static JSValueRef MakeUTF8String(JSContextRef ctx, const char* p_str)
        {
            const JSStringRef str = JSStringCreateWithUTF8CString(p_str);
            const JSValueRef val = JSValueMakeString(ctx, str);
            JSStringRelease(str);
            if constexpr (kProtected)
            {
                JSValueProtect(ctx, val);
            }
            return val;
        }

        static String GetString(JSContextRef ctx, JSValueRef value)
        {
            if (value)
            {
                if (const JSStringRef str = JSValueToStringCopy(ctx, value, nullptr))
                {
                    const size_t cap = JSStringGetMaximumUTF8CStringSize(str);
                    char* buf = (char*) memalloc(cap);
                    const size_t len = JSStringGetUTF8CString(str, buf, cap);
                    JSStringRelease(str);
                    jsb_check(len > 0 && (size_t)(int) len == len);
                    return String(buf, (int) (len - 1));
                }
            }
            return String();
        }
    };
}
#endif
