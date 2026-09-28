# Celestia — Mobile Token-Layer Plan

> **Status: plan only. Nothing below has been applied to `tokens.ts` yet.**
> Every ratio in this document is **measured**, not estimated. The scripts that
> produced them are reproduced in §9 so any number here can be re-derived.
> This is the follow-up that `PLAN-ui-audit.md` §9 named and deferred:
> *"The contrast script does not cover `lightColors` / `darkColors`; extending it
> there is a reasonable follow-up."*

---

## 0. Progress log

| Phase | Track | Status | Notes |
|---|---|---|---|
| **M-A — Measure** | token values | ✅ **Done** | 15 light-theme failures measured across 9 components. Dark theme: **0 failures**. Method in §2. |
| **M-B — Fix** | `lightColors` | ⬜ Planned | **5 hex literals.** Zero structural change. Verified in advance: 21/21 pass (§5). |
| **M-C — Gate** | `scripts/ui-audit/` | ⬜ Planned | New `mobile-tokens.mjs`, wired into `pnpm audit:ui`. Non-vacuity proof in §7. |
| **M-D — Docs** | `mobile.mdx` + README | ⬜ Planned | `AGENTS.md` makes this mandatory when a feature changes. |

**Measured surface:** `packages/mobile/src/tokens.ts` — 2 ramps × 23 tokens ·
43 components across `primitive/` (20) `composite/` (13) `layout/` (10) ·
`apps/mobile` showcase, 14 files.

---

## 1. Why this plan exists

The web design system now has five automated gates (`pnpm audit:ui`) that run on
every `pnpm lint`. The mobile package has **43 components, its own hand-written
token pair, and no contrast verification of any kind.**

That asymmetry is not theoretical. The web audit found and fixed exactly this
class of bug (`--muted-foreground` at 2.58:1, the `--stroke` hairline at 1.12:1).
The same class is present and unfixed on the mobile side, and the mobile package
has no gate that would ever have caught it.

The mobile `PLAN.md` states its design rules as non-negotiable:

> 1. **No hardcoded colors.** Everything reads `useMobileTheme()`. Full light/dark parity.

The colours *are* all tokenised — the component layer is clean (a repo-wide scan
found exactly **one** hex literal outside `tokens.ts`, a shadow colour at
`card.tsx:28`). The defect is not in the components. **It is in the token values
themselves**, which is why no component-level review would have caught it.

---

## 2. Method

A throwaway probe parses `lightColors` / `darkColors` **out of `tokens.ts`** rather
than duplicating them, so the measurement cannot drift from the source. It runs a
**known-good control first** — `foreground`/`background` must exceed 15:1, or it
prints `HARNESS ERROR` and refuses to report:

```
control foreground/background ........ 17.85:1  OK   (light)
control foreground/background ........ 19.02:1  OK   (dark)
```

This control is not ceremony. An earlier version of the *web* gate compared a
ratio against the string `'3:1'` (`4.88 >= NaN`) and printed `FAIL` on every row
including provably-fine pairs. A gate that can emit a uniform verdict is broken,
not decisive.

Three passes were needed, and the third is the one that matters:

| Pass | Question | Result |
|---|---|---|
| 1 | Do the abstract token pairs pass? | 13 failures |
| 2 | **Are they reachable?** Does a component actually render that pair? | All 13 reachable — but this pass found **2 more** |
| 3 | What is the *effective backdrop*? (translucency) | `MobileAlert` tints its own backdrop, which is the binding case |

Pass 3 is the trap. `MobileAlert` draws its title in the full-strength hue **on a
10% tint of that same hue over `card`** (`alert.tsx:106`, `opacity: 0.1`). A
self-tint drags the backdrop *toward* the text colour, so it is always slightly
worse than plain white — and it is the case that binds.

---

## 3. Findings — measured

### Light theme: 15 failures

| # | Component | Pair rendered | Ratio | Need | Source |
|---|---|---|---|---|---|
| 1 | `MobileAlert` title `warning` | `#f59e0b` on 10% self-tint | **1.99:1** | 4.5 | `alert.tsx:115` |
| 2 | `MobileAlert` title `success` | `#10b981` on 10% self-tint | **2.31:1** | 4.5 | `alert.tsx:115` |
| 3 | `MobileAlert` title `destructive` | `#ef4444` on 10% self-tint | **3.29:1** | 4.5 | `alert.tsx:115` |
| 4 | `MobileAlert` title `info` | `#3b82f6` on 10% self-tint | **3.29:1** | 4.5 | `alert.tsx:115` |
| 5 | `MobileBadge` `warning` | white on `#f59e0b` | **2.15:1** | 4.5 | `badge.tsx:69` |
| 6 | `MobileBadge` `success` | white on `#10b981` | **2.54:1** | 4.5 | `badge.tsx:63` |
| 7 | `MobileBadge` `info` | white on `#3b82f6` | **3.68:1** | 4.5 | `badge.tsx:75` |
| 8 | `MobileBadge` `destructive` | white on `#ef4444` | **3.76:1** | 4.5 | `badge.tsx:81` |
| 9 | `MobileButton` destructive | white on `#ef4444` | **3.76:1** | 4.5 | `button.tsx:158` |
| 10 | error text (4 call sites) | `#ef4444` on `card` | **3.76:1** | 4.5 | `form-field.tsx:91`, `otp-input.tsx:183`, `confirm-dialog.tsx:135`, `label.tsx:63` |
| 11 | error text on `surface` | `#ef4444` on `#f8fafc` | **3.60:1** | 4.5 | `input.tsx` (input sits on `surface`) |
| 12 | `MobileSegmentedControl` unselected | `#64748b` on `#f1f5f9` | **4.34:1** | 4.5 | `segmented-control.tsx:170` |
| 13 | `MobileAvatarGroup` `+N` | `#64748b` on `#f1f5f9` | **4.34:1** | 4.5 | `avatar-group.tsx:131` |
| 14 | `MobileProgress` fill `warning` | `#f59e0b` on track | **1.96:1** | 3.0 | `progress.tsx` |
| 15 | `MobileProgress` fill `success` | `#10b981` on track | **2.32:1** | 3.0 | `progress.tsx` |

Badge text is `variant="label"` = **11px/600** (`badge.tsx:115`), far below the
large-text threshold, so the full 4.5:1 applies — `warning` at 1.99:1 is **less
than half** the required ratio.

### Dark theme: 0 failures

Every pairing passes, comfortably (worst case 5.16:1). This is the same asymmetry
the web audit found, and it is worth stating plainly: **the theme nobody
complained about is the broken one.**

### Not findings (checked, and deliberately cleared)

- **`MobileToast`** (`toast.tsx:126`) — the accent is a 12% tint with `card`/`muted`
  text on top, not text on the hue. No failing pairing.
- **Borders as non-text** — `destructive` at 3.76:1 clears the 3:1 floor for the
  error *border* on `input`, `checkbox`, `otp-input`. Only its use as *text* fails.
- **`primary`/`secondary`/`accent`** — all pass (16.30:1, 14.24:1, etc.). The
  achromatic half of the ramp is healthy.

---

## 4. Root cause — one structural insight

The light theme's four status hues are each doing **two incompatible jobs**:

1. **As a fill**, carrying white text on top (`badge`, `button`).
2. **As a text/indicator colour**, sitting on a near-white backdrop (`alert` title,
   `progress` fill).

Job 1 needs the hue to be **dark** (so white text clears 4.5:1).
Job 2 needs the hue to be **dark** (so it clears 4.5:1 against white).

These are the *same* condition. Working it through:

```
white text on a fill:   (1.05) / (L + 0.05) >= 4.5   =>  L <= 0.18333
hue as text on white:   (1.05) / (L + 0.05) >= 4.5   =>  L <= 0.18333
```

**Identical.** So a single value per hue can serve both roles — there is no need
to split the token family.

The current light values are all *above* that ceiling:

| token | light value | luminance | vs ceiling 0.18333 |
|---|---|---|---|
| `success` | `#10b981` | 0.3640 | **2.0× too light** |
| `warning` | `#f59e0b` | 0.4389 | **2.4× too light** |
| `info` | `#3b82f6` | 0.2355 | **1.3× too light** |
| `destructive` | `#ef4444` | 0.2291 | **1.3× too light** |

And the tell that this is a mistake rather than a style choice: **the light
theme's hues are lighter than the dark theme's.** Light uses `#10b981` where dark
uses `#34d399` — the light theme's status colours are *less* prominent than the
dark theme's, which is backwards for a theme whose background is white.

---

## 5. The fix — 5 hex literals

The web design system already solved this exact problem. Its light theme uses
`oklch(0.5 …)` for the status hues with white foregrounds, and its dark theme uses
`oklch(0.7 …)` with dark ink. Those values are **already gate-verified** by
`contrast.mjs`.

So the fix is **convergence with the sibling package**, not a new design decision —
which is the principle `packages/mobile/PLAN.md` §1 already committed to:

> Following the sibling package matters more than my first instinct here: the two
> libraries are imported side by side, so a divergent taxonomy would be worse than
> a debatable one.

### `lightColors` — 5 values change, nothing else

| Token | Before | After | Source of the new value |
|---|---|---|---|
| `success` | `#10b981` | **`#007b2a`** | web `oklch(0.5 0.16 150)` |
| `warning` | `#f59e0b` | **`#994e00`** | web `oklch(0.5 0.17 75)` |
| `info` | `#3b82f6` | **`#0062c9`** | web `oklch(0.5 0.19 250)` |
| `destructive` | `#ef4444` | **`#b91c1c`** | deeper than web's `oklch(0.577 …)` — see below |
| `muted` | `#64748b` | **`#475569`** | slate-500 → slate-600 (stays on-ramp) |

**`*Foreground` tokens do not change.** All four stay `#ffffff`; darkening the
fills is what makes white ink pass.

**`destructive` is deeper than the web's value, and that is deliberate.** The web
light `--destructive` is `oklch(0.577 0.245 27.325)` ≈ `#e7000b`. On a plain card
that measures 4.77:1 and passes — but on `MobileAlert`'s 10% self-tint it measures
**4.01:1**, and an alert *title* is text, so 4.5:1 applies. The web system carries
this same 4.01:1 pairing and gets away with it because there it colours an **SVG**
(the `[&_svg]` rules) where only 3:1 is required — `PLAN-ui-audit.md` §4 records
exactly that 4.01:1. Mobile renders it as a title, so it needs the deeper red.

### `darkColors` — unchanged

Dark passes every pairing. Touching it would be churn. Note for the record that
mobile dark is *not* byte-identical to web dark:

| token | mobile dark | web dark |
|---|---|---|
| `success` | `#34d399` | `#43b966` |
| `warning` | `#fbbf24` | `#da8b00` |
| `info` | `#60a5fa` | `#1ca2ff` |
| `destructive` | `#ff6467` | `#ff6467` ← already identical |

Mobile uses Tailwind-400 equivalents; web uses `oklch(0.7 …)`. Both pass. Aligning
them is optional and out of scope (§10).

### Verified result: 21/21 in both themes

Measured against the proposed values, covering every pairing a component renders:

```
light   21/21 PASS   worst case 4.72:1  (MobileAlert title success)
dark    21/21 PASS   worst case 5.16:1  (MobileProgress fill destructive)
```

Selected rows (full output in §9):

```
MobileAlert title warning      1.99:1 -> 5.27:1
MobileAlert title success      2.31:1 -> 4.72:1
MobileBadge warning            2.15:1 -> 6.10:1
MobileBadge success            2.54:1 -> 5.43:1
error text on card             3.76:1 -> 6.47:1
segmented control unselected   4.34:1 -> 6.92:1
MobileProgress fill warning    1.96:1 -> 5.57:1
```

### Why `muted` moves a full ramp step

`#64748b` (slate-500) measures **4.76:1 on white** — it was always marginal, tuned
against the one backdrop it happened to be checked on. Its worst real backdrop is
`mutedBackground` (`#f1f5f9`, used by the segmented-control track, the avatar
`+N` bubble, the skeleton, the slider track and the progress track), where it
drops to **4.34:1**.

Slate-600 is the smallest on-ramp step that clears every backdrop with margin
(6.92:1 worst case). Inventing an in-between value was rejected to stay on the
Tailwind ramp the rest of the file already uses. The side effect — muted text
becomes slightly darker app-wide — is a readability improvement, not a regression,
and it is **visible**, so it belongs in the manual pass (§8).

---

## 6. The gate — `scripts/ui-audit/mobile-tokens.mjs`

Follows the same three disciplines as `contrast.mjs`:

1. **Reads the tokens out of `tokens.ts`** — never duplicated, so it cannot drift.
2. **Runs a known-good control first** and refuses to report if it fails.
3. **Separates assertions from reference rows** — the old values and the
   `inputBorder` pair are printed as `ref` and excluded from the exit code, or the
   gate could never go green.

It asserts the **component render contracts**, not just abstract token pairs,
because reachability is what makes a finding actionable. Each contract is
annotated with the component and file that creates it:

```js
// ink on a status FILL            -> badge.tsx:63-81, button.tsx:158
// status hue as TEXT on its own
//   10% self-tint over card      -> alert.tsx:115 (+ alert.tsx:106 opacity 0.1)
// muted on mutedBackground        -> segmented-control.tsx:170, avatar-group.tsx:131
// status hue as an indicator
//   against its track             -> progress.tsx (non-text, 3:1)
// error text on card/background/
//   surface                       -> form-field.tsx:91, otp-input.tsx:183, ...
```

Plus the ramp checks the web gate already performs: the dark ramp must rise
(`background < card < muted`), and the decorative hairlines must clear 1.2:1.

Wired into the existing runner:

```js
const CHECKS = [
  ["contrast.mjs", "token colour contrast, both themes"],
  ["mobile-tokens.mjs", "mobile ColorRamp contrast, both themes"],   // new
  ["token-parity.mjs", ":root vs .dark parity, font hooks"],
  ["compile-tokens.mjs", "stylesheet compiles, namespaces live"],
  ["focus-rings.mjs", "focus rings are 2px at full strength"],
  ["feature-drift.mjs", "no dead code written into packages/ui"],
]
```

No new dependency, no network: it reads a `.ts` file with a regex and does its own
colour maths. The managed Node binary runs it.

---

## 7. Verification

### The gate must be proved non-vacuous — inject → FAIL → revert

| Injected regression | Expected diagnostic |
|---|---|
| `lightColors.success` → `#10b981` | `FAIL MobileBadge success 2.54:1` — reproduces finding #6 exactly |
| `lightColors.warning` → `#f59e0b` | `FAIL MobileAlert title warning 1.99:1` — finding #1 |
| `lightColors.muted` → `#64748b` | `FAIL segmented control unselected 4.34:1` — finding #12 |
| `lightColors.background` → `#f0f0f0` | control must fail → `HARNESS ERROR`, exit 2 |

The last row is the important one: it proves the control is wired to the exit code
rather than decorative.

A gate that only ever runs green has not been shown to detect anything.

### Manual pass (needs a simulator — see §8)

Five components change appearance and all five are already in the
`apps/mobile` showcase gallery, so no new demo code is needed:

| Component | Showcase section |
|---|---|
| `MobileBadge` (4 variants) | `sections/actions.tsx` |
| `MobileButton` destructive | `sections/actions.tsx` |
| `MobileAlert` (4 variants) | `sections/overlays.tsx` |
| `MobileProgress` | `sections/foundations.tsx` |
| `MobileSegmentedControl` | `sections/navigation.tsx` |
| `MobileAvatarGroup` | `sections/data.tsx` |

Check both themes, and specifically: **do the new hues still read as their
semantic role?** `warning` at `#994e00` is a burnt amber rather than a bright one.
That is the unavoidable cost of the constraint in §4 — amber cannot simultaneously
be bright and carry white text — and it is the one change worth a human eye.

---

## 8. Docs (`AGENTS.md` requires this)

| # | File | Change |
|---|---|---|
| 1 | `apps/web/content/docs/mobile.mdx` | The design-rules section gains the measured contrast floors and the `L <= 0.183` rule for status hues, so the next person does not re-lighten them. |
| 2 | `packages/mobile/README.md` | Same, condensed — it documents the design rules already. |
| 3 | `packages/mobile/PLAN.md` | Append to §0: the token-layer audit landed, with the 5 values and the gate name. |
| 4 | `README.md` | `pnpm audit:ui` description already exists; extend it to mention the mobile ramp. |

---

## 9. Reproduction

```bash
NODE=/Users/870041/.workbuddy-ai/binaries/node/versions/22.22.2-3/bin/node

# 1. abstract token pairs, both themes          -> 13 failures
$NODE /tmp/mobile-contrast-probe.mjs

# 2. reachable component pairings, incl. the
#    alert self-tint and the progress fill      -> 15 light / 0 dark
$NODE /tmp/mobile-reachability.mjs

# 3. proposed values, both themes               -> 0 failing of 21, twice
$NODE /tmp/mobile-final.mjs
```

These three scripts live in `/tmp` and are **not** repo files — the durable version
is `mobile-tokens.mjs` (§6).

---

## 10. Out of scope / decisions needed

| # | Item | Why it is not in this plan |
|---|---|---|
| **D-1** | **Input borders at 3:1.** `inputBorder` measures **1.48:1** (light) / **1.79:1** (dark) against the control face, and the input's own fill (`surface`) differs from the page by only **1.05:1** — so the border is entirely load-bearing for WCAG 1.4.11. | **This is a house-wide convention, not a mobile regression.** The web system's `--input` is `oklch(0.922 0 0)` ≈ `#e5e5e5` = **1.26:1** — *worse* than mobile — and the web gate does not check it. Raising it is a real visual change across every form control in both systems, and belongs in its own decision. The gate will print it as a **reference row**, not an assertion. |
| **D-2** | Aligning mobile dark to web dark (`#43b966` / `#da8b00` / `#1ca2ff`). | Dark passes 21/21 already. Pure churn unless the two systems are being unified deliberately. |
| **D-3** | `card.tsx:28` hardcodes `#0f172a` as a shadow colour — which is exactly `lightColors.foreground`. | A shadow is arguably not a semantic colour, and the web side does the same. Flagged, not changed. |
| **D-4** | **Visual verification on a device.** | The mobile `PLAN.md` §8 already records this as a known limitation: these components render real SwiftUI / Jetpack Compose and cannot be verified headlessly. Typecheck plus the showcase remain the automated gates. |
| **D-5** | `--stroke`-equivalent: the mobile ramps have no elevation/hairline token pair to check. | `cardBorder` (1.23:1) and `border` (1.26:1) are decorative and already above the 1.2:1 band. Nothing to fix. |
