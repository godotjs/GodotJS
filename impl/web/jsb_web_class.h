#ifndef GODOTJS_WEB_CLASS_H
#define GODOTJS_WEB_CLASS_H
#include "jsb_web_pch.h"
#include "jsb_web_handle.h"

namespace jsb::impl
{
    class Class
    {
    private:
        friend class ClassBuilder;

        // strong reference.
        // the counterpart of exposed C++ class.
        // in web, it's the prototype object.
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

        // the returned value is the constructor function (the class)
        jsb_force_inline v8::Local<v8::Object> Get(v8::Isolate* isolate) const
        {
            return v8::Local<v8::Object>(v8::Data(isolate, constructor_.Get(isolate)->stack_pos_));
        }

        //NOTE NewInstance should not trigger the underlying native constructor of this class
        jsb_force_inline v8::Local<v8::Object> NewInstance(const v8::Local<v8::Context> context) const
        {
            v8::Isolate* isolate = context->GetIsolate();
            const jsb::impl::StackPosition sp = jsbi_NewInstance(isolate->rt(), prototype_.Get(isolate)->stack_pos_);
            return v8::Local<v8::Object>(v8::Data(isolate, sp));
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
