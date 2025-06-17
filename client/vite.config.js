import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { TanStackRouterVite } from "@tanstack/router-plugin/vite";

// https://vite.dev/config/
export default defineConfig(({ mode }) => ({
  plugins: [
    TanStackRouterVite({ target: "react", autoCodeSplitting: true }),
    react(),
  ],
  publicDir: "../public",
  mode: process.env.NODE_ENV === "production" ? "production" : "development",
  define: {
    "import.meta.env.PROD": process.env.NODE_ENV === "production",
  },
}));
