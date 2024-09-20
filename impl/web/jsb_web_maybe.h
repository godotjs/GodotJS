#ifndef GODOTJS_WEB_MAYBE_H
#define GODOTJS_WEB_MAYBE_H
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

        T ToChecked() const
        {
            CRASH_COND(!has_value_);
            return value_;
        }
    };
}
#endif
