#ifndef GODOTJS_QUICKJS_CLASS_H
#define GODOTJS_QUICKJS_CLASS_H
#include "jsb_quickjs_pch.h"
#include "jsb_quickjs_handle.h"

namespace jsb::impl
{
    class Class
    {
    private:
        friend class ClassBuilder;

        // strong reference.
        // the counterpart of exposed C++ class.
        // in quickjs, it's the prototype object.
        //NOTE template_.GetFunction() returns the `constructor`,
        //NOTE `constructor == info.NewTarget()` only if directly creating a class instance
        v8::Global<v8::Object> prototype_;

        //TODO may unnecessary, should be identical with prototype.constructor?
        v8::Global<v8::Function> constructor_;

    public:
        Class() = default;
        ~Class() = default;

        Class(Class&&) noexcept = default;
        Class& operator=(Class&&) = default;

        Class(const Class&) = delete;
        Class& operator=(const Class&) = delete;

        jsb_force_inline bool IsEmpty() const
        {
            return prototype_.IsEmpty() || constructor_.IsEmpty();
        }

        jsb_force_inline v8::Local<v8::Object> Get(v8::Isolate* isolate) const
        {
            const JSValue constructor = JS_GetProperty(isolate->ctx(), (JSValue) prototype_, JS_ATOM_constructor);
            jsb_check(!JS_IsException(constructor));
            return v8::Local<v8::Object>(v8::Data(isolate, isolate->push_steal(constructor)));
        }

        jsb_force_inline v8::Local<v8::Object> NewInstance(const v8::Local<v8::Context> context) const
        {
            v8::Isolate* isolate = context->GetIsolate();
            JSContext* ctx = isolate->ctx();
            const JSValue inst = JS_CallConstructor(ctx, (JSValue) constructor_, 0, nullptr);
            jsb_check(!JS_IsException(inst));
            return v8::Local<v8::Object>(v8::Data(isolate, isolate->push_steal(inst)));
        }

    private:
        Class(v8::Isolate* isolate, const v8::Local<v8::Object> proto, const v8::Local<v8::Function> constructor)
        {
            prototype_.Reset(isolate, proto);
            constructor_.Reset(isolate, constructor);
        }

    };
}
#endif
