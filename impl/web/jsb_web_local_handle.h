#ifndef GODOTJS_WEB_LOCAL_HANDLE_H
#define GODOTJS_WEB_LOCAL_HANDLE_H

#include "jsb_web_primitive_data.h"
#include "core/error/error_macros.h"

namespace v8
{
    template<typename T>
    class Local
    {
    private:
        Data data_;

    public:
        Local() : data_() {}
        Local(class Isolate* isolate, uint32_t address)
            : data_ { isolate, address }
        {
        }

        template<typename S>
        Local(const Local<S>& other) : data_(other.data()) {}

        template<typename S>
        Local<S> As() const { return Local<S>(*this); }

        bool IsEmpty() const
        {
            return !data_.is_valid();
        }

        T* operator->() const { return static_cast<T*>(&data_); }
        bool operator==(const Local<T>& other) const { return data_ == other.data_; }
    };

    template<typename T>
    class MaybeLocal
    {
    private:
        Data data_;

    public:
        template<typename S>
        bool ToLocal(Local<S>* out) const
        {
            *out = Local<S>(data_.isolate_, data_.address_);
            return data_.is_valid();
        }

        bool IsEmpty() const { return data_.is_valid(); }

        Local<T> ToLocalChecked()
        {
            CRASH_COND(IsEmpty());
            return Local<T>(data_.isolate_, data_.address_);
        }
    };
}

#endif
