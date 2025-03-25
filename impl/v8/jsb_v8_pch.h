#ifndef GODOTJS_V8_HEADERS_H
#define GODOTJS_V8_HEADERS_H

#include <v8.h>
#include <v8-persistent-handle.h>
#include <libplatform/libplatform.h>
#include <v8-inspector.h>
#include <v8-version-string.h>

#if JSB_V8_CPPGC
#   include <v8-cppgc.h>
#   include <cppgc/default-platform.h>
#endif

#include "../../internal/jsb_logger.h"
#include "../../internal/jsb_macros.h"

#include "../shared/jsb_custom_field.h"

#endif
