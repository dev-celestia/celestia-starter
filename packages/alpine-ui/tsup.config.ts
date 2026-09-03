import { defineConfig } from "tsup"

export default defineConfig({
  entry: ["src/index.ts", "src/plugin.ts", "src/components/*.ts", "src/lib/*.ts"],
  format: ["esm"],
  dts: true,
  clean: true,
  sourcemap: true,
  minify: false,
  splitting: false,
  external: ["alpinejs"],
})
