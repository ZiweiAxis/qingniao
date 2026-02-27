/**
 * 连接状态枚举
 */

export enum ConnectionState {
  DISCONNECTED = 'disconnected',
  CONNECTING = 'connecting',
  CONNECTED = 'connected',
  RECONNECTING = 'reconnecting',
  ERROR = 'error',
}

/**
 * 连接事件类型
 */
export type ConnectionEventType = 'connected' | 'connecting' | 'disconnected' | 'error' | 'reconnecting' | 'message';

/**
 * 连接事件监听器
 */
export type ConnectionEventListener = (data?: any) => void;
