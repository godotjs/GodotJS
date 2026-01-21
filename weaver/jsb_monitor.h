#ifndef GODOTJS_MONITOR_H
#define GODOTJS_MONITOR_H
#include "../compat/jsb_compat.h"
#include "../bridge/jsb_statistics.h"

#define JSB_DECLARE_MONITOR(MonitorName) Variant get_value_##MonitorName()

class GodotJSMonitor : public Object
{
    GDCLASS(GodotJSMonitor, Object)

private:
    Vector<StringName> monitor_names_;
    jsb::Statistics stats_;
    uint64_t last_flush_tick_ = 0;

protected:
    static void _bind_methods();

    void flush();

    JSB_DECLARE_MONITOR(objects);
    JSB_DECLARE_MONITOR(native_classes);
    JSB_DECLARE_MONITOR(script_classes);
    JSB_DECLARE_MONITOR(cached_string_names);
    JSB_DECLARE_MONITOR(persistent_objects);
    JSB_DECLARE_MONITOR(allocated_variants);

#if JSB_WITH_V8
    JSB_DECLARE_MONITOR(heap_size);
#elif JSB_WITH_QUICKJS
    JSB_DECLARE_MONITOR(memory_used_size);
#endif

public:
    GodotJSMonitor();
    virtual ~GodotJSMonitor() override;
};

#endif
