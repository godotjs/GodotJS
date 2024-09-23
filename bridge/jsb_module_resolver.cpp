#include "jsb_module_resolver.h"
#include "jsb_environment.h"

#include "../internal/jsb_path_util.h"

namespace jsb
{
    bool IModuleResolver::load_from_source(Environment* p_env, JavaScriptModule& p_module, const String& p_asset_path, const String& p_filename_abs, const Vector<uint8_t>& p_source)
    {
        v8::Isolate* isolate = p_env->get_isolate();
        v8::Isolate::Scope isolate_scope(isolate);
        v8::HandleScope handle_scope(isolate);
        v8::Local<v8::Context> context = isolate->GetCurrentContext();
        v8::Context::Scope context_scope(context);
        jsb_check(context == p_env->get_context());

        // failed to compile or run, immediately return since an exception should already be thrown
        v8::MaybeLocal<v8::Value> func_maybe_local = p_env->_compile_run((const char*) p_source.ptr(), p_source.size(), p_filename_abs);
        if (func_maybe_local.IsEmpty())
        {
            return false;
        }

        v8::Local<v8::Value> func_local;
        if (!func_maybe_local.ToLocal(&func_local) || !func_local->IsFunction())
        {
            isolate->ThrowError("bad module elevator");
            return false;
        }

        Environment* environment = Environment::wrap(isolate);
        // use resource path here (begins with `res://`)
        // to make path identification easier during exporting
        // (see `GodotJSExportPlugin::export_compiled_script`)
        const String& filename = p_asset_path;
        const String dirname = internal::PathUtil::dirname(filename);
        const v8::Local<v8::Function> elevator = func_local.As<v8::Function>();
        const v8::Local<v8::Object> module_obj = p_module.module.Get(isolate);

        static constexpr int kIndexExports = 0;
        static constexpr int kIndexFileName = 3;
        static constexpr int kIndexPath = 4;
        v8::Local<v8::Value> argv[] = {
            /* 0: exports  */ p_module.exports.Get(isolate),
            /* 1: require  */ p_env->_new_require_func(p_module.id),
            /* 2: module   */ module_obj,
            /* 3: filename */ BridgeHelper::to_string(isolate, filename),
            /* 4: dirname  */ BridgeHelper::to_string(isolate, dirname),
        };

        // init module properties (filename, path)
        module_obj->Set(context, jsb_name(environment, filename), argv[kIndexFileName]).Check();
        module_obj->Set(context, jsb_name(environment, path), argv[kIndexPath]).Check();

        //TODO set `require.cache`
        // ...

        if (const v8::MaybeLocal<v8::Value> result = elevator->Call(context, v8::Undefined(isolate), ::std::size(argv), argv);
            result.IsEmpty())
        {
            // failed, usually means error thrown
            return false;
        }

        // update `exports`, because its value may be covered during the execution process of the elevator script.
        const v8::Local<v8::Value> updated_exports = module_obj->Get(context, jsb_name(environment, exports)).ToLocalChecked();
        jsb_notice(updated_exports != argv[kIndexExports], "`exports` is overwritten in module: %s", filename);

        p_module.exports.Reset(isolate, updated_exports);
        return true;
    }

    Vector<uint8_t> DefaultModuleResolver::read_all_bytes(const internal::ISourceReader& p_reader)
    {
        //TODO (consider) add `global, globalThis` to shadow the real global object
        constexpr static char header[] = "(function(exports,require,module,__filename,__dirname){";
        constexpr static char footer[] = "\n})";

        jsb_check(!p_reader.is_null());
        Vector<uint8_t> data;
        const size_t file_len = p_reader.get_length();
        jsb_check(file_len);
        data.resize((int) (file_len + ::std::size(header) + ::std::size(footer) - 2));

        memcpy(data.ptrw(), header, ::std::size(header) - 1);
        p_reader.get_buffer(data.ptrw() + ::std::size(header) - 1, file_len);
        memcpy(data.ptrw() + file_len + ::std::size(header) - 1, footer, ::std::size(footer) - 1);
        return data;
    }

    bool DefaultModuleResolver::check_file_path(const String& p_module_id, String& o_path)
    {
        static const String js_ext = "." JSB_JAVASCRIPT_EXT;

        // direct module
        {
            const String extended = internal::PathUtil::extends_with(p_module_id, js_ext);
            //NOTE !!! we use FileAccess::exists instead of access->file_exists because access->file_exists does not consider files from packages
            if(FileAccess::exists(extended))
            {
                o_path = extended;
                return true;
            }
        }

        // parse package.json
        {
            const String package_json = internal::PathUtil::combine(p_module_id, "package.json");
            if(FileAccess::exists(package_json))
            {
                Ref<FileAccess> file = FileAccess::open(package_json, FileAccess::READ);
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

                    String main_path;
                    const Dictionary data = json->get_data();
                    const String main = internal::PathUtil::combine(p_module_id, internal::PathUtil::extends_with(data["main"], js_ext));
                    error = internal::PathUtil::extract(main, main_path);
                    if (error != OK)
                    {
                        JSB_LOG(Error, "can not extract path %s", main);
                        break;
                    }

                    if(FileAccess::exists(main_path))
                    {
                        o_path = main_path;
                        return true;
                    }
                } while (false);
            }
        }

        return false;
    }


    // early and simple validation: check source file existence
    bool DefaultModuleResolver::get_source_info(const String &p_module_id, String& r_asset_path)
    {
        JSB_LOG(VeryVerbose, "resolving path %s", p_module_id);

        // directly inspect it at first if it's an explicit path
        if (internal::PathUtil::is_absolute_path(p_module_id))
        {
            if(check_file_path(p_module_id, r_asset_path))
            {
                return true;
            }
            r_asset_path.clear();
            return false;
        }

        for (const String& search_path : search_paths_)
        {
            const String filename = internal::PathUtil::combine(search_path, p_module_id);
            if (check_file_path(filename, r_asset_path))
            {
                return true;
            }
        }
        r_asset_path.clear();
        return false;
    }

    DefaultModuleResolver& DefaultModuleResolver::add_search_path(const String& p_path)
    {
        String normalized;
        const Error err = internal::PathUtil::extract(p_path, normalized);
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
            p_env->get_isolate()->ThrowError("failed to read module source");
            return false;
        }
        const String filename_abs = reader.get_path_absolute();
        const Vector<uint8_t> source = read_all_bytes(reader);
#if JSB_SUPPORT_RELOAD
        p_module.time_modified = reader.get_time_modified();
        p_module.hash = reader.get_hash();
#endif
        return load_from_source(p_env, p_module, p_asset_path, filename_abs, source);
    }

}
