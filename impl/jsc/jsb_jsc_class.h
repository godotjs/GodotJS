#ifndef GODOTJS_JSC_CLASS_H
#define GODOTJS_JSC_CLASS_H
#include "jsb_jsc_pch.h"
#include "jsb_jsc_handle.h"

namespace jsb::impl
{
    class Class
    {
    private:
        friend class ClassBuilder;

        // strong reference.
        // the counterpart of exposed C++ class.
        // in quickjs, it's the prototype object.
        // NOTE template_.GetFunction() returns the `constructor`,
        // NOTE `constructor == info.NewTarget()` only if directly creating a class instance
        v8::Global<v8::Object> prototype_;

        // TODO may unnecessary, should be identical with prototype.constructor?
        v8::Global<v8::Function> constructor_;

        uint8_t internal_field_count_ = 0;

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
            const JSObjectRef prototype = JavaScriptCore::AsObject(isolate->ctx(), (JSValueRef) prototype_);
            const JSValueRef constructor = isolate->_GetProperty(prototype, JS_ATOM_constructor);
            jsb_check(constructor);
            return v8::Local<v8::Object>(v8::Data(isolate, isolate->push_copy(constructor)));
        }

        // NOTE NewInstance should not trigger the underlying native constructor of this class
        jsb_force_inline v8::Local<v8::Object> NewInstance(const v8::Local<v8::Context> context) const
        {
            v8::Isolate* isolate = context->GetIsolate();
            return v8::Local<v8::Object>(v8::Data(isolate, isolate->push_copy(_NewObject(isolate, (JSValueRef) prototype_, internal_field_count_))));
        }

    private:
        Class(v8::Isolate* isolate, uint8_t internal_field_count, const v8::Local<v8::Object> proto, const v8::Local<v8::Function> constructor)
        {
            internal_field_count_ = internal_field_count;
            prototype_.Reset(isolate, proto);
            constructor_.Reset(isolate, constructor);
        }

        jsb_force_inline static JSObjectRef _NewObject(v8::Isolate* isolate, JSValueRef prototype, uint8_t internal_field_count)
        {
            InternalData* internal_data = memnew(InternalData);
            internal_data->internal_field_count = internal_field_count;
            internal_data->isolate = isolate;
            const JSObjectRef this_val = isolate->_NewObjectProtoClass(prototype, internal_data);
            jsb_check(this_val);
            jsb_check(prototype);
            return this_val;
        }

        // NOTE JS_CFUNC_constructor_magic DO NOT support func_data
        template <uint8_t InternalFieldCount>
        static JSObjectRef _constructor(JSContextRef ctx, JSObjectRef new_target, size_t argumentCount, const JSValueRef arguments[], JSValueRef* exception)
        {
            v8::Isolate* isolate = (v8::Isolate*) jsb::impl::JavaScriptCore::GetContextOpaque(ctx);
            v8::HandleScope handle_scope(isolate);

            const CConstructorPayload& constructor_data = *(CConstructorPayload*) JSObjectGetPrivate(new_target);

            const JSValueRef proto = isolate->_GetProperty(new_target, JS_ATOM_prototype);
            jsb_check(proto);
            const JSObjectRef this_val = _NewObject(isolate, proto, InternalFieldCount);
            jsb_check(this_val);
            v8::FunctionCallbackInfo<v8::Value> info(isolate, argumentCount, true);

            // init function stack base
            static_assert(jsb::impl::FunctionStackBase::ReturnValue == 0);
            const uint16_t stack_check1 = isolate->push_undefined();
            jsb_unused(stack_check1);

            static_assert(jsb::impl::FunctionStackBase::This == 1);
            const uint16_t stack_this = isolate->push_copy(this_val);
            jsb_unused(stack_this);

            static_assert(jsb::impl::FunctionStackBase::Data == 2);
            isolate->push_copy(JSValueMakeNumber(ctx, constructor_data.class_payload));

            static_assert(jsb::impl::FunctionStackBase::NewTarget == 3);
            const uint16_t stack_check2 = isolate->push_copy(new_target);
            jsb_unused(stack_check2);

            jsb_check(stack_check2 - stack_check1 == FunctionStackBase::Num - 1);
            static_assert(jsb::impl::FunctionStackBase::Num == 4);

            // push arguments
            for (int i = 0; i < argumentCount; ++i)
            {
                isolate->push_copy(arguments[i]);
            }

            constructor_data.callback(info);
            if (isolate->_HasError())
            {
                *exception = isolate->_GetError();
                return nullptr;
            }

            return this_val;
        }
    };
} // namespace jsb::impl
#endif
