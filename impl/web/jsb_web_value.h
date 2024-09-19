#ifndef GODOTJS_WEB_VALUE_H
#define GODOTJS_WEB_VALUE_H
#include <cstdint>

namespace jsb::vm
{
    struct JSValue
    {
        enum Type : uint8_t
        {
            Array = -5,
            Object = -4,
            Function  = -3,
            String = -2,
            Symbol = -1,

            Uninitialized = 0,
            Null,
            Undefined,
            Int,
            Float,
            Bool,

        };

        union
        {
            int32_t int32;
            double float64;
            void* ptr; // managed by JS engine
        } u;
        Type type;
    };
}
#endif

