import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    allowedHosts: ['4090.kongfei.life'],
    // /editor 路由回退到 index.html
    historyApiFallback: true,
  }
})
