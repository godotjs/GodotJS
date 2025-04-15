#include "jsb_source_reader.h"
#include "jsb_macros.h"
#include "jsb_logger.h"

namespace jsb::internal
{
    FileAccessSourceReader::FileAccessSourceReader(const String& p_file_name)
    {
        file_ = FileAccess::open(p_file_name, FileAccess::READ);
        cached_length_ = file_.is_null() ? 0 : file_->get_length();
    }

    StringSourceReader::StringSourceReader(const String& p_path, const String& p_absolute_path, const String& p_source)
        : path_(p_path)
        , absolute_path_(p_absolute_path)
        , buffer_(p_source.to_utf8_buffer())
    {
    }

    uint64_t StringSourceReader::get_buffer(uint8_t* p_dst, uint64_t p_length) const
    {
        const uint64_t len = std::min(p_length, (uint64_t) buffer_.size());
        memcpy(p_dst, buffer_.ptr(), len);
        return len;
    }

}
