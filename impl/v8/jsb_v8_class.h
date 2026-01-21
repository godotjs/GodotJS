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
        // NOTE template_.GetFunction() returns the `constructor`,
        // NOTE `constructor == info.NewTarget()` only if directly creating a class instance
        v8::Global<v8::FunctionTemplate> template_;

    public:
        Class() = default;
        ~Class() = default;

        Class(Class&&) noexcept = default;
        Class& operator=(Class&&) = default;

        Class(const Class&) = delete;
        Class& operator=(const Class&) = delete;

        jsb_force_inline bool IsEmpty() const
        {
            return template_.IsEmpty();
        }

        jsb_force_inline v8::Local<v8::Function> Get(v8::Isolate* isolate) const
        {
            return template_.Get(isolate)->GetFunction(isolate->GetCurrentContext()).ToLocalChecked();
        }

        // NOTE NewInstance should not trigger the underlying native constructor of this class
        jsb_force_inline v8::Local<v8::Object> NewInstance(const v8::Local<v8::Context> context) const
        {
            return template_.Get(context->GetIsolate())->InstanceTemplate()->NewInstance(context).ToLocalChecked();
        }

    private:
        Class(v8::Isolate* isolate, const v8::Local<v8::FunctionTemplate> p_template)
        {
            template_.Reset(isolate, p_template);
        }
    };
} // namespace jsb::impl
#endif
