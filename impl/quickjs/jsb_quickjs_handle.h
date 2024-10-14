#ifndef GODOTJS_QUICKJS_HANDLE_H
#define GODOTJS_QUICKJS_HANDLE_H

#include "jsb_quickjs_pch.h"
#include "jsb_quickjs_data.h"
#include "jsb_quickjs_broker.h"
#include "jsb_quickjs_ext.h"

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

    public:
        Local() = default;

        template<typename S>
        Local(Local<S> other): data_(other.data_) {}

        bool IsEmpty() const { return !data_.isolate_; }

        T* operator->() const { return (T*) &const_cast<Local*>(this)->data_; }

        explicit operator JSValue() const
        {
            return data_.isolate_ ? jsb::impl::Broker::stack_val(data_.isolate_, data_.stack_pos_) : JS_UNDEFINED;
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
        enum WeakType { kStrong, kWeak, kWeakCallback, };

        // clear all fields silently after moved
        void _clear()
        {
            isolate_ = nullptr;
            shadow_ = nullptr;
            value_ = JS_UNDEFINED;
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
            shadow_ = other.shadow_;
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
                    shadow_ = other.shadow_;
                    value_ = other.value_;
                    other._clear();
                }
            }
            return *this;
        }

        void Reset()
        {
            if (!isolate_) return;

            // release if strong referenced
            if (weak_type_ == WeakType::kStrong)
            {
                jsb_check(is_alive());
                JS_FreeValueRT(jsb::impl::Broker::GetRuntime(isolate_), value_);
            }

            jsb::impl::Broker::remove_phantom(isolate_, shadow_);
            jsb::impl::Broker::_remove_reference(isolate_);
            isolate_ = nullptr;
            shadow_ = nullptr;
            value_ = JS_UNDEFINED;
            weak_type_ = WeakType::kStrong;
        }

        void Reset(Isolate* isolate, Local<T> value)
        {
            Reset();

            jsb_check(isolate);
            isolate_ = isolate;

            // ensure the runtime alive
            jsb::impl::Broker::_add_reference(isolate_);
            if (!value.IsEmpty())
            {
                value_ = jsb::impl::Broker::stack_dup(isolate_, value.data_.stack_pos_);
                shadow_ = JS_VALUE_GET_TAG(value_) < 0 ? JS_VALUE_GET_PTR(value_) : nullptr;
                jsb::impl::Broker::add_phantom(isolate_, shadow_);
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
                jsb::impl::Broker::SetWeak(isolate_, value_, nullptr, nullptr);
            }
            weak_type_ = WeakType::kStrong;
            JS_DupValueRT(jsb::impl::Broker::GetRuntime(isolate_), value_);
        }

        // ClearWeak() before SetWeak() if SetWeak(parameter) called priorly
        void SetWeak()
        {
            jsb_check(isolate_ && weak_type_ == WeakType::kStrong && is_alive());
            weak_type_ = WeakType::kWeak;
            JS_FreeValueRT(jsb::impl::Broker::GetRuntime(isolate_), value_);
        }

        template<typename S>
        void SetWeak(S* parameter, typename WeakCallbackInfo<S>::Callback callback, v8::WeakCallbackType type)
        {
            jsb_check(isolate_ && weak_type_ == WeakType::kStrong && is_alive());
            jsb::impl::Broker::SetWeak(isolate_, value_, parameter, (void*) callback);
            weak_type_ = WeakType::kWeakCallback;
            JS_FreeValueRT(jsb::impl::Broker::GetRuntime(isolate_), value_);
        }

        bool IsEmpty() const { return !isolate_; }

        Local<T> Get(Isolate* isolate) const
        {
            jsb_check(isolate_ == isolate && isolate_ && is_alive());
            return Local<T>(Data(isolate_, jsb::impl::Broker::push_copy(isolate_, value_)));
        }

        explicit operator JSValue() const
        {
            jsb_check(isolate_ && is_alive());
            return value_;
        }

        template <typename S>
        bool operator==(const Global<S>& other) const
        {
            return shadow_ == other.shadow_ || jsb::impl::QuickJS::Equals(value_, other.value_);
        }

        template <typename S>
        bool operator!=(const Global<S>& other) const
        {
            return !operator==(other);
        }

    private:
        bool is_alive() const { return !shadow_ || jsb::impl::Broker::is_phantom_alive(isolate_, shadow_); }

        Isolate* isolate_ = nullptr;

        // JSObject pointer shadow
        void* shadow_ = nullptr;

        // a shadow copy of object without reference control
        JSValue value_;

        WeakType weak_type_ = WeakType::kStrong;
    };
}

#endif
