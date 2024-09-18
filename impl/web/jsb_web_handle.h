#ifndef GODOTJS_WEB_HANDLE_H
#define GODOTJS_WEB_HANDLE_H

#include <cstdint>

namespace v8::internal
{
    namespace Type
    {
        enum : uint8_t
        {
            Unknown,
        };
    }

    struct Handle
    {
        union
        {
            uint32_t address; // object slot id
        };

        //TODO value access
    };
}

#endif
