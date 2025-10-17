#include "jsb_essentials.h"
#include "jsb_timer_action.h"
#include "jsb_bridge_helper.h"
#include "jsb_environment.h"

namespace jsb
{
#if !JSB_WITH_ESSENTIALS
    void Essentials::register_(const v8::Local<v8::Context>& context, const v8::Local<v8::Object>& self)
    {
    }
#else
    namespace InternalTimerType { enum Type : uint8_t { Interval, Timeout, Immediate, }; }

    static void _generate_stacktrace(v8::Isolate* isolate, String& r_stacktrace, internal::SourcePosition& r_source_position)
    {
        const impl::TryCatch try_catch(isolate);
        jsb_throw(isolate, "");
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
            const String str = sb.as_string();
            impl::Helper::throw_error(isolate, str);
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
            const String text = sb.as_string();
            const CharString func_str = source_position.function.utf8();
            const CharString filename_str = source_position.filename.utf8();
            const CharString text_str = text.utf8();

            internal::IConsoleOutput::internal_write(ActiveSeverity, text);
            _err_print_error(
                func_str.get_data(), filename_str.get_data(), source_position.line,
                text_str.get_data(),
                false, ERR_HANDLER_WARNING);
            return;
        }
        if constexpr (ActiveSeverity == internal::ELogSeverity::Error)
        {
            const String text = sb.as_string();
            const CharString func_str = source_position.function.utf8();
            const CharString filename_str = source_position.filename.utf8();
            const CharString text_str = text.utf8();

            internal::IConsoleOutput::internal_write(ActiveSeverity, text);
            _err_print_error(
                func_str.get_data(), filename_str.get_data(), source_position.line,
                text_str.get_data(),
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
            const String text = sb.as_string();
            internal::IConsoleOutput::internal_write(ActiveSeverity, text);
            print_line(text);
            return;
        }

        // trivial prints
        {
            const String text = sb.as_string();
            internal::IConsoleOutput::internal_write(ActiveSeverity, text);
            print_line(text);
        }
    }

    template<InternalTimerType::Type TimerType>
    void _set_timer(const v8::FunctionCallbackInfo<v8::Value>& info)
    {
        v8::Isolate* isolate = info.GetIsolate();
        const int argc = info.Length();
        if (argc < 1 || !info[0]->IsFunction())
        {
            jsb_throw(isolate, "bad argument");
            return;
        }

        const v8::Local<v8::Context> context = isolate->GetCurrentContext();
        static constexpr int extra_arg_index = TimerType == InternalTimerType::Interval || TimerType == InternalTimerType::Timeout ? 2 : 1;
        static constexpr bool loop = TimerType == InternalTimerType::Interval;
        int32_t rate = 1;

        // interval & timeout have 2 arguments (at least)
        // immediate has 1 argument (at least)
        if constexpr (extra_arg_index == 2)
        {
            if (!info[1]->IsUndefined() && !info[1]->Int32Value(context).To(&rate))
            {
                jsb_throw(isolate, "bad time");
                return;
            }
        }

        const v8::Local<v8::Function> func = info[0].As<v8::Function>();
        internal::TimerHandle handle;

        if (argc > extra_arg_index)
        {
            JavaScriptTimerAction action(v8::Global<v8::Function>(isolate, func), argc - extra_arg_index);
            for (int index = extra_arg_index; index < argc; ++index)
            {
                action.store(index - extra_arg_index, v8::Global<v8::Value>(isolate, info[index]));
            }
            Environment::wrap(isolate)->get_timer_manager().set_timer(handle,
                std::move(action), rate, loop);
        }
        else
        {
            Environment::wrap(isolate)->get_timer_manager().set_timer(handle,
                JavaScriptTimerAction(v8::Global<v8::Function>(isolate, func), 0), rate > 0 ? rate : 0, loop);
        }
        // TODO: V8 update. Once we update V8 past 12.6.221 we can skip the cast to double
        info.GetReturnValue().Set((double) (int64_t) handle);
    }

    void _clear_timer(const v8::FunctionCallbackInfo<v8::Value>& info)
    {
        v8::Isolate* isolate = info.GetIsolate();
        if (!info[0]->IsInt32())
        {
            return;
        }

        const int32_t handle = info[0].As<v8::Int32>()->Value();
        Environment::wrap(isolate)->get_timer_manager().clear_timer((internal::TimerHandle) handle);
    }

    void _time(const v8::FunctionCallbackInfo<v8::Value>& info)
    {
        v8::Isolate* isolate = info.GetIsolate();
        if (!info[0]->IsUndefined() && !info[0]->IsString())
        {
            jsb_throw(isolate, "bad argument");
            return;
        }
        Environment* env = Environment::wrap(isolate);
        const v8::Local<v8::String> label = info[0]->IsUndefined() ? jsb_name(env, default) : info[0].As<v8::String>();
        JSTimerTags<uint64_t>& timer_tags = env->get_timer_tags();
        const auto res = timer_tags.tags.emplace(TStrongRef(isolate, label), OS::get_singleton()->get_ticks_usec());
        if (!res.second)
        {
            JSB_LOG(Warning, "timer tag '%s' already exists", impl::Helper::to_string(isolate, label));
        }
    }

    void _time_end(const v8::FunctionCallbackInfo<v8::Value>& info)
    {
        v8::Isolate* isolate = info.GetIsolate();
        if (!info[0]->IsUndefined() && !info[0]->IsString())
        {
            jsb_throw(isolate, "bad argument");
            return;
        }
        const uint64_t now = OS::get_singleton()->get_ticks_usec();
        Environment* env = Environment::wrap(isolate);
        const v8::Local<v8::String> label = info[0]->IsUndefined() ? jsb_name(env, default) : info[0].As<v8::String>();
        JSTimerTags<uint64_t>& timer_tags = env->get_timer_tags();
        const auto it = timer_tags.tags.find(TStrongRef(isolate, label));
        if (it != timer_tags.tags.end())
        {
            timer_tags.tags.erase(it);
            JSB_LOG(Info, "%s: %dms - timer ended",
                impl::Helper::to_string(isolate, label),
                (now - it->second) / 1000UL);
        }
        else
        {
            JSB_LOG(Warning, "timer tag '%s' not found", impl::Helper::to_string(isolate, label));
        }
    }

    void Essentials::register_(const v8::Local<v8::Context>& context, const v8::Local<v8::Object>& self)
    {
        v8::Isolate* isolate = context->GetIsolate();

        // minimal console functions support
        {
            v8::Local<v8::Object> console_obj = v8::Object::New(isolate);

            self->Set(context, impl::Helper::new_string_ascii(isolate, "console"), console_obj).Check();
            console_obj->Set(context, impl::Helper::new_string_ascii(isolate, "log"), JSB_NEW_FUNCTION(context, _print<internal::ELogSeverity::Log>, {})).Check();
            console_obj->Set(context, impl::Helper::new_string_ascii(isolate, "info"), JSB_NEW_FUNCTION(context, _print<internal::ELogSeverity::Info>, {})).Check();
            console_obj->Set(context, impl::Helper::new_string_ascii(isolate, "debug"), JSB_NEW_FUNCTION(context, _print<internal::ELogSeverity::Debug>, {})).Check();
            console_obj->Set(context, impl::Helper::new_string_ascii(isolate, "warn"), JSB_NEW_FUNCTION(context, _print<internal::ELogSeverity::Warning>, {})).Check();
            console_obj->Set(context, impl::Helper::new_string_ascii(isolate, "error"), JSB_NEW_FUNCTION(context, _print<internal::ELogSeverity::Error>, {})).Check();
            console_obj->Set(context, impl::Helper::new_string_ascii(isolate, "assert"), JSB_NEW_FUNCTION(context, _print<internal::ELogSeverity::Assert>, {})).Check();
            console_obj->Set(context, impl::Helper::new_string_ascii(isolate, "trace"), JSB_NEW_FUNCTION(context, _print<internal::ELogSeverity::Trace>, {})).Check();
            console_obj->Set(context, impl::Helper::new_string_ascii(isolate, "time"), JSB_NEW_FUNCTION(context, _time, {})).Check();
            console_obj->Set(context, impl::Helper::new_string_ascii(isolate, "timeEnd"), JSB_NEW_FUNCTION(context, _time_end, {})).Check();
        }

        //TODO the root 'import' function (async module loading?)
        {
        }

        // essential timer support
        {
            self->Set(context, impl::Helper::new_string_ascii(isolate, "setInterval"), JSB_NEW_FUNCTION(context, _set_timer<InternalTimerType::Interval>, {})).Check();
            self->Set(context, impl::Helper::new_string_ascii(isolate, "setTimeout"), JSB_NEW_FUNCTION(context, _set_timer<InternalTimerType::Timeout>, {})).Check();
            self->Set(context, impl::Helper::new_string_ascii(isolate, "setImmediate"), JSB_NEW_FUNCTION(context, _set_timer<InternalTimerType::Immediate>, {})).Check();
            self->Set(context, impl::Helper::new_string_ascii(isolate, "clearInterval"), JSB_NEW_FUNCTION(context, _clear_timer, {})).Check();
            self->Set(context, impl::Helper::new_string_ascii(isolate, "clearTimeout"), JSB_NEW_FUNCTION(context, _clear_timer, {})).Check();
            self->Set(context, impl::Helper::new_string_ascii(isolate, "clearImmediate"), JSB_NEW_FUNCTION(context, _clear_timer, {})).Check();
        }
    }
#endif

}
