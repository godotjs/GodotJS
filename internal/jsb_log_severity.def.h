
// all log levels <=Verbose are not printed in Editor.

DEF(VeryVerbose) // very trivial (omitted by default even if JSB_DEBUG is on)
DEF(Verbose)     // trivial

DEF(Debug)   // not important
DEF(Info)    // general level
DEF(Log)     // 'console.log'
DEF(Trace)   // 'console.trace', log but with stacktrace anyway
DEF(Warning) //
DEF(Error)   // unexpected but not critical
DEF(Assert)  // 'console.assert', print only if assertion failed
DEF(Fatal)   // critial errors
