"use strict";
/**
 * 交互式输入工具
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
exports.prompt = prompt;
exports.readStdin = readStdin;
const readline = __importStar(require("readline"));
/**
 * 交互式提示用户输入
 * @param question 提示问题
 * @param opts 选项，如 mask 用于密码输入
 * @returns 用户输入的内容
 */
function prompt(question, opts) {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });
    return new Promise((resolve) => {
        if (opts?.mask) {
            // 密文输入：不回显实际字符，仅显示 *
            console.log(question);
            // 覆盖输出逻辑，将用户输入的可见字符替换为 *
            rl._writeToOutput = function (stringToWrite) {
                if (stringToWrite.includes('\n') || stringToWrite.includes('\r')) {
                    process.stdout.write(stringToWrite);
                }
                else {
                    process.stdout.write('*');
                }
            };
            rl.question('', (answer) => {
                rl.close();
                resolve((answer || '').trim());
            });
        }
        else {
            rl.question(question, (answer) => {
                rl.close();
                resolve((answer || '').trim());
            });
        }
    });
}
/**
 * 从 stdin 读取内容（非 TTY 模式）
 * @returns stdin 的内容
 */
function readStdin() {
    if (!process.stdin.isTTY) {
        try {
            const fs = require('fs');
            return fs.readFileSync(0, 'utf8').trim();
        }
        catch {
            return '';
        }
    }
    return '';
}
