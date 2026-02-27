/**
 * notify 命令处理器（发送并等待回复）
 */
/**
 * 执行 notify 命令（发送并等待回复）
 */
export declare function notifyCommand(argv: string[]): Promise<void>;
/**
 * 执行 heartbeat 命令（重新拉起会话）
 */
export declare function heartbeatCommand(argv: string[]): Promise<void>;
