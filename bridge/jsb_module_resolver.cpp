#include "jsb_module_resolver.h"
#include "jsb_environment.h"

#include "../internal/jsb_path_util.h"

namespace jsb
{
    namespace
    {
        // the cost of copy return is acceptable since Vector copy constructor is by-reference under the hood 
        PackedStringArray get_dynamic_search_paths()
        {
#ifdef TOOLS_ENABLED
            return jsb::internal::Settings::get_additional_search_paths();
#else
            static PackedStringArray dynamic_search_paths = jsb::internal::Settings::get_additional_search_paths();
            return dynamic_search_paths;
#endif
        }
    }
    
    bool IModuleResolver::load_as_json(Environment* p_env, JavaScriptModule& p_module, const String& p_asset_path, const Vector<uint8_t>& p_bytes, size_t p_len)
    {
        v8::Isolate* isolate = p_env->get_isolate();
        const v8::Local<v8::Context> context = isolate->GetCurrentContext();
        const v8::Local<v8::Object> module_obj = p_module.module.Get(isolate);
        const String& filename = p_asset_path;
        const String dirname = internal::PathUtil::dirname(filename);

        module_obj->Set(context, jsb_name(p_env, filename), impl::Helper::new_string(isolate, filename)).Check();
        module_obj->Set(context, jsb_name(p_env, path), impl::Helper::new_string(isolate, dirname)).Check();

        v8::Local<v8::Value> updated_exports;
        if (const v8::MaybeLocal<v8::Value> rval = impl::Helper::parse_json(isolate, context, p_bytes.ptr(), p_len); rval.ToLocal(&updated_exports))
        {
            p_module.exports.Reset(isolate, updated_exports);
            return true;
        }
        return false;
    }

    bool IModuleResolver::load_from_evaluator(Environment* p_env, JavaScriptModule& p_module, const String& p_asset_path, const v8::Local<v8::Function>& p_elevator)
    {
        v8::Isolate* isolate = p_env->get_isolate();
        const v8::Local<v8::Context> context = isolate->GetCurrentContext();

        // use resource path here (begins with `res://`)
        // to make path identification easier during exporting
        // (see `GodotJSExportPlugin::export_compiled_script`)
        const String& filename = p_asset_path;
        const String dirname = internal::PathUtil::dirname(filename);
        const v8::Local<v8::Object> module_obj = p_module.module.Get(isolate);

        static constexpr int kIndexExports = 0;
        static constexpr int kIndexFileName = 3;
        static constexpr int kIndexPath = 4;
        v8::Local<v8::Value> argv[] = {
            /* 0: exports  */ p_module.exports.Get(isolate),
            /* 1: require  */ p_env->_new_require_func(p_module.id),
            /* 2: module   */ module_obj,
            /* 3: filename */ impl::Helper::new_string(isolate, filename),
            /* 4: dirname  */ impl::Helper::new_string(isolate, dirname),
        };

        // init module properties (filename, path)
        module_obj->Set(context, jsb_name(p_env, filename), argv[kIndexFileName]).Check();
        module_obj->Set(context, jsb_name(p_env, path), argv[kIndexPath]).Check();

        //TODO set `require.cache`
        // ...

        if (const v8::MaybeLocal<v8::Value> result = p_elevator->Call(context, v8::Undefined(isolate), ::std::size(argv), argv);
            result.IsEmpty())
        {
            // failed, usually means error thrown
            return false;
        }

        // update `exports`, because its value may be covered during the execution process of the elevator script.
        const v8::Local<v8::Value> updated_exports = module_obj->Get(context, jsb_name(p_env, exports)).ToLocalChecked();
        jsb_unused(kIndexExports);
        // jsb_notice(updated_exports == argv[kIndexExports], "`exports` is overwritten in module: %s", filename);

        p_module.exports.Reset(isolate, updated_exports);
        return true;
    }

    size_t DefaultModuleResolver::read_all_bytes_with_shebang(const internal::ISourceReader& p_reader, Vector<uint8_t>& o_bytes)
    {
        static constexpr char header[] = "(function(exports,require,module,__filename,__dirname){";
        static constexpr char footer[] = "\n})";

        jsb_check(!p_reader.is_null());
        const size_t file_len = p_reader.get_length();
        jsb_check(file_len);
        o_bytes.resize((int) (
            file_len +
            ::std::size(header) + ::std::size(footer) - 2
            + 1 // zero_terminated anyway
        ));

        memcpy(o_bytes.ptrw(), header, ::std::size(header) - 1);
        p_reader.get_buffer(o_bytes.ptrw() + ::std::size(header) - 1, file_len);
        memcpy(o_bytes.ptrw() + file_len + ::std::size(header) - 1, footer, ::std::size(footer)); // include the ending zero
        return o_bytes.size() - 1;
    }

    //NOTE !!! we use FileAccess::exists instead of access->file_exists because access->file_exists does not consider files from packages (res://)
    bool DefaultModuleResolver::check_implicit_source_path(const String& p_module_id, String& o_path)
    {
        // try .js
        const String js_path = internal::PathUtil::extends_with(p_module_id, "." JSB_JAVASCRIPT_EXT);
        if (FileAccess::exists(js_path))
        {
            o_path = js_path;
            return true;
        }

        // try .cjs
        const String cjs_path = internal::PathUtil::extends_with(p_module_id, "." JSB_COMMONJS_EXT);
        if (FileAccess::exists(cjs_path))
        {
            o_path = cjs_path;
            return true;
        }

        // try .json
        const String json_path = internal::PathUtil::extends_with(p_module_id, "." JSB_JSON_EXT);
        if (FileAccess::exists(json_path))
        {
            o_path = json_path;
            return true;
        }

        return false;
    }

    String DefaultModuleResolver::resolve_package_export_value(const Variant& p_value, const String& p_condition, const String& p_subpath, bool p_wildcard)
    {
        switch (p_value.get_type())
        {
            case Variant::STRING:
            {
                const String resolved_value = p_value;

                if (!resolved_value.begins_with("./"))
                {
                    // Not a file path. It's protocol based resolution which is unsupported (not seen in practice).
                    JSB_LOG(VeryVerbose, "Unable to resolve package.json export: %s", p_value);
                    return String();
                }

                return p_wildcard
                    ? resolved_value.replace("*", p_subpath)
                    : resolved_value + p_subpath;
            }

            case Variant::DICTIONARY:
            {
                const Dictionary condition_dict = p_value;

                if (!p_condition.is_empty() && condition_dict.has(p_condition))
                {
                    const Variant& condition_target = condition_dict[p_condition];
                    const String resolved_path = resolve_package_export_value(condition_target, p_condition, p_subpath, p_wildcard);

                    if (!resolved_path.is_empty())
                    {
                        return resolved_path;
                    }

                    if (condition_target.get_type() == Variant::NIL)
                    {
                        // Further resolution explicitly disabled i.e. don't fall back to "default"
                        return String();
                    }
                }

                const String key_default = "default";

                if (condition_dict.has(key_default))
                {
                    const String resolved_path = resolve_package_export_value(condition_dict[key_default], p_condition, p_subpath, p_wildcard);

                    if (!resolved_path.is_empty())
                    {
                        return resolved_path;
                    }
                }

                return String(); // No match
            }

            case Variant::ARRAY:
            {
                const Array alternatives = p_value;
                for (int i = 0; i < alternatives.size(); ++i)
                {
                    const Variant& alternative = alternatives[i];
                    const String resolved_path = resolve_package_export_value(alternative, p_condition, p_subpath, p_wildcard);

                    if (!resolved_path.is_empty())
                    {
                        return resolved_path;
                    }

                    if (alternative.get_type() == Variant::NIL)
                    {
                        return String(); // Further resolution explicitly disabled. Used when nested in conditions.
                    }
                }

                return String(); // No matches
            }

            case Variant::NIL:
                return String(); // Resolution explicitly disabled

            default:
                JSB_LOG(Warning, "invalid package.json exports value. Expected string, object, string[] or null. Encountered value: %s", p_value);
                return String();
        }
    }


    String DefaultModuleResolver::resolve_package_export(const Dictionary& p_exports, const String& p_condition, const String& p_module_id)
    {
        String lookup_key = p_module_id.is_empty() || p_module_id == "."
            ? "."
            : "./" + p_module_id;

        String longest_match_key;
        String longest_match_subpath;
        int longest_match_length = -1;
        bool longest_match_has_wildcard = false;

        const Array keys = p_exports.keys();
        for (int i = 0; i < keys.size(); ++i)
        {
            const String key = keys[i];
            const int wildcard_index = key.find("*");
            const String effective_key = key.substr(0, wildcard_index);

            if (lookup_key.begins_with(effective_key) && (effective_key.ends_with("/") || effective_key == lookup_key))
            {
                 const int current_match_len = effective_key.length();
                 if (current_match_len > longest_match_length)
                 {
                     longest_match_length = current_match_len;
                     longest_match_key = key;
                     longest_match_subpath = lookup_key.substr(current_match_len);
                     longest_match_has_wildcard = wildcard_index >= 0;
                 }
            }
        }

        if (longest_match_key.is_empty())
        {
            return String();
        }

        return resolve_package_export_value(p_exports[longest_match_key], p_condition, longest_match_subpath, longest_match_has_wildcard);
    }


    bool DefaultModuleResolver::check_absolute_file_path(const String& p_module_id, ModuleSourceInfo& o_source_info)
    {
        // 1: module_id (we do not check it strictly here, but usually, it should already have a valid extension)
        if (p_module_id.contains(".") && FileAccess::exists(p_module_id))
        {
            o_source_info.source_filepath = p_module_id;
            o_source_info.package_filepath = String();
            return true;
        }

        const bool has_module_id_dir = DirAccess::exists(p_module_id);

        // 2: implicit file path (module_id.js, module_id.cjs)
        if (String source_path; check_implicit_source_path(p_module_id, source_path))
        {
            o_source_info.source_filepath = source_path;
            o_source_info.package_filepath = String();
            JSB_LOG(Verbose, "checked file path %s", source_path);
            return true;
        }

        // 3: module_id/index.js
        if (has_module_id_dir)
        {
            const String index_path = internal::PathUtil::combine(p_module_id, "index.js");
            if (FileAccess::exists(index_path))
            {
                o_source_info.source_filepath = index_path;
                o_source_info.package_filepath = String();
                return true;
            }
        }

        return false;
    }

    bool DefaultModuleResolver::check_package_file_path(const String& p_package_path, const String& p_module_id, ModuleSourceInfo& o_source_info)
    {
        if (!DirAccess::exists(p_package_path))
        {
            return false;
        }

        Dictionary package_exports;

        if (package_exports_cache.has(p_package_path))
        {
            package_exports = package_exports_cache[p_package_path];
        }
        else
        {
            const String package_json_path = internal::PathUtil::combine(p_package_path, "package.json");

            if (FileAccess::exists(package_json_path))
            {
                const Ref<FileAccess> file = FileAccess::open(package_json_path, FileAccess::READ);
                jsb_check(file.is_valid());

                const Ref json = memnew(JSON);
                Error error = json->parse(file->get_as_utf8_string());
                if (error != OK)
                {
                    JSB_LOG(Error, "failed to parse package.json (%d: %s)", json->get_error_line(), json->get_error_message());
                }

                const Dictionary& package_json = json->get_data();
                const String key_exports = "exports";

                if (package_json.has(key_exports))
                {
                    const Variant& exports = package_json[key_exports];
                    const Variant::Type exports_type = exports.get_type();

                    // Detected abbreviated exports and abbreviations to standard form

                    if (exports_type == Variant::DICTIONARY)
                    {
                        const Dictionary exports_dict = exports;
                        const String first_key = exports_dict.get_key_at_index(0);

                        if (!first_key.begins_with("."))
                        {
                            // Abbreviated conditional
                            package_exports["."] = exports_dict;
                        }
                        else
                        {
                            // Already in standard form
                            package_exports = exports_dict;
                        }
                    }
                    else if (exports_type == Variant::STRING || exports_type == Variant::ARRAY)
                    {
                        // Abbreviated value / alternatives
                        package_exports["."] = exports;
                    }
                    else if (exports_type != Variant::NIL) // Exports may be explicitly disabled with exports: null
                    {
                        JSB_LOG(Warning, "invalid package.json exports. Module imports will fail: %s", package_json_path);
                    }
                }
                else
                {
                    const String key_main = "main";

                    if (package_json.has(key_main))
                    {
                        const String dot = ".";
                        const String dot_slash = "./";
                        const String& main = package_exports[key_main];

                        // Transform main to equivalent exports
                        package_exports[dot] = main.begins_with(dot) ? main : internal::PathUtil::combine(dot, main);
                        package_exports[dot_slash] = dot_slash;
                    }
                }
            }

            package_exports_cache[p_package_path] = package_exports;
        }

        if (package_exports.is_empty())
        {
            // No exports mapping, fall back to absolute resolution
            return this->check_absolute_file_path(internal::PathUtil::combine(p_package_path, p_module_id), o_source_info);
        }

        const String relative_exported_path = resolve_package_export(package_exports, "require", p_module_id);

        if (relative_exported_path.is_empty())
        {
            return false;
        }

        const String exported_path = internal::PathUtil::combine(p_package_path, relative_exported_path);
        String extracted_path;
        Error error = internal::PathUtil::extract(exported_path, extracted_path);
        if (error != OK)
        {
            JSB_LOG(Error, "unrecognized exports path [%s] in %s", relative_exported_path, p_package_path);
            return false;
        }

        if (!FileAccess::exists(extracted_path))
        {
            return false;
        }

        o_source_info.source_filepath = extracted_path;
        o_source_info.package_filepath = internal::PathUtil::combine(p_package_path, "package.json");
        return true;
    }

    // early and simple validation: check source file existence
    bool DefaultModuleResolver::get_source_info(const String &p_module_id, ModuleSourceInfo& r_source_info)
    {
        JSB_LOG(VeryVerbose, "resolving path %s", p_module_id);

        // directly inspect it at first if it's an absolute path
        if (internal::PathUtil::is_absolute_path(p_module_id))
        {
            if (check_absolute_file_path(p_module_id, r_source_info))
            {
                return true;
            }
            r_source_info = {};
            JSB_LOG(Warning, "failed to check out module (absolute) %s", p_module_id);
            return false;
        }

        // it's a simplified implementation of the Node.js module resolution algorithm
        //   1. explicit-file
        //   2. if (is dir) dir/package.json :[main || index]
        //   3. implicit-file (path.js, path.cjs, path/index.js, path/index.cjs)
        //   X. iterate in all search paths

        // search the statically configured paths
        for (const String& search_path : search_paths_)
        {
            if (check_search_path(search_path, p_module_id, r_source_info))
            {
                return true;
            }
        }

        // search the paths from settings
        for (const String& search_path : get_dynamic_search_paths())
        {
            if (check_search_path(search_path, p_module_id, r_source_info))
            {
                return true;
            }
        }

        r_source_info = {};
        return false;
    }

    bool DefaultModuleResolver::check_search_path(const String& p_search_path, const String& p_module_id, ModuleSourceInfo& o_source_info)
    {
        String package_name;

        if (p_module_id[0] != '.')
        {
            int package_name_slash_index = p_module_id.find_char('/');

            if (p_module_id[0] == '@' && package_name_slash_index >= 0)
            {
                package_name_slash_index = p_module_id.find_char('/', package_name_slash_index + 1);
            }

            package_name = p_module_id.substr(0, package_name_slash_index);
        }

        if (package_name.is_empty())
        {
            const String absolute_file_path = internal::PathUtil::combine(p_search_path, p_module_id);

            if (check_absolute_file_path(absolute_file_path, o_source_info))
            {
                return true;
            }
        }
        else
        {
            const String absolute_package_path = internal::PathUtil::combine(p_search_path, package_name);
            const String file_path = p_module_id.substr(package_name.length() + 1);

            if (check_package_file_path(absolute_package_path, file_path, o_source_info))
            {
                return true;
            }
        }

        JSB_LOG(Verbose, "failed to check out module (search_path: %s) %s", p_search_path, p_module_id);
        return false;
    }

    DefaultModuleResolver& DefaultModuleResolver::add_search_path(const String& p_path)
    {
        String normalized;
        const Error err = internal::PathUtil::extract(p_path, normalized);
        jsb_unused(err);
        jsb_checkf(err == OK, "failed to extract path when adding search path %s (%s)", p_path, jsb_ext_error_string(err));
        search_paths_.append(normalized);
        JSB_LOG(Verbose, "add search path: %s", normalized);
        return *this;
    }

    bool DefaultModuleResolver::load(Environment* p_env, const String& p_asset_path, JavaScriptModule& p_module)
    {
        internal::FileAccessSourceReader reader(p_asset_path);
        return load(p_env, reader, p_module);
    }
    
    bool DefaultModuleResolver::load(Environment* p_env, const internal::ISourceReader& p_reader, JavaScriptModule& p_module)
    {
        if (p_reader.is_null() || p_reader.get_length() == 0)
        {
            jsb_throw(p_env->get_isolate(), "failed to read module source");
            return false;
        }

#if JSB_SUPPORT_RELOAD && defined(TOOLS_ENABLED)
        p_module.time_modified = p_reader.get_time_modified();
        p_module.hash = p_reader.get_hash();
#endif

        const String p_asset_path = p_reader.get_path();
        // parse as JSON
        if (p_asset_path.ends_with("." JSB_JSON_EXT))
        {
            Vector<uint8_t> source;
            const uint64_t len = p_reader.get_length();
            source.resize((int) len + 1);
            source.write[(int) len] = 0; // ensure it's zero-terminated
            p_reader.get_buffer(source.ptrw(), len);
            return load_as_json(p_env, p_module, p_asset_path, source, len);
        }

#if JSB_DEBUG
        if (!internal::PathUtil::is_recognized_javascript_extension(p_asset_path))
        {
            JSB_LOG(Warning, "%s is suspiciously not JS", p_asset_path);
        }
#endif
        {
            v8::Isolate* isolate = p_env->get_isolate();
            v8::Isolate::Scope isolate_scope(isolate);
            v8::HandleScope handle_scope(isolate);
            v8::Local<v8::Context> context = isolate->GetCurrentContext();
            v8::Context::Scope context_scope(context);

            const String filename_abs = p_reader.get_path_absolute();
            Vector<uint8_t> source;
            const size_t len = read_all_bytes_with_shebang(p_reader, source);
            jsb_check((size_t)(int)len == len);

            // source evaluator (the module protocol)
            const v8::MaybeLocal<v8::Value> func_maybe = impl::Helper::compile_function(context, (const char*) source.ptr(), (int) len, filename_abs);
            if (func_maybe.IsEmpty())
            {
                //NOTE an exception should have been thrown in _compile_run if MaybeLocal is empty
                return false;
            }

            v8::Local<v8::Value> func;
            if (!func_maybe.ToLocal(&func) || !func->IsFunction())
            {
                jsb_throw(p_env->get_isolate(), "bad module elevator");
                return false;
            }

            return load_from_evaluator(p_env, p_module, p_asset_path, func.As<v8::Function>());
        }
    }

}
