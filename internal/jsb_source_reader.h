#ifndef GODOTJS_SOURCE_READER_H
#define GODOTJS_SOURCE_READER_H
#include "jsb_macros.h"

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
    };

    class FileAccessSourceReader : public ISourceReader
    {
    private:
        Ref<FileAccess> file_;

    public:
        FileAccessSourceReader(const Ref<FileAccess>& p_file): file_(p_file) {}
        virtual ~FileAccessSourceReader() override = default;

        virtual bool is_null() const override { return file_.is_null(); }
        virtual String get_path_absolute() const override { return file_->get_path_absolute(); }
        virtual uint64_t get_length() const override { return file_->get_length(); }
        virtual uint64_t get_buffer(uint8_t *p_dst, uint64_t p_length) const override { return file_->get_buffer(p_dst, p_length); }
    };

}
#endif
