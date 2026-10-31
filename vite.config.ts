import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  base: './',
  define: {
    __VUE_OPTIONS_API__: 'false',
    __VUE_PROD_DEVTOOLS__: 'false',
    __VUE_PROD_HYDRATION_MISMATCH_DETAILS__: 'false',
  },
  resolve: {
    alias: {
      vue: 'vue/dist/vue.esm-bundler.js',
    },
  },
  plugins: [
    VitePWA({
      // New builds activate immediately and the page reloads itself.
      registerType: 'autoUpdate',
      // Registration is done manually in src/main.ts via virtual:pwa-register.
      injectRegister: false,
      manifest: {
        name: 'Lalovići',
        short_name: 'Lalovići',
        start_url: './',
        scope: './',
        display: 'standalone',
        background_color: '#f8f9fb',
        theme_color: '#f8f9fb',
        orientation: 'portrait',
        icons: [
          { src: 'icons/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icons/icon-512.png', sizes: '512x512', type: 'image/png' },
          {
            src: 'icons/icon-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable',
          },
        ],
      },
      workbox: {
        // Precache the whole build (HTML, hashed JS/CSS, icons, manifest) on
        // install, so the app opens with no network connection.
        globPatterns: ['**/*.{html,js,css,png,svg,ico,webmanifest}'],
        navigateFallback: 'index.html',
        cleanupOutdatedCaches: true,
      },
    }),
  ],
  build: {
    outDir: 'dist',
  },
});
