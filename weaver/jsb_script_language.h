#ifndef GODOTJS_SCRIPT_LANGUAGE_H
#define GODOTJS_SCRIPT_LANGUAGE_H

#include "../bridge/jsb_bridge.h"

#include "core/object/script_language.h"

class GodotJSScript;
class GodotJSMonitor;

class GodotJSScriptLanguage : public ScriptLanguage
{
private:
    friend class GodotJSScript;
    friend class GodotJSScriptInstance;
    friend class ResourceFormatLoaderGodotJSScript;

    static GodotJSScriptLanguage* singleton_;

    Mutex mutex_;
    SelfList<GodotJSScript>::List script_list_;

    bool once_inited_ = false;
    uint64_t last_ticks_ = 0;
    std::shared_ptr<jsb::Environment> environment_;

#if JSB_DEBUG
    GodotJSMonitor* monitor_;
#endif

    // [TS] matches 'export default class ClassName extends BaseName {'
    Ref<RegEx> ts_class_name_matcher_;
    Ref<RegEx> ts_class_name_tool_matcher_;

    // [JS] export & declare in two lines, matches 'class ClassName extends BaseName' + 'exports.default = ClassName'
    Ref<RegEx> js_class_name_matcher2_;

    // [JS] export & declare in a single line, matches 'exports.default = class ClassName extends BaseName'
    Ref<RegEx> js_class_name_matcher1_;

public:
    jsb_force_inline static GodotJSScriptLanguage* get_singleton() { return singleton_; }

    /**
     * @brief Get the main JS environment.
     * @note Can only be call from the main thread.
     * @return The JS environment.
     */
    jsb_force_inline std::shared_ptr<jsb::Environment> get_environment() const
    {
        jsb_check(once_inited_ && environment_ && Thread::is_main_thread());
        return environment_;
    }

    void scan_external_changes();

    template<size_t N>
    jsb::JSValueMove eval_source(const char (&p_code)[N], Error& r_err)
    {
        return environment_->eval_source(p_code, (int) N - 1, "eval", r_err);
    }

    jsb::JSValueMove eval_source(const String& p_code, Error& r_err)
    {
        const CharString str = p_code.utf8();
        return environment_->eval_source(str.get_data(), str.length(), "eval", r_err);
    }

    GodotJSScriptLanguage();
    virtual ~GodotJSScriptLanguage() override;

    virtual void init() override;
    virtual void finish() override;
    virtual void frame() override;

    virtual void thread_enter() override;
    virtual void thread_exit() override;

    virtual bool is_control_flow_keyword(ConstStringRefCompat p_keyword) const override;
    virtual Vector<ScriptTemplate> get_built_in_templates(ConstStringNameRefCompat p_object) override;

    virtual void get_reserved_words(List<String>* p_words) const override;
    virtual void get_doc_comment_delimiters(List<String>* p_delimiters) const override;
    virtual void get_comment_delimiters(List<String>* p_delimiters) const override;
    virtual void get_string_delimiters(List<String>* p_delimiters) const override;
    virtual Script* create_script() const override;
    virtual bool validate(const String& p_script, const String& p_path = "", List<String>* r_functions = nullptr, List<ScriptError>* r_errors = nullptr, List<Warning>* r_warnings = nullptr, HashSet<int>* r_safe_lines = nullptr) const override;
    virtual Ref<Script> make_template(const String& p_template, const String& p_class_name, const String& p_base_class_name) const override;
    virtual void reload_all_scripts() override;
    virtual void get_recognized_extensions(List<String>* p_extensions) const override;

    virtual bool supports_documentation() const override { return true; }

#if GODOT_4_3_OR_NEWER
    virtual void reload_scripts(const Array& p_scripts, bool p_soft_reload) override;
    virtual void profiling_set_save_native_calls(bool p_enable) override;
#endif

#pragma region DEFAULTLY AND PARTIALLY SUPPORTED
    virtual String get_name() const override;
    virtual String get_type() const override;

#if JSB_USE_TYPESCRIPT
    virtual String get_extension() const override { return JSB_TYPESCRIPT_EXT; }
#else
    virtual String get_extension() const override { return JSB_JAVASCRIPT_EXT; }
#endif

    virtual bool is_using_templates() override { return true; }
#ifndef DISABLE_DEPRECATED
    virtual bool has_named_classes() const override { return false; }
#endif // DISABLE_DEPRECATED
    virtual bool supports_builtin_mode() const override { return false; }

    virtual int find_function(const String& p_function, const String& p_code) const override { return -1; }
    virtual String make_function(const String& p_class, const String& p_name, const PackedStringArray& p_args) const override { return ""; }

    virtual void auto_indent_code(String& p_code, int p_from_line, int p_to_line) const override
    {
    }
    virtual void add_global_constant(const StringName& p_variable, const Variant& p_value) override
    {
    }

    virtual String debug_get_error() const override { return ""; }
    virtual int debug_get_stack_level_count() const override { return 1; }
    virtual int debug_get_stack_level_line(int p_level) const override { return 1; }
    virtual String debug_get_stack_level_function(int p_level) const override { return ""; }
    virtual String debug_get_stack_level_source(int p_level) const override { return ""; }
    virtual void debug_get_stack_level_locals(int p_level, List<String>* p_locals, List<Variant>* p_values, int p_max_subitems, int p_max_depth) override
    {
    }
    virtual void debug_get_stack_level_members(int p_level, List<String>* p_members, List<Variant>* p_values, int p_max_subitems, int p_max_depth) override
    {
    }
    virtual void debug_get_globals(List<String>* p_locals, List<Variant>* p_values, int p_max_subitems, int p_max_depth) override
    {
    }
    virtual String debug_parse_stack_level_expression(int p_level, const String& p_expression, int p_max_subitems, int p_max_depth) override { return ""; }
    virtual Vector<StackInfo> debug_get_current_stack_info() override { return {}; }
    virtual void reload_tool_script(const Ref<Script>& p_script, bool p_soft_reload) override;

    virtual void get_public_functions(List<MethodInfo>* p_functions) const override
    {
    }
    virtual void get_public_constants(List<Pair<String, Variant>>* p_constants) const override
    {
    }
    virtual void get_public_annotations(List<MethodInfo>* p_annotations) const override
    {
    }

    virtual void profiling_start() override
    {
    }
    virtual void profiling_stop() override
    {
    }

    virtual int profiling_get_accumulated_data(ProfilingInfo* p_info_arr, int p_info_max) override { return 0; }
    virtual int profiling_get_frame_data(ProfilingInfo* p_info_arr, int p_info_max) override { return 0; }

    virtual bool handles_global_class_type(const String& p_type) const override;

#if GODOT_4_4_OR_NEWER
    virtual String get_global_class_name(const String &p_path, String *r_base_type = nullptr, String *r_icon_path = nullptr, bool *r_is_abstract = nullptr, bool *r_is_tool = nullptr) const override;
#else
    virtual String get_global_class_name(const String& p_path, String* r_base_type = nullptr, String* r_icon_path = nullptr) const override;
#endif

#pragma endregion

};

#endif
