import { copyFile, rm, stat } from 'node:fs/promises'
import { join } from 'node:path'

const distDir = 'dist-cloudflare-worker'
const wallpaperPath = join(distDir, 'aemeath', 'wallpapers', 'default-config.png')
const wallpaperAliasPath = join(distDir, 'aemeath_wallpapers_default-config.png')
const redirectsPath = join(distDir, '_redirects')

await stat(wallpaperPath)
await copyFile(wallpaperPath, wallpaperAliasPath)
await rm(redirectsPath, { force: true })

console.log(`Patched Cloudflare Worker assets in ${distDir}`)
