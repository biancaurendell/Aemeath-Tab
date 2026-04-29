# 部署配置检查清单

## ✅ 已完成的设置

- ✅ 创建了 GitHub Actions 工作流：`.github/workflows/deploy.yml`
- ✅ 工作流配置为在 push 到 main/master 时自动部署
- ✅ 创建了部署指南文档：`DEPLOY.md`

## 📋 你需要做的事项

### 1. 获取并配置 Cloudflare 凭证

- [ ] 登录 [Cloudflare 控制面板](https://dash.cloudflare.com/)
- [ ] 获取 API Token（个人资料 → API 令牌 → 创建令牌）
- [ ] 记下你的 Account ID（通常在控制面板首页右侧）

### 2. 在 GitHub 中配置 Secrets

- [ ] 打开 GitHub 仓库设置
- [ ] 进入 Secrets and variables → Actions
- [ ] 添加 `CLOUDFLARE_API_TOKEN` secret
- [ ] 添加 `CLOUDFLARE_ACCOUNT_ID` secret

### 3. 验证 Wrangler 配置

- [ ] 检查 `wrangler.toml` 中的 `name` 是否正确（应为 "imiss"）
- [ ] 检查 `assets.directory` 是否指向正确的构建目录（应为 "dist"）
- [ ] 可选：在 `wrangler.toml` 中添加 `account_id`

### 4. 测试部署流程

- [ ] Push 代码到 GitHub 的 main/master 分支
- [ ] 进入 GitHub Actions 页面查看工作流运行
- [ ] 确认构建和部署完成
- [ ] 访问你的 Worker 地址验证部署成功

### 5. 持续集成（可选增强）

- [ ] 可选：在部署前添加测试步骤（`npm run test:smoke`）
- [ ] 可选：添加检查代码步骤（`npm run check:js`）

## 🔗 相关资源

- **部署指南**：查看 `DEPLOY.md` 获取详细步骤
- **wrangler 配置**：`wrangler.toml`
- **GitHub Actions 工作流**：`.github/workflows/deploy.yml`

## 🚀 快速命令参考

```bash
# 本地构建
npm run build

# 本地部署到 Workers
npm run deploy

# 部署到 Cloudflare Pages
npm run deploy:pages

# 开发服务器
npm run dev
```

## 📞 故障排除

如果部署失败，请检查：

1. **错误信息**：查看 GitHub Actions 的详细日志
2. **凭证**：确保 Secrets 中的 Token 和 Account ID 正确
3. **wrangler.toml**：确保配置文件语法正确
4. **构建目录**：确认 `assets.directory` 指向正确的位置

---

完成以上步骤后，你的项目就能通过 GitHub Actions 自动部署到 Cloudflare Workers 了！🎉

