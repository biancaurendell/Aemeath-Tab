# Favicon 服务切换快速参考

## 当前配置

**使用服务**: 直接从网站获取 favicon.ico
**URL 格式**: `https://domain.com/favicon.ico`

## 优势

- ✅ **无需第三方服务** - 不依赖CDN或API
- ✅ **最可靠** - 直接访问网站，最原生的方案
- ✅ **无跨域问题** - 浏览器会自动处理
- ✅ **无访问限制** - 不需要翻墙，不需要代理
- ✅ **国内国外都支持** - 所有网站都有 favicon.ico

## 工作原理

```javascript
// 对于 https://www.bilibili.com 返回：
https://www.bilibili.com/favicon.ico

// 对于 https://github.com 返回：
https://github.com/favicon.ico
```

浏览器会自动请求这个文件，如果网站有favicon就显示，没有的话显示首字母。

## 切换其他方案

如果需要切换方案，编辑 `src/modules/shortcuts.js` 第349行：

### 备选方案对比

| 方案 | 代码 | 优点 | 缺点 |
|------|------|------|------|
| **现在** | `${parsed.origin}/favicon.ico` | 最可靠，无依赖 | 少数网站可能没favicon |
| DuckDuckGo | `https://icons.duckduckgo.com/ip3/${domain}.ico` | 有缓存和处理 | 需要访问国际网络 |
| 360 | `https://bos.360.cn/v2/favicon/?q=${domain}` | 国内CDN | 不稳定，可能无法访问 |
| Google | `https://www.google.com/s2/favicons?sz=128&domain_url=...` | 功能强 | 需要翻墙 |

## 快速切换代码

### 切换到 DuckDuckGo（如果直接方案有问题）
```javascript
// 第349行替换为：
return `https://icons.duckduckgo.com/ip3/${encodeURIComponent(parsed.hostname)}.ico`;
```

### 切换回 Google（不推荐）
```javascript
// 第349行替换为：
return `https://www.google.com/s2/favicons?sz=128&domain_url=${encodeURIComponent(parsed.origin)}`;
```

## 文件位置

**编辑文件**: `src/modules/shortcuts.js`
**编辑位置**: 第342-353行的 `faviconForUrl()` 函数
**关键行**: 第349行

## 测试快捷方式

添加以下快捷方式测试favicon是否工作：

| 网站 | URL | 预期结果 |
|------|-----|--------|
| 哔哩哔哩 | https://www.bilibili.com | 显示B站图标 |
| 知乎 | https://www.zhihu.com | 显示知乎图标 |
| GitHub | https://github.com | 显示GH图标 |
| 掘金 | https://juejin.cn | 显示掘金图标 |
| 微博 | https://www.weibo.com | 显示微博图标 |

## 常见问题

**Q: 图标加载很慢？**
A: 这是正常的，因为要访问网站服务器。首次加载后浏览器会缓存。

**Q: 有些网站没有显示图标？**
A: 某些网站可能没有 favicon.ico 文件，这是正常的，应用会显示网站名称首字母。

**Q: 为什么不用CDN服务？**
A: 因为CDN服务容易出现访问问题（如360无法访问），直接方案最稳定。

**Q: 可以离线工作吗？**
A: 不行，因为需要访问网站获取图标。建议有网络连接。

## 修改记录

- ✅ 2026-04-29 v2: 改为直接访问网站 favicon.ico（最可靠）
- ✅ 2026-04-29 v1: 使用360浏览器CDN（已废弃，访问不稳定）
- 📝 详见: `FAVICON-SERVICE.md`


