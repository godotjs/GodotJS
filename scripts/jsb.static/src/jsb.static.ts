// NOT IMPLEMENTED
// JS implementation of essential primitive types with least binding code

//interface Vector2 { x: number; y: number; }
class Vector2 {
    x = 0;
    y = 0;
    constructor(x?: number, y?: number) {}
}
interface Vector3i {
    x: number;
    y: number;
    z: number;
}

const UNIT_EPSILON = 0.001;
const CMP_EPSILON = 0.00001;

enum __Axis {
    AXIS_X = 0,
    AXIS_Y = 1,
    AXIS_Z = 2,
}

function CLAMP(m_a: number, m_min: number, m_max: number) {
    return m_a < m_min ? m_min : m_a > m_max ? m_max : m_a;
}

function fposmod(p_x: number, p_y: number) {
    let value = p_x % p_y;
    if ((value < 0 && p_y > 0) || (value > 0 && p_y < 0)) {
        value += p_y;
    }
    value += 0.0;
    return value;
}

function lerp(p_from: number, p_to: number, p_weight: number) {
    return p_from + (p_to - p_from) * p_weight;
}

function snapped(p_value: number, p_step: number) {
    if (p_step != 0) {
        p_value = Math.floor(p_value / p_step + 0.5) * p_step;
    }
    return p_value;
}

function is_zero_approx(s: number) {
    return Math.abs(s) < CMP_EPSILON;
}

function is_equal_approx(a: number, b: number, tolerance?: number): boolean {
    if (a == b) return true;
    if (typeof tolerance !== "number") {
        tolerance = CMP_EPSILON * Math.abs(a);
        if (tolerance < CMP_EPSILON) {
            tolerance = CMP_EPSILON;
        }
    }
    return Math.abs(a - b) < tolerance;
}

export class Vector3 {
    static Axis = __Axis;

    x: number;
    y: number;
    z: number;

    /** Zero vector, a vector with all components set to `0`. */
    static get ZERO(): Vector3 {
        return new Vector3();
    }

    /** One vector, a vector with all components set to `1`. */
    static get ONE(): Vector3 {
        return new Vector3(1, 1, 1);
    }

    /** Infinity vector, a vector with all components set to [constant @GDScript.INF]. */
    static get INF(): Vector3 {
        return new Vector3(Infinity, Infinity, Infinity);
    }

    /** Left unit vector. Represents the local direction of left, and the global direction of west. */
    static get LEFT(): Vector3 {
        return new Vector3(-1, 0, 0);
    }

    /** Right unit vector. Represents the local direction of right, and the global direction of east. */
    static get RIGHT(): Vector3 {
        return new Vector3(1, 0, 0);
    }

    /** Up unit vector. */
    static get UP(): Vector3 {
        return new Vector3(0, 1, 0);
    }

    /** Down unit vector. */
    static get DOWN(): Vector3 {
        return new Vector3(0, -1, 0);
    }

    /** Forward unit vector. Represents the local direction of forward, and the global direction of north. Keep in mind that the forward direction for lights, cameras, etc is different from 3D assets like characters, which face towards the camera by convention. Use [constant Vector3.MODEL_FRONT] and similar constants when working in 3D asset space. */
    static get FORWARD(): Vector3 {
        return new Vector3(0, 0, -1);
    }

    /** Back unit vector. Represents the local direction of back, and the global direction of south. */
    static get BACK(): Vector3 {
        return new Vector3(0, 0, 1);
    }

    /** Unit vector pointing towards the left side of imported 3D assets. */
    static get MODEL_LEFT(): Vector3 {
        return new Vector3(1, 0, 0);
    }

    /** Unit vector pointing towards the right side of imported 3D assets. */
    static get MODEL_RIGHT(): Vector3 {
        return new Vector3(-1, 0, 0);
    }

    /** Unit vector pointing towards the top side (up) of imported 3D assets. */
    static get MODEL_TOP(): Vector3 {
        return new Vector3(0, 1, 0);
    }

    /** Unit vector pointing towards the bottom side (down) of imported 3D assets. */
    static get MODEL_BOTTOM(): Vector3 {
        return new Vector3(0, -1, 0);
    }

    /** Unit vector pointing towards the front side (facing forward) of imported 3D assets. */
    static get MODEL_FRONT(): Vector3 {
        return new Vector3(0, 0, 1);
    }

    /** Unit vector pointing towards the rear side (back) of imported 3D assets. */
    static get MODEL_REAR(): Vector3 {
        return new Vector3(0, 0, -1);
    }

    constructor();
    constructor(from: Vector3 | Vector3i);
    constructor(x: number, y: number, z: number);
    constructor(vt?: any, y?: number, z?: number) {
        const len = arguments.length;
        if (len == 0) {
            this.x = this.y = this.z = 0;
        } else if (len == 1) {
            this.x = vt.x;
            this.y = vt.y;
            this.z = vt.z;
        } else {
            this.x = vt;
            this.y = y!;
            this.z = z!;
        }
    }

    set_indexed(index: number, value: number) {
        if (index == 0) this.x = value;
        else if (index == 1) this.y = value;
        else this.z = value;
    }
    get_indexed(index: number): number {
        if (index == 0) return this.x;
        else if (index == 1) return this.y;
        else return this.z;
    }

    /** Returns the axis of the vector's lowest value. See `AXIS_*` constants. If all components are equal, this method returns [constant AXIS_Z]. */
    min_axis_index(): __Axis {
        return this.x < this.y
            ? this.x < this.z
                ? __Axis.AXIS_X
                : __Axis.AXIS_Z
            : this.y < this.z
              ? __Axis.AXIS_Y
              : __Axis.AXIS_Z;
    }

    /** Returns the axis of the vector's highest value. See `AXIS_*` constants. If all components are equal, this method returns [constant AXIS_X]. */
    max_axis_index(): __Axis {
        return this.x < this.y
            ? this.y < this.z
                ? __Axis.AXIS_Z
                : __Axis.AXIS_Y
            : this.x < this.z
              ? __Axis.AXIS_Z
              : __Axis.AXIS_X;
    }

    /** Returns the unsigned minimum angle to the given vector, in radians. */
    angle_to(to: Vector3): number {
        return Math.atan2(this.cross(to).length(), this.dot(to));
    }

    /** Returns the signed angle to the given vector, in radians. The sign of the angle is positive in a counter-clockwise direction and negative in a clockwise direction when viewed from the side specified by the [param axis]. */
    signed_angle_to(to: Vector3, axis: Vector3): number {
        let cross_to = this.cross(to);
        let unsigned_angle = Math.atan2(cross_to.length(), this.dot(to));
        let sign = cross_to.dot(axis);
        return sign < 0 ? -unsigned_angle : unsigned_angle;
    }

    /** Returns the normalized vector pointing from this vector to [param to]. This is equivalent to using `(b - a).normalized()`. */
    direction_to(to: Vector3): Vector3 {
        let ret = new Vector3(to.x - this.x, to.y - this.y, to.z - this.z);
        ret.normalize();
        return ret;
    }

    /** Returns the distance between this vector and [param to]. */
    distance_to(to: Vector3): number {
        const dx = to.x - this.x;
        const dy = to.y - this.y;
        const dz = to.z - this.z;
        return Math.sqrt(dx * dx + dy * dy + dz * dz);
    }

    /** Returns the squared distance between this vector and [param to].
     *  This method runs faster than [method distance_to], so prefer it if you need to compare vectors or need the squared distance for some formula.
     */
    distance_squared_to(to: Vector3): number {
        const dx = to.x - this.x;
        const dy = to.y - this.y;
        const dz = to.z - this.z;
        return dx * dx + dy * dy + dz * dz;
    }

    /** Returns the length (magnitude) of this vector. */
    length(): number {
        const x = this.x;
        const y = this.y;
        const z = this.z;
        return Math.sqrt(x * x + y * y + z * z);
    }

    /** Returns the squared length (squared magnitude) of this vector.
     *  This method runs faster than [method length], so prefer it if you need to compare vectors or need the squared distance for some formula.
     */
    length_squared(): number {
        const x = this.x;
        const y = this.y;
        const z = this.z;
        return x * x + y * y + z * z;
    }

    /** Returns the vector with a maximum length by limiting its length to [param length]. */
    limit_length(p_len: number = 1): Vector3 {
        const l = this.length();
        let v = new Vector3(this);
        if (l > 0 && p_len < l) {
            v.x /= l;
            v.y /= l;
            v.z /= l;
            v.x *= p_len;
            v.y *= p_len;
            v.z *= p_len;
        }
        return v;
    }

    /** Returns the result of scaling the vector to unit length. Equivalent to `v / v.length()`. Returns `(0, 0, 0)` if `v.length() == 0`. See also [method is_normalized].
     *
     *  **Note:** This function may return incorrect values if the input vector length is near zero.
     */
    normalized(): Vector3 {
        let v = new Vector3(this);
        v.normalize();
        return v;
    }

    normalize(): void {
        let lengthsq = this.length_squared();
        if (lengthsq == 0) {
            this.x = this.y = this.z = 0;
        } else {
            let length = Math.sqrt(lengthsq);
            this.x /= length;
            this.y /= length;
            this.z /= length;
        }
    }

    /** Returns `true` if the vector is normalized, i.e. its length is approximately equal to 1. */
    is_normalized(): boolean {
        const len_sq = this.length_squared();
        if (len_sq == 1) return true;
        return is_equal_approx(len_sq, 1, UNIT_EPSILON);
    }

    /** Returns `true` if this vector and [param to] are approximately equal, by running [method @GlobalScope.is_equal_approx] on each component. */
    is_equal_approx(to: Vector3): boolean {
        return is_equal_approx(this.x, to.x) && is_equal_approx(this.y, to.y) && is_equal_approx(this.z, to.z);
    }

    /** Returns `true` if this vector's values are approximately zero, by running [method @GlobalScope.is_zero_approx] on each component.
     *  This method is faster than using [method is_equal_approx] with one value as a zero vector.
     */
    is_zero_approx(): boolean {
        return is_zero_approx(this.x) && is_zero_approx(this.y) && is_zero_approx(this.z);
    }

    /** Returns `true` if this vector is finite, by calling [method @GlobalScope.is_finite] on each component. */
    is_finite(): boolean {
        return Number.isFinite(this.x) && Number.isFinite(this.y) && Number.isFinite(this.z);
    }

    /** Returns the inverse of the vector. This is the same as `Vector3(1.0 / v.x, 1.0 / v.y, 1.0 / v.z)`. */
    inverse(): Vector3 {
        return new Vector3(1.0 / this.x, 1.0 / this.y, 1.0 / this.z);
    }

    /** Returns a new vector with all components clamped between the components of [param min] and [param max], by running [method @GlobalScope.clamp] on each component. */
    clamp(min: Vector3, max: Vector3): Vector3 {
        return new Vector3(CLAMP(this.x, min.x, max.x), CLAMP(this.y, min.y, max.y), CLAMP(this.z, min.z, max.z));
    }

    /** Returns a new vector with all components clamped between [param min] and [param max], by running [method @GlobalScope.clamp] on each component. */
    clampf(min: number, max: number): Vector3 {
        return new Vector3(CLAMP(this.x, min, max), CLAMP(this.y, min, max), CLAMP(this.z, min, max));
    }

    snap(p_step: Vector3): this {
        this.x = snapped(this.x, p_step.x);
        this.y = snapped(this.y, p_step.y);
        this.z = snapped(this.z, p_step.z);
        return this;
    }

    snapf(p_step: number): this {
        this.x = snapped(this.x, p_step);
        this.y = snapped(this.y, p_step);
        this.z = snapped(this.z, p_step);
        return this;
    }

    /** Returns a new vector with each component snapped to the nearest multiple of the corresponding component in [param step]. This can also be used to round the components to an arbitrary number of decimals. */
    snapped(step: Vector3): Vector3 {
        return new Vector3(this).snap(step);
    }

    /** Returns a new vector with each component snapped to the nearest multiple of [param step]. This can also be used to round the components to an arbitrary number of decimals. */
    snappedf(step: number): Vector3 {
        return new Vector3(this).snapf(step);
    }

    // /** Returns the result of rotating this vector around a given axis by [param angle] (in radians). The axis must be a normalized vector. See also [method @GlobalScope.deg_to_rad]. */
    // rotated(axis: Vector3, angle: number): Vector3;

    /** Returns the result of the linear interpolation between this vector and [param to] by amount [param weight]. [param weight] is on the range of `0.0` to `1.0`, representing the amount of interpolation. */
    lerp(to: Vector3, weight: number): Vector3 {
        return new Vector3(lerp(this.x, to.x, weight), lerp(this.y, to.y, weight), lerp(this.z, to.z, weight));
    }

    // /** Returns the result of spherical linear interpolation between this vector and [param to], by amount [param weight]. [param weight] is on the range of 0.0 to 1.0, representing the amount of interpolation.
    //  *  This method also handles interpolating the lengths if the input vectors have different lengths. For the special case of one or both input vectors having zero length, this method behaves like [method lerp].
    //  */
    // slerp(to: Vector3, weight: number): Vector3

    // /** Performs a cubic interpolation between this vector and [param b] using [param pre_a] and [param post_b] as handles, and returns the result at position [param weight]. [param weight] is on the range of 0.0 to 1.0, representing the amount of interpolation. */
    // cubic_interpolate(b: Vector3, pre_a: Vector3, post_b: Vector3, weight: number): Vector3

    // /** Performs a cubic interpolation between this vector and [param b] using [param pre_a] and [param post_b] as handles, and returns the result at position [param weight]. [param weight] is on the range of 0.0 to 1.0, representing the amount of interpolation.
    //  *  It can perform smoother interpolation than [method cubic_interpolate] by the time values.
    //  */
    // cubic_interpolate_in_time(b: Vector3, pre_a: Vector3, post_b: Vector3, weight: number, b_t: number, pre_a_t: number, post_b_t: number): Vector3

    // /** Returns the point at the given [param t] on the [url=https://en.wikipedia.org/wiki/B%C3%A9zier_curve]Bézier curve[/url] defined by this vector and the given [param control_1], [param control_2], and [param end] points. */
    // bezier_interpolate(control_1: Vector3, control_2: Vector3, end: Vector3, t: number): Vector3

    // /** Returns the derivative at the given [param t] on the [url=https://en.wikipedia.org/wiki/B%C3%A9zier_curve]Bézier curve[/url] defined by this vector and the given [param control_1], [param control_2], and [param end] points. */
    // bezier_derivative(control_1: Vector3, control_2: Vector3, end: Vector3, t: number): Vector3

    // /** Returns a new vector moved toward [param to] by the fixed [param delta] amount. Will not go past the final value. */
    // move_toward(to: Vector3, delta: number): Vector3

    /** Returns the dot product of this vector and [param with]. This can be used to compare the angle between two vectors. For example, this can be used to determine whether an enemy is facing the player.
     *  The dot product will be `0` for a right angle (90 degrees), greater than 0 for angles narrower than 90 degrees and lower than 0 for angles wider than 90 degrees.
     *  When using unit (normalized) vectors, the result will always be between `-1.0` (180 degree angle) when the vectors are facing opposite directions, and `1.0` (0 degree angle) when the vectors are aligned.
     *
     *  **Note:** `a.dot(b)` is equivalent to `b.dot(a)`.
     */
    dot(with_: Vector3): number {
        return this.x * with_.x + this.y * with_.y + this.z * with_.z;
    }

    /** Returns the cross product of this vector and [param with].
     *  This returns a vector perpendicular to both this and [param with], which would be the normal vector of the plane defined by the two vectors. As there are two such vectors, in opposite directions, this method returns the vector defined by a right-handed coordinate system. If the two vectors are parallel this returns an empty vector, making it useful for testing if two vectors are parallel.
     */
    cross(with_: Vector3): Vector3 {
        return new Vector3(
            this.y * with_.z - this.z * with_.y,
            this.z * with_.x - this.x * with_.z,
            this.x * with_.y - this.y * with_.x,
        );
    }

    /** Returns the outer product with [param with]. */
    outer(with_: Vector3): never {
        throw new Error("NOT IMPLEMENTED");
        // let basis = new Basis();
        // basis.rows[0] = new Vector3(this.x * with_.x, this.x * with_.y, this.x * with_.z);
        // basis.rows[1] = new Vector3(this.y * with_.x, this.y * with_.y, this.y * with_.z);
        // basis.rows[2] = new Vector3(this.z * with_.x, this.z * with_.y, this.z * with_.z);
        // return basis;
    }

    /** Returns a new vector with all components in absolute values (i.e. positive). */
    abs(): Vector3 {
        return new Vector3(Math.abs(this.x), Math.abs(this.y), Math.abs(this.z));
    }

    /** Returns a new vector with all components rounded down (towards negative infinity). */
    floor(): Vector3 {
        return new Vector3(Math.floor(this.x), Math.floor(this.y), Math.floor(this.z));
    }

    /** Returns a new vector with all components rounded up (towards positive infinity). */
    ceil(): Vector3 {
        return new Vector3(Math.ceil(this.x), Math.ceil(this.y), Math.ceil(this.z));
    }

    /** Returns a new vector with all components rounded to the nearest integer, with halfway cases rounded away from zero. */
    round(): Vector3 {
        return new Vector3(Math.round(this.x), Math.round(this.y), Math.round(this.z));
    }

    /** Returns a vector composed of the [method @GlobalScope.fposmod] of this vector's components and [param mod]. */
    posmod(p_mod: number): Vector3 {
        return new Vector3(fposmod(this.x, p_mod), fposmod(this.y, p_mod), fposmod(this.z, p_mod));
    }

    /** Returns a vector composed of the [method @GlobalScope.fposmod] of this vector's components and [param modv]'s components. */
    posmodv(p_mod: Vector3): Vector3 {
        return new Vector3(fposmod(this.x, p_mod.x), fposmod(this.y, p_mod.y), fposmod(this.z, p_mod.z));
    }

    /** Returns a new vector resulting from projecting this vector onto the given vector [param b]. The resulting new vector is parallel to [param b]. See also [method slide].
     *
     *  **Note:** If the vector [param b] is a zero vector, the components of the resulting new vector will be [constant @GDScript.NAN].
     */
    project(p_to: Vector3): Vector3 {
        return Vector3.MULTIPLY(p_to, this.dot(p_to) / p_to.length_squared());
    }

    /** Returns a new vector resulting from sliding this vector along a plane with normal [param n]. The resulting new vector is perpendicular to [param n], and is equivalent to this vector minus its projection on [param n]. See also [method project].
     *
     *  **Note:** The vector [param n] must be normalized. See also [method normalized].
     */
    slide(p_normal: Vector3): Vector3 {
        return Vector3.SUBTRACT(this, Vector3.MULTIPLY(p_normal, this.dot(p_normal)));
    }

    /** Returns the vector "bounced off" from a plane defined by the given normal [param n].
     *
     *  **Note:** [method bounce] performs the operation that most engines and frameworks call [code skip-lint]reflect()`.
     */
    bounce(n: Vector3): Vector3 {
        return Vector3.NEGATE(this.reflect(n));
    }

    /** Returns the result of reflecting the vector through a plane defined by the given normal vector [param n].
     *
     *  **Note:** [method reflect] differs from what other engines and frameworks call [code skip-lint]reflect()`. In other engines, [code skip-lint]reflect()` returns the result of the vector reflected by the given plane. The reflection thus passes through the given normal. While in Godot the reflection passes through the plane and can be thought of as bouncing off the normal. See also [method bounce] which does what most engines call [code skip-lint]reflect()`.
     */
    reflect(p_normal: Vector3): Vector3 {
        return Vector3.SUBTRACT(
            Vector3.MULTIPLY(Vector3.MULTIPLY(2.0, p_normal), this.dot(p_normal)),
            new Vector3(this),
        );
    }

    /** Returns a new vector with each component set to `1.0` if it's positive, `-1.0` if it's negative, and `0.0` if it's zero. The result is identical to calling [method @GlobalScope.sign] on each component. */
    sign(): Vector3 {
        return new Vector3(Math.sign(this.x), Math.sign(this.y), Math.sign(this.z));
    }

    /** Returns the octahedral-encoded (oct32) form of this [Vector3] as a [Vector2]. Since a [Vector2] occupies 1/3 less memory compared to [Vector3], this form of compression can be used to pass greater amounts of [method normalized] [Vector3]s without increasing storage or memory requirements. See also [method octahedron_decode].
     *
     *  **Note:** [method octahedron_encode] can only be used for [method normalized] vectors. [method octahedron_encode] does  *not*  check whether this [Vector3] is normalized, and will return a value that does not decompress to the original value if the [Vector3] is not normalized.
     *
     *  **Note:** Octahedral compression is  *lossy* , although visual differences are rarely perceptible in real world scenarios.
     */
    octahedron_encode(): Vector2 {
        let n = Vector3.DIVIDE(this, Math.abs(this.x) + Math.abs(this.y) + Math.abs(this.z));
        let o = new Vector2();
        if (n.z >= 0.0) {
            o.x = n.x;
            o.y = n.y;
        } else {
            o.x = (1.0 - Math.abs(n.y)) * (n.x >= 0.0 ? 1.0 : -1.0);
            o.y = (1.0 - Math.abs(n.x)) * (n.y >= 0.0 ? 1.0 : -1.0);
        }
        o.x = o.x * 0.5 + 0.5;
        o.y = o.y * 0.5 + 0.5;
        return o;
    }

    /** Returns the component-wise minimum of this and [param with], equivalent to `Vector3(minf(x, with.x), minf(y, with.y), minf(z, with.z))`. */
    min(with_: Vector3): Vector3 {
        return new Vector3(Math.min(this.x, with_.x), Math.min(this.y, with_.y), Math.min(this.z, with_.z));
    }

    /** Returns the component-wise minimum of this and [param with], equivalent to `Vector3(minf(x, with), minf(y, with), minf(z, with))`. */
    minf(with_: number): Vector3 {
        return new Vector3(Math.min(this.x, with_), Math.min(this.y, with_), Math.min(this.z, with_));
    }

    /** Returns the component-wise maximum of this and [param with], equivalent to `Vector3(maxf(x, with.x), maxf(y, with.y), maxf(z, with.z))`. */
    max(with_: Vector3): Vector3 {
        return new Vector3(Math.max(this.x, with_.x), Math.max(this.y, with_.y), Math.max(this.z, with_.z));
    }

    /** Returns the component-wise maximum of this and [param with], equivalent to `Vector3(maxf(x, with), maxf(y, with), maxf(z, with))`. */
    maxf(with_: number): Vector3 {
        return new Vector3(Math.max(this.x, with_), Math.max(this.y, with_), Math.max(this.z, with_));
    }

    /** Returns the [Vector3] from an octahedral-compressed form created using [method octahedron_encode] (stored as a [Vector2]). */
    static octahedron_decode(p_oct: Vector2): Vector3 {
        let f = new Vector2(p_oct.x * 2.0 - 1.0, p_oct.y * 2.0 - 1.0);
        let n = new Vector3(f.x, f.y, 1.0 - Math.abs(f.x) - Math.abs(f.y));
        const t = CLAMP(-n.z, 0.0, 1.0);
        n.x += n.x >= 0 ? -t : t;
        n.y += n.y >= 0 ? -t : t;
        return n.normalized();
    }
    static ADD(left: Vector3, right: Vector3): Vector3 {
        return new Vector3(left.x + right.x, left.y + right.y, left.z + right.z);
    }
    static SUBTRACT(left: Vector3, right: Vector3): Vector3 {
        return new Vector3(left.x - right.x, left.y - right.y, left.z - right.z);
    }
    static MULTIPLY(left: number, right: Vector3): Vector3;
    static MULTIPLY(left: Vector3, right: Vector3): Vector3;
    static MULTIPLY(left: Vector3, right: number): Vector3;
    static MULTIPLY(left: Vector3 | number, right: number | Vector3): Vector3 {
        if (typeof left === "number") {
            return new Vector3(left * (right as Vector3).x, left * (right as Vector3).y, left * (right as Vector3).z);
        } else if (typeof right === "number") {
            return new Vector3(right * left.x, right * left.y, right * left.z);
        }
        return new Vector3(left.x * right.x, left.y * right.y, left.z * right.z);
    }

    static DIVIDE(left: Vector3, right: Vector3 | number): Vector3 {
        if (typeof right === "number") {
            return new Vector3(left.x / right, left.y / right, left.z / right);
        }
        return new Vector3(left.x / right.x, left.y / right.y, left.z / right.z);
    }
    static NEGATE(left: Vector3): Vector3 {
        return new Vector3(-left.x, -left.y, -left.z);
    }
    static EQUAL(left: Vector3, right: Vector3): boolean {
        return left.x == right.x && left.y == right.y && left.z == right.z;
    }
    static NOT_EQUAL(left: Vector3, right: Vector3): boolean {
        return left.x != right.x && left.y != right.y && left.z != right.z;
    }
    static LESS(left: Vector3, right: Vector3): boolean {
        if (left.x == right.x) {
            if (left.y == right.y) {
                return left.z < right.z;
            }
            return left.y < right.y;
        }
        return left.x < right.x;
    }
    static LESS_EQUAL(left: Vector3, right: Vector3): boolean {
        if (left.x == right.x) {
            if (left.y == right.y) {
                return left.z <= right.z;
            }
            return left.y < right.y;
        }
        return left.x < right.x;
    }
    static GREATER(left: Vector3, right: Vector3): boolean {
        if (left.x == right.x) {
            if (left.y == right.y) {
                return left.z > right.z;
            }
            return left.y > right.y;
        }
        return left.x > right.x;
    }
    static GREATER_EQUAL(left: Vector3, right: Vector3): boolean {
        if (left.x == right.x) {
            if (left.y == right.y) {
                return left.z >= right.z;
            }
            return left.y > right.y;
        }
        return left.x > right.x;
    }
}
