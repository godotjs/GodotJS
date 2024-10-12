#ifndef GODOTJS_V8_CLASS_H
#define GODOTJS_V8_CLASS_H
#include "jsb_v8_pch.h"

namespace jsb::impl
{
    class Class
    {
    private:
        friend class ClassBuilder;

        // strong reference.
        // the counterpart of exposed C++ class.
        //NOTE template_.GetFunction() returns the `constructor`,
        //NOTE `constructor == info.NewTarget()` only if directly creating a class instance
        v8::Global<v8::FunctionTemplate> handle_;

        // template_ itself but instantiated
        // only valid after Seal called
        //TODO it is unnecessary, but we can't get expected result of `get_function() == new_target` for some unknown reasons
        v8::Global<v8::Function> target_;

    public:
        Class() = default;

        Class(Class&&) noexcept = default;
        Class& operator=(Class&&) = default;

        Class(const Class&) = delete;
        Class& operator=(const Class&) = delete;

        jsb_force_inline bool IsEmpty() const
        {
            return handle_.IsEmpty() || target_.IsEmpty();
        }

        // Get the constructor function (`new.target`)
        jsb_force_inline v8::Local<v8::Function> NewTarget(v8::Isolate* isolate) const
        {
            return target_.Get(isolate);
        }

        jsb_force_inline v8::Local<v8::Function> Get(v8::Isolate* isolate) const
        {
            return target_.Get(isolate);
        }

        jsb_force_inline v8::Local<v8::Object> NewInstance(const v8::Local<v8::Context> context) const
        {
            return handle_.Get(context->GetIsolate())->InstanceTemplate()->NewInstance(context).ToLocalChecked();
        }

    private:
        Class(v8::Isolate* isolate, const v8::Local<v8::FunctionTemplate> template_, const v8::Local<v8::Function> func_)
        {
            handle_.Reset(isolate, template_);
            target_.Reset(isolate, func_);
        }

    };
}
#endif
