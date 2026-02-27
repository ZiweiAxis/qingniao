/**
 * CLI 辅助函数
 */
/**
 * 从某目录向上查找包含 IDE 配置目录的项目根
 * 支持 .cursor、.claude、.codex 等
 */
export declare function findCursorRoot(startDir: string): string | null;
/**
 * 从 argv 解析 --dir= 或 --dir 作为项目根，否则从 cwd 查找
 */
export declare function getCursorRoot(argv: string[]): string | null;
/**
 * 解析超时参数
 */
export declare function parseTimeout(argv: string[]): number;
/**
 * 从 argv 获取消息内容
 */
export declare function getMessageFromArgv(argv: string[], afterSubcommand: number): string;
/**
 * 解析 config set 参数
 */
export declare function parseConfigSetArgs(argv: string[]): {
    appId?: string;
    appSecret?: string;
    chatId?: string;
};
/**
 * 生成 session hint
 */
export declare function sessionHint(status: string): string;
/**
 * 打印会话提醒
 */
export declare function printSessionReminder(): void;
