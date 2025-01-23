#ifndef GODOTJS_SCRIPT_H
#define GODOTJS_SCRIPT_H

#include "core/object/script_language.h"
#include "core/templates/rb_set.h"

#include "../bridge/jsb_bridge.h"

class GodotJSScriptLanguageBase;

class GodotJSScriptBase : public Script
{
    friend class GodotJSScriptInstance;
    typedef Script super;


private:
    // if the script invalid (or not actually loaded yet)
    bool valid_ = false;
    bool loaded_ = false;
    bool source_changed_cache = false;
    Ref<GodotJSScriptBase> base;

    GodotJSScriptLanguageBase * lang_;

    HashSet<PlaceHolderScriptInstance*> placeholders;

    // WTF??
    HashMap<StringName, Variant> member_default_values_cache;
    List<PropertyInfo> members_cache;

    SelfList<GodotJSScriptBase> script_list_;
    RBSet<Object*> instances_;

    //TODO improvement needed
    jsb::EnvironmentID env_id_;

    String source_;
    String path_;
    jsb::ScriptClassID script_class_id_;

    //TODO we have realm_ shared pointer here. Thus, we can safely store GodotJSFunction here (v8 global handle)?
    HashMap<StringName, jsb::ObjectCacheID> cached_methods_;

private:
    // bool set_script_property(jsb::NativeObjectID p_object_id, const StringName& p_name, const Variant& p_value);
    // bool get_script_property(jsb::NativeObjectID p_object_id, const StringName& p_name, Variant& r_ret) const;
    Variant call_script_method(jsb::NativeObjectID p_object_id, const StringName& p_method, const Variant** p_argv, int p_argc, Callable::CallError& r_error);
    void release_cached_methods();

    void call_prelude(jsb::NativeObjectID p_object_id);

    void load_module_immediately();
    jsb_force_inline void ensure_module_loaded() const { if (jsb_unlikely(!loaded_)) const_cast<GodotJSScriptBase*>(this)->load_module_immediately(); }

    void _update_exports(PlaceHolderScriptInstance *p_instance_to_update, bool p_base_exports_changed = false);
    void _update_exports_values(List<PropertyInfo>& r_props, HashMap<StringName, Variant>& r_values);

    std::shared_ptr<jsb::Environment> get_environment() const { return jsb::Environment::_access(env_id_); }

protected:
    GodotJSScriptBase(GodotJSScriptLanguageBase * lang);

public:
    virtual ~GodotJSScriptBase() override;

    void attach_source(const String& p_path);
    void load_source_code_from_path();
    void load_module_if_missing();

    jsb::ScriptClassInfoPtr get_script_class() const;

#pragma region Script Implementation
    virtual bool can_instantiate() const override;

    virtual Ref<Script> get_base_script() const override; // for script inheritance
    virtual StringName get_global_name() const override;
    virtual bool inherits_script(const Ref<Script>& p_script) const override;

    virtual StringName get_instance_base_type() const override; // this may not work in all scripts, will return empty if so
    virtual ScriptInstance* instance_create(Object* p_this) override;
    //TODO
    ScriptInstance* instance_create(const v8::Local<v8::Object>& p_this);

    virtual PlaceHolderScriptInstance* placeholder_instance_create(Object* p_this) override;
    virtual bool instance_has(const Object* p_this) const override;

    virtual bool has_source_code() const override { return !source_.is_empty(); }
    virtual String get_source_code() const override { return source_; }
    virtual void set_source_code(const String& p_code) override;
    virtual Error reload(bool p_keep_state = false) override;

#ifdef TOOLS_ENABLED
    virtual Vector<DocData::ClassDoc> get_documentation() const override;
    virtual String get_class_icon_path() const override;
    virtual PropertyInfo get_class_category() const override;
#endif // TOOLS_ENABLED

    // TODO: In the next compat breakage rename to `*_script_*` to disambiguate from `Object::has_method()`.
    virtual bool has_method(const StringName& p_method) const override;
    virtual bool has_static_method(const StringName& p_method) const override;

    virtual MethodInfo get_method_info(const StringName& p_method) const override;

    // we expect Godot calling this after loaded_?
    virtual bool is_valid() const override { ensure_module_loaded(); return valid_; }
    virtual bool is_tool() const override;
    virtual bool is_abstract() const override { return valid_ && get_script_class()->is_abstract(); }

    virtual ScriptLanguage* get_language() const override;

    virtual bool has_script_signal(const StringName& p_signal) const override;
    virtual void get_script_signal_list(List<MethodInfo>* r_signals) const override;

    virtual bool is_placeholder_fallback_enabled() const override { return loaded_ && !valid_; }
    virtual bool get_property_default_value(const StringName& p_property, Variant& r_value) const override;

    virtual void update_exports() override;

    //editor tool
    virtual void get_script_method_list(List<MethodInfo>* p_list) const override;
    virtual void get_script_property_list(List<PropertyInfo>* p_list) const override;

    virtual int get_member_line(const StringName& p_member) const override { return -1; }

    virtual void get_constants(HashMap<StringName, Variant>* p_constants) override
    {
    }
    virtual void get_members(HashSet<StringName>* p_constants) override
    {
    }

    virtual const Variant get_rpc_config() const override;
#pragma endregion // Script Interface Implementation

protected:
#pragma region Script Implementation
#ifdef TOOLS_ENABLED
    virtual void _placeholder_erased(PlaceHolderScriptInstance* p_placeholder) override;
#endif

    //TODO -- begin -- auto reload outside of internal ScriptEditor by intercepting proper callbacks?
    virtual bool editor_can_reload_from_file() override { return true; }
    virtual void reload_from_file() override;
    //TODO -- end   -- auto reload outside of internal ScriptEditor by intercepting proper callbacks?

#pragma endregion

};

class GodotJSScript : public GodotJSScriptBase {
    GDCLASS(GodotJSScript, Script)
public:
    GodotJSScript();
};

class GodotJavaScript : public GodotJSScriptBase {
    GDCLASS(GodotJavaScript, Script)
public:
    GodotJavaScript();
};

#endif
