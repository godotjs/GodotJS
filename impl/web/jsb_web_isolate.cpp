#include "jsb_web_isolate.h"

#include "jsb_web_catch.h"
#include "jsb_web_handle.h"
#include "jsb_web_context.h"
#include "jsb_web_statistics.h"

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
    };

    using details = IsolateInternalFunctions;

    Isolate *Isolate::New(const CreateParams &params)
    {
        Isolate* isolate = memnew(Isolate);
        return isolate;
    }

    Isolate::Isolate() : ref_count_(1), disposed_(false), handle_scope_(nullptr)
    {
        rt_ = jsbi_NewEngine(this);

        jsbi_SetHostPromiseRejectionTracker(rt_, _promise_rejection_tracker, this);
    }

    Isolate::~Isolate()
    {
        jsb_check(!rt_);
    }

    void Isolate::_release()
    {
        JSB_WEB_LOG(VeryVerbose, "release web runtime");

        // cleanup
        jsb_check(!handle_scope_);

        // make it behave like v8, not to trigger gc callback after the isolate disposed
        internal_data_.clear();

        // dispose the runtime
        jsbi_FreeEngine(rt_);
        rt_ = {};

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

    void Isolate::GetHeapStatistics(HeapStatistics* statistics)
    {
        memset(statistics, 0, sizeof(HeapStatistics));

        //TODO fill out available heap info
    }

    Local<Context> Isolate::GetCurrentContext()
    {
        return Local<Context>(Data(this, 0));
    }

    void Isolate::RequestGarbageCollectionForTesting(GarbageCollectionType type)
    {
    }

    void Isolate::LowMemoryNotification()
    {
    }

}
