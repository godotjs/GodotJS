#ifndef JAVASCRIPT_EXCEPTION_INFO_H
#define JAVASCRIPT_EXCEPTION_INFO_H

#include "jsb_pch.h"
#include "jsb_environment.h"

namespace jsb
{
    struct JavaScriptExceptionInfo
    {
        bool handled_;
        String message_;

        jsb_force_inline operator bool() const { return handled_; }
        jsb_force_inline operator String() const { return message_; }

        JavaScriptExceptionInfo() : handled_(false) {}
        JavaScriptExceptionInfo(JavaScriptExceptionInfo&&) = default;
        JavaScriptExceptionInfo& operator=(JavaScriptExceptionInfo&&) = default;

        JavaScriptExceptionInfo(v8::Isolate* p_isolate, const v8::TryCatch& p_catch, bool p_accept_message = true) : handled_(false)
        {
            if (!p_catch.HasCaught())
            {
                return;
            }

            handled_ = true;
            v8::Local<v8::Context> context = p_isolate->GetCurrentContext();
            if (p_accept_message)
            {
                v8::Local<v8::Message> message = p_catch.Message();
                const v8::String::Utf8Value message_utf8(p_isolate, message->Get());
                message_ = String::utf8(*message_utf8, message_utf8.length());
            }

            v8::Local<v8::Value> stack_trace;
            if (!p_catch.StackTrace(context).ToLocal(&stack_trace))
            {
                return;
            }

            v8::String::Utf8Value stack_trace_utf8(p_isolate, stack_trace);
            if (stack_trace_utf8.length() == 0)
            {
                return;
            }

            Environment* environment = Environment::wrap(p_isolate);
            if (!message_.is_empty()) message_ += "\n";
            message_ += environment->handle_source_map(String(*stack_trace_utf8, stack_trace_utf8.length()));
        }
    };

}

#endif
