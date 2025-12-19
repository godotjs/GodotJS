#include "jsb_script.h"
#include "jsb_script_language.h"
#include "jsb_script_instance.h"
#include "../internal/jsb_path_util.h"

GodotJSScript::GodotJSScript(): script_list_(this)
{
    {
        JSB_BENCHMARK_SCOPE(GodotJSScript, Construct);
        MutexLock lock(GodotJSScriptLanguage::get_singleton()->mutex_);
        GodotJSScriptLanguage::get_singleton()->script_list_.add(&script_list_);
    }
    JSB_LOG(VeryVerbose, "new GodotJSScript addr:%d", (uintptr_t) this);
}

GodotJSScript::~GodotJSScript()
{
    JSB_LOG(VeryVerbose, "delete GodotJSScript addr:%d", (uintptr_t) this);

    {
        JSB_BENCHMARK_SCOPE(GodotJSScript, Destruct);
        MutexLock lock(GodotJSScriptLanguage::get_singleton()->mutex_);

        script_list_.remove_from_list();
    }
}

// GDScript::can_instantiate()
bool GodotJSScript::can_instantiate() const
{
#ifdef TOOLS_ENABLED
    return is_valid() && (is_tool() || ScriptServer::is_scripting_enabled());
#else
    return is_valid();
#endif
}

void GodotJSScript::set_source_code(const String& p_code)
{
    if (source_ == p_code) return;

    source_ = p_code;
#ifdef TOOLS_ENABLED
    source_changed_cache = true;
#endif
}

void GodotJSScript::set_path(const String& p_path, bool p_take_over)
{
    super::set_path(p_path, p_take_over);
}

Ref<Script> GodotJSScript::get_base_script() const
{
    ensure_module_loaded();
    //jsb_notice(loaded_, "script not loaded");

    // return the base script in order to traverse methods/properties from inheritance hierarchy
    return base;
}

StringName GodotJSScript::get_global_name() const
{
    ensure_module_loaded();
    return is_valid() ? script_class_info_.js_class_name : StringName();
}

bool GodotJSScript::inherits_script(const Ref<Script>& p_script) const
{
    jsb_check(loaded_);

    // check if the current script inherits from `p_script`
    //TODO `inherits_script` seems to be called only by Array::assign, it's enough for now without an implementation.
    //TODO iterate the prototype chain, check if the current script inherits from `p_script`

    return false;
}

// this method is called in `EditorStandardSyntaxHighlighter::_update_cache()` without checking `script->is_valid()`
StringName GodotJSScript::get_instance_base_type() const
{
    ensure_module_loaded();
    return is_valid() ? script_class_info_.native_class_name : StringName();
}

ScriptInstance* GodotJSScript::instance_and_native_object_create(const v8::Local<v8::Object>& p_this, bool p_is_temp_allowed)
{
    jsb_check(is_valid());
    jsb_check(loaded_);

    Object* owner = ClassDB::instantiate(script_class_info_.native_class_name);
    ScriptInstance* instance = instance_create(p_this, owner, p_is_temp_allowed);
    if (!instance)
    {
        memdelete(owner);
    }
    return instance;
}

ScriptInstance* GodotJSScript::instance_create(const v8::Local<v8::Object>& p_this, Object* p_owner, bool p_is_temp_allowed)
{
    jsb_check(is_valid());
    jsb_check(loaded_);

    jsb::JSEnvironment env(get_path(), p_is_temp_allowed);
    jsb::JavaScriptModule* module = nullptr;
    const Error err = env->load(script_class_info_.module_id, &module);
    jsb_ensuref(module && err == OK, "JS Module not found: %s", script_class_info_.module_id);
    const jsb::NativeClassID native_class_id = env->get_script_class(module->script_class_id)->native_class_id;

    /* STEP 1, CREATE */
    GodotJSScriptInstance* instance = memnew(GodotJSScriptInstance);

    instance->owner_ = p_owner;
    instance->script_ = Ref(this); // must set before 'set_script_instance'
    instance->env_ = env;
    instance->class_id_ = module->script_class_id;
    instance->owner_->set_script_instance(instance);

    /* STEP 2, INITIALIZE AND CONSTRUCT */
    {
        MutexLock lock(GodotJSScriptLanguage::get_singleton()->mutex_);
        instances_.insert(p_owner);
    }
    instance->object_id_ = env->bind_godot_object(native_class_id, p_owner, p_this);
    if (!instance->object_id_)
    {
        instance->script_ = Ref<GodotJSScript>();
        instance->owner_->set_script_instance(nullptr);
        //NOTE `instance` becomes an invalid pointer since it's deleted in `set_script_instance`
        {
            MutexLock lock(GodotJSScriptLanguage::get_singleton()->mutex_);
            instances_.erase(p_owner);
        }
        JSB_LOG(Error, "Error constructing a GodotJSScriptInstance");
        return nullptr;
    }

    return instance;
}

ScriptInstance* GodotJSScript::instance_construct(Object* p_this, bool p_is_temp_allowed, const Variant** p_args, int p_argcount)
{
    jsb_check(is_valid());
    jsb_check(loaded_);
    JSB_LOG(Verbose, "create instance %d of %s(%s)", (uintptr_t) p_this, script_class_info_.native_class_name, script_class_info_.module_id);

    if (!ClassDB::is_parent_class(p_this->get_class_name(), script_class_info_.native_class_name))
    {
        JSB_LOG(Error, "GodotJS class %s (%s) cannot be instantiated for a %s, it requires a %s", script_class_info_.js_class_name, script_class_info_.module_id, p_this->get_class_name(), script_class_info_.native_class_name);
        return nullptr;
    }

    jsb::JSEnvironment env(get_path(), p_is_temp_allowed);
    if (env.is_shadow())
    {
        GodotJSShadowScriptInstance* shadow_instance = memnew(GodotJSShadowScriptInstance);
        shadow_instance->owner_ = p_this;
        shadow_instance->script_ = Ref(this);

        // ensure `GodotJSScript::instance_has(obj)` works properly even if a shadow instance is used.
        {
            MutexLock lock(GodotJSScriptLanguage::get_singleton()->mutex_);
            instances_.insert(shadow_instance->owner_);
        }
        return shadow_instance;
    }

    jsb::JavaScriptModule* module = nullptr;
    const Error err = env->load(script_class_info_.module_id, &module);
    jsb_ensuref(module && err == OK, "JS Module not found: %s", script_class_info_.module_id);

    /* STEP 1, CREATE */
    GodotJSScriptInstance* instance = memnew(GodotJSScriptInstance);

    instance->owner_ = p_this;
    instance->script_ = Ref(this); // must set before 'set_script_instance'
    instance->env_ = env;
    instance->class_id_ = module->script_class_id;
    instance->owner_->set_script_instance(instance);

    /* STEP 2, INITIALIZE AND CONSTRUCT */
    {
        MutexLock lock(GodotJSScriptLanguage::get_singleton()->mutex_);
        instances_.insert(instance->owner_);
    }

    instance->object_id_ = env->crossbind(p_this, instance->class_id_, p_args, p_argcount);

    if (!instance->object_id_)
    {
        instance->script_ = Ref<GodotJSScript>();
        instance->owner_->set_script_instance(nullptr);
        //NOTE `instance` becomes an invalid pointer since it's deleted in `set_script_instance`
        {
            MutexLock lock(GodotJSScriptLanguage::get_singleton()->mutex_);
            instances_.erase(p_this);
        }
        JSB_LOG(Error, "Error constructing a GodotJSScriptInstance");
        return nullptr;
    }

    instance->postbind();

    return instance;
}

Error GodotJSScript::reload(bool p_keep_state)
{
    if (!loaded_) return OK;
    if (!_is_valid()) return ERR_UNAVAILABLE;

    if (!p_keep_state)
    {
        MutexLock lock(GodotJSScriptLanguage::get_singleton()->mutex_);
        if (instances_.size())
        {
            return ERR_ALREADY_IN_USE;
        }
    }

    if (!p_keep_state)
    {
        //TODO discard the object and crossbind again, but for now we just reload it normally
    }

    // (common situation) preserve the object and change its prototype
    const StringName& module_id = script_class_info_.module_id;
    jsb::JSEnvironment env(get_path(), true);

    //TODO different env has different module state, we need to refresh the state in all envs when marking a module as dirty somewhere
    const jsb::ModuleReloadResult::Type result = env->mark_as_reloading(module_id);
    if (result == jsb::ModuleReloadResult::Requested)
    {
        //TODO `Callable` objects bound with this script should be invalidated somehow?
        // ...

        loaded_ = false;
    }
    else if (result != jsb::ModuleReloadResult::NoChanges)
    {
        JSB_LOG(Warning, "failed to mark module as reloading: %s (%d)", module_id, result);
    }

    return OK;
}

#ifdef TOOLS_ENABLED

static Dictionary _parse_jsdoc_comment(const String& p_comment, bool p_is_class = false) {
    Dictionary result;
    String brief_description;
    String description;
    Array tutorials;
    bool is_deprecated = false;
    bool is_experimental = false;
    String deprecated_msg;
    String experimental_msg;
    bool in_description = false;

    PackedStringArray lines = p_comment.split("\n");
    for (int i = 0; i < lines.size(); i++) {
        String line = lines[i].strip_edges();
        if (line.begins_with("*")) line = line.substr(1).strip_edges();

        if (line.begins_with("@tutorial")) {
            Dictionary tutorial;
            String tutorial_line = line.substr(9).strip_edges();
            
            // Format: @tutorial(Title): URL or @tutorial(Title) or @tutorial URL
            if (tutorial_line.begins_with("(")) {
                int close_paren = tutorial_line.find(")");
                if (close_paren > 1) {
                    tutorial["title"] = tutorial_line.substr(1, close_paren - 1).strip_edges();
                    int colon_pos = tutorial_line.find(":", close_paren);
                    if (colon_pos > close_paren) {
                        tutorial["link"] = tutorial_line.substr(colon_pos + 1).strip_edges();
                    } else {
                        tutorial["link"] = "";
                    }
                } else {
                    tutorial["link"] = tutorial_line;
                }
            } else {
                // Just URL without title
                tutorial["link"] = tutorial_line;
            }
            tutorials.push_back(tutorial);
        } else if (line.begins_with("@deprecated")) {
            is_deprecated = true;
            deprecated_msg = line.substr(11).strip_edges();
        } else if (line.begins_with("@experimental")) {
            is_experimental = true;
            experimental_msg = line.substr(13).strip_edges();
        } else if (!line.begins_with("@")) {
            if (p_is_class) {
                if (line.is_empty()) {
                    if (!brief_description.is_empty() && !in_description) {
                        in_description = true;
                    }
                } else {
                    if (!in_description && brief_description.is_empty()) {
                        brief_description = line;
                    } else if (!in_description) {
                        brief_description += " " + line;
                    } else {
                        if (!description.is_empty()) description += " ";
                        description += line;
                    }
                }
            } else {
                // For members, all text goes into description
                if (!line.is_empty()) {
                    if (!description.is_empty()) description += " ";
                    description += line;
                }
            }
        }
    }

    if (p_is_class && !brief_description.is_empty()) result["brief_description"] = brief_description;
    if (!description.is_empty()) result["description"] = description;
    if (!tutorials.is_empty()) result["tutorials"] = tutorials;
    if (is_deprecated) {
        result["deprecated"] = deprecated_msg;
    }
    if (is_experimental) {
        result["experimental"] = experimental_msg;
    }
    return result;
}

static Dictionary _extract_class_doc(const String& p_source, const String& p_class_name) {
    Dictionary class_dict;
    // Try to find "export default class ClassName" first, then fall back to "class ClassName"
    int class_pos = p_source.find("export default class " + p_class_name);
    if (class_pos == -1) {
        class_pos = p_source.find("class " + p_class_name);
    }
    if (class_pos == -1) return class_dict;

    // Skip backwards past decorators and whitespace to find the comment
    int search_pos = class_pos - 1;
    while (search_pos > 0) {
        // Skip whitespace
        while (search_pos > 0 && (p_source[search_pos] == ' ' || p_source[search_pos] == '\t' || p_source[search_pos] == '\n' || p_source[search_pos] == '\r')) {
            search_pos--;
        }
        
        // Check if we found the end of a comment
        if (search_pos > 0 && p_source[search_pos] == '/' && search_pos > 0 && p_source[search_pos - 1] == '*') {
            int comment_end = search_pos;
            int comment_start = comment_end - 2;
            while (comment_start > 0 && !(p_source[comment_start] == '/' && p_source[comment_start + 1] == '*')) {
                comment_start--;
            }
            if (comment_start >= 0) {
                String comment = p_source.substr(comment_start + 2, comment_end - comment_start - 3);
                class_dict = _parse_jsdoc_comment(comment, true);
            }
            break;
        }
        
        // Check if this is a decorator line (starts with @)
        int line_start = search_pos;
        while (line_start > 0 && p_source[line_start - 1] != '\n' && p_source[line_start - 1] != '\r') {
            line_start--;
        }
        String line = p_source.substr(line_start, search_pos - line_start + 1).strip_edges();
        if (line.begins_with("@")) {
            // Skip this decorator line
            search_pos = line_start - 1;
        } else {
            // Not a decorator or comment, stop searching
            break;
        }
    }
    return class_dict;
}

static bool _try_extract_signal(const String& p_declaration, Dictionary& p_doc, Dictionary& r_signals) {
    RegEx signal_regex;
    signal_regex.compile("@\\w+\\.signal\\(\\)");
    if (!signal_regex.search(p_declaration).is_valid()) return false;
    
    int name_start = p_declaration.find("accessor");
    if (name_start == -1) return false;
    
    name_start += 8;
    while (name_start < p_declaration.length() && (p_declaration[name_start] == ' ' || p_declaration[name_start] == '\t')) {
        name_start++;
    }
    int name_end = name_start;
    while (name_end < p_declaration.length() && p_declaration[name_end] != '!' && p_declaration[name_end] != ':' && p_declaration[name_end] != ' ') {
        name_end++;
    }
    if (name_end > name_start) {
        String signal_name = p_declaration.substr(name_start, name_end - name_start);
        p_doc["name"] = signal_name;
        r_signals[signal_name] = p_doc;
        return true;
    }
    return false;
}

static bool _try_extract_constant(const String& p_declaration, Dictionary& p_doc, Dictionary& r_constants) {
    if (p_declaration.find("=") == -1 || p_declaration.find("{") != -1) return false;
    
    int name_start = 0;
    if (p_declaration.begins_with("static readonly")) {
        name_start = p_declaration.find("readonly") + 8;
    } else if (p_declaration.begins_with("readonly")) {
        name_start = 8;
    }
    
    while (name_start < p_declaration.length() && (p_declaration[name_start] == ' ' || p_declaration[name_start] == '\t')) {
        name_start++;
    }
    int name_end = name_start;
    while (name_end < p_declaration.length() && p_declaration[name_end] != '=' && p_declaration[name_end] != ' ' && p_declaration[name_end] != ':') {
        name_end++;
    }
    if (name_end > name_start) {
        String const_name = p_declaration.substr(name_start, name_end - name_start);
        
        if (const_name.is_empty() || !(const_name[0] >= 'A' && const_name[0] <= 'Z')) return false;
        
        if (r_constants.has(const_name)) return false;
        
        p_doc["name"] = const_name;
        
        int value_start = p_declaration.find("=", name_end);
        if (value_start != -1) {
            value_start++;
            while (value_start < p_declaration.length() && (p_declaration[value_start] == ' ' || p_declaration[value_start] == '\t')) {
                value_start++;
            }
            int value_end = value_start;
            while (value_end < p_declaration.length() && p_declaration[value_end] != ';' && p_declaration[value_end] != '\n') {
                value_end++;
            }
            if (value_end > value_start) {
                p_doc["value"] = p_declaration.substr(value_start, value_end - value_start).strip_edges();
            }
        }
        
        r_constants[const_name] = p_doc;
        return true;
    }
    return false;
}

static void _extract_member_docs(const String& p_source, Dictionary& r_properties, Dictionary& r_methods, Dictionary& r_signals, Dictionary& r_constants, Dictionary& r_enums);

static bool _try_extract_enum(const String& p_declaration, const String& p_source, int p_pos, Dictionary& p_doc, Dictionary& r_enums, Dictionary& r_constants) {
    if (!p_declaration.begins_with("enum ")) return false;
    
    int name_start = 5;
    while (name_start < p_declaration.length() && (p_declaration[name_start] == ' ' || p_declaration[name_start] == '\t')) {
        name_start++;
    }
    int name_end = name_start;
    while (name_end < p_declaration.length() && p_declaration[name_end] != ' ' && p_declaration[name_end] != '{') {
        name_end++;
    }
    if (name_end > name_start) {
        String enum_name = p_declaration.substr(name_start, name_end - name_start);
        r_enums[enum_name] = p_doc;
        
        int body_start = p_source.find("{", p_pos);
        if (body_start != -1) {
            int body_end = p_source.find("}", body_start);
            if (body_end != -1) {
                String enum_body = p_source.substr(body_start + 1, body_end - body_start - 1);
                Dictionary enum_props, enum_methods, enum_signals, enum_constants, enum_enums;
                _extract_member_docs(enum_body, enum_props, enum_methods, enum_signals, enum_constants, enum_enums);
                
                for (const KeyValue<Variant, Variant>& kv : enum_constants) {
                    Dictionary const_doc = kv.value;
                    const_doc["enumeration"] = enum_name;
                    r_constants[kv.key] = const_doc;
                }
            }
        }
        return true;
    }
    return false;
}

static bool _try_extract_property(const String& p_declaration, Dictionary& p_doc, Dictionary& r_properties) {
    if (!(p_declaration.find("accessor") != -1 || (p_declaration.find(":") != -1 && p_declaration.find("(") == -1 && !p_declaration.begins_with("@")))) return false;
    
    int name_start = p_declaration.find("accessor") != -1 ? p_declaration.find("accessor") + 8 : 0;
    while (name_start < p_declaration.length() && (p_declaration[name_start] == ' ' || p_declaration[name_start] == '\t')) {
        name_start++;
    }
    int name_end = name_start;
    while (name_end < p_declaration.length() && p_declaration[name_end] != ':' && p_declaration[name_end] != '!' && p_declaration[name_end] != '=' && p_declaration[name_end] != ' ') {
        name_end++;
    }
    if (name_end > name_start) {
        String prop_name = p_declaration.substr(name_start, name_end - name_start);
        
        if (r_properties.has(prop_name)) return false;
        
        p_doc["name"] = prop_name;
        
        int type_start = p_declaration.find(":", name_end);
        if (type_start != -1) {
            type_start++;
            while (type_start < p_declaration.length() && (p_declaration[type_start] == ' ' || p_declaration[type_start] == '\t')) {
                type_start++;
            }
            int type_end = type_start;
            while (type_end < p_declaration.length() && p_declaration[type_end] != '=' && p_declaration[type_end] != ';' && p_declaration[type_end] != '\n') {
                type_end++;
            }
            if (type_end > type_start) {
                p_doc["type"] = p_declaration.substr(type_start, type_end - type_start).strip_edges();
            }
        }
        
        // Parse default value after =
        int value_start = p_declaration.find("=", name_end);
        if (value_start != -1) {
            value_start++;
            while (value_start < p_declaration.length() && (p_declaration[value_start] == ' ' || p_declaration[value_start] == '\t')) {
                value_start++;
            }
            int value_end = value_start;
            while (value_end < p_declaration.length() && p_declaration[value_end] != ';' && p_declaration[value_end] != '\n') {
                value_end++;
            }
            if (value_end > value_start) {
                p_doc["default_value"] = p_declaration.substr(value_start, value_end - value_start).strip_edges();
            }
        }
        
        r_properties[prop_name] = p_doc;
        return true;
    }
    return false;
}

static bool _try_extract_method(const String& p_declaration, Dictionary& p_doc, Dictionary& r_methods) {
    if (p_declaration.find("(") == -1 || p_declaration.begins_with("@")) return false;
    
    Dictionary method_doc = p_doc;
    String qualifiers;
    String return_type;
    
    if (p_declaration.find("static ") != -1) {
        qualifiers = "static";
    }
    if (p_declaration.find("async ") != -1) {
        if (!qualifiers.is_empty()) qualifiers += " ";
        qualifiers += "async";
    }
    
    int return_start = p_declaration.find("):");
    if (return_start == -1) {
        return_start = p_declaration.find(") =>");
        if (return_start != -1) return_start += 5;
    } else {
        return_start += 3;
    }
    if (return_start != -1) {
        int return_end = return_start;
        while (return_end < p_declaration.length() && p_declaration[return_end] != ' ' && p_declaration[return_end] != '{' && p_declaration[return_end] != ';') {
            return_end++;
        }
        if (return_end > return_start) {
            return_type = p_declaration.substr(return_start, return_end - return_start).strip_edges();
        }
    }
    
    int name_end = p_declaration.find("(");
    int name_start = name_end - 1;
    while (name_start >= 0 && (p_declaration[name_start] == ' ' || p_declaration[name_start] == '\t')) {
        name_start--;
    }
    int name_begin = name_start;
    while (name_begin >= 0 && p_declaration[name_begin] != ' ' && p_declaration[name_begin] != '\t' && p_declaration[name_begin] != '\n') {
        name_begin--;
    }
    name_begin++;
    if (name_begin <= name_start) {
        String method_name = p_declaration.substr(name_begin, name_start - name_begin + 1);
        method_doc["name"] = method_name;
        if (!qualifiers.is_empty()) {
            method_doc["qualifiers"] = qualifiers;
        }
        if (!return_type.is_empty()) {
            method_doc["return_type"] = return_type;
        } else {
            method_doc["return_type"] = "void";
        }
        
        int args_start = p_declaration.find("(") + 1;
        int args_end = p_declaration.find(")");
        if (args_end > args_start) {
            String args_str = p_declaration.substr(args_start, args_end - args_start).strip_edges();
            if (!args_str.is_empty()) {
                Array arguments;
                PackedStringArray params = args_str.split(",");
                for (int i = 0; i < params.size(); i++) {
                    String param = params[i].strip_edges();
                    if (param.is_empty()) continue;
                    
                    Dictionary arg_doc;
                    String arg_name;
                    String arg_type;
                    String default_value;
                    
                    int eq_pos = param.find("=");
                    if (eq_pos != -1) {
                        default_value = param.substr(eq_pos + 1).strip_edges();
                        param = param.substr(0, eq_pos).strip_edges();
                    }
                    
                    int colon_pos = param.find(":");
                    if (colon_pos != -1) {
                        arg_name = param.substr(0, colon_pos).strip_edges();
                        arg_type = param.substr(colon_pos + 1).strip_edges();
                    } else {
                        arg_name = param;
                        arg_type = "any";
                    }
                    
                    if (arg_name.ends_with("?")) {
                        arg_name = arg_name.substr(0, arg_name.length() - 1);
                    }
                    
                    arg_doc["name"] = arg_name;
                    arg_doc["type"] = arg_type;
                    if (!default_value.is_empty()) {
                        arg_doc["default_value"] = default_value;
                    }
                    arguments.push_back(arg_doc);
                }
                if (!arguments.is_empty()) {
                    method_doc["arguments"] = arguments;
                }
            }
        }
        
        r_methods[method_name] = method_doc;
        return true;
    }
    return false;
}

static void _extract_member_docs(const String& p_source, Dictionary& r_properties, Dictionary& r_methods, Dictionary& r_signals, Dictionary& r_constants, Dictionary& r_enums) {
    int pos = 0;
    while (pos < p_source.length()) {
        int comment_start = p_source.find("/**", pos);
        if (comment_start == -1) break;
        int comment_end = p_source.find("*/", comment_start);
        if (comment_end == -1) break;

        String comment = p_source.substr(comment_start + 3, comment_end - comment_start - 3);
        Dictionary doc = _parse_jsdoc_comment(comment, false);

        int next_pos = comment_end + 2;
        while (next_pos < p_source.length() && (p_source[next_pos] == ' ' || p_source[next_pos] == '\t' || p_source[next_pos] == '\n' || p_source[next_pos] == '\r')) {
            next_pos++;
        }

        // Get multiple lines to handle decorators on separate lines
        String remaining = p_source.substr(next_pos, 400);
        PackedStringArray lines = remaining.split("\n");
        
        // Check first line for decorator
        String first_line = lines.size() > 0 ? lines[0].strip_edges() : "";
        String declaration;
        
        // If first line is a decorator, check the next line for the actual declaration
        if (first_line.begins_with("@")) {
            declaration = first_line;
            if (lines.size() > 1) {
                declaration += " " + lines[1].strip_edges();
            }
        } else {
            declaration = first_line;
        }

        if (_try_extract_signal(declaration, doc, r_signals)) {
        } else if (_try_extract_constant(declaration, doc, r_constants)) {
        } else if (_try_extract_enum(declaration, p_source, next_pos, doc, r_enums, r_constants)) {
        } else if (_try_extract_property(declaration, doc, r_properties)) {
        } else if (_try_extract_method(declaration, doc, r_methods)) {
        }

        pos = comment_end + 2;
    }
}

#if GODOT_4_4_OR_NEWER
StringName GodotJSScript::get_doc_class_name() const
{
    Vector<DocData::ClassDoc> docs = get_documentation();
    if (!docs.is_empty()) return docs[0].name;
    return {};
}
#endif

Vector<DocData::ClassDoc> GodotJSScript::get_documentation() const
{
    ensure_module_loaded();
    if (!loaded_ || !_is_valid()) return {};

    String base_type;
    const String class_name = GodotJSScriptLanguage::get_singleton()->get_global_class_name(get_path(), &base_type);
    
    Dictionary class_dict;
    class_dict["name"] = class_name;
    class_dict["inherits"] = base_type.is_empty() ? "Object" : base_type;
    class_dict["is_script_doc"] = true;
    class_dict["script_path"] = get_path();

    const String source = get_source_code();
    if (!source.is_empty()) {
        Dictionary class_doc = _extract_class_doc(source, class_name);
        if (class_doc.has("brief_description")) {
            class_dict["brief_description"] = class_doc["brief_description"];
        }
        if (class_doc.has("description")) {
            class_dict["description"] = class_doc["description"];
        }
        if (class_doc.has("tutorials")) {
            class_dict["tutorials"] = class_doc["tutorials"];
        }
        if (class_doc.has("deprecated")) {
            class_dict["deprecated"] = class_doc["deprecated"];
        }
        if (class_doc.has("experimental")) {
            class_dict["experimental"] = class_doc["experimental"];
        }

        Dictionary properties;
        Dictionary methods;
        Dictionary signals;
        Dictionary constants;
        Dictionary enums;
        _extract_member_docs(source, properties, methods, signals, constants, enums);

        Array properties_array;
        for (const KeyValue<Variant, Variant>& kv : properties) {
            properties_array.push_back(kv.value);
        }
        if (!properties_array.is_empty()) {
            class_dict["properties"] = properties_array;
        }

        Array methods_array;
        for (const KeyValue<Variant, Variant>& kv : methods) {
            methods_array.push_back(kv.value);
        }
        if (!methods_array.is_empty()) {
            class_dict["methods"] = methods_array;
        }

        Array signals_array;
        for (const KeyValue<Variant, Variant>& kv : signals) {
            signals_array.push_back(kv.value);
        }
        if (!signals_array.is_empty()) {
            class_dict["signals"] = signals_array;
        }

        Array constants_array;
        for (const KeyValue<Variant, Variant>& kv : constants) {
            constants_array.push_back(kv.value);
        }
        if (!constants_array.is_empty()) {
            class_dict["constants"] = constants_array;
        }

        if (!enums.is_empty()) {
            class_dict["enums"] = enums;
        }
    }

    DocData::ClassDoc class_doc_data = DocData::ClassDoc::from_dict(class_dict);
    return { class_doc_data };
}

String GodotJSScript::get_class_icon_path() const
{
    ensure_module_loaded();
    jsb_check(loaded_);
    return script_class_info_.icon;
}

PropertyInfo GodotJSScript::get_class_category() const
{
    ensure_module_loaded();
    jsb_check(loaded_);
    return super::get_class_category();
}
#endif // TOOLS_ENABLED

bool GodotJSScript::has_method(const StringName& p_method) const
{
    ensure_module_loaded();
    jsb_check(loaded_);

    String exposed_name = p_method;

    if (exposed_name.begins_with("_"))
    {
        exposed_name = jsb::internal::NamingUtil::get_member_name(exposed_name);
    }

    const GodotJSScript* current = this;
    while (current)
    {
        //TODO temp fix
        if (!current->loaded_) const_cast<GodotJSScript*>(current)->load_module_immediately();
        if (current->is_valid() && current->script_class_info_.methods.has(exposed_name)) return true;
        current = current->base.ptr();
    }

    // ensure `_ready` called even if it's not actually defined in scripts
    if (p_method == SceneStringNames::get_singleton()->_ready)
    {
        // only a `Node` class has `_ready` call
        if (ClassDB::is_parent_class(get_instance_base_type(), jsb_string_name(Node)))
        {
            return true;
        }
    }
    return false;
}

MethodInfo GodotJSScript::get_method_info(const StringName& p_method) const
{
    jsb_check(loaded_);
    jsb_check(has_method(p_method));
    //TODO details?
    MethodInfo item = {};
    item.name = p_method;
    return item;
}

ScriptLanguage* GodotJSScript::get_language() const
{
    return GodotJSScriptLanguage::get_singleton();
}

bool GodotJSScript::has_script_signal(const StringName& p_signal) const
{
    return is_valid() ? script_class_info_.signals.has(p_signal) : false;
}

void GodotJSScript::get_script_signal_list(List<MethodInfo>* r_signals) const
{
    if (!is_valid()) return;

    for (const auto& it : script_class_info_.signals)
    {
        //TODO details?
        MethodInfo item = {};
        item.name = it.key;
        r_signals->push_back(item);
    }

    if (base.is_valid())
    {
        base->get_script_signal_list(r_signals);
    }
}

void GodotJSScript::get_script_method_list(List<MethodInfo>* p_list) const
{
    ensure_module_loaded();
    jsb_check(loaded_);

    for (const auto& it : script_class_info_.methods)
    {
        //TODO details?
        MethodInfo item = {};
        item.name = it.key;
        p_list->push_back(item);
    }

    if (base.is_valid() && base->is_valid())
    {
        base->get_script_method_list(p_list);
    }
}

void GodotJSScript::get_script_property_list(List<PropertyInfo>* p_list) const
{
    ensure_module_loaded();
    jsb_check(loaded_);

#ifdef TOOLS_ENABLED
    p_list->push_back(get_class_category());
#endif
    for (const auto& it : script_class_info_.properties)
    {
        p_list->push_back((PropertyInfo) it.value);
    }

    if (base.is_valid() && base->is_valid())
    {
        base->get_script_property_list(p_list);
    }
}

bool GodotJSScript::get_property_default_value(const StringName& p_property, Variant& r_value) const
{
    ensure_module_loaded();
    if (const HashMap<StringName, Variant>::ConstIterator it = member_default_values_cache.find(p_property))
    {
        r_value = it->value;
        return true;
    }

    return base.is_valid() && base->is_valid()
        ? base->get_property_default_value(p_property, r_value)
        : false;
}

#if GODOT_4_5_OR_NEWER
const Variant GodotJSScript::get_rpc_config() const
#elif GODOT_4_4_OR_NEWER
Variant GodotJSScript::get_rpc_config() const
#else
const Variant GodotJSScript::get_rpc_config() const
#endif
{
    ensure_module_loaded();
    jsb_check(loaded_);

    return script_class_info_.rpc_config;
}

bool GodotJSScript::has_static_method(const StringName& p_method) const
{
    ensure_module_loaded();
    jsb_check(loaded_);
    //TODO
    return false;
}

bool GodotJSScript::instance_has(const Object* p_this) const
{
    jsb_check(loaded_);
    MutexLock lock(GodotJSScriptLanguage::get_singleton()->mutex_);
    return instances_.has(const_cast<Object*>(p_this));
}

Error GodotJSScript::load_source_code(const String &p_path)
{
    Error err;
#ifdef TOOLS_ENABLED
	const String source_code = FileAccess::get_file_as_string(p_path, &err);
#else

#if JSB_USE_TYPESCRIPT
	const String path = jsb::internal::PathUtil::convert_typescript_path(p_path);
	const String source_code = FileAccess::get_file_as_string(path, &err);
#else
	const String path = jsb::internal::PathUtil::convert_javascript_path(p_path);
	const String source_code = FileAccess::get_file_as_string(path, &err);
#endif

#endif
    if (err != OK)
    {
        JSB_LOG(Warning, "can not read source from %s", p_path);
    }
    else
    {
        set_source_code(source_code);
    }
    return err;
}

void GodotJSScript::load_module_if_missing()
{
    if (!loaded_ || _is_valid()) return;

    JSB_LOG(Verbose, "force to load missing script %s", get_path());
    loaded_ = false;
    load_module_immediately();
}

void GodotJSScript::load_module_immediately()
{
    if (loaded_) return;
    JSB_BENCHMARK_SCOPE(GodotJSScript, load_module);

    const String path = jsb::internal::PathUtil::convert_typescript_path(get_path());
    jsb::JSEnvironment env(get_path(), true);

    loaded_ = true;
    base.unref();
    source_changed_cache = true;
    jsb::JavaScriptModule* module;
    if (const Error err = env->load(path, &module); err != OK)
    {
        script_class_info_ = {};
#ifdef TOOLS_ENABLED
        if (FileAccess::exists(get_path()) && !FileAccess::exists(path))
        {
            JSB_LOG(Error,
                "the javascript file is missing: %s (source: %s), "
                "please ensure that all typescript source files have already been compiled "
                "using the typescript compiler ('tsc').",
                path, get_path());
            return;
        }
#endif
        JSB_LOG(Error, "failed to attach module %s (%d)", path, err);
        return;
    }
    jsb_check(module);
    {
        const jsb::ScriptClassInfoPtr class_info_ptr = env->find_script_class(module->script_class_id);
        script_class_info_ = class_info_ptr ? (jsb::StatelessScriptClassInfo) *class_info_ptr : jsb::StatelessScriptClassInfo();
    }
    if (_is_valid())
    {
        JSB_LOG(VeryVerbose, "GodotJSScript module loaded %s", path);
        {
            //TODO a dirty but approaching solution for hot-reloading
            //TODO will crash if reloading script instances in worker threads
            MutexLock lock(GodotJSScriptLanguage::get_singleton()->mutex_); // necessary?
            for (RBSet<Object *>::Element *E = instances_.front(); E;)
            {
                RBSet<Object *>::Element *N = E->next();
                Object* obj = E->get();
                jsb_check(obj->get_script() == Ref(this));
                jsb_check(env->verify_object(obj));

                if (ClassDB::is_parent_class(env->get_script_class(module->script_class_id)->native_class_name, obj->get_class_name()))
                {
                    env->rebind(obj, module->script_class_id);
                }
                else
                {
                    JSB_LOG(Warning, "Cannot rebind class %s (%s) on %s, it requires a %s", script_class_info_.js_class_name, script_class_info_.module_id, obj->get_class_name(), env->get_script_class(module->script_class_id)->native_class_name);
                    obj->set_script(Ref<Script>());
                }

                E = N;
            }
        }

        // setup base script
        {
            //TODO do not rely on ResourceLoader
            if (script_class_info_.base_script_module_id)
            {
                jsb::JavaScriptModule* base_module = nullptr;
                const Error err = env->load(script_class_info_.base_script_module_id, &base_module);
                jsb_ensuref(base_module && err == OK, "JS Module not found: %s", script_class_info_.base_script_module_id);
                const Ref<Resource> base_res = ResourceLoader::load(jsb::internal::PathUtil::convert_javascript_path(base_module->source_info.source_filepath));
                jsb_check(base_res->get_class() == jsb_typename(GodotJSScript));
                base = base_res;
            }
        }

        // update the default value cache
        update_exports();
#ifdef TOOLS_ENABLED
        // temp and tricky workaround to avoid missing doc when showing on inspector the first time after load
        if (DocTools* doc_tools = EditorHelp::get_doc_data())
        {
            const Vector<DocData::ClassDoc> documentations = get_documentation();
            for (int i = 0; i < documentations.size(); i++)
            {
                const DocData::ClassDoc& doc = documentations.get(i);
                doc_tools->add_doc(doc);
            }
        }
#endif
        return;
    }
    JSB_LOG(Debug, "a stub script loaded which does not contain a GodotJS class %s", path);
}

PlaceHolderScriptInstance* GodotJSScript::placeholder_instance_create(Object* p_this)
{
#ifdef TOOLS_ENABLED
    if (!is_valid())
    {
        JSB_LOG(Warning, "creating placeholder instance on invalid script (%s)", get_path());
    }
    PlaceHolderScriptInstance *si = memnew(PlaceHolderScriptInstance(GodotJSScriptLanguage::get_singleton(), Ref<Script>(this), p_this));
    placeholders.insert(si);
    _update_exports(si);
    return si;
#else
    return nullptr;
#endif
}

#ifdef TOOLS_ENABLED
void GodotJSScript::_placeholder_erased(PlaceHolderScriptInstance* p_placeholder)
{
    placeholders.erase(p_placeholder);
}
#endif

void GodotJSScript::update_exports()
{
    ensure_module_loaded();
    jsb_check(loaded_);
#ifdef TOOLS_ENABLED
    if (!is_valid()) return;
    _update_exports(nullptr);
#endif
}

void GodotJSScript::_update_exports_values(List<PropertyInfo>& r_props, HashMap<StringName, Variant>& r_values)
{
    for (const KeyValue<StringName, Variant> &E : member_default_values_cache)
    {
        r_values[E.key] = E.value;
    }

#ifdef TOOLS_ENABLED
    r_props.push_back(get_class_category());
#endif
    for (const PropertyInfo &E : members_cache)
    {
        r_props.push_back(E);
    }

    if (base.is_valid() && base->is_valid())
    {
        base->_update_exports_values(r_props, r_values);
    }
}

Variant GodotJSScript::_new(const Variant** p_args, int p_argcount, Callable::CallError &r_error)
{
    if (!is_valid())
    {
        JSB_LOG(Error, "Unable to create new instance. The script was not properly loaded (%s)", get_path());
        return Variant();
    }

    r_error.error = Callable::CallError::CALL_OK;
    Object *owner = ClassDB::instantiate(script_class_info_.native_class_name);

    ScriptInstance *instance = instance_construct(owner, false, p_args, p_argcount);

    if (!instance)
    {
        memdelete(owner);
        return Variant();
    }

    return owner;
}

bool GodotJSScript::_update_exports(PlaceHolderScriptInstance* p_instance_to_update)
{
    // do not crash the engine if the script not loaded successfully
    if (!is_valid())
    {
        JSB_LOG(Error, "script failed to load (%s)", get_path());
        return false;
    }

    bool changed = false;

    if (source_changed_cache)
    {
        source_changed_cache = false;
        changed = true;

        members_cache.clear();
        member_default_values_cache.clear();

        jsb::JSEnvironment env(get_path(), true);
        env->check_internal_state();

        jsb::JavaScriptModule* module = nullptr;
        const Error err = env->load(script_class_info_.module_id, &module);
        jsb_ensuref(module && err == OK, "JS Module not found: %s", script_class_info_.module_id);

        if (const jsb::ScriptClassInfoPtr class_info = env->find_script_class(module->script_class_id))
        {
            for (const KeyValue<StringName, jsb::ScriptPropertyInfo> &pair : script_class_info_.properties)
            {
                const jsb::ScriptPropertyInfo &pi = pair.value;
                members_cache.push_back((PropertyInfo) pi);
                // values[pair.key] = jsb_ext_type_convert({}, pi.type);

                //TODO maybe this behaviour is not expected
                Variant default_value;
                env->get_default_property_value(*class_info, pi.name, default_value);
                member_default_values_cache[pi.name] = default_value;
                JSB_LOG(VeryVerbose, "GodotJS script default %s.%s = %s",
                    _is_valid() ? script_class_info_.js_class_name : "(unknown)",
                    pi.name,
                    default_value);
            }
        }
        else
        {
            JSB_LOG(Warning, "ScriptClassInfo is invalid, fallback to empty default values (script %s)", get_path());
            for (const KeyValue<StringName, jsb::ScriptPropertyInfo> &pair : script_class_info_.properties)
            {
                const jsb::ScriptPropertyInfo &pi = pair.value;
                members_cache.push_back({ pi.type, pi.name, pi.hint, pi.hint_string, pi.usage, pi.class_name });

                Variant default_value;
                jsb::internal::VariantUtil::construct_variant(default_value, pi.type);
                member_default_values_cache[pi.name] = default_value;
            }
        }
    }

    if (base.is_valid() && base->_update_exports(p_instance_to_update))
    {
        changed = true;
    }

    if ((changed || p_instance_to_update) && placeholders.size())
    {
        List<PropertyInfo> props;
        HashMap<StringName, Variant> values;
        _update_exports_values(props, values);

        if (changed)
        {
            for (PlaceHolderScriptInstance *s : placeholders)
            {
                s->update(props, values);
            }
        }
        else
        {
            p_instance_to_update->update(props, values);
        }
    }

    return changed;
}

void GodotJSScript::_bind_methods() {
    ClassDB::bind_vararg_method(METHOD_FLAGS_DEFAULT, "new", &GodotJSScript::_new, MethodInfo("new"));
}

void GodotJSScript::reload_from_file()
{
    //TODO reload, maybe it's OK?
    reload(true);
}
