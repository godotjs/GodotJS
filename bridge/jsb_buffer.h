#ifndef GODOTJS_BUFFER_H
#define GODOTJS_BUFFER_H
#include "jsb_bridge_pch.h"

namespace jsb
{
    struct Buffer
    {
    private:
        uint8_t* ptr_ = nullptr;
        size_t size_ = 0;

        Buffer(uint8_t* p_ptr, size_t p_size) : ptr_(p_ptr), size_(p_size) {}

        //NOTE only free the memory, ptr_ itself won't be changed.
        jsb_force_inline void drop() 
        { 
            if (ptr_) impl::Helper::free(ptr_); 
        }

    public:
        static Buffer steal(uint8_t* p_ptr, size_t p_size)
        {
            return { p_ptr, p_size };
        }

        static Buffer copy(const uint8_t* p_ptr, size_t p_size)
        {
            uint8_t* ptr = (uint8_t*) memalloc(p_size);
            memcpy(ptr, p_ptr, p_size);
            return { ptr, p_size };
        }

        Buffer() = default;
        ~Buffer() { drop(); }

        Buffer(const Buffer& p_other) = delete;
        Buffer& operator=(const Buffer& p_other) = delete;

        Buffer(Buffer&& p_other) noexcept
        {
            ptr_ = p_other.ptr_;
            size_ = p_other.size_;
            p_other.ptr_ = nullptr;
            p_other.size_ = 0;
        }
        Buffer& operator=(Buffer&& p_other) noexcept
        {
            drop();

            ptr_ = p_other.ptr_;
            size_ = p_other.size_;
            p_other.ptr_ = nullptr;
            p_other.size_ = 0;
            return *this;
        }

        jsb_force_inline bool is_empty() const { return size_ == 0; }

        jsb_force_inline size_t size() const { return size_; }
        jsb_force_inline const uint8_t* ptr() const { return ptr_; }
        jsb_force_inline uint8_t* ptr() { return ptr_; }
    };

}
#endif
