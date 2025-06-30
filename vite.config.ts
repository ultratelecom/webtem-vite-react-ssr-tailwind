import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
// import ssr from 'vite-plugin-ssr/plugin'  // Temporarily disabled for basic setup

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()], // SSR plugin temporarily removed
  server: {
    host: '0.0.0.0',
    port: 3000,
    open: true,
    strictPort: true,
    hmr: true,
  },
  clearScreen: false, // 👈 shows full error trace in terminal
})
