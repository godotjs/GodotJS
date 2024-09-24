#include "jsb_builtins.h"

#include "jsb_environment.h"
#include "jsb_amd_module_loader.h"
#include "jsb_bridge_helper.h"

namespace jsb
{
    namespace InternalTimerType { enum Type : uint8_t { Interval, Timeout, Immediate, }; }

    static void _generate_stacktrace(v8::Isolate* isolate, String& r_stacktrace, internal::SourcePosition& r_source_position)
    {
        const impl::TryCatch try_catch(isolate);
        isolate->ThrowError("");
        if (try_catch.has_caught())
        {
            r_stacktrace = BridgeHelper::get_stacktrace(try_catch, r_source_position);
        }
    }

    template<internal::ELogSeverity::Type ActiveSeverity>
    void _print(const v8::FunctionCallbackInfo<v8::Value>& info)
    {
        if constexpr (ActiveSeverity < internal::ELogSeverity::JSB_MIN_LOG_LEVEL) return;

        v8::Isolate* isolate = info.GetIsolate();
        v8::Local<v8::Context> context = isolate->GetCurrentContext();
        StringBuilder sb;

        int index;
        if constexpr (ActiveSeverity == internal::ELogSeverity::Assert)
        {
            // check assertion
            if (info[0]->BooleanValue(isolate))
            {
                return;
            }

            sb.append("[JS] Assertion failure:");
            index = 1;
        }
        else
        {
            sb.append("[JS]");
            index = 0;
        }

        // join all data
        for (const int n = info.Length(); index < n; ++index)
        {
            if (String str = BridgeHelper::stringify(isolate, info[index]); str.length() > 0)
            {
                sb.append(" ");
                sb.append(str);
            }
        }

        if constexpr (ActiveSeverity == internal::ELogSeverity::Assert)
        {
            isolate->ThrowError(impl::Helper::new_string(isolate, sb.as_string()));
            return;
        }

        String stacktrace;
        internal::SourcePosition source_position;

        if constexpr (ActiveSeverity >= internal::ELogSeverity::Trace)
        {
            _generate_stacktrace(isolate, stacktrace, source_position);
        }

        if constexpr (ActiveSeverity == internal::ELogSeverity::Warning)
        {
            const String& text = sb.as_string();
            internal::IConsoleOutput::internal_write(ActiveSeverity, text);
            _err_print_error(
                source_position.function.utf8().get_data(), source_position.filename.utf8().get_data(), source_position.line,
                text.utf8().get_data(),
                false, ERR_HANDLER_WARNING);
            return;
        }
        if constexpr (ActiveSeverity == internal::ELogSeverity::Error)
        {
            const String& text = sb.as_string();
            internal::IConsoleOutput::internal_write(ActiveSeverity, text);
            _err_print_error(
                source_position.function.utf8().get_data(), source_position.filename.utf8().get_data(), source_position.line,
                text.utf8().get_data(),
                true, ERR_HANDLER_ERROR);
            return;
        }
        if constexpr (ActiveSeverity == internal::ELogSeverity::Trace)
        {
            if (!stacktrace.is_empty())
            {
                sb.append("\n");
                sb.append(stacktrace);
            }
            const String& text = sb.as_string();
            internal::IConsoleOutput::internal_write(ActiveSeverity, text);
            print_line(text);
            return;
        }

        // trivial prints
        {
            const String& text = sb.as_string();
            internal::IConsoleOutput::internal_write(ActiveSeverity, text);
            print_line(text);
        }
    }

    void Builtins::register_(const v8::Local<v8::Context>& context, const v8::Local<v8::Object>& self)
    {
        v8::Isolate* isolate = context->GetIsolate();

        // minimal console functions support
        {
            v8::Local<v8::Object> console_obj = v8::Object::New(isolate);

            self->Set(context, impl::Helper::new_string_ascii(isolate, "console"), console_obj).Check();
            console_obj->Set(context, impl::Helper::new_string_ascii(isolate, "log"), v8::Function::New(context, _print<internal::ELogSeverity::Log>).ToLocalChecked()).Check();
            console_obj->Set(context, impl::Helper::new_string_ascii(isolate, "info"), v8::Function::New(context, _print<internal::ELogSeverity::Info>).ToLocalChecked()).Check();
            console_obj->Set(context, impl::Helper::new_string_ascii(isolate, "debug"), v8::Function::New(context, _print<internal::ELogSeverity::Debug>).ToLocalChecked()).Check();
            console_obj->Set(context, impl::Helper::new_string_ascii(isolate, "warn"), v8::Function::New(context, _print<internal::ELogSeverity::Warning>).ToLocalChecked()).Check();
            console_obj->Set(context, impl::Helper::new_string_ascii(isolate, "error"), v8::Function::New(context, _print<internal::ELogSeverity::Error>).ToLocalChecked()).Check();
            console_obj->Set(context, impl::Helper::new_string_ascii(isolate, "assert"), v8::Function::New(context, _print<internal::ELogSeverity::Assert>).ToLocalChecked()).Check();
            console_obj->Set(context, impl::Helper::new_string_ascii(isolate, "trace"), v8::Function::New(context, _print<internal::ELogSeverity::Trace>).ToLocalChecked()).Check();
        }

        // the root 'require' function
        {
            Environment* env = Environment::wrap(context);
            v8::Local<v8::Function> require_func = v8::Function::New(context, _require).ToLocalChecked();
            self->Set(context, impl::Helper::new_string_ascii(isolate, "require"), require_func).Check();
            self->Set(context, impl::Helper::new_string_ascii(isolate, "define"), v8::Function::New(context, _define).ToLocalChecked()).Check();
            require_func->Set(context, impl::Helper::new_string_ascii(isolate, "cache"), env->get_module_cache().unwrap(isolate)).Check();
            require_func->Set(context, impl::Helper::new_string_ascii(isolate, "moduleId"), v8::String::Empty(isolate)).Check();
        }

        //TODO the root 'import' function (async module loading?)
        {
        }

        // essential timer support
        {
            self->Set(context, impl::Helper::new_string_ascii(isolate, "setInterval"), v8::Function::New(context, _set_timer, v8::Int32::New(isolate, InternalTimerType::Interval)).ToLocalChecked()).Check();
            self->Set(context, impl::Helper::new_string_ascii(isolate, "setTimeout"), v8::Function::New(context, _set_timer, v8::Int32::New(isolate, InternalTimerType::Timeout)).ToLocalChecked()).Check();
            self->Set(context, impl::Helper::new_string_ascii(isolate, "setImmediate"), v8::Function::New(context, _set_timer, v8::Int32::New(isolate, InternalTimerType::Immediate)).ToLocalChecked()).Check();
            self->Set(context, impl::Helper::new_string_ascii(isolate, "clearInterval"), v8::Function::New(context, _clear_timer).ToLocalChecked()).Check();
        }
    }

    void Builtins::_define(const v8::FunctionCallbackInfo<v8::Value>& info)
    {
        v8::Isolate* isolate = info.GetIsolate();
        v8::Local<v8::Context> context = isolate->GetCurrentContext();

        if (info.Length() != 3 || !info[0]->IsString() || !info[1]->IsArray() || !info[2]->IsFunction())
        {
            isolate->ThrowError("bad param");
            return;
        }
        Environment* env = Environment::wrap(context);
        const StringName module_id_str = env->get_string_name(info[0].As<v8::String>());
        if (!internal::VariantUtil::is_valid_name(module_id_str))
        {
            isolate->ThrowError("bad module_id");
            return;
        }
        if (env->module_cache_.find(module_id_str))
        {
            isolate->ThrowError("conflicted module_id");
            return;
        }
        const v8::Local<v8::Array> deps_val = info[1].As<v8::Array>();
        Vector<String> deps;
        for (uint32_t index = 0, len = deps_val->Length(); index < len; ++index)
        {
            v8::Local<v8::Value> item;
            if (!deps_val->Get(context, index).ToLocal(&item) || !item->IsString())
            {
                isolate->ThrowError("bad param");
                return;
            }

            const String item_str = impl::Helper::to_string(isolate, item);;
            if (item_str.is_empty())
            {
                isolate->ThrowError("bad param");
                return;
            }
            deps.push_back(item_str);
        }
        JSB_LOG(VeryVerbose, "new AMD module loader %s deps: %s", module_id_str, String(", ").join(deps));
        env->add_module_loader<AMDModuleLoader>(module_id_str,
            deps, v8::Global<v8::Function>(isolate, info[2].As<v8::Function>()));
    }

    void Builtins::_require(const v8::FunctionCallbackInfo<v8::Value>& info)
    {
        JSB_BENCHMARK_SCOPE(JSRealm, _require);
        v8::Isolate* isolate = info.GetIsolate();
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
        const String parent_id = impl::Helper::to_string(isolate, info.Data());
        const String module_id = impl::Helper::to_string(isolate, arg0);
        Environment* env = Environment::wrap(context);
        if (const JavaScriptModule* module = env->_load_module(parent_id, module_id))
        {
            info.GetReturnValue().Set(module->exports);
        }
    }

    void Builtins::_set_timer(const v8::FunctionCallbackInfo<v8::Value>& info)
    {
        jsb_check(info.Data()->IsInt32());
        v8::Isolate* isolate = info.GetIsolate();
        const int argc = info.Length();
        if (argc < 1 || !info[0]->IsFunction())
        {
            isolate->ThrowError("bad argument");
            return;
        }

        v8::Local<v8::Context> context = isolate->GetCurrentContext();
        int32_t rate = 1;
        int extra_arg_index = 1;
        bool loop = false;
        switch ((InternalTimerType::Type) info.Data().As<v8::Int32>()->Value())
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
        const v8::Local<v8::Function> func = info[0].As<v8::Function>();
        internal::TimerHandle handle;

        if (argc > extra_arg_index)
        {
            JavaScriptTimerAction action(v8::Global<v8::Function>(isolate, func), argc - extra_arg_index);
            for (int index = extra_arg_index; index < argc; ++index)
            {
                action.store(index - extra_arg_index, v8::Global<v8::Value>(isolate, info[index]));
            }
            environment->get_timer_manager().set_timer(handle, std::move(action), rate, loop);
        }
        else
        {
            environment->get_timer_manager().set_timer(handle, JavaScriptTimerAction(v8::Global<v8::Function>(isolate, func), 0), rate, loop);
        }
        info.GetReturnValue().Set((int32_t) handle);
    }

    void Builtins::_clear_timer(const v8::FunctionCallbackInfo<v8::Value>& info)
    {
        v8::Isolate* isolate = info.GetIsolate();
        if (!info[0]->IsInt32())
        {
            isolate->ThrowError("bad argument");
            return;
        }

        const int32_t handle = info[0].As<v8::Int32>()->Value();
        Environment* environment = Environment::wrap(isolate);
        environment->get_timer_manager().clear_timer((internal::TimerHandle) handle);
    }

}
