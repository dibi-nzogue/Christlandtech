import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
 // ✅ IMPORTANT pour que /a-propos, /produits, etc. chargent bien les assets
  plugins: [
    react({
      babel: {
        plugins: [["babel-plugin-react-compiler"]],
      },
    }),
  ],
});
