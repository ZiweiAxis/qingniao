/**
 * 配置文件加载器
 */
import { ConfigFile, FeishuConfig } from './types';
/**
 * 加载配置文件
 * @returns 配置对象
 */
export declare function loadConfigFile(): ConfigFile;
/**
 * 保存配置文件
 * @param config 配置对象
 */
export declare function saveConfigFile(config: ConfigFile): void;
/**
 * 获取配置文件路径
 * @returns 配置文件路径
 */
export declare function getConfigPath(): string;
/**
 * 从文件加载飞书配置
 * @returns 飞书配置对象
 */
export declare function loadFeishuConfigFromFile(): Partial<FeishuConfig>;
/**
 * 从环境变量加载飞书配置
 * @returns 飞书配置对象
 */
export declare function loadFeishuConfigFromEnv(): Partial<FeishuConfig>;
/**
 * 合并环境变量和文件配置（环境变量优先）
 * @returns 合并后的配置
 */
export declare function loadFeishuConfig(): Partial<FeishuConfig>;
