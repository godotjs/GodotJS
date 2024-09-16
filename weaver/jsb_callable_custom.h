#ifndef GODOTJS_CALLABLE_H
#define GODOTJS_CALLABLE_H
#include "../internal/jsb_macros.h"
#include "jsb_bridge.h"

class GodotJSCallableCustom : public CallableCustom
{
private:
    ObjectID object_id_;
    jsb::ObjectCacheID callback_id_;
    jsb::EnvironmentID env_id_;

public:
    static bool _compare_equal(const CallableCustom* p_a, const CallableCustom* p_b)
    {
        // types are already ensured by `Callable::operator==` with the comparator function pointers before calling
        const GodotJSCallableCustom* js_cc_a = (const GodotJSCallableCustom*)p_a;
        const GodotJSCallableCustom* js_cc_b = (const GodotJSCallableCustom*)p_b;
        return js_cc_a->callback_id_ == js_cc_b->callback_id_;
    }

    static bool _compare_less(const CallableCustom* p_a, const CallableCustom* p_b)
    {
        const GodotJSCallableCustom* js_cc_a = (const GodotJSCallableCustom*)p_a;
        const GodotJSCallableCustom* js_cc_b = (const GodotJSCallableCustom*)p_b;
        return js_cc_a->callback_id_ < js_cc_b->callback_id_;
        // return !_compare_equal(p_a, p_b) && p_a < p_b;
    }

    GodotJSCallableCustom(ObjectID p_object_id, jsb::EnvironmentID p_env_id, jsb::ObjectCacheID p_callback_id)
        : object_id_(p_object_id), callback_id_(p_callback_id), env_id_(p_env_id)
    {
    }

    virtual ~GodotJSCallableCustom() override;

    /**
     * it's a free callable object if object_id_ is explicitly assigned as zero.
     * otherwise, do the same thing in CallableCustom::is_valid().
     */
    virtual bool is_valid() const override { return object_id_.is_null() || ObjectDB::get_instance(object_id_); }

    virtual String get_as_text() const override;
    virtual ObjectID get_object() const override { return object_id_; }
    virtual void call(const Variant** p_arguments, int p_argcount, Variant& r_return_value, Callable::CallError& r_call_error) const override;

    virtual CompareEqualFunc get_compare_equal_func() const override { return _compare_equal; }
    virtual CompareLessFunc get_compare_less_func() const override { return _compare_less; }
    virtual uint32_t hash() const override { return callback_id_.hash(); }
};

#endif
