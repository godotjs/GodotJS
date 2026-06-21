#ifndef GODOTJS_TESTS_JSB_ESM_RUNTIME_H
#define GODOTJS_TESTS_JSB_ESM_RUNTIME_H

#include "jsb_test_helpers.h"

#if JSB_NATIVE_ESM && JSB_WITH_V8

namespace jsb::tests
{
    TEST_CASE("[jsb]esm load native esm module")
    {
        GodotJSScriptLanguageIniter initer;
        const std::shared_ptr<jsb::Environment> env = GodotJSScriptLanguage::get_singleton()->get_environment();

        JSB_TESTS_EXECUTION_SCOPE(env.get());
        JavaScriptModule* mod = nullptr;
        CHECK(env->load("tests/esm/entry", &mod) == OK);
        CHECK(mod != nullptr);
        CHECK(!mod->esm_module.IsEmpty());
    }
}

#endif // JSB_NATIVE_ESM && JSB_WITH_V8

#endif
