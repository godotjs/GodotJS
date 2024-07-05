#include "jsb_value_move.h"
#include "jsb_realm.h"
#include "jsb_v8_helper.h"

namespace jsb
{
    JSValueMove::JSValueMove(const std::shared_ptr<Realm>& p_realm, const v8::Local<v8::Value>& p_value)
    {
        realm_ = p_realm;
        jsb_check(realm_);
        value_.Reset(realm_->get_isolate(), p_value);
    }

    bool JSValueMove::is_valid() const
    {
        return realm_ && !value_.IsEmpty();
    }

    Variant inspect_fallback(v8::Isolate* isolate, const v8::Local<v8::Context>& context, const v8::Local<v8::Value>& p_val)
    {
        v8::Local<v8::String> str_value;
        if (const v8::MaybeLocal<v8::String> maybe = p_val->ToDetailString(context); maybe.ToLocal(&str_value))
        {
            return V8Helper::to_string(isolate, str_value);
        }
        return {};
    }

    // plain JSObject
    Variant inspect_plain_object(v8::Isolate* isolate, const v8::Local<v8::Context>& context, const v8::Local<v8::Object>& p_val)
    {
        // v8::Local<v8::String> str;
        // if (v8::JSON::Stringify(context, p_val).ToLocal(&str))
        // {
        //     return V8Helper::to_string(isolate, str);
        // }
        return inspect_fallback(isolate, context, p_val);
    }

    Variant inspect(v8::Isolate* isolate, const v8::Local<v8::Context>& context, const v8::Local<v8::Value>& p_val)
    {
        if (p_val->IsObject())
        {
            v8::Local<v8::Object> self = p_val.As<v8::Object>();
            switch (self->InternalFieldCount())
            {
            case IF_ObjectFieldCount:
                {
                    Object* pointer = (Object*) self->GetAlignedPointerFromInternalField(IF_Pointer);
#if JSB_VERIFY_OBJECT
                    const NativeClassInfo* class_info = Environment::wrap(isolate)->find_object_class(pointer);
                    if (!class_info || class_info->type != NativeClassType::GodotObject)
                    {
                        return vformat("BadPointer: %s", uitos((uintptr_t) pointer));
                    }
#endif
                    return vformat("Object: %s", pointer ? "null" : pointer->to_string());
                }
            case IF_VariantFieldCount:
                {
                    Variant* pointer = (Variant*) self->GetAlignedPointerFromInternalField(IF_Pointer);
                    jsb_check(pointer);
                    return vformat("Variant: %s", pointer->to_json_string());
                }
            default:
                return vformat("JSObject: %s", self->GetIdentityHash());
            }
        }

        return inspect_fallback(isolate, context, p_val);
    }

    Variant JSValueMove::to_variant() const
    {
        if (!is_valid()) return {};
        v8::Isolate* isolate = realm_->get_isolate();
        v8::Isolate::Scope isolate_scope(isolate);
        v8::HandleScope handle_scope(isolate);
        v8::Local<v8::Context> context = realm_->unwrap();
        v8::Context::Scope context_scope(context);

        Variant val;
        Realm::js_to_gd_var(isolate, context, value_.Get(isolate), val);
        return val;
    }

    String JSValueMove::to_string() const
    {
        if (!is_valid()) return {};
        v8::Isolate* isolate = realm_->get_isolate();
        v8::Isolate::Scope isolate_scope(isolate);
        v8::HandleScope handle_scope(isolate);
        v8::Local<v8::Context> context = realm_->unwrap();
        v8::Context::Scope context_scope(context);

        return inspect(isolate, context, value_.Get(isolate));
    }

    // Vector<String> JSValueMove::to_strings() const
    // {
    //     if (!is_valid()) return {};
    //
    //     v8::Isolate* isolate = realm_->get_isolate();
    //     v8::Isolate::Scope isolate_scope(isolate);
    //     v8::HandleScope handle_scope(isolate);
    //     v8::Local<v8::Context> context = realm_->unwrap();
    //     v8::Context::Scope context_scope(context);
    //     v8::Local<v8::Value> value = value_.Get(isolate);
    //     if (!value->IsArray())
    //     {
    //         return {};
    //     }
    //
    //     v8::Local<v8::Array> array = value.As<v8::Array>();
    //     const int len = (int) array->Length();
    //     Vector<String> results;
    //     results.resize_zeroed(len);
    //     for (int index = 0; index < len; ++index)
    //     {
    //         v8::Local<v8::Value> out_value;
    //         if (array->Get(context, index).ToLocal(&out_value))
    //         {
    //             v8::Local<v8::String> str_value;
    //             if (const v8::MaybeLocal<v8::String> maybe = out_value->ToDetailString(context); maybe.ToLocal(&str_value))
    //             {
    //                 results.write[index] = V8Helper::to_string(isolate, str_value);
    //             }
    //         }
    //     }
    //     return results;
    // }

}
