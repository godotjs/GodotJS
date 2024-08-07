#include "jsb_class_info.h"
#include "../internal/jsb_path_util.h"
#include "../weaver/jsb_gdjs_script.h"

namespace jsb
{
    void ScriptClassInfo::_newbind(const v8::Local<v8::Object>& p_self)
    {
        const String source_path = internal::PathUtil::convert_javascript_path(module_id);
        Ref<GodotJSScript> script = ResourceLoader::load(source_path);
        if (script.is_valid())
        {
            jsb_unused(script->can_instantiate()); // make it loaded immediately
            const ScriptInstance* script_instance = script->instance_create(p_self);
            jsb_check(script_instance);
        }
    }

}
