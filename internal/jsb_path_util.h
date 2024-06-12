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

        // return the upper directory path ('/' and '\' are both accepted)
        static String dirname(const String& p_name);

        /**
         * \brief extract the relative path (eliminate all '.' and '..')
         * \note '\' will NOT be handled
         */
        static Error extract(const String& p_path, String& o_path);

        static String extends_with(const String& p_path, const String& p_ext);

        static bool find(const String& p_path);

        /**
         * \brief if the given path string is absolute
         */
        static bool is_absolute_path(const String& p_path);

    };

}

#endif
