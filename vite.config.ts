// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { componentTagger } from "lovable-tagger";

// __dirname em ESM
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Base pública:
// - No Lovable (ou qualquer hospedagem em domínio raiz): deixe SEM variável (default "/")
// - No GitHub Pages (repo cltfacil-com-78): defina VITE_BASE_PATH="/cltfacil-com-78/"
const PUBLIC_BASE = process.env.VITE_BASE_PATH ?? "/";

export default defineConfig(({ mode }) => ({
  base: PUBLIC_BASE,
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
