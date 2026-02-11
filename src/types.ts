/**
 * MessageBridge Skill - 核心类型定义
 */

export interface NotifyParams {
  /** 消息内容 */
  message: string;
  
  /** 平台：feishu | dingtalk | wecom */
  platform?: "feishu" | "dingtalk" | "wecom";
  
  /** 目标用户ID（可选，默认广播） */
  userId?: string;
  
  /** 目标群聊ID（可选） */
  groupId?: string;
  
  /** 等待超时时间（秒），默认 3600 */
  timeout?: number;
  
  /** 消息优先级：low | normal | high */
  priority?: "low" | "normal" | "high";
  
  /** 消息类型：text | card */
  messageType?: "text" | "card";
  
  /** 额外标题（card 模式） */
  title?: string;
}

export interface NotifyResult {
  /** 是否成功发送 */
  success: boolean;
  
  /** 用户回复内容 */
  reply?: string;
  
  /** 回复用户名称 */
  replyUser?: string;
  
  /** 回复用户ID */
  replyUserId?: string;
  
  /** 回复时间 */
  timestamp?: string;
  
  /** 状态：replied | timeout | error */
  status: "replied" | "timeout" | "error";
  
  /** 错误信息（如果失败） */
  error?: string;
}

export interface SendParams {
  message: string;
  platform?: "feishu" | "dingtalk" | "wecom";
  userId?: string;
  groupId?: string;
  messageType?: "text" | "card";
  title?: string;
}

export interface SendResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

export interface TaskInfo {
  taskId: string;
  message: string;
  platform: string;
  userId?: string;
  groupId?: string;
  timeout: number;
  priority: string;
  messageType: string;
  title?: string;
  createdAt: Date;
  status: "pending" | "replied" | "timeout" | "error";
  reply?: string;
  replyUser?: string;
  replyUserId?: string;
  repliedAt?: Date;
}

export interface PlatformConfig {
  feishu?: {
    appId: string;
    appSecret: string;
  };
  dingtalk?: {
    appKey: string;
    appSecret: string;
  };
  wecom?: {
    corpId: string;
    agentId: string;
    secret: string;
  };
}
