#ifndef GODOTJS_MESSAGE_H
#define GODOTJS_MESSAGE_H
#include "jsb_bridge_pch.h"
#include "jsb_buffer.h"

namespace jsb
{
    struct TransferData
    {
        NativeObjectID source_worker_id;
        uint32_t transfer_index;
        Variant variant;
        String script_path;
        List<Pair<StringName, Variant>> state;

        TransferData() : transfer_index(0)
        {
        }

        TransferData(NativeObjectID p_source_worker_id, uint32_t p_transfer_index, const Variant& p_variant,
                     const String& p_script_path = {}, const List<Pair<StringName, Variant>>& p_state = {})
            : source_worker_id(p_source_worker_id), transfer_index(p_transfer_index), variant(p_variant),
              script_path(p_script_path), state(p_state)
        {
        }

        ~TransferData() = default;
    };

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

        Message() = delete;
        ~Message() = default;

        Message(const Message&) = delete;
        Message& operator=(const Message&) = delete;

        Message(Message&&) noexcept = default;
        Message& operator=(Message&&) noexcept = default;

        Message(Type p_type, NativeObjectID p_id, Buffer&& p_buffer = Buffer(),
            std::vector<TransferData>&& p_transfers = std::vector<TransferData>())
            : type_(p_type), id_(p_id), buffer_(std::move(p_buffer)), transfers(std::move(p_transfers))
        {
        }

        // object id of worker object in master env
        NativeObjectID get_id() const { return id_; }

        Type get_type() const { return type_; }

        const Buffer& get_buffer() const { return buffer_; }

        const std::vector<TransferData>& get_transfers() const { return transfers; }

    private:
        Type type_;
        NativeObjectID id_;
        Buffer buffer_;
        std::vector<TransferData> transfers;
    };

}
#endif
