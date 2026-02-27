/**
 * IDE stop-hook 命令处理器
 * 支持 Cursor、Claude Code、Codex 等 AI 编辑器
 */

import * as path from 'path';
import * as fs from 'fs';
import * as mb from '../index';
import { getCursorRoot } from '../utils/cli-helpers';
import { CHANNEL_FILE } from '../utils/constants';

/**
 * 执行 IDE stop-hook 命令
 * 当 AI 编辑器停止时触发，发送带"结束会话"按钮的消息
 */
export async function cursorStopHookCommand(argv: string[]): Promise<void> {
  const ideRoot = getCursorRoot(argv);

  if (!ideRoot) {
    process.exit(0);
  }

  // 支持多种 IDE 的配置目录
  const possiblePaths = [
    path.join(ideRoot, '.cursor', CHANNEL_FILE),
    path.join(ideRoot, '.claude', CHANNEL_FILE),
    path.join(ideRoot, '.codex', CHANNEL_FILE),
  ];

  let channel = '';
  for (const channelPath of possiblePaths) {
    try {
      if (fs.existsSync(channelPath)) {
        const raw = fs.readFileSync(channelPath, 'utf8');
        const data = JSON.parse(raw);
        channel = data.channel || '';
        if (channel) break;
      }
    } catch {
      continue;
    }
  }

  if (channel !== 'feishu') {
    process.exit(0);
  }

  // 发送带结束按钮的续写消息
  try {
    await mb.send({
      message: '（AI 编辑器已停止，继续等待你的回复…）',
      useInteractiveCard: true, // 使用交互式卡片，带结束按钮
    });
  } catch {
    // 忽略错误
  } finally {
    mb.close();
  }

  process.exit(0);
}
