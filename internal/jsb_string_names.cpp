#include "jsb_string_names.h"
namespace jsb::internal
{
    StringNames* StringNames::singleton_ = nullptr;

    StringNames::StringNames()
    {
        prototype = _scs_create("prototype");
        value = _scs_create("value");
        loaded = _scs_create("loaded");
        name = _scs_create("name");
        type = _scs_create("type");
        evaluator = _scs_create("evaluator");
        _notification = _scs_create("_notification");
        Node = _scs_create("Node");
    }

}
