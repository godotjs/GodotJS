#include "jsb_quickjs_isolate.h"

#include "jsb_quickjs_catch.h"
#include "jsb_quickjs_handle.h"
#include "jsb_quickjs_context.h"

namespace v8
{
    struct IsolateInternalFunctions
    {
        // crash val is an exception
        jsb_force_inline static JSValue verified(const JSValue val)
        {
            jsb_check(JS_VALUE_GET_TAG(val) != JS_TAG_EXCEPTION);
            return val;
        }

        jsb_force_inline static int verified(const int val)
        {
            jsb_check(val != -1);
            return val;
        }

#if JSB_PREFER_QUICKJS_NG
        static void* js_calloc(void* opaque, size_t count, size_t size)
        {
            return memalloc(size * count);
        }

        static void* js_malloc(void* opaque, size_t size)
        {
            return memalloc(size);
        }

        static void js_free(void* opaque, void* ptr)
        {
            // avoid error prints on nullptr
            if (ptr)
            {
                memfree(ptr);

                // it's dangerous, but, just haven't found a better solution
                ((Isolate*) opaque)->_invalidate_phantom(ptr);
            }
        }

        static void* js_realloc(void* opaque, void* ptr, size_t size)
        {
            //TODO JSObject would never be reallocated, true?
            //     (otherwise, we need an indirect way to map it in Global handle, and remap it in Isolate on it reallocated)
            // jsb_check(!((Isolate*) s->opaque)->_has_phantom(ptr));
            return memrealloc(ptr, size);
        }

        static size_t js_malloc_usable_size(const void* ptr) 
        {
            return 0;
        }
#else 
        static void* js_malloc(JSMallocState* s, size_t size)
        {
            return memalloc(size);
        }

        static void js_free(JSMallocState* s, void* ptr)
        {
            // avoid error prints on nullptr
            if (ptr)
            {
                memfree(ptr);

                // it's dangerous, but, just haven't found a better solution
                ((Isolate*) s->opaque)->_invalidate_phantom(ptr);
            }
        }

        static void* js_realloc(JSMallocState* s, void* ptr, size_t size)
        {
            //TODO JSObject would never be reallocated, true?
            //     (otherwise, we need an indirect way to map it in Global handle, and remap it in Isolate on it reallocated)
            // jsb_check(!((Isolate*) s->opaque)->_has_phantom(ptr));
            return memrealloc(ptr, size);
        }
#endif

    };

    using details = IsolateInternalFunctions;

    Isolate *Isolate::New(const CreateParams &params)
    {
        Isolate* isolate = memnew(Isolate);
        return isolate;
    }

    Isolate::Isolate() : ref_count_(1), disposed_(false), handle_scope_(nullptr), stack_pos_(0)
    {
#if JSB_PREFER_QUICKJS_NG
        const JSMallocFunctions mf = { details::js_calloc, details::js_malloc, details::js_free, details::js_realloc, details::js_malloc_usable_size };
#else
        const JSMallocFunctions mf = { details::js_malloc, details::js_free, details::js_realloc, nullptr };
#endif
        rt_ = JS_NewRuntime2(&mf, this);
        ctx_ = JS_NewContext(rt_);
        class_id_.init(rt_);
        static_assert(sizeof(stack_) == sizeof(JSValue) * jsb::impl::kMaxStackSize);

        // should be fine to leave it uninitialized
        // memset(stack_, 0, sizeof(stack_));

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

        details::verified(JS_NewClass(rt_, get_class_id(), &class_def));
        JS_FreeValue(ctx_, global);
    }

    Isolate::~Isolate()
    {
        jsb_check(!rt_);
    }

    void Isolate::_release()
    {
        JSB_QUICKJS_LOG(VeryVerbose, "release quickjs runtime");

        // manually run GC before freeing the context/runtime to ensure all objects free-ed (valuetype objects)
        JS_RunGC(rt_);

        // cleanup
        jsb_check(!handle_scope_);
        jsb_check(phantom_.is_empty());
        jsb_check(stack_pos_ == jsb::impl::StackPos::Num);
        for (int i = 0; i < jsb::impl::StackPos::Num; ++i)
        {
            JS_FreeValue(ctx_, stack_[i]);
        }

        swap_free_queue();
        swap_free_queue();
        jsb_check(front_free_queue_.is_empty());
        jsb_check(back_free_queue_.is_empty());

#if !JSB_STRICT_DISPOSE
        // make it behave like v8, not to trigger gc callback after the isolate disposed
        internal_data_.clear();
#endif

        // dispose the runtime
        JS_FreeContext(ctx_);
        ctx_ = nullptr;
        JS_FreeRuntime(rt_);
        rt_ = nullptr;

#if JSB_STRICT_DISPOSE
        jsb_check(internal_data_.is_empty());
#endif

        memdelete(this);
    }

    void Isolate::Dispose()
    {
        jsb_check(!disposed_);
        disposed_ = true;
        _remove_reference();
    }

    void Isolate::SetData(int index, void* data)
    {
        jsb_check(index == 0);
        embedder_data_ = data;
    }

    uint16_t Isolate::push_map()
    {
        const JSValue val = JS_CallConstructor2(ctx_, details::verified(stack_[jsb::impl::StackPos::MapClass]), JS_UNDEFINED, 0, nullptr);
        jsb_check(JS_IsMap(ctx_, val));
        return push_steal(details::verified(val));
    }

    uint16_t Isolate::push_symbol()
    {
        const JSValue val = JS_CallConstructor2(ctx_, details::verified(stack_[jsb::impl::StackPos::SymbolClass]), JS_UNDEFINED, 0, nullptr);
        jsb_check(JS_VALUE_GET_TAG(val) == JS_TAG_SYMBOL);
        return push_steal(details::verified(val));
    }

    void Isolate::_finalizer(JSRuntime* rt, JSValue val)
    {
        Isolate* isolate = (Isolate*) JS_GetRuntimeOpaque(rt);
        const jsb::impl::InternalDataID index = (jsb::impl::InternalDataID)(uintptr_t) JS_GetOpaque(val, isolate->get_class_id());
        {
            jsb::impl::InternalData* data;
            if (isolate->internal_data_.try_get_value_pointer(index, data))
            {
                if (const WeakCallbackInfo<void>::Callback callback = (WeakCallbackInfo<void>::Callback) data->weak.callback)
                {
                    const WeakCallbackInfo<void> info(isolate, data->weak.parameter, data->internal_fields);
                    callback(info);
                }
                JSB_QUICKJS_LOG(VeryVerbose, "remove internal data JSObject:%s id:%s", (uintptr_t) JS_VALUE_GET_PTR(val), index);
                isolate->internal_data_.remove_at(index);
            }
        }
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
                    JSB_QUICKJS_LOG(Error, "uncaught exception in pending job: %s\n%s", message, stacktrace);
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
        if (JS_IsNull(ex))
        {
            jsb_checkf(JS_IsNull(stack_[jsb::impl::StackPos::Exception]), "exception read but not handled (get_message)");
            return false;
        }
        if (!error_thrown_)
        {
            // it happens in two situations:
            //     1. the worker thread is forcibly terminated (it's OK)
            //     2. an exception was thrown by quickjs API but not handled by quickjs.impl (it's not expected)
            JSB_LOG(Warning, "unexpected exception thrown in quickjs");
        }
        const JSValue last = stack_[jsb::impl::StackPos::Exception];
        jsb_check(JS_IsNull(last));
        stack_[jsb::impl::StackPos::Exception] = ex;
        error_thrown_ = false;
        return !JS_IsNull(ex);
    }

    void Isolate::RequestGarbageCollectionForTesting(GarbageCollectionType type)
    {
        JS_RunGC(rt_);
    }

    void Isolate::LowMemoryNotification()
    {
        JS_RunGC(rt_);
    }

}
