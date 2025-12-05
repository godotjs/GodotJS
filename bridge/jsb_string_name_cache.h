#ifndef GODOTJS_STRING_NAME_CACHE_H
#define GODOTJS_STRING_NAME_CACHE_H
#include "jsb_bridge_pch.h"
#include "jsb_ref.h"
#include "jsb_bridge_helper.h"

namespace jsb
{
    template<int kMaxCacheSize>
    struct TStringNameCache
    {
    private:
        static_assert(kMaxCacheSize <= 0 || kMaxCacheSize > 32, "StringNameCache: max size must be 0 or > 32");
        
        struct Slot
        {
            StringName name_;
            TStrongRef<v8::String> ref_;

            Slot() = default;
            Slot(const StringName& p_name) : name_(p_name), ref_() {}
            Slot(const Slot&) = default;
            Slot& operator=(const Slot&) = default;
            Slot(Slot&& other) noexcept = default;
            Slot& operator=(Slot&& other) noexcept = default;
            ~Slot() = default;
        };

        // StringName => StringNameID
        HashMap<StringName, StringNameID> name_index;

        // JSValue => StringNameID
        internal::TypeGen<TStrongRef<v8::String>, StringNameID>::UnorderedMap value_index_; // backlink

        // List< StringName+JSValue >
        // managed as a least recently used cache if max_size_ > 0
        internal::SArray<Slot, StringNameID> values_;

    public:
        TStringNameCache()
        {
            // jsb_check(max_size_ <= 0 || max_size_ > 32);
            values_.reserve(kMaxCacheSize);
        }
        
        void clear()
        {
            name_index.clear();
            value_index_.clear();
            values_.clear();
        }

        // [reserved] only called on low memory. 
        void shrink() {}

        jsb_force_inline int size() const { return values_.size(); }

        bool try_get_string_name(v8::Isolate* isolate, const v8::Local<v8::Value>& p_value, StringName& r_string_name) const 
        {
            if (p_value->IsString()) return try_get_string_name(isolate, p_value.As<v8::String>(), r_string_name);
            r_string_name = {};
            return false;
        }

        bool try_get_string_name(v8::Isolate* isolate, const v8::Local<v8::String>& p_value, StringName& r_string_name) const 
        {
            if (const auto& it = value_index_.find(TStrongRef(isolate, p_value)); it != value_index_.end())
            {
                const StringNameID id = it->second;
                r_string_name = values_[id].name_;
                const_cast<TStringNameCache*>(this)->mark_as_used(id);
                return true;
            }
            r_string_name = {};
            return false;
        }

        bool is_string_value_cached(v8::Isolate* isolate, const v8::Local<v8::String>& p_value) const 
        {
            StringName unused;
            return try_get_string_name(isolate, p_value, unused);
        }

        StringName get_string_name(v8::Isolate* isolate, const v8::Local<v8::String>& p_value)
        {
            if (const auto& it = value_index_.find(TStrongRef(isolate, p_value)); it != value_index_.end())
            {
                const StringNameID id = it->second;
                const StringName name = values_[id].name_;
                
                mark_as_used(id);
                return name;
            }
            else
            {
                const StringName name = impl::Helper::to_string(isolate, p_value);
                const StringNameID id = get_string_id(isolate, name);
                Slot& slot = values_[id];
                if (slot.ref_ && slot.ref_.object_ != p_value)
                {
                    const size_t removed = value_index_.erase(slot.ref_);
                    JSB_LOG(Verbose, "(not recommended) update an existing string name %s", name);
                    jsb_check(removed == 1);
                }
                slot.ref_ = TStrongRef(isolate, p_value);
                value_index_.insert(std::pair(TStrongRef(isolate, p_value), id));
                JSB_LOG(VeryVerbose, "new string name pair (js) %s %d [slots:%d]", name, id, values_.size());
                return name;
            }
        }

        v8::Local<v8::String> get_string_value(v8::Isolate* isolate, const StringName& p_name)
        {
            const StringNameID id = get_string_id(isolate, p_name);
            Slot& slot = values_[id];
            if (!slot.ref_)
            {
                const v8::Local<v8::String> str_val = impl::Helper::new_string(isolate, p_name);
                slot.ref_ = TStrongRef(isolate, str_val);
                value_index_.insert(std::pair(TStrongRef(isolate, str_val), id));
                JSB_LOG(VeryVerbose, "new string name pair (cpp) %s %d [slots:%d]", p_name, id, values_.size());
                return str_val;
            }
            return slot.ref_.object_.Get(isolate);
        }
        
    private:
        void mark_as_used(const StringNameID id)  
        {
            if constexpr (kMaxCacheSize <= 0) return;

            values_.move_to_back(id);
            jsb_check(values_.is_valid_index(id));
            jsb_check(values_.get_last_index() == id);
        }
        
        
        void remove_the_least_used(v8::Isolate* isolate)
        {
            if constexpr (kMaxCacheSize <= 0) return;
            if (values_.size() < kMaxCacheSize) return;
            
            const StringNameID id = values_.get_first_index();
            const Slot& slot = values_[id];
            value_index_.erase(slot.ref_);
            name_index.erase(slot.name_);
            const StringNameID removed_id = values_.remove_first();
            jsb_check(removed_id == id);
            jsb_unused(removed_id);
            JSB_LOG(VeryVerbose, "remove the least used string name %s %d [slots: %d]", slot.name_, id, values_.size());
        }
        
        StringNameID get_string_id(v8::Isolate* isolate, const StringName& p_string_name)
        {
            if (const HashMap<StringName, StringNameID>::Iterator& it = name_index.find(p_string_name); it)
            {
                mark_as_used(it->value);
                return it->value;
            }
            
            remove_the_least_used(isolate);
            const StringNameID id = values_.add(Slot(p_string_name));
            name_index.insert(p_string_name, id);
            JSB_LOG(VeryVerbose, "new string name (plain) %s %d [slots:%d]", p_string_name, id, values_.size());
            return id;
        }

    };

    typedef TStringNameCache<JSB_STRING_NAME_CACHE_SIZE> StringNameCache;
}
#endif
