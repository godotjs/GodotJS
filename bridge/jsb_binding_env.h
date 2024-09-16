#ifndef GODOTJS_BINDING_ENV_H
#define GODOTJS_BINDING_ENV_H
#include "jsb_pch.h"
#include "../internal/jsb_function_pointer.h"

namespace jsb
{
    //TODO rename it
	struct FBindingEnv
	{
		class Environment* env;
		StringName type_name;

		v8::Isolate* isolate;
		const v8::Local<v8::Context>& context;

		internal::CFunctionPointers& function_pointers;

	    class Environment* operator->() const { return env; }
	};

	typedef NativeClassID (*ClassRegisterFunc)(const FBindingEnv& p_env);

}

#endif
