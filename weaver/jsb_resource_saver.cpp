#include "jsb_resource_saver.h"
#include "jsb_script.h"
#include "jsb_script_language.h"
#include "core/error/error_list.h"

// @seealso: gdscript.cpp ResourceFormatSaverGDScript::save
Error ResourceFormatSaverGodotJSScript::save(const Ref<Resource>& p_resource, const String& p_path, uint32_t p_flags)
{
    const Ref<GodotJSScriptBase> sqscr = p_resource;
    ERR_FAIL_COND_V(sqscr.is_null(), ERR_INVALID_PARAMETER);

    Error err;
    const Ref<FileAccess> file = FileAccess::open(p_path, FileAccess::WRITE, &err);
    if (err)
    {
        JSB_LOG(Error, "Cannot save %s file '%s'.", jsb_typename(GodotJSScriptBase), p_path);
        return err;
    }
    file->store_string(sqscr->get_source_code());
    if (file->get_error() != OK && file->get_error() != ERR_FILE_EOF)
    {
        return ERR_CANT_CREATE;
    }

    if (ScriptServer::is_reload_scripts_on_save_enabled())
    {
        // WTF??
        sqscr->get_language()->reload_tool_script(p_resource, true);
    }

    return OK;
}

void ResourceFormatSaverGodotJSScript::get_recognized_extensions(const Ref<Resource>& p_resource, List<String>* p_extensions) const
{
    if (Object::cast_to<GodotJSScriptBase>(*p_resource))
    {
        p_extensions->push_back(JSB_TYPESCRIPT_EXT);
        p_extensions->push_back(JSB_JAVASCRIPT_EXT);
    }
}

bool ResourceFormatSaverGodotJSScript::recognize(const Ref<Resource>& p_resource) const
{
    return Object::cast_to<GodotJSScriptBase>(*p_resource) != nullptr;
}
