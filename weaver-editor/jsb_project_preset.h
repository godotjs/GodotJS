#ifndef GODOTJS_PROJECT_PRESET_H
#define GODOTJS_PROJECT_PRESET_H

#include "jsb_editor_macros.h"
#include "core/string/ustring.h"

struct GodotJSPorjectPreset
{
    static const char* get_source(const String &p_filename, size_t& r_len);
};
#endif
