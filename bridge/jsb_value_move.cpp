#include "jsb_value_move.h"
#include "jsb_bridge_helper.h"
#include "jsb_environment.h"
#include "jsb_type_convert.h"

namespace jsb
{
    JSValueMove::JSValueMove(const std::shared_ptr<Environment>& p_env, const v8::Local<v8::Value>& p_value)
    {
        jsb_check(p_env);
        env_ = p_env;
        value_.Reset(env_->get_isolate(), p_value);
    }

    bool JSValueMove::is_valid() const
    {
        return env_ && !value_.IsEmpty();
    }

    Variant JSValueMove::to_variant() const
    {
        if (!is_valid()) return {};
        v8::Isolate* isolate = env_->get_isolate();
        v8::Isolate::Scope isolate_scope(isolate);
        v8::HandleScope handle_scope(isolate);
        v8::Local<v8::Context> context = env_->get_context();
        v8::Context::Scope context_scope(context);

        Variant val;
        TypeConvert::js_to_gd_var(isolate, context, value_.Get(isolate), val);
        return val;
    }

    String JSValueMove::to_string() const
    {
        if (!is_valid()) return {};
        v8::Isolate* isolate = env_->get_isolate();
        v8::Isolate::Scope isolate_scope(isolate);
        v8::HandleScope handle_scope(isolate);
        v8::Local<v8::Context> context = env_->get_context();
        v8::Context::Scope context_scope(context);

        return BridgeHelper::stringify(isolate, context, value_.Get(isolate));
    }
}
