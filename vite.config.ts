import { defineConfig } from 'vite'
import path from 'path'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'


function figmaAssetResolver() {
  return {
    name: 'figma-asset-resolver',
    resolveId(id) {
      if (id.startsWith('figma:asset/')) {
        const filename = id.replace('figma:asset/', '')
        return path.resolve(__dirname, 'src/assets', filename)
      }
    },
  }
}

export default defineConfig({
  plugins: [
    figmaAssetResolver(),
    // The React and Tailwind plugins are both required for Make, even if
    // Tailwind is not being actively used – do not remove them
    react(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      // Alias @ to the src directory
      '@': path.resolve(__dirname, './src'),
    },
  },

  // File types to support raw imports. Never add .css, .tsx, or .ts files to this.
  assetsInclude: ['**/*.svg', '**/*.csv'],

  // ── Dev server proxy ──────────────────────────────────────────────────────
  // All /api/** requests are forwarded to the Spring Boot backend so that:
  //   1. No CORS preflight issues during local development
  //   2. Session cookies are sent with the correct domain (localhost)
  //
  // For production, configure your reverse proxy (Nginx / Caddy / Cloud Load
  // Balancer) to forward /api/** to the backend container instead.
  //
  // To change the backend port, update the `target` value below or set the
  // VITE_API_URL environment variable (update this block accordingly).
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        // Forward session cookies so Spring Session auth works
        // No rewrite needed — /api prefix is preserved as-is on the backend
      },
    },
  },
})
