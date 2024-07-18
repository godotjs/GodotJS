#ifndef GODOTJS_SOURCE_MAP_CACHE_H
#define GODOTJS_SOURCE_MAP_CACHE_H

#include "jsb_macros.h"
#include "jsb_source_map.h"
#include "modules/regex/regex.h"

namespace jsb::internal
{
    struct SourceMapCache
    {
        // try to translate the source positions in stacktrace
        String process_source_position(const String& p_stacktrace, SourcePosition* r_position = nullptr);

        void invalidate(const String& p_filename);

        void clear();

    private:
#if JSB_WITH_SOURCEMAP
        SourceMap* find_source_map(const String& p_filename);

        Ref<RegEx> source_map_match1_;
        Ref<RegEx> source_map_match2_;
        HashMap<String, SourceMap> cached_source_maps_;
#endif
    };
}

#endif
