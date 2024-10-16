#ifndef GODOTJS_TESTS_JSB_H
#define GODOTJS_TESTS_JSB_H

#include "jsb_test_helpers.h"
#include "../bridge/jsb_builtins.h"

namespace jsb::tests
{
#if JSB_WITH_QUICKJS
    struct Bindings
    {
        static void constructor(const v8::FunctionCallbackInfo<v8::Value>& info)
        {

        }

        static JSValue magic_call(JSContext* ctx, JSValueConst this_val, int argc, JSValueConst* argv, int magic)
        {
            CHECK(magic == 1);
            return JS_UNDEFINED;
        }

        static void print_exception(const impl::TryCatch& try_catch)
        {
            if (try_catch.has_caught())
            {
                String message;
                try_catch.get_message(&message);
                MESSAGE("JS Exception: ", message);
            }
        }

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

    TEST_CASE("[jsb] quickjs.minimal")
    {
        JSRuntime* rt = JS_NewRuntime();
        JSContext* ctx = JS_NewContext(rt);
        {
            const JSValue this_obj = JS_NewObject(ctx);
            const JSValue func = JS_NewCFunctionMagic(ctx, Bindings::magic_call, "magic_call", 0, JS_CFUNC_generic_magic, 1);
            const JSAtom prop = JS_NewAtom(ctx, "prop");

            CHECK(JS_IsFunction(ctx, func));
            CHECK(prop != JS_ATOM_NULL);
            CHECK(impl::QuickJS::_RefCount(func) == 1);
            constexpr int flags = JS_PROP_HAS_ENUMERABLE | JS_PROP_HAS_CONFIGURABLE | JS_PROP_HAS_GET;
            CHECK(JS_DefineProperty(ctx, this_obj, prop, JS_UNDEFINED, func, JS_UNDEFINED, flags) == 1);
            CHECK(impl::QuickJS::_RefCount(func) == 2);

            JS_FreeValue(ctx, func);
            JS_FreeAtom(ctx, prop);
            JS_FreeValue(ctx, this_obj);
        }
        JS_FreeContext(ctx);
        JS_FreeRuntime(rt);
    }

    TEST_CASE("[jsb] quickjs.isolate")
    {
        v8::Isolate::CreateParams params;
        v8::Isolate* isolate = v8::Isolate::New(params);
        {
            v8::HandleScope scope_0(isolate);
            v8::Local<v8::Context> context = v8::Context::New(isolate);

            // test Map::New()
            {
                v8::HandleScope scope_1(isolate);
                v8::Local<v8::Map> map = v8::Map::New(isolate);
                CHECK(map->IsMap());
            }

            // test Symbol::New()
            {
                v8::HandleScope scope_1(isolate);
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
                impl::ClassBuilder builder1 = impl::ClassBuilder::New<IF_ObjectFieldCount>(isolate, "B1", Bindings::constructor, 0);
                class1 = builder1.Build(context);
                context->Global()->Set(context, impl::Helper::new_string(isolate, "B1"), class1.Get(isolate)).Check();
                Builtins::register_(context, context->Global());
            }
            {
                v8::HandleScope scope_1(isolate);
                impl::ClassBuilder builder2 = impl::ClassBuilder::New<IF_ObjectFieldCount>(isolate, "B2", Bindings::constructor, 0);
                builder2.Inherit(class1);
                class2 = builder2.Build(context);
                context->Global()->Set(context, impl::Helper::new_string(isolate, "B2"), class2.Get(isolate)).Check();
                context->Global()->Set(context, impl::Helper::new_string(isolate, "check_class"), v8::Function::New(context, Bindings::check_class).ToLocalChecked()).Check();
            }

            // test script class inheriting
            {
                v8::HandleScope scope_1(isolate);
                static constexpr char source[] = R"--((function() {
class S1 extends B1 {}
class S2 extends B2 {}
class S3 extends S2 {}
let s2 = new S2();
console.assert(s2 instanceof B1);
check_class(S2, S3);
return 1+1;
}))--";
                impl::TryCatch try_catch(isolate);
                v8::MaybeLocal<v8::Value> eval = impl::Helper::compile_run(context, source, ::std::size(source) - 1, "testcase.js");
                Bindings::print_exception(try_catch);
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
        isolate->Dispose();
    }
#endif

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

    TEST_CASE("[jsb] Node new/free")
    {
        GodotJSScriptLanguageIniter initer;

        Error err;
        GodotJSScriptLanguage::get_singleton()->eval_source(R"--(
let gd = require("godot");
let node = new gd.Node();
console.assert(gd.is_instance_valid(node));
node.free();
console.assert(!gd.is_instance_valid(node));
)--", err);
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
console.log(mod.default);
let inst = new mod.default();
console.assert(gd.is_instance_valid(inst));
console.assert(inst instanceof gd.Node);
inst.free();
console.assert(!gd.is_instance_valid(inst));
)--", err);
    }
}

#endif

