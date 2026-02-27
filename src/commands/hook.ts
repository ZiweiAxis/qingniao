/**
 * hook 命令处理器
 */

import { getCursorRoot } from '../utils/cli-helpers';
import { ensureStopHook, unregisterStopHook } from '../cursor-hooks';

/**
 * 执行 hook register 命令
 */
export async function hookRegisterCommand(argv: string[]): Promise<void> {
  const cursorRoot = getCursorRoot(argv);

  if (!cursorRoot) {
    console.log('未找到 .cursor 目录');
    process.exit(1);
  }

  ensureStopHook(cursorRoot);
  console.log('已注册 stop hook 到', cursorRoot + '/.cursor/hooks.json');
  process.exit(0);
}

/**
 * 执行 hook unregister 命令
 */
export async function hookUnregisterCommand(argv: string[]): Promise<void> {
  const cursorRoot = getCursorRoot(argv);

  if (!cursorRoot) {
    console.log('未找到 .cursor 目录');
    process.exit(0);
  }

  unregisterStopHook(cursorRoot);
  console.log('已移除 stop hook');
  process.exit(0);
}
