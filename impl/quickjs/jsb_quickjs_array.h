#ifndef GODOTJS_QUICKJS_ARRAY_H
#define GODOTJS_QUICKJS_ARRAY_H
#include "jsb_quickjs_object.h"

namespace v8
{
    class Array : public Object
    {
    public:
        uint32_t Length() const;
    };
}
#endif
