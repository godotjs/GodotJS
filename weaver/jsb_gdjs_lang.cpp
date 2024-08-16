#include "jsb_gdjs_lang.h"

#include <iterator>

#include "../jsb_project_preset.h"
#include "../internal/jsb_path_util.h"
#include "../internal/jsb_settings.h"
#include "../internal/jsb_string_names.h"
#include "jsb_gdjs_script_instance.h"
#include "jsb_gdjs_script.h"
#include "editor/editor_settings.h"

#ifdef TOOLS_ENABLED
#include "../weaver-editor/templates/templates.gen.h"
#endif
GodotJSScriptLanguage* GodotJSScriptLanguage::singleton_ = nullptr;

GodotJSScriptLanguage::GodotJSScriptLanguage()
{
    JSB_BENCHMARK_SCOPE(GodotJSScriptLanguage, Construct);
    jsb_check(!singleton_);
    singleton_ = this;
    jsb::internal::StringNames::create();
    // jsb::internal::Settings::on_init();
}

GodotJSScriptLanguage::~GodotJSScriptLanguage()
{
    jsb::internal::StringNames::free();
    jsb_check(singleton_ == this);
    singleton_ = nullptr;

    //TODO manage script list in a safer way (access and ref with script.id)
    while (SelfList<GodotJSScript>* script_el = script_list_.first())
    {
        script_el->remove_from_list();
    }
}

void GodotJSScriptLanguage::init()
{
    if (!once_inited_)
    {
        JSB_BENCHMARK_SCOPE(GodotJSScriptLanguage, init);
        once_inited_ = true;
        JSB_LOG(VeryVerbose, "jsb lang init");
        environment_ = std::make_shared<jsb::Environment>();
        realm_ = std::make_shared<jsb::Realm>(environment_);

        environment_->add_module_resolver<jsb::DefaultModuleResolver>()
                    .add_search_path(jsb::internal::Settings::get_jsb_out_res_path())
                    .add_search_path("res://") //TODO use configurable path for custom lib path
#ifdef TOOLS_ENABLED
                    .add_search_path("res://node_modules") // so far, it's only for editor scripting
#endif
        ;

        // load internal scripts (jsb.core, jsb.editor.main, jsb.editor.codegen)
        {
            size_t len;
            Error err;
            const char* str = GodotJSPorjectPreset::get_source_rt("jsb.bundle.js", len);
            jsb_checkf(str, "the embedded 'jsb.bundle.js' not found, run 'scons' again to refresh all *.gen.cpp sources");
            jsb_check(len == (size_t)(int) len);
            realm_->eval_source(str, (int) len, "eval", err);
        }
    }
}

void GodotJSScriptLanguage::finish()
{
    jsb_check(once_inited_);
    once_inited_ = false;
    realm_.reset();
    environment_.reset();
    JSB_LOG(VeryVerbose, "jsb lang finish");
}

void GodotJSScriptLanguage::frame()
{
    environment_->update();
    // environment_->gc();
}

void GodotJSScriptLanguage::get_reserved_words(List<String>* p_words) const
{
    static const char* keywords[] = {
        "return", "function", "interface", "class", "let", "break", "as", "any", "switch", "case", "if", "enum",
        "throw", "else", "var", "number", "string", "get", "module", "instanceof", "typeof", "public", "private",
        "while", "void", "null", "super", "this", "new", "in", "await", "async", "extends", "static",
        "package", "implements", "interface", "continue", "yield", "const", "export", "finally", "for",
        "import", "byte", "delete", "goto",
    };
    for (int i = 0, n = std::size(keywords); i < n; ++i)
    {
        p_words->push_back(keywords[i]);
    }
}

struct JavaScriptControlFlowKeywords
{
    HashSet<String> values;
    jsb_force_inline JavaScriptControlFlowKeywords()
    {
        constexpr static const char* _keywords[] =
        {
            "if", "else", "switch", "case", "do", "while", "for", "foreach",
            "return", "break", "continue",
            "try", "throw", "catch", "finally",
        };
        for (size_t index = 0; index < ::std::size(_keywords); ++index)
        {
            values.insert(_keywords[index]);
        }
    }
};

bool GodotJSScriptLanguage::is_control_flow_keyword(ConstStringRefCompat p_keyword) const
{
    static JavaScriptControlFlowKeywords collection;
    return collection.values.has(p_keyword);
}

void GodotJSScriptLanguage::get_doc_comment_delimiters(List<String>* p_delimiters) const
{
    p_delimiters->push_back("///");
}

void GodotJSScriptLanguage::get_comment_delimiters(List<String>* p_delimiters) const
{
    p_delimiters->push_back("//");
    p_delimiters->push_back("/* */");
}

void GodotJSScriptLanguage::get_string_delimiters(List<String>* p_delimiters) const
{
    p_delimiters->push_back("' '");
    p_delimiters->push_back("\" \"");
    p_delimiters->push_back("` `");
}

Script* GodotJSScriptLanguage::create_script() const
{
    return memnew(GodotJSScript);
}

bool GodotJSScriptLanguage::validate(const String& p_script, const String& p_path, List<String>* r_functions, List<ScriptError>* r_errors, List<Warning>* r_warnings, HashSet<int>* r_safe_lines) const
{
    jsb::JavaScriptExceptionInfo exception_info;
    if (realm_->validate_script(p_path, &exception_info))
    {
        return true;
    }

    //TODO parse error info
    ScriptError err;
    err.line = 0;
    err.column = 0;
    err.message = exception_info;
    r_errors->push_back(err);
    return false;
}

Ref<Script> GodotJSScriptLanguage::make_template(const String& p_template, const String& p_class_name, const String& p_base_class_name) const
{
    Ref<GodotJSScript> spt;
    spt.instantiate();
	String processed_template = p_template;
    processed_template = processed_template.replace("_BASE_", p_base_class_name)
                                 .replace("_CLASS_SNAKE_CASE_", p_class_name.to_snake_case().validate_identifier())
                                 .replace("_CLASS_", p_class_name.to_pascal_case().validate_identifier())
                                 .replace("_TS_", jsb::internal::Settings::get_indentation());
    spt->set_source_code(processed_template);
    return spt;
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

#if GODOT_4_3_OR_NEWER
void GodotJSScriptLanguage::reload_scripts(const Array& p_scripts, bool p_soft_reload)
{
    JSB_LOG(Verbose, "TODO [GodotJSScriptLanguage::reload_scripts] NOT IMPLEMENTED");
}

void GodotJSScriptLanguage::profiling_set_save_native_calls(bool p_enable) 
{
    JSB_LOG(Verbose, "TODO [GodotJSScriptLanguage::profiling_set_save_native_calls] NOT IMPLEMENTED");
}
#endif

void GodotJSScriptLanguage::reload_all_scripts()
{
    //TODO temporarily ignored because it's only called from `RemoteDebugger`
    JSB_LOG(Verbose, "TODO [GodotJSScriptLanguage::reload_all_scripts] temporarily ignored because it's only called from `RemoteDebugger`");
}

void GodotJSScriptLanguage::reload_tool_script(const Ref<Script>& p_script, bool p_soft_reload)
{
    //TODO temporarily ignored because it's only called from `ResourceSaver` (we usually write typescripts in vscode)
    JSB_LOG(Verbose, "TODO [GodotJSScriptLanguage::reload_tool_script] temporarily ignored because it's only called from `ResourceSaver` (we usually write typescripts in vscode)");
}

void GodotJSScriptLanguage::get_recognized_extensions(List<String>* p_extensions) const
{
    p_extensions->push_back(JSB_TYPESCRIPT_EXT);
    p_extensions->push_back(JSB_JAVASCRIPT_EXT);
}

String GodotJSScriptLanguage::get_global_class_name(const String& p_path, String* r_base_type, String* r_icon_path) const
{
    //TODO threading issue
    JSB_LOG(Verbose, "get_global_class_name %s (thread: %s)", p_path, Thread::is_main_thread() ? "main" : "background");
    return {};
}

String GodotJSScriptLanguage::get_name() const
{
    return jsb_typename(GodotJSScript);
}

String GodotJSScriptLanguage::get_type() const
{
    return jsb_typename(GodotJSScript);
}
