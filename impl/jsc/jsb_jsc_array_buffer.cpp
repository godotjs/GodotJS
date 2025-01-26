#include "jsb_jsc_array_buffer.h"
#include "jsb_jsc_isolate.h"
#include "thirdparty/glslang/glslang/MachineIndependent/preprocessor/PpContext.h"
#include "thirdparty/graphite/src/inc/Error.h"

namespace v8
{
    void* ArrayBuffer::Data() const
    {
        const JSObjectRef self = jsb::impl::JavaScriptCore::AsObject(isolate_->ctx(), (JSValueRef) *this);
        JSValueRef error = nullptr;
        void* ptr = JSObjectGetArrayBufferBytesPtr(isolate_->ctx(), self, &error);
        if (error)
        {
            jsb::impl::JavaScriptCore::MarkExceptionAsTrivial(isolate_->ctx(), error);
            return nullptr;
        }
        jsb_check(ptr);
        return ptr;
    }

    size_t ArrayBuffer::ByteLength() const
    {
        const JSObjectRef self = jsb::impl::JavaScriptCore::AsObject(isolate_->ctx(), (JSValueRef) *this);
        JSValueRef error = nullptr;
        const size_t size = JSObjectGetArrayBufferByteLength(isolate_->ctx(), self, &error);
        if (error)
        {
            jsb::impl::JavaScriptCore::MarkExceptionAsTrivial(isolate_->ctx(), error);
            return 0;
        }
        return size;
    }

    Local<ArrayBuffer> ArrayBuffer::New(Isolate* isolate, size_t length)
    {
        JSValueRef error = nullptr;
        uint8_t* buf = (uint8_t*) memalloc(length);
        const JSObjectRef obj = JSObjectMakeArrayBufferWithBytesNoCopy(isolate->ctx(),
            buf, length,
            _deallocator, /* deallocatorContext */ nullptr,
            &error);
        return Local<ArrayBuffer>(v8::Data(isolate, isolate->push_copy(obj)));
    }

    void ArrayBuffer::_deallocator(void* bytes, void* deallocatorContext)
    {
        memfree(bytes);
    }

}
