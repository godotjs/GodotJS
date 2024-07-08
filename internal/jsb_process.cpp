#include "jsb_process.h"

#if defined(WINDOWS_ENABLED)
#define WIN32_LEAN_AND_MEAN
#include <dwrite.h>
#include <dwrite_2.h>
#include <windows.h>
#include <windowsx.h>
#endif

namespace jsb::internal
{
    static constexpr int CHUNK_SIZE = 4096;

#if defined(WINDOWS_ENABLED)
    class ProcessImpl : public Process
    {
        struct ProcessInfo {
            STARTUPINFO si;
            PROCESS_INFORMATION pi;
        } pi = {};

        HANDLE rd_pipe = nullptr;
        OVERLAPPED overlapped_ = {};
        volatile bool rd_pending_ = false;
        LocalVector<char> bytes;
        Vector<char> rd_line;
        // int bytes_in_buffer = 0;

        // OS::ProcessID pid = 0;
        // HANDLE pipe[] = { nullptr, nullptr };
    public:
        ProcessImpl(): Process()
        {
            bytes.resize(CHUNK_SIZE);
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
            // Try to convert from default ANSI code page to Unicode.
            LocalVector<wchar_t> wchars;
            int total_wchars = MultiByteToWideChar(CP_ACP, 0, rd_line.ptr(), rd_line.size(), nullptr, 0);
            if (total_wchars > 0)
            {
                wchars.resize(total_wchars);
                if (MultiByteToWideChar(CP_ACP, 0, rd_line.ptr(), rd_line.size(), wchars.ptr(), total_wchars) == 0)
                {
                    wchars.clear();
                }
            }

            const String output = wchars.is_empty() ? String::utf8(rd_line.ptr(), rd_line.size()) : String(wchars.ptr(), total_wchars);
            JSB_LOG(Log, "stdout: %s", output);
        }

        virtual Error on_start(const String& p_path, const List<String>& p_arguments) override
        {
            String path = p_path.replace("/", "\\");
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
            overlapped_.hEvent = CreateEvent(NULL, TRUE, FALSE, NULL);
            begin_read_async();
            return OK;
        }

        static void on_complete(DWORD p_error_code, DWORD p_read, LPOVERLAPPED p_overlapped)
        {
            // end_read_async();
        }

        void begin_read_async()
        {
            // Read StdOut and StdErr from pipe.
            if (!ReadFileEx(rd_pipe, (LPVOID) bytes.ptr(), CHUNK_SIZE, &overlapped_, &on_complete))
            {
                const DWORD error = GetLastError();
                if (error != ERROR_IO_PENDING)
                {
                    JSB_LOG(Error, "failed to begin read (async): %s", uitos((uint64_t) error));
                }
                return;
            }

            rd_pending_ = true;
        }

        void end_read_async()
        {
            DWORD read = 0;
            if (overlapped_.hEvent != INVALID_HANDLE_VALUE)
            {
                if (!GetOverlappedResult(rd_pipe, &overlapped_, &read, FALSE))
                {
                    DWORD error = GetLastError();
                    if (error != ERROR_IO_PENDING)
                    {
                        JSB_LOG(Warning, "failed to end read (async): %s", uitos((uint64_t) error));
                    }
                    return;
                }
            }

            // Assume that all possible encodings are ASCII-compatible.
            // Break at newline to allow receiving long output in portions.
            for (DWORD i = 0; i < read; ++i)
            {
                if (bytes[i] == '\n')
                {
                    _flush();
                    rd_line.clear();
                }
                else
                {
                    rd_line.push_back(bytes[i]);
                }
            }

            rd_pending_ = false;
        }

        virtual void on_update() override
        {
            if (!rd_pending_)
            {
                begin_read_async();
            }
        }

        virtual bool _is_running() const override
        {
            if (pi.pi.hProcess == nullptr)
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
            if (overlapped_.hEvent != INVALID_HANDLE_VALUE)
            {
                CloseHandle(overlapped_.hEvent);
                overlapped_.hEvent = INVALID_HANDLE_VALUE;
            }
            CloseHandle(rd_pipe);
            rd_pipe = nullptr;

            const int ret = TerminateProcess(pi.pi.hProcess, 0);
            CloseHandle(pi.pi.hProcess);
            CloseHandle(pi.pi.hThread);

            if (ret != 0)
            {
                JSB_LOG(Error, "failed to terminate process %d", ret);
            }
        }
    };
#elif defined(UNIX_ENABLED) && !defined(__EMSCRIPTEN__)
    //TODO
    class ProcessImpl : public Process
    {
    public:
        ProcessImpl(): Process() {}

        virtual Error on_start(const String& p_path, const List<String>& p_arguments) override { return OK; }
        virtual void on_update() override { }
        virtual bool _is_running() const override { return false; }
        virtual void on_stop() override { }
    };
#else
    class ProcessImpl : public Process
    {
    public:
        ProcessImpl(): Process() {}

        virtual Error on_start(const String& p_path, const List<String>& p_arguments) override { return OK; }
        virtual void on_update() override { }
        virtual bool _is_running() const override { return false; }
        virtual void on_stop() override { }
    };
#endif

    bool Process::is_running() const
    {
        return _is_running();
    }

    std::shared_ptr<Process> Process::create(const String& p_path, const List<String>& p_arguments)
    {
        std::shared_ptr<ProcessImpl> impl = std::make_shared<ProcessImpl>();
        impl->start(p_path, p_arguments);
        return impl;
    }

    Process::~Process()
    {
        stop();
    }

    void Process::stop()
    {
        if (!is_running()) return;
        on_stop();
    }

    void Process::start(const String& p_path, const List<String>& p_arguments)
    {
        on_start(p_path, p_arguments);
    }

    void Process::update()
    {
        if (!is_running()) return;
        on_update();
    }

}
