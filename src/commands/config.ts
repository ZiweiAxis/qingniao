/**
 * config 命令处理器
 */

import { loadConfigFile, saveConfigFile, getConfigPath } from '../config';
import { verifyFeishuCredentials } from '../config/validator';
import { prompt } from '../utils/prompt';
import { maskCredential, maskSecret, isValidValue } from '../utils/mask';
import { parseConfigSetArgs } from '../utils/cli-helpers';

/**
 * 执行 config show 命令
 */
export async function configShowCommand(): Promise<void> {
  const cfg = loadConfigFile();
  const feishu = cfg.feishu || { appId: '', appSecret: '', chatId: '' };

  console.log('当前配置 (' + getConfigPath() + '):\n');
  console.log('  App ID:', isValidValue(feishu.appId) ? maskCredential(feishu.appId) : '(未设置)');
  console.log('  App Secret:', isValidValue(feishu.appSecret) ? maskSecret() : '(未设置)');
  console.log('  Chat ID:', isValidValue(feishu.chatId) ? maskCredential(feishu.chatId) : '(未设置)');
}

/**
 * 执行 config set feishu 命令
 */
export async function configSetFeishuCommand(argv: string[]): Promise<void> {
  const args = parseConfigSetArgs(argv);

  // 如果没有参数，交互式输入
  if (!args.appId && !args.appSecret && !args.chatId) {
    console.log('交互式配置飞书凭证\n');

    const appId = await prompt('App ID (cli_xxx): ');
    const appSecret = await prompt('App Secret: ', { mask: true });
    console.log(''); // 换行

    if (!appId || !appSecret) {
      console.log('App ID 和 App Secret 不能为空');
      process.exit(1);
    }

    // 验证凭证
    console.log('正在验证凭证...');
    const verify = await verifyFeishuCredentials(appId, appSecret);

    if (!verify.ok) {
      console.log('❌ 凭证无效:', verify.message || '(无详情)');
      process.exit(1);
    }

    console.log('✅ 凭证有效\n');

    // 保存配置
    const cfg = loadConfigFile();
    if (!cfg.feishu) {
      cfg.feishu = { appId: '', appSecret: '', chatId: '' };
    }
    cfg.feishu.appId = appId;
    cfg.feishu.appSecret = appSecret;
    saveConfigFile(cfg);

    console.log('已保存到 ' + getConfigPath());
    console.log('下一步: npx @zwa/qingniao connect 获取 Chat ID');
    process.exit(0);
  }

  // 命令行参数模式
  const cfg = loadConfigFile();
  if (!cfg.feishu) {
    cfg.feishu = { appId: '', appSecret: '', chatId: '' };
  }

  if (args.appId) cfg.feishu.appId = args.appId;
  if (args.appSecret) cfg.feishu.appSecret = args.appSecret;
  if (args.chatId) cfg.feishu.chatId = args.chatId;

  saveConfigFile(cfg);
  console.log('配置已更新: ' + getConfigPath());
}
