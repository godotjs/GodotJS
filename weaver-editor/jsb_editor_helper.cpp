#include "jsb_editor_helper.h"

#include "../../bridge/jsb_callable.h"
#include "../../bridge/jsb_type_convert.h"
#include "../../weaver/jsb_script.h"

#include "editor/gui/editor_toaster.h"
#include "scene/resources/packed_scene.h"

// The following enums must be kept in sync with jsb.editor.codegen.ts
enum class CodeGenType {
    ScriptNodeTypeDescriptor,
};
enum class DescriptorType {
    Godot,
    User,
    FunctionLiteral,
    ObjectLiteral,
    StringLiteral,
    NumericLiteral,
    BooleanLiteral,
    Union,
    Intersection,
    Conditional,
    Tuple,
    Infer,
    Mapped
};

Dictionary GodotJSEditorHelper::_build_node_type_descriptor(jsb::JSEnvironment& p_env, Node *node)
{
    Dictionary children;
    int child_count = node->get_child_count(true);

    for (int i = 0; i < child_count; i++)
    {
        Node* child = node->get_child(i, true);
        children[child->get_name()] = _build_node_type_descriptor(p_env, child);
    }

    ScriptInstance* script_instance = node->get_script_instance();
    GodotJSScript* script = script_instance ? Object::cast_to<GodotJSScript>(*script_instance->get_script()) : nullptr;

    if (script)
    {
        v8::Isolate* isolate = p_env->get_isolate();
        v8::Local<v8::Context> context = p_env->get_context();

        script->load_module_if_missing();
        String module_id = script->get_module_id();
        jsb::JavaScriptModule* module = p_env->get_module_cache().find(module_id);

        if (module == nullptr)
        {
            JSB_LOG(Warning, "Codegen failed to load module '%s'.", module_id);
        }

        v8::Local<v8::Value> module_exports;

        if (module != nullptr && !module->exports.IsEmpty())
        {
            module_exports = module->exports.Get(isolate);
        }

        if (!module_exports.IsEmpty() && module_exports->IsObject())
        {
            const v8::Local<v8::Value> codegen_func_val = module_exports.As<v8::Object>()->Get(context, jsb_name(p_env, codegen)).ToLocalChecked();

            if (!codegen_func_val.IsEmpty() && codegen_func_val->IsFunction())
            {
                const v8::Local<v8::Function> codegen_func = codegen_func_val.As<v8::Function>();

                Dictionary codegen_request;
                codegen_request[jsb_string_name(type)] = (int32_t) CodeGenType::ScriptNodeTypeDescriptor;
                codegen_request[jsb_string_name(node)] = node;
                codegen_request[jsb_string_name(children)] = children;

                v8::Local<v8::Value> codegen_request_val;

                if (jsb::TypeConvert::gd_var_to_js(isolate, context, codegen_request, codegen_request_val))
                {
                    v8::Local<v8::Value> argv[] = { codegen_request_val };

                    const v8::MaybeLocal<v8::Value> maybe_result = codegen_func->Call(context, v8::Undefined(isolate), std::size(argv), argv);
                    v8::Local<v8::Value> result_val;
                    Variant result;

                    if (maybe_result.ToLocal(&result_val) && jsb::TypeConvert::js_to_gd_var(isolate, context, result_val, Variant::Type::DICTIONARY, result))
                    {
                        return result;
                    }
                }
            }
        }
    }

    Dictionary object_literal;
    object_literal[jsb_string_name(type)] = (int32_t) DescriptorType::ObjectLiteral;
    object_literal[jsb_string_name(properties)] = children;

    Array generic_arguments;
    generic_arguments.push_back(object_literal);

    Dictionary default_descriptor;
    default_descriptor[jsb_string_name(name)] = node->get_class_name();
    default_descriptor[jsb_string_name(type)] = (int32_t) DescriptorType::Godot;
    default_descriptor[jsb_string_name(arguments)] = generic_arguments;

    return default_descriptor;
}

// Similar logic to EditorNode::_dialog_display_load_error.
void GodotJSEditorHelper::_log_scene_load_error(const String& p_file, Error p_error)
{
    if (p_error)
    {
        switch (p_error)
        {
            case ERR_CANT_OPEN:
            {
                JSB_LOG(Error, "Can't open file '%s'. The file could have been moved or deleted.", p_file.get_file());
                break;
            }
            case ERR_PARSE_ERROR:
            {
                JSB_LOG(Error, "Error while parsing file '%s'.", p_file.get_file());
                break;
            }
            case ERR_FILE_CORRUPT:
            {
                JSB_LOG(Error, "Scene file '%s' appears to be invalid/corrupt.", p_file.get_file());
                break;
            }
            case ERR_FILE_NOT_FOUND:
            {
                JSB_LOG(Error, "Missing file '%s' or one of its dependencies.", p_file.get_file());
                break;
            }
            case ERR_FILE_UNRECOGNIZED:
            {
                JSB_LOG(Error, "File '%s' is saved in a format that is newer than the formats supported by this version of Godot, so it can't be opened.", p_file.get_file());
                break;
            }
            default:
            {
                JSB_LOG(Error, "Error while loading file '%s'.", p_file.get_file());
                break;
            }
        }
    }
}

void GodotJSEditorHelper::_bind_methods()
{
    ClassDB::bind_static_method(jsb_typename(GodotJSEditorHelper), D_METHOD("show_toast", "text", "severity"), &GodotJSEditorHelper::show_toast);
    ClassDB::bind_static_method(jsb_typename(GodotJSEditorHelper), D_METHOD("get_scene_nodes", "scene_path"), &GodotJSEditorHelper::get_scene_nodes);
}

Dictionary GodotJSEditorHelper::get_scene_nodes(const String& p_path)
{
    Error err;
    Ref<PackedScene> scene_data = ResourceLoader::load(p_path, "", ResourceFormatLoader::CACHE_MODE_REPLACE, &err);

    if (scene_data.is_null())
    {
        _log_scene_load_error(p_path, err);
        return Dictionary();
    }

    Node* instantiated_scene = scene_data->instantiate(PackedScene::GEN_EDIT_STATE_INSTANCE);

    if (!instantiated_scene)
    {
        JSB_LOG(Error, "Error instantiating scene from %s", p_path);
        return Dictionary();
    }

    jsb::JSEnvironment env(instantiated_scene->get_scene_file_path(), true);
    v8::Isolate* isolate = env->get_isolate();
    v8::HandleScope handle_scope(isolate);

    Dictionary nodes;
    int child_count = instantiated_scene->get_child_count(true);

    for (int i = 0; i < child_count; i++)
    {
        Node *child = instantiated_scene->get_child(i, true);
        nodes[child->get_name()] = _build_node_type_descriptor(env, child);
    }

    instantiated_scene->queue_free();

    return nodes;
}

void GodotJSEditorHelper::show_toast(const String& p_text, int p_severity)
{
    EditorToaster::get_singleton()->popup_str(p_text, (EditorToaster::Severity) p_severity);
}
