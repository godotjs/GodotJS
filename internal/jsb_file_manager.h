// #ifndef GODOTJS_FILE_MANAGER_H
// #define GODOTJS_FILE_MANAGER_H
//
// #include "jsb_sarray.h"
// #include "jsb_sindex.h"
//
// namespace jsb::internal
// {
//     class FileCallback
//     {
//         virtual ~FileCallback() {}
//
//         virtual void finish() = 0;
//     };
//
//     class FileManager
//     {
//     private:
//         struct Buffer
//         {
//             String file_path_;
//
//             size_t size = 0;
//             uint8_t* ptr = nullptr;
//             uint32_t ref_count_ = 0;
//         };
//
//         // SArray<Task> pending_;
//         // SArray<Task> done_;
//
//         BinaryMutex mutex_;
//         static FileManager* singleton_;
//
//     public:
//         struct FileHandle
//         {
//         private:
//             Index32 id_;
//             FileHandle();
//             ~FileHandle();
//
//         public:
//             // bool is_null() const;
//             // bool is_loaded() const;
//             // String get_path_absolute() const;
//             // uint64_t get_buffer(uint8_t *p_dst, uint64_t p_length) const;
//         };
//
//         static FileManager* get_singleton() { return singleton_; }
//
//         FileManager();
//         ~FileManager();
//
//         FileHandle load_async(const String& p_path);
//         FileHandle load_sync(const String& p_path);
//
//         void run();
//
//     private:
//         void retain_file(Index32 p_id);
//         void release_file(Index32 p_id);
//     };
//
// }
//
// #endif
