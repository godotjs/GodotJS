#ifndef GODOTJS_GCOBJECT_H
#define GODOTJS_GCOBJECT_H
#include "jsb_pch.h"

namespace jsb
{
    class GCObject
    {
    public:
        GCObject() = default;
        virtual ~GCObject() = default;
    };
}
#endif
