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
            const JSValue constructor = JS_GetProperty(isolate->ctx(), (JSValue) prototype_, JS_ATOM_constructor);
            jsb_check(!JS_IsException(constructor));
            // jsb_check(JS_VALUE_GET_PTR(constructor_) == JS_VALUE_GET_PTR(constructor));
            return v8::Local<v8::Object>(v8::Data(isolate, isolate->push_steal(constructor)));
        }

        //NOTE NewInstance should not trigger the underlying native constructor of this class
        jsb_force_inline v8::Local<v8::Object> NewInstance(const v8::Local<v8::Context> context) const
        {
            v8::Isolate* isolate = context->GetIsolate();
            JSContext* ctx = isolate->ctx();
            // const JSValue inst = JS_CallConstructor(ctx, (JSValue) constructor_, 0, nullptr);
            // jsb_check(!JS_IsException(inst));
            // return v8::Local<v8::Object>(v8::Data(isolate, isolate->push_steal(inst)));
            return v8::Local<v8::Object>(v8::Data(isolate,isolate->push_steal(
                _NewObject(isolate, ctx, (JSValue) prototype_, internal_field_count_))));
        }

    private:
        Class(v8::Isolate* isolate, uint8_t internal_field_count, const v8::Local<v8::Object> proto, const v8::Local<v8::Function> constructor)
        {
            internal_field_count_= internal_field_count;
            prototype_.Reset(isolate, proto);
            constructor_.Reset(isolate, constructor);
        }

        jsb_force_inline static JSValue _NewObject(v8::Isolate* isolate, JSContext* ctx, JSValue prototype, uint8_t internal_field_count)
        {
            const JSValue this_val = JS_NewObjectProtoClass(ctx, (JSValue) prototype, isolate->get_class_id());
            jsb_check(JS_IsObject(this_val));
            const jsb::impl::InternalDataID internal_data_id = isolate->add_internal_data(internal_field_count);
            JS_SetOpaque(this_val, (void*)(uintptr_t) *internal_data_id);
            JSB_QUICKJS_LOG(VeryVerbose, "allocating internal data JSObject:%s id:%s", (uintptr_t) JS_VALUE_GET_PTR(this_val), internal_data_id);
            return this_val;
        }

        //NOTE JS_CFUNC_constructor_magic DO NOT support func_data
        template<uint8_t InternalFieldCount>
        static JSValue _constructor(JSContext* ctx, JSValueConst new_target, int argc, JSValueConst* argv, int magic)
        {
            v8::Isolate* isolate = (v8::Isolate*) JS_GetContextOpaque(ctx);
            v8::HandleScope handle_scope(isolate);
            const jsb::impl::ConstructorData constructor_data = isolate->get_constructor_data(magic);

            const JSValue proto = JS_GetProperty(ctx, new_target, JS_ATOM_prototype);
            jsb_check(!JS_IsException(proto) && JS_IsObject(proto));
            const JSValue this_val = _NewObject(isolate, ctx, proto, InternalFieldCount);
            JS_FreeValue(ctx, proto);

            v8::FunctionCallbackInfo<v8::Value> info(isolate, argc, true);

            // init function stack base
            static_assert(jsb::impl::FunctionStackBase::ReturnValue == 0);
            const uint16_t stack_check1 = isolate->push_copy(JS_UNDEFINED);
            jsb_unused(stack_check1);

            static_assert(jsb::impl::FunctionStackBase::This == 1);
            const uint16_t stack_this = isolate->push_copy(this_val);
            jsb_unused(stack_this);

            static_assert(jsb::impl::FunctionStackBase::Data == 2);
            isolate->push_steal(JS_NewUint32(ctx, constructor_data.data));

            static_assert(jsb::impl::FunctionStackBase::NewTarget == 3);
            const uint16_t stack_check2 = isolate->push_copy(new_target);
            jsb_unused(stack_check2);

            jsb_check(stack_check2 - stack_check1 == FunctionStackBase::Num - 1);
            static_assert(jsb::impl::FunctionStackBase::Num == 4);

            // push arguments
            for (int i = 0; i < argc; ++i)
            {
                isolate->push_copy(argv[i]);
            }

            constructor_data.callback(info);
            if (isolate->is_error_thrown())
            {
                return JS_EXCEPTION;
            }

            return this_val;
        }

    };
}
#endif
