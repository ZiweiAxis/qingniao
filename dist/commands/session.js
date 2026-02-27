"use strict";
/**
 * session 命令处理器
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
exports.sessionCloseCommand = sessionCloseCommand;
exports.sessionShowCommand = sessionShowCommand;
const path = __importStar(require("path"));
const fs = __importStar(require("fs"));
const cli_helpers_1 = require("../utils/cli-helpers");
const cursor_hooks_1 = require("../cursor-hooks");
const constants_1 = require("../utils/constants");
/**
 * 执行 session close 命令
 */
async function sessionCloseCommand(argv) {
    const cursorRoot = (0, cli_helpers_1.getCursorRoot)(argv);
    if (!cursorRoot) {
        console.log('未找到 .cursor 目录，无需清理');
        process.exit(0);
    }
    // 清空 channel
    const channelPath = path.join(cursorRoot, '.cursor', constants_1.CHANNEL_FILE);
    try {
        fs.unlinkSync(channelPath);
    }
    catch {
        // 文件不存在也算成功
    }
    // 移除 stop hook
    (0, cursor_hooks_1.unregisterStopHook)(cursorRoot);
    console.log('已清空会话 channel 并移除 stop hook');
    process.exit(0);
}
/**
 * 执行 session show 命令
 */
async function sessionShowCommand(argv) {
    const cursorRoot = (0, cli_helpers_1.getCursorRoot)(argv);
    if (!cursorRoot) {
        console.log('未找到 .cursor 目录');
        process.exit(0);
    }
    const channelPath = path.join(cursorRoot, '.cursor', constants_1.CHANNEL_FILE);
    try {
        const raw = fs.readFileSync(channelPath, 'utf8');
        const data = JSON.parse(raw);
        console.log('当前会话 channel:', data.channel || '(未设置)');
    }
    catch {
        console.log('当前会话 channel: (未设置)');
    }
    process.exit(0);
}
