const { getDefaultConfig } = require("expo/metro-config")
const path = require("path")

const projectRoot = __dirname
const monorepoRoot = path.resolve(projectRoot, "../..")

const config = getDefaultConfig(projectRoot)

// 1. Watch all files within the monorepo root (including packages/mobile)
config.watchFolders = [monorepoRoot]

// 2. Let Metro resolve packages from both project and monorepo root node_modules
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, "node_modules"),
  path.resolve(monorepoRoot, "node_modules"),
]

// 3. CanvasKit ships as a `.wasm` binary, and Metro's default `assetExts` has
//    no entry for it. Without this the asset import in `src/skia-web.web.ts`
//    cannot resolve, Skia never initialises in the browser, and the gallery
//    renders a blank page. Adding the extension makes Metro emit the binary
//    into the bundle's asset folder and hand back its URL.
config.resolver.assetExts.push("wasm")

module.exports = config
