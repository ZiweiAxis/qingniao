/**
 * MessageBridge - 异步非阻塞版本
 * 
 * 解决 AI 智能体调用 Skill 时的阻塞问题
 */

const lark = require("@larksuiteoapi/node-sdk");
const EventEmitter = require("events");

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

// 任务队列
const tasks = new Map();

// 事件发射器
const eventEmitter = new EventEmitter();

/**
 * 任务状态
 */
class Task {
  constructor(options) {
    this.id = `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    this.message = options.message;
    this.timeout = options.timeout || 60;
    this.status = "pending";  // pending | replied | timeout | cancelled
    this.createdAt = new Date();
    this.reply = null;
    this.replyUser = null;
    this.repliedAt = null;
    this.messageId = null;
    
    // 回调函数
    this.onReply = options.onReply;
    this.onTimeout = options.onTimeout;
    this.onError = options.onError;
    
    // 超时定时器
    this.timeoutTimer = null;
  }

  toJSON() {
    return {
      id: this.id,
      message: this.message,
      status: this.status,
      createdAt: this.createdAt,
      reply: this.reply,
      replyUser: this.replyUser,
      repliedAt: this.repliedAt,
      messageId: this.messageId,
    };
  }
}

/**
 * 初始化
 */
async function init() {
  if (isInitialized) {
    return;
  }

  console.log("[MessageBridge-Async] 初始化...");

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
        
        console.log(`[MessageBridge-Async] 收到消息: ${text}`);
        
        // 查找等待回复的任务
        for (const [taskId, task] of tasks.entries()) {
          if (task.status === "pending") {
            // 匹配任务
            task.status = "replied";
            task.reply = text;
            task.replyUser = senderId;
            task.repliedAt = new Date();
            
            // 清除超时定时器
            if (task.timeoutTimer) {
              clearTimeout(task.timeoutTimer);
            }
            
            // 触发回调
            if (task.onReply) {
              try {
                await task.onReply(text, senderId);
              } catch (error) {
                console.error("[MessageBridge-Async] 回调错误:", error);
              }
            }
            
            // 触发事件
            eventEmitter.emit("reply", taskId, text, senderId);
            
            console.log(`[MessageBridge-Async] 任务 ${taskId} 已完成`);
            break;
          }
        }
      } catch (error) {
        console.error("[MessageBridge-Async] 处理消息失败:", error.message);
      }
      
      return { code: 0 };
    },
  });

  // 创建 WebSocket 客户端
  wsClient = new lark.WSClient({
    appId: config.appId,
    appSecret: config.appSecret,
    loggerLevel: lark.LoggerLevel.error,
  });

  // 启动 WebSocket
  wsClient.start({ eventDispatcher });

  // 等待连接建立
  await new Promise(resolve => setTimeout(resolve, 2000));

  isInitialized = true;
  console.log("[MessageBridge-Async] 初始化完成");
}

/**
 * 异步发送通知（非阻塞）
 * 
 * @param {Object} options - 配置选项
 * @param {string} options.message - 消息内容
 * @param {number} options.timeout - 超时时间（秒）
 * @param {Function} options.onReply - 收到回复时的回调
 * @param {Function} options.onTimeout - 超时时的回调
 * @param {Function} options.onError - 错误时的回调
 * @returns {Promise<string>} 任务ID
 */
async function notifyAsync(options) {
  await init();

  // 创建任务
  const task = new Task(options);
  tasks.set(task.id, task);

  try {
    // 发送消息
    console.log(`[MessageBridge-Async] 发送消息: ${task.message}`);
    
    const targetId = config.chatId;
    const receiveIdType = "chat_id";
    
    const res = await httpClient.im.message.create({
      params: { receive_id_type: receiveIdType },
      data: {
        receive_id: targetId,
        msg_type: "text",
        content: JSON.stringify({ text: task.message }),
      },
    });

    if (res.code !== 0) {
      throw new Error(`发送失败: ${res.msg}`);
    }

    task.messageId = res.data.message_id;
    console.log(`[MessageBridge-Async] 消息已发送: ${task.messageId}`);

    // 设置超时定时器
    task.timeoutTimer = setTimeout(async () => {
      if (task.status === "pending") {
        task.status = "timeout";
        
        // 触发超时回调
        if (task.onTimeout) {
          try {
            await task.onTimeout();
          } catch (error) {
            console.error("[MessageBridge-Async] 超时回调错误:", error);
          }
        }
        
        // 触发超时事件
        eventEmitter.emit("timeout", task.id);
        
        console.log(`[MessageBridge-Async] 任务 ${task.id} 超时`);
      }
    }, task.timeout * 1000);

    // 立即返回任务ID（非阻塞）
    return task.id;
    
  } catch (error) {
    task.status = "error";
    
    // 触发错误回调
    if (task.onError) {
      try {
        await task.onError(error);
      } catch (err) {
        console.error("[MessageBridge-Async] 错误回调错误:", err);
      }
    }
    
    // 触发错误事件
    eventEmitter.emit("error", task.id, error);
    
    throw error;
  }
}

/**
 * 同步发送通知（阻塞，兼容旧版）
 */
async function notify(options) {
  return new Promise(async (resolve, reject) => {
    const taskId = await notifyAsync({
      ...options,
      onReply: (reply, userId) => {
        resolve({
          success: true,
          status: "replied",
          reply,
          replyUser: userId,
          timestamp: new Date().toISOString(),
        });
      },
      onTimeout: () => {
        resolve({
          success: true,
          status: "timeout",
          error: "Timeout waiting for reply",
        });
      },
      onError: (error) => {
        reject(error);
      },
    });
  });
}

/**
 * 获取任务状态
 */
function getTaskStatus(taskId) {
  const task = tasks.get(taskId);
  if (!task) {
    return null;
  }
  return task.toJSON();
}

/**
 * 取消任务
 */
function cancelTask(taskId) {
  const task = tasks.get(taskId);
  if (!task) {
    return false;
  }
  
  if (task.status === "pending") {
    task.status = "cancelled";
    
    // 清除超时定时器
    if (task.timeoutTimer) {
      clearTimeout(task.timeoutTimer);
    }
    
    console.log(`[MessageBridge-Async] 任务 ${taskId} 已取消`);
    return true;
  }
  
  return false;
}

/**
 * 监听事件
 */
function on(event, callback) {
  eventEmitter.on(event, callback);
}

/**
 * 移除监听
 */
function off(event, callback) {
  eventEmitter.off(event, callback);
}

/**
 * 仅发送消息（非阻塞）
 */
async function send(options) {
  await init();

  try {
    const targetId = config.chatId;
    const receiveIdType = "chat_id";
    
    const res = await httpClient.im.message.create({
      params: { receive_id_type: receiveIdType },
      data: {
        receive_id: targetId,
        msg_type: "text",
        content: JSON.stringify({ text: options.message }),
      },
    });

    if (res.code !== 0) {
      throw new Error(`发送失败: ${res.msg}`);
    }

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

module.exports = {
  init,
  notify,          // 同步版本（阻塞）
  notifyAsync,     // 异步版本（非阻塞）
  send,
  getTaskStatus,
  cancelTask,
  on,
  off,
  name: "messageBridge",
  description: "AI 智能体的消息桥梁（异步非阻塞版本）",
};
