#ifndef GODOTJS_EDITOR_HELPER_H
#define GODOTJS_EDITOR_HELPER_H
#include "jsb_editor_pch.h"

class GodotJSEditorHelper : public Object
{
    GDCLASS(GodotJSEditorHelper, Object);

protected:
    static void _bind_methods();

public:
    virtual ~GodotJSEditorHelper() override = default;

    static void show_toast(const String& p_text, int p_severity);
};

#endif
