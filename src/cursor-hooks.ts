/**
 * Cursor 下 .cursor/hooks.json 的 stop hook 注册/注销，供 CLI 与测试使用。
 */

import * as path from "path";
import * as fs from "fs";

const STOP_HOOK_CMD = "npx skill-message-bridge cursor-stop-hook";

/** 若项目根下 .cursor/hooks.json 没有本 skill 的 stop hook，则写入；已有则不动。 */
export function ensureStopHook(root: string): void {
  const hooksPath = path.join(root, ".cursor", "hooks.json");
  let obj: { version?: number; hooks?: { stop?: Array<{ command: string; timeout?: number; loop_limit?: number }> } };
  try {
    obj = JSON.parse(fs.readFileSync(hooksPath, "utf8"));
  } catch {
    obj = { version: 1, hooks: {} };
  }
  if (!obj.hooks) obj.hooks = {};
  if (!Array.isArray(obj.hooks.stop)) obj.hooks.stop = [];
  const hasOurs = obj.hooks.stop.some(
    (e: { command?: string }) => e.command && (e.command.includes("cursor-stop-hook") || e.command.includes("skill-message-bridge"))
  );
  if (!hasOurs) {
    obj.hooks.stop.push({ command: STOP_HOOK_CMD, timeout: 15, loop_limit: 5 });
    fs.mkdirSync(path.dirname(hooksPath), { recursive: true });
    fs.writeFileSync(hooksPath, JSON.stringify(obj, null, 2), "utf8");
  }
}

/** 从 .cursor/hooks.json 移除本 skill 的 stop hook（用户切回/结束时调用）。 */
export function unregisterStopHook(root: string): void {
  const hooksPath = path.join(root, ".cursor", "hooks.json");
  try {
    const obj = JSON.parse(fs.readFileSync(hooksPath, "utf8")) as {
      version?: number;
      hooks?: { stop?: Array<{ command?: string }> };
    };
    if (!obj.hooks || !Array.isArray(obj.hooks.stop)) return;
    obj.hooks.stop = obj.hooks.stop.filter(
      (e) => !e.command || (!e.command.includes("cursor-stop-hook") && !e.command.includes("skill-message-bridge"))
    );
    fs.writeFileSync(hooksPath, JSON.stringify(obj, null, 2), "utf8");
  } catch {
    // ignore
  }
}
