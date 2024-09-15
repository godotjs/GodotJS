#ifndef GODOTJS_WEB_VM_H
#define GODOTJS_WEB_VM_H

#include <emscripten/emscripten.h>
#include <cstdint>

namespace jsb::vm
{
    namespace internal
    {
        struct Any
        {
            uint32_t address;
        };
    }

    struct FunctionCallbackInfo
    {

    };
}

namespace v8
{
    template<typename T>
    class Local
    {

    };

    template<typename T>
    class Global
    {

    };
}

extern "C" {

}

#endif
