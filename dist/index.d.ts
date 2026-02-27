/**
 * MessageBridge Skill - 统一实现（TypeScript）
 * 使用飞书 WebSocket 长连接。配置：环境变量 或 ~/.message-bridge/config.json
 */
export interface NotifyParams {
    message: string;
    platform?: string;
    userId?: string;
    groupId?: string;
    timeout?: number;
}
export interface NotifyResult {
    success: boolean;
    status: "replied" | "timeout" | "error";
    reply?: string;
    replyUser?: string;
    timestamp?: string;
    error?: string;
}
export interface SendParams {
    message: string;
    platform?: string;
    userId?: string;
    groupId?: string;
    useInteractiveCard?: boolean;
}
export interface SendResult {
    success: boolean;
    messageId?: string;
    error?: string;
}
export declare function getConfig(): {
    appId: string;
    appSecret: string;
    chatId: string;
};
export declare function setFirstMessageResolver(resolver: (chatId: string) => void): void;
/** 仅等待下一条消息，不向用户推送任何内容（用于心跳）。超时也 resolve 为 status "timeout"，与 notify 一致。 */
export declare function waitNextMessage(timeoutSec: number): Promise<NotifyResult>;
export declare function init(): Promise<void>;
export declare function notify(params: NotifyParams): Promise<NotifyResult>;
export declare function send(params: SendParams): Promise<SendResult>;
export declare function close(): void;
export declare function runConnectMode(): Promise<string>;
export declare const name = "messageBridge";
export declare const description = "AI \u667A\u80FD\u4F53\u7684\u6D88\u606F\u6865\u6881\uFF0C\u8FDE\u63A5\u98DE\u4E66/\u9489\u9489/\u4F01\u5FAE\uFF0C\u5B9E\u73B0\u5F02\u6B65\u901A\u77E5\u4E0E\u786E\u8BA4";
declare const _default: {
    init: typeof init;
    notify: typeof notify;
    send: typeof send;
    close: typeof close;
    getConfig: typeof getConfig;
    runConnectMode: typeof runConnectMode;
    setFirstMessageResolver: typeof setFirstMessageResolver;
    waitNextMessage: typeof waitNextMessage;
    name: string;
    description: string;
};
export default _default;
