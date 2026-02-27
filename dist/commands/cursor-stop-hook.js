"use strict";
/**
 * cursor-stop-hook 命令处理器
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
 * 执行 cursor-stop-hook 命令
 */
async function cursorStopHookCommand(argv) {
    const cursorRoot = (0, cli_helpers_1.getCursorRoot)(argv);
    if (!cursorRoot) {
        process.exit(0);
    }
    const channelPath = path.join(cursorRoot, '.cursor', constants_1.CHANNEL_FILE);
    let channel = '';
    try {
        const raw = fs.readFileSync(channelPath, 'utf8');
        const data = JSON.parse(raw);
        channel = data.channel || '';
    }
    catch {
        process.exit(0);
    }
    if (channel !== 'feishu') {
        process.exit(0);
    }
    // 发送续写消息
    try {
        await mb.send({ message: '（Cursor 已停止，继续等待你的回复…）' });
    }
    catch {
        // 忽略错误
    }
    finally {
        mb.close();
    }
    process.exit(0);
}
