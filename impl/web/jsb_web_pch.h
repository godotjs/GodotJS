﻿#ifndef GODOTJS_WEB_PCH_H
#define GODOTJS_WEB_PCH_H

#include "../../jsb.gen.h"
#include "../../internal/jsb_internal.h"

#include <memory>
#include <cstdint>

#define JSB_WEB_LOG(Severity, Format, ...) JSB_LOG_IMPL(web, Severity, Format, ##__VA_ARGS__)

#include "jsb_web_interop.h"
#include "../shared/jsb_custom_field.h"

#endif
