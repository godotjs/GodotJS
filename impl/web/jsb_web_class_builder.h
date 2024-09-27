#ifndef GODOTJS_WEB_CLASS_BUILDER_H
#define GODOTJS_WEB_CLASS_BUILDER_H

#include "jsb_web_isolate.h"

namespace jsb::impl
{
    class ClassBuilder
    {
    private:
        v8::Isolate* isolate_ = nullptr;
        v8::Local<v8::FunctionTemplate> template_;

        // PrototypeTemplate()
        v8::Local<v8::ObjectTemplate> proto_;

        bool closed_ = false;
#if JSB_DEBUG
        uint32_t class_payload_ = 0;
#endif

    public:
        struct EnumDeclaration
        {
            EnumDeclaration(ClassBuilder& builder, bool is_instance_method, const v8::Local<v8::Name> name) : builder_(builder)
            {
                jsb_check(!builder_.closed_);
                enumeration_ = v8::ObjectTemplate::New(builder_.isolate_);

                if (is_instance_method) builder_.proto_->Set(name, enumeration_);
                else builder_.template_->Set(name, enumeration_);
            }

            EnumDeclaration& Value(const String& name, int64_t data)
            {
                jsb_check(!builder_.closed_);
                const v8::Local<v8::Name> key = Helper::new_string(builder_.isolate_, name);
                const v8::Local<v8::Value> value = impl_private::Data<int64_t>::New(builder_.isolate_, data);

                enumeration_->Set(key, value);
                // represents the value back to string for convenient uses, such as MyColor[MyColor.White] => 'White'
                enumeration_->Set(value->ToString(builder_.isolate_->GetCurrentContext()).ToLocalChecked(), key, v8::DontEnum);
                return *this;
            }

        private:
            ClassBuilder& builder_;
            v8::Local<v8::ObjectTemplate> enumeration_;
        };

        struct MemberDeclaration
        {
            MemberDeclaration(ClassBuilder& builder, bool is_instance_method) : builder_(builder), is_instance_method(is_instance_method) {}

            EnumDeclaration Enum(const String& name)
            {
                return EnumDeclaration(builder_, is_instance_method, Helper::new_string(builder_.isolate_, name));
            }

            template<size_t N>
            void Method(const char (&name)[N], const v8::FunctionCallback callback)
            {
                jsb_check(!builder_.closed_);
                const v8::Local<v8::Name> key = Helper::new_string(builder_.isolate_, name);
                const v8::Local<v8::FunctionTemplate> value = v8::FunctionTemplate::New(builder_.isolate_, callback);

                if (is_instance_method) builder_.proto_->Set(key, value);
                else builder_.template_->Set(key, value);
            }

            template<typename T>
            void Method(const String& name, const v8::FunctionCallback callback, T data)
            {
                jsb_check(!builder_.closed_);
                const v8::Local<v8::Name> key = Helper::new_string(builder_.isolate_, name);
                const v8::Local<v8::FunctionTemplate> value = v8::FunctionTemplate::New(builder_.isolate_, callback, impl_private::Data<T>::New(builder_.isolate_, data));

                if (is_instance_method) builder_.proto_->Set(key, value);
                else builder_.template_->Set(key, value);
            }

            // getter/setter with common data payload
            template<typename T>
            void Property(const String& name, const v8::FunctionCallback getter_cb, const v8::FunctionCallback setter_cb, T data)
            {
                jsb_check(!builder_.closed_);
                const v8::Local<v8::Name> key = Helper::new_string(builder_.isolate_, name);
                const v8::Local<v8::Value> payload = impl_private::Data<T>::New(builder_.isolate_, data);
                const v8::Local<v8::FunctionTemplate> getter = getter_cb \
                    ? v8::FunctionTemplate::New(builder_.isolate_, getter_cb, payload)
                    : v8::Local<v8::FunctionTemplate>();
                const v8::Local<v8::FunctionTemplate> setter = setter_cb \
                    ? v8::FunctionTemplate::New(builder_.isolate_, setter_cb, payload)
                    : v8::Local<v8::FunctionTemplate>();;

                if (is_instance_method) builder_.proto_->SetAccessorProperty(key, getter, setter);
                else builder_.template_->SetAccessorProperty(key, getter, setter);
            }

            template<typename GetterDataT, typename SetterDataT>
            void Property(const String& name, const v8::FunctionCallback getter_cb, GetterDataT getter_data, const v8::FunctionCallback setter_cb, SetterDataT setter_data)
            {
                jsb_check(!builder_.closed_);
                const v8::Local<v8::Name> key = Helper::new_string(builder_.isolate_, name);
                const v8::Local<v8::FunctionTemplate> getter = getter_cb \
                    ? v8::FunctionTemplate::New(builder_.isolate_, getter_cb, impl_private::Data<GetterDataT>::New(builder_.isolate_, getter_data))
                    : v8::Local<v8::FunctionTemplate>();
                const v8::Local<v8::FunctionTemplate> setter = setter_cb \
                    ? v8::FunctionTemplate::New(builder_.isolate_, setter_cb, impl_private::Data<SetterDataT>::New(builder_.isolate_, setter_data))
                    : v8::Local<v8::FunctionTemplate>();

                if (is_instance_method) builder_.proto_->SetAccessorProperty(key, getter, setter);
                else builder_.template_->SetAccessorProperty(key, getter, setter);
            }

            template<typename GetterDataT>
            void Property(const String& name, const v8::FunctionCallback getter_cb, GetterDataT getter_data)
            {
                jsb_check(!builder_.closed_);
                const v8::Local<v8::Name> key = Helper::new_string(builder_.isolate_, name);
                const v8::Local<v8::FunctionTemplate> getter = getter_cb \
                    ? v8::FunctionTemplate::New(builder_.isolate_, getter_cb, impl_private::Data<GetterDataT>::New(builder_.isolate_, getter_data))
                    : v8::Local<v8::FunctionTemplate>();

                if (is_instance_method) builder_.proto_->SetAccessorProperty(key, getter);
                else builder_.template_->SetAccessorProperty(key, getter);
            }

            void LazyProperty(const String& name, const v8::AccessorNameGetterCallback getter)
            {
                jsb_check(!builder_.closed_);
                const v8::Local<v8::Name> key = Helper::new_string(builder_.isolate_, name);

                if (is_instance_method) builder_.proto_->SetLazyDataProperty(key, getter);
                else builder_.template_->SetLazyDataProperty(key, getter);
            }

            template<typename T>
            void Value(const v8::Local<v8::Name> key, T val)
            {
                jsb_check(!builder_.closed_);
                const v8::Local<v8::Value> value = impl_private::Data<T>::New(builder_.isolate_, val);
                if (is_instance_method) builder_.proto_->Set(key, value);
                else builder_.template_->Set(key, value);
            }

            // generic set
            template<typename T>
            void Value(const String& name, T val)
            {
                jsb_check(!builder_.closed_);
                const v8::Local<v8::Name> key = Helper::new_string(builder_.isolate_, name);
                const v8::Local<v8::Value> value = impl_private::Data<T>::New(builder_.isolate_, val);

                if (is_instance_method) builder_.proto_->Set(key, value);
                else builder_.template_->Set(key, value);
            }

        private:
            ClassBuilder& builder_;
            bool is_instance_method;
        };

        ClassBuilder(const ClassBuilder&) = delete;
        ClassBuilder& operator=(const ClassBuilder&) = delete;

        ClassBuilder(ClassBuilder&&) noexcept = default;
        ClassBuilder& operator=(ClassBuilder&&) = default;

        ClassBuilder& SetClassName(const v8::Local<v8::String>& name)
        {
            jsb_check(!closed_);
            template_->SetClassName(name);
            return *this;
        }

        MemberDeclaration Static() { return MemberDeclaration(*this, false); }
        MemberDeclaration Instance() { return MemberDeclaration(*this, true); }

        void Inherit(const v8::Local<v8::FunctionTemplate> base)
        {
            jsb_check(!closed_);
            template_->Inherit(base);
        }

        //TODO temp
        v8::Local<v8::FunctionTemplate>& Build()
        {
#if JSB_DEBUG
            JSB_LOG(VeryVerbose, "close class builder %d", class_payload_);
#endif
            closed_ = true;
            return template_;
        }

        //TODO temp
        v8::Local<v8::FunctionTemplate> operator*() const { return template_; }

        template<int InternalFieldCount>
        static ClassBuilder New(v8::Isolate* isolate, const v8::FunctionCallback constructor, const uint32_t class_payload)
        {
            const v8::Local<v8::Value> data = class_payload != 0 ? v8::Uint32::NewFromUnsigned(isolate, class_payload).As<v8::Value>() : v8::Local<v8::Value>();

            ClassBuilder builder;
            builder.isolate_ = isolate;
            builder.template_ = v8::FunctionTemplate::New(isolate, constructor, data);
            builder.template_->InstanceTemplate()->SetInternalFieldCount(InternalFieldCount);
            builder.proto_ = builder.template_->PrototypeTemplate();
#if JSB_DEBUG
            builder.class_payload_ = class_payload;
            JSB_LOG(VeryVerbose, "open class builder %d", builder.class_payload_);
#endif
            return builder;
        }

        // used in FAST_CONSTRUCTOR (which does not use any data payload in the constructor)
        template<int InternalFieldCount>
        static ClassBuilder New(v8::Isolate* isolate, const v8::FunctionCallback constructor)
        {
            ClassBuilder builder;
            builder.isolate_ = isolate;
            builder.template_ = v8::FunctionTemplate::New(isolate, constructor);
            builder.template_->InstanceTemplate()->SetInternalFieldCount(InternalFieldCount);
            builder.proto_ = builder.template_->PrototypeTemplate();
#if JSB_DEBUG
            builder.class_payload_ = 0;
            JSB_LOG(VeryVerbose, "open class builder %d", builder.class_payload_);
#endif
            return builder;
        }

    private:
        ClassBuilder() {}
    };
}
#endif
