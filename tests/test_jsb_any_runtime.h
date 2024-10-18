#ifndef GODOTJS_TESTS_JSB_ANY_RUNTIME_H
#define GODOTJS_TESTS_JSB_ANY_RUNTIME_H

#include "jsb_test_helpers.h"
#include "../bridge/jsb_builtins.h"

// universal test cases for any runtime
namespace jsb::tests
{
    struct Bindings
    {
        // info[0] - set
        // info[1] - super get
        static void check_class(const v8::FunctionCallbackInfo<v8::Value>& info)
        {
            CHECK(info.Length() == 2);
            CHECK(info[0]->IsObject());
            CHECK(info[1]->IsObject());
            v8::Isolate* isolate = info.GetIsolate();
            v8::Local<v8::Context> context = isolate->GetCurrentContext();
            v8::Local<v8::Object> s1 = info[0].As<v8::Object>();
            v8::Local<v8::Object> s2 = info[1].As<v8::Object>();
            v8::Local<v8::Symbol> prop = v8::Symbol::New(isolate);

            CHECK(s1 != s2);
            s1->Set(context, prop, v8::Uint32::NewFromUnsigned(isolate, 123)).Check();
            v8::Local<v8::Object> c2 = s2
                ->Get(context, impl::Helper::new_string(isolate, "prototype")).ToLocalChecked().As<v8::Object>()
                ->Get(context, impl::Helper::new_string(isolate, "__proto__")).ToLocalChecked().As<v8::Object>() // the base class prototype
                ->Get(context, impl::Helper::new_string(isolate, "constructor")).ToLocalChecked().As<v8::Object>();
            CHECK(c2 == s1);
            v8::Local<v8::Value> v2 = c2->Get(context, prop).ToLocalChecked();
            CHECK(v2->IsNumber());
            CHECK(v2.As<v8::Uint32>()->Value() == 123);
        }
    };

    TEST_CASE("[jsb] isolate.essential")
    {
        impl::GlobalInitialize::init();
        ArrayBufferAllocator allocator;
        v8::Isolate::CreateParams create_params;
        create_params.array_buffer_allocator = &allocator;

        v8::Isolate* isolate = v8::Isolate::New(create_params);
        v8::Global<v8::Context> context_v;
        {
            {
                v8::Isolate::Scope isolate_scope(isolate);
                v8::HandleScope scope_0(isolate);
                v8::Local<v8::Context> context = v8::Context::New(isolate);

                context_v.Reset(isolate, context);
                const v8::Context::Scope context_scope(context);
            }

            // test Map::New()
            {
                v8::Isolate::Scope isolate_scope(isolate);
                v8::HandleScope scope_1(isolate);
                v8::Local<v8::Context> context = context_v.Get(isolate);
                const v8::Context::Scope context_scope(context);

                v8::Local<v8::Map> map = v8::Map::New(isolate);
                CHECK(map->IsMap());
            }

            // test Symbol::New()
            {
                v8::Isolate::Scope isolate_scope(isolate);
                v8::HandleScope scope_1(isolate);
                v8::Local<v8::Context> context = context_v.Get(isolate);
                const v8::Context::Scope context_scope(context);

                v8::Local<v8::Object> host = v8::Object::New(isolate);
                v8::Global<v8::Symbol> items[10] = {};
                for (int i = 0; i < 10; i++)
                {
                    v8::Local<v8::Symbol> symbol = v8::Symbol::New(isolate);
                    items[i].Reset(isolate, symbol);
                    CHECK(items[i].Get(isolate) == symbol);
                    CHECK(!items[i].Get(isolate).IsEmpty());
                    CHECK(items[i].Get(isolate)->IsSymbol());
                    host->Set(context, symbol, v8::Int32::New(isolate, i));
                }
                for (int i = 0; i < 10; i++)
                {
                    v8::Local<v8::Value> value = host->Get(context, items[i].Get(isolate)).ToLocalChecked();
                    CHECK(value->IsInt32());
                    CHECK(value.As<v8::Int32>()->Value() == i);
                    for (int j = 0; j < 10; j++)
                    {
                        if (i == j) CHECK(items[i] == items[j]);
                        else CHECK(items[i] != items[j]);
                    }
                }
            }

            // test class builder
            impl::Class class1;
            impl::Class class2;
            {
                v8::HandleScope scope_1(isolate);
                v8::Local<v8::Context> context = context_v.Get(isolate);
                const v8::Context::Scope context_scope(context);

                impl::ClassBuilder builder1 = impl::ClassBuilder::New<IF_ObjectFieldCount>(isolate, "B1", StubBindings::constructor, 0);
                builder1.Static().Value(impl::Helper::new_string(isolate, "Native1"), (uint32_t) 1);
                builder1.Static().Method("Function", StubBindings::function);
                builder1.Instance().Method("Method", StubBindings::method);
                class1 = builder1.Build(context);
                context->Global()->Set(context, impl::Helper::new_string(isolate, "B1"), class1.Get(isolate)).Check();
                Builtins::register_(context, context->Global());
            // }
            // {
            //     v8::HandleScope scope_1(isolate);
            //     v8::Local<v8::Context> context = context_v.Get(isolate);
            //     const v8::Context::Scope context_scope(context);

                impl::ClassBuilder builder2 = impl::ClassBuilder::New<IF_ObjectFieldCount>(isolate, "B2", StubBindings::constructor, 0);
                builder2.Inherit(class1);
                class2 = builder2.Build(context);
                context->Global()->Set(context, impl::Helper::new_string(isolate, "B2"), class2.Get(isolate)).Check();
                context->Global()->Set(context, impl::Helper::new_string(isolate, "check_class"), v8::Function::New(context, Bindings::check_class).ToLocalChecked()).Check();
            }

            // test script class inheriting
            {
                v8::HandleScope scope_1(isolate);
                v8::Local<v8::Context> context = context_v.Get(isolate);
                const v8::Context::Scope context_scope(context);

                static constexpr char source[] = R"--((function() {
console.assert(B1.name == "B1");

class S1 extends B1 {}
class S2 extends B2 {}
class S3 extends S2 {}
let s2 = new S2();
console.assert(s2 instanceof B1);

//
console.assert(typeof Object.getOwnPropertyDescriptor(S1, "Native1") === "undefined");
console.assert(typeof Object.getOwnPropertyDescriptor(B1, "Native1") === "object");

// check FunctionTemplate inheriting
console.assert(s2 instanceof B2);
console.assert(s2 instanceof B1);
console.assert(B2.prototype.constructor === B2);
console.assert(B2.prototype instanceof B1);
console.assert(B2.prototype.__proto__ === B1.prototype);
check_class(S2, S3);
return 1+1;
}))--";
                impl::TryCatch try_catch(isolate);
                v8::MaybeLocal<v8::Value> eval = impl::Helper::compile_run(context, source, ::std::size(source) - 1, "testcase.js");
                Utils::print_exception(try_catch);
                CHECK(!eval.IsEmpty());
                CHECK(eval.ToLocalChecked()->IsFunction());
                v8::Local<v8::Function> func = eval.ToLocalChecked().As<v8::Function>();
                v8::MaybeLocal<v8::Value> rval = func->Call(context, v8::Undefined(isolate), 0, nullptr);
                CHECK(!rval.IsEmpty());
                CHECK(rval.ToLocalChecked()->IsNumber());
                const int32_t rval_v = rval.ToLocalChecked().As<v8::Int32>()->Value();
                CHECK(rval_v == 2);
            }
        }
        context_v.Reset();
        isolate->Dispose();
    }

    TEST_CASE("[jsb] StringNameCache")
    {
        GodotJSScriptLanguageIniter initer;
        std::shared_ptr<Environment> env = GodotJSScriptLanguage::get_singleton()->get_environment();
        {
            JSB_TESTS_EXECUTION_SCOPE(env.get());

            StringNameCache& cache = env->get_string_name_cache();
            cache.get_string_value(env->get_isolate(), "blablabla...");
        }
        env.reset();
    }

    TEST_CASE("[jsb] Godot Object Class prototype checks")
    {
        GodotJSScriptLanguageIniter initer;

        {
            JSB_TESTS_EXECUTION_SCOPE(GodotJSScriptLanguage::get_singleton()->get_environment().get());

            const NativeClassInfoPtr node_class = GodotJSScriptLanguage::get_singleton()->get_environment()->expose_godot_object_class(ClassDB::classes.getptr("Node"));
            const NativeClassInfoPtr object_class = GodotJSScriptLanguage::get_singleton()->get_environment()->expose_godot_object_class(ClassDB::classes.getptr("Object"));
            v8::Isolate* isolate = GodotJSScriptLanguage::get_singleton()->get_environment()->get_isolate();
            const v8::Local<v8::Context> context = GodotJSScriptLanguage::get_singleton()->get_environment()->get_context();
            const v8::Local<v8::Object> global_obj = context->Global();
            global_obj->Set(context, impl::Helper::new_string(isolate, "GDNode"), node_class->clazz.Get(isolate));
            global_obj->Set(context, impl::Helper::new_string(isolate, "GDObject"), object_class->clazz.Get(isolate));
        }
        static constexpr char source[] = R"--(
(function () {
console.assert(GDObject.prototype.constructor === GDObject, "self check");
console.assert(GDNode.prototype instanceof GDObject, "base check by instanceof");
console.assert(GDNode.prototype.__proto__ === GDObject.prototype, "base check");
})
)--";
        {
            v8::Isolate* isolate = GodotJSScriptLanguage::get_singleton()->get_environment()->get_isolate();

            v8::Global<v8::Function> eval;
            {
                JSB_TESTS_EXECUTION_SCOPE(GodotJSScriptLanguage::get_singleton()->get_environment().get());
                const v8::Local<v8::Context> context = GodotJSScriptLanguage::get_singleton()->get_environment()->get_context();

                impl::TryCatch try_catch(isolate);
                v8::MaybeLocal<v8::Value> rval = impl::Helper::compile_run(context, source, ::std::size(source) - 1, "testcase.js");
                Utils::print_exception(try_catch);
                CHECK(!rval.IsEmpty());
                CHECK(rval.ToLocalChecked()->IsFunction());
                eval.Reset(isolate, rval.ToLocalChecked().As<v8::Function>());
            }
            {
                JSB_TESTS_EXECUTION_SCOPE(GodotJSScriptLanguage::get_singleton()->get_environment().get());
                const v8::Local<v8::Context> context = GodotJSScriptLanguage::get_singleton()->get_environment()->get_context();

                impl::TryCatch try_catch(isolate);
                v8::MaybeLocal<v8::Value> rval = eval.Get(isolate)->Call(context, v8::Undefined(isolate), 0, nullptr);
                Utils::print_exception(try_catch);
                CHECK(!eval.IsEmpty());
                CHECK(!rval.IsEmpty());
                CHECK(rval.ToLocalChecked()->IsUndefined());
            }
        }
        // {
        //     Error err;
        //     GodotJSScriptLanguage::get_singleton()->eval_source(source, err);
        //     CHECK(err == OK);
        // }
    }

    TEST_CASE("[jsb] Node new/free/instanceof")
    {
        GodotJSScriptLanguageIniter initer;

        Error err;
        GodotJSScriptLanguage::get_singleton()->eval_source(R"--(
let gd = require("godot");
let node = new gd.Node();
console.assert(gd.is_instance_valid(node));
console.assert(node instanceof gd.Node);
console.assert(node instanceof gd.Object);
node.free();
console.assert(!gd.is_instance_valid(node));
)--", err);
        CHECK(err == OK);
    }

    TEST_CASE("[jsb] Scripts: test_01")
    {
        GodotJSScriptLanguageIniter initer;

        Error err;
        GodotJSScriptLanguage::get_singleton()->eval_source(R"--(
let gd = require("godot");
let mod = require("test_01");
console.assert(typeof mod === "object");
console.assert(mod.call_me() == 123);
console.assert(typeof mod.default === "function");
let inst = new mod.default();
console.assert(gd.is_instance_valid(inst));
console.assert(inst instanceof gd.Node);
inst.free();
console.assert(!gd.is_instance_valid(inst));
)--", err);
        CHECK(err == OK);
    }
}

#endif

