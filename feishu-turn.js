#!/usr/bin/env node
/**
 * 飞书单轮：把「你的回复」发到飞书，等待用户回复，输出用户回复（供 AI 在闭环中循环调用）。
 * 用法：node feishu-turn.js "你要发到飞书的内容"
 *       或 echo "内容" | node feishu-turn.js
 * 输出：单行 JSON {"status":"replied"|"timeout"|"error", "reply":"用户回复", "replyUser": "?"}
 * 超时：FEISHU_TURN_TIMEOUT 秒，默认 3600（1 小时）；飞书回复可能较久甚至数小时时可设为 86400 等。
 */
const mb = require("./index.js");

const timeout = parseInt(process.env.FEISHU_TURN_TIMEOUT || "3600", 10);

function getMessage() {
  const arg = process.argv[2];
  if (arg !== undefined && arg !== "") return arg;
  const fs = require("fs");
  if (!process.stdin.isTTY) {
    return fs.readFileSync(0, "utf8").trim();
  }
  return "";
}

async function main() {
  const message = getMessage();
  if (!message) {
    console.log(JSON.stringify({ status: "error", reply: "", error: "empty message" }));
    process.exit(1);
  }

  try {
    const result = await mb.notify({ message, timeout });
    const out = {
      status: result.status || "error",
      reply: result.reply || "",
      replyUser: result.replyUser || "",
    };
    if (result.error) out.error = result.error;
    console.log(JSON.stringify(out));
    process.exit(result.status === "replied" ? 0 : 1);
  } catch (err) {
    console.log(JSON.stringify({ status: "error", reply: "", error: err.message }));
    process.exit(1);
  } finally {
    mb.close();
  }
}

main();
