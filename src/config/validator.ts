/**
 * 配置验证器
 */

import { ConfigError } from '../errors';
import { FeishuConfig } from './types';

/**
 * 验证飞书配置
 * @param config 配置对象
 * @throws ConfigError 如果配置无效
 */
export function validateFeishuConfig(config: Partial<FeishuConfig>): void {
  const errors: string[] = [];

  if (!config.appId || config.appId.trim().length === 0) {
    errors.push('App ID 不能为空');
  }

  if (!config.appSecret || config.appSecret.trim().length === 0) {
    errors.push('App Secret 不能为空');
  }

  if (config.appId && !config.appId.startsWith('cli_')) {
    errors.push('App ID 格式不正确，应以 cli_ 开头');
  }

  if (errors.length > 0) {
    throw new ConfigError('配置验证失败', { errors });
  }
}

/**
 * 验证飞书凭证（通过 API 调用）
 * @param appId App ID
 * @param appSecret App Secret
 * @returns 验证结果
 */
export async function verifyFeishuCredentials(
  appId: string,
  appSecret: string
): Promise<{ ok: boolean; message?: string }> {
  try {
    const res = await fetch('https://open.feishu.cn/open-apis/auth/v3/tenant_access_token/internal', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ app_id: appId, app_secret: appSecret }),
    });

    const data = (await res.json()) as { code?: number; msg?: string };

    if (data.code === 0) {
      return { ok: true };
    }

    return { ok: false, message: data.msg || '获取 token 失败' };
  } catch (e) {
    return { ok: false, message: (e as Error).message };
  }
}
