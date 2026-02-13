# 配置 X（Twitter）发布通知

发布到 npm 后自动在 X 平台发一条 release 推文。需在 GitHub 仓库中配置 X API 凭证。

## 一、在 X 开发者平台获取凭证

1. 打开 [X Developer Portal](https://developer.x.com/)（原 Twitter Developer）。
2. 创建或使用已有 **Project / App**，并开通 **API v2** 与 **Read and write** 权限。
3. 在 App 的 **Keys and tokens** 中获取：
   - **API Key**（即 Consumer Key）
   - **API Key Secret**（即 Consumer Secret）
   - 生成 **Access Token and Secret**（需选 Read and write），得到：
     - **Access Token**
     - **Access Token Secret**

以上四者将作为 GitHub 仓库的 Secrets，供 Actions 在发布完成后调用 X API 发推。

## 二、用 gh 配置 GitHub 仓库 Secrets

在**本仓库根目录**执行（需已安装 [GitHub CLI](https://cli.github.com/) 并 `gh auth login`）：

```bash
# 进入仓库目录
cd /path/to/message-bridge

# 依次设置四个 Secret（粘贴时无回显，输入后回车即可）
gh secret set X_API_KEY
gh secret set X_API_SECRET
gh secret set X_ACCESS_TOKEN
gh secret set X_ACCESS_TOKEN_SECRET
```

每次执行会提示输入对应值；也可从文件或 stdin 写入，例如：

```bash
echo -n "你的API Key" | gh secret set X_API_KEY
echo -n "你的API Key Secret" | gh secret set X_API_SECRET
echo -n "你的Access Token" | gh secret set X_ACCESS_TOKEN
echo -n "你的Access Token Secret" | gh secret set X_ACCESS_TOKEN_SECRET
```

**Secret 名称约定**（与 workflow 一致）：

| Secret 名称 | 含义 |
|-------------|------|
| `X_API_KEY` | X App 的 API Key（Consumer Key） |
| `X_API_SECRET` | X App 的 API Key Secret（Consumer Secret） |
| `X_ACCESS_TOKEN` | 已授权的 Access Token |
| `X_ACCESS_TOKEN_SECRET` | 上述 Access Token 的 Secret |

## 三、在 GitHub 网页上配置（不用 gh 时）

1. 打开仓库 → **Settings** → **Secrets and variables** → **Actions**。
2. 点击 **New repository secret**，按上表名称分别添加四个 Secret。

## 四、发布流程中的行为

- 当执行 `git tag v*` 并 `git push origin <tag>` 时，会触发 **Publish to npm** workflow。
- 在 **npm 发布成功** 后，若已配置上述四个 Secret，会再执行 **Notify X** 步骤，向 X 发送一条关于本次 release 的推文（含版本号与仓库链接）。
- 若未配置任一 Secret，则跳过 X 推送，不影响 npm 发布。

## 五、定义发布格式（推文模板）

发到 X 的文案可通过**推文模板**自定义，未设置时使用默认格式。

### 占位符

| 占位符     | 含义           |
|------------|----------------|
| `{name}`   | 包名（来自 package.json） |
| `{version}`| 本次发布版本号（如 0.2.2） |
| `{repoUrl}`| 仓库地址         |

### 方式一：仓库变量（推荐）

在 GitHub 仓库 **Settings → Secrets and variables → Actions** 里，**Variables** 页新增一条：

- **Name**：`X_RELEASE_TEMPLATE`
- **Value**：你的模板内容，例如：

```text
🚀 {name} v{version} 已发布

npm: npm i {name}
{repoUrl}
```

一条推文最多 280 字符，超出部分会被自动截断。

### 方式二：改脚本默认

直接改仓库里 `scripts/post-release-x.js` 中的 `defaultTemplate` 字符串即可；不设 `X_RELEASE_TEMPLATE` 时就会用这个默认模板。

---

## 六、可选：关闭 X 推送

若不想在 release 时发推，可删除这四个 Secret，或保留 Secret 但在 workflow 中注释掉 `notify-x` 相关 job。
