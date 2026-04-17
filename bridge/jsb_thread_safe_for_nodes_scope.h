#ifndef GODOTJS_THREAD_SAFE_FOR_NODES_SCOPE_H
#define GODOTJS_THREAD_SAFE_FOR_NODES_SCOPE_H

#include "jsb_bridge_pch.h"

#include "core/os/thread_safe.h"

namespace jsb
{
    class ThreadSafeForNodesScope
    {
        bool previously_thread_safe_ = false;

    public:
        ThreadSafeForNodesScope()
        {
            previously_thread_safe_ = is_current_thread_safe_for_nodes();
            set_current_thread_safe_for_nodes(true);
        }

        ~ThreadSafeForNodesScope()
        {
            set_current_thread_safe_for_nodes(previously_thread_safe_);
        }
    };
}

#endif
