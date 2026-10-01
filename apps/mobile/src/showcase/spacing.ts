/**
 * The gallery's spacing scale — the only five gaps a section is allowed to use.
 *
 * The scale itself now lives in the library (`spacing` in
 * `@celestia-project/mobile/tokens`) and is re-exported here, so the gallery's
 * sections keep importing from one place. It was written here first, because the
 * sections had drifted: the same two jobs were being served by eight different
 * hand-picked values (6, 8, 10, 12, 14, 16, 18, 20), so "the label above the next
 * demo" was 6 in one section, 8 in three, 10 in two and 12 in another. Nothing
 * was *wrong* in isolation, which is exactly why it went unnoticed — the gallery
 * just read as seven different pages rather than one page in seven parts.
 *
 * Five steps, ascending, so the gap itself communicates the relationship:
 *
 * | Step | Gap | Used for |
 * |------|-----|----------|
 * | `inline` | 4 | Inside one control cluster — a dot and its label, adjacent swatches |
 * | `label` | 8 | A label and the control it labels |
 * | `row` | 12 | Sibling rows inside one demo — a stack of fields, a type ramp |
 * | `block` | 16 | Two demos inside one specimen |
 * | `section` | 32 | Two sections |
 *
 * Reach for `DemoLabel` before reaching for `Spacer` — most label gaps are
 * already carried by it.
 *
 * **Why the import is from `/tokens` and not the package barrel.** The barrel
 * re-exports the chart family, which binds Skia at module-evaluation time, so
 * importing it here would drag Skia into every module that touches `SPACE` — and
 * the section files all do. `tokens.ts` has no imports of its own, so this stays
 * a leaf in the only sense that matters: no edge back into the gallery's own
 * module graph.
 */
import { spacing } from "@celestia-project/mobile/tokens"

export const SPACE = spacing
