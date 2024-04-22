#ifndef GODOTJS_TIMER_ACTION_H
#define GODOTJS_TIMER_ACTION_H

#include "jsb_pch.h"

namespace jsb
{
    struct JavaScriptTimerAction
    {
        jsb_force_inline JavaScriptTimerAction() = default;

        jsb_force_inline JavaScriptTimerAction(v8::Global<v8::Function>&& p_func, int p_argc) : function_(std::move(p_func)), argc_(p_argc)
        {
            if (p_argc > 0)
            {
                //NOTE unsafe
                argv_ = (v8::Global<v8::Value>*) memalloc(sizeof(v8::Global<v8::Value>) * p_argc);
                memset((void*) argv_, 0, sizeof(v8::Global<v8::Value>) * p_argc);
            }
            else
            {
                argv_ = nullptr;
            }
        }

        jsb_force_inline ~JavaScriptTimerAction()
        {
            if (argc_ > 0)
            {
                //NOTE unsafe
                for (int index = 0 ; index < argc_; ++index)
                {
                    argv_[index].Reset();
                }
                memfree(argv_);
            }
            function_.Reset();
        }

        jsb_force_inline JavaScriptTimerAction(JavaScriptTimerAction&& p_other) noexcept
            : function_(std::move(p_other.function_)), argc_(p_other.argc_), argv_(p_other.argv_)
        {
            p_other.argc_ = 0;
        }

        jsb_force_inline JavaScriptTimerAction& operator=(JavaScriptTimerAction&& p_other) noexcept
        {
            function_ = std::move(p_other.function_);
            argc_ = p_other.argc_;
            argv_ = p_other.argv_;
            p_other.argc_ = 0;
            return *this;
        }

        jsb_force_inline bool operator!() const { return function_.IsEmpty(); }

        jsb_force_inline void store(int index, v8::Global<v8::Value>&& value)
        {
            jsb_check(index >= 0 && index < argc_);
            argv_[index] = std::move(value);
        }

        void operator()(v8::Isolate* isolate);

    private:
        v8::Global<v8::Function> function_;
        int argc_;
        v8::Global<v8::Value>* argv_;
    };
}
#endif
