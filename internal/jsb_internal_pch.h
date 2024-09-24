#ifndef GODOTJS_INTERNAL_PCH_H
#define GODOTJS_INTERNAL_PCH_H

#include <memory>
#include <vector>

#include "core/templates/hash_map.h"

#include "core/variant/variant.h"
#include "core/variant/variant_utility.h"
#include "core/string/print_string.h"

#include "core/object/object.h"
#include "core/io/file_access.h"
#include "core/io/dir_access.h"
#include "core/os/os.h"
#include "core/os/thread.h"
#include "core/os/os.h"

#include "core/config/engine.h"
#include "core/config/project_settings.h"

#include "main/main.h"

#ifdef TOOLS_ENABLED
#include "editor/editor_settings.h"
#endif

#include "jsb_engine_version_comparison.h"

#include "../jsb.gen.h"
#include "../jsb.config.h"
#include "../jsb_version.h"

#endif
