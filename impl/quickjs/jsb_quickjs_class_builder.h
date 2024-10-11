#ifndef GODOTJS_QUICKJS_CLASS_BUILDER_H
#define GODOTJS_QUICKJS_CLASS_BUILDER_H
#include "jsb_quickjs_pch.h"
#include "jsb_quickjs_class.h"
#include "jsb_quickjs_primitive.h"
#include "jsb_quickjs_function_interop.h"

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
        v8::Local<v8::Function> template_;
        v8::Local<v8::Object> prototype_template_;

        bool closed_ = false;

    public:
        struct EnumDeclaration
        {
            EnumDeclaration(ClassBuilder& builder, bool is_instance_method, const v8::Local<v8::Name> name) : builder_(builder)
            {
                jsb_check(!builder_.closed_);
                enumeration_ = v8::Object::New(builder_.isolate_);

                if (is_instance_method) builder_.prototype_template_->Set(builder_.GetContext(), name, enumeration_);
                else builder_.template_->Set(builder_.GetContext(), name, enumeration_);
            }

            EnumDeclaration& Value(const String& name, int64_t data)
            {
                jsb_check(!builder_.closed_);
                const v8::Local<v8::Name> key = Helper::new_string(builder_.isolate_, name);
                const v8::Local<v8::Value> value = impl_private::Data<int64_t>::New(builder_.isolate_, data);

                enumeration_->Set(builder_.GetContext(), key, value);
                // represents the value back to string for convenient uses, such as MyColor[MyColor.White] => 'White'
                const JSAtom value_atom = JS_ValueToAtom(builder_.ctx(), (JSValue) value);
                JS_DefinePropertyValue(builder_.ctx(), (JSValue) enumeration_, value_atom, (JSValue) key, JS_PROP_CONFIGURABLE | JS_PROP_WRITABLE | JS_PROP_HAS_VALUE);
                JS_FreeAtom(builder_.ctx(), value_atom);
                return *this;
            }

        private:
            ClassBuilder& builder_;
            v8::Local<v8::Object> enumeration_;
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

                if (is_instance_method) builder_.prototype_template_->Set(builder_.GetContext(), key, value);
                else builder_.template_->Set(builder_.GetContext(), key, value);
            }

            template<typename T>
            void Method(const String& name, const v8::FunctionCallback callback, T data)
            {
                jsb_check(!builder_.closed_);
                const v8::Local<v8::Name> key = Helper::new_string(builder_.isolate_, name);
                const v8::Local<v8::FunctionTemplate> value = v8::FunctionTemplate::New(builder_.isolate_, callback, impl_private::Data<T>::New(builder_.isolate_, data));

                if (is_instance_method) builder_.prototype_template_->Set(builder_.GetContext(), key, value);
                else builder_.template_->Set(builder_.GetContext(), key, value);
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

                if (is_instance_method) builder_.prototype_template_->SetAccessorProperty(key, getter, setter);
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

                if (is_instance_method) builder_.prototype_template_->SetAccessorProperty(key, getter, setter);
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

                if (is_instance_method) builder_.prototype_template_->SetAccessorProperty(key, getter);
                else builder_.template_->SetAccessorProperty(key, getter);
            }

            void LazyProperty(const String& name, const v8::AccessorNameGetterCallback getter)
            {
                jsb_check(!builder_.closed_);
                const v8::Local<v8::Name> key = Helper::new_string(builder_.isolate_, name);

                if (is_instance_method) builder_.prototype_template_->SetLazyDataProperty(builder_.GetContext(), key, getter);
                else builder_.template_->SetLazyDataProperty(builder_.GetContext(), key, getter);
            }

            template<typename T>
            void Value(const v8::Local<v8::Name> key, T val)
            {
                jsb_check(!builder_.closed_);
                const v8::Local<v8::Value> value = impl_private::Data<T>::New(builder_.isolate_, val);
                if (is_instance_method) builder_.prototype_template_->Set(builder_.GetContext(), key, value);
                else builder_.template_->Set(builder_.GetContext(), key, value);
            }

            // generic set
            template<typename T>
            void Value(const String& name, T val)
            {
                jsb_check(!builder_.closed_);
                const v8::Local<v8::Name> key = Helper::new_string(builder_.isolate_, name);
                const v8::Local<v8::Value> value = impl_private::Data<T>::New(builder_.isolate_, val);

                if (is_instance_method) builder_.prototype_template_->Set(builder_.GetContext(), key, value);
                else builder_.template_->Set(builder_.GetContext(), key, value);
            }

        private:
            ClassBuilder& builder_;
            bool is_instance_method;
        };

        ClassBuilder(const ClassBuilder&) = delete;
        ClassBuilder& operator=(const ClassBuilder&) = delete;

        ClassBuilder(ClassBuilder&&) noexcept = default;
        ClassBuilder& operator=(ClassBuilder&&) = default;

        MemberDeclaration Static() { return MemberDeclaration(*this, false); }
        MemberDeclaration Instance() { return MemberDeclaration(*this, true); }

        void Inherit(const Class& base)
        {
            jsb_check(!closed_);
            jsb_check(!base.IsEmpty());
            JS_SetPrototype(isolate_->ctx(), (JSValue) prototype_template_, (JSValue) base.handle_);
        }

        Class Build(const v8::Local<v8::Context> context)
        {
            jsb_checkf(!closed_, "class builder is already closed");
            closed_ = true;
            JSContext* ctx = isolate_->ctx();
            JS_SetConstructor(ctx, (JSValue) template_, (JSValue) prototype_template_);
            return Class(isolate_, prototype_template_, template_);
        }

        template<uint8_t InternalFieldCount>
        static ClassBuilder New(v8::Isolate* isolate, const StringName& name, const v8::FunctionCallback constructor, const uint32_t class_payload)
        {
            JSContext* ctx = isolate->ctx();
            ClassBuilder builder;
            const String str = name;
            const CharString str8 = str.utf8();
            const int magic = isolate->add_constructor_data(constructor, class_payload);

            builder.isolate_ = isolate;
            builder.prototype_template_ = v8::Local<v8::Object>(v8::Data(isolate, isolate->push_steal(JS_NewObject(ctx))));
            builder.template_ = v8::Local<v8::Function>(v8::Data(isolate, isolate->push_steal(JS_NewCFunction2(ctx, _constructor<InternalFieldCount>, str8.ptr(), /*length*/ 0, JS_CFUNC_constructor_magic, (int) magic))));

            return builder;
        }

        ~ClassBuilder() = default;

    private:
        JSContext* ctx() const { return isolate_->ctx(); }

        v8::Local<v8::Context> GetContext() const
        {
            return isolate_->GetCurrentContext();
        }

        template<uint8_t InternalFieldCount>
        static JSValue _constructor(JSContext* ctx, JSValueConst new_target, int argc, JSValueConst* argv, int magic, JSValue* func_data)
        {
            v8::Isolate* isolate = (v8::Isolate*) JS_GetContextOpaque(ctx);
            v8::HandleScope handle_scope(isolate);
            const jsb::impl::ConstructorData constructor_data = isolate->get_constructor_data(magic);

            v8::FunctionCallbackInfo<v8::Value> info(isolate, argc, true);

            const JSValue proto = JS_GetProperty(ctx, new_target, JS_ATOM_prototype);
            jsb_check(!JS_IsException(proto) && JS_IsObject(proto));
            const JSValue this_val = JS_NewObjectProtoClass(ctx, proto, isolate->get_class_id());
            JS_FreeValue(ctx, proto);

            const jsb::internal::Index64 internal_data = isolate->add_internal_data(InternalFieldCount);
            JS_SetOpaque(this_val, (void*) *internal_data);

            // init function stack base
            static_assert(jsb::impl::FunctionStackBase::ReturnValue == 0);
            isolate->push_copy(JS_UNDEFINED);

            static_assert(jsb::impl::FunctionStackBase::This == 1);
            isolate->push_copy(this_val);

            static_assert(jsb::impl::FunctionStackBase::Data == 2);
            isolate->push_steal(JS_NewUint32(ctx, constructor_data.data));

            static_assert(jsb::impl::FunctionStackBase::NewTarget == 3);
            isolate->push_copy(new_target);

            constructor_data.callback(info);

            return this_val;
        }

        ClassBuilder() {}
    };

}
#endif
