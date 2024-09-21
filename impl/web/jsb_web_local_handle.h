#ifndef GODOTJS_WEB_LOCAL_HANDLE_H
#define GODOTJS_WEB_LOCAL_HANDLE_H

#include "jsb_web_primitive_data.h"
#include "core/error/error_macros.h"

namespace v8
{
    class Isolate;

    template<typename T>
    class Local
    {
    public:
        Data data_;

        Local() {}
        Local(Isolate* isolate, int depth, int offset)
            : data_(isolate, depth, offset) {}

        template<typename S>
        Local(Local<S> other) : data_(other.data())
        {
            static_assert(std::is_base_of_v<T, S>, "type check");
        }

        template<typename S>
        Local<S> As() const { return Local<S>(*this); }

        template<typename S>
        static Local<S> Cast(Local<S> other) { return other.template As<S>(); }

        bool IsEmpty() const { return !data_.is_valid(); }

        T* operator->() const { return static_cast<T*>(&data_); }

        template<typename S>
        bool operator==(const Local<S>& b) const
        {
            return data_ == b.data_;
        }

        template<typename S>
        bool operator!=(const Local<S>& b) const
        {
            return !(data_ == b.data_);
        }
    };

    template<typename T>
    class MaybeLocal
    {
    public:
        Data data_;

        MaybeLocal() {}

        template<typename S>
        MaybeLocal(Local<S> other) : data_(other.data_) {}

        bool IsEmpty() const { return data_.is_valid(); }

        template<typename S>
        bool ToLocal(Local<S>* out) const
        {
            *out = Local<S>(data_.isolate_, data_.stack_, data_.index_);
            return !out->IsEmpty();
        }

        Local<T> ToLocalChecked()
        {
            CRASH_COND(IsEmpty());
            return Local<T>(data_.isolate_, data_.stack_, data_.index_);
        }
    };
}

#endif
