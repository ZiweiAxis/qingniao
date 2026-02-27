"use strict";
/**
 * config 命令处理器
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.configShowCommand = configShowCommand;
exports.configSetFeishuCommand = configSetFeishuCommand;
const config_1 = require("../config");
const validator_1 = require("../config/validator");
const prompt_1 = require("../utils/prompt");
const mask_1 = require("../utils/mask");
const cli_helpers_1 = require("../utils/cli-helpers");
/**
 * 执行 config show 命令
 */
async function configShowCommand() {
    const cfg = (0, config_1.loadConfigFile)();
    const feishu = cfg.feishu || { appId: '', appSecret: '', chatId: '' };
    console.log('当前配置 (' + (0, config_1.getConfigPath)() + '):\n');
    console.log('  App ID:', (0, mask_1.isValidValue)(feishu.appId) ? (0, mask_1.maskCredential)(feishu.appId) : '(未设置)');
    console.log('  App Secret:', (0, mask_1.isValidValue)(feishu.appSecret) ? (0, mask_1.maskSecret)() : '(未设置)');
    console.log('  Chat ID:', (0, mask_1.isValidValue)(feishu.chatId) ? (0, mask_1.maskCredential)(feishu.chatId) : '(未设置)');
}
/**
 * 执行 config set feishu 命令
 */
async function configSetFeishuCommand(argv) {
    const args = (0, cli_helpers_1.parseConfigSetArgs)(argv);
    // 如果没有参数，交互式输入
    if (!args.appId && !args.appSecret && !args.chatId) {
        console.log('交互式配置飞书凭证\n');
        const appId = await (0, prompt_1.prompt)('App ID (cli_xxx): ');
        const appSecret = await (0, prompt_1.prompt)('App Secret: ', { mask: true });
        console.log(''); // 换行
        if (!appId || !appSecret) {
            console.log('App ID 和 App Secret 不能为空');
            process.exit(1);
        }
        // 验证凭证
        console.log('正在验证凭证...');
        const verify = await (0, validator_1.verifyFeishuCredentials)(appId, appSecret);
        if (!verify.ok) {
            console.log('❌ 凭证无效:', verify.message || '(无详情)');
            process.exit(1);
        }
        console.log('✅ 凭证有效\n');
        // 保存配置
        const cfg = (0, config_1.loadConfigFile)();
        if (!cfg.feishu) {
            cfg.feishu = { appId: '', appSecret: '', chatId: '' };
        }
        cfg.feishu.appId = appId;
        cfg.feishu.appSecret = appSecret;
        (0, config_1.saveConfigFile)(cfg);
        console.log('已保存到 ' + (0, config_1.getConfigPath)());
        console.log('下一步: npx @zwa/qingniao connect 获取 Chat ID');
        process.exit(0);
    }
    // 命令行参数模式
    const cfg = (0, config_1.loadConfigFile)();
    if (!cfg.feishu) {
        cfg.feishu = { appId: '', appSecret: '', chatId: '' };
    }
    if (args.appId)
        cfg.feishu.appId = args.appId;
    if (args.appSecret)
        cfg.feishu.appSecret = args.appSecret;
    if (args.chatId)
        cfg.feishu.chatId = args.chatId;
    (0, config_1.saveConfigFile)(cfg);
    console.log('配置已更新: ' + (0, config_1.getConfigPath)());
}
