// THIS FILE IS ONLY A PLACEHOLDER FOR COMPILING THE PREMADE TYPESCRIPT SOURCES IN THE GODOTJS MODULE IN-PLACE WITHOUT ERRORS.
// godot.xxx.d.ts files will be generated in a target project.

declare module "godot" {
    class Node {

    }

    // singleton
    namespace Engine {
        function get_time_scale(): number;
    }

    class PackedByteArray {
    }

    namespace FileAccess {
        enum ModeFlags {
            READ = 1,
            WRITE = 2,
            READ_WRITE = 3,
            WRITE_READ = 7,
        }
    }

    class FileAccess {

        static open(path: string, flags: number);
        static file_exists(path: string): boolean;

        store_line(str: string);
        get_position(): number;
        flush(): void;
        close() : void;
    }
    
    namespace Variant {
        enum Type {
            TYPE_NIL = 0,
            TYPE_BOOL = 1,
            TYPE_INT = 2,
            TYPE_FLOAT = 3,
            TYPE_STRING = 4,
            TYPE_VECTOR2 = 5,
            TYPE_VECTOR2I = 6,
            TYPE_RECT2 = 7,
            TYPE_RECT2I = 8,
            TYPE_VECTOR3 = 9,
            TYPE_VECTOR3I = 10,
            TYPE_TRANSFORM2D = 11,
            TYPE_VECTOR4 = 12,
            TYPE_VECTOR4I = 13,
            TYPE_PLANE = 14,
            TYPE_QUATERNION = 15,
            TYPE_AABB = 16,
            TYPE_BASIS = 17,
            TYPE_TRANSFORM3D = 18,
            TYPE_PROJECTION = 19,
            TYPE_COLOR = 20,
            TYPE_STRING_NAME = 21,
            TYPE_NODE_PATH = 22,
            TYPE_RID = 23,
            TYPE_OBJECT = 24,
            TYPE_CALLABLE = 25,
            TYPE_SIGNAL = 26,
            TYPE_DICTIONARY = 27,
            TYPE_ARRAY = 28,
            TYPE_PACKED_BYTE_ARRAY = 29,
            TYPE_PACKED_INT32_ARRAY = 30,
            TYPE_PACKED_INT64_ARRAY = 31,
            TYPE_PACKED_FLOAT32_ARRAY = 32,
            TYPE_PACKED_FLOAT64_ARRAY = 33,
            TYPE_PACKED_STRING_ARRAY = 34,
            TYPE_PACKED_VECTOR2_ARRAY = 35,
            TYPE_PACKED_VECTOR3_ARRAY = 36,
            TYPE_PACKED_COLOR_ARRAY = 37,
            TYPE_MAX = 38,
        }
    }
    namespace Variant {
        enum Operator {
            OP_EQUAL = 0,
            OP_NOT_EQUAL = 1,
            OP_LESS = 2,
            OP_LESS_EQUAL = 3,
            OP_GREATER = 4,
            OP_GREATER_EQUAL = 5,
            OP_ADD = 6,
            OP_SUBTRACT = 7,
            OP_MULTIPLY = 8,
            OP_DIVIDE = 9,
            OP_NEGATE = 10,
            OP_POSITIVE = 11,
            OP_MODULE = 12,
            OP_POWER = 13,
            OP_SHIFT_LEFT = 14,
            OP_SHIFT_RIGHT = 15,
            OP_BIT_AND = 16,
            OP_BIT_OR = 17,
            OP_BIT_XOR = 18,
            OP_BIT_NEGATE = 19,
            OP_AND = 20,
            OP_OR = 21,
            OP_XOR = 22,
            OP_NOT = 23,
            OP_IN = 24,
            OP_MAX = 25,
        }
    }
}
