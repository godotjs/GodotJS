// AUTO-GENERATED
declare module "godot" {
    /** @deprecated Internal use. Does not exist at runtime. */
    interface __NameMapCurve3D extends __NameMapResource {
    }
    /** Describes a Bézier curve in 3D space.  
     *  	  
     *  @link https://docs.godotengine.org/en/4.5/classes/class_curve3d.html  
     */
    class Curve3D extends Resource {
        constructor(identifier?: any)
        /** Adds a point with the specified [param position] relative to the curve's own position, with control points [param in] and [param out]. Appends the new point at the end of the point list.  
         *  If [param index] is given, the new point is inserted before the existing point identified by index [param index]. Every existing point starting from [param index] is shifted further down the list of points. The index must be greater than or equal to `0` and must not exceed the number of existing points in the line. See [member point_count].  
         */
        add_point(position: Vector3, in_?: Vector3 /* = new Vector3(0, 0, 0) */, out_?: Vector3 /* = new Vector3(0, 0, 0) */, index?: int64 /* = -1 */): void
        
        /** Sets the position for the vertex [param idx]. If the index is out of bounds, the function sends an error to the console. */
        set_point_position(idx: int64, position: Vector3): void
        
        /** Returns the position of the vertex [param idx]. If the index is out of bounds, the function sends an error to the console, and returns `(0, 0, 0)`. */
        get_point_position(idx: int64): Vector3
        
        /** Sets the tilt angle in radians for the point [param idx]. If the index is out of bounds, the function sends an error to the console.  
         *  The tilt controls the rotation along the look-at axis an object traveling the path would have. In the case of a curve controlling a [PathFollow3D], this tilt is an offset over the natural tilt the [PathFollow3D] calculates.  
         */
        set_point_tilt(idx: int64, tilt: float64): void
        
        /** Returns the tilt angle in radians for the point [param idx]. If the index is out of bounds, the function sends an error to the console, and returns `0`. */
        get_point_tilt(idx: int64): float64
        
        /** Sets the position of the control point leading to the vertex [param idx]. If the index is out of bounds, the function sends an error to the console. The position is relative to the vertex. */
        set_point_in(idx: int64, position: Vector3): void
        
        /** Returns the position of the control point leading to the vertex [param idx]. The returned position is relative to the vertex [param idx]. If the index is out of bounds, the function sends an error to the console, and returns `(0, 0, 0)`. */
        get_point_in(idx: int64): Vector3
        
        /** Sets the position of the control point leading out of the vertex [param idx]. If the index is out of bounds, the function sends an error to the console. The position is relative to the vertex. */
        set_point_out(idx: int64, position: Vector3): void
        
        /** Returns the position of the control point leading out of the vertex [param idx]. The returned position is relative to the vertex [param idx]. If the index is out of bounds, the function sends an error to the console, and returns `(0, 0, 0)`. */
        get_point_out(idx: int64): Vector3
        
        /** Deletes the point [param idx] from the curve. Sends an error to the console if [param idx] is out of bounds. */
        remove_point(idx: int64): void
        
        /** Removes all points from the curve. */
        clear_points(): void
        
        /** Returns the position between the vertex [param idx] and the vertex `idx + 1`, where [param t] controls if the point is the first vertex (`t = 0.0`), the last vertex (`t = 1.0`), or in between. Values of [param t] outside the range (`0.0 >= t <=1`) give strange, but predictable results.  
         *  If [param idx] is out of bounds it is truncated to the first or last vertex, and [param t] is ignored. If the curve has no points, the function sends an error to the console, and returns `(0, 0, 0)`.  
         */
        sample(idx: int64, t: float64): Vector3
        
        /** Returns the position at the vertex [param fofs]. It calls [method sample] using the integer part of [param fofs] as `idx`, and its fractional part as `t`. */
        samplef(fofs: float64): Vector3
        
        /** Returns the total length of the curve, based on the cached points. Given enough density (see [member bake_interval]), it should be approximate enough. */
        get_baked_length(): float64
        
        /** Returns a point within the curve at position [param offset], where [param offset] is measured as a distance in 3D units along the curve. To do that, it finds the two cached points where the [param offset] lies between, then interpolates the values. This interpolation is cubic if [param cubic] is set to `true`, or linear if set to `false`.  
         *  Cubic interpolation tends to follow the curves better, but linear is faster (and often, precise enough).  
         */
        sample_baked(offset?: float64 /* = 0 */, cubic?: boolean /* = false */): Vector3
        
        /** Returns a [Transform3D] with `origin` as point position, `basis.x` as sideway vector, `basis.y` as up vector, `basis.z` as forward vector. When the curve length is 0, there is no reasonable way to calculate the rotation, all vectors aligned with global space axes. See also [method sample_baked]. */
        sample_baked_with_rotation(offset?: float64 /* = 0 */, cubic?: boolean /* = false */, apply_tilt?: boolean /* = false */): Transform3D
        
        /** Returns an up vector within the curve at position [param offset], where [param offset] is measured as a distance in 3D units along the curve. To do that, it finds the two cached up vectors where the [param offset] lies between, then interpolates the values. If [param apply_tilt] is `true`, an interpolated tilt is applied to the interpolated up vector.  
         *  If the curve has no up vectors, the function sends an error to the console, and returns `(0, 1, 0)`.  
         */
        sample_baked_up_vector(offset: float64, apply_tilt?: boolean /* = false */): Vector3
        
        /** Returns the cache of points as a [PackedVector3Array]. */
        get_baked_points(): PackedVector3Array
        
        /** Returns the cache of tilts as a [PackedFloat32Array]. */
        get_baked_tilts(): PackedFloat32Array
        
        /** Returns the cache of up vectors as a [PackedVector3Array].  
         *  If [member up_vector_enabled] is `false`, the cache will be empty.  
         */
        get_baked_up_vectors(): PackedVector3Array
        
        /** Returns the closest point on baked segments (in curve's local space) to [param to_point].  
         *  [param to_point] must be in this curve's local space.  
         */
        get_closest_point(to_point: Vector3): Vector3
        
        /** Returns the closest offset to [param to_point]. This offset is meant to be used in [method sample_baked] or [method sample_baked_up_vector].  
         *  [param to_point] must be in this curve's local space.  
         */
        get_closest_offset(to_point: Vector3): float64
        
        /** Returns a list of points along the curve, with a curvature controlled point density. That is, the curvier parts will have more points than the straighter parts.  
         *  This approximation makes straight segments between each point, then subdivides those segments until the resulting shape is similar enough.  
         *  [param max_stages] controls how many subdivisions a curve segment may face before it is considered approximate enough. Each subdivision splits the segment in half, so the default 5 stages may mean up to 32 subdivisions per curve segment. Increase with care!  
         *  [param tolerance_degrees] controls how many degrees the midpoint of a segment may deviate from the real curve, before the segment has to be subdivided.  
         */
        tessellate(max_stages?: int64 /* = 5 */, tolerance_degrees?: float64 /* = 4 */): PackedVector3Array
        
        /** Returns a list of points along the curve, with almost uniform density. [param max_stages] controls how many subdivisions a curve segment may face before it is considered approximate enough. Each subdivision splits the segment in half, so the default 5 stages may mean up to 32 subdivisions per curve segment. Increase with care!  
         *  [param tolerance_length] controls the maximal distance between two neighboring points, before the segment has to be subdivided.  
         */
        tessellate_even_length(max_stages?: int64 /* = 5 */, tolerance_length?: float64 /* = 0.2 */): PackedVector3Array
        
        /** If `true`, and the curve has more than 2 control points, the last point and the first one will be connected in a loop. */
        get closed(): boolean
        set closed(value: boolean)
        
        /** The distance in meters between two adjacent cached points. Changing it forces the cache to be recomputed the next time the [method get_baked_points] or [method get_baked_length] function is called. The smaller the distance, the more points in the cache and the more memory it will consume, so use with care. */
        get bake_interval(): float64
        set bake_interval(value: float64)
        get _data(): int64
        set _data(value: int64)
        
        /** The number of points describing the curve. */
        get point_count(): int64
        set point_count(value: int64)
        
        /** If `true`, the curve will bake up vectors used for orientation. This is used when [member PathFollow3D.rotation_mode] is set to [constant PathFollow3D.ROTATION_ORIENTED]. Changing it forces the cache to be recomputed. */
        get up_vector_enabled(): boolean
        set up_vector_enabled(value: boolean)
        /** @deprecated Internal use. Does not exist at runtime. */
        __godotNameMap: __NameMapCurve3D;
    }
    namespace CurveTexture {
        enum TextureMode {
            /** Store the curve equally across the red, green and blue channels. This uses more video memory, but is more compatible with shaders that only read the green and blue values. */
            TEXTURE_MODE_RGB = 0,
            
            /** Store the curve only in the red channel. This saves video memory, but some custom shaders may not be able to work with this. */
            TEXTURE_MODE_RED = 1,
        }
    }
    /** @deprecated Internal use. Does not exist at runtime. */
    interface __NameMapCurveTexture extends __NameMapTexture2D {
    }
    /** A 1D texture where pixel brightness corresponds to points on a curve.  
     *  	  
     *  @link https://docs.godotengine.org/en/4.5/classes/class_curvetexture.html  
     */
    class CurveTexture extends Texture2D {
        constructor(identifier?: any)
        /** The width of the texture (in pixels). Higher values make it possible to represent high-frequency data better (such as sudden direction changes), at the cost of increased generation time and memory usage. */
        get width(): int64
        set width(value: int64)
        
        /** The format the texture should be generated with. When passing a CurveTexture as an input to a [Shader], this may need to be adjusted. */
        get texture_mode(): int64
        set texture_mode(value: int64)
        
        /** The [Curve] that is rendered onto the texture. Should be a unit [Curve]. */
        get curve(): null | Curve
        set curve(value: null | Curve)
        /** @deprecated Internal use. Does not exist at runtime. */
        __godotNameMap: __NameMapCurveTexture;
    }
    /** @deprecated Internal use. Does not exist at runtime. */
    interface __NameMapCurveXYZTexture extends __NameMapTexture2D {
    }
    /** A 1D texture where the red, green, and blue color channels correspond to points on 3 curves.  
     *  	  
     *  @link https://docs.godotengine.org/en/4.5/classes/class_curvexyztexture.html  
     */
    class CurveXYZTexture extends Texture2D {
        constructor(identifier?: any)
        /** The width of the texture (in pixels). Higher values make it possible to represent high-frequency data better (such as sudden direction changes), at the cost of increased generation time and memory usage. */
        get width(): int64
        set width(value: int64)
        
        /** The [Curve] that is rendered onto the texture's red channel. Should be a unit [Curve]. */
        get curve_x(): null | Curve
        set curve_x(value: null | Curve)
        
        /** The [Curve] that is rendered onto the texture's green channel. Should be a unit [Curve]. */
        get curve_y(): null | Curve
        set curve_y(value: null | Curve)
        
        /** The [Curve] that is rendered onto the texture's blue channel. Should be a unit [Curve]. */
        get curve_z(): null | Curve
        set curve_z(value: null | Curve)
        /** @deprecated Internal use. Does not exist at runtime. */
        __godotNameMap: __NameMapCurveXYZTexture;
    }
    /** @deprecated Internal use. Does not exist at runtime. */
    interface __NameMapCylinderMesh extends __NameMapPrimitiveMesh {
    }
    /** Class representing a cylindrical [PrimitiveMesh].  
     *  	  
     *  @link https://docs.godotengine.org/en/4.5/classes/class_cylindermesh.html  
     */
    class CylinderMesh extends PrimitiveMesh {
        constructor(identifier?: any)
        /** Top radius of the cylinder. If set to `0.0`, the top faces will not be generated, resulting in a conic shape. See also [member cap_top]. */
        get top_radius(): float64
        set top_radius(value: float64)
        
        /** Bottom radius of the cylinder. If set to `0.0`, the bottom faces will not be generated, resulting in a conic shape. See also [member cap_bottom]. */
        get bottom_radius(): float64
        set bottom_radius(value: float64)
        
        /** Full height of the cylinder. */
        get height(): float64
        set height(value: float64)
        
        /** Number of radial segments on the cylinder. Higher values result in a more detailed cylinder/cone at the cost of performance. */
        get radial_segments(): int64
        set radial_segments(value: int64)
        
        /** Number of edge rings along the height of the cylinder. Changing [member rings] does not have any visual impact unless a shader or procedural mesh tool is used to alter the vertex data. Higher values result in more subdivisions, which can be used to create smoother-looking effects with shaders or procedural mesh tools (at the cost of performance). When not altering the vertex data using a shader or procedural mesh tool, [member rings] should be kept to its default value. */
        get rings(): int64
        set rings(value: int64)
        
        /** If `true`, generates a cap at the top of the cylinder. This can be set to `false` to speed up generation and rendering when the cap is never seen by the camera. See also [member top_radius].  
         *      
         *  **Note:** If [member top_radius] is `0.0`, cap generation is always skipped even if [member cap_top] is `true`.  
         */
        get cap_top(): boolean
        set cap_top(value: boolean)
        
        /** If `true`, generates a cap at the bottom of the cylinder. This can be set to `false` to speed up generation and rendering when the cap is never seen by the camera. See also [member bottom_radius].  
         *      
         *  **Note:** If [member bottom_radius] is `0.0`, cap generation is always skipped even if [member cap_bottom] is `true`.  
         */
        get cap_bottom(): boolean
        set cap_bottom(value: boolean)
        /** @deprecated Internal use. Does not exist at runtime. */
        __godotNameMap: __NameMapCylinderMesh;
    }
    /** @deprecated Internal use. Does not exist at runtime. */
    interface __NameMapCylinderShape3D extends __NameMapShape3D {
    }
    /** A 3D cylinder shape used for physics collision.  
     *  	  
     *  @link https://docs.godotengine.org/en/4.5/classes/class_cylindershape3d.html  
     */
    class CylinderShape3D extends Shape3D {
        constructor(identifier?: any)
        /** The cylinder's height. */
        get height(): float64
        set height(value: float64)
        
        /** The cylinder's radius. */
        get radius(): float64
        set radius(value: float64)
        /** @deprecated Internal use. Does not exist at runtime. */
        __godotNameMap: __NameMapCylinderShape3D;
    }
    /** @deprecated Internal use. Does not exist at runtime. */
    interface __NameMapDPITexture extends __NameMapTexture2D {
    }
    /** An automatically scalable [Texture2D] based on an SVG image.  
     *  	  
     *  @link https://docs.godotengine.org/en/4.5/classes/class_dpitexture.html  
     */
    class DPITexture extends Texture2D {
        constructor(identifier?: any)
        /** Creates a new [DPITexture] and initializes it by allocating and setting the SVG data from string. */
        static create_from_string(source: string, scale?: float64 /* = 1 */, saturation?: float64 /* = 1 */, color_map?: GDictionary /* = new GDictionary() */): DPITexture
        
        /** Resizes the texture to the specified dimensions. */
        set_size_override(size: Vector2i): void
        
        /** Returns the [RID] of the texture rasterized to match the oversampling of the currently drawn canvas item. */
        get_scaled_rid(): RID
        get _source(): string
        set _source(value: string)
        
        /** Texture scale. `1.0` is the original SVG size. Higher values result in a larger image. */
        get base_scale(): float64
        set base_scale(value: float64)
        
        /** Overrides texture saturation. */
        get saturation(): float64
        set saturation(value: float64)
        
        /** If set, remaps texture colors according to [Color]-[Color] map. */
        get color_map(): GDictionary
        set color_map(value: GDictionary)
        /** @deprecated Internal use. Does not exist at runtime. */
        __godotNameMap: __NameMapDPITexture;
    }
    /** @deprecated Internal use. Does not exist at runtime. */
    interface __NameMapDTLSServer extends __NameMapRefCounted {
    }
    /** Helper class to implement a DTLS server.  
     *  	  
     *  @link https://docs.godotengine.org/en/4.5/classes/class_dtlsserver.html  
     */
    class DTLSServer extends RefCounted {
        constructor(identifier?: any)
        /** Setup the DTLS server to use the given [param server_options]. See [method TLSOptions.server]. */
        setup(server_options: TLSOptions): Error
        
        /** Try to initiate the DTLS handshake with the given [param udp_peer] which must be already connected (see [method PacketPeerUDP.connect_to_host]).  
         *      
         *  **Note:** You must check that the state of the return PacketPeerUDP is [constant PacketPeerDTLS.STATUS_HANDSHAKING], as it is normal that 50% of the new connections will be invalid due to cookie exchange.  
         */
        take_connection(udp_peer: PacketPeerUDP): null | PacketPeerDTLS
        /** @deprecated Internal use. Does not exist at runtime. */
        __godotNameMap: __NameMapDTLSServer;
    }
    /** @deprecated Internal use. Does not exist at runtime. */
    interface __NameMapDampedSpringJoint2D extends __NameMapJoint2D {
    }
    /** A physics joint that connects two 2D physics bodies with a spring-like force.  
     *  	  
     *  @link https://docs.godotengine.org/en/4.5/classes/class_dampedspringjoint2d.html  
     */
    class DampedSpringJoint2D<Map extends NodePathMap = any> extends Joint2D<Map> {
        constructor(identifier?: any)
        /** The spring joint's maximum length. The two attached bodies cannot stretch it past this value. */
        get length(): float64
        set length(value: float64)
        
        /** When the bodies attached to the spring joint move they stretch or squash it. The joint always tries to resize towards this length. */
        get rest_length(): float64
        set rest_length(value: float64)
        
        /** The higher the value, the less the bodies attached to the joint will deform it. The joint applies an opposing force to the bodies, the product of the stiffness multiplied by the size difference from its resting length. */
        get stiffness(): float64
        set stiffness(value: float64)
        
        /** The spring joint's damping ratio. A value between `0` and `1`. When the two bodies move into different directions the system tries to align them to the spring axis again. A high [member damping] value forces the attached bodies to align faster. */
        get damping(): float64
        set damping(value: float64)
        /** @deprecated Internal use. Does not exist at runtime. */
        __godotNameMap: __NameMapDampedSpringJoint2D;
    }
    namespace Decal {
        enum DecalTexture {
            /** [Texture2D] corresponding to [member texture_albedo]. */
            TEXTURE_ALBEDO = 0,
            
            /** [Texture2D] corresponding to [member texture_normal]. */
            TEXTURE_NORMAL = 1,
            
            /** [Texture2D] corresponding to [member texture_orm]. */
            TEXTURE_ORM = 2,
            
            /** [Texture2D] corresponding to [member texture_emission]. */
            TEXTURE_EMISSION = 3,
            
            /** Max size of [enum DecalTexture] enum. */
            TEXTURE_MAX = 4,
        }
    }
    /** @deprecated Internal use. Does not exist at runtime. */
    interface __NameMapDecal extends __NameMapVisualInstance3D {
    }
    /** Node that projects a texture onto a [MeshInstance3D].  
     *  	  
     *  @link https://docs.godotengine.org/en/4.5/classes/class_decal.html  
     */
    class Decal<Map extends NodePathMap = any> extends VisualInstance3D<Map> {
        constructor(identifier?: any)
        /** Sets the [Texture2D] associated with the specified [enum DecalTexture]. This is a convenience method, in most cases you should access the texture directly.  
         *  For example, instead of `$Decal.set_texture(Decal.TEXTURE_ALBEDO, albedo_tex)`, use `$Decal.texture_albedo = albedo_tex`.  
         *  One case where this is better than accessing the texture directly is when you want to copy one Decal's textures to another. For example:  
         *    
         */
        set_texture(type: Decal.DecalTexture, texture: Texture2D): void
        
        /** Returns the [Texture2D] associated with the specified [enum DecalTexture]. This is a convenience method, in most cases you should access the texture directly.  
         *  For example, instead of `albedo_tex = $Decal.get_texture(Decal.TEXTURE_ALBEDO)`, use `albedo_tex = $Decal.texture_albedo`.  
         *  One case where this is better than accessing the texture directly is when you want to copy one Decal's textures to another. For example:  
         *    
         */
        get_texture(type: Decal.DecalTexture): null | Texture2D
        
        /** Sets the size of the [AABB] used by the decal. All dimensions must be set to a value greater than zero (they will be clamped to `0.001` if this is not the case). The AABB goes from `-size/2` to `size/2`.  
         *      
         *  **Note:** To improve culling efficiency of "hard surface" decals, set their [member upper_fade] and [member lower_fade] to `0.0` and set the Y component of the [member size] as low as possible. This will reduce the decals' AABB size without affecting their appearance.  
         */
        get size(): Vector3
        set size(value: Vector3)
        
        /** [Texture2D] with the base [Color] of the Decal. Either this or the [member texture_emission] must be set for the Decal to be visible. Use the alpha channel like a mask to smoothly blend the edges of the decal with the underlying object.  
         *      
         *  **Note:** Unlike [BaseMaterial3D] whose filter mode can be adjusted on a per-material basis, the filter mode for [Decal] textures is set globally with [member ProjectSettings.rendering/textures/decals/filter].  
         */
        get texture_albedo(): null | Texture2D | any /*-AnimatedTexture*/ | any /*-AtlasTexture*/ | any /*-CameraTexture*/ | any /*-CanvasTexture*/ | any /*-MeshTexture*/ | any /*-Texture2DRD*/ | any /*-ViewportTexture*/
        set texture_albedo(value: null | Texture2D | any /*-AnimatedTexture*/ | any /*-AtlasTexture*/ | any /*-CameraTexture*/ | any /*-CanvasTexture*/ | any /*-MeshTexture*/ | any /*-Texture2DRD*/ | any /*-ViewportTexture*/)
        
        /** [Texture2D] with the per-pixel normal map for the decal. Use this to add extra detail to decals.  
         *      
         *  **Note:** Unlike [BaseMaterial3D] whose filter mode can be adjusted on a per-material basis, the filter mode for [Decal] textures is set globally with [member ProjectSettings.rendering/textures/decals/filter].  
         *      
         *  **Note:** Setting this texture alone will not result in a visible decal, as [member texture_albedo] must also be set. To create a normal-only decal, load an albedo texture into [member texture_albedo] and set [member albedo_mix] to `0.0`. The albedo texture's alpha channel will be used to determine where the underlying surface's normal map should be overridden (and its intensity).  
         */
        get texture_normal(): null | Texture2D | any /*-AnimatedTexture*/ | any /*-AtlasTexture*/ | any /*-CameraTexture*/ | any /*-CanvasTexture*/ | any /*-MeshTexture*/ | any /*-Texture2DRD*/ | any /*-ViewportTexture*/
        set texture_normal(value: null | Texture2D | any /*-AnimatedTexture*/ | any /*-AtlasTexture*/ | any /*-CameraTexture*/ | any /*-CanvasTexture*/ | any /*-MeshTexture*/ | any /*-Texture2DRD*/ | any /*-ViewportTexture*/)
        
        /** [Texture2D] storing ambient occlusion, roughness, and metallic for the decal. Use this to add extra detail to decals.  
         *      
         *  **Note:** Unlike [BaseMaterial3D] whose filter mode can be adjusted on a per-material basis, the filter mode for [Decal] textures is set globally with [member ProjectSettings.rendering/textures/decals/filter].  
         *      
         *  **Note:** Setting this texture alone will not result in a visible decal, as [member texture_albedo] must also be set. To create an ORM-only decal, load an albedo texture into [member texture_albedo] and set [member albedo_mix] to `0.0`. The albedo texture's alpha channel will be used to determine where the underlying surface's ORM map should be overridden (and its intensity).  
         */
        get texture_orm(): null | Texture2D | any /*-AnimatedTexture*/ | any /*-AtlasTexture*/ | any /*-CameraTexture*/ | any /*-CanvasTexture*/ | any /*-MeshTexture*/ | any /*-Texture2DRD*/ | any /*-ViewportTexture*/
        set texture_orm(value: null | Texture2D | any /*-AnimatedTexture*/ | any /*-AtlasTexture*/ | any /*-CameraTexture*/ | any /*-CanvasTexture*/ | any /*-MeshTexture*/ | any /*-Texture2DRD*/ | any /*-ViewportTexture*/)
        
        /** [Texture2D] with the emission [Color] of the Decal. Either this or the [member texture_albedo] must be set for the Decal to be visible. Use the alpha channel like a mask to smoothly blend the edges of the decal with the underlying object.  
         *      
         *  **Note:** Unlike [BaseMaterial3D] whose filter mode can be adjusted on a per-material basis, the filter mode for [Decal] textures is set globally with [member ProjectSettings.rendering/textures/decals/filter].  
         */
        get texture_emission(): null | Texture2D | any /*-AnimatedTexture*/ | any /*-AtlasTexture*/ | any /*-CameraTexture*/ | any /*-CanvasTexture*/ | any /*-MeshTexture*/ | any /*-Texture2DRD*/ | any /*-ViewportTexture*/
        set texture_emission(value: null | Texture2D | any /*-AnimatedTexture*/ | any /*-AtlasTexture*/ | any /*-CameraTexture*/ | any /*-CanvasTexture*/ | any /*-MeshTexture*/ | any /*-Texture2DRD*/ | any /*-ViewportTexture*/)
        
        /** Energy multiplier for the emission texture. This will make the decal emit light at a higher or lower intensity, independently of the albedo color. See also [member modulate]. */
        get emission_energy(): float64
        set emission_energy(value: float64)
        
        /** Changes the [Color] of the Decal by multiplying the albedo and emission colors with this value. The alpha component is only taken into account when multiplying the albedo color, not the emission color. See also [member emission_energy] and [member albedo_mix] to change the emission and albedo intensity independently of each other. */
        get modulate(): Color
        set modulate(value: Color)
        
        /** Blends the albedo [Color] of the decal with albedo [Color] of the underlying mesh. This can be set to `0.0` to create a decal that only affects normal or ORM. In this case, an albedo texture is still required as its alpha channel will determine where the normal and ORM will be overridden. See also [member modulate]. */
        get albedo_mix(): float64
        set albedo_mix(value: float64)
        
        /** Fades the Decal if the angle between the Decal's [AABB] and the target surface becomes too large. A value of `0` projects the Decal regardless of angle, a value of `1` limits the Decal to surfaces that are nearly perpendicular.  
         *      
         *  **Note:** Setting [member normal_fade] to a value greater than `0.0` has a small performance cost due to the added normal angle computations.  
         */
        get normal_fade(): float64
        set normal_fade(value: float64)
        
        /** Sets the curve over which the decal will fade as the surface gets further from the center of the [AABB]. Only positive values are valid (negative values will be clamped to `0.0`). See also [member lower_fade]. */
        get upper_fade(): float64
        set upper_fade(value: float64)
        
        /** Sets the curve over which the decal will fade as the surface gets further from the center of the [AABB]. Only positive values are valid (negative values will be clamped to `0.0`). See also [member upper_fade]. */
        get lower_fade(): float64
        set lower_fade(value: float64)
        
        /** If `true`, decals will smoothly fade away when far from the active [Camera3D] starting at [member distance_fade_begin]. The Decal will fade out over [member distance_fade_begin] + [member distance_fade_length], after which it will be culled and not sent to the shader at all. Use this to reduce the number of active Decals in a scene and thus improve performance. */
        get distance_fade_enabled(): boolean
        set distance_fade_enabled(value: boolean)
        
        /** The distance from the camera at which the Decal begins to fade away (in 3D units). */
        get distance_fade_begin(): float64
        set distance_fade_begin(value: float64)
        
        /** The distance over which the Decal fades (in 3D units). The Decal becomes slowly more transparent over this distance and is completely invisible at the end. Higher values result in a smoother fade-out transition, which is more suited when the camera moves fast. */
        get distance_fade_length(): float64
        set distance_fade_length(value: float64)
        
        /** Specifies which [member VisualInstance3D.layers] this decal will project on. By default, Decals affect all layers. This is used so you can specify which types of objects receive the Decal and which do not. This is especially useful so you can ensure that dynamic objects don't accidentally receive a Decal intended for the terrain under them. */
        get cull_mask(): int64
        set cull_mask(value: int64)
        /** @deprecated Internal use. Does not exist at runtime. */
        __godotNameMap: __NameMapDecal;
    }
    /** @deprecated Internal use. Does not exist at runtime. */
    interface __NameMapDirAccess extends __NameMapRefCounted {
    }
    /** Provides methods for managing directories and their content.  
     *  	  
     *  @link https://docs.godotengine.org/en/4.5/classes/class_diraccess.html  
     */
    class DirAccess extends RefCounted {
        constructor(identifier?: any)
        /** Creates a new [DirAccess] object and opens an existing directory of the filesystem. The [param path] argument can be within the project tree (`res://folder`), the user directory (`user://folder`) or an absolute path of the user filesystem (e.g. `/tmp/folder` or `C:\tmp\folder`).  
         *  Returns `null` if opening the directory failed. You can use [method get_open_error] to check the error that occurred.  
         */
        static open(path: string): null | DirAccess
        
        /** Returns the result of the last [method open] call in the current thread. */
        static get_open_error(): Error
        
        /** Creates a temporary directory. This directory will be freed when the returned [DirAccess] is freed.  
         *  If [param prefix] is not empty, it will be prefixed to the directory name, separated by a `-`.  
         *  If [param keep] is `true`, the directory is not deleted when the returned [DirAccess] is freed.  
         *  Returns `null` if opening the directory failed. You can use [method get_open_error] to check the error that occurred.  
         */
        static create_temp(prefix?: string /* = '' */, keep?: boolean /* = false */): DirAccess
        
        /** Initializes the stream used to list all files and directories using the [method get_next] function, closing the currently opened stream if needed. Once the stream has been processed, it should typically be closed with [method list_dir_end].  
         *  Affected by [member include_hidden] and [member include_navigational].  
         *      
         *  **Note:** The order of files and directories returned by this method is not deterministic, and can vary between operating systems. If you want a list of all files or folders sorted alphabetically, use [method get_files] or [method get_directories].  
         */
        list_dir_begin(): Error
        
        /** Returns the next element (file or directory) in the current directory.  
         *  The name of the file or directory is returned (and not its full path). Once the stream has been fully processed, the method returns an empty [String] and closes the stream automatically (i.e. [method list_dir_end] would not be mandatory in such a case).  
         */
        get_next(): string
        
        /** Returns whether the current item processed with the last [method get_next] call is a directory (`.` and `..` are considered directories). */
        current_is_dir(): boolean
        
        /** Closes the current stream opened with [method list_dir_begin] (whether it has been fully processed with [method get_next] does not matter). */
        list_dir_end(): void
        
        /** Returns a [PackedStringArray] containing filenames of the directory contents, excluding directories. The array is sorted alphabetically.  
         *  Affected by [member include_hidden].  
         *      
         *  **Note:** When used on a `res://` path in an exported project, only the files actually included in the PCK at the given folder level are returned. In practice, this means that since imported resources are stored in a top-level `.godot/` folder, only paths to `*.gd` and `*.import` files are returned (plus a few files such as `project.godot` or `project.binary` and the project icon). In an exported project, the list of returned files will also vary depending on whether [member ProjectSettings.editor/export/convert_text_resources_to_binary] is `true`.  
         */
        get_files(): PackedStringArray
        
        /** Returns a [PackedStringArray] containing filenames of the directory contents, excluding directories, at the given [param path]. The array is sorted alphabetically.  
         *  Use [method get_files] if you want more control of what gets included.  
         *      
         *  **Note:** When used on a `res://` path in an exported project, only the files included in the PCK at the given folder level are returned. In practice, this means that since imported resources are stored in a top-level `.godot/` folder, only paths to `.gd` and `.import` files are returned (plus a few other files, such as `project.godot` or `project.binary` and the project icon). In an exported project, the list of returned files will also vary depending on [member ProjectSettings.editor/export/convert_text_resources_to_binary].  
         */
        static get_files_at(path: string): PackedStringArray
        
        /** Returns a [PackedStringArray] containing filenames of the directory contents, excluding files. The array is sorted alphabetically.  
         *  Affected by [member include_hidden] and [member include_navigational].  
         *      
         *  **Note:** The returned directories in the editor and after exporting in the `res://` directory may differ as some files are converted to engine-specific formats when exported.  
         */
        get_directories(): PackedStringArray
        
        /** Returns a [PackedStringArray] containing filenames of the directory contents, excluding files, at the given [param path]. The array is sorted alphabetically.  
         *  Use [method get_directories] if you want more control of what gets included.  
         *      
         *  **Note:** The returned directories in the editor and after exporting in the `res://` directory may differ as some files are converted to engine-specific formats when exported.  
         */
        static get_directories_at(path: string): PackedStringArray
        
        /** On Windows, returns the number of drives (partitions) mounted on the current filesystem.  
         *  On macOS and Android, returns the number of mounted volumes.  
         *  On Linux, returns the number of mounted volumes and GTK 3 bookmarks.  
         *  On other platforms, the method returns 0.  
         */
        static get_drive_count(): int64
        
        /** On Windows, returns the name of the drive (partition) passed as an argument (e.g. `C:`).  
         *  On macOS, returns the path to the mounted volume passed as an argument.  
         *  On Linux, returns the path to the mounted volume or GTK 3 bookmark passed as an argument.  
         *  On Android (API level 30+), returns the path to the mounted volume as an argument.  
         *  On other platforms, or if the requested drive does not exist, the method returns an empty String.  
         */
        static get_drive_name(idx: int64): string
        
        /** Returns the currently opened directory's drive index. See [method get_drive_name] to convert returned index to the name of the drive. */
        get_current_drive(): int64
        
        /** Changes the currently opened directory to the one passed as an argument. The argument can be relative to the current directory (e.g. `newdir` or `../newdir`), or an absolute path (e.g. `/tmp/newdir` or `res://somedir/newdir`).  
         *  Returns one of the [enum Error] code constants ([constant OK] on success).  
         *      
         *  **Note:** The new directory must be within the same scope, e.g. when you had opened a directory inside `res://`, you can't change it to `user://` directory. If you need to open a directory in another access scope, use [method open] to create a new instance instead.  
         */
        change_dir(to_dir: string): Error
        
        /** Returns the absolute path to the currently opened directory (e.g. `res://folder` or `C:\tmp\folder`). */
        get_current_dir(include_drive?: boolean /* = true */): string
        
        /** Creates a directory. The argument can be relative to the current directory, or an absolute path. The target directory should be placed in an already existing directory (to create the full path recursively, see [method make_dir_recursive]).  
         *  Returns one of the [enum Error] code constants ([constant OK] on success).  
         */
        make_dir(path: string): Error
        
        /** Static version of [method make_dir]. Supports only absolute paths. */
        static make_dir_absolute(path: string): Error
        
        /** Creates a target directory and all necessary intermediate directories in its path, by calling [method make_dir] recursively. The argument can be relative to the current directory, or an absolute path.  
         *  Returns one of the [enum Error] code constants ([constant OK] on success).  
         */
        make_dir_recursive(path: string): Error
        
        /** Static version of [method make_dir_recursive]. Supports only absolute paths. */
        static make_dir_recursive_absolute(path: string): Error
        
        /** Returns whether the target file exists. The argument can be relative to the current directory, or an absolute path.  
         *  For a static equivalent, use [method FileAccess.file_exists].  
         *      
         *  **Note:** Many resources types are imported (e.g. textures or sound files), and their source asset will not be included in the exported game, as only the imported version is used. See [method ResourceLoader.exists] for an alternative approach that takes resource remapping into account.  
         */
        file_exists(path: string): boolean
        
        /** Returns whether the target directory exists. The argument can be relative to the current directory, or an absolute path.  
         *      
         *  **Note:** The returned [bool] in the editor and after exporting when used on a path in the `res://` directory may be different. Some files are converted to engine-specific formats when exported, potentially changing the directory structure.  
         */
        dir_exists(path: string): boolean
        
        /** Static version of [method dir_exists]. Supports only absolute paths.  
         *      
         *  **Note:** The returned [bool] in the editor and after exporting when used on a path in the `res://` directory may be different. Some files are converted to engine-specific formats when exported, potentially changing the directory structure.  
         */
        static dir_exists_absolute(path: string): boolean
        
        /** Returns the available space on the current directory's disk, in bytes. Returns `0` if the platform-specific method to query the available space fails. */
        get_space_left(): int64
        
        /** Copies the [param from] file to the [param to] destination. Both arguments should be paths to files, either relative or absolute. If the destination file exists and is not access-protected, it will be overwritten.  
         *  If [param chmod_flags] is different than `-1`, the Unix permissions for the destination path will be set to the provided value, if available on the current operating system.  
         *  Returns one of the [enum Error] code constants ([constant OK] on success).  
         */
        copy(from: string, to: string, chmod_flags?: int64 /* = -1 */): Error
        
        /** Static version of [method copy]. Supports only absolute paths. */
        static copy_absolute(from: string, to: string, chmod_flags?: int64 /* = -1 */): Error
        
        /** Renames (move) the [param from] file or directory to the [param to] destination. Both arguments should be paths to files or directories, either relative or absolute. If the destination file or directory exists and is not access-protected, it will be overwritten.  
         *  Returns one of the [enum Error] code constants ([constant OK] on success).  
         */
        rename(from: string, to: string): Error
        
        /** Static version of [method rename]. Supports only absolute paths. */
        static rename_absolute(from: string, to: string): Error
        
        /** Permanently deletes the target file or an empty directory. The argument can be relative to the current directory, or an absolute path. If the target directory is not empty, the operation will fail.  
         *  If you don't want to delete the file/directory permanently, use [method OS.move_to_trash] instead.  
         *  Returns one of the [enum Error] code constants ([constant OK] on success).  
         */
        remove(path: string): Error
        
        /** Static version of [method remove]. Supports only absolute paths. */
        static remove_absolute(path: string): Error
        
        /** Returns `true` if the file or directory is a symbolic link, directory junction, or other reparse point.  
         *      
         *  **Note:** This method is implemented on macOS, Linux, and Windows.  
         */
        is_link(path: string): boolean
        
        /** Returns target of the symbolic link.  
         *      
         *  **Note:** This method is implemented on macOS, Linux, and Windows.  
         */
        read_link(path: string): string
        
        /** Creates symbolic link between files or folders.  
         *      
         *  **Note:** On Windows, this method works only if the application is running with elevated privileges or Developer Mode is enabled.  
         *      
         *  **Note:** This method is implemented on macOS, Linux, and Windows.  
         */
        create_link(source: string, target: string): Error
        
        /** Returns `true` if the directory is a macOS bundle.  
         *      
         *  **Note:** This method is implemented on macOS.  
         */
        is_bundle(path: string): boolean
        
        /** Returns file system type name of the current directory's disk. Returned values are uppercase strings like `NTFS`, `FAT32`, `EXFAT`, `APFS`, `EXT4`, `BTRFS`, and so on.  
         *      
         *  **Note:** This method is implemented on macOS, Linux, Windows and for PCK virtual file system.  
         */
        get_filesystem_type(): string
        
        /** Returns `true` if the file system or directory use case sensitive file names.  
         *      
         *  **Note:** This method is implemented on macOS, Linux (for EXT4 and F2FS filesystems only) and Windows. On other platforms, it always returns `true`.  
         */
        is_case_sensitive(path: string): boolean
        
        /** Returns `true` if paths [param path_a] and [param path_b] resolve to the same file system object. Returns `false` otherwise, even if the files are bit-for-bit identical (e.g., identical copies of the file that are not symbolic links). */
        is_equivalent(path_a: string, path_b: string): boolean
        
        /** If `true`, `.` and `..` are included when navigating the directory.  
         *  Affects [method list_dir_begin] and [method get_directories].  
         */
        get include_navigational(): boolean
        set include_navigational(value: boolean)
        
        /** If `true`, hidden files are included when navigating the directory.  
         *  Affects [method list_dir_begin], [method get_directories] and [method get_files].  
         */
        get include_hidden(): boolean
        set include_hidden(value: boolean)
        /** @deprecated Internal use. Does not exist at runtime. */
        __godotNameMap: __NameMapDirAccess;
    }
    /** @deprecated Internal use. Does not exist at runtime. */
    interface __NameMapDirectionalLight2D extends __NameMapLight2D {
    }
    /** Directional 2D light from a distance.  
     *  	  
     *  @link https://docs.godotengine.org/en/4.5/classes/class_directionallight2d.html  
     */
    class DirectionalLight2D<Map extends NodePathMap = any> extends Light2D<Map> {
        constructor(identifier?: any)
        /** The height of the light. Used with 2D normal mapping. Ranges from 0 (parallel to the plane) to 1 (perpendicular to the plane). */
        get height(): float64
        set height(value: float64)
        
        /** The maximum distance from the camera center objects can be before their shadows are culled (in pixels). Decreasing this value can prevent objects located outside the camera from casting shadows (while also improving performance). [member Camera2D.zoom] is not taken into account by [member max_distance], which means that at higher zoom values, shadows will appear to fade out sooner when zooming onto a given point. */
        get max_distance(): float64
        set max_distance(value: float64)
        /** @deprecated Internal use. Does not exist at runtime. */
        __godotNameMap: __NameMapDirectionalLight2D;
    }
    namespace DirectionalLight3D {
        enum ShadowMode {
            /** Renders the entire scene's shadow map from an orthogonal point of view. This is the fastest directional shadow mode. May result in blurrier shadows on close objects. */
            SHADOW_ORTHOGONAL = 0,
            
            /** Splits the view frustum in 2 areas, each with its own shadow map. This shadow mode is a compromise between [constant SHADOW_ORTHOGONAL] and [constant SHADOW_PARALLEL_4_SPLITS] in terms of performance. */
            SHADOW_PARALLEL_2_SPLITS = 1,
            
            /** Splits the view frustum in 4 areas, each with its own shadow map. This is the slowest directional shadow mode. */
            SHADOW_PARALLEL_4_SPLITS = 2,
        }
        enum SkyMode {
            /** Makes the light visible in both scene lighting and sky rendering. */
            SKY_MODE_LIGHT_AND_SKY = 0,
            
            /** Makes the light visible in scene lighting only (including direct lighting and global illumination). When using this mode, the light will not be visible from sky shaders. */
            SKY_MODE_LIGHT_ONLY = 1,
            
            /** Makes the light visible to sky shaders only. When using this mode the light will not cast light into the scene (either through direct lighting or through global illumination), but can be accessed through sky shaders. This can be useful, for example, when you want to control sky effects without illuminating the scene (during a night cycle, for example). */
            SKY_MODE_SKY_ONLY = 2,
        }
    }
    /** @deprecated Internal use. Does not exist at runtime. */
    interface __NameMapDirectionalLight3D extends __NameMapLight3D {
    }
    /** Directional light from a distance, as from the Sun.  
     *  	  
     *  @link https://docs.godotengine.org/en/4.5/classes/class_directionallight3d.html  
     */
    class DirectionalLight3D<Map extends NodePathMap = any> extends Light3D<Map> {
        constructor(identifier?: any)
        /** The light's shadow rendering algorithm. */
        get directional_shadow_mode(): int64
        set directional_shadow_mode(value: int64)
        
        /** The distance from camera to shadow split 1. Relative to [member directional_shadow_max_distance]. Only used when [member directional_shadow_mode] is [constant SHADOW_PARALLEL_2_SPLITS] or [constant SHADOW_PARALLEL_4_SPLITS]. */
        get directional_shadow_split_1(): float64
        set directional_shadow_split_1(value: float64)
        
        /** The distance from shadow split 1 to split 2. Relative to [member directional_shadow_max_distance]. Only used when [member directional_shadow_mode] is [constant SHADOW_PARALLEL_4_SPLITS]. */
        get directional_shadow_split_2(): float64
        set directional_shadow_split_2(value: float64)
        
        /** The distance from shadow split 2 to split 3. Relative to [member directional_shadow_max_distance]. Only used when [member directional_shadow_mode] is [constant SHADOW_PARALLEL_4_SPLITS]. */
        get directional_shadow_split_3(): float64
        set directional_shadow_split_3(value: float64)
        
        /** If `true`, shadow detail is sacrificed in exchange for smoother transitions between splits. Enabling shadow blend splitting also has a moderate performance cost. This is ignored when [member directional_shadow_mode] is [constant SHADOW_ORTHOGONAL]. */
        get directional_shadow_blend_splits(): boolean
        set directional_shadow_blend_splits(value: boolean)
        
        /** Proportion of [member directional_shadow_max_distance] at which point the shadow starts to fade. At [member directional_shadow_max_distance], the shadow will disappear. The default value is a balance between smooth fading and distant shadow visibility. If the camera moves fast and the [member directional_shadow_max_distance] is low, consider lowering [member directional_shadow_fade_start] below `0.8` to make shadow transitions less noticeable. On the other hand, if you tuned [member directional_shadow_max_distance] to cover the entire scene, you can set [member directional_shadow_fade_start] to `1.0` to prevent the shadow from fading in the distance (it will suddenly cut off instead). */
        get directional_shadow_fade_start(): float64
        set directional_shadow_fade_start(value: float64)
        
        /** The maximum distance for shadow splits. Increasing this value will make directional shadows visible from further away, at the cost of lower overall shadow detail and performance (since more objects need to be included in the directional shadow rendering). */
        get directional_shadow_max_distance(): float64
        set directional_shadow_max_distance(value: float64)
        
        /** Sets the size of the directional shadow pancake. The pancake offsets the start of the shadow's camera frustum to provide a higher effective depth resolution for the shadow. However, a high pancake size can cause artifacts in the shadows of large objects that are close to the edge of the frustum. Reducing the pancake size can help. Setting the size to `0` turns off the pancaking effect. */
        get directional_shadow_pancake_size(): float64
        set directional_shadow_pancake_size(value: float64)
        
        /** Whether this [DirectionalLight3D] is visible in the sky, in the scene, or both in the sky and in the scene. */
        get sky_mode(): int64
        set sky_mode(value: int64)
        /** @deprecated Internal use. Does not exist at runtime. */
        __godotNameMap: __NameMapDirectionalLight3D;
    }
    namespace ENetConnection {
        enum CompressionMode {
            /** No compression. This uses the most bandwidth, but has the upside of requiring the fewest CPU resources. This option may also be used to make network debugging using tools like Wireshark easier. */
            COMPRESS_NONE = 0,
            
            /** ENet's built-in range encoding. Works well on small packets, but is not the most efficient algorithm on packets larger than 4 KB. */
            COMPRESS_RANGE_CODER = 1,
            
            /** [url=https://fastlz.org/]FastLZ[/url] compression. This option uses less CPU resources compared to [constant COMPRESS_ZLIB], at the expense of using more bandwidth. */
            COMPRESS_FASTLZ = 2,
            
            /** [url=https://www.zlib.net/]Zlib[/url] compression. This option uses less bandwidth compared to [constant COMPRESS_FASTLZ], at the expense of using more CPU resources. */
            COMPRESS_ZLIB = 3,
            
            /** [url=https://facebook.github.io/zstd/]Zstandard[/url] compression. Note that this algorithm is not very efficient on packets smaller than 4 KB. Therefore, it's recommended to use other compression algorithms in most cases. */
            COMPRESS_ZSTD = 4,
        }
        enum EventType {
            /** An error occurred during [method service]. You will likely need to [method destroy] the host and recreate it. */
            EVENT_ERROR = -1,
            
            /** No event occurred within the specified time limit. */
            EVENT_NONE = 0,
            
            /** A connection request initiated by enet_host_connect has completed. The array will contain the peer which successfully connected. */
            EVENT_CONNECT = 1,
            
            /** A peer has disconnected. This event is generated on a successful completion of a disconnect initiated by [method ENetPacketPeer.peer_disconnect], if a peer has timed out, or if a connection request initialized by [method connect_to_host] has timed out. The array will contain the peer which disconnected. The data field contains user supplied data describing the disconnection, or 0, if none is available. */
            EVENT_DISCONNECT = 2,
            
            /** A packet has been received from a peer. The array will contain the peer which sent the packet and the channel number upon which the packet was received. The received packet will be queued to the associated [ENetPacketPeer]. */
            EVENT_RECEIVE = 3,
        }
        enum HostStatistic {
            /** Total data sent. */
            HOST_TOTAL_SENT_DATA = 0,
            
            /** Total UDP packets sent. */
            HOST_TOTAL_SENT_PACKETS = 1,
            
            /** Total data received. */
            HOST_TOTAL_RECEIVED_DATA = 2,
            
            /** Total UDP packets received. */
            HOST_TOTAL_RECEIVED_PACKETS = 3,
        }
    }
    /** @deprecated Internal use. Does not exist at runtime. */
    interface __NameMapENetConnection extends __NameMapRefCounted {
    }
    /** A wrapper class for an [url=http://enet.bespin.org/group__host.html]ENetHost[/url].  
     *  	  
     *  @link https://docs.godotengine.org/en/4.5/classes/class_enetconnection.html  
     */
    class ENetConnection extends RefCounted {
        constructor(identifier?: any)
        /** Creates an ENetHost bound to the given [param bind_address] and [param bind_port] that allows up to [param max_peers] connected peers, each allocating up to [param max_channels] channels, optionally limiting bandwidth to [param in_bandwidth] and [param out_bandwidth] (if greater than zero).  
         *      
         *  **Note:** It is necessary to create a host in both client and server in order to establish a connection.  
         */
        create_host_bound(bind_address: string, bind_port: int64, max_peers?: int64 /* = 32 */, max_channels?: int64 /* = 0 */, in_bandwidth?: int64 /* = 0 */, out_bandwidth?: int64 /* = 0 */): Error
        
        /** Creates an ENetHost that allows up to [param max_peers] connected peers, each allocating up to [param max_channels] channels, optionally limiting bandwidth to [param in_bandwidth] and [param out_bandwidth] (if greater than zero).  
         *  This method binds a random available dynamic UDP port on the host machine at the  *unspecified*  address. Use [method create_host_bound] to specify the address and port.  
         *      
         *  **Note:** It is necessary to create a host in both client and server in order to establish a connection.  
         */
        create_host(max_peers?: int64 /* = 32 */, max_channels?: int64 /* = 0 */, in_bandwidth?: int64 /* = 0 */, out_bandwidth?: int64 /* = 0 */): Error
        
        /** Destroys the host and all resources associated with it. */
        destroy(): void
        
        /** Initiates a connection to a foreign [param address] using the specified [param port] and allocating the requested [param channels]. Optional [param data] can be passed during connection in the form of a 32 bit integer.  
         *      
         *  **Note:** You must call either [method create_host] or [method create_host_bound] on both ends before calling this method.  
         */
        connect_to_host(address: string, port: int64, channels?: int64 /* = 0 */, data?: int64 /* = 0 */): null | ENetPacketPeer
        
        /** Waits for events on this connection and shuttles packets between the host and its peers, with the given [param timeout] (in milliseconds). The returned [Array] will have 4 elements. An [enum EventType], the [ENetPacketPeer] which generated the event, the event associated data (if any), the event associated channel (if any). If the generated event is [constant EVENT_RECEIVE], the received packet will be queued to the associated [ENetPacketPeer].  
         *  Call this function regularly to handle connections, disconnections, and to receive new packets.  
         *      
         *  **Note:** This method must be called on both ends involved in the event (sending and receiving hosts).  
         */
        service(timeout?: int64 /* = 0 */): GArray
        
        /** Sends any queued packets on the host specified to its designated peers. */
        flush(): void
        
        /** Adjusts the bandwidth limits of a host. */
        bandwidth_limit(in_bandwidth?: int64 /* = 0 */, out_bandwidth?: int64 /* = 0 */): void
        
        /** Limits the maximum allowed channels of future incoming connections. */
        channel_limit(limit: int64): void
        
        /** Queues a [param packet] to be sent to all peers associated with the host over the specified [param channel]. See [ENetPacketPeer] `FLAG_*` constants for available packet flags. */
        broadcast(channel: int64, packet: PackedByteArray | byte[] | ArrayBuffer, flags: int64): void
        
        /** Sets the compression method used for network packets. These have different tradeoffs of compression speed versus bandwidth, you may need to test which one works best for your use case if you use compression at all.  
         *      
         *  **Note:** Most games' network design involve sending many small packets frequently (smaller than 4 KB each). If in doubt, it is recommended to keep the default compression algorithm as it works best on these small packets.  
         *      
         *  **Note:** The compression mode must be set to the same value on both the server and all its clients. Clients will fail to connect if the compression mode set on the client differs from the one set on the server.  
         */
        compress(mode: ENetConnection.CompressionMode): void
        
        /** Configure this ENetHost to use the custom Godot extension allowing DTLS encryption for ENet servers. Call this right after [method create_host_bound] to have ENet expect peers to connect using DTLS. See [method TLSOptions.server]. */
        dtls_server_setup(server_options: TLSOptions): Error
        
        /** Configure this ENetHost to use the custom Godot extension allowing DTLS encryption for ENet clients. Call this before [method connect_to_host] to have ENet connect using DTLS validating the server certificate against [param hostname]. You can pass the optional [param client_options] parameter to customize the trusted certification authorities, or disable the common name verification. See [method TLSOptions.client] and [method TLSOptions.client_unsafe]. */
        dtls_client_setup(hostname: string, client_options?: TLSOptions /* = undefined */): Error
        
        /** Configures the DTLS server to automatically drop new connections.  
         *      
         *  **Note:** This method is only relevant after calling [method dtls_server_setup].  
         */
        refuse_new_connections(refuse: boolean): void
        
        /** Returns and resets host statistics. */
        pop_statistic(statistic: ENetConnection.HostStatistic): float64
        
        /** Returns the maximum number of channels allowed for connected peers. */
        get_max_channels(): int64
        
        /** Returns the local port to which this peer is bound. */
        get_local_port(): int64
        
        /** Returns the list of peers associated with this host.  
         *      
         *  **Note:** This list might include some peers that are not fully connected or are still being disconnected.  
         */
        get_peers(): GArray<ENetPacketPeer>
        
        /** Sends a [param packet] toward a destination from the address and port currently bound by this ENetConnection instance.  
         *  This is useful as it serves to establish entries in NAT routing tables on all devices between this bound instance and the public facing internet, allowing a prospective client's connection packets to be routed backward through the NAT device(s) between the public internet and this host.  
         *  This requires forward knowledge of a prospective client's address and communication port as seen by the public internet - after any NAT devices have handled their connection request. This information can be obtained by a [url=https://en.wikipedia.org/wiki/STUN]STUN[/url] service, and must be handed off to your host by an entity that is not the prospective client. This will never work for a client behind a Symmetric NAT due to the nature of the Symmetric NAT routing algorithm, as their IP and Port cannot be known beforehand.  
         */
        socket_send(destination_address: string, destination_port: int64, packet: PackedByteArray | byte[] | ArrayBuffer): void
        /** @deprecated Internal use. Does not exist at runtime. */
        __godotNameMap: __NameMapENetConnection;
    }
    /** @deprecated Internal use. Does not exist at runtime. */
    interface __NameMapENetMultiplayerPeer extends __NameMapMultiplayerPeer {
    }
    /** A MultiplayerPeer implementation using the [url=http://enet.bespin.org/index.html]ENet[/url] library.  
     *  	  
     *  @link https://docs.godotengine.org/en/4.5/classes/class_enetmultiplayerpeer.html  
     */
    class ENetMultiplayerPeer extends MultiplayerPeer {
        constructor(identifier?: any)
        /** Create server that listens to connections via [param port]. The port needs to be an available, unused port between 0 and 65535. Note that ports below 1024 are privileged and may require elevated permissions depending on the platform. To change the interface the server listens on, use [method set_bind_ip]. The default IP is the wildcard `"*"`, which listens on all available interfaces. [param max_clients] is the maximum number of clients that are allowed at once, any number up to 4095 may be used, although the achievable number of simultaneous clients may be far lower and depends on the application. For additional details on the bandwidth parameters, see [method create_client]. Returns [constant OK] if a server was created, [constant ERR_ALREADY_IN_USE] if this ENetMultiplayerPeer instance already has an open connection (in which case you need to call [method MultiplayerPeer.close] first) or [constant ERR_CANT_CREATE] if the server could not be created. */
        create_server(port: int64, max_clients?: int64 /* = 32 */, max_channels?: int64 /* = 0 */, in_bandwidth?: int64 /* = 0 */, out_bandwidth?: int64 /* = 0 */): Error
        
        /** Create client that connects to a server at [param address] using specified [param port]. The given address needs to be either a fully qualified domain name (e.g. `"www.example.com"`) or an IP address in IPv4 or IPv6 format (e.g. `"192.168.1.1"`). The [param port] is the port the server is listening on. The [param channel_count] parameter can be used to specify the number of ENet channels allocated for the connection. The [param in_bandwidth] and [param out_bandwidth] parameters can be used to limit the incoming and outgoing bandwidth to the given number of bytes per second. The default of 0 means unlimited bandwidth. Note that ENet will strategically drop packets on specific sides of a connection between peers to ensure the peer's bandwidth is not overwhelmed. The bandwidth parameters also determine the window size of a connection which limits the amount of reliable packets that may be in transit at any given time. Returns [constant OK] if a client was created, [constant ERR_ALREADY_IN_USE] if this ENetMultiplayerPeer instance already has an open connection (in which case you need to call [method MultiplayerPeer.close] first) or [constant ERR_CANT_CREATE] if the client could not be created. If [param local_port] is specified, the client will also listen to the given port; this is useful for some NAT traversal techniques. */
        create_client(address: string, port: int64, channel_count?: int64 /* = 0 */, in_bandwidth?: int64 /* = 0 */, out_bandwidth?: int64 /* = 0 */, local_port?: int64 /* = 0 */): Error
        
        /** Initialize this [MultiplayerPeer] in mesh mode. The provided [param unique_id] will be used as the local peer network unique ID once assigned as the [member MultiplayerAPI.multiplayer_peer]. In the mesh configuration you will need to set up each new peer manually using [ENetConnection] before calling [method add_mesh_peer]. While this technique is more advanced, it allows for better control over the connection process (e.g. when dealing with NAT punch-through) and for better distribution of the network load (which would otherwise be more taxing on the server). */
        create_mesh(unique_id: int64): Error
        
        /** Add a new remote peer with the given [param peer_id] connected to the given [param host].  
         *      
         *  **Note:** The [param host] must have exactly one peer in the [constant ENetPacketPeer.STATE_CONNECTED] state.  
         */
        add_mesh_peer(peer_id: int64, host: ENetConnection): Error
        
        /** The IP used when creating a server. This is set to the wildcard `"*"` by default, which binds to all available interfaces. The given IP needs to be in IPv4 or IPv6 address format, for example: `"192.168.1.1"`. */
        set_bind_ip(ip: string): void
        
        /** Returns the [ENetPacketPeer] associated to the given [param id]. */
        get_peer(id: int64): null | ENetPacketPeer
        
        /** The underlying [ENetConnection] created after [method create_client] and [method create_server]. */
        get host(): null | ENetConnection
        /** @deprecated Internal use. Does not exist at runtime. */
        __godotNameMap: __NameMapENetMultiplayerPeer;
    }
    namespace ENetPacketPeer {
        enum PeerState {
            /** The peer is disconnected. */
            STATE_DISCONNECTED = 0,
            
            /** The peer is currently attempting to connect. */
            STATE_CONNECTING = 1,
            
            /** The peer has acknowledged the connection request. */
            STATE_ACKNOWLEDGING_CONNECT = 2,
            
            /** The peer is currently connecting. */
            STATE_CONNECTION_PENDING = 3,
            
            /** The peer has successfully connected, but is not ready to communicate with yet ([constant STATE_CONNECTED]). */
            STATE_CONNECTION_SUCCEEDED = 4,
            
            /** The peer is currently connected and ready to communicate with. */
            STATE_CONNECTED = 5,
            
            /** The peer is expected to disconnect after it has no more outgoing packets to send. */
            STATE_DISCONNECT_LATER = 6,
            
            /** The peer is currently disconnecting. */
            STATE_DISCONNECTING = 7,
            
            /** The peer has acknowledged the disconnection request. */
            STATE_ACKNOWLEDGING_DISCONNECT = 8,
            
            /** The peer has lost connection, but is not considered truly disconnected (as the peer didn't acknowledge the disconnection request). */
            STATE_ZOMBIE = 9,
        }
        enum PeerStatistic {
            /** Mean packet loss of reliable packets as a ratio with respect to the [constant PACKET_LOSS_SCALE]. */
            PEER_PACKET_LOSS = 0,
            
            /** Packet loss variance. */
            PEER_PACKET_LOSS_VARIANCE = 1,
            
            /** The time at which packet loss statistics were last updated (in milliseconds since the connection started). The interval for packet loss statistics updates is 10 seconds, and at least one packet must have been sent since the last statistics update. */
            PEER_PACKET_LOSS_EPOCH = 2,
            
            /** Mean packet round trip time for reliable packets. */
            PEER_ROUND_TRIP_TIME = 3,
            
            /** Variance of the mean round trip time. */
            PEER_ROUND_TRIP_TIME_VARIANCE = 4,
            
            /** Last recorded round trip time for a reliable packet. */
            PEER_LAST_ROUND_TRIP_TIME = 5,
            
            /** Variance of the last trip time recorded. */
            PEER_LAST_ROUND_TRIP_TIME_VARIANCE = 6,
            
            /** The peer's current throttle status. */
            PEER_PACKET_THROTTLE = 7,
            
            /** The maximum number of unreliable packets that should not be dropped. This value is always greater than or equal to `1`. The initial value is equal to [constant PACKET_THROTTLE_SCALE]. */
            PEER_PACKET_THROTTLE_LIMIT = 8,
            
            /** Internal value used to increment the packet throttle counter. The value is hardcoded to `7` and cannot be changed. You probably want to look at [constant PEER_PACKET_THROTTLE_ACCELERATION] instead. */
            PEER_PACKET_THROTTLE_COUNTER = 9,
            
            /** The time at which throttle statistics were last updated (in milliseconds since the connection started). The interval for throttle statistics updates is [constant PEER_PACKET_THROTTLE_INTERVAL]. */
            PEER_PACKET_THROTTLE_EPOCH = 10,
            
            /** The throttle's acceleration factor. Higher values will make ENet adapt to fluctuating network conditions faster, causing unrelaible packets to be sent  *more*  often. The default value is `2`. */
            PEER_PACKET_THROTTLE_ACCELERATION = 11,
            
            /** The throttle's deceleration factor. Higher values will make ENet adapt to fluctuating network conditions faster, causing unrelaible packets to be sent  *less*  often. The default value is `2`. */
            PEER_PACKET_THROTTLE_DECELERATION = 12,
            
            /** The interval over which the lowest mean round trip time should be measured for use by the throttle mechanism (in milliseconds). The default value is `5000`. */
            PEER_PACKET_THROTTLE_INTERVAL = 13,
        }
    }
    /** @deprecated Internal use. Does not exist at runtime. */
    interface __NameMapENetPacketPeer extends __NameMapPacketPeer {
    }
    /** A wrapper class for an [url=http://enet.bespin.org/group__peer.html]ENetPeer[/url].  
     *  	  
     *  @link https://docs.godotengine.org/en/4.5/classes/class_enetpacketpeer.html  
     */
    class ENetPacketPeer extends PacketPeer {
        /** The reference scale for packet loss. See [method get_statistic] and [constant PEER_PACKET_LOSS]. */
        static readonly PACKET_LOSS_SCALE = 65536
        
        /** The reference value for throttle configuration. The default value is `32`. See [method throttle_configure]. */
        static readonly PACKET_THROTTLE_SCALE = 32
        
        /** Mark the packet to be sent as reliable. */
        static readonly FLAG_RELIABLE = 1
        
        /** Mark the packet to be sent unsequenced (unreliable). */
        static readonly FLAG_UNSEQUENCED = 2
        
        /** Mark the packet to be sent unreliable even if the packet is too big and needs fragmentation (increasing the chance of it being dropped). */
        static readonly FLAG_UNRELIABLE_FRAGMENT = 8
        constructor(identifier?: any)
        
        /** Request a disconnection from a peer. An [constant ENetConnection.EVENT_DISCONNECT] will be generated during [method ENetConnection.service] once the disconnection is complete. */
        peer_disconnect(data?: int64 /* = 0 */): void
        
        /** Request a disconnection from a peer, but only after all queued outgoing packets are sent. An [constant ENetConnection.EVENT_DISCONNECT] will be generated during [method ENetConnection.service] once the disconnection is complete. */
        peer_disconnect_later(data?: int64 /* = 0 */): void
        
        /** Force an immediate disconnection from a peer. No [constant ENetConnection.EVENT_DISCONNECT] will be generated. The foreign peer is not guaranteed to receive the disconnect notification, and is reset immediately upon return from this function. */
        peer_disconnect_now(data?: int64 /* = 0 */): void
        
        /** Sends a ping request to a peer. ENet automatically pings all connected peers at regular intervals, however, this function may be called to ensure more frequent ping requests. */
        ping(): void
        
        /** Sets the [param ping_interval] in milliseconds at which pings will be sent to a peer. Pings are used both to monitor the liveness of the connection and also to dynamically adjust the throttle during periods of low traffic so that the throttle has reasonable responsiveness during traffic spikes. The default ping interval is `500` milliseconds. */
        ping_interval(ping_interval: int64): void
        
        /** Forcefully disconnects a peer. The foreign host represented by the peer is not notified of the disconnection and will timeout on its connection to the local host. */
        reset(): void
        
        /** Queues a [param packet] to be sent over the specified [param channel]. See `FLAG_*` constants for available packet flags. */
        send(channel: int64, packet: PackedByteArray | byte[] | ArrayBuffer, flags: int64): Error
        
        /** Configures throttle parameter for a peer.  
         *  Unreliable packets are dropped by ENet in response to the varying conditions of the Internet connection to the peer. The throttle represents a probability that an unreliable packet should not be dropped and thus sent by ENet to the peer. By measuring fluctuations in round trip times of reliable packets over the specified [param interval], ENet will either increase the probability by the amount specified in the [param acceleration] parameter, or decrease it by the amount specified in the [param deceleration] parameter (both are ratios to [constant PACKET_THROTTLE_SCALE]).  
         *  When the throttle has a value of [constant PACKET_THROTTLE_SCALE], no unreliable packets are dropped by ENet, and so 100% of all unreliable packets will be sent.  
         *  When the throttle has a value of `0`, all unreliable packets are dropped by ENet, and so 0% of all unreliable packets will be sent.  
         *  Intermediate values for the throttle represent intermediate probabilities between 0% and 100% of unreliable packets being sent. The bandwidth limits of the local and foreign hosts are taken into account to determine a sensible limit for the throttle probability above which it should not raise even in the best of conditions.  
         */
        throttle_configure(interval: int64, acceleration: int64, deceleration: int64): void
        
        /** Sets the timeout parameters for a peer. The timeout parameters control how and when a peer will timeout from a failure to acknowledge reliable traffic. Timeout values are expressed in milliseconds.  
         *  The [param timeout] is a factor that, multiplied by a value based on the average round trip time, will determine the timeout limit for a reliable packet. When that limit is reached, the timeout will be doubled, and the peer will be disconnected if that limit has reached [param timeout_min]. The [param timeout_max] parameter, on the other hand, defines a fixed timeout for which any packet must be acknowledged or the peer will be dropped.  
         */
        set_timeout(timeout: int64, timeout_min: int64, timeout_max: int64): void
        
        /** Returns the ENet flags of the next packet in the received queue. See `FLAG_*` constants for available packet flags. Note that not all flags are replicated from the sending peer to the receiving peer. */
        get_packet_flags(): int64
        
        /** Returns the IP address of this peer. */
        get_remote_address(): string
        
        /** Returns the remote port of this peer. */
        get_remote_port(): int64
        
        /** Returns the requested [param statistic] for this peer. */
        get_statistic(statistic: ENetPacketPeer.PeerStatistic): float64
        
        /** Returns the current peer state. */
        get_state(): ENetPacketPeer.PeerState
        
        /** Returns the number of channels allocated for communication with peer. */
        get_channels(): int64
        
        /** Returns `true` if the peer is currently active (i.e. the associated [ENetConnection] is still valid). */
        is_active(): boolean
        /** @deprecated Internal use. Does not exist at runtime. */
        __godotNameMap: __NameMapENetPacketPeer;
    }
    /** @deprecated Internal use. Does not exist at runtime. */
    interface __NameMapEditorCommandPalette extends __NameMapConfirmationDialog {
    }
    /** Godot editor's command palette.  
     *  	  
     *  @link https://docs.godotengine.org/en/4.5/classes/class_editorcommandpalette.html  
     */
    class EditorCommandPalette<Map extends NodePathMap = any> extends ConfirmationDialog<Map> {
        constructor(identifier?: any)
        /** Adds a custom command to EditorCommandPalette.  
         *  - [param command_name]: [String] (Name of the **Command**. This is displayed to the user.)  
         *  - [param key_name]: [String] (Name of the key for a particular **Command**. This is used to uniquely identify the **Command**.)  
         *  - [param binded_callable]: [Callable] (Callable of the **Command**. This will be executed when the **Command** is selected.)  
         *  - [param shortcut_text]: [String] (Shortcut text of the **Command** if available.)  
         */
        add_command(command_name: string, key_name: string, binded_callable: Callable, shortcut_text?: string /* = 'None' */): void
        
        /** Removes the custom command from EditorCommandPalette.  
         *  - [param key_name]: [String] (Name of the key for a particular **Command**.)  
         */
        remove_command(key_name: string): void
        /** @deprecated Internal use. Does not exist at runtime. */
        __godotNameMap: __NameMapEditorCommandPalette;
    }
    namespace EditorContextMenuPlugin {
        enum ContextMenuSlot {
            /** Context menu of Scene dock. [method _popup_menu] will be called with a list of paths to currently selected nodes, while option callback will receive the list of currently selected nodes. */
            CONTEXT_SLOT_SCENE_TREE = 0,
            
            /** Context menu of FileSystem dock. [method _popup_menu] and option callback will be called with list of paths of the currently selected files. */
            CONTEXT_SLOT_FILESYSTEM = 1,
            
            /** Context menu of Script editor's script tabs. [method _popup_menu] will be called with the path to the currently edited script, while option callback will receive reference to that script. */
            CONTEXT_SLOT_SCRIPT_EDITOR = 2,
            
            /** The "Create..." submenu of FileSystem dock's context menu, or the "New" section of the main context menu when empty space is clicked. [method _popup_menu] and option callback will be called with the path of the currently selected folder. When clicking the empty space, the list of paths for popup method will be empty.  
             *    
             */
            CONTEXT_SLOT_FILESYSTEM_CREATE = 3,
            
            /** Context menu of Script editor's code editor. [method _popup_menu] will be called with the path to the [CodeEdit] node. You can fetch it using this code:  
             *    
             *  The option callback will receive reference to that node. You can use [CodeEdit] methods to perform symbol lookups etc.  
             */
            CONTEXT_SLOT_SCRIPT_EDITOR_CODE = 4,
            
            /** Context menu of scene tabs. [method _popup_menu] will be called with the path of the clicked scene, or empty [PackedStringArray] if the menu was opened on empty space. The option callback will receive the path of the clicked scene, or empty [String] if none was clicked. */
            CONTEXT_SLOT_SCENE_TABS = 5,
            
            /** Context menu of 2D editor's basic right-click menu. [method _popup_menu] will be called with paths to all [CanvasItem] nodes under the cursor. You can fetch them using this code:  
             *    
             *  The paths array is empty if there weren't any nodes under cursor. The option callback will receive a typed array of [CanvasItem] nodes.  
             */
            CONTEXT_SLOT_2D_EDITOR = 6,
        }
    }
    /** @deprecated Internal use. Does not exist at runtime. */
    interface __NameMapEditorContextMenuPlugin extends __NameMapRefCounted {
    }
    /** Plugin for adding custom context menus in the editor.  
     *  	  
     *  @link https://docs.godotengine.org/en/4.5/classes/class_editorcontextmenuplugin.html  
     */
    class EditorContextMenuPlugin extends RefCounted {
        constructor(identifier?: any)
        /** Called when creating a context menu, custom options can be added by using the [method add_context_menu_item] or [method add_context_menu_item_from_shortcut] functions. [param paths] contains currently selected paths (depending on menu), which can be used to conditionally add options. */
        /* gdvirtual */ _popup_menu(paths: PackedStringArray | string[]): void
        
        /** Registers a shortcut associated with the plugin's context menu. This method should be called once (e.g. in plugin's [method Object._init]). [param callback] will be called when user presses the specified [param shortcut] while the menu's context is in effect (e.g. FileSystem dock is focused). Callback should take single [Array] argument; array contents depend on context menu slot.  
         *    
         */
        add_menu_shortcut(shortcut: Shortcut, callback: Callable): void
        
        /** Add custom option to the context menu of the plugin's specified slot. When the option is activated, [param callback] will be called. Callback should take single [Array] argument; array contents depend on context menu slot.  
         *    
         *  If you want to assign shortcut to the menu item, use [method add_context_menu_item_from_shortcut] instead.  
         */
        add_context_menu_item(name: string, callback: Callable, icon?: Texture2D /* = undefined */): void
        
        /** Add custom option to the context menu of the plugin's specified slot. The option will have the [param shortcut] assigned and reuse its callback. The shortcut has to be registered beforehand with [method add_menu_shortcut].  
         *    
         */
        add_context_menu_item_from_shortcut(name: string, shortcut: Shortcut, icon?: Texture2D /* = undefined */): void
        
        /** Add a submenu to the context menu of the plugin's specified slot. The submenu is not automatically handled, you need to connect to its signals yourself. Also the submenu is freed on every popup, so provide a new [PopupMenu] every time.  
         *    
         */
        add_context_submenu_item(name: string, menu: PopupMenu, icon?: Texture2D /* = undefined */): void
        /** @deprecated Internal use. Does not exist at runtime. */
        __godotNameMap: __NameMapEditorContextMenuPlugin;
    }
    /** @deprecated Internal use. Does not exist at runtime. */
    interface __NameMapEditorDebuggerPlugin extends __NameMapRefCounted {
    }
    /** A base class to implement debugger plugins.  
     *  	  
     *  @link https://docs.godotengine.org/en/4.5/classes/class_editordebuggerplugin.html  
     */
    class EditorDebuggerPlugin extends RefCounted {
        constructor(identifier?: any)
        /** Override this method to be notified whenever a new [EditorDebuggerSession] is created. Note that the session may be inactive during this stage. */
        /* gdvirtual */ _setup_session(session_id: int64): void
        
        /** Override this method to enable receiving messages from the debugger. If [param capture] is "my_message" then messages starting with "my_message:" will be passed to the [method _capture] method. */
        /* gdvirtual */ _has_capture(capture: string): boolean
        
        /** Override this method to process incoming messages. The [param session_id] is the ID of the [EditorDebuggerSession] that received the [param message]. Use [method get_session] to retrieve the session. This method should return `true` if the message is recognized. */
        /* gdvirtual */ _capture(message: string, data: GArray, session_id: int64): boolean
        
        /** Override this method to be notified when a breakpoint line has been clicked in the debugger breakpoint panel. */
        /* gdvirtual */ _goto_script_line(script: Script, line: int64): void
        
        /** Override this method to be notified when all breakpoints are cleared in the editor. */
        /* gdvirtual */ _breakpoints_cleared_in_tree(): void
        
        /** Override this method to be notified when a breakpoint is set in the editor. */
        /* gdvirtual */ _breakpoint_set_in_tree(script: Script, line: int64, enabled: boolean): void
        
        /** Returns the [EditorDebuggerSession] with the given [param id]. */
        get_session(id: int64): null | EditorDebuggerSession
        
        /** Returns an array of [EditorDebuggerSession] currently available to this debugger plugin.  
         *      
         *  **Note:** Sessions in the array may be inactive, check their state via [method EditorDebuggerSession.is_active].  
         */
        get_sessions(): GArray
        /** @deprecated Internal use. Does not exist at runtime. */
        __godotNameMap: __NameMapEditorDebuggerPlugin;
    }
    /** @deprecated Internal use. Does not exist at runtime. */
    interface __NameMapEditorDebuggerSession extends __NameMapRefCounted {
    }
    /** A class to interact with the editor debugger.  
     *  	  
     *  @link https://docs.godotengine.org/en/4.5/classes/class_editordebuggersession.html  
     */
    class EditorDebuggerSession extends RefCounted {
        constructor(identifier?: any)
        /** Sends the given [param message] to the attached remote instance, optionally passing additionally [param data]. See [EngineDebugger] for how to retrieve those messages. */
        send_message(message: string, data?: GArray /* = [] */): void
        
        /** Toggle the given [param profiler] on the attached remote instance, optionally passing additionally [param data]. See [EngineProfiler] for more details. */
        toggle_profiler(profiler: string, enable: boolean, data?: GArray /* = [] */): void
        
        /** Returns `true` if the attached remote instance is currently in the debug loop. */
        is_breaked(): boolean
        
        /** Returns `true` if the attached remote instance can be debugged. */
        is_debuggable(): boolean
        
        /** Returns `true` if the debug session is currently attached to a remote instance. */
        is_active(): boolean
        
        /** Adds the given [param control] to the debug session UI in the debugger bottom panel. The [param control]'s node name will be used as the tab title. */
        add_session_tab(control: Control): void
        
        /** Removes the given [param control] from the debug session UI in the debugger bottom panel. */
        remove_session_tab(control: Control): void
        
        /** Enables or disables a specific breakpoint based on [param enabled], updating the Editor Breakpoint Panel accordingly. */
        set_breakpoint(path: string, line: int64, enabled: boolean): void
        
        /** Emitted when a remote instance is attached to this session (i.e. the session becomes active). */
        readonly started: Signal<() => void>
        
        /** Emitted when a remote instance is detached from this session (i.e. the session becomes inactive). */
        readonly stopped: Signal<() => void>
        
        /** Emitted when the attached remote instance enters a break state. If [param can_debug] is `true`, the remote instance will enter the debug loop. */
        readonly breaked: Signal<(can_debug: boolean) => void>
        
        /** Emitted when the attached remote instance exits a break state. */
        readonly continued: Signal<() => void>
        /** @deprecated Internal use. Does not exist at runtime. */
        __godotNameMap: __NameMapEditorDebuggerSession;
    }
    namespace EditorExportPlatform {
        enum ExportMessageType {
            /** Invalid message type used as the default value when no type is specified. */
            EXPORT_MESSAGE_NONE = 0,
            
            /** Message type for informational messages that have no effect on the export. */
            EXPORT_MESSAGE_INFO = 1,
            
            /** Message type for warning messages that should be addressed but still allow to complete the export. */
            EXPORT_MESSAGE_WARNING = 2,
            
            /** Message type for error messages that must be addressed and fail the export. */
            EXPORT_MESSAGE_ERROR = 3,
        }
        enum DebugFlags {
            /** Flag is set if the remotely debugged project is expected to use the remote file system. If set, [method gen_export_flags] will append `--remote-fs` and `--remote-fs-password` (if [member EditorSettings.filesystem/file_server/password] is defined) command line arguments to the returned list. */
            DEBUG_FLAG_DUMB_CLIENT = 1,
            
            /** Flag is set if remote debug is enabled. If set, [method gen_export_flags] will append `--remote-debug` and `--breakpoints` (if breakpoints are selected in the script editor or added by the plugin) command line arguments to the returned list. */
            DEBUG_FLAG_REMOTE_DEBUG = 2,
            
            /** Flag is set if remotely debugged project is running on the localhost. If set, [method gen_export_flags] will use `localhost` instead of [member EditorSettings.network/debug/remote_host] as remote debugger host. */
            DEBUG_FLAG_REMOTE_DEBUG_LOCALHOST = 4,
            
            /** Flag is set if the "Visible Collision Shapes" remote debug option is enabled. If set, [method gen_export_flags] will append the `--debug-collisions` command line argument to the returned list. */
            DEBUG_FLAG_VIEW_COLLISIONS = 8,
            
            /** Flag is set if the "Visible Navigation" remote debug option is enabled. If set, [method gen_export_flags] will append the `--debug-navigation` command line argument to the returned list. */
            DEBUG_FLAG_VIEW_NAVIGATION = 16,
        }
    }
    /** @deprecated Internal use. Does not exist at runtime. */
    interface __NameMapEditorExportPlatform extends __NameMapRefCounted {
    }
    /** Identifies a supported export platform, and internally provides the functionality of exporting to that platform.  
     *  	  
     *  @link https://docs.godotengine.org/en/4.5/classes/class_editorexportplatform.html  
     */
    class EditorExportPlatform extends RefCounted {
        constructor(identifier?: any)
        /** Returns the name of the export operating system handled by this [EditorExportPlatform] class, as a friendly string. Possible return values are `Windows`, `Linux`, `macOS`, `Android`, `iOS`, and `Web`. */
        get_os_name(): string
        
        /** Create a new preset for this platform. */
        create_preset(): EditorExportPreset
        
        /** Locates export template for the platform, and returns [Dictionary] with the following keys: `path: String` and `error: String`. This method is provided for convenience and custom export platforms aren't required to use it or keep export templates stored in the same way official templates are. */
        find_export_template(template_file_name: string): GDictionary
        
        /** Returns array of [EditorExportPreset]s for this platform. */
        get_current_presets(): GArray
        
        /** Saves PCK archive and returns [Dictionary] with the following keys: `result: Error`, `so_files: Array` (array of the shared/static objects which contains dictionaries with the following keys: `path: String`, `tags: PackedStringArray`, and `target_folder: String`).  
         *  If [param embed] is `true`, PCK content is appended to the end of [param path] file and return [Dictionary] additionally include following keys: `embedded_start: int` (embedded PCK offset) and `embedded_size: int` (embedded PCK size).  
         */
        save_pack(preset: EditorExportPreset, debug: boolean, path: string, embed?: boolean /* = false */): GDictionary
        
        /** Saves ZIP archive and returns [Dictionary] with the following keys: `result: Error`, `so_files: Array` (array of the shared/static objects which contains dictionaries with the following keys: `path: String`, `tags: PackedStringArray`, and `target_folder: String`). */
        save_zip(preset: EditorExportPreset, debug: boolean, path: string): GDictionary
        
        /** Saves patch PCK archive and returns [Dictionary] with the following keys: `result: Error`, `so_files: Array` (array of the shared/static objects which contains dictionaries with the following keys: `path: String`, `tags: PackedStringArray`, and `target_folder: String`). */
        save_pack_patch(preset: EditorExportPreset, debug: boolean, path: string): GDictionary
        
        /** Saves patch ZIP archive and returns [Dictionary] with the following keys: `result: Error`, `so_files: Array` (array of the shared/static objects which contains dictionaries with the following keys: `path: String`, `tags: PackedStringArray`, and `target_folder: String`). */
        save_zip_patch(preset: EditorExportPreset, debug: boolean, path: string): GDictionary
        
        /** Generates array of command line arguments for the default export templates for the debug flags and editor settings. */
        gen_export_flags(flags: EditorExportPlatform.DebugFlags): PackedStringArray
        
        /** Exports project files for the specified preset. This method can be used to implement custom export format, other than PCK and ZIP. One of the callbacks is called for each exported file.  
         *  [param save_cb] is called for all exported files and have the following arguments: `file_path: String`, `file_data: PackedByteArray`, `file_index: int`, `file_count: int`, `encryption_include_filters: PackedStringArray`, `encryption_exclude_filters: PackedStringArray`, `encryption_key: PackedByteArray`.  
         *  [param shared_cb] is called for exported native shared/static libraries and have the following arguments: `file_path: String`, `tags: PackedStringArray`, `target_folder: String`.  
         *      
         *  **Note:** `file_index` and `file_count` are intended for progress tracking only and aren't necessarily unique and precise.  
         */
        export_project_files(preset: EditorExportPreset, debug: boolean, save_cb: Callable, shared_cb?: Callable /* = new Callable() */): Error
        
        /** Creates a full project at [param path] for the specified [param preset]. */
        export_project(preset: EditorExportPreset, debug: boolean, path: string, flags?: EditorExportPlatform.DebugFlags /* = 0 */): Error
        
        /** Creates a PCK archive at [param path] for the specified [param preset]. */
        export_pack(preset: EditorExportPreset, debug: boolean, path: string, flags?: EditorExportPlatform.DebugFlags /* = 0 */): Error
        
        /** Create a ZIP archive at [param path] for the specified [param preset]. */
        export_zip(preset: EditorExportPreset, debug: boolean, path: string, flags?: EditorExportPlatform.DebugFlags /* = 0 */): Error
        
        /** Creates a patch PCK archive at [param path] for the specified [param preset], containing only the files that have changed since the last patch.  
         *      
         *  **Note:** [param patches] is an optional override of the set of patches defined in the export preset. When empty the patches defined in the export preset will be used instead.  
         */
        export_pack_patch(preset: EditorExportPreset, debug: boolean, path: string, patches?: PackedStringArray | string[] /* = [] */, flags?: EditorExportPlatform.DebugFlags /* = 0 */): Error
        
        /** Create a patch ZIP archive at [param path] for the specified [param preset], containing only the files that have changed since the last patch.  
         *      
         *  **Note:** [param patches] is an optional override of the set of patches defined in the export preset. When empty the patches defined in the export preset will be used instead.  
         */
        export_zip_patch(preset: EditorExportPreset, debug: boolean, path: string, patches?: PackedStringArray | string[] /* = [] */, flags?: EditorExportPlatform.DebugFlags /* = 0 */): Error
        
        /** Clears the export log. */
        clear_messages(): void
        
        /** Adds a message to the export log that will be displayed when exporting ends. */
        add_message(type: EditorExportPlatform.ExportMessageType, category: string, message: string): void
        
        /** Returns number of messages in the export log. */
        get_message_count(): int64
        
        /** Returns message type, for the message with [param index]. */
        get_message_type(index: int64): EditorExportPlatform.ExportMessageType
        
        /** Returns message category, for the message with [param index]. */
        get_message_category(index: int64): string
        
        /** Returns message text, for the message with [param index]. */
        get_message_text(index: int64): string
        
        /** Returns most severe message type currently present in the export log. */
        get_worst_message_type(): EditorExportPlatform.ExportMessageType
        
        /** Executes specified command on the remote host via SSH protocol and returns command output in the [param output]. */
        ssh_run_on_remote(host: string, port: string, ssh_arg: PackedStringArray | string[], cmd_args: string, output?: GArray /* = [] */, port_fwd?: int64 /* = -1 */): Error
        
        /** Executes specified command on the remote host via SSH protocol and returns process ID (on the remote host) without waiting for command to finish. */
        ssh_run_on_remote_no_wait(host: string, port: string, ssh_args: PackedStringArray | string[], cmd_args: string, port_fwd?: int64 /* = -1 */): int64
        
        /** Uploads specified file over SCP protocol to the remote host. */
        ssh_push_to_remote(host: string, port: string, scp_args: PackedStringArray | string[], src_file: string, dst_file: string): Error
        
        /** Returns additional files that should always be exported regardless of preset configuration, and are not part of the project source. The returned [Dictionary] contains filename keys ([String]) and their corresponding raw data ([PackedByteArray]). */
        get_internal_export_files(preset: EditorExportPreset, debug: boolean): GDictionary
        
        /** Returns array of core file names that always should be exported regardless of preset config. */
        static get_forced_export_files(preset?: EditorExportPreset /* = undefined */): PackedStringArray
        /** @deprecated Internal use. Does not exist at runtime. */
        __godotNameMap: __NameMapEditorExportPlatform;
    }
    /** @deprecated Internal use. Does not exist at runtime. */
    interface __NameMapEditorExportPlatformAndroid extends __NameMapEditorExportPlatform {
    }
    /** Exporter for Android.  
     *  	  
     *  @link https://docs.godotengine.org/en/4.5/classes/class_editorexportplatformandroid.html  
     */
    class EditorExportPlatformAndroid extends EditorExportPlatform {
        constructor(identifier?: any)
        /** @deprecated Internal use. Does not exist at runtime. */
        __godotNameMap: __NameMapEditorExportPlatformAndroid;
    }
    /** @deprecated Internal use. Does not exist at runtime. */
    interface __NameMapEditorExportPlatformAppleEmbedded extends __NameMapEditorExportPlatform {
    }
    /** Base class for the Apple embedded platform exporters (iOS and visionOS).  
     *  	  
     *  @link https://docs.godotengine.org/en/4.5/classes/class_editorexportplatformappleembedded.html  
     */
    class EditorExportPlatformAppleEmbedded extends EditorExportPlatform {
        constructor(identifier?: any)
        /** @deprecated Internal use. Does not exist at runtime. */
        __godotNameMap: __NameMapEditorExportPlatformAppleEmbedded;
    }
    /** @deprecated Internal use. Does not exist at runtime. */
    interface __NameMapEditorExportPlatformExtension extends __NameMapEditorExportPlatform {
    }
    /** Base class for custom [EditorExportPlatform] implementations (plugins).  
     *  	  
     *  @link https://docs.godotengine.org/en/4.5/classes/class_editorexportplatformextension.html  
     */
    class EditorExportPlatformExtension extends EditorExportPlatform {
        constructor(identifier?: any)
        /** Returns array of platform specific features for the specified [param preset]. */
        /* gdvirtual */ _get_preset_features(preset: EditorExportPreset): PackedStringArray
        
        /** Returns `true` if specified file is a valid executable (native executable or script) for the target platform. */
        /* gdvirtual */ _is_executable(path: string): boolean
        
        /** Returns a property list, as an [Array] of dictionaries. Each [Dictionary] must at least contain the `name: StringName` and `type: Variant.Type` entries.  
         *  Additionally, the following keys are supported:  
         *  - `hint: PropertyHint`  
         *  - `hint_string: String`  
         *  - `usage: PropertyUsageFlags`  
         *  - `class_name: StringName`  
         *  - `default_value: Variant`, default value of the property.  
         *  - `update_visibility: bool`, if set to `true`, [method _get_export_option_visibility] is called for each property when this property is changed.  
         *  - `required: bool`, if set to `true`, this property warnings are critical, and should be resolved to make export possible. This value is a hint for the [method _has_valid_export_configuration] implementation, and not used by the engine directly.  
         *  See also [method Object._get_property_list].  
         */
        /* gdvirtual */ _get_export_options(): GArray<GDictionary>
        
        /** Returns `true` if export options list is changed and presets should be updated. */
        /* gdvirtual */ _should_update_export_options(): boolean
        
        /** Validates [param option] and returns visibility for the specified [param preset]. Default implementation return `true` for all options. */
        /* gdvirtual */ _get_export_option_visibility(preset: EditorExportPreset, option: string): boolean
        
        /** Validates [param option] and returns warning message for the specified [param preset]. Default implementation return empty string for all options. */
        /* gdvirtual */ _get_export_option_warning(preset: EditorExportPreset, option: StringName): string
        
        /** Returns target OS name. */
        /* gdvirtual */ _get_os_name(): string
        
        /** Returns export platform name. */
        /* gdvirtual */ _get_name(): string
        
        /** Returns the platform logo displayed in the export dialog. The logo should be 32×32 pixels, adjusted for the current editor scale (see [method EditorInterface.get_editor_scale]). */
        /* gdvirtual */ _get_logo(): null | Texture2D
        
        /** Returns `true` if one-click deploy options are changed and editor interface should be updated. */
        /* gdvirtual */ _poll_export(): boolean
        
        /** Returns the number of devices (or other options) available in the one-click deploy menu. */
        /* gdvirtual */ _get_options_count(): int64
        
        /** Returns tooltip of the one-click deploy menu button. */
        /* gdvirtual */ _get_options_tooltip(): string
        
        /** Returns the item icon for the specified [param device] in the one-click deploy menu. The icon should be 16×16 pixels, adjusted for the current editor scale (see [method EditorInterface.get_editor_scale]). */
        /* gdvirtual */ _get_option_icon(device: int64): null | Texture2D
        
        /** Returns one-click deploy menu item label for the specified [param device]. */
        /* gdvirtual */ _get_option_label(device: int64): string
        
        /** Returns one-click deploy menu item tooltip for the specified [param device]. */
        /* gdvirtual */ _get_option_tooltip(device: int64): string
        
        /** Returns device architecture for one-click deploy. */
        /* gdvirtual */ _get_device_architecture(device: int64): string
        
        /** Called by the editor before platform is unregistered. */
        /* gdvirtual */ _cleanup(): void
        
        /** This method is called when [param device] one-click deploy menu option is selected.  
         *  Implementation should export project to a temporary location, upload and run it on the specific [param device], or perform another action associated with the menu item.  
         */
        /* gdvirtual */ _run(preset: EditorExportPreset, device: int64, debug_flags: EditorExportPlatform.DebugFlags): Error
        
        /** Returns the icon of the one-click deploy menu button. The icon should be 16×16 pixels, adjusted for the current editor scale (see [method EditorInterface.get_editor_scale]). */
        /* gdvirtual */ _get_run_icon(): null | Texture2D
        
        /** Returns `true`, if specified [param preset] is valid and can be exported. Use [method set_config_error] and [method set_config_missing_templates] to set error details.  
         *  Usual implementation can call [method _has_valid_export_configuration] and [method _has_valid_project_configuration] to determine if export is possible.  
         */
        /* gdvirtual */ _can_export(preset: EditorExportPreset, debug: boolean): boolean
        
        /** Returns `true` if export configuration is valid. */
        /* gdvirtual */ _has_valid_export_configuration(preset: EditorExportPreset, debug: boolean): boolean
        
        /** Returns `true` if project configuration is valid. */
        /* gdvirtual */ _has_valid_project_configuration(preset: EditorExportPreset): boolean
        
        /** Returns array of supported binary extensions for the full project export. */
        /* gdvirtual */ _get_binary_extensions(preset: EditorExportPreset): PackedStringArray
        
        /** Creates a full project at [param path] for the specified [param preset].  
         *  This method is called when "Export" button is pressed in the export dialog.  
         *  This method implementation can call [method EditorExportPlatform.save_pack] or [method EditorExportPlatform.save_zip] to use default PCK/ZIP export process, or calls [method EditorExportPlatform.export_project_files] and implement custom callback for processing each exported file.  
         */
        /* gdvirtual */ _export_project(preset: EditorExportPreset, debug: boolean, path: string, flags: EditorExportPlatform.DebugFlags): Error
        
        /** Creates a PCK archive at [param path] for the specified [param preset].  
         *  This method is called when "Export PCK/ZIP" button is pressed in the export dialog, with "Export as Patch" disabled, and PCK is selected as a file type.  
         */
        /* gdvirtual */ _export_pack(preset: EditorExportPreset, debug: boolean, path: string, flags: EditorExportPlatform.DebugFlags): Error
        
        /** Create a ZIP archive at [param path] for the specified [param preset].  
         *  This method is called when "Export PCK/ZIP" button is pressed in the export dialog, with "Export as Patch" disabled, and ZIP is selected as a file type.  
         */
        /* gdvirtual */ _export_zip(preset: EditorExportPreset, debug: boolean, path: string, flags: EditorExportPlatform.DebugFlags): Error
        
        /** Creates a patch PCK archive at [param path] for the specified [param preset], containing only the files that have changed since the last patch.  
         *  This method is called when "Export PCK/ZIP" button is pressed in the export dialog, with "Export as Patch" enabled, and PCK is selected as a file type.  
         *      
         *  **Note:** The patches provided in [param patches] have already been loaded when this method is called and are merely provided as context. When empty the patches defined in the export preset have been loaded instead.  
         */
        /* gdvirtual */ _export_pack_patch(preset: EditorExportPreset, debug: boolean, path: string, patches: PackedStringArray | string[], flags: EditorExportPlatform.DebugFlags): Error
        
        /** Create a ZIP archive at [param path] for the specified [param preset], containing only the files that have changed since the last patch.  
         *  This method is called when "Export PCK/ZIP" button is pressed in the export dialog, with "Export as Patch" enabled, and ZIP is selected as a file type.  
         *      
         *  **Note:** The patches provided in [param patches] have already been loaded when this method is called and are merely provided as context. When empty the patches defined in the export preset have been loaded instead.  
         */
        /* gdvirtual */ _export_zip_patch(preset: EditorExportPreset, debug: boolean, path: string, patches: PackedStringArray | string[], flags: EditorExportPlatform.DebugFlags): Error
        
        /** Returns array of platform specific features. */
        /* gdvirtual */ _get_platform_features(): PackedStringArray
        
        /** Returns protocol used for remote debugging. Default implementation return `tcp://`. */
        /* gdvirtual */ _get_debug_protocol(): string
        
        /** Sets current configuration error message text. This method should be called only from the [method _can_export], [method _has_valid_export_configuration], or [method _has_valid_project_configuration] implementations. */
        set_config_error(error_text: string): void
        
        /** Returns current configuration error message text. This method should be called only from the [method _can_export], [method _has_valid_export_configuration], or [method _has_valid_project_configuration] implementations. */
        get_config_error(): string
        
        /** Set to `true` is export templates are missing from the current configuration. This method should be called only from the [method _can_export], [method _has_valid_export_configuration], or [method _has_valid_project_configuration] implementations. */
        set_config_missing_templates(missing_templates: boolean): void
        
        /** Returns `true` is export templates are missing from the current configuration. This method should be called only from the [method _can_export], [method _has_valid_export_configuration], or [method _has_valid_project_configuration] implementations. */
        get_config_missing_templates(): boolean
        /** @deprecated Internal use. Does not exist at runtime. */
        __godotNameMap: __NameMapEditorExportPlatformExtension;
    }
    /** @deprecated Internal use. Does not exist at runtime. */
    interface __NameMapEditorExportPlatformIOS extends __NameMapEditorExportPlatformAppleEmbedded {
    }
    /** Exporter for iOS.  
     *  	  
     *  @link https://docs.godotengine.org/en/4.5/classes/class_editorexportplatformios.html  
     */
    class EditorExportPlatformIOS extends EditorExportPlatformAppleEmbedded {
        constructor(identifier?: any)
        /** @deprecated Internal use. Does not exist at runtime. */
        __godotNameMap: __NameMapEditorExportPlatformIOS;
    }
    /** @deprecated Internal use. Does not exist at runtime. */
    interface __NameMapEditorExportPlatformLinuxBSD extends __NameMapEditorExportPlatformPC {
    }
    /** Exporter for Linux/BSD.  
     *  	  
     *  @link https://docs.godotengine.org/en/4.5/classes/class_editorexportplatformlinuxbsd.html  
     */
    class EditorExportPlatformLinuxBSD extends EditorExportPlatformPC {
        constructor(identifier?: any)
        /** @deprecated Internal use. Does not exist at runtime. */
        __godotNameMap: __NameMapEditorExportPlatformLinuxBSD;
    }
    /** @deprecated Internal use. Does not exist at runtime. */
    interface __NameMapEditorExportPlatformMacOS extends __NameMapEditorExportPlatform {
    }
    /** Exporter for macOS.  
     *  	  
     *  @link https://docs.godotengine.org/en/4.5/classes/class_editorexportplatformmacos.html  
     */
    class EditorExportPlatformMacOS extends EditorExportPlatform {
        constructor(identifier?: any)
        /** @deprecated Internal use. Does not exist at runtime. */
        __godotNameMap: __NameMapEditorExportPlatformMacOS;
    }
    /** @deprecated Internal use. Does not exist at runtime. */
    interface __NameMapEditorExportPlatformPC extends __NameMapEditorExportPlatform {
    }
    /** Base class for the desktop platform exporter (Windows and Linux/BSD).  
     *  	  
     *  @link https://docs.godotengine.org/en/4.5/classes/class_editorexportplatformpc.html  
     */
    class EditorExportPlatformPC extends EditorExportPlatform {
        constructor(identifier?: any)
        /** @deprecated Internal use. Does not exist at runtime. */
        __godotNameMap: __NameMapEditorExportPlatformPC;
    }
    /** @deprecated Internal use. Does not exist at runtime. */
    interface __NameMapEditorExportPlatformVisionOS extends __NameMapEditorExportPlatformAppleEmbedded {
    }
    /** Exporter for visionOS.  
     *  	  
     *  @link https://docs.godotengine.org/en/4.5/classes/class_editorexportplatformvisionos.html  
     */
    class EditorExportPlatformVisionOS extends EditorExportPlatformAppleEmbedded {
        constructor(identifier?: any)
        /** @deprecated Internal use. Does not exist at runtime. */
        __godotNameMap: __NameMapEditorExportPlatformVisionOS;
    }
    /** @deprecated Internal use. Does not exist at runtime. */
    interface __NameMapEditorExportPlatformWeb extends __NameMapEditorExportPlatform {
    }
    /** Exporter for the Web.  
     *  	  
     *  @link https://docs.godotengine.org/en/4.5/classes/class_editorexportplatformweb.html  
     */
    class EditorExportPlatformWeb extends EditorExportPlatform {
        constructor(identifier?: any)
        /** @deprecated Internal use. Does not exist at runtime. */
        __godotNameMap: __NameMapEditorExportPlatformWeb;
    }
    /** @deprecated Internal use. Does not exist at runtime. */
    interface __NameMapEditorExportPlatformWindows extends __NameMapEditorExportPlatformPC {
    }
    /** Exporter for Windows.  
     *  	  
     *  @link https://docs.godotengine.org/en/4.5/classes/class_editorexportplatformwindows.html  
     */
    class EditorExportPlatformWindows extends EditorExportPlatformPC {
        constructor(identifier?: any)
        /** @deprecated Internal use. Does not exist at runtime. */
        __godotNameMap: __NameMapEditorExportPlatformWindows;
    }
    /** @deprecated Internal use. Does not exist at runtime. */
    interface __NameMapEditorExportPlugin extends __NameMapRefCounted {
    }
    /** A script that is executed when exporting the project.  
     *  	  
     *  @link https://docs.godotengine.org/en/4.5/classes/class_editorexportplugin.html  
     */
    class EditorExportPlugin extends RefCounted {
        constructor(identifier?: any)
        /** Virtual method to be overridden by the user. Called for each exported file before [method _customize_resource] and [method _customize_scene]. The arguments can be used to identify the file. [param path] is the path of the file, [param type] is the [Resource] represented by the file (e.g. [PackedScene]), and [param features] is the list of features for the export.  
         *  Calling [method skip] inside this callback will make the file not included in the export.  
         */
        /* gdvirtual */ _export_file(path: string, type: string, features: PackedStringArray | string[]): void
        
        /** Virtual method to be overridden by the user. It is called when the export starts and provides all information about the export. [param features] is the list of features for the export, [param is_debug] is `true` for debug builds, [param path] is the target path for the exported project. [param flags] is only used when running a runnable profile, e.g. when using native run on Android. */
        /* gdvirtual */ _export_begin(features: PackedStringArray | string[], is_debug: boolean, path: string, flags: int64): void
        
        /** Virtual method to be overridden by the user. Called when the export is finished. */
        /* gdvirtual */ _export_end(): void
        
        /** Return `true` if this plugin will customize resources based on the platform and features used.  
         *  When enabled, [method _get_customization_configuration_hash] and [method _customize_resource] will be called and must be implemented.  
         */
        /* gdvirtual */ _begin_customize_resources(platform: EditorExportPlatform, features: PackedStringArray | string[]): boolean
        
        /** Customize a resource. If changes are made to it, return the same or a new resource. Otherwise, return `null`. When a new resource is returned, [param resource] will be replaced by a copy of the new resource.  
         *  The [param path] argument is only used when customizing an actual file, otherwise this means that this resource is part of another one and it will be empty.  
         *  Implementing this method is required if [method _begin_customize_resources] returns `true`.  
         *      
         *  **Note:** When customizing any of the following types and returning another resource, the other resource should not be skipped using [method skip] in [method _export_file]:  
         *  - [AtlasTexture]  
         *  - [CompressedCubemap]  
         *  - [CompressedCubemapArray]  
         *  - [CompressedTexture2D]  
         *  - [CompressedTexture2DArray]  
         *  - [CompressedTexture3D]  
         */
        /* gdvirtual */ _customize_resource(resource: Resource, path: string): null | Resource
        
        /** Return `true` if this plugin will customize scenes based on the platform and features used.  
         *  When enabled, [method _get_customization_configuration_hash] and [method _customize_scene] will be called and must be implemented.  
         *      
         *  **Note:** [method _customize_scene] will only be called for scenes that have been modified since the last export.  
         */
        /* gdvirtual */ _begin_customize_scenes(platform: EditorExportPlatform, features: PackedStringArray | string[]): boolean
        
        /** Customize a scene. If changes are made to it, return the same or a new scene. Otherwise, return `null`. If a new scene is returned, it is up to you to dispose of the old one.  
         *  Implementing this method is required if [method _begin_customize_scenes] returns `true`.  
         */
        /* gdvirtual */ _customize_scene(scene: Node, path: string): null | Node
        
        /** Return a hash based on the configuration passed (for both scenes and resources). This helps keep separate caches for separate export configurations.  
         *  Implementing this method is required if [method _begin_customize_resources] returns `true`.  
         */
        /* gdvirtual */ _get_customization_configuration_hash(): int64
        
        /** This is called when the customization process for scenes ends. */
        /* gdvirtual */ _end_customize_scenes(): void
        
        /** This is called when the customization process for resources ends. */
        /* gdvirtual */ _end_customize_resources(): void
        
        /** Return a list of export options that can be configured for this export plugin.  
         *  Each element in the return value is a [Dictionary] with the following keys:  
         *  - `option`: A dictionary with the structure documented by [method Object.get_property_list], but all keys are optional.  
         *  - `default_value`: The default value for this option.  
         *  - `update_visibility`: An optional boolean value. If set to `true`, the preset will emit [signal Object.property_list_changed] when the option is changed.  
         */
        /* gdvirtual */ _get_export_options(platform: EditorExportPlatform): GArray<GDictionary>
        
        /** Return a [Dictionary] of override values for export options, that will be used instead of user-provided values. Overridden options will be hidden from the user interface.  
         *    
         */
        /* gdvirtual */ _get_export_options_overrides(platform: EditorExportPlatform): GDictionary
        
        /** Return `true` if the result of [method _get_export_options] has changed and the export options of the preset corresponding to [param platform] should be updated. */
        /* gdvirtual */ _should_update_export_options(platform: EditorExportPlatform): boolean
        
        /** Validates [param option] and returns the visibility for the specified [param platform]. The default implementation returns `true` for all options. */
        /* gdvirtual */ _get_export_option_visibility(platform: EditorExportPlatform, option: string): boolean
        
        /** Check the requirements for the given [param option] and return a non-empty warning string if they are not met.  
         *      
         *  **Note:** Use [method get_option] to check the value of the export options.  
         */
        /* gdvirtual */ _get_export_option_warning(platform: EditorExportPlatform, option: string): string
        
        /** Return a [PackedStringArray] of additional features this preset, for the given [param platform], should have. */
        /* gdvirtual */ _get_export_features(platform: EditorExportPlatform, debug: boolean): PackedStringArray
        
        /** Return the name identifier of this plugin (for future identification by the exporter). The plugins are sorted by name before exporting.  
         *  Implementing this method is required.  
         */
        /* gdvirtual */ _get_name(): string
        
        /** Return `true` if the plugin supports the given [param platform]. */
        /* gdvirtual */ _supports_platform(platform: EditorExportPlatform): boolean
        
        /** Virtual method to be overridden by the user. This is called to retrieve the set of Android dependencies provided by this plugin. Each returned Android dependency should have the format of an Android remote binary dependency: `org.godot.example:my-plugin:0.0.0`  
         *  For more information see [url=https://developer.android.com/build/dependencies?agpversion=4.1#dependency-types]Android documentation on dependencies[/url].  
         *      
         *  **Note:** Only supported on Android and requires [member EditorExportPlatformAndroid.gradle_build/use_gradle_build] to be enabled.  
         */
        /* gdvirtual */ _get_android_dependencies(platform: EditorExportPlatform, debug: boolean): PackedStringArray
        
        /** Virtual method to be overridden by the user. This is called to retrieve the URLs of Maven repositories for the set of Android dependencies provided by this plugin.  
         *  For more information see [url=https://docs.gradle.org/current/userguide/dependency_management.html#sec:maven_repo]Gradle documentation on dependency management[/url].  
         *      
         *  **Note:** Google's Maven repo and the Maven Central repo are already included by default.  
         *      
         *  **Note:** Only supported on Android and requires [member EditorExportPlatformAndroid.gradle_build/use_gradle_build] to be enabled.  
         */
        /* gdvirtual */ _get_android_dependencies_maven_repos(platform: EditorExportPlatform, debug: boolean): PackedStringArray
        
        /** Virtual method to be overridden by the user. This is called to retrieve the local paths of the Android libraries archive (AAR) files provided by this plugin.  
         *      
         *  **Note:** Relative paths **must** be relative to Godot's `res://addons/` directory. For example, an AAR file located under `res://addons/hello_world_plugin/HelloWorld.release.aar` can be returned as an absolute path using `res://addons/hello_world_plugin/HelloWorld.release.aar` or a relative path using `hello_world_plugin/HelloWorld.release.aar`.  
         *      
         *  **Note:** Only supported on Android and requires [member EditorExportPlatformAndroid.gradle_build/use_gradle_build] to be enabled.  
         */
        /* gdvirtual */ _get_android_libraries(platform: EditorExportPlatform, debug: boolean): PackedStringArray
        
        /** Virtual method to be overridden by the user. This is used at export time to update the contents of the `activity` element in the generated Android manifest.  
         *      
         *  **Note:** Only supported on Android and requires [member EditorExportPlatformAndroid.gradle_build/use_gradle_build] to be enabled.  
         */
        /* gdvirtual */ _get_android_manifest_activity_element_contents(platform: EditorExportPlatform, debug: boolean): string
        
        /** Virtual method to be overridden by the user. This is used at export time to update the contents of the `application` element in the generated Android manifest.  
         *      
         *  **Note:** Only supported on Android and requires [member EditorExportPlatformAndroid.gradle_build/use_gradle_build] to be enabled.  
         */
        /* gdvirtual */ _get_android_manifest_application_element_contents(platform: EditorExportPlatform, debug: boolean): string
        
        /** Virtual method to be overridden by the user. This is used at export time to update the contents of the `manifest` element in the generated Android manifest.  
         *      
         *  **Note:** Only supported on Android and requires [member EditorExportPlatformAndroid.gradle_build/use_gradle_build] to be enabled.  
         */
        /* gdvirtual */ _get_android_manifest_element_contents(platform: EditorExportPlatform, debug: boolean): string
        
        /** Provide access to the Android prebuilt manifest and allows the plugin to modify it if needed.  
         *  Implementers of this virtual method should take the binary manifest data from [param manifest_data], copy it, modify it, and then return it with the modifications.  
         *  If no modifications are needed, then an empty [PackedByteArray] should be returned.  
         */
        /* gdvirtual */ _update_android_prebuilt_manifest(platform: EditorExportPlatform, manifest_data: PackedByteArray | byte[] | ArrayBuffer): PackedByteArray
        
        /** Adds a shared object or a directory containing only shared objects with the given [param tags] and destination [param path].  
         *      
         *  **Note:** In case of macOS exports, those shared objects will be added to `Frameworks` directory of app bundle.  
         *  In case of a directory code-sign will error if you place non code object in directory.  
         */
        add_shared_object(path: string, tags: PackedStringArray | string[], target: string): void
        
        /** Adds a custom file to be exported. [param path] is the virtual path that can be used to load the file, [param file] is the binary data of the file.  
         *  When called inside [method _export_file] and [param remap] is `true`, the current file will not be exported, but instead remapped to this custom file. [param remap] is ignored when called in other places.  
         *  [param file] will not be imported, so consider using [method _customize_resource] to remap imported resources.  
         */
        add_file(path: string, file: PackedByteArray | byte[] | ArrayBuffer, remap: boolean): void
        
        /** Adds a static library from the given [param path] to the Apple embedded platform project. */
        add_apple_embedded_platform_project_static_lib(path: string): void
        
        /** Adds a static library (*.a) or a dynamic library (*.dylib, *.framework) to the Linking Phase to the Apple embedded platform's Xcode project. */
        add_apple_embedded_platform_framework(path: string): void
        
        /** Adds a dynamic library (*.dylib, *.framework) to the Linking Phase in the Apple embedded platform's Xcode project and embeds it into the resulting binary.  
         *      
         *  **Note:** For static libraries (*.a), this works in the same way as [method add_apple_embedded_platform_framework].  
         *      
         *  **Note:** This method should not be used for System libraries as they are already present on the device.  
         */
        add_apple_embedded_platform_embedded_framework(path: string): void
        
        /** Adds additional fields to the Apple embedded platform's project Info.plist file. */
        add_apple_embedded_platform_plist_content(plist_content: string): void
        
        /** Adds linker flags for the Apple embedded platform export. */
        add_apple_embedded_platform_linker_flags(flags: string): void
        
        /** Adds an Apple embedded platform bundle file from the given [param path] to the exported project. */
        add_apple_embedded_platform_bundle_file(path: string): void
        
        /** Adds C++ code to the Apple embedded platform export. The final code is created from the code appended by each active export plugin. */
        add_apple_embedded_platform_cpp_code(code: string): void
        
        /** Adds a static library from the given [param path] to the iOS project. */
        add_ios_project_static_lib(path: string): void
        
        /** Adds a static library (*.a) or a dynamic library (*.dylib, *.framework) to the Linking Phase to the iOS Xcode project. */
        add_ios_framework(path: string): void
        
        /** Adds a dynamic library (*.dylib, *.framework) to Linking Phase in iOS's Xcode project and embeds it into resulting binary.  
         *      
         *  **Note:** For static libraries (*.a), this works the in same way as [method add_apple_embedded_platform_framework].  
         *      
         *  **Note:** This method should not be used for System libraries as they are already present on the device.  
         */
        add_ios_embedded_framework(path: string): void
        
        /** Adds additional fields to the iOS project Info.plist file. */
        add_ios_plist_content(plist_content: string): void
        
        /** Adds linker flags for the iOS export. */
        add_ios_linker_flags(flags: string): void
        
        /** Adds an iOS bundle file from the given [param path] to the exported project. */
        add_ios_bundle_file(path: string): void
        
        /** Adds C++ code to the iOS export. The final code is created from the code appended by each active export plugin. */
        add_ios_cpp_code(code: string): void
        
        /** Adds file or directory matching [param path] to `PlugIns` directory of macOS app bundle.  
         *      
         *  **Note:** This is useful only for macOS exports.  
         */
        add_macos_plugin_file(path: string): void
        
        /** To be called inside [method _export_file]. Skips the current file, so it's not included in the export. */
        skip(): void
        
        /** Returns the current value of an export option supplied by [method _get_export_options]. */
        get_option(name: StringName): any
        
        /** Returns currently used export preset. */
        get_export_preset(): null | EditorExportPreset
        
        /** Returns currently used export platform. */
        get_export_platform(): null | EditorExportPlatform
        /** @deprecated Internal use. Does not exist at runtime. */
        __godotNameMap: __NameMapEditorExportPlugin;
    }
    namespace EditorExportPreset {
        enum ExportFilter {
            EXPORT_ALL_RESOURCES = 0,
            EXPORT_SELECTED_SCENES = 1,
            EXPORT_SELECTED_RESOURCES = 2,
            EXCLUDE_SELECTED_RESOURCES = 3,
            EXPORT_CUSTOMIZED = 4,
        }
        enum FileExportMode {
            MODE_FILE_NOT_CUSTOMIZED = 0,
            MODE_FILE_STRIP = 1,
            MODE_FILE_KEEP = 2,
            MODE_FILE_REMOVE = 3,
        }
        enum ScriptExportMode {
            MODE_SCRIPT_TEXT = 0,
            MODE_SCRIPT_BINARY_TOKENS = 1,
            MODE_SCRIPT_BINARY_TOKENS_COMPRESSED = 2,
        }
    }
    /** @deprecated Internal use. Does not exist at runtime. */
    interface __NameMapEditorExportPreset extends __NameMapRefCounted {
    }
    /** Export preset configuration.  
     *  	  
     *  @link https://docs.godotengine.org/en/4.5/classes/class_editorexportpreset.html  
     */
    class EditorExportPreset extends RefCounted {
        constructor(identifier?: any)
        _get_property_warning(name: StringName): string
        
        /** Returns `true` if the preset has the property named [param property]. */
        has(property: StringName): boolean
        
        /** Returns array of files to export. */
        get_files_to_export(): PackedStringArray
        
        /** Returns a dictionary of files selected in the "Resources" tab of the export dialog. The dictionary's keys are file paths, and its values are the corresponding export modes: `"strip"`, `"keep"`, or `"remove"`. See also [method get_file_export_mode]. */
        get_customized_files(): GDictionary
        
        /** Returns the number of files selected in the "Resources" tab of the export dialog. */
        get_customized_files_count(): int64
        
        /** Returns `true` if the file at the specified [param path] will be exported. */
        has_export_file(path: string): boolean
        
        /** Returns file export mode for the specified file. */
        get_file_export_mode(path: string, default_?: EditorExportPreset.FileExportMode /* = 0 */): EditorExportPreset.FileExportMode
        
        /** Returns the value of the setting identified by [param name] using export preset feature tag overrides instead of current OS features. */
        get_project_setting(name: StringName): any
        
        /** Returns this export preset's name. */
        get_preset_name(): string
        
        /** Returns `true` if the "Runnable" toggle is enabled in the export dialog. */
        is_runnable(): boolean
        
        /** Returns `true` if the "Advanced" toggle is enabled in the export dialog. */
        are_advanced_options_enabled(): boolean
        
        /** Returns `true` if the dedicated server export mode is selected in the export dialog. */
        is_dedicated_server(): boolean
        
        /** Returns export file filter mode selected in the "Resources" tab of the export dialog. */
        get_export_filter(): EditorExportPreset.ExportFilter
        
        /** Returns file filters to include during export. */
        get_include_filter(): string
        
        /** Returns file filters to exclude during export. */
        get_exclude_filter(): string
        
        /** Returns a comma-separated list of custom features added to this preset, as a string. See [url=https://docs.godotengine.org/en/4.5/tutorials/export/feature_tags.html]Feature tags[/url] in the documentation for more information. */
        get_custom_features(): string
        
        /** Returns the list of packs on which to base a patch export on. */
        get_patches(): PackedStringArray
        
        /** Returns export target path. */
        get_export_path(): string
        
        /** Returns file filters to include during PCK encryption. */
        get_encryption_in_filter(): string
        
        /** Returns file filters to exclude during PCK encryption. */
        get_encryption_ex_filter(): string
        
        /** Returns `true` if PCK encryption is enabled in the export dialog. */
        get_encrypt_pck(): boolean
        
        /** Returns `true` if PCK directory encryption is enabled in the export dialog. */
        get_encrypt_directory(): boolean
        
        /** Returns PCK encryption key. */
        get_encryption_key(): string
        
        /** Returns the export mode used by GDScript files. `0` for "Text", `1` for "Binary tokens", and `2` for "Compressed binary tokens (smaller files)". */
        get_script_export_mode(): int64
        
        /** Returns export option value or value of environment variable if it is set. */
        get_or_env(name: StringName, env_var: string): any
        
        /** Returns the preset's version number, or fall back to the [member ProjectSettings.application/config/version] project setting if set to an empty string.  
         *  If [param windows_version] is `true`, formats the returned version number to be compatible with Windows executable metadata.  
         */
        get_version(name: StringName, windows_version: boolean): string
        /** @deprecated Internal use. Does not exist at runtime. */
        __godotNameMap: __NameMapEditorExportPreset;
    }
    namespace EditorFeatureProfile {
        enum Feature {
            /** The 3D editor. If this feature is disabled, the 3D editor won't display but 3D nodes will still display in the Create New Node dialog. */
            FEATURE_3D = 0,
            
            /** The Script tab, which contains the script editor and class reference browser. If this feature is disabled, the Script tab won't display. */
            FEATURE_SCRIPT = 1,
            
            /** The AssetLib tab. If this feature is disabled, the AssetLib tab won't display. */
            FEATURE_ASSET_LIB = 2,
            
            /** Scene tree editing. If this feature is disabled, the Scene tree dock will still be visible but will be read-only. */
            FEATURE_SCENE_TREE = 3,
            
            /** The Node dock. If this feature is disabled, signals and groups won't be visible and modifiable from the editor. */
            FEATURE_NODE_DOCK = 4,
            
            /** The FileSystem dock. If this feature is disabled, the FileSystem dock won't be visible. */
            FEATURE_FILESYSTEM_DOCK = 5,
            
            /** The Import dock. If this feature is disabled, the Import dock won't be visible. */
            FEATURE_IMPORT_DOCK = 6,
            
            /** The History dock. If this feature is disabled, the History dock won't be visible. */
            FEATURE_HISTORY_DOCK = 7,
            
            /** The Game tab, which allows embedding the game window and selecting nodes by clicking inside of it. If this feature is disabled, the Game tab won't display. */
            FEATURE_GAME = 8,
            
            /** Represents the size of the [enum Feature] enum. */
            FEATURE_MAX = 9,
        }
    }
    /** @deprecated Internal use. Does not exist at runtime. */
    interface __NameMapEditorFeatureProfile extends __NameMapRefCounted {
    }
    /** An editor feature profile which can be used to disable specific features.  
     *  	  
     *  @link https://docs.godotengine.org/en/4.5/classes/class_editorfeatureprofile.html  
     */
    class EditorFeatureProfile extends RefCounted {
        constructor(identifier?: any)
        /** If [param disable] is `true`, disables the class specified by [param class_name]. When disabled, the class won't appear in the Create New Node dialog. */
        set_disable_class(class_name: StringName, disable: boolean): void
        
        /** Returns `true` if the class specified by [param class_name] is disabled. When disabled, the class won't appear in the Create New Node dialog. */
        is_class_disabled(class_name: StringName): boolean
        
        /** If [param disable] is `true`, disables editing for the class specified by [param class_name]. When disabled, the class will still appear in the Create New Node dialog but the Inspector will be read-only when selecting a node that extends the class. */
        set_disable_class_editor(class_name: StringName, disable: boolean): void
        
        /** Returns `true` if editing for the class specified by [param class_name] is disabled. When disabled, the class will still appear in the Create New Node dialog but the Inspector will be read-only when selecting a node that extends the class. */
        is_class_editor_disabled(class_name: StringName): boolean
        
        /** If [param disable] is `true`, disables editing for [param property] in the class specified by [param class_name]. When a property is disabled, it won't appear in the Inspector when selecting a node that extends the class specified by [param class_name]. */
        set_disable_class_property(class_name: StringName, property: StringName, disable: boolean): void
        
        /** Returns `true` if [param property] is disabled in the class specified by [param class_name]. When a property is disabled, it won't appear in the Inspector when selecting a node that extends the class specified by [param class_name]. */
        is_class_property_disabled(class_name: StringName, property: StringName): boolean
        
        /** If [param disable] is `true`, disables the editor feature specified in [param feature]. When a feature is disabled, it will disappear from the editor entirely. */
        set_disable_feature(feature: EditorFeatureProfile.Feature, disable: boolean): void
        
        /** Returns `true` if the [param feature] is disabled. When a feature is disabled, it will disappear from the editor entirely. */
        is_feature_disabled(feature: EditorFeatureProfile.Feature): boolean
        
        /** Returns the specified [param feature]'s human-readable name. */
        get_feature_name(feature: EditorFeatureProfile.Feature): string
        
        /** Saves the editor feature profile to a file in JSON format. It can then be imported using the feature profile manager's **Import** button or the [method load_from_file] method.  
         *      
         *  **Note:** Feature profiles created via the user interface are saved in the `feature_profiles` directory, as a file with the `.profile` extension. The editor configuration folder can be found by using [method EditorPaths.get_config_dir].  
         */
        save_to_file(path: string): Error
        
        /** Loads an editor feature profile from a file. The file must follow the JSON format obtained by using the feature profile manager's **Export** button or the [method save_to_file] method.  
         *      
         *  **Note:** Feature profiles created via the user interface are loaded from the `feature_profiles` directory, as a file with the `.profile` extension. The editor configuration folder can be found by using [method EditorPaths.get_config_dir].  
         */
        load_from_file(path: string): Error
        /** @deprecated Internal use. Does not exist at runtime. */
        __godotNameMap: __NameMapEditorFeatureProfile;
    }
    namespace EditorFileDialog {
        enum FileMode {
            /** The [EditorFileDialog] can select only one file. Accepting the window will open the file. */
            FILE_MODE_OPEN_FILE = 0,
            
            /** The [EditorFileDialog] can select multiple files. Accepting the window will open all files. */
            FILE_MODE_OPEN_FILES = 1,
            
            /** The [EditorFileDialog] can select only one directory. Accepting the window will open the directory. */
            FILE_MODE_OPEN_DIR = 2,
            
            /** The [EditorFileDialog] can select a file or directory. Accepting the window will open it. */
            FILE_MODE_OPEN_ANY = 3,
            
            /** The [EditorFileDialog] can select only one file. Accepting the window will save the file. */
            FILE_MODE_SAVE_FILE = 4,
        }
        enum Access {
            /** The [EditorFileDialog] can only view `res://` directory contents. */
            ACCESS_RESOURCES = 0,
            
            /** The [EditorFileDialog] can only view `user://` directory contents. */
            ACCESS_USERDATA = 1,
            
            /** The [EditorFileDialog] can view the entire local file system. */
            ACCESS_FILESYSTEM = 2,
        }
        enum DisplayMode {
            /** The [EditorFileDialog] displays resources as thumbnails. */
            DISPLAY_THUMBNAILS = 0,
            
            /** The [EditorFileDialog] displays resources as a list of filenames. */
            DISPLAY_LIST = 1,
        }
    }
    /** @deprecated Internal use. Does not exist at runtime. */
    interface __NameMapEditorFileDialog extends __NameMapConfirmationDialog {
    }
    /** A modified version of [FileDialog] used by the editor.  
     *  	  
     *  @link https://docs.godotengine.org/en/4.5/classes/class_editorfiledialog.html  
     */
    class EditorFileDialog<Map extends NodePathMap = any> extends ConfirmationDialog<Map> {
        constructor(identifier?: any)
        _cancel_pressed(): void
        
        /** Removes all filters except for "All Files (*.*)". */
        clear_filters(): void
        
        /** Adds a comma-separated file name [param filter] option to the [EditorFileDialog] with an optional [param description], which restricts what files can be picked.  
         *  A [param filter] should be of the form `"filename.extension"`, where filename and extension can be `*` to match any string. Filters starting with `.` (i.e. empty filenames) are not allowed.  
         *  For example, a [param filter] of `"*.tscn, *.scn"` and a [param description] of `"Scenes"` results in filter text "Scenes (*.tscn, *.scn)".  
         */
        add_filter(filter: string, description?: string /* = '' */): void
        
        /** Returns the name of the [OptionButton] or [CheckBox] with index [param option]. */
        get_option_name(option: int64): string
        
        /** Returns an array of values of the [OptionButton] with index [param option]. */
        get_option_values(option: int64): PackedStringArray
        
        /** Returns the default value index of the [OptionButton] or [CheckBox] with index [param option]. */
        get_option_default(option: int64): int64
        
        /** Sets the name of the [OptionButton] or [CheckBox] with index [param option]. */
        set_option_name(option: int64, name: string): void
        
        /** Sets the option values of the [OptionButton] with index [param option]. */
        set_option_values(option: int64, values: PackedStringArray | string[]): void
        
        /** Sets the default value index of the [OptionButton] or [CheckBox] with index [param option]. */
        set_option_default(option: int64, default_value_index: int64): void
        
        /** Adds an additional [OptionButton] to the file dialog. If [param values] is empty, a [CheckBox] is added instead.  
         *  [param default_value_index] should be an index of the value in the [param values]. If [param values] is empty it should be either `1` (checked), or `0` (unchecked).  
         */
        add_option(name: string, values: PackedStringArray | string[], default_value_index: int64): void
        
        /** Returns a [Dictionary] with the selected values of the additional [OptionButton]s and/or [CheckBox]es. [Dictionary] keys are names and values are selected value indices. */
        get_selected_options(): GDictionary
        
        /** Clear the filter for file names. */
        clear_filename_filter(): void
        
        /** Sets the value of the filter for file names. */
        set_filename_filter(filter: string): void
        
        /** Returns the value of the filter for file names. */
        get_filename_filter(): string
        
        /** Returns the [VBoxContainer] used to display the file system.  
         *  **Warning:** This is a required internal node, removing and freeing it may cause a crash. If you wish to hide it or any of its children, use their [member CanvasItem.visible] property.  
         */
        get_vbox(): null | VBoxContainer
        
        /** Returns the LineEdit for the selected file.  
         *  **Warning:** This is a required internal node, removing and freeing it may cause a crash. If you wish to hide it or any of its children, use their [member CanvasItem.visible] property.  
         */
        get_line_edit(): null | LineEdit
        _thumbnail_done(_unnamed_arg0: string, _unnamed_arg1: Texture2D, _unnamed_arg2: Texture2D, _unnamed_arg3: any): void
        _thumbnail_result(_unnamed_arg0: string, _unnamed_arg1: Texture2D, _unnamed_arg2: Texture2D, _unnamed_arg3: any): void
        
        /** Adds the given [param menu] to the side of the file dialog with the given [param title] text on top. Only one side menu is allowed. */
        add_side_menu(menu: Control, title?: string /* = '' */): void
        
        /** Shows the [EditorFileDialog] at the default size and position for file dialogs in the editor, and selects the file name if there is a current file. */
        popup_file_dialog(): void
        
        /** Notify the [EditorFileDialog] that its view of the data is no longer accurate. Updates the view contents on next view update. */
        invalidate(): void
        
        /** The location from which the user may select a file, including `res://`, `user://`, and the local file system. */
        get access(): int64
        set access(value: int64)
        
        /** The view format in which the [EditorFileDialog] displays resources to the user. */
        get display_mode(): int64
        set display_mode(value: int64)
        
        /** The dialog's open or save mode, which affects the selection behavior. */
        get file_mode(): int64
        set file_mode(value: int64)
        
        /** The currently occupied directory. */
        get current_dir(): string
        set current_dir(value: string)
        
        /** The currently selected file. */
        get current_file(): string
        set current_file(value: string)
        
        /** The file system path in the address bar. */
        get current_path(): string
        set current_path(value: string)
        
        /** The available file type filters. For example, this shows only `.png` and `.gd` files: `set_filters(PackedStringArray(["*.png ; PNG Images","*.gd ; GDScript Files"]))`. Multiple file types can also be specified in a single filter. `"*.png, *.jpg, *.jpeg ; Supported Images"` will show both PNG and JPEG files when selected. */
        get filters(): PackedStringArray
        set filters(value: PackedStringArray | string[])
        
        /** The number of additional [OptionButton]s and [CheckBox]es in the dialog. */
        get option_count(): int64
        set option_count(value: int64)
        
        /** If `true`, hidden files and directories will be visible in the [EditorFileDialog]. This property is synchronized with [member EditorSettings.filesystem/file_dialog/show_hidden_files]. */
        get show_hidden_files(): boolean
        set show_hidden_files(value: boolean)
        
        /** If `true`, the [EditorFileDialog] will not warn the user before overwriting files. */
        get disable_overwrite_warning(): boolean
        set disable_overwrite_warning(value: boolean)
        
        /** Emitted when a file is selected. */
        readonly file_selected: Signal<(path: string) => void>
        
        /** Emitted when multiple files are selected. */
        readonly files_selected: Signal<(paths: PackedStringArray) => void>
        
        /** Emitted when a directory is selected. */
        readonly dir_selected: Signal<(dir: string) => void>
        
        /** Emitted when the filter for file names changes. */
        readonly filename_filter_changed: Signal<(filter: string) => void>
        /** @deprecated Internal use. Does not exist at runtime. */
        __godotNameMap: __NameMapEditorFileDialog;
    }
    /** @deprecated Internal use. Does not exist at runtime. */
    interface __NameMapEditorFileSystem extends __NameMapNode {
    }
    /** Resource filesystem, as the editor sees it.  
     *  	  
     *  @link https://docs.godotengine.org/en/4.5/classes/class_editorfilesystem.html  
     */
    class EditorFileSystem<Map extends NodePathMap = any> extends Node<Map> {
        constructor(identifier?: any)
        /** Gets the root directory object. */
        get_filesystem(): null | EditorFileSystemDirectory
        
        /** Returns `true` if the filesystem is being scanned. */
        is_scanning(): boolean
        
        /** Returns the scan progress for 0 to 1 if the FS is being scanned. */
        get_scanning_progress(): float64
        
        /** Scan the filesystem for changes. */
        scan(): void
        
        /** Check if the source of any imported resource changed. */
        scan_sources(): void
        
        /** Add a file in an existing directory, or schedule file information to be updated on editor restart. Can be used to update text files saved by an external program.  
         *  This will not import the file. To reimport, call [method reimport_files] or [method scan] methods.  
         */
        update_file(path: string): void
        
        /** Returns a view into the filesystem at [param path]. */
        get_filesystem_path(path: string): null | EditorFileSystemDirectory
        
        /** Returns the resource type of the file, given the full path. This returns a string such as `"Resource"` or `"GDScript"`,  *not*  a file extension such as `".gd"`. */
        get_file_type(path: string): string
        
        /** Reimports a set of files. Call this if these files or their `.import` files were directly edited by script or an external program.  
         *  If the file type changed or the file was newly created, use [method update_file] or [method scan].  
         *      
         *  **Note:** This function blocks until the import is finished. However, the main loop iteration, including timers and [method Node._process], will occur during the import process due to progress bar updates. Avoid calls to [method reimport_files] or [method scan] while an import is in progress.  
         */
        reimport_files(files: PackedStringArray | string[]): void
        
        /** Emitted if the filesystem changed. */
        readonly filesystem_changed: Signal<() => void>
        
        /** Emitted when the list of global script classes gets updated. */
        readonly script_classes_updated: Signal<() => void>
        
        /** Emitted if the source of any imported file changed. */
        readonly sources_changed: Signal<(exist: boolean) => void>
        
        /** Emitted before a resource is reimported. */
        readonly resources_reimporting: Signal<(resources: PackedStringArray) => void>
        
        /** Emitted if a resource is reimported. */
        readonly resources_reimported: Signal<(resources: PackedStringArray) => void>
        
        /** Emitted if at least one resource is reloaded when the filesystem is scanned. */
        readonly resources_reload: Signal<(resources: PackedStringArray) => void>
        /** @deprecated Internal use. Does not exist at runtime. */
        __godotNameMap: __NameMapEditorFileSystem;
    }
    /** @deprecated Internal use. Does not exist at runtime. */
    interface __NameMapEditorFileSystemDirectory extends __NameMapObject {
    }
    /** A directory for the resource filesystem.  
     *  	  
     *  @link https://docs.godotengine.org/en/4.5/classes/class_editorfilesystemdirectory.html  
     */
    class EditorFileSystemDirectory extends Object {
        constructor(identifier?: any)
        /** Returns the number of subdirectories in this directory. */
        get_subdir_count(): int64
        
        /** Returns the subdirectory at index [param idx]. */
        get_subdir(idx: int64): null | EditorFileSystemDirectory
        
        /** Returns the number of files in this directory. */
        get_file_count(): int64
        
        /** Returns the name of the file at index [param idx]. */
        get_file(idx: int64): string
        
        /** Returns the path to the file at index [param idx]. */
        get_file_path(idx: int64): string
        
        /** Returns the resource type of the file at index [param idx]. This returns a string such as `"Resource"` or `"GDScript"`,  *not*  a file extension such as `".gd"`. */
        get_file_type(idx: int64): StringName
        
        /** Returns the name of the script class defined in the file at index [param idx]. If the file doesn't define a script class using the `class_name` syntax, this will return an empty string. */
        get_file_script_class_name(idx: int64): string
        
        /** Returns the base class of the script class defined in the file at index [param idx]. If the file doesn't define a script class using the `class_name` syntax, this will return an empty string. */
        get_file_script_class_extends(idx: int64): string
        
        /** Returns `true` if the file at index [param idx] imported properly. */
        get_file_import_is_valid(idx: int64): boolean
        
        /** Returns the name of this directory. */
        get_name(): string
        
        /** Returns the path to this directory. */
        get_path(): string
        
        /** Returns the parent directory for this directory or `null` if called on a directory at `res://` or `user://`. */
        get_parent(): null | EditorFileSystemDirectory
        
        /** Returns the index of the file with name [param name] or `-1` if not found. */
        find_file_index(name: string): int64
        
        /** Returns the index of the directory with name [param name] or `-1` if not found. */
        find_dir_index(name: string): int64
        /** @deprecated Internal use. Does not exist at runtime. */
        __godotNameMap: __NameMapEditorFileSystemDirectory;
    }
    /** @deprecated Internal use. Does not exist at runtime. */
    interface __NameMapEditorFileSystemImportFormatSupportQuery extends __NameMapRefCounted {
    }
    /** Used to query and configure import format support.  
     *  	  
     *  @link https://docs.godotengine.org/en/4.5/classes/class_editorfilesystemimportformatsupportquery.html  
     */
    class EditorFileSystemImportFormatSupportQuery extends RefCounted {
        constructor(identifier?: any)
        /** Return whether this importer is active. */
        /* gdvirtual */ _is_active(): boolean
        
        /** Return the file extensions supported. */
        /* gdvirtual */ _get_file_extensions(): PackedStringArray
        
        /** Query support. Return `false` if import must not continue. */
        /* gdvirtual */ _query(): boolean
        /** @deprecated Internal use. Does not exist at runtime. */
        __godotNameMap: __NameMapEditorFileSystemImportFormatSupportQuery;
    }
    /** @deprecated Internal use. Does not exist at runtime. */
    interface __NameMapEditorImportPlugin extends __NameMapResourceImporter {
    }
    /** Registers a custom resource importer in the editor. Use the class to parse any file and import it as a new resource type.  
     *  	  
     *  @link https://docs.godotengine.org/en/4.5/classes/class_editorimportplugin.html  
     */
    class EditorImportPlugin extends ResourceImporter {
        constructor(identifier?: any)
        /** Gets the unique name of the importer. */
        /* gdvirtual */ _get_importer_name(): string
        
        /** Gets the name to display in the import window. You should choose this name as a continuation to "Import as", e.g. "Import as Special Mesh". */
        /* gdvirtual */ _get_visible_name(): string
        
        /** Gets the number of initial presets defined by the plugin. Use [method _get_import_options] to get the default options for the preset and [method _get_preset_name] to get the name of the preset. */
        /* gdvirtual */ _get_preset_count(): int64
        
        /** Gets the name of the options preset at this index. */
        /* gdvirtual */ _get_preset_name(preset_index: int64): string
        
        /** Gets the list of file extensions to associate with this loader (case-insensitive). e.g. `["obj"]`. */
        /* gdvirtual */ _get_recognized_extensions(): PackedStringArray
        
        /** Gets the options and default values for the preset at this index. Returns an Array of Dictionaries with the following keys: `name`, `default_value`, `property_hint` (optional), `hint_string` (optional), `usage` (optional). */
        /* gdvirtual */ _get_import_options(path: string, preset_index: int64): GArray<GDictionary>
        
        /** Gets the extension used to save this resource in the `.godot/imported` directory (see [member ProjectSettings.application/config/use_hidden_project_data_directory]). */
        /* gdvirtual */ _get_save_extension(): string
        
        /** Gets the Godot resource type associated with this loader. e.g. `"Mesh"` or `"Animation"`. */
        /* gdvirtual */ _get_resource_type(): string
        
        /** Gets the priority of this plugin for the recognized extension. Higher priority plugins will be preferred. The default priority is `1.0`. */
        /* gdvirtual */ _get_priority(): float64
        
        /** Gets the order of this importer to be run when importing resources. Importers with  *lower*  import orders will be called first, and higher values will be called later. Use this to ensure the importer runs after the dependencies are already imported. The default import order is `0` unless overridden by a specific importer. See [enum ResourceImporter.ImportOrder] for some predefined values. */
        /* gdvirtual */ _get_import_order(): int64
        
        /** Gets the format version of this importer. Increment this version when making incompatible changes to the format of the imported resources. */
        /* gdvirtual */ _get_format_version(): int64
        
        /** Gets whether the import option specified by [param option_name] should be visible in the Import dock. The default implementation always returns `true`, making all options visible. This is mainly useful for hiding options that depend on others if one of them is disabled.  
         *    
         */
        /* gdvirtual */ _get_option_visibility(path: string, option_name: StringName, options: GDictionary): boolean
        
        /** Imports [param source_file] with the import [param options] specified. Should return [constant @GlobalScope.OK] if the import is successful, other values indicate failure.  
         *  The imported resource is expected to be saved to `save_path + "." + _get_save_extension()`. If a different variant is preferred for a [url=https://docs.godotengine.org/en/4.5/tutorials/export/feature_tags.html]feature tag[/url], save the variant to `save_path + "." + tag + "." + _get_save_extension()` and add the feature tag to [param platform_variants].  
         *  If additional resource files are generated in the resource filesystem (`res://`), add their full path to [param gen_files] so that the editor knows they depend on [param source_file].  
         *  This method must be overridden to do the actual importing work. See this class' description for an example of overriding this method.  
         */
        /* gdvirtual */ _import(source_file: string, save_path: string, options: GDictionary, platform_variants: GArray<string>, gen_files: GArray<string>): Error
        
        /** Tells whether this importer can be run in parallel on threads, or, on the contrary, it's only safe for the editor to call it from the main thread, for one file at a time.  
         *  If this method is not overridden, it will return `false` by default.  
         *  If this importer's implementation is thread-safe and can be run in parallel, override this with `true` to optimize for concurrency.  
         */
        /* gdvirtual */ _can_import_threaded(): boolean
        
        /** This function can only be called during the [method _import] callback and it allows manually importing resources from it. This is useful when the imported file generates external resources that require importing (as example, images). Custom parameters for the ".import" file can be passed via the [param custom_options]. Additionally, in cases where multiple importers can handle a file, the [param custom_importer] can be specified to force a specific one. This function performs a resource import and returns immediately with a success or error code. [param generator_parameters] defines optional extra metadata which will be stored as [code skip-lint]generator_parameters` in the `remap` section of the `.import` file, for example to store a md5 hash of the source data. */
        append_import_external_resource(path: string, custom_options?: GDictionary /* = new GDictionary() */, custom_importer?: string /* = '' */, generator_parameters?: any /* = <any> {} */): Error
        /** @deprecated Internal use. Does not exist at runtime. */
        __godotNameMap: __NameMapEditorImportPlugin;
    }
    /** @deprecated Internal use. Does not exist at runtime. */
    interface __NameMapEditorInspector extends __NameMapScrollContainer {
    }
    /** A control used to edit properties of an object.  
     *  	  
     *  @link https://docs.godotengine.org/en/4.5/classes/class_editorinspector.html  
     */
    class EditorInspector<Map extends NodePathMap = any> extends ScrollContainer<Map> {
        constructor(identifier?: any)
        /** Shows the properties of the given [param object] in this inspector for editing. To clear the inspector, call this method with `null`.  
         *      
         *  **Note:** If you want to edit an object in the editor's main inspector, use the `edit_*` methods in [EditorInterface] instead.  
         */
        edit(object: Object): void
        _edit_request_change(_unnamed_arg0: Object, _unnamed_arg1: string): void
        
        /** Gets the path of the currently selected property. */
        get_selected_path(): string
        
        /** Returns the object currently selected in this inspector. */
        get_edited_object(): null | Object
        
        /** Creates a property editor that can be used by plugin UI to edit the specified property of an [param object]. */
        static instantiate_property_editor(object: Object, type: Variant.Type, path: string, hint: PropertyHint, hint_text: string, usage: int64, wide?: boolean /* = false */): null | EditorProperty
        
        /** Emitted when a property is selected in the inspector. */
        readonly property_selected: Signal<(property: string) => void>
        
        /** Emitted when a property is keyed in the inspector. Properties can be keyed by clicking the "key" icon next to a property when the Animation panel is toggled. */
        readonly property_keyed: Signal<(property: string, value: any, advance: boolean) => void>
        
        /** Emitted when a property is removed from the inspector. */
        readonly property_deleted: Signal<(property: string) => void>
        
        /** Emitted when a resource is selected in the inspector. */
        readonly resource_selected: Signal<(resource: Resource, path: string) => void>
        
        /** Emitted when the Edit button of an [Object] has been pressed in the inspector. This is mainly used in the remote scene tree Inspector. */
        readonly object_id_selected: Signal<(id: int64) => void>
        
        /** Emitted when a property is edited in the inspector. */
        readonly property_edited: Signal<(property: string) => void>
        
        /** Emitted when a boolean property is toggled in the inspector.  
         *      
         *  **Note:** This signal is never emitted if the internal `autoclear` property enabled. Since this property is always enabled in the editor inspector, this signal is never emitted by the editor itself.  
         */
        readonly property_toggled: Signal<(property: string, checked: boolean) => void>
        
        /** Emitted when the object being edited by the inspector has changed. */
        readonly edited_object_changed: Signal<() => void>
        
        /** Emitted when a property that requires a restart to be applied is edited in the inspector. This is only used in the Project Settings and Editor Settings. */
        readonly restart_requested: Signal<() => void>
        /** @deprecated Internal use. Does not exist at runtime. */
        __godotNameMap: __NameMapEditorInspector;
    }
    /** @deprecated Internal use. Does not exist at runtime. */
    interface __NameMapEditorInspectorPlugin extends __NameMapRefCounted {
    }
    /** Plugin for adding custom property editors on the inspector.  
     *  	  
     *  @link https://docs.godotengine.org/en/4.5/classes/class_editorinspectorplugin.html  
     */
    class EditorInspectorPlugin extends RefCounted {
        constructor(identifier?: any)
        /** Returns `true` if this object can be handled by this plugin. */
        /* gdvirtual */ _can_handle(object: Object): boolean
        
        /** Called to allow adding controls at the beginning of the property list for [param object]. */
        /* gdvirtual */ _parse_begin(object: Object): void
        
        /** Called to allow adding controls at the beginning of a category in the property list for [param object]. */
        /* gdvirtual */ _parse_category(object: Object, category: string): void
        
        /** Called to allow adding controls at the beginning of a group or a sub-group in the property list for [param object]. */
        /* gdvirtual */ _parse_group(object: Object, group: string): void
        
        /** Called to allow adding property-specific editors to the property list for [param object]. The added editor control must extend [EditorProperty]. Returning `true` removes the built-in editor for this property, otherwise allows to insert a custom editor before the built-in one. */
        /* gdvirtual */ _parse_property(object: Object, type: Variant.Type, name: string, hint_type: PropertyHint, hint_string: string, usage_flags: PropertyUsageFlags, wide: boolean): boolean
        
        /** Called to allow adding controls at the end of the property list for [param object]. */
        /* gdvirtual */ _parse_end(object: Object): void
        
        /** Adds a custom control, which is not necessarily a property editor. */
        add_custom_control(control: Control): void
        
        /** Adds a property editor for an individual property. The [param editor] control must extend [EditorProperty].  
         *  There can be multiple property editors for a property. If [param add_to_end] is `true`, this newly added editor will be displayed after all the other editors of the property whose [param add_to_end] is `false`. For example, the editor uses this parameter to add an "Edit Region" button for [member Sprite2D.region_rect] below the regular [Rect2] editor.  
         *  [param label] can be used to choose a custom label for the property editor in the inspector. If left empty, the label is computed from the name of the property instead.  
         */
        add_property_editor(property: string, editor: Control, add_to_end?: boolean /* = false */, label?: string /* = '' */): void
        
        /** Adds an editor that allows modifying multiple properties. The [param editor] control must extend [EditorProperty]. */
        add_property_editor_for_multiple_properties(label: string, properties: PackedStringArray | string[], editor: Control): void
        /** @deprecated Internal use. Does not exist at runtime. */
        __godotNameMap: __NameMapEditorInspectorPlugin;
    }
    /** @deprecated Internal use. Does not exist at runtime. */
    interface __NameMapEditorNode3DGizmo extends __NameMapNode3DGizmo {
    }
    /** Gizmo for editing [Node3D] objects.  
     *  	  
     *  @link https://docs.godotengine.org/en/4.5/classes/class_editornode3dgizmo.html  
     */
    class EditorNode3DGizmo extends Node3DGizmo {
        constructor(identifier?: any)
        /** Override this method to add all the gizmo elements whenever a gizmo update is requested. It's common to call [method clear] at the beginning of this method and then add visual elements depending on the node's properties. */
        /* gdvirtual */ _redraw(): void
        
        /** Override this method to return the name of an edited handle (handles must have been previously added by [method add_handles]). Handles can be named for reference to the user when editing.  
         *  The [param secondary] argument is `true` when the requested handle is secondary (see [method add_handles] for more information).  
         */
        /* gdvirtual */ _get_handle_name(id: int64, secondary: boolean): string
        
        /** Override this method to return `true` whenever the given handle should be highlighted in the editor.  
         *  The [param secondary] argument is `true` when the requested handle is secondary (see [method add_handles] for more information).  
         */
        /* gdvirtual */ _is_handle_highlighted(id: int64, secondary: boolean): boolean
        
        /** Override this method to return the current value of a handle. This value will be requested at the start of an edit and used as the `restore` argument in [method _commit_handle].  
         *  The [param secondary] argument is `true` when the requested handle is secondary (see [method add_handles] for more information).  
         */
        /* gdvirtual */ _get_handle_value(id: int64, secondary: boolean): any
        /* gdvirtual */ _begin_handle_action(id: int64, secondary: boolean): void
        
        /** Override this method to update the node properties when the user drags a gizmo handle (previously added with [method add_handles]). The provided [param point] is the mouse position in screen coordinates and the [param camera] can be used to convert it to raycasts.  
         *  The [param secondary] argument is `true` when the edited handle is secondary (see [method add_handles] for more information).  
         */
        /* gdvirtual */ _set_handle(id: int64, secondary: boolean, camera: Camera3D, point: Vector2): void
        
        /** Override this method to commit a handle being edited (handles must have been previously added by [method add_handles]). This usually means creating an [UndoRedo] action for the change, using the current handle value as "do" and the [param restore] argument as "undo".  
         *  If the [param cancel] argument is `true`, the [param restore] value should be directly set, without any [UndoRedo] action.  
         *  The [param secondary] argument is `true` when the committed handle is secondary (see [method add_handles] for more information).  
         */
        /* gdvirtual */ _commit_handle(id: int64, secondary: boolean, restore: any, cancel: boolean): void
        
        /** Override this method to allow selecting subgizmos using mouse clicks. Given a [param camera] and a [param point] in screen coordinates, this method should return which subgizmo should be selected. The returned value should be a unique subgizmo identifier, which can have any non-negative value and will be used in other virtual methods like [method _get_subgizmo_transform] or [method _commit_subgizmos]. */
        /* gdvirtual */ _subgizmos_intersect_ray(camera: Camera3D, point: Vector2): int64
        
        /** Override this method to allow selecting subgizmos using mouse drag box selection. Given a [param camera] and a [param frustum], this method should return which subgizmos are contained within the frustum. The [param frustum] argument consists of an array with all the [Plane]s that make up the selection frustum. The returned value should contain a list of unique subgizmo identifiers, which can have any non-negative value and will be used in other virtual methods like [method _get_subgizmo_transform] or [method _commit_subgizmos]. */
        /* gdvirtual */ _subgizmos_intersect_frustum(camera: Camera3D, frustum: GArray<Plane>): PackedInt32Array
        
        /** Override this method to update the node properties during subgizmo editing (see [method _subgizmos_intersect_ray] and [method _subgizmos_intersect_frustum]). The [param transform] is given in the [Node3D]'s local coordinate system. */
        /* gdvirtual */ _set_subgizmo_transform(id: int64, transform: Transform3D): void
        
        /** Override this method to return the current transform of a subgizmo. This transform will be requested at the start of an edit and used as the `restore` argument in [method _commit_subgizmos]. */
        /* gdvirtual */ _get_subgizmo_transform(id: int64): Transform3D
        
        /** Override this method to commit a group of subgizmos being edited (see [method _subgizmos_intersect_ray] and [method _subgizmos_intersect_frustum]). This usually means creating an [UndoRedo] action for the change, using the current transforms as "do" and the [param restores] transforms as "undo".  
         *  If the [param cancel] argument is `true`, the [param restores] transforms should be directly set, without any [UndoRedo] action.  
         */
        /* gdvirtual */ _commit_subgizmos(ids: PackedInt32Array | int32[], restores: GArray<Transform3D>, cancel: boolean): void
        
        /** Adds lines to the gizmo (as sets of 2 points), with a given material. The lines are used for visualizing the gizmo. Call this method during [method _redraw]. */
        add_lines(lines: PackedVector3Array | Vector3[], material: Material, billboard?: boolean /* = false */, modulate?: Color /* = new Color(1, 1, 1, 1) */): void
        
        /** Adds a mesh to the gizmo with the specified [param material], local [param transform] and [param skeleton]. Call this method during [method _redraw]. */
        add_mesh(mesh: Mesh, material?: Material /* = undefined */, transform?: Transform3D /* = new Transform3D() */, skeleton?: SkinReference /* = undefined */): void
        
        /** Adds the specified [param segments] to the gizmo's collision shape for picking. Call this method during [method _redraw]. */
        add_collision_segments(segments: PackedVector3Array | Vector3[]): void
        
        /** Adds collision triangles to the gizmo for picking. A [TriangleMesh] can be generated from a regular [Mesh] too. Call this method during [method _redraw]. */
        add_collision_triangles(triangles: TriangleMesh): void
        
        /** Adds an unscaled billboard for visualization and selection. Call this method during [method _redraw]. */
        add_unscaled_billboard(material: Material, default_scale?: float64 /* = 1 */, modulate?: Color /* = new Color(1, 1, 1, 1) */): void
        
        /** Adds a list of handles (points) which can be used to edit the properties of the gizmo's [Node3D]. The [param ids] argument can be used to specify a custom identifier for each handle, if an empty array is passed, the ids will be assigned automatically from the [param handles] argument order.  
         *  The [param secondary] argument marks the added handles as secondary, meaning they will normally have lower selection priority than regular handles. When the user is holding the shift key secondary handles will switch to have higher priority than regular handles. This change in priority can be used to place multiple handles at the same point while still giving the user control on their selection.  
         *  There are virtual methods which will be called upon editing of these handles. Call this method during [method _redraw].  
         */
        add_handles(handles: PackedVector3Array | Vector3[], material: Material, ids: PackedInt32Array | int32[], billboard?: boolean /* = false */, secondary?: boolean /* = false */): void
        
        /** Sets the reference [Node3D] node for the gizmo. [param node] must inherit from [Node3D]. */
        set_node_3d(node: Node): void
        
        /** Returns the [Node3D] node associated with this gizmo. */
        get_node_3d(): null | Node3D
        
        /** Returns the [EditorNode3DGizmoPlugin] that owns this gizmo. It's useful to retrieve materials using [method EditorNode3DGizmoPlugin.get_material]. */
        get_plugin(): null | EditorNode3DGizmoPlugin
        
        /** Removes everything in the gizmo including meshes, collisions and handles. */
        clear(): void
        
        /** Sets the gizmo's hidden state. If `true`, the gizmo will be hidden. If `false`, it will be shown. */
        set_hidden(hidden: boolean): void
        
        /** Returns `true` if the given subgizmo is currently selected. Can be used to highlight selected elements during [method _redraw]. */
        is_subgizmo_selected(id: int64): boolean
        
        /** Returns a list of the currently selected subgizmos. Can be used to highlight selected elements during [method _redraw]. */
        get_subgizmo_selection(): PackedInt32Array
        /** @deprecated Internal use. Does not exist at runtime. */
        __godotNameMap: __NameMapEditorNode3DGizmo;
    }
    /** @deprecated Internal use. Does not exist at runtime. */
    interface __NameMapEditorNode3DGizmoPlugin extends __NameMapResource {
    }
    /** A class used by the editor to define Node3D gizmo types.  
     *  	  
     *  @link https://docs.godotengine.org/en/4.5/classes/class_editornode3dgizmoplugin.html  
     */
    class EditorNode3DGizmoPlugin extends Resource {
        constructor(identifier?: any)
        /** Override this method to define which Node3D nodes have a gizmo from this plugin. Whenever a [Node3D] node is added to a scene this method is called, if it returns `true` the node gets a generic [EditorNode3DGizmo] assigned and is added to this plugin's list of active gizmos. */
        /* gdvirtual */ _has_gizmo(for_node_3d: Node3D): boolean
        
        /** Override this method to return a custom [EditorNode3DGizmo] for the 3D nodes of your choice, return `null` for the rest of nodes. See also [method _has_gizmo]. */
        /* gdvirtual */ _create_gizmo(for_node_3d: Node3D): null | EditorNode3DGizmo
        
        /** Override this method to provide the name that will appear in the gizmo visibility menu. */
        /* gdvirtual */ _get_gizmo_name(): string
        
        /** Override this method to set the gizmo's priority. Gizmos with higher priority will have precedence when processing inputs like handles or subgizmos selection.  
         *  All built-in editor gizmos return a priority of `-1`. If not overridden, this method will return `0`, which means custom gizmos will automatically get higher priority than built-in gizmos.  
         */
        /* gdvirtual */ _get_priority(): int64
        
        /** Override this method to define whether the gizmos handled by this plugin can be hidden or not. Returns `true` if not overridden. */
        /* gdvirtual */ _can_be_hidden(): boolean
        
        /** Override this method to define whether Node3D with this gizmo should be selectable even when the gizmo is hidden. */
        /* gdvirtual */ _is_selectable_when_hidden(): boolean
        
        /** Override this method to add all the gizmo elements whenever a gizmo update is requested. It's common to call [method EditorNode3DGizmo.clear] at the beginning of this method and then add visual elements depending on the node's properties. */
        /* gdvirtual */ _redraw(gizmo: EditorNode3DGizmo): void
        
        /** Override this method to provide gizmo's handle names. The [param secondary] argument is `true` when the requested handle is secondary (see [method EditorNode3DGizmo.add_handles] for more information). Called for this plugin's active gizmos. */
        /* gdvirtual */ _get_handle_name(gizmo: EditorNode3DGizmo, handle_id: int64, secondary: boolean): string
        
        /** Override this method to return `true` whenever to given handle should be highlighted in the editor. The [param secondary] argument is `true` when the requested handle is secondary (see [method EditorNode3DGizmo.add_handles] for more information). Called for this plugin's active gizmos. */
        /* gdvirtual */ _is_handle_highlighted(gizmo: EditorNode3DGizmo, handle_id: int64, secondary: boolean): boolean
        
        /** Override this method to return the current value of a handle. This value will be requested at the start of an edit and used as the `restore` argument in [method _commit_handle].  
         *  The [param secondary] argument is `true` when the requested handle is secondary (see [method EditorNode3DGizmo.add_handles] for more information).  
         *  Called for this plugin's active gizmos.  
         */
        /* gdvirtual */ _get_handle_value(gizmo: EditorNode3DGizmo, handle_id: int64, secondary: boolean): any
        /* gdvirtual */ _begin_handle_action(gizmo: EditorNode3DGizmo, handle_id: int64, secondary: boolean): void
        
        /** Override this method to update the node's properties when the user drags a gizmo handle (previously added with [method EditorNode3DGizmo.add_handles]). The provided [param screen_pos] is the mouse position in screen coordinates and the [param camera] can be used to convert it to raycasts.  
         *  The [param secondary] argument is `true` when the edited handle is secondary (see [method EditorNode3DGizmo.add_handles] for more information).  
         *  Called for this plugin's active gizmos.  
         */
        /* gdvirtual */ _set_handle(gizmo: EditorNode3DGizmo, handle_id: int64, secondary: boolean, camera: Camera3D, screen_pos: Vector2): void
        
        /** Override this method to commit a handle being edited (handles must have been previously added by [method EditorNode3DGizmo.add_handles] during [method _redraw]). This usually means creating an [UndoRedo] action for the change, using the current handle value as "do" and the [param restore] argument as "undo".  
         *  If the [param cancel] argument is `true`, the [param restore] value should be directly set, without any [UndoRedo] action.  
         *  The [param secondary] argument is `true` when the committed handle is secondary (see [method EditorNode3DGizmo.add_handles] for more information).  
         *  Called for this plugin's active gizmos.  
         */
        /* gdvirtual */ _commit_handle(gizmo: EditorNode3DGizmo, handle_id: int64, secondary: boolean, restore: any, cancel: boolean): void
        
        /** Override this method to allow selecting subgizmos using mouse clicks. Given a [param camera] and a [param screen_pos] in screen coordinates, this method should return which subgizmo should be selected. The returned value should be a unique subgizmo identifier, which can have any non-negative value and will be used in other virtual methods like [method _get_subgizmo_transform] or [method _commit_subgizmos]. Called for this plugin's active gizmos. */
        /* gdvirtual */ _subgizmos_intersect_ray(gizmo: EditorNode3DGizmo, camera: Camera3D, screen_pos: Vector2): int64
        
        /** Override this method to allow selecting subgizmos using mouse drag box selection. Given a [param camera] and [param frustum_planes], this method should return which subgizmos are contained within the frustums. The [param frustum_planes] argument consists of an array with all the [Plane]s that make up the selection frustum. The returned value should contain a list of unique subgizmo identifiers, these identifiers can have any non-negative value and will be used in other virtual methods like [method _get_subgizmo_transform] or [method _commit_subgizmos]. Called for this plugin's active gizmos. */
        /* gdvirtual */ _subgizmos_intersect_frustum(gizmo: EditorNode3DGizmo, camera: Camera3D, frustum_planes: GArray<Plane>): PackedInt32Array
        
        /** Override this method to return the current transform of a subgizmo. As with all subgizmo methods, the transform should be in local space respect to the gizmo's Node3D. This transform will be requested at the start of an edit and used in the `restore` argument in [method _commit_subgizmos]. Called for this plugin's active gizmos. */
        /* gdvirtual */ _get_subgizmo_transform(gizmo: EditorNode3DGizmo, subgizmo_id: int64): Transform3D
        
        /** Override this method to update the node properties during subgizmo editing (see [method _subgizmos_intersect_ray] and [method _subgizmos_intersect_frustum]). The [param transform] is given in the Node3D's local coordinate system. Called for this plugin's active gizmos. */
        /* gdvirtual */ _set_subgizmo_transform(gizmo: EditorNode3DGizmo, subgizmo_id: int64, transform: Transform3D): void
        
        /** Override this method to commit a group of subgizmos being edited (see [method _subgizmos_intersect_ray] and [method _subgizmos_intersect_frustum]). This usually means creating an [UndoRedo] action for the change, using the current transforms as "do" and the [param restores] transforms as "undo".  
         *  If the [param cancel] argument is `true`, the [param restores] transforms should be directly set, without any [UndoRedo] action. As with all subgizmo methods, transforms are given in local space respect to the gizmo's Node3D. Called for this plugin's active gizmos.  
         */
        /* gdvirtual */ _commit_subgizmos(gizmo: EditorNode3DGizmo, ids: PackedInt32Array | int32[], restores: GArray<Transform3D>, cancel: boolean): void
        
        /** Creates an unshaded material with its variants (selected and/or editable) and adds them to the internal material list. They can then be accessed with [method get_material] and used in [method EditorNode3DGizmo.add_mesh] and [method EditorNode3DGizmo.add_lines]. Should not be overridden. */
        create_material(name: string, color: Color, billboard?: boolean /* = false */, on_top?: boolean /* = false */, use_vertex_color?: boolean /* = false */): void
        
        /** Creates an icon material with its variants (selected and/or editable) and adds them to the internal material list. They can then be accessed with [method get_material] and used in [method EditorNode3DGizmo.add_unscaled_billboard]. Should not be overridden. */
        create_icon_material(name: string, texture: Texture2D, on_top?: boolean /* = false */, color?: Color /* = new Color(1, 1, 1, 1) */): void
        
        /** Creates a handle material with its variants (selected and/or editable) and adds them to the internal material list. They can then be accessed with [method get_material] and used in [method EditorNode3DGizmo.add_handles]. Should not be overridden.  
         *  You can optionally provide a texture to use instead of the default icon.  
         */
        create_handle_material(name: string, billboard?: boolean /* = false */, texture?: Texture2D /* = undefined */): void
        
        /** Adds a new material to the internal material list for the plugin. It can then be accessed with [method get_material]. Should not be overridden. */
        add_material(name: string, material: StandardMaterial3D): void
        
        /** Gets material from the internal list of materials. If an [EditorNode3DGizmo] is provided, it will try to get the corresponding variant (selected and/or editable). */
        get_material(name: string, gizmo?: EditorNode3DGizmo /* = undefined */): null | StandardMaterial3D
        /** @deprecated Internal use. Does not exist at runtime. */
        __godotNameMap: __NameMapEditorNode3DGizmoPlugin;
    }
    /** @deprecated Internal use. Does not exist at runtime. */
    interface __NameMapEditorPaths extends __NameMapObject {
    }
    /** Editor-only singleton that returns paths to various OS-specific data folders and files.  
     *  	  
     *  @link https://docs.godotengine.org/en/4.5/classes/class_editorpaths.html  
     */
    class EditorPaths extends Object {
        constructor(identifier?: any)
        /** Returns the absolute path to the user's data folder. This folder should be used for  *persistent*  user data files such as installed export templates.  
         *  **Default paths per platform:**  
         *  [codeblock lang=text]  
         *  - Windows: %APPDATA%\Godot\                    (same as `get_config_dir()`)  
         *  - macOS: ~/Library/Application Support/Godot/  (same as `get_config_dir()`)  
         *  - Linux: ~/.local/share/godot/  
         *  [/codeblock]  
         */
        get_data_dir(): string
        
        /** Returns the absolute path to the user's configuration folder. This folder should be used for  *persistent*  user configuration files.  
         *  **Default paths per platform:**  
         *  [codeblock lang=text]  
         *  - Windows: %APPDATA%\Godot\                    (same as `get_data_dir()`)  
         *  - macOS: ~/Library/Application Support/Godot/  (same as `get_data_dir()`)  
         *  - Linux: ~/.config/godot/  
         *  [/codeblock]  
         */
        get_config_dir(): string
        
        /** Returns the absolute path to the user's cache folder. This folder should be used for temporary data that can be removed safely whenever the editor is closed (such as generated resource thumbnails).  
         *  **Default paths per platform:**  
         *  [codeblock lang=text]  
         *  - Windows: %LOCALAPPDATA%\Godot\  
         *  - macOS: ~/Library/Caches/Godot/  
         *  - Linux: ~/.cache/godot/  
         *  [/codeblock]  
         */
        get_cache_dir(): string
        
        /** Returns `true` if the editor is marked as self-contained, `false` otherwise. When self-contained mode is enabled, user configuration, data and cache files are saved in an `editor_data/` folder next to the editor binary. This makes portable usage easier and ensures the Godot editor minimizes file writes outside its own folder. Self-contained mode is not available for exported projects.  
         *  Self-contained mode can be enabled by creating a file named `._sc_` or `_sc_` in the same folder as the editor binary or macOS .app bundle while the editor is not running. See also [method get_self_contained_file].  
         *      
         *  **Note:** On macOS, quarantine flag should be manually removed before using self-contained mode, see [url=https://docs.godotengine.org/en/stable/tutorials/export/running_on_macos.html]Running on macOS[/url].  
         *      
         *  **Note:** On macOS, placing `_sc_` or any other file inside .app bundle will break digital signature and make it non-portable, consider placing it in the same folder as the .app bundle instead.  
         *      
         *  **Note:** The Steam release of Godot uses self-contained mode by default.  
         */
        is_self_contained(): boolean
        
        /** Returns the absolute path to the self-contained file that makes the current Godot editor instance be considered as self-contained. Returns an empty string if the current Godot editor instance isn't self-contained. See also [method is_self_contained]. */
        get_self_contained_file(): string
        
        /** Returns the project-specific editor settings path. Projects all have a unique subdirectory inside the settings path where project-specific editor settings are saved. */
        get_project_settings_dir(): string
        /** @deprecated Internal use. Does not exist at runtime. */
        __godotNameMap: __NameMapEditorPaths;
    }
    namespace EditorPlugin {
        enum CustomControlContainer {
            /** Main editor toolbar, next to play buttons. */
            CONTAINER_TOOLBAR = 0,
            
            /** The toolbar that appears when 3D editor is active. */
            CONTAINER_SPATIAL_EDITOR_MENU = 1,
            
            /** Left sidebar of the 3D editor. */
            CONTAINER_SPATIAL_EDITOR_SIDE_LEFT = 2,
            
            /** Right sidebar of the 3D editor. */
            CONTAINER_SPATIAL_EDITOR_SIDE_RIGHT = 3,
            
            /** Bottom panel of the 3D editor. */
            CONTAINER_SPATIAL_EDITOR_BOTTOM = 4,
            
            /** The toolbar that appears when 2D editor is active. */
            CONTAINER_CANVAS_EDITOR_MENU = 5,
            
            /** Left sidebar of the 2D editor. */
            CONTAINER_CANVAS_EDITOR_SIDE_LEFT = 6,
            
            /** Right sidebar of the 2D editor. */
            CONTAINER_CANVAS_EDITOR_SIDE_RIGHT = 7,
            
            /** Bottom panel of the 2D editor. */
            CONTAINER_CANVAS_EDITOR_BOTTOM = 8,
            
            /** Bottom section of the inspector. */
            CONTAINER_INSPECTOR_BOTTOM = 9,
            
            /** Tab of Project Settings dialog, to the left of other tabs. */
            CONTAINER_PROJECT_SETTING_TAB_LEFT = 10,
            
            /** Tab of Project Settings dialog, to the right of other tabs. */
            CONTAINER_PROJECT_SETTING_TAB_RIGHT = 11,
        }
        enum DockSlot {
            /** Dock slot, left side, upper-left (empty in default layout). */
            DOCK_SLOT_LEFT_UL = 0,
            
            /** Dock slot, left side, bottom-left (empty in default layout). */
            DOCK_SLOT_LEFT_BL = 1,
            
            /** Dock slot, left side, upper-right (in default layout includes Scene and Import docks). */
            DOCK_SLOT_LEFT_UR = 2,
            
            /** Dock slot, left side, bottom-right (in default layout includes FileSystem dock). */
            DOCK_SLOT_LEFT_BR = 3,
            
            /** Dock slot, right side, upper-left (in default layout includes Inspector, Node, and History docks). */
            DOCK_SLOT_RIGHT_UL = 4,
            
            /** Dock slot, right side, bottom-left (empty in default layout). */
            DOCK_SLOT_RIGHT_BL = 5,
            
            /** Dock slot, right side, upper-right (empty in default layout). */
            DOCK_SLOT_RIGHT_UR = 6,
            
            /** Dock slot, right side, bottom-right (empty in default layout). */
            DOCK_SLOT_RIGHT_BR = 7,
            
            /** Represents the size of the [enum DockSlot] enum. */
            DOCK_SLOT_MAX = 8,
        }
        enum AfterGUIInput {
            /** Forwards the [InputEvent] to other EditorPlugins. */
            AFTER_GUI_INPUT_PASS = 0,
            
            /** Prevents the [InputEvent] from reaching other Editor classes. */
            AFTER_GUI_INPUT_STOP = 1,
            
            /** Pass the [InputEvent] to other editor plugins except the main [Node3D] one. This can be used to prevent node selection changes and work with sub-gizmos instead. */
            AFTER_GUI_INPUT_CUSTOM = 2,
        }
    }
    /** @deprecated Internal use. Does not exist at runtime. */
    interface __NameMapEditorPlugin extends __NameMapNode {
    }
    /** Used by the editor to extend its functionality.  
     *  	  
     *  @link https://docs.godotengine.org/en/4.5/classes/class_editorplugin.html  
     */
    class EditorPlugin<Map extends NodePathMap = any> extends Node<Map> {
        constructor(identifier?: any)
        /** Called when there is a root node in the current edited scene, [method _handles] is implemented, and an [InputEvent] happens in the 2D viewport. If this method returns `true`, [param event] is intercepted by this [EditorPlugin], otherwise [param event] is forwarded to other Editor classes.  
         *    
         *  This method must return `false` in order to forward the [InputEvent] to other Editor classes.  
         *    
         */
        /* gdvirtual */ _forward_canvas_gui_input(event: InputEvent): boolean
        
        /** Called by the engine when the 2D editor's viewport is updated. [param viewport_control] is an overlay on top of the viewport and it can be used for drawing. You can update the viewport manually by calling [method update_overlays].  
         *    
         */
        /* gdvirtual */ _forward_canvas_draw_over_viewport(viewport_control: Control): void
        
        /** This method is the same as [method _forward_canvas_draw_over_viewport], except it draws on top of everything. Useful when you need an extra layer that shows over anything else.  
         *  You need to enable calling of this method by using [method set_force_draw_over_forwarding_enabled].  
         */
        /* gdvirtual */ _forward_canvas_force_draw_over_viewport(viewport_control: Control): void
        
        /** Called when there is a root node in the current edited scene, [method _handles] is implemented, and an [InputEvent] happens in the 3D viewport. The return value decides whether the [InputEvent] is consumed or forwarded to other [EditorPlugin]s. See [enum AfterGUIInput] for options.  
         *    
         *  This method must return [constant AFTER_GUI_INPUT_PASS] in order to forward the [InputEvent] to other Editor classes.  
         *    
         */
        /* gdvirtual */ _forward_3d_gui_input(viewport_camera: Camera3D, event: InputEvent): int64
        
        /** Called by the engine when the 3D editor's viewport is updated. [param viewport_control] is an overlay on top of the viewport and it can be used for drawing. You can update the viewport manually by calling [method update_overlays].  
         *    
         */
        /* gdvirtual */ _forward_3d_draw_over_viewport(viewport_control: Control): void
        
        /** This method is the same as [method _forward_3d_draw_over_viewport], except it draws on top of everything. Useful when you need an extra layer that shows over anything else.  
         *  You need to enable calling of this method by using [method set_force_draw_over_forwarding_enabled].  
         */
        /* gdvirtual */ _forward_3d_force_draw_over_viewport(viewport_control: Control): void
        
        /** Override this method in your plugin to provide the name of the plugin when displayed in the Godot editor.  
         *  For main screen plugins, this appears at the top of the screen, to the right of the "2D", "3D", "Script", "Game", and "AssetLib" buttons.  
         */
        /* gdvirtual */ _get_plugin_name(): string
        
        /** Override this method in your plugin to return a [Texture2D] in order to give it an icon.  
         *  For main screen plugins, this appears at the top of the screen, to the right of the "2D", "3D", "Script", "Game", and "AssetLib" buttons.  
         *  Ideally, the plugin icon should be white with a transparent background and 16×16 pixels in size.  
         *    
         */
        /* gdvirtual */ _get_plugin_icon(): null | Texture2D
        
        /** Returns `true` if this is a main screen editor plugin (it goes in the workspace selector together with **2D**, **3D**, **Script**, **Game**, and **AssetLib**).  
         *  When the plugin's workspace is selected, other main screen plugins will be hidden, but your plugin will not appear automatically. It needs to be added as a child of [method EditorInterface.get_editor_main_screen] and made visible inside [method _make_visible].  
         *  Use [method _get_plugin_name] and [method _get_plugin_icon] to customize the plugin button's appearance.  
         *    
         */
        /* gdvirtual */ _has_main_screen(): boolean
        
        /** This function will be called when the editor is requested to become visible. It is used for plugins that edit a specific object type.  
         *  Remember that you have to manage the visibility of all your editor controls manually.  
         */
        /* gdvirtual */ _make_visible(visible: boolean): void
        
        /** This function is used for plugins that edit specific object types (nodes or resources). It requests the editor to edit the given object.  
         *  [param object] can be `null` if the plugin was editing an object, but there is no longer any selected object handled by this plugin. It can be used to cleanup editing state.  
         */
        /* gdvirtual */ _edit(object: Object): void
        
        /** Implement this function if your plugin edits a specific type of object (Resource or Node). If you return `true`, then you will get the functions [method _edit] and [method _make_visible] called when the editor requests them. If you have declared the methods [method _forward_canvas_gui_input] and [method _forward_3d_gui_input] these will be called too.  
         *      
         *  **Note:** Each plugin should handle only one type of objects at a time. If a plugin handles more types of objects and they are edited at the same time, it will result in errors.  
         */
        /* gdvirtual */ _handles(object: Object): boolean
        
        /** Override this method to provide a state data you want to be saved, like view position, grid settings, folding, etc. This is used when saving the scene (so state is kept when opening it again) and for switching tabs (so state can be restored when the tab returns). This data is automatically saved for each scene in an `editstate` file in the editor metadata folder. If you want to store global (scene-independent) editor data for your plugin, you can use [method _get_window_layout] instead.  
         *  Use [method _set_state] to restore your saved state.  
         *      
         *  **Note:** This method should not be used to save important settings that should persist with the project.  
         *      
         *  **Note:** You must implement [method _get_plugin_name] for the state to be stored and restored correctly.  
         *    
         */
        /* gdvirtual */ _get_state(): GDictionary
        
        /** Restore the state saved by [method _get_state]. This method is called when the current scene tab is changed in the editor.  
         *      
         *  **Note:** Your plugin must implement [method _get_plugin_name], otherwise it will not be recognized and this method will not be called.  
         *    
         */
        /* gdvirtual */ _set_state(state: GDictionary): void
        
        /** Clear all the state and reset the object being edited to zero. This ensures your plugin does not keep editing a currently existing node, or a node from the wrong scene. */
        /* gdvirtual */ _clear(): void
        
        /** Override this method to provide a custom message that lists unsaved changes. The editor will call this method when exiting or when closing a scene, and display the returned string in a confirmation dialog. Return empty string if the plugin has no unsaved changes.  
         *  When closing a scene, [param for_scene] is the path to the scene being closed. You can use it to handle built-in resources in that scene.  
         *  If the user confirms saving, [method _save_external_data] will be called, before closing the editor.  
         *    
         *  If the plugin has no scene-specific changes, you can ignore the calls when closing scenes:  
         *    
         */
        /* gdvirtual */ _get_unsaved_status(for_scene: string): string
        
        /** This method is called after the editor saves the project or when it's closed. It asks the plugin to save edited external scenes/resources. */
        /* gdvirtual */ _save_external_data(): void
        
        /** This method is called when the editor is about to save the project, switch to another tab, etc. It asks the plugin to apply any pending state changes to ensure consistency.  
         *  This is used, for example, in shader editors to let the plugin know that it must apply the shader code being written by the user to the object.  
         */
        /* gdvirtual */ _apply_changes(): void
        
        /** This is for editors that edit script-based objects. You can return a list of breakpoints in the format (`script:line`), for example: `res://path_to_script.gd:25`. */
        /* gdvirtual */ _get_breakpoints(): PackedStringArray
        
        /** Restore the plugin GUI layout and data saved by [method _get_window_layout]. This method is called for every plugin on editor startup. Use the provided [param configuration] file to read your saved data.  
         *    
         */
        /* gdvirtual */ _set_window_layout(configuration: ConfigFile): void
        
        /** Override this method to provide the GUI layout of the plugin or any other data you want to be stored. This is used to save the project's editor layout when [method queue_save_layout] is called or the editor layout was changed (for example changing the position of a dock). The data is stored in the `editor_layout.cfg` file in the editor metadata directory.  
         *  Use [method _set_window_layout] to restore your saved layout.  
         *    
         */
        /* gdvirtual */ _get_window_layout(configuration: ConfigFile): void
        
        /** This method is called when the editor is about to run the project. The plugin can then perform required operations before the project runs.  
         *  This method must return a boolean. If this method returns `false`, the project will not run. The run is aborted immediately, so this also prevents all other plugins' [method _build] methods from running.  
         */
        /* gdvirtual */ _build(): boolean
        
        /** Called by the engine when the user enables the [EditorPlugin] in the Plugin tab of the project settings window. */
        /* gdvirtual */ _enable_plugin(): void
        
        /** Called by the engine when the user disables the [EditorPlugin] in the Plugin tab of the project settings window. */
        /* gdvirtual */ _disable_plugin(): void
        
        /** Adds a custom control to a container in the editor UI.  
         *  Please remember that you have to manage the visibility of your custom controls yourself (and likely hide it after adding it).  
         *  When your plugin is deactivated, make sure to remove your custom control with [method remove_control_from_container] and free it with [method Node.queue_free].  
         */
        add_control_to_container(container: EditorPlugin.CustomControlContainer, control: Control): void
        
        /** Adds a control to the bottom panel (together with Output, Debug, Animation, etc.). Returns a reference to the button added. It's up to you to hide/show the button when needed. When your plugin is deactivated, make sure to remove your custom control with [method remove_control_from_bottom_panel] and free it with [method Node.queue_free].  
         *  Optionally, you can specify a shortcut parameter. When pressed, this shortcut will toggle the bottom panel's visibility. See the default editor bottom panel shortcuts in the Editor Settings for inspiration. Per convention, they all use [kbd]Alt[/kbd] modifier.  
         */
        add_control_to_bottom_panel(control: Control, title: string, shortcut?: Shortcut /* = undefined */): null | Button
        
        /** Adds the control to a specific dock slot.  
         *  If the dock is repositioned and as long as the plugin is active, the editor will save the dock position on further sessions.  
         *  When your plugin is deactivated, make sure to remove your custom control with [method remove_control_from_docks] and free it with [method Node.queue_free].  
         *  Optionally, you can specify a shortcut parameter. When pressed, this shortcut will open and focus the dock.  
         */
        add_control_to_dock(slot: EditorPlugin.DockSlot, control: Control, shortcut?: Shortcut /* = undefined */): void
        
        /** Removes the control from the dock. You have to manually [method Node.queue_free] the control. */
        remove_control_from_docks(control: Control): void
        
        /** Removes the control from the bottom panel. You have to manually [method Node.queue_free] the control. */
        remove_control_from_bottom_panel(control: Control): void
        
        /** Removes the control from the specified container. You have to manually [method Node.queue_free] the control. */
        remove_control_from_container(container: EditorPlugin.CustomControlContainer, control: Control): void
        
        /** Sets the tab icon for the given control in a dock slot. Setting to `null` removes the icon. */
        set_dock_tab_icon(control: Control, icon: Texture2D): void
        
        /** Adds a custom menu item to **Project > Tools** named [param name]. When clicked, the provided [param callable] will be called. */
        add_tool_menu_item(name: string, callable: Callable): void
        
        /** Adds a custom [PopupMenu] submenu under **Project > Tools >** [param name]. Use [method remove_tool_menu_item] on plugin clean up to remove the menu. */
        add_tool_submenu_item(name: string, submenu: PopupMenu): void
        
        /** Removes a menu [param name] from **Project > Tools**. */
        remove_tool_menu_item(name: string): void
        
        /** Returns the [PopupMenu] under **Scene > Export As...**. */
        get_export_as_menu(): null | PopupMenu
        
        /** Adds a custom type, which will appear in the list of nodes or resources.  
         *  When a given node or resource is selected, the base type will be instantiated (e.g. "Node3D", "Control", "Resource"), then the script will be loaded and set to this object.  
         *      
         *  **Note:** The base type is the base engine class which this type's class hierarchy inherits, not any custom type parent classes.  
         *  You can use the virtual method [method _handles] to check if your custom object is being edited by checking the script or using the `is` keyword.  
         *  During run-time, this will be a simple object with a script so this function does not need to be called then.  
         *      
         *  **Note:** Custom types added this way are not true classes. They are just a helper to create a node with specific script.  
         */
        add_custom_type(type: string, base: string, script: Script, icon: Texture2D): void
        
        /** Removes a custom type added by [method add_custom_type]. */
        remove_custom_type(type: string): void
        
        /** Adds a script at [param path] to the Autoload list as [param name]. */
        add_autoload_singleton(name: string, path: string): void
        
        /** Removes an Autoload [param name] from the list. */
        remove_autoload_singleton(name: string): void
        
        /** Updates the overlays of the 2D and 3D editor viewport. Causes methods [method _forward_canvas_draw_over_viewport], [method _forward_canvas_force_draw_over_viewport], [method _forward_3d_draw_over_viewport] and [method _forward_3d_force_draw_over_viewport] to be called. */
        update_overlays(): int64
        
        /** Makes a specific item in the bottom panel visible. */
        make_bottom_panel_item_visible(item: Control): void
        
        /** Minimizes the bottom panel. */
        hide_bottom_panel(): void
        
        /** Gets the undo/redo object. Most actions in the editor can be undoable, so use this object to make sure this happens when it's worth it. */
        get_undo_redo(): null | EditorUndoRedoManager
        
        /** Hooks a callback into the undo/redo action creation when a property is modified in the inspector. This allows, for example, to save other properties that may be lost when a given property is modified.  
         *  The callback should have 4 arguments: [Object] `undo_redo`, [Object] `modified_object`, [String] `property` and [Variant] `new_value`. They are, respectively, the [UndoRedo] object used by the inspector, the currently modified object, the name of the modified property and the new value the property is about to take.  
         */
        add_undo_redo_inspector_hook_callback(callable: Callable): void
        
        /** Removes a callback previously added by [method add_undo_redo_inspector_hook_callback]. */
        remove_undo_redo_inspector_hook_callback(callable: Callable): void
        
        /** Queue save the project's editor layout. */
        queue_save_layout(): void
        
        /** Registers a custom translation parser plugin for extracting translatable strings from custom files. */
        add_translation_parser_plugin(parser: EditorTranslationParserPlugin): void
        
        /** Removes a custom translation parser plugin registered by [method add_translation_parser_plugin]. */
        remove_translation_parser_plugin(parser: EditorTranslationParserPlugin): void
        
        /** Registers a new [EditorImportPlugin]. Import plugins are used to import custom and unsupported assets as a custom [Resource] type.  
         *  If [param first_priority] is `true`, the new import plugin is inserted first in the list and takes precedence over pre-existing plugins.  
         *      
         *  **Note:** If you want to import custom 3D asset formats use [method add_scene_format_importer_plugin] instead.  
         *  See [method add_inspector_plugin] for an example of how to register a plugin.  
         */
        add_import_plugin(importer: EditorImportPlugin, first_priority?: boolean /* = false */): void
        
        /** Removes an import plugin registered by [method add_import_plugin]. */
        remove_import_plugin(importer: EditorImportPlugin): void
        
        /** Registers a new [EditorSceneFormatImporter]. Scene importers are used to import custom 3D asset formats as scenes.  
         *  If [param first_priority] is `true`, the new import plugin is inserted first in the list and takes precedence over pre-existing plugins.  
         */
        add_scene_format_importer_plugin(scene_format_importer: EditorSceneFormatImporter, first_priority?: boolean /* = false */): void
        
        /** Removes a scene format importer registered by [method add_scene_format_importer_plugin]. */
        remove_scene_format_importer_plugin(scene_format_importer: EditorSceneFormatImporter): void
        
        /** Add an [EditorScenePostImportPlugin]. These plugins allow customizing the import process of 3D assets by adding new options to the import dialogs.  
         *  If [param first_priority] is `true`, the new import plugin is inserted first in the list and takes precedence over pre-existing plugins.  
         */
        add_scene_post_import_plugin(scene_import_plugin: EditorScenePostImportPlugin, first_priority?: boolean /* = false */): void
        
        /** Remove the [EditorScenePostImportPlugin], added with [method add_scene_post_import_plugin]. */
        remove_scene_post_import_plugin(scene_import_plugin: EditorScenePostImportPlugin): void
        
        /** Registers a new [EditorExportPlugin]. Export plugins are used to perform tasks when the project is being exported.  
         *  See [method add_inspector_plugin] for an example of how to register a plugin.  
         */
        add_export_plugin(plugin: EditorExportPlugin): void
        
        /** Removes an export plugin registered by [method add_export_plugin]. */
        remove_export_plugin(plugin: EditorExportPlugin): void
        
        /** Registers a new [EditorExportPlatform]. Export platforms provides functionality of exporting to the specific platform. */
        add_export_platform(platform: EditorExportPlatform): void
        
        /** Removes an export platform registered by [method add_export_platform]. */
        remove_export_platform(platform: EditorExportPlatform): void
        
        /** Registers a new [EditorNode3DGizmoPlugin]. Gizmo plugins are used to add custom gizmos to the 3D preview viewport for a [Node3D].  
         *  See [method add_inspector_plugin] for an example of how to register a plugin.  
         */
        add_node_3d_gizmo_plugin(plugin: EditorNode3DGizmoPlugin): void
        
        /** Removes a gizmo plugin registered by [method add_node_3d_gizmo_plugin]. */
        remove_node_3d_gizmo_plugin(plugin: EditorNode3DGizmoPlugin): void
        
        /** Registers a new [EditorInspectorPlugin]. Inspector plugins are used to extend [EditorInspector] and provide custom configuration tools for your object's properties.  
         *      
         *  **Note:** Always use [method remove_inspector_plugin] to remove the registered [EditorInspectorPlugin] when your [EditorPlugin] is disabled to prevent leaks and an unexpected behavior.  
         *    
         */
        add_inspector_plugin(plugin: EditorInspectorPlugin): void
        
        /** Removes an inspector plugin registered by [method add_inspector_plugin]. */
        remove_inspector_plugin(plugin: EditorInspectorPlugin): void
        
        /** Registers a new [EditorResourceConversionPlugin]. Resource conversion plugins are used to add custom resource converters to the editor inspector.  
         *  See [EditorResourceConversionPlugin] for an example of how to create a resource conversion plugin.  
         */
        add_resource_conversion_plugin(plugin: EditorResourceConversionPlugin): void
        
        /** Removes a resource conversion plugin registered by [method add_resource_conversion_plugin]. */
        remove_resource_conversion_plugin(plugin: EditorResourceConversionPlugin): void
        
        /** Use this method if you always want to receive inputs from 3D view screen inside [method _forward_3d_gui_input]. It might be especially usable if your plugin will want to use raycast in the scene. */
        set_input_event_forwarding_always_enabled(): void
        
        /** Enables calling of [method _forward_canvas_force_draw_over_viewport] for the 2D editor and [method _forward_3d_force_draw_over_viewport] for the 3D editor when their viewports are updated. You need to call this method only once and it will work permanently for this plugin. */
        set_force_draw_over_forwarding_enabled(): void
        
        /** Adds a plugin to the context menu. [param slot] is the context menu where the plugin will be added.  
         *      
         *  **Note:** A plugin instance can belong only to a single context menu slot.  
         */
        add_context_menu_plugin(slot: EditorContextMenuPlugin.ContextMenuSlot, plugin: EditorContextMenuPlugin): void
        
        /** Removes the specified context menu plugin. */
        remove_context_menu_plugin(plugin: EditorContextMenuPlugin): void
        
        /** Returns the [EditorInterface] singleton instance. */
        get_editor_interface(): null | EditorInterface
        
        /** Gets the Editor's dialog used for making scripts.  
         *      
         *  **Note:** Users can configure it before use.  
         *  **Warning:** Removing and freeing this node will render a part of the editor useless and may cause a crash.  
         */
        get_script_create_dialog(): null | ScriptCreateDialog
        
        /** Adds a [Script] as debugger plugin to the Debugger. The script must extend [EditorDebuggerPlugin]. */
        add_debugger_plugin(script: EditorDebuggerPlugin): void
        
        /** Removes the debugger plugin with given script from the Debugger. */
        remove_debugger_plugin(script: EditorDebuggerPlugin): void
        
        /** Provide the version of the plugin declared in the `plugin.cfg` config file. */
        get_plugin_version(): string
        
        /** Emitted when the scene is changed in the editor. The argument will return the root node of the scene that has just become active. If this scene is new and empty, the argument will be `null`. */
        readonly scene_changed: Signal<(scene_root: Node) => void>
        
        /** Emitted when user closes a scene. The argument is a file path to the closed scene. */
        readonly scene_closed: Signal<(filepath: string) => void>
        
        /** Emitted when user changes the workspace (**2D**, **3D**, **Script**, **Game**, **AssetLib**). Also works with custom screens defined by plugins. */
        readonly main_screen_changed: Signal<(screen_name: string) => void>
        
        /** Emitted when the given [param resource] was saved on disc. See also [signal scene_saved]. */
        readonly resource_saved: Signal<(resource: Resource) => void>
        
        /** Emitted when a scene was saved on disc. The argument is a file path to the saved scene. See also [signal resource_saved]. */
        readonly scene_saved: Signal<(filepath: string) => void>
        
        /** Emitted when any project setting has changed. */
        readonly project_settings_changed: Signal<() => void>
        /** @deprecated Internal use. Does not exist at runtime. */
        __godotNameMap: __NameMapEditorPlugin;
    }
    /** @deprecated Internal use. Does not exist at runtime. */
    interface __NameMapEditorProperty extends __NameMapContainer {
    }
    /** Custom control for editing properties that can be added to the [EditorInspector].  
     *  	  
     *  @link https://docs.godotengine.org/en/4.5/classes/class_editorproperty.html  
     */
    class EditorProperty<Map extends NodePathMap = any> extends Container<Map> {
        constructor(identifier?: any)
        /** When this virtual function is called, you must update your editor. */
        /* gdvirtual */ _update_property(): void
        
        /** Called when the read-only status of the property is changed. It may be used to change custom controls into a read-only or modifiable state. */
        /* gdvirtual */ _set_read_only(read_only: boolean): void
        
        /** Returns the edited property. If your editor is for a single property (added via [method EditorInspectorPlugin._parse_property]), then this will return the property.  
         *      
         *  **Note:** This method could return `null` if the editor has not yet been associated with a property. However, in [method _update_property] and [method _set_read_only], this value is  *guaranteed*  to be non-`null`.  
         */
        get_edited_property(): StringName
        
        /** Returns the edited object.  
         *      
         *  **Note:** This method could return `null` if the editor has not yet been associated with a property. However, in [method _update_property] and [method _set_read_only], this value is  *guaranteed*  to be non-`null`.  
         */
        get_edited_object(): null | Object
        
        /** Forces a refresh of the property display. */
        update_property(): void
        
        /** If any of the controls added can gain keyboard focus, add it here. This ensures that focus will be restored if the inspector is refreshed. */
        add_focusable(control: Control): void
        
        /** Puts the [param editor] control below the property label. The control must be previously added using [method Node.add_child]. */
        set_bottom_editor(editor: Control): void
        
        /** Draw property as not selected. Used by the inspector. */
        deselect(): void
        
        /** Returns `true` if property is drawn as selected. Used by the inspector. */
        is_selected(): boolean
        
        /** Draw property as selected. Used by the inspector. */
        select(focusable?: int64 /* = -1 */): void
        
        /** Assigns object and property to edit. */
        set_object_and_property(object: Object, property: StringName): void
        
        /** Used by the inspector, set to a control that will be used as a reference to calculate the size of the label. */
        set_label_reference(control: Control): void
        
        /** If one or several properties have changed, this must be called. [param field] is used in case your editor can modify fields separately (as an example, Vector3.x). The [param changing] argument avoids the editor requesting this property to be refreshed (leave as `false` if unsure). */
        emit_changed(property: StringName, value: any, field?: StringName /* = '' */, changing?: boolean /* = false */): void
        _update_editor_property_status(): void
        
        /** Set this property to change the label (if you want to show one). */
        get label(): string
        set label(value: string)
        
        /** Used by the inspector, set to `true` when the property is read-only. */
        get read_only(): boolean
        set read_only(value: boolean)
        
        /** Used by the inspector, set to `true` when the property label is drawn. */
        get draw_label(): boolean
        set draw_label(value: boolean)
        
        /** Used by the inspector, set to `true` when the property background is drawn. */
        get draw_background(): boolean
        set draw_background(value: boolean)
        
        /** Used by the inspector, set to `true` when the property is checkable. */
        get checkable(): boolean
        set checkable(value: boolean)
        
        /** Used by the inspector, set to `true` when the property is checked. */
        get checked(): boolean
        set checked(value: boolean)
        
        /** Used by the inspector, set to `true` when the property is drawn with the editor theme's warning color. This is used for editable children's properties. */
        get draw_warning(): boolean
        set draw_warning(value: boolean)
        
        /** Used by the inspector, set to `true` when the property can add keys for animation. */
        get keying(): boolean
        set keying(value: boolean)
        
        /** Used by the inspector, set to `true` when the property can be deleted by the user. */
        get deletable(): boolean
        set deletable(value: boolean)
        
        /** Used by the inspector, set to `true` when the property is selectable. */
        get selectable(): boolean
        set selectable(value: boolean)
        
        /** Used by the inspector, set to `true` when the property is using folding. */
        get use_folding(): boolean
        set use_folding(value: boolean)
        
        /** Space distribution ratio between the label and the editing field. */
        get name_split_ratio(): float64
        set name_split_ratio(value: float64)
        
        /** Do not emit this manually, use the [method emit_changed] method instead. */
        readonly property_changed: Signal<(property: StringName, value: any, field: StringName, changing: boolean) => void>
        
        /** Emit it if you want multiple properties modified at the same time. Do not use if added via [method EditorInspectorPlugin._parse_property]. */
        readonly multiple_properties_changed: Signal<(properties: PackedStringArray, value: GArray) => void>
        
        /** Emit it if you want to add this value as an animation key (check for keying being enabled first). */
        readonly property_keyed: Signal<(property: StringName) => void>
        
        /** Emitted when a property was deleted. Used internally. */
        readonly property_deleted: Signal<(property: StringName) => void>
        
        /** Emit it if you want to key a property with a single value. */
        readonly property_keyed_with_value: Signal<(property: StringName, value: any) => void>
        
        /** Emitted when a property was checked. Used internally. */
        readonly property_checked: Signal<(property: StringName, checked: boolean) => void>
        
        /** Emitted when a setting override for the current project is requested. */
        readonly property_overridden: Signal<() => void>
        
        /** Emit it if you want to mark a property as favorited, making it appear at the top of the inspector. */
        readonly property_favorited: Signal<(property: StringName, favorited: boolean) => void>
        
        /** Emit it if you want to mark (or unmark) the value of a property for being saved regardless of being equal to the default value.  
         *  The default value is the one the property will get when the node is just instantiated and can come from an ancestor scene in the inheritance/instantiation chain, a script or a builtin class.  
         */
        readonly property_pinned: Signal<(property: StringName, pinned: boolean) => void>
        
        /** Emitted when the revertability (i.e., whether it has a non-default value and thus is displayed with a revert icon) of a property has changed. */
        readonly property_can_revert_changed: Signal<(property: StringName, can_revert: boolean) => void>
        
        /** If you want a sub-resource to be edited, emit this signal with the resource. */
        readonly resource_selected: Signal<(path: string, resource: Resource) => void>
        
        /** Used by sub-inspectors. Emit it if what was selected was an Object ID. */
        readonly object_id_selected: Signal<(property: StringName, id: int64) => void>
        
        /** Emitted when selected. Used internally. */
        readonly selected: Signal<(path: string, focusable_idx: int64) => void>
        /** @deprecated Internal use. Does not exist at runtime. */
        __godotNameMap: __NameMapEditorProperty;
    }
    /** @deprecated Internal use. Does not exist at runtime. */
    interface __NameMapEditorResourceConversionPlugin extends __NameMapRefCounted {
    }
    /** Plugin for adding custom converters from one resource format to another in the editor resource picker context menu; for example, converting a [StandardMaterial3D] to a [ShaderMaterial].  
     *  	  
     *  @link https://docs.godotengine.org/en/4.5/classes/class_editorresourceconversionplugin.html  
     */
    class EditorResourceConversionPlugin extends RefCounted {
        constructor(identifier?: any)
        /** Returns the class name of the target type of [Resource] that this plugin converts source resources to. */
        /* gdvirtual */ _converts_to(): string
        
        /** Called to determine whether a particular [Resource] can be converted to the target resource type by this plugin. */
        /* gdvirtual */ _handles(resource: Resource): boolean
        
        /** Takes an input [Resource] and converts it to the type given in [method _converts_to]. The returned [Resource] is the result of the conversion, and the input [Resource] remains unchanged. */
        /* gdvirtual */ _convert(resource: Resource): null | Resource
        /** @deprecated Internal use. Does not exist at runtime. */
        __godotNameMap: __NameMapEditorResourceConversionPlugin;
    }
    /** @deprecated Internal use. Does not exist at runtime. */
    interface __NameMapEditorResourcePicker extends __NameMapHBoxContainer {
    }
    /** Godot editor's control for selecting [Resource] type properties.  
     *  	  
     *  @link https://docs.godotengine.org/en/4.5/classes/class_editorresourcepicker.html  
     */
    class EditorResourcePicker<Map extends NodePathMap = any> extends HBoxContainer<Map> {
        constructor(identifier?: any)
        /** This virtual method is called when updating the context menu of [EditorResourcePicker]. Implement this method to override the "New ..." items with your own options. [param menu_node] is a reference to the [PopupMenu] node.  
         *      
         *  **Note:** Implement [method _handle_menu_selected] to handle these custom items.  
         */
        /* gdvirtual */ _set_create_options(menu_node: Object): void
        
        /** This virtual method can be implemented to handle context menu items not handled by default. See [method _set_create_options]. */
        /* gdvirtual */ _handle_menu_selected(id: int64): boolean
        _update_resource_preview(_unnamed_arg0: string, _unnamed_arg1: Texture2D, _unnamed_arg2: Texture2D, _unnamed_arg3: int64): void
        
        /** Returns a list of all allowed types and subtypes corresponding to the [member base_type]. If the [member base_type] is empty, an empty list is returned. */
        get_allowed_types(): PackedStringArray
        
        /** Sets the toggle mode state for the main button. Works only if [member toggle_mode] is set to `true`. */
        set_toggle_pressed(pressed: boolean): void
        
        /** The base type of allowed resource types. Can be a comma-separated list of several options. */
        get base_type(): string
        set base_type(value: string)
        
        /** The edited resource value. */
        get edited_resource(): null | Resource
        set edited_resource(value: null | Resource)
        
        /** If `true`, the value can be selected and edited. */
        get editable(): boolean
        set editable(value: boolean)
        
        /** If `true`, the main button with the resource preview works in the toggle mode. Use [method set_toggle_pressed] to manually set the state. */
        get toggle_mode(): boolean
        set toggle_mode(value: boolean)
        
        /** Emitted when the resource value was set and user clicked to edit it. When [param inspect] is `true`, the signal was caused by the context menu "Edit" or "Inspect" option. */
        readonly resource_selected: Signal<(resource: Resource, inspect: boolean) => void>
        
        /** Emitted when the value of the edited resource was changed. */
        readonly resource_changed: Signal<(resource: Resource) => void>
        /** @deprecated Internal use. Does not exist at runtime. */
        __godotNameMap: __NameMapEditorResourcePicker;
    }
    /** @deprecated Internal use. Does not exist at runtime. */
    interface __NameMapEditorResourcePreview extends __NameMapNode {
    }
    /** A node used to generate previews of resources or files.  
     *  	  
     *  @link https://docs.godotengine.org/en/4.5/classes/class_editorresourcepreview.html  
     */
    class EditorResourcePreview<Map extends NodePathMap = any> extends Node<Map> {
        constructor(identifier?: any)
        /** Queue a resource file located at [param path] for preview. Once the preview is ready, the [param receiver]'s [param receiver_func] will be called. The [param receiver_func] must take the following four arguments: [String] path, [Texture2D] preview, [Texture2D] thumbnail_preview, [Variant] userdata. [param userdata] can be anything, and will be returned when [param receiver_func] is called.  
         *      
         *  **Note:** If it was not possible to create the preview the [param receiver_func] will still be called, but the preview will be `null`.  
         */
        queue_resource_preview(path: string, receiver: Object, receiver_func: StringName, userdata: any): void
        
        /** Queue the [param resource] being edited for preview. Once the preview is ready, the [param receiver]'s [param receiver_func] will be called. The [param receiver_func] must take the following four arguments: [String] path, [Texture2D] preview, [Texture2D] thumbnail_preview, [Variant] userdata. [param userdata] can be anything, and will be returned when [param receiver_func] is called.  
         *      
         *  **Note:** If it was not possible to create the preview the [param receiver_func] will still be called, but the preview will be `null`.  
         */
        queue_edited_resource_preview(resource: Resource, receiver: Object, receiver_func: StringName, userdata: any): void
        
        /** Create an own, custom preview generator. */
        add_preview_generator(generator: EditorResourcePreviewGenerator): void
        
        /** Removes a custom preview generator. */
        remove_preview_generator(generator: EditorResourcePreviewGenerator): void
        
        /** Check if the resource changed, if so, it will be invalidated and the corresponding signal emitted. */
        check_for_invalidation(path: string): void
        
        /** Emitted if a preview was invalidated (changed). [param path] corresponds to the path of the preview. */
        readonly preview_invalidated: Signal<(path: string) => void>
        /** @deprecated Internal use. Does not exist at runtime. */
        __godotNameMap: __NameMapEditorResourcePreview;
    }
    /** @deprecated Internal use. Does not exist at runtime. */
    interface __NameMapEditorResourcePreviewGenerator extends __NameMapRefCounted {
    }
    /** Custom generator of previews.  
     *  	  
     *  @link https://docs.godotengine.org/en/4.5/classes/class_editorresourcepreviewgenerator.html  
     */
    class EditorResourcePreviewGenerator extends RefCounted {
        constructor(identifier?: any)
        /** Returns `true` if your generator supports the resource of type [param type]. */
        /* gdvirtual */ _handles(type: string): boolean
        
        /** Generate a preview from a given resource with the specified size. This must always be implemented.  
         *  Returning `null` is an OK way to fail and let another generator take care.  
         *  Care must be taken because this function is always called from a thread (not the main thread).  
         *  [param metadata] dictionary can be modified to store file-specific metadata that can be used in [method EditorResourceTooltipPlugin._make_tooltip_for_path] (like image size, sample length etc.).  
         */
        /* gdvirtual */ _generate(resource: Resource, size: Vector2i, metadata: GDictionary): null | Texture2D
        
        /** Generate a preview directly from a path with the specified size. Implementing this is optional, as default code will load and call [method _generate].  
         *  Returning `null` is an OK way to fail and let another generator take care.  
         *  Care must be taken because this function is always called from a thread (not the main thread).  
         *  [param metadata] dictionary can be modified to store file-specific metadata that can be used in [method EditorResourceTooltipPlugin._make_tooltip_for_path] (like image size, sample length etc.).  
         */
        /* gdvirtual */ _generate_from_path(path: string, size: Vector2i, metadata: GDictionary): null | Texture2D
        
        /** If this function returns `true`, the generator will automatically generate the small previews from the normal preview texture generated by the methods [method _generate] or [method _generate_from_path].  
         *  By default, it returns `false`.  
         */
        /* gdvirtual */ _generate_small_preview_automatically(): boolean
        
        /** If this function returns `true`, the generator will call [method _generate] or [method _generate_from_path] for small previews as well.  
         *  By default, it returns `false`.  
         */
        /* gdvirtual */ _can_generate_small_preview(): boolean
        /** @deprecated Internal use. Does not exist at runtime. */
        __godotNameMap: __NameMapEditorResourcePreviewGenerator;
    }
    /** @deprecated Internal use. Does not exist at runtime. */
    interface __NameMapEditorResourceTooltipPlugin extends __NameMapRefCounted {
    }
    /** A plugin that advanced tooltip for its handled resource type.  
     *  	  
     *  @link https://docs.godotengine.org/en/4.5/classes/class_editorresourcetooltipplugin.html  
     */
    class EditorResourceTooltipPlugin extends RefCounted {
        constructor(identifier?: any)
        /** Return `true` if the plugin is going to handle the given [Resource] [param type]. */
        /* gdvirtual */ _handles(type: string): boolean
        
        /** Create and return a tooltip that will be displayed when the user hovers a resource under the given [param path] in filesystem dock.  
         *  The [param metadata] dictionary is provided by preview generator (see [method EditorResourcePreviewGenerator._generate]).  
         *  [param base] is the base default tooltip, which is a [VBoxContainer] with a file name, type and size labels. If another plugin handled the same file type, [param base] will be output from the previous plugin. For best result, make sure the base tooltip is part of the returned [Control].  
         *      
         *  **Note:** It's unadvised to use [method ResourceLoader.load], especially with heavy resources like models or textures, because it will make the editor unresponsive when creating the tooltip. You can use [method request_thumbnail] if you want to display a preview in your tooltip.  
         *      
         *  **Note:** If you decide to discard the [param base], make sure to call [method Node.queue_free], because it's not freed automatically.  
         *    
         */
        /* gdvirtual */ _make_tooltip_for_path(path: string, metadata: GDictionary, base: Control): null | Control
        _thumbnail_ready(_unnamed_arg0: string, _unnamed_arg1: Texture2D, _unnamed_arg2: Texture2D, _unnamed_arg3: any): void
        
        /** Requests a thumbnail for the given [TextureRect]. The thumbnail is created asynchronously by [EditorResourcePreview] and automatically set when available. */
        request_thumbnail(path: string, control: TextureRect): void
        /** @deprecated Internal use. Does not exist at runtime. */
        __godotNameMap: __NameMapEditorResourceTooltipPlugin;
    }
    /** @deprecated Internal use. Does not exist at runtime. */
    interface __NameMapEditorSceneFormatImporter extends __NameMapRefCounted {
    }
    /** Imports scenes from third-parties' 3D files.  
     *  	  
     *  @link https://docs.godotengine.org/en/4.5/classes/class_editorsceneformatimporter.html  
     */
    class EditorSceneFormatImporter extends RefCounted {
        static readonly IMPORT_SCENE = 1
        static readonly IMPORT_ANIMATION = 2
        static readonly IMPORT_FAIL_ON_MISSING_DEPENDENCIES = 4
        static readonly IMPORT_GENERATE_TANGENT_ARRAYS = 8
        static readonly IMPORT_USE_NAMED_SKIN_BINDS = 16
        static readonly IMPORT_DISCARD_MESHES_AND_MATERIALS = 32
        static readonly IMPORT_FORCE_DISABLE_MESH_COMPRESSION = 64
        constructor(identifier?: any)
        
        /** Return supported file extensions for this scene importer. */
        /* gdvirtual */ _get_extensions(): PackedStringArray
        
        /** Perform the bulk of the scene import logic here, for example using [GLTFDocument] or [FBXDocument]. */
        /* gdvirtual */ _import_scene(path: string, flags: int64, options: GDictionary): null | Object
        
        /** Override to add general import options. These will appear in the main import dock on the editor. Add options via [method add_import_option] and [method add_import_option_advanced].  
         *      
         *  **Note:** All [EditorSceneFormatImporter] and [EditorScenePostImportPlugin] instances will add options for all files. It is good practice to check the file extension when [param path] is non-empty.  
         *  When the user is editing project settings, [param path] will be empty. It is recommended to add all options when [param path] is empty to allow the user to customize Import Defaults.  
         */
        /* gdvirtual */ _get_import_options(path: string): void
        
        /** Should return `true` to show the given option, `false` to hide the given option, or `null` to ignore. */
        /* gdvirtual */ _get_option_visibility(path: string, for_animation: boolean, option: string): any
        
        /** Add a specific import option (name and default value only). This function can only be called from [method _get_import_options]. */
        add_import_option(name: string, value: any): void
        
        /** Add a specific import option. This function can only be called from [method _get_import_options]. */
        add_import_option_advanced(type: Variant.Type, name: string, default_value: any, hint?: PropertyHint /* = 0 */, hint_string?: string /* = '' */, usage_flags?: int64 /* = 6 */): void
        /** @deprecated Internal use. Does not exist at runtime. */
        __godotNameMap: __NameMapEditorSceneFormatImporter;
    }
    /** @deprecated Internal use. Does not exist at runtime. */
    interface __NameMapEditorSceneFormatImporterBlend extends __NameMapEditorSceneFormatImporter {
    }
    /** Importer for Blender's `.blend` scene file format.  
     *  	  
     *  @link https://docs.godotengine.org/en/4.5/classes/class_editorsceneformatimporterblend.html  
     */
    class EditorSceneFormatImporterBlend extends EditorSceneFormatImporter {
        constructor(identifier?: any)
        /** @deprecated Internal use. Does not exist at runtime. */
        __godotNameMap: __NameMapEditorSceneFormatImporterBlend;
    }
    /** @deprecated Internal use. Does not exist at runtime. */
    interface __NameMapEditorSceneFormatImporterFBX2GLTF extends __NameMapEditorSceneFormatImporter {
    }
    /** Importer for the `.fbx` scene file format.  
     *  	  
     *  @link https://docs.godotengine.org/en/4.5/classes/class_editorsceneformatimporterfbx2gltf.html  
     */
    class EditorSceneFormatImporterFBX2GLTF extends EditorSceneFormatImporter {
        constructor(identifier?: any)
        /** @deprecated Internal use. Does not exist at runtime. */
        __godotNameMap: __NameMapEditorSceneFormatImporterFBX2GLTF;
    }
    /** @deprecated Internal use. Does not exist at runtime. */
    interface __NameMapEditorSceneFormatImporterGLTF extends __NameMapEditorSceneFormatImporter {
    }
    /** @link https://docs.godotengine.org/en/4.5/classes/class_editorsceneformatimportergltf.html */
    class EditorSceneFormatImporterGLTF extends EditorSceneFormatImporter {
        constructor(identifier?: any)
        /** @deprecated Internal use. Does not exist at runtime. */
        __godotNameMap: __NameMapEditorSceneFormatImporterGLTF;
    }
    /** @deprecated Internal use. Does not exist at runtime. */
    interface __NameMapEditorSceneFormatImporterUFBX extends __NameMapEditorSceneFormatImporter {
    }
    /** Import FBX files using the ufbx library.  
     *  	  
     *  @link https://docs.godotengine.org/en/4.5/classes/class_editorsceneformatimporterufbx.html  
     */
    class EditorSceneFormatImporterUFBX extends EditorSceneFormatImporter {
        constructor(identifier?: any)
        /** @deprecated Internal use. Does not exist at runtime. */
        __godotNameMap: __NameMapEditorSceneFormatImporterUFBX;
    }
    /** @deprecated Internal use. Does not exist at runtime. */
    interface __NameMapEditorScenePostImport extends __NameMapRefCounted {
    }
    /** Post-processes scenes after import.  
     *  	  
     *  @link https://docs.godotengine.org/en/4.5/classes/class_editorscenepostimport.html  
     */
    class EditorScenePostImport extends RefCounted {
        constructor(identifier?: any)
        /** Called after the scene was imported. This method must return the modified version of the scene. */
        /* gdvirtual */ _post_import(scene: Node): null | Object
        
        /** Returns the source file path which got imported (e.g. `res://scene.dae`). */
        get_source_file(): string
        /** @deprecated Internal use. Does not exist at runtime. */
        __godotNameMap: __NameMapEditorScenePostImport;
    }
    namespace EditorScenePostImportPlugin {
        enum InternalImportCategory {
            INTERNAL_IMPORT_CATEGORY_NODE = 0,
            INTERNAL_IMPORT_CATEGORY_MESH_3D_NODE = 1,
            INTERNAL_IMPORT_CATEGORY_MESH = 2,
            INTERNAL_IMPORT_CATEGORY_MATERIAL = 3,
            INTERNAL_IMPORT_CATEGORY_ANIMATION = 4,
            INTERNAL_IMPORT_CATEGORY_ANIMATION_NODE = 5,
            INTERNAL_IMPORT_CATEGORY_SKELETON_3D_NODE = 6,
            INTERNAL_IMPORT_CATEGORY_MAX = 7,
        }
    }
    /** @deprecated Internal use. Does not exist at runtime. */
    interface __NameMapEditorScenePostImportPlugin extends __NameMapRefCounted {
    }
    /** Plugin to control and modifying the process of importing a scene.  
     *  	  
     *  @link https://docs.godotengine.org/en/4.5/classes/class_editorscenepostimportplugin.html  
     */
    class EditorScenePostImportPlugin extends RefCounted {
        constructor(identifier?: any)
        /** Override to add internal import options. These will appear in the 3D scene import dialog. Add options via [method add_import_option] and [method add_import_option_advanced]. */
        /* gdvirtual */ _get_internal_import_options(category: int64): void
        
        /** Should return `true` to show the given option, `false` to hide the given option, or `null` to ignore. */
        /* gdvirtual */ _get_internal_option_visibility(category: int64, for_animation: boolean, option: string): any
        
        /** Should return `true` if the 3D view of the import dialog needs to update when changing the given option. */
        /* gdvirtual */ _get_internal_option_update_view_required(category: int64, option: string): any
        
        /** Process a specific node or resource for a given category. */
        /* gdvirtual */ _internal_process(category: int64, base_node: Node, node: Node, resource: Resource): void
        
        /** Override to add general import options. These will appear in the main import dock on the editor. Add options via [method add_import_option] and [method add_import_option_advanced]. */
        /* gdvirtual */ _get_import_options(path: string): void
        
        /** Should return `true` to show the given option, `false` to hide the given option, or `null` to ignore. */
        /* gdvirtual */ _get_option_visibility(path: string, for_animation: boolean, option: string): any
        
        /** Pre-process the scene. This function is called right after the scene format loader loaded the scene and no changes have been made.  
         *  Pre-process may be used to adjust internal import options in the `"nodes"`, `"meshes"`, `"animations"` or `"materials"` keys inside `get_option_value("_subresources")`.  
         */
        /* gdvirtual */ _pre_process(scene: Node): void
        
        /** Post-process the scene. This function is called after the final scene has been configured. */
        /* gdvirtual */ _post_process(scene: Node): void
        
        /** Query the value of an option. This function can only be called from those querying visibility, or processing. */
        get_option_value(name: StringName): any
        
        /** Add a specific import option (name and default value only). This function can only be called from [method _get_import_options] and [method _get_internal_import_options]. */
        add_import_option(name: string, value: any): void
        
        /** Add a specific import option. This function can only be called from [method _get_import_options] and [method _get_internal_import_options]. */
        add_import_option_advanced(type: Variant.Type, name: string, default_value: any, hint?: PropertyHint /* = 0 */, hint_string?: string /* = '' */, usage_flags?: int64 /* = 6 */): void
        /** @deprecated Internal use. Does not exist at runtime. */
        __godotNameMap: __NameMapEditorScenePostImportPlugin;
    }
    /** @deprecated Internal use. Does not exist at runtime. */
    interface __NameMapEditorScript extends __NameMapRefCounted {
    }
    /** Base script that can be used to add extension functions to the editor.  
     *  	  
     *  @link https://docs.godotengine.org/en/4.5/classes/class_editorscript.html  
     */
    class EditorScript extends RefCounted {
        constructor(identifier?: any)
        /** This method is executed by the Editor when **File > Run** is used. */
        /* gdvirtual */ _run(): void
        
        /** Makes [param node] root of the currently opened scene. Only works if the scene is empty. If the [param node] is a scene instance, an inheriting scene will be created. */
        add_root_node(node: Node): void
        
        /** Returns the edited (current) scene's root [Node]. Equivalent of [method EditorInterface.get_edited_scene_root]. */
        get_scene(): null | Node
        
        /** Returns the [EditorInterface] singleton instance. */
        get_editor_interface(): null | EditorInterface
        /** @deprecated Internal use. Does not exist at runtime. */
        __godotNameMap: __NameMapEditorScript;
    }
    /** @deprecated Internal use. Does not exist at runtime. */
    interface __NameMapEditorScriptPicker extends __NameMapEditorResourcePicker {
    }
    /** Godot editor's control for selecting the `script` property of a [Node].  
     *  	  
     *  @link https://docs.godotengine.org/en/4.5/classes/class_editorscriptpicker.html  
     */
    class EditorScriptPicker<Map extends NodePathMap = any> extends EditorResourcePicker<Map> {
        constructor(identifier?: any)
        /** The owner [Node] of the script property that holds the edited resource. */
        get script_owner(): null | Node
        set script_owner(value: null | Node)
        /** @deprecated Internal use. Does not exist at runtime. */
        __godotNameMap: __NameMapEditorScriptPicker;
    }
    /** @deprecated Internal use. Does not exist at runtime. */
    interface __NameMapEditorSelection extends __NameMapObject {
    }
    /** Manages the SceneTree selection in the editor.  
     *  	  
     *  @link https://docs.godotengine.org/en/4.5/classes/class_editorselection.html  
     */
    class EditorSelection extends Object {
        constructor(identifier?: any)
        /** Clear the selection. */
        clear(): void
        
        /** Adds a node to the selection.  
         *      
         *  **Note:** The newly selected node will not be automatically edited in the inspector. If you want to edit a node, use [method EditorInterface.edit_node].  
         */
        add_node(node: Node): void
        
        /** Removes a node from the selection. */
        remove_node(node: Node): void
        
        /** Returns the list of selected nodes. */
        get_selected_nodes(): GArray<Node>
        
        /** Returns the list of top selected nodes only, excluding any children. This is useful for performing transform operations (moving them, rotating, etc.).  
         *  For example, if there is a node A with a child B and a sibling C, then selecting all three will cause this method to return only A and C. Changing the global transform of A will affect the global transform of B, so there is no need to change B separately.  
         */
        get_top_selected_nodes(): GArray<Node>
        
        /** Returns the list of top selected nodes only, excluding any children. This is useful for performing transform operations (moving them, rotating, etc.). See [method get_top_selected_nodes]. */
        get_transformable_selected_nodes(): GArray<Node>
        
        /** Emitted when the selection changes. */
        readonly selection_changed: Signal<() => void>
        /** @deprecated Internal use. Does not exist at runtime. */
        __godotNameMap: __NameMapEditorSelection;
    }
    /** @deprecated Internal use. Does not exist at runtime. */
    interface __NameMapEditorSettings extends __NameMapResource {
    }
    /** Object that holds the project-independent editor settings.  
     *  	  
     *  @link https://docs.godotengine.org/en/4.5/classes/class_editorsettings.html  
     */
    class EditorSettings extends Resource {
        /** Emitted after any editor setting has changed. It's used by various editor plugins to update their visuals on theme changes or logic on configuration changes. */
        static readonly NOTIFICATION_EDITOR_SETTINGS_CHANGED = 10000
        constructor(identifier?: any)
        
        /** Returns `true` if the setting specified by [param name] exists, `false` otherwise. */
        has_setting(name: string): boolean
        
        /** Sets the [param value] of the setting specified by [param name]. This is equivalent to using [method Object.set] on the EditorSettings instance. */
        set_setting(name: string, value: any): void
        
        /** Returns the value of the setting specified by [param name]. This is equivalent to using [method Object.get] on the EditorSettings instance. */
        get_setting(name: string): any
        
        /** Erases the setting whose name is specified by [param property]. */
        erase(property: string): void
        
        /** Sets the initial value of the setting specified by [param name] to [param value]. This is used to provide a value for the Revert button in the Editor Settings. If [param update_current] is `true`, the setting is reset to [param value] as well. */
        set_initial_value(name: StringName, value: any, update_current: boolean): void
        
        /** Adds a custom property info to a property. The dictionary must contain:  
         *  - `name`: [String] (the name of the property)  
         *  - `type`: [int] (see [enum Variant.Type])  
         *  - optionally `hint`: [int] (see [enum PropertyHint]) and `hint_string`: [String]  
         *    
         */
        add_property_info(info: GDictionary): void
        
        /** Sets project-specific metadata with the [param section], [param key] and [param data] specified. This metadata is stored outside the project folder and therefore won't be checked into version control. See also [method get_project_metadata]. */
        set_project_metadata(section: string, key: string, data: any): void
        
        /** Returns project-specific metadata for the [param section] and [param key] specified. If the metadata doesn't exist, [param default] will be returned instead. See also [method set_project_metadata]. */
        get_project_metadata(section: string, key: string, default_?: any /* = <any> {} */): any
        
        /** Sets the list of favorite files and directories for this project. */
        set_favorites(dirs: PackedStringArray | string[]): void
        
        /** Returns the list of favorite files and directories for this project. */
        get_favorites(): PackedStringArray
        
        /** Sets the list of recently visited folders in the file dialog for this project. */
        set_recent_dirs(dirs: PackedStringArray | string[]): void
        
        /** Returns the list of recently visited folders in the file dialog for this project. */
        get_recent_dirs(): PackedStringArray
        
        /** Overrides the built-in editor action [param name] with the input actions defined in [param actions_list]. */
        set_builtin_action_override(name: string, actions_list: GArray<InputEvent>): void
        
        /** Checks if any settings with the prefix [param setting_prefix] exist in the set of changed settings. See also [method get_changed_settings]. */
        check_changed_settings_in_group(setting_prefix: string): boolean
        
        /** Gets an array of the settings which have been changed since the last save. Note that internally `changed_settings` is cleared after a successful save, so generally the most appropriate place to use this method is when processing [constant NOTIFICATION_EDITOR_SETTINGS_CHANGED]. */
        get_changed_settings(): PackedStringArray
        
        /** Marks the passed editor setting as being changed, see [method get_changed_settings]. Only settings which exist (see [method has_setting]) will be accepted. */
        mark_setting_changed(setting: string): void
        
        /** Emitted after any editor setting has changed. */
        readonly settings_changed: Signal<() => void>
        /** @deprecated Internal use. Does not exist at runtime. */
        __godotNameMap: __NameMapEditorSettings;
    }
    /** @deprecated Internal use. Does not exist at runtime. */
    interface __NameMapEditorSpinSlider extends __NameMapRange {
    }
    /** Godot editor's control for editing numeric values.  
     *  	  
     *  @link https://docs.godotengine.org/en/4.5/classes/class_editorspinslider.html  
     */
    class EditorSpinSlider<Map extends NodePathMap = any> extends Range<Map> {
        constructor(identifier?: any)
        /** The text that displays to the left of the value. */
        get label(): string
        set label(value: string)
        
        /** The suffix to display after the value (in a faded color). This should generally be a plural word. You may have to use an abbreviation if the suffix is too long to be displayed. */
        get suffix(): string
        set suffix(value: string)
        
        /** If `true`, the slider can't be interacted with. */
        get read_only(): boolean
        set read_only(value: boolean)
        
        /** If `true`, the slider will not draw background. */
        get flat(): boolean
        set flat(value: boolean)
        
        /** If `true`, the slider and up/down arrows are hidden. */
        get hide_slider(): boolean
        set hide_slider(value: boolean)
        
        /** If `true`, the [EditorSpinSlider] is considered to be editing an integer value. If `false`, the [EditorSpinSlider] is considered to be editing a floating-point value. This is used to determine whether a slider should be drawn. The slider is only drawn for floats; integers use up-down arrows similar to [SpinBox] instead. */
        get editing_integer(): boolean
        set editing_integer(value: boolean)
        
        /** Emitted when the spinner/slider is grabbed. */
        readonly grabbed: Signal<() => void>
        
        /** Emitted when the spinner/slider is ungrabbed. */
        readonly ungrabbed: Signal<() => void>
        
        /** Emitted when the updown button is pressed. */
        readonly updown_pressed: Signal<() => void>
        
        /** Emitted when the value form gains focus. */
        readonly value_focus_entered: Signal<() => void>
        
        /** Emitted when the value form loses focus. */
        readonly value_focus_exited: Signal<() => void>
        /** @deprecated Internal use. Does not exist at runtime. */
        __godotNameMap: __NameMapEditorSpinSlider;
    }
    /** @deprecated Internal use. Does not exist at runtime. */
    interface __NameMapEditorSyntaxHighlighter extends __NameMapSyntaxHighlighter {
    }
    /** Base class for [SyntaxHighlighter] used by the [ScriptEditor].  
     *  	  
     *  @link https://docs.godotengine.org/en/4.5/classes/class_editorsyntaxhighlighter.html  
     */
    class EditorSyntaxHighlighter extends SyntaxHighlighter {
        constructor(identifier?: any)
        /** Virtual method which can be overridden to return the syntax highlighter name. */
        /* gdvirtual */ _get_name(): string
        
        /** Virtual method which can be overridden to return the supported language names. */
        /* gdvirtual */ _get_supported_languages(): PackedStringArray
        
        /** Virtual method which creates a new instance of the syntax highlighter. */
        /* gdvirtual */ _create(): null | EditorSyntaxHighlighter
        _get_edited_resource(): null | RefCounted
        /** @deprecated Internal use. Does not exist at runtime. */
        __godotNameMap: __NameMapEditorSyntaxHighlighter;
    }
    namespace EditorToaster {
        enum Severity {
            /** Toast will display with an INFO severity. */
            SEVERITY_INFO = 0,
            
            /** Toast will display with a WARNING severity and have a corresponding color. */
            SEVERITY_WARNING = 1,
            
            /** Toast will display with an ERROR severity and have a corresponding color. */
            SEVERITY_ERROR = 2,
        }
    }
    /** @deprecated Internal use. Does not exist at runtime. */
    interface __NameMapEditorToaster extends __NameMapHBoxContainer {
    }
    /** Manages toast notifications within the editor.  
     *  	  
     *  @link https://docs.godotengine.org/en/4.5/classes/class_editortoaster.html  
     */
    class EditorToaster<Map extends NodePathMap = any> extends HBoxContainer<Map> {
        constructor(identifier?: any)
        /** Pushes a toast notification to the editor for display. */
        push_toast(message: string, severity?: EditorToaster.Severity /* = 0 */, tooltip?: string /* = '' */): void
        /** @deprecated Internal use. Does not exist at runtime. */
        __godotNameMap: __NameMapEditorToaster;
    }
    /** @deprecated Internal use. Does not exist at runtime. */
    interface __NameMapEditorTranslationParserPlugin extends __NameMapRefCounted {
    }
    /** Plugin for adding custom parsers to extract strings that are to be translated from custom files (.csv, .json etc.).  
     *  	  
     *  @link https://docs.godotengine.org/en/4.5/classes/class_editortranslationparserplugin.html  
     */
    class EditorTranslationParserPlugin extends RefCounted {
        constructor(identifier?: any)
        /** Override this method to define a custom parsing logic to extract the translatable strings. */
        /* gdvirtual */ _parse_file(path: string): GArray<PackedStringArray>
        
        /** Gets the list of file extensions to associate with this parser, e.g. `["csv"]`. */
        /* gdvirtual */ _get_recognized_extensions(): PackedStringArray
        /** @deprecated Internal use. Does not exist at runtime. */
        __godotNameMap: __NameMapEditorTranslationParserPlugin;
    }
    namespace EditorUndoRedoManager {
        enum SpecialHistory {
            /** Global history not associated with any scene, but with external resources etc. */
            GLOBAL_HISTORY = 0,
            
            /** History associated with remote inspector. Used when live editing a running project. */
            REMOTE_HISTORY = -9,
            
            /** Invalid "null" history. It's a special value, not associated with any object. */
            INVALID_HISTORY = -99,
        }
    }
    /** @deprecated Internal use. Does not exist at runtime. */
    interface __NameMapEditorUndoRedoManager extends __NameMapObject {
    }
    /** Manages undo history of scenes opened in the editor.  
     *  	  
     *  @link https://docs.godotengine.org/en/4.5/classes/class_editorundoredomanager.html  
     */
    class EditorUndoRedoManager extends Object {
        constructor(identifier?: any)
        /** Create a new action. After this is called, do all your calls to [method add_do_method], [method add_undo_method], [method add_do_property], and [method add_undo_property], then commit the action with [method commit_action].  
         *  The way actions are merged is dictated by the [param merge_mode] argument.  
         *  If [param custom_context] object is provided, it will be used for deducing target history (instead of using the first operation).  
         *  The way undo operation are ordered in actions is dictated by [param backward_undo_ops]. When [param backward_undo_ops] is `false` undo option are ordered in the same order they were added. Which means the first operation to be added will be the first to be undone.  
         *  If [param mark_unsaved] is `false`, the action will not mark the history as unsaved. This is useful for example for actions that change a selection, or a setting that will be saved automatically. Otherwise, this should be left to `true` if the action requires saving by the user or if it can cause data loss when left unsaved.  
         */
        create_action(name: string, merge_mode?: UndoRedo.MergeMode /* = 0 */, custom_context?: Object /* = undefined */, backward_undo_ops?: boolean /* = false */, mark_unsaved?: boolean /* = true */): void
        
        /** Commits the action. If [param execute] is `true` (default), all "do" methods/properties are called/set when this function is called. */
        commit_action(execute?: boolean /* = true */): void
        
        /** Returns `true` if the [EditorUndoRedoManager] is currently committing the action, i.e. running its "do" method or property change (see [method commit_action]). */
        is_committing_action(): boolean
        
        /** Forces the next operation (e.g. [method add_do_method]) to use the action's history rather than guessing it from the object. This is sometimes needed when a history can't be correctly determined, like for a nested resource that doesn't have a path yet.  
         *  This method should only be used when absolutely necessary, otherwise it might cause invalid history state. For most of complex cases, the `custom_context` parameter of [method create_action] is sufficient.  
         */
        force_fixed_history(): void
        
        /** Register a method that will be called when the action is committed (i.e. the "do" action).  
         *  If this is the first operation, the [param object] will be used to deduce target undo history.  
         */
        add_do_method<T extends GObject, M extends GodotNames<T>>(object: T, method: M, ...args: ResolveGodotNameParameters<T, M>): void
        
        /** Register a method that will be called when the action is undone (i.e. the "undo" action).  
         *  If this is the first operation, the [param object] will be used to deduce target undo history.  
         */
        add_undo_method<T extends GObject, M extends GodotNames<T>>(object: T, method: M, ...args: ResolveGodotNameParameters<T, M>): void
        
        /** Register a property value change for "do".  
         *  If this is the first operation, the [param object] will be used to deduce target undo history.  
         */
        add_do_property<T extends GObject, P extends GodotNames<T>>(object: T, property: P, value: ResolveGodotNameValue<T, P>): void
        
        /** Register a property value change for "undo".  
         *  If this is the first operation, the [param object] will be used to deduce target undo history.  
         */
        add_undo_property<T extends GObject, P extends GodotNames<T>>(object: T, property: P, value: ResolveGodotNameValue<T, P>): void
        
        /** Register a reference for "do" that will be erased if the "do" history is lost. This is useful mostly for new nodes created for the "do" call. Do not use for resources. */
        add_do_reference(object: Object): void
        
        /** Register a reference for "undo" that will be erased if the "undo" history is lost. This is useful mostly for nodes removed with the "do" call (not the "undo" call!). */
        add_undo_reference(object: Object): void
        
        /** Returns the history ID deduced from the given [param object]. It can be used with [method get_history_undo_redo]. */
        get_object_history_id(object: Object): int64
        
        /** Returns the [UndoRedo] object associated with the given history [param id].  
         *  [param id] above `0` are mapped to the opened scene tabs (but it doesn't match their order). [param id] of `0` or lower have special meaning (see [enum SpecialHistory]).  
         *  Best used with [method get_object_history_id]. This method is only provided in case you need some more advanced methods of [UndoRedo] (but keep in mind that directly operating on the [UndoRedo] object might affect editor's stability).  
         */
        get_history_undo_redo(id: int64): null | UndoRedo
        
        /** Clears the given undo history. You can clear history for a specific scene, global history, or for all scenes at once if [param id] is [constant INVALID_HISTORY].  
         *  If [param increase_version] is `true`, the undo history version will be increased, marking it as unsaved. Useful for operations that modify the scene, but don't support undo.  
         *    
         *      
         *  **Note:** If you want to mark an edited scene as unsaved without clearing its history, use [method EditorInterface.mark_scene_as_unsaved] instead.  
         */
        clear_history(id?: int64 /* = -99 */, increase_version?: boolean /* = true */): void
        
        /** Emitted when the list of actions in any history has changed, either when an action is committed or a history is cleared. */
        readonly history_changed: Signal<() => void>
        
        /** Emitted when the version of any history has changed as a result of undo or redo call. */
        readonly version_changed: Signal<() => void>
        /** @deprecated Internal use. Does not exist at runtime. */
        __godotNameMap: __NameMapEditorUndoRedoManager;
    }
    namespace EditorVCSInterface {
        enum ChangeType {
            /** A new file has been added. */
            CHANGE_TYPE_NEW = 0,
            
            /** An earlier added file has been modified. */
            CHANGE_TYPE_MODIFIED = 1,
            
            /** An earlier added file has been renamed. */
            CHANGE_TYPE_RENAMED = 2,
            
            /** An earlier added file has been deleted. */
            CHANGE_TYPE_DELETED = 3,
            
            /** An earlier added file has been typechanged. */
            CHANGE_TYPE_TYPECHANGE = 4,
            
            /** A file is left unmerged. */
            CHANGE_TYPE_UNMERGED = 5,
        }
        enum TreeArea {
            /** A commit is encountered from the commit area. */
            TREE_AREA_COMMIT = 0,
            
            /** A file is encountered from the staged area. */
            TREE_AREA_STAGED = 1,
            
            /** A file is encountered from the unstaged area. */
            TREE_AREA_UNSTAGED = 2,
        }
    }
    /** @deprecated Internal use. Does not exist at runtime. */
    interface __NameMapEditorVCSInterface extends __NameMapObject {
    }
    /** Version Control System (VCS) interface, which reads and writes to the local VCS in use.  
     *  	  
     *  @link https://docs.godotengine.org/en/4.5/classes/class_editorvcsinterface.html  
     */
    class EditorVCSInterface extends Object {
        constructor(identifier?: any)
        /** Initializes the VCS plugin when called from the editor. Returns whether or not the plugin was successfully initialized. A VCS project is initialized at [param project_path]. */
        /* gdvirtual */ _initialize(project_path: string): boolean
        
        /** Set user credentials in the underlying VCS. [param username] and [param password] are used only during HTTPS authentication unless not already mentioned in the remote URL. [param ssh_public_key_path], [param ssh_private_key_path], and [param ssh_passphrase] are only used during SSH authentication. */
        /* gdvirtual */ _set_credentials(username: string, password: string, ssh_public_key_path: string, ssh_private_key_path: string, ssh_passphrase: string): void
        
        /** Returns an [Array] of [Dictionary] items (see [method create_status_file]), each containing the status data of every modified file in the project folder. */
        /* gdvirtual */ _get_modified_files_data(): GArray<GDictionary>
        
        /** Stages the file present at [param file_path] to the staged area. */
        /* gdvirtual */ _stage_file(file_path: string): void
        
        /** Unstages the file present at [param file_path] from the staged area to the unstaged area. */
        /* gdvirtual */ _unstage_file(file_path: string): void
        
        /** Discards the changes made in a file present at [param file_path]. */
        /* gdvirtual */ _discard_file(file_path: string): void
        
        /** Commits the currently staged changes and applies the commit [param msg] to the resulting commit. */
        /* gdvirtual */ _commit(msg: string): void
        
        /** Returns an array of [Dictionary] items (see [method create_diff_file], [method create_diff_hunk], [method create_diff_line], [method add_line_diffs_into_diff_hunk] and [method add_diff_hunks_into_diff_file]), each containing information about a diff. If [param identifier] is a file path, returns a file diff, and if it is a commit identifier, then returns a commit diff. */
        /* gdvirtual */ _get_diff(identifier: string, area: int64): GArray<GDictionary>
        
        /** Shuts down VCS plugin instance. Called when the user either closes the editor or shuts down the VCS plugin through the editor UI. */
        /* gdvirtual */ _shut_down(): boolean
        
        /** Returns the name of the underlying VCS provider. */
        /* gdvirtual */ _get_vcs_name(): string
        
        /** Returns an [Array] of [Dictionary] items (see [method create_commit]), each containing the data for a past commit. */
        /* gdvirtual */ _get_previous_commits(max_commits: int64): GArray<GDictionary>
        
        /** Gets an instance of an [Array] of [String]s containing available branch names in the VCS. */
        /* gdvirtual */ _get_branch_list(): GArray<string>
        
        /** Returns an [Array] of [String]s, each containing the name of a remote configured in the VCS. */
        /* gdvirtual */ _get_remotes(): GArray<string>
        
        /** Creates a new branch named [param branch_name] in the VCS. */
        /* gdvirtual */ _create_branch(branch_name: string): void
        
        /** Remove a branch from the local VCS. */
        /* gdvirtual */ _remove_branch(branch_name: string): void
        
        /** Creates a new remote destination with name [param remote_name] and points it to [param remote_url]. This can be an HTTPS remote or an SSH remote. */
        /* gdvirtual */ _create_remote(remote_name: string, remote_url: string): void
        
        /** Remove a remote from the local VCS. */
        /* gdvirtual */ _remove_remote(remote_name: string): void
        
        /** Gets the current branch name defined in the VCS. */
        /* gdvirtual */ _get_current_branch_name(): string
        
        /** Checks out a [param branch_name] in the VCS. */
        /* gdvirtual */ _checkout_branch(branch_name: string): boolean
        
        /** Pulls changes from the remote. This can give rise to merge conflicts. */
        /* gdvirtual */ _pull(remote: string): void
        
        /** Pushes changes to the [param remote]. If [param force] is `true`, a force push will override the change history already present on the remote. */
        /* gdvirtual */ _push(remote: string, force: boolean): void
        
        /** Fetches new changes from the [param remote], but doesn't write changes to the current working directory. Equivalent to `git fetch`. */
        /* gdvirtual */ _fetch(remote: string): void
        
        /** Returns an [Array] of [Dictionary] items (see [method create_diff_hunk]), each containing a line diff between a file at [param file_path] and the [param text] which is passed in. */
        /* gdvirtual */ _get_line_diff(file_path: string, text: string): GArray<GDictionary>
        
        /** Helper function to create a [Dictionary] for storing a line diff. [param new_line_no] is the line number in the new file (can be `-1` if the line is deleted). [param old_line_no] is the line number in the old file (can be `-1` if the line is added). [param content] is the diff text. [param status] is a single character string which stores the line origin. */
        create_diff_line(new_line_no: int64, old_line_no: int64, content: string, status: string): GDictionary
        
        /** Helper function to create a [Dictionary] for storing diff hunk data. [param old_start] is the starting line number in old file. [param new_start] is the starting line number in new file. [param old_lines] is the number of lines in the old file. [param new_lines] is the number of lines in the new file. */
        create_diff_hunk(old_start: int64, new_start: int64, old_lines: int64, new_lines: int64): GDictionary
        
        /** Helper function to create a [Dictionary] for storing old and new diff file paths. */
        create_diff_file(new_file: string, old_file: string): GDictionary
        
        /** Helper function to create a commit [Dictionary] item. [param msg] is the commit message of the commit. [param author] is a single human-readable string containing all the author's details, e.g. the email and name configured in the VCS. [param id] is the identifier of the commit, in whichever format your VCS may provide an identifier to commits. [param unix_timestamp] is the UTC Unix timestamp of when the commit was created. [param offset_minutes] is the timezone offset in minutes, recorded from the system timezone where the commit was created. */
        create_commit(msg: string, author: string, id: string, unix_timestamp: int64, offset_minutes: int64): GDictionary
        
        /** Helper function to create a [Dictionary] used by editor to read the status of a file. */
        create_status_file(file_path: string, change_type: EditorVCSInterface.ChangeType, area: EditorVCSInterface.TreeArea): GDictionary
        
        /** Helper function to add an array of [param diff_hunks] into a [param diff_file]. */
        add_diff_hunks_into_diff_file(diff_file: GDictionary, diff_hunks: GArray<GDictionary>): GDictionary
        
        /** Helper function to add an array of [param line_diffs] into a [param diff_hunk]. */
        add_line_diffs_into_diff_hunk(diff_hunk: GDictionary, line_diffs: GArray<GDictionary>): GDictionary
        
        /** Pops up an error message in the editor which is shown as coming from the underlying VCS. Use this to show VCS specific error messages. */
        popup_error(msg: string): void
        /** @deprecated Internal use. Does not exist at runtime. */
        __godotNameMap: __NameMapEditorVCSInterface;
    }
    /** @deprecated Internal use. Does not exist at runtime. */
    interface __NameMapEncodedObjectAsID extends __NameMapRefCounted {
    }
    /** Holds a reference to an [Object]'s instance ID.  
     *  	  
     *  @link https://docs.godotengine.org/en/4.5/classes/class_encodedobjectasid.html  
     */
    class EncodedObjectAsID extends RefCounted {
        constructor(identifier?: any)
        /** The [Object] identifier stored in this [EncodedObjectAsID] instance. The object instance can be retrieved with [method @GlobalScope.instance_from_id]. */
        get object_id(): int64
        set object_id(value: int64)
        /** @deprecated Internal use. Does not exist at runtime. */
        __godotNameMap: __NameMapEncodedObjectAsID;
    }
    /** @deprecated Internal use. Does not exist at runtime. */
    interface __NameMapEngineProfiler extends __NameMapRefCounted {
    }
    /** Base class for creating custom profilers.  
     *  	  
     *  @link https://docs.godotengine.org/en/4.5/classes/class_engineprofiler.html  
     */
    class EngineProfiler extends RefCounted {
        constructor(identifier?: any)
        /** Called when the profiler is enabled/disabled, along with a set of [param options]. */
        /* gdvirtual */ _toggle(enable: boolean, options: GArray): void
        
        /** Called when data is added to profiler using [method EngineDebugger.profiler_add_frame_data]. */
        /* gdvirtual */ _add_frame(data: GArray): void
        
        /** Called once every engine iteration when the profiler is active with information about the current frame. All time values are in seconds. Lower values represent faster processing times and are therefore considered better. */
        /* gdvirtual */ _tick(frame_time: float64, process_time: float64, physics_time: float64, physics_frame_time: float64): void
        /** @deprecated Internal use. Does not exist at runtime. */
        __godotNameMap: __NameMapEngineProfiler;
    }
    namespace Environment {
        enum BGMode {
            /** Clears the background using the clear color defined in [member ProjectSettings.rendering/environment/defaults/default_clear_color]. */
            BG_CLEAR_COLOR = 0,
            
            /** Clears the background using a custom clear color. */
            BG_COLOR = 1,
            
            /** Displays a user-defined sky in the background. */
            BG_SKY = 2,
            
            /** Displays a [CanvasLayer] in the background. */
            BG_CANVAS = 3,
            
            /** Keeps on screen every pixel drawn in the background. This is the fastest background mode, but it can only be safely used in fully-interior scenes (no visible sky or sky reflections). If enabled in a scene where the background is visible, "ghost trail" artifacts will be visible when moving the camera. */
            BG_KEEP = 4,
            
            /** Displays a camera feed in the background. */
            BG_CAMERA_FEED = 5,
            
            /** Represents the size of the [enum BGMode] enum. */
            BG_MAX = 6,
        }
        enum AmbientSource {
            /** Gather ambient light from whichever source is specified as the background. */
            AMBIENT_SOURCE_BG = 0,
            
            /** Disable ambient light. This provides a slight performance boost over [constant AMBIENT_SOURCE_SKY]. */
            AMBIENT_SOURCE_DISABLED = 1,
            
            /** Specify a specific [Color] for ambient light. This provides a slight performance boost over [constant AMBIENT_SOURCE_SKY]. */
            AMBIENT_SOURCE_COLOR = 2,
            
            /** Gather ambient light from the [Sky] regardless of what the background is. */
            AMBIENT_SOURCE_SKY = 3,
        }
        enum ReflectionSource {
            /** Use the background for reflections. */
            REFLECTION_SOURCE_BG = 0,
            
            /** Disable reflections. This provides a slight performance boost over other options. */
            REFLECTION_SOURCE_DISABLED = 1,
            
            /** Use the [Sky] for reflections regardless of what the background is. */
            REFLECTION_SOURCE_SKY = 2,
        }
        enum ToneMapper {
            /** Does not modify color data, resulting in a linear tonemapping curve which unnaturally clips bright values, causing bright lighting to look blown out. The simplest and fastest tonemapper. */
            TONE_MAPPER_LINEAR = 0,
            
            /** A simple tonemapping curve that rolls off bright values to prevent clipping. This results in an image that can appear dull and low contrast. Slower than [constant TONE_MAPPER_LINEAR].  
             *      
             *  **Note:** When [member tonemap_white] is left at the default value of `1.0`, [constant TONE_MAPPER_REINHARDT] produces an identical image to [constant TONE_MAPPER_LINEAR].  
             */
            TONE_MAPPER_REINHARDT = 1,
            
            /** Uses a film-like tonemapping curve to prevent clipping of bright values and provide better contrast than [constant TONE_MAPPER_REINHARDT]. Slightly slower than [constant TONE_MAPPER_REINHARDT]. */
            TONE_MAPPER_FILMIC = 2,
            
            /** Uses a high-contrast film-like tonemapping curve and desaturates bright values for a more realistic appearance. Slightly slower than [constant TONE_MAPPER_FILMIC].  
             *      
             *  **Note:** This tonemapping operator is called "ACES Fitted" in Godot 3.x.  
             */
            TONE_MAPPER_ACES = 3,
            
            /** Uses a film-like tonemapping curve and desaturates bright values for a more realistic appearance. Better than other tonemappers at maintaining the hue of colors as they become brighter. The slowest tonemapping option.  
             *      
             *  **Note:** [member tonemap_white] is fixed at a value of `16.29`, which makes [constant TONE_MAPPER_AGX] unsuitable for use with the Mobile rendering method.  
             */
            TONE_MAPPER_AGX = 4,
        }
        enum GlowBlendMode {
            /** Additive glow blending mode. Mostly used for particles, glows (bloom), lens flare, bright sources. */
            GLOW_BLEND_MODE_ADDITIVE = 0,
            
            /** Screen glow blending mode. Increases brightness, used frequently with bloom. */
            GLOW_BLEND_MODE_SCREEN = 1,
            
            /** Soft light glow blending mode. Modifies contrast, exposes shadows and highlights (vivid bloom). */
            GLOW_BLEND_MODE_SOFTLIGHT = 2,
            
            /** Replace glow blending mode. Replaces all pixels' color by the glow value. This can be used to simulate a full-screen blur effect by tweaking the glow parameters to match the original image's brightness. */
            GLOW_BLEND_MODE_REPLACE = 3,
            
            /** Mixes the glow with the underlying color to avoid increasing brightness as much while still maintaining a glow effect. */
            GLOW_BLEND_MODE_MIX = 4,
        }
        enum FogMode {
            /** Use a physically-based fog model defined primarily by fog density. */
            FOG_MODE_EXPONENTIAL = 0,
            
            /** Use a simple fog model defined by start and end positions and a custom curve. While not physically accurate, this model can be useful when you need more artistic control. */
            FOG_MODE_DEPTH = 1,
        }
        enum SDFGIYScale {
            /** Use 50% scale for SDFGI on the Y (vertical) axis. SDFGI cells will be twice as short as they are wide. This allows providing increased GI detail and reduced light leaking with thin floors and ceilings. This is usually the best choice for scenes that don't feature much verticality. */
            SDFGI_Y_SCALE_50_PERCENT = 0,
            
            /** Use 75% scale for SDFGI on the Y (vertical) axis. This is a balance between the 50% and 100% SDFGI Y scales. */
            SDFGI_Y_SCALE_75_PERCENT = 1,
            
            /** Use 100% scale for SDFGI on the Y (vertical) axis. SDFGI cells will be as tall as they are wide. This is usually the best choice for highly vertical scenes. The downside is that light leaking may become more noticeable with thin floors and ceilings. */
            SDFGI_Y_SCALE_100_PERCENT = 2,
        }
    }
    /** @deprecated Internal use. Does not exist at runtime. */
    interface __NameMapEnvironment extends __NameMapResource {
    }
    /** Resource for environment nodes (like [WorldEnvironment]) that define multiple rendering options.  
     *  	  
     *  @link https://docs.godotengine.org/en/4.5/classes/class_environment.html  
     */
    class Environment extends Resource {
        constructor(identifier?: any)
        /** Sets the intensity of the glow level [param idx]. A value above `0.0` enables the level. Each level relies on the previous level. This means that enabling higher glow levels will slow down the glow effect rendering, even if previous levels aren't enabled. */
        set_glow_level(idx: int64, intensity: float64): void
        
        /** Returns the intensity of the glow level [param idx]. */
        get_glow_level(idx: int64): float64
        
        /** The background mode. */
        get background_mode(): int64
        set background_mode(value: int64)
        
        /** The [Color] displayed for clear areas of the scene. Only effective when using the [constant BG_COLOR] background mode. */
        get background_color(): Color
        set background_color(value: Color)
        
        /** Multiplier for background energy. Increase to make background brighter, decrease to make background dimmer. */
        get background_energy_multiplier(): float64
        set background_energy_multiplier(value: float64)
        
        /** Luminance of background measured in nits (candela per square meter). Only used when [member ProjectSettings.rendering/lights_and_shadows/use_physical_light_units] is enabled. The default value is roughly equivalent to the sky at midday. */
        get background_intensity(): float64
        set background_intensity(value: float64)
        
        /** The maximum layer ID to display. Only effective when using the [constant BG_CANVAS] background mode. */
        get background_canvas_max_layer(): int64
        set background_canvas_max_layer(value: int64)
        
        /** The ID of the camera feed to show in the background. */
        get background_camera_feed_id(): int64
        set background_camera_feed_id(value: int64)
        
        /** The [Sky] resource used for this [Environment]. */
        get sky(): null | Sky
        set sky(value: null | Sky)
        
        /** If set to a value greater than `0.0`, overrides the field of view to use for sky rendering. If set to `0.0`, the same FOV as the current [Camera3D] is used for sky rendering. */
        get sky_custom_fov(): float64
        set sky_custom_fov(value: float64)
        
        /** The rotation to use for sky rendering. */
        get sky_rotation(): Vector3
        set sky_rotation(value: Vector3)
        
        /** The ambient light source to use for rendering materials and global illumination. */
        get ambient_light_source(): int64
        set ambient_light_source(value: int64)
        
        /** The ambient light's [Color]. Only effective if [member ambient_light_sky_contribution] is lower than `1.0` (exclusive). */
        get ambient_light_color(): Color
        set ambient_light_color(value: Color)
        
        /** Defines the amount of light that the sky brings on the scene. A value of `0.0` means that the sky's light emission has no effect on the scene illumination, thus all ambient illumination is provided by the ambient light. On the contrary, a value of `1.0` means that  *all*  the light that affects the scene is provided by the sky, thus the ambient light parameter has no effect on the scene.  
         *      
         *  **Note:** [member ambient_light_sky_contribution] is internally clamped between `0.0` and `1.0` (inclusive).  
         */
        get ambient_light_sky_contribution(): float64
        set ambient_light_sky_contribution(value: float64)
        
        /** The ambient light's energy. The higher the value, the stronger the light. Only effective if [member ambient_light_sky_contribution] is lower than `1.0` (exclusive). */
        get ambient_light_energy(): float64
        set ambient_light_energy(value: float64)
        
        /** The reflected (specular) light source. */
        get reflected_light_source(): int64
        set reflected_light_source(value: int64)
        
        /** The tonemapping mode to use. Tonemapping is the process that "converts" HDR values to be suitable for rendering on an LDR display. (Godot doesn't support rendering on HDR displays yet.) */
        get tonemap_mode(): int64
        set tonemap_mode(value: int64)
        
        /** Adjusts the brightness of values before they are provided to the tonemapper. Higher [member tonemap_exposure] values result in a brighter image. See also [member tonemap_white].  
         *      
         *  **Note:** Values provided to the tonemapper will also be multiplied by `2.0` and `1.8` for [constant TONE_MAPPER_FILMIC] and [constant TONE_MAPPER_ACES] respectively to produce a similar apparent brightness as [constant TONE_MAPPER_LINEAR].  
         */
        get tonemap_exposure(): float64
        set tonemap_exposure(value: float64)
        
        /** The white reference value for tonemapping, which indicates where bright white is located in the scale of values provided to the tonemapper. For photorealistic lighting, recommended values are between `6.0` and `8.0`. Higher values result in less blown out highlights, but may make the scene appear lower contrast. See also [member tonemap_exposure].  
         *      
         *  **Note:** [member tonemap_white] is ignored when using [constant TONE_MAPPER_LINEAR] or [constant TONE_MAPPER_AGX].  
         */
        get tonemap_white(): float64
        set tonemap_white(value: float64)
        
        /** If `true`, screen-space reflections are enabled. Screen-space reflections are more accurate than reflections from [VoxelGI]s or [ReflectionProbe]s, but are slower and can't reflect surfaces occluded by others.  
         *      
         *  **Note:** SSR is only supported in the Forward+ rendering method, not Mobile or Compatibility.  
         *      
         *  **Note:** SSR is not supported on viewports that have a transparent background (where [member Viewport.transparent_bg] is `true`).  
         */
        get ssr_enabled(): boolean
        set ssr_enabled(value: boolean)
        
        /** The maximum number of steps for screen-space reflections. Higher values are slower. */
        get ssr_max_steps(): int64
        set ssr_max_steps(value: int64)
        
        /** The fade-in distance for screen-space reflections. Affects the area from the reflected material to the screen-space reflection. Only positive values are valid (negative values will be clamped to `0.0`). */
        get ssr_fade_in(): float64
        set ssr_fade_in(value: float64)
        
        /** The fade-out distance for screen-space reflections. Affects the area from the screen-space reflection to the "global" reflection. Only positive values are valid (negative values will be clamped to `0.0`). */
        get ssr_fade_out(): float64
        set ssr_fade_out(value: float64)
        
        /** The depth tolerance for screen-space reflections. */
        get ssr_depth_tolerance(): float64
        set ssr_depth_tolerance(value: float64)
        
        /** If `true`, the screen-space ambient occlusion effect is enabled. This darkens objects' corners and cavities to simulate ambient light not reaching the entire object as in real life. This works well for small, dynamic objects, but baked lighting or ambient occlusion textures will do a better job at displaying ambient occlusion on large static objects. Godot uses a form of SSAO called Adaptive Screen Space Ambient Occlusion which is itself a form of Horizon Based Ambient Occlusion.  
         *      
         *  **Note:** SSAO is only supported in the Forward+ rendering method, not Mobile or Compatibility.  
         */
        get ssao_enabled(): boolean
        set ssao_enabled(value: boolean)
        
        /** The distance at which objects can occlude each other when calculating screen-space ambient occlusion. Higher values will result in occlusion over a greater distance at the cost of performance and quality. */
        get ssao_radius(): float64
        set ssao_radius(value: float64)
        
        /** The primary screen-space ambient occlusion intensity. Acts as a multiplier for the screen-space ambient occlusion effect. A higher value results in darker occlusion. */
        get ssao_intensity(): float64
        set ssao_intensity(value: float64)
        
        /** The distribution of occlusion. A higher value results in darker occlusion, similar to [member ssao_intensity], but with a sharper falloff. */
        get ssao_power(): float64
        set ssao_power(value: float64)
        
        /** Sets the strength of the additional level of detail for the screen-space ambient occlusion effect. A high value makes the detail pass more prominent, but it may contribute to aliasing in your final image. */
        get ssao_detail(): float64
        set ssao_detail(value: float64)
        
        /** The threshold for considering whether a given point on a surface is occluded or not represented as an angle from the horizon mapped into the `0.0-1.0` range. A value of `1.0` results in no occlusion. */
        get ssao_horizon(): float64
        set ssao_horizon(value: float64)
        
        /** The amount that the screen-space ambient occlusion effect is allowed to blur over the edges of objects. Setting too high will result in aliasing around the edges of objects. Setting too low will make object edges appear blurry. */
        get ssao_sharpness(): float64
        set ssao_sharpness(value: float64)
        
        /** The screen-space ambient occlusion intensity in direct light. In real life, ambient occlusion only applies to indirect light, which means its effects can't be seen in direct light. Values higher than `0` will make the SSAO effect visible in direct light. */
        get ssao_light_affect(): float64
        set ssao_light_affect(value: float64)
        
        /** The screen-space ambient occlusion intensity on materials that have an AO texture defined. Values higher than `0` will make the SSAO effect visible in areas darkened by AO textures. */
        get ssao_ao_channel_affect(): float64
        set ssao_ao_channel_affect(value: float64)
        
        /** If `true`, the screen-space indirect lighting effect is enabled. Screen space indirect lighting is a form of indirect lighting that allows diffuse light to bounce between nearby objects. Screen-space indirect lighting works very similarly to screen-space ambient occlusion, in that it only affects a limited range. It is intended to be used along with a form of proper global illumination like SDFGI or [VoxelGI]. Screen-space indirect lighting is not affected by individual light's [member Light3D.light_indirect_energy].  
         *      
         *  **Note:** SSIL is only supported in the Forward+ rendering method, not Mobile or Compatibility.  
         */
        get ssil_enabled(): boolean
        set ssil_enabled(value: boolean)
        
        /** The distance that bounced lighting can travel when using the screen space indirect lighting effect. A larger value will result in light bouncing further in a scene, but may result in under-sampling artifacts which look like long spikes surrounding light sources. */
        get ssil_radius(): float64
        set ssil_radius(value: float64)
        
        /** The brightness multiplier for the screen-space indirect lighting effect. A higher value will result in brighter light. */
        get ssil_intensity(): float64
        set ssil_intensity(value: float64)
        
        /** The amount that the screen-space indirect lighting effect is allowed to blur over the edges of objects. Setting too high will result in aliasing around the edges of objects. Setting too low will make object edges appear blurry. */
        get ssil_sharpness(): float64
        set ssil_sharpness(value: float64)
        
        /** Amount of normal rejection used when calculating screen-space indirect lighting. Normal rejection uses the normal of a given sample point to reject samples that are facing away from the current pixel. Normal rejection is necessary to avoid light leaking when only one side of an object is illuminated. However, normal rejection can be disabled if light leaking is desirable, such as when the scene mostly contains emissive objects that emit light from faces that cannot be seen from the camera. */
        get ssil_normal_rejection(): float64
        set ssil_normal_rejection(value: float64)
        
        /** If `true`, enables signed distance field global illumination for meshes that have their [member GeometryInstance3D.gi_mode] set to [constant GeometryInstance3D.GI_MODE_STATIC]. SDFGI is a real-time global illumination technique that works well with procedurally generated and user-built levels, including in situations where geometry is created during gameplay. The signed distance field is automatically generated around the camera as it moves. Dynamic lights are supported, but dynamic occluders and emissive surfaces are not.  
         *      
         *  **Note:** SDFGI is only supported in the Forward+ rendering method, not Mobile or Compatibility.  
         *  **Performance:** SDFGI is relatively demanding on the GPU and is not suited to low-end hardware such as integrated graphics (consider [LightmapGI] instead). To improve SDFGI performance, enable [member ProjectSettings.rendering/global_illumination/gi/use_half_resolution] in the Project Settings.  
         *      
         *  **Note:** Meshes should have sufficiently thick walls to avoid light leaks (avoid one-sided walls). For interior levels, enclose your level geometry in a sufficiently large box and bridge the loops to close the mesh.  
         */
        get sdfgi_enabled(): boolean
        set sdfgi_enabled(value: boolean)
        
        /** If `true`, SDFGI uses an occlusion detection approach to reduce light leaking. Occlusion may however introduce dark blotches in certain spots, which may be undesired in mostly outdoor scenes. [member sdfgi_use_occlusion] has a performance impact and should only be enabled when needed. */
        get sdfgi_use_occlusion(): boolean
        set sdfgi_use_occlusion(value: boolean)
        
        /** If `true`, SDFGI takes the environment lighting into account. This should be set to `false` for interior scenes. */
        get sdfgi_read_sky_light(): boolean
        set sdfgi_read_sky_light(value: boolean)
        
        /** The energy multiplier applied to light every time it bounces from a surface when using SDFGI. Values greater than `0.0` will simulate multiple bounces, resulting in a more realistic appearance. Increasing [member sdfgi_bounce_feedback] generally has no performance impact. See also [member sdfgi_energy].  
         *      
         *  **Note:** Values greater than `0.5` can cause infinite feedback loops and should be avoided in scenes with bright materials.  
         *      
         *  **Note:** If [member sdfgi_bounce_feedback] is `0.0`, indirect lighting will not be represented in reflections as light will only bounce one time.  
         */
        get sdfgi_bounce_feedback(): float64
        set sdfgi_bounce_feedback(value: float64)
        
        /** The number of cascades to use for SDFGI (between 1 and 8). A higher number of cascades allows displaying SDFGI further away while preserving detail up close, at the cost of performance. When using SDFGI on small-scale levels, [member sdfgi_cascades] can often be decreased between `1` and `4` to improve performance. */
        get sdfgi_cascades(): int64
        set sdfgi_cascades(value: int64)
        
        /** The cell size to use for the closest SDFGI cascade (in 3D units). Lower values allow SDFGI to be more precise up close, at the cost of making SDFGI updates more demanding. This can cause stuttering when the camera moves fast. Higher values allow SDFGI to cover more ground, while also reducing the performance impact of SDFGI updates.  
         *      
         *  **Note:** This property is linked to [member sdfgi_max_distance] and [member sdfgi_cascade0_distance]. Changing its value will automatically change those properties as well.  
         */
        get sdfgi_min_cell_size(): float64
        set sdfgi_min_cell_size(value: float64)
        
        /**     
         *  **Note:** This property is linked to [member sdfgi_min_cell_size] and [member sdfgi_max_distance]. Changing its value will automatically change those properties as well.  
         */
        get sdfgi_cascade0_distance(): float64
        set sdfgi_cascade0_distance(value: float64)
        
        /** The maximum distance at which SDFGI is visible. Beyond this distance, environment lighting or other sources of GI such as [ReflectionProbe] will be used as a fallback.  
         *      
         *  **Note:** This property is linked to [member sdfgi_min_cell_size] and [member sdfgi_cascade0_distance]. Changing its value will automatically change those properties as well.  
         */
        get sdfgi_max_distance(): float64
        set sdfgi_max_distance(value: float64)
        
        /** The Y scale to use for SDFGI cells. Lower values will result in SDFGI cells being packed together more closely on the Y axis. This is used to balance between quality and covering a lot of vertical ground. [member sdfgi_y_scale] should be set depending on how vertical your scene is (and how fast your camera may move on the Y axis). */
        get sdfgi_y_scale(): int64
        set sdfgi_y_scale(value: int64)
        
        /** The energy multiplier to use for SDFGI. Higher values will result in brighter indirect lighting and reflections. See also [member sdfgi_bounce_feedback]. */
        get sdfgi_energy(): float64
        set sdfgi_energy(value: float64)
        
        /** The normal bias to use for SDFGI probes. Increasing this value can reduce visible streaking artifacts on sloped surfaces, at the cost of increased light leaking. */
        get sdfgi_normal_bias(): float64
        set sdfgi_normal_bias(value: float64)
        
        /** The constant bias to use for SDFGI probes. Increasing this value can reduce visible streaking artifacts on sloped surfaces, at the cost of increased light leaking. */
        get sdfgi_probe_bias(): float64
        set sdfgi_probe_bias(value: float64)
        
        /** If `true`, the glow effect is enabled. This simulates real world eye/camera behavior where bright pixels bleed onto surrounding pixels.  
         *      
         *  **Note:** When using the Mobile rendering method, glow looks different due to the lower dynamic range available in the Mobile rendering method.  
         *      
         *  **Note:** When using the Compatibility rendering method, glow uses a different implementation with some properties being unavailable and hidden from the inspector: `glow_levels/*`, [member glow_normalized], [member glow_strength], [member glow_blend_mode], [member glow_mix], [member glow_map], and [member glow_map_strength]. This implementation is optimized to run on low-end devices and is less flexible as a result.  
         */
        get glow_enabled(): boolean
        set glow_enabled(value: boolean)
        
        /** The intensity of the 1st level of glow. This is the most "local" level (least blurry).  
         *      
         *  **Note:** [member glow_levels/1] has no effect when using the Compatibility rendering method, due to this rendering method using a simpler glow implementation optimized for low-end devices.  
         */
        get "glow_levels/1"(): float64
        set "glow_levels/1"(value: float64)
        
        /** The intensity of the 2nd level of glow.  
         *      
         *  **Note:** [member glow_levels/2] has no effect when using the Compatibility rendering method, due to this rendering method using a simpler glow implementation optimized for low-end devices.  
         */
        get "glow_levels/2"(): float64
        set "glow_levels/2"(value: float64)
        
        /** The intensity of the 3rd level of glow.  
         *      
         *  **Note:** [member glow_levels/3] has no effect when using the Compatibility rendering method, due to this rendering method using a simpler glow implementation optimized for low-end devices.  
         */
        get "glow_levels/3"(): float64
        set "glow_levels/3"(value: float64)
        
        /** The intensity of the 4th level of glow.  
         *      
         *  **Note:** [member glow_levels/4] has no effect when using the Compatibility rendering method, due to this rendering method using a simpler glow implementation optimized for low-end devices.  
         */
        get "glow_levels/4"(): float64
        set "glow_levels/4"(value: float64)
        
        /** The intensity of the 5th level of glow.  
         *      
         *  **Note:** [member glow_levels/5] has no effect when using the Compatibility rendering method, due to this rendering method using a simpler glow implementation optimized for low-end devices.  
         */
        get "glow_levels/5"(): float64
        set "glow_levels/5"(value: float64)
        
        /** The intensity of the 6th level of glow.  
         *      
         *  **Note:** [member glow_levels/6] has no effect when using the Compatibility rendering method, due to this rendering method using a simpler glow implementation optimized for low-end devices.  
         */
        get "glow_levels/6"(): float64
        set "glow_levels/6"(value: float64)
        
        /** The intensity of the 7th level of glow. This is the most "global" level (blurriest).  
         *      
         *  **Note:** [member glow_levels/7] has no effect when using the Compatibility rendering method, due to this rendering method using a simpler glow implementation optimized for low-end devices.  
         */
        get "glow_levels/7"(): float64
        set "glow_levels/7"(value: float64)
        
        /** If `true`, glow levels will be normalized so that summed together their intensities equal `1.0`.  
         *      
         *  **Note:** [member glow_normalized] has no effect when using the Compatibility rendering method, due to this rendering method using a simpler glow implementation optimized for low-end devices.  
         */
        get glow_normalized(): boolean
        set glow_normalized(value: boolean)
        
        /** The overall brightness multiplier of the glow effect. When using the Mobile rendering method (which only supports a lower dynamic range up to `2.0`), this should be increased to `1.5` to compensate. */
        get glow_intensity(): float64
        set glow_intensity(value: float64)
        
        /** The strength of the glow effect. This applies as the glow is blurred across the screen and increases the distance and intensity of the blur. When using the Mobile rendering method, this should be increased to compensate for the lower dynamic range.  
         *      
         *  **Note:** [member glow_strength] has no effect when using the Compatibility rendering method, due to this rendering method using a simpler glow implementation optimized for low-end devices.  
         */
        get glow_strength(): float64
        set glow_strength(value: float64)
        
        /** When using the [constant GLOW_BLEND_MODE_MIX] [member glow_blend_mode], this controls how much the source image is blended with the glow layer. A value of `0.0` makes the glow rendering invisible, while a value of `1.0` is equivalent to [constant GLOW_BLEND_MODE_REPLACE].  
         *      
         *  **Note:** [member glow_mix] has no effect when using the Compatibility rendering method, due to this rendering method using a simpler glow implementation optimized for low-end devices.  
         */
        get glow_mix(): float64
        set glow_mix(value: float64)
        
        /** The bloom's intensity. If set to a value higher than `0`, this will make glow visible in areas darker than the [member glow_hdr_threshold]. */
        get glow_bloom(): float64
        set glow_bloom(value: float64)
        
        /** The glow blending mode.  
         *      
         *  **Note:** [member glow_blend_mode] has no effect when using the Compatibility rendering method, due to this rendering method using a simpler glow implementation optimized for low-end devices.  
         */
        get glow_blend_mode(): int64
        set glow_blend_mode(value: int64)
        
        /** The lower threshold of the HDR glow. When using the Mobile rendering method (which only supports a lower dynamic range up to `2.0`), this may need to be below `1.0` for glow to be visible. A value of `0.9` works well in this case. This value also needs to be decreased below `1.0` when using glow in 2D, as 2D rendering is performed in SDR. */
        get glow_hdr_threshold(): float64
        set glow_hdr_threshold(value: float64)
        
        /** The bleed scale of the HDR glow. */
        get glow_hdr_scale(): float64
        set glow_hdr_scale(value: float64)
        
        /** The higher threshold of the HDR glow. Areas brighter than this threshold will be clamped for the purposes of the glow effect. */
        get glow_hdr_luminance_cap(): float64
        set glow_hdr_luminance_cap(value: float64)
        
        /** How strong of an influence the [member glow_map] should have on the overall glow effect. A strength of `0.0` means the glow map has no influence, while a strength of `1.0` means the glow map has full influence.  
         *      
         *  **Note:** If the glow map has black areas, a value of `1.0` can also turn off the glow effect entirely in specific areas of the screen.  
         *      
         *  **Note:** [member glow_map_strength] has no effect when using the Compatibility rendering method, due to this rendering method using a simpler glow implementation optimized for low-end devices.  
         */
        get glow_map_strength(): float64
        set glow_map_strength(value: float64)
        
        /** The texture that should be used as a glow map to  *multiply*  the resulting glow color according to [member glow_map_strength]. This can be used to create a "lens dirt" effect. The texture's RGB color channels are used for modulation, but the alpha channel is ignored.  
         *      
         *  **Note:** The texture will be stretched to fit the screen. Therefore, it's recommended to use a texture with an aspect ratio that matches your project's base aspect ratio (typically 16:9).  
         *      
         *  **Note:** [member glow_map] has no effect when using the Compatibility rendering method, due to this rendering method using a simpler glow implementation optimized for low-end devices.  
         */
        get glow_map(): null | Texture2D
        set glow_map(value: null | Texture2D)
        
        /** If `true`, fog effects are enabled. */
        get fog_enabled(): boolean
        set fog_enabled(value: boolean)
        
        /** The fog mode. */
        get fog_mode(): int64
        set fog_mode(value: int64)
        
        /** The fog's color. */
        get fog_light_color(): Color
        set fog_light_color(value: Color)
        
        /** The fog's brightness. Higher values result in brighter fog. */
        get fog_light_energy(): float64
        set fog_light_energy(value: float64)
        
        /** If set above `0.0`, renders the scene's directional light(s) in the fog color depending on the view angle. This can be used to give the impression that the sun is "piercing" through the fog. */
        get fog_sun_scatter(): float64
        set fog_sun_scatter(value: float64)
        
        /** The fog density to be used. This is demonstrated in different ways depending on the [member fog_mode] mode chosen:  
         *  **Exponential Fog Mode:** Higher values result in denser fog. The fog rendering is exponential like in real life.  
         *  **Depth Fog mode:** The maximum intensity of the deep fog, effect will appear in the distance (relative to the camera). At `1.0` the fog will fully obscure the scene, at `0.0` the fog will not be visible.  
         */
        get fog_density(): float64
        set fog_density(value: float64)
        
        /** If set above `0.0` (exclusive), blends between the fog's color and the color of the background [Sky], as read from the radiance cubemap. This has a small performance cost when set above `0.0`. Must have [member background_mode] set to [constant BG_SKY].  
         *  This is useful to simulate [url=https://en.wikipedia.org/wiki/Aerial_perspective]aerial perspective[/url] in large scenes with low density fog. However, it is not very useful for high-density fog, as the sky will shine through. When set to `1.0`, the fog color comes completely from the [Sky]. If set to `0.0`, aerial perspective is disabled.  
         *  Notice that this does not sample the [Sky] directly, but rather the radiance cubemap. The cubemap is sampled at a mipmap level depending on the depth of the rendered pixel; the farther away, the higher the resolution of the sampled mipmap. This results in the actual color being a blurred version of the sky, with more blur closer to the camera. The highest mipmap resolution is used at a depth of [member Camera3D.far].  
         */
        get fog_aerial_perspective(): float64
        set fog_aerial_perspective(value: float64)
        
        /** The factor to use when affecting the sky with non-volumetric fog. `1.0` means that fog can fully obscure the sky. Lower values reduce the impact of fog on sky rendering, with `0.0` not affecting sky rendering at all.  
         *      
         *  **Note:** [member fog_sky_affect] has no visual effect if [member fog_aerial_perspective] is `1.0`.  
         */
        get fog_sky_affect(): float64
        set fog_sky_affect(value: float64)
        
        /** The height at which the height fog effect begins. */
        get fog_height(): float64
        set fog_height(value: float64)
        
        /** The density used to increase fog as height decreases. To make fog increase as height increases, use a negative value. */
        get fog_height_density(): float64
        set fog_height_density(value: float64)
        
        /** The fog depth's intensity curve. A number of presets are available in the Inspector by right-clicking the curve. Only available when [member fog_mode] is set to [constant FOG_MODE_DEPTH]. */
        get fog_depth_curve(): float64
        set fog_depth_curve(value: float64)
        
        /** The fog's depth starting distance from the camera. Only available when [member fog_mode] is set to [constant FOG_MODE_DEPTH]. */
        get fog_depth_begin(): float64
        set fog_depth_begin(value: float64)
        
        /** The fog's depth end distance from the camera. If this value is set to `0`, it will be equal to the current camera's [member Camera3D.far] value. Only available when [member fog_mode] is set to [constant FOG_MODE_DEPTH]. */
        get fog_depth_end(): float64
        set fog_depth_end(value: float64)
        
        /** Enables the volumetric fog effect. Volumetric fog uses a screen-aligned froxel buffer to calculate accurate volumetric scattering in the short to medium range. Volumetric fog interacts with [FogVolume]s and lights to calculate localized and global fog. Volumetric fog uses a PBR single-scattering model based on extinction, scattering, and emission which it exposes to users as density, albedo, and emission.  
         *      
         *  **Note:** Volumetric fog is only supported in the Forward+ rendering method, not Mobile or Compatibility.  
         */
        get volumetric_fog_enabled(): boolean
        set volumetric_fog_enabled(value: boolean)
        
        /** The base  *exponential*  density of the volumetric fog. Set this to the lowest density you want to have globally. [FogVolume]s can be used to add to or subtract from this density in specific areas. Fog rendering is exponential as in real life.  
         *  A value of `0.0` disables global volumetric fog while allowing [FogVolume]s to display volumetric fog in specific areas.  
         *  To make volumetric fog work as a volumetric  *lighting*  solution, set [member volumetric_fog_density] to the lowest non-zero value (`0.0001`) then increase lights' [member Light3D.light_volumetric_fog_energy] to values between `10000` and `100000` to compensate for the very low density.  
         */
        get volumetric_fog_density(): float64
        set volumetric_fog_density(value: float64)
        
        /** The [Color] of the volumetric fog when interacting with lights. Mist and fog have an albedo close to `Color(1, 1, 1, 1)` while smoke has a darker albedo. */
        get volumetric_fog_albedo(): Color
        set volumetric_fog_albedo(value: Color)
        
        /** The emitted light from the volumetric fog. Even with emission, volumetric fog will not cast light onto other surfaces. Emission is useful to establish an ambient color. As the volumetric fog effect uses single-scattering only, fog tends to need a little bit of emission to soften the harsh shadows. */
        get volumetric_fog_emission(): Color
        set volumetric_fog_emission(value: Color)
        
        /** The brightness of the emitted light from the volumetric fog. */
        get volumetric_fog_emission_energy(): float64
        set volumetric_fog_emission_energy(value: float64)
        
        /** Scales the strength of Global Illumination used in the volumetric fog's albedo color. A value of `0.0` means that Global Illumination will not impact the volumetric fog. [member volumetric_fog_gi_inject] has a small performance cost when set above `0.0`.  
         *      
         *  **Note:** This has no visible effect if [member volumetric_fog_density] is `0.0` or if [member volumetric_fog_albedo] is a fully black color.  
         *      
         *  **Note:** Only [VoxelGI] and SDFGI ([member Environment.sdfgi_enabled]) are taken into account when using [member volumetric_fog_gi_inject]. Global illumination from [LightmapGI], [ReflectionProbe] and SSIL (see [member ssil_enabled]) will be ignored by volumetric fog.  
         */
        get volumetric_fog_gi_inject(): float64
        set volumetric_fog_gi_inject(value: float64)
        
        /** The direction of scattered light as it goes through the volumetric fog. A value close to `1.0` means almost all light is scattered forward. A value close to `0.0` means light is scattered equally in all directions. A value close to `-1.0` means light is scattered mostly backward. Fog and mist scatter light slightly forward, while smoke scatters light equally in all directions. */
        get volumetric_fog_anisotropy(): float64
        set volumetric_fog_anisotropy(value: float64)
        
        /** The distance over which the volumetric fog is computed. Increase to compute fog over a greater range, decrease to add more detail when a long range is not needed. For best quality fog, keep this as low as possible. See also [member ProjectSettings.rendering/environment/volumetric_fog/volume_depth]. */
        get volumetric_fog_length(): float64
        set volumetric_fog_length(value: float64)
        
        /** The distribution of size down the length of the froxel buffer. A higher value compresses the froxels closer to the camera and places more detail closer to the camera. */
        get volumetric_fog_detail_spread(): float64
        set volumetric_fog_detail_spread(value: float64)
        
        /** Scales the strength of ambient light used in the volumetric fog. A value of `0.0` means that ambient light will not impact the volumetric fog. [member volumetric_fog_ambient_inject] has a small performance cost when set above `0.0`.  
         *      
         *  **Note:** This has no visible effect if [member volumetric_fog_density] is `0.0` or if [member volumetric_fog_albedo] is a fully black color.  
         */
        get volumetric_fog_ambient_inject(): float64
        set volumetric_fog_ambient_inject(value: float64)
        
        /** The factor to use when affecting the sky with volumetric fog. `1.0` means that volumetric fog can fully obscure the sky. Lower values reduce the impact of volumetric fog on sky rendering, with `0.0` not affecting sky rendering at all.  
         *      
         *  **Note:** [member volumetric_fog_sky_affect] also affects [FogVolume]s, even if [member volumetric_fog_density] is `0.0`. If you notice [FogVolume]s are disappearing when looking towards the sky, set [member volumetric_fog_sky_affect] to `1.0`.  
         */
        get volumetric_fog_sky_affect(): float64
        set volumetric_fog_sky_affect(value: float64)
        
        /** Enables temporal reprojection in the volumetric fog. Temporal reprojection blends the current frame's volumetric fog with the last frame's volumetric fog to smooth out jagged edges. The performance cost is minimal; however, it leads to moving [FogVolume]s and [Light3D]s "ghosting" and leaving a trail behind them. When temporal reprojection is enabled, try to avoid moving [FogVolume]s or [Light3D]s too fast. Short-lived dynamic lighting effects should have [member Light3D.light_volumetric_fog_energy] set to `0.0` to avoid ghosting. */
        get volumetric_fog_temporal_reprojection_enabled(): boolean
        set volumetric_fog_temporal_reprojection_enabled(value: boolean)
        
        /** The amount by which to blend the last frame with the current frame. A higher number results in smoother volumetric fog, but makes "ghosting" much worse. A lower value reduces ghosting but can result in the per-frame temporal jitter becoming visible. */
        get volumetric_fog_temporal_reprojection_amount(): float64
        set volumetric_fog_temporal_reprojection_amount(value: float64)
        
        /** If `true`, enables the `adjustment_*` properties provided by this resource. If `false`, modifications to the `adjustment_*` properties will have no effect on the rendered scene. */
        get adjustment_enabled(): boolean
        set adjustment_enabled(value: boolean)
        
        /** The global brightness value of the rendered scene. Effective only if [member adjustment_enabled] is `true`. */
        get adjustment_brightness(): float64
        set adjustment_brightness(value: float64)
        
        /** The global contrast value of the rendered scene (default value is 1). Effective only if [member adjustment_enabled] is `true`. */
        get adjustment_contrast(): float64
        set adjustment_contrast(value: float64)
        
        /** The global color saturation value of the rendered scene (default value is 1). Effective only if [member adjustment_enabled] is `true`. */
        get adjustment_saturation(): float64
        set adjustment_saturation(value: float64)
        
        /** The [Texture2D] or [Texture3D] lookup table (LUT) to use for the built-in post-process color grading. Can use a [GradientTexture1D] for a 1-dimensional LUT, or a [Texture3D] for a more complex LUT. Effective only if [member adjustment_enabled] is `true`. */
        get adjustment_color_correction(): null | Texture2D | Texture3D
        set adjustment_color_correction(value: null | Texture2D | Texture3D)
        /** @deprecated Internal use. Does not exist at runtime. */
        __godotNameMap: __NameMapEnvironment;
    }
    /** @deprecated Internal use. Does not exist at runtime. */
    interface __NameMapExpression extends __NameMapRefCounted {
    }
    /** A class that stores an expression you can execute.  
     *  	  
     *  @link https://docs.godotengine.org/en/4.5/classes/class_expression.html  
     */
    class Expression extends RefCounted {
        constructor(identifier?: any)
        /** Parses the expression and returns an [enum Error] code.  
         *  You can optionally specify names of variables that may appear in the expression with [param input_names], so that you can bind them when it gets executed.  
         */
        parse(expression: string, input_names?: PackedStringArray | string[] /* = [] */): Error
        
        /** Executes the expression that was previously parsed by [method parse] and returns the result. Before you use the returned object, you should check if the method failed by calling [method has_execute_failed].  
         *  If you defined input variables in [method parse], you can specify their values in the inputs array, in the same order.  
         */
        execute(inputs?: GArray /* = [] */, base_instance?: Object /* = undefined */, show_error?: boolean /* = true */, const_calls_only?: boolean /* = false */): any
        
        /** Returns `true` if [method execute] has failed. */
        has_execute_failed(): boolean
        
        /** Returns the error text if [method parse] or [method execute] has failed. */
        get_error_text(): string
        /** @deprecated Internal use. Does not exist at runtime. */
        __godotNameMap: __NameMapExpression;
    }
    /** @deprecated Internal use. Does not exist at runtime. */
    interface __NameMapExternalTexture extends __NameMapTexture2D {
    }
    /** Texture which displays the content of an external buffer.  
     *  	  
     *  @link https://docs.godotengine.org/en/4.5/classes/class_externaltexture.html  
     */
    class ExternalTexture extends Texture2D {
        constructor(identifier?: any)
        /** Returns the external texture ID.  
         *  Depending on your use case, you may need to pass this to platform APIs, for example, when creating an `android.graphics.SurfaceTexture` on Android.  
         */
        get_external_texture_id(): int64
        
        /** Sets the external buffer ID.  
         *  Depending on your use case, you may need to call this with data received from a platform API, for example, `SurfaceTexture.getHardwareBuffer()` on Android.  
         */
        set_external_buffer_id(external_buffer_id: int64): void
        
        /** External texture size. */
        get size(): Vector2
        set size(value: Vector2)
        /** @deprecated Internal use. Does not exist at runtime. */
        __godotNameMap: __NameMapExternalTexture;
    }
    /** @deprecated Internal use. Does not exist at runtime. */
    interface __NameMapFBXDocument extends __NameMapGLTFDocument {
    }
    /** Handles FBX documents.  
     *  	  
     *  @link https://docs.godotengine.org/en/4.5/classes/class_fbxdocument.html  
     */
    class FBXDocument extends GLTFDocument {
        constructor(identifier?: any)
        /** @deprecated Internal use. Does not exist at runtime. */
        __godotNameMap: __NameMapFBXDocument;
    }
    /** @deprecated Internal use. Does not exist at runtime. */
    interface __NameMapFBXState extends __NameMapGLTFState {
    }
    /** @link https://docs.godotengine.org/en/4.5/classes/class_fbxstate.html */
    class FBXState extends GLTFState {
        constructor(identifier?: any)
        /** If `true`, the import process used auxiliary nodes called geometry helper nodes. These nodes help preserve the pivots and transformations of the original 3D model during import. */
        get allow_geometry_helper_nodes(): boolean
        set allow_geometry_helper_nodes(value: boolean)
        /** @deprecated Internal use. Does not exist at runtime. */
        __godotNameMap: __NameMapFBXState;
    }
    namespace FastNoiseLite {
        enum NoiseType {
            /** A lattice of points are assigned random values then interpolated based on neighboring values. */
            TYPE_VALUE = 5,
            
            /** Similar to value noise ([constant TYPE_VALUE]), but slower. Has more variance in peaks and valleys.  
             *  Cubic noise can be used to avoid certain artifacts when using value noise to create a bumpmap. In general, you should always use this mode if the value noise is being used for a heightmap or bumpmap.  
             */
            TYPE_VALUE_CUBIC = 4,
            
            /** A lattice of random gradients. Their dot products are interpolated to obtain values in between the lattices. */
            TYPE_PERLIN = 3,
            
            /** Cellular includes both Worley noise and Voronoi diagrams which creates various regions of the same value. */
            TYPE_CELLULAR = 2,
            
            /** As opposed to [constant TYPE_PERLIN], gradients exist in a simplex lattice rather than a grid lattice, avoiding directional artifacts. Internally uses FastNoiseLite's OpenSimplex2 noise type. */
            TYPE_SIMPLEX = 0,
            
            /** Modified, higher quality version of [constant TYPE_SIMPLEX], but slower. Internally uses FastNoiseLite's OpenSimplex2S noise type. */
            TYPE_SIMPLEX_SMOOTH = 1,
        }
        enum FractalType {
            /** No fractal noise. */
            FRACTAL_NONE = 0,
            
            /** Method using Fractional Brownian Motion to combine octaves into a fractal. */
            FRACTAL_FBM = 1,
            
            /** Method of combining octaves into a fractal resulting in a "ridged" look. */
            FRACTAL_RIDGED = 2,
            
            /** Method of combining octaves into a fractal with a ping pong effect. */
            FRACTAL_PING_PONG = 3,
        }
        enum CellularDistanceFunction {
            /** Euclidean distance to the nearest point. */
            DISTANCE_EUCLIDEAN = 0,
            
            /** Squared Euclidean distance to the nearest point. */
            DISTANCE_EUCLIDEAN_SQUARED = 1,
            
            /** Manhattan distance (taxicab metric) to the nearest point. */
            DISTANCE_MANHATTAN = 2,
            
            /** Blend of [constant DISTANCE_EUCLIDEAN] and [constant DISTANCE_MANHATTAN] to give curved cell boundaries. */
            DISTANCE_HYBRID = 3,
        }
        enum CellularReturnType {
            /** The cellular distance function will return the same value for all points within a cell. */
            RETURN_CELL_VALUE = 0,
            
            /** The cellular distance function will return a value determined by the distance to the nearest point. */
            RETURN_DISTANCE = 1,
            
            /** The cellular distance function returns the distance to the second-nearest point. */
            RETURN_DISTANCE2 = 2,
            
            /** The distance to the nearest point is added to the distance to the second-nearest point. */
            RETURN_DISTANCE2_ADD = 3,
            
            /** The distance to the nearest point is subtracted from the distance to the second-nearest point. */
            RETURN_DISTANCE2_SUB = 4,
            
            /** The distance to the nearest point is multiplied with the distance to the second-nearest point. */
            RETURN_DISTANCE2_MUL = 5,
            
            /** The distance to the nearest point is divided by the distance to the second-nearest point. */
            RETURN_DISTANCE2_DIV = 6,
        }
        enum DomainWarpType {
            /** The domain is warped using the simplex noise algorithm. */
            DOMAIN_WARP_SIMPLEX = 0,
            
            /** The domain is warped using a simplified version of the simplex noise algorithm. */
            DOMAIN_WARP_SIMPLEX_REDUCED = 1,
            
            /** The domain is warped using a simple noise grid (not as smooth as the other methods, but more performant). */
            DOMAIN_WARP_BASIC_GRID = 2,
        }
        enum DomainWarpFractalType {
            /** No fractal noise for warping the space. */
            DOMAIN_WARP_FRACTAL_NONE = 0,
            
            /** Warping the space progressively, octave for octave, resulting in a more "liquified" distortion. */
            DOMAIN_WARP_FRACTAL_PROGRESSIVE = 1,
            
            /** Warping the space independently for each octave, resulting in a more chaotic distortion. */
            DOMAIN_WARP_FRACTAL_INDEPENDENT = 2,
        }
    }
    /** @deprecated Internal use. Does not exist at runtime. */
    interface __NameMapFastNoiseLite extends __NameMapNoise {
    }
    /** Generates noise using the FastNoiseLite library.  
     *  	  
     *  @link https://docs.godotengine.org/en/4.5/classes/class_fastnoiselite.html  
     */
    class FastNoiseLite extends Noise {
        constructor(identifier?: any)
        _changed(): void
        
        /** The noise algorithm used. */
        get noise_type(): int64
        set noise_type(value: int64)
        
        /** The random number seed for all noise types. */
        get seed(): int64
        set seed(value: int64)
        
        /** The frequency for all noise types. Low frequency results in smooth noise while high frequency results in rougher, more granular noise. */
        get frequency(): float64
        set frequency(value: float64)
        
        /** Translate the noise input coordinates by the given [Vector3]. */
        get offset(): Vector3
        set offset(value: Vector3)
        
        /** The method for combining octaves into a fractal. */
        get fractal_type(): int64
        set fractal_type(value: int64)
        
        /** The number of noise layers that are sampled to get the final value for fractal noise types. */
        get fractal_octaves(): int64
        set fractal_octaves(value: int64)
        
        /** Frequency multiplier between subsequent octaves. Increasing this value results in higher octaves producing noise with finer details and a rougher appearance. */
        get fractal_lacunarity(): float64
        set fractal_lacunarity(value: float64)
        
        /** Determines the strength of each subsequent layer of noise in fractal noise.  
         *  A low value places more emphasis on the lower frequency base layers, while a high value puts more emphasis on the higher frequency layers.  
         */
        get fractal_gain(): float64
        set fractal_gain(value: float64)
        
        /** Higher weighting means higher octaves have less impact if lower octaves have a large impact. */
        get fractal_weighted_strength(): float64
        set fractal_weighted_strength(value: float64)
        
        /** Sets the strength of the fractal ping pong type. */
        get fractal_ping_pong_strength(): float64
        set fractal_ping_pong_strength(value: float64)
        
        /** Determines how the distance to the nearest/second-nearest point is computed. */
        get cellular_distance_function(): int64
        set cellular_distance_function(value: int64)
        
        /** Maximum distance a point can move off of its grid position. Set to `0` for an even grid. */
        get cellular_jitter(): float64
        set cellular_jitter(value: float64)
        
        /** Return type from cellular noise calculations. */
        get cellular_return_type(): int64
        set cellular_return_type(value: int64)
        
        /** If enabled, another FastNoiseLite instance is used to warp the space, resulting in a distortion of the noise. */
        get domain_warp_enabled(): boolean
        set domain_warp_enabled(value: boolean)
        
        /** The warp algorithm. */
        get domain_warp_type(): int64
        set domain_warp_type(value: int64)
        
        /** Sets the maximum warp distance from the origin. */
        get domain_warp_amplitude(): float64
        set domain_warp_amplitude(value: float64)
        
        /** Frequency of the noise which warps the space. Low frequency results in smooth noise while high frequency results in rougher, more granular noise. */
        get domain_warp_frequency(): float64
        set domain_warp_frequency(value: float64)
        
        /** The method for combining octaves into a fractal which is used to warp the space. */
        get domain_warp_fractal_type(): int64
        set domain_warp_fractal_type(value: int64)
        
        /** The number of noise layers that are sampled to get the final value for the fractal noise which warps the space. */
        get domain_warp_fractal_octaves(): int64
        set domain_warp_fractal_octaves(value: int64)
        
        /** The change in frequency between octaves, also known as "lacunarity", of the fractal noise which warps the space. Increasing this value results in higher octaves, producing noise with finer details and a rougher appearance. */
        get domain_warp_fractal_lacunarity(): float64
        set domain_warp_fractal_lacunarity(value: float64)
        
        /** Determines the strength of each subsequent layer of the noise which is used to warp the space.  
         *  A low value places more emphasis on the lower frequency base layers, while a high value puts more emphasis on the higher frequency layers.  
         */
        get domain_warp_fractal_gain(): float64
        set domain_warp_fractal_gain(value: float64)
        /** @deprecated Internal use. Does not exist at runtime. */
        __godotNameMap: __NameMapFastNoiseLite;
    }
    namespace FileAccess {
        enum ModeFlags {
            /** Opens the file for read operations. The file cursor is positioned at the beginning of the file. */
            READ = 1,
            
            /** Opens the file for write operations. The file is created if it does not exist, and truncated if it does.  
             *      
             *  **Note:** When creating a file it must be in an already existing directory. To recursively create directories for a file path, see [method DirAccess.make_dir_recursive].  
             */
            WRITE = 2,
            
            /** Opens the file for read and write operations. Does not truncate the file. The file cursor is positioned at the beginning of the file. */
            READ_WRITE = 3,
            
            /** Opens the file for read and write operations. The file is created if it does not exist, and truncated if it does. The file cursor is positioned at the beginning of the file.  
             *      
             *  **Note:** When creating a file it must be in an already existing directory. To recursively create directories for a file path, see [method DirAccess.make_dir_recursive].  
             */
            WRITE_READ = 7,
        }
        enum CompressionMode {
            /** Uses the [url=https://fastlz.org/]FastLZ[/url] compression method. */
            COMPRESSION_FASTLZ = 0,
            
            /** Uses the [url=https://en.wikipedia.org/wiki/DEFLATE]DEFLATE[/url] compression method. */
            COMPRESSION_DEFLATE = 1,
            
            /** Uses the [url=https://facebook.github.io/zstd/]Zstandard[/url] compression method. */
            COMPRESSION_ZSTD = 2,
            
            /** Uses the [url=https://www.gzip.org/]gzip[/url] compression method. */
            COMPRESSION_GZIP = 3,
            
            /** Uses the [url=https://github.com/google/brotli]brotli[/url] compression method (only decompression is supported). */
            COMPRESSION_BROTLI = 4,
        }
        enum UnixPermissionFlags {
            /** Read for owner bit. */
            UNIX_READ_OWNER = 256,
            
            /** Write for owner bit. */
            UNIX_WRITE_OWNER = 128,
            
            /** Execute for owner bit. */
            UNIX_EXECUTE_OWNER = 64,
            
            /** Read for group bit. */
            UNIX_READ_GROUP = 32,
            
            /** Write for group bit. */
            UNIX_WRITE_GROUP = 16,
            
            /** Execute for group bit. */
            UNIX_EXECUTE_GROUP = 8,
            
            /** Read for other bit. */
            UNIX_READ_OTHER = 4,
            
            /** Write for other bit. */
            UNIX_WRITE_OTHER = 2,
            
            /** Execute for other bit. */
            UNIX_EXECUTE_OTHER = 1,
            
            /** Set user id on execution bit. */
            UNIX_SET_USER_ID = 2048,
            
            /** Set group id on execution bit. */
            UNIX_SET_GROUP_ID = 1024,
            
            /** Restricted deletion (sticky) bit. */
            UNIX_RESTRICTED_DELETE = 512,
        }
    }
    /** @deprecated Internal use. Does not exist at runtime. */
    interface __NameMapFileAccess extends __NameMapRefCounted {
    }
    /** Provides methods for file reading and writing operations.  
     *  	  
     *  @link https://docs.godotengine.org/en/4.5/classes/class_fileaccess.html  
     */
    class FileAccess extends RefCounted {
        constructor(identifier?: any)
        /** Creates a new [FileAccess] object and opens the file for writing or reading, depending on the flags.  
         *  Returns `null` if opening the file failed. You can use [method get_open_error] to check the error that occurred.  
         */
        static open(path: string, flags: FileAccess.ModeFlags): null | FileAccess
        
        /** Creates a new [FileAccess] object and opens an encrypted file in write or read mode. You need to pass a binary key to encrypt/decrypt it.  
         *      
         *  **Note:** The provided key must be 32 bytes long.  
         *  Returns `null` if opening the file failed. You can use [method get_open_error] to check the error that occurred.  
         */
        static open_encrypted(path: string, mode_flags: FileAccess.ModeFlags, key: PackedByteArray | byte[] | ArrayBuffer, iv?: PackedByteArray | byte[] | ArrayBuffer /* = [] */): null | FileAccess
        
        /** Creates a new [FileAccess] object and opens an encrypted file in write or read mode. You need to pass a password to encrypt/decrypt it.  
         *  Returns `null` if opening the file failed. You can use [method get_open_error] to check the error that occurred.  
         */
        static open_encrypted_with_pass(path: string, mode_flags: FileAccess.ModeFlags, pass: string): null | FileAccess
        
        /** Creates a new [FileAccess] object and opens a compressed file for reading or writing.  
         *      
         *  **Note:** [method open_compressed] can only read files that were saved by Godot, not third-party compression formats. See [url=https://github.com/godotengine/godot/issues/28999]GitHub issue #28999[/url] for a workaround.  
         *  Returns `null` if opening the file failed. You can use [method get_open_error] to check the error that occurred.  
         */
        static open_compressed(path: string, mode_flags: FileAccess.ModeFlags, compression_mode?: FileAccess.CompressionMode /* = 0 */): null | FileAccess
        
        /** Returns the result of the last [method open] call in the current thread. */
        static get_open_error(): Error
        
        /** Creates a temporary file. This file will be freed when the returned [FileAccess] is freed.  
         *  If [param prefix] is not empty, it will be prefixed to the file name, separated by a `-`.  
         *  If [param extension] is not empty, it will be appended to the temporary file name.  
         *  If [param keep] is `true`, the file is not deleted when the returned [FileAccess] is freed.  
         *  Returns `null` if opening the file failed. You can use [method get_open_error] to check the error that occurred.  
         */
        static create_temp(mode_flags: int64, prefix?: string /* = '' */, extension?: string /* = '' */, keep?: boolean /* = false */): FileAccess
        
        /** Returns the whole [param path] file contents as a [PackedByteArray] without any decoding.  
         *  Returns an empty [PackedByteArray] if an error occurred while opening the file. You can use [method get_open_error] to check the error that occurred.  
         */
        static get_file_as_bytes(path: string): PackedByteArray
        
        /** Returns the whole [param path] file contents as a [String]. Text is interpreted as being UTF-8 encoded.  
         *  Returns an empty [String] if an error occurred while opening the file. You can use [method get_open_error] to check the error that occurred.  
         */
        static get_file_as_string(path: string): string
        
        /** Resizes the file to a specified length. The file must be open in a mode that permits writing. If the file is extended, NUL characters are appended. If the file is truncated, all data from the end file to the original length of the file is lost. */
        resize(length: int64): Error
        
        /** Writes the file's buffer to disk. Flushing is automatically performed when the file is closed. This means you don't need to call [method flush] manually before closing a file. Still, calling [method flush] can be used to ensure the data is safe even if the project crashes instead of being closed gracefully.  
         *      
         *  **Note:** Only call [method flush] when you actually need it. Otherwise, it will decrease performance due to constant disk writes.  
         */
        flush(): void
        
        /** Returns the path as a [String] for the current open file. */
        get_path(): string
        
        /** Returns the absolute path as a [String] for the current open file. */
        get_path_absolute(): string
        
        /** Returns `true` if the file is currently opened. */
        is_open(): boolean
        
        /** Changes the file reading/writing cursor to the specified position (in bytes from the beginning of the file). This changes the value returned by [method get_position]. */
        seek(position: int64): void
        
        /** Changes the file reading/writing cursor to the specified position (in bytes from the end of the file). This changes the value returned by [method get_position].  
         *      
         *  **Note:** This is an offset, so you should use negative numbers or the file cursor will be at the end of the file.  
         */
        seek_end(position?: int64 /* = 0 */): void
        
        /** Returns the file cursor's position in bytes from the beginning of the file. This is the file reading/writing cursor set by [method seek] or [method seek_end] and advanced by read/write operations. */
        get_position(): int64
        
        /** Returns the size of the file in bytes. For a pipe, returns the number of bytes available for reading from the pipe. */
        get_length(): int64
        
        /** Returns `true` if the file cursor has already read past the end of the file.  
         *      
         *  **Note:** `eof_reached() == false` cannot be used to check whether there is more data available. To loop while there is more data available, use:  
         *    
         */
        eof_reached(): boolean
        
        /** Returns the next 8 bits from the file as an integer. This advances the file cursor by 1 byte. See [method store_8] for details on what values can be stored and retrieved this way. */
        get_8(): int64
        
        /** Returns the next 16 bits from the file as an integer. This advances the file cursor by 2 bytes. See [method store_16] for details on what values can be stored and retrieved this way. */
        get_16(): int64
        
        /** Returns the next 32 bits from the file as an integer. This advances the file cursor by 4 bytes. See [method store_32] for details on what values can be stored and retrieved this way. */
        get_32(): int64
        
        /** Returns the next 64 bits from the file as an integer. This advances the file cursor by 8 bytes. See [method store_64] for details on what values can be stored and retrieved this way. */
        get_64(): int64
        
        /** Returns the next 16 bits from the file as a half-precision floating-point number. This advances the file cursor by 2 bytes. */
        get_half(): float64
        
        /** Returns the next 32 bits from the file as a floating-point number. This advances the file cursor by 4 bytes. */
        get_float(): float64
        
        /** Returns the next 64 bits from the file as a floating-point number. This advances the file cursor by 8 bytes. */
        get_double(): float64
        
        /** Returns the next bits from the file as a floating-point number. This advances the file cursor by either 4 or 8 bytes, depending on the precision used by the Godot build that saved the file.  
         *  If the file was saved by a Godot build compiled with the `precision=single` option (the default), the number of read bits for that file is 32. Otherwise, if compiled with the `precision=double` option, the number of read bits is 64.  
         */
        get_real(): float64
        
        /** Returns next [param length] bytes of the file as a [PackedByteArray]. This advances the file cursor by [param length] bytes. */
        get_buffer(length: int64): PackedByteArray
        
        /** Returns the next line of the file as a [String]. The returned string doesn't include newline (`\n`) or carriage return (`\r`) characters, but does include any other leading or trailing whitespace. This advances the file cursor to after the newline character at the end of the line.  
         *  Text is interpreted as being UTF-8 encoded.  
         */
        get_line(): string
        
        /** Returns the next value of the file in CSV (Comma-Separated Values) format. You can pass a different delimiter [param delim] to use other than the default `","` (comma). This delimiter must be one-character long, and cannot be a double quotation mark.  
         *  Text is interpreted as being UTF-8 encoded. Text values must be enclosed in double quotes if they include the delimiter character. Double quotes within a text value can be escaped by doubling their occurrence. This advances the file cursor to after the newline character at the end of the line.  
         *  For example, the following CSV lines are valid and will be properly parsed as two strings each:  
         *  [codeblock lang=text]  
         *  Alice,"Hello, Bob!"  
         *  Bob,Alice! What a surprise!  
         *  Alice,"I thought you'd reply with ""Hello, world""."  
         *  [/codeblock]  
         *  Note how the second line can omit the enclosing quotes as it does not include the delimiter. However it  *could*  very well use quotes, it was only written without for demonstration purposes. The third line must use `""` for each quotation mark that needs to be interpreted as such instead of the end of a text value.  
         */
        get_csv_line(delim?: string /* = ',' */): PackedStringArray
        
        /** Returns the whole file as a [String]. Text is interpreted as being UTF-8 encoded. This ignores the file cursor and does not affect it.  
         *  If [param skip_cr] is `true`, carriage return characters (`\r`, CR) will be ignored when parsing the UTF-8, so that only line feed characters (`\n`, LF) represent a new line (Unix convention).  
         */
        get_as_text(skip_cr?: boolean /* = false */): string
        
        /** Returns an MD5 String representing the file at the given path or an empty [String] on failure. */
        static get_md5(path: string): string
        
        /** Returns an SHA-256 [String] representing the file at the given path or an empty [String] on failure. */
        static get_sha256(path: string): string
        
        /** Returns the last error that happened when trying to perform operations. Compare with the `ERR_FILE_*` constants from [enum Error]. */
        get_error(): Error
        
        /** Returns the next [Variant] value from the file. If [param allow_objects] is `true`, decoding objects is allowed. This advances the file cursor by the number of bytes read.  
         *  Internally, this uses the same decoding mechanism as the [method @GlobalScope.bytes_to_var] method, as described in the [url=https://docs.godotengine.org/en/4.5/tutorials/io/binary_serialization_api.html]Binary serialization API[/url] documentation.  
         *  **Warning:** Deserialized objects can contain code which gets executed. Do not use this option if the serialized object comes from untrusted sources to avoid potential security threats such as remote code execution.  
         */
        get_var(allow_objects?: boolean /* = false */): any
        
        /** Stores an integer as 8 bits in the file. This advances the file cursor by 1 byte. Returns `true` if the operation is successful.  
         *      
         *  **Note:** The [param value] should lie in the interval `[0, 255]`. Any other value will overflow and wrap around.  
         *      
         *  **Note:** If an error occurs, the resulting value of the file position indicator is indeterminate.  
         *  To store a signed integer, use [method store_64], or convert it manually (see [method store_16] for an example).  
         */
        store_8(value: int64): boolean
        
        /** Stores an integer as 16 bits in the file. This advances the file cursor by 2 bytes. Returns `true` if the operation is successful.  
         *      
         *  **Note:** The [param value] should lie in the interval `[0, 2^16 - 1]`. Any other value will overflow and wrap around.  
         *      
         *  **Note:** If an error occurs, the resulting value of the file position indicator is indeterminate.  
         *  To store a signed integer, use [method store_64] or store a signed integer from the interval `[-2^15, 2^15 - 1]` (i.e. keeping one bit for the signedness) and compute its sign manually when reading. For example:  
         *    
         */
        store_16(value: int64): boolean
        
        /** Stores an integer as 32 bits in the file. This advances the file cursor by 4 bytes. Returns `true` if the operation is successful.  
         *      
         *  **Note:** The [param value] should lie in the interval `[0, 2^32 - 1]`. Any other value will overflow and wrap around.  
         *      
         *  **Note:** If an error occurs, the resulting value of the file position indicator is indeterminate.  
         *  To store a signed integer, use [method store_64], or convert it manually (see [method store_16] for an example).  
         */
        store_32(value: int64): boolean
        
        /** Stores an integer as 64 bits in the file. This advances the file cursor by 8 bytes. Returns `true` if the operation is successful.  
         *      
         *  **Note:** The [param value] must lie in the interval `[-2^63, 2^63 - 1]` (i.e. be a valid [int] value).  
         *      
         *  **Note:** If an error occurs, the resulting value of the file position indicator is indeterminate.  
         */
        store_64(value: int64): boolean
        
        /** Stores a half-precision floating-point number as 16 bits in the file. This advances the file cursor by 2 bytes. Returns `true` if the operation is successful.  
         *      
         *  **Note:** If an error occurs, the resulting value of the file position indicator is indeterminate.  
         */
        store_half(value: float64): boolean
        
        /** Stores a floating-point number as 32 bits in the file. This advances the file cursor by 4 bytes. Returns `true` if the operation is successful.  
         *      
         *  **Note:** If an error occurs, the resulting value of the file position indicator is indeterminate.  
         */
        store_float(value: float64): boolean
        
        /** Stores a floating-point number as 64 bits in the file. This advances the file cursor by 8 bytes. Returns `true` if the operation is successful.  
         *      
         *  **Note:** If an error occurs, the resulting value of the file position indicator is indeterminate.  
         */
        store_double(value: float64): boolean
        
        /** Stores a floating-point number in the file. This advances the file cursor by either 4 or 8 bytes, depending on the precision used by the current Godot build.  
         *  If using a Godot build compiled with the `precision=single` option (the default), this method will save a 32-bit float. Otherwise, if compiled with the `precision=double` option, this will save a 64-bit float. Returns `true` if the operation is successful.  
         *      
         *  **Note:** If an error occurs, the resulting value of the file position indicator is indeterminate.  
         */
        store_real(value: float64): boolean
        
        /** Stores the given array of bytes in the file. This advances the file cursor by the number of bytes written. Returns `true` if the operation is successful.  
         *      
         *  **Note:** If an error occurs, the resulting value of the file position indicator is indeterminate.  
         */
        store_buffer(buffer: PackedByteArray | byte[] | ArrayBuffer): boolean
        
        /** Stores [param line] in the file followed by a newline character (`\n`), encoding the text as UTF-8. This advances the file cursor by the length of the line, after the newline character. The amount of bytes written depends on the UTF-8 encoded bytes, which may be different from [method String.length] which counts the number of UTF-32 codepoints. Returns `true` if the operation is successful.  
         *      
         *  **Note:** If an error occurs, the resulting value of the file position indicator is indeterminate.  
         */
        store_line(line: string): boolean
        
        /** Store the given [PackedStringArray] in the file as a line formatted in the CSV (Comma-Separated Values) format. You can pass a different delimiter [param delim] to use other than the default `","` (comma). This delimiter must be one-character long.  
         *  Text will be encoded as UTF-8. Returns `true` if the operation is successful.  
         *      
         *  **Note:** If an error occurs, the resulting value of the file position indicator is indeterminate.  
         */
        store_csv_line(values: PackedStringArray | string[], delim?: string /* = ',' */): boolean
        
        /** Stores [param string] in the file without a newline character (`\n`), encoding the text as UTF-8. This advances the file cursor by the length of the string in UTF-8 encoded bytes, which may be different from [method String.length] which counts the number of UTF-32 codepoints. Returns `true` if the operation is successful.  
         *      
         *  **Note:** This method is intended to be used to write text files. The string is stored as a UTF-8 encoded buffer without string length or terminating zero, which means that it can't be loaded back easily. If you want to store a retrievable string in a binary file, consider using [method store_pascal_string] instead. For retrieving strings from a text file, you can use `get_buffer(length).get_string_from_utf8()` (if you know the length) or [method get_as_text].  
         *      
         *  **Note:** If an error occurs, the resulting value of the file position indicator is indeterminate.  
         */
        store_string(string_: string): boolean
        
        /** Stores any Variant value in the file. If [param full_objects] is `true`, encoding objects is allowed (and can potentially include code). This advances the file cursor by the number of bytes written. Returns `true` if the operation is successful.  
         *  Internally, this uses the same encoding mechanism as the [method @GlobalScope.var_to_bytes] method, as described in the [url=https://docs.godotengine.org/en/4.5/tutorials/io/binary_serialization_api.html]Binary serialization API[/url] documentation.  
         *      
         *  **Note:** Not all properties are included. Only properties that are configured with the [constant PROPERTY_USAGE_STORAGE] flag set will be serialized. You can add a new usage flag to a property by overriding the [method Object._get_property_list] method in your class. You can also check how property usage is configured by calling [method Object._get_property_list]. See [enum PropertyUsageFlags] for the possible usage flags.  
         *      
         *  **Note:** If an error occurs, the resulting value of the file position indicator is indeterminate.  
         */
        store_var(value: any, full_objects?: boolean /* = false */): boolean
        
        /** Stores the given [String] as a line in the file in Pascal format (i.e. also store the length of the string). Text will be encoded as UTF-8. This advances the file cursor by the number of bytes written depending on the UTF-8 encoded bytes, which may be different from [method String.length] which counts the number of UTF-32 codepoints. Returns `true` if the operation is successful.  
         *      
         *  **Note:** If an error occurs, the resulting value of the file position indicator is indeterminate.  
         */
        store_pascal_string(string_: string): boolean
        
        /** Returns a [String] saved in Pascal format from the file, meaning that the length of the string is explicitly stored at the start. See [method store_pascal_string]. This may include newline characters. The file cursor is advanced after the bytes read.  
         *  Text is interpreted as being UTF-8 encoded.  
         */
        get_pascal_string(): string
        
        /** Closes the currently opened file and prevents subsequent read/write operations. Use [method flush] to persist the data to disk without closing the file.  
         *      
         *  **Note:** [FileAccess] will automatically close when it's freed, which happens when it goes out of scope or when it gets assigned with `null`. In C# the reference must be disposed after we are done using it, this can be done with the `using` statement or calling the `Dispose` method directly.  
         */
        close(): void
        
        /** Returns `true` if the file exists in the given path.  
         *      
         *  **Note:** Many resources types are imported (e.g. textures or sound files), and their source asset will not be included in the exported game, as only the imported version is used. See [method ResourceLoader.exists] for an alternative approach that takes resource remapping into account.  
         *  For a non-static, relative equivalent, use [method DirAccess.file_exists].  
         */
        static file_exists(path: string): boolean
        
        /** Returns the last time the [param file] was modified in Unix timestamp format, or `0` on error. This Unix timestamp can be converted to another format using the [Time] singleton. */
        static get_modified_time(file: string): int64
        
        /** Returns the last time the [param file] was accessed in Unix timestamp format, or `0` on error. This Unix timestamp can be converted to another format using the [Time] singleton. */
        static get_access_time(file: string): int64
        
        /** Returns file size in bytes, or `-1` on error. */
        static get_size(file: string): int64
        
        /** Returns file UNIX permissions.  
         *      
         *  **Note:** This method is implemented on iOS, Linux/BSD, and macOS.  
         */
        static get_unix_permissions(file: string): FileAccess.UnixPermissionFlags
        
        /** Sets file UNIX permissions.  
         *      
         *  **Note:** This method is implemented on iOS, Linux/BSD, and macOS.  
         */
        static set_unix_permissions(file: string, permissions: FileAccess.UnixPermissionFlags): Error
        
        /** Returns `true`, if file `hidden` attribute is set.  
         *      
         *  **Note:** This method is implemented on iOS, BSD, macOS, and Windows.  
         */
        static get_hidden_attribute(file: string): boolean
        
        /** Sets file **hidden** attribute.  
         *      
         *  **Note:** This method is implemented on iOS, BSD, macOS, and Windows.  
         */
        static set_hidden_attribute(file: string, hidden: boolean): Error
        
        /** Sets file **read only** attribute.  
         *      
         *  **Note:** This method is implemented on iOS, BSD, macOS, and Windows.  
         */
        static set_read_only_attribute(file: string, ro: boolean): Error
        
        /** Returns `true`, if file `read only` attribute is set.  
         *      
         *  **Note:** This method is implemented on iOS, BSD, macOS, and Windows.  
         */
        static get_read_only_attribute(file: string): boolean
        
        /** If `true`, the file is read with big-endian [url=https://en.wikipedia.org/wiki/Endianness]endianness[/url]. If `false`, the file is read with little-endian endianness. If in doubt, leave this to `false` as most files are written with little-endian endianness.  
         *      
         *  **Note:** This is always reset to system endianness, which is little-endian on all supported platforms, whenever you open the file. Therefore, you must set [member big_endian]  *after*  opening the file, not before.  
         */
        get big_endian(): boolean
        set big_endian(value: boolean)
        /** @deprecated Internal use. Does not exist at runtime. */
        __godotNameMap: __NameMapFileAccess;
    }
    namespace FileDialog {
        enum FileMode {
            /** The dialog allows selecting one, and only one file. */
            FILE_MODE_OPEN_FILE = 0,
            
            /** The dialog allows selecting multiple files. */
            FILE_MODE_OPEN_FILES = 1,
            
            /** The dialog only allows selecting a directory, disallowing the selection of any file. */
            FILE_MODE_OPEN_DIR = 2,
            
            /** The dialog allows selecting one file or directory. */
            FILE_MODE_OPEN_ANY = 3,
            
            /** The dialog will warn when a file exists. */
            FILE_MODE_SAVE_FILE = 4,
        }
        enum Access {
            /** The dialog only allows accessing files under the [Resource] path (`res://`). */
            ACCESS_RESOURCES = 0,
            
            /** The dialog only allows accessing files under user data path (`user://`). */
            ACCESS_USERDATA = 1,
            
            /** The dialog allows accessing files on the whole file system. */
            ACCESS_FILESYSTEM = 2,
        }
        enum DisplayMode {
            /** The dialog displays files as a grid of thumbnails. Use [theme_item thumbnail_size] to adjust their size. */
            DISPLAY_THUMBNAILS = 0,
            
            /** The dialog displays files as a list of filenames. */
            DISPLAY_LIST = 1,
        }
        enum Customization {
            /** Toggles visibility of the favorite button, and the favorite list on the left side of the dialog.  
             *  Equivalent to [member hidden_files_toggle_enabled].  
             */
            CUSTOMIZATION_HIDDEN_FILES = 0,
            
            /** If enabled, shows the button for creating new directories (when using [constant FILE_MODE_OPEN_DIR], [constant FILE_MODE_OPEN_ANY], or [constant FILE_MODE_SAVE_FILE]).  
             *  Equivalent to [member folder_creation_enabled].  
             */
            CUSTOMIZATION_CREATE_FOLDER = 1,
            
            /** If enabled, shows the toggle file filter button.  
             *  Equivalent to [member file_filter_toggle_enabled].  
             */
            CUSTOMIZATION_FILE_FILTER = 2,
            
            /** If enabled, shows the file sorting options button.  
             *  Equivalent to [member file_sort_options_enabled].  
             */
            CUSTOMIZATION_FILE_SORT = 3,
            
            /** If enabled, shows the toggle favorite button and favorite list on the left side of the dialog.  
             *  Equivalent to [member favorites_enabled].  
             */
            CUSTOMIZATION_FAVORITES = 4,
            
            /** If enabled, shows the recent directories list on the left side of the dialog.  
             *  Equivalent to [member recent_list_enabled].  
             */
            CUSTOMIZATION_RECENT = 5,
            
            /** If enabled, shows the layout switch buttons (list/thumbnails).  
             *  Equivalent to [member layout_toggle_enabled].  
             */
            CUSTOMIZATION_LAYOUT = 6,
        }
    }
    /** @deprecated Internal use. Does not exist at runtime. */
    interface __NameMapFileDialog extends __NameMapConfirmationDialog {
    }
    /** A dialog for selecting files or directories in the filesystem.  
     *  	  
     *  @link https://docs.godotengine.org/en/4.5/classes/class_filedialog.html  
     */
    class FileDialog<Map extends NodePathMap = any> extends ConfirmationDialog<Map> {
        constructor(identifier?: any)
        _cancel_pressed(): void
        
        /** Clear all the added filters in the dialog. */
        clear_filters(): void
        
        /** Adds a comma-separated file name [param filter] option to the [FileDialog] with an optional [param description], which restricts what files can be picked.  
         *  A [param filter] should be of the form `"filename.extension"`, where filename and extension can be `*` to match any string. Filters starting with `.` (i.e. empty filenames) are not allowed.  
         *  For example, a [param filter] of `"*.png, *.jpg"` and a [param description] of `"Images"` results in filter text "Images (*.png, *.jpg)".  
         */
        add_filter(filter: string, description?: string /* = '' */): void
        
        /** Clear the filter for file names. */
        clear_filename_filter(): void
        
        /** Returns the name of the [OptionButton] or [CheckBox] with index [param option]. */
        get_option_name(option: int64): string
        
        /** Returns an array of values of the [OptionButton] with index [param option]. */
        get_option_values(option: int64): PackedStringArray
        
        /** Returns the default value index of the [OptionButton] or [CheckBox] with index [param option]. */
        get_option_default(option: int64): int64
        
        /** Sets the name of the [OptionButton] or [CheckBox] with index [param option]. */
        set_option_name(option: int64, name: string): void
        
        /** Sets the option values of the [OptionButton] with index [param option]. */
        set_option_values(option: int64, values: PackedStringArray | string[]): void
        
        /** Sets the default value index of the [OptionButton] or [CheckBox] with index [param option]. */
        set_option_default(option: int64, default_value_index: int64): void
        
        /** Adds an additional [OptionButton] to the file dialog. If [param values] is empty, a [CheckBox] is added instead.  
         *  [param default_value_index] should be an index of the value in the [param values]. If [param values] is empty it should be either `1` (checked), or `0` (unchecked).  
         */
        add_option(name: string, values: PackedStringArray | string[], default_value_index: int64): void
        
        /** Returns a [Dictionary] with the selected values of the additional [OptionButton]s and/or [CheckBox]es. [Dictionary] keys are names and values are selected value indices. */
        get_selected_options(): GDictionary
        
        /** Returns the vertical box container of the dialog, custom controls can be added to it.  
         *  **Warning:** This is a required internal node, removing and freeing it may cause a crash. If you wish to hide it or any of its children, use their [member CanvasItem.visible] property.  
         *      
         *  **Note:** Changes to this node are ignored by native file dialogs, use [method add_option] to add custom elements to the dialog instead.  
         */
        get_vbox(): null | VBoxContainer
        
        /** Returns the LineEdit for the selected file.  
         *  **Warning:** This is a required internal node, removing and freeing it may cause a crash. If you wish to hide it or any of its children, use their [member CanvasItem.visible] property.  
         */
        get_line_edit(): null | LineEdit
        
        /** Toggles the specified customization [param flag], allowing to customize features available in this [FileDialog]. See [enum Customization] for options. */
        set_customization_flag_enabled(flag: FileDialog.Customization, enabled: boolean): void
        
        /** Returns `true` if the provided [param flag] is enabled. */
        is_customization_flag_enabled(flag: FileDialog.Customization): boolean
        
        /** Clear all currently selected items in the dialog. */
        deselect_all(): void
        
        /** Invalidate and update the current dialog content list.  
         *      
         *  **Note:** This method does nothing on native file dialogs.  
         */
        invalidate(): void
        
        /** If `true`, changing the [member file_mode] property will set the window title accordingly (e.g. setting [member file_mode] to [constant FILE_MODE_OPEN_FILE] will change the window title to "Open a File"). */
        get mode_overrides_title(): boolean
        set mode_overrides_title(value: boolean)
        
        /** The dialog's open or save mode, which affects the selection behavior. */
        get file_mode(): int64
        set file_mode(value: int64)
        
        /** Display mode of the dialog's file list. */
        get display_mode(): int64
        set display_mode(value: int64)
        
        /** The file system access scope.  
         *  **Warning:** In Web builds, FileDialog cannot access the host file system. In sandboxed Linux and macOS environments, [member use_native_dialog] is automatically used to allow limited access to host file system.  
         */
        get access(): int64
        set access(value: int64)
        
        /** If non-empty, the given sub-folder will be "root" of this [FileDialog], i.e. user won't be able to go to its parent directory.  
         *      
         *  **Note:** This property is ignored by native file dialogs.  
         */
        get root_subfolder(): string
        set root_subfolder(value: string)
        
        /** The available file type filters. Each filter string in the array should be formatted like this: `*.png,*.jpg,*.jpeg;Image Files;image/png,image/jpeg`. The description text of the filter is optional and can be omitted. Both file extensions and MIME type should be always set.  
         *      
         *  **Note:** Embedded file dialog and Windows file dialog support only file extensions, while Android, Linux, and macOS file dialogs also support MIME types.  
         */
        get filters(): PackedStringArray
        set filters(value: PackedStringArray | string[])
        
        /** The filter for file names (case-insensitive). When set to a non-empty string, only files that contains the substring will be shown. [member filename_filter] can be edited by the user with the filter button at the top of the file dialog.  
         *  See also [member filters], which should be used to restrict the file types that can be selected instead of [member filename_filter] which is meant to be set by the user.  
         */
        get filename_filter(): string
        set filename_filter(value: string)
        
        /** If `true`, the dialog will show hidden files.  
         *      
         *  **Note:** This property is ignored by native file dialogs on Android and Linux.  
         */
        get show_hidden_files(): boolean
        set show_hidden_files(value: boolean)
        
        /** If `true`, and if supported by the current [DisplayServer], OS native dialog will be used instead of custom one.  
         *      
         *  **Note:** On Android, it is only supported for Android 10+ devices and when using [constant ACCESS_FILESYSTEM]. For access mode [constant ACCESS_RESOURCES] and [constant ACCESS_USERDATA], the system will fall back to custom FileDialog.  
         *      
         *  **Note:** On Linux and macOS, sandboxed apps always use native dialogs to access the host file system.  
         *      
         *  **Note:** On macOS, sandboxed apps will save security-scoped bookmarks to retain access to the opened folders across multiple sessions. Use [method OS.get_granted_permissions] to get a list of saved bookmarks.  
         *      
         *  **Note:** Native dialogs are isolated from the base process, file dialog properties can't be modified once the dialog is shown.  
         */
        get use_native_dialog(): boolean
        set use_native_dialog(value: boolean)
        
        /** The number of additional [OptionButton]s and [CheckBox]es in the dialog. */
        get option_count(): int64
        set option_count(value: int64)
        
        /** If `true`, shows the toggle hidden files button. */
        get hidden_files_toggle_enabled(): boolean
        set hidden_files_toggle_enabled(value: boolean)
        
        /** If `true`, shows the toggle file filter button. */
        get file_filter_toggle_enabled(): boolean
        set file_filter_toggle_enabled(value: boolean)
        
        /** If `true`, shows the file sorting options button. */
        get file_sort_options_enabled(): boolean
        set file_sort_options_enabled(value: boolean)
        
        /** If `true`, shows the button for creating new directories (when using [constant FILE_MODE_OPEN_DIR], [constant FILE_MODE_OPEN_ANY], or [constant FILE_MODE_SAVE_FILE]). */
        get folder_creation_enabled(): boolean
        set folder_creation_enabled(value: boolean)
        
        /** If `true`, shows the toggle favorite button and favorite list on the left side of the dialog. */
        get favorites_enabled(): boolean
        set favorites_enabled(value: boolean)
        
        /** If `true`, shows the recent directories list on the left side of the dialog. */
        get recent_list_enabled(): boolean
        set recent_list_enabled(value: boolean)
        
        /** If `true`, shows the layout switch buttons (list/thumbnails). */
        get layout_toggle_enabled(): boolean
        set layout_toggle_enabled(value: boolean)
        
        /** The current working directory of the file dialog.  
         *      
         *  **Note:** For native file dialogs, this property is only treated as a hint and may not be respected by specific OS implementations.  
         */
        get current_dir(): string
        set current_dir(value: string)
        
        /** The currently selected file of the file dialog. */
        get current_file(): string
        set current_file(value: string)
        
        /** The currently selected file path of the file dialog. */
        get current_path(): string
        set current_path(value: string)
        
        /** Emitted when the user selects a file by double-clicking it or pressing the **OK** button. */
        readonly file_selected: Signal<(path: string) => void>
        
        /** Emitted when the user selects multiple files. */
        readonly files_selected: Signal<(paths: PackedStringArray) => void>
        
        /** Emitted when the user selects a directory. */
        readonly dir_selected: Signal<(dir: string) => void>
        
        /** Emitted when the filter for file names changes. */
        readonly filename_filter_changed: Signal<(filter: string) => void>
        /** @deprecated Internal use. Does not exist at runtime. */
        __godotNameMap: __NameMapFileDialog;
    }
    /** @deprecated Internal use. Does not exist at runtime. */
    interface __NameMapFileSystemDock extends __NameMapVBoxContainer {
    }
    /** Godot editor's dock for managing files in the project.  
     *  	  
     *  @link https://docs.godotengine.org/en/4.5/classes/class_filesystemdock.html  
     */
    class FileSystemDock<Map extends NodePathMap = any> extends VBoxContainer<Map> {
        constructor(identifier?: any)
        _file_list_thumbnail_done(_unnamed_arg0: string, _unnamed_arg1: Texture2D, _unnamed_arg2: Texture2D, _unnamed_arg3: any): void
        _tree_thumbnail_done(_unnamed_arg0: string, _unnamed_arg1: Texture2D, _unnamed_arg2: Texture2D, _unnamed_arg3: any): void
        
        /** Sets the given [param path] as currently selected, ensuring that the selected file/directory is visible. */
        navigate_to_path(path: string): void
        
        /** Registers a new [EditorResourceTooltipPlugin]. */
        add_resource_tooltip_plugin(plugin: EditorResourceTooltipPlugin): void
        
        /** Removes an [EditorResourceTooltipPlugin]. Fails if the plugin wasn't previously added. */
        remove_resource_tooltip_plugin(plugin: EditorResourceTooltipPlugin): void
        _set_dock_horizontal(enable: boolean): void
        _can_dock_horizontal(): boolean
        _save_layout_to_config(_unnamed_arg0: ConfigFile, _unnamed_arg1: string): void
        _load_layout_from_config(_unnamed_arg0: ConfigFile, _unnamed_arg1: string): void
        
        /** Emitted when a new scene is created that inherits the scene at [param file] path. */
        readonly inherit: Signal<(file: string) => void>
        
        /** Emitted when the given scenes are being instantiated in the editor. */
        readonly instantiate: Signal<(files: PackedStringArray) => void>
        
        /** Emitted when an external [param resource] had its file removed. */
        readonly resource_removed: Signal<(resource: Resource) => void>
        
        /** Emitted when the given [param file] was removed. */
        readonly file_removed: Signal<(file: string) => void>
        
        /** Emitted when the given [param folder] was removed. */
        readonly folder_removed: Signal<(folder: string) => void>
        
        /** Emitted when a file is moved from [param old_file] path to [param new_file] path. */
        readonly files_moved: Signal<(old_file: string, new_file: string) => void>
        
        /** Emitted when a folder is moved from [param old_folder] path to [param new_folder] path. */
        readonly folder_moved: Signal<(old_folder: string, new_folder: string) => void>
        
        /** Emitted when folders change color. */
        readonly folder_color_changed: Signal<() => void>
        
        /** Emitted when the user switches file display mode or split mode. */
        readonly display_mode_changed: Signal<() => void>
        /** @deprecated Internal use. Does not exist at runtime. */
        __godotNameMap: __NameMapFileSystemDock;
    }
    namespace FlowContainer {
        enum AlignmentMode {
            /** The child controls will be arranged at the beginning of the container, i.e. top if orientation is vertical, left if orientation is horizontal (right for RTL layout). */
            ALIGNMENT_BEGIN = 0,
            
            /** The child controls will be centered in the container. */
            ALIGNMENT_CENTER = 1,
            
            /** The child controls will be arranged at the end of the container, i.e. bottom if orientation is vertical, right if orientation is horizontal (left for RTL layout). */
            ALIGNMENT_END = 2,
        }
        enum LastWrapAlignmentMode {
            /** The last partially filled row or column will wrap aligned to the previous row or column in accordance with [member alignment]. */
            LAST_WRAP_ALIGNMENT_INHERIT = 0,
            
            /** The last partially filled row or column will wrap aligned to the beginning of the previous row or column. */
            LAST_WRAP_ALIGNMENT_BEGIN = 1,
            
            /** The last partially filled row or column will wrap aligned to the center of the previous row or column. */
            LAST_WRAP_ALIGNMENT_CENTER = 2,
            
            /** The last partially filled row or column will wrap aligned to the end of the previous row or column. */
            LAST_WRAP_ALIGNMENT_END = 3,
        }
    }
    /** @deprecated Internal use. Does not exist at runtime. */
    interface __NameMapFlowContainer extends __NameMapContainer {
    }
    /** A container that arranges its child controls horizontally or vertically and wraps them around at the borders.  
     *  	  
     *  @link https://docs.godotengine.org/en/4.5/classes/class_flowcontainer.html  
     */
    class FlowContainer<Map extends NodePathMap = any> extends Container<Map> {
        constructor(identifier?: any)
        /** Returns the current line count. */
        get_line_count(): int64
        
        /** The alignment of the container's children (must be one of [constant ALIGNMENT_BEGIN], [constant ALIGNMENT_CENTER], or [constant ALIGNMENT_END]). */
        get alignment(): int64
        set alignment(value: int64)
        
        /** The wrap behavior of the last, partially filled row or column (must be one of [constant LAST_WRAP_ALIGNMENT_INHERIT], [constant LAST_WRAP_ALIGNMENT_BEGIN], [constant LAST_WRAP_ALIGNMENT_CENTER], or [constant LAST_WRAP_ALIGNMENT_END]). */
        get last_wrap_alignment(): int64
        set last_wrap_alignment(value: int64)
        
        /** If `true`, the [FlowContainer] will arrange its children vertically, rather than horizontally.  
         *  Can't be changed when using [HFlowContainer] and [VFlowContainer].  
         */
        get vertical(): boolean
        set vertical(value: boolean)
        
        /** If `true`, reverses fill direction. Horizontal [FlowContainer]s will fill rows bottom to top, vertical [FlowContainer]s will fill columns right to left.  
         *  When using a vertical [FlowContainer] with a right to left [member Control.layout_direction], columns will fill left to right instead.  
         */
        get reverse_fill(): boolean
        set reverse_fill(value: boolean)
        /** @deprecated Internal use. Does not exist at runtime. */
        __godotNameMap: __NameMapFlowContainer;
    }
    /** @deprecated Internal use. Does not exist at runtime. */
    interface __NameMapFogMaterial extends __NameMapMaterial {
    }
    /** A material that controls how volumetric fog is rendered, to be assigned to a [FogVolume].  
     *  	  
     *  @link https://docs.godotengine.org/en/4.5/classes/class_fogmaterial.html  
     */
    class FogMaterial extends Material {
        constructor(identifier?: any)
        /** The density of the [FogVolume]. Denser objects are more opaque, but may suffer from under-sampling artifacts that look like stripes. Negative values can be used to subtract fog from other [FogVolume]s or global volumetric fog.  
         *      
         *  **Note:** Due to limited precision, [member density] values between `-0.001` and `0.001` (exclusive) act like `0.0`. This does not apply to [member Environment.volumetric_fog_density].  
         */
        get density(): float64
        set density(value: float64)
        
        /** The single-scattering [Color] of the [FogVolume]. Internally, [member albedo] is converted into single-scattering, which is additively blended with other [FogVolume]s and the [member Environment.volumetric_fog_albedo]. */
        get albedo(): Color
        set albedo(value: Color)
        
        /** The [Color] of the light emitted by the [FogVolume]. Emitted light will not cast light or shadows on other objects, but can be useful for modulating the [Color] of the [FogVolume] independently from light sources. */
        get emission(): Color
        set emission(value: Color)
        
        /** The rate by which the height-based fog decreases in density as height increases in world space. A high falloff will result in a sharp transition, while a low falloff will result in a smoother transition. A value of `0.0` results in uniform-density fog. The height threshold is determined by the height of the associated [FogVolume]. */
        get height_falloff(): float64
        set height_falloff(value: float64)
        
        /** The hardness of the edges of the [FogVolume]. A higher value will result in softer edges, while a lower value will result in harder edges. */
        get edge_fade(): float64
        set edge_fade(value: float64)
        
        /** The 3D texture that is used to scale the [member density] of the [FogVolume]. This can be used to vary fog density within the [FogVolume] with any kind of static pattern. For animated effects, consider using a custom [url=https://docs.godotengine.org/en/4.5/tutorials/shaders/shader_reference/fog_shader.html]fog shader[/url]. */
        get density_texture(): null | Texture3D
        set density_texture(value: null | Texture3D)
        /** @deprecated Internal use. Does not exist at runtime. */
        __godotNameMap: __NameMapFogMaterial;
    }
    /** @deprecated Internal use. Does not exist at runtime. */
    interface __NameMapFogVolume extends __NameMapVisualInstance3D {
    }
    /** A region that contributes to the default volumetric fog from the world environment.  
     *  	  
     *  @link https://docs.godotengine.org/en/4.5/classes/class_fogvolume.html  
     */
    class FogVolume<Map extends NodePathMap = any> extends VisualInstance3D<Map> {
        constructor(identifier?: any)
        /** The size of the [FogVolume] when [member shape] is [constant RenderingServer.FOG_VOLUME_SHAPE_ELLIPSOID], [constant RenderingServer.FOG_VOLUME_SHAPE_CONE], [constant RenderingServer.FOG_VOLUME_SHAPE_CYLINDER] or [constant RenderingServer.FOG_VOLUME_SHAPE_BOX].  
         *      
         *  **Note:** Thin fog volumes may appear to flicker when the camera moves or rotates. This can be alleviated by increasing [member ProjectSettings.rendering/environment/volumetric_fog/volume_depth] (at a performance cost) or by decreasing [member Environment.volumetric_fog_length] (at no performance cost, but at the cost of lower fog range). Alternatively, the [FogVolume] can be made thicker and use a lower density in the [member material].  
         *      
         *  **Note:** If [member shape] is [constant RenderingServer.FOG_VOLUME_SHAPE_CONE] or [constant RenderingServer.FOG_VOLUME_SHAPE_CYLINDER], the cone/cylinder will be adjusted to fit within the size. Non-uniform scaling of cone/cylinder shapes via the [member size] property is not supported, but you can scale the [FogVolume] node instead.  
         */
        get size(): Vector3
        set size(value: Vector3)
        
        /** The shape of the [FogVolume]. This can be set to either [constant RenderingServer.FOG_VOLUME_SHAPE_ELLIPSOID], [constant RenderingServer.FOG_VOLUME_SHAPE_CONE], [constant RenderingServer.FOG_VOLUME_SHAPE_CYLINDER], [constant RenderingServer.FOG_VOLUME_SHAPE_BOX] or [constant RenderingServer.FOG_VOLUME_SHAPE_WORLD]. */
        get shape(): int64
        set shape(value: int64)
        
        /** The [Material] used by the [FogVolume]. Can be either a built-in [FogMaterial] or a custom [ShaderMaterial]. */
        get material(): null | FogMaterial | ShaderMaterial
        set material(value: null | FogMaterial | ShaderMaterial)
        /** @deprecated Internal use. Does not exist at runtime. */
        __godotNameMap: __NameMapFogVolume;
    }
    namespace FoldableContainer {
        enum TitlePosition {
            /** Makes the title appear at the top of the container. */
            POSITION_TOP = 0,
            
            /** Makes the title appear at the bottom of the container. Also makes all StyleBoxes flipped vertically. */
            POSITION_BOTTOM = 1,
        }
    }
    /** @deprecated Internal use. Does not exist at runtime. */
    interface __NameMapFoldableContainer extends __NameMapContainer {
    }
    /** A container that can be expanded/collapsed.  
     *  	  
     *  @link https://docs.godotengine.org/en/4.5/classes/class_foldablecontainer.html  
     */
    class FoldableContainer<Map extends NodePathMap = any> extends Container<Map> {
        constructor(identifier?: any)
        /** Folds the container and emits [signal folding_changed]. */
        fold(): void
        
        /** Expands the container and emits [signal folding_changed]. */
        expand(): void
        
        /** Adds a [Control] that will be placed next to the container's title, obscuring the clickable area. Prime usage is adding [Button] nodes, but it can be any [Control].  
         *  The control will be added as a child of this container and removed from previous parent if necessary. The controls will be placed aligned to the right, with the first added control being the leftmost one.  
         */
        add_title_bar_control(control: Control): void
        
        /** Removes a [Control] added with [method add_title_bar_control]. The node is not freed automatically, you need to use [method Node.queue_free]. */
        remove_title_bar_control(control: Control): void
        
        /** If `true`, the container will becomes folded and will hide all its children. */
        get folded(): boolean
        set folded(value: boolean)
        
        /** The container's title text. */
        get title(): string
        set title(value: string)
        
        /** Title's horizontal text alignment. */
        get title_alignment(): int64
        set title_alignment(value: int64)
        
        /** Title's position. */
        get title_position(): int64
        set title_position(value: int64)
        
        /** Defines the behavior of the title when the text is longer than the available space. */
        get title_text_overrun_behavior(): int64
        set title_text_overrun_behavior(value: int64)
        
        /** The [FoldableGroup] associated with the container. When multiple [FoldableContainer] nodes share the same group, only one of them is allowed to be unfolded. */
        get foldable_group(): null | FoldableGroup
        set foldable_group(value: null | FoldableGroup)
        
        /** Title text writing direction. */
        get title_text_direction(): int64
        set title_text_direction(value: int64)
        
        /** Language code used for text shaping algorithms. If left empty, current locale is used instead. */
        get language(): string
        set language(value: string)
        
        /** Emitted when the container is folded/expanded. */
        readonly folding_changed: Signal<(is_folded: boolean) => void>
        /** @deprecated Internal use. Does not exist at runtime. */
        __godotNameMap: __NameMapFoldableContainer;
    }
    /** @deprecated Internal use. Does not exist at runtime. */
    interface __NameMapFoldableGroup extends __NameMapResource {
    }
    /** A group of foldable containers that doesn't allow more than one container to be expanded at a time.  
     *  	  
     *  @link https://docs.godotengine.org/en/4.5/classes/class_foldablegroup.html  
     */
    class FoldableGroup extends Resource {
        constructor(identifier?: any)
        /** Returns the current expanded container. */
        get_expanded_container(): null | FoldableContainer
        
        /** Returns an [Array] of [FoldableContainer]s that have this as their FoldableGroup (see [member FoldableContainer.foldable_group]). This is equivalent to [ButtonGroup] but for FoldableContainers. */
        get_containers(): GArray<FoldableContainer>
        
        /** If `true`, it is possible to fold all containers in this FoldableGroup. */
        get allow_folding_all(): boolean
        set allow_folding_all(value: boolean)
        
        /** Emitted when one of the containers of the group is expanded. */
        readonly expanded: Signal<(container: FoldableContainer) => void>
        /** @deprecated Internal use. Does not exist at runtime. */
        __godotNameMap: __NameMapFoldableGroup;
    }
    /** @deprecated Internal use. Does not exist at runtime. */
    interface __NameMapFont extends __NameMapResource {
    }
    /** Abstract base class for fonts and font variations.  
     *  	  
     *  @link https://docs.godotengine.org/en/4.5/classes/class_font.html  
     */
    class Font extends Resource {
        constructor(identifier?: any)
        /** Returns [TextServer] RID of the font cache for specific variation. */
        find_variation(variation_coordinates: GDictionary, face_index?: int64 /* = 0 */, strength?: float64 /* = 0 */, transform?: Transform2D /* = new Transform2D() */, spacing_top?: int64 /* = 0 */, spacing_bottom?: int64 /* = 0 */, spacing_space?: int64 /* = 0 */, spacing_glyph?: int64 /* = 0 */, baseline_offset?: float64 /* = 0 */): RID
        
        /** Returns [Array] of valid [Font] [RID]s, which can be passed to the [TextServer] methods. */
        get_rids(): GArray<RID>
        
        /** Returns the total average font height (ascent plus descent) in pixels.  
         *      
         *  **Note:** Real height of the string is context-dependent and can be significantly different from the value returned by this function. Use it only as rough estimate (e.g. as the height of empty line).  
         */
        get_height(font_size?: int64 /* = 16 */): float64
        
        /** Returns the average font ascent (number of pixels above the baseline).  
         *      
         *  **Note:** Real ascent of the string is context-dependent and can be significantly different from the value returned by this function. Use it only as rough estimate (e.g. as the ascent of empty line).  
         */
        get_ascent(font_size?: int64 /* = 16 */): float64
        
        /** Returns the average font descent (number of pixels below the baseline).  
         *      
         *  **Note:** Real descent of the string is context-dependent and can be significantly different from the value returned by this function. Use it only as rough estimate (e.g. as the descent of empty line).  
         */
        get_descent(font_size?: int64 /* = 16 */): float64
        
        /** Returns average pixel offset of the underline below the baseline.  
         *      
         *  **Note:** Real underline position of the string is context-dependent and can be significantly different from the value returned by this function. Use it only as rough estimate.  
         */
        get_underline_position(font_size?: int64 /* = 16 */): float64
        
        /** Returns average thickness of the underline.  
         *      
         *  **Note:** Real underline thickness of the string is context-dependent and can be significantly different from the value returned by this function. Use it only as rough estimate.  
         */
        get_underline_thickness(font_size?: int64 /* = 16 */): float64
        
        /** Returns font family name. */
        get_font_name(): string
        
        /** Returns font style name. */
        get_font_style_name(): string
        
        /** Returns [Dictionary] with OpenType font name strings (localized font names, version, description, license information, sample text, etc.). */
        get_ot_name_strings(): GDictionary
        
        /** Returns font style flags. */
        get_font_style(): TextServer.FontStyle
        
        /** Returns weight (boldness) of the font. A value in the `100...999` range, normal font weight is `400`, bold font weight is `700`. */
        get_font_weight(): int64
        
        /** Returns font stretch amount, compared to a normal width. A percentage value between `50%` and `200%`. */
        get_font_stretch(): int64
        
        /** Returns the amount of spacing for the given [param spacing] type. */
        get_spacing(spacing: TextServer.SpacingType): int64
        
        /** Returns a set of OpenType feature tags. More info: [url=https://docs.microsoft.com/en-us/typography/opentype/spec/featuretags]OpenType feature tags[/url]. */
        get_opentype_features(): GDictionary
        
        /** Sets LRU cache capacity for `draw_*` methods. */
        set_cache_capacity(single_line: int64, multi_line: int64): void
        
        /** Returns the size of a bounding box of a single-line string, taking kerning, advance and subpixel positioning into account. See also [method get_multiline_string_size] and [method draw_string].  
         *  For example, to get the string size as displayed by a single-line Label, use:  
         *    
         *      
         *  **Note:** Since kerning, advance and subpixel positioning are taken into account by [method get_string_size], using separate [method get_string_size] calls on substrings of a string then adding the results together will return a different result compared to using a single [method get_string_size] call on the full string.  
         *      
         *  **Note:** Real height of the string is context-dependent and can be significantly different from the value returned by [method get_height].  
         */
        get_string_size(text: string, alignment?: HorizontalAlignment /* = 0 */, width?: float64 /* = -1 */, font_size?: int64 /* = 16 */, justification_flags?: TextServer.JustificationFlag /* = 3 */, direction?: TextServer.Direction /* = 0 */, orientation?: TextServer.Orientation /* = 0 */): Vector2
        
        /** Returns the size of a bounding box of a string broken into the lines, taking kerning and advance into account.  
         *  See also [method draw_multiline_string].  
         */
        get_multiline_string_size(text: string, alignment?: HorizontalAlignment /* = 0 */, width?: float64 /* = -1 */, font_size?: int64 /* = 16 */, max_lines?: int64 /* = -1 */, brk_flags?: TextServer.LineBreakFlag /* = 3 */, justification_flags?: TextServer.JustificationFlag /* = 3 */, direction?: TextServer.Direction /* = 0 */, orientation?: TextServer.Orientation /* = 0 */): Vector2
        
        /** Draw [param text] into a canvas item using the font, at a given position, with [param modulate] color, optionally clipping the width and aligning horizontally. [param pos] specifies the baseline, not the top. To draw from the top,  *ascent*  must be added to the Y axis. If [param oversampling] is greater than zero, it is used as font oversampling factor, otherwise viewport oversampling settings are used.  
         *  See also [method CanvasItem.draw_string].  
         */
        draw_string(canvas_item: RID, pos: Vector2, text: string, alignment?: HorizontalAlignment /* = 0 */, width?: float64 /* = -1 */, font_size?: int64 /* = 16 */, modulate?: Color /* = new Color(1, 1, 1, 1) */, justification_flags?: TextServer.JustificationFlag /* = 3 */, direction?: TextServer.Direction /* = 0 */, orientation?: TextServer.Orientation /* = 0 */, oversampling?: float64 /* = 0 */): void
        
        /** Breaks [param text] into lines using rules specified by [param brk_flags] and draws it into a canvas item using the font, at a given position, with [param modulate] color, optionally clipping the width and aligning horizontally. [param pos] specifies the baseline of the first line, not the top. To draw from the top,  *ascent*  must be added to the Y axis. If [param oversampling] is greater than zero, it is used as font oversampling factor, otherwise viewport oversampling settings are used.  
         *  See also [method CanvasItem.draw_multiline_string].  
         */
        draw_multiline_string(canvas_item: RID, pos: Vector2, text: string, alignment?: HorizontalAlignment /* = 0 */, width?: float64 /* = -1 */, font_size?: int64 /* = 16 */, max_lines?: int64 /* = -1 */, modulate?: Color /* = new Color(1, 1, 1, 1) */, brk_flags?: TextServer.LineBreakFlag /* = 3 */, justification_flags?: TextServer.JustificationFlag /* = 3 */, direction?: TextServer.Direction /* = 0 */, orientation?: TextServer.Orientation /* = 0 */, oversampling?: float64 /* = 0 */): void
        
        /** Draw [param text] outline into a canvas item using the font, at a given position, with [param modulate] color and [param size] outline size, optionally clipping the width and aligning horizontally. [param pos] specifies the baseline, not the top. To draw from the top,  *ascent*  must be added to the Y axis. If [param oversampling] is greater than zero, it is used as font oversampling factor, otherwise viewport oversampling settings are used.  
         *  See also [method CanvasItem.draw_string_outline].  
         */
        draw_string_outline(canvas_item: RID, pos: Vector2, text: string, alignment?: HorizontalAlignment /* = 0 */, width?: float64 /* = -1 */, font_size?: int64 /* = 16 */, size?: int64 /* = 1 */, modulate?: Color /* = new Color(1, 1, 1, 1) */, justification_flags?: TextServer.JustificationFlag /* = 3 */, direction?: TextServer.Direction /* = 0 */, orientation?: TextServer.Orientation /* = 0 */, oversampling?: float64 /* = 0 */): void
        
        /** Breaks [param text] to the lines using rules specified by [param brk_flags] and draws text outline into a canvas item using the font, at a given position, with [param modulate] color and [param size] outline size, optionally clipping the width and aligning horizontally. [param pos] specifies the baseline of the first line, not the top. To draw from the top,  *ascent*  must be added to the Y axis. If [param oversampling] is greater than zero, it is used as font oversampling factor, otherwise viewport oversampling settings are used.  
         *  See also [method CanvasItem.draw_multiline_string_outline].  
         */
        draw_multiline_string_outline(canvas_item: RID, pos: Vector2, text: string, alignment?: HorizontalAlignment /* = 0 */, width?: float64 /* = -1 */, font_size?: int64 /* = 16 */, max_lines?: int64 /* = -1 */, size?: int64 /* = 1 */, modulate?: Color /* = new Color(1, 1, 1, 1) */, brk_flags?: TextServer.LineBreakFlag /* = 3 */, justification_flags?: TextServer.JustificationFlag /* = 3 */, direction?: TextServer.Direction /* = 0 */, orientation?: TextServer.Orientation /* = 0 */, oversampling?: float64 /* = 0 */): void
        
        /** Returns the size of a character. Does not take kerning into account.  
         *      
         *  **Note:** Do not use this function to calculate width of the string character by character, use [method get_string_size] or [TextLine] instead. The height returned is the font height (see also [method get_height]) and has no relation to the glyph height.  
         */
        get_char_size(char: int64, font_size: int64): Vector2
        
        /** Draw a single Unicode character [param char] into a canvas item using the font, at a given position, with [param modulate] color. [param pos] specifies the baseline, not the top. To draw from the top,  *ascent*  must be added to the Y axis. If [param oversampling] is greater than zero, it is used as font oversampling factor, otherwise viewport oversampling settings are used.  
         *      
         *  **Note:** Do not use this function to draw strings character by character, use [method draw_string] or [TextLine] instead.  
         */
        draw_char(canvas_item: RID, pos: Vector2, char: int64, font_size: int64, modulate?: Color /* = new Color(1, 1, 1, 1) */, oversampling?: float64 /* = 0 */): float64
        
        /** Draw a single Unicode character [param char] outline into a canvas item using the font, at a given position, with [param modulate] color and [param size] outline size. [param pos] specifies the baseline, not the top. To draw from the top,  *ascent*  must be added to the Y axis. If [param oversampling] is greater than zero, it is used as font oversampling factor, otherwise viewport oversampling settings are used.  
         *      
         *  **Note:** Do not use this function to draw strings character by character, use [method draw_string] or [TextLine] instead.  
         */
        draw_char_outline(canvas_item: RID, pos: Vector2, char: int64, font_size: int64, size?: int64 /* = -1 */, modulate?: Color /* = new Color(1, 1, 1, 1) */, oversampling?: float64 /* = 0 */): float64
        
        /** Returns `true` if a Unicode [param char] is available in the font. */
        has_char(char: int64): boolean
        
        /** Returns a string containing all the characters available in the font.  
         *  If a given character is included in more than one font data source, it appears only once in the returned string.  
         */
        get_supported_chars(): string
        
        /** Returns `true`, if font supports given language ([url=https://en.wikipedia.org/wiki/ISO_639-1]ISO 639[/url] code). */
        is_language_supported(language: string): boolean
        
        /** Returns `true`, if font supports given script ([url=https://en.wikipedia.org/wiki/ISO_15924]ISO 15924[/url] code). */
        is_script_supported(script: string): boolean
        
        /** Returns list of OpenType features supported by font. */
        get_supported_feature_list(): GDictionary
        
        /** Returns list of supported [url=https://docs.microsoft.com/en-us/typography/opentype/spec/dvaraxisreg]variation coordinates[/url], each coordinate is returned as `tag: Vector3i(min_value,max_value,default_value)`.  
         *  Font variations allow for continuous change of glyph characteristics along some given design axis, such as weight, width or slant.  
         *  To print available variation axes of a variable font:  
         *    
         *      
         *  **Note:** To set and get variation coordinates of a [FontVariation], use [member FontVariation.variation_opentype].  
         */
        get_supported_variation_list(): GDictionary
        
        /** Returns number of faces in the TrueType / OpenType collection. */
        get_face_count(): int64
        
        /** Array of fallback [Font]s to use as a substitute if a glyph is not found in this current [Font].  
         *  If this array is empty in a [FontVariation], the [member FontVariation.base_font]'s fallbacks are used instead.  
         */
        get fallbacks(): GArray<Font>
        set fallbacks(value: GArray<Font>)
        /** @deprecated Internal use. Does not exist at runtime. */
        __godotNameMap: __NameMapFont;
    }
    /** @deprecated Internal use. Does not exist at runtime. */
    interface __NameMapFontFile extends __NameMapFont {
    }
    /** Holds font source data and prerendered glyph cache, imported from a dynamic or a bitmap font.  
     *  	  
     *  @link https://docs.godotengine.org/en/4.5/classes/class_fontfile.html  
     */
    class FontFile extends Font {
        constructor(identifier?: any)
        /** Loads an AngelCode BMFont (.fnt, .font) bitmap font from file [param path].  
         *  **Warning:** This method should only be used in the editor or in cases when you need to load external fonts at run-time, such as fonts located at the `user://` directory.  
         */
        load_bitmap_font(path: string): Error
        
        /** Loads a TrueType (.ttf), OpenType (.otf), WOFF (.woff), WOFF2 (.woff2) or Type 1 (.pfb, .pfm) dynamic font from file [param path].  
         *  **Warning:** This method should only be used in the editor or in cases when you need to load external fonts at run-time, such as fonts located at the `user://` directory.  
         */
        load_dynamic_font(path: string): Error
        
        /** Returns number of the font cache entries. */
        get_cache_count(): int64
        
        /** Removes all font cache entries. */
        clear_cache(): void
        
        /** Removes specified font cache entry. */
        remove_cache(cache_index: int64): void
        
        /** Returns list of the font sizes in the cache. Each size is [Vector2i] with font size and outline size. */
        get_size_cache_list(cache_index: int64): GArray<Vector2i>
        
        /** Removes all font sizes from the cache entry. */
        clear_size_cache(cache_index: int64): void
        
        /** Removes specified font size from the cache entry. */
        remove_size_cache(cache_index: int64, size: Vector2i): void
        
        /** Sets variation coordinates for the specified font cache entry. See [method Font.get_supported_variation_list] for more info. */
        set_variation_coordinates(cache_index: int64, variation_coordinates: GDictionary): void
        
        /** Returns variation coordinates for the specified font cache entry. See [method Font.get_supported_variation_list] for more info. */
        get_variation_coordinates(cache_index: int64): GDictionary
        
        /** Sets embolden strength, if is not equal to zero, emboldens the font outlines. Negative values reduce the outline thickness. */
        set_embolden(cache_index: int64, strength: float64): void
        
        /** Returns embolden strength, if is not equal to zero, emboldens the font outlines. Negative values reduce the outline thickness. */
        get_embolden(cache_index: int64): float64
        
        /** Sets 2D transform, applied to the font outlines, can be used for slanting, flipping, and rotating glyphs. */
        set_transform(cache_index: int64, transform: Transform2D): void
        
        /** Returns 2D transform, applied to the font outlines, can be used for slanting, flipping and rotating glyphs. */
        get_transform(cache_index: int64): Transform2D
        
        /** Sets the spacing for [param spacing] to [param value] in pixels (not relative to the font size). */
        set_extra_spacing(cache_index: int64, spacing: TextServer.SpacingType, value: int64): void
        
        /** Returns spacing for [param spacing] in pixels (not relative to the font size). */
        get_extra_spacing(cache_index: int64, spacing: TextServer.SpacingType): int64
        
        /** Sets extra baseline offset (as a fraction of font height). */
        set_extra_baseline_offset(cache_index: int64, baseline_offset: float64): void
        
        /** Returns extra baseline offset (as a fraction of font height). */
        get_extra_baseline_offset(cache_index: int64): float64
        
        /** Sets an active face index in the TrueType / OpenType collection. */
        set_face_index(cache_index: int64, face_index: int64): void
        
        /** Returns an active face index in the TrueType / OpenType collection. */
        get_face_index(cache_index: int64): int64
        
        /** Sets the font ascent (number of pixels above the baseline). */
        set_cache_ascent(cache_index: int64, size: int64, ascent: float64): void
        
        /** Returns the font ascent (number of pixels above the baseline). */
        get_cache_ascent(cache_index: int64, size: int64): float64
        
        /** Sets the font descent (number of pixels below the baseline). */
        set_cache_descent(cache_index: int64, size: int64, descent: float64): void
        
        /** Returns the font descent (number of pixels below the baseline). */
        get_cache_descent(cache_index: int64, size: int64): float64
        
        /** Sets pixel offset of the underline below the baseline. */
        set_cache_underline_position(cache_index: int64, size: int64, underline_position: float64): void
        
        /** Returns pixel offset of the underline below the baseline. */
        get_cache_underline_position(cache_index: int64, size: int64): float64
        
        /** Sets thickness of the underline in pixels. */
        set_cache_underline_thickness(cache_index: int64, size: int64, underline_thickness: float64): void
        
        /** Returns thickness of the underline in pixels. */
        get_cache_underline_thickness(cache_index: int64, size: int64): float64
        
        /** Sets scaling factor of the color bitmap font. */
        set_cache_scale(cache_index: int64, size: int64, scale: float64): void
        
        /** Returns scaling factor of the color bitmap font. */
        get_cache_scale(cache_index: int64, size: int64): float64
        
        /** Returns number of textures used by font cache entry. */
        get_texture_count(cache_index: int64, size: Vector2i): int64
        
        /** Removes all textures from font cache entry.  
         *      
         *  **Note:** This function will not remove glyphs associated with the texture, use [method remove_glyph] to remove them manually.  
         */
        clear_textures(cache_index: int64, size: Vector2i): void
        
        /** Removes specified texture from the cache entry.  
         *      
         *  **Note:** This function will not remove glyphs associated with the texture. Remove them manually using [method remove_glyph].  
         */
        remove_texture(cache_index: int64, size: Vector2i, texture_index: int64): void
        
        /** Sets font cache texture image. */
        set_texture_image(cache_index: int64, size: Vector2i, texture_index: int64, image: Image): void
        
        /** Returns a copy of the font cache texture image. */
        get_texture_image(cache_index: int64, size: Vector2i, texture_index: int64): null | Image
        
        /** Sets array containing glyph packing data. */
        set_texture_offsets(cache_index: int64, size: Vector2i, texture_index: int64, offset: PackedInt32Array | int32[]): void
        
        /** Returns a copy of the array containing glyph packing data. */
        get_texture_offsets(cache_index: int64, size: Vector2i, texture_index: int64): PackedInt32Array
        
        /** Returns list of rendered glyphs in the cache entry. */
        get_glyph_list(cache_index: int64, size: Vector2i): PackedInt32Array
        
        /** Removes all rendered glyph information from the cache entry.  
         *      
         *  **Note:** This function will not remove textures associated with the glyphs, use [method remove_texture] to remove them manually.  
         */
        clear_glyphs(cache_index: int64, size: Vector2i): void
        
        /** Removes specified rendered glyph information from the cache entry.  
         *      
         *  **Note:** This function will not remove textures associated with the glyphs, use [method remove_texture] to remove them manually.  
         */
        remove_glyph(cache_index: int64, size: Vector2i, glyph: int64): void
        
        /** Sets glyph advance (offset of the next glyph).  
         *      
         *  **Note:** Advance for glyphs outlines is the same as the base glyph advance and is not saved.  
         */
        set_glyph_advance(cache_index: int64, size: int64, glyph: int64, advance: Vector2): void
        
        /** Returns glyph advance (offset of the next glyph).  
         *      
         *  **Note:** Advance for glyphs outlines is the same as the base glyph advance and is not saved.  
         */
        get_glyph_advance(cache_index: int64, size: int64, glyph: int64): Vector2
        
        /** Sets glyph offset from the baseline. */
        set_glyph_offset(cache_index: int64, size: Vector2i, glyph: int64, offset: Vector2): void
        
        /** Returns glyph offset from the baseline. */
        get_glyph_offset(cache_index: int64, size: Vector2i, glyph: int64): Vector2
        
        /** Sets glyph size. */
        set_glyph_size(cache_index: int64, size: Vector2i, glyph: int64, gl_size: Vector2): void
        
        /** Returns glyph size. */
        get_glyph_size(cache_index: int64, size: Vector2i, glyph: int64): Vector2
        
        /** Sets rectangle in the cache texture containing the glyph. */
        set_glyph_uv_rect(cache_index: int64, size: Vector2i, glyph: int64, uv_rect: Rect2): void
        
        /** Returns rectangle in the cache texture containing the glyph. */
        get_glyph_uv_rect(cache_index: int64, size: Vector2i, glyph: int64): Rect2
        
        /** Sets index of the cache texture containing the glyph. */
        set_glyph_texture_idx(cache_index: int64, size: Vector2i, glyph: int64, texture_idx: int64): void
        
        /** Returns index of the cache texture containing the glyph. */
        get_glyph_texture_idx(cache_index: int64, size: Vector2i, glyph: int64): int64
        
        /** Returns list of the kerning overrides. */
        get_kerning_list(cache_index: int64, size: int64): GArray<Vector2i>
        
        /** Removes all kerning overrides. */
        clear_kerning_map(cache_index: int64, size: int64): void
        
        /** Removes kerning override for the pair of glyphs. */
        remove_kerning(cache_index: int64, size: int64, glyph_pair: Vector2i): void
        
        /** Sets kerning for the pair of glyphs. */
        set_kerning(cache_index: int64, size: int64, glyph_pair: Vector2i, kerning: Vector2): void
        
        /** Returns kerning for the pair of glyphs. */
        get_kerning(cache_index: int64, size: int64, glyph_pair: Vector2i): Vector2
        
        /** Renders the range of characters to the font cache texture. */
        render_range(cache_index: int64, size: Vector2i, start: int64, end: int64): void
        
        /** Renders specified glyph to the font cache texture. */
        render_glyph(cache_index: int64, size: Vector2i, index: int64): void
        
        /** Adds override for [method Font.is_language_supported]. */
        set_language_support_override(language: string, supported: boolean): void
        
        /** Returns `true` if support override is enabled for the [param language]. */
        get_language_support_override(language: string): boolean
        
        /** Remove language support override. */
        remove_language_support_override(language: string): void
        
        /** Returns list of language support overrides. */
        get_language_support_overrides(): PackedStringArray
        
        /** Adds override for [method Font.is_script_supported]. */
        set_script_support_override(script: string, supported: boolean): void
        
        /** Returns `true` if support override is enabled for the [param script]. */
        get_script_support_override(script: string): boolean
        
        /** Removes script support override. */
        remove_script_support_override(script: string): void
        
        /** Returns list of script support overrides. */
        get_script_support_overrides(): PackedStringArray
        
        /** Returns the glyph index of a [param char], optionally modified by the [param variation_selector]. */
        get_glyph_index(size: int64, char: int64, variation_selector: int64): int64
        
        /** Returns character code associated with [param glyph_index], or `0` if [param glyph_index] is invalid. See [method get_glyph_index]. */
        get_char_from_glyph_index(size: int64, glyph_index: int64): int64
        
        /** Contents of the dynamic font source file. */
        get data(): PackedByteArray
        set data(value: PackedByteArray | byte[] | ArrayBuffer)
        
        /** If set to `true`, generate mipmaps for the font textures. */
        get generate_mipmaps(): boolean
        set generate_mipmaps(value: boolean)
        
        /** If set to `true`, embedded font bitmap loading is disabled (bitmap-only and color fonts ignore this property). */
        get disable_embedded_bitmaps(): boolean
        set disable_embedded_bitmaps(value: boolean)
        
        /** Font anti-aliasing mode. */
        get antialiasing(): int64
        set antialiasing(value: int64)
        
        /** Font family name. */
        get font_name(): string
        set font_name(value: string)
        
        /** Font style name. */
        get style_name(): string
        set style_name(value: string)
        
        /** Font style flags. */
        get font_style(): int64
        set font_style(value: int64)
        
        /** Weight (boldness) of the font. A value in the `100...999` range, normal font weight is `400`, bold font weight is `700`. */
        get font_weight(): int64
        set font_weight(value: int64)
        
        /** Font stretch amount, compared to a normal width. A percentage value between `50%` and `200%`. */
        get font_stretch(): int64
        set font_stretch(value: int64)
        
        /** Font glyph subpixel positioning mode. Subpixel positioning provides shaper text and better kerning for smaller font sizes, at the cost of higher memory usage and lower font rasterization speed. Use [constant TextServer.SUBPIXEL_POSITIONING_AUTO] to automatically enable it based on the font size. */
        get subpixel_positioning(): int64
        set subpixel_positioning(value: int64)
        
        /** If set to `true`, when aligning glyphs to the pixel boundaries rounding remainders are accumulated to ensure more uniform glyph distribution. This setting has no effect if subpixel positioning is enabled. */
        get keep_rounding_remainders(): boolean
        set keep_rounding_remainders(value: boolean)
        
        /** If set to `true`, glyphs of all sizes are rendered using single multichannel signed distance field (MSDF) generated from the dynamic font vector data. Since this approach does not rely on rasterizing the font every time its size changes, this allows for resizing the font in real-time without any performance penalty. Text will also not look grainy for [Control]s that are scaled down (or for [Label3D]s viewed from a long distance). As a downside, font hinting is not available with MSDF. The lack of font hinting may result in less crisp and less readable fonts at small sizes.  
         *      
         *  **Note:** If using font outlines, [member msdf_pixel_range] must be set to at least  *twice*  the size of the largest font outline.  
         *      
         *  **Note:** MSDF font rendering does not render glyphs with overlapping shapes correctly. Overlapping shapes are not valid per the OpenType standard, but are still commonly found in many font files, especially those converted by Google Fonts. To avoid issues with overlapping glyphs, consider downloading the font file directly from the type foundry instead of relying on Google Fonts.  
         */
        get multichannel_signed_distance_field(): boolean
        set multichannel_signed_distance_field(value: boolean)
        
        /** The width of the range around the shape between the minimum and maximum representable signed distance. If using font outlines, [member msdf_pixel_range] must be set to at least  *twice*  the size of the largest font outline. The default [member msdf_pixel_range] value of `16` allows outline sizes up to `8` to look correct. */
        get msdf_pixel_range(): int64
        set msdf_pixel_range(value: int64)
        
        /** Source font size used to generate MSDF textures. Higher values allow for more precision, but are slower to render and require more memory. Only increase this value if you notice a visible lack of precision in glyph rendering. */
        get msdf_size(): int64
        set msdf_size(value: int64)
        
        /** If set to `true`, system fonts can be automatically used as fallbacks. */
        get allow_system_fallback(): boolean
        set allow_system_fallback(value: boolean)
        
        /** If set to `true`, auto-hinting is supported and preferred over font built-in hinting. Used by dynamic fonts only (MSDF fonts don't support hinting). */
        get force_autohinter(): boolean
        set force_autohinter(value: boolean)
        
        /** If set to `true`, color modulation is applied when drawing colored glyphs, otherwise it's applied to the monochrome glyphs only. */
        get modulate_color_glyphs(): boolean
        set modulate_color_glyphs(value: boolean)
        
        /** Font hinting mode. Used by dynamic fonts only. */
        get hinting(): int64
        set hinting(value: int64)
        
        /** Font size, used only for the bitmap fonts. */
        get fixed_size(): int64
        set fixed_size(value: int64)
        
        /** Scaling mode, used only for the bitmap fonts with [member fixed_size] greater than zero. */
        get fixed_size_scale_mode(): int64
        set fixed_size_scale_mode(value: int64)
        
        /** Font OpenType feature set override. */
        get opentype_feature_overrides(): GDictionary
        set opentype_feature_overrides(value: GDictionary)
        
        /** If set to a positive value, overrides the oversampling factor of the viewport this font is used in. See [member Viewport.oversampling]. This value doesn't override the [code skip-lint]oversampling` parameter of [code skip-lint]draw_*` methods. */
        get oversampling(): float64
        set oversampling(value: float64)
        /** @deprecated Internal use. Does not exist at runtime. */
        __godotNameMap: __NameMapFontFile;
    }
    /** @deprecated Internal use. Does not exist at runtime. */
    interface __NameMapFontVariation extends __NameMapFont {
    }
    /** A variation of a font with additional settings.  
     *  	  
     *  @link https://docs.godotengine.org/en/4.5/classes/class_fontvariation.html  
     */
    class FontVariation extends Font {
        constructor(identifier?: any)
        /** Sets the spacing for [param spacing] to [param value] in pixels (not relative to the font size). */
        set_spacing(spacing: TextServer.SpacingType, value: int64): void
        
        /** Base font used to create a variation. If not set, default [Theme] font is used. */
        get base_font(): null | Font
        set base_font(value: null | Font)
        
        /** Font OpenType variation coordinates. More info: [url=https://docs.microsoft.com/en-us/typography/opentype/spec/dvaraxisreg]OpenType variation tags[/url].  
         *      
         *  **Note:** This [Dictionary] uses OpenType tags as keys. Variation axes can be identified both by tags ([int], e.g. `0x77678674`) and names ([String], e.g. `wght`). Some axes might be accessible by multiple names. For example, `wght` refers to the same axis as `weight`. Tags on the other hand are unique. To convert between names and tags, use [method TextServer.name_to_tag] and [method TextServer.tag_to_name].  
         *      
         *  **Note:** To get available variation axes of a font, use [method Font.get_supported_variation_list].  
         */
        get variation_opentype(): GDictionary
        set variation_opentype(value: GDictionary)
        
        /** Active face index in the TrueType / OpenType collection file. */
        get variation_face_index(): int64
        set variation_face_index(value: int64)
        
        /** If is not equal to zero, emboldens the font outlines. Negative values reduce the outline thickness.  
         *      
         *  **Note:** Emboldened fonts might have self-intersecting outlines, which will prevent MSDF fonts and [TextMesh] from working correctly.  
         */
        get variation_embolden(): float64
        set variation_embolden(value: float64)
        
        /** 2D transform, applied to the font outlines, can be used for slanting, flipping and rotating glyphs.  
         *  For example, to simulate italic typeface by slanting, apply the following transform `Transform2D(1.0, slant, 0.0, 1.0, 0.0, 0.0)`.  
         */
        get variation_transform(): Transform2D
        set variation_transform(value: Transform2D)
        
        /** A set of OpenType feature tags. More info: [url=https://docs.microsoft.com/en-us/typography/opentype/spec/featuretags]OpenType feature tags[/url]. */
        get opentype_features(): GDictionary
        set opentype_features(value: GDictionary)
        
        /** Extra spacing between graphical glyphs. */
        get spacing_glyph(): int64
        set spacing_glyph(value: int64)
        
        /** Extra width of the space glyphs. */
        get spacing_space(): int64
        set spacing_space(value: int64)
        
        /** Extra spacing at the top of the line in pixels. */
        get spacing_top(): int64
        set spacing_top(value: int64)
        
        /** Extra spacing at the bottom of the line in pixels. */
        get spacing_bottom(): int64
        set spacing_bottom(value: int64)
        
        /** Extra baseline offset (as a fraction of font height). */
        get baseline_offset(): float64
        set baseline_offset(value: float64)
        /** @deprecated Internal use. Does not exist at runtime. */
        __godotNameMap: __NameMapFontVariation;
    }
    /** @deprecated Internal use. Does not exist at runtime. */
    interface __NameMapFramebufferCacheRD extends __NameMapObject {
    }
    /** Framebuffer cache manager for Rendering Device based renderers.  
     *  	  
     *  @link https://docs.godotengine.org/en/4.5/classes/class_framebuffercacherd.html  
     */
    class FramebufferCacheRD extends Object {
        constructor(identifier?: any)
        /** Creates, or obtains a cached, framebuffer. [param textures] lists textures accessed. [param passes] defines the subpasses and texture allocation, if left empty a single pass is created and textures are allocated depending on their usage flags. [param views] defines the number of views used when rendering. */
        static get_cache_multipass(textures: GArray<RID>, passes: GArray<RDFramebufferPass>, views: int64): RID
        /** @deprecated Internal use. Does not exist at runtime. */
        __godotNameMap: __NameMapFramebufferCacheRD;
    }
    namespace GDExtension {
        enum InitializationLevel {
            /** The library is initialized at the same time as the core features of the engine. */
            INITIALIZATION_LEVEL_CORE = 0,
            
            /** The library is initialized at the same time as the engine's servers (such as [RenderingServer] or [PhysicsServer3D]). */
            INITIALIZATION_LEVEL_SERVERS = 1,
            
            /** The library is initialized at the same time as the engine's scene-related classes. */
            INITIALIZATION_LEVEL_SCENE = 2,
            
            /** The library is initialized at the same time as the engine's editor classes. Only happens when loading the GDExtension in the editor. */
            INITIALIZATION_LEVEL_EDITOR = 3,
        }
    }
    /** @deprecated Internal use. Does not exist at runtime. */
    interface __NameMapGDExtension extends __NameMapResource {
    }
    /** A native library for GDExtension.  
     *  	  
     *  @link https://docs.godotengine.org/en/4.5/classes/class_gdextension.html  
     */
    class GDExtension extends Resource {
        constructor(identifier?: any)
        /** Returns `true` if this extension's library has been opened. */
        is_library_open(): boolean
        
        /** Returns the lowest level required for this extension to be properly initialized (see the [enum InitializationLevel] enum). */
        get_minimum_library_initialization_level(): GDExtension.InitializationLevel
        /** @deprecated Internal use. Does not exist at runtime. */
        __godotNameMap: __NameMapGDExtension;
    }
    namespace GLTFAccessor {
        enum GLTFAccessorType {
            /** Accessor type "SCALAR". For the glTF object model, this can be used to map to a single float, int, or bool value, or a float array. */
            TYPE_SCALAR = 0,
            
            /** Accessor type "VEC2". For the glTF object model, this maps to "float2", represented in the glTF JSON as an array of two floats. */
            TYPE_VEC2 = 1,
            
            /** Accessor type "VEC3". For the glTF object model, this maps to "float3", represented in the glTF JSON as an array of three floats. */
            TYPE_VEC3 = 2,
            
            /** Accessor type "VEC4". For the glTF object model, this maps to "float4", represented in the glTF JSON as an array of four floats. */
            TYPE_VEC4 = 3,
            
            /** Accessor type "MAT2". For the glTF object model, this maps to "float2x2", represented in the glTF JSON as an array of four floats. */
            TYPE_MAT2 = 4,
            
            /** Accessor type "MAT3". For the glTF object model, this maps to "float3x3", represented in the glTF JSON as an array of nine floats. */
            TYPE_MAT3 = 5,
            
            /** Accessor type "MAT4". For the glTF object model, this maps to "float4x4", represented in the glTF JSON as an array of sixteen floats. */
            TYPE_MAT4 = 6,
        }
        enum GLTFComponentType {
            /** Component type "NONE". This is not a valid component type, and is used to indicate that the component type is not set. */
            COMPONENT_TYPE_NONE = 0,
            
            /** Component type "BYTE". The value is `0x1400` which comes from OpenGL. This indicates data is stored in 1-byte or 8-bit signed integers. This is a core part of the glTF specification. */
            COMPONENT_TYPE_SIGNED_BYTE = 5120,
            
            /** Component type "UNSIGNED_BYTE". The value is `0x1401` which comes from OpenGL. This indicates data is stored in 1-byte or 8-bit unsigned integers. This is a core part of the glTF specification. */
            COMPONENT_TYPE_UNSIGNED_BYTE = 5121,
            
            /** Component type "SHORT". The value is `0x1402` which comes from OpenGL. This indicates data is stored in 2-byte or 16-bit signed integers. This is a core part of the glTF specification. */
            COMPONENT_TYPE_SIGNED_SHORT = 5122,
            
            /** Component type "UNSIGNED_SHORT". The value is `0x1403` which comes from OpenGL. This indicates data is stored in 2-byte or 16-bit unsigned integers. This is a core part of the glTF specification. */
            COMPONENT_TYPE_UNSIGNED_SHORT = 5123,
            
            /** Component type "INT". The value is `0x1404` which comes from OpenGL. This indicates data is stored in 4-byte or 32-bit signed integers. This is NOT a core part of the glTF specification, and may not be supported by all glTF importers. May be used by some extensions including `KHR_interactivity`. */
            COMPONENT_TYPE_SIGNED_INT = 5124,
            
            /** Component type "UNSIGNED_INT". The value is `0x1405` which comes from OpenGL. This indicates data is stored in 4-byte or 32-bit unsigned integers. This is a core part of the glTF specification. */
            COMPONENT_TYPE_UNSIGNED_INT = 5125,
            
            /** Component type "FLOAT". The value is `0x1406` which comes from OpenGL. This indicates data is stored in 4-byte or 32-bit floating-point numbers. This is a core part of the glTF specification. */
            COMPONENT_TYPE_SINGLE_FLOAT = 5126,
            
            /** Component type "DOUBLE". The value is `0x140A` which comes from OpenGL. This indicates data is stored in 8-byte or 64-bit floating-point numbers. This is NOT a core part of the glTF specification, and may not be supported by all glTF importers. May be used by some extensions including `KHR_interactivity`. */
            COMPONENT_TYPE_DOUBLE_FLOAT = 5130,
            
            /** Component type "HALF_FLOAT". The value is `0x140B` which comes from OpenGL. This indicates data is stored in 2-byte or 16-bit floating-point numbers. This is NOT a core part of the glTF specification, and may not be supported by all glTF importers. May be used by some extensions including `KHR_interactivity`. */
            COMPONENT_TYPE_HALF_FLOAT = 5131,
            
            /** Component type "LONG". The value is `0x140E` which comes from OpenGL. This indicates data is stored in 8-byte or 64-bit signed integers. This is NOT a core part of the glTF specification, and may not be supported by all glTF importers. May be used by some extensions including `KHR_interactivity`. */
            COMPONENT_TYPE_SIGNED_LONG = 5134,
            
            /** Component type "UNSIGNED_LONG". The value is `0x140F` which comes from OpenGL. This indicates data is stored in 8-byte or 64-bit unsigned integers. This is NOT a core part of the glTF specification, and may not be supported by all glTF importers. May be used by some extensions including `KHR_interactivity`. */
            COMPONENT_TYPE_UNSIGNED_LONG = 5135,
        }
    }
    /** @deprecated Internal use. Does not exist at runtime. */
    interface __NameMapGLTFAccessor extends __NameMapResource {
    }
    /** Represents a glTF accessor.  
     *  	  
     *  @link https://docs.godotengine.org/en/4.5/classes/class_gltfaccessor.html  
     */
    class GLTFAccessor extends Resource {
        constructor(identifier?: any)
        /** The index of the buffer view this accessor is referencing. If `-1`, this accessor is not referencing any buffer view. */
        get buffer_view(): int64
        set buffer_view(value: int64)
        
        /** The offset relative to the start of the buffer view in bytes. */
        get byte_offset(): int64
        set byte_offset(value: int64)
        
        /** The glTF component type as an enum. See [enum GLTFComponentType] for possible values. Within the core glTF specification, a value of 5125 or "UNSIGNED_INT" must not be used for any accessor that is not referenced by mesh.primitive.indices. */
        get component_type(): int64
        set component_type(value: int64)
        
        /** Specifies whether integer data values are normalized before usage. */
        get normalized(): boolean
        set normalized(value: boolean)
        
        /** The number of elements referenced by this accessor. */
        get count(): int64
        set count(value: int64)
        
        /** The glTF accessor type, as an enum. */
        get accessor_type(): int64
        set accessor_type(value: int64)
        
        /** The glTF accessor type, as an [int]. Possible values are `0` for "SCALAR", `1` for "VEC2", `2` for "VEC3", `3` for "VEC4", `4` for "MAT2", `5` for "MAT3", and `6` for "MAT4". */
        get type(): int64
        set type(value: int64)
        
        /** Minimum value of each component in this accessor. */
        get min(): PackedFloat64Array
        set min(value: PackedFloat64Array | float64[])
        
        /** Maximum value of each component in this accessor. */
        get max(): PackedFloat64Array
        set max(value: PackedFloat64Array | float64[])
        
        /** Number of deviating accessor values stored in the sparse array. */
        get sparse_count(): int64
        set sparse_count(value: int64)
        
        /** The index of the buffer view with sparse indices. The referenced buffer view MUST NOT have its target or byteStride properties defined. The buffer view and the optional byteOffset MUST be aligned to the componentType byte length. */
        get sparse_indices_buffer_view(): int64
        set sparse_indices_buffer_view(value: int64)
        
        /** The offset relative to the start of the buffer view in bytes. */
        get sparse_indices_byte_offset(): int64
        set sparse_indices_byte_offset(value: int64)
        
        /** The indices component data type as an enum. Possible values are 5121 for "UNSIGNED_BYTE", 5123 for "UNSIGNED_SHORT", and 5125 for "UNSIGNED_INT". */
        get sparse_indices_component_type(): int64
        set sparse_indices_component_type(value: int64)
        
        /** The index of the bufferView with sparse values. The referenced buffer view MUST NOT have its target or byteStride properties defined. */
        get sparse_values_buffer_view(): int64
        set sparse_values_buffer_view(value: int64)
        
        /** The offset relative to the start of the bufferView in bytes. */
        get sparse_values_byte_offset(): int64
        set sparse_values_byte_offset(value: int64)
        /** @deprecated Internal use. Does not exist at runtime. */
        __godotNameMap: __NameMapGLTFAccessor;
    }
    /** @deprecated Internal use. Does not exist at runtime. */
    interface __NameMapGLTFAnimation extends __NameMapResource {
    }
    /** @link https://docs.godotengine.org/en/4.5/classes/class_gltfanimation.html */
    class GLTFAnimation extends Resource {
        constructor(identifier?: any)
        /** Gets additional arbitrary data in this [GLTFAnimation] instance. This can be used to keep per-node state data in [GLTFDocumentExtension] classes, which is important because they are stateless.  
         *  The argument should be the [GLTFDocumentExtension] name (does not have to match the extension name in the glTF file), and the return value can be anything you set. If nothing was set, the return value is `null`.  
         */
        get_additional_data(extension_name: StringName): any
        
        /** Sets additional arbitrary data in this [GLTFAnimation] instance. This can be used to keep per-node state data in [GLTFDocumentExtension] classes, which is important because they are stateless.  
         *  The first argument should be the [GLTFDocumentExtension] name (does not have to match the extension name in the glTF file), and the second argument can be anything you want.  
         */
        set_additional_data(extension_name: StringName, additional_data: any): void
        
        /** The original name of the animation. */
        get original_name(): string
        set original_name(value: string)
        get loop(): boolean
        set loop(value: boolean)
        /** @deprecated Internal use. Does not exist at runtime. */
        __godotNameMap: __NameMapGLTFAnimation;
    }
    /** @deprecated Internal use. Does not exist at runtime. */
    interface __NameMapGLTFBufferView extends __NameMapResource {
    }
    /** Represents a glTF buffer view.  
     *  	  
     *  @link https://docs.godotengine.org/en/4.5/classes/class_gltfbufferview.html  
     */
    class GLTFBufferView extends Resource {
        constructor(identifier?: any)
        /** Loads the buffer view data from the buffer referenced by this buffer view in the given [GLTFState]. Interleaved data with a byte stride is not yet supported by this method. The data is returned as a [PackedByteArray]. */
        load_buffer_view_data(state: GLTFState): PackedByteArray
        
        /** The index of the buffer this buffer view is referencing. If `-1`, this buffer view is not referencing any buffer. */
        get buffer(): int64
        set buffer(value: int64)
        
        /** The offset, in bytes, from the start of the buffer to the start of this buffer view. */
        get byte_offset(): int64
        set byte_offset(value: int64)
        
        /** The length, in bytes, of this buffer view. If `0`, this buffer view is empty. */
        get byte_length(): int64
        set byte_length(value: int64)
        
        /** The stride, in bytes, between interleaved data. If `-1`, this buffer view is not interleaved. */
        get byte_stride(): int64
        set byte_stride(value: int64)
        
        /** `true` if the GLTFBufferView's OpenGL GPU buffer type is an `ELEMENT_ARRAY_BUFFER` used for vertex indices (integer constant `34963`). `false` if the buffer type is any other value. See [url=https://github.com/KhronosGroup/glTF-Tutorials/blob/master/gltfTutorial/gltfTutorial_005_BuffersBufferViewsAccessors.md]Buffers, BufferViews, and Accessors[/url] for possible values. This property is set on import and used on export. */
        get indices(): boolean
        set indices(value: boolean)
        
        /** `true` if the GLTFBufferView's OpenGL GPU buffer type is an `ARRAY_BUFFER` used for vertex attributes (integer constant `34962`). `false` if the buffer type is any other value. See [url=https://github.com/KhronosGroup/glTF-Tutorials/blob/master/gltfTutorial/gltfTutorial_005_BuffersBufferViewsAccessors.md]Buffers, BufferViews, and Accessors[/url] for possible values. This property is set on import and used on export. */
        get vertex_attributes(): boolean
        set vertex_attributes(value: boolean)
        /** @deprecated Internal use. Does not exist at runtime. */
        __godotNameMap: __NameMapGLTFBufferView;
    }
    /** @deprecated Internal use. Does not exist at runtime. */
    interface __NameMapGLTFCamera extends __NameMapResource {
    }
    /** Represents a glTF camera.  
     *  	  
     *  @link https://docs.godotengine.org/en/4.5/classes/class_gltfcamera.html  
     */
    class GLTFCamera extends Resource {
        constructor(identifier?: any)
        /** Create a new GLTFCamera instance from the given Godot [Camera3D] node. */
        static from_node(camera_node: Camera3D): null | GLTFCamera
        
        /** Converts this GLTFCamera instance into a Godot [Camera3D] node. */
        to_node(): null | Camera3D
        
        /** Creates a new GLTFCamera instance by parsing the given [Dictionary]. */
        static from_dictionary(dictionary: GDictionary): null | GLTFCamera
        
        /** Serializes this GLTFCamera instance into a [Dictionary]. */
        to_dictionary(): GDictionary
        
        /** If `true`, the camera is in perspective mode. Otherwise, the camera is in orthographic/orthogonal mode. This maps to glTF's camera `type` property. See [member Camera3D.projection] and the glTF spec for more information. */
        get perspective(): boolean
        set perspective(value: boolean)
        
        /** The FOV of the camera. This class and glTF define the camera FOV in radians, while Godot uses degrees. This maps to glTF's `yfov` property. This value is only used for perspective cameras, when [member perspective] is `true`. */
        get fov(): float64
        set fov(value: float64)
        
        /** The size of the camera. This class and glTF define the camera size magnitude as a radius in meters, while Godot defines it as a diameter in meters. This maps to glTF's `ymag` property. This value is only used for orthographic/orthogonal cameras, when [member perspective] is `false`. */
        get size_mag(): float64
        set size_mag(value: float64)
        
        /** The distance to the far culling boundary for this camera relative to its local Z axis, in meters. This maps to glTF's `zfar` property. */
        get depth_far(): float64
        set depth_far(value: float64)
        
        /** The distance to the near culling boundary for this camera relative to its local Z axis, in meters. This maps to glTF's `znear` property. */
        get depth_near(): float64
        set depth_near(value: float64)
        /** @deprecated Internal use. Does not exist at runtime. */
        __godotNameMap: __NameMapGLTFCamera;
    }
    namespace GLTFDocument {
        enum RootNodeMode {
            /** Treat the Godot scene's root node as the root node of the glTF file, and mark it as the single root node via the `GODOT_single_root` glTF extension. This will be parsed the same as [constant ROOT_NODE_MODE_KEEP_ROOT] if the implementation does not support `GODOT_single_root`. */
            ROOT_NODE_MODE_SINGLE_ROOT = 0,
            
            /** Treat the Godot scene's root node as the root node of the glTF file, but do not mark it as anything special. An extra root node will be generated when importing into Godot. This uses only vanilla glTF features. This is equivalent to the behavior in Godot 4.1 and earlier. */
            ROOT_NODE_MODE_KEEP_ROOT = 1,
            
            /** Treat the Godot scene's root node as the name of the glTF scene, and add all of its children as root nodes of the glTF file. This uses only vanilla glTF features. This avoids an extra root node, but only the name of the Godot scene's root node will be preserved, as it will not be saved as a node. */
            ROOT_NODE_MODE_MULTI_ROOT = 2,
        }
        enum VisibilityMode {
            /** If the scene contains any non-visible nodes, include them, mark them as non-visible with `KHR_node_visibility`, and require that importers respect their non-visibility. Downside: If the importer does not support `KHR_node_visibility`, the file cannot be imported. */
            VISIBILITY_MODE_INCLUDE_REQUIRED = 0,
            
            /** If the scene contains any non-visible nodes, include them, mark them as non-visible with `KHR_node_visibility`, and do not impose any requirements on importers. Downside: If the importer does not support `KHR_node_visibility`, invisible objects will be visible. */
            VISIBILITY_MODE_INCLUDE_OPTIONAL = 1,
            
            /** If the scene contains any non-visible nodes, do not include them in the export. This is the same as the behavior in Godot 4.4 and earlier. Downside: Invisible nodes will not exist in the exported file. */
            VISIBILITY_MODE_EXCLUDE = 2,
        }
    }
    /** @deprecated Internal use. Does not exist at runtime. */
    interface __NameMapGLTFDocument extends __NameMapResource {
    }
    /** Class for importing and exporting glTF files in and out of Godot.  
     *  	  
     *  @link https://docs.godotengine.org/en/4.5/classes/class_gltfdocument.html  
     */
    class GLTFDocument extends Resource {
        constructor(identifier?: any)
        /** Takes a path to a glTF file and imports the data at that file path to the given [GLTFState] object through the [param state] parameter.  
         *      
         *  **Note:** The [param base_path] tells [method append_from_file] where to find dependencies and can be empty.  
         */
        append_from_file(path: string, state: GLTFState, flags?: int64 /* = 0 */, base_path?: string /* = '' */): Error
        
        /** Takes a [PackedByteArray] defining a glTF and imports the data to the given [GLTFState] object through the [param state] parameter.  
         *      
         *  **Note:** The [param base_path] tells [method append_from_buffer] where to find dependencies and can be empty.  
         */
        append_from_buffer(bytes: PackedByteArray | byte[] | ArrayBuffer, base_path: string, state: GLTFState, flags?: int64 /* = 0 */): Error
        
        /** Takes a Godot Engine scene node and exports it and its descendants to the given [GLTFState] object through the [param state] parameter. */
        append_from_scene(node: Node, state: GLTFState, flags?: int64 /* = 0 */): Error
        
        /** Takes a [GLTFState] object through the [param state] parameter and returns a Godot Engine scene node.  
         *  The [param bake_fps] parameter overrides the bake_fps in [param state].  
         */
        generate_scene(state: GLTFState, bake_fps?: float64 /* = 30 */, trimming?: boolean /* = false */, remove_immutable_tracks?: boolean /* = true */): null | Node
        
        /** Takes a [GLTFState] object through the [param state] parameter and returns a glTF [PackedByteArray]. */
        generate_buffer(state: GLTFState): PackedByteArray
        
        /** Takes a [GLTFState] object through the [param state] parameter and writes a glTF file to the filesystem.  
         *      
         *  **Note:** The extension of the glTF file determines if it is a .glb binary file or a .gltf text file.  
         */
        write_to_filesystem(state: GLTFState, path: string): Error
        
        /** Determines a mapping between the given glTF Object Model [param json_pointer] and the corresponding Godot node path(s) in the generated Godot scene. The details of this mapping are returned in a [GLTFObjectModelProperty] object. Additional mappings can be supplied via the [method GLTFDocumentExtension._export_object_model_property] callback method. */
        static import_object_model_property(state: GLTFState, json_pointer: string): null | GLTFObjectModelProperty
        
        /** Determines a mapping between the given Godot [param node_path] and the corresponding glTF Object Model JSON pointer(s) in the generated glTF file. The details of this mapping are returned in a [GLTFObjectModelProperty] object. Additional mappings can be supplied via the [method GLTFDocumentExtension._import_object_model_property] callback method. */
        static export_object_model_property(state: GLTFState, node_path: NodePath | string, godot_node: Node, gltf_node_index: int64): null | GLTFObjectModelProperty
        
        /** Registers the given [GLTFDocumentExtension] instance with GLTFDocument. If [param first_priority] is `true`, this extension will be run first. Otherwise, it will be run last.  
         *      
         *  **Note:** Like GLTFDocument itself, all GLTFDocumentExtension classes must be stateless in order to function properly. If you need to store data, use the `set_additional_data` and `get_additional_data` methods in [GLTFState] or [GLTFNode].  
         */
        static register_gltf_document_extension(extension: GLTFDocumentExtension, first_priority?: boolean /* = false */): void
        
        /** Unregisters the given [GLTFDocumentExtension] instance. */
        static unregister_gltf_document_extension(extension: GLTFDocumentExtension): void
        
        /** Returns a list of all support glTF extensions, including extensions supported directly by the engine, and extensions supported by user plugins registering [GLTFDocumentExtension] classes.  
         *      
         *  **Note:** If this method is run before a GLTFDocumentExtension is registered, its extensions won't be included in the list. Be sure to only run this method after all extensions are registered. If you run this when the engine starts, consider waiting a frame before calling this method to ensure all extensions are registered.  
         */
        static get_supported_gltf_extensions(): PackedStringArray
        
        /** The user-friendly name of the export image format. This is used when exporting the glTF file, including writing to a file and writing to a byte array.  
         *  By default, Godot allows the following options: "None", "PNG", "JPEG", "Lossless WebP", and "Lossy WebP". Support for more image formats can be added in [GLTFDocumentExtension] classes. A single extension class can provide multiple options for the specific format to use, or even an option that uses multiple formats at once.  
         */
        get image_format(): string
        set image_format(value: string)
        
        /** If [member image_format] is a lossy image format, this determines the lossy quality of the image. On a range of `0.0` to `1.0`, where `0.0` is the lowest quality and `1.0` is the highest quality. A lossy quality of `1.0` is not the same as lossless. */
        get lossy_quality(): float64
        set lossy_quality(value: float64)
        
        /** The user-friendly name of the fallback image format. This is used when exporting the glTF file, including writing to a file and writing to a byte array.  
         *  This property may only be one of "None", "PNG", or "JPEG", and is only used when the [member image_format] is not one of "None", "PNG", or "JPEG". If having multiple extension image formats is desired, that can be done using a [GLTFDocumentExtension] class - this property only covers the use case of providing a base glTF fallback image when using a custom image format.  
         */
        get fallback_image_format(): string
        set fallback_image_format(value: string)
        
        /** The quality of the fallback image, if any. For PNG files, this downscales the image on both dimensions by this factor. For JPEG files, this is the lossy quality of the image. A low value is recommended, since including multiple high quality images in a glTF file defeats the file size gains of using a more efficient image format. */
        get fallback_image_quality(): float64
        set fallback_image_quality(value: float64)
        
        /** How to process the root node during export. The default and recommended value is [constant ROOT_NODE_MODE_SINGLE_ROOT].  
         *      
         *  **Note:** Regardless of how the glTF file is exported, when importing, the root node type and name can be overridden in the scene import settings tab.  
         */
        get root_node_mode(): int64
        set root_node_mode(value: int64)
        
        /** How to deal with node visibility during export. This setting does nothing if all nodes are visible. The default and recommended value is [constant VISIBILITY_MODE_INCLUDE_REQUIRED], which uses the `KHR_node_visibility` extension. */
        get visibility_mode(): int64
        set visibility_mode(value: int64)
        /** @deprecated Internal use. Does not exist at runtime. */
        __godotNameMap: __NameMapGLTFDocument;
    }
    /** @deprecated Internal use. Does not exist at runtime. */
    interface __NameMapGLTFDocumentExtension extends __NameMapResource {
    }
    /** [GLTFDocument] extension class.  
     *  	  
     *  @link https://docs.godotengine.org/en/4.5/classes/class_gltfdocumentextension.html  
     */
    class GLTFDocumentExtension extends Resource {
        constructor(identifier?: any)
        /** Part of the import process. This method is run first, before all other parts of the import process.  
         *  The return value is used to determine if this [GLTFDocumentExtension] instance should be used for importing a given glTF file. If [constant OK], the import will use this [GLTFDocumentExtension] instance. If not overridden, [constant OK] is returned.  
         */
        /* gdvirtual */ _import_preflight(state: GLTFState, extensions: PackedStringArray | string[]): Error
        
        /** Part of the import process. This method is run after [method _import_preflight] and before [method _parse_node_extensions].  
         *  Returns an array of the glTF extensions supported by this GLTFDocumentExtension class. This is used to validate if a glTF file with required extensions can be loaded.  
         */
        /* gdvirtual */ _get_supported_extensions(): PackedStringArray
        
        /** Part of the import process. This method is run after [method _get_supported_extensions] and before [method _import_post_parse].  
         *  Runs when parsing the node extensions of a GLTFNode. This method can be used to process the extension JSON data into a format that can be used by [method _generate_scene_node]. The return value should be a member of the [enum Error] enum.  
         */
        /* gdvirtual */ _parse_node_extensions(state: GLTFState, gltf_node: GLTFNode, extensions: GDictionary): Error
        
        /** Part of the import process. This method is run after [method _parse_node_extensions] and before [method _parse_texture_json].  
         *  Runs when parsing image data from a glTF file. The data could be sourced from a separate file, a URI, or a buffer, and then is passed as a byte array.  
         */
        /* gdvirtual */ _parse_image_data(state: GLTFState, image_data: PackedByteArray | byte[] | ArrayBuffer, mime_type: string, ret_image: Image): Error
        
        /** Returns the file extension to use for saving image data into, for example, `".png"`. If defined, when this extension is used to handle images, and the images are saved to a separate file, the image bytes will be copied to a file with this extension. If this is set, there should be a [ResourceImporter] class able to import the file. If not defined or empty, Godot will save the image into a PNG file. */
        /* gdvirtual */ _get_image_file_extension(): string
        
        /** Part of the import process. This method is run after [method _parse_image_data] and before [method _generate_scene_node].  
         *  Runs when parsing the texture JSON from the glTF textures array. This can be used to set the source image index to use as the texture.  
         */
        /* gdvirtual */ _parse_texture_json(state: GLTFState, texture_json: GDictionary, ret_gltf_texture: GLTFTexture): Error
        
        /** Part of the import process. Allows GLTFDocumentExtension classes to provide mappings for JSON pointers to glTF properties, as defined by the glTF object model, to properties of nodes in the Godot scene tree.  
         *  Returns a [GLTFObjectModelProperty] instance that defines how the property should be mapped. If your extension can't handle the property, return `null` or an instance without any NodePaths (see [method GLTFObjectModelProperty.has_node_paths]). You should use [method GLTFObjectModelProperty.set_types] to set the types, and [method GLTFObjectModelProperty.append_path_to_property] function is useful for most simple cases.  
         *  In many cases, [param partial_paths] will contain the start of a path, allowing the extension to complete the path. For example, for `/nodes/3/extensions/MY_ext/prop`, Godot will pass you a NodePath that leads to node 3, so the GLTFDocumentExtension class only needs to resolve the last `MY_ext/prop` part of the path. In this example, the extension should check `split.size() > 4 and split[0] == "nodes" and split[2] == "extensions" and split[3] == "MY_ext"` at the start of the function to check if this JSON pointer applies to it, then it can use [param partial_paths] and handle `split[4]`.  
         */
        /* gdvirtual */ _import_object_model_property(state: GLTFState, split_json_pointer: PackedStringArray | string[], partial_paths: GArray<NodePath>): null | GLTFObjectModelProperty
        
        /** Part of the import process. This method is run after [method _parse_node_extensions] and before [method _import_pre_generate].  
         *  This method can be used to modify any of the data imported so far after parsing each node, but before generating the scene or any of its nodes.  
         */
        /* gdvirtual */ _import_post_parse(state: GLTFState): Error
        
        /** Part of the import process. This method is run after [method _import_post_parse] and before [method _generate_scene_node].  
         *  This method can be used to modify or read from any of the processed data structures, before generating the nodes and then running the final per-node import step.  
         */
        /* gdvirtual */ _import_pre_generate(state: GLTFState): Error
        
        /** Part of the import process. This method is run after [method _import_pre_generate] and before [method _import_node].  
         *  Runs when generating a Godot scene node from a GLTFNode. The returned node will be added to the scene tree. Multiple nodes can be generated in this step if they are added as a child of the returned node.  
         *      
         *  **Note:** The [param scene_parent] parameter may be `null` if this is the single root node.  
         */
        /* gdvirtual */ _generate_scene_node(state: GLTFState, gltf_node: GLTFNode, scene_parent: Node): null | Node3D
        
        /** Part of the import process. This method is run after [method _generate_scene_node] and before [method _import_post].  
         *  This method can be used to make modifications to each of the generated Godot scene nodes.  
         */
        /* gdvirtual */ _import_node(state: GLTFState, gltf_node: GLTFNode, json: GDictionary, node: Node): Error
        
        /** Part of the import process. This method is run last, after all other parts of the import process.  
         *  This method can be used to modify the final Godot scene generated by the import process.  
         */
        /* gdvirtual */ _import_post(state: GLTFState, root: Node): Error
        
        /** Part of the export process. This method is run first, before all other parts of the export process.  
         *  The return value is used to determine if this [GLTFDocumentExtension] instance should be used for exporting a given glTF file. If [constant OK], the export will use this [GLTFDocumentExtension] instance. If not overridden, [constant OK] is returned.  
         */
        /* gdvirtual */ _export_preflight(state: GLTFState, root: Node): Error
        
        /** Part of the export process. This method is run after [method _export_preflight] and before [method _export_post_convert].  
         *  Runs when converting the data from a Godot scene node. This method can be used to process the Godot scene node data into a format that can be used by [method _export_node].  
         */
        /* gdvirtual */ _convert_scene_node(state: GLTFState, gltf_node: GLTFNode, scene_node: Node): void
        
        /** Part of the export process. This method is run after [method _convert_scene_node] and before [method _export_preserialize].  
         *  This method can be used to modify the converted node data structures before serialization with any additional data from the scene tree.  
         */
        /* gdvirtual */ _export_post_convert(state: GLTFState, root: Node): Error
        
        /** Part of the export process. This method is run after [method _export_post_convert] and before [method _get_saveable_image_formats].  
         *  This method can be used to alter the state before performing serialization. It runs every time when generating a buffer with [method GLTFDocument.generate_buffer] or writing to the file system with [method GLTFDocument.write_to_filesystem].  
         */
        /* gdvirtual */ _export_preserialize(state: GLTFState): Error
        
        /** Part of the export process. Allows GLTFDocumentExtension classes to provide mappings for properties of nodes in the Godot scene tree, to JSON pointers to glTF properties, as defined by the glTF object model.  
         *  Returns a [GLTFObjectModelProperty] instance that defines how the property should be mapped. If your extension can't handle the property, return `null` or an instance without any JSON pointers (see [method GLTFObjectModelProperty.has_json_pointers]). You should use [method GLTFObjectModelProperty.set_types] to set the types, and set the JSON pointer(s) using the [member GLTFObjectModelProperty.json_pointers] property.  
         *  The parameters provide context for the property, including the NodePath, the Godot node, the GLTF node index, and the target object. The [param target_object] will be equal to [param godot_node] if no sub-object can be found, otherwise it will point to a sub-object. For example, if the path is `^"A/B/C/MeshInstance3D:mesh:surface_0/material:emission_intensity"`, it will get the node, then the mesh, and then the material, so [param target_object] will be the [Material] resource, and [param target_depth] will be 2 because 2 levels were traversed to get to the target.  
         */
        /* gdvirtual */ _export_object_model_property(state: GLTFState, node_path: NodePath | string, godot_node: Node, gltf_node_index: int64, target_object: Object, target_depth: int64): null | GLTFObjectModelProperty
        
        /** Part of the export process. This method is run after [method _convert_scene_node] and before [method _export_node].  
         *  Returns an array of the image formats that can be saved/exported by this extension. This extension will only be selected as the image exporter if the [GLTFDocument]'s [member GLTFDocument.image_format] is in this array. If this [GLTFDocumentExtension] is selected as the image exporter, one of the [method _save_image_at_path] or [method _serialize_image_to_bytes] methods will run next, otherwise [method _export_node] will run next. If the format name contains `"Lossy"`, the lossy quality slider will be displayed.  
         */
        /* gdvirtual */ _get_saveable_image_formats(): PackedStringArray
        
        /** Part of the export process. This method is run after [method _get_saveable_image_formats] and before [method _serialize_texture_json].  
         *  This method is run when embedding images in the glTF file. When images are saved separately, [method _save_image_at_path] runs instead. Note that these methods only run when this [GLTFDocumentExtension] is selected as the image exporter.  
         *  This method must set the image MIME type in the [param image_dict] with the `"mimeType"` key. For example, for a PNG image, it would be set to `"image/png"`. The return value must be a [PackedByteArray] containing the image data.  
         */
        /* gdvirtual */ _serialize_image_to_bytes(state: GLTFState, image: Image, image_dict: GDictionary, image_format: string, lossy_quality: float64): PackedByteArray
        
        /** Part of the export process. This method is run after [method _get_saveable_image_formats] and before [method _serialize_texture_json].  
         *  This method is run when saving images separately from the glTF file. When images are embedded, [method _serialize_image_to_bytes] runs instead. Note that these methods only run when this [GLTFDocumentExtension] is selected as the image exporter.  
         */
        /* gdvirtual */ _save_image_at_path(state: GLTFState, image: Image, file_path: string, image_format: string, lossy_quality: float64): Error
        
        /** Part of the export process. This method is run after [method _save_image_at_path] or [method _serialize_image_to_bytes], and before [method _export_node]. Note that this method only runs when this [GLTFDocumentExtension] is selected as the image exporter.  
         *  This method can be used to set up the extensions for the texture JSON by editing [param texture_json]. The extension must also be added as used extension with [method GLTFState.add_used_extension], be sure to set `required` to `true` if you are not providing a fallback.  
         */
        /* gdvirtual */ _serialize_texture_json(state: GLTFState, texture_json: GDictionary, gltf_texture: GLTFTexture, image_format: string): Error
        
        /** Part of the export process. This method is run after [method _get_saveable_image_formats] and before [method _export_post]. If this [GLTFDocumentExtension] is used for exporting images, this runs after [method _serialize_texture_json].  
         *  This method can be used to modify the final JSON of each node. Data should be primarily stored in [param gltf_node] prior to serializing the JSON, but the original Godot [Node] is also provided if available. [param node] may be `null` if not available, such as when exporting glTF data not generated from a Godot scene.  
         */
        /* gdvirtual */ _export_node(state: GLTFState, gltf_node: GLTFNode, json: GDictionary, node: Node): Error
        
        /** Part of the export process. This method is run last, after all other parts of the export process.  
         *  This method can be used to modify the final JSON of the generated glTF file.  
         */
        /* gdvirtual */ _export_post(state: GLTFState): Error
        /** @deprecated Internal use. Does not exist at runtime. */
        __godotNameMap: __NameMapGLTFDocumentExtension;
    }
    /** @deprecated Internal use. Does not exist at runtime. */
    interface __NameMapGLTFDocumentExtensionConvertImporterMesh extends __NameMapGLTFDocumentExtension {
    }
    /** @link https://docs.godotengine.org/en/4.5/classes/class_gltfdocumentextensionconvertimportermesh.html */
    class GLTFDocumentExtensionConvertImporterMesh extends GLTFDocumentExtension {
        constructor(identifier?: any)
        /** @deprecated Internal use. Does not exist at runtime. */
        __godotNameMap: __NameMapGLTFDocumentExtensionConvertImporterMesh;
    }
    /** @deprecated Internal use. Does not exist at runtime. */
    interface __NameMapGLTFLight extends __NameMapResource {
    }
    /** Represents a glTF light.  
     *  	  
     *  @link https://docs.godotengine.org/en/4.5/classes/class_gltflight.html  
     */
    class GLTFLight extends Resource {
        constructor(identifier?: any)
        /** Create a new GLTFLight instance from the given Godot [Light3D] node. */
        static from_node(light_node: Light3D): null | GLTFLight
        
        /** Converts this GLTFLight instance into a Godot [Light3D] node. */
        to_node(): null | Light3D
        
        /** Creates a new GLTFLight instance by parsing the given [Dictionary]. */
        static from_dictionary(dictionary: GDictionary): null | GLTFLight
        
        /** Serializes this GLTFLight instance into a [Dictionary]. */
        to_dictionary(): GDictionary
        get_additional_data(extension_name: StringName): any
        set_additional_data(extension_name: StringName, additional_data: any): void
        
        /** The [Color] of the light in linear space. Defaults to white. A black color causes the light to have no effect.  
         *  This value is linear to match glTF, but will be converted to nonlinear sRGB when creating a Godot [Light3D] node upon import, or converted to linear when exporting a Godot [Light3D] to glTF.  
         */
        get color(): Color
        set color(value: Color)
        
        /** The intensity of the light. This is expressed in candelas (lumens per steradian) for point and spot lights, and lux (lumens per m²) for directional lights. When creating a Godot light, this value is converted to a unitless multiplier. */
        get intensity(): float64
        set intensity(value: float64)
        
        /** The type of the light. The values accepted by Godot are "point", "spot", and "directional", which correspond to Godot's [OmniLight3D], [SpotLight3D], and [DirectionalLight3D] respectively. */
        get light_type(): string
        set light_type(value: string)
        
        /** The range of the light, beyond which the light has no effect. glTF lights with no range defined behave like physical lights (which have infinite range). When creating a Godot light, the range is clamped to `4096.0`. */
        get range(): float64
        set range(value: float64)
        
        /** The inner angle of the cone in a spotlight. Must be less than or equal to the outer cone angle.  
         *  Within this angle, the light is at full brightness. Between the inner and outer cone angles, there is a transition from full brightness to zero brightness. When creating a Godot [SpotLight3D], the ratio between the inner and outer cone angles is used to calculate the attenuation of the light.  
         */
        get inner_cone_angle(): float64
        set inner_cone_angle(value: float64)
        
        /** The outer angle of the cone in a spotlight. Must be greater than or equal to the inner angle.  
         *  At this angle, the light drops off to zero brightness. Between the inner and outer cone angles, there is a transition from full brightness to zero brightness. If this angle is a half turn, then the spotlight emits in all directions. When creating a Godot [SpotLight3D], the outer cone angle is used as the angle of the spotlight.  
         */
        get outer_cone_angle(): float64
        set outer_cone_angle(value: float64)
        /** @deprecated Internal use. Does not exist at runtime. */
        __godotNameMap: __NameMapGLTFLight;
    }
    /** @deprecated Internal use. Does not exist at runtime. */
    interface __NameMapGLTFMesh extends __NameMapResource {
    }
    /** GLTFMesh represents a glTF mesh.  
     *  	  
     *  @link https://docs.godotengine.org/en/4.5/classes/class_gltfmesh.html  
     */
    class GLTFMesh extends Resource {
        constructor(identifier?: any)
        /** Gets additional arbitrary data in this [GLTFMesh] instance. This can be used to keep per-node state data in [GLTFDocumentExtension] classes, which is important because they are stateless.  
         *  The argument should be the [GLTFDocumentExtension] name (does not have to match the extension name in the glTF file), and the return value can be anything you set. If nothing was set, the return value is `null`.  
         */
        get_additional_data(extension_name: StringName): any
        
        /** Sets additional arbitrary data in this [GLTFMesh] instance. This can be used to keep per-node state data in [GLTFDocumentExtension] classes, which is important because they are stateless.  
         *  The first argument should be the [GLTFDocumentExtension] name (does not have to match the extension name in the glTF file), and the second argument can be anything you want.  
         */
        set_additional_data(extension_name: StringName, additional_data: any): void
        
        /** The original name of the mesh. */
        get original_name(): string
        set original_name(value: string)
        
        /** The [ImporterMesh] object representing the mesh itself. */
        get mesh(): null | Object
        set mesh(value: null | Object)
        
        /** An array of floats representing the blend weights of the mesh. */
        get blend_weights(): PackedFloat32Array
        set blend_weights(value: PackedFloat32Array | float32[])
        
        /** An array of Material objects representing the materials used in the mesh. */
        get instance_materials(): GArray
        set instance_materials(value: GArray)
        /** @deprecated Internal use. Does not exist at runtime. */
        __godotNameMap: __NameMapGLTFMesh;
    }
    /** @deprecated Internal use. Does not exist at runtime. */
    interface __NameMapGLTFNode extends __NameMapResource {
    }
    /** glTF node class.  
     *  	  
     *  @link https://docs.godotengine.org/en/4.5/classes/class_gltfnode.html  
     */
    class GLTFNode extends Resource {
        constructor(identifier?: any)
        /** Appends the given child node index to the [member children] array. */
        append_child_index(child_index: int64): void
        
        /** Gets additional arbitrary data in this [GLTFNode] instance. This can be used to keep per-node state data in [GLTFDocumentExtension] classes, which is important because they are stateless.  
         *  The argument should be the [GLTFDocumentExtension] name (does not have to match the extension name in the glTF file), and the return value can be anything you set. If nothing was set, the return value is `null`.  
         */
        get_additional_data(extension_name: StringName): any
        
        /** Sets additional arbitrary data in this [GLTFNode] instance. This can be used to keep per-node state data in [GLTFDocumentExtension] classes, which is important because they are stateless.  
         *  The first argument should be the [GLTFDocumentExtension] name (does not have to match the extension name in the glTF file), and the second argument can be anything you want.  
         */
        set_additional_data(extension_name: StringName, additional_data: any): void
        
        /** Returns the [NodePath] that this GLTF node will have in the Godot scene tree after being imported. This is useful when importing glTF object model pointers with [GLTFObjectModelProperty], for handling extensions such as `KHR_animation_pointer` or `KHR_interactivity`.  
         *  If [param handle_skeletons] is `true`, paths to skeleton bone glTF nodes will be resolved properly. For example, a path that would be `^"A/B/C/Bone1/Bone2/Bone3"` if `false` will become `^"A/B/C/Skeleton3D:Bone3"`.  
         */
        get_scene_node_path(gltf_state: GLTFState, handle_skeletons?: boolean /* = true */): NodePath
        
        /** The original name of the node. */
        get original_name(): string
        set original_name(value: string)
        
        /** The index of the parent node in the [GLTFState]. If -1, this node is a root node. */
        get parent(): int64
        set parent(value: int64)
        
        /** How deep into the node hierarchy this node is. A root node will have a height of 0, its children will have a height of 1, and so on. If -1, the height has not been calculated. */
        get height(): int64
        set height(value: int64)
        
        /** The transform of the glTF node relative to its parent. This property is usually unused since the position, rotation, and scale properties are preferred. */
        get xform(): Transform3D
        set xform(value: Transform3D)
        
        /** If this glTF node is a mesh, the index of the [GLTFMesh] in the [GLTFState] that describes the mesh's properties. If -1, this node is not a mesh. */
        get mesh(): int64
        set mesh(value: int64)
        
        /** If this glTF node is a camera, the index of the [GLTFCamera] in the [GLTFState] that describes the camera's properties. If `-1`, this node is not a camera. */
        get camera(): int64
        set camera(value: int64)
        
        /** If this glTF node has a skin, the index of the [GLTFSkin] in the [GLTFState] that describes the skin's properties. If -1, this node does not have a skin. */
        get skin(): int64
        set skin(value: int64)
        
        /** If this glTF node has a skeleton, the index of the [GLTFSkeleton] in the [GLTFState] that describes the skeleton's properties. If -1, this node does not have a skeleton. */
        get skeleton(): int64
        set skeleton(value: int64)
        
        /** The position of the glTF node relative to its parent. */
        get position(): Vector3
        set position(value: Vector3)
        
        /** The rotation of the glTF node relative to its parent. */
        get rotation(): Quaternion
        set rotation(value: Quaternion)
        
        /** The scale of the glTF node relative to its parent. */
        get scale(): Vector3
        set scale(value: Vector3)
        
        /** The indices of the child nodes in the [GLTFState]. If this glTF node has no children, this will be an empty array. */
        get children(): PackedInt32Array
        set children(value: PackedInt32Array | int32[])
        
        /** If this glTF node is a light, the index of the [GLTFLight] in the [GLTFState] that describes the light's properties. If -1, this node is not a light. */
        get light(): int64
        set light(value: int64)
        
        /** If `true`, the GLTF node is visible. If `false`, the GLTF node is not visible. This is translated to the [member Node3D.visible] property in the Godot scene, and is exported to `KHR_node_visibility` when `false`. */
        get visible(): boolean
        set visible(value: boolean)
        /** @deprecated Internal use. Does not exist at runtime. */
        __godotNameMap: __NameMapGLTFNode;
    }
    namespace GLTFObjectModelProperty {
        enum GLTFObjectModelType {
            /** Unknown or not set object model type. If the object model type is set to this value, the real type still needs to be determined. */
            GLTF_OBJECT_MODEL_TYPE_UNKNOWN = 0,
            
            /** Object model type "bool". Represented in the glTF JSON as a boolean, and encoded in a [GLTFAccessor] as "SCALAR". When encoded in an accessor, a value of `0` is `false`, and any other value is `true`. */
            GLTF_OBJECT_MODEL_TYPE_BOOL = 1,
            
            /** Object model type "float". Represented in the glTF JSON as a number, and encoded in a [GLTFAccessor] as "SCALAR". */
            GLTF_OBJECT_MODEL_TYPE_FLOAT = 2,
            
            /** Object model type "float[lb][rb]". Represented in the glTF JSON as an array of numbers, and encoded in a [GLTFAccessor] as "SCALAR". */
            GLTF_OBJECT_MODEL_TYPE_FLOAT_ARRAY = 3,
            
            /** Object model type "float2". Represented in the glTF JSON as an array of two numbers, and encoded in a [GLTFAccessor] as "VEC2". */
            GLTF_OBJECT_MODEL_TYPE_FLOAT2 = 4,
            
            /** Object model type "float3". Represented in the glTF JSON as an array of three numbers, and encoded in a [GLTFAccessor] as "VEC3". */
            GLTF_OBJECT_MODEL_TYPE_FLOAT3 = 5,
            
            /** Object model type "float4". Represented in the glTF JSON as an array of four numbers, and encoded in a [GLTFAccessor] as "VEC4". */
            GLTF_OBJECT_MODEL_TYPE_FLOAT4 = 6,
            
            /** Object model type "float2x2". Represented in the glTF JSON as an array of four numbers, and encoded in a [GLTFAccessor] as "MAT2". */
            GLTF_OBJECT_MODEL_TYPE_FLOAT2X2 = 7,
            
            /** Object model type "float3x3". Represented in the glTF JSON as an array of nine numbers, and encoded in a [GLTFAccessor] as "MAT3". */
            GLTF_OBJECT_MODEL_TYPE_FLOAT3X3 = 8,
            
            /** Object model type "float4x4". Represented in the glTF JSON as an array of sixteen numbers, and encoded in a [GLTFAccessor] as "MAT4". */
            GLTF_OBJECT_MODEL_TYPE_FLOAT4X4 = 9,
            
            /** Object model type "int". Represented in the glTF JSON as a number, and encoded in a [GLTFAccessor] as "SCALAR". The range of values is limited to signed integers. For `KHR_interactivity`, only 32-bit integers are supported. */
            GLTF_OBJECT_MODEL_TYPE_INT = 10,
        }
    }
    /** @deprecated Internal use. Does not exist at runtime. */
    interface __NameMapGLTFObjectModelProperty extends __NameMapRefCounted {
    }
    /** Describes how to access a property as defined in the glTF object model.  
     *  	  
     *  @link https://docs.godotengine.org/en/4.5/classes/class_gltfobjectmodelproperty.html  
     */
    class GLTFObjectModelProperty extends RefCounted {
        constructor(identifier?: any)
        /** Appends a [NodePath] to [member node_paths]. This can be used by [GLTFDocumentExtension] classes to define how a glTF object model property maps to a Godot property, or multiple Godot properties. Prefer using [method append_path_to_property] for simple cases. Be sure to also call [method set_types] once (the order does not matter). */
        append_node_path(node_path: NodePath | string): void
        
        /** High-level wrapper over [method append_node_path] that handles the most common cases. It constructs a new [NodePath] using [param node_path] as a base and appends [param prop_name] to the subpath. Be sure to also call [method set_types] once (the order does not matter). */
        append_path_to_property(node_path: NodePath | string, prop_name: StringName): void
        
        /** The GLTF accessor type associated with this property's [member object_model_type]. See [member GLTFAccessor.accessor_type] for possible values, and see [enum GLTFObjectModelType] for how the object model type maps to accessor types. */
        get_accessor_type(): GLTFAccessor.GLTFAccessorType
        
        /** Returns `true` if [member node_paths] is not empty. This is used during import to determine if a [GLTFObjectModelProperty] can handle converting a glTF object model property to a Godot property. */
        has_node_paths(): boolean
        
        /** Returns `true` if [member json_pointers] is not empty. This is used during export to determine if a [GLTFObjectModelProperty] can handle converting a Godot property to a glTF object model property. */
        has_json_pointers(): boolean
        
        /** Sets the [member variant_type] and [member object_model_type] properties. This is a convenience method to set both properties at once, since they are almost always known at the same time. This method should be called once. Calling it again with the same values will have no effect. */
        set_types(variant_type: Variant.Type, obj_model_type: GLTFObjectModelProperty.GLTFObjectModelType): void
        
        /** If set, this [Expression] will be used to convert the property value from the glTF object model to the value expected by the Godot property. This is useful when the glTF object model uses a different unit system, or when the data needs to be transformed in some way. If `null`, the value will be copied as-is. */
        get gltf_to_godot_expression(): null | Expression
        set gltf_to_godot_expression(value: null | Expression)
        
        /** If set, this [Expression] will be used to convert the property value from the Godot property to the value expected by the glTF object model. This is useful when the glTF object model uses a different unit system, or when the data needs to be transformed in some way. If `null`, the value will be copied as-is. */
        get godot_to_gltf_expression(): null | Expression
        set godot_to_gltf_expression(value: null | Expression)
        
        /** An array of [NodePath]s that point to a property, or multiple properties, in the Godot scene tree. On import, this will either be set by [GLTFDocument], or by a [GLTFDocumentExtension] class. For simple cases, use [method append_path_to_property] to add properties to this array.  
         *  In most cases [member node_paths] will only have one item, but in some cases a single glTF JSON pointer will map to multiple Godot properties. For example, a [GLTFCamera] or [GLTFLight] used on multiple glTF nodes will be represented by multiple Godot nodes.  
         */
        get node_paths(): GArray
        set node_paths(value: GArray)
        
        /** The type of data stored in the glTF file as defined by the object model. This is a superset of the available accessor types, and determines the accessor type. */
        get object_model_type(): int64
        set object_model_type(value: int64)
        
        /** The glTF object model JSON pointers used to identify the property in the glTF object model. In most cases, there will be only one item in this array, but specific cases may require multiple pointers. The items are themselves arrays which represent the JSON pointer split into its components. */
        get json_pointers(): PackedStringArray
        set json_pointers(value: PackedStringArray | string[])
        
        /** The type of data stored in the Godot property. This is the type of the property that the [member node_paths] point to. */
        get variant_type(): int64
        set variant_type(value: int64)
        /** @deprecated Internal use. Does not exist at runtime. */
        __godotNameMap: __NameMapGLTFObjectModelProperty;
    }
    /** @deprecated Internal use. Does not exist at runtime. */
    interface __NameMapGLTFPhysicsBody extends __NameMapResource {
    }
    /** Represents a glTF physics body.  
     *  	  
     *  @link https://docs.godotengine.org/en/4.5/classes/class_gltfphysicsbody.html  
     */
    class GLTFPhysicsBody extends Resource {
        constructor(identifier?: any)
        /** Creates a new GLTFPhysicsBody instance from the given Godot [CollisionObject3D] node. */
        static from_node(body_node: CollisionObject3D): null | GLTFPhysicsBody
        
        /** Converts this GLTFPhysicsBody instance into a Godot [CollisionObject3D] node. */
        to_node(): null | CollisionObject3D
        
        /** Creates a new GLTFPhysicsBody instance by parsing the given [Dictionary] in the `OMI_physics_body` glTF extension format. */
        static from_dictionary(dictionary: GDictionary): null | GLTFPhysicsBody
        
        /** Serializes this GLTFPhysicsBody instance into a [Dictionary]. It will be in the format expected by the `OMI_physics_body` glTF extension. */
        to_dictionary(): GDictionary
        
        /** The type of the body.  
         *  When importing, this controls what type of [CollisionObject3D] node Godot should generate. Valid values are `"static"`, `"animatable"`, `"character"`, `"rigid"`, `"vehicle"`, and `"trigger"`.  
         *  When exporting, this will be squashed down to one of `"static"`, `"kinematic"`, or `"dynamic"` motion types, or the `"trigger"` property.  
         */
        get body_type(): string
        set body_type(value: string)
        
        /** The mass of the physics body, in kilograms. This is only used when the body type is "rigid" or "vehicle". */
        get mass(): float64
        set mass(value: float64)
        
        /** The linear velocity of the physics body, in meters per second. This is only used when the body type is "rigid" or "vehicle". */
        get linear_velocity(): Vector3
        set linear_velocity(value: Vector3)
        
        /** The angular velocity of the physics body, in radians per second. This is only used when the body type is "rigid" or "vehicle". */
        get angular_velocity(): Vector3
        set angular_velocity(value: Vector3)
        
        /** The center of mass of the body, in meters. This is in local space relative to the body. By default, the center of the mass is the body's origin. */
        get center_of_mass(): Vector3
        set center_of_mass(value: Vector3)
        
        /** The inertia strength of the physics body, in kilogram meter squared (kg⋅m²). This represents the inertia around the principle axes, the diagonal of the inertia tensor matrix. This is only used when the body type is "rigid" or "vehicle".  
         *  When converted to a Godot [RigidBody3D] node, if this value is zero, then the inertia will be calculated automatically.  
         */
        get inertia_diagonal(): Vector3
        set inertia_diagonal(value: Vector3)
        
        /** The inertia orientation of the physics body. This defines the rotation of the inertia's principle axes relative to the object's local axes. This is only used when the body type is "rigid" or "vehicle" and [member inertia_diagonal] is set to a non-zero value. */
        get inertia_orientation(): Quaternion
        set inertia_orientation(value: Quaternion)
        
        /** The inertia tensor of the physics body, in kilogram meter squared (kg⋅m²). This is only used when the body type is "rigid" or "vehicle".  
         *  When converted to a Godot [RigidBody3D] node, if this value is zero, then the inertia will be calculated automatically.  
         */
        get inertia_tensor(): Basis
        set inertia_tensor(value: Basis)
        /** @deprecated Internal use. Does not exist at runtime. */
        __godotNameMap: __NameMapGLTFPhysicsBody;
    }
    /** @deprecated Internal use. Does not exist at runtime. */
    interface __NameMapGLTFPhysicsShape extends __NameMapResource {
    }
    /** Represents a glTF physics shape.  
     *  	  
     *  @link https://docs.godotengine.org/en/4.5/classes/class_gltfphysicsshape.html  
     */
    class GLTFPhysicsShape extends Resource {
        constructor(identifier?: any)
        /** Creates a new GLTFPhysicsShape instance from the given Godot [CollisionShape3D] node. */
        static from_node(shape_node: CollisionShape3D): null | GLTFPhysicsShape
        
        /** Converts this GLTFPhysicsShape instance into a Godot [CollisionShape3D] node. */
        to_node(cache_shapes?: boolean /* = false */): null | CollisionShape3D
        
        /** Creates a new GLTFPhysicsShape instance from the given Godot [Shape3D] resource. */
        static from_resource(shape_resource: Shape3D): null | GLTFPhysicsShape
        
        /** Converts this GLTFPhysicsShape instance into a Godot [Shape3D] resource. */
        to_resource(cache_shapes?: boolean /* = false */): null | Shape3D
        
        /** Creates a new GLTFPhysicsShape instance by parsing the given [Dictionary]. */
        static from_dictionary(dictionary: GDictionary): null | GLTFPhysicsShape
        
        /** Serializes this GLTFPhysicsShape instance into a [Dictionary] in the format defined by `OMI_physics_shape`. */
        to_dictionary(): GDictionary
        
        /** The type of shape this shape represents. Valid values are `"box"`, `"capsule"`, `"cylinder"`, `"sphere"`, `"hull"`, and `"trimesh"`. */
        get shape_type(): string
        set shape_type(value: string)
        
        /** The size of the shape, in meters. This is only used when the shape type is `"box"`, and it represents the `"diameter"` of the box. This value should not be negative. */
        get size(): Vector3
        set size(value: Vector3)
        
        /** The radius of the shape, in meters. This is only used when the shape type is `"capsule"`, `"cylinder"`, or `"sphere"`. This value should not be negative. */
        get radius(): float64
        set radius(value: float64)
        
        /** The height of the shape, in meters. This is only used when the shape type is `"capsule"` or `"cylinder"`. This value should not be negative, and for `"capsule"` it should be at least twice the radius. */
        get height(): float64
        set height(value: float64)
        
        /** If `true`, indicates that this shape is a trigger. For Godot, this means that the shape should be a child of an [Area3D] node.  
         *  This is the only variable not used in the [method to_node] method, it's intended to be used alongside when deciding where to add the generated node as a child.  
         */
        get is_trigger(): boolean
        set is_trigger(value: boolean)
        
        /** The index of the shape's mesh in the glTF file. This is only used when the shape type is `"hull"` (convex hull) or `"trimesh"` (concave trimesh). */
        get mesh_index(): int64
        set mesh_index(value: int64)
        
        /** The [ImporterMesh] resource of the shape. This is only used when the shape type is `"hull"` (convex hull) or `"trimesh"` (concave trimesh). */
        get importer_mesh(): null | ImporterMesh
        set importer_mesh(value: null | ImporterMesh)
        /** @deprecated Internal use. Does not exist at runtime. */
        __godotNameMap: __NameMapGLTFPhysicsShape;
    }
    /** @deprecated Internal use. Does not exist at runtime. */
    interface __NameMapGLTFSkeleton extends __NameMapResource {
    }
    /** @link https://docs.godotengine.org/en/4.5/classes/class_gltfskeleton.html */
    class GLTFSkeleton extends Resource {
        constructor(identifier?: any)
        get_godot_skeleton(): null | Skeleton3D
        get_bone_attachment_count(): int64
        get_bone_attachment(idx: int64): null | BoneAttachment3D
        get joints(): PackedInt32Array
        set joints(value: PackedInt32Array | int32[])
        get roots(): PackedInt32Array
        set roots(value: PackedInt32Array | int32[])
        get unique_names(): GArray
        set unique_names(value: GArray)
        get godot_bone_node(): GDictionary
        set godot_bone_node(value: GDictionary)
        /** @deprecated Internal use. Does not exist at runtime. */
        __godotNameMap: __NameMapGLTFSkeleton;
    }
    /** @deprecated Internal use. Does not exist at runtime. */
    interface __NameMapGLTFSkin extends __NameMapResource {
    }
    /** @link https://docs.godotengine.org/en/4.5/classes/class_gltfskin.html */
    class GLTFSkin extends Resource {
        constructor(identifier?: any)
        get skin_root(): int64
        set skin_root(value: int64)
        get joints_original(): PackedInt32Array
        set joints_original(value: PackedInt32Array | int32[])
        get inverse_binds(): GArray
        set inverse_binds(value: GArray)
        get joints(): PackedInt32Array
        set joints(value: PackedInt32Array | int32[])
        get non_joints(): PackedInt32Array
        set non_joints(value: PackedInt32Array | int32[])
        get roots(): PackedInt32Array
        set roots(value: PackedInt32Array | int32[])
        get skeleton(): int64
        set skeleton(value: int64)
        get joint_i_to_bone_i(): GDictionary
        set joint_i_to_bone_i(value: GDictionary)
        get joint_i_to_name(): GDictionary
        set joint_i_to_name(value: GDictionary)
        get godot_skin(): null | Skin
        set godot_skin(value: null | Skin)
        /** @deprecated Internal use. Does not exist at runtime. */
        __godotNameMap: __NameMapGLTFSkin;
    }
    /** @deprecated Internal use. Does not exist at runtime. */
    interface __NameMapGLTFSpecGloss extends __NameMapResource {
    }
    /** Archived glTF extension for specular/glossy materials.  
     *  	  
     *  @link https://docs.godotengine.org/en/4.5/classes/class_gltfspecgloss.html  
     */
    class GLTFSpecGloss extends Resource {
        constructor(identifier?: any)
        /** The diffuse texture. */
        get diffuse_img(): null | Object
        set diffuse_img(value: null | Object)
        
        /** The reflected diffuse factor of the material. */
        get diffuse_factor(): Color
        set diffuse_factor(value: Color)
        
        /** The glossiness or smoothness of the material. */
        get gloss_factor(): float64
        set gloss_factor(value: float64)
        
        /** The specular RGB color of the material. The alpha channel is unused. */
        get specular_factor(): Color
        set specular_factor(value: Color)
        
        /** The specular-glossiness texture. */
        get spec_gloss_img(): null | Object
        set spec_gloss_img(value: null | Object)
        /** @deprecated Internal use. Does not exist at runtime. */
        __godotNameMap: __NameMapGLTFSpecGloss;
    }
    /** @deprecated Internal use. Does not exist at runtime. */
    interface __NameMapGLTFState extends __NameMapResource {
    }
    /** Represents all data of a glTF file.  
     *  	  
     *  @link https://docs.godotengine.org/en/4.5/classes/class_gltfstate.html  
     */
    class GLTFState extends Resource {
        /** Discards all embedded textures and uses untextured materials. */
        static readonly HANDLE_BINARY_DISCARD_TEXTURES = 0
        
        /** Extracts embedded textures to be reimported and compressed. Editor only. Acts as uncompressed at runtime. */
        static readonly HANDLE_BINARY_EXTRACT_TEXTURES = 1
        
        /** Embeds textures VRAM compressed with Basis Universal into the generated scene. */
        static readonly HANDLE_BINARY_EMBED_AS_BASISU = 2
        
        /** Embeds textures compressed losslessly into the generated scene, matching old behavior. */
        static readonly HANDLE_BINARY_EMBED_AS_UNCOMPRESSED = 3
        constructor(identifier?: any)
        
        /** Appends an extension to the list of extensions used by this glTF file during serialization. If [param required] is `true`, the extension will also be added to the list of required extensions. Do not run this in [method GLTFDocumentExtension._export_post], as that stage is too late to add extensions. The final list is sorted alphabetically. */
        add_used_extension(extension_name: string, required: boolean): void
        
        /** Appends the given byte array [param data] to the buffers and creates a [GLTFBufferView] for it. The index of the destination [GLTFBufferView] is returned. If [param deduplication] is `true`, the buffers are first searched for duplicate data, otherwise new bytes are always appended. */
        append_data_to_buffers(data: PackedByteArray | byte[] | ArrayBuffer, deduplication: boolean): int64
        
        /** Appends the given [GLTFNode] to the state, and returns its new index. This can be used to export one Godot node as multiple glTF nodes, or inject new glTF nodes at import time. On import, this must be called before [method GLTFDocumentExtension._generate_scene_node] finishes for the parent node. On export, this must be called before [method GLTFDocumentExtension._export_node] runs for the parent node.  
         *  The [param godot_scene_node] parameter is the Godot scene node that corresponds to this glTF node. This is highly recommended to be set to a valid node, but may be `null` if there is no corresponding Godot scene node. One Godot scene node may be used for multiple glTF nodes, so if exporting multiple glTF nodes for one Godot scene node, use the same Godot scene node for each.  
         *  The [param parent_node_index] parameter is the index of the parent [GLTFNode] in the state. If `-1`, the node will be a root node, otherwise the new node will be added to the parent's list of children. The index will also be written to the [member GLTFNode.parent] property of the new node.  
         */
        append_gltf_node(gltf_node: GLTFNode, godot_scene_node: Node, parent_node_index: int64): int64
        
        /** Returns the number of [AnimationPlayer] nodes in this [GLTFState]. These nodes are only used during the export process when converting Godot [AnimationPlayer] nodes to glTF animations. */
        get_animation_players_count(idx: int64): int64
        
        /** Returns the [AnimationPlayer] node with the given index. These nodes are only used during the export process when converting Godot [AnimationPlayer] nodes to glTF animations. */
        get_animation_player(idx: int64): null | AnimationPlayer
        
        /** Returns the Godot scene node that corresponds to the same index as the [GLTFNode] it was generated from. This is the inverse of [method get_node_index]. Useful during the import process.  
         *      
         *  **Note:** Not every [GLTFNode] will have a scene node generated, and not every generated scene node will have a corresponding [GLTFNode]. If there is no scene node for this [GLTFNode] index, `null` is returned.  
         */
        get_scene_node(idx: int64): null | Node
        
        /** Returns the index of the [GLTFNode] corresponding to this Godot scene node. This is the inverse of [method get_scene_node]. Useful during the export process.  
         *      
         *  **Note:** Not every Godot scene node will have a corresponding [GLTFNode], and not every [GLTFNode] will have a scene node generated. If there is no [GLTFNode] index for this scene node, `-1` is returned.  
         */
        get_node_index(scene_node: Node): int64
        
        /** Gets additional arbitrary data in this [GLTFState] instance. This can be used to keep per-file state data in [GLTFDocumentExtension] classes, which is important because they are stateless.  
         *  The argument should be the [GLTFDocumentExtension] name (does not have to match the extension name in the glTF file), and the return value can be anything you set. If nothing was set, the return value is `null`.  
         */
        get_additional_data(extension_name: StringName): any
        
        /** Sets additional arbitrary data in this [GLTFState] instance. This can be used to keep per-file state data in [GLTFDocumentExtension] classes, which is important because they are stateless.  
         *  The first argument should be the [GLTFDocumentExtension] name (does not have to match the extension name in the glTF file), and the second argument can be anything you want.  
         */
        set_additional_data(extension_name: StringName, additional_data: any): void
        
        /** The original raw JSON document corresponding to this GLTFState. */
        get json(): GDictionary
        set json(value: GDictionary)
        get major_version(): int64
        set major_version(value: int64)
        get minor_version(): int64
        set minor_version(value: int64)
        
        /** The copyright string in the asset header of the glTF file. This is set during import if present and export if non-empty. See the glTF asset header documentation for more information. */
        get copyright(): string
        set copyright(value: string)
        
        /** The binary buffer attached to a .glb file. */
        get glb_data(): PackedByteArray
        set glb_data(value: PackedByteArray | byte[] | ArrayBuffer)
        get use_named_skin_binds(): boolean
        set use_named_skin_binds(value: boolean)
        get nodes(): GArray
        set nodes(value: GArray)
        get buffers(): GArray
        set buffers(value: GArray)
        get buffer_views(): GArray
        set buffer_views(value: GArray)
        get accessors(): GArray
        set accessors(value: GArray)
        get meshes(): GArray
        set meshes(value: GArray)
        get materials(): GArray
        set materials(value: GArray)
        
        /** The name of the scene. When importing, if not specified, this will be the file name. When exporting, if specified, the scene name will be saved to the glTF file. */
        get scene_name(): string
        set scene_name(value: string)
        
        /** The folder path associated with this glTF data. This is used to find other files the glTF file references, like images or binary buffers. This will be set during import when appending from a file, and will be set during export when writing to a file. */
        get base_path(): string
        set base_path(value: string)
        
        /** The file name associated with this glTF data. If it ends with `.gltf`, this is text-based glTF, otherwise this is binary GLB. This will be set during import when appending from a file, and will be set during export when writing to a file. If writing to a buffer, this will be an empty string. */
        get filename(): string
        set filename(value: string)
        
        /** The root nodes of the glTF file. Typically, a glTF file will only have one scene, and therefore one root node. However, a glTF file may have multiple scenes and therefore multiple root nodes, which will be generated as siblings of each other and as children of the root node of the generated Godot scene. */
        get root_nodes(): PackedInt32Array
        set root_nodes(value: PackedInt32Array | int32[])
        get textures(): GArray
        set textures(value: GArray)
        get texture_samplers(): GArray
        set texture_samplers(value: GArray)
        get images(): GArray
        set images(value: GArray)
        get skins(): GArray
        set skins(value: GArray)
        get cameras(): GArray
        set cameras(value: GArray)
        get lights(): GArray
        set lights(value: GArray)
        get unique_names(): GArray
        set unique_names(value: GArray)
        get unique_animation_names(): GArray
        set unique_animation_names(value: GArray)
        get skeletons(): GArray
        set skeletons(value: GArray)
        get create_animations(): boolean
        set create_animations(value: boolean)
        
        /** If `true`, forces all GLTFNodes in the document to be bones of a single [Skeleton3D] Godot node. */
        get import_as_skeleton_bones(): boolean
        set import_as_skeleton_bones(value: boolean)
        get animations(): GArray
        set animations(value: GArray)
        get handle_binary_image(): int64
        set handle_binary_image(value: int64)
        
        /** The baking fps of the animation for either import or export. */
        get bake_fps(): float64
        set bake_fps(value: float64)
        /** @deprecated Internal use. Does not exist at runtime. */
        __godotNameMap: __NameMapGLTFState;
    }
    /** @deprecated Internal use. Does not exist at runtime. */
    interface __NameMapGLTFTexture extends __NameMapResource {
    }
    /** GLTFTexture represents a texture in a glTF file.  
     *  	  
     *  @link https://docs.godotengine.org/en/4.5/classes/class_gltftexture.html  
     */
    class GLTFTexture extends Resource {
        constructor(identifier?: any)
        /** The index of the image associated with this texture, see [method GLTFState.get_images]. If -1, then this texture does not have an image assigned. */
        get src_image(): int64
        set src_image(value: int64)
        
        /** ID of the texture sampler to use when sampling the image. If -1, then the default texture sampler is used (linear filtering, and repeat wrapping in both axes). */
        get sampler(): int64
        set sampler(value: int64)
        /** @deprecated Internal use. Does not exist at runtime. */
        __godotNameMap: __NameMapGLTFTexture;
    }
    /** @deprecated Internal use. Does not exist at runtime. */
    interface __NameMapGLTFTextureSampler extends __NameMapResource {
    }
    /** Represents a glTF texture sampler  
     *  	  
     *  @link https://docs.godotengine.org/en/4.5/classes/class_gltftexturesampler.html  
     */
    class GLTFTextureSampler extends Resource {
        constructor(identifier?: any)
        /** Texture's magnification filter, used when texture appears larger on screen than the source image. */
        get mag_filter(): int64
        set mag_filter(value: int64)
        
        /** Texture's minification filter, used when the texture appears smaller on screen than the source image. */
        get min_filter(): int64
        set min_filter(value: int64)
        
        /** Wrapping mode to use for S-axis (horizontal) texture coordinates. */
        get wrap_s(): int64
        set wrap_s(value: int64)
        
        /** Wrapping mode to use for T-axis (vertical) texture coordinates. */
        get wrap_t(): int64
        set wrap_t(value: int64)
        /** @deprecated Internal use. Does not exist at runtime. */
        __godotNameMap: __NameMapGLTFTextureSampler;
    }
    namespace GPUParticles2D {
        enum DrawOrder {
            /** Particles are drawn in the order emitted. */
            DRAW_ORDER_INDEX = 0,
            
            /** Particles are drawn in order of remaining lifetime. In other words, the particle with the highest lifetime is drawn at the front. */
            DRAW_ORDER_LIFETIME = 1,
            
            /** Particles are drawn in reverse order of remaining lifetime. In other words, the particle with the lowest lifetime is drawn at the front. */
            DRAW_ORDER_REVERSE_LIFETIME = 2,
        }
        enum EmitFlags {
            /** Particle starts at the specified position. */
            EMIT_FLAG_POSITION = 1,
            
            /** Particle starts with specified rotation and scale. */
            EMIT_FLAG_ROTATION_SCALE = 2,
            
            /** Particle starts with the specified velocity vector, which defines the emission direction and speed. */
            EMIT_FLAG_VELOCITY = 4,
            
            /** Particle starts with specified color. */
            EMIT_FLAG_COLOR = 8,
            
            /** Particle starts with specified `CUSTOM` data. */
            EMIT_FLAG_CUSTOM = 16,
        }
    }
    /** @deprecated Internal use. Does not exist at runtime. */
    interface __NameMapGPUParticles2D extends __NameMapNode2D {
    }
    /** A 2D particle emitter.  
     *  	  
     *  @link https://docs.godotengine.org/en/4.5/classes/class_gpuparticles2d.html  
     */
    class GPUParticles2D<Map extends NodePathMap = any> extends Node2D<Map> {
        constructor(identifier?: any)
        /** Requests the particles to process for extra process time during a single frame.  
         *  Useful for particle playback, if used in combination with [member use_fixed_seed] or by calling [method restart] with parameter `keep_seed` set to `true`.  
         */
        request_particles_process(process_time: float64): void
        
        /** Returns a rectangle containing the positions of all existing particles.  
         *      
         *  **Note:** When using threaded rendering this method synchronizes the rendering thread. Calling it often may have a negative impact on performance.  
         */
        capture_rect(): Rect2
        
        /** Restarts the particle emission cycle, clearing existing particles. To avoid particles vanishing from the viewport, wait for the [signal finished] signal before calling.  
         *      
         *  **Note:** The [signal finished] signal is only emitted by [member one_shot] emitters.  
         *  If [param keep_seed] is `true`, the current random seed will be preserved. Useful for seeking and playback.  
         */
        restart(keep_seed?: boolean /* = false */): void
        
        /** Emits a single particle. Whether [param xform], [param velocity], [param color] and [param custom] are applied depends on the value of [param flags]. See [enum EmitFlags].  
         *  The default ParticleProcessMaterial will overwrite [param color] and use the contents of [param custom] as `(rotation, age, animation, lifetime)`.  
         *      
         *  **Note:** [method emit_particle] is only supported on the Forward+ and Mobile rendering methods, not Compatibility.  
         */
        emit_particle(xform: Transform2D, velocity: Vector2, color: Color, custom: Color, flags: int64): void
        
        /** Sets this node's properties to match a given [CPUParticles2D] node. */
        convert_from_particles(particles: Node): void
        
        /** If `true`, particles are being emitted. [member emitting] can be used to start and stop particles from emitting. However, if [member one_shot] is `true` setting [member emitting] to `true` will not restart the emission cycle unless all active particles have finished processing. Use the [signal finished] signal to be notified once all active particles finish processing.  
         *      
         *  **Note:** For [member one_shot] emitters, due to the particles being computed on the GPU, there may be a short period after receiving the [signal finished] signal during which setting this to `true` will not restart the emission cycle.  
         *  **Tip:** If your [member one_shot] emitter needs to immediately restart emitting particles once [signal finished] signal is received, consider calling [method restart] instead of setting [member emitting].  
         */
        get emitting(): boolean
        set emitting(value: boolean)
        
        /** The number of particles to emit in one emission cycle. The effective emission rate is `(amount * amount_ratio) / lifetime` particles per second. Higher values will increase GPU requirements, even if not all particles are visible at a given time or if [member amount_ratio] is decreased.  
         *      
         *  **Note:** Changing this value will cause the particle system to restart. To avoid this, change [member amount_ratio] instead.  
         */
        get amount(): int64
        set amount(value: int64)
        
        /** The ratio of particles that should actually be emitted. If set to a value lower than `1.0`, this will set the amount of emitted particles throughout the lifetime to `amount * amount_ratio`. Unlike changing [member amount], changing [member amount_ratio] while emitting does not affect already-emitted particles and doesn't cause the particle system to restart. [member amount_ratio] can be used to create effects that make the number of emitted particles vary over time.  
         *      
         *  **Note:** Reducing the [member amount_ratio] has no performance benefit, since resources need to be allocated and processed for the total [member amount] of particles regardless of the [member amount_ratio]. If you don't intend to change the number of particles emitted while the particles are emitting, make sure [member amount_ratio] is set to `1` and change [member amount] to your liking instead.  
         */
        get amount_ratio(): float64
        set amount_ratio(value: float64)
        
        /** Path to another [GPUParticles2D] node that will be used as a subemitter (see [member ParticleProcessMaterial.sub_emitter_mode]). Subemitters can be used to achieve effects such as fireworks, sparks on collision, bubbles popping into water drops, and more.  
         *      
         *  **Note:** When [member sub_emitter] is set, the target [GPUParticles2D] node will no longer emit particles on its own.  
         */
        get sub_emitter(): NodePath
        set sub_emitter(value: NodePath | string)
        
        /** Particle texture. If `null`, particles will be squares with a size of 1×1 pixels.  
         *      
         *  **Note:** To use a flipbook texture, assign a new [CanvasItemMaterial] to the [GPUParticles2D]'s [member CanvasItem.material] property, then enable [member CanvasItemMaterial.particles_animation] and set [member CanvasItemMaterial.particles_anim_h_frames], [member CanvasItemMaterial.particles_anim_v_frames], and [member CanvasItemMaterial.particles_anim_loop] to match the flipbook texture.  
         */
        get texture(): null | Texture2D
        set texture(value: null | Texture2D)
        
        /** The amount of time each particle will exist (in seconds). The effective emission rate is `(amount * amount_ratio) / lifetime` particles per second. */
        get lifetime(): float64
        set lifetime(value: float64)
        
        /** Causes all the particles in this node to interpolate towards the end of their lifetime.  
         *      
         *  **Note:** This only works when used with a [ParticleProcessMaterial]. It needs to be manually implemented for custom process shaders.  
         */
        get interp_to_end(): float64
        set interp_to_end(value: float64)
        
        /** If `true`, only one emission cycle occurs. If set `true` during a cycle, emission will stop at the cycle's end. */
        get one_shot(): boolean
        set one_shot(value: boolean)
        
        /** Particle system starts as if it had already run for this many seconds.  
         *      
         *  **Note:** This can be very expensive if set to a high number as it requires running the particle shader a number of times equal to the [member fixed_fps] (or 30, if [member fixed_fps] is 0) for every second. In extreme cases it can even lead to a GPU crash due to the volume of work done in a single frame.  
         */
        get preprocess(): float64
        set preprocess(value: float64)
        
        /** Particle system's running speed scaling ratio. A value of `0` can be used to pause the particles. */
        get speed_scale(): float64
        set speed_scale(value: float64)
        
        /** How rapidly particles in an emission cycle are emitted. If greater than `0`, there will be a gap in emissions before the next cycle begins. */
        get explosiveness(): float64
        set explosiveness(value: float64)
        
        /** Emission lifetime randomness ratio. */
        get randomness(): float64
        set randomness(value: float64)
        
        /** If `true`, particles will use the same seed for every simulation using the seed defined in [member seed]. This is useful for situations where the visual outcome should be consistent across replays, for example when using Movie Maker mode. */
        get use_fixed_seed(): boolean
        set use_fixed_seed(value: boolean)
        
        /** Sets the random seed used by the particle system. Only effective if [member use_fixed_seed] is `true`. */
        get seed(): int64
        set seed(value: int64)
        
        /** The particle system's frame rate is fixed to a value. For example, changing the value to 2 will make the particles render at 2 frames per second. Note this does not slow down the simulation of the particle system itself. */
        get fixed_fps(): int64
        set fixed_fps(value: int64)
        
        /** Enables particle interpolation, which makes the particle movement smoother when their [member fixed_fps] is lower than the screen refresh rate. */
        get interpolate(): boolean
        set interpolate(value: boolean)
        
        /** If `true`, results in fractional delta calculation which has a smoother particles display effect. */
        get fract_delta(): boolean
        set fract_delta(value: boolean)
        
        /** Multiplier for particle's collision radius. `1.0` corresponds to the size of the sprite. If particles appear to sink into the ground when colliding, increase this value. If particles appear to float when colliding, decrease this value. Only effective if [member ParticleProcessMaterial.collision_mode] is [constant ParticleProcessMaterial.COLLISION_RIGID] or [constant ParticleProcessMaterial.COLLISION_HIDE_ON_CONTACT].  
         *      
         *  **Note:** Particles always have a spherical collision shape.  
         */
        get collision_base_size(): float64
        set collision_base_size(value: float64)
        
        /** The [Rect2] that determines the node's region which needs to be visible on screen for the particle system to be active.  
         *  Grow the rect if particles suddenly appear/disappear when the node enters/exits the screen. The [Rect2] can be grown via code or with the **Particles → Generate Visibility Rect** editor tool.  
         */
        get visibility_rect(): Rect2
        set visibility_rect(value: Rect2)
        
        /** If `true`, particles use the parent node's coordinate space (known as local coordinates). This will cause particles to move and rotate along the [GPUParticles2D] node (and its parents) when it is moved or rotated. If `false`, particles use global coordinates; they will not move or rotate along the [GPUParticles2D] node (and its parents) when it is moved or rotated. */
        get local_coords(): boolean
        set local_coords(value: boolean)
        
        /** Particle draw order. */
        get draw_order(): int64
        set draw_order(value: int64)
        
        /** If `true`, enables particle trails using a mesh skinning system.  
         *      
         *  **Note:** Unlike [GPUParticles3D], the number of trail sections and subdivisions is set with the [member trail_sections] and [member trail_section_subdivisions] properties.  
         */
        get trail_enabled(): boolean
        set trail_enabled(value: boolean)
        
        /** The amount of time the particle's trail should represent (in seconds). Only effective if [member trail_enabled] is `true`. */
        get trail_lifetime(): float64
        set trail_lifetime(value: float64)
        
        /** The number of sections to use for the particle trail rendering. Higher values can result in smoother trail curves, at the cost of performance due to increased mesh complexity. See also [member trail_section_subdivisions]. Only effective if [member trail_enabled] is `true`. */
        get trail_sections(): int64
        set trail_sections(value: int64)
        
        /** The number of subdivisions to use for the particle trail rendering. Higher values can result in smoother trail curves, at the cost of performance due to increased mesh complexity. See also [member trail_sections]. Only effective if [member trail_enabled] is `true`. */
        get trail_section_subdivisions(): int64
        set trail_section_subdivisions(value: int64)
        
        /** [Material] for processing particles. Can be a [ParticleProcessMaterial] or a [ShaderMaterial]. */
        get process_material(): null | ParticleProcessMaterial | ShaderMaterial
        set process_material(value: null | ParticleProcessMaterial | ShaderMaterial)
        
        /** Emitted when all active particles have finished processing. To immediately restart the emission cycle, call [method restart].  
         *  This signal is never emitted when [member one_shot] is disabled, as particles will be emitted and processed continuously.  
         *      
         *  **Note:** For [member one_shot] emitters, due to the particles being computed on the GPU, there may be a short period after receiving the signal during which setting [member emitting] to `true` will not restart the emission cycle. This delay is avoided by instead calling [method restart].  
         */
        readonly finished: Signal<() => void>
        /** @deprecated Internal use. Does not exist at runtime. */
        __godotNameMap: __NameMapGPUParticles2D;
    }
    namespace GPUParticles3D {
        enum DrawOrder {
            /** Particles are drawn in the order emitted. */
            DRAW_ORDER_INDEX = 0,
            
            /** Particles are drawn in order of remaining lifetime. In other words, the particle with the highest lifetime is drawn at the front. */
            DRAW_ORDER_LIFETIME = 1,
            
            /** Particles are drawn in reverse order of remaining lifetime. In other words, the particle with the lowest lifetime is drawn at the front. */
            DRAW_ORDER_REVERSE_LIFETIME = 2,
            
            /** Particles are drawn in order of depth. */
            DRAW_ORDER_VIEW_DEPTH = 3,
        }
        enum EmitFlags {
            /** Particle starts at the specified position. */
            EMIT_FLAG_POSITION = 1,
            
            /** Particle starts with specified rotation and scale. */
            EMIT_FLAG_ROTATION_SCALE = 2,
            
            /** Particle starts with the specified velocity vector, which defines the emission direction and speed. */
            EMIT_FLAG_VELOCITY = 4,
            
            /** Particle starts with specified color. */
            EMIT_FLAG_COLOR = 8,
            
            /** Particle starts with specified `CUSTOM` data. */
            EMIT_FLAG_CUSTOM = 16,
        }
        enum TransformAlign {
            TRANSFORM_ALIGN_DISABLED = 0,
            TRANSFORM_ALIGN_Z_BILLBOARD = 1,
            TRANSFORM_ALIGN_Y_TO_VELOCITY = 2,
            TRANSFORM_ALIGN_Z_BILLBOARD_Y_TO_VELOCITY = 3,
        }
    }
    /** @deprecated Internal use. Does not exist at runtime. */
    interface __NameMapGPUParticles3D extends __NameMapGeometryInstance3D {
    }
    /** A 3D particle emitter.  
     *  	  
     *  @link https://docs.godotengine.org/en/4.5/classes/class_gpuparticles3d.html  
     */
    class GPUParticles3D<Map extends NodePathMap = any> extends GeometryInstance3D<Map> {
        /** Maximum number of draw passes supported. */
        static readonly MAX_DRAW_PASSES = 4
        constructor(identifier?: any)
        
        /** Sets the [Mesh] that is drawn at index [param pass]. */
        set_draw_pass_mesh(pass: int64, mesh: Mesh): void
        
        /** Returns the [Mesh] that is drawn at index [param pass]. */
        get_draw_pass_mesh(pass: int64): null | Mesh
        
        /** Restarts the particle emission cycle, clearing existing particles. To avoid particles vanishing from the viewport, wait for the [signal finished] signal before calling.  
         *      
         *  **Note:** The [signal finished] signal is only emitted by [member one_shot] emitters.  
         *  If [param keep_seed] is `true`, the current random seed will be preserved. Useful for seeking and playback.  
         */
        restart(keep_seed?: boolean /* = false */): void
        
        /** Returns the axis-aligned bounding box that contains all the particles that are active in the current frame. */
        capture_aabb(): AABB
        
        /** Emits a single particle. Whether [param xform], [param velocity], [param color] and [param custom] are applied depends on the value of [param flags]. See [enum EmitFlags].  
         *  The default ParticleProcessMaterial will overwrite [param color] and use the contents of [param custom] as `(rotation, age, animation, lifetime)`.  
         *      
         *  **Note:** [method emit_particle] is only supported on the Forward+ and Mobile rendering methods, not Compatibility.  
         */
        emit_particle(xform: Transform3D, velocity: Vector3, color: Color, custom: Color, flags: int64): void
        
        /** Sets this node's properties to match a given [CPUParticles3D] node. */
        convert_from_particles(particles: Node): void
        
        /** Requests the particles to process for extra process time during a single frame.  
         *  Useful for particle playback, if used in combination with [member use_fixed_seed] or by calling [method restart] with parameter `keep_seed` set to `true`.  
         */
        request_particles_process(process_time: float64): void
        
        /** If `true`, particles are being emitted. [member emitting] can be used to start and stop particles from emitting. However, if [member one_shot] is `true` setting [member emitting] to `true` will not restart the emission cycle unless all active particles have finished processing. Use the [signal finished] signal to be notified once all active particles finish processing.  
         *      
         *  **Note:** For [member one_shot] emitters, due to the particles being computed on the GPU, there may be a short period after receiving the [signal finished] signal during which setting this to `true` will not restart the emission cycle.  
         *  **Tip:** If your [member one_shot] emitter needs to immediately restart emitting particles once [signal finished] signal is received, consider calling [method restart] instead of setting [member emitting].  
         */
        get emitting(): boolean
        set emitting(value: boolean)
        
        /** The number of particles to emit in one emission cycle. The effective emission rate is `(amount * amount_ratio) / lifetime` particles per second. Higher values will increase GPU requirements, even if not all particles are visible at a given time or if [member amount_ratio] is decreased.  
         *      
         *  **Note:** Changing this value will cause the particle system to restart. To avoid this, change [member amount_ratio] instead.  
         */
        get amount(): int64
        set amount(value: int64)
        
        /** The ratio of particles that should actually be emitted. If set to a value lower than `1.0`, this will set the amount of emitted particles throughout the lifetime to `amount * amount_ratio`. Unlike changing [member amount], changing [member amount_ratio] while emitting does not affect already-emitted particles and doesn't cause the particle system to restart. [member amount_ratio] can be used to create effects that make the number of emitted particles vary over time.  
         *      
         *  **Note:** Reducing the [member amount_ratio] has no performance benefit, since resources need to be allocated and processed for the total [member amount] of particles regardless of the [member amount_ratio]. If you don't intend to change the number of particles emitted while the particles are emitting, make sure [member amount_ratio] is set to `1` and change [member amount] to your liking instead.  
         */
        get amount_ratio(): float64
        set amount_ratio(value: float64)
        
        /** Path to another [GPUParticles3D] node that will be used as a subemitter (see [member ParticleProcessMaterial.sub_emitter_mode]). Subemitters can be used to achieve effects such as fireworks, sparks on collision, bubbles popping into water drops, and more.  
         *      
         *  **Note:** When [member sub_emitter] is set, the target [GPUParticles3D] node will no longer emit particles on its own.  
         */
        get sub_emitter(): NodePath
        set sub_emitter(value: NodePath | string)
        
        /** The amount of time each particle will exist (in seconds). The effective emission rate is `(amount * amount_ratio) / lifetime` particles per second. */
        get lifetime(): float64
        set lifetime(value: float64)
        
        /** Causes all the particles in this node to interpolate towards the end of their lifetime.  
         *      
         *  **Note:** This only works when used with a [ParticleProcessMaterial]. It needs to be manually implemented for custom process shaders.  
         */
        get interp_to_end(): float64
        set interp_to_end(value: float64)
        
        /** If `true`, only the number of particles equal to [member amount] will be emitted. */
        get one_shot(): boolean
        set one_shot(value: boolean)
        
        /** Amount of time to preprocess the particles before animation starts. Lets you start the animation some time after particles have started emitting.  
         *      
         *  **Note:** This can be very expensive if set to a high number as it requires running the particle shader a number of times equal to the [member fixed_fps] (or 30, if [member fixed_fps] is 0) for every second. In extreme cases it can even lead to a GPU crash due to the volume of work done in a single frame.  
         */
        get preprocess(): float64
        set preprocess(value: float64)
        
        /** Speed scaling ratio. A value of `0` can be used to pause the particles. */
        get speed_scale(): float64
        set speed_scale(value: float64)
        
        /** Time ratio between each emission. If `0`, particles are emitted continuously. If `1`, all particles are emitted simultaneously. */
        get explosiveness(): float64
        set explosiveness(value: float64)
        
        /** Emission randomness ratio. */
        get randomness(): float64
        set randomness(value: float64)
        
        /** If `true`, particles will use the same seed for every simulation using the seed defined in [member seed]. This is useful for situations where the visual outcome should be consistent across replays, for example when using Movie Maker mode. */
        get use_fixed_seed(): boolean
        set use_fixed_seed(value: boolean)
        
        /** Sets the random seed used by the particle system. Only effective if [member use_fixed_seed] is `true`. */
        get seed(): int64
        set seed(value: int64)
        
        /** The particle system's frame rate is fixed to a value. For example, changing the value to 2 will make the particles render at 2 frames per second. Note this does not slow down the simulation of the particle system itself. */
        get fixed_fps(): int64
        set fixed_fps(value: int64)
        
        /** Enables particle interpolation, which makes the particle movement smoother when their [member fixed_fps] is lower than the screen refresh rate. */
        get interpolate(): boolean
        set interpolate(value: boolean)
        
        /** If `true`, results in fractional delta calculation which has a smoother particles display effect. */
        get fract_delta(): boolean
        set fract_delta(value: boolean)
        
        /** The base diameter for particle collision in meters. If particles appear to sink into the ground when colliding, increase this value. If particles appear to float when colliding, decrease this value. Only effective if [member ParticleProcessMaterial.collision_mode] is [constant ParticleProcessMaterial.COLLISION_RIGID] or [constant ParticleProcessMaterial.COLLISION_HIDE_ON_CONTACT].  
         *      
         *  **Note:** Particles always have a spherical collision shape.  
         */
        get collision_base_size(): float64
        set collision_base_size(value: float64)
        
        /** The [AABB] that determines the node's region which needs to be visible on screen for the particle system to be active. [member GeometryInstance3D.extra_cull_margin] is added on each of the AABB's axes. Particle collisions and attraction will only occur within this area.  
         *  Grow the box if particles suddenly appear/disappear when the node enters/exits the screen. The [AABB] can be grown via code or with the **Particles → Generate AABB** editor tool.  
         *      
         *  **Note:** [member visibility_aabb] is overridden by [member GeometryInstance3D.custom_aabb] if that property is set to a non-default value.  
         */
        get visibility_aabb(): AABB
        set visibility_aabb(value: AABB)
        
        /** If `true`, particles use the parent node's coordinate space (known as local coordinates). This will cause particles to move and rotate along the [GPUParticles3D] node (and its parents) when it is moved or rotated. If `false`, particles use global coordinates; they will not move or rotate along the [GPUParticles3D] node (and its parents) when it is moved or rotated. */
        get local_coords(): boolean
        set local_coords(value: boolean)
        
        /** Particle draw order.  
         *      
         *  **Note:** [constant DRAW_ORDER_INDEX] is the only option that supports motion vectors for effects like TAA. It is suggested to use this draw order if the particles are opaque to fix ghosting artifacts.  
         */
        get draw_order(): int64
        set draw_order(value: int64)
        get transform_align(): int64
        set transform_align(value: int64)
        
        /** If `true`, enables particle trails using a mesh skinning system. Designed to work with [RibbonTrailMesh] and [TubeTrailMesh].  
         *      
         *  **Note:** [member BaseMaterial3D.use_particle_trails] must also be enabled on the particle mesh's material. Otherwise, setting [member trail_enabled] to `true` will have no effect.  
         *      
         *  **Note:** Unlike [GPUParticles2D], the number of trail sections and subdivisions is set in the [RibbonTrailMesh] or the [TubeTrailMesh]'s properties.  
         */
        get trail_enabled(): boolean
        set trail_enabled(value: boolean)
        
        /** The amount of time the particle's trail should represent (in seconds). Only effective if [member trail_enabled] is `true`. */
        get trail_lifetime(): float64
        set trail_lifetime(value: float64)
        
        /** [Material] for processing particles. Can be a [ParticleProcessMaterial] or a [ShaderMaterial]. */
        get process_material(): null | ParticleProcessMaterial | ShaderMaterial
        set process_material(value: null | ParticleProcessMaterial | ShaderMaterial)
        
        /** The number of draw passes when rendering particles. */
        get draw_passes(): int64
        set draw_passes(value: int64)
        
        /** [Mesh] that is drawn for the first draw pass. */
        get draw_pass_1(): null | Mesh
        set draw_pass_1(value: null | Mesh)
        
        /** [Mesh] that is drawn for the second draw pass. */
        get draw_pass_2(): null | Mesh
        set draw_pass_2(value: null | Mesh)
        
        /** [Mesh] that is drawn for the third draw pass. */
        get draw_pass_3(): null | Mesh
        set draw_pass_3(value: null | Mesh)
        
        /** [Mesh] that is drawn for the fourth draw pass. */
        get draw_pass_4(): null | Mesh
        set draw_pass_4(value: null | Mesh)
        get draw_skin(): null | Skin
        set draw_skin(value: null | Skin)
        
        /** Emitted when all active particles have finished processing. To immediately restart the emission cycle, call [method restart].  
         *  This signal is never emitted when [member one_shot] is disabled, as particles will be emitted and processed continuously.  
         *      
         *  **Note:** For [member one_shot] emitters, due to the particles being computed on the GPU, there may be a short period after receiving the signal during which setting [member emitting] to `true` will not restart the emission cycle. This delay is avoided by instead calling [method restart].  
         */
        readonly finished: Signal<() => void>
        /** @deprecated Internal use. Does not exist at runtime. */
        __godotNameMap: __NameMapGPUParticles3D;
    }
    /** @deprecated Internal use. Does not exist at runtime. */
    interface __NameMapGPUParticlesAttractor3D extends __NameMapVisualInstance3D {
    }
    /** Abstract base class for 3D particle attractors.  
     *  	  
     *  @link https://docs.godotengine.org/en/4.5/classes/class_gpuparticlesattractor3d.html  
     */
    class GPUParticlesAttractor3D<Map extends NodePathMap = any> extends VisualInstance3D<Map> {
        constructor(identifier?: any)
        /** Adjusts the strength of the attractor. If [member strength] is negative, particles will be pushed in the opposite direction. Particles will be pushed  *away*  from the attractor's origin if [member directionality] is `0.0`, or towards local +Z if [member directionality] is greater than `0.0`. */
        get strength(): float64
        set strength(value: float64)
        
        /** The particle attractor's attenuation. Higher values result in more gradual pushing of particles as they come closer to the attractor's origin. Zero or negative values will cause particles to be pushed very fast as soon as the touch the attractor's edges. */
        get attenuation(): float64
        set attenuation(value: float64)
        
        /** Adjusts how directional the attractor is. At `0.0`, the attractor is not directional at all: it will attract particles towards its center. At `1.0`, the attractor is fully directional: particles will always be pushed towards local -Z (or +Z if [member strength] is negative).  
         *      
         *  **Note:** If [member directionality] is greater than `0.0`, the direction in which particles are pushed can be changed by rotating the [GPUParticlesAttractor3D] node.  
         */
        get directionality(): float64
        set directionality(value: float64)
        
        /** The particle rendering layers ([member VisualInstance3D.layers]) that will be affected by the attractor. By default, all particles are affected by an attractor.  
         *  After configuring particle nodes accordingly, specific layers can be unchecked to prevent certain particles from being affected by attractors. For example, this can be used if you're using an attractor as part of a spell effect but don't want the attractor to affect unrelated weather particles at the same position.  
         *  Particle attraction can also be disabled on a per-process material basis by setting [member ParticleProcessMaterial.attractor_interaction_enabled] on the [GPUParticles3D] node.  
         */
        get cull_mask(): int64
        set cull_mask(value: int64)
        /** @deprecated Internal use. Does not exist at runtime. */
        __godotNameMap: __NameMapGPUParticlesAttractor3D;
    }
    /** @deprecated Internal use. Does not exist at runtime. */
    interface __NameMapGPUParticlesAttractorBox3D extends __NameMapGPUParticlesAttractor3D {
    }
    /** A box-shaped attractor that influences particles from [GPUParticles3D] nodes.  
     *  	  
     *  @link https://docs.godotengine.org/en/4.5/classes/class_gpuparticlesattractorbox3d.html  
     */
    class GPUParticlesAttractorBox3D<Map extends NodePathMap = any> extends GPUParticlesAttractor3D<Map> {
        constructor(identifier?: any)
        /** The attractor box's size in 3D units. */
        get size(): Vector3
        set size(value: Vector3)
        /** @deprecated Internal use. Does not exist at runtime. */
        __godotNameMap: __NameMapGPUParticlesAttractorBox3D;
    }
    /** @deprecated Internal use. Does not exist at runtime. */
    interface __NameMapGPUParticlesAttractorSphere3D extends __NameMapGPUParticlesAttractor3D {
    }
    /** A spheroid-shaped attractor that influences particles from [GPUParticles3D] nodes.  
     *  	  
     *  @link https://docs.godotengine.org/en/4.5/classes/class_gpuparticlesattractorsphere3d.html  
     */
    class GPUParticlesAttractorSphere3D<Map extends NodePathMap = any> extends GPUParticlesAttractor3D<Map> {
        constructor(identifier?: any)
        /** The attractor sphere's radius in 3D units.  
         *      
         *  **Note:** Stretched ellipses can be obtained by using non-uniform scaling on the [GPUParticlesAttractorSphere3D] node.  
         */
        get radius(): float64
        set radius(value: float64)
        /** @deprecated Internal use. Does not exist at runtime. */
        __godotNameMap: __NameMapGPUParticlesAttractorSphere3D;
    }
    /** @deprecated Internal use. Does not exist at runtime. */
    interface __NameMapGPUParticlesAttractorVectorField3D extends __NameMapGPUParticlesAttractor3D {
    }
    /** A box-shaped attractor with varying directions and strengths defined in it that influences particles from [GPUParticles3D] nodes.  
     *  	  
     *  @link https://docs.godotengine.org/en/4.5/classes/class_gpuparticlesattractorvectorfield3d.html  
     */
    class GPUParticlesAttractorVectorField3D<Map extends NodePathMap = any> extends GPUParticlesAttractor3D<Map> {
        constructor(identifier?: any)
        /** The size of the vector field box in 3D units. */
        get size(): Vector3
        set size(value: Vector3)
        
        /** The 3D texture to be used. Values are linearly interpolated between the texture's pixels.  
         *      
         *  **Note:** To get better performance, the 3D texture's resolution should reflect the [member size] of the attractor. Since particle attraction is usually low-frequency data, the texture can be kept at a low resolution such as 64×64×64.  
         */
        get texture(): null | Texture3D
        set texture(value: null | Texture3D)
        /** @deprecated Internal use. Does not exist at runtime. */
        __godotNameMap: __NameMapGPUParticlesAttractorVectorField3D;
    }
    /** @deprecated Internal use. Does not exist at runtime. */
    interface __NameMapGPUParticlesCollision3D extends __NameMapVisualInstance3D {
    }
    /** Abstract base class for 3D particle collision shapes affecting [GPUParticles3D] nodes.  
     *  	  
     *  @link https://docs.godotengine.org/en/4.5/classes/class_gpuparticlescollision3d.html  
     */
    class GPUParticlesCollision3D<Map extends NodePathMap = any> extends VisualInstance3D<Map> {
        constructor(identifier?: any)
        /** The particle rendering layers ([member VisualInstance3D.layers]) that will be affected by the collision shape. By default, all particles that have [member ParticleProcessMaterial.collision_mode] set to [constant ParticleProcessMaterial.COLLISION_RIGID] or [constant ParticleProcessMaterial.COLLISION_HIDE_ON_CONTACT] will be affected by a collision shape.  
         *  After configuring particle nodes accordingly, specific layers can be unchecked to prevent certain particles from being affected by colliders. For example, this can be used if you're using a collider as part of a spell effect but don't want the collider to affect unrelated weather particles at the same position.  
         *  Particle collision can also be disabled on a per-process material basis by setting [member ParticleProcessMaterial.collision_mode] on the [GPUParticles3D] node.  
         */
        get cull_mask(): int64
        set cull_mask(value: int64)
        /** @deprecated Internal use. Does not exist at runtime. */
        __godotNameMap: __NameMapGPUParticlesCollision3D;
    }
    /** @deprecated Internal use. Does not exist at runtime. */
    interface __NameMapGPUParticlesCollisionBox3D extends __NameMapGPUParticlesCollision3D {
    }
    /** A box-shaped 3D particle collision shape affecting [GPUParticles3D] nodes.  
     *  	  
     *  @link https://docs.godotengine.org/en/4.5/classes/class_gpuparticlescollisionbox3d.html  
     */
    class GPUParticlesCollisionBox3D<Map extends NodePathMap = any> extends GPUParticlesCollision3D<Map> {
        constructor(identifier?: any)
        /** The collision box's size in 3D units. */
        get size(): Vector3
        set size(value: Vector3)
        /** @deprecated Internal use. Does not exist at runtime. */
        __godotNameMap: __NameMapGPUParticlesCollisionBox3D;
    }
    namespace GPUParticlesCollisionHeightField3D {
        enum Resolution {
            /** Generate a 256×256 heightmap. Intended for small-scale scenes, or larger scenes with no distant particles. */
            RESOLUTION_256 = 0,
            
            /** Generate a 512×512 heightmap. Intended for medium-scale scenes, or larger scenes with no distant particles. */
            RESOLUTION_512 = 1,
            
            /** Generate a 1024×1024 heightmap. Intended for large scenes with distant particles. */
            RESOLUTION_1024 = 2,
            
            /** Generate a 2048×2048 heightmap. Intended for very large scenes with distant particles. */
            RESOLUTION_2048 = 3,
            
            /** Generate a 4096×4096 heightmap. Intended for huge scenes with distant particles. */
            RESOLUTION_4096 = 4,
            
            /** Generate a 8192×8192 heightmap. Intended for gigantic scenes with distant particles. */
            RESOLUTION_8192 = 5,
            
            /** Represents the size of the [enum Resolution] enum. */
            RESOLUTION_MAX = 6,
        }
        enum UpdateMode {
            /** Only update the heightmap when the [GPUParticlesCollisionHeightField3D] node is moved, or when the camera moves if [member follow_camera_enabled] is `true`. An update can be forced by slightly moving the [GPUParticlesCollisionHeightField3D] in any direction, or by calling [method RenderingServer.particles_collision_height_field_update]. */
            UPDATE_MODE_WHEN_MOVED = 0,
            
            /** Update the heightmap every frame. This has a significant performance cost. This update should only be used when geometry that particles can collide with changes significantly during gameplay. */
            UPDATE_MODE_ALWAYS = 1,
        }
    }
    /** @deprecated Internal use. Does not exist at runtime. */
    interface __NameMapGPUParticlesCollisionHeightField3D extends __NameMapGPUParticlesCollision3D {
    }
    /** A real-time heightmap-shaped 3D particle collision shape affecting [GPUParticles3D] nodes.  
     *  	  
     *  @link https://docs.godotengine.org/en/4.5/classes/class_gpuparticlescollisionheightfield3d.html  
     */
    class GPUParticlesCollisionHeightField3D<Map extends NodePathMap = any> extends GPUParticlesCollision3D<Map> {
        constructor(identifier?: any)
        /** Based on [param value], enables or disables the specified layer in the [member heightfield_mask], given a [param layer_number] between `1` and `20`, inclusive. */
        set_heightfield_mask_value(layer_number: int64, value: boolean): void
        
        /** Returns `true` if the specified layer of the [member heightfield_mask] is enabled, given a [param layer_number] between `1` and `20`, inclusive. */
        get_heightfield_mask_value(layer_number: int64): boolean
        
        /** The collision heightmap's size in 3D units. To improve heightmap quality, [member size] should be set as small as possible while covering the parts of the scene you need. */
        get size(): Vector3
        set size(value: Vector3)
        
        /** Higher resolutions can represent small details more accurately in large scenes, at the cost of lower performance. If [member update_mode] is [constant UPDATE_MODE_ALWAYS], consider using the lowest resolution possible. */
        get resolution(): int64
        set resolution(value: int64)
        
        /** The update policy to use for the generated heightmap. */
        get update_mode(): int64
        set update_mode(value: int64)
        
        /** If `true`, the [GPUParticlesCollisionHeightField3D] will follow the current camera in global space. The [GPUParticlesCollisionHeightField3D] does not need to be a child of the [Camera3D] node for this to work.  
         *  Following the camera has a performance cost, as it will force the heightmap to update whenever the camera moves. Consider lowering [member resolution] to improve performance if [member follow_camera_enabled] is `true`.  
         */
        get follow_camera_enabled(): boolean
        set follow_camera_enabled(value: boolean)
        
        /** The visual layers to account for when updating the heightmap. Only [MeshInstance3D]s whose [member VisualInstance3D.layers] match with this [member heightfield_mask] will be included in the heightmap collision update. By default, all 20 user-visible layers are taken into account for updating the heightmap collision.  
         *      
         *  **Note:** Since the [member heightfield_mask] allows for 32 layers to be stored in total, there are an additional 12 layers that are only used internally by the engine and aren't exposed in the editor. Setting [member heightfield_mask] using a script allows you to toggle those reserved layers, which can be useful for editor plugins.  
         *  To adjust [member heightfield_mask] more easily using a script, use [method get_heightfield_mask_value] and [method set_heightfield_mask_value].  
         */
        get heightfield_mask(): int64
        set heightfield_mask(value: int64)
        /** @deprecated Internal use. Does not exist at runtime. */
        __godotNameMap: __NameMapGPUParticlesCollisionHeightField3D;
    }
    namespace GPUParticlesCollisionSDF3D {
        enum Resolution {
            /** Bake a 16×16×16 signed distance field. This is the fastest option, but also the least precise. */
            RESOLUTION_16 = 0,
            
            /** Bake a 32×32×32 signed distance field. */
            RESOLUTION_32 = 1,
            
            /** Bake a 64×64×64 signed distance field. */
            RESOLUTION_64 = 2,
            
            /** Bake a 128×128×128 signed distance field. */
            RESOLUTION_128 = 3,
            
            /** Bake a 256×256×256 signed distance field. */
            RESOLUTION_256 = 4,
            
            /** Bake a 512×512×512 signed distance field. This is the slowest option, but also the most precise. */
            RESOLUTION_512 = 5,
            
            /** Represents the size of the [enum Resolution] enum. */
            RESOLUTION_MAX = 6,
        }
    }
    /** @deprecated Internal use. Does not exist at runtime. */
    interface __NameMapGPUParticlesCollisionSDF3D extends __NameMapGPUParticlesCollision3D {
    }
    /** A baked signed distance field 3D particle collision shape affecting [GPUParticles3D] nodes.  
     *  	  
     *  @link https://docs.godotengine.org/en/4.5/classes/class_gpuparticlescollisionsdf3d.html  
     */
    class GPUParticlesCollisionSDF3D<Map extends NodePathMap = any> extends GPUParticlesCollision3D<Map> {
        constructor(identifier?: any)
        /** Based on [param value], enables or disables the specified layer in the [member bake_mask], given a [param layer_number] between 1 and 32. */
        set_bake_mask_value(layer_number: int64, value: boolean): void
        
        /** Returns whether or not the specified layer of the [member bake_mask] is enabled, given a [param layer_number] between 1 and 32. */
        get_bake_mask_value(layer_number: int64): boolean
        
        /** The collision SDF's size in 3D units. To improve SDF quality, the [member size] should be set as small as possible while covering the parts of the scene you need. */
        get size(): Vector3
        set size(value: Vector3)
        
        /** The bake resolution to use for the signed distance field [member texture]. The texture must be baked again for changes to the [member resolution] property to be effective. Higher resolutions have a greater performance cost and take more time to bake. Higher resolutions also result in larger baked textures, leading to increased VRAM and storage space requirements. To improve performance and reduce bake times, use the lowest resolution possible for the object you're representing the collision of. */
        get resolution(): int64
        set resolution(value: int64)
        
        /** The collision shape's thickness. Unlike other particle colliders, [GPUParticlesCollisionSDF3D] is actually hollow on the inside. [member thickness] can be increased to prevent particles from tunneling through the collision shape at high speeds, or when the [GPUParticlesCollisionSDF3D] is moved. */
        get thickness(): float64
        set thickness(value: float64)
        
        /** The visual layers to account for when baking the particle collision SDF. Only [MeshInstance3D]s whose [member VisualInstance3D.layers] match with this [member bake_mask] will be included in the generated particle collision SDF. By default, all objects are taken into account for the particle collision SDF baking. */
        get bake_mask(): int64
        set bake_mask(value: int64)
        
        /** The 3D texture representing the signed distance field. */
        get texture(): null | Texture3D
        set texture(value: null | Texture3D)
        /** @deprecated Internal use. Does not exist at runtime. */
        __godotNameMap: __NameMapGPUParticlesCollisionSDF3D;
    }
    /** @deprecated Internal use. Does not exist at runtime. */
    interface __NameMapGPUParticlesCollisionSphere3D extends __NameMapGPUParticlesCollision3D {
    }
    /** A sphere-shaped 3D particle collision shape affecting [GPUParticles3D] nodes.  
     *  	  
     *  @link https://docs.godotengine.org/en/4.5/classes/class_gpuparticlescollisionsphere3d.html  
     */
    class GPUParticlesCollisionSphere3D<Map extends NodePathMap = any> extends GPUParticlesCollision3D<Map> {
        constructor(identifier?: any)
        /** The collision sphere's radius in 3D units. */
        get radius(): float64
        set radius(value: float64)
        /** @deprecated Internal use. Does not exist at runtime. */
        __godotNameMap: __NameMapGPUParticlesCollisionSphere3D;
    }
    namespace Generic6DOFJoint3D {
        enum Param {
            /** The minimum difference between the pivot points' axes. */
            PARAM_LINEAR_LOWER_LIMIT = 0,
            
            /** The maximum difference between the pivot points' axes. */
            PARAM_LINEAR_UPPER_LIMIT = 1,
            
            /** A factor applied to the movement across the axes. The lower, the slower the movement. */
            PARAM_LINEAR_LIMIT_SOFTNESS = 2,
            
            /** The amount of restitution on the axes' movement. The lower, the more momentum gets lost. */
            PARAM_LINEAR_RESTITUTION = 3,
            
            /** The amount of damping that happens at the linear motion across the axes. */
            PARAM_LINEAR_DAMPING = 4,
            
            /** The velocity the linear motor will try to reach. */
            PARAM_LINEAR_MOTOR_TARGET_VELOCITY = 5,
            
            /** The maximum force the linear motor will apply while trying to reach the velocity target. */
            PARAM_LINEAR_MOTOR_FORCE_LIMIT = 6,
            PARAM_LINEAR_SPRING_STIFFNESS = 7,
            PARAM_LINEAR_SPRING_DAMPING = 8,
            PARAM_LINEAR_SPRING_EQUILIBRIUM_POINT = 9,
            
            /** The minimum rotation in negative direction to break loose and rotate around the axes. */
            PARAM_ANGULAR_LOWER_LIMIT = 10,
            
            /** The minimum rotation in positive direction to break loose and rotate around the axes. */
            PARAM_ANGULAR_UPPER_LIMIT = 11,
            
            /** The speed of all rotations across the axes. */
            PARAM_ANGULAR_LIMIT_SOFTNESS = 12,
            
            /** The amount of rotational damping across the axes. The lower, the more damping occurs. */
            PARAM_ANGULAR_DAMPING = 13,
            
            /** The amount of rotational restitution across the axes. The lower, the more restitution occurs. */
            PARAM_ANGULAR_RESTITUTION = 14,
            
            /** The maximum amount of force that can occur, when rotating around the axes. */
            PARAM_ANGULAR_FORCE_LIMIT = 15,
            
            /** When rotating across the axes, this error tolerance factor defines how much the correction gets slowed down. The lower, the slower. */
            PARAM_ANGULAR_ERP = 16,
            
            /** Target speed for the motor at the axes. */
            PARAM_ANGULAR_MOTOR_TARGET_VELOCITY = 17,
            
            /** Maximum acceleration for the motor at the axes. */
            PARAM_ANGULAR_MOTOR_FORCE_LIMIT = 18,
            PARAM_ANGULAR_SPRING_STIFFNESS = 19,
            PARAM_ANGULAR_SPRING_DAMPING = 20,
            PARAM_ANGULAR_SPRING_EQUILIBRIUM_POINT = 21,
            
            /** Represents the size of the [enum Param] enum. */
            PARAM_MAX = 22,
        }
        enum Flag {
            /** If enabled, linear motion is possible within the given limits. */
            FLAG_ENABLE_LINEAR_LIMIT = 0,
            
            /** If enabled, rotational motion is possible within the given limits. */
            FLAG_ENABLE_ANGULAR_LIMIT = 1,
            FLAG_ENABLE_LINEAR_SPRING = 3,
            FLAG_ENABLE_ANGULAR_SPRING = 2,
            
            /** If enabled, there is a rotational motor across these axes. */
            FLAG_ENABLE_MOTOR = 4,
            
            /** If enabled, there is a linear motor across these axes. */
            FLAG_ENABLE_LINEAR_MOTOR = 5,
            
            /** Represents the size of the [enum Flag] enum. */
            FLAG_MAX = 6,
        }
    }
    /** @deprecated Internal use. Does not exist at runtime. */
    interface __NameMapGeneric6DOFJoint3D extends __NameMapJoint3D {
    }
    /** A physics joint that allows for complex movement and rotation between two 3D physics bodies.  
     *  	  
     *  @link https://docs.godotengine.org/en/4.5/classes/class_generic6dofjoint3d.html  
     */
    class Generic6DOFJoint3D<Map extends NodePathMap = any> extends Joint3D<Map> {
        constructor(identifier?: any)
        set_param_x(param: Generic6DOFJoint3D.Param, value: float64): void
        get_param_x(param: Generic6DOFJoint3D.Param): float64
        set_param_y(param: Generic6DOFJoint3D.Param, value: float64): void
        get_param_y(param: Generic6DOFJoint3D.Param): float64
        set_param_z(param: Generic6DOFJoint3D.Param, value: float64): void
        get_param_z(param: Generic6DOFJoint3D.Param): float64
        set_flag_x(flag: Generic6DOFJoint3D.Flag, value: boolean): void
        get_flag_x(flag: Generic6DOFJoint3D.Flag): boolean
        set_flag_y(flag: Generic6DOFJoint3D.Flag, value: boolean): void
        get_flag_y(flag: Generic6DOFJoint3D.Flag): boolean
        set_flag_z(flag: Generic6DOFJoint3D.Flag, value: boolean): void
        get_flag_z(flag: Generic6DOFJoint3D.Flag): boolean
        
        /** If `true`, the linear motion across the X axis is limited. */
        get "linear_limit_x/enabled"(): boolean
        set "linear_limit_x/enabled"(value: boolean)
        
        /** The maximum difference between the pivot points' X axis. */
        get "linear_limit_x/upper_distance"(): float64
        set "linear_limit_x/upper_distance"(value: float64)
        
        /** The minimum difference between the pivot points' X axis. */
        get "linear_limit_x/lower_distance"(): float64
        set "linear_limit_x/lower_distance"(value: float64)
        
        /** A factor applied to the movement across the X axis. The lower, the slower the movement. */
        get "linear_limit_x/softness"(): float64
        set "linear_limit_x/softness"(value: float64)
        
        /** The amount of restitution on the X axis movement. The lower, the more momentum gets lost. */
        get "linear_limit_x/restitution"(): float64
        set "linear_limit_x/restitution"(value: float64)
        
        /** The amount of damping that happens at the X motion. */
        get "linear_limit_x/damping"(): float64
        set "linear_limit_x/damping"(value: float64)
        
        /** If `true`, the linear motion across the Y axis is limited. */
        get "linear_limit_y/enabled"(): boolean
        set "linear_limit_y/enabled"(value: boolean)
        
        /** The maximum difference between the pivot points' Y axis. */
        get "linear_limit_y/upper_distance"(): float64
        set "linear_limit_y/upper_distance"(value: float64)
        
        /** The minimum difference between the pivot points' Y axis. */
        get "linear_limit_y/lower_distance"(): float64
        set "linear_limit_y/lower_distance"(value: float64)
        
        /** A factor applied to the movement across the Y axis. The lower, the slower the movement. */
        get "linear_limit_y/softness"(): float64
        set "linear_limit_y/softness"(value: float64)
        
        /** The amount of restitution on the Y axis movement. The lower, the more momentum gets lost. */
        get "linear_limit_y/restitution"(): float64
        set "linear_limit_y/restitution"(value: float64)
        
        /** The amount of damping that happens at the Y motion. */
        get "linear_limit_y/damping"(): float64
        set "linear_limit_y/damping"(value: float64)
        
        /** If `true`, the linear motion across the Z axis is limited. */
        get "linear_limit_z/enabled"(): boolean
        set "linear_limit_z/enabled"(value: boolean)
        
        /** The maximum difference between the pivot points' Z axis. */
        get "linear_limit_z/upper_distance"(): float64
        set "linear_limit_z/upper_distance"(value: float64)
        
        /** The minimum difference between the pivot points' Z axis. */
        get "linear_limit_z/lower_distance"(): float64
        set "linear_limit_z/lower_distance"(value: float64)
        
        /** A factor applied to the movement across the Z axis. The lower, the slower the movement. */
        get "linear_limit_z/softness"(): float64
        set "linear_limit_z/softness"(value: float64)
        
        /** The amount of restitution on the Z axis movement. The lower, the more momentum gets lost. */
        get "linear_limit_z/restitution"(): float64
        set "linear_limit_z/restitution"(value: float64)
        
        /** The amount of damping that happens at the Z motion. */
        get "linear_limit_z/damping"(): float64
        set "linear_limit_z/damping"(value: float64)
        
        /** If `true`, then there is a linear motor on the X axis. It will attempt to reach the target velocity while staying within the force limits. */
        get "linear_motor_x/enabled"(): boolean
        set "linear_motor_x/enabled"(value: boolean)
        
        /** The speed that the linear motor will attempt to reach on the X axis. */
        get "linear_motor_x/target_velocity"(): float64
        set "linear_motor_x/target_velocity"(value: float64)
        
        /** The maximum force the linear motor can apply on the X axis while trying to reach the target velocity. */
        get "linear_motor_x/force_limit"(): float64
        set "linear_motor_x/force_limit"(value: float64)
        
        /** If `true`, then there is a linear motor on the Y axis. It will attempt to reach the target velocity while staying within the force limits. */
        get "linear_motor_y/enabled"(): boolean
        set "linear_motor_y/enabled"(value: boolean)
        
        /** The speed that the linear motor will attempt to reach on the Y axis. */
        get "linear_motor_y/target_velocity"(): float64
        set "linear_motor_y/target_velocity"(value: float64)
        
        /** The maximum force the linear motor can apply on the Y axis while trying to reach the target velocity. */
        get "linear_motor_y/force_limit"(): float64
        set "linear_motor_y/force_limit"(value: float64)
        
        /** If `true`, then there is a linear motor on the Z axis. It will attempt to reach the target velocity while staying within the force limits. */
        get "linear_motor_z/enabled"(): boolean
        set "linear_motor_z/enabled"(value: boolean)
        
        /** The speed that the linear motor will attempt to reach on the Z axis. */
        get "linear_motor_z/target_velocity"(): float64
        set "linear_motor_z/target_velocity"(value: float64)
        
        /** The maximum force the linear motor can apply on the Z axis while trying to reach the target velocity. */
        get "linear_motor_z/force_limit"(): float64
        set "linear_motor_z/force_limit"(value: float64)
        get "linear_spring_x/enabled"(): boolean
        set "linear_spring_x/enabled"(value: boolean)
        get "linear_spring_x/stiffness"(): float64
        set "linear_spring_x/stiffness"(value: float64)
        get "linear_spring_x/damping"(): float64
        set "linear_spring_x/damping"(value: float64)
        get "linear_spring_x/equilibrium_point"(): float64
        set "linear_spring_x/equilibrium_point"(value: float64)
        get "linear_spring_y/enabled"(): boolean
        set "linear_spring_y/enabled"(value: boolean)
        get "linear_spring_y/stiffness"(): float64
        set "linear_spring_y/stiffness"(value: float64)
        get "linear_spring_y/damping"(): float64
        set "linear_spring_y/damping"(value: float64)
        get "linear_spring_y/equilibrium_point"(): float64
        set "linear_spring_y/equilibrium_point"(value: float64)
        get "linear_spring_z/enabled"(): boolean
        set "linear_spring_z/enabled"(value: boolean)
        get "linear_spring_z/stiffness"(): float64
        set "linear_spring_z/stiffness"(value: float64)
        get "linear_spring_z/damping"(): float64
        set "linear_spring_z/damping"(value: float64)
        get "linear_spring_z/equilibrium_point"(): float64
        set "linear_spring_z/equilibrium_point"(value: float64)
        
        /** If `true`, rotation across the X axis is limited. */
        get "angular_limit_x/enabled"(): boolean
        set "angular_limit_x/enabled"(value: boolean)
        
        /** The minimum rotation in positive direction to break loose and rotate around the X axis. */
        get "angular_limit_x/upper_angle"(): float64
        set "angular_limit_x/upper_angle"(value: float64)
        
        /** The minimum rotation in negative direction to break loose and rotate around the X axis. */
        get "angular_limit_x/lower_angle"(): float64
        set "angular_limit_x/lower_angle"(value: float64)
        
        /** The speed of all rotations across the X axis. */
        get "angular_limit_x/softness"(): float64
        set "angular_limit_x/softness"(value: float64)
        
        /** The amount of rotational restitution across the X axis. The lower, the more restitution occurs. */
        get "angular_limit_x/restitution"(): float64
        set "angular_limit_x/restitution"(value: float64)
        
        /** The amount of rotational damping across the X axis.  
         *  The lower, the longer an impulse from one side takes to travel to the other side.  
         */
        get "angular_limit_x/damping"(): float64
        set "angular_limit_x/damping"(value: float64)
        
        /** The maximum amount of force that can occur, when rotating around the X axis. */
        get "angular_limit_x/force_limit"(): float64
        set "angular_limit_x/force_limit"(value: float64)
        
        /** When rotating across the X axis, this error tolerance factor defines how much the correction gets slowed down. The lower, the slower. */
        get "angular_limit_x/erp"(): float64
        set "angular_limit_x/erp"(value: float64)
        
        /** If `true`, rotation across the Y axis is limited. */
        get "angular_limit_y/enabled"(): boolean
        set "angular_limit_y/enabled"(value: boolean)
        
        /** The minimum rotation in positive direction to break loose and rotate around the Y axis. */
        get "angular_limit_y/upper_angle"(): float64
        set "angular_limit_y/upper_angle"(value: float64)
        
        /** The minimum rotation in negative direction to break loose and rotate around the Y axis. */
        get "angular_limit_y/lower_angle"(): float64
        set "angular_limit_y/lower_angle"(value: float64)
        
        /** The speed of all rotations across the Y axis. */
        get "angular_limit_y/softness"(): float64
        set "angular_limit_y/softness"(value: float64)
        
        /** The amount of rotational restitution across the Y axis. The lower, the more restitution occurs. */
        get "angular_limit_y/restitution"(): float64
        set "angular_limit_y/restitution"(value: float64)
        
        /** The amount of rotational damping across the Y axis. The lower, the more damping occurs. */
        get "angular_limit_y/damping"(): float64
        set "angular_limit_y/damping"(value: float64)
        
        /** The maximum amount of force that can occur, when rotating around the Y axis. */
        get "angular_limit_y/force_limit"(): float64
        set "angular_limit_y/force_limit"(value: float64)
        
        /** When rotating across the Y axis, this error tolerance factor defines how much the correction gets slowed down. The lower, the slower. */
        get "angular_limit_y/erp"(): float64
        set "angular_limit_y/erp"(value: float64)
        
        /** If `true`, rotation across the Z axis is limited. */
        get "angular_limit_z/enabled"(): boolean
        set "angular_limit_z/enabled"(value: boolean)
        
        /** The minimum rotation in positive direction to break loose and rotate around the Z axis. */
        get "angular_limit_z/upper_angle"(): float64
        set "angular_limit_z/upper_angle"(value: float64)
        
        /** The minimum rotation in negative direction to break loose and rotate around the Z axis. */
        get "angular_limit_z/lower_angle"(): float64
        set "angular_limit_z/lower_angle"(value: float64)
        
        /** The speed of all rotations across the Z axis. */
        get "angular_limit_z/softness"(): float64
        set "angular_limit_z/softness"(value: float64)
        
        /** The amount of rotational restitution across the Z axis. The lower, the more restitution occurs. */
        get "angular_limit_z/restitution"(): float64
        set "angular_limit_z/restitution"(value: float64)
        
        /** The amount of rotational damping across the Z axis. The lower, the more damping occurs. */
        get "angular_limit_z/damping"(): float64
        set "angular_limit_z/damping"(value: float64)
        
        /** The maximum amount of force that can occur, when rotating around the Z axis. */
        get "angular_limit_z/force_limit"(): float64
        set "angular_limit_z/force_limit"(value: float64)
        
        /** When rotating across the Z axis, this error tolerance factor defines how much the correction gets slowed down. The lower, the slower. */
        get "angular_limit_z/erp"(): float64
        set "angular_limit_z/erp"(value: float64)
        
        /** If `true`, a rotating motor at the X axis is enabled. */
        get "angular_motor_x/enabled"(): boolean
        set "angular_motor_x/enabled"(value: boolean)
        
        /** Target speed for the motor at the X axis. */
        get "angular_motor_x/target_velocity"(): float64
        set "angular_motor_x/target_velocity"(value: float64)
        
        /** Maximum acceleration for the motor at the X axis. */
        get "angular_motor_x/force_limit"(): float64
        set "angular_motor_x/force_limit"(value: float64)
        
        /** If `true`, a rotating motor at the Y axis is enabled. */
        get "angular_motor_y/enabled"(): boolean
        set "angular_motor_y/enabled"(value: boolean)
        
        /** Target speed for the motor at the Y axis. */
        get "angular_motor_y/target_velocity"(): float64
        set "angular_motor_y/target_velocity"(value: float64)
        
        /** Maximum acceleration for the motor at the Y axis. */
        get "angular_motor_y/force_limit"(): float64
        set "angular_motor_y/force_limit"(value: float64)
        
        /** If `true`, a rotating motor at the Z axis is enabled. */
        get "angular_motor_z/enabled"(): boolean
        set "angular_motor_z/enabled"(value: boolean)
        
        /** Target speed for the motor at the Z axis. */
        get "angular_motor_z/target_velocity"(): float64
        set "angular_motor_z/target_velocity"(value: float64)
        
        /** Maximum acceleration for the motor at the Z axis. */
        get "angular_motor_z/force_limit"(): float64
        set "angular_motor_z/force_limit"(value: float64)
        get "angular_spring_x/enabled"(): boolean
        set "angular_spring_x/enabled"(value: boolean)
        get "angular_spring_x/stiffness"(): float64
        set "angular_spring_x/stiffness"(value: float64)
        get "angular_spring_x/damping"(): float64
        set "angular_spring_x/damping"(value: float64)
        get "angular_spring_x/equilibrium_point"(): float64
        set "angular_spring_x/equilibrium_point"(value: float64)
        get "angular_spring_y/enabled"(): boolean
        set "angular_spring_y/enabled"(value: boolean)
        get "angular_spring_y/stiffness"(): float64
        set "angular_spring_y/stiffness"(value: float64)
        get "angular_spring_y/damping"(): float64
        set "angular_spring_y/damping"(value: float64)
        get "angular_spring_y/equilibrium_point"(): float64
        set "angular_spring_y/equilibrium_point"(value: float64)
        get "angular_spring_z/enabled"(): boolean
        set "angular_spring_z/enabled"(value: boolean)
        get "angular_spring_z/stiffness"(): float64
        set "angular_spring_z/stiffness"(value: float64)
        get "angular_spring_z/damping"(): float64
        set "angular_spring_z/damping"(value: float64)
        get "angular_spring_z/equilibrium_point"(): float64
        set "angular_spring_z/equilibrium_point"(value: float64)
        /** @deprecated Internal use. Does not exist at runtime. */
        __godotNameMap: __NameMapGeneric6DOFJoint3D;
    }
    namespace GeometryInstance3D {
        enum ShadowCastingSetting {
            /** Will not cast any shadows. Use this to improve performance for small geometry that is unlikely to cast noticeable shadows (such as debris). */
            SHADOW_CASTING_SETTING_OFF = 0,
            
            /** Will cast shadows from all visible faces in the GeometryInstance3D.  
             *  Will take culling into account, so faces not being rendered will not be taken into account when shadow casting.  
             */
            SHADOW_CASTING_SETTING_ON = 1,
            
            /** Will cast shadows from all visible faces in the GeometryInstance3D.  
             *  Will not take culling into account, so all faces will be taken into account when shadow casting.  
             */
            SHADOW_CASTING_SETTING_DOUBLE_SIDED = 2,
            
            /** Will only show the shadows casted from this object.  
             *  In other words, the actual mesh will not be visible, only the shadows casted from the mesh will be.  
             */
            SHADOW_CASTING_SETTING_SHADOWS_ONLY = 3,
        }
        enum GIMode {
            /** Disabled global illumination mode. Use for dynamic objects that do not contribute to global illumination (such as characters). When using [VoxelGI] and SDFGI, the geometry will  *receive*  indirect lighting and reflections but the geometry will not be considered in GI baking. */
            GI_MODE_DISABLED = 0,
            
            /** Baked global illumination mode. Use for static objects that contribute to global illumination (such as level geometry). This GI mode is effective when using [VoxelGI], SDFGI and [LightmapGI]. */
            GI_MODE_STATIC = 1,
            
            /** Dynamic global illumination mode. Use for dynamic objects that contribute to global illumination. This GI mode is only effective when using [VoxelGI], but it has a higher performance impact than [constant GI_MODE_STATIC]. When using other GI methods, this will act the same as [constant GI_MODE_DISABLED]. When using [LightmapGI], the object will receive indirect lighting using lightmap probes instead of using the baked lightmap texture. */
            GI_MODE_DYNAMIC = 2,
        }
        enum LightmapScale {
            /** The standard texel density for lightmapping with [LightmapGI]. */
            LIGHTMAP_SCALE_1X = 0,
            
            /** Multiplies texel density by 2× for lightmapping with [LightmapGI]. To ensure consistency in texel density, use this when scaling a mesh by a factor between 1.5 and 3.0. */
            LIGHTMAP_SCALE_2X = 1,
            
            /** Multiplies texel density by 4× for lightmapping with [LightmapGI]. To ensure consistency in texel density, use this when scaling a mesh by a factor between 3.0 and 6.0. */
            LIGHTMAP_SCALE_4X = 2,
            
            /** Multiplies texel density by 8× for lightmapping with [LightmapGI]. To ensure consistency in texel density, use this when scaling a mesh by a factor greater than 6.0. */
            LIGHTMAP_SCALE_8X = 3,
            
            /** Represents the size of the [enum LightmapScale] enum. */
            LIGHTMAP_SCALE_MAX = 4,
        }
        enum VisibilityRangeFadeMode {
            /** Will not fade itself nor its visibility dependencies, hysteresis will be used instead. This is the fastest approach to manual LOD, but it can result in noticeable LOD transitions depending on how the LOD meshes are authored. See [member visibility_range_begin] and [member Node3D.visibility_parent] for more information. */
            VISIBILITY_RANGE_FADE_DISABLED = 0,
            
            /** Will fade-out itself when reaching the limits of its own visibility range. This is slower than [constant VISIBILITY_RANGE_FADE_DISABLED], but it can provide smoother transitions. The fading range is determined by [member visibility_range_begin_margin] and [member visibility_range_end_margin].  
             *      
             *  **Note:** Only supported when using the Forward+ rendering method. When using the Mobile or Compatibility rendering method, this mode acts like [constant VISIBILITY_RANGE_FADE_DISABLED] but with hysteresis disabled.  
             */
            VISIBILITY_RANGE_FADE_SELF = 1,
            
            /** Will fade-in its visibility dependencies (see [member Node3D.visibility_parent]) when reaching the limits of its own visibility range. This is slower than [constant VISIBILITY_RANGE_FADE_DISABLED], but it can provide smoother transitions. The fading range is determined by [member visibility_range_begin_margin] and [member visibility_range_end_margin].  
             *      
             *  **Note:** Only supported when using the Forward+ rendering method. When using the Mobile or Compatibility rendering method, this mode acts like [constant VISIBILITY_RANGE_FADE_DISABLED] but with hysteresis disabled.  
             */
            VISIBILITY_RANGE_FADE_DEPENDENCIES = 2,
        }
    }
    /** @deprecated Internal use. Does not exist at runtime. */
    interface __NameMapGeometryInstance3D extends __NameMapVisualInstance3D {
    }
    /** Base node for geometry-based visual instances.  
     *  	  
     *  @link https://docs.godotengine.org/en/4.5/classes/class_geometryinstance3d.html  
     */
    class GeometryInstance3D<Map extends NodePathMap = any> extends VisualInstance3D<Map> {
        constructor(identifier?: any)
        /** Set the value of a shader uniform for this instance only ([url=https://docs.godotengine.org/en/4.5/tutorials/shaders/shader_reference/shading_language.html#per-instance-uniforms]per-instance uniform[/url]). See also [method ShaderMaterial.set_shader_parameter] to assign a uniform on all instances using the same [ShaderMaterial].  
         *      
         *  **Note:** For a shader uniform to be assignable on a per-instance basis, it  *must*  be defined with `instance uniform ...` rather than `uniform ...` in the shader code.  
         *      
         *  **Note:** [param name] is case-sensitive and must match the name of the uniform in the code exactly (not the capitalized name in the inspector).  
         *      
         *  **Note:** Per-instance shader uniforms are only available in Spatial and CanvasItem shaders, but not for Fog, Sky, or Particles shaders.  
         */
        set_instance_shader_parameter(name: StringName, value: any): void
        
        /** Get the value of a shader parameter as set on this instance. */
        get_instance_shader_parameter(name: StringName): any
        
        /** The material override for the whole geometry.  
         *  If a material is assigned to this property, it will be used instead of any material set in any material slot of the mesh.  
         */
        get material_override(): null | BaseMaterial3D | ShaderMaterial
        set material_override(value: null | BaseMaterial3D | ShaderMaterial)
        
        /** The material overlay for the whole geometry.  
         *  If a material is assigned to this property, it will be rendered on top of any other active material for all the surfaces.  
         */
        get material_overlay(): null | BaseMaterial3D | ShaderMaterial
        set material_overlay(value: null | BaseMaterial3D | ShaderMaterial)
        
        /** The transparency applied to the whole geometry (as a multiplier of the materials' existing transparency). `0.0` is fully opaque, while `1.0` is fully transparent. Values greater than `0.0` (exclusive) will force the geometry's materials to go through the transparent pipeline, which is slower to render and can exhibit rendering issues due to incorrect transparency sorting. However, unlike using a transparent material, setting [member transparency] to a value greater than `0.0` (exclusive) will  *not*  disable shadow rendering.  
         *  In spatial shaders, `1.0 - transparency` is set as the default value of the `ALPHA` built-in.  
         *      
         *  **Note:** [member transparency] is clamped between `0.0` and `1.0`, so this property cannot be used to make transparent materials more opaque than they originally are.  
         *      
         *  **Note:** Only supported when using the Forward+ rendering method. When using the Mobile or Compatibility rendering method, [member transparency] is ignored and is considered as always being `0.0`.  
         */
        get transparency(): float64
        set transparency(value: float64)
        
        /** The selected shadow casting flag. */
        get cast_shadow(): int64
        set cast_shadow(value: int64)
        
        /** The extra distance added to the GeometryInstance3D's bounding box ([AABB]) to increase its cull box. */
        get extra_cull_margin(): float64
        set extra_cull_margin(value: float64)
        
        /** Overrides the bounding box of this node with a custom one. This can be used to avoid the expensive [AABB] recalculation that happens when a skeleton is used with a [MeshInstance3D] or to have precise control over the [MeshInstance3D]'s bounding box. To use the default AABB, set value to an [AABB] with all fields set to `0.0`. To avoid frustum culling, set [member custom_aabb] to a very large AABB that covers your entire game world such as `AABB(-10000, -10000, -10000, 20000, 20000, 20000)`. To disable all forms of culling (including occlusion culling), call [method RenderingServer.instance_set_ignore_culling] on the [GeometryInstance3D]'s [RID]. */
        get custom_aabb(): AABB
        set custom_aabb(value: AABB)
        
        /** Changes how quickly the mesh transitions to a lower level of detail. A value of 0 will force the mesh to its lowest level of detail, a value of 1 will use the default settings, and larger values will keep the mesh in a higher level of detail at farther distances.  
         *  Useful for testing level of detail transitions in the editor.  
         */
        get lod_bias(): float64
        set lod_bias(value: float64)
        
        /** If `true`, disables occlusion culling for this instance. Useful for gizmos that must be rendered even when occlusion culling is in use.  
         *      
         *  **Note:** [member ignore_occlusion_culling] does not affect frustum culling (which is what happens when an object is not visible given the camera's angle). To avoid frustum culling, set [member custom_aabb] to a very large AABB that covers your entire game world such as `AABB(-10000, -10000, -10000, 20000, 20000, 20000)`.  
         */
        get ignore_occlusion_culling(): boolean
        set ignore_occlusion_culling(value: boolean)
        
        /** The global illumination mode to use for the whole geometry. To avoid inconsistent results, use a mode that matches the purpose of the mesh during gameplay (static/dynamic).  
         *      
         *  **Note:** Lights' bake mode will also affect the global illumination rendering. See [member Light3D.light_bake_mode].  
         */
        get gi_mode(): int64
        set gi_mode(value: int64)
        
        /** The texel density to use for lightmapping in [LightmapGI]. Greater scale values provide higher resolution in the lightmap, which can result in sharper shadows for lights that have both direct and indirect light baked. However, greater scale values will also increase the space taken by the mesh in the lightmap texture, which increases the memory, storage, and bake time requirements. When using a single mesh at different scales, consider adjusting this value to keep the lightmap texel density consistent across meshes.  
         *  For example, doubling [member gi_lightmap_texel_scale] doubles the lightmap texture resolution for this object  *on each axis* , so it will  *quadruple*  the texel count.  
         */
        get gi_lightmap_texel_scale(): float64
        set gi_lightmap_texel_scale(value: float64)
        
        /** The texel density to use for lightmapping in [LightmapGI]. */
        get gi_lightmap_scale(): int64
        set gi_lightmap_scale(value: int64)
        
        /** Starting distance from which the GeometryInstance3D will be visible, taking [member visibility_range_begin_margin] into account as well. The default value of 0 is used to disable the range check. */
        get visibility_range_begin(): float64
        set visibility_range_begin(value: float64)
        
        /** Margin for the [member visibility_range_begin] threshold. The GeometryInstance3D will only change its visibility state when it goes over or under the [member visibility_range_begin] threshold by this amount.  
         *  If [member visibility_range_fade_mode] is [constant VISIBILITY_RANGE_FADE_DISABLED], this acts as a hysteresis distance. If [member visibility_range_fade_mode] is [constant VISIBILITY_RANGE_FADE_SELF] or [constant VISIBILITY_RANGE_FADE_DEPENDENCIES], this acts as a fade transition distance and must be set to a value greater than `0.0` for the effect to be noticeable.  
         */
        get visibility_range_begin_margin(): float64
        set visibility_range_begin_margin(value: float64)
        
        /** Distance from which the GeometryInstance3D will be hidden, taking [member visibility_range_end_margin] into account as well. The default value of 0 is used to disable the range check. */
        get visibility_range_end(): float64
        set visibility_range_end(value: float64)
        
        /** Margin for the [member visibility_range_end] threshold. The GeometryInstance3D will only change its visibility state when it goes over or under the [member visibility_range_end] threshold by this amount.  
         *  If [member visibility_range_fade_mode] is [constant VISIBILITY_RANGE_FADE_DISABLED], this acts as a hysteresis distance. If [member visibility_range_fade_mode] is [constant VISIBILITY_RANGE_FADE_SELF] or [constant VISIBILITY_RANGE_FADE_DEPENDENCIES], this acts as a fade transition distance and must be set to a value greater than `0.0` for the effect to be noticeable.  
         */
        get visibility_range_end_margin(): float64
        set visibility_range_end_margin(value: float64)
        
        /** Controls which instances will be faded when approaching the limits of the visibility range. */
        get visibility_range_fade_mode(): int64
        set visibility_range_fade_mode(value: int64)
        /** @deprecated Internal use. Does not exist at runtime. */
        __godotNameMap: __NameMapGeometryInstance3D;
    }
    namespace Gradient {
        enum InterpolationMode {
            /** Linear interpolation. */
            GRADIENT_INTERPOLATE_LINEAR = 0,
            
            /** Constant interpolation, color changes abruptly at each point and stays uniform between. This might cause visible aliasing when used for a gradient texture in some cases. */
            GRADIENT_INTERPOLATE_CONSTANT = 1,
            
            /** Cubic interpolation. */
            GRADIENT_INTERPOLATE_CUBIC = 2,
        }
        enum ColorSpace {
            /** sRGB color space. */
            GRADIENT_COLOR_SPACE_SRGB = 0,
            
            /** Linear sRGB color space. */
            GRADIENT_COLOR_SPACE_LINEAR_SRGB = 1,
            
            /** [url=https://bottosson.github.io/posts/oklab/]Oklab[/url] color space. This color space provides a smooth and uniform-looking transition between colors. */
            GRADIENT_COLOR_SPACE_OKLAB = 2,
        }
    }
    /** @deprecated Internal use. Does not exist at runtime. */
    interface __NameMapGradient extends __NameMapResource {
    }
    /** A color transition.  
     *  	  
     *  @link https://docs.godotengine.org/en/4.5/classes/class_gradient.html  
     */
    class Gradient extends Resource {
        constructor(identifier?: any)
        /** Adds the specified color to the gradient, with the specified offset. */
        add_point(offset: float64, color: Color): void
        
        /** Removes the color at index [param point]. */
        remove_point(point: int64): void
        
        /** Sets the offset for the gradient color at index [param point]. */
        set_offset(point: int64, offset: float64): void
        
        /** Returns the offset of the gradient color at index [param point]. */
        get_offset(point: int64): float64
        
        /** Reverses/mirrors the gradient.  
         *      
         *  **Note:** This method mirrors all points around the middle of the gradient, which may produce unexpected results when [member interpolation_mode] is set to [constant GRADIENT_INTERPOLATE_CONSTANT].  
         */
        reverse(): void
        
        /** Sets the color of the gradient color at index [param point]. */
        set_color(point: int64, color: Color): void
        
        /** Returns the color of the gradient color at index [param point]. */
        get_color(point: int64): Color
        
        /** Returns the interpolated color specified by [param offset]. [param offset] should be between `0.0` and `1.0` (inclusive). Using a value lower than `0.0` will return the same color as `0.0`, and using a value higher than `1.0` will return the same color as `1.0`. If your input value is not within this range, consider using [method @GlobalScope.remap] on the input value with output values set to `0.0` and `1.0`. */
        sample(offset: float64): Color
        
        /** Returns the number of colors in the gradient. */
        get_point_count(): int64
        
        /** The algorithm used to interpolate between points of the gradient. */
        get interpolation_mode(): int64
        set interpolation_mode(value: int64)
        
        /** The color space used to interpolate between points of the gradient. It does not affect the returned colors, which will always be in sRGB space.  
         *      
         *  **Note:** This setting has no effect when [member interpolation_mode] is set to [constant GRADIENT_INTERPOLATE_CONSTANT].  
         */
        get interpolation_color_space(): int64
        set interpolation_color_space(value: int64)
        
        /** Gradient's offsets as a [PackedFloat32Array].  
         *      
         *  **Note:** Setting this property updates all offsets at once. To update any offset individually use [method set_offset].  
         */
        get offsets(): PackedFloat32Array
        set offsets(value: PackedFloat32Array | float32[])
        
        /** Gradient's colors as a [PackedColorArray].  
         *      
         *  **Note:** Setting this property updates all colors at once. To update any color individually use [method set_color].  
         */
        get colors(): PackedColorArray
        set colors(value: PackedColorArray | Color[])
        /** @deprecated Internal use. Does not exist at runtime. */
        __godotNameMap: __NameMapGradient;
    }
    /** @deprecated Internal use. Does not exist at runtime. */
    interface __NameMapGradientTexture1D extends __NameMapTexture2D {
    }
    /** A 1D texture that uses colors obtained from a [Gradient].  
     *  	  
     *  @link https://docs.godotengine.org/en/4.5/classes/class_gradienttexture1d.html  
     */
    class GradientTexture1D extends Texture2D {
        constructor(identifier?: any)
        /** The [Gradient] used to fill the texture. */
        get gradient(): null | Gradient
        set gradient(value: null | Gradient)
        
        /** The number of color samples that will be obtained from the [Gradient]. */
        get width(): int64
        set width(value: int64)
        
        /** If `true`, the generated texture will support high dynamic range ([constant Image.FORMAT_RGBAF] format). This allows for glow effects to work if [member Environment.glow_enabled] is `true`. If `false`, the generated texture will use low dynamic range; overbright colors will be clamped ([constant Image.FORMAT_RGBA8] format). */
        get use_hdr(): boolean
        set use_hdr(value: boolean)
        /** @deprecated Internal use. Does not exist at runtime. */
        __godotNameMap: __NameMapGradientTexture1D;
    }
}
