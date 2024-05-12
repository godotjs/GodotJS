#ifndef JSB_BRIDGE_H
#define JSB_BRIDGE_H

#include "../jsb.gen.h"

#if JSB_WITH_V8
#   include "../bridge-v8/jsb_environment.h"
#   include "../bridge-v8/jsb_realm.h"
#   include "../bridge-v8/jsb_exception_info.h"
#   include "../bridge-v8/jsb_class_info.h"
#   include "../bridge-v8/jsb_ref.h"
#elif JSB_WITH_QUICKJS
#   include "../bridge-quickjs/jsb_environment.h"
#   error "not implemented"
#else
#   error "unknown javascript runtime"
#endif

#endif
