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

    String JSValueMove::to_string() const
    {
        if (!is_valid())
        {
            return String();
        }

        v8::Isolate* isolate = realm_->get_isolate();
        v8::Isolate::Scope isolate_scope(isolate);
        v8::HandleScope handle_scope(isolate);
        v8::Local<v8::Context> context = realm_->unwrap();
        v8::Context::Scope context_scope(context);

        v8::Local<v8::Value> value = value_.Get(isolate);
        v8::Local<v8::String> str_value;
        if (const v8::MaybeLocal<v8::String> maybe = value->ToDetailString(context); maybe.ToLocal(&str_value))
        {
            return V8Helper::to_string(isolate, str_value);
        }
        return String();
    }

}
