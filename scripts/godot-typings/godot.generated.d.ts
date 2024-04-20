// AUTO-GENERATED

declare module "godot" {
    class Node {

    }

    // singleton
    namespace Engine {
        function get_time_scale(): number;
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
}
