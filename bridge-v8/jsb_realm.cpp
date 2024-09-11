#include "jsb_realm.h"

#include "jsb_exception_info.h"
#include "jsb_amd_module_loader.h"
#include "jsb_transpiler.h"
#include "jsb_ref.h"
#include "jsb_v8_helper.h"
#include "jsb_builtins.h"
#include "jsb_object_bindings.h"

#include "../internal/jsb_path_util.h"
#include "../internal/jsb_class_util.h"
#include "../internal/jsb_variant_util.h"

#if !JSB_WITH_STATIC_BINDINGS
#include "jsb_primitive_bindings_reflect.h"
#define register_primitive_bindings(param) register_primitive_bindings_reflect(param)
#else
#include "jsb_primitive_bindings_static.h"
#define register_primitive_bindings(param) register_primitive_bindings_static(param)
#endif

namespace jsb
{
    internal::SArray<Realm*, RealmID> Realm::realms_;
    SpinLock Realm::realms_lock_;

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

    void Realm::scan_external_changes()
    {
        Vector<StringName> requested_modules;
        for (const KeyValue<StringName, JavaScriptModule*>& kv : module_cache_.modules_)
        {
            JavaScriptModule* module = kv.value;
            // skip script modules which are managed by the godot editor
            if (module->default_class_id) continue;
            if (module->mark_as_reloading())
            {
                requested_modules.append(module->id);
            }
        }

        for (const StringName& id : requested_modules)
        {
            JSB_LOG(Verbose, "changed module check: %s", id);
            load(id);
        }
    }

    EReloadResult::Type Realm::mark_as_reloading(const StringName& p_name)
    {
        if (JavaScriptModule* module = module_cache_.find(p_name))
        {
            jsb_check(!module->path.is_empty());
            if (!module->is_loaded() || module->mark_as_reloading())
            {
                return EReloadResult::Requested;
            }
            return EReloadResult::NoChanges;
        }
        return EReloadResult::NoSuchModule;
    }

    JavaScriptModule* Realm::_load_module(const String& p_parent_id, const String& p_module_id)
    {
        JSB_BENCHMARK_SCOPE(JSRealm, _load_module);
        JavaScriptModule* existing_module = module_cache_.find(p_module_id);
        if (existing_module && existing_module->is_loaded())
        {
            return existing_module;
        }

        v8::Isolate* isolate = environment_->isolate_;
        v8::Local<v8::Context> context = context_.Get(isolate);

        jsb_check(isolate->GetCurrentContext().IsEmpty() || context == context_.Get(isolate));
        // find loader with the module id
        if (IModuleLoader* loader = environment_->find_module_loader(p_module_id))
        {
            jsb_checkf(!existing_module, "module loader does not support reloading");
            JavaScriptModule& module = module_cache_.insert(isolate, context, p_module_id, false, false);

            //NOTE the loader should throw error if failed
            if (!loader->load(this, module))
            {
                return nullptr;
            }

            module.on_load(isolate, context);
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
            const StringName& module_id = asset_path;

            // check again with the resolved module_id
            existing_module = module_cache_.find(module_id);
            if (existing_module && existing_module->is_loaded())
            {
                return existing_module;
            }

            // supported module properties: id, filename, cache, loaded, exports, children
            if (existing_module)
            {
                jsb_check(existing_module->id == module_id);
                jsb_check(existing_module->path == asset_path);

                JSB_LOG(VeryVerbose, "reload module %s", module_id);
#if JSB_SUPPORT_RELOAD
                existing_module->reload_requested = false;
#endif
                if (!resolver->load(this, asset_path, *existing_module))
                {
                    return nullptr;
                }
                _parse_script_class(this, context, *existing_module);
                return existing_module;
            }
            else
            {
                JSB_LOG(Verbose, "instantiating module %s", module_id);
                JavaScriptModule& module = module_cache_.insert(isolate, context, module_id, true, false);
                v8::Local<v8::Object> exports_obj = v8::Object::New(isolate);
                v8::Local<v8::Object> module_obj = module.module.Get(isolate);

                // init the new module obj
                module_obj->Set(context, jsb_name(environment_, children), v8::Array::New(isolate)).Check();
                module_obj->Set(context, jsb_name(environment_, exports), exports_obj).Check();
                module.path = asset_path;
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
                    if (const JavaScriptModule* parent_ptr = module_cache_.find(p_parent_id))
                    {
                        const v8::Local<v8::Object> parent_module = parent_ptr->module.Get(isolate);
                        if (v8::Local<v8::Value> temp; parent_module->Get(context, jsb_name(environment_, children)).ToLocal(&temp) && temp->IsArray())
                        {
                            const v8::Local<v8::Array> children = temp.As<v8::Array>();
                            const uint32_t children_num = children->Length();
                            children->Set(context, children_num, module_obj).Check();
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

                module.on_load(isolate, context);
                {
                    v8::TryCatch try_catch_run(isolate);
                    _parse_script_class(this, context, module);
                    if (JavaScriptExceptionInfo exception_info = JavaScriptExceptionInfo(isolate, try_catch_run))
                    {
                        JSB_LOG(Error, "something wrong when parsing '%s'\n%s", module_id, (String) exception_info);
                    }
                }
                return &module;
            }
        }

        isolate->ThrowError(V8Helper::to_string(isolate, jsb_format("unknown module: %s", normalized_id)));
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
        Environment* environment = Environment::wrap(isolate);
        v8::Local<v8::Object> exports = exports_val.As<v8::Object>();
        v8::Local<v8::Value> default_val;
        if (!exports->Get(p_context, jsb_name(environment, default)).ToLocal(&default_val)
            || !default_val->IsObject())
        {
            return;
        }

        v8::Local<v8::Object> default_obj = default_val.As<v8::Object>();
        v8::Local<v8::String> name_str = default_obj->Get(p_context, jsb_name(environment, name)).ToLocalChecked().As<v8::String>();
        v8::Local<v8::Value> class_id_val;
        if (!default_obj->Get(p_context, jsb_symbol(environment, ClassId)).ToLocal(&class_id_val) || !class_id_val->IsUint32())
        {
            // ignore a javascript which does not inherit from a native class (directly and indirectly both)
            return;
        }

        // unsafe
        const NativeClassID native_class_id = (NativeClassID) class_id_val->Uint32Value(p_context).ToChecked();
        jsb_address_guard(environment->native_classes_, native_classes_address_guard);
        const NativeClassInfo& native_class_info = environment->get_native_class(native_class_id);

        //TODO maybe we should always add new GodotJS class instead of refreshing the existing one (for simpler reloading flow, such as directly replacing prototype of a existing instance javascript object)
        ScriptClassInfo* existed_class_info = environment->find_script_class(p_module.default_class_id);
        if (existed_class_info)
        {
            existed_class_info->methods.clear();
            existed_class_info->signals.clear();
            existed_class_info->properties.clear();
            existed_class_info->flags = GodotJSClassFlags::None;
        }
        else
        {
            ScriptClassID script_class_id;
            existed_class_info = &environment->add_script_class(script_class_id);
            p_module.default_class_id = script_class_id;
            existed_class_info->module_id = p_module.id;
        }

        // trick: save godot class id for getting it in constructor
        default_obj->Set(p_context, jsb_symbol(environment, CrossBind), v8::Uint32::NewFromUnsigned(isolate, p_module.default_class_id)).Check();

        jsb_address_guard(environment->script_classes_, godotjs_classes_address_guard);
        jsb_check(existed_class_info->module_id == p_module.id);
        existed_class_info->js_class_name = environment->get_string_name(name_str);
        existed_class_info->native_class_id = native_class_id;
        existed_class_info->native_class_name = native_class_info.name;
        existed_class_info->js_class.Reset(isolate, default_obj);
        existed_class_info->js_default_object.Reset();
        JSB_LOG(VeryVerbose, "godot js class name %s (native: %s)", existed_class_info->js_class_name, existed_class_info->native_class_name);
        _parse_script_class_iterate(p_realm, p_context, *existed_class_info);
    }

#ifdef TOOLS_ENABLED
    void _parse_script_doc(v8::Isolate* isolate, const v8::Local<v8::Context>& context, const v8::MaybeLocal<v8::Value> holder, ScriptBaseDoc& r_doc)
    {
        if (v8::Local<v8::Value> tv; holder.IsEmpty() || !holder.ToLocal(&tv) || !tv->IsObject())
        {
            // invalid
        }
        else
        {
            const v8::Local<v8::Object> obj = tv.As<v8::Object>();
            Environment* environment = Environment::wrap(isolate);

            // (@deprecated)
            if (v8::Local<v8::Value> val; obj->Get(context, jsb_name(environment, deprecated)).ToLocal(&val) && val->IsString())
            {
                r_doc.is_deprecated = true;
                r_doc.deprecated_message = V8Helper::to_string(isolate, val);
            }
            else
            {
                r_doc.is_deprecated = false;
            }
            // (@experimental)
            if (v8::Local<v8::Value> val; obj->Get(context, jsb_name(environment, experimental)).ToLocal(&val) && val->IsString())
            {
                r_doc.is_experimental = true;
                r_doc.experimental_message = V8Helper::to_string(isolate, val);
            }
            else
            {
                r_doc.is_experimental = false;
            }
            // (@help)
            if (v8::Local<v8::Value> val; obj->Get(context, jsb_name(environment, help)).ToLocal(&val) && val->IsString())
            {
                r_doc.brief_description = V8Helper::to_string(isolate, val);
            }
            else
            {
                r_doc.brief_description.clear();
            }
        }
    }
#endif

    void Realm::_parse_script_class_iterate(Realm* p_realm, const v8::Local<v8::Context>& p_context, ScriptClassInfo& p_class_info)
    {
        Environment* environment = p_realm->environment_.get();
        jsb_address_guard(environment->script_classes_, godotjs_classes_address_guard);
        v8::Isolate* isolate = environment->unwrap();

        //TODO collect methods/signals/properties
        v8::Local<v8::Object> default_obj = p_class_info.js_class.Get(isolate);
        v8::Local<v8::Object> prototype = default_obj->Get(p_context, jsb_name(environment, prototype)).ToLocalChecked().As<v8::Object>();

#ifdef TOOLS_ENABLED
        // class doc
        v8::Local<v8::Map> doc_map;
        if (v8::Local<v8::Value> val; prototype->Get(p_context, jsb_symbol(environment, MemberDocMap)).ToLocal(&val) && val->IsMap())
        {
            doc_map = val.As<v8::Map>();
        }
        else
        {
            doc_map = v8::Map::New(isolate);
        }
        _parse_script_doc(isolate, p_context, prototype->Get(p_context, jsb_symbol(environment, Doc)), p_class_info.doc);
#endif

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
                    if (prop_descriptor.As<v8::Object>()->Get(p_context, jsb_name(environment, value)).ToLocal(&prop_val) && prop_val->IsFunction())
                    {
                        //TODO property categories
                        GodotJSMethodInfo method_info = {};
#ifdef TOOLS_ENABLED
                        if (v8::Local<v8::Value> val; doc_map->Get(p_context, prop_name).ToLocal(&val) && val->IsObject())
                        {
                            _parse_script_doc(isolate, p_context, val.As<v8::Object>(), method_info.doc);
                        }
#endif // TOOLS_ENABLED
                        p_class_info.methods.insert((StringName) name_s, method_info);
                        JSB_LOG(VeryVerbose, "... method %s", name_s);
                    }
                }
            }
        }

        // tool (@tool_)
        {
            const bool is_tool = default_obj->HasOwnProperty(p_context, jsb_symbol(environment, ClassToolScript)).FromMaybe(false);
            if (is_tool)
            {
                p_class_info.flags = (GodotJSClassFlags::Type) (p_class_info.flags | GodotJSClassFlags::Tool);
            }
        }

        // icon (@icon)
        {
            if (v8::Local<v8::Value> val; default_obj->Get(p_context, jsb_symbol(environment, ClassIcon)).ToLocal(&val))
            {
                p_class_info.icon = V8Helper::to_string(isolate, val);
            }
        }

        // signals (@signal_)
        {
            v8::Local<v8::Value> val_test;
            //TODO does prototype chain introduce unexpected behaviour if signal is decalred in super class?
            if (prototype->Get(p_context, jsb_symbol(environment, ClassSignals)).ToLocal(&val_test) && val_test->IsArray())
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
                    v8::Local<v8::Function> signal_func = v8::Function::New(p_context, ObjectReflectBindingUtil::_godot_object_signal, v8::Uint32::NewFromUnsigned(isolate, (uint32_t) string_id)).ToLocalChecked();
                    prototype->SetAccessorProperty(element.As<v8::Name>(), signal_func);
                    JSB_LOG(VeryVerbose, "... signal %s (%d)", signal, (uint32_t) string_id);
                }
            }
        }

        // properties (@export_)
        // detect all exported properties (which annotated with @export_)
        {
            v8::Local<v8::Value> val_test;
            //TODO does prototype chain introduce unexpected behaviour if signal is decalred in super class?
            if (prototype->Get(p_context, jsb_symbol(environment, ClassProperties)).ToLocal(&val_test) && val_test->IsArray())
            // if (prototype->Get(p_context, jsb_symbol(environment, ClassProperties)).ToLocal(&val_test) && val_test->IsArray())
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
                    v8::Local<v8::Value> prop_name = obj->Get(context, jsb_name(environment, name)).ToLocalChecked();
                    property_info.name = V8Helper::to_string(isolate, prop_name); // string
                    property_info.type = (Variant::Type) obj->Get(context, jsb_name(environment, type)).ToLocalChecked()->Int32Value(context).ToChecked(); // int
                    property_info.hint = V8Helper::to_enum<PropertyHint>(context, obj->Get(context, jsb_name(environment, hint)), PROPERTY_HINT_NONE);
                    property_info.hint_string = V8Helper::to_string(isolate, obj->Get(context, jsb_name(environment, hint_string)).ToLocalChecked());
                    property_info.usage = V8Helper::to_enum<PropertyUsageFlags>(context, obj->Get(context, jsb_name(environment, usage)), PROPERTY_USAGE_DEFAULT);
#ifdef TOOLS_ENABLED
                    if (v8::Local<v8::Value> val; doc_map->Get(p_context, prop_name).ToLocal(&val) && val->IsObject())
                    {
                        _parse_script_doc(isolate, p_context, val.As<v8::Object>(), property_info.doc);
                    }
#endif // TOOLS_ENABLED
                    p_class_info.properties.insert(property_info.name, property_info);
                    JSB_LOG(VeryVerbose, "... property %s: %s", property_info.name, Variant::get_type_name(property_info.type));
                }
            }
        }
    }

    NativeObjectID Realm::crossbind(Object* p_this, ScriptClassID p_class_id)
    {
        v8::Isolate* isolate = get_isolate();
        v8::HandleScope handle_scope(isolate);
        v8::Local<v8::Context> context = context_.Get(isolate);
        v8::Context::Scope context_scope(context);

        jsb_checkf(!environment_->get_object_id(p_this), "duplicated object binding is not allowed (%s)", uitos((uintptr_t) p_this));
        jsb_address_guard(environment_->script_classes_, godotjs_classes_address_guard);
        const ScriptClassInfo& class_info = environment_->get_script_class(p_class_id);
        const StringName class_name = class_info.js_class_name;

        v8::Local<v8::Object> constructor = class_info.js_class.Get(isolate);
        jsb_check(!constructor->IsUndefined() && !constructor->IsNull());
        v8::TryCatch try_catch_run(isolate);
        v8::Local<v8::Value> identifier = jsb_symbol(environment_, CrossBind);
        v8::MaybeLocal<v8::Value> constructed_value = constructor->CallAsConstructor(context, 1, &identifier);
        jsb_check(!constructed_value.IsEmpty() && !constructed_value.ToLocalChecked()->IsUndefined());
        if (JavaScriptExceptionInfo exception_info = JavaScriptExceptionInfo(isolate, try_catch_run))
        {
            JSB_LOG(Error, "something wrong when constructing '%s'\n%s", class_name, (String) exception_info);
            return {};
        }
        v8::Local<v8::Value> instance;
        if (!constructed_value.ToLocal(&instance) || !instance->IsObject())
        {
            JSB_LOG(Error, "bad instance '%s", class_name);
            return {};
        }
        const NativeObjectID object_id = environment_->bind_godot_object(class_info.native_class_id, p_this, instance.As<v8::Object>());
        JSB_LOG(VeryVerbose, "crossbind %s %s(%d) %s", class_info.js_class_name,  class_info.native_class_name, (uint32_t) class_info.native_class_id, uitos((uintptr_t) p_this));
        return object_id;
    }

    void Realm::rebind(Object *p_this, ScriptClassID p_class_id)
    {
        //TODO a dirty but approaching solution for hot-reloading
        environment_->check_internal_state();
        v8::Isolate* isolate = get_isolate();
        v8::HandleScope handle_scope(isolate);
        v8::Local<v8::Context> context = context_.Get(isolate);
        v8::Context::Scope context_scope(context);

        v8::Local<v8::Object> instance;
        if (!environment_->get_object(p_this, instance))
        {
            JSB_LOG(Fatal, "bad instance");
            return;
        }

        jsb_address_guard(environment_->script_classes_, godotjs_classes_address_guard);
        const ScriptClassInfo& class_info = environment_->get_script_class(p_class_id);
        const StringName class_name = class_info.js_class_name;
        v8::Local<v8::Object> constructor = class_info.js_class.Get(isolate);
        v8::Local<v8::Value> prototype = constructor->Get(context, jsb_name(environment_, prototype)).ToLocalChecked();

        v8::TryCatch try_catch(isolate);
        jsb_check(instance->IsObject());
        jsb_check(prototype->IsObject());
        if (instance->SetPrototype(context, prototype).IsNothing())
        {
            if (JavaScriptExceptionInfo exception_info = JavaScriptExceptionInfo(isolate, try_catch))
            {
                JSB_LOG(Warning, "something wrong\n%s", (String) exception_info);
            }
        }
    }

    v8::Local<v8::Function> Realm::_new_require_func(const String &p_module_id)
    {
        v8::Isolate* isolate = environment_->isolate_;
        v8::Local<v8::Context> context = context_.Get(isolate);
        v8::Local<v8::String> jmodule_id = V8Helper::to_string(isolate, p_module_id);
        v8::Local<v8::Function> jrequire = v8::Function::New(context, Builtins::_require, /* magic: module_id */ jmodule_id).ToLocalChecked();
        v8::Local<v8::Object> jmain_module;
        if (_get_main_module(&jmain_module))
        {
            jrequire->Set(context, jsb_name(environment_, main), jmain_module).Check();
        }
        else
        {
            JSB_LOG(Warning, "invalid main module");
            jrequire->Set(context, jsb_name(environment_, main), v8::Undefined(isolate)).Check();
        }
        return jrequire;
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

            module_cache_.init(isolate);
            Builtins::register_(context, global);
            register_primitive_bindings(this);
        }
        environment_->on_context_created(context);

        realms_lock_.lock();
        id_ = realms_.add(this);
        realms_lock_.unlock();
    }

    Realm::~Realm()
    {
        realms_lock_.lock();
        realms_.remove_at_checked(id_);
        realms_lock_.unlock();

        id_ = {};
        v8::Isolate* isolate = environment_->isolate_;
        v8::Isolate::Scope isolate_scope(isolate);
        v8::HandleScope handle_scope(isolate);
        v8::Local<v8::Context> context = context_.Get(get_isolate());

        function_bank_.clear();
        function_refs_.clear();

        environment_->on_context_destroyed(context);
        context->SetAlignedPointerInEmbedderData(kContextEmbedderData, nullptr);

        module_cache_.deinit();
        context_.Reset();
    }

    Error Realm::load(const String& p_name, JavaScriptModule** r_module)
    {
        JSB_BENCHMARK_SCOPE(JSRealm, load);
        environment_->check_internal_state();
        v8::Isolate* isolate = get_isolate();
        v8::Isolate::Scope isolate_scope(isolate);
        v8::HandleScope handle_scope(isolate);
        v8::Local<v8::Context> context = context_.Get(isolate);
        v8::Context::Scope context_scope(context);

        v8::TryCatch try_catch_run(isolate);
        if (JavaScriptModule* module = _load_module("", p_name))
        {
            // no exception should be thrown if module loaded successfully
            if (JavaScriptExceptionInfo exception_info = JavaScriptExceptionInfo(isolate, try_catch_run))
            {
                JSB_LOG(Warning, "something wrong when loading '%s'\n%s", p_name, (String) exception_info);
            }
            if (r_module)
            {
                *r_module = module;
            }
            return OK;
        }

        if (JavaScriptExceptionInfo exception_info = JavaScriptExceptionInfo(isolate, try_catch_run))
        {
            JSB_LOG(Error, "failed to load '%s'\n%s", p_name, (String) exception_info);
        }
        else
        {
            JSB_LOG(Error, "something wrong");
        }
        return ERR_COMPILATION_FAILED;
    }

    const NativeClassInfo* Realm::_expose_class(const StringName& p_type_name, NativeClassID* r_class_id)
    {
        ClassRegister* class_register = class_register_map_.getptr(p_type_name);
        if (jsb_unlikely(!class_register)) return nullptr;

        if (!class_register->id.is_valid())
        {
            class_register->id = class_register->register_func(FBindingEnv {
                environment_.get(),
                this,
                p_type_name,
                environment_->isolate_,
                this->context_.Get(environment_->isolate_),
                this->function_pointers_
            });
            jsb_check(class_register->id.is_valid());
            JSB_LOG(VeryVerbose, "register class %s (%d)", (String) p_type_name, (uint32_t) class_register->id);
        }

        if (r_class_id) *r_class_id = class_register->id;
        const NativeClassInfo& class_info = environment_->get_native_class(class_register->id);
        jsb_check(class_info.name == p_type_name);
        return &class_info;
    }

    NativeClassID Realm::_expose_godot_class(const ClassDB::ClassInfo* p_class_info)
    {
        if (!p_class_info) return NativeClassID();

        NativeClassID class_id;
        if (const NativeClassInfo* cached_info = environment_->find_godot_class(p_class_info->name, class_id))
        {
            JSB_LOG(VeryVerbose, "return cached native class %s (%d) (for %s)", cached_info->name, (uint32_t) class_id, p_class_info->name);
            jsb_check(cached_info->name == p_class_info->name);
            jsb_check(!cached_info->template_.IsEmpty());
            return class_id;
        }

        return ObjectReflectBindingUtil::reflect_bind(this, p_class_info);
    }

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
            jsb_check(r_jval->InternalFieldCount() == IF_ObjectFieldCount);

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
            if (Environment::wrap(isolate)->get_string_name_cache().try_get_string_name(isolate, p_jval, sn))
            {
                r_cvar = sn;
                return true;
            }
            r_cvar = V8Helper::to_string(isolate, p_jval.As<v8::String>());
            return true;
        }
        // is it proper to convert a ArrayBuffer into Vector<uint8_t>?
        if (p_jval->IsArrayBuffer())
        {
            r_cvar = V8Helper::to_packed_byte_array(isolate, p_jval.As<v8::ArrayBuffer>());
            return true;
        }
        //TODO
        // if (p_jval->IsFunction())
        // {
        // }
        if (p_jval->IsObject())
        {
            v8::Local<v8::Object> self = p_jval.As<v8::Object>();
            switch (self->InternalFieldCount())
            {
            case IF_VariantFieldCount: { r_cvar = *(Variant*) self->GetAlignedPointerFromInternalField(IF_Pointer); return true; }
            case IF_ObjectFieldCount:
                {
                    void* pointer = self->GetAlignedPointerFromInternalField(IF_Pointer);
                    if (!Environment::verify_godot_object(isolate, pointer))
                    {
                        return false;
                    }
                    r_cvar = (Object*) pointer;
                    return true;
                }
            default: return false;
            }
        }

        JSB_LOG(Error, "js_to_gd_var: unhandled type");
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
            goto FALLBACK_TO_VARIANT; // NOLINT(cppcoreguidelines-avoid-goto, hicpp-avoid-goto)
        case Variant::OBJECT:
            {
                if (!p_val->IsObject()) return false;
                v8::Local<v8::Object> self = p_val.As<v8::Object>();
                if (self->InternalFieldCount() != IF_ObjectFieldCount) return false;

#if JSB_VERIFY_GODOT_OBJECT
                void* pointer = self->GetAlignedPointerFromInternalField(IF_Pointer);
                if (!Environment::verify_godot_object(isolate, pointer))
                {
                    return false;
                }
#endif
                return true;
            }

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
#if JSB_IMPLICIT_PACKED_ARRAY_CONVERSION
            //TODO is loose conversion check for JS primitive array as Godot array a bad idea?
            if (p_val->IsArray()) return true; goto FALLBACK_TO_VARIANT;  // NOLINT(cppcoreguidelines-avoid-goto, hicpp-avoid-goto)
#endif
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
            {
                FALLBACK_TO_VARIANT:
                if (!p_val->IsObject())
                {
                    return false;
                }
                v8::Local<v8::Object> self = p_val.As<v8::Object>();
                if (self->InternalFieldCount() != IF_VariantFieldCount)
                {
                    return false;
                }
                const Variant* target = (const Variant*) self->GetAlignedPointerFromInternalField(IF_Pointer);
                if (!target)
                {
                    return Variant::can_convert_strict(Variant::NIL, p_type);
                }
                return Variant::can_convert_strict(target->get_type(), p_type);
            }
        default: return false;
        }
    }

    bool Realm::js_to_gd_obj(v8::Isolate* isolate, const v8::Local<v8::Context>& context, const v8::Local<v8::Value>& p_jval, Object*& r_godot_obj)
    {
        if (!p_jval->IsObject())
        {
            return false;
        }
        const v8::Local<v8::Object> self = p_jval.As<v8::Object>();
        if (self->InternalFieldCount() != IF_ObjectFieldCount)
        {
            return false;
        }

        void* pointer = self->GetAlignedPointerFromInternalField(IF_Pointer);
        if (!Environment::verify_godot_object(isolate, pointer))
        {
            return false;
        }
        r_godot_obj = (Object*) pointer;
        return true;
    }

    template<typename T>
    static bool try_convert_array(v8::Isolate* isolate, const v8::Local<v8::Context>& context, v8::Local<v8::Value> p_val, Variant& r_packed)
    {
        if constexpr (GetTypeInfo<T>::METADATA == GodotTypeInfo::METADATA_INT_IS_UINT8)
        {
            if (p_val->IsArrayBuffer())
            {
                r_packed = V8Helper::to_packed_byte_array(isolate, p_val.As<v8::ArrayBuffer>());
                return true;
            }
        }

#if JSB_IMPLICIT_PACKED_ARRAY_CONVERSION
        if (!p_val->IsArray())
        {
            return false;
        }

        const v8::Local<v8::Array> array = p_val.As<v8::Array>();
        const uint32_t len = array->Length();
        Vector<T> packed;
        packed.resize((int)len);
        for (uint32_t index = 0; index < len; ++index)
        {
            v8::Local<v8::Value> element;
            Variant element_var;
            if (array->Get(context, index).ToLocal(&element) && Realm::js_to_gd_var(isolate, context, element, GetTypeInfo<T>::VARIANT_TYPE, element_var))
            {
                packed.write[index] = element_var;
            }
            else
            {
                // be cautious here, we silently omit conversion failures
                packed.write[index] = T {};
                JSB_LOG(Warning, "failed to convert array element %d (strictly, as %s), it'll be left as the default value", index, Variant::get_type_name(GetTypeInfo<T>::VARIANT_TYPE));
            }
        }
        r_packed = packed;
        return true;
#else
        return false;
#endif
    }

    static bool try_convert_array_any(v8::Isolate* isolate, const v8::Local<v8::Context>& context, v8::Local<v8::Value> p_val, Variant& r_packed)
    {
#if JSB_IMPLICIT_PACKED_ARRAY_CONVERSION
        if (!p_val->IsArray())
        {
            return false;
        }

        const v8::Local<v8::Array> array = p_val.As<v8::Array>();
        const uint32_t len = array->Length();
        Array packed;
        packed.resize((int)len);
        for (uint32_t index = 0; index < len; ++index)
        {
            v8::Local<v8::Value> element;
            Variant element_var;
            if (array->Get(context, index).ToLocal(&element) && Realm::js_to_gd_var(isolate, context, element, element_var))
            {
                packed.set(index, element_var);
            }
            else
            {
                // be cautious here, we silently omit conversion failures
                packed.set(index, {});
                JSB_LOG(Warning, "failed to convert array element %d (loosely), it'll be left as the default value", index);
            }
        }
        r_packed = packed;
        return true;
#else
        return false;
#endif
    }

    // translate js val into gd variant with an expected type
    bool Realm::js_to_gd_var(v8::Isolate* isolate, const v8::Local<v8::Context>& context, const v8::Local<v8::Value>& p_jval, Variant::Type p_type, Variant& r_cvar)
    {
        switch (p_type)
        {
        case Variant::FLOAT:
            if (p_jval->IsNumber())
            {
                r_cvar = p_jval->NumberValue(context).ToChecked();
                return true;
            }
            return false;
        case Variant::INT:
            // strict?
            if (p_jval->IsInt32()) { r_cvar = p_jval->Int32Value(context).ToChecked(); return true; }
            if (p_jval->IsNumber()) { r_cvar = (int64_t) p_jval->NumberValue(context).ToChecked(); return true; }
            return false;
        case Variant::OBJECT:
            {
                if (!p_jval->IsObject())
                {
                    return false;
                }
                v8::Local<v8::Object> self = p_jval.As<v8::Object>();
                if (self->InternalFieldCount() != IF_ObjectFieldCount)
                {
                    return false;
                }

                void* pointer = self->GetAlignedPointerFromInternalField(IF_Pointer);
                if (!Environment::verify_godot_object(isolate, pointer))
                {
                    return false;
                }
                r_cvar = (Object*) pointer;
                return true;
            }
        case Variant::BOOL:
            // strict?
            if (p_jval->IsBoolean()) { r_cvar = p_jval->BooleanValue(isolate); return true; }
            return false;
        case Variant::STRING:
            if (p_jval->IsString())
            {
                StringName sn;
                if (Environment::wrap(isolate)->get_string_name_cache().try_get_string_name(isolate, p_jval, sn))
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
                if (Environment::wrap(isolate)->get_string_name_cache().try_get_string_name(isolate, p_jval, sn))
                {
                    r_cvar = NodePath((String) sn);
                    return true;
                }
                r_cvar = NodePath(V8Helper::to_string(isolate, p_jval));
                return true;
            }
            goto FALLBACK_TO_VARIANT;  // NOLINT(cppcoreguidelines-avoid-goto, hicpp-avoid-goto)
        case Variant::PACKED_BYTE_ARRAY:    if (try_convert_array<uint8_t>(isolate, context, p_jval, r_cvar)) return true; goto FALLBACK_TO_VARIANT;  // NOLINT(cppcoreguidelines-avoid-goto, hicpp-avoid-goto)
        case Variant::PACKED_INT32_ARRAY:   if (try_convert_array<int32_t>(isolate, context, p_jval, r_cvar)) return true; goto FALLBACK_TO_VARIANT;  // NOLINT(cppcoreguidelines-avoid-goto, hicpp-avoid-goto)
        case Variant::PACKED_INT64_ARRAY:   if (try_convert_array<int64_t>(isolate, context, p_jval, r_cvar)) return true; goto FALLBACK_TO_VARIANT;  // NOLINT(cppcoreguidelines-avoid-goto, hicpp-avoid-goto)
        case Variant::PACKED_FLOAT32_ARRAY: if (try_convert_array<float>(isolate, context, p_jval, r_cvar))   return true; goto FALLBACK_TO_VARIANT;  // NOLINT(cppcoreguidelines-avoid-goto, hicpp-avoid-goto)
        case Variant::PACKED_FLOAT64_ARRAY: if (try_convert_array<double>(isolate, context, p_jval, r_cvar))  return true; goto FALLBACK_TO_VARIANT;  // NOLINT(cppcoreguidelines-avoid-goto, hicpp-avoid-goto)
        case Variant::PACKED_STRING_ARRAY:  if (try_convert_array<String>(isolate, context, p_jval, r_cvar))  return true; goto FALLBACK_TO_VARIANT;  // NOLINT(cppcoreguidelines-avoid-goto, hicpp-avoid-goto)
        case Variant::PACKED_VECTOR2_ARRAY: if (try_convert_array<Vector2>(isolate, context, p_jval, r_cvar)) return true; goto FALLBACK_TO_VARIANT;  // NOLINT(cppcoreguidelines-avoid-goto, hicpp-avoid-goto)
        case Variant::PACKED_VECTOR3_ARRAY: if (try_convert_array<Vector3>(isolate, context, p_jval, r_cvar)) return true; goto FALLBACK_TO_VARIANT;  // NOLINT(cppcoreguidelines-avoid-goto, hicpp-avoid-goto)
        case Variant::PACKED_COLOR_ARRAY:   if (try_convert_array<Color>(isolate, context, p_jval, r_cvar))   return true; goto FALLBACK_TO_VARIANT;  // NOLINT(cppcoreguidelines-avoid-goto, hicpp-avoid-goto)
        case Variant::ARRAY:                if (try_convert_array_any(isolate, context, p_jval, r_cvar))      return true; goto FALLBACK_TO_VARIANT;  // NOLINT(cppcoreguidelines-avoid-goto, hicpp-avoid-goto)
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
            {
                FALLBACK_TO_VARIANT:
                if (!p_jval->IsObject())
                {
                    return false;
                }
                v8::Local<v8::Object> self = p_jval.As<v8::Object>();
                if (self->InternalFieldCount() != IF_VariantFieldCount)
                {
                    return false;
                }

                void* pointer = self->GetAlignedPointerFromInternalField(IF_Pointer);
                r_cvar = *(Variant*) pointer;
                return true;
            }
        case Variant::NIL:
            //NOTE (instead of prompting a nil value) the type NIL usually means a Variant parameter accepted by a godot method
            return js_to_gd_var(isolate, context, p_jval, r_cvar);
        default: return false;
        }
    }

    bool Realm::gd_var_to_js(v8::Isolate* isolate, const v8::Local<v8::Context>& context, const Variant& p_cvar, Variant::Type p_type, v8::Local<v8::Value>& r_jval)
    {
        switch (p_type)
        {
        case Variant::FLOAT:
            {
                r_jval = v8::Number::New(isolate, p_cvar);
                return true;
            }
        case Variant::INT:
            {
                const int64_t raw_val = p_cvar;
                jsb_verify_int64(raw_val, "");
                r_jval = V8Helper::to_int32(isolate, raw_val);
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
        case Variant::BOOL: r_jval = v8::Boolean::New(isolate, p_cvar); return true;
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
                r_jval = Environment::wrap(isolate)->get_string_value((StringName) p_cvar);
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
                jsb_checkf(Variant::can_convert(p_cvar.get_type(), p_type), "variant type can't convert to %s from %s", Variant::get_type_name(p_type), Variant::get_type_name(p_cvar.get_type()));
                Realm* realm = Realm::wrap(context);
                NativeClassID class_id;
                if (const NativeClassInfo* class_info = realm->_expose_godot_primitive_class(p_type, &class_id))
                {
                    jsb_check(class_info->type == NativeClassType::GodotPrimitive);
                    v8::Local<v8::FunctionTemplate> jtemplate = class_info->template_.Get(isolate);
                    r_jval = jtemplate->InstanceTemplate()->NewInstance(context).ToLocalChecked();
                    jsb_check(r_jval.As<v8::Object>()->InternalFieldCount() == IF_VariantFieldCount);

                    Environment* environment = realm->environment_.get();
                    environment->bind_valuetype(class_id, environment->alloc_variant(p_cvar), r_jval.As<v8::Object>());
                    return true;
                }
                return false;
            }
        case Variant::NIL:
            if (const Variant::Type var_type = p_cvar.get_type(); var_type != Variant::NIL)
            {
                return gd_var_to_js(isolate, context, p_cvar, var_type, r_jval);
            }
            r_jval = v8::Null(isolate);
            return true;
        default:
            {
                JSB_LOG(Error, "unhandled type %s", Variant::get_type_name(p_type));
                return false;
            }
        }
    }

    // [JS] function load_type(type_name: string): Class;
    void Realm::_load_godot_mod(const v8::FunctionCallbackInfo<v8::Value>& info)
    {
        JSB_BENCHMARK_SCOPE(JSRealm, _load_godot_mod);

        v8::Isolate* isolate = info.GetIsolate();
        v8::Local<v8::Value> arg0 = info[0];
        if (!arg0->IsString())
        {
            isolate->ThrowError("bad parameter");
            return;
        }

        const StringName type_name(V8Helper::to_string(v8::String::Value(isolate, arg0)));
        v8::Local<v8::Context> context = isolate->GetCurrentContext();
        Realm* realm = Realm::wrap(context);

        //NOTE do not break the order in `GDScriptLanguage::init()`

        // (1) singletons have the top priority (in GDScriptLanguage::init, singletons will overwrite the globals slot even if a type/const has the same name)
        //     check before getting to avoid error prints in `get_singleton_object`
        if (Engine::get_singleton()->has_singleton(type_name))
        if (Object* gd_singleton = Engine::get_singleton()->get_singleton_object(type_name))
        {
            v8::Local<v8::Object> rval;
            JSB_LOG(VeryVerbose, "exposing singleton object %s", (String) type_name);
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

        // (2) (global) utility functions.
        if (Variant::has_utility_function(type_name))
        {
            //TODO check static bindings at first, and dynamic bindings as a fallback

            // dynamic binding:
            jsb_check(sizeof(Variant::ValidatedUtilityFunction) == sizeof(void*));
            const int32_t utility_func_index = (int32_t) realm->get_variant_info_collection().utility_funcs.size();
            realm->get_variant_info_collection().utility_funcs.append({});
            internal::FUtilityMethodInfo& method_info = realm->get_variant_info_collection().utility_funcs.write[utility_func_index];

            const int argument_count = Variant::get_utility_function_argument_count(type_name);
            method_info.argument_types.resize(argument_count);
            for (int index = 0, num = argument_count; index < num; ++index)
            {
                method_info.argument_types.write[index] = Variant::get_utility_function_argument_type(type_name, index);
            }
            //NOTE currently, utility functions have no default argument.
            // method_info.default_arguments = ...
            method_info.return_type = Variant::get_utility_function_return_type(type_name);
            method_info.is_vararg = Variant::is_utility_function_vararg(type_name);
            method_info.set_debug_name(type_name);
            method_info.utility_func = Variant::get_validated_utility_function(type_name);
            jsb_check(method_info.utility_func);
            JSB_LOG(VeryVerbose, "expose godot utility function %s (%d)", type_name, utility_func_index);

            info.GetReturnValue().Set(v8::Function::New(context, ObjectReflectBindingUtil::_godot_utility_func, v8::Int32::New(isolate, utility_func_index)).ToLocalChecked());
            return;
        }

        // (3) global_constants
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

        // (4) classes in ClassDB/PrimitiveTypes
        {
            if (const NativeClassInfo* class_info = realm->_expose_class(type_name))
            {
                jsb_check(class_info->name == type_name);
                jsb_check(!class_info->template_.IsEmpty());
                info.GetReturnValue().Set(class_info->get_function(isolate, context));
                return;
            }

            // dynamic binding: godot class types
            if (const ClassDB::ClassInfo* it = ClassDB::classes.getptr(type_name))
            {
                if (const NativeClassID class_id = realm->_expose_godot_class(it))
                {
                    const NativeClassInfo& godot_class = realm->environment_->get_native_class(class_id);
                    jsb_check(godot_class.name == type_name);
                    jsb_check(!godot_class.template_.IsEmpty());
                    info.GetReturnValue().Set(godot_class.get_function(isolate, context));
                    return;
                }
            }
        }

        // (5) global_enums
        if (CoreConstants::is_global_enum(type_name))
        {
            HashMap<StringName, int64_t> enum_values;
            CoreConstants::get_enum_values(type_name, &enum_values);
            info.GetReturnValue().Set(V8Helper::to_global_enum(isolate, context, enum_values));
            return;
        }

        // (6) special case: `Variant` (`Variant` is not exposed as it-self in js, but we still need to access the nested enums in it)
        // seealso: core/variant/binder_common.h
        //          VARIANT_ENUM_CAST(Variant::Type);
        //          VARIANT_ENUM_CAST(Variant::Operator);
        // they are exposed as `Variant.Type` in global constants in godot
        if (type_name == jsb_string_name(Variant))
        {
            v8::Local<v8::Object> obj = v8::Object::New(isolate);
            obj->Set(context, V8Helper::to_string(isolate, "Type"), V8Helper::to_global_enum(isolate, context, "Variant.Type")).Check();
            obj->Set(context, V8Helper::to_string(isolate, "Operator"), V8Helper::to_global_enum(isolate, context, "Variant.Operator")).Check();
            info.GetReturnValue().Set(obj);
            return;
        }

        const CharString message = jsb_format("godot class not found '%s'", type_name).utf8();
        isolate->ThrowError(v8::String::NewFromUtf8(isolate, message.ptr(), v8::NewStringType::kNormal, message.length()).ToLocalChecked());
    }

    JSValueMove Realm::eval_source(const char* p_source, int p_length, const String& p_filename, Error& r_err)
    {
        JSB_BENCHMARK_SCOPE(JSRealm, eval_source);
        v8::Isolate* isolate = get_isolate();
        v8::Isolate::Scope isolate_scope(isolate);
        v8::HandleScope handle_scope(isolate);
        v8::Local<v8::Context> context = context_.Get(isolate);
        v8::Context::Scope context_scope(context);

        v8::TryCatch try_catch_run(isolate);
        v8::MaybeLocal<v8::Value> maybe = _compile_run(p_source, p_length, p_filename);
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

        JSB_LOG(VeryVerbose, "script compiled %s", p_filename);
        return maybe_value;
    }

    ObjectCacheID Realm::retain_function(NativeObjectID p_object_id, const StringName& p_method)
    {
        ObjectHandle* handle;
        environment_->check_internal_state();
        jsb_address_guard(environment_->objects_, address_guard);
        if (environment_->objects_.try_get_value_pointer(p_object_id, handle))
        {
            v8::Isolate* isolate = environment_->isolate_;
            v8::HandleScope handle_scope(isolate);
            v8::Local<v8::Context> context = context_.Get(isolate);
            v8::Local<v8::Object> obj = handle->ref_.Get(isolate);
            v8::Local<v8::Value> find;
            if (obj->Get(context, environment_->get_string_value(p_method)).ToLocal(&find) && find->IsFunction())
            {
                return get_cached_function(find.As<v8::Function>());
            }
        }
        return {};
    }

    bool Realm::release_function(ObjectCacheID p_func_id)
    {
        environment_->check_internal_state();
        if (function_bank_.is_valid_index(p_func_id))
        {
            TStrongRef<v8::Function>& strong_ref = function_bank_.get_value(p_func_id);
            if (strong_ref.unref())
            {
                v8::Isolate* isolate = get_isolate();
                v8::HandleScope handle_scope(isolate);
                const size_t r = function_refs_.erase(TWeakRef(isolate, strong_ref.object_));
                jsb_check(r != 0);
                function_bank_.remove_at_checked(p_func_id);
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
                // revert constructed values if error occurred
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
            JSB_LOG(Error, "exception thrown in function:\n%s", (String) exception_info);
            r_error.error = Callable::CallError::CALL_ERROR_INVALID_METHOD;
            return {};
        }

        v8::Local<v8::Value> rval_checked;
        if (!rval.ToLocal(&rval_checked))
        {
            return {};
        }

        Variant rvar;
        if (!Realm::js_to_gd_var(isolate, context, rval_checked, rvar))
        {
            //TODO if a function returns a Promise for godot script callbacks (such as _ready), it's safe to return as nothing without error?
            if (!rval_checked->IsPromise())
            {
                JSB_LOG(Error, "failed to translate returned value");
                r_error.error = Callable::CallError::CALL_ERROR_INVALID_METHOD;
            }
            return {};
        }
        return rvar;
    }

    bool Realm::get_script_default_property_value(ScriptClassID p_gdjs_class_id, const StringName& p_name, Variant& r_val)
    {
        environment_->check_internal_state();
        v8::Isolate* isolate = get_isolate();
        v8::Isolate::Scope isolate_scope(isolate);
        v8::HandleScope handle_scope(isolate);
        v8::Local<v8::Context> context = unwrap();
        v8::Context::Scope context_scope(context);

        ScriptClassInfo& class_info = environment_->get_script_class(p_gdjs_class_id);
        if (const auto& it = class_info.properties.find(p_name))
        {
            v8::Local<v8::Value> instance;
            if (class_info.js_default_object.IsEmpty())
            {
                v8::Local<v8::Object> constructor = class_info.js_class.Get(isolate);
                v8::TryCatch try_catch_run(isolate);
                v8::Local<v8::Value> identifier = jsb_symbol(environment_, CDO);
                v8::MaybeLocal<v8::Value> constructed_value = constructor->CallAsConstructor(context, 1, &identifier);
                if (JavaScriptExceptionInfo exception_info = JavaScriptExceptionInfo(isolate, try_catch_run))
                {
                    JSB_LOG(Error, "something wrong when constructing '%s'\n%s", class_info.js_class_name, (String) exception_info);
                    class_info.js_default_object.Reset(isolate, v8::Null(isolate));
                    return false;
                }
                if (!constructed_value.ToLocal(&instance))
                {
                    JSB_LOG(Error, "bad instance '%s", class_info.js_class_name);
                    class_info.js_default_object.Reset(isolate, v8::Null(isolate));
                    return false;
                }
                class_info.js_default_object.Reset(isolate, instance);
            }
            else
            {
                instance = class_info.js_default_object.Get(isolate);
            }

            if (!instance->IsObject())
            {
                JSB_LOG(Error, "bad instance '%s", class_info.js_class_name);
                return false;
            }

            // try read default value from CDO.
            // pretend nothing's wrong if failed by constructing a default value in-place
            v8::Local<v8::Object> cdo = instance.As<v8::Object>();
            v8::Local<v8::Value> value;
            if (!cdo->Get(context, environment_->get_string_value(p_name)).ToLocal(&value)
                || !js_to_gd_var(isolate, context, value, it->value.type, r_val))
            {
                JSB_LOG(Warning, "failed to get/translate default value of '%s' from CDO", p_name);
                ::jsb::internal::VariantUtil::construct_variant(r_val, it->value.type);
            }
            return true;
        }
        // JSB_LOG(Warning, "unknown property %s", p_name);
        return false;
    }

    bool Realm::get_script_property_value(NativeObjectID p_object_id, const GodotJSPropertyInfo& p_info, Variant& r_val)
    {
        environment_->check_internal_state();
        v8::Isolate* isolate = get_isolate();
        v8::HandleScope handle_scope(isolate);
        if (!this->environment_->objects_.is_valid_index(p_object_id))
        {
            return false;
        }

        Environment* environment = environment_.get();
        v8::Local<v8::Context> context = this->unwrap();
        v8::Context::Scope context_scope(context);
        v8::Local<v8::Object> self = environment->get_object(p_object_id);
        v8::Local<v8::String> name = environment->get_string_value(p_info.name);
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
        environment_->check_internal_state();
        v8::Isolate* isolate = get_isolate();
        v8::HandleScope handle_scope(isolate);
        if (!this->environment_->objects_.is_valid_index(p_object_id))
        {
            return false;
        }

        Environment* environment = environment_.get();
        v8::Local<v8::Context> context = this->unwrap();
        v8::Context::Scope context_scope(context);
        v8::Local<v8::Object> self = environment->get_object(p_object_id);
        v8::Local<v8::String> name = environment->get_string_value(p_info.name);
        v8::Local<v8::Value> value;
        if (!gd_var_to_js(isolate, context, p_val, p_info.type, value))
        {
            return false;
        }

        self->Set(context, name, value).Check();
        return true;
    }

    void Realm::call_prelude(ScriptClassID p_gdjs_class_id, NativeObjectID p_object_id)
    {
        environment_->check_internal_state();
        jsb_check(p_object_id.is_valid());
        jsb_checkf(ClassDB::is_parent_class(environment_->get_script_class(p_gdjs_class_id).native_class_name, jsb_string_name(Node)), "only Node has a prelude call");

        v8::Isolate* isolate = get_isolate();
        v8::Isolate::Scope isolate_scope(isolate);
        v8::HandleScope handle_scope(isolate);
        v8::Local<v8::Context> context = this->unwrap();
        v8::Context::Scope context_scope(context);
        v8::Local<v8::Object> self = environment_->get_object(p_object_id);

        Variant unpacked;
        if (!js_to_gd_var(isolate, context, self, Variant::OBJECT, unpacked) || unpacked.is_null())
        {
            JSB_LOG(Error, "failed to access 'this'");
            return;
        }

        // handle all @onready properties
        v8::Local<v8::Value> val_test;
        if (self->Get(context, jsb_symbol(environment_, ClassImplicitReadyFuncs)).ToLocal(&val_test) && val_test->IsArray())
        {
            v8::Local<v8::Array> collection = val_test.As<v8::Array>();
            const uint32_t len = collection->Length();
            const Node* node = (Node*)(Object*) unpacked;

            for (uint32_t index = 0; index < len; ++index)
            {
                v8::Local<v8::Object> element = collection->Get(context, index).ToLocalChecked().As<v8::Object>();
                v8::Local<v8::String> element_name = element->Get(context, jsb_name(environment_, name)).ToLocalChecked().As<v8::String>();
                v8::Local<v8::Value> element_value = element->Get(context, jsb_name(environment_, evaluator)).ToLocalChecked();

                if (element_value->IsString())
                {
                    const String node_path_str = V8Helper::to_string(isolate, element_value);
                    Node* child_node = node->get_node(node_path_str);
                    if (!child_node)
                    {
                        self->Set(context, element_name, v8::Null(isolate)).Check();
                        return;
                    }
                    v8::Local<v8::Object> child_object;
                    if (!gd_obj_to_js(isolate, context, child_node, child_object))
                    {
                        JSB_LOG(Error, "failed to evaluate onready value for %s", node_path_str);
                        return;
                    }
                    self->Set(context, element_name, child_object).Check();
                }
                else if (element_value->IsFunction())
                {
                    jsb_not_implemented(true, "function evaluator not implemented yet");
                    v8::Local<v8::Value> argv[] = { self };
                    v8::TryCatch try_catch_run(isolate);
                    v8::MaybeLocal<v8::Value> result = element_value.As<v8::Function>()->Call(context, self, std::size(argv), argv);
                    if (JavaScriptExceptionInfo exception_info = JavaScriptExceptionInfo(isolate, try_catch_run))
                    {
                        JSB_LOG(Warning, "something wrong when evaluating onready '%s'\n%s", V8Helper::to_string(isolate, element_name), (String) exception_info);
                        return;
                    }
                    if (!result.IsEmpty())
                    {
                        self->Set(context, element_name, result.ToLocalChecked()).Check();
                    }
                }
            }
        }
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
            v8::Local<v8::Object> self = this->environment_->get_object(p_object_id);
            return _call(isolate, context, js_func.object_.Get(isolate), self, p_args, p_argcount, r_error);
        }

        const TStrongRef<v8::Function>& js_func = function_bank_.get_value(p_func_id);
        jsb_check(js_func);
        return _call(isolate, context, js_func.object_.Get(isolate), v8::Undefined(isolate), p_args, p_argcount, r_error);
    }

    void Realm::get_statistics(Statistics& r_stats) const
    {
#if JSB_WITH_V8
        v8::HeapStatistics v8_statistics;
        environment_->isolate_->GetHeapStatistics(&v8_statistics);

        r_stats.used_global_handles_size = v8_statistics.used_global_handles_size();
        r_stats.total_global_handles_size = v8_statistics.total_global_handles_size();
        r_stats.used_heap_size = v8_statistics.used_heap_size();
        r_stats.total_heap_size = v8_statistics.total_heap_size();
        r_stats.peak_malloced_memory = v8_statistics.peak_malloced_memory();
        r_stats.malloced_memory = v8_statistics.malloced_memory();
        r_stats.external_memory = v8_statistics.external_memory();
#elif JSB_WITH_QUICKJS
        #error not implemented yet
#endif

        r_stats.objects = environment_->objects_.size();
        r_stats.native_classes = environment_->native_classes_.size();
        r_stats.script_classes = environment_->script_classes_.size();
        r_stats.cached_string_names = environment_->string_name_cache_.size();
        r_stats.persistent_objects = environment_->persistent_objects_.size();
        r_stats.allocated_variants = environment_->variant_allocator_.get_allocated_num();
    }

}
