#ifndef GODOTJS_DEBUGGER_H
#define GODOTJS_DEBUGGER_H
#include "jsb_pch.h"

#if JSB_WITH_DEBUGGER
namespace jsb
{
    class JavaScriptDebugger
    {
    public:
        ~JavaScriptDebugger() {}

        void init(v8::Isolate* p_isolate, uint16_t p_port);
        void update();
        void drop();

    protected:
        void on_context_created(const v8::Local<v8::Context>& p_context);
        void on_context_destroyed(const v8::Local<v8::Context>& p_context);

        std::unique_ptr<class JavaScriptDebuggerImpl> impl;

        friend class Realm;
        friend class Environment;
    };
}
#endif // JSB_WITH_DEBUGGER

#endif
