#include "jsb_script_language_js.h"

#include <iterator>

#include "../jsb_project_preset.h"
#include "../internal/jsb_internal.h"
#include "../bridge/jsb_worker.h"
#include "../bridge/jsb_amd_module_loader.h"

#include "jsb_script.h"
#include "editor/editor_settings.h"

#include "modules/regex/regex.h"

#ifdef TOOLS_ENABLED
#include "../weaver-editor/templates/templates.gen.h"
#endif

GodotJavascriptLanguage * GodotJavascriptLanguage::singleton_ = nullptr;

void GodotJavascriptLanguage::get_recognized_extensions(List<String>* p_extensions) const
{
    p_extensions->push_back(JSB_JAVASCRIPT_EXT);
}

GodotJSScriptBase* GodotJavascriptLanguage::create_godotjsscript() const
{
    return memnew(GodotJavaScript);
}


bool GodotJavascriptLanguage::handles_global_class_type(const String& p_type) const
{
    return p_type == jsb_typename(GodotJavaScript);
}

String GodotJavascriptLanguage::get_name() const
{
    return jsb_typename(GodotJavaScript);
}

String GodotJavascriptLanguage::get_type() const
{
    return jsb_typename(GodotJavaScript);
}

