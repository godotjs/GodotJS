#include "jsb_script_language.h"

#include <iterator>

#include "jsb_monitor.h"
#include "../jsb_project_preset.h"
#include "../internal/jsb_internal.h"
#include "../bridge/jsb_worker.h"

#include "jsb_script.h"

#ifdef TOOLS_ENABLED
#include "../weaver-editor/templates/templates.gen.h"
#endif

GodotJSScriptLanguage* GodotJSScriptLanguage::singleton_ = nullptr;

namespace jsb
{
    void JSEnvironment::init()
    {
        if (is_shadow_ && !target_)
        {
            target_ = GodotJSScriptLanguage::get_singleton()->create_shadow_environment();
        }
    }

    JSEnvironment::JSEnvironment(const String& p_path_hint, bool p_is_shadow_allowed)
    {
        target_ = jsb::Environment::_access();
        if (target_)
        {
            is_shadow_ = false;
        }
        else
        {
            jsb_ensuref(p_is_shadow_allowed, "no available Environment on thread %d for %s: %s", Thread::get_caller_id(), jsb_typename(GodotJSScript), p_path_hint);
            is_shadow_ = true;
        }
    }

    JSEnvironment::~JSEnvironment()
    {
        if (is_shadow_ && target_)
        {
            GodotJSScriptLanguage::get_singleton()->destroy_shadow_environment(target_);
        }
    }
}

GodotJSScriptLanguage::GodotJSScriptLanguage()
{
    JSB_BENCHMARK_SCOPE(GodotJSScriptLanguage, Construct);
    jsb_check(!singleton_);
    singleton_ = this;
    js_class_name_matcher1_ = RegEx::create_from_string(R"(\s*exports.default\s*=\s*class\s*(\w+)\s+extends\s+(\w+))");
    js_class_name_matcher2_ = RegEx::create_from_string(R"(\s*exports.default\s*=\s*(\w+)\s*;?)");
    ts_class_name_matcher_ = RegEx::create_from_string(R"(\s*(@[tT]ool\s*\(\s*\)\s*\n*\s*)?export\s+default\s+class\s+(\w+)(\s*<)?[^\n]*(?:>|\s+)extends\s+(\w+))");
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
    if (once_inited_) return;

    JSB_BENCHMARK_SCOPE(GodotJSScriptLanguage, init);
    once_inited_ = true;
    JSB_LOG(Verbose, "Runtime: %s", JSB_IMPL_VERSION_STRING);
    JSB_LOG(VeryVerbose, "jsb lang init");

    jsb::Environment::CreateParams params;
    params.initial_class_slots = (int) ClassDB::classes.size() + JSB_MASTER_INITIAL_CLASS_EXTRA_SLOTS;
    params.initial_object_slots = JSB_MASTER_INITIAL_OBJECT_SLOTS;
    params.initial_script_slots = JSB_MASTER_INITIAL_SCRIPT_SLOTS;
    params.debugger_port = jsb::internal::Settings::get_debugger_port();
    params.thread_id = Thread::get_caller_id();

    // main environment
    environment_ = std::make_shared<jsb::Environment>(params);
    environment_->init();

    if (const String entry_script_path = jsb::internal::Settings::get_entry_script_path();
        !entry_script_path.is_empty())
    {
        environment_->load(entry_script_path);
    }

#if JSB_DEBUG
    if (jsb::compat::Performance::get_singleton()) monitor_ = memnew(GodotJSMonitor);
#endif
}

void GodotJSScriptLanguage::finish()
{
    jsb_check(once_inited_);
#if JSB_DEBUG
    if (monitor_) memdelete(monitor_);
#endif
    once_inited_ = false;
    environment_->dispose();
    environment_.reset();
#if !JSB_WITH_WEB && !JSB_WITH_JAVASCRIPTCORE
    jsb::Worker::finish();
#endif
    {
        std::vector<ShadowEnvironment> shadow_environments;
        {
            MutexLock shadow_lock(shadow_mutex_);
            shadow_environments = shadow_environments_;
            shadow_environments_.clear();
        }
        for (const ShadowEnvironment& env : shadow_environments)
        {
            env.holder->dispose();
        }
    }
    JSB_LOG(VeryVerbose, "jsb lang finish");
}

void GodotJSScriptLanguage::frame()
{
    const uint64_t base_ticks = Engine::get_singleton()->get_frame_ticks();
    const uint64_t elapsed_milli = (base_ticks - last_ticks_) / 1000ULL; // milliseconds

    last_ticks_ = base_ticks;
    environment_->update(elapsed_milli);

#if JSB_DEBUG
    {
        MutexLock lock(mutex_);
        if (profile_info_map_.enabled)
        {
            for (auto& class_kv : profile_info_map_.classes)
            {
                for (auto& method_kv : class_kv.value.methods)
                {
                    method_kv.value.last_frame_calls = method_kv.value.frame_calls;
                    method_kv.value.last_frame_time = method_kv.value.frame_time;
                    method_kv.value.frame_calls = 0;
                    method_kv.value.frame_time = 0;
                }
            }
        }
    }
#endif
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

Vector<String> GodotJSScriptLanguage::get_reserved_words() const
{
    return Vector<String> {
        "return", "function", "interface", "class", "let", "break", "as", "any", "switch", "case", "if", "enum",
        "throw", "else", "var", "number", "string", "get", "module", "instanceof", "typeof", "public", "private",
        "while", "void", "null", "super", "this", "new", "in", "await", "async", "extends", "static",
        "package", "implements", "interface", "continue", "yield", "const", "export", "finally", "for",
        "import", "byte", "delete", "goto",
        "default",
    };
}

#if GODOT_4_5_OR_NEWER
Vector<String> GodotJSScriptLanguage::get_doc_comment_delimiters() const
{
    return Vector<String> { "///" };
}

Vector<String> GodotJSScriptLanguage::get_comment_delimiters() const
{
    return Vector<String> { "//", "/* */" };
}

Vector<String> GodotJSScriptLanguage::get_string_delimiters() const
{
    return Vector<String> { "' '", "\" \"", "` `" };
}
#else
void GodotJSScriptLanguage::get_reserved_words(List<String>* p_words) const
{
    for (String keyword : get_reserved_words())
    {
        p_words->push_back(keyword);
    }
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
#endif

//TODO this virtual method seems never used in godot?
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
#if JSB_USE_TYPESCRIPT
    p_extensions->push_back(JSB_TYPESCRIPT_EXT);
#endif
    p_extensions->push_back(JSB_JAVASCRIPT_EXT);
    p_extensions->push_back(JSB_COMMONJS_EXT);
}


#if GODOT_4_4_OR_NEWER
String GodotJSScriptLanguage::get_global_class_name(const String &p_path, String *r_base_type, String *r_icon_path, bool *r_is_abstract, bool *r_is_tool) const
#else
String GodotJSScriptLanguage::get_global_class_name(const String& p_path, String* r_base_type, String* r_icon_path) const
#endif
{
    // GodotJSScript implementation do not really support threaded access for now.
    // So, we can not load the script module in-place because `get_global_class_name` could be called from EditorFileSystem (background) scan.
    // And for simplicity, we use regex to extract the class name from the source code instead of using ANTLR or similar.
    // Please follow the rules of the class name declaration in the source code.
    //     * .ts files: `export default class ClassName extends BaseClassName`
    //     * .js files: `class ClassName extends BaseClassName` and `exports.default = ClassName` (with or without `;`)

    // And, we do not support `r_is_abstract` here, please define all abstract class by not exporting it as `default`.
    // It should be equivalent and enough for TS/JS since we do not rely on GodotJSScript to use abstract classes in TS/JS sources.

    Error err;
    const Ref<FileAccess> file_access = FileAccess::open(p_path, FileAccess::READ, &err);
    if (err)
    {
        return String();
    }

    const String source = file_access->get_as_utf8_string();
    if (jsb::internal::PathUtil::is_recognized_javascript_extension(p_path))
    {
        // check if the class id defined in a single line (export default class ClassName extends BaseClassName)
        jsb_check(!js_class_name_matcher1_.is_null());
        const Ref<RegExMatch> match1 = js_class_name_matcher1_->search(source);
        if (match1.is_valid() && match1->get_group_count() == 2)
        {
            const String class_name = match1->get_string(1);
            if (r_base_type) *r_base_type = match1->get_string(2);
            return class_name;
        }

        // otherwise, it probably defined in separated lines (firstly, check 'class ClassName extends BaseClassName')
        jsb_check(!js_class_name_matcher2_.is_null());
        const Ref<RegExMatch> match2 = js_class_name_matcher2_->search(source);
        if (match2.is_valid() && match2->get_group_count() == 1)
        {
            const String class_name = match2->get_string(1);
            if (r_base_type)
            {
                // then, check 'exports.default = ClassName'
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
        // hope it's a typescript file
        jsb_check(!ts_class_name_matcher_.is_null());

        Ref<RegExMatch> match =  ts_class_name_matcher_->search(source);
        if (match.is_valid() && match->get_group_count() == 4)
        {
#if GODOT_4_4_OR_NEWER
            if (r_is_tool) *r_is_tool = match->get_string(1).size() > 0;
#endif

            const String class_name = match->get_string(2);
            if (r_base_type) *r_base_type = match->get_string(4);
            return class_name;
        }
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

void GodotJSScriptLanguage::thread_enter()
{
#if !JSB_WITH_WEB && !JSB_WITH_JAVASCRIPTCORE
    jsb::Worker::on_thread_enter();
#endif
}

void GodotJSScriptLanguage::thread_exit()
{
#if !JSB_WITH_WEB && !JSB_WITH_JAVASCRIPTCORE
    jsb::Worker::on_thread_exit();
#endif
}

void GodotJSScriptLanguage::profiling_start()
{
#if JSB_DEBUG
    MutexLock lock(mutex_);
    profile_info_map_.enabled = true;
#endif
}

void GodotJSScriptLanguage::profiling_stop()
{
#if JSB_DEBUG
    MutexLock lock(mutex_);
    profile_info_map_.enabled = false;
#endif
}

void GodotJSScriptLanguage::add_script_call_profile_info(const String& p_path, const StringName& p_class, const StringName& p_method, uint64_t p_time)
{
    // we only collect GodotJSScriptInstance function profiling data instead of the deep profiling data from JS runtime.
    // please use Chrome DevTools for deep JS profiling.

#if JSB_DEBUG
    MutexLock lock(mutex_);
    if (!profile_info_map_.enabled) return;

    ScriptClassProfileInfo& prof = profile_info_map_.classes[p_class];
    prof.path = p_path;
    prof.methods[p_method].frame_calls++;
    prof.methods[p_method].frame_time += p_time;
    prof.methods[p_method].total_calls++;
    prof.methods[p_method].total_time += p_time;
#endif
}

bool GodotJSScriptLanguage::is_global_class_generic(const String &p_path) const
{
    Error err;
    const Ref<FileAccess> file_access = FileAccess::open(p_path, FileAccess::READ, &err);
    if (err)
    {
        return false;
    }

    const String source = file_access->get_as_utf8_string();

    if (jsb::internal::PathUtil::is_recognized_javascript_extension(p_path))
    {
        return false;
    }

    jsb_check(!ts_class_name_matcher_.is_null());

    Ref<RegExMatch> match =  ts_class_name_matcher_->search(source);
    return match.is_valid() && match->get_group_count() == 4 && match->get_string(3).length() > 0;
}

namespace
{
    String to_signature(const String& p_path, const StringName& p_class, const StringName& p_method)
    {
        // path :: line :: class :: method
        return jsb_format("%s::0::%s::%s", p_path, p_class, p_method);
    }
}

int GodotJSScriptLanguage::profiling_get_accumulated_data(ProfilingInfo* p_info_arr, int p_info_max)
{
#if JSB_DEBUG
    MutexLock lock(mutex_);
    if (!profile_info_map_.enabled) return 0;

    int current = 0;
    for (const auto& class_kv : profile_info_map_.classes)
    {
        for (const auto& method_kv : class_kv.value.methods)
        {
            if (current >= p_info_max)
            {
                return current;
            }
            p_info_arr[current].signature = to_signature(class_kv.value.path, class_kv.key, method_kv.key);
            p_info_arr[current].self_time = method_kv.value.total_time;
            p_info_arr[current].total_time = method_kv.value.total_time;
            p_info_arr[current].call_count = method_kv.value.total_calls;
            current++;
        }
    }
    return current;
#else
    return 0;
#endif
}

int GodotJSScriptLanguage::profiling_get_frame_data(ProfilingInfo* p_info_arr, int p_info_max)
{
#if JSB_DEBUG
    MutexLock lock(mutex_);
    if (!profile_info_map_.enabled) return 0;

    int current = 0;
    for (const auto& class_kv : profile_info_map_.classes)
    {
        for (const auto& method_kv : class_kv.value.methods)
        {
            if (current >= p_info_max)
            {
                return current;
            }
            p_info_arr[current].signature = to_signature(class_kv.value.path, class_kv.key, method_kv.key);
            p_info_arr[current].self_time = method_kv.value.last_frame_time;
            p_info_arr[current].total_time = method_kv.value.last_frame_time;
            p_info_arr[current].call_count = method_kv.value.last_frame_calls;
            current++;
        }
    }
    return current;
#else
    return 0;
#endif
}

std::shared_ptr<jsb::Environment> GodotJSScriptLanguage::create_shadow_environment()
{
    const Thread::ID caller_id = Thread::get_caller_id();
    {
        MutexLock shadow_lock(shadow_mutex_);

        for (ShadowEnvironment& shadow : shadow_environments_)
        {
            if (shadow.rc == 0 || shadow.thread_id == caller_id)
            {
                shadow.rc++;
                return shadow.holder;
            }
        }
    }

    jsb::Environment::CreateParams params;
    params.initial_class_slots = 128;
    params.initial_object_slots = 512;
    params.initial_script_slots = 32;
    params.type = jsb::Environment::Type::Shadow;
    params.thread_id = Thread::UNASSIGNED_ID;

    std::shared_ptr<jsb::Environment> env = std::make_shared<jsb::Environment>(params);
    JSB_LOG(Log, "creating a shadow Environment on thread %d for %s [env %s]",
        Thread::get_caller_id(),
        jsb_typename(GodotJSScript),
        (uintptr_t) env->id());
    env->init();
    {
        MutexLock shadow_lock(shadow_mutex_);
        shadow_environments_.push_back({caller_id, env, 1});
    }
    return env;
}

void GodotJSScriptLanguage::destroy_shadow_environment(const std::shared_ptr<jsb::Environment>& p_env)
{
    bool found = false;
    bool should_dispose = false;
    {
        MutexLock shadow_lock(shadow_mutex_);
        const size_t num = shadow_environments_.size();
        for (auto it = shadow_environments_.begin();
            it != shadow_environments_.end();
            ++it)
        {
            if (it->holder == p_env)
            {
                found = true;
                if (--it->rc == 0 && num > JSB_MAX_CACHED_SHADOW_ENVIRONMENTS)
                {
                    should_dispose = true;
                    shadow_environments_.erase(it);
                }
                break;
            }
        }
    }
    jsb_checkf(found, "not a registered shadow environment");
    if (should_dispose) p_env->dispose();
}
