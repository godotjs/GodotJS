#ifndef GODOTJS_TESTS_TEST_HELPERS_H
#define GODOTJS_TESTS_TEST_HELPERS_H
#include "../weaver/jsb_script_language.h"

namespace jsb::tests
{
    struct GodotJSScriptLanguageIniter
    {
        GodotJSScriptLanguageIniter() { GodotJSScriptLanguage::get_singleton()->init(); }
        ~GodotJSScriptLanguageIniter() { GodotJSScriptLanguage::get_singleton()->finish(); }
    };
}
#endif

