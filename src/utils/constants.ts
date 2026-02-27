/**
 * 常量定义
 */

// 超时相关
export const DEFAULT_TIMEOUT_SEC = 12 * 3600; // 12 小时
export const MAX_SAFE_TIMEOUT_SEC = 2147483; // 2^31-1 ms / 1000，Node 不溢出
export const WS_INIT_DELAY_MS = 2000; // WebSocket 初始化延迟

// 任务管理
export const MAX_PENDING_TASKS = 100; // 最大待处理任务数
export const TASK_CLEANUP_INTERVAL_MS = 60000; // 任务清理间隔（1分钟）

// 配置缓存
export const CONFIG_CACHE_TTL_MS = 5000; // 配置缓存时间（5秒）

// 重连相关
export const MAX_RECONNECT_ATTEMPTS = 5; // 最大重连次数
export const RECONNECT_DELAY_MS = 3000; // 重连延迟
export const RECONNECT_BACKOFF_MULTIPLIER = 1.5; // 重连退避倍数

// 消息过滤
export const MESSAGE_TIME_BUFFER_MS = 2000; // 消息时间缓冲（2秒）

// 仓库信息
export const REPO_URL = 'https://github.com/ZiweiAxis/qingniao.git';

// 会话提示
export const SESSION_HINT_CONTINUE = '用户未说「结束」或「切回」前请继续循环发消息，勿退出飞书会话。';
export const SESSION_HINT_TIMEOUT = '本轮超时，请执行 npx @zwa/qingniao --heartbeat [--timeout=N] 重新拉起会话；若返回仍为 timeout，继续再发 --heartbeat，勿只发一次就停，勿退出。';

// 配对成功引导
export const FEISHU_PAIRING_SUCCESS_GUIDE = '配对成功！已自动保存本会话，下次在 Cursor/Codex 里你只要说「切换到飞书」「切到飞书」或「离开一会」，就可以把对话切到这里继续和青鸟对话；说「结束」或「切回」则切回。';

// 文件名
export const CHANNEL_FILE = 'message-bridge-channel.json';
export const STOP_HOOK_CMD = 'npx @zwa/qingniao cursor-stop-hook';
