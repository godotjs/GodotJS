// AUTO-GENERATED
declare module "godot" {
    /** A 2×3 matrix representing a 2D transformation.  
     *  	  
     *  @link https://docs.godotengine.org/en/4.5/classes/class_transform2d.html  
     */
    class Transform2D {
        /** The identity [Transform2D]. This is a transform with no translation, no rotation, and a scale of [constant Vector2.ONE]. This also means that:  
         *  - The [member x] points right ([constant Vector2.RIGHT]);  
         *  - The [member y] points down ([constant Vector2.DOWN]).  
         *    
         *  If a [Vector2], a [Rect2], a [PackedVector2Array], or another [Transform2D] is transformed (multiplied) by this constant, no transformation occurs.  
         *      
         *  **Note:** In GDScript, this constant is equivalent to creating a [constructor Transform2D] without any arguments. It can be used to make your code clearer, and for consistency with C#.  
         */
        static readonly IDENTITY: Readonly<Transform2D>
        
        /** When any transform is multiplied by [constant FLIP_X], it negates all components of the [member x] axis (the X column).  
         *  When [constant FLIP_X] is multiplied by any transform, it negates the [member Vector2.x] component of all axes (the X row).  
         */
        static readonly FLIP_X: Readonly<Transform2D>
        
        /** When any transform is multiplied by [constant FLIP_Y], it negates all components of the [member y] axis (the Y column).  
         *  When [constant FLIP_Y] is multiplied by any transform, it negates the [member Vector2.y] component of all axes (the Y row).  
         */
        static readonly FLIP_Y: Readonly<Transform2D>
        constructor()
        constructor(from: Transform2D)
        constructor(rotation: float64, position: Vector2)
        constructor(rotation: float64, scale: Vector2, skew: float64, position: Vector2)
        constructor(x_axis: Vector2, y_axis: Vector2, origin: Vector2)
        
        /** Returns the [url=https://en.wikipedia.org/wiki/Invertible_matrix]inverted version of this transform[/url].  
         *      
         *  **Note:** For this method to return correctly, the transform's basis needs to be  *orthonormal*  (see [method orthonormalized]). That means the basis should only represent a rotation. If it does not, use [method affine_inverse] instead.  
         */
        inverse(): Transform2D
        
        /** Returns the inverted version of this transform. Unlike [method inverse], this method works with almost any basis, including non-uniform ones, but is slower.  
         *      
         *  **Note:** For this method to return correctly, the transform's basis needs to have a determinant that is not exactly `0.0` (see [method determinant]).  
         */
        affine_inverse(): Transform2D
        
        /** Returns this transform's rotation (in radians). This is equivalent to [member x]'s angle (see [method Vector2.angle]). */
        get_rotation(): float64
        
        /** Returns this transform's translation. Equivalent to [member origin]. */
        get_origin(): Vector2
        
        /** Returns the length of both [member x] and [member y], as a [Vector2]. If this transform's basis is not skewed, this value is the scaling factor. It is not affected by rotation.  
         *    
         *      
         *  **Note:** If the value returned by [method determinant] is negative, the scale is also negative.  
         */
        get_scale(): Vector2
        
        /** Returns this transform's skew (in radians). */
        get_skew(): float64
        
        /** Returns a copy of this transform with its basis orthonormalized. An orthonormal basis is both  *orthogonal*  (the axes are perpendicular to each other) and  *normalized*  (the axes have a length of `1.0`), which also means it can only represent a rotation. */
        orthonormalized(): Transform2D
        
        /** Returns a copy of this transform rotated by the given [param angle] (in radians).  
         *  If [param angle] is positive, the transform is rotated clockwise.  
         *  This method is an optimized version of multiplying the given transform `X` with a corresponding rotation transform `R` from the left, i.e., `R * X`.  
         *  This can be seen as transforming with respect to the global/parent frame.  
         */
        rotated(angle: float64): Transform2D
        
        /** Returns a copy of the transform rotated by the given [param angle] (in radians).  
         *  This method is an optimized version of multiplying the given transform `X` with a corresponding rotation transform `R` from the right, i.e., `X * R`.  
         *  This can be seen as transforming with respect to the local frame.  
         */
        rotated_local(angle: float64): Transform2D
        
        /** Returns a copy of the transform scaled by the given [param scale] factor.  
         *  This method is an optimized version of multiplying the given transform `X` with a corresponding scaling transform `S` from the left, i.e., `S * X`.  
         *  This can be seen as transforming with respect to the global/parent frame.  
         */
        scaled(scale: Vector2): Transform2D
        
        /** Returns a copy of the transform scaled by the given [param scale] factor.  
         *  This method is an optimized version of multiplying the given transform `X` with a corresponding scaling transform `S` from the right, i.e., `X * S`.  
         *  This can be seen as transforming with respect to the local frame.  
         */
        scaled_local(scale: Vector2): Transform2D
        
        /** Returns a copy of the transform translated by the given [param offset].  
         *  This method is an optimized version of multiplying the given transform `X` with a corresponding translation transform `T` from the left, i.e., `T * X`.  
         *  This can be seen as transforming with respect to the global/parent frame.  
         */
        translated(offset: Vector2): Transform2D
        
        /** Returns a copy of the transform translated by the given [param offset].  
         *  This method is an optimized version of multiplying the given transform `X` with a corresponding translation transform `T` from the right, i.e., `X * T`.  
         *  This can be seen as transforming with respect to the local frame.  
         */
        translated_local(offset: Vector2): Transform2D
        
        /** Returns the [url=https://en.wikipedia.org/wiki/Determinant]determinant[/url] of this transform basis's matrix. For advanced math, this number can be used to determine a few attributes:  
         *  - If the determinant is exactly `0.0`, the basis is not invertible (see [method inverse]).  
         *  - If the determinant is a negative number, the basis represents a negative scale.  
         *      
         *  **Note:** If the basis's scale is the same for every axis, its determinant is always that scale by the power of 2.  
         */
        determinant(): float64
        
        /** Returns a copy of the [param v] vector, transformed (multiplied) by the transform basis's matrix. Unlike the multiplication operator (`*`), this method ignores the [member origin]. */
        basis_xform(v: Vector2): Vector2
        
        /** Returns a copy of the [param v] vector, transformed (multiplied) by the inverse transform basis's matrix (see [method inverse]). This method ignores the [member origin].  
         *      
         *  **Note:** This method assumes that this transform's basis is  *orthonormal*  (see [method orthonormalized]). If the basis is not orthonormal, `transform.affine_inverse().basis_xform(vector)` should be used instead (see [method affine_inverse]).  
         */
        basis_xform_inv(v: Vector2): Vector2
        
        /** Returns the result of the linear interpolation between this transform and [param xform] by the given [param weight].  
         *  The [param weight] should be between `0.0` and `1.0` (inclusive). Values outside this range are allowed and can be used to perform  *extrapolation*  instead.  
         */
        interpolate_with(xform: Transform2D, weight: float64): Transform2D
        
        /** Returns `true` if this transform's basis is conformal. A conformal basis is both  *orthogonal*  (the axes are perpendicular to each other) and  *uniform*  (the axes share the same length). This method can be especially useful during physics calculations. */
        is_conformal(): boolean
        
        /** Returns `true` if this transform and [param xform] are approximately equal, by running [method @GlobalScope.is_equal_approx] on each component. */
        is_equal_approx(xform: Transform2D): boolean
        
        /** Returns `true` if this transform is finite, by calling [method @GlobalScope.is_finite] on each component. */
        is_finite(): boolean
        
        /** Returns a copy of the transform rotated such that the rotated X-axis points towards the [param target] position, in global space. */
        looking_at(target?: Vector2 /* = Vector2.ZERO */): Transform2D
        static MULTIPLY(left: Transform2D, right: Transform2D): Transform2D
        static MULTIPLY(left: Transform2D, right: float64): Transform2D
        static MULTIPLY(left: Transform2D, right: Vector2): Vector2
        static MULTIPLY(left: Vector2, right: Transform2D): Vector2
        static MULTIPLY(left: Transform2D, right: Rect2): Rect2
        static MULTIPLY(left: Rect2, right: Transform2D): Rect2
        static MULTIPLY(left: Transform2D, right: PackedVector2Array | Vector2[]): PackedVector2Array
        static MULTIPLY(left: PackedVector2Array | Vector2[], right: Transform2D): PackedVector2Array
        static EQUAL(left: Transform2D, right: Transform2D): boolean
        static NOT_EQUAL(left: Transform2D, right: Transform2D): boolean
        get x(): Vector2
        set x(value: Vector2)
        get y(): Vector2
        set y(value: Vector2)
        get origin(): Vector2
        set origin(value: Vector2)
    }
    namespace Vector4 {
        enum Axis {
            /** Enumerated value for the X axis. Returned by [method max_axis_index] and [method min_axis_index]. */
            AXIS_X = 0,
            
            /** Enumerated value for the Y axis. Returned by [method max_axis_index] and [method min_axis_index]. */
            AXIS_Y = 1,
            
            /** Enumerated value for the Z axis. Returned by [method max_axis_index] and [method min_axis_index]. */
            AXIS_Z = 2,
            
            /** Enumerated value for the W axis. Returned by [method max_axis_index] and [method min_axis_index]. */
            AXIS_W = 3,
        }
    }
    /** A 4D vector using floating-point coordinates.  
     *  	  
     *  @link https://docs.godotengine.org/en/4.5/classes/class_vector4.html  
     */
    class Vector4 {
        /** Zero vector, a vector with all components set to `0`. */
        static readonly ZERO: Readonly<Vector4>
        
        /** One vector, a vector with all components set to `1`. */
        static readonly ONE: Readonly<Vector4>
        
        /** Infinity vector, a vector with all components set to [constant @GDScript.INF]. */
        static readonly INF: Readonly<Vector4>
        constructor()
        constructor(from: Vector4)
        constructor(from: Vector4i)
        constructor(x: float64, y: float64, z: float64, w: float64)
        
        /** Returns the axis of the vector's lowest value. See `AXIS_*` constants. If all components are equal, this method returns [constant AXIS_W]. */
        min_axis_index(): int64
        
        /** Returns the axis of the vector's highest value. See `AXIS_*` constants. If all components are equal, this method returns [constant AXIS_X]. */
        max_axis_index(): int64
        
        /** Returns the length (magnitude) of this vector. */
        length(): float64
        
        /** Returns the squared length (squared magnitude) of this vector.  
         *  This method runs faster than [method length], so prefer it if you need to compare vectors or need the squared distance for some formula.  
         */
        length_squared(): float64
        
        /** Returns a new vector with all components in absolute values (i.e. positive). */
        abs(): Vector4
        
        /** Returns a new vector with each component set to `1.0` if it's positive, `-1.0` if it's negative, and `0.0` if it's zero. The result is identical to calling [method @GlobalScope.sign] on each component. */
        sign(): Vector4
        
        /** Returns a new vector with all components rounded down (towards negative infinity). */
        floor(): Vector4
        
        /** Returns a new vector with all components rounded up (towards positive infinity). */
        ceil(): Vector4
        
        /** Returns a new vector with all components rounded to the nearest integer, with halfway cases rounded away from zero. */
        round(): Vector4
        
        /** Returns the result of the linear interpolation between this vector and [param to] by amount [param weight]. [param weight] is on the range of `0.0` to `1.0`, representing the amount of interpolation. */
        lerp(to: Vector4, weight: float64): Vector4
        
        /** Performs a cubic interpolation between this vector and [param b] using [param pre_a] and [param post_b] as handles, and returns the result at position [param weight]. [param weight] is on the range of 0.0 to 1.0, representing the amount of interpolation. */
        cubic_interpolate(b: Vector4, pre_a: Vector4, post_b: Vector4, weight: float64): Vector4
        
        /** Performs a cubic interpolation between this vector and [param b] using [param pre_a] and [param post_b] as handles, and returns the result at position [param weight]. [param weight] is on the range of 0.0 to 1.0, representing the amount of interpolation.  
         *  It can perform smoother interpolation than [method cubic_interpolate] by the time values.  
         */
        cubic_interpolate_in_time(b: Vector4, pre_a: Vector4, post_b: Vector4, weight: float64, b_t: float64, pre_a_t: float64, post_b_t: float64): Vector4
        
        /** Returns a vector composed of the [method @GlobalScope.fposmod] of this vector's components and [param mod]. */
        posmod(mod: float64): Vector4
        
        /** Returns a vector composed of the [method @GlobalScope.fposmod] of this vector's components and [param modv]'s components. */
        posmodv(modv: Vector4): Vector4
        
        /** Returns a new vector with each component snapped to the nearest multiple of the corresponding component in [param step]. This can also be used to round the components to an arbitrary number of decimals. */
        snapped(step: Vector4): Vector4
        
        /** Returns a new vector with each component snapped to the nearest multiple of [param step]. This can also be used to round the components to an arbitrary number of decimals. */
        snappedf(step: float64): Vector4
        
        /** Returns a new vector with all components clamped between the components of [param min] and [param max], by running [method @GlobalScope.clamp] on each component. */
        clamp(min: Vector4, max: Vector4): Vector4
        
        /** Returns a new vector with all components clamped between [param min] and [param max], by running [method @GlobalScope.clamp] on each component. */
        clampf(min: float64, max: float64): Vector4
        
        /** Returns the result of scaling the vector to unit length. Equivalent to `v / v.length()`. Returns `(0, 0, 0, 0)` if `v.length() == 0`. See also [method is_normalized].  
         *      
         *  **Note:** This function may return incorrect values if the input vector length is near zero.  
         */
        normalized(): Vector4
        
        /** Returns `true` if the vector is normalized, i.e. its length is approximately equal to 1. */
        is_normalized(): boolean
        
        /** Returns the normalized vector pointing from this vector to [param to]. This is equivalent to using `(b - a).normalized()`. */
        direction_to(to: Vector4): Vector4
        
        /** Returns the distance between this vector and [param to]. */
        distance_to(to: Vector4): float64
        
        /** Returns the squared distance between this vector and [param to].  
         *  This method runs faster than [method distance_to], so prefer it if you need to compare vectors or need the squared distance for some formula.  
         */
        distance_squared_to(to: Vector4): float64
        
        /** Returns the dot product of this vector and [param with]. */
        dot(with_: Vector4): float64
        
        /** Returns the inverse of the vector. This is the same as `Vector4(1.0 / v.x, 1.0 / v.y, 1.0 / v.z, 1.0 / v.w)`. */
        inverse(): Vector4
        
        /** Returns `true` if this vector and [param to] are approximately equal, by running [method @GlobalScope.is_equal_approx] on each component. */
        is_equal_approx(to: Vector4): boolean
        
        /** Returns `true` if this vector's values are approximately zero, by running [method @GlobalScope.is_zero_approx] on each component.  
         *  This method is faster than using [method is_equal_approx] with one value as a zero vector.  
         */
        is_zero_approx(): boolean
        
        /** Returns `true` if this vector is finite, by calling [method @GlobalScope.is_finite] on each component. */
        is_finite(): boolean
        
        /** Returns the component-wise minimum of this and [param with], equivalent to `Vector4(minf(x, with.x), minf(y, with.y), minf(z, with.z), minf(w, with.w))`. */
        min(with_: Vector4): Vector4
        
        /** Returns the component-wise minimum of this and [param with], equivalent to `Vector4(minf(x, with), minf(y, with), minf(z, with), minf(w, with))`. */
        minf(with_: float64): Vector4
        
        /** Returns the component-wise maximum of this and [param with], equivalent to `Vector4(maxf(x, with.x), maxf(y, with.y), maxf(z, with.z), maxf(w, with.w))`. */
        max(with_: Vector4): Vector4
        
        /** Returns the component-wise maximum of this and [param with], equivalent to `Vector4(maxf(x, with), maxf(y, with), maxf(z, with), maxf(w, with))`. */
        maxf(with_: float64): Vector4
        static ADD(left: Vector4, right: Vector4): Vector4
        static SUBTRACT(left: Vector4, right: Vector4): Vector4
        static MULTIPLY(left: float64, right: Vector4): Vector4
        static MULTIPLY(left: Vector4, right: Vector4): Vector4
        static MULTIPLY(left: Vector4, right: float64): Vector4
        static DIVIDE(left: Vector4, right: Vector4): Vector4
        static DIVIDE(left: Vector4, right: float64): Vector4
        static NEGATE(left: Vector4): Vector4
        static EQUAL(left: Vector4, right: Vector4): boolean
        static NOT_EQUAL(left: Vector4, right: Vector4): boolean
        static LESS(left: Vector4, right: Vector4): boolean
        static LESS_EQUAL(left: Vector4, right: Vector4): boolean
        static GREATER(left: Vector4, right: Vector4): boolean
        static GREATER_EQUAL(left: Vector4, right: Vector4): boolean
        get x(): float64
        set x(value: float64)
        get y(): float64
        set y(value: float64)
        get z(): float64
        set z(value: float64)
        get w(): float64
        set w(value: float64)
    }
    namespace Vector4i {
        enum Axis {
            /** Enumerated value for the X axis. Returned by [method max_axis_index] and [method min_axis_index]. */
            AXIS_X = 0,
            
            /** Enumerated value for the Y axis. Returned by [method max_axis_index] and [method min_axis_index]. */
            AXIS_Y = 1,
            
            /** Enumerated value for the Z axis. Returned by [method max_axis_index] and [method min_axis_index]. */
            AXIS_Z = 2,
            
            /** Enumerated value for the W axis. Returned by [method max_axis_index] and [method min_axis_index]. */
            AXIS_W = 3,
        }
    }
    /** A 4D vector using integer coordinates.  
     *  	  
     *  @link https://docs.godotengine.org/en/4.5/classes/class_vector4i.html  
     */
    class Vector4i {
        /** Zero vector, a vector with all components set to `0`. */
        static readonly ZERO: Readonly<Vector4i>
        
        /** One vector, a vector with all components set to `1`. */
        static readonly ONE: Readonly<Vector4i>
        
        /** Min vector, a vector with all components equal to `INT32_MIN`. Can be used as a negative integer equivalent of [constant Vector4.INF]. */
        static readonly MIN: Readonly<Vector4i>
        
        /** Max vector, a vector with all components equal to `INT32_MAX`. Can be used as an integer equivalent of [constant Vector4.INF]. */
        static readonly MAX: Readonly<Vector4i>
        constructor()
        constructor(from: Vector4i)
        constructor(from: Vector4)
        constructor(x: int64, y: int64, z: int64, w: int64)
        
        /** Returns the axis of the vector's lowest value. See `AXIS_*` constants. If all components are equal, this method returns [constant AXIS_W]. */
        min_axis_index(): int64
        
        /** Returns the axis of the vector's highest value. See `AXIS_*` constants. If all components are equal, this method returns [constant AXIS_X]. */
        max_axis_index(): int64
        
        /** Returns the length (magnitude) of this vector. */
        length(): float64
        
        /** Returns the squared length (squared magnitude) of this vector.  
         *  This method runs faster than [method length], so prefer it if you need to compare vectors or need the squared distance for some formula.  
         */
        length_squared(): int64
        
        /** Returns a new vector with each component set to `1` if it's positive, `-1` if it's negative, and `0` if it's zero. The result is identical to calling [method @GlobalScope.sign] on each component. */
        sign(): Vector4i
        
        /** Returns a new vector with all components in absolute values (i.e. positive). */
        abs(): Vector4i
        
        /** Returns a new vector with all components clamped between the components of [param min] and [param max], by running [method @GlobalScope.clamp] on each component. */
        clamp(min: Vector4i, max: Vector4i): Vector4i
        
        /** Returns a new vector with all components clamped between [param min] and [param max], by running [method @GlobalScope.clamp] on each component. */
        clampi(min: int64, max: int64): Vector4i
        
        /** Returns a new vector with each component snapped to the closest multiple of the corresponding component in [param step]. */
        snapped(step: Vector4i): Vector4i
        
        /** Returns a new vector with each component snapped to the closest multiple of [param step]. */
        snappedi(step: int64): Vector4i
        
        /** Returns the component-wise minimum of this and [param with], equivalent to `Vector4i(mini(x, with.x), mini(y, with.y), mini(z, with.z), mini(w, with.w))`. */
        min(with_: Vector4i): Vector4i
        
        /** Returns the component-wise minimum of this and [param with], equivalent to `Vector4i(mini(x, with), mini(y, with), mini(z, with), mini(w, with))`. */
        mini(with_: int64): Vector4i
        
        /** Returns the component-wise maximum of this and [param with], equivalent to `Vector4i(maxi(x, with.x), maxi(y, with.y), maxi(z, with.z), maxi(w, with.w))`. */
        max(with_: Vector4i): Vector4i
        
        /** Returns the component-wise maximum of this and [param with], equivalent to `Vector4i(maxi(x, with), maxi(y, with), maxi(z, with), maxi(w, with))`. */
        maxi(with_: int64): Vector4i
        
        /** Returns the distance between this vector and [param to]. */
        distance_to(to: Vector4i): float64
        
        /** Returns the squared distance between this vector and [param to].  
         *  This method runs faster than [method distance_to], so prefer it if you need to compare vectors or need the squared distance for some formula.  
         */
        distance_squared_to(to: Vector4i): int64
        static ADD(left: Vector4i, right: Vector4i): Vector4i
        static SUBTRACT(left: Vector4i, right: Vector4i): Vector4i
        static MULTIPLY(left: float64, right: Vector4i): Vector4i
        static MULTIPLY(left: Vector4i, right: Vector4i): Vector4i
        static MULTIPLY(left: Vector4i, right: float64): Vector4i
        static DIVIDE(left: Vector4i, right: Vector4i): Vector4i
        static DIVIDE(left: Vector4i, right: float64): Vector4i
        static NEGATE(left: Vector4i): Vector4i
        static EQUAL(left: Vector4i, right: Vector4i): boolean
        static NOT_EQUAL(left: Vector4i, right: Vector4i): boolean
        static LESS(left: Vector4i, right: Vector4i): boolean
        static LESS_EQUAL(left: Vector4i, right: Vector4i): boolean
        static GREATER(left: Vector4i, right: Vector4i): boolean
        static GREATER_EQUAL(left: Vector4i, right: Vector4i): boolean
        get x(): int64
        set x(value: int64)
        get y(): int64
        set y(value: int64)
        get z(): int64
        set z(value: int64)
        get w(): int64
        set w(value: int64)
    }
    /** A plane in Hessian normal form.  
     *  	  
     *  @link https://docs.godotengine.org/en/4.5/classes/class_plane.html  
     */
    class Plane {
        /** A plane that extends in the Y and Z axes (normal vector points +X). */
        static readonly PLANE_YZ: Readonly<Plane>
        
        /** A plane that extends in the X and Z axes (normal vector points +Y). */
        static readonly PLANE_XZ: Readonly<Plane>
        
        /** A plane that extends in the X and Y axes (normal vector points +Z). */
        static readonly PLANE_XY: Readonly<Plane>
        constructor()
        constructor(from: Plane)
        constructor(normal: Vector3)
        constructor(normal: Vector3, d: float64)
        constructor(normal: Vector3, point: Vector3)
        constructor(point1: Vector3, point2: Vector3, point3: Vector3)
        constructor(a: float64, b: float64, c: float64, d: float64)
        
        /** Returns a copy of the plane, with normalized [member normal] (so it's a unit vector). Returns `Plane(0, 0, 0, 0)` if [member normal] can't be normalized (it has zero length). */
        normalized(): Plane
        
        /** Returns the center of the plane. */
        get_center(): Vector3
        
        /** Returns `true` if this plane and [param to_plane] are approximately equal, by running [method @GlobalScope.is_equal_approx] on each component. */
        is_equal_approx(to_plane: Plane): boolean
        
        /** Returns `true` if this plane is finite, by calling [method @GlobalScope.is_finite] on each component. */
        is_finite(): boolean
        
        /** Returns `true` if [param point] is located above the plane. */
        is_point_over(point: Vector3): boolean
        
        /** Returns the shortest distance from the plane to the position [param point]. If the point is above the plane, the distance will be positive. If below, the distance will be negative. */
        distance_to(point: Vector3): float64
        
        /** Returns `true` if [param point] is inside the plane. Comparison uses a custom minimum [param tolerance] threshold. */
        has_point(point: Vector3, tolerance?: float64 /* = 0.00001 */): boolean
        
        /** Returns the orthogonal projection of [param point] into a point in the plane. */
        project(point: Vector3): Vector3
        
        /** Returns the intersection point of the three planes [param b], [param c] and this plane. If no intersection is found, `null` is returned. */
        intersect_3(b: Plane, c: Plane): any
        
        /** Returns the intersection point of a ray consisting of the position [param from] and the direction normal [param dir] with this plane. If no intersection is found, `null` is returned. */
        intersects_ray(from: Vector3, dir: Vector3): any
        
        /** Returns the intersection point of a segment from position [param from] to position [param to] with this plane. If no intersection is found, `null` is returned. */
        intersects_segment(from: Vector3, to: Vector3): any
        static NEGATE(left: Plane): Plane
        static EQUAL(left: Plane, right: Plane): boolean
        static NOT_EQUAL(left: Plane, right: Plane): boolean
        get x(): float64
        set x(value: float64)
        get y(): float64
        set y(value: float64)
        get z(): float64
        set z(value: float64)
        get d(): float64
        set d(value: float64)
        get normal(): Vector3
        set normal(value: Vector3)
    }
    /** A unit quaternion used for representing 3D rotations.  
     *  	  
     *  @link https://docs.godotengine.org/en/4.5/classes/class_quaternion.html  
     */
    class Quaternion {
        /** The identity quaternion, representing no rotation. This has the same rotation as [constant Basis.IDENTITY].  
         *  If a [Vector3] is rotated (multiplied) by this quaternion, it does not change.  
         *      
         *  **Note:** In GDScript, this constant is equivalent to creating a [constructor Quaternion] without any arguments. It can be used to make your code clearer, and for consistency with C#.  
         */
        static readonly IDENTITY: Readonly<Quaternion>
        constructor()
        constructor(from: Quaternion)
        constructor(from: Basis)
        constructor(axis: Vector3, angle: float64)
        constructor(arc_from: Vector3, arc_to: Vector3)
        constructor(x: float64, y: float64, z: float64, w: float64)
        
        /** Returns this quaternion's length, also called magnitude. */
        length(): float64
        
        /** Returns this quaternion's length, squared.  
         *      
         *  **Note:** This method is faster than [method length], so prefer it if you only need to compare quaternion lengths.  
         */
        length_squared(): float64
        
        /** Returns a copy of this quaternion, normalized so that its length is `1.0`. See also [method is_normalized]. */
        normalized(): Quaternion
        
        /** Returns `true` if this quaternion is normalized. See also [method normalized]. */
        is_normalized(): boolean
        
        /** Returns `true` if this quaternion and [param to] are approximately equal, by calling [method @GlobalScope.is_equal_approx] on each component. */
        is_equal_approx(to: Quaternion): boolean
        
        /** Returns `true` if this quaternion is finite, by calling [method @GlobalScope.is_finite] on each component. */
        is_finite(): boolean
        
        /** Returns the inverse version of this quaternion, inverting the sign of every component except [member w]. */
        inverse(): Quaternion
        
        /** Returns the logarithm of this quaternion. Multiplies this quaternion's rotation axis by its rotation angle, and stores the result in the returned quaternion's vector part ([member x], [member y], and [member z]). The returned quaternion's real part ([member w]) is always `0.0`. */
        log(): Quaternion
        
        /** Returns the exponential of this quaternion. The rotation axis of the result is the normalized rotation axis of this quaternion, the angle of the result is the length of the vector part of this quaternion. */
        exp(): Quaternion
        
        /** Returns the angle between this quaternion and [param to]. This is the magnitude of the angle you would need to rotate by to get from one to the other.  
         *      
         *  **Note:** The magnitude of the floating-point error for this method is abnormally high, so methods such as `is_zero_approx` will not work reliably.  
         */
        angle_to(to: Quaternion): float64
        
        /** Returns the dot product between this quaternion and [param with].  
         *  This is equivalent to `(quat.x * with.x) + (quat.y * with.y) + (quat.z * with.z) + (quat.w * with.w)`.  
         */
        dot(with_: Quaternion): float64
        
        /** Performs a spherical-linear interpolation with the [param to] quaternion, given a [param weight] and returns the result. Both this quaternion and [param to] must be normalized. */
        slerp(to: Quaternion, weight: float64): Quaternion
        
        /** Performs a spherical-linear interpolation with the [param to] quaternion, given a [param weight] and returns the result. Unlike [method slerp], this method does not check if the rotation path is smaller than 90 degrees. Both this quaternion and [param to] must be normalized. */
        slerpni(to: Quaternion, weight: float64): Quaternion
        
        /** Performs a spherical cubic interpolation between quaternions [param pre_a], this vector, [param b], and [param post_b], by the given amount [param weight]. */
        spherical_cubic_interpolate(b: Quaternion, pre_a: Quaternion, post_b: Quaternion, weight: float64): Quaternion
        
        /** Performs a spherical cubic interpolation between quaternions [param pre_a], this vector, [param b], and [param post_b], by the given amount [param weight].  
         *  It can perform smoother interpolation than [method spherical_cubic_interpolate] by the time values.  
         */
        spherical_cubic_interpolate_in_time(b: Quaternion, pre_a: Quaternion, post_b: Quaternion, weight: float64, b_t: float64, pre_a_t: float64, post_b_t: float64): Quaternion
        
        /** Returns this quaternion's rotation as a [Vector3] of [url=https://en.wikipedia.org/wiki/Euler_angles]Euler angles[/url], in radians.  
         *  The order of each consecutive rotation can be changed with [param order] (see [enum EulerOrder] constants). By default, the YXZ convention is used ([constant EULER_ORDER_YXZ]): Z (roll) is calculated first, then X (pitch), and lastly Y (yaw). When using the opposite method [method from_euler], this order is reversed.  
         */
        get_euler(order?: int64 /* = 2 */): Vector3
        
        /** Constructs a new [Quaternion] from the given [Vector3] of [url=https://en.wikipedia.org/wiki/Euler_angles]Euler angles[/url], in radians. This method always uses the YXZ convention ([constant EULER_ORDER_YXZ]). */
        static from_euler(euler: Vector3): Quaternion
        
        /** Returns the rotation axis of the rotation represented by this quaternion. */
        get_axis(): Vector3
        
        /** Returns the angle of the rotation represented by this quaternion.  
         *      
         *  **Note:** The quaternion must be normalized.  
         */
        get_angle(): float64
        static ADD(left: Quaternion, right: Quaternion): Quaternion
        static SUBTRACT(left: Quaternion, right: Quaternion): Quaternion
        static MULTIPLY(left: Quaternion, right: Quaternion): Quaternion
        static MULTIPLY(left: Quaternion, right: float64): Quaternion
        static MULTIPLY(left: float64, right: Quaternion): Quaternion
        static MULTIPLY(left: Vector3, right: Quaternion): Vector3
        static MULTIPLY(left: Quaternion, right: Vector3): Vector3
        static DIVIDE(left: Quaternion, right: float64): Quaternion
        static NEGATE(left: Quaternion): Quaternion
        static EQUAL(left: Quaternion, right: Quaternion): boolean
        static NOT_EQUAL(left: Quaternion, right: Quaternion): boolean
        get x(): float64
        set x(value: float64)
        get y(): float64
        set y(value: float64)
        get z(): float64
        set z(value: float64)
        get w(): float64
        set w(value: float64)
    }
    /** A 3D axis-aligned bounding box.  
     *  	  
     *  @link https://docs.godotengine.org/en/4.5/classes/class_aabb.html  
     */
    class AABB {
        constructor()
        constructor(from: AABB)
        constructor(position: Vector3, size: Vector3)
        
        /** Returns an [AABB] equivalent to this bounding box, with its width, height, and depth modified to be non-negative values.  
         *    
         *      
         *  **Note:** It's recommended to use this method when [member size] is negative, as most other methods in Godot assume that the [member size]'s components are greater than `0`.  
         */
        abs(): AABB
        
        /** Returns the center point of the bounding box. This is the same as `position + (size / 2.0)`. */
        get_center(): Vector3
        
        /** Returns the bounding box's volume. This is equivalent to `size.x * size.y * size.z`. See also [method has_volume]. */
        get_volume(): float64
        
        /** Returns `true` if this bounding box's width, height, and depth are all positive. See also [method get_volume]. */
        has_volume(): boolean
        
        /** Returns `true` if this bounding box has a surface or a length, that is, at least one component of [member size] is greater than `0`. Otherwise, returns `false`. */
        has_surface(): boolean
        
        /** Returns `true` if the bounding box contains the given [param point]. By convention, points exactly on the right, top, and front sides are **not** included.  
         *      
         *  **Note:** This method is not reliable for [AABB] with a  *negative*  [member size]. Use [method abs] first to get a valid bounding box.  
         */
        has_point(point: Vector3): boolean
        
        /** Returns `true` if this bounding box and [param aabb] are approximately equal, by calling [method Vector3.is_equal_approx] on the [member position] and the [member size]. */
        is_equal_approx(aabb: AABB): boolean
        
        /** Returns `true` if this bounding box's values are finite, by calling [method Vector3.is_finite] on the [member position] and the [member size]. */
        is_finite(): boolean
        
        /** Returns `true` if this bounding box overlaps with the box [param with]. The edges of both boxes are  *always*  excluded. */
        intersects(with_: AABB): boolean
        
        /** Returns `true` if this bounding box  *completely*  encloses the [param with] box. The edges of both boxes are included.  
         *    
         */
        encloses(with_: AABB): boolean
        
        /** Returns `true` if this bounding box is on both sides of the given [param plane]. */
        intersects_plane(plane: Plane): boolean
        
        /** Returns the intersection between this bounding box and [param with]. If the boxes do not intersect, returns an empty [AABB]. If the boxes intersect at the edge, returns a flat [AABB] with no volume (see [method has_surface] and [method has_volume]).  
         *    
         *      
         *  **Note:** If you only need to know whether two bounding boxes are intersecting, use [method intersects], instead.  
         */
        intersection(with_: AABB): AABB
        
        /** Returns an [AABB] that encloses both this bounding box and [param with] around the edges. See also [method encloses]. */
        merge(with_: AABB): AABB
        
        /** Returns a copy of this bounding box expanded to align the edges with the given [param to_point], if necessary.  
         *    
         */
        expand(to_point: Vector3): AABB
        
        /** Returns a copy of this bounding box extended on all sides by the given amount [param by]. A negative amount shrinks the box instead.  
         *    
         */
        grow(by: float64): AABB
        
        /** Returns the vertex's position of this bounding box that's the farthest in the given direction. This point is commonly known as the support point in collision detection algorithms. */
        get_support(direction: Vector3): Vector3
        
        /** Returns the longest normalized axis of this bounding box's [member size], as a [Vector3] ([constant Vector3.RIGHT], [constant Vector3.UP], or [constant Vector3.BACK]).  
         *    
         *  See also [method get_longest_axis_index] and [method get_longest_axis_size].  
         */
        get_longest_axis(): Vector3
        
        /** Returns the index to the longest axis of this bounding box's [member size] (see [constant Vector3.AXIS_X], [constant Vector3.AXIS_Y], and [constant Vector3.AXIS_Z]).  
         *  For an example, see [method get_longest_axis].  
         */
        get_longest_axis_index(): int64
        
        /** Returns the longest dimension of this bounding box's [member size].  
         *  For an example, see [method get_longest_axis].  
         */
        get_longest_axis_size(): float64
        
        /** Returns the shortest normalized axis of this bounding box's [member size], as a [Vector3] ([constant Vector3.RIGHT], [constant Vector3.UP], or [constant Vector3.BACK]).  
         *    
         *  See also [method get_shortest_axis_index] and [method get_shortest_axis_size].  
         */
        get_shortest_axis(): Vector3
        
        /** Returns the index to the shortest axis of this bounding box's [member size] (see [constant Vector3.AXIS_X], [constant Vector3.AXIS_Y], and [constant Vector3.AXIS_Z]).  
         *  For an example, see [method get_shortest_axis].  
         */
        get_shortest_axis_index(): int64
        
        /** Returns the shortest dimension of this bounding box's [member size].  
         *  For an example, see [method get_shortest_axis].  
         */
        get_shortest_axis_size(): float64
        
        /** Returns the position of one of the 8 vertices that compose this bounding box. With an [param idx] of `0` this is the same as [member position], and an [param idx] of `7` is the same as [member end]. */
        get_endpoint(idx: int64): Vector3
        
        /** Returns the first point where this bounding box and the given segment intersect, as a [Vector3]. If no intersection occurs, returns `null`.  
         *  The segment begins at [param from] and ends at [param to].  
         */
        intersects_segment(from: Vector3, to: Vector3): any
        
        /** Returns the first point where this bounding box and the given ray intersect, as a [Vector3]. If no intersection occurs, returns `null`.  
         *  The ray begin at [param from], faces [param dir] and extends towards infinity.  
         */
        intersects_ray(from: Vector3, dir: Vector3): any
        static EQUAL(left: AABB, right: AABB): boolean
        static NOT_EQUAL(left: AABB, right: AABB): boolean
        get position(): Vector3
        set position(value: Vector3)
        get size(): Vector3
        set size(value: Vector3)
        get end(): Vector3
        set end(value: Vector3)
    }
    /** A 3×3 matrix for representing 3D rotation and scale.  
     *  	  
     *  @link https://docs.godotengine.org/en/4.5/classes/class_basis.html  
     */
    class Basis {
        /** The identity [Basis]. This is an orthonormal basis with no rotation, no shear, and a scale of [constant Vector3.ONE]. This also means that:  
         *  - The [member x] points right ([constant Vector3.RIGHT]);  
         *  - The [member y] points up ([constant Vector3.UP]);  
         *  - The [member z] points back ([constant Vector3.BACK]).  
         *    
         *  If a [Vector3] or another [Basis] is transformed (multiplied) by this constant, no transformation occurs.  
         *      
         *  **Note:** In GDScript, this constant is equivalent to creating a [constructor Basis] without any arguments. It can be used to make your code clearer, and for consistency with C#.  
         */
        static readonly IDENTITY: Readonly<Basis>
        
        /** When any basis is multiplied by [constant FLIP_X], it negates all components of the [member x] axis (the X column).  
         *  When [constant FLIP_X] is multiplied by any basis, it negates the [member Vector3.x] component of all axes (the X row).  
         */
        static readonly FLIP_X: Readonly<Basis>
        
        /** When any basis is multiplied by [constant FLIP_Y], it negates all components of the [member y] axis (the Y column).  
         *  When [constant FLIP_Y] is multiplied by any basis, it negates the [member Vector3.y] component of all axes (the Y row).  
         */
        static readonly FLIP_Y: Readonly<Basis>
        
        /** When any basis is multiplied by [constant FLIP_Z], it negates all components of the [member z] axis (the Z column).  
         *  When [constant FLIP_Z] is multiplied by any basis, it negates the [member Vector3.z] component of all axes (the Z row).  
         */
        static readonly FLIP_Z: Readonly<Basis>
        constructor()
        constructor(from: Basis)
        constructor(from: Quaternion)
        constructor(axis: Vector3, angle: float64)
        constructor(x_axis: Vector3, y_axis: Vector3, z_axis: Vector3)
        
        /** Returns the [url=https://en.wikipedia.org/wiki/Invertible_matrix]inverse of this basis's matrix[/url]. */
        inverse(): Basis
        
        /** Returns the transposed version of this basis. This turns the basis matrix's columns into rows, and its rows into columns.  
         *    
         */
        transposed(): Basis
        
        /** Returns the orthonormalized version of this basis. An orthonormal basis is both  *orthogonal*  (the axes are perpendicular to each other) and  *normalized*  (the axes have a length of `1.0`), which also means it can only represent a rotation.  
         *  It is often useful to call this method to avoid rounding errors on a rotating basis:  
         *    
         */
        orthonormalized(): Basis
        
        /** Returns the [url=https://en.wikipedia.org/wiki/Determinant]determinant[/url] of this basis's matrix. For advanced math, this number can be used to determine a few attributes:  
         *  - If the determinant is exactly `0.0`, the basis is not invertible (see [method inverse]).  
         *  - If the determinant is a negative number, the basis represents a negative scale.  
         *      
         *  **Note:** If the basis's scale is the same for every axis, its determinant is always that scale by the power of 3.  
         */
        determinant(): float64
        
        /** Returns a copy of this basis rotated around the given [param axis] by the given [param angle] (in radians).  
         *  The [param axis] must be a normalized vector (see [method Vector3.normalized]). If [param angle] is positive, the basis is rotated counter-clockwise around the axis.  
         *    
         */
        rotated(axis: Vector3, angle: float64): Basis
        
        /** Returns this basis with each axis's components scaled by the given [param scale]'s components.  
         *  The basis matrix's rows are multiplied by [param scale]'s components. This operation is a global scale (relative to the parent).  
         *    
         */
        scaled(scale: Vector3): Basis
        
        /** Returns this basis with each axis scaled by the corresponding component in the given [param scale].  
         *  The basis matrix's columns are multiplied by [param scale]'s components. This operation is a local scale (relative to self).  
         *    
         */
        scaled_local(scale: Vector3): Basis
        
        /** Returns the length of each axis of this basis, as a [Vector3]. If the basis is not sheared, this value is the scaling factor. It is not affected by rotation.  
         *    
         *      
         *  **Note:** If the value returned by [method determinant] is negative, the scale is also negative.  
         */
        get_scale(): Vector3
        
        /** Returns this basis's rotation as a [Vector3] of [url=https://en.wikipedia.org/wiki/Euler_angles]Euler angles[/url], in radians. For the returned value:  
         *  - The [member Vector3.x] contains the angle around the [member x] axis (pitch);  
         *  - The [member Vector3.y] contains the angle around the [member y] axis (yaw);  
         *  - The [member Vector3.z] contains the angle around the [member z] axis (roll).  
         *  The order of each consecutive rotation can be changed with [param order] (see [enum EulerOrder] constants). By default, the YXZ convention is used ([constant EULER_ORDER_YXZ]): Z (roll) is calculated first, then X (pitch), and lastly Y (yaw). When using the opposite method [method from_euler], this order is reversed.  
         *      
         *  **Note:** For this method to return correctly, the basis needs to be  *orthonormal*  (see [method orthonormalized]).  
         *      
         *  **Note:** Euler angles are much more intuitive but are not suitable for 3D math. Because of this, consider using the [method get_rotation_quaternion] method instead, which returns a [Quaternion].  
         *      
         *  **Note:** In the Inspector dock, a basis's rotation is often displayed in Euler angles (in degrees), as is the case with the [member Node3D.rotation] property.  
         */
        get_euler(order?: int64 /* = 2 */): Vector3
        
        /** Returns the transposed dot product between [param with] and the [member x] axis (see [method transposed]).  
         *  This is equivalent to `basis.x.dot(vector)`.  
         */
        tdotx(with_: Vector3): float64
        
        /** Returns the transposed dot product between [param with] and the [member y] axis (see [method transposed]).  
         *  This is equivalent to `basis.y.dot(vector)`.  
         */
        tdoty(with_: Vector3): float64
        
        /** Returns the transposed dot product between [param with] and the [member z] axis (see [method transposed]).  
         *  This is equivalent to `basis.z.dot(vector)`.  
         */
        tdotz(with_: Vector3): float64
        
        /** Performs a spherical-linear interpolation with the [param to] basis, given a [param weight]. Both this basis and [param to] should represent a rotation.  
         *  **Example:** Smoothly rotate a [Node3D] to the target basis over time, with a [Tween]:  
         *    
         */
        slerp(to: Basis, weight: float64): Basis
        
        /** Returns `true` if this basis is conformal. A conformal basis is both  *orthogonal*  (the axes are perpendicular to each other) and  *uniform*  (the axes share the same length). This method can be especially useful during physics calculations. */
        is_conformal(): boolean
        
        /** Returns `true` if this basis and [param b] are approximately equal, by calling [method @GlobalScope.is_equal_approx] on all vector components. */
        is_equal_approx(b: Basis): boolean
        
        /** Returns `true` if this basis is finite, by calling [method @GlobalScope.is_finite] on all vector components. */
        is_finite(): boolean
        
        /** Returns this basis's rotation as a [Quaternion].  
         *      
         *  **Note:** Quaternions are much more suitable for 3D math but are less intuitive. For user interfaces, consider using the [method get_euler] method, which returns Euler angles.  
         */
        get_rotation_quaternion(): Quaternion
        
        /** Creates a new [Basis] with a rotation such that the forward axis (-Z) points towards the [param target] position.  
         *  By default, the -Z axis (camera forward) is treated as forward (implies +X is right). If [param use_model_front] is `true`, the +Z axis (asset front) is treated as forward (implies +X is left) and points toward the [param target] position.  
         *  The up axis (+Y) points as close to the [param up] vector as possible while staying perpendicular to the forward axis. The returned basis is orthonormalized (see [method orthonormalized]).  
         *  The [param target] and the [param up] cannot be [constant Vector3.ZERO], and shouldn't be colinear to avoid unintended rotation around local Z axis.  
         */
        static looking_at(target: Vector3, up?: Vector3 /* = Vector3.ZERO */, use_model_front?: boolean /* = false */): Basis
        
        /** Constructs a new [Basis] that only represents scale, with no rotation or shear, from the given [param scale] vector.  
         *    
         *      
         *  **Note:** In linear algebra, the matrix of this basis is also known as a [url=https://en.wikipedia.org/wiki/Diagonal_matrix]diagonal matrix[/url].  
         */
        static from_scale(scale: Vector3): Basis
        
        /** Constructs a new [Basis] that only represents rotation from the given [Vector3] of [url=https://en.wikipedia.org/wiki/Euler_angles]Euler angles[/url], in radians.  
         *  - The [member Vector3.x] should contain the angle around the [member x] axis (pitch);  
         *  - The [member Vector3.y] should contain the angle around the [member y] axis (yaw);  
         *  - The [member Vector3.z] should contain the angle around the [member z] axis (roll).  
         *    
         *  The order of each consecutive rotation can be changed with [param order] (see [enum EulerOrder] constants). By default, the YXZ convention is used ([constant EULER_ORDER_YXZ]): the basis rotates first around the Y axis (yaw), then X (pitch), and lastly Z (roll). When using the opposite method [method get_euler], this order is reversed.  
         */
        static from_euler(euler: Vector3, order?: int64 /* = 2 */): Basis
        static MULTIPLY(left: Basis, right: Basis): Basis
        static MULTIPLY(left: Basis, right: float64): Basis
        static MULTIPLY(left: Basis, right: Vector3): Vector3
        static MULTIPLY(left: Vector3, right: Basis): Vector3
        static EQUAL(left: Basis, right: Basis): boolean
        static NOT_EQUAL(left: Basis, right: Basis): boolean
        get x(): Vector3
        set x(value: Vector3)
        get y(): Vector3
        set y(value: Vector3)
        get z(): Vector3
        set z(value: Vector3)
    }
    /** A 3×4 matrix representing a 3D transformation.  
     *  	  
     *  @link https://docs.godotengine.org/en/4.5/classes/class_transform3d.html  
     */
    class Transform3D {
        /** The identity [Transform3D]. This is a transform with no translation, no rotation, and a scale of [constant Vector3.ONE]. Its [member basis] is equal to [constant Basis.IDENTITY]. This also means that:  
         *  - Its [member Basis.x] points right ([constant Vector3.RIGHT]);  
         *  - Its [member Basis.y] points up ([constant Vector3.UP]);  
         *  - Its [member Basis.z] points back ([constant Vector3.BACK]).  
         *    
         *  If a [Vector3], an [AABB], a [Plane], a [PackedVector3Array], or another [Transform3D] is transformed (multiplied) by this constant, no transformation occurs.  
         *      
         *  **Note:** In GDScript, this constant is equivalent to creating a [constructor Transform3D] without any arguments. It can be used to make your code clearer, and for consistency with C#.  
         */
        static readonly IDENTITY: Readonly<Transform3D>
        
        /** [Transform3D] with mirroring applied perpendicular to the YZ plane. Its [member basis] is equal to [constant Basis.FLIP_X]. */
        static readonly FLIP_X: Readonly<Transform3D>
        
        /** [Transform3D] with mirroring applied perpendicular to the XZ plane. Its [member basis] is equal to [constant Basis.FLIP_Y]. */
        static readonly FLIP_Y: Readonly<Transform3D>
        
        /** [Transform3D] with mirroring applied perpendicular to the XY plane. Its [member basis] is equal to [constant Basis.FLIP_Z]. */
        static readonly FLIP_Z: Readonly<Transform3D>
        constructor()
        constructor(from: Transform3D)
        constructor(basis: Basis, origin: Vector3)
        constructor(x_axis: Vector3, y_axis: Vector3, z_axis: Vector3, origin: Vector3)
        constructor(from: Projection)
        
        /** Returns the [url=https://en.wikipedia.org/wiki/Invertible_matrix]inverted version of this transform[/url]. See also [method Basis.inverse].  
         *      
         *  **Note:** For this method to return correctly, the transform's [member basis] needs to be  *orthonormal*  (see [method orthonormalized]). That means the basis should only represent a rotation. If it does not, use [method affine_inverse] instead.  
         */
        inverse(): Transform3D
        
        /** Returns the inverted version of this transform. Unlike [method inverse], this method works with almost any [member basis], including non-uniform ones, but is slower. See also [method Basis.inverse].  
         *      
         *  **Note:** For this method to return correctly, the transform's [member basis] needs to have a determinant that is not exactly `0.0` (see [method Basis.determinant]).  
         */
        affine_inverse(): Transform3D
        
        /** Returns a copy of this transform with its [member basis] orthonormalized. An orthonormal basis is both  *orthogonal*  (the axes are perpendicular to each other) and  *normalized*  (the axes have a length of `1.0`), which also means it can only represent a rotation. See also [method Basis.orthonormalized]. */
        orthonormalized(): Transform3D
        
        /** Returns a copy of this transform rotated around the given [param axis] by the given [param angle] (in radians).  
         *  The [param axis] must be a normalized vector (see [method Vector3.normalized]). If [param angle] is positive, the basis is rotated counter-clockwise around the axis.  
         *  This method is an optimized version of multiplying the given transform `X` with a corresponding rotation transform `R` from the left, i.e., `R * X`.  
         *  This can be seen as transforming with respect to the global/parent frame.  
         */
        rotated(axis: Vector3, angle: float64): Transform3D
        
        /** Returns a copy of this transform rotated around the given [param axis] by the given [param angle] (in radians).  
         *  The [param axis] must be a normalized vector in the transform's local coordinate system. For example, to rotate around the local X-axis, use [constant Vector3.RIGHT].  
         *  This method is an optimized version of multiplying the given transform `X` with a corresponding rotation transform `R` from the right, i.e., `X * R`.  
         *  This can be seen as transforming with respect to the local frame.  
         */
        rotated_local(axis: Vector3, angle: float64): Transform3D
        
        /** Returns a copy of this transform scaled by the given [param scale] factor.  
         *  This method is an optimized version of multiplying the given transform `X` with a corresponding scaling transform `S` from the left, i.e., `S * X`.  
         *  This can be seen as transforming with respect to the global/parent frame.  
         */
        scaled(scale: Vector3): Transform3D
        
        /** Returns a copy of this transform scaled by the given [param scale] factor.  
         *  This method is an optimized version of multiplying the given transform `X` with a corresponding scaling transform `S` from the right, i.e., `X * S`.  
         *  This can be seen as transforming with respect to the local frame.  
         */
        scaled_local(scale: Vector3): Transform3D
        
        /** Returns a copy of this transform translated by the given [param offset].  
         *  This method is an optimized version of multiplying the given transform `X` with a corresponding translation transform `T` from the left, i.e., `T * X`.  
         *  This can be seen as transforming with respect to the global/parent frame.  
         */
        translated(offset: Vector3): Transform3D
        
        /** Returns a copy of this transform translated by the given [param offset].  
         *  This method is an optimized version of multiplying the given transform `X` with a corresponding translation transform `T` from the right, i.e., `X * T`.  
         *  This can be seen as transforming with respect to the local frame.  
         */
        translated_local(offset: Vector3): Transform3D
        
        /** Returns a copy of this transform rotated so that the forward axis (-Z) points towards the [param target] position.  
         *  The up axis (+Y) points as close to the [param up] vector as possible while staying perpendicular to the forward axis. The resulting transform is orthonormalized. The existing rotation, scale, and skew information from the original transform is discarded. The [param target] and [param up] vectors cannot be zero, cannot be parallel to each other, and are defined in global/parent space.  
         *  If [param use_model_front] is `true`, the +Z axis (asset front) is treated as forward (implies +X is left) and points toward the [param target] position. By default, the -Z axis (camera forward) is treated as forward (implies +X is right).  
         */
        looking_at(target: Vector3, up?: Vector3 /* = Vector3.ZERO */, use_model_front?: boolean /* = false */): Transform3D
        
        /** Returns the result of the linear interpolation between this transform and [param xform] by the given [param weight].  
         *  The [param weight] should be between `0.0` and `1.0` (inclusive). Values outside this range are allowed and can be used to perform  *extrapolation*  instead.  
         */
        interpolate_with(xform: Transform3D, weight: float64): Transform3D
        
        /** Returns `true` if this transform and [param xform] are approximately equal, by running [method @GlobalScope.is_equal_approx] on each component. */
        is_equal_approx(xform: Transform3D): boolean
        
        /** Returns `true` if this transform is finite, by calling [method @GlobalScope.is_finite] on each component. */
        is_finite(): boolean
        static MULTIPLY(left: Transform3D, right: Transform3D): Transform3D
        static MULTIPLY(left: Transform3D, right: float64): Transform3D
        static MULTIPLY(left: Transform3D, right: Vector3): Vector3
        static MULTIPLY(left: Vector3, right: Transform3D): Vector3
        static MULTIPLY(left: Transform3D, right: AABB): AABB
        static MULTIPLY(left: AABB, right: Transform3D): AABB
        static MULTIPLY(left: Transform3D, right: Plane): Plane
        static MULTIPLY(left: Plane, right: Transform3D): Plane
        static MULTIPLY(left: Transform3D, right: PackedVector3Array | Vector3[]): PackedVector3Array
        static MULTIPLY(left: PackedVector3Array | Vector3[], right: Transform3D): PackedVector3Array
        static EQUAL(left: Transform3D, right: Transform3D): boolean
        static NOT_EQUAL(left: Transform3D, right: Transform3D): boolean
        get basis(): Basis
        set basis(value: Basis)
        get origin(): Vector3
        set origin(value: Vector3)
    }
    namespace Projection {
        enum Planes {
            /** The index value of the projection's near clipping plane. */
            PLANE_NEAR = 0,
            
            /** The index value of the projection's far clipping plane. */
            PLANE_FAR = 1,
            
            /** The index value of the projection's left clipping plane. */
            PLANE_LEFT = 2,
            
            /** The index value of the projection's top clipping plane. */
            PLANE_TOP = 3,
            
            /** The index value of the projection's right clipping plane. */
            PLANE_RIGHT = 4,
            
            /** The index value of the projection bottom clipping plane. */
            PLANE_BOTTOM = 5,
        }
    }
    /** A 4×4 matrix for 3D projective transformations.  
     *  	  
     *  @link https://docs.godotengine.org/en/4.5/classes/class_projection.html  
     */
    class Projection {
        /** A [Projection] with no transformation defined. When applied to other data structures, no transformation is performed. */
        static readonly IDENTITY: Readonly<Projection>
        
        /** A [Projection] with all values initialized to 0. When applied to other data structures, they will be zeroed. */
        static readonly ZERO: Readonly<Projection>
        constructor()
        constructor(from: Projection)
        constructor(from: Transform3D)
        constructor(x_axis: Vector4, y_axis: Vector4, z_axis: Vector4, w_axis: Vector4)
        
        /** Creates a new [Projection] that projects positions from a depth range of `-1` to `1` to one that ranges from `0` to `1`, and flips the projected positions vertically, according to [param flip_y]. */
        static create_depth_correction(flip_y: boolean): Projection
        
        /** Creates a new [Projection] that projects positions into the given [Rect2]. */
        static create_light_atlas_rect(rect: Rect2): Projection
        
        /** Creates a new [Projection] that projects positions using a perspective projection with the given Y-axis field of view (in degrees), X:Y aspect ratio, and clipping planes.  
         *  [param flip_fov] determines whether the projection's field of view is flipped over its diagonal.  
         */
        static create_perspective(fovy: float64, aspect: float64, z_near: float64, z_far: float64, flip_fov?: boolean /* = false */): Projection
        
        /** Creates a new [Projection] that projects positions using a perspective projection with the given Y-axis field of view (in degrees), X:Y aspect ratio, and clipping distances. The projection is adjusted for a head-mounted display with the given distance between eyes and distance to a point that can be focused on.  
         *  [param eye] creates the projection for the left eye when set to 1, or the right eye when set to 2.  
         *  [param flip_fov] determines whether the projection's field of view is flipped over its diagonal.  
         */
        static create_perspective_hmd(fovy: float64, aspect: float64, z_near: float64, z_far: float64, flip_fov: boolean, eye: int64, intraocular_dist: float64, convergence_dist: float64): Projection
        
        /** Creates a new [Projection] for projecting positions onto a head-mounted display with the given X:Y aspect ratio, distance between eyes, display width, distance to lens, oversampling factor, and depth clipping planes.  
         *  [param eye] creates the projection for the left eye when set to 1, or the right eye when set to 2.  
         */
        static create_for_hmd(eye: int64, aspect: float64, intraocular_dist: float64, display_width: float64, display_to_lens: float64, oversample: float64, z_near: float64, z_far: float64): Projection
        
        /** Creates a new [Projection] that projects positions using an orthogonal projection with the given clipping planes. */
        static create_orthogonal(left: float64, right: float64, bottom: float64, top: float64, z_near: float64, z_far: float64): Projection
        
        /** Creates a new [Projection] that projects positions using an orthogonal projection with the given size, X:Y aspect ratio, and clipping planes.  
         *  [param flip_fov] determines whether the projection's field of view is flipped over its diagonal.  
         */
        static create_orthogonal_aspect(size: float64, aspect: float64, z_near: float64, z_far: float64, flip_fov?: boolean /* = false */): Projection
        
        /** Creates a new [Projection] that projects positions in a frustum with the given clipping planes. */
        static create_frustum(left: float64, right: float64, bottom: float64, top: float64, z_near: float64, z_far: float64): Projection
        
        /** Creates a new [Projection] that projects positions in a frustum with the given size, X:Y aspect ratio, offset, and clipping planes.  
         *  [param flip_fov] determines whether the projection's field of view is flipped over its diagonal.  
         */
        static create_frustum_aspect(size: float64, aspect: float64, offset: Vector2, z_near: float64, z_far: float64, flip_fov?: boolean /* = false */): Projection
        
        /** Creates a new [Projection] that scales a given projection to fit around a given [AABB] in projection space. */
        static create_fit_aabb(aabb: AABB): Projection
        
        /** Returns a scalar value that is the signed factor by which areas are scaled by this matrix. If the sign is negative, the matrix flips the orientation of the area.  
         *  The determinant can be used to calculate the invertibility of a matrix or solve linear systems of equations involving the matrix, among other applications.  
         */
        determinant(): float64
        
        /** Returns a [Projection] with the near clipping distance adjusted to be [param new_znear].  
         *      
         *  **Note:** The original [Projection] must be a perspective projection.  
         */
        perspective_znear_adjusted(new_znear: float64): Projection
        
        /** Returns the clipping plane of this [Projection] whose index is given by [param plane].  
         *  [param plane] should be equal to one of [constant PLANE_NEAR], [constant PLANE_FAR], [constant PLANE_LEFT], [constant PLANE_TOP], [constant PLANE_RIGHT], or [constant PLANE_BOTTOM].  
         */
        get_projection_plane(plane: int64): Plane
        
        /** Returns a copy of this [Projection] with the signs of the values of the Y column flipped. */
        flipped_y(): Projection
        
        /** Returns a [Projection] with the X and Y values from the given [Vector2] added to the first and second values of the final column respectively. */
        jitter_offseted(offset: Vector2): Projection
        
        /** Returns the vertical field of view of the projection (in degrees) associated with the given horizontal field of view (in degrees) and aspect ratio.  
         *      
         *  **Note:** Unlike most methods of [Projection], [param aspect] is expected to be 1 divided by the X:Y aspect ratio.  
         */
        static get_fovy(fovx: float64, aspect: float64): float64
        
        /** Returns the distance for this [Projection] beyond which positions are clipped. */
        get_z_far(): float64
        
        /** Returns the distance for this [Projection] before which positions are clipped. */
        get_z_near(): float64
        
        /** Returns the X:Y aspect ratio of this [Projection]'s viewport. */
        get_aspect(): float64
        
        /** Returns the horizontal field of view of the projection (in degrees). */
        get_fov(): float64
        
        /** Returns `true` if this [Projection] performs an orthogonal projection. */
        is_orthogonal(): boolean
        
        /** Returns the dimensions of the viewport plane that this [Projection] projects positions onto, divided by two. */
        get_viewport_half_extents(): Vector2
        
        /** Returns the dimensions of the far clipping plane of the projection, divided by two. */
        get_far_plane_half_extents(): Vector2
        
        /** Returns a [Projection] that performs the inverse of this [Projection]'s projective transformation. */
        inverse(): Projection
        
        /** Returns [param for_pixel_width] divided by the viewport's width measured in meters on the near plane, after this [Projection] is applied. */
        get_pixels_per_meter(for_pixel_width: int64): int64
        
        /** Returns the factor by which the visible level of detail is scaled by this [Projection]. */
        get_lod_multiplier(): float64
        static MULTIPLY(left: Projection, right: Projection): Projection
        static MULTIPLY(left: Projection, right: Vector4): Vector4
        static MULTIPLY(left: Vector4, right: Projection): Vector4
        static EQUAL(left: Projection, right: Projection): boolean
        static NOT_EQUAL(left: Projection, right: Projection): boolean
        get x(): Vector4
        set x(value: Vector4)
        get y(): Vector4
        set y(value: Vector4)
        get z(): Vector4
        set z(value: Vector4)
        get w(): Vector4
        set w(value: Vector4)
    }
    /** A color represented in RGBA format.  
     *  	  
     *  @link https://docs.godotengine.org/en/4.5/classes/class_color.html  
     */
    class Color {
        /** Alice blue color. */
        static readonly ALICE_BLUE: Readonly<Color>
        
        /** Antique white color. */
        static readonly ANTIQUE_WHITE: Readonly<Color>
        
        /** Aqua color. */
        static readonly AQUA: Readonly<Color>
        
        /** Aquamarine color. */
        static readonly AQUAMARINE: Readonly<Color>
        
        /** Azure color. */
        static readonly AZURE: Readonly<Color>
        
        /** Beige color. */
        static readonly BEIGE: Readonly<Color>
        
        /** Bisque color. */
        static readonly BISQUE: Readonly<Color>
        
        /** Black color. In GDScript, this is the default value of any color. */
        static readonly BLACK: Readonly<Color>
        
        /** Blanched almond color. */
        static readonly BLANCHED_ALMOND: Readonly<Color>
        
        /** Blue color. */
        static readonly BLUE: Readonly<Color>
        
        /** Blue violet color. */
        static readonly BLUE_VIOLET: Readonly<Color>
        
        /** Brown color. */
        static readonly BROWN: Readonly<Color>
        
        /** Burlywood color. */
        static readonly BURLYWOOD: Readonly<Color>
        
        /** Cadet blue color. */
        static readonly CADET_BLUE: Readonly<Color>
        
        /** Chartreuse color. */
        static readonly CHARTREUSE: Readonly<Color>
        
        /** Chocolate color. */
        static readonly CHOCOLATE: Readonly<Color>
        
        /** Coral color. */
        static readonly CORAL: Readonly<Color>
        
        /** Cornflower blue color. */
        static readonly CORNFLOWER_BLUE: Readonly<Color>
        
        /** Cornsilk color. */
        static readonly CORNSILK: Readonly<Color>
        
        /** Crimson color. */
        static readonly CRIMSON: Readonly<Color>
        
        /** Cyan color. */
        static readonly CYAN: Readonly<Color>
        
        /** Dark blue color. */
        static readonly DARK_BLUE: Readonly<Color>
        
        /** Dark cyan color. */
        static readonly DARK_CYAN: Readonly<Color>
        
        /** Dark goldenrod color. */
        static readonly DARK_GOLDENROD: Readonly<Color>
        
        /** Dark gray color. */
        static readonly DARK_GRAY: Readonly<Color>
        
        /** Dark green color. */
        static readonly DARK_GREEN: Readonly<Color>
        
        /** Dark khaki color. */
        static readonly DARK_KHAKI: Readonly<Color>
        
        /** Dark magenta color. */
        static readonly DARK_MAGENTA: Readonly<Color>
        
        /** Dark olive green color. */
        static readonly DARK_OLIVE_GREEN: Readonly<Color>
        
        /** Dark orange color. */
        static readonly DARK_ORANGE: Readonly<Color>
        
        /** Dark orchid color. */
        static readonly DARK_ORCHID: Readonly<Color>
        
        /** Dark red color. */
        static readonly DARK_RED: Readonly<Color>
        
        /** Dark salmon color. */
        static readonly DARK_SALMON: Readonly<Color>
        
        /** Dark sea green color. */
        static readonly DARK_SEA_GREEN: Readonly<Color>
        
        /** Dark slate blue color. */
        static readonly DARK_SLATE_BLUE: Readonly<Color>
        
        /** Dark slate gray color. */
        static readonly DARK_SLATE_GRAY: Readonly<Color>
        
        /** Dark turquoise color. */
        static readonly DARK_TURQUOISE: Readonly<Color>
        
        /** Dark violet color. */
        static readonly DARK_VIOLET: Readonly<Color>
        
        /** Deep pink color. */
        static readonly DEEP_PINK: Readonly<Color>
        
        /** Deep sky blue color. */
        static readonly DEEP_SKY_BLUE: Readonly<Color>
        
        /** Dim gray color. */
        static readonly DIM_GRAY: Readonly<Color>
        
        /** Dodger blue color. */
        static readonly DODGER_BLUE: Readonly<Color>
        
        /** Firebrick color. */
        static readonly FIREBRICK: Readonly<Color>
        
        /** Floral white color. */
        static readonly FLORAL_WHITE: Readonly<Color>
        
        /** Forest green color. */
        static readonly FOREST_GREEN: Readonly<Color>
        
        /** Fuchsia color. */
        static readonly FUCHSIA: Readonly<Color>
        
        /** Gainsboro color. */
        static readonly GAINSBORO: Readonly<Color>
        
        /** Ghost white color. */
        static readonly GHOST_WHITE: Readonly<Color>
        
        /** Gold color. */
        static readonly GOLD: Readonly<Color>
        
        /** Goldenrod color. */
        static readonly GOLDENROD: Readonly<Color>
        
        /** Gray color. */
        static readonly GRAY: Readonly<Color>
        
        /** Green color. */
        static readonly GREEN: Readonly<Color>
        
        /** Green yellow color. */
        static readonly GREEN_YELLOW: Readonly<Color>
        
        /** Honeydew color. */
        static readonly HONEYDEW: Readonly<Color>
        
        /** Hot pink color. */
        static readonly HOT_PINK: Readonly<Color>
        
        /** Indian red color. */
        static readonly INDIAN_RED: Readonly<Color>
        
        /** Indigo color. */
        static readonly INDIGO: Readonly<Color>
        
        /** Ivory color. */
        static readonly IVORY: Readonly<Color>
        
        /** Khaki color. */
        static readonly KHAKI: Readonly<Color>
        
        /** Lavender color. */
        static readonly LAVENDER: Readonly<Color>
        
        /** Lavender blush color. */
        static readonly LAVENDER_BLUSH: Readonly<Color>
        
        /** Lawn green color. */
        static readonly LAWN_GREEN: Readonly<Color>
        
        /** Lemon chiffon color. */
        static readonly LEMON_CHIFFON: Readonly<Color>
        
        /** Light blue color. */
        static readonly LIGHT_BLUE: Readonly<Color>
        
        /** Light coral color. */
        static readonly LIGHT_CORAL: Readonly<Color>
        
        /** Light cyan color. */
        static readonly LIGHT_CYAN: Readonly<Color>
        
        /** Light goldenrod color. */
        static readonly LIGHT_GOLDENROD: Readonly<Color>
        
        /** Light gray color. */
        static readonly LIGHT_GRAY: Readonly<Color>
        
        /** Light green color. */
        static readonly LIGHT_GREEN: Readonly<Color>
        
        /** Light pink color. */
        static readonly LIGHT_PINK: Readonly<Color>
        
        /** Light salmon color. */
        static readonly LIGHT_SALMON: Readonly<Color>
        
        /** Light sea green color. */
        static readonly LIGHT_SEA_GREEN: Readonly<Color>
        
        /** Light sky blue color. */
        static readonly LIGHT_SKY_BLUE: Readonly<Color>
        
        /** Light slate gray color. */
        static readonly LIGHT_SLATE_GRAY: Readonly<Color>
        
        /** Light steel blue color. */
        static readonly LIGHT_STEEL_BLUE: Readonly<Color>
        
        /** Light yellow color. */
        static readonly LIGHT_YELLOW: Readonly<Color>
        
        /** Lime color. */
        static readonly LIME: Readonly<Color>
        
        /** Lime green color. */
        static readonly LIME_GREEN: Readonly<Color>
        
        /** Linen color. */
        static readonly LINEN: Readonly<Color>
        
        /** Magenta color. */
        static readonly MAGENTA: Readonly<Color>
        
        /** Maroon color. */
        static readonly MAROON: Readonly<Color>
        
        /** Medium aquamarine color. */
        static readonly MEDIUM_AQUAMARINE: Readonly<Color>
        
        /** Medium blue color. */
        static readonly MEDIUM_BLUE: Readonly<Color>
        
        /** Medium orchid color. */
        static readonly MEDIUM_ORCHID: Readonly<Color>
        
        /** Medium purple color. */
        static readonly MEDIUM_PURPLE: Readonly<Color>
        
        /** Medium sea green color. */
        static readonly MEDIUM_SEA_GREEN: Readonly<Color>
        
        /** Medium slate blue color. */
        static readonly MEDIUM_SLATE_BLUE: Readonly<Color>
        
        /** Medium spring green color. */
        static readonly MEDIUM_SPRING_GREEN: Readonly<Color>
        
        /** Medium turquoise color. */
        static readonly MEDIUM_TURQUOISE: Readonly<Color>
        
        /** Medium violet red color. */
        static readonly MEDIUM_VIOLET_RED: Readonly<Color>
        
        /** Midnight blue color. */
        static readonly MIDNIGHT_BLUE: Readonly<Color>
        
        /** Mint cream color. */
        static readonly MINT_CREAM: Readonly<Color>
        
        /** Misty rose color. */
        static readonly MISTY_ROSE: Readonly<Color>
        
        /** Moccasin color. */
        static readonly MOCCASIN: Readonly<Color>
        
        /** Navajo white color. */
        static readonly NAVAJO_WHITE: Readonly<Color>
        
        /** Navy blue color. */
        static readonly NAVY_BLUE: Readonly<Color>
        
        /** Old lace color. */
        static readonly OLD_LACE: Readonly<Color>
        
        /** Olive color. */
        static readonly OLIVE: Readonly<Color>
        
        /** Olive drab color. */
        static readonly OLIVE_DRAB: Readonly<Color>
        
        /** Orange color. */
        static readonly ORANGE: Readonly<Color>
        
        /** Orange red color. */
        static readonly ORANGE_RED: Readonly<Color>
        
        /** Orchid color. */
        static readonly ORCHID: Readonly<Color>
        
        /** Pale goldenrod color. */
        static readonly PALE_GOLDENROD: Readonly<Color>
        
        /** Pale green color. */
        static readonly PALE_GREEN: Readonly<Color>
        
        /** Pale turquoise color. */
        static readonly PALE_TURQUOISE: Readonly<Color>
        
        /** Pale violet red color. */
        static readonly PALE_VIOLET_RED: Readonly<Color>
        
        /** Papaya whip color. */
        static readonly PAPAYA_WHIP: Readonly<Color>
        
        /** Peach puff color. */
        static readonly PEACH_PUFF: Readonly<Color>
        
        /** Peru color. */
        static readonly PERU: Readonly<Color>
        
        /** Pink color. */
        static readonly PINK: Readonly<Color>
        
        /** Plum color. */
        static readonly PLUM: Readonly<Color>
        
        /** Powder blue color. */
        static readonly POWDER_BLUE: Readonly<Color>
        
        /** Purple color. */
        static readonly PURPLE: Readonly<Color>
        
        /** Rebecca purple color. */
        static readonly REBECCA_PURPLE: Readonly<Color>
        
        /** Red color. */
        static readonly RED: Readonly<Color>
        
        /** Rosy brown color. */
        static readonly ROSY_BROWN: Readonly<Color>
        
        /** Royal blue color. */
        static readonly ROYAL_BLUE: Readonly<Color>
        
        /** Saddle brown color. */
        static readonly SADDLE_BROWN: Readonly<Color>
        
        /** Salmon color. */
        static readonly SALMON: Readonly<Color>
        
        /** Sandy brown color. */
        static readonly SANDY_BROWN: Readonly<Color>
        
        /** Sea green color. */
        static readonly SEA_GREEN: Readonly<Color>
        
        /** Seashell color. */
        static readonly SEASHELL: Readonly<Color>
        
        /** Sienna color. */
        static readonly SIENNA: Readonly<Color>
        
        /** Silver color. */
        static readonly SILVER: Readonly<Color>
        
        /** Sky blue color. */
        static readonly SKY_BLUE: Readonly<Color>
        
        /** Slate blue color. */
        static readonly SLATE_BLUE: Readonly<Color>
        
        /** Slate gray color. */
        static readonly SLATE_GRAY: Readonly<Color>
        
        /** Snow color. */
        static readonly SNOW: Readonly<Color>
        
        /** Spring green color. */
        static readonly SPRING_GREEN: Readonly<Color>
        
        /** Steel blue color. */
        static readonly STEEL_BLUE: Readonly<Color>
        
        /** Tan color. */
        static readonly TAN: Readonly<Color>
        
        /** Teal color. */
        static readonly TEAL: Readonly<Color>
        
        /** Thistle color. */
        static readonly THISTLE: Readonly<Color>
        
        /** Tomato color. */
        static readonly TOMATO: Readonly<Color>
        
        /** Transparent color (white with zero alpha). */
        static readonly TRANSPARENT: Readonly<Color>
        
        /** Turquoise color. */
        static readonly TURQUOISE: Readonly<Color>
        
        /** Violet color. */
        static readonly VIOLET: Readonly<Color>
        
        /** Web gray color. */
        static readonly WEB_GRAY: Readonly<Color>
        
        /** Web green color. */
        static readonly WEB_GREEN: Readonly<Color>
        
        /** Web maroon color. */
        static readonly WEB_MAROON: Readonly<Color>
        
        /** Web purple color. */
        static readonly WEB_PURPLE: Readonly<Color>
        
        /** Wheat color. */
        static readonly WHEAT: Readonly<Color>
        
        /** White color. */
        static readonly WHITE: Readonly<Color>
        
        /** White smoke color. */
        static readonly WHITE_SMOKE: Readonly<Color>
        
        /** Yellow color. */
        static readonly YELLOW: Readonly<Color>
        
        /** Yellow green color. */
        static readonly YELLOW_GREEN: Readonly<Color>
        constructor()
        constructor(from: Color)
        constructor(from: Color, alpha: float64)
        constructor(r: float64, g: float64, b: float64)
        constructor(r: float64, g: float64, b: float64, a: float64)
        constructor(code: string)
        constructor(code: string, alpha: float64)
        
        /** Returns the color converted to a 32-bit integer in ARGB format (each component is 8 bits). ARGB is more compatible with DirectX.  
         *    
         */
        to_argb32(): int64
        
        /** Returns the color converted to a 32-bit integer in ABGR format (each component is 8 bits). ABGR is the reversed version of the default RGBA format.  
         *    
         */
        to_abgr32(): int64
        
        /** Returns the color converted to a 32-bit integer in RGBA format (each component is 8 bits). RGBA is Godot's default format. This method is the inverse of [method hex].  
         *    
         */
        to_rgba32(): int64
        
        /** Returns the color converted to a 64-bit integer in ARGB format (each component is 16 bits). ARGB is more compatible with DirectX.  
         *    
         */
        to_argb64(): int64
        
        /** Returns the color converted to a 64-bit integer in ABGR format (each component is 16 bits). ABGR is the reversed version of the default RGBA format.  
         *    
         */
        to_abgr64(): int64
        
        /** Returns the color converted to a 64-bit integer in RGBA format (each component is 16 bits). RGBA is Godot's default format. This method is the inverse of [method hex64].  
         *    
         */
        to_rgba64(): int64
        
        /** Returns the color converted to an HTML hexadecimal color [String] in RGBA format, without the hash (`#`) prefix.  
         *  Setting [param with_alpha] to `false`, excludes alpha from the hexadecimal string, using RGB format instead of RGBA format.  
         *    
         */
        to_html(with_alpha?: boolean /* = true */): string
        
        /** Returns a new color with all components clamped between the components of [param min] and [param max], by running [method @GlobalScope.clamp] on each component. */
        clamp(min?: Color /* = new Color(0, 0, 0, 0) */, max?: Color /* = new Color(1, 1, 1, 1) */): Color
        
        /** Returns the color with its [member r], [member g], and [member b] components inverted (`(1 - r, 1 - g, 1 - b, a)`).  
         *    
         */
        inverted(): Color
        
        /** Returns the linear interpolation between this color's components and [param to]'s components. The interpolation factor [param weight] should be between 0.0 and 1.0 (inclusive). See also [method @GlobalScope.lerp].  
         *    
         */
        lerp(to: Color, weight: float64): Color
        
        /** Returns a new color resulting from making this color lighter by the specified [param amount], which should be a ratio from 0.0 to 1.0. See also [method darkened].  
         *    
         */
        lightened(amount: float64): Color
        
        /** Returns a new color resulting from making this color darker by the specified [param amount] (ratio from 0.0 to 1.0). See also [method lightened].  
         *    
         */
        darkened(amount: float64): Color
        
        /** Returns a new color resulting from overlaying this color over the given color. In a painting program, you can imagine it as the [param over] color painted over this color (including alpha).  
         *    
         */
        blend(over: Color): Color
        
        /** Returns the light intensity of the color, as a value between 0.0 and 1.0 (inclusive). This is useful when determining light or dark color. Colors with a luminance smaller than 0.5 can be generally considered dark.  
         *      
         *  **Note:** [method get_luminance] relies on the color being in the linear color space to return an accurate relative luminance value. If the color is in the sRGB color space, use [method srgb_to_linear] to convert it to the linear color space first.  
         */
        get_luminance(): float64
        
        /** Returns the color converted to the linear color space. This method assumes the original color already is in the sRGB color space. See also [method linear_to_srgb] which performs the opposite operation.  
         *      
         *  **Note:** The color's [member a]lpha channel is not affected. The alpha channel is always stored with linear encoding, regardless of the color space of the other color channels.  
         */
        srgb_to_linear(): Color
        
        /** Returns the color converted to the [url=https://en.wikipedia.org/wiki/SRGB]sRGB[/url] color space. This method assumes the original color is in the linear color space. See also [method srgb_to_linear] which performs the opposite operation.  
         *      
         *  **Note:** The color's [member a]lpha channel is not affected. The alpha channel is always stored with linear encoding, regardless of the color space of the other color channels.  
         */
        linear_to_srgb(): Color
        
        /** Returns `true` if this color and [param to] are approximately equal, by running [method @GlobalScope.is_equal_approx] on each component. */
        is_equal_approx(to: Color): boolean
        
        /** Returns the [Color] associated with the provided [param hex] integer in 32-bit RGBA format (8 bits per channel). This method is the inverse of [method to_rgba32].  
         *  In GDScript and C#, the [int] is best visualized with hexadecimal notation (`"0x"` prefix, making it `"0xRRGGBBAA"`).  
         *    
         *  If you want to use hex notation in a constant expression, use the equivalent constructor instead (i.e. `Color(0xRRGGBBAA)`).  
         */
        static hex(hex: int64): Color
        
        /** Returns the [Color] associated with the provided [param hex] integer in 64-bit RGBA format (16 bits per channel). This method is the inverse of [method to_rgba64].  
         *  In GDScript and C#, the [int] is best visualized with hexadecimal notation (`"0x"` prefix, making it `"0xRRRRGGGGBBBBAAAA"`).  
         */
        static hex64(hex: int64): Color
        
        /** Returns a new color from [param rgba], an HTML hexadecimal color string. [param rgba] is not case-sensitive, and may be prefixed by a hash sign (`#`).  
         *  [param rgba] must be a valid three-digit or six-digit hexadecimal color string, and may contain an alpha channel value. If [param rgba] does not contain an alpha channel value, an alpha channel value of 1.0 is applied. If [param rgba] is invalid, returns an empty color.  
         *    
         */
        static html(rgba: string): Color
        
        /** Returns `true` if [param color] is a valid HTML hexadecimal color string. The string must be a hexadecimal value (case-insensitive) of either 3, 4, 6 or 8 digits, and may be prefixed by a hash sign (`#`). This method is identical to [method String.is_valid_html_color].  
         *    
         */
        static html_is_valid(color: string): boolean
        
        /** Creates a [Color] from the given string, which can be either an HTML color code or a named color (case-insensitive). Returns [param default] if the color cannot be inferred from the string.  
         *  If you want to create a color from String in a constant expression, use the equivalent constructor instead (i.e. `Color("color string")`).  
         */
        static from_string(str: string, default_: Color): Color
        
        /** Constructs a color from an [url=https://en.wikipedia.org/wiki/HSL_and_HSV]HSV profile[/url]. The hue ([param h]), saturation ([param s]), and value ([param v]) are typically between 0.0 and 1.0.  
         *    
         */
        static from_hsv(h: float64, s: float64, v: float64, alpha?: float64 /* = 1 */): Color
        
        /** Constructs a color from an [url=https://bottosson.github.io/posts/colorpicker/]OK HSL profile[/url]. The hue ([param h]), saturation ([param s]), and lightness ([param l]) are typically between 0.0 and 1.0.  
         *    
         */
        static from_ok_hsl(h: float64, s: float64, l: float64, alpha?: float64 /* = 1 */): Color
        
        /** Decodes a [Color] from an RGBE9995 format integer. See [constant Image.FORMAT_RGBE9995]. */
        static from_rgbe9995(rgbe: int64): Color
        
        /** Returns a [Color] constructed from red ([param r8]), green ([param g8]), blue ([param b8]), and optionally alpha ([param a8]) integer channels, each divided by `255.0` for their final value.  
         *    
         *      
         *  **Note:** Due to the lower precision of [method from_rgba8] compared to the standard [Color] constructor, a color created with [method from_rgba8] will generally not be equal to the same color created with the standard [Color] constructor. Use [method is_equal_approx] for comparisons to avoid issues with floating-point precision error.  
         */
        static from_rgba8(r8: int64, g8: int64, b8: int64, a8?: int64 /* = 255 */): Color
        static ADD(left: Color, right: Color): Color
        static SUBTRACT(left: Color, right: Color): Color
        static MULTIPLY(left: Color, right: Color): Color
        static MULTIPLY(left: Color, right: float64): Color
        static MULTIPLY(left: float64, right: Color): Color
        static DIVIDE(left: Color, right: Color): Color
        static DIVIDE(left: Color, right: float64): Color
        static NEGATE(left: Color): Color
        static EQUAL(left: Color, right: Color): boolean
        static NOT_EQUAL(left: Color, right: Color): boolean
        get r(): float64
        set r(value: float64)
        get g(): float64
        set g(value: float64)
        get b(): float64
        set b(value: float64)
        get a(): float64
        set a(value: float64)
        get r8(): int64
        set r8(value: int64)
        get g8(): int64
        set g8(value: int64)
        get b8(): int64
        set b8(value: int64)
        get a8(): int64
        set a8(value: int64)
        get h(): float64
        set h(value: float64)
        get s(): float64
        set s(value: float64)
        get v(): float64
        set v(value: float64)
        get ok_hsl_h(): float64
        set ok_hsl_h(value: float64)
        get ok_hsl_s(): float64
        set ok_hsl_s(value: float64)
        get ok_hsl_l(): float64
        set ok_hsl_l(value: float64)
    }
    /** A pre-parsed scene tree path.  
     *  	  
     *  @link https://docs.godotengine.org/en/4.5/classes/class_nodepath.html  
     */
    class NodePath {
        constructor()
        constructor(from: NodePath | string)
        constructor(from: string)
        
        /** Returns `true` if the node path is absolute. Unlike a relative path, an absolute path is represented by a leading slash character (`/`) and always begins from the [SceneTree]. It can be used to reliably access nodes from the root node (e.g. `"/root/Global"` if an autoload named "Global" exists). */
        is_absolute(): boolean
        
        /** Returns the number of node names in the path. Property subnames are not included.  
         *  For example, `"../RigidBody2D/Sprite2D:texture"` contains 3 node names.  
         */
        get_name_count(): int64
        
        /** Returns the node name indicated by [param idx], starting from 0. If [param idx] is out of bounds, an error is generated. See also [method get_subname_count] and [method get_name_count].  
         *    
         */
        get_name(idx: int64): StringName
        
        /** Returns the number of property names ("subnames") in the path. Each subname in the node path is listed after a colon character (`:`).  
         *  For example, `"Level/RigidBody2D/Sprite2D:texture:resource_name"` contains 2 subnames.  
         */
        get_subname_count(): int64
        
        /** Returns the 32-bit hash value representing the node path's contents.  
         *      
         *  **Note:** Node paths with equal hash values are  *not*  guaranteed to be the same, as a result of hash collisions. Node paths with different hash values are guaranteed to be different.  
         */
        hash(): int64
        
        /** Returns the property name indicated by [param idx], starting from 0. If [param idx] is out of bounds, an error is generated. See also [method get_subname_count].  
         *    
         */
        get_subname(idx: int64): StringName
        
        /** Returns all node names concatenated with a slash character (`/`) as a single [StringName]. */
        get_concatenated_names(): StringName
        
        /** Returns all property subnames concatenated with a colon character (`:`) as a single [StringName].  
         *    
         */
        get_concatenated_subnames(): StringName
        
        /** Returns the slice of the [NodePath], from [param begin] (inclusive) to [param end] (exclusive), as a new [NodePath].  
         *  The absolute value of [param begin] and [param end] will be clamped to the sum of [method get_name_count] and [method get_subname_count], so the default value for [param end] makes it slice to the end of the [NodePath] by default (i.e. `path.slice(1)` is a shorthand for `path.slice(1, path.get_name_count() + path.get_subname_count())`).  
         *  If either [param begin] or [param end] are negative, they will be relative to the end of the [NodePath] (i.e. `path.slice(0, -2)` is a shorthand for `path.slice(0, path.get_name_count() + path.get_subname_count() - 2)`).  
         */
        slice(begin: int64, end?: int64 /* = 2147483647 */): NodePath
        
        /** Returns a copy of this node path with a colon character (`:`) prefixed, transforming it to a pure property path with no node names (relative to the current node).  
         *    
         */
        get_as_property_path(): NodePath
        
        /** Returns `true` if the node path has been constructed from an empty [String] (`""`). */
        is_empty(): boolean
        static EQUAL(left: NodePath | string, right: NodePath | string): boolean
        static NOT_EQUAL(left: NodePath | string, right: NodePath | string): boolean
    }
    /** A handle for a [Resource]'s unique identifier.  
     *  	  
     *  @link https://docs.godotengine.org/en/4.5/classes/class_rid.html  
     */
    class RID {
        constructor()
        constructor(from: RID)
        
        /** Returns `true` if the [RID] is not `0`. */
        is_valid(): boolean
        
        /** Returns the ID of the referenced low-level resource. */
        get_id(): int64
        static EQUAL(left: RID, right: RID): boolean
        static NOT_EQUAL(left: RID, right: RID): boolean
        static LESS(left: RID, right: RID): boolean
        static LESS_EQUAL(left: RID, right: RID): boolean
        static GREATER(left: RID, right: RID): boolean
        static GREATER_EQUAL(left: RID, right: RID): boolean
    }
    /** A built-in type representing a method or a standalone function.  
     *  	  
     *  @link https://docs.godotengine.org/en/4.5/classes/class_callable.html  
     */
    class Callable<T extends Function = Function> {
        /**
         * Create godot Callable without a bound object.
         */
        static create<F extends Function>(fn: F): Callable<F>
        /**
         * Create godot Callable with a bound object `self`.
         */
        static create<S extends Object, F extends (this: S, ...args: any[]) => any>(self: S, fn: F): Callable<F>
        constructor()
        constructor(from: Callable)
        constructor(object: Object, method: StringName)
        
        /** Creates a new [Callable] for the method named [param method] in the specified [param variant]. To represent a method of a built-in [Variant] type, a custom callable is used (see [method is_custom]). If [param variant] is [Object], then a standard callable will be created instead.  
         *      
         *  **Note:** This method is always necessary for the [Dictionary] type, as property syntax is used to access its entries. You may also use this method when [param variant]'s type is not known in advance (for polymorphism).  
         */
        static create(variant: any, method: StringName): Callable
        
        /** Calls the method represented by this [Callable]. Unlike [method call], this method expects all arguments to be contained inside the [param arguments] [Array]. */
        callv(arguments_: GArray): any
        
        /** Returns `true` if this [Callable] has no target to call the method on. Equivalent to `callable == Callable()`.  
         *      
         *  **Note:** This is  *not*  the same as `not is_valid()` and using `not is_null()` will  *not*  guarantee that this callable can be called. Use [method is_valid] instead.  
         */
        is_null(): boolean
        
        /** Returns `true` if this [Callable] is a custom callable. Custom callables are used:  
         *  - for binding/unbinding arguments (see [method bind] and [method unbind]);  
         *  - for representing methods of built-in [Variant] types (see [method create]);  
         *  - for representing global, lambda, and RPC functions in GDScript;  
         *  - for other purposes in the core, GDExtension, and C#.  
         */
        is_custom(): boolean
        
        /** Returns `true` if this [Callable] is a standard callable. This method is the opposite of [method is_custom]. Returns `false` if this callable is a lambda function. */
        is_standard(): boolean
        
        /** Returns `true` if the callable's object exists and has a valid method name assigned, or is a custom callable. */
        is_valid(): boolean
        
        /** Returns the object on which this [Callable] is called. */
        get_object(): null | Object
        
        /** Returns the ID of this [Callable]'s object (see [method Object.get_instance_id]). */
        get_object_id(): int64
        
        /** Returns the name of the method represented by this [Callable]. If the callable is a GDScript lambda function, returns the function's name or `"<anonymous lambda>"`. */
        get_method(): StringName
        
        /** Returns the total number of arguments this [Callable] should take, including optional arguments. This means that any arguments bound with [method bind] are  *subtracted*  from the result, and any arguments unbound with [method unbind] are  *added*  to the result. */
        get_argument_count(): int64
        
        /** Returns the total amount of arguments bound via successive [method bind] or [method unbind] calls. This is the same as the size of the array returned by [method get_bound_arguments]. See [method get_bound_arguments] for details.  
         *      
         *  **Note:** The [method get_bound_arguments_count] and [method get_unbound_arguments_count] methods can both return positive values.  
         */
        get_bound_arguments_count(): int64
        
        /** Returns the array of arguments bound via successive [method bind] or [method unbind] calls. These arguments will be added  *after*  the arguments passed to the call, from which [method get_unbound_arguments_count] arguments on the right have been previously excluded.  
         *    
         */
        get_bound_arguments(): GArray
        
        /** Returns the total amount of arguments unbound via successive [method bind] or [method unbind] calls. See [method get_bound_arguments] for details.  
         *      
         *  **Note:** The [method get_bound_arguments_count] and [method get_unbound_arguments_count] methods can both return positive values.  
         */
        get_unbound_arguments_count(): int64
        
        /** Returns the 32-bit hash value of this [Callable]'s object.  
         *      
         *  **Note:** [Callable]s with equal content will always produce identical hash values. However, the reverse is not true. Returning identical hash values does  *not*  imply the callables are equal, because different callables can have identical hash values due to hash collisions. The engine uses a 32-bit hash algorithm for [method hash].  
         */
        hash(): int64
        
        /** Returns a copy of this [Callable] with one or more arguments bound, reading them from an array. When called, the bound arguments are passed  *after*  the arguments supplied by [method call]. See also [method unbind].  
         *      
         *  **Note:** When this method is chained with other similar methods, the order in which the argument list is modified is read from right to left.  
         */
        bindv(arguments_: GArray): Callable
        
        /** Returns a copy of this [Callable] with a number of arguments unbound. In other words, when the new callable is called the last few arguments supplied by the user are ignored, according to [param argcount]. The remaining arguments are passed to the callable. This allows to use the original callable in a context that attempts to pass more arguments than this callable can handle, e.g. a signal with a fixed number of arguments. See also [method bind].  
         *      
         *  **Note:** When this method is chained with other similar methods, the order in which the argument list is modified is read from right to left.  
         *    
         */
        unbind(argcount: int64): Callable
        
        /** Calls the method represented by this [Callable]. Arguments can be passed and should match the method's signature. */
        call: T
        
        /** Calls the method represented by this [Callable] in deferred mode, i.e. at the end of the current frame. Arguments can be passed and should match the method's signature.  
         *    
         *      
         *  **Note:** Deferred calls are processed at idle time. Idle time happens mainly at the end of process and physics frames. In it, deferred calls will be run until there are none left, which means you can defer calls from other deferred calls and they'll still be run in the current idle time cycle. This means you should not call a method deferred from itself (or from a method called by it), as this causes infinite recursion the same way as if you had called the method directly.  
         *  See also [method Object.call_deferred].  
         */
        call_deferred(...varargs: any[]): void
        
        /** Perform an RPC (Remote Procedure Call) on all connected peers. This is used for multiplayer and is normally not available, unless the function being called has been marked as  *RPC*  (using [annotation @GDScript.@rpc] or [method Node.rpc_config]). Calling this method on unsupported functions will result in an error. See [method Node.rpc]. */
        rpc(...varargs: any[]): void
        
        /** Perform an RPC (Remote Procedure Call) on a specific peer ID (see multiplayer documentation for reference). This is used for multiplayer and is normally not available unless the function being called has been marked as  *RPC*  (using [annotation @GDScript.@rpc] or [method Node.rpc_config]). Calling this method on unsupported functions will result in an error. See [method Node.rpc_id]. */
        rpc_id(peer_id: int64, ...varargs: any[]): void
        
        /** Returns a copy of this [Callable] with one or more arguments bound. When called, the bound arguments are passed  *after*  the arguments supplied by [method call]. See also [method unbind].  
         *      
         *  **Note:** When this method is chained with other similar methods, the order in which the argument list is modified is read from right to left.  
         */
        bind<A extends any[]>(...varargs: A): Callable<BindRight<T, A>>
        static EQUAL(left: Callable, right: Callable): boolean
        static NOT_EQUAL(left: Callable, right: Callable): boolean
    }
    /** A built-in type representing a signal of an [Object].  
     *  	  
     *  @link https://docs.godotengine.org/en/4.5/classes/class_signal.html  
     */
    class Signal<T extends (...args: any[]) => void = (...args: any[]) => void> {
        as_promise(): Parameters<T> extends [] ? Promise<void> : Parameters<T> extends [infer R] ? Promise<R> : Promise<Parameters<T>>
        constructor()
        constructor(from: Signal)
        constructor(object: Object, signal: StringName)
        
        /** Returns `true` if this [Signal] has no object and the signal name is empty. Equivalent to `signal == Signal()`. */
        is_null(): boolean
        
        /** Returns the object emitting this signal. */
        get_object(): null | Object
        
        /** Returns the ID of the object emitting this signal (see [method Object.get_instance_id]). */
        get_object_id(): int64
        
        /** Returns the name of this signal. */
        get_name(): StringName
        
        /** Connects this signal to the specified [param callable]. Optional [param flags] can be also added to configure the connection's behavior (see [enum Object.ConnectFlags] constants). You can provide additional arguments to the connected [param callable] by using [method Callable.bind].  
         *  A signal can only be connected once to the same [Callable]. If the signal is already connected, this method returns [constant ERR_INVALID_PARAMETER] and generates an error, unless the signal is connected with [constant Object.CONNECT_REFERENCE_COUNTED]. To prevent this, use [method is_connected] first to check for existing connections.  
         *    
         *      
         *  **Note:** If the [param callable]'s object is freed, the connection will be lost.  
         */
        connect(callable: Callable<T>, flags?: int64 /* = 0 */): int64
        
        /** Disconnects this signal from the specified [Callable]. If the connection does not exist, generates an error. Use [method is_connected] to make sure that the connection exists. */
        disconnect(callable: Callable<T>): void
        
        /** Returns `true` if the specified [Callable] is connected to this signal. */
        is_connected(callable: Callable<T>): boolean
        
        /** Returns an [Array] of connections for this signal. Each connection is represented as a [Dictionary] that contains three entries:  
         *  - `signal` is a reference to this signal;  
         *  - `callable` is a reference to the connected [Callable];  
         *  - `flags` is a combination of [enum Object.ConnectFlags].  
         */
        get_connections(): GArray
        
        /** Returns `true` if any [Callable] is connected to this signal. */
        has_connections(): boolean
        
        /** Emits this signal. All [Callable]s connected to this signal will be triggered. This method supports a variable number of arguments, so parameters can be passed as a comma separated list. */
        emit: T
        static EQUAL(left: Signal, right: Signal): boolean
        static NOT_EQUAL(left: Signal, right: Signal): boolean
    }
    type GArrayCreateSource<T> = ReadonlyArray<T> | {
        [Symbol.iterator](): IteratorObject<GDataStructureCreateValue<T>>;
        [K: number]: GDataStructureCreateValue<T>;
    }
    type GDataStructureCreateValue<V> = V | (
         V extends GArray<infer T>
     ? [T] extends [any[]]
         ? GArrayCreateSource<{ [I in keyof T]: GDataStructureCreateValue<T[I]> }>
         : GArrayCreateSource<GDataStructureCreateValue<T>>
     : V extends GDictionary<infer T>
         ? { [K in keyof T]: GDataStructureCreateValue<T[K]> }
         : never
         )
    class GDictionary<T = Record<any, any>> {
        /** Builder function that returns a GDictionary with properties populated from a source JS object. */
        static create<V extends { [key: number | string]: GWrappableValue }>(properties: V): GValueWrap<V>
        static create<V extends GDictionary<any>>(properties: V extends GDictionary<infer T> ? { [K in keyof T]: GDataStructureCreateValue<T[K]> } : never): V
        [Symbol.iterator](): IteratorObject<{ key: any, value: any }>
        /** Returns a Proxy that targets this GDictionary but behaves similar to a regular JavaScript object. Values are exposed as enumerable properties, so Object.keys(), Object.entries() etc. will work. */
        proxy<Write extends boolean = false>(): Write extends true ? GDictionaryProxy<T> : GDictionaryReadProxy<T>
        
        set_keyed<K extends keyof T>(key: K, value: T[K]): void
        get_keyed<K extends keyof T>(key: K): UndefinedToNull<T[K]>
        constructor()
        constructor(from: GDictionary)
        constructor(base: GDictionary, key_type: int64, key_class_name: StringName, key_script: any, value_type: int64, value_class_name: StringName, value_script: any)
        size(): int64
        is_empty(): boolean
        clear(): void
        assign(dictionary: T): void
        sort(): void
        merge(dictionary: T, overwrite?: boolean /* = false */): void
        merged<U>(dictionary: GDictionary<U>, overwrite?: boolean /* = false */): GDictionary<T & U>
        has(key: keyof T): boolean
        has_all(keys: keyof T extends GAny ? GArray<keyof T> : GArray): boolean
        find_key(value: T[keyof T]): keyof T
        erase(key: keyof T): boolean
        hash(): int64
        keys(): keyof T extends GAny ? GArray<keyof T> : GArray
        values(): UndefinedToNull<T[keyof T]> extends GAny ? GArray<UndefinedToNull<T[keyof T]>> : GArray
        duplicate(deep?: boolean /* = false */): GDictionary<T>
        duplicate_deep(deep_subresources_mode?: int64 /* = 1 */): GDictionary
        get<K extends keyof T>(key: K, default_?: any /* = <any> {} */): UndefinedToNull<T[K]>
        get_or_add<K extends keyof T>(key: K, default_: T[K] /* = <any> {} */): UndefinedToNull<T[K]>
        set<K extends keyof T>(key: K, value: T[K]): boolean
        is_typed(): boolean
        is_typed_key(): boolean
        is_typed_value(): boolean
        is_same_typed(dictionary: GDictionary): boolean
        is_same_typed_key(dictionary: GDictionary): boolean
        is_same_typed_value(dictionary: GDictionary): boolean
        get_typed_key_builtin(): int64
        get_typed_value_builtin(): int64
        get_typed_key_class_name(): StringName
        get_typed_value_class_name(): StringName
        get_typed_key_script(): any
        get_typed_value_script(): any
        make_read_only(): void
        is_read_only(): boolean
        recursive_equal(dictionary: GDictionary, recursion_count: int64): boolean
        static EQUAL(left: GDictionary, right: GDictionary): boolean
        static NOT_EQUAL(left: GDictionary, right: GDictionary): boolean
    }
    class GArray<T extends GAny | GAny[] = GAny | GAny[]> {
        /** Builder function that returns a GArray populated with elements from a JS array. */
        static create<A extends any[]>(elements: A): GValueWrap<A>
        static create<A extends GArray<any>>(
            elements: A extends GArray<infer T>
                ? [T] extends [any[]]
                    ? { [I in keyof T]: GDataStructureCreateValue<T[I]> }
                    : Array<GDataStructureCreateValue<T>>
                : never
        ): GValueWrap<A>
        static create<E extends GAny>(elements: Array<GDataStructureCreateValue<E>>): GArray<E>
        [Symbol.iterator](): IteratorObject<GArrayElement<T>>
        /** Returns a Proxy that targets this GArray but behaves similar to a JavaScript array. */
        proxy<Write extends boolean = false>(): Write extends true ? GArrayProxy<GArrayElement<T>> : GArrayReadProxy<GArrayElement<T>>
        
        set_indexed<I extends int64>(index: I, value: GArrayElement<T, I>): void
        get_indexed<I extends int64>(index: I): GArrayElement<T, I>
        constructor()
        constructor(from: GArray)
        constructor(base: GArray, type: int64, class_name: StringName, script: any)
        constructor(from: PackedByteArray | byte[] | ArrayBuffer)
        constructor(from: PackedInt32Array | int32[])
        constructor(from: PackedInt64Array | int64[])
        constructor(from: PackedFloat32Array | float32[])
        constructor(from: PackedFloat64Array | float64[])
        constructor(from: PackedStringArray | string[])
        constructor(from: PackedVector2Array | Vector2[])
        constructor(from: PackedVector3Array | Vector3[])
        constructor(from: PackedColorArray | Color[])
        constructor(from: PackedVector4Array)
        size(): int64
        is_empty(): boolean
        clear(): void
        hash(): int64
        assign(array: GArray): void
        get<I extends int64>(index: I): GArrayElement<T, I>
        set<I extends int64>(index: I, value: GArrayElement<T, I>): void
        push_back(value: GArrayElement<T>): void
        push_front(value: GArrayElement<T>): void
        append(value: GArrayElement<T>): void
        append_array(array: GArray<GArrayElement<T>>): void
        resize(size: int64): int64
        insert(position: int64, value: GArrayElement<T>): int64
        remove_at(position: int64): void
        fill(value: GArrayElement<T>): void
        erase(value: GArrayElement<T>): void
        front(): GArrayElement<T>
        back(): GArrayElement<T>
        pick_random(): GArrayElement<T>
        find(what: GArrayElement<T>, from?: int64 /* = 0 */): int64
        find_custom(method: Callable, from?: int64 /* = 0 */): int64
        rfind(what: GArrayElement<T>, from?: int64 /* = -1 */): int64
        rfind_custom(method: Callable, from?: int64 /* = -1 */): int64
        count(value: GArrayElement<T>): int64
        has(value: GArrayElement<T>): boolean
        pop_back(): GArrayElement<T>
        pop_front(): GArrayElement<T>
        pop_at(position: int64): GArrayElement<T>
        sort(): void
        sort_custom(func: Callable<(a: GArrayElement<T>, b: GArrayElement<T>) => boolean>): void
        shuffle(): void
        bsearch(value: GArrayElement<T>, before?: boolean /* = true */): int64
        bsearch_custom(value: GArrayElement<T>, func: Callable<(a: GArrayElement<T>, b: GArrayElement<T>) => boolean>, before?: boolean /* = true */): int64
        reverse(): void
        duplicate(deep?: boolean /* = false */): this
        duplicate_deep(deep_subresources_mode?: int64 /* = 1 */): GArray
        slice(begin: int64, end?: int64 /* = 2147483647 */, step?: int64 /* = 1 */, deep?: boolean /* = false */): GArray<GArrayElement<T>>
        filter(method: Callable<(value: GArrayElement<T>) => boolean>): GArray<GArrayElement<T>>
        map<U extends GAny>(method: Callable<(value: GArrayElement<T>) => U>): GArray<U>
        reduce(method: Callable, accum?: any /* = <any> {} */): any
        any(method: Callable<(value: GArrayElement<T>) => boolean>): boolean
        all(method: Callable<(value: GArrayElement<T>) => boolean>): boolean
        max(): GArrayElement<T>
        min(): GArrayElement<T>
        is_typed(): boolean
        is_same_typed(array: GArray): boolean
        get_typed_builtin(): int64
        get_typed_class_name(): StringName
        get_typed_script(): any
        make_read_only(): void
        is_read_only(): boolean
        static EQUAL(left: GArray, right: GArray): boolean
        static NOT_EQUAL(left: GArray, right: GArray): boolean
        static LESS(left: GArray, right: GArray): boolean
        static LESS_EQUAL(left: GArray, right: GArray): boolean
        static GREATER(left: GArray, right: GArray): boolean
        static GREATER_EQUAL(left: GArray, right: GArray): boolean
    }
    /** A packed array of bytes.  
     *  	  
     *  @link https://docs.godotengine.org/en/4.5/classes/class_packedbytearray.html  
     */
    class PackedByteArray {
        /** [jsb utility method] Converts a PackedByteArray to a JavaScript ArrayBuffer. */
        to_array_buffer(): ArrayBuffer
        constructor()
        constructor(from: PackedByteArray | byte[] | ArrayBuffer)
        constructor(from: GArray)
        
        /** Returns the byte at the given [param index] in the array. If [param index] out-of-bounds or negative, this method fails and returns `0`.  
         *  This method is similar (but not identical) to the `[]` operator. Most notably, when this method fails, it doesn't pause project execution if run from the editor.  
         */
        get(index: int64): int64
        
        /** Changes the byte at the given index. */
        set(index: int64, value: int64): void
        
        /** Returns the number of elements in the array. */
        size(): int64
        
        /** Returns `true` if the array is empty. */
        is_empty(): boolean
        
        /** Appends an element at the end of the array. */
        push_back(value: int64): boolean
        
        /** Appends an element at the end of the array (alias of [method push_back]). */
        append(value: int64): boolean
        
        /** Appends a [PackedByteArray] at the end of this array. */
        append_array(array: PackedByteArray | byte[] | ArrayBuffer): void
        
        /** Removes an element from the array by index. */
        remove_at(index: int64): void
        
        /** Inserts a new element at a given position in the array. The position must be valid, or at the end of the array (`idx == size()`). */
        insert(at_index: int64, value: int64): int64
        
        /** Assigns the given value to all elements in the array. This can typically be used together with [method resize] to create an array with a given size and initialized elements. */
        fill(value: int64): void
        
        /** Sets the size of the array. If the array is grown, reserves elements at the end of the array. If the array is shrunk, truncates the array to the new size. Calling [method resize] once and assigning the new values is faster than adding new elements one by one.  
         *  Returns [constant OK] on success, or one of the following [enum Error] constants if this method fails: [constant ERR_INVALID_PARAMETER] if the size is negative, or [constant ERR_OUT_OF_MEMORY] if allocations fail. Use [method size] to find the actual size of the array after resize.  
         */
        resize(new_size: int64): int64
        
        /** Clears the array. This is equivalent to using [method resize] with a size of `0`. */
        clear(): void
        
        /** Returns `true` if the array contains [param value]. */
        has(value: int64): boolean
        
        /** Reverses the order of the elements in the array. */
        reverse(): void
        
        /** Returns the slice of the [PackedByteArray], from [param begin] (inclusive) to [param end] (exclusive), as a new [PackedByteArray].  
         *  The absolute value of [param begin] and [param end] will be clamped to the array size, so the default value for [param end] makes it slice to the size of the array by default (i.e. `arr.slice(1)` is a shorthand for `arr.slice(1, arr.size())`).  
         *  If either [param begin] or [param end] are negative, they will be relative to the end of the array (i.e. `arr.slice(0, -2)` is a shorthand for `arr.slice(0, arr.size() - 2)`).  
         */
        slice(begin: int64, end?: int64 /* = 2147483647 */): PackedByteArray
        
        /** Sorts the elements of the array in ascending order. */
        sort(): void
        
        /** Finds the index of an existing value (or the insertion index that maintains sorting order, if the value is not yet present in the array) using binary search. Optionally, a [param before] specifier can be passed. If `false`, the returned index comes after all existing entries of the value in the array.  
         *      
         *  **Note:** Calling [method bsearch] on an unsorted array results in unexpected behavior.  
         */
        bsearch(value: int64, before?: boolean /* = true */): int64
        
        /** Creates a copy of the array, and returns it. */
        duplicate(): PackedByteArray
        
        /** Searches the array for a value and returns its index or `-1` if not found. Optionally, the initial search index can be passed. */
        find(value: int64, from?: int64 /* = 0 */): int64
        
        /** Searches the array in reverse order. Optionally, a start search index can be passed. If negative, the start index is considered relative to the end of the array. */
        rfind(value: int64, from?: int64 /* = -1 */): int64
        
        /** Returns the number of times an element is in the array. */
        count(value: int64): int64
        
        /** Removes the first occurrence of a value from the array and returns `true`. If the value does not exist in the array, nothing happens and `false` is returned. To remove an element by index, use [method remove_at] instead. */
        erase(value: int64): boolean
        
        /** Converts ASCII/Latin-1 encoded array to [String]. Fast alternative to [method get_string_from_utf8] if the content is ASCII/Latin-1 only. Unlike the UTF-8 function this function maps every byte to a character in the array. Multibyte sequences will not be interpreted correctly. For parsing user input always use [method get_string_from_utf8]. This is the inverse of [method String.to_ascii_buffer]. */
        get_string_from_ascii(): string
        
        /** Converts UTF-8 encoded array to [String]. Slower than [method get_string_from_ascii] but supports UTF-8 encoded data. Use this function if you are unsure about the source of the data. For user input this function should always be preferred. Returns empty string if source array is not valid UTF-8 string. This is the inverse of [method String.to_utf8_buffer]. */
        get_string_from_utf8(): string
        
        /** Converts UTF-16 encoded array to [String]. If the BOM is missing, little-endianness is assumed. Returns empty string if source array is not valid UTF-16 string. This is the inverse of [method String.to_utf16_buffer]. */
        get_string_from_utf16(): string
        
        /** Converts UTF-32 encoded array to [String]. Returns empty string if source array is not valid UTF-32 string. This is the inverse of [method String.to_utf32_buffer]. */
        get_string_from_utf32(): string
        
        /** Converts wide character (`wchar_t`, UTF-16 on Windows, UTF-32 on other platforms) encoded array to [String]. Returns empty string if source array is not valid wide string. This is the inverse of [method String.to_wchar_buffer]. */
        get_string_from_wchar(): string
        
        /** Converts system multibyte code page encoded array to [String]. If conversion fails, empty string is returned. This is the inverse of [method String.to_multibyte_char_buffer].  
         *  The values permitted for [param encoding] are system dependent. If [param encoding] is empty string, system default encoding is used.  
         *  - For Windows, see [url=https://learn.microsoft.com/en-us/windows/win32/Intl/code-page-identifiers]Code Page Identifiers[/url] .NET names.  
         *  - For macOS and Linux/BSD, see `libiconv` library documentation and `iconv --list` for a list of supported encodings.  
         */
        get_string_from_multibyte_char(encoding?: string /* = '' */): string
        
        /** Returns a hexadecimal representation of this array as a [String].  
         *    
         */
        hex_encode(): string
        
        /** Returns a new [PackedByteArray] with the data compressed. Set the compression mode using one of [enum FileAccess.CompressionMode]'s constants. */
        compress(compression_mode?: int64 /* = 0 */): PackedByteArray
        
        /** Returns a new [PackedByteArray] with the data decompressed. Set [param buffer_size] to the size of the uncompressed data. Set the compression mode using one of [enum FileAccess.CompressionMode]'s constants.  
         *      
         *  **Note:** Decompression is not guaranteed to work with data not compressed by Godot, for example if data compressed with the deflate compression mode lacks a checksum or header.  
         */
        decompress(buffer_size: int64, compression_mode?: int64 /* = 0 */): PackedByteArray
        
        /** Returns a new [PackedByteArray] with the data decompressed. Set the compression mode using one of [enum FileAccess.CompressionMode]'s constants. **This method only accepts brotli, gzip, and deflate compression modes.**  
         *  This method is potentially slower than [method decompress], as it may have to re-allocate its output buffer multiple times while decompressing, whereas [method decompress] knows it's output buffer size from the beginning.  
         *  GZIP has a maximal compression ratio of 1032:1, meaning it's very possible for a small compressed payload to decompress to a potentially very large output. To guard against this, you may provide a maximum size this function is allowed to allocate in bytes via [param max_output_size]. Passing -1 will allow for unbounded output. If any positive value is passed, and the decompression exceeds that amount in bytes, then an error will be returned.  
         *      
         *  **Note:** Decompression is not guaranteed to work with data not compressed by Godot, for example if data compressed with the deflate compression mode lacks a checksum or header.  
         */
        decompress_dynamic(max_output_size: int64, compression_mode?: int64 /* = 0 */): PackedByteArray
        
        /** Decodes a 8-bit unsigned integer number from the bytes starting at [param byte_offset]. Fails if the byte count is insufficient. Returns `0` if a valid number can't be decoded. */
        decode_u8(byte_offset: int64): int64
        
        /** Decodes a 8-bit signed integer number from the bytes starting at [param byte_offset]. Fails if the byte count is insufficient. Returns `0` if a valid number can't be decoded. */
        decode_s8(byte_offset: int64): int64
        
        /** Decodes a 16-bit unsigned integer number from the bytes starting at [param byte_offset]. Fails if the byte count is insufficient. Returns `0` if a valid number can't be decoded. */
        decode_u16(byte_offset: int64): int64
        
        /** Decodes a 16-bit signed integer number from the bytes starting at [param byte_offset]. Fails if the byte count is insufficient. Returns `0` if a valid number can't be decoded. */
        decode_s16(byte_offset: int64): int64
        
        /** Decodes a 32-bit unsigned integer number from the bytes starting at [param byte_offset]. Fails if the byte count is insufficient. Returns `0` if a valid number can't be decoded. */
        decode_u32(byte_offset: int64): int64
        
        /** Decodes a 32-bit signed integer number from the bytes starting at [param byte_offset]. Fails if the byte count is insufficient. Returns `0` if a valid number can't be decoded. */
        decode_s32(byte_offset: int64): int64
        
        /** Decodes a 64-bit unsigned integer number from the bytes starting at [param byte_offset]. Fails if the byte count is insufficient. Returns `0` if a valid number can't be decoded. */
        decode_u64(byte_offset: int64): int64
        
        /** Decodes a 64-bit signed integer number from the bytes starting at [param byte_offset]. Fails if the byte count is insufficient. Returns `0` if a valid number can't be decoded. */
        decode_s64(byte_offset: int64): int64
        
        /** Decodes a 16-bit floating-point number from the bytes starting at [param byte_offset]. Fails if the byte count is insufficient. Returns `0.0` if a valid number can't be decoded. */
        decode_half(byte_offset: int64): float64
        
        /** Decodes a 32-bit floating-point number from the bytes starting at [param byte_offset]. Fails if the byte count is insufficient. Returns `0.0` if a valid number can't be decoded. */
        decode_float(byte_offset: int64): float64
        
        /** Decodes a 64-bit floating-point number from the bytes starting at [param byte_offset]. Fails if the byte count is insufficient. Returns `0.0` if a valid number can't be decoded. */
        decode_double(byte_offset: int64): float64
        
        /** Returns `true` if a valid [Variant] value can be decoded at the [param byte_offset]. Returns `false` otherwise or when the value is [Object]-derived and [param allow_objects] is `false`. */
        has_encoded_var(byte_offset: int64, allow_objects?: boolean /* = false */): boolean
        
        /** Decodes a [Variant] from the bytes starting at [param byte_offset]. Returns `null` if a valid variant can't be decoded or the value is [Object]-derived and [param allow_objects] is `false`. */
        decode_var(byte_offset: int64, allow_objects?: boolean /* = false */): any
        
        /** Decodes a size of a [Variant] from the bytes starting at [param byte_offset]. Requires at least 4 bytes of data starting at the offset, otherwise fails. */
        decode_var_size(byte_offset: int64, allow_objects?: boolean /* = false */): int64
        
        /** Returns a copy of the data converted to a [PackedInt32Array], where each block of 4 bytes has been converted to a signed 32-bit integer (C++ `int32_t`).  
         *  The size of the input array must be a multiple of 4 (size of 32-bit integer). The size of the new array will be `byte_array.size() / 4`.  
         *  If the original data can't be converted to signed 32-bit integers, the resulting data is undefined.  
         */
        to_int32_array(): PackedInt32Array
        
        /** Returns a copy of the data converted to a [PackedInt64Array], where each block of 8 bytes has been converted to a signed 64-bit integer (C++ `int64_t`, Godot [int]).  
         *  The size of the input array must be a multiple of 8 (size of 64-bit integer). The size of the new array will be `byte_array.size() / 8`.  
         *  If the original data can't be converted to signed 64-bit integers, the resulting data is undefined.  
         */
        to_int64_array(): PackedInt64Array
        
        /** Returns a copy of the data converted to a [PackedFloat32Array], where each block of 4 bytes has been converted to a 32-bit float (C++ [code skip-lint]float`).  
         *  The size of the input array must be a multiple of 4 (size of 32-bit float). The size of the new array will be `byte_array.size() / 4`.  
         *  If the original data can't be converted to 32-bit floats, the resulting data is undefined.  
         */
        to_float32_array(): PackedFloat32Array
        
        /** Returns a copy of the data converted to a [PackedFloat64Array], where each block of 8 bytes has been converted to a 64-bit float (C++ `double`, Godot [float]).  
         *  The size of the input array must be a multiple of 8 (size of 64-bit double). The size of the new array will be `byte_array.size() / 8`.  
         *  If the original data can't be converted to 64-bit floats, the resulting data is undefined.  
         */
        to_float64_array(): PackedFloat64Array
        
        /** Returns a copy of the data converted to a [PackedVector2Array], where each block of 8 bytes or 16 bytes (32-bit or 64-bit) has been converted to a [Vector2] variant.  
         *      
         *  **Note:** The size of the input array must be a multiple of 8 or 16 (depending on the build settings, see [Vector2] for more details). The size of the new array will be `byte_array.size() / (8 or 16)`. If the original data can't be converted to [Vector2] variants, the resulting data is undefined.  
         */
        to_vector2_array(): PackedVector2Array
        
        /** Returns a copy of the data converted to a [PackedVector3Array], where each block of 12 or 24 bytes (32-bit or 64-bit) has been converted to a [Vector3] variant.  
         *      
         *  **Note:** The size of the input array must be a multiple of 12 or 24 (depending on the build settings, see [Vector3] for more details). The size of the new array will be `byte_array.size() / (12 or 24)`. If the original data can't be converted to [Vector3] variants, the resulting data is undefined.  
         */
        to_vector3_array(): PackedVector3Array
        
        /** Returns a copy of the data converted to a [PackedVector4Array], where each block of 16 or 32 bytes (32-bit or 64-bit) has been converted to a [Vector4] variant.  
         *      
         *  **Note:** The size of the input array must be a multiple of 16 or 32 (depending on the build settings, see [Vector4] for more details). The size of the new array will be `byte_array.size() / (16 or 32)`. If the original data can't be converted to [Vector4] variants, the resulting data is undefined.  
         */
        to_vector4_array(): PackedVector4Array
        
        /** Returns a copy of the data converted to a [PackedColorArray], where each block of 16 bytes has been converted to a [Color] variant.  
         *      
         *  **Note:** The size of the input array must be a multiple of 16 (size of four 32-bit float variables). The size of the new array will be `byte_array.size() / 16`. If the original data can't be converted to [Color] variants, the resulting data is undefined.  
         */
        to_color_array(): PackedColorArray
        
        /** Swaps the byte order of [param count] 16-bit segments of the array starting at [param offset]. Swap is done in-place. If [param count] is less than zero, all segments to the end of array are processed, if processed data size is not a multiple of 2, the byte after the last processed 16-bit segment is not modified. */
        bswap16(offset?: int64 /* = 0 */, count?: int64 /* = -1 */): void
        
        /** Swaps the byte order of [param count] 32-bit segments of the array starting at [param offset]. Swap is done in-place. If [param count] is less than zero, all segments to the end of array are processed, if processed data size is not a multiple of 4, bytes after the last processed 32-bit segment are not modified. */
        bswap32(offset?: int64 /* = 0 */, count?: int64 /* = -1 */): void
        
        /** Swaps the byte order of [param count] 64-bit segments of the array starting at [param offset]. Swap is done in-place. If [param count] is less than zero, all segments to the end of array are processed, if processed data size is not a multiple of 8, bytes after the last processed 64-bit segment are not modified. */
        bswap64(offset?: int64 /* = 0 */, count?: int64 /* = -1 */): void
        
        /** Encodes a 8-bit unsigned integer number (byte) at the index of [param byte_offset] bytes. The array must have at least 1 byte of space, starting at the offset. */
        encode_u8(byte_offset: int64, value: int64): void
        
        /** Encodes a 8-bit signed integer number (signed byte) at the index of [param byte_offset] bytes. The array must have at least 1 byte of space, starting at the offset. */
        encode_s8(byte_offset: int64, value: int64): void
        
        /** Encodes a 16-bit unsigned integer number as bytes at the index of [param byte_offset] bytes. The array must have at least 2 bytes of space, starting at the offset. */
        encode_u16(byte_offset: int64, value: int64): void
        
        /** Encodes a 16-bit signed integer number as bytes at the index of [param byte_offset] bytes. The array must have at least 2 bytes of space, starting at the offset. */
        encode_s16(byte_offset: int64, value: int64): void
        
        /** Encodes a 32-bit unsigned integer number as bytes at the index of [param byte_offset] bytes. The array must have at least 4 bytes of space, starting at the offset. */
        encode_u32(byte_offset: int64, value: int64): void
        
        /** Encodes a 32-bit signed integer number as bytes at the index of [param byte_offset] bytes. The array must have at least 4 bytes of space, starting at the offset. */
        encode_s32(byte_offset: int64, value: int64): void
        
        /** Encodes a 64-bit unsigned integer number as bytes at the index of [param byte_offset] bytes. The array must have at least 8 bytes of space, starting at the offset. */
        encode_u64(byte_offset: int64, value: int64): void
        
        /** Encodes a 64-bit signed integer number as bytes at the index of [param byte_offset] bytes. The array must have at least 8 bytes of space, starting at the offset. */
        encode_s64(byte_offset: int64, value: int64): void
        
        /** Encodes a 16-bit floating-point number as bytes at the index of [param byte_offset] bytes. The array must have at least 2 bytes of space, starting at the offset. */
        encode_half(byte_offset: int64, value: float64): void
        
        /** Encodes a 32-bit floating-point number as bytes at the index of [param byte_offset] bytes. The array must have at least 4 bytes of space, starting at the offset. */
        encode_float(byte_offset: int64, value: float64): void
        
        /** Encodes a 64-bit floating-point number as bytes at the index of [param byte_offset] bytes. The array must have at least 8 bytes of allocated space, starting at the offset. */
        encode_double(byte_offset: int64, value: float64): void
        
        /** Encodes a [Variant] at the index of [param byte_offset] bytes. A sufficient space must be allocated, depending on the encoded variant's size. If [param allow_objects] is `false`, [Object]-derived values are not permitted and will instead be serialized as ID-only. */
        encode_var(byte_offset: int64, value: any, allow_objects?: boolean /* = false */): int64
        static EQUAL(left: PackedByteArray | byte[] | ArrayBuffer, right: PackedByteArray | byte[] | ArrayBuffer): boolean
        static NOT_EQUAL(left: PackedByteArray | byte[] | ArrayBuffer, right: PackedByteArray | byte[] | ArrayBuffer): boolean
    }
    /** A packed array of 32-bit integers.  
     *  	  
     *  @link https://docs.godotengine.org/en/4.5/classes/class_packedint32array.html  
     */
    class PackedInt32Array {
        constructor()
        constructor(from: PackedInt32Array | int32[])
        constructor(from: GArray)
        
        /** Returns the 32-bit integer at the given [param index] in the array. If [param index] out-of-bounds or negative, this method fails and returns `0`.  
         *  This method is similar (but not identical) to the `[]` operator. Most notably, when this method fails, it doesn't pause project execution if run from the editor.  
         */
        get(index: int64): int64
        
        /** Changes the integer at the given index. */
        set(index: int64, value: int64): void
        
        /** Returns the number of elements in the array. */
        size(): int64
        
        /** Returns `true` if the array is empty. */
        is_empty(): boolean
        
        /** Appends a value to the array. */
        push_back(value: int64): boolean
        
        /** Appends an element at the end of the array (alias of [method push_back]). */
        append(value: int64): boolean
        
        /** Appends a [PackedInt32Array] at the end of this array. */
        append_array(array: PackedInt32Array | int32[]): void
        
        /** Removes an element from the array by index. */
        remove_at(index: int64): void
        
        /** Inserts a new integer at a given position in the array. The position must be valid, or at the end of the array (`idx == size()`). */
        insert(at_index: int64, value: int64): int64
        
        /** Assigns the given value to all elements in the array. This can typically be used together with [method resize] to create an array with a given size and initialized elements. */
        fill(value: int64): void
        
        /** Sets the size of the array. If the array is grown, reserves elements at the end of the array. If the array is shrunk, truncates the array to the new size. Calling [method resize] once and assigning the new values is faster than adding new elements one by one.  
         *  Returns [constant OK] on success, or one of the following [enum Error] constants if this method fails: [constant ERR_INVALID_PARAMETER] if the size is negative, or [constant ERR_OUT_OF_MEMORY] if allocations fail. Use [method size] to find the actual size of the array after resize.  
         */
        resize(new_size: int64): int64
        
        /** Clears the array. This is equivalent to using [method resize] with a size of `0`. */
        clear(): void
        
        /** Returns `true` if the array contains [param value]. */
        has(value: int64): boolean
        
        /** Reverses the order of the elements in the array. */
        reverse(): void
        
        /** Returns the slice of the [PackedInt32Array], from [param begin] (inclusive) to [param end] (exclusive), as a new [PackedInt32Array].  
         *  The absolute value of [param begin] and [param end] will be clamped to the array size, so the default value for [param end] makes it slice to the size of the array by default (i.e. `arr.slice(1)` is a shorthand for `arr.slice(1, arr.size())`).  
         *  If either [param begin] or [param end] are negative, they will be relative to the end of the array (i.e. `arr.slice(0, -2)` is a shorthand for `arr.slice(0, arr.size() - 2)`).  
         */
        slice(begin: int64, end?: int64 /* = 2147483647 */): PackedInt32Array
        
        /** Returns a copy of the data converted to a [PackedByteArray], where each element has been encoded as 4 bytes.  
         *  The size of the new array will be `int32_array.size() * 4`.  
         */
        to_byte_array(): PackedByteArray
        
        /** Sorts the elements of the array in ascending order. */
        sort(): void
        
        /** Finds the index of an existing value (or the insertion index that maintains sorting order, if the value is not yet present in the array) using binary search. Optionally, a [param before] specifier can be passed. If `false`, the returned index comes after all existing entries of the value in the array.  
         *      
         *  **Note:** Calling [method bsearch] on an unsorted array results in unexpected behavior.  
         */
        bsearch(value: int64, before?: boolean /* = true */): int64
        
        /** Creates a copy of the array, and returns it. */
        duplicate(): PackedInt32Array
        
        /** Searches the array for a value and returns its index or `-1` if not found. Optionally, the initial search index can be passed. */
        find(value: int64, from?: int64 /* = 0 */): int64
        
        /** Searches the array in reverse order. Optionally, a start search index can be passed. If negative, the start index is considered relative to the end of the array. */
        rfind(value: int64, from?: int64 /* = -1 */): int64
        
        /** Returns the number of times an element is in the array. */
        count(value: int64): int64
        
        /** Removes the first occurrence of a value from the array and returns `true`. If the value does not exist in the array, nothing happens and `false` is returned. To remove an element by index, use [method remove_at] instead. */
        erase(value: int64): boolean
        static EQUAL(left: PackedInt32Array | int32[], right: PackedInt32Array | int32[]): boolean
        static NOT_EQUAL(left: PackedInt32Array | int32[], right: PackedInt32Array | int32[]): boolean
    }
    /** A packed array of 64-bit integers.  
     *  	  
     *  @link https://docs.godotengine.org/en/4.5/classes/class_packedint64array.html  
     */
    class PackedInt64Array {
        constructor()
        constructor(from: PackedInt64Array | int64[])
        constructor(from: GArray)
        
        /** Returns the 64-bit integer at the given [param index] in the array. If [param index] out-of-bounds or negative, this method fails and returns `0`.  
         *  This method is similar (but not identical) to the `[]` operator. Most notably, when this method fails, it doesn't pause project execution if run from the editor.  
         */
        get(index: int64): int64
        
        /** Changes the integer at the given index. */
        set(index: int64, value: int64): void
        
        /** Returns the number of elements in the array. */
        size(): int64
        
        /** Returns `true` if the array is empty. */
        is_empty(): boolean
        
        /** Appends a value to the array. */
        push_back(value: int64): boolean
        
        /** Appends an element at the end of the array (alias of [method push_back]). */
        append(value: int64): boolean
        
        /** Appends a [PackedInt64Array] at the end of this array. */
        append_array(array: PackedInt64Array | int64[]): void
        
        /** Removes an element from the array by index. */
        remove_at(index: int64): void
        
        /** Inserts a new integer at a given position in the array. The position must be valid, or at the end of the array (`idx == size()`). */
        insert(at_index: int64, value: int64): int64
        
        /** Assigns the given value to all elements in the array. This can typically be used together with [method resize] to create an array with a given size and initialized elements. */
        fill(value: int64): void
        
        /** Sets the size of the array. If the array is grown, reserves elements at the end of the array. If the array is shrunk, truncates the array to the new size. Calling [method resize] once and assigning the new values is faster than adding new elements one by one.  
         *  Returns [constant OK] on success, or one of the following [enum Error] constants if this method fails: [constant ERR_INVALID_PARAMETER] if the size is negative, or [constant ERR_OUT_OF_MEMORY] if allocations fail. Use [method size] to find the actual size of the array after resize.  
         */
        resize(new_size: int64): int64
        
        /** Clears the array. This is equivalent to using [method resize] with a size of `0`. */
        clear(): void
        
        /** Returns `true` if the array contains [param value]. */
        has(value: int64): boolean
        
        /** Reverses the order of the elements in the array. */
        reverse(): void
        
        /** Returns the slice of the [PackedInt64Array], from [param begin] (inclusive) to [param end] (exclusive), as a new [PackedInt64Array].  
         *  The absolute value of [param begin] and [param end] will be clamped to the array size, so the default value for [param end] makes it slice to the size of the array by default (i.e. `arr.slice(1)` is a shorthand for `arr.slice(1, arr.size())`).  
         *  If either [param begin] or [param end] are negative, they will be relative to the end of the array (i.e. `arr.slice(0, -2)` is a shorthand for `arr.slice(0, arr.size() - 2)`).  
         */
        slice(begin: int64, end?: int64 /* = 2147483647 */): PackedInt64Array
        
        /** Returns a copy of the data converted to a [PackedByteArray], where each element has been encoded as 8 bytes.  
         *  The size of the new array will be `int64_array.size() * 8`.  
         */
        to_byte_array(): PackedByteArray
        
        /** Sorts the elements of the array in ascending order. */
        sort(): void
        
        /** Finds the index of an existing value (or the insertion index that maintains sorting order, if the value is not yet present in the array) using binary search. Optionally, a [param before] specifier can be passed. If `false`, the returned index comes after all existing entries of the value in the array.  
         *      
         *  **Note:** Calling [method bsearch] on an unsorted array results in unexpected behavior.  
         */
        bsearch(value: int64, before?: boolean /* = true */): int64
        
        /** Creates a copy of the array, and returns it. */
        duplicate(): PackedInt64Array
        
        /** Searches the array for a value and returns its index or `-1` if not found. Optionally, the initial search index can be passed. */
        find(value: int64, from?: int64 /* = 0 */): int64
        
        /** Searches the array in reverse order. Optionally, a start search index can be passed. If negative, the start index is considered relative to the end of the array. */
        rfind(value: int64, from?: int64 /* = -1 */): int64
        
        /** Returns the number of times an element is in the array. */
        count(value: int64): int64
        
        /** Removes the first occurrence of a value from the array and returns `true`. If the value does not exist in the array, nothing happens and `false` is returned. To remove an element by index, use [method remove_at] instead. */
        erase(value: int64): boolean
        static EQUAL(left: PackedInt64Array | int64[], right: PackedInt64Array | int64[]): boolean
        static NOT_EQUAL(left: PackedInt64Array | int64[], right: PackedInt64Array | int64[]): boolean
    }
    /** A packed array of 32-bit floating-point values.  
     *  	  
     *  @link https://docs.godotengine.org/en/4.5/classes/class_packedfloat32array.html  
     */
    class PackedFloat32Array {
        constructor()
        constructor(from: PackedFloat32Array | float32[])
        constructor(from: GArray)
        
        /** Returns the 32-bit float at the given [param index] in the array. If [param index] out-of-bounds or negative, this method fails and returns `0.0`.  
         *  This method is similar (but not identical) to the `[]` operator. Most notably, when this method fails, it doesn't pause project execution if run from the editor.  
         */
        get(index: int64): float64
        
        /** Changes the float at the given index. */
        set(index: int64, value: float64): void
        
        /** Returns the number of elements in the array. */
        size(): int64
        
        /** Returns `true` if the array is empty. */
        is_empty(): boolean
        
        /** Appends an element at the end of the array. */
        push_back(value: float64): boolean
        
        /** Appends an element at the end of the array (alias of [method push_back]). */
        append(value: float64): boolean
        
        /** Appends a [PackedFloat32Array] at the end of this array. */
        append_array(array: PackedFloat32Array | float32[]): void
        
        /** Removes an element from the array by index. */
        remove_at(index: int64): void
        
        /** Inserts a new element at a given position in the array. The position must be valid, or at the end of the array (`idx == size()`). */
        insert(at_index: int64, value: float64): int64
        
        /** Assigns the given value to all elements in the array. This can typically be used together with [method resize] to create an array with a given size and initialized elements. */
        fill(value: float64): void
        
        /** Sets the size of the array. If the array is grown, reserves elements at the end of the array. If the array is shrunk, truncates the array to the new size. Calling [method resize] once and assigning the new values is faster than adding new elements one by one.  
         *  Returns [constant OK] on success, or one of the following [enum Error] constants if this method fails: [constant ERR_INVALID_PARAMETER] if the size is negative, or [constant ERR_OUT_OF_MEMORY] if allocations fail. Use [method size] to find the actual size of the array after resize.  
         */
        resize(new_size: int64): int64
        
        /** Clears the array. This is equivalent to using [method resize] with a size of `0`. */
        clear(): void
        
        /** Returns `true` if the array contains [param value].  
         *      
         *  **Note:** [constant @GDScript.NAN] doesn't behave the same as other numbers. Therefore, the results from this method may not be accurate if NaNs are included.  
         */
        has(value: float64): boolean
        
        /** Reverses the order of the elements in the array. */
        reverse(): void
        
        /** Returns the slice of the [PackedFloat32Array], from [param begin] (inclusive) to [param end] (exclusive), as a new [PackedFloat32Array].  
         *  The absolute value of [param begin] and [param end] will be clamped to the array size, so the default value for [param end] makes it slice to the size of the array by default (i.e. `arr.slice(1)` is a shorthand for `arr.slice(1, arr.size())`).  
         *  If either [param begin] or [param end] are negative, they will be relative to the end of the array (i.e. `arr.slice(0, -2)` is a shorthand for `arr.slice(0, arr.size() - 2)`).  
         */
        slice(begin: int64, end?: int64 /* = 2147483647 */): PackedFloat32Array
        
        /** Returns a copy of the data converted to a [PackedByteArray], where each element has been encoded as 4 bytes.  
         *  The size of the new array will be `float32_array.size() * 4`.  
         */
        to_byte_array(): PackedByteArray
        
        /** Sorts the elements of the array in ascending order.  
         *      
         *  **Note:** [constant @GDScript.NAN] doesn't behave the same as other numbers. Therefore, the results from this method may not be accurate if NaNs are included.  
         */
        sort(): void
        
        /** Finds the index of an existing value (or the insertion index that maintains sorting order, if the value is not yet present in the array) using binary search. Optionally, a [param before] specifier can be passed. If `false`, the returned index comes after all existing entries of the value in the array.  
         *      
         *  **Note:** Calling [method bsearch] on an unsorted array results in unexpected behavior.  
         *      
         *  **Note:** [constant @GDScript.NAN] doesn't behave the same as other numbers. Therefore, the results from this method may not be accurate if NaNs are included.  
         */
        bsearch(value: float64, before?: boolean /* = true */): int64
        
        /** Creates a copy of the array, and returns it. */
        duplicate(): PackedFloat32Array
        
        /** Searches the array for a value and returns its index or `-1` if not found. Optionally, the initial search index can be passed.  
         *      
         *  **Note:** [constant @GDScript.NAN] doesn't behave the same as other numbers. Therefore, the results from this method may not be accurate if NaNs are included.  
         */
        find(value: float64, from?: int64 /* = 0 */): int64
        
        /** Searches the array in reverse order. Optionally, a start search index can be passed. If negative, the start index is considered relative to the end of the array.  
         *      
         *  **Note:** [constant @GDScript.NAN] doesn't behave the same as other numbers. Therefore, the results from this method may not be accurate if NaNs are included.  
         */
        rfind(value: float64, from?: int64 /* = -1 */): int64
        
        /** Returns the number of times an element is in the array.  
         *      
         *  **Note:** [constant @GDScript.NAN] doesn't behave the same as other numbers. Therefore, the results from this method may not be accurate if NaNs are included.  
         */
        count(value: float64): int64
        
        /** Removes the first occurrence of a value from the array and returns `true`. If the value does not exist in the array, nothing happens and `false` is returned. To remove an element by index, use [method remove_at] instead.  
         *      
         *  **Note:** [constant @GDScript.NAN] doesn't behave the same as other numbers. Therefore, the results from this method may not be accurate if NaNs are included.  
         */
        erase(value: float64): boolean
        static EQUAL(left: PackedFloat32Array | float32[], right: PackedFloat32Array | float32[]): boolean
        static NOT_EQUAL(left: PackedFloat32Array | float32[], right: PackedFloat32Array | float32[]): boolean
    }
    /** A packed array of 64-bit floating-point values.  
     *  	  
     *  @link https://docs.godotengine.org/en/4.5/classes/class_packedfloat64array.html  
     */
    class PackedFloat64Array {
        constructor()
        constructor(from: PackedFloat64Array | float64[])
        constructor(from: GArray)
        
        /** Returns the 64-bit float at the given [param index] in the array. If [param index] out-of-bounds or negative, this method fails and returns `0.0`.  
         *  This method is similar (but not identical) to the `[]` operator. Most notably, when this method fails, it doesn't pause project execution if run from the editor.  
         */
        get(index: int64): float64
        
        /** Changes the float at the given index. */
        set(index: int64, value: float64): void
        
        /** Returns the number of elements in the array. */
        size(): int64
        
        /** Returns `true` if the array is empty. */
        is_empty(): boolean
        
        /** Appends an element at the end of the array. */
        push_back(value: float64): boolean
        
        /** Appends an element at the end of the array (alias of [method push_back]). */
        append(value: float64): boolean
        
        /** Appends a [PackedFloat64Array] at the end of this array. */
        append_array(array: PackedFloat64Array | float64[]): void
        
        /** Removes an element from the array by index. */
        remove_at(index: int64): void
        
        /** Inserts a new element at a given position in the array. The position must be valid, or at the end of the array (`idx == size()`). */
        insert(at_index: int64, value: float64): int64
        
        /** Assigns the given value to all elements in the array. This can typically be used together with [method resize] to create an array with a given size and initialized elements. */
        fill(value: float64): void
        
        /** Sets the size of the array. If the array is grown, reserves elements at the end of the array. If the array is shrunk, truncates the array to the new size. Calling [method resize] once and assigning the new values is faster than adding new elements one by one.  
         *  Returns [constant OK] on success, or one of the following [enum Error] constants if this method fails: [constant ERR_INVALID_PARAMETER] if the size is negative, or [constant ERR_OUT_OF_MEMORY] if allocations fail. Use [method size] to find the actual size of the array after resize.  
         */
        resize(new_size: int64): int64
        
        /** Clears the array. This is equivalent to using [method resize] with a size of `0`. */
        clear(): void
        
        /** Returns `true` if the array contains [param value].  
         *      
         *  **Note:** [constant @GDScript.NAN] doesn't behave the same as other numbers. Therefore, the results from this method may not be accurate if NaNs are included.  
         */
        has(value: float64): boolean
        
        /** Reverses the order of the elements in the array. */
        reverse(): void
        
        /** Returns the slice of the [PackedFloat64Array], from [param begin] (inclusive) to [param end] (exclusive), as a new [PackedFloat64Array].  
         *  The absolute value of [param begin] and [param end] will be clamped to the array size, so the default value for [param end] makes it slice to the size of the array by default (i.e. `arr.slice(1)` is a shorthand for `arr.slice(1, arr.size())`).  
         *  If either [param begin] or [param end] are negative, they will be relative to the end of the array (i.e. `arr.slice(0, -2)` is a shorthand for `arr.slice(0, arr.size() - 2)`).  
         */
        slice(begin: int64, end?: int64 /* = 2147483647 */): PackedFloat64Array
        
        /** Returns a copy of the data converted to a [PackedByteArray], where each element has been encoded as 8 bytes.  
         *  The size of the new array will be `float64_array.size() * 8`.  
         */
        to_byte_array(): PackedByteArray
        
        /** Sorts the elements of the array in ascending order.  
         *      
         *  **Note:** [constant @GDScript.NAN] doesn't behave the same as other numbers. Therefore, the results from this method may not be accurate if NaNs are included.  
         */
        sort(): void
        
        /** Finds the index of an existing value (or the insertion index that maintains sorting order, if the value is not yet present in the array) using binary search. Optionally, a [param before] specifier can be passed. If `false`, the returned index comes after all existing entries of the value in the array.  
         *      
         *  **Note:** Calling [method bsearch] on an unsorted array results in unexpected behavior.  
         *      
         *  **Note:** [constant @GDScript.NAN] doesn't behave the same as other numbers. Therefore, the results from this method may not be accurate if NaNs are included.  
         */
        bsearch(value: float64, before?: boolean /* = true */): int64
        
        /** Creates a copy of the array, and returns it. */
        duplicate(): PackedFloat64Array
        
        /** Searches the array for a value and returns its index or `-1` if not found. Optionally, the initial search index can be passed.  
         *      
         *  **Note:** [constant @GDScript.NAN] doesn't behave the same as other numbers. Therefore, the results from this method may not be accurate if NaNs are included.  
         */
        find(value: float64, from?: int64 /* = 0 */): int64
        
        /** Searches the array in reverse order. Optionally, a start search index can be passed. If negative, the start index is considered relative to the end of the array.  
         *      
         *  **Note:** [constant @GDScript.NAN] doesn't behave the same as other numbers. Therefore, the results from this method may not be accurate if NaNs are included.  
         */
        rfind(value: float64, from?: int64 /* = -1 */): int64
        
        /** Returns the number of times an element is in the array.  
         *      
         *  **Note:** [constant @GDScript.NAN] doesn't behave the same as other numbers. Therefore, the results from this method may not be accurate if NaNs are included.  
         */
        count(value: float64): int64
        
        /** Removes the first occurrence of a value from the array and returns `true`. If the value does not exist in the array, nothing happens and `false` is returned. To remove an element by index, use [method remove_at] instead.  
         *      
         *  **Note:** [constant @GDScript.NAN] doesn't behave the same as other numbers. Therefore, the results from this method may not be accurate if NaNs are included.  
         */
        erase(value: float64): boolean
        static EQUAL(left: PackedFloat64Array | float64[], right: PackedFloat64Array | float64[]): boolean
        static NOT_EQUAL(left: PackedFloat64Array | float64[], right: PackedFloat64Array | float64[]): boolean
    }
    /** A packed array of [String]s.  
     *  	  
     *  @link https://docs.godotengine.org/en/4.5/classes/class_packedstringarray.html  
     */
    class PackedStringArray {
        constructor()
        constructor(from: PackedStringArray | string[])
        constructor(from: GArray)
        
        /** Returns the [String] at the given [param index] in the array. Returns an empty string and prints an error if the access is out of bounds. Negative indices are not supported; they will always consider the value to be out of bounds and return an empty string.  
         *  This is similar to using the `[]` operator (`array[index]`), except that operator supports negative indices and causes a debugger break if out-of-bounds access is performed.  
         */
        get(index: int64): string
        
        /** Changes the [String] at the given index. */
        set(index: int64, value: string): void
        
        /** Returns the number of elements in the array. */
        size(): int64
        
        /** Returns `true` if the array is empty. */
        is_empty(): boolean
        
        /** Appends a string element at end of the array. */
        push_back(value: string): boolean
        
        /** Appends an element at the end of the array (alias of [method push_back]). */
        append(value: string): boolean
        
        /** Appends a [PackedStringArray] at the end of this array. */
        append_array(array: PackedStringArray | string[]): void
        
        /** Removes an element from the array by index. */
        remove_at(index: int64): void
        
        /** Inserts a new element at a given position in the array. The position must be valid, or at the end of the array (`idx == size()`). */
        insert(at_index: int64, value: string): int64
        
        /** Assigns the given value to all elements in the array. This can typically be used together with [method resize] to create an array with a given size and initialized elements. */
        fill(value: string): void
        
        /** Sets the size of the array. If the array is grown, reserves elements at the end of the array. If the array is shrunk, truncates the array to the new size. Calling [method resize] once and assigning the new values is faster than adding new elements one by one.  
         *  Returns [constant OK] on success, or one of the following [enum Error] constants if this method fails: [constant ERR_INVALID_PARAMETER] if the size is negative, or [constant ERR_OUT_OF_MEMORY] if allocations fail. Use [method size] to find the actual size of the array after resize.  
         */
        resize(new_size: int64): int64
        
        /** Clears the array. This is equivalent to using [method resize] with a size of `0`. */
        clear(): void
        
        /** Returns `true` if the array contains [param value]. */
        has(value: string): boolean
        
        /** Reverses the order of the elements in the array. */
        reverse(): void
        
        /** Returns the slice of the [PackedStringArray], from [param begin] (inclusive) to [param end] (exclusive), as a new [PackedStringArray].  
         *  The absolute value of [param begin] and [param end] will be clamped to the array size, so the default value for [param end] makes it slice to the size of the array by default (i.e. `arr.slice(1)` is a shorthand for `arr.slice(1, arr.size())`).  
         *  If either [param begin] or [param end] are negative, they will be relative to the end of the array (i.e. `arr.slice(0, -2)` is a shorthand for `arr.slice(0, arr.size() - 2)`).  
         */
        slice(begin: int64, end?: int64 /* = 2147483647 */): PackedStringArray
        
        /** Returns a [PackedByteArray] with each string encoded as UTF-8. Strings are `null` terminated. */
        to_byte_array(): PackedByteArray
        
        /** Sorts the elements of the array in ascending order. */
        sort(): void
        
        /** Finds the index of an existing value (or the insertion index that maintains sorting order, if the value is not yet present in the array) using binary search. Optionally, a [param before] specifier can be passed. If `false`, the returned index comes after all existing entries of the value in the array.  
         *      
         *  **Note:** Calling [method bsearch] on an unsorted array results in unexpected behavior.  
         */
        bsearch(value: string, before?: boolean /* = true */): int64
        
        /** Creates a copy of the array, and returns it. */
        duplicate(): PackedStringArray
        
        /** Searches the array for a value and returns its index or `-1` if not found. Optionally, the initial search index can be passed. */
        find(value: string, from?: int64 /* = 0 */): int64
        
        /** Searches the array in reverse order. Optionally, a start search index can be passed. If negative, the start index is considered relative to the end of the array. */
        rfind(value: string, from?: int64 /* = -1 */): int64
        
        /** Returns the number of times an element is in the array. */
        count(value: string): int64
        
        /** Removes the first occurrence of a value from the array and returns `true`. If the value does not exist in the array, nothing happens and `false` is returned. To remove an element by index, use [method remove_at] instead. */
        erase(value: string): boolean
        static EQUAL(left: PackedStringArray | string[], right: PackedStringArray | string[]): boolean
        static NOT_EQUAL(left: PackedStringArray | string[], right: PackedStringArray | string[]): boolean
    }
    /** A packed array of [Vector2]s.  
     *  	  
     *  @link https://docs.godotengine.org/en/4.5/classes/class_packedvector2array.html  
     */
    class PackedVector2Array {
        constructor()
        constructor(from: PackedVector2Array | Vector2[])
        constructor(from: GArray)
        
        /** Returns the [Vector2] at the given [param index] in the array. If [param index] out-of-bounds or negative, this method fails and returns `Vector2(0, 0)`.  
         *  This method is similar (but not identical) to the `[]` operator. Most notably, when this method fails, it doesn't pause project execution if run from the editor.  
         */
        get(index: int64): Vector2
        
        /** Changes the [Vector2] at the given index. */
        set(index: int64, value: Vector2): void
        
        /** Returns the number of elements in the array. */
        size(): int64
        
        /** Returns `true` if the array is empty. */
        is_empty(): boolean
        
        /** Inserts a [Vector2] at the end. */
        push_back(value: Vector2): boolean
        
        /** Appends an element at the end of the array (alias of [method push_back]). */
        append(value: Vector2): boolean
        
        /** Appends a [PackedVector2Array] at the end of this array. */
        append_array(array: PackedVector2Array | Vector2[]): void
        
        /** Removes an element from the array by index. */
        remove_at(index: int64): void
        
        /** Inserts a new element at a given position in the array. The position must be valid, or at the end of the array (`idx == size()`). */
        insert(at_index: int64, value: Vector2): int64
        
        /** Assigns the given value to all elements in the array. This can typically be used together with [method resize] to create an array with a given size and initialized elements. */
        fill(value: Vector2): void
        
        /** Sets the size of the array. If the array is grown, reserves elements at the end of the array. If the array is shrunk, truncates the array to the new size. Calling [method resize] once and assigning the new values is faster than adding new elements one by one.  
         *  Returns [constant OK] on success, or one of the following [enum Error] constants if this method fails: [constant ERR_INVALID_PARAMETER] if the size is negative, or [constant ERR_OUT_OF_MEMORY] if allocations fail. Use [method size] to find the actual size of the array after resize.  
         */
        resize(new_size: int64): int64
        
        /** Clears the array. This is equivalent to using [method resize] with a size of `0`. */
        clear(): void
        
        /** Returns `true` if the array contains [param value].  
         *      
         *  **Note:** Vectors with [constant @GDScript.NAN] elements don't behave the same as other vectors. Therefore, the results from this method may not be accurate if NaNs are included.  
         */
        has(value: Vector2): boolean
        
        /** Reverses the order of the elements in the array. */
        reverse(): void
        
        /** Returns the slice of the [PackedVector2Array], from [param begin] (inclusive) to [param end] (exclusive), as a new [PackedVector2Array].  
         *  The absolute value of [param begin] and [param end] will be clamped to the array size, so the default value for [param end] makes it slice to the size of the array by default (i.e. `arr.slice(1)` is a shorthand for `arr.slice(1, arr.size())`).  
         *  If either [param begin] or [param end] are negative, they will be relative to the end of the array (i.e. `arr.slice(0, -2)` is a shorthand for `arr.slice(0, arr.size() - 2)`).  
         */
        slice(begin: int64, end?: int64 /* = 2147483647 */): PackedVector2Array
        
        /** Returns a [PackedByteArray] with each vector encoded as bytes. */
        to_byte_array(): PackedByteArray
        
        /** Sorts the elements of the array in ascending order.  
         *      
         *  **Note:** Vectors with [constant @GDScript.NAN] elements don't behave the same as other vectors. Therefore, the results from this method may not be accurate if NaNs are included.  
         */
        sort(): void
        
        /** Finds the index of an existing value (or the insertion index that maintains sorting order, if the value is not yet present in the array) using binary search. Optionally, a [param before] specifier can be passed. If `false`, the returned index comes after all existing entries of the value in the array.  
         *      
         *  **Note:** Calling [method bsearch] on an unsorted array results in unexpected behavior.  
         *      
         *  **Note:** Vectors with [constant @GDScript.NAN] elements don't behave the same as other vectors. Therefore, the results from this method may not be accurate if NaNs are included.  
         */
        bsearch(value: Vector2, before?: boolean /* = true */): int64
        
        /** Creates a copy of the array, and returns it. */
        duplicate(): PackedVector2Array
        
        /** Searches the array for a value and returns its index or `-1` if not found. Optionally, the initial search index can be passed.  
         *      
         *  **Note:** Vectors with [constant @GDScript.NAN] elements don't behave the same as other vectors. Therefore, the results from this method may not be accurate if NaNs are included.  
         */
        find(value: Vector2, from?: int64 /* = 0 */): int64
        
        /** Searches the array in reverse order. Optionally, a start search index can be passed. If negative, the start index is considered relative to the end of the array.  
         *      
         *  **Note:** Vectors with [constant @GDScript.NAN] elements don't behave the same as other vectors. Therefore, the results from this method may not be accurate if NaNs are included.  
         */
        rfind(value: Vector2, from?: int64 /* = -1 */): int64
        
        /** Returns the number of times an element is in the array.  
         *      
         *  **Note:** Vectors with [constant @GDScript.NAN] elements don't behave the same as other vectors. Therefore, the results from this method may not be accurate if NaNs are included.  
         */
        count(value: Vector2): int64
        
        /** Removes the first occurrence of a value from the array and returns `true`. If the value does not exist in the array, nothing happens and `false` is returned. To remove an element by index, use [method remove_at] instead.  
         *      
         *  **Note:** Vectors with [constant @GDScript.NAN] elements don't behave the same as other vectors. Therefore, the results from this method may not be accurate if NaNs are included.  
         */
        erase(value: Vector2): boolean
        static EQUAL(left: PackedVector2Array | Vector2[], right: PackedVector2Array | Vector2[]): boolean
        static NOT_EQUAL(left: PackedVector2Array | Vector2[], right: PackedVector2Array | Vector2[]): boolean
    }
    /** A packed array of [Vector3]s.  
     *  	  
     *  @link https://docs.godotengine.org/en/4.5/classes/class_packedvector3array.html  
     */
    class PackedVector3Array {
        constructor()
        constructor(from: PackedVector3Array | Vector3[])
        constructor(from: GArray)
        
        /** Returns the [Vector3] at the given [param index] in the array. If [param index] out-of-bounds or negative, this method fails and returns `Vector3(0, 0, 0)`.  
         *  This method is similar (but not identical) to the `[]` operator. Most notably, when this method fails, it doesn't pause project execution if run from the editor.  
         */
        get(index: int64): Vector3
        
        /** Changes the [Vector3] at the given index. */
        set(index: int64, value: Vector3): void
        
        /** Returns the number of elements in the array. */
        size(): int64
        
        /** Returns `true` if the array is empty. */
        is_empty(): boolean
        
        /** Inserts a [Vector3] at the end. */
        push_back(value: Vector3): boolean
        
        /** Appends an element at the end of the array (alias of [method push_back]). */
        append(value: Vector3): boolean
        
        /** Appends a [PackedVector3Array] at the end of this array. */
        append_array(array: PackedVector3Array | Vector3[]): void
        
        /** Removes an element from the array by index. */
        remove_at(index: int64): void
        
        /** Inserts a new element at a given position in the array. The position must be valid, or at the end of the array (`idx == size()`). */
        insert(at_index: int64, value: Vector3): int64
        
        /** Assigns the given value to all elements in the array. This can typically be used together with [method resize] to create an array with a given size and initialized elements. */
        fill(value: Vector3): void
        
        /** Sets the size of the array. If the array is grown, reserves elements at the end of the array. If the array is shrunk, truncates the array to the new size. Calling [method resize] once and assigning the new values is faster than adding new elements one by one.  
         *  Returns [constant OK] on success, or one of the following [enum Error] constants if this method fails: [constant ERR_INVALID_PARAMETER] if the size is negative, or [constant ERR_OUT_OF_MEMORY] if allocations fail. Use [method size] to find the actual size of the array after resize.  
         */
        resize(new_size: int64): int64
        
        /** Clears the array. This is equivalent to using [method resize] with a size of `0`. */
        clear(): void
        
        /** Returns `true` if the array contains [param value].  
         *      
         *  **Note:** Vectors with [constant @GDScript.NAN] elements don't behave the same as other vectors. Therefore, the results from this method may not be accurate if NaNs are included.  
         */
        has(value: Vector3): boolean
        
        /** Reverses the order of the elements in the array. */
        reverse(): void
        
        /** Returns the slice of the [PackedVector3Array], from [param begin] (inclusive) to [param end] (exclusive), as a new [PackedVector3Array].  
         *  The absolute value of [param begin] and [param end] will be clamped to the array size, so the default value for [param end] makes it slice to the size of the array by default (i.e. `arr.slice(1)` is a shorthand for `arr.slice(1, arr.size())`).  
         *  If either [param begin] or [param end] are negative, they will be relative to the end of the array (i.e. `arr.slice(0, -2)` is a shorthand for `arr.slice(0, arr.size() - 2)`).  
         */
        slice(begin: int64, end?: int64 /* = 2147483647 */): PackedVector3Array
        
        /** Returns a [PackedByteArray] with each vector encoded as bytes. */
        to_byte_array(): PackedByteArray
        
        /** Sorts the elements of the array in ascending order.  
         *      
         *  **Note:** Vectors with [constant @GDScript.NAN] elements don't behave the same as other vectors. Therefore, the results from this method may not be accurate if NaNs are included.  
         */
        sort(): void
        
        /** Finds the index of an existing value (or the insertion index that maintains sorting order, if the value is not yet present in the array) using binary search. Optionally, a [param before] specifier can be passed. If `false`, the returned index comes after all existing entries of the value in the array.  
         *      
         *  **Note:** Calling [method bsearch] on an unsorted array results in unexpected behavior.  
         *      
         *  **Note:** Vectors with [constant @GDScript.NAN] elements don't behave the same as other vectors. Therefore, the results from this method may not be accurate if NaNs are included.  
         */
        bsearch(value: Vector3, before?: boolean /* = true */): int64
        
        /** Creates a copy of the array, and returns it. */
        duplicate(): PackedVector3Array
        
        /** Searches the array for a value and returns its index or `-1` if not found. Optionally, the initial search index can be passed.  
         *      
         *  **Note:** Vectors with [constant @GDScript.NAN] elements don't behave the same as other vectors. Therefore, the results from this method may not be accurate if NaNs are included.  
         */
        find(value: Vector3, from?: int64 /* = 0 */): int64
        
        /** Searches the array in reverse order. Optionally, a start search index can be passed. If negative, the start index is considered relative to the end of the array.  
         *      
         *  **Note:** Vectors with [constant @GDScript.NAN] elements don't behave the same as other vectors. Therefore, the results from this method may not be accurate if NaNs are included.  
         */
        rfind(value: Vector3, from?: int64 /* = -1 */): int64
        
        /** Returns the number of times an element is in the array.  
         *      
         *  **Note:** Vectors with [constant @GDScript.NAN] elements don't behave the same as other vectors. Therefore, the results from this method may not be accurate if NaNs are included.  
         */
        count(value: Vector3): int64
        
        /** Removes the first occurrence of a value from the array and returns `true`. If the value does not exist in the array, nothing happens and `false` is returned. To remove an element by index, use [method remove_at] instead.  
         *      
         *  **Note:** Vectors with [constant @GDScript.NAN] elements don't behave the same as other vectors. Therefore, the results from this method may not be accurate if NaNs are included.  
         */
        erase(value: Vector3): boolean
        static EQUAL(left: PackedVector3Array | Vector3[], right: PackedVector3Array | Vector3[]): boolean
        static NOT_EQUAL(left: PackedVector3Array | Vector3[], right: PackedVector3Array | Vector3[]): boolean
    }
    /** A packed array of [Vector4]s.  
     *  	  
     *  @link https://docs.godotengine.org/en/4.5/classes/class_packedvector4array.html  
     */
    class PackedVector4Array {
        constructor()
        constructor(from: PackedVector4Array)
        constructor(from: GArray)
        
        /** Returns the [Vector4] at the given [param index] in the array. If [param index] out-of-bounds or negative, this method fails and returns `Vector4(0, 0, 0, 0)`.  
         *  This method is similar (but not identical) to the `[]` operator. Most notably, when this method fails, it doesn't pause project execution if run from the editor.  
         */
        get(index: int64): Vector4
        
        /** Changes the [Vector4] at the given index. */
        set(index: int64, value: Vector4): void
        
        /** Returns the number of elements in the array. */
        size(): int64
        
        /** Returns `true` if the array is empty. */
        is_empty(): boolean
        
        /** Inserts a [Vector4] at the end. */
        push_back(value: Vector4): boolean
        
        /** Appends an element at the end of the array (alias of [method push_back]). */
        append(value: Vector4): boolean
        
        /** Appends a [PackedVector4Array] at the end of this array. */
        append_array(array: PackedVector4Array): void
        
        /** Removes an element from the array by index. */
        remove_at(index: int64): void
        
        /** Inserts a new element at a given position in the array. The position must be valid, or at the end of the array (`idx == size()`). */
        insert(at_index: int64, value: Vector4): int64
        
        /** Assigns the given value to all elements in the array. This can typically be used together with [method resize] to create an array with a given size and initialized elements. */
        fill(value: Vector4): void
        
        /** Sets the size of the array. If the array is grown, reserves elements at the end of the array. If the array is shrunk, truncates the array to the new size. Calling [method resize] once and assigning the new values is faster than adding new elements one by one.  
         *  Returns [constant OK] on success, or one of the following [enum Error] constants if this method fails: [constant ERR_INVALID_PARAMETER] if the size is negative, or [constant ERR_OUT_OF_MEMORY] if allocations fail. Use [method size] to find the actual size of the array after resize.  
         */
        resize(new_size: int64): int64
        
        /** Clears the array. This is equivalent to using [method resize] with a size of `0`. */
        clear(): void
        
        /** Returns `true` if the array contains [param value].  
         *      
         *  **Note:** Vectors with [constant @GDScript.NAN] elements don't behave the same as other vectors. Therefore, the results from this method may not be accurate if NaNs are included.  
         */
        has(value: Vector4): boolean
        
        /** Reverses the order of the elements in the array. */
        reverse(): void
        
        /** Returns the slice of the [PackedVector4Array], from [param begin] (inclusive) to [param end] (exclusive), as a new [PackedVector4Array].  
         *  The absolute value of [param begin] and [param end] will be clamped to the array size, so the default value for [param end] makes it slice to the size of the array by default (i.e. `arr.slice(1)` is a shorthand for `arr.slice(1, arr.size())`).  
         *  If either [param begin] or [param end] are negative, they will be relative to the end of the array (i.e. `arr.slice(0, -2)` is a shorthand for `arr.slice(0, arr.size() - 2)`).  
         */
        slice(begin: int64, end?: int64 /* = 2147483647 */): PackedVector4Array
        
        /** Returns a [PackedByteArray] with each vector encoded as bytes. */
        to_byte_array(): PackedByteArray
        
        /** Sorts the elements of the array in ascending order.  
         *      
         *  **Note:** Vectors with [constant @GDScript.NAN] elements don't behave the same as other vectors. Therefore, the results from this method may not be accurate if NaNs are included.  
         */
        sort(): void
        
        /** Finds the index of an existing value (or the insertion index that maintains sorting order, if the value is not yet present in the array) using binary search. Optionally, a [param before] specifier can be passed. If `false`, the returned index comes after all existing entries of the value in the array.  
         *      
         *  **Note:** Calling [method bsearch] on an unsorted array results in unexpected behavior.  
         *      
         *  **Note:** Vectors with [constant @GDScript.NAN] elements don't behave the same as other vectors. Therefore, the results from this method may not be accurate if NaNs are included.  
         */
        bsearch(value: Vector4, before?: boolean /* = true */): int64
        
        /** Creates a copy of the array, and returns it. */
        duplicate(): PackedVector4Array
        
        /** Searches the array for a value and returns its index or `-1` if not found. Optionally, the initial search index can be passed.  
         *      
         *  **Note:** Vectors with [constant @GDScript.NAN] elements don't behave the same as other vectors. Therefore, the results from this method may not be accurate if NaNs are included.  
         */
        find(value: Vector4, from?: int64 /* = 0 */): int64
        
        /** Searches the array in reverse order. Optionally, a start search index can be passed. If negative, the start index is considered relative to the end of the array.  
         *      
         *  **Note:** Vectors with [constant @GDScript.NAN] elements don't behave the same as other vectors. Therefore, the results from this method may not be accurate if NaNs are included.  
         */
        rfind(value: Vector4, from?: int64 /* = -1 */): int64
        
        /** Returns the number of times an element is in the array.  
         *      
         *  **Note:** Vectors with [constant @GDScript.NAN] elements don't behave the same as other vectors. Therefore, the results from this method may not be accurate if NaNs are included.  
         */
        count(value: Vector4): int64
        
        /** Removes the first occurrence of a value from the array and returns `true`. If the value does not exist in the array, nothing happens and `false` is returned. To remove an element by index, use [method remove_at] instead.  
         *      
         *  **Note:** Vectors with [constant @GDScript.NAN] elements don't behave the same as other vectors. Therefore, the results from this method may not be accurate if NaNs are included.  
         */
        erase(value: Vector4): boolean
        static EQUAL(left: PackedVector4Array, right: PackedVector4Array): boolean
        static NOT_EQUAL(left: PackedVector4Array, right: PackedVector4Array): boolean
    }
    /** A packed array of [Color]s.  
     *  	  
     *  @link https://docs.godotengine.org/en/4.5/classes/class_packedcolorarray.html  
     */
    class PackedColorArray {
        constructor()
        constructor(from: PackedColorArray | Color[])
        constructor(from: GArray)
        
        /** Returns the [Color] at the given [param index] in the array. If [param index] out-of-bounds or negative, this method fails and returns `Color(0, 0, 0, 1)`.  
         *  This method is similar (but not identical) to the `[]` operator. Most notably, when this method fails, it doesn't pause project execution if run from the editor.  
         */
        get(index: int64): Color
        
        /** Changes the [Color] at the given index. */
        set(index: int64, value: Color): void
        
        /** Returns the number of elements in the array. */
        size(): int64
        
        /** Returns `true` if the array is empty. */
        is_empty(): boolean
        
        /** Appends a value to the array. */
        push_back(value: Color): boolean
        
        /** Appends an element at the end of the array (alias of [method push_back]). */
        append(value: Color): boolean
        
        /** Appends a [PackedColorArray] at the end of this array. */
        append_array(array: PackedColorArray | Color[]): void
        
        /** Removes an element from the array by index. */
        remove_at(index: int64): void
        
        /** Inserts a new element at a given position in the array. The position must be valid, or at the end of the array (`idx == size()`). */
        insert(at_index: int64, value: Color): int64
        
        /** Assigns the given value to all elements in the array. This can typically be used together with [method resize] to create an array with a given size and initialized elements. */
        fill(value: Color): void
        
        /** Sets the size of the array. If the array is grown, reserves elements at the end of the array. If the array is shrunk, truncates the array to the new size. Calling [method resize] once and assigning the new values is faster than adding new elements one by one.  
         *  Returns [constant OK] on success, or one of the following [enum Error] constants if this method fails: [constant ERR_INVALID_PARAMETER] if the size is negative, or [constant ERR_OUT_OF_MEMORY] if allocations fail. Use [method size] to find the actual size of the array after resize.  
         */
        resize(new_size: int64): int64
        
        /** Clears the array. This is equivalent to using [method resize] with a size of `0`. */
        clear(): void
        
        /** Returns `true` if the array contains [param value]. */
        has(value: Color): boolean
        
        /** Reverses the order of the elements in the array. */
        reverse(): void
        
        /** Returns the slice of the [PackedColorArray], from [param begin] (inclusive) to [param end] (exclusive), as a new [PackedColorArray].  
         *  The absolute value of [param begin] and [param end] will be clamped to the array size, so the default value for [param end] makes it slice to the size of the array by default (i.e. `arr.slice(1)` is a shorthand for `arr.slice(1, arr.size())`).  
         *  If either [param begin] or [param end] are negative, they will be relative to the end of the array (i.e. `arr.slice(0, -2)` is a shorthand for `arr.slice(0, arr.size() - 2)`).  
         */
        slice(begin: int64, end?: int64 /* = 2147483647 */): PackedColorArray
        
        /** Returns a [PackedByteArray] with each color encoded as bytes. */
        to_byte_array(): PackedByteArray
        
        /** Sorts the elements of the array in ascending order. */
        sort(): void
        
        /** Finds the index of an existing value (or the insertion index that maintains sorting order, if the value is not yet present in the array) using binary search. Optionally, a [param before] specifier can be passed. If `false`, the returned index comes after all existing entries of the value in the array.  
         *      
         *  **Note:** Calling [method bsearch] on an unsorted array results in unexpected behavior.  
         */
        bsearch(value: Color, before?: boolean /* = true */): int64
        
        /** Creates a copy of the array, and returns it. */
        duplicate(): PackedColorArray
        
        /** Searches the array for a value and returns its index or `-1` if not found. Optionally, the initial search index can be passed. */
        find(value: Color, from?: int64 /* = 0 */): int64
        
        /** Searches the array in reverse order. Optionally, a start search index can be passed. If negative, the start index is considered relative to the end of the array. */
        rfind(value: Color, from?: int64 /* = -1 */): int64
        
        /** Returns the number of times an element is in the array. */
        count(value: Color): int64
        
        /** Removes the first occurrence of a value from the array and returns `true`. If the value does not exist in the array, nothing happens and `false` is returned. To remove an element by index, use [method remove_at] instead. */
        erase(value: Color): boolean
        static EQUAL(left: PackedColorArray | Color[], right: PackedColorArray | Color[]): boolean
        static NOT_EQUAL(left: PackedColorArray | Color[], right: PackedColorArray | Color[]): boolean
    }
    /** A built-in type for strings.  
     *  	  
     *  @link https://docs.godotengine.org/en/4.5/classes/class_string.html  
     */
    class String {
        /** Performs a case-sensitive comparison to another string. Returns `-1` if less than, `1` if greater than, or `0` if equal. "Less than" and "greater than" are determined by the [url=https://en.wikipedia.org/wiki/List_of_Unicode_characters]Unicode code points[/url] of each string, which roughly matches the alphabetical order.  
         *  If the character comparison reaches the end of one string, but the other string contains more characters, then it will use length as the deciding factor: `1` will be returned if this string is longer than the [param to] string, or `-1` if shorter. Note that the length of empty strings is always `0`.  
         *  To get a [bool] result from a string comparison, use the `==` operator instead. See also [method nocasecmp_to], [method filecasecmp_to], and [method naturalcasecmp_to].  
         */
        static casecmp_to(target: string, to: string): int64
        
        /** Performs a **case-insensitive** comparison to another string. Returns `-1` if less than, `1` if greater than, or `0` if equal. "Less than" or "greater than" are determined by the [url=https://en.wikipedia.org/wiki/List_of_Unicode_characters]Unicode code points[/url] of each string, which roughly matches the alphabetical order. Internally, lowercase characters are converted to uppercase for the comparison.  
         *  If the character comparison reaches the end of one string, but the other string contains more characters, then it will use length as the deciding factor: `1` will be returned if this string is longer than the [param to] string, or `-1` if shorter. Note that the length of empty strings is always `0`.  
         *  To get a [bool] result from a string comparison, use the `==` operator instead. See also [method casecmp_to], [method filenocasecmp_to], and [method naturalnocasecmp_to].  
         */
        static nocasecmp_to(target: string, to: string): int64
        
        /** Performs a **case-sensitive**,  *natural order*  comparison to another string. Returns `-1` if less than, `1` if greater than, or `0` if equal. "Less than" or "greater than" are determined by the [url=https://en.wikipedia.org/wiki/List_of_Unicode_characters]Unicode code points[/url] of each string, which roughly matches the alphabetical order.  
         *  When used for sorting, natural order comparison orders sequences of numbers by the combined value of each digit as is often expected, instead of the single digit's value. A sorted sequence of numbered strings will be `["1", "2", "3", ...]`, not `["1", "10", "2", "3", ...]`.  
         *  If the character comparison reaches the end of one string, but the other string contains more characters, then it will use length as the deciding factor: `1` will be returned if this string is longer than the [param to] string, or `-1` if shorter. Note that the length of empty strings is always `0`.  
         *  To get a [bool] result from a string comparison, use the `==` operator instead. See also [method naturalnocasecmp_to], [method filecasecmp_to], and [method nocasecmp_to].  
         */
        static naturalcasecmp_to(target: string, to: string): int64
        
        /** Performs a **case-insensitive**,  *natural order*  comparison to another string. Returns `-1` if less than, `1` if greater than, or `0` if equal. "Less than" or "greater than" are determined by the [url=https://en.wikipedia.org/wiki/List_of_Unicode_characters]Unicode code points[/url] of each string, which roughly matches the alphabetical order. Internally, lowercase characters are converted to uppercase for the comparison.  
         *  When used for sorting, natural order comparison orders sequences of numbers by the combined value of each digit as is often expected, instead of the single digit's value. A sorted sequence of numbered strings will be `["1", "2", "3", ...]`, not `["1", "10", "2", "3", ...]`.  
         *  If the character comparison reaches the end of one string, but the other string contains more characters, then it will use length as the deciding factor: `1` will be returned if this string is longer than the [param to] string, or `-1` if shorter. Note that the length of empty strings is always `0`.  
         *  To get a [bool] result from a string comparison, use the `==` operator instead. See also [method naturalcasecmp_to], [method filenocasecmp_to], and [method casecmp_to].  
         */
        static naturalnocasecmp_to(target: string, to: string): int64
        
        /** Like [method naturalcasecmp_to] but prioritizes strings that begin with periods (`.`) and underscores (`_`) before any other character. Useful when sorting folders or file names.  
         *  To get a [bool] result from a string comparison, use the `==` operator instead. See also [method filenocasecmp_to], [method naturalcasecmp_to], and [method casecmp_to].  
         */
        static filecasecmp_to(target: string, to: string): int64
        
        /** Like [method naturalnocasecmp_to] but prioritizes strings that begin with periods (`.`) and underscores (`_`) before any other character. Useful when sorting folders or file names.  
         *  To get a [bool] result from a string comparison, use the `==` operator instead. See also [method filecasecmp_to], [method naturalnocasecmp_to], and [method nocasecmp_to].  
         */
        static filenocasecmp_to(target: string, to: string): int64
        
        /** Returns the number of characters in the string. Empty strings (`""`) always return `0`. See also [method is_empty]. */
        static length(target: string): int64
        
        /** Returns part of the string from the position [param from] with length [param len]. If [param len] is `-1` (as by default), returns the rest of the string starting from the given position. */
        static substr(target: string, from: int64, len?: int64 /* = -1 */): string
        
        /** Splits the string using a [param delimiter] and returns the substring at index [param slice]. Returns the original string if [param delimiter] does not occur in the string. Returns an empty string if the [param slice] does not exist.  
         *  This is faster than [method split], if you only need one substring.  
         *    
         */
        static get_slice(target: string, delimiter: string, slice: int64): string
        
        /** Splits the string using a Unicode character with code [param delimiter] and returns the substring at index [param slice]. Returns an empty string if the [param slice] does not exist.  
         *  This is faster than [method split], if you only need one substring.  
         */
        static get_slicec(target: string, delimiter: int64, slice: int64): string
        
        /** Returns the total number of slices when the string is split with the given [param delimiter] (see [method split]). */
        static get_slice_count(target: string, delimiter: string): int64
        
        /** Returns the index of the **first** occurrence of [param what] in this string, or `-1` if there are none. The search's start can be specified with [param from], continuing to the end of the string.  
         *    
         *      
         *  **Note:** If you just want to know whether the string contains [param what], use [method contains]. In GDScript, you may also use the `in` operator.  
         */
        static find(target: string, what: string, from?: int64 /* = 0 */): int64
        
        /** Returns the index of the **first** **case-insensitive** occurrence of [param what] in this string, or `-1` if there are none. The starting search index can be specified with [param from], continuing to the end of the string. */
        static findn(target: string, what: string, from?: int64 /* = 0 */): int64
        
        /** Returns the number of occurrences of the substring [param what] between [param from] and [param to] positions. If [param to] is 0, the search continues until the end of the string. */
        static count(target: string, what: string, from?: int64 /* = 0 */, to?: int64 /* = 0 */): int64
        
        /** Returns the number of occurrences of the substring [param what] between [param from] and [param to] positions, **ignoring case**. If [param to] is 0, the search continues until the end of the string. */
        static countn(target: string, what: string, from?: int64 /* = 0 */, to?: int64 /* = 0 */): int64
        
        /** Returns the index of the **last** occurrence of [param what] in this string, or `-1` if there are none. The search's start can be specified with [param from], continuing to the beginning of the string. This method is the reverse of [method find]. */
        static rfind(target: string, what: string, from?: int64 /* = -1 */): int64
        
        /** Returns the index of the **last** **case-insensitive** occurrence of [param what] in this string, or `-1` if there are none. The starting search index can be specified with [param from], continuing to the beginning of the string. This method is the reverse of [method findn]. */
        static rfindn(target: string, what: string, from?: int64 /* = -1 */): int64
        
        /** Does a simple expression match (also called "glob" or "globbing"), where `*` matches zero or more arbitrary characters and `?` matches any single character except a period (`.`). An empty string or empty expression always evaluates to `false`. */
        static match(target: string, expr: string): boolean
        
        /** Does a simple **case-insensitive** expression match, where `*` matches zero or more arbitrary characters and `?` matches any single character except a period (`.`). An empty string or empty expression always evaluates to `false`. */
        static matchn(target: string, expr: string): boolean
        
        /** Returns `true` if the string begins with the given [param text]. See also [method ends_with]. */
        static begins_with(target: string, text: string): boolean
        
        /** Returns `true` if the string ends with the given [param text]. See also [method begins_with]. */
        static ends_with(target: string, text: string): boolean
        
        /** Returns `true` if all characters of this string can be found in [param text] in their original order. This is not the same as [method contains].  
         *    
         */
        static is_subsequence_of(target: string, text: string): boolean
        
        /** Returns `true` if all characters of this string can be found in [param text] in their original order, **ignoring case**. This is not the same as [method containsn]. */
        static is_subsequence_ofn(target: string, text: string): boolean
        
        /** Returns an array containing the bigrams (pairs of consecutive characters) of this string.  
         *    
         */
        static bigrams(target: string): PackedStringArray
        
        /** Returns the similarity index ([url=https://en.wikipedia.org/wiki/S%C3%B8rensen%E2%80%93Dice_coefficient]Sørensen-Dice coefficient[/url]) of this string compared to another. A result of `1.0` means totally similar, while `0.0` means totally dissimilar.  
         *    
         */
        static similarity(target: string, text: string): float64
        
        /** Formats the string by replacing all occurrences of [param placeholder] with the elements of [param values].  
         *  [param values] can be a [Dictionary], an [Array], or an [Object]. Any underscores in [param placeholder] will be replaced with the corresponding keys in advance. Array elements use their index as keys.  
         *    
         *  Some additional handling is performed when [param values] is an [Array]. If [param placeholder] does not contain an underscore, the elements of the [param values] array will be used to replace one occurrence of the placeholder in order; If an element of [param values] is another 2-element array, it'll be interpreted as a key-value pair.  
         *    
         *  When passing an [Object], the property names from [method Object.get_property_list] are used as keys.  
         *    
         *  See also the [url=https://docs.godotengine.org/en/4.5/tutorials/scripting/gdscript/gdscript_format_string.html]GDScript format string[/url] tutorial.  
         *      
         *  **Note:** Each replacement is done sequentially for each element of [param values], **not** all at once. This means that if any element is inserted and it contains another placeholder, it may be changed by the next replacement. While this can be very useful, it often causes unexpected results. If not necessary, make sure [param values]'s elements do not contain placeholders.  
         *    
         *      
         *  **Note:** In C#, it's recommended to [url=https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/tokens/interpolated]interpolate strings with "$"[/url], instead.  
         */
        static format(target: string, values: any, placeholder?: string /* = '{_}' */): string
        
        /** Replaces all occurrences of [param what] inside the string with the given [param forwhat]. */
        static replace(target: string, what: string, forwhat: string): string
        
        /** Replaces all **case-insensitive** occurrences of [param what] inside the string with the given [param forwhat]. */
        static replacen(target: string, what: string, forwhat: string): string
        
        /** Replaces all occurrences of the Unicode character with code [param key] with the Unicode character with code [param with]. Faster version of [method replace] when the key is only one character long. To get a single character use `"X".unicode_at(0)` (note that some strings, like compound letters and emoji, can be composed of multiple unicode codepoints, and will not work with this method, use [method length] to make sure). */
        static replace_char(target: string, key: int64, with_: int64): string
        
        /** Replaces any occurrence of the characters in [param keys] with the Unicode character with code [param with]. See also [method replace_char]. */
        static replace_chars(target: string, keys: string, with_: int64): string
        
        /** Removes all occurrences of the Unicode character with code [param what]. Faster version of [method replace] when the key is only one character long and the replacement is `""`. */
        static remove_char(target: string, what: int64): string
        
        /** Removes any occurrence of the characters in [param chars]. See also [method remove_char]. */
        static remove_chars(target: string, chars: string): string
        
        /** Repeats this string a number of times. [param count] needs to be greater than `0`. Otherwise, returns an empty string. */
        static repeat(target: string, count: int64): string
        
        /** Returns the copy of this string in reverse order. This operation works on unicode codepoints, rather than sequences of codepoints, and may break things like compound letters or emojis. */
        static reverse(target: string): string
        
        /** Inserts [param what] at the given [param position] in the string. */
        static insert(target: string, position: int64, what: string): string
        
        /** Returns a string with [param chars] characters erased starting from [param position]. If [param chars] goes beyond the string's length given the specified [param position], fewer characters will be erased from the returned string. Returns an empty string if either [param position] or [param chars] is negative. Returns the original string unmodified if [param chars] is `0`. */
        static erase(target: string, position: int64, chars?: int64 /* = 1 */): string
        
        /** Changes the appearance of the string: replaces underscores (`_`) with spaces, adds spaces before uppercase letters in the middle of a word, converts all letters to lowercase, then converts the first one and each one following a space to uppercase.  
         *    
         */
        static capitalize(target: string): string
        
        /** Returns the string converted to `camelCase`. */
        static to_camel_case(target: string): string
        
        /** Returns the string converted to `PascalCase`. */
        static to_pascal_case(target: string): string
        
        /** Returns the string converted to `snake_case`.  
         *      
         *  **Note:** Numbers followed by a  *single*  letter are not separated in the conversion to keep some words (such as "2D") together.  
         *    
         */
        static to_snake_case(target: string): string
        
        /** Returns the string converted to `kebab-case`.  
         *      
         *  **Note:** Numbers followed by a  *single*  letter are not separated in the conversion to keep some words (such as "2D") together.  
         *    
         */
        static to_kebab_case(target: string): string
        
        /** Splits the string using a [param delimiter] and returns an array of the substrings. If [param delimiter] is an empty string, each substring will be a single character. This method is the opposite of [method join].  
         *  If [param allow_empty] is `false`, empty strings between adjacent delimiters are excluded from the array.  
         *  If [param maxsplit] is greater than `0`, the number of splits may not exceed [param maxsplit]. By default, the entire string is split.  
         *    
         *      
         *  **Note:** If you only need one substring from the array, consider using [method get_slice] which is faster. If you need to split strings with more complex rules, use the [RegEx] class instead.  
         */
        static split(target: string, delimiter?: string /* = '' */, allow_empty?: boolean /* = true */, maxsplit?: int64 /* = 0 */): PackedStringArray
        
        /** Splits the string using a [param delimiter] and returns an array of the substrings, starting from the end of the string. The splits in the returned array appear in the same order as the original string. If [param delimiter] is an empty string, each substring will be a single character.  
         *  If [param allow_empty] is `false`, empty strings between adjacent delimiters are excluded from the array.  
         *  If [param maxsplit] is greater than `0`, the number of splits may not exceed [param maxsplit]. By default, the entire string is split, which is mostly identical to [method split].  
         *    
         */
        static rsplit(target: string, delimiter?: string /* = '' */, allow_empty?: boolean /* = true */, maxsplit?: int64 /* = 0 */): PackedStringArray
        
        /** Splits the string into floats by using a [param delimiter] and returns a [PackedFloat64Array].  
         *  If [param allow_empty] is `false`, empty or invalid [float] conversions between adjacent delimiters are excluded.  
         *    
         */
        static split_floats(target: string, delimiter: string, allow_empty?: boolean /* = true */): PackedFloat64Array
        
        /** Returns the concatenation of [param parts]' elements, with each element separated by the string calling this method. This method is the opposite of [method split].  
         *    
         */
        static join(target: string, parts: PackedStringArray | string[]): string
        
        /** Returns the string converted to `UPPERCASE`. */
        static to_upper(target: string): string
        
        /** Returns the string converted to `lowercase`. */
        static to_lower(target: string): string
        
        /** Returns the first [param length] characters from the beginning of the string. If [param length] is negative, strips the last [param length] characters from the string's end.  
         *    
         */
        static left(target: string, length: int64): string
        
        /** Returns the last [param length] characters from the end of the string. If [param length] is negative, strips the first [param length] characters from the string's beginning.  
         *    
         */
        static right(target: string, length: int64): string
        
        /** Strips all non-printable characters from the beginning and the end of the string. These include spaces, tabulations (`\t`), and newlines (`\n` `\r`).  
         *  If [param left] is `false`, ignores the string's beginning. Likewise, if [param right] is `false`, ignores the string's end.  
         */
        static strip_edges(target: string, left?: boolean /* = true */, right?: boolean /* = true */): string
        
        /** Strips all escape characters from the string. These include all non-printable control characters of the first page of the ASCII table (values from 0 to 31), such as tabulation (`\t`) and newline (`\n`, `\r`) characters, but  *not*  spaces. */
        static strip_escapes(target: string): string
        
        /** Removes a set of characters defined in [param chars] from the string's beginning. See also [method rstrip].  
         *      
         *  **Note:** [param chars] is not a prefix. Use [method trim_prefix] to remove a single prefix, rather than a set of characters.  
         */
        static lstrip(target: string, chars: string): string
        
        /** Removes a set of characters defined in [param chars] from the string's end. See also [method lstrip].  
         *      
         *  **Note:** [param chars] is not a suffix. Use [method trim_suffix] to remove a single suffix, rather than a set of characters.  
         */
        static rstrip(target: string, chars: string): string
        
        /** If the string is a valid file name or path, returns the file extension without the leading period (`.`). Otherwise, returns an empty string.  
         *    
         */
        static get_extension(target: string): string
        
        /** If the string is a valid file path, returns the full file path, without the extension.  
         *    
         */
        static get_basename(target: string): string
        
        /** Concatenates [param path] at the end of the string as a subpath, adding `/` if necessary.  
         *  **Example:** `"this/is".path_join("path") == "this/is/path"`.  
         */
        static path_join(target: string, path: string): string
        
        /** Returns the character code at position [param at].  
         *  See also [method chr], [method @GDScript.char], and [method @GDScript.ord].  
         */
        static unicode_at(target: string, at: int64): int64
        
        /** Indents every line of the string with the given [param prefix]. Empty lines are not indented. See also [method dedent] to remove indentation.  
         *  For example, the string can be indented with two tabulations using `"\t\t"`, or four spaces using `"    "`.  
         */
        static indent(target: string, prefix: string): string
        
        /** Returns a copy of the string with indentation (leading tabs and spaces) removed. See also [method indent] to add indentation. */
        static dedent(target: string): string
        
        /** Returns the 32-bit hash value representing the string's contents.  
         *      
         *  **Note:** Strings with equal hash values are  *not*  guaranteed to be the same, as a result of hash collisions. On the contrary, strings with different hash values are guaranteed to be different.  
         */
        static hash(target: string): int64
        
        /** Returns the [url=https://en.wikipedia.org/wiki/MD5]MD5 hash[/url] of the string as another [String]. */
        static md5_text(target: string): string
        
        /** Returns the [url=https://en.wikipedia.org/wiki/SHA-1]SHA-1[/url] hash of the string as another [String]. */
        static sha1_text(target: string): string
        
        /** Returns the [url=https://en.wikipedia.org/wiki/SHA-2]SHA-256[/url] hash of the string as another [String]. */
        static sha256_text(target: string): string
        
        /** Returns the [url=https://en.wikipedia.org/wiki/MD5]MD5 hash[/url] of the string as a [PackedByteArray]. */
        static md5_buffer(target: string): PackedByteArray
        
        /** Returns the [url=https://en.wikipedia.org/wiki/SHA-1]SHA-1[/url] hash of the string as a [PackedByteArray]. */
        static sha1_buffer(target: string): PackedByteArray
        
        /** Returns the [url=https://en.wikipedia.org/wiki/SHA-2]SHA-256[/url] hash of the string as a [PackedByteArray]. */
        static sha256_buffer(target: string): PackedByteArray
        
        /** Returns `true` if the string's length is `0` (`""`). See also [method length]. */
        static is_empty(target: string): boolean
        
        /** Returns `true` if the string contains [param what]. In GDScript, this corresponds to the `in` operator.  
         *    
         *  If you need to know where [param what] is within the string, use [method find]. See also [method containsn].  
         */
        static contains(target: string, what: string): boolean
        
        /** Returns `true` if the string contains [param what], **ignoring case**.  
         *  If you need to know where [param what] is within the string, use [method findn]. See also [method contains].  
         */
        static containsn(target: string, what: string): boolean
        
        /** Returns `true` if the string is a path to a file or directory, and its starting point is explicitly defined. This method is the opposite of [method is_relative_path].  
         *  This includes all paths starting with `"res://"`, `"user://"`, `"C:\"`, `"/"`, etc.  
         */
        static is_absolute_path(target: string): boolean
        
        /** Returns `true` if the string is a path, and its starting point is dependent on context. The path could begin from the current directory, or the current [Node] (if the string is derived from a [NodePath]), and may sometimes be prefixed with `"./"`. This method is the opposite of [method is_absolute_path]. */
        static is_relative_path(target: string): boolean
        
        /** If the string is a valid file path, converts the string into a canonical path. This is the shortest possible path, without `"./"`, and all the unnecessary `".."` and `"/"`.  
         *    
         */
        static simplify_path(target: string): string
        
        /** If the string is a valid file path, returns the base directory name.  
         *    
         */
        static get_base_dir(target: string): string
        
        /** If the string is a valid file path, returns the file name, including the extension.  
         *    
         */
        static get_file(target: string): string
        
        /** Returns a copy of the string with special characters escaped using the XML standard. If [param escape_quotes] is `true`, the single quote (`'`) and double quote (`"`) characters are also escaped. */
        static xml_escape(target: string, escape_quotes?: boolean /* = false */): string
        
        /** Returns a copy of the string with escaped characters replaced by their meanings according to the XML standard. */
        static xml_unescape(target: string): string
        
        /** Encodes the string to URL-friendly format. This method is meant to properly encode the parameters in a URL when sending an HTTP request. See also [method uri_decode].  
         *    
         */
        static uri_encode(target: string): string
        
        /** Decodes the string from its URL-encoded format. This method is meant to properly decode the parameters in a URL when receiving an HTTP request. See also [method uri_encode].  
         *    
         *      
         *  **Note:** This method decodes `+` as space.  
         */
        static uri_decode(target: string): string
        
        /** Decodes the file path from its URL-encoded format. Unlike [method uri_decode] this method leaves `+` as is. */
        static uri_file_decode(target: string): string
        
        /** Returns a copy of the string with special characters escaped using the C language standard. */
        static c_escape(target: string): string
        
        /** Returns a copy of the string with escaped characters replaced by their meanings. Supported escape sequences are `\'`, `\"`, `\\`, `\a`, `\b`, `\f`, `\n`, `\r`, `\t`, `\v`.  
         *      
         *  **Note:** Unlike the GDScript parser, this method doesn't support the `\uXXXX` escape sequence.  
         */
        static c_unescape(target: string): string
        
        /** Returns a copy of the string with special characters escaped using the JSON standard. Because it closely matches the C standard, it is possible to use [method c_unescape] to unescape the string, if necessary. */
        static json_escape(target: string): string
        
        /** Returns a copy of the string with all characters that are not allowed in [member Node.name] (`.` `:` `@` `/` `"` `%`) replaced with underscores. */
        static validate_node_name(target: string): string
        
        /** Returns a copy of the string with all characters that are not allowed in [method is_valid_filename] replaced with underscores. */
        static validate_filename(target: string): string
        
        /** Returns `true` if this string is a valid ASCII identifier. A valid ASCII identifier may contain only letters, digits, and underscores (`_`), and the first character may not be a digit.  
         *    
         *  See also [method is_valid_unicode_identifier].  
         */
        static is_valid_ascii_identifier(target: string): boolean
        
        /** Returns `true` if this string is a valid Unicode identifier.  
         *  A valid Unicode identifier must begin with a Unicode character of class `XID_Start` or `"_"`, and may contain Unicode characters of class `XID_Continue` in the other positions.  
         *    
         *  See also [method is_valid_ascii_identifier].  
         *      
         *  **Note:** This method checks identifiers the same way as GDScript. See [method TextServer.is_valid_identifier] for more advanced checks.  
         */
        static is_valid_unicode_identifier(target: string): boolean
        
        /** Returns `true` if this string is a valid identifier. A valid identifier may contain only letters, digits and underscores (`_`), and the first character may not be a digit.  
         *    
         */
        static is_valid_identifier(target: string): boolean
        
        /** Returns `true` if this string represents a valid integer. A valid integer only contains digits, and may be prefixed with a positive (`+`) or negative (`-`) sign. See also [method to_int].  
         *    
         */
        static is_valid_int(target: string): boolean
        
        /** Returns `true` if this string represents a valid floating-point number. A valid float may contain only digits, one decimal point (`.`), and the exponent letter (`e`). It may also be prefixed with a positive (`+`) or negative (`-`) sign. Any valid integer is also a valid float (see [method is_valid_int]). See also [method to_float].  
         *    
         */
        static is_valid_float(target: string): boolean
        
        /** Returns `true` if this string is a valid hexadecimal number. A valid hexadecimal number only contains digits or letters `A` to `F` (either uppercase or lowercase), and may be prefixed with a positive (`+`) or negative (`-`) sign.  
         *  If [param with_prefix] is `true`, the hexadecimal number needs to prefixed by `"0x"` to be considered valid.  
         *    
         */
        static is_valid_hex_number(target: string, with_prefix?: boolean /* = false */): boolean
        
        /** Returns `true` if this string is a valid color in hexadecimal HTML notation. The string must be a hexadecimal value (see [method is_valid_hex_number]) of either 3, 4, 6 or 8 digits, and may be prefixed by a hash sign (`#`). Other HTML notations for colors, such as names or `hsl()`, are not considered valid. See also [method Color.html]. */
        static is_valid_html_color(target: string): boolean
        
        /** Returns `true` if this string represents a well-formatted IPv4 or IPv6 address. This method considers [url=https://en.wikipedia.org/wiki/Reserved_IP_addresses]reserved IP addresses[/url] such as `"0.0.0.0"` and `"ffff:ffff:ffff:ffff:ffff:ffff:ffff:ffff"` as valid. */
        static is_valid_ip_address(target: string): boolean
        
        /** Returns `true` if this string is a valid file name. A valid file name cannot be empty, begin or end with space characters, or contain characters that are not allowed (`:` `/` `\` `?` `*` `"` `|` `%` `<` `>`). */
        static is_valid_filename(target: string): boolean
        
        /** Converts the string representing an integer number into an [int]. This method removes any non-number character and stops at the first decimal point (`.`). See also [method is_valid_int].  
         *    
         */
        static to_int(target: string): int64
        
        /** Converts the string representing a decimal number into a [float]. This method stops on the first non-number character, except the first decimal point (`.`) and the exponent letter (`e`). See also [method is_valid_float].  
         *    
         */
        static to_float(target: string): float64
        
        /** Converts the string representing a hexadecimal number into an [int]. The string may be optionally prefixed with `"0x"`, and an additional `-` prefix for negative numbers.  
         *    
         */
        static hex_to_int(target: string): int64
        
        /** Converts the string representing a binary number into an [int]. The string may optionally be prefixed with `"0b"`, and an additional `-` prefix for negative numbers.  
         *    
         */
        static bin_to_int(target: string): int64
        
        /** Formats the string to be at least [param min_length] long by adding [param character]s to the left of the string, if necessary. See also [method rpad]. */
        static lpad(target: string, min_length: int64, character?: string /* = ' ' */): string
        
        /** Formats the string to be at least [param min_length] long, by adding [param character]s to the right of the string, if necessary. See also [method lpad]. */
        static rpad(target: string, min_length: int64, character?: string /* = ' ' */): string
        
        /** Formats the string representing a number to have an exact number of [param digits]  *after*  the decimal point. */
        static pad_decimals(target: string, digits: int64): string
        
        /** Formats the string representing a number to have an exact number of [param digits]  *before*  the decimal point. */
        static pad_zeros(target: string, digits: int64): string
        
        /** Removes the given [param prefix] from the start of the string, or returns the string unchanged. */
        static trim_prefix(target: string, prefix: string): string
        
        /** Removes the given [param suffix] from the end of the string, or returns the string unchanged. */
        static trim_suffix(target: string, suffix: string): string
        
        /** Converts the string to an [url=https://en.wikipedia.org/wiki/ASCII]ASCII[/url]/Latin-1 encoded [PackedByteArray]. This method is slightly faster than [method to_utf8_buffer], but replaces all unsupported characters with spaces. This is the inverse of [method PackedByteArray.get_string_from_ascii]. */
        static to_ascii_buffer(target: string): PackedByteArray
        
        /** Converts the string to a [url=https://en.wikipedia.org/wiki/UTF-8]UTF-8[/url] encoded [PackedByteArray]. This method is slightly slower than [method to_ascii_buffer], but supports all UTF-8 characters. For most cases, prefer using this method. This is the inverse of [method PackedByteArray.get_string_from_utf8]. */
        static to_utf8_buffer(target: string): PackedByteArray
        
        /** Converts the string to a [url=https://en.wikipedia.org/wiki/UTF-16]UTF-16[/url] encoded [PackedByteArray]. This is the inverse of [method PackedByteArray.get_string_from_utf16]. */
        static to_utf16_buffer(target: string): PackedByteArray
        
        /** Converts the string to a [url=https://en.wikipedia.org/wiki/UTF-32]UTF-32[/url] encoded [PackedByteArray]. This is the inverse of [method PackedByteArray.get_string_from_utf32]. */
        static to_utf32_buffer(target: string): PackedByteArray
        
        /** Converts the string to a [url=https://en.wikipedia.org/wiki/Wide_character]wide character[/url] (`wchar_t`, UTF-16 on Windows, UTF-32 on other platforms) encoded [PackedByteArray]. This is the inverse of [method PackedByteArray.get_string_from_wchar]. */
        static to_wchar_buffer(target: string): PackedByteArray
        
        /** Converts the string to system multibyte code page encoded [PackedByteArray]. If conversion fails, empty array is returned.  
         *  The values permitted for [param encoding] are system dependent. If [param encoding] is empty string, system default encoding is used.  
         *  - For Windows, see [url=https://learn.microsoft.com/en-us/windows/win32/Intl/code-page-identifiers]Code Page Identifiers[/url] .NET names.  
         *  - For macOS and Linux/BSD, see `libiconv` library documentation and `iconv --list` for a list of supported encodings.  
         */
        static to_multibyte_char_buffer(target: string, encoding?: string /* = '' */): PackedByteArray
        
        /** Decodes a hexadecimal string as a [PackedByteArray].  
         *    
         */
        static hex_decode(target: string): PackedByteArray
        
        /** Converts the given [param number] to a string representation, in scientific notation.  
         *    
         *      
         *  **Note:** In C#, this method is not implemented. To achieve similar results, see C#'s [url=https://learn.microsoft.com/en-us/dotnet/standard/base-types/standard-numeric-format-strings]Standard numeric format strings[/url].  
         */
        static num_scientific(number: float64): string
        
        /** Converts a [float] to a string representation of a decimal number, with the number of decimal places specified in [param decimals].  
         *  If [param decimals] is `-1` as by default, the string representation may only have up to 14 significant digits, with digits before the decimal point having priority over digits after.  
         *  Trailing zeros are not included in the string. The last digit is rounded, not truncated.  
         *    
         */
        static num(number: float64, decimals?: int64 /* = -1 */): string
        
        /** Converts the given [param number] to a string representation, with the given [param base].  
         *  By default, [param base] is set to decimal (`10`). Other common bases in programming include binary (`2`), [url=https://en.wikipedia.org/wiki/Octal]octal[/url] (`8`), hexadecimal (`16`).  
         *  If [param capitalize_hex] is `true`, digits higher than 9 are represented in uppercase.  
         */
        static num_int64(number: int64, base?: int64 /* = 10 */, capitalize_hex?: boolean /* = false */): string
        
        /** Converts the given unsigned [int] to a string representation, with the given [param base].  
         *  By default, [param base] is set to decimal (`10`). Other common bases in programming include binary (`2`), [url=https://en.wikipedia.org/wiki/Octal]octal[/url] (`8`), hexadecimal (`16`).  
         *  If [param capitalize_hex] is `true`, digits higher than 9 are represented in uppercase.  
         */
        static num_uint64(number: int64, base?: int64 /* = 10 */, capitalize_hex?: boolean /* = false */): string
        
        /** Returns a single Unicode character from the integer [param code]. You may use [url=https://unicodelookup.com/]unicodelookup.com[/url] or [url=https://www.unicode.org/charts/]unicode.org[/url] as points of reference.  
         *    
         *  See also [method unicode_at], [method @GDScript.char], and [method @GDScript.ord].  
         */
        static chr(code: int64): string
        
        /** Converts [param size] which represents a number of bytes into a human-readable form.  
         *  The result is in [url=https://en.wikipedia.org/wiki/Binary_prefix#IEC_prefixes]IEC prefix format[/url], which may end in either `"B"`, `"KiB"`, `"MiB"`, `"GiB"`, `"TiB"`, `"PiB"`, or `"EiB"`.  
         */
        static humanize_size(size: int64): string
    }
    enum Side {
        /** Left side, usually used for [Control] or [StyleBox]-derived classes. */
        SIDE_LEFT = 0,
        
        /** Top side, usually used for [Control] or [StyleBox]-derived classes. */
        SIDE_TOP = 1,
        
        /** Right side, usually used for [Control] or [StyleBox]-derived classes. */
        SIDE_RIGHT = 2,
        
        /** Bottom side, usually used for [Control] or [StyleBox]-derived classes. */
        SIDE_BOTTOM = 3,
    }
    enum Corner {
        /** Top-left corner. */
        CORNER_TOP_LEFT = 0,
        
        /** Top-right corner. */
        CORNER_TOP_RIGHT = 1,
        
        /** Bottom-right corner. */
        CORNER_BOTTOM_RIGHT = 2,
        
        /** Bottom-left corner. */
        CORNER_BOTTOM_LEFT = 3,
    }
    enum Orientation {
        /** General vertical alignment, usually used for [Separator], [ScrollBar], [Slider], etc. */
        VERTICAL = 1,
        
        /** General horizontal alignment, usually used for [Separator], [ScrollBar], [Slider], etc. */
        HORIZONTAL = 0,
    }
    enum ClockDirection {
        /** Clockwise rotation. Used by some methods (e.g. [method Image.rotate_90]). */
        CLOCKWISE = 0,
        
        /** Counter-clockwise rotation. Used by some methods (e.g. [method Image.rotate_90]). */
        COUNTERCLOCKWISE = 1,
    }
    enum HorizontalAlignment {
        /** Horizontal left alignment, usually for text-derived classes. */
        HORIZONTAL_ALIGNMENT_LEFT = 0,
        
        /** Horizontal center alignment, usually for text-derived classes. */
        HORIZONTAL_ALIGNMENT_CENTER = 1,
        
        /** Horizontal right alignment, usually for text-derived classes. */
        HORIZONTAL_ALIGNMENT_RIGHT = 2,
        
        /** Expand row to fit width, usually for text-derived classes. */
        HORIZONTAL_ALIGNMENT_FILL = 3,
    }
    enum VerticalAlignment {
        /** Vertical top alignment, usually for text-derived classes. */
        VERTICAL_ALIGNMENT_TOP = 0,
        
        /** Vertical center alignment, usually for text-derived classes. */
        VERTICAL_ALIGNMENT_CENTER = 1,
        
        /** Vertical bottom alignment, usually for text-derived classes. */
        VERTICAL_ALIGNMENT_BOTTOM = 2,
        
        /** Expand rows to fit height, usually for text-derived classes. */
        VERTICAL_ALIGNMENT_FILL = 3,
    }
    enum InlineAlignment {
        /** Aligns the top of the inline object (e.g. image, table) to the position of the text specified by `INLINE_ALIGNMENT_TO_*` constant. */
        INLINE_ALIGNMENT_TOP_TO = 0,
        
        /** Aligns the center of the inline object (e.g. image, table) to the position of the text specified by `INLINE_ALIGNMENT_TO_*` constant. */
        INLINE_ALIGNMENT_CENTER_TO = 1,
        
        /** Aligns the baseline (user defined) of the inline object (e.g. image, table) to the position of the text specified by `INLINE_ALIGNMENT_TO_*` constant. */
        INLINE_ALIGNMENT_BASELINE_TO = 3,
        
        /** Aligns the bottom of the inline object (e.g. image, table) to the position of the text specified by `INLINE_ALIGNMENT_TO_*` constant. */
        INLINE_ALIGNMENT_BOTTOM_TO = 2,
        
        /** Aligns the position of the inline object (e.g. image, table) specified by `INLINE_ALIGNMENT_*_TO` constant to the top of the text. */
        INLINE_ALIGNMENT_TO_TOP = 0,
        
        /** Aligns the position of the inline object (e.g. image, table) specified by `INLINE_ALIGNMENT_*_TO` constant to the center of the text. */
        INLINE_ALIGNMENT_TO_CENTER = 4,
        
        /** Aligns the position of the inline object (e.g. image, table) specified by `INLINE_ALIGNMENT_*_TO` constant to the baseline of the text. */
        INLINE_ALIGNMENT_TO_BASELINE = 8,
        
        /** Aligns inline object (e.g. image, table) to the bottom of the text. */
        INLINE_ALIGNMENT_TO_BOTTOM = 12,
        
        /** Aligns top of the inline object (e.g. image, table) to the top of the text. Equivalent to `INLINE_ALIGNMENT_TOP_TO | INLINE_ALIGNMENT_TO_TOP`. */
        INLINE_ALIGNMENT_TOP = 0,
        
        /** Aligns center of the inline object (e.g. image, table) to the center of the text. Equivalent to `INLINE_ALIGNMENT_CENTER_TO | INLINE_ALIGNMENT_TO_CENTER`. */
        INLINE_ALIGNMENT_CENTER = 5,
        
        /** Aligns bottom of the inline object (e.g. image, table) to the bottom of the text. Equivalent to `INLINE_ALIGNMENT_BOTTOM_TO | INLINE_ALIGNMENT_TO_BOTTOM`. */
        INLINE_ALIGNMENT_BOTTOM = 14,
        
        /** A bit mask for `INLINE_ALIGNMENT_*_TO` alignment constants. */
        INLINE_ALIGNMENT_IMAGE_MASK = 3,
        
        /** A bit mask for `INLINE_ALIGNMENT_TO_*` alignment constants. */
        INLINE_ALIGNMENT_TEXT_MASK = 12,
    }
    enum EulerOrder {
        /** Specifies that Euler angles should be in XYZ order. When composing, the order is X, Y, Z. When decomposing, the order is reversed, first Z, then Y, and X last. */
        EULER_ORDER_XYZ = 0,
        
        /** Specifies that Euler angles should be in XZY order. When composing, the order is X, Z, Y. When decomposing, the order is reversed, first Y, then Z, and X last. */
        EULER_ORDER_XZY = 1,
        
        /** Specifies that Euler angles should be in YXZ order. When composing, the order is Y, X, Z. When decomposing, the order is reversed, first Z, then X, and Y last. */
        EULER_ORDER_YXZ = 2,
        
        /** Specifies that Euler angles should be in YZX order. When composing, the order is Y, Z, X. When decomposing, the order is reversed, first X, then Z, and Y last. */
        EULER_ORDER_YZX = 3,
        
        /** Specifies that Euler angles should be in ZXY order. When composing, the order is Z, X, Y. When decomposing, the order is reversed, first Y, then X, and Z last. */
        EULER_ORDER_ZXY = 4,
        
        /** Specifies that Euler angles should be in ZYX order. When composing, the order is Z, Y, X. When decomposing, the order is reversed, first X, then Y, and Z last. */
        EULER_ORDER_ZYX = 5,
    }
    enum Key {
        /** Enum value which doesn't correspond to any key. This is used to initialize [enum Key] properties with a generic state. */
        KEY_NONE = 0,
        
        /** Keycodes with this bit applied are non-printable. */
        KEY_SPECIAL = 4194304,
        
        /** Escape key. */
        KEY_ESCAPE = 4194305,
        
        /** Tab key. */
        KEY_TAB = 4194306,
        
        /** Shift + Tab key. */
        KEY_BACKTAB = 4194307,
        
        /** Backspace key. */
        KEY_BACKSPACE = 4194308,
        
        /** Return key (on the main keyboard). */
        KEY_ENTER = 4194309,
        
        /** Enter key on the numeric keypad. */
        KEY_KP_ENTER = 4194310,
        
        /** Insert key. */
        KEY_INSERT = 4194311,
        
        /** Delete key. */
        KEY_DELETE = 4194312,
        
        /** Pause key. */
        KEY_PAUSE = 4194313,
        
        /** Print Screen key. */
        KEY_PRINT = 4194314,
        
        /** System Request key. */
        KEY_SYSREQ = 4194315,
        
        /** Clear key. */
        KEY_CLEAR = 4194316,
        
        /** Home key. */
        KEY_HOME = 4194317,
        
        /** End key. */
        KEY_END = 4194318,
        
        /** Left arrow key. */
        KEY_LEFT = 4194319,
        
        /** Up arrow key. */
        KEY_UP = 4194320,
        
        /** Right arrow key. */
        KEY_RIGHT = 4194321,
        
        /** Down arrow key. */
        KEY_DOWN = 4194322,
        
        /** Page Up key. */
        KEY_PAGEUP = 4194323,
        
        /** Page Down key. */
        KEY_PAGEDOWN = 4194324,
        
        /** Shift key. */
        KEY_SHIFT = 4194325,
        
        /** Control key. */
        KEY_CTRL = 4194326,
        
        /** Meta key. */
        KEY_META = 4194327,
        
        /** Alt key. */
        KEY_ALT = 4194328,
        
        /** Caps Lock key. */
        KEY_CAPSLOCK = 4194329,
        
        /** Num Lock key. */
        KEY_NUMLOCK = 4194330,
        
        /** Scroll Lock key. */
        KEY_SCROLLLOCK = 4194331,
        
        /** F1 key. */
        KEY_F1 = 4194332,
        
        /** F2 key. */
        KEY_F2 = 4194333,
        
        /** F3 key. */
        KEY_F3 = 4194334,
        
        /** F4 key. */
        KEY_F4 = 4194335,
        
        /** F5 key. */
        KEY_F5 = 4194336,
        
        /** F6 key. */
        KEY_F6 = 4194337,
        
        /** F7 key. */
        KEY_F7 = 4194338,
        
        /** F8 key. */
        KEY_F8 = 4194339,
        
        /** F9 key. */
        KEY_F9 = 4194340,
        
        /** F10 key. */
        KEY_F10 = 4194341,
        
        /** F11 key. */
        KEY_F11 = 4194342,
        
        /** F12 key. */
        KEY_F12 = 4194343,
        
        /** F13 key. */
        KEY_F13 = 4194344,
        
        /** F14 key. */
        KEY_F14 = 4194345,
        
        /** F15 key. */
        KEY_F15 = 4194346,
        
        /** F16 key. */
        KEY_F16 = 4194347,
        
        /** F17 key. */
        KEY_F17 = 4194348,
        
        /** F18 key. */
        KEY_F18 = 4194349,
        
        /** F19 key. */
        KEY_F19 = 4194350,
        
        /** F20 key. */
        KEY_F20 = 4194351,
        
        /** F21 key. */
        KEY_F21 = 4194352,
        
        /** F22 key. */
        KEY_F22 = 4194353,
        
        /** F23 key. */
        KEY_F23 = 4194354,
        
        /** F24 key. */
        KEY_F24 = 4194355,
        
        /** F25 key. Only supported on macOS and Linux due to a Windows limitation. */
        KEY_F25 = 4194356,
        
        /** F26 key. Only supported on macOS and Linux due to a Windows limitation. */
        KEY_F26 = 4194357,
        
        /** F27 key. Only supported on macOS and Linux due to a Windows limitation. */
        KEY_F27 = 4194358,
        
        /** F28 key. Only supported on macOS and Linux due to a Windows limitation. */
        KEY_F28 = 4194359,
        
        /** F29 key. Only supported on macOS and Linux due to a Windows limitation. */
        KEY_F29 = 4194360,
        
        /** F30 key. Only supported on macOS and Linux due to a Windows limitation. */
        KEY_F30 = 4194361,
        
        /** F31 key. Only supported on macOS and Linux due to a Windows limitation. */
        KEY_F31 = 4194362,
        
        /** F32 key. Only supported on macOS and Linux due to a Windows limitation. */
        KEY_F32 = 4194363,
        
        /** F33 key. Only supported on macOS and Linux due to a Windows limitation. */
        KEY_F33 = 4194364,
        
        /** F34 key. Only supported on macOS and Linux due to a Windows limitation. */
        KEY_F34 = 4194365,
        
        /** F35 key. Only supported on macOS and Linux due to a Windows limitation. */
        KEY_F35 = 4194366,
        
        /** Multiply (*) key on the numeric keypad. */
        KEY_KP_MULTIPLY = 4194433,
        
        /** Divide (/) key on the numeric keypad. */
        KEY_KP_DIVIDE = 4194434,
        
        /** Subtract (-) key on the numeric keypad. */
        KEY_KP_SUBTRACT = 4194435,
        
        /** Period (.) key on the numeric keypad. */
        KEY_KP_PERIOD = 4194436,
        
        /** Add (+) key on the numeric keypad. */
        KEY_KP_ADD = 4194437,
        
        /** Number 0 on the numeric keypad. */
        KEY_KP_0 = 4194438,
        
        /** Number 1 on the numeric keypad. */
        KEY_KP_1 = 4194439,
        
        /** Number 2 on the numeric keypad. */
        KEY_KP_2 = 4194440,
        
        /** Number 3 on the numeric keypad. */
        KEY_KP_3 = 4194441,
        
        /** Number 4 on the numeric keypad. */
        KEY_KP_4 = 4194442,
        
        /** Number 5 on the numeric keypad. */
        KEY_KP_5 = 4194443,
        
        /** Number 6 on the numeric keypad. */
        KEY_KP_6 = 4194444,
        
        /** Number 7 on the numeric keypad. */
        KEY_KP_7 = 4194445,
        
        /** Number 8 on the numeric keypad. */
        KEY_KP_8 = 4194446,
        
        /** Number 9 on the numeric keypad. */
        KEY_KP_9 = 4194447,
        
        /** Context menu key. */
        KEY_MENU = 4194370,
        
        /** Hyper key. (On Linux/X11 only). */
        KEY_HYPER = 4194371,
        
        /** Help key. */
        KEY_HELP = 4194373,
        
        /** Back key. */
        KEY_BACK = 4194376,
        
        /** Forward key. */
        KEY_FORWARD = 4194377,
        
        /** Media stop key. */
        KEY_STOP = 4194378,
        
        /** Refresh key. */
        KEY_REFRESH = 4194379,
        
        /** Volume down key. */
        KEY_VOLUMEDOWN = 4194380,
        
        /** Mute volume key. */
        KEY_VOLUMEMUTE = 4194381,
        
        /** Volume up key. */
        KEY_VOLUMEUP = 4194382,
        
        /** Media play key. */
        KEY_MEDIAPLAY = 4194388,
        
        /** Media stop key. */
        KEY_MEDIASTOP = 4194389,
        
        /** Previous song key. */
        KEY_MEDIAPREVIOUS = 4194390,
        
        /** Next song key. */
        KEY_MEDIANEXT = 4194391,
        
        /** Media record key. */
        KEY_MEDIARECORD = 4194392,
        
        /** Home page key. */
        KEY_HOMEPAGE = 4194393,
        
        /** Favorites key. */
        KEY_FAVORITES = 4194394,
        
        /** Search key. */
        KEY_SEARCH = 4194395,
        
        /** Standby key. */
        KEY_STANDBY = 4194396,
        
        /** Open URL / Launch Browser key. */
        KEY_OPENURL = 4194397,
        
        /** Launch Mail key. */
        KEY_LAUNCHMAIL = 4194398,
        
        /** Launch Media key. */
        KEY_LAUNCHMEDIA = 4194399,
        
        /** Launch Shortcut 0 key. */
        KEY_LAUNCH0 = 4194400,
        
        /** Launch Shortcut 1 key. */
        KEY_LAUNCH1 = 4194401,
        
        /** Launch Shortcut 2 key. */
        KEY_LAUNCH2 = 4194402,
        
        /** Launch Shortcut 3 key. */
        KEY_LAUNCH3 = 4194403,
        
        /** Launch Shortcut 4 key. */
        KEY_LAUNCH4 = 4194404,
        
        /** Launch Shortcut 5 key. */
        KEY_LAUNCH5 = 4194405,
        
        /** Launch Shortcut 6 key. */
        KEY_LAUNCH6 = 4194406,
        
        /** Launch Shortcut 7 key. */
        KEY_LAUNCH7 = 4194407,
        
        /** Launch Shortcut 8 key. */
        KEY_LAUNCH8 = 4194408,
        
        /** Launch Shortcut 9 key. */
        KEY_LAUNCH9 = 4194409,
        
        /** Launch Shortcut A key. */
        KEY_LAUNCHA = 4194410,
        
        /** Launch Shortcut B key. */
        KEY_LAUNCHB = 4194411,
        
        /** Launch Shortcut C key. */
        KEY_LAUNCHC = 4194412,
        
        /** Launch Shortcut D key. */
        KEY_LAUNCHD = 4194413,
        
        /** Launch Shortcut E key. */
        KEY_LAUNCHE = 4194414,
        
        /** Launch Shortcut F key. */
        KEY_LAUNCHF = 4194415,
        
        /** "Globe" key on Mac / iPad keyboard. */
        KEY_GLOBE = 4194416,
        
        /** "On-screen keyboard" key on iPad keyboard. */
        KEY_KEYBOARD = 4194417,
        
        /** 英数 key on Mac keyboard. */
        KEY_JIS_EISU = 4194418,
        
        /** かな key on Mac keyboard. */
        KEY_JIS_KANA = 4194419,
        
        /** Unknown key. */
        KEY_UNKNOWN = 8388607,
        
        /** Space key. */
        KEY_SPACE = 32,
        
        /** Exclamation mark (`!`) key. */
        KEY_EXCLAM = 33,
        
        /** Double quotation mark (`"`) key. */
        KEY_QUOTEDBL = 34,
        
        /** Number sign or  *hash*  (`#`) key. */
        KEY_NUMBERSIGN = 35,
        
        /** Dollar sign (`$`) key. */
        KEY_DOLLAR = 36,
        
        /** Percent sign (`%`) key. */
        KEY_PERCENT = 37,
        
        /** Ampersand (`&`) key. */
        KEY_AMPERSAND = 38,
        
        /** Apostrophe (`'`) key. */
        KEY_APOSTROPHE = 39,
        
        /** Left parenthesis (`(`) key. */
        KEY_PARENLEFT = 40,
        
        /** Right parenthesis (`)`) key. */
        KEY_PARENRIGHT = 41,
        
        /** Asterisk (`*`) key. */
        KEY_ASTERISK = 42,
        
        /** Plus (`+`) key. */
        KEY_PLUS = 43,
        
        /** Comma (`,`) key. */
        KEY_COMMA = 44,
        
        /** Minus (`-`) key. */
        KEY_MINUS = 45,
        
        /** Period (`.`) key. */
        KEY_PERIOD = 46,
        
        /** Slash (`/`) key. */
        KEY_SLASH = 47,
        
        /** Number 0 key. */
        KEY_0 = 48,
        
        /** Number 1 key. */
        KEY_1 = 49,
        
        /** Number 2 key. */
        KEY_2 = 50,
        
        /** Number 3 key. */
        KEY_3 = 51,
        
        /** Number 4 key. */
        KEY_4 = 52,
        
        /** Number 5 key. */
        KEY_5 = 53,
        
        /** Number 6 key. */
        KEY_6 = 54,
        
        /** Number 7 key. */
        KEY_7 = 55,
        
        /** Number 8 key. */
        KEY_8 = 56,
        
        /** Number 9 key. */
        KEY_9 = 57,
        
        /** Colon (`:`) key. */
        KEY_COLON = 58,
        
        /** Semicolon (`;`) key. */
        KEY_SEMICOLON = 59,
        
        /** Less-than sign (`<`) key. */
        KEY_LESS = 60,
        
        /** Equal sign (`=`) key. */
        KEY_EQUAL = 61,
        
        /** Greater-than sign (`>`) key. */
        KEY_GREATER = 62,
        
        /** Question mark (`?`) key. */
        KEY_QUESTION = 63,
        
        /** At sign (`@`) key. */
        KEY_AT = 64,
        
        /** A key. */
        KEY_A = 65,
        
        /** B key. */
        KEY_B = 66,
        
        /** C key. */
        KEY_C = 67,
        
        /** D key. */
        KEY_D = 68,
        
        /** E key. */
        KEY_E = 69,
        
        /** F key. */
        KEY_F = 70,
        
        /** G key. */
        KEY_G = 71,
        
        /** H key. */
        KEY_H = 72,
        
        /** I key. */
        KEY_I = 73,
        
        /** J key. */
        KEY_J = 74,
        
        /** K key. */
        KEY_K = 75,
        
        /** L key. */
        KEY_L = 76,
        
        /** M key. */
        KEY_M = 77,
        
        /** N key. */
        KEY_N = 78,
        
        /** O key. */
        KEY_O = 79,
        
        /** P key. */
        KEY_P = 80,
        
        /** Q key. */
        KEY_Q = 81,
        
        /** R key. */
        KEY_R = 82,
        
        /** S key. */
        KEY_S = 83,
        
        /** T key. */
        KEY_T = 84,
        
        /** U key. */
        KEY_U = 85,
        
        /** V key. */
        KEY_V = 86,
        
        /** W key. */
        KEY_W = 87,
        
        /** X key. */
        KEY_X = 88,
        
        /** Y key. */
        KEY_Y = 89,
        
        /** Z key. */
        KEY_Z = 90,
        
        /** Left bracket (`[lb]`) key. */
        KEY_BRACKETLEFT = 91,
        
        /** Backslash (`\`) key. */
        KEY_BACKSLASH = 92,
        
        /** Right bracket (`[rb]`) key. */
        KEY_BRACKETRIGHT = 93,
        
        /** Caret (`^`) key. */
        KEY_ASCIICIRCUM = 94,
        
        /** Underscore (`_`) key. */
        KEY_UNDERSCORE = 95,
        
        /** Backtick (```) key. */
        KEY_QUOTELEFT = 96,
        
        /** Left brace (`{`) key. */
        KEY_BRACELEFT = 123,
        
        /** Vertical bar or  *pipe*  (`|`) key. */
        KEY_BAR = 124,
        
        /** Right brace (`}`) key. */
        KEY_BRACERIGHT = 125,
        
        /** Tilde (`~`) key. */
        KEY_ASCIITILDE = 126,
        
        /** Yen symbol (`¥`) key. */
        KEY_YEN = 165,
        
        /** Section sign (`§`) key. */
        KEY_SECTION = 167,
    }
    enum KeyModifierMask {
        /** Key Code mask. */
        KEY_CODE_MASK = 8388607,
        
        /** Modifier key mask. */
        KEY_MODIFIER_MASK = 2130706432,
        
        /** Automatically remapped to [constant KEY_META] on macOS and [constant KEY_CTRL] on other platforms, this mask is never set in the actual events, and should be used for key mapping only. */
        KEY_MASK_CMD_OR_CTRL = 16777216,
        
        /** Shift key mask. */
        KEY_MASK_SHIFT = 33554432,
        
        /** Alt or Option (on macOS) key mask. */
        KEY_MASK_ALT = 67108864,
        
        /** Command (on macOS) or Meta/Windows key mask. */
        KEY_MASK_META = 134217728,
        
        /** Control key mask. */
        KEY_MASK_CTRL = 268435456,
        
        /** Keypad key mask. */
        KEY_MASK_KPAD = 536870912,
        
        /** Group Switch key mask. */
        KEY_MASK_GROUP_SWITCH = 1073741824,
    }
    enum KeyLocation {
        /** Used for keys which only appear once, or when a comparison doesn't need to differentiate the `LEFT` and `RIGHT` versions.  
         *  For example, when using [method InputEvent.is_match], an event which has [constant KEY_LOCATION_UNSPECIFIED] will match any [enum KeyLocation] on the passed event.  
         */
        KEY_LOCATION_UNSPECIFIED = 0,
        
        /** A key which is to the left of its twin. */
        KEY_LOCATION_LEFT = 1,
        
        /** A key which is to the right of its twin. */
        KEY_LOCATION_RIGHT = 2,
    }
    enum MouseButton {
        /** Enum value which doesn't correspond to any mouse button. This is used to initialize [enum MouseButton] properties with a generic state. */
        MOUSE_BUTTON_NONE = 0,
        
        /** Primary mouse button, usually assigned to the left button. */
        MOUSE_BUTTON_LEFT = 1,
        
        /** Secondary mouse button, usually assigned to the right button. */
        MOUSE_BUTTON_RIGHT = 2,
        
        /** Middle mouse button. */
        MOUSE_BUTTON_MIDDLE = 3,
        
        /** Mouse wheel scrolling up. */
        MOUSE_BUTTON_WHEEL_UP = 4,
        
        /** Mouse wheel scrolling down. */
        MOUSE_BUTTON_WHEEL_DOWN = 5,
        
        /** Mouse wheel left button (only present on some mice). */
        MOUSE_BUTTON_WHEEL_LEFT = 6,
        
        /** Mouse wheel right button (only present on some mice). */
        MOUSE_BUTTON_WHEEL_RIGHT = 7,
        
        /** Extra mouse button 1. This is sometimes present, usually to the sides of the mouse. */
        MOUSE_BUTTON_XBUTTON1 = 8,
        
        /** Extra mouse button 2. This is sometimes present, usually to the sides of the mouse. */
        MOUSE_BUTTON_XBUTTON2 = 9,
    }
    enum MouseButtonMask {
        /** Primary mouse button mask, usually for the left button. */
        MOUSE_BUTTON_MASK_LEFT = 1,
        
        /** Secondary mouse button mask, usually for the right button. */
        MOUSE_BUTTON_MASK_RIGHT = 2,
        
        /** Middle mouse button mask. */
        MOUSE_BUTTON_MASK_MIDDLE = 4,
        
        /** Extra mouse button 1 mask. */
        MOUSE_BUTTON_MASK_MB_XBUTTON1 = 128,
        
        /** Extra mouse button 2 mask. */
        MOUSE_BUTTON_MASK_MB_XBUTTON2 = 256,
    }
    enum JoyButton {
        /** An invalid game controller button. */
        JOY_BUTTON_INVALID = -1,
        
        /** Game controller SDL button A. Corresponds to the bottom action button: Sony Cross, Xbox A, Nintendo B. */
        JOY_BUTTON_A = 0,
        
        /** Game controller SDL button B. Corresponds to the right action button: Sony Circle, Xbox B, Nintendo A. */
        JOY_BUTTON_B = 1,
        
        /** Game controller SDL button X. Corresponds to the left action button: Sony Square, Xbox X, Nintendo Y. */
        JOY_BUTTON_X = 2,
        
        /** Game controller SDL button Y. Corresponds to the top action button: Sony Triangle, Xbox Y, Nintendo X. */
        JOY_BUTTON_Y = 3,
        
        /** Game controller SDL back button. Corresponds to the Sony Select, Xbox Back, Nintendo - button. */
        JOY_BUTTON_BACK = 4,
        
        /** Game controller SDL guide button. Corresponds to the Sony PS, Xbox Home button. */
        JOY_BUTTON_GUIDE = 5,
        
        /** Game controller SDL start button. Corresponds to the Sony Options, Xbox Menu, Nintendo + button. */
        JOY_BUTTON_START = 6,
        
        /** Game controller SDL left stick button. Corresponds to the Sony L3, Xbox L/LS button. */
        JOY_BUTTON_LEFT_STICK = 7,
        
        /** Game controller SDL right stick button. Corresponds to the Sony R3, Xbox R/RS button. */
        JOY_BUTTON_RIGHT_STICK = 8,
        
        /** Game controller SDL left shoulder button. Corresponds to the Sony L1, Xbox LB button. */
        JOY_BUTTON_LEFT_SHOULDER = 9,
        
        /** Game controller SDL right shoulder button. Corresponds to the Sony R1, Xbox RB button. */
        JOY_BUTTON_RIGHT_SHOULDER = 10,
        
        /** Game controller D-pad up button. */
        JOY_BUTTON_DPAD_UP = 11,
        
        /** Game controller D-pad down button. */
        JOY_BUTTON_DPAD_DOWN = 12,
        
        /** Game controller D-pad left button. */
        JOY_BUTTON_DPAD_LEFT = 13,
        
        /** Game controller D-pad right button. */
        JOY_BUTTON_DPAD_RIGHT = 14,
        
        /** Game controller SDL miscellaneous button. Corresponds to Xbox share button, PS5 microphone button, Nintendo Switch capture button. */
        JOY_BUTTON_MISC1 = 15,
        
        /** Game controller SDL paddle 1 button. */
        JOY_BUTTON_PADDLE1 = 16,
        
        /** Game controller SDL paddle 2 button. */
        JOY_BUTTON_PADDLE2 = 17,
        
        /** Game controller SDL paddle 3 button. */
        JOY_BUTTON_PADDLE3 = 18,
        
        /** Game controller SDL paddle 4 button. */
        JOY_BUTTON_PADDLE4 = 19,
        
        /** Game controller SDL touchpad button. */
        JOY_BUTTON_TOUCHPAD = 20,
        
        /** The number of SDL game controller buttons. */
        JOY_BUTTON_SDL_MAX = 21,
        
        /** The maximum number of game controller buttons supported by the engine. The actual limit may be lower on specific platforms:  
         *  - **Android:** Up to 36 buttons.  
         *  - **Linux:** Up to 80 buttons.  
         *  - **Windows** and **macOS:** Up to 128 buttons.  
         */
        JOY_BUTTON_MAX = 128,
    }
    enum JoyAxis {
        /** An invalid game controller axis. */
        JOY_AXIS_INVALID = -1,
        
        /** Game controller left joystick x-axis. */
        JOY_AXIS_LEFT_X = 0,
        
        /** Game controller left joystick y-axis. */
        JOY_AXIS_LEFT_Y = 1,
        
        /** Game controller right joystick x-axis. */
        JOY_AXIS_RIGHT_X = 2,
        
        /** Game controller right joystick y-axis. */
        JOY_AXIS_RIGHT_Y = 3,
        
        /** Game controller left trigger axis. */
        JOY_AXIS_TRIGGER_LEFT = 4,
        
        /** Game controller right trigger axis. */
        JOY_AXIS_TRIGGER_RIGHT = 5,
        
        /** The number of SDL game controller axes. */
        JOY_AXIS_SDL_MAX = 6,
        
        /** The maximum number of game controller axes: OpenVR supports up to 5 Joysticks making a total of 10 axes. */
        JOY_AXIS_MAX = 10,
    }
    enum MIDIMessage {
        /** Does not correspond to any MIDI message. This is the default value of [member InputEventMIDI.message]. */
        MIDI_MESSAGE_NONE = 0,
        
        /** MIDI message sent when a note is released.  
         *      
         *  **Note:** Not all MIDI devices send this message; some may send [constant MIDI_MESSAGE_NOTE_ON] with [member InputEventMIDI.velocity] set to `0`.  
         */
        MIDI_MESSAGE_NOTE_OFF = 8,
        
        /** MIDI message sent when a note is pressed. */
        MIDI_MESSAGE_NOTE_ON = 9,
        
        /** MIDI message sent to indicate a change in pressure while a note is being pressed down, also called aftertouch. */
        MIDI_MESSAGE_AFTERTOUCH = 10,
        
        /** MIDI message sent when a controller value changes. In a MIDI device, a controller is any input that doesn't play notes. These may include sliders for volume, balance, and panning, as well as switches and pedals. See the [url=https://en.wikipedia.org/wiki/General_MIDI#Controller_events]General MIDI specification[/url] for a small list. */
        MIDI_MESSAGE_CONTROL_CHANGE = 11,
        
        /** MIDI message sent when the MIDI device changes its current instrument (also called  *program*  or  *preset* ). */
        MIDI_MESSAGE_PROGRAM_CHANGE = 12,
        
        /** MIDI message sent to indicate a change in pressure for the whole channel. Some MIDI devices may send this instead of [constant MIDI_MESSAGE_AFTERTOUCH]. */
        MIDI_MESSAGE_CHANNEL_PRESSURE = 13,
        
        /** MIDI message sent when the value of the pitch bender changes, usually a wheel on the MIDI device. */
        MIDI_MESSAGE_PITCH_BEND = 14,
        
        /** MIDI system exclusive (SysEx) message. This type of message is not standardized and it's highly dependent on the MIDI device sending it.  
         *      
         *  **Note:** Getting this message's data from [InputEventMIDI] is not implemented.  
         */
        MIDI_MESSAGE_SYSTEM_EXCLUSIVE = 240,
        
        /** MIDI message sent every quarter frame to keep connected MIDI devices synchronized. Related to [constant MIDI_MESSAGE_TIMING_CLOCK].  
         *      
         *  **Note:** Getting this message's data from [InputEventMIDI] is not implemented.  
         */
        MIDI_MESSAGE_QUARTER_FRAME = 241,
        
        /** MIDI message sent to jump onto a new position in the current sequence or song.  
         *      
         *  **Note:** Getting this message's data from [InputEventMIDI] is not implemented.  
         */
        MIDI_MESSAGE_SONG_POSITION_POINTER = 242,
        
        /** MIDI message sent to select a sequence or song to play.  
         *      
         *  **Note:** Getting this message's data from [InputEventMIDI] is not implemented.  
         */
        MIDI_MESSAGE_SONG_SELECT = 243,
        
        /** MIDI message sent to request a tuning calibration. Used on analog synthesizers. Most modern MIDI devices do not need this message. */
        MIDI_MESSAGE_TUNE_REQUEST = 246,
        
        /** MIDI message sent 24 times after [constant MIDI_MESSAGE_QUARTER_FRAME], to keep connected MIDI devices synchronized. */
        MIDI_MESSAGE_TIMING_CLOCK = 248,
        
        /** MIDI message sent to start the current sequence or song from the beginning. */
        MIDI_MESSAGE_START = 250,
        
        /** MIDI message sent to resume from the point the current sequence or song was paused. */
        MIDI_MESSAGE_CONTINUE = 251,
        
        /** MIDI message sent to pause the current sequence or song. */
        MIDI_MESSAGE_STOP = 252,
        
        /** MIDI message sent repeatedly while the MIDI device is idle, to tell the receiver that the connection is alive. Most MIDI devices do not send this message. */
        MIDI_MESSAGE_ACTIVE_SENSING = 254,
        
        /** MIDI message sent to reset a MIDI device to its default state, as if it was just turned on. It should not be sent when the MIDI device is being turned on. */
        MIDI_MESSAGE_SYSTEM_RESET = 255,
    }
    enum Error {
        /** Methods that return [enum Error] return [constant OK] when no error occurred.  
         *  Since [constant OK] has value `0`, and all other error constants are positive integers, it can also be used in boolean checks.  
         *    
         *      
         *  **Note:** Many functions do not return an error code, but will print error messages to standard output.  
         */
        OK = 0,
        
        /** Generic error. */
        FAILED = 1,
        
        /** Unavailable error. */
        ERR_UNAVAILABLE = 2,
        
        /** Unconfigured error. */
        ERR_UNCONFIGURED = 3,
        
        /** Unauthorized error. */
        ERR_UNAUTHORIZED = 4,
        
        /** Parameter range error. */
        ERR_PARAMETER_RANGE_ERROR = 5,
        
        /** Out of memory (OOM) error. */
        ERR_OUT_OF_MEMORY = 6,
        
        /** File: Not found error. */
        ERR_FILE_NOT_FOUND = 7,
        
        /** File: Bad drive error. */
        ERR_FILE_BAD_DRIVE = 8,
        
        /** File: Bad path error. */
        ERR_FILE_BAD_PATH = 9,
        
        /** File: No permission error. */
        ERR_FILE_NO_PERMISSION = 10,
        
        /** File: Already in use error. */
        ERR_FILE_ALREADY_IN_USE = 11,
        
        /** File: Can't open error. */
        ERR_FILE_CANT_OPEN = 12,
        
        /** File: Can't write error. */
        ERR_FILE_CANT_WRITE = 13,
        
        /** File: Can't read error. */
        ERR_FILE_CANT_READ = 14,
        
        /** File: Unrecognized error. */
        ERR_FILE_UNRECOGNIZED = 15,
        
        /** File: Corrupt error. */
        ERR_FILE_CORRUPT = 16,
        
        /** File: Missing dependencies error. */
        ERR_FILE_MISSING_DEPENDENCIES = 17,
        
        /** File: End of file (EOF) error. */
        ERR_FILE_EOF = 18,
        
        /** Can't open error. */
        ERR_CANT_OPEN = 19,
        
        /** Can't create error. */
        ERR_CANT_CREATE = 20,
        
        /** Query failed error. */
        ERR_QUERY_FAILED = 21,
        
        /** Already in use error. */
        ERR_ALREADY_IN_USE = 22,
        
        /** Locked error. */
        ERR_LOCKED = 23,
        
        /** Timeout error. */
        ERR_TIMEOUT = 24,
        
        /** Can't connect error. */
        ERR_CANT_CONNECT = 25,
        
        /** Can't resolve error. */
        ERR_CANT_RESOLVE = 26,
        
        /** Connection error. */
        ERR_CONNECTION_ERROR = 27,
        
        /** Can't acquire resource error. */
        ERR_CANT_ACQUIRE_RESOURCE = 28,
        
        /** Can't fork process error. */
        ERR_CANT_FORK = 29,
        
        /** Invalid data error. */
        ERR_INVALID_DATA = 30,
        
        /** Invalid parameter error. */
        ERR_INVALID_PARAMETER = 31,
        
        /** Already exists error. */
        ERR_ALREADY_EXISTS = 32,
        
        /** Does not exist error. */
        ERR_DOES_NOT_EXIST = 33,
        
        /** Database: Read error. */
        ERR_DATABASE_CANT_READ = 34,
        
        /** Database: Write error. */
        ERR_DATABASE_CANT_WRITE = 35,
        
        /** Compilation failed error. */
        ERR_COMPILATION_FAILED = 36,
        
        /** Method not found error. */
        ERR_METHOD_NOT_FOUND = 37,
        
        /** Linking failed error. */
        ERR_LINK_FAILED = 38,
        
        /** Script failed error. */
        ERR_SCRIPT_FAILED = 39,
        
        /** Cycling link (import cycle) error. */
        ERR_CYCLIC_LINK = 40,
        
        /** Invalid declaration error. */
        ERR_INVALID_DECLARATION = 41,
        
        /** Duplicate symbol error. */
        ERR_DUPLICATE_SYMBOL = 42,
        
        /** Parse error. */
        ERR_PARSE_ERROR = 43,
        
        /** Busy error. */
        ERR_BUSY = 44,
        
        /** Skip error. */
        ERR_SKIP = 45,
        
        /** Help error. Used internally when passing `--version` or `--help` as executable options. */
        ERR_HELP = 46,
        
        /** Bug error, caused by an implementation issue in the method.  
         *      
         *  **Note:** If a built-in method returns this code, please open an issue on [url=https://github.com/godotengine/godot/issues]the GitHub Issue Tracker[/url].  
         */
        ERR_BUG = 47,
        
        /** Printer on fire error (This is an easter egg, no built-in methods return this error code). */
        ERR_PRINTER_ON_FIRE = 48,
    }
    enum PropertyHint {
        /** The property has no hint for the editor. */
        PROPERTY_HINT_NONE = 0,
        
        /** Hints that an [int] or [float] property should be within a range specified via the hint string `"min,max"` or `"min,max,step"`. The hint string can optionally include `"or_greater"` and/or `"or_less"` to allow manual input going respectively above the max or below the min values.  
         *  **Example:** `"-360,360,1,or_greater,or_less"`.  
         *  Additionally, other keywords can be included: `"exp"` for exponential range editing, `"radians_as_degrees"` for editing radian angles in degrees (the range values are also in degrees), `"degrees"` to hint at an angle and `"hide_slider"` to hide the slider.  
         */
        PROPERTY_HINT_RANGE = 1,
        
        /** Hints that an [int] or [String] property is an enumerated value to pick in a list specified via a hint string.  
         *  The hint string is a comma separated list of names such as `"Hello,Something,Else"`. Whitespaces are **not** removed from either end of a name. For integer properties, the first name in the list has value 0, the next 1, and so on. Explicit values can also be specified by appending `:integer` to the name, e.g. `"Zero,One,Three:3,Four,Six:6"`.  
         */
        PROPERTY_HINT_ENUM = 2,
        
        /** Hints that a [String] property can be an enumerated value to pick in a list specified via a hint string such as `"Hello,Something,Else"`.  
         *  Unlike [constant PROPERTY_HINT_ENUM], a property with this hint still accepts arbitrary values and can be empty. The list of values serves to suggest possible values.  
         */
        PROPERTY_HINT_ENUM_SUGGESTION = 3,
        
        /** Hints that a [float] property should be edited via an exponential easing function. The hint string can include `"attenuation"` to flip the curve horizontally and/or `"positive_only"` to exclude in/out easing and limit values to be greater than or equal to zero. */
        PROPERTY_HINT_EXP_EASING = 4,
        
        /** Hints that a vector property should allow its components to be linked. For example, this allows [member Vector2.x] and [member Vector2.y] to be edited together. */
        PROPERTY_HINT_LINK = 5,
        
        /** Hints that an [int] property is a bitmask with named bit flags.  
         *  The hint string is a comma separated list of names such as `"Bit0,Bit1,Bit2,Bit3"`. Whitespaces are **not** removed from either end of a name. The first name in the list has value 1, the next 2, then 4, 8, 16 and so on. Explicit values can also be specified by appending `:integer` to the name, e.g. `"A:4,B:8,C:16"`. You can also combine several flags (`"A:4,B:8,AB:12,C:16"`).  
         *      
         *  **Note:** A flag value must be at least `1` and at most `2 ** 32 - 1`.  
         *      
         *  **Note:** Unlike [constant PROPERTY_HINT_ENUM], the previous explicit value is not taken into account. For the hint `"A:16,B,C"`, A is 16, B is 2, C is 4.  
         */
        PROPERTY_HINT_FLAGS = 6,
        
        /** Hints that an [int] property is a bitmask using the optionally named 2D render layers. */
        PROPERTY_HINT_LAYERS_2D_RENDER = 7,
        
        /** Hints that an [int] property is a bitmask using the optionally named 2D physics layers. */
        PROPERTY_HINT_LAYERS_2D_PHYSICS = 8,
        
        /** Hints that an [int] property is a bitmask using the optionally named 2D navigation layers. */
        PROPERTY_HINT_LAYERS_2D_NAVIGATION = 9,
        
        /** Hints that an [int] property is a bitmask using the optionally named 3D render layers. */
        PROPERTY_HINT_LAYERS_3D_RENDER = 10,
        
        /** Hints that an [int] property is a bitmask using the optionally named 3D physics layers. */
        PROPERTY_HINT_LAYERS_3D_PHYSICS = 11,
        
        /** Hints that an [int] property is a bitmask using the optionally named 3D navigation layers. */
        PROPERTY_HINT_LAYERS_3D_NAVIGATION = 12,
        
        /** Hints that an integer property is a bitmask using the optionally named avoidance layers. */
        PROPERTY_HINT_LAYERS_AVOIDANCE = 37,
        
        /** Hints that a [String] property is a path to a file. Editing it will show a file dialog for picking the path. The hint string can be a set of filters with wildcards like `"*.png,*.jpg"`. By default the file will be stored as UID whenever available. You can use [ResourceUID] methods to convert it back to path. For storing a raw path, use [constant PROPERTY_HINT_FILE_PATH]. */
        PROPERTY_HINT_FILE = 13,
        
        /** Hints that a [String] property is a path to a directory. Editing it will show a file dialog for picking the path. */
        PROPERTY_HINT_DIR = 14,
        
        /** Hints that a [String] property is an absolute path to a file outside the project folder. Editing it will show a file dialog for picking the path. The hint string can be a set of filters with wildcards, like `"*.png,*.jpg"`. */
        PROPERTY_HINT_GLOBAL_FILE = 15,
        
        /** Hints that a [String] property is an absolute path to a directory outside the project folder. Editing it will show a file dialog for picking the path. */
        PROPERTY_HINT_GLOBAL_DIR = 16,
        
        /** Hints that a property is an instance of a [Resource]-derived type, optionally specified via the hint string (e.g. `"Texture2D"`). Editing it will show a popup menu of valid resource types to instantiate. */
        PROPERTY_HINT_RESOURCE_TYPE = 17,
        
        /** Hints that a [String] property is text with line breaks. Editing it will show a text input field where line breaks can be typed. */
        PROPERTY_HINT_MULTILINE_TEXT = 18,
        
        /** Hints that a [String] property is an [Expression]. */
        PROPERTY_HINT_EXPRESSION = 19,
        
        /** Hints that a [String] property should show a placeholder text on its input field, if empty. The hint string is the placeholder text to use. */
        PROPERTY_HINT_PLACEHOLDER_TEXT = 20,
        
        /** Hints that a [Color] property should be edited without affecting its transparency ([member Color.a] is not editable). */
        PROPERTY_HINT_COLOR_NO_ALPHA = 21,
        
        /** Hints that the property's value is an object encoded as object ID, with its type specified in the hint string. Used by the debugger. */
        PROPERTY_HINT_OBJECT_ID = 22,
        
        /** If a property is [String], hints that the property represents a particular type (class). This allows to select a type from the create dialog. The property will store the selected type as a string.  
         *  If a property is [Array], hints the editor how to show elements. The `hint_string` must encode nested types using `":"` and `"/"`.  
         *  If a property is [Dictionary], hints the editor how to show elements. The `hint_string` is the same as [Array], with a `";"` separating the key and value.  
         *    
         *  **Examples:**  
         *    
         *      
         *  **Note:** The trailing colon is required for properly detecting built-in types.  
         */
        PROPERTY_HINT_TYPE_STRING = 23,
        PROPERTY_HINT_NODE_PATH_TO_EDITED_NODE = 24,
        
        /** Hints that an object is too big to be sent via the debugger. */
        PROPERTY_HINT_OBJECT_TOO_BIG = 25,
        
        /** Hints that the hint string specifies valid node types for property of type [NodePath]. */
        PROPERTY_HINT_NODE_PATH_VALID_TYPES = 26,
        
        /** Hints that a [String] property is a path to a file. Editing it will show a file dialog for picking the path for the file to be saved at. The dialog has access to the project's directory. The hint string can be a set of filters with wildcards like `"*.png,*.jpg"`. See also [member FileDialog.filters]. */
        PROPERTY_HINT_SAVE_FILE = 27,
        
        /** Hints that a [String] property is a path to a file. Editing it will show a file dialog for picking the path for the file to be saved at. The dialog has access to the entire filesystem. The hint string can be a set of filters with wildcards like `"*.png,*.jpg"`. See also [member FileDialog.filters]. */
        PROPERTY_HINT_GLOBAL_SAVE_FILE = 28,
        PROPERTY_HINT_INT_IS_OBJECTID = 29,
        
        /** Hints that an [int] property is a pointer. Used by GDExtension. */
        PROPERTY_HINT_INT_IS_POINTER = 30,
        
        /** Hints that a property is an [Array] with the stored type specified in the hint string. The hint string contains the type of the array (e.g. `"String"`).  
         *  Use the hint string format from [constant PROPERTY_HINT_TYPE_STRING] for more control over the stored type.  
         */
        PROPERTY_HINT_ARRAY_TYPE = 31,
        
        /** Hints that a property is a [Dictionary] with the stored types specified in the hint string. The hint string contains the key and value types separated by a semicolon (e.g. `"int;String"`).  
         *  Use the hint string format from [constant PROPERTY_HINT_TYPE_STRING] for more control over the stored types.  
         */
        PROPERTY_HINT_DICTIONARY_TYPE = 38,
        
        /** Hints that a string property is a locale code. Editing it will show a locale dialog for picking language and country. */
        PROPERTY_HINT_LOCALE_ID = 32,
        
        /** Hints that a dictionary property is string translation map. Dictionary keys are locale codes and, values are translated strings. */
        PROPERTY_HINT_LOCALIZABLE_STRING = 33,
        
        /** Hints that a property is an instance of a [Node]-derived type, optionally specified via the hint string (e.g. `"Node2D"`). Editing it will show a dialog for picking a node from the scene. */
        PROPERTY_HINT_NODE_TYPE = 34,
        
        /** Hints that a quaternion property should disable the temporary euler editor. */
        PROPERTY_HINT_HIDE_QUATERNION_EDIT = 35,
        
        /** Hints that a string property is a password, and every character is replaced with the secret character. */
        PROPERTY_HINT_PASSWORD = 36,
        
        /** Hints that a [Callable] property should be displayed as a clickable button. When the button is pressed, the callable is called. The hint string specifies the button text and optionally an icon from the `"EditorIcons"` theme type.  
         *  [codeblock lang=text]  
         *  "Click me!" - A button with the text "Click me!" and the default "Callable" icon.  
         *  "Click me!,ColorRect" - A button with the text "Click me!" and the "ColorRect" icon.  
         *  [/codeblock]  
         *      
         *  **Note:** A [Callable] cannot be properly serialized and stored in a file, so it is recommended to use [constant PROPERTY_USAGE_EDITOR] instead of [constant PROPERTY_USAGE_DEFAULT].  
         */
        PROPERTY_HINT_TOOL_BUTTON = 39,
        
        /** Hints that a property will be changed on its own after setting, such as [member AudioStreamPlayer.playing] or [member GPUParticles3D.emitting]. */
        PROPERTY_HINT_ONESHOT = 40,
        
        /** Hints that a boolean property will enable the feature associated with the group that it occurs in. The property will be displayed as a checkbox on the group header. Only works within a group or subgroup.  
         *  By default, disabling the property hides all properties in the group. Use the optional hint string `"checkbox_only"` to disable this behavior.  
         */
        PROPERTY_HINT_GROUP_ENABLE = 42,
        
        /** Hints that a [String] or [StringName] property is the name of an input action. This allows the selection of any action name from the Input Map in the Project Settings. The hint string may contain two options separated by commas:  
         *  - If it contains `"show_builtin"`, built-in input actions are included in the selection.  
         *  - If it contains `"loose_mode"`, loose mode is enabled. This allows inserting any action name even if it's not present in the input map.  
         */
        PROPERTY_HINT_INPUT_NAME = 43,
        
        /** Like [constant PROPERTY_HINT_FILE], but the property is stored as a raw path, not UID. That means the reference will be broken if you move the file. Consider using [constant PROPERTY_HINT_FILE] when possible. */
        PROPERTY_HINT_FILE_PATH = 44,
        
        /** Represents the size of the [enum PropertyHint] enum. */
        PROPERTY_HINT_MAX = 45,
    }
    enum PropertyUsageFlags {
        /** The property is not stored, and does not display in the editor. This is the default for non-exported properties. */
        PROPERTY_USAGE_NONE = 0,
        
        /** The property is serialized and saved in the scene file (default for exported properties). */
        PROPERTY_USAGE_STORAGE = 2,
        
        /** The property is shown in the [EditorInspector] (default for exported properties). */
        PROPERTY_USAGE_EDITOR = 4,
        
        /** The property is excluded from the class reference. */
        PROPERTY_USAGE_INTERNAL = 8,
        
        /** The property can be checked in the [EditorInspector]. */
        PROPERTY_USAGE_CHECKABLE = 16,
        
        /** The property is checked in the [EditorInspector]. */
        PROPERTY_USAGE_CHECKED = 32,
        
        /** Used to group properties together in the editor. See [EditorInspector]. */
        PROPERTY_USAGE_GROUP = 64,
        
        /** Used to categorize properties together in the editor. */
        PROPERTY_USAGE_CATEGORY = 128,
        
        /** Used to group properties together in the editor in a subgroup (under a group). See [EditorInspector]. */
        PROPERTY_USAGE_SUBGROUP = 256,
        
        /** The property is a bitfield, i.e. it contains multiple flags represented as bits. */
        PROPERTY_USAGE_CLASS_IS_BITFIELD = 512,
        
        /** The property does not save its state in [PackedScene]. */
        PROPERTY_USAGE_NO_INSTANCE_STATE = 1024,
        
        /** Editing the property prompts the user for restarting the editor. */
        PROPERTY_USAGE_RESTART_IF_CHANGED = 2048,
        
        /** The property is a script variable. [constant PROPERTY_USAGE_SCRIPT_VARIABLE] can be used to distinguish between exported script variables from built-in variables (which don't have this usage flag). By default, [constant PROPERTY_USAGE_SCRIPT_VARIABLE] is **not** applied to variables that are created by overriding [method Object._get_property_list] in a script. */
        PROPERTY_USAGE_SCRIPT_VARIABLE = 4096,
        
        /** The property value of type [Object] will be stored even if its value is `null`. */
        PROPERTY_USAGE_STORE_IF_NULL = 8192,
        
        /** If this property is modified, all inspector fields will be refreshed. */
        PROPERTY_USAGE_UPDATE_ALL_IF_MODIFIED = 16384,
        PROPERTY_USAGE_SCRIPT_DEFAULT_VALUE = 32768,
        
        /** The property is a variable of enum type, i.e. it only takes named integer constants from its associated enumeration. */
        PROPERTY_USAGE_CLASS_IS_ENUM = 65536,
        
        /** If property has `nil` as default value, its type will be [Variant]. */
        PROPERTY_USAGE_NIL_IS_VARIANT = 131072,
        
        /** The property is an array. */
        PROPERTY_USAGE_ARRAY = 262144,
        
        /** When duplicating a resource with [method Resource.duplicate], and this flag is set on a property of that resource, the property should always be duplicated, regardless of the `subresources` bool parameter. */
        PROPERTY_USAGE_ALWAYS_DUPLICATE = 524288,
        
        /** When duplicating a resource with [method Resource.duplicate], and this flag is set on a property of that resource, the property should never be duplicated, regardless of the `subresources` bool parameter. */
        PROPERTY_USAGE_NEVER_DUPLICATE = 1048576,
        
        /** The property is only shown in the editor if modern renderers are supported (the Compatibility rendering method is excluded). */
        PROPERTY_USAGE_HIGH_END_GFX = 2097152,
        
        /** The [NodePath] property will always be relative to the scene's root. Mostly useful for local resources. */
        PROPERTY_USAGE_NODE_PATH_FROM_SCENE_ROOT = 4194304,
        
        /** Use when a resource is created on the fly, i.e. the getter will always return a different instance. [ResourceSaver] needs this information to properly save such resources. */
        PROPERTY_USAGE_RESOURCE_NOT_PERSISTENT = 8388608,
        
        /** Inserting an animation key frame of this property will automatically increment the value, allowing to easily keyframe multiple values in a row. */
        PROPERTY_USAGE_KEYING_INCREMENTS = 16777216,
        PROPERTY_USAGE_DEFERRED_SET_RESOURCE = 33554432,
        
        /** When this property is a [Resource] and base object is a [Node], a resource instance will be automatically created whenever the node is created in the editor. */
        PROPERTY_USAGE_EDITOR_INSTANTIATE_OBJECT = 67108864,
        
        /** The property is considered a basic setting and will appear even when advanced mode is disabled. Used for project settings. */
        PROPERTY_USAGE_EDITOR_BASIC_SETTING = 134217728,
        
        /** The property is read-only in the [EditorInspector]. */
        PROPERTY_USAGE_READ_ONLY = 268435456,
        
        /** An export preset property with this flag contains confidential information and is stored separately from the rest of the export preset configuration. */
        PROPERTY_USAGE_SECRET = 536870912,
        
        /** Default usage (storage and editor). */
        PROPERTY_USAGE_DEFAULT = 6,
        
        /** Default usage but without showing the property in the editor (storage). */
        PROPERTY_USAGE_NO_EDITOR = 2,
    }
    enum MethodFlags {
        /** Flag for a normal method. */
        METHOD_FLAG_NORMAL = 1,
        
        /** Flag for an editor method. */
        METHOD_FLAG_EDITOR = 2,
        
        /** Flag for a constant method. */
        METHOD_FLAG_CONST = 4,
        
        /** Flag for a virtual method. */
        METHOD_FLAG_VIRTUAL = 8,
        
        /** Flag for a method with a variable number of arguments. */
        METHOD_FLAG_VARARG = 16,
        
        /** Flag for a static method. */
        METHOD_FLAG_STATIC = 32,
        
        /** Used internally. Allows to not dump core virtual methods (such as [method Object._notification]) to the JSON API. */
        METHOD_FLAG_OBJECT_CORE = 64,
        
        /** Flag for a virtual method that is required. In GDScript, this flag is set for abstract functions. */
        METHOD_FLAG_VIRTUAL_REQUIRED = 128,
        
        /** Default method flags (normal). */
        METHOD_FLAGS_DEFAULT = 1,
    }
    namespace Variant {
        enum Type {
            /** Variable is `null`. */
            TYPE_NIL = 0,
            
            /** Variable is of type [bool]. */
            TYPE_BOOL = 1,
            
            /** Variable is of type [int]. */
            TYPE_INT = 2,
            
            /** Variable is of type [float]. */
            TYPE_FLOAT = 3,
            
            /** Variable is of type [String]. */
            TYPE_STRING = 4,
            
            /** Variable is of type [Vector2]. */
            TYPE_VECTOR2 = 5,
            
            /** Variable is of type [Vector2i]. */
            TYPE_VECTOR2I = 6,
            
            /** Variable is of type [Rect2]. */
            TYPE_RECT2 = 7,
            
            /** Variable is of type [Rect2i]. */
            TYPE_RECT2I = 8,
            
            /** Variable is of type [Vector3]. */
            TYPE_VECTOR3 = 9,
            
            /** Variable is of type [Vector3i]. */
            TYPE_VECTOR3I = 10,
            
            /** Variable is of type [Transform2D]. */
            TYPE_TRANSFORM2D = 11,
            
            /** Variable is of type [Vector4]. */
            TYPE_VECTOR4 = 12,
            
            /** Variable is of type [Vector4i]. */
            TYPE_VECTOR4I = 13,
            
            /** Variable is of type [Plane]. */
            TYPE_PLANE = 14,
            
            /** Variable is of type [Quaternion]. */
            TYPE_QUATERNION = 15,
            
            /** Variable is of type [AABB]. */
            TYPE_AABB = 16,
            
            /** Variable is of type [Basis]. */
            TYPE_BASIS = 17,
            
            /** Variable is of type [Transform3D]. */
            TYPE_TRANSFORM3D = 18,
            
            /** Variable is of type [Projection]. */
            TYPE_PROJECTION = 19,
            
            /** Variable is of type [Color]. */
            TYPE_COLOR = 20,
            
            /** Variable is of type [StringName]. */
            TYPE_STRING_NAME = 21,
            
            /** Variable is of type [NodePath]. */
            TYPE_NODE_PATH = 22,
            
            /** Variable is of type [RID]. */
            TYPE_RID = 23,
            
            /** Variable is of type [Object]. */
            TYPE_OBJECT = 24,
            
            /** Variable is of type [Callable]. */
            TYPE_CALLABLE = 25,
            
            /** Variable is of type [Signal]. */
            TYPE_SIGNAL = 26,
            
            /** Variable is of type [Dictionary]. */
            TYPE_DICTIONARY = 27,
            
            /** Variable is of type [Array]. */
            TYPE_ARRAY = 28,
            
            /** Variable is of type [PackedByteArray]. */
            TYPE_PACKED_BYTE_ARRAY = 29,
            
            /** Variable is of type [PackedInt32Array]. */
            TYPE_PACKED_INT32_ARRAY = 30,
            
            /** Variable is of type [PackedInt64Array]. */
            TYPE_PACKED_INT64_ARRAY = 31,
            
            /** Variable is of type [PackedFloat32Array]. */
            TYPE_PACKED_FLOAT32_ARRAY = 32,
            
            /** Variable is of type [PackedFloat64Array]. */
            TYPE_PACKED_FLOAT64_ARRAY = 33,
            
            /** Variable is of type [PackedStringArray]. */
            TYPE_PACKED_STRING_ARRAY = 34,
            
            /** Variable is of type [PackedVector2Array]. */
            TYPE_PACKED_VECTOR2_ARRAY = 35,
            
            /** Variable is of type [PackedVector3Array]. */
            TYPE_PACKED_VECTOR3_ARRAY = 36,
            
            /** Variable is of type [PackedColorArray]. */
            TYPE_PACKED_COLOR_ARRAY = 37,
            
            /** Variable is of type [PackedVector4Array]. */
            TYPE_PACKED_VECTOR4_ARRAY = 38,
            
            /** Represents the size of the [enum Variant.Type] enum. */
            TYPE_MAX = 39,
        }
    }
    namespace Variant {
        enum Operator {
            /** Equality operator (`==`). */
            OP_EQUAL = 0,
            
            /** Inequality operator (`!=`). */
            OP_NOT_EQUAL = 1,
            
            /** Less than operator (`<`). */
            OP_LESS = 2,
            
            /** Less than or equal operator (`<=`). */
            OP_LESS_EQUAL = 3,
            
            /** Greater than operator (`>`). */
            OP_GREATER = 4,
            
            /** Greater than or equal operator (`>=`). */
            OP_GREATER_EQUAL = 5,
            
            /** Addition operator (`+`). */
            OP_ADD = 6,
            
            /** Subtraction operator (`-`). */
            OP_SUBTRACT = 7,
            
            /** Multiplication operator (`*`). */
            OP_MULTIPLY = 8,
            
            /** Division operator (`/`). */
            OP_DIVIDE = 9,
            
            /** Unary negation operator (`-`). */
            OP_NEGATE = 10,
            
            /** Unary plus operator (`+`). */
            OP_POSITIVE = 11,
            
            /** Remainder/modulo operator (`%`). */
            OP_MODULE = 12,
            
            /** Power operator (`**`). */
            OP_POWER = 13,
            
            /** Left shift operator (`<<`). */
            OP_SHIFT_LEFT = 14,
            
            /** Right shift operator (`>>`). */
            OP_SHIFT_RIGHT = 15,
            
            /** Bitwise AND operator (`&`). */
            OP_BIT_AND = 16,
            
            /** Bitwise OR operator (`|`). */
            OP_BIT_OR = 17,
            
            /** Bitwise XOR operator (`^`). */
            OP_BIT_XOR = 18,
            
            /** Bitwise NOT operator (`~`). */
            OP_BIT_NEGATE = 19,
            
            /** Logical AND operator (`and` or `&&`). */
            OP_AND = 20,
            
            /** Logical OR operator (`or` or `||`). */
            OP_OR = 21,
            
            /** Logical XOR operator (not implemented in GDScript). */
            OP_XOR = 22,
            
            /** Logical NOT operator (`not` or `!`). */
            OP_NOT = 23,
            
            /** Logical IN operator (`in`). */
            OP_IN = 24,
            
            /** Represents the size of the [enum Variant.Operator] enum. */
            OP_MAX = 25,
        }
    }
    
    /** Returns the sine of angle [param angle_rad] in radians.  
     *    
     */
    function sin(angle_rad: float64): float64
    
    /** Returns the cosine of angle [param angle_rad] in radians.  
     *    
     */
    function cos(angle_rad: float64): float64
    
    /** Returns the tangent of angle [param angle_rad] in radians.  
     *    
     */
    function tan(angle_rad: float64): float64
    
    /** Returns the hyperbolic sine of [param x].  
     *    
     */
    function sinh(x: float64): float64
    
    /** Returns the hyperbolic cosine of [param x] in radians.  
     *    
     */
    function cosh(x: float64): float64
    
    /** Returns the hyperbolic tangent of [param x].  
     *    
     */
    function tanh(x: float64): float64
    
    /** Returns the arc sine of [param x] in radians. Use to get the angle of sine [param x]. [param x] will be clamped between `-1.0` and `1.0` (inclusive), in order to prevent [method asin] from returning [constant @GDScript.NAN].  
     *    
     */
    function asin(x: float64): float64
    
    /** Returns the arc cosine of [param x] in radians. Use to get the angle of cosine [param x]. [param x] will be clamped between `-1.0` and `1.0` (inclusive), in order to prevent [method acos] from returning [constant @GDScript.NAN].  
     *    
     */
    function acos(x: float64): float64
    
    /** Returns the arc tangent of [param x] in radians. Use it to get the angle from an angle's tangent in trigonometry.  
     *  The method cannot know in which quadrant the angle should fall. See [method atan2] if you have both `y` and [code skip-lint]x`.  
     *    
     *  If [param x] is between `-PI / 2` and `PI / 2` (inclusive), `atan(tan(x))` is equal to [param x].  
     */
    function atan(x: float64): float64
    
    /** Returns the arc tangent of `y/x` in radians. Use to get the angle of tangent `y/x`. To compute the value, the method takes into account the sign of both arguments in order to determine the quadrant.  
     *  Important note: The Y coordinate comes first, by convention.  
     *    
     */
    function atan2(y: float64, x: float64): float64
    
    /** Returns the hyperbolic arc (also called inverse) sine of [param x], returning a value in radians. Use it to get the angle from an angle's sine in hyperbolic space.  
     *    
     */
    function asinh(x: float64): float64
    
    /** Returns the hyperbolic arc (also called inverse) cosine of [param x], returning a value in radians. Use it to get the angle from an angle's cosine in hyperbolic space if [param x] is larger or equal to 1. For values of [param x] lower than 1, it will return 0, in order to prevent [method acosh] from returning [constant @GDScript.NAN].  
     *    
     */
    function acosh(x: float64): float64
    
    /** Returns the hyperbolic arc (also called inverse) tangent of [param x], returning a value in radians. Use it to get the angle from an angle's tangent in hyperbolic space if [param x] is between -1 and 1 (non-inclusive).  
     *  In mathematics, the inverse hyperbolic tangent is only defined for -1 < [param x] < 1 in the real set, so values equal or lower to -1 for [param x] return negative [constant @GDScript.INF] and values equal or higher than 1 return positive [constant @GDScript.INF] in order to prevent [method atanh] from returning [constant @GDScript.NAN].  
     *    
     */
    function atanh(x: float64): float64
    
    /** Returns the square root of [param x], where [param x] is a non-negative number.  
     *    
     *      
     *  **Note:** Negative values of [param x] return NaN ("Not a Number"). In C#, if you need negative inputs, use `System.Numerics.Complex`.  
     */
    function sqrt(x: float64): float64
    
    /** Returns the floating-point remainder of [param x] divided by [param y], keeping the sign of [param x].  
     *    
     *  For the integer remainder operation, use the `%` operator.  
     */
    function fmod(x: float64, y: float64): float64
    
    /** Returns the floating-point modulus of [param x] divided by [param y], wrapping equally in positive and negative.  
     *    
     *  Prints:  
     *  [codeblock lang=text]  
     *   (x)  (fmod(x, 1.5))   (fposmod(x, 1.5))  
     *  -1.5           -0.0  |  0.0  
     *  -1.0           -1.0  |  0.5  
     *  -0.5           -0.5  |  1.0  
     *   0.0            0.0  |  0.0  
     *   0.5            0.5  |  0.5  
     *   1.0            1.0  |  1.0  
     *   1.5            0.0  |  0.0  
     *  [/codeblock]  
     */
    function fposmod(x: float64, y: float64): float64
    
    /** Returns the integer modulus of [param x] divided by [param y] that wraps equally in positive and negative.  
     *    
     *  Prints:  
     *  [codeblock lang=text]  
     *  (i)  (i % 3)   (posmod(i, 3))  
     *  -3        0  |  0  
     *  -2       -2  |  1  
     *  -1       -1  |  2  
     *   0        0  |  0  
     *   1        1  |  1  
     *   2        2  |  2  
     *   3        0  |  0  
     *  [/codeblock]  
     */
    function posmod(x: int64, y: int64): int64
    
    /** Rounds [param x] downward (towards negative infinity), returning the largest whole number that is not more than [param x]. Supported types: [int], [float], [Vector2], [Vector2i], [Vector3], [Vector3i], [Vector4], [Vector4i].  
     *    
     *  See also [method ceil], [method round], and [method snapped].  
     *      
     *  **Note:** For better type safety, use [method floorf], [method floori], [method Vector2.floor], [method Vector3.floor], or [method Vector4.floor].  
     */
    function floor(x: any): any
    
    /** Rounds [param x] downward (towards negative infinity), returning the largest whole number that is not more than [param x].  
     *  A type-safe version of [method floor], returning a [float].  
     */
    function floorf(x: float64): float64
    
    /** Rounds [param x] downward (towards negative infinity), returning the largest whole number that is not more than [param x].  
     *  A type-safe version of [method floor], returning an [int].  
     *      
     *  **Note:** This function is  *not*  the same as `int(x)`, which rounds towards 0.  
     */
    function floori(x: float64): int64
    
    /** Rounds [param x] upward (towards positive infinity), returning the smallest whole number that is not less than [param x]. Supported types: [int], [float], [Vector2], [Vector2i], [Vector3], [Vector3i], [Vector4], [Vector4i].  
     *    
     *  See also [method floor], [method round], and [method snapped].  
     *      
     *  **Note:** For better type safety, use [method ceilf], [method ceili], [method Vector2.ceil], [method Vector3.ceil], or [method Vector4.ceil].  
     */
    function ceil(x: any): any
    
    /** Rounds [param x] upward (towards positive infinity), returning the smallest whole number that is not less than [param x].  
     *  A type-safe version of [method ceil], returning a [float].  
     */
    function ceilf(x: float64): float64
    
    /** Rounds [param x] upward (towards positive infinity), returning the smallest whole number that is not less than [param x].  
     *  A type-safe version of [method ceil], returning an [int].  
     */
    function ceili(x: float64): int64
    
    /** Rounds [param x] to the nearest whole number, with halfway cases rounded away from 0. Supported types: [int], [float], [Vector2], [Vector2i], [Vector3], [Vector3i], [Vector4], [Vector4i].  
     *    
     *  See also [method floor], [method ceil], and [method snapped].  
     *      
     *  **Note:** For better type safety, use [method roundf], [method roundi], [method Vector2.round], [method Vector3.round], or [method Vector4.round].  
     */
    function round(x: any): any
    
    /** Rounds [param x] to the nearest whole number, with halfway cases rounded away from 0.  
     *  A type-safe version of [method round], returning a [float].  
     */
    function roundf(x: float64): float64
    
    /** Rounds [param x] to the nearest whole number, with halfway cases rounded away from 0.  
     *  A type-safe version of [method round], returning an [int].  
     */
    function roundi(x: float64): int64
    
    /** Returns the absolute value of a [Variant] parameter [param x] (i.e. non-negative value). Supported types: [int], [float], [Vector2], [Vector2i], [Vector3], [Vector3i], [Vector4], [Vector4i].  
     *    
     *      
     *  **Note:** For better type safety, use [method absf], [method absi], [method Vector2.abs], [method Vector2i.abs], [method Vector3.abs], [method Vector3i.abs], [method Vector4.abs], or [method Vector4i.abs].  
     */
    function abs(x: any): any
    
    /** Returns the absolute value of float parameter [param x] (i.e. positive value).  
     *    
     */
    function absf(x: float64): float64
    
    /** Returns the absolute value of int parameter [param x] (i.e. positive value).  
     *    
     */
    function absi(x: int64): int64
    
    /** Returns the same type of [Variant] as [param x], with `-1` for negative values, `1` for positive values, and `0` for zeros. For `nan` values it returns 0.  
     *  Supported types: [int], [float], [Vector2], [Vector2i], [Vector3], [Vector3i], [Vector4], [Vector4i].  
     *    
     *      
     *  **Note:** For better type safety, use [method signf], [method signi], [method Vector2.sign], [method Vector2i.sign], [method Vector3.sign], [method Vector3i.sign], [method Vector4.sign], or [method Vector4i.sign].  
     */
    function sign(x: any): any
    
    /** Returns `-1.0` if [param x] is negative, `1.0` if [param x] is positive, and `0.0` if [param x] is zero. For `nan` values of [param x] it returns 0.0.  
     *    
     */
    function signf(x: float64): float64
    
    /** Returns `-1` if [param x] is negative, `1` if [param x] is positive, and `0` if [param x] is zero.  
     *    
     */
    function signi(x: int64): int64
    
    /** Returns the multiple of [param step] that is the closest to [param x]. This can also be used to round a floating-point number to an arbitrary number of decimals.  
     *  The returned value is the same type of [Variant] as [param step]. Supported types: [int], [float], [Vector2], [Vector2i], [Vector3], [Vector3i], [Vector4], [Vector4i].  
     *    
     *  See also [method ceil], [method floor], and [method round].  
     *      
     *  **Note:** For better type safety, use [method snappedf], [method snappedi], [method Vector2.snapped], [method Vector2i.snapped], [method Vector3.snapped], [method Vector3i.snapped], [method Vector4.snapped], or [method Vector4i.snapped].  
     */
    function snapped(x: any, step: any): any
    
    /** Returns the multiple of [param step] that is the closest to [param x]. This can also be used to round a floating-point number to an arbitrary number of decimals.  
     *  A type-safe version of [method snapped], returning a [float].  
     *    
     */
    function snappedf(x: float64, step: float64): float64
    
    /** Returns the multiple of [param step] that is the closest to [param x].  
     *  A type-safe version of [method snapped], returning an [int].  
     *    
     */
    function snappedi(x: float64, step: int64): int64
    
    /** Returns the result of [param base] raised to the power of [param exp].  
     *  In GDScript, this is the equivalent of the `**` operator.  
     *    
     */
    function pow(base: float64, exp: float64): float64
    
    /** Returns the [url=https://en.wikipedia.org/wiki/Natural_logarithm]natural logarithm[/url] of [param x] (base [url=https://en.wikipedia.org/wiki/E_(mathematical_constant)] *e* [/url], with  *e*  being approximately 2.71828). This is the amount of time needed to reach a certain level of continuous growth.  
     *      
     *  **Note:** This is not the same as the "log" function on most calculators, which uses a base 10 logarithm. To use base 10 logarithm, use `log(x) / log(10)`.  
     *    
     *      
     *  **Note:** The logarithm of `0` returns `-inf`, while negative values return `-nan`.  
     */
    function log(x: float64): float64
    
    /** The natural exponential function. It raises the mathematical constant  *e*  to the power of [param x] and returns it.  
     *   *e*  has an approximate value of 2.71828, and can be obtained with `exp(1)`.  
     *  For exponents to other bases use the method [method pow].  
     *    
     */
    function exp(x: float64): float64
    
    /** Returns `true` if [param x] is a NaN ("Not a Number" or invalid) value. This method is needed as [constant @GDScript.NAN] is not equal to itself, which means `x == NAN` can't be used to check whether a value is a NaN. */
    function is_nan(x: float64): boolean
    
    /** Returns `true` if [param x] is either positive infinity or negative infinity. See also [method is_finite] and [method is_nan]. */
    function is_inf(x: float64): boolean
    
    /** Returns `true` if [param a] and [param b] are approximately equal to each other.  
     *  Here, "approximately equal" means that [param a] and [param b] are within a small internal epsilon of each other, which scales with the magnitude of the numbers.  
     *  Infinity values of the same sign are considered equal.  
     */
    function is_equal_approx(a: float64, b: float64): boolean
    
    /** Returns `true` if [param x] is zero or almost zero. The comparison is done using a tolerance calculation with a small internal epsilon.  
     *  This function is faster than using [method is_equal_approx] with one value as zero.  
     */
    function is_zero_approx(x: float64): boolean
    
    /** Returns whether [param x] is a finite value, i.e. it is not [constant @GDScript.NAN], positive infinity, or negative infinity. See also [method is_inf] and [method is_nan]. */
    function is_finite(x: float64): boolean
    
    /** Returns an "eased" value of [param x] based on an easing function defined with [param curve]. This easing function is based on an exponent. The [param curve] can be any floating-point number, with specific values leading to the following behaviors:  
     *  [codeblock lang=text]  
     *  - Lower than -1.0 (exclusive): Ease in-out  
     *  - -1.0: Linear  
     *  - Between -1.0 and 0.0 (exclusive): Ease out-in  
     *  - 0.0: Constant  
     *  - Between 0.0 to 1.0 (exclusive): Ease out  
     *  - 1.0: Linear  
     *  - Greater than 1.0 (exclusive): Ease in  
     *  [/codeblock]  
     *  [url=https://raw.githubusercontent.com/godotengine/godot-docs/master/img/ease_cheatsheet.png]ease() curve values cheatsheet[/url]  
     *  See also [method smoothstep]. If you need to perform more advanced transitions, use [method Tween.interpolate_value].  
     */
    function ease(x: float64, curve: float64): float64
    
    /** Returns the position of the first non-zero digit, after the decimal point. Note that the maximum return value is 10, which is a design decision in the implementation.  
     *    
     */
    function step_decimals(x: float64): int64
    
    /** Linearly interpolates between two values by the factor defined in [param weight]. To perform interpolation, [param weight] should be between `0.0` and `1.0` (inclusive). However, values outside this range are allowed and can be used to perform  *extrapolation* . If this is not desired, use [method clampf] to limit [param weight].  
     *  Both [param from] and [param to] must be the same type. Supported types: [int], [float], [Vector2], [Vector3], [Vector4], [Color], [Quaternion], [Basis], [Transform2D], [Transform3D].  
     *    
     *  See also [method inverse_lerp] which performs the reverse of this operation. To perform eased interpolation with [method lerp], combine it with [method ease] or [method smoothstep]. See also [method remap] to map a continuous series of values to another.  
     *      
     *  **Note:** For better type safety, use [method lerpf], [method Vector2.lerp], [method Vector3.lerp], [method Vector4.lerp], [method Color.lerp], [method Quaternion.slerp], [method Basis.slerp], [method Transform2D.interpolate_with], or [method Transform3D.interpolate_with].  
     */
    function lerp(from: any, to: any, weight: any): any
    
    /** Linearly interpolates between two values by the factor defined in [param weight]. To perform interpolation, [param weight] should be between `0.0` and `1.0` (inclusive). However, values outside this range are allowed and can be used to perform  *extrapolation* . If this is not desired, use [method clampf] on the result of this function.  
     *    
     *  See also [method inverse_lerp] which performs the reverse of this operation. To perform eased interpolation with [method lerp], combine it with [method ease] or [method smoothstep].  
     */
    function lerpf(from: float64, to: float64, weight: float64): float64
    
    /** Cubic interpolates between two values by the factor defined in [param weight] with [param pre] and [param post] values. */
    function cubic_interpolate(from: float64, to: float64, pre: float64, post: float64, weight: float64): float64
    
    /** Cubic interpolates between two rotation values with shortest path by the factor defined in [param weight] with [param pre] and [param post] values. See also [method lerp_angle]. */
    function cubic_interpolate_angle(from: float64, to: float64, pre: float64, post: float64, weight: float64): float64
    
    /** Cubic interpolates between two values by the factor defined in [param weight] with [param pre] and [param post] values.  
     *  It can perform smoother interpolation than [method cubic_interpolate] by the time values.  
     */
    function cubic_interpolate_in_time(from: float64, to: float64, pre: float64, post: float64, weight: float64, to_t: float64, pre_t: float64, post_t: float64): float64
    
    /** Cubic interpolates between two rotation values with shortest path by the factor defined in [param weight] with [param pre] and [param post] values. See also [method lerp_angle].  
     *  It can perform smoother interpolation than [method cubic_interpolate] by the time values.  
     */
    function cubic_interpolate_angle_in_time(from: float64, to: float64, pre: float64, post: float64, weight: float64, to_t: float64, pre_t: float64, post_t: float64): float64
    
    /** Returns the point at the given [param t] on a one-dimensional [url=https://en.wikipedia.org/wiki/B%C3%A9zier_curve]Bézier curve[/url] defined by the given [param control_1], [param control_2], and [param end] points. */
    function bezier_interpolate(start: float64, control_1: float64, control_2: float64, end: float64, t: float64): float64
    
    /** Returns the derivative at the given [param t] on a one-dimensional [url=https://en.wikipedia.org/wiki/B%C3%A9zier_curve]Bézier curve[/url] defined by the given [param control_1], [param control_2], and [param end] points. */
    function bezier_derivative(start: float64, control_1: float64, control_2: float64, end: float64, t: float64): float64
    
    /** Returns the difference between the two angles (in radians), in the range of `[-PI, +PI]`. When [param from] and [param to] are opposite, returns `-PI` if [param from] is smaller than [param to], or `PI` otherwise. */
    function angle_difference(from: float64, to: float64): float64
    
    /** Linearly interpolates between two angles (in radians) by a [param weight] value between 0.0 and 1.0.  
     *  Similar to [method lerp], but interpolates correctly when the angles wrap around [constant @GDScript.TAU]. To perform eased interpolation with [method lerp_angle], combine it with [method ease] or [method smoothstep].  
     *    
     *      
     *  **Note:** This function lerps through the shortest path between [param from] and [param to]. However, when these two angles are approximately `PI + k * TAU` apart for any integer `k`, it's not obvious which way they lerp due to floating-point precision errors. For example, `lerp_angle(0, PI, weight)` lerps counter-clockwise, while `lerp_angle(0, PI + 5 * TAU, weight)` lerps clockwise.  
     */
    function lerp_angle(from: float64, to: float64, weight: float64): float64
    
    /** Returns an interpolation or extrapolation factor considering the range specified in [param from] and [param to], and the interpolated value specified in [param weight]. The returned value will be between `0.0` and `1.0` if [param weight] is between [param from] and [param to] (inclusive). If [param weight] is located outside this range, then an extrapolation factor will be returned (return value lower than `0.0` or greater than `1.0`). Use [method clamp] on the result of [method inverse_lerp] if this is not desired.  
     *    
     *  See also [method lerp], which performs the reverse of this operation, and [method remap] to map a continuous series of values to another.  
     */
    function inverse_lerp(from: float64, to: float64, weight: float64): float64
    
    /** Maps a [param value] from range `[istart, istop]` to `[ostart, ostop]`. See also [method lerp] and [method inverse_lerp]. If [param value] is outside `[istart, istop]`, then the resulting value will also be outside `[ostart, ostop]`. If this is not desired, use [method clamp] on the result of this function.  
     *    
     *  For complex use cases where multiple ranges are needed, consider using [Curve] or [Gradient] instead.  
     *      
     *  **Note:** If `istart == istop`, the return value is undefined (most likely NaN, INF, or -INF).  
     */
    function remap(value: float64, istart: float64, istop: float64, ostart: float64, ostop: float64): float64
    
    /** Returns a smooth cubic Hermite interpolation between `0` and `1`.  
     *  For positive ranges (when `from <= to`) the return value is `0` when `x <= from`, and `1` when `x >= to`. If [param x] lies between [param from] and [param to], the return value follows an S-shaped curve that smoothly transitions from `0` to `1`.  
     *  For negative ranges (when `from > to`) the function is mirrored and returns `1` when `x <= to` and `0` when `x >= from`.  
     *  This S-shaped curve is the cubic Hermite interpolator, given by `f(y) = 3*y^2 - 2*y^3` where `y = (x-from) / (to-from)`.  
     *    
     *  Compared to [method ease] with a curve value of `-1.6521`, [method smoothstep] returns the smoothest possible curve with no sudden changes in the derivative. If you need to perform more advanced transitions, use [Tween] or [AnimationPlayer].  
     *  [url=https://raw.githubusercontent.com/godotengine/godot-docs/master/img/smoothstep_ease_comparison.png]Comparison between smoothstep() and ease(x, -1.6521) return values[/url]  
     *  [url=https://raw.githubusercontent.com/godotengine/godot-docs/master/img/smoothstep_range.webp]Smoothstep() return values with positive, zero, and negative ranges[/url]  
     */
    function smoothstep(from: float64, to: float64, x: float64): float64
    
    /** Moves [param from] toward [param to] by the [param delta] amount. Will not go past [param to].  
     *  Use a negative [param delta] value to move away.  
     *    
     */
    function move_toward(from: float64, to: float64, delta: float64): float64
    
    /** Rotates [param from] toward [param to] by the [param delta] amount. Will not go past [param to].  
     *  Similar to [method move_toward], but interpolates correctly when the angles wrap around [constant @GDScript.TAU].  
     *  If [param delta] is negative, this function will rotate away from [param to], toward the opposite angle, and will not go past the opposite angle.  
     */
    function rotate_toward(from: float64, to: float64, delta: float64): float64
    
    /** Converts an angle expressed in degrees to radians.  
     *    
     */
    function deg_to_rad(deg: float64): float64
    
    /** Converts an angle expressed in radians to degrees.  
     *    
     */
    function rad_to_deg(rad: float64): float64
    
    /** Converts from linear energy to decibels (audio). Since volume is not normally linear, this can be used to implement volume sliders that behave as expected.  
     *  **Example:** Change the Master bus's volume through a [Slider] node, which ranges from `0.0` to `1.0`:  
     *    
     */
    function linear_to_db(lin: float64): float64
    
    /** Converts from decibels to linear energy (audio). */
    function db_to_linear(db: float64): float64
    
    /** Wraps the [Variant] [param value] between [param min] and [param max]. [param min] is  *inclusive*  while [param max] is  *exclusive* . This can be used for creating loop-like behavior or infinite surfaces.  
     *  Variant types [int] and [float] are supported. If any of the arguments is [float], this function returns a [float], otherwise it returns an [int].  
     *    
     */
    function wrap(value: any, min: any, max: any): any
    
    /** Wraps the integer [param value] between [param min] and [param max]. [param min] is  *inclusive*  while [param max] is  *exclusive* . This can be used for creating loop-like behavior or infinite surfaces.  
     *    
     *    
     */
    function wrapi(value: int64, min: int64, max: int64): int64
    
    /** Wraps the float [param value] between [param min] and [param max]. [param min] is  *inclusive*  while [param max] is  *exclusive* . This can be used for creating loop-like behavior or infinite surfaces.  
     *    
     *    
     *    
     *      
     *  **Note:** If [param min] is `0`, this is equivalent to [method fposmod], so prefer using that instead. [method wrapf] is more flexible than using the [method fposmod] approach by giving the user control over the minimum value.  
     */
    function wrapf(value: float64, min: float64, max: float64): float64
    
    /** Returns the maximum of the given numeric values. This function can take any number of arguments.  
     *    
     *      
     *  **Note:** When using this on vectors it will  *not*  perform component-wise maximum, and will pick the largest value when compared using `x < y`. To perform component-wise maximum, use [method Vector2.max], [method Vector2i.max], [method Vector3.max], [method Vector3i.max], [method Vector4.max], and [method Vector4i.max].  
     */
    function max(...varargs: any[]): any
    
    /** Returns the maximum of two [int] values.  
     *    
     */
    function maxi(a: int64, b: int64): int64
    
    /** Returns the maximum of two [float] values.  
     *    
     */
    function maxf(a: float64, b: float64): float64
    
    /** Returns the minimum of the given numeric values. This function can take any number of arguments.  
     *    
     *      
     *  **Note:** When using this on vectors it will  *not*  perform component-wise minimum, and will pick the smallest value when compared using `x < y`. To perform component-wise minimum, use [method Vector2.min], [method Vector2i.min], [method Vector3.min], [method Vector3i.min], [method Vector4.min], and [method Vector4i.min].  
     */
    function min(...varargs: any[]): any
    
    /** Returns the minimum of two [int] values.  
     *    
     */
    function mini(a: int64, b: int64): int64
    
    /** Returns the minimum of two [float] values.  
     *    
     */
    function minf(a: float64, b: float64): float64
    
    /** Clamps the [param value], returning a [Variant] not less than [param min] and not more than [param max]. Any values that can be compared with the less than and greater than operators will work.  
     *    
     *      
     *  **Note:** For better type safety, use [method clampf], [method clampi], [method Vector2.clamp], [method Vector2i.clamp], [method Vector3.clamp], [method Vector3i.clamp], [method Vector4.clamp], [method Vector4i.clamp], or [method Color.clamp] (not currently supported by this method).  
     *      
     *  **Note:** When using this on vectors it will  *not*  perform component-wise clamping, and will pick [param min] if `value < min` or [param max] if `value > max`. To perform component-wise clamping use the methods listed above.  
     */
    function clamp(value: any, min: any, max: any): any
    
    /** Clamps the [param value], returning an [int] not less than [param min] and not more than [param max].  
     *    
     */
    function clampi(value: int64, min: int64, max: int64): int64
    
    /** Clamps the [param value], returning a [float] not less than [param min] and not more than [param max].  
     *    
     */
    function clampf(value: float64, min: float64, max: float64): float64
    
    /** Returns the smallest integer power of 2 that is greater than or equal to [param value].  
     *    
     *  **Warning:** Due to its implementation, this method returns `0` rather than `1` for values less than or equal to `0`, with an exception for [param value] being the smallest negative 64-bit integer (`-9223372036854775808`) in which case the [param value] is returned unchanged.  
     */
    function nearest_po2(value: int64): int64
    
    /** Wraps [param value] between `0` and the [param length]. If the limit is reached, the next value the function returns is decreased to the `0` side or increased to the [param length] side (like a triangle wave). If [param length] is less than zero, it becomes positive.  
     *    
     */
    function pingpong(value: float64, length: float64): float64
    
    /** Randomizes the seed (or the internal state) of the random number generator. The current implementation uses a number based on the device's time.  
     *      
     *  **Note:** This function is called automatically when the project is run. If you need to fix the seed to have consistent, reproducible results, use [method seed] to initialize the random number generator.  
     */
    function randomize(): void
    
    /** Returns a random unsigned 32-bit integer. Use remainder to obtain a random value in the interval `[0, N - 1]` (where N is smaller than 2^32).  
     *    
     */
    function randi(): int64
    
    /** Returns a random floating-point value between `0.0` and `1.0` (inclusive).  
     *    
     */
    function randf(): float64
    
    /** Returns a random signed 32-bit integer between [param from] and [param to] (inclusive). If [param to] is lesser than [param from], they are swapped.  
     *    
     */
    function randi_range(from: int64, to: int64): int64
    
    /** Returns a random floating-point value between [param from] and [param to] (inclusive).  
     *    
     */
    function randf_range(from: float64, to: float64): float64
    
    /** Returns a [url=https://en.wikipedia.org/wiki/Normal_distribution]normally-distributed[/url], pseudo-random floating-point value from the specified [param mean] and a standard [param deviation]. This is also known as a Gaussian distribution.  
     *      
     *  **Note:** This method uses the [url=https://en.wikipedia.org/wiki/Box%E2%80%93Muller_transform]Box-Muller transform[/url] algorithm.  
     */
    function randfn(mean: float64, deviation: float64): float64
    
    /** Sets the seed for the random number generator to [param base]. Setting the seed manually can ensure consistent, repeatable results for most random functions.  
     *    
     */
    function seed(base: int64): void
    
    /** Given a [param seed], returns a [PackedInt64Array] of size `2`, where its first element is the randomized [int] value, and the second element is the same as [param seed]. Passing the same [param seed] consistently returns the same array.  
     *      
     *  **Note:** "Seed" here refers to the internal state of the pseudo random number generator, currently implemented as a 64 bit integer.  
     *    
     */
    function rand_from_seed(seed: int64): PackedInt64Array
    
    /** Returns a [WeakRef] instance holding a weak reference to [param obj]. Returns an empty [WeakRef] instance if [param obj] is `null`. Prints an error and returns `null` if [param obj] is neither [Object]-derived nor `null`.  
     *  A weak reference to an object is not enough to keep the object alive: when the only remaining references to a referent are weak references, garbage collection is free to destroy the referent and reuse its memory for something else. However, until the object is actually destroyed the weak reference may return the object even if there are no strong references to it.  
     */
    function weakref(obj: any): any
    
    /** Returns the internal type of the given [param variable], using the [enum Variant.Type] values.  
     *    
     *  See also [method type_string].  
     */
    function godot_typeof(variable: any): int64
    
    /** Converts the given [param variant] to the given [param type], using the [enum Variant.Type] values. This method is generous with how it handles types, it can automatically convert between array types, convert numeric [String]s to [int], and converting most things to [String].  
     *  If the type conversion cannot be done, this method will return the default value for that type, for example converting [Rect2] to [Vector2] will always return [constant Vector2.ZERO]. This method will never show error messages as long as [param type] is a valid Variant type.  
     *  The returned value is a [Variant], but the data inside and its type will be the same as the requested type.  
     *    
     */
    function type_convert(variant: any, type: int64): any
    
    /** Converts one or more arguments of any [Variant] type to a [String] in the best way possible.  
     *    
     */
    function str(...varargs: any[]): string
    
    /** Returns a human-readable name for the given [enum Error] code.  
     *    
     */
    function error_string(error: int64): string
    
    /** Returns a human-readable name of the given [param type], using the [enum Variant.Type] values.  
     *    
     *  See also [method typeof].  
     */
    function type_string(type: int64): string
    
    /** Converts one or more arguments of any type to string in the best way possible and prints them to the console.  
     *    
     *      
     *  **Note:** Consider using [method push_error] and [method push_warning] to print error and warning messages instead of [method print] or [method print_rich]. This distinguishes them from print messages used for debugging purposes, while also displaying a stack trace when an error or warning is printed. See also [member Engine.print_to_stdout] and [member ProjectSettings.application/run/disable_stdout].  
     */
    function print(...varargs: any[]): void
    
    /** Converts one or more arguments of any type to string in the best way possible and prints them to the console.  
     *  The following BBCode tags are supported: `b`, `i`, `u`, `s`, `indent`, `code`, `url`, `center`, `right`, `color`, `bgcolor`, `fgcolor`.  
     *  URL tags only support URLs wrapped by a URL tag, not URLs with a different title.  
     *  When printing to standard output, the supported subset of BBCode is converted to ANSI escape codes for the terminal emulator to display. Support for ANSI escape codes varies across terminal emulators, especially for italic and strikethrough. In standard output, `code` is represented with faint text but without any font change. Unsupported tags are left as-is in standard output.  
     *    
     *      
     *  **Note:** Consider using [method push_error] and [method push_warning] to print error and warning messages instead of [method print] or [method print_rich]. This distinguishes them from print messages used for debugging purposes, while also displaying a stack trace when an error or warning is printed.  
     *      
     *  **Note:** Output displayed in the editor supports clickable [code skip-lint][url=address]text[/url]` tags. The [code skip-lint][url]` tag's `address` value is handled by [method OS.shell_open] when clicked.  
     */
    function print_rich(...varargs: any[]): void
    
    /** Prints one or more arguments to strings in the best way possible to standard error line.  
     *    
     */
    function printerr(...varargs: any[]): void
    
    /** Prints one or more arguments to the console with a tab between each argument.  
     *    
     */
    function printt(...varargs: any[]): void
    
    /** Prints one or more arguments to the console with a space between each argument.  
     *    
     */
    function prints(...varargs: any[]): void
    
    /** Prints one or more arguments to strings in the best way possible to the OS terminal. Unlike [method print], no newline is automatically added at the end.  
     *      
     *  **Note:** The OS terminal is  *not*  the same as the editor's Output dock. The output sent to the OS terminal can be seen when running Godot from a terminal. On Windows, this requires using the `console.exe` executable.  
     *    
     */
    function printraw(...varargs: any[]): void
    
    /** If verbose mode is enabled ([method OS.is_stdout_verbose] returning `true`), converts one or more arguments of any type to string in the best way possible and prints them to the console. */
    function print_verbose(...varargs: any[]): void
    
    /** Pushes an error message to Godot's built-in debugger and to the OS terminal.  
     *    
     *      
     *  **Note:** This function does not pause project execution. To print an error message and pause project execution in debug builds, use `assert(false, "test error")` instead.  
     */
    function push_error(...varargs: any[]): void
    
    /** Pushes a warning message to Godot's built-in debugger and to the OS terminal.  
     *    
     */
    function push_warning(...varargs: any[]): void
    
    /** Converts a [Variant] [param variable] to a formatted [String] that can then be parsed using [method str_to_var].  
     *    
     *  Prints:  
     *  [codeblock lang=text]  
     *  {  
     *  	"a": 1,  
     *  	"b": 2  
     *  }  
     *  [/codeblock]  
     *      
     *  **Note:** Converting [Signal] or [Callable] is not supported and will result in an empty value for these types, regardless of their data.  
     */
    function var_to_str(variable: any): string
    
    /** Converts a formatted [param string] that was returned by [method var_to_str] to the original [Variant].  
     *    
     */
    function str_to_var(string_: string): any
    
    /** Encodes a [Variant] value to a byte array, without encoding objects. Deserialization can be done with [method bytes_to_var].  
     *      
     *  **Note:** If you need object serialization, see [method var_to_bytes_with_objects].  
     *      
     *  **Note:** Encoding [Callable] is not supported and will result in an empty value, regardless of the data.  
     */
    function var_to_bytes(variable: any): PackedByteArray
    
    /** Decodes a byte array back to a [Variant] value, without decoding objects.  
     *      
     *  **Note:** If you need object deserialization, see [method bytes_to_var_with_objects].  
     */
    function bytes_to_var(bytes: PackedByteArray | byte[] | ArrayBuffer): any
    
    /** Encodes a [Variant] value to a byte array. Encoding objects is allowed (and can potentially include executable code). Deserialization can be done with [method bytes_to_var_with_objects].  
     *      
     *  **Note:** Encoding [Callable] is not supported and will result in an empty value, regardless of the data.  
     */
    function var_to_bytes_with_objects(variable: any): PackedByteArray
    
    /** Decodes a byte array back to a [Variant] value. Decoding objects is allowed.  
     *  **Warning:** Deserialized object can contain code which gets executed. Do not use this option if the serialized object comes from untrusted sources to avoid potential security threats (remote code execution).  
     */
    function bytes_to_var_with_objects(bytes: PackedByteArray | byte[] | ArrayBuffer): any
    
    /** Returns the integer hash of the passed [param variable].  
     *    
     */
    function hash(variable: any): int64
    
    /** Returns the [Object] that corresponds to [param instance_id]. All Objects have a unique instance ID. See also [method Object.get_instance_id].  
     *    
     */
    function instance_from_id(instance_id: int64): null | Object
    
    /** Returns `true` if the Object that corresponds to [param id] is a valid object (e.g. has not been deleted from memory). All Objects have a unique instance ID. */
    function is_instance_id_valid(id: int64): boolean
    
    /** Returns `true` if [param instance] is a valid Object (e.g. has not been deleted from memory). */
    function is_instance_valid(instance: any): boolean
    
    /** Allocates a unique ID which can be used by the implementation to construct an RID. This is used mainly from native extensions to implement servers. */
    function rid_allocate_id(): int64
    
    /** Creates an RID from a [param base]. This is used mainly from native extensions to build servers. */
    function rid_from_int64(base: int64): RID
    
    /** Returns `true`, for value types, if [param a] and [param b] share the same value. Returns `true`, for reference types, if the references of [param a] and [param b] are the same.  
     *    
     *  These are [Variant] value types: `null`, [bool], [int], [float], [String], [StringName], [Vector2], [Vector2i], [Vector3], [Vector3i], [Vector4], [Vector4i], [Rect2], [Rect2i], [Transform2D], [Transform3D], [Plane], [Quaternion], [AABB], [Basis], [Projection], [Color], [NodePath], [RID], [Callable] and [Signal].  
     *  These are [Variant] reference types: [Object], [Dictionary], [Array], [PackedByteArray], [PackedInt32Array], [PackedInt64Array], [PackedFloat32Array], [PackedFloat64Array], [PackedStringArray], [PackedVector2Array], [PackedVector3Array], [PackedVector4Array], and [PackedColorArray].  
     */
    function is_same(a: any, b: any): boolean
    
    /** shorthand for getting project settings */
    function GLOBAL_GET(entry_path: StringName): any
    
    /** shorthand for getting editor settings  
     *  NOTE: calling before EditorSettings created will cause null reference exception.  
     */
    function EDITOR_GET(entry_path: StringName): any
}
