/**
 * 异步非阻塞版本使用示例
 * 
 * 演示如何避免 AI 智能体阻塞等待
 */

const messageBridge = require("./index-async");

// 示例 1：异步通知 + 回调（推荐）
async function example1_asyncWithCallback() {
  console.log("示例 1：异步通知 + 回调\n");

  // 发送通知（立即返回，不阻塞）
  const taskId = await messageBridge.notifyAsync({
    message: "🧪 需要确认操作\n\n请回复「确认」或「取消」",
    timeout: 60,
    
    // 收到回复时的回调
    onReply: async (reply, userId) => {
      console.log(`\n✅ 收到回复: ${reply}`);
      console.log(`   用户: ${userId}`);
      
      if (reply.includes("确认")) {
        console.log("   → 用户确认，继续执行任务");
        await executeTask();
      } else {
        console.log("   → 用户取消，停止执行");
      }
    },
    
    // 超时时的回调
    onTimeout: async () => {
      console.log("\n⏱️  超时：用户未回复");
      console.log("   → 自动取消任务");
    },
    
    // 错误时的回调
    onError: async (error) => {
      console.error("\n❌ 错误:", error.message);
    },
  });

  console.log(`✅ 通知已发送，任务ID: ${taskId}`);
  console.log("   AI 可以继续做其他事情，不会阻塞\n");

  // AI 继续做其他事情
  console.log("🔄 AI 继续工作...");
  await doOtherWork();
}

// 示例 2：事件监听（推荐）
async function example2_eventListener() {
  console.log("\n示例 2：事件监听\n");

  // 监听回复事件
  messageBridge.on("reply", (taskId, reply, userId) => {
    console.log(`\n📨 事件：收到回复`);
    console.log(`   任务ID: ${taskId}`);
    console.log(`   回复: ${reply}`);
    console.log(`   用户: ${userId}`);
  });

  // 监听超时事件
  messageBridge.on("timeout", (taskId) => {
    console.log(`\n⏱️  事件：任务超时`);
    console.log(`   任务ID: ${taskId}`);
  });

  // 发送通知
  const taskId = await messageBridge.notifyAsync({
    message: "🧪 事件监听测试\n\n请回复任意内容",
    timeout: 60,
  });

  console.log(`✅ 通知已发送，任务ID: ${taskId}`);
  console.log("   事件监听器会自动处理回复\n");
}

// 示例 3：状态查询
async function example3_statusQuery() {
  console.log("\n示例 3：状态查询\n");

  // 发送通知
  const taskId = await messageBridge.notifyAsync({
    message: "🧪 状态查询测试\n\n请回复任意内容",
    timeout: 120,
  });

  console.log(`✅ 通知已发送，任务ID: ${taskId}\n`);

  // 定期查询状态
  const checkInterval = setInterval(() => {
    const status = messageBridge.getTaskStatus(taskId);
    
    console.log(`📊 任务状态: ${status.status}`);
    
    if (status.status === "replied") {
      console.log(`   回复: ${status.reply}`);
      clearInterval(checkInterval);
    } else if (status.status === "timeout") {
      console.log("   超时了");
      clearInterval(checkInterval);
    }
  }, 5000);  // 每5秒查询一次
}

// 示例 4：同步版本（兼容旧代码，会阻塞）
async function example4_syncVersion() {
  console.log("\n示例 4：同步版本（会阻塞）\n");

  console.log("⏳ 发送通知并等待回复...");
  
  // 这会阻塞，直到收到回复或超时
  const result = await messageBridge.notify({
    message: "🧪 同步测试\n\n请回复任意内容",
    timeout: 30,
  });

  console.log("\n📊 结果:");
  console.log(`   状态: ${result.status}`);
  if (result.status === "replied") {
    console.log(`   回复: ${result.reply}`);
  }
}

// 辅助函数
async function executeTask() {
  console.log("   🚀 执行任务...");
  await new Promise(resolve => setTimeout(resolve, 1000));
  console.log("   ✅ 任务完成");
}

async function doOtherWork() {
  for (let i = 1; i <= 3; i++) {
    console.log(`   → 做其他工作 ${i}/3`);
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  console.log("   ✅ 其他工作完成");
}

// 主函数
async function main() {
  console.log("🚀 MessageBridge 异步非阻塞示例\n");
  console.log("=" .repeat(50));

  try {
    // 运行示例 1
    await example1_asyncWithCallback();

    // 等待一下
    await new Promise(resolve => setTimeout(resolve, 3000));

    // 运行示例 2
    await example2_eventListener();

    console.log("\n" + "=".repeat(50));
    console.log("\n✅ 示例完成！");
    console.log("\n💡 关键点：");
    console.log("   - notifyAsync() 立即返回，不阻塞");
    console.log("   - 使用回调或事件处理回复");
    console.log("   - AI 可以继续做其他事情");
    
  } catch (error) {
    console.error("\n❌ 错误:", error.message);
  }
}

// 运行
if (require.main === module) {
  main();
}

module.exports = {
  example1_asyncWithCallback,
  example2_eventListener,
  example3_statusQuery,
  example4_syncVersion,
};
