#include "jsb_console_output.h"

namespace jsb::internal
{
    namespace { Vector<IConsoleOutput*> outputs_; }

    IConsoleOutput::IConsoleOutput()
    {
        outputs_.append(this);
    }

    IConsoleOutput::~IConsoleOutput()
    {
        outputs_.erase(this);
    }

    void IConsoleOutput::internal_write(ELogSeverity::Type p_severity, const String &p_text)
    {
        for (IConsoleOutput* output: outputs_)
        {
            output->write(p_severity, p_text);
        }
    }

}
