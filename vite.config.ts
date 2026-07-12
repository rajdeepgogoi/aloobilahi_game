import { defineConfig } from 'vite';

export default defineConfig({
  base: './', // Ensures relative assets pathing for flexible hosting (like GitHub Pages or staging)
  server: {
    port: 3000,
    open: true // Automatically launches in browser when running dev server
  },
  build: {
    assetsInlineLimit: 0,
    chunkSizeWarningLimit: 1500
  }
});
