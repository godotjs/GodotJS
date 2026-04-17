#include "jsb_quickjs_container.h"

#include "jsb_quickjs_typedef.h"
#include "jsb_quickjs_isolate.h"

namespace v8
{
    Local<Array> Array::New(Isolate* isolate, int length)
    {
        const JSValue val = JS_NewArray(isolate->ctx());
        jsb_check(jsb::impl::QuickJS::IsArray(isolate->ctx(), val));
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

    size_t Map::Size() const
    {
        JSContext* ctx = isolate_->ctx();
        const JSValue map_val = isolate_->stack_val(stack_pos_);
        const JSValue size_val = JS_GetPropertyStr(ctx, map_val, "size");
        int32_t size = 0;
        if (!JS_IsException(size_val))
        {
            JS_ToInt32(ctx, &size, size_val);
        }
        JS_FreeValue(ctx, size_val);
        return size < 0 ? 0 : (size_t)size;
    }

    Local<Array> Map::AsArray() const
    {
        JSContext* ctx = isolate_->ctx();
        const JSValue map_val = isolate_->stack_val(stack_pos_);

        // Iterate Map entries via entries() iterator, building flat [key, value, key, value, ...] array
        JSValue entries_fn = JS_GetPropertyStr(ctx, map_val, "entries");
        if (JS_IsException(entries_fn))
        {
            jsb::impl::QuickJS::MarkExceptionAsTrivial(ctx);
            const JSValue empty = JS_NewArray(ctx);
            return Local<Array>(Data(isolate_, isolate_->push_steal(empty)));
        }

        JSValue iterator = JS_Call(ctx, entries_fn, map_val, 0, nullptr);
        JS_FreeValue(ctx, entries_fn);
        if (JS_IsException(iterator))
        {
            jsb::impl::QuickJS::MarkExceptionAsTrivial(ctx);
            const JSValue empty = JS_NewArray(ctx);
            return Local<Array>(Data(isolate_, isolate_->push_steal(empty)));
        }

        JSValue result = JS_NewArray(ctx);
        uint32_t idx = 0;

        JSValue next_fn = JS_GetPropertyStr(ctx, iterator, "next");
        while (!JS_IsException(next_fn))
        {
            JSValue next_result = JS_Call(ctx, next_fn, iterator, 0, nullptr);
            if (JS_IsException(next_result))
            {
                jsb::impl::QuickJS::MarkExceptionAsTrivial(ctx);
                break;
            }

            JSValue done = JS_GetPropertyStr(ctx, next_result, "done");
            const bool is_done = JS_ToBool(ctx, done) != 0;
            JS_FreeValue(ctx, done);

            if (is_done)
            {
                JS_FreeValue(ctx, next_result);
                break;
            }

            JSValue entry = JS_GetPropertyStr(ctx, next_result, "value");
            JSValue key = JS_GetPropertyUint32(ctx, entry, 0);
            JSValue val = JS_GetPropertyUint32(ctx, entry, 1);

            JS_SetPropertyUint32(ctx, result, idx++, key);   // key transferred to result
            JS_SetPropertyUint32(ctx, result, idx++, val);   // val transferred to result

            JS_FreeValue(ctx, entry);
            JS_FreeValue(ctx, next_result);
        }
        JS_FreeValue(ctx, next_fn);
        JS_FreeValue(ctx, iterator);

        return Local<Array>(Data(isolate_, isolate_->push_steal(result)));
    }

    MaybeLocal<Value> Map::Get(Local<Context> context, Local<Value> key)
    {
        JSContext* ctx = isolate_->ctx();
        const JSValue map_val = isolate_->stack_val(stack_pos_);

        JSValue get_fn = JS_GetPropertyStr(ctx, map_val, "get");
        if (JS_IsException(get_fn))
        {
            jsb::impl::QuickJS::MarkExceptionAsTrivial(ctx);
            return MaybeLocal<Value>();
        }

        JSValue key_arg = (JSValue) key;
        JSValue result = JS_Call(ctx, get_fn, map_val, 1, &key_arg);
        JS_FreeValue(ctx, get_fn);
        if (JS_IsException(result))
        {
            jsb::impl::QuickJS::MarkExceptionAsTrivial(ctx);
            return MaybeLocal<Value>();
        }

        return MaybeLocal<Value>(Data(isolate_, isolate_->push_steal(result)));
    }

    MaybeLocal<Map> Map::Set(Local<Context> context, Local<Value> key, Local<Value> value)
    {
        JSContext* ctx = isolate_->ctx();
        const JSValue map_val = isolate_->stack_val(stack_pos_);

        JSValue set_fn = JS_GetPropertyStr(ctx, map_val, "set");
        if (JS_IsException(set_fn))
        {
            jsb::impl::QuickJS::MarkExceptionAsTrivial(ctx);
            return MaybeLocal<Map>();
        }

        JSValue args[] = { (JSValue) key, (JSValue) value };
        JSValue result = JS_Call(ctx, set_fn, map_val, 2, args);
        JS_FreeValue(ctx, set_fn);
        if (JS_IsException(result))
        {
            jsb::impl::QuickJS::MarkExceptionAsTrivial(ctx);
            return MaybeLocal<Map>();
        }
        JS_FreeValue(ctx, result);

        return MaybeLocal<Map>(Data(isolate_, stack_pos_));
    }

    Local<Map> Map::New(Isolate* isolate)
    {
        return Local<Map>(Data(isolate, isolate->push_map()));
    }

    size_t Set::Size() const
    {
        JSContext* ctx = isolate_->ctx();
        const JSValue set_val = isolate_->stack_val(stack_pos_);
        const JSValue size_val = JS_GetPropertyStr(ctx, set_val, "size");
        int32_t size = 0;
        if (!JS_IsException(size_val))
        {
            JS_ToInt32(ctx, &size, size_val);
        }
        JS_FreeValue(ctx, size_val);
        return size < 0 ? 0 : (size_t)size;
    }

    Local<Array> Set::AsArray() const
    {
        JSContext* ctx = isolate_->ctx();
        const JSValue set_val = isolate_->stack_val(stack_pos_);

        // Iterate Set values via values() iterator, building [value, value, ...] array
        JSValue values_fn = JS_GetPropertyStr(ctx, set_val, "values");
        if (JS_IsException(values_fn))
        {
            jsb::impl::QuickJS::MarkExceptionAsTrivial(ctx);
            const JSValue empty = JS_NewArray(ctx);
            return Local<Array>(Data(isolate_, isolate_->push_steal(empty)));
        }

        JSValue iterator = JS_Call(ctx, values_fn, set_val, 0, nullptr);
        JS_FreeValue(ctx, values_fn);
        if (JS_IsException(iterator))
        {
            jsb::impl::QuickJS::MarkExceptionAsTrivial(ctx);
            const JSValue empty = JS_NewArray(ctx);
            return Local<Array>(Data(isolate_, isolate_->push_steal(empty)));
        }

        JSValue result = JS_NewArray(ctx);
        uint32_t idx = 0;

        JSValue next_fn = JS_GetPropertyStr(ctx, iterator, "next");
        while (!JS_IsException(next_fn))
        {
            JSValue next_result = JS_Call(ctx, next_fn, iterator, 0, nullptr);
            if (JS_IsException(next_result))
            {
                jsb::impl::QuickJS::MarkExceptionAsTrivial(ctx);
                break;
            }

            JSValue done = JS_GetPropertyStr(ctx, next_result, "done");
            const bool is_done = JS_ToBool(ctx, done) != 0;
            JS_FreeValue(ctx, done);

            if (is_done)
            {
                JS_FreeValue(ctx, next_result);
                break;
            }

            JSValue val = JS_GetPropertyStr(ctx, next_result, "value");
            JS_SetPropertyUint32(ctx, result, idx++, val);   // val transferred to result

            JS_FreeValue(ctx, next_result);
        }
        JS_FreeValue(ctx, next_fn);
        JS_FreeValue(ctx, iterator);

        return Local<Array>(Data(isolate_, isolate_->push_steal(result)));
    }

    MaybeLocal<Set> Set::Add(Local<Context> context, Local<Value> key)
    {
        JSContext* ctx = isolate_->ctx();
        const JSValue set_val = isolate_->stack_val(stack_pos_);

        JSValue add_fn = JS_GetPropertyStr(ctx, set_val, "add");
        if (JS_IsException(add_fn))
        {
            jsb::impl::QuickJS::MarkExceptionAsTrivial(ctx);
            return MaybeLocal<Set>();
        }

        JSValue key_arg = (JSValue) key;
        JSValue result = JS_Call(ctx, add_fn, set_val, 1, &key_arg);
        JS_FreeValue(ctx, add_fn);
        if (JS_IsException(result))
        {
            jsb::impl::QuickJS::MarkExceptionAsTrivial(ctx);
            return MaybeLocal<Set>();
        }
        JS_FreeValue(ctx, result);

        return MaybeLocal<Set>(Data(isolate_, stack_pos_));
    }

    Local<Set> Set::New(Isolate* isolate)
    {
        return Local<Set>(Data(isolate, isolate->push_set()));
    }

}
