# 飞书交互式卡片功能

## 功能说明

青鸟 skill 现在支持发送带有交互按钮的飞书卡片消息，用户可以通过点击按钮来结束会话，而不需要手动输入"结束"或"切回"。

## 使用方式

### 1. 自动检测模式（推荐）

当消息内容包含特定关键词时，会自动使用交互式卡片：

```javascript
const mb = require('@zwa/qingniao');

// 消息中包含"结束"、"切回"、"会话"等关键词时，自动使用交互式卡片
await mb.send({
  message: '任务完成！说「结束」或「切回」结束会话。'
});
```

**触发关键词：**
- 结束
- 切回
- 会话
- 继续

### 2. 手动指定模式

显式指定是否使用交互式卡片：

```javascript
// 强制使用交互式卡片
await mb.send({
  message: '请选择操作',
  useInteractiveCard: true
});

// 强制使用普通文本消息
await mb.send({
  message: '这是一条普通消息',
  useInteractiveCard: false
});
```

## 交互按钮

卡片包含两个按钮：

1. **结束会话** (红色按钮)
   - 点击后会话结束
   - 显示提示："会话已结束。要再聊请到 Cursor 说「切到飞书」。"

2. **切回 Cursor** (默认按钮)
   - 点击后切回 Cursor
   - 显示提示："已切回 Cursor。"

## 卡片样式

交互式卡片包含：
- **标题**：青鸟消息（蓝色主题）
- **内容**：消息文本（支持 Markdown）
- **按钮**：结束会话 / 切回 Cursor

## 示例效果

```
┌─────────────────────────────────────┐
│ 青鸟消息                            │
├─────────────────────────────────────┤
│ 任务完成！说「结束」或「切回」结束  │
│ 会话。                              │
│                                     │
│ [结束会话]  [切回 Cursor]           │
└─────────────────────────────────────┘
```

## CLI 使用

CLI 命令会自动检测消息内容并使用交互式卡片：

```bash
# 自动使用交互式卡片（消息包含关键词）
npx @zwa/qingniao send "任务完成！说「结束」或「切回」结束会话。"

# 普通文本消息（不包含关键词）
npx @zwa/qingniao send "这是一条普通消息"
```

## 技术实现

### 1. 卡片生成

使用 `src/utils/card.ts` 中的函数：

```typescript
// 创建交互式卡片
createInteractiveCard(message: string): string

// 创建普通文本消息
createTextMessage(message: string): string

// 判断是否应该使用交互式卡片
shouldAddInteractiveButtons(message: string): boolean
```

### 2. 事件处理

使用 `src/utils/card-handler.ts` 处理按钮点击事件：

```typescript
// 注册卡片交互处理器
registerCardActionHandler(eventDispatcher: lark.EventDispatcher): void

// 处理按钮点击
handleCardAction(action: string): { shouldEndSession: boolean; message: string }
```

### 3. 事件订阅

需要在飞书开放平台订阅以下事件：

- `im.message.receive_v1` - 接收消息（已有）
- `card.action.trigger` - 卡片交互事件（新增）

## 配置要求

### 飞书应用权限

确保飞书应用具有以下权限：

1. **消息与群组**
   - 获取与发送单聊、群组消息
   - 以应用的身份发消息

2. **卡片**
   - 卡片交互事件

### 事件订阅

在飞书开放平台 → 事件订阅 → 添加事件：

- ✅ `im.message.receive_v1` - 接收消息
- ✅ `card.action.trigger` - 卡片交互

## 优势

1. **用户体验更好**
   - 点击按钮比输入文字更方便
   - 视觉上更清晰

2. **减少误操作**
   - 明确的按钮选项
   - 避免输入错误

3. **更专业的界面**
   - 卡片样式更美观
   - 品牌标识更明显

## 向后兼容

- ✅ 完全向后兼容
- ✅ 不影响现有功能
- ✅ 可选功能，默认自动检测

## 注意事项

1. **事件订阅**：需要在飞书开放平台订阅 `card.action.trigger` 事件
2. **权限配置**：确保应用有卡片相关权限
3. **长连接**：卡片交互事件通过 WebSocket 接收，需要保持连接

## 故障排查

### 问题：点击按钮没有反应

**解决方案：**
1. 检查飞书开放平台是否订阅了 `card.action.trigger` 事件
2. 确认应用有卡片交互权限
3. 查看日志是否有 `[MessageBridge] 收到卡片交互` 输出

### 问题：卡片显示异常

**解决方案：**
1. 检查消息类型是否为 `interactive`
2. 确认卡片 JSON 格式正确
3. 查看飞书返回的错误信息

## 更新日志

### v0.0.4 (2026-02-27)

- ✅ 新增交互式卡片支持
- ✅ 自动检测消息内容决定是否使用卡片
- ✅ 支持手动指定卡片模式
- ✅ 添加"结束会话"和"切回 Cursor"按钮
- ✅ 实现卡片交互事件处理
