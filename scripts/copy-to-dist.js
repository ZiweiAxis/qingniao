const fs = require("fs");
const path = require("path");
const dist = path.join(__dirname, "..", "dist");
fs.mkdirSync(dist, { recursive: true });
["index.js", "feishu-turn.js"].forEach((f) => {
  const src = path.join(__dirname, "..", f);
  if (fs.existsSync(src)) fs.copyFileSync(src, path.join(dist, f));
});
