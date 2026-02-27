/**
 * 配置类型定义
 */
export interface FeishuConfig {
    appId: string;
    appSecret: string;
    chatId?: string;
}
export interface ConfigFile {
    feishu?: FeishuConfig;
}
export interface ConfigSource {
    appId: string;
    appSecret: string;
    chatId: string;
}
