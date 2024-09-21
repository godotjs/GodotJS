#include "jsb_class_info.h"
#include "jsb_object_bindings.h"
#include "../internal/jsb_path_util.h"
#include "../weaver/jsb_gdjs_script.h"

namespace jsb
{
#ifdef TOOLS_ENABLED
    void _parse_script_doc(v8::Isolate* isolate, const v8::Local<v8::Context>& context,
        const v8::MaybeLocal<v8::Value> holder, ScriptBaseDoc& r_doc)
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

    void ScriptClassInfo::_newbind(const v8::Local<v8::Object>& p_self)
    {
        const String source_path = internal::PathUtil::convert_javascript_path(module_id);
        Ref<GodotJSScript> script = ResourceLoader::load(source_path);
        if (script.is_valid())
        {
            jsb_unused(script->can_instantiate()); // make it loaded immediately
            const ScriptInstance* script_instance = script->instance_create(p_self);
            jsb_check(script_instance);
        }
    }

    void ScriptClassInfo::_parse_script_class(const v8::Local<v8::Context>& p_context, JavaScriptModule& p_module)
    {
        // only classes in files of godot package system could be used as godot js script
        if (!p_module.path.begins_with("res://") || p_module.exports.IsEmpty())
        {
            return;
        }
        v8::Isolate* isolate = p_context->GetIsolate();
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
            existed_class_info->flags = ScriptClassFlags::None;
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
        _parse_script_class_iterate(p_context, *existed_class_info);
    }

    void ScriptClassInfo::_parse_script_class_iterate(const v8::Local<v8::Context>& p_context, ScriptClassInfo& p_class_info)
    {
        v8::Isolate* isolate = p_context->GetIsolate();
        Environment* environment = Environment::wrap(isolate);

        //TODO get rid of private access
        jsb_address_guard(environment->script_classes_, godotjs_classes_address_guard);

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
                        ScriptMethodInfo method_info = {};
#ifdef TOOLS_ENABLED
                        if (v8::Local<v8::Value> val; doc_map->Get(p_context, prop_name).ToLocal(&val) && val->IsObject())
                        {
                            _parse_script_doc(isolate, p_context, val, method_info.doc);
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
                p_class_info.flags = (ScriptClassFlags::Type) (p_class_info.flags | ScriptClassFlags::Tool);
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
                    const StringNameID string_id = environment->get_string_name_cache().get_string_id(signal);
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
                    ScriptPropertyInfo property_info;
                    v8::Local<v8::Value> prop_name = obj->Get(context, jsb_name(environment, name)).ToLocalChecked();
                    property_info.name = V8Helper::to_string(isolate, prop_name); // string
                    property_info.type = (Variant::Type) obj->Get(context, jsb_name(environment, type)).ToLocalChecked()->Int32Value(context).ToChecked(); // int
                    property_info.hint = V8Helper::to_enum<PropertyHint>(context, obj->Get(context, jsb_name(environment, hint)), PROPERTY_HINT_NONE);
                    property_info.hint_string = V8Helper::to_string(isolate, obj->Get(context, jsb_name(environment, hint_string)).ToLocalChecked());
                    property_info.usage = V8Helper::to_enum<PropertyUsageFlags>(context, obj->Get(context, jsb_name(environment, usage)), PROPERTY_USAGE_DEFAULT);
#ifdef TOOLS_ENABLED
                    if (v8::Local<v8::Value> val; doc_map->Get(p_context, prop_name).ToLocal(&val) && val->IsObject())
                    {
                        _parse_script_doc(isolate, p_context, val, property_info.doc);
                    }
#endif // TOOLS_ENABLED
                    p_class_info.properties.insert(property_info.name, property_info);
                    JSB_LOG(VeryVerbose, "... property %s: %s", property_info.name, Variant::get_type_name(property_info.type));
                }
            }
        }
    }

}
