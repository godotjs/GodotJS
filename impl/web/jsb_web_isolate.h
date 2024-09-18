#ifndef GODOTJS_WEB_ISOLATE_H
#define GODOTJS_WEB_ISOLATE_H

#include "jsb_web_interop.h"
#include "core/os/memory.h"

namespace v8
{
    class ArrayBuffer
    {
    public:
        class Allocator
        {
            virtual void* Allocate(size_t length) = 0;
            virtual void* AllocateUninitialized(size_t length) = 0;
            virtual void Free(void* data, size_t length) = 0;
        };
    };
    class Isolate
    {
    private:
		friend struct HandleScope;

		static struct StaticInitializer { StaticInitializer() { jsb_web_init(); } } init;
        JSB_WEB_TYPE(EngineHandle) id_;
        void* data_;

        Isolate();
    public:
        ~Isolate();

        struct CreateParams
        {
			ArrayBuffer::Allocator* array_buffer_allocator;
		};

        // nothing to do
        struct Scope { Scope(Isolate* isolate) {} };

        static Isolate* New(const CreateParams& params)
        {
            Isolate* instance = memnew(Isolate);
            return instance;
        }

        void Dispose();

        void SetData(uint32_t slot, void* data);
    };

    struct HandleScope
    {
        HandleScope(Isolate* isolate);
        ~HandleScope();
    };
}
#endif
