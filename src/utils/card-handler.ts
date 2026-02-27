/**
 * 飞书卡片交互处理器
 */

import * as lark from '@larksuiteoapi/node-sdk';
import * as path from 'path';
import * as fs from 'fs';
import { unregisterStopHook } from '../cursor-hooks';
import { CHANNEL_FILE } from './constants';

/**
 * 卡片按钮回调数据
 */
export interface CardActionData {
  action: string;
  userId: string;
  chatId: string;
}

/**
 * 查找 IDE 项目根目录（支持 Cursor、Claude Code、Codex 等）
 */
function findIDERoot(): string | null {
  let dir = process.cwd();
  const ideMarkers = ['.cursor', '.claude', '.codex'];

  while (dir && dir !== path.dirname(dir)) {
    for (const marker of ideMarkers) {
      if (fs.existsSync(path.join(dir, marker))) {
        return dir;
      }
    }
    dir = path.dirname(dir);
  }
  return null;
}

/**
 * 清空会话 channel
 */
function clearSessionChannel(ideRoot: string): void {
  // 支持多种 IDE 的配置目录
  const possiblePaths = [
    path.join(ideRoot, '.cursor', CHANNEL_FILE),
    path.join(ideRoot, '.claude', CHANNEL_FILE),
    path.join(ideRoot, '.codex', CHANNEL_FILE),
  ];

  for (const channelPath of possiblePaths) {
    try {
      if (fs.existsSync(channelPath)) {
        fs.unlinkSync(channelPath);
        process.stderr.write(`[MessageBridge] 已清空会话 channel: ${channelPath}\n`);
      }
    } catch (err) {
      // 继续尝试其他路径
    }
  }
}

/**
 * 处理卡片按钮点击事件
 */
export function handleCardAction(action: string): { shouldEndSession: boolean; message: string } {
  if (action === 'end_session') {
    // 查找 IDE 根目录
    const ideRoot = findIDERoot();

    if (ideRoot) {
      // 清空 channel
      clearSessionChannel(ideRoot);

      // 移除 stop hook
      unregisterStopHook(ideRoot);

      process.stderr.write('[MessageBridge] 会话已结束，已清理 channel 和 stop hook\n');
    }

    return {
      shouldEndSession: true,
      message: '会话已结束。',
    };
  }

  return {
    shouldEndSession: false,
    message: '未知操作',
  };
}

/**
 * 注册卡片交互事件处理器
 */
export function registerCardActionHandler(eventDispatcher: lark.EventDispatcher): void {
  eventDispatcher.register({
    'card.action.trigger': async (data: any) => {
      try {
        const action = data.action?.value?.action;
        const userId = data.operator?.open_id || data.operator?.user_id;

        process.stderr.write(`[MessageBridge] 收到卡片交互: action=${action}, user=${userId}\n`);

        const result = handleCardAction(action);

        // 返回响应给飞书
        return {
          toast: {
            type: 'success',
            content: result.message,
          },
        };
      } catch (error) {
        console.error('[MessageBridge] 处理卡片交互失败:', (error as Error).message);
        return {
          toast: {
            type: 'error',
            content: '操作失败',
          },
        };
      }
    },
  });
}
