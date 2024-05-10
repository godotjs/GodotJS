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
        constexpr static const char kEdDebuggerPort[] = "jsb/editor/debugger/port";
        constexpr static const char kRtDebuggerPort[] = "jsb/runtime/debugger/port";

    };
}

#endif
