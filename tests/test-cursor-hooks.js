/**
 * Cursor hooks 逻辑测试：ensureStopHook / unregisterStopHook
 * 在临时目录下创建 .cursor/hooks.json，不依赖飞书配置。
 */

const path = require("path");
const fs = require("fs");
const os = require("os");

const distPath = path.join(__dirname, "..", "dist", "cursor-hooks.js");
const { ensureStopHook, unregisterStopHook } = require(distPath);

function readHooks(root) {
  const p = path.join(root, ".cursor", "hooks.json");
  try {
    return JSON.parse(fs.readFileSync(p, "utf8"));
  } catch {
    return null;
  }
}

function run(name, fn) {
  try {
    fn();
    console.log("  ✅", name);
    return true;
  } catch (e) {
    console.error("  ❌", name, e.message);
    return false;
  }
}

function main() {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "mb-hooks-test-"));
  let ok = 0;
  let total = 0;

  console.log("🧪 Cursor hooks 测试\n");

  // 1. 无文件时 ensureStopHook 应创建 .cursor/hooks.json 并写入本 skill 的 stop hook
  total++;
  if (
    run("ensureStopHook：无文件时创建 .cursor/hooks.json 并写入 stop hook", () => {
      ensureStopHook(root);
      const obj = readHooks(root);
      if (!obj || !obj.hooks || !Array.isArray(obj.hooks.stop)) throw new Error("hooks.json 结构异常");
      const ours = obj.hooks.stop.find(
        (e) => e.command && (e.command.includes("cursor-stop-hook") || e.command.includes("skill-message-bridge"))
      );
      if (!ours) throw new Error("未找到本 skill 的 stop hook");
      if (ours.timeout !== 15 || ours.loop_limit !== 5) throw new Error("timeout/loop_limit 应为 15/5");
    })
  )
    ok++;

  // 2. 已有本 skill 时 ensureStopHook 不再重复添加
  total++;
  if (
    run("ensureStopHook：已有本 skill 时不再重复添加", () => {
      ensureStopHook(root);
      const obj = readHooks(root);
      const ours = obj.hooks.stop.filter(
        (e) => e.command && (e.command.includes("cursor-stop-hook") || e.command.includes("skill-message-bridge"))
      );
      if (ours.length !== 1) throw new Error("应仅有一条本 skill 的 hook，实际: " + ours.length);
    })
  )
    ok++;

  // 3. unregisterStopHook 移除本 skill 的条目
  total++;
  if (
    run("unregisterStopHook：移除本 skill 的 stop hook", () => {
      unregisterStopHook(root);
      const obj = readHooks(root);
      const ours = obj.hooks.stop.filter(
        (e) => e.command && (e.command.includes("cursor-stop-hook") || e.command.includes("skill-message-bridge"))
      );
      if (ours.length !== 0) throw new Error("移除后应无本 skill 的 hook，实际: " + ours.length);
    })
  )
    ok++;

  // 4. 已有其他 hook 时 unregisterStopHook 只移除本 skill，保留其他
  total++;
  if (
    run("unregisterStopHook：保留其他 stop hook", () => {
      const otherCmd = "echo other";
      ensureStopHook(root);
      const obj = readHooks(root);
      obj.hooks.stop.push({ command: otherCmd });
      fs.writeFileSync(path.join(root, ".cursor", "hooks.json"), JSON.stringify(obj, null, 2), "utf8");
      unregisterStopHook(root);
      const after = readHooks(root);
      const other = after.hooks.stop.filter((e) => e.command === otherCmd);
      if (other.length !== 1) throw new Error("其他 hook 应保留，实际: " + JSON.stringify(after.hooks.stop));
    })
  )
    ok++;

  // 5. 无文件或无效 JSON 时 unregisterStopHook 不抛错（静默忽略）
  total++;
  if (
    run("unregisterStopHook：无文件或无效 JSON 时不抛错", () => {
      const emptyRoot = fs.mkdtempSync(path.join(os.tmpdir(), "mb-hooks-test-empty-"));
      unregisterStopHook(emptyRoot);
      unregisterStopHook(path.join(emptyRoot, "nonexistent"));
      fs.rmSync(emptyRoot, { recursive: true, force: true });
    })
  )
    ok++;

  // 清理
  fs.rmSync(root, { recursive: true, force: true });

  console.log("\n" + (ok === total ? "✅ 全部通过" : "❌ " + ok + "/" + total + " 通过"));
  process.exit(ok === total ? 0 : 1);
}

main();
