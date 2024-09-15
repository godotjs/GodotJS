#ifndef GODOTJS_QUICKJS_HANDLE_H
#define GODOTJS_QUICKJS_HANDLE_H

#include "jsb_quickjs_pch.h"

namespace v8
{
    class HandleBase
    {

    };

    template<typename T> class Global;

    template<typename T>
    class Local : public HandleBase
    {
        template<typename U>
        friend class Global<U>;

    };

    template<typename T>
    class Global
    {
    public:

    private:
        jsb::internal::Index64 _persistent_id;
    };
}

#endif
