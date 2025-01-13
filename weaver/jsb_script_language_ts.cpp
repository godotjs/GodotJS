#include "jsb_script_language_ts.h"

#include <iterator>

#include "../jsb_project_preset.h"
#include "../internal/jsb_internal.h"
#include "../bridge/jsb_worker.h"
#include "../bridge/jsb_amd_module_loader.h"

#include "jsb_script.h"
#include "editor/editor_settings.h"

#include "modules/regex/regex.h"

#ifdef TOOLS_ENABLED
#include "../weaver-editor/templates/templates.ts.gen.h"
#endif

GodotJSScriptLanguage * GodotJSScriptLanguage::singleton_ = nullptr;

void GodotJSScriptLanguage::get_recognized_extensions(List<String>* p_extensions) const
{
    p_extensions->push_back(JSB_TYPESCRIPT_EXT);
}

GodotJSScriptBase* GodotJSScriptLanguage::create_godotjsscript() const
{
    return memnew(GodotJSScript);
}

bool GodotJSScriptLanguage::handles_global_class_type(const String& p_type) const
{
    return p_type == jsb_typename(GodotJSScript);
}

String GodotJSScriptLanguage::get_name() const
{
    return jsb_typename(GodotJSScript);
}

String GodotJSScriptLanguage::get_type() const
{
    return jsb_typename(GodotJSScript);
}

Vector<ScriptLanguage::ScriptTemplate> GodotJSScriptLanguage::get_built_in_templates(ConstStringNameRefCompat p_object)
{
    Vector<ScriptTemplate> templates;
#ifdef TOOLS_ENABLED
    for (int i = 0; i < TEMPLATES_ARRAY_SIZE; i++) {
        if (TEMPLATES[i].inherit == p_object) {
            templates.append(TEMPLATES[i]);
        }
    }
#endif
    return templates;
}

