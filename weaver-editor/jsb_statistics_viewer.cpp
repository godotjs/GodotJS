#include "jsb_statistics_viewer.h"
#include "jsb_editor_pch.h"

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
    if (p_active)
        timer->start();
    else
        timer->stop();
}

void GodotJSStatisticsViewer::on_timer()
{
    const GodotJSScriptLanguage* lang = GodotJSScriptLanguage::get_singleton();
    if (!lang) return;
    const std::shared_ptr<jsb::Environment> env = lang->get_environment();
    if (!env) return;

    jsb::Statistics stats;
    env->get_statistics(stats);

    int index = 0;
    for (const jsb::impl::CustomField& field : stats.custom_fields)
    {
        add_row(index++, field);
    }
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

namespace
{
    template <typename T>
    String to_percentage(T n, T d)
    {
        return d == 0 ? "?" : itos((int64_t) ((double) n / (double) d) * 100);
    }

    String humanized(int64_t p_size, jsb::impl::CustomField::HintFlags p_hint)
    {
        if (p_hint & jsb::impl::CustomField::HINT_SIZE) return String::humanize_size(p_size);
        return itos(p_size);
    }

    String humanized(uint64_t p_size, jsb::impl::CustomField::HintFlags p_hint)
    {
        if (p_hint & jsb::impl::CustomField::HINT_SIZE) return String::humanize_size(p_size);
        return uitos(p_size);
    }
} // namespace

void GodotJSStatisticsViewer::add_row(int p_index, const jsb::impl::CustomField& p_field)
{
    switch (p_field.type)
    {
    case jsb::impl::CustomField::Type::TYPE_INT_VALUE:
        add_row(p_index, p_field.name, humanized(p_field.u.i64, p_field.hint));
        break;
    case jsb::impl::CustomField::Type::TYPE_UINT_VALUE:
        add_row(p_index, p_field.name, humanized(p_field.u.u64, p_field.hint));
        break;
    case jsb::impl::CustomField::Type::TYPE_INT_CAP:
        add_row(p_index, p_field.name, jsb_format("%s / %s (%s %%)", humanized(p_field.u.i64_cap[0], p_field.hint), humanized(p_field.u.i64_cap[1], p_field.hint), to_percentage(p_field.u.i64_cap[0], p_field.u.i64_cap[1])));
        break;
    case jsb::impl::CustomField::Type::TYPE_UINT_CAP:
        add_row(p_index, p_field.name, jsb_format("%s / %s (%s %%)", humanized(p_field.u.u64_cap[0], p_field.hint), humanized(p_field.u.u64_cap[1], p_field.hint), to_percentage(p_field.u.u64_cap[0], p_field.u.u64_cap[1])));
        break;
    default:
        JSB_LOG(Error, "unhandled custom field type %d", p_field.type);
        break;
    }
}

void GodotJSStatisticsViewer::add_row(int p_index, const String& p_name, const String& p_text)
{
    TreeItem* item = p_index < tree_root->get_child_count() ? tree_root->get_child(p_index) : tree_root->create_child();
    item->set_text(0, p_name);
    item->set_text(1, p_text);
    item->set_visible(true);
}
