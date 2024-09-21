#ifndef GODOTJS_WEB_MAYBE_H
#define GODOTJS_WEB_MAYBE_H
#include "core/error/error_macros.h"

namespace v8
{
    template<typename T>
    class Maybe
    {
    private:
        T value_ = {};
        bool has_value_ = false;

    public:
        Maybe() {}
        Maybe(const T& value) : value_(value), has_value_(true) {}
        void Check() const {}

        bool IsNothing() const { return !has_value_; }

        T FromMaybe(const T& default_value) const
        {
            return has_value_ ? value_ : default_value;
        }

        bool To(T* out)
        {
            if (has_value_) *out = value_;
            return has_value_;
        }

        T ToChecked() const
        {
            CRASH_COND(!has_value_);
            return value_;
        }
    };
}
#endif
