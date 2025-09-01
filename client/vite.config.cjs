const { defineConfig } = require('vite')
const react = require('@vitejs/plugin-react')

// https://vitejs.dev/config/
module.exports = defineConfig({
  plugins: [
    react({
      include: /\.(jsx|js)$/, // Process both .js and .jsx files
    }),
  ],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
    },
  },
  esbuild: {
    loader: 'jsx', // Use jsx loader for .js files
    include: /src\/.*\.jsx?$/, // Include both .js and .jsx files
    exclude: [],
  },
  optimizeDeps: {
    esbuildOptions: {
      loader: {
        '.js': 'jsx', // Treat .js files as JSX
      },
    },
  },
})