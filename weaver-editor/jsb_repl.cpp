#include "jsb_repl.h"

#include "scene/scene_string_names.h"
#include "scene/gui/button.h"
#include "scene/gui/item_list.h"
#include "scene/gui/line_edit.h"
#include "scene/gui/rich_text_label.h"

GodotJSREPL::GodotJSREPL()
{
    //TODO list all created realm instances in REPL, interact with the currently selected one.

    input_submitting_ = false;
    VBoxContainer* vbox = memnew(VBoxContainer);
    vbox->set_v_size_flags(SIZE_EXPAND_FILL);
    vbox->set_h_size_flags(SIZE_EXPAND_FILL);
    vbox->set_anchors_preset(PRESET_FULL_RECT, false);
    add_child(vbox);

    HBoxContainer* tool_bar_box = memnew(HBoxContainer);
    vbox->add_child(tool_bar_box);
    {
        clear_button_ = memnew(Button);
        tool_bar_box->add_child(clear_button_);
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
    vbox->add_child(output_box_);

    input_box_ = memnew(LineEdit);
    input_box_->set_h_size_flags(SIZE_EXPAND_FILL);
    input_box_->set_placeholder(TTR("Enter expressions"));
    input_box_->set_clear_button_enabled(true);
    input_box_->set_visible(true);
    input_box_->connect("text_submitted", callable_mp(this, &GodotJSREPL::_input_submitted));
    input_box_->connect("text_changed", callable_mp(this, &GodotJSREPL::_input_changed));
    input_box_->connect(SceneStringNames::get_singleton()->gui_input, callable_mp(this, &GodotJSREPL::_input_gui_input));
    input_box_->connect(SceneStringNames::get_singleton()->focus_exited, callable_mp(this, &GodotJSREPL::_input_focus_exit));
    vbox->add_child(input_box_);

    candidate_list_ = memnew(ItemList);
    for (int i = 0; i < 20; i++)
    {
        candidate_list_->add_item(vformat("List Item %d", i));
    }
    candidate_list_->hide();
    candidate_list_->set_focus_mode(FOCUS_NONE);
    candidate_list_->set_mouse_filter(MOUSE_FILTER_IGNORE);
    candidate_list_->set_disable_visibility_clip(true);
    candidate_list_->set_size(Size2(300, 160));
    add_child(candidate_list_);
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

String GodotJSREPL::encode_string(const String& p_text)
{
    return p_text.replace("'", "\\'");
}

void GodotJSREPL::_input_changed(const String &p_text)
{
    // if (input_submitting_) return;
    if (p_text.is_empty())
    {
        candidate_list_->hide();
        return;
    }

    candidate_list_->clear();
    //TODO we haven't implement the js function invocation from outside of Realm, just temporarily call as source code eval
    const PackedStringArray results = eval_source(vformat("require('jsb/jsb.editor.main').auto_complete('%s')", encode_string(p_text))).to_variant();
    if (results.size() == 0)
    {
        candidate_list_->hide();
        return;
    }
    for (const String& item : results)
    {
        candidate_list_->add_item(item);
    }
    const Size2 size = candidate_list_->get_size();
    const Vector2 origin = input_box_->get_position();
    const Vector2 pos(origin.x, origin.y - size.y - 16);
    candidate_list_->set_current(0);
    candidate_list_->set_position(pos);
    candidate_list_->show();
}

void GodotJSREPL::_input_focus_exit()
{
    candidate_list_->hide();
}

void GodotJSREPL::_input_gui_input(const Ref<InputEvent> &p_event)
{
    Ref<InputEventKey> k = p_event;
    if (!k.is_valid()) return;
    if (!candidate_list_->is_visible()) return;

    const int item_count = candidate_list_->get_item_count();
    const int current = candidate_list_->get_current();
    if (k->is_action_pressed("ui_text_caret_up", true))
    {
        candidate_list_->set_current(current > 0 ? current - 1 : item_count - 1);
        candidate_list_->ensure_current_is_visible();
        input_box_->accept_event();
    }
    else if (k->is_action_pressed("ui_text_caret_down", true))
    {
        candidate_list_->set_current(current < item_count - 1 ? current + 1 : 0);
        candidate_list_->ensure_current_is_visible();
        input_box_->accept_event();
    }
    else if (k->is_action_pressed("ui_focus_next", true))
    {
        const String text = candidate_list_->get_item_text(current);
        input_box_->set_text(text);
        candidate_list_->hide();
        input_box_->set_caret_column(text.length());
        input_box_->accept_event();
    }
}

void GodotJSREPL::_input_submitted(const String &p_text)
{
    input_submitting_ = true;
    add_line(p_text);
    input_box_->clear();
    const jsb::JSValueMove value = eval_source(p_text);
    add_string(value.to_string());
    add_history(p_text);
    input_submitting_ = false;
}

jsb::JSValueMove GodotJSREPL::eval_source(const String& p_code)
{
    GodotJSScriptLanguage* lang = GodotJSScriptLanguage::get_singleton();
    jsb_check(lang);
    Error err;
    return lang->eval_source(p_code, err);
}

void GodotJSREPL::add_line(const String &p_line)
{
    output_box_->add_text(p_line);
    output_box_->add_newline();
}

void GodotJSREPL::add_string(const String &p_str)
{
    const Vector<String> lines = p_str.split("\n", true);
    // const int line_count = lines.size();
    for (const String& line: lines)
    {
        add_line(line);
    }
}

void GodotJSREPL::write(jsb::internal::ELogSeverity::Type p_severity, const String& p_text)
{
    if (input_submitting_)
    {
        add_string(p_text);
    }
}

void GodotJSREPL::add_history(const String &p_text)
{
    history_.append(p_text);
    if (history_.size() > 10)
    {
        history_.remove_at(0);
    }
}
