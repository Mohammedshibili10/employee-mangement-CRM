import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Basic Vite setup for a React app
export default defineConfig({
  plugins: [react()],
  // Send any request starting with /api to the backend running on port 5000.
  // This lets the frontend use relative URLs like axios.post("/api/auth/login").
  server: {
    proxy: {
      "/api": "http://localhost:5000",
    },
  },
});
