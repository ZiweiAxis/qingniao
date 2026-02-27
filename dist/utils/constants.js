"use strict";
/**
 * 常量定义
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.STOP_HOOK_CMD = exports.CHANNEL_FILE = exports.FEISHU_PAIRING_SUCCESS_GUIDE = exports.SESSION_HINT_TIMEOUT = exports.SESSION_HINT_CONTINUE = exports.REPO_URL = exports.MESSAGE_TIME_BUFFER_MS = exports.RECONNECT_BACKOFF_MULTIPLIER = exports.RECONNECT_DELAY_MS = exports.MAX_RECONNECT_ATTEMPTS = exports.CONFIG_CACHE_TTL_MS = exports.TASK_CLEANUP_INTERVAL_MS = exports.MAX_PENDING_TASKS = exports.WS_INIT_DELAY_MS = exports.MAX_SAFE_TIMEOUT_SEC = exports.DEFAULT_TIMEOUT_SEC = void 0;
// 超时相关
exports.DEFAULT_TIMEOUT_SEC = 12 * 3600; // 12 小时
exports.MAX_SAFE_TIMEOUT_SEC = 2147483; // 2^31-1 ms / 1000，Node 不溢出
exports.WS_INIT_DELAY_MS = 2000; // WebSocket 初始化延迟
// 任务管理
exports.MAX_PENDING_TASKS = 100; // 最大待处理任务数
exports.TASK_CLEANUP_INTERVAL_MS = 60000; // 任务清理间隔（1分钟）
// 配置缓存
exports.CONFIG_CACHE_TTL_MS = 5000; // 配置缓存时间（5秒）
// 重连相关
exports.MAX_RECONNECT_ATTEMPTS = 5; // 最大重连次数
exports.RECONNECT_DELAY_MS = 3000; // 重连延迟
exports.RECONNECT_BACKOFF_MULTIPLIER = 1.5; // 重连退避倍数
// 消息过滤
exports.MESSAGE_TIME_BUFFER_MS = 2000; // 消息时间缓冲（2秒）
// 仓库信息
exports.REPO_URL = 'https://github.com/ZiweiAxis/qingniao.git';
// 会话提示
exports.SESSION_HINT_CONTINUE = '用户未说「结束」或「切回」前请继续循环发消息，勿退出飞书会话。';
exports.SESSION_HINT_TIMEOUT = '本轮超时，请执行 npx @zwa/qingniao --heartbeat [--timeout=N] 重新拉起会话；若返回仍为 timeout，继续再发 --heartbeat，勿只发一次就停，勿退出。';
// 配对成功引导
exports.FEISHU_PAIRING_SUCCESS_GUIDE = '配对成功！已自动保存本会话，下次在 AI 编辑器（Cursor/Claude Code/Codex）里你只要说「切换到飞书」「切到飞书」或「离开一会」，就可以把对话切到这里继续和青鸟对话。会话结束时，点击消息下方的「结束会话」按钮即可。';
// 文件名
exports.CHANNEL_FILE = 'message-bridge-channel.json';
exports.STOP_HOOK_CMD = 'npx @zwa/qingniao cursor-stop-hook';
