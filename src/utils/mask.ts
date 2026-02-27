/**
 * 敏感信息脱敏工具
 */

/**
 * 脱敏凭证信息（如 App ID、Chat ID）
 * @param value 原始值
 * @param showChars 显示前几个字符，默认 4
 * @returns 脱敏后的字符串
 */
export function maskCredential(value: string | undefined, showChars = 4): string {
  if (!value || value.length === 0) return '(未设置)';
  if (value.length <= 8) return value.slice(0, 2) + '***';
  return value.slice(0, showChars) + '***' + value.slice(-2);
}

/**
 * 脱敏密钥信息（如 App Secret）
 * @returns 固定返回 ***
 */
export function maskSecret(): string {
  return '***';
}

/**
 * 检查值是否有效（非空且长度大于 0）
 * @param value 要检查的值
 * @returns 是否有效
 */
export function isValidValue(value: string | undefined): boolean {
  return Boolean(value && String(value).trim().length > 0);
}
