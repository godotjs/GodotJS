#ifndef GODOTJS_TIMER_MANAGER_H
#define GODOTJS_TIMER_MANAGER_H

#include "jsb_internal_pch.h"

namespace jsb::internal
{
    struct TimerHandle
    {
        jsb_force_inline TimerHandle() = default;
        jsb_force_inline ~TimerHandle() = default;

        jsb_force_inline TimerHandle(const IndexSafe64& p_index): id(p_index) {}
        jsb_force_inline TimerHandle& operator=(const IndexSafe64& p_index) { id = p_index; return *this; }

        jsb_force_inline TimerHandle(const TimerHandle& p_other): id(p_other.id) {}
        jsb_force_inline TimerHandle& operator=(const TimerHandle& p_other) { id = p_other.id; return *this; }

        jsb_force_inline TimerHandle(TimerHandle&& p_other) noexcept: id(p_other.id) {}
        jsb_force_inline TimerHandle& operator=(TimerHandle&& p_other) noexcept { id = p_other.id; p_other.id = {}; return *this; }

        jsb_force_inline explicit operator int64_t() const { return (int64_t) *id; }
        jsb_force_inline explicit operator IndexSafe64() const { return id; }
        jsb_force_inline explicit operator bool() const { return id != IndexSafe64::none(); }

        jsb_force_inline explicit TimerHandle(const int64_t p_index): id((int64_t) p_index) {}

    private:
        IndexSafe64 id;

        template<typename, uint8_t, uint8_t, uint64_t>
        friend class TTimerManager;
    };

    /**
     * time unit used: milliseconds
     * @note Do not use std::function as TFunction, because SArray does not support `move`.
     * @tparam TFunction type of callback
     * @tparam kWheelNum number of wheels
     * @tparam kWheelSlotNum number of slots in each wheel
     * @tparam kJiffies the minimum time resolution (in milliseconds)
     */
    template<typename TFunction, uint8_t kWheelNum = 12, uint8_t kWheelSlotNum = 6, uint64_t kJiffies = 10>
    class TTimerManager
    {
    public:
        typedef uint64_t Span;

    private:
        struct TimerData
        {
            bool loop;

            uint64_t rate;
            uint64_t expires;

            TFunction action;
        };

        struct WheelSlot
        {
            std::vector<IndexSafe64> timer_indices;

            jsb_force_inline void append(const IndexSafe64& index) { timer_indices.push_back(index); }

            jsb_force_inline void move_to(std::vector<IndexSafe64>& cache)
            {
                cache.reserve(cache.size() + timer_indices.size());
                cache.insert(cache.end(), timer_indices.begin(), timer_indices.end());
                timer_indices.clear();
            }

            jsb_force_inline void clear()
            {
                timer_indices.clear();
            }
        };

        struct WheelState
        {
            uint8_t depth;
            uint8_t index;

            uint64_t interval;
            uint64_t range;

            WheelSlot slots[kWheelSlotNum];

            WheelState() = default;
            WheelState(uint8_t p_depth, uint64_t p_interval) { init(p_depth, p_interval); }

            void init(uint8_t p_depth, uint64_t p_interval)
            {
                depth = p_depth;
                interval = p_interval;
                range = p_interval * kWheelSlotNum;
                index = 0;
            }

            uint64_t add(uint64_t p_delay, const IndexSafe64& p_timer_index)
            {
                const uint64_t offset = p_delay >= interval ? (p_delay / interval) - 1 : p_delay / interval;
                const uint64_t slot_index = (uint64_t)((index + offset) % (uint64_t)kWheelSlotNum);
                slots[slot_index].append(p_timer_index);
                return slot_index;
            }

            void next(std::vector<IndexSafe64>& p_active_indices)
            {
                slots[index++].move_to(p_active_indices);
            }

            bool round()
            {
                if (index == kWheelSlotNum)
                {
                    index = 0;
                    return true;
                }
                return false;
            }

            void clear()
            {
                index = 0;
                for (WheelSlot& slot : slots)
                {
                    slot.clear();
                }
            }
        };

        uint64_t _elapsed;
        uint32_t _time_slice;
        SArray<TimerData, IndexSafe64> _used_timers;
        WheelState _wheels[kWheelNum];
        std::vector<IndexSafe64> _activated_timers;
        std::vector<IndexSafe64> _moving_timers;

        static void check_internal_state()
        {
            // jsb_check(Thread::is_main_thread());
        }

    public:
        jsb_force_inline uint64_t get_elapsed() const { return _elapsed; }

        TTimerManager()
        {
            _time_slice = 0;
            _elapsed = 0;
            _used_timers.reserve(32);
            for (uint8_t i = 0; i < kWheelNum; ++i)
            {
                uint32_t interval = 1;
                for (uint8_t j = 0; j < i; j++) interval *= kWheelSlotNum;
                _wheels[i].init(i, (uint64_t)kJiffies * interval);
            }
        }

        // the maximum range of this timer manager type (in milliseconds)
        static constexpr uint64_t get_max_range()
        {
            uint64_t interval = 1;
            for (uint8_t j = 0; j < kWheelNum - 1; j++) interval *= kWheelSlotNum;
            return kJiffies * interval * kWheelSlotNum;
        }

        jsb_force_inline uint64_t now() const { return _elapsed; }

        TimerHandle add_timer(TFunction&& p_fn, uint64_t p_rate, bool p_is_loop = false,
                              uint64_t p_first_delay = 0)
        {
            TimerHandle handle;
            set_timer(handle, std::forward<TFunction>(p_fn), p_rate, p_is_loop, p_first_delay);
            return handle;
        }

        void set_timer(TimerHandle& inout_handle, TFunction&& p_fn, uint64_t p_rate,
                       bool p_is_loop = false, uint64_t p_first_delay = 0)
        {
            jsb_check(!!p_fn);
            check_internal_state();
            _used_timers.remove_at(inout_handle.id);

            const uint64_t delay = p_first_delay > 0 ? p_first_delay : p_rate;
            const IndexSafe64 index = _used_timers.add(TimerData());
            TimerData& timer = _used_timers.get_value(index);
            timer.rate = p_rate;
            timer.expires = delay + _elapsed;
            timer.action = std::forward<TFunction>(p_fn);
            timer.loop = p_is_loop;

            rearrange_timer(index, delay);
            inout_handle = TimerHandle(index);
        }

        jsb_force_inline bool is_valid_timer(const TimerHandle& p_handle) const
        {
            return _used_timers.is_valid_index(p_handle.id);
        }

        jsb_force_inline int size() const { return _used_timers.size(); }

        bool clear_timer(TimerHandle& p_handle)
        {
            if (_clear_timer(p_handle.id))
            {
                p_handle.id = IndexSafe64::none();
                return true;
            }
            return false;
        }

        bool clear_timer(const TimerHandle& p_handle)
        {
            return _clear_timer(p_handle.id);
        }

        void clear_all()
        {
            check_internal_state();
            _activated_timers.clear();
            _moving_timers.clear();
            for (WheelState& wheel : _wheels)
            {
                wheel.clear();
            }
            _used_timers.clear();
        }

        void reset()
        {
            clear_all();
            _time_slice = 0;
            _elapsed = 0;
        }

        bool tick(uint64_t p_ms)
        {
            _time_slice += p_ms;
            while (_time_slice >= kJiffies)
            {
                _time_slice -= kJiffies;
                _elapsed += kJiffies;
                _wheels[0].next(_activated_timers);

                for (int wheel_index = 0; wheel_index < kWheelNum; ++wheel_index)
                {
                    if (!_wheels[wheel_index].round())
                    {
                        break;
                    }

                    if (wheel_index == kWheelNum - 1)
                    {
                        continue;
                    }

                    _wheels[wheel_index + 1].next(_moving_timers);
                    for (const IndexSafe64& index : _moving_timers)
                    {
                        TimerData* timer;
                        if (_used_timers.try_get_value_pointer(index, timer))
                        {
                            if (timer->expires > _elapsed)
                            {
                                rearrange_timer(index, timer->expires - _elapsed);
                            }
                            else
                            {
                                _activated_timers.emplace_back(index);
                            }
                        }
                    }
                    _moving_timers.clear();
                }
            }

            return !_activated_timers.empty();
        }

        template<typename TContext>
        bool invoke_timers(TContext* ctx)
        {
            if (_activated_timers.empty()) return false;
            for (const IndexSafe64& index : _activated_timers)
            {
                TimerData* timer;
                if (!_used_timers.try_get_value_pointer(index, timer))
                {
                    // remnant of timer index won't be removed from wheel slots immediately when the timer is cleared.
                    // it's usually safe to ignore them.
                    JSB_LOG(Debug, "timer active (invalid) %d", index);
                    continue;
                }
                timer->action(ctx);

                // the `timer` pointer may become invalid during the .action() call (due to internal reallocation in SArray)
                // get the pointer again for further use
                if (_used_timers.try_get_value_pointer(index, timer) && timer->loop)
                {
                    // update the next tick time
                    timer->expires = timer->rate + _elapsed;
                    rearrange_timer(index, timer->rate);
                }
                else
                {
                    _clear_timer(index);
                }
            }
            _activated_timers.clear();
            return true;
        }

    private:
        bool _clear_timer(const IndexSafe64& p_index)
        {
            check_internal_state();
            return _used_timers.remove_at(p_index);
        }

        void rearrange_timer(const IndexSafe64& p_timer_id, uint64_t p_delay)
        {
            jsb_check(_used_timers.is_valid_index(p_timer_id));
            for (WheelState& wheel : _wheels)
            {
                if (p_delay < wheel.range)
                {
                    wheel.add(p_delay, p_timer_id);
                    return;
                }
            }

            JSB_LOG(Error, "out of time range %d", p_delay);
            _wheels[kWheelNum - 1].add(p_delay, p_timer_id);
        }
    };
}

#endif
