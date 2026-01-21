#ifndef GODOTJS_DOCKED_PANEL_H
#define GODOTJS_DOCKED_PANEL_H
#include "scene/gui/margin_container.h"

class GodotJSDockedPanel : public MarginContainer
{
    GDCLASS(GodotJSDockedPanel, MarginContainer)

private:
    class TabContainer* tabs;

public:
    GodotJSDockedPanel();
    virtual ~GodotJSDockedPanel() override;

private:
    void on_tab_changed(int p_tab_index);
};

#endif
