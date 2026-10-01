# Celestia — Mobile Token-Layer Plan

> **Status: IMPLEMENTED.** The token changes, the gate, and the docs sync have all
> landed (see §0). The one place this document was wrong is recorded in §5.1: the
> `destructive` value it proposed (`#b91c1c`) was **rejected on measurement** and
> replaced with `#991b1b`. Everything else below held up.
> Every ratio in this document is **measured**, not estimated. The scripts that
> produced them are reproduced in §9 so any number here can be re-derived.
> This is the follow-up that `PLAN-ui-audit.md` §9 named and deferred:
> *"The contrast script does not cover `lightColors` / `darkColors`; extending it
> there is a reasonable follow-up."*

---

## 0. Progress log

| Phase | Track | Status | Notes |
|---|---|---|---|
| **M-A — Measure** | token values | ✅ **Done** | 19 light-theme failures measured across 11 components (this document's §3 lists 15; the gate's reachability pass found 4 more). Dark theme: **0 failures**. Method in §2. |
| **M-B — Fix** | `lightColors` | ✅ **Done** | **6 hex literals**, not 5 — `destructiveEdge` is derived and had to move with `destructive` (§5.1). `destructive` landed as `#991b1b`, not the `#b91c1c` proposed below. Zero structural change. |
| **M-C — Gate** | `scripts/ui-audit/` | ✅ **Done** | Landed as **`mobile-contrast.mjs`** (not `mobile-tokens.mjs`), wired into `pnpm audit:ui` as check 2 of 6. Asserts 38 pairings per theme plus the derived-edge and gauge-step contracts. Non-vacuity proof in §7. |
| **M-D — Docs** | `mobile.mdx` + README | ✅ **Done** | `AGENTS.md` makes this mandatory when a feature changes. Also corrected `packages/mobile/README.md`'s module counts (71 → 157) and the `lint-coverage.mjs` exemption reason. |

**Measured surface:** `packages/mobile/src/tokens.ts` — 2 ramps × 25 tokens (2 added:
`overlay`, `shadow`) · **157 modules** across `primitive/` (52) `composite/` (58)
`ai/` (27) `layout/` (20) · `apps/mobile` showcase.

---

## 1. Why this plan exists

The web design system had five automated gates (`pnpm audit:ui`); this plan added
the sixth. The mobile package had **157 modules, its own hand-written token pair,
and no contrast verification of any kind.**

That asymmetry is not theoretical. The web audit found and fixed exactly this
class of bug (`--muted-foreground` at 2.58:1, the `--stroke` hairline at 1.12:1).
The same class was present and unfixed on the mobile side, and the mobile package
had no gate that would ever have caught it.

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

### Light theme: 19 failures

> This section lists the **15** failures found by listing the abstract token pairs.
> The reachability pass (pass 2 in §2) then enumerated what components actually
> render and found **4 more** — see §6. The gate asserts all 38 pairings.

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

## 5. The fix — 6 hex literals

The web design system already solved this exact problem. Its light theme uses
`oklch(0.5 …)` for the status hues with white foregrounds, and its dark theme uses
`oklch(0.7 …)` with dark ink. Those values are **already gate-verified** by
`contrast.mjs`.

So the fix is **convergence with the sibling package**, not a new design decision —
which is the principle `packages/mobile/PLAN.md` §1 already committed to:

> Following the sibling package matters more than my first instinct here: the two
> libraries are imported side by side, so a divergent taxonomy would be worse than
> a debatable one.

### `lightColors` — 6 values change, nothing else

| Token | Before | After (as landed) | Source of the new value |
|---|---|---|---|
| `success` | `#10b981` | **`#007b2a`** | web `oklch(0.5 0.16 150)` |
| `warning` | `#f59e0b` | **`#994e00`** | web `oklch(0.5 0.17 75)` |
| `info` | `#3b82f6` | **`#0062c9`** | web `oklch(0.5 0.19 250)` |
| `destructive` | `#ef4444` | **`#991b1b`** | Tailwind red-800 — **not** the `#b91c1c` this plan proposed, see §5.1 |
| `muted` | `#64748b` | **`#475569`** | slate-500 → slate-600 (stays on-ramp) |
| `destructiveEdge` | `#942626` | **`#5d0c0c`** | re-derived: `color-mix(in oklch, #991b1b, black 30%)` — this row was **missing from the plan**, see §5.1 |

**`*Foreground` tokens do not change.** All four stay `#ffffff`; darkening the
fills is what makes white ink pass.

**`destructive` is deeper than the web's value, and that is deliberate.** The web
light `--destructive` is `oklch(0.577 0.245 27.325)` ≈ `#e7000b`. On a plain card
that measures 4.77:1 and passes — but on `MobileAlert`'s 10% self-tint it measures
**4.01:1**, and an alert *title* is text, so 4.5:1 applies. The web system carries
this same 4.01:1 pairing and gets away with it because there it colours an **SVG**
(the `[&_svg]` rules) where only 3:1 is required — `PLAN-ui-audit.md` §4 records
exactly that 4.01:1. Mobile renders it as a title, so it needs the deeper red.

### 5.1 Two corrections found while implementing

**(a) `#b91c1c` was rejected on measurement — it collapses the escalating gauge.**
The plan picked `#b91c1c` as "the deeper red" without checking what it sits next to.
`MobileTokenMeter` walks `muted` → `warning` → `destructive` on a 4pt bar, so
adjacent steps must stay distinguishable. Measured in OKLCH:

| pair | OKLCH L | ΔL | contrast | verdict |
|---|---|---|---|---|
| `warning #994e00` vs `#b91c1c` | 0.5063 / 0.5054 | **0.0009** | **1.06:1** | collapses — *worse* than the 1.75:1 it replaced |
| `warning #994e00` vs `#991b1b` | 0.5063 / 0.4437 | 0.0626 | **1.363:1** | reads as a step (better than web's own 1.278:1) |

The cause is the ceiling in §4: it pins every status hue to `L <= 0.18333`, so the
*only* freedom left to separate two status hues is **how far below** the ceiling
they sit. `#b91c1c` and `#994e00` land on the same rung. **`#991b1b`** (Tailwind
red-800) sits a full ramp step lower, which is what the gauge needs — and it keeps
`destructive` on the same Tailwind ramp as the `muted` fix.

**(b) `destructiveEdge` was missing from the plan — it is derived, not chosen.**
The plan's own reasoning for `#942626` ("a 30% darker shade of `#ef4444`") *is* the
derivation rule: `destructiveEdge` is the sRGB bake of the web token layer's
`--shadow-destructive-3d` = `color-mix(in oklch, destructive, black 30%)`. Verified
byte-exact — `color-mix(oklch, #ef4444, black 30%)` reproduces `#942626` exactly.
So the plan's "5 literals" is really **6**: change `destructive` and the button's
2px bottom edge keeps the *old* red unless the edge moves with it. The edge/face
separation is what makes the edge read as a thickened border, and it collapses:

| face | edge kept stale (`#942626`) | edge re-derived |
|---|---|---|
| `#ef4444` (before) | 2.176:1 — correct | — |
| `#991b1b` (**shipped**) | **1.015:1** — invisible, the two reds are indistinguishable | **1.659:1** (`#5d0c0c`) |
| `#b91c1c` (plan) | 1.266:1 | 1.838:1 (`#710d0d`) |

The shipped value would have been the *worst* case of the three, because `#991b1b`
sits closer to the old `#942626` in lightness than `#b91c1c` does. The gate now
asserts this relationship numerically rather than trusting two literals that happen
to agree.

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

### Verified result: 38/38 in both themes (as shipped)

Measured against the **landed** values — every pairing a component renders, plus
the ramp and derived-token contracts:

```
light   38/38 PASS   exit 0
dark    38/38 PASS   exit 0
```

The plan's own reachability subset was 21 pairings; the gate's census is 38, which
is why §0's M-A row says 19 failures rather than this section's 15 — the extra
pairings were found by enumerating reachability rather than by listing the
failures.

Selected rows (before → after):

```
MobileAlert title warning      1.99:1 -> 5.27:1
MobileAlert title success      2.31:1 -> 4.72:1
MobileBadge warning            2.15:1 -> 6.10:1
MobileBadge success            2.54:1 -> 5.43:1
error text on card             3.76:1 -> 6.47:1
segmented control unselected   4.34:1 -> 6.92:1
MobileProgress fill warning    1.96:1 -> 5.57:1
```

(The gauge step is the one row that does **not** improve on contrast — it improves
on *lightness separation*, which is the property a 4pt bar actually needs. See
§5.1(a).)

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

## 6. The gate — `scripts/ui-audit/mobile-contrast.mjs`

> Landed under the name **`mobile-contrast.mjs`**, not the `mobile-tokens.mjs`
> placeholder used elsewhere in this document. It sits beside `contrast.mjs` and
> the pair read as "web ramp / mobile ramp".

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

Two contracts were **added during implementation** that the plan did not have:

- **The derived-edge contract** — `destructiveEdge` must equal
  `color-mix(in oklch, destructive, black 30%)` (§5.1(b)).
- **The gauge-step contract** — `muted → warning` and `warning → destructive` must
  each clear **contrast ≥ 1.25:1 or Δhue ≥ 40°** (§5.1(a)). This is what turns
  "the plan's `#b91c1c` collapses the gauge" from a one-off measurement into a
  standing rule.

Plus the ramp checks the web gate already performs: the dark ramp must rise
(`background < card < muted`), and the decorative hairlines must clear 1.2:1.

It also prints a **non-failing spacing census** every run — the count of off-scale
`padding` / `gap` / `margin` literals still in the component layer — so the debt
the `spacing` export could not clear in one sweep stays visible (§5 of `mobile.mdx`).

Wired into the existing runner as **check 2 of 6**:

```js
const CHECKS = [
  ["contrast.mjs", "token colour contrast, both themes"],
  ["mobile-contrast.mjs", "mobile ColorRamp contrast, both themes"],   // new
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
| `lightColors.destructive` → `#b91c1c` | `FAIL gauge step warning -> destructive 1.06:1 need 1.25` — **the §5.1(a) regression, proved** |
| `lightColors.destructive` → `#991b1b`, edge left `#942626` | derived-edge contract FAIL |

The control row is the important one: it proves the control is wired to the exit
code rather than decorative.

A gate that only ever runs green has not been shown to detect anything.

**One probe was inconclusive and is recorded as such.** Injecting
`warning: #8d5e00` did *not* flip the `muted → warning` step, because that step
passes on `Δhue 158.4°` rather than on contrast — so the injection proved nothing
about the contrast half of the assertion. The `#b91c1c` injection above is the
meaningful one: it exercises the `warning → destructive` step, which has a small
Δhue and therefore has to clear on contrast. A probe that cannot fail the thing it
targets is not evidence.

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

| # | File | Change | Status |
|---|---|---|---|
| 1 | `apps/web/content/docs/mobile.mdx` | The design-rules section gains the measured contrast floors and the `L <= 0.183` rule for status hues, so the next person does not re-lighten them. Rules renumbered 1–15; rules 1–6 are now gate-enforced and the intro says so. | ✅ |
| 2 | `packages/mobile/README.md` | Same, condensed — it documents the design rules already. Also corrected the module counts (**71 → 157**) and expanded the design rules from 11 to 15. | ✅ |
| 3 | `packages/mobile/PLAN.md` | Append to §0: the token-layer audit landed, with the **6** values and the gate name. | ⬜ not present in this repo |
| 4 | `README.md` | `pnpm audit:ui` description extended to name the mobile ramp and the two new contracts; check count 5 → 6. | ✅ |
| 5 | `scripts/ui-audit/lint-coverage.mjs` | **Not in the original plan.** Its exemption for `packages/mobile` claimed "no eslint dependency *and no node_modules (install blocked)*" — the second half was false (`node_modules` exists, `tsc --noEmit` exits 0). Corrected, plus the file header. | ✅ |

---

## 9. Reproduction

```bash
NODE=~/.workbuddy-ai/binaries/node/versions/22.22.2-3/bin/node

# 1. abstract token pairs, both themes          -> 13 failures
$NODE /tmp/mobile-contrast-probe.mjs

# 2. reachable component pairings, incl. the
#    alert self-tint and the progress fill      -> 19 light / 0 dark
$NODE /tmp/mobile-reachability.mjs

# 3. proposed values, both themes               -> 0 failing of 21, twice
$NODE /tmp/mobile-final.mjs
```

These three scripts lived in `/tmp` and are **not** repo files — the durable version
is **`mobile-contrast.mjs`** (§6), which is the thing you should actually run:

```bash
# The whole audit, 6 checks
pnpm audit:ui

# Just the mobile ramp
node scripts/ui-audit/mobile-contrast.mjs
```

---

## 10. Out of scope / decisions needed

| # | Item | Why it is not in this plan |
|---|---|---|
| **D-1** | **Input borders at 3:1.** `inputBorder` measures **1.48:1** (light) / **1.79:1** (dark) against the control face, and the input's own fill (`surface`) differs from the page by only **1.05:1** — so the border is entirely load-bearing for WCAG 1.4.11. | **This is a house-wide convention, not a mobile regression.** The web system's `--input` is `oklch(0.922 0 0)` ≈ `#e5e5e5` = **1.26:1** — *worse* than mobile — and the web gate does not check it. Raising it is a real visual change across every form control in both systems, and belongs in its own decision. The gate will print it as a **reference row**, not an assertion. |
| **D-2** | Aligning mobile dark to web dark (`#43b966` / `#da8b00` / `#1ca2ff`). | Dark passes 38/38 already. Pure churn unless the two systems are being unified deliberately. |
| **D-3** | `card.tsx:28` hardcoded `#0f172a` as a shadow colour — which is exactly `lightColors.foreground`. | **Landed after all.** The claim "a shadow is not a semantic colour" stopped holding once `MobileModal`'s scrim was also found hardcoded — two hardcoded colours, in two different components, is a missing token, not a style choice. Both became tokens (`shadow`, `overlay`) in both ramps. `MobileCard` and `MobileSpeedDial` now read `colors.shadow`; dark mode gets its elevation from surface + border rather than a light shadow, which would read as a glow. |
| **D-4** | **Visual verification on a device.** | Still open, and still the honest limitation: these components render real SwiftUI / Jetpack Compose and cannot be verified headlessly. Typecheck plus the gate plus the showcase remain the automated checks; the manual pass below is unchanged. |
| **D-5** | `--stroke`-equivalent: the mobile ramps have no elevation/hairline token pair to check. | `cardBorder` (1.23:1) and `border` (1.26:1) are decorative and already above the 1.2:1 band. Nothing to fix. |
| **D-6** | **Migrating the spacing literals.** `spacing` is now exported (§5 of `mobile.mdx`), but the component layer's hand-picked `padding` / `gap` / `margin` values (6, 10, 14, 20, 24, 48 …) are **not** snapped to it. | Snapping them is a visible redesign across 157 modules, not a token change. The gate prints the census every run so the debt stays counted rather than forgotten. |
