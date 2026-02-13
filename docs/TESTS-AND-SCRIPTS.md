# 测试与脚本说明

## 正式测试（保留）

所有测试位于 `tests/` 目录，在项目根目录执行：

| 文件 | 说明 | 命令 |
|------|------|------|
| `tests/test.js` | 主测试：校验配置、获取 token、可选发送到群聊 | `npm test` |
| `tests/test-quick.js` | 快速测试：调用 `notify()` 发一条并等回复（默认 60 秒超时） | `npm run test:quick` |
| `tests/test-complete.js` | 完整功能：依次测试 notify 与 send | `npm run test:complete` |
| `tests/test-session-bridge.js` | Session Bridge：模拟「切到飞书」与状态 | `npm run test:session-bridge` |
| `tests/test-cursor-hooks.js` | Cursor hooks：ensureStopHook / unregisterStopHook（临时目录，无需飞书） | `npm run test:hooks` |

以上除 `test:hooks` 外均需有效飞书配置（环境变量或 config 文件）；无 chat_id 时主测试仅校验凭证。

## 已删除（临时/调试，不再保留）

- `test-sdk.js` - 手写 SDK 测试，与 dist/index.js 能力重复
- `test-websocket.js` - 手写 WebSocket 测试，与主实现重复
- `test-ws-debug.js` - WebSocket 调试用
- `test-ws-final.js` / `test-ws-full.js` - 开发过程版本

## 示例（参考用，不参与发布主流程）

示例位于 `examples/` 目录：

| 文件 | 说明 | 运行 |
|------|------|------|
| `examples/example-claude-code.js` | Claude Code 中 Session Bridge 对话切换演示 | `node examples/example-claude-code.js` |
| `examples/example-ai-wrapper.js` | ai-wrapper 确认式执行示例 | `node examples/example-ai-wrapper.js` |
| `examples/ai-wrapper.js` | 确认式任务封装，被上述示例引用 | — |

## 脚本（scripts/）

| 文件 | 说明 |
|------|------|
| `scripts/feishu-conversation.js` | 纯飞书端对话（不经过 Cursor），`npm run conversation` |
| `scripts/session-bridge.js` | 会话切换逻辑（切到飞书/切回），被测试与示例引用 |

## 构建产物（dist/）

| 文件 | 说明 |
|------|------|
| `dist/index.js` | 主入口（由 `src/index.ts` 编译），notify/send + 长连接；使用前需 `npm run build` |
| `dist/cli.js` | CLI（由 `src/cli.ts` 编译），含 check-env、config、connect、send、notify、turn |

环境变量自检请用：`npm run check-env`（即 `node dist/cli.js check-env`）。  
**源码级验证**（发布前）：用 `npm run dev:cli -- <子命令>`（即 `ts-node src/cli.ts`），例如 `npm run dev:cli -- check-env`、`npm run dev:cli -- connect`，验证通过后再 `npm run build` 发布。
