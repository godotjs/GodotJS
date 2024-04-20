#ifndef JAVASCRIPT_PCH_H
#define JAVASCRIPT_PCH_H

#include "core/object/object.h"
#include "core/string/print_string.h"
#include "core/templates/hash_map.h"
#include "core/io/file_access.h"
#include "core/io/dir_access.h"

namespace jsb
{
    // manually expose all builtin ATOMs originally defined in quickjs.c
    enum
    {
        __RESERVED = JS_ATOM_NULL,
        #define DEF(name, str) JS_ATOM_ ## name,
        #include "../quickjs/quickjs-atom.h"
        #undef DEF
    };

}

#endif
