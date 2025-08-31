#include "jsb_script_instance.h"
#include "jsb_script_language.h"

GodotJSScriptInstanceBase::ScriptCallProfilingScope::ScriptCallProfilingScope(const ScriptProfilingInfo& p_info, const StringName& p_method)
            : info_(p_info), method_(p_method)
{
    start_time_ = OS::get_singleton()->get_ticks_usec();
}

GodotJSScriptInstanceBase::ScriptCallProfilingScope::~ScriptCallProfilingScope()
{
    GodotJSScriptLanguage::get_singleton()->add_script_call_profile_info(
        info_.path_,
        info_.class_,
        method_,
        OS::get_singleton()->get_ticks_usec() - start_time_);
}

GodotJSScriptInstanceBase::~GodotJSScriptInstanceBase()
{
    jsb_check(owner_);

    // When script binding fails due to an invalid script, we delete the invalid script instance.
    if (script_.is_valid())
    {
        jsb_check(script_->get_language());
        const GodotJSScriptLanguage* lang = (GodotJSScriptLanguage*) script_->get_language();
        MutexLock lock(lang->mutex_);
        script_->instances_.erase(owner_);
    }
}

jsb::ScriptClassInfoPtr GodotJSScriptInstance::get_script_class() const
{
    return env_->get_script_class(class_id_);
}

void GodotJSScriptInstance::postbind()
{
    // Store initial value for cached props
    for (auto& it : this->script_->script_class_info_.properties)
    {
        if (it.value.cache)
        {
            Variant value;
            env_->get_script_property_value(object_id_, it.value, value);
            property_cache_.insert(it.key, value);
        }
    }
}

void GodotJSScriptInstance::cache_property(const StringName& name, const Variant& value)
{
    property_cache_.insert(name, value);
}

bool GodotJSScriptInstance::set(const StringName& p_name, const Variant& p_value)
{
    if (const auto& it = script_->script_class_info_.properties.find(p_name); it)
    {
        return env_->set_script_property_value(object_id_, it->value, p_value);
    }
    return false;
}

bool GodotJSScriptInstance::get(const StringName& p_name, Variant& r_ret) const
{
    const Variant* cached_value = property_cache_.getptr(p_name);

    if (cached_value)
    {
        r_ret = *cached_value;
        return true;
    }

    if (const auto& it = script_->script_class_info_.properties.find(p_name); it)
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
#if JSB_DEBUG
    if (profiling_info_.path_.is_empty())
    {
        profiling_info_.path_ = script_->get_path();
        profiling_info_.class_ = get_script_class()->js_class_name;
    }
    ScriptCallProfilingScope profiling_scope(profiling_info_, p_method);
#endif
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
