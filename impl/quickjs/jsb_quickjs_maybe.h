#ifndef GODOTJS_QUICKJS_MAYBE_H
#define GODOTJS_QUICKJS_MAYBE_H
namespace v8
{
    template<typename T>
    class Maybe
    {
    public:
        bool IsNothing() const { return !has_value_; }
        void Check() const { }

        Maybe() = default;
        Maybe(T value) : has_value_(true), value_(value) { }

        T ToChecked() const
        {
            jsb_check(has_value_);
            return value_;
        }

        bool To(T* out) const
        {
            if (has_value_)
            {
                *out = value_;
                return true;
            }
            return false;
        }

    private:
        bool has_value_ = false;
        T value_;
    };
}
#endif
