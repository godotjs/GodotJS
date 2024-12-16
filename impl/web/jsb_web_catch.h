#ifndef GODOTJS_WEB_CATCH_H
#define GODOTJS_WEB_CATCH_H

#include "core/string/ustring.h"

namespace v8
{
    class Isolate;
}

namespace jsb::impl
{
    class TryCatch
    {
    public:
        v8::Isolate* isolate_;

        TryCatch(v8::Isolate* isolate) : isolate_(isolate) {}
        ~TryCatch() = default;

        v8::Isolate* get_isolate() const { return isolate_; }

        bool has_caught() const;
        void get_message(String* r_message, String* r_stacktrace = nullptr) const;
    };
}
#endif
