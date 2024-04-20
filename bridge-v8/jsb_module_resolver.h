#ifndef JAVASCRIPT_MODULE_RESOLVER_H
#define JAVASCRIPT_MODULE_RESOLVER_H

#include "jsb_pch.h"
#include "jsb_module.h"

namespace jsb
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

    class IModuleResolver
    {
    public:
        virtual ~IModuleResolver() = default;

        // check if the given module_id is valid to resolve
        // `r_asset_path` will be set if there is an available source file in `FileAccess` which matches the given `module_id`
        virtual bool get_source_info(const String& p_module_id, String& r_asset_path) = 0;

        // load source into the module
        // `exports' will be set into `p_module.exports` if loaded successfully
        virtual bool load(class Realm* p_realm, const String& r_asset_path, JavaScriptModule& p_module) = 0;

    protected:
        // read the source buffer (transformed into commonjs)
        static Vector<uint8_t> read_all_bytes(const ISourceReader& p_reader);

        // `p_filename_abs` the absolute file path accessible for debugger
        bool load_from_source(class Realm* p_realm, JavaScriptModule& p_module, const String& p_filename_abs, const Vector<uint8_t>& p_source);
    };

    // the default module resolver finds source files directly with `FileAccess` with `search_paths`
    class DefaultModuleResolver : public IModuleResolver
    {
    public:
        virtual ~DefaultModuleResolver() override = default;

        virtual bool get_source_info(const String& p_module_id, String& r_asset_path) override;
        virtual bool load(class Realm* p_realm, const String& r_asset_path, JavaScriptModule& p_module) override;

        DefaultModuleResolver& add_search_path(const String& p_path);

    protected:
        Ref<FileAccess> get_file_access()
        {
            if (file_access_.is_null())
            {
                file_access_ = FileAccess::create(FileAccess::ACCESS_RESOURCES);
            }
            return file_access_;
        }

        Ref<FileAccess> file_access_;
        Vector<String> search_paths_;
    };
}

#endif
