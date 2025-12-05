#include "jsb_script.h"
#include "jsb_script_language.h"
#include "jsb_script_instance.h"
#include "../internal/jsb_path_util.h"

GodotJSScript::GodotJSScript(): script_list_(this)
{
    {
        JSB_BENCHMARK_SCOPE(GodotJSScript, Construct);
        MutexLock lock(GodotJSScriptLanguage::get_singleton()->mutex_);
        GodotJSScriptLanguage::get_singleton()->script_list_.add(&script_list_);
    }
    JSB_LOG(VeryVerbose, "new GodotJSScript addr:%d", (uintptr_t) this);
}

GodotJSScript::~GodotJSScript()
{
    JSB_LOG(VeryVerbose, "delete GodotJSScript addr:%d", (uintptr_t) this);

    {
        JSB_BENCHMARK_SCOPE(GodotJSScript, Destruct);
        MutexLock lock(GodotJSScriptLanguage::get_singleton()->mutex_);

        script_list_.remove_from_list();
    }
}

// GDScript::can_instantiate()
bool GodotJSScript::can_instantiate() const
{
#ifdef TOOLS_ENABLED
    return is_valid() && (is_tool() || ScriptServer::is_scripting_enabled());
#else
    return is_valid();
#endif
}

void GodotJSScript::set_source_code(const String& p_code)
{
    if (source_ == p_code) return;

    source_ = p_code;
#ifdef TOOLS_ENABLED
    source_changed_cache = true;
#endif
}

void GodotJSScript::set_path(const String& p_path, bool p_take_over)
{
    super::set_path(p_path, p_take_over);
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
    return is_valid() ? script_class_info_.js_class_name : StringName();
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
    return is_valid() ? script_class_info_.native_class_name : StringName();
}

ScriptInstance* GodotJSScript::instance_and_native_object_create(const v8::Local<v8::Object>& p_this, bool p_is_temp_allowed)
{
    jsb_check(is_valid());
    jsb_check(loaded_);

    Object* owner = ClassDB::instantiate(script_class_info_.native_class_name);
    ScriptInstance* instance = instance_create(p_this, owner, p_is_temp_allowed);
    if (!instance)
    {
        memdelete(owner);
    }
    return instance;
}

ScriptInstance* GodotJSScript::instance_create(const v8::Local<v8::Object>& p_this, Object* p_owner, bool p_is_temp_allowed)
{
    jsb_check(is_valid());
    jsb_check(loaded_);

    jsb::JSEnvironment env(get_path(), p_is_temp_allowed);
    jsb::JavaScriptModule* module = nullptr;
    const Error err = env->load(script_class_info_.module_id, &module);
    jsb_ensuref(module && err == OK, "JS Module not found: %s", script_class_info_.module_id);
    const jsb::NativeClassID native_class_id = env->get_script_class(module->script_class_id)->native_class_id;

    /* STEP 1, CREATE */
    GodotJSScriptInstance* instance = memnew(GodotJSScriptInstance);

    instance->owner_ = p_owner;
    instance->script_ = Ref(this); // must set before 'set_script_instance'
    instance->env_ = env;
    instance->class_id_ = module->script_class_id;
    instance->owner_->set_script_instance(instance);

    /* STEP 2, INITIALIZE AND CONSTRUCT */
    {
        MutexLock lock(GodotJSScriptLanguage::get_singleton()->mutex_);
        instances_.insert(p_owner);
    }
    instance->object_id_ = env->bind_godot_object(native_class_id, p_owner, p_this);
    if (!instance->object_id_)
    {
        instance->script_ = Ref<GodotJSScript>();
        instance->owner_->set_script_instance(nullptr);
        //NOTE `instance` becomes an invalid pointer since it's deleted in `set_script_instance`
        {
            MutexLock lock(GodotJSScriptLanguage::get_singleton()->mutex_);
            instances_.erase(p_owner);
        }
        JSB_LOG(Error, "Error constructing a GodotJSScriptInstance");
        return nullptr;
    }

    return instance;
}

ScriptInstance* GodotJSScript::instance_construct(Object* p_this, bool p_is_temp_allowed, const Variant** p_args, int p_argcount)
{
    jsb_check(is_valid());
    jsb_check(loaded_);
    JSB_LOG(Verbose, "create instance %d of %s(%s)", (uintptr_t) p_this, script_class_info_.native_class_name, script_class_info_.module_id);

    if (!ClassDB::is_parent_class(p_this->get_class_name(), script_class_info_.native_class_name))
    {
        JSB_LOG(Error, "GodotJS class %s (%s) cannot be instantiated for a %s, it requires a %s", script_class_info_.js_class_name, script_class_info_.module_id, p_this->get_class_name(), script_class_info_.native_class_name);
        return nullptr;
    }

    jsb::JSEnvironment env(get_path(), p_is_temp_allowed);
    if (env.is_shadow())
    {
        GodotJSShadowScriptInstance* shadow_instance = memnew(GodotJSShadowScriptInstance);
        shadow_instance->owner_ = p_this;
        shadow_instance->script_ = Ref(this);

        // ensure `GodotJSScript::instance_has(obj)` works properly even if a shadow instance is used.
        {
            MutexLock lock(GodotJSScriptLanguage::get_singleton()->mutex_);
            instances_.insert(shadow_instance->owner_);
        }
        return shadow_instance;
    }

    jsb::JavaScriptModule* module = nullptr;
    const Error err = env->load(script_class_info_.module_id, &module);
    jsb_ensuref(module && err == OK, "JS Module not found: %s", script_class_info_.module_id);

    /* STEP 1, CREATE */
    GodotJSScriptInstance* instance = memnew(GodotJSScriptInstance);

    instance->owner_ = p_this;
    instance->script_ = Ref(this); // must set before 'set_script_instance'
    instance->env_ = env;
    instance->class_id_ = module->script_class_id;
    instance->owner_->set_script_instance(instance);

    /* STEP 2, INITIALIZE AND CONSTRUCT */
    {
        MutexLock lock(GodotJSScriptLanguage::get_singleton()->mutex_);
        instances_.insert(instance->owner_);
    }

    instance->object_id_ = env->crossbind(p_this, instance->class_id_, p_args, p_argcount);

    if (!instance->object_id_)
    {
        instance->script_ = Ref<GodotJSScript>();
        instance->owner_->set_script_instance(nullptr);
        //NOTE `instance` becomes an invalid pointer since it's deleted in `set_script_instance`
        {
            MutexLock lock(GodotJSScriptLanguage::get_singleton()->mutex_);
            instances_.erase(p_this);
        }
        JSB_LOG(Error, "Error constructing a GodotJSScriptInstance");
        return nullptr;
    }

    instance->postbind();

    return instance;
}

Error GodotJSScript::reload(bool p_keep_state)
{
    if (!loaded_) return OK;
    if (!_is_valid()) return ERR_UNAVAILABLE;

    if (!p_keep_state)
    {
        MutexLock lock(GodotJSScriptLanguage::get_singleton()->mutex_);
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
    const StringName& module_id = script_class_info_.module_id;
    jsb::JSEnvironment env(get_path(), true);

    //TODO different env has different module state, we need to refresh the state in all envs when marking a module as dirty somewhere
    const jsb::ModuleReloadResult::Type result = env->mark_as_reloading(module_id);
    if (result == jsb::ModuleReloadResult::Requested)
    {
        //TODO `Callable` objects bound with this script should be invalidated somehow?
        // ...

        loaded_ = false;
    }
    else if (result != jsb::ModuleReloadResult::NoChanges)
    {
        JSB_LOG(Warning, "failed to mark module as reloading: %s (%d)", module_id, result);
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
    if (!loaded_ || !_is_valid()) return {};

    String base_type;
    const String class_name = GodotJSScriptLanguage::get_singleton()->get_global_class_name(get_path(), &base_type);
    DocData::ClassDoc class_doc_data;

    class_doc_data.name = class_name;
    class_doc_data.inherits = base_type.is_empty() ? "Object" : base_type;
    class_doc_data.is_script_doc = true;
    class_doc_data.brief_description = script_class_info_.doc.brief_description;
    class_doc_data.is_deprecated = script_class_info_.doc.is_deprecated;
    class_doc_data.is_experimental = script_class_info_.doc.is_experimental;
#if GODOT_4_3_OR_NEWER
    class_doc_data.deprecated_message = script_class_info_.doc.deprecated_message;
    class_doc_data.experimental_message = script_class_info_.doc.experimental_message;
#endif
    class_doc_data.script_path = get_path();
    for (const auto& item : script_class_info_.properties)
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
    return script_class_info_.icon;
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

    String exposed_name = p_method;

    if (exposed_name.begins_with("_"))
    {
        exposed_name = jsb::internal::NamingUtil::get_member_name(exposed_name);
    }

    const GodotJSScript* current = this;
    while (current)
    {
        //TODO temp fix
        if (!current->loaded_) const_cast<GodotJSScript*>(current)->load_module_immediately();
        if (current->is_valid() && current->script_class_info_.methods.has(exposed_name)) return true;
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
    return is_valid() ? script_class_info_.signals.has(p_signal) : false;
}

void GodotJSScript::get_script_signal_list(List<MethodInfo>* r_signals) const
{
    if (!is_valid()) return;

    for (const auto& it : script_class_info_.signals)
    {
        //TODO details?
        MethodInfo item = {};
        item.name = it.key;
        r_signals->push_back(item);
    }

    if (base.is_valid())
    {
        base->get_script_signal_list(r_signals);
    }
}

void GodotJSScript::get_script_method_list(List<MethodInfo>* p_list) const
{
    ensure_module_loaded();
    jsb_check(loaded_);

    for (const auto& it : script_class_info_.methods)
    {
        //TODO details?
        MethodInfo item = {};
        item.name = it.key;
        p_list->push_back(item);
    }

    if (base.is_valid() && base->is_valid())
    {
        base->get_script_method_list(p_list);
    }
}

void GodotJSScript::get_script_property_list(List<PropertyInfo>* p_list) const
{
    ensure_module_loaded();
    jsb_check(loaded_);

#ifdef TOOLS_ENABLED
    p_list->push_back(get_class_category());
#endif
    for (const auto& it : script_class_info_.properties)
    {
        p_list->push_back((PropertyInfo) it.value);
    }

    if (base.is_valid() && base->is_valid())
    {
        base->get_script_property_list(p_list);
    }
}

bool GodotJSScript::get_property_default_value(const StringName& p_property, Variant& r_value) const
{
    ensure_module_loaded();
    if (const HashMap<StringName, Variant>::ConstIterator it = member_default_values_cache.find(p_property))
    {
        r_value = it->value;
        return true;
    }

    return base.is_valid() && base->is_valid()
        ? base->get_property_default_value(p_property, r_value)
        : false;
}

#if GODOT_4_5_OR_NEWER
const Variant GodotJSScript::get_rpc_config() const
#elif GODOT_4_4_OR_NEWER
Variant GodotJSScript::get_rpc_config() const
#else
const Variant GodotJSScript::get_rpc_config() const
#endif
{
    ensure_module_loaded();
    jsb_check(loaded_);

    return script_class_info_.rpc_config;
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
    MutexLock lock(GodotJSScriptLanguage::get_singleton()->mutex_);
    return instances_.has(const_cast<Object*>(p_this));
}

Error GodotJSScript::load_source_code(const String &p_path)
{
    Error err;
#ifdef TOOLS_ENABLED
	const String source_code = FileAccess::get_file_as_string(p_path, &err);
#else

#if JSB_USE_TYPESCRIPT
	const String path = jsb::internal::PathUtil::convert_typescript_path(p_path);
	const String source_code = FileAccess::get_file_as_string(path, &err);
#else
	const String path = jsb::internal::PathUtil::convert_javascript_path(p_path);
	const String source_code = FileAccess::get_file_as_string(path, &err);
#endif

#endif
    if (err != OK)
    {
        JSB_LOG(Warning, "can not read source from %s", p_path);
    }
    else
    {
        set_source_code(source_code);
    }
    return err;
}

void GodotJSScript::load_module_if_missing()
{
    if (!loaded_ || _is_valid()) return;

    JSB_LOG(Verbose, "force to load missing script %s", get_path());
    loaded_ = false;
    load_module_immediately();
}

void GodotJSScript::load_module_immediately()
{
    if (loaded_) return;
    JSB_BENCHMARK_SCOPE(GodotJSScript, load_module);

    const String path = jsb::internal::PathUtil::convert_typescript_path(get_path());
    jsb::JSEnvironment env(get_path(), true);

    loaded_ = true;
    base.unref();
    source_changed_cache = true;
    jsb::JavaScriptModule* module;
    if (const Error err = env->load(path, &module); err != OK)
    {
        script_class_info_ = {};
#ifdef TOOLS_ENABLED
        if (FileAccess::exists(get_path()) && !FileAccess::exists(path))
        {
            JSB_LOG(Error,
                "the javascript file is missing: %s (source: %s), "
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
    {
        const jsb::ScriptClassInfoPtr class_info_ptr = env->find_script_class(module->script_class_id);
        script_class_info_ = class_info_ptr ? (jsb::StatelessScriptClassInfo) *class_info_ptr : jsb::StatelessScriptClassInfo();
    }
    if (_is_valid())
    {
        JSB_LOG(VeryVerbose, "GodotJSScript module loaded %s", path);
        {
            //TODO a dirty but approaching solution for hot-reloading
            //TODO will crash if reloading script instances in worker threads
            MutexLock lock(GodotJSScriptLanguage::get_singleton()->mutex_); // necessary?
            for (RBSet<Object *>::Element *E = instances_.front(); E;)
            {
                RBSet<Object *>::Element *N = E->next();
                Object* obj = E->get();
                jsb_check(obj->get_script() == Ref(this));
                jsb_check(env->verify_object(obj));

                if (ClassDB::is_parent_class(env->get_script_class(module->script_class_id)->native_class_name, obj->get_class_name()))
                {
                    env->rebind(obj, module->script_class_id);
                }
                else
                {
                    JSB_LOG(Warning, "Cannot rebind class %s (%s) on %s, it requires a %s", script_class_info_.js_class_name, script_class_info_.module_id, obj->get_class_name(), env->get_script_class(module->script_class_id)->native_class_name);
                    obj->set_script(Ref<Script>());
                }

                E = N;
            }
        }

        // setup base script
        {
            //TODO do not rely on ResourceLoader
            if (script_class_info_.base_script_module_id)
            {
                jsb::JavaScriptModule* base_module = nullptr;
                const Error err = env->load(script_class_info_.base_script_module_id, &base_module);
                jsb_ensuref(base_module && err == OK, "JS Module not found: %s", script_class_info_.base_script_module_id);
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

PlaceHolderScriptInstance* GodotJSScript::placeholder_instance_create(Object* p_this)
{
#ifdef TOOLS_ENABLED
    if (!is_valid())
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
    if (!is_valid()) return;
    _update_exports(nullptr);
#endif
}

void GodotJSScript::_update_exports_values(List<PropertyInfo>& r_props, HashMap<StringName, Variant>& r_values)
{
    for (const KeyValue<StringName, Variant> &E : member_default_values_cache)
    {
        r_values[E.key] = E.value;
    }

#ifdef TOOLS_ENABLED
    r_props.push_back(get_class_category());
#endif
    for (const PropertyInfo &E : members_cache)
    {
        r_props.push_back(E);
    }

    if (base.is_valid() && base->is_valid())
    {
        base->_update_exports_values(r_props, r_values);
    }
}

Variant GodotJSScript::_new(const Variant** p_args, int p_argcount, Callable::CallError &r_error)
{
    if (!is_valid())
    {
        JSB_LOG(Error, "Unable to create new instance. The script was not properly loaded (%s)", get_path());
        return Variant();
    }

    r_error.error = Callable::CallError::CALL_OK;
    Object *owner = ClassDB::instantiate(script_class_info_.native_class_name);

    ScriptInstance *script_instance = instance_construct(owner, false, p_args, p_argcount);

    if (!script_instance)
    {
        memdelete(owner);
        return Variant();
    }

    return owner;
}

bool GodotJSScript::_update_exports(PlaceHolderScriptInstance* p_instance_to_update)
{
    // do not crash the engine if the script not loaded successfully
    if (!is_valid())
    {
        JSB_LOG(Error, "script failed to load (%s)", get_path());
        return false;
    }

    bool changed = false;

    if (source_changed_cache)
    {
        source_changed_cache = false;
        changed = true;

        members_cache.clear();
        member_default_values_cache.clear();

        jsb::JSEnvironment env(get_path(), true);
        env->check_internal_state();

        jsb::JavaScriptModule* module = nullptr;
        const Error err = env->load(script_class_info_.module_id, &module);
        jsb_ensuref(module && err == OK, "JS Module not found: %s", script_class_info_.module_id);

        if (const jsb::ScriptClassInfoPtr class_info = env->find_script_class(module->script_class_id))
        {
            for (const KeyValue<StringName, jsb::ScriptPropertyInfo> &pair : script_class_info_.properties)
            {
                const jsb::ScriptPropertyInfo &pi = pair.value;
                members_cache.push_back((PropertyInfo) pi);
                // values[pair.key] = jsb_ext_type_convert({}, pi.type);

                //TODO maybe this behaviour is not expected
                Variant default_value;
                env->get_default_property_value(*class_info, pi.name, default_value);
                member_default_values_cache[pi.name] = default_value;
                JSB_LOG(VeryVerbose, "GodotJS script default %s.%s = %s",
                    _is_valid() ? script_class_info_.js_class_name : "(unknown)",
                    pi.name,
                    default_value);
            }
        }
        else
        {
            JSB_LOG(Warning, "ScriptClassInfo is invalid, fallback to empty default values (script %s)", get_path());
            for (const KeyValue<StringName, jsb::ScriptPropertyInfo> &pair : script_class_info_.properties)
            {
                const jsb::ScriptPropertyInfo &pi = pair.value;
                members_cache.push_back({ pi.type, pi.name, pi.hint, pi.hint_string, pi.usage, pi.class_name });

                Variant default_value;
                jsb::internal::VariantUtil::construct_variant(default_value, pi.type);
                member_default_values_cache[pi.name] = default_value;
            }
        }
    }

    if (base.is_valid() && base->_update_exports(p_instance_to_update))
    {
        changed = true;
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

    return changed;
}

void GodotJSScript::_bind_methods() {
    ClassDB::bind_vararg_method(METHOD_FLAGS_DEFAULT, "new", &GodotJSScript::_new, MethodInfo("new"));
}

void GodotJSScript::reload_from_file()
{
    //TODO reload, maybe it's OK?
    reload(true);
}
