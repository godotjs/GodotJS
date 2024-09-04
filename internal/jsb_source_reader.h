#ifndef GODOTJS_SOURCE_READER_H
#define GODOTJS_SOURCE_READER_H
#include "jsb_internal_pch.h"

namespace jsb::internal
{
    class ISourceReader
    {
    public:
        virtual ~ISourceReader() = default;

        virtual bool is_null() const = 0;
        virtual String get_path_absolute() const = 0;
        virtual uint64_t get_length() const = 0;
        virtual uint64_t get_buffer(uint8_t *p_dst, uint64_t p_length) const = 0;

        virtual uint64_t get_time_modified() const { return 0; }
        virtual String get_hash() const { return String(); }
    };

    class FileAccessSourceReader : public ISourceReader
    {
    private:
        Ref<FileAccess> file_;

    public:
        FileAccessSourceReader(const String& p_file_name);
        virtual ~FileAccessSourceReader() override = default;

        virtual bool is_null() const override { return file_.is_null(); }
        virtual String get_path_absolute() const override { return file_->get_path_absolute(); }
        virtual uint64_t get_length() const override { return file_->get_length(); }
        virtual uint64_t get_buffer(uint8_t *p_dst, uint64_t p_length) const override { return file_->get_buffer(p_dst, p_length); }

#if JSB_SUPPORT_RELOAD
        virtual uint64_t get_time_modified() const override { return FileAccess::get_modified_time(file_->get_path()); }
        virtual String get_hash() const override { return FileAccess::get_md5(file_->get_path()); }
#endif
    };

}
#endif
