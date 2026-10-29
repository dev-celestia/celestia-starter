# Celestia — UI Audit Plan

> **Status: Phases A and C executed. Phase B is still blocked (§8).**
> Everything below is the plan as it was written; **§0.5 records what was
> actually done**, including the three places execution diverged from the plan
> and why. §3 is the "do not re-audit this" list. §4 is the measured findings.

---

## 0. Progress log

| Phase | Track | Status | Notes |
|---|---|---|---|
| **Recon** | — | ✅ **Done** | Surface inventoried; token layer read in full; 6 focus-ring sites located; contrast measured by script (§4). |
| **A — Static** | token layer + component rules | ✅ **Done** | F1, F3, F4 fixed. Compile, parity and contrast gates built and proved non-vacuous. |
| **B — Runtime** | hydration + overflow | ⬜ **Blocked** | Needs `pnpm install`, `apps/api` up, and a seeded user (§8). |
| **C — Process** | the gates that let this through | ✅ **Done** | Lint coverage guard wired into `pnpm lint`; focus-ring and feature-drift guards built. |

**Measured surface:** 18 routes · 5 layouts · 126 `packages/ui` components
(primitive 47 / composite 25 / ai 54) · 43 `packages/mobile` components ·
2 stylesheets (`packages/ui/src/styles/globals.css` 483 lines,
`apps/web/app/landing.css` 1050 lines) · **3 test files repo-wide, all in
`packages/feature-manager` — zero UI tests, and CI never runs `pnpm test`.**

---

## 0.5 What was executed

```
pnpm audit:ui
  PASS  contrast.mjs         token colour contrast, both themes
  PASS  token-parity.mjs     :root vs .dark parity, font hooks
  PASS  compile-tokens.mjs   stylesheet compiles, namespaces live
  PASS  focus-rings.mjs      focus rings are 2px at full strength
  PASS  feature-drift.mjs    no dead code written into packages/ui
  5/5 checks passing
```

### Fixes landed

| # | Finding | What was done |
|---|---|---|
| **F1** | 5 components with a diluted focus ring | Swept `ring-ring/30` → `ring-ring`, `ring-ring/50` → `ring-ring`, and `ring-[3px]` / `ring-1` → `ring-2`. Width before colour. |
| **F1b** | **new** — `chat-ai-section.tsx:474` carried `focus-within:ring-primary/20` | Surfaced by the guard on its first run, not by reading. Fixed to full strength. |
| **F3** | `blog` shipped a stale `textarea` copy | **Removed**, not regenerated — see deviation 1. |
| **F4** | landing hairline 1.12:1 against the surface | `--stroke` 12% → 15% (`#1f1f1f` → `#262626`), the smallest step that clears 1.2:1 on both the page and the surface. |
| **F5** | `pnpm lint` reached 3 of 10 workspaces | Coverage guard added and wired into `pnpm lint`; all 7 gaps now documented with a remedy. |
| — | **new** — the README claimed port 3000 | `apps/web` runs `next dev -p 1212`. Both references corrected. |

### Three deviations from the plan

**1. F3 was fixed by deletion, not regeneration.** The plan said "regenerate the
template from the canonical primitive". Reading both first showed that was wrong:
the canonical `primitive/textarea.tsx` has since gained a `leading` variant axis
and a `mono` prop, and the feature's `post-form.tsx` imports `Textarea` from the
**package barrel** — `index.ts:48` already exports it from `primitive/`. So the
copy was not a stale duplicate to refresh; it was **redundant by construction**,
writing an unreferenced file to a path the barrel does not export. Deleting the
copy entry and the template is the minimal correct fix and removes the drift
class permanently.

**2. The feature-drift guard was wrong twice before it was right.**

- **v1** failed on any template/target divergence → **13 violations across 4
  features, all legitimate.** After a feature is installed the app keeps evolving
  while the template stays at the installed generation; `add-feature --force`
  exists to overwrite exactly that. A guard that fails on the normal steady state
  gets disabled.
- **v2** added a basename-collision rule → flagged `types.ts` in `cms` and
  `media-r2`, a generic filename that will always collide. Two more false
  positives.
- **v3** states the actual rule: **a copy that writes a NEW file under
  `packages/ui/` is dead code unless the same feature also inserts an export into
  the barrel.** Zero false positives, and it catches F3.

**3. The contrast gate's reference rows are not assertions.** `ring-ring/30`
measuring 1.48:1 is the *justification* for the rule, not a regression — asserting
it would make the gate fail forever. Those rows print as `ref` and are excluded
from the exit code. The rule itself is enforced against class strings by
`focus-rings.mjs`.

### Every gate proved non-vacuous

Each was injected with the defect it exists to catch, confirmed to fail, then reverted.

| Gate | Injection | Result |
|---|---|---|
| `contrast.mjs` | `--muted-foreground` 0.54→0.62, `--ring` 0.55→0.708, `--stroke` back to 12% | 7 assertions FAIL — reproduced the documented **2.58:1** and **1.12:1** exactly |
| `compile-tokens.mjs` | `--transition-duration-fast` → the inert `--duration-fast` | `.duration-fast` MISSING, 15/16 emitted |
| `focus-rings.mjs` | re-injected `focus-within:ring-primary/20` | 1 FAIL, PASS on revert |
| `feature-drift.mjs` | restored the F3 copy entry plus its template | `DEAD CODE IN PUBLISHED PACKAGE` |

### Two harness bugs found while building the gates

Both are the same class of mistake, and both were caught only because a
known-good value was in the same run:

- **A uniform verdict is a broken check, not a decisive one.** The first contrast
  helper compared a ratio against the *string* `'3:1'` — `4.88 >= NaN` → false —
  so **every** row printed FAIL, including pairs that are provably fine.
- **CSS matching must strip comments first.** `token-parity.mjs` initially read
  the `@theme` block's own comment — which quotes
  `--font-sans: var(--font-sans)` verbatim *to warn about that exact mistake* — and
  reported a self-reference that does not exist.
- Also: `--elevation-edge` must be composited over the **page** before being
  compared against both the page and the control face. Compositing it over the
  face instead reports a flattering 1.79:1 and hides the documented 1.25:1.

### Environment limitation, stated honestly

`pnpm typecheck` for `packages/ui` reports **9 errors, all in
`composite/chart.tsx`**, because `recharts` is missing from the local partial
install. That file is unmodified and the failure is pre-existing — it is the same
blocked-install problem as §8. **Zero errors appear in any file this work
touched**; all six edited TSX files were parse-checked individually and are clean.

---

## 1. Goal

Find and fix the UI defects that **typecheck and build both pass over**. Both
audit skills are explicit about why this needs its own pass:

> `tsc --noEmit` and `next build` are necessary but prove almost nothing about a UI.

They cannot see hydration mismatches (React only reports those at runtime, in dev)
or responsive overflow (no tool reports it without a layout engine at a real width).

But the recon turned up something that changes the shape of this audit: **the
static layer is already in unusually good shape** (§3). The comments in
`globals.css` cite measured contrast ratios, and re-deriving them by script
reproduces the documented numbers *exactly*. So the value here is not
"audit the design system" — it is:

1. **Finish the sweep the token layer's own house rules demand** — the rule was
   written, applied to the primitives it was written for, and never swept across
   the other five components that violate it (F1, F2).
2. **Do the runtime pass that has never been done** — 18 routes × 7 widths (§5B).
3. **Close the gate that produced a false green** — `pnpm lint` reaches 3 of 10
   workspaces, and CI runs it (F5).

---

## 2. Scope

| In scope | Out of scope |
|---|---|
| `packages/ui` — token layer + component class strings | `packages/mobile` / `apps/mobile` — a separate native surface, needs a simulator (§9) |
| `apps/web` — 18 routes, 5 layouts, consumer `className`s | `apps/api` — backend; audited only for "is it up so the harness can sign in" |
| `features/*` — templates that get **copied into** the apps | `packages/cli`, `packages/db`, `packages/feature-manager` — no UI |
| CI wiring that lets these defects through | Visual redesign. §4 measures; it does not restyle |

`features/*` is in scope for a specific reason: a feature template is *code that
gets installed into an app*. A defect there is not one defect — it is one per
install, and it lands in a package whose own house rules forbid it (F3).

---

## 3. Already clean — do NOT re-audit

Re-derived by script (`/tmp/ui-audit-contrast.mjs`, OKLCH → sRGB → WCAG). Every
number below reproduces the ratio quoted in the `globals.css` comments, which is
itself evidence the comments are trustworthy.

| Check | Threshold | Light | Dark | Verdict |
|---|---|---|---|---|
| Dark ramp monotonicity | `bg < card < muted` | — | `#0a0a0a` < `#171717` < `#262626` | ✅ PASS |
| Focus ring, **full strength** vs bg | ≥ 3:1 | **4.88:1** | **4.18:1** | ✅ PASS |
| Focus ring, full vs card / muted | ≥ 3:1 | 4.88 / 4.48 | 3.78 / 3.19 | ✅ PASS |
| `muted-foreground` vs `muted` | ≥ 4.5:1 | **4.61:1** | **5.86:1** | ✅ PASS |
| `foreground` vs `background` | ≥ 4.5:1 | 19.80:1 | 18.97:1 | ✅ PASS |
| `success`/`warning`/`info` vs bg + muted | ≥ 4.5:1 | 4.98–6.10 | 5.52–7.89 | ✅ PASS |
| Elevation band vs page | ≥ 1.2:1 | 1.41:1 | 1.64:1 | ✅ PASS |
| Elevation band vs **own face** | ≥ 1.2:1 | 1.29:1 | 1.25:1 | ✅ PASS |
| Landing `text`/`fog` vs bg + surface | ≥ 4.5:1 | — | 5.13–18.16:1 | ✅ PASS |
| Landing `brand-foreground` on `brand` | ≥ 4.5:1 | — | 7.04:1 | ✅ PASS |
| Cross-palette base agreement | equal | — | both `#0a0a0a` | ✅ PASS |

Also verified clean, so **do not spend time here**:

- **No raw-palette literals in real code.** `bg-stone-50`-style hits: 6 files
  total, of which 4 are docs pages, 1 is `theme-customizer.tsx` (a colour picker
  — raw values are the *point*), and 1 is a single line in `callout.tsx`.
  The Step 8 "consumer palette sweep" is essentially a no-op.
- **The 963 arbitrary `text-[Npx]` values are gone.** 4 hits remain repo-wide:
  a comment in `globals.css`, one docs page, and two in `drawer.tsx`.
- **`--font-sans: var(--font-sans-family, …)` is correct** — the override hook is
  a *different* name, so it is not the self-reference trap.
- **The motion namespace is right** — `--transition-duration-*` in `@theme`, not
  `--duration-*` in `:root`. Raw `duration-*` hits: 4, all benign.
- **The regression the token layer documents reproduces exactly.** Old dark
  `--elevation-edge` (`rgb(0 0 0 / 50%)`) measures **1.03:1** — the documented bug,
  and the current `rgb(255 255 255 / 18%)` fixes it to 1.64:1. The fix is real.

**Conclusion:** Phases 1–7 of the token-layer skill are largely a *re-verification*
here, and should be run as a cheap regression gate rather than a hunt. The audit's
real yield is in §4 and §5B/§5C.

---

## 4. Confirmed findings

These are **measured or grepped**, not suspected.

### F1 — Diluted focus rings: 1.48:1 against a 3:1 requirement ⚠️ **highest severity**

`globals.css:37-38` states the house rule verbatim:

> Every focus ring is `focus-visible:ring-2 focus-visible:ring-ring` (2px, full
> strength). Diluted rings (`ring-ring/30`) fail WCAG 2.4.11.

The rule is violated in **five shipped components**:

| # | Site | Class | Width | Contrast vs bg |
|---|---|---|---|---|
| 1 | `primitive/input-otp.tsx:58` | `data-[active=true]:ring-ring/30` | 2px ✓ | **1.48:1** light / 1.38:1 dark |
| 2 | `primitive/calendar.tsx:212` | `ring-[3px] ring-ring/50` | **3px ✗** | **1.98:1** / 1.88:1 |
| 3 | `composite/input-group.tsx:17` | `…ring-2 …ring-ring/30` | 2px ✓ | **1.48:1** / 1.38:1 |
| 4 | `composite/combobox.tsx:224` | `focus-within:ring-2 focus-within:ring-ring/30` | 2px ✓ | **1.48:1** / 1.38:1 |
| 5 | `ai/attachment.tsx:10` | `focus-within:ring-1 focus-within:ring-ring/30` | **1px ✗** | **1.48:1** / 1.38:1 |
| 6 | `features/blog/ui/components/textarea.tsx:10` | `focus-visible:ring-2 focus-visible:ring-ring/30` | 2px ✓ | **1.48:1** / 1.38:1 |

Full strength measures **4.88:1** light / **4.18:1** dark. The dilution throws away
~70% of the contrast and lands *below* the 3:1 floor in both themes.

**Honest scoping of severity.** Sites 1–5 are `focus-within` / `data-[*]` wrapper
patterns, not `focus-visible`. A wrapper ring is a legitimate pattern — the defect
is the **dilution**, not the trigger. Site 6 is the only straight `focus-visible`
violation of the literal rule. Sites 2 and 5 additionally carry the wrong **width**
(3px and 1px against a 2px standard).

**Reachability is confirmed** for all six: each is the only visible focus
indicator for its control. This is not a latent pair.

**A seventh site was found during execution** — `apps/web/components/showcase/sections/chat-ai-section.tsx:474`
carried `focus-within:ring-primary/20` on the prompt-input demo. It was not in the
original grep because that grep looked for `ring-ring`, and this one dilutes a
*different* ring token. That is the argument for the class-string guard over
another grep: the rule is about dilution, not about one token name. Fixed in §0.5.

### F2 — `aria-invalid` ring is effectively invisible: 1.44:1

`aria-invalid:ring-2 aria-invalid:ring-destructive/20` appears on the same five
components. Composited: **1.44:1** light, **1.29:1** dark — far below 3:1.

**But this is mitigated, and the report should say so:** the same class list also
sets `aria-invalid:border-destructive` at **full strength**, so the invalid state
is perceivable through the border. The ring is decoration, not the signal.
→ Report as low severity / "optional tidy-up", not as a WCAG failure. (This is
exactly the skill's "check reachability before you fix a sub-threshold pair" rule.)

### F3 — A feature template ships a stale copy of a component, at a drifting path

`features/blog/ui/components/textarea.tsx` is a **copy of
`packages/ui/src/components/primitive/textarea.tsx` made before the ring fix**.
Side by side:

```
packages/ui/src/components/primitive/textarea.tsx:24   …focus-visible:ring-ring      ← fixed
features/blog/ui/components/textarea.tsx:10            …focus-visible:ring-ring/30   ← stale
```

Two separate problems:

1. **The stale copy** carries the F1 defect into every app that installs `blog`.
2. **The path drifts.** `features/blog/feature.json` copies it to
   `packages/ui/src/components/textarea.tsx` — but the canonical component lives at
   `packages/ui/src/components/**primitive**/textarea.tsx`. Installing the feature
   therefore produces **two textareas at two paths**, with different focus rings,
   and nothing typechecks or builds differently. No other feature copies into
   `packages/ui`, so this is a single instance — but it is a category worth a
   guard, because it will not stay single.

### F4 — Landing hairline is weaker against the surface than against the page

`landing.css` draws every card/panel/CTA border as
`1px solid hsl(var(--stroke))` on `hsl(var(--surface))`:

| Pair | Contrast | Hairline target |
|---|---|---|
| `stroke` vs `bg` (`#1f1f1f` on `#0a0a0a`) | 1.20:1 | ✅ at target |
| `stroke` vs `surface` (`#1f1f1f` on `#141414`) | **1.12:1** | ⚠️ below |

Cosmetic, low severity — but the *binding* constraint is the surface, which is the
same "measure against the face, not the page" trap the token layer already fixed
for the elevation band. The fix is one token nudge; it should be measured, not
eyeballed.

### F5 — `pnpm lint` reaches 3 of 10 workspaces, and CI runs it as a gate

Measured across every workspace:

| Workspace | lint | format | typecheck | test |
|---|---|---|---|---|
| `apps/api` | ✗ | ✗ | ✓ | ✗ |
| `apps/mobile` | ✗ | ✗ | ✓ | ✗ |
| `apps/web` | ✓ | ✓ | ✓ | ✗ |
| `packages/cli` | ✗ | ✗ | ✗ | ✗ |
| `packages/db` | ✗ | ✗ | ✓ | ✗ |
| `packages/eslint-config` | ✗ | ✗ | ✗ | ✗ |
| `packages/feature-manager` | ✓ | ✓ | ✓ | ✓ |
| `packages/mobile` | ✗ | ✗ | ✓ | ✗ |
| `packages/typescript-config` | ✗ | ✗ | ✗ | ✗ |
| `packages/ui` | ✓ | ✓ | ✓ | ✗ |

`.github/workflows/ci.yml:37-38` runs `pnpm lint` → `turbo lint` → **only `web`,
`feature-manager` and `ui`**. `apps/api` — the backend — is unlinted. So CI prints a
green lint step while 7 of 10 projects were never checked. Note the good news: the
**UI package is linted**, which is why the ring defects are class-string issues and
not lint-detectable ones — lint would not have caught F1 anyway.

**Zero UI tests exist.** The repo's only 3 test files are `feature-manager`
(`markers` / `manifest` / `lifecycle`). CI never runs `pnpm test` at all.

### F6 — Second stylesheet is undocumented in the docs site

`apps/web/app/landing.css` (1050 lines) is a second implementation of layout
primitives — `.container`, `.stack-*`, `.row-*`, `.cluster-*`, `.grid-auto*` — plus
its own type steps as raw `rem` (`0.8125rem`, `0.9375rem`). It is well-commented and
correctly **scoped under `.landing`** (the comment at line 174 explains that
unscoped `.container` would shadow Tailwind's own utility, and `feature-installer`
loads this file too — a real trap, already avoided).

It is not a defect. It is a **divergence worth documenting**: it duplicates a layout
vocabulary that `packages/ui` does not have, so the next person adding a section has
no way to know whether to reach for `.stack-lg` or Tailwind. Also note it already
contains the fix for the `space-between`-without-`wrap` overflow trap
(`.landing-panel-bar`, line 566, with the comment explaining exactly why).

---

## 5. The plan

Three tracks. **A** and **C** are independent and can run in parallel; **B** is
blocked on environment (§8).

### Phase A — Static: token layer + component rules

Cheap, and mostly a regression gate because §3 says the layer is clean.

| Step | Action | Why |
|---|---|---|
| **A1** | Compile `globals.css` standalone with the Tailwind v4 CLI in a scratch dir, stubbing `tw-animate-css` / `shadcn/tailwind.css`, with `@source "<abs>/packages/ui/src"` and `@source "<abs>/apps/web"`. | Catches custom-property **cycles** — Tailwind v4 does not error on them. Also the only way to prove a token namespace is live. |
| **A2** | Assert on `out.css`: no `--x: var(--x)` cycles (regex needs the trailing `[,)]` so `var(--font-sans-family, …)` is not a false positive); `bg-brand`, `text-destructive-foreground`, `bg-overlay`, `shadow-3d`, `rounded-xs`, `duration-fast`, `ease-out` are all **emitted**; `zzz-not-a-real-class` is **not** (detector control). | A control class is mandatory — a too-loose detector makes every assertion meaningless. |
| **A3** | Diff `:root` vs `.dark` token **names**. Expect `--overlay`, `--radius` and the whole landing palette to be `:root`-only. | Verify each is *documented* as deliberate before flagging. All are. |
| **A4** | Re-run `/tmp/ui-audit-contrast.mjs` as a committed regression gate. | It already reproduces every documented ratio. Turning it into a gate stops the next edit silently regressing `--muted-foreground` or `--elevation-edge`. |
| **A5** | **Fix F1** — sweep `ring-ring/30` → `ring-ring`, `ring-ring/50` → `ring-ring`, and normalise `ring-[3px]` / `ring-1` → `ring-2`, across the 6 sites. Order matters: **width before colour.** Then re-run with an empty replacement list to print survivors. | This is the audit's main deliverable. Survivors must be *deliberate* — e.g. a `ring-0` on an input nested inside a group that owns the ring. |
| **A6** | **Fix F3** — regenerate `features/blog/ui/components/textarea.tsx` from the canonical primitive, and correct the `copies` target in `features/blog/feature.json`. Then add a guard. | Otherwise the fix regresses on the next `add-feature`. |
| **A7** | **Fix F4** — nudge `--stroke` (or give surfaces their own border token) so the hairline clears 1.2:1 against **both** the page and the surface. Measure, don't guess. | Same trap the elevation band already fixed. |
| **A8** | Doc sync — the docs site must state the ring rule and the `landing.css` split (F6). | `AGENTS.md` makes docs mandatory when behaviour changes. |

**F2 is reported, not fixed** (mitigated by the full-strength border — see §4).

### Phase B — Runtime: hydration + overflow

**This is the track that finds defects no build step can see, and it has never been run.**

| Step | Action |
|---|---|
| **B0** | Claim **port 1212** explicitly (`lsof -tnP -iTCP:1212 -sTCP:LISTEN` → `kill -9`), `rm -f .next/dev/lock`, then boot `next dev`. Run **boot → warm → capture → kill inside one shell invocation** — a server started with `nohup … &` is reaped when the tool call returns. |
| **B1** | Start `apps/api` on **:4000** and smoke it. `next.config.ts` rewrites `/api/:path*` there, so **sign-in cannot work without it**. Seed one user. |
| **B2** | Warm **every** route with `curl` before measuring — a cold Turbopack compile emits `ERR_EMPTY_RESPONSE` on chunks and pollutes the console capture with noise that reads like real errors. |
| **B3** | Run the bundled harness — do not rewrite the CDP plumbing: `node scripts/ui-audit.mjs http://localhost:1212 /api/auth/sign-in/email <email> '<pw>' better-auth.session_token <routes> 375,420,600,768,900,1024,1280 '<route>\|<tab>\|<slug>,…'` |
| **B4** | Sweep **18 routes × 7 widths**, walking every tab. Tabs are scoped to the route that owns them (`route\|label\|slug`) — applying every label to every route produces spurious `NOT FOUND` noise and silently skips the real audit. Report `NOT FOUND` loudly. |
| **B5** | Classify, then fix. Expect the two documented classes: **nested `<button>`** (a row with `render={<button/>}` containing a real `Button` — fix with `role="button"` **only** for rows that have interactive children) and **Base UI `nativeButton={false}`** on every `Button render={<Link/>}`. |
| **B6** | Confirm — re-run console capture **and** overflow sweep. Report **counts**, not impressions: "0 errors across N routes, 0 overflowing elements across 7 widths." |

**Traps to carry into Phase B** (all documented, all expensive):

- **`captureBeyondViewport: true` drops SVG fills.** `packages/ui/src/components/ai/chart.tsx`
  is recharts-based, and `/design-system` renders a tokens viewer. A blank chart in
  a full-page capture is the screenshot lying, not the chart. Capture the viewport
  and grow the emulated height instead.
- **Never send the auth cookie unconditionally.** A stale cookie silently redirects
  `/sign-in` into the app, so the run looks *clean* because the wrong page really is
  clean. The harness's `goto()` probes by pathname — assert it.
- **Re-mint the session per run.** Better Auth rotates the token; a cached one 307s
  back to sign-in mid-sweep.
- **Ignore the Next dev-tools badge** (dark circle, bottom-left) — hide it with
  `nextjs-portal{display:none !important}` for clean captures; confirm any suspected
  overlap by measuring rects.
- **`cmd | tail; echo $?` reports `tail`'s exit code.** Run `tsc --noEmit` unpiped.
  `next build` is the real backstop — a green `tsc` plus a red build means `tsc` lied.
- **A CSS override on a `data-slot` may need a compound selector.** `landing.css:911`
  uses `.landing-ask [data-slot="input-group"]` (descendant) — correct here because
  `.landing-ask` is an ancestor. Confirm overrides with a computed-style read, never
  by reading the CSS.

### Phase C — Process: close the gates

Independent of A and B; **highest value per unit effort**, and it is the track that
stops all of this recurring.

| Step | Action |
|---|---|
| **C1** | Add `lint` + `format` scripts to `apps/api`, `apps/mobile`, `packages/mobile`, `packages/db`. Decide and document whether `packages/cli`, `eslint-config`, `typescript-config` should be exempt (a config-only package may legitimately have nothing to lint). |
| **C2** | Add `pnpm test` to CI, or explicitly document why it is absent. Today CI never runs tests, and there are no UI tests to run. |
| **C3** | Add a **class-string guard** for the ring rule (F1). A grep-level assertion that no `ring-ring/\d+` reaches a `focus-visible`/`focus-within`/`aria-invalid` ring is cheap, mechanical, and would have caught all 6 sites. |
| **C4** | Add a **template-drift guard** for F3: every `copies` target under `packages/ui/` in a `feature.json` must resolve to a path that either does not exist yet or is byte-identical to its source. |
| **C5** | Turn the contrast script (A4) into a committed check so the numbers in §3 cannot silently regress. |

---

## 6. Sequencing

```
C1 ─┐
C3 ─┼─► can start now, no blockers
C4 ─┘
A1 ─► A2 ─► A3 ─► A4 ─┐
A5 (F1, the main fix) ─┼─► A8 docs ─► DONE
A6 (F3) ──────────────┤
A7 (F4) ──────────────┘
B0 ─► B1 ─► B2 ─► B3 ─► B4 ─► B5 ─► B6   ← blocked on §8
```

Do **A5 before A8**: the docs should describe the swept state, not the broken one.
Do **B after A5** if possible — A5 changes focus rings, and B4's tab-walking will
exercise them.

---

## 7. Definition of done

| Gate | Target |
|---|---|
| `ring-ring/\d+` on any focus/invalid ring | **0 sites** (currently 6) |
| Compile gate (A2) | no cycles; every asserted utility emitted; control class absent |
| `:root` vs `.dark` parity | every unpaired name documented as deliberate |
| Contrast gate (A4) | all pairs ≥ threshold; regression list empty |
| Harness (B6) | **0** console errors, **0** overflowing elements across 18 routes × 7 widths |
| `tsc --noEmit` | 0 errors, **unpiped** |
| `next build` | green (the real backstop) |
| `pnpm lint` | reaches **all** non-exempt workspaces |
| Docs | `globals.css` ring rule + `landing.css` split both documented |
| `feature.json` copies | no target resolves to a divergent existing file |

---

## 8. Blockers & risks

| # | Blocker | Impact | Unblocks by |
|---|---|---|---|
| **B-1** | **`pnpm install` cannot complete, so the dependency tree is partial.** The broker denies the outbound tarball fetch (`ERR_PNPM_CODEBUDDY_BROKER_DENY`); `react-native` is not in the local store and has never been cached here. Disabling the sandbox does not help, and previously left the shell returning `SIGTERM (137)` on bare `echo`. **Measured symptom:** `apps/web/node_modules` holds **19 entries and no `next`**, so `next dev` cannot boot at all — Phase B has no server to point the harness at. | **Phase B cannot start.** Also blocks the two new mobile deps from the icon work. | Run on a networked machine: `pnpm install` at the root. |
| **B-2** | Phase B needs a **seeded user** and a live `apps/api` on :4000. `apps/api/.env` is **absent**, so the auth server has no `DATABASE_URL` / `BETTER_AUTH_SECRET` to start with. (`hono` and `drizzle-orm` *are* present, so the API's own tree is closer to usable than the web app's.) | Harness cannot sign in. | Create `apps/api/.env`, then `pnpm --filter @workspace/db db:push`, then seed. |
| **B-3** | `apps/web` dev port is **1212**, not 3000. | A harness run against :3000 hits a stale process or nothing. | Use 1212 explicitly (B0). |
| **R-1** | The ring sweep (A5) is a **class-string** change on 6 files, including 2 in the `ai/` tier. | A careless sweep could hit `ring-ring/30` inside a `has-[[data-slot]…]` variant and change a *non-focus* ring. | Report per-rule hit counts; run `--dry` first; re-run with an empty list to review survivors. |
| **R-2** | `landing.css` is 1050 lines and loaded by `feature-installer` too. | Any change there has a wider blast radius than "the landing page". | Measure before changing; keep changes to the one token (A7). |
| **R-3** | The `features/*` templates are **copies**. | Fixing `packages/ui` does not fix the template, and vice versa. | Fix both, then guard (C4). |

---

## 9. Out of scope (stated, not forgotten)

- **`packages/mobile` / `apps/mobile`.** 43 components, a separate token system
  (`tokens.ts`, `ColorRamp`), and a showcase that was just reworked to use
  Heroicons. Visual verification needs a simulator or device and **cannot be done
  headlessly** — the mobile PLAN already records this as a known limitation. The
  contrast script does not cover `lightColors` / `darkColors`; extending it there
  is a reasonable *follow-up*, not part of this audit.
- **`packages/cli`, `packages/db`.** No UI surface.
- **Visual redesign.** §4 measures. Where a value is deliberate (the Slider thumb's
  `bg-white`, the achromatic `--primary`, greyscale chart ramps) it gets **reported,
  not changed**.
- **`apps/api` business logic.** Only "is it up" matters here.

---

## Appendix — reproduction

```bash
# contrast measurements (§3, §4)
/Users/870041/.workbuddy-ai/binaries/node/versions/22.22.2-3/bin/node /tmp/ui-audit-contrast.mjs

# the 6 ring sites
rg -n "ring-ring/" --glob '!node_modules' --glob '!.next' packages apps features

# the lint gap (§4 F5)
for f in apps/*/package.json packages/*/package.json; do
  node -e 'const s=require("./"+process.argv[1]).scripts||{};console.log(process.argv[1],s.lint?"lint":"-",s.test?"test":"-")' "$f"
done

# the template divergence (§4 F3)
diff packages/ui/src/components/primitive/textarea.tsx \
     features/blog/ui/components/textarea.tsx
```

**A note on the harness, for whoever runs this next:** the contrast script's
verdict helper initially compared a ratio against the *string* `'3:1'`, i.e.
`4.88 >= NaN` → every row printed `FAIL`. It was caught only because §3's
known-good pairs also read `FAIL`. Any check that can report a uniform verdict
needs a **known-good control** in the same run — the same reason A2 asserts a
control class that must be *absent*.
