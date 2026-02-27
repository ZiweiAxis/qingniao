"use strict";
/**
 * 配置文件加载器
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.loadConfigFile = loadConfigFile;
exports.saveConfigFile = saveConfigFile;
exports.getConfigPath = getConfigPath;
exports.loadFeishuConfigFromFile = loadFeishuConfigFromFile;
exports.loadFeishuConfigFromEnv = loadFeishuConfigFromEnv;
exports.loadFeishuConfig = loadFeishuConfig;
const path = __importStar(require("path"));
const fs = __importStar(require("fs"));
const os = __importStar(require("os"));
const CONFIG_DIR = path.join(os.homedir(), '.message-bridge');
const CONFIG_PATH = path.join(CONFIG_DIR, 'config.json');
/**
 * 加载配置文件
 * @returns 配置对象
 */
function loadConfigFile() {
    try {
        const raw = fs.readFileSync(CONFIG_PATH, 'utf8');
        return JSON.parse(raw);
    }
    catch {
        return { feishu: undefined };
    }
}
/**
 * 保存配置文件
 * @param config 配置对象
 */
function saveConfigFile(config) {
    fs.mkdirSync(CONFIG_DIR, { recursive: true });
    fs.writeFileSync(CONFIG_PATH, JSON.stringify(config, null, 2), 'utf8');
}
/**
 * 获取配置文件路径
 * @returns 配置文件路径
 */
function getConfigPath() {
    return CONFIG_PATH;
}
/**
 * 从文件加载飞书配置
 * @returns 飞书配置对象
 */
function loadFeishuConfigFromFile() {
    const config = loadConfigFile();
    return config.feishu || {};
}
/**
 * 从环境变量加载飞书配置
 * @returns 飞书配置对象
 */
function loadFeishuConfigFromEnv() {
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
function loadFeishuConfig() {
    const envConfig = loadFeishuConfigFromEnv();
    const fileConfig = loadFeishuConfigFromFile();
    return {
        appId: envConfig.appId || fileConfig.appId,
        appSecret: envConfig.appSecret || fileConfig.appSecret,
        chatId: envConfig.chatId || fileConfig.chatId,
    };
}
