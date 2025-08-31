#include "jsb_bridge_helper.h"

#include "jsb_environment.h"
#include "jsb_object_handle.h"
#include "jsb_type_convert.h"

namespace jsb
{
    String BridgeHelper::stringify(v8::Isolate* isolate, const v8::Local<v8::Value>& p_val)
    {
        if (p_val->IsObject())
        {
            Environment* environment = Environment::wrap(isolate);
            const v8::Local<v8::Object> self = p_val.As<v8::Object>();

            if (TypeConvert::is_variant(self))
            {
                const Variant* variant = (Variant*) self->GetAlignedPointerFromInternalField(IF_Pointer);
                const String type_name = Variant::get_type_name(variant->get_type());
                return jsb_format("[%s %s]", type_name, variant->operator String());
            }
            if (TypeConvert::is_object(self))
            {
                void* pointer = self->GetAlignedPointerFromInternalField(IF_Pointer);
                const NativeClassInfo* class_info = environment->find_object_class(pointer);
                if (jsb_unlikely(!class_info))
                {
                    return jsb_format("[dead_object @%s]", (uint64_t) pointer);
                }
                const StringName class_name = class_info->name;
                jsb_check(class_info->type == NativeClassType::GodotObject);
                const NativeObjectID object_id = environment->try_get_object_id(pointer);

                // case for script classes
                do
                {
                    v8::Local<v8::Value> cross_bind_sym;
                    const v8::Local<v8::Context> context = isolate->GetCurrentContext();
                    const v8::Local<v8::Value> prototype_val = self->GetPrototype();
                    if (prototype_val.IsEmpty() || !prototype_val->IsObject()) break;

                    // read script class id from the javascript Class object (the constructor object)
                    const v8::Local<v8::Object> prototype = prototype_val.As<v8::Object>();
                    const v8::Local<v8::Object> dt_base_obj = prototype->Get(context, jsb_name(environment, constructor)).ToLocalChecked().As<v8::Object>();
                    if (!dt_base_obj->Get(context, jsb_symbol(environment, ClassModuleId)).ToLocal(&cross_bind_sym) || !cross_bind_sym->IsString())
                    {
                        break;
                    }
                    const StringName script_module_id = environment->get_string_name(cross_bind_sym.As<v8::String>());
                    const JavaScriptModule* module = environment->get_module_cache().find(script_module_id);
                    if (!module)
                    {
                        break;
                    }
                    const ScriptClassInfoPtr script_class_info = environment->get_script_class(module->script_class_id);
                    return jsb_format("[Script:%s #%d @%s]", script_class_info->js_class_name, object_id, uitos((uint64_t) pointer));
                } while (false);

                // fallback to C++ classes
                return jsb_format("[%s #%d @%s]", class_name, object_id, uitos((uint64_t) pointer));
            }
        }

        return impl::Helper::to_string(isolate, p_val);
    }

    // Get full exception info (Message+Stacktrace)
    String BridgeHelper::get_exception(const impl::TryCatch& p_catch)
    {
        String message;
        String stacktrace;
        p_catch.get_message(&message, &stacktrace);
        stacktrace = Environment::wrap(p_catch.get_isolate())->get_source_map_cache().process_source_position(stacktrace, nullptr);
        return message.is_empty() ? stacktrace : (stacktrace.is_empty() ? message : message + "\n" + stacktrace);
    }

    // Get stacktrace info from exception
    String BridgeHelper::get_stacktrace(const impl::TryCatch& p_catch, internal::SourcePosition& r_position)
    {
        String stacktrace;
        p_catch.get_message(nullptr, &stacktrace);
        stacktrace = Environment::wrap(p_catch.get_isolate())->get_source_map_cache().process_source_position(stacktrace, &r_position);
        return stacktrace;
    }
}
