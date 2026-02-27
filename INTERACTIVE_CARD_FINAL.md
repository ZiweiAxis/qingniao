# 交互式卡片功能 - 最终版本说明

## 更新时间
2026-02-27

## 最终实现

根据用户需求，交互式卡片功能已完成以下优化：

### 1. 单一按钮设计 ✅
- 只保留一个"结束会话"按钮
- 移除了"切回 Cursor"按钮

### 2. 精确的发送时机 ✅
- **只在 Cursor stop hook 时发送**带结束按钮的消息
- 其他所有消息都是普通文本，不带按钮
- 不再自动检测消息内容

### 3. 完整的会话清理 ✅
点击"结束会话"按钮后：
- 清空 `.cursor/message-bridge-channel.json`
- 移除 `.cursor/hooks.json` 中的 stop hook
- 后续对话不再发送到飞书

### 4. 更新引导文字 ✅
- 配对成功消息改为："会话结束时，点击消息下方的「结束会话」按钮即可。"
- 不再提示"说「结束」或「切回」"

## 工作流程

### 正常使用流程

```
1. 用户在 Cursor 说"切到飞书"
   ↓
2. 注册 stop hook，设置 channel=feishu
   ↓
3. AI 回复发送到飞书（普通文本，无按钮）
   ↓
4. 用户在飞书回复
   ↓
5. AI 继续回复（普通文本，无按钮）
   ↓
6. Cursor 停止，触发 stop hook
   ↓
7. 发送"（Cursor 已停止，继续等待你的回复…）"
   + 显示"结束会话"按钮
   ↓
8. 用户选择：
   - 继续回复 → 循环继续
   - 点击"结束会话" → 清理并退出
```

### 点击按钮后的流程

```
用户点击"结束会话"
   ↓
触发 card.action.trigger 事件
   ↓
handleCardAction('end_session')
   ↓
findCursorRoot() - 查找项目根目录
   ↓
clearSessionChannel() - 删除 channel 文件
   ↓
unregisterStopHook() - 移除 stop hook
   ↓
返回 toast: "会话已结束。"
   ↓
后续 Cursor 对话不再发送到飞书
```

## 代码实现

### 关键文件

1. **src/utils/card.ts**
   - `createInteractiveCard()` - 创建单按钮卡片
   - `createTextMessage()` - 创建普通文本

2. **src/utils/card-handler.ts**
   - `handleCardAction()` - 处理按钮点击
   - `findCursorRoot()` - 查找项目根目录
   - `clearSessionChannel()` - 清空 channel
   - `registerCardActionHandler()` - 注册事件处理器

3. **src/commands/cursor-stop-hook.ts**
   - 明确指定 `useInteractiveCard: true`
   - 只在 stop hook 时发送带按钮的消息

4. **src/index.ts**
   - `send()` 函数默认 `useInteractiveCard: false`
   - 只在明确指定时才使用交互式卡片

5. **src/utils/constants.ts**
   - 更新 `FEISHU_PAIRING_SUCCESS_GUIDE` 提示文字

### 卡片 JSON 结构

```json
{
  "config": {
    "wide_screen_mode": true
  },
  "header": {
    "template": "blue",
    "title": {
      "content": "青鸟消息",
      "tag": "plain_text"
    }
  },
  "elements": [
    {
      "tag": "div",
      "text": {
        "content": "（Cursor 已停止，继续等待你的回复…）",
        "tag": "lark_md"
      }
    },
    {
      "tag": "action",
      "actions": [
        {
          "tag": "button",
          "text": {
            "content": "结束会话",
            "tag": "plain_text"
          },
          "type": "danger",
          "value": {
            "action": "end_session"
          }
        }
      ]
    }
  ]
}
```

## 使用示例

### 示例1：普通消息（默认）

```typescript
await mb.send({
  message: 'AI 的回复内容'
  // useInteractiveCard 默认为 false
  // 发送普通文本，不带按钮
});
```

### 示例2：Stop Hook 消息（带按钮）

```typescript
await mb.send({
  message: '（Cursor 已停止，继续等待你的回复…）',
  useInteractiveCard: true
  // 发送交互式卡片，带"结束会话"按钮
});
```

## 配置要求

### 飞书开放平台

1. **事件订阅**
   - ✅ `im.message.receive_v1` - 接收消息
   - ✅ `card.action.trigger` - 卡片交互

2. **权限配置**
   - ✅ 获取与发送单聊、群组消息
   - ✅ 以应用的身份发消息
   - ✅ 卡片交互事件

## 测试验证

### 测试1：普通消息
```bash
✅ 消息类型: text
✅ 不带按钮
✅ 发送成功
```

### 测试2：Stop Hook 消息
```bash
✅ 消息类型: interactive
✅ 包含"结束会话"按钮
✅ 发送成功
```

### 测试3：点击按钮
```bash
✅ 接收卡片交互事件
✅ 清空 channel 文件
✅ 移除 stop hook
✅ 显示"会话已结束。"
```

## 用户体验

### 优势

1. **更直观** - 按钮比文字指令更清晰
2. **更方便** - 点击比输入更快捷
3. **更精确** - 只在需要时才显示
4. **更完整** - 点击后彻底清理状态

### 使用场景

- ✅ Cursor 停止时自动显示按钮
- ✅ 用户可以点击按钮结束会话
- ✅ 也可以继续回复消息
- ✅ 灵活选择，不强制

## 注意事项

1. **按钮显示时机**
   - 只在 Cursor stop hook 触发时显示
   - 每次 Cursor 停止都会显示
   - 不影响正常消息发送

2. **会话清理**
   - 点击按钮立即清理
   - 清理后需要重新"切到飞书"
   - 清理是彻底的，不可恢复

3. **兼容性**
   - 用户仍可通过文字说"结束"或"切回"
   - AI 会识别这些文字并执行 session close
   - 按钮是额外的便捷方式

## 文档更新

- ✅ `src/utils/constants.ts` - 更新配对成功引导
- ✅ `INTERACTIVE_CARD_OPTIMIZATION.md` - 优化说明
- ✅ `INTERACTIVE_CARD_FINAL.md` - 最终版本说明（本文件）

## 版本信息

- **版本**: 0.0.4
- **发布日期**: 2026-02-27
- **状态**: ✅ 完成并验证通过

## 总结

交互式卡片功能已按照用户需求完成最终优化：

1. ✅ 单一"结束会话"按钮
2. ✅ 只在 Cursor stop hook 时显示
3. ✅ 点击后完整清理会话状态
4. ✅ 更新了引导文字
5. ✅ 完全向后兼容

用户现在可以通过点击按钮轻松结束会话，体验更加流畅和直观。
