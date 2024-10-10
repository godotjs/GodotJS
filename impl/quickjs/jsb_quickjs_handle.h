#ifndef GODOTJS_QUICKJS_HANDLE_H
#define GODOTJS_QUICKJS_HANDLE_H

#include "jsb_quickjs_pch.h"
#include "jsb_quickjs_data.h"
#include "jsb_quickjs_isolate.h"

namespace v8
{
    template <typename T>
    class Global;

    template <typename T>
    class Local
    {
        template <typename U>
        friend class Global<U>;
        friend class Isolate;
        friend class Context;

    public:
        Local() = default;

        template<typename S>
        Local(Local<S> other): data_(other.data_) {}

        bool IsEmpty() const { return !data_.isolate_; }

        T* operator->() const { return (T*) &const_cast<Local*>(this)->data_; }

        explicit operator JSValue() const { return (JSValue) data_; }

        template<typename S>
        Local<S> As() const { return Local<S>(data_); }

        Local(const Data data): data_(data) {}

        bool operator==(const Local& other) const
        {
            return data_ == other.data_;
        }

    private:
        Data data_;
    };

    template<typename T>
    class MaybeLocal
    {
    public:
        MaybeLocal() = default;
        MaybeLocal(const Data data): data_(data) {}

        template<typename S>
        MaybeLocal(MaybeLocal<S> other) : data_(other.data_) {}

        bool IsEmpty() const { return !data_.isolate_; }
        Local<T> ToLocalChecked() const
        {
            jsb_check(!IsEmpty());
            return Local<T>(data_);
        }

        bool ToLocal(Local<T>* out) const
        {
            *out = Local<T>(data_);
            return !IsEmpty();
        }

    private:
        Data data_;
    };

    enum class WeakCallbackType
    {
        kParameter,
        kInternalFields,
    };

    template<typename T>
    class WeakCallbackInfo
    {
    public:
        using Callback = void (*)(const WeakCallbackInfo& data);

        WeakCallbackInfo(Isolate* isolate, T* parameter): isolate_(isolate), parameter_(parameter) {}
        Isolate* GetIsolate() const { return isolate_; }
        T* GetParameter() const { return parameter_; }

    private:
        Isolate* isolate_;
        T* parameter_;
    };

    template <typename T>
    class Global
    {
    public:
        Global() = default;
        ~Global() { Reset(); }

        void Reset()
        {
            if (!isolate_) return;
            // release if strong referenced
            if (!weak_)
            {
                jsb_check(is_alive());
                JS_FreeValueRT(isolate_->rt(), value_);
            }

            isolate_ = nullptr;
            id_ = {};
            weak_ = false;
        }

        void Reset(Isolate* isolate, Local<T> value)
        {
            Reset();
            isolate_ = isolate;

            value_ = isolate_[value.data_.stack_pos_];
            weak_ = false;
            JS_DupValueRT(isolate_->rt(), value_);
        }

        void ClearWeak()
        {
            jsb_check(isolate_ && weak_ && is_alive());
            weak_ = false;
            JS_DupValueRT(isolate_->rt(), value_);
        }

        void SetWeak()
        {
            jsb_check(isolate_ && !weak_ && is_alive());
            weak_ = true;
            JS_FreeValueRT(isolate_->rt(), value_);
        }

        template<typename S>
        void SetWeak(S* parameter, typename WeakCallbackInfo<S>::Callback callback, v8::WeakCallbackType type)
        {
            jsb_check(isolate_ && !weak_ && is_alive());
            const jsb::internal::Index64 index = (jsb::internal::Index64)(uintptr_t) JS_GetOpaque(value_, Isolate::get_class_id());
            const jsb::impl::InternalDataPtr data = isolate_->get_internal_data(index);
            jsb_check(!data->weak.callback);
            data->weak.parameter = (void*) parameter;
            data->weak.callback = (void*) callback;
            weak_ = true;
            JS_FreeValueRT(isolate_->rt(), value_);
        }

        bool IsEmpty() const { return !isolate_ || !id_; }

        Local<T> Get(Isolate* isolate) const
        {
            jsb_check(isolate_ == isolate && isolate_ && is_alive());
            return Local<T>(Data(isolate_, isolate_->push_copy(value_)));
        }

    private:
        bool is_alive() const { return id_ && isolate_->internal_data_.is_valid_index(id_); }

        Isolate* isolate_ = nullptr;

        // internal data id (check liveness)
        jsb::internal::Index64 id_;

        // a shadow copy of object without reference control
        JSValue value_;

        bool weak_ = false;
    };
}

#endif
