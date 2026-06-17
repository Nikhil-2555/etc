/* eslint-env node */
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
<<<<<<< HEAD
import mkcert from 'vite-plugin-mkcert'
=======
>>>>>>> ac794f6acd6f07d555238c252853f4601e063236
import path from "path"

// https://vitejs.dev/config/
export default defineConfig(({ command }) => {
  const config = {
<<<<<<< HEAD
    plugins: [react(), mkcert()],
=======
    plugins: [react()],
>>>>>>> ac794f6acd6f07d555238c252853f4601e063236
    resolve: {
      alias: {
        "@": path.resolve(process.cwd(), "./src"),
      },
    },
    build: {
      outDir: 'dist',
      sourcemap: false,
      // Chunk splitting for better caching
      rollupOptions: {
        output: {
          manualChunks: {
            vendor: ['react', 'react-dom', 'react-router-dom'],
            ui: ['framer-motion', 'lucide-react', 'recharts'],
          },
        },
      },
    },
  };

  // Only add dev server proxy and mkcert in development
  if (command === 'serve') {
    config.server = {
      port: 5100,
      proxy: {
        '/api': {
          target: 'http://127.0.0.1:5000',
          changeOrigin: true,
          secure: false,
        },
        '/socket.io': {
          target: 'http://127.0.0.1:5000',
          ws: true,
          changeOrigin: true,
          secure: false,
        }
      }
    };
  }

  return config;
})
