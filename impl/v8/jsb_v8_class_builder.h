#ifndef GODOTJS_V8_CLASS_BUILDER_H
#define GODOTJS_V8_CLASS_BUILDER_H

#include "jsb_v8_pch.h"
#include "jsb_v8_class.h"

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
        enum class State { Uninitialized, Building, Inherited, Built };

        v8::Isolate* isolate_ = nullptr;
        v8::Local<v8::FunctionTemplate> template_;
        v8::Local<v8::ObjectTemplate> prototype_template_;

        State state_ = State::Uninitialized;

    public:
        struct EnumDeclaration
        {
            EnumDeclaration(const EnumDeclaration&) = delete;
            EnumDeclaration& operator=(const EnumDeclaration&) = delete;

            EnumDeclaration(EnumDeclaration&&) noexcept = default;
            EnumDeclaration& operator=(EnumDeclaration&&) noexcept = default;

            EnumDeclaration(ClassBuilder* builder, bool is_instance_method, const v8::Local<v8::Name> name) : builder_(builder)
            {
                jsb_check(builder_->state_ == State::Building);
                // DO NOT use HandleScope here, because enumeration_ temporarily saved as a member field of EnumDecl
                enumeration_ = v8::Object::New(builder_->isolate_);

                //NOTE a workaround to define nested enum in a class
                const v8::Local<v8::FunctionTemplate> getter = v8::FunctionTemplate::New(builder_->isolate_, _getter, enumeration_);

                if (is_instance_method) builder_->prototype_template_->SetAccessorProperty(name, getter);
                else builder_->template_->SetAccessorProperty(name, getter);
            }

            EnumDeclaration& Value(const String& name, int64_t data)
            {
                jsb_check(builder_->state_ == State::Building);
                v8::HandleScope handle_scope(builder_->isolate_);
                const v8::Local<v8::Name> key = Helper::new_string(builder_->isolate_, name);
                const v8::Local<v8::Value> value = impl_private::Data<int64_t>::New(builder_->isolate_, data);
                const v8::Local<v8::Context> context = builder_->isolate_->GetCurrentContext();

                enumeration_->DefineOwnProperty(context, key, value);
                // represents the value back to string for convenient uses, such as MyColor[MyColor.White] => 'White'
                enumeration_->DefineOwnProperty(context, value->ToString(context).ToLocalChecked(), key, v8::DontEnum);
                return *this;
            }

        private:
            static void _getter(const v8::FunctionCallbackInfo<v8::Value>& info)
            {
                info.GetReturnValue().Set(info.Data());
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
                jsb_check(builder_->state_ == State::Building);
                v8::HandleScope handle_scope(builder_->isolate_);

                const v8::Local<v8::Name> key = Helper::new_string(builder_->isolate_, name);
                const v8::Local<v8::FunctionTemplate> value = v8::FunctionTemplate::New(builder_->isolate_, callback);

                if (is_instance_method) builder_->prototype_template_->Set(key, value);
                else builder_->template_->Set(key, value);
            }

            void Method(const String& name, const v8::FunctionCallback callback)
            {
                jsb_check(builder_->state_ == State::Building);
                v8::HandleScope handle_scope(builder_->isolate_);

                const v8::Local<v8::Name> key = Helper::new_string(builder_->isolate_, name);
                const v8::Local<v8::FunctionTemplate> value = v8::FunctionTemplate::New(builder_->isolate_, callback);

                if (is_instance_method) builder_->prototype_template_->Set(key, value);
                else builder_->template_->Set(key, value);
            }

            template<typename T>
            void Method(const String& name, const v8::FunctionCallback callback, T data)
            {
                jsb_check(builder_->state_ == State::Building);
                v8::HandleScope handle_scope(builder_->isolate_);

                const v8::Local<v8::Name> key = Helper::new_string(builder_->isolate_, name);
                const v8::Local<v8::FunctionTemplate> value = v8::FunctionTemplate::New(builder_->isolate_, callback, impl_private::Data<T>::New(builder_->isolate_, data));

                if (is_instance_method) builder_->prototype_template_->Set(key, value);
                else builder_->template_->Set(key, value);
            }

            // getter/setter with common data payload
            template<typename T>
            void Property(const String& name, const v8::FunctionCallback getter_cb, const v8::FunctionCallback setter_cb, T data)
            {
                jsb_check(builder_->state_ == State::Building);
                v8::HandleScope handle_scope(builder_->isolate_);

                const v8::Local<v8::Name> key = Helper::new_string(builder_->isolate_, name);
                const v8::Local<v8::Value> payload = impl_private::Data<T>::New(builder_->isolate_, data);
                const v8::Local<v8::FunctionTemplate> getter = getter_cb \
                    ? v8::FunctionTemplate::New(builder_->isolate_, getter_cb, payload)
                    : v8::Local<v8::FunctionTemplate>();
                const v8::Local<v8::FunctionTemplate> setter = setter_cb \
                    ? v8::FunctionTemplate::New(builder_->isolate_, setter_cb, payload)
                    : v8::Local<v8::FunctionTemplate>();;

                if (is_instance_method) builder_->prototype_template_->SetAccessorProperty(key, getter, setter);
                else builder_->template_->SetAccessorProperty(key, getter, setter);
            }

            template<typename GetterDataT, typename SetterDataT>
            void Property(const String& name, const v8::FunctionCallback getter_cb, GetterDataT getter_data, const v8::FunctionCallback setter_cb, SetterDataT setter_data)
            {
                jsb_check(builder_->state_ == State::Building);
                v8::HandleScope handle_scope(builder_->isolate_);

                const v8::Local<v8::Name> key = Helper::new_string(builder_->isolate_, name);
                const v8::Local<v8::FunctionTemplate> getter = getter_cb \
                    ? v8::FunctionTemplate::New(builder_->isolate_, getter_cb, impl_private::Data<GetterDataT>::New(builder_->isolate_, getter_data))
                    : v8::Local<v8::FunctionTemplate>();
                const v8::Local<v8::FunctionTemplate> setter = setter_cb \
                    ? v8::FunctionTemplate::New(builder_->isolate_, setter_cb, impl_private::Data<SetterDataT>::New(builder_->isolate_, setter_data))
                    : v8::Local<v8::FunctionTemplate>();

                if (is_instance_method) builder_->prototype_template_->SetAccessorProperty(key, getter, setter);
                else builder_->template_->SetAccessorProperty(key, getter, setter);
            }

            template<typename GetterDataT>
            void Property(const String& name, const v8::FunctionCallback getter_cb, GetterDataT getter_data)
            {
                jsb_check(builder_->state_ == State::Building);
                v8::HandleScope handle_scope(builder_->isolate_);

                const v8::Local<v8::Name> key = Helper::new_string(builder_->isolate_, name);
                const v8::Local<v8::FunctionTemplate> getter = getter_cb \
                    ? v8::FunctionTemplate::New(builder_->isolate_, getter_cb, impl_private::Data<GetterDataT>::New(builder_->isolate_, getter_data))
                    : v8::Local<v8::FunctionTemplate>();

                if (is_instance_method) builder_->prototype_template_->SetAccessorProperty(key, getter);
                else builder_->template_->SetAccessorProperty(key, getter);
            }

            void LazyProperty(const String& name, const v8::AccessorNameGetterCallback getter)
            {
                jsb_check(builder_->state_ == State::Building);
                v8::HandleScope handle_scope(builder_->isolate_);

                const v8::Local<v8::Name> key = Helper::new_string(builder_->isolate_, name);

                if (is_instance_method) builder_->prototype_template_->SetLazyDataProperty(key, getter);
                else builder_->template_->SetLazyDataProperty(key, getter);
            }

            template<typename T>
            void Value(const v8::Local<v8::Name> key, T val)
            {
                jsb_check(builder_->state_ == State::Building);
                v8::HandleScope handle_scope(builder_->isolate_);

                const v8::Local<v8::Value> value = impl_private::Data<T>::New(builder_->isolate_, val);
                if (is_instance_method) builder_->prototype_template_->Set(key, value);
                else builder_->template_->Set(key, value);
            }

            // generic set
            template<typename T>
            void Value(const String& name, T val)
            {
                jsb_check(builder_->state_ == State::Building);
                v8::HandleScope handle_scope(builder_->isolate_);

                const v8::Local<v8::Name> key = Helper::new_string(builder_->isolate_, name);
                const v8::Local<v8::Value> value = impl_private::Data<T>::New(builder_->isolate_, val);

                if (is_instance_method) builder_->prototype_template_->Set(key, value);
                else builder_->template_->Set(key, value);
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
            jsb_check(state_ == State::Building);
            jsb_check(!base.IsEmpty());
            state_ = State::Inherited;
            template_->Inherit(base.template_.Get(isolate_));
        }

        Class Build()
        {
            jsb_check(state_ != State::Built);
            state_ = State::Built;
            return Class(isolate_, template_);
        }

        template<int InternalFieldCount>
        static ClassBuilder New(v8::Isolate* isolate, const StringName& name, const v8::FunctionCallback constructor, const uint32_t class_payload)
        {
            const v8::Local<v8::Value> data = v8::Uint32::NewFromUnsigned(isolate, class_payload).As<v8::Value>();

            ClassBuilder builder;
            builder.isolate_ = isolate;
            builder.state_ = State::Building;
            builder.template_ = v8::FunctionTemplate::New(isolate, constructor, data);
            builder.template_->SetClassName(Helper::new_string(isolate, name));
            builder.template_->InstanceTemplate()->SetInternalFieldCount(InternalFieldCount);
            builder.prototype_template_ = builder.template_->PrototypeTemplate();
            return builder;
        }

        ~ClassBuilder() = default;

    private:
        ClassBuilder() {}
    };
}

#endif
