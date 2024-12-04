#include "jsb_string_names.h"
namespace jsb::internal
{
    StringNames* StringNames::singleton_ = nullptr;

    void StringNames::add_replacement(const StringName& name, const StringName& replacement)
    {
        replacements_.insert(name, replacement);
        replacements_inv_.insert(replacement, name);
    }

    StringNames::StringNames()
    {
#pragma push_macro("DEF")
#   undef DEF
#   define DEF(KeyName) sn_##KeyName = _scs_create(#KeyName);
#   include "jsb_string_names.def.h"
#pragma pop_macro("DEF")

        ignored_.insert(sn_name);
        add_replacement(Variant::get_type_name(Variant::DICTIONARY), "GDictionary");
        add_replacement(Variant::get_type_name(Variant::ARRAY), "GArray");
        add_replacement(GetTypeInfo<Error>::get_class_info().class_name, "GError");
    }

}
