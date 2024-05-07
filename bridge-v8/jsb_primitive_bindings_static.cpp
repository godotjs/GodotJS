#include "jsb_primitive_bindings.h"
#if JSB_WITH_STATIC_PRIMITIVE_TYPE_BINDINGS
#error NOT SUPPORTED YET
#include "jsb_class_info.h"
#include "jsb_transpiler.h"

#define JSB_GENERATE_PROP_ACCESSORS(ClassName, FieldType, FieldName) \
    jsb_force_inline static FieldType ClassName##_##FieldName##_getter(ClassName* self) { return self->FieldName; } \
    jsb_force_inline static void ClassName##_##FieldName##_setter(ClassName* self, FieldType FieldName) { self->FieldName = FieldName; }

namespace jsb
{
    JSB_GENERATE_PROP_ACCESSORS(Vector2, real_t, x);
    JSB_GENERATE_PROP_ACCESSORS(Vector2, real_t, y);

    JSB_GENERATE_PROP_ACCESSORS(Vector3, real_t, x);
    JSB_GENERATE_PROP_ACCESSORS(Vector3, real_t, y);
    JSB_GENERATE_PROP_ACCESSORS(Vector3, real_t, z);

    JSB_GENERATE_PROP_ACCESSORS(Vector4, real_t, x);
    JSB_GENERATE_PROP_ACCESSORS(Vector4, real_t, y);
    JSB_GENERATE_PROP_ACCESSORS(Vector4, real_t, z);
    JSB_GENERATE_PROP_ACCESSORS(Vector4, real_t, w);

    NativeClassID bind_Vector2(const FBindingEnv& p_env)
    {
        NativeClassID class_id;
        const StringName class_name = jsb_typename(Vector2);
        NativeClassInfo& class_info = p_env.environment->add_class(NativeClassInfo::GodotPrimitive, class_name, &class_id);

        v8::Local<v8::FunctionTemplate> function_template = VariantClassTemplate<Vector2>::create<real_t, real_t>(p_env.isolate, class_id, class_info);
        v8::Local<v8::ObjectTemplate> prototype_template = function_template->PrototypeTemplate();

        // methods
        bind::method(p_env, prototype_template, jsb_methodbind(Vector2, dot));
        bind::method(p_env, prototype_template, jsb_methodbind(Vector2, move_toward));
        bind::property(p_env, prototype_template, Vector2_x_getter, Vector2_x_setter, jsb_nameof(Vector2, x));
        bind::property(p_env, prototype_template, Vector2_y_getter, Vector2_y_setter, jsb_nameof(Vector2, y));
        // bind::property<Vector2, real_t>(p_env, prototype_template, [](Vector2* self) { return self->y; }, [](Vector2* self, real_t val) { self->y = val; }, jsb_nameof(Vector2, y));

        //TODO better way to bind constants nested in type
        // v8::Local<v8::ObjectTemplate> instance_template = function_template->InstanceTemplate();
        v8::Local<v8::ObjectTemplate> obj_Axis = v8::ObjectTemplate::New(p_env.isolate);
        obj_Axis->Set(v8::String::NewFromUtf8Literal(p_env.isolate, "AXIS_X"), v8::Int32::New(p_env.isolate, Vector2::AXIS_X));
        obj_Axis->Set(v8::String::NewFromUtf8Literal(p_env.isolate, "AXIS_Y"), v8::Int32::New(p_env.isolate, Vector2::AXIS_Y));
        function_template->Set(v8::String::NewFromUtf8Literal(p_env.isolate, "Axis"), obj_Axis);

        return class_id;
    }

    NativeClassID bind_Vector3(const FBindingEnv& p_env)
    {
        NativeClassID class_id;
        const StringName class_name = jsb_typename(Vector3);
        NativeClassInfo& class_info = p_env.environment->add_class(NativeClassInfo::GodotPrimitive, class_name, &class_id);

        v8::Local<v8::FunctionTemplate> function_template = VariantClassTemplate<Vector3>::create<real_t, real_t, real_t>(p_env.isolate, class_id, class_info);
        v8::Local<v8::ObjectTemplate> prototype_template = function_template->PrototypeTemplate();

        // methods
        bind::method(p_env, prototype_template, jsb_methodbind(Vector3, min_axis_index));
        bind::method(p_env, prototype_template, jsb_methodbind(Vector3, max_axis_index));
        bind::method(p_env, prototype_template, jsb_methodbind(Vector3, min));
        bind::method(p_env, prototype_template, jsb_methodbind(Vector3, max));
        bind::method(p_env, prototype_template, jsb_methodbind(Vector3, length));
        bind::method(p_env, prototype_template, jsb_methodbind(Vector3, length_squared));
        bind::method(p_env, prototype_template, jsb_methodbind(Vector3, normalize));
        bind::method(p_env, prototype_template, jsb_methodbind(Vector3, normalized));
        bind::method(p_env, prototype_template, jsb_methodbind(Vector3, is_normalized));
        bind::method(p_env, prototype_template, jsb_methodbind(Vector3, inverse));
        bind::method(p_env, prototype_template, jsb_methodbind(Vector3, limit_length));
        bind::method(p_env, prototype_template, jsb_methodbind(Vector3, zero));
        bind::method(p_env, prototype_template, jsb_methodbind(Vector3, snap));
        bind::method(p_env, prototype_template, jsb_methodbind(Vector3, snapped));
        bind::method(p_env, prototype_template, jsb_methodbind(Vector3, rotate));
        bind::method(p_env, prototype_template, jsb_methodbind(Vector3, rotated));
        bind::method(p_env, prototype_template, jsb_methodbind(Vector3, lerp));
        bind::method(p_env, prototype_template, jsb_methodbind(Vector3, slerp));
        bind::method(p_env, prototype_template, jsb_methodbind(Vector3, cubic_interpolate));
        bind::method(p_env, prototype_template, jsb_methodbind(Vector3, cubic_interpolate_in_time));
        bind::method(p_env, prototype_template, jsb_methodbind(Vector3, bezier_interpolate));
        bind::method(p_env, prototype_template, jsb_methodbind(Vector3, bezier_derivative));
        bind::method(p_env, prototype_template, jsb_methodbind(Vector3, move_toward));
        bind::method(p_env, prototype_template, jsb_methodbind(Vector3, octahedron_encode));
        // bind::function(p_env, prototype_template, jsb_methodbind(Vector3, octahedron_encode));
        bind::method(p_env, prototype_template, jsb_methodbind(Vector3, octahedron_tangent_encode));
        // bind::function(p_env, prototype_template, jsb_methodbind(Vector3, octahedron_tangent_encode));
        bind::method(p_env, prototype_template, jsb_methodbind(Vector3, cross));
        bind::method(p_env, prototype_template, jsb_methodbind(Vector3, dot));
        bind::method(p_env, prototype_template, jsb_methodbind(Vector3, outer));
        bind::method(p_env, prototype_template, jsb_methodbind(Vector3, abs));
        bind::method(p_env, prototype_template, jsb_methodbind(Vector3, floor));
        bind::method(p_env, prototype_template, jsb_methodbind(Vector3, sign));
        bind::method(p_env, prototype_template, jsb_methodbind(Vector3, ceil));
        bind::method(p_env, prototype_template, jsb_methodbind(Vector3, round));
        bind::method(p_env, prototype_template, jsb_methodbind(Vector3, clamp));
        bind::method(p_env, prototype_template, jsb_methodbind(Vector3, distance_to));
        bind::method(p_env, prototype_template, jsb_methodbind(Vector3, distance_squared_to));
        bind::method(p_env, prototype_template, jsb_methodbind(Vector3, posmod));
        bind::method(p_env, prototype_template, jsb_methodbind(Vector3, posmodv));
        bind::method(p_env, prototype_template, jsb_methodbind(Vector3, project));
        bind::method(p_env, prototype_template, jsb_methodbind(Vector3, angle_to));
        bind::method(p_env, prototype_template, jsb_methodbind(Vector3, signed_angle_to));
        bind::method(p_env, prototype_template, jsb_methodbind(Vector3, direction_to));
        bind::method(p_env, prototype_template, jsb_methodbind(Vector3, slide));
        bind::method(p_env, prototype_template, jsb_methodbind(Vector3, bounce));
        bind::method(p_env, prototype_template, jsb_methodbind(Vector3, reflect));
        bind::method(p_env, prototype_template, jsb_methodbind(Vector3, is_equal_approx));
        bind::method(p_env, prototype_template, jsb_methodbind(Vector3, is_zero_approx));
        bind::method(p_env, prototype_template, jsb_methodbind(Vector3, is_finite));
        //TODO operators
        bind::property(p_env, prototype_template, Vector3_x_getter, Vector3_x_setter, jsb_nameof(Vector3, x));
        bind::property(p_env, prototype_template, Vector3_y_getter, Vector3_y_setter, jsb_nameof(Vector3, y));
        bind::property(p_env, prototype_template, Vector3_z_getter, Vector3_z_setter, jsb_nameof(Vector3, z));

        //TODO better way to bind constants nested in type
        // v8::Local<v8::ObjectTemplate> instance_template = function_template->InstanceTemplate();
        v8::Local<v8::ObjectTemplate> obj_Axis = v8::ObjectTemplate::New(p_env.isolate);
        obj_Axis->Set(v8::String::NewFromUtf8Literal(p_env.isolate, jsb_nameof(Vector3, AXIS_X)), v8::Int32::New(p_env.isolate, Vector3::AXIS_X));
        obj_Axis->Set(v8::String::NewFromUtf8Literal(p_env.isolate, jsb_nameof(Vector3, AXIS_Y)), v8::Int32::New(p_env.isolate, Vector3::AXIS_Y));
        obj_Axis->Set(v8::String::NewFromUtf8Literal(p_env.isolate, jsb_nameof(Vector3, AXIS_Z)), v8::Int32::New(p_env.isolate, Vector3::AXIS_Z));
        function_template->Set(v8::String::NewFromUtf8Literal(p_env.isolate, jsb_nameof(Vector3, Axis)), obj_Axis);

        return class_id;
    }

    NativeClassID bind_Vector4(const FBindingEnv& p_env)
    {
        NativeClassID class_id;
        const StringName class_name = jsb_typename(Vector4);
        NativeClassInfo& class_info = p_env.environment->add_class(NativeClassInfo::GodotPrimitive, class_name, &class_id);

        v8::Local<v8::FunctionTemplate> function_template = VariantClassTemplate<Vector4>::create<real_t, real_t, real_t, real_t>(p_env.isolate, class_id, class_info);
        v8::Local<v8::ObjectTemplate> prototype_template = function_template->PrototypeTemplate();

        // methods
        bind::method(p_env, prototype_template, jsb_methodbind(Vector4, dot));
        bind::property(p_env, prototype_template, Vector4_x_getter, Vector4_x_setter, jsb_nameof(Vector4, x));
        bind::property(p_env, prototype_template, Vector4_y_getter, Vector4_y_setter, jsb_nameof(Vector4, y));
        bind::property(p_env, prototype_template, Vector4_z_getter, Vector4_z_setter, jsb_nameof(Vector4, z));
        bind::property(p_env, prototype_template, Vector4_w_getter, Vector4_w_setter, jsb_nameof(Vector4, w));

        //TODO better way to bind constants nested in type
        // v8::Local<v8::ObjectTemplate> instance_template = function_template->InstanceTemplate();
        v8::Local<v8::ObjectTemplate> obj_Axis = v8::ObjectTemplate::New(p_env.isolate);
        obj_Axis->Set(v8::String::NewFromUtf8Literal(p_env.isolate, "AXIS_X"), v8::Int32::New(p_env.isolate, Vector4::AXIS_X));
        obj_Axis->Set(v8::String::NewFromUtf8Literal(p_env.isolate, "AXIS_Y"), v8::Int32::New(p_env.isolate, Vector4::AXIS_Y));
        obj_Axis->Set(v8::String::NewFromUtf8Literal(p_env.isolate, "AXIS_Z"), v8::Int32::New(p_env.isolate, Vector4::AXIS_Z));
        obj_Axis->Set(v8::String::NewFromUtf8Literal(p_env.isolate, "AXIS_W"), v8::Int32::New(p_env.isolate, Vector4::AXIS_W));
        function_template->Set(v8::String::NewFromUtf8Literal(p_env.isolate, "Axis"), obj_Axis);

        return class_id;
    }

    NativeClassID bind_Signal(const FBindingEnv& p_env)
    {
        NativeClassID class_id;
        const StringName class_name = jsb_typename(Signal);
        NativeClassInfo& class_info = p_env.environment->add_class(NativeClassInfo::GodotPrimitive, class_name, &class_id);

        v8::Local<v8::FunctionTemplate> function_template = VariantClassTemplate<Signal>::create(p_env.isolate, class_id, class_info);
        v8::Local<v8::ObjectTemplate> prototype_template = function_template->PrototypeTemplate();

        // methods
        bind::method(p_env, prototype_template, jsb_methodbind(Signal, connect));
        bind::method(p_env, prototype_template, jsb_methodbind(Signal, disconnect));
        bind::method(p_env, prototype_template, jsb_methodbind(Signal, is_connected));
        // bind::method_varargs(p_env, prototype_template, jsb_methodbind(Signal, emit));

        return class_id;
    }

    NativeClassID bind_Callable(const FBindingEnv& p_env)
    {
        NativeClassID class_id;
        const StringName class_name = jsb_typename(Callable);
        NativeClassInfo& class_info = p_env.environment->add_class(NativeClassInfo::GodotPrimitive, class_name, &class_id);

        v8::Local<v8::FunctionTemplate> function_template = VariantClassTemplate<Callable>::create(p_env.isolate, class_id, class_info);
        v8::Local<v8::ObjectTemplate> prototype_template = function_template->PrototypeTemplate();

        // methods
        // bind::method(p_env, prototype_template, jsb_methodbind(Callable, get_object));
        // bind::method_varargs(p_env, prototype_template, jsb_methodbind(Signal, emit));

        return class_id;
    }

    void register_primitive_bindings(class Realm* p_realm)
    {
        p_realm->register_primitive_binding(jsb_typename(Vector2), Variant::VECTOR2, bind_Vector2);
        p_realm->register_primitive_binding(jsb_typename(Vector3), Variant::VECTOR3, bind_Vector3);
        p_realm->register_primitive_binding(jsb_typename(Vector4), Variant::VECTOR4, bind_Vector4);
        p_realm->register_primitive_binding(jsb_typename(Signal), Variant::SIGNAL, bind_Signal);
        p_realm->register_primitive_binding(jsb_typename(Callable), Variant::CALLABLE, bind_Callable);
    }
}
#endif
