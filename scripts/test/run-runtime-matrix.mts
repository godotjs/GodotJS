import { spawn, spawnSync } from "node:child_process";
import { copyFileSync, existsSync, mkdirSync, readFileSync, readdirSync, rmSync, statSync, writeFileSync } from "node:fs";
import { createServer, Server as HttpServer } from "node:http";
import { createServer as createNetServer } from "node:net";
import { basename, dirname, extname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __filename: string = fileURLToPath(import.meta.url);
const __dirname: string = dirname(__filename);

const moduleRoot: string = resolve(__dirname, "../..");
const godotRoot: string = resolve(moduleRoot, "../..");
const projectPath: string = join(moduleRoot, "tests/project");
const testsBinDir: string = join(moduleRoot, "tests/bin");
const godotBinDir: string = join(godotRoot, "bin");
const testSentinel: string = "GODOTJS_TEST_PROJECT_COMPLETED";
const testFailureSentinelPrefix: string = "GODOTJS_TEST_PROJECT_FAILED:";
const hostFailurePatterns: RegExp[] = [
    /\[jsb]\[Error]\s+exception thrown in function:/i,
    /^Uncaught\s+Error:/im,
];

const hostPlatform: string = process.platform;
const hostArch: string = process.arch === "arm64" ? "arm64" : "x86_64";

const isWindows: boolean = hostPlatform === "win32";
const isLinux: boolean = hostPlatform === "linux";
const isMac: boolean = hostPlatform === "darwin";

const hostSconsPlatform: string | null = isMac ? "macos" : isLinux ? "linuxbsd" : isWindows ? "windows" : null;

if (!hostSconsPlatform) {
    throw new Error(`Unsupported host platform: ${hostPlatform}`);
}

const hostVulkanArgs: string[] = [];

if (process.env.VULKAN_SDK_PATH) {
    const vulkanSdkPath = process.env.VULKAN_SDK_PATH;

    if (!existsSync(vulkanSdkPath)) {
        throw new Error(`specified VULKAN_SDK_PATH does not exist: ${vulkanSdkPath}`);
    }

    hostVulkanArgs.push(`vulkan_sdk_path=${vulkanSdkPath}`);
}

const webBootstrapFailurePatterns = [
    /features required to run Godot projects on the Web are missing/i,
    /WebGL2 - Check web browser configuration and hardware support/i,
];

const runtimeAliasMap = new Map<string, string[]>([
    ["all", ["host-v8", "host-qjs", "host-jsc", "web-browser", "web-qjs"]],
    ["host", ["host-v8", "host-qjs", "host-jsc"]],
    ["web", ["web-browser", "web-qjs"]],
]);
const selectableRuntimeNames = new Set<string>(runtimeAliasMap.get("all"));

interface RunCommandOptions {
    cwd?: string;
    env?: NodeJS.ProcessEnv;
}

interface StaticServer {
    server: HttpServer;
    port: number;
    close: () => Promise<void>;
}

interface TestResult {
    runtime: string;
    status: "PASS" | "FAIL";
    error?: string;
}

function readCliArgValue(flagName: string) {
    const inlinePrefix = `${flagName}=`;

    for (let i = 0; i < process.argv.length; i++) {
        const token = process.argv[i];

        if (token === flagName) {
            const next = process.argv[i + 1];

            if (typeof next === "string" && !next.startsWith("--")) {
                return next;
            }

            return "";
        }

        if (token?.startsWith(inlinePrefix)) {
            return token.slice(inlinePrefix.length);
        }
    }

    return null;
}

function parseRuntimeFilterArg() {
    const raw = readCliArgValue("--runtimes") ?? readCliArgValue("--runtime-whitelist") ?? readCliArgValue("--runtime");

    if (raw === null) {
        return null;
    }

    const requested = raw
        .split(",")
        .map((token) => token.trim())
        .filter((token) => token.length > 0);

    if (requested.length === 0) {
        throw new Error("--runtimes was provided but no runtime names were supplied");
    }

    const expanded = new Set<string>();

    for (const token of requested) {
        if (runtimeAliasMap.has(token)) {
            for (const aliasTarget of runtimeAliasMap.get(token)!) {
                expanded.add(aliasTarget);
            }
            continue;
        }

        if (!selectableRuntimeNames.has(token)) {
            throw new Error(`unknown runtime selector: ${token}`);
        }

        expanded.add(token);
    }

    return expanded;
}

function collectFailureSentinelLines(output: string) {
    return output
        .split(/\r?\n/)
        .filter((line) => line.includes(testFailureSentinelPrefix));
}

function runCommand(label: string, command: string, args: string[], options: RunCommandOptions = {}) {
    const commandLine = [command, ...args].join(" ");

    console.log(`\n[run] ${label}`);
    console.log(commandLine);

    const result = spawnSync(command, args, {
        cwd: options.cwd ?? moduleRoot,
        env: { ...process.env, ...(options.env ?? {}) },
        stdio: "pipe",
        encoding: "utf-8",
        shell: false,
    });

    const combinedOutput = `${result.stdout ?? ""}${result.stderr ?? ""}`;

    if (combinedOutput.trim().length > 0) {
        console.log(combinedOutput.trimEnd());
    }

    if (result.status !== 0) {
        throw new Error(`${label} failed with exit code ${String(result.status)}`, {
            cause: combinedOutput,
        });
    }

    return combinedOutput;
}

function listBinFiles() {
    if (!existsSync(godotBinDir)) {
        return [];
    }

    return readdirSync(godotBinDir).map((name) => join(godotBinDir, name));
}

function findNewestFile(predicate: (filePath: string) => boolean) {
    const files = listBinFiles();
    let newest: null | { filePath: string; mtimeMs: number } = null;

    for (const filePath of files) {
        if (!predicate(filePath)) {
            continue;
        }

        const mtimeMs = statSync(filePath).mtimeMs;

        if (newest === null || mtimeMs > newest.mtimeMs) {
            newest = { filePath, mtimeMs };
        }
    }

    return newest?.filePath ?? null;
}

function hostBinaryPredicate(filePath: string) {
    const name = basename(filePath);

    if (isMac) {
        return /^godot\.macos\.editor/.test(name) && !name.endsWith(".app");
    }

    if (isLinux) {
        return /^godot\.linuxbsd\.editor/.test(name);
    }

    return /^godot\.windows\.editor/.test(name) && name.endsWith(".exe");
}

function expectedWebTemplateNameForRuntime(runtimeName: string) {
    const suffix = runtimeName === "qjs" ? "web-qjs" : "web-browser";
    return `godot.web.template_debug.wasm32.dlink.${suffix}.zip`;
}

function ensureDir(path: string) {
    mkdirSync(path, { recursive: true });
}

function copyArtifact(sourcePath: string, targetName: string) {
    ensureDir(testsBinDir);
    const targetPath = join(testsBinDir, targetName);
    copyFileSync(sourcePath, targetPath);
    return targetPath;
}

function detectBrowserExecutable() {
    if (process.env.GODOTJS_TEST_BROWSER) {
        return process.env.GODOTJS_TEST_BROWSER;
    }

    const candidates: string[] = [];

    if (isMac) {
        candidates.push(
            "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
            "/Applications/Chromium.app/Contents/MacOS/Chromium"
        );
    } else if (isLinux) {
        candidates.push("google-chrome", "chromium-browser", "chromium");
    } else if (isWindows) {
        candidates.push(
            "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
            "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe"
        );
    }

    for (const candidate of candidates) {
        if (candidate.includes("/") || candidate.includes("\\")) {
            if (existsSync(candidate)) {
                return candidate;
            }
            continue;
        }

        const check = spawnSync(isWindows ? "where" : "which", [candidate], { encoding: "utf-8" });

        if (check.status === 0) {
            const match = check.stdout.trim().split(/\r?\n/)[0];

            if (match) {
                return match;
            }
        }
    }
    return null;
}

function runHostProject(label: string, binaryPath: string) {
    runCommand(`${label} generate-types`, binaryPath, ["--headless", "--editor", "--generate-types", "--path", projectPath], {
        cwd: projectPath,
    });

    const output = runCommand(
        `${label} run`,
        binaryPath,
        ["--audio-driver", "Dummy", "--headless", "--path", projectPath],
        { cwd: projectPath }
    );

    if (!output.includes(testSentinel)) {
        throw new Error(`${label} did not reach sentinel log: ${testSentinel}`);
    }

    const failureLines = collectFailureSentinelLines(output);
    if (failureLines.length > 0) {
        throw new Error(`${label} reported failure sentinel(s): ${failureLines.join(" | ")}`);
    }

    const matchedFailurePatterns = hostFailurePatterns
        .filter((pattern) => pattern.test(output))
        .map((pattern) => String(pattern));

    if (matchedFailurePatterns.length > 0) {
        throw new Error(`${label} matched host failure pattern(s): ${matchedFailurePatterns.join(", ")}`);
    }
}

function generateWebExportPreset(templatePath: string, exportPath: string) {
    const presetPath = join(projectPath, "export_presets.cfg");
    const previous = existsSync(presetPath) ? readFileSync(presetPath, "utf-8") : null;
    const normalizedTemplate = templatePath.replaceAll("\\", "/");
    const normalizedExportPath = exportPath.replaceAll("\\", "/");
    const content = `[preset.0]

name="Web"
platform="Web"
runnable=true
dedicated_server=false
custom_features=""
export_filter="all_resources"
include_filter=""
exclude_filter=""
export_path="${normalizedExportPath}"
patches=PackedStringArray()
patch_delta_encoding=false
patch_delta_compression_level_zstd=19
patch_delta_min_reduction=0.1
patch_delta_include_filters="*"
patch_delta_exclude_filters=""
encryption_include_filters=""
encryption_exclude_filters=""
seed=0
encrypt_pck=false
encrypt_directory=false
script_export_mode=2

[preset.0.options]
custom_template/debug="${normalizedTemplate}"
custom_template/release="${normalizedTemplate}"
variant/extensions_support=true
variant/thread_support=true
vram_texture_compression/for_desktop=true
vram_texture_compression/for_mobile=false
html/export_icon=true
html/custom_html_shell=""
html/head_include=""
html/canvas_resize_policy=2
html/focus_canvas_on_start=true
html/experimental_virtual_keyboard=false
progressive_web_app/enabled=false
threads/emscripten_pool_size=8
`;
    writeFileSync(presetPath, content, "utf-8");

    return () => {
        if (previous === null) {
            rmSync(presetPath, { force: true });
        } else {
            writeFileSync(presetPath, previous, "utf-8");
        }
    };
}

function startStaticServer(rootPath: string): Promise<StaticServer> {
    const server = createServer((req, res) => {
        const urlPath = req.url?.split("?")[0] ?? "/";
        const relPath = urlPath === "/" ? "/index.html" : urlPath;
        const cleanSegments = relPath.split("/").filter((segment) => segment.length > 0 && segment !== "..");
        const filePath = join(rootPath, ...cleanSegments);

        if (!existsSync(filePath)) {
            res.writeHead(404);
            res.end("Not found");
            return;
        }

        const body = readFileSync(filePath);

        res.setHeader("Cross-Origin-Opener-Policy", "same-origin");
        res.setHeader("Cross-Origin-Embedder-Policy", "require-corp");
        res.setHeader("Access-Control-Allow-Origin", "*");

        if (filePath.endsWith(".html")) {
            res.setHeader("Content-Type", "text/html");
        } else if (filePath.endsWith(".js")) {
            res.setHeader("Content-Type", "application/javascript");
        } else if (filePath.endsWith(".wasm")) {
            res.setHeader("Content-Type", "application/wasm");
        } else if (filePath.endsWith(".pck")) {
            res.setHeader("Content-Type", "application/octet-stream");
        }

        res.writeHead(200);
        res.end(body);
    });

    return new Promise((resolve) => {
        server.listen(0, "127.0.0.1", () => {
            const address = server.address();

            if (!address || typeof address === "string") {
                throw new Error("failed to start static server");
            }

            resolve({
                server,
                port: address.port,
                close: () =>
                    new Promise((closeResolve) => {
                        server.close(() => closeResolve());
                    }),
            });
        });
    });
}

function parseDebugPortOverride(rawValue: string | undefined) {
    if (typeof rawValue !== "string" || rawValue.trim().length === 0) {
        return null;
    }

    const parsed = Number(rawValue);
    if (!Number.isInteger(parsed) || parsed < 1 || parsed > 65535) {
        throw new Error(`invalid GODOTJS_TEST_DEBUG_PORT value: ${rawValue}`);
    }

    return parsed;
}

function findAvailableTcpPort(): Promise<number> {
    return new Promise((resolve, reject) => {
        const server = createNetServer();

        server.once("error", (error) => {
            reject(error);
        });

        server.listen(0, "127.0.0.1", () => {
            const address = server.address();

            if (!address || typeof address === "string") {
                server.close(() => reject(new Error("failed to allocate an ephemeral debug port")));
                return;
            }

            const { port } = address;
            server.close((closeError) => {
                if (closeError) {
                    reject(closeError);
                    return;
                }
                resolve(port);
            });
        });
    });
}

async function resolveDebugPort(): Promise<number> {
    const overridePort = parseDebugPortOverride(process.env.GODOTJS_TEST_DEBUG_PORT);
    if (overridePort !== null) {
        return overridePort;
    }

    return await findAvailableTcpPort();
}

async function waitForDebuggerEndpoint(port: number, timeoutMs: number): Promise<boolean> {
    const startedAt = Date.now();

    while (Date.now() - startedAt < timeoutMs) {
        try {
            const response = await fetch(`http://127.0.0.1:${String(port)}/json/version`);

            if (response.ok) {
                return true;
            }
        } catch {
            // keep polling until timeout
        }

        await new Promise((resolve) => setTimeout(resolve, 200));
    }

    return false;
}

async function openDebuggerTarget(port: number, url: string): Promise<any> {
    const endpoint = `http://127.0.0.1:${String(port)}/json/new?${encodeURIComponent(url)}`;
    const response = await fetch(endpoint, { method: "PUT" }).catch(async () => fetch(endpoint));

    if (response.ok) {
        return await response.json();
    }

    // Chrome occasionally rejects /json/new in headless mode. Fall back to reusing
    // an existing page target and navigate it explicitly after attaching.
    const listResponse = await fetch(`http://127.0.0.1:${String(port)}/json/list`);
    if (!listResponse.ok) {
        throw new Error(`failed to open debugger target: HTTP ${String(response.status)} (fallback /json/list failed with HTTP ${String(listResponse.status)})`);
    }

    const targets = await listResponse.json();
    const pageTarget = Array.isArray(targets)
        ? targets.find((target) => target?.type === "page" && typeof target?.webSocketDebuggerUrl === "string")
        : null;

    if (!pageTarget) {
        throw new Error(`failed to open debugger target: HTTP ${String(response.status)} (no usable page target found)`);
    }

    return pageTarget;
}

async function runWebProject(label: string, hostV8BinaryPath: string, templatePath: string, runtimeName: string): Promise<void> {
    const exportDir = join(testsBinDir, `${runtimeName}-export`);

    rmSync(exportDir, { recursive: true, force: true });
    ensureDir(exportDir);

    const exportPath = join(exportDir, "index.html");
    const restorePreset = generateWebExportPreset(templatePath, exportPath);

    try {
        runCommand(`${label} export`, hostV8BinaryPath, ["--headless", "--path", projectPath, "--export-debug", "Web", exportPath], {
            cwd: projectPath,
        });
    } finally {
        restorePreset();
    }

    const browserExe = detectBrowserExecutable();

    if (!browserExe) {
        throw new Error(`${label}: no Chrome/Chromium browser found. Set GODOTJS_TEST_BROWSER to an executable path.`);
    }

    const debugPort = await resolveDebugPort();
    const browser = spawn(browserExe, [
        "--headless=new",
        "--enable-webgl",
        "--ignore-gpu-blocklist",
        "--use-angle=swiftshader",
        "--use-gl=angle",
        "--disable-gpu-sandbox",
        "--no-first-run",
        "--no-default-browser-check",
        `--remote-debugging-port=${String(debugPort)}`,
        "about:blank",
    ], {
        stdio: "ignore",
    });

    const staticServer = await startStaticServer(exportDir);

    try {
        const debuggerReady = await waitForDebuggerEndpoint(debugPort, 15000);

        if (!debuggerReady) {
            throw new Error(`${label}: browser debugger endpoint did not start`);
        }

        const targetUrl = `http://127.0.0.1:${String(staticServer.port)}/index.html`;
        const target = await openDebuggerTarget(debugPort, targetUrl);
        const wsUrl = target.webSocketDebuggerUrl;

        if (!wsUrl) {
            throw new Error(`${label}: debugger target missing websocket URL`);
        }

        await new Promise<void>((resolve, reject) => {
            const ws = new WebSocket(wsUrl);

            const sentinelTimeout = setTimeout(() => {
                ws.close();
                reject(new Error(`${label}: timed out waiting for sentinel log`));
            }, 120000);

            const pending = new Map<number, string>();
            let nextId = 1;
            const consoleTail: string[] = [];
            const workerSessions = new Set<string>();
            let settled = false;
            let failureSentinelLine: string | null = null;

            function pushConsoleLine(line: string) {
                if (line.length === 0) {
                    return;
                }
                consoleTail.push(line);
                if (consoleTail.length > 80) {
                    consoleTail.shift();
                }
            }

            function rejectWithTail(message: string) {
                if (settled) {
                    return;
                }
                settled = true;
                clearTimeout(sentinelTimeout);
                ws.close();

                const tail = consoleTail.length > 0
                    ? `\nConsole tail:\n${consoleTail.slice(-200).join("\n")}`
                    : "";
                reject(new Error(`${message}${tail}`));
            }

            function resolveDone() {
                if (settled) {
                    return;
                }
                settled = true;
                clearTimeout(sentinelTimeout);
                ws.close();
                resolve();
            }

            function send(method: string, params: Record<string, any> = {}, sessionId?: string) {
                const id = nextId++;
                pending.set(id, method);
                const message: Record<string, any> = { id, method, params };
                if (typeof sessionId === "string" && sessionId.length > 0) {
                    message.sessionId = sessionId;
                }
                ws.send(JSON.stringify(message));
            }

            ws.onopen = () => {
                send("Runtime.enable");
                send("Page.enable");
                send("Log.enable");
                send("Page.navigate", { url: targetUrl });
                send("Target.setAutoAttach", {
                    autoAttach: true,
                    waitForDebuggerOnStart: false,
                    flatten: true,
                });
            };

            ws.onmessage = (event: MessageEvent) => {
                // Using 'any' since standard DOM types don't cover Chrome DevTools Protocol structures
                const message: any = JSON.parse(String(event.data));

                if (message.id) {
                    pending.delete(message.id);
                    return;
                }

                if (message.method === "Target.attachedToTarget") {
                    const sessionId = message.params?.sessionId;
                    const targetType = message.params?.targetInfo?.type;
                    if (typeof sessionId === "string" && targetType === "worker") {
                        workerSessions.add(sessionId);
                        send("Runtime.enable", {}, sessionId);
                        send("Log.enable", {}, sessionId);
                    }
                    return;
                }

                if (message.method === "Target.detachedFromTarget") {
                    const sessionId = message.params?.sessionId;
                    if (typeof sessionId === "string") {
                        workerSessions.delete(sessionId);
                    }
                    return;
                }

                const sourcePrefix = typeof message.sessionId === "string" && workerSessions.has(message.sessionId)
                    ? "[worker] "
                    : "";

                if (message.method === "Runtime.exceptionThrown") {
                    const details = message.params.exceptionDetails ?? {};
                    const exceptionDescription = details.exception?.description;
                    const exceptionText = details.text;
                    const rendered = typeof exceptionDescription === "string"
                        ? exceptionDescription
                        : typeof exceptionText === "string"
                            ? exceptionText
                            : "unknown exception";

                    if (rendered.includes("Unable to load a worklet's module")) {
                        pushConsoleLine(`${sourcePrefix}${rendered}`);
                        return;
                    }

                    rejectWithTail(`${label}: ${sourcePrefix}browser runtime exception thrown: ${rendered}`);
                } else if (message.method === "Runtime.consoleAPICalled") {
                    const parts: string[] = [];

                    for (const arg of message.params.args ?? []) {
                        if (typeof arg.value === "string") {
                            parts.push(arg.value);
                        } else if (typeof arg.value === "number") {
                            parts.push(String(arg.value));
                        } else if (typeof arg.description === "string") {
                            parts.push(arg.description);
                        }
                    }

                    const line = `${sourcePrefix}${parts.join(" ")}`;
                    pushConsoleLine(line);

                    if (line.includes(testFailureSentinelPrefix)) {
                        if (failureSentinelLine === null) {
                            failureSentinelLine = line;
                            setTimeout(() => {
                                rejectWithTail(`${label}: reported failure sentinel: ${failureSentinelLine}`);
                            }, 250);
                        }
                        return;
                    }

                    for (const pattern of webBootstrapFailurePatterns) {
                        if (pattern.test(line)) {
                            rejectWithTail(`${label}: matched failure pattern: ${String(pattern)}`);
                            return;
                        }
                    }

                    if (line.includes(testSentinel)) {
                        resolveDone();
                    }
                }
            };

            ws.onerror = () => {
                rejectWithTail(`${label}: websocket debugger error`);
            };
        });
    } finally {
        await staticServer.close();
        browser.kill("SIGTERM");
    }
}

const skipBuilds = process.argv.includes("--skip-builds");
const selectedRuntimeFilter = parseRuntimeFilterArg();

function isRuntimeSelected(runtimeName: string) {
    return selectedRuntimeFilter === null || selectedRuntimeFilter.has(runtimeName);
}

function buildHostRuntime(runtimeName: string) {
    if (skipBuilds) {
        const prefix = `godot-host-${runtimeName}`;
        const files = existsSync(testsBinDir) ? readdirSync(testsBinDir) : [];
        const match = files.find((name) => name === prefix || name.startsWith(`${prefix}.`));

        if (!match) {
            throw new Error(`failed to locate copied ${runtimeName} host binary`);
        }

        return join(testsBinDir, match);
    }

    const args = [
        `platform=${hostSconsPlatform}`,
        "target=editor",
        "dev_build=yes",
        "optimize=debug",
        `arch=${hostArch}`,
        "tests=yes",
        ...hostVulkanArgs,
    ];

    if (runtimeName === "qjs") {
        args.push("use_quickjs_ng=yes");
    } else if (runtimeName === "jsc") {
        args.push("use_jsc=yes");
    }

    try {
        runCommand(`build host ${runtimeName}`, "scons", args, {cwd: godotRoot});
    } catch (e) {
        if (e
            && typeof e === 'object'
            && 'cause' in e
            && typeof e.cause === 'string'
            && e.cause.includes('directory not found')
            && e.cause.includes('vulkan_sdk_path')) {
            throw new Error(`VULKAN_SDK_PATH environment variable must be specified`);
        } else {
            throw e;
        }
    }

    const binaryPath = findNewestFile(hostBinaryPredicate);

    if (!binaryPath) {
        throw new Error(`build host ${runtimeName}: failed to locate built host binary`);
    }

    const targetName = `godot-host-${runtimeName}${extname(binaryPath)}`;

    return copyArtifact(binaryPath, targetName);
}

function buildWebRuntime(runtimeName: string) {
    const targetName = `godot-web-${runtimeName}-template_debug.zip`;
    const webBuildSuffix = runtimeName === "qjs" ? "web-qjs" : "web-browser";
    const expectedTemplatePath = join(godotBinDir, expectedWebTemplateNameForRuntime(runtimeName));

    if (skipBuilds) {
        const targetPath = join(testsBinDir, targetName);

        if (!existsSync(targetPath)) {
            throw new Error(`failed to locate copied ${runtimeName} web template`);
        }

        return targetPath;
    }

    const args = [
        "platform=web",
        "target=template_debug",
        "dlink_enabled=yes",
        "debug_symbols=yes",
        "threads=yes",
        "optimize=debug",
        `extra_suffix=${webBuildSuffix}`,
        ...hostVulkanArgs,
    ];

    if (runtimeName === "qjs") {
        args.push("use_quickjs_ng=yes");
    }

    runCommand(`build web ${runtimeName}`, "scons", args, { cwd: godotRoot });

    if (!existsSync(expectedTemplatePath)) {
        throw new Error(`build web ${runtimeName}: expected web template not found: ${expectedTemplatePath}`);
    }

    return copyArtifact(expectedTemplatePath, targetName);
}

async function main(): Promise<void> {
    ensureDir(testsBinDir);
    const results: TestResult[] = [];

    const needsWebBrowser = isRuntimeSelected("web-browser");
    const needsWebQjs = isRuntimeSelected("web-qjs");
    const needsAnyWeb = needsWebBrowser || needsWebQjs;
    const needsHostV8 = isRuntimeSelected("host-v8") || needsAnyWeb;
    const needsHostQjs = isRuntimeSelected("host-qjs");
    const needsHostJscRequested = isRuntimeSelected("host-jsc");
    const needsHostJsc = needsHostJscRequested && isMac;

    if (needsHostJscRequested && !isMac) {
        throw new Error("host-jsc runtime is only available on macOS");
    }

    runCommand("build tests/project TS", "pnpm", ["-C", projectPath, "build"], { cwd: moduleRoot });

    const hostV8Binary = needsHostV8 ? buildHostRuntime("v8") : null;
    const hostQjsBinary = needsHostQjs ? buildHostRuntime("qjs") : null;
    const hostJscBinary = needsHostJsc ? buildHostRuntime("jsc") : null;
    const webBrowserTemplate = needsWebBrowser ? buildWebRuntime("browser") : null;
    const webQjsTemplate = needsWebQjs ? buildWebRuntime("qjs") : null;

    const hostRuns = [
        ...(isRuntimeSelected("host-v8") && hostV8Binary ? [{ runtime: "host-v8", binary: hostV8Binary }] : []),
        ...(isRuntimeSelected("host-qjs") && hostQjsBinary ? [{ runtime: "host-qjs", binary: hostQjsBinary }] : []),
    ];

    if (isRuntimeSelected("host-jsc") && hostJscBinary) {
        hostRuns.push({ runtime: "host-jsc", binary: hostJscBinary });
    }

    for (const run of hostRuns) {
        try {
            runHostProject(run.runtime, run.binary);
            results.push({ runtime: run.runtime, status: "PASS" });
        } catch (error) {
            results.push({ runtime: run.runtime, status: "FAIL", error: String(error) });
        }
    }

    const webRuns = [
        ...(isRuntimeSelected("web-browser") && webBrowserTemplate ? [{ runtime: "web-browser", template: webBrowserTemplate }] : []),
        ...(isRuntimeSelected("web-qjs") && webQjsTemplate ? [{ runtime: "web-qjs", template: webQjsTemplate }] : []),
    ];

    for (const run of webRuns) {
        try {
            if (!hostV8Binary) {
                results.push({ runtime: run.runtime, status: "FAIL", error: "web runtime execution requires host-v8 binary" });
                return;
            }

            await runWebProject(run.runtime, hostV8Binary, run.template, run.runtime);

            results.push({ runtime: run.runtime, status: "PASS" });
        } catch (error) {
            results.push({ runtime: run.runtime, status: "FAIL", error: String(error) });
        }
    }

    console.log("\n=== GodotJS Runtime Test Matrix Summary ===");

    for (const result of results) {
        console.log(`${result.runtime}: ${result.status}`);

        if (result.error) {
            console.log(`  ${result.error}`);
        }
    }

    const failed = results.filter((entry) => entry.status !== "PASS");

    if (failed.length > 0) {
        process.exit(1);
    }
}

main().catch((error) => {
    console.error(error);
    process.exit(1);
});
