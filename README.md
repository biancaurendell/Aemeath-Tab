# Aemeath's Tab

Aemeath's Tab 是基于
[Redlnn/lemon-new-tab](https://github.com/Redlnn/lemon-new-tab)
二次开发的新标签页项目。它不是 Lemon New Tab 的官方版本，也不代表原作者立场。

项目保留上游 Vue 3 + WXT 浏览器扩展架构、设置体系、快捷方式、壁纸、搜索、书签与多语言等核心能力，并加入 Aemeath 的玻璃视觉、梦幻壁纸、音乐、飞行雪绒、流星、点击爱心、宠物动效和轻量效率工具。

目标是把仓库收束成一个清爽、可回滚、可继续迭代的新标签页扩展：当前代码只维护新架构，不再保留旧版本运行时兼容层。

## Highlights

- 玻璃新标签页：圆润 glass / acrylic 视觉覆盖搜索框、快捷方式、Dock、设置弹窗和浮动控件。
- 快速指挥中心：通过按钮或快捷键打开命令面板，快速聚焦搜索、打开今日面板、启动专注计时、进入设置、切换壁纸、切换搜索引擎、打开书签或新增快捷方式。
- 今日面板：记录当天重点、待办任务、简短笔记，并内置专注 / 休息计时器。
- Dock 与 Launchpad：支持固定快捷方式、浏览器常用网站、图标缩放、数量限制和全屏快速入口。
- Aemeath 音乐层：右上角音乐入口，支持 Meting 歌单、播放控制、歌词面板和歌单抽屉。
- Aemeath 动效层：飞行雪绒、流星背景、点击爱心和宠物 GIF，让新标签页更有个人感。
- 壁纸系统：支持默认 Aemeath 壁纸、Bing 每日图、本地图片 / 视频和在线图片源。
- 搜索体验：支持搜索建议、自定义搜索引擎和搜索引擎快速切换。
- 书签与快捷方式：可打开浏览器书签侧栏，管理自定义快捷方式，并保留上游常用网站能力。
- 多浏览器构建：支持 Chrome、Edge、Firefox 扩展构建，并额外保留 Cloudflare Pages 网页版构建目标。

## Project Origin

本项目基于 `Redlnn/lemon-new-tab` 二次开发。上游项目提供了新标签页扩展的基础架构、设置系统、快捷方式、壁纸、搜索、书签、同步与多语言体验。

本项目在此基础上加入：

- Aemeath 视觉风格与动效层
- 快速指挥中心与今日效率面板
- 默认壁纸、宠物 GIF、音乐入口和图标资源
- Cloudflare Pages 网页版构建目标
- 面向个人长期维护的新架构整理

## License And Credit

本项目保留上游项目的许可证与版权说明。当前仓库内 `LICENSE` 文件是本 fork 目前的许可证记录。

上游 README 说明：Lemon New Tab 自 v3.2.3 起采用 AGPL-3.0，之前版本采用 MIT；涉及商标的图片资源不包含在开源许可范围内。后续如果继续同步或移植上游代码，发布前需要重新核对本 fork 的实际基底版本与许可证文件。本项目同样按这个原则处理第三方品牌素材和新增个人素材。

特别鸣谢：

- [Redlnn/lemon-new-tab](https://github.com/Redlnn/lemon-new-tab)
- 青柠起始页
- Light Tab Page 轻标签页

## Development

本项目使用 Vue 3、TypeScript、Element Plus 和 WXT。

建议使用 Node.js 24+ 与 pnpm。

```bash
pnpm install
pnpm dev
```

`pnpm dev` 会启动 WXT 开发环境。生产构建输出到 `.output/chrome-mv3`。

## Build

```bash
pnpm run type-check
pnpm run build
```

构建完成后，可将以下目录作为“加载已解压的扩展程序”载入 Chrome 或 Edge：

```text
.output/chrome-mv3
```

Firefox:

```bash
pnpm run build:firefox
pnpm run zip:firefox
```

Cloudflare Pages 网页版：

```bash
pnpm run build:cloudflare
```

输出目录为：

```text
dist-cloudflare
```

## Directory Guide

- `entrypoints/background/index.ts`: 后台 Service Worker 与同步调度。
- `entrypoints/newtab/init.ts`: 新标签页启动初始化。
- `entrypoints/newtab/main.ts`: 新标签页 Vue 挂载入口。
- `entrypoints/newtab/`: 新标签页主界面。
- `entrypoints/newtab/components/QuickCommandCenter.vue`: 快速指挥中心。
- `entrypoints/newtab/components/DailyBoard.vue`: 今日面板、待办和专注计时器。
- `entrypoints/newtab/components/AemeathLayer.vue`: Aemeath 音乐、宠物、飞行雪绒、流星和点击爱心等定制层。
- `entrypoints/newtab/components/Shortcut/`: 快捷方式、Dock 和 Launchpad。
- `entrypoints/newtab/styles/aemeath.scss`: Aemeath 玻璃视觉覆盖层。
- `shared/`: 设置、同步、快捷方式、主题、搜索等共享逻辑。
- `shared/settings/`: 设置 Schema、默认值、启动检查和存储。
- `shared/sync/`: 浏览器云同步数据结构与前台 store。
- `shared/theme/`: 主题与动态配色逻辑。
- `locales/`: `newtab`、`settings`、`sync`、`faq` 等命名空间的多语言资源。
- `public/aemeath/`: Aemeath 壁纸、宠物、特效图片和图标资源。
- `web/cloudflare/`: Cloudflare Pages 网页版入口。
- `docs/`: 工作流、变更日志和项目说明文档。

## Aemeath Defaults

- 默认背景使用 `public/aemeath/wallpapers/default-config.png`。
- 音乐入口使用 Meting API 歌单。
- Dock 默认开启。
- 快捷方式优先使用用户自定义入口。
- 今日面板与快速指挥中心作为默认效率入口。
- 时钟、搜索框、快捷方式、Dock、设置弹窗和浮动控件统一使用 glass / acrylic 视觉。

## Current Git Baseline

当前主干分支为 `main`。旧历史已归档到备份分支和标签，日常开发以 `main` 为准。
