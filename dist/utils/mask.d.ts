/**
 * 敏感信息脱敏工具
 */
/**
 * 脱敏凭证信息（如 App ID、Chat ID）
 * @param value 原始值
 * @param showChars 显示前几个字符，默认 4
 * @returns 脱敏后的字符串
 */
export declare function maskCredential(value: string | undefined, showChars?: number): string;
/**
 * 脱敏密钥信息（如 App Secret）
 * @returns 固定返回 ***
 */
export declare function maskSecret(): string;
/**
 * 检查值是否有效（非空且长度大于 0）
 * @param value 要检查的值
 * @returns 是否有效
 */
export declare function isValidValue(value: string | undefined): boolean;
