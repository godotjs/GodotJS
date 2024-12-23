#include "jsb_web_catch.h"
#include "jsb_web_isolate.h"
#include "jsb_web_ext.h"

namespace jsb::impl
{
    bool TryCatch::has_caught() const
    {
        return jsbi_HasError(isolate_->rt());
    }

    void TryCatch::get_message(String* r_message, String* r_stacktrace) const
    {
        JSContext* ctx = isolate_->ctx();
        const JSValue ex = isolate_->stack_val(StackBase::Exception);
        jsb_check(!JS_IsNull(ex));

        // const JSValue err_filename = JS_GetProperty(ctx, ex, JS_ATOM_fileName);
        // const JSValue err_line = JS_GetProperty(ctx, ex, JS_ATOM_lineNumber);
        const JSValue err_message = JS_GetProperty(ctx, ex, JS_ATOM_message);
        const JSValue err_stack = JS_GetProperty(ctx, ex, JS_ATOM_stack);

        {
            // const String filename = BrowserJS::IsNullish(err_filename) ? String("native") : BrowserJS::GetString(ctx, err_filename);
            // const String line = BrowserJS::IsNullish(err_line) ? String("") : BrowserJS::GetString(ctx, err_line);
            const String message = BrowserJS::GetString(ctx, err_message);
            const String stack = BrowserJS::GetString(ctx, err_stack);

            if (r_message) *r_message = message;
            if (r_stacktrace) *r_stacktrace = stack;
        }

        // JS_FreeValue(ctx, err_filename);
        // JS_FreeValue(ctx, err_line);
        JS_FreeValue(ctx, err_message);
        JS_FreeValue(ctx, err_stack);

        // reset current exception
        isolate_->set_stack_copy(StackBase::Exception, StackBase::Null);
    }


}
