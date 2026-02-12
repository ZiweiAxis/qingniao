/**
 * Claude Code 集成示例
 * 
 * 演示如何在 Claude Code 中使用 Session Bridge 实现对话切换
 */

const path = require("path");
const { getSessionBridge } = require(path.join(__dirname, "..", "scripts", "session-bridge.js"));
const readline = require("readline");

// 创建终端输入接口
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

// 模拟 Claude Code 的对话循环
async function claudeCodeLoop() {
  const bridge = await getSessionBridge();

  console.log("🤖 Claude Code - 对话切换演示");
  console.log("=" .repeat(50));
  console.log("\n提示：");
  console.log("  - 说「切到飞书」可以切换到手机");
  console.log("  - 在手机上说「切回来」可以切回终端");
  console.log("  - 输入 /status 查看会话状态");
  console.log("  - 输入 /quit 退出\n");

  // 显示当前状态
  const status = bridge.getStatus();
  console.log(`当前会话: ${status.sessionId}`);
  console.log(`当前平台: ${status.platformName}`);
  console.log(`上下文: ${status.contextLength} 条消息\n`);

  // 对话循环
  while (true) {
    // 等待用户输入
    const userMessage = await new Promise((resolve) => {
      rl.question("你: ", resolve);
    });

    // 处理命令
    if (userMessage === "/quit") {
      console.log("\n👋 再见！");
      rl.close();
      process.exit(0);
    }

    if (userMessage === "/status") {
      const status = bridge.getStatus();
      console.log("\n📊 会话状态:");
      console.log(`  会话ID: ${status.sessionId}`);
      console.log(`  当前平台: ${status.platformName}`);
      console.log(`  上下文: ${status.contextLength} 条消息`);
      console.log(`  开始时间: ${status.startTime}`);
      console.log(`  最后活动: ${status.lastActivity}`);
      console.log(`  等待切换: ${status.isWaitingForSwitch ? "是" : "否"}\n`);
      continue;
    }

    // 处理用户消息
    const result = await bridge.handleMessage(userMessage);

    if (result.switched) {
      // 发生了切换
      console.log(`\n🔄 ${result.message}\n`);

      if (result.platform !== "terminal") {
        // 切到移动端，终端进入等待模式
        console.log("⏳ 终端进入等待模式...");
        console.log("   （在手机上继续对话，说「切回来」可以切回）\n");

        // 模拟等待切回
        await waitForSwitchBack(bridge);
      }

      continue;
    }

    // 正常对话，模拟 AI 回复
    const aiResponse = await simulateAIResponse(userMessage);
    console.log(`\nAI: ${aiResponse}\n`);

    // 记录 AI 回复
    await bridge.handleAIResponse(aiResponse);
  }
}

/**
 * 等待切回终端
 */
async function waitForSwitchBack(bridge) {
  return new Promise((resolve) => {
    // 模拟：定期检查是否切回
    const checkInterval = setInterval(async () => {
      const status = bridge.getStatus();
      
      if (status.platform === "terminal") {
        clearInterval(checkInterval);
        console.log("\n✅ 对话已切回终端！\n");
        resolve();
      }
    }, 2000);
  });
}

/**
 * 模拟 AI 回复
 */
async function simulateAIResponse(userMessage) {
  // 简单的模拟回复
  if (userMessage.includes("你好")) {
    return "你好！我是 Claude Code。有什么可以帮你的吗？";
  }
  
  if (userMessage.includes("帮我")) {
    return "好的，我会帮你处理。需要我做什么？";
  }

  return `收到你的消息：「${userMessage}」。我正在处理...`;
}

// 主函数
async function main() {
  try {
    await claudeCodeLoop();
  } catch (error) {
    console.error("\n❌ 错误:", error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

// 运行
if (require.main === module) {
  main();
}

module.exports = { claudeCodeLoop };
