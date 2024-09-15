#ifndef GODOTJS_PCH_H
#define GODOTJS_PCH_H

#include <memory>
#include <cstdint>
#include <unordered_map>

#include "core/core_constants.h"
#include "core/string/string_builder.h"
#include "core/variant/variant.h"
#include "core/config/project_settings.h"
#include "core/variant/variant_utility.h"
#include "scene/main/node.h"

#include "../jsb.config.h"
#include "../jsb.gen.h"
#include "../jsb_version.h"

#if JSB_WITH_V8
#   include "../impl/v8/jsb_v8.h"
#elif JSB_WITH_QUICKJS
#   error not implemented yet
#   include "../impl/quickjs/jsb_quickjs.h"
#elif JSB_WITH_WEB
#   include "../impl/web/jsb_web.h"
#else
#   error unknown javascript runtime
#endif

#include "../internal/jsb_macros.h"
#include "../internal/jsb_format.h"
#include "../internal/jsb_console_output.h"
#include "../internal/jsb_logger.h"

#include "../internal/jsb_sarray.h"
#include "../internal/jsb_function_pointer.h"
#include "../internal/jsb_typealias.h"
#include "../internal/jsb_benchmark.h"
#include "../internal/jsb_string_names.h"

#endif
