#include "jsb_web_handle_scope.h"
#include "jsb_web_isolate.h"
namespace v8
{
    HandleScope::HandleScope(Isolate* isolate)
    {
        isolate_ = isolate;
        jsbi_StackEnter(isolate_->rt());
    }

    HandleScope::~HandleScope()
    {
        jsbi_StackExit(isolate_->rt());
    }

}
