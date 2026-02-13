/**
 * Cursor 下 .cursor/hooks.json 的 stop hook 注册/注销，供 CLI 与测试使用。
 */
/** 若项目根下 .cursor/hooks.json 没有本 skill 的 stop hook，则写入；已有则不动。 */
export declare function ensureStopHook(root: string): void;
/** 从 .cursor/hooks.json 移除本 skill 的 stop hook（用户切回/结束时调用）。 */
export declare function unregisterStopHook(root: string): void;
