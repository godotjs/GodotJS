#ifndef GODOTJS_SCRIPT_LANGUAGE_H
#define GODOTJS_SCRIPT_LANGUAGE_H

#include "../bridge/jsb_bridge.h"
#include "../compat/jsb_compat.h"

class GodotJSScript;
class GodotJSMonitor;

namespace jsb
{
    struct JSEnvironment
    {
    private:
        bool is_shadow_;
        std::shared_ptr<jsb::Environment> target_;

        void init();

    public:
        // p_path_hint is only used for logging
        JSEnvironment(const String& p_path_hint, bool p_is_shadow_allowed);

        ~JSEnvironment();

        JSEnvironment(const JSEnvironment&) = delete;
        JSEnvironment& operator=(const JSEnvironment&) = delete;

        JSEnvironment(JSEnvironment&& p_other) noexcept
        {
            is_shadow_ = p_other.is_shadow_;
            target_ = std::move(p_other.target_);
        }
        JSEnvironment& operator=(JSEnvironment&& p_other) noexcept
        {
            if (this != &p_other)
            {
                is_shadow_ = p_other.is_shadow_;
                target_ = std::move(p_other.target_);
            }
            return *this;
        }

        jsb_no_discard bool is_shadow() const { return is_shadow_; }

        jsb::Environment* operator->() { init(); return target_.get(); }

        operator std::shared_ptr<jsb::Environment>() { init(); return target_; }
    };
}

class GodotJSScriptLanguage : public ScriptLanguage
{
private:
    friend class GodotJSScript;
    friend class GodotJSScriptInstance;
    friend class GodotJSScriptInstanceBase;
    friend class ResourceFormatLoaderGodotJSScript;
    friend struct jsb::JSEnvironment;

    struct ShadowEnvironment
    {
        Thread::ID thread_id = Thread::UNASSIGNED_ID;
        std::shared_ptr<jsb::Environment> holder;
        int rc = 0;
    };

#if JSB_DEBUG
    struct ScriptCallProfileInfo
    {
        uint64_t total_time = 0;
        uint64_t total_calls = 0;
        uint64_t frame_time = 0;
        uint64_t frame_calls = 0;
        uint64_t last_frame_time = 0;
        uint64_t last_frame_calls = 0;
    };

    struct ScriptClassProfileInfo
    {
        String path;
        HashMap<StringName, ScriptCallProfileInfo> methods;
    };

    struct ScriptCallProfileInfoMap
    {
        bool enabled = false;
        HashMap<StringName, ScriptClassProfileInfo> classes;
    };
#endif

    static GodotJSScriptLanguage* singleton_;

    Mutex mutex_;
    SelfList<GodotJSScript>::List script_list_;

    bool once_inited_ = false;
    uint64_t last_ticks_ = 0;
    std::shared_ptr<jsb::Environment> environment_;

    Mutex shadow_mutex_;
    std::vector<ShadowEnvironment> shadow_environments_;

#if JSB_DEBUG
    GodotJSMonitor* monitor_ = nullptr;
    ScriptCallProfileInfoMap profile_info_map_;
#endif

    Ref<RegEx> ts_class_name_matcher_;

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

    void add_script_call_profile_info(const String& p_path, const StringName& p_class, const StringName& p_method, uint64_t p_time);

    bool is_global_class_generic(const String &p_path) const;

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

#if GODOT_4_5_OR_NEWER
    virtual Vector<String> get_reserved_words() const override;

    virtual Vector<String> get_doc_comment_delimiters() const override;
    virtual Vector<String> get_comment_delimiters() const override;
    virtual Vector<String> get_string_delimiters() const override;
#else
    virtual Vector<String> get_reserved_words() const;

    virtual void get_reserved_words(List<String>* p_words) const override;
    virtual void get_doc_comment_delimiters(List<String>* p_delimiters) const override;
    virtual void get_comment_delimiters(List<String>* p_delimiters) const override;
    virtual void get_string_delimiters(List<String>* p_delimiters) const override;
#endif

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

    virtual void profiling_start() override;
    virtual void profiling_stop() override;

    virtual int profiling_get_accumulated_data(ProfilingInfo* p_info_arr, int p_info_max) override;
    virtual int profiling_get_frame_data(ProfilingInfo* p_info_arr, int p_info_max) override;

    virtual bool handles_global_class_type(const String& p_type) const override;

#if GODOT_4_4_OR_NEWER
    virtual String get_global_class_name(const String &p_path, String *r_base_type = nullptr, String *r_icon_path = nullptr, bool *r_is_abstract = nullptr, bool *r_is_tool = nullptr) const override;
#else
    virtual String get_global_class_name(const String& p_path, String* r_base_type = nullptr, String* r_icon_path = nullptr) const override;
#endif

#pragma endregion

private:
    std::shared_ptr<jsb::Environment> create_shadow_environment();
    void destroy_shadow_environment(const std::shared_ptr<jsb::Environment>& p_env);
};

#endif
