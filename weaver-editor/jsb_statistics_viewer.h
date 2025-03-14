#ifndef GODOTJS_STATISTICS_VIEWER_H
#define GODOTJS_STATISTICS_VIEWER_H

#include "../compat/jsb_compat.h"
#include "../impl/shared/jsb_custom_field.h"

class Tree;
class TreeItem;
class Timer;

class GodotJSStatisticsViewer : public VBoxContainer
{
    GDCLASS(GodotJSStatisticsViewer, VBoxContainer)

private:
    Tree* tree;
    TreeItem* tree_root;
    Timer* timer;

public:
    GodotJSStatisticsViewer();
    virtual ~GodotJSStatisticsViewer() override;

    void activate(bool p_active);

private:
    void on_timer();
    void add_row(int p_index, const jsb::impl::CustomField& p_field);
    void add_row(int p_index, const String& p_name, const String& p_text);
};
#endif
