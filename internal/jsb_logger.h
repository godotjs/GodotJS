#ifndef GODOTJS_LOGGER_H
#define GODOTJS_LOGGER_H

#include "core/os/os.h"
#include "core/variant/variant.h"

#include "../jsb.config.h"

#include "jsb_log_severity.h"
#include "jsb_console_output.h"

namespace jsb::internal
{
    class Logger
    {
    public:
        template<ELogSeverity::Type p_severity, typename... TArgs>
        static void error(const char* p_file, int p_line, const char* p_func, const char* p_format, TArgs... p_args)
        {
            const String str = format(p_format, p_args...);
            IConsoleOutput::internal_write(p_severity, str);
            _err_print_error(p_func, p_file, p_line, str, true, ERR_HANDLER_ERROR);
        }

        template<ELogSeverity::Type p_severity, typename... TArgs>
        static void warn(const char* p_file, int p_line, const char* p_func, const char* p_format, TArgs... p_args)
        {
            const String str = format(p_format, p_args...);
            IConsoleOutput::internal_write(p_severity, str);
            _err_print_error(p_func, p_file, p_line, str, false, ERR_HANDLER_WARNING);
        }

        template<ELogSeverity::Type p_severity, typename... TArgs>
        static void info(const char* p_file, int p_line, const char* p_func, const char* p_format, TArgs... p_args)
        {
            const String str = format(p_format, p_args...);
            IConsoleOutput::internal_write(p_severity, str);
#if JSB_LOG_WITH_SOURCE
            ::print_line(format("[%s:%d][%s] %s", simplify_file_name(p_file), p_line, p_func, str));
#else
            ::print_line(str);
#endif
        }

        template<ELogSeverity::Type p_severity, typename... TArgs>
        static void verbose(const char* p_file, int p_line, const char* p_func, const char* p_format, TArgs... p_args)
        {
            if (OS::get_singleton()->is_stdout_verbose())
            {
                // all verbose logs write to stdout only
                const String str = format(p_format, p_args...);
                OS::get_singleton()->print_rich("\u001b[90m%s\u001b[39m\n", str.utf8().get_data());
            }
        }

        Logger() = delete;

    private:
        // pick up only the last component of the path for clarity
        static const char* simplify_file_name(const char* p_path)
        {
            const char* file_name = p_path;
            while (const char ch = *p_path++) if (ch == '\\' || ch == '/') file_name = p_path;
            return file_name;
        }
    };
}
#endif
