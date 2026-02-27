/**
 * 交互式输入工具
 */

import * as readline from 'readline';

export interface PromptOptions {
  mask?: boolean;
}

/**
 * 交互式提示用户输入
 * @param question 提示问题
 * @param opts 选项，如 mask 用于密码输入
 * @returns 用户输入的内容
 */
export function prompt(question: string, opts?: PromptOptions): Promise<string> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  return new Promise((resolve) => {
    if (opts?.mask) {
      // 密文输入：不回显实际字符，仅显示 *
      console.log(question);

      // 覆盖输出逻辑，将用户输入的可见字符替换为 *
      (rl as any)._writeToOutput = function (stringToWrite: string) {
        if (stringToWrite.includes('\n') || stringToWrite.includes('\r')) {
          process.stdout.write(stringToWrite);
        } else {
          process.stdout.write('*');
        }
      };

      rl.question('', (answer) => {
        rl.close();
        resolve((answer || '').trim());
      });
    } else {
      rl.question(question, (answer) => {
        rl.close();
        resolve((answer || '').trim());
      });
    }
  });
}

/**
 * 从 stdin 读取内容（非 TTY 模式）
 * @returns stdin 的内容
 */
export function readStdin(): string {
  if (!process.stdin.isTTY) {
    try {
      const fs = require('fs');
      return fs.readFileSync(0, 'utf8').trim();
    } catch {
      return '';
    }
  }
  return '';
}
