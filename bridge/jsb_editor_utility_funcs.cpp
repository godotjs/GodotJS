#include "jsb_editor_utility_funcs.h"
#include "jsb_type_convert.h"

#if JSB_WITH_EDITOR_UTILITY_FUNCS
namespace jsb_private
{
    //NOTE dummy functions only for compile-time check and never being really compiled
    template <typename T>                   bool get_member_name(const T&);
    template <typename T>                   bool get_member_name(const volatile T&);
    template <typename R, typename... Args> bool get_member_name(R (*)(Args...));
}

#define JSB_GET_FIELD_NAME_PRESET(InstName, ValueName) ((void)sizeof(jsb_private::get_member_name(std::decay_t<decltype(InstName)>::ValueName)), JSB_STRINGIFY(ValueName)), InstName.ValueName

#define JSB_TYPE_BEGIN(InType) template<> struct OperatorRegister<InType>\
    {\
        typedef InType CurrentType;\
        static void generate(const v8::Local<v8::Context>& context, const v8::Local<v8::Array>& operators)\
        {
#define JSB_TYPE_END() \
        }\
    };

#define JSB_DEFINE_OVERLOADED_BINARY_BEGIN(InOperator) OverloadedBinaryOperator(JSB_OPERATOR_NAME(InOperator), context, operators)
#define JSB_DEFINE_BINARY_OVERLOAD(TReturn, TLeft, TRight) .Define<TReturn, TLeft, TRight>()
#define JSB_DEFINE_OVERLOADED_BINARY_END() ;
#define JSB_DEFINE_UNARY(InOperator) UnaryOperator::Define<CurrentType>(context, operators, JSB_OPERATOR_NAME(InOperator));
#define JSB_DEFINE_COMPARATOR(InOperator) Comparator::Define<CurrentType, CurrentType>(context, operators, JSB_OPERATOR_NAME(InOperator));

namespace jsb
{
    namespace
    {
        template<int N>
        void set_field(v8::Isolate* isolate, const v8::Local<v8::Context>& context, const v8::Local<v8::Object>& obj, const char (&field_name)[N], const v8::Local<v8::Value>& field_value)
        {
            obj->Set(context, impl::Helper::new_string(isolate, field_name), field_value).Check();
        }

        template<int N>
        void set_field(v8::Isolate* isolate, const v8::Local<v8::Context>& context, const v8::Local<v8::Object>& obj, const char (&field_name)[N], const StringName& field_value)
        {
            set_field(isolate, context, obj, field_name, impl::Helper::new_string(isolate, field_value));
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
            set_field(isolate, context, obj, field_name, impl::Helper::new_string(isolate, field_value));
        }

        template<int N>
        void set_field(v8::Isolate* isolate, const v8::Local<v8::Context>& context, const v8::Local<v8::Object>& obj, const char (&field_name)[N], const char*& field_value)
        {
            set_field(isolate, context, obj, field_name, impl::Helper::new_string(isolate, field_value));
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
            set_field(isolate, context, obj, field_name, impl::Helper::new_integer(isolate, field_value));
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

        void build_property_default_value(v8::Isolate* isolate, const v8::Local<v8::Context>& context, const Variant& property_value, Variant::Type property_type, const v8::Local<v8::Object>& object)
        {
            v8::Local<v8::Value> val;
            if (property_value.get_type() == Variant::NIL)
            {
                set_field(isolate, context, object, "type", property_type);
                set_field(isolate, context, object, "value", v8::Null(isolate));
                return;
            }
            if (!TypeConvert::gd_var_to_js(isolate, context, property_value, property_type, val))
            {
                JSB_LOG(Error, "unresolved default value");
                return;
            }
            set_field(isolate, context, object, "type", property_type);
            set_field(isolate, context, object, "value", val);
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

        void build_property_info(v8::Isolate* isolate, const v8::Local<v8::Context>& context, const StringName& property_name, const ClassDB::PropertySetGet& getset_info, const v8::Local<v8::Object>& object)
        {
            set_field(isolate, context, object, "name", property_name);
            set_field(isolate, context, object, "type", getset_info.type);
            set_field(isolate, context, object, "index", getset_info.index);
            set_field(isolate, context, object, "setter", getset_info.setter);
            set_field(isolate, context, object, "getter", getset_info.getter);
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
                args_obj->Set(context, index, arg_obj).Check();
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

            {
                const int argc = method_bind->get_argument_count();
                v8::Local<v8::Array> args_obj = v8::Array::New(isolate, argc);
                for (int index = 0; index < argc; ++index)
                {
                    const PropertyInfo& arg_info = method_bind->get_argument_info(index);
                    v8::Local<v8::Object> property_info_obj = v8::Object::New(isolate);
                    build_property_info(isolate, context, arg_info, property_info_obj);
                    args_obj->Set(context, index, property_info_obj).Check();
                }
                set_field(isolate, context, object, "args_", args_obj);
            }

            // write type info for `defaults`
            {
                const Vector<Variant>& default_arguments = method_bind->get_default_arguments();
                const int argument_count = method_bind->get_argument_count();
                const int default_argument_count = (int) default_arguments.size();
                jsb_check(method_bind->get_default_argument_count() == default_argument_count);
                const v8::Local<v8::Array> args_obj = v8::Array::New(isolate, default_argument_count);
                for (int index = 0; index < default_argument_count; ++index)
                {
                    const Variant& value = default_arguments[index];
                    v8::Local<v8::Object> property_info_obj = v8::Object::New(isolate);
                    const int argument_index = argument_count - (default_argument_count - index);
                    // avoid error reporting in `method_bind->get_argument_info`
                    //NOTE is it a bug of godot? in dir_access.cpp "ClassDB::bind_method(D_METHOD("list_dir_begin"), &DirAccess::list_dir_begin, DEFVAL(false), DEFVAL(false));"
                    //     which actually has no argument but default arguments are still given in binding
                    const Variant::Type type = argument_index >= 0 && argument_index < argument_count
                        ? method_bind->get_argument_info(argument_index).type
                        : Variant::NIL;
                    build_property_default_value(isolate, context, value, type, property_info_obj);
                    args_obj->Set(context, index, property_info_obj).Check();
                }
                set_field(isolate, context, object, "default_arguments", args_obj);
            }
        }

        void build_method_info(v8::Isolate* isolate, const v8::Local<v8::Context>& context, const MethodInfo& method_info, bool has_return_value, const v8::Local<v8::Object>& object)
        {
            set_field(isolate, context, object, "id", method_info.id);
            set_field(isolate, context, object, "name", method_info.name);
            set_field(isolate, context, object, "hint_flags", method_info.flags);
            set_field(isolate, context, object, "is_static", method_info.flags & METHOD_FLAG_STATIC);
            set_field(isolate, context, object, "is_const", method_info.flags & METHOD_FLAG_CONST);
            set_field(isolate, context, object, "is_vararg", method_info.flags & METHOD_FLAG_VARARG);
            // set_field(isolate, context, object, "has_return", method_bind->has_return());
            set_field(isolate, context, object, "argument_count", method_info.arguments.size());

            // write type info for `return`
            if (has_return_value)
            {
                const PropertyInfo& return_info = method_info.return_val;
                v8::Local<v8::Object> property_info_obj = v8::Object::New(isolate);
                build_property_info(isolate, context, return_info, property_info_obj);
                set_field(isolate, context, object, "return_", property_info_obj);
            }

            const int argument_num = method_info.arguments.size();
            Vector<Variant::Type> argument_types;

            argument_types.resize(argument_num);
            // write type info for `arguments`
            {
                v8::Local<v8::Array> args_obj = v8::Array::New(isolate, argument_num);
                int index = 0;
                for (List<PropertyInfo>::ConstIterator it = method_info.arguments.begin(); it != method_info.arguments.end(); ++it)
                {
                    jsb_check(index < argument_num);
                    const PropertyInfo& arg_info = *it;
                    v8::Local<v8::Object> property_info_obj = v8::Object::New(isolate);
                    build_property_info(isolate, context, arg_info, property_info_obj);
                    argument_types.write[index] = arg_info.type;
                    args_obj->Set(context, index++, property_info_obj).Check();
                }
                set_field(isolate, context, object, "args_", args_obj);
            }

            // write type info for `defaults`
            {
                const int argc = method_info.default_arguments.size();
                v8::Local<v8::Array> args_obj = v8::Array::New(isolate, argc);
                for (int index = 0; index < argc; ++index)
                {
                    v8::Local<v8::Object> property_info_obj = v8::Object::New(isolate);
                    const Variant value = method_info.default_arguments[index];
                    const Variant::Type type = argument_types[argument_types.size() - (argc - index)];
                    build_property_default_value(isolate, context, value, type, property_info_obj);
                    args_obj->Set(context, index, property_info_obj).Check();
                }
                set_field(isolate, context, object, "default_arguments", args_obj);
            }
        }

        void build_enum_info(v8::Isolate* isolate, const v8::Local<v8::Context>& context, const ClassDB::ClassInfo::EnumInfo& enum_info, const v8::Local<v8::Object>& object)
        {
            const int num = enum_info.constants.size();
            v8::Local<v8::Array> elements_array = v8::Array::New(isolate, num);
            int index = 0;
            for (List<StringName>::ConstIterator it = enum_info.constants.begin(); it != enum_info.constants.end(); ++it, ++index)
            {
                const StringName& name = *it;
                elements_array->Set(context, index, impl::Helper::new_string(isolate, name)).Check();
            }
            set_field(isolate, context, object, "literals", elements_array);
            set_field(isolate, context, object, JSB_GET_FIELD_NAME_PRESET(enum_info, is_bitfield));
        }

        void build_signal_info(v8::Isolate* isolate, const v8::Local<v8::Context>& context, const MethodInfo& method_info, const v8::Local<v8::Object>& signal_obj)
        {
            v8::Local<v8::Object> method_obj = v8::Object::New(isolate);

            build_method_info(isolate, context, method_info, false, method_obj);
            set_field(isolate, context, signal_obj, "method_", method_obj);
        }

        v8::Local<v8::Object> build_class_info(v8::Isolate* isolate, const v8::Local<v8::Context>& context, const StringName& class_name)
        {
            v8::Local<v8::Object> class_info_obj = v8::Object::New(isolate);
            const HashMap<StringName, ClassDB::ClassInfo>::Iterator class_it = ClassDB::classes.find(class_name);

            jsb_check(class_it != ClassDB::classes.end());
            const ClassDB::ClassInfo& class_info = class_it->value;
            set_field(isolate, context, class_info_obj, "name", class_name);
            set_field(isolate, context, class_info_obj, "super", class_info.inherits);

#if JSB_EXCLUDE_GETSET_METHODS
            HashSet<StringName> omitted_methods;
#endif
            // class: properties
            {
                // intentionally new array without a length from `class_info.property_setget.size()`,
                // because ignoring items causes holes in the "properties" array which would be `undefined`
                v8::Local<v8::Array> properties_obj = v8::Array::New(isolate);
                set_field(isolate, context, class_info_obj, "properties", properties_obj);
                int index = 0;
                for (const KeyValue<StringName, ClassDB::PropertySetGet>& pair : class_info.property_setget)
                {
                    if (internal::StringNames::get_singleton().is_ignored(pair.key)) continue;

                    const StringName& property_name = pair.key;
                    const ClassDB::PropertySetGet& getset_info = pair.value;
                    const PropertyInfo& property_info = class_info.property_map.get(property_name);
                    v8::Local<v8::Object> getset_info_obj = v8::Object::New(isolate);
                    v8::Local<v8::Object> property_info_obj = v8::Object::New(isolate);
                    set_field(isolate, context, getset_info_obj, "info", property_info_obj);
                    build_property_info(isolate, context, property_info, property_info_obj);
                    build_property_info(isolate, context, property_name, getset_info, getset_info_obj);
                    properties_obj->Set(context, index++, getset_info_obj).Check();
                    if (pair.value.index >= 0)
                    {
                        // we do not exclude get/set methods in this case, because the method may not be covered by all properties
                    }
                    else
                    {
#if JSB_EXCLUDE_GETSET_METHODS
                        if (internal::VariantUtil::is_valid_name(getset_info.getter)) omitted_methods.insert(getset_info.getter);
                        if (internal::VariantUtil::is_valid_name(getset_info.setter)) omitted_methods.insert(getset_info.setter);
#endif
                    }
                }
            }

            // class: methods
            {
#if JSB_EXCLUDE_GETSET_METHODS
                constexpr int len = 0;
#else
                const int len = (int) class_info.method_map.size();
#endif
                const v8::Local<v8::Array> methods_obj = v8::Array::New(isolate, len);
                set_field(isolate, context, class_info_obj, "methods", methods_obj);
                int index = 0;
                for (const KeyValue<StringName, MethodBind*>& pair : class_info.method_map)
                {
#if JSB_EXCLUDE_GETSET_METHODS
                    if (omitted_methods.has(pair.key)) continue;
#endif
                    MethodBind const * const method_bind = pair.value;
                    v8::Local<v8::Object> method_info_obj = v8::Object::New(isolate);
                    build_method_info(isolate, context, method_bind, method_info_obj);
                    methods_obj->Set(context, index++, method_info_obj).Check();
                }
            }

            // class: vmethods (DO NOT USE)
            {
                v8::Local<v8::Array> methods_obj = v8::Array::New(isolate, (int) class_info.virtual_methods_map.size());
                set_field(isolate, context, class_info_obj, "virtual_methods", methods_obj);
                int index = 0;
                for (const KeyValue<StringName, MethodInfo>& pair : class_info.virtual_methods_map)
                {
                    v8::Local<v8::Object> method_info_obj = v8::Object::New(isolate);
                    //TODO whether a virtual method has return value or not?
                    build_method_info(isolate, context, pair.value, pair.value.return_val.type != Variant::NIL, method_info_obj);
                    methods_obj->Set(context, index++, method_info_obj).Check();
                }
            }

            // class: enums
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
                    enums_obj->Set(context, index++, enum_info_obj).Check();
                }
            }

            // class: constants (int only)
            {
                v8::Local<v8::Array> constants_obj = v8::Array::New(isolate, (int) class_info.constant_map.size());
                set_field(isolate, context, class_info_obj, "constants", constants_obj);
                int index = 0;
                for (const KeyValue<StringName, int64_t>& pair : class_info.constant_map)
                {
                    v8::Local<v8::Object> constant_info_obj = v8::Object::New(isolate);
                    set_field(isolate, context, constant_info_obj, "name", pair.key);
                    set_field(isolate, context, constant_info_obj, "value", pair.value);
                    constants_obj->Set(context, index++, constant_info_obj).Check();
                }
            }

            // class: signals
            {
                v8::Local<v8::Array> signals_obj = v8::Array::New(isolate, (int) class_info.signal_map.size());
                set_field(isolate, context, class_info_obj, "signals", signals_obj);
                int index = 0;
                for (const KeyValue<StringName, MethodInfo>& pair : class_info.signal_map)
                {
                    v8::Local<v8::Object> signal_info_obj = v8::Object::New(isolate);
                    set_field(isolate, context, signal_info_obj, "name", pair.key);
                    build_signal_info(isolate, context, pair.value, signal_info_obj);
                    signals_obj->Set(context, index++, signal_info_obj).Check();
                }
            }

            return class_info_obj;
        }
    }

    struct OverloadedBinaryOperator
    {
        String op_name;
        const v8::Local<v8::Context>& context;
        const v8::Local<v8::Array>& operators;

        OverloadedBinaryOperator(const String& p_name, const v8::Local<v8::Context>& p_context, const v8::Local<v8::Array>& p_operators)
        : op_name(p_name), context(p_context), operators(p_operators) {}

        template<typename TReturn, typename TLeft, typename TRight>
        OverloadedBinaryOperator& Define()
        {
            v8::Local<v8::Object> obj = v8::Object::New(context->GetIsolate());

            set_field(context->GetIsolate(), context, obj, "name", op_name);
            set_field(context->GetIsolate(), context, obj, "return_type", (int) GetTypeInfo<TReturn>::VARIANT_TYPE);
            set_field(context->GetIsolate(), context, obj, "left_type", (int) GetTypeInfo<TLeft>::VARIANT_TYPE);
            set_field(context->GetIsolate(), context, obj, "right_type", (int) GetTypeInfo<TRight>::VARIANT_TYPE);
            const uint32_t len = operators->Length();
            operators->Set(context, len, obj).Check();
            return *this;
        }
    };

    struct UnaryOperator
    {
        template<typename TypeName>
        static void Define(const v8::Local<v8::Context>& context, const v8::Local<v8::Array>& operators, const String& op_name)
        {
            v8::Local<v8::Object> obj = v8::Object::New(context->GetIsolate());

            set_field(context->GetIsolate(), context, obj, "name", op_name);
            set_field(context->GetIsolate(), context, obj, "return_type", (int) GetTypeInfo<TypeName>::VARIANT_TYPE);
            set_field(context->GetIsolate(), context, obj, "left_type", (int) GetTypeInfo<TypeName>::VARIANT_TYPE);
            set_field(context->GetIsolate(), context, obj, "right_type", (int) Variant::NIL);
            const uint32_t len = operators->Length();
            operators->Set(context, len, obj).Check();
        }
    };

    struct Comparator
    {
        template<typename TLeft, typename TRight>
        static void Define(const v8::Local<v8::Context>& context, const v8::Local<v8::Array>& operators, const String& op_name)
        {
            v8::Local<v8::Object> obj = v8::Object::New(context->GetIsolate());

            set_field(context->GetIsolate(), context, obj, "name", op_name);
            set_field(context->GetIsolate(), context, obj, "return_type", (int) GetTypeInfo<bool>::VARIANT_TYPE);
            set_field(context->GetIsolate(), context, obj, "left_type", (int) GetTypeInfo<TLeft>::VARIANT_TYPE);
            set_field(context->GetIsolate(), context, obj, "right_type", (int) GetTypeInfo<TRight>::VARIANT_TYPE);
            const uint32_t len = operators->Length();
            operators->Set(context, len, obj).Check();
        }
    };

    template<typename TypeName>
    struct OperatorRegister
    {
        static void generate(const v8::Local<v8::Context>& context, const v8::Local<v8::Array>& operators) {}
    };

    #define Number double
    #include "../internal/jsb_primitive_operators.def.h"
    #undef Number

    template<typename T>
    static v8::Local<v8::Value> generate_primitive_type(v8::Isolate* isolate, const v8::Local<v8::Context>& context)
    {
        constexpr static Variant::Type TYPE = GetTypeInfo<T>::VARIANT_TYPE;
        v8::Local<v8::Object> class_info_obj = v8::Object::New(isolate);
        set_field(isolate, context, class_info_obj, "name", Variant::get_type_name(TYPE));
        set_field(isolate, context, class_info_obj, "type", TYPE);
        if (Variant::has_indexing(TYPE))
        {
            set_field(isolate, context, class_info_obj, "element_type", Variant::get_indexed_element_type(TYPE));
        }
        set_field(isolate, context, class_info_obj, "is_keyed", Variant::is_keyed(TYPE));

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
                constructors_obj->Set(context, constructor_index, constructor_obj).Check();
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
                members_obj->Set(context, index++, property_info_obj).Check();
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
                if (Variant::is_builtin_method_vararg(TYPE, name)) method_info.flags |= METHOD_FLAG_VARARG;
                method_info.return_val.type = Variant::get_builtin_method_return_type(TYPE, name);
                for (int i = 0, n = Variant::get_builtin_method_argument_count(TYPE, name); i < n; ++i)
                {
                    PropertyInfo prop_info;
                    prop_info.name = Variant::get_builtin_method_argument_name(TYPE, name, i);
                    prop_info.type = Variant::get_builtin_method_argument_type(TYPE, name, i);
                    method_info.arguments.push_back(prop_info);
                }
                method_info.default_arguments = Variant::get_builtin_method_default_arguments(TYPE, name);
                if (Variant::is_builtin_method_const(TYPE, name)) method_info.flags |= METHOD_FLAG_CONST;
                if (Variant::is_builtin_method_static(TYPE, name)) method_info.flags |= METHOD_FLAG_STATIC;
                if (Variant::is_builtin_method_vararg(TYPE, name)) method_info.flags |= METHOD_FLAG_VARARG;
                const bool has_return_value = Variant::has_builtin_method_return_value(TYPE, name);
                v8::Local<v8::Object> method_info_obj = v8::Object::New(isolate);
                build_method_info(isolate, context, method_info, has_return_value, method_info_obj);
                methods_obj->Set(context, index++, method_info_obj).Check();
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
                enums_obj->Set(context, index++, enum_info_obj).Check();
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
                constants_obj->Set(context, index++, constant_info_obj).Check();
            }
        }
        return class_info_obj;
    }

    static void _get_class_doc(const v8::FunctionCallbackInfo<v8::Value>& info)
    {
        v8::Isolate* isolate = info.GetIsolate();
        v8::HandleScope handle_scope(isolate);
        v8::Local<v8::Context> context = isolate->GetCurrentContext();

        const String name = impl::Helper::to_string(isolate, info[0]);
        if (const DocData::ClassDoc* ptr = EditorHelp::get_doc_data()->class_list.getptr(name))
        {
            const DocData::ClassDoc& class_doc = *ptr;
            v8::Local<v8::Object> class_doc_obj = v8::Object::New(isolate);

            // doc:class<brief>
            set_field(isolate, context, class_doc_obj, JSB_GET_FIELD_NAME_PRESET(class_doc, brief_description));

            // doc:constants
            v8::Local<v8::Object> constants_obj = v8::Object::New(isolate);
            set_field(isolate, context, class_doc_obj, "constants", constants_obj);
            for (const DocData::ConstantDoc& constant_doc : class_doc.constants)
            {
                v8::Local<v8::Object> constant_obj = v8::Object::New(isolate);
                constants_obj->Set(context, impl::Helper::new_string(isolate, constant_doc.name), constant_obj).Check();

                set_field(isolate, context, constant_obj, "description", constant_doc.description);
            }

            // doc:methods
            v8::Local<v8::Object> methods_obj = v8::Object::New(isolate);
            set_field(isolate, context, class_doc_obj, "methods", methods_obj);
            for (const DocData::MethodDoc& method_doc : class_doc.methods)
            {
                v8::Local<v8::Object> method_obj = v8::Object::New(isolate);
                methods_obj->Set(context, impl::Helper::new_string(isolate, method_doc.name), method_obj).Check();

                set_field(isolate, context, method_obj, "description", method_doc.description);
            }

            // doc:properties
            v8::Local<v8::Object> properties_obj = v8::Object::New(isolate);
            set_field(isolate, context, class_doc_obj, "properties", properties_obj);
            for (const DocData::PropertyDoc& property_doc : class_doc.properties)
            {
                v8::Local<v8::Object> property_obj = v8::Object::New(isolate);
                properties_obj->Set(context, impl::Helper::new_string(isolate, property_doc.name), property_obj).Check();

                set_field(isolate, context, property_obj, "description", property_doc.description);
            }

            // doc:signals
            v8::Local<v8::Object> signals_obj = v8::Object::New(isolate);
            set_field(isolate, context, class_doc_obj, "signals", signals_obj);
            for (const DocData::MethodDoc& signal_doc : class_doc.signals)
            {
                v8::Local<v8::Object> signal_obj = v8::Object::New(isolate);
                signals_obj->Set(context, impl::Helper::new_string(isolate, signal_doc.name), signal_obj).Check();

                set_field(isolate, context, signal_obj, "description", signal_doc.description);
            }

            info.GetReturnValue().Set(class_doc_obj);
        }
    }

    static void _get_classes(const v8::FunctionCallbackInfo<v8::Value>& info)
    {
        v8::Isolate* isolate = info.GetIsolate();
        v8::HandleScope handle_scope(isolate);
        v8::Local<v8::Context> context = isolate->GetCurrentContext();

        List<StringName> list;
        ClassDB::get_class_list(&list);

        v8::Local<v8::Array> array = v8::Array::New(isolate);
        int index = 0;
        const PackedStringArray ignored_classes = internal::Settings::get_ignored_classes();
        const int ignored_classes_num = (int) ignored_classes.size();
        HashSet<StringName> ignored_classes_set(ignored_classes_num);
        for (int i = 0; i < ignored_classes_num; ++i)
        {
            ignored_classes_set.insert(ignored_classes[i]);
        }
        for (auto it = list.begin(); it != list.end(); ++it)
        {
            if (ignored_classes_set.has(*it))
            {
                JSB_LOG(Verbose, "ignoring %s", *it);
                continue;
            }
            array->Set(context, index++, build_class_info(isolate, context, *it)).Check();
        }
        info.GetReturnValue().Set(array);
    }

    static void _get_global_constants(const v8::FunctionCallbackInfo<v8::Value>& info)
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
                    impl::Helper::new_string(isolate, kv.key),
                    impl::Helper::new_integer(isolate, kv.value)).Check();
            }
            array->Set(context, array_index++, enum_obj).Check();
        }
        info.GetReturnValue().Set(array);
    }

    static void _get_primitive_types(const v8::FunctionCallbackInfo<v8::Value>& info)
    {
        v8::Isolate* isolate = info.GetIsolate();
        v8::HandleScope handle_scope(isolate);
        v8::Local<v8::Context> context = isolate->GetCurrentContext();

        int index = 0;
        v8::Local<v8::Array> array = v8::Array::New(isolate);

#pragma push_macro("DEF")
#   undef   DEF
#   define  DEF(TypeName) array->Set(context, index++, generate_primitive_type<TypeName>(isolate, context)).Check();
#   include "jsb_primitive_types.def.h"
#pragma pop_macro("DEF")

        info.GetReturnValue().Set(array);
    }

    static void _get_utility_functions(const v8::FunctionCallbackInfo<v8::Value>& info)
    {
        v8::Isolate* isolate = info.GetIsolate();
        v8::HandleScope handle_scope(isolate);
        v8::Local<v8::Context> context = isolate->GetCurrentContext();

        List<StringName> utility_function_list;
        Variant::get_utility_function_list(&utility_function_list);
        v8::Local<v8::Array> array = v8::Array::New(isolate, utility_function_list.size());
        int index = 0;
        for (auto it = utility_function_list.begin(); it != utility_function_list.end(); ++it, ++index)
        {
            const MethodInfo method_info = Variant::get_utility_function_info(*it);
            const bool has_return_value = Variant::has_utility_function_return_value(*it);
            v8::Local<v8::Object> method_info_obj = v8::Object::New(isolate);
            build_method_info(isolate, context, method_info, has_return_value, method_info_obj);
            array->Set(context, index, method_info_obj).Check();
        }
        info.GetReturnValue().Set(array);
    }

    static void _get_singletons(const v8::FunctionCallbackInfo<v8::Value>& info)
    {
        v8::Isolate* isolate = info.GetIsolate();
        v8::HandleScope handle_scope(isolate);
        v8::Local<v8::Context> context = isolate->GetCurrentContext();

        List<Engine::Singleton> singletons;
        Engine::get_singleton()->get_singletons(&singletons);
        v8::Local<v8::Array> array = v8::Array::New(isolate, singletons.size());
        int index = 0;
        for (auto it = singletons.begin(); it != singletons.end(); ++it, ++index)
        {
            Engine::Singleton singleton = *it;
            v8::Local<v8::Object> constant_obj = v8::Object::New(isolate);
            const StringName& class_name = singleton.ptr->get_class_name();
            if (!internal::VariantUtil::is_valid_name(singleton.class_name))
            {
                singleton.class_name = class_name;
                JSB_LOG(Verbose, "singleton (%s) hides the clas_name, restoring with '%s'", singleton.name, class_name);
            }

            set_field(isolate, context, constant_obj, "name", singleton.name);
            set_field(isolate, context, constant_obj, "class_name", singleton.class_name);
            set_field(isolate, context, constant_obj, "user_created", singleton.user_created);
            set_field(isolate, context, constant_obj, "editor_only", singleton.editor_only);
            array->Set(context, index, constant_obj).Check();
        }
        info.GetReturnValue().Set(array);
    }

    static void _delete_file(const v8::FunctionCallbackInfo<v8::Value>& info)
    {
        v8::Isolate* isolate = info.GetIsolate();
        v8::HandleScope handle_scope(isolate);

        if (info.Length() != 1 || !info[0]->IsString())
        {
            isolate->ThrowError("bad path");
            return;
        }
        internal::PathUtil::delete_file(impl::Helper::to_string(isolate, info[0]));
    }

}
#endif // endif TOOLS_ENABLED

namespace jsb
{

    void EditorUtilityFuncs::expose(v8::Isolate* isolate, v8::Local<v8::Context> context, v8::Local<v8::Object> jsb_obj)
    {
#if JSB_WITH_EDITOR_UTILITY_FUNCS
        v8::Local<v8::Object> editor_obj = v8::Object::New(isolate);

        jsb_obj->Set(context, impl::Helper::new_string_ascii(isolate, "editor"), editor_obj).Check();
        editor_obj->Set(context, impl::Helper::new_string_ascii(isolate, "get_class_doc"), v8::Function::New(context, _get_class_doc).ToLocalChecked()).Check();
        editor_obj->Set(context, impl::Helper::new_string_ascii(isolate, "get_classes"), v8::Function::New(context, _get_classes).ToLocalChecked()).Check();
        editor_obj->Set(context, impl::Helper::new_string_ascii(isolate, "get_global_constants"), v8::Function::New(context, _get_global_constants).ToLocalChecked()).Check();
        editor_obj->Set(context, impl::Helper::new_string_ascii(isolate, "get_singletons"), v8::Function::New(context, _get_singletons).ToLocalChecked()).Check();
        editor_obj->Set(context, impl::Helper::new_string_ascii(isolate, "get_utility_functions"), v8::Function::New(context, _get_utility_functions).ToLocalChecked()).Check();
        editor_obj->Set(context, impl::Helper::new_string_ascii(isolate, "get_primitive_types"), v8::Function::New(context, _get_primitive_types).ToLocalChecked()).Check();
        editor_obj->Set(context, impl::Helper::new_string_ascii(isolate, "delete_file"), v8::Function::New(context, _delete_file).ToLocalChecked()).Check();
        editor_obj->Set(context, impl::Helper::new_string_ascii(isolate, "VERSION_DOCS_URL"), impl::Helper::new_string(isolate, VERSION_DOCS_URL)).Check();
#endif
    }
}
