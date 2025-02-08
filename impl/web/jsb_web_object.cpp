#include "jsb_web_object.h"
#include "jsb_web_isolate.h"
#include "jsb_web_function_interop.h"
#include "jsb_web_template.h"

namespace v8
{
    int Object::InternalFieldCount() const
    {
        const jsb::impl::InternalDataID index = (jsb::impl::InternalDataID)(uintptr_t) jsbi_GetOpaque(isolate_->rt(), stack_pos_);
        if (!index) return 0;
        const jsb::impl::InternalDataPtr data = isolate_->get_internal_data(index);
        return data->internal_field_count;
    }

    void Object::SetAlignedPointerInInternalField(int slot, void* data)
    {
        jsb_check((uintptr_t) data % 2 == 0);
        const jsb::impl::InternalDataID internal_data_id = (jsb::impl::InternalDataID)(uintptr_t) jsbi_GetOpaque(isolate_->rt(), stack_pos_);
        const jsb::impl::InternalDataPtr internal_data = isolate_->get_internal_data(internal_data_id);
        JSB_WEB_LOG(VeryVerbose, "set internal data JSObject:%s id:%s data:%s (last:%s)", stack_pos_, internal_data_id, (uintptr_t) data, (uintptr_t) internal_data->internal_fields[slot]);
        jsb_checkf(!data || !internal_data->internal_fields[slot], "overwriting the internal field is not allowed");
        internal_data->internal_fields[slot] = data;
    }

    void Object::SetAlignedPointerInInternalFields(int argc, int indices[], void* values[])
    {
        const jsb::impl::InternalDataID internal_data_id = (jsb::impl::InternalDataID)(uintptr_t) jsbi_GetOpaque(isolate_->rt(), stack_pos_);
        const jsb::impl::InternalDataPtr internal_data = isolate_->get_internal_data(internal_data_id);
        for (int i = 0; i < argc; i++)
        {
            jsb_check((uintptr_t) values[i] % 2 == 0);
            jsb_checkf(!values[i] || !internal_data->internal_fields[indices[i]], "overwriting the internal field #%d is not allowed", indices[i]);
            internal_data->internal_fields[indices[i]] = values[i];
        }
    }

    void* Object::GetAlignedPointerFromInternalField(int slot) const
    {
        const jsb::impl::InternalDataID index = (jsb::impl::InternalDataID)(uintptr_t) jsbi_GetOpaque(isolate_->rt(), stack_pos_);
        const jsb::impl::InternalDataPtr data = isolate_->get_internal_data(index);
        return data->internal_fields[slot];
    }

    Maybe<bool> Object::Set(Local<Context> context, uint32_t index, Local<Value> value)
    {
        const jsb::impl::ResultValue res = jsbi_SetPropertyUint32(isolate_->rt(), stack_pos_, index, value->stack_pos_);
        if (res == -1)
        {
            return Maybe<bool>();
        }
        return Maybe<bool>(!!res);
    }

    MaybeLocal<Value> Object::Get(Local<Context> context, uint32_t index) const
    {
        const jsb::impl::StackPosition rval = jsbi_GetPropertyUint32(isolate_->rt(), stack_pos_, index);
        if (rval == jsb::impl::StackBase::Error)
        {
            return MaybeLocal<Value>();
        }
        return MaybeLocal<Value>(Data(isolate_, rval));
    }

    Maybe<bool> Object::Set(Local<Context> context, Local<Value> key, Local<Value> value)
    {
        const jsb::impl::ResultValue res = jsbi_SetProperty(isolate_->rt(), stack_pos_, key->stack_pos_, value->stack_pos_);
        if (res == -1)
        {
            return Maybe<bool>();
        }
        return Maybe<bool>(!!res);
    }

    MaybeLocal<Value> Object::Get(Local<Context> context, Local<Value> key) const
    {
        const jsb::impl::StackPosition rval = jsbi_GetProperty(isolate_->rt(), stack_pos_, key->stack_pos_);
        if (rval == jsb::impl::StackBase::Error)
        {
            return MaybeLocal<Value>();
        }
        return MaybeLocal<Value>(Data(isolate_, rval));
    }

    Maybe<bool> Object::HasOwnProperty(Local<Context> context, Local<Name> key) const
    {
        const jsb::impl::ResultValue res = jsbi_HasOwnProperty(isolate_->rt(), stack_pos_, key->stack_pos_);
        if (res == -1)
        {
            return Maybe<bool>();
        }
        return Maybe<bool>(!!res);
    }

    Maybe<bool> Object::SetPrototype(Local<Context> context, Local<Value> prototype)
    {
        const jsb::impl::ResultValue res = jsbi_SetPrototypeOf(isolate_->rt(), stack_pos_, prototype->stack_pos_);
        if (res == -1)
        {
            return Maybe<bool>();
        }
        return Maybe<bool>(!!res);
    }

    Local<Value> Object::GetPrototype()
    {
        const jsb::impl::StackPosition rval = jsbi_GetPrototypeOf(isolate_->rt(), stack_pos_);
        if (rval == jsb::impl::StackBase::Error)
        {
            return Local<Value>();
        }
        return Local<Value>(Data(isolate_, rval));
    }

    MaybeLocal<Value> Object::CallAsConstructor(Local<Context> context, int argc, Local<Value> argv[])
    {
        jsb::impl::StackPosition* vargv = jsb_stackalloc(jsb::impl::StackPosition, argc);
        for (int i = 0; i < argc; i++)
        {
            vargv[i] = argv[i]->stack_pos_;
        }
        const jsb::impl::StackPosition rval_sp = jsbi_CallAsConstructor(isolate_->rt(), stack_pos_, argc, vargv);
        if (rval_sp == jsb::impl::StackBase::Error)
        {
            return MaybeLocal<Value>();
        }
        return MaybeLocal<Value>(Data(isolate_, rval_sp));
    }

    Local<Object> Object::New(Isolate* isolate)
    {
        return Local<Object>(Data(isolate, jsbi_NewObject(isolate->rt())));
    }

    MaybeLocal<Value> Object::GetOwnPropertyDescriptor(Local<Context> context, Local<Name> key) const
    {
        const jsb::impl::StackPosition rval = jsbi_GetOwnPropertyDescriptor(isolate_->rt(), stack_pos_, key->stack_pos_);
        if (rval == jsb::impl::StackBase::Error)
        {
            return MaybeLocal<Value>();
        }
        return MaybeLocal<Value>(Data(isolate_, rval));
    }

    Maybe<bool> Object::SetLazyDataProperty(Local<Context> context, Local<Name> name, AccessorNameGetterCallback getter)
    {
        const jsb::impl::ResultValue rval = jsbi_DefineLazyProperty(isolate_->rt(), stack_pos_, name->stack_pos_, (jsb::impl::FunctionPointer) getter);
        if (rval != -1)
        {
            return Maybe<bool>(true);
        }
        return Maybe<bool>();
    }

    Maybe<bool> Object::DefineOwnProperty(Local<Context> context, Local<Name> key, Local<Value> value, PropertyAttribute attributes)
    {
        int flags = jsb::impl::PropertyFlags::VALUE;
        if ((attributes & DontEnum) == 0) flags |= jsb::impl::PropertyFlags::ENUMERABLE;
        if ((attributes & ReadOnly) == 0) flags |= jsb::impl::PropertyFlags::WRITABLE;
        if ((attributes & DontDelete) == 0) flags |= jsb::impl::PropertyFlags::CONFIGURABLE;

        const jsb::impl::ResultValue res = jsbi_DefineProperty(isolate_->rt(),
            /* obj */   stack_pos_,
            /* prop */  key->stack_pos_,
            /* value */ value->stack_pos_,
            /* get */   jsb::impl::StackBase::Undefined,
            /* set */   jsb::impl::StackBase::Undefined,
            flags);

        if (res != -1)
        {
            return Maybe<bool>(!!res);
        }
        return Maybe<bool>();
    }

    void Object::SetAccessorProperty(Local<Name> name, Local<FunctionTemplate> getter, Local<FunctionTemplate> setter)
    {
        int flags = jsb::impl::PropertyFlags::ENUMERABLE | jsb::impl::PropertyFlags::CONFIGURABLE; //TODO consider remove 'configurable' flags
        if (!getter.IsEmpty()) flags |= jsb::impl::PropertyFlags::GET;
        if (!setter.IsEmpty()) flags |= jsb::impl::PropertyFlags::SET;

        const jsb::impl::ResultValue res = jsbi_DefineProperty(isolate_->rt(),
            /* obj */   stack_pos_,
            /* prop */  name->stack_pos_,
            /* value */ jsb::impl::StackBase::Undefined,
            (jsb::impl::StackPosition) getter,
            (jsb::impl::StackPosition) setter,
            flags);

        jsb_check(res >= 0);
    }

    MaybeLocal<Array> Object::GetOwnPropertyNames(Local<Context> context, PropertyFilter filter, KeyConversionMode key_conversion)
    {
        const jsb::impl::StackPosition rval = jsbi_GetOwnPropertyNames(isolate_->rt(), stack_pos_, filter, (int) key_conversion);
        if (rval == jsb::impl::StackBase::Error)
        {
            return MaybeLocal<Array>();
        }
        return MaybeLocal<Array>(Data(isolate_, rval));
    }

}
