#ifndef GODOTJS_SCRIPT_INSTANCE_H
#define GODOTJS_SCRIPT_INSTANCE_H

#include "core/object/script_language.h"
#include "jsb_script.h"

// An abstract base class for GodotJS script instance implementations
class GodotJSScriptInstanceBase : public ScriptInstance
{
protected:
    struct ScriptProfilingInfo
    {
        String path_;
        StringName class_;
    };

    struct ScriptCallProfilingScope
    {
        const ScriptProfilingInfo& info_;
        StringName method_;
        uint64_t start_time_;

        ScriptCallProfilingScope(const ScriptProfilingInfo& p_info, const StringName& p_method);
        ~ScriptCallProfilingScope();
    };

protected:
    Object* owner_ = nullptr;
    Ref<GodotJSScript> script_;
#if JSB_DEBUG
    ScriptProfilingInfo profiling_info_;
#endif

public:
    virtual ~GodotJSScriptInstanceBase() override;
    virtual bool is_shadow() const = 0;

#pragma region ScriptIntance Implementation
    virtual Object* get_owner() override { return owner_; }
    virtual Ref<Script> get_script() const override { return script_; }
    virtual ScriptLanguage* get_language() override { return script_->get_language(); }
#pragma endregion


};

// A runtime placeholder for the script instances which instantiated by async resource loader request.
// It can only be used to store states, DO NOT invoke `callp()` anyway. And, all notifications are ignored.
// After the owner object is instantiated, the Environment will replace this shadow instance with a real GodotJSScriptInstance when binding the JS object.
class GodotJSShadowScriptInstance : public GodotJSScriptInstanceBase
{
private:
    friend class GodotJSScript;

    HashMap<StringName, Variant> state_;

public:
    virtual bool is_shadow() const override { return true; }

#pragma region ScriptIntance Implementation
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
    }

    virtual const Variant get_rpc_config() const override { return script_->get_rpc_config(); }
#pragma endregion

private:
    GodotJSShadowScriptInstance() = default;
};

class GodotJSScriptInstance : public GodotJSScriptInstanceBase
{
private:
    friend class GodotJSScript;

    std::shared_ptr<jsb::Environment> env_;

    // script class handle
    jsb::ScriptClassID class_id_;

    // object handle (the JS object binding id)
    jsb::NativeObjectID object_id_;

    HashMap<Variant, Variant, VariantHasher, StringLikeVariantComparator> property_cache_;

private:
    jsb::ScriptClassInfoPtr get_script_class() const;

public:
    virtual bool is_shadow() const override { return false; }

    // for Environment lifecycle control (avoid object leaks), detach all JS object bindings
    // void _detach();

    void postbind();
    void cache_property(const StringName& name, const Variant& value);

#pragma region ScriptIntance Implementation

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

    virtual const Variant get_rpc_config() const override;
#pragma endregion

private:
    GodotJSScriptInstance() {}
};

#endif
