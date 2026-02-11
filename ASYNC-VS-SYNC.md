# 阻塞 vs 非阻塞：AI 智能体调用 Skill 的超时问题

## 🔥 核心问题

**当 AI 智能体调用 MessageBridge Skill 等待用户回复时：**
- 如果用户长时间不回复，AI 会一直等待吗？
- AI 的工具调用有超时机制吗？
- 超时后 AI 会怎么处理？

## ❌ 阻塞版本的问题

### 代码示例

```javascript
// 阻塞版本
const result = await messageBridge.notify({
  message: "需要确认",
  timeout: 60,  // 60秒超时
});

// 问题：AI 会阻塞等待 60 秒！
// 在这期间，AI 什么都做不了
```

### 问题分析

```
时间线：
0s   → AI 发送消息
     → AI 开始等待...
     → AI 被阻塞，无法做其他事情
10s  → 用户还没回复
20s  → 用户还没回复
30s  → 用户还没回复
...
60s  → 超时！
     → AI 才能继续
```

### 影响

1. **资源浪费** - AI 在等待期间无法处理其他任务
2. **用户体验差** - 用户感觉 AI "卡住了"
3. **并发能力低** - 无法同时处理多个任务
4. **超时风险** - 如果用户长时间不回复，整个流程卡死

## ✅ 非阻塞版本的解决方案

### 方案对比

| 特性 | 阻塞版本 | 非阻塞版本 |
|------|---------|-----------|
| 发送消息后 | 等待回复 | 立即返回 |
| AI 状态 | 阻塞 | 继续工作 |
| 回复处理 | 同步返回 | 回调/事件 |
| 超时处理 | 抛出错误 | 触发回调 |
| 并发能力 | 低 | 高 |
| 资源利用 | 低 | 高 |

### 代码示例

#### 方式 1：回调函数

```javascript
// 非阻塞版本 - 回调
const taskId = await messageBridge.notifyAsync({
  message: "需要确认",
  timeout: 60,
  
  onReply: async (reply) => {
    console.log("收到回复:", reply);
    // 处理回复
  },
  
  onTimeout: async () => {
    console.log("超时了");
    // 处理超时
  },
});

// AI 立即继续工作
console.log("我可以继续做其他事情");
await doOtherWork();
```

#### 方式 2：事件监听

```javascript
// 监听事件
messageBridge.on("reply", (taskId, reply) => {
  console.log("收到回复:", reply);
});

messageBridge.on("timeout", (taskId) => {
  console.log("超时了");
});

// 发送通知（非阻塞）
const taskId = await messageBridge.notifyAsync({
  message: "需要确认",
  timeout: 60,
});

// AI 继续工作
console.log("我可以继续做其他事情");
```

#### 方式 3：状态查询

```javascript
// 发送通知
const taskId = await messageBridge.notifyAsync({
  message: "需要确认",
  timeout: 60,
});

// 定期查询状态
setInterval(() => {
  const status = messageBridge.getTaskStatus(taskId);
  
  if (status.status === "replied") {
    console.log("收到回复:", status.reply);
  } else if (status.status === "timeout") {
    console.log("超时了");
  }
}, 5000);  // 每5秒查询一次
```

## 📊 时间线对比

### 阻塞版本

```
0s   → AI 发送消息
     → AI 开始等待（阻塞）
     ↓
     ↓ (AI 什么都做不了)
     ↓
60s  → 超时或收到回复
     → AI 才能继续
```

### 非阻塞版本

```
0s   → AI 发送消息
     → AI 立即返回
     → AI 继续做其他事情 ✅
     ↓
     ↓ (AI 正常工作)
     ↓
10s  → 收到回复
     → 触发回调
     → 处理回复 ✅
```

## 🎯 实际应用场景

### 场景 1：批量操作

```javascript
// ❌ 阻塞版本 - 串行处理
for (const file of files) {
  const result = await messageBridge.notify({
    message: `删除 ${file}？`,
    timeout: 30,
  });
  // 每个文件都要等待 30 秒！
}

// ✅ 非阻塞版本 - 并行处理
const tasks = files.map(file => 
  messageBridge.notifyAsync({
    message: `删除 ${file}？`,
    timeout: 30,
    onReply: (reply) => {
      if (reply.includes("确认")) {
        deleteFile(file);
      }
    },
  })
);

// 所有通知同时发送，不阻塞
console.log("所有通知已发送，继续工作");
```

### 场景 2：长时间任务

```javascript
// ✅ 非阻塞版本
const taskId = await messageBridge.notifyAsync({
  message: "数据备份需要 30 分钟，是否继续？",
  timeout: 300,  // 5分钟超时
  
  onReply: async (reply) => {
    if (reply.includes("继续")) {
      // 开始备份
      await startBackup();
    }
  },
  
  onTimeout: async () => {
    // 超时，取消备份
    console.log("用户未确认，取消备份");
  },
});

// AI 继续做其他事情
console.log("等待用户确认，我先做其他事情");
await monitorSystem();
await generateReport();
```

### 场景 3：多步骤流程

```javascript
// ✅ 非阻塞版本
async function multiStepProcess() {
  // 步骤 1：发送通知
  const taskId = await messageBridge.notifyAsync({
    message: "步骤 1：需要确认",
    timeout: 60,
    
    onReply: async (reply) => {
      if (reply.includes("确认")) {
        // 步骤 2
        await step2();
      }
    },
  });

  // 同时做其他事情
  await prepareData();
  await checkResources();
}
```

## 🔧 OpenClaw 集成

### 工具调用超时配置

在 OpenClaw 配置中设置工具调用超时：

```json
{
  "agents": {
    "toolTimeout": 300,  // 5分钟
    "toolTimeoutBehavior": "cancel"  // cancel | continue
  }
}
```

### AI 智能体行为

```javascript
// AI 智能体应该这样使用
async function aiAgentTask() {
  // 使用非阻塞版本
  const taskId = await messageBridge.notifyAsync({
    message: "需要确认",
    timeout: 60,
    
    onReply: async (reply) => {
      // 处理回复
      await continueTask(reply);
    },
    
    onTimeout: async () => {
      // 超时处理
      await cancelTask();
    },
  });

  // 继续做其他事情
  return {
    status: "waiting",
    taskId: taskId,
    message: "已发送通知，等待用户回复",
  };
}
```

## 📋 最佳实践

### 1. 优先使用非阻塞版本

```javascript
// ✅ 推荐
const taskId = await messageBridge.notifyAsync({...});

// ❌ 不推荐（除非必须同步）
const result = await messageBridge.notify({...});
```

### 2. 设置合理的超时时间

```javascript
// 根据操作类型设置超时
const timeouts = {
  simple: 30,      // 简单确认：30秒
  normal: 60,      // 普通操作：1分钟
  complex: 300,    // 复杂操作：5分钟
  critical: 600,   // 关键操作：10分钟
};
```

### 3. 提供超时后的处理

```javascript
await messageBridge.notifyAsync({
  message: "需要确认",
  timeout: 60,
  
  onTimeout: async () => {
    // 超时后的处理
    await sendReminder();  // 发送提醒
    await logTimeout();    // 记录日志
    await cancelTask();    // 取消任务
  },
});
```

### 4. 使用事件监听处理多个任务

```javascript
// 统一的事件处理器
messageBridge.on("reply", (taskId, reply) => {
  handleReply(taskId, reply);
});

messageBridge.on("timeout", (taskId) => {
  handleTimeout(taskId);
});

// 发送多个通知
const tasks = await Promise.all([
  messageBridge.notifyAsync({...}),
  messageBridge.notifyAsync({...}),
  messageBridge.notifyAsync({...}),
]);
```

## 🎯 总结

| 问题 | 阻塞版本 | 非阻塞版本 |
|------|---------|-----------|
| AI 会一直等待吗？ | 是，直到超时 | 否，立即返回 |
| 有超时机制吗？ | 有，但会阻塞 | 有，触发回调 |
| 超时后怎么处理？ | 抛出错误 | 触发回调/事件 |
| 能做其他事情吗？ | 不能 | 可以 |
| 并发能力 | 低 | 高 |

**推荐：使用非阻塞版本（`notifyAsync`）+ 回调/事件处理** ✅
