#include "jsb_script_instance.h"
#include "jsb_script_language.h"

jsb::ScriptClassInfoPtr GodotJSScriptInstance::get_script_class() const
{
    return env_->get_script_class(class_id_);
}

bool GodotJSScriptInstance::set(const StringName& p_name, const Variant& p_value)
{
    const jsb::ScriptClassInfoPtr class_info = get_script_class();
    if (const auto& it = class_info->properties.find(p_name); it)
    {
        return env_->set_script_property_value(object_id_, it->value, p_value);
    }
    return false;
}

bool GodotJSScriptInstance::get(const StringName& p_name, Variant& r_ret) const
{
    const jsb::ScriptClassInfoPtr class_info = get_script_class();
    if (const auto& it = class_info->properties.find(p_name); it)
    {
        return env_->get_script_property_value(object_id_, it->value, r_ret);
    }
    return false;
}

void GodotJSScriptInstance::get_property_list(List<PropertyInfo>* p_properties) const
{
    script_->get_script_property_list(p_properties);
}

const Variant GodotJSScriptInstance::get_rpc_config() const
{
    return get_script_class()->rpc_config;
}

Variant::Type GodotJSScriptInstance::get_property_type(const StringName& p_name, bool* r_is_valid) const
{
    const jsb::ScriptClassInfoPtr class_info = get_script_class();
    if (const HashMap<StringName, jsb::ScriptPropertyInfo>::ConstIterator it = class_info->properties.find(p_name))
    {
        if (r_is_valid) *r_is_valid = true;
        return it->value.type;
    }
    if (r_is_valid) *r_is_valid = false;
    return Variant::NIL;
}

void GodotJSScriptInstance::validate_property(PropertyInfo& p_property) const
{
    //TODO
}

bool GodotJSScriptInstance::property_can_revert(const StringName& p_name) const
{
    //TODO
    return false;
}

bool GodotJSScriptInstance::property_get_revert(const StringName& p_name, Variant& r_ret) const
{
    //TODO
    return false;
}

void GodotJSScriptInstance::get_method_list(List<MethodInfo>* p_list) const
{
    script_->get_script_method_list(p_list);
}

bool GodotJSScriptInstance::has_method(const StringName& p_method) const
{
    return script_->has_method(p_method);
}

Variant GodotJSScriptInstance::callp(const StringName& p_method, const Variant** p_args, int p_argcount, Callable::CallError& r_error)
{
    return env_->call_script_method(class_id_, object_id_, p_method, p_args, p_argcount, r_error);
}

void GodotJSScriptInstance::notification(int p_notification, bool p_reversed)
{
    if (p_reversed &&
        (p_notification == Object::NOTIFICATION_PREDELETE
        || p_notification == Object::NOTIFICATION_PREDELETE_CLEANUP))
    {
        // the JS counterpart is garbage collected (which finally caused Godot Object deleting)
        // so, some of the reversed notifications can not be handled by script instances
        return;
    }

    // since `NOTIFICATION_READY` is not reversed, `notification` will be posted after `callp`.
    // so, we can't `call_prelude` here with `NOTIFICATION_READY`

    //TODO find the method named `_notification`, cal it with `p_notification` as `argv`
    //TODO call it at all type levels? @seealso `GDScriptInstance::notification`
    Variant value = p_notification;
    const Variant* argv[] = {&value};
    Callable::CallError error;
    callp(jsb_string_name(_notification), argv, 1, error);
}

ScriptLanguage* GodotJSScriptInstance::get_language()
{
    jsb_check(script_.is_valid());
    return script_->get_language();
}

GodotJSScriptInstance::~GodotJSScriptInstance()
{
    JSB_BENCHMARK_SCOPE(GodotJSScriptInstance, Destruct);
    jsb_check(script_.is_valid() && owner_ && script_->get_language());

    const GodotJSScriptLanguage* lang = (GodotJSScriptLanguage*) script_->get_language();
    MutexLock lock(lang->mutex_);
    script_->instances_.erase(owner_);
}
