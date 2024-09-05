#ifndef GODOTJS_VERSION_COMPARISON_H
#define GODOTJS_VERSION_COMPARISON_H

#include "core/version.h"

#define GODOT_VERSION_COMPARE(Current, MinExpected, ComparisonChain) (((Current) > (MinExpected)) || ((Current) == (MinExpected) && (ComparisonChain)))
#define GODOT_VERSION_NEWER_THAN(major, minor, patch) GODOT_VERSION_COMPARE(VERSION_MAJOR, major, GODOT_VERSION_COMPARE(VERSION_MINOR, minor, GODOT_VERSION_COMPARE(VERSION_PATCH, patch, false)))
#define GODOT_4_3_OR_NEWER GODOT_VERSION_NEWER_THAN(4, 3, -1)
#define GODOT_4_4_OR_NEWER GODOT_VERSION_NEWER_THAN(4, 4, -1)

#endif
