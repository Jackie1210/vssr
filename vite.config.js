const refresh = require('@vitejs/plugin-react-refresh')

module.exports = {
  plugins: [ refresh() ],
  esbuild: {
    jsxInject: `import React from 'react';`
  },
  build: {
    minify: false
  }
}
