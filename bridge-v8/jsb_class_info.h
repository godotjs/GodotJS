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

    struct GodotJSMethodInfo
    {
        enum Flags : uint8_t
        {
            Nono = 0,
            Static = 1,
        };

        Flags flags;

        jsb_force_inline bool is_static() const { return flags & Static; }
    };

    struct GodotJSPropertyInfo
    {
        Variant::Type type = Variant::NIL;
        StringName name;
        StringName class_name; // For classes
        PropertyHint hint = PROPERTY_HINT_NONE;
        String hint_string;
        uint32_t usage = PROPERTY_USAGE_DEFAULT;
    };

    // exchanging internal javascript class (object) information with `JavaScript` class.
    // DO NOT expose javascript runtime detail types with involved external classes,
    // since these info structs will be replaced deps on the runtime used.
    struct GodotJSClassInfo
    {
        enum Flags : uint8_t
        {
            None = 0,

            //TODO we have no idea about it with javascript itself. maybe we can decorate the abstract class and check here?
            Abstract = 1,
        };

        StringName module_id;

        // js class name
        StringName js_class_name;
        v8::Global<v8::Object> js_class;

        NativeClassID native_class_id;
        StringName native_class_name;

        Flags flags = None;

        HashMap<StringName, GodotJSMethodInfo> methods;
        HashMap<StringName, GodotJSMethodInfo> signals;
        HashMap<StringName, GodotJSPropertyInfo> properties;

        //TODO whether the internal class object alive or not
        bool is_valid() const { return true; }
    };
}

#endif
