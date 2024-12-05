#ifndef GODOTJS_DOUBLE_BUFFERED_H
#define GODOTJS_DOUBLE_BUFFERED_H
#include "jsb_internal_pch.h"

namespace jsb::internal
{
    template<typename T>
    struct DoubleBuffered
    {
    private:
        SpinLock spin_lock_;

        bool use_front_ = true;
        Vector<T> front_;
        Vector<T> back_;

    public:
        void add(const T& p_buffer)
        {
            spin_lock_.lock();
            if (use_front_) front_.push_back(p_buffer);
            else back_.push_back(p_buffer);
            spin_lock_.unlock();
        }

        Vector<T>& swap()
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

}

#endif
