// MessageBridge Skill - 快速测试（修复版）
const fetch = require("node-fetch");

const config = {
  appId: process.env.FEISHU_APP_ID || process.env.DITING_FEISHU_APP_ID || "",
  appSecret: process.env.FEISHU_APP_SECRET || process.env.DITING_FEISHU_APP_SECRET || "",
  chatId: process.env.FEISHU_CHAT_ID || process.env.DITING_FEISHU_CHAT_ID || "",
};

console.log("✅ 配置检查:");
console.log("  AppID:", config.appId ? "OK" : "MISSING");
console.log("  AppSecret:", config.appSecret ? "OK" : "MISSING");
console.log("  ChatID:", config.chatId ? "OK" : "MISSING");

if (!config.appId || !config.appSecret) {
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

async function testSendMessage() {
  console.log("\n📤 测试发送消息到群聊...");
  
  const token = await getAccessToken();
  console.log("  ✓ Token 获取成功");
  
  // 关键：receive_id_type 放在 URL 查询参数里
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
      content: JSON.stringify({ 
        text: "🧪 MessageBridge Skill 测试\n\n时间: " + new Date().toLocaleString("zh-CN", {timeZone: "Asia/Shanghai"})
      }),
    }),
  });
  
  const data = await response.json();
  
  if (data.code === 0) {
    console.log("  ✅ 消息发送成功!");
    console.log("  MessageID:", data.data.message_id);
    return data.data.message_id;
  } else {
    console.log("  ❌ 发送失败:", data.msg);
    return null;
  }
}

async function main() {
  console.log("🚀 MessageBridge Skill - 飞书测试\n");
  
  const messageId = await testSendMessage();
  
  if (messageId) {
    console.log("\n✅ 飞书消息发送功能正常!");
    console.log("📝 下一步: 实现 WebSocket 长链接接收回复");
  } else {
    console.log("\n❌ 测试失败");
    process.exit(1);
  }
}

main().catch(console.error);
