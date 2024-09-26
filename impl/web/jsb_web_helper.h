#ifndef GODOTJS_WEB_HELPER_H
#define GODOTJS_WEB_HELPER_H

#include "jsb_web_handle_scope.h"

#include "jsb_web_interop.h"
#include "jsb_web_isolate.h"
#include "jsb_web_primitive.h"

#include "../../internal/jsb_macros.h"

#include "core/string/ustring.h"

namespace jsb::impl
{
    class Helper
    {
    public:
        template<size_t N>
        jsb_force_inline static v8::Local<v8::String> new_string(v8::Isolate* isolate, const char (&literal)[N])
        {
            return new_string(isolate, String(literal));
        }

        jsb_force_inline static v8::Local<v8::String> new_string(v8::Isolate* isolate, const String& p_str)
        {
            const CharString str8 =  p_str.utf8();
            return v8::Local<v8::String>(isolate, isolate->top_->depth_, jsapi_stack_push_string(isolate->id_, str8.get_data()));
        }

        jsb_force_inline static v8::Local<v8::String> new_string_ascii(v8::Isolate* isolate, const String& p_str)
        {
            const CharString str8 = p_str.ascii();
            return v8::Local<v8::String>(isolate, isolate->top_->depth_, jsapi_stack_push_string(isolate->id_, str8.get_data()));
        }
    };
}
#endif
