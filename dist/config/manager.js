"use strict";
/**
 * 配置管理器
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConfigManager = void 0;
exports.getConfigManager = getConfigManager;
const loader_1 = require("./loader");
const validator_1 = require("./validator");
const constants_1 = require("../utils/constants");
/**
 * 配置管理器（单例）
 */
class ConfigManager {
    constructor() {
        this.cachedConfig = null;
        this.cacheTimestamp = 0;
    }
    /**
     * 获取配置管理器实例
     */
    static getInstance() {
        if (!ConfigManager.instance) {
            ConfigManager.instance = new ConfigManager();
        }
        return ConfigManager.instance;
    }
    /**
     * 获取飞书配置（带缓存）
     * @param skipValidation 是否跳过验证
     * @returns 飞书配置
     */
    getFeishuConfig(skipValidation = false) {
        const now = Date.now();
        // 检查缓存
        if (this.cachedConfig && now - this.cacheTimestamp < constants_1.CONFIG_CACHE_TTL_MS) {
            return this.cachedConfig;
        }
        // 加载配置
        const config = (0, loader_1.loadFeishuConfig)();
        // 验证配置
        if (!skipValidation) {
            (0, validator_1.validateFeishuConfig)(config);
        }
        // 缓存配置
        this.cachedConfig = config;
        this.cacheTimestamp = now;
        return this.cachedConfig;
    }
    /**
     * 重新加载配置（清除缓存）
     * @param skipValidation 是否跳过验证
     * @returns 飞书配置
     */
    reloadFeishuConfig(skipValidation = false) {
        this.cachedConfig = null;
        this.cacheTimestamp = 0;
        return this.getFeishuConfig(skipValidation);
    }
    /**
     * 更新飞书配置
     * @param updates 要更新的配置项
     */
    updateFeishuConfig(updates) {
        const configFile = (0, loader_1.loadConfigFile)();
        if (!configFile.feishu) {
            configFile.feishu = {};
        }
        // 合并更新
        if (updates.appId !== undefined) {
            configFile.feishu.appId = updates.appId;
        }
        if (updates.appSecret !== undefined) {
            configFile.feishu.appSecret = updates.appSecret;
        }
        if (updates.chatId !== undefined) {
            configFile.feishu.chatId = updates.chatId;
        }
        // 保存配置
        (0, loader_1.saveConfigFile)(configFile);
        // 清除缓存
        this.cachedConfig = null;
        this.cacheTimestamp = 0;
    }
    /**
     * 清除缓存
     */
    clearCache() {
        this.cachedConfig = null;
        this.cacheTimestamp = 0;
    }
}
exports.ConfigManager = ConfigManager;
/**
 * 获取配置管理器实例（便捷函数）
 */
function getConfigManager() {
    return ConfigManager.getInstance();
}
