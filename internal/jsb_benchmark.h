#ifndef GODOTJS_BENCHMARK_H
#define GODOTJS_BENCHMARK_H
#include "jsb_macros.h"

#define JSB_BENCHMARK_SCOPE(RegionName, DetailName) ::jsb::internal::Benchmark __Benchmark__##RegionName##DetailName(#RegionName "." #DetailName)

namespace jsb::internal
{
    // simple implementation of benchmark
    struct Benchmark
    {
        Benchmark(const String& p_name): name_(p_name)
        {
            OS::get_singleton()->benchmark_begin_measure(name_);
        }

        ~Benchmark()
        {
            OS::get_singleton()->benchmark_end_measure(name_);
        }

    private:
        String name_;
    };
}
#endif
