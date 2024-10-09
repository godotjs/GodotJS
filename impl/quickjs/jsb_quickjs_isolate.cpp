#include "jsb_quickjs_isolate.h"

namespace v8
{
    namespace details
    {
        void* js_malloc(JSMallocState* s, size_t size)
        {
            return memalloc(size);
        }

        void js_free(JSMallocState* s, void* ptr)
        {
            memfree(ptr);
        }

        void* js_realloc(JSMallocState* s, void* ptr, size_t size)
        {
            return memrealloc(ptr, size);
        }
    }

    Isolate *Isolate::New(const CreateParams &params)
    {
        Isolate* isolate = memnew(Isolate);
        return isolate;
    }

    Isolate::Isolate() : handle_scope_(nullptr)
    {
        const JSMallocFunctions mf = { details::js_malloc, details::js_free, details::js_realloc, nullptr };
        runtime_ = JS_NewRuntime2(&mf, this);

        // JSClassDef class_def;
        // class_def.finalizer;
    }

    Isolate::~Isolate()
    {
        JS_FreeRuntime(runtime_);
    }

}
