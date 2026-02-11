/**
 * MessageBridge Skill - 完整实现（修复版）
 * 
 * 使用飞书 WebSocket 长链接实现消息发送和接收
 */

const lark = require("@larksuiteoapi/node-sdk");

// 配置
const config = {
  appId: process.env.FEISHU_APP_ID || process.env.DITING_FEISHU_APP_ID || "",
  appSecret: process.env.FEISHU_APP_SECRET || process.env.DITING_FEISHU_APP_SECRET || "",
  chatId: process.env.FEISHU_CHAT_ID || process.env.DITING_FEISHU_CHAT_ID || "",
};

// 全局客户端
let httpClient = null;
let wsClient = null;
let eventDispatcher = null;
let isInitialized = false;

// 待处理的任务队列
const pendingTasks = new Map();

/**
 * 初始化 MessageBridge
 */
async function init() {
  if (isInitialized) {
    return;
  }

  console.log("[MessageBridge] 初始化...");

  // 创建 HTTP 客户端
  httpClient = new lark.Client({
    appId: config.appId,
    appSecret: config.appSecret,
    appType: lark.AppType.SelfBuild,
    domain: lark.Domain.Feishu,
  });

  // 创建事件处理器
  eventDispatcher = new lark.EventDispatcher({}).register({
    "im.message.receive_v1": async (data) => {
      const message = data.message;
      
      try {
        const content = JSON.parse(message.content);
        const senderId = message.sender?.sender_id?.open_id || message.sender?.sender_id?.user_id || "unknown";
        const text = content.text || "";
        
        console.log(`[MessageBridge] 收到消息: ${text} (from ${senderId})`);
        
        // 查找等待回复的任务
        for (const [taskId, task] of pendingTasks.entries()) {
          if (task.status === "pending") {
            // 简单匹配：回复最近的任务
            task.reply = text;
            task.replyUser = senderId;
            task.status = "resolved";
            task.repliedAt = new Date();
            
            // 触发回调
            if (task.resolve) {
              task.resolve(task);
            }
            
            console.log(`[MessageBridge] 任务 ${taskId} 已解决`);
            break;
          }
        }
      } catch (error) {
        console.error("[MessageBridge] 处理消息失败:", error.message);
      }
      
      return { code: 0 };
    },
  });

  // 创建 WebSocket 客户端
  wsClient = new lark.WSClient({
    appId: config.appId,
    appSecret: config.appSecret,
    loggerLevel: lark.LoggerLevel.error, // 只显示错误
  });

  // 启动 WebSocket
  wsClient.start({ eventDispatcher });

  // 等待连接建立
  await new Promise(resolve => setTimeout(resolve, 2000));

  isInitialized = true;
  console.log("[MessageBridge] 初始化完成");
}

/**
 * 发送消息并等待回复
 */
async function notify(params) {
  const {
    message,
    platform = "feishu",
    userId,
    groupId,
    timeout = 60, // 默认 60 秒超时
  } = params;

  // 确保已初始化
  await init();

  // 创建任务
  const taskId = `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  const task = {
    taskId,
    message,
    platform,
    userId,
    groupId,
    timeout,
    status: "pending",
    createdAt: new Date(),
    reply: null,
    replyUser: null,
    repliedAt: null,
  };

  pendingTasks.set(taskId, task);

  try {
    // 确定接收者类型和 ID
    const targetId = groupId || config.chatId || userId;
    const receiveIdType = groupId || config.chatId ? "chat_id" : "open_id";
    
    // 发送消息
    console.log(`[MessageBridge] 发送消息 (${receiveIdType}): ${message}`);
    const res = await httpClient.im.message.create({
      params: {
        receive_id_type: receiveIdType,
      },
      data: {
        receive_id: targetId,
        msg_type: "text",
        content: JSON.stringify({ text: message }),
      },
    });

    if (res.code !== 0) {
      throw new Error(`发送失败: ${res.msg}`);
    }

    console.log(`[MessageBridge] 消息已发送: ${res.data.message_id}`);

    // 等待回复
    const result = await new Promise((resolve, reject) => {
      task.resolve = resolve;
      task.reject = reject;

      // 超时处理
      setTimeout(() => {
        if (task.status === "pending") {
          task.status = "timeout";
          reject(new Error("Timeout waiting for reply"));
        }
      }, timeout * 1000);
    });

    // 清理任务
    pendingTasks.delete(taskId);

    return {
      success: true,
      reply: result.reply,
      replyUser: result.replyUser,
      timestamp: result.repliedAt?.toISOString(),
      status: "replied",
    };
  } catch (error) {
    // 清理任务
    pendingTasks.delete(taskId);

    if (error.message.includes("Timeout")) {
      return {
        success: true,
        status: "timeout",
        error: "Timeout waiting for user reply",
      };
    }

    return {
      success: false,
      status: "error",
      error: error.message,
    };
  }
}

/**
 * 仅发送消息，不等待回复
 */
async function send(params) {
  const {
    message,
    platform = "feishu",
    userId,
    groupId,
  } = params;

  // 确保已初始化
  await init();

  try {
    // 确定接收者类型和 ID
    const targetId = groupId || config.chatId || userId;
    const receiveIdType = groupId || config.chatId ? "chat_id" : "open_id";
    
    console.log(`[MessageBridge] 发送消息 (${receiveIdType}): ${message}`);
    const res = await httpClient.im.message.create({
      params: {
        receive_id_type: receiveIdType,
      },
      data: {
        receive_id: targetId,
        msg_type: "text",
        content: JSON.stringify({ text: message }),
      },
    });

    if (res.code !== 0) {
      throw new Error(`发送失败: ${res.msg}`);
    }

    console.log(`[MessageBridge] 消息已发送: ${res.data.message_id}`);

    return {
      success: true,
      messageId: res.data.message_id,
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
    };
  }
}

/**
 * 关闭连接
 */
function close() {
  if (wsClient) {
    // WebSocket 客户端没有 close 方法，会自动管理
    console.log("[MessageBridge] 关闭连接");
  }
  isInitialized = false;
}

module.exports = {
  init,
  notify,
  send,
  close,
  name: "messageBridge",
  description: "AI 智能体的消息桥梁，连接飞书/钉钉/企微，实现异步通知与确认",
};
