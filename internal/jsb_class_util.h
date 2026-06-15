#ifndef GODOTJS_CLASS_UTIL_H
#define GODOTJS_CLASS_UTIL_H

namespace jsb::internal
{

#if GODOT_4_6_OR_NEWER
    using ClassConstantMap = AHashMap<StringName, int64_t>;
#else
    using ClassConstantMap = HashMap<StringName, int64_t>;
#endif

#if GODOT_4_7_OR_NEWER
    using ClassEnumInfo = GDType::EnumInfo;
#else
    using ClassEnumInfo = ClassDB::ClassInfo::EnumInfo;
#endif

#if GODOT_4_7_OR_NEWER
	using ClassSignalMap = AHashMap<StringName, const MethodInfo*>;
#elif GODOT_4_6_OR_NEWER
	using ClassSignalMap = AHashMap<StringName, MethodInfo>;
#else
	using ClassSignalMap = HashMap<StringName, MethodInfo>;
#endif

    struct ClassUtil
    {
        // jsb_force_inline static bool check_class(const StringName& p_class_name, const StringName& p_expected_class_name)
        // {
        //     return ClassDB::is_parent_class(p_class_name, p_expected_class_name);
        // }

        // static const MethodInfo& get_method_info_recursively(const ClassDB::ClassInfo& p_class_info, const StringName& method_name)
        // {
        //     const HashMap<StringName, MethodInfo>::ConstIterator method_it = p_class_info.virtual_methods_map.find(method_name);
        //     if (method_it != p_class_info.virtual_methods_map.end()) return method_it->value;
        //     jsb_check(p_class_info.inherits_ptr);
        //     return get_method_info_recursively(*p_class_info.inherits_ptr, method_name);
        // }

        template <typename T>
        static constexpr decltype(auto) get_value(T&& arg)
        {
            if constexpr (std::is_pointer_v<std::remove_reference_t<T>>)
            {
                return *arg;
            }
            else
            {
                return std::forward<T>(arg);
            }
        }

#if GODOT_4_7_OR_NEWER

        static const StringName& get_internal_class_name(const ClassDB::ClassInfo& class_info)
        {
            return class_info.gdtype->get_name();
        }

        template <typename Lambda>
        static void for_enum_internal_names(const ClassEnumInfo &enum_info, Lambda callback)
        {
            for (auto it = enum_info.values.begin(); it != enum_info.values.end(); ++it)
            {
                callback(it->key);
            }
        }

        template <typename Lambda>
        static void for_class_enums(const ClassDB::ClassInfo& class_info, Lambda callback)
        {
            for (auto it : class_info.gdtype->get_enum_map(true))
            {
                callback(it.key, *it.value);
            }
        }

        static const ClassConstantMap& get_class_constant_map(const ClassDB::ClassInfo& class_info)
        {
            return class_info.gdtype->get_integer_constant_map(true);
        }

        static const AHashMap<StringName, const ClassEnumInfo*>& get_class_enum_map(const ClassDB::ClassInfo& class_info)
        {
            return class_info.gdtype->get_enum_map(true);
        }

        static const ClassSignalMap& get_class_signal_map(const ClassDB::ClassInfo& class_info)
        {
            return class_info.gdtype->get_signal_map(true);
        }

        static const ClassConstantMap& get_class_enum_constants(const ClassDB::ClassInfo& class_info, const StringName& enum_name)
        {
            return class_info.gdtype->get_enum_map(true)[enum_name]->values;
        }

        static String get_class_super_type_internal_name(const ClassDB::ClassInfo& class_info)
        {
            return class_info.gdtype->get_super_type_name();
        }

#else

        static constexpr const StringName& get_internal_class_name(const ClassDB::ClassInfo& class_info)
        {
            return class_info.name;
        }

        template <typename Lambda>
        static void for_enum_internal_names(const ClassEnumInfo &enum_info, Lambda callback)
        {
            for (List<StringName>::ConstIterator it = enum_info.constants.begin(); it != enum_info.constants.end(); ++it)
            {
                callback(*it);
            }
        }

        template <typename Lambda>
        static void for_class_enums(const ClassDB::ClassInfo& class_info, Lambda callback)
        {
            for (auto it : class_info.enum_map)
            {
                callback(it.key, it.value);
            }
        }

        static const ClassConstantMap& get_class_constant_map(const ClassDB::ClassInfo& class_info)
        {
            return class_info.constant_map;
        }

        static const HashMap<StringName, ClassEnumInfo>& get_class_enum_map(const ClassDB::ClassInfo& class_info)
        {
            return class_info.enum_map;
        }

        static const ClassSignalMap& get_class_signal_map(const ClassDB::ClassInfo& class_info)
        {
            return class_info.signal_map;
        }

        static const ClassConstantMap& get_class_enum_constants(const ClassDB::ClassInfo& class_info, const StringName& _enum_name)
        {
            return class_info.constant_map;
        }

        static String get_class_super_type_internal_name(const ClassDB::ClassInfo& class_info)
        {
            return class_info.inherits;
        }

#endif

    };
}
#endif
