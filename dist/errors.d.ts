/**
 * 自定义错误类型
 */
export declare class MessageBridgeError extends Error {
    code: string;
    details?: Record<string, unknown> | undefined;
    constructor(message: string, code: string, details?: Record<string, unknown> | undefined);
}
export declare class ConfigError extends MessageBridgeError {
    constructor(message: string, details?: Record<string, unknown>);
}
export declare class ConnectionError extends MessageBridgeError {
    constructor(message: string, details?: Record<string, unknown>);
}
export declare class TimeoutError extends MessageBridgeError {
    constructor(message: string, details?: Record<string, unknown>);
}
export declare class ValidationError extends MessageBridgeError {
    constructor(message: string, details?: Record<string, unknown>);
}
export declare class TaskError extends MessageBridgeError {
    constructor(message: string, details?: Record<string, unknown>);
}
