#ifndef GODOTJS_JSC_PCH_H
#define GODOTJS_JSC_PCH_H

#include "../../jsb.gen.h"
#include "../shared/jsb_custom_field.h"
#include "../../internal/jsb_internal.h"

#include <JavaScriptCore/JavaScriptCore.h>

#include <memory>
#include <cstdint>

#define JSB_JSC_LOG(Severity, Format, ...) JSB_LOG_IMPL(jsc, Severity, Format, ##__VA_ARGS__)

#endif
