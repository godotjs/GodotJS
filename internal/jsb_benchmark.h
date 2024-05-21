#ifndef GODOTJS_BENCHMARK_H
#define GODOTJS_BENCHMARK_H
#include "jsb_macros.h"

#if JSB_BENCHMARK
#   define JSB_BENCHMARK_SCOPE(RegionName, DetailName) static String __String__##RegionName##DetailName = #RegionName "." #DetailName; ::jsb::internal::Benchmark __Benchmark__##RegionName##DetailName(__String__##RegionName##DetailName)
#else
#   define JSB_BENCHMARK_SCOPE(RegionName, DetailName) (void) 0
#endif

namespace jsb::internal
{
    // simple implementation of benchmark
    struct Benchmark
    {
        Benchmark(const String& p_name): name_(p_name)
        {
            start_ = OS::get_singleton()->get_ticks_usec();
            // OS::get_singleton()->benchmark_begin_measure(name_);
        }

        ~Benchmark()
        {
            const uint64_t total = OS::get_singleton()->get_ticks_usec() - start_;
            // ignore if finished in a jiffy
            if (total > 20000)
            {
                const double total_f = (double)total / 1000000.0;
                JSB_LOG(Warning, "benchmark %s: %f s", name_, total_f);
            }
            // OS::get_singleton()->benchmark_end_measure(name_);
        }

    private:
        String name_;
        uint64_t start_;
    };
}
#endif
