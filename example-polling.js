/**
 * 轮询版本使用示例
 */

const messageBridge = require("./index-polling");

// 示例 1：AI 端手动轮询
async function example1_manualPolling() {
  console.log("示例 1：AI 端手动轮询\n");

  // 1. 发送通知
  const task = await messageBridge.sendNotification({
    message: "🧪 需要确认操作\n\n请回复「确认」或「取消」",
    timeout: 120,
  });

  console.log(`任务已创建: ${task.taskId}`);
  console.log(`过期时间: ${task.expiresAt}\n`);

  // 2. 手动轮询
  const maxPolls = 12;  // 最多轮询 12 次
  const interval = 10;  // 每 10 秒一次

  for (let i = 0; i < maxPolls; i++) {
    console.log(`轮询 #${i + 1}/${maxPolls}...`);

    // 查询状态（短轮询）
    const status = await messageBridge.checkStatus({
      taskId: task.taskId,
      waitTime: 0,  // 立即返回
    });

    console.log(`  状态: ${status.status}`);

    if (status.status === "replied") {
      console.log(`  ✅ 收到回复: ${status.reply}`);
      console.log(`  用户: ${status.replyUser}`);
      break;
    } else if (status.status === "timeout") {
      console.log(`  ⏱️  任务超时`);
      break;
    }

    // 等待
    console.log(`  等待 ${interval} 秒...\n`);
    await new Promise(resolve => setTimeout(resolve, interval * 1000));
  }
}

// 示例 2：使用长轮询
async function example2_longPolling() {
  console.log("\n示例 2：使用长轮询\n");

  // 1. 发送通知
  const task = await messageBridge.sendNotification({
    message: "🧪 长轮询测试\n\n请回复任意内容",
    timeout: 120,
  });

  console.log(`任务已创建: ${task.taskId}\n`);

  // 2. 长轮询
  const maxPolls = 4;  // 最多轮询 4 次
  const waitTime = 30; // 每次等待 30 秒

  for (let i = 0; i < maxPolls; i++) {
    console.log(`长轮询 #${i + 1}/${maxPolls} (等待最多 ${waitTime} 秒)...`);

    // 查询状态（长轮询）
    const status = await messageBridge.checkStatus({
      taskId: task.taskId,
      waitTime: waitTime,  // 等待最多 30 秒
    });

    console.log(`  状态: ${status.status}`);

    if (status.status === "replied") {
      console.log(`  ✅ 收到回复: ${status.reply}`);
      break;
    } else if (status.status === "timeout") {
      console.log(`  ⏱️  任务超时`);
      break;
    }

    console.log(`  继续轮询...\n`);
  }
}

// 示例 3：使用封装的 waitForReply
async function example3_waitForReply() {
  console.log("\n示例 3：使用封装的 waitForReply\n");

  // 一次调用，自动轮询
  const result = await messageBridge.waitForReply({
    message: "🧪 自动轮询测试\n\n请回复任意内容",
    timeout: 120,        // 总超时 120 秒
    pollInterval: 10,    // 轮询间隔 10 秒
    longPollWait: 30,    // 长轮询等待 30 秒
  });

  console.log("\n📊 结果:");
  console.log(`  成功: ${result.success}`);
  console.log(`  状态: ${result.status}`);
  
  if (result.status === "replied") {
    console.log(`  回复: ${result.reply}`);
    console.log(`  用户: ${result.replyUser}`);
  } else {
    console.log(`  错误: ${result.error}`);
  }
}

// 主函数
async function main() {
  console.log("🚀 MessageBridge 轮询版本示例\n");
  console.log("=" .repeat(50));

  try {
    // 选择一个示例运行
    // await example1_manualPolling();
    // await example2_longPolling();
    await example3_waitForReply();

    console.log("\n" + "=".repeat(50));
    console.log("\n✅ 示例完成！");
    
  } catch (error) {
    console.error("\n❌ 错误:", error.message);
    console.error(error.stack);
  }

  process.exit(0);
}

// 运行
if (require.main === module) {
  main();
}

module.exports = {
  example1_manualPolling,
  example2_longPolling,
  example3_waitForReply,
};
