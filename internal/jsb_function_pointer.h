#ifndef GODOTJS_FUNCTION_POINTER_H
#define GODOTJS_FUNCTION_POINTER_H

#include <cinttypes>
#include "core/templates/vector.h"

namespace jsb::internal
{
    struct CFunctionPointers
    {
        CFunctionPointers(): cursor_(0) { pointer_.resize(16 * 512); }

        template<typename Func>
        uint32_t add(Func func)
        {
            uint32_t last_cursor = cursor_;
            if (pointer_.size() - last_cursor <= sizeof(func))
            {
                pointer_.resize(pointer_.size() * 2);
            }
            memcpy(pointer_.ptrw() + last_cursor, &func, sizeof(func));
            cursor_ += sizeof(func);
            return last_cursor;
        }

        uint8_t* operator[](uint32_t p_index) { return pointer_.ptrw() + p_index; }

        uint32_t cursor_;
        Vector<uint8_t> pointer_;
    };
}
#endif
