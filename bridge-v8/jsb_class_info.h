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

        // template_ itself but instantiated
        //TODO it is unnecessary, but we can't get expected result of `get_function() == new_target` for some unknown reasons
        v8::Global<v8::Function> target_;

        jsb_force_inline void set_function(v8::Isolate* isolate, const v8::Local<v8::Function>& func)
        {
            target_.Reset(isolate, func);
        }

        jsb_force_inline v8::Local<v8::Function> get_function(v8::Isolate* isolate, const v8::Local<v8::Context>& context) const
        {
            jsb_check(!target_.IsEmpty());
            return target_.Get(isolate);
        }
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

        //TODO class_name is needed if type is OBJECT
        StringName class_name;

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

        // a default object instance for js_class (lazily created if there is a variable exported at least) with no crossbound object instance.
        // it's null if failed to construct the CDO.
        v8::Global<v8::Value> js_default_object;

        // the native class id the current class inherits from.
        NativeClassID native_class_id;

        // a fastpath to read the name of native class (the GodotJS class inherits from).
        // it's a redundant field only for performance.
        StringName native_class_name;

        GodotJSClassFlags::Type flags = GodotJSClassFlags::None;

        String icon;

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
