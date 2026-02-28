# MessageBridge（青鸟）

<p align="center">
  <img src="./docs/logo.png" alt="青鸟 Logo" width="200" />
</p>

<p align="center">
  <a href="https://github.com/hulk-yin/message-bridge/stargazers">
    <img src="https://img.shields.io/github/stars/hulk-yin/message-bridge?style=social" alt="Stars">
  </a>
  <a href="https://www.npmjs.com/package/@zwa/qingniao">
    <img src="https://img.shields.io/npm/v/@zwa/qingniao" alt="NPM Version">
  </a>
  <a href="./LICENSE">
    <img src="https://img.shields.io/npm/l/@zwa/qingniao" alt="License">
  </a>
</p>

---

AI 智能体的多渠道消息桥梁，实现「发消息」与「等回复」，支持与 AI 对话闭环。**对外可称「青鸟」**。当前已实现飞书；钉钉、企微等欢迎社区共建。

⭐ **如果这个项目对你有帮助，欢迎点个 Star！**

A multi-channel message bridge for AI agents: send messages and wait for replies. **Feishu is implemented; DingTalk, WeCom, etc. welcome community contributions.**

---

## 如何对接不同渠道 / Supported Channels

| 渠道 Channel | 状态 Status | 说明 |
|-------------|-------------|------|
| 飞书 Feishu | ✅ 已实现 | 需配置 `FEISHU_APP_ID` / `FEISHU_APP_SECRET` / `FEISHU_CHAT_ID`（或 `DITING_FEISHU_*`），长连接收消息。 |
| 钉钉 DingTalk | 📌 待共建 | 接口形态类似：发消息 + 收回复；接入步骤见 [CONTRIBUTING.md](./CONTRIBUTING.md#二新渠道接入--adding-a-new-channel)。 |
| 企微 WeCom | 📌 待共建 | 同上，欢迎按 CONTRIBUTING 清单提交适配。 |

扩展新渠道：在 `src/platforms/` 增加适配器并实现「发消息 + 将用户回复回填到队列」，详见 [CONTRIBUTING](./CONTRIBUTING.md)。

---

## 参与共建 / Community

欢迎补全其它 IM 渠道、补全文档与单测、或改进现有实现。请阅读 [CONTRIBUTING.md](./CONTRIBUTING.md)，按「新渠道接入」清单或「贡献流程」提 PR；**欢迎 AI 按文档参与贡献**（见 CONTRIBUTING「给 AI 贡献者」）。

---

## 快速开始 / Quick Start

**无需安装**，配置环境变量后直接使用 npx：

```bash
# 1. 配置环境变量（飞书示例，完整步骤见 docs/ONBOARDING-FEISHU.md）
export FEISHU_APP_ID="your_app_id"
export FEISHU_APP_SECRET="your_app_secret"
export FEISHU_CHAT_ID="oc_xxx"

# 2. 自检
npx @zwa/qingniao check-env

# 3. 使用
npx @zwa/qingniao send "测试"      # 只发
npx @zwa/qingniao "消息"           # 发并等回复
npx @zwa/qingniao --help
```

在仓库内开发时：`npm install` → `npm run build` → `npm run test:quick`。  
**源码级验证**（不构建 dist，直接跑 TS）：`npm run dev:cli -- check-env`、`npm run dev:cli -- connect` 等（等价于 `npx ts-node src/cli.ts <子命令>`），验证通过后再 `npm run build` 发布。

## 功能特性

✅ **消息发送** - 发送消息到飞书群聊  
✅ **等待回复** - 发送消息并等待用户回复  
✅ **实时接收** - WebSocket 长链接实时接收消息  
✅ **超时处理** - 可配置超时时间  
✅ **任务队列** - 支持多任务管理  

## 使用示例

```javascript
const messageBridge = require("./dist/index.js");

// 发送消息并等待回复
const result = await messageBridge.notify({
  message: "需要你确认一下",
  timeout: 60,
});

if (result.status === "replied") {
  console.log("用户回复:", result.reply);
}

// 仅发送消息
await messageBridge.send({
  message: "任务完成！",
});
```

## 文档 / Docs

- [INSTALL.md](./INSTALL.md) - **安装为 Cursor / Codex / Claude Code Skill**（中英）
- [CONTRIBUTING.md](./CONTRIBUTING.md) - 贡献流程、新渠道接入、单测与 AI 友好说明（中英）
- [SKILL.md](./SKILL.md) - 与 AI 技能/闭环使用相关的详细说明

## 测试与示例

**正式测试**（需配置飞书凭证或 config 文件，在项目根目录执行）：
- `npm test` — 主测试（凭证 + 发送）
- `npm run test:quick` — 快速 notify（发并等回复）
- `npm run test:complete` — 完整功能（notify + send）
- `npm run test:session-bridge` — Session Bridge（切到飞书/切回）

**示例**（参考用）：`examples/example-claude-code.js`、`examples/example-ai-wrapper.js`  
详见 [docs/TESTS-AND-SCRIPTS.md](./docs/TESTS-AND-SCRIPTS.md)。

## 技术栈

- Node.js
- @larksuiteoapi/node-sdk
- WebSocket 长链接

## 作者

7号智创 - "7号，启航！"

## 许可 / License

MIT

---

## 安装方式 / Install

- **npm**：`npm install @zwa/qingniao`（已上架 [npm](https://www.npmjs.com/package/@zwa/qingniao)）。代码中 `require("@zwa/qingniao")`，命令行 `npx @zwa/qingniao "..."`。
- **Skill（Cursor / Codex / Claude）**：见 **[INSTALL.md](./INSTALL.md)**，支持 Git 克隆到各环境 skill 目录或从 npm 安装后使用。

## English (short)

- **What**: Send messages and wait for user replies over IM (Feishu implemented; other channels welcome).
- **Quick start**: `npm install` → set `FEISHU_APP_ID` / `FEISHU_APP_SECRET` / `FEISHU_CHAT_ID` → `npm run build` → `npm run test:quick`.
- **API**: `notify({ message, timeout })` returns `{ status: "replied"|"timeout"|"error", reply, replyUser }`; `send({ message })` for fire-and-forget.
- **Contributing**: See [CONTRIBUTING.md](./CONTRIBUTING.md) for new channels, tests, and AI-friendly checklists.
