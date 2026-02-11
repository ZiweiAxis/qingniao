// MessageBridge Skill - 飞书 WebSocket 长链接（正确版本）
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

async function main() {
  console.log("\n🚀 MessageBridge Skill - 飞书 WebSocket 长链接\n");
  
  // 创建 HTTP 客户端（用于发送消息）
  const client = new lark.Client({
    appId: config.appId,
    appSecret: config.appSecret,
    appType: lark.AppType.SelfBuild,
    domain: lark.Domain.Feishu,
  });
  
  // 创建事件处理器
  const eventDispatcher = new lark.EventDispatcher({}).register({
    "im.message.receive_v1": async (data) => {
      const message = data.message;
      
      // 忽略机器人自己发的消息
      if (message.message_type === "post" || message.chat_type === "p2p") {
        return { code: 0 };
      }
      
      try {
        const content = JSON.parse(message.content);
        const senderId = message.sender?.sender_id?.open_id || message.sender?.sender_id?.user_id || "unknown";
        const text = content.text || "";
        
        console.log("\n📨 收到消息:");
        console.log("  发送者:", senderId);
        console.log("  内容:", text);
        console.log("  消息ID:", message.message_id);
        console.log("  聊天类型:", message.chat_type);
      } catch (error) {
        console.error("  ❌ 解析消息失败:", error.message);
      }
      
      return { code: 0 };
    },
  });
  
  // 创建 WebSocket 客户端
  console.log("🔌 创建 WebSocket 客户端...");
  const wsClient = new lark.WSClient({
    appId: config.appId,
    appSecret: config.appSecret,
    loggerLevel: lark.LoggerLevel.info,
  });
  
  // 启动 WebSocket（传入 eventDispatcher）
  console.log("🔌 启动 WebSocket 长链接...");
  wsClient.start({
    eventDispatcher: eventDispatcher,
  });
  
  // 等待连接建立
  await new Promise(resolve => setTimeout(resolve, 3000));
  console.log("  ✅ WebSocket 已启动\n");
  
  // 发送测试消息
  console.log("📤 发送测试消息...");
  try {
    const res = await client.im.message.create({
      params: {
        receive_id_type: "chat_id",
      },
      data: {
        receive_id: config.chatId,
        msg_type: "text",
        content: JSON.stringify({
          text: "🧪 WebSocket 长链接测试\n\n请回复任意消息测试接收功能\n\n时间: " + new Date().toLocaleString("zh-CN", {timeZone: "Asia/Shanghai"})
        }),
      },
    });
    
    if (res.code === 0) {
      console.log("  ✅ 消息已发送:", res.data.message_id);
    } else {
      console.log("  ❌ 发送失败:", res.msg);
    }
  } catch (error) {
    console.error("  ❌ 发送错误:", error.message);
  }
  
  console.log("\n⏳ 等待消息...");
  console.log("   （按 Ctrl+C 退出）\n");
  
  // 保持运行
  process.on("SIGINT", () => {
    console.log("\n\n👋 退出程序");
    process.exit(0);
  });
}

main().catch((error) => {
  console.error("\n❌ 错误:", error.message);
  console.error(error.stack);
  process.exit(1);
});
