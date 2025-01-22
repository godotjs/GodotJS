#ifndef GODOTJS_STRING_NAMES_H
#define GODOTJS_STRING_NAMES_H
#include "jsb_internal_pch.h"
#include "jsb_macros.h"

#define jsb_string_name(name) ::jsb::internal::StringNames::get_singleton().sn_##name
#define jsb_literal(name) (sizeof(::jsb::internal::StringNames::sn_##name) == sizeof(StringName), #name)

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

        // we need to ignore some names used in godot (such as XXX.name) to avoid conflicts in javascript.
        // for instance, the GodotJS script name is determined with the `name` property of a javascript class.
        HashSet<StringName> ignored_;

        // replace confusing names (such as Dictionary/Array)
        HashMap<StringName, StringName> replacements_;     // original => modified (Array => GArray)
        HashMap<StringName, StringName> replacements_inv_; // modified => original (GArray => Array)

        StringNames();

        void add_replacement(const StringName& name, const StringName& replacement);

    public:
        jsb_force_inline static StringNames& get_singleton() { return *singleton_; }

        jsb_force_inline bool is_ignored(const StringName& p_name) const { return ignored_.has(p_name); }

        jsb_force_inline bool is_replaced_name(const StringName& p_name) const { return replacements_.has(p_name); }

        jsb_force_inline StringName get_replaced_name(const StringName& p_name) const
        {
            if (const StringName* ptr = replacements_.getptr(p_name)) return *ptr;
            return p_name;
        }

        jsb_force_inline StringName get_original_name(const StringName& p_name) const
        {
            if (const StringName* ptr = replacements_inv_.getptr(p_name)) return *ptr;
            return p_name;
        }

        StringName sn_godot_typeloader;
        StringName sn_godot_postbind;

#pragma push_macro("DEF")
#   undef DEF
#   define DEF(KeyName) StringName sn_##KeyName;
#   include "jsb_string_names.def.h"
#pragma pop_macro("DEF")

    };
}
#endif
