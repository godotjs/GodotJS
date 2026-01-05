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
        const JSRuntime ctx = isolate_->rt();
        jsb_check(!jsbi_IsNullOrUndefined(ctx, StackBase::Error));

        const StackPosition err_message = jsbi_GetPropertyAtomID(ctx, StackBase::Error, JS_ATOM_message);
        const StackPosition err_stack = jsbi_GetPropertyAtomID(ctx, StackBase::Error, JS_ATOM_stack);

        {
            const String message = BrowserJS::GetString(ctx, err_message);
            const String stack = BrowserJS::GetString(ctx, err_stack);

            if (r_message) *r_message = message;
            if (r_stacktrace) *r_stacktrace = stack;
        }

        // reset current exception
        jsbi_StackSet(ctx, StackBase::Error, StackBase::Undefined);
    }


} // namespace jsb::impl
