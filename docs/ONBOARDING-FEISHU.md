# 飞书 Channel 引导：从零到可用

本文档是**飞书单 Channel 的完整引导**：创建应用 → 用 npx 配置 App ID/App Secret → 权限配置（含权限列表 JSON）→ 启动长连接与事件订阅 → 在群内发消息确认并保存 chat_id。  
**配置统一使用 npx 命令，写入 `~/.message-bridge/config.json`。**

---

## 一、前置条件

- 拥有**飞书企业账号**（或开发者账号创建企业）
- 本机已安装 Node.js（建议 18+）

---

## 二、创建企业自建应用并获取凭证

1. 打开 [飞书开放平台](https://open.feishu.cn/) 并登录。
2. **开发者后台** → **应用开发** → **创建企业自建应用**。
3. 填写应用名称（如「MessageBridge 机器人」）、描述，选择可见范围。
4. 创建完成后进入该应用 → **凭证与基础信息**。
5. 复制 **App ID**（形如 `cli_xxxxxxxxxx`）和 **App Secret**（点击「重置」可生成）。

---

## 三、用 npx 写入 App ID / App Secret

**无需安装**。两种方式任选其一：

- **方式 A（参数）**：在任意目录执行（将 `xxx` 替换为你的实际值）：
  ```bash
  npx @zwa/qingniao config set feishu --app-id=cli_xxxxxxxxxx --app-secret=你的AppSecret
  ```
- **方式 B（交互式）**：要出现「请输入 App ID」等提示，需**在本机终端里亲自执行**（不要通过助手代跑）：在项目目录执行 `npm run dev:cli -- config set feishu`，按提示输入 App ID、App Secret、Chat ID（可回车跳过）。npx 或助手代跑时多为非 TTY，不会出现交互提示。

配置会写入 **`~/.message-bridge/config.json`**。可执行 `npx @zwa/qingniao config path` 查看路径，`npx @zwa/qingniao config show` 查看当前配置（脱敏）。

---

## 四、权限配置（飞书后台 + 权限列表）

本 skill 需要以下飞书接口权限。飞书开放平台**当前为在后台按权限名搜索并开通**，暂无批量导入 JSON；本仓库提供权限清单 JSON 便于你逐项勾选。

**权限清单（可对照 [docs/feishu-permissions.json](./feishu-permissions.json)）：**

| 权限名 | 说明 |
|--------|------|
| `im:message` | 发送消息 |
| `im:message:send_as_bot` | 以机器人身份发消息 |
| `im:message:read_content` | 读取消息内容（接收回复） |
| `im:message:receive_v1` | 接收消息事件（长连接必开） |
| `im:chat:readonly` | 获取群信息（可选，用于拿 chat_id） |

**操作步骤：**

1. 在飞书开放平台 → 你的应用 → **权限管理** → **接口权限**。
2. 按上表在搜索框中搜索每个权限名，点击「开通」。
3. 若有「版本发布」或「生效范围」，请发布/生效到对应范围。

---

## 五、启动长连接并配置事件订阅

本 skill 通过**长连接**接收用户回复，必须先启动连接，再在飞书后台配置事件订阅。

### 5.1 先启动长连接（让飞书侧能识别「已连接」）

在终端执行（会持续运行直到收到首条消息）：

```bash
npx @zwa/qingniao connect
```

保持该命令运行，进入下一步。

### 5.2 在飞书后台配置事件订阅

1. 飞书开放平台 → 你的应用 → **事件订阅**（或「事件与回调」）。
2. **订阅方式**：选择 **「使用长连接接收事件」**（不要选「请求地址」）。
3. **订阅事件**：添加 **im.message.receive_v1**（接收用户发给机器人的消息）。
4. 保存配置。  
   若后台提示「等待长连接」，说明已识别到上一步的 `connect` 进程，保持 `connect` 运行即可。

官方说明：[使用长连接接收事件](https://open.feishu.cn/document/server-docs/event-subscription-guide/event-subscription-configure-/request-url-configuration-case-collection)。

### 5.3 在群聊或私聊中发消息确认并保存 chat_id

支持**群聊**与**私聊**两种方式，任选其一即可。

**方式 A：群聊**
1. 在飞书客户端**建群**（或使用已有群），并将**该应用添加为群机器人**（群设置 → 群机器人 → 添加机器人 → 选择你的应用）。
2. 在该群内 **@你的机器人** 发送任意一条消息（例如「测试」）。

**方式 B：私聊**
1. 在飞书客户端**与你的机器人发起私聊**（搜索应用名称或从「机器人」入口进入）。
2. 在私聊窗口向机器人发送任意一条消息（例如「测试」）。

3. 终端里运行中的 `npx @zwa/qingniao connect` 会收到消息并输出**会话 chat_id**（群聊或私聊均可，形如 `oc_xxxxxxxxxx`），并提示你执行：

```bash
npx @zwa/qingniao config set feishu --chat-id=oc_xxxxxxxxxx
```

4. 执行上述命令后，即完成 chat_id 的保存。

**若无法收到消息**：请先确认已在飞书后台完成 **事件订阅（长连接 + im.message.receive_v1）**；未配置长连接订阅时，无法收到消息。

---

## 六、自检与验证

完成上述步骤后，你应已有：App ID、App Secret（已通过 `config set` 写入）、chat_id（已通过 `config set --chat-id=xxx` 写入）。

```bash
# 自检（会读取 ~/.message-bridge/config.json）
npx @zwa/qingniao check-env

# 只发一条（不等待回复）
npx @zwa/qingniao send "飞书引导验证消息"

# 发并等回复
npx @zwa/qingniao "请回复测试" --timeout=60
```

---

## 七、常见问题

| 现象 | 可能原因 | 处理 |
|------|----------|------|
| 提示 appId / appSecret needed | 未写入配置或未设环境变量 | 使用 `npx @zwa/qingniao config set feishu --app-id=xxx --app-secret=xxx` |
| 收不到消息 / connect 无输出 | 未配置事件订阅或未选长连接 | 在飞书后台完成「事件订阅」→「长连接」→ 订阅 `im.message.receive_v1` |
| 发消息 400 / 无权限 | 权限未开通或机器人未入群/未私聊 | 按「四、权限配置」开通权限；群聊需把机器人加入目标群，私聊直接与机器人对话即可 |
| 不知道 chat_id | 未运行 connect 或未发消息 | 运行 `npx @zwa/qingniao connect`，在群聊或私聊中向机器人发一条消息，按输出执行 `config set feishu --chat-id=xxx` |

---

## 八、环境变量与配置文件优先级

- **优先**：环境变量 `FEISHU_APP_ID`、`FEISHU_APP_SECRET`、`FEISHU_CHAT_ID`（或 `DITING_FEISHU_*`）。
- **其次**：`~/.message-bridge/config.json`（由 `npx @zwa/qingniao config set feishu ...` 写入）。

推荐首次使用全程用 **npx config set** 写入配置文件，无需配置环境变量。
