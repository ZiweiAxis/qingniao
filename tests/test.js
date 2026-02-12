// MessageBridge Skill - 快速测试（修复版）
// 配置来源：环境变量 或 ~/.message-bridge/config.json（与 index.js 一致）
const fetch = require("node-fetch");
const path = require("path");
const fs = require("fs");
const os = require("os");

function loadConfigFromFile() {
  const configPath = path.join(os.homedir(), ".message-bridge", "config.json");
  try {
    const raw = fs.readFileSync(configPath, "utf8");
    const data = JSON.parse(raw);
    return data.feishu || {};
  } catch (e) {
    return {};
  }
}

const fileCfg = loadConfigFromFile();
const config = {
  appId: process.env.FEISHU_APP_ID || process.env.DITING_FEISHU_APP_ID || fileCfg.appId || "",
  appSecret: process.env.FEISHU_APP_SECRET || process.env.DITING_FEISHU_APP_SECRET || fileCfg.appSecret || "",
  chatId: process.env.FEISHU_CHAT_ID || process.env.DITING_FEISHU_CHAT_ID || fileCfg.chatId || "",
};

console.log("✅ 配置检查（环境变量或 ~/.message-bridge/config.json）:");
console.log("  AppID:", config.appId ? "OK" : "MISSING");
console.log("  AppSecret:", config.appSecret ? "OK" : "MISSING");
console.log("  ChatID:", config.chatId ? "OK" : "MISSING");

if (!config.appId || !config.appSecret) {
  console.log("\n❌ 请设置环境变量或运行: npx skill-message-bridge config set feishu --app-id=xxx --app-secret=xxx");
  process.exit(1);
}
if (!config.chatId) {
  console.log("\n⚠️ ChatID 未设置，将跳过发送到群聊（需 chat_id 才能发群消息）。可用 npx skill-message-bridge connect 获取。");
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
  if (!config.chatId) {
    console.log("\n📤 跳过发送（无 chat_id）");
    return null;
  }
  console.log("\n📤 测试发送消息到群聊...");
  
  const token = await getAccessToken();
  console.log("  ✓ Token 获取成功");
  
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
  
  if (!config.chatId) {
    try {
      const token = await getAccessToken();
      console.log("\n  ✓ Token 获取成功，凭证有效。请设置 chat_id 后重试（npx skill-message-bridge connect 可获取）");
    } catch (e) {
      console.log("\n❌ 凭证无效或网络错误:", e.message);
      process.exit(1);
    }
    return;
  }
  
  const messageId = await testSendMessage();
  
  if (messageId) {
    console.log("\n✅ 飞书消息发送功能正常!");
  } else {
    console.log("\n❌ 发送失败");
    process.exit(1);
  }
}

main().catch(console.error);
