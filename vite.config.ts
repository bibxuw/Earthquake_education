import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  // 将 '你的仓库名' 替换为你 GitHub 仓库的真实名称（例如 'earthquake-game'）
  base: process.env.NODE_ENV === 'production' ? '/Earthquake_education/' : '/'
})