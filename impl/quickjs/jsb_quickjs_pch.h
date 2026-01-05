#ifndef GODOTJS_QUICKJS_PCH_H
#define GODOTJS_QUICKJS_PCH_H

#include "../../jsb.gen.h"

#include "../shared/jsb_custom_field.h"
#if JSB_PREFER_QUICKJS_NG
    #include "../../quickjs-ng/quickjs.h"
#else
    #include "../../quickjs/quickjs.h"
#endif
#include "../../internal/jsb_internal.h"

#include <memory>
#include <cstdint>

#define JSB_QUICKJS_LOG(Severity, Format, ...) JSB_LOG_IMPL(quickjs, Severity, Format, ##__VA_ARGS__)

#endif
