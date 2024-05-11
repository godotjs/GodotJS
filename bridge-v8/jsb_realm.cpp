#include "jsb_realm.h"

#include "jsb_editor_utility.h"
#include "jsb_exception_info.h"
#include "jsb_module_loader.h"
#include "jsb_transpiler.h"
#include "jsb_ref.h"
#include "jsb_v8_helper.h"
#include "../internal/jsb_path_util.h"
#include "../internal/jsb_console_output.h"

//TODO
#include "../weaver/jsb_callable_custom.h"

namespace jsb
{
    namespace InternalTimerType { enum Type : uint8_t { Interval, Timeout, Immediate, }; }

    static const MethodInfo& get_method_info_recursively(const ClassDB::ClassInfo& p_class_info, const StringName& method_name)
    {
        const HashMap<StringName, MethodInfo>::ConstIterator method_it = p_class_info.virtual_methods_map.find(method_name);
        if (method_it != p_class_info.virtual_methods_map.end()) return method_it->value;
        jsb_check(p_class_info.inherits_ptr);
        return get_method_info_recursively(*p_class_info.inherits_ptr, method_name);
    }

    static void _generate_stacktrace(v8::Isolate* isolate, StringBuilder& sb)
    {
        v8::TryCatch try_catch(isolate);
        isolate->ThrowError("");
        if (JavaScriptExceptionInfo exception_info = JavaScriptExceptionInfo(isolate, try_catch, false))
        {
            sb.append("\n");
            sb.append(exception_info);
        }
    }

    internal::SArray<Realm*, RealmID> Realm::realms_;

    // construct a callable object
    // [js] function callable(fn: Function): godot.Callable;
    // [js] function callable(thiz: godot.Object, fn: Function): godot.Callable;
    void Realm::_new_callable(const v8::FunctionCallbackInfo<v8::Value>& info)
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
                if (!js_to_gd_var(isolate, context, info[0], Variant::OBJECT, obj_var) || obj_var.is_null())
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
        if (!gd_var_to_js(isolate, context, callable, rval))
        {
            isolate->ThrowError("bad callable");
            return;
        }
        info.GetReturnValue().Set(rval);
    }

    ObjectCacheID Realm::get_cached_function(const v8::Local<v8::Function>& p_func)
    {
        v8::Isolate* isolate = get_isolate();
        const auto& it = function_refs_.find(TWeakRef(isolate, p_func));
        if (it != function_refs_.end())
        {
            const ObjectCacheID callback_id = it->second;
            TStrongRef<v8::Function>& strong_ref = function_bank_.get_value(callback_id);
            strong_ref.ref();
            return callback_id;
        }
        const ObjectCacheID new_id = function_bank_.add(TStrongRef(isolate, p_func));
        function_refs_.insert(std::pair(TWeakRef(isolate, p_func), new_id));
        return new_id;
    }

    void Realm::_print(const v8::FunctionCallbackInfo<v8::Value>& info)
    {
        v8::Isolate* isolate = info.GetIsolate();
        v8::HandleScope handle_scope(isolate);
        v8::Local<v8::Context> context = isolate->GetCurrentContext();

        v8::Local<v8::Int32> magic;
        if (!info.Data()->ToInt32(context).ToLocal(&magic))
        {
            isolate->ThrowError("bad call");
            return;
        }

        StringBuilder sb;
        sb.append("[JS]");
        const internal::ELogSeverity::Type severity = (internal::ELogSeverity::Type) magic->Value();
        int index = severity != internal::ELogSeverity::Assert ? 0 : 1;
        if (index == 1)
        {
            // check assertion
            if (info[0]->BooleanValue(isolate))
            {
                return;
            }
        }

        // join all data
        for (int n = info.Length(); index < n; index++)
        {
            v8::String::Utf8Value str(isolate, info[index]);

            if (str.length() > 0)
            {
                sb.append(" ");
                sb.append(String::utf8(*str, str.length()));
            }
        }

#if JSB_WITH_STACKTRACE_ALWAYS
        _generate_stacktrace(isolate, sb);
#else
        if (severity == internal::ELogSeverity::Trace) _generate_stacktrace(isolate, sb);
#endif

        const String& text = sb.as_string();
        internal::IConsoleOutput::_write(severity, text);
        switch (severity)
        {
        case internal::ELogSeverity::Assert: CRASH_NOW_MSG(text); return;
        case internal::ELogSeverity::Error: ERR_FAIL_MSG(text); return;
        case internal::ELogSeverity::Warning: WARN_PRINT(text); return;
        case internal::ELogSeverity::Trace:
        default: print_line(text); return;
        }
    }

    void Realm::_define(const v8::FunctionCallbackInfo<v8::Value>& info)
    {
        v8::Isolate* isolate = info.GetIsolate();
        v8::HandleScope handle_scope(isolate);
        v8::Local<v8::Context> context = isolate->GetCurrentContext();
        Realm* realm = wrap(context);

        if (info.Length() != 3 || !info[0]->IsString() || !info[1]->IsArray() || !info[2]->IsFunction())
        {
            isolate->ThrowError("bad param");
            return;
        }
        Environment* environment = Environment::wrap(isolate);
        const StringName module_id_str = environment->string_name_cache_.get_string_name(isolate, info[0].As<v8::String>());
        // const StringName module_id_str = V8Helper::to_string(v8::String::Value(isolate, info[0]));
        if ((const void*) module_id_str == nullptr)
        {
            isolate->ThrowError("bad module_id");
            return;
        }
        if (realm->module_cache_.find(module_id_str))
        {
            isolate->ThrowError("conflicted module_id");
            return;
        }
        v8::Local<v8::Array> deps_val = info[1].As<v8::Array>();
        Vector<String> deps;
        for (uint32_t index = 0, len = deps_val->Length(); index < len; ++index)
        {
            v8::Local<v8::Value> item;
            if (!deps_val->Get(context, index).ToLocal(&item) || !item->IsString())
            {
                isolate->ThrowError("bad param");
                return;
            }
            const String item_str = V8Helper::to_string(v8::String::Value(isolate, item));
            if (item_str.is_empty())
            {
                isolate->ThrowError("bad param");
                return;
            }
            deps.push_back(item_str);
        }
        JSB_LOG(Verbose, "new AMD module loader %s deps: %s", module_id_str, String(", ").join(deps));
        realm->environment_->add_module_loader<AMDModuleLoader>(module_id_str,
            deps, v8::Global<v8::Function>(isolate, info[2].As<v8::Function>()));
    }

    void Realm::_require(const v8::FunctionCallbackInfo<v8::Value>& info)
    {
        v8::Isolate* isolate = info.GetIsolate();
        v8::HandleScope handle_scope(isolate);
        v8::Local<v8::Context> context = isolate->GetCurrentContext();

        if (info.Length() != 1)
        {
            isolate->ThrowError("bad argument");
            return;
        }

        v8::Local<v8::Value> arg0 = info[0];
        if (!arg0->IsString())
        {
            isolate->ThrowError("bad argument");
            return;
        }

        // read parent module id from magic data
        const String parent_id = V8Helper::to_string(isolate, info.Data());
        const String module_id = V8Helper::to_string(isolate, arg0);
        Realm* realm = Realm::wrap(context);
        if (const JavaScriptModule* module = realm->_load_module(parent_id, module_id))
        {
            info.GetReturnValue().Set(module->exports);
        }
    }

    void Realm::reload_module(const StringName& p_module_id)
    {
        if (JavaScriptModule* existed_module = module_cache_.find(p_module_id))
        {
            if (!existed_module->path.is_empty())
            {
                v8::Isolate* isolate = get_isolate();
                v8::HandleScope handle_scope(isolate);
                v8::Context::Scope context_scope(unwrap());

                //TODO reload all related modules (search the module graph)
                existed_module->reload_requested = true;
                _load_module("", existed_module->id);
            }
        }
    }

    JavaScriptModule* Realm::_load_module(const String& p_parent_id, const String& p_module_id)
    {
        JavaScriptModule* existed_module = module_cache_.find(p_module_id);
        if (existed_module && !existed_module->reload_requested)
        {
            return existed_module;
        }

        v8::Isolate* isolate = environment_->isolate_;
        v8::Local<v8::Context> context = context_.Get(isolate);

        jsb_check(isolate->GetCurrentContext().IsEmpty() || context == context_.Get(isolate));
        // find loader with the module id
        if (IModuleLoader* loader = environment_->find_module_loader(p_module_id))
        {
            jsb_checkf(!existed_module, "module loader does not support reloading");
            const StringName module_id_sn = p_module_id;
            JavaScriptModule& module = module_cache_.insert(module_id_sn, false);
            v8::Local<v8::Object> module_obj = v8::Object::New(isolate);
            v8::Local<v8::String> propkey_loaded = v8::String::NewFromUtf8Literal(isolate, "loaded");

            // register the new module obj into module_cache obj
            v8::Local<v8::Object> jmodule_cache = jmodule_cache_.Get(isolate);
            const CharString cmodule_id = p_module_id.utf8();
            v8::Local<v8::String> jmodule_id = v8::String::NewFromUtf8(isolate, cmodule_id.ptr(), v8::NewStringType::kNormal, cmodule_id.length()).ToLocalChecked();
            jmodule_cache->Set(context, jmodule_id, module_obj).Check();

            // init the new module obj
            module_obj->Set(context, propkey_loaded, v8::Boolean::New(isolate, false)).Check();
            module.id = module_id_sn;
            module.module.Reset(isolate, module_obj);

            //NOTE the loader should throw error if failed
            if (!loader->load(this, module))
            {
                return nullptr;
            }

            module_obj->Set(context, propkey_loaded, v8::Boolean::New(isolate, true)).Check();
            return &module;
        }

        // try resolve the module id
        String normalized_id;
        if (p_module_id.begins_with("./") || p_module_id.begins_with("../"))
        {
            const String combined_id = internal::PathUtil::combine(internal::PathUtil::dirname(p_parent_id), p_module_id);
            if (internal::PathUtil::extract(combined_id, normalized_id) != OK || normalized_id.is_empty())
            {
                isolate->ThrowError("bad path");
                return nullptr;
            }
        }
        else
        {
            normalized_id = p_module_id;
        }

        // init source module
        String asset_path;
        if (IModuleResolver* resolver = environment_->find_module_resolver(normalized_id, asset_path))
        {
            const String& module_id = asset_path;

            // check again with the resolved module_id
            existed_module = module_cache_.find(module_id);
            if (existed_module && !existed_module->reload_requested)
            {
                return existed_module;
            }

            // supported module properties: id, filename, cache, loaded, exports, children
            if (existed_module)
            {
                jsb_check(existed_module->id == module_id);
                jsb_check(existed_module->path == asset_path);

                JSB_LOG(Verbose, "reload module %s", module_id);
                existed_module->reload_requested = false;
                if (!resolver->load(this, asset_path, *existed_module))
                {
                    return nullptr;
                }
                _parse_script_class(this, context, *existed_module);
                return existed_module;
            }
            else
            {
                JavaScriptModule& module = module_cache_.insert(module_id, true);
                const CharString cmodule_id = module_id.utf8();
                v8::Local<v8::Object> module_obj = v8::Object::New(isolate);
                v8::Local<v8::Object> exports_obj = v8::Object::New(isolate);
                v8::Local<v8::String> propkey_loaded = v8::String::NewFromUtf8Literal(isolate, "loaded");
                v8::Local<v8::String> propkey_children = v8::String::NewFromUtf8Literal(isolate, "children");

                // register the new module obj into module_cache obj
                v8::Local<v8::Object> jmodule_cache = jmodule_cache_.Get(isolate);
                v8::Local<v8::String> jmodule_id = v8::String::NewFromUtf8(isolate, cmodule_id.ptr(), v8::NewStringType::kNormal, cmodule_id.length()).ToLocalChecked();
                jmodule_cache->Set(context, jmodule_id, module_obj).Check();

                // init the new module obj
                module_obj->Set(context, propkey_loaded, v8::Boolean::New(isolate, false)).Check();
                module_obj->Set(context, v8::String::NewFromUtf8Literal(isolate, "id"), jmodule_id).Check();
                module_obj->Set(context, propkey_children, v8::Array::New(isolate)).Check();
                module_obj->Set(context, v8::String::NewFromUtf8Literal(isolate, "exports"), exports_obj);
                module.id = module_id;
                module.path = asset_path;
                module.module.Reset(isolate, module_obj);
                module.exports.Reset(isolate, exports_obj);

                //NOTE the resolver should throw error if failed
                //NOTE module.filename should be set in `resolve.load`
                if (!resolver->load(this, asset_path, module))
                {
                    return nullptr;
                }

                // build the module tree
                if (!p_parent_id.is_empty())
                {
                    if (const JavaScriptModule* cparent_module = module_cache_.find(p_parent_id))
                    {
                        v8::Local<v8::Object> jparent_module = cparent_module->module.Get(isolate);
                        v8::Local<v8::Value> jparent_children_v;
                        if (jparent_module->Get(context, propkey_children).ToLocal(&jparent_children_v) && jparent_children_v->IsArray())
                        {
                            v8::Local<v8::Array> jparent_children = jparent_children_v.As<v8::Array>();
                            const uint32_t children_num = jparent_children->Length();
                            jparent_children->Set(context, children_num, module_obj).Check();
                        }
                        else
                        {
                            JSB_LOG(Error, "can not access children on '%s'", p_parent_id);
                        }
                    }
                    else
                    {
                        JSB_LOG(Warning, "parent module not found with the name '%s'", p_parent_id);
                    }
                }
                module_obj->Set(context, propkey_loaded, v8::Boolean::New(isolate, true)).Check();
                _parse_script_class(this, context, module);
                return &module;
            }
        }

        const CharString cerror_message = vformat("unknown module: %s", normalized_id).utf8();
        isolate->ThrowError(v8::String::NewFromUtf8(isolate, cerror_message.ptr(), v8::NewStringType::kNormal, cerror_message.length()).ToLocalChecked());
        return nullptr;
    }

    void Realm::_parse_script_class(Realm* p_realm, const v8::Local<v8::Context>& p_context, JavaScriptModule& p_module)
    {
        // only classes in files of godot package system could be used as godot js script
        if (!p_module.path.begins_with("res://") || p_module.exports.IsEmpty())
        {
            return;
        }
        v8::Isolate* isolate = p_realm->environment_->unwrap();
        v8::Local<v8::Value> exports_val = p_module.exports.Get(isolate);
        if (!exports_val->IsObject())
        {
            return;
        }
        v8::Local<v8::Object> exports = exports_val.As<v8::Object>();
        v8::Local<v8::Value> default_val;
        if (!exports->Get(p_context, v8::String::NewFromUtf8Literal(isolate, "default")).ToLocal(&default_val)
            || !default_val->IsObject())
        {
            return;
        }

        Environment* environment = Environment::wrap(isolate);
        v8::Local<v8::Object> default_obj = default_val.As<v8::Object>();
        v8::Local<v8::String> name_str = default_obj->Get(p_context, v8::String::NewFromUtf8Literal(isolate, "name")).ToLocalChecked().As<v8::String>();
        // v8::String::Utf8Value name(p_isolate, name_str);
        v8::Local<v8::Value> class_id_val;
        if (!default_obj->Get(p_context, environment->get_symbol(Symbols::ClassId)).ToLocal(&class_id_val) || !class_id_val->IsUint32())
        {
            // ignore a javascript which does not inherit from a native class (directly and indirectly both)
            return;
        }

        // unsafe
        const NativeClassID native_class_id = (NativeClassID) class_id_val->Uint32Value(p_context).ToChecked();
        const NativeClassInfo& native_class_info = environment->get_native_class(native_class_id);
        GodotJSClassInfo* existed_class_info = environment->find_gdjs_class(p_module.default_class_id);
        if (existed_class_info)
        {
            existed_class_info->methods.clear();
            existed_class_info->signals.clear();
            existed_class_info->properties.clear();
        }
        else
        {
            GodotJSClassID gdjs_class_id;
            existed_class_info = &environment->add_gdjs_class(gdjs_class_id);
            p_module.default_class_id = gdjs_class_id;
            existed_class_info->module_id = p_module.id;
        }

        jsb_check(existed_class_info->module_id == p_module.id);
        existed_class_info->js_class_name = V8Helper::to_string(isolate, name_str); // String(*name, name.length());
        existed_class_info->native_class_id = native_class_id;
        existed_class_info->native_class_name = native_class_info.name;
        existed_class_info->js_class.Reset(isolate, default_obj);
        JSB_LOG(Verbose, "godot js class name %s (native: %s)", existed_class_info->js_class_name, existed_class_info->native_class_name);
        _parse_script_class_iterate(p_realm, p_context, *existed_class_info);
    }

    void Realm::_parse_script_class_iterate(Realm* p_realm, const v8::Local<v8::Context>& p_context, GodotJSClassInfo& p_class_info)
    {
        Environment* environment = p_realm->environment_.get();
        const auto godot_js_classes_address_scope = environment->gdjs_classes_.address_scope();
        v8::Isolate* isolate = environment->unwrap();

        //TODO collect methods/signals/properties
        v8::Local<v8::Object> default_obj = p_class_info.js_class.Get(isolate);
        v8::Local<v8::Object> prototype = default_obj->Get(p_context, V8Helper::to_string(isolate, "prototype")).ToLocalChecked().As<v8::Object>();

        // methods
        {
            v8::Local<v8::Array> property_names = prototype->GetPropertyNames(p_context, v8::KeyCollectionMode::kOwnOnly, v8::PropertyFilter::ALL_PROPERTIES, v8::IndexFilter::kSkipIndices, v8::KeyConversionMode::kNoNumbers).ToLocalChecked();
            const uint32_t len = property_names->Length();
            for (uint32_t index = 0; index < len; ++index)
            {
                const v8::Local<v8::Name> prop_name = property_names->Get(p_context, index).ToLocalChecked().As<v8::Name>();
                const String name_s = V8Helper::to_string(isolate, prop_name);
                if (name_s.is_empty() || name_s == "constructor") continue;

                // check property type with 'GetOwnPropertyDescriptor' instead of direct 'Get' to avoid triggering code execution
                v8::Local<v8::Value> prop_descriptor;
                if (prototype->GetOwnPropertyDescriptor(p_context, prop_name).ToLocal(&prop_descriptor) && prop_descriptor->IsObject())
                {
                    v8::Local<v8::Value> prop_val;
                    if (prop_descriptor.As<v8::Object>()->Get(p_context, V8Helper::to_string(isolate, "value")).ToLocal(&prop_val) && prop_val->IsFunction())
                    {
                            //TODO property categories
                            const StringName sname = name_s;
                            GodotJSMethodInfo method_info = {};
                            // method_info.name = sname;
                            // method_info.function_.Reset(payload.isolate, prop_val.As<v8::Function>());
                            // const internal::Index32 id = payload.class_info.methods.add(std::move(method_info));
                            // payload.class_info.methods_map.insert(sname, id);
                            p_class_info.methods.insert(sname, method_info);
                            JSB_LOG(Verbose, "... method %s", name_s);
                    }
                }
            }
        }

        // signals (@signal_)
        {
            v8::Local<v8::Value> val_test;
            if (prototype->Get(p_context, environment->get_symbol(Symbols::ClassSignals)).ToLocal(&val_test) && val_test->IsArray())
            {
                v8::Local<v8::Array> collection = val_test.As<v8::Array>();
                const uint32_t len = collection->Length();
                for (uint32_t index = 0; index < len; ++index)
                {
                    v8::Local<v8::Value> element = collection->Get(p_context, index).ToLocalChecked();
                    jsb_check(element->IsString());
                    const StringName signal = V8Helper::to_string(isolate, element);
                    p_class_info.signals.insert(signal, {});

                    // instantiate a fake Signal property
                    const StringNameID string_id = environment->string_name_cache_.get_string_id(signal);
                    v8::Local<v8::Function> signal_func = v8::Function::New(p_context, _godot_signal, v8::Uint32::NewFromUnsigned(isolate, (uint32_t) string_id)).ToLocalChecked();
                    prototype->SetAccessorProperty(element.As<v8::Name>(), signal_func);
                    JSB_LOG(Verbose, "... signal %s (%d)", signal, (uint32_t) string_id);
                }
            }
        }

        // properties (@export_)
        // detect all exported properties (which annotated with @export_)
        {
            v8::Local<v8::Value> val_test;
            if (prototype->Get(p_context, environment->get_symbol(Symbols::ClassProperties)).ToLocal(&val_test) && val_test->IsArray())
            {
                v8::Local<v8::Array> collection = val_test.As<v8::Array>();
                const uint32_t len = collection->Length();
                for (uint32_t index = 0; index < len; ++index)
                {
                    v8::Local<v8::Value> element = collection->Get(p_context, index).ToLocalChecked();
                    const v8::Local<v8::Context>& context = p_context;
                    jsb_check(element->IsObject());
                    v8::Local<v8::Object> obj = element.As<v8::Object>();
                    GodotJSPropertyInfo property_info;
                    property_info.name = V8Helper::to_string(isolate, obj->Get(context, environment->get_string_name_cache().get_string_value(isolate, SNAME("name"))).ToLocalChecked()); // string
                    property_info.type = (Variant::Type) obj->Get(context, environment->get_string_name_cache().get_string_value(isolate, SNAME("type"))).ToLocalChecked()->Int32Value(context).ToChecked(); // int
                    //TODO save property default value
                    // property_info.default_value = ...;
                    p_class_info.properties.insert(property_info.name, property_info);
                    JSB_LOG(Verbose, "... property %s: %s", property_info.name, Variant::get_type_name(property_info.type));
                }
            }
        }

        //TODO iterator payload.properties to determine the type (func/prop/signal)
    }

    NativeObjectID Realm::crossbind(Object* p_this, GodotJSClassID p_class_id)
    {
        v8::Isolate* isolate = get_isolate();
        v8::HandleScope handle_scope(isolate);
        v8::Local<v8::Context> context = context_.Get(isolate);

        const auto godot_js_class_info_address_scope = environment_->gdjs_classes_.address_scope();
        const GodotJSClassInfo& class_info = environment_->get_gdjs_class(p_class_id);
        v8::Local<v8::Object> constructor = class_info.js_class.Get(isolate);
        v8::Local<v8::Object> instance = constructor->CallAsConstructor(context, 0, nullptr).ToLocalChecked().As<v8::Object>();
        const NativeObjectID object_id = environment_->bind_godot_object(class_info.native_class_id, p_this, instance);
        // for (const KeyValue<StringName, GodotJSMethodInfo>& pair : class_info.signals)
        // {
        //     v8::Local<v8::String> signal_name_str = V8Helper::to_string(isolate, pair.key);
        //     v8::Local<v8::FunctionTemplate> propval_func = v8::FunctionTemplate::New(isolate, _godot_signal, v8::Uint32::NewFromUnsigned(isolate, (uint32_t) environment_->add_string_name(pair.key)));
        // }
        JSB_LOG(Verbose, "[experimental] crossbinding %s %s(%d) %s", class_info.js_class_name,  class_info.native_class_name, (uint32_t) class_info.native_class_id, uitos((uintptr_t) p_this));
        return object_id;
    }

    void Realm::_register_builtins(const v8::Local<v8::Context>& context, const v8::Local<v8::Object>& self)
    {
        v8::Isolate* isolate = environment_->isolate_;

        // internal 'jsb'
        {
            v8::Local<v8::Object> jsb_obj = v8::Object::New(isolate);

            self->Set(context, v8::String::NewFromUtf8Literal(isolate, "jsb"), jsb_obj).Check();
            jsb_obj->Set(context, v8::String::NewFromUtf8Literal(isolate, "DEV_ENABLED"), v8::Boolean::New(isolate, DEV_ENABLED)).Check();
            jsb_obj->Set(context, v8::String::NewFromUtf8Literal(isolate, "TOOLS_ENABLED"), v8::Boolean::New(isolate, TOOLS_ENABLED)).Check();
            jsb_obj->Set(context, v8::String::NewFromUtf8Literal(isolate, "callable"), v8::Function::New(context, _new_callable).ToLocalChecked()).Check();

            // jsb.internal
            {
                v8::Local<v8::Object> internal_obj = v8::Object::New(isolate);

                jsb_obj->Set(context, v8::String::NewFromUtf8Literal(isolate, "internal"), internal_obj).Check();
                internal_obj->Set(context, v8::String::NewFromUtf8Literal(isolate, "add_script_signal"), v8::Function::New(context, _add_script_signal).ToLocalChecked()).Check();
                internal_obj->Set(context, v8::String::NewFromUtf8Literal(isolate, "add_script_property"), v8::Function::New(context, _add_script_property).ToLocalChecked()).Check();
            }

            {
                v8::Local<v8::Object> ptypes = v8::Object::New(isolate);
#pragma push_macro("DEF")
#   undef DEF
#   define DEF(FieldName) ptypes->Set(context, v8::String::NewFromUtf8Literal(isolate, "TYPE_" #FieldName), v8::Int32::New(isolate, Variant::FieldName)).Check();
#   include "jsb_variant_types.h"
#pragma pop_macro("DEF")
                jsb_obj->Set(context, v8::String::NewFromUtf8Literal(isolate, "VariantType"), ptypes).Check();
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

        // minimal console functions support
        {
            v8::Local<v8::Object> console_obj = v8::Object::New(isolate);

            self->Set(context, v8::String::NewFromUtf8Literal(isolate, "console"), console_obj).Check();
            console_obj->Set(context, v8::String::NewFromUtf8Literal(isolate, "log"), v8::Function::New(context, _print, v8::Int32::New(isolate, internal::ELogSeverity::Log)).ToLocalChecked()).Check();
            console_obj->Set(context, v8::String::NewFromUtf8Literal(isolate, "info"), v8::Function::New(context, _print, v8::Int32::New(isolate, internal::ELogSeverity::Info)).ToLocalChecked()).Check();
            console_obj->Set(context, v8::String::NewFromUtf8Literal(isolate, "debug"), v8::Function::New(context, _print, v8::Int32::New(isolate, internal::ELogSeverity::Debug)).ToLocalChecked()).Check();
            console_obj->Set(context, v8::String::NewFromUtf8Literal(isolate, "warn"), v8::Function::New(context, _print, v8::Int32::New(isolate, internal::ELogSeverity::Warning)).ToLocalChecked()).Check();
            console_obj->Set(context, v8::String::NewFromUtf8Literal(isolate, "error"), v8::Function::New(context, _print, v8::Int32::New(isolate, internal::ELogSeverity::Error)).ToLocalChecked()).Check();
            console_obj->Set(context, v8::String::NewFromUtf8Literal(isolate, "assert"), v8::Function::New(context, _print, v8::Int32::New(isolate, internal::ELogSeverity::Assert)).ToLocalChecked()).Check();
            console_obj->Set(context, v8::String::NewFromUtf8Literal(isolate, "trace"), v8::Function::New(context, _print, v8::Int32::New(isolate, internal::ELogSeverity::Trace)).ToLocalChecked()).Check();
        }

        // the root 'require' function
        {
            v8::Local<v8::Object> jmodule_cache = v8::Object::New(isolate);
            v8::Local<v8::Function> require_func = v8::Function::New(context, _require).ToLocalChecked();
            self->Set(context, v8::String::NewFromUtf8Literal(isolate, "require"), require_func).Check();
            self->Set(context, v8::String::NewFromUtf8Literal(isolate, "define"), v8::Function::New(context, _define).ToLocalChecked()).Check();
            require_func->Set(context, v8::String::NewFromUtf8Literal(isolate, "cache"), jmodule_cache).Check();
            require_func->Set(context, v8::String::NewFromUtf8Literal(isolate, "moduleId"), v8::String::Empty(isolate)).Check();
            jmodule_cache_.Reset(isolate, jmodule_cache);
        }

        //TODO the root 'import' function (async module loading?)
        {
        }

        // essential timer support
        {
            self->Set(context, v8::String::NewFromUtf8Literal(isolate, "setInterval"), v8::Function::New(context, _set_timer, v8::Int32::New(isolate, InternalTimerType::Interval)).ToLocalChecked()).Check();
            self->Set(context, v8::String::NewFromUtf8Literal(isolate, "setTimeout"), v8::Function::New(context, _set_timer, v8::Int32::New(isolate, InternalTimerType::Timeout)).ToLocalChecked()).Check();
            self->Set(context, v8::String::NewFromUtf8Literal(isolate, "setImmediate"), v8::Function::New(context, _set_timer, v8::Int32::New(isolate, InternalTimerType::Immediate)).ToLocalChecked()).Check();
            self->Set(context, v8::String::NewFromUtf8Literal(isolate, "clearInterval"), v8::Function::New(context, _clear_timer).ToLocalChecked()).Check();
        }
    }

    void Realm::_set_timer(const v8::FunctionCallbackInfo<v8::Value>& info)
    {
        v8::Isolate* isolate = info.GetIsolate();
        const int argc = info.Length();
        if (argc < 1 || !info[0]->IsFunction())
        {
            isolate->ThrowError("bad argument");
            return;
        }

        v8::Local<v8::Context> context = isolate->GetCurrentContext();
        int32_t type;
        if (!info.Data()->Int32Value(context).To(&type))
        {
            isolate->ThrowError("bad call");
            return;
        }
        int32_t rate = 1;
        int extra_arg_index = 1;
        bool loop = false;
        switch ((InternalTimerType::Type) type)
        {
        // interval & timeout have 2 arguments (at least)
        case InternalTimerType::Interval: loop = true;
        case InternalTimerType::Timeout:  // NOLINT(clang-diagnostic-implicit-fallthrough)
            if (!info[1]->IsUndefined() && !info[1]->Int32Value(context).To(&rate))
            {
                isolate->ThrowError("bad time");
                return;
            }
            extra_arg_index = 2;
            break;
        // immediate has 1 argument (at least)
        default: break;
        }

        Environment* environment = Environment::wrap(isolate);
        v8::Local<v8::Function> func = info[0].As<v8::Function>();
        internal::TimerHandle handle;

        if (argc > extra_arg_index)
        {
            JavaScriptTimerAction action(v8::Global<v8::Function>(isolate, func), argc - extra_arg_index);
            for (int index = extra_arg_index; index < argc; ++index)
            {
                action.store(index - extra_arg_index, v8::Global<v8::Value>(isolate, info[index]));
            }
            environment->timer_manager_.set_timer(handle, std::move(action), rate, loop);
            info.GetReturnValue().Set((uint32_t) handle);
        }
        else
        {
            environment->timer_manager_.set_timer(handle, JavaScriptTimerAction(v8::Global<v8::Function>(isolate, func), 0), rate, loop);
            info.GetReturnValue().Set((uint32_t) handle);
        }
    }

    void Realm::_clear_timer(const v8::FunctionCallbackInfo<v8::Value>& info)
    {
        v8::Isolate* isolate = info.GetIsolate();
        if (info.Length() < 1 || !info[0]->IsUint32())
        {
            isolate->ThrowError("bad argument");
            return;
        }

        v8::Local<v8::Context> context = isolate->GetCurrentContext();
        uint32_t handle = 0;
        if (!info[0]->Uint32Value(context).To(&handle))
        {
            isolate->ThrowError("bad timer");
            return;
        }
        Environment* environment = Environment::wrap(isolate);
        environment->timer_manager_.clear_timer((internal::TimerHandle) (internal::Index32) handle);
    }

    Realm::Realm(const std::shared_ptr<Environment>& runtime)
        : environment_(runtime)
    {
        JSB_BENCHMARK_SCOPE(JSRealm, Construct);

        v8::Isolate* isolate = runtime->isolate_;
        v8::Isolate::Scope isolate_scope(isolate);
        v8::HandleScope handle_scope(isolate);

        v8::Local<v8::Context> context = v8::Context::New(isolate);
        context->SetAlignedPointerInEmbedderData(kContextEmbedderData, this);
        context_.Reset(isolate, context);
        {
            v8::Context::Scope context_scope(context);
            v8::Local<v8::Object> global = context->Global();

            _register_builtins(context, global);
            register_primitive_bindings(this);
        }
        environment_->on_context_created(context);
        id_ = realms_.add(this);
    }

    Realm::~Realm()
    {
        realms_.remove_at(id_);
        id_ = {};
        v8::Isolate* isolate = environment_->isolate_;
        v8::Isolate::Scope isolate_scope(isolate);
        v8::HandleScope handle_scope(isolate);
        v8::Local<v8::Context> context = context_.Get(get_isolate());

        function_bank_.clear();
        function_refs_.clear();

        environment_->on_context_destroyed(context);
        context->SetAlignedPointerInEmbedderData(kContextEmbedderData, nullptr);

        jmodule_cache_.Reset();
        context_.Reset();
    }

    Error Realm::load(const String& p_name)
    {
        v8::Isolate* isolate = get_isolate();
        v8::Isolate::Scope isolate_scope(isolate);
        v8::HandleScope handle_scope(isolate);
        v8::Local<v8::Context> context = context_.Get(isolate);
        v8::Context::Scope context_scope(context);

        v8::TryCatch try_catch_run(isolate);
        if (_load_module("", p_name))
        {
            // no exception should thrown if module loaded successfully
            if (JavaScriptExceptionInfo exception_info = JavaScriptExceptionInfo(isolate, try_catch_run))
            {
                JSB_LOG(Warning, "something wrong when loading '%s'\n%s", p_name, (String) exception_info);
            }
            return OK;
        }

        if (JavaScriptExceptionInfo exception_info = JavaScriptExceptionInfo(isolate, try_catch_run))
        {
            ERR_FAIL_V_MSG(ERR_COMPILATION_FAILED, vformat("failed to load '%s'\n%s", p_name, (String) exception_info));
        }
        ERR_FAIL_V_MSG(ERR_COMPILATION_FAILED, "something wrong");
    }

    const NativeClassInfo* Realm::_expose_godot_primitive_class(Variant::Type p_type, NativeClassID* r_class_id)
    {
        GodotPrimitiveImport& importer = godot_primitive_index_[p_type];
        if (!importer.id.is_valid())
        {
            importer.id = importer.register_func(FBindingEnv {
                environment_.get(),
                this,
                importer.type_name,
                environment_->isolate_,
                this->context_.Get(environment_->isolate_),
                this->function_pointers_
            });
            jsb_check(importer.id.is_valid());
        }
        if (r_class_id) *r_class_id = importer.id;
        NativeClassInfo& class_info = environment_->get_native_class(importer.id);
        jsb_check(class_info.name == importer.type_name);
        jsb_check(!class_info.function_.IsEmpty());
        return &class_info;
    }

    NativeClassID Realm::_expose_godot_class(const ClassDB::ClassInfo* p_class_info)
    {
        if (!p_class_info) return NativeClassID();

        NativeClassID class_id;
        if (const NativeClassInfo* cached_info = environment_->find_godot_class(p_class_info->name, class_id))
        {
            JSB_LOG(Verbose, "return cached native class %s (%d) (for %s)", cached_info->name, (uint32_t) class_id, p_class_info->name);
            jsb_check(cached_info->name == p_class_info->name);
            jsb_check(!cached_info->template_.IsEmpty());
            jsb_check(!cached_info->function_.IsEmpty());
            return class_id;
        }

        // const auto native_classes_address_scope = environment_->native_classes_.address_scope();
        class_id = environment_->add_class(NativeClassType::GodotObject, p_class_info->name);
        JSB_LOG(Verbose, "expose godot type %s(%d)", p_class_info->name, (uint32_t) class_id);

        // construct type template
        {
            v8::Isolate* isolate = get_isolate();
            v8::Local<v8::Context> context = isolate->GetCurrentContext();

            jsb_check(context == context_.Get(isolate));
            v8::Local<v8::FunctionTemplate> function_template = ClassTemplate<Object>::create(environment_.get(), class_id);
            v8::Local<v8::ObjectTemplate> object_template = function_template->PrototypeTemplate();

            //NOTE all singleton object will overwrite the class itself in 'godot' module, so we need make all things defined on PrototypeTemplate.
            const bool is_singleton_class = Engine::get_singleton()->has_singleton(p_class_info->name);
            v8::Local<v8::Template> template_for_static = is_singleton_class ? v8::Local<v8::Template>::Cast(object_template) : v8::Local<v8::Template>::Cast(function_template);

            // expose class methods
            for (const KeyValue<StringName, MethodBind*>& pair : p_class_info->method_map)
            {
                const StringName& method_name = pair.key;
                MethodBind* method_bind = pair.value;
                const CharString cmethod_name = ((String) method_name).ascii();
                v8::Local<v8::String> propkey_name = v8::String::NewFromUtf8(isolate, cmethod_name.ptr(), v8::NewStringType::kNormal, cmethod_name.length()).ToLocalChecked();
                v8::Local<v8::FunctionTemplate> propval_func = v8::FunctionTemplate::New(isolate, _godot_object_method, v8::External::New(isolate, method_bind));

                if (method_bind->is_static())
                {
                    template_for_static->Set(propkey_name, propval_func);
                }
                else
                {
                    object_template->Set(propkey_name, propval_func);
                }
            }

            // for (const KeyValue<StringName, MethodInfo>& pair : p_class_info->virtual_methods_map)
            // {
            //     const StringName& method_name = pair.key;
            //     const MethodInfo& method_info = pair.value;
            //     const CharString cmethod_name = ((String) method_name).ascii();
            //     v8::Local<v8::String> propkey_name = v8::String::NewFromUtf8(isolate, cmethod_name.ptr(), v8::NewStringType::kNormal, cmethod_name.length()).ToLocalChecked();
            //     const StringNameID string_name_id = environment_->add_string_name(method_name);
            //     v8::Local<v8::FunctionTemplate> propval_func = v8::FunctionTemplate::New(isolate, _godot_object_virtual_method, v8::Uint32::NewFromUnsigned(isolate, (uint32_t) string_name_id));
            //
            //     jsb_check(!(method_info.flags & METHOD_FLAG_STATIC));
            //     object_template->Set(propkey_name, propval_func);
            // }

            // expose signals
            for (const KeyValue<StringName, MethodInfo>& pair : p_class_info->signal_map)
            {
                const StringName& name_str = pair.key;
                // const MethodInfo& method_info = pair.value;
                // const CharString name = ((String) name_str).utf8();
                v8::Local<v8::String> propkey_name = V8Helper::to_string(isolate, name_str); // v8::String::NewFromUtf8(isolate, name.ptr(), v8::NewStringType::kNormal, name.length()).ToLocalChecked();
                const StringNameID string_id = environment_->string_name_cache_.get_string_id(name_str);
                v8::Local<v8::FunctionTemplate> propval_func = v8::FunctionTemplate::New(isolate, _godot_signal, v8::Uint32::NewFromUnsigned(isolate, (uint32_t) string_id));
                // object_template->Set(propkey_name, propval_func);
                object_template->SetAccessorProperty(propkey_name, propval_func);
            }

            // expose nested enum
            HashSet<StringName> enum_consts;
            for (const KeyValue<StringName, ClassDB::ClassInfo::EnumInfo>& pair : p_class_info->enum_map)
            {
                v8::Local<v8::ObjectTemplate> enum_obj = v8::ObjectTemplate::New(isolate);
                for (const StringName& enum_vname : pair.value.constants)
                {
                    const String& enum_vname_str = (String) enum_vname;
                    jsb_not_implemented(enum_vname_str.contains("."), "hierarchically nested definition is currently not supported");
                    const CharString vname_str = enum_vname_str.utf8();
                    const auto const_it = p_class_info->constant_map.find(enum_vname);
                    const int32_t enum_value = (int32_t) const_it->value;
                    enum_obj->Set(
                        v8::String::NewFromUtf8(isolate, vname_str.ptr(), v8::NewStringType::kNormal, vname_str.length()).ToLocalChecked(),
                        v8::Int32::New(isolate, enum_value)
                    );
                    enum_consts.insert(enum_vname);
                }

                template_for_static->Set(V8Helper::to_string(isolate, pair.key), enum_obj);
            }

            // expose class constants
            for (const KeyValue<StringName, int64_t>& pair : p_class_info->constant_map)
            {
                if (enum_consts.has(pair.key)) continue;
                const int64_t const_value = pair.value;
                const String& const_name_str = (String) pair.key;
                jsb_not_implemented(const_name_str.contains("."), "hierarchically nested definition is currently not supported");
                const CharString const_name = const_name_str.utf8(); // utf-8 for better compatibilities
                v8::Local<v8::String> prop_key = v8::String::NewFromUtf8(isolate, const_name.ptr(), v8::NewStringType::kNormal, const_name.length()).ToLocalChecked();

                template_for_static->Set(prop_key, v8::Int32::New(isolate, V8Helper::jsb_downscale(const_value, pair.key)));
            }

            //TODO expose all available fields/properties etc.

            // set `class_id` on the exposed godot class for the convenience when finding it from any subclasses in javascript.
            // currently used in `dump(in module_id, out class_info)`
            const v8::Local<v8::Symbol> class_id_symbol = environment_->get_symbol(Symbols::ClassId);
            function_template->Set(class_id_symbol, v8::Uint32::NewFromUnsigned(isolate, class_id));

            // setup the prototype chain (inherit)
            if (const NativeClassID super_class_id = _expose_godot_class(p_class_info->inherits_ptr))
            {
                v8::Local<v8::FunctionTemplate> base_template = environment_->get_native_class(super_class_id).template_.Get(isolate);
                jsb_check(!base_template.IsEmpty());
                function_template->Inherit(base_template);
                JSB_LOG(Verbose, "%s (%d) extends %s (%d)", p_class_info->name, (uint32_t) class_id, p_class_info->inherits_ptr->name, (uint32_t) super_class_id);
            }

            {
                NativeClassInfo& class_info = environment_->get_native_class(class_id);
                jsb_check(function_template == class_info.template_);
                v8::Local<v8::Function> function = function_template->GetFunction(context).ToLocalChecked();
                class_info.function_.Reset(isolate, function);
                jsb_check(!class_info.function_.IsEmpty());
                JSB_LOG(Verbose, "class info ready %s (%d)", p_class_info->name, (uint32_t) class_id);
            }
        } // end type template

        return class_id;
    }

    /**
     * @param p_godot_obj non-null godot object pointer
     */
    bool Realm::gd_obj_to_js(v8::Isolate* isolate, const v8::Local<v8::Context>& context, Object* p_godot_obj, v8::Local<v8::Object>& r_jval)
    {
        jsb_check(p_godot_obj);
        Environment* environment = Environment::wrap(isolate);
        if (environment->get_object(p_godot_obj, r_jval))
        {
            return true;
        }

        // freshly bind existing gd object (not constructed in javascript)
        const StringName& class_name = p_godot_obj->get_class_name();
        Realm* realm = Realm::wrap(context);
        if (const NativeClassID class_id = realm->_expose_godot_class(class_name))
        {
            v8::Local<v8::FunctionTemplate> jtemplate = realm->environment_->get_native_class(class_id).template_.Get(isolate);
            r_jval = jtemplate->InstanceTemplate()->NewInstance(context).ToLocalChecked();
            jsb_check(r_jval->InternalFieldCount() == kObjectFieldCount);

            if (p_godot_obj->is_ref_counted())
            {
                //NOTE in the case this godot object created by a godot method which returns a Ref<T>,
                //     it's `refcount_init` will be zero after the object pointer assigned to a Variant.
                //     we need to resurrect the object from this special state, or it will be a dangling pointer.
                if (((RefCounted*) p_godot_obj)->init_ref())
                {
                    // great, it's resurrected.
                }
            }

            // the lifecycle will be managed by javascript runtime, DO NOT DELETE it externally
            environment->bind_godot_object(class_id, p_godot_obj, r_jval.As<v8::Object>());
            return true;
        }
        JSB_LOG(Error, "failed to expose godot class '%s'", class_name);
        return false;
    }

    bool Realm::js_to_gd_var(v8::Isolate* isolate, const v8::Local<v8::Context>& context, const v8::Local<v8::Value>& p_jval, Variant& r_cvar)
    {
        if (p_jval.IsEmpty() || p_jval->IsNullOrUndefined())
        {
            r_cvar = {};
            return true;
        }
        if (p_jval->IsBoolean())
        {
            r_cvar = p_jval->BooleanValue(isolate);
            return true;
        }
        if (p_jval->IsInt32())
        {
            int32_t val;
            if (p_jval->Int32Value(context).To(&val))
            {
                r_cvar = (int64_t) val;
                return true;
            }
        }
        if (p_jval->IsUint32())
        {
            uint32_t val;
            if (p_jval->Uint32Value(context).To(&val))
            {
                r_cvar = (int64_t) val;
                return true;
            }
        }
        if (p_jval->IsNumber())
        {
            double val;
            if (p_jval->NumberValue(context).To(&val))
            {
                r_cvar = (double) val;
                return true;
            }
        }
        if (p_jval->IsString())
        {
            // directly return from cached StringName only if it exists
            StringName sn;
            if (Environment::wrap(isolate)->string_name_cache_.try_get_string_name(isolate, p_jval, sn))
            {
                r_cvar = sn;
                return true;
            }
            r_cvar = V8Helper::to_string(isolate, p_jval.As<v8::String>());
            return true;
        }
        //TODO
        // if (p_jval->IsFunction())
        // {
        // }
        if (p_jval->IsObject())
        {
            v8::Local<v8::Object> self = p_jval.As<v8::Object>();
            if (self->InternalFieldCount() != kObjectFieldCount)
            {
                return false;
            }

            //TODO check the class to make it safe to cast (space cheaper?)
            //TODO or, add one more InternalField to ensure it (time cheaper?)
            void* pointer = self->GetAlignedPointerFromInternalField(isolate, kObjectFieldPointer);
            const NativeClassInfo* class_info = Environment::wrap(isolate)->get_object_class(pointer);
            if (!class_info)
            {
                return false;
            }
            if (class_info->type == NativeClassType::GodotObject) r_cvar = (Object*) pointer;
            else r_cvar = *(Variant*) pointer;
            return true;
        }
        return false;
    }

    bool Realm::can_convert_strict(v8::Isolate* isolate, const v8::Local<v8::Context>& context, const v8::Local<v8::Value>& p_val, Variant::Type p_type)
    {
        switch (p_type)
        {
        case Variant::BOOL: { return p_val->IsBoolean(); }
        case Variant::FLOAT: // return p_val->IsNumber();
        case Variant::INT: { return p_val->IsNumber(); } //TODO find a better way to check integer type?
            case Variant::STRING:
            case Variant::STRING_NAME: { return p_val->IsString(); }
        case Variant::NODE_PATH:
            if (p_val->IsString())
            {
                return true;
            }
            goto FALLBACK_TO_VARIANT;
        case Variant::OBJECT:
            {
                if (!p_val->IsObject()) return false;
                v8::Local<v8::Object> self = p_val.As<v8::Object>();
                if (self->InternalFieldCount() != kObjectFieldCount) return false;
                void* pointer = self->GetAlignedPointerFromInternalField(kObjectFieldPointer);
                if (const NativeClassInfo* class_info = Environment::wrap(isolate)->get_object_class(pointer);
                    !class_info || class_info->type != NativeClassType::GodotObject)
                {
                    return false;
                }
                return true;
            }
        case Variant::VECTOR2:
        case Variant::VECTOR2I:
        case Variant::RECT2:
        case Variant::RECT2I:
        case Variant::VECTOR3:
        case Variant::VECTOR3I:
        case Variant::TRANSFORM2D:
        case Variant::VECTOR4:
        case Variant::VECTOR4I:
        case Variant::PLANE:
        case Variant::QUATERNION:
        case Variant::AABB:
        case Variant::BASIS:
        case Variant::TRANSFORM3D:
        case Variant::PROJECTION:

        // misc types
        case Variant::COLOR:
        case Variant::RID:
        case Variant::CALLABLE:
        case Variant::SIGNAL:
        case Variant::DICTIONARY:
        case Variant::ARRAY:

        // typed arrays
        case Variant::PACKED_BYTE_ARRAY:
        case Variant::PACKED_INT32_ARRAY:
        case Variant::PACKED_INT64_ARRAY:
        case Variant::PACKED_FLOAT32_ARRAY:
        case Variant::PACKED_FLOAT64_ARRAY:
        case Variant::PACKED_STRING_ARRAY:
        case Variant::PACKED_VECTOR2_ARRAY:
        case Variant::PACKED_VECTOR3_ARRAY:
        case Variant::PACKED_COLOR_ARRAY:
            {
                FALLBACK_TO_VARIANT:
                if (!p_val->IsObject())
                {
                    return false;
                }
                v8::Local<v8::Object> self = p_val.As<v8::Object>();
                if (self->InternalFieldCount() != kObjectFieldCount)
                {
                    return false;
                }
                void* pointer = self->GetAlignedPointerFromInternalField(isolate, kObjectFieldPointer);
                if (!pointer)
                {
                    return Variant::can_convert_strict(Variant::NIL, p_type);
                }
                if (const NativeClassInfo* class_info = Environment::wrap(isolate)->get_object_class(pointer);
                    !class_info || class_info->type != NativeClassType::GodotPrimitive)
                {
                    return false;
                }
                const Variant* target = (const Variant*) pointer;
                return Variant::can_convert_strict(target->get_type(), p_type);
            }
        default: return false;
        }
    }

    // translate js val into gd variant with an expected type
    bool Realm::js_to_gd_var(v8::Isolate* isolate, const v8::Local<v8::Context>& context, const v8::Local<v8::Value>& p_jval, Variant::Type p_type, Variant& r_cvar)
    {
        switch (p_type)
        {
        case Variant::NIL: return p_jval->IsNullOrUndefined();
        case Variant::BOOL:
            // strict?
            if (p_jval->IsBoolean()) { r_cvar = p_jval->BooleanValue(isolate); return true; }
            return false;
        case Variant::INT:
            // strict?
            if (p_jval->IsInt32()) { r_cvar = p_jval->Int32Value(context).ToChecked(); return true; }
            if (p_jval->IsNumber()) { r_cvar = (int64_t) p_jval->NumberValue(context).ToChecked(); return true; }
            return false;
        case Variant::FLOAT:
            if (p_jval->IsNumber())
            {
                r_cvar = p_jval->NumberValue(context).ToChecked();
                return true;
            }
            return false;
        case Variant::STRING:
            if (p_jval->IsString())
            {
                StringName sn;
                if (Environment::wrap(isolate)->string_name_cache_.try_get_string_name(isolate, p_jval, sn))
                {
                    r_cvar = (String) sn;
                    return true;
                }
                r_cvar = V8Helper::to_string(isolate, p_jval.As<v8::String>());
                return true;
            }
            return false;
        case Variant::STRING_NAME:
            // cache the JSValue and StringName pair because the expected type is StringName
            if (p_jval->IsString())
            {
                r_cvar = Environment::wrap(isolate)->string_name_cache_.get_string_name(isolate, p_jval.As<v8::String>());
                return true;
            }
            goto FALLBACK_TO_VARIANT;  // NOLINT(cppcoreguidelines-avoid-goto, hicpp-avoid-goto)
        case Variant::NODE_PATH:
            if (p_jval->IsString())
            {
                StringName sn;
                if (Environment::wrap(isolate)->string_name_cache_.try_get_string_name(isolate, p_jval, sn))
                {
                    r_cvar = NodePath((String) sn);
                    return true;
                }
                r_cvar = NodePath(V8Helper::to_string(isolate, p_jval));
                return true;
            }
            goto FALLBACK_TO_VARIANT;  // NOLINT(cppcoreguidelines-avoid-goto, hicpp-avoid-goto)
        case Variant::OBJECT:
            {
                if (!p_jval->IsObject())
                {
                    return false;
                }
                v8::Local<v8::Object> self = p_jval.As<v8::Object>();
                if (self->InternalFieldCount() != kObjectFieldCount)
                {
                    return false;
                }

                void* pointer = self->GetAlignedPointerFromInternalField(kObjectFieldPointer);
                if (const NativeClassInfo* class_info = Environment::wrap(isolate)->get_object_class(pointer);
                    !class_info || class_info->type != NativeClassType::GodotObject)
                {
                    return false;
                }
                r_cvar = (Object*) pointer;
                return true;
            }
        // math types
        case Variant::VECTOR2:
        case Variant::VECTOR2I:
        case Variant::RECT2:
        case Variant::RECT2I:
        case Variant::VECTOR3:
        case Variant::VECTOR3I:
        case Variant::TRANSFORM2D:
        case Variant::VECTOR4:
        case Variant::VECTOR4I:
        case Variant::PLANE:
        case Variant::QUATERNION:
        case Variant::AABB:
        case Variant::BASIS:
        case Variant::TRANSFORM3D:
        case Variant::PROJECTION:

        // misc types
        case Variant::COLOR:
        case Variant::RID:
        case Variant::CALLABLE:
        case Variant::SIGNAL:
        case Variant::DICTIONARY:
        case Variant::ARRAY:

        // typed arrays
        case Variant::PACKED_BYTE_ARRAY:
        case Variant::PACKED_INT32_ARRAY:
        case Variant::PACKED_INT64_ARRAY:
        case Variant::PACKED_FLOAT32_ARRAY:
        case Variant::PACKED_FLOAT64_ARRAY:
        case Variant::PACKED_STRING_ARRAY:
        case Variant::PACKED_VECTOR2_ARRAY:
        case Variant::PACKED_VECTOR3_ARRAY:
        case Variant::PACKED_COLOR_ARRAY:
            {
                FALLBACK_TO_VARIANT:
                //TODO TEMP SOLUTION
                if (!p_jval->IsObject())
                {
                    return false;
                }
                v8::Local<v8::Object> self = p_jval.As<v8::Object>();
                if (self->InternalFieldCount() != kObjectFieldCount)
                {
                    return false;
                }

                //TODO check the class to make it safe to cast (space cheaper?)
                //TODO or, add one more InternalField to ensure it (time cheaper?)
                void* pointer = self->GetAlignedPointerFromInternalField(isolate, kObjectFieldPointer);
                if (const NativeClassInfo* class_info = Environment::wrap(isolate)->get_object_class(pointer);
                    !class_info || class_info->type != NativeClassType::GodotPrimitive)
                {
                    return false;
                }
                r_cvar = *(Variant*) pointer;
                return true;
            }
        default: return false;
        }
    }

    bool Realm::gd_var_to_js(v8::Isolate* isolate, const v8::Local<v8::Context>& context, const Variant& p_cvar, Variant::Type p_type, v8::Local<v8::Value>& r_jval)
    {
        switch (p_type)
        {
        case Variant::NIL: r_jval = v8::Null(isolate); return true;
        case Variant::BOOL: r_jval = v8::Boolean::New(isolate, p_cvar); return true;
        case Variant::INT:
            {
                const int64_t raw_val = p_cvar;
                r_jval = v8::Int32::New(isolate, V8Helper::jsb_downscale(raw_val));
                return true;
            }
        case Variant::FLOAT:
            {
                r_jval = v8::Number::New(isolate, p_cvar);
                return true;
            }
        case Variant::STRING:
            {
                //TODO optimize with cache?
                const String raw_val = p_cvar;
                const CharString repr_val = raw_val.utf8();
                r_jval = v8::String::NewFromUtf8(isolate, repr_val.get_data(), v8::NewStringType::kNormal, repr_val.length()).ToLocalChecked();
                return true;
            }
        case Variant::STRING_NAME:
            {
                r_jval = Environment::wrap(isolate)->string_name_cache_.get_string_value(isolate, (StringName) p_cvar);
                return true;
            }
        case Variant::OBJECT:
            {
                //TODO is it OK in this way to transfer local handle to rval?
                v8::Local<v8::Object> jobj;
                Object* gd_obj = (Object*) p_cvar;
                if (unlikely(!gd_obj))
                {
                    r_jval = v8::Null(isolate);
                    return true;
                }
                if (gd_obj_to_js(isolate, context, gd_obj, jobj))
                {
                    r_jval = jobj;
                    return true;
                }
                return false;
            }
        // math types
        case Variant::VECTOR2:
        case Variant::VECTOR2I:
        case Variant::RECT2:
        case Variant::RECT2I:
        case Variant::VECTOR3:
        case Variant::VECTOR3I:
        case Variant::TRANSFORM2D:
        case Variant::VECTOR4:
        case Variant::VECTOR4I:
        case Variant::PLANE:
        case Variant::QUATERNION:
        case Variant::AABB:
        case Variant::BASIS:
        case Variant::TRANSFORM3D:
        case Variant::PROJECTION:

        // misc types
        case Variant::COLOR:
        case Variant::NODE_PATH:
        case Variant::RID:
        case Variant::CALLABLE:
        case Variant::SIGNAL:
        case Variant::DICTIONARY:
        case Variant::ARRAY:

        // typed arrays
        case Variant::PACKED_BYTE_ARRAY:
        case Variant::PACKED_INT32_ARRAY:
        case Variant::PACKED_INT64_ARRAY:
        case Variant::PACKED_FLOAT32_ARRAY:
        case Variant::PACKED_FLOAT64_ARRAY:
        case Variant::PACKED_STRING_ARRAY:
        case Variant::PACKED_VECTOR2_ARRAY:
        case Variant::PACKED_VECTOR3_ARRAY:
        case Variant::PACKED_COLOR_ARRAY:
            {
                //TODO TEMP SOLUTION
                Realm* realm = Realm::wrap(context);
                NativeClassID class_id;
                if (const NativeClassInfo* class_info = realm->_expose_godot_primitive_class(p_type, &class_id))
                {
                    jsb_check(class_info->type == NativeClassType::GodotPrimitive);
                    v8::Local<v8::FunctionTemplate> jtemplate = class_info->template_.Get(isolate);
                    r_jval = jtemplate->InstanceTemplate()->NewInstance(context).ToLocalChecked();
                    jsb_check(r_jval.As<v8::Object>()->InternalFieldCount() == kObjectFieldCount);
                    // void* pointer = r_jval.As<v8::Object>()->GetAlignedPointerFromInternalField(kObjectFieldPointer);
                    // *(Variant*)pointer = p_cvar;

                    // the lifecycle will be managed by javascript runtime, DO NOT DELETE it externally
                    Environment* environment = realm->environment_.get();
                    environment->bind_object(class_id, (void*) environment->alloc_variant(p_cvar), r_jval.As<v8::Object>());
                    return true;
                }
                return false;
            }
            //TODO unimplemented
        default: return false;
        }
    }

    void Realm::_godot_signal(const v8::FunctionCallbackInfo<v8::Value>& info)
    {
        v8::Isolate* isolate = info.GetIsolate();
        // v8::Isolate::Scope isolate_scope(isolate);
        v8::HandleScope handle_scope(isolate);
        v8::Local<v8::Context> context = isolate->GetCurrentContext();
        // v8::Context::Scope context_scope(context);

        Environment* environment = Environment::wrap(isolate);
        const StringName name = environment->string_name_cache_.get_string_name((const StringNameID) info.Data().As<v8::Uint32>()->Value());

        v8::Local<v8::Object> self = info.This();
        void* pointer = self->GetAlignedPointerFromInternalField(kObjectFieldPointer);
        jsb_check(environment->check_object(pointer));

        // signal must be instance-owned
        Object* gd_object = (Object*) pointer;
        Variant signal = Signal(gd_object, name);
        v8::Local<v8::Value> rval;
        if (!gd_var_to_js(isolate, context, signal, rval))
        {
            isolate->ThrowError("bad signal");
            return;
        }
        info.GetReturnValue().Set(rval);
    }

    void Realm::_godot_object_virtual_method(const v8::FunctionCallbackInfo<v8::Value>& info)
    {
        jsb_check(info.Data()->IsUint32());
        v8::Isolate* isolate = info.GetIsolate();
        v8::Local<v8::Context> context = isolate->GetCurrentContext();
        Realm* realm = wrap(context);
        Environment* environment = realm->environment_.get();
        StringName method_name = environment->string_name_cache_.get_string_name((StringNameID) info.Data().As<v8::Uint32>()->Value());
        const int argc = info.Length();

        v8::Local<v8::Object> self = info.This();

        // avoid unexpected `this` in a relatively cheap way
        if (!self->IsObject() || self->InternalFieldCount() != kObjectFieldCount)
        {
            isolate->ThrowError("bad this");
            return;
        }

        // `this` must be a gd object which already bound to javascript
        void* pointer = self->GetAlignedPointerFromInternalField(kObjectFieldPointer);
        jsb_check(Environment::wrap(isolate)->check_object(pointer));
        Object* gd_object = (Object*) pointer;

        // inefficient approach to get MethodInfo
        StringName class_name = gd_object->get_class_name();
        const HashMap<StringName, ClassDB::ClassInfo>::Iterator class_it = ClassDB::classes.find(class_name);
        jsb_check(class_it != ClassDB::classes.end());
        const ClassDB::ClassInfo& class_info = class_it->value;
        const MethodInfo& method_info = get_method_info_recursively(class_info, method_name);

        // prepare argv
        jsb_check(argc <= method_info.arguments.size());
        const Variant** argv = jsb_stackalloc(const Variant*, argc);
        Variant* args = jsb_stackalloc(Variant, argc);
        for (int index = 0; index < argc; ++index)
        {
            memnew_placement(&args[index], Variant);
            argv[index] = &args[index];
            Variant::Type type = method_info.arguments[index].type;
            if (!js_to_gd_var(isolate, context, info[index], type, args[index]))
            {
                // revert all constructors
                v8::Local<v8::String> error_message = V8Helper::to_string(isolate, jsb_errorf("bad argument: %d", index));
                while (index >= 0) { args[index--].~Variant(); }
                isolate->ThrowError(error_message);
                return;
            }
        }

        // call godot method
        Callable::CallError error;
        Variant crval = gd_object->callp(method_name, argv, argc, error);

        // don't forget to destruct all stack allocated variants
        for (int index = 0; index < argc; ++index)
        {
            args[index].~Variant();
        }

        if (error.error != Callable::CallError::CALL_OK)
        {
            isolate->ThrowError("failed to call");
            return;
        }
        v8::Local<v8::Value> jrval;
        if (gd_var_to_js(isolate, context, crval, jrval))
        {
            info.GetReturnValue().Set(jrval);
            return;
        }
        isolate->ThrowError("failed to translate godot variant to v8 value");
    }

    void Realm::_godot_object_method(const v8::FunctionCallbackInfo<v8::Value>& info)
    {
        jsb_check(info.Data()->IsExternal());
        v8::Isolate* isolate = info.GetIsolate();
        v8::Local<v8::Context> context = isolate->GetCurrentContext();
        const MethodBind* method_bind = (MethodBind*) info.Data().As<v8::External>()->Value();
        const int argc = info.Length();

        jsb_checkf(Thread::get_caller_id() == Environment::wrap(isolate)->thread_id_, "multi-threaded call not supported yet");
        jsb_check(method_bind);
        Object* gd_object = nullptr;
        if (!method_bind->is_static())
        {
            v8::Local<v8::Object> self = info.This();

            // avoid unexpected `this` in a relatively cheap way
            if (!self->IsObject() || self->InternalFieldCount() != kObjectFieldCount)
            {
                isolate->ThrowError("bad this");
                return;
            }

            // `this` must be a gd object which already bound to javascript
            void* pointer = self->GetAlignedPointerFromInternalField(kObjectFieldPointer);
            //NOTE check null if internal field cleared when 'unbind_object', otherwise use 'check_object'
            if (pointer == nullptr)
            // if (!Environment::wrap(isolate)->check_object(pointer))
            {
                isolate->ThrowError("bad object");
                return;
            }
            jsb_check(Environment::wrap(isolate)->check_object(pointer));
            gd_object = (Object*) pointer;
        }

        // prepare argv
        const Variant** argv = jsb_stackalloc(const Variant*, argc);
        Variant* args = jsb_stackalloc(Variant, argc);
        for (int index = 0; index < argc; ++index)
        {
            memnew_placement(&args[index], Variant);
            argv[index] = &args[index];
            Variant::Type type = method_bind->get_argument_type(index);
            if (!js_to_gd_var(isolate, context, info[index], type, args[index]))
            {
                // revert all constructors
                v8::Local<v8::String> error_message = V8Helper::to_string(isolate, jsb_errorf("bad argument: %d", index));
                while (index >= 0) { args[index--].~Variant(); }
                isolate->ThrowError(error_message);
                return;
            }
        }

        // call godot method
        Callable::CallError error;
        Variant crval = method_bind->call(gd_object, argv, argc, error);

        // don't forget to destruct all stack allocated variants
        for (int index = 0; index < argc; ++index)
        {
            args[index].~Variant();
        }

        if (error.error != Callable::CallError::CALL_OK)
        {
            isolate->ThrowError("failed to call");
            return;
        }
        v8::Local<v8::Value> jrval;
        const Variant::Type return_type = method_bind->get_argument_type(-1);
        jsb_check(return_type == method_bind->get_return_info().type);
        if (gd_var_to_js(isolate, context, crval, return_type, jrval))
        {
            info.GetReturnValue().Set(jrval);
            return;
        }
        isolate->ThrowError("failed to translate godot variant to v8 value");
    }

    // [JS] function load_type(type_name: string): Class;
    void Realm::_load_godot_mod(const v8::FunctionCallbackInfo<v8::Value>& info)
    {
        v8::Isolate* isolate = info.GetIsolate();
        v8::Local<v8::Value> arg0 = info[0];
        if (!arg0->IsString())
        {
            isolate->ThrowError("bad parameter");
            return;
        }

        // v8::String::Utf8Value str_utf8(isolate, arg0);
        const StringName type_name(V8Helper::to_string(v8::String::Value(isolate, arg0)));
        v8::Local<v8::Context> context = isolate->GetCurrentContext();
        Realm* realm = Realm::wrap(context);

        //NOTE keep the same order with `GDScriptLanguage::init()`
        // (1) primitive types
        if (const auto it = realm->godot_primitive_map_.find(type_name); it != realm->godot_primitive_map_.end())
        {
            JSB_LOG(Verbose, "import primitive type %s", (String) type_name);
            const NativeClassInfo* class_info = realm->_expose_godot_primitive_class(it->value);
            jsb_check(class_info);
            jsb_check(!class_info->template_.IsEmpty());
            jsb_check(!class_info->function_.IsEmpty());
            info.GetReturnValue().Set(class_info->function_.Get(isolate));
            return;
        }

        //TODO put all singletons into another module 'godot-globals' for better readability (and avoid naming conflicts, like the `class IP` and the `singleton IP`)

        // (2) singletons have the top priority (in GDScriptLanguage::init, singletons will overwrite the globals slot even if a type/const has the same name)
        //     checking before getting to avoid error prints in `get_singleton_object`
        if (Engine::get_singleton()->has_singleton(type_name))
        if (Object* gd_singleton = Engine::get_singleton()->get_singleton_object(type_name))
        {
            v8::Local<v8::Object> rval;
            JSB_LOG(Verbose, "exposing singleton object %s", (String) type_name);
            if (gd_obj_to_js(isolate, context, gd_singleton, rval))
            {
                realm->environment_->mark_as_persistent_object(gd_singleton);
                jsb_check(!rval.IsEmpty());
                info.GetReturnValue().Set(rval);
                return;
            }
            isolate->ThrowError("failed to bind a singleton object");
            return;
        }

        // (3) math_defs. but `PI`, `INF`, `NAN`, `TAU` could be easily accessed in javascript.
        //     so we just happily omit these defines here.

        // (4) global_constants
        if (CoreConstants::is_global_constant(type_name))
        {
            const int constant_index = CoreConstants::get_global_constant_index(type_name);
            const int64_t constant_value = CoreConstants::get_global_constant_value(constant_index);
            const int32_t scaled_value = (int32_t) constant_value;
            if ((int64_t) scaled_value != constant_value)
            {
                JSB_LOG(Warning, "integer overflowed %s (%s) [reversible? %d]", type_name, itos(constant_value), (int64_t)(double) constant_value == constant_value);
                info.GetReturnValue().Set(v8::Number::New(isolate, (double) constant_value));
            }
            else
            {
                info.GetReturnValue().Set(v8::Int32::New(isolate, scaled_value));
            }
            return;
        }

        // (5) classes in ClassDB
        const HashMap<StringName, ClassDB::ClassInfo>::Iterator it = ClassDB::classes.find(type_name);
        if (it != ClassDB::classes.end())
        {
            if (const NativeClassID class_id = realm->_expose_godot_class(&it->value))
            {
                NativeClassInfo& godot_class = realm->environment_->get_native_class(class_id);
                jsb_check(godot_class.name == type_name);
                jsb_check(!godot_class.template_.IsEmpty());
                jsb_checkf(!godot_class.function_.IsEmpty(), "function_ not set for native class info %s", type_name);
                info.GetReturnValue().Set(godot_class.function_.Get(isolate));
                return;
            }
        }

        const CharString message = vformat("godot class not found '%s'", type_name).utf8();
        isolate->ThrowError(v8::String::NewFromUtf8(isolate, message.ptr(), v8::NewStringType::kNormal, message.length()).ToLocalChecked());
    }

    JSValueMove Realm::eval_source(const CharString& p_source, const String& p_filename, Error& r_err)
    {
        v8::Isolate* isolate = get_isolate();
        v8::Isolate::Scope isolate_scope(isolate);
        v8::HandleScope handle_scope(isolate);
        v8::Local<v8::Context> context = context_.Get(isolate);
        v8::Context::Scope context_scope(context);

        v8::TryCatch try_catch_run(isolate);
        v8::MaybeLocal<v8::Value> maybe = _compile_run(p_source, p_source.length(), p_filename);
        if (try_catch_run.HasCaught())
        {
            v8::Local<v8::Message> message = try_catch_run.Message();
            v8::Local<v8::Value> stack_trace;
            if (try_catch_run.StackTrace(context).ToLocal(&stack_trace))
            {
                v8::String::Utf8Value stack_trace_utf8(isolate, stack_trace);
                if (stack_trace_utf8.length() != 0)
                {
                    r_err = ERR_COMPILATION_FAILED;
                    JSB_LOG(Error, "%s", String(*stack_trace_utf8, stack_trace_utf8.length()));
                    return JSValueMove();
                }
            }

            // fallback to plain message
            const v8::String::Utf8Value message_utf8(isolate, message->Get());
            r_err = ERR_COMPILATION_FAILED;
            JSB_LOG(Error, "%s", String(*message_utf8, message_utf8.length()));
            return JSValueMove();
        }

        r_err = OK;
        v8::Local<v8::Value> rval;
        if (!maybe.ToLocal(&rval))
        {
            return JSValueMove();
        }
        return JSValueMove(shared_from_this(), rval);
    }

    bool Realm::_get_main_module(v8::Local<v8::Object>* r_main_module) const
    {
        if (const JavaScriptModule* cmain_module = module_cache_.get_main())
        {
            if (r_main_module)
            {
                *r_main_module = cmain_module->module.Get(get_isolate());
            }
            return true;
        }
        return false;
    }

    bool Realm::validate_script(const String &p_path, JavaScriptExceptionInfo *r_err)
    {
        //TODO try to compile?
        return true;
    }

    v8::MaybeLocal<v8::Value> Realm::_compile_run(const char* p_source, int p_source_len, const String& p_filename)
    {
        v8::Isolate* isolate = get_isolate();
        v8::Local<v8::Context> context = context_.Get(isolate);
        v8::MaybeLocal<v8::String> source = v8::String::NewFromUtf8(isolate, p_source, v8::NewStringType::kNormal, p_source_len);
        v8::MaybeLocal<v8::Script> script = V8Helper::compile(context, source.ToLocalChecked(), p_filename);
        if (script.IsEmpty())
        {
            return {};
        }

        v8::MaybeLocal<v8::Value> maybe_value = script.ToLocalChecked()->Run(context);
        if (maybe_value.IsEmpty())
        {
            return {};
        }

        JSB_LOG(Verbose, "script compiled %s", p_filename);
        return maybe_value;
    }

    ObjectCacheID Realm::retain_function(NativeObjectID p_object_id, const StringName& p_method)
    {
        ObjectHandle* handle;
        if (environment_->objects_.try_get_value_pointer(p_object_id, handle))
        {
            v8::Isolate* isolate = environment_->isolate_;
            v8::HandleScope handle_scope(isolate);
            v8::Local<v8::Context> context = context_.Get(isolate);
            v8::Local<v8::Object> obj = handle->ref_.Get(isolate);
            const CharString name = ((String) p_method).utf8();
            v8::Local<v8::Value> find;
            if (obj->Get(context, v8::String::NewFromOneByte(isolate, (const uint8_t* ) name.ptr(), v8::NewStringType::kNormal, name.length()).ToLocalChecked()).ToLocal(&find) && find->IsFunction())
            {
                return get_cached_function(find.As<v8::Function>());
            }
        }
        return {};
    }

    bool Realm::release_function(ObjectCacheID p_func_id)
    {
        if (function_bank_.is_valid_index(p_func_id))
        {
            TStrongRef<v8::Function>& strong_ref = function_bank_.get_value(p_func_id);
            if (strong_ref.unref())
            {
                v8::Isolate* isolate = get_isolate();
                v8::HandleScope handle_scope(isolate);
                const size_t r = function_refs_.erase(TWeakRef(isolate, strong_ref.object_));
                jsb_check(r != 0);
                function_bank_.remove_at(p_func_id);
            }
            return true;
        }
        return false;
    }

    Variant Realm::_call(v8::Isolate* isolate, const v8::Local<v8::Context>& context, const v8::Local<v8::Function>& p_func, const v8::Local<v8::Value>& p_self, const Variant** p_args, int p_argcount, Callable::CallError& r_error)
    {
        using LocalValue = v8::Local<v8::Value>;
        LocalValue* argv = jsb_stackalloc(LocalValue, p_argcount);
        for (int index = 0; index < p_argcount; ++index)
        {
            memnew_placement(&argv[index], LocalValue);
            if (!Realm::gd_var_to_js(isolate, context, *p_args[index], argv[index]))
            {
                // revert constructed values if error occured
                while (index >= 0) argv[index--].~LocalValue();
                r_error.error = Callable::CallError::CALL_ERROR_INVALID_METHOD;
                return {};
            }
        }

        v8::TryCatch try_catch_run(isolate);
        v8::MaybeLocal<v8::Value> rval = p_func->Call(context, p_self, p_argcount, argv);

        for (int index = 0; index < p_argcount; ++index)
        {
            argv[index].~LocalValue();
        }
        if (JavaScriptExceptionInfo exception_info = JavaScriptExceptionInfo(isolate, try_catch_run))
        {
            r_error.error = Callable::CallError::CALL_ERROR_INVALID_METHOD;
            return {};
        }

        if (rval.IsEmpty())
        {
            return {};
        }

        Variant rvar;
        if (!Realm::js_to_gd_var(isolate, context, rval.ToLocalChecked(), rvar))
        {
            r_error.error = Callable::CallError::CALL_ERROR_INVALID_METHOD;
            return {};
        }
        return rvar;
    }

    bool Realm::get_script_property_value(NativeObjectID p_object_id, const GodotJSPropertyInfo& p_info, Variant& r_val)
    {
        v8::Isolate* isolate = get_isolate();
        v8::HandleScope handle_scope(isolate);
        if (!this->environment_->objects_.is_valid_index(p_object_id))
        {
            return false;
        }

        Environment* environment = environment_.get();
        v8::Local<v8::Context> context = this->unwrap();
        v8::Context::Scope context_scope(context);
        v8::Local<v8::Object> self = environment->objects_.get_value(p_object_id).ref_.Get(isolate);
        v8::Local<v8::String> name = environment->string_name_cache_.get_string_value(isolate, p_info.name);
        v8::Local<v8::Value> value;
        if (!self->Get(context, name).ToLocal(&value))
        {
            return false;
        }
        if (!js_to_gd_var(isolate, context, value, p_info.type, r_val))
        {
            return false;
        }
        return true;
    }


    bool Realm::set_script_property_value(NativeObjectID p_object_id, const GodotJSPropertyInfo& p_info, const Variant& p_val)
    {
        v8::Isolate* isolate = get_isolate();
        v8::HandleScope handle_scope(isolate);
        if (!this->environment_->objects_.is_valid_index(p_object_id))
        {
            return false;
        }

        Environment* environment = environment_.get();
        v8::Local<v8::Context> context = this->unwrap();
        v8::Context::Scope context_scope(context);
        v8::Local<v8::Object> self = environment->objects_.get_value(p_object_id).ref_.Get(isolate);
        v8::Local<v8::String> name = environment->string_name_cache_.get_string_value(isolate, p_info.name);
        v8::Local<v8::Value> value;
        if (!gd_var_to_js(isolate, context, p_val, p_info.type, value))
        {
            return false;
        }

        self->Set(context, name, value).Check();
        return true;
    }

    void Realm::call_prelude(GodotJSClassID p_gdjs_class_id, NativeObjectID p_object_id)
    {
        environment_->check_internal_state();
        jsb_check(p_object_id.is_valid());
        ObjectHandle& handle = environment_->objects_.get_value(p_object_id);
        GodotJSClassInfo& js_class_info = environment_->get_gdjs_class(p_gdjs_class_id);

        // handle all @onready properties
        // ...
    }

    Variant Realm::call_function(NativeObjectID p_object_id, ObjectCacheID p_func_id, const Variant** p_args, int p_argcount, Callable::CallError& r_error)
    {
        environment_->check_internal_state();
        if (!function_bank_.is_valid_index(p_func_id))
        {
            r_error.error = Callable::CallError::CALL_ERROR_INVALID_METHOD;
            return {};
        }

        v8::Isolate* isolate = get_isolate();
        v8::Isolate::Scope isolate_scope(isolate);
        v8::HandleScope handle_scope(isolate);
        v8::Local<v8::Context> context = this->unwrap();
        v8::Context::Scope context_scope(context);

        if (p_object_id.is_valid())
        {
            // if object_id is nonzero but can't be found in `objects_` registry, it usually means that this invocation originally triggered by JS GC.
            // the JS Object is disposed before the Godot Object, but Godot will post notifications (like NOTIFICATION_PREDELETE) to script instances.
            if (!this->environment_->objects_.is_valid_index(p_object_id))
            {
                JSB_LOG(Error, "invalid `this` for calling function");
                r_error.error = Callable::CallError::CALL_ERROR_INVALID_METHOD;
                return {};
            }
            const TStrongRef<v8::Function>& js_func = function_bank_.get_value(p_func_id);
            jsb_check(js_func);
            v8::Local<v8::Object> self = this->environment_->objects_.get_value(p_object_id).ref_.Get(isolate);
            return _call(isolate, context, js_func.object_.Get(isolate), self, p_args, p_argcount, r_error);
        }

        const TStrongRef<v8::Function>& js_func = function_bank_.get_value(p_func_id);
        jsb_check(js_func);
        return _call(isolate, context, js_func.object_.Get(isolate), v8::Undefined(isolate), p_args, p_argcount, r_error);
    }

    // function add_script_property(target: any, name: string, details: ScriptPropertyInfo): void;
    void Realm::_add_script_property(const v8::FunctionCallbackInfo<v8::Value> &info)
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
        v8::Local<v8::Symbol> symbol = environment->get_symbol(Symbols::ClassProperties);
        v8::Local<v8::Array> collection;
        v8::Local<v8::Value> val_test;
        uint32_t index;
        if (v8::MaybeLocal<v8::Value> maybe = target->Get(context, symbol); !maybe.ToLocal(&val_test) || val_test->IsUndefined())
        {
            index = 0;
            collection = v8::Array::New(isolate);
            target->Set(context, symbol, collection);
        }
        else
        {
            jsb_check(val_test->IsArray());
            collection = val_test.As<v8::Array>();
            index = collection->Length();
        }

        collection->Set(context, index, details);
        JSB_LOG(Verbose, "script %s define property(export) %s",
            V8Helper::to_string(isolate, target->Get(context, v8::String::NewFromUtf8Literal(isolate, "name")).ToLocalChecked().As<v8::String>()),
            V8Helper::to_string(isolate, details->Get(context, v8::String::NewFromUtf8Literal(isolate, "name")).ToLocalChecked().As<v8::String>()));
    }

    // function add_script_signal(target: any, signal_name: string): void;
    void Realm::_add_script_signal(const v8::FunctionCallbackInfo<v8::Value> &info)
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
        v8::Local<v8::Symbol> symbol = environment->get_symbol(Symbols::ClassSignals);
        v8::Local<v8::Array> collection;
        v8::Local<v8::Value> val_test;
        uint32_t index;
        if (v8::MaybeLocal<v8::Value> maybe = target->Get(context, symbol); !maybe.ToLocal(&val_test) || val_test->IsUndefined())
        {
            index = 0;
            collection = v8::Array::New(isolate);
            target->Set(context, symbol, collection);
        }
        else
        {
            jsb_check(val_test->IsArray());
            collection = val_test.As<v8::Array>();
            index = collection->Length();
        }

        collection->Set(context, index, signal);
        JSB_LOG(Verbose, "script %s define signal %s",
            V8Helper::to_string(isolate, target->Get(context, v8::String::NewFromUtf8Literal(isolate, "name")).ToLocalChecked().As<v8::String>()),
            V8Helper::to_string(isolate, signal));
    }

}
