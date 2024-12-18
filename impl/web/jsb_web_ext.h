#ifndef GODOTJS_WEB_EXT_H
#define GODOTJS_WEB_EXT_H
#include "jsb_web_pch.h"

namespace v8
{
    class Isolate;
}

namespace jsb::impl
{
    class BrowserJS
    {
    public:
        struct Atom
        {
        private:
            JSRuntime ctx_;
            JSAtom atom_;

        public:
            Atom(JSRuntime ctx, StackPosition value_sp)
                : ctx_(ctx), atom_(jsbi_NewAtom(ctx, value_sp))
            {
            }

            ~Atom()
            {
                jsbi_FreeAtom(ctx_, atom_);
            }

            operator JSAtom() const { return atom_; }
        };

        static String GetString(JSRuntime ctx, StackPosition value_sp)
        {
            int32_t len;
            char* str = jsbi_ToCStringLen(ctx, &len, value_sp);
            String rval = String::utf8(str, (int) len);
            memfree(str);
            return rval;
        }
    };
}
#endif
