#include "jsb_docked_panel.h"
#include "jsb_editor_pch.h"
#include "jsb_repl.h"
#include "jsb_statistics_viewer.h"
#include "scene/gui/tab_container.h"

namespace
{
    static constexpr int kTabREPL = 0;
    static constexpr int kTabViewer = 1;
}

GodotJSDockedPanel::GodotJSDockedPanel()
{
    tabs = memnew(TabContainer);
    add_child(tabs);
    tabs->connect("tab_changed", callable_mp(this, &GodotJSDockedPanel::on_tab_changed));

    {
        jsb_check(tabs->get_tab_count() == kTabREPL);
        GodotJSREPL* repl = memnew(GodotJSREPL);
        repl->set_name(TTR("REPL"));
        tabs->add_child(repl);
    }
    {
        jsb_check(tabs->get_tab_count() == kTabViewer);
        GodotJSStatisticsViewer* viewer = memnew(GodotJSStatisticsViewer);
        viewer->set_name(TTR("Statistics"));
        tabs->add_child(viewer);
    }
}

GodotJSDockedPanel::~GodotJSDockedPanel()
{

}

void GodotJSDockedPanel::on_tab_changed(int p_tab_index)
{
    GodotJSStatisticsViewer* viewer = (GodotJSStatisticsViewer*) tabs->get_tab_control(kTabViewer);
    viewer->activate(p_tab_index == kTabViewer);
}
