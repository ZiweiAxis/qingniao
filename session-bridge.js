/**
 * Session Bridge - 对话切换管理器
 * 
 * 实现 Claude Code ↔ 飞书/钉钉/微信 的无缝切换
 */

const messageBridge = require("./index.js");
const fs = require("fs").promises;
const path = require("path");

// 会话状态存储
const SESSION_DIR = path.join(__dirname, ".sessions");
const ACTIVE_SESSION_FILE = path.join(SESSION_DIR, "active.json");

/**
 * 会话状态
 */
class SessionState {
  constructor() {
    this.sessionId = null;
    this.platform = "terminal"; // terminal | feishu | dingtalk | wechat
    this.context = [];
    this.startTime = null;
    this.lastActivity = null;
  }

  toJSON() {
    return {
      sessionId: this.sessionId,
      platform: this.platform,
      context: this.context,
      startTime: this.startTime,
      lastActivity: this.lastActivity,
    };
  }

  static fromJSON(data) {
    const state = new SessionState();
    Object.assign(state, data);
    return state;
  }
}

/**
 * 会话桥接器
 */
class SessionBridge {
  constructor() {
    this.currentSession = new SessionState();
    this.isWaitingForSwitch = false;
  }

  /**
   * 初始化
   */
  async init() {
    // 确保会话目录存在
    await fs.mkdir(SESSION_DIR, { recursive: true });

    // 尝试恢复上次会话
    try {
      const data = await fs.readFile(ACTIVE_SESSION_FILE, "utf-8");
      this.currentSession = SessionState.fromJSON(JSON.parse(data));
      console.log(`[SessionBridge] 恢复会话: ${this.currentSession.sessionId}`);
    } catch (error) {
      // 没有活跃会话，创建新的
      this.currentSession.sessionId = `session_${Date.now()}`;
      this.currentSession.startTime = new Date().toISOString();
      await this.saveSession();
      console.log(`[SessionBridge] 创建新会话: ${this.currentSession.sessionId}`);
    }
  }

  /**
   * 保存会话状态
   */
  async saveSession() {
    await fs.writeFile(
      ACTIVE_SESSION_FILE,
      JSON.stringify(this.currentSession.toJSON(), null, 2)
    );
  }

  /**
   * 添加上下文
   */
  async addContext(role, content) {
    this.currentSession.context.push({
      role,
      content,
      timestamp: new Date().toISOString(),
    });
    this.currentSession.lastActivity = new Date().toISOString();

    // 限制上下文长度（保留最近 20 条）
    if (this.currentSession.context.length > 20) {
      this.currentSession.context = this.currentSession.context.slice(-20);
    }

    await this.saveSession();
  }

  /**
   * 检测切换意图
   */
  detectSwitch(userMessage) {
    const switchPatterns = {
      feishu: /切到飞书|飞书|手机|离开一下/i,
      dingtalk: /切到钉钉|钉钉/i,
      wechat: /切到微信|微信/i,
      back: /切回来|回来|继续/i,
    };

    for (const [platform, pattern] of Object.entries(switchPatterns)) {
      if (pattern.test(userMessage)) {
        return platform;
      }
    }

    return null;
  }

  /**
   * 切换到移动端
   */
  async switchToMobile(platform) {
    console.log(`[SessionBridge] 切换到 ${platform}`);

    // 保存当前平台
    const previousPlatform = this.currentSession.platform;
    this.currentSession.platform = platform;
    await this.saveSession();

    // 构建上下文摘要
    const contextSummary = this.buildContextSummary();

    // 发送切换通知
    const message = `🔄 对话已切换到 ${this.getPlatformName(platform)}\n\n` +
      `会话ID: ${this.currentSession.sessionId}\n` +
      `上下文: ${this.currentSession.context.length} 条消息\n\n` +
      `${contextSummary}\n\n` +
      `回复「切回来」可以切回终端`;

    const result = await messageBridge.send({ message });

    if (result.success) {
      console.log(`[SessionBridge] 切换成功，消息ID: ${result.messageId}`);
      this.isWaitingForSwitch = true;
      return true;
    } else {
      console.error(`[SessionBridge] 切换失败: ${result.error}`);
      this.currentSession.platform = previousPlatform;
      await this.saveSession();
      return false;
    }
  }

  /**
   * 切换回终端
   */
  async switchToTerminal() {
    console.log(`[SessionBridge] 切换回终端`);

    this.currentSession.platform = "terminal";
    this.isWaitingForSwitch = false;
    await this.saveSession();

    // 发送确认消息
    await messageBridge.send({
      message: `✅ 对话已切回终端\n\n会话ID: ${this.currentSession.sessionId}`,
    });

    return true;
  }

  /**
   * 构建上下文摘要
   */
  buildContextSummary() {
    const recentMessages = this.currentSession.context.slice(-5);
    
    if (recentMessages.length === 0) {
      return "（暂无上下文）";
    }

    let summary = "最近对话：\n";
    recentMessages.forEach((msg, index) => {
      const role = msg.role === "user" ? "你" : "AI";
      const content = msg.content.substring(0, 50);
      summary += `${index + 1}. ${role}: ${content}${msg.content.length > 50 ? "..." : ""}\n`;
    });

    return summary;
  }

  /**
   * 获取平台名称
   */
  getPlatformName(platform) {
    const names = {
      feishu: "飞书",
      dingtalk: "钉钉",
      wechat: "微信",
      terminal: "终端",
    };
    return names[platform] || platform;
  }

  /**
   * 处理用户消息
   */
  async handleMessage(userMessage) {
    // 添加到上下文
    await this.addContext("user", userMessage);

    // 检测切换意图
    const switchTarget = this.detectSwitch(userMessage);

    if (switchTarget) {
      if (switchTarget === "back") {
        // 切回终端
        if (this.currentSession.platform !== "terminal") {
          await this.switchToTerminal();
          return {
            switched: true,
            platform: "terminal",
            message: "对话已切回终端，可以继续了",
          };
        }
      } else {
        // 切到移动端
        const success = await this.switchToMobile(switchTarget);
        if (success) {
          return {
            switched: true,
            platform: switchTarget,
            message: `对话已切换到${this.getPlatformName(switchTarget)}，请在手机上继续`,
          };
        }
      }
    }

    // 没有切换，正常处理
    return {
      switched: false,
      platform: this.currentSession.platform,
    };
  }

  /**
   * 处理 AI 回复
   */
  async handleAIResponse(response) {
    await this.addContext("assistant", response);
  }

  /**
   * 获取当前状态
   */
  getStatus() {
    return {
      sessionId: this.currentSession.sessionId,
      platform: this.currentSession.platform,
      platformName: this.getPlatformName(this.currentSession.platform),
      contextLength: this.currentSession.context.length,
      startTime: this.currentSession.startTime,
      lastActivity: this.currentSession.lastActivity,
      isWaitingForSwitch: this.isWaitingForSwitch,
    };
  }
}

// 单例
let bridgeInstance = null;

/**
 * 获取会话桥接器实例
 */
async function getSessionBridge() {
  if (!bridgeInstance) {
    bridgeInstance = new SessionBridge();
    await bridgeInstance.init();
  }
  return bridgeInstance;
}

module.exports = {
  SessionBridge,
  getSessionBridge,
};
