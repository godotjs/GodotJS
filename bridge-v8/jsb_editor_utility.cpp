#include "jsb_editor_utility.h"

#include "jsb_primitive_bindings.h"
#include "core/core_constants.h"
#if TOOLS_ENABLED

// for windows api (like 'DeleteFileW')
#if WINDOWS_ENABLED
#   define WIN32_LEAN_AND_MEAN
#   include <windows.h>
#else
#   include <unistd.h>
#endif

#define JSB_STRINGIFY_2(a) #a
#define JSB_STRINGIFY(a) JSB_STRINGIFY_2(a)
namespace jsb_private
{
    //NOTE dummy functions only for compile-time check
    template <typename T>
    bool get_member_name(const T&);
    template <typename T>
    bool get_member_name(const volatile T&);
    template <typename R, typename... Args>
    bool get_member_name(R (*)(Args...));
}

#define JSB_GET_FIELD_NAME(TypeName, ValueName) ((void)sizeof(jsb_private::get_member_name(TypeName::ValueName)), JSB_STRINGIFY(ValueName))
#define JSB_GET_FIELD_NAME_I(InstName, ValueName) ((void)sizeof(jsb_private::get_member_name(std::decay_t<decltype(InstName)>::ValueName)), JSB_STRINGIFY(ValueName))
#define JSB_GET_FIELD_NAME_PRESET(InstName, ValueName) ((void)sizeof(jsb_private::get_member_name(std::decay_t<decltype(InstName)>::ValueName)), JSB_STRINGIFY(ValueName)), InstName.ValueName

namespace jsb
{
    namespace
    {
        v8::MaybeLocal<v8::String> S(v8::Isolate* isolate, const String& name)
        {
            const CharString char_string = name.utf8();
            return v8::String::NewFromUtf8(isolate, char_string.ptr(), v8::NewStringType::kNormal, char_string.length());
        }

        v8::MaybeLocal<v8::String> S(v8::Isolate* isolate, const char* name)
        {
            return v8::String::NewFromUtf8(isolate, name, v8::NewStringType::kNormal);
        }

        v8::MaybeLocal<v8::String> S(v8::Isolate* isolate, const StringName& name)
        {
            return S(isolate, (String) name);
        }

        v8::Local<v8::Value> build_int64(v8::Isolate* isolate, const String& field_name,  int64_t field_value)
        {
            const int32_t scaled_value = (int32_t) field_value;
            if (field_value != (int64_t) scaled_value)
            {
                JSB_LOG(Warning, "integer overflowed %s (%s) [reversible? %c]", field_name, itos(field_value), (int64_t)(double) field_value == field_value ? 'T' : 'F');
                return v8::Number::New(isolate, (double) field_value);
            }
            else
            {
                return v8::Int32::New(isolate, scaled_value);
            }
        }

        template<int N>
        void set_field(v8::Isolate* isolate, const v8::Local<v8::Context>& context, const v8::Local<v8::Object>& obj, const char (&field_name)[N], const v8::Local<v8::Value>& field_value)
        {
            obj->Set(context, v8::String::NewFromUtf8Literal(isolate, field_name), field_value).Check();
        }

        template<int N>
        void set_field(v8::Isolate* isolate, const v8::Local<v8::Context>& context, const v8::Local<v8::Object>& obj, const char (&field_name)[N], const StringName& field_value)
        {
            set_field(isolate, context, obj, field_name, S(isolate, field_value).ToLocalChecked());
        }

        template<int N>
        void set_field(v8::Isolate* isolate, const v8::Local<v8::Context>& context, const v8::Local<v8::Object>& obj, const char (&field_name)[N], const int32_t& field_value)
        {
            set_field(isolate, context, obj, field_name, v8::Int32::New(isolate, field_value));
        }

        template<int N>
        void set_field(v8::Isolate* isolate, const v8::Local<v8::Context>& context, const v8::Local<v8::Object>& obj, const char (&field_name)[N], const uint32_t& field_value)
        {
            set_field(isolate, context, obj, field_name, v8::Int32::NewFromUnsigned(isolate, field_value));
        }

        template<int N>
        void set_field(v8::Isolate* isolate, const v8::Local<v8::Context>& context, const v8::Local<v8::Object>& obj, const char (&field_name)[N], const String& field_value)
        {
            set_field(isolate, context, obj, field_name, S(isolate, field_value).ToLocalChecked());
        }

        template<int N>
        void set_field(v8::Isolate* isolate, const v8::Local<v8::Context>& context, const v8::Local<v8::Object>& obj, const char (&field_name)[N], const char*& field_value)
        {
            set_field(isolate, context, obj, field_name, S(isolate, field_value).ToLocalChecked());
        }

        template<int N>
        void set_field(v8::Isolate* isolate, const v8::Local<v8::Context>& context, const v8::Local<v8::Object>& obj, const char (&field_name)[N], const bool& field_value)
        {
            set_field(isolate, context, obj, field_name, v8::Boolean::New(isolate, field_value));
        }

        template<int N>
        void set_field(v8::Isolate* isolate, const v8::Local<v8::Context>& context, const v8::Local<v8::Object>& obj, const char (&field_name)[N], double field_value)
        {
            set_field(isolate, context, obj, field_name, v8::Number::New(isolate, field_value));
        }

        template<int N>
        void set_field(v8::Isolate* isolate, const v8::Local<v8::Context>& context, const v8::Local<v8::Object>& obj, const char (&field_name)[N], int64_t field_value)
        {
            set_field(isolate, context, obj, field_name, build_int64(isolate, field_name, field_value));
        }

        void build_property_info(v8::Isolate* isolate, const v8::Local<v8::Context>& context, const PropertyInfo& property_info, const v8::Local<v8::Object>& object)
        {
            set_field(isolate, context, object, "name", property_info.name);
            set_field(isolate, context, object, "type", property_info.type);
            set_field(isolate, context, object, "class_name", property_info.class_name);
            set_field(isolate, context, object, "hint", property_info.hint);
            set_field(isolate, context, object, "hint_string", property_info.hint_string);
            set_field(isolate, context, object, "usage", property_info.usage);
        }

        struct FPrimitiveGetSetInfo
        {
            StringName name;
            Variant::Type type;
        };

        struct FArgumentInfo
        {
            String name;
            Variant::Type type;
        };

        struct FConstructorInfo
        {
            Vector<FArgumentInfo> arguments;
        };

        void build_property_info(v8::Isolate* isolate, const v8::Local<v8::Context>& context, const StringName& property_name, const FPrimitiveGetSetInfo& property_info, const v8::Local<v8::Object>& object)
        {
            set_field(isolate, context, object, "name", property_name);
            set_field(isolate, context, object, "type", property_info.type);
        }

        void build_property_info(v8::Isolate* isolate, const v8::Local<v8::Context>& context, const StringName& property_name, const ClassDB::PropertySetGet& property_info, const v8::Local<v8::Object>& object)
        {
            set_field(isolate, context, object, "name", property_name);
            set_field(isolate, context, object, "type", property_info.type);
            set_field(isolate, context, object, "setter", property_info.setter);
            set_field(isolate, context, object, "getter", property_info.getter);
        }

        void build_constructor_info(v8::Isolate* isolate, const v8::Local<v8::Context>& context, const FConstructorInfo& constructor_info, const v8::Local<v8::Object>& object)
        {
            const int argc = constructor_info.arguments.size();
            v8::Local<v8::Array> args_obj = v8::Array::New(isolate, argc);
            for (int index = 0; index < argc; ++index)
            {
                const FArgumentInfo& argument_info = constructor_info.arguments[index];
                v8::Local<v8::Object> arg_obj = v8::Object::New(isolate);
                set_field(isolate, context, arg_obj, "name", argument_info.name);
                set_field(isolate, context, arg_obj, "type", argument_info.type);
                args_obj->Set(context, index, arg_obj);
            }
            set_field(isolate, context, object, "arguments", args_obj);
        }

        void build_method_info(v8::Isolate* isolate, const v8::Local<v8::Context>& context, MethodBind const* method_bind, const v8::Local<v8::Object>& object)
        {
            set_field(isolate, context, object, "id", method_bind->get_method_id());
            set_field(isolate, context, object, "name", method_bind->get_name());
            set_field(isolate, context, object, "hint_flags", method_bind->get_hint_flags());
            set_field(isolate, context, object, "is_static", method_bind->is_static());
            set_field(isolate, context, object, "is_const", method_bind->is_const());
            set_field(isolate, context, object, "is_vararg", method_bind->is_vararg());
            // set_field(isolate, context, object, "has_return", method_bind->has_return());
            set_field(isolate, context, object, "argument_count", method_bind->get_argument_count());

            if (method_bind->has_return())
            {
                const PropertyInfo& return_info = method_bind->get_return_info();
                v8::Local<v8::Object> property_info_obj = v8::Object::New(isolate);
                build_property_info(isolate, context, return_info, property_info_obj);
                set_field(isolate, context, object, "return_", property_info_obj);
            }

            const int argc = method_bind->get_argument_count();
            v8::Local<v8::Array> args_obj = v8::Array::New(isolate, argc);
            for (int index = 0; index < argc; ++index)
            {
                const PropertyInfo& arg_info = method_bind->get_argument_info(index);
                v8::Local<v8::Object> property_info_obj = v8::Object::New(isolate);
                build_property_info(isolate, context, arg_info, property_info_obj);
                args_obj->Set(context, index, property_info_obj);
            }
            set_field(isolate, context, object, "args_", args_obj);
        }

        void build_method_info(v8::Isolate* isolate, const v8::Local<v8::Context>& context, const MethodInfo& method_info, const v8::Local<v8::Object>& object)
        {
            set_field(isolate, context, object, "id", method_info.id);
            set_field(isolate, context, object, "name", method_info.name);
            set_field(isolate, context, object, "hint_flags", method_info.flags);
            set_field(isolate, context, object, "is_static", method_info.flags & METHOD_FLAG_STATIC);
            set_field(isolate, context, object, "is_const", method_info.flags & METHOD_FLAG_CONST);
            set_field(isolate, context, object, "is_vararg", method_info.flags & METHOD_FLAG_VARARG);
            // set_field(isolate, context, object, "has_return", method_bind->has_return());
            set_field(isolate, context, object, "argument_count", method_info.arguments.size());

            if (method_info.return_val.type != Variant::NIL)
            {
                const PropertyInfo& return_info = method_info.return_val;
                v8::Local<v8::Object> property_info_obj = v8::Object::New(isolate);
                build_property_info(isolate, context, return_info, property_info_obj);
                set_field(isolate, context, object, "return_", property_info_obj);
            }

            const int argc = method_info.arguments.size();
            v8::Local<v8::Array> args_obj = v8::Array::New(isolate, argc);
            for (int index = 0; index < argc; ++index)
            {
                const PropertyInfo& arg_info = method_info.arguments[index];
                v8::Local<v8::Object> property_info_obj = v8::Object::New(isolate);
                build_property_info(isolate, context, arg_info, property_info_obj);
                args_obj->Set(context, index, property_info_obj);
            }
            set_field(isolate, context, object, "args_", args_obj);
        }

        void build_enum_info(v8::Isolate* isolate, const v8::Local<v8::Context>& context, const ClassDB::ClassInfo::EnumInfo& enum_info, const v8::Local<v8::Object>& object)
        {
            const int num = enum_info.constants.size();
            v8::Local<v8::Array> constants_obj = v8::Array::New(isolate, num);
            for (int index = 0; index < num; ++index)
            {
                const StringName& name = enum_info.constants[index];
                constants_obj->Set(context, index, S(isolate, name).ToLocalChecked());
            }
            set_field(isolate, context, object, "literals", constants_obj);
            set_field(isolate, context, object, JSB_GET_FIELD_NAME_PRESET(enum_info, is_bitfield));
        }

        void build_signal_info(v8::Isolate* isolate, const v8::Local<v8::Context>& context, const MethodInfo& method_info, const v8::Local<v8::Object>& object)
        {
            set_field(isolate, context, object, "id", method_info.id);
            set_field(isolate, context, object, "name_", method_info.name);
            set_field(isolate, context, object, "flags", method_info.flags);
            // TODO
            // set_field(isolate, context, object, "return_val", method_info.return_val);
            // set_field(isolate, context, object, "arguments", method_info.arguments);
        }

        v8::Local<v8::Object> build_class_info(v8::Isolate* isolate, const v8::Local<v8::Context>& context, const StringName& class_name)
        {
            v8::Local<v8::Object> class_info_obj = v8::Object::New(isolate);
            const HashMap<StringName, ClassDB::ClassInfo>::Iterator class_it = ClassDB::classes.find(class_name);

            jsb_check(class_it != ClassDB::classes.end());
            const ClassDB::ClassInfo& class_info = class_it->value;
            set_field(isolate, context, class_info_obj, "name", class_name);
            set_field(isolate, context, class_info_obj, "super", class_info.inherits);

            // fields?
            {
                v8::Local<v8::Array> properties_obj = v8::Array::New(isolate, class_info.property_list.size());
                set_field(isolate, context, class_info_obj, "fields", properties_obj);
                for (int index = 0, num = class_info.property_list.size(); index < num; ++index)
                {
                    const PropertyInfo& property_info = class_info.property_list[index];
                    v8::Local<v8::Object> property_info_obj = v8::Object::New(isolate);
                    build_property_info(isolate, context, property_info, property_info_obj);
                    properties_obj->Set(context, index, property_info_obj);
                }
            }

            // properties?
            {
                v8::Local<v8::Array> properties_obj = v8::Array::New(isolate, (int) class_info.property_setget.size());
                set_field(isolate, context, class_info_obj, "properties", properties_obj);
                int index = 0;
                for (const KeyValue<StringName, ClassDB::PropertySetGet>& pair : class_info.property_setget)
                {
                    const StringName& property_name = pair.key;
                    const ClassDB::PropertySetGet& property_info = pair.value;
                    v8::Local<v8::Object> property_info_obj = v8::Object::New(isolate);
                    build_property_info(isolate, context, property_name, property_info, property_info_obj);
                    properties_obj->Set(context, index++, property_info_obj);
                }
            }

            // methods
            {
                v8::Local<v8::Array> methods_obj = v8::Array::New(isolate, (int) class_info.method_map.size());
                set_field(isolate, context, class_info_obj, "methods", methods_obj);
                int index = 0;
                for (const KeyValue<StringName, MethodBind*>& pair : class_info.method_map)
                {
                    MethodBind const * const method_bind = pair.value;
                    v8::Local<v8::Object> method_info_obj = v8::Object::New(isolate);
                    build_method_info(isolate, context, method_bind, method_info_obj);
                    methods_obj->Set(context, index++, method_info_obj);
                }
            }

            // vmethods (DO NOT USE)
            {
                v8::Local<v8::Array> methods_obj = v8::Array::New(isolate, (int) class_info.virtual_methods_map.size());
                set_field(isolate, context, class_info_obj, "virtual_methods", methods_obj);
                int index = 0;
                for (const KeyValue<StringName, MethodInfo>& pair : class_info.virtual_methods_map)
                {
                    v8::Local<v8::Object> method_info_obj = v8::Object::New(isolate);
                    build_method_info(isolate, context, pair.value, method_info_obj);
                    methods_obj->Set(context, index++, method_info_obj);
                }
            }

            // enums
            {
                v8::Local<v8::Array> enums_obj = v8::Array::New(isolate, (int) class_info.enum_map.size());
                set_field(isolate, context, class_info_obj, "enums", enums_obj);
                int index = 0;
                for (const KeyValue<StringName, ClassDB::ClassInfo::EnumInfo>& pair : class_info.enum_map)
                {
                    const ClassDB::ClassInfo::EnumInfo& enum_info = pair.value;
                    v8::Local<v8::Object> enum_info_obj = v8::Object::New(isolate);
                    set_field(isolate, context, enum_info_obj, "name", pair.key);
                    build_enum_info(isolate, context, enum_info, enum_info_obj);
                    enums_obj->Set(context, index++, enum_info_obj);
                }
            }

            // constants (int only)
            {
                v8::Local<v8::Array> constants_obj = v8::Array::New(isolate, (int) class_info.constant_map.size());
                set_field(isolate, context, class_info_obj, "constants", constants_obj);
                int index = 0;
                for (const KeyValue<StringName, int64_t>& pair : class_info.constant_map)
                {
                    v8::Local<v8::Object> constant_info_obj = v8::Object::New(isolate);
                    set_field(isolate, context, constant_info_obj, "name", pair.key);
                    set_field(isolate, context, constant_info_obj, "value", pair.value);
                    constants_obj->Set(context, index++, constant_info_obj);
                }
            }

            // signals
            {
                v8::Local<v8::Array> signals_obj = v8::Array::New(isolate, (int) class_info.signal_map.size());
                set_field(isolate, context, class_info_obj, "signals", signals_obj);
                int index = 0;
                for (const KeyValue<StringName, MethodInfo>& pair : class_info.signal_map)
                {
                    v8::Local<v8::Object> signal_info_obj = v8::Object::New(isolate);
                    set_field(isolate, context, signal_info_obj, "name", pair.key);
                    build_signal_info(isolate, context, pair.value, signal_info_obj);
                    signals_obj->Set(context, index++, signal_info_obj);
                }
            }
            return class_info_obj;
        }
    }

    template<typename TReturn>
    struct Result
    {
        template<typename TLeft, typename TRight>
        static void From(const v8::Local<v8::Context>& context, const v8::Local<v8::Array>& operators, const String& op_name)
        {
            v8::Local<v8::Object> obj = v8::Object::New(context->GetIsolate());

            set_field(context->GetIsolate(), context, obj, "name", op_name);
            set_field(context->GetIsolate(), context, obj, "return_type", (int) GetTypeInfo<TReturn>::VARIANT_TYPE);
            set_field(context->GetIsolate(), context, obj, "left_type", (int) GetTypeInfo<TLeft>::VARIANT_TYPE);
            set_field(context->GetIsolate(), context, obj, "right_type", (int) GetTypeInfo<TRight>::VARIANT_TYPE);
            const int len = operators->Length();
            operators->Set(context, len, obj);
        }
    };

    template<typename T>
    struct OperatorRegister
    {
        static void generate(const v8::Local<v8::Context>& context, const v8::Local<v8::Array>& operators) {}
    };

    using Number = double;

#define JSB_OPERATOR2(OpName, Ret, Left, Right) Result<Ret>::From<Left, Right>(context, operators, JSB_OPERATOR_NAME(OpName))

    template<> struct OperatorRegister<Vector2>
    {
        static void generate(const v8::Local<v8::Context>& context, const v8::Local<v8::Array>& operators)
        {
            JSB_OPERATOR2(ADD, Vector2, Vector2, Vector2);
            JSB_OPERATOR2(SUBTRACT, Vector2, Vector2, Vector2);
            JSB_OPERATOR2(MULTIPLY, Vector2, Vector2, Vector2);
            JSB_OPERATOR2(MULTIPLY, Vector2, Number, Vector2);
            JSB_OPERATOR2(MULTIPLY, Vector2, Vector2, Number);
            JSB_OPERATOR2(DIVIDE, Vector2, Vector2, Vector2);
            JSB_OPERATOR2(DIVIDE, Vector2, Vector2, Number);
        }
    };

    template<> struct OperatorRegister<Vector3>
    {
        static void generate(const v8::Local<v8::Context>& context, const v8::Local<v8::Array>& operators)
        {
            JSB_OPERATOR2(ADD, Vector3, Vector3, Vector3);
            JSB_OPERATOR2(SUBTRACT, Vector3, Vector3, Vector3);
            JSB_OPERATOR2(MULTIPLY, Vector3, Vector3, Vector3);
            JSB_OPERATOR2(MULTIPLY, Vector3, Number, Vector3);
            JSB_OPERATOR2(MULTIPLY, Vector3, Vector3, Number);
            JSB_OPERATOR2(DIVIDE, Vector3, Vector3, Vector3);
            JSB_OPERATOR2(DIVIDE, Vector3, Vector3, Number);
        }
    };

    void JavaScriptEditorUtility::_get_classes(const v8::FunctionCallbackInfo<v8::Value>& info)
    {
        v8::Isolate* isolate = info.GetIsolate();
        v8::HandleScope handle_scope(isolate);
        v8::Local<v8::Context> context = isolate->GetCurrentContext();

        List<StringName> list;
        ClassDB::get_class_list(&list);

        v8::Local<v8::Array> array = v8::Array::New(isolate, list.size());
        for (int index = 0, num = list.size(); index < num; ++index)
        {
            array->Set(context, index, build_class_info(isolate, context, list[index]));
        }
        info.GetReturnValue().Set(array);
    }

    void JavaScriptEditorUtility::_get_global_constants(const v8::FunctionCallbackInfo<v8::Value>& info)
    {
        v8::Isolate* isolate = info.GetIsolate();
        v8::HandleScope handle_scope(isolate);
        v8::Local<v8::Context> context = isolate->GetCurrentContext();

        const int num = CoreConstants::get_global_constant_count();
        HashSet<StringName> enum_packs;
        v8::Local<v8::Array> array = v8::Array::New(isolate);
        int array_index = 0;
        for (int index = 0; index < num; ++index)
        {
            const StringName enum_name = CoreConstants::get_global_constant_enum(index);
            if (enum_packs.has(enum_name))
            {
                continue;
            }

            enum_packs.insert(enum_name);
            v8::Local<v8::Object> enum_obj = v8::Object::New(isolate);
            v8::Local<v8::Object> values_obj = v8::Object::New(isolate);
            HashMap<StringName, int64_t> map;
            set_field(isolate, context, enum_obj, "name", enum_name);
            set_field(isolate, context, enum_obj, "values", values_obj);
            CoreConstants::get_enum_values(enum_name, &map);
            for (const KeyValue<StringName, int64_t>& kv : map)
            {
                values_obj->Set(context,
                    S(isolate, kv.key).ToLocalChecked(),
                    build_int64(isolate, kv.key, kv.value));
            }
            array->Set(context, array_index++, enum_obj);
        }
        info.GetReturnValue().Set(array);
    }

    template<typename T>
    static v8::Local<v8::Value> generate_primitive_type(v8::Isolate* isolate, const v8::Local<v8::Context>& context)
    {
        constexpr static Variant::Type TYPE = GetTypeInfo<T>::VARIANT_TYPE;
        v8::Local<v8::Object> class_info_obj = v8::Object::New(isolate);
        set_field(isolate, context, class_info_obj, "name", Variant::get_type_name(TYPE));

        // constructors
        {
            const int constructor_count = Variant::get_constructor_count(TYPE);
            v8::Local<v8::Array> constructors_obj = v8::Array::New(isolate, constructor_count);
            set_field(isolate, context, class_info_obj, "constructors", constructors_obj);
            for (int constructor_index = 0; constructor_index < constructor_count; ++constructor_index)
            {
                const int argc = Variant::get_constructor_argument_count(TYPE, constructor_index);
                FConstructorInfo constructor_info;
                for (int argument_index = 0; argument_index < argc; ++argument_index)
                {
                    const String argument_name = Variant::get_constructor_argument_name(TYPE, constructor_index, argument_index);
                    const Variant::Type argument_type = Variant::get_constructor_argument_type(TYPE, constructor_index, argument_index);
                    constructor_info.arguments.append({ argument_name, argument_type });
                }
                v8::Local<v8::Object> constructor_obj = v8::Object::New(isolate);
                build_constructor_info(isolate, context, constructor_info, constructor_obj);
                constructors_obj->Set(context, constructor_index, constructor_obj);
            }
        }

        // properties (getset)
        {
            List<StringName> members;
            Variant::get_member_list(TYPE, &members);
            v8::Local<v8::Array> members_obj = v8::Array::New(isolate, members.size());
            set_field(isolate, context, class_info_obj, "properties", members_obj);
            int index = 0;
            for (const StringName& property_name : members)
            {
                // in order to reuse `build_property_info`, wrap it as a `PropertySetGet`
                FPrimitiveGetSetInfo property_info;
                property_info.name = property_name;
                property_info.type = Variant::get_member_type(TYPE, property_name);
                v8::Local<v8::Object> property_info_obj = v8::Object::New(isolate);
                build_property_info(isolate, context, property_name, property_info, property_info_obj);
                members_obj->Set(context, index++, property_info_obj);
            }
        }

        // methods
        {
            List<StringName> methods;
            Variant::get_builtin_method_list(TYPE, &methods);
            v8::Local<v8::Array> methods_obj = v8::Array::New(isolate, (int) methods.size());
            set_field(isolate, context, class_info_obj, "methods", methods_obj);
            int index = 0;
            for (const StringName& name : methods)
            {
                MethodInfo method_info;
                method_info.name = name;
                method_info.flags = 0;
                method_info.return_val.type = Variant::get_builtin_method_return_type(TYPE, name);
                for (int i = 0, n = Variant::get_builtin_method_argument_count(TYPE, name); i < n; ++i)
                {
                    PropertyInfo prop_info;
                    prop_info.name = Variant::get_builtin_method_argument_name(TYPE, name, i);
                    prop_info.type = Variant::get_builtin_method_argument_type(TYPE, name, i);
                    method_info.arguments.push_back(prop_info);
                }
                if (Variant::is_builtin_method_const(TYPE, name)) method_info.flags |= METHOD_FLAG_CONST;
                if (Variant::is_builtin_method_static(TYPE, name)) method_info.flags |= METHOD_FLAG_STATIC;
                if (Variant::is_builtin_method_vararg(TYPE, name)) method_info.flags |= METHOD_FLAG_VARARG;
                v8::Local<v8::Object> method_info_obj = v8::Object::New(isolate);
                build_method_info(isolate, context, method_info, method_info_obj);
                methods_obj->Set(context, index++, method_info_obj);
            }
        }

        // operators
        {
            v8::Local<v8::Array> operators_obj = v8::Array::New(isolate);
            set_field(isolate, context, class_info_obj, "operators", operators_obj);
            OperatorRegister<T>::generate(context, operators_obj);
        }

        // enums
        {
            List<StringName> enums;
            Variant::get_enums_for_type(TYPE, &enums);
            v8::Local<v8::Array> enums_obj = v8::Array::New(isolate, (int) enums.size());
            set_field(isolate, context, class_info_obj, "enums", enums_obj);
            int index = 0;
            for (const StringName& enum_name : enums)
            {
                List<StringName> enumerations;
                Variant::get_enumerations_for_enum(TYPE, enum_name, &enumerations);
                ClassDB::ClassInfo::EnumInfo enum_info;
                for (const StringName& enumeration : enumerations)
                {
                    enum_info.constants.push_back(enumeration);
                }
                v8::Local<v8::Object> enum_info_obj = v8::Object::New(isolate);
                set_field(isolate, context, enum_info_obj, "name", enum_name);
                build_enum_info(isolate, context, enum_info, enum_info_obj);
                enums_obj->Set(context, index++, enum_info_obj);
            }
        }

        // constants
        {
            List<StringName> constants;
            Variant::get_constants_for_type(TYPE, &constants);
            v8::Local<v8::Array> constants_obj = v8::Array::New(isolate, (int) constants.size());
            set_field(isolate, context, class_info_obj, "constants", constants_obj);
            int index = 0;
            for (const StringName& constant : constants)
            {
                v8::Local<v8::Object> constant_info_obj = v8::Object::New(isolate);
                const Variant constant_value = Variant::get_constant_value(TYPE, constant);

                set_field(isolate, context, constant_info_obj, "name", constant);
                set_field(isolate, context, constant_info_obj, "type", constant_value.get_type());
                switch (constant_value.get_type())
                {
                case Variant::BOOL: set_field(isolate, context, constant_info_obj, "value", (bool) constant_value); break;
                case Variant::INT: set_field(isolate, context, constant_info_obj, "value", (int64_t) constant_value); break;
                case Variant::FLOAT: set_field(isolate, context, constant_info_obj, "value", (double) constant_value); break;
                default: break;
                }
                constants_obj->Set(context, index++, constant_info_obj);
            }
        }
        return class_info_obj;
    }

    #define GeneratePrimitiveType(Type) array->Set(context, index++, generate_primitive_type<Type>(isolate, context))
    void JavaScriptEditorUtility::_get_primitive_types(const v8::FunctionCallbackInfo<v8::Value>& info)
    {
        v8::Isolate* isolate = info.GetIsolate();
        v8::HandleScope handle_scope(isolate);
        v8::Local<v8::Context> context = isolate->GetCurrentContext();

        int index = 0;
        v8::Local<v8::Array> array = v8::Array::New(isolate);

        GeneratePrimitiveType(Vector2);
        GeneratePrimitiveType(Vector2i);
        GeneratePrimitiveType(Rect2);
        GeneratePrimitiveType(Rect2i);
        GeneratePrimitiveType(Vector3);
        GeneratePrimitiveType(Vector3i);
        GeneratePrimitiveType(Transform2D);
        GeneratePrimitiveType(Vector4);
        GeneratePrimitiveType(Vector4i);
        GeneratePrimitiveType(Plane);
        GeneratePrimitiveType(Quaternion);
        GeneratePrimitiveType(AABB);
        GeneratePrimitiveType(Basis);
        GeneratePrimitiveType(Transform3D);
        GeneratePrimitiveType(Projection);
        GeneratePrimitiveType(Color);
        // - StringName
        // - NodePath
        GeneratePrimitiveType(RID);
        // - Object
        GeneratePrimitiveType(Callable);
        GeneratePrimitiveType(Signal);
        GeneratePrimitiveType(Dictionary);
        GeneratePrimitiveType(Array);
        GeneratePrimitiveType(PackedByteArray);
        GeneratePrimitiveType(PackedInt32Array);
        GeneratePrimitiveType(PackedInt64Array);
        GeneratePrimitiveType(PackedFloat32Array);
        GeneratePrimitiveType(PackedFloat64Array);
        GeneratePrimitiveType(PackedStringArray);
        GeneratePrimitiveType(PackedVector2Array);
        GeneratePrimitiveType(PackedVector3Array);
        GeneratePrimitiveType(PackedColorArray);

        info.GetReturnValue().Set(array);
    }

    void JavaScriptEditorUtility::_get_utility_functions(const v8::FunctionCallbackInfo<v8::Value>& info)
    {
        v8::Isolate* isolate = info.GetIsolate();
        v8::HandleScope handle_scope(isolate);
        v8::Local<v8::Context> context = isolate->GetCurrentContext();

        List<StringName> utility_function_list;
        Variant::get_utility_function_list(&utility_function_list);
        v8::Local<v8::Array> array = v8::Array::New(isolate, utility_function_list.size());
        for (int index = 0, num = utility_function_list.size(); index < num; ++index)
        {
            const MethodInfo method_info = Variant::get_utility_function_info(utility_function_list[index]);
            v8::Local<v8::Object> method_info_obj = v8::Object::New(isolate);
            build_method_info(isolate, context, method_info, method_info_obj);
            array->Set(context, index, method_info_obj);
        }
        info.GetReturnValue().Set(array);
    }

    void JavaScriptEditorUtility::_get_singletons(const v8::FunctionCallbackInfo<v8::Value>& info)
    {
        v8::Isolate* isolate = info.GetIsolate();
        v8::HandleScope handle_scope(isolate);
        v8::Local<v8::Context> context = isolate->GetCurrentContext();

        List<Engine::Singleton> singletons;
        Engine::get_singleton()->get_singletons(&singletons);
        v8::Local<v8::Array> array = v8::Array::New(isolate, singletons.size());
        for (int index = 0, num = singletons.size(); index < num; ++index)
        {
            Engine::Singleton singleton = singletons[index];
            v8::Local<v8::Object> constant_obj = v8::Object::New(isolate);
            const StringName class_name = singleton.ptr->get_class_name();
            if (! (const void*) singleton.class_name)
            {
                singleton.class_name = class_name;
                JSB_LOG(Warning, "singleton (%s) hides the clas_name, restoring with '%s'", singleton.name, class_name);
            }

            set_field(isolate, context, constant_obj, "name", singleton.name);
            set_field(isolate, context, constant_obj, "class_name", singleton.class_name);
            set_field(isolate, context, constant_obj, "user_created", singleton.user_created);
            set_field(isolate, context, constant_obj, "editor_only", singleton.editor_only);
            array->Set(context, index, constant_obj);
        }
        info.GetReturnValue().Set(array);
    }

    void JavaScriptEditorUtility::_benchmark_dump(const v8::FunctionCallbackInfo<v8::Value>& info)
    {
        OS::get_singleton()->benchmark_dump();
    }

    void JavaScriptEditorUtility::_delete_file(const v8::FunctionCallbackInfo<v8::Value>& info)
    {
        v8::Isolate* isolate = info.GetIsolate();
        v8::HandleScope handle_scope(isolate);
        v8::Local<v8::Context> context = isolate->GetCurrentContext();

        if (info.Length() != 1 || !info[0]->IsString())
        {
            isolate->ThrowError("bad path");
            return;
        }
        v8::String::Utf8Value cstr(isolate, info[0]);
#if WINDOWS_ENABLED
        DeleteFileW((LPCWSTR) String(*cstr, cstr.length()).utf16().get_data());
#else
        unlink(*cstr);
#endif
    }

}
#endif
