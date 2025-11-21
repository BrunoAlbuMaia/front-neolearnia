import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from "path";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 5000,
    strictPort: true,
  },
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "src"),
      "@shared": path.resolve(import.meta.dirname, "shared"),
      "@assets": path.resolve(import.meta.dirname, "public"),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // Vendor chunks - bibliotecas grandes
          'vendor-react': ['react', 'react-dom'],
          'vendor-router': ['wouter'],
          'vendor-query': ['@tanstack/react-query'],
          'vendor-ui': [
            '@radix-ui/react-dialog',
            '@radix-ui/react-select',
            '@radix-ui/react-dropdown-menu',
            '@radix-ui/react-toast',
            '@radix-ui/react-tabs',
          ],
          'vendor-animation': ['framer-motion'],
          'vendor-charts': ['recharts'],
          // Feature chunks - agrupar por funcionalidade
          'feature-auth': [
            './src/components/Auth/AuthScreen',
            './src/components/Auth/LoginForm',
            './src/components/Auth/RegisterForm',
          ],
          'feature-study': [
            './src/components/StudyMode',
            './src/components/ReviewMode',
            './src/pages/Home/StudyPage',
            './src/pages/Home/QuizPage',
          ],
          'feature-analytics': [
            './src/components/AnalyticsPage',
            './src/pages/Home/AnalyticsPage',
          ],
        },
      },
    },
    // Otimizações adicionais
    chunkSizeWarningLimit: 1000,
    sourcemap: false, // Desabilitar em produção para reduzir tamanho
  },
})
