/**
 * send 命令处理器
 */

import * as mb from '../index';
import { getMessageFromArgv } from '../utils/cli-helpers';

/**
 * 执行 send 命令（只发不等）
 */
export async function sendCommand(argv: string[]): Promise<void> {
  const message = getMessageFromArgv(argv, 2);

  if (!message) {
    console.log(JSON.stringify({ success: false, error: 'empty message' }));
    process.exit(1);
  }

  try {
    const result = await mb.send({ message });
    console.log(JSON.stringify(result));
    process.exit(result.success ? 0 : 1);
  } catch (err) {
    console.log(JSON.stringify({ success: false, error: (err as Error).message }));
    process.exit(1);
  } finally {
    mb.close();
  }
}
