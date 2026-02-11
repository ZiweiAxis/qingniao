#!/usr/bin/env node
/**
 * 飞书对话模式：用户在飞书发消息 → 本脚本收事件 → 调 AI 得到回复 → 在同一会话回飞书
 * 使用现有飞书机器人（FEISHU_APP_ID / FEISHU_APP_SECRET / FEISHU_CHAT_ID）。
 *
 * 启动：在 message-bridge 目录下
 *   node feishu-conversation.js
 *
 * 环境变量：
 *   FEISHU_APP_ID / FEISHU_APP_SECRET（必填）
 *   FEISHU_CHAT_ID（可选，仅用于单群；不设则回复到每条消息所在会话）
 *   AI 回复二选一：
 *     - AI_REPLY_URL: POST { "message", "chat_id" }，响应 { "reply" }（你自建的服务）
 *     - OPENAI_API_KEY + OPENAI_BASE_URL(可选) + OPENAI_MODEL(可选)：走 OpenAI 兼容接口
 */

const lark = require("@larksuiteoapi/node-sdk");
const http = require("http");
const https = require("https");

const config = {
  appId: process.env.FEISHU_APP_ID || process.env.DITING_FEISHU_APP_ID || "",
  appSecret: process.env.FEISHU_APP_SECRET || process.env.DITING_FEISHU_APP_SECRET || "",
  chatId: process.env.FEISHU_CHAT_ID || process.env.DITING_FEISHU_CHAT_ID || "",
};

const AI_REPLY_URL = process.env.AI_REPLY_URL || "";
const OPENAI_API_KEY = process.env.OPENAI_API_KEY || "";
const OPENAI_BASE_URL = process.env.OPENAI_BASE_URL || "https://api.openai.com/v1";
const OPENAI_MODEL = process.env.OPENAI_MODEL || "gpt-3.5-turbo";

let httpClient = null;
let wsClient = null;

async function getAIReply(userMessage, chatId) {
  if (AI_REPLY_URL) {
    const body = JSON.stringify({ message: userMessage, chat_id: chatId });
    const u = new URL(AI_REPLY_URL);
    const lib = u.protocol === "https:" ? https : http;
    return new Promise((resolve, reject) => {
      const req = lib.request(
        {
          hostname: u.hostname,
          port: u.port || (u.protocol === "https:" ? 443 : 80),
          path: u.pathname + u.search,
          method: "POST",
          headers: { "Content-Type": "application/json", "Content-Length": Buffer.byteLength(body) },
        },
        (res) => {
          const chunks = [];
          res.on("data", (c) => chunks.push(c));
          res.on("end", () => {
            try {
              const data = JSON.parse(Buffer.concat(chunks).toString());
              resolve(data.reply || data.text || "[无回复]");
            } catch (e) {
              resolve("[解析回复失败]");
            }
          });
        }
      );
      req.on("error", reject);
      req.write(body);
      req.end();
    });
  }

  if (OPENAI_API_KEY) {
    const base = OPENAI_BASE_URL.replace(/\/$/, "");
    const body = JSON.stringify({
      model: OPENAI_MODEL,
      messages: [{ role: "user", content: userMessage }],
      max_tokens: 1024,
    });
    const u = new URL(base + "/chat/completions");
    const lib = u.protocol === "https:" ? https : http;
    return new Promise((resolve, reject) => {
      const req = lib.request(
        {
          hostname: u.hostname,
          port: u.port || (u.protocol === "https:" ? 443 : 80),
          path: u.pathname + u.search,
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer " + OPENAI_API_KEY,
            "Content-Length": Buffer.byteLength(body),
          },
        },
        (res) => {
          const chunks = [];
          res.on("data", (c) => chunks.push(c));
          res.on("end", () => {
            try {
              const data = JSON.parse(Buffer.concat(chunks).toString());
              const text = data.choices?.[0]?.message?.content;
              resolve(text || "[模型未返回内容]");
            } catch (e) {
              resolve("[解析 OpenAI 响应失败]");
            }
          });
        }
      );
      req.on("error", reject);
      req.write(body);
      req.end();
    });
  }

  return "请配置 AI_REPLY_URL 或 OPENAI_API_KEY 后，我才能回复。当前仅收到你的消息。";
}

async function sendToFeishu(chatId, text) {
  const res = await httpClient.im.message.create({
    params: { receive_id_type: "chat_id" },
    data: {
      receive_id: chatId,
      msg_type: "text",
      content: JSON.stringify({ text }),
    },
  });
  if (res.code !== 0) throw new Error(res.msg || "发送失败");
  return res.data?.message_id;
}

async function main() {
  if (!config.appId || !config.appSecret) {
    console.error("请设置 FEISHU_APP_ID、FEISHU_APP_SECRET（或 DITING_FEISHU_*）");
    process.exit(1);
  }

  console.log("[飞书对话] 使用现有飞书机器人，长连接接收消息 → AI 回复 → 回飞书");
  console.log("[飞书对话] AI 来源:", AI_REPLY_URL ? "AI_REPLY_URL" : OPENAI_API_KEY ? "OpenAI 兼容" : "未配置（仅回占位）");
  console.log("");

  httpClient = new lark.Client({
    appId: config.appId,
    appSecret: config.appSecret,
    appType: lark.AppType.SelfBuild,
    domain: lark.Domain.Feishu,
  });

  const eventDispatcher = new lark.EventDispatcher({}).register({
    "im.message.receive_v1": async (data) => {
      const msg = data?.message;
      if (!msg) return { code: 0 };

      try {
        const content = JSON.parse(msg.content || "{}");
        const text = (content.text || "").trim();
        const chatId = msg.chat_id;
        const senderId = msg.sender?.sender_id?.open_id || msg.sender?.sender_id?.user_id || "?";

        if (!text) return { code: 0 };

        console.log("[飞书对话] 收到:", text, "| 会话:", chatId, "| 发送者:", senderId);

        const reply = await getAIReply(text, chatId);
        await sendToFeishu(chatId, reply);
        console.log("[飞书对话] 已回复:", reply.slice(0, 80) + (reply.length > 80 ? "…" : ""));
      } catch (err) {
        console.error("[飞书对话] 处理失败:", err.message);
        try {
          await sendToFeishu(msg.chat_id, "处理出错: " + err.message);
        } catch (_) {}
      }
      return { code: 0 };
    },
  });

  wsClient = new lark.WSClient({
    appId: config.appId,
    appSecret: config.appSecret,
    loggerLevel: lark.LoggerLevel.error,
  });
  wsClient.start({ eventDispatcher });

  console.log("[飞书对话] 已启动，在飞书里给机器人发消息即可对话。Ctrl+C 退出。\n");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
