"use strict";
/**
 * 自定义错误类型
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.TaskError = exports.ValidationError = exports.TimeoutError = exports.ConnectionError = exports.ConfigError = exports.MessageBridgeError = void 0;
class MessageBridgeError extends Error {
    constructor(message, code, details) {
        super(message);
        this.code = code;
        this.details = details;
        this.name = 'MessageBridgeError';
        Error.captureStackTrace(this, this.constructor);
    }
}
exports.MessageBridgeError = MessageBridgeError;
class ConfigError extends MessageBridgeError {
    constructor(message, details) {
        super(message, 'CONFIG_ERROR', details);
        this.name = 'ConfigError';
    }
}
exports.ConfigError = ConfigError;
class ConnectionError extends MessageBridgeError {
    constructor(message, details) {
        super(message, 'CONNECTION_ERROR', details);
        this.name = 'ConnectionError';
    }
}
exports.ConnectionError = ConnectionError;
class TimeoutError extends MessageBridgeError {
    constructor(message, details) {
        super(message, 'TIMEOUT_ERROR', details);
        this.name = 'TimeoutError';
    }
}
exports.TimeoutError = TimeoutError;
class ValidationError extends MessageBridgeError {
    constructor(message, details) {
        super(message, 'VALIDATION_ERROR', details);
        this.name = 'ValidationError';
    }
}
exports.ValidationError = ValidationError;
class TaskError extends MessageBridgeError {
    constructor(message, details) {
        super(message, 'TASK_ERROR', details);
        this.name = 'TaskError';
    }
}
exports.TaskError = TaskError;
