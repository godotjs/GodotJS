#include "jsb_script_language.h"

#include <iterator>

#include "../jsb_project_preset.h"
#include "../internal/jsb_internal.h"
#include "../bridge/jsb_amd_module_loader.h"

#include "jsb_script.h"
#include "editor/editor_settings.h"

#include "modules/regex/regex.h"

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
}

GodotJSScriptLanguage::~GodotJSScriptLanguage()
{
    jsb::internal::StringNames::free();
    jsb_check(singleton_ == this);
    singleton_ = nullptr;

    //TODO manage script list in a safer way (access and ref with script.id)
    MutexLock lock(mutex_);
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

        jsb::DefaultModuleResolver& resolver = environment_->add_module_resolver<jsb::DefaultModuleResolver>()
            .add_search_path(jsb::internal::Settings::get_jsb_out_res_path()) // default path of js source (results of compiled ts, at '.godot/GodotJS' by default)
            .add_search_path("res://") // use the root directory as custom lib path by default
#ifdef TOOLS_ENABLED
            .add_search_path("res://node_modules") // so far, it's only for editor scripting
#endif
        ;

        for (const String& path : jsb::internal::Settings::get_additional_search_paths())
        {
            resolver.add_search_path(path);
        }

        // load internal scripts (jsb.core, jsb.editor.main, jsb.editor.codegen)
        {
            size_t len;
            static constexpr char kBundleSourceName[] = "jsb.bundle.js";
            const char* str = GodotJSProjectPreset::get_source_rt(kBundleSourceName, len);
            jsb_checkf(str, "the embedded 'jsb.bundle.js' not found, run 'scons' again to refresh all *.gen.cpp sources");
            jsb_check(len == (size_t)(int) len);
            jsb::AMDModuleLoader::load_source(environment_.get(), str, (int) len, kBundleSourceName);
        }
    }
}

void GodotJSScriptLanguage::finish()
{
    jsb_check(once_inited_);
    once_inited_ = false;
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
    if (environment_->validate_script(p_path))
    {
        return true;
    }

    //TODO parse error info
    ScriptError err;
    err.line = 0;
    err.column = 0;
    err.message = "NOT_IMPLEMENTED";
    r_errors->push_back(err);
    return false;
}

Ref<Script> GodotJSScriptLanguage::make_template(const String& p_template, const String& p_class_name, const String& p_base_class_name) const
{
    Ref<GodotJSScript> spt;
    spt.instantiate();
    String processed_template = p_template;
    processed_template = processed_template.replace("_BASE_", p_base_class_name)
                                 .replace("_CLASS_SNAKE_CASE_", jsb::internal::VariantUtil::to_snake_case_id(p_class_name))
                                 .replace("_CLASS_", jsb::internal::VariantUtil::to_pascal_case_id(p_class_name))
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
    // we can not load the script module in-place because `get_global_class_name` could be called from EditorFileSystem (background) scan
    Error err;
    Ref<FileAccess> f = FileAccess::open(p_path, FileAccess::READ, &err);
    if (err)
    {
        return String();
    }

    const String source = f->get_as_utf8_string();
    if (class_name_matcher_.is_null())
    {
        const_cast<GodotJSScriptLanguage*>(this)->class_name_matcher_ =
            RegEx::create_from_string(R"(\s*export\s+default\s+class\s+(\w+)\s+extends\s+(\w+))");
    }
    const Ref<RegExMatch> match = class_name_matcher_->search(source);
    if (match.is_valid() && match->get_group_count() == 2)
    {
        const String class_name = match->get_string(1);
        if (r_base_type) *r_base_type = match->get_string(2);
        return class_name;
    }
    return {};
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

void GodotJSScriptLanguage::scan_external_changes()
{
    environment_->scan_external_changes();

#ifdef TOOLS_ENABLED
    // fix scripts with no .js counterpart found (only missing scripts)
    {
        MutexLock lock(mutex_);
        const SelfList<GodotJSScript>* elem = script_list_.first();
        while (elem)
        {
            elem->self()->load_module_if_missing();
            elem = elem->next();
        }
    }
#endif
}
