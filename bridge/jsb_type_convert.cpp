#include "jsb_type_convert.h"
#include "jsb_environment.h"
#include "jsb_realm.h"

namespace jsb
{
    template<typename T>
    static bool try_convert_array(v8::Isolate* isolate, const v8::Local<v8::Context>& context, v8::Local<v8::Value> p_val, Variant& r_packed)
    {
        if constexpr (GetTypeInfo<T>::METADATA == GodotTypeInfo::METADATA_INT_IS_UINT8)
        {
            if (p_val->IsArrayBuffer())
            {
                r_packed = V8Helper::to_packed_byte_array(isolate, p_val.As<v8::ArrayBuffer>());
                return true;
            }
        }

#if JSB_IMPLICIT_PACKED_ARRAY_CONVERSION
        if (!p_val->IsArray())
        {
            return false;
        }

        const v8::Local<v8::Array> array = p_val.As<v8::Array>();
        const uint32_t len = array->Length();
        Vector<T> packed;
        packed.resize((int)len);
        for (uint32_t index = 0; index < len; ++index)
        {
            v8::Local<v8::Value> element;
            Variant element_var;
            if (array->Get(context, index).ToLocal(&element) && TypeConvert::js_to_gd_var(isolate, context, element, GetTypeInfo<T>::VARIANT_TYPE, element_var))
            {
                packed.write[index] = element_var;
            }
            else
            {
                // be cautious here, we silently omit conversion failures
                packed.write[index] = T {};
                JSB_LOG(Warning, "failed to convert array element %d (strictly, as %s), it'll be left as the default value", index, Variant::get_type_name(GetTypeInfo<T>::VARIANT_TYPE));
            }
        }
        r_packed = packed;
        return true;
#else
        return false;
#endif
    }

    static bool try_convert_array_any(v8::Isolate* isolate, const v8::Local<v8::Context>& context, v8::Local<v8::Value> p_val, Variant& r_packed)
    {
#if JSB_IMPLICIT_PACKED_ARRAY_CONVERSION
        if (!p_val->IsArray())
        {
            return false;
        }

        const v8::Local<v8::Array> array = p_val.As<v8::Array>();
        const uint32_t len = array->Length();
        Array packed;
        packed.resize((int)len);
        for (uint32_t index = 0; index < len; ++index)
        {
            v8::Local<v8::Value> element;
            Variant element_var;
            if (array->Get(context, index).ToLocal(&element) && TypeConvert::js_to_gd_var(isolate, context, element, element_var))
            {
                packed.set((int) index, element_var);
            }
            else
            {
                // be cautious here, we silently omit conversion failures
                packed.set((int) index, {});
                JSB_LOG(Warning, "failed to convert array element %d (loosely), it'll be left as the default value", index);
            }
        }
        r_packed = packed;
        return true;
#else
        return false;
#endif
    }

    // translate js val into gd variant with an expected type
    bool TypeConvert::js_to_gd_var(v8::Isolate* isolate, const v8::Local<v8::Context>& context, const v8::Local<v8::Value>& p_jval, Variant::Type p_type, Variant& r_cvar)
    {
        switch (p_type)
        {
        case Variant::FLOAT:
            if (p_jval->IsNumber())
            {
                r_cvar = p_jval->NumberValue(context).ToChecked();
                return true;
            }
            return false;
        case Variant::INT:
            // strict?
            if (p_jval->IsInt32()) { r_cvar = p_jval->Int32Value(context).ToChecked(); return true; }
            if (p_jval->IsNumber()) { r_cvar = (int64_t) p_jval->NumberValue(context).ToChecked(); return true; }
            return false;
        case Variant::OBJECT:
            {
                if (!p_jval->IsObject())
                {
                    return false;
                }
                v8::Local<v8::Object> self = p_jval.As<v8::Object>();
                if (self->InternalFieldCount() != IF_ObjectFieldCount)
                {
                    return false;
                }

                void* pointer = self->GetAlignedPointerFromInternalField(IF_Pointer);
                if (!Environment::verify_godot_object(isolate, pointer))
                {
                    return false;
                }
                r_cvar = (Object*) pointer;
                return true;
            }
        case Variant::BOOL:
            // strict?
            if (p_jval->IsBoolean()) { r_cvar = p_jval->BooleanValue(isolate); return true; }
            return false;
        case Variant::STRING:
            if (p_jval->IsString())
            {
                StringName sn;
                if (Environment::wrap(isolate)->get_string_name_cache().try_get_string_name(isolate, p_jval, sn))
                {
                    r_cvar = (String) sn;
                    return true;
                }
                r_cvar = V8Helper::to_string(isolate, p_jval.As<v8::String>());
                return true;
            }
            return false;
        case Variant::STRING_NAME:
            // cache the JSValue and StringName pair because the expected type is StringName
            if (p_jval->IsString())
            {
                r_cvar = Environment::wrap(isolate)->get_string_name(p_jval.As<v8::String>());
                return true;
            }
            goto FALLBACK_TO_VARIANT;  // NOLINT(cppcoreguidelines-avoid-goto, hicpp-avoid-goto)
        case Variant::NODE_PATH:
            if (p_jval->IsString())
            {
                StringName sn;
                if (Environment::wrap(isolate)->get_string_name_cache().try_get_string_name(isolate, p_jval, sn))
                {
                    r_cvar = NodePath((String) sn);
                    return true;
                }
                r_cvar = NodePath(V8Helper::to_string(isolate, p_jval));
                return true;
            }
            goto FALLBACK_TO_VARIANT;  // NOLINT(cppcoreguidelines-avoid-goto, hicpp-avoid-goto)
        case Variant::PACKED_BYTE_ARRAY:    if (try_convert_array<uint8_t>(isolate, context, p_jval, r_cvar)) return true; goto FALLBACK_TO_VARIANT;  // NOLINT(cppcoreguidelines-avoid-goto, hicpp-avoid-goto)
        case Variant::PACKED_INT32_ARRAY:   if (try_convert_array<int32_t>(isolate, context, p_jval, r_cvar)) return true; goto FALLBACK_TO_VARIANT;  // NOLINT(cppcoreguidelines-avoid-goto, hicpp-avoid-goto)
        case Variant::PACKED_INT64_ARRAY:   if (try_convert_array<int64_t>(isolate, context, p_jval, r_cvar)) return true; goto FALLBACK_TO_VARIANT;  // NOLINT(cppcoreguidelines-avoid-goto, hicpp-avoid-goto)
        case Variant::PACKED_FLOAT32_ARRAY: if (try_convert_array<float>(isolate, context, p_jval, r_cvar))   return true; goto FALLBACK_TO_VARIANT;  // NOLINT(cppcoreguidelines-avoid-goto, hicpp-avoid-goto)
        case Variant::PACKED_FLOAT64_ARRAY: if (try_convert_array<double>(isolate, context, p_jval, r_cvar))  return true; goto FALLBACK_TO_VARIANT;  // NOLINT(cppcoreguidelines-avoid-goto, hicpp-avoid-goto)
        case Variant::PACKED_STRING_ARRAY:  if (try_convert_array<String>(isolate, context, p_jval, r_cvar))  return true; goto FALLBACK_TO_VARIANT;  // NOLINT(cppcoreguidelines-avoid-goto, hicpp-avoid-goto)
        case Variant::PACKED_VECTOR2_ARRAY: if (try_convert_array<Vector2>(isolate, context, p_jval, r_cvar)) return true; goto FALLBACK_TO_VARIANT;  // NOLINT(cppcoreguidelines-avoid-goto, hicpp-avoid-goto)
        case Variant::PACKED_VECTOR3_ARRAY: if (try_convert_array<Vector3>(isolate, context, p_jval, r_cvar)) return true; goto FALLBACK_TO_VARIANT;  // NOLINT(cppcoreguidelines-avoid-goto, hicpp-avoid-goto)
        case Variant::PACKED_COLOR_ARRAY:   if (try_convert_array<Color>(isolate, context, p_jval, r_cvar))   return true; goto FALLBACK_TO_VARIANT;  // NOLINT(cppcoreguidelines-avoid-goto, hicpp-avoid-goto)
        case Variant::ARRAY:                if (try_convert_array_any(isolate, context, p_jval, r_cvar))      return true; goto FALLBACK_TO_VARIANT;  // NOLINT(cppcoreguidelines-avoid-goto, hicpp-avoid-goto)
        // math types
        case Variant::VECTOR2:
        case Variant::VECTOR2I:
        case Variant::RECT2:
        case Variant::RECT2I:
        case Variant::VECTOR3:
        case Variant::VECTOR3I:
        case Variant::TRANSFORM2D:
        case Variant::VECTOR4:
        case Variant::VECTOR4I:
        case Variant::PLANE:
        case Variant::QUATERNION:
        case Variant::AABB:
        case Variant::BASIS:
        case Variant::TRANSFORM3D:
        case Variant::PROJECTION:

        // misc types
        case Variant::COLOR:
        case Variant::RID:
        case Variant::CALLABLE:
        case Variant::SIGNAL:
        case Variant::DICTIONARY:
            {
                FALLBACK_TO_VARIANT:
                if (!p_jval->IsObject())
                {
                    return false;
                }
                v8::Local<v8::Object> self = p_jval.As<v8::Object>();
                if (self->InternalFieldCount() != IF_VariantFieldCount)
                {
                    return false;
                }

                void* pointer = self->GetAlignedPointerFromInternalField(IF_Pointer);
                r_cvar = *(Variant*) pointer;
                return true;
            }
        case Variant::NIL:
            //NOTE (instead of prompting a nil value) the type NIL usually means a Variant parameter accepted by a godot method
            return js_to_gd_var(isolate, context, p_jval, r_cvar);
        default: return false;
        }
    }

    bool TypeConvert::gd_var_to_js(v8::Isolate* isolate, const v8::Local<v8::Context>& context, const Variant& p_cvar, Variant::Type p_type, v8::Local<v8::Value>& r_jval)
    {
        switch (p_type)
        {
        case Variant::FLOAT:
            {
                r_jval = v8::Number::New(isolate, p_cvar);
                return true;
            }
        case Variant::INT:
            {
                const int64_t raw_val = p_cvar;
                jsb_verify_int64(raw_val, "");
                r_jval = V8Helper::to_int32(isolate, raw_val);
                return true;
            }
        case Variant::OBJECT:
            {
                //TODO is it OK in this way to transfer local handle to rval?
                v8::Local<v8::Object> jobj;
                Object* gd_obj = (Object*) p_cvar;
                if (unlikely(!gd_obj))
                {
                    r_jval = v8::Null(isolate);
                    return true;
                }
                if (gd_obj_to_js(isolate, context, gd_obj, jobj))
                {
                    r_jval = jobj;
                    return true;
                }
                return false;
            }
        case Variant::BOOL: r_jval = v8::Boolean::New(isolate, p_cvar); return true;
        case Variant::STRING:
            {
                //TODO optimize with cache?
                const String raw_val = p_cvar;
                const CharString repr_val = raw_val.utf8();
                r_jval = v8::String::NewFromUtf8(isolate, repr_val.get_data(), v8::NewStringType::kNormal, repr_val.length()).ToLocalChecked();
                return true;
            }
        case Variant::STRING_NAME:
            {
                r_jval = Environment::wrap(isolate)->get_string_value((StringName) p_cvar);
                return true;
            }
        // math types
        case Variant::VECTOR2:
        case Variant::VECTOR2I:
        case Variant::RECT2:
        case Variant::RECT2I:
        case Variant::VECTOR3:
        case Variant::VECTOR3I:
        case Variant::TRANSFORM2D:
        case Variant::VECTOR4:
        case Variant::VECTOR4I:
        case Variant::PLANE:
        case Variant::QUATERNION:
        case Variant::AABB:
        case Variant::BASIS:
        case Variant::TRANSFORM3D:
        case Variant::PROJECTION:

        // misc types
        case Variant::COLOR:
        case Variant::NODE_PATH:
        case Variant::RID:
        case Variant::CALLABLE:
        case Variant::SIGNAL:
        case Variant::DICTIONARY:
        case Variant::ARRAY:

        // typed arrays
        case Variant::PACKED_BYTE_ARRAY:
        case Variant::PACKED_INT32_ARRAY:
        case Variant::PACKED_INT64_ARRAY:
        case Variant::PACKED_FLOAT32_ARRAY:
        case Variant::PACKED_FLOAT64_ARRAY:
        case Variant::PACKED_STRING_ARRAY:
        case Variant::PACKED_VECTOR2_ARRAY:
        case Variant::PACKED_VECTOR3_ARRAY:
        case Variant::PACKED_COLOR_ARRAY:
            {
                jsb_checkf(Variant::can_convert(p_cvar.get_type(), p_type), "variant type can't convert to %s from %s", Variant::get_type_name(p_type), Variant::get_type_name(p_cvar.get_type()));
                Realm* realm = Realm::wrap(context);
                NativeClassID class_id;
                if (const NativeClassInfo* class_info = realm->_expose_godot_primitive_class(p_type, &class_id))
                {
                    jsb_check(class_info->type == NativeClassType::GodotPrimitive);
                    v8::Local<v8::FunctionTemplate> jtemplate = class_info->template_.Get(isolate);
                    r_jval = jtemplate->InstanceTemplate()->NewInstance(context).ToLocalChecked();
                    jsb_check(r_jval.As<v8::Object>()->InternalFieldCount() == IF_VariantFieldCount);

                    Environment* environment = Environment::wrap(isolate);
                    environment->bind_valuetype(class_id, Environment::alloc_variant(p_cvar), r_jval.As<v8::Object>());
                    return true;
                }
                return false;
            }
        case Variant::NIL:
            if (const Variant::Type var_type = p_cvar.get_type(); var_type != Variant::NIL)
            {
                return gd_var_to_js(isolate, context, p_cvar, var_type, r_jval);
            }
            r_jval = v8::Null(isolate);
            return true;
        default:
            {
                JSB_LOG(Error, "unhandled type %s", Variant::get_type_name(p_type));
                return false;
            }
        }
    }

    bool TypeConvert::gd_obj_to_js(v8::Isolate* isolate, const v8::Local<v8::Context>& context, Object* p_godot_obj, v8::Local<v8::Object>& r_jval)
    {
        jsb_check(p_godot_obj);
        Environment* environment = Environment::wrap(isolate);
        if (environment->get_object(p_godot_obj, r_jval))
        {
            return true;
        }

        // freshly bind existing gd object (not constructed in javascript)
        const StringName& class_name = p_godot_obj->get_class_name();
        Realm* realm = Realm::wrap(context);
        if (const NativeClassID class_id = realm->_expose_godot_class(class_name))
        {
            v8::Local<v8::FunctionTemplate> jtemplate = environment->get_native_class(class_id).template_.Get(isolate);
            r_jval = jtemplate->InstanceTemplate()->NewInstance(context).ToLocalChecked();
            jsb_check(r_jval->InternalFieldCount() == IF_ObjectFieldCount);

            if (p_godot_obj->is_ref_counted())
            {
                //NOTE in the case this godot object created by a godot method which returns a Ref<T>,
                //     it's `refcount_init` will be zero after the object pointer assigned to a Variant.
                //     we need to resurrect the object from this special state, or it will be a dangling pointer.
                if (((RefCounted*) p_godot_obj)->init_ref())
                {
                    // great, it's resurrected.
                }
            }

            // the lifecycle will be managed by javascript runtime, DO NOT DELETE it externally
            environment->bind_godot_object(class_id, p_godot_obj, r_jval.As<v8::Object>());
            return true;
        }
        JSB_LOG(Error, "failed to expose godot class '%s'", class_name);
        return false;
    }

    bool TypeConvert::js_to_gd_var(v8::Isolate* isolate, const v8::Local<v8::Context>& context, const v8::Local<v8::Value>& p_jval, Variant& r_cvar)
    {
        if (p_jval.IsEmpty() || p_jval->IsNullOrUndefined())
        {
            r_cvar = {};
            return true;
        }
        if (p_jval->IsBoolean())
        {
            r_cvar = p_jval->BooleanValue(isolate);
            return true;
        }
        if (p_jval->IsInt32())
        {
            int32_t val;
            if (p_jval->Int32Value(context).To(&val))
            {
                r_cvar = (int64_t) val;
                return true;
            }
        }
        if (p_jval->IsUint32())
        {
            uint32_t val;
            if (p_jval->Uint32Value(context).To(&val))
            {
                r_cvar = (int64_t) val;
                return true;
            }
        }
        if (p_jval->IsNumber())
        {
            double val;
            if (p_jval->NumberValue(context).To(&val))
            {
                r_cvar = (double) val;
                return true;
            }
        }
        if (p_jval->IsString())
        {
            // directly return from cached StringName only if it exists
            StringName sn;
            if (Environment::wrap(isolate)->get_string_name_cache().try_get_string_name(isolate, p_jval, sn))
            {
                r_cvar = sn;
                return true;
            }
            r_cvar = V8Helper::to_string(isolate, p_jval.As<v8::String>());
            return true;
        }
        // is it proper to convert a ArrayBuffer into Vector<uint8_t>?
        if (p_jval->IsArrayBuffer())
        {
            r_cvar = V8Helper::to_packed_byte_array(isolate, p_jval.As<v8::ArrayBuffer>());
            return true;
        }
        //TODO
        // if (p_jval->IsFunction())
        // {
        // }
        if (p_jval->IsObject())
        {
            v8::Local<v8::Object> self = p_jval.As<v8::Object>();
            switch (self->InternalFieldCount())
            {
            case IF_VariantFieldCount: { r_cvar = *(Variant*) self->GetAlignedPointerFromInternalField(IF_Pointer); return true; }
            case IF_ObjectFieldCount:
                {
                    void* pointer = self->GetAlignedPointerFromInternalField(IF_Pointer);
                    if (!Environment::verify_godot_object(isolate, pointer))
                    {
                        return false;
                    }
                    r_cvar = (Object*) pointer;
                    return true;
                }
            default: return false;
            }
        }

        JSB_LOG(Error, "js_to_gd_var: unhandled type");
        return false;
    }

    bool TypeConvert::can_convert_strict(v8::Isolate* isolate, const v8::Local<v8::Context>& context, const v8::Local<v8::Value>& p_val, Variant::Type p_type)
    {
        switch (p_type)
        {
        case Variant::BOOL: { return p_val->IsBoolean(); }
        case Variant::FLOAT: // return p_val->IsNumber();
        case Variant::INT: { return p_val->IsNumber(); } //TODO find a better way to check integer type?
        case Variant::STRING:
        case Variant::STRING_NAME: { return p_val->IsString(); }
        case Variant::NODE_PATH:
            if (p_val->IsString())
            {
                return true;
            }
            goto FALLBACK_TO_VARIANT; // NOLINT(cppcoreguidelines-avoid-goto, hicpp-avoid-goto)
        case Variant::OBJECT:
            {
                if (!p_val->IsObject()) return false;
                v8::Local<v8::Object> self = p_val.As<v8::Object>();
                if (self->InternalFieldCount() != IF_ObjectFieldCount) return false;

#if JSB_VERIFY_GODOT_OBJECT
                void* pointer = self->GetAlignedPointerFromInternalField(IF_Pointer);
                if (!Environment::verify_godot_object(isolate, pointer))
                {
                    return false;
                }
#endif
                return true;
            }

        case Variant::ARRAY:
        // typed arrays
        case Variant::PACKED_BYTE_ARRAY:
        case Variant::PACKED_INT32_ARRAY:
        case Variant::PACKED_INT64_ARRAY:
        case Variant::PACKED_FLOAT32_ARRAY:
        case Variant::PACKED_FLOAT64_ARRAY:
        case Variant::PACKED_STRING_ARRAY:
        case Variant::PACKED_VECTOR2_ARRAY:
        case Variant::PACKED_VECTOR3_ARRAY:
        case Variant::PACKED_COLOR_ARRAY:
#if JSB_IMPLICIT_PACKED_ARRAY_CONVERSION
            //TODO is loose conversion check for JS primitive array as Godot array a bad idea?
            if (p_val->IsArray()) return true; goto FALLBACK_TO_VARIANT;  // NOLINT(cppcoreguidelines-avoid-goto, hicpp-avoid-goto)
#endif
        case Variant::VECTOR2:
        case Variant::VECTOR2I:
        case Variant::RECT2:
        case Variant::RECT2I:
        case Variant::VECTOR3:
        case Variant::VECTOR3I:
        case Variant::TRANSFORM2D:
        case Variant::VECTOR4:
        case Variant::VECTOR4I:
        case Variant::PLANE:
        case Variant::QUATERNION:
        case Variant::AABB:
        case Variant::BASIS:
        case Variant::TRANSFORM3D:
        case Variant::PROJECTION:

        // misc types
        case Variant::COLOR:
        case Variant::RID:
        case Variant::CALLABLE:
        case Variant::SIGNAL:
        case Variant::DICTIONARY:
            {
                FALLBACK_TO_VARIANT:
                if (!p_val->IsObject())
                {
                    return false;
                }
                v8::Local<v8::Object> self = p_val.As<v8::Object>();
                if (self->InternalFieldCount() != IF_VariantFieldCount)
                {
                    return false;
                }
                const Variant* target = (const Variant*) self->GetAlignedPointerFromInternalField(IF_Pointer);
                if (!target)
                {
                    return Variant::can_convert_strict(Variant::NIL, p_type);
                }
                return Variant::can_convert_strict(target->get_type(), p_type);
            }
        default: return false;
        }
    }

    bool TypeConvert::js_to_gd_obj(v8::Isolate* isolate, const v8::Local<v8::Context>& context, const v8::Local<v8::Value>& p_jval, Object*& r_godot_obj)
    {
        if (!p_jval->IsObject())
        {
            return false;
        }
        const v8::Local<v8::Object> self = p_jval.As<v8::Object>();
        if (self->InternalFieldCount() != IF_ObjectFieldCount)
        {
            return false;
        }

        void* pointer = self->GetAlignedPointerFromInternalField(IF_Pointer);
        if (!Environment::verify_godot_object(isolate, pointer))
        {
            return false;
        }
        r_godot_obj = (Object*) pointer;
        return true;
    }

}
