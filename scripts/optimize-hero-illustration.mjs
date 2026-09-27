/**
 * Crop a hero art master to the band the page renders and encode WebP.
 *
 * The image models return 3:2 (1536x1024). The hero band is 16:9, so the top
 * and bottom of every master are never displayed. Baking the crop into the
 * asset means the browser stops downloading pixels it will never paint, and
 * WebP takes a ~2 MB PNG down to ~100-130 KB.
 *
 * Usage:
 *   node scripts/optimize-hero-illustration.mjs <input.png> [output.webp] [ratio]
 *
 * `output.webp` defaults to the input path with a `.webp` extension, and
 * `ratio` defaults to 16/9. Masters are left untouched, so any future crop can
 * be re-derived from them.
 *
 * A note on the ratio: the artwork is a roughly square radial composition, so
 * an ultra-wide 21:9 crop slices the subject in half. 16:9 is the widest band
 * that still shows the whole sphere with headroom. If the band ever needs to
 * get wider, the art has to be recomposed, not just re-cropped.
 */
import { createRequire } from "node:module"
import path from "node:path"
import { fileURLToPath } from "node:url"

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..")

/**
 * `sharp` is a transitive dependency here, so pnpm does not hoist it into the
 * repo root and a bare `import "sharp"` fails. It *is* reachable through pnpm's
 * hidden hoist directory; fall back to that before giving up.
 */
const require = createRequire(import.meta.url)
function loadSharp() {
  try {
    return require("sharp")
  } catch {
    return require(path.join(repoRoot, "node_modules/.pnpm/node_modules/sharp"))
  }
}
const sharp = loadSharp()

/** 16:9 — the band the hero renders. Overridable as the third CLI argument. */
const RATIO = 16 / 9

const [, , inputArg, outputArg, ratioArg] = process.argv
if (!inputArg) {
  console.error("usage: node scripts/optimize-hero-illustration.mjs <input.png> [output.webp] [ratio]")
  process.exit(1)
}

const ratio = ratioArg ? Number(ratioArg) : RATIO
if (!Number.isFinite(ratio) || ratio <= 0) {
  console.error(`refusing: invalid ratio ${ratioArg}`)
  process.exit(1)
}

const input = path.resolve(repoRoot, inputArg)
const output = outputArg
  ? path.resolve(repoRoot, outputArg)
  : input.replace(/\.png$/i, ".webp")

const image = sharp(input)
const { width, height } = await image.metadata()
const cropHeight = Math.round(width / ratio)

if (cropHeight > height) {
  console.error(`refusing: ${width}x${height} is already narrower than ${ratio}:1`)
  process.exit(1)
}

const info = await image
  .extract({
    left: 0,
    top: Math.round((height - cropHeight) / 2),
    width,
    height: cropHeight,
  })
  .webp({ quality: 82, effort: 6 })
  .toFile(output)

console.log(
  `${path.basename(input)} ${width}x${height} -> ${path.basename(output)} ` +
    `${info.width}x${info.height}, ${(info.size / 1024).toFixed(0)} KB`
)
