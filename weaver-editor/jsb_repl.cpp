#include "jsb_repl.h"
#include "jsb_editor_pch.h"
#include "jsb_editor_plugin.h"
#include "../compat/jsb_compat.h"

void GodotJSREPL::_bind_methods()
{
    ClassDB::bind_method(D_METHOD("_backlog_flush"), &GodotJSREPL::_backlog_flush);
}

GodotJSREPL::GodotJSREPL()
{
#if GODOT_4_5_OR_NEWER
    sn_backlog_flush_ = StringName("_backlog_flush");
#else GODOT_4_5_OR_NEWER
    sn_backlog_flush_ = _scs_create("_backlog_flush");
#endif
    //TODO list all created realm instances in REPL, interact with the currently selected one.

    input_submitting_ = false;
    VBoxContainer* vbox = memnew(VBoxContainer);
    vbox->set_custom_minimum_size(Size2(0, 180) * EDSCALE);
    vbox->set_v_size_flags(SIZE_EXPAND_FILL);
    vbox->set_h_size_flags(SIZE_EXPAND_FILL);
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
    {
        gc_button_ = memnew(Button);
        tool_bar_box->add_child(gc_button_);
        gc_button_->set_theme_type_variation("FlatButton");
        gc_button_->set_focus_mode(FOCUS_NONE);
        gc_button_->set_tooltip_text(TTR("Explicit GC"));
        gc_button_->connect("pressed", callable_mp(this, &GodotJSREPL::_gc_pressed));
    }
    {
        dts_button_ = memnew(Button);
        tool_bar_box->add_child(dts_button_);
        dts_button_->set_theme_type_variation("FlatButton");
        dts_button_->set_focus_mode(FOCUS_NONE);
        dts_button_->set_tooltip_text(TTR("Generate godot.d.ts files"));
        dts_button_->connect("pressed", callable_mp(this, &GodotJSREPL::_generate_dts_pressed));
    }
    {
        preset_button_ = memnew(Button);
        tool_bar_box->add_child(preset_button_);
        preset_button_->set_theme_type_variation("FlatButton");
        preset_button_->set_focus_mode(FOCUS_NONE);
        preset_button_->set_tooltip_text(TTR("Install GodotJS preset files"));
        preset_button_->connect("pressed", callable_mp(this, &GodotJSREPL::_install_preset_pressed));
    }
    {
        preset_hint_label_ = memnew(Label);
        tool_bar_box->add_child(preset_hint_label_);
        preset_hint_label_->set_text(TTR("Suggest re-installing GodotJS preset files."));
    }
#if JSB_USE_TYPESCRIPT
    {
        start_tsc_button_ = memnew(Button);
        tool_bar_box->add_child(start_tsc_button_);
        start_tsc_button_->set_theme_type_variation("FlatButton");
        start_tsc_button_->set_focus_mode(FOCUS_NONE);
        start_tsc_button_->connect("pressed", callable_mp(this, &GodotJSREPL::_start_tsc_pressed));
    }
#endif

    Panel* output_container = memnew(Panel);
    output_container->set_h_size_flags(SIZE_EXPAND_FILL);
    output_container->set_v_size_flags(SIZE_EXPAND_FILL);
    output_container->set_grow_direction_preset(PRESET_FULL_RECT);
    vbox->add_child(output_container);

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

    output_box_ = memnew(RichTextLabel);
    output_box_->set_threaded(true);
    output_box_->set_use_bbcode(true);
    output_box_->set_scroll_follow(true);
    output_box_->set_selection_enabled(true);
    output_box_->set_context_menu_enabled(true);
    output_box_->set_focus_mode(FOCUS_CLICK);
    output_box_->set_deselect_on_focus_loss_enabled(false);
    output_box_->set_v_size_flags(SIZE_EXPAND_FILL);
    output_box_->set_h_size_flags(SIZE_EXPAND_FILL);
    output_box_->set_grow_direction_preset(PRESET_FULL_RECT);
    output_box_->set_offsets_preset(PRESET_FULL_RECT);
    output_box_->set_anchors_preset(PRESET_FULL_RECT);
    output_container->add_child(output_box_);

    candidate_list_ = memnew(ItemList);
    candidate_list_->hide();
    candidate_list_->set_focus_mode(FOCUS_NONE);
    candidate_list_->set_mouse_filter(MOUSE_FILTER_IGNORE);
    candidate_list_->set_disable_visibility_clip(true);
    candidate_list_->set_size(Size2(600, 160));
    output_container->add_child(candidate_list_);

}

GodotJSREPL::~GodotJSREPL()
{
    // ensure self removed before any member destruction to avoid deadlock
    remove_from_output_list();

    // avoid warning due to unhandled strings
    output_backlog_.swap().clear();
}

void GodotJSREPL::_notification(int p_what)
{
    switch (p_what)
    {
    case NOTIFICATION_APPLICATION_FOCUS_IN:
        {
            check_install();
            check_tsc();
        } break;
    case NOTIFICATION_ENTER_TREE: {
            _update_theme();
            check_install();
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
    jsb::ButtonCompat::set_icon(gc_button_, get_editor_theme_icon("CollapseTree"));
    jsb::ButtonCompat::set_icon(clear_button_, get_editor_theme_icon("Clear"));
    if (dts_button_)
    {
        jsb::ButtonCompat::set_icon(dts_button_, get_editor_theme_icon("BoxMesh"));
    }
    jsb::ButtonCompat::set_icon(preset_button_, get_editor_theme_icon("Window"));
    check_tsc();
}

void GodotJSREPL::check_tsc()
{
#if JSB_USE_TYPESCRIPT
    if (GodotJSEditorPlugin* editor_plugin = GodotJSEditorPlugin::get_singleton(); editor_plugin && editor_plugin->is_tsc_watching())
    {
        jsb::ButtonCompat::set_icon(start_tsc_button_, get_editor_theme_icon("Stop"));
        start_tsc_button_->set_tooltip_text(TTR("Stop tsc"));
    }
    else
    {
        jsb::ButtonCompat::set_icon(start_tsc_button_, get_editor_theme_icon("GodotJSRun"));
        start_tsc_button_->set_tooltip_text(TTR("Start tsc (watch)"));
    }
#endif
}

void GodotJSREPL::check_install()
{
    do
    {
        GodotJSEditorPlugin* editor_plugin = GodotJSEditorPlugin::get_singleton();
        if (!editor_plugin) break;
        if (!editor_plugin->verify_ts_project()) break;
        preset_hint_label_->set_visible(false);
        return;
    } while (false);
    preset_hint_label_->set_visible(true);
}

void GodotJSREPL::_gc_pressed()
{
    jsb::Environment::gc();
    add_line("Explicit GC requested");
}

void GodotJSREPL::_clear_pressed()
{
    output_box_->clear();
}

void GodotJSREPL::_install_preset_pressed()
{
    if (GodotJSEditorPlugin* editor_plugin = GodotJSEditorPlugin::get_singleton())
    {
        editor_plugin->try_install_ts_project();
    }
}

void GodotJSREPL::_generate_dts_pressed()
{
    GodotJSEditorPlugin::generate_godot_dts();
}

String GodotJSREPL::encode_string(const String& p_text)
{
    return p_text.replace("'", "\\'");
}

static bool is_auto_complete_allowed(const String& p_text)
{
#if JSB_REPL_AUTO_COMPLETE
    // a rough rule to allow auto-complete
    return !p_text.is_empty() && !p_text.contains("(");
#else
    return false;
#endif
}

void GodotJSREPL::_input_changed(const String &p_text)
{
    // if (input_submitting_) return;

    //TODO we haven't implemented the js function invocation from outside of Realm, just temporarily call as source code eval
    const PackedStringArray results =
        is_auto_complete_allowed(p_text)
            ? (PackedStringArray) eval_source(jsb_format("require('jsb.editor.main').auto_complete('%s')", encode_string(p_text))).to_variant()
            : PackedStringArray();
    _show_candidates(results);
}

void GodotJSREPL::_show_candidates(const Vector<String>& p_items)
{
    candidate_list_->clear();
    if (p_items.is_empty())
    {
        candidate_list_->hide();
        return;
    }

    for (const String& item : p_items)
    {
        candidate_list_->add_item(item);
    }
    const Size2 size = candidate_list_->get_size();
    const Vector2 origin = input_box_->get_position();
    const Vector2 input_size = input_box_->get_size();
    const Vector2 pos(origin.x, origin.y - size.y - input_size.y);
    candidate_list_->set_current(0);
    candidate_list_->set_position(pos);
    candidate_list_->show();
}

void GodotJSREPL::_input_focus_exit()
{
    candidate_list_->hide();
}

void GodotJSREPL::_input_gui_input(const Ref<InputEvent>& p_event)
{
    Ref<InputEventKey> k = p_event;
    if (!k.is_valid()) return;
    if (!candidate_list_->is_visible())
    {
        // fill out the candidate list with history if input is empty
        if (input_box_->get_text().is_empty() &&
            (k->is_action_pressed("ui_text_caret_up", true) || k->is_action_pressed("ui_text_caret_down", true)))
        {
            _show_candidates(history_);
        }
        return;
    }

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

void GodotJSREPL::_input_submitted(const String& p_text)
{
    if (p_text.is_empty()) return;

    check_install();
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

void GodotJSREPL::_backlog_flush()
{
    std::vector<String>& backlog = output_backlog_.swap();
    for (const String& str : backlog)
    {
        add_string(str);
    }
    backlog.clear();
}

void GodotJSREPL::write(jsb::internal::ELogSeverity::Type p_severity, const String& p_text)
{
    output_backlog_.add(p_text);
    call_deferred(sn_backlog_flush_);
}

void GodotJSREPL::add_history(const String &p_text)
{
    int size = history_.size();
    if (size != 0)
    {
        const int index = history_.rfind(p_text);
        if (index == size - 1)
        {
            return;
        }
        if (index != -1)
        {
            history_.remove_at(index);
            --size;
        }
    }

    history_.append(p_text);
    if (size >= kMaxHistoryCount)
    {
        history_.remove_at(0);
    }
}

void GodotJSREPL::_start_tsc_pressed()
{
    if (GodotJSEditorPlugin* editor_plugin = GodotJSEditorPlugin::get_singleton())
    {
        if (editor_plugin->is_tsc_watching()) editor_plugin->kill_tsc();
        else editor_plugin->start_tsc_watch();
        check_tsc();
    }
}
