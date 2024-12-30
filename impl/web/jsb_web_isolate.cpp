#include "jsb_web_isolate.h"

#include "jsb_web_catch.h"
#include "jsb_web_handle.h"
#include "jsb_web_context.h"

namespace v8
{
    Isolate *Isolate::New(const CreateParams &params)
    {
        Isolate* isolate = memnew(Isolate);
        return isolate;
    }

    Isolate::Isolate() : ref_count_(1), disposed_(false), handle_scope_(nullptr)
    {
        rt_ = jsbi_NewEngine(this);
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

    Local<Context> Isolate::GetCurrentContext()
    {
        return Local<Context>(Data(this, 0));
    }

}
