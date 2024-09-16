#ifndef GODOTJS_PRIMITIVE_BINDINGS_REFLECT_H
#define GODOTJS_PRIMITIVE_BINDINGS_REFLECT_H

#include "jsb_pch.h"

#if !JSB_WITH_STATIC_BINDINGS
namespace jsb
{
    void register_primitive_bindings_reflect(class Environment* p_env);
}
#endif

#endif
