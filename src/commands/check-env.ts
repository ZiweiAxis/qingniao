/**
 * check-env 命令处理器
 */

import { loadFeishuConfig, getConfigPath } from '../config';
import { verifyFeishuCredentials } from '../config/validator';
import { maskCredential, maskSecret, isValidValue } from '../utils/mask';

/**
 * 执行 check-env 命令
 */
export async function checkEnvCommand(): Promise<void> {
  const config = loadFeishuConfig();
  const { appId, appSecret, chatId } = config;

  const fromFile =
    !process.env.FEISHU_APP_ID && !process.env.DITING_FEISHU_APP_ID && appId
      ? ' (来自 ~/.message-bridge/config.json)'
      : '';

  console.log('飞书配置自检\n');
  console.log('  App ID:', isValidValue(appId) ? maskCredential(appId) + ' ✓' + fromFile : '未设置 ✗');
  console.log('  App Secret:', isValidValue(appSecret) ? maskSecret() + ' ✓' + fromFile : '未设置 ✗');
  console.log('  Chat ID (群聊/私聊会话):', isValidValue(chatId) ? maskCredential(chatId) + ' ✓' : '未设置 ✗');

  // 如果有 App ID 和 App Secret 但没有 Chat ID，验证凭证
  if (isValidValue(appId) && isValidValue(appSecret) && !isValidValue(chatId)) {
    const verify = await verifyFeishuCredentials(appId!, appSecret!);

    if (!verify.ok) {
      console.log('\n  凭证校验: ✗ 无效或网络错误');
      console.log('  当前使用的 App ID:', appId!);
      console.log('  App Secret 长度:', appSecret!.length, '字符');
      console.log('  飞书返回错误:', verify.message || '(无详情)');
      console.log('\n❌ 请核对飞书开放平台「凭证与基础信息」中的 App ID / App Secret，或检查网络。');
      process.exit(1);
    }

    console.log('  凭证校验: ✓ 有效（仅缺 Chat ID）');
  }

  const allOk = isValidValue(appId) && isValidValue(appSecret) && isValidValue(chatId);

  if (allOk) {
    console.log('\n✅ 配置完整。可运行: npx @zwa/qingniao send "测试"');
    process.exit(0);
  } else {
    console.log('\n❌ 请补全上述缺失项。');

    if (!isValidValue(appId) || !isValidValue(appSecret)) {
      console.log('  使用 npx 配置: npx @zwa/qingniao config set feishu --app-id=xxx --app-secret=xxx');
    } else {
      console.log('  获取 Chat ID: npx @zwa/qingniao connect，在群聊或私聊中向机器人发一条消息后按提示保存。');
    }

    console.log('  完整步骤见 docs/ONBOARDING-FEISHU.md');
    process.exit(1);
  }
}
