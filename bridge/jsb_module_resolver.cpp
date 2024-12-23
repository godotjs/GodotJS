#include "jsb_module_resolver.h"
#include "jsb_environment.h"

#include "../internal/jsb_path_util.h"

namespace jsb
{
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
        jsb_notice(updated_exports != argv[kIndexExports], "`exports` is overwritten in module: %s", filename);

        p_module.exports.Reset(isolate, updated_exports);
        return true;
    }

    size_t DefaultModuleResolver::read_all_bytes(const internal::ISourceReader& p_reader, Vector<uint8_t>& o_bytes)
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
    bool DefaultModuleResolver::check_source_path(const String& p_path, String& o_path)
    {
        // if path is with extension
        if (p_path.contains(".") && FileAccess::exists(p_path))
        {
            o_path = p_path;
            return true;
        }

        // try with .js
        const String js_path = internal::PathUtil::extends_with(p_path, "." JSB_JAVASCRIPT_EXT);
        if (FileAccess::exists(js_path))
        {
            o_path = js_path;
            return true;
        }

        // try with .cjs
        const String cjs_path = internal::PathUtil::extends_with(p_path, ".cjs");
        if (FileAccess::exists(cjs_path))
        {
            o_path = cjs_path;
            return true;
        }

        return false;
    }

    bool DefaultModuleResolver::check_file_path(const String& p_module_id, ModuleSourceInfo& o_source_info)
    {
        String source_path;
        // direct module
        if (check_source_path(p_module_id, source_path))
        {
            o_source_info.source_filepath = source_path;
            o_source_info.package_filepath = String();
            JSB_LOG(Verbose, "checked file path %s", source_path);
            return true;
        }

        // parse package.json
        {
            const String package_filepath = internal::PathUtil::combine(p_module_id, "package.json");
            if(FileAccess::exists(package_filepath))
            {
                const Ref<FileAccess> file = FileAccess::open(package_filepath, FileAccess::READ);
                jsb_check(file.is_valid());

                Ref<JSON> json;
                json.instantiate();
                Error error = json->parse(file->get_as_utf8_string());
                do
                {
                    if (error != OK)
                    {
                        JSB_LOG(Error, "failed to parse JSON (%d: %s)", json->get_error_line(), json->get_error_message());
                        break;
                    }

                    const Dictionary data = json->get_data();
                    const String main = internal::PathUtil::combine(p_module_id, data["main"]);
                    String extracted_main;
                    error = internal::PathUtil::extract(main, extracted_main);
                    if (error != OK)
                    {
                        JSB_LOG(Error, "can not extract path %s", main);
                        break;
                    }

                    if(check_source_path(extracted_main, source_path))
                    {
                        o_source_info.source_filepath = source_path;
                        o_source_info.package_filepath = package_filepath;
                        return true;
                    }
                } while (false);
            }
        }

        return false;
    }


    // early and simple validation: check source file existence
    bool DefaultModuleResolver::get_source_info(const String &p_module_id, ModuleSourceInfo& r_source_info)
    {
        JSB_LOG(VeryVerbose, "resolving path %s", p_module_id);

        // directly inspect it at first if it's an explicit path
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
        jsb_checkf(err == OK, "failed to extract path when adding search path %s (%s)", p_path, VariantUtilityFunctions::error_string(err));
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
        const String filename_abs = reader.get_path_absolute();
        Vector<uint8_t> source;
        const size_t len = read_all_bytes(reader, source);
#if JSB_SUPPORT_RELOAD
        p_module.time_modified = reader.get_time_modified();
        p_module.hash = reader.get_hash();
#endif
        jsb_check((size_t)(int)len == len);

        {
            v8::Isolate* isolate = p_env->get_isolate();
            v8::Isolate::Scope isolate_scope(isolate);
            v8::HandleScope handle_scope(isolate);
            v8::Local<v8::Context> context = isolate->GetCurrentContext();
            v8::Context::Scope context_scope(context);

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
