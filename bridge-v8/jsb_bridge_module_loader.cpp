#include "jsb_bridge_module_loader.h"

#include "jsb_editor_utility.h"
#include "jsb_realm.h"
#include "../weaver/jsb_callable_custom.h"

namespace jsb
{
    bool BridgeModuleLoader::load(class Realm* p_realm, JavaScriptModule& p_module)
    {
        v8::Isolate* isolate = p_realm->get_isolate();
        v8::Isolate::Scope isolate_scope(isolate);
        v8::HandleScope handle_scope(isolate);
        v8::Local<v8::Context> context = isolate->GetCurrentContext();
        v8::Context::Scope context_scope(context);

        v8::Local<v8::Object> jsb_obj = v8::Object::New(isolate);

        // internal bridge functions & variables
        {

            jsb_obj->Set(context, v8::String::NewFromUtf8Literal(isolate, "DEV_ENABLED"), v8::Boolean::New(isolate, DEV_ENABLED)).Check();
            jsb_obj->Set(context, v8::String::NewFromUtf8Literal(isolate, "TOOLS_ENABLED"), v8::Boolean::New(isolate, TOOLS_ENABLED)).Check();
            jsb_obj->Set(context, v8::String::NewFromUtf8Literal(isolate, "callable"), v8::Function::New(context, _new_callable).ToLocalChecked()).Check();
            jsb_obj->Set(context, v8::String::NewFromUtf8Literal(isolate, "is_instance_valid"), v8::Function::New(context, _is_instance_valid).ToLocalChecked()).Check();
            jsb_obj->Set(context, V8Helper::to_string(isolate, "to_array_buffer"), v8::Function::New(context, _to_array_buffer).ToLocalChecked()).Check();

            // jsb.internal
            {
                v8::Local<v8::Object> internal_obj = v8::Object::New(isolate);

                jsb_obj->Set(context, v8::String::NewFromUtf8Literal(isolate, "internal"), internal_obj).Check();
#pragma push_macro("DEF")
#   undef DEF
#   define DEF(FuncName) internal_obj->Set(context, v8::String::NewFromUtf8Literal(isolate, #FuncName), v8::Function::New(context, _##FuncName).ToLocalChecked()).Check()
                DEF(add_script_signal);
                DEF(add_script_property);
                DEF(add_script_ready);
                DEF(add_script_tool);
#pragma pop_macro("DEF")
            }

#if TOOLS_ENABLED
            // internal 'jsb.editor'
            {
                v8::Local<v8::Object> editor_obj = v8::Object::New(isolate);

                jsb_obj->Set(context, v8::String::NewFromUtf8Literal(isolate, "editor"), editor_obj).Check();
                editor_obj->Set(context, v8::String::NewFromUtf8Literal(isolate, "get_classes"), v8::Function::New(context, JavaScriptEditorUtility::_get_classes).ToLocalChecked()).Check();
                editor_obj->Set(context, v8::String::NewFromUtf8Literal(isolate, "get_global_constants"), v8::Function::New(context, JavaScriptEditorUtility::_get_global_constants).ToLocalChecked()).Check();
                editor_obj->Set(context, v8::String::NewFromUtf8Literal(isolate, "get_singletons"), v8::Function::New(context, JavaScriptEditorUtility::_get_singletons).ToLocalChecked()).Check();
                editor_obj->Set(context, v8::String::NewFromUtf8Literal(isolate, "get_utility_functions"), v8::Function::New(context, JavaScriptEditorUtility::_get_utility_functions).ToLocalChecked()).Check();
                editor_obj->Set(context, v8::String::NewFromUtf8Literal(isolate, "get_primitive_types"), v8::Function::New(context, JavaScriptEditorUtility::_get_primitive_types).ToLocalChecked()).Check();
                editor_obj->Set(context, v8::String::NewFromUtf8Literal(isolate, "delete_file"), v8::Function::New(context, JavaScriptEditorUtility::_delete_file).ToLocalChecked()).Check();
                editor_obj->Set(context, v8::String::NewFromUtf8Literal(isolate, "benchmark_dump"), v8::Function::New(context, JavaScriptEditorUtility::_benchmark_dump).ToLocalChecked()).Check();
            }
#endif
        }

        p_module.exports.Reset(isolate, jsb_obj);
        return true;
    }

    void BridgeModuleLoader::_to_array_buffer(const v8::FunctionCallbackInfo<v8::Value>& info)
    {
        v8::Isolate* isolate = info.GetIsolate();
        v8::Local<v8::Context> context = isolate->GetCurrentContext();
        Variant var;
        if (!Realm::js_to_gd_var(isolate, context, info[0], Variant::PACKED_BYTE_ARRAY, var))
        {
            jsb_throw(isolate, "bad parameter");
            return;
        }
        info.GetReturnValue().Set(V8Helper::to_array_buffer(isolate, var));
    }

    void BridgeModuleLoader::_is_instance_valid(const v8::FunctionCallbackInfo<v8::Value>& info)
    {
        v8::Isolate* isolate = info.GetIsolate();
        v8::Local<v8::Context> context = isolate->GetCurrentContext();
        Object* obj;
        const bool convertible = Realm::js_to_gd_obj(isolate, context, info[0], obj);
        info.GetReturnValue().Set(convertible);
    }

    // construct a callable object
    // [js] function callable(fn: Function): godot.Callable;
    // [js] function callable(thiz: godot.Object, fn: Function): godot.Callable;
    void BridgeModuleLoader::_new_callable(const v8::FunctionCallbackInfo<v8::Value>& info)
    {
        v8::Isolate* isolate = info.GetIsolate();
        v8::HandleScope handle_scope(isolate);
        v8::Local<v8::Context> context = isolate->GetCurrentContext();
        Realm* realm = Realm::wrap(context);

        const int argc = info.Length();
        int func_arg_index;
        ObjectID caller_id = {};
        switch (argc)
        {
        case 1:
            func_arg_index = 0;
            break;
        case 2:
            {
                Variant obj_var;
                if (!Realm::js_to_gd_var(isolate, context, info[0], Variant::OBJECT, obj_var) || obj_var.is_null())
                {
                    isolate->ThrowError("bad object");
                    return;
                }

                caller_id = ((Object*) obj_var)->get_instance_id();
                func_arg_index = 1;
            }
            break;
        default:
            isolate->ThrowError("bad parameter");
            return;
        }

        if (!info[func_arg_index]->IsFunction())
        {
            isolate->ThrowError("bad function");
            return;
        }
        RealmID realm_id = realm->id();
        v8::Local<v8::Function> js_func = info[func_arg_index].As<v8::Function>();
        const ObjectCacheID callback_id = realm->get_cached_function(js_func);
        Variant callable = Callable(memnew(GodotJSCallableCustom(caller_id, realm_id, callback_id)));
        v8::Local<v8::Value> rval;
        if (!Realm::gd_var_to_js(isolate, context, callable, rval))
        {
            isolate->ThrowError("bad callable");
            return;
        }
        info.GetReturnValue().Set(rval);
    }

    // function add_script_tool(target: any): void;
    void BridgeModuleLoader::_add_script_tool(const v8::FunctionCallbackInfo<v8::Value>& info)
    {
        v8::Isolate* isolate = info.GetIsolate();
        v8::HandleScope handle_scope(isolate);
        v8::Local<v8::Context> context = isolate->GetCurrentContext();
        if (info.Length() != 1 || !info[0]->IsObject())
        {
            jsb_throw(isolate, "bad param");
            return;
        }
        Environment* environment = Environment::wrap(isolate);
        v8::Local<v8::Object> target = info[0].As<v8::Object>();
        target->Set(context, environment->SymbolFor(ClassToolScript), v8::Boolean::New(isolate, true)).Check();
        JSB_LOG(VeryVerbose, "script %s (tool)",
            V8Helper::to_string(isolate, target->Get(context, v8::String::NewFromUtf8Literal(isolate, "name")).ToLocalChecked().As<v8::String>()));
    }

    // function add_script_ready(target: any, name: string,  evaluator: string | Function): void;
    void BridgeModuleLoader::_add_script_ready(const v8::FunctionCallbackInfo<v8::Value> &info)
    {
        v8::Isolate* isolate = info.GetIsolate();
        v8::HandleScope handle_scope(isolate);
        v8::Local<v8::Context> context = isolate->GetCurrentContext();
        if (info.Length() != 2 || !info[0]->IsObject() || !info[1]->IsObject())
        {
            jsb_throw(isolate, "bad param");
            return;
        }
        v8::Local<v8::Object> target = info[0].As<v8::Object>();
        v8::Local<v8::Object> evaluator = info[1].As<v8::Object>();

        Environment* environment = Environment::wrap(isolate);
        v8::Local<v8::Symbol> symbol = environment->SymbolFor(ClassImplicitReadyFuncs);
        v8::Local<v8::Array> collection;
        v8::Local<v8::Value> val_test;
        uint32_t index;
        if (v8::MaybeLocal<v8::Value> maybe = target->Get(context, symbol); !maybe.ToLocal(&val_test) || val_test->IsUndefined())
        {
            index = 0;
            collection = v8::Array::New(isolate);
            target->Set(context, symbol, collection).Check();
        }
        else
        {
            jsb_check(val_test->IsArray());
            collection = val_test.As<v8::Array>();
            index = collection->Length();
        }

        collection->Set(context, index, evaluator).Check();
        JSB_LOG(VeryVerbose, "script %s define property(onready) %s",
            V8Helper::to_string(isolate, target->Get(context, v8::String::NewFromUtf8Literal(isolate, "name")).ToLocalChecked().As<v8::String>()),
            V8Helper::to_string(isolate, evaluator->Get(context, v8::String::NewFromUtf8Literal(isolate, "name")).ToLocalChecked().As<v8::String>()));
    }

    // function add_script_property(target: any, name: string, details: ScriptPropertyInfo): void;
    void BridgeModuleLoader::_add_script_property(const v8::FunctionCallbackInfo<v8::Value> &info)
    {
        v8::Isolate* isolate = info.GetIsolate();
        v8::HandleScope handle_scope(isolate);
        v8::Local<v8::Context> context = isolate->GetCurrentContext();
        if (info.Length() != 2 || !info[0]->IsObject() || !info[1]->IsObject())
        {
            jsb_throw(isolate, "bad param");
            return;
        }
        v8::Local<v8::Object> target = info[0].As<v8::Object>();
        v8::Local<v8::Object> details = info[1].As<v8::Object>();

        Environment* environment = Environment::wrap(isolate);
        v8::Local<v8::Symbol> symbol = environment->SymbolFor(ClassProperties);
        v8::Local<v8::Array> collection;
        v8::Local<v8::Value> val_test;
        uint32_t index;
        if (v8::MaybeLocal<v8::Value> maybe = target->Get(context, symbol); !maybe.ToLocal(&val_test) || val_test->IsUndefined())
        {
            index = 0;
            collection = v8::Array::New(isolate);
            target->Set(context, symbol, collection).Check();
        }
        else
        {
            jsb_check(val_test->IsArray());
            collection = val_test.As<v8::Array>();
            index = collection->Length();
        }

        collection->Set(context, index, details).Check();
        JSB_LOG(VeryVerbose, "script %s define property(export) %s",
            V8Helper::to_string(isolate, target->Get(context, environment->GetStringValue(name)).ToLocalChecked().As<v8::String>()),
            V8Helper::to_string(isolate, details->Get(context, environment->GetStringValue(name)).ToLocalChecked().As<v8::String>()));
    }

    // function add_script_signal(target: any, signal_name: string): void;
    void BridgeModuleLoader::_add_script_signal(const v8::FunctionCallbackInfo<v8::Value> &info)
    {
        v8::Isolate* isolate = info.GetIsolate();
        v8::HandleScope handle_scope(isolate);
        v8::Local<v8::Context> context = isolate->GetCurrentContext();
        if (info.Length() != 2 || !info[0]->IsObject() || !info[1]->IsString())
        {
            jsb_throw(isolate, "bad param");
            return;
        }
        // target is Class.prototype
        // __decorate([ jsb_core_1.signal ], TestClass.prototype, "test_signal", void 0);
        v8::Local<v8::Object> target = info[0].As<v8::Object>();
        v8::Local<v8::String> signal = info[1].As<v8::String>();
        Environment* environment = Environment::wrap(isolate);
        v8::Local<v8::Symbol> symbol = environment->SymbolFor(ClassSignals);
        v8::Local<v8::Array> collection;
        v8::Local<v8::Value> val_test;
        uint32_t index;
        if (v8::MaybeLocal<v8::Value> maybe = target->Get(context, symbol); !maybe.ToLocal(&val_test) || val_test->IsUndefined())
        {
            index = 0;
            collection = v8::Array::New(isolate);
            target->Set(context, symbol, collection).Check();
        }
        else
        {
            jsb_check(val_test->IsArray());
            collection = val_test.As<v8::Array>();
            index = collection->Length();
        }

        collection->Set(context, index, signal).Check();
        JSB_LOG(VeryVerbose, "script %s define signal %s",
            V8Helper::to_string(isolate, target->Get(context, environment->GetStringValue(name)).ToLocalChecked().As<v8::String>()),
            V8Helper::to_string(isolate, signal));
    }

}
