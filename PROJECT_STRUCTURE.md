# 青鸟 Skill 项目结构

## 优化后的目录结构

```
message-bridge/
├── src/                          # 源代码目录
│   ├── cli.ts                    # CLI 入口 (140 行)
│   ├── index.ts                  # 核心 API (314 行)
│   ├── types.ts                  # 类型定义
│   ├── errors.ts                 # 自定义错误类型
│   ├── cursor-hooks.ts           # Cursor hooks 集成
│   │
│   ├── commands/                 # 命令处理器模块
│   │   ├── index.ts              # 模块导出
│   │   ├── check-env.ts          # 环境检查命令
│   │   ├── config.ts             # 配置管理命令
│   │   ├── connect.ts            # 连接命令
│   │   ├── send.ts               # 发送消息命令
│   │   ├── notify.ts             # 通知命令（发送并等待）
│   │   ├── session.ts            # 会话管理命令
│   │   ├── hook.ts               # Hook 管理命令
│   │   └── cursor-stop-hook.ts   # Cursor stop hook
│   │
│   ├── config/                   # 配置管理模块
│   │   ├── index.ts              # 模块导出
│   │   ├── types.ts              # 配置类型定义
│   │   ├── loader.ts             # 配置加载器
│   │   ├── validator.ts          # 配置验证器
│   │   └── manager.ts            # 配置管理器（单例）
│   │
│   ├── utils/                    # 工具函数模块
│   │   ├── constants.ts          # 常量定义
│   │   ├── mask.ts               # 敏感信息脱敏
│   │   ├── prompt.ts             # 交互式输入
│   │   └── cli-helpers.ts        # CLI 辅助函数
│   │
│   └── connection/               # 连接管理模块
│       ├── index.ts              # 模块导出
│       ├── types.ts              # 连接类型定义
│       └── manager.ts            # 连接管理器
│
├── dist/                         # 编译输出目录
│   ├── cli.js                    # CLI 入口（带 shebang）
│   ├── index.js                  # 核心 API
│   ├── commands/                 # 命令处理器
│   ├── config/                   # 配置管理
│   ├── utils/                    # 工具函数
│   ├── connection/               # 连接管理
│   └── errors.js                 # 错误类型
│
├── tests/                        # 测试文件
│   ├── test.js                   # 主测试
│   ├── test-quick.js             # 快速测试
│   ├── test-complete.js          # 完整测试
│   ├── test-session-bridge.js    # 会话桥接测试
│   └── test-cursor-hooks.js      # Cursor hooks 测试
│
├── docs/                         # 文档目录
│   ├── ONBOARDING-FEISHU.md      # 飞书接入指南
│   └── feishu-permissions.json   # 飞书权限配置
│
├── scripts/                      # 脚本目录
│   └── feishu-conversation.js    # 飞书对话脚本
│
├── examples/                     # 示例目录
│   ├── example-claude-code.js    # Claude Code 示例
│   └── example-ai-wrapper.js     # AI 包装器示例
│
├── package.json                  # 项目配置
├── tsconfig.json                 # TypeScript 配置
├── README.md                     # 项目说明
├── SKILL.md                      # Skill 使用文档
├── INSTALL.md                    # 安装指南
├── CONTRIBUTING.md               # 贡献指南
├── CHANGELOG.md                  # 变更日志
├── reference.md                  # 参考文档
├── REFACTORING_SUMMARY.md        # 重构总结
├── VERIFICATION_REPORT.md        # 验证报告
└── PROJECT_STRUCTURE.md          # 项目结构（本文件）
```

## 模块说明

### 核心模块

#### cli.ts (140 行)
- CLI 命令路由入口
- 处理命令行参数
- 调用相应的命令处理器

#### index.ts (314 行)
- 核心 API 实现
- 消息发送和接收
- WebSocket 连接管理
- 任务队列管理

### 命令处理器模块 (commands/)

每个命令处理器负责一个特定的 CLI 命令：

- **check-env.ts**: 检查环境配置是否完整
- **config.ts**: 配置管理（show, set）
- **connect.ts**: 首次连接获取 Chat ID
- **send.ts**: 只发送消息，不等待回复
- **notify.ts**: 发送消息并等待回复
- **session.ts**: 会话管理（show, close）
- **hook.ts**: Cursor hooks 管理（register, unregister）
- **cursor-stop-hook.ts**: Cursor stop hook 处理

### 配置管理模块 (config/)

- **types.ts**: 配置类型定义
- **loader.ts**: 从环境变量和文件加载配置
- **validator.ts**: 配置验证和凭证验证
- **manager.ts**: ConfigManager 单例，支持缓存和热重载

### 工具函数模块 (utils/)

- **constants.ts**: 统一的常量定义（超时、重连参数等）
- **mask.ts**: 敏感信息脱敏（App ID, Secret, Chat ID）
- **prompt.ts**: 交互式输入（支持密码输入）
- **cli-helpers.ts**: CLI 辅助函数（参数解析、路径查找等）

### 连接管理模块 (connection/)

- **types.ts**: 连接状态和事件类型定义
- **manager.ts**: ConnectionManager 类，管理 WebSocket 连接

### 错误处理 (errors.ts)

自定义错误类型：
- MessageBridgeError - 基础错误类
- ConfigError - 配置错误
- ConnectionError - 连接错误
- TimeoutError - 超时错误
- ValidationError - 验证错误
- TaskError - 任务错误

## 文件统计

### 源代码
- TypeScript 文件: 26 个
- 总代码行数: ~1500 行
- 平均每个文件: ~58 行

### 主要文件行数
- cli.ts: 140 行（原 671 行，减少 79%）
- index.ts: 314 行（原 320 行）
- 命令处理器: 平均 ~80 行/文件
- 配置模块: 平均 ~60 行/文件
- 工具函数: 平均 ~50 行/文件

## 依赖关系

```
cli.ts
  └── commands/*
        ├── config/
        ├── utils/
        └── cursor-hooks.ts

index.ts
  └── config/
        └── utils/

commands/*
  ├── index.ts
  ├── config/
  ├── utils/
  └── cursor-hooks.ts

config/
  └── utils/

connection/
  └── utils/
```

## 构建输出

编译后的 dist/ 目录结构与 src/ 保持一致，所有 .ts 文件编译为 .js 和 .d.ts 文件。

## 配置文件

### package.json
- name: @zwa/qingniao
- version: 0.0.3
- main: dist/index.js
- bin: dist/cli.js

### tsconfig.json
- target: ES2020
- module: commonjs
- outDir: dist
- strict: true

## 总结

优化后的项目结构清晰、模块化，每个模块职责单一，易于维护和扩展。代码组织遵循最佳实践，为未来的功能扩展奠定了良好基础。
