#ifndef GODOTJS_CLASS_INFO_H
#define GODOTJS_CLASS_INFO_H

#include "jsb_bridge_pch.h"
#include "jsb_module.h"

namespace jsb
{
    enum class FinalizationType : uint8_t
    {
        // break the binding, no delete
        None,

        //
        Default,
    };

    typedef void (*ConstructorFunc)(const v8::FunctionCallbackInfo<v8::Value>&);
    typedef void (*FinalizerFunc)(Environment*, void*, FinalizationType);

    namespace NativeClassType
    {
        enum Type : uint8_t
        {
            // Godot Object classes are registered with name in Environment,
            // support retrieving ClassID by the class name from godot_classes_index_.
            GodotObject = 2,

            // Godot Variant classes (valuetype).
            // Classes are anonymously registered in Environment, only support retrieving NativeClassInfo by ClassID.
            GodotPrimitive = 4,

            Custom = 8,
        };
    }

    struct NativeClassInfo
    {
        // the func to release the exposed C++ (godot/variant/native) object
        // it's called when a JS value with this class type garbage collected by JS runtime
        FinalizerFunc finalizer;

        //TODO RESERVED FOR FUTURE USE
        NativeClassType::Type type;

        // *only if type == GodotObject*
        // godot_object_constructor use this name to look up classdb
        StringName name;

        impl::Class clazz;
    };

    // Safe pointer of NativeClassInfo
    typedef internal::SArray<NativeClassInfo, NativeClassID>::Pointer NativeClassInfoPtr;
    typedef internal::SArray<NativeClassInfo, NativeClassID>::ConstPointer NativeClassInfoConstPtr;

    struct ClassRegister;
    typedef NativeClassInfoPtr (*ClassRegisterFunc)(const ClassRegister& p_register, NativeClassID* r_class_id);

    namespace ScriptClassDocField
    {
        enum Type
        {
            Deprecated = 0,
            Experimental = 1,
            Help = 2,
        };
    }

#ifdef TOOLS_ENABLED
    struct ScriptBaseDoc
    {
        String brief_description;

        String deprecated_message;
        String experimental_message;

        bool is_deprecated = false;
        bool is_experimental = false;

    };

    struct ScriptClassDoc : ScriptBaseDoc {};
    struct ScriptMethodDoc : ScriptBaseDoc {};
    struct ScriptPropertyDoc : ScriptBaseDoc {};
#else
    struct ScriptClassDoc {};
    struct ScriptMethodDoc {};
    struct ScriptPropertyDoc {};
#endif

    namespace ScriptMethodFlags
    {
        enum Type : uint8_t
        {
            None = 0,
            Static = 1,
        };
    }

    struct ScriptMethodInfo
    {
        // only valid with TOOLS_ENABLED
        ScriptMethodDoc doc;

        ScriptMethodFlags::Type flags = ScriptMethodFlags::None;

        jsb_force_inline bool is_static() const { return flags & ScriptMethodFlags::Static; }

    };

    struct ScriptPropertyInfo
    {
        Variant::Type type = Variant::NIL;
        PropertyHint hint = PROPERTY_HINT_NONE;
        uint32_t usage = PROPERTY_USAGE_DEFAULT;

        StringName name;

        //TODO class_name is needed if type is OBJECT
        StringName class_name;

        String hint_string;

        ScriptPropertyDoc doc;
        // Variant default_value;
    };

    namespace ScriptClassFlags
    {
        enum Type : uint8_t
        {
            None = 0,

            //TODO we have no idea about it with javascript itself. maybe we can decorate the abstract class and check here?
            Abstract = 1 << 0,
            Tool = 1 << 1,
        };
    }

    // exchanging internal javascript class (object) information with `JavaScript` class.
    // DO NOT expose javascript runtime detail types with involved external classes,
    // since these info structs will be replaced deps on the runtime used.
    struct ScriptClassInfo
    {
        // name of the owner module
        StringName module_id;

        // js class name
        StringName js_class_name;

        // SIDE NOTE:
        //     js_class.prototype: prototype definition
        //     js_class.prototype.__proto__: prototype of the base js_class (B.prototype.__proto__ === A.prototype, if B directly extends A)
        //     js_class.constructor: the real function for constructing

        // for constructor/prototype access
        v8::Global<v8::Object> js_class;

        // a default object instance for js_class (lazily created if there is a variable exported at least) with no crossbound object instance.
        // it's null if failed to construct the CDO.
        v8::Global<v8::Value> js_default_object;

        // a fastpath to read the name of native class (the GodotJS class inherits from).
        // it's a redundant field only for performance.
        StringName native_class_name;

        // the native class id the current class inherits from.
        NativeClassID native_class_id;

        // [EXPERIMENTAL] fastpath for getting script class id of base
        ScriptClassID base_script_class_id;

        ScriptClassFlags::Type flags = ScriptClassFlags::None;

        String icon;

        // only valid with TOOLS_ENABLED
        ScriptClassDoc doc;

        HashMap<StringName, ScriptMethodInfo> methods;
        HashMap<StringName, ScriptMethodInfo> signals;
        HashMap<StringName, ScriptPropertyInfo> properties;

        Dictionary rpc_config;

        //TODO whether the internal class object alive or not
        jsb_force_inline bool is_valid() const { return true; }

        jsb_force_inline bool is_tool() const { return flags & ScriptClassFlags::Tool; }
        jsb_force_inline bool is_abstract() const { return flags & ScriptClassFlags::Abstract; }

        static void instantiate(const StringName& p_module_id, const v8::Local<v8::Object>& p_self);

        static bool _parse_script_class(const v8::Local<v8::Context>& p_context, JavaScriptModule& p_module);

    };

    // Safe pointer of ScriptClassInfo
    typedef internal::SArray<ScriptClassInfo, ScriptClassID>::Pointer ScriptClassInfoPtr;
    typedef internal::SArray<ScriptClassInfo, ScriptClassID>::ConstPointer ScriptClassInfoConstPtr;

}

#endif
