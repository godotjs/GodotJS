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

        Maybe(T value) : has_value_(true), value_(value) { }

    private:
        bool has_value_ = false;
        T value_;
    };
}
#endif
