/**
 * MessageBridge - 轮询版本
 * 
 * 适用于只能同步调用 Skill 的 AI 智能体
 */

const lark = require("@larksuiteoapi/node-sdk");
const fs = require("fs").promises;
const path = require("path");

// 配置
const config = {
  appId: process.env.FEISHU_APP_ID || process.env.DITING_FEISHU_APP_ID || "",
  appSecret: process.env.FEISHU_APP_SECRET || process.env.DITING_FEISHU_APP_SECRET || "",
  chatId: process.env.FEISHU_CHAT_ID || process.env.DITING_FEISHU_CHAT_ID || "",
};

// 任务存储目录
const TASKS_DIR = path.join(__dirname, ".tasks");

// 全局客户端
let httpClient = null;
let wsClient = null;
let isInitialized = false;

/**
 * 初始化
 */
async function init() {
  if (isInitialized) return;

  // 确保任务目录存在
  await fs.mkdir(TASKS_DIR, { recursive: true });

  // 创建 HTTP 客户端
  httpClient = new lark.Client({
    appId: config.appId,
    appSecret: config.appSecret,
    appType: lark.AppType.SelfBuild,
    domain: lark.Domain.Feishu,
  });

  // 创建事件处理器
  const eventDispatcher = new lark.EventDispatcher({}).register({
    "im.message.receive_v1": async (data) => {
      const message = data.message;
      
      try {
        const content = JSON.parse(message.content);
        const senderId = message.sender?.sender_id?.open_id || message.sender?.sender_id?.user_id || "unknown";
        const text = content.text || "";
        
        console.log(`[MessageBridge-Poll] 收到消息: ${text}`);
        
        // 查找等待回复的任务
        const taskFiles = await fs.readdir(TASKS_DIR);
        
        for (const file of taskFiles) {
          if (!file.endsWith(".json")) continue;
          
          const taskPath = path.join(TASKS_DIR, file);
          const taskData = JSON.parse(await fs.readFile(taskPath, "utf-8"));
          
          if (taskData.status === "pending") {
            // 更新任务状态
            taskData.status = "replied";
            taskData.reply = text;
            taskData.replyUser = senderId;
            taskData.repliedAt = new Date().toISOString();
            
            await fs.writeFile(taskPath, JSON.stringify(taskData, null, 2));
            
            console.log(`[MessageBridge-Poll] 任务 ${taskData.id} 已完成`);
            break;
          }
        }
      } catch (error) {
        console.error("[MessageBridge-Poll] 处理消息失败:", error.message);
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

  wsClient.start({ eventDispatcher });
  await new Promise(resolve => setTimeout(resolve, 2000));

  isInitialized = true;
  console.log("[MessageBridge-Poll] 初始化完成");
}

/**
 * 发送通知（立即返回任务ID）
 * 
 * @param {Object} options - 配置选项
 * @param {string} options.message - 消息内容
 * @param {number} options.timeout - 超时时间（秒），默认 300
 * @returns {Promise<Object>} 任务信息
 */
async function sendNotification(options) {
  await init();

  const { message, timeout = 300 } = options;

  // 创建任务
  const taskId = `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  const task = {
    id: taskId,
    message,
    timeout,
    status: "pending",
    createdAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + timeout * 1000).toISOString(),
    reply: null,
    replyUser: null,
    repliedAt: null,
    messageId: null,
  };

  // 保存任务到文件
  const taskPath = path.join(TASKS_DIR, `${taskId}.json`);
  await fs.writeFile(taskPath, JSON.stringify(task, null, 2));

  // 发送消息
  try {
    const res = await httpClient.im.message.create({
      params: { receive_id_type: "chat_id" },
      data: {
        receive_id: config.chatId,
        msg_type: "text",
        content: JSON.stringify({ text: message }),
      },
    });

    if (res.code !== 0) {
      throw new Error(`发送失败: ${res.msg}`);
    }

    task.messageId = res.data.message_id;
    await fs.writeFile(taskPath, JSON.stringify(task, null, 2));

    console.log(`[MessageBridge-Poll] 任务已创建: ${taskId}`);

    return {
      taskId: taskId,
      status: "pending",
      message: "通知已发送，请使用 checkStatus 查询结果",
      expiresAt: task.expiresAt,
    };
  } catch (error) {
    task.status = "error";
    task.error = error.message;
    await fs.writeFile(taskPath, JSON.stringify(task, null, 2));
    throw error;
  }
}

/**
 * 查询任务状态
 * 
 * @param {Object} options - 配置选项
 * @param {string} options.taskId - 任务ID
 * @param {number} options.waitTime - 等待时间（秒），0 表示立即返回，默认 0
 * @returns {Promise<Object>} 任务状态
 */
async function checkStatus(options) {
  await init();

  const { taskId, waitTime = 0 } = options;

  const taskPath = path.join(TASKS_DIR, `${taskId}.json`);

  // 检查任务是否存在
  try {
    await fs.access(taskPath);
  } catch (error) {
    return {
      taskId,
      status: "not_found",
      error: "任务不存在",
    };
  }

  // 长轮询模式
  if (waitTime > 0) {
    const startTime = Date.now();
    const maxWaitMs = waitTime * 1000;

    while ((Date.now() - startTime) < maxWaitMs) {
      const taskData = JSON.parse(await fs.readFile(taskPath, "utf-8"));

      // 检查是否完成
      if (taskData.status !== "pending") {
        return {
          taskId: taskData.id,
          status: taskData.status,
          reply: taskData.reply,
          replyUser: taskData.replyUser,
          repliedAt: taskData.repliedAt,
        };
      }

      // 检查是否超时
      if (new Date() > new Date(taskData.expiresAt)) {
        taskData.status = "timeout";
        await fs.writeFile(taskPath, JSON.stringify(taskData, null, 2));
        
        return {
          taskId: taskData.id,
          status: "timeout",
          error: "任务已超时",
        };
      }

      // 短暂休眠
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }

  // 短轮询模式或长轮询超时
  const taskData = JSON.parse(await fs.readFile(taskPath, "utf-8"));

  // 检查是否超时
  if (taskData.status === "pending" && new Date() > new Date(taskData.expiresAt)) {
    taskData.status = "timeout";
    await fs.writeFile(taskPath, JSON.stringify(taskData, null, 2));
  }

  return {
    taskId: taskData.id,
    status: taskData.status,
    reply: taskData.reply,
    replyUser: taskData.replyUser,
    repliedAt: taskData.repliedAt,
    error: taskData.error,
  };
}

/**
 * 等待回复（封装轮询逻辑）
 * 
 * @param {Object} options - 配置选项
 * @param {string} options.message - 消息内容
 * @param {number} options.timeout - 总超时时间（秒），默认 300
 * @param {number} options.pollInterval - 轮询间隔（秒），默认 10
 * @param {number} options.longPollWait - 长轮询等待时间（秒），默认 30
 * @returns {Promise<Object>} 结果
 */
async function waitForReply(options) {
  const {
    message,
    timeout = 300,
    pollInterval = 10,
    longPollWait = 30,
  } = options;

  // 1. 发送通知
  const task = await sendNotification({ message, timeout });
  console.log(`[MessageBridge-Poll] 开始轮询，任务ID: ${task.taskId}`);

  // 2. 轮询查询
  const startTime = Date.now();
  let pollCount = 0;

  while (true) {
    // 检查总超时
    const elapsed = (Date.now() - startTime) / 1000;
    if (elapsed >= timeout) {
      console.log(`[MessageBridge-Poll] 总超时时间已到`);
      return {
        success: false,
        status: "timeout",
        error: "总超时时间已到",
      };
    }

    pollCount++;
    console.log(`[MessageBridge-Poll] 轮询 #${pollCount}...`);

    // 查询状态（使用长轮询）
    const status = await checkStatus({
      taskId: task.taskId,
      waitTime: longPollWait,
    });

    if (status.status === "replied") {
      console.log(`[MessageBridge-Poll] 收到回复: ${status.reply}`);
      return {
        success: true,
        status: "replied",
        reply: status.reply,
        replyUser: status.replyUser,
        timestamp: status.repliedAt,
      };
    } else if (status.status === "timeout") {
      console.log(`[MessageBridge-Poll] 任务超时`);
      return {
        success: false,
        status: "timeout",
        error: "任务超时",
      };
    }

    // 等待下一次轮询
    await new Promise(resolve => setTimeout(resolve, pollInterval * 1000));
  }
}

module.exports = {
  init,
  sendNotification,
  checkStatus,
  waitForReply,
  name: "messageBridge",
  description: "AI 智能体的消息桥梁（轮询版本）",
};
