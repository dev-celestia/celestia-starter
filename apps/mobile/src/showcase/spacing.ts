/**
 * The gallery's spacing scale — the only five gaps a section is allowed to use.
 *
 * This exists because the sections had drifted: the same two jobs were being
 * served by eight different hand-picked values (6, 8, 10, 12, 14, 16, 18, 20),
 * so "the label above the next demo" was 6 in one section, 8 in three, 10 in
 * two and 12 in another. Nothing was *wrong* in isolation, which is exactly why
 * it went unnoticed — the gallery just read as seven different pages rather
 * than one page in seven parts.
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
 * This lives in its own module rather than in `ui.tsx` on purpose: `ui.tsx`
 * imports the context hooks from `nav.tsx`, so `nav.tsx` importing the scale
 * back from `ui.tsx` would close an import cycle and put `SPACE` in the temporal
 * dead zone during whichever module happened to be evaluated first. A leaf
 * module with no imports cannot do that.
 */
export const SPACE = {
  inline: 4,
  label: 8,
  row: 12,
  block: 16,
  section: 32,
} as const
