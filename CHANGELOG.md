# Changelog

## [0.2.0-beta.1] - 2026-02-12

### Added

- **交互式配置**：`config set feishu` 无参数时在 TTY 下依次提示输入 App ID、App Secret、Chat ID；已有项可直接回车保留，不修改原值。
- **App Secret 密文输入**：交互输入 App Secret 时终端仅显示 `*`，不回显明文。
- **Chat ID 可选重新配对**：已配置 Chat ID 时，可选择输入 `1` 或 `new` 重新配对，自动进入 connect 获取新会话。
- **config 后自动 connect**：交互式配置时若未填 Chat ID（或选择重新配对），保存 App ID/Secret 后自动进入 connect，引导用户在飞书发首条消息。
- **配对成功自动保存**：connect 收到首条消息后自动将 chat_id 写入 `~/.message-bridge/config.json`，无需用户再执行保存命令。
- **配对成功飞书引导**：收到首条消息后向该会话发送引导文案，说明「切换到飞书」「切到飞书」「离开一会」「结束」「切回」等用法。
- **初始化完成提示**：长连接初始化完成后在终端提示「请到飞书群聊或私聊中向机器人发送任意一条消息」。

### Changed

- 非 TTY 且无参数时，提示用户在本机终端执行 `npm run dev:cli -- config set feishu` 以使用交互式引导。
- 飞书配对成功文案改为面向用户的简短说明，与 SKILL 中「会话切换到飞书」一致。

### Fixed

- CLI 密文输入时 `rl.output` 的 TypeScript 类型问题（改为使用 `process.stdout`）。

---

## [0.1.2] - 此前

- 飞书发送/接收、check-env、config、connect、send、notify 等基础能力。
