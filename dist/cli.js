#!/usr/bin/env node
"use strict";
/**
 * qingniao（@zwa/qingniao）统一 CLI 入口
 */
Object.defineProperty(exports, "__esModule", { value: true });
const commands_1 = require("./commands");
/**
 * 显示帮助信息
 */
function showHelp() {
    console.log(`
qingniao (青鸟) - AI 智能体的消息桥梁

用法:
  npx @zwa/qingniao "<内容>"                发送消息到飞书并等待回复
  npx @zwa/qingniao send "<内容>"           只发送消息，不等待回复
  npx @zwa/qingniao --heartbeat             重新拉起会话（超时后使用）

配置:
  npx @zwa/qingniao check-env               检查环境配置
  npx @zwa/qingniao config show             显示当前配置
  npx @zwa/qingniao config set feishu       交互式配置飞书凭证
  npx @zwa/qingniao connect                 获取 Chat ID（首次配置）

会话管理:
  npx @zwa/qingniao session show            显示当前会话状态
  npx @zwa/qingniao session close           结束会话并清理

Hooks:
  npx @zwa/qingniao hook register           注册 Cursor stop hook
  npx @zwa/qingniao hook unregister         移除 Cursor stop hook

选项:
  --timeout=N                               设置超时时间（秒）
  --dir=PATH                                指定项目根目录
  --help, -h                                显示帮助信息

文档:
  https://github.com/ZiweiAxis/qingniao
`);
}
/**
 * 主函数
 */
async function main() {
    const argv = process.argv;
    const subcommand = argv[2];
    // 帮助信息
    if (!subcommand || subcommand === '--help' || subcommand === '-h') {
        showHelp();
        process.exit(0);
    }
    // 路由到各个命令处理器
    try {
        switch (subcommand) {
            case 'check-env':
                await (0, commands_1.checkEnvCommand)();
                break;
            case 'config':
                const configAction = argv[3];
                if (configAction === 'show') {
                    await (0, commands_1.configShowCommand)();
                }
                else if (configAction === 'set' && argv[4] === 'feishu') {
                    await (0, commands_1.configSetFeishuCommand)(argv);
                }
                else {
                    console.log('用法: config show | config set feishu [--app-id=xxx] [--app-secret=xxx] [--chat-id=xxx]');
                    process.exit(1);
                }
                break;
            case 'connect':
                await (0, commands_1.connectCommand)();
                break;
            case 'send':
                await (0, commands_1.sendCommand)(argv);
                break;
            case '--heartbeat':
                await (0, commands_1.heartbeatCommand)(argv);
                break;
            case 'session':
                const sessionAction = argv[3];
                if (sessionAction === 'show') {
                    await (0, commands_1.sessionShowCommand)(argv);
                }
                else if (sessionAction === 'close') {
                    await (0, commands_1.sessionCloseCommand)(argv);
                }
                else {
                    console.log('用法: session show | session close');
                    process.exit(1);
                }
                break;
            case 'hook':
                const hookAction = argv[3];
                if (hookAction === 'register') {
                    await (0, commands_1.hookRegisterCommand)(argv);
                }
                else if (hookAction === 'unregister') {
                    await (0, commands_1.hookUnregisterCommand)(argv);
                }
                else {
                    console.log('用法: hook register | hook unregister');
                    process.exit(1);
                }
                break;
            case 'cursor-stop-hook':
                await (0, commands_1.cursorStopHookCommand)(argv);
                break;
            default:
                // 默认行为：发送消息并等待回复
                await (0, commands_1.notifyCommand)(argv);
                break;
        }
    }
    catch (error) {
        console.error('错误:', error.message);
        process.exit(1);
    }
}
main();
