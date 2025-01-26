#include "jsb_jsc_catch.h"
#include "jsb_jsc_isolate.h"
#include "jsb_jsc_ext.h"

namespace jsb::impl
{
    bool TryCatch::has_caught() const
    {
        return isolate_->_HasError();
    }

    void TryCatch::get_message(String* r_message, String* r_stacktrace) const
    {
        const JSContextRef ctx = isolate_->ctx();
        const JSValueRef ex = isolate_->_GetError();
        jsb_check(!JSValueIsUndefined(ctx, ex));

        JSValueProtect(ctx, ex);
        if (JSValueIsObject(ctx, ex))
        {
            const JSObjectRef obj = JavaScriptCore::AsObject(ctx, ex);
            const JSValueRef err_message = isolate_->_GetProperty(obj, JS_ATOM_message);
            const JSValueRef err_stack = isolate_->_GetProperty(obj, JS_ATOM_stack);

            {
                // const String filename = JavaScriptCore::IsNullish(err_filename) ? String("native") : JavaScriptCore::GetString(ctx, err_filename);
                // const String line = JavaScriptCore::IsNullish(err_line) ? String("") : JavaScriptCore::GetString(ctx, err_line);
                const String message = JavaScriptCore::GetString(ctx, err_message);
                const String stack = JavaScriptCore::GetString(ctx, err_stack);

                if (r_message) *r_message = message;
                if (r_stacktrace) *r_stacktrace = stack;
            }
        }
        else
        {
            JSB_LOG(Error, "the thrown exception is not an Object");
        }
        JSValueUnprotect(ctx, ex);
    }


}
