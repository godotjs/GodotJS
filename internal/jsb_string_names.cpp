#include "jsb_string_names.h"
namespace jsb::internal
{
    StringNames* StringNames::singleton_ = nullptr;

    StringNames::StringNames()
    {
#pragma push_macro("DEF")
#   undef DEF
#   define DEF(KeyName) sn_##KeyName = _scs_create(#KeyName)
#   include "jsb_string_names.def.h"
#pragma pop_macro("DEF")
    }

}
