import { defineConfig } from 'vite'
import refresh from '@vitejs/plugin-react-refresh'

export default defineConfig({
  plugins: [ refresh() ],
  build: {
    minify: false
  }
})
