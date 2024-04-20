#ifndef JAVASCRIPT_RUNTIME_H
#define JAVASCRIPT_RUNTIME_H

#include "jsb_helpers.h"
#include "jsb_pch.h"

namespace jsb
{
    class Environment : public JavaScriptHelpers
    {
    public:
        Environment();
        ~Environment();

        void bootstrap();
        void shutdown();

        void register_builtins();

        Error eval(const char* p_source, size_t p_source_len, const char* p_filename);

        Error eval_string(const String& p_text)
        {
            const Vector<uint8_t>& p_source = p_text.to_utf8_buffer();
            const char* source = (const char*)p_source.ptr();
            const size_t len = p_source.size();
            return eval(source, len, "eval");
        }

        Error eval_file(const String& p_path)
        {
            Error err;
            const Vector<uint8_t>& source = FileAccess::get_file_as_bytes(p_path, &err);
            const CharString& cs_path = p_path.utf8();
            return err == OK ? eval((const char*)source.ptr(), source.size(), cs_path.ptr()) : err;
        }

        // load a script (as module)
        void load(const String& p_name);

        void update();

    private:
        friend class BuiltinFunctions;
        friend class SourceModuleResolver;

        //TODO only for dev
        JSContext* get_context() const;

        struct SourceReference
        {
            // relative path for file system
            // also used as module_id
            String path;

            // fullpath if available
            String filename;
        };

        enum EJSRuntimeState
        {
            RS_NONE,
            RS_INITED,
        };
        static void _finalizer(JSRuntime *rt, JSValue val);

        bool try_get_module_object(const String& p_module_id, JSValue& o_module_object);
        JSValue create_module_object(const String& p_module_id, const String& p_filename);
        JSValue resolve_module(const String& p_name, int p_parent_module_index);
        bool resolve_file(const String& p_filename, String& o_entry);

        bool is_reloading(const String& p_module_id);
        JSAtom key_for(const String& p_name);
        JSValue create_require_func(const String& p_module_id);

        //TODO
        void dump_exception(const JSValue &p_exception);

        bool _resolve(const String& p_parent_id, const String& p_name, SourceReference& o_source_reference);
        bool _load(JSValue p_module_object, const String& p_parent_id, const SourceReference& p_source_reference);
        bool _reload(JSValue p_module_object, const SourceReference& p_source_reference);

        EJSRuntimeState state;
        Vector<String> module_index;
        HashMap<String, JSAtom> cached_names;

        JSRuntime* rt;
        JSContext* ctx;

        JSValue _main_module;
        JSValue _module_cache;

#pragma push_macro("DEF")
#undef DEF
#define DEF(FieldName) JSAtom JS_ATOM_##FieldName;
#include "jsb_preallocated_atoms.h"
#pragma pop_macro("DEF")

    };
}
#endif
