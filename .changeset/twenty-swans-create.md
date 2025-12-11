---
"@godot-js/editor": minor
---

feat: Debug on mobile, wait for debugger and LWS/V8 auto-download

- There's now Project Settings -> GodotJS -> Runtime -> Wait for Debugger (currently V8 only). This will pause execution before any JavaScript user code runs. This allows you to much more easily debug app start-up.

- There is now support for debugging on mobile devices. Unlike Editor builds on your Desktop, mobile builds don't have source distributed with them. Instead debugging works in tandem with an Editor build, which provides the source files to the debugger. Configure the host that provides source code with the new Project Settings -> GodotJS -> Runtime -> Source Map Base URL option. Your debugger (NOT the mobile device) must be able to reach this this URL. By default, that means you'll want to use: http://127.0.0.1:9300 Additionally, you need to ensure your TypeScript build config has sourceMaps enabled. The debugger can then fetch source files over HTTP. It is however, worth noting fetching source files can be pretty slow, particularly if you have a lot of them. Local debugging of desktop editor builds is generally much simpler.

- GodotJS Development: libwebsockets (LWS) was previously included as a binary in the repo. It (and V8) are now automatically downloaded from GodotJS' GodotJS-Dependencies release on Github. Whilst not 100% foolproof, this does help validate the integrity of binaries included in builds.

