#ifndef GODOTJS_WEB_WEAK_CALLBACK_INFO_H
#define GODOTJS_WEB_WEAK_CALLBACK_INFO_H

namespace v8
{
    enum class WeakCallbackType
    {
        kParameter,
        kInternalFields,
    };

    template<typename T>
    class WeakCallbackInfo
    {
    public:
        using Callback = void (*)(const WeakCallbackInfo& data);

        //TODO
    };
}
#endif
