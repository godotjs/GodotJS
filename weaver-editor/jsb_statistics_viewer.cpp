#include "jsb_statistics_viewer.h"
#include "jsb_editor_pch.h"
#include "modules/GodotJS/weaver/jsb_gdjs_lang.h"
#include "scene/gui/tree.h"

GodotJSStatisticsViewer::GodotJSStatisticsViewer()
{
    tree = memnew(Tree);
    tree->set_v_size_flags(SIZE_EXPAND_FILL);
    tree->set_h_size_flags(SIZE_EXPAND_FILL);

    add_child(tree);
    set_v_size_flags(SIZE_EXPAND_FILL);

    timer = memnew(Timer);
    timer->set_one_shot(false);
    timer->set_wait_time(1.0);
    timer->connect("timeout", callable_mp(this, &GodotJSStatisticsViewer::on_timer));
    add_child(timer);

    tree->set_columns(3);
    tree->set_column_titles_visible(true);
    tree->set_column_title(0, TTR("Type"));
    tree->set_column_expand(0, false);
    tree->set_column_custom_minimum_width(0, (int) (190.0f * EDSCALE));
    tree->set_column_title(1, TTR("Usage"));
    tree->set_column_expand(1, true);
    tree->set_hide_root(true);

    tree_root = tree->create_item();
}

GodotJSStatisticsViewer::~GodotJSStatisticsViewer()
{

}

void GodotJSStatisticsViewer::activate(bool p_active)
{
    if (p_active) timer->start();
    else timer->stop();
}

void GodotJSStatisticsViewer::on_timer()
{
    GodotJSScriptLanguage* lang = GodotJSScriptLanguage::get_singleton();
    if (!lang) return;
    std::shared_ptr<jsb::Realm> realm = lang->get_realm();
    if (!realm) return;

    jsb::Statistics stats;
    realm->get_statistics(stats);

    int index = 0;
#if JSB_WITH_V8
    add_row(index++, "v8:global_handles_size", stats.used_global_handles_size, stats.total_global_handles_size);
    add_row(index++, "v8:heap_size", stats.used_heap_size, stats.total_heap_size, true);
    add_row(index++, "v8:malloced_memory", String::humanize_size(stats.malloced_memory));
    add_row(index++, "v8:peak_malloced_memory", String::humanize_size(stats.peak_malloced_memory));
    add_row(index++, "v8:external_memory", String::humanize_size(stats.external_memory));
#elif JSB_WITH_QUICKJS
    // ...
#endif
    add_row(index++, "jsb:objects", jsb_format("%d (%s)", stats.objects, String::humanize_size(stats.objects * jsb::internal::SArray<jsb::ObjectHandle>::get_slot_size())));
    add_row(index++, "jsb:native_classes", itos(stats.native_classes));
    add_row(index++, "jsb:script_classes", itos(stats.script_classes));
    add_row(index++, "jsb:cached_string_names", itos(stats.cached_string_names));
    add_row(index++, "jsb:persistent_objects", uitos(stats.persistent_objects));
    add_row(index++, "jsb:allocated_variants", uitos(stats.allocated_variants));
    for (; index < tree_root->get_child_count(); ++index)
    {
        tree_root->get_child(index)->set_visible(false);
    }
}

void GodotJSStatisticsViewer::add_row(int p_index, const String& p_name, size_t p_usage, size_t p_total, bool p_humanized_size)
{
    if (p_humanized_size)
    {
        add_row(p_index, p_name, jsb_format("%s / %s (%d %%)", String::humanize_size(p_usage), String::humanize_size(p_total), (int) (((double) p_usage / (double) p_total) * 100)));
        return;
    }
    add_row(p_index, p_name, jsb_format("%d / %d (%d %%)", (uint64_t) p_usage, (uint64_t) p_total, (int) (((double) p_usage / (double) p_total) * 100)));
}

void GodotJSStatisticsViewer::add_row(int p_index, const String& p_name, const String& p_text)
{
    TreeItem* item = p_index < tree_root->get_child_count() ? tree_root->get_child(p_index) : tree_root->create_child();
    item->set_text(0, p_name);
    item->set_text(1, p_text);
    item->set_visible(true);
}
