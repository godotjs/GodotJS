#include "jsb_bridge_module_loader.h"
#include "jsb_type_convert.h"
#include "jsb_editor_utility_funcs.h"

#include "../internal/jsb_settings.h"
#include "../weaver/jsb_callable_custom.h"

namespace jsb
{
    namespace
    {
        void _to_array_buffer(const v8::FunctionCallbackInfo<v8::Value>& info)
        {
            v8::Isolate* isolate = info.GetIsolate();
            v8::Local<v8::Context> context = isolate->GetCurrentContext();
            Variant var;
            if (!TypeConvert::js_to_gd_var(isolate, context, info[0], Variant::PACKED_BYTE_ARRAY, var))
            {
                jsb_throw(isolate, "bad parameter");
                return;
            }
            info.GetReturnValue().Set(BridgeHelper::to_array_buffer(isolate, var));
        }

        // construct a callable object
        // [js] function callable(fn: Function): godot.Callable;
        // [js] function callable(thiz: godot.Object, fn: Function): godot.Callable;
        void _new_callable(const v8::FunctionCallbackInfo<v8::Value>& info)
        {
            v8::Isolate* isolate = info.GetIsolate();
            v8::HandleScope handle_scope(isolate);
            v8::Local<v8::Context> context = isolate->GetCurrentContext();
            Environment* env = Environment::wrap(isolate);

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
                    if (!TypeConvert::js_to_gd_var(isolate, context, info[0], Variant::OBJECT, obj_var) || obj_var.is_null())
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
            EnvironmentID env_id = env->id();
            v8::Local<v8::Function> js_func = info[func_arg_index].As<v8::Function>();
            const ObjectCacheID callback_id = env->get_cached_function(js_func);
            Variant callable = Callable(memnew(GodotJSCallableCustom(caller_id, env_id, callback_id)));
            v8::Local<v8::Value> rval;
            if (!TypeConvert::gd_var_to_js(isolate, context, callable, rval))
            {
                isolate->ThrowError("bad callable");
                return;
            }
            info.GetReturnValue().Set(rval);
        }

        // function (target: any): void;
        void _add_script_tool(const v8::FunctionCallbackInfo<v8::Value>& info)
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
            const v8::Local<v8::Object> target = info[0].As<v8::Object>();
            target->Set(context, jsb_symbol(environment, ClassToolScript), v8::Boolean::New(isolate, true)).Check();
            JSB_LOG(VeryVerbose, "script %s (tool)",
                impl::Helper::to_string_opt(isolate, target->Get(context, jsb_name(environment, name))));
        }

        void _get_type_name(const v8::FunctionCallbackInfo<v8::Value>& info)
        {
            v8::Isolate* isolate = info.GetIsolate();
            v8::Local<v8::Context> context = isolate->GetCurrentContext();
            Variant type;
            if (TypeConvert::js_to_gd_var(isolate, context, info[0], Variant::INT, type))
            {
                const Variant type_name = internal::VariantUtil::get_type_name((Variant::Type)(int) type);
                v8::Local<v8::Value> rval;
                TypeConvert::gd_var_to_js(isolate, context, type_name, rval);
                info.GetReturnValue().Set(rval);
                return;
            }
            jsb_throw(isolate, "bad param");
        }

        void _notify_microtasks_run(const v8::FunctionCallbackInfo<v8::Value>& info)
        {
            Environment* environment = Environment::wrap(info.GetIsolate());
            jsb_check(environment);
            environment->notify_microtasks_run();
        }

        // function (target: any): void;
        void _add_script_icon(const v8::FunctionCallbackInfo<v8::Value>& info)
        {
            v8::Isolate* isolate = info.GetIsolate();
            v8::HandleScope handle_scope(isolate);
            v8::Local<v8::Context> context = isolate->GetCurrentContext();
            if (info.Length() != 2 || !info[0]->IsObject() || !info[1]->IsString())
            {
                jsb_throw(isolate, "bad param");
                return;
            }
            Environment* environment = Environment::wrap(isolate);
            v8::Local<v8::Object> target = info[0].As<v8::Object>();
            target->Set(context, jsb_symbol(environment, ClassIcon), info[1]).Check();
            JSB_LOG(VeryVerbose, "script %s (icon) %s",
                impl::Helper::to_string_opt(isolate, target->Get(context, jsb_name(environment, name))),
                impl::Helper::to_string(isolate, info[1]));
        }

        // function add_script_ready(target: any, name: string,  evaluator: string | Function): void;
        void _add_script_ready(const v8::FunctionCallbackInfo<v8::Value> &info)
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
            v8::Local<v8::Symbol> symbol = jsb_symbol(environment, ClassImplicitReadyFuncs);
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
                impl::Helper::to_string_opt(isolate, target->Get(context, jsb_name(environment, name))),
                impl::Helper::to_string_opt(isolate, evaluator->Get(context, jsb_name(environment, name))));
        }

        // function (target: any, prop?: string, cat: [0, 1, 2], message?: string)
        void _set_script_doc(const v8::FunctionCallbackInfo<v8::Value>& info)
        {
#ifdef TOOLS_ENABLED
            constexpr int kTarget = 0; // constructor | prototype
            constexpr int kProperty = 1; // undefined | string
            constexpr int kField = 2; // int32: 0, 1, 2
            constexpr int kMessage = 3; // undefined | string

            v8::Isolate* isolate = info.GetIsolate();
            v8::HandleScope handle_scope(isolate);
            const v8::Local<v8::Context> context = isolate->GetCurrentContext();
            if (info.Length() != 4 || !info[kTarget]->IsObject() || !info[kField]->IsNumber())
            {
                jsb_throw(isolate, "bad param");
                return;
            }
            Environment* environment = Environment::wrap(isolate);
            const v8::Local<v8::Object> target = info[kTarget].As<v8::Object>();
            const v8::Local<v8::Value> property = info[kProperty].As<v8::Object>();
            const ScriptClassDocField::Type doc_item = (ScriptClassDocField::Type) info[kField].As<v8::Int32>()->Value();
            const v8::Local<v8::String> message = info[kMessage]->IsString() ? info[kMessage].As<v8::String>() : v8::String::Empty(isolate);
            v8::Local<v8::Object> doc;

            // always set doc info on `prototype`
            if (property->IsUndefined())
            {
                // doc for class
                const v8::Local<v8::Object> prototype = target->Get(context, jsb_name(environment, prototype)).ToLocalChecked().As<v8::Object>();
                jsb_check(prototype->IsObject());
                if (v8::Local<v8::Value> val; !prototype->Get(context, jsb_symbol(environment, Doc)).ToLocal(&val) || !val->IsObject())
                {
                    doc = v8::Object::New(isolate);
                    prototype->Set(context, jsb_symbol(environment, Doc), doc).Check();
                }
                else
                {
                    doc = val.As<v8::Object>();
                }
            }
            else
            {
                // doc for member
                jsb_check(property->IsString() && property.As<v8::String>()->Length() != 0);
                v8::Local<v8::Map> member_doc_map;
                if (v8::Local<v8::Value> val; !target->Get(context, jsb_symbol(environment, MemberDocMap)).ToLocal(&val) || !val->IsMap())
                {
                    member_doc_map = v8::Map::New(isolate);
                    target->Set(context, jsb_symbol(environment, MemberDocMap), member_doc_map).Check();
                }
                else
                {
                    member_doc_map = val.As<v8::Map>();
                }

                if (v8::Local<v8::Value> val; !member_doc_map->Get(context, property).ToLocal(&val) || !val->IsObject())
                {
                    doc = v8::Object::New(isolate);
                    jsb_ensure(!member_doc_map->Set(context, property, doc).IsEmpty());
                }
                else
                {
                    doc = val.As<v8::Object>();
                }
            }

            switch (doc_item)
            {
            case ScriptClassDocField::Deprecated:   doc->Set(context, jsb_name(environment, deprecated), message).Check(); return;
            case ScriptClassDocField::Experimental: doc->Set(context, jsb_name(environment, experimental), message).Check(); return;
            case ScriptClassDocField::Help:         doc->Set(context, jsb_name(environment, help), message).Check(); return;
            }
            jsb_throw(isolate, "bad param");
#endif
        }

        // function (target: any, name: string, details: ScriptPropertyInfo): void;
        void _add_script_property(const v8::FunctionCallbackInfo<v8::Value> &info)
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
            v8::Local<v8::Symbol> symbol = jsb_symbol(environment, ClassProperties);
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
                impl::Helper::to_string_opt(isolate, target->Get(context, jsb_name(environment, name))),
                impl::Helper::to_string_opt(isolate, details->Get(context, jsb_name(environment, name))));
        }

        void _find_module(const v8::FunctionCallbackInfo<v8::Value> &info)
        {
            v8::Isolate* isolate = info.GetIsolate();
            v8::HandleScope handle_scope(isolate);
            v8::Local<v8::Context> context = isolate->GetCurrentContext();
            if (info.Length() != 1 || !info[0]->IsString())
            {
                jsb_throw(isolate, "bad param");
                return;
            }

            const String module_id = impl::Helper::to_string(isolate, info[0]);
            if (module_id.is_empty())
            {
                jsb_throw(isolate, "bad module_id");
                return;
            }
            Environment* env = Environment::wrap(context);
            const StringName module_id_sn = module_id;
            if (JavaScriptModule* module = env->get_module_cache().find(module_id_sn))
            {
                info.GetReturnValue().Set(module->module);
            }
        }

        void _add_module(const v8::FunctionCallbackInfo<v8::Value> &info)
        {
            v8::Isolate* isolate = info.GetIsolate();
            v8::HandleScope handle_scope(isolate);
            v8::Local<v8::Context> context = isolate->GetCurrentContext();
            if (info.Length() != 2 || !info[0]->IsString() || !info[1]->IsObject())
            {
                jsb_throw(isolate, "bad param");
                return;
            }

            const String module_id = impl::Helper::to_string(isolate, info[0]);
            if (module_id.is_empty())
            {
                jsb_throw(isolate, "bad module_id");
                return;
            }
            v8::Local<v8::Object> target = info[1].As<v8::Object>();
            Environment* env = Environment::wrap(context);
            const StringName module_id_sn = module_id;
            if (env->get_module_cache().find(module_id_sn))
            {
                jsb_throw(isolate, "can not overwrite an existing module");
                return;
            }
            JavaScriptModule& module = env->get_module_cache().insert(isolate, context, module_id_sn, false, true);
            module.exports.Reset(isolate, target);
            info.GetReturnValue().Set(module.module);
        }

        // function add_script_signal(target: any, signal_name: string): void;
        void _add_script_signal(const v8::FunctionCallbackInfo<v8::Value> &info)
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
            v8::Local<v8::Symbol> symbol = jsb_symbol(environment, ClassSignals);
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
                impl::Helper::to_string_opt(isolate, target->Get(context, jsb_name(environment, name))),
                impl::Helper::to_string(isolate, signal));
        }
    }

    bool BridgeModuleLoader::load(Environment* p_env, JavaScriptModule& p_module)
    {
        v8::Isolate* isolate = p_env->get_isolate();
        v8::Isolate::Scope isolate_scope(isolate);
        v8::HandleScope handle_scope(isolate);
        v8::Local<v8::Context> context = isolate->GetCurrentContext();
        v8::Context::Scope context_scope(context);

        v8::Local<v8::Object> jsb_obj = v8::Object::New(isolate);

        // internal bridge functions & variables
        {
#ifdef DEV_ENABLED
            jsb_obj->Set(context, impl::Helper::new_string_ascii(isolate, "DEV_ENABLED"), v8::Boolean::New(isolate, true)).Check();
#else
            jsb_obj->Set(context, impl::Helper::new_string_ascii(isolate, "DEV_ENABLED"), v8::Boolean::New(isolate, false)).Check();
#endif
#ifdef TOOLS_ENABLED
            jsb_obj->Set(context, impl::Helper::new_string_ascii(isolate, "TOOLS_ENABLED"), v8::Boolean::New(isolate, true)).Check();
#else
            jsb_obj->Set(context, impl::Helper::new_string_ascii(isolate, "TOOLS_ENABLED"), v8::Boolean::New(isolate, false)).Check();
#endif
#ifdef DEBUG_ENABLED
            jsb_obj->Set(context, impl::Helper::new_string_ascii(isolate, "DEBUG_ENABLED"), v8::Boolean::New(isolate, true)).Check();
#else
            jsb_obj->Set(context, impl::Helper::new_string_ascii(isolate, "DEBUG_ENABLED"), v8::Boolean::New(isolate, false)).Check();
#endif
            jsb_obj->Set(context, impl::Helper::new_string_ascii(isolate, "VERSION_MAJOR"), v8::Int32::New(isolate, VERSION_MAJOR)).Check();
            jsb_obj->Set(context, impl::Helper::new_string_ascii(isolate, "VERSION_MINOR"), v8::Int32::New(isolate, VERSION_MINOR)).Check();
            jsb_obj->Set(context, impl::Helper::new_string_ascii(isolate, "VERSION_PATCH"), v8::Int32::New(isolate, VERSION_PATCH)).Check();
            jsb_obj->Set(context, impl::Helper::new_string_ascii(isolate, "callable"), v8::Function::New(context, _new_callable).ToLocalChecked()).Check();
            jsb_obj->Set(context, impl::Helper::new_string_ascii(isolate, "to_array_buffer"), v8::Function::New(context, _to_array_buffer).ToLocalChecked()).Check();

            // jsb.internal
            {
                v8::Local<v8::Object> internal_obj = v8::Object::New(isolate);

                jsb_obj->Set(context, impl::Helper::new_string_ascii(isolate, "internal"), internal_obj).Check();

                internal_obj->Set(context, impl::Helper::new_string_ascii(isolate, "find_module"), v8::Function::New(context, _find_module).ToLocalChecked()).Check();
                internal_obj->Set(context, impl::Helper::new_string_ascii(isolate, "add_module"), v8::Function::New(context, _add_module).ToLocalChecked()).Check();

                internal_obj->Set(context, impl::Helper::new_string_ascii(isolate, "add_script_signal"), v8::Function::New(context, _add_script_signal).ToLocalChecked()).Check();
                internal_obj->Set(context, impl::Helper::new_string_ascii(isolate, "add_script_property"), v8::Function::New(context, _add_script_property).ToLocalChecked()).Check();
                internal_obj->Set(context, impl::Helper::new_string_ascii(isolate, "add_script_ready"), v8::Function::New(context, _add_script_ready).ToLocalChecked()).Check();
                internal_obj->Set(context, impl::Helper::new_string_ascii(isolate, "add_script_tool"), v8::Function::New(context, _add_script_tool).ToLocalChecked()).Check();
                internal_obj->Set(context, impl::Helper::new_string_ascii(isolate, "add_script_icon"), v8::Function::New(context, _add_script_icon).ToLocalChecked()).Check();
                internal_obj->Set(context, impl::Helper::new_string_ascii(isolate, "set_script_doc"), v8::Function::New(context, _set_script_doc).ToLocalChecked()).Check();
                internal_obj->Set(context, impl::Helper::new_string_ascii(isolate, "notify_microtasks_run"), v8::Function::New(context, _notify_microtasks_run).ToLocalChecked()).Check();
                internal_obj->Set(context, impl::Helper::new_string_ascii(isolate, "get_type_name"), v8::Function::New(context, _get_type_name).ToLocalChecked()).Check();
            }

            // internal 'jsb.editor'
            EditorUtilityFuncs::expose(isolate, context, jsb_obj);
        }

        p_module.exports.Reset(isolate, jsb_obj);
        return true;
    }
}
