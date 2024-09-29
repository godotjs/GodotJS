#ifndef GODOTJS_WEB_HANDLE_SCOPE_H
#define GODOTJS_WEB_HANDLE_SCOPE_H

namespace v8
{
    class Isolate;

    class HandleScope
    {
    public:
        Isolate* isolate_;
        HandleScope* last_;
        int stack_;
        bool is_native_;

        HandleScope(Isolate* isolate);
        HandleScope(Isolate* isolate, int stack);
        ~HandleScope();
    };
}
#endif
