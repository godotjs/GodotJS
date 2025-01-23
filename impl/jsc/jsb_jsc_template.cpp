#include "jsb_jsc_template.h"
#include "jsb_jsc_function.h"

namespace v8
{
    Local<FunctionTemplate> FunctionTemplate::New(Isolate* isolate, FunctionCallback callback, Local<Value> data)
    {
        return Local<Function>(Function::New(isolate->GetCurrentContext(), callback, data).ToLocalChecked());
    }

}
