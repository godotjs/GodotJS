#ifndef GODOTJS_MESSAGE_H
#define GODOTJS_MESSAGE_H
#include "jsb_bridge_pch.h"
#include "../internal/jsb_buffer.h"

namespace jsb
{
    class Environment;

    struct Message
    {
    private:
        friend class Environment;

        // object id of worker object in master env
        NativeObjectID id_;
        internal::Buffer buffer_;

    public:
        Message() = default;
        Message(NativeObjectID p_id, const internal::Buffer& p_buffer): id_(p_id), buffer_(p_buffer) {}
    };

}
#endif
