#include "jsb_path_util.h"

// std::size
#include <iterator>

#include "jsb_macros.h"
#include "core/variant/variant.h"
#include "core/io/dir_access.h"
#include "core/io/file_access.h"


namespace jsb::internal
{
    String PathUtil::dirname(const String& p_name)
    {
        int index = p_name.rfind("/");
        if (index < 0)
        {
            index = p_name.rfind("\\");
            if (index < 0)
            {
                // p_name is a pure filename without any dir hierarchy given
                return String();
            }
        }
        return p_name.substr(0, index);
    }

    Error PathUtil::extract(const String& p_path, String& o_path)
    {
        o_path = p_path.simplify_path();
        return OK;
    }


    bool PathUtil::find(const String& p_path)
    {
        const Ref<DirAccess> da = DirAccess::create(DirAccess::ACCESS_RESOURCES);
        return da->file_exists(p_path);
    }
    
}
