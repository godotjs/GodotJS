#ifndef GODOTJS_FUNCTION_H
#define GODOTJS_FUNCTION_H

#include "jsb_bridge_pch.h"

namespace jsb
{
    /**
     * a javascript object reference (weak)
     * @note it can be used as key of `std:unordered_map`, but can not be used as key of `HashMap` since `move` is not supported by `HashMap`
     */
    template <typename T = v8::Object>
    struct TWeakRef
    {
        struct hasher
        {
            jsb_force_inline size_t operator()(const TWeakRef& obj) const noexcept { return obj.hash(); }
        };
        struct equaler
        {
            jsb_force_inline bool operator()(const TWeakRef& lhs, const TWeakRef& rhs) const { return lhs == rhs; }
        };

        int hash_;
        v8::Global<T> object_;

        TWeakRef(v8::Isolate* p_isolate, const v8::Global<T>& p_object)
        {
            hash_ = p_object.Get(p_isolate)->GetIdentityHash();
            object_.Reset(p_isolate, p_object);
            object_.SetWeak();
        }

        TWeakRef(v8::Isolate* p_isolate, const v8::Local<T>& p_object)
        {
            hash_ = p_object->GetIdentityHash();
            object_.Reset(p_isolate, p_object);
            object_.SetWeak();
        }

        TWeakRef(const TWeakRef&) = delete;
        TWeakRef& operator=(const TWeakRef& p_other) noexcept = delete;

        ~TWeakRef() = default;
        TWeakRef(TWeakRef&& p_other) noexcept = default;
        TWeakRef& operator=(TWeakRef&& p_other) noexcept = default;

        jsb_force_inline explicit operator bool() const { return !object_.IsEmpty(); }

        jsb_force_inline friend bool operator==(const TWeakRef& lhs, const TWeakRef& rhs)
        {
            return // lhs.hash_ == rhs.hash_ &&
                lhs.object_ == rhs.object_;
        }

        jsb_force_inline friend bool operator!=(const TWeakRef& lhs, const TWeakRef& rhs)
        {
            return !(lhs == rhs);
        }

        jsb_force_inline uint32_t hash() const
        {
            return (uint32_t) hash_;
        }
    };

    template <typename T = v8::Object>
    struct TStrongRef
    {
        struct hasher
        {
            jsb_force_inline size_t operator()(const TStrongRef& obj) const noexcept { return obj.hash(); }
        };
        struct equaler
        {
            jsb_force_inline bool operator()(const TStrongRef& lhs, const TStrongRef& rhs) const { return lhs == rhs; }
        };

        int hash_;
        v8::Global<T> object_;
        int ref_count_;

        TStrongRef()
            : hash_(0), object_(), ref_count_(1) {}
        TStrongRef(v8::Isolate* p_isolate, const v8::Local<T>& p_object)
        {
            hash_ = p_object->GetIdentityHash();
            object_.Reset(p_isolate, p_object);
            ref_count_ = 1;
        }

        TStrongRef(const TStrongRef&) = delete;
        TStrongRef& operator=(const TStrongRef& p_other) noexcept = delete;

        ~TStrongRef() = default;
        TStrongRef(TStrongRef&& p_other) noexcept = default;
        TStrongRef& operator=(TStrongRef&& p_other) noexcept = default;

        jsb_force_inline explicit operator bool() const { return !object_.IsEmpty(); }

        void ref()
        {
            jsb_check(ref_count_ > 0);
            ++ref_count_;
        }
        bool unref()
        {
            jsb_check(ref_count_ > 0);
            return --ref_count_ == 0;
        }

        jsb_force_inline friend bool operator==(const TStrongRef& lhs, const TStrongRef& rhs)
        {
            return // lhs.hash_ == rhs.hash_ &&
                lhs.object_ == rhs.object_;
        }

        jsb_force_inline friend bool operator!=(const TStrongRef& lhs, const TStrongRef& rhs)
        {
            return !(lhs == rhs);
        }

        jsb_force_inline uint32_t hash() const
        {
            return (uint32_t) hash_;
        }
    };
} // namespace jsb

#endif
