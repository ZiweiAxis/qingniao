/**
 * notify 命令处理器（发送并等待回复）
 */

import * as mb from '../index';
import { getMessageFromArgv, parseTimeout, sessionHint, printSessionReminder, getCursorRoot } from '../utils/cli-helpers';
import { ensureStopHook } from '../cursor-hooks';
import * as path from 'path';
import * as fs from 'fs';
import { CHANNEL_FILE } from '../utils/constants';

/**
 * 设置 channel
 */
function setChannel(cursorRoot: string, channel: string): void {
  const channelPath = path.join(cursorRoot, '.cursor', CHANNEL_FILE);
  fs.mkdirSync(path.dirname(channelPath), { recursive: true });
  fs.writeFileSync(channelPath, JSON.stringify({ channel }, null, 2), 'utf8');
}

/**
 * 执行 notify 命令（发送并等待回复）
 */
export async function notifyCommand(argv: string[]): Promise<void> {
  const message = getMessageFromArgv(argv, 2);
  const timeout = parseTimeout(argv);

  if (!message) {
    console.log(JSON.stringify({ status: 'error', reply: '', error: 'empty message' }));
    process.exit(1);
  }

  const cursorRoot = getCursorRoot(argv);
  if (cursorRoot) {
    ensureStopHook(cursorRoot);
    setChannel(cursorRoot, 'feishu');
  }

  try {
    const result = await mb.notify({ message, timeout });
    const out: Record<string, string> = {
      status: result.status || 'error',
      reply: result.reply || '',
      replyUser: result.replyUser || '',
      sessionHint: sessionHint(result.status || 'error'),
    };
    if (result.error) out.error = result.error;

    console.log(JSON.stringify(out));
    printSessionReminder();
    process.exit(result.status === 'error' ? 1 : 0);
  } catch (err) {
    const errOut = {
      status: 'error',
      reply: '',
      error: (err as Error).message,
      sessionHint: sessionHint('error'),
    };
    console.log(JSON.stringify(errOut));
    printSessionReminder();
    process.exit(1);
  } finally {
    mb.close();
  }
}

/**
 * 执行 heartbeat 命令（重新拉起会话）
 */
export async function heartbeatCommand(argv: string[]): Promise<void> {
  const timeout = parseTimeout(argv);

  try {
    const result = await mb.waitNextMessage(timeout);
    const out: Record<string, string> = {
      status: result.status,
      reply: result.reply || '',
      replyUser: result.replyUser || '',
      sessionHint: sessionHint(result.status),
    };

    console.log(JSON.stringify(out));
    printSessionReminder();
    process.exit(0);
  } catch (err) {
    const errOut = {
      status: 'error',
      reply: '',
      error: (err as Error).message,
      sessionHint: sessionHint('error'),
    };
    console.log(JSON.stringify(errOut));
    printSessionReminder();
    process.exit(1);
  } finally {
    mb.close();
  }
}
