import { defineConfig } from "vite";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  base: "/leetcode-company-wise-problems-web-ui/",
  plugins: [tailwindcss()],
});
