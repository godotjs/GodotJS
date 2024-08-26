#ifndef GODOTJS_BINDING_ENV_H
#define GODOTJS_BINDING_ENV_H
#include "jsb_pch.h"
#include "../internal/jsb_function_pointer.h"

namespace jsb
{
	struct FBindingEnv
	{
		class Environment* environment;
		class Realm* realm;
		StringName type_name;

		v8::Isolate* isolate;
		const v8::Local<v8::Context>& context;

		internal::CFunctionPointers& function_pointers;
	};

	typedef NativeClassID (*ClassRegisterFunc)(const FBindingEnv& p_env);

}

#endif
