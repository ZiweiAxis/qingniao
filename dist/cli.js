#!/usr/bin/env node
/**
 * skill-message-bridge 统一 CLI（npx 优先）
 *
 * 用法：
 *   npx skill-message-bridge "消息"           # 发到飞书并等回复（默认 notify）
 *   npx skill-message-bridge notify "消息" [--timeout=60]
 *   npx skill-message-bridge send "消息"     # 只发不等
 *   npx skill-message-bridge check-env       # 检查飞书环境变量
 *   npx skill-message-bridge --help
 *
 * 消息可从参数或 stdin 读取：echo "内容" | npx skill-message-bridge send
 */

const path = require("path");
const fs = require("fs");
const os = require("os");

// 发布后为 dist/cli.js，同目录 dist/index.js；开发时根目录 cli.js require 根目录 index.js
const mb = require(path.join(__dirname, "index.js"));

const FEISHU_TURN_TIMEOUT = parseInt(process.env.FEISHU_TURN_TIMEOUT || "3600", 10);

const CONFIG_DIR = path.join(os.homedir(), ".message-bridge");
const CONFIG_PATH = path.join(CONFIG_DIR, "config.json");

function loadConfigFile() {
  try {
    const raw = fs.readFileSync(CONFIG_PATH, "utf8");
    return JSON.parse(raw);
  } catch (e) {
    return { feishu: {} };
  }
}

function saveConfigFile(obj) {
  try {
    fs.mkdirSync(CONFIG_DIR, { recursive: true });
    fs.writeFileSync(CONFIG_PATH, JSON.stringify(obj, null, 2), "utf8");
  } catch (e) {
    console.error("写入配置失败:", e.message);
    process.exit(1);
  }
}

function parseConfigSetArgs(argv) {
  const out = {};
  for (let i = 3; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === "--app-id" && argv[i + 1] != null) out.appId = argv[++i];
    else if (arg === "--app-secret" && argv[i + 1] != null) out.appSecret = argv[++i];
    else if (arg === "--chat-id" && argv[i + 1] != null) out.chatId = argv[++i];
    else if (arg.startsWith("--app-id=")) out.appId = arg.replace(/^--app-id=/, "");
    else if (arg.startsWith("--app-secret=")) out.appSecret = arg.replace(/^--app-secret=/, "");
    else if (arg.startsWith("--chat-id=")) out.chatId = arg.replace(/^--chat-id=/, "");
  }
  return out;
}

function readStdin() {
  if (!process.stdin.isTTY) {
    const fs = require("fs");
    return fs.readFileSync(0, "utf8").trim();
  }
  return "";
}

function getMessageFromArgv(argv, afterSubcommand) {
  const arg = argv[afterSubcommand];
  if (arg !== undefined && arg !== "" && !arg.startsWith("--")) return arg;
  return readStdin();
}

function parseTimeout(argv) {
  for (let i = 2; i < argv.length; i++) {
    if (argv[i] === "--timeout" && argv[i + 1] != null)
      return parseInt(argv[i + 1], 10) || 60;
    if (argv[i].startsWith("--timeout="))
      return parseInt(argv[i].replace(/^--timeout=/, ""), 10) || 60;
  }
  return FEISHU_TURN_TIMEOUT;
}

function checkEnv() {
  const cfg = mb.getConfig ? mb.getConfig() : {};
  const appId = process.env.FEISHU_APP_ID || process.env.DITING_FEISHU_APP_ID || cfg.appId;
  const appSecret = process.env.FEISHU_APP_SECRET || process.env.DITING_FEISHU_APP_SECRET || cfg.appSecret;
  const chatId = process.env.FEISHU_CHAT_ID || process.env.DITING_FEISHU_CHAT_ID || cfg.chatId;
  const ok = (v) => v && String(v).trim().length > 0;
  const mask = (v) => (v && v.length > 8 ? v.slice(0, 4) + "***" + v.slice(-2) : "(未设置)");
  const fromFile = !process.env.FEISHU_APP_ID && !process.env.DITING_FEISHU_APP_ID && cfg.appId ? " (来自 ~/.message-bridge/config.json)" : "";

  console.log("飞书配置自检\n");
  console.log("  App ID:", ok(appId) ? mask(appId) + " ✓" + fromFile : "未设置 ✗");
  console.log("  App Secret:", ok(appSecret) ? "*** ✓" + fromFile : "未设置 ✗");
  console.log("  Chat ID (群聊):", ok(chatId) ? mask(chatId) + " ✓" : "未设置 ✗");

  const allOk = ok(appId) && ok(appSecret) && ok(chatId);
  if (allOk) {
    console.log("\n✅ 配置完整。可运行: npx skill-message-bridge send \"测试\"");
    process.exit(0);
  } else {
    console.log("\n❌ 请补全上述缺失项。");
    console.log("  使用 npx 配置: npx skill-message-bridge config set feishu --app-id=xxx --app-secret=xxx");
    console.log("  完整步骤见 docs/ONBOARDING-FEISHU.md");
    process.exit(1);
  }
}

function help() {
  console.log(`
skill-message-bridge — 飞书/钉钉/企微 消息桥梁（npx 优先，无需安装）

用法:
  npx skill-message-bridge <消息>              发到飞书并等待回复（默认 notify）
  npx skill-message-bridge notify <消息> [--timeout=N]  同上，可指定超时秒数
  npx skill-message-bridge send <消息>        只发送，不等待回复
  npx skill-message-bridge check-env          检查配置（环境变量或 ~/.message-bridge/config.json）
  npx skill-message-bridge config set feishu --app-id=xxx --app-secret=xxx [--chat-id=xxx]  写入配置文件
  npx skill-message-bridge config show        查看当前配置（脱敏）
  npx skill-message-bridge config path       显示配置文件路径
  npx skill-message-bridge connect           启动长连接，收到首条消息后输出 chat_id 并提示保存
  npx skill-message-bridge --help | -h       本帮助

配置: 优先使用环境变量 FEISHU_* / DITING_FEISHU_*；否则使用 ~/.message-bridge/config.json（可用 config set 写入）
首次使用与 Channel 选择: 见 SKILL.md「首次使用引导」；飞书完整引导见 docs/ONBOARDING-FEISHU.md
`);
  process.exit(0);
}

async function main() {
  const argv = process.argv.slice();
  const a0 = argv[2];

  if (!a0 || a0 === "--help" || a0 === "-h") {
    help();
    return;
  }

  if (a0 === "check-env") {
    checkEnv();
    return;
  }

  if (a0 === "config") {
    const sub = argv[3];
    if (sub === "set") {
      const channel = argv[4];
      if (channel !== "feishu") {
        console.error("当前仅支持 feishu。其他 channel 请到 GitHub 提 issue：https://github.com/hulk-yin/message-bridge/issues");
        process.exit(1);
      }
      const opts = parseConfigSetArgs(argv);
      const data = loadConfigFile();
      if (!data.feishu) data.feishu = {};
      if (opts.appId !== undefined) data.feishu.appId = opts.appId;
      if (opts.appSecret !== undefined) data.feishu.appSecret = opts.appSecret;
      if (opts.chatId !== undefined) data.feishu.chatId = opts.chatId;
      saveConfigFile(data);
      console.log("已写入 " + CONFIG_PATH);
      if (opts.chatId) console.log("chat_id 已保存，可运行 npx skill-message-bridge send \"测试\" 验证。");
      process.exit(0);
    }
    if (sub === "show") {
      const data = loadConfigFile();
      const f = data.feishu || {};
      const mask = (v) => (v && v.length > 0 ? (v.length > 8 ? v.slice(0, 4) + "***" + v.slice(-2) : v.slice(0, 2) + "***") : "(未设置)");
      console.log("feishu:");
      console.log("  appId:", f.appId ? mask(f.appId) : "(未设置)");
      console.log("  appSecret:", f.appSecret ? "***" : "(未设置)");
      console.log("  chatId:", f.chatId ? mask(f.chatId) : "(未设置)");
      process.exit(0);
    }
    if (sub === "path") {
      console.log(CONFIG_PATH);
      process.exit(0);
    }
    console.error("用法: config set feishu --app-id=xxx --app-secret=xxx [--chat-id=xxx] | config show | config path");
    process.exit(1);
  }

  if (a0 === "connect") {
    console.log("正在启动飞书长连接，请在飞书群中 @机器人 发送任意一条消息…\n");
    mb.runConnectMode()
      .then((chatId) => {
        console.log("\n已收到首条消息，群聊 chat_id:", chatId);
        console.log("请保存到配置: npx skill-message-bridge config set feishu --chat-id=" + chatId);
        if (mb.close) mb.close();
        process.exit(0);
      })
      .catch((err) => {
        console.error("连接或接收失败:", err.message);
        console.log("若无法收到消息，请先在飞书开放平台完成「事件订阅」→ 选择「长连接」→ 订阅 im.message.receive_v1。");
        if (mb.close) mb.close();
        process.exit(1);
      });
    return;
  }

  if (a0 === "send") {
    const message = getMessageFromArgv(argv, 3);
    if (!message) {
      console.error("错误: 请提供消息，例如 npx skill-message-bridge send \"内容\"");
      process.exit(1);
    }
    try {
      const result = await mb.send({ message });
      console.log(JSON.stringify(result));
      process.exit(0);
    } catch (err) {
      console.error(err.message);
      process.exit(1);
    } finally {
      if (mb.close) mb.close();
    }
    return;
  }

  if (a0 === "notify") {
    const timeout = parseTimeout(argv);
    const message = getMessageFromArgv(argv, 3);
    if (!message) {
      console.error("错误: 请提供消息，例如 npx skill-message-bridge notify \"内容\" [--timeout=60]");
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
      if (mb.close) mb.close();
    }
    return;
  }

  // 兼容：第一个参数直接是消息 → notify
  const message = getMessageFromArgv(argv, 2);
  if (!message) {
    console.log(JSON.stringify({ status: "error", reply: "", error: "empty message" }));
    process.exit(1);
  }
  try {
    const result = await mb.notify({ message, timeout: FEISHU_TURN_TIMEOUT });
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
    if (mb.close) mb.close();
  }
}

main();
