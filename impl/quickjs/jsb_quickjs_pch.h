#ifndef GODOTJS_QUICKJS_PCH_H
#define GODOTJS_QUICKJS_PCH_H

#include "../../quickjs/quickjs.h"
#include "../../internal/jsb_internal.h"

#include <memory>
#include <cstdint>

#define JSB_QUICKJS_LOG(Severity, Format, ...) JSB_LOG_IMPL(quickjs, Severity, Format, ##__VA_ARGS__)

#endif
