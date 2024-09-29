#ifndef GODOTJS_WEB_OBJECT_H
#define GODOTJS_WEB_OBJECT_H
#include "jsb_web_value.h"
#include "jsb_web_primitive.h"

namespace v8
{
    class Isolate;
    class Array;

    template<typename T>
    class MaybeLocal;

    class Object : public Value
    {
    public:
        Isolate* GetIsolate() { return isolate_; }

        // Local<Context> GetCreationContextChecked();

        int InternalFieldCount() const;
        void SetAlignedPointerInInternalField(int slot, void* value);
        void* GetAlignedPointerFromInternalField(int slot);

        Maybe<bool> Set(Local<Context> context, Local<Value> key, Local<Value> value);
        MaybeLocal<Value> Get(Local<Context> context, Local<Value> key);
        MaybeLocal<Value> Get(Local<Context> context, uint32_t index);

        MaybeLocal<Value> GetOwnPropertyDescriptor(Local<Context> context, Local<Name> key);
        Maybe<bool> HasOwnProperty(Local<Context> context, Local<Name> key);

        MaybeLocal<Array> GetPropertyNames(
            Local<Context> context, KeyCollectionMode mode,
            PropertyFilter property_filter, IndexFilter index_filter,
            KeyConversionMode key_conversion = KeyConversionMode::kKeepNumbers);

        Maybe<bool> SetPrototype(Local<Context> context, Local<Value> prototype);
        MaybeLocal<Value> CallAsConstructor(Local<Context> context, int argc, Local<Value> argv[]);
        void SetAccessorProperty(Local<Name> name, Local<FunctionTemplate> getter = Local<FunctionTemplate>(), Local<FunctionTemplate> setter = Local<FunctionTemplate>());

        static Local<Object> New(Isolate* isolate);
    };

}
#endif
