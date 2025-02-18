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

            // worker ready
            TYPE_READY,

            // worker message
            TYPE_MESSAGE,

            //TODO worker error (NOT IMPLEMENTED YET)
            TYPE_ERROR,
        };

        Message() = default;
        ~Message() = default;

        Message(const Message&) = delete;
        Message& operator=(const Message&) = delete;

        Message(Message&&) noexcept = default;
        Message& operator=(Message&&) noexcept = default;

        Message(Type p_type, NativeObjectID p_id, Buffer&& p_buffer)
        : type_(p_type), id_(p_id), buffer_(std::move(p_buffer)) {}

        // object id of worker object in master env
        NativeObjectID get_id() const { return id_; }

        Type get_type() const { return type_; }

        const Buffer& get_buffer() const { return buffer_; }

    private:
        Type type_;
        NativeObjectID id_;
        Buffer buffer_;
    };

}
#endif
