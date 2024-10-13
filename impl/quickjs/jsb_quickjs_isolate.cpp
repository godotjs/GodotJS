#include "jsb_quickjs_isolate.h"
#include "jsb_quickjs_handle.h"
#include "jsb_quickjs_context.h"

namespace v8
{
    namespace details
    {
        // crash val is an exception
        jsb_force_inline JSValue verified(const JSValue val)
        {
            jsb_check(JS_VALUE_GET_TAG(val) != JS_TAG_EXCEPTION);
            return val;
        }

        void* js_malloc(JSMallocState* s, size_t size)
        {
            return memalloc(size);
        }

        void js_free(JSMallocState* s, void* ptr)
        {
            // avoid error prints on nullptr
            if (ptr)
            {
                memfree(ptr);

                // it's dangerous, but, just haven't found a better solution
                ((Isolate*) s->opaque)->_invalidate_phantom(ptr);
            }
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

    Isolate::Isolate() : handle_scope_(nullptr), stack_pos_(0)
    {
        const JSMallocFunctions mf = { details::js_malloc, details::js_free, details::js_realloc, nullptr };
        rt_ = JS_NewRuntime2(&mf, this);
        ctx_ = JS_NewContext(rt_);
        const JSValue global = JS_GetGlobalObject(ctx_);

        JS_SetRuntimeOpaque(rt_, this);
        JS_SetContextOpaque(ctx_, this);
        JS_SetHostPromiseRejectionTracker(rt_, _promise_rejection_tracker, this);

        //TODO dead loop checker
        // JS_SetInterruptHandler

        jsb_ensure(emplace_(JS_UNDEFINED) == jsb::impl::StackPos::Undefined);
        jsb_ensure(emplace_(JS_NULL) == jsb::impl::StackPos::Null);
        jsb_ensure(emplace_(JS_TRUE) == jsb::impl::StackPos::True);
        jsb_ensure(emplace_(JS_FALSE) == jsb::impl::StackPos::False);
        jsb_ensure(emplace_(details::verified(JS_NewStringLen(ctx_, "", 0))) == jsb::impl::StackPos::EmptyString);
        jsb_ensure(emplace_(details::verified(JS_GetProperty(ctx_, global, jsb::impl::JS_ATOM_Symbol))) == jsb::impl::StackPos::SymbolClass);
        jsb_ensure(emplace_(details::verified(JS_GetProperty(ctx_, global, jsb::impl::JS_ATOM_Map))) == jsb::impl::StackPos::MapClass);
        jsb_ensure(emplace_(JS_NULL) == jsb::impl::StackPos::Exception);
        jsb_check(stack_pos_ == jsb::impl::StackPos::Num);

        JSClassDef class_def;
        class_def.class_name = "UniversalBridgeClass";
        class_def.finalizer = _finalizer;
        class_def.exotic = nullptr;
        class_def.gc_mark = nullptr;
        class_def.call = nullptr;

        JS_NewClass(rt_, get_class_id(), &class_def);
        JS_FreeValue(ctx_, global);
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

    uint16_t Isolate::push_map()
    {
        const JSValue ctor = JS_GetProperty(ctx_, stack_[jsb::impl::StackPos::MapClass], jsb::impl::JS_ATOM_constructor);
        const JSValue map = details::verified(JS_CallConstructor(ctx_, details::verified(ctor), 0, nullptr));
        JS_FreeValue(ctx_, ctor);
        return push_steal(details::verified(map));
    }

    uint16_t Isolate::push_symbol()
    {
        const JSValue ctor = JS_GetProperty(ctx_, stack_[jsb::impl::StackPos::SymbolClass], jsb::impl::JS_ATOM_constructor);
        const JSValue sym = details::verified(JS_CallConstructor(ctx_, details::verified(ctor), 0, nullptr));
        JS_FreeValue(ctx_, ctor);
        return push_steal(details::verified(sym));
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

            isolate->internal_data_.remove_at_checked(index);
        }
    }

    void Isolate::GetHeapStatistics(HeapStatistics* statistics)
    {
        //TODO
    }

    void Isolate::PerformMicrotaskCheckpoint()
    {
        JSContext* ctx;
        HandleScope handle_scope(this);

        while (true)
        {
            const int err = JS_ExecutePendingJob(rt_, &ctx);
            if (err >= 0)
            {
                if (JS_IsJobPending(rt_) == 0)
                {
                    break;
                }
            }
            else
            {
                jsb::impl::TryCatch try_catch(this);
                if (try_catch.has_caught())
                {
                    ::String message;
                    ::String stacktrace;
                    try_catch.get_message(&message, &stacktrace);
                    JSB_LOG(Error, "uncaught exception in pending job: %s\n%s", message, stacktrace);
                }
            }
        }
    }

    Local<Context> Isolate::GetCurrentContext()
    {
        return Local<Context>(Data(this, 0));
    }

    void Isolate::_promise_rejection_tracker(JSContext* ctx, JSValue promise, JSValue reason, int is_handled, void* user_data)
    {
        if (is_handled != 1)
        {
            Isolate* isolate = (Isolate*) user_data;
            if (!isolate->promise_reject_) return;

            HandleScope handle_scope(isolate);
            const PromiseRejectMessage message(isolate,
                kPromiseRejectWithNoHandler,
                isolate->push_copy(promise),
                isolate->push_copy(reason)
            );
            isolate->promise_reject_(message);
        }
    }

    bool Isolate::try_catch()
    {
        const JSValue ex = JS_GetException(ctx_);
        const JSValue last = stack_[jsb::impl::StackPos::Exception];
        jsb_check(JS_IsNull(last));
        stack_[jsb::impl::StackPos::Exception] = ex;
        return !JS_IsNull(ex);
    }

}
