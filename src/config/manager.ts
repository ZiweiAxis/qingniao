/**
 * 配置管理器
 */

import { ConfigError } from '../errors';
import { FeishuConfig } from './types';
import { loadFeishuConfig, loadConfigFile, saveConfigFile } from './loader';
import { validateFeishuConfig } from './validator';
import { CONFIG_CACHE_TTL_MS } from '../utils/constants';

/**
 * 配置管理器（单例）
 */
export class ConfigManager {
  private static instance: ConfigManager;
  private cachedConfig: FeishuConfig | null = null;
  private cacheTimestamp = 0;

  private constructor() {}

  /**
   * 获取配置管理器实例
   */
  static getInstance(): ConfigManager {
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
  getFeishuConfig(skipValidation = false): FeishuConfig {
    const now = Date.now();

    // 检查缓存
    if (this.cachedConfig && now - this.cacheTimestamp < CONFIG_CACHE_TTL_MS) {
      return this.cachedConfig;
    }

    // 加载配置
    const config = loadFeishuConfig();

    // 验证配置
    if (!skipValidation) {
      validateFeishuConfig(config);
    }

    // 缓存配置
    this.cachedConfig = config as FeishuConfig;
    this.cacheTimestamp = now;

    return this.cachedConfig;
  }

  /**
   * 重新加载配置（清除缓存）
   * @param skipValidation 是否跳过验证
   * @returns 飞书配置
   */
  reloadFeishuConfig(skipValidation = false): FeishuConfig {
    this.cachedConfig = null;
    this.cacheTimestamp = 0;
    return this.getFeishuConfig(skipValidation);
  }

  /**
   * 更新飞书配置
   * @param updates 要更新的配置项
   */
  updateFeishuConfig(updates: Partial<FeishuConfig>): void {
    const configFile = loadConfigFile();

    if (!configFile.feishu) {
      configFile.feishu = {} as FeishuConfig;
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
    saveConfigFile(configFile);

    // 清除缓存
    this.cachedConfig = null;
    this.cacheTimestamp = 0;
  }

  /**
   * 清除缓存
   */
  clearCache(): void {
    this.cachedConfig = null;
    this.cacheTimestamp = 0;
  }
}

/**
 * 获取配置管理器实例（便捷函数）
 */
export function getConfigManager(): ConfigManager {
  return ConfigManager.getInstance();
}
