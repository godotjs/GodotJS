#ifndef GODOTJS_WEB_HANDLE_H
#define GODOTJS_WEB_HANDLE_H

#include "jsb_web_pch.h"
#include "jsb_web_data.h"
#include "jsb_web_broker.h"
#include "jsb_web_ext.h"

namespace jsb::impl
{
    class Helper;
}

namespace v8
{
    template <typename T>
    class Global;

    template <typename T>
    class MaybeLocal;

    template <typename T>
    class Local
    {
        // static_assert(sizeof(T) == sizeof(Data));

        template <typename S>
        friend class Global;

        template <typename S>
        friend class Local;

        template <typename S>
        friend class MaybeLocal;

        friend class Isolate;
        friend class Context;
        friend class jsb::impl::Helper;

    public:
        Local() = default;

        template<typename S>
        Local(Local<S> other): data_(other.data_) {}

        bool IsEmpty() const { return !data_.isolate_; }

        T* operator->() const { return (T*) &const_cast<Local*>(this)->data_; }

        explicit operator jsb::impl::StackPosition() const
        {
            return data_.isolate_ ? data_.stack_pos_ : jsb::impl::StackBase::Undefined;
        }

        template <typename S>
        Local<S> As() const { return Local<S>(data_); }

        Local(const Data data): data_(data) {}

        template <typename S>
        bool operator==(const Local<S>& other) const
        {
            return data_ == other.data_;
        }

        template <typename S>
        bool operator!=(const Local<S>& other) const
        {
            return !operator==(other);
        }

    private:
        Data data_;
    };

    template<typename T>
    class MaybeLocal
    {
        template <typename S>
        friend class MaybeLocal;

    public:
        MaybeLocal() = default;
        MaybeLocal(const Data data): data_(data) {}

        template<typename S>
        MaybeLocal(MaybeLocal<S> other) : data_(other.data_) {}

        template<typename S>
        MaybeLocal(Local<S> other) : data_(other.data_) {}

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

        WeakCallbackInfo(Isolate* isolate, T* parameter, void** internal_fields): isolate_(isolate), parameter_(parameter), internal_fields_(internal_fields) {}
        Isolate* GetIsolate() const { return isolate_; }
        T* GetParameter() const { return parameter_; }
        void* GetInternalField(int index) const { jsb_check(index == 0 || index == 1); return internal_fields_[index]; }

    private:
        Isolate* isolate_;
        T* parameter_;
        void** internal_fields_;
    };

    template <typename T>
    class Global
    {
        enum WeakType { kStrong, kWeak, kWeakCallback, };

        // clear all fields silently after moved
        void _clear()
        {
            isolate_ = nullptr;
            value_ = -1;
            weak_type_ = WeakType::kStrong;
        }

    public:
        Global() = default;
        Global(Isolate* isolate, Local<T> value) { Reset(isolate, value); }

        Global(const Global&) = delete;
        Global& operator=(const Global&) = delete;

        ~Global() { Reset(); }

        Global(Global&& other) noexcept
        {
            isolate_ = other.isolate_;
            weak_type_ = other.weak_type_;
            value_ = other.value_;
            other._clear();
        }

        template <typename S>
        Global& operator=(Global<S>&& other)
        {
            if (this != &other)
            {
                Reset();
                if (!other.IsEmpty())
                {
                    isolate_ = other.isolate_;
                    weak_type_ = other.weak_type_;
                    value_ = other.value_;
                    other._clear();
                }
            }
            return *this;
        }

        void Reset()
        {
            if (!isolate_) return;

            switch (weak_type_)
            {
            case WeakType::kStrong:
                {
                    // release if strong referenced
                    jsb_check(is_alive());
                    jsbi_handle_Reset(jsb::impl::Broker::get_engine(isolate_), value_);
                    break;
                }
            case WeakType::kWeakCallback:
                {
                    // clear callback
                    jsb_check(is_alive());
                    jsb::impl::Broker::SetWeakCallback(isolate_, value_, nullptr, nullptr);
                    jsbi_handle_Reset(jsb::impl::Broker::get_engine(isolate_), value_);
                    break;
                }
            default: break;
            }

            isolate_ = nullptr;
            value_ = -1;
            weak_type_ = WeakType::kStrong;
        }

        void Reset(Isolate* isolate, Local<T> value)
        {
            Reset();

            jsb_check(isolate);
            isolate_ = isolate;

            if (!value.IsEmpty())
            {
                value_ = jsbi_handle_New(jsb::impl::Broker::get_engine(isolate_), value.data_.stack_pos_);
                weak_type_ = WeakType::kStrong;
            }
        }

        void Reset(Isolate* isolate, const Global& value)
        {
            Reset(isolate, value.Get(isolate));
        }

        void ClearWeak()
        {
            jsb_check(isolate_ && weak_type_ != WeakType::kStrong && is_alive());

            if (weak_type_ == WeakType::kWeakCallback)
            {
                // clear callback
                jsb::impl::Broker::SetWeakCallback(isolate_, value_, nullptr, nullptr);
            }
            weak_type_ = WeakType::kStrong;
            jsbi_handle_ClearWeak(jsb::impl::Broker::get_engine(isolate_), value_);
        }

        // ClearWeak() before SetWeak() if SetWeak(parameter) called priorly
        void SetWeak()
        {
            jsb_check(isolate_ && weak_type_ == WeakType::kStrong && is_alive());

            weak_type_ = WeakType::kWeak;
            jsbi_handle_SetWeak(jsb::impl::Broker::get_engine(isolate_), value_);
        }

        template<typename S>
        void SetWeak(S* parameter, typename WeakCallbackInfo<S>::Callback callback, v8::WeakCallbackType type)
        {
            jsb_check(isolate_ && weak_type_ == WeakType::kStrong && is_alive());

            jsb::impl::Broker::SetWeakCallback(isolate_, value_, parameter, (void*) callback);
            weak_type_ = WeakType::kWeakCallback;
            jsbi_handle_SetWeak(jsb::impl::Broker::get_engine(isolate_), value_);
        }

        // Return true if no value held by this handle, or dead for a weak handle.
        bool IsEmpty() const { return !isolate_ || !is_alive(); }

        Local<T> Get(Isolate* isolate) const
        {
            jsb_check(isolate_ == isolate && isolate_ && is_alive());
            return Local<T>(Data(isolate_, jsbi_handle_PushStack(jsb::impl::Broker::get_engine(isolate_), value_)));
        }

        template <typename S>
        bool operator==(const Global<S>& other) const
        {
            const jsb::impl::JSRuntime engine = jsb::impl::Broker::get_engine(isolate_);
            return jsbi_handle_eq(engine, value_, other.value_);
        }

        template <typename S>
        bool operator!=(const Global<S>& other) const
        {
            return !operator==(other);
        }

    private:
        bool is_alive() const { return jsbi_handle_IsValid(jsb::impl::Broker::get_engine(isolate_), value_); }

        Isolate* isolate_ = nullptr;

        jsb::impl::HandleID value_ = -1;

        WeakType weak_type_ = WeakType::kStrong;
    };

}

#endif
