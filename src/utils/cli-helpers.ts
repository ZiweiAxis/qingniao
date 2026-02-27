/**
 * CLI 辅助函数
 */

import * as path from 'path';
import * as fs from 'fs';
import { DEFAULT_TIMEOUT_SEC, MAX_SAFE_TIMEOUT_SEC } from '../utils/constants';

/**
 * 从某目录向上查找包含 .cursor 的目录（项目根）
 */
export function findCursorRoot(startDir: string): string | null {
  let dir = path.resolve(startDir);
  while (dir && dir !== path.dirname(dir)) {
    if (fs.existsSync(path.join(dir, '.cursor'))) {
      return dir;
    }
    dir = path.dirname(dir);
  }
  return null;
}

/**
 * 从 argv 解析 --dir= 或 --dir 作为项目根，否则从 cwd 查找
 */
export function getCursorRoot(argv: string[]): string | null {
  for (let i = 2; i < argv.length; i++) {
    if (argv[i] === '--dir' && argv[i + 1] != null) {
      return path.resolve(argv[i + 1]);
    }
    if (argv[i].startsWith('--dir=')) {
      return path.resolve(argv[i].replace(/^--dir=/, ''));
    }
  }
  return findCursorRoot(process.cwd());
}

/**
 * 解析超时参数
 */
export function parseTimeout(argv: string[]): number {
  const envTimeout = parseInt(process.env.FEISHU_TURN_TIMEOUT || String(DEFAULT_TIMEOUT_SEC), 10);
  let sec = envTimeout;

  for (let i = 2; i < argv.length; i++) {
    if (argv[i] === '--timeout' && argv[i + 1] != null) {
      sec = parseInt(argv[i + 1], 10);
      if (sec <= 0) sec = MAX_SAFE_TIMEOUT_SEC;
      else if (Number.isNaN(sec)) sec = 60;
      break;
    }
    if (argv[i].startsWith('--timeout=')) {
      sec = parseInt(argv[i].replace(/^--timeout=/, ''), 10);
      if (sec <= 0) sec = MAX_SAFE_TIMEOUT_SEC;
      else if (Number.isNaN(sec)) sec = 60;
      break;
    }
  }

  return Math.min(sec, MAX_SAFE_TIMEOUT_SEC);
}

/**
 * 从 argv 获取消息内容
 */
export function getMessageFromArgv(argv: string[], afterSubcommand: number): string {
  const KNOWN_OPTIONS = new Set(['--timeout', '--dir', '--help', '-h']);
  const KNOWN_OPTION_PREFIXES = ['--timeout=', '--dir='];

  for (let i = afterSubcommand; i < argv.length; i++) {
    const arg = argv[i];

    if (arg === '--') {
      i++;
      if (i < argv.length) return argv[i];
      break;
    }

    if (arg !== undefined && arg !== '') {
      if (KNOWN_OPTIONS.has(arg)) {
        if ((arg === '--timeout' || arg === '--dir') && argv[i + 1] != null) {
          i++;
        }
        continue;
      }

      if (KNOWN_OPTION_PREFIXES.some((p) => arg.startsWith(p))) {
        continue;
      }

      return arg;
    }
  }

  // 从 stdin 读取
  const { readStdin } = require('../utils/prompt');
  return readStdin();
}

/**
 * 解析 config set 参数
 */
export function parseConfigSetArgs(argv: string[]): {
  appId?: string;
  appSecret?: string;
  chatId?: string;
} {
  const out: { appId?: string; appSecret?: string; chatId?: string } = {};

  for (let i = 3; i < argv.length; i++) {
    const arg = argv[i];

    if (arg === '--app-id' && argv[i + 1] != null) {
      out.appId = argv[++i];
    } else if (arg === '--app-secret' && argv[i + 1] != null) {
      out.appSecret = argv[++i];
    } else if (arg === '--chat-id' && argv[i + 1] != null) {
      out.chatId = argv[++i];
    } else if (arg.startsWith('--app-id=')) {
      out.appId = arg.replace(/^--app-id=/, '');
    } else if (arg.startsWith('--app-secret=')) {
      out.appSecret = arg.replace(/^--app-secret=/, '');
    } else if (arg.startsWith('--chat-id=')) {
      out.chatId = arg.replace(/^--chat-id=/, '');
    }
  }

  return out;
}

/**
 * 生成 session hint
 */
export function sessionHint(status: string): string {
  const { SESSION_HINT_TIMEOUT, SESSION_HINT_CONTINUE } = require('../utils/constants');
  return status === 'timeout' ? SESSION_HINT_TIMEOUT : SESSION_HINT_CONTINUE;
}

/**
 * 打印会话提醒
 */
export function printSessionReminder(): void {
  process.stderr.write('[MessageBridge] 请根据 sessionHint 继续发下一条消息到飞书，勿退出会话。\n');
}
