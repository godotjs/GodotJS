#ifndef GODOTJS_DOUBLE_BUFFERED_H
#define GODOTJS_DOUBLE_BUFFERED_H
#include "jsb_internal_pch.h"
#include "jsb_macros.h"
#include "jsb_logger.h"

namespace jsb::internal
{
    template <typename T>
    struct DoubleBuffered
    {
    private:
        SpinLock spin_lock_;

        bool use_front_ = true;

        // use std::vector because we need the move semantics
        std::vector<T> front_;
        std::vector<T> back_;

    public:
        DoubleBuffered() = default;

        ~DoubleBuffered()
        {
            spin_lock_.lock();
            if (!front_.empty() || !back_.empty())
            {
                JSB_LOG(Warning, "discarding unhandled buffers");
            }
            spin_lock_.unlock();
        }

        DoubleBuffered(const DoubleBuffered&) = delete;
        DoubleBuffered& operator=(const DoubleBuffered&) = delete;

        template <typename E>
        void add(E&& p_buffer)
        {
            spin_lock_.lock();
            if (use_front_)
                front_.push_back(std::forward<E>(p_buffer));
            else
                back_.push_back(std::forward<E>(p_buffer));
            spin_lock_.unlock();
        }

        std::vector<T>& swap()
        {
            spin_lock_.lock();
            if (use_front_)
            {
                use_front_ = false;
                spin_lock_.unlock();
                return front_;
            }
            use_front_ = true;
            spin_lock_.unlock();
            return back_;
        }
    };

} // namespace jsb::internal

#endif
