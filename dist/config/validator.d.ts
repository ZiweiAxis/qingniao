/**
 * 配置验证器
 */
import { FeishuConfig } from './types';
/**
 * 验证飞书配置
 * @param config 配置对象
 * @throws ConfigError 如果配置无效
 */
export declare function validateFeishuConfig(config: Partial<FeishuConfig>): void;
/**
 * 验证飞书凭证（通过 API 调用）
 * @param appId App ID
 * @param appSecret App Secret
 * @returns 验证结果
 */
export declare function verifyFeishuCredentials(appId: string, appSecret: string): Promise<{
    ok: boolean;
    message?: string;
}>;
