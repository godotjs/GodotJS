#ifndef JAVASCRIPT_REPL_H
#define JAVASCRIPT_REPL_H
#include "scene/gui/box_container.h"

class GodotJSREPL : public VBoxContainer
{
    GDCLASS(GodotJSREPL, VBoxContainer)
    struct OutputLine
    {
        String text;
    };

private:
    class LineEdit* input_box_;
    class RichTextLabel* output_box_;
    class Button* clear_button_;

    Vector<OutputLine> lines_;

private:
    void _update_theme();

protected:
    void _input_submitted(const String& p_text);
    void _clear_pressed();
    void _notification(int p_what);

    void _add_string(const String& p_str);
    void _add_line(const String& p_line);

public:
    GodotJSREPL();
    virtual ~GodotJSREPL() override;
};
#endif
