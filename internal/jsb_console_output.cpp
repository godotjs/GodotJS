#include "jsb_console_output.h"
#include "core/os/thread.h"
#include "core/os/rw_lock.h"

namespace jsb::internal
{
    namespace
    {
        RWLock lock_;
        Vector<IConsoleOutput*> outputs_;
    }

    IConsoleOutput::IConsoleOutput()
    {
        RWLockWrite lock(lock_);
        outputs_.append(this);
    }

    IConsoleOutput::~IConsoleOutput()
    {
        RWLockWrite lock(lock_);
        outputs_.erase(this);
    }

    void IConsoleOutput::internal_write(ELogSeverity::Type p_severity, const String &p_text)
    {
        RWLockRead lock(lock_);
        for (IConsoleOutput* output: outputs_)
        {
            output->write(p_severity, p_text);
        }
    }

}
