#ifndef GODOTJS_PCH_H
#define GODOTJS_PCH_H

#include <memory>
#include <cstdint>
#include <unordered_map>

#include "../jsb.config.h"
#include "../jsb.gen.h"
#include "../jsb_version.h"

#include "../compat/jsb_compat.h"

#if JSB_WITH_WEB
#   include "../impl/web/jsb_web.h"
#elif JSB_WITH_V8
#   include "../impl/v8/jsb_v8.h"
#elif JSB_WITH_QUICKJS
#   include "../impl/quickjs/jsb_quickjs.h"
#elif JSB_WITH_JAVASCRIPTCORE
#   include "../impl/jsc/jsb_jsc.h"
#else
#   error unknown javascript runtime
#endif

#include "../internal/jsb_internal.h"

#endif
