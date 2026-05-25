import { fileURLToPath, URL } from 'node:url'

import Vue from '@vitejs/plugin-vue'
import AutoImport from 'unplugin-auto-import/vite'
import Icons from 'unplugin-icons/vite'
import { defineConfig } from 'vite'
import svgLoader from 'vite-svg-loader'

export default defineConfig({
  plugins: [
    Vue(),
    svgLoader(),
    Icons({ compiler: 'vue3' }),
    AutoImport({
      include: [/\.[tj]sx?$/, /\.vue$/, /\.vue\?vue/, /\.vue\.[tj]sx?\?vue/],
      imports: ['vue'],
      viteOptimizeDeps: true,
      dts: false,
    }),
  ],
  root: fileURLToPath(new URL('./web/cloudflare', import.meta.url)),
  publicDir: fileURLToPath(new URL('./public', import.meta.url)),
  build: {
    outDir: fileURLToPath(new URL('./dist-cloudflare', import.meta.url)),
    emptyOutDir: true,
    sourcemap: false,
    chunkSizeWarningLimit: 2000,
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./', import.meta.url)),
      '@newtab': fileURLToPath(new URL('./entrypoints/newtab', import.meta.url)),
      '@cloudflare': fileURLToPath(new URL('./web/cloudflare', import.meta.url)),
    },
  },
  css: {
    preprocessorOptions: {
      scss: {
        additionalData: `@use "@/assets/styles/element/index.scss" as *;`,
      },
    },
  },
})
