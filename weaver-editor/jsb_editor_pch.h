#ifndef GODOTJS_EDITOR_PCH_H
#define GODOTJS_EDITOR_PCH_H

#include "jsb_editor_macros.h"

#if GODOT_4_3_OR_NEWER
#   include "editor/plugins/editor_plugin.h"
#   include "editor/themes/editor_scale.h"
#else 
#   include "editor/editor_plugin.h"
#   include "editor/editor_scale.h"
#endif

#endif
