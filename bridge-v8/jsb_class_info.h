#ifndef GODOTJS_CLASS_INFO_H
#define GODOTJS_CLASS_INFO_H

#include "jsb_pch.h"

namespace jsb
{
    typedef void (*ConstructorFunc)(const v8::FunctionCallbackInfo<v8::Value>&);
    typedef void (*FinalizerFunc)(class Environment*, void*, bool /* p_persistent */);

    namespace NativeClassType
    {
        enum Type : uint8_t
        {
            None,
            GodotObject,
            GodotPrimitive,
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

        // strong reference
        // the counterpart of exposed C++ class.
        //NOTE template_.GetFunction() returns the `constructor`,
        //NOTE `constructor == info.NewTarget()` only if directly creating a class instance
        v8::Global<v8::FunctionTemplate> template_;

        //TODO not really necessary
        //TODO why jclass_info.template_.Get.GetFunction instantiate a new function diff with jclass_info.function_.Get when reading in ClassTemplate<Object>.constructor??
        v8::Global<v8::Function> function_;
    };

    namespace GodotJSMethodFlags
    {
        enum Type : uint8_t
        {
            None = 0,
            Static = 1,
        };
    }

    struct GodotJSMethodInfo
    {
        GodotJSMethodFlags::Type flags;

        jsb_force_inline bool is_static() const { return flags & GodotJSMethodFlags::Static; }
    };

    struct GodotJSPropertyInfo
    {
        Variant::Type type = Variant::NIL;
        StringName name;
        StringName class_name; // For classes
        PropertyHint hint = PROPERTY_HINT_NONE;
        String hint_string;
        uint32_t usage = PROPERTY_USAGE_DEFAULT;

        // Variant default_value;
    };

    namespace GodotJSClassFlags
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
    struct GodotJSClassInfo
    {
        // name of the owner module
        StringName module_id;

        // js class name
        StringName js_class_name;

        // for constructor/prototype access
        v8::Global<v8::Object> js_class;

        //TODO class default object (lazily created and needed only when any variable exported)
        v8::Global<v8::Object> js_default_object;

        // the native class id the current class inherits from.
        NativeClassID native_class_id;

        // a fastpath to read the name of native class (the GodotJS class inherits from).
        // it's a redundant field only for performance.
        StringName native_class_name;

        GodotJSClassFlags::Type flags = GodotJSClassFlags::None;

        HashMap<StringName, GodotJSMethodInfo> methods;
        HashMap<StringName, GodotJSMethodInfo> signals;
        HashMap<StringName, GodotJSPropertyInfo> properties;

        //TODO whether the internal class object alive or not
        jsb_force_inline bool is_valid() const { return true; }

        jsb_force_inline bool is_tool() const { return flags & GodotJSClassFlags::Tool; }
        jsb_force_inline bool is_abstract() const { return flags & GodotJSClassFlags::Abstract; }
    };
}

#endif
