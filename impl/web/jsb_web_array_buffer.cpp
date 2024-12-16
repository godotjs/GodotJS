#include "jsb_web_array_buffer.h"
#include "jsb_web_isolate.h"

namespace v8
{
    void* ArrayBuffer::Data() const
    {
        size_t size;
        const uint8_t* ptr = JS_GetArrayBuffer(isolate_->ctx(), &size, (JSValue) *this);
        jsb_check(ptr);
        return (void*) ptr;
    }

    size_t ArrayBuffer::ByteLength() const
    {
        size_t size;
        const uint8_t* ptr = JS_GetArrayBuffer(isolate_->ctx(), &size, (JSValue) *this);
        jsb_check(ptr);
        return size;
    }

    Local<ArrayBuffer> ArrayBuffer::New(Isolate* isolate, size_t length)
    {
        uint8_t* buf = (uint8_t*) memalloc(length);
        return Local<ArrayBuffer>(v8::Data(isolate, isolate->push_steal(JS_NewArrayBuffer(isolate->ctx(), buf, length, _free, nullptr, 0))));
    }

    void ArrayBuffer::_free(JSRuntime* rt, void* opaque, void* ptr)
    {
        memfree(ptr);
    }

}
