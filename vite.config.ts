import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// nome do repositório no GitHub Pages
const repoBase = "/cltfacil-com-78/";

export default defineConfig(({ mode }) => ({
  // em produção (Pages) servimos em /cltfacil-com-78/, em dev é /
  base: mode === "production" ? repoBase : "/",
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    mode === "development" && componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
