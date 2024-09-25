#ifndef GODOTJS_CLASS_REGISTER_H
#define GODOTJS_CLASS_REGISTER_H

#include "jsb_bridge_pch.h"
#include "jsb_environment.h"

namespace jsb
{
    struct ClassRegister
    {
        Environment* env;
        StringName type_name;

        v8::Isolate* isolate;
        const v8::Local<v8::Context>& context;

        Environment* operator->() const { return env; }

        template<typename Func>
        jsb_force_inline uint32_t add_free_function(Func func)
        {
            return env->function_pointers_.add(func);
        }
    };
}

#endif
