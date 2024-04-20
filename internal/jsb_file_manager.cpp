// #include "jsb_file_manager.h"
//
// namespace jsb::internal
// {
//     FileManager* FileManager::singleton_ = nullptr;
//
//     FileManager::FileManager()
//     {
//         jsb_check(!singleton_);
//         singleton_ = this;
//     }
//
//     FileManager::~FileManager()
//     {
//         jsb_check(singleton_);
//         singleton_ = nullptr;
//     }
//
//     FileManager::FileHandle FileManager::load_async(const String &p_path)
//     {
//         //TODO
//         return {};
//     }
//
//     FileManager::FileHandle FileManager::load_sync(const String &p_path)
//     {
//         mutex_.lock();
//         mutex_.unlock();
//         //TODO
//         return {};
//     }
//
//     void FileManager::run()
//     {
//         mutex_.lock();
//
//         mutex_.unlock();
//     }
//
//     void FileManager::retain_file(Index32 p_id)
//     {
//
//     }
//
//     void FileManager::release_file(Index32 p_id)
//     {
//
//     }
//
//     FileManager::FileHandle::FileHandle()
//     {
//     }
//
//     FileManager::FileHandle::~FileHandle()
//     {
//         // if (FileManager* fm = singleton_)
//         // {
//         //     fm->release_file(id_);
//         // }
//     }
//
// }
