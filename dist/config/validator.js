"use strict";
/**
 * 配置验证器
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateFeishuConfig = validateFeishuConfig;
exports.verifyFeishuCredentials = verifyFeishuCredentials;
const errors_1 = require("../errors");
/**
 * 验证飞书配置
 * @param config 配置对象
 * @throws ConfigError 如果配置无效
 */
function validateFeishuConfig(config) {
    const errors = [];
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
        throw new errors_1.ConfigError('配置验证失败', { errors });
    }
}
/**
 * 验证飞书凭证（通过 API 调用）
 * @param appId App ID
 * @param appSecret App Secret
 * @returns 验证结果
 */
async function verifyFeishuCredentials(appId, appSecret) {
    try {
        const res = await fetch('https://open.feishu.cn/open-apis/auth/v3/tenant_access_token/internal', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ app_id: appId, app_secret: appSecret }),
        });
        const data = (await res.json());
        if (data.code === 0) {
            return { ok: true };
        }
        return { ok: false, message: data.msg || '获取 token 失败' };
    }
    catch (e) {
        return { ok: false, message: e.message };
    }
}
