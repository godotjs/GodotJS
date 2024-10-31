#ifndef GODOTJS_VARIANT_ALLOCATOR_H
#define GODOTJS_VARIANT_ALLOCATOR_H
#include "jsb_macros.h"

namespace jsb::internal
{
    class VariantAllocator
    {
#if JSB_DEBUG
        SafeNumeric<uint32_t> alive_variants_num_;
#endif

#if JSB_WITH_VARIANT_POOL
#   if JSB_WITH_V8
        PagedAllocator<Variant, true> paged_allocator_;
#   else
        PagedAllocator<Variant, false> paged_allocator_;
#   endif
#endif

    public:
        jsb_force_inline Variant* alloc(const Variant& p_templet)
        {
            Variant* rval = alloc();
            *rval = p_templet;
            return rval;
        }

#if JSB_DEBUG
        jsb_force_inline uint32_t get_allocated_num() const { return alive_variants_num_.get(); }
#else
        // intentionally ignored in release mode
        jsb_force_inline uint32_t get_allocated_num() const { return 0; }
#endif

#if JSB_WITH_VARIANT_POOL
        jsb_force_inline Variant* alloc() { increment(); return paged_allocator_.alloc(); }

        //NOTE must ensure thread-safety
        jsb_force_inline void free(Variant* p_var) { decrement(); paged_allocator_.free(p_var); }
#else
        jsb_force_inline Variant* alloc() { increment(); return memnew(Variant); }
        jsb_force_inline void free(Variant* p_var) { decrement(); memdelete(p_var); }
#endif

    private:
#if JSB_DEBUG
        jsb_force_inline void increment() { alive_variants_num_.increment(); }
        jsb_force_inline void decrement() { alive_variants_num_.decrement(); }
#else
        jsb_force_inline void increment() {}
        jsb_force_inline void decrement() {}
#endif
    };
}

#endif
