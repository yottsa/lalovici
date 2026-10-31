/// <reference types="vitest/config" />
import { defineConfig, loadEnv } from 'vite';
import vue from '@vitejs/plugin-vue';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig(({ mode }) => {
  // Fail the build on a malformed end date instead of shipping a "NaN" countdown.
  const { VITE_END_DATE } = loadEnv(mode, process.cwd(), 'VITE_');
  if (VITE_END_DATE && Number.isNaN(Date.parse(VITE_END_DATE))) {
    throw new Error(
      `VITE_END_DATE is not a valid date: "${VITE_END_DATE}". Use ISO 8601, e.g. 2026-03-31T12:00:00+02:00.`,
    );
  }

  return {
    base: './',
    define: {
      __VUE_OPTIONS_API__: 'false',
      __VUE_PROD_DEVTOOLS__: 'false',
      __VUE_PROD_HYDRATION_MISMATCH_DETAILS__: 'false',
    },
    plugins: [
      vue(),
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
    test: {
      include: ['src/**/*.test.ts'],
    },
  };
});
