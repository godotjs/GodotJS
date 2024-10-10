#include "jsb_quickjs_isolate.h"
#include "jsb_quickjs_handle.h"
#include "jsb_quickjs_context.h"

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

    Isolate::Isolate() : handle_scope_(nullptr), stack_pos_(1)
    {
        const JSMallocFunctions mf = { details::js_malloc, details::js_free, details::js_realloc, nullptr };
        rt_ = JS_NewRuntime2(&mf, this);
        ctx_ = JS_NewContext(rt_);

        JS_SetRuntimeOpaque(rt_, this);
        JS_SetContextOpaque(ctx_, this);

        jsb_ensure(emplace_(JS_UNDEFINED) == jsb::impl::StackPos::Undefined);
        jsb_ensure(emplace_(JS_NULL) == jsb::impl::StackPos::Null);
        jsb_ensure(emplace_(JS_TRUE) == jsb::impl::StackPos::True);
        jsb_ensure(emplace_(JS_FALSE) == jsb::impl::StackPos::False);
        jsb_ensure(emplace_(JS_NewStringLen(ctx_, "", 0)) == jsb::impl::StackPos::EmptyString);

        JSClassDef class_def;
        class_def.class_name = "UniversalBridgeClass";
        class_def.finalizer = _finalizer;
        class_def.exotic = nullptr;
        class_def.gc_mark = nullptr;
        class_def.call = nullptr;

        JS_NewClass(rt_, get_class_id(), &class_def);
    }

    Isolate::~Isolate()
    {
        jsb_check(!rt_);
    }

    void Isolate::Dispose()
    {
        jsb_check(rt_);

        // cleanup
        jsb_check(!handle_scope_);
        jsb_check(stack_pos_ == jsb::impl::StackPos::Num);
        for (int i = 0; i < jsb::impl::StackPos::Num; ++i)
        {
            JS_FreeValue(ctx_, stack_[i]);
        }

        // dispose
        JS_FreeContext(ctx_);
        ctx_ = nullptr;
        JS_FreeRuntime(rt_);
        rt_ = nullptr;

        memdelete(this);
    }

    void Isolate::SetData(int index, void* data)
    {
        jsb_check(index == 0);
        embedder_data_ = data;
    }

    uint16_t Isolate::emplace_(JSValue value)
    {
        jsb_check(stack_pos_ < jsb::impl::kMaxStackSize);

        const uint16_t pos = stack_pos_++;
        stack_[pos] = value;
        return pos;
    }

    void Isolate::_finalizer(JSRuntime* rt, JSValue val)
    {
        Isolate* isolate = (Isolate*) JS_GetRuntimeOpaque(rt);
        const jsb::internal::Index64 index = (jsb::internal::Index64)(uintptr_t) JS_GetOpaque(val, get_class_id());
        const jsb::impl::InternalDataPtr data =  isolate->get_internal_data(index);
        if (data->weak.callback)
        {
            const WeakCallbackInfo<void>::Callback callback = (WeakCallbackInfo<void>::Callback) data->weak.callback;
            const WeakCallbackInfo<void> info(isolate, data->weak.parameter);
            callback(info);
        }
    }

    void Isolate::GetHeapStatistics(HeapStatistics* statistics)
    {
        //TODO
    }

    void Isolate::PerformMicrotaskCheckpoint()
    {
        //TODO
    }

    Local<Context> Isolate::GetCurrentContext()
    {
        return Local<Context>(Data(this, 0));
    }

}
