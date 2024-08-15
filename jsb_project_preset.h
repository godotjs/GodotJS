#ifndef GODOTJS_PROJECT_PRESET_H
#define GODOTJS_PROJECT_PRESET_H

#include "core/string/ustring.h"

struct GodotJSPorjectPreset
{
    //TODO explicitly use _rt/_ed instead
    static const char* get_source(const String& p_filename, size_t& r_len)
    {
        if (const char* res = get_source_rt(p_filename, r_len)) return res;
        return get_source_ed(p_filename, r_len);
    }

    static const char* get_source_rt(const String& p_filename, size_t& r_len);

#ifdef TOOLS_ENABLED
    static const char* get_source_ed(const String& p_filename, size_t& r_len);
#endif
};
#endif
