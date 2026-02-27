/**
 * 配置文件加载器
 */

import * as path from 'path';
import * as fs from 'fs';
import * as os from 'os';
import { ConfigFile, FeishuConfig } from './types';

const CONFIG_DIR = path.join(os.homedir(), '.message-bridge');
const CONFIG_PATH = path.join(CONFIG_DIR, 'config.json');

/**
 * 加载配置文件
 * @returns 配置对象
 */
export function loadConfigFile(): ConfigFile {
  try {
    const raw = fs.readFileSync(CONFIG_PATH, 'utf8');
    return JSON.parse(raw);
  } catch {
    return { feishu: undefined };
  }
}

/**
 * 保存配置文件
 * @param config 配置对象
 */
export function saveConfigFile(config: ConfigFile): void {
  fs.mkdirSync(CONFIG_DIR, { recursive: true });
  fs.writeFileSync(CONFIG_PATH, JSON.stringify(config, null, 2), 'utf8');
}

/**
 * 获取配置文件路径
 * @returns 配置文件路径
 */
export function getConfigPath(): string {
  return CONFIG_PATH;
}

/**
 * 从文件加载飞书配置
 * @returns 飞书配置对象
 */
export function loadFeishuConfigFromFile(): Partial<FeishuConfig> {
  const config = loadConfigFile();
  return config.feishu || {};
}

/**
 * 从环境变量加载飞书配置
 * @returns 飞书配置对象
 */
export function loadFeishuConfigFromEnv(): Partial<FeishuConfig> {
  return {
    appId: process.env.FEISHU_APP_ID || process.env.DITING_FEISHU_APP_ID,
    appSecret: process.env.FEISHU_APP_SECRET || process.env.DITING_FEISHU_APP_SECRET,
    chatId: process.env.FEISHU_CHAT_ID || process.env.DITING_FEISHU_CHAT_ID,
  };
}

/**
 * 合并环境变量和文件配置（环境变量优先）
 * @returns 合并后的配置
 */
export function loadFeishuConfig(): Partial<FeishuConfig> {
  const envConfig = loadFeishuConfigFromEnv();
  const fileConfig = loadFeishuConfigFromFile();

  return {
    appId: envConfig.appId || fileConfig.appId,
    appSecret: envConfig.appSecret || fileConfig.appSecret,
    chatId: envConfig.chatId || fileConfig.chatId,
  };
}
