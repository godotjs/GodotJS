#ifndef GODOTJS_WEAVER_COMPAT_H
#define GODOTJS_WEAVER_COMPAT_H
#include "scene/gui/button.h"
#include "../internal/jsb_engine_version_comparison.h"

namespace jsb
{
    struct ButtonCompat
    {
        static void set_icon(Button* self, const Ref<Texture2D> &p_icon)
        {
#if GODOT_4_4_OR_NEWER
            self->set_button_icon(p_icon);
#else
            self->set_icon(p_icon);
#endif
        }
    };
}

#endif
