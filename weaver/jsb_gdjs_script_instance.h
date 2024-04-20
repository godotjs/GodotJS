#ifndef JAVASCRIPT_SCRIPT_INSTANCE_H
#define JAVASCRIPT_SCRIPT_INSTANCE_H

#include "core/object/script_language.h"
#include "jsb_gdjs_script.h"

class GodotJSScriptInstance : public ScriptInstance
{
private:
    friend class GodotJSScript;

    Object* owner_ = nullptr;
    Ref<GodotJSScript> script_;
    // object handle id
    jsb::NativeObjectID object_id_;

public:
#pragma region ScriptIntance Implementation
    virtual Object* get_owner() override { return owner_; }

    virtual bool set(const StringName &p_name, const Variant &p_value) override;
    virtual bool get(const StringName &p_name, Variant &r_ret) const override;
    virtual void get_property_list(List<PropertyInfo> *p_properties) const override;
    virtual Variant::Type get_property_type(const StringName &p_name, bool *r_is_valid = nullptr) const override;
    virtual void validate_property(PropertyInfo &p_property) const override;

    virtual bool property_can_revert(const StringName &p_name) const override;
    virtual bool property_get_revert(const StringName &p_name, Variant &r_ret) const override;

    virtual void get_method_list(List<MethodInfo> *p_list) const override;
    virtual bool has_method(const StringName &p_method) const override;
    virtual Variant callp(const StringName &p_method, const Variant **p_args, int p_argcount, Callable::CallError &r_error) override;

    virtual void notification(int p_notification, bool p_reversed = false) override;

    virtual Ref<Script> get_script() const override { return script_; }

    virtual ScriptLanguage *get_language() override;

    virtual const Variant get_rpc_config() const override { return script_->get_rpc_config(); }
#pragma endregion

    virtual ~GodotJSScriptInstance() override;
private:
    GodotJSScriptInstance() {}
};

#endif
