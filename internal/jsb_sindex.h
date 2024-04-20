#ifndef JAVASCRIPT_INDEX_H
#define JAVASCRIPT_INDEX_H

#include "jsb_macros.h"

namespace jsb::internal
{
    template<typename UnderlyingType, uint8_t TMaskBit = 6, UnderlyingType TMask = 0x3f>
    struct TIndex
    {
        typedef uint32_t RevisionType;
        constexpr static uint8_t kRevisionBits = TMaskBit;
        constexpr static UnderlyingType kRevisionMask = TMask;

        jsb_force_inline static const TIndex& none()
        {
            static TIndex index = {};
            return index;
        }

        jsb_force_inline TIndex(): packed_(0) {}

        jsb_force_inline TIndex(int32_t index, RevisionType revision):
            packed_(((UnderlyingType)index << kRevisionBits) | ((UnderlyingType)revision & kRevisionMask))
        {
            // index overflow check
            jsb_check(!((UnderlyingType) index >> (sizeof(UnderlyingType) * 8 - kRevisionBits)));
        }

        jsb_force_inline explicit TIndex(UnderlyingType p_value) : packed_(p_value)
        {
        }

        jsb_force_inline operator UnderlyingType() const { return packed_; }

        jsb_force_inline TIndex(const TIndex& other) = default;
        jsb_force_inline TIndex(TIndex&& other) = default;
        jsb_force_inline TIndex& operator=(const TIndex& other) = default;
        jsb_force_inline TIndex& operator=(TIndex&& other) = default;
        jsb_force_inline ~TIndex() = default;

        jsb_force_inline bool is_valid() const { return packed_ != 0; }
        jsb_force_inline operator bool() const { return packed_ != 0; }

        jsb_force_inline int32_t get_index() const { return (int32_t) (packed_ >> kRevisionBits); }
        jsb_force_inline RevisionType get_revision() const { return (RevisionType) (packed_ & kRevisionMask); }

        jsb_force_inline friend bool operator==(const TIndex& lhs, const TIndex& rhs)
        {
            return lhs.packed_ == rhs.packed_;
        }

        jsb_force_inline friend bool operator<(const TIndex& lhs, const TIndex& rhs)
        {
            return lhs.packed_ < rhs.packed_;
        }

        jsb_force_inline friend bool operator!=(const TIndex& lhs, const TIndex& rhs)
        {
            return lhs.packed_ != rhs.packed_;
        }

        jsb_force_inline uint32_t hash() const
        {
            return (uint32_t) ((packed_ >> kRevisionBits) ^ (packed_ & kRevisionMask));
        }

    private:
        UnderlyingType packed_;
    };

    // do not really support the index bigger than int32_t.MaxValue
    typedef TIndex<uint64_t, 32, 0xffffffff> Index64;
    typedef TIndex<uint32_t, 6, 0x3f> Index32;
}
#endif
