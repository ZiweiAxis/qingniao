#!/usr/bin/env node
/**
 * 飞书环境变量自检（不请求飞书 API，不泄露凭证）
 * 用法：node scripts/check-feishu-env.js
 */

const appId = process.env.FEISHU_APP_ID || process.env.DITING_FEISHU_APP_ID;
const appSecret = process.env.FEISHU_APP_SECRET || process.env.DITING_FEISHU_APP_SECRET;
const chatId = process.env.FEISHU_CHAT_ID || process.env.DITING_FEISHU_CHAT_ID;

const ok = (name, value) => value && String(value).trim().length > 0;
const mask = (v) => (v && v.length > 8 ? v.slice(0, 4) + "***" + v.slice(-2) : "(未设置)");

console.log("飞书环境变量自检\n");
console.log("  FEISHU_APP_ID (或 DITING_FEISHU_APP_ID):", ok("APP_ID", appId) ? mask(appId) + " ✓" : "未设置 ✗");
console.log("  FEISHU_APP_SECRET (或 DITING_FEISHU_APP_SECRET):", ok("APP_SECRET", appSecret) ? "*** ✓" : "未设置 ✗");
console.log("  FEISHU_CHAT_ID (或 DITING_FEISHU_CHAT_ID):", ok("CHAT_ID", chatId) ? mask(chatId) + " ✓" : "未设置 ✗");

const allOk = ok("APP_ID", appId) && ok("APP_SECRET", appSecret) && ok("CHAT_ID", chatId);
if (allOk) {
  console.log("\n✅ 环境变量完整，可运行 node test-quick.js 做真实收发测试。");
  process.exit(0);
} else {
  console.log("\n❌ 请补全上述缺失项。完整步骤见 docs/ONBOARDING-FEISHU.md");
  process.exit(1);
}
