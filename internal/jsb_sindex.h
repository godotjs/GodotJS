#ifndef GODOTJS_INDEX_H
#define GODOTJS_INDEX_H

#include "../compat/jsb_compat.h"
#include "jsb_macros.h"

namespace jsb::internal
{
    template<typename UnderlyingType, uint8_t TMaskBit = 6, UnderlyingType TMask = 0x3f>
    struct TIndex
    {
        typedef uint32_t RevisionType;
        static constexpr uint8_t kRevisionBits = TMaskBit;
        static constexpr UnderlyingType kRevisionMask = TMask;

        static const TIndex& none()
        {
            static TIndex index = {};
            return index;
        }

        TIndex(): packed_(0) {}

        TIndex(int32_t index, RevisionType revision):
            packed_(((UnderlyingType)index << kRevisionBits) | ((UnderlyingType)revision & kRevisionMask))
        {
            // index overflow check
            jsb_check(!((UnderlyingType) index >> (sizeof(UnderlyingType) * 8 - kRevisionBits)));
        }

        explicit TIndex(UnderlyingType p_value) : packed_(p_value)
        {
        }

        UnderlyingType operator *() const { return packed_; }
        String to_string() const { return uitos(packed_); }

        TIndex(const TIndex& other) = default;
        TIndex(TIndex&& other) = default;
        TIndex& operator=(const TIndex& other) = default;
        TIndex& operator=(TIndex&& other) = default;
        ~TIndex() = default;

        explicit operator bool() const { return packed_ != 0; }

        int32_t get_index() const { return (int32_t) (packed_ >> kRevisionBits); }
        RevisionType get_revision() const { return (RevisionType) (packed_ & kRevisionMask); }

        friend bool operator==(const TIndex& lhs, const TIndex& rhs)
        {
            return lhs.packed_ == rhs.packed_;
        }

        friend bool operator<(const TIndex& lhs, const TIndex& rhs)
        {
            return lhs.packed_ < rhs.packed_;
        }

        friend bool operator!=(const TIndex& lhs, const TIndex& rhs)
        {
            return lhs.packed_ != rhs.packed_;
        }

        uint32_t hash() const
        {
            return (uint32_t) ((packed_ >> kRevisionBits) ^ (packed_ & kRevisionMask));
        }

        static void increase_revision(RevisionType& p_value)
        {
            p_value = MAX((RevisionType) 1, (p_value + 1) & kRevisionMask);
        }

    private:
        UnderlyingType packed_;
    };

    // Allocates 64 bits, but only the lower 52 are used. This is the range that can be safely stored in a JS number.
    // index(0, 4_294_967_295) revision(1, 1_048_575)
    typedef TIndex<uint64_t, 20, 0xfffff> IndexSafe64;

    // do not really support the index bigger than int32_t.MaxValue
    // /*if unsigned*/ index(0, 4_294_967_295) revision(1, 4_294_967_295)
    typedef TIndex<uint64_t, 32, 0xffffffff> Index64;

    // index(0, 67_108_863) revision(1, 63)
    typedef TIndex<uint32_t, 6, 0x3f> Index32;
}
#endif
