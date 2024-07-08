#include "jsb_process.h"

#include "jsb_path_util.h"

#if defined(WINDOWS_ENABLED)
#define WIN32_LEAN_AND_MEAN
#include <dwrite.h>
#include <dwrite_2.h>
#include <windows.h>
#include <windowsx.h>
#endif

namespace jsb::internal
{
#if defined(WINDOWS_ENABLED)
    class ProcessImpl : public Process
    {
        struct ProcessInfo {
            STARTUPINFO si;
            PROCESS_INFORMATION pi;
        } pi = {};

        String proc_name;
        HANDLE rd_pipe = nullptr;
        Vector<char> rd_line;
		Thread thread;
        volatile bool is_closing = false;
        // int bytes_in_buffer = 0;

        // OS::ProcessID pid = 0;
        // HANDLE pipe[] = { nullptr, nullptr };
    public:
        ProcessImpl(): Process()
        {
        }

        String _quote_command_line_argument(const String &p_text) const {
            for (int i = 0; i < p_text.size(); i++) {
                char32_t c = p_text[i];
                if (c == ' ' || c == '&' || c == '(' || c == ')' || c == '[' || c == ']' || c == '{' || c == '}' || c == '^' || c == '=' || c == ';' || c == '!' || c == '\'' || c == '+' || c == ',' || c == '`' || c == '~') {
                    return "\"" + p_text + "\"";
                }
            }
            return p_text;
        }

        void _flush()
        {
            if (rd_line.is_empty()) return;

            // Try to convert from default ANSI code page to Unicode.
            LocalVector<wchar_t> buffer;
            const int num = MultiByteToWideChar(CP_ACP, 0, rd_line.ptr(), rd_line.size(), nullptr, 0);
            if (num > 0)
            {
                buffer.resize(num);
                if (MultiByteToWideChar(CP_ACP, 0, rd_line.ptr(), rd_line.size(), buffer.ptr(), num) == 0)
                {
                    buffer.clear();
                }
            }

            const String output = buffer.is_empty() ? String::utf8(rd_line.ptr(), rd_line.size()) : String(buffer.ptr(), num);
            if (!output.is_empty())
            {
                Logger::output<ELogSeverity::Log>(__FILE__, __LINE__, __FUNCTION__, "[%s] %s", proc_name, output);
            }
            rd_line.clear();
        }

        virtual Error on_start(const String& p_name, const String& p_path, const List<String>& p_arguments) override
        {
            const String path = p_path.replace("/", "\\");
            String command = _quote_command_line_argument(path);
	        HANDLE pipe[2] = { nullptr, nullptr };
            for (const String &E : p_arguments)
            {
                command += " " + _quote_command_line_argument(E);
            }

            // ProcessInfo pi;
            ZeroMemory(&pi.si, sizeof(pi.si));
            pi.si.cb = sizeof(pi.si);
            ZeroMemory(&pi.pi, sizeof(pi.pi));
            LPSTARTUPINFOW si_w = (LPSTARTUPINFOW)&pi.si;

            {
                SECURITY_ATTRIBUTES sa;
                sa.nLength = sizeof(SECURITY_ATTRIBUTES);
                sa.bInheritHandle = true;
                sa.lpSecurityDescriptor = nullptr;

                ERR_FAIL_COND_V(!CreatePipe(&pipe[0], &pipe[1], &sa, 0), ERR_CANT_FORK);
                ERR_FAIL_COND_V(!SetHandleInformation(pipe[0], HANDLE_FLAG_INHERIT, 0), ERR_CANT_FORK); // Read handle is for host process only and should not be inherited.

                pi.si.dwFlags |= STARTF_USESTDHANDLES;
                pi.si.hStdOutput = pipe[1];
                pi.si.hStdError = pipe[1];
            }
            // constexpr DWORD creation_flags = IDLE_PRIORITY_CLASS | CREATE_NO_WINDOW;
            constexpr DWORD creation_flags = NORMAL_PRIORITY_CLASS | CREATE_NO_WINDOW;
            int ret = CreateProcessW(nullptr, (LPWSTR)(command.utf16().ptrw()), nullptr, nullptr, true, creation_flags, nullptr, nullptr, si_w, &pi.pi);
            if (!ret)
            {
                CloseHandle(pipe[0]); // Cleanup pipe handles.
                CloseHandle(pipe[1]);
            }
	        ERR_FAIL_COND_V_MSG(ret == 0, ERR_CANT_FORK, "Could not create child process: " + command);
            CloseHandle(pipe[1]);
            rd_pipe = pipe[0];
            proc_name = p_name;
            {
                //TODO use async io instead of threading
                Thread::Settings settings;
                settings.priority = Thread::PRIORITY_LOW;
                thread.set_name(proc_name);
                thread.start(&ProcessImpl::_thread_run, this, settings);
            }
            return OK;
        }

        static void _thread_run(void* p_userdata)
        {
            ProcessImpl* impl = (ProcessImpl*) p_userdata;
            int start_state = 0;
            char buffer[4096];

            while (!impl->is_closing)
            {
                // Read StdOut and StdErr from pipe.
                DWORD read;
                if (!ReadFile(impl->rd_pipe, (LPVOID) buffer, std::size(buffer), &read, NULL))
                {
                    break;
                }

                // Assume that all possible encodings are ASCII-compatible.
                // Break at newline to allow receiving long output in portions.
                for (DWORD i = 0; i < read; ++i)
                {
                    if (start_state == 0)
                    {
                        if (buffer[i] == '\x1b') { start_state = 1; continue; }
                        start_state = 2;
                    }
                    else if (start_state == 1)
                    {
                        start_state = 2;
                        if (buffer[i] == 'c')  { continue; }
                    }

                    if (buffer[i] == '\n' || buffer[i] == '\r')
                    {
                        impl->_flush();
                        start_state = 0;
                    }
                    else
                    {
                        impl->rd_line.push_back(buffer[i]);
                    }
                }
            }
            Logger::output<ELogSeverity::Verbose>(__FILE__, __LINE__, __FUNCTION__, "[%s] closed", impl->proc_name);
        }

        virtual bool _is_running() const override
        {
            if (is_closing || pi.pi.hProcess == nullptr)
            {
                return false;
            }
            DWORD dw_exit_code = 0;
            if (!GetExitCodeProcess(pi.pi.hProcess, &dw_exit_code))
            {
                return false;
            }
            if (dw_exit_code != STILL_ACTIVE)
            {
                return false;
            }
            return true;
        }

        virtual void on_stop() override
        {
            is_closing = true;
            Logger::output<ELogSeverity::Verbose>(__FILE__, __LINE__, __FUNCTION__, "[%s] terminating...", proc_name);
            TerminateProcess(pi.pi.hProcess, 0);
            CloseHandle(pi.pi.hProcess);
            CloseHandle(pi.pi.hThread);
            CloseHandle(rd_pipe);
            rd_pipe = nullptr;
            thread.wait_to_finish();
            Logger::output<ELogSeverity::Log>(__FILE__, __LINE__, __FUNCTION__, "[%s] terminated", proc_name);
        }
    };
#elif defined(UNIX_ENABLED) && !defined(__EMSCRIPTEN__)
    //TODO
    class ProcessImpl : public Process
    {
    public:
        ProcessImpl(): Process() {}

        virtual Error on_start(const String& p_name, const String& p_path, const List<String>& p_arguments) override { return OK; }
        virtual bool _is_running() const override { return false; }
        virtual void on_stop() override { }
    };
#else
    class ProcessImpl : public Process
    {
    public:
        ProcessImpl(): Process() {}

        virtual Error on_start(const String& p_name, const String& p_path, const List<String>& p_arguments) override { return OK; }
        virtual bool _is_running() const override { return false; }
        virtual void on_stop() override { }
    };
#endif

    bool Process::is_running() const
    {
        return _is_running();
    }

    std::shared_ptr<Process> Process::create(const String& p_name, const String& p_path, const List<String>& p_arguments)
    {
        std::shared_ptr<ProcessImpl> impl = std::make_shared<ProcessImpl>();
        impl->start(p_name, p_path, p_arguments);
        return impl;
    }

    Process::~Process()
    {
    }

    void Process::stop()
    {
        if (!is_running()) return;
        on_stop();
    }

    void Process::start(const String& p_name, const String& p_path, const List<String>& p_arguments)
    {
        on_start(p_name, p_path, p_arguments);
    }

}
