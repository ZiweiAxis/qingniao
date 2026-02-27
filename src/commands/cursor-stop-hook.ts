/**
 * cursor-stop-hook 命令处理器
 */

import * as path from 'path';
import * as fs from 'fs';
import * as mb from '../index';
import { getCursorRoot } from '../utils/cli-helpers';
import { CHANNEL_FILE } from '../utils/constants';

/**
 * 执行 cursor-stop-hook 命令
 */
export async function cursorStopHookCommand(argv: string[]): Promise<void> {
  const cursorRoot = getCursorRoot(argv);

  if (!cursorRoot) {
    process.exit(0);
  }

  const channelPath = path.join(cursorRoot, '.cursor', CHANNEL_FILE);
  let channel = '';

  try {
    const raw = fs.readFileSync(channelPath, 'utf8');
    const data = JSON.parse(raw);
    channel = data.channel || '';
  } catch {
    process.exit(0);
  }

  if (channel !== 'feishu') {
    process.exit(0);
  }

  // 发送续写消息
  try {
    await mb.send({ message: '（Cursor 已停止，继续等待你的回复…）' });
  } catch {
    // 忽略错误
  } finally {
    mb.close();
  }

  process.exit(0);
}
