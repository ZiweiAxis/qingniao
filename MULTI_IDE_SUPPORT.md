# 青鸟 Skill - 多 IDE 支持说明

## 概述

青鸟（qingniao）是一个**通用的 AI 编辑器消息桥梁 skill**，支持多种 AI 编辑器环境，包括但不限于：

- ✅ **Cursor** - AI-first 代码编辑器
- ✅ **Claude Code** - Anthropic 官方 CLI 工具
- ✅ **Codex** - AI 编程助手
- ✅ 其他支持 skill 机制的 AI 编辑器

## 多 IDE 支持实现

### 1. 自动检测 IDE 环境

青鸟会自动检测项目根目录中的 IDE 配置目录：

```typescript
// 支持的 IDE 标识目录
const ideMarkers = [
  '.cursor',   // Cursor
  '.claude',   // Claude Code
  '.codex',    // Codex
];
```

### 2. 通用的配置文件路径

会话 channel 文件会根据 IDE 类型存储在相应位置：

```
项目根目录/
├── .cursor/message-bridge-channel.json   # Cursor
├── .claude/message-bridge-channel.json   # Claude Code
└── .codex/message-bridge-channel.json    # Codex
```

### 3. 统一的 Hook 机制

Stop hook 命令支持所有 IDE：

```bash
# 命令名称保持不变，但支持多种 IDE
npx @zwa/qingniao cursor-stop-hook
```

**注意**：虽然命令名称包含 "cursor"，但实际上支持所有 IDE。这是为了保持向后兼容性。

#### Hooks 配置文件

各 IDE 的 hooks 配置文件位置：

```
项目根目录/
├── .cursor/hooks.json   # Cursor hooks 配置
├── .claude/hooks.json   # Claude Code hooks 配置
└── .codex/hooks.json    # Codex hooks 配置（待确认）
```

**Cursor hooks 配置示例：**
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

**Claude Code hooks 配置示例：**
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

**注意事项：**
- Cursor 使用小写 `"stop"`
- Claude Code 使用大写 `"Stop"`
- 两者的配置格式略有不同，但命令相同

## 使用方式

### 在 Cursor 中使用

```bash
# 1. 切换到飞书
用户说："切到飞书"

# 2. AI 回复会发送到飞书
# 3. Cursor 停止时显示"结束会话"按钮
# 4. 点击按钮结束会话
```

### 在 Claude Code 中使用

```bash
# 1. 切换到飞书
用户说："切到飞书"

# 2. AI 回复会发送到飞书
# 3. Claude Code 停止时显示"结束会话"按钮
# 4. 点击按钮结束会话
```

### 在 Codex 中使用

```bash
# 1. 切换到飞书
用户说："切到飞书"

# 2. AI 回复会发送到飞书
# 3. Codex 停止时显示"结束会话"按钮
# 4. 点击按钮结束会话
```

## 交互式卡片功能

### 按钮显示时机

当 AI 编辑器停止时，会发送带"结束会话"按钮的消息：

```
┌─────────────────────────────────────┐
│ 青鸟消息                            │
├─────────────────────────────────────┤
│ （AI 编辑器已停止，继续等待你的回复…）│
│                                     │
│ [结束会话]                          │
└─────────────────────────────────────┘
```

**注意**：消息文字已从"Cursor 已停止"改为"AI 编辑器已停止"，更加通用。

### 点击按钮后的行为

无论在哪个 IDE 中，点击"结束会话"按钮都会：

1. ✅ 清空对应 IDE 的 channel 文件
2. ✅ 移除 stop hook 配置
3. ✅ 后续对话不再发送到飞书

## 配置引导文字

配对成功时的引导消息也已更新为通用版本：

```
配对成功！已自动保存本会话，下次在 AI 编辑器（Cursor/Claude Code/Codex）
里你只要说「切换到飞书」「切到飞书」或「离开一会」，就可以把对话切到这里
继续和青鸟对话。会话结束时，点击消息下方的「结束会话」按钮即可。
```

## 技术实现

### 1. IDE 根目录查找

```typescript
function findIDERoot(): string | null {
  let dir = process.cwd();
  const ideMarkers = ['.cursor', '.claude', '.codex'];

  while (dir && dir !== path.dirname(dir)) {
    for (const marker of ideMarkers) {
      if (fs.existsSync(path.join(dir, marker))) {
        return dir;
      }
    }
    dir = path.dirname(dir);
  }
  return null;
}
```

### 2. Channel 文件清理

```typescript
function clearSessionChannel(ideRoot: string): void {
  const possiblePaths = [
    path.join(ideRoot, '.cursor', CHANNEL_FILE),
    path.join(ideRoot, '.claude', CHANNEL_FILE),
    path.join(ideRoot, '.codex', CHANNEL_FILE),
  ];

  for (const channelPath of possiblePaths) {
    try {
      if (fs.existsSync(channelPath)) {
        fs.unlinkSync(channelPath);
      }
    } catch {
      // 继续尝试其他路径
    }
  }
}
```

### 3. Stop Hook 消息

```typescript
await mb.send({
  message: '（AI 编辑器已停止，继续等待你的回复…）',
  useInteractiveCard: true,
});
```

## 扩展性

### 添加新的 IDE 支持

如果需要支持新的 IDE，只需在以下位置添加标识：

1. **cli-helpers.ts** - `findCursorRoot()` 函数
2. **card-handler.ts** - `findIDERoot()` 和 `clearSessionChannel()` 函数
3. **cursor-stop-hook.ts** - `possiblePaths` 数组

例如，添加对 `.vscode-ai` 的支持：

```typescript
const ideMarkers = [
  '.cursor',
  '.claude',
  '.codex',
  '.vscode-ai',  // 新增
];
```

## 向后兼容性

✅ **完全兼容** - 所有更改都是向后兼容的

- 现有的 Cursor 用户不受影响
- 函数名称保持不变（如 `getCursorRoot`）
- 配置文件路径保持不变
- API 接口保持不变

## 优势

1. **通用性强** - 支持多种 AI 编辑器
2. **易于扩展** - 添加新 IDE 支持很简单
3. **自动检测** - 无需手动配置 IDE 类型
4. **统一体验** - 所有 IDE 中的使用方式一致

## 文档更新

以下文档已更新为通用版本：

- ✅ `src/utils/constants.ts` - 配对成功引导
- ✅ `src/utils/card-handler.ts` - IDE 根目录查找
- ✅ `src/utils/cli-helpers.ts` - 多 IDE 支持
- ✅ `src/commands/cursor-stop-hook.ts` - 通用消息文字

## 总结

青鸟 skill 现在是一个**真正通用的 AI 编辑器消息桥梁**：

- ✅ 支持 Cursor、Claude Code、Codex 等多种 IDE
- ✅ 自动检测 IDE 环境
- ✅ 统一的使用体验
- ✅ 易于扩展新 IDE
- ✅ 完全向后兼容

无论你使用哪种 AI 编辑器，青鸟都能为你提供流畅的飞书消息桥梁服务！
