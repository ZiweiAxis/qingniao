# MessageBridge 参考

API 详细说明、发布流程、技术实现与限制。**推荐用法**：全部通过 npx 完成，见 [SKILL.md](./SKILL.md)。

**npx 命令**：`check-env` | `config set feishu --app-id=... --app-secret=... [--chat-id=...]` | `config show` | `config path` | `connect`（收首条消息输出 chat_id）| `send` | `notify`。配置优先环境变量，否则 `~/.message-bridge/config.json`。

---

## API 详细说明

### notify(params)

发送消息并等待用户回复。

**参数：**
- `message` (string, 必需) - 消息内容
- `timeout` (number, 可选) - 超时时间（秒），默认 60
- `platform` (string, 可选) - 平台类型，默认 "feishu"
- `userId` (string, 可选) - 用户 ID
- `groupId` (string, 可选) - 群聊 ID (chat_id)

**返回：**
```javascript
{
  success: true,
  status: "replied" | "timeout" | "error",
  reply: "用户回复内容",
  replyUser: "ou_xxx",
  timestamp: "2026-02-10T09:00:00.000Z"
}
```

### send(params)

仅发送消息，不等待回复。

**参数：**
- `message` (string, 必需) - 消息内容
- `platform` (string, 可选) - 平台类型，默认 "feishu"
- `userId` (string, 可选) - 用户 ID
- `groupId` (string, 可选) - 群聊 ID (chat_id)

**返回：**
```javascript
{
  success: true,
  messageId: "om_xxx"
}
```

---

## npm 发布与验证

**发布（需 npm 登录且开启 2FA 时带 OTP）：**

```bash
cd skills/message-bridge
npm run build
npm version patch   # 或 minor / major，按需
npm publish --access public --otp=<六位验证码>
```

**验证发布后的包：**

```bash
mkdir -p /tmp/mb-test && cd /tmp/mb-test
npm init -y
npm install @zwa/qingniao
node -e "const m=require('@zwa/qingniao'); console.log('send:', typeof m.send, 'notify:', typeof m.notify);"
npx @zwa/qingniao "测试"   # 需配置 FEISHU_* 环境变量
```

**在当前项目使用**：无需安装即可 `npx @zwa/qingniao send "..."` / `npx @zwa/qingniao check-env` 等。若需在代码中 `require`，再 `npm install @zwa/qingniao`，然后 `const { send, notify } = require("@zwa/qingniao");`。

---

## 技术实现

- **SDK**: `@larksuiteoapi/node-sdk`
- **连接方式**: 飞书事件订阅使用长连接（WebSocket）
- **消息格式**: JSON
- **超时处理**: Promise + setTimeout

---

## 限制

- 当前仅支持飞书平台
- 仅支持文本消息
- 简单的消息匹配逻辑（按时间顺序）

---

## 未来计划

- [ ] 支持钉钉、企业微信
- [ ] 支持富文本、卡片消息
- [ ] 改进消息匹配逻辑（基于 message_id）
- [ ] 支持多用户并发
- [ ] 添加消息历史记录

---

## 作者与许可

7号智创 - "7号，启航！" · MIT
