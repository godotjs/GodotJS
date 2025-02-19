#include "jsb_monitor.h"

#include "jsb_script_language.h"
#include "main/performance.h"
#include "../internal/jsb_internal.h"

#define JSB_NEW_MONITOR(MonitorName) \
    monitor_names_.push_back(JSB_MODULE_NAME_STRING "/" # MonitorName);\
    ::Performance::get_singleton()->add_custom_monitor(monitor_names_[monitor_names_.size() - 1], callable_mp(this, &GodotJSMonitor::get_value_## MonitorName), {})

#define JSB_BIND_MONITOR(MonitorName) \
    ClassDB::bind_method(D_METHOD("get_value_" #MonitorName), &GodotJSMonitor::get_value_ ## MonitorName)

#define JSB_DEFINE_MONITOR(MonitorName) \
    Variant GodotJSMonitor::get_value_ ## MonitorName()\
    {\
        flush();\
        return stats_.MonitorName;\
    }

#define JSB_DEFINE_CUSTOM_MONITOR(MonitorName, Accessor) \
    Variant GodotJSMonitor::get_value_ ## MonitorName()\
    {\
        flush();\
        return stats_.get_custom_field(#MonitorName).Accessor;\
    }

GodotJSMonitor::GodotJSMonitor()
{
    JSB_NEW_MONITOR(objects);
    JSB_NEW_MONITOR(native_classes);
    JSB_NEW_MONITOR(script_classes);
    JSB_NEW_MONITOR(cached_string_names);
    JSB_NEW_MONITOR(persistent_objects);
    JSB_NEW_MONITOR(allocated_variants);
#if JSB_WITH_V8
    JSB_NEW_MONITOR(heap_size);
#elif JSB_WITH_QUICKJS
    JSB_NEW_MONITOR(memory_used_size);
#endif
}

void GodotJSMonitor::_bind_methods()
{
    JSB_BIND_MONITOR(objects);
    JSB_BIND_MONITOR(native_classes);
    JSB_BIND_MONITOR(script_classes);
    JSB_BIND_MONITOR(cached_string_names);
    JSB_BIND_MONITOR(persistent_objects);
    JSB_BIND_MONITOR(allocated_variants);
#if JSB_WITH_V8
    JSB_BIND_MONITOR(heap_size);
#elif JSB_WITH_QUICKJS
    JSB_BIND_MONITOR(memory_used_size);
#endif
}

JSB_DEFINE_MONITOR(objects);
JSB_DEFINE_MONITOR(native_classes);
JSB_DEFINE_MONITOR(script_classes);
JSB_DEFINE_MONITOR(cached_string_names);
JSB_DEFINE_MONITOR(persistent_objects);
JSB_DEFINE_MONITOR(allocated_variants);

#if JSB_WITH_V8
    JSB_DEFINE_CUSTOM_MONITOR(heap_size, u.u64_cap[0]);
#elif JSB_WITH_QUICKJS
    JSB_DEFINE_CUSTOM_MONITOR(memory_used_size, u.i64);
#endif

GodotJSMonitor::~GodotJSMonitor()
{
    for (const StringName& it : monitor_names_)
    {
        ::Performance::get_singleton()->remove_custom_monitor(it);
    }
}

void GodotJSMonitor::flush()
{
    const uint64_t ticks = Engine::get_singleton()->get_frame_ticks();
    if (ticks - last_flush_tick_ < 1000ULL)
    {
        return;
    }

    last_flush_tick_ = ticks;
    const GodotJSScriptLanguage* lang = GodotJSScriptLanguage::get_singleton();
    if (!lang) return;
    const std::shared_ptr<jsb::Environment> env = lang->get_environment();
    if (!env) return;
    env->get_statistics(stats_);
}
