#include "jsb_source_map_cache.h"

#include "jsb_path_util.h"

namespace jsb::internal
{
    String SourceMapCache::handle_source_map(const String& p_stacktrace)
    {
        if (p_stacktrace.length() == 0) return p_stacktrace;
        if (source_map_match1_.is_null()) source_map_match1_ = RegEx::create_from_string(R"(\s+at\s(.+)\s\((.+\.js):(\d+):(\d+)\))");
        if (source_map_match2_.is_null()) source_map_match2_ = RegEx::create_from_string(R"(\s+at\s(.+\.js):(\d+):(\d+))");

        Vector<String> st_lines = p_stacktrace.split("\n");
        for (String& st_line : st_lines)
        {
            const Ref<RegEx>& regex = st_line.contains("(") && st_line.contains(")")
                ? source_map_match1_
                : source_map_match2_;
            Ref<RegExMatch> match = regex->search(st_line);
            if (!match.is_valid()) continue;
            const int group_index = match->get_group_count() - 3;
            String hint = group_index == 0 ? String() : match->get_string(group_index);
            String filename = match->get_string(group_index + 1);
            const int line = (int) match->get_string(group_index + 2).to_int();
            const int col = (int) match->get_string(group_index + 3).to_int();

            SourceMap* map = find_source_map(filename);
            if (!map) continue;
            SourcePosition position;
            if (!map->find(line, col, position)) continue;
            const String& source = map->get_source(position.index);
            const String& source_root = map->get_source_root();
#if WINDOWS_ENABLED
            const String restored = PathUtil::combine(PathUtil::dirname(filename), source_root, source).simplify_path().replace("/", "\\");
#else
            const String restored = PathUtil::combine(PathUtil::dirname(filename), source_root, source).simplify_path();
#endif
            if (hint.is_empty()) st_line = vformat("    at %s:%d:%d", restored, position.line, position.column);
            else st_line = vformat("    at %s (%s:%d:%d)", hint, restored, position.line, position.column);
        }
        return String("\n").join(st_lines);
    }

    SourceMap* SourceMapCache::find_source_map(const String& p_filename)
    {
        HashMap<String, SourceMap>::Iterator it = cached_source_maps_.find(p_filename);
        if (it != cached_source_maps_.end())
        {
            return &it->value;
        }

        it = cached_source_maps_.insert(p_filename, {});
        SourceMap& map = it->value;
        const String json_data = FileAccess::get_file_as_string(p_filename + ".map");
        if (json_data.length() != 0)
        {
            map.parse(json_data);
        }
        return &map;
    }
}
