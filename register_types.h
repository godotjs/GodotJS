#ifndef JAVASCRIPT_REGISTER_TYPES_H
#define JAVASCRIPT_REGISTER_TYPES_H

#include "modules/register_module_types.h"
#include "jsb.gen.h"

void jsb_initialize_module(ModuleInitializationLevel p_level);
void jsb_uninitialize_module(ModuleInitializationLevel p_level);

#endif
