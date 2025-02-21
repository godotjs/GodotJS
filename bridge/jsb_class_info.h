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
        //NOTE the enum value of Type must be a even number, since it's stored as AlignedPointerInternalField
        enum Type : uint8_t
        {
            // never used
            None = 0,

            //TODO a FASTPATH implementation? avoid unnecessary Variant wrapping for special builtin primitives (from Vector2 to Color)
            //     But a VALUE still can not be binded as VALUE itself, it seems impossible to avoid thread-safe TYPED pools. Is it worth to implement?
            // [BEGIN] RESERVED FOR FUTURE USE
            // Vector2 = 2,
            // Vector3 = 10,
            // Color = 32,
            // [END  ] RESERVED FOR FUTURE USE
            _RESERVED = 32,

            // Godot Variant classes (valuetype).
            // Classes are anonymously registered in Environment, only support retrieving NativeClassInfo by ClassID.
            // Variant is a special case, it's fully managed by JS without an object mapping in object_db.
            GodotPrimitive = 34,

            // Godot Object classes are registered with name in Environment,
            // support retrieving ClassID by the class name from godot_classes_index_.
            // unnecessary but used to avoid class lookup.
            GodotObject = 36,

            // type for JSWorker.
            // unnecessary but used to avoid class lookup.
            Worker = 38,

            // reserved for future use
            Custom = 64,
        };
    }

    struct NativeBindingInfo
    {
        void* ptr;
        NativeClassType::Type type;
    };

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

    struct ScriptSignalInfo
    {
    };

    struct ScriptMethodInfo
    {
        // only valid with TOOLS_ENABLED
        ScriptMethodDoc doc;

        ScriptMethodFlags::Type flags = ScriptMethodFlags::None;

        // v8::Global<v8::Function> cache_;

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

        // valid only if _Evaluated flag is set in ScriptClassInfo.flags
        Variant default_value;

        explicit operator PropertyInfo() const
        {
            return { type, name, hint, hint_string, usage, class_name };
        }
    };

    namespace ScriptClassFlags
    {
        enum Type : uint8_t
        {
            None = 0,

            //TODO we have no idea about it with javascript itself. maybe we can decorate the abstract class and check here?
            Abstract = 1 << 0,
            Tool = 1 << 1,

            // (INTERNAL USE ONLY) whether the default value of properties are evaluated or not
            _Evaluated = 1 << 2,
        };
    }

    // exchange internal javascript class (object) information.
    struct StatelessScriptClassInfo
    {
        // name of the owner module
        StringName module_id;

        // js class name (name of the exported default class in module)
        StringName js_class_name;

        // a fastpath to read the name of native class (the GodotJS class inherits from).
        //NOTE it's a redundant field only for performance. evaluated from 'native_class_id' and must be a godot object class.
        StringName native_class_name;

        // [EXPERIMENTAL] module fastpath for getting script class of base
        StringName base_script_module_id;

        // script icon path for showing in scene hierarchy
        String icon;

        // only valid with TOOLS_ENABLED
        ScriptClassDoc doc;

        Dictionary rpc_config;

        HashMap<StringName, ScriptMethodInfo> methods;
        HashMap<StringName, ScriptSignalInfo> signals;
        HashMap<StringName, ScriptPropertyInfo> properties;

        ScriptClassFlags::Type flags = ScriptClassFlags::None;

        //TODO whether the internal class object alive or not
        jsb_force_inline bool is_valid() const { return true; }

        jsb_force_inline bool is_tool() const { return flags & ScriptClassFlags::Tool; }
        jsb_force_inline bool is_abstract() const { return flags & ScriptClassFlags::Abstract; }
    };

    struct ScriptClassInfo : StatelessScriptClassInfo
    {
        // the native class id the current class inherits from.
        NativeClassID native_class_id;

        // SIDE NOTE:
        //     js_class.prototype: prototype definition
        //     js_class.prototype.__proto__: prototype of the base js_class (B.prototype.__proto__ === A.prototype, if B directly extends A)
        //     js_class.constructor: the real function for constructing

        // for constructor access
        v8::Global<v8::Object> js_class;

        internal::TypeGen<StringName, v8::Global<v8::Function>>::UnorderedMap method_cache;

        static void instantiate(const StringName& p_module_id, const v8::Local<v8::Object>& p_self);

        static bool _parse_script_class(const v8::Local<v8::Context>& p_context, JavaScriptModule& p_module);

    };

    // Safe pointer of ScriptClassInfo
    typedef internal::SArray<ScriptClassInfo, ScriptClassID>::Pointer ScriptClassInfoPtr;
    typedef internal::SArray<ScriptClassInfo, ScriptClassID>::ConstPointer ScriptClassInfoConstPtr;

}

#endif
