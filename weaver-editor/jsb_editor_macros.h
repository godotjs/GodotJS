#ifndef GODOTJS_EDITOR_MACROS_H
#define GODOTJS_EDITOR_MACROS_H

#ifndef TOOLS_ENABLED
#error CAN NOT COMPILE WITHOUT TOOLS_ENABLED, PLEASE CHECK IT'S NOT UNEXPECTEDLY INCLUDED.
#endif

#include "../internal/jsb_macros.h"

#if VERSION_MAJOR == 4
#   if VERSION_MINOR >= 3
#       include "editor/plugins/editor_plugin.h"
#   else 
#       include "editor/editor_plugin.h"
#   endif
#else 
#   error NOT SUPPORTED
#endif

#endif
