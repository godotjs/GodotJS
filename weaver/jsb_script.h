#ifndef GODOTJS_SCRIPT_H
#define GODOTJS_SCRIPT_H

#include "../compat/jsb_compat.h"
#include "../bridge/jsb_bridge.h"

class GodotJSScript : public Script
{
    friend class GodotJSScriptInstance;
    friend class GodotJSScriptInstanceBase;
    friend class GodotJSShadowScriptInstance;
    typedef Script super;

    GDCLASS(GodotJSScript, Script)

private:
    bool loaded_ = false;

    bool source_changed_cache = false;
    String source_;

    Ref<GodotJSScript> base;

    HashSet<PlaceHolderScriptInstance*> placeholders;

    // WTF??
    HashMap<StringName, Variant> member_default_values_cache;
    List<PropertyInfo> members_cache;

    // [INTERNAL] a self linked list to all GodotJSScript (lock is required to access)
    // 'script_class_info_' may be got from another environment,
    // so, explicitly load the module again if you want to create a GodotJSScriptInstance (instead of finding from module cache)
    SelfList<GodotJSScript> script_list_;

    RBSet<Object*> instances_;

    /**
     * 'StatelessScriptClassInfo' itself can be used without an environment,
     * Because we want GodotJSScript can be shared between threads (with a few restrictions, still need to be loaded in a proper thread).
     * So, you still need an environment to generate it (we do not implement a standalone script parser for simplicity).
     * @note valid only if loaded_ is true
     */
    jsb::StatelessScriptClassInfo script_class_info_;

private:
    void load_module_immediately();
    jsb_force_inline void ensure_module_loaded() const { if (jsb_unlikely(!loaded_)) const_cast<GodotJSScript*>(this)->load_module_immediately(); }
    jsb_force_inline bool _is_valid() const { return jsb::internal::VariantUtil::is_valid_name(script_class_info_.module_id); }

    Variant _new(const Variant** p_args, int p_argcount, Callable::CallError &r_error);

    bool _update_exports(PlaceHolderScriptInstance *p_instance_to_update);
    void _update_exports_values(List<PropertyInfo>& r_props, HashMap<StringName, Variant>& r_values);

public:
    GodotJSScript();
    virtual ~GodotJSScript() override;

    StringName get_module_id() const { return script_class_info_.module_id; };

    // Error attach_source(const String& p_path, bool p_take_over);
    Error load_source_code(const String &p_path);
    void load_module_if_missing();

    // Creates a ScriptInstance (for an existing Godot native object) and associates the ScriptInstance with an existing JS object (instance of the script's JS class).
    ScriptInstance* instance_create(const v8::Local<v8::Object>& p_this, Object* p_owner, bool p_is_temp_allowed);

    // Creates a ScriptInstance (and a NEW Godot native object) and associates the ScriptInstance with an existing JS object (instance of the script's JS class).
    ScriptInstance* instance_and_native_object_create(const v8::Local<v8::Object>& p_this, bool p_is_temp_allowed);

    // Creates a ScriptInstance and associates it with a newly constructed JS object (instance of script's class).
    ScriptInstance* instance_construct(Object* p_this, bool p_is_temp_allowed, const Variant **p_args = nullptr, int p_argcount = 0);

#pragma region Script Implementation
    virtual bool can_instantiate() const override;

    virtual Ref<Script> get_base_script() const override; // for script inheritance
    virtual StringName get_global_name() const override;
    virtual bool inherits_script(const Ref<Script>& p_script) const override;

    virtual StringName get_instance_base_type() const override; // this may not work in all scripts, will return empty if so
    virtual ScriptInstance* instance_create(Object* p_this) override { return instance_construct(p_this, true); }

    virtual PlaceHolderScriptInstance* placeholder_instance_create(Object* p_this) override;
    virtual bool instance_has(const Object* p_this) const override;

    virtual bool has_source_code() const override { return !source_.is_empty(); }
    virtual String get_source_code() const override { return source_; }
    virtual void set_source_code(const String& p_code) override;
    virtual void set_path(const String &p_path, bool p_take_over) override;
    virtual Error reload(bool p_keep_state = false) override;

#ifdef TOOLS_ENABLED
#if GODOT_4_4_OR_NEWER
	virtual StringName get_doc_class_name() const override;
#endif
    virtual Vector<DocData::ClassDoc> get_documentation() const override;
    virtual String get_class_icon_path() const override;
    virtual PropertyInfo get_class_category() const override;
#endif // TOOLS_ENABLED

    // TODO: In the next compat breakage rename to `*_script_*` to disambiguate from `Object::has_method()`.
    virtual bool has_method(const StringName& p_method) const override;
    virtual bool has_static_method(const StringName& p_method) const override;

    virtual MethodInfo get_method_info(const StringName& p_method) const override;

    // we expect Godot calling this after loaded_?
    // is_valid() will ensure the module is loaded.
    // [INTERNAL] if it's not expected, call `_is_valid` instead.
    virtual bool is_valid() const override { ensure_module_loaded(); return _is_valid(); }
    virtual bool is_tool() const override { return is_valid() && script_class_info_.is_tool(); }
    virtual bool is_abstract() const override { return is_valid() && script_class_info_.is_abstract(); }

    virtual ScriptLanguage* get_language() const override;

    virtual bool has_script_signal(const StringName& p_signal) const override;
    virtual void get_script_signal_list(List<MethodInfo>* r_signals) const override;

    virtual bool is_placeholder_fallback_enabled() const override { return loaded_ && !is_valid(); }
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

#if GODOT_4_5_OR_NEWER
    virtual const Variant get_rpc_config() const override;
#elif GODOT_4_4_OR_NEWER
    virtual Variant get_rpc_config() const override;
#else
    virtual const Variant get_rpc_config() const override;
#endif

#pragma endregion // Script Interface Implementation

protected:
    static void _bind_methods();

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

#endif
