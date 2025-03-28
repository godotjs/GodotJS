#ifndef GODOTJS_NAMING_UTIL_H
#define GODOTJS_NAMING_UTIL_H

#include "core/string/ustring.h"
#include "jsb_settings.h"

namespace jsb::internal
{
	class NamingUtil
	{
	public:
		static String pascal_to_pascal_case(const String &p_identifier);

		static String snake_to_pascal_case(const String &p_identifier, bool p_input_is_upper = false);

		static String snake_to_camel_case(const String &p_identifier, bool p_input_is_upper = false);

		static List<StringName> get_exposed_class_list();

		static String get_class_name(const String& p_original_name)
		{
			if (Settings::get_camel_case_bindings_enabled())
			{
				return pascal_to_pascal_case(p_original_name);
			}

			if (p_original_name == Variant::get_type_name(Variant::DICTIONARY))
			{
				return "GDictionary";
			}

			if (p_original_name == Variant::get_type_name(Variant::ARRAY))
			{
				return "GArray";
			}

			return p_original_name;
		}

		static String get_constant_name(const String& p_original_name)
		{
			return p_original_name;
		}

		static String get_enum_name(const String& p_original_name)
		{
			if (Settings::get_camel_case_bindings_enabled())
			{
				return pascal_to_pascal_case(p_original_name);
			}

			return p_original_name;
		}

		static String get_enum_value_name(const String& p_original_value_name)
		{
			if (Settings::get_camel_case_bindings_enabled())
			{
				return snake_to_pascal_case(p_original_value_name, true);
			}

			return p_original_value_name;
		}

		static String get_member_name(const String& p_original_name)
		{
			if (Settings::get_camel_case_bindings_enabled())
			{
				return snake_to_camel_case(p_original_name);
			}

			return p_original_name;
		}

		static String get_parameter_name(const String& p_original_name)
		{
			if (Settings::get_camel_case_bindings_enabled())
			{
				return snake_to_camel_case(p_original_name);
			}

			return p_original_name;
		}
	};
}

#endif
