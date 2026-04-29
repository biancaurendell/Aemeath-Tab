# Favicon 快速测试指南

## 快速开始测试

### 1️⃣ 启动开发服务器
```bash
cd "C:\Users\Administrator\Documents\New project 7"
npm run dev
```

### 2️⃣ 打开浏览器
访问: `http://localhost:3000`

### 3️⃣ 添加快捷方式测试
点击 **➕ 添加图标** 按钮

### 4️⃣ 测试用例

#### 测试1：国内网站
输入: `https://www.bilibili.com`
- 离开 URL 字段
- **预期**：显示 B 站粉色图标
- **实际**：__________

#### 测试2：国际网站
输入: `https://github.com`
- 离开 URL 字段
- **预期**：显示 GitHub 黑色 logo
- **实际**：__________

#### 测试3：知乎
输入: `https://www.zhihu.com`
- 离开 URL 字段
- **预期**：显示知乎蓝色图标
- **实际**：__________

#### 测试4：掘金
输入: `https://juejin.cn`
- 离开 URL 字段
- **预期**：显示掘金蓝色 logo
- **实际**：__________

## 测试检查表

- [ ] 添加图标弹窗正常打开
- [ ] 输入 URL 后离开字段，favicon 自动加载
- [ ] favicon 显示正确的图标（不是默认字母）
- [ ] 保存快捷方式后，图标保持显示
- [ ] 刷新页面后，图标仍然显示
- [ ] 多个快捷方式的 favicon 都能正确显示

## 故障排除

### 🚨 如果 favicon 没有显示

**检查1：是否显示首字母代替？**
- ✅ 是 → 正常，网站可能没有 favicon.ico
- ❌ 否 → 继续检查

**检查2：打开浏览器控制台（F12）**
- 查看是否有错误信息
- 查看网络标签（Network），看 favicon.ico 请求的状态

**检查3：直接在地址栏尝试**
```
https://www.bilibili.com/favicon.ico
```
- ✅ 能加载 → favicon 文件存在
- ❌ 404 错误 → 网站没有 favicon.ico（正常）

### 🔧 如果所有 favicon 都加载失败

**方案A：清除浏览器缓存**
1. 按 F12 打开开发者工具
2. 右键点击刷新按钮
3. 选择 **清空缓存并硬刷新**

**方案B：切换到 DuckDuckGo**
编辑 `src/modules/shortcuts.js` 第349行：
```javascript
return `https://icons.duckduckgo.com/ip3/${encodeURIComponent(parsed.hostname)}.ico`;
```
然后运行 `npm run check:js` 和 `npm run dev`

## 成功标志

✅ 至少 3 个测试网站显示了正确的 favicon 图标

## 最后验证

打开生产版本测试：
```bash
npm run build
npm run test:smoke:dist
```

应该看到所有测试通过 ✓

## 回报问题

如果测试失败，请提供以下信息：

1. **测试网站**：_______________
2. **预期结果**：_______________
3. **实际结果**：_______________
4. **浏览器**：Chrome / Firefox / Safari / Edge
5. **浏览器版本**：_______________
6. **网络环境**：国内 / 国外 / VPN / 代理

---

**测试时间**：_____________  
**测试人**：_____________  
**测试结果**：✅ 通过 / ❌ 失败

