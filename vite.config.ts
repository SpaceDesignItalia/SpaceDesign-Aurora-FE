import path from "path";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    outDir: "dist", // Assicurati che l'output vada nella cartella dist
    emptyOutDir: true, // Pulisce la cartella dist prima della build
    minify: true, // Abilita la minificazione
  },
});
