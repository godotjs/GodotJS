#ifndef GODOTJS_WEB_CONTEXT_H
#define GODOTJS_WEB_CONTEXT_H
#include "jsb_web_local_handle.h"
#include "jsb_web_primitive_data.h"

namespace v8
{
    class Isolate;
    class Object;

    class Context : public Data
    {
    public:
        class Scope
        {
        public:
            Scope(const Local<Context>&) {}
        };

        void SetAlignedPointerInEmbedderData(int index, void* ptr);
        void* GetAlignedPointerFromEmbedderData(int index) const;

        Local<Object> Global();

        static Local<Context> New(Isolate* isolate);
    };
}
#endif
