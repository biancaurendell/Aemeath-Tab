# GitHub Actions 部署指南

## 概述

本项目配置了 GitHub Actions 工作流，支持自动部署到 Cloudflare Workers。当你 push 代码到 GitHub 时，工作流会自动构建并部署到 Cloudflare Workers。

## 前置要求

1. **GitHub 仓库**：将项目推送到 GitHub
2. **Cloudflare 账户**：确保有 Cloudflare 账户
3. **Cloudflare 工作者（Worker）**：已在 Cloudflare 中创建 `imiss` Worker

## 配置步骤

### 1. 获取 Cloudflare 凭证

#### 获取 API Token：
1. 登录 [Cloudflare 控制面板](https://dash.cloudflare.com/)
2. 左侧菜单 → **我的个人资料**
3. 选择 **API 令牌** 标签
4. 点击 **创建令牌**
5. 选择 **编辑 Cloudflare Workers** 模板（或自定义权限）
6. 确保权限包括：
   - Account.Workers Scripts - Edit
   - Account.Workers KV Storage - Edit（如使用 KV）
7. 复制生成的 API 令牌

#### 获取 Account ID：
1. 在 Cloudflare 控制面板首页右侧可以看到 **Account ID**
2. 或在 wrangler.toml 配置中查看

### 2. 在 GitHub 中配置 Secrets

1. 打开 GitHub 仓库
2. 进入 **Settings** → **Secrets and variables** → **Actions**
3. 点击 **New repository secret**，添加以下两个密钥：

| Secret Name | 值 | 说明 |
|---|---|---|
| `CLOUDFLARE_API_TOKEN` | 从步骤 1 获得的 API Token | Cloudflare API 认证令牌 |
| `CLOUDFLARE_ACCOUNT_ID` | 你的 Cloudflare Account ID | Cloudflare 账户 ID |

### 3. 添加 wrangler.toml 中的 Account ID（可选）

在 `wrangler.toml` 中可以明确指定账户 ID，这样 Wrangler 就能知道部署到哪个账户：

```toml
account_id = "your-account-id"
name = "imiss"
```

## 工作流说明

### 触发条件
工作流在以下情况触发：
- ✅ 向 `main` 或 `master` 分支 push 代码
- ✅ 创建向 `main` 或 `master` 的 Pull Request

### 工作流步骤
1. **检出代码** - 从 GitHub 获取最新代码
2. **设置 Node.js** - 配置 Node.js 环境（使用 npm 缓存加速）
3. **安装依赖** - 运行 `npm ci`
4. **构建项目** - 运行 `npm run build`
5. **部署到 Workers** - 运行 `npx wrangler deploy`

### 查看部署状态
1. 在 GitHub 仓库中进入 **Actions** 标签
2. 选择对应的工作流运行
3. 查看构建和部署日志

## wrangler.toml 配置示例

```toml
name = "imiss"
compatibility_date = "2026-04-29"
compatibility_flags = ["nodejs_compat"]
account_id = "your-cloudflare-account-id"  # 添加此行

[observability]
enabled = true

[assets]
directory = "dist"  # 注意：确保指向构建后的目录
not_found_handling = "single-page-application"
```

## 常见问题

### Q: 部署失败，提示 "Unauthorized"
**A**: 检查 GitHub Secrets 中的 `CLOUDFLARE_API_TOKEN` 是否正确且未过期。

### Q: 部署成功但网站没有更新
**A**: 
- 确认 wrangler.toml 中的 `assets.directory` 指向正确的构建目录
- 清除浏览器缓存
- 在 Cloudflare 控制面板中检查 Worker 版本

### Q: 如何只部署到特定的分支
**A**: 编辑 `.github/workflows/deploy.yml` 中的 `on.push.branches` 部分。

### Q: 如何添加其他操作（如运行测试）
**A**: 在 `deploy.yml` 中的 `steps` 部分添加新的步骤，例如：
```yaml
- name: Run tests
  run: npm run test:smoke
```

## 本地部署

如果想在本地手动部署到 Workers，运行：

```bash
npm run deploy
```

或部署到 Cloudflare Pages：

```bash
npm run deploy:pages
```

## 更多资源

- [Wrangler 官方文档](https://developers.cloudflare.com/workers/wrangler/)
- [GitHub Actions 文档](https://docs.github.com/en/actions)
- [Cloudflare Workers 文档](https://developers.cloudflare.com/workers/)

