#ifndef GODOTJS_WEB_GLOBAL_HANDLE_H
#define GODOTJS_WEB_GLOBAL_HANDLE_H
#include "jsb_web_local_handle.h"
#include "jsb_web_weak_callback_info.h"
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
        int handle_ = 0;

    public:
        bool IsEmpty() const { return isolate_ == nullptr || handle_ == 0; }

        void Reset()
        {
            if (!IsEmpty())
            {
                ::jsapi_pv_remove(isolate_->id_, handle_);
                handle_ = 0;
            }
        }

        Local<T> Get(Isolate* isolate) const
        {
            CRASH_COND(IsEmpty());
            return Local<T>(isolate_, isolate_->top_->depth_, ::jsapi_stack_push_pv(isolate_->id_, handle_));
        }

        template<typename S>
        void Reset(Isolate* isolate, const Local<S>& other)
        {
            Reset();

            isolate_ = other.data_.isolate_;
            handle_ = ::jsapi_pv_add(isolate_->id_, other.data_.stack_, other.data_.index_);
        }

        template<typename P>
        void SetWeak(P* parameter, typename WeakCallbackInfo<P>::Callback callback, WeakCallbackType type)
        {
            CRASH_COND(IsEmpty());
            jsapi_pv_set_weak(isolate_->id_, handle_, callback, parameter);
        }

        void ClearWeak()
        {
            CRASH_COND(IsEmpty());
            jsapi_pv_clear_weak(isolate_->id_, handle_);
        }
    };
}
#endif
