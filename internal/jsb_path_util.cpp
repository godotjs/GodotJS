#include "jsb_path_util.h"

// std::size
#include <iterator>

#include "jsb_macros.h"
#include "jsb_settings.h"
#include "core/variant/variant.h"
#include "core/io/dir_access.h"
#include "../jsb.config.h"

// for windows api (like 'DeleteFileW')
#if WINDOWS_ENABLED
#   define WIN32_LEAN_AND_MEAN
#   include <windows.h>
#else
#   include <unistd.h>
#endif

namespace jsb::internal
{
    String PathUtil::to_platform_specific_path(const String& p_path)
    {
        const Ref<FileAccess> file_access = FileAccess::open(p_path, FileAccess::READ);
        const String simplified = (file_access.is_valid() ? file_access->get_path_absolute() : p_path).simplify_path();

#if WINDOWS_ENABLED
        return simplified.replace("/", "\\");
#else
        return simplified;
#endif
    }

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

    String PathUtil::get_last_component(const String& p_name)
    {
        int index = p_name.rfind("/");
        if (index < 0)
        {
            index = p_name.rfind("\\");
            if (index < 0)
            {
                return p_name;
            }
        }
        return p_name.substr(index + 1);
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

    bool PathUtil::is_absolute_path(const String& p_path)
    {
#if !WINDOWS_ENABLED
        if (p_path.begins_with("/")) return true;
#endif
        return p_path.contains(":/");
    }

    String PathUtil::extends_with(const String& p_path, const String& p_ext)
    {
        return p_path.ends_with(p_ext) ? p_path : p_path + p_ext;
    }

    String PathUtil::convert_typescript_path(const String& p_source_path)
    {
        if (p_source_path.ends_with("." JSB_TYPESCRIPT_EXT))
        {
            jsb_checkf(p_source_path.begins_with("res://"), "can not proceed typescript sources not under the project directory");
            const String replaced = Settings::get_jsb_out_res_path().path_join(
                p_source_path.substr(std::size("res://") - 1, p_source_path.length() - (int) std::size("res://") - 1)
                + JSB_JAVASCRIPT_EXT);
            return replaced;
        }
        return p_source_path;
    }

    String PathUtil::convert_javascript_path(const String& p_source_path)
    {
        if (p_source_path.ends_with("." JSB_JAVASCRIPT_EXT))
        {
            const String root_path = Settings::get_jsb_out_res_path();
            jsb_checkf(p_source_path.begins_with(root_path), "can not proceed javascript sources not under the project data directory");
            const String replaced = String("res://").path_join(
                p_source_path.substr(root_path.length() + 1, p_source_path.length() - root_path.length() - 3)
                + JSB_TYPESCRIPT_EXT);
            return replaced;
        }
        return p_source_path;
    }

    void PathUtil::delete_file(const char* p_path, int p_length)
    {
#if WINDOWS_ENABLED
        const String path(p_path, p_length);
        if (!DeleteFileW((LPCWSTR) path.utf16().get_data()))
        {
            JSB_LOG(Warning, "failed to delete %s", path);
        }
#else
        unlink(p_path);
#endif
    }

}
