# Options

| Name | Description | Default Value |
|---|---|---|
|JSB_MIN_LOG_LEVEL|minimum log level|Verbose|
|JSB_DEBUG| Debug mode. <br/> It's overwritten in SCsub with the value of `DEV_ENABLED` by default. | 1 |
|JSB_LOG_WITH_SOURCE|log with [source filename, line number, function name]|0|
|JSB_WITH_VARIANT_POOL| use a pool allocator for creating variant instances | 1 |
|JSB_WITH_DEBUGGER| enable to debug with Chrome devtools | 1|
|JSB_WITH_SOURCEMAP|translate the js source stacktrace with source map (currently, the `.map` file must locate at the same filename & directory of the js source) | 1|
|JSB_WITH_STACKTRACE_ALWAYS| enable this to let all methods in `console` print with js stacktrace|0|
|JSB_WITH_LWS|JSB_WITH_LWS must be enabled if JSB_WITH_DEBUGGER is used.<br/> Currently use `libwebsockets` to handle v8 debugger connection since `modules/websocket` fail to handshake with `devtools`. <br/>`devtools` do not response the upgrade request with a `sec-websocket-protocol` header which does not apply the handshake requirements of `WSLPeer` <br/> and the connection will break immediately by `devtools` if `selected_protocol` is assigned manually in `WSLPeer`|1|



---

[Go Back](../README.md)
