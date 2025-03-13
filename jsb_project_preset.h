#ifndef GODOTJS_PROJECT_PRESET_H
#define GODOTJS_PROJECT_PRESET_H

#include "compat/jsb_compat.h"

struct GodotJSProjectPreset
{
    static const char* get_source_rt(const String& p_filename, size_t& r_len);

#ifdef TOOLS_ENABLED
    static const char* get_source_ed(const String& p_filename, size_t& r_len);
#endif
};
#endif
