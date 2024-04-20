#include "jsb_environment.h"
#include <iterator>

#include "extra/jsb_extra_funcs.h"
#include "jsb_builtin_funcs.h"
#include "jsb_gc_object.h"
#include "jsb_path_util.h"

namespace jsb
{
    namespace
    {
        JSClassID bridge_class_id = 0;
    }

// #pragma push_macro("DEF")
// #undef DEF
// #define DEF(FieldName) StringName Environment::_##FieldName;
// #include "jsb_preallocated_atoms.h"
// #pragma pop_macro("DEF")

    Environment::Environment()
    {
        rt = JS_NewRuntime();
        ctx = JS_NewContext(rt);
        state = RS_NONE;

        JS_SetRuntimeOpaque(rt, this);
        JS_SetContextOpaque(ctx, this);
    }

    Environment::~Environment()
    {
        shutdown();

        JS_FreeContext(ctx);
        JS_FreeRuntime(rt);
    }

    JSContext* Environment::get_context() const
    {
        return ctx;
    }

    void Environment::register_builtins()
    {
        bootstrap();

#pragma push_macro("DEF_FUNC_MAGIC")
#pragma push_macro("DEF_FUNC")
#undef DEF_FUNC_MAGIC
#undef DEF_FUNC
#define DEF_FUNC_MAGIC(ObjectOwner, FuncPtr, FuncName, FuncLen, FuncMagic) JS_SetPropertyStr(ctx, ObjectOwner, FuncName, JS_NewCFunctionMagic(ctx, &FuncPtr, FuncName, FuncLen, JS_CFUNC_generic_magic, FuncMagic))
#define DEF_FUNC(ObjectOwner, FuncPtr, FuncName, FuncLen) JS_SetPropertyStr(ctx, ObjectOwner, FuncName, JS_NewCFunction(ctx, &FuncPtr, FuncName, FuncLen))
        const JSValue global_object = JS_GetGlobalObject(ctx);
        {
            // jsb
            const JSValue jsb_object = JS_NewObject(ctx);
            JS_SetPropertyStr(ctx, global_object, "jsb", jsb_object);
        }
#if JSB_EXTRA_CONSOLE_ENABLED
        {
            // minimum console capability
            const JSValue console_object = JS_NewObject(ctx);
            DEF_FUNC_MAGIC(console_object, ExtraFunctions::print, "debug", 1, ELogSeverity::Debug);
            DEF_FUNC_MAGIC(console_object, ExtraFunctions::print, "log", 1, ELogSeverity::Info);
            DEF_FUNC_MAGIC(console_object, ExtraFunctions::print, "warn", 1, ELogSeverity::Warning);
            DEF_FUNC_MAGIC(console_object, ExtraFunctions::print, "error", 1, ELogSeverity::Error);
            DEF_FUNC_MAGIC(console_object, ExtraFunctions::print, "assert", 1, ELogSeverity::Assert);
            DEF_FUNC_MAGIC(console_object, ExtraFunctions::print, "trace", 0, -1);
            JS_SetPropertyStr(ctx, global_object, "console", console_object);
        }
#endif
        {
            // commonjs 'require'
            const JSValue require_object = JS_NewCFunctionMagic(ctx, &BuiltinFunctions::require, "require", 1, JS_CFUNC_generic_magic, -1);
            JS_SetProperty(ctx, require_object, JS_ATOM_moduleId, JS_NewStringLen(ctx, "", 0));
            JS_SetProperty(ctx, require_object, JS_ATOM_cache, JS_DupValue(ctx, _module_cache));
            JS_SetPropertyStr(ctx, global_object, "require", require_object);
        }
        JS_FreeValue(ctx, global_object);
#pragma pop_macro("DEF_FUNC")
#pragma pop_macro("DEF_FUNC_MAGIC")

    }

    void Environment::bootstrap()
    {
        if (state != RS_NONE)
        {
            return;
        }

        state = RS_INITED;
        JSClassDef class_def;
        class_def.class_name = "NativeClass";
        class_def.finalizer = _finalizer;
        class_def.exotic = nullptr;
        class_def.gc_mark = nullptr;
        class_def.call = nullptr;

        JS_NewClassID(&bridge_class_id);
        JS_NewClass(rt, bridge_class_id, &class_def);

        // Environment::_##FieldName = _scs_create(#FieldName, true);
        // cached_names.insert(Environment::_##FieldName, JS_NewAtomLen(ctx, #FieldName, sizeof(#FieldName) - 1));
#pragma push_macro("DEF")
#undef DEF
#define DEF(FieldName) \
        JS_ATOM_##FieldName = JS_NewAtomLen(ctx, #FieldName, sizeof(#FieldName) - 1);
#include "jsb_preallocated_atoms.h"
#pragma pop_macro("DEF")

        _main_module = JS_UNDEFINED;
        _module_cache = JS_NewObject(ctx);
    }

    void Environment::shutdown()
    {
        if (state != RS_INITED)
        {
            return;
        }

        state = RS_NONE;

        JS_FreeValue(ctx, _module_cache);
        JS_FreeValue(ctx, _main_module);

#pragma push_macro("DEF")
#undef DEF
#define DEF(FieldName) \
        JS_FreeAtom(ctx, JS_ATOM_##FieldName);
#include "jsb_preallocated_atoms.h"
#pragma pop_macro("DEF")
    }

    void Environment::_finalizer(JSRuntime* rt, JSValue val)
    {
        GCObject* gco = (GCObject*) JS_GetOpaque(val, bridge_class_id);
        jsb_check(gco);
        JS_SetOpaque(val, nullptr);
        //TODO dispose
        memdelete(gco);
    }

    JSAtom Environment::key_for(const String& p_name)
    {
        if (const HashMap<String, JSAtom>::Iterator it = cached_names.find(p_name))
        {
            return it->value;
        }

        const JSAtom atom = to_atom(ctx, p_name);
        cached_names.insert(p_name, atom);
        return atom;
    }

    Error Environment::eval(const char* p_source, size_t p_source_len, const char* p_filename)
    {
        constexpr int flags = JS_EVAL_FLAG_STRICT | JS_EVAL_TYPE_GLOBAL;
        const JSValue ret_val = JS_Eval(ctx, p_source, p_source_len, p_filename, flags);
        //TODO check the returned value
        JS_FreeValue(ctx, ret_val);
        return OK;
    }

    void Environment::update()
    {
        JSContext *pctx;
        while (true)
        {
            const int err = JS_ExecutePendingJob(rt, &pctx);
            if (likely(err >= 0))
            {
                return;
            }

            const JSValue e = JS_GetException(pctx);
            // JavaScriptError script_err;
            // dump_exception(pctx, e, &script_err);
            // ERR_PRINT(error_to_string(script_err));
            JSB_LOG(Error, "pending job error");
            JS_FreeValue(pctx, e);
        }
    }

    bool Environment::is_reloading(const String& p_module_id)
    {
        //TODO
        return false;
    }

    JSValue Environment::create_module_object(const String& p_module_id, const String& p_filename)
    {
        jsb_check(!p_module_id.is_empty());
        jsb_check(!module_index.has(p_module_id));
        // newly create
        const JSValue module_object = JS_NewObject(ctx);
        if (JS_IsUndefined(_main_module))
        {
            _main_module = JS_DupValue(ctx, module_object);
        }

        // setup essential properties
        JS_SetProperty(ctx, module_object, JS_ATOM_moduleId, to_string(ctx, p_module_id));
        JS_SetProperty(ctx, module_object, JS_ATOM_filename, to_string(ctx, p_filename));
        JS_SetProperty(ctx, module_object, JS_ATOM_cache, JS_DupValue(ctx, _module_cache));
        JS_SetProperty(ctx, module_object, JS_ATOM_loaded, JS_FALSE);
        JS_SetProperty(ctx, module_object, JS_ATOM_exports, JS_NewObject(ctx));
        JS_SetProperty(ctx, module_object, JS_ATOM_resolvername, to_string(ctx, "source"));
        JS_SetProperty(ctx, module_object, JS_ATOM_children, JS_NewArray(ctx));
        module_index.append(p_module_id);
        return module_object;
    }

    bool Environment::try_get_module_object(const String& p_module_id, JSValue& o_module_object)
    {
        const JSValue module_object = JS_GetProperty(ctx, _module_cache, key_for(p_module_id));
        if (JS_IsObject(module_object))
        {
            o_module_object = module_object;
            return true;
        }
        JS_FreeValue(ctx, module_object);
        return false;
    }

    JSValue Environment::create_require_func(const String& p_module_id)
    {
        const int index = module_index.find(p_module_id);
        jsb_check(index >= 0);
        const JSValue require_func = JS_NewCFunctionMagic(ctx, &BuiltinFunctions::require, "require", 1, JS_CFUNC_generic_magic, index);
        JS_SetProperty(ctx, require_func, JS_ATOM_moduleId, to_string(ctx, p_module_id));
        JS_SetProperty(ctx, require_func, JS_ATOM_main, JS_DupValue(ctx, _main_module));
        JS_SetProperty(ctx, require_func, JS_ATOM_cache, JS_DupValue(ctx, _module_cache));
        return require_func;
    }

    void Environment::load(const String& p_name)
    {
        JSValue mod = resolve_module(p_name, -1);
        JS_FreeValue(ctx, mod);
    }

    JSValue Environment::resolve_module(const String& p_name, int p_parent_module_index)
    {
        const String parent_id = p_parent_module_index >= 0 ? module_index[p_parent_module_index] : String();
        {
            SourceReference source_reference;
            if (_resolve(parent_id, p_name, source_reference))
            {
                JSValue module_object;
                if (try_get_module_object(source_reference.path, module_object))
                {
                    if (is_reloading(source_reference.path))
                    {
                        _reload(module_object, source_reference);
                    }
                }
                else
                {
                    module_object = create_module_object(source_reference.path, source_reference.filename);
                    if (!_load(module_object, parent_id, source_reference))
                    {
                        JS_FreeValue(ctx, module_object);
                        return JS_ThrowInternalError(ctx, "failed to load module %s", source_reference.path.utf8().get_data());
                    }
                }
                return module_object;
            }
        }
        const CharString c_module_id = p_name.utf8();
        return JS_ThrowInternalError(ctx, "no such module %s", c_module_id.get_data());
    }

    bool Environment::resolve_file(const String& p_filename, String& o_entry)
    {
        if (p_filename[0] != '/')
        {
            // for (const String& search_path: search_paths)
            // {
            //     const String& path = PathUtil::combine(search_path, p_filename);
            //     if (p_fs.find(path))
            //     {
            //         o_entry = path;
            //         return true;
            //     }
            // }
        }
        else if (PathUtil::find(p_filename))
        {
            o_entry = p_filename;
            return true;
        }

        return false;
    }

    void Environment::dump_exception(const JSValue &p_exception)
    {
        JSValue err_file = JS_GetProperty(ctx, p_exception, JS_ATOM_fileName);
        JSValue err_line = JS_GetProperty(ctx, p_exception, JS_ATOM_lineNumber);
        JSValue err_msg = JS_GetProperty(ctx, p_exception, JS_ATOM_message);
        JSValue err_stack = JS_GetProperty(ctx, p_exception, JS_ATOM_stack);

        JSB_LOG(Error, "exception: %s", to_string(ctx, err_msg));
        // JS_ToInt32(ctx, &r_error->line, err_line);
        // r_error->message = js_to_string(ctx, err_msg);
        // r_error->file = js_to_string(ctx, err_file);
        // r_error->stack.push_back(js_to_string(ctx, err_stack));
        // r_error->column = 0;

        JS_FreeValue(ctx, err_file);
        JS_FreeValue(ctx, err_line);
        JS_FreeValue(ctx, err_msg);
        JS_FreeValue(ctx, err_stack);
    }


    bool Environment::_resolve(const String& p_parent_id, const String& p_name, SourceReference& o_source_reference)
    {
        // join with parent id if name is relative
        const String raw_path = p_name.begins_with("./") || p_name.begins_with("../")
                ? PathUtil::combine(PathUtil::dirname(p_parent_id), p_name)
                : p_name;

        // eliminate all relative components
        String normalized_path;
        if (PathUtil::extract(raw_path, normalized_path) != OK)
        {
            return false;
        }

        String resolved_id;
        if (!normalized_path.ends_with(".js"))
        {
            normalized_path += ".js";
        }
        if (resolve_file(normalized_path, resolved_id))
        {
            o_source_reference.path = resolved_id;
            o_source_reference.filename = PathUtil::get_full_path(resolved_id);
            return true;
        }

        return false;
    }

    bool Environment::_load(JSValue p_module_object, const String& p_parent_id, const SourceReference& p_source_reference)
    {
        const String dirname = PathUtil::dirname(p_source_reference.path);
        JSValue argv[] = {
            /* exports */  JS_GetProperty(ctx, p_module_object, JS_ATOM_exports),
            /* require */  create_require_func(p_source_reference.path),
            /* module */   JS_DupValue(ctx, p_module_object),
            /* filename */ JS_GetProperty(ctx, p_module_object, JS_ATOM_filename),
            /* dirname */  JavaScriptHelpers::to_string(ctx, dirname),
        };

        const Vector<uint8_t> bytes = PathUtil::read_all_bytes(p_source_reference.path, EFileTransform::CommonJS);
        static constexpr int flags = JS_EVAL_TYPE_GLOBAL | JS_EVAL_FLAG_STRICT;
        const JSValue func_object = JS_Eval(ctx, (const char*)bytes.ptr(), bytes.size(), p_source_reference.path.utf8().get_data(), flags);
        bool succeeded = true;

        do
        {
            if (!JS_IsFunction(ctx, func_object))
            {
                JSB_LOG(Error, "module evaluator error");
                succeeded = false;
                JS_FreeValue(ctx, func_object);
                break;
            }

            jsb_check(JS_IsFunction(ctx, func_object));
            const JSValue rval = JS_Call(ctx, func_object, JS_UNDEFINED, std::size(argv), argv);

            JS_FreeValue(ctx, func_object);
            if (JS_IsException(rval))
            {
                JSValue e = JS_GetException(ctx);
                dump_exception(e);
                JS_FreeValue(ctx, e);
                succeeded = false;
                break;
            }

            JSB_LOG(Debug, "load module %s", p_source_reference.path);
            JS_SetProperty(ctx, p_module_object, JS_ATOM_loaded, JS_TRUE);
            JS_FreeValue(ctx, rval);
        } while(false);

        JavaScriptHelpers::free_values(ctx, argv);
        return succeeded;
    }

    bool Environment::_reload(JSValue p_module_object, const SourceReference& p_source_reference)
    {
        //TODO
        return false;
    }

}
