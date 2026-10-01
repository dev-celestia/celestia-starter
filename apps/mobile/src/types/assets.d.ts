/**
 * Ambient type for raster assets. Metro resolves a `require`/import of a PNG
 * to a numeric asset id, which is exactly the `ImageSourcePropType` union —
 * so `Image`'s `source` accepts it unchanged.
 *
 * `png` is part of Metro's default `assetExts`, so no resolver config is
 * involved.
 */
declare module "*.png" {
  import type { ImageSourcePropType } from "react-native"
  const source: ImageSourcePropType
  export default source
}
