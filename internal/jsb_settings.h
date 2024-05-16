#ifndef GODOTJS_SETTINGS_H
#define GODOTJS_SETTINGS_H
#include "core/config/engine.h"
#include "core/config/project_settings.h"
#include "core/variant/variant.h"
#include "editor/editor_settings.h"

namespace jsb::internal
{
    class Settings
    {
    public:
        static uint16_t get_debugger_port();
        static bool get_sourcemap_enabled();
    };
}

#endif
