/**
 * IDE stop-hook 命令处理器
 * 支持 Cursor、Claude Code、Codex 等 AI 编辑器
 */
/**
 * 执行 IDE stop-hook 命令
 * 当 AI 编辑器停止时触发，发送带"结束会话"按钮的消息
 */
export declare function cursorStopHookCommand(argv: string[]): Promise<void>;
