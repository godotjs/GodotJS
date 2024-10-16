# config.py

def can_build(env, platform):
    # temp
    # return platform == "windows"
    # return platform in ["windows", "macos", "linuxbsd", "android", "ios"] # currently supported platforms
    return True

def get_opts(platform):
    from SCons.Variables import BoolVariable, EnumVariable

    return [
        BoolVariable("use_quickjs", "Prefer to use QuickJS even if v8 is available", False),
    ]

def configure(env):
    pass

def get_icons_path():
    return "weaver-editor/icons"
    
