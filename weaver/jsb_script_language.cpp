#include "jsb_script_language.h"

#include <iterator>

#include "../jsb_project_preset.h"
#include "../internal/jsb_internal.h"
#include "../bridge/jsb_worker.h"
#include "../bridge/jsb_amd_module_loader.h"

#include "jsb_script.h"
#include "editor/editor_settings.h"

#include "modules/regex/regex.h"

int GodotJSScriptLanguageBase::prevent_environment_dispose_ = 0;
std::shared_ptr<jsb::Environment> GodotJSScriptLanguageBase::environment_ = nullptr;

GodotJSScriptLanguageBase::GodotJSScriptLanguageBase()
{
    JSB_BENCHMARK_SCOPE(GodotJSScriptLanguageBase, Construct);
    js_class_name_matcher1_ = RegEx::create_from_string(R"(\s*exports.default\s*=\s*class\s*(\w+)\s*extends\s*(\w+)\s*\{?)");
    js_class_name_matcher2_ = RegEx::create_from_string(R"(\s*exports.default\s*=\s*(\w+)\s*;?)");
    ts_class_name_matcher_ = RegEx::create_from_string(R"(\s*export\s+default\s+class\s+(\w+)\s+extends\s+(\w+))");
    jsb::internal::StringNames::create();
}

GodotJSScriptLanguageBase::~GodotJSScriptLanguageBase()
{
    jsb::internal::StringNames::free();

    //TODO manage script list in a safer way (access and ref with script.id)
    MutexLock lock(mutex_);
    while (SelfList<GodotJSScriptBase>* script_el = script_list_.first())
    {
        script_el->remove_from_list();
    }
}

void GodotJSScriptLanguageBase::create_environment()
{
    ++prevent_environment_dispose_;
    if (environment_)
        return;
    jsb::Environment::CreateParams params;
    params.initial_class_slots = (int) ClassDB::classes.size() + JSB_MASTER_INITIAL_CLASS_EXTRA_SLOTS;
    params.initial_object_slots = JSB_MASTER_INITIAL_OBJECT_SLOTS;
    params.initial_script_slots = JSB_MASTER_INITIAL_SCRIPT_SLOTS;
    params.deletion_queue_size = JSB_MASTER_VARIANT_DELETION_QUEUE_SIZE - 1;
    params.debugger_port = jsb::internal::Settings::get_debugger_port();
    params.thread_id = Thread::get_caller_id();

    environment_ = std::make_shared<jsb::Environment>(params);
    environment_->init();

    // load internal scripts (jsb.core, jsb.editor.main, jsb.editor.codegen)
    static constexpr char kRuntimeBundleFile[] = "jsb.runtime.bundle.js";
    jsb_ensuref(jsb::AMDModuleLoader::load_source(environment_.get(), kRuntimeBundleFile, GodotJSProjectPreset::get_source_rt) == OK,
        "the embedded '%s' not found, run 'scons' again to refresh all *.gen.cpp sources", kRuntimeBundleFile);
    jsb_ensuref(environment_->load("jsb.inject") == OK, "failed to load jsb.inject");

#ifdef TOOLS_ENABLED
    static constexpr char kEditorBundleFile[] = "jsb.editor.bundle.js";
    jsb_ensuref(jsb::AMDModuleLoader::load_source(environment_.get(), kEditorBundleFile, GodotJSProjectPreset::get_source_ed) == OK,
        "the embedded '%s' not found, run 'scons' again to refresh all *.gen.cpp sources", kEditorBundleFile);
#endif
}

void GodotJSScriptLanguageBase::destroy_environment()
{
    if (!environment_)
        return;
    if (--prevent_environment_dispose_ == 1) {
        environment_->dispose();
        environment_.reset();
    }
}

void GodotJSScriptLanguageBase::init()
{
    if (once_inited_) return;

    JSB_BENCHMARK_SCOPE(GodotJSScriptLanguageBase, init);
    once_inited_ = true;
    JSB_LOG(Verbose, "Runtime: %s", JSB_IMPL_VERSION_STRING);
    JSB_LOG(VeryVerbose, "jsb lang init");

    create_environment();

}

void GodotJSScriptLanguageBase::finish()
{
    jsb_check(once_inited_);
    once_inited_ = false;

    destroy_environment();
#if !JSB_WITH_WEB
    jsb::Worker::finish();
#endif
    JSB_LOG(VeryVerbose, "jsb lang finish");
}

void GodotJSScriptLanguageBase::frame()
{
    const uint64_t base_ticks = Engine::get_singleton()->get_frame_ticks();
    const uint64_t elapsed_milli = (base_ticks - last_ticks_) / 1000ULL; // milliseconds

    last_ticks_ = base_ticks;
    environment_->update(elapsed_milli);
    // environment_->gc();
}

void GodotJSScriptLanguageBase::get_reserved_words(List<String>* p_words) const
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

bool GodotJSScriptLanguageBase::is_control_flow_keyword(ConstStringRefCompat p_keyword) const
{
    static JavaScriptControlFlowKeywords collection;
    return collection.values.has(p_keyword);
}

void GodotJSScriptLanguageBase::get_doc_comment_delimiters(List<String>* p_delimiters) const
{
    p_delimiters->push_back("///");
}

void GodotJSScriptLanguageBase::get_comment_delimiters(List<String>* p_delimiters) const
{
    p_delimiters->push_back("//");
    p_delimiters->push_back("/* */");
}

void GodotJSScriptLanguageBase::get_string_delimiters(List<String>* p_delimiters) const
{
    p_delimiters->push_back("' '");
    p_delimiters->push_back("\" \"");
    p_delimiters->push_back("` `");
}

Script* GodotJSScriptLanguageBase::create_script() const
{
    return create_godotjsscript();
}

bool GodotJSScriptLanguageBase::validate(const String& p_script, const String& p_path, List<String>* r_functions, List<ScriptError>* r_errors, List<Warning>* r_warnings, HashSet<int>* r_safe_lines) const
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

Ref<Script> GodotJSScriptLanguageBase::make_template(const String& p_template, const String& p_class_name, const String& p_base_class_name) const
{
    Ref<GodotJSScriptBase> spt = create_godotjsscript();
    String processed_template = p_template;
    processed_template = processed_template.replace("_BASE_", p_base_class_name)
                                 .replace("_CLASS_SNAKE_CASE_", jsb::internal::VariantUtil::to_snake_case_id(p_class_name))
                                 .replace("_CLASS_", jsb::internal::VariantUtil::to_pascal_case_id(p_class_name))
                                 .replace("_TS_", jsb::internal::Settings::get_indentation());
    spt->set_source_code(processed_template);
    return spt;
}

#if GODOT_4_3_OR_NEWER
void GodotJSScriptLanguageBase::reload_scripts(const Array& p_scripts, bool p_soft_reload)
{
    JSB_LOG(Verbose, "TODO [GodotJSScriptLanguageBase::reload_scripts] NOT IMPLEMENTED");
}

void GodotJSScriptLanguageBase::profiling_set_save_native_calls(bool p_enable)
{
    JSB_LOG(Verbose, "TODO [GodotJSScriptLanguageBase::profiling_set_save_native_calls] NOT IMPLEMENTED");
}
#endif

void GodotJSScriptLanguageBase::reload_all_scripts()
{
    //TODO temporarily ignored because it's only called from `RemoteDebugger`
    JSB_LOG(Verbose, "TODO [GodotJSScriptLanguageBase::reload_all_scripts] temporarily ignored because it's only called from `RemoteDebugger`");
}

void GodotJSScriptLanguageBase::reload_tool_script(const Ref<Script>& p_script, bool p_soft_reload)
{
    //TODO temporarily ignored because it's only called from `ResourceSaver` (we usually write typescripts in vscode)
    JSB_LOG(Verbose, "TODO [GodotJSScriptLanguageBase::reload_tool_script] temporarily ignored because it's only called from `ResourceSaver` (we usually write typescripts in vscode)");
}

String GodotJSScriptLanguageBase::get_global_class_name(const String& p_path, String* r_base_type, String* r_icon_path) const
{
    // GodotJSScript implementation do not really support threaded access for now.
    // So, we can not load the script module in-place because `get_global_class_name` could be called from EditorFileSystem (background) scan.
    // And for simplicity, we use regex to extract the class name from the source code instead of using ANTLR or similar.
    // Please follow the rules of the class name declaration in the source code.
    //     * .ts files: `export default class ClassName extends BaseClassName`
    //     * .js files: `class ClassName extends BaseClassName` and `exports.default = ClassName` (with or without `;`)

    Error err;
    const Ref<FileAccess> file_access = FileAccess::open(p_path, FileAccess::READ, &err);
    if (err)
    {
        return String();
    }

    const String source = file_access->get_as_utf8_string();
    if (jsb::internal::PathUtil::is_recognized_javascript_extension(p_path))
    {
        jsb_check(!js_class_name_matcher1_.is_null());
        const Ref<RegExMatch> match1 = js_class_name_matcher1_->search(source);
        if (match1.is_valid() && match1->get_group_count() == 2)
        {
            const String class_name = match1->get_string(1);
            if (r_base_type) *r_base_type = match1->get_string(2);
            return class_name;
        }

        jsb_check(!js_class_name_matcher2_.is_null());
        const Ref<RegExMatch> match2 = js_class_name_matcher2_->search(source);
        if (match2.is_valid() && match2->get_group_count() == 1)
        {
            const String class_name = match2->get_string(1);
            if (r_base_type)
            {
                const Ref<RegEx> base_matcher = RegEx::create_from_string(jsb::internal::format(R"(\s*class\s*%s\s*extends\s*(\w+)\s*\{?)", class_name));
                const Ref<RegExMatch> base_match = base_matcher->search(source);
                if (base_match.is_valid() && base_match->get_group_count() == 1)
                {
                    *r_base_type = base_match->get_string(1);
                }
            }
            return class_name;
        }
    }
    else
    {
        jsb_check(!ts_class_name_matcher_.is_null());
        const Ref<RegExMatch> match = ts_class_name_matcher_->search(source);
        if (match.is_valid() && match->get_group_count() == 2)
        {
            const String class_name = match->get_string(1);
            if (r_base_type) *r_base_type = match->get_string(2);
            return class_name;
        }
    }
    return {};
}

void GodotJSScriptLanguageBase::scan_external_changes()
{
    environment_->scan_external_changes();

#ifdef TOOLS_ENABLED
    // fix scripts with no .js counterpart found (only missing scripts)
    {
        MutexLock lock(mutex_);
        const SelfList<GodotJSScriptBase>* elem = script_list_.first();
        while (elem)
        {
            elem->self()->load_module_if_missing();
            elem = elem->next();
        }
    }
#endif
}

void GodotJSScriptLanguageBase::thread_enter()
{
#if !JSB_WITH_WEB
    jsb::Worker::on_thread_enter(Thread::get_caller_id());
#endif
}

void GodotJSScriptLanguageBase::thread_exit()
{
#if !JSB_WITH_WEB
    jsb::Worker::on_thread_exit(Thread::get_caller_id());
#endif
}

