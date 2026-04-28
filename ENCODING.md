# Encoding And Text Safety

本项目所有文本文件统一使用 UTF-8 编码，避免中文、日文、符号和全角字符被错误解码后变成乱码。

## 强制规则

- `*.html`、`*.css`、`*.js`、`*.md`、`*.json` 必须保存为 UTF-8。
- 默认使用 UTF-8 without BOM。不要把文件另存为 ANSI、GBK、GB2312、Big5 或 UTF-16。
- 修改中文文案时，直接编辑原始中文，不要粘贴已经乱码的文本。
- 不要用 PowerShell 默认编码重写整份文件。优先使用 `apply_patch` 做局部修改。
- 如果必须脚本化重写文件，显式使用 UTF-8 without BOM。
- HTML 文件必须保留 `<meta charset="UTF-8" />`。
- 新增文档或配置时，文件开头不要加入 BOM，文件末尾保留一个换行。

## 修改前检查

读取中文文件时使用 UTF-8：

```powershell
Get-Content -Encoding UTF8 AGENTS.md
Get-Content -Encoding UTF8 index.html
```

修改后扫描常见乱码痕迹：

```powershell
rg -n --pcre2 "\x{FFFD}|\x{9352}|\x{6DC7}|\x{9366}|\x{9234}|\x{9239}|\x{95AB}|\x{68F0}|\x{935A}|\x{9351}|\x{9430}|\x{8133}" app.js index.html styles.css AGENTS.md
```

如果扫描命中，先判断是否是合法内容。若是中文文案乱码，必须恢复成正确中文后再继续。

## 安全写回示例

仅在确实需要整文件重写时使用：

```powershell
$utf8NoBom = New-Object System.Text.UTF8Encoding($false)
$path = Join-Path (Get-Location) "app.js"
$text = [System.IO.File]::ReadAllText($path)
[System.IO.File]::WriteAllText($path, $text, $utf8NoBom)
```

## 性能相关约定

- 不要为音乐频谱、歌词、背景装饰新增大量逐帧 DOM 写入。
- 避免在播放音乐时同时启用全屏 canvas 动画和 `requestAnimationFrame` DOM 更新。
- 若需要视觉动效，优先使用 CSS `transform` / `opacity` 动画或低频更新；不要在每帧改写大量 DOM 节点的样式。
