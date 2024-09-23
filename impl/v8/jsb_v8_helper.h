#ifndef GODOTJS_V8_HELPER_H
#define GODOTJS_V8_HELPER_H

#include "jsb_v8_headers.h"

#include "../../internal/jsb_logger.h"
#include "../../internal/jsb_macros.h"

namespace jsb::impl
{
    class Helper
    {
    public:
        static v8::MaybeLocal<v8::Value> compile_run(const v8::Local<v8::Context>& context, const char* p_source, int p_source_len, const String& p_filename)
        {
            v8::Isolate* isolate = context->GetIsolate();
            v8::MaybeLocal<v8::Script> script;
            const v8::Local<v8::String> source = v8::String::NewFromUtf8(isolate, p_source, v8::NewStringType::kNormal, p_source_len).ToLocalChecked();

            if (p_filename.is_empty())
            {
                script = v8::Script::Compile(context, source);
            }
            else
            {
#if WINDOWS_ENABLED
                const CharString filename = p_filename.replace("/", "\\").utf8();
#else
                const CharString filename = p_filename.utf8();
#endif
                v8::ScriptOrigin origin(isolate, v8::String::NewFromUtf8(isolate, filename, v8::NewStringType::kNormal, filename.length()).ToLocalChecked());
                script = v8::Script::Compile(context, source, &origin);
            }

            if (script.IsEmpty())
            {
                return {};
            }

            const v8::MaybeLocal<v8::Value> maybe_value = script.ToLocalChecked()->Run(context);
            if (maybe_value.IsEmpty())
            {
                return {};
            }

            JSB_LOG(VeryVerbose, "script compiled %s", p_filename);
            return maybe_value;
        }
    };
}

#endif

