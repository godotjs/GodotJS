#include "jsb_script_instance.h"
#include "jsb_script.h"
#include "jsb_script_language.h"
#include "modules/gdscript/gdscript_rpc_callable.h"

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

    // TODO: Static variable?

    if (const auto& it = script_->script_class_info_.methods.find(jsb_string_name(_set)); it)
    {
        Variant name = p_name;
        const Variant *args[2] = { &name, &p_value };

        Callable::CallError err;
        Variant ret = env_->call_script_method(class_id_, object_id_, jsb_string_name(_set), (const Variant **)args, 2, err);
        if (err.error == Callable::CallError::CALL_OK && ret.get_type() == Variant::BOOL && ret.operator bool()) {
            return true;
        }
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

    // TODO: constant?
    // TODO: static variable?
    // TODO: Inner class?

    if (const auto& it = script_->script_class_info_.signals.find(p_name); it)
    {
        r_ret =  Signal(owner_, p_name);
        return true;
    }

    if (const auto& it = script_->script_class_info_.methods.find(p_name); it)
    {
        if (script_->script_class_info_.rpc_config.has(p_name)) {
            r_ret = Callable(memnew(GDScriptRPCCallable(owner_, p_name)));
            return true;
        } else {
            if (!it->value.is_static())
            {
                r_ret = Callable(owner_, p_name);
                return true;
            } else {
                // TODO: Warp static method to Callable
            }
        }
    }

    if (const auto& it = script_->script_class_info_.methods.find(jsb_string_name(_get)); it)
    {
        Variant name = p_name;
        const Variant *args[1] = { &name };

        Callable::CallError err;
        Variant ret = env_->call_script_method(class_id_, object_id_, jsb_string_name(_get), (const Variant **)args, 1, err);
        if (err.error == Callable::CallError::CALL_OK && ret.get_type() != Variant::NIL)
        {
            r_ret = ret;
            return true;
        }
    }

    return false;
}

void GodotJSScriptInstance::get_property_list(List<PropertyInfo>* p_properties) const
{
    script_->get_script_property_list(p_properties);

    if (const auto& it = script_->script_class_info_.methods.find(jsb_string_name(_get_property_list)); it)
    {
        Callable::CallError err;
        Variant ret = env_->call_script_method(class_id_, object_id_, jsb_string_name(_get_property_list), nullptr, 0, err);
        if (err.error == Callable::CallError::CALL_OK && ret.get_type() != Variant::NIL)
        {
            ERR_FAIL_COND_MSG(ret.get_type() != Variant::ARRAY, "Wrong type for _get_property_list, must be an array of dictionaries.");

            Array arr = ret;
            for (int i = 0; i < arr.size(); i++)
            {
                Dictionary d = arr[i];
                ERR_CONTINUE(!d.has("name"));
                ERR_CONTINUE(!d.has("type"));

                PropertyInfo pinfo;
                pinfo.name = d["name"];
                pinfo.type = Variant::Type(d["type"].operator int());
                if (d.has("hint"))
                {
                    pinfo.hint = PropertyHint(d["hint"].operator int());
                }
                if (d.has("hint_string"))
                {
                    pinfo.hint_string = d["hint_string"];
                }
                if (d.has("usage"))
                {
                    pinfo.usage = d["usage"];
                }
                if (d.has("class_name"))
                {
                    pinfo.class_name = d["class_name"];
                }

                ERR_CONTINUE(pinfo.name.is_empty() && (pinfo.usage & PROPERTY_USAGE_STORAGE));
                ERR_CONTINUE(pinfo.type < 0 || pinfo.type >= Variant::VARIANT_MAX);

                if (script_->script_class_info_.properties.has(pinfo.name))
                {
                    continue;
                }

                p_properties->push_back(pinfo);
            }
        }
    }

    for (PropertyInfo &prop : *p_properties) {
        validate_property(prop);
    }
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
    if (const auto& it = script_->script_class_info_.methods.find(jsb_string_name(_validate_property)); it)
    {
        Variant property = (Dictionary)p_property;
        const Variant *args[1] = { &property };

        Callable::CallError err;
        Variant ret = env_->call_script_method(class_id_, object_id_, jsb_string_name(_validate_property), (const Variant **)args, 1, err);
        if (err.error == Callable::CallError::CALL_OK && ret.get_type() != Variant::NIL)
        {
            p_property =  PropertyInfo::from_dict(property);
        }
    }
}

bool GodotJSScriptInstance::property_can_revert(const StringName& p_name) const
{
    if (const auto& it = script_->script_class_info_.methods.find(jsb_string_name(_property_can_revert)); it)
    {
        Variant name = p_name;
        const Variant *args[1] = { &name };

        Callable::CallError err;
        Variant ret = env_->call_script_method(class_id_, object_id_, jsb_string_name(_property_can_revert), args, 1, err);
        if (err.error == Callable::CallError::CALL_OK && ret.get_type() == Variant::BOOL && ret.operator bool()) {
            return true;
        }
    }

	return false;
}

bool GodotJSScriptInstance::property_get_revert(const StringName& p_name, Variant& r_ret) const
{
    if (const auto& it = script_->script_class_info_.methods.find(jsb_string_name(_property_get_revert)); it)
    {
        Variant name = p_name;
        const Variant *args[1] = { &name };

        Callable::CallError err;
        Variant ret = env_->call_script_method(class_id_, object_id_, jsb_string_name(_property_get_revert), args, 1, err);
        if (err.error == Callable::CallError::CALL_OK && ret.get_type() == Variant::BOOL && ret.operator bool()) {
            r_ret = ret;
            return true;
        }
    }

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

    // Check if environment is being disposed to avoid calling into a destroyed JS context
    if (!env_ || env_->is_disposing())
    {
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
