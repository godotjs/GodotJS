#ifndef GODOTJS_PCH_H
#define GODOTJS_PCH_H

#include <memory>
#include <cstdint>
#include <unordered_map>

#include "core/io/json.h"
#include "core/core_constants.h"
#include "core/version.h"
#include "core/templates/ring_buffer.h"
#include "core/string/string_builder.h"
#include "core/variant/variant.h"
#include "core/variant/variant_utility.h"
#include "core/config/project_settings.h"
#include "scene/main/node.h"

#include "../jsb.config.h"
#include "../jsb.gen.h"
#include "../jsb_version.h"

#ifdef TOOLS_ENABLED
#include "editor/editor_help.h"
#endif

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
