import { defineConfig } from "vite";
import viteReact from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  resolve: {
    tsconfigPaths: true,
  },
  build: {
    chunkSizeWarningLimit: 1000,
  },
  plugins: [
    viteReact(),
    tailwindcss(),
  ],
});
