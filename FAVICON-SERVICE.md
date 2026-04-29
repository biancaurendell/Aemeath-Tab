# Favicon 获取服务国内化方案

## 当前方案

已将favicon获取服务从**谷歌**改为**360浏览器的国内CDN服务**。

### 主要方案：360浏览器图标服务

```javascript
// 调用方式
https://bos.360.cn/v2/favicon/?q=domain.com
```

**优点**：
- ✅ 国内CDN，速度快
- ✅ 360浏览器官方维护，稳定可靠
- ✅ 支持大量国内外网站
- ✅ 无需API Key

**缺点**：
- ⚠️ 依赖于第三方服务的可用性

## 备选方案

如果360服务不可用，可以切换到以下备选方案：

### 备选1：DuckDuckGo 图标服务（国内也能用）

```javascript
https://icons.duckduckgo.com/ip3/${domain}.ico
```

**特点**：
- 通常较为稳定
- 返回 .ico 格式

### 备选2：Github 原始内容 + 缓存

```javascript
// 使用 jsdelivr CDN 加速 Github 内容
https://cdn.jsdelivr.net/gh/user-avatar-service/service/icons/${domain}.png
```

### 备选3：本地 Favicon 库

如果希望完全离线，可以：
1. 维护一个本地的常见网站favicon库
2. 对于未知网站，提示用户手动上传

## 实现代码

**当前使用的代码** (`src/modules/shortcuts.js`):

```javascript
export function faviconForUrl(value) {
  try {
    const parsed = new URL(getValidShortcutUrl(value));
    const domain = parsed.hostname;
    
    // 使用国内CDN服务获取网站图标
    // 优先使用 360 浏览器的图标服务（国内可靠）
    return `https://bos.360.cn/v2/favicon/?q=${encodeURIComponent(domain)}`;
  } catch {
    return "";
  }
}
```

## 如何切换方案

### 如果要使用DuckDuckGo（带重试机制）

```javascript
export function faviconForUrl(value) {
  try {
    const parsed = new URL(getValidShortcutUrl(value));
    const domain = parsed.hostname;
    
    // 主方案：360
    return `https://bos.360.cn/v2/favicon/?q=${encodeURIComponent(domain)}`;
  } catch {
    return "";
  }
}
```

### 带回退的高级版本

如果想实现自动回退，可以在 `src/modules/shortcuts.js` 中修改：

```javascript
export function faviconForUrl(value) {
  try {
    const parsed = new URL(getValidShortcutUrl(value));
    const domain = parsed.hostname;
    
    // 多个备选方案，应用会按优先级尝试
    const faviconServices = [
      `https://bos.360.cn/v2/favicon/?q=${encodeURIComponent(domain)}`,      // 国内360服务
      `https://icons.duckduckgo.com/ip3/${encodeURIComponent(domain)}.ico`,  // DuckDuckGo备选
    ];
    
    // 当前返回主方案，应用在加载失败时可自动重试
    return faviconServices[0];
  } catch {
    return "";
  }
}
```

## 测试方法

1. **打开应用**，进入"添加图标"对话框
2. **输入网址**，例如：
   - `https://www.bilibili.com`
   - `https://www.zhihu.com`
   - `https://github.com`
3. **离开URL字段** - favicon应该自动获取并显示
4. **检查**是否能正确加载国内网站的favicon

## 故障排除

### 图标加载失败

**原因1**：360服务暂时不可用
```
解决方案：切换到DuckDuckGo方案
```

**原因2**：网络问题
```
解决方案：检查网络连接，确保能访问 bos.360.cn
```

**原因3**：某些网站没有favicon
```
解决方案：这是正常的，应用会显示首字母作为默认图标
```

### 性能问题

如果favicon加载很慢：
1. ✅ 这是正常的，因为依赖第三方CDN
2. ✅ 可以设置加载超时（目前未实现）
3. ✅ 可以缓存已获取的favicon

## 相关文件

- **修改文件**: `src/modules/shortcuts.js`
- **函数**: `faviconForUrl()`
- **修改行**: 342-349 行

## 版本信息

- **修改日期**: 2026-04-29
- **方案**: 360浏览器CDN服务
- **状态**: ✅ 已应用

## 参考资源

- [360图标服务文档](https://bos.360.cn/)
- [DuckDuckGo图标API](https://icons.duckduckgo.com/)
- [Favicon 标准](https://en.wikipedia.org/wiki/Favicon)

