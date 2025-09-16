#include "jsb_bridge_module_loader.h"
#include "jsb_type_convert.h"
#include "jsb_editor_utility_funcs.h"
#include "jsb_callable.h"
#include "jsb_object_bindings.h"

namespace jsb
{
    namespace
    {
        jsb_deprecated(
            "free function '_to_array_buffer' is deprecated and will be removed in a future version, "
            "use 'PackedByteArray.to_array_buffer()' instead")
        void _to_array_buffer(const v8::FunctionCallbackInfo<v8::Value>& info)
        {
            JSB_LOG(Warning,
                "free function '_to_array_buffer' is deprecated and will be removed in a future version, "
                "use 'PackedByteArray.to_array_buffer()' instead");
            v8::Isolate* isolate = info.GetIsolate();
            const v8::Local<v8::Context> context = isolate->GetCurrentContext();
            Variant var;
            if (!TypeConvert::js_to_gd_var(isolate, context, info[0], Variant::PACKED_BYTE_ARRAY, var))
            {
                jsb_throw(isolate, "bad parameter");
                return;
            }
            info.GetReturnValue().Set(impl::Helper::to_array_buffer(isolate, var));
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
                        jsb_throw(isolate, "bad object");
                        return;
                    }

                    caller_id = ((Object*) obj_var)->get_instance_id();
                    func_arg_index = 1;
                }
                break;
            default:
                jsb_throw(isolate, "bad parameter");
                return;
            }

            if (!info[func_arg_index]->IsFunction())
            {
                jsb_throw(isolate, "bad function");
                return;
            }
            const EnvironmentID env_id = env->id();
            const v8::Local<v8::Function> js_func = info[func_arg_index].As<v8::Function>();
            const ObjectCacheID callback_id = env->get_cached_function(js_func);
            const Variant callable = Callable(memnew(JSCallable(caller_id, env_id, callback_id)));
            v8::Local<v8::Value> rval;
            if (!TypeConvert::gd_var_to_js(isolate, context, callable, rval))
            {
                jsb_throw(isolate, "bad callable");
                return;
            }
            info.GetReturnValue().Set(rval);
        }

        // function add_script_tool(constructor: GObjectConstructor): void;
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

        template <typename Lambda>
        constexpr void _return_result(const v8::FunctionCallbackInfo<v8::Value>& info, Variant::Type type, Variant& identifier, Lambda get_result)
        {
            v8::Isolate* isolate = info.GetIsolate();
            v8::Local<v8::Context> context = isolate->GetCurrentContext();

            if (TypeConvert::js_to_gd_var(isolate, context, info[0], type, identifier))
            {
                v8::Local<v8::Value> rval;
                TypeConvert::gd_var_to_js(isolate, context, get_result(identifier), rval);
                info.GetReturnValue().Set(rval);
                return;
            }

            jsb_throw(isolate, "bad param");
        }

        void _get_class_name(const v8::FunctionCallbackInfo<v8::Value>& info)
        {
            Variant identifier;
            _return_result(info, Variant::STRING, identifier, [](const Variant &identifier) {
                return internal::NamingUtil::get_class_name(identifier);
            });
        }

        void _get_enum_name(const v8::FunctionCallbackInfo<v8::Value>& info)
        {
            Variant identifier;
            _return_result(info, Variant::STRING, identifier, [](const Variant &identifier) {
                return internal::NamingUtil::get_enum_name(identifier);
            });
        }

        void _get_enum_value_name(const v8::FunctionCallbackInfo<v8::Value>& info)
        {
            Variant identifier;
            _return_result(info, Variant::STRING, identifier, [](const Variant &identifier) {
                return internal::NamingUtil::get_enum_value_name(identifier);
            });
        }

        void _get_internal_name(const v8::FunctionCallbackInfo<v8::Value>& info)
        {
            Variant identifier;
            _return_result(info, Variant::STRING, identifier, [](const Variant &identifier) {
                return internal::StringNames::get_singleton().get_original_name(identifier);
            });
        }

        void _get_member_name(const v8::FunctionCallbackInfo<v8::Value>& info)
        {
            Variant identifier;
            _return_result(info, Variant::STRING, identifier, [](const Variant &identifier) {
                return internal::NamingUtil::get_member_name(identifier);
            });
        }

        void _get_parameter_name(const v8::FunctionCallbackInfo<v8::Value>& info)
        {
            Variant identifier;
            _return_result(info, Variant::STRING, identifier, [](const Variant &identifier) {
                return internal::NamingUtil::get_parameter_name(identifier);
            });
        }

        void _get_variant_type_name(const v8::FunctionCallbackInfo<v8::Value>& info)
        {
            Variant type;
            _return_result(info, Variant::INT, type, [](const Variant &type) {
                return internal::VariantUtil::get_type_name((Variant::Type)(int) type);
            });
        }

        void _notify_microtasks_run(const v8::FunctionCallbackInfo<v8::Value>& info)
        {
            Environment* environment = Environment::wrap(info.GetIsolate());
            jsb_check(environment);
            environment->notify_microtasks_run();
        }

        // function add_script_rpc(prototype: GObject, property_key: string, config: {
        //     rpc_mode?: MultiplayerAPI.RPCMode,
        //     call_local?: boolean,
        //     transfer_mode?: MultiplayerPeer.TransferMode,
        //     channel?: number,
        // }): void;
        void _add_script_rpc(const v8::FunctionCallbackInfo<v8::Value>& info)
        {
            v8::Isolate* isolate = info.GetIsolate();
            v8::HandleScope handle_scope(isolate);
            const v8::Local<v8::Context> context = isolate->GetCurrentContext();
            if (info.Length() != 3 || !info[0]->IsObject() || !info[1]->IsString() || !info[2]->IsObject())
            {
                jsb_throw(isolate, "bad param");
                return;
            }
            Environment* environment = Environment::wrap(isolate);
            const v8::Local<v8::Object> target = info[0].As<v8::Object>();
            jsb_check(info[1].As<v8::String>()->Length() != 0);
            v8::Local<v8::Map> rpc_config_map;
            if (v8::Local<v8::Value> val; !target->Get(context, jsb_symbol(environment, ClassRPCConfig)).ToLocal(&val) || !val->IsMap())
            {
                rpc_config_map = v8::Map::New(isolate);
                target->Set(context, jsb_symbol(environment, ClassRPCConfig), rpc_config_map).Check();
            }
            else
            {
                rpc_config_map = val.As<v8::Map>();
            }

            rpc_config_map->Set(context, info[1], info[2]);
            JSB_LOG(VeryVerbose, "script %s (rpc) %s",
                impl::Helper::to_string_opt(isolate, target->Get(context, jsb_name(environment, name))),
                impl::Helper::to_string(isolate, info[1]));
        }

        // function add_script_icon(constructor: GObjectConstructor, path: string): void;
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

        // function add_script_ready(prototype: GObject, details: { name: string, evaluator: string | OnReadyEvaluatorFunc }): void;
        void _add_script_ready(const v8::FunctionCallbackInfo<v8::Value>& info)
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

        // function set_script_doc(target: GObjectConstructor, property_key: undefined, field: 0 | 1 | 2, message: string): void;
        // function set_script_doc(target: GObject, property_key: string, field: 0 | 1 | 2, message: string): void;
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

        // function add_script_property(prototype: GObject, details: ScriptPropertyInfo): void
        void _add_script_property(const v8::FunctionCallbackInfo<v8::Value>& info)
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

            jsb_check(target->IsObject());
            jsb_check(details->IsObject());

            Environment* environment = Environment::wrap(isolate);
            v8::Local<v8::Symbol> symbol = jsb_symbol(environment, ClassProperties);
            v8::Local<v8::Array> collection;
            uint32_t index;
            if (target->HasOwnProperty(context, symbol).ToChecked())
            {
                v8::Local<v8::Value> collection_val = target->Get(context, symbol).ToLocalChecked();
                jsb_check(collection_val->IsArray());
                collection = collection_val.As<v8::Array>();
                index = collection->Length();
            }
            else
            {
                index = 0;
                collection = v8::Array::New(isolate);
                jsb_quickjs_check(collection->IsArray());
                target->Set(context, symbol, collection).Check();
            }

            collection->Set(context, index, details).Check();
            JSB_LOG(VeryVerbose, "script %s define property(export) %s",
                impl::Helper::to_string_opt(isolate, target->Get(context, jsb_name(environment, name))),
                impl::Helper::to_string_opt(isolate, details->Get(context, jsb_name(environment, name))));
        }

        // TODO: Cache for our cache functions?:
        //      internal::TypeGen<StringName, TWeakRef<v8::Function>>::UnorderedMap _signal_getters;
        // However, we don't really want to be hanging onto StringNames either, so we'd need to hook into GC finalizers.

        // function (name: string): (value?: unknown) => void
        void _create_script_cached_property_updater(const v8::FunctionCallbackInfo<v8::Value>& info)
        {
            v8::Isolate* isolate = info.GetIsolate();
            v8::HandleScope handle_scope(isolate);
            v8::Local<v8::Context> context = isolate->GetCurrentContext();

            if (info.Length() != 1 || !info[0]->IsString())
            {
                jsb_throw(isolate, "bad param");
                return;
            }

            v8::Local<v8::String> property_name = info[0].As<v8::String>();

            jsb_check(property_name->IsString());

            info.GetReturnValue().Set(JSB_NEW_FUNCTION(context, ObjectReflectBindingUtil::_godot_object_cached_export_update, property_name));
        }

        // TODO: Weak ref function cache
        // function (name: string): () => Signal
        void _create_script_signal_getter(const v8::FunctionCallbackInfo<v8::Value>& info)
        {
            v8::Isolate* isolate = info.GetIsolate();
            v8::HandleScope handle_scope(isolate);
            v8::Local<v8::Context> context = isolate->GetCurrentContext();

            if (info.Length() != 1 || !info[0]->IsString())
            {
                jsb_throw(isolate, "bad param");
                return;
            }

            v8::Local<v8::String> signal_name_js = info[0].As<v8::String>();
            info.GetReturnValue().Set(JSB_NEW_FUNCTION(context, ObjectReflectBindingUtil::_godot_object_signal_get, signal_name_js));
        }

        void _find_module(const v8::FunctionCallbackInfo<v8::Value>& info)
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

        void _add_module(const v8::FunctionCallbackInfo<v8::Value>& info)
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

        // function add_script_signal(prototype: GObject, name: string): void
        void _add_script_signal(const v8::FunctionCallbackInfo<v8::Value>& info)
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
            uint32_t index;
            if (target->HasOwnProperty(context, symbol).ToChecked())
            {
                v8::Local<v8::Value> collection_val = target->Get(context, symbol).ToLocalChecked();
                jsb_check(collection_val->IsArray());
                collection = collection_val.As<v8::Array>();
                index = collection->Length();
            }
            else
            {
                index = 0;
                collection = v8::Array::New(isolate);
                jsb_quickjs_check(collection->IsArray());
                target->Set(context, symbol, collection).Check();
            }

            collection->Set(context, index, signal).Check();
            JSB_LOG(VeryVerbose, "script %s define signal %s",
                impl::Helper::to_string_opt(isolate, target->Get(context, jsb_name(environment, name))),
                impl::Helper::to_string(isolate, signal));

            info.GetReturnValue().Set(JSB_NEW_FUNCTION(context, ObjectReflectBindingUtil::_godot_object_signal_get, signal));
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
            jsb_obj->Set(context, impl::Helper::new_string_ascii(isolate, "CAMEL_CASE_BINDINGS_ENABLED"), v8::Boolean::New(isolate, internal::Settings::get_camel_case_bindings_enabled())).Check();
            jsb_obj->Set(context, impl::Helper::new_string_ascii(isolate, "version"), impl::Helper::new_string(isolate, JSB_STRINGIFY(JSB_MAJOR_VERSION) "." JSB_STRINGIFY(JSB_MINOR_VERSION) "." JSB_STRINGIFY(JSB_PATCH_VERSION))).Check();
            jsb_obj->Set(context, impl::Helper::new_string_ascii(isolate, "impl"), impl::Helper::new_string(isolate, JSB_IMPL_VERSION_STRING)).Check();
            jsb_obj->Set(context, impl::Helper::new_string_ascii(isolate, "callable"), JSB_NEW_FUNCTION(context, _new_callable, {})).Check();
            jsb_obj->Set(context, impl::Helper::new_string_ascii(isolate, "to_array_buffer"), JSB_NEW_FUNCTION(context, _to_array_buffer, {})).Check();
            jsb_obj->Set(context, impl::Helper::new_string_ascii(isolate, "set_async_module_loader"), JSB_NEW_FUNCTION(context, AsyncModuleManager::_set_async_module_loader, {})).Check();
            jsb_obj->Set(context, impl::Helper::new_string_ascii(isolate, "$import"), JSB_NEW_FUNCTION(context, AsyncModuleManager::_import, {})).Check();

            // jsb.internal
            {
                v8::Local<v8::Object> internal_obj = v8::Object::New(isolate);

                jsb_obj->Set(context, impl::Helper::new_string_ascii(isolate, "internal"), internal_obj).Check();

                internal_obj->Set(context, impl::Helper::new_string_ascii(isolate, "find_module"), JSB_NEW_FUNCTION(context, _find_module, {})).Check();
                internal_obj->Set(context, impl::Helper::new_string_ascii(isolate, "add_module"), JSB_NEW_FUNCTION(context, _add_module, {})).Check();

                internal_obj->Set(context, impl::Helper::new_string_ascii(isolate, "add_script_signal"), JSB_NEW_FUNCTION(context, _add_script_signal, {})).Check();
                internal_obj->Set(context, impl::Helper::new_string_ascii(isolate, "add_script_property"), JSB_NEW_FUNCTION(context, _add_script_property, {})).Check();
                internal_obj->Set(context, impl::Helper::new_string_ascii(isolate, "add_script_ready"), JSB_NEW_FUNCTION(context, _add_script_ready, {})).Check();
                internal_obj->Set(context, impl::Helper::new_string_ascii(isolate, "add_script_tool"), JSB_NEW_FUNCTION(context, _add_script_tool, {})).Check();
                internal_obj->Set(context, impl::Helper::new_string_ascii(isolate, "add_script_icon"), JSB_NEW_FUNCTION(context, _add_script_icon, {})).Check();
                internal_obj->Set(context, impl::Helper::new_string_ascii(isolate, "add_script_rpc"), JSB_NEW_FUNCTION(context, _add_script_rpc, {})).Check();
                internal_obj->Set(context, impl::Helper::new_string_ascii(isolate, "set_script_doc"), JSB_NEW_FUNCTION(context, _set_script_doc, {})).Check();
                internal_obj->Set(context, impl::Helper::new_string_ascii(isolate, "notify_microtasks_run"), JSB_NEW_FUNCTION(context, _notify_microtasks_run, {})).Check();

                internal_obj->Set(context, impl::Helper::new_string_ascii(isolate, "create_script_cached_property_updater"), JSB_NEW_FUNCTION(context, _create_script_cached_property_updater, {})).Check();
                internal_obj->Set(context, impl::Helper::new_string_ascii(isolate, "create_script_signal_getter"), JSB_NEW_FUNCTION(context, _create_script_signal_getter, {})).Check();

                // jsb.internal.names
                {
                    v8::Local<v8::Object> names_obj = v8::Object::New(isolate);

                    internal_obj->Set(context, impl::Helper::new_string_ascii(isolate, "names"), names_obj).Check();

                    names_obj->Set(context, impl::Helper::new_string_ascii(isolate, "get_class"), JSB_NEW_FUNCTION(context, _get_class_name, {})).Check();
                    names_obj->Set(context, impl::Helper::new_string_ascii(isolate, "get_enum"), JSB_NEW_FUNCTION(context, _get_enum_name, {})).Check();
                    names_obj->Set(context, impl::Helper::new_string_ascii(isolate, "get_enum_value"), JSB_NEW_FUNCTION(context, _get_enum_value_name, {})).Check();
                    names_obj->Set(context, impl::Helper::new_string_ascii(isolate, "get_internal_mapping"), JSB_NEW_FUNCTION(context, _get_internal_name, {})).Check();
                    names_obj->Set(context, impl::Helper::new_string_ascii(isolate, "get_member"), JSB_NEW_FUNCTION(context, _get_member_name, {})).Check();
                    names_obj->Set(context, impl::Helper::new_string_ascii(isolate, "get_parameter"), JSB_NEW_FUNCTION(context, _get_parameter_name, {})).Check();
                    names_obj->Set(context, impl::Helper::new_string_ascii(isolate, "get_variant_type"), JSB_NEW_FUNCTION(context, _get_variant_type_name, {})).Check();
                }
            }

            // internal 'jsb.editor'
            EditorUtilityFuncs::expose(isolate, context, jsb_obj);
        }

        p_module.exports.Reset(isolate, jsb_obj);
        return true;
    }
}
