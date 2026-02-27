/**
 * 配置管理器
 */
import { FeishuConfig } from './types';
/**
 * 配置管理器（单例）
 */
export declare class ConfigManager {
    private static instance;
    private cachedConfig;
    private cacheTimestamp;
    private constructor();
    /**
     * 获取配置管理器实例
     */
    static getInstance(): ConfigManager;
    /**
     * 获取飞书配置（带缓存）
     * @param skipValidation 是否跳过验证
     * @returns 飞书配置
     */
    getFeishuConfig(skipValidation?: boolean): FeishuConfig;
    /**
     * 重新加载配置（清除缓存）
     * @param skipValidation 是否跳过验证
     * @returns 飞书配置
     */
    reloadFeishuConfig(skipValidation?: boolean): FeishuConfig;
    /**
     * 更新飞书配置
     * @param updates 要更新的配置项
     */
    updateFeishuConfig(updates: Partial<FeishuConfig>): void;
    /**
     * 清除缓存
     */
    clearCache(): void;
}
/**
 * 获取配置管理器实例（便捷函数）
 */
export declare function getConfigManager(): ConfigManager;
