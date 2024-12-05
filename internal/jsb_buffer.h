#ifndef GODOTJS_BUFFER_H
#define GODOTJS_BUFFER_H
#include "jsb_internal_pch.h"

namespace jsb::internal
{
    struct Buffer
    {
    private:
        Vector<uint8_t> data_;

    public:
        Buffer(): data_() {};
        Buffer(const Buffer& p_other) : data_(p_other.data_) {}
        Buffer(const Vector<uint8_t>& p_data) : data_(p_data) {}
        Buffer(const uint8_t* p_data, size_t p_size)
        {
            data_.resize(p_size);
            memcpy(data_.ptrw(), p_data, p_size);
        }

        jsb_force_inline bool is_empty() const { return data_.size() == 0; }

        jsb_force_inline size_t size() const { return data_.size(); }
        jsb_force_inline const uint8_t* ptr() const { return data_.ptr(); }
    };

}
#endif
