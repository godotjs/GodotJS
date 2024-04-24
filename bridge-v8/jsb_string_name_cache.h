#ifndef GODOTJS_STRING_NAME_CACHE_H
#define GODOTJS_STRING_NAME_CACHE_H
#include "jsb_pch.h"
#include "jsb_ref.h"
#include "jsb_v8_helper.h"

namespace jsb
{
    struct StringNameCache
    {
    private:
        struct Slot
        {
            StringName name_;
            TStrongRef<v8::String> ref_;
        };

        // StringName => StringNameID
        HashMap<StringName, StringNameID> name_index;

        // JSValue => StringNameID
        std::unordered_map<TWeakRef<v8::String>, StringNameID, TWeakRef<v8::String>::hasher, TWeakRef<v8::String>::equaler> value_index_; // backlink

        // List< StringName+JSValue >
        internal::SArray<Slot, StringNameID> values_;

    public:
        void clear()
        {
            name_index.clear();
            value_index_.clear();
            values_.clear();
        }

        StringNameID get_string_id(const StringName& p_string_name)
        {
            if (const HashMap<StringName, StringNameID>::Iterator& it = name_index.find(p_string_name); it)
            {
                return it->value;
            }
            const StringNameID id = values_.add({ p_string_name, {} });
            name_index.insert(p_string_name, id);
            return id;
        }

        StringName get_string_name(StringNameID p_id)
        {
            return values_[p_id].name_;
        }

        StringName get_string_name(v8::Isolate* isolate, const v8::Local<v8::String>& p_value)
        {
            StringName name = V8Helper::to_string(isolate, p_value);
            if (const auto& it = value_index_.find(TWeakRef(isolate, p_value)); it != value_index_.end())
            {
                const StringNameID id = it->second;
                return values_[id].name_;
            }
            else
            {
                StringNameID id = get_string_id(name);
                Slot& slot = values_[id];
                slot.ref_ = TStrongRef(isolate, p_value);
                value_index_.insert(std::pair(TWeakRef(isolate, p_value), id));
                return name;
            }
        }

        v8::Local<v8::String> get_string_value(v8::Isolate* isolate, const StringName& p_name)
        {
            StringNameID id = get_string_id(p_name);
            Slot& slot = values_[id];
            if (!slot.ref_)
            {
                v8::Local<v8::String> str_val = V8Helper::to_string(isolate, p_name);
                slot.ref_ = TStrongRef(isolate, str_val);
                value_index_.insert(std::pair(TWeakRef(isolate, str_val), id));
                return str_val;
            }
            return slot.ref_.object_.Get(isolate);
        }
    };
}
#endif
