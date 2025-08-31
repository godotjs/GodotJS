#ifndef GODOTJS_TRANSPILER_H
#define GODOTJS_TRANSPILER_H

#include "jsb_bridge_pch.h"
#include "jsb_environment.h"
#include "jsb_type_convert.h"
#include "jsb_object_handle.h"

#define JSB_CONTEXT_BOILERPLATE() \
    v8::Isolate* isolate = info.GetIsolate();\
    v8::Local<v8::Context> context = isolate->GetCurrentContext();\
    Functor& func = *(Functor*) Environment::get_function_pointer(context, info.Data().As<v8::Uint32>()->Value());\
    (void) 0

namespace jsb
{
    template<typename> struct PrimitiveAccess {};

    template<typename> struct VariantCaster {};

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
            NativeClassID class_id;
            const NativeClassInfoPtr class_info = environment->expose_godot_primitive_class(GetTypeInfo<T>::VARIANT_TYPE, &class_id);
            jsb_check(class_id);
            const v8::Local<v8::Object> inst = class_info->clazz.NewInstance(context);
            jsb_check(TypeConvert::is_variant(inst.As<v8::Object>()));

            // the lifecycle will be managed by javascript runtime, DO NOT DELETE it externally
            environment->bind_valuetype(environment->alloc_variant(val), inst.As<v8::Object>());
            info.GetReturnValue().Set(inst);
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
                jsb_throw(isolate, "failed to translate return value");
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
                jsb_throw(isolate, "failed to translate return value");
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
                jsb_throw(isolate, "failed to translate return value");
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
                jsb_throw(isolate, "failed to translate return value");
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
                jsb_throw(isolate, "failed to translate return value");
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
                jsb_throw(isolate, "failed to translate return value");
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
                jsb_throw(isolate, "failed to translate return value");
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
                jsb_throw(isolate, "failed to translate return value");
            }
        }

        static void function(const v8::FunctionCallbackInfo<v8::Value>& info)
        {
            typedef TReturn (*Functor)();
            JSB_CONTEXT_BOILERPLATE();

            TReturn result = (*func)();
            if (!PrimitiveAccess<TReturn>::return_(isolate, context, info, result))
            {
                jsb_throw(isolate, "failed to translate return value");
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
                jsb_throw(isolate, "failed to translate return value");
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
                jsb_throw(isolate, "failed to translate return value");
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

    struct ObjectTemplate
    {
        jsb_force_inline static impl::ClassBuilder create(Environment* env, internal::Index32 class_id)
        {
            v8::Isolate* isolate = env->get_isolate();
            NativeClassInfoPtr class_info = env->get_native_class(class_id);
            class_info->finalizer = &finalizer;
            return impl::ClassBuilder::New<IF_ObjectFieldCount>(isolate, class_info->name, &constructor, *class_id);
        }

    private:

        static void constructor(const v8::FunctionCallbackInfo<v8::Value>& info)
        {
            v8::Isolate* isolate = info.GetIsolate();
            const internal::Index32 class_id(info.Data().As<v8::Uint32>()->Value());

            jsb_checkf(info.IsConstructCall(), "call constructor as a regular function is not allowed");
            Environment* environment = Environment::wrap(isolate);
            StringName class_name;
            {
                const NativeClassInfoPtr class_info = environment->get_native_class(class_id);
                jsb_check(class_info->type == NativeClassType::GodotObject);
                class_name = class_info->name;
            }

            // We need to handle different binding scenarios:
            //
            // 1. Instantiating only the script class instance, which is to be bound to an existing Godot Object.
            // 2. Instantiating a new native Godot object along with the newly instantiated script class.

            jsb_check(info.NewTarget()->IsFunction());
            v8::Local<v8::Context> context = isolate->GetCurrentContext();
            const v8::Local<v8::Function> new_target = info.NewTarget().As<v8::Function>();

            const v8::Local<v8::Object> self = info.This();

            // 1. binding to an existing Godot object
            v8::Local<v8::Value> bind_object_value;
            if (new_target->Get(context, jsb_symbol(environment, ConstructorBindObject)).ToLocal(&bind_object_value) && bind_object_value->IsExternal())
            {
                JSB_LOG(Verbose, "binding to JS instance to existing native object. %s(%d)", class_name, class_id);
                environment->bind_godot_object(class_id, (Object*) bind_object_value.As<v8::External>()->Value(), self);
                return;
            }

            // 2a. directly instantiating a Godot native object (via its corresponding JavaScript wrapper class)
            if (new_target->HasOwnProperty(context, jsb_symbol(environment, ClassId)).ToChecked())
            // if (class_info->clazz.NewTarget(isolate) == new_target)
            {
                internal::StringNames& names = internal::StringNames::get_singleton();
                const StringName original_name = names.get_original_name(class_name);
                Object* gd_object = ClassDB::instantiate(original_name);

                // IS IT A TRUTH that ref_count==1 after creation_func??
                jsb_check(!gd_object->is_ref_counted() || !((RefCounted*) gd_object)->is_referenced());
                environment->bind_godot_object(class_id, gd_object, self);
                return;
            }

            // 2b. instantiating a sub-class of a native Godot object (JavaScript wrapper class)
            v8::Local<v8::Value> module_id_value;
            if (new_target->Get(context, jsb_symbol(environment, ClassModuleId)).ToLocal(&module_id_value) && module_id_value->IsString())
            {
                const StringName script_module_id = environment->get_string_name(module_id_value.As<v8::String>());
                jsb_check(environment->get_module_cache().find(script_module_id));
                JSB_LOG(Verbose, "(newbind) constructing %s(%s) which extends %s(%d) from script",
                    environment->get_script_class(environment->get_module_cache().find(script_module_id)->script_class_id)->js_class_name, script_module_id,
                    class_name, class_id);
                ScriptClassInfo::instantiate(environment, script_module_id, self);
                return;
            }

            impl::Helper::throw_error(isolate, jsb_format(
                "unexpected 'new.target', you may be instantiating a script class which is not exported as default. class: %s [native: %s (%d)]",
                impl::Helper::to_string_opt(isolate, new_target->Get(context, jsb_name(environment, name))),
                class_name, class_id));
        }

        static void finalizer(Environment* runtime, void* pointer, FinalizationType p_finalize)
        {
            Object* self = (Object*) pointer;
            if (self->is_ref_counted())
            {
                // ** because godot does not support removing object_bindings from Object **
                // this `unreference` call will loop back to `InstanceBindingCallbacks::reference_callback`
                // make sure the pointer has already been removed from the object_db_
                if (((RefCounted*) self)->unreference())
                {
                    JSB_LOG(VeryVerbose, "delete gd ref_counted object %d p_finalize %d", (uintptr_t) self, p_finalize);
                    memdelete(self);
                }
            }
            else
            {
                if (p_finalize != FinalizationType::None)
                {
                    JSB_LOG(VeryVerbose, "delete gd object %d", (uintptr_t) self);
                    memdelete(self);
                }
                else
                {
                    JSB_LOG(VeryVerbose, "unlink persistent gd object %d", (uintptr_t) self);
                }
            }
        }
    };

    namespace bind
    {
        // template<typename TSelf, typename TReturn, size_t N>
        // static void property(impl::ClassBuilder& builder, const ClassRegister& p_env, const v8::Local<v8::ObjectTemplate>& prototype, TReturn (*getter)(TSelf*), void (*setter)(TSelf*, TReturn), const char (&name)[N])
        // {
        //     builder.Instance().Property(name,
        //         &SpecializedReturn<TReturn>::template getter<TSelf>, p_env.add_free_function(getter),
        //         &SpecializedReturn<void>::template setter<TSelf, TReturn>, p_env.add_free_function(setter));
        // }

        // template<typename TSelf, typename TReturn, size_t N>
        // static void method(const ClassRegister& p_env, const v8::Local<v8::ObjectTemplate>& prototype, TReturn (TSelf::*func)(), const char (&name)[N])
        // {
        //     prototype->Set(impl::Helper::new_string(p_env.isolate, name), v8::FunctionTemplate::New(p_env.isolate, &SpecializedReturn<TReturn>::template method<TSelf>, v8::Uint32::NewFromUnsigned(p_env.isolate, p_env.add_free_function(func))));
        // }
        //
        // template<typename TSelf, typename TReturn, size_t N>
        // static void method(const ClassRegister& p_env, const v8::Local<v8::ObjectTemplate>& prototype, TReturn (TSelf::*func)() const, const char (&name)[N])
        // {
        //     prototype->Set(impl::Helper::new_string(p_env.isolate, name), v8::FunctionTemplate::New(p_env.isolate, &SpecializedReturn<TReturn>::template method<TSelf>, v8::Uint32::NewFromUnsigned(p_env.isolate, p_env.add_free_function(func))));
        // }
        //
        // template<typename TSelf, typename TReturn, typename... TArgs, size_t N>
        // static void method(const ClassRegister& p_env, const v8::Local<v8::ObjectTemplate>& prototype, TReturn (TSelf::*func)(TArgs...), const char (&name)[N])
        // {
        //     prototype->Set(impl::Helper::new_string(p_env.isolate, name), v8::FunctionTemplate::New(p_env.isolate, &SpecializedReturn<TReturn>::template method<TSelf, TArgs...>, v8::Uint32::NewFromUnsigned(p_env.isolate, p_env.add_free_function(func))));
        // }
        //
        // template<typename TSelf, typename TReturn, typename... TArgs, size_t N>
        // static void method(const ClassRegister& p_env, const v8::Local<v8::ObjectTemplate>& prototype, TReturn (TSelf::*func)(TArgs...) const, const char (&name)[N])
        // {
        //     prototype->Set(impl::Helper::new_string(p_env.isolate, name), v8::FunctionTemplate::New(p_env.isolate, &SpecializedReturn<TReturn>::template method<TSelf, TArgs...>, v8::Uint32::NewFromUnsigned(p_env.isolate, p_env.add_free_function(func))));
        // }
    }

}

#endif
