import { defineConfig } from "vite";
export default defineConfig({
  base: "./",
  build: {
    // The Three.js renderer is intentionally kept as one reusable engine chunk.
    chunkSizeWarningLimit: 700,
    rolldownOptions: {
      output: {
        codeSplitting: {
          groups: [
            { name: "three", test: /node_modules\/three/ },
            { name: "pdf", test: /node_modules\/pdfjs-dist/ },
            { name: "icons", test: /node_modules\/lucide/ },
          ],
        },
      },
    },
  },
});
