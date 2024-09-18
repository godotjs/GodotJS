#ifndef GODOTJS_WEB_LOCAL_HANDLE_H
#define GODOTJS_WEB_LOCAL_HANDLE_H
#include "jsb_web_handle.h"

namespace v8
{
    template<typename T>
    class Local : public internal::Handle
    {

    };
}

#endif
