#ifndef GODOTJS_QUICKJS_DATA_H
#define GODOTJS_QUICKJS_DATA_H
#include "jsb_quickjs_pch.h"

namespace v8
{
    class Isolate;

    class Data
    {
    public:
        Isolate* isolate_ = nullptr;
        uint16_t stack_ = 0;
        uint16_t position_ = 0;
    };
}
#endif
