import { defineConfig } from "tsup"

export default defineConfig({
  entry: [
    "src/index.ts",
    "src/components/*.tsx",
    "src/lib/*.ts",
    "src/hooks/*.ts",
  ],
  format: ["esm"],
  dts: true,
  sourcemap: true,
  clean: true,
  treeshake: true,
  external: [
    "react",
    "react-dom",
    "react-hook-form",
    "@tanstack/react-table",
    "codemirror",
    "@codemirror/autocomplete",
    "@codemirror/commands",
    "@codemirror/lang-cpp",
    "@codemirror/lang-html",
    "@codemirror/lang-javascript",
    "@codemirror/lang-json",
    "@codemirror/lang-markdown",
    "@codemirror/lang-rust",
    "@codemirror/language",
    "@codemirror/lint",
    "@codemirror/search",
    "@codemirror/state",
    "@codemirror/view",
    "@lezer/highlight",
    "@tauri-apps/plugin-opener",
  ],
})

