#!/usr/bin/env node
/**
 * 发布完成后向 X (Twitter) 发送一条 release 推文。
 * 使用 OAuth 1.0a 调用 API v2 POST /2/tweets。
 * 环境变量：X_API_KEY, X_API_SECRET, X_ACCESS_TOKEN, X_ACCESS_TOKEN_SECRET,
 *          VERSION（可选）, REPO_URL（可选）,
 *          X_RELEASE_TEMPLATE（可选）推文模板，占位符：{name} {version} {repoUrl}
 */

const crypto = require('crypto');
const https = require('https');
const path = require('path');
const fs = require('fs');

const required = ['X_API_KEY', 'X_API_SECRET', 'X_ACCESS_TOKEN', 'X_ACCESS_TOKEN_SECRET'];
for (const k of required) {
  if (!process.env[k]) {
    console.error(`[post-release-x] 缺少环境变量 ${k}，跳过 X 推送`);
    process.exit(0);
  }
}

const apiKey = process.env.X_API_KEY;
const apiSecret = process.env.X_API_SECRET;
const accessToken = process.env.X_ACCESS_TOKEN;
const accessTokenSecret = process.env.X_ACCESS_TOKEN_SECRET;

const pkgPath = path.join(__dirname, '..', 'package.json');
let pkg = {};
try {
  pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
} catch (_) {}

let version = process.env.VERSION || pkg.version || 'unknown';
const repoUrl = process.env.REPO_URL || pkg.repository?.url?.replace(/^git\+/, '').replace(/\.git$/, '') || 'https://github.com/ZiweiAxis/qingniao';
const name = pkg.name || 'skill-message-bridge';
const ver = String(version).replace(/^v/, '') || 'unknown';

const defaultTemplate = '🚀 {name} v{version} 已发布到 npm。\n\nAI 消息桥梁：飞书/钉钉/企微 异步通知与确认。\n\n{repoUrl}';
const template = process.env.X_RELEASE_TEMPLATE || defaultTemplate;
const text = template
  .replace(/\{name\}/g, name)
  .replace(/\{version\}/g, ver)
  .replace(/\{repoUrl\}/g, repoUrl)
  .slice(0, 280);

function rfc3986(s) {
  return encodeURIComponent(s).replace(/[!*'()]/g, c => '%' + c.charCodeAt(0).toString(16).toUpperCase());
}

function postTweet() {
  return new Promise((resolve, reject) => {
    const payload = JSON.stringify({ text });
    const url = 'https://api.twitter.com/2/tweets';
    const ts = Math.floor(Date.now() / 1000);
    const nonce = crypto.randomBytes(16).toString('hex');
    const oauthParams = {
      oauth_consumer_key: apiKey,
      oauth_nonce: nonce,
      oauth_signature_method: 'HMAC-SHA1',
      oauth_timestamp: String(ts),
      oauth_token: accessToken,
      oauth_version: '1.0',
    };
    const paramStr = Object.keys(oauthParams)
      .sort()
      .map(k => `${rfc3986(k)}=${rfc3986(oauthParams[k])}`)
      .join('&');
    const signBase = `POST&${rfc3986(url)}&${rfc3986(paramStr)}`;
    const signKey = `${rfc3986(apiSecret)}&${rfc3986(accessTokenSecret)}`;
    const sig = crypto.createHmac('sha1', signKey).update(signBase).digest('base64');
    oauthParams.oauth_signature = sig;
    const auth = 'OAuth ' + Object.keys(oauthParams).sort().map(k => `${rfc3986(k)}="${rfc3986(oauthParams[k])}"`).join(', ');

    const req = https.request(
      {
        hostname: 'api.twitter.com',
        path: '/2/tweets',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: auth,
          'Content-Length': Buffer.byteLength(payload),
        },
      },
      (res) => {
        let data = '';
        res.on('data', (c) => (data += c));
        res.on('end', () => {
          if (res.statusCode >= 200 && res.statusCode < 300) resolve(data);
          else reject(new Error(`X API ${res.statusCode}: ${data}`));
        });
      }
    );
    req.on('error', reject);
    req.write(payload);
    req.end();
  });
}

postTweet()
  .then((r) => {
    console.log('[post-release-x] 已发送推文');
    try {
      const j = JSON.parse(r);
      if (j.data?.id) console.log('Tweet ID:', j.data.id);
    } catch (_) {}
  })
  .catch((e) => {
    console.error('[post-release-x] 发送失败:', e.message);
    process.exit(1);
  });
