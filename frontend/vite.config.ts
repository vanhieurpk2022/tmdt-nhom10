import react, { reactCompilerPreset } from '@vitejs/plugin-react'
import babel from '@rolldown/plugin-babel'
import { defineConfig, loadEnv } from 'vite'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  return {
    plugins: [
      react(),
      babel({ presets: [reactCompilerPreset()] })
    ],
    server: {
      host: '::',
      port: 5173,
      strictPort: true,
      allowedHosts: env.FRONTEND_TUNNEL_HOST ? [env.FRONTEND_TUNNEL_HOST] : [],
      proxy: {
        '/api': {
          target: env.BACKEND_PROXY_TARGET || 'http://localhost:8080',
          changeOrigin: true,
          secure: false,
          rewrite: (path) => path.replace(/^\/api/, ''),
        }
      }
    }
  }
})
