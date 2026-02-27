"use strict";
/**
 * check-env 命令处理器
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkEnvCommand = checkEnvCommand;
const config_1 = require("../config");
const validator_1 = require("../config/validator");
const mask_1 = require("../utils/mask");
/**
 * 执行 check-env 命令
 */
async function checkEnvCommand() {
    const config = (0, config_1.loadFeishuConfig)();
    const { appId, appSecret, chatId } = config;
    const fromFile = !process.env.FEISHU_APP_ID && !process.env.DITING_FEISHU_APP_ID && appId
        ? ' (来自 ~/.message-bridge/config.json)'
        : '';
    console.log('飞书配置自检\n');
    console.log('  App ID:', (0, mask_1.isValidValue)(appId) ? (0, mask_1.maskCredential)(appId) + ' ✓' + fromFile : '未设置 ✗');
    console.log('  App Secret:', (0, mask_1.isValidValue)(appSecret) ? (0, mask_1.maskSecret)() + ' ✓' + fromFile : '未设置 ✗');
    console.log('  Chat ID (群聊/私聊会话):', (0, mask_1.isValidValue)(chatId) ? (0, mask_1.maskCredential)(chatId) + ' ✓' : '未设置 ✗');
    // 如果有 App ID 和 App Secret 但没有 Chat ID，验证凭证
    if ((0, mask_1.isValidValue)(appId) && (0, mask_1.isValidValue)(appSecret) && !(0, mask_1.isValidValue)(chatId)) {
        const verify = await (0, validator_1.verifyFeishuCredentials)(appId, appSecret);
        if (!verify.ok) {
            console.log('\n  凭证校验: ✗ 无效或网络错误');
            console.log('  当前使用的 App ID:', appId);
            console.log('  App Secret 长度:', appSecret.length, '字符');
            console.log('  飞书返回错误:', verify.message || '(无详情)');
            console.log('\n❌ 请核对飞书开放平台「凭证与基础信息」中的 App ID / App Secret，或检查网络。');
            process.exit(1);
        }
        console.log('  凭证校验: ✓ 有效（仅缺 Chat ID）');
    }
    const allOk = (0, mask_1.isValidValue)(appId) && (0, mask_1.isValidValue)(appSecret) && (0, mask_1.isValidValue)(chatId);
    if (allOk) {
        console.log('\n✅ 配置完整。可运行: npx @zwa/qingniao send "测试"');
        process.exit(0);
    }
    else {
        console.log('\n❌ 请补全上述缺失项。');
        if (!(0, mask_1.isValidValue)(appId) || !(0, mask_1.isValidValue)(appSecret)) {
            console.log('  使用 npx 配置: npx @zwa/qingniao config set feishu --app-id=xxx --app-secret=xxx');
        }
        else {
            console.log('  获取 Chat ID: npx @zwa/qingniao connect，在群聊或私聊中向机器人发一条消息后按提示保存。');
        }
        console.log('  完整步骤见 docs/ONBOARDING-FEISHU.md');
        process.exit(1);
    }
}
