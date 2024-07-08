#ifndef GODOTJS_PROCESS_H
#define GODOTJS_PROCESS_H
#include "jsb_macros.h"
namespace jsb::internal
{
    class Process
    {
    public:
        virtual ~Process();
        static std::shared_ptr<Process> create(const String &p_path, const List<String>& p_arguments);

        void stop();
        bool is_running() const;
        void update();

    protected:
        Process() = default;
        void start(const String& p_path, const List<String>& p_arguments);

        virtual Error on_start(const String& p_path, const List<String>& p_arguments) = 0;
        virtual void on_stop() = 0;
        virtual void on_update() = 0;
        virtual bool _is_running() const = 0;

    };
}
#endif

