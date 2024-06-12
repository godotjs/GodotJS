#include "jsb_module_resolver.h"

#include "jsb_realm.h"
#include "../internal/jsb_path_util.h"
#include "../weaver/jsb_weaver_consts.h"
#include "core/io/json.h"

namespace jsb
{
    Vector<uint8_t> IModuleResolver::read_all_bytes(const internal::ISourceReader& p_reader)
    {
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

    bool IModuleResolver::load_from_source(Realm* p_realm, JavaScriptModule& p_module, const String& p_filename_abs, const Vector<uint8_t>& p_source)
    {
        v8::Isolate* isolate = p_realm->get_isolate();
        v8::Isolate::Scope isolate_scope(isolate);
        v8::HandleScope handle_scope(isolate);
        v8::Local<v8::Context> context = p_realm->unwrap();
        v8::Context::Scope context_scope(context);

        jsb_check(p_realm->check(context));

        // failed to compile or run, immediately return since an exception should already be thrown
        v8::MaybeLocal<v8::Value> func_maybe_local = p_realm->_compile_run((const char*) p_source.ptr(), p_source.size(), p_filename_abs);
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

        const CharString cmodule_id = String(p_module.id).utf8();
        const CharString cfilename = p_filename_abs.utf8();
        const CharString cdirname = internal::PathUtil::dirname(p_filename_abs).utf8();

        v8::Local<v8::Object> jmodule = p_module.module.Get(isolate);
        v8::Local<v8::Value> jexports = p_module.exports.Get(isolate);
        v8::Local<v8::String> jfilename = v8::String::NewFromUtf8(isolate, cfilename.ptr(), v8::NewStringType::kNormal, cfilename.length()).ToLocalChecked();
        v8::Local<v8::Function> jrequire = p_realm->_new_require_func(cmodule_id);
        v8::Local<v8::Function> elevator = func_local.As<v8::Function>();

        v8::Local<v8::Value> argv[] = { // exports, require, module, __filename, __dirname
            jexports,
            jrequire,
            jmodule,
            jfilename,
            v8::String::NewFromUtf8(isolate, cdirname.ptr(), v8::NewStringType::kNormal, cdirname.length()).ToLocalChecked(),
        };

        //TODO set `require.cache`
        // ...

        v8::MaybeLocal<v8::Value> type_maybe_local = elevator->Call(context, v8::Undefined(isolate), ::std::size(argv), argv);
        if (type_maybe_local.IsEmpty())
        {
            return false;
        }

        // update `exports`, because its value may be covered during the execution process of the elevator script.
        v8::Local<v8::Value> updated_exports = jmodule->Get(context, v8::String::NewFromUtf8Literal(isolate, "exports")).ToLocalChecked();
#if JSB_DEBUG
        if (updated_exports != jexports) JSB_LOG(Log, "`exports` is overwritten in module");
#endif
        p_module.exports.Reset(isolate, updated_exports);
        jmodule->Set(context, v8::String::NewFromUtf8Literal(isolate, "filename"), jfilename).Check();
        return true;
    }

    bool DefaultModuleResolver::check_file_path(const String& p_module_id, String& o_path)
    {
        static const String js_ext = "." JSB_RES_EXT;
        Ref<FileAccess> access = get_file_access();

        // direct module
        {
            const String extended = internal::PathUtil::extends_with(p_module_id, js_ext);
            if(access->file_exists(extended))
            {
                o_path = extended;
                return true;
            }
        }

        // parse package.json
        {
            const String package_json = internal::PathUtil::combine(p_module_id, "package.json");
            if(access->file_exists(package_json))
            {
                Ref<FileAccess> file = access->open(package_json, FileAccess::READ);
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

                    if(access->file_exists(main_path))
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
        ERR_FAIL_COND_V(err != OK, *this);
        search_paths_.append(normalized);
        return *this;
    }

    bool DefaultModuleResolver::load(Realm* p_realm, const String& p_asset_path, JavaScriptModule& p_module)
    {
        // load source buffer
        const internal::FileAccessSourceReader reader(p_asset_path);
        if (reader.is_null() || reader.get_length() == 0)
        {
            p_realm->get_isolate()->ThrowError("failed to read module source");
            return false;
        }
        const String filename_abs = reader.get_path_absolute();
        const Vector<uint8_t> source = read_all_bytes(reader);
        return load_from_source(p_realm, p_module, filename_abs, source);
    }

}
