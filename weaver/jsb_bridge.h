#ifndef GODOTJS_WEAVER_BRIDGE_H
#define GODOTJS_WEAVER_BRIDGE_H

#include "../jsb.config.h"
#include "../jsb.gen.h"

#pragma region checking defines

#if JSB_WITH_DEBUGGER && !JSB_WITH_V8
#   error debugger is only supported when using v8 as the javascript runtime
#endif

#pragma endregion

#include "../bridge-v8/jsb_environment.h"
#include "../bridge-v8/jsb_realm.h"
#include "../bridge-v8/jsb_exception_info.h"
#include "../bridge-v8/jsb_class_info.h"
#include "../bridge-v8/jsb_ref.h"

#endif
