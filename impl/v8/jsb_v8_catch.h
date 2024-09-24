#ifndef GODOTJS_V8_CATCH_H
#define GODOTJS_V8_CATCH_H

#include "core/string/ustring.h"
#include "jsb_v8_pch.h"

namespace jsb::impl
{
    struct TryCatch
    {
    private:
        v8::Isolate* isolate_;
        v8::TryCatch try_catch_;

    public:
        TryCatch(v8::Isolate* isolate) : isolate_(isolate), try_catch_(isolate) {}

        TryCatch(const TryCatch&) = delete;
        TryCatch& operator=(const TryCatch&) = delete;
        TryCatch(TryCatch&&) = delete;
        TryCatch& operator=(TryCatch&&) = delete;

        v8::Isolate* get_isolate() const { return isolate_; }

        bool has_caught() const { return try_catch_.HasCaught(); }

        void get_message(String* r_message, String* r_stacktrace = nullptr) const
        {
            const v8::Local<v8::Message> message = try_catch_.Message();
            if (message.IsEmpty())
            {
                if (r_message) *r_message = "";
                if (r_stacktrace) *r_stacktrace = "";
                return;
            }

            v8::Isolate* isolate = isolate_;
            const v8::Local<v8::Context> context = isolate->GetCurrentContext();
            if (r_message)
            {
                *r_message = Helper::to_string(isolate, message->Get());
            }

            if (r_stacktrace)
            {
                if (v8::Local<v8::Value> stack_trace; try_catch_.StackTrace(context).ToLocal(&stack_trace))
                {
                    *r_stacktrace = Helper::to_string(isolate, stack_trace);
                }
            }
        }
    };
}
#endif
