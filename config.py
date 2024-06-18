# config.py

def can_build(env, platform):
    # temp
    # return platform == "windows"
    return platform in ["windows", "macos", "linuxbsd"] # currently supported platforms
    # return True
    
def configure(env):
    pass

def get_icons_path():
    return "weaver-editor/icons"
    