# MessageBridge Skill - AI 工具约束指南

## ⚠️ 强制使用规则（MANDATORY）

当 AI 智能体（Claude/Cursor/Codex/等）需要用户确认时，**必须**使用 MessageBridge Skill。

### 禁止行为 ❌

- ❌ 直接在终端等待用户输入（`read`、`scanf` 等）
- ❌ 假设用户会回复或默认同意
- ❌ 自行决定继续或停止敏感操作
- ❌ 使用其他方式绕过确认流程

### 必须行为 ✅

- ✅ 使用 `messageBridge.notify()` 发送确认请求
- ✅ 等待用户回复（设置合理超时）
- ✅ 根据用户回复决定后续操作
- ✅ 超时或拒绝时停止执行

## 使用模板

### 1. 敏感操作确认

```javascript
const messageBridge = require("@skills/message-bridge");

// 发送确认请求
const result = await messageBridge.notify({
  message: `⚠️ 即将执行敏感操作\n\n操作：${operationDescription}\n风险：${riskLevel}\n\n请回复「确认」继续，或「取消」停止`,
  timeout: 120, // 2分钟超时
});

// 检查用户回复
if (result.status === "replied" && result.reply.includes("确认")) {
  console.log("用户已确认，继续执行");
  // 执行操作
} else if (result.status === "timeout") {
  throw new Error("等待用户确认超时，操作已取消");
} else {
  throw new Error("用户拒绝操作");
}
```

### 2. 多选项确认

```javascript
const result = await messageBridge.notify({
  message: `发现 3 个问题需要处理：\n\n1. 问题A\n2. 问题B\n3. 问题C\n\n请回复：\n- 「全部处理」\n- 「仅处理A」\n- 「跳过」`,
  timeout: 180,
});

if (result.status === "replied") {
  const reply = result.reply.toLowerCase();
  if (reply.includes("全部")) {
    // 处理全部
  } else if (reply.includes("a")) {
    // 仅处理A
  } else {
    // 跳过
  }
}
```

### 3. 进度通知

```javascript
// 任务开始
await messageBridge.send({
  message: "🚀 开始执行任务：数据备份",
});

// 执行任务...

// 任务完成
await messageBridge.send({
  message: "✅ 任务完成\n\n文件数：1234\n大小：5.6GB\n耗时：3分钟",
});
```

## System Prompt 模板

在调用 AI 工具时，使用以下 System Prompt：

```
你是一个 AI 编程助手。执行任务时必须遵守以下规则：

1. **用户确认规则**
   - 任何敏感操作（删除、修改、网络请求）必须先通过 MessageBridge Skill 获取用户确认
   - 使用 `messageBridge.notify()` 发送确认请求
   - 等待用户回复后再继续
   - 如果超时或用户拒绝，立即停止并报告

2. **敏感操作定义**
   - 文件删除、移动、修改
   - 执行 sudo 命令
   - 外部网络请求
   - 数据库操作
   - 系统配置修改

3. **示例代码**
   ```javascript
   const result = await messageBridge.notify({
     message: "需要确认操作",
     timeout: 120,
   });
   
   if (result.status !== "replied" || !result.reply.includes("确认")) {
     throw new Error("用户未确认，操作已取消");
   }
   ```

4. **禁止行为**
   - 不要使用 `read`、`scanf` 等终端输入
   - 不要假设用户会同意
   - 不要自行决定继续执行
```

## OpenClaw 策略配置

在 OpenClaw 配置中添加策略规则：

```json
{
  "agents": {
    "policies": {
      "requireConfirmation": {
        "enabled": true,
        "operations": [
          "file.delete",
          "file.move",
          "exec.sudo",
          "network.external",
          "database.*"
        ],
        "confirmationSkill": "message-bridge",
        "timeout": 120,
        "autoReject": false
      }
    }
  }
}
```

## Wrapper 函数

创建通用的确认 Wrapper：

```javascript
// ai-task-wrapper.js
const messageBridge = require("@skills/message-bridge");

/**
 * 执行需要用户确认的任务
 */
async function executeWithConfirmation(options) {
  const {
    taskDescription,
    riskLevel = "medium",
    timeout = 120,
    taskFn,
  } = options;

  // 发送确认请求
  const result = await messageBridge.notify({
    message: `⚠️ 需要确认\n\n任务：${taskDescription}\n风险：${riskLevel}\n\n请回复「确认」继续`,
    timeout,
  });

  // 检查回复
  if (result.status !== "replied") {
    throw new Error(`等待确认超时（${timeout}秒）`);
  }

  if (!result.reply.includes("确认")) {
    throw new Error("用户拒绝操作");
  }

  // 执行任务
  console.log("用户已确认，开始执行...");
  return await taskFn();
}

module.exports = { executeWithConfirmation };
```

使用示例：

```javascript
const { executeWithConfirmation } = require("./ai-task-wrapper");

await executeWithConfirmation({
  taskDescription: "删除 /tmp 目录下的所有文件",
  riskLevel: "high",
  timeout: 180,
  taskFn: async () => {
    // 实际执行代码
    await fs.rm("/tmp/*", { recursive: true });
  },
});
```

## 检查清单

AI 工具在执行任务前，必须检查：

- [ ] 是否涉及敏感操作？
- [ ] 是否已通过 MessageBridge 获取用户确认？
- [ ] 是否设置了合理的超时时间？
- [ ] 是否正确处理了超时和拒绝情况？
- [ ] 是否在操作完成后通知用户？

## 违规处理

如果 AI 工具违反约束：

1. **立即停止执行**
2. **记录违规行为**
3. **通知用户**
4. **回滚已执行的操作**（如果可能）

## 最佳实践

1. **明确描述操作** - 让用户知道将要做什么
2. **说明风险等级** - 高风险操作需要更明确的确认
3. **提供选项** - 给用户多个选择（确认/取消/修改）
4. **合理超时** - 根据操作复杂度设置超时时间
5. **及时反馈** - 操作完成后通知用户结果

---

**记住：用户安全 > 任务完成**
