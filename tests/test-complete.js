// MessageBridge Skill - 完整功能测试
const path = require("path");
const messageBridge = require(path.join(__dirname, "..", "dist", "index.js"));

async function testNotify() {
  console.log("🧪 测试 notify() - 发送消息并等待回复\n");

  const result = await messageBridge.notify({
    message: "🧪 MessageBridge 功能测试\n\n请回复「确认」或「取消」",
    timeout: 30, // 30秒超时
  });

  console.log("\n📊 测试结果:");
  console.log("  成功:", result.success);
  console.log("  状态:", result.status);
  
  if (result.status === "replied") {
    console.log("  回复内容:", result.reply);
    console.log("  回复用户:", result.replyUser);
    console.log("  回复时间:", result.timestamp);
  } else if (result.status === "timeout") {
    console.log("  ⏱️  超时：未收到回复");
  } else {
    console.log("  错误:", result.error);
  }
}

async function testSend() {
  console.log("\n\n🧪 测试 send() - 仅发送消息\n");

  const result = await messageBridge.send({
    message: "✅ MessageBridge Skill 测试完成！",
  });

  console.log("\n📊 测试结果:");
  console.log("  成功:", result.success);
  
  if (result.success) {
    console.log("  消息ID:", result.messageId);
  } else {
    console.log("  错误:", result.error);
  }
}

async function main() {
  console.log("🚀 MessageBridge Skill - 完整功能测试\n");
  console.log("=" .repeat(50));

  try {
    // 测试 notify
    await testNotify();

    // 等待一下
    await new Promise(resolve => setTimeout(resolve, 2000));

    // 测试 send
    await testSend();

    console.log("\n" + "=".repeat(50));
    console.log("\n✅ 所有测试完成！");
    
    // 关闭连接
    messageBridge.close();
    process.exit(0);
  } catch (error) {
    console.error("\n❌ 测试失败:", error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

main();
