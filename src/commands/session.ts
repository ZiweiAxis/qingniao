/**
 * session 命令处理器
 */

import * as path from 'path';
import * as fs from 'fs';
import { getCursorRoot } from '../utils/cli-helpers';
import { unregisterStopHook } from '../cursor-hooks';
import { CHANNEL_FILE } from '../utils/constants';

/**
 * 执行 session close 命令
 */
export async function sessionCloseCommand(argv: string[]): Promise<void> {
  const cursorRoot = getCursorRoot(argv);

  if (!cursorRoot) {
    console.log('未找到 .cursor 目录，无需清理');
    process.exit(0);
  }

  // 清空 channel
  const channelPath = path.join(cursorRoot, '.cursor', CHANNEL_FILE);
  try {
    fs.unlinkSync(channelPath);
  } catch {
    // 文件不存在也算成功
  }

  // 移除 stop hook
  unregisterStopHook(cursorRoot);

  console.log('已清空会话 channel 并移除 stop hook');
  process.exit(0);
}

/**
 * 执行 session show 命令
 */
export async function sessionShowCommand(argv: string[]): Promise<void> {
  const cursorRoot = getCursorRoot(argv);

  if (!cursorRoot) {
    console.log('未找到 .cursor 目录');
    process.exit(0);
  }

  const channelPath = path.join(cursorRoot, '.cursor', CHANNEL_FILE);
  try {
    const raw = fs.readFileSync(channelPath, 'utf8');
    const data = JSON.parse(raw);
    console.log('当前会话 channel:', data.channel || '(未设置)');
  } catch {
    console.log('当前会话 channel: (未设置)');
  }

  process.exit(0);
}
