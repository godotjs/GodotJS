#include "jsb_web_object.h"
#include "jsb_web_maybe.h"
#include "jsb_web_isolate.h"

namespace v8
{
    Local<Object> Object::New(Isolate* isolate)
    {
        return Local<Object>(isolate, isolate->GetCurrentStack(), jsapi_stack_push_object(isolate->id_));
    }


    int Object::InternalFieldCount() const
    {
        return jsapi_sv_internal_num(isolate_->id_, stack_, index_);
    }

    void Object::SetAlignedPointerInInternalField(int slot, void* value)
    {
        CRASH_COND_MSG(slot != 0 && slot != 1, "not supported");
        jsapi_sv_internal_set(isolate_->id_, stack_, index_, slot, value);
    }

    void* Object::GetAlignedPointerFromInternalField(int slot)
    {
        CRASH_COND_MSG(slot != 0 && slot != 1, "not supported");
        return jsapi_sv_internal_get(isolate_->id_, stack_, index_, slot);
    }

    // Maybe<bool> Object::Set(Local<Context> context, Local<Value> key, Local<Value> value)
    // {
    //     //TODO
    //     return Maybe<bool>(true);
    // }
    //
    // MaybeLocal<Value> Object::Get(Local<Context> context, Local<Value> key)
    // {
    //     //TODO
    //     return {};
    // }
    //
    // MaybeLocal<Value> Object::Get(Local<Context> context, uint32_t index)
    // {
    //     //TODO
    // }

}
