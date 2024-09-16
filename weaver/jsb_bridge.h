#ifndef GODOTJS_WEAVER_BRIDGE_H
#define GODOTJS_WEAVER_BRIDGE_H

#include "../jsb.config.h"
#include "../jsb.gen.h"

#pragma region checking defines

static_assert(
    !JSB_WITH_DEBUGGER || JSB_WITH_V8,
    "error debugger is only supported when using v8 as the javascript runtime"
    );

#pragma endregion

#include "../bridge/jsb_environment.h"
#include "../bridge/jsb_exception_info.h"
#include "../bridge/jsb_class_info.h"
#include "../bridge/jsb_ref.h"

#endif
