#include "jsb_repl.h"

#include "../weaver/jsb_gdjs_lang.h"
#include "scene/gui/button.h"
#include "scene/gui/line_edit.h"
#include "scene/gui/rich_text_label.h"

GodotJSREPL::GodotJSREPL()
{
    //TODO list all created realm instances in REPL, interact with the current selected one.

    HBoxContainer* hbox = memnew(HBoxContainer);
    add_child(hbox);
    {
        clear_button_ = memnew(Button);
        hbox->add_child(clear_button_);
        clear_button_->set_theme_type_variation("FlatButton");
        clear_button_->set_focus_mode(FOCUS_NONE);
        clear_button_->set_tooltip_text(TTR("Clear Output"));
        clear_button_->connect("pressed", callable_mp(this, &GodotJSREPL::_clear_pressed));
    }

    output_box_ = memnew(RichTextLabel);
    output_box_->set_threaded(true);
    output_box_->set_use_bbcode(true);
    output_box_->set_scroll_follow(true);
    output_box_->set_selection_enabled(true);
    output_box_->set_context_menu_enabled(true);
    output_box_->set_focus_mode(FOCUS_CLICK);
    output_box_->set_v_size_flags(SIZE_EXPAND_FILL);
    output_box_->set_h_size_flags(SIZE_EXPAND_FILL);
    output_box_->set_deselect_on_focus_loss_enabled(false);
    add_child(output_box_);

    input_box_ = memnew(LineEdit);
    input_box_->set_h_size_flags(Control::SIZE_EXPAND_FILL);
    input_box_->set_placeholder(TTR("Enter expressions"));
    input_box_->set_clear_button_enabled(true);
    input_box_->set_visible(true);
    input_box_->connect("text_submitted", callable_mp(this, &GodotJSREPL::_input_submitted));
    add_child(input_box_);
}

GodotJSREPL::~GodotJSREPL()
{

}

void GodotJSREPL::_notification(int p_what)
{
    switch (p_what)
    {
    case NOTIFICATION_ENTER_TREE: {
        _update_theme();
        // _load_state();
    } break;
    case NOTIFICATION_THEME_CHANGED: {
        _update_theme();
        // _rebuild_log();
    } break;
    }
}

void GodotJSREPL::_update_theme()
{
    clear_button_->set_icon(get_editor_theme_icon(SNAME("Clear")));
}

void GodotJSREPL::_clear_pressed()
{
    output_box_->clear();
}

void GodotJSREPL::_input_submitted(const String &p_text)
{
    _add_line(p_text);
    input_box_->clear();
    GodotJSScriptLanguage* lang = GodotJSScriptLanguage::get_singleton();
    jsb_check(lang);
    Error err;
    const jsb::JSValueMove value = lang->eval_source(p_text, err);
    _add_string(value.to_string());
}

void GodotJSREPL::_add_line(const String &p_line)
{
    output_box_->add_text(p_line);
    output_box_->add_newline();
}

void GodotJSREPL::_add_string(const String &p_str)
{
    const Vector<String> lines = p_str.split("\n", true);
    const int line_count = lines.size();
    for (const String& line: lines)
    {
        _add_line(line);
    }
}
