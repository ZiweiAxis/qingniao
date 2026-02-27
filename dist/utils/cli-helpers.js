"use strict";
/**
 * CLI 辅助函数
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
exports.findCursorRoot = findCursorRoot;
exports.getCursorRoot = getCursorRoot;
exports.parseTimeout = parseTimeout;
exports.getMessageFromArgv = getMessageFromArgv;
exports.parseConfigSetArgs = parseConfigSetArgs;
exports.sessionHint = sessionHint;
exports.printSessionReminder = printSessionReminder;
const path = __importStar(require("path"));
const fs = __importStar(require("fs"));
const constants_1 = require("../utils/constants");
/**
 * 从某目录向上查找包含 IDE 配置目录的项目根
 * 支持 .cursor、.claude、.codex 等
 */
function findCursorRoot(startDir) {
    let dir = path.resolve(startDir);
    const ideMarkers = ['.cursor', '.claude', '.codex'];
    while (dir && dir !== path.dirname(dir)) {
        for (const marker of ideMarkers) {
            if (fs.existsSync(path.join(dir, marker))) {
                return dir;
            }
        }
        dir = path.dirname(dir);
    }
    return null;
}
/**
 * 从 argv 解析 --dir= 或 --dir 作为项目根，否则从 cwd 查找
 */
function getCursorRoot(argv) {
    for (let i = 2; i < argv.length; i++) {
        if (argv[i] === '--dir' && argv[i + 1] != null) {
            return path.resolve(argv[i + 1]);
        }
        if (argv[i].startsWith('--dir=')) {
            return path.resolve(argv[i].replace(/^--dir=/, ''));
        }
    }
    return findCursorRoot(process.cwd());
}
/**
 * 解析超时参数
 */
function parseTimeout(argv) {
    const envTimeout = parseInt(process.env.FEISHU_TURN_TIMEOUT || String(constants_1.DEFAULT_TIMEOUT_SEC), 10);
    let sec = envTimeout;
    for (let i = 2; i < argv.length; i++) {
        if (argv[i] === '--timeout' && argv[i + 1] != null) {
            sec = parseInt(argv[i + 1], 10);
            if (sec <= 0)
                sec = constants_1.MAX_SAFE_TIMEOUT_SEC;
            else if (Number.isNaN(sec))
                sec = 60;
            break;
        }
        if (argv[i].startsWith('--timeout=')) {
            sec = parseInt(argv[i].replace(/^--timeout=/, ''), 10);
            if (sec <= 0)
                sec = constants_1.MAX_SAFE_TIMEOUT_SEC;
            else if (Number.isNaN(sec))
                sec = 60;
            break;
        }
    }
    return Math.min(sec, constants_1.MAX_SAFE_TIMEOUT_SEC);
}
/**
 * 从 argv 获取消息内容
 */
function getMessageFromArgv(argv, afterSubcommand) {
    const KNOWN_OPTIONS = new Set(['--timeout', '--dir', '--help', '-h']);
    const KNOWN_OPTION_PREFIXES = ['--timeout=', '--dir='];
    for (let i = afterSubcommand; i < argv.length; i++) {
        const arg = argv[i];
        if (arg === '--') {
            i++;
            if (i < argv.length)
                return argv[i];
            break;
        }
        if (arg !== undefined && arg !== '') {
            if (KNOWN_OPTIONS.has(arg)) {
                if ((arg === '--timeout' || arg === '--dir') && argv[i + 1] != null) {
                    i++;
                }
                continue;
            }
            if (KNOWN_OPTION_PREFIXES.some((p) => arg.startsWith(p))) {
                continue;
            }
            return arg;
        }
    }
    // 从 stdin 读取
    const { readStdin } = require('../utils/prompt');
    return readStdin();
}
/**
 * 解析 config set 参数
 */
function parseConfigSetArgs(argv) {
    const out = {};
    for (let i = 3; i < argv.length; i++) {
        const arg = argv[i];
        if (arg === '--app-id' && argv[i + 1] != null) {
            out.appId = argv[++i];
        }
        else if (arg === '--app-secret' && argv[i + 1] != null) {
            out.appSecret = argv[++i];
        }
        else if (arg === '--chat-id' && argv[i + 1] != null) {
            out.chatId = argv[++i];
        }
        else if (arg.startsWith('--app-id=')) {
            out.appId = arg.replace(/^--app-id=/, '');
        }
        else if (arg.startsWith('--app-secret=')) {
            out.appSecret = arg.replace(/^--app-secret=/, '');
        }
        else if (arg.startsWith('--chat-id=')) {
            out.chatId = arg.replace(/^--chat-id=/, '');
        }
    }
    return out;
}
/**
 * 生成 session hint
 */
function sessionHint(status) {
    const { SESSION_HINT_TIMEOUT, SESSION_HINT_CONTINUE } = require('../utils/constants');
    return status === 'timeout' ? SESSION_HINT_TIMEOUT : SESSION_HINT_CONTINUE;
}
/**
 * 打印会话提醒
 */
function printSessionReminder() {
    process.stderr.write('[MessageBridge] 请根据 sessionHint 继续发下一条消息到飞书，勿退出会话。\n');
}
