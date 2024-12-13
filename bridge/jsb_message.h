#ifndef GODOTJS_MESSAGE_H
#define GODOTJS_MESSAGE_H
#include "jsb_bridge_pch.h"
#include "jsb_buffer.h"

namespace jsb
{
    struct Message
    {
    public:
        enum Type
        {
            TYPE_NONE = 0,
            TYPE_MESSAGE,
            TYPE_ERROR,
        };

        Message() = default;
        ~Message() = default;

        Message(const Message&) = delete;
        Message& operator=(const Message&) = delete;

        Message(Message&&) noexcept = default;
        Message& operator=(Message&&) noexcept = default;

        Message(NativeObjectID p_id, Type p_type, Buffer&& p_buffer)
        : id_(p_id), type_(p_type), buffer_(std::move(p_buffer)) {}

        // object id of worker object in master env
        NativeObjectID get_id() const { return id_; }

        Type get_type() const { return type_; }

        const Buffer& get_buffer() const { return buffer_; }

    private:
        NativeObjectID id_;
        Type type_;
        Buffer buffer_;
    };

}
#endif
