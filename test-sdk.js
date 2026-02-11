// MessageBridge Skill - 使用官方 SDK 的 WebSocket 测试
const lark = require("@larksuiteoapi/node-sdk");

const config = {
  appId: process.env.FEISHU_APP_ID || process.env.DITING_FEISHU_APP_ID || "",
  appSecret: process.env.FEISHU_APP_SECRET || process.env.DITING_FEISHU_APP_SECRET || "",
  chatId: process.env.FEISHU_CHAT_ID || process.env.DITING_FEISHU_CHAT_ID || "",
};

console.log("✅ 配置检查:");
console.log("  AppID:", config.appId ? "OK" : "MISSING");
console.log("  AppSecret:", config.appSecret ? "OK" : "MISSING");
console.log("  ChatID:", config.chatId ? "OK" : "MISSING");

if (!config.appId || !config.appSecret || !config.chatId) {
  console.log("\n❌ 请设置环境变量");
  process.exit(1);
}

async function testWithSDK() {
  console.log("\n🚀 MessageBridge Skill - 使用官方 SDK 测试\n");
  
  // 创建客户端
  const client = new lark.Client({
    appId: config.appId,
    appSecret: config.appSecret,
    appType: lark.AppType.SelfBuild,
    domain: lark.Domain.Feishu,
  });
  
  console.log("📤 发送测试消息...");
  
  // 发送消息
  try {
    const res = await client.im.message.create({
      params: {
        receive_id_type: "chat_id",
      },
      data: {
        receive_id: config.chatId,
        msg_type: "text",
        content: JSON.stringify({
          text: "🧪 SDK 测试\n\n来自 MessageBridge Skill\n时间: " + new Date().toLocaleString("zh-CN", {timeZone: "Asia/Shanghai"})
        }),
      },
    });
    
    if (res.code === 0) {
      console.log("  ✅ 消息发送成功!");
      console.log("  MessageID:", res.data.message_id);
    } else {
      console.log("  ❌ 发送失败:", res.msg);
    }
  } catch (error) {
    console.error("  ❌ 错误:", error.message);
  }
  
  console.log("\n📝 WebSocket 长链接说明:");
  console.log("  飞书 WebSocket 需要在开放平台配置:");
  console.log("  1. 事件订阅 -> 选择「长连接」模式");
  console.log("  2. 订阅事件: im.message.receive_v1");
  console.log("  3. 使用官方 SDK 的 WSClient 建立连接");
  console.log("\n  当前测试仅验证消息发送功能");
}

testWithSDK().catch(console.error);
