#include "jsb_console_output.h"

namespace jsb::internal
{
    namespace
    {
        RWLock lock_;
        Vector<IConsoleOutput*> outputs_;
    } // namespace

    IConsoleOutput::IConsoleOutput()
    {
        RWLockWrite lock(lock_);
        outputs_.append(this);
    }

    IConsoleOutput::~IConsoleOutput()
    {
        remove_from_output_list();
    }

    void IConsoleOutput::remove_from_output_list()
    {
        RWLockWrite lock(lock_);
        outputs_.erase(this);
    }

    void IConsoleOutput::internal_write(ELogSeverity::Type p_severity, const String& p_text)
    {
        RWLockRead lock(lock_);
        for (IConsoleOutput* output : outputs_)
        {
            output->write(p_severity, p_text);
        }
    }

} // namespace jsb::internal
