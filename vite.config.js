import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Basic Vite setup for a React app
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      "/api": {
        target: "http://127.0.0.1:5001",
        changeOrigin: true,
      },
    },
  },
});
