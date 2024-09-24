#ifndef GODOTJS_DEBUGGER_H
#define GODOTJS_DEBUGGER_H
#include "jsb_bridge_pch.h"

#if JSB_WITH_DEBUGGER
namespace jsb
{
    class Environment;

    class JavaScriptDebugger
    {
    public:
        JavaScriptDebugger();
        ~JavaScriptDebugger();

        void init(v8::Isolate* p_isolate, uint16_t p_port);
        void update();
        void drop();

    protected:
        void on_context_created(const v8::Local<v8::Context>& p_context);
        void on_context_destroyed(const v8::Local<v8::Context>& p_context);

        class JavaScriptDebuggerImpl* impl;

        friend class Environment;
    };
}
#endif // JSB_WITH_DEBUGGER

#endif
