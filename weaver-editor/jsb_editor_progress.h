#ifndef GODOTJS_EDITOR_PROGRESS_H
#define GODOTJS_EDITOR_PROGRESS_H
#include "jsb_editor_pch.h"

/**
 * A simple wrapper for EditorProgress.
 * Used in editor scripts to show progress (a modal popup).
 */
class GodotJSEditorProgress : public Object
{
    GDCLASS(GodotJSEditorProgress, Object);

private:
    String state_name_;

    // TODO alternative implementation of Progress in gdextension
    EditorProgress* progress_ = nullptr;

protected:
    static void _bind_methods();

public:
    GodotJSEditorProgress() = default;
    virtual ~GodotJSEditorProgress() override;

    void init(const String& p_name, const String& p_description, int p_total_steps);
    void set_state_name(const String& p_name);
    void set_current(int p_value);
    void step();
    void finish();
};

#endif
