#ifndef GODOTJS_LOGGER_H
#define GODOTJS_LOGGER_H

#include "jsb_internal_pch.h"

#include "jsb_log_severity.h"
#include "jsb_console_output.h"
#include "jsb_format.h"

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
            _print_error(p_func, p_file, p_line, str, true, ERR_HANDLER_ERROR);
        }

        template<ELogSeverity::Type p_severity, typename... TArgs>
        static void warn(const char* p_file, int p_line, const char* p_func, const char* p_format, TArgs... p_args)
        {
            const String str = format(p_format, p_args...);
            IConsoleOutput::internal_write(p_severity, str);
            _print_error(p_func, p_file, p_line, str, false, ERR_HANDLER_WARNING);
        }

        template<ELogSeverity::Type p_severity, typename... TArgs>
        static void info(const char* p_file, int p_line, const char* p_func, const char* p_format, TArgs... p_args)
        {
            const String str = format(p_format, p_args...);
            IConsoleOutput::internal_write(p_severity, str);
#if JSB_LOG_WITH_SOURCE
            _print_line(format("[%s:%d][%s] %s", simplify_file_name(p_file), p_line, p_func, str));
#else
            _print_line(str);
#endif
        }

        template<ELogSeverity::Type p_severity, typename... TArgs>
        static void verbose(const char* p_file, int p_line, const char* p_func, const char* p_format, TArgs... p_args)
        {
            if (OS::get_singleton()->is_stdout_verbose())
            {
                // all verbose logs write to stdout only
                const String str = format(p_format, p_args...);
                _print_verbose(str);
            }
        }

        Logger() = delete;

    private:
        static void _print_verbose(const String& p_str)
        {
            //TODO cache messages from background threads to avoid messing up the output
            ::OS::get_singleton()->print_rich("\u001b[90m%s\u001b[39m\n", p_str.utf8().get_data());
        }

        static void _print_line(const String& p_str)
        {
            //TODO cache messages from background threads to avoid messing up the output
            ::print_line(p_str);
        }

        static void _print_error(const char *p_function, const char *p_file, int p_line, const String &p_error, bool p_editor_notify, ErrorHandlerType p_type)
        {
            //TODO cache messages from background threads to avoid messing up the output
            ::_err_print_error(p_function, p_file, p_line, p_error, p_editor_notify, p_type);
        }

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
