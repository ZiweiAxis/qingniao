# 首次使用引导：流程性与合理性说明

本文档说明当前「首次使用 → Channel 选择 → 飞书配置 → 权限 → 长连接 → 获取 chat_id」设计的**流程性与合理性**，便于后续迭代。

---

## 1. 流程概览

1. **入口**：用户执行任意 npx 命令（如 `check-env`、`send`）或阅读文档。
2. **Channel 选择**：默认飞书；若需其他 channel（钉钉/企微），引导到 GitHub Issues（先搜索已有 issue，有则给链接，无则引导创建）。
3. **飞书独立引导**：进入 [ONBOARDING-FEISHU.md](./ONBOARDING-FEISHU.md)。
4. **飞书子流程**：  
   创建应用 → 用 **npx config set** 写入 App ID/App Secret（~/.message-bridge/config.json）→ 按权限列表 JSON 在飞书后台开通权限 → **先启动 connect**（长连接）→ 在飞书后台配置事件订阅（长连接 + im.message.receive_v1）→ 群内 @机器人 发消息 → CLI 输出 chat_id → 用户执行 **config set --chat-id=xxx** → 完成。
5. **收尾**：`check-env`、`send "测试"` 验证。

---

## 2. 流畅性

- **单一入口**：所有配置与能力都通过 npx，无需改环境变量或找文档里的「环境变量汇总」复制粘贴。
- **配置持久化**：~/.message-bridge/config.json 一次写入，后续任意目录 npx 均生效，避免「只在当前 shell 生效」的困惑。
- **chat_id 获取**：通过 `connect` 收首条消息自动拿到 chat_id，减少用户去群 URL/API 查的步骤；若收不到，明确提示「先完成长连接事件订阅」。
- **Channel 未支持时**：统一走 GitHub Issues（先搜后建），避免散落讨论，也便于维护者统计需求。

---

## 3. 合理性

- **先连接再配事件订阅**：飞书长连接需本机先有进程连上，后台才能选「长连接」并保存；流程上「先 run connect，再在后台选长连接」符合平台限制。
- **权限列表 JSON**：飞书当前无官方「导入 JSON 一键开通」，用 JSON 做**清单与说明**，用户在后台按表勾选，既清晰又可被脚本/文档复用；若飞书日后支持导入，可再补说明。
- **config 与 env 并存**：环境变量优先，便于 CI/已有 Diting 等环境复用；本地开发用 config 文件更省事，且 npx config set 对非技术用户更友好。

---

## 4. 可改进点

- **GitHub issue 搜索**：当前为文档内「先搜索、有则给链接、无则新建」的文字引导；若后续做「npx skill-message-bridge request-channel dingtalk」类命令，可内嵌调用 GitHub API 搜索 issue 并返回链接或创建引导页。
- **权限导入**：若飞书开放「批量导入权限」接口或后台功能，可在文档与 CLI 中增加「使用 docs/feishu-permissions.json 导入」的步骤。
- **connect 超时**：`connect` 目前常驻直到收到首条消息；可增加 `--timeout=120` 等参数，超时后提示检查事件订阅与群内是否 @机器人。
