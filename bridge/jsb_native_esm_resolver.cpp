#include "jsb_native_esm_resolver.h"

#if JSB_NATIVE_ESM && JSB_WITH_V8

#include "jsb_environment.h"

#include "../internal/jsb_path_util.h"

namespace jsb
{
    bool NativeESMModuleResolver::get_source_info(const String& p_module_id, ModuleSourceInfo& r_source_info)
    {
        if (!DefaultModuleResolver::get_source_info(p_module_id, r_source_info))
        {
            return false;
        }
        if (!r_source_info.source_filepath.ends_with("." JSB_MODULE_EXT))
        {
            r_source_info = {};
            return false;
        }
        return true;
    }

    v8::MaybeLocal<v8::Module> NativeESMModuleResolver::resolve_module_callback(
        v8::Local<v8::Context> p_context,
        v8::Local<v8::String> p_specifier,
        v8::Local<v8::FixedArray> /*p_import_attributes*/,
        v8::Local<v8::Module> p_referrer)
    {
        v8::Isolate* isolate = p_context->GetIsolate();
        Environment* env = Environment::wrap(p_context);
        const String specifier = impl::Helper::to_string(isolate, p_specifier);
        const String parent_id = env->find_esm_module_id_by_script_id(p_referrer->ScriptId());

        JavaScriptModule* child = env->_load_module(parent_id, specifier);
        if (!child || child->esm_module.IsEmpty())
        {
            return v8::MaybeLocal<v8::Module>();
        }
        return child->esm_module.Get(isolate);
    }

    bool NativeESMModuleResolver::load(Environment* p_env, const String& p_asset_path, JavaScriptModule& p_module)
    {
        v8::Isolate* isolate = p_env->get_isolate();
        const v8::Local<v8::Context> context = isolate->GetCurrentContext();

        internal::FileAccessSourceReader reader(p_asset_path);
        if (reader.is_null() || reader.get_length() == 0)
        {
            jsb_throw(isolate, "failed to read module source");
            return false;
        }

#if JSB_SUPPORT_RELOAD && defined(TOOLS_ENABLED)
        p_module.time_modified = reader.get_time_modified();
        p_module.hash = reader.get_hash();
#endif

        const uint64_t source_len = reader.get_length();
        Vector<uint8_t> source_bytes;
        source_bytes.resize((int) source_len + 1);
        source_bytes.write[(int) source_len] = 0;
        reader.get_buffer(source_bytes.ptrw(), source_len);

        const v8::Local<v8::String> source_string = v8::String::NewFromUtf8(
            isolate, (const char*) source_bytes.ptr(), v8::NewStringType::kNormal, (int) source_len).ToLocalChecked();
        const v8::Local<v8::String> resource_name = impl::Helper::new_string(isolate, p_asset_path);
        v8::ScriptOrigin origin(
            resource_name,
            /* resource_line_offset */ 0,
            /* resource_column_offset */ 0,
            /* resource_is_shared_cross_origin */ false,
            /* script_id */ -1,
            /* source_map_url */ v8::Local<v8::Value>(),
            /* resource_is_opaque */ false,
            /* is_wasm */ false,
            /* is_module */ true);
        v8::ScriptCompiler::Source script_source(source_string, origin);

        v8::Local<v8::Module> module;
        if (!v8::ScriptCompiler::CompileModule(isolate, &script_source).ToLocal(&module))
        {
            return false;
        }

        // map referrer script_id -> module_id BEFORE InstantiateModule so the resolve callback can find us.
        p_env->register_esm_module_script_id(module->ScriptId(), p_module.id);

        v8::Maybe<bool> instantiated = module->InstantiateModule(context, &resolve_module_callback);
        if (instantiated.IsNothing() || !instantiated.FromJust())
        {
            return false;
        }

        v8::Local<v8::Value> evaluation_result;
        if (!module->Evaluate(context).ToLocal(&evaluation_result))
        {
            return false;
        }

        // drain microtasks so top-level await + the Evaluate() promise settle before we inspect status.
        isolate->PerformMicrotaskCheckpoint();

        if (module->GetStatus() == v8::Module::kErrored)
        {
            isolate->ThrowException(module->GetException());
            return false;
        }

        if (evaluation_result->IsPromise())
        {
            const v8::Local<v8::Promise> promise = evaluation_result.As<v8::Promise>();
            if (promise->State() == v8::Promise::kRejected)
            {
                isolate->ThrowException(promise->Result());
                return false;
            }
        }

        const v8::Local<v8::Value> namespace_value = module->GetModuleNamespace();
        const v8::Local<v8::Object> exports_obj = namespace_value->IsObject()
            ? namespace_value.As<v8::Object>()
            : v8::Object::New(isolate);

        const String dirname = internal::PathUtil::dirname(p_asset_path);
        const v8::Local<v8::Object> module_obj = p_module.module.Get(isolate);
        module_obj->Set(context, jsb_name(p_env, filename), impl::Helper::new_string(isolate, p_asset_path)).Check();
        module_obj->Set(context, jsb_name(p_env, path), impl::Helper::new_string(isolate, dirname)).Check();
        module_obj->Set(context, jsb_name(p_env, exports), exports_obj).Check();

        p_module.exports.Reset(isolate, exports_obj);
        p_module.esm_module.Reset(isolate, module);
        return true;
    }
}

#endif // JSB_NATIVE_ESM && JSB_WITH_V8
