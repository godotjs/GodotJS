#ifndef GODOTJS_TESTS_TEST_HELPERS_H
#define GODOTJS_TESTS_TEST_HELPERS_H

#include "../weaver/jsb_script_language.h"
#include "tests/test_macros.h"

#include <chrono>
#include <thread>

#define JSB_TESTS_EXECUTION_SCOPE(env) const jsb::tests::V8ContextScope JSB_CONCAT(unique_, __COUNTER__)(env)

namespace jsb::tests
{
    struct StubBindings
    {
        static void constructor(const v8::FunctionCallbackInfo<v8::Value>& info)
        {
        }

        static void method(const v8::FunctionCallbackInfo<v8::Value>& info)
        {
        }

        static void function(const v8::FunctionCallbackInfo<v8::Value>& info)
        {
        }
    };

    struct Utils
    {
        static void write_stub_file(const String& p_path)
        {
            if (FileAccess::exists(p_path)) return;
            {
                const Ref<FileAccess> f = FileAccess::open(p_path, FileAccess::WRITE);
                CHECK(f.is_valid());
                f->store_8(0xd);
                f->store_8(0xa);
            }
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
    };

    struct CurrentWorkingDirectory
    {
    private:
        String original_working_dir;

        CurrentWorkingDirectory()
        {
            original_working_dir = DirAccess::get_full_path(".", DirAccess::ACCESS_FILESYSTEM);
            CHECK(!original_working_dir.is_empty());
        }

    public:
        static void reset()
        {
            static CurrentWorkingDirectory env;
            CHECK(OS::get_singleton()->set_cwd(env.original_working_dir) == OK);
        }
    };

    struct V8ContextScope
    {
    private:
        v8::Isolate* isolate_;
        v8::HandleScope handle_scope_;
        v8::Local<v8::Context> context_;
        v8::Context::Scope context_scope_;

    public:
        V8ContextScope(v8::Isolate* isolate)
        : isolate_(isolate)
        , handle_scope_(isolate)
        , context_(isolate->GetCurrentContext())
        , context_scope_(isolate->GetCurrentContext())
        {}

        V8ContextScope(jsb::Environment* env)
        : isolate_(env->get_isolate())
        , handle_scope_(env->get_isolate())
        , context_(env->get_context())
        , context_scope_(env->get_context())
        {}

        ~V8ContextScope() = default;

        operator v8::Isolate*() const { return isolate_; }
    };

    struct GodotJSScriptLanguageIniter
    {
    public:
        GodotJSScriptLanguageIniter() : GodotJSScriptLanguageIniter("modules/" JSB_MODULE_NAME_STRING "/tests/project")
        {
        }

        GodotJSScriptLanguageIniter(const String p_base_path)
        {
            CurrentWorkingDirectory::reset();

            CHECK(ProjectSettings::get_singleton()->setup(p_base_path, String(), true) == OK);
            CHECK(OS::get_singleton()->set_cwd(p_base_path) == OK);
            CHECK(FileAccess::exists("project.godot"));
            // MESSAGE("init GodotJSScriptLanguage on thread ", Thread::get_caller_id());

            install_npm();
            compile_scripts();
            ignore_directories();
            GodotJSScriptLanguage::get_singleton()->init();
        }

        ~GodotJSScriptLanguageIniter()
        {
            GodotJSScriptLanguage::get_singleton()->finish();
        }

    private:
        void install_npm()
        {
            CHECK(FileAccess::exists("./package.json"));
            CHECK(FileAccess::exists("./tsconfig.json"));
            List<String> args;
            args.push_back("install");
            const String exe_path = OS::get_singleton()->get_name() != "Windows" ? "npm" : "npm.cmd";
            const Error err = OS::get_singleton()->create_process(exe_path, args);
            CHECK(err == OK);
        }

        void compile_scripts()
        {
            CHECK(FileAccess::exists("./node_modules/typescript/bin/tsc"));
            CHECK(FileAccess::exists("./test_01.ts"));
            List<String> args;
            args.push_back("./node_modules/typescript/bin/tsc");

            const String exe_path = OS::get_singleton()->get_name() != "Windows" ? "node" : "node.exe";
            const Error err = OS::get_singleton()->create_process(exe_path, args);
            CHECK(err == OK);
			// Wait for 1 second until ./.godot has been created
        	std::this_thread::sleep_for(std::chrono::seconds(1));
            CHECK(FileAccess::exists("./.godot/GodotJS/test_01.js"));
        }

        void ignore_directories()
        {
            CHECK(FileAccess::exists("./jslibs/.gdignore"));
            Utils::write_stub_file("./node_modules/.gdignore");
            Utils::write_stub_file("./.godot/.gdignore");
        }
    };

}
#endif

