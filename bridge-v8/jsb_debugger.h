#ifndef JAVASCRIPT_DEBUGGER_H
#define JAVASCRIPT_DEBUGGER_H
#include "jsb_pch.h"

#if JSB_WITH_DEBUGGER
namespace jsb
{
    class JavaScriptDebugger
    {
    public:
        virtual ~JavaScriptDebugger() {}

        virtual void update() = 0;

        static std::unique_ptr<JavaScriptDebugger> create(v8::Isolate* p_isolate, uint16_t p_port);

    protected:
        virtual void on_context_created(const v8::Local<v8::Context>& p_context) = 0;
        virtual void on_context_destroyed(const v8::Local<v8::Context>& p_context) = 0;

        friend class Realm;
        friend class Environment;
    };
}
#endif

#endif
