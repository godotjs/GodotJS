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
            set_default_callbacks();
            _print_error(p_func, p_file, p_line, str, true, ERR_HANDLER_ERROR);
        }

        template<ELogSeverity::Type p_severity, typename... TArgs>
        static void warn(const char* p_file, int p_line, const char* p_func, const char* p_format, TArgs... p_args)
        {
            const String str = format(p_format, p_args...);
            IConsoleOutput::internal_write(p_severity, str);
            set_default_callbacks();
            _print_error(p_func, p_file, p_line, str, false, ERR_HANDLER_WARNING);
        }

        template<ELogSeverity::Type p_severity, typename... TArgs>
        static void info(const char* p_file, int p_line, const char* p_func, const char* p_format, TArgs... p_args)
        {
            const String str = format(p_format, p_args...);
            IConsoleOutput::internal_write(p_severity, str);
            set_default_callbacks();
#if JSB_LOG_WITH_SOURCE
            _print_line(format("[%s:%d][%s] %s", simplify_file_name(p_file), p_line, p_func, str));
#else
            _print_line(str);
#endif
        }

        template<ELogSeverity::Type p_severity, typename... TArgs>
        static void verbose(const char* p_file, int p_line, const char* p_func, const char* p_format, TArgs... p_args)
        {
#if !JSB_VERBOSE_ENABLED
            if (OS::get_singleton()->is_stdout_verbose())
#endif
            {
                // all verbose logs write to stdout only
                const String str = format(p_format, p_args...);
                set_default_callbacks();
                _print_verbose(str);
            }
        }

        typedef void (*_print_line_callback)(const String& p_str);
        typedef void (*_print_error_callback)(const char *p_function, const char *p_file, int p_line, const String &p_error, bool p_editor_notify, ErrorHandlerType p_type);

        static void set_callbacks(_print_line_callback verbose_cb, _print_line_callback line_cb, _print_error_callback error_callback)
        {
            jsb_check(line_cb && error_callback);
            _print_verbose = verbose_cb;
            _print_line = line_cb;
            _print_error = error_callback;
        }

    private:
        Logger()
        {
            if (!_print_line) _print_line = _default_print_line;
            if (!_print_verbose) _print_verbose = _default_print_verbose;
            if (!_print_error) _print_error = _default_print_error;
        }

        static void set_default_callbacks() { static Logger logger; jsb_unused(logger); }

        static _print_line_callback _print_line;
        static _print_line_callback _print_verbose;
        static _print_error_callback _print_error;

        static void _default_print_verbose(const String& p_str)
        {
            //TODO cache messages from background threads to avoid messing up the output
            ::OS::get_singleton()->print_rich("\u001b[90m%s\u001b[39m\n", p_str.utf8().get_data());
        }

        static void _default_print_line(const String& p_str)
        {
            //TODO cache messages from background threads to avoid messing up the output
            ::print_line(p_str);
        }

        static void _default_print_error(const char *p_function, const char *p_file, int p_line, const String &p_error, bool p_editor_notify, ErrorHandlerType p_type)
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
