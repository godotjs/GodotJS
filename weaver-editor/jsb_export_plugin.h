#ifndef GODOTJS_EXPORT_PLUGIN_H
#define GODOTJS_EXPORT_PLUGIN_H

#include "jsb_editor_pch.h"
#include "../weaver/jsb_gdjs_lang.h"
#include "editor/export/editor_export_plugin.h"

// improve the pipeline of using typescripts
class GodotJSExportPlugin: public EditorExportPlugin
{
    typedef EditorExportPlugin super;
    GDCLASS(GodotJSExportPlugin, EditorExportPlugin)

public:
    GodotJSExportPlugin();
    virtual String get_name() const override;

protected:
    virtual void _export_begin(const HashSet<String>& p_features, bool p_debug, const String& p_path, int p_flags) override;
    virtual void _export_file(const String& p_path, const String& p_type, const HashSet<String>& p_features) override;

    virtual PackedStringArray _get_export_features(const Ref<EditorExportPlatform>& p_export_platform, bool p_debug) const override;

private:
    bool export_compiled_script(const String& p_path);

    HashSet<String> ignored_paths_;
    HashSet<String> exported_paths_;
    std::shared_ptr<jsb::Environment> env_;
};

#endif

