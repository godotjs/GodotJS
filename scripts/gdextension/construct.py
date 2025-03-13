#!/usr/bin/env python
import os
import sys

print("Constructing gdextension: GodotJS")
env = SConscript("godot-cpp/SConstruct")

# For the reference:
# - CCFLAGS are compilation flags shared between C and C++
# - CFLAGS are for C-specific compilation flags
# - CXXFLAGS are for C++-specific compilation flags
# - CPPFLAGS are for pre-processor flags
# - CPPDEFINES are for pre-processor defines
# - LINKFLAGS are for linking flags

output_dir = "game/bin"
jsb_platform = env["platform"]

# tweak this if you want to use different folders, or more folders, to store your source code in.
env.Append(CPPPATH=["src/"])
sources = \
      Glob("src/*.cpp") \
    + Glob("src/bridge/*.cpp") \
    + Glob("src/compat/*.cpp") \
    + Glob("src/internal/*.cpp") \
    + Glob("src/weaver/*.cpp") \
    + Glob("src/weaver-editor/*.cpp") 

# platform-specific defines
if jsb_platform == "windows":
    env.Append(LINKFLAGS=["winmm.lib", "Dbghelp.lib"])
if jsb_platform not in ["ios", "android"]:
    env.AppendUnique(CPPDEFINES=["V8_COMPRESS_POINTERS"]) 

# common defines
if False:
    # v8 + lws
    source = source + Glob("src/impl/v8/*.cpp") 
    env.Append(LIBS=[File("src/v8/windows_x86_64_release/v8_monolith.lib")])
    env.Append(CPPPATH=["src/v8/include"])
    env.AppendUnique(CPPDEFINES=["_ITERATOR_DEBUG_LEVEL=0"]) 
    env.Append(CPPPATH=[f"lws/windows_x86_64_release/include"])
    env.Append(LIBS=[File("lws/windows_x86_64_release/websockets.lib")])
else:
    # quickjs
    source = source + Glob("src/impl/quickjs/*.c") 

if env["target"] in ["editor", "template_debug"]:
    try:
        doc_data = env.GodotCPPDocData("src/jsb_doc_data.gen.cpp", source=Glob("doc_classes/*.xml"))
        sources.append(doc_data)
        print("Class reference added.")
    except AttributeError:
        print("Not including class reference as we're targeting a pre-4.3 baseline.")

if env["platform"] == "macos":
    library = env.SharedLibrary(
        f"{output_dir}/libgodojs.{env["platform"]}.{env["target"]}.framework/libgodojs.{env["platform"]}.{env["target"]}",
        source=sources,
    )
else:
    library = env.SharedLibrary(
        f"{output_dir}/libgodojs{env["suffix"]}{env["SHLIBSUFFIX"]}",
        source=sources,
    )

Default(library)
