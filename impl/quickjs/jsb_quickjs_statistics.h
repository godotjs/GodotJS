#ifndef GODOTJS_QUICKJS_STATISTICS_H
#define GODOTJS_QUICKJS_STATISTICS_H
#include "jsb_quickjs_pch.h"

namespace v8
{
    class HeapStatistics
    {
    public:
        HeapStatistics() = default;
        
        size_t total_heap_size() { return total_heap_size_; }
        size_t total_heap_size_executable() { return total_heap_size_executable_; }
        size_t total_physical_size() { return total_physical_size_; }
        size_t total_available_size() { return total_available_size_; }
        size_t total_global_handles_size() { return total_global_handles_size_; }
        size_t used_global_handles_size() { return used_global_handles_size_; }
        size_t used_heap_size() { return used_heap_size_; }
        size_t heap_size_limit() { return heap_size_limit_; }
        size_t malloced_memory() { return malloced_memory_; }
        size_t external_memory() { return external_memory_; }
        size_t peak_malloced_memory() { return peak_malloced_memory_; }
        size_t number_of_native_contexts() { return number_of_native_contexts_; }
        size_t number_of_detached_contexts() { return number_of_detached_contexts_; }

        size_t does_zap_garbage() { return does_zap_garbage_; }

    private:
        size_t total_heap_size_;
        size_t total_heap_size_executable_;
        size_t total_physical_size_;
        size_t total_available_size_;
        size_t used_heap_size_;
        size_t heap_size_limit_;
        size_t malloced_memory_;
        size_t external_memory_;
        size_t peak_malloced_memory_;
        bool does_zap_garbage_;
        size_t number_of_native_contexts_;
        size_t number_of_detached_contexts_;
        size_t total_global_handles_size_;
        size_t used_global_handles_size_;

        friend class V8;
        friend class Isolate;
    };
}

#endif
