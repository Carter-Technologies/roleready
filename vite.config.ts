import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { apiDevPlugin } from "./vite-plugin-api-dev";

export default defineConfig(({ mode }) => ({
  plugins: [react(), tailwindcss(), mode === "development" ? apiDevPlugin() : undefined],
}));
