#include "jsb_v8_helper.h"

#include "jsb_environment.h"
#include "jsb_object_handle.h"

namespace jsb
{
    String V8Helper::stringify(v8::Isolate* isolate, const v8::Local<v8::Context>& context, const v8::Local<v8::Value>& p_jval)
    {
        if (p_jval->IsObject())
        {
            const Environment* environment = Environment::wrap(isolate);
            v8::Local<v8::Object> self = p_jval.As<v8::Object>();

            switch (self->InternalFieldCount())
            {
            case IF_VariantFieldCount:
                {
                    const Variant* variant = (Variant*) self->GetAlignedPointerFromInternalField(IF_Pointer);
                    const String type_name = Variant::get_type_name(variant->get_type());
                    return vformat("[%s %s]", type_name, variant->operator String());
                }
            case IF_ObjectFieldCount:
                {
                    void* pointer = self->GetAlignedPointerFromInternalField(IF_Pointer);
                    const NativeClassInfo* class_info = environment->find_object_class(pointer);
                    if (jsb_unlikely(!class_info))
                    {
                        return vformat("[dead_object @%s]", uitos((uint64_t) pointer));
                    }
                    jsb_check(class_info->type == NativeClassType::GodotObject);
                    const NativeObjectID object_id = environment->get_object_id(pointer);
                    return vformat("[%s #%s @%s]", class_info->name, uitos((uint64_t) object_id), uitos((uint64_t) pointer));
                }
            default: break;
            }
        }

        if (v8::String::Utf8Value str(isolate, p_jval); str.length() > 0)
        {
            return String::utf8(*str, str.length());
        }
        return String();
    }

}
