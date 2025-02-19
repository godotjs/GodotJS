#ifndef GODOTJS_TIMER_TAGS_H
#define GODOTJS_TIMER_TAGS_H

#include "jsb_bridge_pch.h"
#include "jsb_ref.h"

namespace jsb
{
    template <typename T>
    struct JSTimerTags
    {
        typename internal::TypeGen<TStrongRef<v8::String>, T>::UnorderedMap tags;
    };
}
#endif
