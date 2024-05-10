#ifndef DEF
#define DEF(...)
#endif

DEF(VeryVerbose) // very trivial (omitted by default even if JSB_DEBUG is on)
DEF(Verbose)     // trivial

DEF(Debug)   // not important
DEF(Info)    // general level
DEF(Log)     // 'console.log'
DEF(Trace)   // 'console.trace'
DEF(Warning) //
DEF(Error)   // unexpected but not critical
DEF(Assert)  // 'console.assert'
DEF(Fatal)   // critial errors
