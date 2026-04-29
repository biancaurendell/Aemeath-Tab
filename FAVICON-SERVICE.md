# Favicon 获取服务方案

## 当前方案（推荐）

已将favicon获取服务改为**直接从网站获取 favicon.ico**。

### 最新方案：直接网站 Favicon（最可靠）

```javascript
// 调用方式
https://domain.com/favicon.ico
```

**优点**：
- ✅ 最可靠，不依赖任何第三方服务
- ✅ 无跨域限制，浏览器原生支持
- ✅ 无访问限制，国内国外都能用
- ✅ 无需翻墙或代理
- ✅ 最原生的网站favicon标准

**缺点**：
- ⚠️ 少数网站可能没有 favicon.ico 文件
- ⚠️ 首次加载会比较慢（但浏览器会缓存）

## 工作流程

```
用户输入URL → 提取域名和协议 → 构建favicon.ico URL → 浏览器请求
                                                    ↓
                                    成功 → 显示favicon
                                    失败 → 显示首字母
```

## 备选方案

如果直接方案有问题，可以切换到以下备选方案：

### 备选1：DuckDuckGo 图标服务（较稳定）

```javascript
https://icons.duckduckgo.com/ip3/${domain}.ico
```

**特点**：
- 有缓存和处理
- 需要访问国际网络
- 通常比较稳定

### 备选2：Google 图标服务（需翻墙）

```javascript
https://www.google.com/s2/favicons?sz=128&domain_url=${domain}
```

**特点**：
- 功能最强
- 需要翻墙
- 不推荐

### 备选3：360 浏览器 CDN（已废弃）

```javascript
https://bos.360.cn/v2/favicon/?q=${domain}
```

**特点**：
- 国内CDN
- 容易无法访问（已验证不稳定）

## 实现代码

**当前使用的代码** (`src/modules/shortcuts.js`):

```javascript
export function faviconForUrl(value) {
  try {
    const parsed = new URL(getValidShortcutUrl(value));
    
    // 直接返回网站的 favicon.ico 路径
    // 这是最通用和可靠的方案，不依赖第三方CDN
    // 浏览器会自动处理跨域和缓存
    return `${parsed.origin}/favicon.ico`;
  } catch {
    return "";
  }
}
```

## 如何切换方案

### 快速切换到 DuckDuckGo

编辑 `src/modules/shortcuts.js` 第349行：

```javascript
// 替换为：
return `https://icons.duckduckgo.com/ip3/${encodeURIComponent(parsed.hostname)}.ico`;
```

然后运行 `npm run check:js` 验证。

### 快速切换到 Google

编辑 `src/modules/shortcuts.js` 第349行：

```javascript
// 替换为：
return `https://www.google.com/s2/favicons?sz=128&domain_url=${encodeURIComponent(parsed.origin)}`;
```

## 测试用例

| 网站 | URL | 预期 |
|------|-----|------|
| 哔哩哔哩 | https://www.bilibili.com | ✅ 显示B站粉色图标 |
| 知乎 | https://www.zhihu.com | ✅ 显示蓝色图标 |
| GitHub | https://github.com | ✅ 显示黑色logo |
| 掘金 | https://juejin.cn | ✅ 显示蓝色logo |
| 微博 | https://www.weibo.com | ✅ 显示红色logo |

## 故障排除

### 图标加载缓慢

**原因**：需要请求网站服务器获取favicon
```
解决方案：这是正常的，首次加载后浏览器会缓存
```

### 某些网站没有图标

**原因**：网站没有提供 favicon.ico 文件
```
解决方案：应用会显示网站名称首字母作为替代，这是预期行为
例如：知乎 → "知"，GitHub → "G"
```

### 离线时无法获取图标

**原因**：需要网络连接访问网站
```
解决方案：需要连接到互联网才能获取favicon
```

### 跨域限制

**原因**：浏览器的跨域政策
```
解决方案：直接favicon方案不会有跨域问题（浏览器原生支持）
如果用CDN服务会遇到，所以我们用直接方案
```

## 性能考虑

### 缓存

- ✅ 浏览器会自动缓存favicon
- ✅ 第二次加载同一网站时会很快

### 加载时间

- 首次：100-500ms（取决于网络）
- 后续：<10ms（使用缓存）

### 带宽

- 每个favicon通常：1-5KB
- 不会造成显著的带宽消耗

## 相关文件

- **修改文件**: `src/modules/shortcuts.js`
- **函数**: `faviconForUrl()` (第342-353行)
- **参考文档**: `FAVICON-QUICK-REFERENCE.md`

## 版本历史

- ✅ v2 (2026-04-29)：直接网站favicon.ico（推荐）
- ✅ v1 (2026-04-29)：360浏览器CDN（已废弃）
- ❌ v0 (之前)：谷歌服务（需翻墙）

## 为什么选择直接方案

1. **最可靠** - 不依赖第三方，不会突然无法访问
2. **最快** - 直接访问源站，无中间环节
3. **最标准** - favicon.ico 是网站标准配置
4. **最安全** - 不经过第三方CDN，更安全
5. **最简单** - 代码最简洁，无需复杂逻辑

## 参考资源

- [Favicon 标准规范](https://en.wikipedia.org/wiki/Favicon)
- [网站ico文件](https://developer.mozilla.org/en-US/docs/Glossary/Favicon)
- [浏览器如何加载favicon](https://en.wikipedia.org/wiki/Favicon)



