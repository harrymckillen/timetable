import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src')
    }
  },
  css: {
    postcss: './postcss.config.js'
  },
  build: {
    outDir: 'dist'
  },
  server: {
    proxy: {
      '/api': {
        target: 'https://justcors.com/l_1ve8kxkto7/api.irishrail.ie',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
        secure: true
      }
    }
  }
})
