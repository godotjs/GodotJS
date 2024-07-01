#ifndef GODOTJS_PCH_H
#define GODOTJS_PCH_H

#include <memory>
#include <cstdint>

#include "core/core_constants.h"
#include "core/string/string_builder.h"
#include "core/math/vector2.h"
#include "core/math/vector3.h"
#include "core/math/vector4.h"
#include "core/config/project_settings.h"
#include "core/variant/variant_utility.h"
#include "scene/main/node.h"

#include "../internal/jsb_macros.h"

#if JSB_WITH_V8
#   include <v8.h>
#   include <v8-persistent-handle.h>
#   include <libplatform/libplatform.h>
#   include <v8-inspector.h>
#   include <v8-version-string.h>
#elif JSB_WITH_QUICKJS
#   error not implemented yet
#   include "../bridge-quickjs/jsb_quickjs_v8.h"
#else
#   error unknown javascript runtime
#endif

//TODO handle module deps in SCSub
#include "modules/regex/regex.h"

#include "../internal/jsb_sarray.h"
#include "../internal/jsb_function_pointer.h"
#include "../internal/jsb_typealias.h"
#include "../internal/jsb_benchmark.h"
#include "../internal/jsb_string_names.h"

#endif
