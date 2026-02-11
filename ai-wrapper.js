/**
 * AI Task Wrapper - 强制用户确认
 * 
 * 用于约束 AI 工具的行为，确保敏感操作必须经过用户确认
 */

const messageBridge = require("./index.js");

/**
 * 执行需要用户确认的任务
 * 
 * @param {Object} options - 配置选项
 * @param {string} options.taskDescription - 任务描述
 * @param {string} options.riskLevel - 风险等级：low/medium/high
 * @param {number} options.timeout - 超时时间（秒），默认 120
 * @param {Function} options.taskFn - 要执行的任务函数
 * @param {Object} options.details - 额外详情（可选）
 * @returns {Promise<any>} 任务执行结果
 */
async function executeWithConfirmation(options) {
  const {
    taskDescription,
    riskLevel = "medium",
    timeout = 120,
    taskFn,
    details = {},
  } = options;

  // 构建确认消息
  const riskEmoji = {
    low: "ℹ️",
    medium: "⚠️",
    high: "🚨",
  };

  let message = `${riskEmoji[riskLevel]} 需要确认\n\n`;
  message += `任务：${taskDescription}\n`;
  message += `风险：${riskLevel.toUpperCase()}\n`;

  // 添加详情
  if (Object.keys(details).length > 0) {
    message += `\n详情：\n`;
    for (const [key, value] of Object.entries(details)) {
      message += `  ${key}: ${value}\n`;
    }
  }

  message += `\n请回复「确认」继续，或「取消」停止`;

  // 发送确认请求
  console.log(`[AI-Wrapper] 等待用户确认: ${taskDescription}`);
  const result = await messageBridge.notify({
    message,
    timeout,
  });

  // 检查回复
  if (result.status === "timeout") {
    const error = new Error(`等待确认超时（${timeout}秒）`);
    error.code = "CONFIRMATION_TIMEOUT";
    throw error;
  }

  if (result.status !== "replied") {
    const error = new Error("获取用户回复失败");
    error.code = "CONFIRMATION_FAILED";
    throw error;
  }

  const reply = result.reply.toLowerCase();
  if (!reply.includes("确认") && !reply.includes("yes") && !reply.includes("ok")) {
    const error = new Error("用户拒绝操作");
    error.code = "USER_REJECTED";
    throw error;
  }

  // 用户确认，执行任务
  console.log(`[AI-Wrapper] 用户已确认，开始执行...`);
  
  try {
    const taskResult = await taskFn();
    
    // 任务完成，通知用户
    await messageBridge.send({
      message: `✅ 任务完成\n\n${taskDescription}`,
    });
    
    return taskResult;
  } catch (error) {
    // 任务失败，通知用户
    await messageBridge.send({
      message: `❌ 任务失败\n\n${taskDescription}\n\n错误：${error.message}`,
    });
    
    throw error;
  }
}

/**
 * 批量操作确认
 * 
 * @param {Object} options - 配置选项
 * @param {Array} options.operations - 操作列表
 * @param {number} options.timeout - 超时时间（秒）
 * @returns {Promise<Array>} 执行结果列表
 */
async function executeBatchWithConfirmation(options) {
  const {
    operations,
    timeout = 180,
  } = options;

  // 构建确认消息
  let message = `⚠️ 批量操作确认\n\n`;
  message += `共 ${operations.length} 个操作：\n\n`;
  
  operations.forEach((op, index) => {
    message += `${index + 1}. ${op.description}\n`;
  });
  
  message += `\n请回复：\n`;
  message += `- 「全部执行」\n`;
  message += `- 「仅执行 1,3,5」（指定序号）\n`;
  message += `- 「取消」`;

  // 发送确认请求
  const result = await messageBridge.notify({
    message,
    timeout,
  });

  if (result.status !== "replied") {
    throw new Error("等待确认超时或失败");
  }

  const reply = result.reply.toLowerCase();
  
  // 解析用户选择
  let selectedIndexes = [];
  
  if (reply.includes("全部") || reply.includes("all")) {
    selectedIndexes = operations.map((_, i) => i);
  } else if (reply.includes("取消") || reply.includes("cancel")) {
    throw new Error("用户取消操作");
  } else {
    // 解析序号
    const matches = reply.match(/\d+/g);
    if (matches) {
      selectedIndexes = matches.map(n => parseInt(n) - 1).filter(i => i >= 0 && i < operations.length);
    }
  }

  if (selectedIndexes.length === 0) {
    throw new Error("未选择任何操作");
  }

  // 执行选中的操作
  const results = [];
  for (const index of selectedIndexes) {
    const op = operations[index];
    console.log(`[AI-Wrapper] 执行操作 ${index + 1}: ${op.description}`);
    
    try {
      const result = await op.taskFn();
      results.push({ index, success: true, result });
    } catch (error) {
      results.push({ index, success: false, error: error.message });
    }
  }

  // 通知结果
  const successCount = results.filter(r => r.success).length;
  await messageBridge.send({
    message: `✅ 批量操作完成\n\n成功：${successCount}/${selectedIndexes.length}`,
  });

  return results;
}

module.exports = {
  executeWithConfirmation,
  executeBatchWithConfirmation,
};
