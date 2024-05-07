#ifndef GODOTJS_SARRAY_H
#define GODOTJS_SARRAY_H

#include <algorithm>

#include "jsb_ansi_allocator.h"
#include "jsb_sindex.h"

#ifndef JSB_AUTOWRAP_REVISION_INC
#define JSB_AUTOWRAP_REVISION_INC 1
#endif

#ifndef JSB_SARRAY_DEBUG
#define JSB_SARRAY_DEBUG DEV_ENABLED
#endif

namespace jsb::internal
{
    //TODO use move-constructor if possible when resizing.
    //NOTE some types (like std::function) are not supported due to copy/move on resizing not implemented for now.
    template <typename T, typename IndexType = Index64, typename TAllocator = AnsiAllocator, bool kDebugging = false>
	class SArray
	{
        using RevisionType = typename IndexType::RevisionType;
		using ElementTypeTypedef = std::remove_pointer_t<T>;

		enum { INDEX_NONE = -1 };
        enum { kInitialRevision = 1 };

		struct Slot
		{
			int next;
			int previous;
			RevisionType revision;
			T value;
#if JSB_SARRAY_DEBUG
		    bool has_value_;
		    jsb_force_inline void reset_value() { has_value_ = false; }
		    jsb_force_inline bool has_value() const { return has_value_; }
		    jsb_force_inline void set_value(T&& p_value) { has_value_ = true; value = std::move(p_value); }
		    jsb_force_inline void set_value(const T& p_value) { has_value_ = true; value = p_value; }
#else
		    jsb_force_inline void reset_value() { }
		    jsb_force_inline bool has_value() const { return true; }
		    jsb_force_inline void set_value(T&& p_value) { value = std::move(p_value); }
		    jsb_force_inline void set_value(const T& p_value) { value = p_value; }
#endif
		};

		using AllocatorType = typename TAllocator::template ForType<Slot>;

		int _version = 0;
		int _used_size = 0;
		int _free_index = -1;
		int _first_index = -1;
		int _last_index = -1;
		AllocatorType allocator;

		jsb_force_inline Slot* get_data() const
		{
			return (Slot*)allocator.get_data();
		}

	public:
		struct LowLevelAccess
		{
			jsb_force_inline bool is_valid_slot(int p_slot_index) const
			{
				if (p_slot_index < 0 || p_slot_index >= container.capacity())
				{
					return false;
				}
				return container.get_data()[p_slot_index].has_value();
			}

			jsb_force_inline T& get_slot_value(int p_slot_index)
			{
				return container.get_data()[p_slot_index].value;
			}

			jsb_force_inline const T& get_slot_value(int p_slot_index) const
			{
				return container.get_data()[p_slot_index].value;
			}

		private:
			jsb_force_inline LowLevelAccess(SArray& p_container) : container(p_container)
			{
			}

			SArray& container;
		};

		jsb_force_inline const LowLevelAccess& get_low_level_access() { return LowLevelAccess(*this); }

		jsb_force_inline SArray() { reserve(8); }
		jsb_force_inline SArray(int p_init_capacity) { reserve(p_init_capacity); }
		jsb_force_inline SArray(SArray&& other) noexcept { *this = std::move(other); }
		jsb_force_inline SArray(const SArray& other) { *this = other; }

		~SArray()
		{
			if constexpr (!std::is_trivially_destructible_v<T>)
			{
				while (_first_index != INDEX_NONE)
				{
					Slot& slot = get_data()[_first_index];
					const int next = slot.next;
					jsb_check(slot.has_value());
				    if constexpr (!std::is_trivially_destructible_v<T>)
				    {
				        slot.value.ElementTypeTypedef::~ElementTypeTypedef();
				    }
					_first_index = next;
				}
			}
		}

		// 当前元素数量
		jsb_force_inline int size() const { return _used_size; }

		jsb_force_inline bool is_empty() const { return _used_size == 0; }

		// 达到当前容量上限
		jsb_force_inline bool is_full() const { return _used_size == capacity(); }

		// 当前最大容量
		jsb_force_inline int capacity() const { return (int) allocator.capacity(); }

	    // 一个插槽占用字节数
	    jsb_force_inline static constexpr size_t get_slot_size() { return sizeof(Slot); }

		void clear()
		{
			if (_used_size == 0)
			{
				return;
			}
			Slot* slots_base = get_data();
			while (_first_index != INDEX_NONE)
			{
				const int index = _first_index;
				Slot& slot = slots_base[index];

				destruct_element(slot);
				_first_index = slot.next;
				slot.next = _free_index;
				slot.reset_value();
				increase_revision(slot.revision);
				_free_index = index;
			}
			jsb_check(_first_index == -1);
			_last_index = -1;
			_used_size = 0;
			++_version;
		}

		// 逆序 (原 index 指向的值将被改变)
		void reverse()
		{
			int forward = _first_index;
			int backward = _last_index;
			Slot* slots_base = get_data();
			while (forward != backward)
			{
				jsb_check(forward >= 0 && backward >= 0);
				iris_swap(slots_base[forward].value, slots_base[backward].value);
				forward = slots_base[forward].next;
				backward = slots_base[backward].previous;
			}
		}

		jsb_force_inline IndexType get_first_index() const
		{
			return _first_index != INDEX_NONE
				       ? IndexType(_first_index, get_data()[_first_index].revision)
				       : IndexType::none();
		}

		jsb_force_inline IndexType get_last_index() const
		{
			return _last_index != INDEX_NONE
				       ? IndexType(_last_index, get_data()[_last_index].revision)
				       : IndexType::none();
		}

		void try_get_linked_index(const IndexType& p_index, IndexType& o_previous, IndexType& o_next) const
		{
			if (!is_valid_index(p_index))
			{
				o_previous = o_next = IndexType::none();
				return;
			}

			const Slot& slot = get_data()[p_index.get_index()];
			if (slot.next != INDEX_NONE)
			{
				jsb_check(get_data()[slot.next].previous == p_index.get_index());
				o_next = IndexType(slot.next, get_data()[slot.next].revision);
			}
			else
			{
				o_next = IndexType::none();
			}
			if (slot.previous != INDEX_NONE)
			{
				jsb_check(get_data()[slot.previous].next == p_index.get_index());
				o_previous = IndexType(slot.previous, get_data()[slot.previous].revision);
			}
			else
			{
				o_previous = IndexType::none();
			}
		}

		jsb_force_inline IndexType get_next_index(const IndexType& p_index) const
		{
			jsb_check(is_valid_index(p_index));
			const Slot& slot = get_data()[p_index.get_index()];
			if (slot.next != INDEX_NONE)
			{
				jsb_check(get_data()[slot.next].previous == p_index.get_index());
				return IndexType(slot.next, get_data()[slot.next].revision);
			}
			return IndexType::none();
		}

		jsb_force_inline IndexType get_previous_index(const IndexType& p_index) const
		{
			jsb_check(is_valid_index(p_index));
			const Slot& slot = get_data()[p_index.get_index()];
			if (slot.previous != INDEX_NONE)
			{
				jsb_check(get_data()[slot.previous].next == p_index.get_index());
				return IndexType(slot.previous, get_data()[slot.previous].revision);
			}
			return IndexType::none();
		}

	    jsb_force_inline bool is_valid_index(const IndexType& p_index) const
		{
		    const int index = p_index.get_index();
		    if (index < 0 || index >= capacity() || get_data()[index].revision != p_index.get_revision())
		    {
		        return false;
		    }
		    jsb_check(get_data()[index].has_value());
		    return true;
		}

        template<typename TArg = T>
        IndexType add(TArg&& value)
		{
			grow_if_needed(1);
			const int new_index = _free_index;
			Slot& slot = get_data()[new_index];

			increase_revision(slot.revision);
			// recreate `value` before assignment
		    construct_element(slot);
			slot.set_value(std::forward<TArg>(value));
			_free_index = slot.next;
			slot.next = INDEX_NONE;
			slot.previous = _last_index;
			++_used_size;
			if (_last_index != INDEX_NONE)
			{
				Slot& last_slot = get_data()[_last_index];
				last_slot.next = new_index;
			}
			if (_first_index == INDEX_NONE)
			{
				_first_index = new_index;
			}
			_last_index = new_index;
			++_version;
			jsb_check(is_consistent());
			return IndexType(new_index, slot.revision);
		}

		IndexType insert(const IndexType& p_index, T&& p_item)
		{
			jsb_check(is_consistent());
			jsb_check(is_valid_index(p_index));
			grow_if_needed(1);

			Slot& pivot_slot = get_data()[p_index.get_index()];
			const int new_index = _free_index;
			Slot& new_slot = get_data()[new_index];

			increase_revision(new_slot.revision);
			// recreate `value` before assignment
		    construct_element(new_slot);
			new_slot.set_value(std::forward<T>(p_item));
			_free_index = new_slot.next;
			new_slot.next = p_index.get_index();
			new_slot.previous = pivot_slot.previous;
			pivot_slot.previous = new_index;
			jsb_check(get_data() + p_index.get_index() == &pivot_slot);
			jsb_check(get_data()[p_index.get_index()].previous == pivot_slot.previous && pivot_slot.previous == new_index);
			if (new_slot.previous != INDEX_NONE)
			{
				Slot& previous_slot = get_data()[new_slot.previous];
				previous_slot.next = new_index;
			}
			++_used_size;
			if (_first_index == p_index.get_index())
			{
				_first_index = new_index;
			}
			++_version;
			if (_version == 49)
			{
				jsb_check(pivot_slot.previous == new_index);
			}
			jsb_check(is_consistent());
			return IndexType(new_index, new_slot.revision);
		}

		bool try_get_value_pointer(const IndexType& p_index, T*& out_item)
		{
			if (is_valid_index(p_index))
			{
				Slot& slot = get_data()[p_index.get_index()];
				out_item = &slot.value;
				return true;
			}
			out_item = 0;
			return false;
		}

		bool try_get_value(const IndexType& p_index, T& out_item)
		{
			if (is_valid_index(p_index))
			{
				Slot& slot = get_data()[p_index.get_index()];
				out_item = slot.value;
				return true;
			}
			return false;
		}

		jsb_force_inline T& operator[](const IndexType& p_index)
		{
			return get_value(p_index);
		}

		jsb_force_inline const T& operator[](const IndexType& p_index) const
		{
			return get_value(p_index);
		}

		T pop()
		{
			jsb_check(_last_index != INDEX_NONE);
			const Slot& slot = get_data()[_last_index];
			const T item = std::move(slot.value);
			remove_at({_last_index, slot.revision});
			return item;
		}

		jsb_force_inline T& get_first_value()
		{
			return get_value(get_first_index());
		}

		jsb_force_inline const T& get_first_value() const
		{
			return get_value(get_first_index());
		}

		jsb_force_inline T& get_last_value()
		{
			return get_value(get_last_index());
		}

		jsb_force_inline const T& get_last_value() const
		{
			return get_value(get_last_index());
		}

		jsb_force_inline T& get_value(const IndexType& p_index)
		{
			jsb_check(p_index.get_index() >= 0);
			jsb_check(p_index.get_index() < capacity());
			Slot& slot = get_data()[p_index.get_index()];
			jsb_check(p_index.get_revision() == slot.revision);
			return slot.value;
		}

		jsb_force_inline const T& get_value(const IndexType& p_index) const
		{
			jsb_check(p_index.get_index() >= 0);
			jsb_check(p_index.get_index() < capacity());
			const Slot& slot = get_data()[p_index.get_index()];
			jsb_check(p_index.get_revision() == slot.revision);
			return slot.value;
		}

		bool try_get_value(const IndexType& p_index, T& o_value) const
		{
			if (p_index.get_index() >= 0 && p_index.get_index() < capacity())
			{
				const Slot& slot = get_data()[p_index.get_index()];
				if (p_index.get_revision() == slot.revision)
				{
					o_value = slot.value;
					return true;
				}
			}
			return false;
		}

		jsb_force_inline bool contains(const T& p_item) const
		{
			return index_of(p_item) != IndexType::none();
		}

		IndexType index_of(const T& p_item) const
		{
			int current = _first_index;
			while (current != INDEX_NONE)
			{
				const Slot& slot = get_data()[current];
				if (slot.value == p_item)
				{
					return IndexType(current, slot.revision);
				}
				current = slot.next;
			}
			return IndexType::none();
		}

		IndexType last_index_of(const T& p_item) const
		{
			int current = _last_index;
			while (current != INDEX_NONE)
			{
				const Slot& slot = get_data()[current];
				if (slot.value == p_item)
				{
					return IndexType(current, slot.revision);
				}
				current = slot.previous;
			}
			return IndexType::none();
		}

		jsb_force_inline bool try_remove_at(const IndexType& p_index, T& o_item)
		{
			if (!is_valid_index(p_index))
			{
				return false;
			}
			o_item = get_value(p_index);
			remove_at(p_index);
			return true;
		}

		bool remove_at(const IndexType& p_index)
		{
			if (p_index.get_index() < 0 || p_index.get_index() >= capacity())
			{
				return false;
			}
			Slot& slot = get_data()[p_index.get_index()];
			if (slot.revision != p_index.get_revision())
			{
				return false;
			}
			const int next = slot.next;
			const int previous = slot.previous;

			destruct_element(slot);
			slot.next = _free_index;
			slot.reset_value();
			increase_revision(slot.revision);
			_free_index = p_index.get_index();
			--_used_size;
			++_version;
			if (next != INDEX_NONE)
			{
				get_data()[next].previous = previous;
			}
			if (previous != INDEX_NONE)
			{
				get_data()[previous].next = next;
			}
			if (_first_index == p_index.get_index())
			{
				_first_index = next;
			}
			if (_last_index == p_index.get_index())
			{
				_last_index = previous;
			}
			jsb_check(is_consistent());
			return true;
		}

		void reserve(int p_size)
		{
			if (p_size <= capacity())
			{
				return;
			}
			grow_if_needed(p_size - capacity());
		}

	    // ensure the number of free slot is enough to add `p_extra_count` new elements
		void grow_if_needed(int p_extra_count)
		{
			jsb_check(p_extra_count > 0);
			const int current_size = capacity();
			const int expected_size = _used_size + p_extra_count;
			if (expected_size <= current_size)
			{
				return;
			}

		    const int new_capacity = std::max(std::max(current_size * 2, 4), expected_size);
		    if constexpr (kDebugging)
		    {
		        JSB_LOG(Debug, "grow to %d from %d", new_capacity, current_size);
		    }
		    allocator.resize(current_size, new_capacity);
		    jsb_check(new_capacity == capacity());
		    Slot* slots_base = get_data();
		    for (int i = current_size; i < new_capacity; ++i)
		    {
		        Slot& slot = slots_base[i];
		        slot.next = _free_index;
		        slot.revision = kInitialRevision;
		        _free_index = i;
		    }
			jsb_check(is_consistent());
		}

#pragma region Iterator
		template <typename ContainerType, typename ElementType>
		struct Iterator
		{
		private:
			ContainerType& container;
			IndexType index;
			IndexType previous;
			IndexType next;

		public:
			Iterator() = delete;

			jsb_force_inline Iterator(ContainerType& p_container, IndexType p_index)
				: container(p_container), index(p_index)
			{
				container.try_get_linked_index(p_index, previous, next);
			}

			jsb_force_inline Iterator(const Iterator& other):
				container(other.container),
				index(other.index),
				previous(other.previous),
				next(other.next)
			{
			}

			jsb_force_inline Iterator& operator++()
			{
				index = next;
				container.try_get_linked_index(index, previous, next);
				return *this;
			}

			jsb_force_inline Iterator& operator++(int)
			{
				Iterator temp(*this);
				index = next;
				container.try_get_linked_index(index, previous, next);
				return temp;
			}

			jsb_force_inline Iterator& operator--()
			{
				index = previous;
				container.try_get_linked_index(index, previous, next);
				return *this;
			}

			jsb_force_inline Iterator& operator--(int)
			{
				Iterator temp(*this);
				index = previous;
				container.try_get_linked_index(index, previous, next);
				return temp;
			}

			jsb_force_inline ElementType& operator*() const
			{
				return container.get_value(index);
			}

			jsb_force_inline ElementType* operator->() const
			{
				return &container.get_value(index);
			}

			jsb_force_inline bool is_valid() const { return container.is_valid_index(index); }
			jsb_force_inline explicit operator bool() const { return is_valid(); }

			jsb_force_inline Iterator& operator=(const Iterator& other)
			{
				container = other.container;
				index = other.index;
				previous = other.previous;
				next = other.next;
				return *this;
			}

			jsb_force_inline friend bool operator==(const Iterator& lhs, const Iterator& rhs)
			{
				return &lhs.container == &rhs.container
					&& lhs.index == rhs.index
					&& lhs.previous == rhs.previous
					&& lhs.next == rhs.next;
			}

			jsb_force_inline friend bool operator!=(const Iterator& lhs, const Iterator& rhs)
			{
				return &lhs.container != &rhs.container
					|| lhs.index != rhs.index
					|| lhs.previous != rhs.previous
					|| lhs.next != rhs.next;
			}

			jsb_force_inline void remove()
			{
				container.remove_at(index);
			}

			jsb_force_inline IndexType get_index() const
			{
				return index;
			}
		}; // Iterator

		typedef Iterator<SArray, T> TIterator;
		TIterator begin() { return TIterator(*this, get_first_index()); }
		TIterator end() { return TIterator(*this, IndexType::none()); }

		typedef Iterator<const SArray, const T> TConstIterator;
		TConstIterator begin() const { return TConstIterator(*this, get_first_index()); }
		TConstIterator end() const { return TConstIterator(*this, IndexType::none()); }
#pragma endregion

		SArray& operator=(SArray&& other) noexcept
		{
			if (this == &other)
			{
				return *this;
			}
			clear();
			_version = other._version;
			_used_size = other._used_size;
			allocator = std::move(other.allocator);
			_free_index = other._free_index;
			_first_index = other._first_index;
			_last_index = other._last_index;
			other._version = 0;
			other._used_size = 0;
			// other.allocator.reset();
			other._free_index = -1;
			other._first_index = -1;
			other._last_index = -1;
			return *this;
		}

		SArray& operator=(const SArray& other)
		{
			if (this == &other)
			{
				return *this;
			}
			clear();
			int index = other._first_index;
			while (index != INDEX_NONE)
			{
				add(other.get_data()[index].value);
				index = other.get_data()[index].next;
			}
			return *this;
		}

		friend bool operator==(const SArray& lhs, const SArray& rhs)
		{
			if (&lhs == &rhs)
			{
				return true;
			}
			if (lhs._used_size != rhs._used_size)
			{
				return false;
			}
			int lhs_index = lhs._first_index;
			int rhs_index = rhs._first_index;
			while (lhs_index != INDEX_NONE && rhs_index != INDEX_NONE)
			{
				if (lhs.get_data()[lhs_index].value != rhs.get_data()[rhs_index].value)
				{
					return false;
				}
				lhs_index = lhs.get_data()[lhs_index].next;
				rhs_index = rhs.get_data()[rhs_index].next;
			}
			return true;
		}

		friend bool operator!=(const SArray& lhs, const SArray& rhs)
		{
			return !(lhs == rhs);
		}

	private:
		bool is_consistent() const
		{
			int index = _free_index;
			int count = 0;
			while (index != INDEX_NONE)
			{
				const Slot& slot = get_data()[index];
				index = slot.next;
				++count;
			}
			jsb_check(count == capacity() - _used_size);
			if (_used_size > 0)
			{
				count = 0;
				index = _first_index;
				while (index != INDEX_NONE)
				{
					const Slot& slot = get_data()[index];
					jsb_check(is_valid_index({ index, slot.revision }));
					if (index == _first_index)
					{
						jsb_check(slot.previous == INDEX_NONE);
					}
					if (slot.next != INDEX_NONE)
					{
						jsb_check(get_data()[slot.next].previous == index);
					}
					if (slot.previous != INDEX_NONE)
					{
						jsb_check(get_data()[slot.previous].next == index);
					}
					++count;
					jsb_check(count <= _used_size);
					if (count == _used_size)
					{
						jsb_check(_last_index == index);
					}
					index = slot.next;
				}
				return _used_size == count;
			}
			return _first_index == INDEX_NONE && _last_index == INDEX_NONE;
		}

		jsb_force_inline static void increase_revision(RevisionType& p_value)
		{
#if JSB_AUTOWRAP_REVISION_INC
			p_value += 2; // should skip zero automatically if overflowed (initial rev must be 1)
#else
		    p_value = (p_value + 1 & IndexType::kRevisionMask) == 0 ? 1 : p_value + 1;
#endif
		}

	    jsb_force_inline static void construct_element(Slot& p_slot)
		{
		    jsb_check(!p_slot.has_value());
		    if constexpr (!std::is_trivially_constructible_v<T>)
		    {
		        memnew_placement(&p_slot.value, T);
		    }
		}

		jsb_force_inline static void destruct_element(Slot& p_slot)
		{
		    jsb_check(p_slot.has_value());
			if constexpr (!std::is_trivially_destructible_v<T>)
			{
				p_slot.value.ElementTypeTypedef::~ElementTypeTypedef();
			}
		    else
		    {
		        memset((void *)&p_slot.value, 0, sizeof(T));
		    }
		}
	};
}
#endif
