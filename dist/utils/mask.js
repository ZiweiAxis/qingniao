"use strict";
/**
 * 敏感信息脱敏工具
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.maskCredential = maskCredential;
exports.maskSecret = maskSecret;
exports.isValidValue = isValidValue;
/**
 * 脱敏凭证信息（如 App ID、Chat ID）
 * @param value 原始值
 * @param showChars 显示前几个字符，默认 4
 * @returns 脱敏后的字符串
 */
function maskCredential(value, showChars = 4) {
    if (!value || value.length === 0)
        return '(未设置)';
    if (value.length <= 8)
        return value.slice(0, 2) + '***';
    return value.slice(0, showChars) + '***' + value.slice(-2);
}
/**
 * 脱敏密钥信息（如 App Secret）
 * @returns 固定返回 ***
 */
function maskSecret() {
    return '***';
}
/**
 * 检查值是否有效（非空且长度大于 0）
 * @param value 要检查的值
 * @returns 是否有效
 */
function isValidValue(value) {
    return Boolean(value && String(value).trim().length > 0);
}
