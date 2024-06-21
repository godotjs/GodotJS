#include "jsb_quickjs_platform.h"

namespace v8::platform
{
    std::unique_ptr<Platform> NewDefaultPlatform()
    {
        return std::make_unique<Platform>();
    }

}
