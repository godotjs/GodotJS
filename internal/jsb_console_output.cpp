#include "jsb_console_output.h"
#include "core/os/thread.h"

namespace jsb::internal
{
    //TODO thread-safety issue on outputs_
    namespace { Vector<IConsoleOutput*> outputs_; }

    IConsoleOutput::IConsoleOutput()
    {
        // jsb_check(Thread::is_main_thread());
        outputs_.append(this);
    }

    IConsoleOutput::~IConsoleOutput()
    {
        // jsb_check(Thread::is_main_thread());
        outputs_.erase(this);
    }

    void IConsoleOutput::internal_write(ELogSeverity::Type p_severity, const String &p_text)
    {
        if (!Thread::is_main_thread())
        {
            return;
        }

        for (IConsoleOutput* output: outputs_)
        {
            output->write(p_severity, p_text);
        }
    }

}
