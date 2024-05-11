#include "jsb_settings.h"

namespace jsb::internal
{
    constexpr static const char kEdDebuggerPort[] = "jsb/debugger/editor_port";
    constexpr static const char kRtDebuggerPort[] = "jsb/debugger/runtime_port";

    void init_settings()
    {
        static bool inited = false;
        if (!inited)
        {
            inited = true;
            // EDITOR_DEF(kEdDebuggerPort, 9230);
            GLOBAL_DEF(kEdDebuggerPort, 9230);
            GLOBAL_DEF(kRtDebuggerPort, 9229);
        }
    }

    uint16_t Settings::get_debugger_port()
    {
        //TODO temporarily use project settings for debugger port in editor mode due to EditorSettings singleton lifetime initialization flow
        init_settings();
        return Engine::get_singleton()->is_editor_hint()
            // ? EDITOR_GET(kEdDebuggerPort)
            ? GLOBAL_GET(kEdDebuggerPort)
            : GLOBAL_GET(kRtDebuggerPort);
    }

}
