"use strict";
/**
 * connect 命令处理器
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.connectCommand = connectCommand;
const mb = __importStar(require("../index"));
const config_1 = require("../config");
const constants_1 = require("../utils/constants");
/**
 * 执行 connect 命令
 */
async function connectCommand() {
    console.log('正在启动飞书长连接…\n');
    try {
        const chatId = await mb.runConnectMode();
        // 尝试发送引导消息
        try {
            await mb.send({ message: constants_1.FEISHU_PAIRING_SUCCESS_GUIDE, groupId: chatId });
        }
        catch {
            // 发送引导失败仍自动保存并提示
        }
        // 保存 chat_id
        const cfg = (0, config_1.loadConfigFile)();
        if (!cfg.feishu) {
            cfg.feishu = { appId: '', appSecret: '', chatId: '' };
        }
        cfg.feishu.chatId = chatId;
        (0, config_1.saveConfigFile)(cfg);
        console.log('\n已收到首条消息，会话 chat_id（群聊/私聊均可）:', chatId);
        console.log('已自动保存到 ' + (0, config_1.getConfigPath)() + '，可运行 npx @zwa/qingniao send "测试" 验证。');
        mb.close();
        process.exit(0);
    }
    catch (err) {
        console.error('连接或接收失败:', err.message);
        console.log('若无法收到消息，请先在飞书开放平台完成「事件订阅」→ 选择「长连接」→ 订阅 im.message.receive_v1。');
        mb.close();
        process.exit(1);
    }
}
