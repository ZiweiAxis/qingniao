// MessageBridge Skill - WebSocket 完整测试
const fetch = require("node-fetch");
const WebSocket = require("ws");

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

async function getAccessToken() {
  const response = await fetch(
    "https://open.feishu.cn/open-apis/auth/v3/tenant_access_token/internal",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ app_id: config.appId, app_secret: config.appSecret }),
    }
  );
  const data = await response.json();
  if (data.code !== 0) {
    throw new Error("Failed to get token: " + data.msg);
  }
  return data.tenant_access_token;
}

async function sendMessage(token, text) {
  const url = "https://open.feishu.cn/open-apis/im/v1/messages?receive_id_type=chat_id";
  
  const response = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: "Bearer " + token,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      receive_id: config.chatId,
      msg_type: "text",
      content: JSON.stringify({ text }),
    }),
  });
  
  const data = await response.json();
  if (data.code !== 0) {
    throw new Error("发送失败: " + data.msg);
  }
  return data.data.message_id;
}

async function testWebSocket() {
  console.log("\n🔌 测试 WebSocket 长链接...");
  
  const token = await getAccessToken();
  console.log("  ✓ Token 获取成功");
  
  // 连接 WebSocket
  const wsUrl = `wss://open.feishu.cn/open-apis/ws/v1/connect?token=${token}`;
  const ws = new WebSocket(wsUrl);
  
  return new Promise((resolve, reject) => {
    let messageReceived = false;
    
    ws.on("open", async () => {
      console.log("  ✓ WebSocket 连接成功");
      
      // 发送测试消息
      const messageId = await sendMessage(token, "🧪 WebSocket 测试\n\n请回复任意消息测试接收功能");
      console.log("  ✓ 测试消息已发送:", messageId);
      console.log("\n⏳ 等待用户回复（30秒超时）...");
      
      // 30秒超时
      setTimeout(() => {
        if (!messageReceived) {
          console.log("\n⏱️  超时：未收到回复");
          ws.close();
          resolve(false);
        }
      }, 30000);
    });
    
    ws.on("message", (data) => {
      try {
        const message = JSON.parse(data.toString());
        console.log("\n📨 收到消息:", message.type);
        
        if (message.type === "im.message.receive_v1") {
          const msg = message.data.message;
          const content = JSON.parse(msg.content);
          const sender = msg.sender?.sender_id?.open_id || msg.sender?.sender_id?.user_id;
          
          console.log("  ✅ 收到用户回复!");
          console.log("  发送者:", sender);
          console.log("  内容:", content.text);
          
          messageReceived = true;
          ws.close();
          resolve(true);
        }
      } catch (error) {
        console.error("  ❌ 解析消息失败:", error.message);
      }
    });
    
    ws.on("close", (code) => {
      console.log("\n🔌 WebSocket 已关闭:", code);
    });
    
    ws.on("error", (error) => {
      console.error("\n❌ WebSocket 错误:", error.message);
      reject(error);
    });
  });
}

async function main() {
  console.log("🚀 MessageBridge Skill - WebSocket 完整测试\n");
  
  try {
    const success = await testWebSocket();
    
    if (success) {
      console.log("\n✅ WebSocket 接收回复功能正常!");
      console.log("📝 MessageBridge Skill 开发完成！");
    } else {
      console.log("\n⚠️  未收到回复，但 WebSocket 连接正常");
    }
  } catch (error) {
    console.error("\n❌ 测试失败:", error.message);
    process.exit(1);
  }
}

main();
