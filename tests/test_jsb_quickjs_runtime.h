#ifndef GODOTJS_TESTS_JSB_QUICKJS_RUNTIME_H
#define GODOTJS_TESTS_JSB_QUICKJS_RUNTIME_H

#include "jsb_test_helpers.h"
#include "../bridge/jsb_builtins.h"
#include "../bridge/jsb_essentials.h"

#if JSB_WITH_QUICKJS
// all quickjs.impl specific test cases
namespace jsb::tests
{
    struct QuickJSBindings
    {
        static JSValue magic_call(JSContext* ctx, JSValueConst this_val, int argc, JSValueConst* argv, int magic)
        {
            CHECK(magic == 1);
            return JS_UNDEFINED;
        }
    };

    TEST_CASE("[jsb] quickjs.minimal")
    {
        JSRuntime* rt = JS_NewRuntime();
        JSContext* ctx = JS_NewContext(rt);
        {
            const JSValue this_obj = JS_NewObject(ctx);
            const JSValue func = JS_NewCFunctionMagic(ctx, QuickJSBindings::magic_call, "magic_call", 0, JS_CFUNC_generic_magic, 1);
            const JSAtom prop = JS_NewAtom(ctx, "prop");

            CHECK(JS_IsFunction(ctx, func));
            CHECK(prop != JS_ATOM_NULL);
            CHECK(impl::QuickJS::_RefCount(func) == 1);
            constexpr int flags = JS_PROP_HAS_ENUMERABLE | JS_PROP_HAS_CONFIGURABLE | JS_PROP_HAS_GET;
            CHECK(JS_DefineProperty(ctx, this_obj, prop, JS_UNDEFINED, func, JS_UNDEFINED, flags) == 1);
            CHECK(impl::QuickJS::_RefCount(func) == 2);

            JS_FreeValue(ctx, func);
            JS_FreeAtom(ctx, prop);
            JS_FreeValue(ctx, this_obj);
        }
        JS_FreeContext(ctx);
        JS_FreeRuntime(rt);
    }
}
#endif

#endif

