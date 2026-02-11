/**
 * Feishu Platform Adapter - WebSocket 长链接版（基于 sentinel-ai 实现）
 */

import type { TaskInfo } from "./types.ts";
import { messageQueue } from "./queue.ts";
import WebSocket from "ws";

// 配置
const config = {
  appId: process.env.FEISHU_APP_ID || process.env.DITING_FEISHU_APP_ID || "",
  appSecret: process.env.FEISHU_APP_SECRET || process.env.DITING_FEISHU_APP_SECRET || "",
  chatId: process.env.FEISHU_CHAT_ID || process.env.DITING_FEISHU_CHAT_ID || "",
};

// Token 管理
let accessToken: string | null = null;
let tokenExpiry: number = 0;

async function getAccessToken(): Promise<string> {
  if (accessToken && Date.now() < tokenExpiry) {
    return accessToken;
  }

  const response = await fetch(
    "https://open.feishu.cn/open-apis/auth/v3/tenant_access_token/internal",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ app_id: config.appId, app_secret: config.appSecret }),
    }
  );

  const data = await response.json();
  if (data.code !== 0) {
    throw new Error(`Failed to get token: ${data.msg}`);
  }

  accessToken = data.tenant_access_token;
  tokenExpiry = Date.now() + (data.expire - 300) * 1000; // 提前5分钟刷新

  return accessToken;
}

// WebSocket 连接管理
class FeishuWebSocket {
  private ws: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private heartbeatInterval: NodeJS.Timeout | null = null;
  private messageHandlers: Map<string, (data: any) => void> = new Map();

  async connect(): Promise<void> {
    const token = await getAccessToken();
    
    // 飞书 WebSocket 端点
    const wsUrl = `wss://open.feishu.cn/open-apis/ws/v1/connect?token=${token}`;
    
    return new Promise((resolve, reject) => {
      this.ws = new WebSocket(wsUrl);
      
      this.ws.on("open", () => {
        console.log("[FeishuWS] 连接成功");
        this.reconnectAttempts = 0;
        this.startHeartbeat();
        resolve();
      });
      
      this.ws.on("message", (data: Buffer) => {
        try {
          const message = JSON.parse(data.toString());
          this.handleMessage(message);
        } catch (error) {
          console.error("[FeishuWS] 消息解析失败:", error);
        }
      });
      
      this.ws.on("close", (code) => {
        console.log(`[FeishuWS] 连接关闭: ${code}`);
        this.stopHeartbeat();
        this.reconnect();
      });
      
      this.ws.on("error", (error) => {
        console.error("[FeishuWS] 错误:", error);
        reject(error);
      });
    });
  }

  private handleMessage(message: any): void {
    console.log("[FeishuWS] 收到消息:", JSON.stringify(message).substring(0, 200));
    
    // 处理不同类型的消息
    if (message.type === "im.message.receive_v1") {
      this.handleReceiveMessage(message.data);
    }
    
    // 调用注册的处理器
    const handler = this.messageHandlers.get(message.type);
    if (handler) {
      handler(message.data);
    }
  }

  private handleReceiveMessage(data: any): void {
    try {
      const message = data.message;
      const content = JSON.parse(message.content);
      const senderId = message.sender?.sender_id?.open_id || message.sender?.sender_id?.user_id;
      const text = content.text || "";
      
      console.log(`[FeishuWS] 收到用户消息: ${text}`);
      
      // 查找等待回复的任务
      const tasks = messageQueue.getAllTasks().filter(
        (t) => t.status === "pending" && t.platform === "feishu"
      );
      
      if (tasks.length > 0) {
        // 简单匹配：回复最近的任务
        const task = tasks[0];
        messageQueue.resolveTask(task.taskId, text, "用户", senderId);
        console.log(`[FeishuWS] 任务 ${task.taskId} 已解决`);
      }
    } catch (error) {
      console.error("[FeishuWS] 处理消息失败:", error);
    }
  }

  onMessage(type: string, handler: (data: any) => void): void {
    this.messageHandlers.set(type, handler);
  }

  private startHeartbeat(): void {
    this.heartbeatInterval = setInterval(() => {
      if (this.ws && this.ws.readyState === WebSocket.OPEN) {
        this.ws.ping();
      }
    }, 30000);
  }

  private stopHeartbeat(): void {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
  }

  private reconnect(): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error("[FeishuWS] 重连次数耗尽");
      return;
    }
    
    this.reconnectAttempts++;
    const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 30000);
    
    console.log(`[FeishuWS] ${delay}ms 后重连 (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
    
    setTimeout(() => {
      this.connect().catch(console.error);
    }, delay);
  }

  close(): void {
    this.stopHeartbeat();
    if (this.ws) {
      this.ws.close();
    }
  }
}

// 单例 WebSocket
let wsInstance: FeishuWebSocket | null = null;

export class FeishuAdapter {
  private ws: FeishuWebSocket;

  constructor() {
    if (!wsInstance) {
      wsInstance = new FeishuWebSocket();
    }
    this.ws = wsInstance;
  }

  async connect(): Promise<void> {
    await this.ws.connect();
  }

  async sendMessage(task: TaskInfo): Promise<string> {
    const token = await getAccessToken();
    
    // 关键：receive_id_type 放在 URL 查询参数
    const url = "https://open.feishu.cn/open-apis/im/v1/messages?receive_id_type=chat_id";
    
    const response = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        receive_id: task.groupId || config.chatId,
        msg_type: "text",
        content: JSON.stringify({ text: task.message }),
      }),
    });
    
    const data = await response.json();
    
    if (data.code !== 0) {
      throw new Error(`发送消息失败: ${data.msg}`);
    }
    
    return data.data.message_id;
  }

  onReply(callback: (reply: string, userId: string) => void): void {
    this.ws.onMessage("im.message.receive_v1", (data) => {
      try {
        const message = data.message;
        const content = JSON.parse(message.content);
        const senderId = message.sender?.sender_id?.open_id || message.sender?.sender_id?.user_id;
        callback(content.text, senderId);
      } catch (error) {
        console.error("[FeishuAdapter] 处理回复失败:", error);
      }
    });
  }
}

export function getFeishuAdapter(): FeishuAdapter {
  return new FeishuAdapter();
}
