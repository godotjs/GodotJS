#ifndef GODOTJS_BINDING_ENV_H
#define GODOTJS_BINDING_ENV_H
#include "jsb_bridge_pch.h"

namespace jsb
{
    class Environment;

    //TODO rename it
	struct FBindingEnv
	{
		Environment* env;
		StringName type_name;

		v8::Isolate* isolate;
		const v8::Local<v8::Context>& context;

		internal::CFunctionPointers& function_pointers;

	    Environment* operator->() const { return env; }
	};

	typedef NativeClassID (*ClassRegisterFunc)(const FBindingEnv& p_env);

}

#endif
