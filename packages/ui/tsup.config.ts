import { defineConfig } from "tsup"

export default defineConfig({
  entry: [
    "src/index.ts",
    "src/components/*.tsx",
    "src/components/ai/*.tsx",
    "src/components/ai/index.ts",
    "src/lib/*.ts",
    "src/hooks/*.ts",
  ],
  format: ["esm"],
  dts: true,
  sourcemap: true,
  clean: true,
  treeshake: true,
  banner: {
    js: '"use client";',
  },
  external: [
    "react",
    "react-dom",
    "react-hook-form",
    "@tanstack/react-table",
    "@monaco-editor/react",
    "monaco-editor",
    "@tauri-apps/plugin-opener",
  ],
})

