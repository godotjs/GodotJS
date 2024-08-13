#ifndef GODOTJS_STATISTICS_VIEWER_H
#define GODOTJS_STATISTICS_VIEWER_H
#include "scene/gui/box_container.h"

class GodotJSStatisticsViewer : public VBoxContainer
{
    GDCLASS(GodotJSStatisticsViewer, VBoxContainer)

private:
    class Tree* tree;
    class TreeItem* tree_root;
    class Timer* timer;

public:
    GodotJSStatisticsViewer();
    virtual ~GodotJSStatisticsViewer() override;

    void activate(bool p_active);

private:
    void on_timer();
    void add_row(int p_index, const String& p_name, size_t p_usage, size_t p_total, bool p_humanized_size = false);
    void add_row(int p_index, const String& p_name, const String& p_text);
};
#endif
