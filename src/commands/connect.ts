/**
 * connect 命令处理器
 */

import * as mb from '../index';
import { loadConfigFile, saveConfigFile, getConfigPath } from '../config';
import { FEISHU_PAIRING_SUCCESS_GUIDE } from '../utils/constants';

/**
 * 执行 connect 命令
 */
export async function connectCommand(): Promise<void> {
  console.log('正在启动飞书长连接…\n');

  try {
    const chatId = await mb.runConnectMode();

    // 尝试发送引导消息
    try {
      await mb.send({ message: FEISHU_PAIRING_SUCCESS_GUIDE, groupId: chatId });
    } catch {
      // 发送引导失败仍自动保存并提示
    }

    // 保存 chat_id
    const cfg = loadConfigFile();
    if (!cfg.feishu) {
      cfg.feishu = { appId: '', appSecret: '', chatId: '' };
    }
    cfg.feishu.chatId = chatId;
    saveConfigFile(cfg);

    console.log('\n已收到首条消息，会话 chat_id（群聊/私聊均可）:', chatId);
    console.log('已自动保存到 ' + getConfigPath() + '，可运行 npx @zwa/qingniao send "测试" 验证。');

    mb.close();
    process.exit(0);
  } catch (err) {
    console.error('连接或接收失败:', (err as Error).message);
    console.log('若无法收到消息，请先在飞书开放平台完成「事件订阅」→ 选择「长连接」→ 订阅 im.message.receive_v1。');
    mb.close();
    process.exit(1);
  }
}
