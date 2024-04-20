# config.py

def can_build(env, platform):
    # temp
    # return platform == "windows"
    return platform in ["windows", "macos"] # currently supported platforms
    # return True
    
def configure(env):
    pass
