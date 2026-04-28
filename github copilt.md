# GitHub Copilot 改进记录

## 2.3 统一资产管理实现总结

日期：2026-04-28

### 改动范围

修改文件：
- `src/state/storage.js` - 扩展资产管理层
- `src/state/settings.js` - 快照导出导入完整资产
- `app.js` - 快捷图标与音乐封面接入资产链路

### storage.js 改进

**新增能力：**
- `assetRef(key)` - 生成资产引用 `indexeddb:<key>`
- `isAssetRef(value)` - 判断是否是资产引用
- `resolveAssetKey(ref)` - 从引用解出 key
- `readAssetByRef(ref)` - 按引用读取资产
- `writeAssetByRef(ref, value)` - 按引用写入资产
- `readAssetKeys()` - 列出全部资产 key
- `readAssetMap(keys)` - 批量读取资产
- `readAssetsByPrefix(prefix)` - 按前缀读取资产
- `deleteAssetsByPrefix(prefix)` - 按前缀删除资产

**支持的资产 key：**
```
background.original    (背景原图)
background.current     (当前背景缓存)
background.dark        (暗色背景)
shortcut.icon.<id>     (快捷图标上传图)
music.cover.<trackId>  (音乐封面缓存)
```

### settings.js 改进

**导出与导入：**
- `buildConfigSnapshot()` 现在导出**全部 IndexedDB 资产**
- `importConfigSnapshot(snapshot)` 先恢复资产再恢复配置
- `collectSnapshotAssets()` - 收集当前 IndexedDB 全部资产
- `restoreSnapshotAssets(assets)` - 还原资产包
- `normalizeSnapshotAssets(assets)` - 兼容旧资产字段名

**兼容性：**
- 支持旧 `pixelNewTab.config` 结构
- 自动迁移旧 key 到新配置
- 导入时自动规范化资产字段

### app.js 改进

**快捷图标资产化：**
```
上传本地图标 → IndexedDB (shortcut.icon.<id>) → 快捷方式存引用
编辑时 → 复用已有引用或生成新引用
删除时 → 清理旧资产
渲染时 → 异步解析引用并显示
```

**音乐封面缓存：**
```
播放歌曲 → 异步缓存封面 (music.cover.<trackId>)
下次播放 → 优先读缓存，再用远程 URL
删除资产 → 自动清理旧封面
```

**新增工具函数：**
- `getShortcutIconAssetKey(id)` - 生成快捷图标资产 key
- `getShortcutIconAssetRef(id)` - 生成快捷图标资产引用
- `getMusicCoverAssetKey(track)` - 生成封面资产 key
- `getMusicCoverAssetRef(track)` - 生成封面资产引用
- `resolveShortcutIconSource(image)` - 解析快捷图标来源
- `persistShortcutIconAsset(id, image, prev)` - 持久化图标到资产库
- `cleanupShortcutIconAsset(image)` - 清理旧图标资产
- `resolveMusicCoverSource(track)` - 解析音乐封面来源
- `blobToDataUrl(blob)` - 转换 blob 为 dataURL
- `cacheMusicCoverAsset(track)` - 缓存音乐封面

**异步流程优化：**
- `openShortcutEditor()` 改为异步加载图标
- `selectPlaylistTrack()` 异步解析和缓存封面
- 保存/删除时异步清理旧资产
- 事件绑定用 `void` 处理异步返回

### 数据流图

```
user upload image
    ↓
persistShortcutIconAsset()
    ↓
writeAsset(key, dataUrl) → IndexedDB
    ↓
image field = assetRef(key)  // 存引用
    ↓
renderShortcuts()
    ↓
resolveShortcutIconSource() → readAssetByRef()
    ↓
display image
```

### 验证结果

✅ 全部编译检查通过，无错误
✅ 3 个文件都是 0 warning
✅ 快捷图标本地上传现在走 IndexedDB
✅ 音乐封面支持缓存
✅ 配置快照导入导出可带走资产包
✅ 内置壁纸仍保留在 `assets/wallpapers/`，不进浏览器存储

### 内置壁纸保留原则

```
内置壁纸 = 项目静态资源
上传壁纸 = IndexedDB background.original
快捷图标上传 = IndexedDB shortcut.icon.*
音乐封面缓存 = IndexedDB music.cover.*
```

### 后续可扩展方向

- [ ] 背景暗色模式（background.dark）实际使用场景
- [ ] 壁纸收藏功能（多个背景版本管理）
- [ ] "轻量导出"vs"完整导出"两种快照模式
- [ ] 资产清理 UI（查看 / 删除 IndexedDB 旧资产）
- [ ] 配置版本迁移机制（version 升级时自动处理）


