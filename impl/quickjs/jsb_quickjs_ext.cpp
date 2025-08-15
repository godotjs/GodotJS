#include "jsb_quickjs_ext.h"

namespace jsb::impl
{
    JSValue QuickJS::NoopCallback(JSContext* _ctx, JSValueConst _this_val, int _argc, JSValueConst* _argv) {
        return JS_UNDEFINED;
    }

}
