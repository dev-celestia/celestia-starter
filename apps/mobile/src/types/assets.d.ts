/**
 * Ambient types for binary assets that Metro resolves through
 * `resolver.assetExts` (see `metro.config.js`).
 *
 * On web an asset import evaluates to the URL Metro emitted for it, which is
 * what `Root.web.tsx` hands to CanvasKit's `locateFile`.
 */

declare module "*.wasm" {
  const url: string
  export default url
}

declare module "canvaskit-wasm/bin/full/canvaskit.wasm" {
  const url: string
  export default url
}

/**
 * Raster assets. Metro resolves a `require`/import of a PNG to a numeric asset
 * id on native and to an emitted URL string on web, which is exactly the
 * `ImageSourcePropType` union — so `Image`'s `source` accepts it unchanged on
 * both platforms.
 *
 * `png` is already in Metro's default `assetExts`; only `wasm` had to be added
 * (see `metro.config.js`).
 */
declare module "*.png" {
  import type { ImageSourcePropType } from "react-native"
  const source: ImageSourcePropType
  export default source
}
