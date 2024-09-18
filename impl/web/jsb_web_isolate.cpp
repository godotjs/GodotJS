#include "jsb_web_isolate.h"
// #include ""
namespace v8
{
    Isolate::Isolate()
    {
        id_ = jsb_web_create_engine();
        data_ = nullptr;
    }

    Isolate::~Isolate()
    {
    }

    void Isolate::Dispose()
    {
        jsb_web_drop_engine(id_);
    }

    void Isolate::SetData(uint32_t slot, void* data)
    {
        CRASH_COND_MSG(slot != 0, "not supported");
        data_ = data;
    }

    HandleScope::HandleScope(Isolate* isolate)
    {
        //TODO
    }

    HandleScope::~HandleScope()
    {
        //TODO
    }

}
