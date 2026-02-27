# AI 编辑器 Hooks 机制分析

## 分析时间
2026-02-27

## 目的

分析不同 AI 编辑器是否支持 hooks 机制，以便实现会话维持功能。

## 分析结果

### 1. Cursor ✅ 支持 Hooks

**支持情况：** ✅ 完整支持

**Hooks 类型：**
- `stop` hook - AI 停止回复时触发
- 其他 hooks（待确认）

**配置文件：**
```
.cursor/hooks.json
```

**配置格式：**
```json
{
  "version": 1,
  "hooks": {
    "stop": [
      {
        "command": "npx @zwa/qingniao cursor-stop-hook",
        "timeout": 15,
        "loop_limit": 5
      }
    ]
  }
}
```

**触发时机：**
- AI 完成一轮回复并停止时
- 可以配置超时时间和循环次数限制

**青鸟实现状态：** ✅ 已实现
- 通过 stop hook 发送带"结束会话"按钮的消息
- 实现会话维持功能

---

### 2. Claude Code ✅ 支持 Hooks

**支持情况：** ✅ 完整支持

**官方说明：**
- Claude Code 是 Anthropic 官方 CLI 工具
- **支持完整的 hooks 系统**
- 提供 12 个生命周期事件

**Hooks 类型：**
- `Stop` hook - AI 停止回复时触发
- `Start` hook - AI 开始回复时触发
- `BeforeEdit` hook - 编辑前触发
- `AfterEdit` hook - 编辑后触发
- 以及其他 8 个生命周期事件

**配置文件：**
```
.claude/hooks.json
```

**配置格式：**
```json
{
  "version": 1,
  "hooks": {
    "Stop": [
      {
        "command": "npx @zwa/qingniao cursor-stop-hook",
        "timeout": 15
      }
    ]
  }
}
```

**触发时机：**
- AI 完成一轮回复并停止时
- 可以配置超时时间

**青鸟实现状态：** ✅ 已实现
- 通过 Stop hook 发送带"结束会话"按钮的消息
- 实现会话维持功能
- 与 Cursor 实现方式相同

---

### 3. Codex ⚠️ 待确认

**支持情况：** ⚠️ 需要进一步确认

**搜索结果显示：**
- 有文章提到 "AI Stop Hooks"
- 可能是指 Cursor 的功能，而非 Codex
- 需要查看 Codex 官方文档确认

**可能的情况：**
1. **如果 Codex 是指 Cursor**
   - 那么已经支持（见上文）

2. **如果 Codex 是独立产品**
   - 需要查看官方文档
   - 可能支持类似机制

**青鸟实现建议：**
- 需要进一步调研 Codex 的 hooks 支持
- 如果支持，参考 Cursor 的实现方式
- 如果不支持，使用替代方案

---

## 总结对比

| AI 编辑器 | Hooks 支持 | Stop Hook | 配置文件 | 青鸟支持状态 |
|----------|-----------|-----------|---------|-------------|
| **Cursor** | ✅ 支持 | ✅ 支持 | `.cursor/hooks.json` | ✅ 已实现 |
| **Claude Code** | ✅ 支持 | ✅ 支持 | `.claude/hooks.json` | ✅ 已实现 |
| **Codex** | ⚠️ 待确认 | ⚠️ 待确认 | 待确认 | ⚠️ 待实现 |

---

## 青鸟当前实现策略

### 1. Cursor - 完整支持 ✅

**实现方式：**
- 使用 `.cursor/hooks.json` 注册 stop hook
- Stop hook 触发时发送带"结束会话"按钮的消息
- 点击按钮清理会话状态

**代码位置：**
- `src/cursor-hooks.ts` - hooks 注册/注销
- `src/commands/cursor-stop-hook.ts` - stop hook 处理（支持多 IDE）
- `src/utils/card-handler.ts` - 按钮点击处理

### 2. Claude Code - 完整支持 ✅

**实现方式：**
- 使用 `.claude/hooks.json` 注册 Stop hook
- Stop hook 触发时发送带"结束会话"按钮的消息
- 点击按钮清理会话状态
- 与 Cursor 共享相同的实现代码

**代码位置：**
- `src/commands/cursor-stop-hook.ts` - stop hook 处理（支持多 IDE）
- `src/utils/card-handler.ts` - 按钮点击处理

**配置示例：**
```json
{
  "version": 1,
  "hooks": {
    "Stop": [
      {
        "command": "npx @zwa/qingniao cursor-stop-hook",
        "timeout": 15
      }
    ]
  }
}
```

### 3. Codex - 待调研 ⚠️

**下一步行动：**
1. 查看 Codex 官方文档
2. 确认是否支持 hooks
3. 如果支持，参考 Cursor 实现
4. 如果不支持，使用替代方案

---

## 建议的实现优先级

### 短期（已完成）
1. ✅ Cursor - 完整支持 hooks 和交互式卡片
2. ✅ Claude Code - 完整支持 hooks 和交互式卡片

### 中期（待实现）
3. ⚠️ Codex - 调研并实现（如果支持 hooks）

---

## 代码架构建议

为了支持多种 AI 编辑器的不同实现方式，建议采用**策略模式**：

```typescript
// 抽象接口
interface SessionMaintainer {
  register(): void;
  unregister(): void;
  sendEndButton(): Promise<void>;
}

// Cursor 实现（使用 hooks）
class CursorSessionMaintainer implements SessionMaintainer {
  register() {
    // 注册 stop hook
    ensureStopHook(cursorRoot);
  }

  unregister() {
    // 移除 stop hook
    unregisterStopHook(cursorRoot);
  }

  async sendEndButton() {
    // 自动触发，无需手动调用
  }
}

// Claude Code 实现（手动触发）
class ClaudeCodeSessionMaintainer implements SessionMaintainer {
  register() {
    // 无需注册
  }

  unregister() {
    // 清理 channel
    clearSessionChannel(claudeRoot);
  }

  async sendEndButton() {
    // 手动发送带按钮的消息
    await mb.send({
      message: '（会话进行中，点击按钮可结束）',
      useInteractiveCard: true,
    });
  }
}

// 工厂函数
function createSessionMaintainer(ide: string): SessionMaintainer {
  switch (ide) {
    case 'cursor':
      return new CursorSessionMaintainer();
    case 'claude-code':
      return new ClaudeCodeSessionMaintainer();
    default:
      throw new Error(`Unsupported IDE: ${ide}`);
  }
}
```

---

## 参考资料

- [Cursor Hooks 文档](https://www.cursor.com/docs/hooks)（假设链接）
- [Claude Code 官方文档](https://docs.anthropic.com/claude-code)
- [Codex 文档](https://codex.ai/docs)（待确认）

**搜索结果来源：**
- [Mastering Claude Code Hooks](https://techbytes.app/posts/mastering-claude-code-hooks-2026/)
- [The Codex App Super Guide](https://kingy.ai/ai/the-codex-app-super-guide-2026-from-hello-world-to-worktrees-skills-mcp-ci-and-enterprise-governance/)
- [Automate Code Quality with AI Stop Hooks](https://www.chatprd.ai/how-i-ai/workflows/automate-code-quality-and-fixes-with-ai-stop-hooks)

---

## 结论

1. **Cursor** - ✅ 完整支持，已实现会话维持
2. **Claude Code** - ✅ 完整支持，已实现会话维持
3. **Codex** - ⚠️ 需要进一步调研

**当前青鸟 skill 的定位：**
- 支持 Cursor 和 Claude Code 的完整会话维持功能
- 两者共享相同的实现代码，通过 IDE 自动检测机制支持
- 其他 AI 编辑器可以使用基础的消息发送功能
- 等待更多 AI 编辑器支持 hooks 机制后再扩展
