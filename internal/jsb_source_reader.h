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

        /** Get the asset path */
        virtual String get_path() const = 0;

        /** Get the absolute path if available */
        virtual String get_path_absolute() const = 0;
        virtual String get_source_url() const = 0;
        virtual uint64_t get_length() const = 0;
        virtual uint64_t get_buffer(uint8_t* p_dst, uint64_t p_length) const = 0;


        virtual uint64_t get_time_modified() const { return 0; }
        virtual String get_hash() const { return String(); }
    };

    class FileAccessSourceReader : public ISourceReader
    {
    private:
        Ref<FileAccess> file_;
        size_t cached_length_;
        String source_url;

    public:
        FileAccessSourceReader(const String& p_file_name);
        virtual ~FileAccessSourceReader() override = default;

        virtual bool is_null() const override { return file_.is_null(); }
        virtual String get_path() const override { return file_->get_path(); }
        virtual String get_path_absolute() const override { return file_->get_path_absolute(); }
        virtual String get_source_url() const override { return source_url; }
        virtual uint64_t get_length() const override { return cached_length_; }
        virtual uint64_t get_buffer(uint8_t* p_dst, uint64_t p_length) const override { return file_->get_buffer(p_dst, p_length); }

#if JSB_SUPPORT_RELOAD && defined(TOOLS_ENABLED)
        virtual uint64_t get_time_modified() const override { return FileAccess::get_modified_time(file_->get_path()); }
        virtual String get_hash() const override { return FileAccess::get_md5(file_->get_path()); }
#endif
    };

    class StringSourceReader : public ISourceReader
    {
        String path_;
        String absolute_path_;
        Vector<uint8_t> buffer_;

    public:
        StringSourceReader(const String& p_path, const String& p_absolute_path, const String& p_source);
        virtual ~StringSourceReader() override = default;

        virtual bool is_null() const override { return buffer_.is_empty(); }
        virtual String get_path() const override { return path_; }
        virtual String get_path_absolute() const override { return absolute_path_; }
        virtual String get_source_url() const override { return absolute_path_; }
        virtual uint64_t get_length() const override { return buffer_.size(); }
        virtual uint64_t get_buffer(uint8_t* p_dst, uint64_t p_length) const override;
    };
} // namespace jsb::internal
#endif
