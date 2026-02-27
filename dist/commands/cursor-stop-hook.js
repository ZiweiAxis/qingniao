"use strict";
/**
 * IDE stop-hook 命令处理器
 * 支持 Cursor、Claude Code、Codex 等 AI 编辑器
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
exports.cursorStopHookCommand = cursorStopHookCommand;
const path = __importStar(require("path"));
const fs = __importStar(require("fs"));
const mb = __importStar(require("../index"));
const cli_helpers_1 = require("../utils/cli-helpers");
const constants_1 = require("../utils/constants");
/**
 * 执行 IDE stop-hook 命令
 * 当 AI 编辑器停止时触发，发送带"结束会话"按钮的消息
 */
async function cursorStopHookCommand(argv) {
    const ideRoot = (0, cli_helpers_1.getCursorRoot)(argv);
    if (!ideRoot) {
        process.exit(0);
    }
    // 支持多种 IDE 的配置目录
    const possiblePaths = [
        path.join(ideRoot, '.cursor', constants_1.CHANNEL_FILE),
        path.join(ideRoot, '.claude', constants_1.CHANNEL_FILE),
        path.join(ideRoot, '.codex', constants_1.CHANNEL_FILE),
    ];
    let channel = '';
    for (const channelPath of possiblePaths) {
        try {
            if (fs.existsSync(channelPath)) {
                const raw = fs.readFileSync(channelPath, 'utf8');
                const data = JSON.parse(raw);
                channel = data.channel || '';
                if (channel)
                    break;
            }
        }
        catch {
            continue;
        }
    }
    if (channel !== 'feishu') {
        process.exit(0);
    }
    // 发送带结束按钮的续写消息
    try {
        await mb.send({
            message: '（AI 编辑器已停止，继续等待你的回复…）',
            useInteractiveCard: true, // 使用交互式卡片，带结束按钮
        });
    }
    catch {
        // 忽略错误
    }
    finally {
        mb.close();
    }
    process.exit(0);
}
