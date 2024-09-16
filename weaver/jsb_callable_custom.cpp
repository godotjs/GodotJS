#include "jsb_callable_custom.h"

String GodotJSCallableCustom::get_as_text() const
{
    //TODO a human readable string, but OK if empty
    return String();
}

GodotJSCallableCustom::~GodotJSCallableCustom()
{
    if (callback_id_)
    {
        if (const std::shared_ptr<jsb::Environment> env = jsb::Environment::_access(env_id_))
        {
            env->release_function(callback_id_);
        }
    }
}

void GodotJSCallableCustom::call(const Variant** p_arguments, int p_argcount, Variant& r_return_value, Callable::CallError& r_call_error) const
{
    const std::shared_ptr<jsb::Environment> env = jsb::Environment::_access(env_id_);
    if (!env)
    {
        r_call_error.error = Callable::CallError::CALL_ERROR_INVALID_METHOD;
        return;
    }

    const jsb::NativeObjectID object_id = object_id_.is_null() ? jsb::NativeObjectID() : env->get_object_id(ObjectDB::get_instance(object_id_));
    env->call_function(object_id, callback_id_, p_arguments, p_argcount, r_call_error);
}
