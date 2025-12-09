// AUTO-GENERATED
declare module "godot" {
    /** @deprecated Internal use. Does not exist at runtime. */
    interface __NameMapRDPipelineSpecializationConstant extends __NameMapRefCounted {
    }
    /** Pipeline specialization constant (used by [RenderingDevice]).  
     *  	  
     *  @link https://docs.godotengine.org/en/4.5/classes/class_rdpipelinespecializationconstant.html  
     */
    class RDPipelineSpecializationConstant extends RefCounted {
        constructor(identifier?: any)
        /** The specialization constant's value. Only [bool], [int] and [float] types are valid for specialization constants. */
        get value(): any
        set value(value: any)
        
        /** The identifier of the specialization constant. This is a value starting from `0` and that increments for every different specialization constant for a given shader. */
        get constant_id(): int64
        set constant_id(value: int64)
        /** @deprecated Internal use. Does not exist at runtime. */
        __godotNameMap: __NameMapRDPipelineSpecializationConstant;
    }
    /** @deprecated Internal use. Does not exist at runtime. */
    interface __NameMapRDSamplerState extends __NameMapRefCounted {
    }
    /** Sampler state (used by [RenderingDevice]).  
     *  	  
     *  @link https://docs.godotengine.org/en/4.5/classes/class_rdsamplerstate.html  
     */
    class RDSamplerState extends RefCounted {
        constructor(identifier?: any)
        /** The sampler's magnification filter. It is the filtering method used when sampling texels that appear bigger than on-screen pixels. */
        get mag_filter(): int64
        set mag_filter(value: int64)
        
        /** The sampler's minification filter. It is the filtering method used when sampling texels that appear smaller than on-screen pixels. */
        get min_filter(): int64
        set min_filter(value: int64)
        
        /** The filtering method to use for mipmaps. */
        get mip_filter(): int64
        set mip_filter(value: int64)
        
        /** The repeat mode to use along the U axis of UV coordinates. This affects the returned values if sampling outside the UV bounds. */
        get repeat_u(): int64
        set repeat_u(value: int64)
        
        /** The repeat mode to use along the V axis of UV coordinates. This affects the returned values if sampling outside the UV bounds. */
        get repeat_v(): int64
        set repeat_v(value: int64)
        
        /** The repeat mode to use along the W axis of UV coordinates. This affects the returned values if sampling outside the UV bounds. Only effective for 3D samplers. */
        get repeat_w(): int64
        set repeat_w(value: int64)
        
        /** The mipmap LOD bias to use. Positive values will make the sampler blurrier at a given distance, while negative values will make the sampler sharper at a given distance (at the risk of looking grainy). Recommended values are between `-0.5` and `0.0`. Only effective if the sampler has mipmaps available. */
        get lod_bias(): float64
        set lod_bias(value: float64)
        
        /** If `true`, perform anisotropic sampling. See [member anisotropy_max]. */
        get use_anisotropy(): boolean
        set use_anisotropy(value: boolean)
        
        /** Maximum anisotropy that can be used when sampling. Only effective if [member use_anisotropy] is `true`. Higher values result in a sharper sampler at oblique angles, at the cost of performance (due to memory bandwidth). This value may be limited by the graphics hardware in use. Most graphics hardware only supports values up to `16.0`.  
         *  If [member anisotropy_max] is `1.0`, forcibly disables anisotropy even if [member use_anisotropy] is `true`.  
         */
        get anisotropy_max(): float64
        set anisotropy_max(value: float64)
        
        /** If `true`, returned values will be based on the comparison operation defined in [member compare_op]. This is a hardware-based approach and is therefore faster than performing this manually in a shader. For example, compare operations are used for shadow map rendering by comparing depth values from a shadow sampler. */
        get enable_compare(): boolean
        set enable_compare(value: boolean)
        
        /** The compare operation to use. Only effective if [member enable_compare] is `true`. */
        get compare_op(): int64
        set compare_op(value: int64)
        
        /** The minimum mipmap LOD bias to display (highest resolution). Only effective if the sampler has mipmaps available. */
        get min_lod(): float64
        set min_lod(value: float64)
        
        /** The maximum mipmap LOD bias to display (lowest resolution). Only effective if the sampler has mipmaps available. */
        get max_lod(): float64
        set max_lod(value: float64)
        
        /** The border color that will be returned when sampling outside the sampler's bounds and the [member repeat_u], [member repeat_v] or [member repeat_w] modes have repeating disabled. */
        get border_color(): int64
        set border_color(value: int64)
        
        /** If `true`, the texture will be sampled with coordinates ranging from 0 to the texture's resolution. Otherwise, the coordinates will be normalized and range from 0 to 1. */
        get unnormalized_uvw(): boolean
        set unnormalized_uvw(value: boolean)
        /** @deprecated Internal use. Does not exist at runtime. */
        __godotNameMap: __NameMapRDSamplerState;
    }
    /** @deprecated Internal use. Does not exist at runtime. */
    interface __NameMapRDShaderFile extends __NameMapResource {
    }
    /** Compiled shader file in SPIR-V form (used by [RenderingDevice]). Not to be confused with Godot's own [Shader].  
     *  	  
     *  @link https://docs.godotengine.org/en/4.5/classes/class_rdshaderfile.html  
     */
    class RDShaderFile extends Resource {
        constructor(identifier?: any)
        /** Sets the SPIR-V [param bytecode] that will be compiled for the specified [param version]. */
        set_bytecode(bytecode: RDShaderSPIRV, version?: StringName /* = '' */): void
        
        /** Returns the SPIR-V intermediate representation for the specified shader [param version]. */
        get_spirv(version?: StringName /* = '' */): null | RDShaderSPIRV
        
        /** Returns the list of compiled versions for this shader. */
        get_version_list(): GArray<StringName>
        get _versions(): GDictionary
        set _versions(value: GDictionary)
        
        /** The base compilation error message, which indicates errors not related to a specific shader stage if non-empty. If empty, shader compilation is not necessarily successful (check [RDShaderSPIRV]'s error message members). */
        get base_error(): string
        set base_error(value: string)
        /** @deprecated Internal use. Does not exist at runtime. */
        __godotNameMap: __NameMapRDShaderFile;
    }
    /** @deprecated Internal use. Does not exist at runtime. */
    interface __NameMapRDShaderSPIRV extends __NameMapResource {
    }
    /** SPIR-V intermediate representation as part of an [RDShaderFile] (used by [RenderingDevice]).  
     *  	  
     *  @link https://docs.godotengine.org/en/4.5/classes/class_rdshaderspirv.html  
     */
    class RDShaderSPIRV extends Resource {
        constructor(identifier?: any)
        /** Sets the SPIR-V [param bytecode] for the given shader [param stage]. Equivalent to setting one of [member bytecode_compute], [member bytecode_fragment], [member bytecode_tesselation_control], [member bytecode_tesselation_evaluation], [member bytecode_vertex]. */
        set_stage_bytecode(stage: RenderingDevice.ShaderStage, bytecode: PackedByteArray | byte[] | ArrayBuffer): void
        
        /** Equivalent to getting one of [member bytecode_compute], [member bytecode_fragment], [member bytecode_tesselation_control], [member bytecode_tesselation_evaluation], [member bytecode_vertex]. */
        get_stage_bytecode(stage: RenderingDevice.ShaderStage): PackedByteArray
        
        /** Sets the compilation error message for the given shader [param stage] to [param compile_error]. Equivalent to setting one of [member compile_error_compute], [member compile_error_fragment], [member compile_error_tesselation_control], [member compile_error_tesselation_evaluation], [member compile_error_vertex]. */
        set_stage_compile_error(stage: RenderingDevice.ShaderStage, compile_error: string): void
        
        /** Returns the compilation error message for the given shader [param stage]. Equivalent to getting one of [member compile_error_compute], [member compile_error_fragment], [member compile_error_tesselation_control], [member compile_error_tesselation_evaluation], [member compile_error_vertex]. */
        get_stage_compile_error(stage: RenderingDevice.ShaderStage): string
        
        /** The SPIR-V bytecode for the vertex shader stage. */
        get bytecode_vertex(): PackedByteArray
        set bytecode_vertex(value: PackedByteArray | byte[] | ArrayBuffer)
        
        /** The SPIR-V bytecode for the fragment shader stage. */
        get bytecode_fragment(): PackedByteArray
        set bytecode_fragment(value: PackedByteArray | byte[] | ArrayBuffer)
        
        /** The SPIR-V bytecode for the tessellation control shader stage. */
        get bytecode_tesselation_control(): PackedByteArray
        set bytecode_tesselation_control(value: PackedByteArray | byte[] | ArrayBuffer)
        
        /** The SPIR-V bytecode for the tessellation evaluation shader stage. */
        get bytecode_tesselation_evaluation(): PackedByteArray
        set bytecode_tesselation_evaluation(value: PackedByteArray | byte[] | ArrayBuffer)
        
        /** The SPIR-V bytecode for the compute shader stage. */
        get bytecode_compute(): PackedByteArray
        set bytecode_compute(value: PackedByteArray | byte[] | ArrayBuffer)
        
        /** The compilation error message for the vertex shader stage (set by the SPIR-V compiler and Godot). If empty, shader compilation was successful. */
        get compile_error_vertex(): string
        set compile_error_vertex(value: string)
        
        /** The compilation error message for the fragment shader stage (set by the SPIR-V compiler and Godot). If empty, shader compilation was successful. */
        get compile_error_fragment(): string
        set compile_error_fragment(value: string)
        
        /** The compilation error message for the tessellation control shader stage (set by the SPIR-V compiler and Godot). If empty, shader compilation was successful. */
        get compile_error_tesselation_control(): string
        set compile_error_tesselation_control(value: string)
        
        /** The compilation error message for the tessellation evaluation shader stage (set by the SPIR-V compiler and Godot). If empty, shader compilation was successful. */
        get compile_error_tesselation_evaluation(): string
        set compile_error_tesselation_evaluation(value: string)
        
        /** The compilation error message for the compute shader stage (set by the SPIR-V compiler and Godot). If empty, shader compilation was successful. */
        get compile_error_compute(): string
        set compile_error_compute(value: string)
        /** @deprecated Internal use. Does not exist at runtime. */
        __godotNameMap: __NameMapRDShaderSPIRV;
    }
    /** @deprecated Internal use. Does not exist at runtime. */
    interface __NameMapRDShaderSource extends __NameMapRefCounted {
    }
    /** Shader source code (used by [RenderingDevice]).  
     *  	  
     *  @link https://docs.godotengine.org/en/4.5/classes/class_rdshadersource.html  
     */
    class RDShaderSource extends RefCounted {
        constructor(identifier?: any)
        /** Sets [param source] code for the specified shader [param stage]. Equivalent to setting one of [member source_compute], [member source_fragment], [member source_tesselation_control], [member source_tesselation_evaluation] or [member source_vertex].  
         *      
         *  **Note:** If you set the compute shader source code using this method directly, remember to remove the Godot-specific hint `#[compute]`.  
         */
        set_stage_source(stage: RenderingDevice.ShaderStage, source: string): void
        
        /** Returns source code for the specified shader [param stage]. Equivalent to getting one of [member source_compute], [member source_fragment], [member source_tesselation_control], [member source_tesselation_evaluation] or [member source_vertex]. */
        get_stage_source(stage: RenderingDevice.ShaderStage): string
        
        /** Source code for the shader's vertex stage. */
        get source_vertex(): string
        set source_vertex(value: string)
        
        /** Source code for the shader's fragment stage. */
        get source_fragment(): string
        set source_fragment(value: string)
        
        /** Source code for the shader's tessellation control stage. */
        get source_tesselation_control(): string
        set source_tesselation_control(value: string)
        
        /** Source code for the shader's tessellation evaluation stage. */
        get source_tesselation_evaluation(): string
        set source_tesselation_evaluation(value: string)
        
        /** Source code for the shader's compute stage. */
        get source_compute(): string
        set source_compute(value: string)
        
        /** The language the shader is written in. */
        get language(): int64
        set language(value: int64)
        /** @deprecated Internal use. Does not exist at runtime. */
        __godotNameMap: __NameMapRDShaderSource;
    }
    /** @deprecated Internal use. Does not exist at runtime. */
    interface __NameMapRDTextureFormat extends __NameMapRefCounted {
    }
    /** Texture format (used by [RenderingDevice]).  
     *  	  
     *  @link https://docs.godotengine.org/en/4.5/classes/class_rdtextureformat.html  
     */
    class RDTextureFormat extends RefCounted {
        constructor(identifier?: any)
        /** Adds [param format] as a valid format for the corresponding [RDTextureView]'s [member RDTextureView.format_override] property. If any format is added as shareable, then the main [member format] must also be added. */
        add_shareable_format(format: RenderingDevice.DataFormat): void
        
        /** Removes [param format] from the list of valid formats that the corresponding [RDTextureView]'s [member RDTextureView.format_override] property can be set to. */
        remove_shareable_format(format: RenderingDevice.DataFormat): void
        
        /** The texture's pixel data format. */
        get format(): int64
        set format(value: int64)
        
        /** The texture's width (in pixels). */
        get width(): int64
        set width(value: int64)
        
        /** The texture's height (in pixels). */
        get height(): int64
        set height(value: int64)
        
        /** The texture's depth (in pixels). This is always `1` for 2D textures. */
        get depth(): int64
        set depth(value: int64)
        
        /** The number of layers in the texture. Only relevant for 2D texture arrays. */
        get array_layers(): int64
        set array_layers(value: int64)
        
        /** The number of mipmaps available in the texture. */
        get mipmaps(): int64
        set mipmaps(value: int64)
        
        /** The texture type. */
        get texture_type(): int64
        set texture_type(value: int64)
        
        /** The number of samples used when sampling the texture. */
        get samples(): int64
        set samples(value: int64)
        
        /** The texture's usage bits, which determine what can be done using the texture. */
        get usage_bits(): int64
        set usage_bits(value: int64)
        
        /** The texture will be used as the destination of a resolve operation. */
        get is_resolve_buffer(): boolean
        set is_resolve_buffer(value: boolean)
        
        /** If a texture is discardable, its contents do not need to be preserved between frames. This flag is only relevant when the texture is used as target in a draw list.  
         *  This information is used by [RenderingDevice] to figure out if a texture's contents can be discarded, eliminating unnecessary writes to memory and boosting performance.  
         */
        get is_discardable(): boolean
        set is_discardable(value: boolean)
        /** @deprecated Internal use. Does not exist at runtime. */
        __godotNameMap: __NameMapRDTextureFormat;
    }
    /** @deprecated Internal use. Does not exist at runtime. */
    interface __NameMapRDTextureView extends __NameMapRefCounted {
    }
    /** Texture view (used by [RenderingDevice]).  
     *  	  
     *  @link https://docs.godotengine.org/en/4.5/classes/class_rdtextureview.html  
     */
    class RDTextureView extends RefCounted {
        constructor(identifier?: any)
        /** Optional override for the data format to return sampled values in. The corresponding [RDTextureFormat] must have had this added as a shareable format. The default value of [constant RenderingDevice.DATA_FORMAT_MAX] does not override the format. */
        get format_override(): int64
        set format_override(value: int64)
        
        /** The channel to sample when sampling the red color channel. */
        get swizzle_r(): int64
        set swizzle_r(value: int64)
        
        /** The channel to sample when sampling the green color channel. */
        get swizzle_g(): int64
        set swizzle_g(value: int64)
        
        /** The channel to sample when sampling the blue color channel. */
        get swizzle_b(): int64
        set swizzle_b(value: int64)
        
        /** The channel to sample when sampling the alpha channel. */
        get swizzle_a(): int64
        set swizzle_a(value: int64)
        /** @deprecated Internal use. Does not exist at runtime. */
        __godotNameMap: __NameMapRDTextureView;
    }
    /** @deprecated Internal use. Does not exist at runtime. */
    interface __NameMapRDUniform extends __NameMapRefCounted {
    }
    /** Shader uniform (used by [RenderingDevice]).  
     *  	  
     *  @link https://docs.godotengine.org/en/4.5/classes/class_rduniform.html  
     */
    class RDUniform extends RefCounted {
        constructor(identifier?: any)
        /** Binds the given id to the uniform. The data associated with the id is then used when the uniform is passed to a shader. */
        add_id(id: RID): void
        
        /** Unbinds all ids currently bound to the uniform. */
        clear_ids(): void
        
        /** The uniform's data type. */
        get uniform_type(): int64
        set uniform_type(value: int64)
        
        /** The uniform's binding. */
        get binding(): int64
        set binding(value: int64)
        get _ids(): GArray
        set _ids(value: GArray)
        /** @deprecated Internal use. Does not exist at runtime. */
        __godotNameMap: __NameMapRDUniform;
    }
    /** @deprecated Internal use. Does not exist at runtime. */
    interface __NameMapRDVertexAttribute extends __NameMapRefCounted {
    }
    /** Vertex attribute (used by [RenderingDevice]).  
     *  	  
     *  @link https://docs.godotengine.org/en/4.5/classes/class_rdvertexattribute.html  
     */
    class RDVertexAttribute extends RefCounted {
        constructor(identifier?: any)
        /** The location in the shader that this attribute is bound to. */
        get location(): int64
        set location(value: int64)
        
        /** The number of bytes between the start of the vertex buffer and the first instance of this attribute. */
        get offset(): int64
        set offset(value: int64)
        
        /** The way that this attribute's data is interpreted when sent to a shader. */
        get format(): int64
        set format(value: int64)
        
        /** The number of bytes between the starts of consecutive instances of this attribute. */
        get stride(): int64
        set stride(value: int64)
        
        /** The rate at which this attribute is pulled from its vertex buffer. */
        get frequency(): int64
        set frequency(value: int64)
        /** @deprecated Internal use. Does not exist at runtime. */
        __godotNameMap: __NameMapRDVertexAttribute;
    }
    /** @deprecated Internal use. Does not exist at runtime. */
    interface __NameMapRandomNumberGenerator extends __NameMapRefCounted {
    }
    /** Provides methods for generating pseudo-random numbers.  
     *  	  
     *  @link https://docs.godotengine.org/en/4.5/classes/class_randomnumbergenerator.html  
     */
    class RandomNumberGenerator extends RefCounted {
        constructor(identifier?: any)
        /** Returns a pseudo-random 32-bit unsigned integer between `0` and `4294967295` (inclusive). */
        randi(): int64
        
        /** Returns a pseudo-random float between `0.0` and `1.0` (inclusive). */
        randf(): float64
        
        /** Returns a [url=https://en.wikipedia.org/wiki/Normal_distribution]normally-distributed[/url], pseudo-random floating-point number from the specified [param mean] and a standard [param deviation]. This is also known as a Gaussian distribution.  
         *      
         *  **Note:** This method uses the [url=https://en.wikipedia.org/wiki/Box%E2%80%93Muller_transform]Box-Muller transform[/url] algorithm.  
         */
        randfn(mean?: float64 /* = 0 */, deviation?: float64 /* = 1 */): float64
        
        /** Returns a pseudo-random float between [param from] and [param to] (inclusive). */
        randf_range(from: float64, to: float64): float64
        
        /** Returns a pseudo-random 32-bit signed integer between [param from] and [param to] (inclusive). */
        randi_range(from: int64, to: int64): int64
        
        /** Returns a random index with non-uniform weights. Prints an error and returns `-1` if the array is empty.  
         *    
         */
        rand_weighted(weights: PackedFloat32Array | float32[]): int64
        
        /** Sets up a time-based seed for this [RandomNumberGenerator] instance. Unlike the [@GlobalScope] random number generation functions, different [RandomNumberGenerator] instances can use different seeds. */
        randomize(): void
        
        /** Initializes the random number generator state based on the given seed value. A given seed will give a reproducible sequence of pseudo-random numbers.  
         *      
         *  **Note:** The RNG does not have an avalanche effect, and can output similar random streams given similar seeds. Consider using a hash function to improve your seed quality if they're sourced externally.  
         *      
         *  **Note:** Setting this property produces a side effect of changing the internal [member state], so make sure to initialize the seed  *before*  modifying the [member state]:  
         *      
         *  **Note:** The default value of this property is pseudo-random, and changes when calling [method randomize]. The `0` value documented here is a placeholder, and not the actual default seed.  
         *    
         */
        get seed(): int64
        set seed(value: int64)
        
        /** The current state of the random number generator. Save and restore this property to restore the generator to a previous state:  
         *    
         *      
         *  **Note:** Do not set state to arbitrary values, since the random number generator requires the state to have certain qualities to behave properly. It should only be set to values that came from the state property itself. To initialize the random number generator with arbitrary input, use [member seed] instead.  
         *      
         *  **Note:** The default value of this property is pseudo-random, and changes when calling [method randomize]. The `0` value documented here is a placeholder, and not the actual default state.  
         */
        get state(): int64
        set state(value: int64)
        /** @deprecated Internal use. Does not exist at runtime. */
        __godotNameMap: __NameMapRandomNumberGenerator;
    }
    /** @deprecated Internal use. Does not exist at runtime. */
    interface __NameMapRange extends __NameMapControl {
    }
    /** Abstract base class for controls that represent a number within a range.  
     *  	  
     *  @link https://docs.godotengine.org/en/4.5/classes/class_range.html  
     */
    class Range<Map extends NodePathMap = any> extends Control<Map> {
        constructor(identifier?: any)
        /** Called when the [Range]'s value is changed (following the same conditions as [signal value_changed]). */
        /* gdvirtual */ _value_changed(new_value: float64): void
        
        /** Sets the [Range]'s current value to the specified [param value], without emitting the [signal value_changed] signal. */
        set_value_no_signal(value: float64): void
        
        /** Binds two [Range]s together along with any ranges previously grouped with either of them. When any of range's member variables change, it will share the new value with all other ranges in its group. */
        share(with_: Node): void
        
        /** Stops the [Range] from sharing its member variables with any other. */
        unshare(): void
        
        /** Minimum value. Range is clamped if [member value] is less than [member min_value]. */
        get min_value(): float64
        set min_value(value: float64)
        
        /** Maximum value. Range is clamped if [member value] is greater than [member max_value]. */
        get max_value(): float64
        set max_value(value: float64)
        
        /** If greater than 0, [member value] will always be rounded to a multiple of this property's value above [member min_value]. For example, if [member min_value] is `0.1` and step is 0.2, then [member value] is limited to `0.1`, `0.3`, `0.5`, and so on. If [member rounded] is also `true`, [member value] will first be rounded to a multiple of this property's value, then rounded to the nearest integer. */
        get step(): float64
        set step(value: float64)
        
        /** Page size. Used mainly for [ScrollBar]. A [ScrollBar]'s grabber length is the [ScrollBar]'s size multiplied by [member page] over the difference between [member min_value] and [member max_value]. */
        get page(): float64
        set page(value: float64)
        
        /** Range's current value. Changing this property (even via code) will trigger [signal value_changed] signal. Use [method set_value_no_signal] if you want to avoid it. */
        get value(): float64
        set value(value: float64)
        
        /** The value mapped between 0 and 1. */
        get ratio(): float64
        set ratio(value: float64)
        
        /** If `true`, and [member min_value] is greater or equal to `0`, [member value] will be represented exponentially rather than linearly. */
        get exp_edit(): boolean
        set exp_edit(value: boolean)
        
        /** If `true`, [member value] will always be rounded to the nearest integer. */
        get rounded(): boolean
        set rounded(value: boolean)
        
        /** If `true`, [member value] may be greater than [member max_value]. */
        get allow_greater(): boolean
        set allow_greater(value: boolean)
        
        /** If `true`, [member value] may be less than [member min_value]. */
        get allow_lesser(): boolean
        set allow_lesser(value: boolean)
        
        /** Emitted when [member value] changes. When used on a [Slider], this is called continuously while dragging (potentially every frame). If you are performing an expensive operation in a function connected to [signal value_changed], consider using a  *debouncing*  [Timer] to call the function less often.  
         *      
         *  **Note:** Unlike signals such as [signal LineEdit.text_changed], [signal value_changed] is also emitted when [param value] is set directly via code.  
         */
        readonly value_changed: Signal<(value: float64) => void>
        
        /** Emitted when [member min_value], [member max_value], [member page], or [member step] change. */
        readonly changed: Signal<() => void>
        /** @deprecated Internal use. Does not exist at runtime. */
        __godotNameMap: __NameMapRange;
    }
    /** @deprecated Internal use. Does not exist at runtime. */
    interface __NameMapRayCast2D extends __NameMapNode2D {
    }
    /** A ray in 2D space, used to find the first collision object it intersects.  
     *  	  
     *  @link https://docs.godotengine.org/en/4.5/classes/class_raycast2d.html  
     */
    class RayCast2D<Map extends NodePathMap = any> extends Node2D<Map> {
        constructor(identifier?: any)
        /** Returns whether any object is intersecting with the ray's vector (considering the vector length). */
        is_colliding(): boolean
        
        /** Updates the collision information for the ray immediately, without waiting for the next `_physics_process` call. Use this method, for example, when the ray or its parent has changed state.  
         *      
         *  **Note:** [member enabled] does not need to be `true` for this to work.  
         */
        force_raycast_update(): void
        
        /** Returns the first object that the ray intersects, or `null` if no object is intersecting the ray (i.e. [method is_colliding] returns `false`).  
         *      
         *  **Note:** This object is not guaranteed to be a [CollisionObject2D]. For example, if the ray intersects a [TileMapLayer], the method will return a [TileMapLayer] instance.  
         */
        get_collider(): null | Object
        
        /** Returns the [RID] of the first object that the ray intersects, or an empty [RID] if no object is intersecting the ray (i.e. [method is_colliding] returns `false`). */
        get_collider_rid(): RID
        
        /** Returns the shape ID of the first object that the ray intersects, or `0` if no object is intersecting the ray (i.e. [method is_colliding] returns `false`).  
         *  To get the intersected shape node, for a [CollisionObject2D] target, use:  
         *    
         */
        get_collider_shape(): int64
        
        /** Returns the collision point at which the ray intersects the closest object, in the global coordinate system. If [member hit_from_inside] is `true` and the ray starts inside of a collision shape, this function will return the origin point of the ray.  
         *      
         *  **Note:** Check that [method is_colliding] returns `true` before calling this method to ensure the returned point is valid and up-to-date.  
         */
        get_collision_point(): Vector2
        
        /** Returns the normal of the intersecting object's shape at the collision point, or `Vector2(0, 0)` if the ray starts inside the shape and [member hit_from_inside] is `true`.  
         *      
         *  **Note:** Check that [method is_colliding] returns `true` before calling this method to ensure the returned normal is valid and up-to-date.  
         */
        get_collision_normal(): Vector2
        
        /** Adds a collision exception so the ray does not report collisions with the specified [RID]. */
        add_exception_rid(rid: RID): void
        
        /** Adds a collision exception so the ray does not report collisions with the specified [param node]. */
        add_exception(node: CollisionObject2D): void
        
        /** Removes a collision exception so the ray can report collisions with the specified [RID]. */
        remove_exception_rid(rid: RID): void
        
        /** Removes a collision exception so the ray can report collisions with the specified specified [param node]. */
        remove_exception(node: CollisionObject2D): void
        
        /** Removes all collision exceptions for this ray. */
        clear_exceptions(): void
        
        /** Based on [param value], enables or disables the specified layer in the [member collision_mask], given a [param layer_number] between 1 and 32. */
        set_collision_mask_value(layer_number: int64, value: boolean): void
        
        /** Returns whether or not the specified layer of the [member collision_mask] is enabled, given a [param layer_number] between 1 and 32. */
        get_collision_mask_value(layer_number: int64): boolean
        
        /** If `true`, collisions will be reported. */
        get enabled(): boolean
        set enabled(value: boolean)
        
        /** If `true`, this raycast will not report collisions with its parent node. This property only has an effect if the parent node is a [CollisionObject2D]. See also [method Node.get_parent] and [method add_exception]. */
        get exclude_parent(): boolean
        set exclude_parent(value: boolean)
        
        /** The ray's destination point, relative to this raycast's [member Node2D.position]. */
        get target_position(): Vector2
        set target_position(value: Vector2)
        
        /** The ray's collision mask. Only objects in at least one collision layer enabled in the mask will be detected. See [url=https://docs.godotengine.org/en/4.5/tutorials/physics/physics_introduction.html#collision-layers-and-masks]Collision layers and masks[/url] in the documentation for more information. */
        get collision_mask(): int64
        set collision_mask(value: int64)
        
        /** If `true`, the ray will detect a hit when starting inside shapes. In this case the collision normal will be `Vector2(0, 0)`. Does not affect concave polygon shapes. */
        get hit_from_inside(): boolean
        set hit_from_inside(value: boolean)
        
        /** If `true`, collisions with [Area2D]s will be reported. */
        get collide_with_areas(): boolean
        set collide_with_areas(value: boolean)
        
        /** If `true`, collisions with [PhysicsBody2D]s will be reported. */
        get collide_with_bodies(): boolean
        set collide_with_bodies(value: boolean)
        /** @deprecated Internal use. Does not exist at runtime. */
        __godotNameMap: __NameMapRayCast2D;
    }
    /** @deprecated Internal use. Does not exist at runtime. */
    interface __NameMapRayCast3D extends __NameMapNode3D {
    }
    /** A ray in 3D space, used to find the first collision object it intersects.  
     *  	  
     *  @link https://docs.godotengine.org/en/4.5/classes/class_raycast3d.html  
     */
    class RayCast3D<Map extends NodePathMap = any> extends Node3D<Map> {
        constructor(identifier?: any)
        /** Returns whether any object is intersecting with the ray's vector (considering the vector length). */
        is_colliding(): boolean
        
        /** Updates the collision information for the ray immediately, without waiting for the next `_physics_process` call. Use this method, for example, when the ray or its parent has changed state.  
         *      
         *  **Note:** [member enabled] does not need to be `true` for this to work.  
         */
        force_raycast_update(): void
        
        /** Returns the first object that the ray intersects, or `null` if no object is intersecting the ray (i.e. [method is_colliding] returns `false`).  
         *      
         *  **Note:** This object is not guaranteed to be a [CollisionObject3D]. For example, if the ray intersects a [CSGShape3D] or a [GridMap], the method will return a [CSGShape3D] or [GridMap] instance.  
         */
        get_collider(): null | Object
        
        /** Returns the [RID] of the first object that the ray intersects, or an empty [RID] if no object is intersecting the ray (i.e. [method is_colliding] returns `false`). */
        get_collider_rid(): RID
        
        /** Returns the shape ID of the first object that the ray intersects, or `0` if no object is intersecting the ray (i.e. [method is_colliding] returns `false`).  
         *  To get the intersected shape node, for a [CollisionObject3D] target, use:  
         *    
         */
        get_collider_shape(): int64
        
        /** Returns the collision point at which the ray intersects the closest object, in the global coordinate system. If [member hit_from_inside] is `true` and the ray starts inside of a collision shape, this function will return the origin point of the ray.  
         *      
         *  **Note:** Check that [method is_colliding] returns `true` before calling this method to ensure the returned point is valid and up-to-date.  
         */
        get_collision_point(): Vector3
        
        /** Returns the normal of the intersecting object's shape at the collision point, or `Vector3(0, 0, 0)` if the ray starts inside the shape and [member hit_from_inside] is `true`.  
         *      
         *  **Note:** Check that [method is_colliding] returns `true` before calling this method to ensure the returned normal is valid and up-to-date.  
         */
        get_collision_normal(): Vector3
        
        /** Returns the collision object's face index at the collision point, or `-1` if the shape intersecting the ray is not a [ConcavePolygonShape3D]. */
        get_collision_face_index(): int64
        
        /** Adds a collision exception so the ray does not report collisions with the specified [RID]. */
        add_exception_rid(rid: RID): void
        
        /** Adds a collision exception so the ray does not report collisions with the specified [param node]. */
        add_exception(node: CollisionObject3D): void
        
        /** Removes a collision exception so the ray can report collisions with the specified [RID]. */
        remove_exception_rid(rid: RID): void
        
        /** Removes a collision exception so the ray can report collisions with the specified [param node]. */
        remove_exception(node: CollisionObject3D): void
        
        /** Removes all collision exceptions for this ray. */
        clear_exceptions(): void
        
        /** Based on [param value], enables or disables the specified layer in the [member collision_mask], given a [param layer_number] between 1 and 32. */
        set_collision_mask_value(layer_number: int64, value: boolean): void
        
        /** Returns whether or not the specified layer of the [member collision_mask] is enabled, given a [param layer_number] between 1 and 32. */
        get_collision_mask_value(layer_number: int64): boolean
        
        /** If `true`, collisions will be reported. */
        get enabled(): boolean
        set enabled(value: boolean)
        
        /** If `true`, this raycast will not report collisions with its parent node. This property only has an effect if the parent node is a [CollisionObject3D]. See also [method Node.get_parent] and [method add_exception]. */
        get exclude_parent(): boolean
        set exclude_parent(value: boolean)
        
        /** The ray's destination point, relative to this raycast's [member Node3D.position]. */
        get target_position(): Vector3
        set target_position(value: Vector3)
        
        /** The ray's collision mask. Only objects in at least one collision layer enabled in the mask will be detected. See [url=https://docs.godotengine.org/en/4.5/tutorials/physics/physics_introduction.html#collision-layers-and-masks]Collision layers and masks[/url] in the documentation for more information. */
        get collision_mask(): int64
        set collision_mask(value: int64)
        
        /** If `true`, the ray will detect a hit when starting inside shapes. In this case the collision normal will be `Vector3(0, 0, 0)`. Does not affect shapes with no volume like concave polygon or heightmap. */
        get hit_from_inside(): boolean
        set hit_from_inside(value: boolean)
        
        /** If `true`, the ray will hit back faces with concave polygon shapes with back face enabled or heightmap shapes. */
        get hit_back_faces(): boolean
        set hit_back_faces(value: boolean)
        
        /** If `true`, collisions with [Area3D]s will be reported. */
        get collide_with_areas(): boolean
        set collide_with_areas(value: boolean)
        
        /** If `true`, collisions with [PhysicsBody3D]s will be reported. */
        get collide_with_bodies(): boolean
        set collide_with_bodies(value: boolean)
        
        /** The custom color to use to draw the shape in the editor and at run-time if **Visible Collision Shapes** is enabled in the **Debug** menu. This color will be highlighted at run-time if the [RayCast3D] is colliding with something.  
         *  If set to `Color(0.0, 0.0, 0.0)` (by default), the color set in [member ProjectSettings.debug/shapes/collision/shape_color] is used.  
         */
        get debug_shape_custom_color(): Color
        set debug_shape_custom_color(value: Color)
        
        /** If set to `1`, a line is used as the debug shape. Otherwise, a truncated pyramid is drawn to represent the [RayCast3D]. Requires **Visible Collision Shapes** to be enabled in the **Debug** menu for the debug shape to be visible at run-time. */
        get debug_shape_thickness(): int64
        set debug_shape_thickness(value: int64)
        /** @deprecated Internal use. Does not exist at runtime. */
        __godotNameMap: __NameMapRayCast3D;
    }
    /** @deprecated Internal use. Does not exist at runtime. */
    interface __NameMapRectangleShape2D extends __NameMapShape2D {
    }
    /** A 2D rectangle shape used for physics collision.  
     *  	  
     *  @link https://docs.godotengine.org/en/4.5/classes/class_rectangleshape2d.html  
     */
    class RectangleShape2D extends Shape2D {
        constructor(identifier?: any)
        /** The rectangle's width and height. */
        get size(): Vector2
        set size(value: Vector2)
        /** @deprecated Internal use. Does not exist at runtime. */
        __godotNameMap: __NameMapRectangleShape2D;
    }
    /** @deprecated Internal use. Does not exist at runtime. */
    interface __NameMapRefCounted extends __NameMapObject {
    }
    /** Base class for reference-counted objects.  
     *  	  
     *  @link https://docs.godotengine.org/en/4.5/classes/class_refcounted.html  
     */
    class RefCounted extends Object {
        constructor(identifier?: any)
        /** Initializes the internal reference counter. Use this only if you really know what you are doing.  
         *  Returns whether the initialization was successful.  
         */
        init_ref(): boolean
        
        /** Increments the internal reference counter. Use this only if you really know what you are doing.  
         *  Returns `true` if the increment was successful, `false` otherwise.  
         */
        reference(): boolean
        
        /** Decrements the internal reference counter. Use this only if you really know what you are doing.  
         *  Returns `true` if the object should be freed after the decrement, `false` otherwise.  
         */
        unreference(): boolean
        
        /** Returns the current reference count. */
        get_reference_count(): int64
        /** @deprecated Internal use. Does not exist at runtime. */
        __godotNameMap: __NameMapRefCounted;
    }
    /** @deprecated Internal use. Does not exist at runtime. */
    interface __NameMapReferenceRect extends __NameMapControl {
    }
    /** A rectangular box for designing UIs.  
     *  	  
     *  @link https://docs.godotengine.org/en/4.5/classes/class_referencerect.html  
     */
    class ReferenceRect<Map extends NodePathMap = any> extends Control<Map> {
        constructor(identifier?: any)
        /** Sets the border color of the [ReferenceRect]. */
        get border_color(): Color
        set border_color(value: Color)
        
        /** Sets the border width of the [ReferenceRect]. The border grows both inwards and outwards with respect to the rectangle box. */
        get border_width(): float64
        set border_width(value: float64)
        
        /** If `true`, the [ReferenceRect] will only be visible while in editor. Otherwise, [ReferenceRect] will be visible in the running project. */
        get editor_only(): boolean
        set editor_only(value: boolean)
        /** @deprecated Internal use. Does not exist at runtime. */
        __godotNameMap: __NameMapReferenceRect;
    }
    namespace ReflectionProbe {
        enum UpdateMode {
            /** Update the probe once on the next frame (recommended for most objects). The corresponding radiance map will be generated over the following six frames. This takes more time to update than [constant UPDATE_ALWAYS], but it has a lower performance cost and can result in higher-quality reflections. The ReflectionProbe is updated when its transform changes, but not when nearby geometry changes. You can force a [ReflectionProbe] update by moving the [ReflectionProbe] slightly in any direction. */
            UPDATE_ONCE = 0,
            
            /** Update the probe every frame. This provides better results for fast-moving dynamic objects (such as cars). However, it has a significant performance cost. Due to the cost, it's recommended to only use one ReflectionProbe with [constant UPDATE_ALWAYS] at most per scene. For all other use cases, use [constant UPDATE_ONCE]. */
            UPDATE_ALWAYS = 1,
        }
        enum AmbientMode {
            /** Do not apply any ambient lighting inside the [ReflectionProbe]'s box defined by its [member size]. */
            AMBIENT_DISABLED = 0,
            
            /** Apply automatically-sourced environment lighting inside the [ReflectionProbe]'s box defined by its [member size]. */
            AMBIENT_ENVIRONMENT = 1,
            
            /** Apply custom ambient lighting inside the [ReflectionProbe]'s box defined by its [member size]. See [member ambient_color] and [member ambient_color_energy]. */
            AMBIENT_COLOR = 2,
        }
    }
    /** @deprecated Internal use. Does not exist at runtime. */
    interface __NameMapReflectionProbe extends __NameMapVisualInstance3D {
    }
    /** Captures its surroundings to create fast, accurate reflections from a given point.  
     *  	  
     *  @link https://docs.godotengine.org/en/4.5/classes/class_reflectionprobe.html  
     */
    class ReflectionProbe<Map extends NodePathMap = any> extends VisualInstance3D<Map> {
        constructor(identifier?: any)
        /** Sets how frequently the [ReflectionProbe] is updated. Can be [constant UPDATE_ONCE] or [constant UPDATE_ALWAYS]. */
        get update_mode(): int64
        set update_mode(value: int64)
        
        /** Defines the reflection intensity. Intensity modulates the strength of the reflection. */
        get intensity(): float64
        set intensity(value: float64)
        
        /** Defines the distance in meters over which a probe blends into the scene. */
        get blend_distance(): float64
        set blend_distance(value: float64)
        
        /** The maximum distance away from the [ReflectionProbe] an object can be before it is culled. Decrease this to improve performance, especially when using the [constant UPDATE_ALWAYS] [member update_mode].  
         *      
         *  **Note:** The maximum reflection distance is always at least equal to the probe's extents. This means that decreasing [member max_distance] will not always cull objects from reflections, especially if the reflection probe's box defined by its [member size] is already large.  
         */
        get max_distance(): float64
        set max_distance(value: float64)
        
        /** The size of the reflection probe. The larger the size, the more space covered by the probe, which will lower the perceived resolution. It is best to keep the size only as large as you need it.  
         *      
         *  **Note:** To better fit areas that are not aligned to the grid, you can rotate the [ReflectionProbe] node.  
         */
        get size(): Vector3
        set size(value: Vector3)
        
        /** Sets the origin offset to be used when this [ReflectionProbe] is in [member box_projection] mode. This can be set to a non-zero value to ensure a reflection fits a rectangle-shaped room, while reducing the number of objects that "get in the way" of the reflection. */
        get origin_offset(): Vector3
        set origin_offset(value: Vector3)
        
        /** If `true`, enables box projection. This makes reflections look more correct in rectangle-shaped rooms by offsetting the reflection center depending on the camera's location.  
         *      
         *  **Note:** To better fit rectangle-shaped rooms that are not aligned to the grid, you can rotate the [ReflectionProbe] node.  
         */
        get box_projection(): boolean
        set box_projection(value: boolean)
        
        /** If `true`, reflections will ignore sky contribution. */
        get interior(): boolean
        set interior(value: boolean)
        
        /** If `true`, computes shadows in the reflection probe. This makes the reflection probe slower to render; you may want to disable this if using the [constant UPDATE_ALWAYS] [member update_mode]. */
        get enable_shadows(): boolean
        set enable_shadows(value: boolean)
        
        /** Sets the cull mask which determines what objects are drawn by this probe. Every [VisualInstance3D] with a layer included in this cull mask will be rendered by the probe. It is best to only include large objects which are likely to take up a lot of space in the reflection in order to save on rendering cost.  
         *  This can also be used to prevent an object from reflecting upon itself (for instance, a [ReflectionProbe] centered on a vehicle).  
         */
        get cull_mask(): int64
        set cull_mask(value: int64)
        
        /** Sets the reflection mask which determines what objects have reflections applied from this probe. Every [VisualInstance3D] with a layer included in this reflection mask will have reflections applied from this probe. See also [member cull_mask], which can be used to exclude objects from appearing in the reflection while still making them affected by the [ReflectionProbe]. */
        get reflection_mask(): int64
        set reflection_mask(value: int64)
        
        /** The automatic LOD bias to use for meshes rendered within the [ReflectionProbe] (this is analog to [member Viewport.mesh_lod_threshold]). Higher values will use less detailed versions of meshes that have LOD variations generated. If set to `0.0`, automatic LOD is disabled. Increase [member mesh_lod_threshold] to improve performance at the cost of geometry detail, especially when using the [constant UPDATE_ALWAYS] [member update_mode].  
         *      
         *  **Note:** [member mesh_lod_threshold] does not affect [GeometryInstance3D] visibility ranges (also known as "manual" LOD or hierarchical LOD).  
         */
        get mesh_lod_threshold(): float64
        set mesh_lod_threshold(value: float64)
        
        /** The ambient color to use within the [ReflectionProbe]'s box defined by its [member size]. The ambient color will smoothly blend with other [ReflectionProbe]s and the rest of the scene (outside the [ReflectionProbe]'s box defined by its [member size]). */
        get ambient_mode(): int64
        set ambient_mode(value: int64)
        
        /** The custom ambient color to use within the [ReflectionProbe]'s box defined by its [member size]. Only effective if [member ambient_mode] is [constant AMBIENT_COLOR]. */
        get ambient_color(): Color
        set ambient_color(value: Color)
        
        /** The custom ambient color energy to use within the [ReflectionProbe]'s box defined by its [member size]. Only effective if [member ambient_mode] is [constant AMBIENT_COLOR]. */
        get ambient_color_energy(): float64
        set ambient_color_energy(value: float64)
        /** @deprecated Internal use. Does not exist at runtime. */
        __godotNameMap: __NameMapReflectionProbe;
    }
    /** @deprecated Internal use. Does not exist at runtime. */
    interface __NameMapRegEx extends __NameMapRefCounted {
    }
    /** Class for searching text for patterns using regular expressions.  
     *  	  
     *  @link https://docs.godotengine.org/en/4.5/classes/class_regex.html  
     */
    class RegEx extends RefCounted {
        constructor(identifier?: any)
        /** Creates and compiles a new [RegEx] object. See also [method compile]. */
        static create_from_string(pattern: string, show_error?: boolean /* = true */): RegEx
        
        /** This method resets the state of the object, as if it was freshly created. Namely, it unassigns the regular expression of this object. */
        clear(): void
        
        /** Compiles and assign the search pattern to use. Returns [constant OK] if the compilation is successful. If compilation fails, returns [constant FAILED] and when [param show_error] is `true`, details are printed to standard output. */
        compile(pattern: string, show_error?: boolean /* = true */): Error
        
        /** Searches the text for the compiled pattern. Returns a [RegExMatch] container of the first matching result if found, otherwise `null`.  
         *  The region to search within can be specified with [param offset] and [param end]. This is useful when searching for another match in the same [param subject] by calling this method again after a previous success. Note that setting these parameters differs from passing over a shortened string. For example, the start anchor `^` is not affected by [param offset], and the character before [param offset] will be checked for the word boundary `\b`.  
         */
        search(subject: string, offset?: int64 /* = 0 */, end?: int64 /* = -1 */): null | RegExMatch
        
        /** Searches the text for the compiled pattern. Returns an array of [RegExMatch] containers for each non-overlapping result. If no results were found, an empty array is returned instead.  
         *  The region to search within can be specified with [param offset] and [param end]. This is useful when searching for another match in the same [param subject] by calling this method again after a previous success. Note that setting these parameters differs from passing over a shortened string. For example, the start anchor `^` is not affected by [param offset], and the character before [param offset] will be checked for the word boundary `\b`.  
         */
        search_all(subject: string, offset?: int64 /* = 0 */, end?: int64 /* = -1 */): GArray<RegExMatch>
        
        /** Searches the text for the compiled pattern and replaces it with the specified string. Escapes and backreferences such as `$1` and `$name` are expanded and resolved. By default, only the first instance is replaced, but it can be changed for all instances (global replacement).  
         *  The region to search within can be specified with [param offset] and [param end]. This is useful when searching for another match in the same [param subject] by calling this method again after a previous success. Note that setting these parameters differs from passing over a shortened string. For example, the start anchor `^` is not affected by [param offset], and the character before [param offset] will be checked for the word boundary `\b`.  
         */
        sub(subject: string, replacement: string, all?: boolean /* = false */, offset?: int64 /* = 0 */, end?: int64 /* = -1 */): string
        
        /** Returns whether this object has a valid search pattern assigned. */
        is_valid(): boolean
        
        /** Returns the original search pattern that was compiled. */
        get_pattern(): string
        
        /** Returns the number of capturing groups in compiled pattern. */
        get_group_count(): int64
        
        /** Returns an array of names of named capturing groups in the compiled pattern. They are ordered by appearance. */
        get_names(): PackedStringArray
        /** @deprecated Internal use. Does not exist at runtime. */
        __godotNameMap: __NameMapRegEx;
    }
    /** @deprecated Internal use. Does not exist at runtime. */
    interface __NameMapRegExMatch extends __NameMapRefCounted {
    }
    /** Contains the results of a [RegEx] search.  
     *  	  
     *  @link https://docs.godotengine.org/en/4.5/classes/class_regexmatch.html  
     */
    class RegExMatch extends RefCounted {
        constructor(identifier?: any)
        /** Returns the number of capturing groups. */
        get_group_count(): int64
        
        /** Returns the substring of the match from the source string. Capturing groups can be retrieved by providing its group number as an integer or its string name (if it's a named group). The default value of 0 refers to the whole pattern.  
         *  Returns an empty string if the group did not match or doesn't exist.  
         */
        get_string(name?: any /* = <any> {} */): string
        
        /** Returns the starting position of the match within the source string. The starting position of capturing groups can be retrieved by providing its group number as an integer or its string name (if it's a named group). The default value of 0 refers to the whole pattern.  
         *  Returns -1 if the group did not match or doesn't exist.  
         */
        get_start(name?: any /* = <any> {} */): int64
        
        /** Returns the end position of the match within the source string. The end position of capturing groups can be retrieved by providing its group number as an integer or its string name (if it's a named group). The default value of 0 refers to the whole pattern.  
         *  Returns -1 if the group did not match or doesn't exist.  
         */
        get_end(name?: any /* = <any> {} */): int64
        
        /** The source string used with the search pattern to find this matching result. */
        get subject(): string
        
        /** A dictionary of named groups and its corresponding group number. Only groups that were matched are included. If multiple groups have the same name, that name would refer to the first matching one. */
        get names(): GDictionary
        
        /** An [Array] of the match and its capturing groups. */
        get strings(): GArray
        /** @deprecated Internal use. Does not exist at runtime. */
        __godotNameMap: __NameMapRegExMatch;
    }
    /** @deprecated Internal use. Does not exist at runtime. */
    interface __NameMapRemoteTransform2D extends __NameMapNode2D {
    }
    /** RemoteTransform2D pushes its own [Transform2D] to another [Node2D] derived node in the scene.  
     *  	  
     *  @link https://docs.godotengine.org/en/4.5/classes/class_remotetransform2d.html  
     */
    class RemoteTransform2D<Map extends NodePathMap = any> extends Node2D<Map> {
        constructor(identifier?: any)
        /** [RemoteTransform2D] caches the remote node. It may not notice if the remote node disappears; [method force_update_cache] forces it to update the cache again. */
        force_update_cache(): void
        
        /** The [NodePath] to the remote node, relative to the RemoteTransform2D's position in the scene. */
        get remote_path(): NodePath
        set remote_path(value: NodePath | string)
        
        /** If `true`, global coordinates are used. If `false`, local coordinates are used. */
        get use_global_coordinates(): boolean
        set use_global_coordinates(value: boolean)
        
        /** If `true`, the remote node's position is updated. */
        get update_position(): boolean
        set update_position(value: boolean)
        
        /** If `true`, the remote node's rotation is updated. */
        get update_rotation(): boolean
        set update_rotation(value: boolean)
        
        /** If `true`, the remote node's scale is updated. */
        get update_scale(): boolean
        set update_scale(value: boolean)
        /** @deprecated Internal use. Does not exist at runtime. */
        __godotNameMap: __NameMapRemoteTransform2D;
    }
    /** @deprecated Internal use. Does not exist at runtime. */
    interface __NameMapRemoteTransform3D extends __NameMapNode3D {
    }
    /** RemoteTransform3D pushes its own [Transform3D] to another [Node3D] derived Node in the scene.  
     *  	  
     *  @link https://docs.godotengine.org/en/4.5/classes/class_remotetransform3d.html  
     */
    class RemoteTransform3D<Map extends NodePathMap = any> extends Node3D<Map> {
        constructor(identifier?: any)
        /** [RemoteTransform3D] caches the remote node. It may not notice if the remote node disappears; [method force_update_cache] forces it to update the cache again. */
        force_update_cache(): void
        
        /** The [NodePath] to the remote node, relative to the RemoteTransform3D's position in the scene. */
        get remote_path(): NodePath
        set remote_path(value: NodePath | string)
        
        /** If `true`, global coordinates are used. If `false`, local coordinates are used. */
        get use_global_coordinates(): boolean
        set use_global_coordinates(value: boolean)
        
        /** If `true`, the remote node's position is updated. */
        get update_position(): boolean
        set update_position(value: boolean)
        
        /** If `true`, the remote node's rotation is updated. */
        get update_rotation(): boolean
        set update_rotation(value: boolean)
        
        /** If `true`, the remote node's scale is updated. */
        get update_scale(): boolean
        set update_scale(value: boolean)
        /** @deprecated Internal use. Does not exist at runtime. */
        __godotNameMap: __NameMapRemoteTransform3D;
    }
    /** @deprecated Internal use. Does not exist at runtime. */
    interface __NameMapRenderData extends __NameMapObject {
    }
    /** Abstract render data object, holds frame data related to rendering a single frame of a viewport.  
     *  	  
     *  @link https://docs.godotengine.org/en/4.5/classes/class_renderdata.html  
     */
    class RenderData extends Object {
        constructor(identifier?: any)
        /** Returns the [RenderSceneBuffers] object managing the scene buffers for rendering this viewport. */
        get_render_scene_buffers(): null | RenderSceneBuffers
        
        /** Returns the [RenderSceneData] object managing this frames scene data. */
        get_render_scene_data(): null | RenderSceneData
        
        /** Returns the [RID] of the environment object in the [RenderingServer] being used to render this viewport. */
        get_environment(): RID
        
        /** Returns the [RID] of the camera attributes object in the [RenderingServer] being used to render this viewport. */
        get_camera_attributes(): RID
        /** @deprecated Internal use. Does not exist at runtime. */
        __godotNameMap: __NameMapRenderData;
    }
    /** @deprecated Internal use. Does not exist at runtime. */
    interface __NameMapRenderDataExtension extends __NameMapRenderData {
    }
    /** This class allows for a RenderData implementation to be made in GDExtension.  
     *  	  
     *  @link https://docs.godotengine.org/en/4.5/classes/class_renderdataextension.html  
     */
    class RenderDataExtension extends RenderData {
        constructor(identifier?: any)
        /** Implement this in GDExtension to return the implementation's [RenderSceneBuffers] object. */
        /* gdvirtual */ _get_render_scene_buffers(): null | RenderSceneBuffers
        
        /** Implement this in GDExtension to return the implementation's [RenderSceneDataExtension] object. */
        /* gdvirtual */ _get_render_scene_data(): null | RenderSceneData
        
        /** Implement this in GDExtension to return the [RID] of the implementation's environment object. */
        /* gdvirtual */ _get_environment(): RID
        
        /** Implement this in GDExtension to return the [RID] for the implementation's camera attributes object. */
        /* gdvirtual */ _get_camera_attributes(): RID
        /** @deprecated Internal use. Does not exist at runtime. */
        __godotNameMap: __NameMapRenderDataExtension;
    }
    /** @deprecated Internal use. Does not exist at runtime. */
    interface __NameMapRenderDataRD extends __NameMapRenderData {
    }
    /** Render data implementation for the RenderingDevice based renderers.  
     *      
     *  **Note:** This is an internal rendering server object, do not instantiate this from script.  
     *  	  
     *  @link https://docs.godotengine.org/en/4.5/classes/class_renderdatard.html  
     */
    class RenderDataRD extends RenderData {
        constructor(identifier?: any)
        /** @deprecated Internal use. Does not exist at runtime. */
        __godotNameMap: __NameMapRenderDataRD;
    }
    /** @deprecated Internal use. Does not exist at runtime. */
    interface __NameMapRenderSceneBuffers extends __NameMapRefCounted {
    }
    /** Abstract scene buffers object, created for each viewport for which 3D rendering is done.  
     *  	  
     *  @link https://docs.godotengine.org/en/4.5/classes/class_renderscenebuffers.html  
     */
    class RenderSceneBuffers extends RefCounted {
        constructor(identifier?: any)
        /** This method is called by the rendering server when the associated viewport's configuration is changed. It will discard the old buffers and recreate the internal buffers used. */
        configure(config: RenderSceneBuffersConfiguration): void
        /** @deprecated Internal use. Does not exist at runtime. */
        __godotNameMap: __NameMapRenderSceneBuffers;
    }
    /** @deprecated Internal use. Does not exist at runtime. */
    interface __NameMapRenderSceneBuffersConfiguration extends __NameMapRefCounted {
    }
    /** Configuration object used to setup a [RenderSceneBuffers] object.  
     *  	  
     *  @link https://docs.godotengine.org/en/4.5/classes/class_renderscenebuffersconfiguration.html  
     */
    class RenderSceneBuffersConfiguration extends RefCounted {
        constructor(identifier?: any)
        /** The render target associated with these buffer. */
        get render_target(): RID
        set render_target(value: RID)
        
        /** The size of the 3D render buffer used for rendering. */
        get internal_size(): Vector2i
        set internal_size(value: Vector2i)
        
        /** The target (upscale) size if scaling is used. */
        get target_size(): Vector2i
        set target_size(value: Vector2i)
        
        /** The number of views we're rendering. */
        get view_count(): int64
        set view_count(value: int64)
        
        /** The requested scaling mode with which we upscale/downscale if [member internal_size] and [member target_size] are not equal. */
        get scaling_3d_mode(): int64
        set scaling_3d_mode(value: int64)
        
        /** The MSAA mode we're using for 3D rendering. */
        get msaa_3d(): int64
        set msaa_3d(value: int64)
        
        /** The requested screen space AA applied in post processing. */
        get screen_space_aa(): int64
        set screen_space_aa(value: int64)
        
        /** FSR Sharpness applicable if FSR upscaling is used. */
        get fsr_sharpness(): boolean
        set fsr_sharpness(value: boolean)
        
        /** Bias applied to mipmaps. */
        get texture_mipmap_bias(): boolean
        set texture_mipmap_bias(value: boolean)
        
        /** Level of the anisotropic filter. */
        get anisotropic_filtering_level(): int64
        set anisotropic_filtering_level(value: int64)
        /** @deprecated Internal use. Does not exist at runtime. */
        __godotNameMap: __NameMapRenderSceneBuffersConfiguration;
    }
    /** @deprecated Internal use. Does not exist at runtime. */
    interface __NameMapRenderSceneBuffersExtension extends __NameMapRenderSceneBuffers {
    }
    /** This class allows for a RenderSceneBuffer implementation to be made in GDExtension.  
     *  	  
     *  @link https://docs.godotengine.org/en/4.5/classes/class_renderscenebuffersextension.html  
     */
    class RenderSceneBuffersExtension extends RenderSceneBuffers {
        constructor(identifier?: any)
        /** Implement this in GDExtension to handle the (re)sizing of a viewport. */
        /* gdvirtual */ _configure(config: RenderSceneBuffersConfiguration): void
        
        /** Implement this in GDExtension to record a new FSR sharpness value. */
        /* gdvirtual */ _set_fsr_sharpness(fsr_sharpness: float64): void
        
        /** Implement this in GDExtension to change the texture mipmap bias. */
        /* gdvirtual */ _set_texture_mipmap_bias(texture_mipmap_bias: float64): void
        
        /** Implement this in GDExtension to change the anisotropic filtering level. */
        /* gdvirtual */ _set_anisotropic_filtering_level(anisotropic_filtering_level: int64): void
        
        /** Implement this in GDExtension to react to the debanding flag changing. */
        /* gdvirtual */ _set_use_debanding(use_debanding: boolean): void
        /** @deprecated Internal use. Does not exist at runtime. */
        __godotNameMap: __NameMapRenderSceneBuffersExtension;
    }
    /** @deprecated Internal use. Does not exist at runtime. */
    interface __NameMapRenderSceneBuffersRD extends __NameMapRenderSceneBuffers {
    }
    /** Render scene buffer implementation for the RenderingDevice based renderers.  
     *  	  
     *  @link https://docs.godotengine.org/en/4.5/classes/class_renderscenebuffersrd.html  
     */
    class RenderSceneBuffersRD extends RenderSceneBuffers {
        constructor(identifier?: any)
        /** Returns `true` if a cached texture exists for this name. */
        has_texture(context: StringName, name: StringName): boolean
        
        /** Create a new texture with the given definition and cache this under the given name. Will return the existing texture if it already exists. */
        create_texture(context: StringName, name: StringName, data_format: RenderingDevice.DataFormat, usage_bits: int64, texture_samples: RenderingDevice.TextureSamples, size: Vector2i, layers: int64, mipmaps: int64, unique: boolean, discardable: boolean): RID
        
        /** Create a new texture using the given format and view and cache this under the given name. Will return the existing texture if it already exists. */
        create_texture_from_format(context: StringName, name: StringName, format: RDTextureFormat, view: RDTextureView, unique: boolean): RID
        
        /** Create a new texture view for an existing texture and cache this under the given [param view_name]. Will return the existing texture view if it already exists. Will error if the source texture doesn't exist. */
        create_texture_view(context: StringName, name: StringName, view_name: StringName, view: RDTextureView): RID
        
        /** Returns a cached texture with this name. */
        get_texture(context: StringName, name: StringName): RID
        
        /** Returns the texture format information with which a cached texture was created. */
        get_texture_format(context: StringName, name: StringName): null | RDTextureFormat
        
        /** Returns a specific slice (layer or mipmap) for a cached texture. */
        get_texture_slice(context: StringName, name: StringName, layer: int64, mipmap: int64, layers: int64, mipmaps: int64): RID
        
        /** Returns a specific view of a slice (layer or mipmap) for a cached texture. */
        get_texture_slice_view(context: StringName, name: StringName, layer: int64, mipmap: int64, layers: int64, mipmaps: int64, view: RDTextureView): RID
        
        /** Returns the texture size of a given slice of a cached texture. */
        get_texture_slice_size(context: StringName, name: StringName, mipmap: int64): Vector2i
        
        /** Frees all buffers related to this context. */
        clear_context(context: StringName): void
        
        /** Returns the color texture we are rendering 3D content to. If multiview is used this will be a texture array with all views.  
         *  If [param msaa] is `true` and MSAA is enabled, this returns the MSAA variant of the buffer.  
         */
        get_color_texture(msaa?: boolean /* = false */): RID
        
        /** Returns the specified layer from the color texture we are rendering 3D content to.  
         *  If [param msaa] is `true` and MSAA is enabled, this returns the MSAA variant of the buffer.  
         */
        get_color_layer(layer: int64, msaa?: boolean /* = false */): RID
        
        /** Returns the depth texture we are rendering 3D content to. If multiview is used this will be a texture array with all views.  
         *  If [param msaa] is `true` and MSAA is enabled, this returns the MSAA variant of the buffer.  
         */
        get_depth_texture(msaa?: boolean /* = false */): RID
        
        /** Returns the specified layer from the depth texture we are rendering 3D content to.  
         *  If [param msaa] is `true` and MSAA is enabled, this returns the MSAA variant of the buffer.  
         */
        get_depth_layer(layer: int64, msaa?: boolean /* = false */): RID
        
        /** Returns the velocity texture we are rendering 3D content to. If multiview is used this will be a texture array with all views.  
         *  If [param msaa] is **true** and MSAA is enabled, this returns the MSAA variant of the buffer.  
         */
        get_velocity_texture(msaa?: boolean /* = false */): RID
        
        /** Returns the specified layer from the velocity texture we are rendering 3D content to. */
        get_velocity_layer(layer: int64, msaa?: boolean /* = false */): RID
        
        /** Returns the render target associated with this buffers object. */
        get_render_target(): RID
        
        /** Returns the view count for the associated viewport. */
        get_view_count(): int64
        
        /** Returns the internal size of the render buffer (size before upscaling) with which textures are created by default. */
        get_internal_size(): Vector2i
        
        /** Returns the target size of the render buffer (size after upscaling). */
        get_target_size(): Vector2i
        
        /** Returns the scaling mode used for upscaling. */
        get_scaling_3d_mode(): RenderingServer.ViewportScaling3DMode
        
        /** Returns the FSR sharpness value used while rendering the 3D content (if [method get_scaling_3d_mode] is an FSR mode). */
        get_fsr_sharpness(): float64
        
        /** Returns the applied 3D MSAA mode for this viewport. */
        get_msaa_3d(): RenderingServer.ViewportMSAA
        
        /** Returns the number of MSAA samples used. */
        get_texture_samples(): RenderingDevice.TextureSamples
        
        /** Returns the screen-space antialiasing method applied. */
        get_screen_space_aa(): RenderingServer.ViewportScreenSpaceAA
        
        /** Returns `true` if TAA is enabled. */
        get_use_taa(): boolean
        
        /** Returns `true` if debanding is enabled. */
        get_use_debanding(): boolean
        /** @deprecated Internal use. Does not exist at runtime. */
        __godotNameMap: __NameMapRenderSceneBuffersRD;
    }
    /** @deprecated Internal use. Does not exist at runtime. */
    interface __NameMapRenderSceneData extends __NameMapObject {
    }
    /** Abstract render data object, holds scene data related to rendering a single frame of a viewport.  
     *  	  
     *  @link https://docs.godotengine.org/en/4.5/classes/class_renderscenedata.html  
     */
    class RenderSceneData extends Object {
        constructor(identifier?: any)
        /** Returns the camera transform used to render this frame.  
         *      
         *  **Note:** If more than one view is rendered, this will return a centered transform.  
         */
        get_cam_transform(): Transform3D
        
        /** Returns the camera projection used to render this frame.  
         *      
         *  **Note:** If more than one view is rendered, this will return a combined projection.  
         */
        get_cam_projection(): Projection
        
        /** Returns the number of views being rendered. */
        get_view_count(): int64
        
        /** Returns the eye offset per view used to render this frame. This is the offset between our camera transform and the eye transform. */
        get_view_eye_offset(view: int64): Vector3
        
        /** Returns the view projection per view used to render this frame.  
         *      
         *  **Note:** If a single view is rendered, this returns the camera projection. If more than one view is rendered, this will return a projection for the given view including the eye offset.  
         */
        get_view_projection(view: int64): Projection
        
        /** Return the [RID] of the uniform buffer containing the scene data as a UBO. */
        get_uniform_buffer(): RID
        /** @deprecated Internal use. Does not exist at runtime. */
        __godotNameMap: __NameMapRenderSceneData;
    }
    /** @deprecated Internal use. Does not exist at runtime. */
    interface __NameMapRenderSceneDataExtension extends __NameMapRenderSceneData {
    }
    /** This class allows for a RenderSceneData implementation to be made in GDExtension.  
     *  	  
     *  @link https://docs.godotengine.org/en/4.5/classes/class_renderscenedataextension.html  
     */
    class RenderSceneDataExtension extends RenderSceneData {
        constructor(identifier?: any)
        /** Implement this in GDExtension to return the camera [Transform3D]. */
        /* gdvirtual */ _get_cam_transform(): Transform3D
        
        /** Implement this in GDExtension to return the camera [Projection]. */
        /* gdvirtual */ _get_cam_projection(): Projection
        
        /** Implement this in GDExtension to return the view count. */
        /* gdvirtual */ _get_view_count(): int64
        
        /** Implement this in GDExtension to return the eye offset for the given [param view]. */
        /* gdvirtual */ _get_view_eye_offset(view: int64): Vector3
        
        /** Implement this in GDExtension to return the view [Projection] for the given [param view]. */
        /* gdvirtual */ _get_view_projection(view: int64): Projection
        
        /** Implement this in GDExtension to return the [RID] of the uniform buffer containing the scene data as a UBO. */
        /* gdvirtual */ _get_uniform_buffer(): RID
        /** @deprecated Internal use. Does not exist at runtime. */
        __godotNameMap: __NameMapRenderSceneDataExtension;
    }
    /** @deprecated Internal use. Does not exist at runtime. */
    interface __NameMapRenderSceneDataRD extends __NameMapRenderSceneData {
    }
    /** Render scene data implementation for the RenderingDevice based renderers.  
     *  	  
     *  @link https://docs.godotengine.org/en/4.5/classes/class_renderscenedatard.html  
     */
    class RenderSceneDataRD extends RenderSceneData {
        constructor(identifier?: any)
        /** @deprecated Internal use. Does not exist at runtime. */
        __godotNameMap: __NameMapRenderSceneDataRD;
    }
    namespace RenderingDevice {
        enum DeviceType {
            /** Rendering device type does not match any of the other enum values or is unknown. */
            DEVICE_TYPE_OTHER = 0,
            
            /** Rendering device is an integrated GPU, which is typically  *(but not always)*  slower than dedicated GPUs ([constant DEVICE_TYPE_DISCRETE_GPU]). On Android and iOS, the rendering device type is always considered to be [constant DEVICE_TYPE_INTEGRATED_GPU]. */
            DEVICE_TYPE_INTEGRATED_GPU = 1,
            
            /** Rendering device is a dedicated GPU, which is typically  *(but not always)*  faster than integrated GPUs ([constant DEVICE_TYPE_INTEGRATED_GPU]). */
            DEVICE_TYPE_DISCRETE_GPU = 2,
            
            /** Rendering device is an emulated GPU in a virtual environment. This is typically much slower than the host GPU, which means the expected performance level on a dedicated GPU will be roughly equivalent to [constant DEVICE_TYPE_INTEGRATED_GPU]. Virtual machine GPU passthrough (such as VFIO) will not report the device type as [constant DEVICE_TYPE_VIRTUAL_GPU]. Instead, the host GPU's device type will be reported as if the GPU was not emulated. */
            DEVICE_TYPE_VIRTUAL_GPU = 3,
            
            /** Rendering device is provided by software emulation (such as Lavapipe or [url=https://github.com/google/swiftshader]SwiftShader[/url]). This is the slowest kind of rendering device available; it's typically much slower than [constant DEVICE_TYPE_INTEGRATED_GPU]. */
            DEVICE_TYPE_CPU = 4,
            
            /** Represents the size of the [enum DeviceType] enum. */
            DEVICE_TYPE_MAX = 5,
        }
        enum DriverResource {
            /** Specific device object based on a physical device (`rid` parameter is ignored).  
             *  - Vulkan: Vulkan device driver resource (`VkDevice`).  
             *  - D3D12: D3D12 device driver resource (`ID3D12Device`).  
             *  - Metal: Metal device driver resource (`MTLDevice`).  
             */
            DRIVER_RESOURCE_LOGICAL_DEVICE = 0,
            
            /** Physical device the specific logical device is based on (`rid` parameter is ignored).  
             *  - Vulkan: `VkPhysicalDevice`.  
             *  - D3D12: `IDXGIAdapter`.  
             */
            DRIVER_RESOURCE_PHYSICAL_DEVICE = 1,
            
            /** Top-most graphics API entry object (`rid` parameter is ignored).  
             *  - Vulkan: `VkInstance`.  
             */
            DRIVER_RESOURCE_TOPMOST_OBJECT = 2,
            
            /** The main graphics-compute command queue (`rid` parameter is ignored).  
             *  - Vulkan: `VkQueue`.  
             *  - Metal: `MTLCommandQueue`.  
             */
            DRIVER_RESOURCE_COMMAND_QUEUE = 3,
            
            /** The specific family the main queue belongs to (`rid` parameter is ignored).  
             *  - Vulkan: The queue family index, a `uint32_t`.  
             */
            DRIVER_RESOURCE_QUEUE_FAMILY = 4,
            
            /** - Vulkan: `VkImage`. */
            DRIVER_RESOURCE_TEXTURE = 5,
            
            /** The view of an owned or shared texture.  
             *  - Vulkan: `VkImageView`.  
             *  - D3D12: `ID3D12Resource`.  
             */
            DRIVER_RESOURCE_TEXTURE_VIEW = 6,
            
            /** The native id of the data format of the texture.  
             *  - Vulkan: `VkFormat`.  
             *  - D3D12: `DXGI_FORMAT`.  
             */
            DRIVER_RESOURCE_TEXTURE_DATA_FORMAT = 7,
            
            /** - Vulkan: `VkSampler`. */
            DRIVER_RESOURCE_SAMPLER = 8,
            
            /** - Vulkan: `VkDescriptorSet`. */
            DRIVER_RESOURCE_UNIFORM_SET = 9,
            
            /** Buffer of any kind of (storage, vertex, etc.).  
             *  - Vulkan: `VkBuffer`.  
             *  - D3D12: `ID3D12Resource`.  
             */
            DRIVER_RESOURCE_BUFFER = 10,
            
            /** - Vulkan: `VkPipeline`.  
             *  - Metal: `MTLComputePipelineState`.  
             */
            DRIVER_RESOURCE_COMPUTE_PIPELINE = 11,
            
            /** - Vulkan: `VkPipeline`.  
             *  - Metal: `MTLRenderPipelineState`.  
             */
            DRIVER_RESOURCE_RENDER_PIPELINE = 12,
            DRIVER_RESOURCE_VULKAN_DEVICE = 0,
            DRIVER_RESOURCE_VULKAN_PHYSICAL_DEVICE = 1,
            DRIVER_RESOURCE_VULKAN_INSTANCE = 2,
            DRIVER_RESOURCE_VULKAN_QUEUE = 3,
            DRIVER_RESOURCE_VULKAN_QUEUE_FAMILY_INDEX = 4,
            DRIVER_RESOURCE_VULKAN_IMAGE = 5,
            DRIVER_RESOURCE_VULKAN_IMAGE_VIEW = 6,
            DRIVER_RESOURCE_VULKAN_IMAGE_NATIVE_TEXTURE_FORMAT = 7,
            DRIVER_RESOURCE_VULKAN_SAMPLER = 8,
            DRIVER_RESOURCE_VULKAN_DESCRIPTOR_SET = 9,
            DRIVER_RESOURCE_VULKAN_BUFFER = 10,
            DRIVER_RESOURCE_VULKAN_COMPUTE_PIPELINE = 11,
            DRIVER_RESOURCE_VULKAN_RENDER_PIPELINE = 12,
        }
        enum DataFormat {
            /** 4-bit-per-channel red/green channel data format, packed into 8 bits. Values are in the `[0.0, 1.0]` range.  
             *      
             *  **Note:** More information on all data formats can be found on the [url=https://registry.khronos.org/vulkan/specs/1.1/html/vkspec.html#_identification_of_formats]Identification of formats[/url] section of the Vulkan specification, as well as the [url=https://registry.khronos.org/vulkan/specs/1.3-extensions/man/html/VkFormat.html]VkFormat[/url] enum.  
             */
            DATA_FORMAT_R4G4_UNORM_PACK8 = 0,
            
            /** 4-bit-per-channel red/green/blue/alpha channel data format, packed into 16 bits. Values are in the `[0.0, 1.0]` range. */
            DATA_FORMAT_R4G4B4A4_UNORM_PACK16 = 1,
            
            /** 4-bit-per-channel blue/green/red/alpha channel data format, packed into 16 bits. Values are in the `[0.0, 1.0]` range. */
            DATA_FORMAT_B4G4R4A4_UNORM_PACK16 = 2,
            
            /** Red/green/blue channel data format with 5 bits of red, 6 bits of green and 5 bits of blue, packed into 16 bits. Values are in the `[0.0, 1.0]` range. */
            DATA_FORMAT_R5G6B5_UNORM_PACK16 = 3,
            
            /** Blue/green/red channel data format with 5 bits of blue, 6 bits of green and 5 bits of red, packed into 16 bits. Values are in the `[0.0, 1.0]` range. */
            DATA_FORMAT_B5G6R5_UNORM_PACK16 = 4,
            
            /** Red/green/blue/alpha channel data format with 5 bits of red, 6 bits of green, 5 bits of blue and 1 bit of alpha, packed into 16 bits. Values are in the `[0.0, 1.0]` range. */
            DATA_FORMAT_R5G5B5A1_UNORM_PACK16 = 5,
            
            /** Blue/green/red/alpha channel data format with 5 bits of blue, 6 bits of green, 5 bits of red and 1 bit of alpha, packed into 16 bits. Values are in the `[0.0, 1.0]` range. */
            DATA_FORMAT_B5G5R5A1_UNORM_PACK16 = 6,
            
            /** Alpha/red/green/blue channel data format with 1 bit of alpha, 5 bits of red, 6 bits of green and 5 bits of blue, packed into 16 bits. Values are in the `[0.0, 1.0]` range. */
            DATA_FORMAT_A1R5G5B5_UNORM_PACK16 = 7,
            
            /** 8-bit-per-channel unsigned floating-point red channel data format with normalized value. Values are in the `[0.0, 1.0]` range. */
            DATA_FORMAT_R8_UNORM = 8,
            
            /** 8-bit-per-channel signed floating-point red channel data format with normalized value. Values are in the `[-1.0, 1.0]` range. */
            DATA_FORMAT_R8_SNORM = 9,
            
            /** 8-bit-per-channel unsigned floating-point red channel data format with scaled value (value is converted from integer to float). Values are in the `[0.0, 255.0]` range. */
            DATA_FORMAT_R8_USCALED = 10,
            
            /** 8-bit-per-channel signed floating-point red channel data format with scaled value (value is converted from integer to float). Values are in the `[-127.0, 127.0]` range. */
            DATA_FORMAT_R8_SSCALED = 11,
            
            /** 8-bit-per-channel unsigned integer red channel data format. Values are in the `[0, 255]` range. */
            DATA_FORMAT_R8_UINT = 12,
            
            /** 8-bit-per-channel signed integer red channel data format. Values are in the `[-127, 127]` range. */
            DATA_FORMAT_R8_SINT = 13,
            
            /** 8-bit-per-channel unsigned floating-point red channel data format with normalized value and non-linear sRGB encoding. Values are in the `[0.0, 1.0]` range. */
            DATA_FORMAT_R8_SRGB = 14,
            
            /** 8-bit-per-channel unsigned floating-point red/green channel data format with normalized value. Values are in the `[0.0, 1.0]` range. */
            DATA_FORMAT_R8G8_UNORM = 15,
            
            /** 8-bit-per-channel signed floating-point red/green channel data format with normalized value. Values are in the `[-1.0, 1.0]` range. */
            DATA_FORMAT_R8G8_SNORM = 16,
            
            /** 8-bit-per-channel unsigned floating-point red/green channel data format with scaled value (value is converted from integer to float). Values are in the `[0.0, 255.0]` range. */
            DATA_FORMAT_R8G8_USCALED = 17,
            
            /** 8-bit-per-channel signed floating-point red/green channel data format with scaled value (value is converted from integer to float). Values are in the `[-127.0, 127.0]` range. */
            DATA_FORMAT_R8G8_SSCALED = 18,
            
            /** 8-bit-per-channel unsigned integer red/green channel data format. Values are in the `[0, 255]` range. */
            DATA_FORMAT_R8G8_UINT = 19,
            
            /** 8-bit-per-channel signed integer red/green channel data format. Values are in the `[-127, 127]` range. */
            DATA_FORMAT_R8G8_SINT = 20,
            
            /** 8-bit-per-channel unsigned floating-point red/green channel data format with normalized value and non-linear sRGB encoding. Values are in the `[0.0, 1.0]` range. */
            DATA_FORMAT_R8G8_SRGB = 21,
            
            /** 8-bit-per-channel unsigned floating-point red/green/blue channel data format with normalized value. Values are in the `[0.0, 1.0]` range. */
            DATA_FORMAT_R8G8B8_UNORM = 22,
            
            /** 8-bit-per-channel signed floating-point red/green/blue channel data format with normalized value. Values are in the `[-1.0, 1.0]` range. */
            DATA_FORMAT_R8G8B8_SNORM = 23,
            
            /** 8-bit-per-channel unsigned floating-point red/green/blue channel data format with scaled value (value is converted from integer to float). Values are in the `[0.0, 255.0]` range. */
            DATA_FORMAT_R8G8B8_USCALED = 24,
            
            /** 8-bit-per-channel signed floating-point red/green/blue channel data format with scaled value (value is converted from integer to float). Values are in the `[-127.0, 127.0]` range. */
            DATA_FORMAT_R8G8B8_SSCALED = 25,
            
            /** 8-bit-per-channel unsigned integer red/green/blue channel data format. Values are in the `[0, 255]` range. */
            DATA_FORMAT_R8G8B8_UINT = 26,
            
            /** 8-bit-per-channel signed integer red/green/blue channel data format. Values are in the `[-127, 127]` range. */
            DATA_FORMAT_R8G8B8_SINT = 27,
            
            /** 8-bit-per-channel unsigned floating-point red/green/blue channel data format with normalized value and non-linear sRGB encoding. Values are in the `[0.0, 1.0]` range. */
            DATA_FORMAT_R8G8B8_SRGB = 28,
            
            /** 8-bit-per-channel unsigned floating-point blue/green/red channel data format with normalized value. Values are in the `[0.0, 1.0]` range. */
            DATA_FORMAT_B8G8R8_UNORM = 29,
            
            /** 8-bit-per-channel signed floating-point blue/green/red channel data format with normalized value. Values are in the `[-1.0, 1.0]` range. */
            DATA_FORMAT_B8G8R8_SNORM = 30,
            
            /** 8-bit-per-channel unsigned floating-point blue/green/red channel data format with scaled value (value is converted from integer to float). Values are in the `[0.0, 255.0]` range. */
            DATA_FORMAT_B8G8R8_USCALED = 31,
            
            /** 8-bit-per-channel signed floating-point blue/green/red channel data format with scaled value (value is converted from integer to float). Values are in the `[-127.0, 127.0]` range. */
            DATA_FORMAT_B8G8R8_SSCALED = 32,
            
            /** 8-bit-per-channel unsigned integer blue/green/red channel data format. Values are in the `[0, 255]` range. */
            DATA_FORMAT_B8G8R8_UINT = 33,
            
            /** 8-bit-per-channel signed integer blue/green/red channel data format. Values are in the `[-127, 127]` range. */
            DATA_FORMAT_B8G8R8_SINT = 34,
            
            /** 8-bit-per-channel unsigned floating-point blue/green/red data format with normalized value and non-linear sRGB encoding. Values are in the `[0.0, 1.0]` range. */
            DATA_FORMAT_B8G8R8_SRGB = 35,
            
            /** 8-bit-per-channel unsigned floating-point red/green/blue/alpha channel data format with normalized value. Values are in the `[0.0, 1.0]` range. */
            DATA_FORMAT_R8G8B8A8_UNORM = 36,
            
            /** 8-bit-per-channel signed floating-point red/green/blue/alpha channel data format with normalized value. Values are in the `[-1.0, 1.0]` range. */
            DATA_FORMAT_R8G8B8A8_SNORM = 37,
            
            /** 8-bit-per-channel unsigned floating-point red/green/blue/alpha channel data format with scaled value (value is converted from integer to float). Values are in the `[0.0, 255.0]` range. */
            DATA_FORMAT_R8G8B8A8_USCALED = 38,
            
            /** 8-bit-per-channel signed floating-point red/green/blue/alpha channel data format with scaled value (value is converted from integer to float). Values are in the `[-127.0, 127.0]` range. */
            DATA_FORMAT_R8G8B8A8_SSCALED = 39,
            
            /** 8-bit-per-channel unsigned integer red/green/blue/alpha channel data format. Values are in the `[0, 255]` range. */
            DATA_FORMAT_R8G8B8A8_UINT = 40,
            
            /** 8-bit-per-channel signed integer red/green/blue/alpha channel data format. Values are in the `[-127, 127]` range. */
            DATA_FORMAT_R8G8B8A8_SINT = 41,
            
            /** 8-bit-per-channel unsigned floating-point red/green/blue/alpha channel data format with normalized value and non-linear sRGB encoding. Values are in the `[0.0, 1.0]` range. */
            DATA_FORMAT_R8G8B8A8_SRGB = 42,
            
            /** 8-bit-per-channel unsigned floating-point blue/green/red/alpha channel data format with normalized value. Values are in the `[0.0, 1.0]` range. */
            DATA_FORMAT_B8G8R8A8_UNORM = 43,
            
            /** 8-bit-per-channel signed floating-point blue/green/red/alpha channel data format with normalized value. Values are in the `[-1.0, 1.0]` range. */
            DATA_FORMAT_B8G8R8A8_SNORM = 44,
            
            /** 8-bit-per-channel unsigned floating-point blue/green/red/alpha channel data format with scaled value (value is converted from integer to float). Values are in the `[0.0, 255.0]` range. */
            DATA_FORMAT_B8G8R8A8_USCALED = 45,
            
            /** 8-bit-per-channel signed floating-point blue/green/red/alpha channel data format with scaled value (value is converted from integer to float). Values are in the `[-127.0, 127.0]` range. */
            DATA_FORMAT_B8G8R8A8_SSCALED = 46,
            
            /** 8-bit-per-channel unsigned integer blue/green/red/alpha channel data format. Values are in the `[0, 255]` range. */
            DATA_FORMAT_B8G8R8A8_UINT = 47,
            
            /** 8-bit-per-channel signed integer blue/green/red/alpha channel data format. Values are in the `[-127, 127]` range. */
            DATA_FORMAT_B8G8R8A8_SINT = 48,
            
            /** 8-bit-per-channel unsigned floating-point blue/green/red/alpha channel data format with normalized value and non-linear sRGB encoding. Values are in the `[0.0, 1.0]` range. */
            DATA_FORMAT_B8G8R8A8_SRGB = 49,
            
            /** 8-bit-per-channel unsigned floating-point alpha/red/green/blue channel data format with normalized value, packed in 32 bits. Values are in the `[0.0, 1.0]` range. */
            DATA_FORMAT_A8B8G8R8_UNORM_PACK32 = 50,
            
            /** 8-bit-per-channel signed floating-point alpha/red/green/blue channel data format with normalized value, packed in 32 bits. Values are in the `[-1.0, 1.0]` range. */
            DATA_FORMAT_A8B8G8R8_SNORM_PACK32 = 51,
            
            /** 8-bit-per-channel unsigned floating-point alpha/red/green/blue channel data format with scaled value (value is converted from integer to float), packed in 32 bits. Values are in the `[0.0, 255.0]` range. */
            DATA_FORMAT_A8B8G8R8_USCALED_PACK32 = 52,
            
            /** 8-bit-per-channel signed floating-point alpha/red/green/blue channel data format with scaled value (value is converted from integer to float), packed in 32 bits. Values are in the `[-127.0, 127.0]` range. */
            DATA_FORMAT_A8B8G8R8_SSCALED_PACK32 = 53,
            
            /** 8-bit-per-channel unsigned integer alpha/red/green/blue channel data format, packed in 32 bits. Values are in the `[0, 255]` range. */
            DATA_FORMAT_A8B8G8R8_UINT_PACK32 = 54,
            
            /** 8-bit-per-channel signed integer alpha/red/green/blue channel data format, packed in 32 bits. Values are in the `[-127, 127]` range. */
            DATA_FORMAT_A8B8G8R8_SINT_PACK32 = 55,
            
            /** 8-bit-per-channel unsigned floating-point alpha/red/green/blue channel data format with normalized value and non-linear sRGB encoding, packed in 32 bits. Values are in the `[0.0, 1.0]` range. */
            DATA_FORMAT_A8B8G8R8_SRGB_PACK32 = 56,
            
            /** Unsigned floating-point alpha/red/green/blue channel data format with normalized value, packed in 32 bits. Format contains 2 bits of alpha, 10 bits of red, 10 bits of green and 10 bits of blue. Values are in the `[0.0, 1.0]` range. */
            DATA_FORMAT_A2R10G10B10_UNORM_PACK32 = 57,
            
            /** Signed floating-point alpha/red/green/blue channel data format with normalized value, packed in 32 bits. Format contains 2 bits of alpha, 10 bits of red, 10 bits of green and 10 bits of blue. Values are in the `[-1.0, 1.0]` range. */
            DATA_FORMAT_A2R10G10B10_SNORM_PACK32 = 58,
            
            /** Unsigned floating-point alpha/red/green/blue channel data format with normalized value, packed in 32 bits. Format contains 2 bits of alpha, 10 bits of red, 10 bits of green and 10 bits of blue. Values are in the `[0.0, 1023.0]` range for red/green/blue and `[0.0, 3.0]` for alpha. */
            DATA_FORMAT_A2R10G10B10_USCALED_PACK32 = 59,
            
            /** Signed floating-point alpha/red/green/blue channel data format with normalized value, packed in 32 bits. Format contains 2 bits of alpha, 10 bits of red, 10 bits of green and 10 bits of blue. Values are in the `[-511.0, 511.0]` range for red/green/blue and `[-1.0, 1.0]` for alpha. */
            DATA_FORMAT_A2R10G10B10_SSCALED_PACK32 = 60,
            
            /** Unsigned integer alpha/red/green/blue channel data format with normalized value, packed in 32 bits. Format contains 2 bits of alpha, 10 bits of red, 10 bits of green and 10 bits of blue. Values are in the `[0, 1023]` range for red/green/blue and `[0, 3]` for alpha. */
            DATA_FORMAT_A2R10G10B10_UINT_PACK32 = 61,
            
            /** Signed integer alpha/red/green/blue channel data format with normalized value, packed in 32 bits. Format contains 2 bits of alpha, 10 bits of red, 10 bits of green and 10 bits of blue. Values are in the `[-511, 511]` range for red/green/blue and `[-1, 1]` for alpha. */
            DATA_FORMAT_A2R10G10B10_SINT_PACK32 = 62,
            
            /** Unsigned floating-point alpha/blue/green/red channel data format with normalized value, packed in 32 bits. Format contains 2 bits of alpha, 10 bits of blue, 10 bits of green and 10 bits of red. Values are in the `[0.0, 1.0]` range. */
            DATA_FORMAT_A2B10G10R10_UNORM_PACK32 = 63,
            
            /** Signed floating-point alpha/blue/green/red channel data format with normalized value, packed in 32 bits. Format contains 2 bits of alpha, 10 bits of blue, 10 bits of green and 10 bits of red. Values are in the `[-1.0, 1.0]` range. */
            DATA_FORMAT_A2B10G10R10_SNORM_PACK32 = 64,
            
            /** Unsigned floating-point alpha/blue/green/red channel data format with normalized value, packed in 32 bits. Format contains 2 bits of alpha, 10 bits of blue, 10 bits of green and 10 bits of red. Values are in the `[0.0, 1023.0]` range for blue/green/red and `[0.0, 3.0]` for alpha. */
            DATA_FORMAT_A2B10G10R10_USCALED_PACK32 = 65,
            
            /** Signed floating-point alpha/blue/green/red channel data format with normalized value, packed in 32 bits. Format contains 2 bits of alpha, 10 bits of blue, 10 bits of green and 10 bits of red. Values are in the `[-511.0, 511.0]` range for blue/green/red and `[-1.0, 1.0]` for alpha. */
            DATA_FORMAT_A2B10G10R10_SSCALED_PACK32 = 66,
            
            /** Unsigned integer alpha/blue/green/red channel data format with normalized value, packed in 32 bits. Format contains 2 bits of alpha, 10 bits of blue, 10 bits of green and 10 bits of red. Values are in the `[0, 1023]` range for blue/green/red and `[0, 3]` for alpha. */
            DATA_FORMAT_A2B10G10R10_UINT_PACK32 = 67,
            
            /** Signed integer alpha/blue/green/red channel data format with normalized value, packed in 32 bits. Format contains 2 bits of alpha, 10 bits of blue, 10 bits of green and 10 bits of red. Values are in the `[-511, 511]` range for blue/green/red and `[-1, 1]` for alpha. */
            DATA_FORMAT_A2B10G10R10_SINT_PACK32 = 68,
            
            /** 16-bit-per-channel unsigned floating-point red channel data format with normalized value. Values are in the `[0.0, 1.0]` range. */
            DATA_FORMAT_R16_UNORM = 69,
            
            /** 16-bit-per-channel signed floating-point red channel data format with normalized value. Values are in the `[-1.0, 1.0]` range. */
            DATA_FORMAT_R16_SNORM = 70,
            
            /** 16-bit-per-channel unsigned floating-point red channel data format with scaled value (value is converted from integer to float). Values are in the `[0.0, 65535.0]` range. */
            DATA_FORMAT_R16_USCALED = 71,
            
            /** 16-bit-per-channel signed floating-point red channel data format with scaled value (value is converted from integer to float). Values are in the `[-32767.0, 32767.0]` range. */
            DATA_FORMAT_R16_SSCALED = 72,
            
            /** 16-bit-per-channel unsigned integer red channel data format. Values are in the `[0.0, 65535]` range. */
            DATA_FORMAT_R16_UINT = 73,
            
            /** 16-bit-per-channel signed integer red channel data format. Values are in the `[-32767, 32767]` range. */
            DATA_FORMAT_R16_SINT = 74,
            
            /** 16-bit-per-channel signed floating-point red channel data format with the value stored as-is. */
            DATA_FORMAT_R16_SFLOAT = 75,
            
            /** 16-bit-per-channel unsigned floating-point red/green channel data format with normalized value. Values are in the `[0.0, 1.0]` range. */
            DATA_FORMAT_R16G16_UNORM = 76,
            
            /** 16-bit-per-channel signed floating-point red/green channel data format with normalized value. Values are in the `[-1.0, 1.0]` range. */
            DATA_FORMAT_R16G16_SNORM = 77,
            
            /** 16-bit-per-channel unsigned floating-point red/green channel data format with scaled value (value is converted from integer to float). Values are in the `[0.0, 65535.0]` range. */
            DATA_FORMAT_R16G16_USCALED = 78,
            
            /** 16-bit-per-channel signed floating-point red/green channel data format with scaled value (value is converted from integer to float). Values are in the `[-32767.0, 32767.0]` range. */
            DATA_FORMAT_R16G16_SSCALED = 79,
            
            /** 16-bit-per-channel unsigned integer red/green channel data format. Values are in the `[0.0, 65535]` range. */
            DATA_FORMAT_R16G16_UINT = 80,
            
            /** 16-bit-per-channel signed integer red/green channel data format. Values are in the `[-32767, 32767]` range. */
            DATA_FORMAT_R16G16_SINT = 81,
            
            /** 16-bit-per-channel signed floating-point red/green channel data format with the value stored as-is. */
            DATA_FORMAT_R16G16_SFLOAT = 82,
            
            /** 16-bit-per-channel unsigned floating-point red/green/blue channel data format with normalized value. Values are in the `[0.0, 1.0]` range. */
            DATA_FORMAT_R16G16B16_UNORM = 83,
            
            /** 16-bit-per-channel signed floating-point red/green/blue channel data format with normalized value. Values are in the `[-1.0, 1.0]` range. */
            DATA_FORMAT_R16G16B16_SNORM = 84,
            
            /** 16-bit-per-channel unsigned floating-point red/green/blue channel data format with scaled value (value is converted from integer to float). Values are in the `[0.0, 65535.0]` range. */
            DATA_FORMAT_R16G16B16_USCALED = 85,
            
            /** 16-bit-per-channel signed floating-point red/green/blue channel data format with scaled value (value is converted from integer to float). Values are in the `[-32767.0, 32767.0]` range. */
            DATA_FORMAT_R16G16B16_SSCALED = 86,
            
            /** 16-bit-per-channel unsigned integer red/green/blue channel data format. Values are in the `[0.0, 65535]` range. */
            DATA_FORMAT_R16G16B16_UINT = 87,
            
            /** 16-bit-per-channel signed integer red/green/blue channel data format. Values are in the `[-32767, 32767]` range. */
            DATA_FORMAT_R16G16B16_SINT = 88,
            
            /** 16-bit-per-channel signed floating-point red/green/blue channel data format with the value stored as-is. */
            DATA_FORMAT_R16G16B16_SFLOAT = 89,
            
            /** 16-bit-per-channel unsigned floating-point red/green/blue/alpha channel data format with normalized value. Values are in the `[0.0, 1.0]` range. */
            DATA_FORMAT_R16G16B16A16_UNORM = 90,
            
            /** 16-bit-per-channel signed floating-point red/green/blue/alpha channel data format with normalized value. Values are in the `[-1.0, 1.0]` range. */
            DATA_FORMAT_R16G16B16A16_SNORM = 91,
            
            /** 16-bit-per-channel unsigned floating-point red/green/blue/alpha channel data format with scaled value (value is converted from integer to float). Values are in the `[0.0, 65535.0]` range. */
            DATA_FORMAT_R16G16B16A16_USCALED = 92,
            
            /** 16-bit-per-channel signed floating-point red/green/blue/alpha channel data format with scaled value (value is converted from integer to float). Values are in the `[-32767.0, 32767.0]` range. */
            DATA_FORMAT_R16G16B16A16_SSCALED = 93,
            
            /** 16-bit-per-channel unsigned integer red/green/blue/alpha channel data format. Values are in the `[0.0, 65535]` range. */
            DATA_FORMAT_R16G16B16A16_UINT = 94,
            
            /** 16-bit-per-channel signed integer red/green/blue/alpha channel data format. Values are in the `[-32767, 32767]` range. */
            DATA_FORMAT_R16G16B16A16_SINT = 95,
            
            /** 16-bit-per-channel signed floating-point red/green/blue/alpha channel data format with the value stored as-is. */
            DATA_FORMAT_R16G16B16A16_SFLOAT = 96,
            
            /** 32-bit-per-channel unsigned integer red channel data format. Values are in the `[0, 2^32 - 1]` range. */
            DATA_FORMAT_R32_UINT = 97,
            
            /** 32-bit-per-channel signed integer red channel data format. Values are in the `[2^31 + 1, 2^31 - 1]` range. */
            DATA_FORMAT_R32_SINT = 98,
            
            /** 32-bit-per-channel signed floating-point red channel data format with the value stored as-is. */
            DATA_FORMAT_R32_SFLOAT = 99,
            
            /** 32-bit-per-channel unsigned integer red/green channel data format. Values are in the `[0, 2^32 - 1]` range. */
            DATA_FORMAT_R32G32_UINT = 100,
            
            /** 32-bit-per-channel signed integer red/green channel data format. Values are in the `[2^31 + 1, 2^31 - 1]` range. */
            DATA_FORMAT_R32G32_SINT = 101,
            
            /** 32-bit-per-channel signed floating-point red/green channel data format with the value stored as-is. */
            DATA_FORMAT_R32G32_SFLOAT = 102,
            
            /** 32-bit-per-channel unsigned integer red/green/blue channel data format. Values are in the `[0, 2^32 - 1]` range. */
            DATA_FORMAT_R32G32B32_UINT = 103,
            
            /** 32-bit-per-channel signed integer red/green/blue channel data format. Values are in the `[2^31 + 1, 2^31 - 1]` range. */
            DATA_FORMAT_R32G32B32_SINT = 104,
            
            /** 32-bit-per-channel signed floating-point red/green/blue channel data format with the value stored as-is. */
            DATA_FORMAT_R32G32B32_SFLOAT = 105,
            
            /** 32-bit-per-channel unsigned integer red/green/blue/alpha channel data format. Values are in the `[0, 2^32 - 1]` range. */
            DATA_FORMAT_R32G32B32A32_UINT = 106,
            
            /** 32-bit-per-channel signed integer red/green/blue/alpha channel data format. Values are in the `[2^31 + 1, 2^31 - 1]` range. */
            DATA_FORMAT_R32G32B32A32_SINT = 107,
            
            /** 32-bit-per-channel signed floating-point red/green/blue/alpha channel data format with the value stored as-is. */
            DATA_FORMAT_R32G32B32A32_SFLOAT = 108,
            
            /** 64-bit-per-channel unsigned integer red channel data format. Values are in the `[0, 2^64 - 1]` range. */
            DATA_FORMAT_R64_UINT = 109,
            
            /** 64-bit-per-channel signed integer red channel data format. Values are in the `[2^63 + 1, 2^63 - 1]` range. */
            DATA_FORMAT_R64_SINT = 110,
            
            /** 64-bit-per-channel signed floating-point red channel data format with the value stored as-is. */
            DATA_FORMAT_R64_SFLOAT = 111,
            
            /** 64-bit-per-channel unsigned integer red/green channel data format. Values are in the `[0, 2^64 - 1]` range. */
            DATA_FORMAT_R64G64_UINT = 112,
            
            /** 64-bit-per-channel signed integer red/green channel data format. Values are in the `[2^63 + 1, 2^63 - 1]` range. */
            DATA_FORMAT_R64G64_SINT = 113,
            
            /** 64-bit-per-channel signed floating-point red/green channel data format with the value stored as-is. */
            DATA_FORMAT_R64G64_SFLOAT = 114,
            
            /** 64-bit-per-channel unsigned integer red/green/blue channel data format. Values are in the `[0, 2^64 - 1]` range. */
            DATA_FORMAT_R64G64B64_UINT = 115,
            
            /** 64-bit-per-channel signed integer red/green/blue channel data format. Values are in the `[2^63 + 1, 2^63 - 1]` range. */
            DATA_FORMAT_R64G64B64_SINT = 116,
            
            /** 64-bit-per-channel signed floating-point red/green/blue channel data format with the value stored as-is. */
            DATA_FORMAT_R64G64B64_SFLOAT = 117,
            
            /** 64-bit-per-channel unsigned integer red/green/blue/alpha channel data format. Values are in the `[0, 2^64 - 1]` range. */
            DATA_FORMAT_R64G64B64A64_UINT = 118,
            
            /** 64-bit-per-channel signed integer red/green/blue/alpha channel data format. Values are in the `[2^63 + 1, 2^63 - 1]` range. */
            DATA_FORMAT_R64G64B64A64_SINT = 119,
            
            /** 64-bit-per-channel signed floating-point red/green/blue/alpha channel data format with the value stored as-is. */
            DATA_FORMAT_R64G64B64A64_SFLOAT = 120,
            
            /** Unsigned floating-point blue/green/red data format with the value stored as-is, packed in 32 bits. The format's precision is 10 bits of blue channel, 11 bits of green channel and 11 bits of red channel. */
            DATA_FORMAT_B10G11R11_UFLOAT_PACK32 = 121,
            
            /** Unsigned floating-point exposure/blue/green/red data format with the value stored as-is, packed in 32 bits. The format's precision is 5 bits of exposure, 9 bits of blue channel, 9 bits of green channel and 9 bits of red channel. */
            DATA_FORMAT_E5B9G9R9_UFLOAT_PACK32 = 122,
            
            /** 16-bit unsigned floating-point depth data format with normalized value. Values are in the `[0.0, 1.0]` range. */
            DATA_FORMAT_D16_UNORM = 123,
            
            /** 24-bit unsigned floating-point depth data format with normalized value, plus 8 unused bits, packed in 32 bits. Values for depth are in the `[0.0, 1.0]` range. */
            DATA_FORMAT_X8_D24_UNORM_PACK32 = 124,
            
            /** 32-bit signed floating-point depth data format with the value stored as-is. */
            DATA_FORMAT_D32_SFLOAT = 125,
            
            /** 8-bit unsigned integer stencil data format. */
            DATA_FORMAT_S8_UINT = 126,
            
            /** 16-bit unsigned floating-point depth data format with normalized value, plus 8 bits of stencil in unsigned integer format. Values for depth are in the `[0.0, 1.0]` range. Values for stencil are in the `[0, 255]` range. */
            DATA_FORMAT_D16_UNORM_S8_UINT = 127,
            
            /** 24-bit unsigned floating-point depth data format with normalized value, plus 8 bits of stencil in unsigned integer format. Values for depth are in the `[0.0, 1.0]` range. Values for stencil are in the `[0, 255]` range. */
            DATA_FORMAT_D24_UNORM_S8_UINT = 128,
            
            /** 32-bit signed floating-point depth data format with the value stored as-is, plus 8 bits of stencil in unsigned integer format. Values for stencil are in the `[0, 255]` range. */
            DATA_FORMAT_D32_SFLOAT_S8_UINT = 129,
            
            /** VRAM-compressed unsigned red/green/blue channel data format with normalized value. Values are in the `[0.0, 1.0]` range. The format's precision is 5 bits of red channel, 6 bits of green channel and 5 bits of blue channel. Using BC1 texture compression (also known as S3TC DXT1). */
            DATA_FORMAT_BC1_RGB_UNORM_BLOCK = 130,
            
            /** VRAM-compressed unsigned red/green/blue channel data format with normalized value and non-linear sRGB encoding. Values are in the `[0.0, 1.0]` range. The format's precision is 5 bits of red channel, 6 bits of green channel and 5 bits of blue channel. Using BC1 texture compression (also known as S3TC DXT1). */
            DATA_FORMAT_BC1_RGB_SRGB_BLOCK = 131,
            
            /** VRAM-compressed unsigned red/green/blue/alpha channel data format with normalized value. Values are in the `[0.0, 1.0]` range. The format's precision is 5 bits of red channel, 6 bits of green channel, 5 bits of blue channel and 1 bit of alpha channel. Using BC1 texture compression (also known as S3TC DXT1). */
            DATA_FORMAT_BC1_RGBA_UNORM_BLOCK = 132,
            
            /** VRAM-compressed unsigned red/green/blue/alpha channel data format with normalized value and non-linear sRGB encoding. Values are in the `[0.0, 1.0]` range. The format's precision is 5 bits of red channel, 6 bits of green channel, 5 bits of blue channel and 1 bit of alpha channel. Using BC1 texture compression (also known as S3TC DXT1). */
            DATA_FORMAT_BC1_RGBA_SRGB_BLOCK = 133,
            
            /** VRAM-compressed unsigned red/green/blue/alpha channel data format with normalized value. Values are in the `[0.0, 1.0]` range. The format's precision is 5 bits of red channel, 6 bits of green channel, 5 bits of blue channel and 4 bits of alpha channel. Using BC2 texture compression (also known as S3TC DXT3). */
            DATA_FORMAT_BC2_UNORM_BLOCK = 134,
            
            /** VRAM-compressed unsigned red/green/blue/alpha channel data format with normalized value and non-linear sRGB encoding. Values are in the `[0.0, 1.0]` range. The format's precision is 5 bits of red channel, 6 bits of green channel, 5 bits of blue channel and 4 bits of alpha channel. Using BC2 texture compression (also known as S3TC DXT3). */
            DATA_FORMAT_BC2_SRGB_BLOCK = 135,
            
            /** VRAM-compressed unsigned red/green/blue/alpha channel data format with normalized value. Values are in the `[0.0, 1.0]` range. The format's precision is 5 bits of red channel, 6 bits of green channel, 5 bits of blue channel and 8 bits of alpha channel. Using BC3 texture compression (also known as S3TC DXT5). */
            DATA_FORMAT_BC3_UNORM_BLOCK = 136,
            
            /** VRAM-compressed unsigned red/green/blue/alpha channel data format with normalized value and non-linear sRGB encoding. Values are in the `[0.0, 1.0]` range. The format's precision is 5 bits of red channel, 6 bits of green channel, 5 bits of blue channel and 8 bits of alpha channel. Using BC3 texture compression (also known as S3TC DXT5). */
            DATA_FORMAT_BC3_SRGB_BLOCK = 137,
            
            /** VRAM-compressed unsigned red channel data format with normalized value. Values are in the `[0.0, 1.0]` range. The format's precision is 8 bits of red channel. Using BC4 texture compression. */
            DATA_FORMAT_BC4_UNORM_BLOCK = 138,
            
            /** VRAM-compressed signed red channel data format with normalized value. Values are in the `[-1.0, 1.0]` range. The format's precision is 8 bits of red channel. Using BC4 texture compression. */
            DATA_FORMAT_BC4_SNORM_BLOCK = 139,
            
            /** VRAM-compressed unsigned red/green channel data format with normalized value. Values are in the `[0.0, 1.0]` range. The format's precision is 8 bits of red channel and 8 bits of green channel. Using BC5 texture compression (also known as S3TC RGTC). */
            DATA_FORMAT_BC5_UNORM_BLOCK = 140,
            
            /** VRAM-compressed signed red/green channel data format with normalized value. Values are in the `[-1.0, 1.0]` range. The format's precision is 8 bits of red channel and 8 bits of green channel. Using BC5 texture compression (also known as S3TC RGTC). */
            DATA_FORMAT_BC5_SNORM_BLOCK = 141,
            
            /** VRAM-compressed unsigned red/green/blue channel data format with the floating-point value stored as-is. The format's precision is between 10 and 13 bits for the red/green/blue channels. Using BC6H texture compression (also known as BPTC HDR). */
            DATA_FORMAT_BC6H_UFLOAT_BLOCK = 142,
            
            /** VRAM-compressed signed red/green/blue channel data format with the floating-point value stored as-is. The format's precision is between 10 and 13 bits for the red/green/blue channels. Using BC6H texture compression (also known as BPTC HDR). */
            DATA_FORMAT_BC6H_SFLOAT_BLOCK = 143,
            
            /** VRAM-compressed unsigned red/green/blue/alpha channel data format with normalized value. Values are in the `[0.0, 1.0]` range. The format's precision is between 4 and 7 bits for the red/green/blue channels and between 0 and 8 bits for the alpha channel. Also known as BPTC LDR. */
            DATA_FORMAT_BC7_UNORM_BLOCK = 144,
            
            /** VRAM-compressed unsigned red/green/blue/alpha channel data format with normalized value and non-linear sRGB encoding. Values are in the `[0.0, 1.0]` range. The format's precision is between 4 and 7 bits for the red/green/blue channels and between 0 and 8 bits for the alpha channel. Also known as BPTC LDR. */
            DATA_FORMAT_BC7_SRGB_BLOCK = 145,
            
            /** VRAM-compressed unsigned red/green/blue channel data format with normalized value. Values are in the `[0.0, 1.0]` range. Using ETC2 texture compression. */
            DATA_FORMAT_ETC2_R8G8B8_UNORM_BLOCK = 146,
            
            /** VRAM-compressed unsigned red/green/blue channel data format with normalized value and non-linear sRGB encoding. Values are in the `[0.0, 1.0]` range. Using ETC2 texture compression. */
            DATA_FORMAT_ETC2_R8G8B8_SRGB_BLOCK = 147,
            
            /** VRAM-compressed unsigned red/green/blue/alpha channel data format with normalized value. Values are in the `[0.0, 1.0]` range. Red/green/blue use 8 bit of precision each, with alpha using 1 bit of precision. Using ETC2 texture compression. */
            DATA_FORMAT_ETC2_R8G8B8A1_UNORM_BLOCK = 148,
            
            /** VRAM-compressed unsigned red/green/blue/alpha channel data format with normalized value and non-linear sRGB encoding. Values are in the `[0.0, 1.0]` range. Red/green/blue use 8 bit of precision each, with alpha using 1 bit of precision. Using ETC2 texture compression. */
            DATA_FORMAT_ETC2_R8G8B8A1_SRGB_BLOCK = 149,
            
            /** VRAM-compressed unsigned red/green/blue/alpha channel data format with normalized value. Values are in the `[0.0, 1.0]` range. Red/green/blue use 8 bits of precision each, with alpha using 8 bits of precision. Using ETC2 texture compression. */
            DATA_FORMAT_ETC2_R8G8B8A8_UNORM_BLOCK = 150,
            
            /** VRAM-compressed unsigned red/green/blue/alpha channel data format with normalized value and non-linear sRGB encoding. Values are in the `[0.0, 1.0]` range. Red/green/blue use 8 bits of precision each, with alpha using 8 bits of precision. Using ETC2 texture compression. */
            DATA_FORMAT_ETC2_R8G8B8A8_SRGB_BLOCK = 151,
            
            /** 11-bit VRAM-compressed unsigned red channel data format with normalized value. Values are in the `[0.0, 1.0]` range. Using ETC2 texture compression. */
            DATA_FORMAT_EAC_R11_UNORM_BLOCK = 152,
            
            /** 11-bit VRAM-compressed signed red channel data format with normalized value. Values are in the `[-1.0, 1.0]` range. Using ETC2 texture compression. */
            DATA_FORMAT_EAC_R11_SNORM_BLOCK = 153,
            
            /** 11-bit VRAM-compressed unsigned red/green channel data format with normalized value. Values are in the `[0.0, 1.0]` range. Using ETC2 texture compression. */
            DATA_FORMAT_EAC_R11G11_UNORM_BLOCK = 154,
            
            /** 11-bit VRAM-compressed signed red/green channel data format with normalized value. Values are in the `[-1.0, 1.0]` range. Using ETC2 texture compression. */
            DATA_FORMAT_EAC_R11G11_SNORM_BLOCK = 155,
            
            /** VRAM-compressed unsigned floating-point data format with normalized value, packed in 4×4 blocks (highest quality). Values are in the `[0.0, 1.0]` range. Using ASTC compression. */
            DATA_FORMAT_ASTC_4x4_UNORM_BLOCK = 156,
            
            /** VRAM-compressed unsigned floating-point data format with normalized value and non-linear sRGB encoding, packed in 4×4 blocks (highest quality). Values are in the `[0.0, 1.0]` range. Using ASTC compression. */
            DATA_FORMAT_ASTC_4x4_SRGB_BLOCK = 157,
            
            /** VRAM-compressed unsigned floating-point data format with normalized value, packed in 5×4 blocks. Values are in the `[0.0, 1.0]` range. Using ASTC compression. */
            DATA_FORMAT_ASTC_5x4_UNORM_BLOCK = 158,
            
            /** VRAM-compressed unsigned floating-point data format with normalized value and non-linear sRGB encoding, packed in 5×4 blocks. Values are in the `[0.0, 1.0]` range. Using ASTC compression. */
            DATA_FORMAT_ASTC_5x4_SRGB_BLOCK = 159,
            
            /** VRAM-compressed unsigned floating-point data format with normalized value, packed in 5×5 blocks. Values are in the `[0.0, 1.0]` range. Using ASTC compression. */
            DATA_FORMAT_ASTC_5x5_UNORM_BLOCK = 160,
            
            /** VRAM-compressed unsigned floating-point data format with normalized value and non-linear sRGB encoding, packed in 5×5 blocks. Values are in the `[0.0, 1.0]` range. Using ASTC compression. */
            DATA_FORMAT_ASTC_5x5_SRGB_BLOCK = 161,
            
            /** VRAM-compressed unsigned floating-point data format with normalized value, packed in 6×5 blocks. Values are in the `[0.0, 1.0]` range. Using ASTC compression. */
            DATA_FORMAT_ASTC_6x5_UNORM_BLOCK = 162,
            
            /** VRAM-compressed unsigned floating-point data format with normalized value and non-linear sRGB encoding, packed in 6×5 blocks. Values are in the `[0.0, 1.0]` range. Using ASTC compression. */
            DATA_FORMAT_ASTC_6x5_SRGB_BLOCK = 163,
            
            /** VRAM-compressed unsigned floating-point data format with normalized value, packed in 6×6 blocks. Values are in the `[0.0, 1.0]` range. Using ASTC compression. */
            DATA_FORMAT_ASTC_6x6_UNORM_BLOCK = 164,
            
            /** VRAM-compressed unsigned floating-point data format with normalized value and non-linear sRGB encoding, packed in 6×6 blocks. Values are in the `[0.0, 1.0]` range. Using ASTC compression. */
            DATA_FORMAT_ASTC_6x6_SRGB_BLOCK = 165,
            
            /** VRAM-compressed unsigned floating-point data format with normalized value, packed in 8×5 blocks. Values are in the `[0.0, 1.0]` range. Using ASTC compression. */
            DATA_FORMAT_ASTC_8x5_UNORM_BLOCK = 166,
            
            /** VRAM-compressed unsigned floating-point data format with normalized value and non-linear sRGB encoding, packed in 8×5 blocks. Values are in the `[0.0, 1.0]` range. Using ASTC compression. */
            DATA_FORMAT_ASTC_8x5_SRGB_BLOCK = 167,
            
            /** VRAM-compressed unsigned floating-point data format with normalized value, packed in 8×6 blocks. Values are in the `[0.0, 1.0]` range. Using ASTC compression. */
            DATA_FORMAT_ASTC_8x6_UNORM_BLOCK = 168,
            
            /** VRAM-compressed unsigned floating-point data format with normalized value and non-linear sRGB encoding, packed in 8×6 blocks. Values are in the `[0.0, 1.0]` range. Using ASTC compression. */
            DATA_FORMAT_ASTC_8x6_SRGB_BLOCK = 169,
            
            /** VRAM-compressed unsigned floating-point data format with normalized value, packed in 8×8 blocks. Values are in the `[0.0, 1.0]` range. Using ASTC compression. */
            DATA_FORMAT_ASTC_8x8_UNORM_BLOCK = 170,
            
            /** VRAM-compressed unsigned floating-point data format with normalized value and non-linear sRGB encoding, packed in 8×8 blocks. Values are in the `[0.0, 1.0]` range. Using ASTC compression. */
            DATA_FORMAT_ASTC_8x8_SRGB_BLOCK = 171,
            
            /** VRAM-compressed unsigned floating-point data format with normalized value, packed in 10×5 blocks. Values are in the `[0.0, 1.0]` range. Using ASTC compression. */
            DATA_FORMAT_ASTC_10x5_UNORM_BLOCK = 172,
            
            /** VRAM-compressed unsigned floating-point data format with normalized value and non-linear sRGB encoding, packed in 10×5 blocks. Values are in the `[0.0, 1.0]` range. Using ASTC compression. */
            DATA_FORMAT_ASTC_10x5_SRGB_BLOCK = 173,
            
            /** VRAM-compressed unsigned floating-point data format with normalized value, packed in 10×6 blocks. Values are in the `[0.0, 1.0]` range. Using ASTC compression. */
            DATA_FORMAT_ASTC_10x6_UNORM_BLOCK = 174,
            
            /** VRAM-compressed unsigned floating-point data format with normalized value and non-linear sRGB encoding, packed in 10×6 blocks. Values are in the `[0.0, 1.0]` range. Using ASTC compression. */
            DATA_FORMAT_ASTC_10x6_SRGB_BLOCK = 175,
            
            /** VRAM-compressed unsigned floating-point data format with normalized value, packed in 10×8 blocks. Values are in the `[0.0, 1.0]` range. Using ASTC compression. */
            DATA_FORMAT_ASTC_10x8_UNORM_BLOCK = 176,
            
            /** VRAM-compressed unsigned floating-point data format with normalized value and non-linear sRGB encoding, packed in 10×8 blocks. Values are in the `[0.0, 1.0]` range. Using ASTC compression. */
            DATA_FORMAT_ASTC_10x8_SRGB_BLOCK = 177,
            
            /** VRAM-compressed unsigned floating-point data format with normalized value, packed in 10×10 blocks. Values are in the `[0.0, 1.0]` range. Using ASTC compression. */
            DATA_FORMAT_ASTC_10x10_UNORM_BLOCK = 178,
            
            /** VRAM-compressed unsigned floating-point data format with normalized value and non-linear sRGB encoding, packed in 10×10 blocks. Values are in the `[0.0, 1.0]` range. Using ASTC compression. */
            DATA_FORMAT_ASTC_10x10_SRGB_BLOCK = 179,
            
            /** VRAM-compressed unsigned floating-point data format with normalized value, packed in 12×10 blocks. Values are in the `[0.0, 1.0]` range. Using ASTC compression. */
            DATA_FORMAT_ASTC_12x10_UNORM_BLOCK = 180,
            
            /** VRAM-compressed unsigned floating-point data format with normalized value and non-linear sRGB encoding, packed in 12×10 blocks. Values are in the `[0.0, 1.0]` range. Using ASTC compression. */
            DATA_FORMAT_ASTC_12x10_SRGB_BLOCK = 181,
            
            /** VRAM-compressed unsigned floating-point data format with normalized value, packed in 12 blocks (lowest quality). Values are in the `[0.0, 1.0]` range. Using ASTC compression. */
            DATA_FORMAT_ASTC_12x12_UNORM_BLOCK = 182,
            
            /** VRAM-compressed unsigned floating-point data format with normalized value and non-linear sRGB encoding, packed in 12 blocks (lowest quality). Values are in the `[0.0, 1.0]` range. Using ASTC compression. */
            DATA_FORMAT_ASTC_12x12_SRGB_BLOCK = 183,
            
            /** 8-bit-per-channel unsigned floating-point green/blue/red channel data format with normalized value. Values are in the `[0.0, 1.0]` range. Blue and red channel data is stored at halved horizontal resolution (i.e. 2 horizontally adjacent pixels will share the same value for the blue/red channel). */
            DATA_FORMAT_G8B8G8R8_422_UNORM = 184,
            
            /** 8-bit-per-channel unsigned floating-point blue/green/red channel data format with normalized value. Values are in the `[0.0, 1.0]` range. Blue and red channel data is stored at halved horizontal resolution (i.e. 2 horizontally adjacent pixels will share the same value for the blue/red channel). */
            DATA_FORMAT_B8G8R8G8_422_UNORM = 185,
            
            /** 8-bit-per-channel unsigned floating-point green/blue/red channel data with normalized value, stored across 3 separate planes (green + blue + red). Values are in the `[0.0, 1.0]` range. Blue and red channel data is stored at halved horizontal and vertical resolution (i.e. 2×2 adjacent pixels will share the same value for the blue/red channel). */
            DATA_FORMAT_G8_B8_R8_3PLANE_420_UNORM = 186,
            
            /** 8-bit-per-channel unsigned floating-point green/blue/red channel data with normalized value, stored across 2 separate planes (green + blue/red). Values are in the `[0.0, 1.0]` range. Blue and red channel data is stored at halved horizontal and vertical resolution (i.e. 2×2 adjacent pixels will share the same value for the blue/red channel). */
            DATA_FORMAT_G8_B8R8_2PLANE_420_UNORM = 187,
            
            /** 8-bit-per-channel unsigned floating-point green/blue/red channel data with normalized value, stored across 2 separate planes (green + blue + red). Values are in the `[0.0, 1.0]` range. Blue and red channel data is stored at halved horizontal resolution (i.e. 2 horizontally adjacent pixels will share the same value for the blue/red channel). */
            DATA_FORMAT_G8_B8_R8_3PLANE_422_UNORM = 188,
            
            /** 8-bit-per-channel unsigned floating-point green/blue/red channel data with normalized value, stored across 2 separate planes (green + blue/red). Values are in the `[0.0, 1.0]` range. Blue and red channel data is stored at halved horizontal resolution (i.e. 2 horizontally adjacent pixels will share the same value for the blue/red channel). */
            DATA_FORMAT_G8_B8R8_2PLANE_422_UNORM = 189,
            
            /** 8-bit-per-channel unsigned floating-point green/blue/red channel data with normalized value, stored across 3 separate planes. Values are in the `[0.0, 1.0]` range. */
            DATA_FORMAT_G8_B8_R8_3PLANE_444_UNORM = 190,
            
            /** 10-bit-per-channel unsigned floating-point red channel data with normalized value, plus 6 unused bits, packed in 16 bits. Values are in the `[0.0, 1.0]` range. */
            DATA_FORMAT_R10X6_UNORM_PACK16 = 191,
            
            /** 10-bit-per-channel unsigned floating-point red/green channel data with normalized value, plus 6 unused bits after each channel, packed in 2×16 bits. Values are in the `[0.0, 1.0]` range. */
            DATA_FORMAT_R10X6G10X6_UNORM_2PACK16 = 192,
            
            /** 10-bit-per-channel unsigned floating-point red/green/blue/alpha channel data with normalized value, plus 6 unused bits after each channel, packed in 4×16 bits. Values are in the `[0.0, 1.0]` range. */
            DATA_FORMAT_R10X6G10X6B10X6A10X6_UNORM_4PACK16 = 193,
            
            /** 10-bit-per-channel unsigned floating-point green/blue/green/red channel data with normalized value, plus 6 unused bits after each channel, packed in 4×16 bits. Values are in the `[0.0, 1.0]` range. Blue and red channel data is stored at halved horizontal resolution (i.e. 2 horizontally adjacent pixels will share the same value for the blue/red channel). The green channel is listed twice, but contains different values to allow it to be represented at full resolution. */
            DATA_FORMAT_G10X6B10X6G10X6R10X6_422_UNORM_4PACK16 = 194,
            
            /** 10-bit-per-channel unsigned floating-point blue/green/red/green channel data with normalized value, plus 6 unused bits after each channel, packed in 4×16 bits. Values are in the `[0.0, 1.0]` range. Blue and red channel data is stored at halved horizontal resolution (i.e. 2 horizontally adjacent pixels will share the same value for the blue/red channel). The green channel is listed twice, but contains different values to allow it to be represented at full resolution. */
            DATA_FORMAT_B10X6G10X6R10X6G10X6_422_UNORM_4PACK16 = 195,
            
            /** 10-bit-per-channel unsigned floating-point green/blue/red channel data with normalized value, plus 6 unused bits after each channel. Packed in 3×16 bits and stored across 2 separate planes (green + blue + red). Values are in the `[0.0, 1.0]` range. Blue and red channel data is stored at halved horizontal and vertical resolution (i.e. 2×2 adjacent pixels will share the same value for the blue/red channel). */
            DATA_FORMAT_G10X6_B10X6_R10X6_3PLANE_420_UNORM_3PACK16 = 196,
            
            /** 10-bit-per-channel unsigned floating-point green/blue/red channel data with normalized value, plus 6 unused bits after each channel. Packed in 3×16 bits and stored across 2 separate planes (green + blue/red). Values are in the `[0.0, 1.0]` range. Blue and red channel data is stored at halved horizontal and vertical resolution (i.e. 2×2 adjacent pixels will share the same value for the blue/red channel). */
            DATA_FORMAT_G10X6_B10X6R10X6_2PLANE_420_UNORM_3PACK16 = 197,
            
            /** 10-bit-per-channel unsigned floating-point green/blue/red channel data with normalized value, plus 6 unused bits after each channel. Packed in 3×16 bits and stored across 3 separate planes (green + blue + red). Values are in the `[0.0, 1.0]` range. Blue and red channel data is stored at halved horizontal resolution (i.e. 2 horizontally adjacent pixels will share the same value for the blue/red channel). */
            DATA_FORMAT_G10X6_B10X6_R10X6_3PLANE_422_UNORM_3PACK16 = 198,
            
            /** 10-bit-per-channel unsigned floating-point green/blue/red channel data with normalized value, plus 6 unused bits after each channel. Packed in 3×16 bits and stored across 3 separate planes (green + blue/red). Values are in the `[0.0, 1.0]` range. Blue and red channel data is stored at halved horizontal resolution (i.e. 2 horizontally adjacent pixels will share the same value for the blue/red channel). */
            DATA_FORMAT_G10X6_B10X6R10X6_2PLANE_422_UNORM_3PACK16 = 199,
            
            /** 10-bit-per-channel unsigned floating-point green/blue/red channel data with normalized value, plus 6 unused bits after each channel. Packed in 3×16 bits and stored across 3 separate planes (green + blue + red). Values are in the `[0.0, 1.0]` range. */
            DATA_FORMAT_G10X6_B10X6_R10X6_3PLANE_444_UNORM_3PACK16 = 200,
            
            /** 12-bit-per-channel unsigned floating-point red channel data with normalized value, plus 6 unused bits, packed in 16 bits. Values are in the `[0.0, 1.0]` range. */
            DATA_FORMAT_R12X4_UNORM_PACK16 = 201,
            
            /** 12-bit-per-channel unsigned floating-point red/green channel data with normalized value, plus 6 unused bits after each channel, packed in 2×16 bits. Values are in the `[0.0, 1.0]` range. */
            DATA_FORMAT_R12X4G12X4_UNORM_2PACK16 = 202,
            
            /** 12-bit-per-channel unsigned floating-point red/green/blue/alpha channel data with normalized value, plus 6 unused bits after each channel, packed in 4×16 bits. Values are in the `[0.0, 1.0]` range. */
            DATA_FORMAT_R12X4G12X4B12X4A12X4_UNORM_4PACK16 = 203,
            
            /** 12-bit-per-channel unsigned floating-point green/blue/green/red channel data with normalized value, plus 6 unused bits after each channel, packed in 4×16 bits. Values are in the `[0.0, 1.0]` range. Blue and red channel data is stored at halved horizontal resolution (i.e. 2 horizontally adjacent pixels will share the same value for the blue/red channel). The green channel is listed twice, but contains different values to allow it to be represented at full resolution. */
            DATA_FORMAT_G12X4B12X4G12X4R12X4_422_UNORM_4PACK16 = 204,
            
            /** 12-bit-per-channel unsigned floating-point blue/green/red/green channel data with normalized value, plus 6 unused bits after each channel, packed in 4×16 bits. Values are in the `[0.0, 1.0]` range. Blue and red channel data is stored at halved horizontal resolution (i.e. 2 horizontally adjacent pixels will share the same value for the blue/red channel). The green channel is listed twice, but contains different values to allow it to be represented at full resolution. */
            DATA_FORMAT_B12X4G12X4R12X4G12X4_422_UNORM_4PACK16 = 205,
            
            /** 12-bit-per-channel unsigned floating-point green/blue/red channel data with normalized value, plus 6 unused bits after each channel. Packed in 3×16 bits and stored across 2 separate planes (green + blue + red). Values are in the `[0.0, 1.0]` range. Blue and red channel data is stored at halved horizontal and vertical resolution (i.e. 2×2 adjacent pixels will share the same value for the blue/red channel). */
            DATA_FORMAT_G12X4_B12X4_R12X4_3PLANE_420_UNORM_3PACK16 = 206,
            
            /** 12-bit-per-channel unsigned floating-point green/blue/red channel data with normalized value, plus 6 unused bits after each channel. Packed in 3×16 bits and stored across 2 separate planes (green + blue/red). Values are in the `[0.0, 1.0]` range. Blue and red channel data is stored at halved horizontal and vertical resolution (i.e. 2×2 adjacent pixels will share the same value for the blue/red channel). */
            DATA_FORMAT_G12X4_B12X4R12X4_2PLANE_420_UNORM_3PACK16 = 207,
            
            /** 12-bit-per-channel unsigned floating-point green/blue/red channel data with normalized value, plus 6 unused bits after each channel. Packed in 3×16 bits and stored across 3 separate planes (green + blue + red). Values are in the `[0.0, 1.0]` range. Blue and red channel data is stored at halved horizontal resolution (i.e. 2 horizontally adjacent pixels will share the same value for the blue/red channel). */
            DATA_FORMAT_G12X4_B12X4_R12X4_3PLANE_422_UNORM_3PACK16 = 208,
            
            /** 12-bit-per-channel unsigned floating-point green/blue/red channel data with normalized value, plus 6 unused bits after each channel. Packed in 3×16 bits and stored across 3 separate planes (green + blue/red). Values are in the `[0.0, 1.0]` range. Blue and red channel data is stored at halved horizontal resolution (i.e. 2 horizontally adjacent pixels will share the same value for the blue/red channel). */
            DATA_FORMAT_G12X4_B12X4R12X4_2PLANE_422_UNORM_3PACK16 = 209,
            
            /** 12-bit-per-channel unsigned floating-point green/blue/red channel data with normalized value, plus 6 unused bits after each channel. Packed in 3×16 bits and stored across 3 separate planes (green + blue + red). Values are in the `[0.0, 1.0]` range. */
            DATA_FORMAT_G12X4_B12X4_R12X4_3PLANE_444_UNORM_3PACK16 = 210,
            
            /** 16-bit-per-channel unsigned floating-point green/blue/red channel data format with normalized value. Values are in the `[0.0, 1.0]` range. Blue and red channel data is stored at halved horizontal resolution (i.e. 2 horizontally adjacent pixels will share the same value for the blue/red channel). */
            DATA_FORMAT_G16B16G16R16_422_UNORM = 211,
            
            /** 16-bit-per-channel unsigned floating-point blue/green/red channel data format with normalized value. Values are in the `[0.0, 1.0]` range. Blue and red channel data is stored at halved horizontal resolution (i.e. 2 horizontally adjacent pixels will share the same value for the blue/red channel). */
            DATA_FORMAT_B16G16R16G16_422_UNORM = 212,
            
            /** 16-bit-per-channel unsigned floating-point green/blue/red channel data with normalized value, plus 6 unused bits after each channel. Stored across 2 separate planes (green + blue + red). Values are in the `[0.0, 1.0]` range. Blue and red channel data is stored at halved horizontal and vertical resolution (i.e. 2×2 adjacent pixels will share the same value for the blue/red channel). */
            DATA_FORMAT_G16_B16_R16_3PLANE_420_UNORM = 213,
            
            /** 16-bit-per-channel unsigned floating-point green/blue/red channel data with normalized value, plus 6 unused bits after each channel. Stored across 2 separate planes (green + blue/red). Values are in the `[0.0, 1.0]` range. Blue and red channel data is stored at halved horizontal and vertical resolution (i.e. 2×2 adjacent pixels will share the same value for the blue/red channel). */
            DATA_FORMAT_G16_B16R16_2PLANE_420_UNORM = 214,
            
            /** 16-bit-per-channel unsigned floating-point green/blue/red channel data with normalized value, plus 6 unused bits after each channel. Stored across 3 separate planes (green + blue + red). Values are in the `[0.0, 1.0]` range. Blue and red channel data is stored at halved horizontal resolution (i.e. 2 horizontally adjacent pixels will share the same value for the blue/red channel). */
            DATA_FORMAT_G16_B16_R16_3PLANE_422_UNORM = 215,
            
            /** 16-bit-per-channel unsigned floating-point green/blue/red channel data with normalized value, plus 6 unused bits after each channel. Stored across 3 separate planes (green + blue/red). Values are in the `[0.0, 1.0]` range. Blue and red channel data is stored at halved horizontal resolution (i.e. 2 horizontally adjacent pixels will share the same value for the blue/red channel). */
            DATA_FORMAT_G16_B16R16_2PLANE_422_UNORM = 216,
            
            /** 16-bit-per-channel unsigned floating-point green/blue/red channel data with normalized value, plus 6 unused bits after each channel. Stored across 3 separate planes (green + blue + red). Values are in the `[0.0, 1.0]` range. */
            DATA_FORMAT_G16_B16_R16_3PLANE_444_UNORM = 217,
            DATA_FORMAT_ASTC_4x4_SFLOAT_BLOCK = 218,
            DATA_FORMAT_ASTC_5x4_SFLOAT_BLOCK = 219,
            DATA_FORMAT_ASTC_5x5_SFLOAT_BLOCK = 220,
            DATA_FORMAT_ASTC_6x5_SFLOAT_BLOCK = 221,
            DATA_FORMAT_ASTC_6x6_SFLOAT_BLOCK = 222,
            DATA_FORMAT_ASTC_8x5_SFLOAT_BLOCK = 223,
            DATA_FORMAT_ASTC_8x6_SFLOAT_BLOCK = 224,
            DATA_FORMAT_ASTC_8x8_SFLOAT_BLOCK = 225,
            DATA_FORMAT_ASTC_10x5_SFLOAT_BLOCK = 226,
            DATA_FORMAT_ASTC_10x6_SFLOAT_BLOCK = 227,
            DATA_FORMAT_ASTC_10x8_SFLOAT_BLOCK = 228,
            DATA_FORMAT_ASTC_10x10_SFLOAT_BLOCK = 229,
            DATA_FORMAT_ASTC_12x10_SFLOAT_BLOCK = 230,
            DATA_FORMAT_ASTC_12x12_SFLOAT_BLOCK = 231,
            
            /** Represents the size of the [enum DataFormat] enum. */
            DATA_FORMAT_MAX = 232,
        }
        enum BarrierMask {
            /** Vertex shader barrier mask. */
            BARRIER_MASK_VERTEX = 1,
            
            /** Fragment shader barrier mask. */
            BARRIER_MASK_FRAGMENT = 8,
            
            /** Compute barrier mask. */
            BARRIER_MASK_COMPUTE = 2,
            
            /** Transfer barrier mask. */
            BARRIER_MASK_TRANSFER = 4,
            
            /** Raster barrier mask (vertex and fragment). Equivalent to `BARRIER_MASK_VERTEX | BARRIER_MASK_FRAGMENT`. */
            BARRIER_MASK_RASTER = 9,
            
            /** Barrier mask for all types (vertex, fragment, compute, transfer). */
            BARRIER_MASK_ALL_BARRIERS = 32767,
            
            /** No barrier for any type. */
            BARRIER_MASK_NO_BARRIER = 32768,
        }
        enum TextureType {
            /** 1-dimensional texture. */
            TEXTURE_TYPE_1D = 0,
            
            /** 2-dimensional texture. */
            TEXTURE_TYPE_2D = 1,
            
            /** 3-dimensional texture. */
            TEXTURE_TYPE_3D = 2,
            
            /** [Cubemap] texture. */
            TEXTURE_TYPE_CUBE = 3,
            
            /** Array of 1-dimensional textures. */
            TEXTURE_TYPE_1D_ARRAY = 4,
            
            /** Array of 2-dimensional textures. */
            TEXTURE_TYPE_2D_ARRAY = 5,
            
            /** Array of [Cubemap] textures. */
            TEXTURE_TYPE_CUBE_ARRAY = 6,
            
            /** Represents the size of the [enum TextureType] enum. */
            TEXTURE_TYPE_MAX = 7,
        }
        enum TextureSamples {
            /** Perform 1 texture sample (this is the fastest but lowest-quality for antialiasing). */
            TEXTURE_SAMPLES_1 = 0,
            
            /** Perform 2 texture samples. */
            TEXTURE_SAMPLES_2 = 1,
            
            /** Perform 4 texture samples. */
            TEXTURE_SAMPLES_4 = 2,
            
            /** Perform 8 texture samples. Not supported on mobile GPUs (including Apple Silicon). */
            TEXTURE_SAMPLES_8 = 3,
            
            /** Perform 16 texture samples. Not supported on mobile GPUs and many desktop GPUs. */
            TEXTURE_SAMPLES_16 = 4,
            
            /** Perform 32 texture samples. Not supported on most GPUs. */
            TEXTURE_SAMPLES_32 = 5,
            
            /** Perform 64 texture samples (this is the slowest but highest-quality for antialiasing). Not supported on most GPUs. */
            TEXTURE_SAMPLES_64 = 6,
            
            /** Represents the size of the [enum TextureSamples] enum. */
            TEXTURE_SAMPLES_MAX = 7,
        }
        enum TextureUsageBits {
            /** Texture can be sampled. */
            TEXTURE_USAGE_SAMPLING_BIT = 1,
            
            /** Texture can be used as a color attachment in a framebuffer. */
            TEXTURE_USAGE_COLOR_ATTACHMENT_BIT = 2,
            
            /** Texture can be used as a depth/stencil attachment in a framebuffer. */
            TEXTURE_USAGE_DEPTH_STENCIL_ATTACHMENT_BIT = 4,
            
            /** Texture can be used as a [url=https://registry.khronos.org/vulkan/specs/1.3-extensions/html/vkspec.html#descriptorsets-storageimage]storage image[/url]. */
            TEXTURE_USAGE_STORAGE_BIT = 8,
            
            /** Texture can be used as a [url=https://registry.khronos.org/vulkan/specs/1.3-extensions/html/vkspec.html#descriptorsets-storageimage]storage image[/url] with support for atomic operations. */
            TEXTURE_USAGE_STORAGE_ATOMIC_BIT = 16,
            
            /** Texture can be read back on the CPU using [method texture_get_data] faster than without this bit, since it is always kept in the system memory. */
            TEXTURE_USAGE_CPU_READ_BIT = 32,
            
            /** Texture can be updated using [method texture_update]. */
            TEXTURE_USAGE_CAN_UPDATE_BIT = 64,
            
            /** Texture can be a source for [method texture_copy]. */
            TEXTURE_USAGE_CAN_COPY_FROM_BIT = 128,
            
            /** Texture can be a destination for [method texture_copy]. */
            TEXTURE_USAGE_CAN_COPY_TO_BIT = 256,
            
            /** Texture can be used as a [url=https://registry.khronos.org/vulkan/specs/1.3-extensions/html/vkspec.html#descriptorsets-inputattachment]input attachment[/url] in a framebuffer. */
            TEXTURE_USAGE_INPUT_ATTACHMENT_BIT = 512,
        }
        enum TextureSwizzle {
            /** Return the sampled value as-is. */
            TEXTURE_SWIZZLE_IDENTITY = 0,
            
            /** Always return `0.0` when sampling. */
            TEXTURE_SWIZZLE_ZERO = 1,
            
            /** Always return `1.0` when sampling. */
            TEXTURE_SWIZZLE_ONE = 2,
            
            /** Sample the red color channel. */
            TEXTURE_SWIZZLE_R = 3,
            
            /** Sample the green color channel. */
            TEXTURE_SWIZZLE_G = 4,
            
            /** Sample the blue color channel. */
            TEXTURE_SWIZZLE_B = 5,
            
            /** Sample the alpha channel. */
            TEXTURE_SWIZZLE_A = 6,
            
            /** Represents the size of the [enum TextureSwizzle] enum. */
            TEXTURE_SWIZZLE_MAX = 7,
        }
        enum TextureSliceType {
            /** 2-dimensional texture slice. */
            TEXTURE_SLICE_2D = 0,
            
            /** Cubemap texture slice. */
            TEXTURE_SLICE_CUBEMAP = 1,
            
            /** 3-dimensional texture slice. */
            TEXTURE_SLICE_3D = 2,
        }
        enum SamplerFilter {
            /** Nearest-neighbor sampler filtering. Sampling at higher resolutions than the source will result in a pixelated look. */
            SAMPLER_FILTER_NEAREST = 0,
            
            /** Bilinear sampler filtering. Sampling at higher resolutions than the source will result in a blurry look. */
            SAMPLER_FILTER_LINEAR = 1,
        }
        enum SamplerRepeatMode {
            /** Sample with repeating enabled. */
            SAMPLER_REPEAT_MODE_REPEAT = 0,
            
            /** Sample with mirrored repeating enabled. When sampling outside the `[0.0, 1.0]` range, return a mirrored version of the sampler. This mirrored version is mirrored again if sampling further away, with the pattern repeating indefinitely. */
            SAMPLER_REPEAT_MODE_MIRRORED_REPEAT = 1,
            
            /** Sample with repeating disabled. When sampling outside the `[0.0, 1.0]` range, return the color of the last pixel on the edge. */
            SAMPLER_REPEAT_MODE_CLAMP_TO_EDGE = 2,
            
            /** Sample with repeating disabled. When sampling outside the `[0.0, 1.0]` range, return the specified [member RDSamplerState.border_color]. */
            SAMPLER_REPEAT_MODE_CLAMP_TO_BORDER = 3,
            
            /** Sample with mirrored repeating enabled, but only once. When sampling in the `[-1.0, 0.0]` range, return a mirrored version of the sampler. When sampling outside the `[-1.0, 1.0]` range, return the color of the last pixel on the edge. */
            SAMPLER_REPEAT_MODE_MIRROR_CLAMP_TO_EDGE = 4,
            
            /** Represents the size of the [enum SamplerRepeatMode] enum. */
            SAMPLER_REPEAT_MODE_MAX = 5,
        }
        enum SamplerBorderColor {
            /** Return a floating-point transparent black color when sampling outside the `[0.0, 1.0]` range. Only effective if the sampler repeat mode is [constant SAMPLER_REPEAT_MODE_CLAMP_TO_BORDER]. */
            SAMPLER_BORDER_COLOR_FLOAT_TRANSPARENT_BLACK = 0,
            
            /** Return an integer transparent black color when sampling outside the `[0.0, 1.0]` range. Only effective if the sampler repeat mode is [constant SAMPLER_REPEAT_MODE_CLAMP_TO_BORDER]. */
            SAMPLER_BORDER_COLOR_INT_TRANSPARENT_BLACK = 1,
            
            /** Return a floating-point opaque black color when sampling outside the `[0.0, 1.0]` range. Only effective if the sampler repeat mode is [constant SAMPLER_REPEAT_MODE_CLAMP_TO_BORDER]. */
            SAMPLER_BORDER_COLOR_FLOAT_OPAQUE_BLACK = 2,
            
            /** Return an integer opaque black color when sampling outside the `[0.0, 1.0]` range. Only effective if the sampler repeat mode is [constant SAMPLER_REPEAT_MODE_CLAMP_TO_BORDER]. */
            SAMPLER_BORDER_COLOR_INT_OPAQUE_BLACK = 3,
            
            /** Return a floating-point opaque white color when sampling outside the `[0.0, 1.0]` range. Only effective if the sampler repeat mode is [constant SAMPLER_REPEAT_MODE_CLAMP_TO_BORDER]. */
            SAMPLER_BORDER_COLOR_FLOAT_OPAQUE_WHITE = 4,
            
            /** Return an integer opaque white color when sampling outside the `[0.0, 1.0]` range. Only effective if the sampler repeat mode is [constant SAMPLER_REPEAT_MODE_CLAMP_TO_BORDER]. */
            SAMPLER_BORDER_COLOR_INT_OPAQUE_WHITE = 5,
            
            /** Represents the size of the [enum SamplerBorderColor] enum. */
            SAMPLER_BORDER_COLOR_MAX = 6,
        }
        enum VertexFrequency {
            /** Vertex attribute addressing is a function of the vertex. This is used to specify the rate at which vertex attributes are pulled from buffers. */
            VERTEX_FREQUENCY_VERTEX = 0,
            
            /** Vertex attribute addressing is a function of the instance index. This is used to specify the rate at which vertex attributes are pulled from buffers. */
            VERTEX_FREQUENCY_INSTANCE = 1,
        }
        enum IndexBufferFormat {
            /** Index buffer in 16-bit unsigned integer format. This limits the maximum index that can be specified to `65535`. */
            INDEX_BUFFER_FORMAT_UINT16 = 0,
            
            /** Index buffer in 32-bit unsigned integer format. This limits the maximum index that can be specified to `4294967295`. */
            INDEX_BUFFER_FORMAT_UINT32 = 1,
        }
        enum StorageBufferUsage {
            STORAGE_BUFFER_USAGE_DISPATCH_INDIRECT = 1,
        }
        enum BufferCreationBits {
            /** Optionally, set this flag if you wish to use [method buffer_get_device_address] functionality. You must first check the GPU supports it:  
             *    
             */
            BUFFER_CREATION_DEVICE_ADDRESS_BIT = 1,
            
            /** Set this flag so that it is created as storage. This is useful if Compute Shaders need access (for reading or writing) to the buffer, e.g. skeletal animations are processed in Compute Shaders which need access to vertex buffers, to be later consumed by vertex shaders as part of the regular rasterization pipeline. */
            BUFFER_CREATION_AS_STORAGE_BIT = 2,
        }
        enum UniformType {
            /** Sampler uniform. */
            UNIFORM_TYPE_SAMPLER = 0,
            
            /** Sampler uniform with a texture. */
            UNIFORM_TYPE_SAMPLER_WITH_TEXTURE = 1,
            
            /** Texture uniform. */
            UNIFORM_TYPE_TEXTURE = 2,
            
            /** Image uniform. */
            UNIFORM_TYPE_IMAGE = 3,
            
            /** Texture buffer uniform. */
            UNIFORM_TYPE_TEXTURE_BUFFER = 4,
            
            /** Sampler uniform with a texture buffer. */
            UNIFORM_TYPE_SAMPLER_WITH_TEXTURE_BUFFER = 5,
            
            /** Image buffer uniform. */
            UNIFORM_TYPE_IMAGE_BUFFER = 6,
            
            /** Uniform buffer uniform. */
            UNIFORM_TYPE_UNIFORM_BUFFER = 7,
            
            /** [url=https://vkguide.dev/docs/chapter-4/storage_buffers/]Storage buffer[/url] uniform. */
            UNIFORM_TYPE_STORAGE_BUFFER = 8,
            
            /** Input attachment uniform. */
            UNIFORM_TYPE_INPUT_ATTACHMENT = 9,
            
            /** Represents the size of the [enum UniformType] enum. */
            UNIFORM_TYPE_MAX = 10,
        }
        enum RenderPrimitive {
            /** Point rendering primitive (with constant size, regardless of distance from camera). */
            RENDER_PRIMITIVE_POINTS = 0,
            
            /** Line list rendering primitive. Lines are drawn separated from each other. */
            RENDER_PRIMITIVE_LINES = 1,
            
            /** [url=https://registry.khronos.org/vulkan/specs/1.3-extensions/html/vkspec.html#drawing-line-lists-with-adjacency]Line list rendering primitive with adjacency.[/url]  
             *      
             *  **Note:** Adjacency is only useful with geometry shaders, which Godot does not expose.  
             */
            RENDER_PRIMITIVE_LINES_WITH_ADJACENCY = 2,
            
            /** Line strip rendering primitive. Lines drawn are connected to the previous vertex. */
            RENDER_PRIMITIVE_LINESTRIPS = 3,
            
            /** [url=https://registry.khronos.org/vulkan/specs/1.3-extensions/html/vkspec.html#drawing-line-strips-with-adjacency]Line strip rendering primitive with adjacency.[/url]  
             *      
             *  **Note:** Adjacency is only useful with geometry shaders, which Godot does not expose.  
             */
            RENDER_PRIMITIVE_LINESTRIPS_WITH_ADJACENCY = 4,
            
            /** Triangle list rendering primitive. Triangles are drawn separated from each other. */
            RENDER_PRIMITIVE_TRIANGLES = 5,
            
            /** [url=https://registry.khronos.org/vulkan/specs/1.3-extensions/html/vkspec.html#drawing-triangle-lists-with-adjacency]Triangle list rendering primitive with adjacency.[/url]  
             *      
             *  **Note:** Adjacency is only useful with geometry shaders, which Godot does not expose.  
             */
            RENDER_PRIMITIVE_TRIANGLES_WITH_ADJACENCY = 6,
            
            /** Triangle strip rendering primitive. Triangles drawn are connected to the previous triangle. */
            RENDER_PRIMITIVE_TRIANGLE_STRIPS = 7,
            
            /** [url=https://registry.khronos.org/vulkan/specs/1.3-extensions/html/vkspec.html#drawing-triangle-strips-with-adjacency]Triangle strip rendering primitive with adjacency.[/url]  
             *      
             *  **Note:** Adjacency is only useful with geometry shaders, which Godot does not expose.  
             */
            RENDER_PRIMITIVE_TRIANGLE_STRIPS_WITH_AJACENCY = 8,
            
            /** Triangle strip rendering primitive with  *primitive restart*  enabled. Triangles drawn are connected to the previous triangle, but a primitive restart index can be specified before drawing to create a second triangle strip after the specified index.  
             *      
             *  **Note:** Only compatible with indexed draws.  
             */
            RENDER_PRIMITIVE_TRIANGLE_STRIPS_WITH_RESTART_INDEX = 9,
            
            /** Tessellation patch rendering primitive. Only useful with tessellation shaders, which can be used to deform these patches. */
            RENDER_PRIMITIVE_TESSELATION_PATCH = 10,
            
            /** Represents the size of the [enum RenderPrimitive] enum. */
            RENDER_PRIMITIVE_MAX = 11,
        }
        enum PolygonCullMode {
            /** Do not use polygon front face or backface culling. */
            POLYGON_CULL_DISABLED = 0,
            
            /** Use polygon frontface culling (faces pointing towards the camera are hidden). */
            POLYGON_CULL_FRONT = 1,
            
            /** Use polygon backface culling (faces pointing away from the camera are hidden). */
            POLYGON_CULL_BACK = 2,
        }
        enum PolygonFrontFace {
            /** Clockwise winding order to determine which face of a polygon is its front face. */
            POLYGON_FRONT_FACE_CLOCKWISE = 0,
            
            /** Counter-clockwise winding order to determine which face of a polygon is its front face. */
            POLYGON_FRONT_FACE_COUNTER_CLOCKWISE = 1,
        }
        enum StencilOperation {
            /** Keep the current stencil value. */
            STENCIL_OP_KEEP = 0,
            
            /** Set the stencil value to `0`. */
            STENCIL_OP_ZERO = 1,
            
            /** Replace the existing stencil value with the new one. */
            STENCIL_OP_REPLACE = 2,
            
            /** Increment the existing stencil value and clamp to the maximum representable unsigned value if reached. Stencil bits are considered as an unsigned integer. */
            STENCIL_OP_INCREMENT_AND_CLAMP = 3,
            
            /** Decrement the existing stencil value and clamp to the minimum value if reached. Stencil bits are considered as an unsigned integer. */
            STENCIL_OP_DECREMENT_AND_CLAMP = 4,
            
            /** Bitwise-invert the existing stencil value. */
            STENCIL_OP_INVERT = 5,
            
            /** Increment the stencil value and wrap around to `0` if reaching the maximum representable unsigned. Stencil bits are considered as an unsigned integer. */
            STENCIL_OP_INCREMENT_AND_WRAP = 6,
            
            /** Decrement the stencil value and wrap around to the maximum representable unsigned if reaching the minimum. Stencil bits are considered as an unsigned integer. */
            STENCIL_OP_DECREMENT_AND_WRAP = 7,
            
            /** Represents the size of the [enum StencilOperation] enum. */
            STENCIL_OP_MAX = 8,
        }
        enum CompareOperator {
            /** "Never" comparison (opposite of [constant COMPARE_OP_ALWAYS]). */
            COMPARE_OP_NEVER = 0,
            
            /** "Less than" comparison. */
            COMPARE_OP_LESS = 1,
            
            /** "Equal" comparison. */
            COMPARE_OP_EQUAL = 2,
            
            /** "Less than or equal" comparison. */
            COMPARE_OP_LESS_OR_EQUAL = 3,
            
            /** "Greater than" comparison. */
            COMPARE_OP_GREATER = 4,
            
            /** "Not equal" comparison. */
            COMPARE_OP_NOT_EQUAL = 5,
            
            /** "Greater than or equal" comparison. */
            COMPARE_OP_GREATER_OR_EQUAL = 6,
            
            /** "Always" comparison (opposite of [constant COMPARE_OP_NEVER]). */
            COMPARE_OP_ALWAYS = 7,
            
            /** Represents the size of the [enum CompareOperator] enum. */
            COMPARE_OP_MAX = 8,
        }
        enum LogicOperation {
            /** Clear logic operation (result is always `0`). See also [constant LOGIC_OP_SET]. */
            LOGIC_OP_CLEAR = 0,
            
            /** AND logic operation. */
            LOGIC_OP_AND = 1,
            
            /** AND logic operation with the  *destination*  operand being inverted. See also [constant LOGIC_OP_AND_INVERTED]. */
            LOGIC_OP_AND_REVERSE = 2,
            
            /** Copy logic operation (keeps the  *source*  value as-is). See also [constant LOGIC_OP_COPY_INVERTED] and [constant LOGIC_OP_NO_OP]. */
            LOGIC_OP_COPY = 3,
            
            /** AND logic operation with the  *source*  operand being inverted. See also [constant LOGIC_OP_AND_REVERSE]. */
            LOGIC_OP_AND_INVERTED = 4,
            
            /** No-op logic operation (keeps the  *destination*  value as-is). See also [constant LOGIC_OP_COPY]. */
            LOGIC_OP_NO_OP = 5,
            
            /** Exclusive or (XOR) logic operation. */
            LOGIC_OP_XOR = 6,
            
            /** OR logic operation. */
            LOGIC_OP_OR = 7,
            
            /** Not-OR (NOR) logic operation. */
            LOGIC_OP_NOR = 8,
            
            /** Not-XOR (XNOR) logic operation. */
            LOGIC_OP_EQUIVALENT = 9,
            
            /** Invert logic operation. */
            LOGIC_OP_INVERT = 10,
            
            /** OR logic operation with the  *destination*  operand being inverted. See also [constant LOGIC_OP_OR_REVERSE]. */
            LOGIC_OP_OR_REVERSE = 11,
            
            /** NOT logic operation (inverts the value). See also [constant LOGIC_OP_COPY]. */
            LOGIC_OP_COPY_INVERTED = 12,
            
            /** OR logic operation with the  *source*  operand being inverted. See also [constant LOGIC_OP_OR_REVERSE]. */
            LOGIC_OP_OR_INVERTED = 13,
            
            /** Not-AND (NAND) logic operation. */
            LOGIC_OP_NAND = 14,
            
            /** SET logic operation (result is always `1`). See also [constant LOGIC_OP_CLEAR]. */
            LOGIC_OP_SET = 15,
            
            /** Represents the size of the [enum LogicOperation] enum. */
            LOGIC_OP_MAX = 16,
        }
        enum BlendFactor {
            /** Constant `0.0` blend factor. */
            BLEND_FACTOR_ZERO = 0,
            
            /** Constant `1.0` blend factor. */
            BLEND_FACTOR_ONE = 1,
            
            /** Color blend factor is `source color`. Alpha blend factor is `source alpha`. */
            BLEND_FACTOR_SRC_COLOR = 2,
            
            /** Color blend factor is `1.0 - source color`. Alpha blend factor is `1.0 - source alpha`. */
            BLEND_FACTOR_ONE_MINUS_SRC_COLOR = 3,
            
            /** Color blend factor is `destination color`. Alpha blend factor is `destination alpha`. */
            BLEND_FACTOR_DST_COLOR = 4,
            
            /** Color blend factor is `1.0 - destination color`. Alpha blend factor is `1.0 - destination alpha`. */
            BLEND_FACTOR_ONE_MINUS_DST_COLOR = 5,
            
            /** Color and alpha blend factor is `source alpha`. */
            BLEND_FACTOR_SRC_ALPHA = 6,
            
            /** Color and alpha blend factor is `1.0 - source alpha`. */
            BLEND_FACTOR_ONE_MINUS_SRC_ALPHA = 7,
            
            /** Color and alpha blend factor is `destination alpha`. */
            BLEND_FACTOR_DST_ALPHA = 8,
            
            /** Color and alpha blend factor is `1.0 - destination alpha`. */
            BLEND_FACTOR_ONE_MINUS_DST_ALPHA = 9,
            
            /** Color blend factor is `blend constant color`. Alpha blend factor is `blend constant alpha` (see [method draw_list_set_blend_constants]). */
            BLEND_FACTOR_CONSTANT_COLOR = 10,
            
            /** Color blend factor is `1.0 - blend constant color`. Alpha blend factor is `1.0 - blend constant alpha` (see [method draw_list_set_blend_constants]). */
            BLEND_FACTOR_ONE_MINUS_CONSTANT_COLOR = 11,
            
            /** Color and alpha blend factor is `blend constant alpha` (see [method draw_list_set_blend_constants]). */
            BLEND_FACTOR_CONSTANT_ALPHA = 12,
            
            /** Color and alpha blend factor is `1.0 - blend constant alpha` (see [method draw_list_set_blend_constants]). */
            BLEND_FACTOR_ONE_MINUS_CONSTANT_ALPHA = 13,
            
            /** Color blend factor is `min(source alpha, 1.0 - destination alpha)`. Alpha blend factor is `1.0`. */
            BLEND_FACTOR_SRC_ALPHA_SATURATE = 14,
            
            /** Color blend factor is `second source color`. Alpha blend factor is `second source alpha`. Only relevant for dual-source blending. */
            BLEND_FACTOR_SRC1_COLOR = 15,
            
            /** Color blend factor is `1.0 - second source color`. Alpha blend factor is `1.0 - second source alpha`. Only relevant for dual-source blending. */
            BLEND_FACTOR_ONE_MINUS_SRC1_COLOR = 16,
            
            /** Color and alpha blend factor is `second source alpha`. Only relevant for dual-source blending. */
            BLEND_FACTOR_SRC1_ALPHA = 17,
            
            /** Color and alpha blend factor is `1.0 - second source alpha`. Only relevant for dual-source blending. */
            BLEND_FACTOR_ONE_MINUS_SRC1_ALPHA = 18,
            
            /** Represents the size of the [enum BlendFactor] enum. */
            BLEND_FACTOR_MAX = 19,
        }
        enum BlendOperation {
            /** Additive blending operation (`source + destination`). */
            BLEND_OP_ADD = 0,
            
            /** Subtractive blending operation (`source - destination`). */
            BLEND_OP_SUBTRACT = 1,
            
            /** Reverse subtractive blending operation (`destination - source`). */
            BLEND_OP_REVERSE_SUBTRACT = 2,
            
            /** Minimum blending operation (keep the lowest value of the two). */
            BLEND_OP_MINIMUM = 3,
            
            /** Maximum blending operation (keep the highest value of the two). */
            BLEND_OP_MAXIMUM = 4,
            
            /** Represents the size of the [enum BlendOperation] enum. */
            BLEND_OP_MAX = 5,
        }
        enum PipelineDynamicStateFlags {
            /** Allows dynamically changing the width of rendering lines. */
            DYNAMIC_STATE_LINE_WIDTH = 1,
            
            /** Allows dynamically changing the depth bias. */
            DYNAMIC_STATE_DEPTH_BIAS = 2,
            DYNAMIC_STATE_BLEND_CONSTANTS = 4,
            DYNAMIC_STATE_DEPTH_BOUNDS = 8,
            DYNAMIC_STATE_STENCIL_COMPARE_MASK = 16,
            DYNAMIC_STATE_STENCIL_WRITE_MASK = 32,
            DYNAMIC_STATE_STENCIL_REFERENCE = 64,
        }
        enum InitialAction {
            /** Load the previous contents of the framebuffer. */
            INITIAL_ACTION_LOAD = 0,
            
            /** Clear the whole framebuffer or its specified region. */
            INITIAL_ACTION_CLEAR = 1,
            
            /** Ignore the previous contents of the framebuffer. This is the fastest option if you'll overwrite all of the pixels and don't need to read any of them. */
            INITIAL_ACTION_DISCARD = 2,
            
            /** Represents the size of the [enum InitialAction] enum. */
            INITIAL_ACTION_MAX = 3,
            INITIAL_ACTION_CLEAR_REGION = 1,
            INITIAL_ACTION_CLEAR_REGION_CONTINUE = 1,
            INITIAL_ACTION_KEEP = 0,
            INITIAL_ACTION_DROP = 2,
            INITIAL_ACTION_CONTINUE = 0,
        }
        enum FinalAction {
            /** Store the result of the draw list in the framebuffer. This is generally what you want to do. */
            FINAL_ACTION_STORE = 0,
            
            /** Discard the contents of the framebuffer. This is the fastest option if you don't need to use the results of the draw list. */
            FINAL_ACTION_DISCARD = 1,
            
            /** Represents the size of the [enum FinalAction] enum. */
            FINAL_ACTION_MAX = 2,
            FINAL_ACTION_READ = 0,
            FINAL_ACTION_CONTINUE = 0,
        }
        enum ShaderStage {
            /** Vertex shader stage. This can be used to manipulate vertices from a shader (but not create new vertices). */
            SHADER_STAGE_VERTEX = 0,
            
            /** Fragment shader stage (called "pixel shader" in Direct3D). This can be used to manipulate pixels from a shader. */
            SHADER_STAGE_FRAGMENT = 1,
            
            /** Tessellation control shader stage. This can be used to create additional geometry from a shader. */
            SHADER_STAGE_TESSELATION_CONTROL = 2,
            
            /** Tessellation evaluation shader stage. This can be used to create additional geometry from a shader. */
            SHADER_STAGE_TESSELATION_EVALUATION = 3,
            
            /** Compute shader stage. This can be used to run arbitrary computing tasks in a shader, performing them on the GPU instead of the CPU. */
            SHADER_STAGE_COMPUTE = 4,
            
            /** Represents the size of the [enum ShaderStage] enum. */
            SHADER_STAGE_MAX = 5,
            
            /** Vertex shader stage bit (see also [constant SHADER_STAGE_VERTEX]). */
            SHADER_STAGE_VERTEX_BIT = 1,
            
            /** Fragment shader stage bit (see also [constant SHADER_STAGE_FRAGMENT]). */
            SHADER_STAGE_FRAGMENT_BIT = 2,
            
            /** Tessellation control shader stage bit (see also [constant SHADER_STAGE_TESSELATION_CONTROL]). */
            SHADER_STAGE_TESSELATION_CONTROL_BIT = 4,
            
            /** Tessellation evaluation shader stage bit (see also [constant SHADER_STAGE_TESSELATION_EVALUATION]). */
            SHADER_STAGE_TESSELATION_EVALUATION_BIT = 8,
            
            /** Compute shader stage bit (see also [constant SHADER_STAGE_COMPUTE]). */
            SHADER_STAGE_COMPUTE_BIT = 16,
        }
        enum ShaderLanguage {
            /** Khronos' GLSL shading language (used natively by OpenGL and Vulkan). This is the language used for core Godot shaders. */
            SHADER_LANGUAGE_GLSL = 0,
            
            /** Microsoft's High-Level Shading Language (used natively by Direct3D, but can also be used in Vulkan). */
            SHADER_LANGUAGE_HLSL = 1,
        }
        enum PipelineSpecializationConstantType {
            /** Boolean specialization constant. */
            PIPELINE_SPECIALIZATION_CONSTANT_TYPE_BOOL = 0,
            
            /** Integer specialization constant. */
            PIPELINE_SPECIALIZATION_CONSTANT_TYPE_INT = 1,
            
            /** Floating-point specialization constant. */
            PIPELINE_SPECIALIZATION_CONSTANT_TYPE_FLOAT = 2,
        }
        enum Features {
            /** Support for MetalFX spatial upscaling. */
            SUPPORTS_METALFX_SPATIAL = 3,
            
            /** Support for MetalFX temporal upscaling. */
            SUPPORTS_METALFX_TEMPORAL = 4,
            
            /** Features support for buffer device address extension. */
            SUPPORTS_BUFFER_DEVICE_ADDRESS = 6,
            
            /** Support for 32-bit image atomic operations. */
            SUPPORTS_IMAGE_ATOMIC_32_BIT = 7,
        }
        enum Limit {
            /** Maximum number of uniform sets that can be bound at a given time. */
            LIMIT_MAX_BOUND_UNIFORM_SETS = 0,
            
            /** Maximum number of color framebuffer attachments that can be used at a given time. */
            LIMIT_MAX_FRAMEBUFFER_COLOR_ATTACHMENTS = 1,
            
            /** Maximum number of textures that can be used per uniform set. */
            LIMIT_MAX_TEXTURES_PER_UNIFORM_SET = 2,
            
            /** Maximum number of samplers that can be used per uniform set. */
            LIMIT_MAX_SAMPLERS_PER_UNIFORM_SET = 3,
            
            /** Maximum number of [url=https://vkguide.dev/docs/chapter-4/storage_buffers/]storage buffers[/url] per uniform set. */
            LIMIT_MAX_STORAGE_BUFFERS_PER_UNIFORM_SET = 4,
            
            /** Maximum number of storage images per uniform set. */
            LIMIT_MAX_STORAGE_IMAGES_PER_UNIFORM_SET = 5,
            
            /** Maximum number of uniform buffers per uniform set. */
            LIMIT_MAX_UNIFORM_BUFFERS_PER_UNIFORM_SET = 6,
            
            /** Maximum index for an indexed draw command. */
            LIMIT_MAX_DRAW_INDEXED_INDEX = 7,
            
            /** Maximum height of a framebuffer (in pixels). */
            LIMIT_MAX_FRAMEBUFFER_HEIGHT = 8,
            
            /** Maximum width of a framebuffer (in pixels). */
            LIMIT_MAX_FRAMEBUFFER_WIDTH = 9,
            
            /** Maximum number of texture array layers. */
            LIMIT_MAX_TEXTURE_ARRAY_LAYERS = 10,
            
            /** Maximum supported 1-dimensional texture size (in pixels on a single axis). */
            LIMIT_MAX_TEXTURE_SIZE_1D = 11,
            
            /** Maximum supported 2-dimensional texture size (in pixels on a single axis). */
            LIMIT_MAX_TEXTURE_SIZE_2D = 12,
            
            /** Maximum supported 3-dimensional texture size (in pixels on a single axis). */
            LIMIT_MAX_TEXTURE_SIZE_3D = 13,
            
            /** Maximum supported cubemap texture size (in pixels on a single axis of a single face). */
            LIMIT_MAX_TEXTURE_SIZE_CUBE = 14,
            
            /** Maximum number of textures per shader stage. */
            LIMIT_MAX_TEXTURES_PER_SHADER_STAGE = 15,
            
            /** Maximum number of samplers per shader stage. */
            LIMIT_MAX_SAMPLERS_PER_SHADER_STAGE = 16,
            
            /** Maximum number of [url=https://vkguide.dev/docs/chapter-4/storage_buffers/]storage buffers[/url] per shader stage. */
            LIMIT_MAX_STORAGE_BUFFERS_PER_SHADER_STAGE = 17,
            
            /** Maximum number of storage images per shader stage. */
            LIMIT_MAX_STORAGE_IMAGES_PER_SHADER_STAGE = 18,
            
            /** Maximum number of uniform buffers per uniform set. */
            LIMIT_MAX_UNIFORM_BUFFERS_PER_SHADER_STAGE = 19,
            
            /** Maximum size of a push constant. A lot of devices are limited to 128 bytes, so try to avoid exceeding 128 bytes in push constants to ensure compatibility even if your GPU is reporting a higher value. */
            LIMIT_MAX_PUSH_CONSTANT_SIZE = 20,
            
            /** Maximum size of a uniform buffer. */
            LIMIT_MAX_UNIFORM_BUFFER_SIZE = 21,
            
            /** Maximum vertex input attribute offset. */
            LIMIT_MAX_VERTEX_INPUT_ATTRIBUTE_OFFSET = 22,
            
            /** Maximum number of vertex input attributes. */
            LIMIT_MAX_VERTEX_INPUT_ATTRIBUTES = 23,
            
            /** Maximum number of vertex input bindings. */
            LIMIT_MAX_VERTEX_INPUT_BINDINGS = 24,
            
            /** Maximum vertex input binding stride. */
            LIMIT_MAX_VERTEX_INPUT_BINDING_STRIDE = 25,
            
            /** Minimum uniform buffer offset alignment. */
            LIMIT_MIN_UNIFORM_BUFFER_OFFSET_ALIGNMENT = 26,
            
            /** Maximum shared memory size for compute shaders. */
            LIMIT_MAX_COMPUTE_SHARED_MEMORY_SIZE = 27,
            
            /** Maximum number of workgroups for compute shaders on the X axis. */
            LIMIT_MAX_COMPUTE_WORKGROUP_COUNT_X = 28,
            
            /** Maximum number of workgroups for compute shaders on the Y axis. */
            LIMIT_MAX_COMPUTE_WORKGROUP_COUNT_Y = 29,
            
            /** Maximum number of workgroups for compute shaders on the Z axis. */
            LIMIT_MAX_COMPUTE_WORKGROUP_COUNT_Z = 30,
            
            /** Maximum number of workgroup invocations for compute shaders. */
            LIMIT_MAX_COMPUTE_WORKGROUP_INVOCATIONS = 31,
            
            /** Maximum workgroup size for compute shaders on the X axis. */
            LIMIT_MAX_COMPUTE_WORKGROUP_SIZE_X = 32,
            
            /** Maximum workgroup size for compute shaders on the Y axis. */
            LIMIT_MAX_COMPUTE_WORKGROUP_SIZE_Y = 33,
            
            /** Maximum workgroup size for compute shaders on the Z axis. */
            LIMIT_MAX_COMPUTE_WORKGROUP_SIZE_Z = 34,
            
            /** Maximum viewport width (in pixels). */
            LIMIT_MAX_VIEWPORT_DIMENSIONS_X = 35,
            
            /** Maximum viewport height (in pixels). */
            LIMIT_MAX_VIEWPORT_DIMENSIONS_Y = 36,
            
            /** Returns the smallest value for [member ProjectSettings.rendering/scaling_3d/scale] when using the MetalFX temporal upscaler.  
             *      
             *  **Note:** The returned value is multiplied by a factor of `1000000` to preserve 6 digits of precision. It must be divided by `1000000.0` to convert the value to a floating point number.  
             */
            LIMIT_METALFX_TEMPORAL_SCALER_MIN_SCALE = 46,
            
            /** Returns the largest value for [member ProjectSettings.rendering/scaling_3d/scale] when using the MetalFX temporal upscaler.  
             *      
             *  **Note:** The returned value is multiplied by a factor of `1000000` to preserve 6 digits of precision. It must be divided by `1000000.0` to convert the value to a floating point number.  
             */
            LIMIT_METALFX_TEMPORAL_SCALER_MAX_SCALE = 47,
        }
        enum MemoryType {
            /** Memory taken by textures. */
            MEMORY_TEXTURES = 0,
            
            /** Memory taken by buffers. */
            MEMORY_BUFFERS = 1,
            
            /** Total memory taken. This is greater than the sum of [constant MEMORY_TEXTURES] and [constant MEMORY_BUFFERS], as it also includes miscellaneous memory usage. */
            MEMORY_TOTAL = 2,
        }
        enum BreadcrumbMarker {
            /** No breadcrumb marker will be added. */
            NONE = 0,
            
            /** During a GPU crash in dev or debug mode, Godot's error message will include `"REFLECTION_PROBES"` for added context as to when the crash occurred. */
            REFLECTION_PROBES = 65536,
            
            /** During a GPU crash in dev or debug mode, Godot's error message will include `"SKY_PASS"` for added context as to when the crash occurred. */
            SKY_PASS = 131072,
            
            /** During a GPU crash in dev or debug mode, Godot's error message will include `"LIGHTMAPPER_PASS"` for added context as to when the crash occurred. */
            LIGHTMAPPER_PASS = 196608,
            
            /** During a GPU crash in dev or debug mode, Godot's error message will include `"SHADOW_PASS_DIRECTIONAL"` for added context as to when the crash occurred. */
            SHADOW_PASS_DIRECTIONAL = 262144,
            
            /** During a GPU crash in dev or debug mode, Godot's error message will include `"SHADOW_PASS_CUBE"` for added context as to when the crash occurred. */
            SHADOW_PASS_CUBE = 327680,
            
            /** During a GPU crash in dev or debug mode, Godot's error message will include `"OPAQUE_PASS"` for added context as to when the crash occurred. */
            OPAQUE_PASS = 393216,
            
            /** During a GPU crash in dev or debug mode, Godot's error message will include `"ALPHA_PASS"` for added context as to when the crash occurred. */
            ALPHA_PASS = 458752,
            
            /** During a GPU crash in dev or debug mode, Godot's error message will include `"TRANSPARENT_PASS"` for added context as to when the crash occurred. */
            TRANSPARENT_PASS = 524288,
            
            /** During a GPU crash in dev or debug mode, Godot's error message will include `"POST_PROCESSING_PASS"` for added context as to when the crash occurred. */
            POST_PROCESSING_PASS = 589824,
            
            /** During a GPU crash in dev or debug mode, Godot's error message will include `"BLIT_PASS"` for added context as to when the crash occurred. */
            BLIT_PASS = 655360,
            
            /** During a GPU crash in dev or debug mode, Godot's error message will include `"UI_PASS"` for added context as to when the crash occurred. */
            UI_PASS = 720896,
            
            /** During a GPU crash in dev or debug mode, Godot's error message will include `"DEBUG_PASS"` for added context as to when the crash occurred. */
            DEBUG_PASS = 786432,
        }
        enum DrawFlags {
            /** Do not clear or ignore any attachments. */
            DRAW_DEFAULT_ALL = 0,
            
            /** Clear the first color attachment. */
            DRAW_CLEAR_COLOR_0 = 1,
            
            /** Clear the second color attachment. */
            DRAW_CLEAR_COLOR_1 = 2,
            
            /** Clear the third color attachment. */
            DRAW_CLEAR_COLOR_2 = 4,
            
            /** Clear the fourth color attachment. */
            DRAW_CLEAR_COLOR_3 = 8,
            
            /** Clear the fifth color attachment. */
            DRAW_CLEAR_COLOR_4 = 16,
            
            /** Clear the sixth color attachment. */
            DRAW_CLEAR_COLOR_5 = 32,
            
            /** Clear the seventh color attachment. */
            DRAW_CLEAR_COLOR_6 = 64,
            
            /** Clear the eighth color attachment. */
            DRAW_CLEAR_COLOR_7 = 128,
            
            /** Mask for clearing all color attachments. */
            DRAW_CLEAR_COLOR_MASK = 255,
            
            /** Clear all color attachments. */
            DRAW_CLEAR_COLOR_ALL = 255,
            
            /** Ignore the previous contents of the first color attachment. */
            DRAW_IGNORE_COLOR_0 = 256,
            
            /** Ignore the previous contents of the second color attachment. */
            DRAW_IGNORE_COLOR_1 = 512,
            
            /** Ignore the previous contents of the third color attachment. */
            DRAW_IGNORE_COLOR_2 = 1024,
            
            /** Ignore the previous contents of the fourth color attachment. */
            DRAW_IGNORE_COLOR_3 = 2048,
            
            /** Ignore the previous contents of the fifth color attachment. */
            DRAW_IGNORE_COLOR_4 = 4096,
            
            /** Ignore the previous contents of the sixth color attachment. */
            DRAW_IGNORE_COLOR_5 = 8192,
            
            /** Ignore the previous contents of the seventh color attachment. */
            DRAW_IGNORE_COLOR_6 = 16384,
            
            /** Ignore the previous contents of the eighth color attachment. */
            DRAW_IGNORE_COLOR_7 = 32768,
            
            /** Mask for ignoring all the previous contents of the color attachments. */
            DRAW_IGNORE_COLOR_MASK = 65280,
            
            /** Ignore the previous contents of all color attachments. */
            DRAW_IGNORE_COLOR_ALL = 65280,
            
            /** Clear the depth attachment. */
            DRAW_CLEAR_DEPTH = 65536,
            
            /** Ignore the previous contents of the depth attachment. */
            DRAW_IGNORE_DEPTH = 131072,
            
            /** Clear the stencil attachment. */
            DRAW_CLEAR_STENCIL = 262144,
            
            /** Ignore the previous contents of the stencil attachment. */
            DRAW_IGNORE_STENCIL = 524288,
            
            /** Clear all attachments. */
            DRAW_CLEAR_ALL = 327935,
            
            /** Ignore the previous contents of all attachments. */
            DRAW_IGNORE_ALL = 720640,
        }
    }
    /** @deprecated Internal use. Does not exist at runtime. */
    interface __NameMapRenderingDevice extends __NameMapObject {
    }
    /** Abstraction for working with modern low-level graphics APIs.  
     *  	  
     *  @link https://docs.godotengine.org/en/4.5/classes/class_renderingdevice.html  
     */
    class RenderingDevice extends Object {
        /** Returned by functions that return an ID if a value is invalid. */
        static readonly INVALID_ID = -1
        
        /** Returned by functions that return a format ID if a value is invalid. */
        static readonly INVALID_FORMAT_ID = -1
        constructor(identifier?: any)
        
        /** Creates a new texture. It can be accessed with the RID that is returned.  
         *  Once finished with your RID, you will want to free the RID using the RenderingDevice's [method free_rid] method.  
         *      
         *  **Note:** [param data] takes an [Array] of [PackedByteArray]s. For [constant TEXTURE_TYPE_1D], [constant TEXTURE_TYPE_2D], and [constant TEXTURE_TYPE_3D] types, this array should only have one element, a [PackedByteArray] containing all the data for the texture. For `_ARRAY` and `_CUBE` types, the length should be the same as the number of [member RDTextureFormat.array_layers] in [param format].  
         *      
         *  **Note:** Not to be confused with [method RenderingServer.texture_2d_create], which creates the Godot-specific [Texture2D] resource as opposed to the graphics API's own texture type.  
         */
        texture_create(format: RDTextureFormat, view: RDTextureView, data?: GArray<PackedByteArray> /* = [] */): RID
        
        /** Creates a shared texture using the specified [param view] and the texture information from [param with_texture]. */
        texture_create_shared(view: RDTextureView, with_texture: RID): RID
        
        /** Creates a shared texture using the specified [param view] and the texture information from [param with_texture]'s [param layer] and [param mipmap]. The number of included mipmaps from the original texture can be controlled using the [param mipmaps] parameter. Only relevant for textures with multiple layers, such as 3D textures, texture arrays and cubemaps. For single-layer textures, use [method texture_create_shared].  
         *  For 2D textures (which only have one layer), [param layer] must be `0`.  
         *      
         *  **Note:** Layer slicing is only supported for 2D texture arrays, not 3D textures or cubemaps.  
         */
        texture_create_shared_from_slice(view: RDTextureView, with_texture: RID, layer: int64, mipmap: int64, mipmaps?: int64 /* = 1 */, slice_type?: RenderingDevice.TextureSliceType /* = 0 */): RID
        
        /** Returns an RID for an existing [param image] (`VkImage`) with the given [param type], [param format], [param samples], [param usage_flags], [param width], [param height], [param depth], [param layers], and [param mipmaps]. This can be used to allow Godot to render onto foreign images. */
        texture_create_from_extension(type: RenderingDevice.TextureType, format: RenderingDevice.DataFormat, samples: RenderingDevice.TextureSamples, usage_flags: RenderingDevice.TextureUsageBits, image: int64, width: int64, height: int64, depth: int64, layers: int64, mipmaps?: int64 /* = 1 */): RID
        
        /** Updates texture data with new data, replacing the previous data in place. The updated texture data must have the same dimensions and format. For 2D textures (which only have one layer), [param layer] must be `0`. Returns [constant @GlobalScope.OK] if the update was successful, [constant @GlobalScope.ERR_INVALID_PARAMETER] otherwise.  
         *      
         *  **Note:** Updating textures is forbidden during creation of a draw or compute list.  
         *      
         *  **Note:** The existing [param texture] can't be updated while a draw list that uses it as part of a framebuffer is being created. Ensure the draw list is finalized (and that the color/depth texture using it is not set to [constant FINAL_ACTION_CONTINUE]) to update this texture.  
         *      
         *  **Note:** The existing [param texture] requires the [constant TEXTURE_USAGE_CAN_UPDATE_BIT] to be updatable.  
         */
        texture_update(texture: RID, layer: int64, data: PackedByteArray | byte[] | ArrayBuffer): Error
        
        /** Returns the [param texture] data for the specified [param layer] as raw binary data. For 2D textures (which only have one layer), [param layer] must be `0`.  
         *      
         *  **Note:** [param texture] can't be retrieved while a draw list that uses it as part of a framebuffer is being created. Ensure the draw list is finalized (and that the color/depth texture using it is not set to [constant FINAL_ACTION_CONTINUE]) to retrieve this texture. Otherwise, an error is printed and an empty [PackedByteArray] is returned.  
         *      
         *  **Note:** [param texture] requires the [constant TEXTURE_USAGE_CAN_COPY_FROM_BIT] to be retrieved. Otherwise, an error is printed and an empty [PackedByteArray] is returned.  
         *      
         *  **Note:** This method will block the GPU from working until the data is retrieved. Refer to [method texture_get_data_async] for an alternative that returns the data in more performant way.  
         */
        texture_get_data(texture: RID, layer: int64): PackedByteArray
        
        /** Asynchronous version of [method texture_get_data]. RenderingDevice will call [param callback] in a certain amount of frames with the data the texture had at the time of the request.  
         *      
         *  **Note:** At the moment, the delay corresponds to the amount of frames specified by [member ProjectSettings.rendering/rendering_device/vsync/frame_queue_size].  
         *      
         *  **Note:** Downloading large textures can have a prohibitive cost for real-time even when using the asynchronous method due to hardware bandwidth limitations. When dealing with large resources, you can adjust settings such as [member ProjectSettings.rendering/rendering_device/staging_buffer/texture_download_region_size_px] and [member ProjectSettings.rendering/rendering_device/staging_buffer/block_size_kb] to improve the transfer speed at the cost of extra memory.  
         *    
         */
        texture_get_data_async(texture: RID, layer: int64, callback: Callable): Error
        
        /** Returns `true` if the specified [param format] is supported for the given [param usage_flags], `false` otherwise. */
        texture_is_format_supported_for_usage(format: RenderingDevice.DataFormat, usage_flags: RenderingDevice.TextureUsageBits): boolean
        
        /** Returns `true` if the [param texture] is shared, `false` otherwise. See [RDTextureView]. */
        texture_is_shared(texture: RID): boolean
        
        /** Returns `true` if the [param texture] is valid, `false` otherwise. */
        texture_is_valid(texture: RID): boolean
        
        /** Updates the discardable property of [param texture].  
         *  If a texture is discardable, its contents do not need to be preserved between frames. This flag is only relevant when the texture is used as target in a draw list.  
         *  This information is used by [RenderingDevice] to figure out if a texture's contents can be discarded, eliminating unnecessary writes to memory and boosting performance.  
         */
        texture_set_discardable(texture: RID, discardable: boolean): void
        
        /** Returns `true` if the [param texture] is discardable, `false` otherwise. See [RDTextureFormat] or [method texture_set_discardable]. */
        texture_is_discardable(texture: RID): boolean
        
        /** Copies the [param from_texture] to [param to_texture] with the specified [param from_pos], [param to_pos] and [param size] coordinates. The Z axis of the [param from_pos], [param to_pos] and [param size] must be `0` for 2-dimensional textures. Source and destination mipmaps/layers must also be specified, with these parameters being `0` for textures without mipmaps or single-layer textures. Returns [constant @GlobalScope.OK] if the texture copy was successful or [constant @GlobalScope.ERR_INVALID_PARAMETER] otherwise.  
         *      
         *  **Note:** [param from_texture] texture can't be copied while a draw list that uses it as part of a framebuffer is being created. Ensure the draw list is finalized (and that the color/depth texture using it is not set to [constant FINAL_ACTION_CONTINUE]) to copy this texture.  
         *      
         *  **Note:** [param from_texture] texture requires the [constant TEXTURE_USAGE_CAN_COPY_FROM_BIT] to be retrieved.  
         *      
         *  **Note:** [param to_texture] can't be copied while a draw list that uses it as part of a framebuffer is being created. Ensure the draw list is finalized (and that the color/depth texture using it is not set to [constant FINAL_ACTION_CONTINUE]) to copy this texture.  
         *      
         *  **Note:** [param to_texture] requires the [constant TEXTURE_USAGE_CAN_COPY_TO_BIT] to be retrieved.  
         *      
         *  **Note:** [param from_texture] and [param to_texture] must be of the same type (color or depth).  
         */
        texture_copy(from_texture: RID, to_texture: RID, from_pos: Vector3, to_pos: Vector3, size: Vector3, src_mipmap: int64, dst_mipmap: int64, src_layer: int64, dst_layer: int64): Error
        
        /** Clears the specified [param texture] by replacing all of its pixels with the specified [param color]. [param base_mipmap] and [param mipmap_count] determine which mipmaps of the texture are affected by this clear operation, while [param base_layer] and [param layer_count] determine which layers of a 3D texture (or texture array) are affected by this clear operation. For 2D textures (which only have one layer by design), [param base_layer] must be `0` and [param layer_count] must be `1`.  
         *      
         *  **Note:** [param texture] can't be cleared while a draw list that uses it as part of a framebuffer is being created. Ensure the draw list is finalized (and that the color/depth texture using it is not set to [constant FINAL_ACTION_CONTINUE]) to clear this texture.  
         */
        texture_clear(texture: RID, color: Color, base_mipmap: int64, mipmap_count: int64, base_layer: int64, layer_count: int64): Error
        
        /** Resolves the [param from_texture] texture onto [param to_texture] with multisample antialiasing enabled. This must be used when rendering a framebuffer for MSAA to work. Returns [constant @GlobalScope.OK] if successful, [constant @GlobalScope.ERR_INVALID_PARAMETER] otherwise.  
         *      
         *  **Note:** [param from_texture] and [param to_texture] textures must have the same dimension, format and type (color or depth).  
         *      
         *  **Note:** [param from_texture] can't be copied while a draw list that uses it as part of a framebuffer is being created. Ensure the draw list is finalized (and that the color/depth texture using it is not set to [constant FINAL_ACTION_CONTINUE]) to resolve this texture.  
         *      
         *  **Note:** [param from_texture] requires the [constant TEXTURE_USAGE_CAN_COPY_FROM_BIT] to be retrieved.  
         *      
         *  **Note:** [param from_texture] must be multisampled and must also be 2D (or a slice of a 3D/cubemap texture).  
         *      
         *  **Note:** [param to_texture] can't be copied while a draw list that uses it as part of a framebuffer is being created. Ensure the draw list is finalized (and that the color/depth texture using it is not set to [constant FINAL_ACTION_CONTINUE]) to resolve this texture.  
         *      
         *  **Note:** [param to_texture] texture requires the [constant TEXTURE_USAGE_CAN_COPY_TO_BIT] to be retrieved.  
         *      
         *  **Note:** [param to_texture] texture must **not** be multisampled and must also be 2D (or a slice of a 3D/cubemap texture).  
         */
        texture_resolve_multisample(from_texture: RID, to_texture: RID): Error
        
        /** Returns the data format used to create this texture. */
        texture_get_format(texture: RID): null | RDTextureFormat
        
        /** Returns the internal graphics handle for this texture object. For use when communicating with third-party APIs mostly with GDExtension.  
         *      
         *  **Note:** This function returns a `uint64_t` which internally maps to a `GLuint` (OpenGL) or `VkImage` (Vulkan).  
         */
        texture_get_native_handle(texture: RID): int64
        
        /** Creates a new framebuffer format with the specified [param attachments] and [param view_count]. Returns the new framebuffer's unique framebuffer format ID.  
         *  If [param view_count] is greater than or equal to `2`, enables multiview which is used for VR rendering. This requires support for the Vulkan multiview extension.  
         */
        framebuffer_format_create(attachments: GArray<RDAttachmentFormat>, view_count?: int64 /* = 1 */): int64
        
        /** Creates a multipass framebuffer format with the specified [param attachments], [param passes] and [param view_count] and returns its ID. If [param view_count] is greater than or equal to `2`, enables multiview which is used for VR rendering. This requires support for the Vulkan multiview extension. */
        framebuffer_format_create_multipass(attachments: GArray<RDAttachmentFormat>, passes: GArray<RDFramebufferPass>, view_count?: int64 /* = 1 */): int64
        
        /** Creates a new empty framebuffer format with the specified number of [param samples] and returns its ID. */
        framebuffer_format_create_empty(samples?: RenderingDevice.TextureSamples /* = 0 */): int64
        
        /** Returns the number of texture samples used for the given framebuffer [param format] ID (returned by [method framebuffer_get_format]). */
        framebuffer_format_get_texture_samples(format: int64, render_pass?: int64 /* = 0 */): RenderingDevice.TextureSamples
        
        /** Creates a new framebuffer. It can be accessed with the RID that is returned.  
         *  Once finished with your RID, you will want to free the RID using the RenderingDevice's [method free_rid] method.  
         */
        framebuffer_create(textures: GArray<RID>, validate_with_format?: int64 /* = -1 */, view_count?: int64 /* = 1 */): RID
        
        /** Creates a new multipass framebuffer. It can be accessed with the RID that is returned.  
         *  Once finished with your RID, you will want to free the RID using the RenderingDevice's [method free_rid] method.  
         */
        framebuffer_create_multipass(textures: GArray<RID>, passes: GArray<RDFramebufferPass>, validate_with_format?: int64 /* = -1 */, view_count?: int64 /* = 1 */): RID
        
        /** Creates a new empty framebuffer. It can be accessed with the RID that is returned.  
         *  Once finished with your RID, you will want to free the RID using the RenderingDevice's [method free_rid] method.  
         */
        framebuffer_create_empty(size: Vector2i, samples?: RenderingDevice.TextureSamples /* = 0 */, validate_with_format?: int64 /* = -1 */): RID
        
        /** Returns the format ID of the framebuffer specified by the [param framebuffer] RID. This ID is guaranteed to be unique for the same formats and does not need to be freed. */
        framebuffer_get_format(framebuffer: RID): int64
        
        /** Returns `true` if the framebuffer specified by the [param framebuffer] RID is valid, `false` otherwise. */
        framebuffer_is_valid(framebuffer: RID): boolean
        
        /** Creates a new sampler. It can be accessed with the RID that is returned.  
         *  Once finished with your RID, you will want to free the RID using the RenderingDevice's [method free_rid] method.  
         */
        sampler_create(state: RDSamplerState): RID
        
        /** Returns `true` if implementation supports using a texture of [param format] with the given [param sampler_filter]. */
        sampler_is_format_supported_for_filter(format: RenderingDevice.DataFormat, sampler_filter: RenderingDevice.SamplerFilter): boolean
        
        /** Creates a new vertex buffer. It can be accessed with the RID that is returned.  
         *  Once finished with your RID, you will want to free the RID using the RenderingDevice's [method free_rid] method.  
         */
        vertex_buffer_create(size_bytes: int64, data?: PackedByteArray | byte[] | ArrayBuffer /* = [] */, creation_bits?: RenderingDevice.BufferCreationBits /* = 0 */): RID
        
        /** Creates a new vertex format with the specified [param vertex_descriptions]. Returns a unique vertex format ID corresponding to the newly created vertex format. */
        vertex_format_create(vertex_descriptions: GArray<RDVertexAttribute>): int64
        
        /** Creates a vertex array based on the specified buffers. Optionally, [param offsets] (in bytes) may be defined for each buffer. */
        vertex_array_create(vertex_count: int64, vertex_format: int64, src_buffers: GArray<RID>, offsets?: PackedInt64Array | int64[] /* = [] */): RID
        
        /** Creates a new index buffer. It can be accessed with the RID that is returned.  
         *  Once finished with your RID, you will want to free the RID using the RenderingDevice's [method free_rid] method.  
         */
        index_buffer_create(size_indices: int64, format: RenderingDevice.IndexBufferFormat, data?: PackedByteArray | byte[] | ArrayBuffer /* = [] */, use_restart_indices?: boolean /* = false */, creation_bits?: RenderingDevice.BufferCreationBits /* = 0 */): RID
        
        /** Creates a new index array. It can be accessed with the RID that is returned.  
         *  Once finished with your RID, you will want to free the RID using the RenderingDevice's [method free_rid] method.  
         */
        index_array_create(index_buffer: RID, index_offset: int64, index_count: int64): RID
        
        /** Compiles a SPIR-V from the shader source code in [param shader_source] and returns the SPIR-V as an [RDShaderSPIRV]. This intermediate language shader is portable across different GPU models and driver versions, but cannot be run directly by GPUs until compiled into a binary shader using [method shader_compile_binary_from_spirv].  
         *  If [param allow_cache] is `true`, make use of the shader cache generated by Godot. This avoids a potentially lengthy shader compilation step if the shader is already in cache. If [param allow_cache] is `false`, Godot's shader cache is ignored and the shader will always be recompiled.  
         */
        shader_compile_spirv_from_source(shader_source: RDShaderSource, allow_cache?: boolean /* = true */): null | RDShaderSPIRV
        
        /** Compiles a binary shader from [param spirv_data] and returns the compiled binary data as a [PackedByteArray]. This compiled shader is specific to the GPU model and driver version used; it will not work on different GPU models or even different driver versions. See also [method shader_compile_spirv_from_source].  
         *  [param name] is an optional human-readable name that can be given to the compiled shader for organizational purposes.  
         */
        shader_compile_binary_from_spirv(spirv_data: RDShaderSPIRV, name?: string /* = '' */): PackedByteArray
        
        /** Creates a new shader instance from SPIR-V intermediate code. It can be accessed with the RID that is returned.  
         *  Once finished with your RID, you will want to free the RID using the RenderingDevice's [method free_rid] method. See also [method shader_compile_spirv_from_source] and [method shader_create_from_bytecode].  
         */
        shader_create_from_spirv(spirv_data: RDShaderSPIRV, name?: string /* = '' */): RID
        
        /** Creates a new shader instance from a binary compiled shader. It can be accessed with the RID that is returned.  
         *  Once finished with your RID, you will want to free the RID using the RenderingDevice's [method free_rid] method. See also [method shader_compile_binary_from_spirv] and [method shader_create_from_spirv].  
         */
        shader_create_from_bytecode(binary_data: PackedByteArray | byte[] | ArrayBuffer, placeholder_rid?: RID /* = new RID() */): RID
        
        /** Create a placeholder RID by allocating an RID without initializing it for use in [method shader_create_from_bytecode]. This allows you to create an RID for a shader and pass it around, but defer compiling the shader to a later time. */
        shader_create_placeholder(): RID
        
        /** Returns the internal vertex input mask. Internally, the vertex input mask is an unsigned integer consisting of the locations (specified in GLSL via. `layout(location = ...)`) of the input variables (specified in GLSL by the `in` keyword). */
        shader_get_vertex_input_attribute_mask(shader: RID): int64
        
        /** Creates a new uniform buffer. It can be accessed with the RID that is returned.  
         *  Once finished with your RID, you will want to free the RID using the RenderingDevice's [method free_rid] method.  
         */
        uniform_buffer_create(size_bytes: int64, data?: PackedByteArray | byte[] | ArrayBuffer /* = [] */, creation_bits?: RenderingDevice.BufferCreationBits /* = 0 */): RID
        
        /** Creates a [url=https://vkguide.dev/docs/chapter-4/storage_buffers/]storage buffer[/url] with the specified [param data] and [param usage]. It can be accessed with the RID that is returned.  
         *  Once finished with your RID, you will want to free the RID using the RenderingDevice's [method free_rid] method.  
         */
        storage_buffer_create(size_bytes: int64, data?: PackedByteArray | byte[] | ArrayBuffer /* = [] */, usage?: RenderingDevice.StorageBufferUsage /* = 0 */, creation_bits?: RenderingDevice.BufferCreationBits /* = 0 */): RID
        
        /** Creates a new texture buffer. It can be accessed with the RID that is returned.  
         *  Once finished with your RID, you will want to free the RID using the RenderingDevice's [method free_rid] method.  
         */
        texture_buffer_create(size_bytes: int64, format: RenderingDevice.DataFormat, data?: PackedByteArray | byte[] | ArrayBuffer /* = [] */): RID
        
        /** Creates a new uniform set. It can be accessed with the RID that is returned.  
         *  Once finished with your RID, you will want to free the RID using the RenderingDevice's [method free_rid] method.  
         */
        uniform_set_create(uniforms: GArray<RDUniform>, shader: RID, shader_set: int64): RID
        
        /** Checks if the [param uniform_set] is valid, i.e. is owned. */
        uniform_set_is_valid(uniform_set: RID): boolean
        
        /** Copies [param size] bytes from the [param src_buffer] at [param src_offset] into [param dst_buffer] at [param dst_offset].  
         *  Prints an error if:  
         *  - [param size] exceeds the size of either [param src_buffer] or [param dst_buffer] at their corresponding offsets  
         *  - a draw list is currently active (created by [method draw_list_begin])  
         *  - a compute list is currently active (created by [method compute_list_begin])  
         */
        buffer_copy(src_buffer: RID, dst_buffer: RID, src_offset: int64, dst_offset: int64, size: int64): Error
        
        /** Updates a region of [param size_bytes] bytes, starting at [param offset], in the buffer, with the specified [param data].  
         *  Prints an error if:  
         *  - the region specified by [param offset] + [param size_bytes] exceeds the buffer  
         *  - a draw list is currently active (created by [method draw_list_begin])  
         *  - a compute list is currently active (created by [method compute_list_begin])  
         */
        buffer_update(buffer: RID, offset: int64, size_bytes: int64, data: PackedByteArray | byte[] | ArrayBuffer): Error
        
        /** Clears the contents of the [param buffer], clearing [param size_bytes] bytes, starting at [param offset].  
         *  Prints an error if:  
         *  - the size isn't a multiple of four  
         *  - the region specified by [param offset] + [param size_bytes] exceeds the buffer  
         *  - a draw list is currently active (created by [method draw_list_begin])  
         *  - a compute list is currently active (created by [method compute_list_begin])  
         */
        buffer_clear(buffer: RID, offset: int64, size_bytes: int64): Error
        
        /** Returns a copy of the data of the specified [param buffer], optionally [param offset_bytes] and [param size_bytes] can be set to copy only a portion of the buffer.  
         *      
         *  **Note:** This method will block the GPU from working until the data is retrieved. Refer to [method buffer_get_data_async] for an alternative that returns the data in more performant way.  
         */
        buffer_get_data(buffer: RID, offset_bytes?: int64 /* = 0 */, size_bytes?: int64 /* = 0 */): PackedByteArray
        
        /** Asynchronous version of [method buffer_get_data]. RenderingDevice will call [param callback] in a certain amount of frames with the data the buffer had at the time of the request.  
         *      
         *  **Note:** At the moment, the delay corresponds to the amount of frames specified by [member ProjectSettings.rendering/rendering_device/vsync/frame_queue_size].  
         *      
         *  **Note:** Downloading large buffers can have a prohibitive cost for real-time even when using the asynchronous method due to hardware bandwidth limitations. When dealing with large resources, you can adjust settings such as [member ProjectSettings.rendering/rendering_device/staging_buffer/block_size_kb] to improve the transfer speed at the cost of extra memory.  
         *    
         */
        buffer_get_data_async(buffer: RID, callback: Callable, offset_bytes?: int64 /* = 0 */, size_bytes?: int64 /* = 0 */): Error
        
        /** Returns the address of the given [param buffer] which can be passed to shaders in any way to access underlying data. Buffer must have been created with this feature enabled.  
         *      
         *  **Note:** You must check that the GPU supports this functionality by calling [method has_feature] with [constant SUPPORTS_BUFFER_DEVICE_ADDRESS] as a parameter.  
         */
        buffer_get_device_address(buffer: RID): int64
        
        /** Creates a new render pipeline. It can be accessed with the RID that is returned.  
         *  Once finished with your RID, you will want to free the RID using the RenderingDevice's [method free_rid] method.  
         */
        render_pipeline_create(shader: RID, framebuffer_format: int64, vertex_format: int64, primitive: RenderingDevice.RenderPrimitive, rasterization_state: RDPipelineRasterizationState, multisample_state: RDPipelineMultisampleState, stencil_state: RDPipelineDepthStencilState, color_blend_state: RDPipelineColorBlendState, dynamic_state_flags?: RenderingDevice.PipelineDynamicStateFlags /* = 0 */, for_render_pass?: int64 /* = 0 */, specialization_constants?: GArray<RDPipelineSpecializationConstant> /* = [] */): RID
        
        /** Returns `true` if the render pipeline specified by the [param render_pipeline] RID is valid, `false` otherwise. */
        render_pipeline_is_valid(render_pipeline: RID): boolean
        
        /** Creates a new compute pipeline. It can be accessed with the RID that is returned.  
         *  Once finished with your RID, you will want to free the RID using the RenderingDevice's [method free_rid] method.  
         */
        compute_pipeline_create(shader: RID, specialization_constants?: GArray<RDPipelineSpecializationConstant> /* = [] */): RID
        
        /** Returns `true` if the compute pipeline specified by the [param compute_pipeline] RID is valid, `false` otherwise. */
        compute_pipeline_is_valid(compute_pipeline: RID): boolean
        
        /** Returns the window width matching the graphics API context for the given window ID (in pixels). Despite the parameter being named [param screen], this returns the  *window*  size. See also [method screen_get_height].  
         *      
         *  **Note:** Only the main [RenderingDevice] returned by [method RenderingServer.get_rendering_device] has a width. If called on a local [RenderingDevice], this method prints an error and returns [constant INVALID_ID].  
         */
        screen_get_width(screen?: int64 /* = 0 */): int64
        
        /** Returns the window height matching the graphics API context for the given window ID (in pixels). Despite the parameter being named [param screen], this returns the  *window*  size. See also [method screen_get_width].  
         *      
         *  **Note:** Only the main [RenderingDevice] returned by [method RenderingServer.get_rendering_device] has a height. If called on a local [RenderingDevice], this method prints an error and returns [constant INVALID_ID].  
         */
        screen_get_height(screen?: int64 /* = 0 */): int64
        
        /** Returns the framebuffer format of the given screen.  
         *      
         *  **Note:** Only the main [RenderingDevice] returned by [method RenderingServer.get_rendering_device] has a format. If called on a local [RenderingDevice], this method prints an error and returns [constant INVALID_ID].  
         */
        screen_get_framebuffer_format(screen?: int64 /* = 0 */): int64
        
        /** High-level variant of [method draw_list_begin], with the parameters automatically being adjusted for drawing onto the window specified by the [param screen] ID.  
         *      
         *  **Note:** Cannot be used with local RenderingDevices, as these don't have a screen. If called on a local RenderingDevice, [method draw_list_begin_for_screen] returns [constant INVALID_ID].  
         */
        draw_list_begin_for_screen(screen?: int64 /* = 0 */, clear_color?: Color /* = new Color(0, 0, 0, 1) */): int64
        
        /** Starts a list of raster drawing commands created with the `draw_*` methods. The returned value should be passed to other `draw_list_*` functions.  
         *  Multiple draw lists cannot be created at the same time; you must finish the previous draw list first using [method draw_list_end].  
         *  A simple drawing operation might look like this (code is not a complete example):  
         *    
         *  The [param draw_flags] indicates if the texture attachments of the framebuffer should be cleared or ignored. Only one of the two flags can be used for each individual attachment. Ignoring an attachment means that any contents that existed before the draw list will be completely discarded, reducing the memory bandwidth used by the render pass but producing garbage results if the pixels aren't replaced. The default behavior allows the engine to figure out the right operation to use if the texture is discardable, which can result in increased performance. See [RDTextureFormat] or [method texture_set_discardable].  
         *  The [param breadcrumb] parameter can be an arbitrary 32-bit integer that is useful to diagnose GPU crashes. If Godot is built in dev or debug mode; when the GPU crashes Godot will dump all shaders that were being executed at the time of the crash and the breadcrumb is useful to diagnose what passes did those shaders belong to.  
         *  It does not affect rendering behavior and can be set to 0. It is recommended to use [enum BreadcrumbMarker] enumerations for consistency but it's not required. It is also possible to use bitwise operations to add extra data. e.g.  
         *    
         */
        draw_list_begin(framebuffer: RID, draw_flags?: RenderingDevice.DrawFlags /* = 0 */, clear_color_values?: PackedColorArray | Color[] /* = [] */, clear_depth_value?: float64 /* = 1 */, clear_stencil_value?: int64 /* = 0 */, region?: Rect2 /* = new Rect2(0, 0, 0, 0) */, breadcrumb?: int64 /* = 0 */): int64
        
        /** This method does nothing and always returns an empty [PackedInt64Array]. */
        draw_list_begin_split(framebuffer: RID, splits: int64, initial_color_action: RenderingDevice.InitialAction, final_color_action: RenderingDevice.FinalAction, initial_depth_action: RenderingDevice.InitialAction, final_depth_action: RenderingDevice.FinalAction, clear_color_values?: PackedColorArray | Color[] /* = [] */, clear_depth?: float64 /* = 1 */, clear_stencil?: int64 /* = 0 */, region?: Rect2 /* = new Rect2(0, 0, 0, 0) */, storage_textures?: GArray<RID> /* = [] */): PackedInt64Array
        
        /** Sets blend constants for the specified [param draw_list] to [param color]. Blend constants are used only if the graphics pipeline is created with [constant DYNAMIC_STATE_BLEND_CONSTANTS] flag set. */
        draw_list_set_blend_constants(draw_list: int64, color: Color): void
        
        /** Binds [param render_pipeline] to the specified [param draw_list]. */
        draw_list_bind_render_pipeline(draw_list: int64, render_pipeline: RID): void
        
        /** Binds [param uniform_set] to the specified [param draw_list]. A [param set_index] must also be specified, which is an identifier starting from `0` that must match the one expected by the draw list. */
        draw_list_bind_uniform_set(draw_list: int64, uniform_set: RID, set_index: int64): void
        
        /** Binds [param vertex_array] to the specified [param draw_list]. */
        draw_list_bind_vertex_array(draw_list: int64, vertex_array: RID): void
        
        /** Binds [param index_array] to the specified [param draw_list]. */
        draw_list_bind_index_array(draw_list: int64, index_array: RID): void
        
        /** Sets the push constant data to [param buffer] for the specified [param draw_list]. The shader determines how this binary data is used. The buffer's size in bytes must also be specified in [param size_bytes] (this can be obtained by calling the [method PackedByteArray.size] method on the passed [param buffer]). */
        draw_list_set_push_constant(draw_list: int64, buffer: PackedByteArray | byte[] | ArrayBuffer, size_bytes: int64): void
        
        /** Submits [param draw_list] for rendering on the GPU. This is the raster equivalent to [method compute_list_dispatch]. */
        draw_list_draw(draw_list: int64, use_indices: boolean, instances: int64, procedural_vertex_count?: int64 /* = 0 */): void
        
        /** Submits [param draw_list] for rendering on the GPU with the given parameters stored in the [param buffer] at [param offset]. Parameters being integers: vertex count, instance count, first vertex, first instance. And when using indices: index count, instance count, first index, vertex offset, first instance. Buffer must have been created with [constant STORAGE_BUFFER_USAGE_DISPATCH_INDIRECT] flag. */
        draw_list_draw_indirect(draw_list: int64, use_indices: boolean, buffer: RID, offset?: int64 /* = 0 */, draw_count?: int64 /* = 1 */, stride?: int64 /* = 0 */): void
        
        /** Creates a scissor rectangle and enables it for the specified [param draw_list]. Scissor rectangles are used for clipping by discarding fragments that fall outside a specified rectangular portion of the screen. See also [method draw_list_disable_scissor].  
         *      
         *  **Note:** The specified [param rect] is automatically intersected with the screen's dimensions, which means it cannot exceed the screen's dimensions.  
         */
        draw_list_enable_scissor(draw_list: int64, rect?: Rect2 /* = new Rect2(0, 0, 0, 0) */): void
        
        /** Removes and disables the scissor rectangle for the specified [param draw_list]. See also [method draw_list_enable_scissor]. */
        draw_list_disable_scissor(draw_list: int64): void
        
        /** Switches to the next draw pass. */
        draw_list_switch_to_next_pass(): int64
        
        /** This method does nothing and always returns an empty [PackedInt64Array]. */
        draw_list_switch_to_next_pass_split(splits: int64): PackedInt64Array
        
        /** Finishes a list of raster drawing commands created with the `draw_*` methods. */
        draw_list_end(): void
        
        /** Starts a list of compute commands created with the `compute_*` methods. The returned value should be passed to other `compute_list_*` functions.  
         *  Multiple compute lists cannot be created at the same time; you must finish the previous compute list first using [method compute_list_end].  
         *  A simple compute operation might look like this (code is not a complete example):  
         *    
         */
        compute_list_begin(): int64
        
        /** Tells the GPU what compute pipeline to use when processing the compute list. If the shader has changed since the last time this function was called, Godot will unbind all descriptor sets and will re-bind them inside [method compute_list_dispatch]. */
        compute_list_bind_compute_pipeline(compute_list: int64, compute_pipeline: RID): void
        
        /** Sets the push constant data to [param buffer] for the specified [param compute_list]. The shader determines how this binary data is used. The buffer's size in bytes must also be specified in [param size_bytes] (this can be obtained by calling the [method PackedByteArray.size] method on the passed [param buffer]). */
        compute_list_set_push_constant(compute_list: int64, buffer: PackedByteArray | byte[] | ArrayBuffer, size_bytes: int64): void
        
        /** Binds the [param uniform_set] to this [param compute_list]. Godot ensures that all textures in the uniform set have the correct Vulkan access masks. If Godot had to change access masks of textures, it will raise a Vulkan image memory barrier. */
        compute_list_bind_uniform_set(compute_list: int64, uniform_set: RID, set_index: int64): void
        
        /** Submits the compute list for processing on the GPU. This is the compute equivalent to [method draw_list_draw]. */
        compute_list_dispatch(compute_list: int64, x_groups: int64, y_groups: int64, z_groups: int64): void
        
        /** Submits the compute list for processing on the GPU with the given group counts stored in the [param buffer] at [param offset]. Buffer must have been created with [constant STORAGE_BUFFER_USAGE_DISPATCH_INDIRECT] flag. */
        compute_list_dispatch_indirect(compute_list: int64, buffer: RID, offset: int64): void
        
        /** Raises a Vulkan compute barrier in the specified [param compute_list]. */
        compute_list_add_barrier(compute_list: int64): void
        
        /** Finishes a list of compute commands created with the `compute_*` methods. */
        compute_list_end(): void
        
        /** Tries to free an object in the RenderingDevice. To avoid memory leaks, this should be called after using an object as memory management does not occur automatically when using RenderingDevice directly. */
        free_rid(rid: RID): void
        
        /** Creates a timestamp marker with the specified [param name]. This is used for performance reporting with the [method get_captured_timestamp_cpu_time], [method get_captured_timestamp_gpu_time] and [method get_captured_timestamp_name] methods. */
        capture_timestamp(name: string): void
        
        /** Returns the total number of timestamps (rendering steps) available for profiling. */
        get_captured_timestamps_count(): int64
        
        /** Returns the index of the last frame rendered that has rendering timestamps available for querying. */
        get_captured_timestamps_frame(): int64
        
        /** Returns the timestamp in GPU time for the rendering step specified by [param index] (in microseconds since the engine started). See also [method get_captured_timestamp_cpu_time] and [method capture_timestamp]. */
        get_captured_timestamp_gpu_time(index: int64): int64
        
        /** Returns the timestamp in CPU time for the rendering step specified by [param index] (in microseconds since the engine started). See also [method get_captured_timestamp_gpu_time] and [method capture_timestamp]. */
        get_captured_timestamp_cpu_time(index: int64): int64
        
        /** Returns the timestamp's name for the rendering step specified by [param index]. See also [method capture_timestamp]. */
        get_captured_timestamp_name(index: int64): string
        
        /** Returns `true` if the [param feature] is supported by the GPU. */
        has_feature(feature: RenderingDevice.Features): boolean
        
        /** Returns the value of the specified [param limit]. This limit varies depending on the current graphics hardware (and sometimes the driver version). If the given limit is exceeded, rendering errors will occur.  
         *  Limits for various graphics hardware can be found in the [url=https://vulkan.gpuinfo.org/]Vulkan Hardware Database[/url].  
         */
        limit_get(limit: RenderingDevice.Limit): int64
        
        /** Returns the frame count kept by the graphics API. Higher values result in higher input lag, but with more consistent throughput. For the main [RenderingDevice], frames are cycled (usually 3 with triple-buffered V-Sync enabled). However, local [RenderingDevice]s only have 1 frame. */
        get_frame_delay(): int64
        
        /** Pushes the frame setup and draw command buffers then marks the local device as currently processing (which allows calling [method sync]).  
         *      
         *  **Note:** Only available in local RenderingDevices.  
         */
        submit(): void
        
        /** Forces a synchronization between the CPU and GPU, which may be required in certain cases. Only call this when needed, as CPU-GPU synchronization has a performance cost.  
         *      
         *  **Note:** Only available in local RenderingDevices.  
         *      
         *  **Note:** [method sync] can only be called after a [method submit].  
         */
        sync(): void
        
        /** This method does nothing. */
        barrier(from?: RenderingDevice.BarrierMask /* = 32767 */, to?: RenderingDevice.BarrierMask /* = 32767 */): void
        
        /** This method does nothing. */
        full_barrier(): void
        
        /** Create a new local [RenderingDevice]. This is most useful for performing compute operations on the GPU independently from the rest of the engine. */
        create_local_device(): RenderingDevice
        
        /** Sets the resource name for [param id] to [param name]. This is used for debugging with third-party tools such as [url=https://renderdoc.org/]RenderDoc[/url].  
         *  The following types of resources can be named: texture, sampler, vertex buffer, index buffer, uniform buffer, texture buffer, storage buffer, uniform set buffer, shader, render pipeline and compute pipeline. Framebuffers cannot be named. Attempting to name an incompatible resource type will print an error.  
         *      
         *  **Note:** Resource names are only set when the engine runs in verbose mode ([method OS.is_stdout_verbose] = `true`), or when using an engine build compiled with the `dev_mode=yes` SCons option. The graphics driver must also support the `VK_EXT_DEBUG_UTILS_EXTENSION_NAME` Vulkan extension for named resources to work.  
         */
        set_resource_name(id: RID, name: string): void
        
        /** Create a command buffer debug label region that can be displayed in third-party tools such as [url=https://renderdoc.org/]RenderDoc[/url]. All regions must be ended with a [method draw_command_end_label] call. When viewed from the linear series of submissions to a single queue, calls to [method draw_command_begin_label] and [method draw_command_end_label] must be matched and balanced.  
         *  The `VK_EXT_DEBUG_UTILS_EXTENSION_NAME` Vulkan extension must be available and enabled for command buffer debug label region to work. See also [method draw_command_end_label].  
         */
        draw_command_begin_label(name: string, color: Color): void
        
        /** This method does nothing. */
        draw_command_insert_label(name: string, color: Color): void
        
        /** Ends the command buffer debug label region started by a [method draw_command_begin_label] call. */
        draw_command_end_label(): void
        
        /** Returns the vendor of the video adapter (e.g. "NVIDIA Corporation"). Equivalent to [method RenderingServer.get_video_adapter_vendor]. See also [method get_device_name]. */
        get_device_vendor_name(): string
        
        /** Returns the name of the video adapter (e.g. "GeForce GTX 1080/PCIe/SSE2"). Equivalent to [method RenderingServer.get_video_adapter_name]. See also [method get_device_vendor_name]. */
        get_device_name(): string
        
        /** Returns the universally unique identifier for the pipeline cache. This is used to cache shader files on disk, which avoids shader recompilations on subsequent engine runs. This UUID varies depending on the graphics card model, but also the driver version. Therefore, updating graphics drivers will invalidate the shader cache. */
        get_device_pipeline_cache_uuid(): string
        
        /** Returns the memory usage in bytes corresponding to the given [param type]. When using Vulkan, these statistics are calculated by [url=https://github.com/GPUOpen-LibrariesAndSDKs/VulkanMemoryAllocator]Vulkan Memory Allocator[/url]. */
        get_memory_usage(type: RenderingDevice.MemoryType): int64
        
        /** Returns the unique identifier of the driver [param resource] for the specified [param rid]. Some driver resource types ignore the specified [param rid]. [param index] is always ignored but must be specified anyway. */
        get_driver_resource(resource: RenderingDevice.DriverResource, rid: RID, index: int64): int64
        
        /** Returns a string with a performance report from the past frame. Updates every frame. */
        get_perf_report(): string
        
        /** Returns string report in CSV format using the following methods:  
         *  - [method get_tracked_object_name]  
         *  - [method get_tracked_object_type_count]  
         *  - [method get_driver_total_memory]  
         *  - [method get_driver_allocation_count]  
         *  - [method get_driver_memory_by_object_type]  
         *  - [method get_driver_allocs_by_object_type]  
         *  - [method get_device_total_memory]  
         *  - [method get_device_allocation_count]  
         *  - [method get_device_memory_by_object_type]  
         *  - [method get_device_allocs_by_object_type]  
         *  This is only used by Vulkan in debug builds. Godot must also be started with the `--extra-gpu-memory-tracking` [url=https://docs.godotengine.org/en/4.5/tutorials/editor/command_line_tutorial.html]command line argument[/url].  
         */
        get_driver_and_device_memory_report(): string
        
        /** Returns the name of the type of object for the given [param type_index]. This value must be in range `[0; get_tracked_object_type_count - 1]`. If [method get_tracked_object_type_count] is 0, then type argument is ignored and always returns the same string.  
         *  The return value is important because it gives meaning to the types passed to [method get_driver_memory_by_object_type], [method get_driver_allocs_by_object_type], [method get_device_memory_by_object_type], and [method get_device_allocs_by_object_type]. Examples of strings it can return (not exhaustive):  
         *  - DEVICE_MEMORY  
         *  - PIPELINE_CACHE  
         *  - SWAPCHAIN_KHR  
         *  - COMMAND_POOL  
         *  Thus if e.g. `get_tracked_object_name(5)` returns "COMMAND_POOL", then `get_device_memory_by_object_type(5)` returns the bytes used by the GPU for command pools.  
         *  This is only used by Vulkan in debug builds. Godot must also be started with the `--extra-gpu-memory-tracking` [url=https://docs.godotengine.org/en/4.5/tutorials/editor/command_line_tutorial.html]command line argument[/url].  
         */
        get_tracked_object_name(type_index: int64): string
        
        /** Returns how many types of trackable objects there are.  
         *  This is only used by Vulkan in debug builds. Godot must also be started with the `--extra-gpu-memory-tracking` [url=https://docs.godotengine.org/en/4.5/tutorials/editor/command_line_tutorial.html]command line argument[/url].  
         */
        get_tracked_object_type_count(): int64
        
        /** Returns how much bytes the GPU driver is using for internal driver structures.  
         *  This is only used by Vulkan in debug builds and can return 0 when this information is not tracked or unknown.  
         */
        get_driver_total_memory(): int64
        
        /** Returns how many allocations the GPU driver has performed for internal driver structures.  
         *  This is only used by Vulkan in debug builds and can return 0 when this information is not tracked or unknown.  
         */
        get_driver_allocation_count(): int64
        
        /** Same as [method get_driver_total_memory] but filtered for a given object type.  
         *  The type argument must be in range `[0; get_tracked_object_type_count - 1]`. If [method get_tracked_object_type_count] is 0, then type argument is ignored and always returns 0.  
         *  This is only used by Vulkan in debug builds and can return 0 when this information is not tracked or unknown.  
         */
        get_driver_memory_by_object_type(type: int64): int64
        
        /** Same as [method get_driver_allocation_count] but filtered for a given object type.  
         *  The type argument must be in range `[0; get_tracked_object_type_count - 1]`. If [method get_tracked_object_type_count] is 0, then type argument is ignored and always returns 0.  
         *  This is only used by Vulkan in debug builds and can return 0 when this information is not tracked or unknown.  
         */
        get_driver_allocs_by_object_type(type: int64): int64
        
        /** Returns how much bytes the GPU is using.  
         *  This is only used by Vulkan in debug builds and can return 0 when this information is not tracked or unknown.  
         */
        get_device_total_memory(): int64
        
        /** Returns how many allocations the GPU has performed for internal driver structures.  
         *  This is only used by Vulkan in debug builds and can return 0 when this information is not tracked or unknown.  
         */
        get_device_allocation_count(): int64
        
        /** Same as [method get_device_total_memory] but filtered for a given object type.  
         *  The type argument must be in range `[0; get_tracked_object_type_count - 1]`. If [method get_tracked_object_type_count] is 0, then type argument is ignored and always returns 0.  
         *  This is only used by Vulkan in debug builds and can return 0 when this information is not tracked or unknown.  
         */
        get_device_memory_by_object_type(type: int64): int64
        
        /** Same as [method get_device_allocation_count] but filtered for a given object type.  
         *  The type argument must be in range `[0; get_tracked_object_type_count - 1]`. If [method get_tracked_object_type_count] is 0, then type argument is ignored and always returns 0.  
         *  This is only used by Vulkan in debug builds and can return 0 when this information is not tracked or unknown.  
         */
        get_device_allocs_by_object_type(type: int64): int64
        /** @deprecated Internal use. Does not exist at runtime. */
        __godotNameMap: __NameMapRenderingDevice;
    }
    namespace Resource {
        enum DeepDuplicateMode {
            /** No subresorces at all are duplicated. This is useful even in a deep duplication to have all the arrays and dictionaries duplicated but still pointing to the original resources. */
            DEEP_DUPLICATE_NONE = 0,
            
            /** Only subresources without a path or with a scene-local path will be duplicated. */
            DEEP_DUPLICATE_INTERNAL = 1,
            
            /** Every subresource found will be duplicated, even if it has a non-local path. In other words, even potentially big resources stored separately will be duplicated. */
            DEEP_DUPLICATE_ALL = 2,
        }
    }
    /** @deprecated Internal use. Does not exist at runtime. */
    interface __NameMapResource extends __NameMapRefCounted {
    }
    /** Base class for serializable objects.  
     *  	  
     *  @link https://docs.godotengine.org/en/4.5/classes/class_resource.html  
     */
    class Resource extends RefCounted {
        constructor(identifier?: any)
        /** Override this method to customize the newly duplicated resource created from [method PackedScene.instantiate], if the original's [member resource_local_to_scene] is set to `true`.  
         *  **Example:** Set a random `damage` value to every local resource from an instantiated scene:  
         *    
         */
        /* gdvirtual */ _setup_local_to_scene(): void
        
        /** Override this method to return a custom [RID] when [method get_rid] is called. */
        /* gdvirtual */ _get_rid(): RID
        
        /** For resources that store state in non-exported properties, such as via [method Object._validate_property] or [method Object._get_property_list], this method must be implemented to clear them. */
        /* gdvirtual */ _reset_state(): void
        
        /** Override this method to execute additional logic after [method set_path_cache] is called on this object. */
        /* gdvirtual */ _set_path_cache(path: string): void
        
        /** Sets the [member resource_path] to [param path], potentially overriding an existing cache entry for this path. Further attempts to load an overridden resource by path will instead return this resource. */
        take_over_path(path: string): void
        
        /** Sets the resource's path to [param path] without involving the resource cache. Useful for handling [enum ResourceFormatLoader.CacheMode] values when implementing a custom resource format by extending [ResourceFormatLoader] and [ResourceFormatSaver]. */
        set_path_cache(path: string): void
        
        /** Returns the [RID] of this resource (or an empty RID). Many resources (such as [Texture2D], [Mesh], and so on) are high-level abstractions of resources stored in a specialized server ([DisplayServer], [RenderingServer], etc.), so this function will return the original [RID]. */
        get_rid(): RID
        
        /** If [member resource_local_to_scene] is set to `true` and the resource has been loaded from a [PackedScene] instantiation, returns the root [Node] of the scene where this resource is used. Otherwise, returns `null`. */
        get_local_scene(): null | Node
        
        /** Calls [method _setup_local_to_scene]. If [member resource_local_to_scene] is set to `true`, this method is automatically called from [method PackedScene.instantiate] by the newly duplicated resource within the scene instance. */
        setup_local_to_scene(): void
        
        /** Makes the resource clear its non-exported properties. See also [method _reset_state]. Useful when implementing a custom resource format by extending [ResourceFormatLoader] and [ResourceFormatSaver]. */
        reset_state(): void
        
        /** In the internal cache for scene-unique IDs, sets the ID of this resource to [param id] for the scene at [param path]. If [param id] is empty, the cache entry for [param path] is cleared. Useful to keep scene-unique IDs the same when implementing a VCS-friendly custom resource format by extending [ResourceFormatLoader] and [ResourceFormatSaver].  
         *      
         *  **Note:** This method is only implemented when running in an editor context.  
         */
        set_id_for_path(path: string, id: string): void
        
        /** From the internal cache for scene-unique IDs, returns the ID of this resource for the scene at [param path]. If there is no entry, an empty string is returned. Useful to keep scene-unique IDs the same when implementing a VCS-friendly custom resource format by extending [ResourceFormatLoader] and [ResourceFormatSaver].  
         *      
         *  **Note:** This method is only implemented when running in an editor context. At runtime, it returns an empty string.  
         */
        get_id_for_path(path: string): string
        
        /** Returns `true` if the resource is saved on disk as a part of another resource's file. */
        is_built_in(): boolean
        
        /** Generates a unique identifier for a resource to be contained inside a [PackedScene], based on the current date, time, and a random value. The returned string is only composed of letters (`a` to `y`) and numbers (`0` to `8`). See also [member resource_scene_unique_id]. */
        static generate_scene_unique_id(): string
        
        /** Emits the [signal changed] signal. This method is called automatically for some built-in resources.  
         *      
         *  **Note:** For custom resources, it's recommended to call this method whenever a meaningful change occurs, such as a modified property. This ensures that custom [Object]s depending on the resource are properly updated.  
         *    
         */
        emit_changed(): void
        
        /** Duplicates this resource, returning a new resource with its `export`ed or [constant PROPERTY_USAGE_STORAGE] properties copied from the original.  
         *  If [param deep] is `false`, a **shallow** copy is returned: nested [Array], [Dictionary], and [Resource] properties are not duplicated and are shared with the original resource.  
         *  If [param deep] is `true`, a **deep** copy is returned: all nested arrays, dictionaries, and packed arrays are also duplicated (recursively). Any [Resource] found inside will only be duplicated if it's local, like [constant DEEP_DUPLICATE_INTERNAL] used with [method duplicate_deep].  
         *  The following exceptions apply:  
         *  - Subresource properties with the [constant PROPERTY_USAGE_ALWAYS_DUPLICATE] flag are always duplicated (recursively or not, depending on [param deep]).  
         *  - Subresource properties with the [constant PROPERTY_USAGE_NEVER_DUPLICATE] flag are never duplicated.  
         *      
         *  **Note:** For custom resources, this method will fail if [method Object._init] has been defined with required parameters.  
         *      
         *  **Note:** When duplicating with [param deep] set to `true`, each resource found, including the one on which this method is called, will be only duplicated once and referenced as many times as needed in the duplicate. For instance, if you are duplicating resource A that happens to have resource B referenced twice, you'll get a new resource A' referencing a new resource B' twice.  
         */
        duplicate(deep?: boolean /* = false */): this
        
        /** Duplicates this resource, deeply, like [method duplicate]`(true)`, with extra control over how subresources are handled.  
         *  [param deep_subresources_mode] must be one of the values from [enum DeepDuplicateMode].  
         */
        duplicate_deep(deep_subresources_mode?: Resource.DeepDuplicateMode /* = 1 */): null | Resource
        
        /** If `true`, the resource is duplicated for each instance of all scenes using it. At run-time, the resource can be modified in one scene without affecting other instances (see [method PackedScene.instantiate]).  
         *      
         *  **Note:** Changing this property at run-time has no effect on already created duplicate resources.  
         */
        get resource_local_to_scene(): boolean
        set resource_local_to_scene(value: boolean)
        
        /** The unique path to this resource. If it has been saved to disk, the value will be its filepath. If the resource is exclusively contained within a scene, the value will be the [PackedScene]'s filepath, followed by a unique identifier.  
         *      
         *  **Note:** Setting this property manually may fail if a resource with the same path has already been previously loaded. If necessary, use [method take_over_path].  
         */
        get resource_path(): string
        set resource_path(value: string)
        
        /** An optional name for this resource. When defined, its value is displayed to represent the resource in the Inspector dock. For built-in scripts, the name is displayed as part of the tab name in the script editor.  
         *      
         *  **Note:** Some resource formats do not support resource names. You can still set the name in the editor or via code, but it will be lost when the resource is reloaded. For example, only built-in scripts can have a resource name, while scripts stored in separate files cannot.  
         */
        get resource_name(): string
        set resource_name(value: string)
        
        /** A unique identifier relative to the this resource's scene. If left empty, the ID is automatically generated when this resource is saved inside a [PackedScene]. If the resource is not inside a scene, this property is empty by default.  
         *      
         *  **Note:** When the [PackedScene] is saved, if multiple resources in the same scene use the same ID, only the earliest resource in the scene hierarchy keeps the original ID. The other resources are assigned new IDs from [method generate_scene_unique_id].  
         *      
         *  **Note:** Setting this property does not emit the [signal changed] signal.  
         *  **Warning:** When setting, the ID must only consist of letters, numbers, and underscores. Otherwise, it will fail and default to a randomly generated ID.  
         */
        get resource_scene_unique_id(): string
        set resource_scene_unique_id(value: string)
        
        /** Emitted when the resource changes, usually when one of its properties is modified. See also [method emit_changed].  
         *      
         *  **Note:** This signal is not emitted automatically for properties of custom resources. If necessary, a setter needs to be created to emit the signal.  
         */
        readonly changed: Signal<() => void>
        
        /** Emitted by a newly duplicated resource with [member resource_local_to_scene] set to `true`. */
        readonly setup_local_to_scene_requested: Signal<() => void>
        /** @deprecated Internal use. Does not exist at runtime. */
        __godotNameMap: __NameMapResource;
    }
    namespace ResourceFormatLoader {
        enum CacheMode {
            /** Neither the main resource (the one requested to be loaded) nor any of its subresources are retrieved from cache nor stored into it. Dependencies (external resources) are loaded with [constant CACHE_MODE_REUSE]. */
            CACHE_MODE_IGNORE = 0,
            
            /** The main resource (the one requested to be loaded), its subresources, and its dependencies (external resources) are retrieved from cache if present, instead of loaded. Those not cached are loaded and then stored into the cache. The same rules are propagated recursively down the tree of dependencies (external resources). */
            CACHE_MODE_REUSE = 1,
            
            /** Like [constant CACHE_MODE_REUSE], but the cache is checked for the main resource (the one requested to be loaded) as well as for each of its subresources. Those already in the cache, as long as the loaded and cached types match, have their data refreshed from storage into the already existing instances. Otherwise, they are recreated as completely new objects. */
            CACHE_MODE_REPLACE = 2,
            
            /** Like [constant CACHE_MODE_IGNORE], but propagated recursively down the tree of dependencies (external resources). */
            CACHE_MODE_IGNORE_DEEP = 3,
            
            /** Like [constant CACHE_MODE_REPLACE], but propagated recursively down the tree of dependencies (external resources). */
            CACHE_MODE_REPLACE_DEEP = 4,
        }
    }
    /** @deprecated Internal use. Does not exist at runtime. */
    interface __NameMapResourceFormatLoader extends __NameMapRefCounted {
    }
    /** Loads a specific resource type from a file.  
     *  	  
     *  @link https://docs.godotengine.org/en/4.5/classes/class_resourceformatloader.html  
     */
    class ResourceFormatLoader extends RefCounted {
        constructor(identifier?: any)
        /** Gets the list of extensions for files this loader is able to read. */
        /* gdvirtual */ _get_recognized_extensions(): PackedStringArray
        
        /** Tells whether or not this loader should load a resource from its resource path for a given type.  
         *  If it is not implemented, the default behavior returns whether the path's extension is within the ones provided by [method _get_recognized_extensions], and if the type is within the ones provided by [method _get_resource_type].  
         */
        /* gdvirtual */ _recognize_path(path: string, type: StringName): boolean
        
        /** Tells which resource class this loader can load.  
         *      
         *  **Note:** Custom resource types defined by scripts aren't known by the [ClassDB], so you might just handle `"Resource"` for them.  
         */
        /* gdvirtual */ _handles_type(type: StringName): boolean
        
        /** Gets the class name of the resource associated with the given path. If the loader cannot handle it, it should return `""`.  
         *      
         *  **Note:** Custom resource types defined by scripts aren't known by the [ClassDB], so you might just return `"Resource"` for them.  
         */
        /* gdvirtual */ _get_resource_type(path: string): string
        
        /** Returns the script class name associated with the [Resource] under the given [param path]. If the resource has no script or the script isn't a named class, it should return `""`. */
        /* gdvirtual */ _get_resource_script_class(path: string): string
        
        /** Should return the unique ID for the resource associated with the given path. If this method is not overridden, a `.uid` file is generated along with the resource file, containing the unique ID. */
        /* gdvirtual */ _get_resource_uid(path: string): int64
        
        /** Should return the dependencies for the resource at the given [param path]. Each dependency is a string composed of one to three sections separated by `::`, with trailing empty sections omitted:  
         *  - The first section should contain the UID if the resource has one. Otherwise, it should contain the file path.  
         *  - The second section should contain the class name of the dependency if [param add_types] is `true`. Otherwise, it should be empty.  
         *  - The third section should contain the fallback path if the resource has a UID. Otherwise, it should be empty.  
         *    
         *      
         *  **Note:** Custom resource types defined by scripts aren't known by the [ClassDB], so `"Resource"` can be used for the class name.  
         */
        /* gdvirtual */ _get_dependencies(path: string, add_types: boolean): PackedStringArray
        
        /** If implemented, renames dependencies within the given resource and saves it. [param renames] is a dictionary `{ String => String }` mapping old dependency paths to new paths.  
         *  Returns [constant OK] on success, or an [enum Error] constant in case of failure.  
         */
        /* gdvirtual */ _rename_dependencies(path: string, renames: GDictionary): Error
        /* gdvirtual */ _exists(path: string): boolean
        /* gdvirtual */ _get_classes_used(path: string): PackedStringArray
        
        /** Loads a resource when the engine finds this loader to be compatible. If the loaded resource is the result of an import, [param original_path] will target the source file. Returns a [Resource] object on success, or an [enum Error] constant in case of failure.  
         *  The [param cache_mode] property defines whether and how the cache should be used or updated when loading the resource. See [enum CacheMode] for details.  
         */
        /* gdvirtual */ _load(path: string, original_path: string, use_sub_threads: boolean, cache_mode: int64): any
        /** @deprecated Internal use. Does not exist at runtime. */
        __godotNameMap: __NameMapResourceFormatLoader;
    }
    /** @deprecated Internal use. Does not exist at runtime. */
    interface __NameMapResourceFormatSaver extends __NameMapRefCounted {
    }
    /** Saves a specific resource type to a file.  
     *  	  
     *  @link https://docs.godotengine.org/en/4.5/classes/class_resourceformatsaver.html  
     */
    class ResourceFormatSaver extends RefCounted {
        constructor(identifier?: any)
        /** Saves the given resource object to a file at the target [param path]. [param flags] is a bitmask composed with [enum ResourceSaver.SaverFlags] constants.  
         *  Returns [constant OK] on success, or an [enum Error] constant in case of failure.  
         */
        /* gdvirtual */ _save(resource: Resource, path: string, flags: int64): Error
        
        /** Sets a new UID for the resource at the given [param path]. Returns [constant OK] on success, or an [enum Error] constant in case of failure. */
        /* gdvirtual */ _set_uid(path: string, uid: int64): Error
        
        /** Returns whether the given resource object can be saved by this saver. */
        /* gdvirtual */ _recognize(resource: Resource): boolean
        
        /** Returns the list of extensions available for saving the resource object, provided it is recognized (see [method _recognize]). */
        /* gdvirtual */ _get_recognized_extensions(resource: Resource): PackedStringArray
        
        /** Returns `true` if this saver handles a given save path and `false` otherwise.  
         *  If this method is not implemented, the default behavior returns whether the path's extension is within the ones provided by [method _get_recognized_extensions].  
         */
        /* gdvirtual */ _recognize_path(resource: Resource, path: string): boolean
        /** @deprecated Internal use. Does not exist at runtime. */
        __godotNameMap: __NameMapResourceFormatSaver;
    }
    namespace ResourceImporter {
        enum ImportOrder {
            /** The default import order. */
            IMPORT_ORDER_DEFAULT = 0,
            
            /** The import order for scenes, which ensures scenes are imported  *after*  all other core resources such as textures. Custom importers should generally have an import order lower than `100` to avoid issues when importing scenes that rely on custom resources. */
            IMPORT_ORDER_SCENE = 100,
        }
    }
    /** @deprecated Internal use. Does not exist at runtime. */
    interface __NameMapResourceImporter extends __NameMapRefCounted {
    }
    /** Base class for resource importers.  
     *  	  
     *  @link https://docs.godotengine.org/en/4.5/classes/class_resourceimporter.html  
     */
    class ResourceImporter extends RefCounted {
        constructor(identifier?: any)
        /** Called when the engine compilation profile editor wants to check what build options an imported resource needs. For example, [ResourceImporterDynamicFont] has a property called [member ResourceImporterDynamicFont.multichannel_signed_distance_field], that depends on the engine to be build with the "msdfgen" module. If that resource happened to be a custom one, it would be handled like this:  
         *    
         */
        /* gdvirtual */ _get_build_dependencies(path: string): PackedStringArray
        /** @deprecated Internal use. Does not exist at runtime. */
        __godotNameMap: __NameMapResourceImporter;
    }
    /** @deprecated Internal use. Does not exist at runtime. */
    interface __NameMapResourceImporterBMFont extends __NameMapResourceImporter {
    }
    /** Imports a bitmap font in the BMFont (`.fnt`) format.  
     *  	  
     *  @link https://docs.godotengine.org/en/4.5/classes/class_resourceimporterbmfont.html  
     */
    class ResourceImporterBMFont extends ResourceImporter {
        constructor(identifier?: any)
        /** @deprecated Internal use. Does not exist at runtime. */
        __godotNameMap: __NameMapResourceImporterBMFont;
    }
    /** @deprecated Internal use. Does not exist at runtime. */
    interface __NameMapResourceImporterBitMap extends __NameMapResourceImporter {
    }
    /** Imports a [BitMap] resource (2D array of boolean values).  
     *  	  
     *  @link https://docs.godotengine.org/en/4.5/classes/class_resourceimporterbitmap.html  
     */
    class ResourceImporterBitMap extends ResourceImporter {
        constructor(identifier?: any)
        /** @deprecated Internal use. Does not exist at runtime. */
        __godotNameMap: __NameMapResourceImporterBitMap;
    }
    /** @deprecated Internal use. Does not exist at runtime. */
    interface __NameMapResourceImporterCSVTranslation extends __NameMapResourceImporter {
    }
    /** Imports comma-separated values  
     *  	  
     *  @link https://docs.godotengine.org/en/4.5/classes/class_resourceimportercsvtranslation.html  
     */
    class ResourceImporterCSVTranslation extends ResourceImporter {
        constructor(identifier?: any)
        /** @deprecated Internal use. Does not exist at runtime. */
        __godotNameMap: __NameMapResourceImporterCSVTranslation;
    }
    /** @deprecated Internal use. Does not exist at runtime. */
    interface __NameMapResourceImporterDynamicFont extends __NameMapResourceImporter {
    }
    /** Imports a TTF, TTC, OTF, OTC, WOFF or WOFF2 font file for font rendering that adapts to any size.  
     *  	  
     *  @link https://docs.godotengine.org/en/4.5/classes/class_resourceimporterdynamicfont.html  
     */
    class ResourceImporterDynamicFont extends ResourceImporter {
        constructor(identifier?: any)
        /** @deprecated Internal use. Does not exist at runtime. */
        __godotNameMap: __NameMapResourceImporterDynamicFont;
    }
    /** @deprecated Internal use. Does not exist at runtime. */
    interface __NameMapResourceImporterImage extends __NameMapResourceImporter {
    }
    /** Imports an image for use in scripting, with no rendering capabilities.  
     *  	  
     *  @link https://docs.godotengine.org/en/4.5/classes/class_resourceimporterimage.html  
     */
    class ResourceImporterImage extends ResourceImporter {
        constructor(identifier?: any)
        /** @deprecated Internal use. Does not exist at runtime. */
        __godotNameMap: __NameMapResourceImporterImage;
    }
    /** @deprecated Internal use. Does not exist at runtime. */
    interface __NameMapResourceImporterImageFont extends __NameMapResourceImporter {
    }
    /** Imports a bitmap font where all glyphs have the same width and height.  
     *  	  
     *  @link https://docs.godotengine.org/en/4.5/classes/class_resourceimporterimagefont.html  
     */
    class ResourceImporterImageFont extends ResourceImporter {
        constructor(identifier?: any)
        /** @deprecated Internal use. Does not exist at runtime. */
        __godotNameMap: __NameMapResourceImporterImageFont;
    }
    /** @deprecated Internal use. Does not exist at runtime. */
    interface __NameMapResourceImporterLayeredTexture extends __NameMapResourceImporter {
    }
    /** Imports a 3-dimensional texture ([Texture3D]), a [Texture2DArray], a [Cubemap] or a [CubemapArray].  
     *  	  
     *  @link https://docs.godotengine.org/en/4.5/classes/class_resourceimporterlayeredtexture.html  
     */
    class ResourceImporterLayeredTexture extends ResourceImporter {
        constructor(identifier?: any)
        /** @deprecated Internal use. Does not exist at runtime. */
        __godotNameMap: __NameMapResourceImporterLayeredTexture;
    }
    /** @deprecated Internal use. Does not exist at runtime. */
    interface __NameMapResourceImporterMP3 extends __NameMapResourceImporter {
    }
    /** Imports an MP3 audio file for playback.  
     *  	  
     *  @link https://docs.godotengine.org/en/4.5/classes/class_resourceimportermp3.html  
     */
    class ResourceImporterMP3 extends ResourceImporter {
        constructor(identifier?: any)
        /** @deprecated Internal use. Does not exist at runtime. */
        __godotNameMap: __NameMapResourceImporterMP3;
    }
    /** @deprecated Internal use. Does not exist at runtime. */
    interface __NameMapResourceImporterOBJ extends __NameMapResourceImporter {
    }
    /** Imports an OBJ 3D model as an independent [Mesh] or scene.  
     *  	  
     *  @link https://docs.godotengine.org/en/4.5/classes/class_resourceimporterobj.html  
     */
    class ResourceImporterOBJ extends ResourceImporter {
        constructor(identifier?: any)
        /** @deprecated Internal use. Does not exist at runtime. */
        __godotNameMap: __NameMapResourceImporterOBJ;
    }
    /** @deprecated Internal use. Does not exist at runtime. */
    interface __NameMapResourceImporterOggVorbis extends __NameMapResourceImporter {
    }
    /** Imports an Ogg Vorbis audio file for playback.  
     *  	  
     *  @link https://docs.godotengine.org/en/4.5/classes/class_resourceimporteroggvorbis.html  
     */
    class ResourceImporterOggVorbis extends ResourceImporter {
        constructor(identifier?: any)
        /** Creates a new [AudioStreamOggVorbis] instance from the given buffer. The buffer must contain Ogg Vorbis data. */
        static load_from_buffer(stream_data: PackedByteArray | byte[] | ArrayBuffer): null | AudioStreamOggVorbis
        
        /** Creates a new [AudioStreamOggVorbis] instance from the given file path. The file must be in Ogg Vorbis format. */
        static load_from_file(path: string): null | AudioStreamOggVorbis
        /** @deprecated Internal use. Does not exist at runtime. */
        __godotNameMap: __NameMapResourceImporterOggVorbis;
    }
    /** @deprecated Internal use. Does not exist at runtime. */
    interface __NameMapResourceImporterSVG extends __NameMapResourceImporter {
    }
    /** Imports an SVG file as an automatically scalable texture for use in UI elements and 2D rendering.  
     *  	  
     *  @link https://docs.godotengine.org/en/4.5/classes/class_resourceimportersvg.html  
     */
    class ResourceImporterSVG extends ResourceImporter {
        constructor(identifier?: any)
        /** @deprecated Internal use. Does not exist at runtime. */
        __godotNameMap: __NameMapResourceImporterSVG;
    }
    /** @deprecated Internal use. Does not exist at runtime. */
    interface __NameMapResourceImporterScene extends __NameMapResourceImporter {
    }
    /** Imports a glTF, FBX, COLLADA, or Blender 3D scene.  
     *  	  
     *  @link https://docs.godotengine.org/en/4.5/classes/class_resourceimporterscene.html  
     */
    class ResourceImporterScene extends ResourceImporter {
        constructor(identifier?: any)
        /** @deprecated Internal use. Does not exist at runtime. */
        __godotNameMap: __NameMapResourceImporterScene;
    }
    /** @deprecated Internal use. Does not exist at runtime. */
    interface __NameMapResourceImporterShaderFile extends __NameMapResourceImporter {
    }
    /** Imports native GLSL shaders (not Godot shaders) as an [RDShaderFile].  
     *  	  
     *  @link https://docs.godotengine.org/en/4.5/classes/class_resourceimportershaderfile.html  
     */
    class ResourceImporterShaderFile extends ResourceImporter {
        constructor(identifier?: any)
        /** @deprecated Internal use. Does not exist at runtime. */
        __godotNameMap: __NameMapResourceImporterShaderFile;
    }
    /** @deprecated Internal use. Does not exist at runtime. */
    interface __NameMapResourceImporterTexture extends __NameMapResourceImporter {
    }
    /** Imports an image for use in 2D or 3D rendering.  
     *  	  
     *  @link https://docs.godotengine.org/en/4.5/classes/class_resourceimportertexture.html  
     */
    class ResourceImporterTexture extends ResourceImporter {
        constructor(identifier?: any)
        /** @deprecated Internal use. Does not exist at runtime. */
        __godotNameMap: __NameMapResourceImporterTexture;
    }
    /** @deprecated Internal use. Does not exist at runtime. */
    interface __NameMapResourceImporterTextureAtlas extends __NameMapResourceImporter {
    }
    /** Imports a collection of textures from a PNG image into an optimized [AtlasTexture] for 2D rendering.  
     *  	  
     *  @link https://docs.godotengine.org/en/4.5/classes/class_resourceimportertextureatlas.html  
     */
    class ResourceImporterTextureAtlas extends ResourceImporter {
        constructor(identifier?: any)
        /** @deprecated Internal use. Does not exist at runtime. */
        __godotNameMap: __NameMapResourceImporterTextureAtlas;
    }
    /** @deprecated Internal use. Does not exist at runtime. */
    interface __NameMapResourceImporterWAV extends __NameMapResourceImporter {
    }
    /** Imports a WAV audio file for playback.  
     *  	  
     *  @link https://docs.godotengine.org/en/4.5/classes/class_resourceimporterwav.html  
     */
    class ResourceImporterWAV extends ResourceImporter {
        constructor(identifier?: any)
        /** @deprecated Internal use. Does not exist at runtime. */
        __godotNameMap: __NameMapResourceImporterWAV;
    }
    /** @deprecated Internal use. Does not exist at runtime. */
    interface __NameMapResourcePreloader extends __NameMapNode {
    }
    /** A node used to preload sub-resources inside a scene.  
     *  	  
     *  @link https://docs.godotengine.org/en/4.5/classes/class_resourcepreloader.html  
     */
    class ResourcePreloader<Map extends NodePathMap = any> extends Node<Map> {
        constructor(identifier?: any)
        /** Adds a resource to the preloader with the given [param name]. If a resource with the given [param name] already exists, the new resource will be renamed to "[param name] N" where N is an incrementing number starting from 2. */
        add_resource(name: StringName, resource: Resource): void
        
        /** Removes the resource associated to [param name] from the preloader. */
        remove_resource(name: StringName): void
        
        /** Renames a resource inside the preloader from [param name] to [param newname]. */
        rename_resource(name: StringName, newname: StringName): void
        
        /** Returns `true` if the preloader contains a resource associated to [param name]. */
        has_resource(name: StringName): boolean
        
        /** Returns the resource associated to [param name]. */
        get_resource(name: StringName): null | Resource
        
        /** Returns the list of resources inside the preloader. */
        get_resource_list(): PackedStringArray
        get resources(): GArray
        set resources(value: GArray)
        /** @deprecated Internal use. Does not exist at runtime. */
        __godotNameMap: __NameMapResourcePreloader;
    }
    namespace RetargetModifier3D {
        enum TransformFlag {
            /** If set, allows to retarget the position. */
            TRANSFORM_FLAG_POSITION = 1,
            
            /** If set, allows to retarget the rotation. */
            TRANSFORM_FLAG_ROTATION = 2,
            
            /** If set, allows to retarget the scale. */
            TRANSFORM_FLAG_SCALE = 4,
            
            /** If set, allows to retarget the position/rotation/scale. */
            TRANSFORM_FLAG_ALL = 7,
        }
    }
    /** @deprecated Internal use. Does not exist at runtime. */
    interface __NameMapRetargetModifier3D extends __NameMapSkeletonModifier3D {
    }
    /** A modifier to transfer parent skeleton poses (or global poses) to child skeletons in model space with different rests.  
     *  	  
     *  @link https://docs.godotengine.org/en/4.5/classes/class_retargetmodifier3d.html  
     */
    class RetargetModifier3D<Map extends NodePathMap = any> extends SkeletonModifier3D<Map> {
        constructor(identifier?: any)
        /** Sets [constant TRANSFORM_FLAG_POSITION] into [member enable]. */
        set_position_enabled(enabled: boolean): void
        
        /** Returns `true` if [member enable] has [constant TRANSFORM_FLAG_POSITION]. */
        is_position_enabled(): boolean
        
        /** Sets [constant TRANSFORM_FLAG_ROTATION] into [member enable]. */
        set_rotation_enabled(enabled: boolean): void
        
        /** Returns `true` if [member enable] has [constant TRANSFORM_FLAG_ROTATION]. */
        is_rotation_enabled(): boolean
        
        /** Sets [constant TRANSFORM_FLAG_SCALE] into [member enable]. */
        set_scale_enabled(enabled: boolean): void
        
        /** Returns `true` if [member enable] has [constant TRANSFORM_FLAG_SCALE]. */
        is_scale_enabled(): boolean
        
        /** [SkeletonProfile] for retargeting bones with names matching the bone list. */
        get profile(): null | SkeletonProfile
        set profile(value: null | SkeletonProfile)
        
        /** If `false`, in case the target skeleton has fewer bones than the source skeleton, the source bone parent's transform will be ignored.  
         *  Instead, it is possible to retarget between models with different body shapes, and position, rotation, and scale can be retargeted separately.  
         *  If `true`, retargeting is performed taking into account global pose.  
         *  In case the target skeleton has fewer bones than the source skeleton, the source bone parent's transform is taken into account. However, bone length between skeletons must match exactly, if not, the bones will be forced to expand or shrink.  
         *  This is useful for using dummy bone with length `0` to match postures when retargeting between models with different number of bones.  
         */
        get use_global_pose(): boolean
        set use_global_pose(value: boolean)
        
        /** Flags to control the process of the transform elements individually when [member use_global_pose] is disabled. */
        get enable(): int64
        set enable(value: int64)
        /** @deprecated Internal use. Does not exist at runtime. */
        __godotNameMap: __NameMapRetargetModifier3D;
    }
    namespace RibbonTrailMesh {
        enum Shape {
            /** Gives the mesh a single flat face. */
            SHAPE_FLAT = 0,
            
            /** Gives the mesh two perpendicular flat faces, making a cross shape. */
            SHAPE_CROSS = 1,
        }
    }
    /** @deprecated Internal use. Does not exist at runtime. */
    interface __NameMapRibbonTrailMesh extends __NameMapPrimitiveMesh {
    }
    /** Represents a straight ribbon-shaped [PrimitiveMesh] with variable width.  
     *  	  
     *  @link https://docs.godotengine.org/en/4.5/classes/class_ribbontrailmesh.html  
     */
    class RibbonTrailMesh extends PrimitiveMesh {
        constructor(identifier?: any)
        /** Determines the shape of the ribbon. */
        get shape(): int64
        set shape(value: int64)
        
        /** The baseline size of the ribbon. The size of a particular section segment is obtained by multiplying this size by the value of the [member curve] at the given distance. */
        get size(): float64
        set size(value: float64)
        
        /** The total number of sections on the ribbon. */
        get sections(): int64
        set sections(value: int64)
        
        /** The length of a section of the ribbon. */
        get section_length(): float64
        set section_length(value: float64)
        
        /** The number of segments in a section. The [member curve] is sampled on each segment to determine its size. Higher values result in a more detailed ribbon at the cost of performance. */
        get section_segments(): int64
        set section_segments(value: int64)
        
        /** Determines the size of the ribbon along its length. The size of a particular section segment is obtained by multiplying the baseline [member size] by the value of this curve at the given distance. For values smaller than `0`, the faces will be inverted. Should be a unit [Curve]. */
        get curve(): null | Curve
        set curve(value: null | Curve)
        /** @deprecated Internal use. Does not exist at runtime. */
        __godotNameMap: __NameMapRibbonTrailMesh;
    }
    /** @deprecated Internal use. Does not exist at runtime. */
    interface __NameMapRichTextEffect extends __NameMapResource {
    }
    /** A custom effect for a [RichTextLabel].  
     *  	  
     *  @link https://docs.godotengine.org/en/4.5/classes/class_richtexteffect.html  
     */
    class RichTextEffect extends Resource {
        constructor(identifier?: any)
        /** Override this method to modify properties in [param char_fx]. The method must return `true` if the character could be transformed successfully. If the method returns `false`, it will skip transformation to avoid displaying broken text. */
        /* gdvirtual */ _process_custom_fx(char_fx: CharFXTransform): boolean
        /** @deprecated Internal use. Does not exist at runtime. */
        __godotNameMap: __NameMapRichTextEffect;
    }
    namespace RichTextLabel {
        enum ListType {
            /** Each list item has a number marker. */
            LIST_NUMBERS = 0,
            
            /** Each list item has a letter marker. */
            LIST_LETTERS = 1,
            
            /** Each list item has a roman number marker. */
            LIST_ROMAN = 2,
            
            /** Each list item has a filled circle marker. */
            LIST_DOTS = 3,
        }
        enum MenuItems {
            /** Copies the selected text. */
            MENU_COPY = 0,
            
            /** Selects the whole [RichTextLabel] text. */
            MENU_SELECT_ALL = 1,
            
            /** Represents the size of the [enum MenuItems] enum. */
            MENU_MAX = 2,
        }
        enum MetaUnderline {
            /** Meta tag does not display an underline, even if [member meta_underlined] is `true`. */
            META_UNDERLINE_NEVER = 0,
            
            /** If [member meta_underlined] is `true`, meta tag always display an underline. */
            META_UNDERLINE_ALWAYS = 1,
            
            /** If [member meta_underlined] is `true`, meta tag display an underline when the mouse cursor is over it. */
            META_UNDERLINE_ON_HOVER = 2,
        }
        enum ImageUpdateMask {
            /** If this bit is set, [method update_image] changes image texture. */
            UPDATE_TEXTURE = 1,
            
            /** If this bit is set, [method update_image] changes image size. */
            UPDATE_SIZE = 2,
            
            /** If this bit is set, [method update_image] changes image color. */
            UPDATE_COLOR = 4,
            
            /** If this bit is set, [method update_image] changes image inline alignment. */
            UPDATE_ALIGNMENT = 8,
            
            /** If this bit is set, [method update_image] changes image texture region. */
            UPDATE_REGION = 16,
            
            /** If this bit is set, [method update_image] changes image padding. */
            UPDATE_PAD = 32,
            
            /** If this bit is set, [method update_image] changes image tooltip. */
            UPDATE_TOOLTIP = 64,
            
            /** If this bit is set, [method update_image] changes image width from/to percents. */
            UPDATE_WIDTH_IN_PERCENT = 128,
        }
    }
    /** @deprecated Internal use. Does not exist at runtime. */
    interface __NameMapRichTextLabel extends __NameMapControl {
    }
    /** A control for displaying text that can contain different font styles, images, and basic formatting.  
     *  	  
     *  @link https://docs.godotengine.org/en/4.5/classes/class_richtextlabel.html  
     */
    class RichTextLabel<Map extends NodePathMap = any> extends Control<Map> {
        constructor(identifier?: any)
        /** Returns the text without BBCode mark-up. */
        get_parsed_text(): string
        
        /** Adds raw non-BBCode-parsed text to the tag stack. */
        add_text(text: string): void
        
        /** Adds a horizontal rule that can be used to separate content.  
         *  If [param width_in_percent] is set, [param width] values are percentages of the control width instead of pixels.  
         *  If [param height_in_percent] is set, [param height] values are percentages of the control width instead of pixels.  
         */
        add_hr(width?: int64 /* = 90 */, height?: int64 /* = 2 */, color?: Color /* = new Color(1, 1, 1, 1) */, alignment?: HorizontalAlignment /* = 1 */, width_in_percent?: boolean /* = true */, height_in_percent?: boolean /* = false */): void
        
        /** Adds an image's opening and closing tags to the tag stack, optionally providing a [param width] and [param height] to resize the image, a [param color] to tint the image and a [param region] to only use parts of the image.  
         *  If [param width] or [param height] is set to 0, the image size will be adjusted in order to keep the original aspect ratio.  
         *  If [param width] and [param height] are not set, but [param region] is, the region's rect will be used.  
         *  [param key] is an optional identifier, that can be used to modify the image via [method update_image].  
         *  If [param pad] is set, and the image is smaller than the size specified by [param width] and [param height], the image padding is added to match the size instead of upscaling.  
         *  If [param width_in_percent] is set, [param width] values are percentages of the control width instead of pixels.  
         *  If [param height_in_percent] is set, [param height] values are percentages of the control width instead of pixels.  
         *  [param alt_text] is used as the image description for assistive apps.  
         */
        add_image(image: Texture2D, width?: int64 /* = 0 */, height?: int64 /* = 0 */, color?: Color /* = new Color(1, 1, 1, 1) */, inline_align?: InlineAlignment /* = 5 */, region?: Rect2 /* = new Rect2(0, 0, 0, 0) */, key?: any /* = <any> {} */, pad?: boolean /* = false */, tooltip?: string /* = '' */, width_in_percent?: boolean /* = false */, height_in_percent?: boolean /* = false */, alt_text?: string /* = '' */): void
        
        /** Updates the existing images with the key [param key]. Only properties specified by [param mask] bits are updated. See [method add_image]. */
        update_image(key: any, mask: RichTextLabel.ImageUpdateMask, image: Texture2D, width?: int64 /* = 0 */, height?: int64 /* = 0 */, color?: Color /* = new Color(1, 1, 1, 1) */, inline_align?: InlineAlignment /* = 5 */, region?: Rect2 /* = new Rect2(0, 0, 0, 0) */, pad?: boolean /* = false */, tooltip?: string /* = '' */, width_in_percent?: boolean /* = false */, height_in_percent?: boolean /* = false */): void
        
        /** Adds a newline tag to the tag stack. */
        newline(): void
        
        /** Removes a paragraph of content from the label. Returns `true` if the paragraph exists.  
         *  The [param paragraph] argument is the index of the paragraph to remove, it can take values in the interval `[0, get_paragraph_count() - 1]`.  
         *  If [param no_invalidate] is set to `true`, cache for the subsequent paragraphs is not invalidated. Use it for faster updates if deleted paragraph is fully self-contained (have no unclosed tags), or this call is part of the complex edit operation and [method invalidate_paragraph] will be called at the end of operation.  
         */
        remove_paragraph(paragraph: int64, no_invalidate?: boolean /* = false */): boolean
        
        /** Invalidates [param paragraph] and all subsequent paragraphs cache. */
        invalidate_paragraph(paragraph: int64): boolean
        
        /** Adds a [code skip-lint][font]` tag to the tag stack. Overrides default fonts for its duration.  
         *  Passing `0` to [param font_size] will use the existing default font size.  
         */
        push_font(font: Font, font_size?: int64 /* = 0 */): void
        
        /** Adds a [code skip-lint][font_size]` tag to the tag stack. Overrides default font size for its duration. */
        push_font_size(font_size: int64): void
        
        /** Adds a [code skip-lint][font]` tag with a normal font to the tag stack. */
        push_normal(): void
        
        /** Adds a [code skip-lint][font]` tag with a bold font to the tag stack. This is the same as adding a [code skip-lint]**` tag if not currently in a [code skip-lint] *` tag. */
        push_bold(): void
        
        /** Adds a [code skip-lint][font]` tag with a bold italics font to the tag stack. */
        push_bold_italics(): void
        
        /** Adds a [code skip-lint][font]` tag with an italics font to the tag stack. This is the same as adding an [code skip-lint] *` tag if not currently in a [code skip-lint]**` tag. */
        push_italics(): void
        
        /** Adds a [code skip-lint][font]` tag with a monospace font to the tag stack. */
        push_mono(): void
        
        /** Adds a [code skip-lint][color]` tag to the tag stack. */
        push_color(color: Color): void
        
        /** Adds a [code skip-lint][outline_size]` tag to the tag stack. Overrides default text outline size for its duration. */
        push_outline_size(outline_size: int64): void
        
        /** Adds a [code skip-lint][outline_color]` tag to the tag stack. Adds text outline for its duration. */
        push_outline_color(color: Color): void
        
        /** Adds a [code skip-lint][p]` tag to the tag stack. */
        push_paragraph(alignment: HorizontalAlignment, base_direction?: Control.TextDirection /* = 0 */, language?: string /* = '' */, st_parser?: TextServer.StructuredTextParser /* = 0 */, justification_flags?: TextServer.JustificationFlag /* = 163 */, tab_stops?: PackedFloat32Array | float32[] /* = [] */): void
        
        /** Adds an [code skip-lint][indent]` tag to the tag stack. Multiplies [param level] by current [member tab_size] to determine new margin length. */
        push_indent(level: int64): void
        
        /** Adds [code skip-lint][ol]` or [code skip-lint][ul]` tag to the tag stack. Multiplies [param level] by current [member tab_size] to determine new margin length. */
        push_list(level: int64, type: RichTextLabel.ListType, capitalize: boolean, bullet?: string /* = '•' */): void
        
        /** Adds a meta tag to the tag stack. Similar to the BBCode [code skip-lint][url=something]{text}[/url]`, but supports non-[String] metadata types.  
         *  If [member meta_underlined] is `true`, meta tags display an underline. This behavior can be customized with [param underline_mode].  
         *      
         *  **Note:** Meta tags do nothing by default when clicked. To assign behavior when clicked, connect [signal meta_clicked] to a function that is called when the meta tag is clicked.  
         */
        push_meta(data: any, underline_mode?: RichTextLabel.MetaUnderline /* = 1 */, tooltip?: string /* = '' */): void
        
        /** Adds a [code skip-lint][hint]` tag to the tag stack. Same as BBCode [code skip-lint][hint=something]{text}[/hint]`. */
        push_hint(description: string): void
        
        /** Adds language code used for text shaping algorithm and Open-Type font features. */
        push_language(language: string): void
        
        /** Adds a [code skip-lint][u]` tag to the tag stack. If [param color] alpha value is zero, current font color with alpha multiplied by [theme_item underline_alpha] is used. */
        push_underline(color?: Color /* = new Color(0, 0, 0, 0) */): void
        
        /** Adds a [code skip-lint][s]` tag to the tag stack. If [param color] alpha value is zero, current font color with alpha multiplied by [theme_item strikethrough_alpha] is used. */
        push_strikethrough(color?: Color /* = new Color(0, 0, 0, 0) */): void
        
        /** Adds a [code skip-lint][table=columns,inline_align]` tag to the tag stack. Use [method set_table_column_expand] to set column expansion ratio. Use [method push_cell] to add cells. [param name] is used as the table name for assistive apps. */
        push_table(columns: int64, inline_align?: InlineAlignment /* = 0 */, align_to_row?: int64 /* = -1 */, name?: string /* = '' */): void
        
        /** Adds a [code skip-lint][dropcap]` tag to the tag stack. Drop cap (dropped capital) is a decorative element at the beginning of a paragraph that is larger than the rest of the text. */
        push_dropcap(string_: string, font: Font, size: int64, dropcap_margins?: Rect2 /* = new Rect2(0, 0, 0, 0) */, color?: Color /* = new Color(1, 1, 1, 1) */, outline_size?: int64 /* = 0 */, outline_color?: Color /* = new Color(0, 0, 0, 0) */): void
        
        /** Edits the selected column's expansion options. If [param expand] is `true`, the column expands in proportion to its expansion ratio versus the other columns' ratios.  
         *  For example, 2 columns with ratios 3 and 4 plus 70 pixels in available width would expand 30 and 40 pixels, respectively.  
         *  If [param expand] is `false`, the column will not contribute to the total ratio.  
         */
        set_table_column_expand(column: int64, expand: boolean, ratio?: int64 /* = 1 */, shrink?: boolean /* = true */): void
        
        /** Sets table column name for assistive apps. */
        set_table_column_name(column: int64, name: string): void
        
        /** Sets color of a table cell. Separate colors for alternating rows can be specified. */
        set_cell_row_background_color(odd_row_bg: Color, even_row_bg: Color): void
        
        /** Sets color of a table cell border. */
        set_cell_border_color(color: Color): void
        
        /** Sets minimum and maximum size overrides for a table cell. */
        set_cell_size_override(min_size: Vector2, max_size: Vector2): void
        
        /** Sets inner padding of a table cell. */
        set_cell_padding(padding: Rect2): void
        
        /** Adds a [code skip-lint][cell]` tag to the tag stack. Must be inside a [code skip-lint][table]` tag. See [method push_table] for details. Use [method set_table_column_expand] to set column expansion ratio, [method set_cell_border_color] to set cell border, [method set_cell_row_background_color] to set cell background, [method set_cell_size_override] to override cell size, and [method set_cell_padding] to set padding. */
        push_cell(): void
        
        /** Adds a [code skip-lint][fgcolor]` tag to the tag stack.  
         *      
         *  **Note:** The foreground color has padding applied by default, which is controlled using [theme_item text_highlight_h_padding] and [theme_item text_highlight_v_padding]. This can lead to overlapping highlights if foreground colors are placed on neighboring lines/columns, so consider setting those theme items to `0` if you want to avoid this.  
         */
        push_fgcolor(fgcolor: Color): void
        
        /** Adds a [code skip-lint][bgcolor]` tag to the tag stack.  
         *      
         *  **Note:** The background color has padding applied by default, which is controlled using [theme_item text_highlight_h_padding] and [theme_item text_highlight_v_padding]. This can lead to overlapping highlights if background colors are placed on neighboring lines/columns, so consider setting those theme items to `0` if you want to avoid this.  
         */
        push_bgcolor(bgcolor: Color): void
        
        /** Adds a custom effect tag to the tag stack. The effect does not need to be in [member custom_effects]. The environment is directly passed to the effect. */
        push_customfx(effect: RichTextEffect, env: GDictionary): void
        
        /** Adds a context marker to the tag stack. See [method pop_context]. */
        push_context(): void
        
        /** Terminates tags opened after the last [method push_context] call (including context marker), or all tags if there's no context marker on the stack. */
        pop_context(): void
        
        /** Terminates the current tag. Use after `push_*` methods to close BBCodes manually. Does not need to follow `add_*` methods. */
        pop(): void
        
        /** Terminates all tags opened by `push_*` methods. */
        pop_all(): void
        
        /** Clears the tag stack, causing the label to display nothing.  
         *      
         *  **Note:** This method does not affect [member text], and its contents will show again if the label is redrawn. However, setting [member text] to an empty [String] also clears the stack.  
         */
        clear(): void
        
        /** Returns the vertical scrollbar.  
         *  **Warning:** This is a required internal node, removing and freeing it may cause a crash. If you wish to hide it or any of its children, use their [member CanvasItem.visible] property.  
         */
        get_v_scroll_bar(): null | VScrollBar
        
        /** Scrolls the window's top line to match [param line]. */
        scroll_to_line(line: int64): void
        
        /** Scrolls the window's top line to match first line of the [param paragraph]. */
        scroll_to_paragraph(paragraph: int64): void
        
        /** Scrolls to the beginning of the current selection. */
        scroll_to_selection(): void
        
        /** Returns the current selection first character index if a selection is active, `-1` otherwise. Does not include BBCodes. */
        get_selection_from(): int64
        
        /** Returns the current selection last character index if a selection is active, `-1` otherwise. Does not include BBCodes. */
        get_selection_to(): int64
        
        /** Returns the current selection vertical line offset if a selection is active, `-1.0` otherwise. */
        get_selection_line_offset(): float64
        
        /** Select all the text.  
         *  If [member selection_enabled] is `false`, no selection will occur.  
         */
        select_all(): void
        
        /** Returns the current selection text. Does not include BBCodes. */
        get_selected_text(): string
        
        /** Clears the current selection. */
        deselect(): void
        
        /** The assignment version of [method append_text]. Clears the tag stack and inserts the new content. */
        parse_bbcode(bbcode: string): void
        
        /** Parses [param bbcode] and adds tags to the tag stack as needed.  
         *      
         *  **Note:** Using this method, you can't close a tag that was opened in a previous [method append_text] call. This is done to improve performance, especially when updating large RichTextLabels since rebuilding the whole BBCode every time would be slower. If you absolutely need to close a tag in a future method call, append the [member text] instead of using [method append_text].  
         */
        append_text(bbcode: string): void
        
        /** If [member threaded] is enabled, returns `true` if the background thread has finished text processing, otherwise always return `true`. */
        is_ready(): boolean
        
        /** If [member threaded] is enabled, returns `true` if the background thread has finished text processing, otherwise always return `true`. */
        is_finished(): boolean
        
        /** Returns the line number of the character position provided. Line and character numbers are both zero-indexed.  
         *      
         *  **Note:** If [member threaded] is enabled, this method returns a value for the loaded part of the document. Use [method is_finished] or [signal finished] to determine whether document is fully loaded.  
         */
        get_character_line(character: int64): int64
        
        /** Returns the paragraph number of the character position provided. Paragraph and character numbers are both zero-indexed.  
         *      
         *  **Note:** If [member threaded] is enabled, this method returns a value for the loaded part of the document. Use [method is_finished] or [signal finished] to determine whether document is fully loaded.  
         */
        get_character_paragraph(character: int64): int64
        
        /** Returns the total number of characters from text tags. Does not include BBCodes. */
        get_total_character_count(): int64
        
        /** Returns the total number of lines in the text. Wrapped text is counted as multiple lines.  
         *      
         *  **Note:** If [member threaded] is enabled, this method returns a value for the loaded part of the document. Use [method is_finished] or [signal finished] to determine whether document is fully loaded.  
         */
        get_line_count(): int64
        
        /** Returns the indexes of the first and last visible characters for the given [param line], as a [Vector2i].  
         *      
         *  **Note:** If [member visible_characters_behavior] is set to [constant TextServer.VC_CHARS_BEFORE_SHAPING] only visible wrapped lines are counted.  
         *      
         *  **Note:** If [member threaded] is enabled, this method returns a value for the loaded part of the document. Use [method is_finished] or [signal finished] to determine whether document is fully loaded.  
         */
        get_line_range(line: int64): Vector2i
        
        /** Returns the number of visible lines.  
         *      
         *  **Note:** This method returns a correct value only after the label has been drawn.  
         *      
         *  **Note:** If [member threaded] is enabled, this method returns a value for the loaded part of the document. Use [method is_finished] or [signal finished] to determine whether document is fully loaded.  
         */
        get_visible_line_count(): int64
        
        /** Returns the total number of paragraphs (newlines or `p` tags in the tag stack's text tags). Considers wrapped text as one paragraph. */
        get_paragraph_count(): int64
        
        /** Returns the number of visible paragraphs. A paragraph is considered visible if at least one of its lines is visible.  
         *      
         *  **Note:** This method returns a correct value only after the label has been drawn.  
         *      
         *  **Note:** If [member threaded] is enabled, this method returns a value for the loaded part of the document. Use [method is_finished] or [signal finished] to determine whether document is fully loaded.  
         */
        get_visible_paragraph_count(): int64
        
        /** Returns the height of the content.  
         *      
         *  **Note:** This method always returns the full content size, and is not affected by [member visible_ratio] and [member visible_characters]. To get the visible content size, use [method get_visible_content_rect].  
         *      
         *  **Note:** If [member threaded] is enabled, this method returns a value for the loaded part of the document. Use [method is_finished] or [signal finished] to determine whether document is fully loaded.  
         */
        get_content_height(): int64
        
        /** Returns the width of the content.  
         *      
         *  **Note:** This method always returns the full content size, and is not affected by [member visible_ratio] and [member visible_characters]. To get the visible content size, use [method get_visible_content_rect].  
         *      
         *  **Note:** If [member threaded] is enabled, this method returns a value for the loaded part of the document. Use [method is_finished] or [signal finished] to determine whether document is fully loaded.  
         */
        get_content_width(): int64
        
        /** Returns the height of the line found at the provided index.  
         *      
         *  **Note:** If [member threaded] is enabled, this method returns a value for the loaded part of the document. Use [method is_finished] or [signal finished] to determine whether the document is fully loaded.  
         */
        get_line_height(line: int64): int64
        
        /** Returns the width of the line found at the provided index.  
         *      
         *  **Note:** If [member threaded] is enabled, this method returns a value for the loaded part of the document. Use [method is_finished] or [signal finished] to determine whether the document is fully loaded.  
         */
        get_line_width(line: int64): int64
        
        /** Returns the bounding rectangle of the visible content.  
         *      
         *  **Note:** This method returns a correct value only after the label has been drawn.  
         *    
         */
        get_visible_content_rect(): Rect2i
        
        /** Returns the vertical offset of the line found at the provided index.  
         *      
         *  **Note:** If [member threaded] is enabled, this method returns a value for the loaded part of the document. Use [method is_finished] or [signal finished] to determine whether document is fully loaded.  
         */
        get_line_offset(line: int64): float64
        
        /** Returns the vertical offset of the paragraph found at the provided index.  
         *      
         *  **Note:** If [member threaded] is enabled, this method returns a value for the loaded part of the document. Use [method is_finished] or [signal finished] to determine whether document is fully loaded.  
         */
        get_paragraph_offset(paragraph: int64): float64
        
        /** Parses BBCode parameter [param expressions] into a dictionary. */
        parse_expressions_for_values(expressions: PackedStringArray | string[]): GDictionary
        
        /** Installs a custom effect. This can also be done in the Inspector through the [member custom_effects] property. [param effect] should be a valid [RichTextEffect].  
         *  **Example:** With the following script extending from [RichTextEffect]:  
         *    
         *  The above effect can be installed in [RichTextLabel] from a script:  
         *    
         */
        install_effect(effect: any): void
        
        /** Reloads custom effects. Useful when [member custom_effects] is modified manually. */
        reload_effects(): void
        
        /** Returns the [PopupMenu] of this [RichTextLabel]. By default, this menu is displayed when right-clicking on the [RichTextLabel].  
         *  You can add custom menu items or remove standard ones. Make sure your IDs don't conflict with the standard ones (see [enum MenuItems]). For example:  
         *    
         *  **Warning:** This is a required internal node, removing and freeing it may cause a crash. If you wish to hide it or any of its children, use their [member Window.visible] property.  
         */
        get_menu(): null | PopupMenu
        
        /** Returns whether the menu is visible. Use this instead of `get_menu().visible` to improve performance (so the creation of the menu is avoided). */
        is_menu_visible(): boolean
        
        /** Executes a given action as defined in the [enum MenuItems] enum. */
        menu_option(option: int64): void
        
        /** If `true`, the label uses BBCode formatting.  
         *      
         *  **Note:** This only affects the contents of [member text], not the tag stack.  
         */
        get bbcode_enabled(): boolean
        set bbcode_enabled(value: boolean)
        
        /** The label's text in BBCode format. Is not representative of manual modifications to the internal tag stack. Erases changes made by other methods when edited.  
         *      
         *  **Note:** If [member bbcode_enabled] is `true`, it is unadvised to use the `+=` operator with [member text] (e.g. `text += "some string"`) as it replaces the whole text and can cause slowdowns. It will also erase all BBCode that was added to stack using `push_*` methods. Use [method append_text] for adding text instead, unless you absolutely need to close a tag that was opened in an earlier method call.  
         */
        get text(): string
        set text(value: string)
        
        /** If `true`, the label's minimum size will be automatically updated to fit its content, matching the behavior of [Label]. */
        get fit_content(): boolean
        set fit_content(value: boolean)
        
        /** If `true`, the scrollbar is visible. Setting this to `false` does not block scrolling completely. See [method scroll_to_line]. */
        get scroll_active(): boolean
        set scroll_active(value: boolean)
        
        /** If `true`, the window scrolls down to display new content automatically. */
        get scroll_following(): boolean
        set scroll_following(value: boolean)
        
        /** If `true`, the window scrolls to display the last visible line when [member visible_characters] or [member visible_ratio] is changed. */
        get scroll_following_visible_characters(): boolean
        set scroll_following_visible_characters(value: boolean)
        
        /** If set to something other than [constant TextServer.AUTOWRAP_OFF], the text gets wrapped inside the node's bounding rectangle. */
        get autowrap_mode(): int64
        set autowrap_mode(value: int64)
        
        /** Autowrap space trimming flags. See [constant TextServer.BREAK_TRIM_START_EDGE_SPACES] and [constant TextServer.BREAK_TRIM_END_EDGE_SPACES] for more info. */
        get autowrap_trim_flags(): int64
        set autowrap_trim_flags(value: int64)
        
        /** The number of spaces associated with a single tab length. Does not affect `\t` in text tags, only indent tags. */
        get tab_size(): int64
        set tab_size(value: int64)
        
        /** If `true`, a right-click displays the context menu. */
        get context_menu_enabled(): boolean
        set context_menu_enabled(value: boolean)
        
        /** If `true`, shortcut keys for context menu items are enabled, even if the context menu is disabled. */
        get shortcut_keys_enabled(): boolean
        set shortcut_keys_enabled(value: boolean)
        
        /** Controls the text's horizontal alignment. Supports left, center, right, and fill, or justify. */
        get horizontal_alignment(): int64
        set horizontal_alignment(value: int64)
        
        /** Controls the text's vertical alignment. Supports top, center, bottom, and fill. */
        get vertical_alignment(): int64
        set vertical_alignment(value: int64)
        
        /** Line fill alignment rules. */
        get justification_flags(): int64
        set justification_flags(value: int64)
        
        /** Aligns text to the given tab-stops. */
        get tab_stops(): PackedFloat32Array
        set tab_stops(value: PackedFloat32Array | float32[])
        
        /** The currently installed custom effects. This is an array of [RichTextEffect]s.  
         *  To add a custom effect, it's more convenient to use [method install_effect].  
         */
        get custom_effects(): GArray<RichTextEffect>
        set custom_effects(value: GArray<RichTextEffect>)
        
        /** If `true`, the label underlines meta tags such as [code skip-lint][url]{text}[/url]`. These tags can call a function when clicked if [signal meta_clicked] is connected to a function. */
        get meta_underlined(): boolean
        set meta_underlined(value: boolean)
        
        /** If `true`, the label underlines hint tags such as [code skip-lint][hint=description]{text}[/hint]`. */
        get hint_underlined(): boolean
        set hint_underlined(value: boolean)
        
        /** If `true`, text processing is done in a background thread. */
        get threaded(): boolean
        set threaded(value: boolean)
        
        /** The delay after which the loading progress bar is displayed, in milliseconds. Set to `-1` to disable progress bar entirely.  
         *      
         *  **Note:** Progress bar is displayed only if [member threaded] is enabled.  
         */
        get progress_bar_delay(): int64
        set progress_bar_delay(value: int64)
        
        /** If `true`, the label allows text selection. */
        get selection_enabled(): boolean
        set selection_enabled(value: boolean)
        
        /** If `true`, the selected text will be deselected when focus is lost. */
        get deselect_on_focus_loss_enabled(): boolean
        set deselect_on_focus_loss_enabled(value: boolean)
        
        /** If `true`, allow drag and drop of selected text. */
        get drag_and_drop_selection_enabled(): boolean
        set drag_and_drop_selection_enabled(value: boolean)
        
        /** The number of characters to display. If set to `-1`, all characters are displayed. This can be useful when animating the text appearing in a dialog box.  
         *      
         *  **Note:** Setting this property updates [member visible_ratio] accordingly.  
         *      
         *  **Note:** Characters are counted as Unicode codepoints. A single visible grapheme may contain multiple codepoints (e.g. certain emoji use three codepoints). A single codepoint may contain two UTF-16 characters, which are used in C# strings.  
         */
        get visible_characters(): int64
        set visible_characters(value: int64)
        
        /** The clipping behavior when [member visible_characters] or [member visible_ratio] is set. */
        get visible_characters_behavior(): int64
        set visible_characters_behavior(value: int64)
        
        /** The fraction of characters to display, relative to the total number of characters (see [method get_total_character_count]). If set to `1.0`, all characters are displayed. If set to `0.5`, only half of the characters will be displayed. This can be useful when animating the text appearing in a dialog box.  
         *      
         *  **Note:** Setting this property updates [member visible_characters] accordingly.  
         */
        get visible_ratio(): float64
        set visible_ratio(value: float64)
        
        /** Base text writing direction. */
        get text_direction(): int64
        set text_direction(value: int64)
        
        /** Language code used for line-breaking and text shaping algorithms, if left empty current locale is used instead. */
        get language(): string
        set language(value: string)
        
        /** Set BiDi algorithm override for the structured text. */
        get structured_text_bidi_override(): int64
        set structured_text_bidi_override(value: int64)
        
        /** Set additional options for BiDi override. */
        get structured_text_bidi_override_options(): GArray
        set structured_text_bidi_override_options(value: GArray)
        
        /** Triggered when the user clicks on content between meta (URL) tags. If the meta is defined in BBCode, e.g. [code skip-lint][url={"key": "value"}]Text[/url]`, then the parameter for this signal will always be a [String] type. If a particular type or an object is desired, the [method push_meta] method must be used to manually insert the data into the tag stack. Alternatively, you can convert the [String] input to the desired type based on its contents (such as calling [method JSON.parse] on it).  
         *  For example, the following method can be connected to [signal meta_clicked] to open clicked URLs using the user's default web browser:  
         *    
         */
        readonly meta_clicked: Signal<(meta: any) => void>
        
        /** Triggers when the mouse enters a meta tag. */
        readonly meta_hover_started: Signal<(meta: any) => void>
        
        /** Triggers when the mouse exits a meta tag. */
        readonly meta_hover_ended: Signal<(meta: any) => void>
        
        /** Triggered when the document is fully loaded.  
         *      
         *  **Note:** This can happen before the text is processed for drawing. Scrolling values may not be valid until the document is drawn for the first time after this signal.  
         */
        readonly finished: Signal<() => void>
        /** @deprecated Internal use. Does not exist at runtime. */
        __godotNameMap: __NameMapRichTextLabel;
    }
    namespace RigidBody2D {
        enum FreezeMode {
            /** Static body freeze mode (default). The body is not affected by gravity and forces. It can be only moved by user code and doesn't collide with other bodies along its path. */
            FREEZE_MODE_STATIC = 0,
            
            /** Kinematic body freeze mode. Similar to [constant FREEZE_MODE_STATIC], but collides with other bodies along its path when moved. Useful for a frozen body that needs to be animated. */
            FREEZE_MODE_KINEMATIC = 1,
        }
        enum CenterOfMassMode {
            /** In this mode, the body's center of mass is calculated automatically based on its shapes. This assumes that the shapes' origins are also their center of mass. */
            CENTER_OF_MASS_MODE_AUTO = 0,
            
            /** In this mode, the body's center of mass is set through [member center_of_mass]. Defaults to the body's origin position. */
            CENTER_OF_MASS_MODE_CUSTOM = 1,
        }
        enum DampMode {
            /** In this mode, the body's damping value is added to any value set in areas or the default value. */
            DAMP_MODE_COMBINE = 0,
            
            /** In this mode, the body's damping value replaces any value set in areas or the default value. */
            DAMP_MODE_REPLACE = 1,
        }
        enum CCDMode {
            /** Continuous collision detection disabled. This is the fastest way to detect body collisions, but can miss small, fast-moving objects. */
            CCD_MODE_DISABLED = 0,
            
            /** Continuous collision detection enabled using raycasting. This is faster than shapecasting but less precise. */
            CCD_MODE_CAST_RAY = 1,
            
            /** Continuous collision detection enabled using shapecasting. This is the slowest CCD method and the most precise. */
            CCD_MODE_CAST_SHAPE = 2,
        }
    }
    /** @deprecated Internal use. Does not exist at runtime. */
    interface __NameMapRigidBody2D extends __NameMapPhysicsBody2D {
    }
    /** A 2D physics body that is moved by a physics simulation.  
     *  	  
     *  @link https://docs.godotengine.org/en/4.5/classes/class_rigidbody2d.html  
     */
    class RigidBody2D<Map extends NodePathMap = any> extends PhysicsBody2D<Map> {
        constructor(identifier?: any)
        /** Called during physics processing, allowing you to read and safely modify the simulation state for the object. By default, it is called before the standard force integration, but the [member custom_integrator] property allows you to disable the standard force integration and do fully custom force integration for a body. */
        /* gdvirtual */ _integrate_forces(state: PhysicsDirectBodyState2D): void
        
        /** Returns the number of contacts this body has with other bodies. By default, this returns 0 unless bodies are configured to monitor contacts (see [member contact_monitor]).  
         *      
         *  **Note:** To retrieve the colliding bodies, use [method get_colliding_bodies].  
         */
        get_contact_count(): int64
        
        /** Sets the body's velocity on the given axis. The velocity in the given vector axis will be set as the given vector length. This is useful for jumping behavior. */
        set_axis_velocity(axis_velocity: Vector2): void
        
        /** Applies a directional impulse without affecting rotation.  
         *  An impulse is time-independent! Applying an impulse every frame would result in a framerate-dependent force. For this reason, it should only be used when simulating one-time impacts (use the "_force" functions otherwise).  
         *  This is equivalent to using [method apply_impulse] at the body's center of mass.  
         */
        apply_central_impulse(impulse?: Vector2 /* = Vector2.ZERO */): void
        
        /** Applies a positioned impulse to the body.  
         *  An impulse is time-independent! Applying an impulse every frame would result in a framerate-dependent force. For this reason, it should only be used when simulating one-time impacts (use the "_force" functions otherwise).  
         *  [param position] is the offset from the body origin in global coordinates.  
         */
        apply_impulse(impulse: Vector2, position?: Vector2 /* = Vector2.ZERO */): void
        
        /** Applies a rotational impulse to the body without affecting the position.  
         *  An impulse is time-independent! Applying an impulse every frame would result in a framerate-dependent force. For this reason, it should only be used when simulating one-time impacts (use the "_force" functions otherwise).  
         *      
         *  **Note:** [member inertia] is required for this to work. To have [member inertia], an active [CollisionShape2D] must be a child of the node, or you can manually set [member inertia].  
         */
        apply_torque_impulse(torque: float64): void
        
        /** Applies a directional force without affecting rotation. A force is time dependent and meant to be applied every physics update.  
         *  This is equivalent to using [method apply_force] at the body's center of mass.  
         */
        apply_central_force(force: Vector2): void
        
        /** Applies a positioned force to the body. A force is time dependent and meant to be applied every physics update.  
         *  [param position] is the offset from the body origin in global coordinates.  
         */
        apply_force(force: Vector2, position?: Vector2 /* = Vector2.ZERO */): void
        
        /** Applies a rotational force without affecting position. A force is time dependent and meant to be applied every physics update.  
         *      
         *  **Note:** [member inertia] is required for this to work. To have [member inertia], an active [CollisionShape2D] must be a child of the node, or you can manually set [member inertia].  
         */
        apply_torque(torque: float64): void
        
        /** Adds a constant directional force without affecting rotation that keeps being applied over time until cleared with `constant_force = Vector2(0, 0)`.  
         *  This is equivalent to using [method add_constant_force] at the body's center of mass.  
         */
        add_constant_central_force(force: Vector2): void
        
        /** Adds a constant positioned force to the body that keeps being applied over time until cleared with `constant_force = Vector2(0, 0)`.  
         *  [param position] is the offset from the body origin in global coordinates.  
         */
        add_constant_force(force: Vector2, position?: Vector2 /* = Vector2.ZERO */): void
        
        /** Adds a constant rotational force without affecting position that keeps being applied over time until cleared with `constant_torque = 0`. */
        add_constant_torque(torque: float64): void
        
        /** Returns a list of the bodies colliding with this one. Requires [member contact_monitor] to be set to `true` and [member max_contacts_reported] to be set high enough to detect all the collisions.  
         *      
         *  **Note:** The result of this test is not immediate after moving objects. For performance, list of collisions is updated once per frame and before the physics step. Consider using signals instead.  
         */
        get_colliding_bodies(): GArray<Node2D>
        
        /** The body's mass. */
        get mass(): float64
        set mass(value: float64)
        
        /** The physics material override for the body.  
         *  If a material is assigned to this property, it will be used instead of any other physics material, such as an inherited one.  
         */
        get physics_material_override(): null | PhysicsMaterial
        set physics_material_override(value: null | PhysicsMaterial)
        
        /** Multiplies the gravity applied to the body. The body's gravity is calculated from the [member ProjectSettings.physics/2d/default_gravity] project setting and/or any additional gravity vector applied by [Area2D]s. */
        get gravity_scale(): float64
        set gravity_scale(value: float64)
        
        /** Defines the way the body's center of mass is set. */
        get center_of_mass_mode(): int64
        set center_of_mass_mode(value: int64)
        
        /** The body's custom center of mass, relative to the body's origin position, when [member center_of_mass_mode] is set to [constant CENTER_OF_MASS_MODE_CUSTOM]. This is the balanced point of the body, where applied forces only cause linear acceleration. Applying forces outside of the center of mass causes angular acceleration.  
         *  When [member center_of_mass_mode] is set to [constant CENTER_OF_MASS_MODE_AUTO] (default value), the center of mass is automatically determined, but this does not update the value of [member center_of_mass].  
         */
        get center_of_mass(): Vector2
        set center_of_mass(value: Vector2)
        
        /** The body's moment of inertia. This is like mass, but for rotation: it determines how much torque it takes to rotate the body. The moment of inertia is usually computed automatically from the mass and the shapes, but this property allows you to set a custom value.  
         *  If set to `0`, inertia is automatically computed (default value).  
         *      
         *  **Note:** This value does not change when inertia is automatically computed. Use [PhysicsServer2D] to get the computed inertia.  
         *    
         */
        get inertia(): float64
        set inertia(value: float64)
        
        /** If `true`, the body will not move and will not calculate forces until woken up by another body through, for example, a collision, or by using the [method apply_impulse] or [method apply_force] methods. */
        get sleeping(): boolean
        set sleeping(value: boolean)
        
        /** If `true`, the body can enter sleep mode when there is no movement. See [member sleeping]. */
        get can_sleep(): boolean
        set can_sleep(value: boolean)
        
        /** If `true`, the body cannot rotate. Gravity and forces only apply linear movement. */
        get lock_rotation(): boolean
        set lock_rotation(value: boolean)
        
        /** If `true`, the body is frozen. Gravity and forces are not applied anymore.  
         *  See [member freeze_mode] to set the body's behavior when frozen.  
         *  For a body that is always frozen, use [StaticBody2D] or [AnimatableBody2D] instead.  
         */
        get freeze(): boolean
        set freeze(value: boolean)
        
        /** The body's freeze mode. Can be used to set the body's behavior when [member freeze] is enabled.  
         *  For a body that is always frozen, use [StaticBody2D] or [AnimatableBody2D] instead.  
         */
        get freeze_mode(): int64
        set freeze_mode(value: int64)
        
        /** If `true`, the standard force integration (like gravity or damping) will be disabled for this body. Other than collision response, the body will only move as determined by the [method _integrate_forces] method, if that virtual method is overridden.  
         *  Setting this property will call the method [method PhysicsServer2D.body_set_omit_force_integration] internally.  
         */
        get custom_integrator(): boolean
        set custom_integrator(value: boolean)
        
        /** Continuous collision detection mode.  
         *  Continuous collision detection tries to predict where a moving body will collide instead of moving it and correcting its movement after collision. Continuous collision detection is slower, but more precise and misses fewer collisions with small, fast-moving objects. Raycasting and shapecasting methods are available.  
         */
        get continuous_cd(): int64
        set continuous_cd(value: int64)
        
        /** If `true`, the RigidBody2D will emit signals when it collides with another body.  
         *      
         *  **Note:** By default the maximum contacts reported is set to 0, meaning nothing will be recorded, see [member max_contacts_reported].  
         */
        get contact_monitor(): boolean
        set contact_monitor(value: boolean)
        
        /** The maximum number of contacts that will be recorded. Requires a value greater than 0 and [member contact_monitor] to be set to `true` to start to register contacts. Use [method get_contact_count] to retrieve the count or [method get_colliding_bodies] to retrieve bodies that have been collided with.  
         *      
         *  **Note:** The number of contacts is different from the number of collisions. Collisions between parallel edges will result in two contacts (one at each end), and collisions between parallel faces will result in four contacts (one at each corner).  
         */
        get max_contacts_reported(): int64
        set max_contacts_reported(value: int64)
        
        /** The body's linear velocity in pixels per second. Can be used sporadically, but **don't set this every frame**, because physics may run in another thread and runs at a different granularity. Use [method _integrate_forces] as your process loop for precise control of the body state. */
        get linear_velocity(): Vector2
        set linear_velocity(value: Vector2)
        
        /** Defines how [member linear_damp] is applied. */
        get linear_damp_mode(): int64
        set linear_damp_mode(value: int64)
        
        /** Damps the body's movement. By default, the body will use the [member ProjectSettings.physics/2d/default_linear_damp] setting or any value override set by an [Area2D] the body is in. Depending on [member linear_damp_mode], you can set [member linear_damp] to be added to or to replace the body's damping value.  
         *  See [member ProjectSettings.physics/2d/default_linear_damp] for more details about damping.  
         */
        get linear_damp(): float64
        set linear_damp(value: float64)
        
        /** The body's rotational velocity in  *radians*  per second. */
        get angular_velocity(): float64
        set angular_velocity(value: float64)
        
        /** Defines how [member angular_damp] is applied. */
        get angular_damp_mode(): int64
        set angular_damp_mode(value: int64)
        
        /** Damps the body's rotation. By default, the body will use the [member ProjectSettings.physics/2d/default_angular_damp] setting or any value override set by an [Area2D] the body is in. Depending on [member angular_damp_mode], you can set [member angular_damp] to be added to or to replace the body's damping value.  
         *  See [member ProjectSettings.physics/2d/default_angular_damp] for more details about damping.  
         */
        get angular_damp(): float64
        set angular_damp(value: float64)
        
        /** The body's total constant positional forces applied during each physics update.  
         *  See [method add_constant_force] and [method add_constant_central_force].  
         */
        get constant_force(): Vector2
        set constant_force(value: Vector2)
        
        /** The body's total constant rotational forces applied during each physics update.  
         *  See [method add_constant_torque].  
         */
        get constant_torque(): float64
        set constant_torque(value: float64)
        
        /** Emitted when one of this RigidBody2D's [Shape2D]s collides with another [PhysicsBody2D] or [TileMap]'s [Shape2D]s. Requires [member contact_monitor] to be set to `true` and [member max_contacts_reported] to be set high enough to detect all the collisions. [TileMap]s are detected if the [TileSet] has Collision [Shape2D]s.  
         *  [param body_rid] the [RID] of the other [PhysicsBody2D] or [TileSet]'s [CollisionObject2D] used by the [PhysicsServer2D].  
         *  [param body] the [Node], if it exists in the tree, of the other [PhysicsBody2D] or [TileMap].  
         *  [param body_shape_index] the index of the [Shape2D] of the other [PhysicsBody2D] or [TileMap] used by the [PhysicsServer2D]. Get the [CollisionShape2D] node with `body.shape_owner_get_owner(body.shape_find_owner(body_shape_index))`.  
         *  [param local_shape_index] the index of the [Shape2D] of this RigidBody2D used by the [PhysicsServer2D]. Get the [CollisionShape2D] node with `self.shape_owner_get_owner(self.shape_find_owner(local_shape_index))`.  
         */
        readonly body_shape_entered: Signal<(body_rid: RID, body: Node, body_shape_index: int64, local_shape_index: int64) => void>
        
        /** Emitted when the collision between one of this RigidBody2D's [Shape2D]s and another [PhysicsBody2D] or [TileMap]'s [Shape2D]s ends. Requires [member contact_monitor] to be set to `true` and [member max_contacts_reported] to be set high enough to detect all the collisions. [TileMap]s are detected if the [TileSet] has Collision [Shape2D]s.  
         *  [param body_rid] the [RID] of the other [PhysicsBody2D] or [TileSet]'s [CollisionObject2D] used by the [PhysicsServer2D].  
         *  [param body] the [Node], if it exists in the tree, of the other [PhysicsBody2D] or [TileMap].  
         *  [param body_shape_index] the index of the [Shape2D] of the other [PhysicsBody2D] or [TileMap] used by the [PhysicsServer2D]. Get the [CollisionShape2D] node with `body.shape_owner_get_owner(body.shape_find_owner(body_shape_index))`.  
         *  [param local_shape_index] the index of the [Shape2D] of this RigidBody2D used by the [PhysicsServer2D]. Get the [CollisionShape2D] node with `self.shape_owner_get_owner(self.shape_find_owner(local_shape_index))`.  
         */
        readonly body_shape_exited: Signal<(body_rid: RID, body: Node, body_shape_index: int64, local_shape_index: int64) => void>
        
        /** Emitted when a collision with another [PhysicsBody2D] or [TileMap] occurs. Requires [member contact_monitor] to be set to `true` and [member max_contacts_reported] to be set high enough to detect all the collisions. [TileMap]s are detected if the [TileSet] has Collision [Shape2D]s.  
         *  [param body] the [Node], if it exists in the tree, of the other [PhysicsBody2D] or [TileMap].  
         */
        readonly body_entered: Signal<(body: Node) => void>
        
        /** Emitted when the collision with another [PhysicsBody2D] or [TileMap] ends. Requires [member contact_monitor] to be set to `true` and [member max_contacts_reported] to be set high enough to detect all the collisions. [TileMap]s are detected if the [TileSet] has Collision [Shape2D]s.  
         *  [param body] the [Node], if it exists in the tree, of the other [PhysicsBody2D] or [TileMap].  
         */
        readonly body_exited: Signal<(body: Node) => void>
        
        /** Emitted when the physics engine changes the body's sleeping state.  
         *      
         *  **Note:** Changing the value [member sleeping] will not trigger this signal. It is only emitted if the sleeping state is changed by the physics engine or `emit_signal("sleeping_state_changed")` is used.  
         */
        readonly sleeping_state_changed: Signal<() => void>
        /** @deprecated Internal use. Does not exist at runtime. */
        __godotNameMap: __NameMapRigidBody2D;
    }
    namespace RigidBody3D {
        enum FreezeMode {
            /** Static body freeze mode (default). The body is not affected by gravity and forces. It can be only moved by user code and doesn't collide with other bodies along its path. */
            FREEZE_MODE_STATIC = 0,
            
            /** Kinematic body freeze mode. Similar to [constant FREEZE_MODE_STATIC], but collides with other bodies along its path when moved. Useful for a frozen body that needs to be animated. */
            FREEZE_MODE_KINEMATIC = 1,
        }
        enum CenterOfMassMode {
            /** In this mode, the body's center of mass is calculated automatically based on its shapes. This assumes that the shapes' origins are also their center of mass. */
            CENTER_OF_MASS_MODE_AUTO = 0,
            
            /** In this mode, the body's center of mass is set through [member center_of_mass]. Defaults to the body's origin position. */
            CENTER_OF_MASS_MODE_CUSTOM = 1,
        }
        enum DampMode {
            /** In this mode, the body's damping value is added to any value set in areas or the default value. */
            DAMP_MODE_COMBINE = 0,
            
            /** In this mode, the body's damping value replaces any value set in areas or the default value. */
            DAMP_MODE_REPLACE = 1,
        }
    }
    /** @deprecated Internal use. Does not exist at runtime. */
    interface __NameMapRigidBody3D extends __NameMapPhysicsBody3D {
    }
    /** A 3D physics body that is moved by a physics simulation.  
     *  	  
     *  @link https://docs.godotengine.org/en/4.5/classes/class_rigidbody3d.html  
     */
    class RigidBody3D<Map extends NodePathMap = any> extends PhysicsBody3D<Map> {
        constructor(identifier?: any)
        /** Called during physics processing, allowing you to read and safely modify the simulation state for the object. By default, it is called before the standard force integration, but the [member custom_integrator] property allows you to disable the standard force integration and do fully custom force integration for a body. */
        /* gdvirtual */ _integrate_forces(state: PhysicsDirectBodyState3D): void
        
        /** Returns the inverse inertia tensor basis. This is used to calculate the angular acceleration resulting from a torque applied to the [RigidBody3D]. */
        get_inverse_inertia_tensor(): Basis
        
        /** Returns the number of contacts this body has with other bodies. By default, this returns 0 unless bodies are configured to monitor contacts (see [member contact_monitor]).  
         *      
         *  **Note:** To retrieve the colliding bodies, use [method get_colliding_bodies].  
         */
        get_contact_count(): int64
        
        /** Sets an axis velocity. The velocity in the given vector axis will be set as the given vector length. This is useful for jumping behavior. */
        set_axis_velocity(axis_velocity: Vector3): void
        
        /** Applies a directional impulse without affecting rotation.  
         *  An impulse is time-independent! Applying an impulse every frame would result in a framerate-dependent force. For this reason, it should only be used when simulating one-time impacts (use the "_force" functions otherwise).  
         *  This is equivalent to using [method apply_impulse] at the body's center of mass.  
         */
        apply_central_impulse(impulse: Vector3): void
        
        /** Applies a positioned impulse to the body.  
         *  An impulse is time-independent! Applying an impulse every frame would result in a framerate-dependent force. For this reason, it should only be used when simulating one-time impacts (use the "_force" functions otherwise).  
         *  [param position] is the offset from the body origin in global coordinates.  
         */
        apply_impulse(impulse: Vector3, position?: Vector3 /* = new Vector3(0, 0, 0) */): void
        
        /** Applies a rotational impulse to the body without affecting the position.  
         *  An impulse is time-independent! Applying an impulse every frame would result in a framerate-dependent force. For this reason, it should only be used when simulating one-time impacts (use the "_force" functions otherwise).  
         *      
         *  **Note:** [member inertia] is required for this to work. To have [member inertia], an active [CollisionShape3D] must be a child of the node, or you can manually set [member inertia].  
         */
        apply_torque_impulse(impulse: Vector3): void
        
        /** Applies a directional force without affecting rotation. A force is time dependent and meant to be applied every physics update.  
         *  This is equivalent to using [method apply_force] at the body's center of mass.  
         */
        apply_central_force(force: Vector3): void
        
        /** Applies a positioned force to the body. A force is time dependent and meant to be applied every physics update.  
         *  [param position] is the offset from the body origin in global coordinates.  
         */
        apply_force(force: Vector3, position?: Vector3 /* = new Vector3(0, 0, 0) */): void
        
        /** Applies a rotational force without affecting position. A force is time dependent and meant to be applied every physics update.  
         *      
         *  **Note:** [member inertia] is required for this to work. To have [member inertia], an active [CollisionShape3D] must be a child of the node, or you can manually set [member inertia].  
         */
        apply_torque(torque: Vector3): void
        
        /** Adds a constant directional force without affecting rotation that keeps being applied over time until cleared with `constant_force = Vector3(0, 0, 0)`.  
         *  This is equivalent to using [method add_constant_force] at the body's center of mass.  
         */
        add_constant_central_force(force: Vector3): void
        
        /** Adds a constant positioned force to the body that keeps being applied over time until cleared with `constant_force = Vector3(0, 0, 0)`.  
         *  [param position] is the offset from the body origin in global coordinates.  
         */
        add_constant_force(force: Vector3, position?: Vector3 /* = new Vector3(0, 0, 0) */): void
        
        /** Adds a constant rotational force without affecting position that keeps being applied over time until cleared with `constant_torque = Vector3(0, 0, 0)`. */
        add_constant_torque(torque: Vector3): void
        
        /** Returns a list of the bodies colliding with this one. Requires [member contact_monitor] to be set to `true` and [member max_contacts_reported] to be set high enough to detect all the collisions.  
         *      
         *  **Note:** The result of this test is not immediate after moving objects. For performance, list of collisions is updated once per frame and before the physics step. Consider using signals instead.  
         */
        get_colliding_bodies(): GArray<Node3D>
        
        /** The body's mass. */
        get mass(): float64
        set mass(value: float64)
        
        /** The physics material override for the body.  
         *  If a material is assigned to this property, it will be used instead of any other physics material, such as an inherited one.  
         */
        get physics_material_override(): null | PhysicsMaterial
        set physics_material_override(value: null | PhysicsMaterial)
        
        /** This is multiplied by [member ProjectSettings.physics/3d/default_gravity] to produce this body's gravity. For example, a value of `1.0` will apply normal gravity, `2.0` will apply double the gravity, and `0.5` will apply half the gravity to this body. */
        get gravity_scale(): float64
        set gravity_scale(value: float64)
        
        /** Defines the way the body's center of mass is set. */
        get center_of_mass_mode(): int64
        set center_of_mass_mode(value: int64)
        
        /** The body's custom center of mass, relative to the body's origin position, when [member center_of_mass_mode] is set to [constant CENTER_OF_MASS_MODE_CUSTOM]. This is the balanced point of the body, where applied forces only cause linear acceleration. Applying forces outside of the center of mass causes angular acceleration.  
         *  When [member center_of_mass_mode] is set to [constant CENTER_OF_MASS_MODE_AUTO] (default value), the center of mass is automatically determined, but this does not update the value of [member center_of_mass].  
         */
        get center_of_mass(): Vector3
        set center_of_mass(value: Vector3)
        
        /** The body's moment of inertia. This is like mass, but for rotation: it determines how much torque it takes to rotate the body on each axis. The moment of inertia is usually computed automatically from the mass and the shapes, but this property allows you to set a custom value.  
         *  If set to [constant Vector3.ZERO], inertia is automatically computed (default value).  
         *      
         *  **Note:** This value does not change when inertia is automatically computed. Use [PhysicsServer3D] to get the computed inertia.  
         *    
         */
        get inertia(): Vector3
        set inertia(value: Vector3)
        
        /** If `true`, the body will not move and will not calculate forces until woken up by another body through, for example, a collision, or by using the [method apply_impulse] or [method apply_force] methods. */
        get sleeping(): boolean
        set sleeping(value: boolean)
        
        /** If `true`, the body can enter sleep mode when there is no movement. See [member sleeping]. */
        get can_sleep(): boolean
        set can_sleep(value: boolean)
        
        /** If `true`, the body cannot rotate. Gravity and forces only apply linear movement. */
        get lock_rotation(): boolean
        set lock_rotation(value: boolean)
        
        /** If `true`, the body is frozen. Gravity and forces are not applied anymore.  
         *  See [member freeze_mode] to set the body's behavior when frozen.  
         *  For a body that is always frozen, use [StaticBody3D] or [AnimatableBody3D] instead.  
         */
        get freeze(): boolean
        set freeze(value: boolean)
        
        /** The body's freeze mode. Can be used to set the body's behavior when [member freeze] is enabled.  
         *  For a body that is always frozen, use [StaticBody3D] or [AnimatableBody3D] instead.  
         */
        get freeze_mode(): int64
        set freeze_mode(value: int64)
        
        /** If `true`, the standard force integration (like gravity or damping) will be disabled for this body. Other than collision response, the body will only move as determined by the [method _integrate_forces] method, if that virtual method is overridden.  
         *  Setting this property will call the method [method PhysicsServer3D.body_set_omit_force_integration] internally.  
         */
        get custom_integrator(): boolean
        set custom_integrator(value: boolean)
        
        /** If `true`, continuous collision detection is used.  
         *  Continuous collision detection tries to predict where a moving body will collide, instead of moving it and correcting its movement if it collided. Continuous collision detection is more precise, and misses fewer impacts by small, fast-moving objects. Not using continuous collision detection is faster to compute, but can miss small, fast-moving objects.  
         */
        get continuous_cd(): boolean
        set continuous_cd(value: boolean)
        
        /** If `true`, the RigidBody3D will emit signals when it collides with another body.  
         *      
         *  **Note:** By default the maximum contacts reported is set to 0, meaning nothing will be recorded, see [member max_contacts_reported].  
         */
        get contact_monitor(): boolean
        set contact_monitor(value: boolean)
        
        /** The maximum number of contacts that will be recorded. Requires a value greater than 0 and [member contact_monitor] to be set to `true` to start to register contacts. Use [method get_contact_count] to retrieve the count or [method get_colliding_bodies] to retrieve bodies that have been collided with.  
         *      
         *  **Note:** The number of contacts is different from the number of collisions. Collisions between parallel edges will result in two contacts (one at each end), and collisions between parallel faces will result in four contacts (one at each corner).  
         */
        get max_contacts_reported(): int64
        set max_contacts_reported(value: int64)
        
        /** The body's linear velocity in units per second. Can be used sporadically, but **don't set this every frame**, because physics may run in another thread and runs at a different granularity. Use [method _integrate_forces] as your process loop for precise control of the body state. */
        get linear_velocity(): Vector3
        set linear_velocity(value: Vector3)
        
        /** Defines how [member linear_damp] is applied. */
        get linear_damp_mode(): int64
        set linear_damp_mode(value: int64)
        
        /** Damps the body's movement. By default, the body will use the [member ProjectSettings.physics/3d/default_linear_damp] project setting or any value override set by an [Area3D] the body is in. Depending on [member linear_damp_mode], you can set [member linear_damp] to be added to or to replace the body's damping value.  
         *  See [member ProjectSettings.physics/3d/default_linear_damp] for more details about damping.  
         */
        get linear_damp(): float64
        set linear_damp(value: float64)
        
        /** The RigidBody3D's rotational velocity in  *radians*  per second. */
        get angular_velocity(): Vector3
        set angular_velocity(value: Vector3)
        
        /** Defines how [member angular_damp] is applied. */
        get angular_damp_mode(): int64
        set angular_damp_mode(value: int64)
        
        /** Damps the body's rotation. By default, the body will use the [member ProjectSettings.physics/3d/default_angular_damp] project setting or any value override set by an [Area3D] the body is in. Depending on [member angular_damp_mode], you can set [member angular_damp] to be added to or to replace the body's damping value.  
         *  See [member ProjectSettings.physics/3d/default_angular_damp] for more details about damping.  
         */
        get angular_damp(): float64
        set angular_damp(value: float64)
        
        /** The body's total constant positional forces applied during each physics update.  
         *  See [method add_constant_force] and [method add_constant_central_force].  
         */
        get constant_force(): Vector3
        set constant_force(value: Vector3)
        
        /** The body's total constant rotational forces applied during each physics update.  
         *  See [method add_constant_torque].  
         */
        get constant_torque(): Vector3
        set constant_torque(value: Vector3)
        
        /** Emitted when one of this RigidBody3D's [Shape3D]s collides with another [PhysicsBody3D] or [GridMap]'s [Shape3D]s. Requires [member contact_monitor] to be set to `true` and [member max_contacts_reported] to be set high enough to detect all the collisions. [GridMap]s are detected if the [MeshLibrary] has Collision [Shape3D]s.  
         *  [param body_rid] the [RID] of the other [PhysicsBody3D] or [MeshLibrary]'s [CollisionObject3D] used by the [PhysicsServer3D].  
         *  [param body] the [Node], if it exists in the tree, of the other [PhysicsBody3D] or [GridMap].  
         *  [param body_shape_index] the index of the [Shape3D] of the other [PhysicsBody3D] or [GridMap] used by the [PhysicsServer3D]. Get the [CollisionShape3D] node with `body.shape_owner_get_owner(body.shape_find_owner(body_shape_index))`.  
         *  [param local_shape_index] the index of the [Shape3D] of this RigidBody3D used by the [PhysicsServer3D]. Get the [CollisionShape3D] node with `self.shape_owner_get_owner(self.shape_find_owner(local_shape_index))`.  
         */
        readonly body_shape_entered: Signal<(body_rid: RID, body: Node, body_shape_index: int64, local_shape_index: int64) => void>
        
        /** Emitted when the collision between one of this RigidBody3D's [Shape3D]s and another [PhysicsBody3D] or [GridMap]'s [Shape3D]s ends. Requires [member contact_monitor] to be set to `true` and [member max_contacts_reported] to be set high enough to detect all the collisions. [GridMap]s are detected if the [MeshLibrary] has Collision [Shape3D]s.  
         *  [param body_rid] the [RID] of the other [PhysicsBody3D] or [MeshLibrary]'s [CollisionObject3D] used by the [PhysicsServer3D]. [GridMap]s are detected if the Meshes have [Shape3D]s.  
         *  [param body] the [Node], if it exists in the tree, of the other [PhysicsBody3D] or [GridMap].  
         *  [param body_shape_index] the index of the [Shape3D] of the other [PhysicsBody3D] or [GridMap] used by the [PhysicsServer3D]. Get the [CollisionShape3D] node with `body.shape_owner_get_owner(body.shape_find_owner(body_shape_index))`.  
         *  [param local_shape_index] the index of the [Shape3D] of this RigidBody3D used by the [PhysicsServer3D]. Get the [CollisionShape3D] node with `self.shape_owner_get_owner(self.shape_find_owner(local_shape_index))`.  
         */
        readonly body_shape_exited: Signal<(body_rid: RID, body: Node, body_shape_index: int64, local_shape_index: int64) => void>
        
        /** Emitted when a collision with another [PhysicsBody3D] or [GridMap] occurs. Requires [member contact_monitor] to be set to `true` and [member max_contacts_reported] to be set high enough to detect all the collisions. [GridMap]s are detected if the [MeshLibrary] has Collision [Shape3D]s.  
         *  [param body] the [Node], if it exists in the tree, of the other [PhysicsBody3D] or [GridMap].  
         */
        readonly body_entered: Signal<(body: Node) => void>
        
        /** Emitted when the collision with another [PhysicsBody3D] or [GridMap] ends. Requires [member contact_monitor] to be set to `true` and [member max_contacts_reported] to be set high enough to detect all the collisions. [GridMap]s are detected if the [MeshLibrary] has Collision [Shape3D]s.  
         *  [param body] the [Node], if it exists in the tree, of the other [PhysicsBody3D] or [GridMap].  
         */
        readonly body_exited: Signal<(body: Node) => void>
        
        /** Emitted when the physics engine changes the body's sleeping state.  
         *      
         *  **Note:** Changing the value [member sleeping] will not trigger this signal. It is only emitted if the sleeping state is changed by the physics engine or `emit_signal("sleeping_state_changed")` is used.  
         */
        readonly sleeping_state_changed: Signal<() => void>
        /** @deprecated Internal use. Does not exist at runtime. */
        __godotNameMap: __NameMapRigidBody3D;
    }
    /** @deprecated Internal use. Does not exist at runtime. */
    interface __NameMapRootMotionView extends __NameMapVisualInstance3D {
    }
    /** Editor-only helper for setting up root motion in [AnimationMixer].  
     *  	  
     *  @link https://docs.godotengine.org/en/4.5/classes/class_rootmotionview.html  
     */
    class RootMotionView<Map extends NodePathMap = any> extends VisualInstance3D<Map> {
        constructor(identifier?: any)
        /** Path to an [AnimationMixer] node to use as a basis for root motion. */
        get animation_path(): NodePath
        set animation_path(value: NodePath | string)
        
        /** The grid's color. */
        get color(): Color
        set color(value: Color)
        
        /** The grid's cell size in 3D units. */
        get cell_size(): float64
        set cell_size(value: float64)
        
        /** The grid's radius in 3D units. The grid's opacity will fade gradually as the distance from the origin increases until this [member radius] is reached. */
        get radius(): float64
        set radius(value: float64)
        
        /** If `true`, the grid's points will all be on the same Y coordinate ( *local*  Y = 0). If `false`, the points' original Y coordinate is preserved. */
        get zero_y(): boolean
        set zero_y(value: boolean)
        /** @deprecated Internal use. Does not exist at runtime. */
        __godotNameMap: __NameMapRootMotionView;
    }
    /** @deprecated Internal use. Does not exist at runtime. */
    interface __NameMapSceneMultiplayer extends __NameMapMultiplayerAPI {
    }
    /** High-level multiplayer API implementation.  
     *  	  
     *  @link https://docs.godotengine.org/en/4.5/classes/class_scenemultiplayer.html  
     */
    class SceneMultiplayer extends MultiplayerAPI {
        constructor(identifier?: any)
        /** Clears the current SceneMultiplayer network state (you shouldn't call this unless you know what you are doing). */
        clear(): void
        
        /** Disconnects the peer identified by [param id], removing it from the list of connected peers, and closing the underlying connection with it. */
        disconnect_peer(id: int64): void
        
        /** Returns the IDs of the peers currently trying to authenticate with this [MultiplayerAPI]. */
        get_authenticating_peers(): PackedInt32Array
        
        /** Sends the specified [param data] to the remote peer identified by [param id] as part of an authentication message. This can be used to authenticate peers, and control when [signal MultiplayerAPI.peer_connected] is emitted (and the remote peer accepted as one of the connected peers). */
        send_auth(id: int64, data: PackedByteArray | byte[] | ArrayBuffer): Error
        
        /** Mark the authentication step as completed for the remote peer identified by [param id]. The [signal MultiplayerAPI.peer_connected] signal will be emitted for this peer once the remote side also completes the authentication. No further authentication messages are expected to be received from this peer.  
         *  If a peer disconnects before completing authentication, either due to a network issue, the [member auth_timeout] expiring, or manually calling [method disconnect_peer], the [signal peer_authentication_failed] signal will be emitted instead of [signal MultiplayerAPI.peer_disconnected].  
         */
        complete_auth(id: int64): Error
        
        /** Sends the given raw [param bytes] to a specific peer identified by [param id] (see [method MultiplayerPeer.set_target_peer]). Default ID is `0`, i.e. broadcast to all peers. */
        send_bytes(bytes: PackedByteArray | byte[] | ArrayBuffer, id?: int64 /* = 0 */, mode?: MultiplayerPeer.TransferMode /* = 2 */, channel?: int64 /* = 0 */): Error
        
        /** The root path to use for RPCs and replication. Instead of an absolute path, a relative path will be used to find the node upon which the RPC should be executed.  
         *  This effectively allows to have different branches of the scene tree to be managed by different MultiplayerAPI, allowing for example to run both client and server in the same scene.  
         */
        get root_path(): NodePath
        set root_path(value: NodePath | string)
        
        /** The callback to execute when receiving authentication data sent via [method send_auth]. If the [Callable] is empty (default), peers will be automatically accepted as soon as they connect. */
        get auth_callback(): Callable
        set auth_callback(value: Callable)
        
        /** If set to a value greater than `0.0`, the maximum duration in seconds peers can stay in the authenticating state, after which the authentication will automatically fail. See the [signal peer_authenticating] and [signal peer_authentication_failed] signals. */
        get auth_timeout(): float64
        set auth_timeout(value: float64)
        
        /** If `true`, the MultiplayerAPI will allow encoding and decoding of object during RPCs.  
         *  **Warning:** Deserialized objects can contain code which gets executed. Do not use this option if the serialized object comes from untrusted sources to avoid potential security threat such as remote code execution.  
         */
        get allow_object_decoding(): boolean
        set allow_object_decoding(value: boolean)
        
        /** If `true`, the MultiplayerAPI's [member MultiplayerAPI.multiplayer_peer] refuses new incoming connections. */
        get refuse_new_connections(): boolean
        set refuse_new_connections(value: boolean)
        
        /** Enable or disable the server feature that notifies clients of other peers' connection/disconnection, and relays messages between them. When this option is `false`, clients won't be automatically notified of other peers and won't be able to send them packets through the server.  
         *      
         *  **Note:** Changing this option while other peers are connected may lead to unexpected behaviors.  
         *      
         *  **Note:** Support for this feature may depend on the current [MultiplayerPeer] configuration. See [method MultiplayerPeer.is_server_relay_supported].  
         */
        get server_relay(): boolean
        set server_relay(value: boolean)
        
        /** Maximum size of each synchronization packet. Higher values increase the chance of receiving full updates in a single frame, but also the chance of packet loss. See [MultiplayerSynchronizer]. */
        get max_sync_packet_size(): int64
        set max_sync_packet_size(value: int64)
        
        /** Maximum size of each delta packet. Higher values increase the chance of receiving full updates in a single frame, but also the chance of causing networking congestion (higher latency, disconnections). See [MultiplayerSynchronizer]. */
        get max_delta_packet_size(): int64
        set max_delta_packet_size(value: int64)
        
        /** Emitted when this MultiplayerAPI's [member MultiplayerAPI.multiplayer_peer] connects to a new peer and a valid [member auth_callback] is set. In this case, the [signal MultiplayerAPI.peer_connected] will not be emitted until [method complete_auth] is called with given peer [param id]. While in this state, the peer will not be included in the list returned by [method MultiplayerAPI.get_peers] (but in the one returned by [method get_authenticating_peers]), and only authentication data will be sent or received. See [method send_auth] for sending authentication data. */
        readonly peer_authenticating: Signal<(id: int64) => void>
        
        /** Emitted when this MultiplayerAPI's [member MultiplayerAPI.multiplayer_peer] disconnects from a peer for which authentication had not yet completed. See [signal peer_authenticating]. */
        readonly peer_authentication_failed: Signal<(id: int64) => void>
        
        /** Emitted when this MultiplayerAPI's [member MultiplayerAPI.multiplayer_peer] receives a [param packet] with custom data (see [method send_bytes]). ID is the peer ID of the peer that sent the packet. */
        readonly peer_packet: Signal<(id: int64, packet: PackedByteArray) => void>
        /** @deprecated Internal use. Does not exist at runtime. */
        __godotNameMap: __NameMapSceneMultiplayer;
    }
    namespace SceneReplicationConfig {
        enum ReplicationMode {
            /** Do not keep the given property synchronized. */
            REPLICATION_MODE_NEVER = 0,
            
            /** Replicate the given property on process by constantly sending updates using unreliable transfer mode. */
            REPLICATION_MODE_ALWAYS = 1,
            
            /** Replicate the given property on process by sending updates using reliable transfer mode when its value changes. */
            REPLICATION_MODE_ON_CHANGE = 2,
        }
    }
    /** @deprecated Internal use. Does not exist at runtime. */
    interface __NameMapSceneReplicationConfig extends __NameMapResource {
    }
    /** Configuration for properties to synchronize with a [MultiplayerSynchronizer].  
     *  	  
     *  @link https://docs.godotengine.org/en/4.5/classes/class_scenereplicationconfig.html  
     */
    class SceneReplicationConfig extends Resource {
        constructor(identifier?: any)
        /** Returns a list of synchronized property [NodePath]s. */
        get_properties(): GArray<NodePath>
        
        /** Adds the property identified by the given [param path] to the list of the properties being synchronized, optionally passing an [param index].  
         *      
         *  **Note:** For details on restrictions and limitations on property synchronization, see [MultiplayerSynchronizer].  
         */
        add_property(path: NodePath | string, index?: int64 /* = -1 */): void
        
        /** Returns `true` if the given [param path] is configured for synchronization. */
        has_property(path: NodePath | string): boolean
        
        /** Removes the property identified by the given [param path] from the configuration. */
        remove_property(path: NodePath | string): void
        
        /** Finds the index of the given [param path]. */
        property_get_index(path: NodePath | string): int64
        
        /** Returns `true` if the property identified by the given [param path] is configured to be synchronized on spawn. */
        property_get_spawn(path: NodePath | string): boolean
        
        /** Sets whether the property identified by the given [param path] is configured to be synchronized on spawn. */
        property_set_spawn(path: NodePath | string, enabled: boolean): void
        
        /** Returns the replication mode for the property identified by the given [param path]. */
        property_get_replication_mode(path: NodePath | string): SceneReplicationConfig.ReplicationMode
        
        /** Sets the synchronization mode for the property identified by the given [param path]. */
        property_set_replication_mode(path: NodePath | string, mode: SceneReplicationConfig.ReplicationMode): void
        
        /** Returns `true` if the property identified by the given [param path] is configured to be synchronized on process. */
        property_get_sync(path: NodePath | string): boolean
        
        /** Sets whether the property identified by the given [param path] is configured to be synchronized on process. */
        property_set_sync(path: NodePath | string, enabled: boolean): void
        
        /** Returns `true` if the property identified by the given [param path] is configured to be reliably synchronized when changes are detected on process. */
        property_get_watch(path: NodePath | string): boolean
        
        /** Sets whether the property identified by the given [param path] is configured to be reliably synchronized when changes are detected on process. */
        property_set_watch(path: NodePath | string, enabled: boolean): void
        /** @deprecated Internal use. Does not exist at runtime. */
        __godotNameMap: __NameMapSceneReplicationConfig;
    }
    namespace SceneState {
        enum GenEditState {
            /** If passed to [method PackedScene.instantiate], blocks edits to the scene state. */
            GEN_EDIT_STATE_DISABLED = 0,
            
            /** If passed to [method PackedScene.instantiate], provides inherited scene resources to the local scene.  
             *      
             *  **Note:** Only available in editor builds.  
             */
            GEN_EDIT_STATE_INSTANCE = 1,
            
            /** If passed to [method PackedScene.instantiate], provides local scene resources to the local scene. Only the main scene should receive the main edit state.  
             *      
             *  **Note:** Only available in editor builds.  
             */
            GEN_EDIT_STATE_MAIN = 2,
            
            /** If passed to [method PackedScene.instantiate], it's similar to [constant GEN_EDIT_STATE_MAIN], but for the case where the scene is being instantiated to be the base of another one.  
             *      
             *  **Note:** Only available in editor builds.  
             */
            GEN_EDIT_STATE_MAIN_INHERITED = 3,
        }
    }
    /** @deprecated Internal use. Does not exist at runtime. */
    interface __NameMapSceneState extends __NameMapRefCounted {
    }
    /** Provides access to a scene file's information.  
     *  	  
     *  @link https://docs.godotengine.org/en/4.5/classes/class_scenestate.html  
     */
    class SceneState extends RefCounted {
        constructor(identifier?: any)
        /** Returns the resource path to the represented [PackedScene]. */
        get_path(): string
        
        /** Returns the [SceneState] of the scene that this scene inherits from, or `null` if it doesn't inherit from any scene. */
        get_base_scene_state(): null | SceneState
        
        /** Returns the number of nodes in the scene.  
         *  The `idx` argument used to query node data in other `get_node_*` methods in the interval `[0, get_node_count() - 1]`.  
         */
        get_node_count(): int64
        
        /** Returns the type of the node at [param idx]. */
        get_node_type(idx: int64): StringName
        
        /** Returns the name of the node at [param idx]. */
        get_node_name(idx: int64): StringName
        
        /** Returns the path to the node at [param idx].  
         *  If [param for_parent] is `true`, returns the path of the [param idx] node's parent instead.  
         */
        get_node_path(idx: int64, for_parent?: boolean /* = false */): NodePath
        
        /** Returns the path to the owner of the node at [param idx], relative to the root node. */
        get_node_owner_path(idx: int64): NodePath
        
        /** Returns `true` if the node at [param idx] is an [InstancePlaceholder]. */
        is_node_instance_placeholder(idx: int64): boolean
        
        /** Returns the path to the represented scene file if the node at [param idx] is an [InstancePlaceholder]. */
        get_node_instance_placeholder(idx: int64): string
        
        /** Returns a [PackedScene] for the node at [param idx] (i.e. the whole branch starting at this node, with its child nodes and resources), or `null` if the node is not an instance. */
        get_node_instance(idx: int64): null | PackedScene
        
        /** Returns the list of group names associated with the node at [param idx]. */
        get_node_groups(idx: int64): PackedStringArray
        
        /** Returns the node's index, which is its position relative to its siblings. This is only relevant and saved in scenes for cases where new nodes are added to an instantiated or inherited scene among siblings from the base scene. Despite the name, this index is not related to the [param idx] argument used here and in other methods. */
        get_node_index(idx: int64): int64
        
        /** Returns the number of exported or overridden properties for the node at [param idx].  
         *  The `prop_idx` argument used to query node property data in other `get_node_property_*` methods in the interval `[0, get_node_property_count() - 1]`.  
         */
        get_node_property_count(idx: int64): int64
        
        /** Returns the name of the property at [param prop_idx] for the node at [param idx]. */
        get_node_property_name(idx: int64, prop_idx: int64): StringName
        
        /** Returns the value of the property at [param prop_idx] for the node at [param idx]. */
        get_node_property_value(idx: int64, prop_idx: int64): any
        
        /** Returns the number of signal connections in the scene.  
         *  The `idx` argument used to query connection metadata in other `get_connection_*` methods in the interval `[0, get_connection_count() - 1]`.  
         */
        get_connection_count(): int64
        
        /** Returns the path to the node that owns the signal at [param idx], relative to the root node. */
        get_connection_source(idx: int64): NodePath
        
        /** Returns the name of the signal at [param idx]. */
        get_connection_signal(idx: int64): StringName
        
        /** Returns the path to the node that owns the method connected to the signal at [param idx], relative to the root node. */
        get_connection_target(idx: int64): NodePath
        
        /** Returns the method connected to the signal at [param idx]. */
        get_connection_method(idx: int64): StringName
        
        /** Returns the connection flags for the signal at [param idx]. See [enum Object.ConnectFlags] constants. */
        get_connection_flags(idx: int64): int64
        
        /** Returns the list of bound parameters for the signal at [param idx]. */
        get_connection_binds(idx: int64): GArray
        
        /** Returns the number of unbound parameters for the signal at [param idx]. */
        get_connection_unbinds(idx: int64): int64
        /** @deprecated Internal use. Does not exist at runtime. */
        __godotNameMap: __NameMapSceneState;
    }
    namespace SceneTree {
        enum GroupCallFlags {
            /** Call nodes within a group with no special behavior (default). */
            GROUP_CALL_DEFAULT = 0,
            
            /** Call nodes within a group in reverse tree hierarchy order (all nested children are called before their respective parent nodes). */
            GROUP_CALL_REVERSE = 1,
            
            /** Call nodes within a group at the end of the current frame (can be either process or physics frame), similar to [method Object.call_deferred]. */
            GROUP_CALL_DEFERRED = 2,
            
            /** Call nodes within a group only once, even if the call is executed many times in the same frame. Must be combined with [constant GROUP_CALL_DEFERRED] to work.  
             *      
             *  **Note:** Different arguments are not taken into account. Therefore, when the same call is executed with different arguments, only the first call will be performed.  
             */
            GROUP_CALL_UNIQUE = 4,
        }
    }
    /** @deprecated Internal use. Does not exist at runtime. */
    interface __NameMapSceneTree extends __NameMapMainLoop {
    }
    /** Manages the game loop via a hierarchy of nodes.  
     *  	  
     *  @link https://docs.godotengine.org/en/4.5/classes/class_scenetree.html  
     */
    class SceneTree extends MainLoop {
        constructor(identifier?: any)
        /** Returns `true` if a node added to the given group [param name] exists in the tree. */
        has_group(name: StringName): boolean
        
        /** Returns `true` if accessibility features are enabled, and accessibility information updates are actively processed. */
        is_accessibility_enabled(): boolean
        
        /** Returns `true` if accessibility features are supported by the OS and enabled in project settings. */
        is_accessibility_supported(): boolean
        
        /** Returns a new [SceneTreeTimer]. After [param time_sec] in seconds have passed, the timer will emit [signal SceneTreeTimer.timeout] and will be automatically freed.  
         *  If [param process_always] is `false`, the timer will be paused when setting [member SceneTree.paused] to `true`.  
         *  If [param process_in_physics] is `true`, the timer will update at the end of the physics frame, instead of the process frame.  
         *  If [param ignore_time_scale] is `true`, the timer will ignore [member Engine.time_scale] and update with the real, elapsed time.  
         *  This method is commonly used to create a one-shot delay timer, as in the following example:  
         *    
         *      
         *  **Note:** The timer is always updated  *after*  all of the nodes in the tree. A node's [method Node._process] method would be called before the timer updates (or [method Node._physics_process] if [param process_in_physics] is set to `true`).  
         */
        create_timer(time_sec: float64, process_always?: boolean /* = true */, process_in_physics?: boolean /* = false */, ignore_time_scale?: boolean /* = false */): SceneTreeTimer
        
        /** Creates and returns a new [Tween] processed in this tree. The Tween will start automatically on the next process frame or physics frame (depending on its [enum Tween.TweenProcessMode]).  
         *      
         *  **Note:** A [Tween] created using this method is not bound to any [Node]. It may keep working until there is nothing left to animate. If you want the [Tween] to be automatically killed when the [Node] is freed, use [method Node.create_tween] or [method Tween.bind_node].  
         */
        create_tween(): Tween
        
        /** Returns an [Array] of currently existing [Tween]s in the tree, including paused tweens. */
        get_processed_tweens(): GArray<Tween>
        
        /** Returns the number of nodes inside this tree. */
        get_node_count(): int64
        
        /** Returns how many physics process steps have been processed, since the application started. This is  *not*  a measurement of elapsed time. See also [signal physics_frame]. For the number of frames rendered, see [method Engine.get_process_frames]. */
        get_frame(): int64
        
        /** Quits the application at the end of the current iteration, with the given [param exit_code].  
         *  By convention, an exit code of `0` indicates success, whereas any other exit code indicates an error. For portability reasons, it should be between `0` and `125` (inclusive).  
         *      
         *  **Note:** On iOS this method doesn't work. Instead, as recommended by the [url=https://developer.apple.com/library/archive/qa/qa1561/_index.html]iOS Human Interface Guidelines[/url], the user is expected to close apps via the Home button.  
         */
        quit(exit_code?: int64 /* = 0 */): void
        
        /** Queues the given [param obj] to be deleted, calling its [method Object.free] at the end of the current frame. This method is similar to [method Node.queue_free]. */
        queue_delete(obj: Object): void
        
        /** Calls the given [param method] on each node inside this tree added to the given [param group]. Use [param flags] to customize this method's behavior (see [enum GroupCallFlags]). Additional arguments for [param method] can be passed at the end of this method. Nodes that cannot call [param method] (either because the method doesn't exist or the arguments do not match) are ignored.  
         *    
         *      
         *  **Note:** In C#, [param method] must be in snake_case when referring to built-in Godot methods. Prefer using the names exposed in the `MethodName` class to avoid allocating a new [StringName] on each call.  
         */
        call_group_flags(flags: int64, group: StringName, method: StringName, ...varargs: any[]): void
        
        /** Calls [method Object.notification] with the given [param notification] to all nodes inside this tree added to the [param group]. Use [param call_flags] to customize this method's behavior (see [enum GroupCallFlags]). */
        notify_group_flags(call_flags: int64, group: StringName, notification: int64): void
        
        /** Sets the given [param property] to [param value] on all nodes inside this tree added to the given [param group]. Nodes that do not have the [param property] are ignored. Use [param call_flags] to customize this method's behavior (see [enum GroupCallFlags]).  
         *      
         *  **Note:** In C#, [param property] must be in snake_case when referring to built-in Godot properties. Prefer using the names exposed in the `PropertyName` class to avoid allocating a new [StringName] on each call.  
         */
        set_group_flags(call_flags: int64, group: StringName, property: string, value: any): void
        
        /** Calls [param method] on each node inside this tree added to the given [param group]. You can pass arguments to [param method] by specifying them at the end of this method call. Nodes that cannot call [param method] (either because the method doesn't exist or the arguments do not match) are ignored. See also [method set_group] and [method notify_group].  
         *      
         *  **Note:** This method acts immediately on all selected nodes at once, which may cause stuttering in some performance-intensive situations.  
         *      
         *  **Note:** In C#, [param method] must be in snake_case when referring to built-in Godot methods. Prefer using the names exposed in the `MethodName` class to avoid allocating a new [StringName] on each call.  
         */
        call_group(group: StringName, method: StringName, ...varargs: any[]): void
        
        /** Calls [method Object.notification] with the given [param notification] to all nodes inside this tree added to the [param group]. See also [url=https://docs.godotengine.org/en/4.5/tutorials/best_practices/godot_notifications.html]Godot notifications[/url] and [method call_group] and [method set_group].  
         *      
         *  **Note:** This method acts immediately on all selected nodes at once, which may cause stuttering in some performance-intensive situations.  
         */
        notify_group(group: StringName, notification: int64): void
        
        /** Sets the given [param property] to [param value] on all nodes inside this tree added to the given [param group]. Nodes that do not have the [param property] are ignored. See also [method call_group] and [method notify_group].  
         *      
         *  **Note:** This method acts immediately on all selected nodes at once, which may cause stuttering in some performance-intensive situations.  
         *      
         *  **Note:** In C#, [param property] must be in snake_case when referring to built-in Godot properties. Prefer using the names exposed in the `PropertyName` class to avoid allocating a new [StringName] on each call.  
         */
        set_group(group: StringName, property: string, value: any): void
        
        /** Returns an [Array] containing all nodes inside this tree, that have been added to the given [param group], in scene hierarchy order. */
        get_nodes_in_group(group: StringName): GArray<Node>
        
        /** Returns the first [Node] found inside the tree, that has been added to the given [param group], in scene hierarchy order. Returns `null` if no match is found. See also [method get_nodes_in_group]. */
        get_first_node_in_group(group: StringName): null | Node
        
        /** Returns the number of nodes assigned to the given group. */
        get_node_count_in_group(group: StringName): int64
        
        /** Changes the running scene to the one at the given [param path], after loading it into a [PackedScene] and creating a new instance.  
         *  Returns [constant OK] on success, [constant ERR_CANT_OPEN] if the [param path] cannot be loaded into a [PackedScene], or [constant ERR_CANT_CREATE] if that scene cannot be instantiated.  
         *      
         *  **Note:** See [method change_scene_to_packed] for details on the order of operations.  
         */
        change_scene_to_file(path: string): Error
        
        /** Changes the running scene to a new instance of the given [PackedScene] (which must be valid).  
         *  Returns [constant OK] on success, [constant ERR_CANT_CREATE] if the scene cannot be instantiated, or [constant ERR_INVALID_PARAMETER] if the scene is invalid.  
         *      
         *  **Note:** Operations happen in the following order when [method change_scene_to_packed] is called:  
         *  1. The current scene node is immediately removed from the tree. From that point, [method Node.get_tree] called on the current (outgoing) scene will return `null`. [member current_scene] will be `null`, too, because the new scene is not available yet.  
         *  2. At the end of the frame, the formerly current scene, already removed from the tree, will be deleted (freed from memory) and then the new scene will be instantiated and added to the tree. [method Node.get_tree] and [member current_scene] will be back to working as usual.  
         *  This ensures that both scenes aren't running at the same time, while still freeing the previous scene in a safe way similar to [method Node.queue_free].  
         *  If you want to reliably access the new scene, await the [signal scene_changed] signal.  
         */
        change_scene_to_packed(packed_scene: PackedScene): Error
        
        /** Reloads the currently active scene, replacing [member current_scene] with a new instance of its original [PackedScene].  
         *  Returns [constant OK] on success, [constant ERR_UNCONFIGURED] if no [member current_scene] is defined, [constant ERR_CANT_OPEN] if [member current_scene] cannot be loaded into a [PackedScene], or [constant ERR_CANT_CREATE] if the scene cannot be instantiated.  
         */
        reload_current_scene(): Error
        
        /** If a current scene is loaded, calling this method will unload it. */
        unload_current_scene(): void
        
        /** Sets a custom [MultiplayerAPI] with the given [param root_path] (controlling also the relative subpaths), or override the default one if [param root_path] is empty.  
         *      
         *  **Note:** No [MultiplayerAPI] must be configured for the subpath containing [param root_path], nested custom multiplayers are not allowed. I.e. if one is configured for `"/root/Foo"` setting one for `"/root/Foo/Bar"` will cause an error.  
         *      
         *  **Note:** [method set_multiplayer] should be called  *before*  the child nodes are ready at the given [param root_path]. If multiplayer nodes like [MultiplayerSpawner] or [MultiplayerSynchronizer] are added to the tree before the custom multiplayer API is set, they will not work.  
         */
        set_multiplayer(multiplayer: MultiplayerAPI, root_path?: NodePath | string /* = '' */): void
        
        /** Searches for the [MultiplayerAPI] configured for the given path, if one does not exist it searches the parent paths until one is found. If the path is empty, or none is found, the default one is returned. See [method set_multiplayer]. */
        get_multiplayer(for_path?: NodePath | string /* = '' */): null | MultiplayerAPI
        
        /** If `true`, the application automatically accepts quitting requests.  
         *  For mobile platforms, see [member quit_on_go_back].  
         */
        get auto_accept_quit(): boolean
        set auto_accept_quit(value: boolean)
        
        /** If `true`, the application quits automatically when navigating back (e.g. using the system "Back" button on Android).  
         *  To handle 'Go Back' button when this option is disabled, use [constant DisplayServer.WINDOW_EVENT_GO_BACK_REQUEST].  
         */
        get quit_on_go_back(): boolean
        set quit_on_go_back(value: boolean)
        
        /** If `true`, collision shapes will be visible when running the game from the editor for debugging purposes.  
         *      
         *  **Note:** This property is not designed to be changed at run-time. Changing the value of [member debug_collisions_hint] while the project is running will not have the desired effect.  
         */
        get debug_collisions_hint(): boolean
        set debug_collisions_hint(value: boolean)
        
        /** If `true`, curves from [Path2D] and [Path3D] nodes will be visible when running the game from the editor for debugging purposes.  
         *      
         *  **Note:** This property is not designed to be changed at run-time. Changing the value of [member debug_paths_hint] while the project is running will not have the desired effect.  
         */
        get debug_paths_hint(): boolean
        set debug_paths_hint(value: boolean)
        
        /** If `true`, navigation polygons will be visible when running the game from the editor for debugging purposes.  
         *      
         *  **Note:** This property is not designed to be changed at run-time. Changing the value of [member debug_navigation_hint] while the project is running will not have the desired effect.  
         */
        get debug_navigation_hint(): boolean
        set debug_navigation_hint(value: boolean)
        
        /** If `true`, the scene tree is considered paused. This causes the following behavior:  
         *  - 2D and 3D physics will be stopped, as well as collision detection and related signals.  
         *  - Depending on each node's [member Node.process_mode], their [method Node._process], [method Node._physics_process] and [method Node._input] callback methods may not called anymore.  
         */
        get paused(): boolean
        set paused(value: boolean)
        
        /** The root of the scene currently being edited in the editor. This is usually a direct child of [member root].  
         *      
         *  **Note:** This property does nothing in release builds.  
         */
        get edited_scene_root(): null | Node
        set edited_scene_root(value: null | Node)
        
        /** The root node of the currently loaded main scene, usually as a direct child of [member root]. See also [method change_scene_to_file], [method change_scene_to_packed], and [method reload_current_scene].  
         *  **Warning:** Setting this property directly may not work as expected, as it does  *not*  add or remove any nodes from this tree.  
         */
        get current_scene(): null | Node
        set current_scene(value: null | Node)
        
        /** The tree's root [Window]. This is top-most [Node] of the scene tree, and is always present. An absolute [NodePath] always starts from this node. Children of the root node may include the loaded [member current_scene], as well as any [url=https://docs.godotengine.org/en/4.5/tutorials/scripting/singletons_autoload.html]AutoLoad[/url] configured in the Project Settings.  
         *  **Warning:** Do not delete this node. This will result in unstable behavior, followed by a crash.  
         */
        get root(): null | Node
        
        /** If `true` (default value), enables automatic polling of the [MultiplayerAPI] for this SceneTree during [signal process_frame].  
         *  If `false`, you need to manually call [method MultiplayerAPI.poll] to process network packets and deliver RPCs. This allows running RPCs in a different loop (e.g. physics, thread, specific time step) and for manual [Mutex] protection when accessing the [MultiplayerAPI] from threads.  
         */
        get multiplayer_poll(): boolean
        set multiplayer_poll(value: boolean)
        
        /** If `true`, the renderer will interpolate the transforms of objects (both physics and non-physics) between the last two transforms, so that smooth motion is seen even when physics ticks do not coincide with rendered frames.  
         *  The default value of this property is controlled by [member ProjectSettings.physics/common/physics_interpolation].  
         *      
         *  **Note:** Although this is a global setting, finer control of individual branches of the [SceneTree] is possible using [member Node.physics_interpolation_mode].  
         */
        get physics_interpolation(): boolean
        set physics_interpolation(value: boolean)
        
        /** Emitted any time the tree's hierarchy changes (nodes being moved, renamed, etc.). */
        readonly tree_changed: Signal<() => void>
        
        /** Emitted after the new scene is added to scene tree and initialized. Can be used to reliably access [member current_scene] when changing scenes.  
         *    
         */
        readonly scene_changed: Signal<() => void>
        
        /** Emitted when the [member Node.process_mode] of any node inside the tree is changed. Only emitted in the editor, to update the visibility of disabled nodes. */
        readonly tree_process_mode_changed: Signal<() => void>
        
        /** Emitted when the [param node] enters this tree. */
        readonly node_added: Signal<(node: Node) => void>
        
        /** Emitted when the [param node] exits this tree. */
        readonly node_removed: Signal<(node: Node) => void>
        
        /** Emitted when the [param node]'s [member Node.name] is changed. */
        readonly node_renamed: Signal<(node: Node) => void>
        
        /** Emitted when the [param node]'s [method Node.update_configuration_warnings] is called. Only emitted in the editor. */
        readonly node_configuration_warning_changed: Signal<(node: Node) => void>
        
        /** Emitted immediately before [method Node._process] is called on every node in this tree. */
        readonly process_frame: Signal<() => void>
        
        /** Emitted immediately before [method Node._physics_process] is called on every node in this tree. */
        readonly physics_frame: Signal<() => void>
        /** @deprecated Internal use. Does not exist at runtime. */
        __godotNameMap: __NameMapSceneTree;
    }
    /** @deprecated Internal use. Does not exist at runtime. */
    interface __NameMapSceneTreeTimer extends __NameMapRefCounted {
    }
    /** One-shot timer.  
     *  	  
     *  @link https://docs.godotengine.org/en/4.5/classes/class_scenetreetimer.html  
     */
    class SceneTreeTimer extends RefCounted {
        constructor(identifier?: any)
        /** The time remaining (in seconds). */
        get time_left(): float64
        set time_left(value: float64)
        
        /** Emitted when the timer reaches 0. */
        readonly timeout: Signal<() => void>
        /** @deprecated Internal use. Does not exist at runtime. */
        __godotNameMap: __NameMapSceneTreeTimer;
    }
    /** @deprecated Internal use. Does not exist at runtime. */
    interface __NameMapScript extends __NameMapResource {
    }
    /** A class stored as a resource.  
     *  	  
     *  @link https://docs.godotengine.org/en/4.5/classes/class_script.html  
     */
    class Script extends Resource {
        constructor(identifier?: any)
        /** Returns `true` if the script can be instantiated. */
        can_instantiate(): boolean
        
        /** Returns `true` if [param base_object] is an instance of this script. */
        instance_has(base_object: Object): boolean
        
        /** Returns `true` if the script contains non-empty source code.  
         *      
         *  **Note:** If a script does not have source code, this does not mean that it is invalid or unusable. For example, a [GDScript] that was exported with binary tokenization has no source code, but still behaves as expected and could be instantiated. This can be checked with [method can_instantiate].  
         */
        has_source_code(): boolean
        
        /** Reloads the script's class implementation. Returns an error code. */
        reload(keep_state?: boolean /* = false */): Error
        
        /** Returns the script directly inherited by this script. */
        get_base_script(): null | Script
        
        /** Returns the script's base type. */
        get_instance_base_type(): StringName
        
        /** Returns the class name associated with the script, if there is one. Returns an empty string otherwise.  
         *  To give the script a global name, you can use the `class_name` keyword in GDScript and the `[GlobalClass]` attribute in C#.  
         *    
         */
        get_global_name(): StringName
        
        /** Returns `true` if the script, or a base class, defines a signal with the given name. */
        has_script_signal(signal_name: StringName): boolean
        
        /** Returns the list of properties in this [Script].  
         *      
         *  **Note:** The dictionaries returned by this method are formatted identically to those returned by [method Object.get_property_list].  
         */
        get_script_property_list(): GArray<GDictionary>
        
        /** Returns the list of methods in this [Script].  
         *      
         *  **Note:** The dictionaries returned by this method are formatted identically to those returned by [method Object.get_method_list].  
         */
        get_script_method_list(): GArray<GDictionary>
        
        /** Returns the list of user signals defined in this [Script].  
         *      
         *  **Note:** The dictionaries returned by this method are formatted identically to those returned by [method Object.get_signal_list].  
         */
        get_script_signal_list(): GArray<GDictionary>
        
        /** Returns a dictionary containing constant names and their values. */
        get_script_constant_map(): GDictionary
        
        /** Returns the default value of the specified property. */
        get_property_default_value(property: StringName): any
        
        /** Returns `true` if the script is a tool script. A tool script can run in the editor. */
        is_tool(): boolean
        
        /** Returns `true` if the script is an abstract script. An abstract script does not have a constructor and cannot be instantiated. */
        is_abstract(): boolean
        
        /** Returns a [Dictionary] mapping method names to their RPC configuration defined by this script. */
        get_rpc_config(): any
        
        /** The script source code or an empty string if source code is not available. When set, does not reload the class implementation automatically. */
        get source_code(): string
        set source_code(value: string)
        /** @deprecated Internal use. Does not exist at runtime. */
        __godotNameMap: __NameMapScript;
    }
    /** @deprecated Internal use. Does not exist at runtime. */
    interface __NameMapScriptBacktrace extends __NameMapRefCounted {
    }
    /** A captured backtrace of a specific script language.  
     *  	  
     *  @link https://docs.godotengine.org/en/4.5/classes/class_scriptbacktrace.html  
     */
    class ScriptBacktrace extends RefCounted {
        constructor(identifier?: any)
        /** Returns the name of the script language that this backtrace was captured from. */
        get_language_name(): string
        
        /** Returns `true` if the backtrace has no stack frames. */
        is_empty(): boolean
        
        /** Returns the number of stack frames in the backtrace. */
        get_frame_count(): int64
        
        /** Returns the name of the function called at the stack frame at the specified index. */
        get_frame_function(index: int64): string
        
        /** Returns the file name of the call site represented by the stack frame at the specified index. */
        get_frame_file(index: int64): string
        
        /** Returns the line number of the call site represented by the stack frame at the specified index. */
        get_frame_line(index: int64): int64
        
        /** Returns the number of global variables (e.g. autoload singletons) in the backtrace.  
         *      
         *  **Note:** This will be non-zero only if the `include_variables` parameter was `true` when capturing the backtrace with [method Engine.capture_script_backtraces].  
         */
        get_global_variable_count(): int64
        
        /** Returns the name of the global variable at the specified index. */
        get_global_variable_name(variable_index: int64): string
        
        /** Returns the value of the global variable at the specified index.  
         *  **Warning:** With GDScript backtraces, the returned [Variant] will be the variable's actual value, including any object references. This means that storing the returned [Variant] will prevent any such object from being deallocated, so it's generally recommended not to do so.  
         */
        get_global_variable_value(variable_index: int64): any
        
        /** Returns the number of local variables in the stack frame at the specified index.  
         *      
         *  **Note:** This will be non-zero only if the `include_variables` parameter was `true` when capturing the backtrace with [method Engine.capture_script_backtraces].  
         */
        get_local_variable_count(frame_index: int64): int64
        
        /** Returns the name of the local variable at the specified [param variable_index] in the stack frame at the specified [param frame_index]. */
        get_local_variable_name(frame_index: int64, variable_index: int64): string
        
        /** Returns the value of the local variable at the specified [param variable_index] in the stack frame at the specified [param frame_index].  
         *  **Warning:** With GDScript backtraces, the returned [Variant] will be the variable's actual value, including any object references. This means that storing the returned [Variant] will prevent any such object from being deallocated, so it's generally recommended not to do so.  
         */
        get_local_variable_value(frame_index: int64, variable_index: int64): any
        
        /** Returns the number of member variables in the stack frame at the specified index.  
         *      
         *  **Note:** This will be non-zero only if the `include_variables` parameter was `true` when capturing the backtrace with [method Engine.capture_script_backtraces].  
         */
        get_member_variable_count(frame_index: int64): int64
        
        /** Returns the name of the member variable at the specified [param variable_index] in the stack frame at the specified [param frame_index]. */
        get_member_variable_name(frame_index: int64, variable_index: int64): string
        
        /** Returns the value of the member variable at the specified [param variable_index] in the stack frame at the specified [param frame_index].  
         *  **Warning:** With GDScript backtraces, the returned [Variant] will be the variable's actual value, including any object references. This means that storing the returned [Variant] will prevent any such object from being deallocated, so it's generally recommended not to do so.  
         */
        get_member_variable_value(frame_index: int64, variable_index: int64): any
        
        /** Converts the backtrace to a [String], where the entire string will be indented by [param indent_all] number of spaces, and the individual stack frames will be additionally indented by [param indent_frames] number of spaces.  
         *      
         *  **Note:** Calling [method Object.to_string] on a [ScriptBacktrace] will produce the same output as calling [method format] with all parameters left at their default values.  
         */
        format(indent_all?: int64 /* = 0 */, indent_frames?: int64 /* = 4 */): string
        /** @deprecated Internal use. Does not exist at runtime. */
        __godotNameMap: __NameMapScriptBacktrace;
    }
    /** @deprecated Internal use. Does not exist at runtime. */
    interface __NameMapScriptCreateDialog extends __NameMapConfirmationDialog {
    }
    /** Godot editor's popup dialog for creating new [Script] files.  
     *  	  
     *  @link https://docs.godotengine.org/en/4.5/classes/class_scriptcreatedialog.html  
     */
    class ScriptCreateDialog<Map extends NodePathMap = any> extends ConfirmationDialog<Map> {
        constructor(identifier?: any)
        /** Prefills required fields to configure the ScriptCreateDialog for use. */
        config(inherits: string, path: string, built_in_enabled?: boolean /* = true */, load_enabled?: boolean /* = true */): void
        
        /** Emitted when the user clicks the OK button. */
        readonly script_created: Signal<(script: Script) => void>
        /** @deprecated Internal use. Does not exist at runtime. */
        __godotNameMap: __NameMapScriptCreateDialog;
    }
    /** @deprecated Internal use. Does not exist at runtime. */
    interface __NameMapScriptEditor extends __NameMapPanelContainer {
    }
    /** Godot editor's script editor.  
     *  	  
     *  @link https://docs.godotengine.org/en/4.5/classes/class_scripteditor.html  
     */
    class ScriptEditor<Map extends NodePathMap = any> extends PanelContainer<Map> {
        constructor(identifier?: any)
        _help_tab_goto(_unnamed_arg0: string, _unnamed_arg1: string): boolean
        
        /** Returns the [ScriptEditorBase] object that the user is currently editing. */
        get_current_editor(): null | ScriptEditorBase
        
        /** Returns an array with all [ScriptEditorBase] objects which are currently open in editor. */
        get_open_script_editors(): GArray<ScriptEditorBase>
        
        /** Returns array of breakpoints. */
        get_breakpoints(): PackedStringArray
        
        /** Registers the [EditorSyntaxHighlighter] to the editor, the [EditorSyntaxHighlighter] will be available on all open scripts.  
         *      
         *  **Note:** Does not apply to scripts that are already opened.  
         */
        register_syntax_highlighter(syntax_highlighter: EditorSyntaxHighlighter): void
        
        /** Unregisters the [EditorSyntaxHighlighter] from the editor.  
         *      
         *  **Note:** The [EditorSyntaxHighlighter] will still be applied to scripts that are already opened.  
         */
        unregister_syntax_highlighter(syntax_highlighter: EditorSyntaxHighlighter): void
        
        /** Goes to the specified line in the current script. */
        goto_line(line_number: int64): void
        
        /** Returns a [Script] that is currently active in editor. */
        get_current_script(): null | Script
        
        /** Returns an array with all [Script] objects which are currently open in editor. */
        get_open_scripts(): GArray<Script>
        
        /** Opens the script create dialog. The script will extend [param base_name]. The file extension can be omitted from [param base_path]. It will be added based on the selected scripting language. */
        open_script_create_dialog(base_name: string, base_path: string): void
        
        /** Opens help for the given topic. The [param topic] is an encoded string that controls which class, method, constant, signal, annotation, property, or theme item should be focused.  
         *  The supported [param topic] formats include `class_name:class`, `class_method:class:method`, `class_constant:class:constant`, `class_signal:class:signal`, `class_annotation:class:@annotation`, `class_property:class:property`, and `class_theme_item:class:item`, where `class` is the class name, `method` is the method name, `constant` is the constant name, `signal` is the signal name, `annotation` is the annotation name, `property` is the property name, and `item` is the theme item.  
         *    
         */
        goto_help(topic: string): void
        
        /** Updates the documentation for the given [param script].  
         *      
         *  **Note:** This should be called whenever the script is changed to keep the open documentation state up to date.  
         */
        update_docs_from_script(script: Script): void
        
        /** Removes the documentation for the given [param script].  
         *      
         *  **Note:** This should be called whenever the script is changed to keep the open documentation state up to date.  
         */
        clear_docs_from_script(script: Script): void
        
        /** Emitted when user changed active script. Argument is a freshly activated [Script]. */
        readonly editor_script_changed: Signal<(script: Script) => void>
        
        /** Emitted when editor is about to close the active script. Argument is a [Script] that is going to be closed. */
        readonly script_close: Signal<(script: Script) => void>
        /** @deprecated Internal use. Does not exist at runtime. */
        __godotNameMap: __NameMapScriptEditor;
    }
    /** @deprecated Internal use. Does not exist at runtime. */
    interface __NameMapScriptEditorBase extends __NameMapVBoxContainer {
    }
    /** Base editor for editing scripts in the [ScriptEditor].  
     *  	  
     *  @link https://docs.godotengine.org/en/4.5/classes/class_scripteditorbase.html  
     */
    class ScriptEditorBase<Map extends NodePathMap = any> extends VBoxContainer<Map> {
        constructor(identifier?: any)
        /** Returns the underlying [Control] used for editing scripts. For text scripts, this is a [CodeEdit]. */
        get_base_editor(): null | Control
        
        /** Adds an [EditorSyntaxHighlighter] to the open script. */
        add_syntax_highlighter(highlighter: EditorSyntaxHighlighter): void
        
        /** Emitted after script validation or when the edited resource has changed. */
        readonly name_changed: Signal<() => void>
        
        /** Emitted after script validation. */
        readonly edited_script_changed: Signal<() => void>
        
        /** Emitted when the user requests contextual help. */
        readonly request_help: Signal<(topic: string) => void>
        
        /** Emitted when the user requests to view a specific line of a script, similar to [signal go_to_method]. */
        readonly request_open_script_at_line: Signal<(script: Object, line: int64) => void>
        
        /** Emitted when the user contextual goto and the item is in the same script. */
        readonly request_save_history: Signal<() => void>
        
        /** Emitted when the user changes current script or moves caret by 10 or more columns within the same script. */
        readonly request_save_previous_state: Signal<(state: GDictionary) => void>
        
        /** Emitted when the user requests a specific documentation page. */
        readonly go_to_help: Signal<(what: string) => void>
        
        /** Emitted when the user request to search text in the file system. */
        readonly search_in_files_requested: Signal<(text: string) => void>
        
        /** Emitted when the user request to find and replace text in the file system. */
        readonly replace_in_files_requested: Signal<(text: string) => void>
        
        /** Emitted when the user requests to view a specific method of a script, similar to [signal request_open_script_at_line]. */
        readonly go_to_method: Signal<(script: Object, method: string) => void>
        /** @deprecated Internal use. Does not exist at runtime. */
        __godotNameMap: __NameMapScriptEditorBase;
    }
    /** @deprecated Internal use. Does not exist at runtime. */
    interface __NameMapScriptExtension extends __NameMapScript {
    }
    /** @link https://docs.godotengine.org/en/4.5/classes/class_scriptextension.html */
    class ScriptExtension extends Script {
        constructor(identifier?: any)
        /* gdvirtual */ _editor_can_reload_from_file(): boolean
        /* gdvirtual */ _placeholder_erased(placeholder: int64): void
        /* gdvirtual */ _can_instantiate(): boolean
        /* gdvirtual */ _get_base_script(): null | Script
        /* gdvirtual */ _get_global_name(): StringName
        /* gdvirtual */ _inherits_script(script: Script): boolean
        /* gdvirtual */ _get_instance_base_type(): StringName
        /* gdvirtual */ _instance_create(for_object: Object): int64
        /* gdvirtual */ _placeholder_instance_create(for_object: Object): int64
        /* gdvirtual */ _instance_has(object: Object): boolean
        /* gdvirtual */ _has_source_code(): boolean
        /* gdvirtual */ _get_source_code(): string
        /* gdvirtual */ _set_source_code(code: string): void
        /* gdvirtual */ _reload(keep_state: boolean): Error
        /* gdvirtual */ _get_doc_class_name(): StringName
        /* gdvirtual */ _get_documentation(): GArray<GDictionary>
        /* gdvirtual */ _get_class_icon_path(): string
        /* gdvirtual */ _has_method(method: StringName): boolean
        /* gdvirtual */ _has_static_method(method: StringName): boolean
        
        /** Return the expected argument count for the given [param method], or `null` if it can't be determined (which will then fall back to the default behavior). */
        /* gdvirtual */ _get_script_method_argument_count(method: StringName): any
        /* gdvirtual */ _get_method_info(method: StringName): GDictionary
        /* gdvirtual */ _is_tool(): boolean
        /* gdvirtual */ _is_valid(): boolean
        
        /** Returns `true` if the script is an abstract script. Abstract scripts cannot be instantiated directly, instead other scripts should inherit them. Abstract scripts will be either unselectable or hidden in the Create New Node dialog (unselectable if there are non-abstract classes inheriting it, otherwise hidden). */
        /* gdvirtual */ _is_abstract(): boolean
        /* gdvirtual */ _get_language(): null | ScriptLanguage
        /* gdvirtual */ _has_script_signal(signal: StringName): boolean
        /* gdvirtual */ _get_script_signal_list(): GArray<GDictionary>
        /* gdvirtual */ _has_property_default_value(property: StringName): boolean
        /* gdvirtual */ _get_property_default_value(property: StringName): any
        /* gdvirtual */ _update_exports(): void
        /* gdvirtual */ _get_script_method_list(): GArray<GDictionary>
        /* gdvirtual */ _get_script_property_list(): GArray<GDictionary>
        /* gdvirtual */ _get_member_line(member: StringName): int64
        /* gdvirtual */ _get_constants(): GDictionary
        /* gdvirtual */ _get_members(): GArray<StringName>
        /* gdvirtual */ _is_placeholder_fallback_enabled(): boolean
        /* gdvirtual */ _get_rpc_config(): any
        /** @deprecated Internal use. Does not exist at runtime. */
        __godotNameMap: __NameMapScriptExtension;
    }
    namespace ScriptLanguage {
        enum ScriptNameCasing {
            SCRIPT_NAME_CASING_AUTO = 0,
            SCRIPT_NAME_CASING_PASCAL_CASE = 1,
            SCRIPT_NAME_CASING_SNAKE_CASE = 2,
            SCRIPT_NAME_CASING_KEBAB_CASE = 3,
            SCRIPT_NAME_CASING_CAMEL_CASE = 4,
        }
    }
    /** @deprecated Internal use. Does not exist at runtime. */
    interface __NameMapScriptLanguage extends __NameMapObject {
    }
    /** @link https://docs.godotengine.org/en/4.5/classes/class_scriptlanguage.html */
    class ScriptLanguage extends Object {
        constructor(identifier?: any)
        /** @deprecated Internal use. Does not exist at runtime. */
        __godotNameMap: __NameMapScriptLanguage;
    }
    namespace ScriptLanguageExtension {
        enum LookupResultType {
            LOOKUP_RESULT_SCRIPT_LOCATION = 0,
            LOOKUP_RESULT_CLASS = 1,
            LOOKUP_RESULT_CLASS_CONSTANT = 2,
            LOOKUP_RESULT_CLASS_PROPERTY = 3,
            LOOKUP_RESULT_CLASS_METHOD = 4,
            LOOKUP_RESULT_CLASS_SIGNAL = 5,
            LOOKUP_RESULT_CLASS_ENUM = 6,
            LOOKUP_RESULT_CLASS_TBD_GLOBALSCOPE = 7,
            LOOKUP_RESULT_CLASS_ANNOTATION = 8,
            LOOKUP_RESULT_LOCAL_CONSTANT = 9,
            LOOKUP_RESULT_LOCAL_VARIABLE = 10,
            LOOKUP_RESULT_MAX = 11,
        }
        enum CodeCompletionLocation {
            /** The option is local to the location of the code completion query - e.g. a local variable. Subsequent value of location represent options from the outer class, the exact value represent how far they are (in terms of inner classes). */
            LOCATION_LOCAL = 0,
            
            /** The option is from the containing class or a parent class, relative to the location of the code completion query. Perform a bitwise OR with the class depth (e.g. `0` for the local class, `1` for the parent, `2` for the grandparent, etc.) to store the depth of an option in the class or a parent class. */
            LOCATION_PARENT_MASK = 256,
            
            /** The option is from user code which is not local and not in a derived class (e.g. Autoload Singletons). */
            LOCATION_OTHER_USER_CODE = 512,
            
            /** The option is from other engine code, not covered by the other enum constants - e.g. built-in classes. */
            LOCATION_OTHER = 1024,
        }
        enum CodeCompletionKind {
            CODE_COMPLETION_KIND_CLASS = 0,
            CODE_COMPLETION_KIND_FUNCTION = 1,
            CODE_COMPLETION_KIND_SIGNAL = 2,
            CODE_COMPLETION_KIND_VARIABLE = 3,
            CODE_COMPLETION_KIND_MEMBER = 4,
            CODE_COMPLETION_KIND_ENUM = 5,
            CODE_COMPLETION_KIND_CONSTANT = 6,
            CODE_COMPLETION_KIND_NODE_PATH = 7,
            CODE_COMPLETION_KIND_FILE_PATH = 8,
            CODE_COMPLETION_KIND_PLAIN_TEXT = 9,
            CODE_COMPLETION_KIND_MAX = 10,
        }
    }
    /** @deprecated Internal use. Does not exist at runtime. */
    interface __NameMapScriptLanguageExtension extends __NameMapScriptLanguage {
    }
    /** @link https://docs.godotengine.org/en/4.5/classes/class_scriptlanguageextension.html */
    class ScriptLanguageExtension extends ScriptLanguage {
        constructor(identifier?: any)
        /* gdvirtual */ _get_name(): string
        /* gdvirtual */ _init(): void
        /* gdvirtual */ _get_type(): string
        /* gdvirtual */ _get_extension(): string
        /* gdvirtual */ _finish(): void
        /* gdvirtual */ _get_reserved_words(): PackedStringArray
        /* gdvirtual */ _is_control_flow_keyword(keyword: string): boolean
        /* gdvirtual */ _get_comment_delimiters(): PackedStringArray
        /* gdvirtual */ _get_doc_comment_delimiters(): PackedStringArray
        /* gdvirtual */ _get_string_delimiters(): PackedStringArray
        /* gdvirtual */ _make_template(template: string, class_name: string, base_class_name: string): null | Script
        /* gdvirtual */ _get_built_in_templates(object: StringName): GArray<GDictionary>
        /* gdvirtual */ _is_using_templates(): boolean
        /* gdvirtual */ _validate(script: string, path: string, validate_functions: boolean, validate_errors: boolean, validate_warnings: boolean, validate_safe_lines: boolean): GDictionary
        /* gdvirtual */ _validate_path(path: string): string
        /* gdvirtual */ _create_script(): null | Object
        /* gdvirtual */ _has_named_classes(): boolean
        /* gdvirtual */ _supports_builtin_mode(): boolean
        /* gdvirtual */ _supports_documentation(): boolean
        /* gdvirtual */ _can_inherit_from_file(): boolean
        
        /** Returns the line where the function is defined in the code, or `-1` if the function is not present. */
        /* gdvirtual */ _find_function(function_: string, code: string): int64
        /* gdvirtual */ _make_function(class_name: string, function_name: string, function_args: PackedStringArray | string[]): string
        /* gdvirtual */ _can_make_function(): boolean
        /* gdvirtual */ _open_in_external_editor(script: Script, line: int64, column: int64): Error
        /* gdvirtual */ _overrides_external_editor(): boolean
        /* gdvirtual */ _preferred_file_name_casing(): ScriptLanguage.ScriptNameCasing
        /* gdvirtual */ _complete_code(code: string, path: string, owner: Object): GDictionary
        /* gdvirtual */ _lookup_code(code: string, symbol: string, path: string, owner: Object): GDictionary
        /* gdvirtual */ _auto_indent_code(code: string, from_line: int64, to_line: int64): string
        /* gdvirtual */ _add_global_constant(name: StringName, value: any): void
        /* gdvirtual */ _add_named_global_constant(name: StringName, value: any): void
        /* gdvirtual */ _remove_named_global_constant(name: StringName): void
        /* gdvirtual */ _thread_enter(): void
        /* gdvirtual */ _thread_exit(): void
        /* gdvirtual */ _debug_get_error(): string
        /* gdvirtual */ _debug_get_stack_level_count(): int64
        /* gdvirtual */ _debug_get_stack_level_line(level: int64): int64
        /* gdvirtual */ _debug_get_stack_level_function(level: int64): string
        
        /** Returns the source associated with a given debug stack position. */
        /* gdvirtual */ _debug_get_stack_level_source(level: int64): string
        /* gdvirtual */ _debug_get_stack_level_locals(level: int64, max_subitems: int64, max_depth: int64): GDictionary
        /* gdvirtual */ _debug_get_stack_level_members(level: int64, max_subitems: int64, max_depth: int64): GDictionary
        /* gdvirtual */ _debug_get_stack_level_instance(level: int64): int64
        /* gdvirtual */ _debug_get_globals(max_subitems: int64, max_depth: int64): GDictionary
        /* gdvirtual */ _debug_parse_stack_level_expression(level: int64, expression: string, max_subitems: int64, max_depth: int64): string
        /* gdvirtual */ _debug_get_current_stack_info(): GArray<GDictionary>
        /* gdvirtual */ _reload_all_scripts(): void
        /* gdvirtual */ _reload_scripts(scripts: GArray, soft_reload: boolean): void
        /* gdvirtual */ _reload_tool_script(script: Script, soft_reload: boolean): void
        /* gdvirtual */ _get_recognized_extensions(): PackedStringArray
        /* gdvirtual */ _get_public_functions(): GArray<GDictionary>
        /* gdvirtual */ _get_public_constants(): GDictionary
        /* gdvirtual */ _get_public_annotations(): GArray<GDictionary>
        /* gdvirtual */ _profiling_start(): void
        /* gdvirtual */ _profiling_stop(): void
        /* gdvirtual */ _profiling_set_save_native_calls(enable: boolean): void
        /* gdvirtual */ _profiling_get_accumulated_data(info_array: int64, info_max: int64): int64
        /* gdvirtual */ _profiling_get_frame_data(info_array: int64, info_max: int64): int64
        /* gdvirtual */ _frame(): void
        /* gdvirtual */ _handles_global_class_type(type: string): boolean
        /* gdvirtual */ _get_global_class_name(path: string): GDictionary
        /** @deprecated Internal use. Does not exist at runtime. */
        __godotNameMap: __NameMapScriptLanguageExtension;
    }
    /** @deprecated Internal use. Does not exist at runtime. */
    interface __NameMapScrollBar extends __NameMapRange {
    }
    /** Abstract base class for scrollbars.  
     *  	  
     *  @link https://docs.godotengine.org/en/4.5/classes/class_scrollbar.html  
     */
    class ScrollBar<Map extends NodePathMap = any> extends Range<Map> {
        constructor(identifier?: any)
        /** Overrides the step used when clicking increment and decrement buttons or when using arrow keys when the [ScrollBar] is focused. */
        get custom_step(): float64
        set custom_step(value: float64)
        
        /** Emitted when the scrollbar is being scrolled. */
        readonly scrolling: Signal<() => void>
        /** @deprecated Internal use. Does not exist at runtime. */
        __godotNameMap: __NameMapScrollBar;
    }
    namespace ScrollContainer {
        enum ScrollMode {
            /** Scrolling disabled, scrollbar will be invisible. */
            SCROLL_MODE_DISABLED = 0,
            
            /** Scrolling enabled, scrollbar will be visible only if necessary, i.e. container's content is bigger than the container. */
            SCROLL_MODE_AUTO = 1,
            
            /** Scrolling enabled, scrollbar will be always visible. */
            SCROLL_MODE_SHOW_ALWAYS = 2,
            
            /** Scrolling enabled, scrollbar will be hidden. */
            SCROLL_MODE_SHOW_NEVER = 3,
            
            /** Combines [constant SCROLL_MODE_AUTO] and [constant SCROLL_MODE_SHOW_ALWAYS]. The scrollbar is only visible if necessary, but the content size is adjusted as if it was always visible. It's useful for ensuring that content size stays the same regardless if the scrollbar is visible. */
            SCROLL_MODE_RESERVE = 4,
        }
    }
    /** @deprecated Internal use. Does not exist at runtime. */
    interface __NameMapScrollContainer extends __NameMapContainer {
    }
    /** A container used to provide scrollbars to a child control when needed.  
     *  	  
     *  @link https://docs.godotengine.org/en/4.5/classes/class_scrollcontainer.html  
     */
    class ScrollContainer<Map extends NodePathMap = any> extends Container<Map> {
        constructor(identifier?: any)
        /** Returns the horizontal scrollbar [HScrollBar] of this [ScrollContainer].  
         *  **Warning:** This is a required internal node, removing and freeing it may cause a crash. If you wish to disable or hide a scrollbar, you can use [member horizontal_scroll_mode].  
         */
        get_h_scroll_bar(): null | HScrollBar
        
        /** Returns the vertical scrollbar [VScrollBar] of this [ScrollContainer].  
         *  **Warning:** This is a required internal node, removing and freeing it may cause a crash. If you wish to disable or hide a scrollbar, you can use [member vertical_scroll_mode].  
         */
        get_v_scroll_bar(): null | VScrollBar
        
        /** Ensures the given [param control] is visible (must be a direct or indirect child of the ScrollContainer). Used by [member follow_focus].  
         *      
         *  **Note:** This will not work on a node that was just added during the same frame. If you want to scroll to a newly added child, you must wait until the next frame using [signal SceneTree.process_frame]:  
         *    
         */
        ensure_control_visible(control: Control): void
        
        /** If `true`, the ScrollContainer will automatically scroll to focused children (including indirect children) to make sure they are fully visible. */
        get follow_focus(): boolean
        set follow_focus(value: boolean)
        
        /** If `true`, [theme_item focus] is drawn when the ScrollContainer or one of its descendant nodes is focused. */
        get draw_focus_border(): boolean
        set draw_focus_border(value: boolean)
        
        /** The current horizontal scroll value.  
         *      
         *  **Note:** If you are setting this value in the [method Node._ready] function or earlier, it needs to be wrapped with [method Object.set_deferred], since scroll bar's [member Range.max_value] is not initialized yet.  
         *    
         */
        get scroll_horizontal(): int64
        set scroll_horizontal(value: int64)
        
        /** The current vertical scroll value.  
         *      
         *  **Note:** Setting it early needs to be deferred, just like in [member scroll_horizontal].  
         *    
         */
        get scroll_vertical(): int64
        set scroll_vertical(value: int64)
        
        /** Overrides the [member ScrollBar.custom_step] used when clicking the internal scroll bar's horizontal increment and decrement buttons or when using arrow keys when the [ScrollBar] is focused. */
        get scroll_horizontal_custom_step(): float64
        set scroll_horizontal_custom_step(value: float64)
        
        /** Overrides the [member ScrollBar.custom_step] used when clicking the internal scroll bar's vertical increment and decrement buttons or when using arrow keys when the [ScrollBar] is focused. */
        get scroll_vertical_custom_step(): float64
        set scroll_vertical_custom_step(value: float64)
        
        /** Controls whether horizontal scrollbar can be used and when it should be visible. */
        get horizontal_scroll_mode(): int64
        set horizontal_scroll_mode(value: int64)
        
        /** Controls whether vertical scrollbar can be used and when it should be visible. */
        get vertical_scroll_mode(): int64
        set vertical_scroll_mode(value: int64)
        
        /** Deadzone for touch scrolling. Lower deadzone makes the scrolling more sensitive. */
        get scroll_deadzone(): int64
        set scroll_deadzone(value: int64)
        
        /** Emitted when scrolling starts when dragging the scrollable area w *ith a touch event* . This signal is  *not*  emitted when scrolling by dragging the scrollbar, scrolling with the mouse wheel or scrolling with keyboard/gamepad events.  
         *      
         *  **Note:** This signal is only emitted on Android or iOS, or on desktop/web platforms when [member ProjectSettings.input_devices/pointing/emulate_touch_from_mouse] is enabled.  
         */
        readonly scroll_started: Signal<() => void>
        
        /** Emitted when scrolling stops when dragging the scrollable area  *with a touch event* . This signal is  *not*  emitted when scrolling by dragging the scrollbar, scrolling with the mouse wheel or scrolling with keyboard/gamepad events.  
         *      
         *  **Note:** This signal is only emitted on Android or iOS, or on desktop/web platforms when [member ProjectSettings.input_devices/pointing/emulate_touch_from_mouse] is enabled.  
         */
        readonly scroll_ended: Signal<() => void>
        /** @deprecated Internal use. Does not exist at runtime. */
        __godotNameMap: __NameMapScrollContainer;
    }
    /** @deprecated Internal use. Does not exist at runtime. */
    interface __NameMapSegmentShape2D extends __NameMapShape2D {
    }
    /** A 2D line segment shape used for physics collision.  
     *  	  
     *  @link https://docs.godotengine.org/en/4.5/classes/class_segmentshape2d.html  
     */
    class SegmentShape2D extends Shape2D {
        constructor(identifier?: any)
        /** The segment's first point position. */
        get a(): Vector2
        set a(value: Vector2)
        
        /** The segment's second point position. */
        get b(): Vector2
        set b(value: Vector2)
        /** @deprecated Internal use. Does not exist at runtime. */
        __godotNameMap: __NameMapSegmentShape2D;
    }
    /** @deprecated Internal use. Does not exist at runtime. */
    interface __NameMapSeparationRayShape2D extends __NameMapShape2D {
    }
    /** A 2D ray shape used for physics collision that tries to separate itself from any collider.  
     *  	  
     *  @link https://docs.godotengine.org/en/4.5/classes/class_separationrayshape2d.html  
     */
    class SeparationRayShape2D extends Shape2D {
        constructor(identifier?: any)
        /** The ray's length. */
        get length(): float64
        set length(value: float64)
        
        /** If `false` (default), the shape always separates and returns a normal along its own direction.  
         *  If `true`, the shape can return the correct normal and separate in any direction, allowing sliding motion on slopes.  
         */
        get slide_on_slope(): boolean
        set slide_on_slope(value: boolean)
        /** @deprecated Internal use. Does not exist at runtime. */
        __godotNameMap: __NameMapSeparationRayShape2D;
    }
    /** @deprecated Internal use. Does not exist at runtime. */
    interface __NameMapSeparationRayShape3D extends __NameMapShape3D {
    }
    /** A 3D ray shape used for physics collision that tries to separate itself from any collider.  
     *  	  
     *  @link https://docs.godotengine.org/en/4.5/classes/class_separationrayshape3d.html  
     */
    class SeparationRayShape3D extends Shape3D {
        constructor(identifier?: any)
        /** The ray's length. */
        get length(): float64
        set length(value: float64)
        
        /** If `false` (default), the shape always separates and returns a normal along its own direction.  
         *  If `true`, the shape can return the correct normal and separate in any direction, allowing sliding motion on slopes.  
         */
        get slide_on_slope(): boolean
        set slide_on_slope(value: boolean)
        /** @deprecated Internal use. Does not exist at runtime. */
        __godotNameMap: __NameMapSeparationRayShape3D;
    }
    /** @deprecated Internal use. Does not exist at runtime. */
    interface __NameMapSeparator extends __NameMapControl {
    }
    /** Abstract base class for separators.  
     *  	  
     *  @link https://docs.godotengine.org/en/4.5/classes/class_separator.html  
     */
    class Separator<Map extends NodePathMap = any> extends Control<Map> {
        constructor(identifier?: any)
        /** @deprecated Internal use. Does not exist at runtime. */
        __godotNameMap: __NameMapSeparator;
    }
    namespace Shader {
        enum Mode {
            /** Mode used to draw all 3D objects. */
            MODE_SPATIAL = 0,
            
            /** Mode used to draw all 2D objects. */
            MODE_CANVAS_ITEM = 1,
            
            /** Mode used to calculate particle information on a per-particle basis. Not used for drawing. */
            MODE_PARTICLES = 2,
            
            /** Mode used for drawing skies. Only works with shaders attached to [Sky] objects. */
            MODE_SKY = 3,
            
            /** Mode used for setting the color and density of volumetric fog effect. */
            MODE_FOG = 4,
        }
    }
    /** @deprecated Internal use. Does not exist at runtime. */
    interface __NameMapShader extends __NameMapResource {
    }
    /** A shader implemented in the Godot shading language.  
     *  	  
     *  @link https://docs.godotengine.org/en/4.5/classes/class_shader.html  
     */
    class Shader extends Resource {
        constructor(identifier?: any)
        /** Returns the shader mode for the shader. */
        get_mode(): Shader.Mode
        
        /** Sets the default texture to be used with a texture uniform. The default is used if a texture is not set in the [ShaderMaterial].  
         *      
         *  **Note:** [param name] must match the name of the uniform in the code exactly.  
         *      
         *  **Note:** If the sampler array is used use [param index] to access the specified texture.  
         */
        set_default_texture_parameter(name: StringName, texture: Texture, index?: int64 /* = 0 */): void
        
        /** Returns the texture that is set as default for the specified parameter.  
         *      
         *  **Note:** [param name] must match the name of the uniform in the code exactly.  
         *      
         *  **Note:** If the sampler array is used use [param index] to access the specified texture.  
         */
        get_default_texture_parameter(name: StringName, index?: int64 /* = 0 */): null | Texture
        
        /** Returns the list of shader uniforms that can be assigned to a [ShaderMaterial], for use with [method ShaderMaterial.set_shader_parameter] and [method ShaderMaterial.get_shader_parameter]. The parameters returned are contained in dictionaries in a similar format to the ones returned by [method Object.get_property_list].  
         *  If argument [param get_groups] is `true`, parameter grouping hints are also included in the list.  
         */
        get_shader_uniform_list(get_groups?: boolean /* = false */): GArray
        
        /** Only available when running in the editor. Opens a popup that visualizes the generated shader code, including all variants and internal shader code. See also [method Material.inspect_native_shader_code]. */
        inspect_native_shader_code(): void
        
        /** Returns the shader's code as the user has written it, not the full generated code used internally. */
        get code(): string
        set code(value: string)
        /** @deprecated Internal use. Does not exist at runtime. */
        __godotNameMap: __NameMapShader;
    }
    /** @deprecated Internal use. Does not exist at runtime. */
    interface __NameMapShaderGlobalsOverride extends __NameMapNode {
    }
    /** A node used to override global shader parameters' values in a scene.  
     *  	  
     *  @link https://docs.godotengine.org/en/4.5/classes/class_shaderglobalsoverride.html  
     */
    class ShaderGlobalsOverride<Map extends NodePathMap = any> extends Node<Map> {
        constructor(identifier?: any)
        _activate(): void
        /** @deprecated Internal use. Does not exist at runtime. */
        __godotNameMap: __NameMapShaderGlobalsOverride;
    }
    /** @deprecated Internal use. Does not exist at runtime. */
    interface __NameMapShaderInclude extends __NameMapResource {
    }
    /** A snippet of shader code to be included in a [Shader] with `#include`.  
     *  	  
     *  @link https://docs.godotengine.org/en/4.5/classes/class_shaderinclude.html  
     */
    class ShaderInclude extends Resource {
        constructor(identifier?: any)
        /** Returns the code of the shader include file. The returned text is what the user has written, not the full generated code used internally. */
        get code(): string
        set code(value: string)
        /** @deprecated Internal use. Does not exist at runtime. */
        __godotNameMap: __NameMapShaderInclude;
    }
    /** @deprecated Internal use. Does not exist at runtime. */
    interface __NameMapShaderIncludeDB extends __NameMapObject {
    }
    /** Internal database of built in shader include files.  
     *  	  
     *  @link https://docs.godotengine.org/en/4.5/classes/class_shaderincludedb.html  
     */
    class ShaderIncludeDB extends Object {
        constructor(identifier?: any)
        /** Returns a list of built-in include files that are currently registered. */
        static list_built_in_include_files(): PackedStringArray
        
        /** Returns `true` if an include file with this name exists. */
        static has_built_in_include_file(filename: string): boolean
        
        /** Returns the code for the built-in shader fragment. You can also access this in your shader code through `#include "filename"`. */
        static get_built_in_include_file(filename: string): string
        /** @deprecated Internal use. Does not exist at runtime. */
        __godotNameMap: __NameMapShaderIncludeDB;
    }
    /** @deprecated Internal use. Does not exist at runtime. */
    interface __NameMapShaderMaterial extends __NameMapMaterial {
    }
    /** A material defined by a custom [Shader] program and the values of its shader parameters.  
     *  	  
     *  @link https://docs.godotengine.org/en/4.5/classes/class_shadermaterial.html  
     */
    class ShaderMaterial extends Material {
        constructor(identifier?: any)
        /** Changes the value set for this material of a uniform in the shader.  
         *      
         *  **Note:** [param param] is case-sensitive and must match the name of the uniform in the code exactly (not the capitalized name in the inspector).  
         *      
         *  **Note:** Changes to the shader uniform will be effective on all instances using this [ShaderMaterial]. To prevent this, use per-instance uniforms with [method GeometryInstance3D.set_instance_shader_parameter] or duplicate the [ShaderMaterial] resource using [method Resource.duplicate]. Per-instance uniforms allow for better shader reuse and are therefore faster, so they should be preferred over duplicating the [ShaderMaterial] when possible.  
         */
        set_shader_parameter(param: StringName, value: any): void
        
        /** Returns the current value set for this material of a uniform in the shader. */
        get_shader_parameter(param: StringName): any
        
        /** The [Shader] program used to render this material. */
        get shader(): null | Shader
        set shader(value: null | Shader)
        /** @deprecated Internal use. Does not exist at runtime. */
        __godotNameMap: __NameMapShaderMaterial;
    }
    /** @deprecated Internal use. Does not exist at runtime. */
    interface __NameMapShape2D extends __NameMapResource {
    }
    /** Abstract base class for 2D shapes used for physics collision.  
     *  	  
     *  @link https://docs.godotengine.org/en/4.5/classes/class_shape2d.html  
     */
    class Shape2D extends Resource {
        constructor(identifier?: any)
        /** Returns `true` if this shape is colliding with another.  
         *  This method needs the transformation matrix for this shape ([param local_xform]), the shape to check collisions with ([param with_shape]), and the transformation matrix of that shape ([param shape_xform]).  
         */
        collide(local_xform: Transform2D, with_shape: Shape2D, shape_xform: Transform2D): boolean
        
        /** Returns whether this shape would collide with another, if a given movement was applied.  
         *  This method needs the transformation matrix for this shape ([param local_xform]), the movement to test on this shape ([param local_motion]), the shape to check collisions with ([param with_shape]), the transformation matrix of that shape ([param shape_xform]), and the movement to test onto the other object ([param shape_motion]).  
         */
        collide_with_motion(local_xform: Transform2D, local_motion: Vector2, with_shape: Shape2D, shape_xform: Transform2D, shape_motion: Vector2): boolean
        
        /** Returns a list of contact point pairs where this shape touches another.  
         *  If there are no collisions, the returned list is empty. Otherwise, the returned list contains contact points arranged in pairs, with entries alternating between points on the boundary of this shape and points on the boundary of [param with_shape].  
         *  A collision pair A, B can be used to calculate the collision normal with `(B - A).normalized()`, and the collision depth with `(B - A).length()`. This information is typically used to separate shapes, particularly in collision solvers.  
         *  This method needs the transformation matrix for this shape ([param local_xform]), the shape to check collisions with ([param with_shape]), and the transformation matrix of that shape ([param shape_xform]).  
         */
        collide_and_get_contacts(local_xform: Transform2D, with_shape: Shape2D, shape_xform: Transform2D): PackedVector2Array
        
        /** Returns a list of contact point pairs where this shape would touch another, if a given movement was applied.  
         *  If there would be no collisions, the returned list is empty. Otherwise, the returned list contains contact points arranged in pairs, with entries alternating between points on the boundary of this shape and points on the boundary of [param with_shape].  
         *  A collision pair A, B can be used to calculate the collision normal with `(B - A).normalized()`, and the collision depth with `(B - A).length()`. This information is typically used to separate shapes, particularly in collision solvers.  
         *  This method needs the transformation matrix for this shape ([param local_xform]), the movement to test on this shape ([param local_motion]), the shape to check collisions with ([param with_shape]), the transformation matrix of that shape ([param shape_xform]), and the movement to test onto the other object ([param shape_motion]).  
         */
        collide_with_motion_and_get_contacts(local_xform: Transform2D, local_motion: Vector2, with_shape: Shape2D, shape_xform: Transform2D, shape_motion: Vector2): PackedVector2Array
        
        /** Draws a solid shape onto a [CanvasItem] with the [RenderingServer] API filled with the specified [param color]. The exact drawing method is specific for each shape and cannot be configured. */
        draw(canvas_item: RID, color: Color): void
        
        /** Returns a [Rect2] representing the shapes boundary. */
        get_rect(): Rect2
        
        /** The shape's custom solver bias. Defines how much bodies react to enforce contact separation when this shape is involved.  
         *  When set to `0`, the default value from [member ProjectSettings.physics/2d/solver/default_contact_bias] is used.  
         */
        get custom_solver_bias(): float64
        set custom_solver_bias(value: float64)
        /** @deprecated Internal use. Does not exist at runtime. */
        __godotNameMap: __NameMapShape2D;
    }
    /** @deprecated Internal use. Does not exist at runtime. */
    interface __NameMapShape3D extends __NameMapResource {
    }
    /** Abstract base class for 3D shapes used for physics collision.  
     *  	  
     *  @link https://docs.godotengine.org/en/4.5/classes/class_shape3d.html  
     */
    class Shape3D extends Resource {
        constructor(identifier?: any)
        /** Returns the [ArrayMesh] used to draw the debug collision for this [Shape3D]. */
        get_debug_mesh(): null | ArrayMesh
        
        /** The shape's custom solver bias. Defines how much bodies react to enforce contact separation when this shape is involved.  
         *  When set to `0`, the default value from [member ProjectSettings.physics/3d/solver/default_contact_bias] is used.  
         */
        get custom_solver_bias(): float64
        set custom_solver_bias(value: float64)
        
        /** The collision margin for the shape. This is not used in Godot Physics.  
         *  Collision margins allow collision detection to be more efficient by adding an extra shell around shapes. Collision algorithms are more expensive when objects overlap by more than their margin, so a higher value for margins is better for performance, at the cost of accuracy around edges as it makes them less sharp.  
         */
        get margin(): float64
        set margin(value: float64)
        /** @deprecated Internal use. Does not exist at runtime. */
        __godotNameMap: __NameMapShape3D;
    }
    /** @deprecated Internal use. Does not exist at runtime. */
    interface __NameMapShapeCast2D extends __NameMapNode2D {
    }
    /** A 2D shape that sweeps a region of space to detect [CollisionObject2D]s.  
     *  	  
     *  @link https://docs.godotengine.org/en/4.5/classes/class_shapecast2d.html  
     */
    class ShapeCast2D<Map extends NodePathMap = any> extends Node2D<Map> {
        constructor(identifier?: any)
        /** Returns whether any object is intersecting with the shape's vector (considering the vector length). */
        is_colliding(): boolean
        
        /** The number of collisions detected at the point of impact. Use this to iterate over multiple collisions as provided by [method get_collider], [method get_collider_shape], [method get_collision_point], and [method get_collision_normal] methods. */
        get_collision_count(): int64
        
        /** Updates the collision information for the shape immediately, without waiting for the next `_physics_process` call. Use this method, for example, when the shape or its parent has changed state.  
         *      
         *  **Note:** Setting [member enabled] to `true` is not required for this to work.  
         */
        force_shapecast_update(): void
        
        /** Returns the collided [Object] of one of the multiple collisions at [param index], or `null` if no object is intersecting the shape (i.e. [method is_colliding] returns `false`). */
        get_collider(index: int64): null | Object
        
        /** Returns the [RID] of the collided object of one of the multiple collisions at [param index]. */
        get_collider_rid(index: int64): RID
        
        /** Returns the shape ID of the colliding shape of one of the multiple collisions at [param index], or `0` if no object is intersecting the shape (i.e. [method is_colliding] returns `false`). */
        get_collider_shape(index: int64): int64
        
        /** Returns the collision point of one of the multiple collisions at [param index] where the shape intersects the colliding object.  
         *      
         *  **Note:** This point is in the **global** coordinate system.  
         */
        get_collision_point(index: int64): Vector2
        
        /** Returns the normal of one of the multiple collisions at [param index] of the intersecting object. */
        get_collision_normal(index: int64): Vector2
        
        /** Returns the fraction from this cast's origin to its [member target_position] of how far the shape can move without triggering a collision, as a value between `0.0` and `1.0`. */
        get_closest_collision_safe_fraction(): float64
        
        /** Returns the fraction from this cast's origin to its [member target_position] of how far the shape must move to trigger a collision, as a value between `0.0` and `1.0`.  
         *  In ideal conditions this would be the same as [method get_closest_collision_safe_fraction], however shape casting is calculated in discrete steps, so the precise point of collision can occur between two calculated positions.  
         */
        get_closest_collision_unsafe_fraction(): float64
        
        /** Adds a collision exception so the shape does not report collisions with the specified [RID]. */
        add_exception_rid(rid: RID): void
        
        /** Adds a collision exception so the shape does not report collisions with the specified node. */
        add_exception(node: CollisionObject2D): void
        
        /** Removes a collision exception so the shape does report collisions with the specified [RID]. */
        remove_exception_rid(rid: RID): void
        
        /** Removes a collision exception so the shape does report collisions with the specified node. */
        remove_exception(node: CollisionObject2D): void
        
        /** Removes all collision exceptions for this shape. */
        clear_exceptions(): void
        
        /** Based on [param value], enables or disables the specified layer in the [member collision_mask], given a [param layer_number] between 1 and 32. */
        set_collision_mask_value(layer_number: int64, value: boolean): void
        
        /** Returns whether or not the specified layer of the [member collision_mask] is enabled, given a [param layer_number] between 1 and 32. */
        get_collision_mask_value(layer_number: int64): boolean
        
        /** If `true`, collisions will be reported. */
        get enabled(): boolean
        set enabled(value: boolean)
        
        /** The shape to be used for collision queries. */
        get shape(): null | Shape2D
        set shape(value: null | Shape2D)
        
        /** If `true`, the parent node will be excluded from collision detection. */
        get exclude_parent(): boolean
        set exclude_parent(value: boolean)
        
        /** The shape's destination point, relative to this node's [member Node2D.position]. */
        get target_position(): Vector2
        set target_position(value: Vector2)
        
        /** The collision margin for the shape. A larger margin helps detecting collisions more consistently, at the cost of precision. */
        get margin(): float64
        set margin(value: float64)
        
        /** The number of intersections can be limited with this parameter, to reduce the processing time. */
        get max_results(): int64
        set max_results(value: int64)
        
        /** The shape's collision mask. Only objects in at least one collision layer enabled in the mask will be detected. See [url=https://docs.godotengine.org/en/4.5/tutorials/physics/physics_introduction.html#collision-layers-and-masks]Collision layers and masks[/url] in the documentation for more information. */
        get collision_mask(): int64
        set collision_mask(value: int64)
        
        /** Returns the complete collision information from the collision sweep. The data returned is the same as in the [method PhysicsDirectSpaceState2D.get_rest_info] method. */
        get collision_result(): GArray
        
        /** If `true`, collisions with [Area2D]s will be reported. */
        get collide_with_areas(): boolean
        set collide_with_areas(value: boolean)
        
        /** If `true`, collisions with [PhysicsBody2D]s will be reported. */
        get collide_with_bodies(): boolean
        set collide_with_bodies(value: boolean)
        /** @deprecated Internal use. Does not exist at runtime. */
        __godotNameMap: __NameMapShapeCast2D;
    }
    /** @deprecated Internal use. Does not exist at runtime. */
    interface __NameMapShapeCast3D extends __NameMapNode3D {
    }
    /** A 3D shape that sweeps a region of space to detect [CollisionObject3D]s.  
     *  	  
     *  @link https://docs.godotengine.org/en/4.5/classes/class_shapecast3d.html  
     */
    class ShapeCast3D<Map extends NodePathMap = any> extends Node3D<Map> {
        constructor(identifier?: any)
        /** This method does nothing. */
        resource_changed(resource: Resource): void
        
        /** Returns whether any object is intersecting with the shape's vector (considering the vector length). */
        is_colliding(): boolean
        
        /** The number of collisions detected at the point of impact. Use this to iterate over multiple collisions as provided by [method get_collider], [method get_collider_shape], [method get_collision_point], and [method get_collision_normal] methods. */
        get_collision_count(): int64
        
        /** Updates the collision information for the shape immediately, without waiting for the next `_physics_process` call. Use this method, for example, when the shape or its parent has changed state.  
         *      
         *  **Note:** Setting [member enabled] to `true` is not required for this to work.  
         */
        force_shapecast_update(): void
        
        /** Returns the collided [Object] of one of the multiple collisions at [param index], or `null` if no object is intersecting the shape (i.e. [method is_colliding] returns `false`). */
        get_collider(index: int64): null | Object
        
        /** Returns the [RID] of the collided object of one of the multiple collisions at [param index]. */
        get_collider_rid(index: int64): RID
        
        /** Returns the shape ID of the colliding shape of one of the multiple collisions at [param index], or `0` if no object is intersecting the shape (i.e. [method is_colliding] returns `false`). */
        get_collider_shape(index: int64): int64
        
        /** Returns the collision point of one of the multiple collisions at [param index] where the shape intersects the colliding object.  
         *      
         *  **Note:** This point is in the **global** coordinate system.  
         */
        get_collision_point(index: int64): Vector3
        
        /** Returns the normal of one of the multiple collisions at [param index] of the intersecting object. */
        get_collision_normal(index: int64): Vector3
        
        /** Returns the fraction from this cast's origin to its [member target_position] of how far the shape can move without triggering a collision, as a value between `0.0` and `1.0`. */
        get_closest_collision_safe_fraction(): float64
        
        /** Returns the fraction from this cast's origin to its [member target_position] of how far the shape must move to trigger a collision, as a value between `0.0` and `1.0`.  
         *  In ideal conditions this would be the same as [method get_closest_collision_safe_fraction], however shape casting is calculated in discrete steps, so the precise point of collision can occur between two calculated positions.  
         */
        get_closest_collision_unsafe_fraction(): float64
        
        /** Adds a collision exception so the shape does not report collisions with the specified [RID]. */
        add_exception_rid(rid: RID): void
        
        /** Adds a collision exception so the shape does not report collisions with the specified node. */
        add_exception(node: CollisionObject3D): void
        
        /** Removes a collision exception so the shape does report collisions with the specified [RID]. */
        remove_exception_rid(rid: RID): void
        
        /** Removes a collision exception so the shape does report collisions with the specified node. */
        remove_exception(node: CollisionObject3D): void
        
        /** Removes all collision exceptions for this shape. */
        clear_exceptions(): void
        
        /** Based on [param value], enables or disables the specified layer in the [member collision_mask], given a [param layer_number] between 1 and 32. */
        set_collision_mask_value(layer_number: int64, value: boolean): void
        
        /** Returns whether or not the specified layer of the [member collision_mask] is enabled, given a [param layer_number] between 1 and 32. */
        get_collision_mask_value(layer_number: int64): boolean
        
        /** If `true`, collisions will be reported. */
        get enabled(): boolean
        set enabled(value: boolean)
        
        /** The shape to be used for collision queries. */
        get shape(): null | Shape3D
        set shape(value: null | Shape3D)
        
        /** If `true`, the parent node will be excluded from collision detection. */
        get exclude_parent(): boolean
        set exclude_parent(value: boolean)
        
        /** The shape's destination point, relative to this node's [member Node3D.position]. */
        get target_position(): Vector3
        set target_position(value: Vector3)
        
        /** The collision margin for the shape. A larger margin helps detecting collisions more consistently, at the cost of precision. */
        get margin(): float64
        set margin(value: float64)
        
        /** The number of intersections can be limited with this parameter, to reduce the processing time. */
        get max_results(): int64
        set max_results(value: int64)
        
        /** The shape's collision mask. Only objects in at least one collision layer enabled in the mask will be detected. See [url=https://docs.godotengine.org/en/4.5/tutorials/physics/physics_introduction.html#collision-layers-and-masks]Collision layers and masks[/url] in the documentation for more information. */
        get collision_mask(): int64
        set collision_mask(value: int64)
        
        /** Returns the complete collision information from the collision sweep. The data returned is the same as in the [method PhysicsDirectSpaceState3D.get_rest_info] method. */
        get collision_result(): GArray
        
        /** If `true`, collisions with [Area3D]s will be reported. */
        get collide_with_areas(): boolean
        set collide_with_areas(value: boolean)
        
        /** If `true`, collisions with [PhysicsBody3D]s will be reported. */
        get collide_with_bodies(): boolean
        set collide_with_bodies(value: boolean)
        
        /** The custom color to use to draw the shape in the editor and at run-time if **Visible Collision Shapes** is enabled in the **Debug** menu. This color will be highlighted at run-time if the [ShapeCast3D] is colliding with something.  
         *  If set to `Color(0.0, 0.0, 0.0)` (by default), the color set in [member ProjectSettings.debug/shapes/collision/shape_color] is used.  
         */
        get debug_shape_custom_color(): Color
        set debug_shape_custom_color(value: Color)
        /** @deprecated Internal use. Does not exist at runtime. */
        __godotNameMap: __NameMapShapeCast3D;
    }
    /** @deprecated Internal use. Does not exist at runtime. */
    interface __NameMapShortcut extends __NameMapResource {
    }
    /** A shortcut for binding input.  
     *  	  
     *  @link https://docs.godotengine.org/en/4.5/classes/class_shortcut.html  
     */
    class Shortcut extends Resource {
        constructor(identifier?: any)
        /** Returns whether [member events] contains an [InputEvent] which is valid. */
        has_valid_event(): boolean
        
        /** Returns whether any [InputEvent] in [member events] equals [param event]. This uses [method InputEvent.is_match] to compare events. */
        matches_event(event: InputEvent): boolean
        
        /** Returns the shortcut's first valid [InputEvent] as a [String]. */
        get_as_text(): string
        
        /** The shortcut's [InputEvent] array.  
         *  Generally the [InputEvent] used is an [InputEventKey], though it can be any [InputEvent], including an [InputEventAction].  
         */
        get events(): GArray<InputEvent>
        set events(value: GArray<InputEvent>)
        /** @deprecated Internal use. Does not exist at runtime. */
        __godotNameMap: __NameMapShortcut;
    }
    /** @deprecated Internal use. Does not exist at runtime. */
    interface __NameMapSkeleton2D extends __NameMapNode2D {
    }
    /** The parent of a hierarchy of [Bone2D]s, used to create a 2D skeletal animation.  
     *  	  
     *  @link https://docs.godotengine.org/en/4.5/classes/class_skeleton2d.html  
     */
    class Skeleton2D<Map extends NodePathMap = any> extends Node2D<Map> {
        constructor(identifier?: any)
        /** Returns the number of [Bone2D] nodes in the node hierarchy parented by Skeleton2D. */
        get_bone_count(): int64
        
        /** Returns a [Bone2D] from the node hierarchy parented by Skeleton2D. The object to return is identified by the parameter [param idx]. Bones are indexed by descending the node hierarchy from top to bottom, adding the children of each branch before moving to the next sibling. */
        get_bone(idx: int64): null | Bone2D
        
        /** Returns the [RID] of a Skeleton2D instance. */
        get_skeleton(): RID
        
        /** Sets the [SkeletonModificationStack2D] attached to this skeleton. */
        set_modification_stack(modification_stack: SkeletonModificationStack2D): void
        
        /** Returns the [SkeletonModificationStack2D] attached to this skeleton, if one exists. */
        get_modification_stack(): null | SkeletonModificationStack2D
        
        /** Executes all the modifications on the [SkeletonModificationStack2D], if the Skeleton2D has one assigned. */
        execute_modifications(delta: float64, execution_mode: int64): void
        
        /** Sets the local pose transform, [param override_pose], for the bone at [param bone_idx].  
         *  [param strength] is the interpolation strength that will be used when applying the pose, and [param persistent] determines if the applied pose will remain.  
         *      
         *  **Note:** The pose transform needs to be a local transform relative to the [Bone2D] node at [param bone_idx]!  
         */
        set_bone_local_pose_override(bone_idx: int64, override_pose: Transform2D, strength: float64, persistent: boolean): void
        
        /** Returns the local pose override transform for [param bone_idx]. */
        get_bone_local_pose_override(bone_idx: int64): Transform2D
        
        /** Emitted when the [Bone2D] setup attached to this skeletons changes. This is primarily used internally within the skeleton. */
        readonly bone_setup_changed: Signal<() => void>
        /** @deprecated Internal use. Does not exist at runtime. */
        __godotNameMap: __NameMapSkeleton2D;
    }
    namespace Skeleton3D {
        enum ModifierCallbackModeProcess {
            /** Set a flag to process modification during physics frames (see [constant Node.NOTIFICATION_INTERNAL_PHYSICS_PROCESS]). */
            MODIFIER_CALLBACK_MODE_PROCESS_PHYSICS = 0,
            
            /** Set a flag to process modification during process frames (see [constant Node.NOTIFICATION_INTERNAL_PROCESS]). */
            MODIFIER_CALLBACK_MODE_PROCESS_IDLE = 1,
            
            /** Do not process modification. Use [method advance] to process the modification manually. */
            MODIFIER_CALLBACK_MODE_PROCESS_MANUAL = 2,
        }
    }
    /** @deprecated Internal use. Does not exist at runtime. */
    interface __NameMapSkeleton3D extends __NameMapNode3D {
    }
    /** A node containing a bone hierarchy, used to create a 3D skeletal animation.  
     *  	  
     *  @link https://docs.godotengine.org/en/4.5/classes/class_skeleton3d.html  
     */
    class Skeleton3D<Map extends NodePathMap = any> extends Node3D<Map> {
        /** Notification received when this skeleton's pose needs to be updated. In that case, this is called only once per frame in a deferred process. */
        static readonly NOTIFICATION_UPDATE_SKELETON = 50
        constructor(identifier?: any)
        
        /** Adds a new bone with the given name. Returns the new bone's index, or `-1` if this method fails.  
         *      
         *  **Note:** Bone names should be unique, non empty, and cannot include the `:` and `/` characters.  
         */
        add_bone(name: string): int64
        
        /** Returns the bone index that matches [param name] as its name. Returns `-1` if no bone with this name exists. */
        find_bone(name: string): int64
        
        /** Returns the name of the bone at index [param bone_idx]. */
        get_bone_name(bone_idx: int64): string
        
        /** Sets the bone name, [param name], for the bone at [param bone_idx]. */
        set_bone_name(bone_idx: int64, name: string): void
        
        /** Returns the metadata for the bone at index [param bone_idx] with [param key]. */
        get_bone_meta(bone_idx: int64, key: StringName): any
        
        /** Returns the list of all metadata keys for the bone at index [param bone_idx]. */
        get_bone_meta_list(bone_idx: int64): GArray<StringName>
        
        /** Returns `true` if the bone at index [param bone_idx] has metadata with the key [param key]. */
        has_bone_meta(bone_idx: int64, key: StringName): boolean
        
        /** Sets the metadata for the bone at index [param bone_idx], setting the [param key] meta to [param value]. */
        set_bone_meta(bone_idx: int64, key: StringName, value: any): void
        
        /** Returns all bone names concatenated with commas (`,`) as a single [StringName].  
         *  It is useful to set it as a hint for the enum property.  
         */
        get_concatenated_bone_names(): StringName
        
        /** Returns the bone index which is the parent of the bone at [param bone_idx]. If -1, then bone has no parent.  
         *      
         *  **Note:** The parent bone returned will always be less than [param bone_idx].  
         */
        get_bone_parent(bone_idx: int64): int64
        
        /** Sets the bone index [param parent_idx] as the parent of the bone at [param bone_idx]. If -1, then bone has no parent.  
         *      
         *  **Note:** [param parent_idx] must be less than [param bone_idx].  
         */
        set_bone_parent(bone_idx: int64, parent_idx: int64): void
        
        /** Returns the number of bones in the skeleton. */
        get_bone_count(): int64
        
        /** Returns the number of times the bone hierarchy has changed within this skeleton, including renames.  
         *  The Skeleton version is not serialized: only use within a single instance of Skeleton3D.  
         *  Use for invalidating caches in IK solvers and other nodes which process bones.  
         */
        get_version(): int64
        
        /** Unparents the bone at [param bone_idx] and sets its rest position to that of its parent prior to being reset. */
        unparent_bone_and_rest(bone_idx: int64): void
        
        /** Returns an array containing the bone indexes of all the child node of the passed in bone, [param bone_idx]. */
        get_bone_children(bone_idx: int64): PackedInt32Array
        
        /** Returns an array with all of the bones that are parentless. Another way to look at this is that it returns the indexes of all the bones that are not dependent or modified by other bones in the Skeleton. */
        get_parentless_bones(): PackedInt32Array
        
        /** Returns the rest transform for a bone [param bone_idx]. */
        get_bone_rest(bone_idx: int64): Transform3D
        
        /** Sets the rest transform for bone [param bone_idx]. */
        set_bone_rest(bone_idx: int64, rest: Transform3D): void
        
        /** Returns the global rest transform for [param bone_idx]. */
        get_bone_global_rest(bone_idx: int64): Transform3D
        create_skin_from_rest_transforms(): Skin
        
        /** Binds the given Skin to the Skeleton. */
        register_skin(skin: Skin): null | SkinReference
        
        /** Returns all bones in the skeleton to their rest poses. */
        localize_rests(): void
        
        /** Clear all the bones in this skeleton. */
        clear_bones(): void
        
        /** Returns the pose transform of the specified bone.  
         *      
         *  **Note:** This is the pose you set to the skeleton in the process, the final pose can get overridden by modifiers in the deferred process, if you want to access the final pose, use [signal SkeletonModifier3D.modification_processed].  
         */
        get_bone_pose(bone_idx: int64): Transform3D
        
        /** Sets the pose transform, [param pose], for the bone at [param bone_idx]. */
        set_bone_pose(bone_idx: int64, pose: Transform3D): void
        
        /** Sets the pose position of the bone at [param bone_idx] to [param position]. [param position] is a [Vector3] describing a position local to the [Skeleton3D] node. */
        set_bone_pose_position(bone_idx: int64, position: Vector3): void
        
        /** Sets the pose rotation of the bone at [param bone_idx] to [param rotation]. [param rotation] is a [Quaternion] describing a rotation in the bone's local coordinate space with respect to the rotation of any parent bones. */
        set_bone_pose_rotation(bone_idx: int64, rotation: Quaternion): void
        
        /** Sets the pose scale of the bone at [param bone_idx] to [param scale]. */
        set_bone_pose_scale(bone_idx: int64, scale: Vector3): void
        
        /** Returns the pose position of the bone at [param bone_idx]. The returned [Vector3] is in the local coordinate space of the [Skeleton3D] node. */
        get_bone_pose_position(bone_idx: int64): Vector3
        
        /** Returns the pose rotation of the bone at [param bone_idx]. The returned [Quaternion] is local to the bone with respect to the rotation of any parent bones. */
        get_bone_pose_rotation(bone_idx: int64): Quaternion
        
        /** Returns the pose scale of the bone at [param bone_idx]. */
        get_bone_pose_scale(bone_idx: int64): Vector3
        
        /** Sets the bone pose to rest for [param bone_idx]. */
        reset_bone_pose(bone_idx: int64): void
        
        /** Sets all bone poses to rests. */
        reset_bone_poses(): void
        
        /** Returns whether the bone pose for the bone at [param bone_idx] is enabled. */
        is_bone_enabled(bone_idx: int64): boolean
        
        /** Disables the pose for the bone at [param bone_idx] if `false`, enables the bone pose if `true`. */
        set_bone_enabled(bone_idx: int64, enabled?: boolean /* = true */): void
        
        /** Returns the overall transform of the specified bone, with respect to the skeleton. Being relative to the skeleton frame, this is not the actual "global" transform of the bone.  
         *      
         *  **Note:** This is the global pose you set to the skeleton in the process, the final global pose can get overridden by modifiers in the deferred process, if you want to access the final global pose, use [signal SkeletonModifier3D.modification_processed].  
         */
        get_bone_global_pose(bone_idx: int64): Transform3D
        
        /** Sets the global pose transform, [param pose], for the bone at [param bone_idx].  
         *      
         *  **Note:** If other bone poses have been changed, this method executes a dirty poses recalculation and will cause performance to deteriorate. If you know that multiple global poses will be applied, consider using [method set_bone_pose] with precalculation.  
         */
        set_bone_global_pose(bone_idx: int64, pose: Transform3D): void
        
        /** Force updates the bone transforms/poses for all bones in the skeleton. */
        force_update_all_bone_transforms(): void
        
        /** Force updates the bone transform for the bone at [param bone_idx] and all of its children. */
        force_update_bone_child_transform(bone_idx: int64): void
        
        /** Manually advance the child [SkeletonModifier3D]s by the specified time (in seconds).  
         *      
         *  **Note:** The [param delta] is temporarily accumulated in the [Skeleton3D], and the deferred process uses the accumulated value to process the modification.  
         */
        advance(delta: float64): void
        
        /** Removes the global pose override on all bones in the skeleton. */
        clear_bones_global_pose_override(): void
        
        /** Sets the global pose transform, [param pose], for the bone at [param bone_idx].  
         *  [param amount] is the interpolation strength that will be used when applying the pose, and [param persistent] determines if the applied pose will remain.  
         *      
         *  **Note:** The pose transform needs to be a global pose! To convert a world transform from a [Node3D] to a global bone pose, multiply the [method Transform3D.affine_inverse] of the node's [member Node3D.global_transform] by the desired world transform.  
         */
        set_bone_global_pose_override(bone_idx: int64, pose: Transform3D, amount: float64, persistent?: boolean /* = false */): void
        
        /** Returns the global pose override transform for [param bone_idx]. */
        get_bone_global_pose_override(bone_idx: int64): Transform3D
        
        /** Returns the overall transform of the specified bone, with respect to the skeleton, but without any global pose overrides. Being relative to the skeleton frame, this is not the actual "global" transform of the bone. */
        get_bone_global_pose_no_override(bone_idx: int64): Transform3D
        
        /** Tells the [PhysicalBone3D] nodes in the Skeleton to stop simulating. */
        physical_bones_stop_simulation(): void
        
        /** Tells the [PhysicalBone3D] nodes in the Skeleton to start simulating and reacting to the physics world.  
         *  Optionally, a list of bone names can be passed-in, allowing only the passed-in bones to be simulated.  
         */
        physical_bones_start_simulation(bones?: GArray<StringName> /* = [] */): void
        
        /** Adds a collision exception to the physical bone.  
         *  Works just like the [RigidBody3D] node.  
         */
        physical_bones_add_collision_exception(exception: RID): void
        
        /** Removes a collision exception to the physical bone.  
         *  Works just like the [RigidBody3D] node.  
         */
        physical_bones_remove_collision_exception(exception: RID): void
        
        /** Multiplies the 3D position track animation.  
         *      
         *  **Note:** Unless this value is `1.0`, the key value in animation will not match the actual position value.  
         */
        get motion_scale(): float64
        set motion_scale(value: float64)
        
        /** If `true`, forces the bones in their default rest pose, regardless of their values. In the editor, this also prevents the bones from being edited. */
        get show_rest_only(): boolean
        set show_rest_only(value: boolean)
        
        /** Sets the processing timing for the Modifier. */
        get modifier_callback_mode_process(): int64
        set modifier_callback_mode_process(value: int64)
        
        /** If you follow the recommended workflow and explicitly have [PhysicalBoneSimulator3D] as a child of [Skeleton3D], you can control whether it is affected by raycasting without running [method physical_bones_start_simulation], by its [member SkeletonModifier3D.active].  
         *  However, for old (deprecated) configurations, [Skeleton3D] has an internal virtual [PhysicalBoneSimulator3D] for compatibility. This property controls the internal virtual [PhysicalBoneSimulator3D]'s [member SkeletonModifier3D.active].  
         */
        get animate_physical_bones(): boolean
        set animate_physical_bones(value: boolean)
        
        /** Emitted when the rest is updated. */
        readonly rest_updated: Signal<() => void>
        
        /** Emitted when the pose is updated.  
         *      
         *  **Note:** During the update process, this signal is not fired, so modification by [SkeletonModifier3D] is not detected.  
         */
        readonly pose_updated: Signal<() => void>
        
        /** Emitted when the final pose has been calculated will be applied to the skin in the update process.  
         *  This means that all [SkeletonModifier3D] processing is complete. In order to detect the completion of the processing of each [SkeletonModifier3D], use [signal SkeletonModifier3D.modification_processed].  
         */
        readonly skeleton_updated: Signal<() => void>
        
        /** Emitted when the bone at [param bone_idx] is toggled with [method set_bone_enabled]. Use [method is_bone_enabled] to check the new value. */
        readonly bone_enabled_changed: Signal<(bone_idx: int64) => void>
        
        /** Emitted when the list of bones changes, such as when calling [method add_bone], [method set_bone_parent], [method unparent_bone_and_rest], or [method clear_bones]. */
        readonly bone_list_changed: Signal<() => void>
        
        /** Emitted when the value of [member show_rest_only] changes. */
        readonly show_rest_only_changed: Signal<() => void>
        /** @deprecated Internal use. Does not exist at runtime. */
        __godotNameMap: __NameMapSkeleton3D;
    }
    /** @deprecated Internal use. Does not exist at runtime. */
    interface __NameMapSkeletonIK3D extends __NameMapSkeletonModifier3D {
    }
    /** A node used to rotate all bones of a [Skeleton3D] bone chain a way that places the end bone at a desired 3D position.  
     *  	  
     *  @link https://docs.godotengine.org/en/4.5/classes/class_skeletonik3d.html  
     */
    class SkeletonIK3D<Map extends NodePathMap = any> extends SkeletonModifier3D<Map> {
        constructor(identifier?: any)
        /** Returns the parent [Skeleton3D] node that was present when SkeletonIK entered the scene tree. Returns `null` if the parent node was not a [Skeleton3D] node when SkeletonIK3D entered the scene tree. */
        get_parent_skeleton(): null | Skeleton3D
        
        /** Returns `true` if SkeletonIK is applying IK effects on continues frames to the [Skeleton3D] bones. Returns `false` if SkeletonIK is stopped or [method start] was used with the `one_time` parameter set to `true`. */
        is_running(): boolean
        
        /** Starts applying IK effects on each frame to the [Skeleton3D] bones but will only take effect starting on the next frame. If [param one_time] is `true`, this will take effect immediately but also reset on the next frame. */
        start(one_time?: boolean /* = false */): void
        
        /** Stops applying IK effects on each frame to the [Skeleton3D] bones and also calls [method Skeleton3D.clear_bones_global_pose_override] to remove existing overrides on all bones. */
        stop(): void
        
        /** The name of the current root bone, the first bone in the IK chain. */
        get root_bone(): StringName
        set root_bone(value: StringName)
        
        /** The name of the current tip bone, the last bone in the IK chain placed at the [member target] transform (or [member target_node] if defined). */
        get tip_bone(): StringName
        set tip_bone(value: StringName)
        
        /** First target of the IK chain where the tip bone is placed and, if [member override_tip_basis] is `true`, how the tip bone is rotated. If a [member target_node] path is available the nodes transform is used instead and this property is ignored. */
        get target(): Transform3D
        set target(value: Transform3D)
        
        /** If `true` overwrites the rotation of the tip bone with the rotation of the [member target] (or [member target_node] if defined). */
        get override_tip_basis(): boolean
        set override_tip_basis(value: boolean)
        
        /** If `true`, instructs the IK solver to consider the secondary magnet target (pole target) when calculating the bone chain. Use the magnet position (pole target) to control the bending of the IK chain. */
        get use_magnet(): boolean
        set use_magnet(value: boolean)
        
        /** Secondary target position (first is [member target] property or [member target_node]) for the IK chain. Use magnet position (pole target) to control the bending of the IK chain. Only works if the bone chain has more than 2 bones. The middle chain bone position will be linearly interpolated with the magnet position. */
        get magnet(): Vector3
        set magnet(value: Vector3)
        
        /** Target node [NodePath] for the IK chain. If available, the node's current [Transform3D] is used instead of the [member target] property. */
        get target_node(): NodePath
        set target_node(value: NodePath | string)
        
        /** The minimum distance between bone and goal target. If the distance is below this value, the IK solver stops further iterations. */
        get min_distance(): float64
        set min_distance(value: float64)
        
        /** Number of iteration loops used by the IK solver to produce more accurate (and elegant) bone chain results. */
        get max_iterations(): int64
        set max_iterations(value: int64)
        
        /** Interpolation value for how much the IK results are applied to the current skeleton bone chain. A value of `1.0` will overwrite all skeleton bone transforms completely while a value of `0.0` will visually disable the SkeletonIK. */
        get interpolation(): float64
        set interpolation(value: float64)
        /** @deprecated Internal use. Does not exist at runtime. */
        __godotNameMap: __NameMapSkeletonIK3D;
    }
    /** @deprecated Internal use. Does not exist at runtime. */
    interface __NameMapSkeletonModification2D extends __NameMapResource {
    }
    /** Base class for resources that operate on [Bone2D]s in a [Skeleton2D].  
     *  	  
     *  @link https://docs.godotengine.org/en/4.5/classes/class_skeletonmodification2d.html  
     */
    class SkeletonModification2D extends Resource {
        constructor(identifier?: any)
        /** Executes the given modification. This is where the modification performs whatever function it is designed to do. */
        /* gdvirtual */ _execute(delta: float64): void
        
        /** Called when the modification is setup. This is where the modification performs initialization. */
        /* gdvirtual */ _setup_modification(modification_stack: SkeletonModificationStack2D): void
        
        /** Used for drawing **editor-only** modification gizmos. This function will only be called in the Godot editor and can be overridden to draw custom gizmos.  
         *      
         *  **Note:** You will need to use the Skeleton2D from [method SkeletonModificationStack2D.get_skeleton] and it's draw functions, as the [SkeletonModification2D] resource cannot draw on its own.  
         */
        /* gdvirtual */ _draw_editor_gizmo(): void
        
        /** Returns the [SkeletonModificationStack2D] that this modification is bound to. Through the modification stack, you can access the Skeleton2D the modification is operating on. */
        get_modification_stack(): null | SkeletonModificationStack2D
        
        /** Manually allows you to set the setup state of the modification. This function should only rarely be used, as the [SkeletonModificationStack2D] the modification is bound to should handle setting the modification up. */
        set_is_setup(is_setup: boolean): void
        
        /** Returns whether this modification has been successfully setup or not. */
        get_is_setup(): boolean
        
        /** Takes an angle and clamps it so it is within the passed-in [param min] and [param max] range. [param invert] will inversely clamp the angle, clamping it to the range outside of the given bounds. */
        clamp_angle(angle: float64, min: float64, max: float64, invert: boolean): float64
        
        /** Sets whether this modification will call [method _draw_editor_gizmo] in the Godot editor to draw modification-specific gizmos. */
        set_editor_draw_gizmo(draw_gizmo: boolean): void
        
        /** Returns whether this modification will call [method _draw_editor_gizmo] in the Godot editor to draw modification-specific gizmos. */
        get_editor_draw_gizmo(): boolean
        
        /** If `true`, the modification's [method _execute] function will be called by the [SkeletonModificationStack2D]. */
        get enabled(): boolean
        set enabled(value: boolean)
        
        /** The execution mode for the modification. This tells the modification stack when to execute the modification. Some modifications have settings that are only available in certain execution modes. */
        get execution_mode(): int64
        set execution_mode(value: int64)
        /** @deprecated Internal use. Does not exist at runtime. */
        __godotNameMap: __NameMapSkeletonModification2D;
    }
    /** @deprecated Internal use. Does not exist at runtime. */
    interface __NameMapSkeletonModification2DCCDIK extends __NameMapSkeletonModification2D {
    }
    /** A modification that uses CCDIK to manipulate a series of bones to reach a target in 2D.  
     *  	  
     *  @link https://docs.godotengine.org/en/4.5/classes/class_skeletonmodification2dccdik.html  
     */
    class SkeletonModification2DCCDIK extends SkeletonModification2D {
        constructor(identifier?: any)
        /** Sets the [Bone2D] node assigned to the CCDIK joint at [param joint_idx]. */
        set_ccdik_joint_bone2d_node(joint_idx: int64, bone2d_nodepath: NodePath | string): void
        
        /** Returns the [Bone2D] node assigned to the CCDIK joint at [param joint_idx]. */
        get_ccdik_joint_bone2d_node(joint_idx: int64): NodePath
        
        /** Sets the bone index, [param bone_idx], of the CCDIK joint at [param joint_idx]. When possible, this will also update the `bone2d_node` of the CCDIK joint based on data provided by the linked skeleton. */
        set_ccdik_joint_bone_index(joint_idx: int64, bone_idx: int64): void
        
        /** Returns the index of the [Bone2D] node assigned to the CCDIK joint at [param joint_idx]. */
        get_ccdik_joint_bone_index(joint_idx: int64): int64
        
        /** Sets whether the joint at [param joint_idx] is set to rotate from the joint, `true`, or to rotate from the tip, `false`. */
        set_ccdik_joint_rotate_from_joint(joint_idx: int64, rotate_from_joint: boolean): void
        
        /** Returns whether the joint at [param joint_idx] is set to rotate from the joint, `true`, or to rotate from the tip, `false`. The default is to rotate from the tip. */
        get_ccdik_joint_rotate_from_joint(joint_idx: int64): boolean
        
        /** Determines whether angle constraints on the CCDIK joint at [param joint_idx] are enabled. When `true`, constraints will be enabled and taken into account when solving. */
        set_ccdik_joint_enable_constraint(joint_idx: int64, enable_constraint: boolean): void
        
        /** Returns whether angle constraints on the CCDIK joint at [param joint_idx] are enabled. */
        get_ccdik_joint_enable_constraint(joint_idx: int64): boolean
        
        /** Sets the minimum angle constraint for the joint at [param joint_idx]. */
        set_ccdik_joint_constraint_angle_min(joint_idx: int64, angle_min: float64): void
        
        /** Returns the minimum angle constraint for the joint at [param joint_idx]. */
        get_ccdik_joint_constraint_angle_min(joint_idx: int64): float64
        
        /** Sets the maximum angle constraint for the joint at [param joint_idx]. */
        set_ccdik_joint_constraint_angle_max(joint_idx: int64, angle_max: float64): void
        
        /** Returns the maximum angle constraint for the joint at [param joint_idx]. */
        get_ccdik_joint_constraint_angle_max(joint_idx: int64): float64
        
        /** Sets whether the CCDIK joint at [param joint_idx] uses an inverted joint constraint.  
         *  An inverted joint constraint only constraints the CCDIK joint to the angles  *outside of*  the inputted minimum and maximum angles. For this reason, it is referred to as an inverted joint constraint, as it constraints the joint to the outside of the inputted values.  
         */
        set_ccdik_joint_constraint_angle_invert(joint_idx: int64, invert: boolean): void
        
        /** Returns whether the CCDIK joint at [param joint_idx] uses an inverted joint constraint. See [method set_ccdik_joint_constraint_angle_invert] for details. */
        get_ccdik_joint_constraint_angle_invert(joint_idx: int64): boolean
        
        /** The NodePath to the node that is the target for the CCDIK modification. This node is what the CCDIK chain will attempt to rotate the bone chain to. */
        get target_nodepath(): NodePath
        set target_nodepath(value: NodePath | string)
        
        /** The end position of the CCDIK chain. Typically, this should be a child of a [Bone2D] node attached to the final [Bone2D] in the CCDIK chain. */
        get tip_nodepath(): NodePath
        set tip_nodepath(value: NodePath | string)
        
        /** The number of CCDIK joints in the CCDIK modification. */
        get ccdik_data_chain_length(): int64
        set ccdik_data_chain_length(value: int64)
        /** @deprecated Internal use. Does not exist at runtime. */
        __godotNameMap: __NameMapSkeletonModification2DCCDIK;
    }
    /** @deprecated Internal use. Does not exist at runtime. */
    interface __NameMapSkeletonModification2DFABRIK extends __NameMapSkeletonModification2D {
    }
    /** A modification that uses FABRIK to manipulate a series of [Bone2D] nodes to reach a target.  
     *  	  
     *  @link https://docs.godotengine.org/en/4.5/classes/class_skeletonmodification2dfabrik.html  
     */
    class SkeletonModification2DFABRIK extends SkeletonModification2D {
        constructor(identifier?: any)
        /** Sets the [Bone2D] node assigned to the FABRIK joint at [param joint_idx]. */
        set_fabrik_joint_bone2d_node(joint_idx: int64, bone2d_nodepath: NodePath | string): void
        
        /** Returns the [Bone2D] node assigned to the FABRIK joint at [param joint_idx]. */
        get_fabrik_joint_bone2d_node(joint_idx: int64): NodePath
        
        /** Sets the bone index, [param bone_idx], of the FABRIK joint at [param joint_idx]. When possible, this will also update the `bone2d_node` of the FABRIK joint based on data provided by the linked skeleton. */
        set_fabrik_joint_bone_index(joint_idx: int64, bone_idx: int64): void
        
        /** Returns the index of the [Bone2D] node assigned to the FABRIK joint at [param joint_idx]. */
        get_fabrik_joint_bone_index(joint_idx: int64): int64
        
        /** Sets the magnet position vector for the joint at [param joint_idx]. */
        set_fabrik_joint_magnet_position(joint_idx: int64, magnet_position: Vector2): void
        
        /** Returns the magnet position vector for the joint at [param joint_idx]. */
        get_fabrik_joint_magnet_position(joint_idx: int64): Vector2
        
        /** Sets whether the joint at [param joint_idx] will use the target node's rotation rather than letting FABRIK rotate the node.  
         *      
         *  **Note:** This option only works for the tip/final joint in the chain. For all other nodes, this option will be ignored.  
         */
        set_fabrik_joint_use_target_rotation(joint_idx: int64, use_target_rotation: boolean): void
        
        /** Returns whether the joint is using the target's rotation rather than allowing FABRIK to rotate the joint. This option only applies to the tip/final joint in the chain. */
        get_fabrik_joint_use_target_rotation(joint_idx: int64): boolean
        
        /** The NodePath to the node that is the target for the FABRIK modification. This node is what the FABRIK chain will attempt to rotate the bone chain to. */
        get target_nodepath(): NodePath
        set target_nodepath(value: NodePath | string)
        
        /** The number of FABRIK joints in the FABRIK modification. */
        get fabrik_data_chain_length(): int64
        set fabrik_data_chain_length(value: int64)
        /** @deprecated Internal use. Does not exist at runtime. */
        __godotNameMap: __NameMapSkeletonModification2DFABRIK;
    }
    /** @deprecated Internal use. Does not exist at runtime. */
    interface __NameMapSkeletonModification2DJiggle extends __NameMapSkeletonModification2D {
    }
    /** A modification that jiggles [Bone2D] nodes as they move towards a target.  
     *  	  
     *  @link https://docs.godotengine.org/en/4.5/classes/class_skeletonmodification2djiggle.html  
     */
    class SkeletonModification2DJiggle extends SkeletonModification2D {
        constructor(identifier?: any)
        /** If `true`, the Jiggle modifier will take colliders into account, keeping them from entering into these collision objects. */
        set_use_colliders(use_colliders: boolean): void
        
        /** Returns whether the jiggle modifier is taking physics colliders into account when solving. */
        get_use_colliders(): boolean
        
        /** Sets the collision mask that the Jiggle modifier will use when reacting to colliders, if the Jiggle modifier is set to take colliders into account. */
        set_collision_mask(collision_mask: int64): void
        
        /** Returns the collision mask used by the Jiggle modifier when collisions are enabled. */
        get_collision_mask(): int64
        
        /** Sets the [Bone2D] node assigned to the Jiggle joint at [param joint_idx]. */
        set_jiggle_joint_bone2d_node(joint_idx: int64, bone2d_node: NodePath | string): void
        
        /** Returns the [Bone2D] node assigned to the Jiggle joint at [param joint_idx]. */
        get_jiggle_joint_bone2d_node(joint_idx: int64): NodePath
        
        /** Sets the bone index, [param bone_idx], of the Jiggle joint at [param joint_idx]. When possible, this will also update the `bone2d_node` of the Jiggle joint based on data provided by the linked skeleton. */
        set_jiggle_joint_bone_index(joint_idx: int64, bone_idx: int64): void
        
        /** Returns the index of the [Bone2D] node assigned to the Jiggle joint at [param joint_idx]. */
        get_jiggle_joint_bone_index(joint_idx: int64): int64
        
        /** Sets whether the Jiggle joint at [param joint_idx] should override the default Jiggle joint settings. Setting this to `true` will make the joint use its own settings rather than the default ones attached to the modification. */
        set_jiggle_joint_override(joint_idx: int64, override: boolean): void
        
        /** Returns a boolean that indicates whether the joint at [param joint_idx] is overriding the default Jiggle joint data defined in the modification. */
        get_jiggle_joint_override(joint_idx: int64): boolean
        
        /** Sets the of stiffness of the Jiggle joint at [param joint_idx]. */
        set_jiggle_joint_stiffness(joint_idx: int64, stiffness: float64): void
        
        /** Returns the stiffness of the Jiggle joint at [param joint_idx]. */
        get_jiggle_joint_stiffness(joint_idx: int64): float64
        
        /** Sets the of mass of the Jiggle joint at [param joint_idx]. */
        set_jiggle_joint_mass(joint_idx: int64, mass: float64): void
        
        /** Returns the amount of mass of the jiggle joint at [param joint_idx]. */
        get_jiggle_joint_mass(joint_idx: int64): float64
        
        /** Sets the amount of damping of the Jiggle joint at [param joint_idx]. */
        set_jiggle_joint_damping(joint_idx: int64, damping: float64): void
        
        /** Returns the amount of damping of the Jiggle joint at [param joint_idx]. */
        get_jiggle_joint_damping(joint_idx: int64): float64
        
        /** Sets whether the Jiggle joint at [param joint_idx] should use gravity. */
        set_jiggle_joint_use_gravity(joint_idx: int64, use_gravity: boolean): void
        
        /** Returns a boolean that indicates whether the joint at [param joint_idx] is using gravity or not. */
        get_jiggle_joint_use_gravity(joint_idx: int64): boolean
        
        /** Sets the gravity vector of the Jiggle joint at [param joint_idx]. */
        set_jiggle_joint_gravity(joint_idx: int64, gravity: Vector2): void
        
        /** Returns a [Vector2] representing the amount of gravity the Jiggle joint at [param joint_idx] is influenced by. */
        get_jiggle_joint_gravity(joint_idx: int64): Vector2
        
        /** The NodePath to the node that is the target for the Jiggle modification. This node is what the Jiggle chain will attempt to rotate the bone chain to. */
        get target_nodepath(): NodePath
        set target_nodepath(value: NodePath | string)
        
        /** The amount of Jiggle joints in the Jiggle modification. */
        get jiggle_data_chain_length(): int64
        set jiggle_data_chain_length(value: int64)
        
        /** The default amount of stiffness assigned to the Jiggle joints, if they are not overridden. Higher values act more like springs, quickly moving into the correct position. */
        get stiffness(): float64
        set stiffness(value: float64)
        
        /** The default amount of mass assigned to the Jiggle joints, if they are not overridden. Higher values lead to faster movements and more overshooting. */
        get mass(): float64
        set mass(value: float64)
        
        /** The default amount of damping applied to the Jiggle joints, if they are not overridden. Higher values lead to more of the calculated velocity being applied. */
        get damping(): float64
        set damping(value: float64)
        
        /** Whether the gravity vector, [member gravity], should be applied to the Jiggle joints, assuming they are not overriding the default settings. */
        get use_gravity(): boolean
        set use_gravity(value: boolean)
        
        /** The default amount of gravity applied to the Jiggle joints, if they are not overridden. */
        get gravity(): Vector2
        set gravity(value: Vector2)
        /** @deprecated Internal use. Does not exist at runtime. */
        __godotNameMap: __NameMapSkeletonModification2DJiggle;
    }
    /** @deprecated Internal use. Does not exist at runtime. */
    interface __NameMapSkeletonModification2DLookAt extends __NameMapSkeletonModification2D {
    }
    /** A modification that rotates a [Bone2D] node to look at a target.  
     *  	  
     *  @link https://docs.godotengine.org/en/4.5/classes/class_skeletonmodification2dlookat.html  
     */
    class SkeletonModification2DLookAt extends SkeletonModification2D {
        constructor(identifier?: any)
        /** Sets the amount of additional rotation that is to be applied after executing the modification. This allows for offsetting the results by the inputted rotation amount. */
        set_additional_rotation(rotation: float64): void
        
        /** Returns the amount of additional rotation that is applied after the LookAt modification executes. */
        get_additional_rotation(): float64
        
        /** Sets whether this modification will use constraints or not. When `true`, constraints will be applied when solving the LookAt modification. */
        set_enable_constraint(enable_constraint: boolean): void
        
        /** Returns `true` if the LookAt modification is using constraints. */
        get_enable_constraint(): boolean
        
        /** Sets the constraint's minimum allowed angle. */
        set_constraint_angle_min(angle_min: float64): void
        
        /** Returns the constraint's minimum allowed angle. */
        get_constraint_angle_min(): float64
        
        /** Sets the constraint's maximum allowed angle. */
        set_constraint_angle_max(angle_max: float64): void
        
        /** Returns the constraint's maximum allowed angle. */
        get_constraint_angle_max(): float64
        
        /** When `true`, the modification will use an inverted joint constraint.  
         *  An inverted joint constraint only constraints the [Bone2D] to the angles  *outside of*  the inputted minimum and maximum angles. For this reason, it is referred to as an inverted joint constraint, as it constraints the joint to the outside of the inputted values.  
         */
        set_constraint_angle_invert(invert: boolean): void
        
        /** Returns whether the constraints to this modification are inverted or not. */
        get_constraint_angle_invert(): boolean
        
        /** The index of the [Bone2D] node that the modification will operate on. */
        get bone_index(): int64
        set bone_index(value: int64)
        
        /** The [Bone2D] node that the modification will operate on. */
        get bone2d_node(): NodePath
        set bone2d_node(value: NodePath | string)
        
        /** The NodePath to the node that is the target for the LookAt modification. This node is what the modification will rotate the [Bone2D] to. */
        get target_nodepath(): NodePath
        set target_nodepath(value: NodePath | string)
        /** @deprecated Internal use. Does not exist at runtime. */
        __godotNameMap: __NameMapSkeletonModification2DLookAt;
    }
    /** @deprecated Internal use. Does not exist at runtime. */
    interface __NameMapSkeletonModification2DPhysicalBones extends __NameMapSkeletonModification2D {
    }
    /** A modification that applies the transforms of [PhysicalBone2D] nodes to [Bone2D] nodes.  
     *  	  
     *  @link https://docs.godotengine.org/en/4.5/classes/class_skeletonmodification2dphysicalbones.html  
     */
    class SkeletonModification2DPhysicalBones extends SkeletonModification2D {
        constructor(identifier?: any)
        /** Sets the [PhysicalBone2D] node at [param joint_idx].  
         *      
         *  **Note:** This is just the index used for this modification, not the bone index used in the [Skeleton2D].  
         */
        set_physical_bone_node(joint_idx: int64, physicalbone2d_node: NodePath | string): void
        
        /** Returns the [PhysicalBone2D] node at [param joint_idx]. */
        get_physical_bone_node(joint_idx: int64): NodePath
        
        /** Empties the list of [PhysicalBone2D] nodes and populates it with all [PhysicalBone2D] nodes that are children of the [Skeleton2D]. */
        fetch_physical_bones(): void
        
        /** Tell the [PhysicalBone2D] nodes to start simulating and interacting with the physics world.  
         *  Optionally, an array of bone names can be passed to this function, and that will cause only [PhysicalBone2D] nodes with those names to start simulating.  
         */
        start_simulation(bones?: GArray<StringName> /* = [] */): void
        
        /** Tell the [PhysicalBone2D] nodes to stop simulating and interacting with the physics world.  
         *  Optionally, an array of bone names can be passed to this function, and that will cause only [PhysicalBone2D] nodes with those names to stop simulating.  
         */
        stop_simulation(bones?: GArray<StringName> /* = [] */): void
        
        /** The number of [PhysicalBone2D] nodes linked in this modification. */
        get physical_bone_chain_length(): int64
        set physical_bone_chain_length(value: int64)
        /** @deprecated Internal use. Does not exist at runtime. */
        __godotNameMap: __NameMapSkeletonModification2DPhysicalBones;
    }
    /** @deprecated Internal use. Does not exist at runtime. */
    interface __NameMapSkeletonModification2DStackHolder extends __NameMapSkeletonModification2D {
    }
    /** A modification that holds and executes a [SkeletonModificationStack2D].  
     *  	  
     *  @link https://docs.godotengine.org/en/4.5/classes/class_skeletonmodification2dstackholder.html  
     */
    class SkeletonModification2DStackHolder extends SkeletonModification2D {
        constructor(identifier?: any)
        /** Sets the [SkeletonModificationStack2D] that this modification is holding. This modification stack will then be executed when this modification is executed. */
        set_held_modification_stack(held_modification_stack: SkeletonModificationStack2D): void
        
        /** Returns the [SkeletonModificationStack2D] that this modification is holding. */
        get_held_modification_stack(): null | SkeletonModificationStack2D
        /** @deprecated Internal use. Does not exist at runtime. */
        __godotNameMap: __NameMapSkeletonModification2DStackHolder;
    }
    /** @deprecated Internal use. Does not exist at runtime. */
    interface __NameMapSkeletonModification2DTwoBoneIK extends __NameMapSkeletonModification2D {
    }
    /** A modification that rotates two bones using the law of cosines to reach the target.  
     *  	  
     *  @link https://docs.godotengine.org/en/4.5/classes/class_skeletonmodification2dtwoboneik.html  
     */
    class SkeletonModification2DTwoBoneIK extends SkeletonModification2D {
        constructor(identifier?: any)
        /** Sets the [Bone2D] node that is being used as the first bone in the TwoBoneIK modification. */
        set_joint_one_bone2d_node(bone2d_node: NodePath | string): void
        
        /** Returns the [Bone2D] node that is being used as the first bone in the TwoBoneIK modification. */
        get_joint_one_bone2d_node(): NodePath
        
        /** Sets the index of the [Bone2D] node that is being used as the first bone in the TwoBoneIK modification. */
        set_joint_one_bone_idx(bone_idx: int64): void
        
        /** Returns the index of the [Bone2D] node that is being used as the first bone in the TwoBoneIK modification. */
        get_joint_one_bone_idx(): int64
        
        /** Sets the [Bone2D] node that is being used as the second bone in the TwoBoneIK modification. */
        set_joint_two_bone2d_node(bone2d_node: NodePath | string): void
        
        /** Returns the [Bone2D] node that is being used as the second bone in the TwoBoneIK modification. */
        get_joint_two_bone2d_node(): NodePath
        
        /** Sets the index of the [Bone2D] node that is being used as the second bone in the TwoBoneIK modification. */
        set_joint_two_bone_idx(bone_idx: int64): void
        
        /** Returns the index of the [Bone2D] node that is being used as the second bone in the TwoBoneIK modification. */
        get_joint_two_bone_idx(): int64
        
        /** The NodePath to the node that is the target for the TwoBoneIK modification. This node is what the modification will use when bending the [Bone2D] nodes. */
        get target_nodepath(): NodePath
        set target_nodepath(value: NodePath | string)
        
        /** The minimum distance the target can be at. If the target is closer than this distance, the modification will solve as if it's at this minimum distance. When set to `0`, the modification will solve without distance constraints. */
        get target_minimum_distance(): float64
        set target_minimum_distance(value: float64)
        
        /** The maximum distance the target can be at. If the target is farther than this distance, the modification will solve as if it's at this maximum distance. When set to `0`, the modification will solve without distance constraints. */
        get target_maximum_distance(): float64
        set target_maximum_distance(value: float64)
        
        /** If `true`, the bones in the modification will bend outward as opposed to inwards when contracting. If `false`, the bones will bend inwards when contracting. */
        get flip_bend_direction(): boolean
        set flip_bend_direction(value: boolean)
        /** @deprecated Internal use. Does not exist at runtime. */
        __godotNameMap: __NameMapSkeletonModification2DTwoBoneIK;
    }
    /** @deprecated Internal use. Does not exist at runtime. */
    interface __NameMapSkeletonModificationStack2D extends __NameMapResource {
    }
    /** A resource that holds a stack of [SkeletonModification2D]s.  
     *  	  
     *  @link https://docs.godotengine.org/en/4.5/classes/class_skeletonmodificationstack2d.html  
     */
    class SkeletonModificationStack2D extends Resource {
        constructor(identifier?: any)
        /** Sets up the modification stack so it can execute. This function should be called by [Skeleton2D] and shouldn't be manually called unless you know what you are doing. */
        setup(): void
        
        /** Executes all of the [SkeletonModification2D]s in the stack that use the same execution mode as the passed-in [param execution_mode], starting from index `0` to [member modification_count].  
         *      
         *  **Note:** The order of the modifications can matter depending on the modifications. For example, modifications on a spine should operate before modifications on the arms in order to get proper results.  
         */
        execute(delta: float64, execution_mode: int64): void
        
        /** Enables all [SkeletonModification2D]s in the stack. */
        enable_all_modifications(enabled: boolean): void
        
        /** Returns the [SkeletonModification2D] at the passed-in index, [param mod_idx]. */
        get_modification(mod_idx: int64): null | SkeletonModification2D
        
        /** Adds the passed-in [SkeletonModification2D] to the stack. */
        add_modification(modification: SkeletonModification2D): void
        
        /** Deletes the [SkeletonModification2D] at the index position [param mod_idx], if it exists. */
        delete_modification(mod_idx: int64): void
        
        /** Sets the modification at [param mod_idx] to the passed-in modification, [param modification]. */
        set_modification(mod_idx: int64, modification: SkeletonModification2D): void
        
        /** Returns a boolean that indicates whether the modification stack is setup and can execute. */
        get_is_setup(): boolean
        
        /** Returns the [Skeleton2D] node that the SkeletonModificationStack2D is bound to. */
        get_skeleton(): null | Skeleton2D
        
        /** If `true`, the modification's in the stack will be called. This is handled automatically through the [Skeleton2D] node. */
        get enabled(): boolean
        set enabled(value: boolean)
        
        /** The interpolation strength of the modifications in stack. A value of `0` will make it where the modifications are not applied, a strength of `0.5` will be half applied, and a strength of `1` will allow the modifications to be fully applied and override the [Skeleton2D] [Bone2D] poses. */
        get strength(): float64
        set strength(value: float64)
        
        /** The number of modifications in the stack. */
        get modification_count(): int64
        set modification_count(value: int64)
        /** @deprecated Internal use. Does not exist at runtime. */
        __godotNameMap: __NameMapSkeletonModificationStack2D;
    }
    namespace SkeletonModifier3D {
        enum BoneAxis {
            /** Enumerated value for the +X axis. */
            BONE_AXIS_PLUS_X = 0,
            
            /** Enumerated value for the -X axis. */
            BONE_AXIS_MINUS_X = 1,
            
            /** Enumerated value for the +Y axis. */
            BONE_AXIS_PLUS_Y = 2,
            
            /** Enumerated value for the -Y axis. */
            BONE_AXIS_MINUS_Y = 3,
            
            /** Enumerated value for the +Z axis. */
            BONE_AXIS_PLUS_Z = 4,
            
            /** Enumerated value for the -Z axis. */
            BONE_AXIS_MINUS_Z = 5,
        }
    }
    /** @deprecated Internal use. Does not exist at runtime. */
    interface __NameMapSkeletonModifier3D extends __NameMapNode3D {
    }
    /** A node that may modify a Skeleton3D's bones.  
     *  	  
     *  @link https://docs.godotengine.org/en/4.5/classes/class_skeletonmodifier3d.html  
     */
    class SkeletonModifier3D<Map extends NodePathMap = any> extends Node3D<Map> {
        constructor(identifier?: any)
        /** Override this virtual method to implement a custom skeleton modifier. You should do things like get the [Skeleton3D]'s current pose and apply the pose here.  
         *  [method _process_modification_with_delta] must not apply [member influence] to bone poses because the [Skeleton3D] automatically applies influence to all bone poses set by the modifier.  
         *  [param delta] is passed from parent [Skeleton3D]. See also [method Skeleton3D.advance].  
         */
        /* gdvirtual */ _process_modification_with_delta(delta: float64): void
        
        /** Override this virtual method to implement a custom skeleton modifier. You should do things like get the [Skeleton3D]'s current pose and apply the pose here.  
         *  [method _process_modification] must not apply [member influence] to bone poses because the [Skeleton3D] automatically applies influence to all bone poses set by the modifier.  
         */
        /* gdvirtual */ _process_modification(): void
        
        /** Called when the skeleton is changed. */
        /* gdvirtual */ _skeleton_changed(old_skeleton: Skeleton3D, new_skeleton: Skeleton3D): void
        
        /** Called when bone name and index need to be validated such as the timing of the entering tree or changing skeleton. */
        /* gdvirtual */ _validate_bone_names(): void
        
        /** Get parent [Skeleton3D] node if found. */
        get_skeleton(): null | Skeleton3D
        
        /** If `true`, the [SkeletonModifier3D] will be processing. */
        get active(): boolean
        set active(value: boolean)
        
        /** Sets the influence of the modification.  
         *      
         *  **Note:** This value is used by [Skeleton3D] to blend, so the [SkeletonModifier3D] should always apply only 100% of the result without interpolation.  
         */
        get influence(): float64
        set influence(value: float64)
        
        /** Notifies when the modification have been finished.  
         *      
         *  **Note:** If you want to get the modified bone pose by the modifier, you must use [method Skeleton3D.get_bone_pose] or [method Skeleton3D.get_bone_global_pose] at the moment this signal is fired.  
         */
        readonly modification_processed: Signal<() => void>
        /** @deprecated Internal use. Does not exist at runtime. */
        __godotNameMap: __NameMapSkeletonModifier3D;
    }
    namespace SkeletonProfile {
        enum TailDirection {
            /** Direction to the average coordinates of bone children. */
            TAIL_DIRECTION_AVERAGE_CHILDREN = 0,
            
            /** Direction to the coordinates of specified bone child. */
            TAIL_DIRECTION_SPECIFIC_CHILD = 1,
            
            /** Direction is not calculated. */
            TAIL_DIRECTION_END = 2,
        }
    }
    /** @deprecated Internal use. Does not exist at runtime. */
    interface __NameMapSkeletonProfile extends __NameMapResource {
    }
    /** Base class for a profile of a virtual skeleton used as a target for retargeting.  
     *  	  
     *  @link https://docs.godotengine.org/en/4.5/classes/class_skeletonprofile.html  
     */
    class SkeletonProfile extends Resource {
        constructor(identifier?: any)
        /** Returns the name of the group at [param group_idx] that will be the drawing group in the [BoneMap] editor. */
        get_group_name(group_idx: int64): StringName
        
        /** Sets the name of the group at [param group_idx] that will be the drawing group in the [BoneMap] editor. */
        set_group_name(group_idx: int64, group_name: StringName): void
        
        /** Returns the texture of the group at [param group_idx] that will be the drawing group background image in the [BoneMap] editor. */
        get_texture(group_idx: int64): null | Texture2D
        
        /** Sets the texture of the group at [param group_idx] that will be the drawing group background image in the [BoneMap] editor. */
        set_texture(group_idx: int64, texture: Texture2D): void
        
        /** Returns the bone index that matches [param bone_name] as its name. */
        find_bone(bone_name: StringName): int64
        
        /** Returns the name of the bone at [param bone_idx] that will be the key name in the [BoneMap].  
         *  In the retargeting process, the returned bone name is the bone name of the target skeleton.  
         */
        get_bone_name(bone_idx: int64): StringName
        
        /** Sets the name of the bone at [param bone_idx] that will be the key name in the [BoneMap].  
         *  In the retargeting process, the setting bone name is the bone name of the target skeleton.  
         */
        set_bone_name(bone_idx: int64, bone_name: StringName): void
        
        /** Returns the name of the bone which is the parent to the bone at [param bone_idx]. The result is empty if the bone has no parent. */
        get_bone_parent(bone_idx: int64): StringName
        
        /** Sets the bone with name [param bone_parent] as the parent of the bone at [param bone_idx]. If an empty string is passed, then the bone has no parent. */
        set_bone_parent(bone_idx: int64, bone_parent: StringName): void
        
        /** Returns the tail direction of the bone at [param bone_idx]. */
        get_tail_direction(bone_idx: int64): SkeletonProfile.TailDirection
        
        /** Sets the tail direction of the bone at [param bone_idx].  
         *      
         *  **Note:** This only specifies the method of calculation. The actual coordinates required should be stored in an external skeleton, so the calculation itself needs to be done externally.  
         */
        set_tail_direction(bone_idx: int64, tail_direction: SkeletonProfile.TailDirection): void
        
        /** Returns the name of the bone which is the tail of the bone at [param bone_idx]. */
        get_bone_tail(bone_idx: int64): StringName
        
        /** Sets the bone with name [param bone_tail] as the tail of the bone at [param bone_idx]. */
        set_bone_tail(bone_idx: int64, bone_tail: StringName): void
        
        /** Returns the reference pose transform for bone [param bone_idx]. */
        get_reference_pose(bone_idx: int64): Transform3D
        
        /** Sets the reference pose transform for bone [param bone_idx]. */
        set_reference_pose(bone_idx: int64, bone_name: Transform3D): void
        
        /** Returns the offset of the bone at [param bone_idx] that will be the button position in the [BoneMap] editor.  
         *  This is the offset with origin at the top left corner of the square.  
         */
        get_handle_offset(bone_idx: int64): Vector2
        
        /** Sets the offset of the bone at [param bone_idx] that will be the button position in the [BoneMap] editor.  
         *  This is the offset with origin at the top left corner of the square.  
         */
        set_handle_offset(bone_idx: int64, handle_offset: Vector2): void
        
        /** Returns the group of the bone at [param bone_idx]. */
        get_group(bone_idx: int64): StringName
        
        /** Sets the group of the bone at [param bone_idx]. */
        set_group(bone_idx: int64, group: StringName): void
        
        /** Returns whether the bone at [param bone_idx] is required for retargeting.  
         *  This value is used by the bone map editor. If this method returns `true`, and no bone is assigned, the handle color will be red on the bone map editor.  
         */
        is_required(bone_idx: int64): boolean
        
        /** Sets the required status for bone [param bone_idx] to [param required]. */
        set_required(bone_idx: int64, required: boolean): void
        
        /** A bone name that will be used as the root bone in [AnimationTree]. This should be the bone of the parent of hips that exists at the world origin. */
        get root_bone(): StringName
        set root_bone(value: StringName)
        
        /** A bone name which will use model's height as the coefficient for normalization. For example, [SkeletonProfileHumanoid] defines it as `Hips`. */
        get scale_base_bone(): StringName
        set scale_base_bone(value: StringName)
        
        /** The amount of groups of bones in retargeting section's [BoneMap] editor. For example, [SkeletonProfileHumanoid] has 4 groups.  
         *  This property exists to separate the bone list into several sections in the editor.  
         */
        get group_size(): int64
        set group_size(value: int64)
        
        /** The amount of bones in retargeting section's [BoneMap] editor. For example, [SkeletonProfileHumanoid] has 56 bones.  
         *  The size of elements in [BoneMap] updates when changing this property in it's assigned [SkeletonProfile].  
         */
        get bone_size(): int64
        set bone_size(value: int64)
        
        /** This signal is emitted when change the value in profile. This is used to update key name in the [BoneMap] and to redraw the [BoneMap] editor.  
         *      
         *  **Note:** This signal is not connected directly to editor to simplify the reference, instead it is passed on to editor through the [BoneMap].  
         */
        readonly profile_updated: Signal<() => void>
        /** @deprecated Internal use. Does not exist at runtime. */
        __godotNameMap: __NameMapSkeletonProfile;
    }
    /** @deprecated Internal use. Does not exist at runtime. */
    interface __NameMapSkeletonProfileHumanoid extends __NameMapSkeletonProfile {
    }
    /** A humanoid [SkeletonProfile] preset.  
     *  	  
     *  @link https://docs.godotengine.org/en/4.5/classes/class_skeletonprofilehumanoid.html  
     */
    class SkeletonProfileHumanoid extends SkeletonProfile {
        constructor(identifier?: any)
        /** @deprecated Internal use. Does not exist at runtime. */
        __godotNameMap: __NameMapSkeletonProfileHumanoid;
    }
    /** @deprecated Internal use. Does not exist at runtime. */
    interface __NameMapSkin extends __NameMapResource {
    }
    /** @link https://docs.godotengine.org/en/4.5/classes/class_skin.html */
    class Skin extends Resource {
        constructor(identifier?: any)
        set_bind_count(bind_count: int64): void
        get_bind_count(): int64
        add_bind(bone: int64, pose: Transform3D): void
        add_named_bind(name: string, pose: Transform3D): void
        set_bind_pose(bind_index: int64, pose: Transform3D): void
        get_bind_pose(bind_index: int64): Transform3D
        set_bind_name(bind_index: int64, name: StringName): void
        get_bind_name(bind_index: int64): StringName
        set_bind_bone(bind_index: int64, bone: int64): void
        get_bind_bone(bind_index: int64): int64
        clear_binds(): void
        /** @deprecated Internal use. Does not exist at runtime. */
        __godotNameMap: __NameMapSkin;
    }
    /** @deprecated Internal use. Does not exist at runtime. */
    interface __NameMapSkinReference extends __NameMapRefCounted {
    }
    /** A reference-counted holder object for a skeleton RID used in the [RenderingServer].  
     *  	  
     *  @link https://docs.godotengine.org/en/4.5/classes/class_skinreference.html  
     */
    class SkinReference extends RefCounted {
        constructor(identifier?: any)
        /** Returns the [RID] owned by this SkinReference, as returned by [method RenderingServer.skeleton_create]. */
        get_skeleton(): RID
        
        /** Returns the [Skin] connected to this SkinReference. In the case of [MeshInstance3D] with no [member MeshInstance3D.skin] assigned, this will reference an internal default [Skin] owned by that [MeshInstance3D].  
         *  Note that a single [Skin] may have more than one [SkinReference] in the case that it is shared by meshes across multiple [Skeleton3D] nodes.  
         */
        get_skin(): null | Skin
        /** @deprecated Internal use. Does not exist at runtime. */
        __godotNameMap: __NameMapSkinReference;
    }
    namespace Sky {
        enum RadianceSize {
            /** Radiance texture size is 32×32 pixels. */
            RADIANCE_SIZE_32 = 0,
            
            /** Radiance texture size is 64×64 pixels. */
            RADIANCE_SIZE_64 = 1,
            
            /** Radiance texture size is 128×128 pixels. */
            RADIANCE_SIZE_128 = 2,
            
            /** Radiance texture size is 256×256 pixels. */
            RADIANCE_SIZE_256 = 3,
            
            /** Radiance texture size is 512×512 pixels. */
            RADIANCE_SIZE_512 = 4,
            
            /** Radiance texture size is 1024×1024 pixels. */
            RADIANCE_SIZE_1024 = 5,
            
            /** Radiance texture size is 2048×2048 pixels. */
            RADIANCE_SIZE_2048 = 6,
            
            /** Represents the size of the [enum RadianceSize] enum. */
            RADIANCE_SIZE_MAX = 7,
        }
        enum ProcessMode {
            /** Automatically selects the appropriate process mode based on your sky shader. If your shader uses `TIME` or `POSITION`, this will use [constant PROCESS_MODE_REALTIME]. If your shader uses any of the `LIGHT_*` variables or any custom uniforms, this uses [constant PROCESS_MODE_INCREMENTAL]. Otherwise, this defaults to [constant PROCESS_MODE_QUALITY]. */
            PROCESS_MODE_AUTOMATIC = 0,
            
            /** Uses high quality importance sampling to process the radiance map. In general, this results in much higher quality than [constant PROCESS_MODE_REALTIME] but takes much longer to generate. This should not be used if you plan on changing the sky at runtime. If you are finding that the reflection is not blurry enough and is showing sparkles or fireflies, try increasing [member ProjectSettings.rendering/reflections/sky_reflections/ggx_samples]. */
            PROCESS_MODE_QUALITY = 1,
            
            /** Uses the same high quality importance sampling to process the radiance map as [constant PROCESS_MODE_QUALITY], but updates over several frames. The number of frames is determined by [member ProjectSettings.rendering/reflections/sky_reflections/roughness_layers]. Use this when you need highest quality radiance maps, but have a sky that updates slowly. */
            PROCESS_MODE_INCREMENTAL = 2,
            
            /** Uses the fast filtering algorithm to process the radiance map. In general this results in lower quality, but substantially faster run times. If you need better quality, but still need to update the sky every frame, consider turning on [member ProjectSettings.rendering/reflections/sky_reflections/fast_filter_high_quality].  
             *      
             *  **Note:** The fast filtering algorithm is limited to 256×256 cubemaps, so [member radiance_size] must be set to [constant RADIANCE_SIZE_256]. Otherwise, a warning is printed and the overridden radiance size is ignored.  
             */
            PROCESS_MODE_REALTIME = 3,
        }
    }
    /** @deprecated Internal use. Does not exist at runtime. */
    interface __NameMapSky extends __NameMapResource {
    }
    /** Defines a 3D environment's background by using a [Material].  
     *  	  
     *  @link https://docs.godotengine.org/en/4.5/classes/class_sky.html  
     */
    class Sky extends Resource {
        constructor(identifier?: any)
        /** [Material] used to draw the background. Can be [PanoramaSkyMaterial], [ProceduralSkyMaterial], [PhysicalSkyMaterial], or even a [ShaderMaterial] if you want to use your own custom shader. */
        get sky_material(): null | PanoramaSkyMaterial | ProceduralSkyMaterial | PhysicalSkyMaterial | ShaderMaterial
        set sky_material(value: null | PanoramaSkyMaterial | ProceduralSkyMaterial | PhysicalSkyMaterial | ShaderMaterial)
        
        /** The method for generating the radiance map from the sky. The radiance map is a cubemap with increasingly blurry versions of the sky corresponding to different levels of roughness. Radiance maps can be expensive to calculate. */
        get process_mode(): int64
        set process_mode(value: int64)
        
        /** The [Sky]'s radiance map size. The higher the radiance map size, the more detailed the lighting from the [Sky] will be.  
         *      
         *  **Note:** Some hardware will have trouble with higher radiance sizes, especially [constant RADIANCE_SIZE_512] and above. Only use such high values on high-end hardware.  
         */
        get radiance_size(): int64
        set radiance_size(value: int64)
        /** @deprecated Internal use. Does not exist at runtime. */
        __godotNameMap: __NameMapSky;
    }
    namespace Slider {
        enum TickPosition {
            /** Places the ticks at the bottom of the [HSlider], or right of the [VSlider]. */
            TICK_POSITION_BOTTOM_RIGHT = 0,
            
            /** Places the ticks at the top of the [HSlider], or left of the [VSlider]. */
            TICK_POSITION_TOP_LEFT = 1,
            
            /** Places the ticks at the both sides of the slider. */
            TICK_POSITION_BOTH = 2,
            
            /** Places the ticks at the center of the slider. */
            TICK_POSITION_CENTER = 3,
        }
    }
    /** @deprecated Internal use. Does not exist at runtime. */
    interface __NameMapSlider extends __NameMapRange {
    }
    /** Abstract base class for sliders.  
     *  	  
     *  @link https://docs.godotengine.org/en/4.5/classes/class_slider.html  
     */
    class Slider<Map extends NodePathMap = any> extends Range<Map> {
        constructor(identifier?: any)
        /** If `true`, the slider can be interacted with. If `false`, the value can be changed only by code. */
        get editable(): boolean
        set editable(value: boolean)
        
        /** If `true`, the value can be changed using the mouse wheel. */
        get scrollable(): boolean
        set scrollable(value: boolean)
        
        /** Number of ticks displayed on the slider, including border ticks. Ticks are uniformly-distributed value markers. */
        get tick_count(): int64
        set tick_count(value: int64)
        
        /** If `true`, the slider will display ticks for minimum and maximum values. */
        get ticks_on_borders(): boolean
        set ticks_on_borders(value: boolean)
        
        /** Sets the position of the ticks. See [enum TickPosition] for details. */
        get ticks_position(): int64
        set ticks_position(value: int64)
        
        /** Emitted when the grabber starts being dragged. This is emitted before the corresponding [signal Range.value_changed] signal. */
        readonly drag_started: Signal<() => void>
        
        /** Emitted when the grabber stops being dragged. If [param value_changed] is `true`, [member Range.value] is different from the value when the dragging was started. */
        readonly drag_ended: Signal<(value_changed: boolean) => void>
        /** @deprecated Internal use. Does not exist at runtime. */
        __godotNameMap: __NameMapSlider;
    }
    namespace SliderJoint3D {
        enum Param {
            /** Constant for accessing [member linear_limit/upper_distance]. The maximum difference between the pivot points on their X axis before damping happens. */
            PARAM_LINEAR_LIMIT_UPPER = 0,
            
            /** Constant for accessing [member linear_limit/lower_distance]. The minimum difference between the pivot points on their X axis before damping happens. */
            PARAM_LINEAR_LIMIT_LOWER = 1,
            
            /** Constant for accessing [member linear_limit/softness]. A factor applied to the movement across the slider axis once the limits get surpassed. The lower, the slower the movement. */
            PARAM_LINEAR_LIMIT_SOFTNESS = 2,
            
            /** Constant for accessing [member linear_limit/restitution]. The amount of restitution once the limits are surpassed. The lower, the more velocity-energy gets lost. */
            PARAM_LINEAR_LIMIT_RESTITUTION = 3,
            
            /** Constant for accessing [member linear_limit/damping]. The amount of damping once the slider limits are surpassed. */
            PARAM_LINEAR_LIMIT_DAMPING = 4,
            
            /** Constant for accessing [member linear_motion/softness]. A factor applied to the movement across the slider axis as long as the slider is in the limits. The lower, the slower the movement. */
            PARAM_LINEAR_MOTION_SOFTNESS = 5,
            
            /** Constant for accessing [member linear_motion/restitution]. The amount of restitution inside the slider limits. */
            PARAM_LINEAR_MOTION_RESTITUTION = 6,
            
            /** Constant for accessing [member linear_motion/damping]. The amount of damping inside the slider limits. */
            PARAM_LINEAR_MOTION_DAMPING = 7,
            
            /** Constant for accessing [member linear_ortho/softness]. A factor applied to the movement across axes orthogonal to the slider. */
            PARAM_LINEAR_ORTHOGONAL_SOFTNESS = 8,
            
            /** Constant for accessing [member linear_motion/restitution]. The amount of restitution when movement is across axes orthogonal to the slider. */
            PARAM_LINEAR_ORTHOGONAL_RESTITUTION = 9,
            
            /** Constant for accessing [member linear_motion/damping]. The amount of damping when movement is across axes orthogonal to the slider. */
            PARAM_LINEAR_ORTHOGONAL_DAMPING = 10,
            
            /** Constant for accessing [member angular_limit/upper_angle]. The upper limit of rotation in the slider. */
            PARAM_ANGULAR_LIMIT_UPPER = 11,
            
            /** Constant for accessing [member angular_limit/lower_angle]. The lower limit of rotation in the slider. */
            PARAM_ANGULAR_LIMIT_LOWER = 12,
            
            /** Constant for accessing [member angular_limit/softness]. A factor applied to the all rotation once the limit is surpassed. */
            PARAM_ANGULAR_LIMIT_SOFTNESS = 13,
            
            /** Constant for accessing [member angular_limit/restitution]. The amount of restitution of the rotation when the limit is surpassed. */
            PARAM_ANGULAR_LIMIT_RESTITUTION = 14,
            
            /** Constant for accessing [member angular_limit/damping]. The amount of damping of the rotation when the limit is surpassed. */
            PARAM_ANGULAR_LIMIT_DAMPING = 15,
            
            /** Constant for accessing [member angular_motion/softness]. A factor applied to the all rotation in the limits. */
            PARAM_ANGULAR_MOTION_SOFTNESS = 16,
            
            /** Constant for accessing [member angular_motion/restitution]. The amount of restitution of the rotation in the limits. */
            PARAM_ANGULAR_MOTION_RESTITUTION = 17,
            
            /** Constant for accessing [member angular_motion/damping]. The amount of damping of the rotation in the limits. */
            PARAM_ANGULAR_MOTION_DAMPING = 18,
            
            /** Constant for accessing [member angular_ortho/softness]. A factor applied to the all rotation across axes orthogonal to the slider. */
            PARAM_ANGULAR_ORTHOGONAL_SOFTNESS = 19,
            
            /** Constant for accessing [member angular_ortho/restitution]. The amount of restitution of the rotation across axes orthogonal to the slider. */
            PARAM_ANGULAR_ORTHOGONAL_RESTITUTION = 20,
            
            /** Constant for accessing [member angular_ortho/damping]. The amount of damping of the rotation across axes orthogonal to the slider. */
            PARAM_ANGULAR_ORTHOGONAL_DAMPING = 21,
            
            /** Represents the size of the [enum Param] enum. */
            PARAM_MAX = 22,
        }
    }
    /** @deprecated Internal use. Does not exist at runtime. */
    interface __NameMapSliderJoint3D extends __NameMapJoint3D {
    }
    /** A physics joint that restricts the movement of a 3D physics body along an axis relative to another physics body.  
     *  	  
     *  @link https://docs.godotengine.org/en/4.5/classes/class_sliderjoint3d.html  
     */
    class SliderJoint3D<Map extends NodePathMap = any> extends Joint3D<Map> {
        constructor(identifier?: any)
        /** Assigns [param value] to the given parameter. */
        set_param(param: SliderJoint3D.Param, value: float64): void
        
        /** Returns the value of the given parameter. */
        get_param(param: SliderJoint3D.Param): float64
        
        /** The maximum difference between the pivot points on their X axis before damping happens. */
        get "linear_limit/upper_distance"(): float64
        set "linear_limit/upper_distance"(value: float64)
        
        /** The minimum difference between the pivot points on their X axis before damping happens. */
        get "linear_limit/lower_distance"(): float64
        set "linear_limit/lower_distance"(value: float64)
        
        /** A factor applied to the movement across the slider axis once the limits get surpassed. The lower, the slower the movement. */
        get "linear_limit/softness"(): float64
        set "linear_limit/softness"(value: float64)
        
        /** The amount of restitution once the limits are surpassed. The lower, the more velocity-energy gets lost. */
        get "linear_limit/restitution"(): float64
        set "linear_limit/restitution"(value: float64)
        
        /** The amount of damping that happens once the limit defined by [member linear_limit/lower_distance] and [member linear_limit/upper_distance] is surpassed. */
        get "linear_limit/damping"(): float64
        set "linear_limit/damping"(value: float64)
        
        /** A factor applied to the movement across the slider axis as long as the slider is in the limits. The lower, the slower the movement. */
        get "linear_motion/softness"(): float64
        set "linear_motion/softness"(value: float64)
        
        /** The amount of restitution inside the slider limits. */
        get "linear_motion/restitution"(): float64
        set "linear_motion/restitution"(value: float64)
        
        /** The amount of damping inside the slider limits. */
        get "linear_motion/damping"(): float64
        set "linear_motion/damping"(value: float64)
        
        /** A factor applied to the movement across axes orthogonal to the slider. */
        get "linear_ortho/softness"(): float64
        set "linear_ortho/softness"(value: float64)
        
        /** The amount of restitution when movement is across axes orthogonal to the slider. */
        get "linear_ortho/restitution"(): float64
        set "linear_ortho/restitution"(value: float64)
        
        /** The amount of damping when movement is across axes orthogonal to the slider. */
        get "linear_ortho/damping"(): float64
        set "linear_ortho/damping"(value: float64)
        
        /** The upper limit of rotation in the slider. */
        get "angular_limit/upper_angle"(): float64
        set "angular_limit/upper_angle"(value: float64)
        
        /** The lower limit of rotation in the slider. */
        get "angular_limit/lower_angle"(): float64
        set "angular_limit/lower_angle"(value: float64)
        
        /** A factor applied to the all rotation once the limit is surpassed.  
         *  Makes all rotation slower when between 0 and 1.  
         */
        get "angular_limit/softness"(): float64
        set "angular_limit/softness"(value: float64)
        
        /** The amount of restitution of the rotation when the limit is surpassed.  
         *  Does not affect damping.  
         */
        get "angular_limit/restitution"(): float64
        set "angular_limit/restitution"(value: float64)
        
        /** The amount of damping of the rotation when the limit is surpassed.  
         *  A lower damping value allows a rotation initiated by body A to travel to body B slower.  
         */
        get "angular_limit/damping"(): float64
        set "angular_limit/damping"(value: float64)
        
        /** A factor applied to the all rotation in the limits. */
        get "angular_motion/softness"(): float64
        set "angular_motion/softness"(value: float64)
        
        /** The amount of restitution of the rotation in the limits. */
        get "angular_motion/restitution"(): float64
        set "angular_motion/restitution"(value: float64)
        
        /** The amount of damping of the rotation in the limits. */
        get "angular_motion/damping"(): float64
        set "angular_motion/damping"(value: float64)
        
        /** A factor applied to the all rotation across axes orthogonal to the slider. */
        get "angular_ortho/softness"(): float64
        set "angular_ortho/softness"(value: float64)
        
        /** The amount of restitution of the rotation across axes orthogonal to the slider. */
        get "angular_ortho/restitution"(): float64
        set "angular_ortho/restitution"(value: float64)
        
        /** The amount of damping of the rotation across axes orthogonal to the slider. */
        get "angular_ortho/damping"(): float64
        set "angular_ortho/damping"(value: float64)
        /** @deprecated Internal use. Does not exist at runtime. */
        __godotNameMap: __NameMapSliderJoint3D;
    }
    namespace SoftBody3D {
        enum DisableMode {
            /** When [member Node.process_mode] is set to [constant Node.PROCESS_MODE_DISABLED], remove from the physics simulation to stop all physics interactions with this [SoftBody3D].  
             *  Automatically re-added to the physics simulation when the [Node] is processed again.  
             */
            DISABLE_MODE_REMOVE = 0,
            
            /** When [member Node.process_mode] is set to [constant Node.PROCESS_MODE_DISABLED], do not affect the physics simulation. */
            DISABLE_MODE_KEEP_ACTIVE = 1,
        }
    }
    /** @deprecated Internal use. Does not exist at runtime. */
    interface __NameMapSoftBody3D extends __NameMapMeshInstance3D {
    }
    /** A deformable 3D physics mesh.  
     *  	  
     *  @link https://docs.godotengine.org/en/4.5/classes/class_softbody3d.html  
     */
    class SoftBody3D<Map extends NodePathMap = any> extends MeshInstance3D<Map> {
        constructor(identifier?: any)
        /** Returns the internal [RID] used by the [PhysicsServer3D] for this body. */
        get_physics_rid(): RID
        
        /** Based on [param value], enables or disables the specified layer in the [member collision_mask], given a [param layer_number] between 1 and 32. */
        set_collision_mask_value(layer_number: int64, value: boolean): void
        
        /** Returns whether or not the specified layer of the [member collision_mask] is enabled, given a [param layer_number] between 1 and 32. */
        get_collision_mask_value(layer_number: int64): boolean
        
        /** Based on [param value], enables or disables the specified layer in the [member collision_layer], given a [param layer_number] between 1 and 32. */
        set_collision_layer_value(layer_number: int64, value: boolean): void
        
        /** Returns whether or not the specified layer of the [member collision_layer] is enabled, given a [param layer_number] between 1 and 32. */
        get_collision_layer_value(layer_number: int64): boolean
        
        /** Returns an array of nodes that were added as collision exceptions for this body. */
        get_collision_exceptions(): GArray<PhysicsBody3D>
        
        /** Adds a body to the list of bodies that this body can't collide with. */
        add_collision_exception_with(body: Node): void
        
        /** Removes a body from the list of bodies that this body can't collide with. */
        remove_collision_exception_with(body: Node): void
        
        /** Returns local translation of a vertex in the surface array. */
        get_point_transform(point_index: int64): Vector3
        
        /** Applies an impulse to a point.  
         *  An impulse is time-independent! Applying an impulse every frame would result in a framerate-dependent force. For this reason, it should only be used when simulating one-time impacts (use the "_force" functions otherwise).  
         */
        apply_impulse(point_index: int64, impulse: Vector3): void
        
        /** Applies a force to a point. A force is time dependent and meant to be applied every physics update. */
        apply_force(point_index: int64, force: Vector3): void
        
        /** Distributes and applies an impulse to all points.  
         *  An impulse is time-independent! Applying an impulse every frame would result in a framerate-dependent force. For this reason, it should only be used when simulating one-time impacts (use the "_force" functions otherwise).  
         */
        apply_central_impulse(impulse: Vector3): void
        
        /** Distributes and applies a force to all points. A force is time dependent and meant to be applied every physics update. */
        apply_central_force(force: Vector3): void
        
        /** Sets the pinned state of a surface vertex. When set to `true`, the optional [param attachment_path] can define a [Node3D] the pinned vertex will be attached to. */
        set_point_pinned(point_index: int64, pinned: boolean, attachment_path?: NodePath | string /* = '' */, insert_at?: int64 /* = -1 */): void
        
        /** Returns `true` if vertex is set to pinned. */
        is_point_pinned(point_index: int64): boolean
        
        /** The physics layers this SoftBody3D **is in**. Collision objects can exist in one or more of 32 different layers. See also [member collision_mask].  
         *      
         *  **Note:** Object A can detect a contact with object B only if object B is in any of the layers that object A scans. See [url=https://docs.godotengine.org/en/4.5/tutorials/physics/physics_introduction.html#collision-layers-and-masks]Collision layers and masks[/url] in the documentation for more information.  
         */
        get collision_layer(): int64
        set collision_layer(value: int64)
        
        /** The physics layers this SoftBody3D **scans**. Collision objects can scan one or more of 32 different layers. See also [member collision_layer].  
         *      
         *  **Note:** Object A can detect a contact with object B only if object B is in any of the layers that object A scans. See [url=https://docs.godotengine.org/en/4.5/tutorials/physics/physics_introduction.html#collision-layers-and-masks]Collision layers and masks[/url] in the documentation for more information.  
         */
        get collision_mask(): int64
        set collision_mask(value: int64)
        
        /** [NodePath] to a [CollisionObject3D] this SoftBody3D should avoid clipping. */
        get parent_collision_ignore(): NodePath
        set parent_collision_ignore(value: NodePath | string)
        
        /** Increasing this value will improve the resulting simulation, but can affect performance. Use with care. */
        get simulation_precision(): int64
        set simulation_precision(value: int64)
        
        /** The SoftBody3D's mass. */
        get total_mass(): float64
        set total_mass(value: float64)
        
        /** Higher values will result in a stiffer body, while lower values will increase the body's ability to bend. The value can be between `0.0` and `1.0` (inclusive). */
        get linear_stiffness(): float64
        set linear_stiffness(value: float64)
        
        /** Scales the rest lengths of [SoftBody3D]'s edge constraints. Positive values shrink the mesh, while negative values expand it. For example, a value of `0.1` shortens the edges of the mesh by 10%, while `-0.1` expands the edges by 10%.  
         *      
         *  **Note:** [member shrinking_factor] is best used on surface meshes with pinned points.  
         */
        get shrinking_factor(): float64
        set shrinking_factor(value: float64)
        
        /** The pressure coefficient of this soft body. Simulate pressure build-up from inside this body. Higher values increase the strength of this effect. */
        get pressure_coefficient(): float64
        set pressure_coefficient(value: float64)
        
        /** The body's damping coefficient. Higher values will slow down the body more noticeably when forces are applied. */
        get damping_coefficient(): float64
        set damping_coefficient(value: float64)
        
        /** The body's drag coefficient. Higher values increase this body's air resistance.  
         *      
         *  **Note:** This value is currently unused by Godot's default physics implementation.  
         */
        get drag_coefficient(): float64
        set drag_coefficient(value: float64)
        
        /** If `true`, the [SoftBody3D] will respond to [RayCast3D]s. */
        get ray_pickable(): boolean
        set ray_pickable(value: boolean)
        
        /** Defines the behavior in physics when [member Node.process_mode] is set to [constant Node.PROCESS_MODE_DISABLED]. */
        get disable_mode(): int64
        set disable_mode(value: int64)
        /** @deprecated Internal use. Does not exist at runtime. */
        __godotNameMap: __NameMapSoftBody3D;
    }
    /** @deprecated Internal use. Does not exist at runtime. */
    interface __NameMapSphereMesh extends __NameMapPrimitiveMesh {
    }
    /** Class representing a spherical [PrimitiveMesh].  
     *  	  
     *  @link https://docs.godotengine.org/en/4.5/classes/class_spheremesh.html  
     */
    class SphereMesh extends PrimitiveMesh {
        constructor(identifier?: any)
        /** Radius of sphere. */
        get radius(): float64
        set radius(value: float64)
        
        /** Full height of the sphere. */
        get height(): float64
        set height(value: float64)
        
        /** Number of radial segments on the sphere. */
        get radial_segments(): int64
        set radial_segments(value: int64)
        
        /** Number of segments along the height of the sphere. */
        get rings(): int64
        set rings(value: int64)
        
        /** If `true`, a hemisphere is created rather than a full sphere.  
         *      
         *  **Note:** To get a regular hemisphere, the height and radius of the sphere must be equal.  
         */
        get is_hemisphere(): boolean
        set is_hemisphere(value: boolean)
        /** @deprecated Internal use. Does not exist at runtime. */
        __godotNameMap: __NameMapSphereMesh;
    }
    /** @deprecated Internal use. Does not exist at runtime. */
    interface __NameMapSphereOccluder3D extends __NameMapOccluder3D {
    }
    /** Spherical shape for use with occlusion culling in [OccluderInstance3D].  
     *  	  
     *  @link https://docs.godotengine.org/en/4.5/classes/class_sphereoccluder3d.html  
     */
    class SphereOccluder3D extends Occluder3D {
        constructor(identifier?: any)
        /** The sphere's radius in 3D units. */
        get radius(): float64
        set radius(value: float64)
        /** @deprecated Internal use. Does not exist at runtime. */
        __godotNameMap: __NameMapSphereOccluder3D;
    }
    /** @deprecated Internal use. Does not exist at runtime. */
    interface __NameMapSphereShape3D extends __NameMapShape3D {
    }
    /** A 3D sphere shape used for physics collision.  
     *  	  
     *  @link https://docs.godotengine.org/en/4.5/classes/class_sphereshape3d.html  
     */
    class SphereShape3D extends Shape3D {
        constructor(identifier?: any)
        /** The sphere's radius. The shape's diameter is double the radius. */
        get radius(): float64
        set radius(value: float64)
        /** @deprecated Internal use. Does not exist at runtime. */
        __godotNameMap: __NameMapSphereShape3D;
    }
    /** @deprecated Internal use. Does not exist at runtime. */
    interface __NameMapSpinBox extends __NameMapRange {
    }
    /** An input field for numbers.  
     *  	  
     *  @link https://docs.godotengine.org/en/4.5/classes/class_spinbox.html  
     */
    class SpinBox<Map extends NodePathMap = any> extends Range<Map> {
        constructor(identifier?: any)
        /** Applies the current value of this [SpinBox]. This is equivalent to pressing [kbd]Enter[/kbd] while editing the [LineEdit] used by the [SpinBox]. This will cause [signal LineEdit.text_submitted] to be emitted and its currently contained expression to be evaluated. */
        apply(): void
        
        /** Returns the [LineEdit] instance from this [SpinBox]. You can use it to access properties and methods of [LineEdit].  
         *  **Warning:** This is a required internal node, removing and freeing it may cause a crash. If you wish to hide it or any of its children, use their [member CanvasItem.visible] property.  
         */
        get_line_edit(): null | LineEdit
        
        /** Changes the alignment of the underlying [LineEdit]. */
        get alignment(): int64
        set alignment(value: int64)
        
        /** If `true`, the [SpinBox] will be editable. Otherwise, it will be read only. */
        get editable(): boolean
        set editable(value: boolean)
        
        /** Sets the value of the [Range] for this [SpinBox] when the [LineEdit] text is  *changed*  instead of  *submitted* . See [signal LineEdit.text_changed] and [signal LineEdit.text_submitted].  
         *      
         *  **Note:** If set to `true`, this will interfere with entering mathematical expressions in the [SpinBox]. The [SpinBox] will try to evaluate the expression as you type, which means symbols like a trailing `+` are removed immediately by the expression being evaluated.  
         */
        get update_on_text_changed(): boolean
        set update_on_text_changed(value: boolean)
        
        /** Adds the specified prefix string before the numerical value of the [SpinBox]. */
        get prefix(): string
        set prefix(value: string)
        
        /** Adds the specified suffix string after the numerical value of the [SpinBox]. */
        get suffix(): string
        set suffix(value: string)
        
        /** If not `0`, sets the step when interacting with the arrow buttons of the [SpinBox].  
         *      
         *  **Note:** [member Range.value] will still be rounded to a multiple of [member Range.step].  
         */
        get custom_arrow_step(): float64
        set custom_arrow_step(value: float64)
        
        /** If `true`, the [SpinBox] will select the whole text when the [LineEdit] gains focus. Clicking the up and down arrows won't trigger this behavior. */
        get select_all_on_focus(): boolean
        set select_all_on_focus(value: boolean)
        /** @deprecated Internal use. Does not exist at runtime. */
        __godotNameMap: __NameMapSpinBox;
    }
    namespace SplitContainer {
        enum DraggerVisibility {
            /** The split dragger icon is always visible when [theme_item autohide] is `false`, otherwise visible only when the cursor hovers it.  
             *  The size of the grabber icon determines the minimum [theme_item separation].  
             *  The dragger icon is automatically hidden if the length of the grabber icon is longer than the split bar.  
             */
            DRAGGER_VISIBLE = 0,
            
            /** The split dragger icon is never visible regardless of the value of [theme_item autohide].  
             *  The size of the grabber icon determines the minimum [theme_item separation].  
             */
            DRAGGER_HIDDEN = 1,
            
            /** The split dragger icon is not visible, and the split bar is collapsed to zero thickness. */
            DRAGGER_HIDDEN_COLLAPSED = 2,
        }
    }
    /** @deprecated Internal use. Does not exist at runtime. */
    interface __NameMapSplitContainer extends __NameMapContainer {
    }
    /** A container that splits two child controls horizontally or vertically and provides a grabber for adjusting the split ratio.  
     *  	  
     *  @link https://docs.godotengine.org/en/4.5/classes/class_splitcontainer.html  
     */
    class SplitContainer<Map extends NodePathMap = any> extends Container<Map> {
        constructor(identifier?: any)
        /** Clamps the [member split_offset] value to not go outside the currently possible minimal and maximum values. */
        clamp_split_offset(): void
        
        /** Returns the drag area [Control]. For example, you can move a pre-configured button into the drag area [Control] so that it rides along with the split bar. Try setting the [Button] anchors to `center` prior to the `reparent()` call.  
         *    
         *      
         *  **Note:** The drag area [Control] is drawn over the [SplitContainer]'s children, so [CanvasItem] draw objects called from the [Control] and children added to the [Control] will also appear over the [SplitContainer]'s children. Try setting [member Control.mouse_filter] of custom children to [constant Control.MOUSE_FILTER_IGNORE] to prevent blocking the mouse from dragging if desired.  
         *  **Warning:** This is a required internal node, removing and freeing it may cause a crash.  
         */
        get_drag_area_control(): null | Control
        
        /** The initial offset of the splitting between the two [Control]s, with `0` being at the end of the first [Control]. */
        get split_offset(): int64
        set split_offset(value: int64)
        
        /** If `true`, the dragger will be disabled and the children will be sized as if the [member split_offset] was `0`. */
        get collapsed(): boolean
        set collapsed(value: boolean)
        
        /** Enables or disables split dragging. */
        get dragging_enabled(): boolean
        set dragging_enabled(value: boolean)
        
        /** Determines the dragger's visibility. This property does not determine whether dragging is enabled or not. Use [member dragging_enabled] for that. */
        get dragger_visibility(): int64
        set dragger_visibility(value: int64)
        
        /** If `true`, the [SplitContainer] will arrange its children vertically, rather than horizontally.  
         *  Can't be changed when using [HSplitContainer] and [VSplitContainer].  
         */
        get vertical(): boolean
        set vertical(value: boolean)
        
        /** If `true`, a touch-friendly drag handle will be enabled for better usability on smaller screens. Unlike the standard grabber, this drag handle overlaps the [SplitContainer]'s children and does not affect their minimum separation. The standard grabber will no longer be drawn when this option is enabled. */
        get touch_dragger_enabled(): boolean
        set touch_dragger_enabled(value: boolean)
        
        /** Reduces the size of the drag area and split bar [theme_item split_bar_background] at the beginning of the container. */
        get drag_area_margin_begin(): int64
        set drag_area_margin_begin(value: int64)
        
        /** Reduces the size of the drag area and split bar [theme_item split_bar_background] at the end of the container. */
        get drag_area_margin_end(): int64
        set drag_area_margin_end(value: int64)
        
        /** Shifts the drag area in the axis of the container to prevent the drag area from overlapping the [ScrollBar] or other selectable [Control] of a child node. */
        get drag_area_offset(): int64
        set drag_area_offset(value: int64)
        
        /** Highlights the drag area [Rect2] so you can see where it is during development. The drag area is gold if [member dragging_enabled] is `true`, and red if `false`. */
        get drag_area_highlight_in_editor(): boolean
        set drag_area_highlight_in_editor(value: boolean)
        
        /** Emitted when the dragger is dragged by user. */
        readonly dragged: Signal<(offset: int64) => void>
        
        /** Emitted when the user starts dragging. */
        readonly drag_started: Signal<() => void>
        
        /** Emitted when the user ends dragging. */
        readonly drag_ended: Signal<() => void>
        /** @deprecated Internal use. Does not exist at runtime. */
        __godotNameMap: __NameMapSplitContainer;
    }
    /** @deprecated Internal use. Does not exist at runtime. */
    interface __NameMapSpotLight3D extends __NameMapLight3D {
    }
    /** A spotlight, such as a reflector spotlight or a lantern.  
     *  	  
     *  @link https://docs.godotengine.org/en/4.5/classes/class_spotlight3d.html  
     */
    class SpotLight3D<Map extends NodePathMap = any> extends Light3D<Map> {
        constructor(identifier?: any)
        /** The maximal range that can be reached by the spotlight. Note that the effectively lit area may appear to be smaller depending on the [member spot_attenuation] in use. No matter the [member spot_attenuation] in use, the light will never reach anything outside this range.  
         *      
         *  **Note:** [member spot_range] is not affected by [member Node3D.scale] (the light's scale or its parent's scale).  
         */
        get spot_range(): float64
        set spot_range(value: float64)
        
        /** Controls the distance attenuation function for spotlights.  
         *  A value of `0.0` will maintain a constant brightness through most of the range, but smoothly attenuate the light at the edge of the range. Use a value of `2.0` for physically accurate lights as it results in the proper inverse square attenutation.  
         *      
         *  **Note:** Setting attenuation to `2.0` or higher may result in distant objects receiving minimal light, even within range. For example, with a range of `4096`, an object at `100` units is attenuated by a factor of `0.0001`. With a default brightness of `1`, the light would not be visible at that distance.  
         *      
         *  **Note:** Using negative or values higher than `10.0` may lead to unexpected results.  
         */
        get spot_attenuation(): float64
        set spot_attenuation(value: float64)
        
        /** The spotlight's angle in degrees. This is the angular radius, meaning the angle from the -Z axis, the cone's center, to the edge of the cone. The default angular radius of 45 degrees corresponds to a cone with an angular diameter of 90 degrees.  
         *      
         *  **Note:** [member spot_angle] is not affected by [member Node3D.scale] (the light's scale or its parent's scale).  
         */
        get spot_angle(): float64
        set spot_angle(value: float64)
        
        /** The spotlight's  *angular*  attenuation curve. See also [member spot_attenuation]. */
        get spot_angle_attenuation(): float64
        set spot_angle_attenuation(value: float64)
        /** @deprecated Internal use. Does not exist at runtime. */
        __godotNameMap: __NameMapSpotLight3D;
    }
    /** @deprecated Internal use. Does not exist at runtime. */
    interface __NameMapSpringArm3D extends __NameMapNode3D {
    }
    /** A 3D raycast that dynamically moves its children near the collision point.  
     *  	  
     *  @link https://docs.godotengine.org/en/4.5/classes/class_springarm3d.html  
     */
    class SpringArm3D<Map extends NodePathMap = any> extends Node3D<Map> {
        constructor(identifier?: any)
        /** Returns the spring arm's current length. */
        get_hit_length(): float64
        
        /** Adds the [PhysicsBody3D] object with the given [RID] to the list of [PhysicsBody3D] objects excluded from the collision check. */
        add_excluded_object(RID: RID): void
        
        /** Removes the given [RID] from the list of [PhysicsBody3D] objects excluded from the collision check. */
        remove_excluded_object(RID: RID): boolean
        
        /** Clears the list of [PhysicsBody3D] objects excluded from the collision check. */
        clear_excluded_objects(): void
        
        /** The layers against which the collision check shall be done. See [url=https://docs.godotengine.org/en/4.5/tutorials/physics/physics_introduction.html#collision-layers-and-masks]Collision layers and masks[/url] in the documentation for more information. */
        get collision_mask(): int64
        set collision_mask(value: int64)
        
        /** The [Shape3D] to use for the SpringArm3D.  
         *  When the shape is set, the SpringArm3D will cast the [Shape3D] on its z axis instead of performing a ray cast.  
         */
        get shape(): null | Shape3D
        set shape(value: null | Shape3D)
        
        /** The maximum extent of the SpringArm3D. This is used as a length for both the ray and the shape cast used internally to calculate the desired position of the SpringArm3D's child nodes.  
         *  To know more about how to perform a shape cast or a ray cast, please consult the [PhysicsDirectSpaceState3D] documentation.  
         */
        get spring_length(): float64
        set spring_length(value: float64)
        
        /** When the collision check is made, a candidate length for the SpringArm3D is given.  
         *  The margin is then subtracted to this length and the translation is applied to the child objects of the SpringArm3D.  
         *  This margin is useful for when the SpringArm3D has a [Camera3D] as a child node: without the margin, the [Camera3D] would be placed on the exact point of collision, while with the margin the [Camera3D] would be placed close to the point of collision.  
         */
        get margin(): float64
        set margin(value: float64)
        /** @deprecated Internal use. Does not exist at runtime. */
        __godotNameMap: __NameMapSpringArm3D;
    }
    /** @deprecated Internal use. Does not exist at runtime. */
    interface __NameMapSpringBoneCollision3D extends __NameMapNode3D {
    }
    /** A base class of the collision that interacts with [SpringBoneSimulator3D].  
     *  	  
     *  @link https://docs.godotengine.org/en/4.5/classes/class_springbonecollision3d.html  
     */
    class SpringBoneCollision3D<Map extends NodePathMap = any> extends Node3D<Map> {
        constructor(identifier?: any)
        /** Get parent [Skeleton3D] node of the parent [SpringBoneSimulator3D] if found. */
        get_skeleton(): null | Skeleton3D
        
        /** The name of the attached bone. */
        get bone_name(): StringName
        set bone_name(value: StringName)
        
        /** The index of the attached bone. */
        get bone(): int64
        set bone(value: int64)
        
        /** The offset of the position from [Skeleton3D]'s [member bone] pose position. */
        get position_offset(): Vector3
        set position_offset(value: Vector3)
        
        /** The offset of the rotation from [Skeleton3D]'s [member bone] pose rotation. */
        get rotation_offset(): Quaternion
        set rotation_offset(value: Quaternion)
        /** @deprecated Internal use. Does not exist at runtime. */
        __godotNameMap: __NameMapSpringBoneCollision3D;
    }
    /** @deprecated Internal use. Does not exist at runtime. */
    interface __NameMapSpringBoneCollisionCapsule3D extends __NameMapSpringBoneCollision3D {
    }
    /** A capsule shape collision that interacts with [SpringBoneSimulator3D].  
     *  	  
     *  @link https://docs.godotengine.org/en/4.5/classes/class_springbonecollisioncapsule3d.html  
     */
    class SpringBoneCollisionCapsule3D<Map extends NodePathMap = any> extends SpringBoneCollision3D<Map> {
        constructor(identifier?: any)
        /** The capsule's radius.  
         *      
         *  **Note:** The [member radius] of a capsule cannot be greater than half of its [member height]. Otherwise, the capsule becomes a sphere. If the [member radius] is greater than half of the [member height], the properties adjust to a valid value.  
         */
        get radius(): float64
        set radius(value: float64)
        
        /** The capsule's full height, including the hemispheres.  
         *      
         *  **Note:** The [member height] of a capsule must be at least twice its [member radius]. Otherwise, the capsule becomes a sphere. If the [member height] is less than twice the [member radius], the properties adjust to a valid value.  
         */
        get height(): float64
        set height(value: float64)
        
        /** The capsule's height, excluding the hemispheres. This is the height of the central cylindrical part in the middle of the capsule, and is the distance between the centers of the two hemispheres. This is a wrapper for [member height]. */
        get mid_height(): float64
        set mid_height(value: float64)
        
        /** If `true`, the collision acts to trap the joint within the collision. */
        get inside(): boolean
        set inside(value: boolean)
        /** @deprecated Internal use. Does not exist at runtime. */
        __godotNameMap: __NameMapSpringBoneCollisionCapsule3D;
    }
    /** @deprecated Internal use. Does not exist at runtime. */
    interface __NameMapSpringBoneCollisionPlane3D extends __NameMapSpringBoneCollision3D {
    }
    /** An infinite plane collision that interacts with [SpringBoneSimulator3D].  
     *  	  
     *  @link https://docs.godotengine.org/en/4.5/classes/class_springbonecollisionplane3d.html  
     */
    class SpringBoneCollisionPlane3D<Map extends NodePathMap = any> extends SpringBoneCollision3D<Map> {
        constructor(identifier?: any)
        /** @deprecated Internal use. Does not exist at runtime. */
        __godotNameMap: __NameMapSpringBoneCollisionPlane3D;
    }
    /** @deprecated Internal use. Does not exist at runtime. */
    interface __NameMapSpringBoneCollisionSphere3D extends __NameMapSpringBoneCollision3D {
    }
    /** A sphere shape collision that interacts with [SpringBoneSimulator3D].  
     *  	  
     *  @link https://docs.godotengine.org/en/4.5/classes/class_springbonecollisionsphere3d.html  
     */
    class SpringBoneCollisionSphere3D<Map extends NodePathMap = any> extends SpringBoneCollision3D<Map> {
        constructor(identifier?: any)
        /** The sphere's radius. */
        get radius(): float64
        set radius(value: float64)
        
        /** If `true`, the collision acts to trap the joint within the collision. */
        get inside(): boolean
        set inside(value: boolean)
        /** @deprecated Internal use. Does not exist at runtime. */
        __godotNameMap: __NameMapSpringBoneCollisionSphere3D;
    }
    namespace SpringBoneSimulator3D {
        enum BoneDirection {
            /** Enumerated value for the +X axis. */
            BONE_DIRECTION_PLUS_X = 0,
            
            /** Enumerated value for the -X axis. */
            BONE_DIRECTION_MINUS_X = 1,
            
            /** Enumerated value for the +Y axis. */
            BONE_DIRECTION_PLUS_Y = 2,
            
            /** Enumerated value for the -Y axis. */
            BONE_DIRECTION_MINUS_Y = 3,
            
            /** Enumerated value for the +Z axis. */
            BONE_DIRECTION_PLUS_Z = 4,
            
            /** Enumerated value for the -Z axis. */
            BONE_DIRECTION_MINUS_Z = 5,
            
            /** Enumerated value for the axis from a parent bone to the child bone. */
            BONE_DIRECTION_FROM_PARENT = 6,
        }
        enum CenterFrom {
            /** The world origin is defined as center. */
            CENTER_FROM_WORLD_ORIGIN = 0,
            
            /** The [Node3D] specified by [method set_center_node] is defined as center.  
             *  If [Node3D] is not found, the parent [Skeleton3D] is treated as center.  
             */
            CENTER_FROM_NODE = 1,
            
            /** The bone pose origin of the parent [Skeleton3D] specified by [method set_center_bone] is defined as center.  
             *  If [Node3D] is not found, the parent [Skeleton3D] is treated as center.  
             */
            CENTER_FROM_BONE = 2,
        }
        enum RotationAxis {
            /** Enumerated value for the rotation of the X axis. */
            ROTATION_AXIS_X = 0,
            
            /** Enumerated value for the rotation of the Y axis. */
            ROTATION_AXIS_Y = 1,
            
            /** Enumerated value for the rotation of the Z axis. */
            ROTATION_AXIS_Z = 2,
            
            /** Enumerated value for the unconstrained rotation. */
            ROTATION_AXIS_ALL = 3,
            
            /** Enumerated value for an optional rotation axis. See also [method set_joint_rotation_axis_vector]. */
            ROTATION_AXIS_CUSTOM = 4,
        }
    }
    /** @deprecated Internal use. Does not exist at runtime. */
    interface __NameMapSpringBoneSimulator3D extends __NameMapSkeletonModifier3D {
    }
    /** A [SkeletonModifier3D] to apply inertial wavering to bone chains.  
     *  	  
     *  @link https://docs.godotengine.org/en/4.5/classes/class_springbonesimulator3d.html  
     */
    class SpringBoneSimulator3D<Map extends NodePathMap = any> extends SkeletonModifier3D<Map> {
        constructor(identifier?: any)
        /** Sets the root bone name of the bone chain. */
        set_root_bone_name(index: int64, bone_name: string): void
        
        /** Returns the root bone name of the bone chain. */
        get_root_bone_name(index: int64): string
        
        /** Sets the root bone index of the bone chain. */
        set_root_bone(index: int64, bone: int64): void
        
        /** Returns the root bone index of the bone chain. */
        get_root_bone(index: int64): int64
        
        /** Sets the end bone name of the bone chain.  
         *      
         *  **Note:** End bone must be the root bone or a child of the root bone. If they are the same, the tail must be extended by [method set_extend_end_bone] to jiggle the bone.  
         */
        set_end_bone_name(index: int64, bone_name: string): void
        
        /** Returns the end bone name of the bone chain. */
        get_end_bone_name(index: int64): string
        
        /** Sets the end bone index of the bone chain. */
        set_end_bone(index: int64, bone: int64): void
        
        /** Returns the end bone index of the bone chain. */
        get_end_bone(index: int64): int64
        
        /** If [param enabled] is `true`, the end bone is extended to have the tail.  
         *  The extended tail config is allocated to the last element in the joint list.  
         *  In other words, if you set [param enabled] is `false`, the config of last element in the joint list has no effect in the simulated result.  
         */
        set_extend_end_bone(index: int64, enabled: boolean): void
        
        /** Returns `true` if the end bone is extended to have the tail. */
        is_end_bone_extended(index: int64): boolean
        
        /** Sets the end bone tail direction of the bone chain when [method is_end_bone_extended] is `true`. */
        set_end_bone_direction(index: int64, bone_direction: SpringBoneSimulator3D.BoneDirection): void
        
        /** Returns the end bone's tail direction of the bone chain when [method is_end_bone_extended] is `true`. */
        get_end_bone_direction(index: int64): SpringBoneSimulator3D.BoneDirection
        
        /** Sets the end bone tail length of the bone chain when [method is_end_bone_extended] is `true`. */
        set_end_bone_length(index: int64, length: float64): void
        
        /** Returns the end bone's tail length of the bone chain when [method is_end_bone_extended] is `true`. */
        get_end_bone_length(index: int64): float64
        
        /** Sets what the center originates from in the bone chain.  
         *  Bone movement is calculated based on the difference in relative distance between center and bone in the previous and next frames.  
         *  For example, if the parent [Skeleton3D] is used as the center, the bones are considered to have not moved if the [Skeleton3D] moves in the world.  
         *  In this case, only a change in the bone pose is considered to be a bone movement.  
         */
        set_center_from(index: int64, center_from: SpringBoneSimulator3D.CenterFrom): void
        
        /** Returns what the center originates from in the bone chain. */
        get_center_from(index: int64): SpringBoneSimulator3D.CenterFrom
        
        /** Sets the center node path of the bone chain. */
        set_center_node(index: int64, node_path: NodePath | string): void
        
        /** Returns the center node path of the bone chain. */
        get_center_node(index: int64): NodePath
        
        /** Sets the center bone name of the bone chain. */
        set_center_bone_name(index: int64, bone_name: string): void
        
        /** Returns the center bone name of the bone chain. */
        get_center_bone_name(index: int64): string
        
        /** Sets the center bone index of the bone chain. */
        set_center_bone(index: int64, bone: int64): void
        
        /** Returns the center bone index of the bone chain. */
        get_center_bone(index: int64): int64
        
        /** Sets the joint radius of the bone chain. It is used to move and slide with the [SpringBoneCollision3D] in the collision list.  
         *  The value is scaled by [method set_radius_damping_curve] and cached in each joint setting in the joint list.  
         */
        set_radius(index: int64, radius: float64): void
        
        /** Returns the joint radius of the bone chain. */
        get_radius(index: int64): float64
        
        /** Sets the rotation axis of the bone chain. If set to a specific axis, it acts like a hinge joint. The value is cached in each joint setting in the joint list.  
         *  The axes are based on the [method Skeleton3D.get_bone_rest]'s space, if [param axis] is [constant ROTATION_AXIS_CUSTOM], you can specify any axis.  
         *      
         *  **Note:** The rotation axis vector and the forward vector shouldn't be colinear to avoid unintended rotation since [SpringBoneSimulator3D] does not factor in twisting forces.  
         */
        set_rotation_axis(index: int64, axis: SpringBoneSimulator3D.RotationAxis): void
        
        /** Returns the rotation axis of the bone chain. */
        get_rotation_axis(index: int64): SpringBoneSimulator3D.RotationAxis
        
        /** Sets the rotation axis vector of the bone chain. The value is cached in each joint setting in the joint list.  
         *  This vector is normalized by an internal process and represents the axis around which the bone chain can rotate.  
         *  If the vector length is `0`, it is considered synonymous with [constant ROTATION_AXIS_ALL].  
         */
        set_rotation_axis_vector(index: int64, vector: Vector3): void
        
        /** Returns the rotation axis vector of the bone chain. This vector represents the axis around which the bone chain can rotate. It is determined based on the rotation axis set for the bone chain.  
         *  If [method get_rotation_axis] is [constant ROTATION_AXIS_ALL], this method returns `Vector3(0, 0, 0)`.  
         */
        get_rotation_axis_vector(index: int64): Vector3
        
        /** Sets the joint radius damping curve of the bone chain. */
        set_radius_damping_curve(index: int64, curve: Curve): void
        
        /** Returns the joint radius damping curve of the bone chain. */
        get_radius_damping_curve(index: int64): null | Curve
        
        /** Sets the stiffness force of the bone chain. The greater the value, the faster it recovers to its initial pose.  
         *  If [param stiffness] is `0`, the modified pose will not return to the original pose.  
         *  The value is scaled by [method set_stiffness_damping_curve] and cached in each joint setting in the joint list.  
         */
        set_stiffness(index: int64, stiffness: float64): void
        
        /** Returns the stiffness force of the bone chain. */
        get_stiffness(index: int64): float64
        
        /** Sets the stiffness force damping curve of the bone chain. */
        set_stiffness_damping_curve(index: int64, curve: Curve): void
        
        /** Returns the stiffness force damping curve of the bone chain. */
        get_stiffness_damping_curve(index: int64): null | Curve
        
        /** Sets the drag force of the bone chain. The greater the value, the more suppressed the wiggling.  
         *  The value is scaled by [method set_drag_damping_curve] and cached in each joint setting in the joint list.  
         */
        set_drag(index: int64, drag: float64): void
        
        /** Returns the drag force damping curve of the bone chain. */
        get_drag(index: int64): float64
        
        /** Sets the drag force damping curve of the bone chain. */
        set_drag_damping_curve(index: int64, curve: Curve): void
        
        /** Returns the drag force damping curve of the bone chain. */
        get_drag_damping_curve(index: int64): null | Curve
        
        /** Sets the gravity amount of the bone chain. This value is not an acceleration, but a constant velocity of movement in [method set_gravity_direction].  
         *  If [param gravity] is not `0`, the modified pose will not return to the original pose since it is always affected by gravity.  
         *  The value is scaled by [method set_gravity_damping_curve] and cached in each joint setting in the joint list.  
         */
        set_gravity(index: int64, gravity: float64): void
        
        /** Returns the gravity amount of the bone chain. */
        get_gravity(index: int64): float64
        
        /** Sets the gravity amount damping curve of the bone chain. */
        set_gravity_damping_curve(index: int64, curve: Curve): void
        
        /** Returns the gravity amount damping curve of the bone chain. */
        get_gravity_damping_curve(index: int64): null | Curve
        
        /** Sets the gravity direction of the bone chain. This value is internally normalized and then multiplied by [method set_gravity].  
         *  The value is cached in each joint setting in the joint list.  
         */
        set_gravity_direction(index: int64, gravity_direction: Vector3): void
        
        /** Returns the gravity direction of the bone chain. */
        get_gravity_direction(index: int64): Vector3
        
        /** Clears all settings. */
        clear_settings(): void
        
        /** If [param enabled] is `true`, the config can be edited individually for each joint. */
        set_individual_config(index: int64, enabled: boolean): void
        
        /** Returns `true` if the config can be edited individually for each joint. */
        is_config_individual(index: int64): boolean
        
        /** Returns the bone name at [param joint] in the bone chain's joint list. */
        get_joint_bone_name(index: int64, joint: int64): string
        
        /** Returns the bone index at [param joint] in the bone chain's joint list. */
        get_joint_bone(index: int64, joint: int64): int64
        
        /** Sets the rotation axis at [param joint] in the bone chain's joint list when [method is_config_individual] is `true`.  
         *  The axes are based on the [method Skeleton3D.get_bone_rest]'s space, if [param axis] is [constant ROTATION_AXIS_CUSTOM], you can specify any axis.  
         *      
         *  **Note:** The rotation axis and the forward vector shouldn't be colinear to avoid unintended rotation since [SpringBoneSimulator3D] does not factor in twisting forces.  
         */
        set_joint_rotation_axis(index: int64, joint: int64, axis: SpringBoneSimulator3D.RotationAxis): void
        
        /** Returns the rotation axis at [param joint] in the bone chain's joint list. */
        get_joint_rotation_axis(index: int64, joint: int64): SpringBoneSimulator3D.RotationAxis
        
        /** Sets the rotation axis vector for the specified joint in the bone chain.  
         *  This vector is normalized by an internal process and represents the axis around which the bone chain can rotate.  
         *  If the vector length is `0`, it is considered synonymous with [constant ROTATION_AXIS_ALL].  
         */
        set_joint_rotation_axis_vector(index: int64, joint: int64, vector: Vector3): void
        
        /** Returns the rotation axis vector for the specified joint in the bone chain. This vector represents the axis around which the joint can rotate. It is determined based on the rotation axis set for the joint.  
         *  If [method get_joint_rotation_axis] is [constant ROTATION_AXIS_ALL], this method returns `Vector3(0, 0, 0)`.  
         */
        get_joint_rotation_axis_vector(index: int64, joint: int64): Vector3
        
        /** Sets the joint radius at [param joint] in the bone chain's joint list when [method is_config_individual] is `true`. */
        set_joint_radius(index: int64, joint: int64, radius: float64): void
        
        /** Returns the radius at [param joint] in the bone chain's joint list. */
        get_joint_radius(index: int64, joint: int64): float64
        
        /** Sets the stiffness force at [param joint] in the bone chain's joint list when [method is_config_individual] is `true`. */
        set_joint_stiffness(index: int64, joint: int64, stiffness: float64): void
        
        /** Returns the stiffness force at [param joint] in the bone chain's joint list. */
        get_joint_stiffness(index: int64, joint: int64): float64
        
        /** Sets the drag force at [param joint] in the bone chain's joint list when [method is_config_individual] is `true`. */
        set_joint_drag(index: int64, joint: int64, drag: float64): void
        
        /** Returns the drag force at [param joint] in the bone chain's joint list. */
        get_joint_drag(index: int64, joint: int64): float64
        
        /** Sets the gravity amount at [param joint] in the bone chain's joint list when [method is_config_individual] is `true`. */
        set_joint_gravity(index: int64, joint: int64, gravity: float64): void
        
        /** Returns the gravity amount at [param joint] in the bone chain's joint list. */
        get_joint_gravity(index: int64, joint: int64): float64
        
        /** Sets the gravity direction at [param joint] in the bone chain's joint list when [method is_config_individual] is `true`. */
        set_joint_gravity_direction(index: int64, joint: int64, gravity_direction: Vector3): void
        
        /** Returns the gravity direction at [param joint] in the bone chain's joint list. */
        get_joint_gravity_direction(index: int64, joint: int64): Vector3
        
        /** Returns the joint count of the bone chain's joint list. */
        get_joint_count(index: int64): int64
        
        /** If [param enabled] is `true`, all child [SpringBoneCollision3D]s are colliding and [method set_exclude_collision_path] is enabled as an exclusion list at [param index] in the settings.  
         *  If [param enabled] is `false`, you need to manually register all valid collisions with [method set_collision_path].  
         */
        set_enable_all_child_collisions(index: int64, enabled: boolean): void
        
        /** Returns `true` if all child [SpringBoneCollision3D]s are contained in the collision list at [param index] in the settings. */
        are_all_child_collisions_enabled(index: int64): boolean
        
        /** Sets the node path of the [SpringBoneCollision3D] at [param collision] in the bone chain's exclude collision list when [method are_all_child_collisions_enabled] is `true`. */
        set_exclude_collision_path(index: int64, collision: int64, node_path: NodePath | string): void
        
        /** Returns the node path of the [SpringBoneCollision3D] at [param collision] in the bone chain's exclude collision list when [method are_all_child_collisions_enabled] is `true`. */
        get_exclude_collision_path(index: int64, collision: int64): NodePath
        
        /** Sets the number of exclude collisions in the exclude collision list at [param index] in the settings when [method are_all_child_collisions_enabled] is `true`. */
        set_exclude_collision_count(index: int64, count: int64): void
        
        /** Returns the exclude collision count of the bone chain's exclude collision list when [method are_all_child_collisions_enabled] is `true`. */
        get_exclude_collision_count(index: int64): int64
        
        /** Clears all exclude collisions from the collision list at [param index] in the settings when [method are_all_child_collisions_enabled] is `true`. */
        clear_exclude_collisions(index: int64): void
        
        /** Sets the node path of the [SpringBoneCollision3D] at [param collision] in the bone chain's collision list when [method are_all_child_collisions_enabled] is `false`. */
        set_collision_path(index: int64, collision: int64, node_path: NodePath | string): void
        
        /** Returns the node path of the [SpringBoneCollision3D] at [param collision] in the bone chain's collision list when [method are_all_child_collisions_enabled] is `false`. */
        get_collision_path(index: int64, collision: int64): NodePath
        
        /** Sets the number of collisions in the collision list at [param index] in the settings when [method are_all_child_collisions_enabled] is `false`. */
        set_collision_count(index: int64, count: int64): void
        
        /** Returns the collision count of the bone chain's collision list when [method are_all_child_collisions_enabled] is `false`. */
        get_collision_count(index: int64): int64
        
        /** Clears all collisions from the collision list at [param index] in the settings when [method are_all_child_collisions_enabled] is `false`. */
        clear_collisions(index: int64): void
        
        /** Resets a simulating state with respect to the current bone pose.  
         *  It is useful to prevent the simulation result getting violent. For example, calling this immediately after a call to [method AnimationPlayer.play] without a fading, or within the previous [signal SkeletonModifier3D.modification_processed] signal if it's condition changes significantly.  
         */
        reset(): void
        
        /** The constant force that always affected bones. It is equal to the result when the parent [Skeleton3D] moves at this speed in the opposite direction.  
         *  This is useful for effects such as wind and anti-gravity.  
         */
        get external_force(): Vector3
        set external_force(value: Vector3)
        
        /** The number of settings. */
        get setting_count(): int64
        set setting_count(value: int64)
        /** @deprecated Internal use. Does not exist at runtime. */
        __godotNameMap: __NameMapSpringBoneSimulator3D;
    }
}
