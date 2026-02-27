/**
 * 飞书交互式卡片工具
 */
/**
 * 创建带有"结束会话"按钮的交互式卡片
 * @param message 消息内容
 * @returns 卡片 JSON
 */
export declare function createInteractiveCard(message: string): string;
/**
 * 创建简单的文本消息（不带按钮）
 * @param message 消息内容
 * @returns 文本消息 JSON
 */
export declare function createTextMessage(message: string): string;
