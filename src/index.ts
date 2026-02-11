/**
 * MessageBridge Skill - 主入口（支持 WebSocket）
 */

import type { NotifyParams, NotifyResult, SendParams, SendResult } from "./types";
import { messageQueue } from "./queue";
import { getFeishuAdapter } from "./platforms/feishu";

// 初始化 WebSocket 连接
let wsInitialized = false;

async function ensureWebSocketConnected() {
  if (!wsInitialized) {
    const adapter = getFeishuAdapter();
    await adapter.connect();
    wsInitialized = true;
    console.log("[MessageBridge] WebSocket 已连接");
  }
}

/**
 * 发送通知并等待用户回复
 */
export async function notify(params: NotifyParams): Promise<NotifyResult> {
  const {
    message,
    platform = "feishu",
    userId,
    groupId,
    timeout = 3600,
    priority = "normal",
    messageType = "text",
    title,
  } = params;

  try {
    // 确保 WebSocket 已连接
    await ensureWebSocketConnected();

    // 创建任务
    const task = messageQueue.createTask({
      message,
      platform,
      userId,
      groupId,
      timeout,
      priority,
      messageType,
      title,
    });

    // 发送消息
    const adapter = getFeishuAdapter();
    const messageId = await adapter.sendMessage(task);
    
    console.log(`[MessageBridge] 消息已发送: ${messageId}`);

    // 等待用户回复
    try {
      const completedTask = await messageQueue.waitForReply(task.taskId, timeout);

      return {
        success: true,
        reply: completedTask.reply,
        replyUser: completedTask.replyUser,
        replyUserId: completedTask.replyUserId,
        timestamp: completedTask.repliedAt?.toISOString(),
        status: "replied",
      };
    } catch (error) {
      // 超时
      return {
        success: true,
        status: "timeout",
        error: "Timeout waiting for user reply",
      };
    }
  } catch (error) {
    return {
      success: false,
      status: "error",
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

/**
 * 仅发送通知，不等待回复
 */
export async function send(params: SendParams): Promise<SendResult> {
  const {
    message,
    platform = "feishu",
    userId,
    groupId,
    messageType = "text",
    title,
  } = params;

  try {
    const task = messageQueue.createTask({
      message,
      platform,
      userId,
      groupId,
      timeout: 0,
      priority: "normal",
      messageType,
      title,
    });

    const adapter = getFeishuAdapter();
    const messageId = await adapter.sendMessage(task);

    return {
      success: true,
      messageId,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

/**
 * 初始化 WebSocket 连接（可选，notify/send 会自动调用）
 */
export async function init(): Promise<void> {
  await ensureWebSocketConnected();
}

export const name = "messageBridge";
export const description = "AI 智能体的消息桥梁，连接飞书/钉钉/企微，实现异步通知与确认";

export default {
  name,
  description,
  notify,
  send,
  init,
};
