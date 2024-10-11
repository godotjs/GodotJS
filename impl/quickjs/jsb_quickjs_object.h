#ifndef GODOTJS_QUICKJS_OBJECT_H
#define GODOTJS_QUICKJS_OBJECT_H
#include "jsb_quickjs_pch.h"
#include "jsb_quickjs_typedef.h"
#include "jsb_quickjs_handle.h"
#include "jsb_quickjs_primitive.h"
#include "jsb_quickjs_maybe.h"

namespace v8
{
    class Isolate;
    class FunctionTemplate;

    class Object : public Data
    {
    public:
        Isolate* GetIsolate() const { return isolate_; }

        int InternalFieldCount() const;
        void SetAlignedPointerInInternalField(int slot, void* value);
        void* GetAlignedPointerFromInternalField(int slot) const;

        Maybe<bool> Set(Local<Context> context, Local<Value> key, Local<Value> value);
        Maybe<bool> Set(Local<Context> context, uint32_t index, Local<Value> value);

        MaybeLocal<Value> Get(Local<Context> context, Local<Value> key) const;
        MaybeLocal<Value> Get(Local<Context> context, uint32_t index) const;

        Maybe<bool> DefineOwnProperty(
              Local<Context> context, Local<Name> key, Local<Value> value,
              PropertyAttribute attributes = None);

        MaybeLocal<Value> GetOwnPropertyDescriptor(Local<Context> context, Local<Name> key) const;
        Maybe<bool> HasOwnProperty(Local<Context> context, Local<Name> key) const;

        MaybeLocal<Array> GetPropertyNames(
            Local<Context> context, KeyCollectionMode mode,
            PropertyFilter property_filter, IndexFilter index_filter,
            KeyConversionMode key_conversion = KeyConversionMode::kKeepNumbers) const;

        Maybe<bool> SetPrototype(Local<Context> context, Local<Value> prototype);
        MaybeLocal<Value> CallAsConstructor(Local<Context> context, int argc, Local<Value> argv[]);
        void SetAccessorProperty(Local<Name> name, Local<FunctionTemplate> getter = Local<FunctionTemplate>(), Local<FunctionTemplate> setter = Local<FunctionTemplate>());

        Maybe<bool> SetLazyDataProperty(
              Local<Context> context, Local<Name> name,
              AccessorNameGetterCallback getter);

        static Local<Object> New(Isolate* isolate);
    };

    class Promise : public Object
    {
    public:
    };

}
#endif
