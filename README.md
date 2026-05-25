# Aemeath's Tab

Aemeath's Tab 是基于
[Redlnn/lemon-new-tab-page](https://github.com/Redlnn/lemon-new-tab-page)
二次开发的新标签页项目。它不是 Lemon New Tab 的官方版本，也不代表原作者立场。

项目保留上游 Vue 3 + WXT 浏览器扩展架构、设置体系、快捷方式、壁纸、搜索等核心能力，并加入 Aemeath 的玻璃视觉、碎花壁纸、飞行雪绒音乐、飞行雪绒小人、流星、点击爱心和飞行雪绒小人动效等个性化体验。

目标是把仓库收束成一个清爽、可回滚、可继续迭代的新标签页扩展：当前代码只维护新架构，不再保留旧版本运行时兼容层。

## Project Origin

本项目基于 `Redlnn/lemon-new-tab-page` 二次开发。上游项目提供了新标签页扩展的基础架构、设置系统、快捷方式、壁纸与搜索体验。

本项目在此基础上加入：

- Aemeath 视觉风格与动效层
- 默认壁纸、飞行雪绒 GIF、音乐入口和图标资源
- Cloudflare Pages 网页版构建目标
- 面向个人长期维护的开发工作流

## License And Credit

本项目保留上游项目的许可证与版权说明，仓库内 `LICENSE` 文件为准。

上游 README 提醒：涉及商标的图片资源不包含在 MIT 许可范围内。本项目同样按这个原则处理第三方品牌素材和新增个人素材。

特别鸣谢：

- [Redlnn/lemon-new-tab-page](https://github.com/Redlnn/lemon-new-tab-page)
- 青柠起始页
- Light Tab Page 轻标签页

## Development

本项目使用 Vue 3、TypeScript、Element Plus 和 WXT。

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

- `entrypoints/newtab/`: 新标签页主界面。
- `entrypoints/newtab/components/`: 页面组件与设置面板。
- `entrypoints/newtab/components/AemeathLayer.vue`: Aemeath 定制层，包含音乐、飞行雪绒、流星和点击爱心等效果。
- `entrypoints/newtab/styles/aemeath.scss`: Aemeath 玻璃视觉覆盖层。
- `shared/`: 设置、同步、快捷方式、主题、搜索等共享逻辑。
- `public/aemeath/`: Aemeath 壁纸、宠物、特效图片和图标资源。
- `web/cloudflare/`: Cloudflare Pages 网页版入口。
- `docs/`: 工作流、变更日志和项目说明文档。

## Aemeath Defaults

- 默认背景使用 `public/aemeath/wallpapers/default-config.png`。
- 音乐入口使用 Meting API 歌单。
- Dock 默认开启。
- 快捷方式优先使用用户自定义入口。
- 时钟、搜索框、快捷方式、Dock、设置弹窗和浮动控件统一使用 glass / acrylic 视觉。