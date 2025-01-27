#include "jsb_script.h"
#include "jsb_script_language.h"
#include "jsb_script_instance.h"
#include "../internal/jsb_path_util.h"

#include "scene/scene_string_names.h"

#ifdef TOOLS_ENABLED
#include "editor/editor_node.h"
#include "editor/editor_help.h"
#endif

GodotJSScript::GodotJSScript(): script_list_(this)
{
    {
        JSB_BENCHMARK_SCOPE(GodotJSScript, Construct);
        GodotJSScriptLanguage* lang = GodotJSScriptLanguage::get_singleton();
        MutexLock lock(lang->mutex_);

        lang->script_list_.add(&script_list_);
    }
    JSB_LOG(VeryVerbose, "new GodotJSScript addr:%d", (uintptr_t) this);
}

GodotJSScript::~GodotJSScript()
{
    JSB_LOG(VeryVerbose, "delete GodotJSScript addr:%d", (uintptr_t) this);
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
    ensure_module_loaded();
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
        ensure_module_loaded();
        return get_script_class()->is_tool();
    }
    return false;
}

void GodotJSScript::set_source_code(const String& p_code)
{
    source_ = p_code;
}

Ref<Script> GodotJSScript::get_base_script() const
{
    ensure_module_loaded();
    //jsb_notice(loaded_, "script not loaded");

    // return the base script in order to traverse methods/properties from inheritance hierarchy
    return base;
}

StringName GodotJSScript::get_global_name() const
{
    ensure_module_loaded();
    return valid_ ? get_script_class()->js_class_name : StringName();
}

bool GodotJSScript::inherits_script(const Ref<Script>& p_script) const
{
    jsb_check(loaded_);

    // check if the current script inherits from `p_script`
    //TODO `inherits_script` seems to be called only by Array::assign, it's enough for now without an implementation.
    //TODO iterate the prototype chain, check if the current script inherits from `p_script`

    return false;
}

// this method is called in `EditorStandardSyntaxHighlighter::_update_cache()` without checking `script->is_valid()`
StringName GodotJSScript::get_instance_base_type() const
{
    ensure_module_loaded();
    return valid_ ? get_script_class()->native_class_name : StringName();
}

ScriptInstance* GodotJSScript::instance_create(const v8::Local<v8::Object>& p_this)
{
    jsb_check(valid_);
    jsb_check(loaded_);

    /* STEP 1, CREATE */
    GodotJSScriptInstance* instance = memnew(GodotJSScriptInstance);
    Object* owner = ClassDB::instantiate(get_script_class()->native_class_name);

    instance->owner_ = owner;
    instance->script_ = Ref(this); // must set before 'set_script_instance'
    instance->owner_->set_script_instance(instance);

    /* STEP 2, INITIALIZE AND CONSTRUCT */
    {
        MutexLock lock(GodotJSScriptLanguage::singleton_->mutex_);
        instances_.insert(owner);
    }
    instance->object_id_ = get_environment()->bind_godot_object(get_script_class()->native_class_id, owner, p_this);
    if (!instance->object_id_)
    {
        instance->script_ = Ref<GodotJSScript>();
        instance->owner_->set_script_instance(nullptr);
        //NOTE `instance` becomes an invalid pointer since it's deleted in `set_script_instance`
        {
            MutexLock lock(GodotJSScriptLanguage::singleton_->mutex_);
            instances_.erase(owner);
        }
        memdelete(owner);
        JSB_LOG(Error, "Error constructing a GodotJSScriptInstance");
        return nullptr;
    }

    return instance;
}

ScriptInstance* GodotJSScript::instance_create(Object* p_this)
{
    //TODO multi-thread scripting not supported for now
    jsb_check(loaded_);
    JSB_LOG(Verbose, "create instance %d of %s(%d)", (uintptr_t) p_this, get_script_class()->native_class_name, script_class_id_);
    jsb_check(ClassDB::is_parent_class(p_this->get_class_name(), get_script_class()->native_class_name));

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
    instance->object_id_ = get_environment()->crossbind(p_this, script_class_id_);
    if (!instance->object_id_)
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

    if (!p_keep_state)
    {
        //TODO discard the object and crossbind again, but for now we just reload it normally
    }

    // (common situation) preserve the object and change its prototype
    const StringName& module_id = get_script_class()->module_id;
    if (get_environment()->mark_as_reloading(module_id) == jsb::EReloadResult::Requested)
    {
        // discard all cached methods
        release_cached_methods();

        //TODO `Callable` objects bound with this script should be invalidated somehow?
        // ...

        loaded_ = false;
    }
    return OK;
}

#ifdef TOOLS_ENABLED
#if GODOT_4_4_OR_NEWER
StringName GodotJSScript::get_doc_class_name() const
{
    //TODO not verified
    Vector<DocData::ClassDoc> docs = get_documentation();
    if (!docs.is_empty()) return docs[0].name;
    return {};
}
#endif

Vector<DocData::ClassDoc> GodotJSScript::get_documentation() const
{
    ensure_module_loaded();
    if (!loaded_ || !script_class_id_) return {};

    const jsb::ScriptClassInfoPtr class_info = get_script_class();
    String base_type;
    const String class_name = GodotJSScriptLanguage::get_singleton()->get_global_class_name(get_path(), &base_type);
    DocData::ClassDoc class_doc_data;

    class_doc_data.name = class_name;
    class_doc_data.inherits = base_type.is_empty() ? "Object" : base_type;
    class_doc_data.is_script_doc = true;
    class_doc_data.brief_description = class_info->doc.brief_description;
    class_doc_data.is_deprecated = class_info->doc.is_deprecated;
    class_doc_data.is_experimental = class_info->doc.is_experimental;
#if GODOT_4_3_OR_NEWER
    class_doc_data.deprecated_message = class_info->doc.deprecated_message;
    class_doc_data.experimental_message = class_info->doc.experimental_message;
#endif
    class_doc_data.script_path = get_path();
    for (const auto& item : class_info->properties)
    {
        DocData::PropertyDoc property_doc_data;
        property_doc_data.name = item.key;
        property_doc_data.description = item.value.doc.brief_description;
        property_doc_data.is_deprecated = item.value.doc.is_deprecated;
        property_doc_data.is_experimental = item.value.doc.is_experimental;
#if GODOT_4_3_OR_NEWER
        property_doc_data.deprecated_message = item.value.doc.deprecated_message;
        property_doc_data.experimental_message = item.value.doc.experimental_message;
#endif
        class_doc_data.properties.append(property_doc_data);
    }

    return { class_doc_data };
}

String GodotJSScript::get_class_icon_path() const
{
    ensure_module_loaded();
    jsb_check(loaded_);
    return script_class_id_ ? get_script_class()->icon : String();
}

PropertyInfo GodotJSScript::get_class_category() const
{
    ensure_module_loaded();
    jsb_check(loaded_);
    return super::get_class_category();
}
#endif // TOOLS_ENABLED

bool GodotJSScript::has_method(const StringName& p_method) const
{
    ensure_module_loaded();
    jsb_check(loaded_);

    const GodotJSScript* current = this;
    while (current)
    {
        //TODO temp fix
        if (!current->loaded_) const_cast<GodotJSScript*>(current)->load_module_immediately();
        if (current->is_valid() && current->get_script_class()->methods.has(p_method)) return true;
        current = current->base.ptr();
    }

    // ensure `_ready` called even if it's not actually defined in scripts
    if (p_method == SceneStringNames::get_singleton()->_ready)
    {
        // only a `Node` class has `_ready` call
        if (ClassDB::is_parent_class(get_instance_base_type(), jsb_string_name(Node)))
        {
            return true;
        }
    }
    return false;
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
    return is_valid() ? get_script_class()->signals.has(p_signal) : false;
}

void GodotJSScript::get_script_signal_list(List<MethodInfo>* r_signals) const
{
    ensure_module_loaded();
    jsb_check(loaded_);
    if (!valid_) return;

    //TODO include items from base class

    for (const auto& it : get_script_class()->signals)
    {
        //TODO details?
        MethodInfo item = {};
        item.name = it.key;
        r_signals->push_back(item);
    }
}

void GodotJSScript::get_script_method_list(List<MethodInfo>* p_list) const
{
    ensure_module_loaded();
    jsb_check(loaded_);

    for (const auto& it : get_script_class()->methods)
    {
        //TODO details?
        MethodInfo item = {};
        item.name = it.key;
        p_list->push_back(item);
    }

    if (base.is_valid())
    {
        base->get_script_method_list(p_list);
    }
}

void GodotJSScript::get_script_property_list(List<PropertyInfo>* p_list) const
{
    ensure_module_loaded();
    jsb_check(loaded_);

    //TODO include items from base class

#ifdef TOOLS_ENABLED
    p_list->push_back(get_class_category());
#endif
    for (const auto& it : get_script_class()->properties)
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
    ensure_module_loaded();
    if (HashMap<StringName, Variant>::ConstIterator it = member_default_values_cache.find(p_property))
    {
        r_value = it->value;
        return true;
    }
    return false;
}

#if GODOT_4_4_OR_NEWER
Variant GodotJSScript::get_rpc_config() const
#else
const Variant GodotJSScript::get_rpc_config() const
#endif
{
    ensure_module_loaded();
    jsb_check(loaded_);

    return get_script_class()->rpc_config;
}

bool GodotJSScript::has_static_method(const StringName& p_method) const
{
    ensure_module_loaded();
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

void GodotJSScript::load_source_code_from_path()
{
    Error err;
    const String path = get_path();
    const String source_code = FileAccess::get_file_as_string(path, &err);
    if (err != OK)
    {
        JSB_LOG(Warning, "can not read source from %s", path);
    }
    else
    {
        set_source_code(source_code);
    }
}

void GodotJSScript::attach_source(const String& p_path)
{
    set_path(p_path);

#ifdef TOOLS_ENABLED
    load_source_code_from_path();
#endif
    //TODO we can't immediately compile it here since it's loaded from resource loading threads, maybe we could do some string analysis/parsing thread independently
}

void GodotJSScript::load_module_if_missing()
{
    if (!loaded_ || !env_id_ || valid_) return;

    JSB_LOG(Verbose, "force to load missing script %s", get_path());
    loaded_ = false;
    load_module_immediately();
}

void GodotJSScript::load_module_immediately()
{
    if (loaded_ && env_id_) return;
    JSB_BENCHMARK_SCOPE(GodotJSScript, load_module);

    const String path = jsb::internal::PathUtil::convert_typescript_path(get_path());
    const GodotJSScriptLanguage* lang = GodotJSScriptLanguage::get_singleton();
    const std::shared_ptr<jsb::Environment> env = lang->get_environment();

    env_id_ = env->id();
    loaded_ = true;
    base.unref();
    source_changed_cache = true;
    jsb::JavaScriptModule* module;
    if (const Error err = env->load(path, &module); err != OK)
    {
        script_class_id_ = {};
        valid_ = false;
#ifdef TOOLS_ENABLED
        if (FileAccess::exists(get_path()) && !FileAccess::exists(path))
        {
            JSB_LOG(Error, "the javascript file is missing: %s (source: %s), "
                "please ensure that all typescript source files have already been compiled "
                "using the typescript compiler ('tsc').",
                path, get_path());
            return;
        }
#endif
        JSB_LOG(Error, "failed to attach module %s (%d)", path, err);
        return;
    }
    jsb_check(module);
    script_class_id_ = module->script_class_id;
    valid_ = !!script_class_id_;
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
                jsb_check(env->check_object(obj));
                jsb_check(ClassDB::is_parent_class(env->get_script_class(module->script_class_id)->native_class_name, obj->get_class_name()));
                env->rebind(obj, script_class_id_);
                E = N;
            }
        }

        // setup base script
        {
            //TODO do not rely on ResourceLoader
            const jsb::ScriptClassInfoPtr script_class_info = env->get_script_class(module->script_class_id);
            if (script_class_info->base_script_class_id)
            {
                const jsb::ScriptClassInfoPtr base_script_class_info = env->get_script_class(script_class_info->base_script_class_id);
                const jsb::JavaScriptModule* base_module = env->get_module_cache().find(base_script_class_info->module_id);
                const Ref<Resource> base_res = ResourceLoader::load(jsb::internal::PathUtil::convert_javascript_path(base_module->source_info.source_filepath));
                jsb_check(base_res->get_class() == jsb_typename(GodotJSScript));
                base = base_res;
            }
        }

        // update the default value cache
        update_exports();
#ifdef TOOLS_ENABLED
        // temp and tricky workaround to avoid missing doc when showing on inspector the first time after load
        if (DocTools* doc_tools = EditorHelp::get_doc_data())
        {
            const Vector<DocData::ClassDoc> documentations = get_documentation();
            for (int i = 0; i < documentations.size(); i++)
            {
                const DocData::ClassDoc& doc = documentations.get(i);
                doc_tools->add_doc(doc);
            }
        }
#endif
        return;
    }
    JSB_LOG(Debug, "a stub script loaded which does not contain a GodotJS class %s", path);
}

jsb::ScriptClassInfoPtr GodotJSScript::get_script_class() const
{
    jsb_check(loaded_);
    jsb_checkf(script_class_id_, "avoid calling this method if class_id is invalid, check prior with 'valid_'");
    return get_environment()->get_script_class(script_class_id_);
}

Variant GodotJSScript::call_script_method(jsb::NativeObjectID p_object_id, const StringName& p_method, const Variant** p_argv, int p_argc, Callable::CallError& r_error)
{
    ensure_module_loaded();
    jsb_check(loaded_);
    jsb::ObjectCacheID func_id;
    if (const HashMap<StringName, jsb::ObjectCacheID>::Iterator& it = cached_methods_.find(p_method))
    {
        func_id = it->value;
    }
    else
    {
        if (p_method == SceneStringNames::get_singleton()->_ready)
        {
            call_prelude(p_object_id);

            if (!has_method(p_method))
            {
                JSB_LOG(Verbose, "call_prelude for scripts that _ready function not defined (%s)", get_path());
                return {};
            }
        }

        func_id = get_environment()->retain_function(p_object_id, p_method);
        cached_methods_.insert(p_method, func_id);
    }
    return get_environment()->call_function(p_object_id, func_id, p_argv, p_argc, r_error);
}

void GodotJSScript::release_cached_methods()
{
    if (const std::shared_ptr<jsb::Environment> env = get_environment())
    {
        for (const KeyValue<StringName, jsb::ObjectCacheID>& pair : cached_methods_)
        {
            env->release_function(pair.value);
        }
    }
    cached_methods_.clear();
}

void GodotJSScript::call_prelude(jsb::NativeObjectID p_object_id)
{
    jsb_check(loaded_);
    get_environment()->call_prelude(script_class_id_, p_object_id);
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
    ensure_module_loaded();
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
        JSB_LOG(Error, "the script not properly loaded (%s)", get_path());
        return;
    }

    bool changed = p_base_exports_changed;

    if (source_changed_cache)
    {
        source_changed_cache = false;
        changed = true;

        members_cache.clear();
        member_default_values_cache.clear();
        const std::shared_ptr<jsb::Environment> env = get_environment();
        env->check_internal_state();

#ifdef TOOLS_ENABLED
        members_cache.push_back(get_class_category());
#endif
        const jsb::ScriptClassInfoPtr class_info = get_environment()->get_script_class(script_class_id_);
        for (const KeyValue<StringName, jsb::ScriptPropertyInfo> &pair : class_info->properties)
        {
            const jsb::ScriptPropertyInfo &pi = pair.value;
            members_cache.push_back({ pi.type, pi.name, pi.hint, pi.hint_string, pi.usage, pi.class_name });
            // values[pair.key] = VariantUtilityFunctions::type_convert({}, pi.type);

            //TODO maybe this behaviour is not expected
            Variant default_value;
            env->get_script_default_property_value(*class_info, pi.name, default_value);
            member_default_values_cache[pi.name] = default_value;
            JSB_LOG(VeryVerbose, "GodotJS script default %s.%s = %s",
                script_class_id_ ? (String) get_script_class()->js_class_name : "(unknown)",
                pi.name,
                (String) default_value);
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

void GodotJSScript::reload_from_file()
{
    //TODO reload, maybe it's OK?
    reload(true);
}
