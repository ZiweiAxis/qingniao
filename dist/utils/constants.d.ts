/**
 * 常量定义
 */
export declare const DEFAULT_TIMEOUT_SEC: number;
export declare const MAX_SAFE_TIMEOUT_SEC = 2147483;
export declare const WS_INIT_DELAY_MS = 2000;
export declare const MAX_PENDING_TASKS = 100;
export declare const TASK_CLEANUP_INTERVAL_MS = 60000;
export declare const CONFIG_CACHE_TTL_MS = 5000;
export declare const MAX_RECONNECT_ATTEMPTS = 5;
export declare const RECONNECT_DELAY_MS = 3000;
export declare const RECONNECT_BACKOFF_MULTIPLIER = 1.5;
export declare const MESSAGE_TIME_BUFFER_MS = 2000;
export declare const REPO_URL = "https://github.com/ZiweiAxis/qingniao.git";
export declare const SESSION_HINT_CONTINUE = "\u7528\u6237\u672A\u8BF4\u300C\u7ED3\u675F\u300D\u6216\u300C\u5207\u56DE\u300D\u524D\u8BF7\u7EE7\u7EED\u5FAA\u73AF\u53D1\u6D88\u606F\uFF0C\u52FF\u9000\u51FA\u98DE\u4E66\u4F1A\u8BDD\u3002";
export declare const SESSION_HINT_TIMEOUT = "\u672C\u8F6E\u8D85\u65F6\uFF0C\u8BF7\u6267\u884C npx @zwa/qingniao --heartbeat [--timeout=N] \u91CD\u65B0\u62C9\u8D77\u4F1A\u8BDD\uFF1B\u82E5\u8FD4\u56DE\u4ECD\u4E3A timeout\uFF0C\u7EE7\u7EED\u518D\u53D1 --heartbeat\uFF0C\u52FF\u53EA\u53D1\u4E00\u6B21\u5C31\u505C\uFF0C\u52FF\u9000\u51FA\u3002";
export declare const FEISHU_PAIRING_SUCCESS_GUIDE = "\u914D\u5BF9\u6210\u529F\uFF01\u5DF2\u81EA\u52A8\u4FDD\u5B58\u672C\u4F1A\u8BDD\uFF0C\u4E0B\u6B21\u5728 Cursor/Codex \u91CC\u4F60\u53EA\u8981\u8BF4\u300C\u5207\u6362\u5230\u98DE\u4E66\u300D\u300C\u5207\u5230\u98DE\u4E66\u300D\u6216\u300C\u79BB\u5F00\u4E00\u4F1A\u300D\uFF0C\u5C31\u53EF\u4EE5\u628A\u5BF9\u8BDD\u5207\u5230\u8FD9\u91CC\u7EE7\u7EED\u548C\u9752\u9E1F\u5BF9\u8BDD\uFF1B\u8BF4\u300C\u7ED3\u675F\u300D\u6216\u300C\u5207\u56DE\u300D\u5219\u5207\u56DE\u3002";
export declare const CHANNEL_FILE = "message-bridge-channel.json";
export declare const STOP_HOOK_CMD = "npx @zwa/qingniao cursor-stop-hook";
