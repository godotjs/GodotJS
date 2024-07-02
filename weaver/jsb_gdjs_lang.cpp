#include "jsb_gdjs_lang.h"

#include <iterator>

#include "../internal/jsb_path_util.h"
#include "../internal/jsb_settings.h"
#include "../internal/jsb_string_names.h"
#include "jsb_gdjs_script_instance.h"
#include "jsb_gdjs_script.h"
#include "editor/editor_settings.h"

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
                    .add_search_path("res://javascripts")
#ifdef TOOLS_ENABLED
                    .add_search_path("res://typescripts/node_modules") // so far, it's only for editor scripting
#endif
        // // search path for editor only scripts
        // .add_search_path(jsb::internal::PathUtil::combine(
        //     jsb::internal::PathUtil::dirname(::OS::get_singleton()->get_executable_path()),
        //     "../modules/jsb/scripts/out"));
        ;

        if (FileAccess::exists("res://javascripts/jsb/jsb.editor.main.js"))
        {
            realm_->load("jsb/jsb.editor.main");
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

bool GodotJSScriptLanguage::is_control_flow_keyword(String p_keyword) const
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
    spt->set_source_code(p_template);
    return spt;
}

Vector<ScriptLanguage::ScriptTemplate> GodotJSScriptLanguage::get_built_in_templates(StringName p_object)
{
    Vector<ScriptTemplate> templates;
#ifdef TOOLS_ENABLED
    //TODO load templates from disc
    ScriptTemplate st;
    st.content = "// template\nexport default class {\n}\n";
    st.description = "a javascript boilerplate";
    st.inherit = p_object;
    st.name = "Basic Class Template";
    templates.append(st);
#endif
    return templates;
}

void GodotJSScriptLanguage::reload_all_scripts()
{
    //TODO temporarily ignored because it's only called from `RemoteDebugger`
    JSB_LOG(Verbose, "TODO");
}

void GodotJSScriptLanguage::reload_tool_script(const Ref<Script>& p_script, bool p_soft_reload)
{
    //TODO temporarily ignored because it's only called from `ResourceSaver` (we usually write typescripts in vscode)
    JSB_LOG(Verbose, "TODO");
}

void GodotJSScriptLanguage::get_recognized_extensions(List<String>* p_extensions) const
{
    p_extensions->push_back(JSB_RES_EXT);
}

jsb::JSValueMove GodotJSScriptLanguage::eval_source(const String& p_code, Error& r_err)
{
    return realm_->eval_source(p_code.utf8(), "eval", r_err);
}

String GodotJSScriptLanguage::get_global_class_name(const String& p_path, String* r_base_type, String* r_icon_path) const
{
    // if (r_icon_path) *r_icon_path = "res://javascripts/icon/filetype-js.svg";
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
