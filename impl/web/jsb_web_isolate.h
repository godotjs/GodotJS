#ifndef GODOTJS_WEB_ISOLATE_H
#define GODOTJS_WEB_ISOLATE_H

#include "core/os/memory.h"
#include <vector>

#include "jsb_web_interop.h"
#include "jsb_web_stub_types.h"
#include "jsb_web_value.h"
#include "jsb_web_primitive.h"
#include "jsb_web_local_handle.h"

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
		friend class HandleScope;
        friend class Context;
        friend class ScopedValue;

        friend class Symbol;
        friend class Object;

        template<typename T>
        friend class Global;

		static struct StaticInitializer { StaticInitializer() { jsb_web_init(); } } init;
        JSB_WEB_TYPE(EngineHandle) id_;
        void* data_;
        void* context_data_;

        class HandleScope* handle_scope_;
        std::vector<jsb::vm::JSValue> stack_;

        Isolate();
    public:
        ~Isolate();

        enum GarbageCollectionType
        {
            kFullGarbageCollection,
        };

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
        void* GetData(uint32_t slot) const;

        Local<Context> GetCurrentContext();

        template <int N>
        Local<Value> ThrowError(const char (&message)[N]) {
            return ThrowError(String::NewFromUtf8Literal(this, message));
        }
        Local<Value> ThrowError(Local<String> message);

        // STUB CALLS
        void AddGCPrologueCallback(GCCallback cb, GCType type = kGCTypeAll) {}
        void AddGCEpilogueCallback(GCCallback cb, GCType type = kGCTypeAll) {}
        void PerformMicrotaskCheckpoint() {}
        void LowMemoryNotification() {}
        void RequestGarbageCollectionForTesting(GarbageCollectionType type) {}
        void SetBatterySaverMode(bool) {}

    public:
        // INTERNAL
        uint32_t alloc_value(const jsb::vm::JSValue& value);
        const jsb::vm::JSValue& get_value(uint32_t index);

        jsb::vm::JSValue& _at(uint32_t index)
        {
            if (stack_.size() <= index)
            {
                stack_.resize(index + 64);
            }
            return stack_[index];
        }
    };

    class HandleScope
    {
    private:
        friend class Isolate;

        Isolate* isolate_;
        HandleScope* last_;
        uint32_t base_;
        uint32_t size_;

    public:
        HandleScope(Isolate* isolate);
        ~HandleScope();
    };
}
#endif
