#include "jsb_builtins.h"

#include "jsb_amd_module_loader.h"
#include "jsb_exception_info.h"
#include "jsb_realm.h"

namespace jsb
{
    namespace InternalTimerType { enum Type : uint8_t { Interval, Timeout, Immediate, }; }

    static void _generate_stacktrace(v8::Isolate* isolate, StringBuilder& sb)
    {
        v8::TryCatch try_catch(isolate);
        isolate->ThrowError("");
        if (JavaScriptExceptionInfo exception_info = JavaScriptExceptionInfo(isolate, try_catch, false))
        {
            sb.append("\n");
            sb.append(exception_info);
        }
    }

    void Builtins::register_(const v8::Local<v8::Context>& context, const v8::Local<v8::Object>& self)
    {
        v8::Isolate* isolate = context->GetIsolate();

        // minimal console functions support
        {
            v8::Local<v8::Object> console_obj = v8::Object::New(isolate);

            self->Set(context, v8::String::NewFromUtf8Literal(isolate, "console"), console_obj).Check();
            console_obj->Set(context, v8::String::NewFromUtf8Literal(isolate, "log"), v8::Function::New(context, _print, v8::Int32::New(isolate, internal::ELogSeverity::Log)).ToLocalChecked()).Check();
            console_obj->Set(context, v8::String::NewFromUtf8Literal(isolate, "info"), v8::Function::New(context, _print, v8::Int32::New(isolate, internal::ELogSeverity::Info)).ToLocalChecked()).Check();
            console_obj->Set(context, v8::String::NewFromUtf8Literal(isolate, "debug"), v8::Function::New(context, _print, v8::Int32::New(isolate, internal::ELogSeverity::Debug)).ToLocalChecked()).Check();
            console_obj->Set(context, v8::String::NewFromUtf8Literal(isolate, "warn"), v8::Function::New(context, _print, v8::Int32::New(isolate, internal::ELogSeverity::Warning)).ToLocalChecked()).Check();
            console_obj->Set(context, v8::String::NewFromUtf8Literal(isolate, "error"), v8::Function::New(context, _print, v8::Int32::New(isolate, internal::ELogSeverity::Error)).ToLocalChecked()).Check();
            console_obj->Set(context, v8::String::NewFromUtf8Literal(isolate, "assert"), v8::Function::New(context, _print, v8::Int32::New(isolate, internal::ELogSeverity::Assert)).ToLocalChecked()).Check();
            console_obj->Set(context, v8::String::NewFromUtf8Literal(isolate, "trace"), v8::Function::New(context, _print, v8::Int32::New(isolate, internal::ELogSeverity::Trace)).ToLocalChecked()).Check();
        }

        // the root 'require' function
        {
            Realm* realm = Realm::wrap(context);
            v8::Local<v8::Function> require_func = v8::Function::New(context, _require).ToLocalChecked();
            self->Set(context, v8::String::NewFromUtf8Literal(isolate, "require"), require_func).Check();
            self->Set(context, v8::String::NewFromUtf8Literal(isolate, "define"), v8::Function::New(context, _define).ToLocalChecked()).Check();
            require_func->Set(context, v8::String::NewFromUtf8Literal(isolate, "cache"), realm->jmodule_cache_.Get(isolate)).Check();
            require_func->Set(context, v8::String::NewFromUtf8Literal(isolate, "moduleId"), v8::String::Empty(isolate)).Check();
        }

        //TODO the root 'import' function (async module loading?)
        {
        }

        // essential timer support
        {
            self->Set(context, v8::String::NewFromUtf8Literal(isolate, "setInterval"), v8::Function::New(context, _set_timer, v8::Int32::New(isolate, InternalTimerType::Interval)).ToLocalChecked()).Check();
            self->Set(context, v8::String::NewFromUtf8Literal(isolate, "setTimeout"), v8::Function::New(context, _set_timer, v8::Int32::New(isolate, InternalTimerType::Timeout)).ToLocalChecked()).Check();
            self->Set(context, v8::String::NewFromUtf8Literal(isolate, "setImmediate"), v8::Function::New(context, _set_timer, v8::Int32::New(isolate, InternalTimerType::Immediate)).ToLocalChecked()).Check();
            self->Set(context, v8::String::NewFromUtf8Literal(isolate, "clearInterval"), v8::Function::New(context, _clear_timer).ToLocalChecked()).Check();
        }
    }

    void Builtins::_print(const v8::FunctionCallbackInfo<v8::Value>& info)
    {
        v8::Isolate* isolate = info.GetIsolate();
        v8::HandleScope handle_scope(isolate);
        v8::Local<v8::Context> context = isolate->GetCurrentContext();

        v8::Local<v8::Int32> magic;
        if (!info.Data()->ToInt32(context).ToLocal(&magic))
        {
            isolate->ThrowError("bad call");
            return;
        }

        StringBuilder sb;
        sb.append("[JS]");
        const internal::ELogSeverity::Type severity = (internal::ELogSeverity::Type) magic->Value();
        int index = severity != internal::ELogSeverity::Assert ? 0 : 1;
        if (index == 1)
        {
            // check assertion
            if (info[0]->BooleanValue(isolate))
            {
                return;
            }
        }

        // join all data
        for (int n = info.Length(); index < n; index++)
        {
            if (String str = V8Helper::stringify(isolate, context, info[index]); str.length() > 0)
            {
                sb.append(" ");
                sb.append(str);
            }
        }

#if JSB_WITH_STACKTRACE_ALWAYS
        _generate_stacktrace(isolate, sb);
#else
        if (severity == internal::ELogSeverity::Trace) _generate_stacktrace(isolate, sb);
#endif

        const String& text = sb.as_string();
        internal::IConsoleOutput::internal_write(severity, text);
        switch (severity)
        {
        case internal::ELogSeverity::Assert: CRASH_NOW_MSG(text); return;
        case internal::ELogSeverity::Error: ERR_FAIL_MSG(text); return;
        case internal::ELogSeverity::Warning: WARN_PRINT(text); return;
        case internal::ELogSeverity::Trace:
        default: print_line(text); return;
        }
    }

    void Builtins::_define(const v8::FunctionCallbackInfo<v8::Value>& info)
    {
        v8::Isolate* isolate = info.GetIsolate();
        v8::HandleScope handle_scope(isolate);
        v8::Local<v8::Context> context = isolate->GetCurrentContext();
        Realm* realm = Realm::wrap(context);

        if (info.Length() != 3 || !info[0]->IsString() || !info[1]->IsArray() || !info[2]->IsFunction())
        {
            isolate->ThrowError("bad param");
            return;
        }
        Environment* environment = Environment::wrap(isolate);
        const StringName module_id_str = environment->get_string_name_cache().get_string_name(isolate, info[0].As<v8::String>());
        // const StringName module_id_str = V8Helper::to_string(v8::String::Value(isolate, info[0]));
        if (!internal::VariantUtil::is_valid(module_id_str))
        {
            isolate->ThrowError("bad module_id");
            return;
        }
        if (realm->module_cache_.find(module_id_str))
        {
            isolate->ThrowError("conflicted module_id");
            return;
        }
        v8::Local<v8::Array> deps_val = info[1].As<v8::Array>();
        Vector<String> deps;
        for (uint32_t index = 0, len = deps_val->Length(); index < len; ++index)
        {
            v8::Local<v8::Value> item;
            if (!deps_val->Get(context, index).ToLocal(&item) || !item->IsString())
            {
                isolate->ThrowError("bad param");
                return;
            }
            const String item_str = V8Helper::to_string(v8::String::Value(isolate, item));
            if (item_str.is_empty())
            {
                isolate->ThrowError("bad param");
                return;
            }
            deps.push_back(item_str);
        }
        JSB_LOG(VeryVerbose, "new AMD module loader %s deps: %s", module_id_str, String(", ").join(deps));
        realm->environment_->add_module_loader<AMDModuleLoader>(module_id_str,
            deps, v8::Global<v8::Function>(isolate, info[2].As<v8::Function>()));
    }

    void Builtins::_require(const v8::FunctionCallbackInfo<v8::Value>& info)
    {
        JSB_BENCHMARK_SCOPE(JSRealm, _require);
        v8::Isolate* isolate = info.GetIsolate();
        v8::HandleScope handle_scope(isolate);
        v8::Local<v8::Context> context = isolate->GetCurrentContext();

        if (info.Length() != 1)
        {
            isolate->ThrowError("bad argument");
            return;
        }

        v8::Local<v8::Value> arg0 = info[0];
        if (!arg0->IsString())
        {
            isolate->ThrowError("bad argument");
            return;
        }

        // read parent module id from magic data
        const String parent_id = V8Helper::to_string(isolate, info.Data());
        const String module_id = V8Helper::to_string(isolate, arg0);
        Realm* realm = Realm::wrap(context);
        if (const JavaScriptModule* module = realm->_load_module(parent_id, module_id))
        {
            info.GetReturnValue().Set(module->exports);
        }
    }

    void Builtins::_set_timer(const v8::FunctionCallbackInfo<v8::Value>& info)
    {
        v8::Isolate* isolate = info.GetIsolate();
        const int argc = info.Length();
        if (argc < 1 || !info[0]->IsFunction())
        {
            isolate->ThrowError("bad argument");
            return;
        }

        v8::Local<v8::Context> context = isolate->GetCurrentContext();
        int32_t type;
        if (!info.Data()->Int32Value(context).To(&type))
        {
            isolate->ThrowError("bad call");
            return;
        }
        int32_t rate = 1;
        int extra_arg_index = 1;
        bool loop = false;
        switch ((InternalTimerType::Type) type)
        {
        // interval & timeout have 2 arguments (at least)
        case InternalTimerType::Interval: loop = true;
        case InternalTimerType::Timeout:  // NOLINT(clang-diagnostic-implicit-fallthrough)
            if (!info[1]->IsUndefined() && !info[1]->Int32Value(context).To(&rate))
            {
                isolate->ThrowError("bad time");
                return;
            }
            extra_arg_index = 2;
            break;
        // immediate has 1 argument (at least)
        default: break;
        }

        Environment* environment = Environment::wrap(isolate);
        v8::Local<v8::Function> func = info[0].As<v8::Function>();
        internal::TimerHandle handle;

        if (argc > extra_arg_index)
        {
            JavaScriptTimerAction action(v8::Global<v8::Function>(isolate, func), argc - extra_arg_index);
            for (int index = extra_arg_index; index < argc; ++index)
            {
                action.store(index - extra_arg_index, v8::Global<v8::Value>(isolate, info[index]));
            }
            environment->get_timer_manager().set_timer(handle, std::move(action), rate, loop);
            info.GetReturnValue().Set((uint32_t) handle);
        }
        else
        {
            environment->get_timer_manager().set_timer(handle, JavaScriptTimerAction(v8::Global<v8::Function>(isolate, func), 0), rate, loop);
            info.GetReturnValue().Set((uint32_t) handle);
        }
    }

    void Builtins::_clear_timer(const v8::FunctionCallbackInfo<v8::Value>& info)
    {
        v8::Isolate* isolate = info.GetIsolate();
        if (info.Length() < 1 || !info[0]->IsUint32())
        {
            isolate->ThrowError("bad argument");
            return;
        }

        v8::Local<v8::Context> context = isolate->GetCurrentContext();
        uint32_t handle = 0;
        if (!info[0]->Uint32Value(context).To(&handle))
        {
            isolate->ThrowError("bad timer");
            return;
        }
        Environment* environment = Environment::wrap(isolate);
        environment->get_timer_manager().clear_timer((internal::TimerHandle) (internal::Index32) handle);
    }

}
