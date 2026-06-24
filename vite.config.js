import { defineConfig } from 'vite';
import react       from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],

  build: {
    target: 'es2020',
    assetsInlineLimit: 4096,
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
        passes: 2,
        pure_funcs: ['console.log', 'console.info', 'console.debug', 'console.warn'],
      },
    },
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes('node_modules')) return;

          // Motion AVANT le test /react/ car node_modules/motion/react/... contient /react/
          if (id.includes('/motion/') || id.includes('framer-motion')) {
            return 'vendor-motion';
          }

          // React core — volontairement séparé de React-Router
          if (
            id.includes('/react/') ||
            id.includes('/react-dom/') ||
            id.includes('/scheduler/')
          ) {
            return 'vendor-react';
          }

          // React-Router dans son propre chunk (chargé en parallèle, non bloquant)
          if (id.includes('react-router') || id.includes('@remix-run/router')) {
            return 'vendor-router';
          }

          if (id.includes('@supabase/')) {
            return 'vendor-supabase';
          }

          if (id.includes('lucide-react')) {
            return 'vendor-lucide';
          }

          // DOMPurify déjà dans son chunk automatique
          if (id.includes('dompurify') || id.includes('isomorphic-dompurify')) {
            return 'vendor-dompurify';
          }
        },
      },
    },
  },
});
