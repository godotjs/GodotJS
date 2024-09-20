#ifndef GODOTJS_WEB_ISOLATE_H
#define GODOTJS_WEB_ISOLATE_H

#include "core/os/memory.h"
#include <vector>

#include "jsb_web_interop.h"
#include "jsb_web_stub_types.h"
#include "jsb_web_promise.h"

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

    class HandleScope;
    class Context;
    class Value;
    class String;

    class Isolate
    {
    public:
		static struct StaticInitializer { StaticInitializer() { jsapi_init(); } } init;
        int id_;

        void* isolate_data_;
        void* context_data_;

        HandleScope* top_;

        Isolate();
        ~Isolate();

        void GetHeapStatistics(HeapStatistics* heap_statistics);

        enum GarbageCollectionType
        {
            kFullGarbageCollection,
        };

        struct CreateParams
        {
			ArrayBuffer::Allocator* array_buffer_allocator;
		};

        // Isolate::Scope nothing to do
        struct Scope { Scope(Isolate* isolate) {} };

        static Isolate* New(const CreateParams& params)
        {
            Isolate* instance = memnew(Isolate);
            return instance;
        }

        void Dispose();

        void SetPromiseRejectCallback(PromiseRejectCallback callback);
        void SetData(uint32_t slot, void* data);
        void* GetData(uint32_t slot) const;

        Local<Context> GetCurrentContext();

        Local<Value> ThrowError(Local<String> message);

        template <int N>
        Local<Value> ThrowError(const char (&message)[N])
        {
            return ThrowError(String::NewFromUtf8Literal(this, message));
        }

        // STUB CALLS
        void AddGCPrologueCallback(GCCallback cb, GCType type = kGCTypeAll) {}
        void AddGCEpilogueCallback(GCCallback cb, GCType type = kGCTypeAll) {}
        void PerformMicrotaskCheckpoint() {}
        void LowMemoryNotification() {}
        void RequestGarbageCollectionForTesting(GarbageCollectionType type) {}
        void SetBatterySaverMode(bool) {}

    };
}
#endif
