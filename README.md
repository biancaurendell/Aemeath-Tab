# Aemeath's Tab

一个纯原生的像素风起始页项目。当前主线按“网页版优先，扩展可包装”的方式开发：先稳定成类似青柠标签页的静态网页版，后续再把同一套页面包装成浏览器新标签页扩展。

## 本地运行

不要直接双击 `index.html`。项目使用原生 ES Module，浏览器在 `file://` 下会拦截模块导入。

```bash
npm run dev
```

Windows 下也可以双击 `start-web.cmd`，它会启动本地静态服务器并打开浏览器。

如果页面显示“无法访问此站点 / ERR_CONNECTION_REFUSED”，说明本地服务器没有启动或已经退出，重新运行 `npm run dev` 即可。

## 开发命令

```bash
npm run dev
npm run check:js
npm run test:visual
```

## 双栈方向

- 网页版：当前默认目标，可部署到 Cloudflare Pages、GitHub Pages 或任意静态托管。
- 扩展版：后续只添加很薄的扩展包装层，例如 `manifest.json` 和新标签页声明；核心业务继续复用 `index.html`、`styles.css`、`src/` 与 `assets/`。
- 平台能力：未来如果接入浏览器书签、同步或扩展存储，应放到独立适配层，避免网页版本和扩展 API 强绑定。

## Cloudflare 部署

### Pages

Cloudflare Pages 可以直接托管这个项目。推荐使用 `dist/` 作为发布目录，避免把开发脚本、说明文档和配置文件一起暴露成静态文件：

- Build command：`npm run pages:build`
- Build output directory：`dist`
- Root directory：仓库根目录
- Node.js version：任意当前 LTS 版本即可

`pages:build` 不会打包或编译业务代码，只会复制静态运行所需的 `index.html`、`styles.css`、`src/` 和 `assets/`。

如果使用 Cloudflare Pages 的“直接上传”模式，上传本地生成的 `dist/` 目录即可。

### Workers

当前 `wrangler.jsonc` / `wrangler.toml` 已配置静态资源目录：

```toml
[assets]
directory = "."
```

使用 Wrangler 部署：

```bash
npx wrangler deploy
```

注意：`index.html` 会加载 `src/main.js`，因此 `.wranglerignore` 不能排除 `src/`。
