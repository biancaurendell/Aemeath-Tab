# lemon-new-tab UI 设计风格与迁移方案

本文记录 `Redlnn/lemon-new-tab` 的 UI 设计语言，并说明如何把它的高级感迁移到当前像素新标签页项目中。源码参考副本已放在本项目目录：

- `lemon-new-tab/`
- 已排除 `.git`
- 重点参考文件：
  - `lemon-new-tab/entrypoints/newtab/styles/search.scss`
  - `lemon-new-tab/entrypoints/newtab/styles/shortcut.scss`
  - `lemon-new-tab/entrypoints/newtab/styles/mixins/acrylic.scss`
  - `lemon-new-tab/preview/1.webp` 到 `preview/6.webp`

## 1. 整体视觉关键词

lemon-new-tab 的 UI 不是靠复杂装饰取胜，而是靠“背景图 + 大面积高斯模糊 + 半透明控件 + 轻交互动效”形成高级感。

核心关键词：

- 全屏沉浸壁纸
- 背景整体柔化或局部高斯模糊
- 毛玻璃控件
- 半透明深色浮层
- 圆形图标容器
- 搜索框聚焦扩展
- 图标 hover 轻微亮起
- Dock / Launchpad 式快捷入口
- 设置入口弱化到角落
- 内容居中，界面元素少而精

它的主界面像“壁纸上的一层轻 UI”，而不是一个传统网页。搜索框、快捷图标、Dock、设置按钮都像浮在背景上的玻璃控件。

## 2. 毛玻璃与高斯模糊

### 2.1 背景模糊

截图里的高级感很大一部分来自背景图被柔化：人物和色块仍可辨认，但细节被模糊掉，前景 UI 更清楚。

视觉效果：

- 背景铺满全屏。
- 可以根据状态切换清晰/模糊。
- 搜索聚焦时背景更模糊，形成“进入搜索模式”的沉浸感。
- 模糊不是纯遮罩，而是 `filter: blur(...)` 或覆盖层 `backdrop-filter` 的组合。

当前项目迁移建议：

- 保留当前像素壁纸和粉色雾气气质。
- 增加一个“背景模糊强度”设置，范围如 `0-18px`。
- 搜索框聚焦时，可以临时提高模糊 2-6px。
- 不要默认强模糊，否则会压掉当前像素壁纸细节。

建议 CSS 方向：

```css
.custom-background {
  filter: blur(var(--page-bg-blur, 0px)) saturate(1.08) brightness(0.92);
  transform: scale(calc(1 + var(--page-bg-blur-scale, 0.02)));
}

html.search-focused .custom-background {
  filter: blur(calc(var(--page-bg-blur, 0px) + 4px)) saturate(1.12) brightness(0.88);
}
```

注意：背景模糊需要轻微 `scale`，否则边缘会露白。

### 2.2 控件毛玻璃

lemon-new-tab 的 `acrylic.scss` 里核心是：

```scss
backdrop-filter: blur(...) saturate(...) brightness(...);
```

它把控件做成“透过背景的玻璃片”，而不是普通实色卡片。

当前项目迁移建议：

- 搜索框、快捷图标、底部 Dock、设置按钮、设置抽屉都可以使用同一套 glass token。
- 颜色保持暗粉紫，不要换成 lemon 的中性色。
- 毛玻璃要配合边框和阴影，否则会显得糊。

建议建立统一变量：

```css
:root {
  --glass-bg: rgba(36, 28, 58, 0.46);
  --glass-bg-hover: rgba(44, 35, 72, 0.34);
  --glass-bg-focus: rgba(24, 19, 42, 0.62);
  --glass-border: rgba(255, 226, 250, 0.22);
  --glass-blur: 14px;
  --glass-shadow: 0 18px 38px rgba(25, 16, 58, 0.34);
}

.glass {
  border: 1px solid var(--glass-border);
  background: var(--glass-bg);
  backdrop-filter: blur(var(--glass-blur)) saturate(1.35) brightness(1.08);
  box-shadow: var(--glass-shadow);
}
```

## 3. 搜索框设计

lemon-new-tab 的搜索框高级感来自几个细节：

- 默认较短、很克制。
- hover 或 focus 时横向展开。
- 左侧搜索引擎图标是圆形按钮。
- 右侧搜索按钮也是圆形/图标按钮。
- 输入框居中，placeholder 很轻。
- 背景半透明，hover/focus 透明度变化。
- 过渡曲线偏柔和，不是机械线性。

源码中搜索框使用：

- `--height`
- `--width`
- `border-radius: var(--height)`
- hover/focus 改变 `--width`
- 背景透明度随状态变化
- 图标按钮 hover 时改变背景

当前项目迁移建议：

### 3.1 搜索框形态

当前搜索框已经有像素梦幻感，可以调整为更接近截图：

- 高度从当前较厚的像素搜索条，改为更扁、更胶囊。
- 默认宽度约 `300px-420px`。
- focus/hover 宽度扩展到 `520px-640px`。
- 搜索框背景改成深色毛玻璃，而不是偏亮紫渐变。
- 搜索图标和引擎图标保持圆形按钮。

建议效果：

```css
.search-bar {
  --search-width: 360px;
  width: var(--search-width);
  min-height: 48px;
  border-radius: 999px;
  background: rgba(24, 20, 34, 0.58);
  backdrop-filter: blur(16px) saturate(1.35);
  transition:
    width 180ms cubic-bezier(0.65, 0.05, 0.1, 1),
    background-color 160ms ease,
    box-shadow 160ms ease;
}

.search-bar:hover,
.search-bar:focus-within {
  --search-width: 560px;
  background: rgba(24, 20, 34, 0.72);
}
```

### 3.2 搜索交互

建议保留当前已经实现的：

- 搜索建议
- 搜索历史
- 自定义搜索引擎
- 键盘上下选择

再补充 lemon 风格细节：

- 聚焦搜索框时隐藏或淡化快捷入口。
- 聚焦时背景加强模糊。
- 搜索建议框也做毛玻璃，不要使用实色菜单。
- 搜索引擎下拉采用浮层式玻璃菜单。
- 远程建议失败时静默保留历史建议。

## 4. 快捷图标设计

截图里的图标非常关键：它不是普通大方块，而是“圆形/圆角玻璃底座 + 小图标 + hover 提亮”。

lemon-new-tab 快捷图标特点：

- 图标容器多为圆形或小圆角。
- 半透明深色背景。
- 可启用 blur。
- hover 时背景变亮，像玻璃被点亮。
- 标题很小，颜色克制。
- 支持分页、Dock、Launchpad。
- Dock 底部是一条半透明玻璃托盘。

当前项目迁移建议：

### 4.1 主快捷入口

当前项目已经做了分页和拖拽排序。下一步可以让图标更像 lemon：

- 图标底座从彩色渐变块改为半透明玻璃圆角块。
- 上传图标/站点图标本身居中显示。
- 文字图标可以保留彩色背景，作为没有图标时的 fallback。
- hover 时图标底座亮一点、上浮 2px。
- 页面切换时增加轻微滑动或淡入，不要硬切。

建议视觉：

```css
.shortcut-icon {
  border-radius: 18px;
  background: rgba(20, 18, 32, 0.54);
  backdrop-filter: blur(14px) saturate(1.3);
  border: 1px solid rgba(255, 255, 255, 0.16);
  box-shadow: 0 10px 26px rgba(20, 16, 48, 0.28);
  transition:
    transform 160ms ease,
    background-color 160ms ease,
    box-shadow 160ms ease;
}

.shortcut:hover .shortcut-icon {
  transform: translateY(-2px);
  background: rgba(42, 35, 62, 0.48);
}
```

### 4.2 底部 Dock

用户截图里底部 Dock 是 lemon-new-tab 很有辨识度的部分：一条水平玻璃托盘，里面是紧凑图标。

当前项目已有音乐窗口和底部云层，迁移时要避免拥挤：

- Dock 放在底部居中，略高于屏幕底边。
- 当音乐播放器展开时，Dock 可自动上移或保持居中但留出右下角空间。
- Dock 默认只显示主要快捷图标，不一定等同于主快捷入口全部图标。
- 可以先做“Dock 模式开关”，再决定是否替代原快捷入口。

建议结构：

```html
<div class="shortcut-dock">
  <a class="dock-icon">...</a>
</div>
```

建议视觉：

```css
.shortcut-dock {
  position: fixed;
  left: 50%;
  bottom: 24px;
  display: flex;
  gap: 8px;
  padding: 8px;
  border-radius: 18px;
  background: rgba(24, 20, 34, 0.42);
  backdrop-filter: blur(18px) saturate(1.35);
  transform: translateX(-50%);
}
```

## 5. 设置面板设计

lemon-new-tab 的设置页接近 macOS/Element Plus 风格：

- 分类清楚。
- 左侧菜单，右侧详情。
- 设置项横向排列，文字解释较短。
- 透明、模糊、阴影、性能等开关被显式化。
- 页面有“工具感”，但不压迫。

当前项目已经做了设置分组，可以继续往 lemon 的方向微调：

- 分组标题更克制，减少大面积卡片感。
- 每项设置保持一行优先，说明文字尽量短。
- 抽屉背景改成更玻璃：降低实色紫色背景，提高 `backdrop-filter`。
- 输入框和按钮用同一套 glass token。
- 设置页内部不要过多强渐变，避免和主页壁纸抢视觉。

迁移原则：

- lemon 的结构可以借鉴。
- lemon 的中性灰配色不要直接照搬。
- 当前项目主色仍保留暗粉、紫、蓝光。

## 6. 动效语言

lemon-new-tab 的动效不是炫技，而是“状态反馈”：

- 搜索框 hover/focus 展开。
- 图标 hover 提亮。
- 分页横向滑动。
- 设置弹窗轻量淡入。
- 背景切换平滑过渡。
- 性能设置允许关闭这些效果。

当前项目迁移建议：

- 搜索框：宽度变化 + 背景模糊增强。
- 快捷图标：hover 上浮 + 玻璃底变亮。
- 分页：从硬切换改成横向 slide。
- 设置抽屉：保留右侧抽屉，但背景改玻璃化。
- 背景图：切换时淡入，搜索聚焦时模糊过渡。

动效时长建议：

- hover：120-180ms
- 搜索框展开：180-240ms
- 分页切换：220-280ms
- 背景模糊：200-320ms

## 7. 如何迁移到当前项目

建议分 4 步做，不要一次性改完整套 UI。

### 第一阶段：建立 glass 视觉系统

新增统一 CSS 变量：

- `--glass-bg`
- `--glass-bg-hover`
- `--glass-bg-focus`
- `--glass-border`
- `--glass-blur`
- `--glass-shadow`
- `--glass-radius-pill`
- `--glass-radius-icon`

把这些用于：

- 搜索框
- 搜索建议
- 搜索引擎下拉
- 快捷图标
- 设置按钮
- 设置抽屉

### 第二阶段：改搜索框高级感

优先改搜索框，因为它是主页视觉中心。

要做：

- 胶囊形态。
- 默认较短，hover/focus 展开。
- 毛玻璃背景。
- 左右图标圆形按钮。
- focus 时背景模糊增强。
- 建议面板改成玻璃浮层。

当前项目注意：

- 保留搜索引擎下拉。
- 保留搜索历史和自定义搜索引擎。
- 不要让搜索框过亮，避免破坏暗粉像素氛围。

### 第三阶段：改快捷图标与 Dock

要做：

- 快捷图标改玻璃底座。
- hover 提亮/上浮。
- 分页点改为更细小的 lemon 风格。
- 增加可选底部 Dock。

当前项目注意：

- 原本的彩色文字图标不要完全删，可作为 fallback。
- Dock 不要和音乐播放器冲突。
- 底部云层显示时，Dock 要有足够对比。

### 第四阶段：设置面板玻璃化

要做：

- 右侧抽屉背景从厚重紫色改为玻璃紫黑。
- 设置项减少强边框，改为轻边框 + 背景透出。
- 分组导航继续保留。
- 性能设置继续显式化。

当前项目注意：

- 设置文字必须保持清晰。
- blur 过强会导致中文说明可读性下降。
- 可以提供“透明/模糊强度”性能开关。

## 8. 当前项目应该保留的差异

不要把当前项目完全改成 lemon-new-tab。当前项目的特色是：

- 像素风背景装饰。
- 柔粉发光时间。
- 小角色。
- 音乐播放器。
- 动态歌词。
- 蓝色爱心点击特效。
- 暗粉蒙尘氛围。

因此迁移方向应该是：

- 用 lemon 的毛玻璃和交互高级感增强控件。
- 保留当前的像素梦幻主题。
- 不把整体变成极简灰色工具页。
- 不删除音乐和小角色这些差异化功能。

## 9. 推荐目标效果

最终目标可以描述为：

> 一个像素梦境风的新标签页，背景和氛围仍然是暗粉、发光、音乐与小角色；控件层则吸收 lemon-new-tab 的毛玻璃、高斯模糊、搜索框展开、图标玻璃底座和 Dock 高级感。整体看起来更轻、更透、更现代，但仍然是当前项目自己的风格。

## 10. 优先级清单

建议优先实现：

1. 搜索框毛玻璃胶囊化。
2. 搜索框 hover/focus 展开。
3. 搜索聚焦时背景轻微高斯模糊。
4. 快捷图标玻璃底座和 hover 上浮。
5. 搜索建议、引擎下拉玻璃化。
6. 设置抽屉玻璃化。
7. 可选底部 Dock。
8. 背景模糊强度设置。
9. 低功耗下自动降低 blur/动画强度。

这样改动最容易先看到“高级感”，同时不会破坏当前项目已经做好的功能。
