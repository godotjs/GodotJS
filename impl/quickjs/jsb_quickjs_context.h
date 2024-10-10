#ifndef GODOTJS_QUICKJS_CONTEXT_H
#define GODOTJS_QUICKJS_CONTEXT_H

#include "jsb_quickjs_pch.h"
#include "jsb_quickjs_handle.h"

namespace v8
{
    class Object;

    class Context : public Data
    {
    public:
        class Scope
        {
        public:
            Scope(Local<Context> context) {}
        };

        void* GetAlignedPointerFromEmbedderData(int index) const;
        void SetAlignedPointerInEmbedderData(int index, void* data);

        static Local<Context> New(Isolate* isolate);
        Local<Object> Global() const;
    };
}

#endif
