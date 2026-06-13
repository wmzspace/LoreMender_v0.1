import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    allowedHosts: ['4090.kongfei.life'],
    // /editor 路由由 Vite 的 SPA 回退(appType:'spa' 默认行为)返回 index.html
  }
})
