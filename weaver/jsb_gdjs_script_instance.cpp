#include "jsb_gdjs_script_instance.h"
#include "jsb_gdjs_lang.h"
#include "scene/scene_string_names.h"

bool GodotJSScriptInstance::set(const StringName& p_name, const Variant& p_value)
{
    if (const auto& it = script_->get_js_class_info().properties.find(p_name); it)
    {
        return script_->get_realm()->set_script_property_value(object_id_, it->value, p_value);
    }
    return false;
}

bool GodotJSScriptInstance::get(const StringName& p_name, Variant& r_ret) const
{
    if (const auto& it = script_->get_js_class_info().properties.find(p_name); it)
    {
        return script_->get_realm()->get_script_property_value(object_id_, it->value, r_ret);
    }
    return false;
}

void GodotJSScriptInstance::get_property_list(List<PropertyInfo>* p_properties) const
{
    script_->get_script_property_list(p_properties);
}

Variant::Type GodotJSScriptInstance::get_property_type(const StringName& p_name, bool* r_is_valid) const
{
    const jsb::GodotJSClassInfo& class_info = script_->get_js_class_info();
    if (const HashMap<StringName, jsb::GodotJSPropertyInfo>::ConstIterator it = class_info.properties.find(p_name))
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

Variant GodotJSScriptInstance::callp(const StringName& p_method, const Variant** p_args, int p_argcount,
                                     Callable::CallError& r_error)
{
    return script_->call_script_method(object_id_, p_method, p_args, p_argcount, r_error);
}

void GodotJSScriptInstance::notification(int p_notification, bool p_reversed)
{
    if (p_reversed && (p_notification == Object::NOTIFICATION_PREDELETE || p_notification ==
        Object::NOTIFICATION_PREDELETE_CLEANUP))
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

ScriptLanguage* GodotJSScriptInstance::get_language() { return GodotJSScriptLanguage::get_singleton(); }

GodotJSScriptInstance::~GodotJSScriptInstance()
{
    JSB_BENCHMARK_SCOPE(GodotJSScriptInstance, Destruct);
    MutexLock lock(GodotJSScriptLanguage::singleton_->mutex_);
    jsb_check(script_.is_valid() && owner_);
    script_->instances_.erase(owner_);
}
