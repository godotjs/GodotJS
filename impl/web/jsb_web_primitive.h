#ifndef GODOTJS_WEB_PRIMITIVE_H
#define GODOTJS_WEB_PRIMITIVE_H
#include <cstdint>

#include "jsb_web_primitive_data.h"
#include "jsb_web_context.h"
#include "jsb_web_maybe.h"
#include "jsb_web_callback.h"

namespace v8
{
    class Isolate;

    class Value : public Data
    {
    public:
        Maybe<int32_t> Int32Value(const Local<Context>& context) const;
        Maybe<uint32_t> Uint32Value(const Local<Context>& context) const;
        Maybe<double> NumberValue(const Local<Context>& context) const;
        bool BooleanValue(Isolate* isolate) const;
    };

    class Primitive: public Value {};
    class Name : public Primitive {};

    class External : public Value
    {
    public:
        static Local<External> New(Isolate* isolate, void* data);
    };

    class Function;
    class FunctionTemplate;

    class Template : public Data
    {
    public:
        void Set(Local<Name> name, Local<Data> value);

        void SetAccessorProperty(
            Local<Name> name,
            Local<FunctionTemplate> getter = Local<FunctionTemplate>(),
            Local<FunctionTemplate> setter = Local<FunctionTemplate>());
    };

    class ObjectTemplate: public Template
    {
    public:
    };

    class FunctionTemplate : public Template
    {
    public:
        void SetClassName(Local<String> name) {}
        void Inherit(Local<FunctionTemplate> parent);
        MaybeLocal<Function> GetFunction(Local<Context> context);
        Local<ObjectTemplate> PrototypeTemplate();

        static Local<FunctionTemplate> New(Isolate* isolate, FunctionCallback callback = nullptr, Local<Value> data = Local<Value>());
    };

    class Symbol : public Name
    {
    public:
        static Local<Symbol> New(Isolate* isolate);
    };

    class String : public Name
    {
    public:
        class Utf8Value
        {
        public:
            Utf8Value(Isolate* isolate, Local<Value> obj);
            ~Utf8Value();

            char* operator*() { return str_; }
            const char* operator*() const { return str_; }
            int length() const { return length_; }

            // Disallow copying and assigning.
            Utf8Value(const Utf8Value&) = delete;
            void operator=(const Utf8Value&) = delete;

        private:
            char* str_;
            int length_;
        };

        class Value {
        public:
            Value(Isolate* isolate, Local<v8::Value> obj);
            ~Value();

            uint16_t* operator*() { return str_; }
            const uint16_t* operator*() const { return str_; }
            int length() const { return length_; }

            // Disallow copying and assigning.
            Value(const Value&) = delete;
            void operator=(const Value&) = delete;

        private:
            uint16_t* str_;
            int length_;
        };

        template<int N>
        static Local<String> NewFromUtf8Literal(Isolate* isolate, const char (&message)[N])
        {
            return NewFromUtf8(isolate, message, N - 1).ToLocalChecked();
        }

        static Local<String> Empty(Isolate* isolate);

        static MaybeLocal<String> NewFromUtf8(Isolate* isolate, const char* data, NewStringType type = NewStringType::kNormal, int length = -1);

        int Length() const;
    };

    typedef Symbol Private;

    class Number : public Primitive
    {
    public:
        static Local<Number> New(Isolate* isolate, double value);
    };

    class Integer : public Number
    {
    public:
        static Local<Integer> NewFromUnsigned(Isolate* isolate, uint32_t value);
    };

    class Int32 : public Integer
    {
    public:
        static Local<Int32> New(Isolate* isolate, int32_t value);
        static Local<Int32> New(Isolate* isolate, uint32_t value);
        int64_t Value() const;

    };

    class Uint32 : public Integer
    {
    public:

    };

    class Boolean : public Primitive
    {
    public:
        static Local<Boolean> New(Isolate* isolate, bool value);
    };

    class Object : public Value
    {
    public:
        Isolate* GetIsolate() { return isolate_; }

        int InternalFieldCount() const;
        void SetAlignedPointerInInternalField(int slot, void* value);
        void* GetAlignedPointerFromInternalField(int slot);

        Maybe<bool> Set(Local<Context> context, Local<Value> key, Local<Value> value);
        MaybeLocal<Value> Get(Local<Context> context, Local<Value> key);
        MaybeLocal<Value> Get(Local<Context> context, uint32_t index);

        void SetAccessorProperty(Local<Name> name, Local<FunctionTemplate> getter = Local<FunctionTemplate>(), Local<FunctionTemplate> setter = Local<FunctionTemplate>());

        static Local<Object> New(Isolate* isolate);
    };

    class Array : public Object
    {
    public:
        static Local<Array> New(Isolate* isolate, int length = 0);

        uint32_t Length() const;
        Maybe<bool> Set(const Local<Context>& context, uint32_t index, Local<Value> value);
    };

    class Map : public Object
    {

    };

    class Promise : public Object
    {

    };

    class Function : public Object
    {
    public:
        MaybeLocal<Value> Call(Local<Context> context, Local<Value> recv, int argc, Local<Value> argv[]);
        static MaybeLocal<Function> New(Local<Context> context, FunctionCallback callback, Local<Value> data = Local<Value>(), int length = 0);
    };

    Local<Primitive> Undefined(Isolate* isolate);
    Local<Primitive> Null(Isolate* isolate);
}
#endif
