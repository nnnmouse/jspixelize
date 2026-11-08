import { defineConfig } from "vite";

export default defineConfig({
  base: "/jspixelize/",
  build: {
    outDir: "dist",
    emptyOutDir: true,
    target: "esnext",
    minify: "oxc",
  },
});
