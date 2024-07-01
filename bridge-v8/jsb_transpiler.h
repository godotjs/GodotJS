#ifndef GODOTJS_TRANSPILER_H
#define GODOTJS_TRANSPILER_H

#include "jsb_pch.h"
#include "jsb_environment.h"
#include "jsb_realm.h"
#include "jsb_object_handle.h"

#define JSB_CLASS_BOILERPLATE() \
    jsb_force_inline static v8::Local<v8::FunctionTemplate> create(Environment* env, internal::Index32 class_id)\
    {\
        v8::Isolate* isolate = env->unwrap();\
        v8::Local<v8::FunctionTemplate> template_ = v8::FunctionTemplate::New(isolate, &constructor, v8::Uint32::NewFromUnsigned(isolate, class_id));\
        template_->InstanceTemplate()->SetInternalFieldCount(kObjectFieldCount);\
        NativeClassInfo& class_info = env->get_native_class(class_id);\
        class_info.finalizer = &finalizer;\
        class_info.template_.Reset(isolate, template_);\
        template_->SetClassName(env->get_string_name_cache().get_string_value(isolate, class_info.name));\
        return template_;\
    }

#define JSB_CLASS_BOILERPLATE_ARGS() \
    template<typename...TArgs>\
    jsb_force_inline static v8::Local<v8::FunctionTemplate> create(Environment* env, internal::Index32 class_id)\
    {\
        v8::Isolate* isolate = env->unwrap();\
        v8::Local<v8::FunctionTemplate> template_ = v8::FunctionTemplate::New(isolate, &constructor<TArgs...>, v8::Uint32::NewFromUnsigned(isolate, class_id));\
        template_->InstanceTemplate()->SetInternalFieldCount(kObjectFieldCount);\
        NativeClassInfo& class_info = env->get_native_class(class_id);\
        class_info.finalizer = &finalizer;\
        class_info.template_.Reset(isolate, template_);\
        template_->SetClassName(env->get_string_name_cache().get_string_value(isolate, class_info.name));\
        return template_;\
    }

#define JSB_CONTEXT_BOILERPLATE() \
    v8::Isolate* isolate = info.GetIsolate();\
    v8::Local<v8::Context> context = isolate->GetCurrentContext();\
    Functor& func = *(Functor*) Realm::get_function_pointer(context, info.Data()->Uint32Value(context).ToChecked());\
    (void) 0

namespace jsb
{
    template<typename> struct PrimitiveAccess {};

    template<typename> struct VariantCaster {};

    template<> struct VariantCaster<Vector2>
    {
        constexpr static Variant::Type Type = Variant::VECTOR2;
        static Vector2* from(const v8::Local<v8::Context>& context, const v8::Local<v8::Value>& p_val)
        {
            Variant* variant = (Variant*) p_val.As<v8::Object>()->GetAlignedPointerFromInternalField(kObjectFieldPointer);
            return VariantInternal::get_vector2(variant);
        }
    };

    template<> struct VariantCaster<Vector3>
    {
        constexpr static Variant::Type Type = Variant::VECTOR3;
        static Vector3* from(const v8::Local<v8::Context>& context, const v8::Local<v8::Value>& p_val)
        {
            Variant* variant = (Variant*) p_val.As<v8::Object>()->GetAlignedPointerFromInternalField(kObjectFieldPointer);
            return VariantInternal::get_vector3(variant);
        }
    };

    template<> struct VariantCaster<Vector4>
    {
        constexpr static Variant::Type Type = Variant::VECTOR4;
        static Vector4* from(const v8::Local<v8::Context>& context, const v8::Local<v8::Value>& p_val)
        {
            Variant* variant = (Variant*) p_val.As<v8::Object>()->GetAlignedPointerFromInternalField(kObjectFieldPointer);
            return VariantInternal::get_vector4(variant);
        }
    };

    template<> struct VariantCaster<Signal>
    {
        constexpr static Variant::Type Type = Variant::SIGNAL;
        static Signal* from(const v8::Local<v8::Context>& context, const v8::Local<v8::Value>& p_val)
        {
            Variant* variant = (Variant*) p_val.As<v8::Object>()->GetAlignedPointerFromInternalField(kObjectFieldPointer);
            return VariantInternal::get_signal(variant);
        }
    };

    template<> struct VariantCaster<Callable>
    {
        constexpr static Variant::Type Type = Variant::SIGNAL;
        static Callable* from(const v8::Local<v8::Context>& context, const v8::Local<v8::Value>& p_val)
        {
            Variant* variant = (Variant*) p_val.As<v8::Object>()->GetAlignedPointerFromInternalField(kObjectFieldPointer);
            return VariantInternal::get_callable(variant);
        }
    };

    template<> struct VariantCaster<Basis>
    {
        constexpr static Variant::Type Type = Variant::BASIS;
        static Basis* from(const v8::Local<v8::Context>& context, const v8::Local<v8::Value>& p_val)
        {
            Variant* variant = (Variant*) p_val.As<v8::Object>()->GetAlignedPointerFromInternalField(kObjectFieldPointer);
            return VariantInternal::get_basis(variant);
        }
    };

    template<typename T>
    struct PrimitiveAccessBoilerplate
    {
        static T from(const v8::Local<v8::Context>& context, const v8::Local<v8::Value>& p_val)
        {
            if (p_val.IsEmpty() || !p_val->IsObject()) return {};
            return *VariantCaster<T>::from(context, p_val);
        }

        //TODO test
        static bool return_(v8::Isolate* isolate, const v8::Local<v8::Context>& context, const v8::FunctionCallbackInfo<v8::Value>& info, const T& val)
        {
            Environment* environment = Environment::wrap(isolate);
            Realm* realm = Realm::wrap(context);
            NativeClassID class_id;
            const NativeClassInfo* class_info = realm->_expose_godot_primitive_class(VariantCaster<T>::Type, &class_id);

            v8::Local<v8::FunctionTemplate> jtemplate = class_info->template_.Get(isolate);
            v8::Local<v8::Object> r_jval = jtemplate->InstanceTemplate()->NewInstance(context).ToLocalChecked();
            jsb_check(r_jval.As<v8::Object>()->InternalFieldCount() == kObjectFieldCount);

            Variant* p_cvar = memnew(Variant(val));
            // the lifecycle will be managed by javascript runtime, DO NOT DELETE it externally
            environment->bind_object(class_id, p_cvar, r_jval.As<v8::Object>());
            info.GetReturnValue().Set(r_jval);
            return true;
        }
    };

    template<> struct PrimitiveAccess<Vector2> : PrimitiveAccessBoilerplate<Vector2> {};
    template<> struct PrimitiveAccess<Vector3> : PrimitiveAccessBoilerplate<Vector3> {};
    template<> struct PrimitiveAccess<Vector4> : PrimitiveAccessBoilerplate<Vector4> {};
    template<> struct PrimitiveAccess<Signal> : PrimitiveAccessBoilerplate<Signal> {};
    template<> struct PrimitiveAccess<Callable> : PrimitiveAccessBoilerplate<Callable> {};
    template<> struct PrimitiveAccess<Basis> : PrimitiveAccessBoilerplate<Basis> {};

    // template<> struct PrimitiveAccess<const Vector2> : PrimitiveAccessBoilerplate<Vector2> {};
    // template<> struct PrimitiveAccess<const Vector3> : PrimitiveAccessBoilerplate<Vector3> {};
    // template<> struct PrimitiveAccess<const Vector4> : PrimitiveAccessBoilerplate<Vector4> {};

    template<> struct PrimitiveAccess<const Vector2&> : PrimitiveAccessBoilerplate<Vector2> {};
    template<> struct PrimitiveAccess<const Vector3&> : PrimitiveAccessBoilerplate<Vector3> {};
    template<> struct PrimitiveAccess<const Vector4&> : PrimitiveAccessBoilerplate<Vector4> {};
    template<> struct PrimitiveAccess<const Signal&> : PrimitiveAccessBoilerplate<Signal> {};
    template<> struct PrimitiveAccess<const Callable&> : PrimitiveAccessBoilerplate<Callable> {};

    template<> struct PrimitiveAccess<real_t>
    {
        static real_t from(const v8::Local<v8::Context>& context, const v8::Local<v8::Value>& p_val)
        {
            return (real_t) p_val->NumberValue(context).ToChecked();
        }
        static bool return_(v8::Isolate* isolate, const v8::Local<v8::Context>& context, const v8::FunctionCallbackInfo<v8::Value>& info, real_t val)
        {
            info.GetReturnValue().Set(val);
            return true;
        }
    };
    // template<> struct PrimitiveAccess<const real_t> : PrimitiveAccess<real_t> {};
    template<> struct PrimitiveAccess<const real_t&> : PrimitiveAccess<real_t> {};

    template<> struct PrimitiveAccess<int32_t>
    {
        static int32_t from(const v8::Local<v8::Context>& context, const v8::Local<v8::Value>& p_val)
        {
            return p_val->Int32Value(context).FromMaybe(0);
        }
        static bool return_(v8::Isolate* isolate, const v8::Local<v8::Context>& context, const v8::FunctionCallbackInfo<v8::Value>& info, int32_t val)
        {
            info.GetReturnValue().Set(val);
            return true;
        }
    };
    template<> struct PrimitiveAccess<uint32_t>
    {
        static uint32_t from(const v8::Local<v8::Context>& context, const v8::Local<v8::Value>& p_val)
        {
            return p_val->Uint32Value(context).ToChecked();
        }
        static bool return_(v8::Isolate* isolate, const v8::Local<v8::Context>& context, const v8::FunctionCallbackInfo<v8::Value>& info, uint32_t val)
        {
            info.GetReturnValue().Set(val);
            return true;
        }
    };
    template<> struct PrimitiveAccess<const int32_t> : PrimitiveAccess<int32_t> {};
    template<> struct PrimitiveAccess<Vector2::Axis> : PrimitiveAccess<int32_t> {};
    template<> struct PrimitiveAccess<Vector3::Axis> : PrimitiveAccess<int32_t> {};
    template<> struct PrimitiveAccess<Vector4::Axis> : PrimitiveAccess<int32_t> {};

    template<> struct PrimitiveAccess<Error>
    {
        static Error from(const v8::Local<v8::Context>& context, const v8::Local<v8::Value>& p_val)
        {
            return (Error) p_val->Int32Value(context).ToChecked();
        }
        static bool return_(v8::Isolate* isolate, const v8::Local<v8::Context>& context, const v8::FunctionCallbackInfo<v8::Value>& info, Error val)
        {
            info.GetReturnValue().Set((int32_t) val);
            return true;
        }
    };

    template<> struct PrimitiveAccess<bool>
    {
        static bool from(const v8::Local<v8::Context>& context, const v8::Local<v8::Value>& p_val)
        {
            return p_val->BooleanValue(context->GetIsolate());
        }
        static bool return_(v8::Isolate* isolate, const v8::Local<v8::Context>& context, const v8::FunctionCallbackInfo<v8::Value>& info, bool val)
        {
            info.GetReturnValue().Set(val);
            return true;
        }
    };

    // call with return
    template<typename TReturn>
    struct SpecializedReturn
    {
        template<typename TSelf>
        static void method(const v8::FunctionCallbackInfo<v8::Value>& info)
        {
            typedef TReturn (TSelf::*Functor)();
            JSB_CONTEXT_BOILERPLATE();

            TSelf* p_self = VariantCaster<TSelf>::from(context, info.This());
            TReturn result = (p_self->*func)();
            if (!PrimitiveAccess<TReturn>::return_(isolate, context, info, result))
            {
                isolate->ThrowError("failed to translate return value");
            }
        }

        template<typename TSelf, typename P0>
        static void method(const v8::FunctionCallbackInfo<v8::Value>& info)
        {
            typedef TReturn (TSelf::*Functor)(P0);
            JSB_CONTEXT_BOILERPLATE();

            TSelf* p_self = VariantCaster<TSelf>::from(context, info.This());
            P0 p0 = PrimitiveAccess<P0>::from(context, info[0]);
            TReturn result = (p_self->*func)(p0);
            if (!PrimitiveAccess<TReturn>::return_(isolate, context, info, result))
            {
                isolate->ThrowError("failed to translate return value");
            }
        }

        template<typename TSelf, typename P0, typename P1>
        static void method(const v8::FunctionCallbackInfo<v8::Value>& info)
        {
            typedef TReturn (TSelf::*Functor)(P0, P1);
            JSB_CONTEXT_BOILERPLATE();

            TSelf* p_self = VariantCaster<TSelf>::from(context, info.This());
            P0 p0 = PrimitiveAccess<P0>::from(context, info[0]);
            P1 p1 = PrimitiveAccess<P1>::from(context, info[1]);
            TReturn result = (p_self->*func)(p0, p1);
            if (!PrimitiveAccess<TReturn>::return_(isolate, context, info, result))
            {
                isolate->ThrowError("failed to translate return value");
            }
        }

        template<typename TSelf, typename P0, typename P1, typename P2>
        static void method(const v8::FunctionCallbackInfo<v8::Value>& info)
        {
            typedef TReturn (TSelf::*Functor)(P0, P1, P2);
            JSB_CONTEXT_BOILERPLATE();

            TSelf* p_self = VariantCaster<TSelf>::from(context, info.This());
            P0 p0 = PrimitiveAccess<P0>::from(context, info[0]);
            P1 p1 = PrimitiveAccess<P1>::from(context, info[1]);
            P2 p2 = PrimitiveAccess<P2>::from(context, info[2]);
            TReturn result = (p_self->*func)(p0, p1, p2);
            if (!PrimitiveAccess<TReturn>::return_(isolate, context, info, result))
            {
                isolate->ThrowError("failed to translate return value");
            }
        }

        template<typename TSelf, typename P0, typename P1, typename P2, typename P3>
        static void method(const v8::FunctionCallbackInfo<v8::Value>& info)
        {
            typedef TReturn (TSelf::*Functor)(P0, P1, P2, P3);
            JSB_CONTEXT_BOILERPLATE();

            TSelf* p_self = VariantCaster<TSelf>::from(context, info.This());
            P0 p0 = PrimitiveAccess<P0>::from(context, info[0]);
            P1 p1 = PrimitiveAccess<P1>::from(context, info[1]);
            P2 p2 = PrimitiveAccess<P2>::from(context, info[2]);
            P3 p3 = PrimitiveAccess<P3>::from(context, info[3]);
            TReturn result = (p_self->*func)(p0, p1, p2, p3);
            if (!PrimitiveAccess<TReturn>::return_(isolate, context, info, result))
            {
                isolate->ThrowError("failed to translate return value");
            }
        }

        template<typename TSelf, typename P0, typename P1, typename P2, typename P3, typename P4>
        static void method(const v8::FunctionCallbackInfo<v8::Value>& info)
        {
            typedef TReturn (TSelf::*Functor)(P0, P1, P2, P3, P4);
            JSB_CONTEXT_BOILERPLATE();

            TSelf* p_self = VariantCaster<TSelf>::from(context, info.This());
            P0 p0 = PrimitiveAccess<P0>::from(context, info[0]);
            P1 p1 = PrimitiveAccess<P1>::from(context, info[1]);
            P2 p2 = PrimitiveAccess<P2>::from(context, info[2]);
            P3 p3 = PrimitiveAccess<P3>::from(context, info[3]);
            P4 p4 = PrimitiveAccess<P4>::from(context, info[4]);
            TReturn result = (p_self->*func)(p0, p1, p2, p3, p4);
            if (!PrimitiveAccess<TReturn>::return_(isolate, context, info, result))
            {
                isolate->ThrowError("failed to translate return value");
            }
        }

        template<typename TSelf, typename P0, typename P1, typename P2, typename P3, typename P4, typename P5>
        static void method(const v8::FunctionCallbackInfo<v8::Value>& info)
        {
            typedef TReturn (TSelf::*Functor)(P0, P1, P2, P3, P4, P5);
            JSB_CONTEXT_BOILERPLATE();

            TSelf* p_self = VariantCaster<TSelf>::from(context, info.This());
            P0 p0 = PrimitiveAccess<P0>::from(context, info[0]);
            P1 p1 = PrimitiveAccess<P1>::from(context, info[1]);
            P2 p2 = PrimitiveAccess<P2>::from(context, info[2]);
            P3 p3 = PrimitiveAccess<P3>::from(context, info[3]);
            P4 p4 = PrimitiveAccess<P4>::from(context, info[4]);
            P5 p5 = PrimitiveAccess<P5>::from(context, info[5]);
            TReturn result = (p_self->*func)(p0, p1, p2, p3, p4, p5);
            if (!PrimitiveAccess<TReturn>::return_(isolate, context, info, result))
            {
                isolate->ThrowError("failed to translate return value");
            }
        }

        template<typename TSelf, typename P0, typename P1, typename P2, typename P3, typename P4, typename P5, typename P6>
        static void method(const v8::FunctionCallbackInfo<v8::Value>& info)
        {
            typedef TReturn (TSelf::*Functor)(P0, P1, P2, P3, P4, P5, P6);
            JSB_CONTEXT_BOILERPLATE();

            TSelf* p_self = VariantCaster<TSelf>::from(context, info.This());
            P0 p0 = PrimitiveAccess<P0>::from(context, info[0]);
            P1 p1 = PrimitiveAccess<P1>::from(context, info[1]);
            P2 p2 = PrimitiveAccess<P2>::from(context, info[2]);
            P3 p3 = PrimitiveAccess<P3>::from(context, info[3]);
            P4 p4 = PrimitiveAccess<P4>::from(context, info[4]);
            P5 p5 = PrimitiveAccess<P5>::from(context, info[5]);
            P6 p6 = PrimitiveAccess<P6>::from(context, info[6]);
            TReturn result = (p_self->*func)(p0, p1, p2, p3, p4, p5, p6);
            if (!PrimitiveAccess<TReturn>::return_(isolate, context, info, result))
            {
                isolate->ThrowError("failed to translate return value");
            }
        }

        static void function(const v8::FunctionCallbackInfo<v8::Value>& info)
        {
            typedef TReturn (*Functor)();
            JSB_CONTEXT_BOILERPLATE();

            TReturn result = (*func)();
            if (!PrimitiveAccess<TReturn>::return_(isolate, context, info, result))
            {
                isolate->ThrowError("failed to translate return value");
            }
        }

        template<typename P0>
        static void function(const v8::FunctionCallbackInfo<v8::Value>& info)
        {
            typedef TReturn (*Functor)(P0);
            JSB_CONTEXT_BOILERPLATE();
            P0 p0 = PrimitiveAccess<P0>::from(context, info[0]);
            TReturn result = (*func)(p0);
            if (!PrimitiveAccess<TReturn>::return_(isolate, context, info, result))
            {
                isolate->ThrowError("failed to translate return value");
            }
        }

        template<typename TSelf>
        static void getter(const v8::FunctionCallbackInfo<v8::Value>& info)
        {
            typedef TReturn (*Functor)(TSelf*);
            JSB_CONTEXT_BOILERPLATE();

            TSelf* p_self = VariantCaster<TSelf>::from(context, info.This());
            TReturn result = (*func)(p_self);
            if (!PrimitiveAccess<TReturn>::return_(isolate, context, info, result))
            {
                isolate->ThrowError("failed to translate return value");
            }
        }
    };

    // call without return
    template<>
    struct SpecializedReturn<void>
    {
        template<typename TSelf>
        static void method(const v8::FunctionCallbackInfo<v8::Value>& info)
        {
            typedef void (TSelf::*Functor)();
            JSB_CONTEXT_BOILERPLATE();

            TSelf* p_self = VariantCaster<TSelf>::from(context, info.This());
            (p_self->*func)();
        }

        template<typename TSelf, typename P0>
        static void method(const v8::FunctionCallbackInfo<v8::Value>& info)
        {
            typedef void (TSelf::*Functor)(P0);
            JSB_CONTEXT_BOILERPLATE();

            TSelf* p_self = VariantCaster<TSelf>::from(context, info.This());
            P0 p0 = PrimitiveAccess<P0>::from(context, info[0]);
            (p_self->*func)(p0);
        }

        template<typename TSelf, typename P0, typename P1>
        static void method(const v8::FunctionCallbackInfo<v8::Value>& info)
        {
            typedef void (TSelf::*Functor)(P0, P1);
            JSB_CONTEXT_BOILERPLATE();

            TSelf* p_self = VariantCaster<TSelf>::from(context, info.This());
            P0 p0 = PrimitiveAccess<P0>::from(context, info[0]);
            P1 p1 = PrimitiveAccess<P1>::from(context, info[1]);
            (p_self->*func)(p0, p1);
        }

        template<typename TSelf, typename P0>
        static void setter(const v8::FunctionCallbackInfo<v8::Value>& info)
        {
            typedef void (*Functor)(TSelf*, P0);
            JSB_CONTEXT_BOILERPLATE();

            TSelf* p_self = VariantCaster<TSelf>::from(context, info.This());
            P0 p0 = PrimitiveAccess<P0>::from(context, info[0]);
            (*func)(p_self, p0);
        }

    };

    template<typename TSelf>
    struct ClassTemplate
    {
        JSB_CLASS_BOILERPLATE()
        JSB_CLASS_BOILERPLATE_ARGS()

        static void constructor(const v8::FunctionCallbackInfo<v8::Value>& info)
        {
            v8::Isolate* isolate = info.GetIsolate();
            v8::HandleScope handle_scope(isolate);
            v8::Isolate::Scope isolate_scope(isolate);
            v8::Local<v8::Object> self = info.This();
            internal::Index32 class_id(v8::Local<v8::Uint32>::Cast(info.Data())->Value());

            TSelf* ptr = memnew(TSelf);
            Environment* runtime = Environment::wrap(isolate);
            runtime->bind_object(class_id, ptr, self);
        }

        template<typename P0, typename P1, typename P2>
        static void constructor(const v8::FunctionCallbackInfo<v8::Value>& info)
        {
            v8::Isolate* isolate = info.GetIsolate();
            v8::HandleScope handle_scope(isolate);
            v8::Isolate::Scope isolate_scope(isolate);
            v8::Local<v8::Context> context = isolate->GetCurrentContext();
            v8::Local<v8::Object> self = info.This();
            internal::Index32 class_id(v8::Local<v8::Uint32>::Cast(info.Data())->Value());
            if (info.Length() != 3)
            {
                isolate->ThrowError("bad args");
                return;
            }
            P0 p0 = PrimitiveAccess<P0>::from(context, info[0]);
            P1 p1 = PrimitiveAccess<P1>::from(context, info[1]);
            P2 p2 = PrimitiveAccess<P2>::from(context, info[2]);
            TSelf* ptr = memnew(TSelf(p0, p1, p2));
            Environment* runtime = Environment::wrap(isolate);
            runtime->bind_object(class_id, ptr, self);
        }

        static void finalizer(Environment* runtime, void* pointer, bool p_persistent)
        {
            TSelf* self = (TSelf*) pointer;
            if (!p_persistent)
            {
                memdelete(self);
            }
        }
    };

    template<typename TSelf>
    struct VariantClassTemplate
    {
        JSB_CLASS_BOILERPLATE()
        JSB_CLASS_BOILERPLATE_ARGS()

        static void constructor(const v8::FunctionCallbackInfo<v8::Value>& info)
        {
            v8::Isolate* isolate = info.GetIsolate();
            v8::HandleScope handle_scope(isolate);
            v8::Isolate::Scope isolate_scope(isolate);
            v8::Local<v8::Object> self = info.This();
            internal::Index32 class_id(v8::Local<v8::Uint32>::Cast(info.Data())->Value());

            Variant* ptr = memnew(Variant);
            Environment* runtime = Environment::wrap(isolate);
            runtime->bind_object(class_id, ptr, self);
        }

        template<typename P0>
        static void constructor(const v8::FunctionCallbackInfo<v8::Value>& info)
        {
            v8::Isolate* isolate = info.GetIsolate();
            v8::HandleScope handle_scope(isolate);
            v8::Isolate::Scope isolate_scope(isolate);
            v8::Local<v8::Context> context = isolate->GetCurrentContext();
            v8::Local<v8::Object> self = info.This();
            internal::Index32 class_id(v8::Local<v8::Uint32>::Cast(info.Data())->Value());
            if (info.Length() != 1)
            {
                isolate->ThrowError("bad args");
                return;
            }
            P0 p0 = PrimitiveAccess<P0>::from(context, info[0]);
            Variant* ptr = memnew(Variant(TSelf(p0)));
            Environment* runtime = Environment::wrap(isolate);
            runtime->bind_object(class_id, ptr, self);
        }

        template<typename P0, typename P1>
        static void constructor(const v8::FunctionCallbackInfo<v8::Value>& info)
        {
            v8::Isolate* isolate = info.GetIsolate();
            v8::HandleScope handle_scope(isolate);
            v8::Isolate::Scope isolate_scope(isolate);
            v8::Local<v8::Context> context = isolate->GetCurrentContext();
            v8::Local<v8::Object> self = info.This();
            internal::Index32 class_id(v8::Local<v8::Uint32>::Cast(info.Data())->Value());
            if (info.Length() != 2)
            {
                isolate->ThrowError("bad args");
                return;
            }
            P0 p0 = PrimitiveAccess<P0>::from(context, info[0]);
            P1 p1 = PrimitiveAccess<P1>::from(context, info[1]);
            Variant* ptr = memnew(Variant(TSelf(p0, p1)));
            Environment* runtime = Environment::wrap(isolate);
            runtime->bind_object(class_id, ptr, self);
        }

        template<typename P0, typename P1, typename P2>
        static void constructor(const v8::FunctionCallbackInfo<v8::Value>& info)
        {
            v8::Isolate* isolate = info.GetIsolate();
            v8::HandleScope handle_scope(isolate);
            v8::Isolate::Scope isolate_scope(isolate);
            v8::Local<v8::Context> context = isolate->GetCurrentContext();
            v8::Local<v8::Object> self = info.This();
            internal::Index32 class_id(v8::Local<v8::Uint32>::Cast(info.Data())->Value());
            if (info.Length() != 3)
            {
                isolate->ThrowError("bad args");
                return;
            }
            P0 p0 = PrimitiveAccess<P0>::from(context, info[0]);
            P1 p1 = PrimitiveAccess<P1>::from(context, info[1]);
            P2 p2 = PrimitiveAccess<P2>::from(context, info[2]);
            Variant* ptr = memnew(Variant(TSelf(p0, p1, p2)));
            Environment* runtime = Environment::wrap(isolate);
            runtime->bind_object(class_id, ptr, self);
        }

        template<typename P0, typename P1, typename P2, typename P3>
        static void constructor(const v8::FunctionCallbackInfo<v8::Value>& info)
        {
            v8::Isolate* isolate = info.GetIsolate();
            v8::HandleScope handle_scope(isolate);
            v8::Isolate::Scope isolate_scope(isolate);
            v8::Local<v8::Context> context = isolate->GetCurrentContext();
            v8::Local<v8::Object> self = info.This();
            internal::Index32 class_id(v8::Local<v8::Uint32>::Cast(info.Data())->Value());
            if (info.Length() != 4)
            {
                isolate->ThrowError("bad args");
                return;
            }
            P0 p0 = PrimitiveAccess<P0>::from(context, info[0]);
            P1 p1 = PrimitiveAccess<P1>::from(context, info[1]);
            P2 p2 = PrimitiveAccess<P2>::from(context, info[2]);
            P3 p3 = PrimitiveAccess<P3>::from(context, info[3]);
            Variant* ptr = memnew(Variant(TSelf(p0, p1, p2, p3)));
            Environment* runtime = Environment::wrap(isolate);
            runtime->bind_object(class_id, ptr, self);
        }

        static void finalizer(Environment* runtime, void* pointer, bool p_persistent)
        {
            Variant* self = (Variant*) pointer;
            if (!p_persistent)
            {
                memdelete(self);
            }
        }
    };

    template<>
    struct ClassTemplate<Object>
    {
        JSB_CLASS_BOILERPLATE()

        static void constructor(const v8::FunctionCallbackInfo<v8::Value>& info)
        {
            v8::Isolate* isolate = info.GetIsolate();
            v8::HandleScope handle_scope(isolate);
            v8::Isolate::Scope isolate_scope(isolate);
            v8::Local<v8::Context> context = isolate->GetCurrentContext();
            const internal::Index32 class_id(v8::Local<v8::Uint32>::Cast(info.Data())->Value());

            jsb_checkf(info.IsConstructCall(), "call constructor as a regular function is not allowed");
            Environment* environment = Environment::wrap(isolate);
            const NativeClassInfo& jclass_info = environment->get_native_class(class_id);
            jsb_check(jclass_info.type == NativeClassType::GodotObject);
            v8::Local<v8::Value> new_target = info.NewTarget();
            v8::Local<v8::Function> constructor = jclass_info.get_function(isolate, context);

            if (constructor == new_target)
            {
                v8::Local<v8::Object> self = info.This();
                const HashMap<StringName, ClassDB::ClassInfo>::Iterator it = ClassDB::classes.find(jclass_info.name);
                jsb_check(it != ClassDB::classes.end());
                const ClassDB::ClassInfo& gd_class_info = it->value;

                Object* gd_object = gd_class_info.creation_func();
                //NOTE IS IT A TRUTH that ref_count==1 after creation_func??
                jsb_check(!gd_object->is_ref_counted() || !((RefCounted*) gd_object)->is_referenced());
                environment->bind_godot_object(class_id, gd_object, self);
            }
            else
            {
                JSB_LOG(VeryVerbose, "(crossbind) constructing %s(%d) from subclass", jclass_info.name, (uint32_t) class_id);
            }
        }

        static void finalizer(Environment* runtime, void* pointer, bool p_persistent)
        {
            Object* self = (Object*) pointer;
            if (self->is_ref_counted())
            {
                // if we do not `free_instance_binding`, an error will be report on `reference_object (deref)`.
                // self->free_instance_binding(runtime);

                if (((RefCounted*) self)->unreference())
                {
                    if (!p_persistent)
                    {
                        JSB_LOG(VeryVerbose, "deleting gd ref_counted object %s", uitos((uintptr_t) self));
                        memdelete(self);
                    }
                }
            }
            else
            {
                //TODO only delete when the object's lifecycle is fully managed by javascript
                if (!p_persistent)
                {
                    JSB_LOG(VeryVerbose, "deleting gd object %s", uitos((uintptr_t) self));
                    memdelete(self);
                }
            }
        }
    };

    namespace bind
    {
        template<typename TSelf, typename TReturn, size_t N>
        static void property(const FBindingEnv& p_env, const v8::Local<v8::ObjectTemplate>& prototype, TReturn (*getter)(TSelf*), void (*setter)(TSelf*, TReturn), const char (&name)[N])
        {
            prototype->SetAccessorProperty(v8::String::NewFromUtf8Literal(p_env.isolate, name),
                v8::FunctionTemplate::New(p_env.isolate, &SpecializedReturn<TReturn>::template getter<TSelf>, v8::Uint32::NewFromUnsigned(p_env.isolate, p_env.function_pointers.add(getter))),
                v8::FunctionTemplate::New(p_env.isolate, &SpecializedReturn<void>::template setter<TSelf, TReturn>, v8::Uint32::NewFromUnsigned(p_env.isolate, p_env.function_pointers.add(setter)))
                    );
        }

        template<typename TSelf, typename TReturn, size_t N>
        static void method(const FBindingEnv& p_env, const v8::Local<v8::ObjectTemplate>& prototype, TReturn (TSelf::*func)(), const char (&name)[N])
        {
            prototype->Set(v8::String::NewFromUtf8Literal(p_env.isolate, name), v8::FunctionTemplate::New(p_env.isolate, &SpecializedReturn<TReturn>::template method<TSelf>, v8::Uint32::NewFromUnsigned(p_env.isolate, p_env.function_pointers.add(func))));
        }

        template<typename TSelf, typename TReturn, size_t N>
        static void method(const FBindingEnv& p_env, const v8::Local<v8::ObjectTemplate>& prototype, TReturn (TSelf::*func)() const, const char (&name)[N])
        {
            prototype->Set(v8::String::NewFromUtf8Literal(p_env.isolate, name), v8::FunctionTemplate::New(p_env.isolate, &SpecializedReturn<TReturn>::template method<TSelf>, v8::Uint32::NewFromUnsigned(p_env.isolate, p_env.function_pointers.add(func))));
        }

        template<typename TSelf, typename TReturn, typename... TArgs, size_t N>
        static void method(const FBindingEnv& p_env, const v8::Local<v8::ObjectTemplate>& prototype, TReturn (TSelf::*func)(TArgs...), const char (&name)[N])
        {
            prototype->Set(v8::String::NewFromUtf8Literal(p_env.isolate, name), v8::FunctionTemplate::New(p_env.isolate, &SpecializedReturn<TReturn>::template method<TSelf, TArgs...>, v8::Uint32::NewFromUnsigned(p_env.isolate, p_env.function_pointers.add(func))));
        }

        template<typename TSelf, typename TReturn, typename... TArgs, size_t N>
        static void method(const FBindingEnv& p_env, const v8::Local<v8::ObjectTemplate>& prototype, TReturn (TSelf::*func)(TArgs...) const, const char (&name)[N])
        {
            prototype->Set(v8::String::NewFromUtf8Literal(p_env.isolate, name), v8::FunctionTemplate::New(p_env.isolate, &SpecializedReturn<TReturn>::template method<TSelf, TArgs...>, v8::Uint32::NewFromUnsigned(p_env.isolate, p_env.function_pointers.add(func))));
        }
    }

}

#endif
