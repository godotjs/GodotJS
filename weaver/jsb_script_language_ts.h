#ifndef GODOTJS_SCRIPT_LANGUAGE_TS_H
#define GODOTJS_SCRIPT_LANGUAGE_TS_H

#include "jsb_script_language.h"

class GodotJSScriptLanguage : public GodotJSScriptLanguageBase {
    static GodotJSScriptLanguage * singleton_;
public:
    static GodotJSScriptLanguage * get_singleton() { return singleton_; }
    static GodotJSScriptLanguage * create_singleton() { if (singleton_) return singleton_; return singleton_ = memnew(GodotJSScriptLanguage); }
    static void destroy_singleton() { if (singleton_) memdelete(singleton_); singleton_ = nullptr; }
    virtual String get_extension() const override { return JSB_TYPESCRIPT_EXT; }
    virtual GodotJSScriptBase* create_godotjsscript() const override;
    virtual void get_recognized_extensions(List<String>* p_extensions) const override;
    virtual bool handles_global_class_type(const String& p_type) const override;
    virtual String get_name() const override;
    virtual String get_type() const override;
    virtual Vector<ScriptTemplate> get_built_in_templates(ConstStringNameRefCompat p_object) override;

};

#endif
