"use strict";
/**
 * Cursor 下 .cursor/hooks.json 的 stop hook 注册/注销，供 CLI 与测试使用。
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
exports.ensureStopHook = ensureStopHook;
exports.unregisterStopHook = unregisterStopHook;
const path = __importStar(require("path"));
const fs = __importStar(require("fs"));
const STOP_HOOK_CMD = "npx @zwa/qingniao cursor-stop-hook";
/** 若项目根下 .cursor/hooks.json 没有本 skill 的 stop hook，则写入；已有则不动。 */
function ensureStopHook(root) {
    const hooksPath = path.join(root, ".cursor", "hooks.json");
    let obj;
    try {
        obj = JSON.parse(fs.readFileSync(hooksPath, "utf8"));
    }
    catch {
        obj = { version: 1, hooks: {} };
    }
    if (!obj.hooks)
        obj.hooks = {};
    if (!Array.isArray(obj.hooks.stop))
        obj.hooks.stop = [];
    const hasOurs = obj.hooks.stop.some((e) => e.command && (e.command.includes("cursor-stop-hook") || e.command.includes("skill-message-bridge") || e.command.includes("qingniao") || e.command.includes("@zwa/qingniao")));
    if (!hasOurs) {
        obj.hooks.stop.push({ command: STOP_HOOK_CMD, timeout: 15, loop_limit: 5 });
        fs.mkdirSync(path.dirname(hooksPath), { recursive: true });
        fs.writeFileSync(hooksPath, JSON.stringify(obj, null, 2), "utf8");
    }
}
/** 从 .cursor/hooks.json 移除本 skill 的 stop hook（用户切回/结束时调用）。 */
function unregisterStopHook(root) {
    const hooksPath = path.join(root, ".cursor", "hooks.json");
    try {
        const obj = JSON.parse(fs.readFileSync(hooksPath, "utf8"));
        if (!obj.hooks || !Array.isArray(obj.hooks.stop))
            return;
        obj.hooks.stop = obj.hooks.stop.filter((e) => !e.command || (!e.command.includes("cursor-stop-hook") && !e.command.includes("skill-message-bridge") && !e.command.includes("qingniao") && !e.command.includes("@zwa/qingniao")));
        fs.writeFileSync(hooksPath, JSON.stringify(obj, null, 2), "utf8");
    }
    catch {
        // ignore
    }
}
