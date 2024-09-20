#ifndef GODOTJS_WEB_CONTEXT_H
#define GODOTJS_WEB_CONTEXT_H
#include "jsb_web_primitive_data.h"

namespace v8
{
    class Isolate;
    class Object;

    template<typename T>
    class Local;

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
        Isolate* GetIsolate() const { return isolate_; }

        static Local<Context> New(Isolate* isolate);
    };
}
#endif
