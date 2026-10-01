# Celestia — Mobile Design-System Audit

> **Scope:** `packages/mobile` — the token layer, the component layer, and the
> claims made about both.
> **Status:** audit **and its follow-up have landed.** The findings below were
> measured with `tokens.ts` byte-identical; the fixes were then applied in a
> separate change (§10). The §0 table carries a per-finding status.
>
> Every number below is **measured**, not estimated, by
> `scripts/ui-audit/mobile-contrast.mjs` — a committed, non-vacuous gate that
> reads the ramp out of `tokens.ts`. §9 reproduces it.

---

## 0. Summary

| # | Finding | Severity | Status |
|---|---|---|---|
| **M1** | Light status ramp: **19 reachable pairings fail**, worst **1.99:1** against a 4.5:1 floor | 🔴 **High** | ✅ **Fixed.** Ramp lands 38/38 both themes. `destructive` shipped as `#991b1b`, **not** the plan's `#b91c1c` — see §10. |
| **M2** | Light `muted` = **4.34:1** — *the exact bug the web token layer documents as fixed* | 🔴 **High** | ✅ **Fixed.** `#64748b` → `#475569` (slate-600). |
| **M3** | **The fix is 6 literals, not 5.** `destructiveEdge` is derived and the plan omits it | 🟠 **Medium** | ✅ **Applied.** Edge re-derived to `#5d0c0c`; the gate now asserts the relationship. |
| **M4** | The plan's **reachability inventory undercounts by ~2×** — `success`/`warning`/`info` are used as *text* in ~10 places it never lists | 🟠 **Medium** | ✅ **Addressed.** The gate enumerates all 38 pairings rather than listing the failures. |
| **M5** | `MobileSegmentedControl` segments are **36pt with no `hitSlop`** — the only small control that misses the 44pt floor | 🟠 **Medium** | ✅ **Fixed.** `SEGMENT_HEIGHT = 36` + vertical-only `hitSlop`. |
| **M6** | **No spacing token exists.** 15 `padding` / 14 `gap` / 14 `margin` literals | 🟠 **Medium** | 🟡 **Partly.** `spacing` is exported from `tokens.ts`; the literals are **not** migrated (visible redesign, §10). The gate counts them every run. |
| **M7** | `inputBorder` = **1.42:1** — and for checkbox/radio/switch the border *is* the control (WCAG 1.4.11) | 🟡 **Low** | ⬜ **Open by decision.** House-wide convention; printed as a `ref` row, never an assertion. |
| **M8** | `modal.tsx:88` hardcodes `#000000` at **50%**, violating both "no hardcoded colours" and the one-overlay rule (web: 70%) | 🟡 **Low** | ✅ **Fixed.** New `overlay` token at 70%, in both ramps. |
| **M9** | Card shadow is **invisible in dark mode** — a black shadow over a `#09090b` page. Repeats the web `--elevation-edge` bug | 🟡 **Low** | ✅ **Fixed.** New `shadow` token; dark takes elevation from surface + border (a light shadow would read as a glow). |
| **M10** | `packages/mobile/README.md` claims **71** modules; there are **157** | 🟡 **Low** | ✅ **Fixed.** Counts corrected, design rules 11 → 15. |
| **M11** | The lint guard's exemption reason for this package is **factually wrong** — it says "no node_modules" | 🟡 **Low** | ✅ **Fixed.** `lint-coverage.mjs` exemption reason corrected. |
| — | Radii, type scale, motion, chart ramps, haptics, most touch targets | ✅ **Clean** | See §4 |

**The headline:** the web design system had five automated gates and passed all
five. `packages/mobile` had **157 modules, its own hand-written ramp, and no
contrast verification of any kind** — and the light theme failed 19 pairings.
Dark passed 36/36. **The theme nobody complained about is the broken one.**

There are now **six** gates. `mobile-contrast.mjs` is check 2, and it asserts 38
pairings per theme plus two contracts the plan did not have: the derived-edge
relationship and the escalating-gauge step (§10).

---

## 1. What was audited

| Layer | Path | Size |
|---|---|---|
| Token layer | `packages/mobile/src/tokens.ts` | 2 ramps × **25** colour tokens (23 at audit time; `overlay` + `shadow` added), 8 type roles, 5 radii, 5 spacing steps |
| Motion | `packages/mobile/src/motion.ts` | spring presets + helpers |
| Component layer | `src/components/{primitive,composite,ai,layout}/` | **52 / 58 / 27 / 20 = 157 modules** |
| Consumer | `apps/mobile/src/showcase` | 91 `<Specimen>` across 8 sections |
| Claims | `packages/mobile/README.md`, `apps/web/content/docs/mobile.mdx`, `scripts/ui-audit/` | — |

Verified clean before reporting: `pnpm --filter @celestia-project/mobile typecheck`
→ **exit 0, no errors**. The component layer contains **3 hex literals** outside
`tokens.ts` (all three findings, §3) — rule 1 ("no hardcoded colours") is
otherwise genuinely held.

---

## 2. M1 + M2 — the light ramp (measured)

36 assertions per theme, covering every pairing a component can actually render.
Each is annotated with the component that creates it, because **reachability is
what makes a finding actionable** — a sub-threshold pair nothing renders is not a
defect.

```
── light ── 17/36 assertions pass
  FAIL muted on mutedBackground                   4.34:1  need 4.5   segmented-control.tsx:161, avatar-group.tsx
  FAIL success text on card                       2.54:1  need 4.5   form-field.tsx:126, copy-button.tsx:106, stat-card.tsx:81
  FAIL success text on surface                    2.42:1  need 4.5   ai-error-card.tsx:130
  FAIL success title on 10% self-tint             2.31:1  need 4.5   alert.tsx:126+135
  FAIL successForeground on success fill          2.54:1  need 4.5   badge.tsx, tag.tsx, button.tsx:180
  FAIL success fill vs track                      2.32:1  need 3     progress.tsx:138+146
  FAIL warning text on card                       2.15:1  need 4.5   ...
  FAIL warning title on 10% self-tint             1.99:1  need 4.5   ...
  ... 19 total, all in the light ramp

── dark ── 36/36 assertions pass
```

The plan's numbers reproduce **exactly** (1.99 / 2.15 / 2.31 / 2.54 / 3.28 / 3.30
/ 3.60 / 3.68 / 3.76 / 4.34). Its arithmetic is trustworthy; its inventory is not
(§3, M4).

### The root cause is one constraint, and it is worth restating because it is the thing that stops this recurring

The light ramp's four status hues are each doing **two incompatible jobs** — a
**fill** carrying white text (`badge`, `tag`, `button`) and a **text/indicator**
colour on a near-white backdrop (`alert` title, `form-field` error, `progress`
fill). Working both through:

```
white ink on a fill:  1.05 / (L + 0.05) >= 4.5  =>  L <= 0.18333
hue as ink on white:  1.05 / (L + 0.05) >= 4.5  =>  L <= 0.18333
```

**Identical.** So one value per hue serves both roles and no token family needs
splitting. Every current light value is above that ceiling:

| token | light | luminance | vs ceiling 0.18333 |
|---|---|---|---|
| `success` | `#10b981` | 0.3640 | **2.0× too light** |
| `warning` | `#f59e0b` | 0.4389 | **2.4× too light** |
| `info` | `#3b82f6` | 0.2355 | **1.3× too light** |
| `destructive` | `#ef4444` | 0.2291 | **1.3× too light** |

And the tell that this is a mistake rather than a style choice: **the light
theme's status hues are lighter than the dark theme's.** Light uses `#10b981`
where dark uses `#34d399`.

### M2 is the same defect the web audit already fixed

`globals.css:324-331` documents moving web's `--muted-foreground` from 0.556 to
0.54 because *"muted text on a full `bg-muted` surface measured 4.35:1 — below
AA"*, lifting the worst case to 4.61:1.

Mobile's light `muted` (`#64748b`, slate-500) measures **4.34:1** on
`mutedBackground` — the pre-fix value, on the same backdrop, for the same reason.
The web fix landed; the mobile transcription never followed it.

---

## 3. Findings the plan does not contain

### M3 — the fix is **6 literals, not 5**

`PLAN-mobile-tokens.md` §5 changes five values. But `destructiveEdge` is not an
independent choice: it is the sRGB bake of the web token layer's
`--shadow-destructive-3d`, which is
`color-mix(in oklch, var(--destructive), black 30%)`.

**Verified byte-exact on both themes** — so the derivation is confirmed, not assumed:

```
color-mix(oklch, #ef4444, black 30%)  =  #942626   <- tokens.ts says #942626  ✓
color-mix(oklch, #ff6467, black 30%)  =  #9e3b3d   <- tokens.ts says #9e3b3d  ✓
```

Change `destructive` alone and the button's 2px bottom edge keeps the **old** red:

| | face | edge | edge/face separation |
|---|---|---|---|
| today | `#ef4444` | `#942626` | **2.18:1** |
| plan as written | `#b91c1c` | `#942626` | **1.27:1** ← the edge stops reading as a thickened border |
| with the sixth literal | `#b91c1c` | `#710d0d` | 1.84:1 |

The gate now asserts this relationship numerically, so the omission cannot recur.

### M4 — the reachability inventory undercounts by ~2×

The plan lists "error text (4 call sites)" for `destructive`. It misses that
**`success`, `warning` and `info` are also used as text on `card`**, in places the
plan never enumerates:

| site | what it renders |
|---|---|
| `ai/copy-button.tsx:106` | the "Copied" confirmation, in `success` |
| `ai/ai-feedback-bar.tsx:170,187` | thumbs-up / thumbs-down, in `success` / `destructive` |
| `composite/stat-card.tsx:81,83` | the trend delta — a **number**, in `success` / `destructive` |
| `composite/transaction-row.tsx:86,88` | the amount, in `success` / `destructive` |
| `ai/ai-disclaimer.tsx:54` | the `warning` tone |
| `layout/reset-password-screen.tsx:163-166` | the strength-meter label, in all three |
| `ai/ai-usage-card.tsx:121` | the quota title, in `destructive` |
| `primitive/tag.tsx:41-52` | the `success`/`warning`/`info`/`destructive` tags |
| `composite/message-bubble.tsx:72`, `ai/tool-call-card.tsx:132`, `ai/agent-task-row.tsx:97` | status glyphs |

**This does not change the fix** — it is token-level, so it closes all of them
(the gate confirms 36/36). It changes the *review*: a reviewer checking the plan's
own inventory would conclude the blast radius is four files.

### M5 — `MobileSegmentedControl` misses the 44pt floor

`composite/segmented-control.tsx:198` — `segment: { flex: 1, minHeight: 36 }`, and
the `Pressable` carries **no `hitSlop`**. The package has a helper for exactly
this (`hitSlopFor()` in `src/utils.ts`, vertical-only, with a comment explaining
why horizontal slop is unsafe), and **every other small control uses it**:

| control | drawn height | closes the floor with |
|---|---|---|
| `MobileButton` | 24 / 32 / 36 | `hitSlopFor()` ✓ |
| `MobileChip` | `CHIP_HEIGHT` | `hitSlopFor()` ✓ |
| `MobileAttachmentChip` | 32 | `hitSlopFor(32)` ✓ |
| `MobileMenu` | 32 | `hitSlop` + `minTouchTarget` ✓ |
| `MobileCheckbox` / `MobileRadioGroup` | 20 | the whole row is `minTouchTarget` ✓ |
| **`MobileSegmentedControl`** | **36** | **nothing** ✗ |

A vertical slop of 4pt each way reaches 44 and is safe — nothing sits above or
below a segment inside the control. Docs rule 2 states the floor is met; this one
component is the counter-example.

### M6 — there is no spacing token

`tokens.ts` exports colour, `typography`, `metrics.radius`, `metrics.minTouchTarget`
— and **no spacing scale**. Measured across the 157 modules:

| property | distinct literal values |
|---|---|
| `padding*` | **15** — 0, 1, 2, 3, 4, 6, 8, 10, 12, 14, 16, 20, 24, 32, 48 |
| `gap` | **14** — 0, 1, 2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 24, 28 |
| `margin*` | **14** — 0, 1, 2, 4, 5, 6, 8, 10, 12, 16, 20, 24, 28, 32 |

This is not hypothetical drift: the **gallery already fixed it, in the consumer
app**. `apps/mobile/src/showcase/spacing.ts` defines `SPACE = { inline: 4,
label: 8, row: 12, block: 16, section: 32 }`, and its own docstring describes the
problem it was written for:

> *"the same two jobs were being served by eight different hand-picked values
> (6, 8, 10, 12, 14, 16, 18, 20) … Nothing was wrong in isolation, which is
> exactly why it went unnoticed."*

That scale lives in `apps/mobile`, is not exported from the package, and a
consumer of `@celestia-project/mobile` therefore gets nothing. The library fixed
its drift one layer up.

### M8 — the overlay

`primitive/modal.tsx:88` hardcodes `backgroundColor: "#000000"` at `opacity` 0→**0.5**.
Two rules broken in one line:

1. Rule 1, "No hardcoded colours" — this is one of only three hex literals in the
   component layer.
2. `globals.css:44-45`: *"One overlay. Dialog, Sheet, Drawer and AlertDialog all
   use `bg-overlay`; do not introduce a second scrim opacity."* Web's `--overlay`
   is **70%**.

### M9 — the card shadow does nothing in dark mode

`primitive/card.tsx:29` and `composite/speed-dial.tsx:183`:

```tsx
shadowColor: colorScheme === "dark" ? "#000000" : "#0f172a"
```

with `shadowOpacity: 0.06`. A 6% black shadow over a `#09090b` page is
**1.00:1** — invisible. This is the same reasoning `globals.css:182-189` already
writes down for `--elevation-edge` (*"a darker band cannot separate from a
near-black page … the old dark value measured 1.03:1, i.e. invisible, which is the
bug this fixes"*). Web fixed it by flipping the band to **light** in dark mode;
mobile repeated the bug. The `#0f172a` literal is also exactly
`lightColors.foreground` — a token wearing a hex costume.

### M10 — the README understates the package by 86 modules

| category | README | reality | docs site |
|---|---|---|---|
| primitive | 20 | **52** | 52 ✓ |
| composite | 14 | **58** | 58 ✓ |
| ai | 27 | **27** ✓ | 27 ✓ |
| layout | 10 | **20** | 20 ✓ |
| **total** | **71** | **157** | 157 ✓ |

The four numbers are exactly the row counts of the README's own tables — a
self-referential count, not a stale one. The docs site has the right figures, so
the two now disagree by a factor of 2.2.

### M11 — the lint exemption reason is wrong

`scripts/ui-audit/lint-coverage.mjs` exempts `@celestia-project/mobile` and
`mobile` with the reason *"no eslint dependency and no node_modules (install
blocked)"*. Measured:

```
packages/mobile  node_modules=yes  eslint=no
apps/mobile      node_modules=yes  eslint=no
```

`node_modules` exists in both, and `packages/mobile` typechecks clean. The
eslint half is right; the `node_modules` half is a stale claim that a reader will
trust. `PLAN-ui-audit.md` §8 B-1 ("the dependency tree is partial") no longer
holds for these two workspaces.

---

## 4. Verified clean — do NOT re-audit

| Check | Result |
|---|---|
| **Dark ramp** | **36/36 assertions pass.** Worst case 5.16:1. Do not touch it. |
| **Radii** | Go through `metrics.radius.*` everywhere. The ~15 literal `borderRadius` values are all `size / 2` circle maths (a drawn glyph) or 1–2px hairlines — **not** off-scale box radii. |
| **Type scale** | 9 distinct `fontSize` literals vs 8 `typography` roles; only **3** inline overrides (`navbar.tsx:224` 30, `tab-bar.tsx:249` 10, `stepper.tsx:165` 20). Disciplined. |
| **Chart ramps** | All 5 series clear 3:1 on `card` in both themes (5.02:1 worst). The deliberate divergence from web's monochrome `--chart-*` is documented in `tokens.ts` and correct — web's `--chart-1` is 1.4:1 on white, which as a 9pt dot on a phone is simply not there. |
| **`primary`** | In step with web. `#d40c1a` / `#ff4d46` are exactly `oklch(0.55 0.22 27)` / `oklch(0.68 0.22 27)`. The historical drift is fixed. |
| **Motion** | Centralised in `motion.ts`; no hand-typed damping/stiffness tuples found. |
| **Haptics** | Every press path routes through `hapticLight` / `hapticMedium` / `hapticSelect`. |
| **`isTextChildren`** | Used consistently; no `typeof children === "string"` survivors. |
| **Hardcoded colours** | 3 literals total, and all three are findings above (M8, M9). Rule 1 otherwise holds across 157 modules. |
| **Showcase app** | 1 hardcoded colour, in a demo swatch palette where raw values are the point. |

---

## 5. Reference rows — measured, deliberately **not** enforced

### M7 — `inputBorder` at 1.42:1

| pair | light | dark | WCAG 1.4.11 wants |
|---|---|---|---|
| `inputBorder` vs `surface` | **1.42:1** | 1.70:1 | 3:1 |
| `surface` vs `background` | 1.05:1 | — | — |
| *web* `--input` vs `--card` | **1.26:1** | — | 3:1 |

For a **text input** the border is arguably decoration — the caret, the text and
the label identify the control. For **`MobileCheckbox`, `MobileRadioGroup`,
`MobileSwitch` (off), `MobileChip`, `MobileStepper` and `MobilePageDots`** the
border *is* the control, and the unchecked box / off track is the only affordance
present. That is a genuine WCAG 1.4.11 failure, not a cosmetic one.

**Honest scoping:** it is house-wide and web is *worse* (1.26:1). The plan
downgrades it to a reference row so the new gate can go green — which is a
reasonable sequencing decision, but it means **the gate is designed never to
catch this**. That should be a conscious choice, not a side effect.

### Light ramp monotonicity

The house rule is *"elevation must increase: background < card < muted/secondary"*.
Measured in light:

```
background #ffffff  =  card #ffffff        (equal — a card is invisible but for its 1.23:1 border)
surface    #f8fafc  <  both                (recessed *below* the page)
mutedBackground #f1f5f9 vs card            = 1.10:1   (web's equivalent: 1.13:1)
```

So light has **four** neutral levels with `card` level with the page and `surface`
sunk beneath it. This matches web (web's light `--card` is also white on white) —
it is a documented dark-mode rule applied to both themes. Reported, not changed.
The one genuinely load-bearing number is `cardBorder` at **1.23:1**, which is above
the 1.2:1 band and is what actually delineates a card.

### `muted` means two different things

| | mobile | web |
|---|---|---|
| `muted` | **`#64748b`** — a *foreground* | `oklch(0.97 0 0)` — a *surface* |
| the text role | `muted` | `--muted-foreground` (`#6f6f6f`) |

Same name, opposite axis. A consumer moving between the two libraries gets a fill
where they expected ink. Mobile also uses `colors.muted` as a **fill** in
`typing-indicator.tsx:132` — the dots — so the name is already load-bearing in two
directions.

Note also that the plan's `muted → #475569` moves mobile **away** from web's
`#6f6f6f`, while the plan's stated principle is convergence with the sibling
package. The choice is justified on the page (stay on the Tailwind slate ramp),
but the principle is applied inconsistently: it holds for the four status hues and
not for `muted`.

---

## 6. The gate — `scripts/ui-audit/mobile-contrast.mjs`

New, committed, **not yet wired** into `run.mjs`. It follows the three disciplines
`contrast.mjs` established:

1. Reads `lightColors` / `darkColors` **out of `tokens.ts`** — never duplicated.
2. Runs a **known-good control first** and exits 2 rather than report if it fails.
3. Separates **assertions** from **reference rows**.

Plus one check the web gate has no equivalent of: a **derived-token contract**
asserting `destructiveEdge == color-mix(in oklch, destructive, black 30%)`
numerically. That is the check that catches M3.

### Proved non-vacuous — inject → confirm → revert

| # | Injection | Result |
|---|---|---|
| 1 | as shipped | **exit 1**, 19 failures |
| 2 | all six corrected literals | **exit 0**, 36/36 both themes |
| 3 | revert **only** `destructiveEdge` | **exit 1** — `FAIL light expected #710d0d actual #942626` |
| 4 | revert one hue (`success`) | **exit 1**, reproduces **2.54 / 2.42 / 2.31** exactly |
| 5 | break the control (`background → #b0b0b0`) | **exit 2**, `HARNESS ERROR — refusing to report` |
| 6 | revert | byte-identical; back to run 1 |

**Run 3 is why this section exists.** The first version of the gate printed
`FAIL light` for the derived contract and then exited **0** — a decorative check,
the exact class of bug `PLAN-ui-audit.md` §0.5 warns about. It was caught only
because the injection was tried. The check is now wired to the exit code.

### Wiring it

```js
// scripts/ui-audit/run.mjs
const CHECKS = [
  ["contrast.mjs", "token colour contrast, both themes"],
  ["mobile-contrast.mjs", "mobile ColorRamp contrast, both themes"],   // <- add
  ...
]
```

**Sequencing note:** wiring it turns `pnpm audit:ui` **red** until the light ramp
is darkened. That is the honest order — land the fix, then close the gate — but it
means the gate and the fix are one change, not two.

---

## 7. What I would do, in order

| # | Action | Why | Done |
|---|---|---|---|
| **1** | Land the **six** light literals (`success` `#007b2a`, `warning` `#994e00`, `info` `#0062c9`, `destructive` **`#991b1b`**, `destructiveEdge` **`#5d0c0c`**, `muted` `#475569`) | Closes 19 assertions, breaks 0. Verified. | ✅ |
| **2** | Add `mobile-contrast.mjs` to `run.mjs` **in the same change** | Otherwise the gate is a file nobody runs. | ✅ |
| **3** | `segmented-control.tsx` — add a vertical-only `hitSlop` for the 36pt segment | M5. Matches every sibling. | ✅ |
| **4** | Add a `spacing` export to `tokens.ts` and have the gallery consume it | M6. The scale already existed; it was in the wrong package. | ✅ (export) / ⬜ (literal migration) |
| **5** | `modal.tsx` — add an `overlay` token at 70%; `card.tsx`/`speed-dial.tsx` — drop the shadow colour to a token | M8, M9. | ✅ |
| **6** | Correct the README counts and the lint exemption reason | M10, M11. Documentation that contradicts measurement is worse than none. | ✅ |
| **7** | **Decide** on M7 explicitly | It is the one finding that needs a human call, not a measurement. | ⬜ still open |

Steps 1–2 were the same change as `PLAN-mobile-tokens.md` §5, plus the sixth
literal. Steps 3–6 were new.

> **The one number in this table that changed on implementation:** step 1 originally
> read `destructive` `#b91c1c` / `destructiveEdge` `#710d0d`, following the plan.
> Both were wrong, and the reason is in §10 — the plan's red collapses the
> `MobileTokenMeter` escalation to **1.06:1**. The shipped pair is
> **`#991b1b` / `#5d0c0c`**. This is the one place the audit's own recommendation
> was overruled by a measurement the audit had not taken.

---

## 8. Out of scope, stated not forgotten

- **Visual verification on a device.** `@expo/ui` renders real SwiftUI / Jetpack
  Compose; this cannot be checked headlessly. The six components that change
  appearance are all already in the gallery (`actions`, `overlays`, `foundations`,
  `navigation`, `data`), so no new demo code is needed — but a human eye on
  `warning` at `#994e00` is the one thing no script replaces. A burnt amber is the
  unavoidable cost of §2's constraint.
- **Aligning mobile dark to web dark** (`#34d399` vs `#43b966`, etc.). Dark passes
  36/36. Pure churn unless the two systems are being unified deliberately.
- **The showcase's own layout.** `PRODUCT.md`'s "practice what the library
  preaches" is met; the specimen count is now 91 across 8 sections (the previous
  102/7 baseline predates the launcher-card restructure).
- **`apps/api`, `packages/cli`, `packages/db`.** No UI surface.

---

## 9. Reproduction

```bash
NODE=/Users/arham/.workbuddy-ai/binaries/node/versions/22.22.2-3/bin/node

# the gate — 19 failures on the shipped ramp
$NODE scripts/ui-audit/mobile-contrast.mjs

# everything, including the reference rows
$NODE scripts/ui-audit/mobile-contrast.mjs --all

# the gate is still clean under the proposed fix (inject -> PASS -> revert)
#   see §6 for the exact six literals

# typecheck
pnpm --filter @celestia-project/mobile typecheck

# the web gate, for contrast
$NODE scripts/ui-audit/run.mjs
```

One harness note for whoever runs this next, because it cost two iterations here:
**a check that can emit a uniform verdict is broken, not decisive.** The first
version of this gate had a parity lookup that dropped the `--` prefix from every
CSS variable name, so all 30 rows printed `(unparsed)` — and the second version
printed a derived-token `FAIL` while exiting 0. Both were caught by the same
discipline: keep a known-good value in the same run, and **inject the defect the
check exists to catch** before believing it.

---

## 10. What landed

The audit's follow-up was implemented as one change. Final state:

| Artifact | Change |
|---|---|
| `packages/mobile/src/tokens.ts` | **6** light literals + 2 new tokens (`overlay`, `shadow`) in both ramps + a `spacing` export and `SpacingStep` type + a "House rules" doc block. |
| `packages/mobile/src/components/composite/segmented-control.tsx` | `SEGMENT_HEIGHT = 36` + vertical-only `hitSlop`. |
| `packages/mobile/src/components/primitive/modal.tsx` | `#000000` @ 50% → `colors.overlay` @ 70%. |
| `packages/mobile/src/components/primitive/card.tsx` | hardcoded shadow → `colors.shadow`; dropped the now-unused `colorScheme`. |
| `packages/mobile/src/components/composite/speed-dial.tsx` | same shadow swap. |
| `apps/mobile/src/showcase/spacing.ts` | now re-exports the library's `spacing`. |
| `scripts/ui-audit/mobile-contrast.mjs` | + `deltaHue` helper, + the **gauge-step** assertion, + a non-failing **spacing census**. |
| `scripts/ui-audit/run.mjs` | `mobile-contrast.mjs` wired in as check 2 of 6. |
| `scripts/ui-audit/lint-coverage.mjs` | exemption reason for `mobile` corrected (M11). |
| `packages/mobile/README.md` | 71 → 157 modules; rules 11 → 15; Verification section rewritten. |
| `apps/web/content/docs/mobile.mdx` | rules 1–6 rewritten (ceiling, derived token, gauge, spacing, 44pt); rules renumbered 1–15. |
| `README.md` | `audit:ui` row names the mobile ramp and the two new contracts. |

**The correction that matters.** `PLAN-mobile-tokens.md` §5 and this audit's §7 both
recommended `destructive: #b91c1c`. On implementation it was measured against the
thing that actually renders it — `MobileTokenMeter`, which walks
`muted → warning → destructive` on a 4pt bar. `#b91c1c` (OKLCH L 0.5054) and
`warning #994e00` (L 0.5063) sit **0.0009** apart: contrast **1.06:1**, i.e. *worse*
than the 1.75:1 the change was meant to improve. §2's ceiling pins every status hue
to the same lightness, so the only freedom left is how far *below* the ceiling a
hue sits — and `#b91c1c` landed on the same rung as `warning`.

`#991b1b` (Tailwind red-800, L 0.4437) sits a full step lower: ΔL 0.0626, contrast
**1.363:1** — better than the web system's own 1.278:1. Its derived edge is
`#5d0c0c` (separation 1.659:1). **A finding that no contrast sweep would surface,
because both reds pass every WCAG pairing on their own** — the defect is only
visible in the *relationship* between two status hues. The gate now asserts that
relationship (`contrast ≥ 1.25:1` or `Δhue ≥ 40°` per step) so it cannot recur.

**Verification, final state:** `mobile-contrast.mjs` → **38/38 both themes, exit 0**;
`run.mjs` → **6/6 checks passing**; `pnpm --filter @celestia-project/mobile typecheck`
→ **exit 0**. Non-vacuity re-proved: injecting `destructive: #b91c1c` flips the
gauge assertion to `FAIL ... 1.06:1 need 1.25`; reverting restores `tokens.ts`
byte-identical and the gate to green.

**Honest limitation:** none of this is a device pass. `@expo/ui` renders real
SwiftUI / Jetpack Compose; `warning` at `#994e00` being a *burnt* amber rather than
a bright one is a visual judgement no script replaces. The six changed components
are all already in the gallery — that pass still needs a simulator.
