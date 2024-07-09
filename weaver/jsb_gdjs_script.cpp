#include "jsb_gdjs_script.h"
#include "jsb_gdjs_lang.h"
#include "jsb_gdjs_script_instance.h"
#include "../internal/jsb_settings.h"
#include "../internal/jsb_path_util.h"

#define GODOTJS_LOAD_SCRIPT_MODULE() { if (jsb_unlikely(!loaded_)) const_cast<GodotJSScript*>(this)->load_module(); } (void) 0

GodotJSScript::GodotJSScript(): script_list_(this)
{
    {
        JSB_BENCHMARK_SCOPE(GodotJSScript, Construct);
        GodotJSScriptLanguage* lang = GodotJSScriptLanguage::get_singleton();
        MutexLock lock(lang->mutex_);

        lang->script_list_.add(&script_list_);
    }
    JSB_LOG(VeryVerbose, "new GodotJSScript addr:%s", uitos((uintptr_t) this));
}

GodotJSScript::~GodotJSScript()
{
    JSB_LOG(VeryVerbose, "delete GodotJSScript addr:%s", uitos((uintptr_t) this));
    release_cached_methods();

    {
        JSB_BENCHMARK_SCOPE(GodotJSScript, Destruct);
        const GodotJSScriptLanguage* lang = GodotJSScriptLanguage::get_singleton();
        MutexLock lock(lang->mutex_);

        script_list_.remove_from_list();
    }
}

// GDScript::can_instantiate()
bool GodotJSScript::can_instantiate() const
{
    GODOTJS_LOAD_SCRIPT_MODULE();
#ifdef TOOLS_ENABLED
    return valid_ && (is_tool() || ScriptServer::is_scripting_enabled());
#else
    return valid_;
#endif
}

bool GodotJSScript::is_tool() const
{
    if (valid_)
    {
        GODOTJS_LOAD_SCRIPT_MODULE();
        return get_js_class_info().is_tool();
    }
    return false;
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
    jsb_check(loaded_);
    //TODO
    //if (base_)
    //{
    //    return Ref(base_);
    //}
    return {};
}

StringName GodotJSScript::get_global_name() const
{
    jsb_check(loaded_);
    //TODO
    return {};
}

bool GodotJSScript::inherits_script(const Ref<Script>& p_script) const
{
    jsb_check(loaded_);
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

// this method is called in `EditorStandardSyntaxHighlighter::_update_cache()` without checking `script->is_valid()`
StringName GodotJSScript::get_instance_base_type() const
{
    GODOTJS_LOAD_SCRIPT_MODULE();
    return valid_ ? get_js_class_info().native_class_name : StringName();
}

ScriptInstance* GodotJSScript::instance_create(Object* p_this)
{
    //TODO multi-thread scripting not supported for now
    jsb_check(loaded_);
    jsb_check(ClassDB::is_parent_class(p_this->get_class_name(), get_js_class_info().native_class_name));

    /* STEP 1, CREATE */
    GodotJSScriptInstance* instance = memnew(GodotJSScriptInstance);

    instance->owner_ = p_this;
    instance->script_ = Ref(this); // must set before 'set_script_instance'
    instance->owner_->set_script_instance(instance);

	/* STEP 2, INITIALIZE AND CONSTRUCT */
    {
        MutexLock lock(GodotJSScriptLanguage::singleton_->mutex_);
        instances_.insert(instance->owner_);
    }
    instance->object_id_ = get_realm()->crossbind(p_this, gdjs_class_id_);
    if (!instance->object_id_.is_valid())
    {
        instance->script_ = Ref<GodotJSScript>();
        instance->owner_->set_script_instance(nullptr);
        //NOTE `instance` becomes an invalid pointer since it's deleted in `set_script_instance`
        {
            MutexLock lock(GodotJSScriptLanguage::singleton_->mutex_);
            instances_.erase(p_this);
        }
        JSB_LOG(Error, "Error constructing a GodotJSScriptInstance");
        return nullptr;
    }

    return instance;
}

Error GodotJSScript::reload(bool p_keep_state)
{
    if (!loaded_) return OK;
    if (!valid_) return ERR_UNAVAILABLE;

    if (!p_keep_state)
    {
        MutexLock lock(GodotJSScriptLanguage::singleton_->mutex_);
        if (instances_.size())
        {
            return ERR_ALREADY_IN_USE;
        }
    }

    // discard all cached methods
    release_cached_methods();

    //TODO `Callable` objects bound with this script should be invalidated somehow?
    // ...

    if (p_keep_state)
    {
        // (common situation) preserve the object and change it's prototype
        const StringName& module_id = get_js_class_info().module_id;
        if (!get_realm()->reload_module(module_id))
        {
            return ERR_DOES_NOT_EXIST;
        }
        loaded_ = false;
        return OK;
    }

    //TODO discard the object and crossbind again
    JSB_LOG(Log, "discard the object and crossbind again");
    return OK;
}

#ifdef TOOLS_ENABLED
Vector<DocData::ClassDoc> GodotJSScript::get_documentation() const
{
    jsb_check(loaded_);
    //TODO
    return {};
}

String GodotJSScript::get_class_icon_path() const
{
    jsb_check(loaded_);
    return gdjs_class_id_ ? get_js_class_info().icon : String();
}

PropertyInfo GodotJSScript::get_class_category() const
{
    jsb_check(loaded_);
    return super::get_class_category();
}
#endif // TOOLS_ENABLED

bool GodotJSScript::has_method(const StringName& p_method) const
{
    jsb_check(loaded_);
    return get_js_class_info().methods.has(p_method);
}

MethodInfo GodotJSScript::get_method_info(const StringName& p_method) const
{
    jsb_check(loaded_);
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
    jsb_check(loaded_);
    return get_js_class_info().signals.has(p_signal);
}

void GodotJSScript::get_script_signal_list(List<MethodInfo>* r_signals) const
{
    jsb_check(loaded_);
    if (!valid_) return;

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
    jsb_check(loaded_);
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
    jsb_check(loaded_);
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
    jsb_check(loaded_);
    if (HashMap<StringName, Variant>::ConstIterator it = member_default_values_cache.find(p_property))
    {
        r_value = it->value;
        return true;
    }
    return false;
}

const Variant GodotJSScript::get_rpc_config() const
{
    jsb_check(loaded_);
    //TODO
    return {};
}

bool GodotJSScript::has_static_method(const StringName& p_method) const
{
    GODOTJS_LOAD_SCRIPT_MODULE();
    jsb_check(loaded_);
    //TODO
    return false;
}

bool GodotJSScript::instance_has(const Object* p_this) const
{
    jsb_check(loaded_);
    MutexLock lock(GodotJSScriptLanguage::singleton_->mutex_);
    return instances_.has(const_cast<Object*>(p_this));
}

void GodotJSScript::attach_source(const String& p_path, const String& p_source)
{
    set_path(p_path);
    set_source_code(p_source);
    //TODO we can't instantly compile it here since it's loaded from resource loading threads, maybe we could do some string analysis/parsing thread independently
}

void GodotJSScript::load_module()
{
    if (loaded_ && realm_id_) return;
    JSB_BENCHMARK_SCOPE(GodotJSScript, load_module);

    const String path = jsb::internal::PathUtil::convert_to_internal_path(get_path());
    const GodotJSScriptLanguage* lang = GodotJSScriptLanguage::get_singleton();
    std::shared_ptr<jsb::Realm> realm = lang->get_context();

    realm_id_ = realm->id();
    loaded_ = true;
    source_changed_cache = true;
    jsb::JavaScriptModule* module;
    if (const Error err = realm->load(path, &module); err != OK)
    {
        JSB_LOG(Error, "failed to attach module %s (%d)", path, err);
        return;
    }
    jsb_check(module);
    gdjs_class_id_ = module->default_class_id;
    valid_ = gdjs_class_id_.is_valid();
    if (valid_)
    {
        JSB_LOG(VeryVerbose, "GodotJSScript module loaded %s", path);
        {
            //TODO a dirty but approaching solution for hot-reloading
            MutexLock lock(GodotJSScriptLanguage::singleton_->mutex_); // necessary?
            for (RBSet<Object *>::Element *E = instances_.front(); E;)
            {
                RBSet<Object *>::Element *N = E->next();
                Object* obj = E->get();
                jsb_check(obj->get_script() == Ref(this));
                jsb_check(get_realm()->get_environment()->check_object(obj));
                jsb_check(ClassDB::is_parent_class(get_realm()->get_gdjs_class_info(module->default_class_id).native_class_name, obj->get_class_name()));
                get_realm()->rebind(obj, gdjs_class_id_);
                E = N;
            }
        }
        return;
    }
    JSB_LOG(Debug, "a stub script loaded which does not contain a GodotJS class %s", path);
}

const jsb::GodotJSClassInfo& GodotJSScript::get_js_class_info() const
{
    jsb_check(loaded_);
    jsb_checkf(gdjs_class_id_, "avoid calling this method if class_id is invalid, check prior with 'valid_'");
    return get_realm()->get_gdjs_class_info(gdjs_class_id_);
}

Variant GodotJSScript::call_script_method(jsb::NativeObjectID p_object_id, const StringName& p_method, const Variant** p_argv, int p_argc, Callable::CallError& r_error)
{
    jsb_check(loaded_);
    jsb::ObjectCacheID func_id;
    if (const HashMap<StringName, jsb::ObjectCacheID>::Iterator& it = cached_methods_.find(p_method))
    {
        func_id = it->value;
    }
    else
    {
        func_id = get_realm()->retain_function(p_object_id, p_method);
        cached_methods_.insert(p_method, func_id);
    }
    return get_realm()->call_function(p_object_id, func_id, p_argv, p_argc, r_error);
}

void GodotJSScript::release_cached_methods()
{
    if (const std::shared_ptr<jsb::Realm> realm = get_realm())
    {
        for (const KeyValue<StringName, jsb::ObjectCacheID>& pair : cached_methods_)
        {
            realm->release_function(pair.value);
        }
    }
    cached_methods_.clear();
}

void GodotJSScript::call_prelude(jsb::NativeObjectID p_object_id)
{
    jsb_check(loaded_);
    get_realm()->call_prelude(gdjs_class_id_, p_object_id);
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
    jsb_check(loaded_);
#ifdef TOOLS_ENABLED
    if (!valid_)
    {
        JSB_LOG(Warning, "creating placeholder instance on invalid script (%s)", get_path());
    }
    PlaceHolderScriptInstance *si = memnew(PlaceHolderScriptInstance(GodotJSScriptLanguage::get_singleton(), Ref<Script>(this), p_this));
    placeholders.insert(si);
    _update_exports(si);
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
    GODOTJS_LOAD_SCRIPT_MODULE();
    jsb_check(loaded_);
#ifdef TOOLS_ENABLED
    if (!valid_) return;
    _update_exports(nullptr);
#endif
}

void GodotJSScript::_update_exports_values(List<PropertyInfo>& r_props, HashMap<StringName, Variant>& r_values)
{
    for (const KeyValue<StringName, Variant> &E : member_default_values_cache)
    {
        r_values[E.key] = E.value;
    }
    for (const PropertyInfo &E : members_cache)
    {
        r_props.push_back(E);
    }
}

void GodotJSScript::_update_exports(PlaceHolderScriptInstance* p_instance_to_update, bool p_base_exports_changed)
{
    // do not crash the engine if the script not loaded successfully
    if (!is_valid())
    {
        JSB_LOG(Error, "the script not propertly loaded (%s)", get_path());
        return;
    }

    bool changed = p_base_exports_changed;

    if (source_changed_cache)
    {
        source_changed_cache = false;
        changed = true;

        members_cache.clear();
        member_default_values_cache.clear();
        get_realm()->get_environment()->check_internal_state();

        members_cache.push_back(get_class_category());
        const jsb::GodotJSClassInfo& class_info = get_js_class_info();
        for (const KeyValue<StringName, jsb::GodotJSPropertyInfo> &pair : class_info.properties)
        {
            const jsb::GodotJSPropertyInfo &pi = pair.value;
            members_cache.push_back({ pi.type, pi.name, pi.hint, pi.hint_string, pi.usage, pi.class_name });
            // values[pair.key] = VariantUtilityFunctions::type_convert({}, pi.type);

            //TODO maybe this behaviour is not expected
            Variant default_value;
            get_realm()->get_script_default_property_value(gdjs_class_id_, pi.name, default_value);
            member_default_values_cache[pi.name] = default_value;
            JSB_LOG(VeryVerbose, "GodotJS script default %s = %s", gdjs_class_id_ ? (String) get_js_class_info().js_class_name : "(unknown)", pi.name, (String) default_value);
        }
    }

    if ((changed || p_instance_to_update) && placeholders.size())
    {
        List<PropertyInfo> props;
        HashMap<StringName, Variant> values;
        _update_exports_values(props, values);

        if (changed)
        {
            for (PlaceHolderScriptInstance *s : placeholders)
            {
                s->update(props, values);
            }
        }
        else
        {
            p_instance_to_update->update(props, values);
        }
    }
}
