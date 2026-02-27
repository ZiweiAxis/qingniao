"use strict";
/**
 * hook 命令处理器
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.hookRegisterCommand = hookRegisterCommand;
exports.hookUnregisterCommand = hookUnregisterCommand;
const cli_helpers_1 = require("../utils/cli-helpers");
const cursor_hooks_1 = require("../cursor-hooks");
/**
 * 执行 hook register 命令
 */
async function hookRegisterCommand(argv) {
    const cursorRoot = (0, cli_helpers_1.getCursorRoot)(argv);
    if (!cursorRoot) {
        console.log('未找到 .cursor 目录');
        process.exit(1);
    }
    (0, cursor_hooks_1.ensureStopHook)(cursorRoot);
    console.log('已注册 stop hook 到', cursorRoot + '/.cursor/hooks.json');
    process.exit(0);
}
/**
 * 执行 hook unregister 命令
 */
async function hookUnregisterCommand(argv) {
    const cursorRoot = (0, cli_helpers_1.getCursorRoot)(argv);
    if (!cursorRoot) {
        console.log('未找到 .cursor 目录');
        process.exit(0);
    }
    (0, cursor_hooks_1.unregisterStopHook)(cursorRoot);
    console.log('已移除 stop hook');
    process.exit(0);
}
