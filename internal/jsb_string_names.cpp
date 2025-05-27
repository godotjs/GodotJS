#include "jsb_string_names.h"
namespace jsb::internal
{
    StringNames* StringNames::singleton_ = nullptr;

    StringNames::StringNames()
    {
#pragma push_macro("DEF")
#   undef DEF
#   if GODOT_4_5_OR_NEWER
#       define DEF(KeyName) sn_##KeyName = StringName(#KeyName);
#   else
#       define DEF(KeyName) sn_##KeyName = _scs_create(#KeyName);
#   endif
#   include "jsb_string_names.def.h"
#pragma pop_macro("DEF")
#if GODOT_4_5_OR_NEWER
        sn_godot_typeloader = StringName("godot.typeloader");
        sn_godot_postbind = StringName("_post_bind_");
#else
        sn_godot_typeloader = _scs_create("godot.typeloader");
        sn_godot_postbind = _scs_create("_post_bind_");
#endif

        ignored_.insert(sn_name);
    }

}
