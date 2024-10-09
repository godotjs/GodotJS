#ifndef GODOTJS_QUICKJS_HANDLE_H
#define GODOTJS_QUICKJS_HANDLE_H

#include "jsb_quickjs_pch.h"
#include "jsb_quickjs_data.h"

namespace v8
{
    template <typename T>
    class Global;

    template <typename T>
    class Local
    {
        template <typename U>
        friend class Global<U>;

    public:
        Data data;
    };

    template <typename T>
    class Global
    {
    public:

    private:
        jsb::internal::Index64 _persistent_id;
    };
}

#endif
