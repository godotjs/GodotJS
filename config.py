# config.py
import os

def can_build(env, platform):
    module_path = os.path.dirname(os.path.abspath("jsb.h"))
    module_name = os.path.basename(module_path)

    # `regex` is required for `internal/jsb_source_map_cache`
    env.module_add_dependencies(module_name, ["regex"])
    return True

def get_opts(platform):
    from SCons.Variables import BoolVariable, EnumVariable

    return [
        BoolVariable("use_typescript", "Build with typescript support (enabled by default)", True),
        BoolVariable("use_quickjs", "Prefer to use QuickJS rather than the default VM on the current platform", False),
        BoolVariable("use_quickjs_ng", "Prefer to use QuickJS-NG rather than the default VM on the current platform", False),
    ]

def configure(env):
    pass

def get_icons_path():
    return "weaver-editor/icons"
    
