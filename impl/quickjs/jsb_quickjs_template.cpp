#include "jsb_quickjs_template.h"
#include "jsb_quickjs_function.h"

namespace v8
{
    Local<FunctionTemplate> FunctionTemplate::New(Isolate* isolate, FunctionCallback callback, Local<Value> data)
    {
        return Local<Function>(Function::New(isolate->GetCurrentContext(), callback, data).ToLocalChecked());
    }

} // namespace v8
