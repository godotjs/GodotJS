#ifndef GODOTJS_PRIMITIVE_BINDINGS_STATIC_H
#define GODOTJS_PRIMITIVE_BINDINGS_STATIC_H
#include "jsb_bridge_pch.h"

namespace jsb
{
#if JSB_WITH_STATIC_BINDINGS
    class Environment;

    void register_primitive_bindings_static(Environment* p_env);
#endif
} // namespace jsb

#endif
