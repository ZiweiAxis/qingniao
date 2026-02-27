"use strict";
/**
 * 飞书卡片交互处理器
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
exports.handleCardAction = handleCardAction;
exports.registerCardActionHandler = registerCardActionHandler;
const path = __importStar(require("path"));
const fs = __importStar(require("fs"));
const cursor_hooks_1 = require("../cursor-hooks");
const constants_1 = require("./constants");
/**
 * 查找 IDE 项目根目录（支持 Cursor、Claude Code、Codex 等）
 */
function findIDERoot() {
    let dir = process.cwd();
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
 * 清空会话 channel
 */
function clearSessionChannel(ideRoot) {
    // 支持多种 IDE 的配置目录
    const possiblePaths = [
        path.join(ideRoot, '.cursor', constants_1.CHANNEL_FILE),
        path.join(ideRoot, '.claude', constants_1.CHANNEL_FILE),
        path.join(ideRoot, '.codex', constants_1.CHANNEL_FILE),
    ];
    for (const channelPath of possiblePaths) {
        try {
            if (fs.existsSync(channelPath)) {
                fs.unlinkSync(channelPath);
                process.stderr.write(`[MessageBridge] 已清空会话 channel: ${channelPath}\n`);
            }
        }
        catch (err) {
            // 继续尝试其他路径
        }
    }
}
/**
 * 处理卡片按钮点击事件
 */
function handleCardAction(action) {
    if (action === 'end_session') {
        // 查找 IDE 根目录
        const ideRoot = findIDERoot();
        if (ideRoot) {
            // 清空 channel
            clearSessionChannel(ideRoot);
            // 移除 stop hook
            (0, cursor_hooks_1.unregisterStopHook)(ideRoot);
            process.stderr.write('[MessageBridge] 会话已结束，已清理 channel 和 stop hook\n');
        }
        return {
            shouldEndSession: true,
            message: '会话已结束。',
        };
    }
    return {
        shouldEndSession: false,
        message: '未知操作',
    };
}
/**
 * 注册卡片交互事件处理器
 */
function registerCardActionHandler(eventDispatcher) {
    eventDispatcher.register({
        'card.action.trigger': async (data) => {
            try {
                const action = data.action?.value?.action;
                const userId = data.operator?.open_id || data.operator?.user_id;
                process.stderr.write(`[MessageBridge] 收到卡片交互: action=${action}, user=${userId}\n`);
                const result = handleCardAction(action);
                // 返回响应给飞书
                return {
                    toast: {
                        type: 'success',
                        content: result.message,
                    },
                };
            }
            catch (error) {
                console.error('[MessageBridge] 处理卡片交互失败:', error.message);
                return {
                    toast: {
                        type: 'error',
                        content: '操作失败',
                    },
                };
            }
        },
    });
}
