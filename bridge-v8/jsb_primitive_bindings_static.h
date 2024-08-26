#ifndef GODOTJS_PRIMITIVE_BINDINGS_STATIC_H
#define GODOTJS_PRIMITIVE_BINDINGS_STATIC_H
#include "jsb_pch.h"

namespace jsb
{
#if JSB_WITH_STATIC_BINDINGS
	void register_primitive_bindings_static(class Realm* p_realm);
#endif
}

#endif
