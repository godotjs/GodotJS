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

        return V8Helper::stringify(isolate, context, value_.Get(isolate));
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
