// AUTO-GENERATED
declare module "godot" {
    /** @deprecated Internal use. Does not exist at runtime. */
    interface __NameMapAudioStreamMP3 extends __NameMapAudioStream {
    }
    /** MP3 audio stream driver.  
     *  	  
     *  @link https://docs.godotengine.org/en/4.5/classes/class_audiostreammp3.html  
     */
    class AudioStreamMP3 extends AudioStream {
        constructor(identifier?: any)
        /** Creates a new [AudioStreamMP3] instance from the given buffer. The buffer must contain MP3 data. */
        static load_from_buffer(stream_data: PackedByteArray | byte[] | ArrayBuffer): null | AudioStreamMP3
        
        /** Creates a new [AudioStreamMP3] instance from the given file path. The file must be in MP3 format. */
        static load_from_file(path: string): null | AudioStreamMP3
        
        /** Contains the audio data in bytes.  
         *  You can load a file without having to import it beforehand using the code snippet below. Keep in mind that this snippet loads the whole file into memory and may not be ideal for huge files (hundreds of megabytes or more).  
         *    
         */
        get data(): PackedByteArray
        set data(value: PackedByteArray | byte[] | ArrayBuffer)
        get bpm(): float64
        set bpm(value: float64)
        get beat_count(): int64
        set beat_count(value: int64)
        get bar_beats(): int64
        set bar_beats(value: int64)
        
        /** If `true`, the stream will automatically loop when it reaches the end. */
        get loop(): boolean
        set loop(value: boolean)
        
        /** Time in seconds at which the stream starts after being looped. */
        get loop_offset(): float64
        set loop_offset(value: float64)
        /** @deprecated Internal use. Does not exist at runtime. */
        __godotNameMap: __NameMapAudioStreamMP3;
    }
    /** @deprecated Internal use. Does not exist at runtime. */
    interface __NameMapAudioStreamMicrophone extends __NameMapAudioStream {
    }
    /** Plays real-time audio input data.  
     *  	  
     *  @link https://docs.godotengine.org/en/4.5/classes/class_audiostreammicrophone.html  
     */
    class AudioStreamMicrophone extends AudioStream {
        constructor(identifier?: any)
        /** @deprecated Internal use. Does not exist at runtime. */
        __godotNameMap: __NameMapAudioStreamMicrophone;
    }
    /** @deprecated Internal use. Does not exist at runtime. */
    interface __NameMapAudioStreamOggVorbis extends __NameMapAudioStream {
    }
    /** A class representing an Ogg Vorbis audio stream.  
     *  	  
     *  @link https://docs.godotengine.org/en/4.5/classes/class_audiostreamoggvorbis.html  
     */
    class AudioStreamOggVorbis extends AudioStream {
        constructor(identifier?: any)
        /** Creates a new [AudioStreamOggVorbis] instance from the given buffer. The buffer must contain Ogg Vorbis data. */
        static load_from_buffer(stream_data: PackedByteArray | byte[] | ArrayBuffer): null | AudioStreamOggVorbis
        
        /** Creates a new [AudioStreamOggVorbis] instance from the given file path. The file must be in Ogg Vorbis format. */
        static load_from_file(path: string): null | AudioStreamOggVorbis
        
        /** Contains the raw Ogg data for this stream. */
        get packet_sequence(): null | Object
        set packet_sequence(value: null | Object)
        get bpm(): float64
        set bpm(value: float64)
        get beat_count(): int64
        set beat_count(value: int64)
        get bar_beats(): int64
        set bar_beats(value: int64)
        
        /** Contains user-defined tags if found in the Ogg Vorbis data.  
         *  Commonly used tags include `title`, `artist`, `album`, `tracknumber`, and `date` (`date` does not have a standard date format).  
         *      
         *  **Note:** No tag is  *guaranteed*  to be present in every file, so make sure to account for the keys not always existing.  
         */
        get tags(): GDictionary
        set tags(value: GDictionary)
        
        /** If `true`, the audio will play again from the specified [member loop_offset] once it is done playing. Useful for ambient sounds and background music. */
        get loop(): boolean
        set loop(value: boolean)
        
        /** Time in seconds at which the stream starts after being looped. */
        get loop_offset(): float64
        set loop_offset(value: float64)
        /** @deprecated Internal use. Does not exist at runtime. */
        __godotNameMap: __NameMapAudioStreamOggVorbis;
    }
    /** @deprecated Internal use. Does not exist at runtime. */
    interface __NameMapAudioStreamPlayback extends __NameMapRefCounted {
    }
    /** Meta class for playing back audio.  
     *  	  
     *  @link https://docs.godotengine.org/en/4.5/classes/class_audiostreamplayback.html  
     */
    class AudioStreamPlayback extends RefCounted {
        constructor(identifier?: any)
        /** Override this method to customize what happens when the playback starts at the given position, such as by calling [method AudioStreamPlayer.play]. */
        /* gdvirtual */ _start(from_pos: float64): void
        
        /** Override this method to customize what happens when the playback is stopped, such as by calling [method AudioStreamPlayer.stop]. */
        /* gdvirtual */ _stop(): void
        
        /** Overridable method. Should return `true` if this playback is active and playing its audio stream. */
        /* gdvirtual */ _is_playing(): boolean
        
        /** Overridable method. Should return how many times this audio stream has looped. Most built-in playbacks always return `0`. */
        /* gdvirtual */ _get_loop_count(): int64
        
        /** Overridable method. Should return the current progress along the audio stream, in seconds. */
        /* gdvirtual */ _get_playback_position(): float64
        
        /** Override this method to customize what happens when seeking this audio stream at the given [param position], such as by calling [method AudioStreamPlayer.seek]. */
        /* gdvirtual */ _seek(position: float64): void
        
        /** Override this method to customize how the audio stream is mixed. This method is called even if the playback is not active.  
         *      
         *  **Note:** It is not useful to override this method in GDScript or C#. Only GDExtension can take advantage of it.  
         */
        /* gdvirtual */ _mix(buffer: int64, rate_scale: float64, frames: int64): int64
        
        /** Overridable method. Called whenever the audio stream is mixed if the playback is active and [method AudioServer.set_enable_tagging_used_audio_streams] has been set to `true`. Editor plugins may use this method to "tag" the current position along the audio stream and display it in a preview. */
        /* gdvirtual */ _tag_used_streams(): void
        
        /** Set the current value of a playback parameter by name (see [method AudioStream._get_parameter_list]). */
        /* gdvirtual */ _set_parameter(name: StringName, value: any): void
        
        /** Return the current value of a playback parameter by name (see [method AudioStream._get_parameter_list]). */
        /* gdvirtual */ _get_parameter(name: StringName): any
        
        /** Associates [AudioSamplePlayback] to this [AudioStreamPlayback] for playing back the audio sample of this stream. */
        set_sample_playback(playback_sample: AudioSamplePlayback): void
        
        /** Returns the [AudioSamplePlayback] associated with this [AudioStreamPlayback] for playing back the audio sample of this stream. */
        get_sample_playback(): null | AudioSamplePlayback
        
        /** Mixes up to [param frames] of audio from the stream from the current position, at a rate of [param rate_scale], advancing the stream.  
         *  Returns a [PackedVector2Array] where each element holds the left and right channel volume levels of each frame.  
         *      
         *  **Note:** Can return fewer frames than requested, make sure to use the size of the return value.  
         */
        mix_audio(rate_scale: float64, frames: int64): PackedVector2Array
        
        /** Starts the stream from the given [param from_pos], in seconds. */
        start(from_pos?: float64 /* = 0 */): void
        
        /** Seeks the stream at the given [param time], in seconds. */
        seek(time?: float64 /* = 0 */): void
        
        /** Stops the stream. */
        stop(): void
        
        /** Returns the number of times the stream has looped. */
        get_loop_count(): int64
        
        /** Returns the current position in the stream, in seconds. */
        get_playback_position(): float64
        
        /** Returns `true` if the stream is playing. */
        is_playing(): boolean
        /** @deprecated Internal use. Does not exist at runtime. */
        __godotNameMap: __NameMapAudioStreamPlayback;
    }
    /** @deprecated Internal use. Does not exist at runtime. */
    interface __NameMapAudioStreamPlaybackInteractive extends __NameMapAudioStreamPlayback {
    }
    /** Playback component of [AudioStreamInteractive].  
     *  	  
     *  @link https://docs.godotengine.org/en/4.5/classes/class_audiostreamplaybackinteractive.html  
     */
    class AudioStreamPlaybackInteractive extends AudioStreamPlayback {
        constructor(identifier?: any)
        /** Switch to a clip (by name). */
        switch_to_clip_by_name(clip_name: StringName): void
        
        /** Switch to a clip (by index). */
        switch_to_clip(clip_index: int64): void
        
        /** Return the index of the currently playing clip. You can use this to get the name of the currently playing clip with [method AudioStreamInteractive.get_clip_name].  
         *  **Example:** Get the currently playing clip name from inside an [AudioStreamPlayer] node.  
         *    
         */
        get_current_clip_index(): int64
        /** @deprecated Internal use. Does not exist at runtime. */
        __godotNameMap: __NameMapAudioStreamPlaybackInteractive;
    }
    /** @deprecated Internal use. Does not exist at runtime. */
    interface __NameMapAudioStreamPlaybackOggVorbis extends __NameMapAudioStreamPlaybackResampled {
    }
    /** @link https://docs.godotengine.org/en/4.5/classes/class_audiostreamplaybackoggvorbis.html */
    class AudioStreamPlaybackOggVorbis extends AudioStreamPlaybackResampled {
        constructor(identifier?: any)
        /** @deprecated Internal use. Does not exist at runtime. */
        __godotNameMap: __NameMapAudioStreamPlaybackOggVorbis;
    }
    /** @deprecated Internal use. Does not exist at runtime. */
    interface __NameMapAudioStreamPlaybackPlaylist extends __NameMapAudioStreamPlayback {
    }
    /** Playback class used for [AudioStreamPlaylist].  
     *  	  
     *  @link https://docs.godotengine.org/en/4.5/classes/class_audiostreamplaybackplaylist.html  
     */
    class AudioStreamPlaybackPlaylist extends AudioStreamPlayback {
        constructor(identifier?: any)
        /** @deprecated Internal use. Does not exist at runtime. */
        __godotNameMap: __NameMapAudioStreamPlaybackPlaylist;
    }
    /** @deprecated Internal use. Does not exist at runtime. */
    interface __NameMapAudioStreamPlaybackPolyphonic extends __NameMapAudioStreamPlayback {
    }
    /** Playback instance for [AudioStreamPolyphonic].  
     *  	  
     *  @link https://docs.godotengine.org/en/4.5/classes/class_audiostreamplaybackpolyphonic.html  
     */
    class AudioStreamPlaybackPolyphonic extends AudioStreamPlayback {
        /** Returned by [method play_stream] in case it could not allocate a stream for playback. */
        static readonly INVALID_ID = -1
        constructor(identifier?: any)
        
        /** Play an [AudioStream] at a given offset, volume, pitch scale, playback type, and bus. Playback starts immediately.  
         *  The return value is a unique integer ID that is associated to this playback stream and which can be used to control it.  
         *  This ID becomes invalid when the stream ends (if it does not loop), when the [AudioStreamPlaybackPolyphonic] is stopped, or when [method stop_stream] is called.  
         *  This function returns [constant INVALID_ID] if the amount of streams currently playing equals [member AudioStreamPolyphonic.polyphony]. If you need a higher amount of maximum polyphony, raise this value.  
         */
        play_stream(stream: AudioStream, from_offset?: float64 /* = 0 */, volume_db?: float64 /* = 0 */, pitch_scale?: float64 /* = 1 */, playback_type?: AudioServer.PlaybackType /* = 0 */, bus?: StringName /* = 'Master' */): int64
        
        /** Change the stream volume (in db). The [param stream] argument is an integer ID returned by [method play_stream]. */
        set_stream_volume(stream: int64, volume_db: float64): void
        
        /** Change the stream pitch scale. The [param stream] argument is an integer ID returned by [method play_stream]. */
        set_stream_pitch_scale(stream: int64, pitch_scale: float64): void
        
        /** Returns `true` if the stream associated with the given integer ID is still playing. Check [method play_stream] for information on when this ID becomes invalid. */
        is_stream_playing(stream: int64): boolean
        
        /** Stop a stream. The [param stream] argument is an integer ID returned by [method play_stream], which becomes invalid after calling this function. */
        stop_stream(stream: int64): void
        /** @deprecated Internal use. Does not exist at runtime. */
        __godotNameMap: __NameMapAudioStreamPlaybackPolyphonic;
    }
    /** @deprecated Internal use. Does not exist at runtime. */
    interface __NameMapAudioStreamPlaybackResampled extends __NameMapAudioStreamPlayback {
    }
    /** @link https://docs.godotengine.org/en/4.5/classes/class_audiostreamplaybackresampled.html */
    class AudioStreamPlaybackResampled extends AudioStreamPlayback {
        constructor(identifier?: any)
        /* gdvirtual */ _mix_resampled(dst_buffer: int64, frame_count: int64): int64
        /* gdvirtual */ _get_stream_sampling_rate(): float64
        begin_resample(): void
        /** @deprecated Internal use. Does not exist at runtime. */
        __godotNameMap: __NameMapAudioStreamPlaybackResampled;
    }
    /** @deprecated Internal use. Does not exist at runtime. */
    interface __NameMapAudioStreamPlaybackSynchronized extends __NameMapAudioStreamPlayback {
    }
    /** @link https://docs.godotengine.org/en/4.5/classes/class_audiostreamplaybacksynchronized.html */
    class AudioStreamPlaybackSynchronized extends AudioStreamPlayback {
        constructor(identifier?: any)
        /** @deprecated Internal use. Does not exist at runtime. */
        __godotNameMap: __NameMapAudioStreamPlaybackSynchronized;
    }
    namespace AudioStreamPlayer {
        enum MixTarget {
            /** The audio will be played only on the first channel. This is the default. */
            MIX_TARGET_STEREO = 0,
            
            /** The audio will be played on all surround channels. */
            MIX_TARGET_SURROUND = 1,
            
            /** The audio will be played on the second channel, which is usually the center. */
            MIX_TARGET_CENTER = 2,
        }
    }
    /** @deprecated Internal use. Does not exist at runtime. */
    interface __NameMapAudioStreamPlayer extends __NameMapNode {
    }
    /** A node for audio playback.  
     *  	  
     *  @link https://docs.godotengine.org/en/4.5/classes/class_audiostreamplayer.html  
     */
    class AudioStreamPlayer<Map extends NodePathMap = any> extends Node<Map> {
        constructor(identifier?: any)
        /** Plays a sound from the beginning, or the given [param from_position] in seconds. */
        play(from_position?: float64 /* = 0 */): void
        
        /** Restarts all sounds to be played from the given [param to_position], in seconds. Does nothing if no sounds are playing. */
        seek(to_position: float64): void
        
        /** Stops all sounds from this node. */
        stop(): void
        
        /** Returns the position in the [AudioStream] of the latest sound, in seconds. Returns `0.0` if no sounds are playing.  
         *      
         *  **Note:** The position is not always accurate, as the [AudioServer] does not mix audio every processed frame. To get more accurate results, add [method AudioServer.get_time_since_last_mix] to the returned position.  
         *      
         *  **Note:** This method always returns `0.0` if the [member stream] is an [AudioStreamInteractive], since it can have multiple clips playing at once.  
         */
        get_playback_position(): float64
        
        /** Returns `true` if any sound is active, even if [member stream_paused] is set to `true`. See also [member playing] and [method get_stream_playback]. */
        has_stream_playback(): boolean
        
        /** Returns the latest [AudioStreamPlayback] of this node, usually the most recently created by [method play]. If no sounds are playing, this method fails and returns an empty playback. */
        get_stream_playback(): null | AudioStreamPlayback
        
        /** The [AudioStream] resource to be played. Setting this property stops all currently playing sounds. If left empty, the [AudioStreamPlayer] does not work. */
        get stream(): null | AudioStream
        set stream(value: null | AudioStream)
        
        /** Volume of sound, in decibels. This is an offset of the [member stream]'s volume.  
         *      
         *  **Note:** To convert between decibel and linear energy (like most volume sliders do), use [member volume_linear], or [method @GlobalScope.db_to_linear] and [method @GlobalScope.linear_to_db].  
         */
        get volume_db(): float64
        set volume_db(value: float64)
        
        /** Volume of sound, as a linear value.  
         *      
         *  **Note:** This member modifies [member volume_db] for convenience. The returned value is equivalent to the result of [method @GlobalScope.db_to_linear] on [member volume_db]. Setting this member is equivalent to setting [member volume_db] to the result of [method @GlobalScope.linear_to_db] on a value.  
         */
        get volume_linear(): float64
        set volume_linear(value: float64)
        
        /** The audio's pitch and tempo, as a multiplier of the [member stream]'s sample rate. A value of `2.0` doubles the audio's pitch, while a value of `0.5` halves the pitch. */
        get pitch_scale(): float64
        set pitch_scale(value: float64)
        
        /** If `true`, this node is playing sounds. Setting this property has the same effect as [method play] and [method stop]. */
        get playing(): boolean
        set playing(value: boolean)
        
        /** If `true`, this node calls [method play] when entering the tree. */
        get autoplay(): boolean
        set autoplay(value: boolean)
        
        /** If `true`, the sounds are paused. Setting [member stream_paused] to `false` resumes all sounds.  
         *      
         *  **Note:** This property is automatically changed when exiting or entering the tree, or this node is paused (see [member Node.process_mode]).  
         */
        get stream_paused(): boolean
        set stream_paused(value: boolean)
        
        /** The mix target channels. Has no effect when two speakers or less are detected (see [enum AudioServer.SpeakerMode]). */
        get mix_target(): int64
        set mix_target(value: int64)
        
        /** The maximum number of sounds this node can play at the same time. Calling [method play] after this value is reached will cut off the oldest sounds. */
        get max_polyphony(): int64
        set max_polyphony(value: int64)
        
        /** The target bus name. All sounds from this node will be playing on this bus.  
         *      
         *  **Note:** At runtime, if no bus with the given name exists, all sounds will fall back on `"Master"`. See also [method AudioServer.get_bus_name].  
         */
        get bus(): StringName
        set bus(value: StringName)
        
        /** The playback type of the stream player. If set other than to the default value, it will force that playback type. */
        get playback_type(): int64
        set playback_type(value: int64)
        
        /** Emitted when a sound finishes playing without interruptions. This signal is  *not*  emitted when calling [method stop], or when exiting the tree while sounds are playing. */
        readonly finished: Signal<() => void>
        /** @deprecated Internal use. Does not exist at runtime. */
        __godotNameMap: __NameMapAudioStreamPlayer;
    }
    /** @deprecated Internal use. Does not exist at runtime. */
    interface __NameMapAudioStreamPlayer2D extends __NameMapNode2D {
    }
    /** Plays positional sound in 2D space.  
     *  	  
     *  @link https://docs.godotengine.org/en/4.5/classes/class_audiostreamplayer2d.html  
     */
    class AudioStreamPlayer2D<Map extends NodePathMap = any> extends Node2D<Map> {
        constructor(identifier?: any)
        /** Queues the audio to play on the next physics frame, from the given position [param from_position], in seconds. */
        play(from_position?: float64 /* = 0 */): void
        
        /** Sets the position from which audio will be played, in seconds. */
        seek(to_position: float64): void
        
        /** Stops the audio. */
        stop(): void
        
        /** Returns the position in the [AudioStream]. */
        get_playback_position(): float64
        
        /** Returns whether the [AudioStreamPlayer] can return the [AudioStreamPlayback] object or not. */
        has_stream_playback(): boolean
        
        /** Returns the [AudioStreamPlayback] object associated with this [AudioStreamPlayer2D]. */
        get_stream_playback(): null | AudioStreamPlayback
        
        /** The [AudioStream] object to be played. */
        get stream(): null | AudioStream
        set stream(value: null | AudioStream)
        
        /** Base volume before attenuation, in decibels. */
        get volume_db(): float64
        set volume_db(value: float64)
        
        /** Base volume before attenuation, as a linear value.  
         *      
         *  **Note:** This member modifies [member volume_db] for convenience. The returned value is equivalent to the result of [method @GlobalScope.db_to_linear] on [member volume_db]. Setting this member is equivalent to setting [member volume_db] to the result of [method @GlobalScope.linear_to_db] on a value.  
         */
        get volume_linear(): float64
        set volume_linear(value: float64)
        
        /** The pitch and the tempo of the audio, as a multiplier of the audio sample's sample rate. */
        get pitch_scale(): float64
        set pitch_scale(value: float64)
        
        /** If `true`, audio is playing or is queued to be played (see [method play]). */
        get playing(): boolean
        set playing(value: boolean)
        
        /** If `true`, audio plays when added to scene tree. */
        get autoplay(): boolean
        set autoplay(value: boolean)
        
        /** If `true`, the playback is paused. You can resume it by setting [member stream_paused] to `false`. */
        get stream_paused(): boolean
        set stream_paused(value: boolean)
        
        /** Maximum distance from which audio is still hearable. */
        get max_distance(): float64
        set max_distance(value: float64)
        
        /** The volume is attenuated over distance with this as an exponent. */
        get attenuation(): float64
        set attenuation(value: float64)
        
        /** The maximum number of sounds this node can play at the same time. Playing additional sounds after this value is reached will cut off the oldest sounds. */
        get max_polyphony(): int64
        set max_polyphony(value: int64)
        
        /** Scales the panning strength for this node by multiplying the base [member ProjectSettings.audio/general/2d_panning_strength] with this factor. Higher values will pan audio from left to right more dramatically than lower values. */
        get panning_strength(): float64
        set panning_strength(value: float64)
        
        /** Bus on which this audio is playing.  
         *      
         *  **Note:** When setting this property, keep in mind that no validation is performed to see if the given name matches an existing bus. This is because audio bus layouts might be loaded after this property is set. If this given name can't be resolved at runtime, it will fall back to `"Master"`.  
         */
        get bus(): StringName
        set bus(value: StringName)
        
        /** Determines which [Area2D] layers affect the sound for reverb and audio bus effects. Areas can be used to redirect [AudioStream]s so that they play in a certain audio bus. An example of how you might use this is making a "water" area so that sounds played in the water are redirected through an audio bus to make them sound like they are being played underwater. */
        get area_mask(): int64
        set area_mask(value: int64)
        
        /** The playback type of the stream player. If set other than to the default value, it will force that playback type. */
        get playback_type(): int64
        set playback_type(value: int64)
        
        /** Emitted when the audio stops playing. */
        readonly finished: Signal<() => void>
        /** @deprecated Internal use. Does not exist at runtime. */
        __godotNameMap: __NameMapAudioStreamPlayer2D;
    }
    namespace AudioStreamPlayer3D {
        enum AttenuationModel {
            /** Attenuation of loudness according to linear distance. */
            ATTENUATION_INVERSE_DISTANCE = 0,
            
            /** Attenuation of loudness according to squared distance. */
            ATTENUATION_INVERSE_SQUARE_DISTANCE = 1,
            
            /** Attenuation of loudness according to logarithmic distance. */
            ATTENUATION_LOGARITHMIC = 2,
            
            /** No attenuation of loudness according to distance. The sound will still be heard positionally, unlike an [AudioStreamPlayer]. [constant ATTENUATION_DISABLED] can be combined with a [member max_distance] value greater than `0.0` to achieve linear attenuation clamped to a sphere of a defined size. */
            ATTENUATION_DISABLED = 3,
        }
        enum DopplerTracking {
            /** Disables doppler tracking. */
            DOPPLER_TRACKING_DISABLED = 0,
            
            /** Executes doppler tracking during process frames (see [constant Node.NOTIFICATION_INTERNAL_PROCESS]). */
            DOPPLER_TRACKING_IDLE_STEP = 1,
            
            /** Executes doppler tracking during physics frames (see [constant Node.NOTIFICATION_INTERNAL_PHYSICS_PROCESS]). */
            DOPPLER_TRACKING_PHYSICS_STEP = 2,
        }
    }
    /** @deprecated Internal use. Does not exist at runtime. */
    interface __NameMapAudioStreamPlayer3D extends __NameMapNode3D {
    }
    /** Plays positional sound in 3D space.  
     *  	  
     *  @link https://docs.godotengine.org/en/4.5/classes/class_audiostreamplayer3d.html  
     */
    class AudioStreamPlayer3D<Map extends NodePathMap = any> extends Node3D<Map> {
        constructor(identifier?: any)
        /** Queues the audio to play on the next physics frame, from the given position [param from_position], in seconds. */
        play(from_position?: float64 /* = 0 */): void
        
        /** Sets the position from which audio will be played, in seconds. */
        seek(to_position: float64): void
        
        /** Stops the audio. */
        stop(): void
        
        /** Returns the position in the [AudioStream]. */
        get_playback_position(): float64
        
        /** Returns whether the [AudioStreamPlayer] can return the [AudioStreamPlayback] object or not. */
        has_stream_playback(): boolean
        
        /** Returns the [AudioStreamPlayback] object associated with this [AudioStreamPlayer3D]. */
        get_stream_playback(): null | AudioStreamPlayback
        
        /** The [AudioStream] resource to be played. */
        get stream(): null | AudioStream
        set stream(value: null | AudioStream)
        
        /** Decides if audio should get quieter with distance linearly, quadratically, logarithmically, or not be affected by distance, effectively disabling attenuation. */
        get attenuation_model(): int64
        set attenuation_model(value: int64)
        
        /** The base sound level before attenuation, in decibels. */
        get volume_db(): float64
        set volume_db(value: float64)
        
        /** The base sound level before attenuation, as a linear value.  
         *      
         *  **Note:** This member modifies [member volume_db] for convenience. The returned value is equivalent to the result of [method @GlobalScope.db_to_linear] on [member volume_db]. Setting this member is equivalent to setting [member volume_db] to the result of [method @GlobalScope.linear_to_db] on a value.  
         */
        get volume_linear(): float64
        set volume_linear(value: float64)
        
        /** The factor for the attenuation effect. Higher values make the sound audible over a larger distance. */
        get unit_size(): float64
        set unit_size(value: float64)
        
        /** Sets the absolute maximum of the sound level, in decibels. */
        get max_db(): float64
        set max_db(value: float64)
        
        /** The pitch and the tempo of the audio, as a multiplier of the audio sample's sample rate. */
        get pitch_scale(): float64
        set pitch_scale(value: float64)
        
        /** If `true`, audio is playing or is queued to be played (see [method play]). */
        get playing(): boolean
        set playing(value: boolean)
        
        /** If `true`, audio plays when the AudioStreamPlayer3D node is added to scene tree. */
        get autoplay(): boolean
        set autoplay(value: boolean)
        
        /** If `true`, the playback is paused. You can resume it by setting [member stream_paused] to `false`. */
        get stream_paused(): boolean
        set stream_paused(value: boolean)
        
        /** The distance past which the sound can no longer be heard at all. Only has an effect if set to a value greater than `0.0`. [member max_distance] works in tandem with [member unit_size]. However, unlike [member unit_size] whose behavior depends on the [member attenuation_model], [member max_distance] always works in a linear fashion. This can be used to prevent the [AudioStreamPlayer3D] from requiring audio mixing when the listener is far away, which saves CPU resources. */
        get max_distance(): float64
        set max_distance(value: float64)
        
        /** The maximum number of sounds this node can play at the same time. Playing additional sounds after this value is reached will cut off the oldest sounds. */
        get max_polyphony(): int64
        set max_polyphony(value: int64)
        
        /** Scales the panning strength for this node by multiplying the base [member ProjectSettings.audio/general/3d_panning_strength] by this factor. If the product is `0.0` then stereo panning is disabled and the volume is the same for all channels. If the product is `1.0` then one of the channels will be muted when the sound is located exactly to the left (or right) of the listener.  
         *  Two speaker stereo arrangements implement the [url=https://webaudio.github.io/web-audio-api/#stereopanner-algorithm]WebAudio standard for StereoPannerNode Panning[/url] where the volume is cosine of half the azimuth angle to the ear.  
         *  For other speaker arrangements such as the 5.1 and 7.1 the SPCAP (Speaker-Placement Correction Amplitude) algorithm is implemented.  
         */
        get panning_strength(): float64
        set panning_strength(value: float64)
        
        /** The bus on which this audio is playing.  
         *      
         *  **Note:** When setting this property, keep in mind that no validation is performed to see if the given name matches an existing bus. This is because audio bus layouts might be loaded after this property is set. If this given name can't be resolved at runtime, it will fall back to `"Master"`.  
         */
        get bus(): StringName
        set bus(value: StringName)
        
        /** Determines which [Area3D] layers affect the sound for reverb and audio bus effects. Areas can be used to redirect [AudioStream]s so that they play in a certain audio bus. An example of how you might use this is making a "water" area so that sounds played in the water are redirected through an audio bus to make them sound like they are being played underwater. */
        get area_mask(): int64
        set area_mask(value: int64)
        
        /** The playback type of the stream player. If set other than to the default value, it will force that playback type. */
        get playback_type(): int64
        set playback_type(value: int64)
        
        /** If `true`, the audio should be attenuated according to the direction of the sound. */
        get emission_angle_enabled(): boolean
        set emission_angle_enabled(value: boolean)
        
        /** The angle in which the audio reaches a listener unattenuated. */
        get emission_angle_degrees(): float64
        set emission_angle_degrees(value: float64)
        
        /** Attenuation factor used if listener is outside of [member emission_angle_degrees] and [member emission_angle_enabled] is set, in decibels. */
        get emission_angle_filter_attenuation_db(): float64
        set emission_angle_filter_attenuation_db(value: float64)
        
        /** The cutoff frequency of the attenuation low-pass filter, in Hz. A sound above this frequency is attenuated more than a sound below this frequency. To disable this effect, set this to `20500` as this frequency is above the human hearing limit. */
        get attenuation_filter_cutoff_hz(): float64
        set attenuation_filter_cutoff_hz(value: float64)
        
        /** Amount how much the filter affects the loudness, in decibels. */
        get attenuation_filter_db(): float64
        set attenuation_filter_db(value: float64)
        
        /** Decides in which step the Doppler effect should be calculated.  
         *      
         *  **Note:** If [member doppler_tracking] is not [constant DOPPLER_TRACKING_DISABLED] but the current [Camera3D]/[AudioListener3D] has doppler tracking disabled, the Doppler effect will be heard but will not take the movement of the current listener into account. If accurate Doppler effect is desired, doppler tracking should be enabled on both the [AudioStreamPlayer3D] and the current [Camera3D]/[AudioListener3D].  
         */
        get doppler_tracking(): int64
        set doppler_tracking(value: int64)
        
        /** Emitted when the audio stops playing. */
        readonly finished: Signal<() => void>
        /** @deprecated Internal use. Does not exist at runtime. */
        __godotNameMap: __NameMapAudioStreamPlayer3D;
    }
    /** @deprecated Internal use. Does not exist at runtime. */
    interface __NameMapAudioStreamPlaylist extends __NameMapAudioStream {
    }
    /** [AudioStream] that includes sub-streams and plays them back like a playlist.  
     *  	  
     *  @link https://docs.godotengine.org/en/4.5/classes/class_audiostreamplaylist.html  
     */
    class AudioStreamPlaylist extends AudioStream {
        /** Maximum amount of streams supported in the playlist. */
        static readonly MAX_STREAMS = 64
        constructor(identifier?: any)
        
        /** Returns the BPM of the playlist, which can vary depending on the clip being played. */
        get_bpm(): float64
        
        /** Sets the stream at playback position index. */
        set_list_stream(stream_index: int64, audio_stream: AudioStream): void
        
        /** Returns the stream at playback position index. */
        get_list_stream(stream_index: int64): null | AudioStream
        
        /** If `true`, the playlist will shuffle each time playback starts and each time it loops. */
        get shuffle(): boolean
        set shuffle(value: boolean)
        
        /** If `true`, the playlist will loop, otherwise the playlist will end when the last stream is finished. */
        get loop(): boolean
        set loop(value: boolean)
        
        /** Fade time used when a stream ends, when going to the next one. Streams are expected to have an extra bit of audio after the end to help with fading. */
        get fade_time(): float64
        set fade_time(value: float64)
        
        /** Amount of streams in the playlist. */
        get stream_count(): int64
        set stream_count(value: int64)
        get stream_0(): null | AudioStream
        set stream_0(value: null | AudioStream)
        get stream_1(): null | AudioStream
        set stream_1(value: null | AudioStream)
        get stream_2(): null | AudioStream
        set stream_2(value: null | AudioStream)
        get stream_3(): null | AudioStream
        set stream_3(value: null | AudioStream)
        get stream_4(): null | AudioStream
        set stream_4(value: null | AudioStream)
        get stream_5(): null | AudioStream
        set stream_5(value: null | AudioStream)
        get stream_6(): null | AudioStream
        set stream_6(value: null | AudioStream)
        get stream_7(): null | AudioStream
        set stream_7(value: null | AudioStream)
        get stream_8(): null | AudioStream
        set stream_8(value: null | AudioStream)
        get stream_9(): null | AudioStream
        set stream_9(value: null | AudioStream)
        get stream_10(): null | AudioStream
        set stream_10(value: null | AudioStream)
        get stream_11(): null | AudioStream
        set stream_11(value: null | AudioStream)
        get stream_12(): null | AudioStream
        set stream_12(value: null | AudioStream)
        get stream_13(): null | AudioStream
        set stream_13(value: null | AudioStream)
        get stream_14(): null | AudioStream
        set stream_14(value: null | AudioStream)
        get stream_15(): null | AudioStream
        set stream_15(value: null | AudioStream)
        get stream_16(): null | AudioStream
        set stream_16(value: null | AudioStream)
        get stream_17(): null | AudioStream
        set stream_17(value: null | AudioStream)
        get stream_18(): null | AudioStream
        set stream_18(value: null | AudioStream)
        get stream_19(): null | AudioStream
        set stream_19(value: null | AudioStream)
        get stream_20(): null | AudioStream
        set stream_20(value: null | AudioStream)
        get stream_21(): null | AudioStream
        set stream_21(value: null | AudioStream)
        get stream_22(): null | AudioStream
        set stream_22(value: null | AudioStream)
        get stream_23(): null | AudioStream
        set stream_23(value: null | AudioStream)
        get stream_24(): null | AudioStream
        set stream_24(value: null | AudioStream)
        get stream_25(): null | AudioStream
        set stream_25(value: null | AudioStream)
        get stream_26(): null | AudioStream
        set stream_26(value: null | AudioStream)
        get stream_27(): null | AudioStream
        set stream_27(value: null | AudioStream)
        get stream_28(): null | AudioStream
        set stream_28(value: null | AudioStream)
        get stream_29(): null | AudioStream
        set stream_29(value: null | AudioStream)
        get stream_30(): null | AudioStream
        set stream_30(value: null | AudioStream)
        get stream_31(): null | AudioStream
        set stream_31(value: null | AudioStream)
        get stream_32(): null | AudioStream
        set stream_32(value: null | AudioStream)
        get stream_33(): null | AudioStream
        set stream_33(value: null | AudioStream)
        get stream_34(): null | AudioStream
        set stream_34(value: null | AudioStream)
        get stream_35(): null | AudioStream
        set stream_35(value: null | AudioStream)
        get stream_36(): null | AudioStream
        set stream_36(value: null | AudioStream)
        get stream_37(): null | AudioStream
        set stream_37(value: null | AudioStream)
        get stream_38(): null | AudioStream
        set stream_38(value: null | AudioStream)
        get stream_39(): null | AudioStream
        set stream_39(value: null | AudioStream)
        get stream_40(): null | AudioStream
        set stream_40(value: null | AudioStream)
        get stream_41(): null | AudioStream
        set stream_41(value: null | AudioStream)
        get stream_42(): null | AudioStream
        set stream_42(value: null | AudioStream)
        get stream_43(): null | AudioStream
        set stream_43(value: null | AudioStream)
        get stream_44(): null | AudioStream
        set stream_44(value: null | AudioStream)
        get stream_45(): null | AudioStream
        set stream_45(value: null | AudioStream)
        get stream_46(): null | AudioStream
        set stream_46(value: null | AudioStream)
        get stream_47(): null | AudioStream
        set stream_47(value: null | AudioStream)
        get stream_48(): null | AudioStream
        set stream_48(value: null | AudioStream)
        get stream_49(): null | AudioStream
        set stream_49(value: null | AudioStream)
        get stream_50(): null | AudioStream
        set stream_50(value: null | AudioStream)
        get stream_51(): null | AudioStream
        set stream_51(value: null | AudioStream)
        get stream_52(): null | AudioStream
        set stream_52(value: null | AudioStream)
        get stream_53(): null | AudioStream
        set stream_53(value: null | AudioStream)
        get stream_54(): null | AudioStream
        set stream_54(value: null | AudioStream)
        get stream_55(): null | AudioStream
        set stream_55(value: null | AudioStream)
        get stream_56(): null | AudioStream
        set stream_56(value: null | AudioStream)
        get stream_57(): null | AudioStream
        set stream_57(value: null | AudioStream)
        get stream_58(): null | AudioStream
        set stream_58(value: null | AudioStream)
        get stream_59(): null | AudioStream
        set stream_59(value: null | AudioStream)
        get stream_60(): null | AudioStream
        set stream_60(value: null | AudioStream)
        get stream_61(): null | AudioStream
        set stream_61(value: null | AudioStream)
        get stream_62(): null | AudioStream
        set stream_62(value: null | AudioStream)
        get stream_63(): null | AudioStream
        set stream_63(value: null | AudioStream)
        /** @deprecated Internal use. Does not exist at runtime. */
        __godotNameMap: __NameMapAudioStreamPlaylist;
    }
    /** @deprecated Internal use. Does not exist at runtime. */
    interface __NameMapAudioStreamPolyphonic extends __NameMapAudioStream {
    }
    /** AudioStream that lets the user play custom streams at any time from code, simultaneously using a single player.  
     *  	  
     *  @link https://docs.godotengine.org/en/4.5/classes/class_audiostreampolyphonic.html  
     */
    class AudioStreamPolyphonic extends AudioStream {
        constructor(identifier?: any)
        /** Maximum amount of simultaneous streams that can be played. */
        get polyphony(): int64
        set polyphony(value: int64)
        /** @deprecated Internal use. Does not exist at runtime. */
        __godotNameMap: __NameMapAudioStreamPolyphonic;
    }
    namespace AudioStreamRandomizer {
        enum PlaybackMode {
            /** Pick a stream at random according to the probability weights chosen for each stream, but avoid playing the same stream twice in a row whenever possible. If only 1 sound is present in the pool, the same sound will always play, effectively allowing repeats to occur. */
            PLAYBACK_RANDOM_NO_REPEATS = 0,
            
            /** Pick a stream at random according to the probability weights chosen for each stream. If only 1 sound is present in the pool, the same sound will always play. */
            PLAYBACK_RANDOM = 1,
            
            /** Play streams in the order they appear in the stream pool. If only 1 sound is present in the pool, the same sound will always play. */
            PLAYBACK_SEQUENTIAL = 2,
        }
    }
    /** @deprecated Internal use. Does not exist at runtime. */
    interface __NameMapAudioStreamRandomizer extends __NameMapAudioStream {
    }
    /** Wraps a pool of audio streams with pitch and volume shifting.  
     *  	  
     *  @link https://docs.godotengine.org/en/4.5/classes/class_audiostreamrandomizer.html  
     */
    class AudioStreamRandomizer extends AudioStream {
        constructor(identifier?: any)
        /** Insert a stream at the specified index. If the index is less than zero, the insertion occurs at the end of the underlying pool. */
        add_stream(index: int64, stream: AudioStream, weight?: float64 /* = 1 */): void
        
        /** Move a stream from one index to another. */
        move_stream(index_from: int64, index_to: int64): void
        
        /** Remove the stream at the specified index. */
        remove_stream(index: int64): void
        
        /** Set the AudioStream at the specified index. */
        set_stream(index: int64, stream: AudioStream): void
        
        /** Returns the stream at the specified index. */
        get_stream(index: int64): null | AudioStream
        
        /** Set the probability weight of the stream at the specified index. The higher this value, the more likely that the randomizer will choose this stream during random playback modes. */
        set_stream_probability_weight(index: int64, weight: float64): void
        
        /** Returns the probability weight associated with the stream at the given index. */
        get_stream_probability_weight(index: int64): float64
        
        /** Controls how this AudioStreamRandomizer picks which AudioStream to play next. */
        get playback_mode(): int64
        set playback_mode(value: int64)
        
        /** The intensity of random pitch variation. A value of 1 means no variation. */
        get random_pitch(): float64
        set random_pitch(value: float64)
        
        /** The intensity of random volume variation. A value of 0 means no variation. */
        get random_volume_offset_db(): float64
        set random_volume_offset_db(value: float64)
        
        /** The number of streams in the stream pool. */
        get streams_count(): int64
        set streams_count(value: int64)
        /** @deprecated Internal use. Does not exist at runtime. */
        __godotNameMap: __NameMapAudioStreamRandomizer;
    }
    /** @deprecated Internal use. Does not exist at runtime. */
    interface __NameMapAudioStreamSynchronized extends __NameMapAudioStream {
    }
    /** Stream that can be fitted with sub-streams, which will be played in-sync.  
     *  	  
     *  @link https://docs.godotengine.org/en/4.5/classes/class_audiostreamsynchronized.html  
     */
    class AudioStreamSynchronized extends AudioStream {
        /** Maximum amount of streams that can be synchronized. */
        static readonly MAX_STREAMS = 32
        constructor(identifier?: any)
        
        /** Set one of the synchronized streams, by index. */
        set_sync_stream(stream_index: int64, audio_stream: AudioStream): void
        
        /** Get one of the synchronized streams, by index. */
        get_sync_stream(stream_index: int64): null | AudioStream
        
        /** Set the volume of one of the synchronized streams, by index. */
        set_sync_stream_volume(stream_index: int64, volume_db: float64): void
        
        /** Get the volume of one of the synchronized streams, by index. */
        get_sync_stream_volume(stream_index: int64): float64
        
        /** Set the total amount of streams that will be played back synchronized. */
        get stream_count(): int64
        set stream_count(value: int64)
        get "stream_0/stream"(): null | AudioStream
        set "stream_0/stream"(value: null | AudioStream)
        get "stream_0/volume"(): float64
        set "stream_0/volume"(value: float64)
        get "stream_1/stream"(): null | AudioStream
        set "stream_1/stream"(value: null | AudioStream)
        get "stream_1/volume"(): float64
        set "stream_1/volume"(value: float64)
        get "stream_2/stream"(): null | AudioStream
        set "stream_2/stream"(value: null | AudioStream)
        get "stream_2/volume"(): float64
        set "stream_2/volume"(value: float64)
        get "stream_3/stream"(): null | AudioStream
        set "stream_3/stream"(value: null | AudioStream)
        get "stream_3/volume"(): float64
        set "stream_3/volume"(value: float64)
        get "stream_4/stream"(): null | AudioStream
        set "stream_4/stream"(value: null | AudioStream)
        get "stream_4/volume"(): float64
        set "stream_4/volume"(value: float64)
        get "stream_5/stream"(): null | AudioStream
        set "stream_5/stream"(value: null | AudioStream)
        get "stream_5/volume"(): float64
        set "stream_5/volume"(value: float64)
        get "stream_6/stream"(): null | AudioStream
        set "stream_6/stream"(value: null | AudioStream)
        get "stream_6/volume"(): float64
        set "stream_6/volume"(value: float64)
        get "stream_7/stream"(): null | AudioStream
        set "stream_7/stream"(value: null | AudioStream)
        get "stream_7/volume"(): float64
        set "stream_7/volume"(value: float64)
        get "stream_8/stream"(): null | AudioStream
        set "stream_8/stream"(value: null | AudioStream)
        get "stream_8/volume"(): float64
        set "stream_8/volume"(value: float64)
        get "stream_9/stream"(): null | AudioStream
        set "stream_9/stream"(value: null | AudioStream)
        get "stream_9/volume"(): float64
        set "stream_9/volume"(value: float64)
        get "stream_10/stream"(): null | AudioStream
        set "stream_10/stream"(value: null | AudioStream)
        get "stream_10/volume"(): float64
        set "stream_10/volume"(value: float64)
        get "stream_11/stream"(): null | AudioStream
        set "stream_11/stream"(value: null | AudioStream)
        get "stream_11/volume"(): float64
        set "stream_11/volume"(value: float64)
        get "stream_12/stream"(): null | AudioStream
        set "stream_12/stream"(value: null | AudioStream)
        get "stream_12/volume"(): float64
        set "stream_12/volume"(value: float64)
        get "stream_13/stream"(): null | AudioStream
        set "stream_13/stream"(value: null | AudioStream)
        get "stream_13/volume"(): float64
        set "stream_13/volume"(value: float64)
        get "stream_14/stream"(): null | AudioStream
        set "stream_14/stream"(value: null | AudioStream)
        get "stream_14/volume"(): float64
        set "stream_14/volume"(value: float64)
        get "stream_15/stream"(): null | AudioStream
        set "stream_15/stream"(value: null | AudioStream)
        get "stream_15/volume"(): float64
        set "stream_15/volume"(value: float64)
        get "stream_16/stream"(): null | AudioStream
        set "stream_16/stream"(value: null | AudioStream)
        get "stream_16/volume"(): float64
        set "stream_16/volume"(value: float64)
        get "stream_17/stream"(): null | AudioStream
        set "stream_17/stream"(value: null | AudioStream)
        get "stream_17/volume"(): float64
        set "stream_17/volume"(value: float64)
        get "stream_18/stream"(): null | AudioStream
        set "stream_18/stream"(value: null | AudioStream)
        get "stream_18/volume"(): float64
        set "stream_18/volume"(value: float64)
        get "stream_19/stream"(): null | AudioStream
        set "stream_19/stream"(value: null | AudioStream)
        get "stream_19/volume"(): float64
        set "stream_19/volume"(value: float64)
        get "stream_20/stream"(): null | AudioStream
        set "stream_20/stream"(value: null | AudioStream)
        get "stream_20/volume"(): float64
        set "stream_20/volume"(value: float64)
        get "stream_21/stream"(): null | AudioStream
        set "stream_21/stream"(value: null | AudioStream)
        get "stream_21/volume"(): float64
        set "stream_21/volume"(value: float64)
        get "stream_22/stream"(): null | AudioStream
        set "stream_22/stream"(value: null | AudioStream)
        get "stream_22/volume"(): float64
        set "stream_22/volume"(value: float64)
        get "stream_23/stream"(): null | AudioStream
        set "stream_23/stream"(value: null | AudioStream)
        get "stream_23/volume"(): float64
        set "stream_23/volume"(value: float64)
        get "stream_24/stream"(): null | AudioStream
        set "stream_24/stream"(value: null | AudioStream)
        get "stream_24/volume"(): float64
        set "stream_24/volume"(value: float64)
        get "stream_25/stream"(): null | AudioStream
        set "stream_25/stream"(value: null | AudioStream)
        get "stream_25/volume"(): float64
        set "stream_25/volume"(value: float64)
        get "stream_26/stream"(): null | AudioStream
        set "stream_26/stream"(value: null | AudioStream)
        get "stream_26/volume"(): float64
        set "stream_26/volume"(value: float64)
        get "stream_27/stream"(): null | AudioStream
        set "stream_27/stream"(value: null | AudioStream)
        get "stream_27/volume"(): float64
        set "stream_27/volume"(value: float64)
        get "stream_28/stream"(): null | AudioStream
        set "stream_28/stream"(value: null | AudioStream)
        get "stream_28/volume"(): float64
        set "stream_28/volume"(value: float64)
        get "stream_29/stream"(): null | AudioStream
        set "stream_29/stream"(value: null | AudioStream)
        get "stream_29/volume"(): float64
        set "stream_29/volume"(value: float64)
        get "stream_30/stream"(): null | AudioStream
        set "stream_30/stream"(value: null | AudioStream)
        get "stream_30/volume"(): float64
        set "stream_30/volume"(value: float64)
        get "stream_31/stream"(): null | AudioStream
        set "stream_31/stream"(value: null | AudioStream)
        get "stream_31/volume"(): float64
        set "stream_31/volume"(value: float64)
        /** @deprecated Internal use. Does not exist at runtime. */
        __godotNameMap: __NameMapAudioStreamSynchronized;
    }
    namespace AudioStreamWAV {
        enum Format {
            /** 8-bit PCM audio codec. */
            FORMAT_8_BITS = 0,
            
            /** 16-bit PCM audio codec. */
            FORMAT_16_BITS = 1,
            
            /** Audio is lossily compressed as IMA ADPCM. */
            FORMAT_IMA_ADPCM = 2,
            
            /** Audio is lossily compressed as [url=https://qoaformat.org/]Quite OK Audio[/url]. */
            FORMAT_QOA = 3,
        }
        enum LoopMode {
            /** Audio does not loop. */
            LOOP_DISABLED = 0,
            
            /** Audio loops the data between [member loop_begin] and [member loop_end], playing forward only. */
            LOOP_FORWARD = 1,
            
            /** Audio loops the data between [member loop_begin] and [member loop_end], playing back and forth. */
            LOOP_PINGPONG = 2,
            
            /** Audio loops the data between [member loop_begin] and [member loop_end], playing backward only. */
            LOOP_BACKWARD = 3,
        }
    }
    /** @deprecated Internal use. Does not exist at runtime. */
    interface __NameMapAudioStreamWAV extends __NameMapAudioStream {
    }
    /** Stores audio data loaded from WAV files.  
     *  	  
     *  @link https://docs.godotengine.org/en/4.5/classes/class_audiostreamwav.html  
     */
    class AudioStreamWAV extends AudioStream {
        constructor(identifier?: any)
        /** Creates a new [AudioStreamWAV] instance from the given buffer. The buffer must contain WAV data.  
         *  The keys and values of [param options] match the properties of [ResourceImporterWAV]. The usage of [param options] is identical to [method AudioStreamWAV.load_from_file].  
         */
        static load_from_buffer(stream_data: PackedByteArray | byte[] | ArrayBuffer, options?: GDictionary /* = new GDictionary() */): null | AudioStreamWAV
        
        /** Creates a new [AudioStreamWAV] instance from the given file path. The file must be in WAV format.  
         *  The keys and values of [param options] match the properties of [ResourceImporterWAV].  
         *  **Example:** Load the first file dropped as a WAV and play it:  
         *    
         */
        static load_from_file(path: string, options?: GDictionary /* = new GDictionary() */): null | AudioStreamWAV
        
        /** Saves the AudioStreamWAV as a WAV file to [param path]. Samples with IMA ADPCM or Quite OK Audio formats can't be saved.  
         *      
         *  **Note:** A `.wav` extension is automatically appended to [param path] if it is missing.  
         */
        save_to_wav(path: string): Error
        
        /** Contains the audio data in bytes.  
         *      
         *  **Note:** If [member format] is set to [constant FORMAT_8_BITS], this property expects signed 8-bit PCM data. To convert from unsigned 8-bit PCM, subtract 128 from each byte.  
         *      
         *  **Note:** If [member format] is set to [constant FORMAT_QOA], this property expects data from a full QOA file.  
         */
        get data(): PackedByteArray
        set data(value: PackedByteArray | byte[] | ArrayBuffer)
        
        /** Audio format. */
        get format(): int64
        set format(value: int64)
        
        /** The loop mode. */
        get loop_mode(): int64
        set loop_mode(value: int64)
        
        /** The loop start point (in number of samples, relative to the beginning of the stream). */
        get loop_begin(): int64
        set loop_begin(value: int64)
        
        /** The loop end point (in number of samples, relative to the beginning of the stream). */
        get loop_end(): int64
        set loop_end(value: int64)
        
        /** The sample rate for mixing this audio. Higher values require more storage space, but result in better quality.  
         *  In games, common sample rates in use are `11025`, `16000`, `22050`, `32000`, `44100`, and `48000`.  
         *  According to the [url=https://en.wikipedia.org/wiki/Nyquist%E2%80%93Shannon_sampling_theorem]Nyquist-Shannon sampling theorem[/url], there is no quality difference to human hearing when going past 40,000 Hz (since most humans can only hear up to ~20,000 Hz, often less). If you are using lower-pitched sounds such as voices, lower sample rates such as `32000` or `22050` may be usable with no loss in quality.  
         */
        get mix_rate(): int64
        set mix_rate(value: int64)
        
        /** If `true`, audio is stereo. */
        get stereo(): boolean
        set stereo(value: boolean)
        
        /** Contains user-defined tags if found in the WAV data.  
         *  Commonly used tags include `title`, `artist`, `album`, `tracknumber`, and `date` (`date` does not have a standard date format).  
         *      
         *  **Note:** No tag is  *guaranteed*  to be present in every file, so make sure to account for the keys not always existing.  
         *      
         *  **Note:** Only WAV files using a `LIST` chunk with an identifier of `INFO` to encode the tags are currently supported.  
         */
        get tags(): GDictionary
        set tags(value: GDictionary)
        /** @deprecated Internal use. Does not exist at runtime. */
        __godotNameMap: __NameMapAudioStreamWAV;
    }
    namespace BackBufferCopy {
        enum CopyMode {
            /** Disables the buffering mode. This means the [BackBufferCopy] node will directly use the portion of screen it covers. */
            COPY_MODE_DISABLED = 0,
            
            /** [BackBufferCopy] buffers a rectangular region. */
            COPY_MODE_RECT = 1,
            
            /** [BackBufferCopy] buffers the entire screen. */
            COPY_MODE_VIEWPORT = 2,
        }
    }
    /** @deprecated Internal use. Does not exist at runtime. */
    interface __NameMapBackBufferCopy extends __NameMapNode2D {
    }
    /** A node that copies a region of the screen to a buffer for access in shader code.  
     *  	  
     *  @link https://docs.godotengine.org/en/4.5/classes/class_backbuffercopy.html  
     */
    class BackBufferCopy<Map extends NodePathMap = any> extends Node2D<Map> {
        constructor(identifier?: any)
        /** Buffer mode. */
        get copy_mode(): int64
        set copy_mode(value: int64)
        
        /** The area covered by the [BackBufferCopy]. Only used if [member copy_mode] is [constant COPY_MODE_RECT]. */
        get rect(): Rect2
        set rect(value: Rect2)
        /** @deprecated Internal use. Does not exist at runtime. */
        __godotNameMap: __NameMapBackBufferCopy;
    }
    namespace BaseButton {
        enum DrawMode {
            /** The normal state (i.e. not pressed, not hovered, not toggled and enabled) of buttons. */
            DRAW_NORMAL = 0,
            
            /** The state of buttons are pressed. */
            DRAW_PRESSED = 1,
            
            /** The state of buttons are hovered. */
            DRAW_HOVER = 2,
            
            /** The state of buttons are disabled. */
            DRAW_DISABLED = 3,
            
            /** The state of buttons are both hovered and pressed. */
            DRAW_HOVER_PRESSED = 4,
        }
        enum ActionMode {
            /** Require just a press to consider the button clicked. */
            ACTION_MODE_BUTTON_PRESS = 0,
            
            /** Require a press and a subsequent release before considering the button clicked. */
            ACTION_MODE_BUTTON_RELEASE = 1,
        }
    }
    /** @deprecated Internal use. Does not exist at runtime. */
    interface __NameMapBaseButton extends __NameMapControl {
    }
    /** Abstract base class for GUI buttons.  
     *  	  
     *  @link https://docs.godotengine.org/en/4.5/classes/class_basebutton.html  
     */
    class BaseButton<Map extends NodePathMap = any> extends Control<Map> {
        constructor(identifier?: any)
        /** Called when the button is pressed. If you need to know the button's pressed state (and [member toggle_mode] is active), use [method _toggled] instead. */
        /* gdvirtual */ _pressed(): void
        
        /** Called when the button is toggled (only if [member toggle_mode] is active). */
        /* gdvirtual */ _toggled(toggled_on: boolean): void
        
        /** Changes the [member button_pressed] state of the button, without emitting [signal toggled]. Use when you just want to change the state of the button without sending the pressed event (e.g. when initializing scene). Only works if [member toggle_mode] is `true`.  
         *      
         *  **Note:** This method doesn't unpress other buttons in [member button_group].  
         */
        set_pressed_no_signal(pressed: boolean): void
        
        /** Returns `true` if the mouse has entered the button and has not left it yet. */
        is_hovered(): boolean
        
        /** Returns the visual state used to draw the button. This is useful mainly when implementing your own draw code by either overriding _draw() or connecting to "draw" signal. The visual state of the button is defined by the [enum DrawMode] enum. */
        get_draw_mode(): BaseButton.DrawMode
        
        /** If `true`, the button is in disabled state and can't be clicked or toggled.  
         *      
         *  **Note:** If the button is disabled while held down, [signal button_up] will be emitted.  
         */
        get disabled(): boolean
        set disabled(value: boolean)
        
        /** If `true`, the button is in toggle mode. Makes the button flip state between pressed and unpressed each time its area is clicked. */
        get toggle_mode(): boolean
        set toggle_mode(value: boolean)
        
        /** If `true`, the button's state is pressed. Means the button is pressed down or toggled (if [member toggle_mode] is active). Only works if [member toggle_mode] is `true`.  
         *      
         *  **Note:** Changing the value of [member button_pressed] will result in [signal toggled] to be emitted. If you want to change the pressed state without emitting that signal, use [method set_pressed_no_signal].  
         */
        get button_pressed(): boolean
        set button_pressed(value: boolean)
        
        /** Determines when the button is considered clicked. */
        get action_mode(): int64
        set action_mode(value: int64)
        
        /** Binary mask to choose which mouse buttons this button will respond to.  
         *  To allow both left-click and right-click, use `MOUSE_BUTTON_MASK_LEFT | MOUSE_BUTTON_MASK_RIGHT`.  
         */
        get button_mask(): int64
        set button_mask(value: int64)
        
        /** If `true`, the button stays pressed when moving the cursor outside the button while pressing it.  
         *      
         *  **Note:** This property only affects the button's visual appearance. Signals will be emitted at the same moment regardless of this property's value.  
         */
        get keep_pressed_outside(): boolean
        set keep_pressed_outside(value: boolean)
        
        /** The [ButtonGroup] associated with the button. Not to be confused with node groups.  
         *      
         *  **Note:** The button will be configured as a radio button if a [ButtonGroup] is assigned to it.  
         */
        get button_group(): null | ButtonGroup
        set button_group(value: null | ButtonGroup)
        
        /** [Shortcut] associated to the button. */
        get shortcut(): null | Shortcut
        set shortcut(value: null | Shortcut)
        
        /** If `true`, the button will highlight for a short amount of time when its shortcut is activated. If `false` and [member toggle_mode] is `false`, the shortcut will activate without any visual feedback. */
        get shortcut_feedback(): boolean
        set shortcut_feedback(value: boolean)
        
        /** If `true`, the button will add information about its shortcut in the tooltip.  
         *      
         *  **Note:** This property does nothing when the tooltip control is customized using [method Control._make_custom_tooltip].  
         */
        get shortcut_in_tooltip(): boolean
        set shortcut_in_tooltip(value: boolean)
        
        /** Emitted when the button is toggled or pressed. This is on [signal button_down] if [member action_mode] is [constant ACTION_MODE_BUTTON_PRESS] and on [signal button_up] otherwise.  
         *  If you need to know the button's pressed state (and [member toggle_mode] is active), use [signal toggled] instead.  
         */
        readonly pressed: Signal<() => void>
        
        /** Emitted when the button stops being held down. */
        readonly button_up: Signal<() => void>
        
        /** Emitted when the button starts being held down. */
        readonly button_down: Signal<() => void>
        
        /** Emitted when the button was just toggled between pressed and normal states (only if [member toggle_mode] is active). The new state is contained in the [param toggled_on] argument. */
        readonly toggled: Signal<(toggled_on: boolean) => void>
        /** @deprecated Internal use. Does not exist at runtime. */
        __godotNameMap: __NameMapBaseButton;
    }
    namespace BaseMaterial3D {
        enum TextureParam {
            /** Texture specifying per-pixel color. */
            TEXTURE_ALBEDO = 0,
            
            /** Texture specifying per-pixel metallic value. */
            TEXTURE_METALLIC = 1,
            
            /** Texture specifying per-pixel roughness value. */
            TEXTURE_ROUGHNESS = 2,
            
            /** Texture specifying per-pixel emission color. */
            TEXTURE_EMISSION = 3,
            
            /** Texture specifying per-pixel normal vector. */
            TEXTURE_NORMAL = 4,
            
            /** Texture specifying per-pixel bent normal vector. */
            TEXTURE_BENT_NORMAL = 18,
            
            /** Texture specifying per-pixel rim value. */
            TEXTURE_RIM = 5,
            
            /** Texture specifying per-pixel clearcoat value. */
            TEXTURE_CLEARCOAT = 6,
            
            /** Texture specifying per-pixel flowmap direction for use with [member anisotropy]. */
            TEXTURE_FLOWMAP = 7,
            
            /** Texture specifying per-pixel ambient occlusion value. */
            TEXTURE_AMBIENT_OCCLUSION = 8,
            
            /** Texture specifying per-pixel height. */
            TEXTURE_HEIGHTMAP = 9,
            
            /** Texture specifying per-pixel subsurface scattering. */
            TEXTURE_SUBSURFACE_SCATTERING = 10,
            
            /** Texture specifying per-pixel transmittance for subsurface scattering. */
            TEXTURE_SUBSURFACE_TRANSMITTANCE = 11,
            
            /** Texture specifying per-pixel backlight color. */
            TEXTURE_BACKLIGHT = 12,
            
            /** Texture specifying per-pixel refraction strength. */
            TEXTURE_REFRACTION = 13,
            
            /** Texture specifying per-pixel detail mask blending value. */
            TEXTURE_DETAIL_MASK = 14,
            
            /** Texture specifying per-pixel detail color. */
            TEXTURE_DETAIL_ALBEDO = 15,
            
            /** Texture specifying per-pixel detail normal. */
            TEXTURE_DETAIL_NORMAL = 16,
            
            /** Texture holding ambient occlusion, roughness, and metallic. */
            TEXTURE_ORM = 17,
            
            /** Represents the size of the [enum TextureParam] enum. */
            TEXTURE_MAX = 19,
        }
        enum TextureFilter {
            /** The texture filter reads from the nearest pixel only. This makes the texture look pixelated from up close, and grainy from a distance (due to mipmaps not being sampled). */
            TEXTURE_FILTER_NEAREST = 0,
            
            /** The texture filter blends between the nearest 4 pixels. This makes the texture look smooth from up close, and grainy from a distance (due to mipmaps not being sampled). */
            TEXTURE_FILTER_LINEAR = 1,
            
            /** The texture filter reads from the nearest pixel and blends between the nearest 2 mipmaps (or uses the nearest mipmap if [member ProjectSettings.rendering/textures/default_filters/use_nearest_mipmap_filter] is `true`). This makes the texture look pixelated from up close, and smooth from a distance. */
            TEXTURE_FILTER_NEAREST_WITH_MIPMAPS = 2,
            
            /** The texture filter blends between the nearest 4 pixels and between the nearest 2 mipmaps (or uses the nearest mipmap if [member ProjectSettings.rendering/textures/default_filters/use_nearest_mipmap_filter] is `true`). This makes the texture look smooth from up close, and smooth from a distance. */
            TEXTURE_FILTER_LINEAR_WITH_MIPMAPS = 3,
            
            /** The texture filter reads from the nearest pixel and blends between 2 mipmaps (or uses the nearest mipmap if [member ProjectSettings.rendering/textures/default_filters/use_nearest_mipmap_filter] is `true`) based on the angle between the surface and the camera view. This makes the texture look pixelated from up close, and smooth from a distance. Anisotropic filtering improves texture quality on surfaces that are almost in line with the camera, but is slightly slower. The anisotropic filtering level can be changed by adjusting [member ProjectSettings.rendering/textures/default_filters/anisotropic_filtering_level]. */
            TEXTURE_FILTER_NEAREST_WITH_MIPMAPS_ANISOTROPIC = 4,
            
            /** The texture filter blends between the nearest 4 pixels and blends between 2 mipmaps (or uses the nearest mipmap if [member ProjectSettings.rendering/textures/default_filters/use_nearest_mipmap_filter] is `true`) based on the angle between the surface and the camera view. This makes the texture look smooth from up close, and smooth from a distance. Anisotropic filtering improves texture quality on surfaces that are almost in line with the camera, but is slightly slower. The anisotropic filtering level can be changed by adjusting [member ProjectSettings.rendering/textures/default_filters/anisotropic_filtering_level]. */
            TEXTURE_FILTER_LINEAR_WITH_MIPMAPS_ANISOTROPIC = 5,
            
            /** Represents the size of the [enum TextureFilter] enum. */
            TEXTURE_FILTER_MAX = 6,
        }
        enum DetailUV {
            /** Use `UV` with the detail texture. */
            DETAIL_UV_1 = 0,
            
            /** Use `UV2` with the detail texture. */
            DETAIL_UV_2 = 1,
        }
        enum Transparency {
            /** The material will not use transparency. This is the fastest to render. */
            TRANSPARENCY_DISABLED = 0,
            
            /** The material will use the texture's alpha values for transparency. This is the slowest to render, and disables shadow casting. */
            TRANSPARENCY_ALPHA = 1,
            
            /** The material will cut off all values below a threshold, the rest will remain opaque. The opaque portions will be rendered in the depth prepass. This is faster to render than alpha blending, but slower than opaque rendering. This also supports casting shadows. */
            TRANSPARENCY_ALPHA_SCISSOR = 2,
            
            /** The material will cut off all values below a spatially-deterministic threshold, the rest will remain opaque. This is faster to render than alpha blending, but slower than opaque rendering. This also supports casting shadows. Alpha hashing is suited for hair rendering. */
            TRANSPARENCY_ALPHA_HASH = 3,
            
            /** The material will use the texture's alpha value for transparency, but will discard fragments with an alpha of less than 0.99 during the depth prepass and fragments with an alpha less than 0.1 during the shadow pass. This also supports casting shadows. */
            TRANSPARENCY_ALPHA_DEPTH_PRE_PASS = 4,
            
            /** Represents the size of the [enum Transparency] enum. */
            TRANSPARENCY_MAX = 5,
        }
        enum ShadingMode {
            /** The object will not receive shadows. This is the fastest to render, but it disables all interactions with lights. */
            SHADING_MODE_UNSHADED = 0,
            
            /** The object will be shaded per pixel. Useful for realistic shading effects. */
            SHADING_MODE_PER_PIXEL = 1,
            
            /** The object will be shaded per vertex. Useful when you want cheaper shaders and do not care about visual quality. */
            SHADING_MODE_PER_VERTEX = 2,
            
            /** Represents the size of the [enum ShadingMode] enum. */
            SHADING_MODE_MAX = 3,
        }
        enum Feature {
            /** Constant for setting [member emission_enabled]. */
            FEATURE_EMISSION = 0,
            
            /** Constant for setting [member normal_enabled]. */
            FEATURE_NORMAL_MAPPING = 1,
            
            /** Constant for setting [member rim_enabled]. */
            FEATURE_RIM = 2,
            
            /** Constant for setting [member clearcoat_enabled]. */
            FEATURE_CLEARCOAT = 3,
            
            /** Constant for setting [member anisotropy_enabled]. */
            FEATURE_ANISOTROPY = 4,
            
            /** Constant for setting [member ao_enabled]. */
            FEATURE_AMBIENT_OCCLUSION = 5,
            
            /** Constant for setting [member heightmap_enabled]. */
            FEATURE_HEIGHT_MAPPING = 6,
            
            /** Constant for setting [member subsurf_scatter_enabled]. */
            FEATURE_SUBSURFACE_SCATTERING = 7,
            
            /** Constant for setting [member subsurf_scatter_transmittance_enabled]. */
            FEATURE_SUBSURFACE_TRANSMITTANCE = 8,
            
            /** Constant for setting [member backlight_enabled]. */
            FEATURE_BACKLIGHT = 9,
            
            /** Constant for setting [member refraction_enabled]. */
            FEATURE_REFRACTION = 10,
            
            /** Constant for setting [member detail_enabled]. */
            FEATURE_DETAIL = 11,
            
            /** Constant for setting [member bent_normal_enabled]. */
            FEATURE_BENT_NORMAL_MAPPING = 12,
            
            /** Represents the size of the [enum Feature] enum. */
            FEATURE_MAX = 13,
        }
        enum BlendMode {
            /** Default blend mode. The color of the object is blended over the background based on the object's alpha value. */
            BLEND_MODE_MIX = 0,
            
            /** The color of the object is added to the background. */
            BLEND_MODE_ADD = 1,
            
            /** The color of the object is subtracted from the background. */
            BLEND_MODE_SUB = 2,
            
            /** The color of the object is multiplied by the background. */
            BLEND_MODE_MUL = 3,
            
            /** The color of the object is added to the background and the alpha channel is used to mask out the background. This is effectively a hybrid of the blend mix and add modes, useful for effects like fire where you want the flame to add but the smoke to mix. By default, this works with unshaded materials using premultiplied textures. For shaded materials, use the `PREMUL_ALPHA_FACTOR` built-in so that lighting can be modulated as well. */
            BLEND_MODE_PREMULT_ALPHA = 4,
        }
        enum AlphaAntiAliasing {
            /** Disables Alpha AntiAliasing for the material. */
            ALPHA_ANTIALIASING_OFF = 0,
            
            /** Enables AlphaToCoverage. Alpha values in the material are passed to the AntiAliasing sample mask. */
            ALPHA_ANTIALIASING_ALPHA_TO_COVERAGE = 1,
            
            /** Enables AlphaToCoverage and forces all non-zero alpha values to `1`. Alpha values in the material are passed to the AntiAliasing sample mask. */
            ALPHA_ANTIALIASING_ALPHA_TO_COVERAGE_AND_TO_ONE = 2,
        }
        enum DepthDrawMode {
            /** Default depth draw mode. Depth is drawn only for opaque objects during the opaque prepass (if any) and during the opaque pass. */
            DEPTH_DRAW_OPAQUE_ONLY = 0,
            
            /** Objects will write to depth during the opaque and the transparent passes. Transparent objects that are close to the camera may obscure other transparent objects behind them.  
             *      
             *  **Note:** This does not influence whether transparent objects are included in the depth prepass or not. For that, see [enum Transparency].  
             */
            DEPTH_DRAW_ALWAYS = 1,
            
            /** Objects will not write their depth to the depth buffer, even during the depth prepass (if enabled). */
            DEPTH_DRAW_DISABLED = 2,
        }
        enum DepthTest {
            /** Depth test will discard the pixel if it is behind other pixels. */
            DEPTH_TEST_DEFAULT = 0,
            
            /** Depth test will discard the pixel if it is in front of other pixels. Useful for stencil effects. */
            DEPTH_TEST_INVERTED = 1,
        }
        enum CullMode {
            /** Default cull mode. The back of the object is culled when not visible. Back face triangles will be culled when facing the camera. This results in only the front side of triangles being drawn. For closed-surface meshes, this means that only the exterior of the mesh will be visible. */
            CULL_BACK = 0,
            
            /** Front face triangles will be culled when facing the camera. This results in only the back side of triangles being drawn. For closed-surface meshes, this means that the interior of the mesh will be drawn instead of the exterior. */
            CULL_FRONT = 1,
            
            /** No face culling is performed; both the front face and back face will be visible. */
            CULL_DISABLED = 2,
        }
        enum Flags {
            /** Disables the depth test, so this object is drawn on top of all others drawn before it. This puts the object in the transparent draw pass where it is sorted based on distance to camera. Objects drawn after it in the draw order may cover it. This also disables writing to depth. */
            FLAG_DISABLE_DEPTH_TEST = 0,
            
            /** Set `ALBEDO` to the per-vertex color specified in the mesh. */
            FLAG_ALBEDO_FROM_VERTEX_COLOR = 1,
            
            /** Vertex colors are considered to be stored in sRGB color space and are converted to linear color space during rendering. See also [member vertex_color_is_srgb].  
             *      
             *  **Note:** Only effective when using the Forward+ and Mobile rendering methods.  
             */
            FLAG_SRGB_VERTEX_COLOR = 2,
            
            /** Uses point size to alter the size of primitive points. Also changes the albedo texture lookup to use `POINT_COORD` instead of `UV`. */
            FLAG_USE_POINT_SIZE = 3,
            
            /** Object is scaled by depth so that it always appears the same size on screen. */
            FLAG_FIXED_SIZE = 4,
            
            /** Shader will keep the scale set for the mesh. Otherwise the scale is lost when billboarding. Only applies when [member billboard_mode] is [constant BILLBOARD_ENABLED]. */
            FLAG_BILLBOARD_KEEP_SCALE = 5,
            
            /** Use triplanar texture lookup for all texture lookups that would normally use `UV`. */
            FLAG_UV1_USE_TRIPLANAR = 6,
            
            /** Use triplanar texture lookup for all texture lookups that would normally use `UV2`. */
            FLAG_UV2_USE_TRIPLANAR = 7,
            
            /** Use triplanar texture lookup for all texture lookups that would normally use `UV`. */
            FLAG_UV1_USE_WORLD_TRIPLANAR = 8,
            
            /** Use triplanar texture lookup for all texture lookups that would normally use `UV2`. */
            FLAG_UV2_USE_WORLD_TRIPLANAR = 9,
            
            /** Use `UV2` coordinates to look up from the [member ao_texture]. */
            FLAG_AO_ON_UV2 = 10,
            
            /** Use `UV2` coordinates to look up from the [member emission_texture]. */
            FLAG_EMISSION_ON_UV2 = 11,
            
            /** Forces the shader to convert albedo from sRGB space to linear space. See also [member albedo_texture_force_srgb]. */
            FLAG_ALBEDO_TEXTURE_FORCE_SRGB = 12,
            
            /** Disables receiving shadows from other objects. */
            FLAG_DONT_RECEIVE_SHADOWS = 13,
            
            /** Disables receiving ambient light. */
            FLAG_DISABLE_AMBIENT_LIGHT = 14,
            
            /** Enables the shadow to opacity feature. */
            FLAG_USE_SHADOW_TO_OPACITY = 15,
            
            /** Enables the texture to repeat when UV coordinates are outside the 0-1 range. If using one of the linear filtering modes, this can result in artifacts at the edges of a texture when the sampler filters across the edges of the texture. */
            FLAG_USE_TEXTURE_REPEAT = 16,
            
            /** Invert values read from a depth texture to convert them to height values (heightmap). */
            FLAG_INVERT_HEIGHTMAP = 17,
            
            /** Enables the skin mode for subsurface scattering which is used to improve the look of subsurface scattering when used for human skin. */
            FLAG_SUBSURFACE_MODE_SKIN = 18,
            
            /** Enables parts of the shader required for [GPUParticles3D] trails to function. This also requires using a mesh with appropriate skinning, such as [RibbonTrailMesh] or [TubeTrailMesh]. Enabling this feature outside of materials used in [GPUParticles3D] meshes will break material rendering. */
            FLAG_PARTICLE_TRAILS_MODE = 19,
            
            /** Enables multichannel signed distance field rendering shader. */
            FLAG_ALBEDO_TEXTURE_MSDF = 20,
            
            /** Disables receiving depth-based or volumetric fog. */
            FLAG_DISABLE_FOG = 21,
            
            /** Disables specular occlusion. */
            FLAG_DISABLE_SPECULAR_OCCLUSION = 22,
            
            /** Enables using [member z_clip_scale]. */
            FLAG_USE_Z_CLIP_SCALE = 23,
            
            /** Enables using [member fov_override]. */
            FLAG_USE_FOV_OVERRIDE = 24,
            
            /** Represents the size of the [enum Flags] enum. */
            FLAG_MAX = 25,
        }
        enum DiffuseMode {
            /** Default diffuse scattering algorithm. */
            DIFFUSE_BURLEY = 0,
            
            /** Diffuse scattering ignores roughness. */
            DIFFUSE_LAMBERT = 1,
            
            /** Extends Lambert to cover more than 90 degrees when roughness increases. */
            DIFFUSE_LAMBERT_WRAP = 2,
            
            /** Uses a hard cut for lighting, with smoothing affected by roughness. */
            DIFFUSE_TOON = 3,
        }
        enum SpecularMode {
            /** Default specular blob.  
             *      
             *  **Note:** Forward+ uses multiscattering for more accurate reflections, although the impact of multiscattering is more noticeable on rough metallic surfaces than on smooth, non-metallic surfaces.  
             *      
             *  **Note:** Mobile and Compatibility don't perform multiscattering for performance reasons. Instead, they perform single scattering, which means rough metallic surfaces may look slightly darker than intended.  
             */
            SPECULAR_SCHLICK_GGX = 0,
            
            /** Toon blob which changes size based on roughness. */
            SPECULAR_TOON = 1,
            
            /** No specular blob. This is slightly faster to render than other specular modes. */
            SPECULAR_DISABLED = 2,
        }
        enum BillboardMode {
            /** Billboard mode is disabled. */
            BILLBOARD_DISABLED = 0,
            
            /** The object's Z axis will always face the camera. */
            BILLBOARD_ENABLED = 1,
            
            /** The object's X axis will always face the camera. */
            BILLBOARD_FIXED_Y = 2,
            
            /** Used for particle systems when assigned to [GPUParticles3D] and [CPUParticles3D] nodes (flipbook animation). Enables `particles_anim_*` properties.  
             *  The [member ParticleProcessMaterial.anim_speed_min] or [member CPUParticles3D.anim_speed_min] should also be set to a value bigger than zero for the animation to play.  
             */
            BILLBOARD_PARTICLES = 3,
        }
        enum TextureChannel {
            /** Used to read from the red channel of a texture. */
            TEXTURE_CHANNEL_RED = 0,
            
            /** Used to read from the green channel of a texture. */
            TEXTURE_CHANNEL_GREEN = 1,
            
            /** Used to read from the blue channel of a texture. */
            TEXTURE_CHANNEL_BLUE = 2,
            
            /** Used to read from the alpha channel of a texture. */
            TEXTURE_CHANNEL_ALPHA = 3,
            
            /** Used to read from the linear (non-perceptual) average of the red, green and blue channels of a texture. */
            TEXTURE_CHANNEL_GRAYSCALE = 4,
        }
        enum EmissionOperator {
            /** Adds the emission color to the color from the emission texture. */
            EMISSION_OP_ADD = 0,
            
            /** Multiplies the emission color by the color from the emission texture. */
            EMISSION_OP_MULTIPLY = 1,
        }
        enum DistanceFadeMode {
            /** Do not use distance fade. */
            DISTANCE_FADE_DISABLED = 0,
            
            /** Smoothly fades the object out based on each pixel's distance from the camera using the alpha channel. */
            DISTANCE_FADE_PIXEL_ALPHA = 1,
            
            /** Smoothly fades the object out based on each pixel's distance from the camera using a dithering approach. Dithering discards pixels based on a set pattern to smoothly fade without enabling transparency. On certain hardware, this can be faster than [constant DISTANCE_FADE_PIXEL_ALPHA]. */
            DISTANCE_FADE_PIXEL_DITHER = 2,
            
            /** Smoothly fades the object out based on the object's distance from the camera using a dithering approach. Dithering discards pixels based on a set pattern to smoothly fade without enabling transparency. On certain hardware, this can be faster than [constant DISTANCE_FADE_PIXEL_ALPHA] and [constant DISTANCE_FADE_PIXEL_DITHER]. */
            DISTANCE_FADE_OBJECT_DITHER = 3,
        }
        enum StencilMode {
            /** Disables stencil operations. */
            STENCIL_MODE_DISABLED = 0,
            
            /** Stencil preset which applies an outline to the object.  
             *      
             *  **Note:** Requires a [member Material.next_pass] material which will be automatically applied. Any manual changes made to [member Material.next_pass] will be lost when the stencil properties are modified or the scene is reloaded. To safely apply a [member Material.next_pass] material on a material that uses stencil presets, use [member GeometryInstance3D.material_overlay] instead.  
             */
            STENCIL_MODE_OUTLINE = 1,
            
            /** Stencil preset which shows a silhouette of the object behind walls.  
             *      
             *  **Note:** Requires a [member Material.next_pass] material which will be automatically applied. Any manual changes made to [member Material.next_pass] will be lost when the stencil properties are modified or the scene is reloaded. To safely apply a [member Material.next_pass] material on a material that uses stencil presets, use [member GeometryInstance3D.material_overlay] instead.  
             */
            STENCIL_MODE_XRAY = 2,
            
            /** Enables stencil operations without a preset. */
            STENCIL_MODE_CUSTOM = 3,
        }
        enum StencilFlags {
            /** The material will only be rendered where it passes a stencil comparison with existing stencil buffer values. See [enum StencilCompare]. */
            STENCIL_FLAG_READ = 1,
            
            /** The material will write the reference value to the stencil buffer where it passes the depth test. */
            STENCIL_FLAG_WRITE = 2,
            
            /** The material will write the reference value to the stencil buffer where it fails the depth test. */
            STENCIL_FLAG_WRITE_DEPTH_FAIL = 4,
        }
        enum StencilCompare {
            /** Always passes the stencil test. */
            STENCIL_COMPARE_ALWAYS = 0,
            
            /** Passes the stencil test when the reference value is less than the existing stencil value. */
            STENCIL_COMPARE_LESS = 1,
            
            /** Passes the stencil test when the reference value is equal to the existing stencil value. */
            STENCIL_COMPARE_EQUAL = 2,
            
            /** Passes the stencil test when the reference value is less than or equal to the existing stencil value. */
            STENCIL_COMPARE_LESS_OR_EQUAL = 3,
            
            /** Passes the stencil test when the reference value is greater than the existing stencil value. */
            STENCIL_COMPARE_GREATER = 4,
            
            /** Passes the stencil test when the reference value is not equal to the existing stencil value. */
            STENCIL_COMPARE_NOT_EQUAL = 5,
            
            /** Passes the stencil test when the reference value is greater than or equal to the existing stencil value. */
            STENCIL_COMPARE_GREATER_OR_EQUAL = 6,
        }
    }
    /** @deprecated Internal use. Does not exist at runtime. */
    interface __NameMapBaseMaterial3D extends __NameMapMaterial {
    }
    /** Abstract base class for defining the 3D rendering properties of meshes.  
     *  	  
     *  @link https://docs.godotengine.org/en/4.5/classes/class_basematerial3d.html  
     */
    class BaseMaterial3D extends Material {
        constructor(identifier?: any)
        /** If `true`, enables the specified flag. Flags are optional behavior that can be turned on and off. Only one flag can be enabled at a time with this function, the flag enumerators cannot be bit-masked together to enable or disable multiple flags at once. Flags can also be enabled by setting the corresponding member to `true`. */
        set_flag(flag: BaseMaterial3D.Flags, enable: boolean): void
        
        /** Returns `true` if the specified flag is enabled. */
        get_flag(flag: BaseMaterial3D.Flags): boolean
        
        /** If `true`, enables the specified [enum Feature]. Many features that are available in [BaseMaterial3D]s need to be enabled before use. This way the cost for using the feature is only incurred when specified. Features can also be enabled by setting the corresponding member to `true`. */
        set_feature(feature: BaseMaterial3D.Feature, enable: boolean): void
        
        /** Returns `true`, if the specified [enum Feature] is enabled. */
        get_feature(feature: BaseMaterial3D.Feature): boolean
        
        /** Sets the texture for the slot specified by [param param]. */
        set_texture(param: BaseMaterial3D.TextureParam, texture: Texture2D): void
        
        /** Returns the [Texture2D] associated with the specified [enum TextureParam]. */
        get_texture(param: BaseMaterial3D.TextureParam): null | Texture2D
        
        /** The material's transparency mode. Some transparency modes will disable shadow casting. Any transparency mode other than [constant TRANSPARENCY_DISABLED] has a greater performance impact compared to opaque rendering. See also [member blend_mode]. */
        get transparency(): int64
        set transparency(value: int64)
        
        /** Threshold at which the alpha scissor will discard values. Higher values will result in more pixels being discarded. If the material becomes too opaque at a distance, try increasing [member alpha_scissor_threshold]. If the material disappears at a distance, try decreasing [member alpha_scissor_threshold]. */
        get alpha_scissor_threshold(): float64
        set alpha_scissor_threshold(value: float64)
        
        /** The hashing scale for Alpha Hash. Recommended values between `0` and `2`. */
        get alpha_hash_scale(): float64
        set alpha_hash_scale(value: float64)
        
        /** The type of alpha antialiasing to apply. */
        get alpha_antialiasing_mode(): int64
        set alpha_antialiasing_mode(value: int64)
        
        /** Threshold at which antialiasing will be applied on the alpha channel. */
        get alpha_antialiasing_edge(): float64
        set alpha_antialiasing_edge(value: float64)
        
        /** The material's blend mode.  
         *      
         *  **Note:** Values other than `Mix` force the object into the transparent pipeline.  
         */
        get blend_mode(): int64
        set blend_mode(value: int64)
        
        /** Determines which side of the triangle to cull depending on whether the triangle faces towards or away from the camera. */
        get cull_mode(): int64
        set cull_mode(value: int64)
        
        /** Determines when depth rendering takes place. See also [member transparency]. */
        get depth_draw_mode(): int64
        set depth_draw_mode(value: int64)
        
        /** If `true`, depth testing is disabled and the object will be drawn in render order. */
        get no_depth_test(): boolean
        set no_depth_test(value: boolean)
        
        /** Determines which comparison operator is used when testing depth. See [enum DepthTest].  
         *      
         *  **Note:** Changing [member depth_test] to a non-default value only has a visible effect when used on a transparent material, or a material that has [member depth_draw_mode] set to [constant DEPTH_DRAW_DISABLED].  
         */
        get depth_test(): int64
        set depth_test(value: int64)
        
        /** Sets whether the shading takes place, per-pixel, per-vertex or unshaded. Per-vertex lighting is faster, making it the best choice for mobile applications, however it looks considerably worse than per-pixel. Unshaded rendering is the fastest, but disables all interactions with lights. */
        get shading_mode(): int64
        set shading_mode(value: int64)
        
        /** The algorithm used for diffuse light scattering. */
        get diffuse_mode(): int64
        set diffuse_mode(value: int64)
        
        /** The method for rendering the specular blob.  
         *      
         *  **Note:** [member specular_mode] only applies to the specular blob. It does not affect specular reflections from the sky, screen-space reflections, [VoxelGI], SDFGI or [ReflectionProbe]s. To disable reflections from these sources as well, set [member metallic_specular] to `0.0` instead.  
         */
        get specular_mode(): int64
        set specular_mode(value: int64)
        
        /** If `true`, the object receives no ambient light. */
        get disable_ambient_light(): boolean
        set disable_ambient_light(value: boolean)
        
        /** If `true`, the object will not be affected by fog (neither volumetric nor depth fog). This is useful for unshaded or transparent materials (e.g. particles), which without this setting will be affected even if fully transparent. */
        get disable_fog(): boolean
        set disable_fog(value: boolean)
        
        /** If `true`, disables specular occlusion even if [member ProjectSettings.rendering/reflections/specular_occlusion/enabled] is `false`. */
        get disable_specular_occlusion(): boolean
        set disable_specular_occlusion(value: boolean)
        
        /** If `true`, the vertex color is used as albedo color. */
        get vertex_color_use_as_albedo(): boolean
        set vertex_color_use_as_albedo(value: boolean)
        
        /** If `true`, vertex colors are considered to be stored in sRGB color space and are converted to linear color space during rendering. If `false`, vertex colors are considered to be stored in linear color space and are rendered as-is. See also [member albedo_texture_force_srgb].  
         *      
         *  **Note:** Only effective when using the Forward+ and Mobile rendering methods, not Compatibility.  
         */
        get vertex_color_is_srgb(): boolean
        set vertex_color_is_srgb(value: boolean)
        
        /** The material's base color.  
         *      
         *  **Note:** If [member detail_enabled] is `true` and a [member detail_albedo] texture is specified, [member albedo_color] will  *not*  modulate the detail texture. This can be used to color partial areas of a material by not specifying an albedo texture and using a transparent [member detail_albedo] texture instead.  
         */
        get albedo_color(): Color
        set albedo_color(value: Color)
        
        /** Texture to multiply by [member albedo_color]. Used for basic texturing of objects.  
         *  If the texture appears unexpectedly too dark or too bright, check [member albedo_texture_force_srgb].  
         */
        get albedo_texture(): null | Texture2D
        set albedo_texture(value: null | Texture2D)
        
        /** If `true`, forces a conversion of the [member albedo_texture] from sRGB color space to linear color space. See also [member vertex_color_is_srgb].  
         *  This should only be enabled when needed (typically when using a [ViewportTexture] as [member albedo_texture]). If [member albedo_texture_force_srgb] is `true` when it shouldn't be, the texture will appear to be too dark. If [member albedo_texture_force_srgb] is `false` when it shouldn't be, the texture will appear to be too bright.  
         */
        get albedo_texture_force_srgb(): boolean
        set albedo_texture_force_srgb(value: boolean)
        
        /** Enables multichannel signed distance field rendering shader. Use [member msdf_pixel_range] and [member msdf_outline_size] to configure MSDF parameters. */
        get albedo_texture_msdf(): boolean
        set albedo_texture_msdf(value: boolean)
        
        /** The Occlusion/Roughness/Metallic texture to use. This is a more efficient replacement of [member ao_texture], [member roughness_texture] and [member metallic_texture] in [ORMMaterial3D]. Ambient occlusion is stored in the red channel. Roughness map is stored in the green channel. Metallic map is stored in the blue channel. The alpha channel is ignored. */
        get orm_texture(): null | Texture2D
        set orm_texture(value: null | Texture2D)
        
        /** A high value makes the material appear more like a metal. Non-metals use their albedo as the diffuse color and add diffuse to the specular reflection. With non-metals, the reflection appears on top of the albedo color. Metals use their albedo as a multiplier to the specular reflection and set the diffuse color to black resulting in a tinted reflection. Materials work better when fully metal or fully non-metal, values between `0` and `1` should only be used for blending between metal and non-metal sections. To alter the amount of reflection use [member roughness]. */
        get metallic(): float64
        set metallic(value: float64)
        
        /** Adjusts the strength of specular reflections. Specular reflections are composed of scene reflections and the specular lobe which is the bright spot that is reflected from light sources. When set to `0.0`, no specular reflections will be visible. This differs from the [constant SPECULAR_DISABLED] [enum SpecularMode] as [constant SPECULAR_DISABLED] only applies to the specular lobe from the light source.  
         *      
         *  **Note:** Unlike [member metallic], this is not energy-conserving, so it should be left at `0.5` in most cases. See also [member roughness].  
         */
        get metallic_specular(): float64
        set metallic_specular(value: float64)
        
        /** Texture used to specify metallic for an object. This is multiplied by [member metallic]. */
        get metallic_texture(): null | Texture2D
        set metallic_texture(value: null | Texture2D)
        
        /** Specifies the channel of the [member metallic_texture] in which the metallic information is stored. This is useful when you store the information for multiple effects in a single texture. For example if you stored metallic in the red channel, roughness in the blue, and ambient occlusion in the green you could reduce the number of textures you use. */
        get metallic_texture_channel(): int64
        set metallic_texture_channel(value: int64)
        
        /** Surface reflection. A value of `0` represents a perfect mirror while a value of `1` completely blurs the reflection. See also [member metallic]. */
        get roughness(): float64
        set roughness(value: float64)
        
        /** Texture used to control the roughness per-pixel. Multiplied by [member roughness]. */
        get roughness_texture(): null | Texture2D
        set roughness_texture(value: null | Texture2D)
        
        /** Specifies the channel of the [member roughness_texture] in which the roughness information is stored. This is useful when you store the information for multiple effects in a single texture. For example if you stored metallic in the red channel, roughness in the blue, and ambient occlusion in the green you could reduce the number of textures you use. */
        get roughness_texture_channel(): int64
        set roughness_texture_channel(value: int64)
        
        /** If `true`, the body emits light. Emitting light makes the object appear brighter. The object can also cast light on other objects if a [VoxelGI], SDFGI, or [LightmapGI] is used and this object is used in baked lighting. */
        get emission_enabled(): boolean
        set emission_enabled(value: boolean)
        
        /** The emitted light's color. See [member emission_enabled]. */
        get emission(): Color
        set emission(value: Color)
        
        /** Multiplier for emitted light. See [member emission_enabled]. */
        get emission_energy_multiplier(): float64
        set emission_energy_multiplier(value: float64)
        
        /** Luminance of emitted light, measured in nits (candela per square meter). Only available when [member ProjectSettings.rendering/lights_and_shadows/use_physical_light_units] is enabled. The default is roughly equivalent to an indoor lightbulb. */
        get emission_intensity(): float64
        set emission_intensity(value: float64)
        
        /** Sets how [member emission] interacts with [member emission_texture]. Can either add or multiply. */
        get emission_operator(): int64
        set emission_operator(value: int64)
        
        /** Use `UV2` to read from the [member emission_texture]. */
        get emission_on_uv2(): boolean
        set emission_on_uv2(value: boolean)
        
        /** Texture that specifies how much surface emits light at a given point. */
        get emission_texture(): null | Texture2D
        set emission_texture(value: null | Texture2D)
        
        /** If `true`, normal mapping is enabled. This has a slight performance cost, especially on mobile GPUs. */
        get normal_enabled(): boolean
        set normal_enabled(value: boolean)
        
        /** The strength of the normal map's effect. */
        get normal_scale(): float64
        set normal_scale(value: float64)
        
        /** Texture used to specify the normal at a given pixel. The [member normal_texture] only uses the red and green channels; the blue and alpha channels are ignored. The normal read from [member normal_texture] is oriented around the surface normal provided by the [Mesh].  
         *      
         *  **Note:** The mesh must have both normals and tangents defined in its vertex data. Otherwise, the normal map won't render correctly and will only appear to darken the whole surface. If creating geometry with [SurfaceTool], you can use [method SurfaceTool.generate_normals] and [method SurfaceTool.generate_tangents] to automatically generate normals and tangents respectively.  
         *      
         *  **Note:** Godot expects the normal map to use X+, Y+, and Z+ coordinates. See [url=http://wiki.polycount.com/wiki/Normal_Map_Technical_Details#Common_Swizzle_Coordinates]this page[/url] for a comparison of normal map coordinates expected by popular engines.  
         *      
         *  **Note:** If [member detail_enabled] is `true`, the [member detail_albedo] texture is drawn  *below*  the [member normal_texture]. To display a normal map  *above*  the [member detail_albedo] texture, use [member detail_normal] instead.  
         */
        get normal_texture(): null | Texture2D
        set normal_texture(value: null | Texture2D)
        
        /** If `true`, the bent normal map is enabled. This allows for more accurate indirect lighting and specular occlusion. */
        get bent_normal_enabled(): boolean
        set bent_normal_enabled(value: boolean)
        
        /** Texture that specifies the average direction of incoming ambient light at a given pixel. The [member bent_normal_texture] only uses the red and green channels; the blue and alpha channels are ignored. The normal read from [member bent_normal_texture] is oriented around the surface normal provided by the [Mesh].  
         *      
         *  **Note:** A bent normal map is different from a regular normal map. When baking a bent normal map make sure to use **a cosine distribution** for the bent normal map to work correctly.  
         *      
         *  **Note:** The mesh must have both normals and tangents defined in its vertex data. Otherwise, the shading produced by the bent normal map will not look correct. If creating geometry with [SurfaceTool], you can use [method SurfaceTool.generate_normals] and [method SurfaceTool.generate_tangents] to automatically generate normals and tangents respectively.  
         *      
         *  **Note:** Godot expects the bent normal map to use X+, Y+, and Z+ coordinates. See [url=http://wiki.polycount.com/wiki/Normal_Map_Technical_Details#Common_Swizzle_Coordinates]this page[/url] for a comparison of normal map coordinates expected by popular engines.  
         */
        get bent_normal_texture(): null | Texture2D
        set bent_normal_texture(value: null | Texture2D)
        
        /** If `true`, rim effect is enabled. Rim lighting increases the brightness at glancing angles on an object.  
         *      
         *  **Note:** Rim lighting is not visible if the material's [member shading_mode] is [constant SHADING_MODE_UNSHADED].  
         */
        get rim_enabled(): boolean
        set rim_enabled(value: boolean)
        
        /** Sets the strength of the rim lighting effect. */
        get rim(): float64
        set rim(value: float64)
        
        /** The amount of to blend light and albedo color when rendering rim effect. If `0` the light color is used, while `1` means albedo color is used. An intermediate value generally works best. */
        get rim_tint(): float64
        set rim_tint(value: float64)
        
        /** Texture used to set the strength of the rim lighting effect per-pixel. Multiplied by [member rim]. */
        get rim_texture(): null | Texture2D
        set rim_texture(value: null | Texture2D)
        
        /** If `true`, clearcoat rendering is enabled. Adds a secondary transparent pass to the lighting calculation resulting in an added specular blob. This makes materials appear as if they have a clear layer on them that can be either glossy or rough.  
         *      
         *  **Note:** Clearcoat rendering is not visible if the material's [member shading_mode] is [constant SHADING_MODE_UNSHADED].  
         */
        get clearcoat_enabled(): boolean
        set clearcoat_enabled(value: boolean)
        
        /** Sets the strength of the clearcoat effect. Setting to `0` looks the same as disabling the clearcoat effect. */
        get clearcoat(): float64
        set clearcoat(value: float64)
        
        /** Sets the roughness of the clearcoat pass. A higher value results in a rougher clearcoat while a lower value results in a smoother clearcoat. */
        get clearcoat_roughness(): float64
        set clearcoat_roughness(value: float64)
        
        /** Texture that defines the strength of the clearcoat effect and the glossiness of the clearcoat. Strength is specified in the red channel while glossiness is specified in the green channel. */
        get clearcoat_texture(): null | Texture2D
        set clearcoat_texture(value: null | Texture2D)
        
        /** If `true`, anisotropy is enabled. Anisotropy changes the shape of the specular blob and aligns it to tangent space. This is useful for brushed aluminum and hair reflections.  
         *      
         *  **Note:** Mesh tangents are needed for anisotropy to work. If the mesh does not contain tangents, the anisotropy effect will appear broken.  
         *      
         *  **Note:** Material anisotropy should not to be confused with anisotropic texture filtering, which can be enabled by setting [member texture_filter] to [constant TEXTURE_FILTER_LINEAR_WITH_MIPMAPS_ANISOTROPIC].  
         */
        get anisotropy_enabled(): boolean
        set anisotropy_enabled(value: boolean)
        
        /** The strength of the anisotropy effect. This is multiplied by [member anisotropy_flowmap]'s alpha channel if a texture is defined there and the texture contains an alpha channel. */
        get anisotropy(): float64
        set anisotropy(value: float64)
        
        /** Texture that offsets the tangent map for anisotropy calculations and optionally controls the anisotropy effect (if an alpha channel is present). The flowmap texture is expected to be a derivative map, with the red channel representing distortion on the X axis and green channel representing distortion on the Y axis. Values below 0.5 will result in negative distortion, whereas values above 0.5 will result in positive distortion.  
         *  If present, the texture's alpha channel will be used to multiply the strength of the [member anisotropy] effect. Fully opaque pixels will keep the anisotropy effect's original strength while fully transparent pixels will disable the anisotropy effect entirely. The flowmap texture's blue channel is ignored.  
         */
        get anisotropy_flowmap(): null | Texture2D
        set anisotropy_flowmap(value: null | Texture2D)
        
        /** If `true`, ambient occlusion is enabled. Ambient occlusion darkens areas based on the [member ao_texture]. */
        get ao_enabled(): boolean
        set ao_enabled(value: boolean)
        
        /** Amount that ambient occlusion affects lighting from lights. If `0`, ambient occlusion only affects ambient light. If `1`, ambient occlusion affects lights just as much as it affects ambient light. This can be used to impact the strength of the ambient occlusion effect, but typically looks unrealistic. */
        get ao_light_affect(): float64
        set ao_light_affect(value: float64)
        
        /** Texture that defines the amount of ambient occlusion for a given point on the object. */
        get ao_texture(): null | Texture2D
        set ao_texture(value: null | Texture2D)
        
        /** If `true`, use `UV2` coordinates to look up from the [member ao_texture]. */
        get ao_on_uv2(): boolean
        set ao_on_uv2(value: boolean)
        
        /** Specifies the channel of the [member ao_texture] in which the ambient occlusion information is stored. This is useful when you store the information for multiple effects in a single texture. For example if you stored metallic in the red channel, roughness in the blue, and ambient occlusion in the green you could reduce the number of textures you use. */
        get ao_texture_channel(): int64
        set ao_texture_channel(value: int64)
        
        /** If `true`, height mapping is enabled (also called "parallax mapping" or "depth mapping"). See also [member normal_enabled]. Height mapping is a demanding feature on the GPU, so it should only be used on materials where it makes a significant visual difference.  
         *      
         *  **Note:** Height mapping is not supported if triplanar mapping is used on the same material. The value of [member heightmap_enabled] will be ignored if [member uv1_triplanar] is enabled.  
         */
        get heightmap_enabled(): boolean
        set heightmap_enabled(value: boolean)
        
        /** The heightmap scale to use for the parallax effect (see [member heightmap_enabled]). The default value is tuned so that the highest point (value = 255) appears to be 5 cm higher than the lowest point (value = 0). Higher values result in a deeper appearance, but may result in artifacts appearing when looking at the material from oblique angles, especially when the camera moves. Negative values can be used to invert the parallax effect, but this is different from inverting the texture using [member heightmap_flip_texture] as the material will also appear to be "closer" to the camera. In most cases, [member heightmap_scale] should be kept to a positive value.  
         *      
         *  **Note:** If the height map effect looks strange regardless of this value, try adjusting [member heightmap_flip_binormal] and [member heightmap_flip_tangent]. See also [member heightmap_texture] for recommendations on authoring heightmap textures, as the way the heightmap texture is authored affects how [member heightmap_scale] behaves.  
         */
        get heightmap_scale(): float64
        set heightmap_scale(value: float64)
        
        /** If `true`, uses parallax occlusion mapping to represent depth in the material instead of simple offset mapping (see [member heightmap_enabled]). This results in a more convincing depth effect, but is much more expensive on the GPU. Only enable this on materials where it makes a significant visual difference. */
        get heightmap_deep_parallax(): boolean
        set heightmap_deep_parallax(value: boolean)
        
        /** The number of layers to use for parallax occlusion mapping when the camera is far away from the material. Higher values result in a more convincing depth effect, especially in materials that have steep height changes. Higher values have a significant cost on the GPU, so it should only be increased on materials where it makes a significant visual difference.  
         *      
         *  **Note:** Only effective if [member heightmap_deep_parallax] is `true`.  
         */
        get heightmap_min_layers(): int64
        set heightmap_min_layers(value: int64)
        
        /** The number of layers to use for parallax occlusion mapping when the camera is up close to the material. Higher values result in a more convincing depth effect, especially in materials that have steep height changes. Higher values have a significant cost on the GPU, so it should only be increased on materials where it makes a significant visual difference.  
         *      
         *  **Note:** Only effective if [member heightmap_deep_parallax] is `true`.  
         */
        get heightmap_max_layers(): int64
        set heightmap_max_layers(value: int64)
        
        /** If `true`, flips the mesh's tangent vectors when interpreting the height map. If the heightmap effect looks strange when the camera moves (even with a reasonable [member heightmap_scale]), try setting this to `true`. */
        get heightmap_flip_tangent(): boolean
        set heightmap_flip_tangent(value: boolean)
        
        /** If `true`, flips the mesh's binormal vectors when interpreting the height map. If the heightmap effect looks strange when the camera moves (even with a reasonable [member heightmap_scale]), try setting this to `true`. */
        get heightmap_flip_binormal(): boolean
        set heightmap_flip_binormal(value: boolean)
        
        /** The texture to use as a height map. See also [member heightmap_enabled].  
         *  For best results, the texture should be normalized (with [member heightmap_scale] reduced to compensate). In [url=https://gimp.org]GIMP[/url], this can be done using **Colors > Auto > Equalize**. If the texture only uses a small part of its available range, the parallax effect may look strange, especially when the camera moves.  
         *      
         *  **Note:** To reduce memory usage and improve loading times, you may be able to use a lower-resolution heightmap texture as most heightmaps are only comprised of low-frequency data.  
         */
        get heightmap_texture(): null | Texture2D
        set heightmap_texture(value: null | Texture2D)
        
        /** If `true`, interprets the height map texture as a depth map, with brighter values appearing to be "lower" in altitude compared to darker values.  
         *  This can be enabled for compatibility with some materials authored for Godot 3.x. This is not necessary if the Invert import option was used to invert the depth map in Godot 3.x, in which case [member heightmap_flip_texture] should remain `false`.  
         */
        get heightmap_flip_texture(): boolean
        set heightmap_flip_texture(value: boolean)
        
        /** If `true`, subsurface scattering is enabled. Emulates light that penetrates an object's surface, is scattered, and then emerges. Subsurface scattering quality is controlled by [member ProjectSettings.rendering/environment/subsurface_scattering/subsurface_scattering_quality].  
         *      
         *  **Note:** Subsurface scattering is not supported on viewports that have a transparent background (where [member Viewport.transparent_bg] is `true`).  
         */
        get subsurf_scatter_enabled(): boolean
        set subsurf_scatter_enabled(value: boolean)
        
        /** The strength of the subsurface scattering effect. The depth of the effect is also controlled by [member ProjectSettings.rendering/environment/subsurface_scattering/subsurface_scattering_scale], which is set globally. */
        get subsurf_scatter_strength(): float64
        set subsurf_scatter_strength(value: float64)
        
        /** If `true`, subsurface scattering will use a special mode optimized for the color and density of human skin, such as boosting the intensity of the red channel in subsurface scattering. */
        get subsurf_scatter_skin_mode(): boolean
        set subsurf_scatter_skin_mode(value: boolean)
        
        /** Texture used to control the subsurface scattering strength. Stored in the red texture channel. Multiplied by [member subsurf_scatter_strength]. */
        get subsurf_scatter_texture(): null | Texture2D
        set subsurf_scatter_texture(value: null | Texture2D)
        
        /** If `true`, enables subsurface scattering transmittance. Only effective if [member subsurf_scatter_enabled] is `true`. See also [member backlight_enabled]. */
        get subsurf_scatter_transmittance_enabled(): boolean
        set subsurf_scatter_transmittance_enabled(value: boolean)
        
        /** The color to multiply the subsurface scattering transmittance effect with. Ignored if [member subsurf_scatter_skin_mode] is `true`. */
        get subsurf_scatter_transmittance_color(): Color
        set subsurf_scatter_transmittance_color(value: Color)
        
        /** The texture to use for multiplying the intensity of the subsurface scattering transmittance intensity. See also [member subsurf_scatter_texture]. Ignored if [member subsurf_scatter_skin_mode] is `true`. */
        get subsurf_scatter_transmittance_texture(): null | Texture2D
        set subsurf_scatter_transmittance_texture(value: null | Texture2D)
        
        /** The depth of the subsurface scattering transmittance effect. */
        get subsurf_scatter_transmittance_depth(): float64
        set subsurf_scatter_transmittance_depth(value: float64)
        
        /** The intensity of the subsurface scattering transmittance effect. */
        get subsurf_scatter_transmittance_boost(): float64
        set subsurf_scatter_transmittance_boost(value: float64)
        
        /** If `true`, the backlight effect is enabled. See also [member subsurf_scatter_transmittance_enabled]. */
        get backlight_enabled(): boolean
        set backlight_enabled(value: boolean)
        
        /** The color used by the backlight effect. Represents the light passing through an object. */
        get backlight(): Color
        set backlight(value: Color)
        
        /** Texture used to control the backlight effect per-pixel. Added to [member backlight]. */
        get backlight_texture(): null | Texture2D
        set backlight_texture(value: null | Texture2D)
        
        /** If `true`, the refraction effect is enabled. Distorts transparency based on light from behind the object.  
         *      
         *  **Note:** Refraction is implemented using the screen texture. Only opaque materials will appear in the refraction, since transparent materials do not appear in the screen texture.  
         */
        get refraction_enabled(): boolean
        set refraction_enabled(value: boolean)
        
        /** The strength of the refraction effect. */
        get refraction_scale(): float64
        set refraction_scale(value: float64)
        
        /** Texture that controls the strength of the refraction per-pixel. Multiplied by [member refraction_scale]. */
        get refraction_texture(): null | Texture2D
        set refraction_texture(value: null | Texture2D)
        
        /** Specifies the channel of the [member refraction_texture] in which the refraction information is stored. This is useful when you store the information for multiple effects in a single texture. For example if you stored refraction in the red channel, roughness in the blue, and ambient occlusion in the green you could reduce the number of textures you use. */
        get refraction_texture_channel(): int64
        set refraction_texture_channel(value: int64)
        
        /** If `true`, enables the detail overlay. Detail is a second texture that gets mixed over the surface of the object based on [member detail_mask] and [member detail_albedo]'s alpha channel. This can be used to add variation to objects, or to blend between two different albedo/normal textures. */
        get detail_enabled(): boolean
        set detail_enabled(value: boolean)
        
        /** Texture used to specify how the detail textures get blended with the base textures. [member detail_mask] can be used together with [member detail_albedo]'s alpha channel (if any). */
        get detail_mask(): null | Texture2D
        set detail_mask(value: null | Texture2D)
        
        /** Specifies how the [member detail_albedo] should blend with the current `ALBEDO`. */
        get detail_blend_mode(): int64
        set detail_blend_mode(value: int64)
        
        /** Specifies whether to use `UV` or `UV2` for the detail layer. */
        get detail_uv_layer(): int64
        set detail_uv_layer(value: int64)
        
        /** Texture that specifies the color of the detail overlay. [member detail_albedo]'s alpha channel is used as a mask, even when the material is opaque. To use a dedicated texture as a mask, see [member detail_mask].  
         *      
         *  **Note:** [member detail_albedo] is  *not*  modulated by [member albedo_color].  
         */
        get detail_albedo(): null | Texture2D
        set detail_albedo(value: null | Texture2D)
        
        /** Texture that specifies the per-pixel normal of the detail overlay. The [member detail_normal] texture only uses the red and green channels; the blue and alpha channels are ignored. The normal read from [member detail_normal] is oriented around the surface normal provided by the [Mesh].  
         *      
         *  **Note:** Godot expects the normal map to use X+, Y+, and Z+ coordinates. See [url=http://wiki.polycount.com/wiki/Normal_Map_Technical_Details#Common_Swizzle_Coordinates]this page[/url] for a comparison of normal map coordinates expected by popular engines.  
         */
        get detail_normal(): null | Texture2D
        set detail_normal(value: null | Texture2D)
        
        /** How much to scale the `UV` coordinates. This is multiplied by `UV` in the vertex function. The Z component is used when [member uv1_triplanar] is enabled, but it is not used anywhere else. */
        get uv1_scale(): Vector3
        set uv1_scale(value: Vector3)
        
        /** How much to offset the `UV` coordinates. This amount will be added to `UV` in the vertex function. This can be used to offset a texture. The Z component is used when [member uv1_triplanar] is enabled, but it is not used anywhere else. */
        get uv1_offset(): Vector3
        set uv1_offset(value: Vector3)
        
        /** If `true`, instead of using `UV` textures will use a triplanar texture lookup to determine how to apply textures. Triplanar uses the orientation of the object's surface to blend between texture coordinates. It reads from the source texture 3 times, once for each axis and then blends between the results based on how closely the pixel aligns with each axis. This is often used for natural features to get a realistic blend of materials. Because triplanar texturing requires many more texture reads per-pixel it is much slower than normal UV texturing. Additionally, because it is blending the texture between the three axes, it is unsuitable when you are trying to achieve crisp texturing. */
        get uv1_triplanar(): boolean
        set uv1_triplanar(value: boolean)
        
        /** A lower number blends the texture more softly while a higher number blends the texture more sharply.  
         *      
         *  **Note:** [member uv1_triplanar_sharpness] is clamped between `0.0` and `150.0` (inclusive) as values outside that range can look broken depending on the mesh.  
         */
        get uv1_triplanar_sharpness(): float64
        set uv1_triplanar_sharpness(value: float64)
        
        /** If `true`, triplanar mapping for `UV` is calculated in world space rather than object local space. See also [member uv1_triplanar]. */
        get uv1_world_triplanar(): boolean
        set uv1_world_triplanar(value: boolean)
        
        /** How much to scale the `UV2` coordinates. This is multiplied by `UV2` in the vertex function. The Z component is used when [member uv2_triplanar] is enabled, but it is not used anywhere else. */
        get uv2_scale(): Vector3
        set uv2_scale(value: Vector3)
        
        /** How much to offset the `UV2` coordinates. This amount will be added to `UV2` in the vertex function. This can be used to offset a texture. The Z component is used when [member uv2_triplanar] is enabled, but it is not used anywhere else. */
        get uv2_offset(): Vector3
        set uv2_offset(value: Vector3)
        
        /** If `true`, instead of using `UV2` textures will use a triplanar texture lookup to determine how to apply textures. Triplanar uses the orientation of the object's surface to blend between texture coordinates. It reads from the source texture 3 times, once for each axis and then blends between the results based on how closely the pixel aligns with each axis. This is often used for natural features to get a realistic blend of materials. Because triplanar texturing requires many more texture reads per-pixel it is much slower than normal UV texturing. Additionally, because it is blending the texture between the three axes, it is unsuitable when you are trying to achieve crisp texturing. */
        get uv2_triplanar(): boolean
        set uv2_triplanar(value: boolean)
        
        /** A lower number blends the texture more softly while a higher number blends the texture more sharply.  
         *      
         *  **Note:** [member uv2_triplanar_sharpness] is clamped between `0.0` and `150.0` (inclusive) as values outside that range can look broken depending on the mesh.  
         */
        get uv2_triplanar_sharpness(): float64
        set uv2_triplanar_sharpness(value: float64)
        
        /** If `true`, triplanar mapping for `UV2` is calculated in world space rather than object local space. See also [member uv2_triplanar]. */
        get uv2_world_triplanar(): boolean
        set uv2_world_triplanar(value: boolean)
        
        /** Filter flags for the texture.  
         *      
         *  **Note:** [member heightmap_texture] is always sampled with linear filtering, even if nearest-neighbor filtering is selected here. This is to ensure the heightmap effect looks as intended. If you need sharper height transitions between pixels, resize the heightmap texture in an image editor with nearest-neighbor filtering.  
         */
        get texture_filter(): int64
        set texture_filter(value: int64)
        
        /** If `true`, the texture repeats when exceeding the texture's size. See [constant FLAG_USE_TEXTURE_REPEAT]. */
        get texture_repeat(): boolean
        set texture_repeat(value: boolean)
        
        /** If `true`, the object receives no shadow that would otherwise be cast onto it. */
        get disable_receive_shadows(): boolean
        set disable_receive_shadows(value: boolean)
        
        /** If `true`, enables the "shadow to opacity" render mode where lighting modifies the alpha so shadowed areas are opaque and non-shadowed areas are transparent. Useful for overlaying shadows onto a camera feed in AR. */
        get shadow_to_opacity(): boolean
        set shadow_to_opacity(value: boolean)
        
        /** Controls how the object faces the camera.  
         *      
         *  **Note:** Billboard mode is not suitable for VR because the left-right vector of the camera is not horizontal when the screen is attached to your head instead of on the table. See [url=https://github.com/godotengine/godot/issues/41567]GitHub issue #41567[/url] for details.  
         */
        get billboard_mode(): int64
        set billboard_mode(value: int64)
        
        /** If `true`, the shader will keep the scale set for the mesh. Otherwise, the scale is lost when billboarding. Only applies when [member billboard_mode] is not [constant BILLBOARD_DISABLED]. */
        get billboard_keep_scale(): boolean
        set billboard_keep_scale(value: boolean)
        
        /** The number of horizontal frames in the particle sprite sheet. Only enabled when using [constant BILLBOARD_PARTICLES]. See [member billboard_mode]. */
        get particles_anim_h_frames(): int64
        set particles_anim_h_frames(value: int64)
        
        /** The number of vertical frames in the particle sprite sheet. Only enabled when using [constant BILLBOARD_PARTICLES]. See [member billboard_mode]. */
        get particles_anim_v_frames(): int64
        set particles_anim_v_frames(value: int64)
        
        /** If `true`, particle animations are looped. Only enabled when using [constant BILLBOARD_PARTICLES]. See [member billboard_mode]. */
        get particles_anim_loop(): boolean
        set particles_anim_loop(value: boolean)
        
        /** If `true`, enables the vertex grow setting. This can be used to create mesh-based outlines using a second material pass and its [member cull_mode] set to [constant CULL_FRONT]. See also [member grow_amount].  
         *      
         *  **Note:** Vertex growth cannot create new vertices, which means that visible gaps may occur in sharp corners. This can be alleviated by designing the mesh to use smooth normals exclusively using [url=http://wiki.polycount.com/wiki/Face_weighted_normals]face weighted normals[/url] in the 3D authoring software. In this case, grow will be able to join every outline together, just like in the original mesh.  
         */
        get grow(): boolean
        set grow(value: boolean)
        
        /** Grows object vertices in the direction of their normals. Only effective if [member grow] is `true`. */
        get grow_amount(): float64
        set grow_amount(value: float64)
        
        /** If `true`, the object is rendered at the same size regardless of distance. The object's size on screen is the same as if the camera was `1.0` units away from the object's origin, regardless of the actual distance from the camera. The [Camera3D]'s field of view (or [member Camera3D.size] when in orthogonal/frustum mode) still affects the size the object is drawn at. */
        get fixed_size(): boolean
        set fixed_size(value: boolean)
        
        /** If `true`, render point size can be changed.  
         *      
         *  **Note:** This is only effective for objects whose geometry is point-based rather than triangle-based. See also [member point_size].  
         */
        get use_point_size(): boolean
        set use_point_size(value: boolean)
        
        /** The point size in pixels. See [member use_point_size]. */
        get point_size(): float64
        set point_size(value: float64)
        
        /** If `true`, enables parts of the shader required for [GPUParticles3D] trails to function. This also requires using a mesh with appropriate skinning, such as [RibbonTrailMesh] or [TubeTrailMesh]. Enabling this feature outside of materials used in [GPUParticles3D] meshes will break material rendering. */
        get use_particle_trails(): boolean
        set use_particle_trails(value: boolean)
        
        /** If `true` use [member z_clip_scale] to scale the object being rendered towards the camera to avoid clipping into things like walls. */
        get use_z_clip_scale(): boolean
        set use_z_clip_scale(value: boolean)
        
        /** Scales the object being rendered towards the camera to avoid clipping into things like walls. This is intended to be used for objects that are fixed with respect to the camera like player arms, tools, etc. Lighting and shadows will continue to work correctly when this setting is adjusted, but screen-space effects like SSAO and SSR may break with lower scales. Therefore, try to keep this setting as close to `1.0` as possible. */
        get z_clip_scale(): float64
        set z_clip_scale(value: float64)
        
        /** If `true` use [member fov_override] to override the [Camera3D]'s field of view angle. */
        get use_fov_override(): boolean
        set use_fov_override(value: boolean)
        
        /** Overrides the [Camera3D]'s field of view angle (in degrees).  
         *      
         *  **Note:** This behaves as if the field of view is set on a [Camera3D] with [member Camera3D.keep_aspect] set to [constant Camera3D.KEEP_HEIGHT]. Additionally, it may not look correct on a non-perspective camera where the field of view setting is ignored.  
         */
        get fov_override(): float64
        set fov_override(value: float64)
        
        /** If `true`, the proximity fade effect is enabled. The proximity fade effect fades out each pixel based on its distance to another object. */
        get proximity_fade_enabled(): boolean
        set proximity_fade_enabled(value: boolean)
        
        /** Distance over which the fade effect takes place. The larger the distance the longer it takes for an object to fade. */
        get proximity_fade_distance(): float64
        set proximity_fade_distance(value: float64)
        
        /** The width of the range around the shape between the minimum and maximum representable signed distance. */
        get msdf_pixel_range(): float64
        set msdf_pixel_range(value: float64)
        
        /** The width of the shape outline. */
        get msdf_outline_size(): float64
        set msdf_outline_size(value: float64)
        
        /** Specifies which type of fade to use. Can be any of the [enum DistanceFadeMode]s. */
        get distance_fade_mode(): int64
        set distance_fade_mode(value: int64)
        
        /** Distance at which the object starts to become visible. If the object is less than this distance away, it will be invisible.  
         *      
         *  **Note:** If [member distance_fade_min_distance] is greater than [member distance_fade_max_distance], the behavior will be reversed. The object will start to fade away at [member distance_fade_max_distance] and will fully disappear once it reaches [member distance_fade_min_distance].  
         */
        get distance_fade_min_distance(): float64
        set distance_fade_min_distance(value: float64)
        
        /** Distance at which the object appears fully opaque.  
         *      
         *  **Note:** If [member distance_fade_max_distance] is less than [member distance_fade_min_distance], the behavior will be reversed. The object will start to fade away at [member distance_fade_max_distance] and will fully disappear once it reaches [member distance_fade_min_distance].  
         */
        get distance_fade_max_distance(): float64
        set distance_fade_max_distance(value: float64)
        
        /** The stencil effect mode. See [enum StencilMode]. */
        get stencil_mode(): int64
        set stencil_mode(value: int64)
        
        /** The flags dictating how the stencil operation behaves. See [enum StencilFlags]. */
        get stencil_flags(): int64
        set stencil_flags(value: int64)
        
        /** The comparison operator to use for stencil masking operations. See [enum StencilCompare]. */
        get stencil_compare(): int64
        set stencil_compare(value: int64)
        
        /** The stencil reference value (0-255). Typically a power of 2. */
        get stencil_reference(): int64
        set stencil_reference(value: int64)
        
        /** The primary color of the stencil effect. */
        get stencil_color(): Color
        set stencil_color(value: Color)
        
        /** The outline thickness for [constant STENCIL_MODE_OUTLINE]. */
        get stencil_outline_thickness(): float64
        set stencil_outline_thickness(value: float64)
        /** @deprecated Internal use. Does not exist at runtime. */
        __godotNameMap: __NameMapBaseMaterial3D;
    }
    /** @deprecated Internal use. Does not exist at runtime. */
    interface __NameMapBitMap extends __NameMapResource {
    }
    /** Boolean matrix.  
     *  	  
     *  @link https://docs.godotengine.org/en/4.5/classes/class_bitmap.html  
     */
    class BitMap extends Resource {
        constructor(identifier?: any)
        /** Creates a bitmap with the specified size, filled with `false`. */
        create(size: Vector2i): void
        
        /** Creates a bitmap that matches the given image dimensions, every element of the bitmap is set to `false` if the alpha value of the image at that position is equal to [param threshold] or less, and `true` in other case. */
        create_from_image_alpha(image: Image, threshold?: float64 /* = 0.1 */): void
        
        /** Sets the bitmap's element at the specified position, to the specified value. */
        set_bitv(position: Vector2i, bit: boolean): void
        
        /** Sets the bitmap's element at the specified position, to the specified value. */
        set_bit(x: int64, y: int64, bit: boolean): void
        
        /** Returns bitmap's value at the specified position. */
        get_bitv(position: Vector2i): boolean
        
        /** Returns bitmap's value at the specified position. */
        get_bit(x: int64, y: int64): boolean
        
        /** Sets a rectangular portion of the bitmap to the specified value. */
        set_bit_rect(rect: Rect2i, bit: boolean): void
        
        /** Returns the number of bitmap elements that are set to `true`. */
        get_true_bit_count(): int64
        
        /** Returns bitmap's dimensions. */
        get_size(): Vector2i
        
        /** Resizes the image to [param new_size]. */
        resize(new_size: Vector2i): void
        
        /** Applies morphological dilation or erosion to the bitmap. If [param pixels] is positive, dilation is applied to the bitmap. If [param pixels] is negative, erosion is applied to the bitmap. [param rect] defines the area where the morphological operation is applied. Pixels located outside the [param rect] are unaffected by [method grow_mask]. */
        grow_mask(pixels: int64, rect: Rect2i): void
        
        /** Returns an image of the same size as the bitmap and with an [enum Image.Format] of type [constant Image.FORMAT_L8]. `true` bits of the bitmap are being converted into white pixels, and `false` bits into black. */
        convert_to_image(): null | Image
        
        /** Creates an [Array] of polygons covering a rectangular portion of the bitmap. It uses a marching squares algorithm, followed by Ramer-Douglas-Peucker (RDP) reduction of the number of vertices. Each polygon is described as a [PackedVector2Array] of its vertices.  
         *  To get polygons covering the whole bitmap, pass:  
         *    
         *  [param epsilon] is passed to RDP to control how accurately the polygons cover the bitmap: a lower [param epsilon] corresponds to more points in the polygons.  
         */
        opaque_to_polygons(rect: Rect2i, epsilon?: float64 /* = 2 */): GArray<PackedVector2Array>
        get data(): GDictionary
        set data(value: GDictionary)
        /** @deprecated Internal use. Does not exist at runtime. */
        __godotNameMap: __NameMapBitMap;
    }
    /** @deprecated Internal use. Does not exist at runtime. */
    interface __NameMapBone2D extends __NameMapNode2D {
    }
    /** A joint used with [Skeleton2D] to control and animate other nodes.  
     *  	  
     *  @link https://docs.godotengine.org/en/4.5/classes/class_bone2d.html  
     */
    class Bone2D<Map extends NodePathMap = any> extends Node2D<Map> {
        constructor(identifier?: any)
        /** Resets the bone to the rest pose. This is equivalent to setting [member Node2D.transform] to [member rest]. */
        apply_rest(): void
        
        /** Returns the node's [member rest] [Transform2D] if it doesn't have a parent, or its rest pose relative to its parent. */
        get_skeleton_rest(): Transform2D
        
        /** Returns the node's index as part of the entire skeleton. See [Skeleton2D]. */
        get_index_in_skeleton(): int64
        
        /** When set to `true`, the [Bone2D] node will attempt to automatically calculate the bone angle and length using the first child [Bone2D] node, if one exists. If none exist, the [Bone2D] cannot automatically calculate these values and will print a warning. */
        set_autocalculate_length_and_angle(auto_calculate: boolean): void
        
        /** Returns whether this [Bone2D] is going to autocalculate its length and bone angle using its first [Bone2D] child node, if one exists. If there are no [Bone2D] children, then it cannot autocalculate these values and will print a warning. */
        get_autocalculate_length_and_angle(): boolean
        
        /** Sets the length of the bone in the [Bone2D]. */
        set_length(length: float64): void
        
        /** Returns the length of the bone in the [Bone2D] node. */
        get_length(): float64
        
        /** Sets the bone angle for the [Bone2D]. This is typically set to the rotation from the [Bone2D] to a child [Bone2D] node.  
         *      
         *  **Note:** This is different from the [Bone2D]'s rotation. The bone's angle is the rotation of the bone shown by the gizmo, which is unaffected by the [Bone2D]'s [member Node2D.transform].  
         */
        set_bone_angle(angle: float64): void
        
        /** Returns the angle of the bone in the [Bone2D].  
         *      
         *  **Note:** This is different from the [Bone2D]'s rotation. The bone's angle is the rotation of the bone shown by the gizmo, which is unaffected by the [Bone2D]'s [member Node2D.transform].  
         */
        get_bone_angle(): float64
        
        /** Rest transform of the bone. You can reset the node's transforms to this value using [method apply_rest]. */
        get rest(): Transform2D
        set rest(value: Transform2D)
        /** @deprecated Internal use. Does not exist at runtime. */
        __godotNameMap: __NameMapBone2D;
    }
    /** @deprecated Internal use. Does not exist at runtime. */
    interface __NameMapBoneAttachment3D extends __NameMapNode3D {
    }
    /** А node that dynamically copies or overrides the 3D transform of a bone in its parent [Skeleton3D].  
     *  	  
     *  @link https://docs.godotengine.org/en/4.5/classes/class_boneattachment3d.html  
     */
    class BoneAttachment3D<Map extends NodePathMap = any> extends Node3D<Map> {
        constructor(identifier?: any)
        /** Returns the parent or external [Skeleton3D] node if it exists, otherwise returns `null`. */
        get_skeleton(): null | Skeleton3D
        
        /** A function that is called automatically when the [Skeleton3D] is updated. This function is where the [BoneAttachment3D] node updates its position so it is correctly bound when it is  *not*  set to override the bone pose. */
        on_skeleton_update(): void
        
        /** The name of the attached bone. */
        get bone_name(): StringName
        set bone_name(value: StringName)
        
        /** The index of the attached bone. */
        get bone_idx(): int64
        set bone_idx(value: int64)
        
        /** Whether the [BoneAttachment3D] node will override the bone pose of the bone it is attached to. When set to `true`, the [BoneAttachment3D] node can change the pose of the bone. When set to `false`, the [BoneAttachment3D] will always be set to the bone's transform.  
         *      
         *  **Note:** This override performs interruptively in the skeleton update process using signals due to the old design. It may cause unintended behavior when used at the same time with [SkeletonModifier3D].  
         */
        get override_pose(): boolean
        set override_pose(value: boolean)
        
        /** Whether the [BoneAttachment3D] node will use an external [Skeleton3D] node rather than attempting to use its parent node as the [Skeleton3D]. When set to `true`, the [BoneAttachment3D] node will use the external [Skeleton3D] node set in [member external_skeleton]. */
        get use_external_skeleton(): boolean
        set use_external_skeleton(value: boolean)
        
        /** The [NodePath] to the external [Skeleton3D] node. */
        get external_skeleton(): NodePath
        set external_skeleton(value: NodePath | string)
        /** @deprecated Internal use. Does not exist at runtime. */
        __godotNameMap: __NameMapBoneAttachment3D;
    }
    /** @deprecated Internal use. Does not exist at runtime. */
    interface __NameMapBoneConstraint3D extends __NameMapSkeletonModifier3D {
    }
    /** A node that may modify Skeleton3D's bone with associating the two bones.  
     *  	  
     *  @link https://docs.godotengine.org/en/4.5/classes/class_boneconstraint3d.html  
     */
    class BoneConstraint3D<Map extends NodePathMap = any> extends SkeletonModifier3D<Map> {
        constructor(identifier?: any)
        /** Sets the apply amount of the setting at [param index] to [param amount]. */
        set_amount(index: int64, amount: float64): void
        
        /** Returns the apply amount of the setting at [param index]. */
        get_amount(index: int64): float64
        
        /** Sets the apply bone of the setting at [param index] to [param bone_name]. This bone will be modified. */
        set_apply_bone_name(index: int64, bone_name: string): void
        
        /** Returns the apply bone name of the setting at [param index]. This bone will be modified. */
        get_apply_bone_name(index: int64): string
        
        /** Sets the apply bone of the setting at [param index] to [param bone]. This bone will be modified. */
        set_apply_bone(index: int64, bone: int64): void
        
        /** Returns the apply bone of the setting at [param index]. This bone will be modified. */
        get_apply_bone(index: int64): int64
        
        /** Sets the reference bone of the setting at [param index] to [param bone_name].  
         *  This bone will be only referenced and not modified by this modifier.  
         */
        set_reference_bone_name(index: int64, bone_name: string): void
        
        /** Returns the reference bone name of the setting at [param index].  
         *  This bone will be only referenced and not modified by this modifier.  
         */
        get_reference_bone_name(index: int64): string
        
        /** Sets the reference bone of the setting at [param index] to [param bone].  
         *  This bone will be only referenced and not modified by this modifier.  
         */
        set_reference_bone(index: int64, bone: int64): void
        
        /** Returns the reference bone of the setting at [param index].  
         *  This bone will be only referenced and not modified by this modifier.  
         */
        get_reference_bone(index: int64): int64
        
        /** Sets the number of settings in the modifier. */
        set_setting_count(count: int64): void
        
        /** Returns the number of settings in the modifier. */
        get_setting_count(): int64
        
        /** Clear all settings. */
        clear_setting(): void
        /** @deprecated Internal use. Does not exist at runtime. */
        __godotNameMap: __NameMapBoneConstraint3D;
    }
    /** @deprecated Internal use. Does not exist at runtime. */
    interface __NameMapBoneMap extends __NameMapResource {
    }
    /** Describes a mapping of bone names for retargeting [Skeleton3D] into common names defined by a [SkeletonProfile].  
     *  	  
     *  @link https://docs.godotengine.org/en/4.5/classes/class_bonemap.html  
     */
    class BoneMap extends Resource {
        constructor(identifier?: any)
        /** Returns a skeleton bone name is mapped to [param profile_bone_name].  
         *  In the retargeting process, the returned bone name is the bone name of the source skeleton.  
         */
        get_skeleton_bone_name(profile_bone_name: StringName): StringName
        
        /** Maps a skeleton bone name to [param profile_bone_name].  
         *  In the retargeting process, the setting bone name is the bone name of the source skeleton.  
         */
        set_skeleton_bone_name(profile_bone_name: StringName, skeleton_bone_name: StringName): void
        
        /** Returns a profile bone name having [param skeleton_bone_name]. If not found, an empty [StringName] will be returned.  
         *  In the retargeting process, the returned bone name is the bone name of the target skeleton.  
         */
        find_profile_bone_name(skeleton_bone_name: StringName): StringName
        
        /** A [SkeletonProfile] of the mapping target. Key names in the [BoneMap] are synchronized with it. */
        get profile(): null | SkeletonProfile
        set profile(value: null | SkeletonProfile)
        
        /** This signal is emitted when change the key value in the [BoneMap]. This is used to validate mapping and to update [BoneMap] editor. */
        readonly bone_map_updated: Signal<() => void>
        
        /** This signal is emitted when change the value in profile or change the reference of profile. This is used to update key names in the [BoneMap] and to redraw the [BoneMap] editor. */
        readonly profile_updated: Signal<() => void>
        /** @deprecated Internal use. Does not exist at runtime. */
        __godotNameMap: __NameMapBoneMap;
    }
    namespace BoxContainer {
        enum AlignmentMode {
            /** The child controls will be arranged at the beginning of the container, i.e. top if orientation is vertical, left if orientation is horizontal (right for RTL layout). */
            ALIGNMENT_BEGIN = 0,
            
            /** The child controls will be centered in the container. */
            ALIGNMENT_CENTER = 1,
            
            /** The child controls will be arranged at the end of the container, i.e. bottom if orientation is vertical, right if orientation is horizontal (left for RTL layout). */
            ALIGNMENT_END = 2,
        }
    }
    /** @deprecated Internal use. Does not exist at runtime. */
    interface __NameMapBoxContainer extends __NameMapContainer {
    }
    /** A container that arranges its child controls horizontally or vertically.  
     *  	  
     *  @link https://docs.godotengine.org/en/4.5/classes/class_boxcontainer.html  
     */
    class BoxContainer<Map extends NodePathMap = any> extends Container<Map> {
        constructor(identifier?: any)
        /** Adds a [Control] node to the box as a spacer. If [param begin] is `true`, it will insert the [Control] node in front of all other children. */
        add_spacer(begin: boolean): null | Control
        
        /** The alignment of the container's children (must be one of [constant ALIGNMENT_BEGIN], [constant ALIGNMENT_CENTER], or [constant ALIGNMENT_END]). */
        get alignment(): int64
        set alignment(value: int64)
        
        /** If `true`, the [BoxContainer] will arrange its children vertically, rather than horizontally.  
         *  Can't be changed when using [HBoxContainer] and [VBoxContainer].  
         */
        get vertical(): boolean
        set vertical(value: boolean)
        /** @deprecated Internal use. Does not exist at runtime. */
        __godotNameMap: __NameMapBoxContainer;
    }
    /** @deprecated Internal use. Does not exist at runtime. */
    interface __NameMapBoxMesh extends __NameMapPrimitiveMesh {
    }
    /** Generate an axis-aligned box [PrimitiveMesh].  
     *  	  
     *  @link https://docs.godotengine.org/en/4.5/classes/class_boxmesh.html  
     */
    class BoxMesh extends PrimitiveMesh {
        constructor(identifier?: any)
        /** The box's width, height and depth. */
        get size(): Vector3
        set size(value: Vector3)
        
        /** Number of extra edge loops inserted along the X axis. */
        get subdivide_width(): int64
        set subdivide_width(value: int64)
        
        /** Number of extra edge loops inserted along the Y axis. */
        get subdivide_height(): int64
        set subdivide_height(value: int64)
        
        /** Number of extra edge loops inserted along the Z axis. */
        get subdivide_depth(): int64
        set subdivide_depth(value: int64)
        /** @deprecated Internal use. Does not exist at runtime. */
        __godotNameMap: __NameMapBoxMesh;
    }
    /** @deprecated Internal use. Does not exist at runtime. */
    interface __NameMapBoxOccluder3D extends __NameMapOccluder3D {
    }
    /** Cuboid shape for use with occlusion culling in [OccluderInstance3D].  
     *  	  
     *  @link https://docs.godotengine.org/en/4.5/classes/class_boxoccluder3d.html  
     */
    class BoxOccluder3D extends Occluder3D {
        constructor(identifier?: any)
        /** The box's size in 3D units. */
        get size(): Vector3
        set size(value: Vector3)
        /** @deprecated Internal use. Does not exist at runtime. */
        __godotNameMap: __NameMapBoxOccluder3D;
    }
    /** @deprecated Internal use. Does not exist at runtime. */
    interface __NameMapBoxShape3D extends __NameMapShape3D {
    }
    /** A 3D box shape used for physics collision.  
     *  	  
     *  @link https://docs.godotengine.org/en/4.5/classes/class_boxshape3d.html  
     */
    class BoxShape3D extends Shape3D {
        constructor(identifier?: any)
        /** The box's width, height and depth. */
        get size(): Vector3
        set size(value: Vector3)
        /** @deprecated Internal use. Does not exist at runtime. */
        __godotNameMap: __NameMapBoxShape3D;
    }
    /** @deprecated Internal use. Does not exist at runtime. */
    interface __NameMapButton extends __NameMapBaseButton {
    }
    /** A themed button that can contain text and an icon.  
     *  	  
     *  @link https://docs.godotengine.org/en/4.5/classes/class_button.html  
     */
    class Button<Map extends NodePathMap = any> extends BaseButton<Map> {
        constructor(identifier?: any)
        /** The button's text that will be displayed inside the button's area. */
        get text(): string
        set text(value: string)
        
        /** Button's icon, if text is present the icon will be placed before the text.  
         *  To edit margin and spacing of the icon, use [theme_item h_separation] theme property and `content_margin_*` properties of the used [StyleBox]es.  
         */
        get icon(): null | Texture2D
        set icon(value: null | Texture2D)
        
        /** Flat buttons don't display decoration. */
        get flat(): boolean
        set flat(value: boolean)
        
        /** Text alignment policy for the button's text. */
        get alignment(): int64
        set alignment(value: int64)
        
        /** Sets the clipping behavior when the text exceeds the node's bounding rectangle. */
        get text_overrun_behavior(): int64
        set text_overrun_behavior(value: int64)
        
        /** If set to something other than [constant TextServer.AUTOWRAP_OFF], the text gets wrapped inside the node's bounding rectangle. */
        get autowrap_mode(): int64
        set autowrap_mode(value: int64)
        
        /** Autowrap space trimming flags. See [constant TextServer.BREAK_TRIM_START_EDGE_SPACES] and [constant TextServer.BREAK_TRIM_END_EDGE_SPACES] for more info. */
        get autowrap_trim_flags(): int64
        set autowrap_trim_flags(value: int64)
        
        /** If `true`, text that is too large to fit the button is clipped horizontally. If `false`, the button will always be wide enough to hold the text. The text is not vertically clipped, and the button's height is not affected by this property. */
        get clip_text(): boolean
        set clip_text(value: boolean)
        
        /** Specifies if the icon should be aligned horizontally to the left, right, or center of a button. Uses the same [enum HorizontalAlignment] constants as the text alignment. If centered horizontally and vertically, text will draw on top of the icon. */
        get icon_alignment(): int64
        set icon_alignment(value: int64)
        
        /** Specifies if the icon should be aligned vertically to the top, bottom, or center of a button. Uses the same [enum VerticalAlignment] constants as the text alignment. If centered horizontally and vertically, text will draw on top of the icon. */
        get vertical_icon_alignment(): int64
        set vertical_icon_alignment(value: int64)
        
        /** When enabled, the button's icon will expand/shrink to fit the button's size while keeping its aspect. See also [theme_item icon_max_width]. */
        get expand_icon(): boolean
        set expand_icon(value: boolean)
        
        /** Base text writing direction. */
        get text_direction(): int64
        set text_direction(value: int64)
        
        /** Language code used for line-breaking and text shaping algorithms, if left empty current locale is used instead. */
        get language(): string
        set language(value: string)
        /** @deprecated Internal use. Does not exist at runtime. */
        __godotNameMap: __NameMapButton;
    }
    /** @deprecated Internal use. Does not exist at runtime. */
    interface __NameMapButtonGroup extends __NameMapResource {
    }
    /** A group of buttons that doesn't allow more than one button to be pressed at a time.  
     *  	  
     *  @link https://docs.godotengine.org/en/4.5/classes/class_buttongroup.html  
     */
    class ButtonGroup extends Resource {
        constructor(identifier?: any)
        /** Returns the current pressed button. */
        get_pressed_button(): null | BaseButton
        
        /** Returns an [Array] of [Button]s who have this as their [ButtonGroup] (see [member BaseButton.button_group]). */
        get_buttons(): GArray<BaseButton>
        
        /** If `true`, it is possible to unpress all buttons in this [ButtonGroup]. */
        get allow_unpress(): boolean
        set allow_unpress(value: boolean)
        
        /** Emitted when one of the buttons of the group is pressed. */
        readonly pressed: Signal<(button: BaseButton) => void>
        /** @deprecated Internal use. Does not exist at runtime. */
        __godotNameMap: __NameMapButtonGroup;
    }
    namespace CPUParticles2D {
        enum DrawOrder {
            /** Particles are drawn in the order emitted. */
            DRAW_ORDER_INDEX = 0,
            
            /** Particles are drawn in order of remaining lifetime. In other words, the particle with the highest lifetime is drawn at the front. */
            DRAW_ORDER_LIFETIME = 1,
        }
        enum Parameter {
            /** Use with [method set_param_min], [method set_param_max], and [method set_param_curve] to set initial velocity properties. */
            PARAM_INITIAL_LINEAR_VELOCITY = 0,
            
            /** Use with [method set_param_min], [method set_param_max], and [method set_param_curve] to set angular velocity properties. */
            PARAM_ANGULAR_VELOCITY = 1,
            
            /** Use with [method set_param_min], [method set_param_max], and [method set_param_curve] to set orbital velocity properties. */
            PARAM_ORBIT_VELOCITY = 2,
            
            /** Use with [method set_param_min], [method set_param_max], and [method set_param_curve] to set linear acceleration properties. */
            PARAM_LINEAR_ACCEL = 3,
            
            /** Use with [method set_param_min], [method set_param_max], and [method set_param_curve] to set radial acceleration properties. */
            PARAM_RADIAL_ACCEL = 4,
            
            /** Use with [method set_param_min], [method set_param_max], and [method set_param_curve] to set tangential acceleration properties. */
            PARAM_TANGENTIAL_ACCEL = 5,
            
            /** Use with [method set_param_min], [method set_param_max], and [method set_param_curve] to set damping properties. */
            PARAM_DAMPING = 6,
            
            /** Use with [method set_param_min], [method set_param_max], and [method set_param_curve] to set angle properties. */
            PARAM_ANGLE = 7,
            
            /** Use with [method set_param_min], [method set_param_max], and [method set_param_curve] to set scale properties. */
            PARAM_SCALE = 8,
            
            /** Use with [method set_param_min], [method set_param_max], and [method set_param_curve] to set hue variation properties. */
            PARAM_HUE_VARIATION = 9,
            
            /** Use with [method set_param_min], [method set_param_max], and [method set_param_curve] to set animation speed properties. */
            PARAM_ANIM_SPEED = 10,
            
            /** Use with [method set_param_min], [method set_param_max], and [method set_param_curve] to set animation offset properties. */
            PARAM_ANIM_OFFSET = 11,
            
            /** Represents the size of the [enum Parameter] enum. */
            PARAM_MAX = 12,
        }
        enum ParticleFlags {
            /** Use with [method set_particle_flag] to set [member particle_flag_align_y]. */
            PARTICLE_FLAG_ALIGN_Y_TO_VELOCITY = 0,
            
            /** Present for consistency with 3D particle nodes, not used in 2D. */
            PARTICLE_FLAG_ROTATE_Y = 1,
            
            /** Present for consistency with 3D particle nodes, not used in 2D. */
            PARTICLE_FLAG_DISABLE_Z = 2,
            
            /** Represents the size of the [enum ParticleFlags] enum. */
            PARTICLE_FLAG_MAX = 3,
        }
        enum EmissionShape {
            /** All particles will be emitted from a single point. */
            EMISSION_SHAPE_POINT = 0,
            
            /** Particles will be emitted in the volume of a sphere flattened to two dimensions. */
            EMISSION_SHAPE_SPHERE = 1,
            
            /** Particles will be emitted on the surface of a sphere flattened to two dimensions. */
            EMISSION_SHAPE_SPHERE_SURFACE = 2,
            
            /** Particles will be emitted in the area of a rectangle. */
            EMISSION_SHAPE_RECTANGLE = 3,
            
            /** Particles will be emitted at a position chosen randomly among [member emission_points]. Particle color will be modulated by [member emission_colors]. */
            EMISSION_SHAPE_POINTS = 4,
            
            /** Particles will be emitted at a position chosen randomly among [member emission_points]. Particle velocity and rotation will be set based on [member emission_normals]. Particle color will be modulated by [member emission_colors]. */
            EMISSION_SHAPE_DIRECTED_POINTS = 5,
            
            /** Represents the size of the [enum EmissionShape] enum. */
            EMISSION_SHAPE_MAX = 6,
        }
    }
    /** @deprecated Internal use. Does not exist at runtime. */
    interface __NameMapCPUParticles2D extends __NameMapNode2D {
    }
    /** A CPU-based 2D particle emitter.  
     *  	  
     *  @link https://docs.godotengine.org/en/4.5/classes/class_cpuparticles2d.html  
     */
    class CPUParticles2D<Map extends NodePathMap = any> extends Node2D<Map> {
        constructor(identifier?: any)
        /** Requests the particles to process for extra process time during a single frame.  
         *  Useful for particle playback, if used in combination with [member use_fixed_seed] or by calling [method restart] with parameter `keep_seed` set to `true`.  
         */
        request_particles_process(process_time: float64): void
        
        /** Restarts the particle emitter.  
         *  If [param keep_seed] is `true`, the current random seed will be preserved. Useful for seeking and playback.  
         */
        restart(keep_seed?: boolean /* = false */): void
        
        /** Sets the minimum value for the given parameter. */
        set_param_min(param: CPUParticles2D.Parameter, value: float64): void
        
        /** Returns the minimum value range for the given parameter. */
        get_param_min(param: CPUParticles2D.Parameter): float64
        
        /** Sets the maximum value for the given parameter. */
        set_param_max(param: CPUParticles2D.Parameter, value: float64): void
        
        /** Returns the maximum value range for the given parameter. */
        get_param_max(param: CPUParticles2D.Parameter): float64
        
        /** Sets the [Curve] of the parameter specified by [enum Parameter]. Should be a unit [Curve]. */
        set_param_curve(param: CPUParticles2D.Parameter, curve: Curve): void
        
        /** Returns the [Curve] of the parameter specified by [enum Parameter]. */
        get_param_curve(param: CPUParticles2D.Parameter): null | Curve
        
        /** Enables or disables the given particle flag. */
        set_particle_flag(particle_flag: CPUParticles2D.ParticleFlags, enable: boolean): void
        
        /** Returns the enabled state of the given particle flag. */
        get_particle_flag(particle_flag: CPUParticles2D.ParticleFlags): boolean
        
        /** Sets this node's properties to match a given [GPUParticles2D] node with an assigned [ParticleProcessMaterial]. */
        convert_from_particles(particles: Node): void
        
        /** If `true`, particles are being emitted. [member emitting] can be used to start and stop particles from emitting. However, if [member one_shot] is `true` setting [member emitting] to `true` will not restart the emission cycle until after all active particles finish processing. You can use the [signal finished] signal to be notified once all active particles finish processing. */
        get emitting(): boolean
        set emitting(value: boolean)
        
        /** Number of particles emitted in one emission cycle. */
        get amount(): int64
        set amount(value: int64)
        
        /** Particle texture. If `null`, particles will be squares. */
        get texture(): null | Texture2D
        set texture(value: null | Texture2D)
        
        /** Amount of time each particle will exist. */
        get lifetime(): float64
        set lifetime(value: float64)
        
        /** If `true`, only one emission cycle occurs. If set `true` during a cycle, emission will stop at the cycle's end. */
        get one_shot(): boolean
        set one_shot(value: boolean)
        
        /** Particle system starts as if it had already run for this many seconds. */
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
        
        /** Particle lifetime randomness ratio. */
        get lifetime_randomness(): float64
        set lifetime_randomness(value: float64)
        
        /** The particle system's frame rate is fixed to a value. For example, changing the value to 2 will make the particles render at 2 frames per second. Note this does not slow down the simulation of the particle system itself. */
        get fixed_fps(): int64
        set fixed_fps(value: int64)
        
        /** If `true`, results in fractional delta calculation which has a smoother particles display effect. */
        get fract_delta(): boolean
        set fract_delta(value: boolean)
        
        /** If `true`, particles use the parent node's coordinate space (known as local coordinates). This will cause particles to move and rotate along the [CPUParticles2D] node (and its parents) when it is moved or rotated. If `false`, particles use global coordinates; they will not move or rotate along the [CPUParticles2D] node (and its parents) when it is moved or rotated. */
        get local_coords(): boolean
        set local_coords(value: boolean)
        
        /** Particle draw order. */
        get draw_order(): int64
        set draw_order(value: int64)
        
        /** Particles will be emitted inside this region. */
        get emission_shape(): int64
        set emission_shape(value: int64)
        
        /** The sphere's radius if [member emission_shape] is set to [constant EMISSION_SHAPE_SPHERE]. */
        get emission_sphere_radius(): float64
        set emission_sphere_radius(value: float64)
        
        /** The rectangle's extents if [member emission_shape] is set to [constant EMISSION_SHAPE_RECTANGLE]. */
        get emission_rect_extents(): Vector2
        set emission_rect_extents(value: Vector2)
        
        /** Sets the initial positions to spawn particles when using [constant EMISSION_SHAPE_POINTS] or [constant EMISSION_SHAPE_DIRECTED_POINTS]. */
        get emission_points(): PackedVector2Array
        set emission_points(value: PackedVector2Array | Vector2[])
        
        /** Sets the direction the particles will be emitted in when using [constant EMISSION_SHAPE_DIRECTED_POINTS]. */
        get emission_normals(): PackedVector2Array
        set emission_normals(value: PackedVector2Array | Vector2[])
        
        /** Sets the [Color]s to modulate particles by when using [constant EMISSION_SHAPE_POINTS] or [constant EMISSION_SHAPE_DIRECTED_POINTS]. */
        get emission_colors(): PackedColorArray
        set emission_colors(value: PackedColorArray | Color[])
        
        /** Align Y axis of particle with the direction of its velocity. */
        get particle_flag_align_y(): boolean
        set particle_flag_align_y(value: boolean)
        
        /** Unit vector specifying the particles' emission direction. */
        get direction(): Vector2
        set direction(value: Vector2)
        
        /** Each particle's initial direction range from `+spread` to `-spread` degrees. */
        get spread(): float64
        set spread(value: float64)
        
        /** Gravity applied to every particle. */
        get gravity(): Vector2
        set gravity(value: Vector2)
        
        /** Minimum equivalent of [member initial_velocity_max]. */
        get initial_velocity_min(): float64
        set initial_velocity_min(value: float64)
        
        /** Maximum initial velocity magnitude for each particle. Direction comes from [member direction] and [member spread]. */
        get initial_velocity_max(): float64
        set initial_velocity_max(value: float64)
        
        /** Minimum equivalent of [member angular_velocity_max]. */
        get angular_velocity_min(): float64
        set angular_velocity_min(value: float64)
        
        /** Maximum initial angular velocity (rotation speed) applied to each particle in  *degrees*  per second. */
        get angular_velocity_max(): float64
        set angular_velocity_max(value: float64)
        
        /** Each particle's angular velocity will vary along this [Curve]. Should be a unit [Curve]. */
        get angular_velocity_curve(): null | Curve
        set angular_velocity_curve(value: null | Curve)
        
        /** Minimum equivalent of [member orbit_velocity_max]. */
        get orbit_velocity_min(): float64
        set orbit_velocity_min(value: float64)
        
        /** Maximum orbital velocity applied to each particle. Makes the particles circle around origin. Specified in number of full rotations around origin per second. */
        get orbit_velocity_max(): float64
        set orbit_velocity_max(value: float64)
        
        /** Each particle's orbital velocity will vary along this [Curve]. Should be a unit [Curve]. */
        get orbit_velocity_curve(): null | Curve
        set orbit_velocity_curve(value: null | Curve)
        
        /** Minimum equivalent of [member linear_accel_max]. */
        get linear_accel_min(): float64
        set linear_accel_min(value: float64)
        
        /** Maximum linear acceleration applied to each particle in the direction of motion. */
        get linear_accel_max(): float64
        set linear_accel_max(value: float64)
        
        /** Each particle's linear acceleration will vary along this [Curve]. Should be a unit [Curve]. */
        get linear_accel_curve(): null | Curve
        set linear_accel_curve(value: null | Curve)
        
        /** Minimum equivalent of [member radial_accel_max]. */
        get radial_accel_min(): float64
        set radial_accel_min(value: float64)
        
        /** Maximum radial acceleration applied to each particle. Makes particle accelerate away from the origin or towards it if negative. */
        get radial_accel_max(): float64
        set radial_accel_max(value: float64)
        
        /** Each particle's radial acceleration will vary along this [Curve]. Should be a unit [Curve]. */
        get radial_accel_curve(): null | Curve
        set radial_accel_curve(value: null | Curve)
        
        /** Minimum equivalent of [member tangential_accel_max]. */
        get tangential_accel_min(): float64
        set tangential_accel_min(value: float64)
        
        /** Maximum tangential acceleration applied to each particle. Tangential acceleration is perpendicular to the particle's velocity giving the particles a swirling motion. */
        get tangential_accel_max(): float64
        set tangential_accel_max(value: float64)
        
        /** Each particle's tangential acceleration will vary along this [Curve]. Should be a unit [Curve]. */
        get tangential_accel_curve(): null | Curve
        set tangential_accel_curve(value: null | Curve)
        
        /** Minimum equivalent of [member damping_max]. */
        get damping_min(): float64
        set damping_min(value: float64)
        
        /** The maximum rate at which particles lose velocity. For example value of `100` means that the particle will go from `100` velocity to `0` in `1` second. */
        get damping_max(): float64
        set damping_max(value: float64)
        
        /** Damping will vary along this [Curve]. Should be a unit [Curve]. */
        get damping_curve(): null | Curve
        set damping_curve(value: null | Curve)
        
        /** Minimum equivalent of [member angle_max]. */
        get angle_min(): float64
        set angle_min(value: float64)
        
        /** Maximum initial rotation applied to each particle, in degrees. */
        get angle_max(): float64
        set angle_max(value: float64)
        
        /** Each particle's rotation will be animated along this [Curve]. Should be a unit [Curve]. */
        get angle_curve(): null | Curve
        set angle_curve(value: null | Curve)
        
        /** Minimum equivalent of [member scale_amount_max]. */
        get scale_amount_min(): float64
        set scale_amount_min(value: float64)
        
        /** Maximum initial scale applied to each particle. */
        get scale_amount_max(): float64
        set scale_amount_max(value: float64)
        
        /** Each particle's scale will vary along this [Curve]. Should be a unit [Curve]. */
        get scale_amount_curve(): null | Curve
        set scale_amount_curve(value: null | Curve)
        
        /** If `true`, the scale curve will be split into x and y components. See [member scale_curve_x] and [member scale_curve_y]. */
        get split_scale(): boolean
        set split_scale(value: boolean)
        
        /** Each particle's horizontal scale will vary along this [Curve]. Should be a unit [Curve].  
         *  [member split_scale] must be enabled.  
         */
        get scale_curve_x(): null | Curve
        set scale_curve_x(value: null | Curve)
        
        /** Each particle's vertical scale will vary along this [Curve]. Should be a unit [Curve].  
         *  [member split_scale] must be enabled.  
         */
        get scale_curve_y(): null | Curve
        set scale_curve_y(value: null | Curve)
        
        /** Each particle's initial color. If [member texture] is defined, it will be multiplied by this color. */
        get color(): Color
        set color(value: Color)
        
        /** Each particle's color will vary along this [Gradient] over its lifetime (multiplied with [member color]). */
        get color_ramp(): null | Gradient
        set color_ramp(value: null | Gradient)
        
        /** Each particle's initial color will vary along this [Gradient] (multiplied with [member color]). */
        get color_initial_ramp(): null | Gradient
        set color_initial_ramp(value: null | Gradient)
        
        /** Minimum equivalent of [member hue_variation_max]. */
        get hue_variation_min(): float64
        set hue_variation_min(value: float64)
        
        /** Maximum initial hue variation applied to each particle. It will shift the particle color's hue. */
        get hue_variation_max(): float64
        set hue_variation_max(value: float64)
        
        /** Each particle's hue will vary along this [Curve]. Should be a unit [Curve]. */
        get hue_variation_curve(): null | Curve
        set hue_variation_curve(value: null | Curve)
        
        /** Minimum equivalent of [member anim_speed_max]. */
        get anim_speed_min(): float64
        set anim_speed_min(value: float64)
        
        /** Maximum particle animation speed. Animation speed of `1` means that the particles will make full `0` to `1` offset cycle during lifetime, `2` means `2` cycles etc.  
         *  With animation speed greater than `1`, remember to enable [member CanvasItemMaterial.particles_anim_loop] property if you want the animation to repeat.  
         */
        get anim_speed_max(): float64
        set anim_speed_max(value: float64)
        
        /** Each particle's animation speed will vary along this [Curve]. Should be a unit [Curve]. */
        get anim_speed_curve(): null | Curve
        set anim_speed_curve(value: null | Curve)
        
        /** Minimum equivalent of [member anim_offset_max]. */
        get anim_offset_min(): float64
        set anim_offset_min(value: float64)
        
        /** Maximum animation offset that corresponds to frame index in the texture. `0` is the first frame, `1` is the last one. See [member CanvasItemMaterial.particles_animation]. */
        get anim_offset_max(): float64
        set anim_offset_max(value: float64)
        
        /** Each particle's animation offset will vary along this [Curve]. Should be a unit [Curve]. */
        get anim_offset_curve(): null | Curve
        set anim_offset_curve(value: null | Curve)
        
        /** Emitted when all active particles have finished processing. When [member one_shot] is disabled, particles will process continuously, so this is never emitted. */
        readonly finished: Signal<() => void>
        /** @deprecated Internal use. Does not exist at runtime. */
        __godotNameMap: __NameMapCPUParticles2D;
    }
    namespace CPUParticles3D {
        enum DrawOrder {
            /** Particles are drawn in the order emitted. */
            DRAW_ORDER_INDEX = 0,
            
            /** Particles are drawn in order of remaining lifetime. In other words, the particle with the highest lifetime is drawn at the front. */
            DRAW_ORDER_LIFETIME = 1,
            
            /** Particles are drawn in order of depth. */
            DRAW_ORDER_VIEW_DEPTH = 2,
        }
        enum Parameter {
            /** Use with [method set_param_min], [method set_param_max], and [method set_param_curve] to set initial velocity properties. */
            PARAM_INITIAL_LINEAR_VELOCITY = 0,
            
            /** Use with [method set_param_min], [method set_param_max], and [method set_param_curve] to set angular velocity properties. */
            PARAM_ANGULAR_VELOCITY = 1,
            
            /** Use with [method set_param_min], [method set_param_max], and [method set_param_curve] to set orbital velocity properties. */
            PARAM_ORBIT_VELOCITY = 2,
            
            /** Use with [method set_param_min], [method set_param_max], and [method set_param_curve] to set linear acceleration properties. */
            PARAM_LINEAR_ACCEL = 3,
            
            /** Use with [method set_param_min], [method set_param_max], and [method set_param_curve] to set radial acceleration properties. */
            PARAM_RADIAL_ACCEL = 4,
            
            /** Use with [method set_param_min], [method set_param_max], and [method set_param_curve] to set tangential acceleration properties. */
            PARAM_TANGENTIAL_ACCEL = 5,
            
            /** Use with [method set_param_min], [method set_param_max], and [method set_param_curve] to set damping properties. */
            PARAM_DAMPING = 6,
            
            /** Use with [method set_param_min], [method set_param_max], and [method set_param_curve] to set angle properties. */
            PARAM_ANGLE = 7,
            
            /** Use with [method set_param_min], [method set_param_max], and [method set_param_curve] to set scale properties. */
            PARAM_SCALE = 8,
            
            /** Use with [method set_param_min], [method set_param_max], and [method set_param_curve] to set hue variation properties. */
            PARAM_HUE_VARIATION = 9,
            
            /** Use with [method set_param_min], [method set_param_max], and [method set_param_curve] to set animation speed properties. */
            PARAM_ANIM_SPEED = 10,
            
            /** Use with [method set_param_min], [method set_param_max], and [method set_param_curve] to set animation offset properties. */
            PARAM_ANIM_OFFSET = 11,
            
            /** Represents the size of the [enum Parameter] enum. */
            PARAM_MAX = 12,
        }
        enum ParticleFlags {
            /** Use with [method set_particle_flag] to set [member particle_flag_align_y]. */
            PARTICLE_FLAG_ALIGN_Y_TO_VELOCITY = 0,
            
            /** Use with [method set_particle_flag] to set [member particle_flag_rotate_y]. */
            PARTICLE_FLAG_ROTATE_Y = 1,
            
            /** Use with [method set_particle_flag] to set [member particle_flag_disable_z]. */
            PARTICLE_FLAG_DISABLE_Z = 2,
            
            /** Represents the size of the [enum ParticleFlags] enum. */
            PARTICLE_FLAG_MAX = 3,
        }
        enum EmissionShape {
            /** All particles will be emitted from a single point. */
            EMISSION_SHAPE_POINT = 0,
            
            /** Particles will be emitted in the volume of a sphere. */
            EMISSION_SHAPE_SPHERE = 1,
            
            /** Particles will be emitted on the surface of a sphere. */
            EMISSION_SHAPE_SPHERE_SURFACE = 2,
            
            /** Particles will be emitted in the volume of a box. */
            EMISSION_SHAPE_BOX = 3,
            
            /** Particles will be emitted at a position chosen randomly among [member emission_points]. Particle color will be modulated by [member emission_colors]. */
            EMISSION_SHAPE_POINTS = 4,
            
            /** Particles will be emitted at a position chosen randomly among [member emission_points]. Particle velocity and rotation will be set based on [member emission_normals]. Particle color will be modulated by [member emission_colors]. */
            EMISSION_SHAPE_DIRECTED_POINTS = 5,
            
            /** Particles will be emitted in a ring or cylinder. */
            EMISSION_SHAPE_RING = 6,
            
            /** Represents the size of the [enum EmissionShape] enum. */
            EMISSION_SHAPE_MAX = 7,
        }
    }
    /** @deprecated Internal use. Does not exist at runtime. */
    interface __NameMapCPUParticles3D extends __NameMapGeometryInstance3D {
    }
    /** A CPU-based 3D particle emitter.  
     *  	  
     *  @link https://docs.godotengine.org/en/4.5/classes/class_cpuparticles3d.html  
     */
    class CPUParticles3D<Map extends NodePathMap = any> extends GeometryInstance3D<Map> {
        constructor(identifier?: any)
        /** Restarts the particle emitter.  
         *  If [param keep_seed] is `true`, the current random seed will be preserved. Useful for seeking and playback.  
         */
        restart(keep_seed?: boolean /* = false */): void
        
        /** Requests the particles to process for extra process time during a single frame.  
         *  Useful for particle playback, if used in combination with [member use_fixed_seed] or by calling [method restart] with parameter `keep_seed` set to `true`.  
         */
        request_particles_process(process_time: float64): void
        
        /** Returns the axis-aligned bounding box that contains all the particles that are active in the current frame. */
        capture_aabb(): AABB
        
        /** Sets the minimum value for the given parameter. */
        set_param_min(param: CPUParticles3D.Parameter, value: float64): void
        
        /** Returns the minimum value range for the given parameter. */
        get_param_min(param: CPUParticles3D.Parameter): float64
        
        /** Sets the maximum value for the given parameter. */
        set_param_max(param: CPUParticles3D.Parameter, value: float64): void
        
        /** Returns the maximum value range for the given parameter. */
        get_param_max(param: CPUParticles3D.Parameter): float64
        
        /** Sets the [Curve] of the parameter specified by [enum Parameter]. Should be a unit [Curve]. */
        set_param_curve(param: CPUParticles3D.Parameter, curve: Curve): void
        
        /** Returns the [Curve] of the parameter specified by [enum Parameter]. */
        get_param_curve(param: CPUParticles3D.Parameter): null | Curve
        
        /** Enables or disables the given particle flag. */
        set_particle_flag(particle_flag: CPUParticles3D.ParticleFlags, enable: boolean): void
        
        /** Returns the enabled state of the given particle flag. */
        get_particle_flag(particle_flag: CPUParticles3D.ParticleFlags): boolean
        
        /** Sets this node's properties to match a given [GPUParticles3D] node with an assigned [ParticleProcessMaterial]. */
        convert_from_particles(particles: Node): void
        
        /** If `true`, particles are being emitted. [member emitting] can be used to start and stop particles from emitting. However, if [member one_shot] is `true` setting [member emitting] to `true` will not restart the emission cycle until after all active particles finish processing. You can use the [signal finished] signal to be notified once all active particles finish processing. */
        get emitting(): boolean
        set emitting(value: boolean)
        
        /** Number of particles emitted in one emission cycle. */
        get amount(): int64
        set amount(value: int64)
        
        /** Amount of time each particle will exist. */
        get lifetime(): float64
        set lifetime(value: float64)
        
        /** If `true`, only one emission cycle occurs. If set `true` during a cycle, emission will stop at the cycle's end. */
        get one_shot(): boolean
        set one_shot(value: boolean)
        
        /** Particle system starts as if it had already run for this many seconds. */
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
        
        /** Particle lifetime randomness ratio. */
        get lifetime_randomness(): float64
        set lifetime_randomness(value: float64)
        
        /** The particle system's frame rate is fixed to a value. For example, changing the value to 2 will make the particles render at 2 frames per second. Note this does not slow down the particle system itself. */
        get fixed_fps(): int64
        set fixed_fps(value: int64)
        
        /** If `true`, results in fractional delta calculation which has a smoother particles display effect. */
        get fract_delta(): boolean
        set fract_delta(value: boolean)
        
        /** The [AABB] that determines the node's region which needs to be visible on screen for the particle system to be active.  
         *  Grow the box if particles suddenly appear/disappear when the node enters/exits the screen. The [AABB] can be grown via code or with the **Particles → Generate AABB** editor tool.  
         */
        get visibility_aabb(): AABB
        set visibility_aabb(value: AABB)
        
        /** If `true`, particles use the parent node's coordinate space (known as local coordinates). This will cause particles to move and rotate along the [CPUParticles3D] node (and its parents) when it is moved or rotated. If `false`, particles use global coordinates; they will not move or rotate along the [CPUParticles3D] node (and its parents) when it is moved or rotated. */
        get local_coords(): boolean
        set local_coords(value: boolean)
        
        /** Particle draw order. */
        get draw_order(): int64
        set draw_order(value: int64)
        
        /** The [Mesh] used for each particle. If `null`, particles will be spheres. */
        get mesh(): null | Mesh
        set mesh(value: null | Mesh)
        
        /** Particles will be emitted inside this region. */
        get emission_shape(): int64
        set emission_shape(value: int64)
        
        /** The sphere's radius if [enum EmissionShape] is set to [constant EMISSION_SHAPE_SPHERE]. */
        get emission_sphere_radius(): float64
        set emission_sphere_radius(value: float64)
        
        /** The rectangle's extents if [member emission_shape] is set to [constant EMISSION_SHAPE_BOX]. */
        get emission_box_extents(): Vector3
        set emission_box_extents(value: Vector3)
        
        /** Sets the initial positions to spawn particles when using [constant EMISSION_SHAPE_POINTS] or [constant EMISSION_SHAPE_DIRECTED_POINTS]. */
        get emission_points(): PackedVector3Array
        set emission_points(value: PackedVector3Array | Vector3[])
        
        /** Sets the direction the particles will be emitted in when using [constant EMISSION_SHAPE_DIRECTED_POINTS]. */
        get emission_normals(): PackedVector3Array
        set emission_normals(value: PackedVector3Array | Vector3[])
        
        /** Sets the [Color]s to modulate particles by when using [constant EMISSION_SHAPE_POINTS] or [constant EMISSION_SHAPE_DIRECTED_POINTS].  
         *      
         *  **Note:** [member emission_colors] multiplies the particle mesh's vertex colors. To have a visible effect on a [BaseMaterial3D], [member BaseMaterial3D.vertex_color_use_as_albedo]  *must*  be `true`. For a [ShaderMaterial], `ALBEDO *= COLOR.rgb;` must be inserted in the shader's `fragment()` function. Otherwise, [member emission_colors] will have no visible effect.  
         */
        get emission_colors(): PackedColorArray
        set emission_colors(value: PackedColorArray | Color[])
        
        /** The axis of the ring when using the emitter [constant EMISSION_SHAPE_RING]. */
        get emission_ring_axis(): Vector3
        set emission_ring_axis(value: Vector3)
        
        /** The height of the ring when using the emitter [constant EMISSION_SHAPE_RING]. */
        get emission_ring_height(): float64
        set emission_ring_height(value: float64)
        
        /** The radius of the ring when using the emitter [constant EMISSION_SHAPE_RING]. */
        get emission_ring_radius(): float64
        set emission_ring_radius(value: float64)
        
        /** The inner radius of the ring when using the emitter [constant EMISSION_SHAPE_RING]. */
        get emission_ring_inner_radius(): float64
        set emission_ring_inner_radius(value: float64)
        
        /** The angle of the cone when using the emitter [constant EMISSION_SHAPE_RING]. The default angle of 90 degrees results in a ring, while an angle of 0 degrees results in a cone. Intermediate values will result in a ring where one end is larger than the other.  
         *      
         *  **Note:** Depending on [member emission_ring_height], the angle may be clamped if the ring's end is reached to form a perfect cone.  
         */
        get emission_ring_cone_angle(): float64
        set emission_ring_cone_angle(value: float64)
        
        /** Align Y axis of particle with the direction of its velocity. */
        get particle_flag_align_y(): boolean
        set particle_flag_align_y(value: boolean)
        
        /** If `true`, particles rotate around Y axis by [member angle_min]. */
        get particle_flag_rotate_y(): boolean
        set particle_flag_rotate_y(value: boolean)
        
        /** If `true`, particles will not move on the Z axis. */
        get particle_flag_disable_z(): boolean
        set particle_flag_disable_z(value: boolean)
        
        /** Unit vector specifying the particles' emission direction. */
        get direction(): Vector3
        set direction(value: Vector3)
        
        /** Each particle's initial direction range from `+spread` to `-spread` degrees. Applied to X/Z plane and Y/Z planes. */
        get spread(): float64
        set spread(value: float64)
        
        /** Amount of [member spread] in Y/Z plane. A value of `1` restricts particles to X/Z plane. */
        get flatness(): float64
        set flatness(value: float64)
        
        /** Gravity applied to every particle. */
        get gravity(): Vector3
        set gravity(value: Vector3)
        
        /** Minimum value of the initial velocity. */
        get initial_velocity_min(): float64
        set initial_velocity_min(value: float64)
        
        /** Maximum value of the initial velocity. */
        get initial_velocity_max(): float64
        set initial_velocity_max(value: float64)
        
        /** Minimum initial angular velocity (rotation speed) applied to each particle in  *degrees*  per second. */
        get angular_velocity_min(): float64
        set angular_velocity_min(value: float64)
        
        /** Maximum initial angular velocity (rotation speed) applied to each particle in  *degrees*  per second. */
        get angular_velocity_max(): float64
        set angular_velocity_max(value: float64)
        
        /** Each particle's angular velocity (rotation speed) will vary along this [Curve] over its lifetime. Should be a unit [Curve]. */
        get angular_velocity_curve(): null | Curve
        set angular_velocity_curve(value: null | Curve)
        
        /** Minimum orbit velocity. */
        get orbit_velocity_min(): float64
        set orbit_velocity_min(value: float64)
        
        /** Maximum orbit velocity. */
        get orbit_velocity_max(): float64
        set orbit_velocity_max(value: float64)
        
        /** Each particle's orbital velocity will vary along this [Curve]. Should be a unit [Curve]. */
        get orbit_velocity_curve(): null | Curve
        set orbit_velocity_curve(value: null | Curve)
        
        /** Minimum linear acceleration. */
        get linear_accel_min(): float64
        set linear_accel_min(value: float64)
        
        /** Maximum linear acceleration. */
        get linear_accel_max(): float64
        set linear_accel_max(value: float64)
        
        /** Each particle's linear acceleration will vary along this [Curve]. Should be a unit [Curve]. */
        get linear_accel_curve(): null | Curve
        set linear_accel_curve(value: null | Curve)
        
        /** Minimum radial acceleration. */
        get radial_accel_min(): float64
        set radial_accel_min(value: float64)
        
        /** Maximum radial acceleration. */
        get radial_accel_max(): float64
        set radial_accel_max(value: float64)
        
        /** Each particle's radial acceleration will vary along this [Curve]. Should be a unit [Curve]. */
        get radial_accel_curve(): null | Curve
        set radial_accel_curve(value: null | Curve)
        
        /** Minimum tangent acceleration. */
        get tangential_accel_min(): float64
        set tangential_accel_min(value: float64)
        
        /** Maximum tangent acceleration. */
        get tangential_accel_max(): float64
        set tangential_accel_max(value: float64)
        
        /** Each particle's tangential acceleration will vary along this [Curve]. Should be a unit [Curve]. */
        get tangential_accel_curve(): null | Curve
        set tangential_accel_curve(value: null | Curve)
        
        /** Minimum damping. */
        get damping_min(): float64
        set damping_min(value: float64)
        
        /** Maximum damping. */
        get damping_max(): float64
        set damping_max(value: float64)
        
        /** Damping will vary along this [Curve]. Should be a unit [Curve]. */
        get damping_curve(): null | Curve
        set damping_curve(value: null | Curve)
        
        /** Minimum angle. */
        get angle_min(): float64
        set angle_min(value: float64)
        
        /** Maximum angle. */
        get angle_max(): float64
        set angle_max(value: float64)
        
        /** Each particle's rotation will be animated along this [Curve]. Should be a unit [Curve]. */
        get angle_curve(): null | Curve
        set angle_curve(value: null | Curve)
        
        /** Minimum scale. */
        get scale_amount_min(): float64
        set scale_amount_min(value: float64)
        
        /** Maximum scale. */
        get scale_amount_max(): float64
        set scale_amount_max(value: float64)
        
        /** Each particle's scale will vary along this [Curve]. Should be a unit [Curve]. */
        get scale_amount_curve(): null | Curve
        set scale_amount_curve(value: null | Curve)
        
        /** If set to `true`, three different scale curves can be specified, one per scale axis. */
        get split_scale(): boolean
        set split_scale(value: boolean)
        
        /** Curve for the scale over life, along the x axis. */
        get scale_curve_x(): null | Curve
        set scale_curve_x(value: null | Curve)
        
        /** Curve for the scale over life, along the y axis. */
        get scale_curve_y(): null | Curve
        set scale_curve_y(value: null | Curve)
        
        /** Curve for the scale over life, along the z axis. */
        get scale_curve_z(): null | Curve
        set scale_curve_z(value: null | Curve)
        
        /** Each particle's initial color.  
         *      
         *  **Note:** [member color] multiplies the particle mesh's vertex colors. To have a visible effect on a [BaseMaterial3D], [member BaseMaterial3D.vertex_color_use_as_albedo]  *must*  be `true`. For a [ShaderMaterial], `ALBEDO *= COLOR.rgb;` must be inserted in the shader's `fragment()` function. Otherwise, [member color] will have no visible effect.  
         */
        get color(): Color
        set color(value: Color)
        
        /** Each particle's color will vary along this [Gradient] over its lifetime (multiplied with [member color]).  
         *      
         *  **Note:** [member color_ramp] multiplies the particle mesh's vertex colors. To have a visible effect on a [BaseMaterial3D], [member BaseMaterial3D.vertex_color_use_as_albedo]  *must*  be `true`. For a [ShaderMaterial], `ALBEDO *= COLOR.rgb;` must be inserted in the shader's `fragment()` function. Otherwise, [member color_ramp] will have no visible effect.  
         */
        get color_ramp(): null | Gradient
        set color_ramp(value: null | Gradient)
        
        /** Each particle's initial color will vary along this [Gradient] (multiplied with [member color]).  
         *      
         *  **Note:** [member color_initial_ramp] multiplies the particle mesh's vertex colors. To have a visible effect on a [BaseMaterial3D], [member BaseMaterial3D.vertex_color_use_as_albedo]  *must*  be `true`. For a [ShaderMaterial], `ALBEDO *= COLOR.rgb;` must be inserted in the shader's `fragment()` function. Otherwise, [member color_initial_ramp] will have no visible effect.  
         */
        get color_initial_ramp(): null | Gradient
        set color_initial_ramp(value: null | Gradient)
        
        /** Minimum hue variation. */
        get hue_variation_min(): float64
        set hue_variation_min(value: float64)
        
        /** Maximum hue variation. */
        get hue_variation_max(): float64
        set hue_variation_max(value: float64)
        
        /** Each particle's hue will vary along this [Curve]. Should be a unit [Curve]. */
        get hue_variation_curve(): null | Curve
        set hue_variation_curve(value: null | Curve)
        
        /** Minimum particle animation speed. */
        get anim_speed_min(): float64
        set anim_speed_min(value: float64)
        
        /** Maximum particle animation speed. */
        get anim_speed_max(): float64
        set anim_speed_max(value: float64)
        
        /** Each particle's animation speed will vary along this [Curve]. Should be a unit [Curve]. */
        get anim_speed_curve(): null | Curve
        set anim_speed_curve(value: null | Curve)
        
        /** Minimum animation offset. */
        get anim_offset_min(): float64
        set anim_offset_min(value: float64)
        
        /** Maximum animation offset. */
        get anim_offset_max(): float64
        set anim_offset_max(value: float64)
        
        /** Each particle's animation offset will vary along this [Curve]. Should be a unit [Curve]. */
        get anim_offset_curve(): null | Curve
        set anim_offset_curve(value: null | Curve)
        
        /** Emitted when all active particles have finished processing. When [member one_shot] is disabled, particles will process continuously, so this is never emitted. */
        readonly finished: Signal<() => void>
        /** @deprecated Internal use. Does not exist at runtime. */
        __godotNameMap: __NameMapCPUParticles3D;
    }
    /** @deprecated Internal use. Does not exist at runtime. */
    interface __NameMapCSGBox3D extends __NameMapCSGPrimitive3D {
    }
    /** A CSG Box shape.  
     *  	  
     *  @link https://docs.godotengine.org/en/4.5/classes/class_csgbox3d.html  
     */
    class CSGBox3D<Map extends NodePathMap = any> extends CSGPrimitive3D<Map> {
        constructor(identifier?: any)
        /** The box's width, height and depth. */
        get size(): Vector3
        set size(value: Vector3)
        
        /** The material used to render the box. */
        get material(): null | BaseMaterial3D | ShaderMaterial
        set material(value: null | BaseMaterial3D | ShaderMaterial)
        /** @deprecated Internal use. Does not exist at runtime. */
        __godotNameMap: __NameMapCSGBox3D;
    }
    /** @deprecated Internal use. Does not exist at runtime. */
    interface __NameMapCSGCombiner3D extends __NameMapCSGShape3D {
    }
    /** A CSG node that allows you to combine other CSG modifiers.  
     *  	  
     *  @link https://docs.godotengine.org/en/4.5/classes/class_csgcombiner3d.html  
     */
    class CSGCombiner3D<Map extends NodePathMap = any> extends CSGShape3D<Map> {
        constructor(identifier?: any)
        /** @deprecated Internal use. Does not exist at runtime. */
        __godotNameMap: __NameMapCSGCombiner3D;
    }
    /** @deprecated Internal use. Does not exist at runtime. */
    interface __NameMapCSGCylinder3D extends __NameMapCSGPrimitive3D {
    }
    /** A CSG Cylinder shape.  
     *  	  
     *  @link https://docs.godotengine.org/en/4.5/classes/class_csgcylinder3d.html  
     */
    class CSGCylinder3D<Map extends NodePathMap = any> extends CSGPrimitive3D<Map> {
        constructor(identifier?: any)
        /** The radius of the cylinder. */
        get radius(): float64
        set radius(value: float64)
        
        /** The height of the cylinder. */
        get height(): float64
        set height(value: float64)
        
        /** The number of sides of the cylinder, the higher this number the more detail there will be in the cylinder. */
        get sides(): int64
        set sides(value: int64)
        
        /** If `true` a cone is created, the [member radius] will only apply to one side. */
        get cone(): boolean
        set cone(value: boolean)
        
        /** If `true` the normals of the cylinder are set to give a smooth effect making the cylinder seem rounded. If `false` the cylinder will have a flat shaded look. */
        get smooth_faces(): boolean
        set smooth_faces(value: boolean)
        
        /** The material used to render the cylinder. */
        get material(): null | BaseMaterial3D | ShaderMaterial
        set material(value: null | BaseMaterial3D | ShaderMaterial)
        /** @deprecated Internal use. Does not exist at runtime. */
        __godotNameMap: __NameMapCSGCylinder3D;
    }
    /** @deprecated Internal use. Does not exist at runtime. */
    interface __NameMapCSGMesh3D extends __NameMapCSGPrimitive3D {
    }
    /** A CSG Mesh shape that uses a mesh resource.  
     *  	  
     *  @link https://docs.godotengine.org/en/4.5/classes/class_csgmesh3d.html  
     */
    class CSGMesh3D<Map extends NodePathMap = any> extends CSGPrimitive3D<Map> {
        constructor(identifier?: any)
        /** The [Mesh] resource to use as a CSG shape.  
         *      
         *  **Note:** Some [Mesh] types such as [PlaneMesh], [PointMesh], [QuadMesh], and [RibbonTrailMesh] are excluded from the type hint for this property, as these primitives are non- *manifold*  and thus not compatible with the CSG algorithm.  
         *      
         *  **Note:** When using an [ArrayMesh], all vertex attributes except [constant Mesh.ARRAY_VERTEX], [constant Mesh.ARRAY_NORMAL] and [constant Mesh.ARRAY_TEX_UV] are left unused. Only [constant Mesh.ARRAY_VERTEX] and [constant Mesh.ARRAY_TEX_UV] will be passed to the GPU.  
         *  [constant Mesh.ARRAY_NORMAL] is only used to determine which faces require the use of flat shading. By default, CSGMesh will ignore the mesh's vertex normals, recalculate them for each vertex and use a smooth shader. If a flat shader is required for a face, ensure that all vertex normals of the face are approximately equal.  
         */
        get mesh(): null | Mesh | any /*-PlaneMesh*/ | any /*-PointMesh*/ | any /*-QuadMesh*/ | any /*-RibbonTrailMesh*/
        set mesh(value: null | Mesh | any /*-PlaneMesh*/ | any /*-PointMesh*/ | any /*-QuadMesh*/ | any /*-RibbonTrailMesh*/)
        
        /** The [Material] used in drawing the CSG shape. */
        get material(): null | BaseMaterial3D | ShaderMaterial
        set material(value: null | BaseMaterial3D | ShaderMaterial)
        /** @deprecated Internal use. Does not exist at runtime. */
        __godotNameMap: __NameMapCSGMesh3D;
    }
    namespace CSGPolygon3D {
        enum Mode {
            /** The [member polygon] shape is extruded along the negative Z axis. */
            MODE_DEPTH = 0,
            
            /** The [member polygon] shape is extruded by rotating it around the Y axis. */
            MODE_SPIN = 1,
            
            /** The [member polygon] shape is extruded along the [Path3D] specified in [member path_node]. */
            MODE_PATH = 2,
        }
        enum PathRotation {
            /** The [member polygon] shape is not rotated.  
             *      
             *  **Note:** Requires the path Z coordinates to continually decrease to ensure viable shapes.  
             */
            PATH_ROTATION_POLYGON = 0,
            
            /** The [member polygon] shape is rotated along the path, but it is not rotated around the path axis.  
             *      
             *  **Note:** Requires the path Z coordinates to continually decrease to ensure viable shapes.  
             */
            PATH_ROTATION_PATH = 1,
            
            /** The [member polygon] shape follows the path and its rotations around the path axis. */
            PATH_ROTATION_PATH_FOLLOW = 2,
        }
        enum PathIntervalType {
            /** When [member mode] is set to [constant MODE_PATH], [member path_interval] will determine the distance, in meters, each interval of the path will extrude. */
            PATH_INTERVAL_DISTANCE = 0,
            
            /** When [member mode] is set to [constant MODE_PATH], [member path_interval] will subdivide the polygons along the path. */
            PATH_INTERVAL_SUBDIVIDE = 1,
        }
    }
    /** @deprecated Internal use. Does not exist at runtime. */
    interface __NameMapCSGPolygon3D extends __NameMapCSGPrimitive3D {
    }
    /** Extrudes a 2D polygon shape to create a 3D mesh.  
     *  	  
     *  @link https://docs.godotengine.org/en/4.5/classes/class_csgpolygon3d.html  
     */
    class CSGPolygon3D<Map extends NodePathMap = any> extends CSGPrimitive3D<Map> {
        constructor(identifier?: any)
        _is_editable_3d_polygon(): boolean
        _has_editable_3d_polygon_no_depth(): boolean
        
        /** The point array that defines the 2D polygon that is extruded. This can be a convex or concave polygon with 3 or more points. The polygon must  *not*  have any intersecting edges. Otherwise, triangulation will fail and no mesh will be generated.  
         *      
         *  **Note:** If only 1 or 2 points are defined in [member polygon], no mesh will be generated.  
         */
        get polygon(): PackedVector2Array
        set polygon(value: PackedVector2Array | Vector2[])
        
        /** The [member mode] used to extrude the [member polygon]. */
        get mode(): int64
        set mode(value: int64)
        
        /** When [member mode] is [constant MODE_DEPTH], the depth of the extrusion. */
        get depth(): float64
        set depth(value: float64)
        
        /** When [member mode] is [constant MODE_SPIN], the total number of degrees the [member polygon] is rotated when extruding. */
        get spin_degrees(): float64
        set spin_degrees(value: float64)
        
        /** When [member mode] is [constant MODE_SPIN], the number of extrusions made. */
        get spin_sides(): int64
        set spin_sides(value: int64)
        
        /** When [member mode] is [constant MODE_PATH], the location of the [Path3D] object used to extrude the [member polygon]. */
        get path_node(): NodePath
        set path_node(value: NodePath | string)
        
        /** When [member mode] is [constant MODE_PATH], this will determine if the interval should be by distance ([constant PATH_INTERVAL_DISTANCE]) or subdivision fractions ([constant PATH_INTERVAL_SUBDIVIDE]). */
        get path_interval_type(): int64
        set path_interval_type(value: int64)
        
        /** When [member mode] is [constant MODE_PATH], the path interval or ratio of path points to extrusions. */
        get path_interval(): float64
        set path_interval(value: float64)
        
        /** When [member mode] is [constant MODE_PATH], extrusions that are less than this angle, will be merged together to reduce polygon count. */
        get path_simplify_angle(): float64
        set path_simplify_angle(value: float64)
        
        /** When [member mode] is [constant MODE_PATH], the path rotation method used to rotate the [member polygon] as it is extruded. */
        get path_rotation(): int64
        set path_rotation(value: int64)
        
        /** When [member mode] is [constant MODE_PATH], if `true` the polygon will be rotated according to the proper tangent of the path at the sampled points. If `false` an approximation is used, which decreases in accuracy as the number of subdivisions decreases. */
        get path_rotation_accurate(): boolean
        set path_rotation_accurate(value: boolean)
        
        /** When [member mode] is [constant MODE_PATH], if `true` the [Transform3D] of the [CSGPolygon3D] is used as the starting point for the extrusions, not the [Transform3D] of the [member path_node]. */
        get path_local(): boolean
        set path_local(value: boolean)
        
        /** When [member mode] is [constant MODE_PATH], by default, the top half of the [member material] is stretched along the entire length of the extruded shape. If `false` the top half of the material is repeated every step of the extrusion. */
        get path_continuous_u(): boolean
        set path_continuous_u(value: boolean)
        
        /** When [member mode] is [constant MODE_PATH], this is the distance along the path, in meters, the texture coordinates will tile. When set to 0, texture coordinates will match geometry exactly with no tiling. */
        get path_u_distance(): float64
        set path_u_distance(value: float64)
        
        /** When [member mode] is [constant MODE_PATH], if `true` the ends of the path are joined, by adding an extrusion between the last and first points of the path. */
        get path_joined(): boolean
        set path_joined(value: boolean)
        
        /** If `true`, applies smooth shading to the extrusions. */
        get smooth_faces(): boolean
        set smooth_faces(value: boolean)
        
        /** Material to use for the resulting mesh. The UV maps the top half of the material to the extruded shape (U along the length of the extrusions and V around the outline of the [member polygon]), the bottom-left quarter to the front end face, and the bottom-right quarter to the back end face. */
        get material(): null | BaseMaterial3D | ShaderMaterial
        set material(value: null | BaseMaterial3D | ShaderMaterial)
        /** @deprecated Internal use. Does not exist at runtime. */
        __godotNameMap: __NameMapCSGPolygon3D;
    }
    /** @deprecated Internal use. Does not exist at runtime. */
    interface __NameMapCSGPrimitive3D extends __NameMapCSGShape3D {
    }
    /** Base class for CSG primitives.  
     *  	  
     *  @link https://docs.godotengine.org/en/4.5/classes/class_csgprimitive3d.html  
     */
    class CSGPrimitive3D<Map extends NodePathMap = any> extends CSGShape3D<Map> {
        constructor(identifier?: any)
        /** If set, the order of the vertices in each triangle are reversed resulting in the backside of the mesh being drawn. */
        get flip_faces(): boolean
        set flip_faces(value: boolean)
        /** @deprecated Internal use. Does not exist at runtime. */
        __godotNameMap: __NameMapCSGPrimitive3D;
    }
    namespace CSGShape3D {
        enum Operation {
            /** Geometry of both primitives is merged, intersecting geometry is removed. */
            OPERATION_UNION = 0,
            
            /** Only intersecting geometry remains, the rest is removed. */
            OPERATION_INTERSECTION = 1,
            
            /** The second shape is subtracted from the first, leaving a dent with its shape. */
            OPERATION_SUBTRACTION = 2,
        }
    }
    /** @deprecated Internal use. Does not exist at runtime. */
    interface __NameMapCSGShape3D extends __NameMapGeometryInstance3D {
    }
    /** The CSG base class.  
     *  	  
     *  @link https://docs.godotengine.org/en/4.5/classes/class_csgshape3d.html  
     */
    class CSGShape3D<Map extends NodePathMap = any> extends GeometryInstance3D<Map> {
        constructor(identifier?: any)
        /** Returns `true` if this is a root shape and is thus the object that is rendered. */
        is_root_shape(): boolean
        _update_shape(): void
        
        /** Based on [param value], enables or disables the specified layer in the [member collision_mask], given a [param layer_number] between 1 and 32. */
        set_collision_mask_value(layer_number: int64, value: boolean): void
        
        /** Returns whether or not the specified layer of the [member collision_mask] is enabled, given a [param layer_number] between 1 and 32. */
        get_collision_mask_value(layer_number: int64): boolean
        _get_root_collision_instance(): RID
        
        /** Based on [param value], enables or disables the specified layer in the [member collision_layer], given a [param layer_number] between 1 and 32. */
        set_collision_layer_value(layer_number: int64, value: boolean): void
        
        /** Returns whether or not the specified layer of the [member collision_layer] is enabled, given a [param layer_number] between 1 and 32. */
        get_collision_layer_value(layer_number: int64): boolean
        
        /** Returns a baked physics [ConcavePolygonShape3D] of this node's CSG operation result. Returns an empty shape if the node is not a CSG root node or has no valid geometry.  
         *  **Performance:** If the CSG operation results in a very detailed geometry with many faces physics performance will be very slow. Concave shapes should in general only be used for static level geometry and not with dynamic objects that are moving.  
         *      
         *  **Note:** CSG mesh data updates are deferred, which means they are updated with a delay of one rendered frame. To avoid getting an empty shape or outdated mesh data, make sure to call `await get_tree().process_frame` before using [method bake_collision_shape] in [method Node._ready] or after changing properties on the [CSGShape3D].  
         */
        bake_collision_shape(): null | ConcavePolygonShape3D
        
        /** Returns an [Array] with two elements, the first is the [Transform3D] of this node and the second is the root [Mesh] of this node. Only works when this node is the root shape.  
         *      
         *  **Note:** CSG mesh data updates are deferred, which means they are updated with a delay of one rendered frame. To avoid getting an empty shape or outdated mesh data, make sure to call `await get_tree().process_frame` before using [method get_meshes] in [method Node._ready] or after changing properties on the [CSGShape3D].  
         */
        get_meshes(): GArray
        
        /** Returns a baked static [ArrayMesh] of this node's CSG operation result. Materials from involved CSG nodes are added as extra mesh surfaces. Returns an empty mesh if the node is not a CSG root node or has no valid geometry.  
         *      
         *  **Note:** CSG mesh data updates are deferred, which means they are updated with a delay of one rendered frame. To avoid getting an empty mesh or outdated mesh data, make sure to call `await get_tree().process_frame` before using [method bake_static_mesh] in [method Node._ready] or after changing properties on the [CSGShape3D].  
         */
        bake_static_mesh(): null | ArrayMesh
        
        /** The operation that is performed on this shape. This is ignored for the first CSG child node as the operation is between this node and the previous child of this nodes parent. */
        get operation(): int64
        set operation(value: int64)
        
        /** This property does nothing. */
        get snap(): float64
        set snap(value: float64)
        
        /** Calculate tangents for the CSG shape which allows the use of normal and height maps. This is only applied on the root shape, this setting is ignored on any child. Setting this to `false` can speed up shape generation slightly. */
        get calculate_tangents(): boolean
        set calculate_tangents(value: boolean)
        
        /** Adds a collision shape to the physics engine for our CSG shape. This will always act like a static body. Note that the collision shape is still active even if the CSG shape itself is hidden. See also [member collision_mask] and [member collision_priority]. */
        get use_collision(): boolean
        set use_collision(value: boolean)
        
        /** The physics layers this area is in.  
         *  Collidable objects can exist in any of 32 different layers. These layers work like a tagging system, and are not visual. A collidable can use these layers to select with which objects it can collide, using the collision_mask property.  
         *  A contact is detected if object A is in any of the layers that object B scans, or object B is in any layer scanned by object A. See [url=https://docs.godotengine.org/en/4.5/tutorials/physics/physics_introduction.html#collision-layers-and-masks]Collision layers and masks[/url] in the documentation for more information.  
         */
        get collision_layer(): int64
        set collision_layer(value: int64)
        
        /** The physics layers this CSG shape scans for collisions. Only effective if [member use_collision] is `true`. See [url=https://docs.godotengine.org/en/4.5/tutorials/physics/physics_introduction.html#collision-layers-and-masks]Collision layers and masks[/url] in the documentation for more information. */
        get collision_mask(): int64
        set collision_mask(value: int64)
        
        /** The priority used to solve colliding when occurring penetration. Only effective if [member use_collision] is `true`. The higher the priority is, the lower the penetration into the object will be. This can for example be used to prevent the player from breaking through the boundaries of a level. */
        get collision_priority(): float64
        set collision_priority(value: float64)
        /** @deprecated Internal use. Does not exist at runtime. */
        __godotNameMap: __NameMapCSGShape3D;
    }
    /** @deprecated Internal use. Does not exist at runtime. */
    interface __NameMapCSGSphere3D extends __NameMapCSGPrimitive3D {
    }
    /** A CSG Sphere shape.  
     *  	  
     *  @link https://docs.godotengine.org/en/4.5/classes/class_csgsphere3d.html  
     */
    class CSGSphere3D<Map extends NodePathMap = any> extends CSGPrimitive3D<Map> {
        constructor(identifier?: any)
        /** Radius of the sphere. */
        get radius(): float64
        set radius(value: float64)
        
        /** Number of vertical slices for the sphere. */
        get radial_segments(): int64
        set radial_segments(value: int64)
        
        /** Number of horizontal slices for the sphere. */
        get rings(): int64
        set rings(value: int64)
        
        /** If `true` the normals of the sphere are set to give a smooth effect making the sphere seem rounded. If `false` the sphere will have a flat shaded look. */
        get smooth_faces(): boolean
        set smooth_faces(value: boolean)
        
        /** The material used to render the sphere. */
        get material(): null | BaseMaterial3D | ShaderMaterial
        set material(value: null | BaseMaterial3D | ShaderMaterial)
        /** @deprecated Internal use. Does not exist at runtime. */
        __godotNameMap: __NameMapCSGSphere3D;
    }
    /** @deprecated Internal use. Does not exist at runtime. */
    interface __NameMapCSGTorus3D extends __NameMapCSGPrimitive3D {
    }
    /** A CSG Torus shape.  
     *  	  
     *  @link https://docs.godotengine.org/en/4.5/classes/class_csgtorus3d.html  
     */
    class CSGTorus3D<Map extends NodePathMap = any> extends CSGPrimitive3D<Map> {
        constructor(identifier?: any)
        /** The inner radius of the torus. */
        get inner_radius(): float64
        set inner_radius(value: float64)
        
        /** The outer radius of the torus. */
        get outer_radius(): float64
        set outer_radius(value: float64)
        
        /** The number of slices the torus is constructed of. */
        get sides(): int64
        set sides(value: int64)
        
        /** The number of edges each ring of the torus is constructed of. */
        get ring_sides(): int64
        set ring_sides(value: int64)
        
        /** If `true` the normals of the torus are set to give a smooth effect making the torus seem rounded. If `false` the torus will have a flat shaded look. */
        get smooth_faces(): boolean
        set smooth_faces(value: boolean)
        
        /** The material used to render the torus. */
        get material(): null | BaseMaterial3D | ShaderMaterial
        set material(value: null | BaseMaterial3D | ShaderMaterial)
        /** @deprecated Internal use. Does not exist at runtime. */
        __godotNameMap: __NameMapCSGTorus3D;
    }
    /** @deprecated Internal use. Does not exist at runtime. */
    interface __NameMapCallbackTweener extends __NameMapTweener {
    }
    /** Calls the specified method after optional delay.  
     *  	  
     *  @link https://docs.godotengine.org/en/4.5/classes/class_callbacktweener.html  
     */
    class CallbackTweener extends Tweener {
        constructor(identifier?: any)
        /** Makes the callback call delayed by given time in seconds.  
         *  **Example:** Call [method Node.queue_free] after 2 seconds:  
         *    
         */
        set_delay(delay: float64): null | CallbackTweener
        /** @deprecated Internal use. Does not exist at runtime. */
        __godotNameMap: __NameMapCallbackTweener;
    }
    namespace Camera2D {
        enum AnchorMode {
            /** The camera's position is fixed so that the top-left corner is always at the origin. */
            ANCHOR_MODE_FIXED_TOP_LEFT = 0,
            
            /** The camera's position takes into account vertical/horizontal offsets and the screen size. */
            ANCHOR_MODE_DRAG_CENTER = 1,
        }
        enum Camera2DProcessCallback {
            /** The camera updates during physics frames (see [constant Node.NOTIFICATION_INTERNAL_PHYSICS_PROCESS]). */
            CAMERA2D_PROCESS_PHYSICS = 0,
            
            /** The camera updates during process frames (see [constant Node.NOTIFICATION_INTERNAL_PROCESS]). */
            CAMERA2D_PROCESS_IDLE = 1,
        }
    }
    /** @deprecated Internal use. Does not exist at runtime. */
    interface __NameMapCamera2D extends __NameMapNode2D {
    }
    /** Camera node for 2D scenes.  
     *  	  
     *  @link https://docs.godotengine.org/en/4.5/classes/class_camera2d.html  
     */
    class Camera2D<Map extends NodePathMap = any> extends Node2D<Map> {
        constructor(identifier?: any)
        _update_scroll(): void
        
        /** Forces this [Camera2D] to become the current active one. [member enabled] must be `true`. */
        make_current(): void
        
        /** Returns `true` if this [Camera2D] is the active camera (see [method Viewport.get_camera_2d]). */
        is_current(): boolean
        _make_current(_unnamed_arg0: Object): void
        
        /** Sets the camera limit for the specified [enum Side]. See also [member limit_bottom], [member limit_top], [member limit_left], and [member limit_right]. */
        set_limit(margin: Side, limit: int64): void
        
        /** Returns the camera limit for the specified [enum Side]. See also [member limit_bottom], [member limit_top], [member limit_left], and [member limit_right]. */
        get_limit(margin: Side): int64
        _set_limit_rect(rect: Rect2i): void
        
        /** Sets the specified [enum Side]'s margin. See also [member drag_bottom_margin], [member drag_top_margin], [member drag_left_margin], and [member drag_right_margin]. */
        set_drag_margin(margin: Side, drag_margin: float64): void
        
        /** Returns the specified [enum Side]'s margin. See also [member drag_bottom_margin], [member drag_top_margin], [member drag_left_margin], and [member drag_right_margin]. */
        get_drag_margin(margin: Side): float64
        
        /** Returns this camera's target position, in global coordinates.  
         *      
         *  **Note:** The returned value is not the same as [member Node2D.global_position], as it is affected by the drag properties. It is also not the same as the current position if [member position_smoothing_enabled] is `true` (see [method get_screen_center_position]).  
         */
        get_target_position(): Vector2
        
        /** Returns the center of the screen from this camera's point of view, in global coordinates.  
         *      
         *  **Note:** The exact targeted position of the camera may be different. See [method get_target_position].  
         */
        get_screen_center_position(): Vector2
        
        /** Returns the current screen rotation from this camera's point of view.  
         *      
         *  **Note:** The screen rotation can be different from [member Node2D.global_rotation] if the camera is rotating smoothly due to [member rotation_smoothing_enabled].  
         */
        get_screen_rotation(): float64
        
        /** Forces the camera to update scroll immediately. */
        force_update_scroll(): void
        
        /** Sets the camera's position immediately to its current smoothing destination.  
         *  This method has no effect if [member position_smoothing_enabled] is `false`.  
         */
        reset_smoothing(): void
        
        /** Aligns the camera to the tracked node. */
        align(): void
        
        /** The camera's relative offset. Useful for looking around or camera shake animations. The offsetted camera can go past the limits defined in [member limit_top], [member limit_bottom], [member limit_left] and [member limit_right]. */
        get offset(): Vector2
        set offset(value: Vector2)
        
        /** The Camera2D's anchor point. */
        get anchor_mode(): int64
        set anchor_mode(value: int64)
        
        /** If `true`, the camera's rendered view is not affected by its [member Node2D.rotation] and [member Node2D.global_rotation]. */
        get ignore_rotation(): boolean
        set ignore_rotation(value: boolean)
        
        /** Controls whether the camera can be active or not. If `true`, the [Camera2D] will become the main camera when it enters the scene tree and there is no active camera currently (see [method Viewport.get_camera_2d]).  
         *  When the camera is currently active and [member enabled] is set to `false`, the next enabled [Camera2D] in the scene tree will become active.  
         */
        get enabled(): boolean
        set enabled(value: boolean)
        
        /** The camera's zoom. Higher values are more zoomed in. For example, a zoom of `Vector2(2.0, 2.0)` will be twice as zoomed in on each axis (the view covers an area four times smaller). In contrast, a zoom of `Vector2(0.5, 0.5)` will be twice as zoomed out on each axis (the view covers an area four times larger). The X and Y components should generally always be set to the same value, unless you wish to stretch the camera view.  
         *      
         *  **Note:** [member FontFile.oversampling] does  *not*  take [Camera2D] zoom into account. This means that zooming in/out will cause bitmap fonts and rasterized (non-MSDF) dynamic fonts to appear blurry or pixelated unless the font is part of a [CanvasLayer] that makes it ignore camera zoom. To ensure text remains crisp regardless of zoom, you can enable MSDF font rendering by enabling [member ProjectSettings.gui/theme/default_font_multichannel_signed_distance_field] (applies to the default project font only), or enabling **Multichannel Signed Distance Field** in the import options of a DynamicFont for custom fonts. On system fonts, [member SystemFont.multichannel_signed_distance_field] can be enabled in the inspector.  
         */
        get zoom(): Vector2
        set zoom(value: Vector2)
        
        /** The custom [Viewport] node attached to the [Camera2D]. If `null` or not a [Viewport], uses the default viewport instead. */
        get custom_viewport(): null | Viewport
        set custom_viewport(value: null | Viewport)
        
        /** The camera's process callback. */
        get process_callback(): int64
        set process_callback(value: int64)
        
        /** If `true`, the limits will be enabled. Disabling this will allow the camera to focus anywhere, when the four `limit_*` properties will not work. */
        get limit_enabled(): boolean
        set limit_enabled(value: boolean)
        
        /** Left scroll limit in pixels. The camera stops moving when reaching this value, but [member offset] can push the view past the limit. */
        get limit_left(): int64
        set limit_left(value: int64)
        
        /** Top scroll limit in pixels. The camera stops moving when reaching this value, but [member offset] can push the view past the limit. */
        get limit_top(): int64
        set limit_top(value: int64)
        
        /** Right scroll limit in pixels. The camera stops moving when reaching this value, but [member offset] can push the view past the limit. */
        get limit_right(): int64
        set limit_right(value: int64)
        
        /** Bottom scroll limit in pixels. The camera stops moving when reaching this value, but [member offset] can push the view past the limit. */
        get limit_bottom(): int64
        set limit_bottom(value: int64)
        
        /** If `true`, the camera smoothly stops when reaches its limits.  
         *  This property has no effect if [member position_smoothing_enabled] is `false`.  
         *      
         *  **Note:** To immediately update the camera's position to be within limits without smoothing, even with this setting enabled, invoke [method reset_smoothing].  
         */
        get limit_smoothed(): boolean
        set limit_smoothed(value: boolean)
        
        /** If `true`, the camera's view smoothly moves towards its target position at [member position_smoothing_speed]. */
        get position_smoothing_enabled(): boolean
        set position_smoothing_enabled(value: boolean)
        
        /** Speed in pixels per second of the camera's smoothing effect when [member position_smoothing_enabled] is `true`. */
        get position_smoothing_speed(): float64
        set position_smoothing_speed(value: float64)
        
        /** If `true`, the camera's view smoothly rotates, via asymptotic smoothing, to align with its target rotation at [member rotation_smoothing_speed].  
         *      
         *  **Note:** This property has no effect if [member ignore_rotation] is `true`.  
         */
        get rotation_smoothing_enabled(): boolean
        set rotation_smoothing_enabled(value: boolean)
        
        /** The angular, asymptotic speed of the camera's rotation smoothing effect when [member rotation_smoothing_enabled] is `true`. */
        get rotation_smoothing_speed(): float64
        set rotation_smoothing_speed(value: float64)
        
        /** If `true`, the camera only moves when reaching the horizontal (left and right) drag margins. If `false`, the camera moves horizontally regardless of margins. */
        get drag_horizontal_enabled(): boolean
        set drag_horizontal_enabled(value: boolean)
        
        /** If `true`, the camera only moves when reaching the vertical (top and bottom) drag margins. If `false`, the camera moves vertically regardless of the drag margins. */
        get drag_vertical_enabled(): boolean
        set drag_vertical_enabled(value: boolean)
        
        /** The relative horizontal drag offset of the camera between the right (`-1`) and left (`1`) drag margins.  
         *      
         *  **Note:** Used to set the initial horizontal drag offset; determine the current offset; or force the current offset. It's not automatically updated when [member drag_horizontal_enabled] is `true` or the drag margins are changed.  
         */
        get drag_horizontal_offset(): float64
        set drag_horizontal_offset(value: float64)
        
        /** The relative vertical drag offset of the camera between the bottom (`-1`) and top (`1`) drag margins.  
         *      
         *  **Note:** Used to set the initial vertical drag offset; determine the current offset; or force the current offset. It's not automatically updated when [member drag_vertical_enabled] is `true` or the drag margins are changed.  
         */
        get drag_vertical_offset(): float64
        set drag_vertical_offset(value: float64)
        
        /** Left margin needed to drag the camera. A value of `1` makes the camera move only when reaching the left edge of the screen. */
        get drag_left_margin(): float64
        set drag_left_margin(value: float64)
        
        /** Top margin needed to drag the camera. A value of `1` makes the camera move only when reaching the top edge of the screen. */
        get drag_top_margin(): float64
        set drag_top_margin(value: float64)
        
        /** Right margin needed to drag the camera. A value of `1` makes the camera move only when reaching the right edge of the screen. */
        get drag_right_margin(): float64
        set drag_right_margin(value: float64)
        
        /** Bottom margin needed to drag the camera. A value of `1` makes the camera move only when reaching the bottom edge of the screen. */
        get drag_bottom_margin(): float64
        set drag_bottom_margin(value: float64)
        
        /** If `true`, draws the camera's screen rectangle in the editor. */
        get editor_draw_screen(): boolean
        set editor_draw_screen(value: boolean)
        
        /** If `true`, draws the camera's limits rectangle in the editor. */
        get editor_draw_limits(): boolean
        set editor_draw_limits(value: boolean)
        
        /** If `true`, draws the camera's drag margin rectangle in the editor. */
        get editor_draw_drag_margin(): boolean
        set editor_draw_drag_margin(value: boolean)
        /** @deprecated Internal use. Does not exist at runtime. */
        __godotNameMap: __NameMapCamera2D;
    }
    namespace Camera3D {
        enum ProjectionType {
            /** Perspective projection. Objects on the screen becomes smaller when they are far away. */
            PROJECTION_PERSPECTIVE = 0,
            
            /** Orthogonal projection, also known as orthographic projection. Objects remain the same size on the screen no matter how far away they are. */
            PROJECTION_ORTHOGONAL = 1,
            
            /** Frustum projection. This mode allows adjusting [member frustum_offset] to create "tilted frustum" effects. */
            PROJECTION_FRUSTUM = 2,
        }
        enum KeepAspect {
            /** Preserves the horizontal aspect ratio; also known as Vert- scaling. This is usually the best option for projects running in portrait mode, as taller aspect ratios will benefit from a wider vertical FOV. */
            KEEP_WIDTH = 0,
            
            /** Preserves the vertical aspect ratio; also known as Hor+ scaling. This is usually the best option for projects running in landscape mode, as wider aspect ratios will automatically benefit from a wider horizontal FOV. */
            KEEP_HEIGHT = 1,
        }
        enum DopplerTracking {
            /** Disables [url=https://en.wikipedia.org/wiki/Doppler_effect]Doppler effect[/url] simulation (default). */
            DOPPLER_TRACKING_DISABLED = 0,
            
            /** Simulate [url=https://en.wikipedia.org/wiki/Doppler_effect]Doppler effect[/url] by tracking positions of objects that are changed in `_process`. Changes in the relative velocity of this camera compared to those objects affect how audio is perceived (changing the audio's [member AudioStreamPlayer3D.pitch_scale]). */
            DOPPLER_TRACKING_IDLE_STEP = 1,
            
            /** Simulate [url=https://en.wikipedia.org/wiki/Doppler_effect]Doppler effect[/url] by tracking positions of objects that are changed in `_physics_process`. Changes in the relative velocity of this camera compared to those objects affect how audio is perceived (changing the audio's [member AudioStreamPlayer3D.pitch_scale]). */
            DOPPLER_TRACKING_PHYSICS_STEP = 2,
        }
    }
    /** @deprecated Internal use. Does not exist at runtime. */
    interface __NameMapCamera3D extends __NameMapNode3D {
    }
    /** Camera node, displays from a point of view.  
     *  	  
     *  @link https://docs.godotengine.org/en/4.5/classes/class_camera3d.html  
     */
    class Camera3D<Map extends NodePathMap = any> extends Node3D<Map> {
        constructor(identifier?: any)
        /** Returns a normal vector in world space, that is the result of projecting a point on the [Viewport] rectangle by the inverse camera projection. This is useful for casting rays in the form of (origin, normal) for object intersection or picking. */
        project_ray_normal(screen_point: Vector2): Vector3
        
        /** Returns a normal vector from the screen point location directed along the camera. Orthogonal cameras are normalized. Perspective cameras account for perspective, screen width/height, etc. */
        project_local_ray_normal(screen_point: Vector2): Vector3
        
        /** Returns a 3D position in world space, that is the result of projecting a point on the [Viewport] rectangle by the inverse camera projection. This is useful for casting rays in the form of (origin, normal) for object intersection or picking. */
        project_ray_origin(screen_point: Vector2): Vector3
        
        /** Returns the 2D coordinate in the [Viewport] rectangle that maps to the given 3D point in world space.  
         *      
         *  **Note:** When using this to position GUI elements over a 3D viewport, use [method is_position_behind] to prevent them from appearing if the 3D point is behind the camera:  
         *    
         */
        unproject_position(world_point: Vector3): Vector2
        
        /** Returns `true` if the given position is behind the camera (the blue part of the linked diagram). [url=https://raw.githubusercontent.com/godotengine/godot-docs/master/img/camera3d_position_frustum.png]See this diagram[/url] for an overview of position query methods.  
         *      
         *  **Note:** A position which returns `false` may still be outside the camera's field of view.  
         */
        is_position_behind(world_point: Vector3): boolean
        
        /** Returns the 3D point in world space that maps to the given 2D coordinate in the [Viewport] rectangle on a plane that is the given [param z_depth] distance into the scene away from the camera. */
        project_position(screen_point: Vector2, z_depth: float64): Vector3
        
        /** Sets the camera projection to perspective mode (see [constant PROJECTION_PERSPECTIVE]), by specifying a [param fov] (field of view) angle in degrees, and the [param z_near] and [param z_far] clip planes in world space units. */
        set_perspective(fov: float64, z_near: float64, z_far: float64): void
        
        /** Sets the camera projection to orthogonal mode (see [constant PROJECTION_ORTHOGONAL]), by specifying a [param size], and the [param z_near] and [param z_far] clip planes in world space units.  
         *  As a hint, 3D games that look 2D often use this projection, with [param size] specified in pixels.  
         */
        set_orthogonal(size: float64, z_near: float64, z_far: float64): void
        
        /** Sets the camera projection to frustum mode (see [constant PROJECTION_FRUSTUM]), by specifying a [param size], an [param offset], and the [param z_near] and [param z_far] clip planes in world space units. See also [member frustum_offset]. */
        set_frustum(size: float64, offset: Vector2, z_near: float64, z_far: float64): void
        
        /** Makes this camera the current camera for the [Viewport] (see class description). If the camera node is outside the scene tree, it will attempt to become current once it's added. */
        make_current(): void
        
        /** If this is the current camera, remove it from being current. If [param enable_next] is `true`, request to make the next camera current, if any. */
        clear_current(enable_next?: boolean /* = true */): void
        
        /** Returns the transform of the camera plus the vertical ([member v_offset]) and horizontal ([member h_offset]) offsets; and any other adjustments made to the position and orientation of the camera by subclassed cameras such as [XRCamera3D]. */
        get_camera_transform(): Transform3D
        
        /** Returns the projection matrix that this camera uses to render to its associated viewport. The camera must be part of the scene tree to function. */
        get_camera_projection(): Projection
        
        /** Returns the camera's frustum planes in world space units as an array of [Plane]s in the following order: near, far, left, top, right, bottom. Not to be confused with [member frustum_offset]. */
        get_frustum(): GArray<Plane>
        
        /** Returns `true` if the given position is inside the camera's frustum (the green part of the linked diagram). [url=https://raw.githubusercontent.com/godotengine/godot-docs/master/img/camera3d_position_frustum.png]See this diagram[/url] for an overview of position query methods. */
        is_position_in_frustum(world_point: Vector3): boolean
        
        /** Returns the camera's RID from the [RenderingServer]. */
        get_camera_rid(): RID
        
        /** Returns the RID of a pyramid shape encompassing the camera's view frustum, ignoring the camera's near plane. The tip of the pyramid represents the position of the camera. */
        get_pyramid_shape_rid(): RID
        
        /** Based on [param value], enables or disables the specified layer in the [member cull_mask], given a [param layer_number] between 1 and 20. */
        set_cull_mask_value(layer_number: int64, value: boolean): void
        
        /** Returns whether or not the specified layer of the [member cull_mask] is enabled, given a [param layer_number] between 1 and 20. */
        get_cull_mask_value(layer_number: int64): boolean
        
        /** The axis to lock during [member fov]/[member size] adjustments. Can be either [constant KEEP_WIDTH] or [constant KEEP_HEIGHT]. */
        get keep_aspect(): int64
        set keep_aspect(value: int64)
        
        /** The culling mask that describes which [member VisualInstance3D.layers] are rendered by this camera. By default, all 20 user-visible layers are rendered.  
         *      
         *  **Note:** Since the [member cull_mask] allows for 32 layers to be stored in total, there are an additional 12 layers that are only used internally by the engine and aren't exposed in the editor. Setting [member cull_mask] using a script allows you to toggle those reserved layers, which can be useful for editor plugins.  
         *  To adjust [member cull_mask] more easily using a script, use [method get_cull_mask_value] and [method set_cull_mask_value].  
         *      
         *  **Note:** [VoxelGI], SDFGI and [LightmapGI] will always take all layers into account to determine what contributes to global illumination. If this is an issue, set [member GeometryInstance3D.gi_mode] to [constant GeometryInstance3D.GI_MODE_DISABLED] for meshes and [member Light3D.light_bake_mode] to [constant Light3D.BAKE_DISABLED] for lights to exclude them from global illumination.  
         */
        get cull_mask(): int64
        set cull_mask(value: int64)
        
        /** The [Environment] to use for this camera. */
        get environment(): null | Environment
        set environment(value: null | Environment)
        
        /** The [CameraAttributes] to use for this camera. */
        get attributes(): null | CameraAttributesPractical | CameraAttributesPhysical
        set attributes(value: null | CameraAttributesPractical | CameraAttributesPhysical)
        
        /** The [Compositor] to use for this camera. */
        get compositor(): null | Compositor
        set compositor(value: null | Compositor)
        
        /** The horizontal (X) offset of the camera viewport. */
        get h_offset(): float64
        set h_offset(value: float64)
        
        /** The vertical (Y) offset of the camera viewport. */
        get v_offset(): float64
        set v_offset(value: float64)
        
        /** If not [constant DOPPLER_TRACKING_DISABLED], this camera will simulate the [url=https://en.wikipedia.org/wiki/Doppler_effect]Doppler effect[/url] for objects changed in particular `_process` methods.  
         *      
         *  **Note:** The Doppler effect will only be heard on [AudioStreamPlayer3D]s if [member AudioStreamPlayer3D.doppler_tracking] is not set to [constant AudioStreamPlayer3D.DOPPLER_TRACKING_DISABLED].  
         */
        get doppler_tracking(): int64
        set doppler_tracking(value: int64)
        
        /** The camera's projection mode. In [constant PROJECTION_PERSPECTIVE] mode, objects' Z distance from the camera's local space scales their perceived size. */
        get projection(): int64
        set projection(value: int64)
        
        /** If `true`, the ancestor [Viewport] is currently using this camera.  
         *  If multiple cameras are in the scene, one will always be made current. For example, if two [Camera3D] nodes are present in the scene and only one is current, setting one camera's [member current] to `false` will cause the other camera to be made current.  
         */
        get current(): boolean
        set current(value: boolean)
        
        /** The camera's field of view angle (in degrees). Only applicable in perspective mode. Since [member keep_aspect] locks one axis, [member fov] sets the other axis' field of view angle.  
         *  For reference, the default vertical field of view value (`75.0`) is equivalent to a horizontal FOV of:  
         *  - ~91.31 degrees in a 4:3 viewport  
         *  - ~101.67 degrees in a 16:10 viewport  
         *  - ~107.51 degrees in a 16:9 viewport  
         *  - ~121.63 degrees in a 21:9 viewport  
         */
        get fov(): float64
        set fov(value: float64)
        
        /** The camera's size in meters measured as the diameter of the width or height, depending on [member keep_aspect]. Only applicable in orthogonal and frustum modes. */
        get size(): float64
        set size(value: float64)
        
        /** The camera's frustum offset. This can be changed from the default to create "tilted frustum" effects such as [url=https://zdoom.org/wiki/Y-shearing]Y-shearing[/url].  
         *      
         *  **Note:** Only effective if [member projection] is [constant PROJECTION_FRUSTUM].  
         */
        get frustum_offset(): Vector2
        set frustum_offset(value: Vector2)
        
        /** The distance to the near culling boundary for this camera relative to its local Z axis. Lower values allow the camera to see objects more up close to its origin, at the cost of lower precision across the  *entire*  range. Values lower than the default can lead to increased Z-fighting. */
        get near(): float64
        set near(value: float64)
        
        /** The distance to the far culling boundary for this camera relative to its local Z axis. Higher values allow the camera to see further away, while decreasing [member far] can improve performance if it results in objects being partially or fully culled. */
        get far(): float64
        set far(value: float64)
        /** @deprecated Internal use. Does not exist at runtime. */
        __godotNameMap: __NameMapCamera3D;
    }
    /** @deprecated Internal use. Does not exist at runtime. */
    interface __NameMapCameraAttributes extends __NameMapResource {
    }
    /** Parent class for camera settings.  
     *  	  
     *  @link https://docs.godotengine.org/en/4.5/classes/class_cameraattributes.html  
     */
    class CameraAttributes extends Resource {
        constructor(identifier?: any)
        /** Sensitivity of camera sensors, measured in ISO. A higher sensitivity results in a brighter image.  
         *  If [member auto_exposure_enabled] is `true`, this can be used as a method of exposure compensation, doubling the value will increase the exposure value (measured in EV100) by 1 stop.  
         *      
         *  **Note:** Only available when [member ProjectSettings.rendering/lights_and_shadows/use_physical_light_units] is enabled.  
         */
        get exposure_sensitivity(): float64
        set exposure_sensitivity(value: float64)
        
        /** Multiplier for the exposure amount. A higher value results in a brighter image. */
        get exposure_multiplier(): float64
        set exposure_multiplier(value: float64)
        
        /** If `true`, enables the tonemapping auto exposure mode of the scene renderer. If `true`, the renderer will automatically determine the exposure setting to adapt to the scene's illumination and the observed light. */
        get auto_exposure_enabled(): boolean
        set auto_exposure_enabled(value: boolean)
        
        /** The scale of the auto exposure effect. Affects the intensity of auto exposure. */
        get auto_exposure_scale(): float64
        set auto_exposure_scale(value: float64)
        
        /** The speed of the auto exposure effect. Affects the time needed for the camera to perform auto exposure. */
        get auto_exposure_speed(): float64
        set auto_exposure_speed(value: float64)
        /** @deprecated Internal use. Does not exist at runtime. */
        __godotNameMap: __NameMapCameraAttributes;
    }
    /** @deprecated Internal use. Does not exist at runtime. */
    interface __NameMapCameraAttributesPhysical extends __NameMapCameraAttributes {
    }
    /** Physically-based camera settings.  
     *  	  
     *  @link https://docs.godotengine.org/en/4.5/classes/class_cameraattributesphysical.html  
     */
    class CameraAttributesPhysical extends CameraAttributes {
        constructor(identifier?: any)
        /** Returns the vertical field of view that corresponds to the [member frustum_focal_length]. This value is calculated internally whenever [member frustum_focal_length] is changed. */
        get_fov(): float64
        
        /** Distance from camera of object that will be in focus, measured in meters. Internally this will be clamped to be at least 1 millimeter larger than [member frustum_focal_length]. */
        get frustum_focus_distance(): float64
        set frustum_focus_distance(value: float64)
        
        /** Distance between camera lens and camera aperture, measured in millimeters. Controls field of view and depth of field. A larger focal length will result in a smaller field of view and a narrower depth of field meaning fewer objects will be in focus. A smaller focal length will result in a wider field of view and a larger depth of field meaning more objects will be in focus. When attached to a [Camera3D] as its [member Camera3D.attributes], it will override the [member Camera3D.fov] property and the [member Camera3D.keep_aspect] property. */
        get frustum_focal_length(): float64
        set frustum_focal_length(value: float64)
        
        /** Override value for [member Camera3D.near]. Used internally when calculating depth of field. When attached to a [Camera3D] as its [member Camera3D.attributes], it will override the [member Camera3D.near] property. */
        get frustum_near(): float64
        set frustum_near(value: float64)
        
        /** Override value for [member Camera3D.far]. Used internally when calculating depth of field. When attached to a [Camera3D] as its [member Camera3D.attributes], it will override the [member Camera3D.far] property. */
        get frustum_far(): float64
        set frustum_far(value: float64)
        
        /** Size of the aperture of the camera, measured in f-stops. An f-stop is a unitless ratio between the focal length of the camera and the diameter of the aperture. A high aperture setting will result in a smaller aperture which leads to a dimmer image and sharper focus. A low aperture results in a wide aperture which lets in more light resulting in a brighter, less-focused image. Default is appropriate for outdoors at daytime (i.e. for use with a default [DirectionalLight3D]), for indoor lighting, a value between 2 and 4 is more appropriate.  
         *  Only available when [member ProjectSettings.rendering/lights_and_shadows/use_physical_light_units] is enabled.  
         */
        get exposure_aperture(): float64
        set exposure_aperture(value: float64)
        
        /** Time for shutter to open and close, evaluated as `1 / shutter_speed` seconds. A higher value will allow less light (leading to a darker image), while a lower value will allow more light (leading to a brighter image).  
         *  Only available when [member ProjectSettings.rendering/lights_and_shadows/use_physical_light_units] is enabled.  
         */
        get exposure_shutter_speed(): float64
        set exposure_shutter_speed(value: float64)
        
        /** The minimum luminance (in EV100) used when calculating auto exposure. When calculating scene average luminance, color values will be clamped to at least this value. This limits the auto-exposure from exposing above a certain brightness, resulting in a cut off point where the scene will remain dark. */
        get auto_exposure_min_exposure_value(): float64
        set auto_exposure_min_exposure_value(value: float64)
        
        /** The maximum luminance (in EV100) used when calculating auto exposure. When calculating scene average luminance, color values will be clamped to at least this value. This limits the auto-exposure from exposing below a certain brightness, resulting in a cut off point where the scene will remain bright. */
        get auto_exposure_max_exposure_value(): float64
        set auto_exposure_max_exposure_value(value: float64)
        /** @deprecated Internal use. Does not exist at runtime. */
        __godotNameMap: __NameMapCameraAttributesPhysical;
    }
    /** @deprecated Internal use. Does not exist at runtime. */
    interface __NameMapCameraAttributesPractical extends __NameMapCameraAttributes {
    }
    /** Camera settings in an easy to use format.  
     *  	  
     *  @link https://docs.godotengine.org/en/4.5/classes/class_cameraattributespractical.html  
     */
    class CameraAttributesPractical extends CameraAttributes {
        constructor(identifier?: any)
        /** Enables depth of field blur for objects further than [member dof_blur_far_distance]. Strength of blur is controlled by [member dof_blur_amount] and modulated by [member dof_blur_far_transition].  
         *      
         *  **Note:** Depth of field blur is only supported in the Forward+ and Mobile rendering methods, not Compatibility.  
         *      
         *  **Note:** Depth of field blur is not supported on viewports that have a transparent background (where [member Viewport.transparent_bg] is `true`).  
         */
        get dof_blur_far_enabled(): boolean
        set dof_blur_far_enabled(value: boolean)
        
        /** Objects further from the [Camera3D] by this amount will be blurred by the depth of field effect. Measured in meters. */
        get dof_blur_far_distance(): float64
        set dof_blur_far_distance(value: float64)
        
        /** When positive, distance over which (starting from [member dof_blur_far_distance]) blur effect will scale from 0 to [member dof_blur_amount]. When negative, uses physically-based scaling so depth of field effect will scale from 0 at [member dof_blur_far_distance] and will increase in a physically accurate way as objects get further from the [Camera3D]. */
        get dof_blur_far_transition(): float64
        set dof_blur_far_transition(value: float64)
        
        /** Enables depth of field blur for objects closer than [member dof_blur_near_distance]. Strength of blur is controlled by [member dof_blur_amount] and modulated by [member dof_blur_near_transition].  
         *      
         *  **Note:** Depth of field blur is only supported in the Forward+ and Mobile rendering methods, not Compatibility.  
         *      
         *  **Note:** Depth of field blur is not supported on viewports that have a transparent background (where [member Viewport.transparent_bg] is `true`).  
         */
        get dof_blur_near_enabled(): boolean
        set dof_blur_near_enabled(value: boolean)
        
        /** Objects closer from the [Camera3D] by this amount will be blurred by the depth of field effect. Measured in meters. */
        get dof_blur_near_distance(): float64
        set dof_blur_near_distance(value: float64)
        
        /** When positive, distance over which blur effect will scale from 0 to [member dof_blur_amount], ending at [member dof_blur_near_distance]. When negative, uses physically-based scaling so depth of field effect will scale from 0 at [member dof_blur_near_distance] and will increase in a physically accurate way as objects get closer to the [Camera3D]. */
        get dof_blur_near_transition(): float64
        set dof_blur_near_transition(value: float64)
        
        /** Sets the maximum amount of blur. When using physically-based blur amounts, will instead act as a multiplier. High values lead to an increased amount of blurriness, but can be much more expensive to calculate. It is best to keep this as low as possible for a given art style. */
        get dof_blur_amount(): float64
        set dof_blur_amount(value: float64)
        
        /** The minimum sensitivity (in ISO) used when calculating auto exposure. When calculating scene average luminance, color values will be clamped to at least this value. This limits the auto-exposure from exposing above a certain brightness, resulting in a cut off point where the scene will remain dark. */
        get auto_exposure_min_sensitivity(): float64
        set auto_exposure_min_sensitivity(value: float64)
        
        /** The maximum sensitivity (in ISO) used when calculating auto exposure. When calculating scene average luminance, color values will be clamped to at least this value. This limits the auto-exposure from exposing below a certain brightness, resulting in a cut off point where the scene will remain bright. */
        get auto_exposure_max_sensitivity(): float64
        set auto_exposure_max_sensitivity(value: float64)
        /** @deprecated Internal use. Does not exist at runtime. */
        __godotNameMap: __NameMapCameraAttributesPractical;
    }
    namespace CameraFeed {
        enum FeedDataType {
            /** No image set for the feed. */
            FEED_NOIMAGE = 0,
            
            /** Feed supplies RGB images. */
            FEED_RGB = 1,
            
            /** Feed supplies YCbCr images that need to be converted to RGB. */
            FEED_YCBCR = 2,
            
            /** Feed supplies separate Y and CbCr images that need to be combined and converted to RGB. */
            FEED_YCBCR_SEP = 3,
            
            /** Feed supplies external image. */
            FEED_EXTERNAL = 4,
        }
        enum FeedPosition {
            /** Unspecified position. */
            FEED_UNSPECIFIED = 0,
            
            /** Camera is mounted at the front of the device. */
            FEED_FRONT = 1,
            
            /** Camera is mounted at the back of the device. */
            FEED_BACK = 2,
        }
    }
    /** @deprecated Internal use. Does not exist at runtime. */
    interface __NameMapCameraFeed extends __NameMapRefCounted {
    }
    namespace CameraFeed {
        type FeedFormat = GDictionary<{
            width: int64
            height: int64
            format: string
            frame_numerator?: int64
            frame_denominator?: int64
            pixel_format?: uint32
        }>
    }
    
    /** A camera feed gives you access to a single physical camera attached to your device.  
     *  	  
     *  @link https://docs.godotengine.org/en/4.5/classes/class_camerafeed.html  
     */
    class CameraFeed extends RefCounted {
        constructor(identifier?: any)
        /** Called when the camera feed is activated. */
        /* gdvirtual */ _activate_feed(): boolean
        
        /** Called when the camera feed is deactivated. */
        /* gdvirtual */ _deactivate_feed(): void
        
        /** Returns the unique ID for this feed. */
        get_id(): int64
        
        /** Returns the camera's name. */
        get_name(): string
        
        /** Sets the camera's name. */
        set_name(name: string): void
        
        /** Returns the position of camera on the device. */
        get_position(): CameraFeed.FeedPosition
        
        /** Sets the position of this camera. */
        set_position(position: CameraFeed.FeedPosition): void
        
        /** Sets RGB image for this feed. */
        set_rgb_image(rgb_image: Image): void
        
        /** Sets YCbCr image for this feed. */
        set_ycbcr_image(ycbcr_image: Image): void
        
        /** Sets the feed as external feed provided by another library. */
        set_external(width: int64, height: int64): void
        
        /** Returns the texture backend ID (usable by some external libraries that need a handle to a texture to write data). */
        get_texture_tex_id(feed_image_type: CameraServer.FeedImage): int64
        
        /** Returns feed image data type. */
        get_datatype(): CameraFeed.FeedDataType
        
        /** Sets the feed format parameters for the given [param index] in the [member formats] array. Returns `true` on success. By default, the YUYV encoded stream is transformed to [constant FEED_RGB]. The YUYV encoded stream output format can be changed by setting [param parameters]'s `output` entry to one of the following:  
         *  - `"separate"` will result in [constant FEED_YCBCR_SEP];  
         *  - `"grayscale"` will result in desaturated [constant FEED_RGB];  
         *  - `"copy"` will result in [constant FEED_YCBCR].  
         */
        set_format(index: int64, parameters: GDictionary): boolean
        
        /** If `true`, the feed is active. */
        get feed_is_active(): boolean
        set feed_is_active(value: boolean)
        
        /** The transform applied to the camera's image. */
        get feed_transform(): Transform2D
        set feed_transform(value: Transform2D)
        
        /** Formats supported by the feed. Each entry is a [Dictionary] describing format parameters. */
        get formats(): GArray<CameraFeed.FeedFormat>
        set formats(value: GArray<CameraFeed.FeedFormat>)
        
        /** Emitted when a new frame is available. */
        readonly frame_changed: Signal<() => void>
        
        /** Emitted when the format has changed. */
        readonly format_changed: Signal<() => void>
        /** @deprecated Internal use. Does not exist at runtime. */
        __godotNameMap: __NameMapCameraFeed;
    }
    /** @deprecated Internal use. Does not exist at runtime. */
    interface __NameMapCameraTexture extends __NameMapTexture2D {
    }
    /** Texture provided by a [CameraFeed].  
     *  	  
     *  @link https://docs.godotengine.org/en/4.5/classes/class_cameratexture.html  
     */
    class CameraTexture extends Texture2D {
        constructor(identifier?: any)
        /** The ID of the [CameraFeed] for which we want to display the image. */
        get camera_feed_id(): int64
        set camera_feed_id(value: int64)
        
        /** Which image within the [CameraFeed] we want access to, important if the camera image is split in a Y and CbCr component. */
        get which_feed(): int64
        set which_feed(value: int64)
        
        /** Convenience property that gives access to the active property of the [CameraFeed]. */
        get camera_is_active(): boolean
        set camera_is_active(value: boolean)
        /** @deprecated Internal use. Does not exist at runtime. */
        __godotNameMap: __NameMapCameraTexture;
    }
    /** @deprecated Internal use. Does not exist at runtime. */
    interface __NameMapCanvasGroup extends __NameMapNode2D {
    }
    /** Merges several 2D nodes into a single draw operation.  
     *  	  
     *  @link https://docs.godotengine.org/en/4.5/classes/class_canvasgroup.html  
     */
    class CanvasGroup<Map extends NodePathMap = any> extends Node2D<Map> {
        constructor(identifier?: any)
        /** Sets the size of a margin used to expand the drawable rect of this [CanvasGroup]. The size of the [CanvasGroup] is determined by fitting a rect around its children then expanding that rect by [member fit_margin]. This increases both the backbuffer area used and the area covered by the [CanvasGroup] both of which can reduce performance. This should be kept as small as possible and should only be expanded when an increased size is needed (e.g. for custom shader effects). */
        get fit_margin(): float64
        set fit_margin(value: float64)
        
        /** Sets the size of the margin used to expand the clearing rect of this [CanvasGroup]. This expands the area of the backbuffer that will be used by the [CanvasGroup]. A smaller margin will reduce the area of the backbuffer used which can increase performance, however if [member use_mipmaps] is enabled, a small margin may result in mipmap errors at the edge of the [CanvasGroup]. Accordingly, this should be left as small as possible, but should be increased if artifacts appear along the edges of the canvas group. */
        get clear_margin(): float64
        set clear_margin(value: float64)
        
        /** If `true`, calculates mipmaps for the backbuffer before drawing the [CanvasGroup] so that mipmaps can be used in a custom [ShaderMaterial] attached to the [CanvasGroup]. Generating mipmaps has a performance cost so this should not be enabled unless required. */
        get use_mipmaps(): boolean
        set use_mipmaps(value: boolean)
        /** @deprecated Internal use. Does not exist at runtime. */
        __godotNameMap: __NameMapCanvasGroup;
    }
    namespace CanvasItem {
        enum TextureFilter {
            /** The [CanvasItem] will inherit the filter from its parent. */
            TEXTURE_FILTER_PARENT_NODE = 0,
            
            /** The texture filter reads from the nearest pixel only. This makes the texture look pixelated from up close, and grainy from a distance (due to mipmaps not being sampled). */
            TEXTURE_FILTER_NEAREST = 1,
            
            /** The texture filter blends between the nearest 4 pixels. This makes the texture look smooth from up close, and grainy from a distance (due to mipmaps not being sampled). */
            TEXTURE_FILTER_LINEAR = 2,
            
            /** The texture filter reads from the nearest pixel and blends between the nearest 2 mipmaps (or uses the nearest mipmap if [member ProjectSettings.rendering/textures/default_filters/use_nearest_mipmap_filter] is `true`). This makes the texture look pixelated from up close, and smooth from a distance.  
             *  Use this for non-pixel art textures that may be viewed at a low scale (e.g. due to [Camera2D] zoom or sprite scaling), as mipmaps are important to smooth out pixels that are smaller than on-screen pixels.  
             */
            TEXTURE_FILTER_NEAREST_WITH_MIPMAPS = 3,
            
            /** The texture filter blends between the nearest 4 pixels and between the nearest 2 mipmaps (or uses the nearest mipmap if [member ProjectSettings.rendering/textures/default_filters/use_nearest_mipmap_filter] is `true`). This makes the texture look smooth from up close, and smooth from a distance.  
             *  Use this for non-pixel art textures that may be viewed at a low scale (e.g. due to [Camera2D] zoom or sprite scaling), as mipmaps are important to smooth out pixels that are smaller than on-screen pixels.  
             */
            TEXTURE_FILTER_LINEAR_WITH_MIPMAPS = 4,
            
            /** The texture filter reads from the nearest pixel and blends between 2 mipmaps (or uses the nearest mipmap if [member ProjectSettings.rendering/textures/default_filters/use_nearest_mipmap_filter] is `true`) based on the angle between the surface and the camera view. This makes the texture look pixelated from up close, and smooth from a distance. Anisotropic filtering improves texture quality on surfaces that are almost in line with the camera, but is slightly slower. The anisotropic filtering level can be changed by adjusting [member ProjectSettings.rendering/textures/default_filters/anisotropic_filtering_level].  
             *      
             *  **Note:** This texture filter is rarely useful in 2D projects. [constant TEXTURE_FILTER_NEAREST_WITH_MIPMAPS] is usually more appropriate in this case.  
             */
            TEXTURE_FILTER_NEAREST_WITH_MIPMAPS_ANISOTROPIC = 5,
            
            /** The texture filter blends between the nearest 4 pixels and blends between 2 mipmaps (or uses the nearest mipmap if [member ProjectSettings.rendering/textures/default_filters/use_nearest_mipmap_filter] is `true`) based on the angle between the surface and the camera view. This makes the texture look smooth from up close, and smooth from a distance. Anisotropic filtering improves texture quality on surfaces that are almost in line with the camera, but is slightly slower. The anisotropic filtering level can be changed by adjusting [member ProjectSettings.rendering/textures/default_filters/anisotropic_filtering_level].  
             *      
             *  **Note:** This texture filter is rarely useful in 2D projects. [constant TEXTURE_FILTER_LINEAR_WITH_MIPMAPS] is usually more appropriate in this case.  
             */
            TEXTURE_FILTER_LINEAR_WITH_MIPMAPS_ANISOTROPIC = 6,
            
            /** Represents the size of the [enum TextureFilter] enum. */
            TEXTURE_FILTER_MAX = 7,
        }
        enum TextureRepeat {
            /** The [CanvasItem] will inherit the filter from its parent. */
            TEXTURE_REPEAT_PARENT_NODE = 0,
            
            /** The texture does not repeat. Sampling the texture outside its extents will result in "stretching" of the edge pixels. You can avoid this by ensuring a 1-pixel fully transparent border on each side of the texture. */
            TEXTURE_REPEAT_DISABLED = 1,
            
            /** The texture repeats when exceeding the texture's size. */
            TEXTURE_REPEAT_ENABLED = 2,
            
            /** The texture repeats when the exceeding the texture's size in a "2×2 tiled mode". Repeated textures at even positions are mirrored. */
            TEXTURE_REPEAT_MIRROR = 3,
            
            /** Represents the size of the [enum TextureRepeat] enum. */
            TEXTURE_REPEAT_MAX = 4,
        }
        enum ClipChildrenMode {
            /** Children are drawn over this node and are not clipped. */
            CLIP_CHILDREN_DISABLED = 0,
            
            /** This node is used as a mask and is **not** drawn. The mask is based on this node's alpha channel: Opaque pixels are kept, transparent pixels are discarded, and semi-transparent pixels are blended in according to their opacity. Children are clipped to this node's drawn area. */
            CLIP_CHILDREN_ONLY = 1,
            
            /** This node is used as a mask and is also drawn. The mask is based on this node's alpha channel: Opaque pixels are kept, transparent pixels are discarded, and semi-transparent pixels are blended in according to their opacity. Children are clipped to the parent's drawn area. */
            CLIP_CHILDREN_AND_DRAW = 2,
            
            /** Represents the size of the [enum ClipChildrenMode] enum. */
            CLIP_CHILDREN_MAX = 3,
        }
    }
    /** @deprecated Internal use. Does not exist at runtime. */
    interface __NameMapCanvasItem extends __NameMapNode {
    }
    /** Abstract base class for everything in 2D space.  
     *  	  
     *  @link https://docs.godotengine.org/en/4.5/classes/class_canvasitem.html  
     */
    class CanvasItem<Map extends NodePathMap = any> extends Node<Map> {
        /** Notification received when this node's global transform changes, if [method is_transform_notification_enabled] is `true`. See also [method set_notify_transform] and [method get_transform].  
         *      
         *  **Note:** Many canvas items such as [Camera2D] or [CollisionObject2D] automatically enable this in order to function correctly.  
         */
        static readonly NOTIFICATION_TRANSFORM_CHANGED = 2000
        
        /** Notification received when this node's transform changes, if [method is_local_transform_notification_enabled] is `true`. This is not received when a parent [Node2D]'s transform changes. See also [method set_notify_local_transform].  
         *      
         *  **Note:** Many canvas items such as [Camera2D] or [CollisionShape2D] automatically enable this in order to function correctly.  
         */
        static readonly NOTIFICATION_LOCAL_TRANSFORM_CHANGED = 35
        
        /** The [CanvasItem] is requested to draw (see [method _draw]). */
        static readonly NOTIFICATION_DRAW = 30
        
        /** Notification received when this node's visibility changes (see [member visible] and [method is_visible_in_tree]).  
         *  This notification is received  *before*  the related [signal visibility_changed] signal.  
         */
        static readonly NOTIFICATION_VISIBILITY_CHANGED = 31
        
        /** The [CanvasItem] has entered the canvas. */
        static readonly NOTIFICATION_ENTER_CANVAS = 32
        
        /** The [CanvasItem] has exited the canvas. */
        static readonly NOTIFICATION_EXIT_CANVAS = 33
        
        /** Notification received when this [CanvasItem] is registered to a new [World2D] (see [method get_world_2d]). */
        static readonly NOTIFICATION_WORLD_2D_CHANGED = 36
        constructor(identifier?: any)
        
        /** Called when [CanvasItem] has been requested to redraw (after [method queue_redraw] is called, either manually or by the engine).  
         *  Corresponds to the [constant NOTIFICATION_DRAW] notification in [method Object._notification].  
         */
        /* gdvirtual */ _draw(): void
        _top_level_raise_self(): void
        _edit_set_state(state: GDictionary): void
        _edit_get_state(): GDictionary
        _edit_set_position(position: Vector2): void
        _edit_get_position(): Vector2
        _edit_set_scale(scale: Vector2): void
        _edit_get_scale(): Vector2
        _edit_set_rect(rect: Rect2): void
        _edit_get_rect(): Rect2
        _edit_use_rect(): boolean
        _edit_set_rotation(degrees: float64): void
        _edit_get_rotation(): float64
        _edit_use_rotation(): boolean
        _edit_set_pivot(pivot: Vector2): void
        _edit_get_pivot(): Vector2
        _edit_use_pivot(): boolean
        _edit_get_transform(): Transform2D
        
        /** Returns the internal canvas item [RID] used by the [RenderingServer] for this node. */
        get_canvas_item(): RID
        
        /** Returns `true` if the node is present in the [SceneTree], its [member visible] property is `true` and all its ancestors are also visible. If any ancestor is hidden, this node will not be visible in the scene tree, and is therefore not drawn (see [method _draw]).  
         *  Visibility is checked only in parent nodes that inherit from [CanvasItem], [CanvasLayer], and [Window]. If the parent is of any other type (such as [Node], [AnimationPlayer], or [Node3D]), it is assumed to be visible.  
         *      
         *  **Note:** This method does not take [member visibility_layer] into account, so even if this method returns `true`, the node might end up not being rendered.  
         */
        is_visible_in_tree(): boolean
        
        /** Show the [CanvasItem] if it's currently hidden. This is equivalent to setting [member visible] to `true`.  
         *      
         *  **Note:** For controls that inherit [Popup], the correct way to make them visible is to call one of the multiple `popup*()` functions instead.  
         */
        show(): void
        
        /** Hide the [CanvasItem] if it's currently visible. This is equivalent to setting [member visible] to `false`. */
        hide(): void
        
        /** Queues the [CanvasItem] to redraw. During idle time, if [CanvasItem] is visible, [constant NOTIFICATION_DRAW] is sent and [method _draw] is called. This only occurs **once** per frame, even if this method has been called multiple times. */
        queue_redraw(): void
        
        /** Moves this node below its siblings, usually causing the node to draw on top of its siblings. Does nothing if this node does not have a parent. See also [method Node.move_child]. */
        move_to_front(): void
        
        /** Draws a line from a 2D point to another, with a given color and width. It can be optionally antialiased. The [param from] and [param to] positions are defined in local space. See also [method draw_dashed_line], [method draw_multiline], and [method draw_polyline].  
         *  If [param width] is negative, then a two-point primitive will be drawn instead of a four-point one. This means that when the CanvasItem is scaled, the line will remain thin. If this behavior is not desired, then pass a positive [param width] like `1.0`.  
         */
        draw_line(from: Vector2, to: Vector2, color: Color, width?: float64 /* = -1 */, antialiased?: boolean /* = false */): void
        
        /** Draws a dashed line from a 2D point to another, with a given color and width. The [param from] and [param to] positions are defined in local space. See also [method draw_line], [method draw_multiline], and [method draw_polyline].  
         *  If [param width] is negative, then a two-point primitives will be drawn instead of a four-point ones. This means that when the CanvasItem is scaled, the line parts will remain thin. If this behavior is not desired, then pass a positive [param width] like `1.0`.  
         *  [param dash] is the length of each dash in pixels, with the gap between each dash being the same length. If [param aligned] is `true`, the length of the first and last dashes may be shortened or lengthened to allow the line to begin and end at the precise points defined by [param from] and [param to]. Both ends are always symmetrical when [param aligned] is `true`. If [param aligned] is `false`, all dashes will have the same length, but the line may appear incomplete at the end due to the dash length not dividing evenly into the line length. Only full dashes are drawn when [param aligned] is `false`.  
         *  If [param antialiased] is `true`, half transparent "feathers" will be attached to the boundary, making outlines smooth.  
         *      
         *  **Note:** [param antialiased] is only effective if [param width] is greater than `0.0`.  
         */
        draw_dashed_line(from: Vector2, to: Vector2, color: Color, width?: float64 /* = -1 */, dash?: float64 /* = 2 */, aligned?: boolean /* = true */, antialiased?: boolean /* = false */): void
        
        /** Draws interconnected line segments with a uniform [param color] and [param width] and optional antialiasing (supported only for positive [param width]). The [param points] array is defined in local space. When drawing large amounts of lines, this is faster than using individual [method draw_line] calls. To draw disconnected lines, use [method draw_multiline] instead. See also [method draw_polygon].  
         *  If [param width] is negative, it will be ignored and the polyline will be drawn using [constant RenderingServer.PRIMITIVE_LINE_STRIP]. This means that when the CanvasItem is scaled, the polyline will remain thin. If this behavior is not desired, then pass a positive [param width] like `1.0`.  
         */
        draw_polyline(points: PackedVector2Array | Vector2[], color: Color, width?: float64 /* = -1 */, antialiased?: boolean /* = false */): void
        
        /** Draws interconnected line segments with a uniform [param width], point-by-point coloring, and optional antialiasing (supported only for positive [param width]). Colors assigned to line points match by index between [param points] and [param colors], i.e. each line segment is filled with a gradient between the colors of the endpoints. The [param points] array is defined in local space. When drawing large amounts of lines, this is faster than using individual [method draw_line] calls. To draw disconnected lines, use [method draw_multiline_colors] instead. See also [method draw_polygon].  
         *  If [param width] is negative, it will be ignored and the polyline will be drawn using [constant RenderingServer.PRIMITIVE_LINE_STRIP]. This means that when the CanvasItem is scaled, the polyline will remain thin. If this behavior is not desired, then pass a positive [param width] like `1.0`.  
         */
        draw_polyline_colors(points: PackedVector2Array | Vector2[], colors: PackedColorArray | Color[], width?: float64 /* = -1 */, antialiased?: boolean /* = false */): void
        
        /** Draws an unfilled arc between the given angles with a uniform [param color] and [param width] and optional antialiasing (supported only for positive [param width]). The larger the value of [param point_count], the smoother the curve. [param center] is defined in local space. See also [method draw_circle].  
         *  If [param width] is negative, it will be ignored and the arc will be drawn using [constant RenderingServer.PRIMITIVE_LINE_STRIP]. This means that when the CanvasItem is scaled, the arc will remain thin. If this behavior is not desired, then pass a positive [param width] like `1.0`.  
         *  The arc is drawn from [param start_angle] towards the value of [param end_angle] so in clockwise direction if `start_angle < end_angle` and counter-clockwise otherwise. Passing the same angles but in reversed order will produce the same arc. If absolute difference of [param start_angle] and [param end_angle] is greater than [constant @GDScript.TAU] radians, then a full circle arc is drawn (i.e. arc will not overlap itself).  
         */
        draw_arc(center: Vector2, radius: float64, start_angle: float64, end_angle: float64, point_count: int64, color: Color, width?: float64 /* = -1 */, antialiased?: boolean /* = false */): void
        
        /** Draws multiple disconnected lines with a uniform [param width] and [param color]. Each line is defined by two consecutive points from [param points] array in local space, i.e. i-th segment consists of `points[2 * i]`, `points[2 * i + 1]` endpoints. When drawing large amounts of lines, this is faster than using individual [method draw_line] calls. To draw interconnected lines, use [method draw_polyline] instead.  
         *  If [param width] is negative, then two-point primitives will be drawn instead of a four-point ones. This means that when the CanvasItem is scaled, the lines will remain thin. If this behavior is not desired, then pass a positive [param width] like `1.0`.  
         *      
         *  **Note:** [param antialiased] is only effective if [param width] is greater than `0.0`.  
         */
        draw_multiline(points: PackedVector2Array | Vector2[], color: Color, width?: float64 /* = -1 */, antialiased?: boolean /* = false */): void
        
        /** Draws multiple disconnected lines with a uniform [param width] and segment-by-segment coloring. Each segment is defined by two consecutive points from [param points] array in local space and a corresponding color from [param colors] array, i.e. i-th segment consists of `points[2 * i]`, `points[2 * i + 1]` endpoints and has `colors *` color. When drawing large amounts of lines, this is faster than using individual [method draw_line] calls. To draw interconnected lines, use [method draw_polyline_colors] instead.  
         *  If [param width] is negative, then two-point primitives will be drawn instead of a four-point ones. This means that when the CanvasItem is scaled, the lines will remain thin. If this behavior is not desired, then pass a positive [param width] like `1.0`.  
         *      
         *  **Note:** [param antialiased] is only effective if [param width] is greater than `0.0`.  
         */
        draw_multiline_colors(points: PackedVector2Array | Vector2[], colors: PackedColorArray | Color[], width?: float64 /* = -1 */, antialiased?: boolean /* = false */): void
        
        /** Draws a rectangle. If [param filled] is `true`, the rectangle will be filled with the [param color] specified. If [param filled] is `false`, the rectangle will be drawn as a stroke with the [param color] and [param width] specified. The [param rect] is specified in local space. See also [method draw_texture_rect].  
         *  If [param width] is negative, then two-point primitives will be drawn instead of a four-point ones. This means that when the CanvasItem is scaled, the lines will remain thin. If this behavior is not desired, then pass a positive [param width] like `1.0`.  
         *  If [param antialiased] is `true`, half transparent "feathers" will be attached to the boundary, making outlines smooth.  
         *      
         *  **Note:** [param width] is only effective if [param filled] is `false`.  
         *      
         *  **Note:** Unfilled rectangles drawn with a negative [param width] may not display perfectly. For example, corners may be missing or brighter due to overlapping lines (for a translucent [param color]).  
         */
        draw_rect(rect: Rect2, color: Color, filled?: boolean /* = true */, width?: float64 /* = -1 */, antialiased?: boolean /* = false */): void
        
        /** Draws a circle, with [param position] defined in local space. See also [method draw_arc], [method draw_polyline], and [method draw_polygon].  
         *  If [param filled] is `true`, the circle will be filled with the [param color] specified. If [param filled] is `false`, the circle will be drawn as a stroke with the [param color] and [param width] specified.  
         *  If [param width] is negative, then two-point primitives will be drawn instead of a four-point ones. This means that when the CanvasItem is scaled, the lines will remain thin. If this behavior is not desired, then pass a positive [param width] like `1.0`.  
         *  If [param antialiased] is `true`, half transparent "feathers" will be attached to the boundary, making outlines smooth.  
         *      
         *  **Note:** [param width] is only effective if [param filled] is `false`.  
         */
        draw_circle(position: Vector2, radius: float64, color: Color, filled?: boolean /* = true */, width?: float64 /* = -1 */, antialiased?: boolean /* = false */): void
        
        /** Draws a texture at a given position. The [param position] is defined in local space. */
        draw_texture(texture: Texture2D, position: Vector2, modulate?: Color /* = new Color(1, 1, 1, 1) */): void
        
        /** Draws a textured rectangle at a given position, optionally modulated by a color. The [param rect] is defined in local space. If [param transpose] is `true`, the texture will have its X and Y coordinates swapped. See also [method draw_rect] and [method draw_texture_rect_region]. */
        draw_texture_rect(texture: Texture2D, rect: Rect2, tile: boolean, modulate?: Color /* = new Color(1, 1, 1, 1) */, transpose?: boolean /* = false */): void
        
        /** Draws a textured rectangle from a texture's region (specified by [param src_rect]) at a given position in local space, optionally modulated by a color. If [param transpose] is `true`, the texture will have its X and Y coordinates swapped. See also [method draw_texture_rect]. */
        draw_texture_rect_region(texture: Texture2D, rect: Rect2, src_rect: Rect2, modulate?: Color /* = new Color(1, 1, 1, 1) */, transpose?: boolean /* = false */, clip_uv?: boolean /* = true */): void
        
        /** Draws a textured rectangle region of the multichannel signed distance field texture at a given position, optionally modulated by a color. The [param rect] is defined in local space. See [member FontFile.multichannel_signed_distance_field] for more information and caveats about MSDF font rendering.  
         *  If [param outline] is positive, each alpha channel value of pixel in region is set to maximum value of true distance in the [param outline] radius.  
         *  Value of the [param pixel_range] should the same that was used during distance field texture generation.  
         */
        draw_msdf_texture_rect_region(texture: Texture2D, rect: Rect2, src_rect: Rect2, modulate?: Color /* = new Color(1, 1, 1, 1) */, outline?: float64 /* = 0 */, pixel_range?: float64 /* = 4 */, scale?: float64 /* = 1 */): void
        
        /** Draws a textured rectangle region of the font texture with LCD subpixel anti-aliasing at a given position, optionally modulated by a color. The [param rect] is defined in local space.  
         *  Texture is drawn using the following blend operation, blend mode of the [CanvasItemMaterial] is ignored:  
         *    
         */
        draw_lcd_texture_rect_region(texture: Texture2D, rect: Rect2, src_rect: Rect2, modulate?: Color /* = new Color(1, 1, 1, 1) */): void
        
        /** Draws a styled rectangle. The [param rect] is defined in local space. */
        draw_style_box(style_box: StyleBox, rect: Rect2): void
        
        /** Draws a custom primitive. 1 point for a point, 2 points for a line, 3 points for a triangle, and 4 points for a quad. If 0 points or more than 4 points are specified, nothing will be drawn and an error message will be printed. The [param points] array is defined in local space. See also [method draw_line], [method draw_polyline], [method draw_polygon], and [method draw_rect]. */
        draw_primitive(points: PackedVector2Array | Vector2[], colors: PackedColorArray | Color[], uvs: PackedVector2Array | Vector2[], texture?: Texture2D /* = undefined */): void
        
        /** Draws a solid polygon of any number of points, convex or concave. Unlike [method draw_colored_polygon], each point's color can be changed individually. The [param points] array is defined in local space. See also [method draw_polyline] and [method draw_polyline_colors]. If you need more flexibility (such as being able to use bones), use [method RenderingServer.canvas_item_add_triangle_array] instead.  
         *      
         *  **Note:** If you frequently redraw the same polygon with a large number of vertices, consider pre-calculating the triangulation with [method Geometry2D.triangulate_polygon] and using [method draw_mesh], [method draw_multimesh], or [method RenderingServer.canvas_item_add_triangle_array].  
         */
        draw_polygon(points: PackedVector2Array | Vector2[], colors: PackedColorArray | Color[], uvs?: PackedVector2Array | Vector2[] /* = [] */, texture?: Texture2D /* = undefined */): void
        
        /** Draws a colored polygon of any number of points, convex or concave. The points in the [param points] array are defined in local space. Unlike [method draw_polygon], a single color must be specified for the whole polygon.  
         *      
         *  **Note:** If you frequently redraw the same polygon with a large number of vertices, consider pre-calculating the triangulation with [method Geometry2D.triangulate_polygon] and using [method draw_mesh], [method draw_multimesh], or [method RenderingServer.canvas_item_add_triangle_array].  
         */
        draw_colored_polygon(points: PackedVector2Array | Vector2[], color: Color, uvs?: PackedVector2Array | Vector2[] /* = [] */, texture?: Texture2D /* = undefined */): void
        
        /** Draws [param text] using the specified [param font] at the [param pos] in local space (bottom-left corner using the baseline of the font). The text will have its color multiplied by [param modulate]. If [param width] is greater than or equal to 0, the text will be clipped if it exceeds the specified width. If [param oversampling] is greater than zero, it is used as font oversampling factor, otherwise viewport oversampling settings are used.  
         *  **Example:** Draw "Hello world", using the project's default font:  
         *    
         *  See also [method Font.draw_string].  
         */
        draw_string(font: Font, pos: Vector2, text: string, alignment?: HorizontalAlignment /* = 0 */, width?: float64 /* = -1 */, font_size?: int64 /* = 16 */, modulate?: Color /* = new Color(1, 1, 1, 1) */, justification_flags?: TextServer.JustificationFlag /* = 3 */, direction?: TextServer.Direction /* = 0 */, orientation?: TextServer.Orientation /* = 0 */, oversampling?: float64 /* = 0 */): void
        
        /** Breaks [param text] into lines and draws it using the specified [param font] at the [param pos] in local space (top-left corner). The text will have its color multiplied by [param modulate]. If [param width] is greater than or equal to 0, the text will be clipped if it exceeds the specified width. If [param oversampling] is greater than zero, it is used as font oversampling factor, otherwise viewport oversampling settings are used. */
        draw_multiline_string(font: Font, pos: Vector2, text: string, alignment?: HorizontalAlignment /* = 0 */, width?: float64 /* = -1 */, font_size?: int64 /* = 16 */, max_lines?: int64 /* = -1 */, modulate?: Color /* = new Color(1, 1, 1, 1) */, brk_flags?: TextServer.LineBreakFlag /* = 3 */, justification_flags?: TextServer.JustificationFlag /* = 3 */, direction?: TextServer.Direction /* = 0 */, orientation?: TextServer.Orientation /* = 0 */, oversampling?: float64 /* = 0 */): void
        
        /** Draws [param text] outline using the specified [param font] at the [param pos] in local space (bottom-left corner using the baseline of the font). The text will have its color multiplied by [param modulate]. If [param width] is greater than or equal to 0, the text will be clipped if it exceeds the specified width. If [param oversampling] is greater than zero, it is used as font oversampling factor, otherwise viewport oversampling settings are used. */
        draw_string_outline(font: Font, pos: Vector2, text: string, alignment?: HorizontalAlignment /* = 0 */, width?: float64 /* = -1 */, font_size?: int64 /* = 16 */, size?: int64 /* = 1 */, modulate?: Color /* = new Color(1, 1, 1, 1) */, justification_flags?: TextServer.JustificationFlag /* = 3 */, direction?: TextServer.Direction /* = 0 */, orientation?: TextServer.Orientation /* = 0 */, oversampling?: float64 /* = 0 */): void
        
        /** Breaks [param text] to the lines and draws text outline using the specified [param font] at the [param pos] in local space (top-left corner). The text will have its color multiplied by [param modulate]. If [param width] is greater than or equal to 0, the text will be clipped if it exceeds the specified width. If [param oversampling] is greater than zero, it is used as font oversampling factor, otherwise viewport oversampling settings are used. */
        draw_multiline_string_outline(font: Font, pos: Vector2, text: string, alignment?: HorizontalAlignment /* = 0 */, width?: float64 /* = -1 */, font_size?: int64 /* = 16 */, max_lines?: int64 /* = -1 */, size?: int64 /* = 1 */, modulate?: Color /* = new Color(1, 1, 1, 1) */, brk_flags?: TextServer.LineBreakFlag /* = 3 */, justification_flags?: TextServer.JustificationFlag /* = 3 */, direction?: TextServer.Direction /* = 0 */, orientation?: TextServer.Orientation /* = 0 */, oversampling?: float64 /* = 0 */): void
        
        /** Draws a string first character using a custom font. If [param oversampling] is greater than zero, it is used as font oversampling factor, otherwise viewport oversampling settings are used. [param pos] is defined in local space. */
        draw_char(font: Font, pos: Vector2, char: string, font_size?: int64 /* = 16 */, modulate?: Color /* = new Color(1, 1, 1, 1) */, oversampling?: float64 /* = 0 */): void
        
        /** Draws a string first character outline using a custom font. If [param oversampling] is greater than zero, it is used as font oversampling factor, otherwise viewport oversampling settings are used. [param pos] is defined in local space. */
        draw_char_outline(font: Font, pos: Vector2, char: string, font_size?: int64 /* = 16 */, size?: int64 /* = -1 */, modulate?: Color /* = new Color(1, 1, 1, 1) */, oversampling?: float64 /* = 0 */): void
        
        /** Draws a [Mesh] in 2D, using the provided texture. See [MeshInstance2D] for related documentation. The [param transform] is defined in local space. */
        draw_mesh(mesh: Mesh, texture: Texture2D, transform?: Transform2D /* = new Transform2D() */, modulate?: Color /* = new Color(1, 1, 1, 1) */): void
        
        /** Draws a [MultiMesh] in 2D with the provided texture. See [MultiMeshInstance2D] for related documentation. */
        draw_multimesh(multimesh: MultiMesh, texture: Texture2D): void
        
        /** Sets a custom local transform for drawing via components. Anything drawn afterwards will be transformed by this.  
         *      
         *  **Note:** [member FontFile.oversampling] does  *not*  take [param scale] into account. This means that scaling up/down will cause bitmap fonts and rasterized (non-MSDF) dynamic fonts to appear blurry or pixelated. To ensure text remains crisp regardless of scale, you can enable MSDF font rendering by enabling [member ProjectSettings.gui/theme/default_font_multichannel_signed_distance_field] (applies to the default project font only), or enabling **Multichannel Signed Distance Field** in the import options of a DynamicFont for custom fonts. On system fonts, [member SystemFont.multichannel_signed_distance_field] can be enabled in the inspector.  
         */
        draw_set_transform(position: Vector2, rotation?: float64 /* = 0 */, scale?: Vector2 /* = Vector2.ONE */): void
        
        /** Sets a custom local transform for drawing via matrix. Anything drawn afterwards will be transformed by this. */
        draw_set_transform_matrix(xform: Transform2D): void
        
        /** Subsequent drawing commands will be ignored unless they fall within the specified animation slice. This is a faster way to implement animations that loop on background rather than redrawing constantly. */
        draw_animation_slice(animation_length: float64, slice_begin: float64, slice_end: float64, offset?: float64 /* = 0 */): void
        
        /** After submitting all animations slices via [method draw_animation_slice], this function can be used to revert drawing to its default state (all subsequent drawing commands will be visible). If you don't care about this particular use case, usage of this function after submitting the slices is not required. */
        draw_end_animation(): void
        
        /** Returns the transform matrix of this [CanvasItem]. */
        get_transform(): Transform2D
        
        /** Returns the global transform matrix of this item, i.e. the combined transform up to the topmost [CanvasItem] node. The topmost item is a [CanvasItem] that either has no parent, has non-[CanvasItem] parent or it has [member top_level] enabled. */
        get_global_transform(): Transform2D
        
        /** Returns the transform from the local coordinate system of this [CanvasItem] to the [Viewport]s coordinate system. */
        get_global_transform_with_canvas(): Transform2D
        
        /** Returns the transform of this node, converted from its registered canvas's coordinate system to its viewport embedder's coordinate system. See also [method Viewport.get_final_transform] and [method Node.get_viewport]. */
        get_viewport_transform(): Transform2D
        
        /** Returns this node's viewport boundaries as a [Rect2]. See also [method Node.get_viewport]. */
        get_viewport_rect(): Rect2
        
        /** Returns the transform of this node, converted from its registered canvas's coordinate system to its viewport's coordinate system. See also [method Node.get_viewport]. */
        get_canvas_transform(): Transform2D
        
        /** Returns the transform of this [CanvasItem] in global screen coordinates (i.e. taking window position into account). Mostly useful for editor plugins.  
         *  Equals to [method get_global_transform] if the window is embedded (see [member Viewport.gui_embed_subwindows]).  
         */
        get_screen_transform(): Transform2D
        
        /** Returns the mouse's position in this [CanvasItem] using the local coordinate system of this [CanvasItem]. */
        get_local_mouse_position(): Vector2
        
        /** Returns mouse cursor's global position relative to the [CanvasLayer] that contains this node.  
         *      
         *  **Note:** For screen-space coordinates (e.g. when using a non-embedded [Popup]), you can use [method DisplayServer.mouse_get_position].  
         */
        get_global_mouse_position(): Vector2
        
        /** Returns the [RID] of the [World2D] canvas where this node is registered to, used by the [RenderingServer]. */
        get_canvas(): RID
        
        /** Returns the [CanvasLayer] that contains this node, or `null` if the node is not in any [CanvasLayer]. */
        get_canvas_layer_node(): null | CanvasLayer
        
        /** Returns the [World2D] this node is registered to.  
         *  Usually, this is the same as this node's viewport (see [method Node.get_viewport] and [method Viewport.find_world_2d]).  
         */
        get_world_2d(): null | World2D
        
        /** Set the value of a shader uniform for this instance only ([url=https://docs.godotengine.org/en/4.5/tutorials/shaders/shader_reference/shading_language.html#per-instance-uniforms]per-instance uniform[/url]). See also [method ShaderMaterial.set_shader_parameter] to assign a uniform on all instances using the same [ShaderMaterial].  
         *      
         *  **Note:** For a shader uniform to be assignable on a per-instance basis, it  *must*  be defined with `instance uniform ...` rather than `uniform ...` in the shader code.  
         *      
         *  **Note:** [param name] is case-sensitive and must match the name of the uniform in the code exactly (not the capitalized name in the inspector).  
         */
        set_instance_shader_parameter(name: StringName, value: any): void
        
        /** Get the value of a shader parameter as set on this instance. */
        get_instance_shader_parameter(name: StringName): any
        
        /** If `true`, the node will receive [constant NOTIFICATION_LOCAL_TRANSFORM_CHANGED] whenever its local transform changes.  
         *      
         *  **Note:** Many canvas items such as [Bone2D] or [CollisionShape2D] automatically enable this in order to function correctly.  
         */
        set_notify_local_transform(enable: boolean): void
        
        /** Returns `true` if the node receives [constant NOTIFICATION_LOCAL_TRANSFORM_CHANGED] whenever its local transform changes. This is enabled with [method set_notify_local_transform]. */
        is_local_transform_notification_enabled(): boolean
        
        /** If `true`, the node will receive [constant NOTIFICATION_TRANSFORM_CHANGED] whenever global transform changes.  
         *      
         *  **Note:** Many canvas items such as [Camera2D] or [Light2D] automatically enable this in order to function correctly.  
         */
        set_notify_transform(enable: boolean): void
        
        /** Returns `true` if the node receives [constant NOTIFICATION_TRANSFORM_CHANGED] whenever its global transform changes. This is enabled with [method set_notify_transform]. */
        is_transform_notification_enabled(): boolean
        
        /** Forces the node's transform to update. Fails if the node is not inside the tree. See also [method get_transform].  
         *      
         *  **Note:** For performance reasons, transform changes are usually accumulated and applied  *once*  at the end of the frame. The update propagates through [CanvasItem] children, as well. Therefore, use this method only when you need an up-to-date transform (such as during physics operations).  
         */
        force_update_transform(): void
        
        /** Transforms [param viewport_point] from the viewport's coordinates to this node's local coordinates.  
         *  For the opposite operation, use [method get_global_transform_with_canvas].  
         *    
         */
        make_canvas_position_local(viewport_point: Vector2): Vector2
        
        /** Returns a copy of the given [param event] with its coordinates converted from global space to this [CanvasItem]'s local space. If not possible, returns the same [InputEvent] unchanged. */
        make_input_local(event: InputEvent): null | InputEvent
        
        /** Set/clear individual bits on the rendering visibility layer. This simplifies editing this [CanvasItem]'s visibility layer. */
        set_visibility_layer_bit(layer: int64, enabled: boolean): void
        
        /** Returns `true` if the layer at the given index is set in [member visibility_layer]. */
        get_visibility_layer_bit(layer: int64): boolean
        
        /** If `true`, this [CanvasItem] may be drawn. Whether this [CanvasItem] is actually drawn depends on the visibility of all of its [CanvasItem] ancestors. In other words: this [CanvasItem] will be drawn when [method is_visible_in_tree] returns `true` and all [CanvasItem] ancestors share at least one [member visibility_layer] with this [CanvasItem].  
         *      
         *  **Note:** For controls that inherit [Popup], the correct way to make them visible is to call one of the multiple `popup*()` functions instead.  
         */
        get visible(): boolean
        set visible(value: boolean)
        
        /** The color applied to this [CanvasItem]. This property does affect child [CanvasItem]s, unlike [member self_modulate] which only affects the node itself. */
        get modulate(): Color
        set modulate(value: Color)
        
        /** The color applied to this [CanvasItem]. This property does **not** affect child [CanvasItem]s, unlike [member modulate] which affects both the node itself and its children.  
         *      
         *  **Note:** Internal children are also not affected by this property (see the `include_internal` parameter in [method Node.add_child]). For built-in nodes this includes sliders in [ColorPicker], and the tab bar in [TabContainer].  
         */
        get self_modulate(): Color
        set self_modulate(value: Color)
        
        /** If `true`, this node draws behind its parent. */
        get show_behind_parent(): boolean
        set show_behind_parent(value: boolean)
        
        /** If `true`, this [CanvasItem] will  *not*  inherit its transform from parent [CanvasItem]s. Its draw order will also be changed to make it draw on top of other [CanvasItem]s that do not have [member top_level] set to `true`. The [CanvasItem] will effectively act as if it was placed as a child of a bare [Node]. */
        get top_level(): boolean
        set top_level(value: boolean)
        
        /** The mode in which this node clips its children, acting as a mask.  
         *      
         *  **Note:** Clipping nodes cannot be nested or placed within a [CanvasGroup]. If an ancestor of this node clips its children or is a [CanvasGroup], then this node's clip mode should be set to [constant CLIP_CHILDREN_DISABLED] to avoid unexpected behavior.  
         */
        get clip_children(): int64
        set clip_children(value: int64)
        
        /** The rendering layers in which this [CanvasItem] responds to [Light2D] nodes. */
        get light_mask(): int64
        set light_mask(value: int64)
        
        /** The rendering layer in which this [CanvasItem] is rendered by [Viewport] nodes. A [Viewport] will render a [CanvasItem] if it and all its parents share a layer with the [Viewport]'s canvas cull mask. */
        get visibility_layer(): int64
        set visibility_layer(value: int64)
        
        /** The order in which this node is drawn. A node with a higher Z index will display in front of others. Must be between [constant RenderingServer.CANVAS_ITEM_Z_MIN] and [constant RenderingServer.CANVAS_ITEM_Z_MAX] (inclusive).  
         *      
         *  **Note:** The Z index does **not** affect the order in which [CanvasItem] nodes are processed or the way input events are handled. This is especially important to keep in mind for [Control] nodes.  
         */
        get z_index(): int64
        set z_index(value: int64)
        
        /** If `true`, this node's final Z index is relative to its parent's Z index.  
         *  For example, if [member z_index] is `2` and its parent's final Z index is `3`, then this node's final Z index will be `5` (`2 + 3`).  
         */
        get z_as_relative(): boolean
        set z_as_relative(value: boolean)
        
        /** If `true`, this and child [CanvasItem] nodes with a higher Y position are rendered in front of nodes with a lower Y position. If `false`, this and child [CanvasItem] nodes are rendered normally in scene tree order.  
         *  With Y-sorting enabled on a parent node ('A') but disabled on a child node ('B'), the child node ('B') is sorted but its children ('C1', 'C2', etc.) render together on the same Y position as the child node ('B'). This allows you to organize the render order of a scene without changing the scene tree.  
         *  Nodes sort relative to each other only if they are on the same [member z_index].  
         */
        get y_sort_enabled(): boolean
        set y_sort_enabled(value: boolean)
        
        /** The filtering mode used to render this [CanvasItem]'s texture(s). */
        get texture_filter(): int64
        set texture_filter(value: int64)
        
        /** The repeating mode used to render this [CanvasItem]'s texture(s). It affects what happens when the texture is sampled outside its extents, for example by setting a [member Sprite2D.region_rect] that is larger than the texture or assigning [Polygon2D] UV points outside the texture.  
         *      
         *  **Note:** [TextureRect] is not affected by [member texture_repeat], as it uses its own texture repeating implementation.  
         */
        get texture_repeat(): int64
        set texture_repeat(value: int64)
        
        /** The material applied to this [CanvasItem]. */
        get material(): null | CanvasItemMaterial | ShaderMaterial
        set material(value: null | CanvasItemMaterial | ShaderMaterial)
        
        /** If `true`, the parent [CanvasItem]'s [member material] is used as this node's material. */
        get use_parent_material(): boolean
        set use_parent_material(value: boolean)
        
        /** Emitted when the [CanvasItem] must redraw,  *after*  the related [constant NOTIFICATION_DRAW] notification, and  *before*  [method _draw] is called.  
         *      
         *  **Note:** Deferred connections do not allow drawing through the `draw_*` methods.  
         */
        readonly draw: Signal<() => void>
        
        /** Emitted when the [CanvasItem]'s visibility changes, either because its own [member visible] property changed or because its visibility in the tree changed (see [method is_visible_in_tree]).  
         *  This signal is emitted  *after*  the related [constant NOTIFICATION_VISIBILITY_CHANGED] notification.  
         */
        readonly visibility_changed: Signal<() => void>
        
        /** Emitted when this node becomes hidden, i.e. it's no longer visible in the tree (see [method is_visible_in_tree]). */
        readonly hidden: Signal<() => void>
        
        /** Emitted when the [CanvasItem]'s boundaries (position or size) change, or when an action took place that may have affected these boundaries (e.g. changing [member Sprite2D.texture]). */
        readonly item_rect_changed: Signal<() => void>
        /** @deprecated Internal use. Does not exist at runtime. */
        __godotNameMap: __NameMapCanvasItem;
    }
    namespace CanvasItemMaterial {
        enum BlendMode {
            /** Mix blending mode. Colors are assumed to be independent of the alpha (opacity) value. */
            BLEND_MODE_MIX = 0,
            
            /** Additive blending mode. */
            BLEND_MODE_ADD = 1,
            
            /** Subtractive blending mode. */
            BLEND_MODE_SUB = 2,
            
            /** Multiplicative blending mode. */
            BLEND_MODE_MUL = 3,
            
            /** Mix blending mode. Colors are assumed to be premultiplied by the alpha (opacity) value. */
            BLEND_MODE_PREMULT_ALPHA = 4,
        }
        enum LightMode {
            /** Render the material using both light and non-light sensitive material properties. */
            LIGHT_MODE_NORMAL = 0,
            
            /** Render the material as if there were no light. */
            LIGHT_MODE_UNSHADED = 1,
            
            /** Render the material as if there were only light. */
            LIGHT_MODE_LIGHT_ONLY = 2,
        }
    }
    /** @deprecated Internal use. Does not exist at runtime. */
    interface __NameMapCanvasItemMaterial extends __NameMapMaterial {
    }
    /** A material for [CanvasItem]s.  
     *  	  
     *  @link https://docs.godotengine.org/en/4.5/classes/class_canvasitemmaterial.html  
     */
    class CanvasItemMaterial extends Material {
        constructor(identifier?: any)
        /** The manner in which a material's rendering is applied to underlying textures. */
        get blend_mode(): int64
        set blend_mode(value: int64)
        
        /** The manner in which material reacts to lighting. */
        get light_mode(): int64
        set light_mode(value: int64)
        
        /** If `true`, enable spritesheet-based animation features when assigned to [GPUParticles2D] and [CPUParticles2D] nodes. The [member ParticleProcessMaterial.anim_speed_max] or [member CPUParticles2D.anim_speed_max] should also be set to a positive value for the animation to play.  
         *  This property (and other `particles_anim_*` properties that depend on it) has no effect on other types of nodes.  
         */
        get particles_animation(): boolean
        set particles_animation(value: boolean)
        
        /** The number of columns in the spritesheet assigned as [Texture2D] for a [GPUParticles2D] or [CPUParticles2D].  
         *      
         *  **Note:** This property is only used and visible in the editor if [member particles_animation] is `true`.  
         */
        get particles_anim_h_frames(): int64
        set particles_anim_h_frames(value: int64)
        
        /** The number of rows in the spritesheet assigned as [Texture2D] for a [GPUParticles2D] or [CPUParticles2D].  
         *      
         *  **Note:** This property is only used and visible in the editor if [member particles_animation] is `true`.  
         */
        get particles_anim_v_frames(): int64
        set particles_anim_v_frames(value: int64)
        
        /** If `true`, the particles animation will loop.  
         *      
         *  **Note:** This property is only used and visible in the editor if [member particles_animation] is `true`.  
         */
        get particles_anim_loop(): boolean
        set particles_anim_loop(value: boolean)
        /** @deprecated Internal use. Does not exist at runtime. */
        __godotNameMap: __NameMapCanvasItemMaterial;
    }
    /** @deprecated Internal use. Does not exist at runtime. */
    interface __NameMapCanvasLayer extends __NameMapNode {
    }
    /** A node used for independent rendering of objects within a 2D scene.  
     *  	  
     *  @link https://docs.godotengine.org/en/4.5/classes/class_canvaslayer.html  
     */
    class CanvasLayer<Map extends NodePathMap = any> extends Node<Map> {
        constructor(identifier?: any)
        /** Shows any [CanvasItem] under this [CanvasLayer]. This is equivalent to setting [member visible] to `true`. */
        show(): void
        
        /** Hides any [CanvasItem] under this [CanvasLayer]. This is equivalent to setting [member visible] to `false`. */
        hide(): void
        
        /** Returns the transform from the [CanvasLayer]s coordinate system to the [Viewport]s coordinate system. */
        get_final_transform(): Transform2D
        
        /** Returns the RID of the canvas used by this layer. */
        get_canvas(): RID
        
        /** Layer index for draw order. Lower values are drawn behind higher values.  
         *      
         *  **Note:** If multiple CanvasLayers have the same layer index, [CanvasItem] children of one CanvasLayer are drawn behind the [CanvasItem] children of the other CanvasLayer. Which CanvasLayer is drawn in front is non-deterministic.  
         *      
         *  **Note:** The layer index should be between [constant RenderingServer.CANVAS_LAYER_MIN] and [constant RenderingServer.CANVAS_LAYER_MAX] (inclusive). Any other value will wrap around.  
         */
        get layer(): int64
        set layer(value: int64)
        
        /** If `false`, any [CanvasItem] under this [CanvasLayer] will be hidden.  
         *  Unlike [member CanvasItem.visible], visibility of a [CanvasLayer] isn't propagated to underlying layers.  
         */
        get visible(): boolean
        set visible(value: boolean)
        
        /** The layer's base offset. */
        get offset(): Vector2
        set offset(value: Vector2)
        
        /** The layer's rotation in radians. */
        get rotation(): float64
        set rotation(value: float64)
        
        /** The layer's scale. */
        get scale(): Vector2
        set scale(value: Vector2)
        
        /** The layer's transform. */
        get transform(): Transform2D
        set transform(value: Transform2D)
        
        /** The custom [Viewport] node assigned to the [CanvasLayer]. If `null`, uses the default viewport instead. */
        get custom_viewport(): null | Viewport
        set custom_viewport(value: null | Viewport)
        
        /** If enabled, the [CanvasLayer] maintains its position in world space. If disabled, the [CanvasLayer] stays in a fixed position on the screen.  
         *  Together with [member follow_viewport_scale], this can be used for a pseudo-3D effect.  
         */
        get follow_viewport_enabled(): boolean
        set follow_viewport_enabled(value: boolean)
        
        /** Scales the layer when using [member follow_viewport_enabled]. Layers moving into the foreground should have increasing scales, while layers moving into the background should have decreasing scales. */
        get follow_viewport_scale(): float64
        set follow_viewport_scale(value: float64)
        
        /** Emitted when visibility of the layer is changed. See [member visible]. */
        readonly visibility_changed: Signal<() => void>
        /** @deprecated Internal use. Does not exist at runtime. */
        __godotNameMap: __NameMapCanvasLayer;
    }
    /** @deprecated Internal use. Does not exist at runtime. */
    interface __NameMapCanvasModulate extends __NameMapNode2D {
    }
    /** A node that applies a color tint to a canvas.  
     *  	  
     *  @link https://docs.godotengine.org/en/4.5/classes/class_canvasmodulate.html  
     */
    class CanvasModulate<Map extends NodePathMap = any> extends Node2D<Map> {
        constructor(identifier?: any)
        /** The tint color to apply. */
        get color(): Color
        set color(value: Color)
        /** @deprecated Internal use. Does not exist at runtime. */
        __godotNameMap: __NameMapCanvasModulate;
    }
    /** @deprecated Internal use. Does not exist at runtime. */
    interface __NameMapCanvasTexture extends __NameMapTexture2D {
    }
    /** Texture with optional normal and specular maps for use in 2D rendering.  
     *  	  
     *  @link https://docs.godotengine.org/en/4.5/classes/class_canvastexture.html  
     */
    class CanvasTexture extends Texture2D {
        constructor(identifier?: any)
        /** The diffuse (color) texture to use. This is the main texture you want to set in most cases. */
        get diffuse_texture(): null | Texture2D
        set diffuse_texture(value: null | Texture2D)
        
        /** The normal map texture to use. Only has a visible effect if [Light2D]s are affecting this [CanvasTexture].  
         *      
         *  **Note:** Godot expects the normal map to use X+, Y+, and Z+ coordinates. See [url=http://wiki.polycount.com/wiki/Normal_Map_Technical_Details#Common_Swizzle_Coordinates]this page[/url] for a comparison of normal map coordinates expected by popular engines.  
         */
        get normal_texture(): null | Texture2D
        set normal_texture(value: null | Texture2D)
        
        /** The specular map to use for [Light2D] specular reflections. This should be a grayscale or colored texture, with brighter areas resulting in a higher [member specular_shininess] value. Using a colored [member specular_texture] allows controlling specular shininess on a per-channel basis. Only has a visible effect if [Light2D]s are affecting this [CanvasTexture]. */
        get specular_texture(): null | Texture2D
        set specular_texture(value: null | Texture2D)
        
        /** The multiplier for specular reflection colors. The [Light2D]'s color is also taken into account when determining the reflection color. Only has a visible effect if [Light2D]s are affecting this [CanvasTexture]. */
        get specular_color(): Color
        set specular_color(value: Color)
        
        /** The specular exponent for [Light2D] specular reflections. Higher values result in a more glossy/"wet" look, with reflections becoming more localized and less visible overall. The default value of `1.0` disables specular reflections entirely. Only has a visible effect if [Light2D]s are affecting this [CanvasTexture]. */
        get specular_shininess(): float64
        set specular_shininess(value: float64)
        
        /** The texture filtering mode to use when drawing this [CanvasTexture]. */
        get texture_filter(): int64
        set texture_filter(value: int64)
        
        /** The texture repeat mode to use when drawing this [CanvasTexture]. */
        get texture_repeat(): int64
        set texture_repeat(value: int64)
        /** @deprecated Internal use. Does not exist at runtime. */
        __godotNameMap: __NameMapCanvasTexture;
    }
    /** @deprecated Internal use. Does not exist at runtime. */
    interface __NameMapCapsuleMesh extends __NameMapPrimitiveMesh {
    }
    /** Class representing a capsule-shaped [PrimitiveMesh].  
     *  	  
     *  @link https://docs.godotengine.org/en/4.5/classes/class_capsulemesh.html  
     */
    class CapsuleMesh extends PrimitiveMesh {
        constructor(identifier?: any)
        /** Radius of the capsule mesh.  
         *      
         *  **Note:** The [member radius] of a capsule cannot be greater than half of its [member height]. Otherwise, the capsule becomes a circle. If the [member radius] is greater than half of the [member height], the properties adjust to a valid value.  
         */
        get radius(): float64
        set radius(value: float64)
        
        /** Total height of the capsule mesh (including the hemispherical ends).  
         *      
         *  **Note:** The [member height] of a capsule must be at least twice its [member radius]. Otherwise, the capsule becomes a circle. If the [member height] is less than twice the [member radius], the properties adjust to a valid value.  
         */
        get height(): float64
        set height(value: float64)
        
        /** Number of radial segments on the capsule mesh. */
        get radial_segments(): int64
        set radial_segments(value: int64)
        
        /** Number of rings along the height of the capsule. */
        get rings(): int64
        set rings(value: int64)
        /** @deprecated Internal use. Does not exist at runtime. */
        __godotNameMap: __NameMapCapsuleMesh;
    }
    /** @deprecated Internal use. Does not exist at runtime. */
    interface __NameMapCapsuleShape2D extends __NameMapShape2D {
    }
    /** A 2D capsule shape used for physics collision.  
     *  	  
     *  @link https://docs.godotengine.org/en/4.5/classes/class_capsuleshape2d.html  
     */
    class CapsuleShape2D extends Shape2D {
        constructor(identifier?: any)
        /** The capsule's radius.  
         *      
         *  **Note:** The [member radius] of a capsule cannot be greater than half of its [member height]. Otherwise, the capsule becomes a circle. If the [member radius] is greater than half of the [member height], the properties adjust to a valid value.  
         */
        get radius(): float64
        set radius(value: float64)
        
        /** The capsule's full height, including the semicircles.  
         *      
         *  **Note:** The [member height] of a capsule must be at least twice its [member radius]. Otherwise, the capsule becomes a circle. If the [member height] is less than twice the [member radius], the properties adjust to a valid value.  
         */
        get height(): float64
        set height(value: float64)
        
        /** The capsule's height, excluding the semicircles. This is the height of the central rectangular part in the middle of the capsule, and is the distance between the centers of the two semicircles. This is a wrapper for [member height]. */
        get mid_height(): float64
        set mid_height(value: float64)
        /** @deprecated Internal use. Does not exist at runtime. */
        __godotNameMap: __NameMapCapsuleShape2D;
    }
    /** @deprecated Internal use. Does not exist at runtime. */
    interface __NameMapCapsuleShape3D extends __NameMapShape3D {
    }
    /** A 3D capsule shape used for physics collision.  
     *  	  
     *  @link https://docs.godotengine.org/en/4.5/classes/class_capsuleshape3d.html  
     */
    class CapsuleShape3D extends Shape3D {
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
        /** @deprecated Internal use. Does not exist at runtime. */
        __godotNameMap: __NameMapCapsuleShape3D;
    }
    /** @deprecated Internal use. Does not exist at runtime. */
    interface __NameMapCenterContainer extends __NameMapContainer {
    }
    /** A container that keeps child controls in its center.  
     *  	  
     *  @link https://docs.godotengine.org/en/4.5/classes/class_centercontainer.html  
     */
    class CenterContainer<Map extends NodePathMap = any> extends Container<Map> {
        constructor(identifier?: any)
        /** If `true`, centers children relative to the [CenterContainer]'s top left corner. */
        get use_top_left(): boolean
        set use_top_left(value: boolean)
        /** @deprecated Internal use. Does not exist at runtime. */
        __godotNameMap: __NameMapCenterContainer;
    }
    /** @deprecated Internal use. Does not exist at runtime. */
    interface __NameMapCharFXTransform extends __NameMapRefCounted {
    }
    /** Controls how an individual character will be displayed in a [RichTextEffect].  
     *  	  
     *  @link https://docs.godotengine.org/en/4.5/classes/class_charfxtransform.html  
     */
    class CharFXTransform extends RefCounted {
        constructor(identifier?: any)
        /** The current transform of the current glyph. It can be overridden (for example, by driving the position and rotation from a curve). You can also alter the existing value to apply transforms on top of other effects. */
        get transform(): Transform2D
        set transform(value: Transform2D)
        
        /** Absolute character range in the string, corresponding to the glyph.  
         *      
         *  **Note:** Read-only. Setting this property won't affect drawing.  
         */
        get range(): Vector2i
        set range(value: Vector2i)
        
        /** The time elapsed since the [RichTextLabel] was added to the scene tree (in seconds). Time stops when the [RichTextLabel] is paused (see [member Node.process_mode]). Resets when the text in the [RichTextLabel] is changed.  
         *      
         *  **Note:** Time still passes while the [RichTextLabel] is hidden.  
         */
        get elapsed_time(): float64
        set elapsed_time(value: float64)
        
        /** If `true`, the character will be drawn. If `false`, the character will be hidden. Characters around hidden characters will reflow to take the space of hidden characters. If this is not desired, set their [member color] to `Color(1, 1, 1, 0)` instead. */
        get visible(): boolean
        set visible(value: boolean)
        
        /** If `true`, FX transform is called for outline drawing.  
         *      
         *  **Note:** Read-only. Setting this property won't affect drawing.  
         */
        get outline(): boolean
        set outline(value: boolean)
        
        /** The position offset the character will be drawn with (in pixels). */
        get offset(): Vector2
        set offset(value: Vector2)
        
        /** The color the character will be drawn with. */
        get color(): Color
        set color(value: Color)
        
        /** Contains the arguments passed in the opening BBCode tag. By default, arguments are strings; if their contents match a type such as [bool], [int] or [float], they will be converted automatically. Color codes in the form `#rrggbb` or `#rgb` will be converted to an opaque [Color]. String arguments may not contain spaces, even if they're quoted. If present, quotes will also be present in the final string.  
         *  For example, the opening BBCode tag `[example foo=hello bar=true baz=42 color=#ffffff]` will map to the following [Dictionary]:  
         *    
         */
        get env(): GDictionary
        set env(value: GDictionary)
        
        /** Glyph index specific to the [member font]. If you want to replace this glyph, use [method TextServer.font_get_glyph_index] with [member font] to get a new glyph index for a single character. */
        get glyph_index(): int64
        set glyph_index(value: int64)
        
        /** Number of glyphs in the grapheme cluster. This value is set in the first glyph of a cluster.  
         *      
         *  **Note:** Read-only. Setting this property won't affect drawing.  
         */
        get glyph_count(): int64
        set glyph_count(value: int64)
        
        /** Glyph flags. See [enum TextServer.GraphemeFlag] for more info.  
         *      
         *  **Note:** Read-only. Setting this property won't affect drawing.  
         */
        get glyph_flags(): int64
        set glyph_flags(value: int64)
        
        /** The character offset of the glyph, relative to the current [RichTextEffect] custom block.  
         *      
         *  **Note:** Read-only. Setting this property won't affect drawing.  
         */
        get relative_index(): int64
        set relative_index(value: int64)
        
        /** [TextServer] RID of the font used to render glyph, this value can be used with `TextServer.font_*` methods to retrieve font information.  
         *      
         *  **Note:** Read-only. Setting this property won't affect drawing.  
         */
        get font(): RID
        set font(value: RID)
        /** @deprecated Internal use. Does not exist at runtime. */
        __godotNameMap: __NameMapCharFXTransform;
    }
    namespace CharacterBody2D {
        enum MotionMode {
            /** Apply when notions of walls, ceiling and floor are relevant. In this mode the body motion will react to slopes (acceleration/slowdown). This mode is suitable for sided games like platformers. */
            MOTION_MODE_GROUNDED = 0,
            
            /** Apply when there is no notion of floor or ceiling. All collisions will be reported as `on_wall`. In this mode, when you slide, the speed will always be constant. This mode is suitable for top-down games. */
            MOTION_MODE_FLOATING = 1,
        }
        enum PlatformOnLeave {
            /** Add the last platform velocity to the [member velocity] when you leave a moving platform. */
            PLATFORM_ON_LEAVE_ADD_VELOCITY = 0,
            
            /** Add the last platform velocity to the [member velocity] when you leave a moving platform, but any downward motion is ignored. It's useful to keep full jump height even when the platform is moving down. */
            PLATFORM_ON_LEAVE_ADD_UPWARD_VELOCITY = 1,
            
            /** Do nothing when leaving a platform. */
            PLATFORM_ON_LEAVE_DO_NOTHING = 2,
        }
    }
    /** @deprecated Internal use. Does not exist at runtime. */
    interface __NameMapCharacterBody2D extends __NameMapPhysicsBody2D {
    }
    /** A 2D physics body specialized for characters moved by script.  
     *  	  
     *  @link https://docs.godotengine.org/en/4.5/classes/class_characterbody2d.html  
     */
    class CharacterBody2D<Map extends NodePathMap = any> extends PhysicsBody2D<Map> {
        constructor(identifier?: any)
        /** Moves the body based on [member velocity]. If the body collides with another, it will slide along the other body (by default only on floor) rather than stop immediately. If the other body is a [CharacterBody2D] or [RigidBody2D], it will also be affected by the motion of the other body. You can use this to make moving and rotating platforms, or to make nodes push other nodes.  
         *  This method should be used in [method Node._physics_process] (or in a method called by [method Node._physics_process]), as it uses the physics step's `delta` value automatically in calculations. Otherwise, the simulation will run at an incorrect speed.  
         *  Modifies [member velocity] if a slide collision occurred. To get the latest collision call [method get_last_slide_collision], for detailed information about collisions that occurred, use [method get_slide_collision].  
         *  When the body touches a moving platform, the platform's velocity is automatically added to the body motion. If a collision occurs due to the platform's motion, it will always be first in the slide collisions.  
         *  The general behavior and available properties change according to the [member motion_mode].  
         *  Returns `true` if the body collided, otherwise, returns `false`.  
         */
        move_and_slide(): boolean
        
        /** Allows to manually apply a snap to the floor regardless of the body's velocity. This function does nothing when [method is_on_floor] returns `true`. */
        apply_floor_snap(): void
        
        /** Returns `true` if the body collided with the floor on the last call of [method move_and_slide]. Otherwise, returns `false`. The [member up_direction] and [member floor_max_angle] are used to determine whether a surface is "floor" or not. */
        is_on_floor(): boolean
        
        /** Returns `true` if the body collided only with the floor on the last call of [method move_and_slide]. Otherwise, returns `false`. The [member up_direction] and [member floor_max_angle] are used to determine whether a surface is "floor" or not. */
        is_on_floor_only(): boolean
        
        /** Returns `true` if the body collided with the ceiling on the last call of [method move_and_slide]. Otherwise, returns `false`. The [member up_direction] and [member floor_max_angle] are used to determine whether a surface is "ceiling" or not. */
        is_on_ceiling(): boolean
        
        /** Returns `true` if the body collided only with the ceiling on the last call of [method move_and_slide]. Otherwise, returns `false`. The [member up_direction] and [member floor_max_angle] are used to determine whether a surface is "ceiling" or not. */
        is_on_ceiling_only(): boolean
        
        /** Returns `true` if the body collided with a wall on the last call of [method move_and_slide]. Otherwise, returns `false`. The [member up_direction] and [member floor_max_angle] are used to determine whether a surface is "wall" or not. */
        is_on_wall(): boolean
        
        /** Returns `true` if the body collided only with a wall on the last call of [method move_and_slide]. Otherwise, returns `false`. The [member up_direction] and [member floor_max_angle] are used to determine whether a surface is "wall" or not. */
        is_on_wall_only(): boolean
        
        /** Returns the collision normal of the floor at the last collision point. Only valid after calling [method move_and_slide] and when [method is_on_floor] returns `true`.  
         *  **Warning:** The collision normal is not always the same as the surface normal.  
         */
        get_floor_normal(): Vector2
        
        /** Returns the collision normal of the wall at the last collision point. Only valid after calling [method move_and_slide] and when [method is_on_wall] returns `true`.  
         *  **Warning:** The collision normal is not always the same as the surface normal.  
         */
        get_wall_normal(): Vector2
        
        /** Returns the last motion applied to the [CharacterBody2D] during the last call to [method move_and_slide]. The movement can be split into multiple motions when sliding occurs, and this method return the last one, which is useful to retrieve the current direction of the movement. */
        get_last_motion(): Vector2
        
        /** Returns the travel (position delta) that occurred during the last call to [method move_and_slide]. */
        get_position_delta(): Vector2
        
        /** Returns the current real velocity since the last call to [method move_and_slide]. For example, when you climb a slope, you will move diagonally even though the velocity is horizontal. This method returns the diagonal movement, as opposed to [member velocity] which returns the requested velocity. */
        get_real_velocity(): Vector2
        
        /** Returns the floor's collision angle at the last collision point according to [param up_direction], which is [constant Vector2.UP] by default. This value is always positive and only valid after calling [method move_and_slide] and when [method is_on_floor] returns `true`. */
        get_floor_angle(up_direction?: Vector2 /* = new Vector2(0, -1) */): float64
        
        /** Returns the linear velocity of the platform at the last collision point. Only valid after calling [method move_and_slide]. */
        get_platform_velocity(): Vector2
        
        /** Returns the number of times the body collided and changed direction during the last call to [method move_and_slide]. */
        get_slide_collision_count(): int64
        
        /** Returns a [KinematicCollision2D], which contains information about a collision that occurred during the last call to [method move_and_slide]. Since the body can collide several times in a single call to [method move_and_slide], you must specify the index of the collision in the range 0 to ([method get_slide_collision_count] - 1).  
         *  **Example:** Iterate through the collisions with a `for` loop:  
         *    
         */
        get_slide_collision(slide_idx: int64): null | KinematicCollision2D
        
        /** Returns a [KinematicCollision2D], which contains information about the latest collision that occurred during the last call to [method move_and_slide]. */
        get_last_slide_collision(): null | KinematicCollision2D
        
        /** Sets the motion mode which defines the behavior of [method move_and_slide]. */
        get motion_mode(): int64
        set motion_mode(value: int64)
        
        /** Vector pointing upwards, used to determine what is a wall and what is a floor (or a ceiling) when calling [method move_and_slide]. Defaults to [constant Vector2.UP]. As the vector will be normalized it can't be equal to [constant Vector2.ZERO], if you want all collisions to be reported as walls, consider using [constant MOTION_MODE_FLOATING] as [member motion_mode]. */
        get up_direction(): Vector2
        set up_direction(value: Vector2)
        
        /** Current velocity vector in pixels per second, used and modified during calls to [method move_and_slide].  
         *  This property should not be set to a value multiplied by `delta`, because this happens internally in [method move_and_slide]. Otherwise, the simulation will run at an incorrect speed.  
         */
        get velocity(): Vector2
        set velocity(value: Vector2)
        
        /** If `true`, during a jump against the ceiling, the body will slide, if `false` it will be stopped and will fall vertically. */
        get slide_on_ceiling(): boolean
        set slide_on_ceiling(value: boolean)
        
        /** Maximum number of times the body can change direction before it stops when calling [method move_and_slide]. Must be greater than zero. */
        get max_slides(): int64
        set max_slides(value: int64)
        
        /** Minimum angle (in radians) where the body is allowed to slide when it encounters a wall. The default value equals 15 degrees. This property only affects movement when [member motion_mode] is [constant MOTION_MODE_FLOATING]. */
        get wall_min_slide_angle(): float64
        set wall_min_slide_angle(value: float64)
        
        /** If `true`, the body will not slide on slopes when calling [method move_and_slide] when the body is standing still.  
         *  If `false`, the body will slide on floor's slopes when [member velocity] applies a downward force.  
         */
        get floor_stop_on_slope(): boolean
        set floor_stop_on_slope(value: boolean)
        
        /** If `false` (by default), the body will move faster on downward slopes and slower on upward slopes.  
         *  If `true`, the body will always move at the same speed on the ground no matter the slope. Note that you need to use [member floor_snap_length] to stick along a downward slope at constant speed.  
         */
        get floor_constant_speed(): boolean
        set floor_constant_speed(value: boolean)
        
        /** If `true`, the body will be able to move on the floor only. This option avoids to be able to walk on walls, it will however allow to slide down along them. */
        get floor_block_on_wall(): boolean
        set floor_block_on_wall(value: boolean)
        
        /** Maximum angle (in radians) where a slope is still considered a floor (or a ceiling), rather than a wall, when calling [method move_and_slide]. The default value equals 45 degrees. */
        get floor_max_angle(): float64
        set floor_max_angle(value: float64)
        
        /** Sets a snapping distance. When set to a value different from `0.0`, the body is kept attached to slopes when calling [method move_and_slide]. The snapping vector is determined by the given distance along the opposite direction of the [member up_direction].  
         *  As long as the snapping vector is in contact with the ground and the body moves against [member up_direction], the body will remain attached to the surface. Snapping is not applied if the body moves along [member up_direction], meaning it contains vertical rising velocity, so it will be able to detach from the ground when jumping or when the body is pushed up by something. If you want to apply a snap without taking into account the velocity, use [method apply_floor_snap].  
         */
        get floor_snap_length(): float64
        set floor_snap_length(value: float64)
        
        /** Sets the behavior to apply when you leave a moving platform. By default, to be physically accurate, when you leave the last platform velocity is applied. */
        get platform_on_leave(): int64
        set platform_on_leave(value: int64)
        
        /** Collision layers that will be included for detecting floor bodies that will act as moving platforms to be followed by the [CharacterBody2D]. By default, all floor bodies are detected and propagate their velocity. */
        get platform_floor_layers(): int64
        set platform_floor_layers(value: int64)
        
        /** Collision layers that will be included for detecting wall bodies that will act as moving platforms to be followed by the [CharacterBody2D]. By default, all wall bodies are ignored. */
        get platform_wall_layers(): int64
        set platform_wall_layers(value: int64)
        
        /** Extra margin used for collision recovery when calling [method move_and_slide].  
         *  If the body is at least this close to another body, it will consider them to be colliding and will be pushed away before performing the actual motion.  
         *  A higher value means it's more flexible for detecting collision, which helps with consistently detecting walls and floors.  
         *  A lower value forces the collision algorithm to use more exact detection, so it can be used in cases that specifically require precision, e.g at very low scale to avoid visible jittering, or for stability with a stack of character bodies.  
         */
        get safe_margin(): float64
        set safe_margin(value: float64)
        /** @deprecated Internal use. Does not exist at runtime. */
        __godotNameMap: __NameMapCharacterBody2D;
    }
    namespace CharacterBody3D {
        enum MotionMode {
            /** Apply when notions of walls, ceiling and floor are relevant. In this mode the body motion will react to slopes (acceleration/slowdown). This mode is suitable for grounded games like platformers. */
            MOTION_MODE_GROUNDED = 0,
            
            /** Apply when there is no notion of floor or ceiling. All collisions will be reported as `on_wall`. In this mode, when you slide, the speed will always be constant. This mode is suitable for games without ground like space games. */
            MOTION_MODE_FLOATING = 1,
        }
        enum PlatformOnLeave {
            /** Add the last platform velocity to the [member velocity] when you leave a moving platform. */
            PLATFORM_ON_LEAVE_ADD_VELOCITY = 0,
            
            /** Add the last platform velocity to the [member velocity] when you leave a moving platform, but any downward motion is ignored. It's useful to keep full jump height even when the platform is moving down. */
            PLATFORM_ON_LEAVE_ADD_UPWARD_VELOCITY = 1,
            
            /** Do nothing when leaving a platform. */
            PLATFORM_ON_LEAVE_DO_NOTHING = 2,
        }
    }
    /** @deprecated Internal use. Does not exist at runtime. */
    interface __NameMapCharacterBody3D extends __NameMapPhysicsBody3D {
    }
    /** A 3D physics body specialized for characters moved by script.  
     *  	  
     *  @link https://docs.godotengine.org/en/4.5/classes/class_characterbody3d.html  
     */
    class CharacterBody3D<Map extends NodePathMap = any> extends PhysicsBody3D<Map> {
        constructor(identifier?: any)
        /** Moves the body based on [member velocity]. If the body collides with another, it will slide along the other body rather than stop immediately. If the other body is a [CharacterBody3D] or [RigidBody3D], it will also be affected by the motion of the other body. You can use this to make moving and rotating platforms, or to make nodes push other nodes.  
         *  This method should be used in [method Node._physics_process] (or in a method called by [method Node._physics_process]), as it uses the physics step's `delta` value automatically in calculations. Otherwise, the simulation will run at an incorrect speed.  
         *  Modifies [member velocity] if a slide collision occurred. To get the latest collision call [method get_last_slide_collision], for more detailed information about collisions that occurred, use [method get_slide_collision].  
         *  When the body touches a moving platform, the platform's velocity is automatically added to the body motion. If a collision occurs due to the platform's motion, it will always be first in the slide collisions.  
         *  Returns `true` if the body collided, otherwise, returns `false`.  
         */
        move_and_slide(): boolean
        
        /** Allows to manually apply a snap to the floor regardless of the body's velocity. This function does nothing when [method is_on_floor] returns `true`. */
        apply_floor_snap(): void
        
        /** Returns `true` if the body collided with the floor on the last call of [method move_and_slide]. Otherwise, returns `false`. The [member up_direction] and [member floor_max_angle] are used to determine whether a surface is "floor" or not. */
        is_on_floor(): boolean
        
        /** Returns `true` if the body collided only with the floor on the last call of [method move_and_slide]. Otherwise, returns `false`. The [member up_direction] and [member floor_max_angle] are used to determine whether a surface is "floor" or not. */
        is_on_floor_only(): boolean
        
        /** Returns `true` if the body collided with the ceiling on the last call of [method move_and_slide]. Otherwise, returns `false`. The [member up_direction] and [member floor_max_angle] are used to determine whether a surface is "ceiling" or not. */
        is_on_ceiling(): boolean
        
        /** Returns `true` if the body collided only with the ceiling on the last call of [method move_and_slide]. Otherwise, returns `false`. The [member up_direction] and [member floor_max_angle] are used to determine whether a surface is "ceiling" or not. */
        is_on_ceiling_only(): boolean
        
        /** Returns `true` if the body collided with a wall on the last call of [method move_and_slide]. Otherwise, returns `false`. The [member up_direction] and [member floor_max_angle] are used to determine whether a surface is "wall" or not. */
        is_on_wall(): boolean
        
        /** Returns `true` if the body collided only with a wall on the last call of [method move_and_slide]. Otherwise, returns `false`. The [member up_direction] and [member floor_max_angle] are used to determine whether a surface is "wall" or not. */
        is_on_wall_only(): boolean
        
        /** Returns the collision normal of the floor at the last collision point. Only valid after calling [method move_and_slide] and when [method is_on_floor] returns `true`.  
         *  **Warning:** The collision normal is not always the same as the surface normal.  
         */
        get_floor_normal(): Vector3
        
        /** Returns the collision normal of the wall at the last collision point. Only valid after calling [method move_and_slide] and when [method is_on_wall] returns `true`.  
         *  **Warning:** The collision normal is not always the same as the surface normal.  
         */
        get_wall_normal(): Vector3
        
        /** Returns the last motion applied to the [CharacterBody3D] during the last call to [method move_and_slide]. The movement can be split into multiple motions when sliding occurs, and this method return the last one, which is useful to retrieve the current direction of the movement. */
        get_last_motion(): Vector3
        
        /** Returns the travel (position delta) that occurred during the last call to [method move_and_slide]. */
        get_position_delta(): Vector3
        
        /** Returns the current real velocity since the last call to [method move_and_slide]. For example, when you climb a slope, you will move diagonally even though the velocity is horizontal. This method returns the diagonal movement, as opposed to [member velocity] which returns the requested velocity. */
        get_real_velocity(): Vector3
        
        /** Returns the floor's collision angle at the last collision point according to [param up_direction], which is [constant Vector3.UP] by default. This value is always positive and only valid after calling [method move_and_slide] and when [method is_on_floor] returns `true`. */
        get_floor_angle(up_direction?: Vector3 /* = Vector3.ZERO */): float64
        
        /** Returns the linear velocity of the platform at the last collision point. Only valid after calling [method move_and_slide]. */
        get_platform_velocity(): Vector3
        
        /** Returns the angular velocity of the platform at the last collision point. Only valid after calling [method move_and_slide]. */
        get_platform_angular_velocity(): Vector3
        
        /** Returns the number of times the body collided and changed direction during the last call to [method move_and_slide]. */
        get_slide_collision_count(): int64
        
        /** Returns a [KinematicCollision3D], which contains information about a collision that occurred during the last call to [method move_and_slide]. Since the body can collide several times in a single call to [method move_and_slide], you must specify the index of the collision in the range 0 to ([method get_slide_collision_count] - 1). */
        get_slide_collision(slide_idx: int64): null | KinematicCollision3D
        
        /** Returns a [KinematicCollision3D], which contains information about the latest collision that occurred during the last call to [method move_and_slide]. */
        get_last_slide_collision(): null | KinematicCollision3D
        
        /** Sets the motion mode which defines the behavior of [method move_and_slide]. */
        get motion_mode(): int64
        set motion_mode(value: int64)
        
        /** Vector pointing upwards, used to determine what is a wall and what is a floor (or a ceiling) when calling [method move_and_slide]. Defaults to [constant Vector3.UP]. As the vector will be normalized it can't be equal to [constant Vector3.ZERO], if you want all collisions to be reported as walls, consider using [constant MOTION_MODE_FLOATING] as [member motion_mode]. */
        get up_direction(): Vector3
        set up_direction(value: Vector3)
        
        /** If `true`, during a jump against the ceiling, the body will slide, if `false` it will be stopped and will fall vertically. */
        get slide_on_ceiling(): boolean
        set slide_on_ceiling(value: boolean)
        
        /** Current velocity vector (typically meters per second), used and modified during calls to [method move_and_slide].  
         *  This property should not be set to a value multiplied by `delta`, because this happens internally in [method move_and_slide]. Otherwise, the simulation will run at an incorrect speed.  
         */
        get velocity(): Vector3
        set velocity(value: Vector3)
        
        /** Maximum number of times the body can change direction before it stops when calling [method move_and_slide]. Must be greater than zero. */
        get max_slides(): int64
        set max_slides(value: int64)
        
        /** Minimum angle (in radians) where the body is allowed to slide when it encounters a wall. The default value equals 15 degrees. When [member motion_mode] is [constant MOTION_MODE_GROUNDED], it only affects movement if [member floor_block_on_wall] is `true`. */
        get wall_min_slide_angle(): float64
        set wall_min_slide_angle(value: float64)
        
        /** If `true`, the body will not slide on slopes when calling [method move_and_slide] when the body is standing still.  
         *  If `false`, the body will slide on floor's slopes when [member velocity] applies a downward force.  
         */
        get floor_stop_on_slope(): boolean
        set floor_stop_on_slope(value: boolean)
        
        /** If `false` (by default), the body will move faster on downward slopes and slower on upward slopes.  
         *  If `true`, the body will always move at the same speed on the ground no matter the slope. Note that you need to use [member floor_snap_length] to stick along a downward slope at constant speed.  
         */
        get floor_constant_speed(): boolean
        set floor_constant_speed(value: boolean)
        
        /** If `true`, the body will be able to move on the floor only. This option avoids to be able to walk on walls, it will however allow to slide down along them. */
        get floor_block_on_wall(): boolean
        set floor_block_on_wall(value: boolean)
        
        /** Maximum angle (in radians) where a slope is still considered a floor (or a ceiling), rather than a wall, when calling [method move_and_slide]. The default value equals 45 degrees. */
        get floor_max_angle(): float64
        set floor_max_angle(value: float64)
        
        /** Sets a snapping distance. When set to a value different from `0.0`, the body is kept attached to slopes when calling [method move_and_slide]. The snapping vector is determined by the given distance along the opposite direction of the [member up_direction].  
         *  As long as the snapping vector is in contact with the ground and the body moves against [member up_direction], the body will remain attached to the surface. Snapping is not applied if the body moves along [member up_direction], meaning it contains vertical rising velocity, so it will be able to detach from the ground when jumping or when the body is pushed up by something. If you want to apply a snap without taking into account the velocity, use [method apply_floor_snap].  
         */
        get floor_snap_length(): float64
        set floor_snap_length(value: float64)
        
        /** Sets the behavior to apply when you leave a moving platform. By default, to be physically accurate, when you leave the last platform velocity is applied. */
        get platform_on_leave(): int64
        set platform_on_leave(value: int64)
        
        /** Collision layers that will be included for detecting floor bodies that will act as moving platforms to be followed by the [CharacterBody3D]. By default, all floor bodies are detected and propagate their velocity. */
        get platform_floor_layers(): int64
        set platform_floor_layers(value: int64)
        
        /** Collision layers that will be included for detecting wall bodies that will act as moving platforms to be followed by the [CharacterBody3D]. By default, all wall bodies are ignored. */
        get platform_wall_layers(): int64
        set platform_wall_layers(value: int64)
        
        /** Extra margin used for collision recovery when calling [method move_and_slide].  
         *  If the body is at least this close to another body, it will consider them to be colliding and will be pushed away before performing the actual motion.  
         *  A higher value means it's more flexible for detecting collision, which helps with consistently detecting walls and floors.  
         *  A lower value forces the collision algorithm to use more exact detection, so it can be used in cases that specifically require precision, e.g at very low scale to avoid visible jittering, or for stability with a stack of character bodies.  
         */
        get safe_margin(): float64
        set safe_margin(value: float64)
        /** @deprecated Internal use. Does not exist at runtime. */
        __godotNameMap: __NameMapCharacterBody3D;
    }
    /** @deprecated Internal use. Does not exist at runtime. */
    interface __NameMapCheckBox extends __NameMapButton {
    }
    /** A button that represents a binary choice.  
     *  	  
     *  @link https://docs.godotengine.org/en/4.5/classes/class_checkbox.html  
     */
    class CheckBox<Map extends NodePathMap = any> extends Button<Map> {
        constructor(identifier?: any)
        /** @deprecated Internal use. Does not exist at runtime. */
        __godotNameMap: __NameMapCheckBox;
    }
    /** @deprecated Internal use. Does not exist at runtime. */
    interface __NameMapCheckButton extends __NameMapButton {
    }
    /** A button that represents a binary choice.  
     *  	  
     *  @link https://docs.godotengine.org/en/4.5/classes/class_checkbutton.html  
     */
    class CheckButton<Map extends NodePathMap = any> extends Button<Map> {
        constructor(identifier?: any)
        /** @deprecated Internal use. Does not exist at runtime. */
        __godotNameMap: __NameMapCheckButton;
    }
    /** @deprecated Internal use. Does not exist at runtime. */
    interface __NameMapCircleShape2D extends __NameMapShape2D {
    }
    /** A 2D circle shape used for physics collision.  
     *  	  
     *  @link https://docs.godotengine.org/en/4.5/classes/class_circleshape2d.html  
     */
    class CircleShape2D extends Shape2D {
        constructor(identifier?: any)
        /** The circle's radius. */
        get radius(): float64
        set radius(value: float64)
        /** @deprecated Internal use. Does not exist at runtime. */
        __godotNameMap: __NameMapCircleShape2D;
    }
    namespace CodeEdit {
        enum CodeCompletionKind {
            /** Marks the option as a class. */
            KIND_CLASS = 0,
            
            /** Marks the option as a function. */
            KIND_FUNCTION = 1,
            
            /** Marks the option as a Godot signal. */
            KIND_SIGNAL = 2,
            
            /** Marks the option as a variable. */
            KIND_VARIABLE = 3,
            
            /** Marks the option as a member. */
            KIND_MEMBER = 4,
            
            /** Marks the option as an enum entry. */
            KIND_ENUM = 5,
            
            /** Marks the option as a constant. */
            KIND_CONSTANT = 6,
            
            /** Marks the option as a Godot node path. */
            KIND_NODE_PATH = 7,
            
            /** Marks the option as a file path. */
            KIND_FILE_PATH = 8,
            
            /** Marks the option as unclassified or plain text. */
            KIND_PLAIN_TEXT = 9,
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
    }
    /** @deprecated Internal use. Does not exist at runtime. */
    interface __NameMapCodeEdit extends __NameMapTextEdit {
    }
    /** A multiline text editor designed for editing code.  
     *  	  
     *  @link https://docs.godotengine.org/en/4.5/classes/class_codeedit.html  
     */
    class CodeEdit<Map extends NodePathMap = any> extends TextEdit<Map> {
        constructor(identifier?: any)
        /** Override this method to define how the selected entry should be inserted. If [param replace] is `true`, any existing text should be replaced. */
        /* gdvirtual */ _confirm_code_completion(replace: boolean): void
        
        /** Override this method to define what happens when the user requests code completion. If [param force] is `true`, any checks should be bypassed. */
        /* gdvirtual */ _request_code_completion(force: boolean): void
        
        /** Override this method to define what items in [param candidates] should be displayed.  
         *  Both [param candidates] and the return is an [Array] of [Dictionary], see [method get_code_completion_option] for [Dictionary] content.  
         */
        /* gdvirtual */ _filter_code_completion_candidates(candidates: GArray<GDictionary>): GArray<GDictionary>
        
        /** If there is no selection, indentation is inserted at the caret. Otherwise, the selected lines are indented like [method indent_lines]. Equivalent to the [member ProjectSettings.input/ui_text_indent] action. The indentation characters used depend on [member indent_use_spaces] and [member indent_size]. */
        do_indent(): void
        
        /** Indents all lines that are selected or have a caret on them. Uses spaces or a tab depending on [member indent_use_spaces]. See [method unindent_lines]. */
        indent_lines(): void
        
        /** Unindents all lines that are selected or have a caret on them. Uses spaces or a tab depending on [member indent_use_spaces]. Equivalent to the [member ProjectSettings.input/ui_text_dedent] action. See [method indent_lines]. */
        unindent_lines(): void
        
        /** Converts the indents of lines between [param from_line] and [param to_line] to tabs or spaces as set by [member indent_use_spaces].  
         *  Values of `-1` convert the entire text.  
         */
        convert_indent(from_line?: int64 /* = -1 */, to_line?: int64 /* = -1 */): void
        
        /** Adds a brace pair.  
         *  Both the start and end keys must be symbols. Only the start key has to be unique.  
         */
        add_auto_brace_completion_pair(start_key: string, end_key: string): void
        
        /** Returns `true` if open key [param open_key] exists. */
        has_auto_brace_completion_open_key(open_key: string): boolean
        
        /** Returns `true` if close key [param close_key] exists. */
        has_auto_brace_completion_close_key(close_key: string): boolean
        
        /** Gets the matching auto brace close key for [param open_key]. */
        get_auto_brace_completion_close_key(open_key: string): string
        
        /** Sets the given line as a breakpoint. If `true` and [member gutters_draw_breakpoints_gutter] is `true`, draws the [theme_item breakpoint] icon in the gutter for this line. See [method get_breakpointed_lines] and [method is_line_breakpointed]. */
        set_line_as_breakpoint(line: int64, breakpointed: boolean): void
        
        /** Returns `true` if the given line is breakpointed. See [method set_line_as_breakpoint]. */
        is_line_breakpointed(line: int64): boolean
        
        /** Clears all breakpointed lines. */
        clear_breakpointed_lines(): void
        
        /** Gets all breakpointed lines. */
        get_breakpointed_lines(): PackedInt32Array
        
        /** Sets the given line as bookmarked. If `true` and [member gutters_draw_bookmarks] is `true`, draws the [theme_item bookmark] icon in the gutter for this line. See [method get_bookmarked_lines] and [method is_line_bookmarked]. */
        set_line_as_bookmarked(line: int64, bookmarked: boolean): void
        
        /** Returns `true` if the given line is bookmarked. See [method set_line_as_bookmarked]. */
        is_line_bookmarked(line: int64): boolean
        
        /** Clears all bookmarked lines. */
        clear_bookmarked_lines(): void
        
        /** Gets all bookmarked lines. */
        get_bookmarked_lines(): PackedInt32Array
        
        /** Sets the given line as executing. If `true` and [member gutters_draw_executing_lines] is `true`, draws the [theme_item executing_line] icon in the gutter for this line. See [method get_executing_lines] and [method is_line_executing]. */
        set_line_as_executing(line: int64, executing: boolean): void
        
        /** Returns `true` if the given line is marked as executing. See [method set_line_as_executing]. */
        is_line_executing(line: int64): boolean
        
        /** Clears all executed lines. */
        clear_executing_lines(): void
        
        /** Gets all executing lines. */
        get_executing_lines(): PackedInt32Array
        
        /** Returns `true` if the given line is foldable. A line is foldable if it is the start of a valid code region (see [method get_code_region_start_tag]), if it is the start of a comment or string block, or if the next non-empty line is more indented (see [method TextEdit.get_indent_level]). */
        can_fold_line(line: int64): boolean
        
        /** Folds the given line, if possible (see [method can_fold_line]). */
        fold_line(line: int64): void
        
        /** Unfolds the given line if it is folded or if it is hidden under a folded line. */
        unfold_line(line: int64): void
        
        /** Folds all lines that are possible to be folded (see [method can_fold_line]). */
        fold_all_lines(): void
        
        /** Unfolds all lines that are folded. */
        unfold_all_lines(): void
        
        /** Toggle the folding of the code block at the given line. */
        toggle_foldable_line(line: int64): void
        
        /** Toggle the folding of the code block on all lines with a caret on them. */
        toggle_foldable_lines_at_carets(): void
        
        /** Returns `true` if the given line is folded. See [method fold_line]. */
        is_line_folded(line: int64): boolean
        
        /** Returns all lines that are currently folded. */
        get_folded_lines(): GArray<int64>
        
        /** Creates a new code region with the selection. At least one single line comment delimiter have to be defined (see [method add_comment_delimiter]).  
         *  A code region is a part of code that is highlighted when folded and can help organize your script.  
         *  Code region start and end tags can be customized (see [method set_code_region_tags]).  
         *  Code regions are delimited using start and end tags (respectively `region` and `endregion` by default) preceded by one line comment delimiter. (eg. `#region` and `#endregion`)  
         */
        create_code_region(): void
        
        /** Returns the code region start tag (without comment delimiter). */
        get_code_region_start_tag(): string
        
        /** Returns the code region end tag (without comment delimiter). */
        get_code_region_end_tag(): string
        
        /** Sets the code region start and end tags (without comment delimiter). */
        set_code_region_tags(start?: string /* = 'region' */, end?: string /* = 'endregion' */): void
        
        /** Returns `true` if the given line is a code region start. See [method set_code_region_tags]. */
        is_line_code_region_start(line: int64): boolean
        
        /** Returns `true` if the given line is a code region end. See [method set_code_region_tags]. */
        is_line_code_region_end(line: int64): boolean
        
        /** Defines a string delimiter from [param start_key] to [param end_key]. Both keys should be symbols, and [param start_key] must not be shared with other delimiters.  
         *  If [param line_only] is `true` or [param end_key] is an empty [String], the region does not carry over to the next line.  
         */
        add_string_delimiter(start_key: string, end_key: string, line_only?: boolean /* = false */): void
        
        /** Removes the string delimiter with [param start_key]. */
        remove_string_delimiter(start_key: string): void
        
        /** Returns `true` if string [param start_key] exists. */
        has_string_delimiter(start_key: string): boolean
        
        /** Removes all string delimiters. */
        clear_string_delimiters(): void
        
        /** Returns the delimiter index if [param line] [param column] is in a string. If [param column] is not provided, will return the delimiter index if the entire [param line] is a string. Otherwise `-1`. */
        is_in_string(line: int64, column?: int64 /* = -1 */): int64
        
        /** Adds a comment delimiter from [param start_key] to [param end_key]. Both keys should be symbols, and [param start_key] must not be shared with other delimiters.  
         *  If [param line_only] is `true` or [param end_key] is an empty [String], the region does not carry over to the next line.  
         */
        add_comment_delimiter(start_key: string, end_key: string, line_only?: boolean /* = false */): void
        
        /** Removes the comment delimiter with [param start_key]. */
        remove_comment_delimiter(start_key: string): void
        
        /** Returns `true` if comment [param start_key] exists. */
        has_comment_delimiter(start_key: string): boolean
        
        /** Removes all comment delimiters. */
        clear_comment_delimiters(): void
        
        /** Returns delimiter index if [param line] [param column] is in a comment. If [param column] is not provided, will return delimiter index if the entire [param line] is a comment. Otherwise `-1`. */
        is_in_comment(line: int64, column?: int64 /* = -1 */): int64
        
        /** Gets the start key for a string or comment region index. */
        get_delimiter_start_key(delimiter_index: int64): string
        
        /** Gets the end key for a string or comment region index. */
        get_delimiter_end_key(delimiter_index: int64): string
        
        /** If [param line] [param column] is in a string or comment, returns the start position of the region. If not or no start could be found, both [Vector2] values will be `-1`. */
        get_delimiter_start_position(line: int64, column: int64): Vector2
        
        /** If [param line] [param column] is in a string or comment, returns the end position of the region. If not or no end could be found, both [Vector2] values will be `-1`. */
        get_delimiter_end_position(line: int64, column: int64): Vector2
        
        /** Sets the code hint text. Pass an empty string to clear. */
        set_code_hint(code_hint: string): void
        
        /** If `true`, the code hint will draw below the main caret. If `false`, the code hint will draw above the main caret. See [method set_code_hint]. */
        set_code_hint_draw_below(draw_below: boolean): void
        
        /** Returns the full text with char `0xFFFF` at the caret location. */
        get_text_for_code_completion(): string
        
        /** Emits [signal code_completion_requested], if [param force] is `true` will bypass all checks. Otherwise will check that the caret is in a word or in front of a prefix. Will ignore the request if all current options are of type file path, node path, or signal. */
        request_code_completion(force?: boolean /* = false */): void
        
        /** Submits an item to the queue of potential candidates for the autocomplete menu. Call [method update_code_completion_options] to update the list.  
         *  [param location] indicates location of the option relative to the location of the code completion query. See [enum CodeEdit.CodeCompletionLocation] for how to set this value.  
         *      
         *  **Note:** This list will replace all current candidates.  
         */
        add_code_completion_option(type: CodeEdit.CodeCompletionKind, display_text: string, insert_text: string, text_color?: Color /* = new Color(1, 1, 1, 1) */, icon?: Resource /* = undefined */, value?: any /* = <any> {} */, location?: int64 /* = 1024 */): void
        
        /** Submits all completion options added with [method add_code_completion_option]. Will try to force the autocomplete menu to popup, if [param force] is `true`.  
         *      
         *  **Note:** This will replace all current candidates.  
         */
        update_code_completion_options(force: boolean): void
        
        /** Gets all completion options, see [method get_code_completion_option] for return content. */
        get_code_completion_options(): GArray<GDictionary>
        
        /** Gets the completion option at [param index]. The return [Dictionary] has the following key-values:  
         *  `kind`: [enum CodeCompletionKind]  
         *  `display_text`: Text that is shown on the autocomplete menu.  
         *  `insert_text`: Text that is to be inserted when this item is selected.  
         *  `font_color`: Color of the text on the autocomplete menu.  
         *  `icon`: Icon to draw on the autocomplete menu.  
         *  `default_value`: Value of the symbol.  
         */
        get_code_completion_option(index: int64): GDictionary
        
        /** Gets the index of the current selected completion option. */
        get_code_completion_selected_index(): int64
        
        /** Sets the current selected completion option. */
        set_code_completion_selected_index(index: int64): void
        
        /** Inserts the selected entry into the text. If [param replace] is `true`, any existing text is replaced rather than merged. */
        confirm_code_completion(replace?: boolean /* = false */): void
        
        /** Cancels the autocomplete menu. */
        cancel_code_completion(): void
        
        /** Returns the full text with char `0xFFFF` at the cursor location. */
        get_text_for_symbol_lookup(): string
        
        /** Returns the full text with char `0xFFFF` at the specified location. */
        get_text_with_cursor_char(line: int64, column: int64): string
        
        /** Sets the symbol emitted by [signal symbol_validate] as a valid lookup. */
        set_symbol_lookup_word_as_valid(valid: boolean): void
        
        /** Moves all lines up that are selected or have a caret on them. */
        move_lines_up(): void
        
        /** Moves all lines down that are selected or have a caret on them. */
        move_lines_down(): void
        
        /** Deletes all lines that are selected or have a caret on them. */
        delete_lines(): void
        
        /** Duplicates all selected text and duplicates all lines with a caret on them. */
        duplicate_selection(): void
        
        /** Duplicates all lines currently selected with any caret. Duplicates the entire line beneath the current one no matter where the caret is within the line. */
        duplicate_lines(): void
        
        /** Set when a validated word from [signal symbol_validate] is clicked, the [signal symbol_lookup] should be emitted. */
        get symbol_lookup_on_click(): boolean
        set symbol_lookup_on_click(value: boolean)
        
        /** If `true`, the [signal symbol_hovered] signal is emitted when hovering over a word. */
        get symbol_tooltip_on_hover(): boolean
        set symbol_tooltip_on_hover(value: boolean)
        
        /** If `true`, lines can be folded. Otherwise, line folding methods like [method fold_line] will not work and [method can_fold_line] will always return `false`. See [member gutters_draw_fold_gutter]. */
        get line_folding(): boolean
        set line_folding(value: boolean)
        
        /** Draws vertical lines at the provided columns. The first entry is considered a main hard guideline and is drawn more prominently. */
        get line_length_guidelines(): PackedInt32Array
        set line_length_guidelines(value: PackedInt32Array | int32[])
        
        /** If `true`, breakpoints are drawn in the gutter. This gutter is shared with bookmarks and executing lines. Clicking the gutter will toggle the breakpoint for the line, see [method set_line_as_breakpoint]. */
        get gutters_draw_breakpoints_gutter(): boolean
        set gutters_draw_breakpoints_gutter(value: boolean)
        
        /** If `true`, bookmarks are drawn in the gutter. This gutter is shared with breakpoints and executing lines. See [method set_line_as_bookmarked]. */
        get gutters_draw_bookmarks(): boolean
        set gutters_draw_bookmarks(value: boolean)
        
        /** If `true`, executing lines are marked in the gutter. This gutter is shared with breakpoints and bookmarks. See [method set_line_as_executing]. */
        get gutters_draw_executing_lines(): boolean
        set gutters_draw_executing_lines(value: boolean)
        
        /** If `true`, the line number gutter is drawn. Line numbers start at `1` and are incremented for each line of text. Clicking and dragging in the line number gutter will select entire lines of text. */
        get gutters_draw_line_numbers(): boolean
        set gutters_draw_line_numbers(value: boolean)
        
        /** If `true`, line numbers drawn in the gutter are zero padded based on the total line count. Requires [member gutters_draw_line_numbers] to be set to `true`. */
        get gutters_zero_pad_line_numbers(): boolean
        set gutters_zero_pad_line_numbers(value: boolean)
        
        /** If `true`, the fold gutter is drawn. In this gutter, the [theme_item can_fold_code_region] icon is drawn for each foldable line (see [method can_fold_line]) and the [theme_item folded_code_region] icon is drawn for each folded line (see [method is_line_folded]). These icons can be clicked to toggle the fold state, see [method toggle_foldable_line]. [member line_folding] must be `true` to show icons. */
        get gutters_draw_fold_gutter(): boolean
        set gutters_draw_fold_gutter(value: boolean)
        
        /** Sets the string delimiters. All existing string delimiters will be removed. */
        get delimiter_strings(): PackedStringArray
        set delimiter_strings(value: PackedStringArray | string[])
        
        /** Sets the comment delimiters. All existing comment delimiters will be removed. */
        get delimiter_comments(): PackedStringArray
        set delimiter_comments(value: PackedStringArray | string[])
        
        /** If `true`, the [member ProjectSettings.input/ui_text_completion_query] action requests code completion. To handle it, see [method _request_code_completion] or [signal code_completion_requested]. */
        get code_completion_enabled(): boolean
        set code_completion_enabled(value: boolean)
        
        /** Sets prefixes that will trigger code completion. */
        get code_completion_prefixes(): PackedStringArray
        set code_completion_prefixes(value: PackedStringArray | string[])
        
        /** Size of the tabulation indent (one [kbd]Tab[/kbd] press) in characters. If [member indent_use_spaces] is enabled the number of spaces to use. */
        get indent_size(): int64
        set indent_size(value: int64)
        
        /** Use spaces instead of tabs for indentation. */
        get indent_use_spaces(): boolean
        set indent_use_spaces(value: boolean)
        
        /** If `true`, an extra indent is automatically inserted when a new line is added and a prefix in [member indent_automatic_prefixes] is found. If a brace pair opening key is found, the matching closing brace will be moved to another new line (see [member auto_brace_completion_pairs]). */
        get indent_automatic(): boolean
        set indent_automatic(value: boolean)
        
        /** Prefixes to trigger an automatic indent. Used when [member indent_automatic] is set to `true`. */
        get indent_automatic_prefixes(): PackedStringArray
        set indent_automatic_prefixes(value: PackedStringArray | string[])
        
        /** If `true`, uses [member auto_brace_completion_pairs] to automatically insert the closing brace when the opening brace is inserted by typing or autocompletion. Also automatically removes the closing brace when using backspace on the opening brace. */
        get auto_brace_completion_enabled(): boolean
        set auto_brace_completion_enabled(value: boolean)
        
        /** If `true`, highlights brace pairs when the caret is on either one, using [member auto_brace_completion_pairs]. If matching, the pairs will be underlined. If a brace is unmatched, it is colored with [theme_item brace_mismatch_color]. */
        get auto_brace_completion_highlight_matching(): boolean
        set auto_brace_completion_highlight_matching(value: boolean)
        
        /** Sets the brace pairs to be autocompleted. For each entry in the dictionary, the key is the opening brace and the value is the closing brace that matches it. A brace is a [String] made of symbols. See [member auto_brace_completion_enabled] and [member auto_brace_completion_highlight_matching]. */
        get auto_brace_completion_pairs(): GDictionary
        set auto_brace_completion_pairs(value: GDictionary)
        
        /** Emitted when a breakpoint is added or removed from a line. If the line is removed via backspace, a signal is emitted at the old line. */
        readonly breakpoint_toggled: Signal<(line: int64) => void>
        
        /** Emitted when the user requests code completion. This signal will not be sent if [method _request_code_completion] is overridden or [member code_completion_enabled] is `false`. */
        readonly code_completion_requested: Signal<() => void>
        
        /** Emitted when the user has clicked on a valid symbol. */
        readonly symbol_lookup: Signal<(symbol: string, line: int64, column: int64) => void>
        
        /** Emitted when the user hovers over a symbol. The symbol should be validated and responded to, by calling [method set_symbol_lookup_word_as_valid].  
         *      
         *  **Note:** [member symbol_lookup_on_click] must be `true` for this signal to be emitted.  
         */
        readonly symbol_validate: Signal<(symbol: string) => void>
        
        /** Emitted when the user hovers over a symbol. Unlike [signal Control.mouse_entered], this signal is not emitted immediately, but when the cursor is over the symbol for [member ProjectSettings.gui/timers/tooltip_delay_sec] seconds.  
         *      
         *  **Note:** [member symbol_tooltip_on_hover] must be `true` for this signal to be emitted.  
         */
        readonly symbol_hovered: Signal<(symbol: string, line: int64, column: int64) => void>
        /** @deprecated Internal use. Does not exist at runtime. */
        __godotNameMap: __NameMapCodeEdit;
    }
    /** @deprecated Internal use. Does not exist at runtime. */
    interface __NameMapCodeHighlighter extends __NameMapSyntaxHighlighter {
    }
    /** A syntax highlighter intended for code.  
     *  	  
     *  @link https://docs.godotengine.org/en/4.5/classes/class_codehighlighter.html  
     */
    class CodeHighlighter extends SyntaxHighlighter {
        constructor(identifier?: any)
        /** Sets the color for a keyword.  
         *  The keyword cannot contain any symbols except '_'.  
         */
        add_keyword_color(keyword: string, color: Color): void
        
        /** Removes the keyword. */
        remove_keyword_color(keyword: string): void
        
        /** Returns `true` if the keyword exists, else `false`. */
        has_keyword_color(keyword: string): boolean
        
        /** Returns the color for a keyword. */
        get_keyword_color(keyword: string): Color
        
        /** Removes all keywords. */
        clear_keyword_colors(): void
        
        /** Sets the color for a member keyword.  
         *  The member keyword cannot contain any symbols except '_'.  
         *  It will not be highlighted if preceded by a '.'.  
         */
        add_member_keyword_color(member_keyword: string, color: Color): void
        
        /** Removes the member keyword. */
        remove_member_keyword_color(member_keyword: string): void
        
        /** Returns `true` if the member keyword exists, else `false`. */
        has_member_keyword_color(member_keyword: string): boolean
        
        /** Returns the color for a member keyword. */
        get_member_keyword_color(member_keyword: string): Color
        
        /** Removes all member keywords. */
        clear_member_keyword_colors(): void
        
        /** Adds a color region (such as for comments or strings) from [param start_key] to [param end_key]. Both keys should be symbols, and [param start_key] must not be shared with other delimiters.  
         *  If [param line_only] is `true` or [param end_key] is an empty [String], the region does not carry over to the next line.  
         */
        add_color_region(start_key: string, end_key: string, color: Color, line_only?: boolean /* = false */): void
        
        /** Removes the color region that uses that start key. */
        remove_color_region(start_key: string): void
        
        /** Returns `true` if the start key exists, else `false`. */
        has_color_region(start_key: string): boolean
        
        /** Removes all color regions. */
        clear_color_regions(): void
        
        /** Sets the color for numbers. */
        get number_color(): Color
        set number_color(value: Color)
        
        /** Sets the color for symbols. */
        get symbol_color(): Color
        set symbol_color(value: Color)
        
        /** Sets color for functions. A function is a non-keyword string followed by a '('. */
        get function_color(): Color
        set function_color(value: Color)
        
        /** Sets color for member variables. A member variable is non-keyword, non-function string proceeded with a '.'. */
        get member_variable_color(): Color
        set member_variable_color(value: Color)
        
        /** Sets the keyword colors. All existing keywords will be removed. The [Dictionary] key is the keyword. The value is the keyword color. */
        get keyword_colors(): GDictionary
        set keyword_colors(value: GDictionary)
        
        /** Sets the member keyword colors. All existing member keyword will be removed. The [Dictionary] key is the member keyword. The value is the member keyword color. */
        get member_keyword_colors(): GDictionary
        set member_keyword_colors(value: GDictionary)
        
        /** Sets the color regions. All existing regions will be removed. The [Dictionary] key is the region start and end key, separated by a space. The value is the region color. */
        get color_regions(): GDictionary
        set color_regions(value: GDictionary)
        /** @deprecated Internal use. Does not exist at runtime. */
        __godotNameMap: __NameMapCodeHighlighter;
    }
    namespace CollisionObject2D {
        enum DisableMode {
            /** When [member Node.process_mode] is set to [constant Node.PROCESS_MODE_DISABLED], remove from the physics simulation to stop all physics interactions with this [CollisionObject2D].  
             *  Automatically re-added to the physics simulation when the [Node] is processed again.  
             */
            DISABLE_MODE_REMOVE = 0,
            
            /** When [member Node.process_mode] is set to [constant Node.PROCESS_MODE_DISABLED], make the body static. Doesn't affect [Area2D]. [PhysicsBody2D] can't be affected by forces or other bodies while static.  
             *  Automatically set [PhysicsBody2D] back to its original mode when the [Node] is processed again.  
             */
            DISABLE_MODE_MAKE_STATIC = 1,
            
            /** When [member Node.process_mode] is set to [constant Node.PROCESS_MODE_DISABLED], do not affect the physics simulation. */
            DISABLE_MODE_KEEP_ACTIVE = 2,
        }
    }
    /** @deprecated Internal use. Does not exist at runtime. */
    interface __NameMapCollisionObject2D extends __NameMapNode2D {
    }
    /** Abstract base class for 2D physics objects.  
     *  	  
     *  @link https://docs.godotengine.org/en/4.5/classes/class_collisionobject2d.html  
     */
    class CollisionObject2D<Map extends NodePathMap = any> extends Node2D<Map> {
        constructor(identifier?: any)
        /** Accepts unhandled [InputEvent]s. [param shape_idx] is the child index of the clicked [Shape2D]. Connect to [signal input_event] to easily pick up these events.  
         *      
         *  **Note:** [method _input_event] requires [member input_pickable] to be `true` and at least one [member collision_layer] bit to be set.  
         */
        /* gdvirtual */ _input_event(viewport: Viewport, event: InputEvent, shape_idx: int64): void
        
        /** Called when the mouse pointer enters any of this object's shapes. Requires [member input_pickable] to be `true` and at least one [member collision_layer] bit to be set. Note that moving between different shapes within a single [CollisionObject2D] won't cause this function to be called. */
        /* gdvirtual */ _mouse_enter(): void
        
        /** Called when the mouse pointer exits all this object's shapes. Requires [member input_pickable] to be `true` and at least one [member collision_layer] bit to be set. Note that moving between different shapes within a single [CollisionObject2D] won't cause this function to be called. */
        /* gdvirtual */ _mouse_exit(): void
        
        /** Called when the mouse pointer enters any of this object's shapes or moves from one shape to another. [param shape_idx] is the child index of the newly entered [Shape2D]. Requires [member input_pickable] to be `true` and at least one [member collision_layer] bit to be called. */
        /* gdvirtual */ _mouse_shape_enter(shape_idx: int64): void
        
        /** Called when the mouse pointer exits any of this object's shapes. [param shape_idx] is the child index of the exited [Shape2D]. Requires [member input_pickable] to be `true` and at least one [member collision_layer] bit to be called. */
        /* gdvirtual */ _mouse_shape_exit(shape_idx: int64): void
        
        /** Returns the object's [RID]. */
        get_rid(): RID
        
        /** Based on [param value], enables or disables the specified layer in the [member collision_layer], given a [param layer_number] between 1 and 32. */
        set_collision_layer_value(layer_number: int64, value: boolean): void
        
        /** Returns whether or not the specified layer of the [member collision_layer] is enabled, given a [param layer_number] between 1 and 32. */
        get_collision_layer_value(layer_number: int64): boolean
        
        /** Based on [param value], enables or disables the specified layer in the [member collision_mask], given a [param layer_number] between 1 and 32. */
        set_collision_mask_value(layer_number: int64, value: boolean): void
        
        /** Returns whether or not the specified layer of the [member collision_mask] is enabled, given a [param layer_number] between 1 and 32. */
        get_collision_mask_value(layer_number: int64): boolean
        
        /** Creates a new shape owner for the given object. Returns `owner_id` of the new owner for future reference. */
        create_shape_owner(owner: Object): int64
        
        /** Removes the given shape owner. */
        remove_shape_owner(owner_id: int64): void
        
        /** Returns an [Array] of `owner_id` identifiers. You can use these ids in other methods that take `owner_id` as an argument. */
        get_shape_owners(): PackedInt32Array
        
        /** Sets the [Transform2D] of the given shape owner. */
        shape_owner_set_transform(owner_id: int64, transform: Transform2D): void
        
        /** Returns the shape owner's [Transform2D]. */
        shape_owner_get_transform(owner_id: int64): Transform2D
        
        /** Returns the parent object of the given shape owner. */
        shape_owner_get_owner(owner_id: int64): null | Object
        
        /** If `true`, disables the given shape owner. */
        shape_owner_set_disabled(owner_id: int64, disabled: boolean): void
        
        /** If `true`, the shape owner and its shapes are disabled. */
        is_shape_owner_disabled(owner_id: int64): boolean
        
        /** If [param enable] is `true`, collisions for the shape owner originating from this [CollisionObject2D] will not be reported to collided with [CollisionObject2D]s. */
        shape_owner_set_one_way_collision(owner_id: int64, enable: boolean): void
        
        /** Returns `true` if collisions for the shape owner originating from this [CollisionObject2D] will not be reported to collided with [CollisionObject2D]s. */
        is_shape_owner_one_way_collision_enabled(owner_id: int64): boolean
        
        /** Sets the `one_way_collision_margin` of the shape owner identified by given [param owner_id] to [param margin] pixels. */
        shape_owner_set_one_way_collision_margin(owner_id: int64, margin: float64): void
        
        /** Returns the `one_way_collision_margin` of the shape owner identified by given [param owner_id]. */
        get_shape_owner_one_way_collision_margin(owner_id: int64): float64
        
        /** Adds a [Shape2D] to the shape owner. */
        shape_owner_add_shape(owner_id: int64, shape: Shape2D): void
        
        /** Returns the number of shapes the given shape owner contains. */
        shape_owner_get_shape_count(owner_id: int64): int64
        
        /** Returns the [Shape2D] with the given ID from the given shape owner. */
        shape_owner_get_shape(owner_id: int64, shape_id: int64): null | Shape2D
        
        /** Returns the child index of the [Shape2D] with the given ID from the given shape owner. */
        shape_owner_get_shape_index(owner_id: int64, shape_id: int64): int64
        
        /** Removes a shape from the given shape owner. */
        shape_owner_remove_shape(owner_id: int64, shape_id: int64): void
        
        /** Removes all shapes from the shape owner. */
        shape_owner_clear_shapes(owner_id: int64): void
        
        /** Returns the `owner_id` of the given shape. */
        shape_find_owner(shape_index: int64): int64
        
        /** Defines the behavior in physics when [member Node.process_mode] is set to [constant Node.PROCESS_MODE_DISABLED]. */
        get disable_mode(): int64
        set disable_mode(value: int64)
        
        /** The physics layers this CollisionObject2D is in. Collision objects can exist in one or more of 32 different layers. See also [member collision_mask].  
         *      
         *  **Note:** Object A can detect a contact with object B only if object B is in any of the layers that object A scans. See [url=https://docs.godotengine.org/en/4.5/tutorials/physics/physics_introduction.html#collision-layers-and-masks]Collision layers and masks[/url] in the documentation for more information.  
         */
        get collision_layer(): int64
        set collision_layer(value: int64)
        
        /** The physics layers this CollisionObject2D scans. Collision objects can scan one or more of 32 different layers. See also [member collision_layer].  
         *      
         *  **Note:** Object A can detect a contact with object B only if object B is in any of the layers that object A scans. See [url=https://docs.godotengine.org/en/4.5/tutorials/physics/physics_introduction.html#collision-layers-and-masks]Collision layers and masks[/url] in the documentation for more information.  
         */
        get collision_mask(): int64
        set collision_mask(value: int64)
        
        /** The priority used to solve colliding when occurring penetration. The higher the priority is, the lower the penetration into the object will be. This can for example be used to prevent the player from breaking through the boundaries of a level. */
        get collision_priority(): float64
        set collision_priority(value: float64)
        
        /** If `true`, this object is pickable. A pickable object can detect the mouse pointer entering/leaving, and if the mouse is inside it, report input events. Requires at least one [member collision_layer] bit to be set. */
        get input_pickable(): boolean
        set input_pickable(value: boolean)
        
        /** Emitted when an input event occurs. Requires [member input_pickable] to be `true` and at least one [member collision_layer] bit to be set. See [method _input_event] for details. */
        readonly input_event: Signal<(viewport: Node, event: InputEvent, shape_idx: int64) => void>
        
        /** Emitted when the mouse pointer enters any of this object's shapes. Requires [member input_pickable] to be `true` and at least one [member collision_layer] bit to be set. Note that moving between different shapes within a single [CollisionObject2D] won't cause this signal to be emitted.  
         *      
         *  **Note:** Due to the lack of continuous collision detection, this signal may not be emitted in the expected order if the mouse moves fast enough and the [CollisionObject2D]'s area is small. This signal may also not be emitted if another [CollisionObject2D] is overlapping the [CollisionObject2D] in question.  
         */
        readonly mouse_entered: Signal<() => void>
        
        /** Emitted when the mouse pointer exits all this object's shapes. Requires [member input_pickable] to be `true` and at least one [member collision_layer] bit to be set. Note that moving between different shapes within a single [CollisionObject2D] won't cause this signal to be emitted.  
         *      
         *  **Note:** Due to the lack of continuous collision detection, this signal may not be emitted in the expected order if the mouse moves fast enough and the [CollisionObject2D]'s area is small. This signal may also not be emitted if another [CollisionObject2D] is overlapping the [CollisionObject2D] in question.  
         */
        readonly mouse_exited: Signal<() => void>
        
        /** Emitted when the mouse pointer enters any of this object's shapes or moves from one shape to another. [param shape_idx] is the child index of the newly entered [Shape2D]. Requires [member input_pickable] to be `true` and at least one [member collision_layer] bit to be set. */
        readonly mouse_shape_entered: Signal<(shape_idx: int64) => void>
        
        /** Emitted when the mouse pointer exits any of this object's shapes. [param shape_idx] is the child index of the exited [Shape2D]. Requires [member input_pickable] to be `true` and at least one [member collision_layer] bit to be set. */
        readonly mouse_shape_exited: Signal<(shape_idx: int64) => void>
        /** @deprecated Internal use. Does not exist at runtime. */
        __godotNameMap: __NameMapCollisionObject2D;
    }
    namespace CollisionObject3D {
        enum DisableMode {
            /** When [member Node.process_mode] is set to [constant Node.PROCESS_MODE_DISABLED], remove from the physics simulation to stop all physics interactions with this [CollisionObject3D].  
             *  Automatically re-added to the physics simulation when the [Node] is processed again.  
             */
            DISABLE_MODE_REMOVE = 0,
            
            /** When [member Node.process_mode] is set to [constant Node.PROCESS_MODE_DISABLED], make the body static. Doesn't affect [Area3D]. [PhysicsBody3D] can't be affected by forces or other bodies while static.  
             *  Automatically set [PhysicsBody3D] back to its original mode when the [Node] is processed again.  
             */
            DISABLE_MODE_MAKE_STATIC = 1,
            
            /** When [member Node.process_mode] is set to [constant Node.PROCESS_MODE_DISABLED], do not affect the physics simulation. */
            DISABLE_MODE_KEEP_ACTIVE = 2,
        }
    }
    /** @deprecated Internal use. Does not exist at runtime. */
    interface __NameMapCollisionObject3D extends __NameMapNode3D {
    }
    /** Abstract base class for 3D physics objects.  
     *  	  
     *  @link https://docs.godotengine.org/en/4.5/classes/class_collisionobject3d.html  
     */
    class CollisionObject3D<Map extends NodePathMap = any> extends Node3D<Map> {
        constructor(identifier?: any)
        /** Receives unhandled [InputEvent]s. [param event_position] is the location in world space of the mouse pointer on the surface of the shape with index [param shape_idx] and [param normal] is the normal vector of the surface at that point. Connect to the [signal input_event] signal to easily pick up these events.  
         *      
         *  **Note:** [method _input_event] requires [member input_ray_pickable] to be `true` and at least one [member collision_layer] bit to be set.  
         */
        /* gdvirtual */ _input_event(camera: Camera3D, event: InputEvent, event_position: Vector3, normal: Vector3, shape_idx: int64): void
        
        /** Called when the mouse pointer enters any of this object's shapes. Requires [member input_ray_pickable] to be `true` and at least one [member collision_layer] bit to be set. Note that moving between different shapes within a single [CollisionObject3D] won't cause this function to be called. */
        /* gdvirtual */ _mouse_enter(): void
        
        /** Called when the mouse pointer exits all this object's shapes. Requires [member input_ray_pickable] to be `true` and at least one [member collision_layer] bit to be set. Note that moving between different shapes within a single [CollisionObject3D] won't cause this function to be called. */
        /* gdvirtual */ _mouse_exit(): void
        
        /** Based on [param value], enables or disables the specified layer in the [member collision_layer], given a [param layer_number] between 1 and 32. */
        set_collision_layer_value(layer_number: int64, value: boolean): void
        
        /** Returns whether or not the specified layer of the [member collision_layer] is enabled, given a [param layer_number] between 1 and 32. */
        get_collision_layer_value(layer_number: int64): boolean
        
        /** Based on [param value], enables or disables the specified layer in the [member collision_mask], given a [param layer_number] between 1 and 32. */
        set_collision_mask_value(layer_number: int64, value: boolean): void
        
        /** Returns whether or not the specified layer of the [member collision_mask] is enabled, given a [param layer_number] between 1 and 32. */
        get_collision_mask_value(layer_number: int64): boolean
        
        /** Returns the object's [RID]. */
        get_rid(): RID
        
        /** Creates a new shape owner for the given object. Returns `owner_id` of the new owner for future reference. */
        create_shape_owner(owner: Object): int64
        
        /** Removes the given shape owner. */
        remove_shape_owner(owner_id: int64): void
        
        /** Returns an [Array] of `owner_id` identifiers. You can use these ids in other methods that take `owner_id` as an argument. */
        get_shape_owners(): PackedInt32Array
        
        /** Sets the [Transform3D] of the given shape owner. */
        shape_owner_set_transform(owner_id: int64, transform: Transform3D): void
        
        /** Returns the shape owner's [Transform3D]. */
        shape_owner_get_transform(owner_id: int64): Transform3D
        
        /** Returns the parent object of the given shape owner. */
        shape_owner_get_owner(owner_id: int64): null | Object
        
        /** If `true`, disables the given shape owner. */
        shape_owner_set_disabled(owner_id: int64, disabled: boolean): void
        
        /** If `true`, the shape owner and its shapes are disabled. */
        is_shape_owner_disabled(owner_id: int64): boolean
        
        /** Adds a [Shape3D] to the shape owner. */
        shape_owner_add_shape(owner_id: int64, shape: Shape3D): void
        
        /** Returns the number of shapes the given shape owner contains. */
        shape_owner_get_shape_count(owner_id: int64): int64
        
        /** Returns the [Shape3D] with the given ID from the given shape owner. */
        shape_owner_get_shape(owner_id: int64, shape_id: int64): null | Shape3D
        
        /** Returns the child index of the [Shape3D] with the given ID from the given shape owner. */
        shape_owner_get_shape_index(owner_id: int64, shape_id: int64): int64
        
        /** Removes a shape from the given shape owner. */
        shape_owner_remove_shape(owner_id: int64, shape_id: int64): void
        
        /** Removes all shapes from the shape owner. */
        shape_owner_clear_shapes(owner_id: int64): void
        
        /** Returns the `owner_id` of the given shape. */
        shape_find_owner(shape_index: int64): int64
        
        /** Defines the behavior in physics when [member Node.process_mode] is set to [constant Node.PROCESS_MODE_DISABLED]. */
        get disable_mode(): int64
        set disable_mode(value: int64)
        
        /** The physics layers this CollisionObject3D **is in**. Collision objects can exist in one or more of 32 different layers. See also [member collision_mask].  
         *      
         *  **Note:** Object A can detect a contact with object B only if object B is in any of the layers that object A scans. See [url=https://docs.godotengine.org/en/4.5/tutorials/physics/physics_introduction.html#collision-layers-and-masks]Collision layers and masks[/url] in the documentation for more information.  
         */
        get collision_layer(): int64
        set collision_layer(value: int64)
        
        /** The physics layers this CollisionObject3D **scans**. Collision objects can scan one or more of 32 different layers. See also [member collision_layer].  
         *      
         *  **Note:** Object A can detect a contact with object B only if object B is in any of the layers that object A scans. See [url=https://docs.godotengine.org/en/4.5/tutorials/physics/physics_introduction.html#collision-layers-and-masks]Collision layers and masks[/url] in the documentation for more information.  
         */
        get collision_mask(): int64
        set collision_mask(value: int64)
        
        /** The priority used to solve colliding when occurring penetration. The higher the priority is, the lower the penetration into the object will be. This can for example be used to prevent the player from breaking through the boundaries of a level. */
        get collision_priority(): float64
        set collision_priority(value: float64)
        
        /** If `true`, this object is pickable. A pickable object can detect the mouse pointer entering/leaving, and if the mouse is inside it, report input events. Requires at least one [member collision_layer] bit to be set. */
        get input_ray_pickable(): boolean
        set input_ray_pickable(value: boolean)
        
        /** If `true`, the [CollisionObject3D] will continue to receive input events as the mouse is dragged across its shapes. */
        get input_capture_on_drag(): boolean
        set input_capture_on_drag(value: boolean)
        
        /** Emitted when the object receives an unhandled [InputEvent]. [param event_position] is the location in world space of the mouse pointer on the surface of the shape with index [param shape_idx] and [param normal] is the normal vector of the surface at that point. */
        readonly input_event: Signal<(camera: Node, event: InputEvent, event_position: Vector3, normal: Vector3, shape_idx: int64) => void>
        
        /** Emitted when the mouse pointer enters any of this object's shapes. Requires [member input_ray_pickable] to be `true` and at least one [member collision_layer] bit to be set.  
         *      
         *  **Note:** Due to the lack of continuous collision detection, this signal may not be emitted in the expected order if the mouse moves fast enough and the [CollisionObject3D]'s area is small. This signal may also not be emitted if another [CollisionObject3D] is overlapping the [CollisionObject3D] in question.  
         */
        readonly mouse_entered: Signal<() => void>
        
        /** Emitted when the mouse pointer exits all this object's shapes. Requires [member input_ray_pickable] to be `true` and at least one [member collision_layer] bit to be set.  
         *      
         *  **Note:** Due to the lack of continuous collision detection, this signal may not be emitted in the expected order if the mouse moves fast enough and the [CollisionObject3D]'s area is small. This signal may also not be emitted if another [CollisionObject3D] is overlapping the [CollisionObject3D] in question.  
         */
        readonly mouse_exited: Signal<() => void>
        /** @deprecated Internal use. Does not exist at runtime. */
        __godotNameMap: __NameMapCollisionObject3D;
    }
    namespace CollisionPolygon2D {
        enum BuildMode {
            /** Collisions will include the polygon and its contained area. In this mode the node has the same effect as several [ConvexPolygonShape2D] nodes, one for each convex shape in the convex decomposition of the polygon (but without the overhead of multiple nodes). */
            BUILD_SOLIDS = 0,
            
            /** Collisions will only include the polygon edges. In this mode the node has the same effect as a single [ConcavePolygonShape2D] made of segments, with the restriction that each segment (after the first one) starts where the previous one ends, and the last one ends where the first one starts (forming a closed but hollow polygon). */
            BUILD_SEGMENTS = 1,
        }
    }
    /** @deprecated Internal use. Does not exist at runtime. */
    interface __NameMapCollisionPolygon2D extends __NameMapNode2D {
    }
    /** A node that provides a polygon shape to a [CollisionObject2D] parent.  
     *  	  
     *  @link https://docs.godotengine.org/en/4.5/classes/class_collisionpolygon2d.html  
     */
    class CollisionPolygon2D<Map extends NodePathMap = any> extends Node2D<Map> {
        constructor(identifier?: any)
        /** Collision build mode. */
        get build_mode(): int64
        set build_mode(value: int64)
        
        /** The polygon's list of vertices. Each point will be connected to the next, and the final point will be connected to the first.  
         *      
         *  **Note:** The returned vertices are in the local coordinate space of the given [CollisionPolygon2D].  
         */
        get polygon(): PackedVector2Array
        set polygon(value: PackedVector2Array | Vector2[])
        
        /** If `true`, no collisions will be detected. This property should be changed with [method Object.set_deferred]. */
        get disabled(): boolean
        set disabled(value: boolean)
        
        /** If `true`, only edges that face up, relative to [CollisionPolygon2D]'s rotation, will collide with other objects.  
         *      
         *  **Note:** This property has no effect if this [CollisionPolygon2D] is a child of an [Area2D] node.  
         */
        get one_way_collision(): boolean
        set one_way_collision(value: boolean)
        
        /** The margin used for one-way collision (in pixels). Higher values will make the shape thicker, and work better for colliders that enter the polygon at a high velocity. */
        get one_way_collision_margin(): float64
        set one_way_collision_margin(value: float64)
        /** @deprecated Internal use. Does not exist at runtime. */
        __godotNameMap: __NameMapCollisionPolygon2D;
    }
    /** @deprecated Internal use. Does not exist at runtime. */
    interface __NameMapCollisionPolygon3D extends __NameMapNode3D {
    }
    /** A node that provides a thickened polygon shape (a prism) to a [CollisionObject3D] parent.  
     *  	  
     *  @link https://docs.godotengine.org/en/4.5/classes/class_collisionpolygon3d.html  
     */
    class CollisionPolygon3D<Map extends NodePathMap = any> extends Node3D<Map> {
        constructor(identifier?: any)
        _is_editable_3d_polygon(): boolean
        
        /** Length that the resulting collision extends in either direction perpendicular to its 2D polygon. */
        get depth(): float64
        set depth(value: float64)
        
        /** If `true`, no collision will be produced. This property should be changed with [method Object.set_deferred]. */
        get disabled(): boolean
        set disabled(value: boolean)
        
        /** Array of vertices which define the 2D polygon in the local XY plane. */
        get polygon(): PackedVector2Array
        set polygon(value: PackedVector2Array | Vector2[])
        
        /** The collision margin for the generated [Shape3D]. See [member Shape3D.margin] for more details. */
        get margin(): float64
        set margin(value: float64)
        
        /** The collision shape color that is displayed in the editor, or in the running project if **Debug > Visible Collision Shapes** is checked at the top of the editor.  
         *      
         *  **Note:** The default value is [member ProjectSettings.debug/shapes/collision/shape_color]. The `Color(0, 0, 0, 0)` value documented here is a placeholder, and not the actual default debug color.  
         */
        get debug_color(): Color
        set debug_color(value: Color)
        
        /** If `true`, when the shape is displayed, it will show a solid fill color in addition to its wireframe. */
        get debug_fill(): boolean
        set debug_fill(value: boolean)
        /** @deprecated Internal use. Does not exist at runtime. */
        __godotNameMap: __NameMapCollisionPolygon3D;
    }
    /** @deprecated Internal use. Does not exist at runtime. */
    interface __NameMapCollisionShape2D extends __NameMapNode2D {
    }
    /** A node that provides a [Shape2D] to a [CollisionObject2D] parent.  
     *  	  
     *  @link https://docs.godotengine.org/en/4.5/classes/class_collisionshape2d.html  
     */
    class CollisionShape2D<Map extends NodePathMap = any> extends Node2D<Map> {
        constructor(identifier?: any)
        /** The actual shape owned by this collision shape. */
        get shape(): null | Shape2D
        set shape(value: null | Shape2D)
        
        /** A disabled collision shape has no effect in the world. This property should be changed with [method Object.set_deferred]. */
        get disabled(): boolean
        set disabled(value: boolean)
        
        /** Sets whether this collision shape should only detect collision on one side (top or bottom).  
         *      
         *  **Note:** This property has no effect if this [CollisionShape2D] is a child of an [Area2D] node.  
         */
        get one_way_collision(): boolean
        set one_way_collision(value: boolean)
        
        /** The margin used for one-way collision (in pixels). Higher values will make the shape thicker, and work better for colliders that enter the shape at a high velocity. */
        get one_way_collision_margin(): float64
        set one_way_collision_margin(value: float64)
        
        /** The collision shape color that is displayed in the editor, or in the running project if **Debug > Visible Collision Shapes** is checked at the top of the editor.  
         *      
         *  **Note:** The default value is [member ProjectSettings.debug/shapes/collision/shape_color]. The `Color(0, 0, 0, 0)` value documented here is a placeholder, and not the actual default debug color.  
         */
        get debug_color(): Color
        set debug_color(value: Color)
        /** @deprecated Internal use. Does not exist at runtime. */
        __godotNameMap: __NameMapCollisionShape2D;
    }
    /** @deprecated Internal use. Does not exist at runtime. */
    interface __NameMapCollisionShape3D extends __NameMapNode3D {
    }
    /** A node that provides a [Shape3D] to a [CollisionObject3D] parent.  
     *  	  
     *  @link https://docs.godotengine.org/en/4.5/classes/class_collisionshape3d.html  
     */
    class CollisionShape3D<Map extends NodePathMap = any> extends Node3D<Map> {
        constructor(identifier?: any)
        /** This method does nothing. */
        resource_changed(resource: Resource): void
        
        /** Sets the collision shape's shape to the addition of all its convexed [MeshInstance3D] siblings geometry. */
        make_convex_from_siblings(): void
        
        /** The actual shape owned by this collision shape. */
        get shape(): null | Shape3D
        set shape(value: null | Shape3D)
        
        /** A disabled collision shape has no effect in the world. This property should be changed with [method Object.set_deferred]. */
        get disabled(): boolean
        set disabled(value: boolean)
        
        /** The collision shape color that is displayed in the editor, or in the running project if **Debug > Visible Collision Shapes** is checked at the top of the editor.  
         *      
         *  **Note:** The default value is [member ProjectSettings.debug/shapes/collision/shape_color]. The `Color(0, 0, 0, 0)` value documented here is a placeholder, and not the actual default debug color.  
         */
        get debug_color(): Color
        set debug_color(value: Color)
        
        /** If `true`, when the shape is displayed, it will show a solid fill color in addition to its wireframe. */
        get debug_fill(): boolean
        set debug_fill(value: boolean)
        /** @deprecated Internal use. Does not exist at runtime. */
        __godotNameMap: __NameMapCollisionShape3D;
    }
    /** @deprecated Internal use. Does not exist at runtime. */
    interface __NameMapColorPalette extends __NameMapResource {
    }
    /** A resource class for managing a palette of colors, which can be loaded and saved using [ColorPicker].  
     *  	  
     *  @link https://docs.godotengine.org/en/4.5/classes/class_colorpalette.html  
     */
    class ColorPalette extends Resource {
        constructor(identifier?: any)
        /** A [PackedColorArray] containing the colors in the palette. */
        get colors(): PackedColorArray
        set colors(value: PackedColorArray | Color[])
        /** @deprecated Internal use. Does not exist at runtime. */
        __godotNameMap: __NameMapColorPalette;
    }
    namespace ColorPicker {
        enum ColorModeType {
            /** Allows editing the color with Red/Green/Blue sliders in sRGB color space. */
            MODE_RGB = 0,
            
            /** Allows editing the color with Hue/Saturation/Value sliders. */
            MODE_HSV = 1,
            MODE_RAW = 2,
            
            /** Allows editing the color with Red/Green/Blue sliders in linear color space. */
            MODE_LINEAR = 2,
            
            /** Allows editing the color with Hue/Saturation/Lightness sliders.  
             *  OKHSL is a new color space similar to HSL but that better match perception by leveraging the Oklab color space which is designed to be simple to use, while doing a good job at predicting perceived lightness, chroma and hue.  
             *  [url=https://bottosson.github.io/posts/colorpicker/]Okhsv and Okhsl color spaces[/url]  
             */
            MODE_OKHSL = 3,
        }
        enum PickerShapeType {
            /** HSV Color Model rectangle color space. */
            SHAPE_HSV_RECTANGLE = 0,
            
            /** HSV Color Model rectangle color space with a wheel. */
            SHAPE_HSV_WHEEL = 1,
            
            /** HSV Color Model circle color space. Use Saturation as a radius. */
            SHAPE_VHS_CIRCLE = 2,
            
            /** HSL OK Color Model circle color space. */
            SHAPE_OKHSL_CIRCLE = 3,
            
            /** The color space shape and the shape select button are hidden. Can't be selected from the shapes popup. */
            SHAPE_NONE = 4,
            
            /** OKHSL Color Model rectangle with constant lightness. */
            SHAPE_OK_HS_RECTANGLE = 5,
            
            /** OKHSL Color Model rectangle with constant saturation. */
            SHAPE_OK_HL_RECTANGLE = 6,
        }
    }
    /** @deprecated Internal use. Does not exist at runtime. */
    interface __NameMapColorPicker extends __NameMapVBoxContainer {
    }
    /** A widget that provides an interface for selecting or modifying a color.  
     *  	  
     *  @link https://docs.godotengine.org/en/4.5/classes/class_colorpicker.html  
     */
    class ColorPicker<Map extends NodePathMap = any> extends VBoxContainer<Map> {
        constructor(identifier?: any)
        /** Adds the given color to a list of color presets. The presets are displayed in the color picker and the user will be able to select them.  
         *      
         *  **Note:** The presets list is only for  *this*  color picker.  
         */
        add_preset(color: Color): void
        
        /** Removes the given color from the list of color presets of this color picker. */
        erase_preset(color: Color): void
        
        /** Returns the list of colors in the presets of the color picker. */
        get_presets(): PackedColorArray
        
        /** Adds the given color to a list of color recent presets so that it can be picked later. Recent presets are the colors that were picked recently, a new preset is automatically created and added to recent presets when you pick a new color.  
         *      
         *  **Note:** The recent presets list is only for  *this*  color picker.  
         */
        add_recent_preset(color: Color): void
        
        /** Removes the given color from the list of color recent presets of this color picker. */
        erase_recent_preset(color: Color): void
        
        /** Returns the list of colors in the recent presets of the color picker. */
        get_recent_presets(): PackedColorArray
        
        /** The currently selected color. */
        get color(): Color
        set color(value: Color)
        
        /** If `true`, shows an alpha channel slider (opacity). */
        get edit_alpha(): boolean
        set edit_alpha(value: boolean)
        
        /** If `true`, shows an intensity slider. The intensity is applied as follows: multiply the color by `2 ** intensity` in linear RGB space, and then convert it back to sRGB. */
        get edit_intensity(): boolean
        set edit_intensity(value: boolean)
        
        /** The currently selected color mode. */
        get color_mode(): int64
        set color_mode(value: int64)
        
        /** If `true`, the color will apply only after the user releases the mouse button, otherwise it will apply immediately even in mouse motion event (which can cause performance issues). */
        get deferred_mode(): boolean
        set deferred_mode(value: boolean)
        
        /** The shape of the color space view. */
        get picker_shape(): int64
        set picker_shape(value: int64)
        
        /** If `true`, it's possible to add presets under Swatches. If `false`, the button to add presets is disabled. */
        get can_add_swatches(): boolean
        set can_add_swatches(value: boolean)
        
        /** If `true`, the color sampler and color preview are visible. */
        get sampler_visible(): boolean
        set sampler_visible(value: boolean)
        
        /** If `true`, the color mode buttons are visible. */
        get color_modes_visible(): boolean
        set color_modes_visible(value: boolean)
        
        /** If `true`, the color sliders are visible. */
        get sliders_visible(): boolean
        set sliders_visible(value: boolean)
        
        /** If `true`, the hex color code input field is visible. */
        get hex_visible(): boolean
        set hex_visible(value: boolean)
        
        /** If `true`, the Swatches and Recent Colors presets are visible. */
        get presets_visible(): boolean
        set presets_visible(value: boolean)
        
        /** Emitted when the color is changed. */
        readonly color_changed: Signal<(color: Color) => void>
        
        /** Emitted when a preset is added. */
        readonly preset_added: Signal<(color: Color) => void>
        
        /** Emitted when a preset is removed. */
        readonly preset_removed: Signal<(color: Color) => void>
        /** @deprecated Internal use. Does not exist at runtime. */
        __godotNameMap: __NameMapColorPicker;
    }
    /** @deprecated Internal use. Does not exist at runtime. */
    interface __NameMapColorPickerButton extends __NameMapButton {
    }
    /** A button that brings up a [ColorPicker] when pressed.  
     *  	  
     *  @link https://docs.godotengine.org/en/4.5/classes/class_colorpickerbutton.html  
     */
    class ColorPickerButton<Map extends NodePathMap = any> extends Button<Map> {
        constructor(identifier?: any)
        /** Returns the [ColorPicker] that this node toggles.  
         *  **Warning:** This is a required internal node, removing and freeing it may cause a crash. If you wish to hide it or any of its children, use their [member CanvasItem.visible] property.  
         */
        get_picker(): null | ColorPicker
        
        /** Returns the control's [PopupPanel] which allows you to connect to popup signals. This allows you to handle events when the ColorPicker is shown or hidden.  
         *  **Warning:** This is a required internal node, removing and freeing it may cause a crash. If you wish to hide it or any of its children, use their [member Window.visible] property.  
         */
        get_popup(): null | PopupPanel
        _about_to_popup(): void
        
        /** The currently selected color. */
        get color(): Color
        set color(value: Color)
        
        /** If `true`, the alpha channel in the displayed [ColorPicker] will be visible. */
        get edit_alpha(): boolean
        set edit_alpha(value: boolean)
        
        /** If `true`, the intensity slider in the displayed [ColorPicker] will be visible. */
        get edit_intensity(): boolean
        set edit_intensity(value: boolean)
        
        /** Emitted when the color changes. */
        readonly color_changed: Signal<(color: Color) => void>
        
        /** Emitted when the [ColorPicker] is closed. */
        readonly popup_closed: Signal<() => void>
        
        /** Emitted when the [ColorPicker] is created (the button is pressed for the first time). */
        readonly picker_created: Signal<() => void>
        /** @deprecated Internal use. Does not exist at runtime. */
        __godotNameMap: __NameMapColorPickerButton;
    }
    /** @deprecated Internal use. Does not exist at runtime. */
    interface __NameMapColorRect extends __NameMapControl {
    }
    /** A control that displays a solid color rectangle.  
     *  	  
     *  @link https://docs.godotengine.org/en/4.5/classes/class_colorrect.html  
     */
    class ColorRect<Map extends NodePathMap = any> extends Control<Map> {
        constructor(identifier?: any)
        /** The fill color of the rectangle. */
        get color(): Color
        set color(value: Color)
        /** @deprecated Internal use. Does not exist at runtime. */
        __godotNameMap: __NameMapColorRect;
    }
    /** @deprecated Internal use. Does not exist at runtime. */
    interface __NameMapCompositor extends __NameMapResource {
    }
    /** Stores attributes used to customize how a Viewport is rendered.  
     *  	  
     *  @link https://docs.godotengine.org/en/4.5/classes/class_compositor.html  
     */
    class Compositor extends Resource {
        constructor(identifier?: any)
        /** The custom [CompositorEffect]s that are applied during rendering of viewports using this compositor. */
        get compositor_effects(): GArray<CompositorEffect>
        set compositor_effects(value: GArray<CompositorEffect>)
        /** @deprecated Internal use. Does not exist at runtime. */
        __godotNameMap: __NameMapCompositor;
    }
    namespace CompositorEffect {
        enum EffectCallbackType {
            /** The callback is called before our opaque rendering pass, but after depth prepass (if applicable). */
            EFFECT_CALLBACK_TYPE_PRE_OPAQUE = 0,
            
            /** The callback is called after our opaque rendering pass, but before our sky is rendered. */
            EFFECT_CALLBACK_TYPE_POST_OPAQUE = 1,
            
            /** The callback is called after our sky is rendered, but before our back buffers are created (and if enabled, before subsurface scattering and/or screen space reflections). */
            EFFECT_CALLBACK_TYPE_POST_SKY = 2,
            
            /** The callback is called before our transparent rendering pass, but after our sky is rendered and we've created our back buffers. */
            EFFECT_CALLBACK_TYPE_PRE_TRANSPARENT = 3,
            
            /** The callback is called after our transparent rendering pass, but before any built-in post-processing effects and output to our render target. */
            EFFECT_CALLBACK_TYPE_POST_TRANSPARENT = 4,
            
            /** Represents the size of the [enum EffectCallbackType] enum. */
            EFFECT_CALLBACK_TYPE_MAX = 5,
        }
    }
    /** @deprecated Internal use. Does not exist at runtime. */
    interface __NameMapCompositorEffect extends __NameMapResource {
    }
    /** This resource allows for creating a custom rendering effect.  
     *  	  
     *  @link https://docs.godotengine.org/en/4.5/classes/class_compositoreffect.html  
     */
    class CompositorEffect extends Resource {
        constructor(identifier?: any)
        /** Implement this function with your custom rendering code. [param effect_callback_type] should always match the effect callback type you've specified in [member effect_callback_type]. [param render_data] provides access to the rendering state, it is only valid during rendering and should not be stored. */
        /* gdvirtual */ _render_callback(effect_callback_type: int64, render_data: RenderData): void
        
        /** If `true` this rendering effect is applied to any viewport it is added to. */
        get enabled(): boolean
        set enabled(value: boolean)
        
        /** The type of effect that is implemented, determines at what stage of rendering the callback is called. */
        get effect_callback_type(): int64
        set effect_callback_type(value: int64)
        
        /** If `true` and MSAA is enabled, this will trigger a color buffer resolve before the effect is run.  
         *      
         *  **Note:** In [method _render_callback], to access the resolved buffer use:  
         *    
         */
        get access_resolved_color(): boolean
        set access_resolved_color(value: boolean)
        
        /** If `true` and MSAA is enabled, this will trigger a depth buffer resolve before the effect is run.  
         *      
         *  **Note:** In [method _render_callback], to access the resolved buffer use:  
         *    
         */
        get access_resolved_depth(): boolean
        set access_resolved_depth(value: boolean)
        
        /** If `true` this triggers motion vectors being calculated during the opaque render state.  
         *      
         *  **Note:** In [method _render_callback], to access the motion vector buffer use:  
         *    
         */
        get needs_motion_vectors(): boolean
        set needs_motion_vectors(value: boolean)
        
        /** If `true` this triggers normal and roughness data to be output during our depth pre-pass, only applicable for the Forward+ renderer.  
         *      
         *  **Note:** In [method _render_callback], to access the roughness buffer use:  
         *    
         *  The raw normal and roughness buffer is stored in an optimized format, different than the one available in Spatial shaders. When sampling the buffer, a conversion function must be applied. Use this function, copied from [url=https://github.com/godotengine/godot/blob/da5f39889f155658cef7f7ec3cc1abb94e17d815/servers/rendering/renderer_rd/shaders/forward_clustered/scene_forward_clustered_inc.glsl#L334-L341]here[/url]:  
         *    
         */
        get needs_normal_roughness(): boolean
        set needs_normal_roughness(value: boolean)
        
        /** If `true` this triggers specular data being rendered to a separate buffer and combined after effects have been applied, only applicable for the Forward+ renderer. */
        get needs_separate_specular(): boolean
        set needs_separate_specular(value: boolean)
        /** @deprecated Internal use. Does not exist at runtime. */
        __godotNameMap: __NameMapCompositorEffect;
    }
    /** @deprecated Internal use. Does not exist at runtime. */
    interface __NameMapCompressedCubemap extends __NameMapCompressedTextureLayered {
    }
    /** An optionally compressed [Cubemap].  
     *  	  
     *  @link https://docs.godotengine.org/en/4.5/classes/class_compressedcubemap.html  
     */
    class CompressedCubemap extends CompressedTextureLayered {
        constructor(identifier?: any)
        /** @deprecated Internal use. Does not exist at runtime. */
        __godotNameMap: __NameMapCompressedCubemap;
    }
    /** @deprecated Internal use. Does not exist at runtime. */
    interface __NameMapCompressedCubemapArray extends __NameMapCompressedTextureLayered {
    }
    /** An optionally compressed [CubemapArray].  
     *  	  
     *  @link https://docs.godotengine.org/en/4.5/classes/class_compressedcubemaparray.html  
     */
    class CompressedCubemapArray extends CompressedTextureLayered {
        constructor(identifier?: any)
        /** @deprecated Internal use. Does not exist at runtime. */
        __godotNameMap: __NameMapCompressedCubemapArray;
    }
    /** @deprecated Internal use. Does not exist at runtime. */
    interface __NameMapCompressedTexture2D extends __NameMapTexture2D {
    }
    /** Texture with 2 dimensions, optionally compressed.  
     *  	  
     *  @link https://docs.godotengine.org/en/4.5/classes/class_compressedtexture2d.html  
     */
    class CompressedTexture2D extends Texture2D {
        constructor(identifier?: any)
        /** The [CompressedTexture2D]'s file path to a `.ctex` file. */
        get load_path(): string
        set load_path(value: string)
        /** @deprecated Internal use. Does not exist at runtime. */
        __godotNameMap: __NameMapCompressedTexture2D;
    }
    /** @deprecated Internal use. Does not exist at runtime. */
    interface __NameMapCompressedTexture2DArray extends __NameMapCompressedTextureLayered {
    }
    /** Array of 2-dimensional textures, optionally compressed.  
     *  	  
     *  @link https://docs.godotengine.org/en/4.5/classes/class_compressedtexture2darray.html  
     */
    class CompressedTexture2DArray extends CompressedTextureLayered {
        constructor(identifier?: any)
        /** @deprecated Internal use. Does not exist at runtime. */
        __godotNameMap: __NameMapCompressedTexture2DArray;
    }
    /** @deprecated Internal use. Does not exist at runtime. */
    interface __NameMapCompressedTexture3D extends __NameMapTexture3D {
    }
    /** Texture with 3 dimensions, optionally compressed.  
     *  	  
     *  @link https://docs.godotengine.org/en/4.5/classes/class_compressedtexture3d.html  
     */
    class CompressedTexture3D extends Texture3D {
        constructor(identifier?: any)
        /** The [CompressedTexture3D]'s file path to a `.ctex3d` file. */
        get load_path(): string
        set load_path(value: string)
        /** @deprecated Internal use. Does not exist at runtime. */
        __godotNameMap: __NameMapCompressedTexture3D;
    }
    /** @deprecated Internal use. Does not exist at runtime. */
    interface __NameMapCompressedTextureLayered extends __NameMapTextureLayered {
    }
    /** Base class for texture arrays that can optionally be compressed.  
     *  	  
     *  @link https://docs.godotengine.org/en/4.5/classes/class_compressedtexturelayered.html  
     */
    class CompressedTextureLayered extends TextureLayered {
        constructor(identifier?: any)
        /** The path the texture should be loaded from. */
        get load_path(): string
        set load_path(value: string)
        /** @deprecated Internal use. Does not exist at runtime. */
        __godotNameMap: __NameMapCompressedTextureLayered;
    }
    /** @deprecated Internal use. Does not exist at runtime. */
    interface __NameMapConcavePolygonShape2D extends __NameMapShape2D {
    }
    /** A 2D polyline shape used for physics collision.  
     *  	  
     *  @link https://docs.godotengine.org/en/4.5/classes/class_concavepolygonshape2d.html  
     */
    class ConcavePolygonShape2D extends Shape2D {
        constructor(identifier?: any)
        /** The array of points that make up the [ConcavePolygonShape2D]'s line segments. The array (of length divisible by two) is naturally divided into pairs (one pair for each segment); each pair consists of the starting point of a segment and the endpoint of a segment. */
        get segments(): PackedVector2Array
        set segments(value: PackedVector2Array | Vector2[])
        /** @deprecated Internal use. Does not exist at runtime. */
        __godotNameMap: __NameMapConcavePolygonShape2D;
    }
    /** @deprecated Internal use. Does not exist at runtime. */
    interface __NameMapConcavePolygonShape3D extends __NameMapShape3D {
    }
    /** A 3D trimesh shape used for physics collision.  
     *  	  
     *  @link https://docs.godotengine.org/en/4.5/classes/class_concavepolygonshape3d.html  
     */
    class ConcavePolygonShape3D extends Shape3D {
        constructor(identifier?: any)
        get data(): PackedVector3Array
        set data(value: PackedVector3Array | Vector3[])
        
        /** If set to `true`, collisions occur on both sides of the concave shape faces. Otherwise they occur only along the face normals. */
        get backface_collision(): boolean
        set backface_collision(value: boolean)
        /** @deprecated Internal use. Does not exist at runtime. */
        __godotNameMap: __NameMapConcavePolygonShape3D;
    }
    namespace ConeTwistJoint3D {
        enum Param {
            /** Swing is rotation from side to side, around the axis perpendicular to the twist axis.  
             *  The swing span defines, how much rotation will not get corrected along the swing axis.  
             *  Could be defined as looseness in the [ConeTwistJoint3D].  
             *  If below 0.05, this behavior is locked.  
             */
            PARAM_SWING_SPAN = 0,
            
            /** Twist is the rotation around the twist axis, this value defined how far the joint can twist.  
             *  Twist is locked if below 0.05.  
             */
            PARAM_TWIST_SPAN = 1,
            
            /** The speed with which the swing or twist will take place.  
             *  The higher, the faster.  
             */
            PARAM_BIAS = 2,
            
            /** The ease with which the joint starts to twist. If it's too low, it takes more force to start twisting the joint. */
            PARAM_SOFTNESS = 3,
            
            /** Defines, how fast the swing- and twist-speed-difference on both sides gets synced. */
            PARAM_RELAXATION = 4,
            
            /** Represents the size of the [enum Param] enum. */
            PARAM_MAX = 5,
        }
    }
    /** @deprecated Internal use. Does not exist at runtime. */
    interface __NameMapConeTwistJoint3D extends __NameMapJoint3D {
    }
    /** A physics joint that connects two 3D physics bodies in a way that simulates a ball-and-socket joint.  
     *  	  
     *  @link https://docs.godotengine.org/en/4.5/classes/class_conetwistjoint3d.html  
     */
    class ConeTwistJoint3D<Map extends NodePathMap = any> extends Joint3D<Map> {
        constructor(identifier?: any)
        /** Sets the value of the specified parameter. */
        set_param(param: ConeTwistJoint3D.Param, value: float64): void
        
        /** Returns the value of the specified parameter. */
        get_param(param: ConeTwistJoint3D.Param): float64
        
        /** Swing is rotation from side to side, around the axis perpendicular to the twist axis.  
         *  The swing span defines, how much rotation will not get corrected along the swing axis.  
         *  Could be defined as looseness in the [ConeTwistJoint3D].  
         *  If below 0.05, this behavior is locked.  
         */
        get swing_span(): float64
        set swing_span(value: float64)
        
        /** Twist is the rotation around the twist axis, this value defined how far the joint can twist.  
         *  Twist is locked if below 0.05.  
         */
        get twist_span(): float64
        set twist_span(value: float64)
        
        /** The speed with which the swing or twist will take place.  
         *  The higher, the faster.  
         */
        get bias(): float64
        set bias(value: float64)
        
        /** The ease with which the joint starts to twist. If it's too low, it takes more force to start twisting the joint. */
        get softness(): float64
        set softness(value: float64)
        
        /** Defines, how fast the swing- and twist-speed-difference on both sides gets synced. */
        get relaxation(): float64
        set relaxation(value: float64)
        /** @deprecated Internal use. Does not exist at runtime. */
        __godotNameMap: __NameMapConeTwistJoint3D;
    }
    /** @deprecated Internal use. Does not exist at runtime. */
    interface __NameMapConfigFile extends __NameMapRefCounted {
    }
    /** Helper class to handle INI-style files.  
     *  	  
     *  @link https://docs.godotengine.org/en/4.5/classes/class_configfile.html  
     */
    class ConfigFile extends RefCounted {
        constructor(identifier?: any)
        /** Assigns a value to the specified key of the specified section. If either the section or the key do not exist, they are created. Passing a `null` value deletes the specified key if it exists, and deletes the section if it ends up empty once the key has been removed. */
        set_value(section: string, key: string, value: any): void
        
        /** Returns the current value for the specified section and key. If either the section or the key do not exist, the method returns the fallback [param default] value. If [param default] is not specified or set to `null`, an error is also raised. */
        get_value(section: string, key: string, default_?: any /* = <any> {} */): any
        
        /** Returns `true` if the specified section exists. */
        has_section(section: string): boolean
        
        /** Returns `true` if the specified section-key pair exists. */
        has_section_key(section: string, key: string): boolean
        
        /** Returns an array of all defined section identifiers. */
        get_sections(): PackedStringArray
        
        /** Returns an array of all defined key identifiers in the specified section. Raises an error and returns an empty array if the section does not exist. */
        get_section_keys(section: string): PackedStringArray
        
        /** Deletes the specified section along with all the key-value pairs inside. Raises an error if the section does not exist. */
        erase_section(section: string): void
        
        /** Deletes the specified key in a section. Raises an error if either the section or the key do not exist. */
        erase_section_key(section: string, key: string): void
        
        /** Loads the config file specified as a parameter. The file's contents are parsed and loaded in the [ConfigFile] object which the method was called on.  
         *  Returns [constant OK] on success, or one of the other [enum Error] values if the operation failed.  
         */
        load(path: string): Error
        
        /** Parses the passed string as the contents of a config file. The string is parsed and loaded in the ConfigFile object which the method was called on.  
         *  Returns [constant OK] on success, or one of the other [enum Error] values if the operation failed.  
         */
        parse(data: string): Error
        
        /** Saves the contents of the [ConfigFile] object to the file specified as a parameter. The output file uses an INI-style structure.  
         *  Returns [constant OK] on success, or one of the other [enum Error] values if the operation failed.  
         */
        save(path: string): Error
        
        /** Obtain the text version of this config file (the same text that would be written to a file). */
        encode_to_text(): string
        
        /** Loads the encrypted config file specified as a parameter, using the provided [param key] to decrypt it. The file's contents are parsed and loaded in the [ConfigFile] object which the method was called on.  
         *  Returns [constant OK] on success, or one of the other [enum Error] values if the operation failed.  
         */
        load_encrypted(path: string, key: PackedByteArray | byte[] | ArrayBuffer): Error
        
        /** Loads the encrypted config file specified as a parameter, using the provided [param password] to decrypt it. The file's contents are parsed and loaded in the [ConfigFile] object which the method was called on.  
         *  Returns [constant OK] on success, or one of the other [enum Error] values if the operation failed.  
         */
        load_encrypted_pass(path: string, password: string): Error
        
        /** Saves the contents of the [ConfigFile] object to the AES-256 encrypted file specified as a parameter, using the provided [param key] to encrypt it. The output file uses an INI-style structure.  
         *  Returns [constant OK] on success, or one of the other [enum Error] values if the operation failed.  
         */
        save_encrypted(path: string, key: PackedByteArray | byte[] | ArrayBuffer): Error
        
        /** Saves the contents of the [ConfigFile] object to the AES-256 encrypted file specified as a parameter, using the provided [param password] to encrypt it. The output file uses an INI-style structure.  
         *  Returns [constant OK] on success, or one of the other [enum Error] values if the operation failed.  
         */
        save_encrypted_pass(path: string, password: string): Error
        
        /** Removes the entire contents of the config. */
        clear(): void
        /** @deprecated Internal use. Does not exist at runtime. */
        __godotNameMap: __NameMapConfigFile;
    }
    /** @deprecated Internal use. Does not exist at runtime. */
    interface __NameMapConfirmationDialog extends __NameMapAcceptDialog {
    }
    /** A dialog used for confirmation of actions.  
     *  	  
     *  @link https://docs.godotengine.org/en/4.5/classes/class_confirmationdialog.html  
     */
    class ConfirmationDialog<Map extends NodePathMap = any> extends AcceptDialog<Map> {
        constructor(identifier?: any)
        /** Returns the cancel button.  
         *  **Warning:** This is a required internal node, removing and freeing it may cause a crash. If you wish to hide it or any of its children, use their [member CanvasItem.visible] property.  
         */
        get_cancel_button(): null | Button
        
        /** The text displayed by the cancel button (see [method get_cancel_button]). */
        get cancel_button_text(): string
        set cancel_button_text(value: string)
        /** @deprecated Internal use. Does not exist at runtime. */
        __godotNameMap: __NameMapConfirmationDialog;
    }
    /** @deprecated Internal use. Does not exist at runtime. */
    interface __NameMapContainer extends __NameMapControl {
    }
    /** Base class for all GUI containers.  
     *  	  
     *  @link https://docs.godotengine.org/en/4.5/classes/class_container.html  
     */
    class Container<Map extends NodePathMap = any> extends Control<Map> {
        /** Notification just before children are going to be sorted, in case there's something to process beforehand. */
        static readonly NOTIFICATION_PRE_SORT_CHILDREN = 50
        
        /** Notification for when sorting the children, it must be obeyed immediately. */
        static readonly NOTIFICATION_SORT_CHILDREN = 51
        constructor(identifier?: any)
        
        /** Implement to return a list of allowed horizontal [enum Control.SizeFlags] for child nodes. This doesn't technically prevent the usages of any other size flags, if your implementation requires that. This only limits the options available to the user in the Inspector dock.  
         *      
         *  **Note:** Having no size flags is equal to having [constant Control.SIZE_SHRINK_BEGIN]. As such, this value is always implicitly allowed.  
         */
        /* gdvirtual */ _get_allowed_size_flags_horizontal(): PackedInt32Array
        
        /** Implement to return a list of allowed vertical [enum Control.SizeFlags] for child nodes. This doesn't technically prevent the usages of any other size flags, if your implementation requires that. This only limits the options available to the user in the Inspector dock.  
         *      
         *  **Note:** Having no size flags is equal to having [constant Control.SIZE_SHRINK_BEGIN]. As such, this value is always implicitly allowed.  
         */
        /* gdvirtual */ _get_allowed_size_flags_vertical(): PackedInt32Array
        
        /** Queue resort of the contained children. This is called automatically anyway, but can be called upon request. */
        queue_sort(): void
        
        /** Fit a child control in a given rect. This is mainly a helper for creating custom container classes. */
        fit_child_in_rect(child: Control, rect: Rect2): void
        
        /** Emitted when children are going to be sorted. */
        readonly pre_sort_children: Signal<() => void>
        
        /** Emitted when sorting the children is needed. */
        readonly sort_children: Signal<() => void>
        /** @deprecated Internal use. Does not exist at runtime. */
        __godotNameMap: __NameMapContainer;
    }
    namespace Control {
        enum FocusMode {
            /** The node cannot grab focus. Use with [member focus_mode]. */
            FOCUS_NONE = 0,
            
            /** The node can only grab focus on mouse clicks. Use with [member focus_mode]. */
            FOCUS_CLICK = 1,
            
            /** The node can grab focus on mouse click, using the arrows and the Tab keys on the keyboard, or using the D-pad buttons on a gamepad. Use with [member focus_mode]. */
            FOCUS_ALL = 2,
            
            /** The node can grab focus only when screen reader is active. Use with [member focus_mode]. */
            FOCUS_ACCESSIBILITY = 3,
        }
        enum FocusBehaviorRecursive {
            /** Inherits the [member focus_behavior_recursive] from the parent control. If there is no parent control, this is the same as [constant FOCUS_BEHAVIOR_ENABLED]. */
            FOCUS_BEHAVIOR_INHERITED = 0,
            
            /** Prevents the control from getting focused. [method get_focus_mode_with_override] will return [constant FOCUS_NONE]. */
            FOCUS_BEHAVIOR_DISABLED = 1,
            
            /** Allows the control to be focused, depending on the [member focus_mode]. This can be used to ignore the parent's [member focus_behavior_recursive]. [method get_focus_mode_with_override] will return the [member focus_mode]. */
            FOCUS_BEHAVIOR_ENABLED = 2,
        }
        enum MouseBehaviorRecursive {
            /** Inherits the [member mouse_behavior_recursive] from the parent control. If there is no parent control, this is the same as [constant MOUSE_BEHAVIOR_ENABLED]. */
            MOUSE_BEHAVIOR_INHERITED = 0,
            
            /** Prevents the control from receiving mouse input. [method get_mouse_filter_with_override] will return [constant MOUSE_FILTER_IGNORE]. */
            MOUSE_BEHAVIOR_DISABLED = 1,
            
            /** Allows the control to be receive mouse input, depending on the [member mouse_filter]. This can be used to ignore the parent's [member mouse_behavior_recursive]. [method get_mouse_filter_with_override] will return the [member mouse_filter]. */
            MOUSE_BEHAVIOR_ENABLED = 2,
        }
        enum CursorShape {
            /** Show the system's arrow mouse cursor when the user hovers the node. Use with [member mouse_default_cursor_shape]. */
            CURSOR_ARROW = 0,
            
            /** Show the system's I-beam mouse cursor when the user hovers the node. The I-beam pointer has a shape similar to "I". It tells the user they can highlight or insert text. */
            CURSOR_IBEAM = 1,
            
            /** Show the system's pointing hand mouse cursor when the user hovers the node. */
            CURSOR_POINTING_HAND = 2,
            
            /** Show the system's cross mouse cursor when the user hovers the node. */
            CURSOR_CROSS = 3,
            
            /** Show the system's wait mouse cursor when the user hovers the node. Often an hourglass. */
            CURSOR_WAIT = 4,
            
            /** Show the system's busy mouse cursor when the user hovers the node. Often an arrow with a small hourglass. */
            CURSOR_BUSY = 5,
            
            /** Show the system's drag mouse cursor, often a closed fist or a cross symbol, when the user hovers the node. It tells the user they're currently dragging an item, like a node in the Scene dock. */
            CURSOR_DRAG = 6,
            
            /** Show the system's drop mouse cursor when the user hovers the node. It can be an open hand. It tells the user they can drop an item they're currently grabbing, like a node in the Scene dock. */
            CURSOR_CAN_DROP = 7,
            
            /** Show the system's forbidden mouse cursor when the user hovers the node. Often a crossed circle. */
            CURSOR_FORBIDDEN = 8,
            
            /** Show the system's vertical resize mouse cursor when the user hovers the node. A double-headed vertical arrow. It tells the user they can resize the window or the panel vertically. */
            CURSOR_VSIZE = 9,
            
            /** Show the system's horizontal resize mouse cursor when the user hovers the node. A double-headed horizontal arrow. It tells the user they can resize the window or the panel horizontally. */
            CURSOR_HSIZE = 10,
            
            /** Show the system's window resize mouse cursor when the user hovers the node. The cursor is a double-headed arrow that goes from the bottom left to the top right. It tells the user they can resize the window or the panel both horizontally and vertically. */
            CURSOR_BDIAGSIZE = 11,
            
            /** Show the system's window resize mouse cursor when the user hovers the node. The cursor is a double-headed arrow that goes from the top left to the bottom right, the opposite of [constant CURSOR_BDIAGSIZE]. It tells the user they can resize the window or the panel both horizontally and vertically. */
            CURSOR_FDIAGSIZE = 12,
            
            /** Show the system's move mouse cursor when the user hovers the node. It shows 2 double-headed arrows at a 90 degree angle. It tells the user they can move a UI element freely. */
            CURSOR_MOVE = 13,
            
            /** Show the system's vertical split mouse cursor when the user hovers the node. On Windows, it's the same as [constant CURSOR_VSIZE]. */
            CURSOR_VSPLIT = 14,
            
            /** Show the system's horizontal split mouse cursor when the user hovers the node. On Windows, it's the same as [constant CURSOR_HSIZE]. */
            CURSOR_HSPLIT = 15,
            
            /** Show the system's help mouse cursor when the user hovers the node, a question mark. */
            CURSOR_HELP = 16,
        }
        enum LayoutPreset {
            /** Snap all 4 anchors to the top-left of the parent control's bounds. Use with [method set_anchors_preset]. */
            PRESET_TOP_LEFT = 0,
            
            /** Snap all 4 anchors to the top-right of the parent control's bounds. Use with [method set_anchors_preset]. */
            PRESET_TOP_RIGHT = 1,
            
            /** Snap all 4 anchors to the bottom-left of the parent control's bounds. Use with [method set_anchors_preset]. */
            PRESET_BOTTOM_LEFT = 2,
            
            /** Snap all 4 anchors to the bottom-right of the parent control's bounds. Use with [method set_anchors_preset]. */
            PRESET_BOTTOM_RIGHT = 3,
            
            /** Snap all 4 anchors to the center of the left edge of the parent control's bounds. Use with [method set_anchors_preset]. */
            PRESET_CENTER_LEFT = 4,
            
            /** Snap all 4 anchors to the center of the top edge of the parent control's bounds. Use with [method set_anchors_preset]. */
            PRESET_CENTER_TOP = 5,
            
            /** Snap all 4 anchors to the center of the right edge of the parent control's bounds. Use with [method set_anchors_preset]. */
            PRESET_CENTER_RIGHT = 6,
            
            /** Snap all 4 anchors to the center of the bottom edge of the parent control's bounds. Use with [method set_anchors_preset]. */
            PRESET_CENTER_BOTTOM = 7,
            
            /** Snap all 4 anchors to the center of the parent control's bounds. Use with [method set_anchors_preset]. */
            PRESET_CENTER = 8,
            
            /** Snap all 4 anchors to the left edge of the parent control. The left offset becomes relative to the left edge and the top offset relative to the top left corner of the node's parent. Use with [method set_anchors_preset]. */
            PRESET_LEFT_WIDE = 9,
            
            /** Snap all 4 anchors to the top edge of the parent control. The left offset becomes relative to the top left corner, the top offset relative to the top edge, and the right offset relative to the top right corner of the node's parent. Use with [method set_anchors_preset]. */
            PRESET_TOP_WIDE = 10,
            
            /** Snap all 4 anchors to the right edge of the parent control. The right offset becomes relative to the right edge and the top offset relative to the top right corner of the node's parent. Use with [method set_anchors_preset]. */
            PRESET_RIGHT_WIDE = 11,
            
            /** Snap all 4 anchors to the bottom edge of the parent control. The left offset becomes relative to the bottom left corner, the bottom offset relative to the bottom edge, and the right offset relative to the bottom right corner of the node's parent. Use with [method set_anchors_preset]. */
            PRESET_BOTTOM_WIDE = 12,
            
            /** Snap all 4 anchors to a vertical line that cuts the parent control in half. Use with [method set_anchors_preset]. */
            PRESET_VCENTER_WIDE = 13,
            
            /** Snap all 4 anchors to a horizontal line that cuts the parent control in half. Use with [method set_anchors_preset]. */
            PRESET_HCENTER_WIDE = 14,
            
            /** Snap all 4 anchors to the respective corners of the parent control. Set all 4 offsets to 0 after you applied this preset and the [Control] will fit its parent control. Use with [method set_anchors_preset]. */
            PRESET_FULL_RECT = 15,
        }
        enum LayoutPresetMode {
            /** The control will be resized to its minimum size. */
            PRESET_MODE_MINSIZE = 0,
            
            /** The control's width will not change. */
            PRESET_MODE_KEEP_WIDTH = 1,
            
            /** The control's height will not change. */
            PRESET_MODE_KEEP_HEIGHT = 2,
            
            /** The control's size will not change. */
            PRESET_MODE_KEEP_SIZE = 3,
        }
        enum SizeFlags {
            /** Tells the parent [Container] to align the node with its start, either the top or the left edge. It is mutually exclusive with [constant SIZE_FILL] and other shrink size flags, but can be used with [constant SIZE_EXPAND] in some containers. Use with [member size_flags_horizontal] and [member size_flags_vertical].  
             *      
             *  **Note:** Setting this flag is equal to not having any size flags.  
             */
            SIZE_SHRINK_BEGIN = 0,
            
            /** Tells the parent [Container] to expand the bounds of this node to fill all the available space without pushing any other node. It is mutually exclusive with shrink size flags. Use with [member size_flags_horizontal] and [member size_flags_vertical]. */
            SIZE_FILL = 1,
            
            /** Tells the parent [Container] to let this node take all the available space on the axis you flag. If multiple neighboring nodes are set to expand, they'll share the space based on their stretch ratio. See [member size_flags_stretch_ratio]. Use with [member size_flags_horizontal] and [member size_flags_vertical]. */
            SIZE_EXPAND = 2,
            
            /** Sets the node's size flags to both fill and expand. See [constant SIZE_FILL] and [constant SIZE_EXPAND] for more information. */
            SIZE_EXPAND_FILL = 3,
            
            /** Tells the parent [Container] to center the node in the available space. It is mutually exclusive with [constant SIZE_FILL] and other shrink size flags, but can be used with [constant SIZE_EXPAND] in some containers. Use with [member size_flags_horizontal] and [member size_flags_vertical]. */
            SIZE_SHRINK_CENTER = 4,
            
            /** Tells the parent [Container] to align the node with its end, either the bottom or the right edge. It is mutually exclusive with [constant SIZE_FILL] and other shrink size flags, but can be used with [constant SIZE_EXPAND] in some containers. Use with [member size_flags_horizontal] and [member size_flags_vertical]. */
            SIZE_SHRINK_END = 8,
        }
        enum MouseFilter {
            /** The control will receive mouse movement input events and mouse button input events if clicked on through [method _gui_input]. The control will also receive the [signal mouse_entered] and [signal mouse_exited] signals. These events are automatically marked as handled, and they will not propagate further to other controls. This also results in blocking signals in other controls. */
            MOUSE_FILTER_STOP = 0,
            
            /** The control will receive mouse movement input events and mouse button input events if clicked on through [method _gui_input]. The control will also receive the [signal mouse_entered] and [signal mouse_exited] signals.  
             *  If this control does not handle the event, the event will propagate up to its parent control if it has one. The event is bubbled up the node hierarchy until it reaches a non-[CanvasItem], a control with [constant MOUSE_FILTER_STOP], or a [CanvasItem] with [member CanvasItem.top_level] enabled. This will allow signals to fire in all controls it reaches. If no control handled it, the event will be passed to [method Node._shortcut_input] for further processing.  
             */
            MOUSE_FILTER_PASS = 1,
            
            /** The control will not receive any mouse movement input events nor mouse button input events through [method _gui_input]. The control will also not receive the [signal mouse_entered] nor [signal mouse_exited] signals. This will not block other controls from receiving these events or firing the signals. Ignored events will not be handled automatically. If a child has [constant MOUSE_FILTER_PASS] and an event was passed to this control, the event will further propagate up to the control's parent.  
             *      
             *  **Note:** If the control has received [signal mouse_entered] but not [signal mouse_exited], changing the [member mouse_filter] to [constant MOUSE_FILTER_IGNORE] will cause [signal mouse_exited] to be emitted.  
             */
            MOUSE_FILTER_IGNORE = 2,
        }
        enum GrowDirection {
            /** The control will grow to the left or top to make up if its minimum size is changed to be greater than its current size on the respective axis. */
            GROW_DIRECTION_BEGIN = 0,
            
            /** The control will grow to the right or bottom to make up if its minimum size is changed to be greater than its current size on the respective axis. */
            GROW_DIRECTION_END = 1,
            
            /** The control will grow in both directions equally to make up if its minimum size is changed to be greater than its current size. */
            GROW_DIRECTION_BOTH = 2,
        }
        enum Anchor {
            /** Snaps one of the 4 anchor's sides to the origin of the node's `Rect`, in the top left. Use it with one of the `anchor_*` member variables, like [member anchor_left]. To change all 4 anchors at once, use [method set_anchors_preset]. */
            ANCHOR_BEGIN = 0,
            
            /** Snaps one of the 4 anchor's sides to the end of the node's `Rect`, in the bottom right. Use it with one of the `anchor_*` member variables, like [member anchor_left]. To change all 4 anchors at once, use [method set_anchors_preset]. */
            ANCHOR_END = 1,
        }
        enum LayoutDirection {
            /** Automatic layout direction, determined from the parent control layout direction. */
            LAYOUT_DIRECTION_INHERITED = 0,
            
            /** Automatic layout direction, determined from the current locale. Right-to-left layout direction is automatically used for languages that require it such as Arabic and Hebrew, but only if a valid translation file is loaded for the given language (unless said language is configured as a fallback in [member ProjectSettings.internationalization/locale/fallback]). For all other languages (or if no valid translation file is found by Godot), left-to-right layout direction is used. If using [TextServerFallback] ([member ProjectSettings.internationalization/rendering/text_driver]), left-to-right layout direction is always used regardless of the language. Right-to-left layout direction can also be forced using [member ProjectSettings.internationalization/rendering/force_right_to_left_layout_direction]. */
            LAYOUT_DIRECTION_APPLICATION_LOCALE = 1,
            
            /** Left-to-right layout direction. */
            LAYOUT_DIRECTION_LTR = 2,
            
            /** Right-to-left layout direction. */
            LAYOUT_DIRECTION_RTL = 3,
            
            /** Automatic layout direction, determined from the system locale. Right-to-left layout direction is automatically used for languages that require it such as Arabic and Hebrew, but only if a valid translation file is loaded for the given language. For all other languages (or if no valid translation file is found by Godot), left-to-right layout direction is used. If using [TextServerFallback] ([member ProjectSettings.internationalization/rendering/text_driver]), left-to-right layout direction is always used regardless of the language. */
            LAYOUT_DIRECTION_SYSTEM_LOCALE = 4,
            
            /** Represents the size of the [enum LayoutDirection] enum. */
            LAYOUT_DIRECTION_MAX = 5,
            LAYOUT_DIRECTION_LOCALE = 1,
        }
        enum TextDirection {
            /** Text writing direction is the same as layout direction. */
            TEXT_DIRECTION_INHERITED = 3,
            
            /** Automatic text writing direction, determined from the current locale and text content. */
            TEXT_DIRECTION_AUTO = 0,
            
            /** Left-to-right text writing direction. */
            TEXT_DIRECTION_LTR = 1,
            
            /** Right-to-left text writing direction. */
            TEXT_DIRECTION_RTL = 2,
        }
    }
    /** @deprecated Internal use. Does not exist at runtime. */
    interface __NameMapControl extends __NameMapCanvasItem {
    }
    /** Base class for all GUI controls. Adapts its position and size based on its parent control.  
     *  	  
     *  @link https://docs.godotengine.org/en/4.5/classes/class_control.html  
     */
    class Control<Map extends NodePathMap = any> extends CanvasItem<Map> {
        /** Sent when the node changes size. Use [member size] to get the new size. */
        static readonly NOTIFICATION_RESIZED = 40
        
        /** Sent when the mouse cursor enters the control's (or any child control's) visible area, that is not occluded behind other Controls or Windows, provided its [member mouse_filter] lets the event reach it and regardless if it's currently focused or not.  
         *      
         *  **Note:** [member CanvasItem.z_index] doesn't affect which Control receives the notification.  
         *  See also [constant NOTIFICATION_MOUSE_ENTER_SELF].  
         */
        static readonly NOTIFICATION_MOUSE_ENTER = 41
        
        /** Sent when the mouse cursor leaves the control's (and all child control's) visible area, that is not occluded behind other Controls or Windows, provided its [member mouse_filter] lets the event reach it and regardless if it's currently focused or not.  
         *      
         *  **Note:** [member CanvasItem.z_index] doesn't affect which Control receives the notification.  
         *  See also [constant NOTIFICATION_MOUSE_EXIT_SELF].  
         */
        static readonly NOTIFICATION_MOUSE_EXIT = 42
        
        /** Sent when the mouse cursor enters the control's visible area, that is not occluded behind other Controls or Windows, provided its [member mouse_filter] lets the event reach it and regardless if it's currently focused or not.  
         *      
         *  **Note:** [member CanvasItem.z_index] doesn't affect which Control receives the notification.  
         *  See also [constant NOTIFICATION_MOUSE_ENTER].  
         */
        static readonly NOTIFICATION_MOUSE_ENTER_SELF = 60
        
        /** Sent when the mouse cursor leaves the control's visible area, that is not occluded behind other Controls or Windows, provided its [member mouse_filter] lets the event reach it and regardless if it's currently focused or not.  
         *      
         *  **Note:** [member CanvasItem.z_index] doesn't affect which Control receives the notification.  
         *  See also [constant NOTIFICATION_MOUSE_EXIT].  
         */
        static readonly NOTIFICATION_MOUSE_EXIT_SELF = 61
        
        /** Sent when the node grabs focus. */
        static readonly NOTIFICATION_FOCUS_ENTER = 43
        
        /** Sent when the node loses focus. */
        static readonly NOTIFICATION_FOCUS_EXIT = 44
        
        /** Sent when the node needs to refresh its theme items. This happens in one of the following cases:  
         *  - The [member theme] property is changed on this node or any of its ancestors.  
         *  - The [member theme_type_variation] property is changed on this node.  
         *  - One of the node's theme property overrides is changed.  
         *  - The node enters the scene tree.  
         *      
         *  **Note:** As an optimization, this notification won't be sent from changes that occur while this node is outside of the scene tree. Instead, all of the theme item updates can be applied at once when the node enters the scene tree.  
         *      
         *  **Note:** This notification is received alongside [constant Node.NOTIFICATION_ENTER_TREE], so if you are instantiating a scene, the child nodes will not be initialized yet. You can use it to setup theming for this node, child nodes created from script, or if you want to access child nodes added in the editor, make sure the node is ready using [method Node.is_node_ready].  
         *    
         */
        static readonly NOTIFICATION_THEME_CHANGED = 45
        
        /** Sent when this node is inside a [ScrollContainer] which has begun being scrolled when dragging the scrollable area  *with a touch event* . This notification is  *not*  sent when scrolling by dragging the scrollbar, scrolling with the mouse wheel or scrolling with keyboard/gamepad events.  
         *      
         *  **Note:** This signal is only emitted on Android or iOS, or on desktop/web platforms when [member ProjectSettings.input_devices/pointing/emulate_touch_from_mouse] is enabled.  
         */
        static readonly NOTIFICATION_SCROLL_BEGIN = 47
        
        /** Sent when this node is inside a [ScrollContainer] which has stopped being scrolled when dragging the scrollable area  *with a touch event* . This notification is  *not*  sent when scrolling by dragging the scrollbar, scrolling with the mouse wheel or scrolling with keyboard/gamepad events.  
         *      
         *  **Note:** This signal is only emitted on Android or iOS, or on desktop/web platforms when [member ProjectSettings.input_devices/pointing/emulate_touch_from_mouse] is enabled.  
         */
        static readonly NOTIFICATION_SCROLL_END = 48
        
        /** Sent when the control layout direction is changed from LTR or RTL or vice versa. This notification is propagated to child Control nodes as result of a change to [member layout_direction]. */
        static readonly NOTIFICATION_LAYOUT_DIRECTION_CHANGED = 49
        constructor(identifier?: any)
        
        /** Virtual method to be implemented by the user. Returns whether the given [param point] is inside this control.  
         *  If not overridden, default behavior is checking if the point is within control's Rect.  
         *      
         *  **Note:** If you want to check if a point is inside the control, you can use `Rect2(Vector2.ZERO, size).has_point(point)`.  
         */
        /* gdvirtual */ _has_point(point: Vector2): boolean
        
        /** User defined BiDi algorithm override function.  
         *  Returns an [Array] of [Vector3i] text ranges and text base directions, in the left-to-right order. Ranges should cover full source [param text] without overlaps. BiDi algorithm will be used on each range separately.  
         */
        /* gdvirtual */ _structured_text_parser(args: GArray, text: string): GArray<Vector3i>
        
        /** Virtual method to be implemented by the user. Returns the minimum size for this control. Alternative to [member custom_minimum_size] for controlling minimum size via code. The actual minimum size will be the max value of these two (in each axis separately).  
         *  If not overridden, defaults to [constant Vector2.ZERO].  
         *      
         *  **Note:** This method will not be called when the script is attached to a [Control] node that already overrides its minimum size (e.g. [Label], [Button], [PanelContainer] etc.). It can only be used with most basic GUI nodes, like [Control], [Container], [Panel] etc.  
         */
        /* gdvirtual */ _get_minimum_size(): Vector2
        
        /** Virtual method to be implemented by the user. Returns the tooltip text for the position [param at_position] in control's local coordinates, which will typically appear when the cursor is resting over this control. See [method get_tooltip].  
         *      
         *  **Note:** If this method returns an empty [String] and [method _make_custom_tooltip] is not overridden, no tooltip is displayed.  
         */
        /* gdvirtual */ _get_tooltip(at_position: Vector2): string
        
        /** Godot calls this method to get data that can be dragged and dropped onto controls that expect drop data. Returns `null` if there is no data to drag. Controls that want to receive drop data should implement [method _can_drop_data] and [method _drop_data]. [param at_position] is local to this control. Drag may be forced with [method force_drag].  
         *  A preview that will follow the mouse that should represent the data can be set with [method set_drag_preview]. A good time to set the preview is in this method.  
         *      
         *  **Note:** If the drag was initiated by a keyboard shortcut or [method accessibility_drag], [param at_position] is set to [constant Vector2.INF], and the currently selected item/text position should be used as the drag position.  
         *    
         */
        /* gdvirtual */ _get_drag_data(at_position: Vector2): any
        
        /** Godot calls this method to test if [param data] from a control's [method _get_drag_data] can be dropped at [param at_position]. [param at_position] is local to this control.  
         *  This method should only be used to test the data. Process the data in [method _drop_data].  
         *      
         *  **Note:** If the drag was initiated by a keyboard shortcut or [method accessibility_drag], [param at_position] is set to [constant Vector2.INF], and the currently selected item/text position should be used as the drop position.  
         *    
         */
        /* gdvirtual */ _can_drop_data(at_position: Vector2, data: any): boolean
        
        /** Godot calls this method to pass you the [param data] from a control's [method _get_drag_data] result. Godot first calls [method _can_drop_data] to test if [param data] is allowed to drop at [param at_position] where [param at_position] is local to this control.  
         *      
         *  **Note:** If the drag was initiated by a keyboard shortcut or [method accessibility_drag], [param at_position] is set to [constant Vector2.INF], and the currently selected item/text position should be used as the drop position.  
         *    
         */
        /* gdvirtual */ _drop_data(at_position: Vector2, data: any): void
        
        /** Virtual method to be implemented by the user. Returns a [Control] node that should be used as a tooltip instead of the default one. [param for_text] is the return value of [method get_tooltip].  
         *  The returned node must be of type [Control] or Control-derived. It can have child nodes of any type. It is freed when the tooltip disappears, so make sure you always provide a new instance (if you want to use a pre-existing node from your scene tree, you can duplicate it and pass the duplicated instance). When `null` or a non-Control node is returned, the default tooltip will be used instead.  
         *  The returned node will be added as child to a [PopupPanel], so you should only provide the contents of that panel. That [PopupPanel] can be themed using [method Theme.set_stylebox] for the type `"TooltipPanel"` (see [member tooltip_text] for an example).  
         *      
         *  **Note:** The tooltip is shrunk to minimal size. If you want to ensure it's fully visible, you might want to set its [member custom_minimum_size] to some non-zero value.  
         *      
         *  **Note:** The node (and any relevant children) should have their [member CanvasItem.visible] set to `true` when returned, otherwise, the viewport that instantiates it will not be able to calculate its minimum size reliably.  
         *      
         *  **Note:** If overridden, this method is called even if [method get_tooltip] returns an empty string. When this happens with the default tooltip, it is not displayed. To copy this behavior, return `null` in this method when [param for_text] is empty.  
         *  **Example:** Use a constructed node as a tooltip:  
         *    
         *  **Example:** Usa a scene instance as a tooltip:  
         *    
         */
        /* gdvirtual */ _make_custom_tooltip(for_text: string): null | Object
        
        /** Return the description of the keyboard shortcuts and other contextual help for this control. */
        /* gdvirtual */ _accessibility_get_contextual_info(): string
        
        /** Override this method to return a human-readable description of the position of the child [param node] in the custom container, added to the [member accessibility_name]. */
        /* gdvirtual */ _get_accessibility_container_name(node: Node): string
        
        /** Virtual method to be implemented by the user. Override this method to handle and accept inputs on UI elements. See also [method accept_event].  
         *  **Example:** Click on the control to print a message:  
         *    
         *  If the [param event] inherits [InputEventMouse], this method will **not** be called when:  
         *  - the control's [member mouse_filter] is set to [constant MOUSE_FILTER_IGNORE];  
         *  - the control is obstructed by another control on top, that doesn't have [member mouse_filter] set to [constant MOUSE_FILTER_IGNORE];  
         *  - the control's parent has [member mouse_filter] set to [constant MOUSE_FILTER_STOP] or has accepted the event;  
         *  - the control's parent has [member clip_contents] enabled and the [param event]'s position is outside the parent's rectangle;  
         *  - the [param event]'s position is outside the control (see [method _has_point]).  
         *      
         *  **Note:** The [param event]'s position is relative to this control's origin.  
         */
        /* gdvirtual */ _gui_input(event: InputEvent): void
        
        /** Marks an input event as handled. Once you accept an input event, it stops propagating, even to nodes listening to [method Node._unhandled_input] or [method Node._unhandled_key_input].  
         *      
         *  **Note:** This does not affect the methods in [Input], only the way events are propagated.  
         */
        accept_event(): void
        
        /** Returns the minimum size for this control. See [member custom_minimum_size]. */
        get_minimum_size(): Vector2
        
        /** Returns combined minimum size from [member custom_minimum_size] and [method get_minimum_size]. */
        get_combined_minimum_size(): Vector2
        
        /** Sets the anchors to a [param preset] from [enum Control.LayoutPreset] enum. This is the code equivalent to using the Layout menu in the 2D editor.  
         *  If [param keep_offsets] is `true`, control's position will also be updated.  
         */
        set_anchors_preset(preset: Control.LayoutPreset, keep_offsets?: boolean /* = false */): void
        
        /** Sets the offsets to a [param preset] from [enum Control.LayoutPreset] enum. This is the code equivalent to using the Layout menu in the 2D editor.  
         *  Use parameter [param resize_mode] with constants from [enum Control.LayoutPresetMode] to better determine the resulting size of the [Control]. Constant size will be ignored if used with presets that change size, e.g. [constant PRESET_LEFT_WIDE].  
         *  Use parameter [param margin] to determine the gap between the [Control] and the edges.  
         */
        set_offsets_preset(preset: Control.LayoutPreset, resize_mode?: Control.LayoutPresetMode /* = 0 */, margin?: int64 /* = 0 */): void
        
        /** Sets both anchor preset and offset preset. See [method set_anchors_preset] and [method set_offsets_preset]. */
        set_anchors_and_offsets_preset(preset: Control.LayoutPreset, resize_mode?: Control.LayoutPresetMode /* = 0 */, margin?: int64 /* = 0 */): void
        _set_anchor(side: Side, anchor: float64): void
        
        /** Sets the anchor for the specified [enum Side] to [param anchor]. A setter method for [member anchor_bottom], [member anchor_left], [member anchor_right] and [member anchor_top].  
         *  If [param keep_offset] is `true`, offsets aren't updated after this operation.  
         *  If [param push_opposite_anchor] is `true` and the opposite anchor overlaps this anchor, the opposite one will have its value overridden. For example, when setting left anchor to 1 and the right anchor has value of 0.5, the right anchor will also get value of 1. If [param push_opposite_anchor] was `false`, the left anchor would get value 0.5.  
         */
        set_anchor(side: Side, anchor: float64, keep_offset?: boolean /* = false */, push_opposite_anchor?: boolean /* = true */): void
        
        /** Returns the anchor for the specified [enum Side]. A getter method for [member anchor_bottom], [member anchor_left], [member anchor_right] and [member anchor_top]. */
        get_anchor(side: Side): float64
        
        /** Sets the offset for the specified [enum Side] to [param offset]. A setter method for [member offset_bottom], [member offset_left], [member offset_right] and [member offset_top]. */
        set_offset(side: Side, offset: float64): void
        
        /** Returns the offset for the specified [enum Side]. A getter method for [member offset_bottom], [member offset_left], [member offset_right] and [member offset_top]. */
        get_offset(offset: Side): float64
        
        /** Works the same as [method set_anchor], but instead of `keep_offset` argument and automatic update of offset, it allows to set the offset yourself (see [method set_offset]). */
        set_anchor_and_offset(side: Side, anchor: float64, offset: float64, push_opposite_anchor?: boolean /* = false */): void
        
        /** Sets [member offset_left] and [member offset_top] at the same time. Equivalent of changing [member position]. */
        set_begin(position: Vector2): void
        
        /** Sets [member offset_right] and [member offset_bottom] at the same time. */
        set_end(position: Vector2): void
        
        /** Sets the [member position] to given [param position].  
         *  If [param keep_offsets] is `true`, control's anchors will be updated instead of offsets.  
         */
        set_position(position: Vector2, keep_offsets?: boolean /* = false */): void
        
        /** Sets the size (see [member size]).  
         *  If [param keep_offsets] is `true`, control's anchors will be updated instead of offsets.  
         */
        set_size(size: Vector2, keep_offsets?: boolean /* = false */): void
        
        /** Resets the size to [method get_combined_minimum_size]. This is equivalent to calling `set_size(Vector2())` (or any size below the minimum). */
        reset_size(): void
        
        /** Sets the [member global_position] to given [param position].  
         *  If [param keep_offsets] is `true`, control's anchors will be updated instead of offsets.  
         */
        set_global_position(position: Vector2, keep_offsets?: boolean /* = false */): void
        
        /** Returns [member offset_left] and [member offset_top]. See also [member position]. */
        get_begin(): Vector2
        
        /** Returns [member offset_right] and [member offset_bottom]. */
        get_end(): Vector2
        
        /** Returns the width/height occupied in the parent control. */
        get_parent_area_size(): Vector2
        
        /** Returns the position of this [Control] in global screen coordinates (i.e. taking window position into account). Mostly useful for editor plugins.  
         *  Equals to [member global_position] if the window is embedded (see [member Viewport.gui_embed_subwindows]).  
         *  **Example:** Show a popup at the mouse position:  
         *    
         */
        get_screen_position(): Vector2
        
        /** Returns the position and size of the control in the coordinate system of the containing node. See [member position], [member scale] and [member size].  
         *      
         *  **Note:** If [member rotation] is not the default rotation, the resulting size is not meaningful.  
         *      
         *  **Note:** Setting [member Viewport.gui_snap_controls_to_pixels] to `true` can lead to rounding inaccuracies between the displayed control and the returned [Rect2].  
         */
        get_rect(): Rect2
        
        /** Returns the position and size of the control relative to the containing canvas. See [member global_position] and [member size].  
         *      
         *  **Note:** If the node itself or any parent [CanvasItem] between the node and the canvas have a non default rotation or skew, the resulting size is likely not meaningful.  
         *      
         *  **Note:** Setting [member Viewport.gui_snap_controls_to_pixels] to `true` can lead to rounding inaccuracies between the displayed control and the returned [Rect2].  
         */
        get_global_rect(): Rect2
        
        /** Returns the [member focus_mode], but takes the [member focus_behavior_recursive] into account. If [member focus_behavior_recursive] is set to [constant FOCUS_BEHAVIOR_DISABLED], or it is set to [constant FOCUS_BEHAVIOR_INHERITED] and its ancestor is set to [constant FOCUS_BEHAVIOR_DISABLED], then this returns [constant FOCUS_NONE]. */
        get_focus_mode_with_override(): Control.FocusMode
        
        /** Returns `true` if this is the current focused control. See [member focus_mode]. */
        has_focus(): boolean
        
        /** Steal the focus from another control and become the focused control (see [member focus_mode]).  
         *      
         *  **Note:** Using this method together with [method Callable.call_deferred] makes it more reliable, especially when called inside [method Node._ready].  
         */
        grab_focus(): void
        
        /** Give up the focus. No other control will be able to receive input. */
        release_focus(): void
        
        /** Finds the previous (above in the tree) [Control] that can receive the focus. */
        find_prev_valid_focus(): null | Control
        
        /** Finds the next (below in the tree) [Control] that can receive the focus. */
        find_next_valid_focus(): null | Control
        
        /** Finds the next [Control] that can receive the focus on the specified [enum Side].  
         *      
         *  **Note:** This is different from [method get_focus_neighbor], which returns the path of a specified focus neighbor.  
         */
        find_valid_focus_neighbor(side: Side): null | Control
        
        /** Prevents `*_theme_*_override` methods from emitting [constant NOTIFICATION_THEME_CHANGED] until [method end_bulk_theme_override] is called. */
        begin_bulk_theme_override(): void
        
        /** Ends a bulk theme override update. See [method begin_bulk_theme_override]. */
        end_bulk_theme_override(): void
        
        /** Creates a local override for a theme icon with the specified [param name]. Local overrides always take precedence when fetching theme items for the control. An override can be removed with [method remove_theme_icon_override].  
         *  See also [method get_theme_icon].  
         */
        add_theme_icon_override(name: StringName, texture: Texture2D): void
        
        /** Creates a local override for a theme [StyleBox] with the specified [param name]. Local overrides always take precedence when fetching theme items for the control. An override can be removed with [method remove_theme_stylebox_override].  
         *  See also [method get_theme_stylebox].  
         *  **Example:** Modify a property in a [StyleBox] by duplicating it:  
         *    
         */
        add_theme_stylebox_override(name: StringName, stylebox: StyleBox): void
        
        /** Creates a local override for a theme [Font] with the specified [param name]. Local overrides always take precedence when fetching theme items for the control. An override can be removed with [method remove_theme_font_override].  
         *  See also [method get_theme_font].  
         */
        add_theme_font_override(name: StringName, font: Font): void
        
        /** Creates a local override for a theme font size with the specified [param name]. Local overrides always take precedence when fetching theme items for the control. An override can be removed with [method remove_theme_font_size_override].  
         *  See also [method get_theme_font_size].  
         */
        add_theme_font_size_override(name: StringName, font_size: int64): void
        
        /** Creates a local override for a theme [Color] with the specified [param name]. Local overrides always take precedence when fetching theme items for the control. An override can be removed with [method remove_theme_color_override].  
         *  See also [method get_theme_color].  
         *  **Example:** Override a [Label]'s color and reset it later:  
         *    
         */
        add_theme_color_override(name: StringName, color: Color): void
        
        /** Creates a local override for a theme constant with the specified [param name]. Local overrides always take precedence when fetching theme items for the control. An override can be removed with [method remove_theme_constant_override].  
         *  See also [method get_theme_constant].  
         */
        add_theme_constant_override(name: StringName, constant: int64): void
        
        /** Removes a local override for a theme icon with the specified [param name] previously added by [method add_theme_icon_override] or via the Inspector dock. */
        remove_theme_icon_override(name: StringName): void
        
        /** Removes a local override for a theme [StyleBox] with the specified [param name] previously added by [method add_theme_stylebox_override] or via the Inspector dock. */
        remove_theme_stylebox_override(name: StringName): void
        
        /** Removes a local override for a theme [Font] with the specified [param name] previously added by [method add_theme_font_override] or via the Inspector dock. */
        remove_theme_font_override(name: StringName): void
        
        /** Removes a local override for a theme font size with the specified [param name] previously added by [method add_theme_font_size_override] or via the Inspector dock. */
        remove_theme_font_size_override(name: StringName): void
        
        /** Removes a local override for a theme [Color] with the specified [param name] previously added by [method add_theme_color_override] or via the Inspector dock. */
        remove_theme_color_override(name: StringName): void
        
        /** Removes a local override for a theme constant with the specified [param name] previously added by [method add_theme_constant_override] or via the Inspector dock. */
        remove_theme_constant_override(name: StringName): void
        
        /** Returns an icon from the first matching [Theme] in the tree if that [Theme] has an icon item with the specified [param name] and [param theme_type].  
         *  See [method get_theme_color] for details.  
         */
        get_theme_icon(name: StringName, theme_type?: StringName /* = '' */): null | Texture2D
        
        /** Returns a [StyleBox] from the first matching [Theme] in the tree if that [Theme] has a stylebox item with the specified [param name] and [param theme_type].  
         *  See [method get_theme_color] for details.  
         */
        get_theme_stylebox(name: StringName, theme_type?: StringName /* = '' */): null | StyleBox
        
        /** Returns a [Font] from the first matching [Theme] in the tree if that [Theme] has a font item with the specified [param name] and [param theme_type].  
         *  See [method get_theme_color] for details.  
         */
        get_theme_font(name: StringName, theme_type?: StringName /* = '' */): null | Font
        
        /** Returns a font size from the first matching [Theme] in the tree if that [Theme] has a font size item with the specified [param name] and [param theme_type].  
         *  See [method get_theme_color] for details.  
         */
        get_theme_font_size(name: StringName, theme_type?: StringName /* = '' */): int64
        
        /** Returns a [Color] from the first matching [Theme] in the tree if that [Theme] has a color item with the specified [param name] and [param theme_type]. If [param theme_type] is omitted the class name of the current control is used as the type, or [member theme_type_variation] if it is defined. If the type is a class name its parent classes are also checked, in order of inheritance. If the type is a variation its base types are checked, in order of dependency, then the control's class name and its parent classes are checked.  
         *  For the current control its local overrides are considered first (see [method add_theme_color_override]), then its assigned [member theme]. After the current control, each parent control and its assigned [member theme] are considered; controls without a [member theme] assigned are skipped. If no matching [Theme] is found in the tree, the custom project [Theme] (see [member ProjectSettings.gui/theme/custom]) and the default [Theme] are used (see [ThemeDB]).  
         *    
         */
        get_theme_color(name: StringName, theme_type?: StringName /* = '' */): Color
        
        /** Returns a constant from the first matching [Theme] in the tree if that [Theme] has a constant item with the specified [param name] and [param theme_type].  
         *  See [method get_theme_color] for details.  
         */
        get_theme_constant(name: StringName, theme_type?: StringName /* = '' */): int64
        
        /** Returns `true` if there is a local override for a theme icon with the specified [param name] in this [Control] node.  
         *  See [method add_theme_icon_override].  
         */
        has_theme_icon_override(name: StringName): boolean
        
        /** Returns `true` if there is a local override for a theme [StyleBox] with the specified [param name] in this [Control] node.  
         *  See [method add_theme_stylebox_override].  
         */
        has_theme_stylebox_override(name: StringName): boolean
        
        /** Returns `true` if there is a local override for a theme [Font] with the specified [param name] in this [Control] node.  
         *  See [method add_theme_font_override].  
         */
        has_theme_font_override(name: StringName): boolean
        
        /** Returns `true` if there is a local override for a theme font size with the specified [param name] in this [Control] node.  
         *  See [method add_theme_font_size_override].  
         */
        has_theme_font_size_override(name: StringName): boolean
        
        /** Returns `true` if there is a local override for a theme [Color] with the specified [param name] in this [Control] node.  
         *  See [method add_theme_color_override].  
         */
        has_theme_color_override(name: StringName): boolean
        
        /** Returns `true` if there is a local override for a theme constant with the specified [param name] in this [Control] node.  
         *  See [method add_theme_constant_override].  
         */
        has_theme_constant_override(name: StringName): boolean
        
        /** Returns `true` if there is a matching [Theme] in the tree that has an icon item with the specified [param name] and [param theme_type].  
         *  See [method get_theme_color] for details.  
         */
        has_theme_icon(name: StringName, theme_type?: StringName /* = '' */): boolean
        
        /** Returns `true` if there is a matching [Theme] in the tree that has a stylebox item with the specified [param name] and [param theme_type].  
         *  See [method get_theme_color] for details.  
         */
        has_theme_stylebox(name: StringName, theme_type?: StringName /* = '' */): boolean
        
        /** Returns `true` if there is a matching [Theme] in the tree that has a font item with the specified [param name] and [param theme_type].  
         *  See [method get_theme_color] for details.  
         */
        has_theme_font(name: StringName, theme_type?: StringName /* = '' */): boolean
        
        /** Returns `true` if there is a matching [Theme] in the tree that has a font size item with the specified [param name] and [param theme_type].  
         *  See [method get_theme_color] for details.  
         */
        has_theme_font_size(name: StringName, theme_type?: StringName /* = '' */): boolean
        
        /** Returns `true` if there is a matching [Theme] in the tree that has a color item with the specified [param name] and [param theme_type].  
         *  See [method get_theme_color] for details.  
         */
        has_theme_color(name: StringName, theme_type?: StringName /* = '' */): boolean
        
        /** Returns `true` if there is a matching [Theme] in the tree that has a constant item with the specified [param name] and [param theme_type].  
         *  See [method get_theme_color] for details.  
         */
        has_theme_constant(name: StringName, theme_type?: StringName /* = '' */): boolean
        
        /** Returns the default base scale value from the first matching [Theme] in the tree if that [Theme] has a valid [member Theme.default_base_scale] value.  
         *  See [method get_theme_color] for details.  
         */
        get_theme_default_base_scale(): float64
        
        /** Returns the default font from the first matching [Theme] in the tree if that [Theme] has a valid [member Theme.default_font] value.  
         *  See [method get_theme_color] for details.  
         */
        get_theme_default_font(): null | Font
        
        /** Returns the default font size value from the first matching [Theme] in the tree if that [Theme] has a valid [member Theme.default_font_size] value.  
         *  See [method get_theme_color] for details.  
         */
        get_theme_default_font_size(): int64
        
        /** Returns the parent control node. */
        get_parent_control(): null | Control
        
        /** Returns the tooltip text for the position [param at_position] in control's local coordinates, which will typically appear when the cursor is resting over this control. By default, it returns [member tooltip_text].  
         *  This method can be overridden to customize its behavior. See [method _get_tooltip].  
         *      
         *  **Note:** If this method returns an empty [String] and [method _make_custom_tooltip] is not overridden, no tooltip is displayed.  
         */
        get_tooltip(at_position?: Vector2 /* = Vector2.ZERO */): string
        
        /** Returns the mouse cursor shape for this control when hovered over [param position] in local coordinates. For most controls, this is the same as [member mouse_default_cursor_shape], but some built-in controls implement more complex logic. */
        get_cursor_shape(position?: Vector2 /* = Vector2.ZERO */): Control.CursorShape
        
        /** Sets the focus neighbor for the specified [enum Side] to the [Control] at [param neighbor] node path. A setter method for [member focus_neighbor_bottom], [member focus_neighbor_left], [member focus_neighbor_right] and [member focus_neighbor_top]. */
        set_focus_neighbor(side: Side, neighbor: NodePath | string): void
        
        /** Returns the focus neighbor for the specified [enum Side]. A getter method for [member focus_neighbor_bottom], [member focus_neighbor_left], [member focus_neighbor_right] and [member focus_neighbor_top].  
         *      
         *  **Note:** To find the next [Control] on the specific [enum Side], even if a neighbor is not assigned, use [method find_valid_focus_neighbor].  
         */
        get_focus_neighbor(side: Side): NodePath
        
        /** Forces drag and bypasses [method _get_drag_data] and [method set_drag_preview] by passing [param data] and [param preview]. Drag will start even if the mouse is neither over nor pressed on this control.  
         *  The methods [method _can_drop_data] and [method _drop_data] must be implemented on controls that want to receive drop data.  
         */
        force_drag(data: any, preview: Control): void
        
        /** Starts drag-and-drop operation without using a mouse. */
        accessibility_drag(): void
        
        /** Ends drag-and-drop operation without using a mouse. */
        accessibility_drop(): void
        
        /** Returns the [member mouse_filter], but takes the [member mouse_behavior_recursive] into account. If [member mouse_behavior_recursive] is set to [constant MOUSE_BEHAVIOR_DISABLED], or it is set to [constant MOUSE_BEHAVIOR_INHERITED] and its ancestor is set to [constant MOUSE_BEHAVIOR_DISABLED], then this returns [constant MOUSE_FILTER_IGNORE]. */
        get_mouse_filter_with_override(): Control.MouseFilter
        
        /** Creates an [InputEventMouseButton] that attempts to click the control. If the event is received, the control gains focus.  
         *    
         */
        grab_click_focus(): void
        
        /** Sets the given callables to be used instead of the control's own drag-and-drop virtual methods. If a callable is empty, its respective virtual method is used as normal.  
         *  The arguments for each callable should be exactly the same as their respective virtual methods, which would be:  
         *  - [param drag_func] corresponds to [method _get_drag_data] and requires a [Vector2];  
         *  - [param can_drop_func] corresponds to [method _can_drop_data] and requires both a [Vector2] and a [Variant];  
         *  - [param drop_func] corresponds to [method _drop_data] and requires both a [Vector2] and a [Variant].  
         */
        set_drag_forwarding(drag_func: Callable, can_drop_func: Callable, drop_func: Callable): void
        
        /** Shows the given control at the mouse pointer. A good time to call this method is in [method _get_drag_data]. The control must not be in the scene tree. You should not free the control, and you should not keep a reference to the control beyond the duration of the drag. It will be deleted automatically after the drag has ended.  
         *    
         */
        set_drag_preview(control: Control): void
        
        /** Returns `true` if a drag operation is successful. Alternative to [method Viewport.gui_is_drag_successful].  
         *  Best used with [constant Node.NOTIFICATION_DRAG_END].  
         */
        is_drag_successful(): boolean
        
        /** Moves the mouse cursor to [param position], relative to [member position] of this [Control].  
         *      
         *  **Note:** [method warp_mouse] is only supported on Windows, macOS and Linux. It has no effect on Android, iOS and Web.  
         */
        warp_mouse(position: Vector2): void
        
        /** Invalidates the size cache in this node and in parent nodes up to top level. Intended to be used with [method get_minimum_size] when the return value is changed. Setting [member custom_minimum_size] directly calls this method automatically. */
        update_minimum_size(): void
        
        /** Returns `true` if the layout is right-to-left. See also [member layout_direction]. */
        is_layout_rtl(): boolean
        
        /** Enables whether rendering of [CanvasItem] based children should be clipped to this control's rectangle. If `true`, parts of a child which would be visibly outside of this control's rectangle will not be rendered and won't receive input. */
        get clip_contents(): boolean
        set clip_contents(value: boolean)
        
        /** The minimum size of the node's bounding rectangle. If you set it to a value greater than `(0, 0)`, the node's bounding rectangle will always have at least this size. Note that [Control] nodes have their internal minimum size returned by [method get_minimum_size]. It depends on the control's contents, like text, textures, or style boxes. The actual minimum size is the maximum value of this property and the internal minimum size (see [method get_combined_minimum_size]). */
        get custom_minimum_size(): Vector2
        set custom_minimum_size(value: Vector2)
        
        /** Controls layout direction and text writing direction. Right-to-left layouts are necessary for certain languages (e.g. Arabic and Hebrew). See also [method is_layout_rtl]. */
        get layout_direction(): int64
        set layout_direction(value: int64)
        get layout_mode(): int64
        set layout_mode(value: int64)
        get anchors_preset(): int64
        set anchors_preset(value: int64)
        
        /** Anchors the left edge of the node to the origin, the center or the end of its parent control. It changes how the left offset updates when the node moves or changes size. You can use one of the [enum Anchor] constants for convenience. */
        get anchor_left(): float64
        set anchor_left(value: float64)
        
        /** Anchors the top edge of the node to the origin, the center or the end of its parent control. It changes how the top offset updates when the node moves or changes size. You can use one of the [enum Anchor] constants for convenience. */
        get anchor_top(): float64
        set anchor_top(value: float64)
        
        /** Anchors the right edge of the node to the origin, the center or the end of its parent control. It changes how the right offset updates when the node moves or changes size. You can use one of the [enum Anchor] constants for convenience. */
        get anchor_right(): float64
        set anchor_right(value: float64)
        
        /** Anchors the bottom edge of the node to the origin, the center, or the end of its parent control. It changes how the bottom offset updates when the node moves or changes size. You can use one of the [enum Anchor] constants for convenience. */
        get anchor_bottom(): float64
        set anchor_bottom(value: float64)
        
        /** Distance between the node's left edge and its parent control, based on [member anchor_left].  
         *  Offsets are often controlled by one or multiple parent [Container] nodes, so you should not modify them manually if your node is a direct child of a [Container]. Offsets update automatically when you move or resize the node.  
         */
        get offset_left(): float64
        set offset_left(value: float64)
        
        /** Distance between the node's top edge and its parent control, based on [member anchor_top].  
         *  Offsets are often controlled by one or multiple parent [Container] nodes, so you should not modify them manually if your node is a direct child of a [Container]. Offsets update automatically when you move or resize the node.  
         */
        get offset_top(): float64
        set offset_top(value: float64)
        
        /** Distance between the node's right edge and its parent control, based on [member anchor_right].  
         *  Offsets are often controlled by one or multiple parent [Container] nodes, so you should not modify them manually if your node is a direct child of a [Container]. Offsets update automatically when you move or resize the node.  
         */
        get offset_right(): float64
        set offset_right(value: float64)
        
        /** Distance between the node's bottom edge and its parent control, based on [member anchor_bottom].  
         *  Offsets are often controlled by one or multiple parent [Container] nodes, so you should not modify them manually if your node is a direct child of a [Container]. Offsets update automatically when you move or resize the node.  
         */
        get offset_bottom(): float64
        set offset_bottom(value: float64)
        
        /** Controls the direction on the horizontal axis in which the control should grow if its horizontal minimum size is changed to be greater than its current size, as the control always has to be at least the minimum size. */
        get grow_horizontal(): int64
        set grow_horizontal(value: int64)
        
        /** Controls the direction on the vertical axis in which the control should grow if its vertical minimum size is changed to be greater than its current size, as the control always has to be at least the minimum size. */
        get grow_vertical(): int64
        set grow_vertical(value: int64)
        
        /** The size of the node's bounding rectangle, in the node's coordinate system. [Container] nodes update this property automatically. */
        get size(): Vector2
        set size(value: Vector2)
        
        /** The node's position, relative to its containing node. It corresponds to the rectangle's top-left corner. The property is not affected by [member pivot_offset]. */
        get position(): Vector2
        set position(value: Vector2)
        
        /** The node's global position, relative to the world (usually to the [CanvasLayer]). */
        get global_position(): Vector2
        set global_position(value: Vector2)
        
        /** The node's rotation around its pivot, in radians. See [member pivot_offset] to change the pivot's position.  
         *      
         *  **Note:** This property is edited in the inspector in degrees. If you want to use degrees in a script, use [member rotation_degrees].  
         */
        get rotation(): float64
        set rotation(value: float64)
        
        /** Helper property to access [member rotation] in degrees instead of radians. */
        get rotation_degrees(): float64
        set rotation_degrees(value: float64)
        
        /** The node's scale, relative to its [member size]. Change this property to scale the node around its [member pivot_offset]. The Control's tooltip will also scale according to this value.  
         *      
         *  **Note:** This property is mainly intended to be used for animation purposes. To support multiple resolutions in your project, use an appropriate viewport stretch mode as described in the [url=https://docs.godotengine.org/en/4.5/tutorials/rendering/multiple_resolutions.html]documentation[/url] instead of scaling Controls individually.  
         *      
         *  **Note:** [member FontFile.oversampling] does  *not*  take [Control] [member scale] into account. This means that scaling up/down will cause bitmap fonts and rasterized (non-MSDF) dynamic fonts to appear blurry or pixelated. To ensure text remains crisp regardless of scale, you can enable MSDF font rendering by enabling [member ProjectSettings.gui/theme/default_font_multichannel_signed_distance_field] (applies to the default project font only), or enabling **Multichannel Signed Distance Field** in the import options of a DynamicFont for custom fonts. On system fonts, [member SystemFont.multichannel_signed_distance_field] can be enabled in the inspector.  
         *      
         *  **Note:** If the Control node is a child of a [Container] node, the scale will be reset to `Vector2(1, 1)` when the scene is instantiated. To set the Control's scale when it's instantiated, wait for one frame using `await get_tree().process_frame` then set its [member scale] property.  
         */
        get scale(): Vector2
        set scale(value: Vector2)
        
        /** By default, the node's pivot is its top-left corner. When you change its [member rotation] or [member scale], it will rotate or scale around this pivot. Set this property to [member size] / 2 to pivot around the Control's center. */
        get pivot_offset(): Vector2
        set pivot_offset(value: Vector2)
        
        /** Tells the parent [Container] nodes how they should resize and place the node on the X axis. Use a combination of the [enum SizeFlags] constants to change the flags. See the constants to learn what each does. */
        get size_flags_horizontal(): int64
        set size_flags_horizontal(value: int64)
        
        /** Tells the parent [Container] nodes how they should resize and place the node on the Y axis. Use a combination of the [enum SizeFlags] constants to change the flags. See the constants to learn what each does. */
        get size_flags_vertical(): int64
        set size_flags_vertical(value: int64)
        
        /** If the node and at least one of its neighbors uses the [constant SIZE_EXPAND] size flag, the parent [Container] will let it take more or less space depending on this property. If this node has a stretch ratio of 2 and its neighbor a ratio of 1, this node will take two thirds of the available space. */
        get size_flags_stretch_ratio(): float64
        set size_flags_stretch_ratio(value: float64)
        
        /** If `true`, automatically converts code line numbers, list indices, [SpinBox] and [ProgressBar] values from the Western Arabic (0..9) to the numeral systems used in current locale.  
         *      
         *  **Note:** Numbers within the text are not automatically converted, it can be done manually, using [method TextServer.format_number].  
         */
        get localize_numeral_system(): boolean
        set localize_numeral_system(value: boolean)
        
        /** Toggles if any text should automatically change to its translated version depending on the current locale. */
        get auto_translate(): boolean
        set auto_translate(value: boolean)
        
        /** The default tooltip text. The tooltip appears when the user's mouse cursor stays idle over this control for a few moments, provided that the [member mouse_filter] property is not [constant MOUSE_FILTER_IGNORE]. The time required for the tooltip to appear can be changed with the [member ProjectSettings.gui/timers/tooltip_delay_sec] setting.  
         *  This string is the default return value of [method get_tooltip]. Override [method _get_tooltip] to generate tooltip text dynamically. Override [method _make_custom_tooltip] to customize the tooltip interface and behavior.  
         *  The tooltip popup will use either a default implementation, or a custom one that you can provide by overriding [method _make_custom_tooltip]. The default tooltip includes a [PopupPanel] and [Label] whose theme properties can be customized using [Theme] methods with the `"TooltipPanel"` and `"TooltipLabel"` respectively. For example:  
         *    
         */
        get tooltip_text(): string
        set tooltip_text(value: string)
        
        /** Defines if tooltip text should automatically change to its translated version depending on the current locale. Uses the same auto translate mode as this control when set to [constant Node.AUTO_TRANSLATE_MODE_INHERIT].  
         *      
         *  **Note:** Tooltips customized using [method _make_custom_tooltip] do not use this auto translate mode automatically.  
         */
        get tooltip_auto_translate_mode(): int64
        set tooltip_auto_translate_mode(value: int64)
        
        /** Tells Godot which node it should give focus to if the user presses the left arrow on the keyboard or left on a gamepad by default. You can change the key by editing the [member ProjectSettings.input/ui_left] input action. The node must be a [Control]. If this property is not set, Godot will give focus to the closest [Control] to the left of this one. */
        get focus_neighbor_left(): NodePath
        set focus_neighbor_left(value: NodePath | string)
        
        /** Tells Godot which node it should give focus to if the user presses the top arrow on the keyboard or top on a gamepad by default. You can change the key by editing the [member ProjectSettings.input/ui_up] input action. The node must be a [Control]. If this property is not set, Godot will give focus to the closest [Control] to the top of this one. */
        get focus_neighbor_top(): NodePath
        set focus_neighbor_top(value: NodePath | string)
        
        /** Tells Godot which node it should give focus to if the user presses the right arrow on the keyboard or right on a gamepad by default. You can change the key by editing the [member ProjectSettings.input/ui_right] input action. The node must be a [Control]. If this property is not set, Godot will give focus to the closest [Control] to the right of this one. */
        get focus_neighbor_right(): NodePath
        set focus_neighbor_right(value: NodePath | string)
        
        /** Tells Godot which node it should give focus to if the user presses the down arrow on the keyboard or down on a gamepad by default. You can change the key by editing the [member ProjectSettings.input/ui_down] input action. The node must be a [Control]. If this property is not set, Godot will give focus to the closest [Control] to the bottom of this one. */
        get focus_neighbor_bottom(): NodePath
        set focus_neighbor_bottom(value: NodePath | string)
        
        /** Tells Godot which node it should give focus to if the user presses [kbd]Tab[/kbd] on a keyboard by default. You can change the key by editing the [member ProjectSettings.input/ui_focus_next] input action.  
         *  If this property is not set, Godot will select a "best guess" based on surrounding nodes in the scene tree.  
         */
        get focus_next(): NodePath
        set focus_next(value: NodePath | string)
        
        /** Tells Godot which node it should give focus to if the user presses [kbd]Shift + Tab[/kbd] on a keyboard by default. You can change the key by editing the [member ProjectSettings.input/ui_focus_prev] input action.  
         *  If this property is not set, Godot will select a "best guess" based on surrounding nodes in the scene tree.  
         */
        get focus_previous(): NodePath
        set focus_previous(value: NodePath | string)
        
        /** Determines which controls can be focused. Only one control can be focused at a time, and the focused control will receive keyboard, gamepad, and mouse events in [method _gui_input]. Use [method get_focus_mode_with_override] to determine if a control can grab focus, since [member focus_behavior_recursive] also affects it. See also [method grab_focus]. */
        get focus_mode(): int64
        set focus_mode(value: int64)
        
        /** Determines which controls can be focused together with [member focus_mode]. See [method get_focus_mode_with_override]. Since the default behavior is [constant FOCUS_BEHAVIOR_INHERITED], this can be used to prevent all children controls from getting focused. */
        get focus_behavior_recursive(): int64
        set focus_behavior_recursive(value: int64)
        
        /** Determines which controls will be able to receive mouse button input events through [method _gui_input] and the [signal mouse_entered], and [signal mouse_exited] signals. Also determines how these events should be propagated. See the constants to learn what each does. Use [method get_mouse_filter_with_override] to determine if a control can receive mouse input, since [member mouse_behavior_recursive] also affects it. */
        get mouse_filter(): int64
        set mouse_filter(value: int64)
        
        /** Determines which controls can receive mouse input together with [member mouse_filter]. See [method get_mouse_filter_with_override]. Since the default behavior is [constant MOUSE_BEHAVIOR_INHERITED], this can be used to prevent all children controls from receiving mouse input. */
        get mouse_behavior_recursive(): int64
        set mouse_behavior_recursive(value: int64)
        
        /** When enabled, scroll wheel events processed by [method _gui_input] will be passed to the parent control even if [member mouse_filter] is set to [constant MOUSE_FILTER_STOP].  
         *  You should disable it on the root of your UI if you do not want scroll events to go to the [method Node._unhandled_input] processing.  
         *      
         *  **Note:** Because this property defaults to `true`, this allows nested scrollable containers to work out of the box.  
         */
        get mouse_force_pass_scroll_events(): boolean
        set mouse_force_pass_scroll_events(value: boolean)
        
        /** The default cursor shape for this control. Useful for Godot plugins and applications or games that use the system's mouse cursors.  
         *      
         *  **Note:** On Linux, shapes may vary depending on the cursor theme of the system.  
         */
        get mouse_default_cursor_shape(): int64
        set mouse_default_cursor_shape(value: int64)
        
        /** The [Node] which must be a parent of the focused [Control] for the shortcut to be activated. If `null`, the shortcut can be activated when any control is focused (a global shortcut). This allows shortcuts to be accepted only when the user has a certain area of the GUI focused. */
        get shortcut_context(): null | Object
        set shortcut_context(value: null | Object)
        
        /** The human-readable node name that is reported to assistive apps. */
        get accessibility_name(): string
        set accessibility_name(value: string)
        
        /** The human-readable node description that is reported to assistive apps. */
        get accessibility_description(): string
        set accessibility_description(value: string)
        
        /** The mode with which a live region updates. A live region is a [Node] that is updated as a result of an external event when the user's focus may be elsewhere. */
        get accessibility_live(): int64
        set accessibility_live(value: int64)
        
        /** The paths to the nodes which are controlled by this node. */
        get accessibility_controls_nodes(): GArray<NodePath>
        set accessibility_controls_nodes(value: GArray<NodePath>)
        
        /** The paths to the nodes which are describing this node. */
        get accessibility_described_by_nodes(): GArray<NodePath>
        set accessibility_described_by_nodes(value: GArray<NodePath>)
        
        /** The paths to the nodes which label this node. */
        get accessibility_labeled_by_nodes(): GArray<NodePath>
        set accessibility_labeled_by_nodes(value: GArray<NodePath>)
        
        /** The paths to the nodes which this node flows into. */
        get accessibility_flow_to_nodes(): GArray<NodePath>
        set accessibility_flow_to_nodes(value: GArray<NodePath>)
        
        /** The [Theme] resource this node and all its [Control] and [Window] children use. If a child node has its own [Theme] resource set, theme items are merged with child's definitions having higher priority.  
         *      
         *  **Note:** [Window] styles will have no effect unless the window is embedded.  
         */
        get theme(): null | Theme
        set theme(value: null | Theme)
        
        /** The name of a theme type variation used by this [Control] to look up its own theme items. When empty, the class name of the node is used (e.g. [code skip-lint]Button` for the [Button] control), as well as the class names of all parent classes (in order of inheritance).  
         *  When set, this property gives the highest priority to the type of the specified name. This type can in turn extend another type, forming a dependency chain. See [method Theme.set_type_variation]. If the theme item cannot be found using this type or its base types, lookup falls back on the class names.  
         *      
         *  **Note:** To look up [Control]'s own items use various `get_theme_*` methods without specifying `theme_type`.  
         *      
         *  **Note:** Theme items are looked for in the tree order, from branch to root, where each [Control] node is checked for its [member theme] property. The earliest match against any type/class name is returned. The project-level Theme and the default Theme are checked last.  
         */
        get theme_type_variation(): string
        set theme_type_variation(value: string)
        
        /** Emitted when the control changes size. */
        readonly resized: Signal<() => void>
        
        /** Emitted when the node receives an [InputEvent]. */
        readonly gui_input: Signal<(event: InputEvent) => void>
        
        /** Emitted when the mouse cursor enters the control's (or any child control's) visible area, that is not occluded behind other Controls or Windows, provided its [member mouse_filter] lets the event reach it and regardless if it's currently focused or not.  
         *      
         *  **Note:** [member CanvasItem.z_index] doesn't affect, which Control receives the signal.  
         */
        readonly mouse_entered: Signal<() => void>
        
        /** Emitted when the mouse cursor leaves the control's (and all child control's) visible area, that is not occluded behind other Controls or Windows, provided its [member mouse_filter] lets the event reach it and regardless if it's currently focused or not.  
         *      
         *  **Note:** [member CanvasItem.z_index] doesn't affect, which Control receives the signal.  
         *      
         *  **Note:** If you want to check whether the mouse truly left the area, ignoring any top nodes, you can use code like this:  
         *    
         */
        readonly mouse_exited: Signal<() => void>
        
        /** Emitted when the node gains focus. */
        readonly focus_entered: Signal<() => void>
        
        /** Emitted when the node loses focus. */
        readonly focus_exited: Signal<() => void>
        
        /** Emitted when one of the size flags changes. See [member size_flags_horizontal] and [member size_flags_vertical]. */
        readonly size_flags_changed: Signal<() => void>
        
        /** Emitted when the node's minimum size changes. */
        readonly minimum_size_changed: Signal<() => void>
        
        /** Emitted when the [constant NOTIFICATION_THEME_CHANGED] notification is sent. */
        readonly theme_changed: Signal<() => void>
        /** @deprecated Internal use. Does not exist at runtime. */
        __godotNameMap: __NameMapControl;
    }
    namespace ConvertTransformModifier3D {
        enum TransformMode {
            /** Convert with position. Transfer the difference. */
            TRANSFORM_MODE_POSITION = 0,
            
            /** Convert with rotation. The angle is the roll for the specified axis. */
            TRANSFORM_MODE_ROTATION = 1,
            
            /** Convert with scale. Transfers the ratio, not the difference. */
            TRANSFORM_MODE_SCALE = 2,
        }
    }
    /** @deprecated Internal use. Does not exist at runtime. */
    interface __NameMapConvertTransformModifier3D extends __NameMapBoneConstraint3D {
    }
    /** A [SkeletonModifier3D] that apply transform to the bone which converted from reference.  
     *  	  
     *  @link https://docs.godotengine.org/en/4.5/classes/class_converttransformmodifier3d.html  
     */
    class ConvertTransformModifier3D<Map extends NodePathMap = any> extends BoneConstraint3D<Map> {
        constructor(identifier?: any)
        /** Sets the operation of the remapping destination transform. */
        set_apply_transform_mode(index: int64, transform_mode: ConvertTransformModifier3D.TransformMode): void
        
        /** Returns the operation of the remapping destination transform. */
        get_apply_transform_mode(index: int64): ConvertTransformModifier3D.TransformMode
        
        /** Sets the axis of the remapping destination transform. */
        set_apply_axis(index: int64, axis: Vector3.Axis): void
        
        /** Returns the axis of the remapping destination transform. */
        get_apply_axis(index: int64): Vector3.Axis
        
        /** Sets the minimum value of the remapping destination range. */
        set_apply_range_min(index: int64, range_min: float64): void
        
        /** Returns the minimum value of the remapping destination range. */
        get_apply_range_min(index: int64): float64
        
        /** Sets the maximum value of the remapping destination range. */
        set_apply_range_max(index: int64, range_max: float64): void
        
        /** Returns the maximum value of the remapping destination range. */
        get_apply_range_max(index: int64): float64
        
        /** Sets the operation of the remapping source transform. */
        set_reference_transform_mode(index: int64, transform_mode: ConvertTransformModifier3D.TransformMode): void
        
        /** Returns the operation of the remapping source transform. */
        get_reference_transform_mode(index: int64): ConvertTransformModifier3D.TransformMode
        
        /** Sets the axis of the remapping source transform. */
        set_reference_axis(index: int64, axis: Vector3.Axis): void
        
        /** Returns the axis of the remapping source transform. */
        get_reference_axis(index: int64): Vector3.Axis
        
        /** Sets the minimum value of the remapping source range. */
        set_reference_range_min(index: int64, range_min: float64): void
        
        /** Returns the minimum value of the remapping source range. */
        get_reference_range_min(index: int64): float64
        
        /** Sets the maximum value of the remapping source range. */
        set_reference_range_max(index: int64, range_max: float64): void
        
        /** Returns the maximum value of the remapping source range. */
        get_reference_range_max(index: int64): float64
        
        /** Sets relative option in the setting at [param index] to [param enabled].  
         *  If sets [param enabled] to `true`, the extracted and applying transform is relative to the rest.  
         *  If sets [param enabled] to `false`, the extracted transform is absolute.  
         */
        set_relative(index: int64, enabled: boolean): void
        
        /** Returns `true` if the relative option is enabled in the setting at [param index]. */
        is_relative(index: int64): boolean
        
        /** Sets additive option in the setting at [param index] to [param enabled]. This mainly affects the process of applying transform to the [method BoneConstraint3D.set_apply_bone].  
         *  If sets [param enabled] to `true`, the processed transform is added to the pose of the current apply bone.  
         *  If sets [param enabled] to `false`, the pose of the current apply bone is replaced with the processed transform. However, if set [method set_relative] to `true`, the transform is relative to rest.  
         */
        set_additive(index: int64, enabled: boolean): void
        
        /** Returns `true` if the additive option is enabled in the setting at [param index]. */
        is_additive(index: int64): boolean
        
        /** The number of settings in the modifier. */
        get setting_count(): int64
        set setting_count(value: int64)
        /** @deprecated Internal use. Does not exist at runtime. */
        __godotNameMap: __NameMapConvertTransformModifier3D;
    }
    /** @deprecated Internal use. Does not exist at runtime. */
    interface __NameMapConvexPolygonShape2D extends __NameMapShape2D {
    }
    /** A 2D convex polygon shape used for physics collision.  
     *  	  
     *  @link https://docs.godotengine.org/en/4.5/classes/class_convexpolygonshape2d.html  
     */
    class ConvexPolygonShape2D extends Shape2D {
        constructor(identifier?: any)
        /** Based on the set of points provided, this assigns the [member points] property using the convex hull algorithm, removing all unneeded points. See [method Geometry2D.convex_hull] for details. */
        set_point_cloud(point_cloud: PackedVector2Array | Vector2[]): void
        
        /** The polygon's list of vertices that form a convex hull. Can be in either clockwise or counterclockwise order.  
         *  **Warning:** Only set this property to a list of points that actually form a convex hull. Use [method set_point_cloud] to generate the convex hull of an arbitrary set of points.  
         */
        get points(): PackedVector2Array
        set points(value: PackedVector2Array | Vector2[])
        /** @deprecated Internal use. Does not exist at runtime. */
        __godotNameMap: __NameMapConvexPolygonShape2D;
    }
    /** @deprecated Internal use. Does not exist at runtime. */
    interface __NameMapConvexPolygonShape3D extends __NameMapShape3D {
    }
    /** A 3D convex polyhedron shape used for physics collision.  
     *  	  
     *  @link https://docs.godotengine.org/en/4.5/classes/class_convexpolygonshape3d.html  
     */
    class ConvexPolygonShape3D extends Shape3D {
        constructor(identifier?: any)
        /** The list of 3D points forming the convex polygon shape. */
        get points(): GArray
        set points(value: GArray)
        /** @deprecated Internal use. Does not exist at runtime. */
        __godotNameMap: __NameMapConvexPolygonShape3D;
    }
    namespace CopyTransformModifier3D {
        enum TransformFlag {
            /** If set, allows to copy the position. */
            TRANSFORM_FLAG_POSITION = 1,
            
            /** If set, allows to copy the rotation. */
            TRANSFORM_FLAG_ROTATION = 2,
            
            /** If set, allows to copy the scale. */
            TRANSFORM_FLAG_SCALE = 4,
            
            /** If set, allows to copy the position/rotation/scale. */
            TRANSFORM_FLAG_ALL = 7,
        }
        enum AxisFlag {
            /** If set, allows to process the X-axis. */
            AXIS_FLAG_X = 1,
            
            /** If set, allows to process the Y-axis. */
            AXIS_FLAG_Y = 2,
            
            /** If set, allows to process the Z-axis. */
            AXIS_FLAG_Z = 4,
            
            /** If set, allows to process the all axes. */
            AXIS_FLAG_ALL = 7,
        }
    }
    /** @deprecated Internal use. Does not exist at runtime. */
    interface __NameMapCopyTransformModifier3D extends __NameMapBoneConstraint3D {
    }
    /** A [SkeletonModifier3D] that apply transform to the bone which copied from reference.  
     *  	  
     *  @link https://docs.godotengine.org/en/4.5/classes/class_copytransformmodifier3d.html  
     */
    class CopyTransformModifier3D<Map extends NodePathMap = any> extends BoneConstraint3D<Map> {
        constructor(identifier?: any)
        /** Sets the flags to process the transform operations. If the flag is valid, the transform operation is processed.  
         *      
         *  **Note:** If the rotation is valid for only one axis, it respects the roll of the valid axis. If the rotation is valid for two axes, it discards the roll of the invalid axis.  
         */
        set_copy_flags(index: int64, copy_flags: CopyTransformModifier3D.TransformFlag): void
        
        /** Returns the copy flags of the setting at [param index]. */
        get_copy_flags(index: int64): CopyTransformModifier3D.TransformFlag
        
        /** Sets the flags to copy axes. If the flag is valid, the axis is copied. */
        set_axis_flags(index: int64, axis_flags: CopyTransformModifier3D.AxisFlag): void
        
        /** Returns the axis flags of the setting at [param index]. */
        get_axis_flags(index: int64): CopyTransformModifier3D.AxisFlag
        
        /** Sets the flags to inverte axes. If the flag is valid, the axis is copied.  
         *      
         *  **Note:** An inverted scale means an inverse number, not a negative scale. For example, inverting `2.0` means `0.5`.  
         *      
         *  **Note:** An inverted rotation flips the elements of the quaternion. For example, a two-axis inversion will flip the roll of each axis, and a three-axis inversion will flip the final orientation. However, be aware that flipping only one axis may cause unintended rotation by the unflipped axes, due to the characteristics of the quaternion.  
         */
        set_invert_flags(index: int64, axis_flags: CopyTransformModifier3D.AxisFlag): void
        
        /** Returns the invert flags of the setting at [param index]. */
        get_invert_flags(index: int64): CopyTransformModifier3D.AxisFlag
        
        /** If sets [param enabled] to `true`, the position will be copied. */
        set_copy_position(index: int64, enabled: boolean): void
        
        /** Returns `true` if the copy flags has the flag for the position in the setting at [param index]. See also [method set_copy_flags]. */
        is_position_copying(index: int64): boolean
        
        /** If sets [param enabled] to `true`, the rotation will be copied. */
        set_copy_rotation(index: int64, enabled: boolean): void
        
        /** Returns `true` if the copy flags has the flag for the rotation in the setting at [param index]. See also [method set_copy_flags]. */
        is_rotation_copying(index: int64): boolean
        
        /** If sets [param enabled] to `true`, the scale will be copied. */
        set_copy_scale(index: int64, enabled: boolean): void
        
        /** Returns `true` if the copy flags has the flag for the scale in the setting at [param index]. See also [method set_copy_flags]. */
        is_scale_copying(index: int64): boolean
        
        /** If sets [param enabled] to `true`, the X-axis will be copied. */
        set_axis_x_enabled(index: int64, enabled: boolean): void
        
        /** Returns `true` if the enable flags has the flag for the X-axis in the setting at [param index]. See also [method set_axis_flags]. */
        is_axis_x_enabled(index: int64): boolean
        
        /** If sets [param enabled] to `true`, the Y-axis will be copied. */
        set_axis_y_enabled(index: int64, enabled: boolean): void
        
        /** Returns `true` if the enable flags has the flag for the Y-axis in the setting at [param index]. See also [method set_axis_flags]. */
        is_axis_y_enabled(index: int64): boolean
        
        /** If sets [param enabled] to `true`, the Z-axis will be copied. */
        set_axis_z_enabled(index: int64, enabled: boolean): void
        
        /** Returns `true` if the enable flags has the flag for the Z-axis in the setting at [param index]. See also [method set_axis_flags]. */
        is_axis_z_enabled(index: int64): boolean
        
        /** If sets [param enabled] to `true`, the X-axis will be inverted. */
        set_axis_x_inverted(index: int64, enabled: boolean): void
        
        /** Returns `true` if the invert flags has the flag for the X-axis in the setting at [param index]. See also [method set_invert_flags]. */
        is_axis_x_inverted(index: int64): boolean
        
        /** If sets [param enabled] to `true`, the Y-axis will be inverted. */
        set_axis_y_inverted(index: int64, enabled: boolean): void
        
        /** Returns `true` if the invert flags has the flag for the Y-axis in the setting at [param index]. See also [method set_invert_flags]. */
        is_axis_y_inverted(index: int64): boolean
        
        /** If sets [param enabled] to `true`, the Z-axis will be inverted. */
        set_axis_z_inverted(index: int64, enabled: boolean): void
        
        /** Returns `true` if the invert flags has the flag for the Z-axis in the setting at [param index]. See also [method set_invert_flags]. */
        is_axis_z_inverted(index: int64): boolean
        
        /** Sets relative option in the setting at [param index] to [param enabled].  
         *  If sets [param enabled] to `true`, the extracted and applying transform is relative to the rest.  
         *  If sets [param enabled] to `false`, the extracted transform is absolute.  
         */
        set_relative(index: int64, enabled: boolean): void
        
        /** Returns `true` if the relative option is enabled in the setting at [param index]. */
        is_relative(index: int64): boolean
        
        /** Sets additive option in the setting at [param index] to [param enabled]. This mainly affects the process of applying transform to the [method BoneConstraint3D.set_apply_bone].  
         *  If sets [param enabled] to `true`, the processed transform is added to the pose of the current apply bone.  
         *  If sets [param enabled] to `false`, the pose of the current apply bone is replaced with the processed transform. However, if set [method set_relative] to `true`, the transform is relative to rest.  
         */
        set_additive(index: int64, enabled: boolean): void
        
        /** Returns `true` if the additive option is enabled in the setting at [param index]. */
        is_additive(index: int64): boolean
        
        /** The number of settings in the modifier. */
        get setting_count(): int64
        set setting_count(value: int64)
        /** @deprecated Internal use. Does not exist at runtime. */
        __godotNameMap: __NameMapCopyTransformModifier3D;
    }
    /** @deprecated Internal use. Does not exist at runtime. */
    interface __NameMapCrypto extends __NameMapRefCounted {
    }
    /** Provides access to advanced cryptographic functionalities.  
     *  	  
     *  @link https://docs.godotengine.org/en/4.5/classes/class_crypto.html  
     */
    class Crypto extends RefCounted {
        constructor(identifier?: any)
        /** Generates a [PackedByteArray] of cryptographically secure random bytes with given [param size]. */
        generate_random_bytes(size: int64): PackedByteArray
        
        /** Generates an RSA [CryptoKey] that can be used for creating self-signed certificates and passed to [method StreamPeerTLS.accept_stream]. */
        generate_rsa(size: int64): null | CryptoKey
        
        /** Generates a self-signed [X509Certificate] from the given [CryptoKey] and [param issuer_name]. The certificate validity will be defined by [param not_before] and [param not_after] (first valid date and last valid date). The [param issuer_name] must contain at least "CN=" (common name, i.e. the domain name), "O=" (organization, i.e. your company name), "C=" (country, i.e. 2 lettered ISO-3166 code of the country the organization is based in).  
         *  A small example to generate an RSA key and an X509 self-signed certificate.  
         *    
         */
        generate_self_signed_certificate(key: CryptoKey, issuer_name?: string /* = 'CN=myserver,O=myorganisation,C=IT' */, not_before?: string /* = '20140101000000' */, not_after?: string /* = '20340101000000' */): null | X509Certificate
        
        /** Sign a given [param hash] of type [param hash_type] with the provided private [param key]. */
        sign(hash_type: HashingContext.HashType, hash: PackedByteArray | byte[] | ArrayBuffer, key: CryptoKey): PackedByteArray
        
        /** Verify that a given [param signature] for [param hash] of type [param hash_type] against the provided public [param key]. */
        verify(hash_type: HashingContext.HashType, hash: PackedByteArray | byte[] | ArrayBuffer, signature: PackedByteArray | byte[] | ArrayBuffer, key: CryptoKey): boolean
        
        /** Encrypt the given [param plaintext] with the provided public [param key].  
         *      
         *  **Note:** The maximum size of accepted plaintext is limited by the key size.  
         */
        encrypt(key: CryptoKey, plaintext: PackedByteArray | byte[] | ArrayBuffer): PackedByteArray
        
        /** Decrypt the given [param ciphertext] with the provided private [param key].  
         *      
         *  **Note:** The maximum size of accepted ciphertext is limited by the key size.  
         */
        decrypt(key: CryptoKey, ciphertext: PackedByteArray | byte[] | ArrayBuffer): PackedByteArray
        
        /** Generates an [url=https://en.wikipedia.org/wiki/HMAC]HMAC[/url] digest of [param msg] using [param key]. The [param hash_type] parameter is the hashing algorithm that is used for the inner and outer hashes.  
         *  Currently, only [constant HashingContext.HASH_SHA256] and [constant HashingContext.HASH_SHA1] are supported.  
         */
        hmac_digest(hash_type: HashingContext.HashType, key: PackedByteArray | byte[] | ArrayBuffer, msg: PackedByteArray | byte[] | ArrayBuffer): PackedByteArray
        
        /** Compares two [PackedByteArray]s for equality without leaking timing information in order to prevent timing attacks.  
         *  See [url=https://paragonie.com/blog/2015/11/preventing-timing-attacks-on-string-comparison-with-double-hmac-strategy]this blog post[/url] for more information.  
         */
        constant_time_compare(trusted: PackedByteArray | byte[] | ArrayBuffer, received: PackedByteArray | byte[] | ArrayBuffer): boolean
        /** @deprecated Internal use. Does not exist at runtime. */
        __godotNameMap: __NameMapCrypto;
    }
    /** @deprecated Internal use. Does not exist at runtime. */
    interface __NameMapCryptoKey extends __NameMapResource {
    }
    /** A cryptographic key (RSA or elliptic-curve).  
     *  	  
     *  @link https://docs.godotengine.org/en/4.5/classes/class_cryptokey.html  
     */
    class CryptoKey extends Resource {
        constructor(identifier?: any)
        /** Saves a key to the given [param path]. If [param public_only] is `true`, only the public key will be saved.  
         *      
         *  **Note:** [param path] should be a "*.pub" file if [param public_only] is `true`, a "*.key" file otherwise.  
         */
        save(path: string, public_only?: boolean /* = false */): Error
        
        /** Loads a key from [param path]. If [param public_only] is `true`, only the public key will be loaded.  
         *      
         *  **Note:** [param path] should be a "*.pub" file if [param public_only] is `true`, a "*.key" file otherwise.  
         */
        load(path: string, public_only?: boolean /* = false */): Error
        
        /** Returns `true` if this CryptoKey only has the public part, and not the private one. */
        is_public_only(): boolean
        
        /** Returns a string containing the key in PEM format. If [param public_only] is `true`, only the public key will be included. */
        save_to_string(public_only?: boolean /* = false */): string
        
        /** Loads a key from the given [param string_key]. If [param public_only] is `true`, only the public key will be loaded. */
        load_from_string(string_key: string, public_only?: boolean /* = false */): Error
        /** @deprecated Internal use. Does not exist at runtime. */
        __godotNameMap: __NameMapCryptoKey;
    }
    /** @deprecated Internal use. Does not exist at runtime. */
    interface __NameMapCubemap extends __NameMapImageTextureLayered {
    }
    /** Six square textures representing the faces of a cube. Commonly used as a skybox.  
     *  	  
     *  @link https://docs.godotengine.org/en/4.5/classes/class_cubemap.html  
     */
    class Cubemap extends ImageTextureLayered {
        constructor(identifier?: any)
        /** Creates a placeholder version of this resource ([PlaceholderCubemap]). */
        create_placeholder(): Resource
        /** @deprecated Internal use. Does not exist at runtime. */
        __godotNameMap: __NameMapCubemap;
    }
    /** @deprecated Internal use. Does not exist at runtime. */
    interface __NameMapCubemapArray extends __NameMapImageTextureLayered {
    }
    /** An array of [Cubemap]s, stored together and with a single reference.  
     *  	  
     *  @link https://docs.godotengine.org/en/4.5/classes/class_cubemaparray.html  
     */
    class CubemapArray extends ImageTextureLayered {
        constructor(identifier?: any)
        /** Creates a placeholder version of this resource ([PlaceholderCubemapArray]). */
        create_placeholder(): Resource
        /** @deprecated Internal use. Does not exist at runtime. */
        __godotNameMap: __NameMapCubemapArray;
    }
    namespace Curve {
        enum TangentMode {
            /** The tangent on this side of the point is user-defined. */
            TANGENT_FREE = 0,
            
            /** The curve calculates the tangent on this side of the point as the slope halfway towards the adjacent point. */
            TANGENT_LINEAR = 1,
            
            /** The total number of available tangent modes. */
            TANGENT_MODE_COUNT = 2,
        }
    }
    /** @deprecated Internal use. Does not exist at runtime. */
    interface __NameMapCurve extends __NameMapResource {
    }
    /** A mathematical curve.  
     *  	  
     *  @link https://docs.godotengine.org/en/4.5/classes/class_curve.html  
     */
    class Curve extends Resource {
        constructor(identifier?: any)
        /** Adds a point to the curve. For each side, if the `*_mode` is [constant TANGENT_LINEAR], the `*_tangent` angle (in degrees) uses the slope of the curve halfway to the adjacent point. Allows custom assignments to the `*_tangent` angle if `*_mode` is set to [constant TANGENT_FREE]. */
        add_point(position: Vector2, left_tangent?: float64 /* = 0 */, right_tangent?: float64 /* = 0 */, left_mode?: Curve.TangentMode /* = 0 */, right_mode?: Curve.TangentMode /* = 0 */): int64
        
        /** Removes the point at [param index] from the curve. */
        remove_point(index: int64): void
        
        /** Removes all points from the curve. */
        clear_points(): void
        
        /** Returns the curve coordinates for the point at [param index]. */
        get_point_position(index: int64): Vector2
        
        /** Assigns the vertical position [param y] to the point at [param index]. */
        set_point_value(index: int64, y: float64): void
        
        /** Sets the offset from `0.5`. */
        set_point_offset(index: int64, offset: float64): int64
        
        /** Returns the Y value for the point that would exist at the X position [param offset] along the curve. */
        sample(offset: float64): float64
        
        /** Returns the Y value for the point that would exist at the X position [param offset] along the curve using the baked cache. Bakes the curve's points if not already baked. */
        sample_baked(offset: float64): float64
        
        /** Returns the left tangent angle (in degrees) for the point at [param index]. */
        get_point_left_tangent(index: int64): float64
        
        /** Returns the right tangent angle (in degrees) for the point at [param index]. */
        get_point_right_tangent(index: int64): float64
        
        /** Returns the left [enum TangentMode] for the point at [param index]. */
        get_point_left_mode(index: int64): Curve.TangentMode
        
        /** Returns the right [enum TangentMode] for the point at [param index]. */
        get_point_right_mode(index: int64): Curve.TangentMode
        
        /** Sets the left tangent angle for the point at [param index] to [param tangent]. */
        set_point_left_tangent(index: int64, tangent: float64): void
        
        /** Sets the right tangent angle for the point at [param index] to [param tangent]. */
        set_point_right_tangent(index: int64, tangent: float64): void
        
        /** Sets the left [enum TangentMode] for the point at [param index] to [param mode]. */
        set_point_left_mode(index: int64, mode: Curve.TangentMode): void
        
        /** Sets the right [enum TangentMode] for the point at [param index] to [param mode]. */
        set_point_right_mode(index: int64, mode: Curve.TangentMode): void
        
        /** Returns the difference between [member min_value] and [member max_value]. */
        get_value_range(): float64
        
        /** Returns the difference between [member min_domain] and [member max_domain]. */
        get_domain_range(): float64
        
        /** Removes duplicate points, i.e. points that are less than 0.00001 units (engine epsilon value) away from their neighbor on the curve. */
        clean_dupes(): void
        
        /** Recomputes the baked cache of points for the curve. */
        bake(): void
        
        /** The minimum domain (x-coordinate) that points can have. */
        get min_domain(): float64
        set min_domain(value: float64)
        
        /** The maximum domain (x-coordinate) that points can have. */
        get max_domain(): float64
        set max_domain(value: float64)
        
        /** The minimum value (y-coordinate) that points can have. Tangents can cause lower values between points. */
        get min_value(): float64
        set min_value(value: float64)
        
        /** The maximum value (y-coordinate) that points can have. Tangents can cause higher values between points. */
        get max_value(): float64
        set max_value(value: float64)
        get _limits(): any
        set _limits(value: any)
        
        /** The number of points to include in the baked (i.e. cached) curve data. */
        get bake_resolution(): int64
        set bake_resolution(value: int64)
        get _data(): int64
        set _data(value: int64)
        
        /** The number of points describing the curve. */
        get point_count(): int64
        set point_count(value: int64)
        
        /** Emitted when [member max_value] or [member min_value] is changed. */
        readonly range_changed: Signal<() => void>
        
        /** Emitted when [member max_domain] or [member min_domain] is changed. */
        readonly domain_changed: Signal<() => void>
        /** @deprecated Internal use. Does not exist at runtime. */
        __godotNameMap: __NameMapCurve;
    }
    /** @deprecated Internal use. Does not exist at runtime. */
    interface __NameMapCurve2D extends __NameMapResource {
    }
    /** Describes a Bézier curve in 2D space.  
     *  	  
     *  @link https://docs.godotengine.org/en/4.5/classes/class_curve2d.html  
     */
    class Curve2D extends Resource {
        constructor(identifier?: any)
        /** Adds a point with the specified [param position] relative to the curve's own position, with control points [param in] and [param out]. Appends the new point at the end of the point list.  
         *  If [param index] is given, the new point is inserted before the existing point identified by index [param index]. Every existing point starting from [param index] is shifted further down the list of points. The index must be greater than or equal to `0` and must not exceed the number of existing points in the line. See [member point_count].  
         */
        add_point(position: Vector2, in_?: Vector2 /* = Vector2.ZERO */, out_?: Vector2 /* = Vector2.ZERO */, index?: int64 /* = -1 */): void
        
        /** Sets the position for the vertex [param idx]. If the index is out of bounds, the function sends an error to the console. */
        set_point_position(idx: int64, position: Vector2): void
        
        /** Returns the position of the vertex [param idx]. If the index is out of bounds, the function sends an error to the console, and returns `(0, 0)`. */
        get_point_position(idx: int64): Vector2
        
        /** Sets the position of the control point leading to the vertex [param idx]. If the index is out of bounds, the function sends an error to the console. The position is relative to the vertex. */
        set_point_in(idx: int64, position: Vector2): void
        
        /** Returns the position of the control point leading to the vertex [param idx]. The returned position is relative to the vertex [param idx]. If the index is out of bounds, the function sends an error to the console, and returns `(0, 0)`. */
        get_point_in(idx: int64): Vector2
        
        /** Sets the position of the control point leading out of the vertex [param idx]. If the index is out of bounds, the function sends an error to the console. The position is relative to the vertex. */
        set_point_out(idx: int64, position: Vector2): void
        
        /** Returns the position of the control point leading out of the vertex [param idx]. The returned position is relative to the vertex [param idx]. If the index is out of bounds, the function sends an error to the console, and returns `(0, 0)`. */
        get_point_out(idx: int64): Vector2
        
        /** Deletes the point [param idx] from the curve. Sends an error to the console if [param idx] is out of bounds. */
        remove_point(idx: int64): void
        
        /** Removes all points from the curve. */
        clear_points(): void
        
        /** Returns the position between the vertex [param idx] and the vertex `idx + 1`, where [param t] controls if the point is the first vertex (`t = 0.0`), the last vertex (`t = 1.0`), or in between. Values of [param t] outside the range (`0.0 <= t <= 1.0`) give strange, but predictable results.  
         *  If [param idx] is out of bounds it is truncated to the first or last vertex, and [param t] is ignored. If the curve has no points, the function sends an error to the console, and returns `(0, 0)`.  
         */
        sample(idx: int64, t: float64): Vector2
        
        /** Returns the position at the vertex [param fofs]. It calls [method sample] using the integer part of [param fofs] as `idx`, and its fractional part as `t`. */
        samplef(fofs: float64): Vector2
        
        /** Returns the total length of the curve, based on the cached points. Given enough density (see [member bake_interval]), it should be approximate enough. */
        get_baked_length(): float64
        
        /** Returns a point within the curve at position [param offset], where [param offset] is measured as a pixel distance along the curve.  
         *  To do that, it finds the two cached points where the [param offset] lies between, then interpolates the values. This interpolation is cubic if [param cubic] is set to `true`, or linear if set to `false`.  
         *  Cubic interpolation tends to follow the curves better, but linear is faster (and often, precise enough).  
         */
        sample_baked(offset?: float64 /* = 0 */, cubic?: boolean /* = false */): Vector2
        
        /** Similar to [method sample_baked], but returns [Transform2D] that includes a rotation along the curve, with [member Transform2D.origin] as the point position and the [member Transform2D.x] vector pointing in the direction of the path at that point. Returns an empty transform if the length of the curve is `0`.  
         *    
         */
        sample_baked_with_rotation(offset?: float64 /* = 0 */, cubic?: boolean /* = false */): Transform2D
        
        /** Returns the cache of points as a [PackedVector2Array]. */
        get_baked_points(): PackedVector2Array
        
        /** Returns the closest point on baked segments (in curve's local space) to [param to_point].  
         *  [param to_point] must be in this curve's local space.  
         */
        get_closest_point(to_point: Vector2): Vector2
        
        /** Returns the closest offset to [param to_point]. This offset is meant to be used in [method sample_baked].  
         *  [param to_point] must be in this curve's local space.  
         */
        get_closest_offset(to_point: Vector2): float64
        
        /** Returns a list of points along the curve, with a curvature controlled point density. That is, the curvier parts will have more points than the straighter parts.  
         *  This approximation makes straight segments between each point, then subdivides those segments until the resulting shape is similar enough.  
         *  [param max_stages] controls how many subdivisions a curve segment may face before it is considered approximate enough. Each subdivision splits the segment in half, so the default 5 stages may mean up to 32 subdivisions per curve segment. Increase with care!  
         *  [param tolerance_degrees] controls how many degrees the midpoint of a segment may deviate from the real curve, before the segment has to be subdivided.  
         */
        tessellate(max_stages?: int64 /* = 5 */, tolerance_degrees?: float64 /* = 4 */): PackedVector2Array
        
        /** Returns a list of points along the curve, with almost uniform density. [param max_stages] controls how many subdivisions a curve segment may face before it is considered approximate enough. Each subdivision splits the segment in half, so the default 5 stages may mean up to 32 subdivisions per curve segment. Increase with care!  
         *  [param tolerance_length] controls the maximal distance between two neighboring points, before the segment has to be subdivided.  
         */
        tessellate_even_length(max_stages?: int64 /* = 5 */, tolerance_length?: float64 /* = 20 */): PackedVector2Array
        
        /** The distance in pixels between two adjacent cached points. Changing it forces the cache to be recomputed the next time the [method get_baked_points] or [method get_baked_length] function is called. The smaller the distance, the more points in the cache and the more memory it will consume, so use with care. */
        get bake_interval(): float64
        set bake_interval(value: float64)
        get _data(): int64
        set _data(value: int64)
        
        /** The number of points describing the curve. */
        get point_count(): int64
        set point_count(value: int64)
        /** @deprecated Internal use. Does not exist at runtime. */
        __godotNameMap: __NameMapCurve2D;
    }
}
