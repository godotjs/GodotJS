#include "jsb_editor_helper.h"

#include "editor/gui/editor_toaster.h"

void GodotJSEditorHelper::_bind_methods()
{
    ClassDB::bind_static_method(jsb_typename(GodotJSEditorHelper), D_METHOD("show_toast", "text", "severity"), &GodotJSEditorHelper::show_toast);
}

void GodotJSEditorHelper::show_toast(const String& p_text, int p_severity)
{
    EditorToaster::get_singleton()->popup_str(p_text, (EditorToaster::Severity) p_severity);
}
