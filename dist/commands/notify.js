"use strict";
/**
 * notify 命令处理器（发送并等待回复）
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
exports.notifyCommand = notifyCommand;
exports.heartbeatCommand = heartbeatCommand;
const mb = __importStar(require("../index"));
const cli_helpers_1 = require("../utils/cli-helpers");
const cursor_hooks_1 = require("../cursor-hooks");
const path = __importStar(require("path"));
const fs = __importStar(require("fs"));
const constants_1 = require("../utils/constants");
/**
 * 设置 channel
 */
function setChannel(cursorRoot, channel) {
    const channelPath = path.join(cursorRoot, '.cursor', constants_1.CHANNEL_FILE);
    fs.mkdirSync(path.dirname(channelPath), { recursive: true });
    fs.writeFileSync(channelPath, JSON.stringify({ channel }, null, 2), 'utf8');
}
/**
 * 执行 notify 命令（发送并等待回复）
 */
async function notifyCommand(argv) {
    const message = (0, cli_helpers_1.getMessageFromArgv)(argv, 2);
    const timeout = (0, cli_helpers_1.parseTimeout)(argv);
    if (!message) {
        console.log(JSON.stringify({ status: 'error', reply: '', error: 'empty message' }));
        process.exit(1);
    }
    const cursorRoot = (0, cli_helpers_1.getCursorRoot)(argv);
    if (cursorRoot) {
        (0, cursor_hooks_1.ensureStopHook)(cursorRoot);
        setChannel(cursorRoot, 'feishu');
    }
    try {
        const result = await mb.notify({ message, timeout });
        const out = {
            status: result.status || 'error',
            reply: result.reply || '',
            replyUser: result.replyUser || '',
            sessionHint: (0, cli_helpers_1.sessionHint)(result.status || 'error'),
        };
        if (result.error)
            out.error = result.error;
        console.log(JSON.stringify(out));
        (0, cli_helpers_1.printSessionReminder)();
        process.exit(result.status === 'error' ? 1 : 0);
    }
    catch (err) {
        const errOut = {
            status: 'error',
            reply: '',
            error: err.message,
            sessionHint: (0, cli_helpers_1.sessionHint)('error'),
        };
        console.log(JSON.stringify(errOut));
        (0, cli_helpers_1.printSessionReminder)();
        process.exit(1);
    }
    finally {
        mb.close();
    }
}
/**
 * 执行 heartbeat 命令（重新拉起会话）
 */
async function heartbeatCommand(argv) {
    const timeout = (0, cli_helpers_1.parseTimeout)(argv);
    try {
        const result = await mb.waitNextMessage(timeout);
        const out = {
            status: result.status,
            reply: result.reply || '',
            replyUser: result.replyUser || '',
            sessionHint: (0, cli_helpers_1.sessionHint)(result.status),
        };
        console.log(JSON.stringify(out));
        (0, cli_helpers_1.printSessionReminder)();
        process.exit(0);
    }
    catch (err) {
        const errOut = {
            status: 'error',
            reply: '',
            error: err.message,
            sessionHint: (0, cli_helpers_1.sessionHint)('error'),
        };
        console.log(JSON.stringify(errOut));
        (0, cli_helpers_1.printSessionReminder)();
        process.exit(1);
    }
    finally {
        mb.close();
    }
}
