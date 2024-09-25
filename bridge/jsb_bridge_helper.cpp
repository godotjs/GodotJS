#include "jsb_bridge_helper.h"

#include "jsb_environment.h"
#include "jsb_object_handle.h"

namespace jsb
{
    String BridgeHelper::stringify(v8::Isolate* isolate, const v8::Local<v8::Value>& p_val)
    {
        if (p_val->IsObject())
        {
            const Environment* environment = Environment::wrap(isolate);
            const v8::Local<v8::Object> self = p_val.As<v8::Object>();

            switch (self->InternalFieldCount())
            {
            case IF_VariantFieldCount:
                {
                    const Variant* variant = (Variant*) self->GetAlignedPointerFromInternalField(IF_Pointer);
                    const String type_name = Variant::get_type_name(variant->get_type());
                    return jsb_format("[%s %s]", type_name, variant->operator String());
                }
            case IF_ObjectFieldCount:
                {
                    void* pointer = self->GetAlignedPointerFromInternalField(IF_Pointer);
                    const NativeClassInfo* class_info = environment->find_object_class(pointer);
                    if (jsb_unlikely(!class_info))
                    {
                        return jsb_format("[dead_object @%s]", (uint64_t) pointer);
                    }
                    jsb_check(class_info->type == NativeClassType::GodotObject);
                    const NativeObjectID object_id = environment->get_object_id(pointer);
                    return jsb_format("[%s #%d @%s]", class_info->name, object_id, uitos((uint64_t) pointer));
                }
            default: break;
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
