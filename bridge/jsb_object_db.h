#ifndef GODOTJS_OBJECT_DB_H
#define GODOTJS_OBJECT_DB_H

#include "../compat/jsb_compat.h"
#include "jsb_bridge_pch.h"
#include "jsb_object_handle.h"

namespace jsb
{
#if JSB_THREADING
    #define JSB_OBJECT_DB_HANDLE(Type, Ptr) Type(&lock_, Ptr)
    #define JSB_OBJECT_DB_STATEMENT(Statement) Statement

    struct ObjectHandlePtr
    {
    private:
        RWLock* lock_;
        internal::SArray<ObjectHandle, NativeObjectID>::Pointer ptr_;

    public:
        ObjectHandlePtr(const ObjectHandlePtr&) = delete;

        ObjectHandlePtr()
            : lock_(nullptr) {}
        ObjectHandlePtr(RWLock* p_lock, internal::SArray<ObjectHandle, NativeObjectID>::Pointer&& p_ptr)
            : lock_(p_lock), ptr_(std::move(p_ptr))
        {
        }

        ~ObjectHandlePtr()
        {
            if (lock_) lock_->write_unlock();
        }

        ObjectHandle* operator->() const { return ptr_.operator->(); }
        explicit operator bool() const { return (bool) ptr_; }

        ObjectHandlePtr& operator=(std::nullptr_t)
        {
            if (lock_) lock_->write_unlock();
            lock_ = nullptr;
            ptr_ = nullptr;
            return *this;
        }

        ObjectHandlePtr(ObjectHandlePtr&& p_other) noexcept
            : lock_(p_other.lock_), ptr_(std::move(p_other.ptr_))
        {
            p_other.lock_ = nullptr;
        }

        ObjectHandlePtr& operator=(ObjectHandlePtr&& p_other) noexcept
        {
            if (this != &p_other)
            {
                if (lock_) lock_->write_unlock();
                lock_ = p_other.lock_;
                ptr_ = std::move(p_other.ptr_);
                p_other.lock_ = nullptr;
            }
            return *this;
        }
    };

    struct ObjectHandleConstPtr
    {
    private:
        const RWLock* lock_;
        internal::SArray<ObjectHandle, NativeObjectID>::ConstPointer ptr_;

    public:
        ObjectHandleConstPtr(const ObjectHandleConstPtr&) = delete;

        ObjectHandleConstPtr()
            : lock_(nullptr) {}
        ObjectHandleConstPtr(const RWLock* p_lock, internal::SArray<ObjectHandle, NativeObjectID>::ConstPointer&& p_ptr)
            : lock_(p_lock), ptr_(std::move(p_ptr))
        {
        }

        ~ObjectHandleConstPtr()
        {
            if (lock_) lock_->read_unlock();
        }

        const ObjectHandle* operator->() const { return ptr_.operator->(); }
        explicit operator bool() const { return (bool) ptr_; }
        ObjectHandleConstPtr& operator=(std::nullptr_t)
        {
            if (lock_) lock_->read_unlock();
            lock_ = nullptr;
            ptr_ = nullptr;
            return *this;
        }

        ObjectHandleConstPtr(ObjectHandleConstPtr&& p_other) noexcept
            : lock_(p_other.lock_), ptr_(std::move(p_other.ptr_))
        {
            p_other.lock_ = nullptr;
        }

        ObjectHandleConstPtr& operator=(ObjectHandleConstPtr&& p_other) noexcept
        {
            if (this != &p_other)
            {
                if (lock_) lock_->read_unlock();
                lock_ = p_other.lock_;
                ptr_ = std::move(p_other.ptr_);
                p_other.lock_ = nullptr;
            }
            return *this;
        }
    };
#else
    #define JSB_OBJECT_DB_HANDLE(Type, Ptr) (sizeof(Type), Ptr)
    #define JSB_OBJECT_DB_STATEMENT(Statement) (void) 0

    typedef internal::SArray<ObjectHandle, NativeObjectID>::Pointer ObjectHandlePtr;
    typedef internal::SArray<ObjectHandle, NativeObjectID>::ConstPointer ObjectHandleConstPtr;
#endif

    class ObjectDB
    {
    private:
        // cpp objects should be added here since the gc callback is not guaranteed by v8
        // we need to delete them on finally releasing Environment
        internal::SArray<ObjectHandle, NativeObjectID> objects_;

        // (unsafe) mapping object pointer to object_id
        HashMap<void*, NativeObjectID> objects_index_;

#if JSB_THREADING
        RWLock lock_;
#endif

    public:
        ObjectDB(int p_capacity)
        {
            objects_.reserve(p_capacity);
        }

        ~ObjectDB()
        {
            jsb_check(objects_.size() == 0);
            jsb_check(objects_index_.size() == 0);
        }

        jsb_force_inline int size() const { return objects_.size(); }

        jsb_force_inline bool has_object(void* p_pointer) const
        {
            JSB_OBJECT_DB_STATEMENT(RWLockRead lock(lock_));
            return objects_index_.has(p_pointer);
        }

        jsb_force_inline bool has_object(const NativeObjectID& p_object_id) const
        {
            JSB_OBJECT_DB_STATEMENT(RWLockRead lock(lock_));
            return objects_.is_valid_index(p_object_id);
        }

        jsb_force_inline void* try_get_first_pointer() const
        {
            JSB_OBJECT_DB_STATEMENT(RWLockRead lock(lock_));
            return objects_index_.size() ? objects_index_.begin()->key : nullptr;
        }

        jsb_force_inline NativeObjectID try_get_object_id(void* p_pointer) const
        {
            JSB_OBJECT_DB_STATEMENT(RWLockRead lock(lock_));
            const NativeObjectID* it = objects_index_.getptr(p_pointer);
            return it ? *it : NativeObjectID();
        }

        // whether the `p_pointer` registered in the object binding map
        // return true, and the corresponding JS value if `p_pointer` is valid
        jsb_force_inline ObjectHandleConstPtr try_get_object(void* p_pointer) const
        {
            JSB_OBJECT_DB_STATEMENT(lock_.read_lock());

            const NativeObjectID* entry = objects_index_.getptr(p_pointer);
            if (entry) return JSB_OBJECT_DB_HANDLE(ObjectHandleConstPtr, objects_.get_value_scoped(*entry));

            JSB_OBJECT_DB_STATEMENT(lock_.read_unlock());
            return ObjectHandleConstPtr();
        }

        // [MUTABLE]
        jsb_force_inline ObjectHandlePtr try_get_object(void* p_pointer)
        {
            JSB_OBJECT_DB_STATEMENT(lock_.write_lock());

            const NativeObjectID* entry = objects_index_.getptr(p_pointer);
            if (entry) return JSB_OBJECT_DB_HANDLE(ObjectHandlePtr, objects_.get_value_scoped(*entry));

            JSB_OBJECT_DB_STATEMENT(lock_.write_unlock());
            return ObjectHandlePtr();
        }

        jsb_force_inline ObjectHandleConstPtr try_get_object(const NativeObjectID& p_object_id) const
        {
            JSB_OBJECT_DB_STATEMENT(lock_.read_lock());
            return JSB_OBJECT_DB_HANDLE(ObjectHandleConstPtr, objects_.try_get_value_scoped(p_object_id));
        }

        // will crash if the object is not registered in the object binding map
        jsb_force_inline ObjectHandleConstPtr get_object(const NativeObjectID& p_object_id) const
        {
            JSB_OBJECT_DB_STATEMENT(lock_.read_lock());
            return JSB_OBJECT_DB_HANDLE(ObjectHandleConstPtr, objects_.get_value_scoped(p_object_id));
        }

        // [MUTABLE]
        NativeObjectID add_object(void* p_pointer, ObjectHandlePtr* o_handle)
        {
            JSB_OBJECT_DB_STATEMENT(lock_.write_lock());
            jsb_checkf(!objects_index_.has(p_pointer), "duplicated bindings");
            const NativeObjectID object_id = objects_.add({});
            objects_index_.insert(p_pointer, object_id);

            if (o_handle)
                *o_handle = JSB_OBJECT_DB_HANDLE(ObjectHandlePtr, objects_.get_value_scoped(object_id));
            else
                JSB_OBJECT_DB_STATEMENT(lock_.write_unlock());
            return object_id;
        }

        // [MUTABLE]
        void remove_object(void* p_pointer)
        {
            JSB_OBJECT_DB_STATEMENT(lock_.write_lock());
            const NativeObjectID* entry = objects_index_.getptr(p_pointer);
            jsb_check(entry);
            objects_.remove_at_checked(*entry);
            objects_index_.erase(p_pointer);
            JSB_OBJECT_DB_STATEMENT(lock_.write_unlock());
        }
    };
} // namespace jsb

#endif
