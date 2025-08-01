import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { nodePolyfills } from 'vite-plugin-node-polyfills'
import { resolve } from 'path'
import { copyFileSync, existsSync, mkdirSync } from 'fs'

export default defineConfig({
  plugins: [
    react({
      include: "**/*.{jsx,js}",
    }),
    nodePolyfills({
      include: ['buffer', 'crypto', 'stream', 'url', 'util'],
      globals: {
        Buffer: true,
        global: true,
        process: true,
      },
    }),
    {
      name: 'copy-files',
      writeBundle() {
        const outputDir = 'dist'
        if (!existsSync(outputDir)) {
          mkdirSync(outputDir, { recursive: true })
        }
        
        copyFileSync('src/manifest.json', `${outputDir}/manifest.json`)
        copyFileSync('src/assets/flow-logo.png', `${outputDir}/flow-logo.png`)
      }
    }
  ],
  build: {
    outDir: 'dist',
    emptyOutDir: false,
    rollupOptions: {
      input: {
        popup: resolve(__dirname, 'src/index.html'),
        background: resolve(__dirname, 'src/background.js'),
        content: resolve(__dirname, 'src/content.js'),
        script: resolve(__dirname, 'src/script.js'),
        eip6963: resolve(__dirname, 'src/eip6963.js'),
      },
      output: {
        entryFileNames: '[name].js',
        chunkFileNames: 'chunks/[name].[hash].js',
        assetFileNames: 'assets/[name].[ext]'
      }
    },
    target: 'es2017',
    minify: process.env.NODE_ENV === 'production',
  },
  base: './',
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
  define: {
    global: 'globalThis',
  },
  esbuild: {
    loader: 'jsx',
    include: /src\/.*\.[jt]sx?$/,
    exclude: [],
  },
})