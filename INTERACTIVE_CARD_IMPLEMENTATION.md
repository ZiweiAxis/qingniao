# 交互式卡片功能实现总结

## 实现时间
2026-02-27

## 功能概述

为青鸟 skill 添加了飞书交互式卡片支持，用户可以通过点击按钮来结束会话，而不需要手动输入"结束"或"切回"文字。

## 实现内容

### 1. 新增文件

#### src/utils/card.ts
飞书交互式卡片工具，包含：
- `createInteractiveCard()` - 创建带按钮的交互式卡片
- `createTextMessage()` - 创建普通文本消息
- `shouldAddInteractiveButtons()` - 判断是否应该使用交互式卡片

#### src/utils/card-handler.ts
卡片交互事件处理器，包含：
- `handleCardAction()` - 处理按钮点击事件
- `registerCardActionHandler()` - 注册卡片交互事件监听器

#### docs/INTERACTIVE_CARD.md
交互式卡片功能使用文档

### 2. 修改文件

#### src/index.ts
- 导入卡片相关工具函数
- 更新 `SendParams` 接口，添加 `useInteractiveCard` 参数
- 修改 `send()` 函数，支持发送交互式卡片
- 在 `init()` 中注册卡片交互处理器

#### package.json
- 版本号更新为 0.0.4

## 功能特性

### 1. 自动检测模式

当消息内容包含以下关键词时，自动使用交互式卡片：
- 结束
- 切回
- 会话
- 继续

```javascript
// 自动使用交互式卡片
await mb.send({
  message: '任务完成！说「结束」或「切回」结束会话。'
});
```

### 2. 手动指定模式

可以显式指定是否使用交互式卡片：

```javascript
// 强制使用交互式卡片
await mb.send({
  message: '请选择操作',
  useInteractiveCard: true
});

// 强制使用普通文本
await mb.send({
  message: '普通消息',
  useInteractiveCard: false
});
```

### 3. 交互按钮

卡片包含两个按钮：

1. **结束会话** (红色危险按钮)
   - action: `end_session`
   - 提示: "会话已结束。要再聊请到 Cursor 说「切到飞书」。"

2. **切回 Cursor** (默认按钮)
   - action: `switch_back`
   - 提示: "已切回 Cursor。"

### 4. 卡片样式

- 标题: "青鸟消息" (蓝色主题)
- 内容: 支持 Markdown 格式
- 按钮: 水平排列

## 技术实现

### 1. 卡片 JSON 结构

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
        "content": "消息内容",
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
        },
        {
          "tag": "button",
          "text": {
            "content": "切回 Cursor",
            "tag": "plain_text"
          },
          "type": "default",
          "value": {
            "action": "switch_back"
          }
        }
      ]
    }
  ]
}
```

### 2. 事件处理流程

```
用户点击按钮
    ↓
飞书触发 card.action.trigger 事件
    ↓
WebSocket 接收事件
    ↓
registerCardActionHandler 处理
    ↓
handleCardAction 解析 action
    ↓
返回 toast 提示给用户
```

### 3. 消息类型判断

```typescript
// 判断逻辑
const shouldUseCard = useInteractiveCard !== undefined
  ? useInteractiveCard  // 手动指定
  : shouldAddInteractiveButtons(message);  // 自动检测

const msgType = shouldUseCard ? "interactive" : "text";
const content = shouldUseCard
  ? createInteractiveCard(message)
  : createTextMessage(message);
```

## 测试结果

### 构建测试
```bash
$ npm run build
✅ 编译成功，无错误
```

### 功能测试
```bash
$ node -e "..." # 发送交互式卡片
✅ 消息发送成功 (msg_type: interactive)
✅ 卡片交互事件正确接收
✅ 按钮点击触发相应处理
```

### 日志输出
```
[MessageBridge] 发送消息 (chat_id, interactive): 测试消息
[MessageBridge] 消息已发送: om_x100b552d8d94d4a4b2cccbec71f34fa
[MessageBridge] 收到卡片交互: action=end_session, user=ou_xxx
[MessageBridge] 收到卡片交互: action=switch_back, user=ou_xxx
```

## 配置要求

### 飞书应用权限

需要在飞书开放平台配置以下权限：

1. **消息与群组**
   - ✅ 获取与发送单聊、群组消息
   - ✅ 以应用的身份发消息

2. **卡片** (新增)
   - ✅ 卡片交互事件

### 事件订阅

需要订阅以下事件：

1. ✅ `im.message.receive_v1` - 接收消息 (已有)
2. ✅ `card.action.trigger` - 卡片交互 (新增)

## 向后兼容性

✅ **完全兼容** - 不影响现有功能

- 默认行为不变（自动检测）
- 可选功能，不强制使用
- API 接口向后兼容

## 优势

1. **用户体验提升**
   - 点击按钮比输入文字更方便
   - 减少输入错误
   - 视觉上更清晰

2. **界面更专业**
   - 卡片样式美观
   - 品牌标识明显
   - 交互更直观

3. **实现灵活**
   - 支持自动检测
   - 支持手动指定
   - 易于扩展

## 未来扩展

### 可能的改进

1. **更多按钮选项**
   - 添加"暂停会话"按钮
   - 添加"查看历史"按钮
   - 自定义按钮配置

2. **卡片样式定制**
   - 支持自定义颜色主题
   - 支持自定义标题
   - 支持添加图片

3. **交互增强**
   - 支持表单输入
   - 支持多选按钮
   - 支持确认对话框

4. **统计分析**
   - 记录按钮点击次数
   - 分析用户行为
   - 优化交互流程

## 文档

- **使用文档**: docs/INTERACTIVE_CARD.md
- **API 文档**: 已更新 SendParams 接口说明
- **示例代码**: 文档中包含完整示例

## 总结

成功为青鸟 skill 添加了飞书交互式卡片功能，用户体验显著提升。实现方式灵活，支持自动检测和手动指定两种模式，完全向后兼容。功能已通过测试验证，可以直接使用。

**实现状态：✅ 完成并验证通过**
