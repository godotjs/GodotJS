#include "jsb_gdjs_script.h"
#include "jsb_gdjs_lang.h"
#include "jsb_gdjs_script_instance.h"
#include "../internal/jsb_variant_util.h"

GodotJSScript::GodotJSScript(): script_list_(this)
{
    {
        GodotJSScriptLanguage* lang = GodotJSScriptLanguage::get_singleton();
        MutexLock lock(lang->mutex_);

        lang->script_list_.add(&script_list_);
    }
}

GodotJSScript::~GodotJSScript()
{
    cached_methods_.clear();

    {
        const GodotJSScriptLanguage* lang = GodotJSScriptLanguage::get_singleton();
        MutexLock lock(lang->mutex_);

        script_list_.remove_from_list();
    }
}

// GDScript::can_instantiate()
bool GodotJSScript::can_instantiate() const
{
#ifdef TOOLS_ENABLED
    return valid_ && (is_tool() || ScriptServer::is_scripting_enabled());
#else
    return valid_;
#endif
}

void GodotJSScript::set_source_code(const String& p_code)
{
    if (source_ == p_code)
    {
        return;
    }
    source_ = p_code;
}

Ref<Script> GodotJSScript::get_base_script() const
{
    //TODO
    //if (base_)
    //{
    //    return Ref(base_);
    //}
    return {};
}

StringName GodotJSScript::get_global_name() const
{
    //TODO
    return {};
}

bool GodotJSScript::inherits_script(const Ref<Script>& p_script) const
{
    const Ref<GodotJSScript> type_check = p_script;
    if (type_check.is_null())
    {
        return false;
    }
    const GodotJSScript* ptr = this;
    while (ptr)
    {
        if (ptr == p_script.ptr())
        {
            return true;
        }
        ptr = ptr->base_;
    }
    return false;
}

StringName GodotJSScript::get_instance_base_type() const
{
    return get_js_class_info().native_class_name;
}

ScriptInstance* GodotJSScript::instance_create(Object* p_this)
{
    //TODO multi-thread scripting not supported for now
    GodotJSScriptInstance* instance = memnew(GodotJSScriptInstance);

    instance->owner_ = p_this;
    instance->script_ = Ref(this); // must set before 'set_script_instance'
    instance->owner_->set_script_instance(instance);
    instance->object_id_ = realm_->crossbind(p_this, gdjs_class_id_);
    return instance;
}

Error GodotJSScript::reload(bool p_keep_state)
{
    if (!valid_) return ERR_UNAVAILABLE;

    //TODO discard all cached methods?
    //TODO all `Callable` objects become invalid after reloading
    // cached_methods_.clear();
    // realm_->reload_module(get_js_class_info().module_id);
    return OK;
}

#ifdef TOOLS_ENABLED
Vector<DocData::ClassDoc> GodotJSScript::get_documentation() const
{
    //TODO
    return {};
}

String GodotJSScript::get_class_icon_path() const
{
    //TODO
    return "res://javascripts/icon/filetype-js.svg";
}

PropertyInfo GodotJSScript::get_class_category() const
{
    return super::get_class_category();
}
#endif // TOOLS_ENABLED

bool GodotJSScript::has_method(const StringName& p_method) const
{
    return get_js_class_info().methods.has(p_method);
}

MethodInfo GodotJSScript::get_method_info(const StringName& p_method) const
{
    jsb_check(has_method(p_method));
    //TODO details?
    MethodInfo item = {};
    item.name = p_method;
    return item;
}

ScriptLanguage* GodotJSScript::get_language() const
{
    return GodotJSScriptLanguage::get_singleton();
}

bool GodotJSScript::has_script_signal(const StringName& p_signal) const
{
    return get_js_class_info().signals.has(p_signal);
}

void GodotJSScript::get_script_signal_list(List<MethodInfo>* r_signals) const
{
    for (const auto& it : get_js_class_info().signals)
    {
        //TODO details?
        MethodInfo item = {};
        item.name = it.key;
        r_signals->push_back(item);
    }
}

void GodotJSScript::get_script_method_list(List<MethodInfo>* p_list) const
{
    for (const auto& it : get_js_class_info().methods)
    {
        //TODO details?
        MethodInfo item = {};
        item.name = it.key;
        p_list->push_back(item);
    }
}

void GodotJSScript::get_script_property_list(List<PropertyInfo>* p_list) const
{
#ifdef TOOLS_ENABLED
    p_list->push_back(get_class_category());
#endif
    for (const auto& it : get_js_class_info().properties)
    {
        //TODO details?
        PropertyInfo item = {};
        item.name = it.value.name;
        item.type = it.value.type;
        p_list->push_back(item);
    }
}

bool GodotJSScript::get_property_default_value(const StringName& p_property, Variant& r_value) const
{
    if (const auto& it = get_js_class_info().properties.find(p_property))
    {
        //TODO handle property_info.default_value of GodotJS script class
        ::jsb::internal::VariantUtil::construct_variant(r_value, it->value.type);
        return true;
    }
    // JSB_LOG(Warning, "unknown property %s", p_property);
    return false;
}

const Variant GodotJSScript::get_rpc_config() const
{
    //TODO
    return {};
}

bool GodotJSScript::has_static_method(const StringName& p_method) const
{
    //TODO
    return false;
}

bool GodotJSScript::instance_has(const Object* p_this) const
{
    MutexLock lock(GodotJSScriptLanguage::singleton_->mutex_);
    return instances_.has(const_cast<Object*>(p_this));
}

void GodotJSScript::attach_source(const std::shared_ptr<jsb::Realm>& p_context, const String& p_path, const String& p_source, jsb::GodotJSClassID p_class_id)
{
    realm_ = p_context;
    gdjs_class_id_ = p_class_id;
    valid_ = gdjs_class_id_.is_valid();
    set_path(p_path);
    set_source_code(p_source);
}

const jsb::GodotJSClassInfo& GodotJSScript::get_js_class_info() const
{
    jsb_checkf(gdjs_class_id_, "avoid calling this method if class_id is invalid, check prior with 'valid_'");
    return realm_->get_gdjs_class_info(gdjs_class_id_);
}

Variant GodotJSScript::call_script_method(jsb::NativeObjectID p_object_id, const StringName& p_method, const Variant** p_argv, int p_argc, Callable::CallError& r_error)
{
    jsb::ObjectCacheID func_id;
    if (const HashMap<StringName, jsb::ObjectCacheID>::Iterator& it = cached_methods_.find(p_method))
    {
        func_id = it->value;
    }
    else
    {
        func_id = realm_->retain_function(p_object_id, p_method);
        cached_methods_.insert(p_method, func_id);
    }
    return realm_->call_function(p_object_id, func_id, p_argv, p_argc, r_error);
}

void GodotJSScript::call_prelude(jsb::NativeObjectID p_object_id)
{
    realm_->call_prelude(gdjs_class_id_, p_object_id);
}

//
// bool GodotJSScript::get_script_property(jsb::NativeObjectID p_object_id, const StringName& p_name, Variant& r_ret) const
// {
//     // realm_->get_
//     return true;
// }
//
// bool GodotJSScript::set_script_property(jsb::NativeObjectID p_object_id, const StringName& p_name, const Variant& p_value)
// {
//     return true;
// }

PlaceHolderScriptInstance* GodotJSScript::placeholder_instance_create(Object* p_this)
{
#ifdef TOOLS_ENABLED
    jsb_check(valid_);
    PlaceHolderScriptInstance *si = memnew(PlaceHolderScriptInstance(GodotJSScriptLanguage::get_singleton(), Ref<Script>(this), p_this));
    placeholders.insert(si);
    update_exports();
    // _update_exports(nullptr, false, si);
    return si;
#else
    return nullptr;
#endif
}

#ifdef TOOLS_ENABLED
void GodotJSScript::_placeholder_erased(PlaceHolderScriptInstance* p_placeholder)
{
    placeholders.erase(p_placeholder);
}
#endif

void GodotJSScript::update_exports()
{
#if TOOLS_ENABLED
    //TODO
    if (!valid_) return;
    List<PropertyInfo> props;
    HashMap<StringName, Variant> values;

    props.push_back(get_class_category());

    for (const KeyValue<StringName, jsb::GodotJSPropertyInfo> &pair : get_js_class_info().properties) {
        const jsb::GodotJSPropertyInfo &pi = pair.value;
        props.push_back({ pi.type, pi.name, pi.hint, pi.hint_string, pi.usage, pi.class_name });
        values[pair.key] = VariantUtilityFunctions::type_convert({}, pi.type);
    }

    for (PlaceHolderScriptInstance *s : placeholders) {
        s->update(props, values);
    }
#endif
}

