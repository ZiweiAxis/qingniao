# message-bridge SKILL 规范符合性分析

基于 Cursor create-skill 规范对 `SKILL.md` 的逐项对照（分析日期：按当前版本）。

---

## 一、元数据 (YAML frontmatter)

| 要求 | 现状 | 符合 |
|------|------|------|
| `name`：≤64 字符，仅小写/数字/连字符 | `message-bridge` | ✅ |
| `description`：非空，≤1024 字符 | 已写 WHAT + WHEN，含触发词（飞书、钉钉、企微、消息通知、审批确认、会话切换） | ✅ |
| 第三人称描述 | 「AI 智能体消息桥梁…」「在用户提到…时使用」 | ✅ |

---

## 二、描述质量 (Description Best Practices)

| 项 | 符合 |
|----|------|
| 第三人称，非 “I can help” / “You can use” | ✅ |
| 具体 + 触发词 | ✅ |
| 同时包含 WHAT 与 WHEN | ✅ |

---

## 三、篇幅与渐进披露 (Progressive Disclosure)

| 要求 | 现状 | 符合 |
|------|------|------|
| SKILL.md 建议 <500 行 | 当前约 288 行 | ✅ |
| 核心说明在 SKILL，细节进引用文件 | 配置/安装已链到 INSTALL、ONBOARDING-FEISHU；API 全文、npm 发布、技术实现/限制/未来计划仍在 SKILL 内 | ⚠️ 建议 |

**建议**：将「API 详细参数与返回值」「npm 发布与验证」「技术实现 / 限制 / 未来计划」迁到 `reference.md` 或已有 INSTALL/CONTRIBUTING，SKILL 中保留摘要 + 链接，便于发现且符合「渐进披露」。

---

## 四、引用深度与路径

| 要求 | 现状 | 符合 |
|------|------|------|
| 引用仅一层深度 | 仅链接到 `./INSTALL.md`、`./docs/ONBOARDING-FEISHU.md`、`./CONTRIBUTING.md` | ✅ |
| 无 Windows 风格路径 | 仅 `scripts/`、`docs/` | ✅ |

---

## 五、术语一致性

| 项 | 现状 | 符合 |
|----|------|------|
| 同一概念统一用词 | 文中混用「长连接」「WebSocket 长链接」；群 ID 有「群聊 ID」「chat_id」「FEISHU_CHAT_ID」 | ⚠️ 建议统一 |

**建议**：全文统一为「长连接」（与飞书文档一致）；群相关统一为「群聊 ID (chat_id)」或「FEISHU_CHAT_ID」并在首次出现时说明。

---

## 六、反模式与结构

| 项 | 符合 |
|----|------|
| 无时间敏感表述（如「2025 年 8 月前用旧 API」） | ✅ |
| 技能名具体（非 helper/utils） | ✅ |
| 未提供过多并列选项造成困惑 | ✅（npm vs 本地、require 两种写法为必要说明） |
| 步骤/工作流清晰 | ✅（配置自检、使用方式、会话切换闭环、测试） |

---

## 七、Utility Scripts 与执行说明

| 项 | 符合 |
|----|------|
| 脚本路径为 Unix 风格 | ✅ |
| 是否执行脚本已说明 | ✅（`npm run check-env`、`node test-quick.js`、`npm run turn` 等） |

---

## 八、Summary Checklist（create-skill 收尾清单）

### Core Quality
- [x] Description 具体且含关键触发词
- [x] Description 含 WHAT 与 WHEN
- [x] 第三人称
- [x] SKILL.md 正文 <500 行
- [ ] **术语一致**：建议统一「长连接」「群聊 ID / chat_id」
- [x] 示例具体（代码块、场景明确）

### Structure
- [x] 文件引用仅一层
- [ ] **渐进披露**：建议将 API 详情、发布流程、技术实现/限制/未来计划移至 reference 或已有文档
- [x] 工作流步骤清晰
- [x] 无时间敏感信息

### Scripts / Paths
- [x] 无 Windows 路径

---

## 九、结论与优先修改

- **整体**：符合 create-skill 大部分要求；元数据、描述、篇幅、引用深度、脚本说明均达标。
- **建议优先**：
  1. **术语**：全文统一「长连接」；群 ID 统一为「群聊 ID (chat_id)」并在首处注明。
  2. **渐进披露**：新增 `reference.md`，将 API 详细说明、npm 发布与验证、技术实现/限制/未来计划移入，SKILL 保留摘要与链接；或仅在 SKILL 中删减上述段落并改为「详见 INSTALL.md / CONTRIBUTING.md / README」。
  3. **可选**：在 SKILL 开头增加简短「Quick Start」小节（3–5 步），便于 agent 快速应用。

完成以上后，可视为与 create-skill 规范完全对齐。
