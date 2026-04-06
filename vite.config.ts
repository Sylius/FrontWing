import { defineConfig } from "vite";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import basicSsl from "@vitejs/plugin-basic-ssl";
import fs from "fs";

const certKey = "/certs/localhost-key.pem";
const certCrt = "/certs/localhost.pem";
const hasMkcert = fs.existsSync(certKey) && fs.existsSync(certCrt);

export default defineConfig({
  plugins: [tailwindcss(), react(), ...(hasMkcert ? [] : [basicSsl()])],
  ...(hasMkcert && {
    server: {
      https: {
        key: fs.readFileSync(certKey),
        cert: fs.readFileSync(certCrt),
      },
    },
  }),
  resolve: {
    alias: {
      "@tabler/icons-react": "@tabler/icons-react/dist/esm/icons/index.mjs",
      "@": "/src",
    },
  },
});
