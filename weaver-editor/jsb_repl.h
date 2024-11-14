#ifndef GODOTJS_REPL_H
#define GODOTJS_REPL_H
#include "jsb_editor_pch.h"

class GodotJSREPL : public HBoxContainer, public jsb::internal::IConsoleOutput
{
    GDCLASS(GodotJSREPL, HBoxContainer)

    struct OutputLine
    {
        String text;
    };

private:
    bool input_submitting_;
    LineEdit* input_box_;
    RichTextLabel* output_box_;

    Button* clear_button_;
    Button* gc_button_;
    Button* dts_button_;
    Button* preset_button_;
    Label* preset_hint_label_;
    Button* start_tsc_button_;

    ItemList* candidate_list_;

    Vector<OutputLine> lines_;

    enum { kMaxHistoryCount = 10 };
    Vector<String> history_;

private:
    void _update_theme();

protected:
    void _input_submitted(const String& p_text);
    void _input_changed(const String& p_text);
    void _input_gui_input(const Ref<InputEvent> &p_event);
    void _input_focus_exit();
    void _clear_pressed();
    void _gc_pressed();
    void _generate_dts_pressed();
    void _install_preset_pressed();
    void _start_tsc_pressed();
    void _notification(int p_what);
    void _show_candidates(const Vector<String>& p_items);

    void add_string(const String& p_str);
    void add_line(const String& p_line);
    void add_history(const String& p_text);
    jsb::JSValueMove eval_source(const String& p_code);
    String encode_string(const String& p_text);
    void check_install();
    void check_tsc();

public:
    GodotJSREPL();
    virtual ~GodotJSREPL() override;

    void write(jsb::internal::ELogSeverity::Type p_severity, const String& p_text) override;
};
#endif
