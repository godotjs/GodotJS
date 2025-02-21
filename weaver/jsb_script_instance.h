#ifndef GODOTJS_SCRIPT_INSTANCE_H
#define GODOTJS_SCRIPT_INSTANCE_H

#include "core/object/script_language.h"
#include "jsb_script.h"

//TODO stupid way to handle the temp instance created by asynchronous ResourceLoader

// A runtime placeholder for the script instance which is instantiated by async resource loader request.
// It can only be used to store states, DO NOT invoke `callp()` anyway. And, all notifications are ignored.
class GodotJSScriptTempInstance : public ScriptInstance
{
private:
    friend class GodotJSScript;

    //TODO unsafe?? need to strongly reference the owner object if it's RefCounted. we use Variant for simplicity
    Variant owner_;
    Ref<GodotJSScript> script_;
    HashMap<StringName, Variant> state_;

public:
#pragma region ScriptIntance Implementation
    virtual Object* get_owner() override { return owner_; }

    virtual bool set(const StringName& p_name, const Variant& p_value) override
    {
        state_[p_name] = p_value;
        return true;
    }
    virtual bool get(const StringName& p_name, Variant& r_ret) const override
    {
        if (const Variant* ptr = state_.getptr(p_name))
        {
            r_ret = *ptr;
            return true;
        }
        return false;
    }
    virtual void get_property_list(List<PropertyInfo>* p_properties) const override
    {
        script_->get_script_property_list(p_properties);
    }
    virtual Variant::Type get_property_type(const StringName& p_name, bool* r_is_valid = nullptr) const override
    {
        if (const jsb::ScriptPropertyInfo* ptr = script_->script_class_info_.properties.getptr(p_name))
        {
            if (r_is_valid) *r_is_valid = true;
            return ptr->type;
        }
        return Variant::NIL;
    }
    virtual void validate_property(PropertyInfo& p_property) const override {}
    virtual bool property_can_revert(const StringName& p_name) const override { return false; }
    virtual bool property_get_revert(const StringName& p_name, Variant& r_ret) const override { return false; }

    virtual void get_method_list(List<MethodInfo>* p_list) const override { return script_->get_script_method_list(p_list); }
    virtual bool has_method(const StringName& p_method) const override { return script_->script_class_info_.methods.has(p_method); }
    virtual Variant callp(const StringName& p_method, const Variant** p_args, int p_argcount, Callable::CallError& r_error) override
    {
        r_error.error = Callable::CallError::CALL_ERROR_INVALID_METHOD;
        return {};
    }

    virtual void notification(int p_notification, bool p_reversed = false) override
    {
        JSB_LOG(Error, "now allowed");
    }

    virtual Ref<Script> get_script() const override { return script_; }

    virtual ScriptLanguage* get_language() override { return script_->get_language(); }

    virtual const Variant get_rpc_config() const override { return script_->get_rpc_config(); }
#pragma endregion

    virtual ~GodotJSScriptTempInstance() override {}

private:
    GodotJSScriptTempInstance() {}
};

class GodotJSScriptInstance : public ScriptInstance
{
private:
    friend class GodotJSScript;

    Object* owner_ = nullptr;
    Ref<GodotJSScript> script_;

    std::shared_ptr<jsb::Environment> env_;

    // script class handle
    jsb::ScriptClassID class_id_;

    // object handle
    jsb::NativeObjectID object_id_;

private:
    jsb::ScriptClassInfoPtr get_script_class() const;

public:
    // for Environment lifecycle control (avoid object leaks), detach all JS object bindings
    // void _detach();

#pragma region ScriptIntance Implementation
    virtual Object* get_owner() override { return owner_; }

    virtual bool set(const StringName& p_name, const Variant& p_value) override;
    virtual bool get(const StringName& p_name, Variant& r_ret) const override;
    virtual void get_property_list(List<PropertyInfo>* p_properties) const override;
    virtual Variant::Type get_property_type(const StringName& p_name, bool* r_is_valid = nullptr) const override;
    virtual void validate_property(PropertyInfo& p_property) const override;

    virtual bool property_can_revert(const StringName& p_name) const override;
    virtual bool property_get_revert(const StringName& p_name, Variant& r_ret) const override;

    virtual void get_method_list(List<MethodInfo>* p_list) const override;
    virtual bool has_method(const StringName& p_method) const override;
    virtual Variant callp(const StringName& p_method, const Variant** p_args, int p_argcount, Callable::CallError& r_error) override;

    virtual void notification(int p_notification, bool p_reversed = false) override;

    virtual Ref<Script> get_script() const override { return script_; }

    virtual ScriptLanguage* get_language() override;

    virtual const Variant get_rpc_config() const override;
#pragma endregion

    virtual ~GodotJSScriptInstance() override;

private:
    GodotJSScriptInstance() {}
};

#endif
