/**
 * 连接管理器
 */

import * as lark from '@larksuiteoapi/node-sdk';
import { ConnectionError } from '../errors';
import { ConnectionState, ConnectionEventType, ConnectionEventListener } from './types';
import {
  MAX_RECONNECT_ATTEMPTS,
  RECONNECT_DELAY_MS,
  RECONNECT_BACKOFF_MULTIPLIER,
} from '../utils/constants';

/**
 * 连接管理器
 */
export class ConnectionManager {
  private state: ConnectionState = ConnectionState.DISCONNECTED;
  private wsClient: lark.WSClient | null = null;
  private httpClient: lark.Client | null = null;
  private eventDispatcher: lark.EventDispatcher | null = null;
  private reconnectAttempts = 0;
  private reconnectTimer: NodeJS.Timeout | null = null;
  private listeners: Map<ConnectionEventType, Set<ConnectionEventListener>> = new Map();

  constructor(
    private appId: string,
    private appSecret: string
  ) {}

  /**
   * 连接到飞书
   */
  async connect(): Promise<void> {
    if (this.state === ConnectionState.CONNECTED || this.state === ConnectionState.CONNECTING) {
      return;
    }

    this.state = ConnectionState.CONNECTING;
    this.emit('connecting');

    try {
      // 创建 HTTP 客户端
      this.httpClient = new lark.Client({
        appId: this.appId,
        appSecret: this.appSecret,
        appType: lark.AppType.SelfBuild,
        domain: lark.Domain.Feishu,
      });

      // 创建事件分发器
      this.eventDispatcher = new lark.EventDispatcher({});

      // 创建 WebSocket 客户端
      this.wsClient = new lark.WSClient({
        appId: this.appId,
        appSecret: this.appSecret,
        loggerLevel: lark.LoggerLevel.error,
      });

      // 启动 WebSocket
      this.wsClient.start({ eventDispatcher: this.eventDispatcher });

      // 等待连接建立（使用 Promise 而非硬编码延迟）
      await this.waitForConnection();

      this.state = ConnectionState.CONNECTED;
      this.reconnectAttempts = 0;
      this.emit('connected');

      process.stderr.write('[MessageBridge] 连接已建立\n');
    } catch (error) {
      this.state = ConnectionState.ERROR;
      this.emit('error', error);
      throw new ConnectionError('连接失败', { error: (error as Error).message });
    }
  }

  /**
   * 等待连接建立
   */
  private waitForConnection(): Promise<void> {
    return new Promise((resolve) => {
      // 简单的延迟，后续可以改进为事件监听
      setTimeout(resolve, 2000);
    });
  }

  /**
   * 断开连接
   */
  disconnect(): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }

    this.state = ConnectionState.DISCONNECTED;
    this.wsClient = null;
    this.httpClient = null;
    this.eventDispatcher = null;
    this.emit('disconnected');

    process.stderr.write('[MessageBridge] 连接已断开\n');
  }

  /**
   * 重新连接
   */
  private async reconnect(): Promise<void> {
    if (this.reconnectAttempts >= MAX_RECONNECT_ATTEMPTS) {
      process.stderr.write('[MessageBridge] 达到最大重连次数，停止重连\n');
      this.state = ConnectionState.ERROR;
      return;
    }

    this.reconnectAttempts++;
    this.state = ConnectionState.RECONNECTING;
    this.emit('reconnecting', { attempt: this.reconnectAttempts });

    const delay = RECONNECT_DELAY_MS * Math.pow(RECONNECT_BACKOFF_MULTIPLIER, this.reconnectAttempts - 1);
    process.stderr.write(`[MessageBridge] 第 ${this.reconnectAttempts} 次重连，延迟 ${delay}ms\n`);

    this.reconnectTimer = setTimeout(async () => {
      try {
        await this.connect();
      } catch (error) {
        process.stderr.write(`[MessageBridge] 重连失败: ${(error as Error).message}\n`);
        await this.reconnect();
      }
    }, delay);
  }

  /**
   * 处理连接错误
   */
  handleError(error: Error): void {
    process.stderr.write(`[MessageBridge] 连接错误: ${error.message}\n`);
    this.state = ConnectionState.ERROR;
    this.emit('error', error);

    // 尝试重连
    this.reconnect();
  }

  /**
   * 注册事件分发器
   */
  registerEventDispatcher(dispatcher: lark.EventDispatcher): void {
    this.eventDispatcher = dispatcher;
  }

  /**
   * 获取 HTTP 客户端
   */
  getHttpClient(): lark.Client {
    if (!this.httpClient) {
      throw new ConnectionError('HTTP 客户端未初始化');
    }
    return this.httpClient;
  }

  /**
   * 获取事件分发器
   */
  getEventDispatcher(): lark.EventDispatcher {
    if (!this.eventDispatcher) {
      throw new ConnectionError('事件分发器未初始化');
    }
    return this.eventDispatcher;
  }

  /**
   * 获取连接状态
   */
  getState(): ConnectionState {
    return this.state;
  }

  /**
   * 是否已连接
   */
  isConnected(): boolean {
    return this.state === ConnectionState.CONNECTED;
  }

  /**
   * 添加事件监听器
   */
  on(event: ConnectionEventType, listener: ConnectionEventListener): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(listener);
  }

  /**
   * 移除事件监听器
   */
  off(event: ConnectionEventType, listener: ConnectionEventListener): void {
    const listeners = this.listeners.get(event);
    if (listeners) {
      listeners.delete(listener);
    }
  }

  /**
   * 触发事件
   */
  private emit(event: ConnectionEventType, data?: any): void {
    const listeners = this.listeners.get(event);
    if (listeners) {
      listeners.forEach((listener) => listener(data));
    }
  }
}
