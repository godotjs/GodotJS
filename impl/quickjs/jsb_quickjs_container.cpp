#include "jsb_quickjs_container.h"

#include "jsb_quickjs_typedef.h"
#include "jsb_quickjs_isolate.h"

namespace v8
{
    Local<Array> Array::New(Isolate* isolate, int length)
    {
        const JSValue val = JS_NewArray(isolate->ctx());
        jsb_check(JS_IsArray(isolate->ctx(), val));
        return Local<Array>(Data(isolate, isolate->push_steal(val)));
    }

    uint32_t Array::Length() const
    {
        JSContext* ctx = isolate_->ctx();
        const JSValue val = isolate_->stack_val(stack_pos_);
        const JSValue len = JS_GetProperty(ctx, val, jsb::impl::JS_ATOM_length);
        if (JS_IsException(len))
        {
            jsb::impl::QuickJS::MarkExceptionAsTrivial(ctx);
            return 0;
        }

        uint32_t rval;
        jsb_ensure(JS_ToUint32(ctx, &rval, len) != -1);
        JS_FreeValue(ctx, len);
        return rval;
    }

    MaybeLocal<Map> Map::Set(Local<Context> context, Local<Value> key, Local<Value> value)
    {
        JSContext* ctx = isolate_->ctx();

        const jsb::impl::QuickJS::Atom key_atom(ctx, (JSValue) key);
        if (key_atom == JS_ATOM_NULL)
        {
            return MaybeLocal<Map>();
        }
        const int res = JS_SetProperty(ctx, (JSValue) * this, key_atom, JS_DupValue(ctx, (JSValue) value));
        if (res == -1)
        {
            jsb::impl::QuickJS::MarkExceptionAsTrivial(ctx);
            return MaybeLocal<Map>();
        }

        return MaybeLocal<Map>(Data(isolate_, stack_pos_));
    }

    Local<Map> Map::New(Isolate* isolate)
    {
        return Local<Array>(Data(isolate, isolate->push_map()));
    }

} // namespace v8
