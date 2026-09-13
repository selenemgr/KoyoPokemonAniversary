import { defineConfig } from "vite";

export default defineConfig({
  root: ".",
  // relative base so the build works from a GitHub Pages project subpath
  // (username.github.io/repo-name/) as well as from the domain root
  base: "./",
  server: {
    port: 5173
  },
  build: {
    outDir: "dist"
  }
});
