#ifndef JAVASCRIPT_GCOBJECT_H
#define JAVASCRIPT_GCOBJECT_H
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
