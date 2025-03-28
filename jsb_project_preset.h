#ifndef GODOTJS_PROJECT_PRESET_H
#define GODOTJS_PROJECT_PRESET_H

#include "compat/jsb_compat.h"
#include "internal/jsb_preset_source.h"

struct GodotJSProjectPreset
{
    static jsb::internal::PresetSource get_source_rt(const String& p_filename);

#ifdef TOOLS_ENABLED
    static jsb::internal::PresetSource get_source_ed(const String& p_filename);
#endif
};
#endif
