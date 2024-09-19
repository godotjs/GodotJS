#ifndef GODOTJS_WEB_GLOBAL_HANDLE_H
#define GODOTJS_WEB_GLOBAL_HANDLE_H
#include "jsb_web_local_handle.h"
#include "jsb_web_weak_callback_info.h"
#include "jsb_web_value.h"
#include "jsb_web_isolate.h"
#include "core/error/error_macros.h"
#include "platform/macos/godot_open_save_delegate.h"

namespace v8
{
    class Isolate;

    template<typename T>
    class Global
    {
    private:
        Isolate* isolate_ = nullptr;
        jsb::vm::JSValue value_ = {};
        void* weak_handle_ = nullptr;

    public:
        bool IsEmpty() const
        {
            return value_.type == jsb::vm::JSValue::Uninitialized;
        }

        void Reset()
        {
            if (value_.u.ptr != nullptr)
            {
                ::jsb_web_value_remove_ref(isolate_->id_, value_.u.ptr);
                isolate_ = nullptr;
                value_.u.ptr = nullptr;
            }
        }

        Local<T> Get(Isolate* isolate) const
        {
            CRASH_COND(IsEmpty());
            return Local<T>(isolate_, isolate_->alloc_value(value_));
        }

        template<typename S>
        void Reset(Isolate* isolate, const Local<S>& other)
        {
            Reset();

            isolate_ = other.data_.isolate_;
            value_ = isolate_->_at(other.data_.address_);
            ::jsb_web_value_add_ref(isolate_->id_, value_.u.ptr);
        }

        template<typename P>
        void SetWeak(P* parameter, typename WeakCallbackInfo<P>::Callback callback, WeakCallbackType type)
        {
            CRASH_COND_MSG(weak_handle_ != nullptr, "already weak");
            CRASH_COND_MSG(type != WeakCallbackType::kParameter, "not supported");
            CRASH_COND(value_.type >= 0);
            weak_handle_ = ::jsb_web_value_set_weak(isolate_->id_, value_.u.ptr, callback, parameter);
        }

        void ClearWeak()
        {
            if (weak_handle_ != nullptr)
            {
                ::jsb_web_value_clear_weak(isolate_->id_, weak_handle_);
                weak_handle_ = nullptr;
            }
        }
    };
}
#endif
