#include "jsb_builtin_funcs.h"
#include "jsb_environment.h"
#include "core/string/string_builder.h"

namespace jsb
{
    JSValue BuiltinFunctions::require(JSContext* ctx, JSValue this_val, int argc, JSValue* argv, int magic)
    {
        if (argc < 1 || !JS_IsString(argv[0]))
        {
            return JS_ThrowInternalError(ctx, "not a valid module id");
        }

        const int parent_module_index = magic;
        size_t len;
        const char* str = JS_ToCStringLen(ctx, &len, argv[0]);
        const String module_id(str, (int) len);
        JS_FreeCString(ctx, str);
        Environment* runtime = (Environment*)JS_GetContextOpaque(ctx);
        jsb_check(runtime);
        return runtime->resolve_module(module_id, parent_module_index);
    }

}
