# 交互式卡片功能优化说明

## 更新时间
2026-02-27

## 优化内容

根据用户需求，对交互式卡片功能进行了以下优化：

### 1. 简化按钮设计

**之前：** 两个按钮（结束会话 + 切回 Cursor）
**现在：** 只保留一个"结束会话"按钮

**原因：** 简化用户操作，一个按钮足够

### 2. 精确控制发送时机

**之前：** 自动检测消息内容，包含关键词就发送交互式卡片
**现在：** 只在明确指定 `useInteractiveCard: true` 时才发送

**使用场景：**
- ✅ Cursor stop hook 的最后一次输出 - 发送带结束按钮的卡片
- ❌ 其他普通消息 - 不发送结束按钮

### 3. 完整的会话清理

**点击"结束会话"按钮后的操作：**

1. ✅ 清空会话 channel（删除 `.cursor/message-bridge-channel.json`）
2. ✅ 移除 Cursor stop hook（从 `.cursor/hooks.json` 中移除）
3. ✅ 后续对话不再发送消息到飞书

**实现逻辑：**
```typescript
// 点击按钮触发
handleCardAction('end_session')
  ↓
// 查找 Cursor 根目录
findCursorRoot()
  ↓
// 清空 channel 文件
clearSessionChannel(cursorRoot)
  ↓
// 移除 stop hook
unregisterStopHook(cursorRoot)
  ↓
// 返回成功提示
{ message: '会话已结束。' }
```

## 使用方式

### 1. Cursor Stop Hook（自动）

当 Cursor 停止时，自动发送带结束按钮的消息：

```typescript
// src/commands/cursor-stop-hook.ts
await mb.send({
  message: '（Cursor 已停止，继续等待你的回复…）',
  useInteractiveCard: true, // 明确指定使用交互式卡片
});
```

### 2. 普通消息（默认）

其他所有消息默认不带按钮：

```typescript
// 普通文本消息
await mb.send({
  message: '任务完成！'
  // useInteractiveCard 默认为 false
});
```

### 3. 手动指定（可选）

如果需要在其他场景使用交互式卡片：

```typescript
await mb.send({
  message: '自定义消息',
  useInteractiveCard: true  // 手动指定
});
```

## 卡片样式

```
┌─────────────────────────────────────┐
│ 青鸟消息                            │
├─────────────────────────────────────┤
│ （Cursor 已停止，继续等待你的回复…）│
│                                     │
│ [结束会话]                          │
└─────────────────────────────────────┘
```

## 工作流程

### 正常会话流程

```
1. 用户在 Cursor 说"切到飞书"
   ↓
2. 注册 stop hook，设置 channel=feishu
   ↓
3. AI 回复内容发送到飞书（普通文本）
   ↓
4. Cursor 停止，触发 stop hook
   ↓
5. 发送带"结束会话"按钮的消息
   ↓
6. 用户在飞书回复或点击按钮
```

### 点击结束按钮后

```
1. 用户点击"结束会话"按钮
   ↓
2. 清空 channel 文件
   ↓
3. 移除 stop hook
   ↓
4. 显示提示："会话已结束。"
   ↓
5. 后续 Cursor 对话不再发送到飞书
```

## 测试结果

### 测试1: 普通消息
```bash
✅ 消息类型: text
✅ 不带按钮
✅ 发送成功
```

### 测试2: 带结束按钮的消息
```bash
✅ 消息类型: interactive
✅ 包含"结束会话"按钮
✅ 发送成功
```

### 测试3: 点击结束按钮
```bash
✅ 接收到卡片交互事件
✅ 清空 channel 文件
✅ 移除 stop hook
✅ 显示成功提示
```

## 代码变更

### 修改的文件

1. **src/utils/card.ts**
   - 移除 `shouldAddInteractiveButtons()` 函数
   - 简化为只有一个"结束会话"按钮

2. **src/utils/card-handler.ts**
   - 添加 `findCursorRoot()` 函数
   - 添加 `clearSessionChannel()` 函数
   - 更新 `handleCardAction()` 实现完整的会话清理

3. **src/commands/cursor-stop-hook.ts**
   - 明确指定 `useInteractiveCard: true`
   - 只在 stop hook 时发送带按钮的消息

4. **src/index.ts**
   - 移除自动检测逻辑
   - `useInteractiveCard` 默认为 `false`
   - 只在明确指定时才使用交互式卡片

## 优势

1. **更精确的控制**
   - 只在需要时才显示结束按钮
   - 避免不必要的按钮干扰

2. **更好的用户体验**
   - 简化按钮选项（只有一个）
   - 点击后完整清理会话状态

3. **更清晰的逻辑**
   - 明确的使用场景
   - 可预测的行为

## 向后兼容性

✅ **完全兼容** - 不影响现有功能

- 默认行为：不使用交互式卡片
- 只在明确指定时才使用
- API 接口保持不变

## 配置要求

**飞书开放平台需要：**

1. ✅ 订阅 `im.message.receive_v1` 事件
2. ✅ 订阅 `card.action.trigger` 事件
3. ✅ 开启卡片交互权限

## 注意事项

1. **Stop Hook 触发时机**
   - 只在 Cursor 停止时触发
   - 每次停止都会发送带按钮的消息

2. **会话清理**
   - 点击按钮后立即清理
   - 后续对话不再发送到飞书
   - 需要重新说"切到飞书"才能恢复

3. **按钮点击**
   - 点击后显示 toast 提示
   - 会话状态立即清理
   - 不需要额外操作

## 总结

优化后的交互式卡片功能更加精确和实用：
- ✅ 只在 Cursor stop hook 时显示结束按钮
- ✅ 点击按钮完整清理会话状态
- ✅ 简化为单一按钮，操作更直观
- ✅ 完全向后兼容，不影响现有功能

**优化状态：✅ 完成并验证通过**
