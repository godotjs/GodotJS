#include "jsb_amd_module_loader.h"

#include "jsb_builtins.h"
#include "jsb_environment.h"

namespace jsb
{
    bool AMDModuleLoader::load(Environment* p_env, JavaScriptModule& p_module)
    {
        typedef v8::Local<v8::Value> LocalValue;

        v8::Isolate* isolate = p_env->get_isolate();
        const int len = (int) deps_.size();
        bool succeeded = true;
        LocalValue* dep_vals = jsb_stackalloc(LocalValue, len);
        const String self_module_id = p_module.id;

        // setup self exports
        const v8::Local<v8::Object> self_exports = v8::Object::New(isolate);
        p_module.exports.Reset(isolate, self_exports);

        // prepare all dependencies
        int index = 0;
        for (; index < len; ++index)
        {
            const String& dep_module_id = deps_[index];
            memnew_placement(&dep_vals[index], LocalValue);

            // special case: `require` & `exports`
            if (dep_module_id == "require")
            {
                dep_vals[index] = p_env->_new_require_func(self_module_id);
                continue;
            }
            if (dep_module_id == "exports")
            {
                dep_vals[index] = self_exports;
                continue;
            }
            if (const JavaScriptModule* module = p_env->_load_module(self_module_id, dep_module_id))
            {
                JSB_LOG(Verbose, "load dep: %s", dep_module_id);
                dep_vals[index] = module->exports.Get(isolate);
                continue;
            }
            succeeded = false;
            break;
        }

        if (succeeded)
        {
            const v8::Local<v8::Context> context = isolate->GetCurrentContext();
            const v8::Local<v8::Function> evaluator = evaluator_.Get(isolate);
            v8::Local<v8::Value> result;

            if (evaluator->Call(context, v8::Undefined(isolate), len, dep_vals).ToLocal(&result))
            {
                if (!result->IsUndefined())
                {
                    p_module.exports.Reset(isolate, result);
                }
            }
            else
            {
                JSB_LOG(Error, "failed to evaluate AMD module");
                succeeded = false;
            }
        }

        for (--index; index >= 0; --index)
        {
            dep_vals[index].~LocalValue();
        }
        return succeeded;
    }

    Error AMDModuleLoader::load_source(Environment* p_env, const internal::PresetSource& p_source)
    {
        size_t len;
        const char* str = p_source.get_data(len);
        if (!str) return ERR_FILE_NOT_FOUND;
        jsb_check(len == (size_t)(int) len);
        _load_source(p_env, str, (int) len, p_source.get_filename());
        return OK;
    }

    void AMDModuleLoader::load_source(Environment* p_env, const String& p_source, const String& p_name)
    {
        _load_source(p_env, (const char*) p_source.ptr(), p_source.length(), p_name);
    }

    void AMDModuleLoader::_load_source(Environment* p_env, const char* p_source, int p_len, const String& p_name)
    {
        jsb_check(strstr(p_source, "(function(define){") == p_source);

        v8::Isolate* isolate = p_env->get_isolate();
        v8::Isolate::Scope isolate_scope(isolate);
        v8::HandleScope handle_scope(isolate);
        v8::Local<v8::Context> context = p_env->get_context();
        v8::Context::Scope context_scope(context);

        impl::TryCatch try_catch(isolate);
        const v8::MaybeLocal<v8::Value> func_maybe = impl::Helper::compile_function(context, p_source, p_len, p_name);
        if (try_catch.has_caught())
        {
            JSB_LOG(Error, "%s", BridgeHelper::get_exception(try_catch));
            return;
        }

        v8::Local<v8::Value> func;
        if (!func_maybe.ToLocal(&func) || !func->IsFunction())
        {
            JSB_LOG(Error, "something wrong on evaluating AMD source %s", p_name);
            return;
        }

        v8::Local<v8::Value> argv[] = { JSB_NEW_FUNCTION(context, Builtins::_define, {}) };
        const v8::MaybeLocal<v8::Value> result = func.As<v8::Function>()->Call(context, v8::Undefined(isolate), ::std::size(argv), argv);
        if (try_catch.has_caught())
        {
            JSB_LOG(Error, "%s", BridgeHelper::get_exception(try_catch));
            return;
        }
        jsb_unused(result);
    }

}
