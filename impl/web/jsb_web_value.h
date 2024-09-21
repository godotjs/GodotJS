#ifndef GODOTJS_WEB_VALUE_H
#define GODOTJS_WEB_VALUE_H
#include <cstdint>

#include "jsb_web_primitive_data.h"

namespace v8
{
    class Isolate;
    class Context;

    template<typename T>
    class Local;

    template<typename T>
    class Maybe;

    class Value : public Data
    {
    public:
        Maybe<int32_t> Int32Value(const Local<Context>& context) const;
        Maybe<uint32_t> Uint32Value(const Local<Context>& context) const;
        Maybe<double> NumberValue(const Local<Context>& context) const;
        bool BooleanValue(Isolate* isolate) const;
    };
}
#endif
