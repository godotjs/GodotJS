#ifndef GODOTJS_SOURCE_MAP_CACHE_H
#define GODOTJS_SOURCE_MAP_CACHE_H

#include "jsb_macros.h"
#include "jsb_source_map.h"
#include "modules/regex/regex.h"

namespace jsb::internal
{
    struct SourceMapCache
    {
        // replace position in the stacktrace with source map
        String handle_source_map(const String& p_stacktrace);

    private:
        SourceMap* find_source_map(const String& p_filename);

        Ref<RegEx> source_map_match1_;
        Ref<RegEx> source_map_match2_;
        HashMap<String, SourceMap> cached_source_maps_;
    };
}

#endif
