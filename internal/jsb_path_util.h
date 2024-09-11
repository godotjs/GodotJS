#ifndef GODOTJS_PATH_UTIL_H
#define GODOTJS_PATH_UTIL_H

#include "core/string/ustring.h"

namespace jsb::internal
{
    class PathUtil
    {
    public:
        static String combine(const String& p_base, const String& p_add)
        {
            if (p_base.ends_with("/"))
            {
                return p_base + p_add;
            }
            return p_base.is_empty() ? p_add : p_base + '/' + p_add;
        }

        static String combine(const String& p_base, const String& p_add1, const String& p_add2)
        {
            return combine(p_base, combine(p_add1, p_add2));
        }

        static String to_platform_specific_path(const String& p_path);

        // return the upper directory path ('/' and '\' are both accepted)
        static String dirname(const String& p_name);

        // return the last component of the give path ('/' and '\' are both accepted)
        static String get_last_component(const String& p_name);

        /**
         * \brief extract the relative path (eliminate all '.' and '..')
         * \note '\' will NOT be handled
         */
        static Error extract(const String& p_path, String& o_path);

        static String extends_with(const String& p_path, const String& p_ext);

        /**
         * \brief if the given path string is absolute
         */
        static bool is_absolute_path(const String& p_path);

        // convert typescript path into javascript path
        static String convert_typescript_path(const String& p_source_path);

        // convert javascript path back into typescript path
        static String convert_javascript_path(const String& p_source_path);

        static void delete_file(const char* p_path, int p_length);
    };

}

#endif
