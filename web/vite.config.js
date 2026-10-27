import { defineConfig } from "vite";
import { fileURLToPath } from "node:url";
import companiesData from "./plugins/companies-data.js";

export default defineConfig({
  // Relative base so the build works on GitHub Pages or any sub-path.
  base: "./",
  plugins: [
    companiesData({
      root: fileURLToPath(new URL("..", import.meta.url)),
    }),
  ],
});
