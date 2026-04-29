# Favicon 服务切换快速参考

## 当前配置

**使用服务**: 360浏览器国内CDN
**API 地址**: `https://bos.360.cn/v2/favicon/?q={domain}`

## 切换方案

如果需要切换到其他服务，编辑 `src/modules/shortcuts.js` 第350行：

### 方案对比

| 方案 | 服务商 | 连接 | 速度 | 稳定性 | 推荐 |
|------|--------|------|------|--------|------|
| **现在** | 360 | 国内 | ⚡⚡⚡ | ⭐⭐⭐⭐ | ✅ |
| 备选1 | DuckDuckGo | 国际 | ⚡⚡ | ⭐⭐⭐ | 👍 |
| 备选2 | Google | 国际 | ⚡ | ⭐⭐⭐⭐⭐ | ❌ 墙 |

## 快速切换代码

### 切换到 DuckDuckGo
```javascript
// 第350行替换为：
return `https://icons.duckduckgo.com/ip3/${encodeURIComponent(domain)}.ico`;
```

### 切换到 Google（不推荐）
```javascript
// 第350行替换为：
return `https://www.google.com/s2/favicons?sz=128&domain_url=${encodeURIComponent(parsed.origin)}`;
```

## 文件位置

**编辑文件**: `src/modules/shortcuts.js`
**编辑位置**: 第342-354行的 `faviconForUrl()` 函数

## 测试快捷方式

添加以下快捷方式测试favicon是否工作：

| 网站 | URL |
|------|-----|
| 哔哩哔哩 | https://www.bilibili.com |
| 知乎 | https://www.zhihu.com |
| GitHub | https://github.com |
| 掘金 | https://juejin.cn |
| 微博 | https://www.weibo.com |

## 常见问题

**Q: 为什么我选的Google服务？**
A: Google 服务在国内需要翻墙，所以换成了360，速度更快。

**Q: 360服务不稳定怎么办？**
A: 可以编辑 `FAVICON-SERVICE.md` 查看多个备选方案，按照里面的代码替换。

**Q: favicon加载失败会怎样？**
A: 应用会显示网站名称的首字母作为默认图标，不影响功能。

## 修改记录

- ✅ 2026-04-29: 从Google改为360浏览器CDN
- 📝 详见: `FAVICON-SERVICE.md`

