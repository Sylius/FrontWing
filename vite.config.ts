import { reactRouter } from "@react-router/dev/vite";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [
    reactRouter(),
    tsconfigPaths(),
  ],
  resolve: {
    alias: {
      "@tabler/icons-react": "@tabler/icons-react/dist/esm/icons/index.mjs",
    },
  },
  optimizeDeps: {
    include: ['yet-another-react-lightbox'],
  },
  build: {
    rollupOptions: {
      external: ['yet-another/react-lightbox/styles.css'],
    },
  },
});
