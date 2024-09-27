#ifndef GODOTJS_EDITOR_PCH_H
#define GODOTJS_EDITOR_PCH_H

#include "jsb_editor_macros.h"

#include "../jsb_project_preset.h"

#include "../internal/jsb_path_util.h"
#include "../internal/jsb_settings.h"
#include "../internal/jsb_process.h"
#include "../internal/jsb_macros.h"
#include "../internal/jsb_console_output.h"
#include "../internal/jsb_path_util.h"
#include "../internal/jsb_settings.h"

#include "../weaver/jsb_script_language.h"

#if GODOT_4_3_OR_NEWER
#   include "editor/plugins/editor_plugin.h"
#   include "editor/themes/editor_scale.h"
#else
#   include "editor/editor_plugin.h"
#   include "editor/editor_scale.h"
#endif

#include "editor/editor_node.h"
#include "editor/editor_string_names.h"
#include "editor/export/editor_export_plugin.h"

#include "scene/scene_string_names.h"
#include "scene/gui/dialogs.h"
#include "scene/gui/tree.h"
#include "scene/gui/box_container.h"
#include "scene/gui/button.h"
#include "scene/gui/item_list.h"
#include "scene/gui/line_edit.h"
#include "scene/gui/rich_text_label.h"

#include "core/config/project_settings.h"

#endif
