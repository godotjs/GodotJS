#include "jsb_web_primitive_data.h"
#include "jsb_web_isolate.h"

namespace v8
{
    bool Data::IsArray() const
    {
        return isolate_->get_value(address_).type == jsb::vm::JSValue::Array;
    }

    bool Data::IsUndefined() const
    {
        return isolate_->get_value(address_).type == jsb::vm::JSValue::Undefined;
    }

    bool Data::IsNull() const
    {
        return isolate_->get_value(address_).type == jsb::vm::JSValue::Null;
    }

    bool Data::IsObject() const
    {
        return isolate_->get_value(address_).type == jsb::vm::JSValue::Object;
    }

}
