#ifndef GODOTJS_STRING_NAMES_H
#define GODOTJS_STRING_NAMES_H
#include "jsb_macros.h"

#define jsb_string_name(name) ::jsb::internal::StringNames::get_singleton().sn_##name

class GodotJSScriptLanguage;

namespace jsb::internal
{
    class StringNames
    {
    private:
        friend class ::GodotJSScriptLanguage;

        static StringNames* singleton_;

        static void create() { singleton_ = memnew(StringNames); }
        static void free()
        {
            memdelete(singleton_);
            singleton_ = nullptr;
        }

        StringNames();

    public:
        jsb_force_inline static StringNames& get_singleton() { return *singleton_; }

#pragma push_macro("DEF")
#   undef DEF
#   define DEF(KeyName) StringName sn_##KeyName
#   include "jsb_string_names.def.h"

#pragma pop_macro("DEF")

    };
}
#endif
