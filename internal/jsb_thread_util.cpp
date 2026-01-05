#include "jsb_thread_util.h"
#include "jsb_macros.h"

#ifdef WINDOWS_ENABLED
    #define WIN32_LEAN_AND_MEAN
    #include <windows.h>
#endif

namespace jsb::internal
{

#ifdef WINDOWS_ENABLED
    namespace
    {
        typedef HRESULT(WINAPI* SetThreadDescriptionFunc)(HANDLE hThread, PCWSTR lpThreadDescription);

        SetThreadDescriptionFunc GetSetThreadDescriptionFunc()
        {
            if (const HMODULE module = GetModuleHandle(TEXT("kernel32.dll")))
            {
                return (SetThreadDescriptionFunc) GetProcAddress(module, "SetThreadDescription");
            }
            return nullptr;
        }
    } // namespace
#endif

    void ThreadUtil::set_name(const String& p_name)
    {
#ifdef WINDOWS_ENABLED
        static const SetThreadDescriptionFunc func = GetSetThreadDescriptionFunc();
        if (func)
        {
            const Char16String str16 = p_name.utf16();
            const HRESULT res = func(::GetCurrentThread(), (PCWSTR) str16.get_data());
            if (SUCCEEDED(res))
            {
                return;
            }
        }
#endif
        ::Thread::set_name(p_name);
    }

} // namespace jsb::internal
