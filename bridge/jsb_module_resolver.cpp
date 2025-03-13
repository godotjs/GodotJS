#include "jsb_module_resolver.h"
#include "jsb_environment.h"

#include "../internal/jsb_path_util.h"

namespace jsb
{
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

    bool DefaultModuleResolver::check_file_path(const String& p_module_id, ModuleSourceInfo& o_source_info)
    {
        // 1: module_id (we do not check it strictly here, but usually, it should already have a valid extension)
        if (p_module_id.contains(".") && FileAccess::exists(p_module_id))
        {
            o_source_info.source_filepath = p_module_id;
            o_source_info.package_filepath = String();
            return true;
        }

        const bool has_module_id_dir = DirAccess::exists(p_module_id);

        // 2: module_id/package.json :main
        if (has_module_id_dir)
        {
            do
            {
                const String package_filepath = internal::PathUtil::combine(p_module_id, "package.json");
                if(!FileAccess::exists(package_filepath)) break;

                const Ref<FileAccess> file = FileAccess::open(package_filepath, FileAccess::READ);
                jsb_check(file.is_valid());

                const Ref json = memnew(JSON);
                Error error = json->parse(file->get_as_utf8_string());
                if (error != OK)
                {
                    JSB_LOG(Error, "failed to parse package.json (%d: %s)", json->get_error_line(), json->get_error_message());
                    break;
                }
                const Dictionary data = json->get_data();
                const String key_main = "main";
                if (!data.has(key_main)) break;

                const String main = internal::PathUtil::combine(p_module_id, data[key_main]);
                String extracted_main;
                error = internal::PathUtil::extract(main, extracted_main);
                if (error != OK)
                {
                    JSB_LOG(Error, "unrecognized main path [%s] in %s/package.json", main, p_module_id);
                    break;
                }

                if (FileAccess::exists(extracted_main))
                {
                    o_source_info.source_filepath = extracted_main;
                    o_source_info.package_filepath = package_filepath;
                    return true;
                }
            } while (false);
        }

        // 3-1: implicit file path (module_id.js, module_id.cjs)
        if (String source_path; check_implicit_source_path(p_module_id, source_path))
        {
            o_source_info.source_filepath = source_path;
            o_source_info.package_filepath = String();
            JSB_LOG(Verbose, "checked file path %s", source_path);
            return true;
        }

        // 3-2: module_id/index.js
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


    // early and simple validation: check source file existence
    bool DefaultModuleResolver::get_source_info(const String &p_module_id, ModuleSourceInfo& r_source_info)
    {
        JSB_LOG(VeryVerbose, "resolving path %s", p_module_id);

        // directly inspect it at first if it's an absolute path
        if (internal::PathUtil::is_absolute_path(p_module_id))
        {
            if(check_file_path(p_module_id, r_source_info))
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

        for (const String& search_path : search_paths_)
        {
            const String filename = internal::PathUtil::combine(search_path, p_module_id);
            if (check_file_path(filename, r_source_info))
            {
                return true;
            }
            JSB_LOG(Verbose, "failed to check out module (search_path: %s) %s", search_path, p_module_id);
        }
        r_source_info = {};
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
        // load source buffer
        const internal::FileAccessSourceReader reader(p_asset_path);
        if (reader.is_null() || reader.get_length() == 0)
        {
            jsb_throw(p_env->get_isolate(), "failed to read module source");
            return false;
        }

#if JSB_SUPPORT_RELOAD && defined(TOOLS_ENABLED)
        p_module.time_modified = reader.get_time_modified();
        p_module.hash = reader.get_hash();
#endif

        // parse as JSON
        if (p_asset_path.ends_with("." JSB_JSON_EXT))
        {
            Vector<uint8_t> source;
            const uint64_t len = reader.get_length();
            source.resize((int) len + 1);
            source.write[(int) len] = 0; // ensure it's zero-terminated
            reader.get_buffer(source.ptrw(), len);
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

            const String filename_abs = reader.get_path_absolute();
            Vector<uint8_t> source;
            const size_t len = read_all_bytes_with_shebang(reader, source);
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
