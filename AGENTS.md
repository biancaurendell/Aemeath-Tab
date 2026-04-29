# Aemeath's Tab - 编码代理架构与规范指南 (AGENTS.md)

本项目是一个轻量、快速、纯原生构建（Vanilla JS + HTML + CSS）的新标签页/起始页项目。
当前主线采用“网页优先，扩展可包装”的双栈开发思路：先把它作为类似青柠标签页的网页版起始页稳定下来，后续再用浏览器扩展清单把同一套页面包装成新标签页扩展。

为了保持项目的极简特性并提升可维护性，本项目采用 **原生 ES Module 模块化** 架构，未引入任何重型编译框架（如 Vue / React / Webpack）。
请将此文件作为 AI 编码代理和后续开发者的最高准则。

## 1. 架构地图

项目使用原生浏览器特性 `type="module"` 进行文件拆分，入口为 `src/main.js`。

- `index.html`：全局唯一入口与 DOM 结构骨架。网页部署和未来扩展的新标签页都应复用此入口。
- `styles.css`：全局唯一 CSS 文件，负责像素风皮肤与响应式布局。
- `src/main.js`：模块组装与生命周期初始化；当前同时承载页面级交互（如时钟/农历渲染、搜索建议、设置面板事件绑定）。
- `src/state/`：数据层。负责 `localStorage` / `IndexedDB` 操作、默认设置、配置版本迁移逻辑。
- `src/modules/`：业务核心层。
  - `background.js`：背景大图加载与 IndexedDB 存储。
  - `effects.js`：Canvas 流星、点击爱心动效。
  - `music.js`：播放器核心与歌词解析（Meting API）。
  - `pet.js`：像素小角色的状态机（移动、拖拽交互）。
  - `shortcuts.js`：快捷入口管理。
- `src/ui/`：预留视图层目录（当前为空）。
- `assets/`：本地静态资源（图片、字体、Cursor）。
- `scripts/`：开发和验证脚本，例如本地静态服务器、视觉检查脚本。

## 2. 双栈边界

1. **网页优先**：默认开发目标是可通过 HTTP 静态服务器访问的网页版起始页，可部署到 Cloudflare Pages、GitHub Pages 或任意静态托管。
2. **不要依赖 `file://`**：由于原生 ES Module 在浏览器中需要 HTTP/HTTPS 上下文，双击 `index.html` 不能作为主要运行方式。请使用 `npm run dev` 或 `start-web.cmd` 启动本地静态服务器。
3. **扩展包装要薄**：未来扩展版本只负责声明 `chrome_url_overrides.newtab`、权限与必要的浏览器 API 适配；不要为了扩展形态复制一套业务代码。
4. **平台能力隔离**：若后续接入书签、同步、扩展存储等浏览器 API，必须放在独立适配层中，业务模块通过小接口调用，避免网页版本被扩展 API 绑死。

## 3. 编码约定 (Coding Conventions)

1. **绝对原生**：不使用任何需要 `npm build` 才能跑在浏览器的技术。支持原生的 `import/export` 语法。
2. **安全第一**：由于数据存储在用户的本地，必须保证文本文件使用 **UTF-8 without BOM**，防止乱码。
3. **DOM 分离**：各模块应在自己内部通过 `document.querySelector` 获取 DOM，尽可能减少模块间直接互相操作 DOM。
4. **CSS 变量化**：所有可动态设置的外观属性（如大小、透明度、位置），应通过向 `document.documentElement` 设置 CSS Variable 实现（例如 `--clock-opacity`）。

## 4. 高风险区域 (High-Risk Areas)

以下模块的修改容易导致严重问题，修改前必须全面检查：

- **`src/state/settings.js`**：
  如果新增、删除或重命名了配置项（Schema 变更），必须：
  1. 更新默认配置 `defaultConfig`。
  2. （按需）递增 `currentConfigVersion`。
  3. 同步更新 `mergeConfig()`、`readLegacySettings()`、`applyConfigToLegacyStorage()` 的字段映射，防止 `config` 与 legacy `localStorage` 键不一致。
  4. 若字段会进入导出/导入，还需检查 `buildConfigSnapshot()` 与 `importConfigSnapshot()` 的兼容性。
- **背景存储 (`src/modules/background.js` & `src/state/storage.js`)**：
  因为原图可能很大，背景图被存放在 IndexedDB 中而不是 `localStorage`。这里涉及异步事务操作，修改时必须注意 `Promise` 的异常处理与回滚。
- **DOM 动画与性能 (`src/modules/effects.js` & `src/modules/music.js`)**：
  为了降低浏览器性能开销，在播放音乐时我们有意降级或停止 Canvas 绘制频率。调整动画逻辑时，必须引入 `requestAnimationFrame` 以及性能模式的判断。

## 5. 提交与校验清单 (Checklist)

修改完毕后，请按以下步骤自我校验：

1. [ ] **网页启动验证**：运行 `npm run dev`，确认页面能通过本地 HTTP 地址访问，而不是依赖双击 `index.html`。
2. [ ] **脚本静态检查**：运行 `npm run check:js`，确认 `src/` 与 `scripts/` 的 ES Module 语法检查通过。
3. [ ] **冒烟验证**：运行 `npm run test:smoke`，确认设置面板、壁纸渲染、快捷方式保存/刷新恢复、配置导出/导入入口可用。
4. [ ] **发布目录验证（改动部署链路时）**：先执行 `npm run pages:build`，再执行 `npm run test:smoke:dist`，确认 `dist/` 可独立运行。
5. [ ] **双向验证**：修改功能后，检查该功能在主界面和设置面板（UI）的联动是否正常。
6. [ ] **导出/导入验证**：如果是新增了配置字段，确认修改后能够正常触发 `localStorage` 写入，且“导出配置”能正确包含新字段。
7. [ ] **刷新不变**：确认所有的动态状态在按下 F5 刷新后，依然能正确从持久化层（State）恢复。
