#include "jsb_source_reader.h"

namespace jsb::internal
{
    FileAccessSourceReader::FileAccessSourceReader(const String& p_file_name)
    {
        file_ = FileAccess::open(p_file_name, FileAccess::READ);
    }

}
