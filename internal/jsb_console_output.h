#ifndef GODOTJS_CONSOLE_OUTPUT_H
#define GODOTJS_CONSOLE_OUTPUT_H
#include "jsb_macros.h"

namespace jsb
{
    class Realm;

    namespace internal
    {
        class IConsoleOutput
        {
            friend class jsb::Realm;

        private:
            static void _write(ELogSeverity::Type p_severity, const String& p_text);

        public:
            virtual void write(ELogSeverity::Type p_severity, const String& p_text) = 0;

            IConsoleOutput();
            virtual ~IConsoleOutput();
        };
    }
}
#endif
