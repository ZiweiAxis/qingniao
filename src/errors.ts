/**
 * 自定义错误类型
 */

export class MessageBridgeError extends Error {
  constructor(
    message: string,
    public code: string,
    public details?: Record<string, unknown>
  ) {
    super(message);
    this.name = 'MessageBridgeError';
    Error.captureStackTrace(this, this.constructor);
  }
}

export class ConfigError extends MessageBridgeError {
  constructor(message: string, details?: Record<string, unknown>) {
    super(message, 'CONFIG_ERROR', details);
    this.name = 'ConfigError';
  }
}

export class ConnectionError extends MessageBridgeError {
  constructor(message: string, details?: Record<string, unknown>) {
    super(message, 'CONNECTION_ERROR', details);
    this.name = 'ConnectionError';
  }
}

export class TimeoutError extends MessageBridgeError {
  constructor(message: string, details?: Record<string, unknown>) {
    super(message, 'TIMEOUT_ERROR', details);
    this.name = 'TimeoutError';
  }
}

export class ValidationError extends MessageBridgeError {
  constructor(message: string, details?: Record<string, unknown>) {
    super(message, 'VALIDATION_ERROR', details);
    this.name = 'ValidationError';
  }
}

export class TaskError extends MessageBridgeError {
  constructor(message: string, details?: Record<string, unknown>) {
    super(message, 'TASK_ERROR', details);
    this.name = 'TaskError';
  }
}
