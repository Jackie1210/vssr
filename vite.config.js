import { defineConfig } from 'vite'
import refresh from '@vitejs/plugin-react-refresh'

export default defineConfig({
  plugins: [ refresh() ],
  esbuild: {
    jsxInject: `import React from 'react';`
  },
  build: {
    minify: false
  }
})
