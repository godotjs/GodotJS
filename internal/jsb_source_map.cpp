#include "jsb_source_map.h"

#include "core/io/json.h"

namespace jsb::internal
{
    namespace
    {
        constexpr uint8_t kBase64Unmap[] =
        {
            // 0x2b (+) -->
            0x3e, 0xff, 0xff, 0xff, 0x3f,
            // 0x30 -> 0x3f
            0x34, 0x35, 0x36, 0x37, 0x38, 0x39, 0x3a, 0x3b, 0x3c, 0x3d, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff,
            0xff, 0x00, 0x01, 0x02, 0x03, 0x04, 0x05, 0x06, 0x07, 0x08, 0x09, 0x0a, 0x0b, 0x0c, 0x0d, 0x0e,
            0x0f, 0x10, 0x11, 0x12, 0x13, 0x14, 0x15, 0x16, 0x17, 0x18, 0x19, 0xff, 0xff, 0xff, 0xff, 0xff,
            0xff, 0x1a, 0x1b, 0x1c, 0x1d, 0x1e, 0x1f, 0x20, 0x21, 0x22, 0x23, 0x24, 0x25, 0x26, 0x27, 0x28,
            0x29, 0x2a, 0x2b, 0x2c, 0x2d, 0x2e, 0x2f, 0x30, 0x31, 0x32, 0x33,  // <-- 0x7a (z)
        };
    }

    // base64vlq decode
    // adapted from https://www.murzwin.com/base64vlq.html
    void SourceMap::decode(int p_line, const char* p_token, const char* p_end, InternalPosition& r_pos, int& r_aline, int& r_acol)
    {
        if (p_end - p_token <= 1) return;
        uint8_t shift = 0;
        int32_t value = 0;
        uint8_t index = 0;
        while (p_end != p_token)
        {
            const char token = *(p_token++);
            jsb_check(token >= '+' && token <= 'z');
            int32_t integer = kBase64Unmap[(uint8_t) (token - '+')];
            const bool cont = integer & 0x20;
            integer &= 0x1f;
            value |= integer << shift;
            if (cont) {
                shift += 5;
                continue;
            }
            const bool neg = value & 1;
            value = value >> 1;
            r_pos[index++] = neg ? -value : value;
            value = shift = 0;
        }
        r_aline += r_pos.source_line;
        r_acol += r_pos.source_column;
        Vector<InternalPosition>& elements = (*this)[p_line].elements;
        elements.append({ r_pos.result_column, r_pos.source_index, r_aline, r_acol, r_pos._reserved });
    }

    SourceMap::InternalLine& SourceMap::operator[](int p_line)
    {
        const int size = source_lines_.size();
        if (size == 0 || source_lines_[size - 1].result_line != p_line)
        {
            source_lines_.push_back({ p_line, {} });
            return source_lines_.write[size];
        }
        return source_lines_.write[size - 1];
    }

    bool SourceMap::parse_mappings(const char* p_mapings, size_t p_len)
    {
        source_lines_.clear();
        int line = 0;
        size_t pos = 0;
        size_t cursor = 0;
        int accum_line = 0;
        int accum_column = 0;
        InternalPosition sp;
        while (cursor < p_len)
        {
            const char ch = p_mapings[cursor];
            switch (ch)
            {
            case ';':
                // new line
                decode(line, p_mapings + pos, p_mapings + cursor, sp, accum_line, accum_column);
                ++line;
                pos = ++cursor;
                break;
            case ',':
                // new element
                jsb_check(pos < cursor);
                decode(line, p_mapings + pos, p_mapings + cursor, sp, accum_line, accum_column);
                pos = ++cursor;
                break;
            default: ++cursor; break;
            }
        }
        if (pos < cursor)
        {
            decode(line, p_mapings + pos, p_mapings + cursor, sp, accum_line, accum_column);
        }
        return true;
    }

    bool SourceMap::find(int p_line, int p_column, SourcePosition& r_pos) const
    {
        for (int line_index = source_lines_.size() - 1; line_index >= 0; --line_index)
        {
            const InternalLine& line = source_lines_[line_index];
            if (line.result_line > p_line)
            {
                continue;
            }

            int xdist = INT_MAX;
            int xindex = 0;
            for (int index = line.elements.size() - 1; index >= 0; -- index)
            {
                const InternalPosition& position = line.elements[index];
                const int dist = std::abs(position.result_column - p_column);
                if (dist == 0)
                {
                    xindex = index;
                    break;
                }
                if (dist < xdist)
                {
                    xdist = dist;
                    xindex = index;
                }
            }

            const InternalPosition& xposition = line.elements[xindex];
            r_pos.index = xposition.source_index;
            r_pos.line = xposition.source_line;
            r_pos.column = xposition.source_column;
            return true;;
        }
        // no matched position
        r_pos.index = r_pos.line = r_pos.column = 0;
        return false;
    }

    bool SourceMap::parse(const String& p_source_map)
    {
        const Variant json = JSON::parse_string(p_source_map);
        const CharString mappings = ((String) json.get("mappings")).utf8();
        source_root_ = (String) json.get("sourceRoot");
        Array sources = (Array) json.get("sources");
        for (int i = 0, n = sources.size(); i < n; ++i)
        {
            sources_.push_back(sources[i]);
        }
        return parse_mappings(mappings.ptr(), mappings.length());
    }

    const String& SourceMap::get_source(int index) const
    {
        jsb_check(index >= 0 && index < sources_.size());
        return sources_[index];
    }

    const String& SourceMap::get_source_root() const
    {
        return source_root_;
    }

}
