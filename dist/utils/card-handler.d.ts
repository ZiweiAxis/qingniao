/**
 * 飞书卡片交互处理器
 */
import * as lark from '@larksuiteoapi/node-sdk';
/**
 * 卡片按钮回调数据
 */
export interface CardActionData {
    action: string;
    userId: string;
    chatId: string;
}
/**
 * 处理卡片按钮点击事件
 */
export declare function handleCardAction(action: string): {
    shouldEndSession: boolean;
    message: string;
};
/**
 * 注册卡片交互事件处理器
 */
export declare function registerCardActionHandler(eventDispatcher: lark.EventDispatcher): void;
