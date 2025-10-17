#ifndef GODOTJS_FORMAT_H
#define GODOTJS_FORMAT_H

#include "../compat/jsb_compat.h"
#include "jsb_sindex.h"

namespace jsb::internal
{
    template<typename T> struct TFormat                { static Variant from(const T& p_item) { return p_item; } };
    template<>           struct TFormat<IndexSafe64>   { static Variant from(const IndexSafe64& p_item) { return *p_item; } };
    template<>           struct TFormat<Index64>       { static Variant from(const Index64& p_item) { return *p_item; } };
    template<>           struct TFormat<Index32>       { static Variant from(const Index32& p_item) { return *p_item; } };
    template<>           struct TFormat<uintptr_t>     { static Variant from(const uintptr_t& p_item) { return Variant((uint64_t) p_item); } };
    template<typename T> static Variant convert(const T& p_item) { return TFormat<T>::from(p_item); }

    template <typename... VarArgs>
    String format(const String &p_text, const VarArgs... p_args)
    {
        Variant args[sizeof...(p_args) + 1] = { convert(p_args)..., Variant() }; // +1 makes sure zero sized arrays are also supported.
        Array args_array;
        args_array.resize(sizeof...(p_args));
        for (int i = 0; i < (int) sizeof...(p_args); i++)
        {
            args_array[i] = args[i];
        }

        bool error = false;
        String fmt = p_text.sprintf(args_array, &error);

        ERR_FAIL_COND_V_MSG(error, String(), String("Formatting error in string \"") + p_text + "\": " + fmt + ".");
        return fmt;
    }

}
#endif

