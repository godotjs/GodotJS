#include "jsb_extra_funcs.h"

#include "core/string/string_builder.h"
#include "modules/irisgame/iris_log_categories.h"

namespace jsb
{
#if JSB_EXTRA_CONSOLE_ENABLED
    JSValue ExtraFunctions::print(JSContext *ctx, JSValueConst this_val, int argc, JSValueConst *argv, int magic)
    {
        if (argc == 0 && magic >= 0)
        {
            return JS_UNDEFINED;
        }

        int i = 0;
        if (magic == (int)ELogSeverity::Assert)
        {
            if (JS_ToBool(ctx, argv[0]) == 1)
            {
                return JS_UNDEFINED;
            }

            i = 1;
        }

        if constexpr (true)
        {
            if (magic < 0 || LogJSRuntime::is_valid((uint8_t) magic))
            {
                static String splitter = " ";
                StringBuilder sb;
                size_t str_len;
                if (magic == (int)ELogSeverity::Assert)
                {
                    sb.append("Assertion failed: ");
                }

                for (; i < argc; i++)
                {
                    const char* pstr = JS_ToCStringLen(ctx, &str_len, argv[i]);
                    if (pstr != nullptr)
                    {
                        sb.append(String(pstr, (int) str_len));
                        JS_FreeCString(ctx, pstr);
                        if (i != argc - 1)
                        {
                            sb.append(splitter);
                        }
                    }
                }

                //TODO print stacktrace

                static const char *severity_names[] =
                {
#pragma push_macro("DEF")
#undef DEF
#define DEF(FieldName) #FieldName,
#include "../jsb_log_severity.h"
#pragma pop_macro("DEF")
                };

                JSB_CONSOLE(severity_names[magic], sb.as_string());
            }
        }
        return JS_UNDEFINED;
    }
#endif

}
