#ifndef GODOTJS_WEB_CATCH_H
#define GODOTJS_WEB_CATCH_H
namespace v8
{
    class Isolate;

    class TryCatch
    {
    public:
        Isolate* isolate_;

        TryCatch(Isolate* isolate) : isolate_(isolate) {}
        ~TryCatch();

        bool HasCaught() const;
    };
}
#endif
