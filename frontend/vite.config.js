import { fileURLToPath, URL } from "node:url";
import { defineConfig, splitVendorChunkPlugin } from "vite";
import vue from "@vitejs/plugin-vue";

import Components from "unplugin-vue-components/vite";
import { ElementPlusResolver } from "unplugin-vue-components/resolvers";
import { visualizer } from "rollup-plugin-visualizer";

import dns from "dns";

dns.setDefaultResultOrder("verbatim");

export default defineConfig({
  define: {
    "import.meta.env": process.env,
  },

  envPrefix: "VUE_APP",

  build: {
    sourcemap: false,
  },
  plugins: [
    vue(),
    splitVendorChunkPlugin(),
    Components({
      extensions: ["vue"],
      include: [/\.vue$/, /\.vue\?vue/],
      resolvers: [
        ElementPlusResolver({
          importStyle: "sass",
        }),
      ],
      dts: "components.d.ts",
    }),
    visualizer({
      template: "treemap",
      open: false,
      gzipSize: true,
      brotliSize: true,
      filename: "analyse.html",
    }),
  ],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
      "~": fileURLToPath(new URL("./node_modules", import.meta.url)),
    },
  },
  server: {
    proxy: {
      "/api": {
        target: process.env.BACKEND_URL || "http://localhost:8080",
        rewrite: (path) => path.replace(/^\/api/, ""),
      },
    },
    port: 8081,
    host: true,
  },
});
