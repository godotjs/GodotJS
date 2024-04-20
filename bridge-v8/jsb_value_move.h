#ifndef JAVASCRIPT_VALUE_MOVE_H
#define JAVASCRIPT_VALUE_MOVE_H
#include "jsb_pch.h"

namespace jsb
{
    struct JSValueMove
    {
        friend class Realm;

    private:
        std::shared_ptr<class Realm> realm_;
        v8::Global<v8::Value> value_;

        JSValueMove() = default;
        JSValueMove(const std::shared_ptr<class Realm>& p_realm, const v8::Local<v8::Value>& p_value);

    public:
        // disable copy to avoid unpredictable behaviours (for now)
        JSValueMove(const JSValueMove& p_other) = delete;
        JSValueMove& operator=(const JSValueMove& p_other) = delete;

        JSValueMove(JSValueMove&& p_other) noexcept = default;
        JSValueMove& operator=(JSValueMove&& p_other) noexcept = default;

        jsb_force_inline void ignore() const {}
        bool is_valid() const;
        String to_string() const;
    };
}
#endif
