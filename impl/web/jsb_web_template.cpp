#include "jsb_web_template.h"
namespace v8
{

    Local<ObjectTemplate> FunctionTemplate::PrototypeTemplate()
    {
        //TODO
    }

    void Template::Set(Local<Name> name, Local<Data> value)
    {
        //TODO
    }

    void Template::SetAccessorProperty(Local<Name> name, Local<FunctionTemplate> getter, Local<FunctionTemplate> setter)
    {
        //TODO
    }

    Local<FunctionTemplate> FunctionTemplate::New(Isolate* isolate, FunctionCallback callback, Local<Value> data)
    {
        //TODO
    }

    MaybeLocal<Function> FunctionTemplate::GetFunction(Local<Context> context)
    {
        //TODO
    }

    void FunctionTemplate::Inherit(Local<FunctionTemplate> parent)
    {
        //TODO
    }

}
