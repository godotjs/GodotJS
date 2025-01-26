#ifndef GODOTJS_JSC_CLASS_BUILDER_H
#define GODOTJS_JSC_CLASS_BUILDER_H
#include "jsb_jsc_pch.h"
#include "jsb_jsc_class.h"
#include "jsb_jsc_handle_scope.h"
#include "jsb_jsc_primitive.h"
#include "jsb_jsc_template.h"
#include "jsb_jsc_function_interop.h"
#include "jsb_jsc_helper.h"

#define JSB_NEW_FUNCTION_TEMPLATE(isolate, name, callback, data) jsb::impl::Helper::NewFunctionTemplate(isolate, name, callback, data)

namespace jsb::impl
{
    namespace impl_private
    {
        template<typename T> struct Data {};

        template<> struct Data<int32_t> { static v8::Local<v8::Value> New(v8::Isolate* isolate, int32_t value) { return v8::Int32::New(isolate, value); } };
        template<> struct Data<int64_t> { static v8::Local<v8::Value> New(v8::Isolate* isolate, int64_t value) { return Helper::new_integer(isolate, value); } };
        template<> struct Data<uint32_t> { static v8::Local<v8::Value> New(v8::Isolate* isolate, uint32_t value) { return v8::Uint32::NewFromUnsigned(isolate, value); } };
        template<> struct Data<void*> { static v8::Local<v8::Value> New(v8::Isolate* isolate, void* value) { return v8::External::New(isolate, value); } };
        template<> struct Data<v8::Local<v8::Value>> { static v8::Local<v8::Value> New(v8::Isolate* isolate, v8::Local<v8::Value> value) { return value; } };
    }

    class ClassBuilder
    {
    private:
        v8::Isolate* isolate_ = nullptr;
        v8::Local<v8::FunctionTemplate> constructor_;
        v8::Local<v8::ObjectTemplate> prototype_;

        int internal_field_count_ = 0;
        bool closed_ = false;

    public:
        struct EnumDeclaration
        {
            EnumDeclaration(ClassBuilder* builder, bool is_instance_method, const v8::Local<v8::Name> name)
            : builder_(builder), enumeration_(v8::Object::New(builder_->isolate_))
            {
                jsb_check(!builder_->closed_);

                if (is_instance_method) builder_->prototype_->Set(builder_->GetContext(), name, enumeration_);
                else builder_->constructor_->Set(builder_->GetContext(), name, enumeration_);
            }

            EnumDeclaration& Value(const String& name, int64_t data)
            {
                jsb_check(!builder_->closed_);
                v8::HandleScope handle_scope(builder_->isolate_);
                const v8::Local<v8::Name> key = Helper::new_string(builder_->isolate_, name);
                const v8::Local<v8::Value> value = impl_private::Data<int64_t>::New(builder_->isolate_, data);

                enumeration_->Set(builder_->GetContext(), key, value);

                // represents the value back to string for convenient uses, such as MyColor[MyColor.White] => 'White'
                const bool rval = builder_->isolate_->_DefineProperty(
                    JavaScriptCore::AsObject(builder_->ctx(), (JSValueRef) enumeration_),
                    (JSValueRef) value,
                    (JSValueRef) key);
                jsb_check(rval);
                jsb_unused(rval);
                return *this;
            }

        private:
            ClassBuilder* builder_;
            v8::Local<v8::Object> enumeration_;
        };

        struct MemberDeclaration
        {
            MemberDeclaration(ClassBuilder* builder, bool is_instance_method) : builder_(builder), is_instance_method(is_instance_method) {}

            EnumDeclaration Enum(const String& name)
            {
                return EnumDeclaration(builder_, is_instance_method, Helper::new_string(builder_->isolate_, name));
            }

            template<size_t N>
            void Method(const char (&name)[N], const v8::FunctionCallback callback)
            {
                jsb_check(!builder_->closed_);
                v8::HandleScope handle_scope(builder_->isolate_);

                const v8::Local<v8::Name> key = Helper::new_string(builder_->isolate_, name);
                const v8::Local<v8::FunctionTemplate> value = JSB_NEW_FUNCTION_TEMPLATE(builder_->isolate_, name, callback, {});

                if (is_instance_method) builder_->prototype_->Set(builder_->GetContext(), key, value);
                else builder_->constructor_->Set(builder_->GetContext(), key, value);
            }

            template<typename T>
            void Method(const String& name, const v8::FunctionCallback callback, T data)
            {
                jsb_check(!builder_->closed_);
                v8::HandleScope handle_scope(builder_->isolate_);

                const v8::Local<v8::Name> key = Helper::new_string(builder_->isolate_, name);
                const v8::Local<v8::FunctionTemplate> value = JSB_NEW_FUNCTION_TEMPLATE(builder_->isolate_, name, callback, impl_private::Data<T>::New(builder_->isolate_, data));

                if (is_instance_method) builder_->prototype_->Set(builder_->GetContext(), key, value);
                else builder_->constructor_->Set(builder_->GetContext(), key, value);
            }

            // getter/setter with common data payload
            template<typename T>
            void Property(const String& name, const v8::FunctionCallback getter_cb, const v8::FunctionCallback setter_cb, T data)
            {
                jsb_check(!builder_->closed_);
                v8::HandleScope handle_scope(builder_->isolate_);

                const v8::Local<v8::Name> key = Helper::new_string(builder_->isolate_, name);
                const v8::Local<v8::Value> payload = impl_private::Data<T>::New(builder_->isolate_, data);
                const v8::Local<v8::FunctionTemplate> getter = getter_cb \
                    ? JSB_NEW_FUNCTION_TEMPLATE(builder_->isolate_, name, getter_cb, payload)
                    : v8::Local<v8::FunctionTemplate>();
                const v8::Local<v8::FunctionTemplate> setter = setter_cb \
                    ? JSB_NEW_FUNCTION_TEMPLATE(builder_->isolate_, name, setter_cb, payload)
                    : v8::Local<v8::FunctionTemplate>();;

                if (is_instance_method) builder_->prototype_->SetAccessorProperty(key, getter, setter);
                else builder_->constructor_->SetAccessorProperty(key, getter, setter);
            }

            template<typename GetterDataT, typename SetterDataT>
            void Property(const String& name, const v8::FunctionCallback getter_cb, GetterDataT getter_data, const v8::FunctionCallback setter_cb, SetterDataT setter_data)
            {
                jsb_check(!builder_->closed_);
                v8::HandleScope handle_scope(builder_->isolate_);

                const v8::Local<v8::Name> key = Helper::new_string(builder_->isolate_, name);
                const v8::Local<v8::FunctionTemplate> getter = getter_cb \
                    ? JSB_NEW_FUNCTION_TEMPLATE(builder_->isolate_, name, getter_cb, impl_private::Data<GetterDataT>::New(builder_->isolate_, getter_data))
                    : v8::Local<v8::FunctionTemplate>();
                const v8::Local<v8::FunctionTemplate> setter = setter_cb \
                    ? JSB_NEW_FUNCTION_TEMPLATE(builder_->isolate_, name, setter_cb, impl_private::Data<SetterDataT>::New(builder_->isolate_, setter_data))
                    : v8::Local<v8::FunctionTemplate>();

                if (is_instance_method) builder_->prototype_->SetAccessorProperty(key, getter, setter);
                else builder_->constructor_->SetAccessorProperty(key, getter, setter);
            }

            template<typename GetterDataT>
            void Property(const String& name, const v8::FunctionCallback getter_cb, GetterDataT getter_data)
            {
                jsb_check(!builder_->closed_);
                v8::HandleScope handle_scope(builder_->isolate_);

                const v8::Local<v8::Name> key = Helper::new_string(builder_->isolate_, name);
                const v8::Local<v8::FunctionTemplate> getter = getter_cb \
                    ? JSB_NEW_FUNCTION_TEMPLATE(builder_->isolate_, name, getter_cb, impl_private::Data<GetterDataT>::New(builder_->isolate_, getter_data))
                    : v8::Local<v8::FunctionTemplate>();

                if (is_instance_method) builder_->prototype_->SetAccessorProperty(key, getter);
                else builder_->constructor_->SetAccessorProperty(key, getter);
            }

            void LazyProperty(const String& name, const v8::AccessorNameGetterCallback getter)
            {
                jsb_check(!builder_->closed_);
                v8::HandleScope handle_scope(builder_->isolate_);

                const v8::Local<v8::Name> key = Helper::new_string(builder_->isolate_, name);

                if (is_instance_method) builder_->prototype_->SetLazyDataProperty(builder_->GetContext(), key, getter);
                else builder_->constructor_->SetLazyDataProperty(builder_->GetContext(), key, getter);
            }

            template<typename T>
            void Value(const v8::Local<v8::Name> key, T val)
            {
                jsb_check(!builder_->closed_);
                v8::HandleScope handle_scope(builder_->isolate_);

                const v8::Local<v8::Value> value = impl_private::Data<T>::New(builder_->isolate_, val);
                if (is_instance_method) builder_->prototype_->Set(builder_->GetContext(), key, value);
                else builder_->constructor_->Set(builder_->GetContext(), key, value);
            }

            // generic set
            template<typename T>
            void Value(const String& name, T val)
            {
                jsb_check(!builder_->closed_);
                v8::HandleScope handle_scope(builder_->isolate_);

                const v8::Local<v8::Name> key = Helper::new_string(builder_->isolate_, name);
                const v8::Local<v8::Value> value = impl_private::Data<T>::New(builder_->isolate_, val);

                if (is_instance_method) builder_->prototype_->Set(builder_->GetContext(), key, value);
                else builder_->constructor_->Set(builder_->GetContext(), key, value);
            }

        private:
            ClassBuilder* builder_;
            bool is_instance_method;
        };

        ClassBuilder(const ClassBuilder&) = delete;
        ClassBuilder& operator=(const ClassBuilder&) = delete;

        ClassBuilder(ClassBuilder&&) noexcept = default;
        ClassBuilder& operator=(ClassBuilder&&) = default;

        MemberDeclaration Static() { return MemberDeclaration(this, false); }
        MemberDeclaration Instance() { return MemberDeclaration(this, true); }

        void Inherit(const Class& base)
        {
            jsb_check(!closed_);
            jsb_check(!base.IsEmpty());
            const JSObjectRef parent = JavaScriptCore::AsObject(isolate_->ctx(), (JSValueRef) base.prototype_);
            const JSObjectRef prototype = JavaScriptCore::AsObject(isolate_->ctx(), (JSValueRef) prototype_);
            jsb_check(parent);
            jsb_check(prototype);
            JSObjectSetPrototype(isolate_->ctx(), prototype, parent);
        }

        Class Build()
        {
            jsb_checkf(!closed_, "class builder is already closed");
            closed_ = true;
            const JSObjectRef prototype = JavaScriptCore::AsObject(isolate_->ctx(), (JSValueRef) prototype_);
            const JSObjectRef constructor = JavaScriptCore::AsObject(isolate_->ctx(), (JSValueRef) constructor_);
            jsb_check(prototype);
            jsb_check(constructor);
            const bool rval1 = isolate_->_SetProperty(prototype, jsb::impl::JS_ATOM_constructor, constructor);
            const bool rval2 = isolate_->_SetProperty(constructor, jsb::impl::JS_ATOM_prototype, prototype);
            jsb_check(rval1 && rval2);
            jsb_unused(rval1);
            jsb_unused(rval2);
            return Class(isolate_, internal_field_count_, prototype_, constructor_);
        }

        template<uint8_t InternalFieldCount>
        static ClassBuilder New(v8::Isolate* isolate, const StringName& name, const v8::FunctionCallback constructor, const uint32_t class_payload)
        {
            //NOTE do not use HandleScope here, because prototype/constructor Local handles are temporarily saved
            //     in member fields of builder.

            ClassBuilder builder;
            const String str = name;
            const CharString str8 = str.utf8();

            const JSObjectRef constructor_obj = isolate->_NewConstructor(&Class::_constructor<InternalFieldCount>, str8.get_data(), constructor, class_payload);
            jsb_check(constructor_obj);

            jsb_checkf(str.length(), "empty string is not allowed for a class name");
            builder.internal_field_count_ = InternalFieldCount;
            builder.isolate_ = isolate;
            builder.prototype_ = v8::Local<v8::ObjectTemplate>(v8::Data(isolate, isolate->push_copy(JSObjectMake(isolate->ctx(), nullptr, nullptr))));
            builder.constructor_ = v8::Local<v8::FunctionTemplate>(v8::Data(isolate, isolate->push_copy(constructor_obj)));

            return builder;
        }

        ~ClassBuilder() = default;

    private:
        JSContextRef ctx() const { return isolate_->ctx(); }

        v8::Local<v8::Context> GetContext() const
        {
            return isolate_->GetCurrentContext();
        }

        ClassBuilder() {}
    };

}
#endif
