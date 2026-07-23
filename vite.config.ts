import { reactRouter } from "@react-router/dev/vite";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [
    reactRouter(),
  ],
  resolve: {
    tsconfigPaths: true,
    alias: {
      "@tabler/icons-react": "@tabler/icons-react/dist/esm/icons/index.mjs",
    },
  },
  optimizeDeps: {
    include: ['yet-another-react-lightbox'],
  },
});
