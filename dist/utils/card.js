"use strict";
/**
 * 飞书交互式卡片工具
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.createInteractiveCard = createInteractiveCard;
exports.createTextMessage = createTextMessage;
/**
 * 创建带有"结束会话"按钮的交互式卡片
 * @param message 消息内容
 * @returns 卡片 JSON
 */
function createInteractiveCard(message) {
    const card = {
        config: {
            wide_screen_mode: true,
        },
        elements: [
            {
                tag: 'div',
                text: {
                    content: message,
                    tag: 'lark_md',
                },
            },
            {
                tag: 'action',
                actions: [
                    {
                        tag: 'button',
                        text: {
                            content: '结束会话',
                            tag: 'plain_text',
                        },
                        type: 'danger',
                        value: {
                            action: 'end_session',
                        },
                    },
                ],
            },
        ],
        header: {
            template: 'blue',
            title: {
                content: '青鸟消息',
                tag: 'plain_text',
            },
        },
    };
    return JSON.stringify(card);
}
/**
 * 创建简单的文本消息（不带按钮）
 * @param message 消息内容
 * @returns 文本消息 JSON
 */
function createTextMessage(message) {
    return JSON.stringify({ text: message });
}
