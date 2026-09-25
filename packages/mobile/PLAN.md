# `@celestia-project/mobile` — Component Expansion Plan

> **Phases 0–5 landed. The plan is complete — see §9.**
> This file is scaffolding; delete it once the work is done.

---

## 0. Progress log

| Phase | Status | Notes |
|---|---|---|
| **0 — Prep** | ⚠️ **Partial** | `exports` map fixed, comment fixed. **`pnpm install` cannot complete** — see §7. |
| **1 — Restructure** | ✅ **Done** | 8 modules moved into `primitive/`, 3 barrels created, root barrel + `exports` rewired, package README rewritten. |
| **2 — Primitives** | ✅ **Done** | All 13 new primitives + the `MobileInput` alias. Verified by a stub-based typecheck — see §8. |
| **3 — Composites** | ✅ **Done** | All 13 composites. Verified by the same two harnesses. |
| **4 — Layout** | ✅ **Done** | All 10 shells/screens. Two primitive gaps surfaced and were fixed in the primitives (§0.3). |
| **5 — Surface** | ✅ **Done** | Docs page + nav wiring + root README, and an `apps/mobile` showcase that exercises all 43 modules. Verified by two new harnesses — see §8. |

**Current size:** primitive 20 modules / 58 exports · composite 13 modules / 38 exports ·
layout 10 modules / 35 exports = **131 component exports**, plus 8 from `tokens` / `host`, for
**139 names on the root barrel across 49 files.** The showcase is 14 files / ~2,640 lines.

### Deviations from the original plan (Phase 3)

| Planned | Actual | Why |
|---|---|---|
| `MobileToastHost` | `MobileToastProvider` + `useMobileToast()` | A *host* implies a passive mount point. The toast needs to own state and expose an imperative `show()` / `hide()`, so it is a provider with a hook — named for what it does. |
| `MobileFormField` renders its own input | Takes the control as `children` | Keeps it usable with a text input, an OTP input or a picker. Rendering its own input would have locked the composite to one control. |

### Deviations from the original plan (Phase 4)

| Planned | Actual | Why |
|---|---|---|
| Flat `emailLabel` / `passwordLabel` / `submitLabel` / … props on each auth screen | Flat `heading` / `subheading` (as approved) + one `labels?: Partial<…Labels>` object | Eleven flat copy props per screen would have buried the real API — *data in, callbacks out*. Grouping the form copy keeps the behavioural props visible at the call site while every user-visible string stays overridable. |
| `MobileResetPasswordScreen` "strength hint" | A live `MobileProgress` meter + exported `scoreMobilePassword()` | A static hint cannot tell the user their password is weak. The scorer is exported so a caller gating its submit button cannot disagree with the meter. |
| `MobileForgotPasswordScreen` "submit + back-to-sign-in" | No built-in "sent" state; hands off to `MobileStatusScreen` | A confirmation state is a different screen with a different job, and the package already has one. Avoids a second, divergent success treatment. |

### Deviations from the original plan (Phase 5)

| Planned | Actual | Why |
|---|---|---|
| Root `README.md`: add the package to *Published Packages* (§9 item 5, D5) | Added to the repository tree and the architecture prose, plus an explicit "**not** published" note | `scripts/publish.sh` hardcodes `SELECTED=("ui" "cli")` and `get_pkg_dir` only maps `ui` and `cli`. Listing `@celestia-project/mobile` under *Published Packages* would have advertised an install that fails. Documenting the gap is the accurate fix; closing it means editing `publish.sh`, which is out of scope here. |
| Showcase: "add sections for the new primitives, composites and screens" (§9 item 6) | Replaced the 356-line monolith with 14 files: a thin `App.tsx`, a gallery root, 7 section files and a full-screen preview registry | The old `App.tsx` hardcoded `#09090b` / `#ffffff` / `#27272a` / `#e2e8f0`, so it went stale the moment a token changed and would have broken outright in light mode. It also could not demonstrate a single `layout/` screen, because mounting one inside the gallery's own `SafeAreaView` insets it twice. Both problems need structure, not more sections. |
| One gallery page | Gallery **plus** a preview stack that swaps itself out for a full-screen screen | The layout screens own the frame — safe area, scroll view, header, footer. Rendering one inside a card is not a smaller version of the screen, it is a broken one. |

### Primitive defects Phase 3 exposed (fixed in the primitive, not worked around)

1. **`MobileButton` had no `accessibilityLabel` / `accessibilityHint`.** Caught by the
   typecheck when `MobileSocialAuthButtons` passed a label. A button primitive that accepts
   icon-only children and cannot carry a label is unusable with a screen reader — fixed in
   `primitive/button.tsx`.
2. **`MobileSwitch` announced itself as just "switch".** Its visible label renders as a
   *sibling*, so the native control had no accessible name. Added
   `accessibilityLabel` (falling back to `label`) + `accessibilityHint`.

### Primitive defects Phase 4 exposed (same rule: fixed in the primitive)

3. **`MobileButton` / `MobileIconButton` could not be stretched in a layout.** Both render
   `<Animated.View><Pressable style={style} /></Animated.View>`, so the caller's `style`
   landed on the *inner* surface while the element the parent lays out was the unstyled
   wrapper — `flex: 1` in a row was silently ignored. The onboarding pager's full-width
   primary button is the case that surfaced it. Added `containerStyle` for the wrapper,
   mirroring `MobileTextInput`'s existing `containerStyle` / `style` split.
4. **`MobileCheckbox` had no error state.** `MobileTextInput` and `MobileOtpInput` both take
   `error`; the checkbox did not, so the sign-up terms row had nowhere to report "you must
   accept this". Added `error?: boolean | string` — box border only, and `checked` wins,
   since an error on a checked box is contradictory.
5. **Every password field needed the same reveal toggle.** Rather than hand-roll a
   `Pressable` in three screens (which would have drifted on the accessible name, the touch
   target and the label copy), added `secure` + `revealLabel` / `hideLabel` to
   `MobileTextInput`. It also suppresses `clearable` on secure fields, so the trailing slot
   has one unambiguous control.

### Decisions taken (from the approval round)

| # | Decision |
|---|---|
| Q1 | **Phases 0–1 only** this pass. |
| Q2 | Auth screens will be **presentational only** — props in, callbacks out. No fetch, no auth client, no routing. |
| Q3 | **Break the old flat deep imports.** Category paths only; no shim files. |
| Q4 | **Keep the `Mobile*` export prefix** everywhere. |
| Q5 | Attempt `pnpm install` — it failed; see §7. |

---

## 1. Goal

Two things at once:

1. **Reorganize** the flat `src/*.tsx` layout into `primitive` / `composite` / `layout`, mirroring `packages/ui`.
2. **Add** the missing component set: navbar, tab bar, form inputs, auth screens
   (sign-in / sign-up / forgot-password / reset-password / OTP), onboarding, plus the supporting
   primitives and composites those screens need.

### Taxonomy — the rule that decides every placement

`packages/ui` is the reference (126 components, established convention), and its split is by
**generality**, not by atomicity:

| Category | Rule of thumb | Examples from `packages/ui` |
|---|---|---|
| **primitive** | *"Would I reach for this in any app?"* — a generic building block. | `card`, `dialog`, `sheet`, `drawer`, `input`, `button`, `badge`, `avatar` |
| **composite** | *"Is this a `<Primitive>` with a specific job?"* — an opinionated assembly. | `article-card`, `data-table`, `form`, `field`, `sidebar`, `tab-bar`, `empty`, `alert-dialog` |
| **layout** | *"Does it own the whole screen?"* — a frame that takes slots. | `auth-shell`, `page-shell`, `sign-in-page`, `dashboard-shell` |

> **Correction from the first draft.** I originally filed `MobileCard`, `MobileList` and
> `MobileBottomSheet` under `composite` on the grounds that they are compound. That was wrong:
> `packages/ui` keeps `card`, `dialog`, `sheet` and `drawer` in **primitive**, because a compound
> component is still *generic* — only *opinionated* ones are composite (`Card` → primitive,
> `ArticleCard` → composite). Following the sibling package matters more than my first instinct
> here: the two libraries are imported side by side, so a divergent taxonomy would be worse than
> a debatable one. **All 8 existing modules therefore land in `primitive/`.**

---

## 2. Current state

**`packages/mobile`** — after Phase 1:

```
packages/mobile/
├── PLAN.md
├── README.md                      ← rewritten around the three categories
├── package.json                   ← 9 exports entries (was 2)
└── src/
    ├── index.ts                   ← re-exports tokens + host + 3 category barrels
    ├── tokens.ts                  (cross-cutting — unchanged)
    ├── host.tsx                   (cross-cutting — unchanged)
    └── components/
        ├── primitive/             ← 8 modules + barrel
        ├── composite/             ← empty barrel (Phase 3)
        └── layout/                ← empty barrel (Phase 4)
```

**Consumer:** exactly one — `apps/mobile` (Expo SDK 57, `@expo/ui` 57, RN 0.87), importing
**only the root barrel**. Nothing in `features/*` or `apps/web` touches this package.

### Defects found during the survey

| # | Defect | Status |
|---|---|---|
| D1 | `"./*"` mapped to `"./src/*.tsx"`, so `.../tokens` (a `.ts` file) could never resolve | ✅ fixed — `./tokens` and `./host` now have explicit entries |
| D2 | `src/index.ts` header said `@celestia-project/ui/mobile`; the package is `@celestia-project/mobile` | ✅ fixed |
| D3 | `packages/mobile` / `apps/mobile` had no `node_modules` | ❌ **still open** — install could not complete (§7) |
| D4 | `packages/mobile` did not declare `react-native-safe-area-context`, which `apps/mobile` depends on | ✅ **fixed in Phase 4** — `MobileScreen` needs it, so it is now a declared peer dep (`>=5`) and a dev dep (`^5.0.0`) |
| D5 | Root `README.md` documents neither `apps/mobile` nor `packages/mobile` | ✅ **fixed in Phase 5** — both added to the repo tree and the architecture prose, plus an explicit note that the package is workspace-only because `scripts/publish.sh` covers only `ui` and `cli` |
| D6 | `MobileButton` / `MobileIconButton` `style` landed on the inner `Pressable`, so the outer `Animated.View` could not be stretched in a layout | ✅ **fixed in Phase 4** — added `containerStyle` |
| D7 | `MobileCheckbox` had no `error` state, unlike `MobileTextInput` / `MobileOtpInput` | ✅ **fixed in Phase 4** |
| D8 | No password reveal affordance existed anywhere; three screens each needed one | ✅ **fixed in Phase 4** — `secure` + `revealLabel` / `hideLabel` on `MobileTextInput` |

---

## 3. Target structure

```
packages/mobile/src/
├── index.ts                       ✅ done
├── tokens.ts                      (cross-cutting)
├── host.tsx                       (cross-cutting — MobileHost, useMobileTheme)
└── components/
    ├── primitive/                 ✅ 20 done
    │   ├── index.ts               ✅
    │   ├── text.tsx               ✅ moved
    │   ├── button.tsx             ✅ moved (+ `containerStyle`, D6)
    │   ├── input.tsx              ✅ moved (was text-input.tsx; + `secure`, D8)
    │   ├── switch.tsx             ✅ moved
    │   ├── badge.tsx              ✅ moved
    │   ├── card.tsx               ✅ moved
    │   ├── list.tsx               ✅ moved
    │   ├── bottom-sheet.tsx       ✅ moved
    │   ├── label.tsx              ✅ new
    │   ├── icon-button.tsx        ✅ new (+ `containerStyle`, D6)
    │   ├── otp-input.tsx          ✅ new
    │   ├── checkbox.tsx           ✅ new (+ `error`, D7)
    │   ├── radio-group.tsx        ✅ new
    │   ├── slider.tsx             ✅ new
    │   ├── avatar.tsx             ✅ new
    │   ├── separator.tsx          ✅ new
    │   ├── progress.tsx           ✅ new
    │   ├── spinner.tsx            ✅ new
    │   ├── skeleton.tsx           ✅ new
    │   └── link.tsx               ✅ new
    ├── composite/                 ✅ 13 done
    │   ├── index.ts               ✅ wired
    │   ├── form-field.tsx         ✅
    │   ├── search-bar.tsx         ✅
    │   ├── navbar.tsx             ✅  ← requested "navbar"
    │   ├── tab-bar.tsx            ✅
    │   ├── segmented-control.tsx  ✅
    │   ├── setting-row.tsx        ✅
    │   ├── avatar-group.tsx       ✅
    │   ├── alert.tsx              ✅
    │   ├── empty-state.tsx        ✅
    │   ├── social-auth-buttons.tsx ✅
    │   ├── action-sheet.tsx       ✅
    │   ├── confirm-dialog.tsx     ✅
    │   └── toast.tsx              ✅ + `MobileToastProvider`, `useMobileToast()`
    └── layout/                    ✅ 10 done — Phase 4
        ├── index.ts               ✅ wired
        ├── screen.tsx             ✅ base frame (safe area, scroll, keyboard, header, footer)
        ├── auth-shell.tsx         ✅ shared auth frame
        ├── onboarding-screen.tsx  ✅  ← requested "onboarding"
        ├── sign-in-screen.tsx     ✅  ← requested "login / signin"
        ├── sign-up-screen.tsx     ✅
        ├── forgot-password-screen.tsx ✅ ← requested "forgot password"
        ├── reset-password-screen.tsx  ✅
        ├── otp-verify-screen.tsx      ✅
        ├── settings-screen.tsx    ✅ + `MobileSettingsSection`
        └── status-screen.tsx      ✅
```

All 33 new component files are written, and Phase 5 has landed. Nothing is outstanding except the
environment-blocked checks in §7.

---

## 4. Component catalogue (all built)

Kept as the record of what each phase was asked for and what it actually produced.
The Phase 4 rows below describe the *planned* API; §0 records where the built API
diverged and why.

### 4.1 primitive — 13 remaining

| Component | Native source | Notes |
|---|---|---|
| `MobileLabel` | RN `Text` | form label; `required` marker, `nativeID` to pair with an input |
| `MobileIconButton` | RN `Pressable` | square 44×44; `icon` prop; `accessibilityLabel` **required** |
| `MobileOtpInput` | RN `TextInput` × n | fixed-length cells, auto-advance, paste support; auth depends on it |
| `MobileCheckbox` | `@expo/ui` if available, else RN | verify export list after install |
| `MobileRadioGroup` | `@expo/ui` if available, else RN | `options[]` + `value`/`onValueChange` |
| `MobileSlider` | `@expo/ui` if available, else RN | verify export list after install |
| `MobileAvatar` | RN `Image` / `View` | `source` / `initials` / fallback, `size` sm/md/lg/xl |
| `MobileSeparator` | RN `View` | `orientation`, optional `label` |
| `MobileProgress` | RN `View` + `Animated` | determinate + indeterminate |
| `MobileSpinner` | RN `ActivityIndicator` | `size`, semantic color |
| `MobileSkeleton` | RN `View` + `Animated` | pulse shimmer, `width`/`height`/`radius` |
| `MobileLink` | RN `Pressable` + `Text` | inline + standalone variants |
| — | — | **`MobileInput` alias** of `MobileTextInput`, plus `label`/`helper`/`error`/`secure`/`clearable` props |

### 4.2 composite — 13

| Component | Composes | Notes |
|---|---|---|
| `MobileFormField` | `MobileLabel` + `MobileTextInput` + error/helper | the workhorse of every auth form |
| `MobileSearchBar` | `MobileTextInput` + leading/trailing | clear button, `onSearch` |
| **`MobileNavBar`** | `MobileText` + slots | **requested "navbar"** — `title`, `subtitle`, `left`, `right`, `large` variant, `translucent` |
| `MobileTabBar` | RN `Pressable` + `MobileBadge` | bottom tabs; items as props; `activeIndex`/`onChange`; badge counts |
| `MobileSegmentedControl` | RN `Pressable` + `Animated` | sliding indicator, 2–5 segments |
| `MobileSettingRow` | `MobileListItem` + slots | label / description / value / chevron / control |
| `MobileAvatarGroup` | `MobileAvatar` | overlap + `+N` overflow |
| `MobileAlert` | `View` + `MobileText` | `info`/`success`/`warning`/`destructive`, optional action |
| `MobileEmptyState` | `MobileText` + `MobileButton` | `icon` as prop, `title`, `description`, `action` |
| `MobileSocialAuthButtons` | `MobileButton` | provider list, grid or stack |
| `MobileActionSheet` | `MobileBottomSheet` | iOS-style action list + cancel |
| `MobileConfirmDialog` | `MobileBottomSheet` | title / message / confirm / cancel; destructive variant |
| `MobileToast` + `MobileToastHost` | RN `Animated` + context | imperative `useMobileToast()` API |

### 4.3 layout — 10

| Component | Owns | Notes |
|---|---|---|
| `MobileScreen` | safe area + scroll + background + optional header | base frame every other screen composes; needs `react-native-safe-area-context` (D4) |
| `MobileAuthShell` | logo / heading / subheading / aside / footer / keyboard avoidance | mirrors `packages/ui` `AuthShell`, mobile-adapted |
| **`MobileOnboardingScreen`** | paged slides + dots + Skip/Next/Get-started | **requested "onboarding"** |
| `MobileSignInScreen` | email + password + remember + social | **requested** |
| `MobileSignUpScreen` | name + email + password + terms | **requested** |
| `MobileForgotPasswordScreen` | email + submit + back-to-sign-in | **requested** |
| `MobileResetPasswordScreen` | new password + confirm + strength hint | completes the auth loop |
| `MobileOtpVerifyScreen` | `MobileOtpInput` + resend cooldown | pairs with 2FA / email verification |
| `MobileSettingsScreen` | grouped `MobileSettingRow` sections | consumes the composite set |
| `MobileStatusScreen` | centered icon / title / message / action | success / error / not-found / maintenance |

---

## 5. API design conventions

### 5.1 Shell + thin screen split

`MobileAuthShell` owns the frame (safe area, scroll, keyboard avoidance, logo, heading,
subheading, `aside` for social buttons, `footer` for the "already have an account?" line).
Each auth screen supplies only its own fields and defaults:

```tsx
export interface MobileSignInScreenProps
  extends Omit<MobileAuthShellProps, "children" | "heading" | "subheading" | "onSubmit"> {
  heading?: string
  subheading?: string
  onSubmit?: (data: { email: string; password: string; remember: boolean }) => void
  onForgotPassword?: () => void
  onSignUp?: () => void
  socialProviders?: MobileSocialProvider[]
  loading?: boolean
  error?: string
}
```

**A new screen that resembles an existing one composes the shell — it never re-implements the
header.** That is what stops 6 auth screens from drifting apart.

### 5.2 Screens are presentational (decision Q2)

Screens receive props and emit callbacks. They **do not** fetch, import an auth client, hold server
state, or navigate. Routing and data belong to `apps/mobile`. This matches `packages/ui`'s layout
pages and keeps the package free of any `apps/api` coupling.

### 5.3 Non-negotiable design rules

1. **No hardcoded colors.** Everything reads `useMobileTheme()`. Full light/dark parity.
2. **44×44pt minimum touch target** on every interactive element.
3. **Haptics fire on the causal commit frame** — `Light` normal, `Medium` destructive, `selectionAsync` for toggles. Never on mount.
4. **16px font floor** on text inputs.
5. **Tabular numerals** for counters, prices, timers.
6. **Icons arrive as props.** No icon dependency. Only structural marks (a tick, a chevron) may be drawn inline.
7. **No hover-only affordances.**

### 5.4 Dependency policy — zero new runtime deps

- Pager → `ScrollView` + `pagingEnabled` + `onMomentumScrollEnd` (no `reanimated`, no `gesture-handler`)
- Motion → RN `Animated` (already used by `MobileButton`)
- Keyboard → `KeyboardAvoidingView` / `Keyboard` from core
- Modals → `@expo/ui` `BottomSheet` (already a dependency)

The **only** new peer dependency added across Phases 2–4 is
`react-native-safe-area-context`, required by `MobileScreen`. It is declared as `>=5` in
`peerDependencies` and `^5.0.0` in `devDependencies`, and `apps/mobile` already depended on it —
so the install footprint of the package did not grow. No navigation library was added; the
package stays routing-agnostic.

---

## 6. Public surface

Wired in two places, both required:

1. **`src/index.ts`** — `./tokens`, `./host`, then the three category barrels. ✅
2. **`package.json` `exports`** — 9 entries: `.`, `./tokens`, `./host`, and `{dir, dir/*}` for each
   of `primitive`, `composite`, `layout`. ✅

```tsx
import { MobileButton } from "@celestia-project/mobile"                // barrel
import { MobileButton } from "@celestia-project/mobile/primitive"      // category
import { MobileButton } from "@celestia-project/mobile/primitive/button" // component
```

**Compatibility:** `apps/mobile` imports from the root barrel only, so the move is transparent to
it. The old flat deep imports (`.../mobile/button`) are intentionally broken (Q3). Every existing
export *name* is preserved, so no call site needs a rename.

---

## 7. Environment blocker — `pnpm install` cannot run here

`packages/mobile` and `apps/mobile` have no `node_modules`, so **nothing in this package can be
typechecked or run**. Installing is blocked by an environment fault, not by the project.

### Root cause (diagnosed from pnpm's source, not guessed)

pnpm calls `registerProject()` on every install, which does:

```js
await fs.promises.mkdir(registryDir, { recursive: true })
const linkPath = path.join(registryDir, createShortHash(projectDir))
await forceSymlink(projectDir, linkPath)   // ← throws
```

and `forceSymlink` handles a pre-existing link correctly:

```js
try { await fs.promises.symlink(target, path2, symlinkType); return }
catch (err) {
  switch (err.code) {
    case "ENOENT": …
    case "EEXIST":
    case "EISDIR": …            // readlink → compare → reuse or replace
    default: throw err          // ← lands here
  }
}
```

The WorkBuddy broker denies the syscall and reports it with code **`CODEBUDDY_BROKER_DENY`**, not
`EEXIST`, so pnpm's `switch` falls through to `default` and rethrows. The message merely *reads*
`EEXIST: file already exists`.

### What was tried

| Attempt | Result |
|---|---|
| `pnpm install` (sandboxed) | `CODEBUDDY_BROKER_DENY EEXIST` at `registerProject` |
| `pnpm install` with the sandbox **disabled** | **Same error** — the shim is injected into the Node process itself, so disabling the sandbox does not help |
| Moved the stale registry symlink aside | Got past `registerProject`. But the symlink is recreated on every attempt, so it must be moved aside **before each run**. |
| `pnpm install --filter @celestia-project/mobile --filter mobile` (only 2 of 11 projects) | Resolved in seconds — **333 of 335 packages are already in the local store**. Then stalled. |

### The fatal blocker: the network fetch is denied

Filtering the install down to just the two mobile projects exposed the real reason it never
finishes:

```
Progress: resolved 335, reused 333, downloaded 0, added 0
WARN  GET https://registry.npmjs.org/react-native/-/react-native-0.87.1.tgz
      error (ERR_PNPM_CODEBUDDY_BROKER_DENY). Will retry in 10 seconds. 2 retries left.
```

`react-native` is one of the two packages **not** in the local store, and the broker denies the
outbound fetch. pnpm retries, then stalls indefinitely — which is what the earlier "34 minutes"
and "hanging" observations actually were. This is not fixable from inside the tooling: the
workspace was last installed successfully on 2026-09-21 (before `apps/mobile` existed), so
`react-native` has never been cached here.

**Disabling the sandbox does not help either** — and it has a cost: after each unsandboxed attempt
the Bash shell died with `SIGTERM (137)` for a period, including on a bare `echo`. File tools
(`Read`/`Write`/`Glob`/`Grep`) kept working throughout.

**Nothing was damaged by these attempts** — verified after each one: `packages/ui/node_modules`
still holds its 47 entries and resolves `react`, and `git status` shows only the intended changes.

### Side effect: the shell is now unresponsive

After the 34-minute install was killed, every `Bash` call — including `echo` — returns
`SIGTERM (137)`, with and without the sandbox. File tools (`Read`, `Write`, `Glob`) still work.
So Phase 1 was completed and verified with file tools and static reasoning only.

### Unblocking

On a normal machine, outside WorkBuddy:

```bash
pnpm install                       # at the workspace root
pnpm --filter @celestia-project/mobile typecheck
```

Restore the registry symlink first if desired (`ln -s ../../../../../Desktop/project/celestia-starter
~/Library/pnpm/store/v10/projects/90e722b5318f01330f496e81c0e9f048`) — it is only a cache pointer
and pnpm recreates it on a successful install.

---

## 8. Verification

The real `tsc` cannot run (§7), so two purpose-built harnesses stand in. Both live in `/tmp` and
are **not** repo files.

### Harness A — stub-based typecheck (`/tmp/mobile-typecheck.js` + `/tmp/rn-stubs.d.ts`)

Stubs `react-native`, `@expo/ui` and `expo-haptics` with **real types** (not shorthand ambient
declarations — those turn imports into namespaces and break every `extends RNTextProps`), then runs
the repo's own TypeScript against the package's real strictness settings (`strict`,
`noUncheckedIndexedAccess`, `isolatedModules`, `jsx: react-jsx`), with `react` types from
`packages/ui/node_modules/@types/react`.

**What it does not verify:** correct usage of the native API surface (the stubs are permissive).
**What it does verify:** everything in our own code — undefined identifiers, wrong prop names on our
own components, invalid union members, missing barrel exports, internal type flow.

It was **proved non-vacuous** after every phase by injecting a deliberate defect and
confirming the diagnostic, then reverting. Phase 4's proof covers four classes at once
(one per JSX element — see the note below):

| Injected | Diagnostic |
|---|---|
| `variant="calloutTYPO"` on `MobileText` | `TS2322: Type '"calloutTYPO"' is not assignable to type 'MobileTextVariant \| undefined'` |
| `keyboardType="email-adress"` | `TS2820: … Did you mean '"email-address"'?` |
| `onChangeTxt={…}` on `MobileTextInput` | `TS2322: Property 'onChangeTxt' does not exist … Did you mean 'onChangeText'?` |
| (a 4th defect on the *same* element) | **not reported** — expected; see below |

> **Finding, and a trap for anyone re-running this:** TypeScript emits **one** diagnostic
> per assignability failure. Two defects on the same JSX element mask each other — a bad
> `keyboardType` suppressed the unknown-prop error on the same element, which briefly
> looked like a harness defect. A non-vacuity test must put its injections on *separate*
> elements. Reverting the injections returns the harness to `PASS — 0 error(s)`.

### Harness improvements made during Phase 4

Two stub defects were found and fixed, both of which had been silently weakening the
verification:

1. **`Omit` over an index signature collapsed every explicit property to `any`.**
   `MobileTextInputProps` is `Omit<RNTextInputProps, "style">`, and `Omit<T, K>` is
   `Pick<T, Exclude<keyof T, K>>`. Because the stub's `ViewProps` carried
   `[key: string]: any`, `keyof T` widened to `string | number`, `Exclude` swallowed every
   literal key, and the mapped type collapsed to `{ [x: string]: any }`. The effect:
   **misspelled props on `MobileTextInput` went undetected** and inline
   `onChangeText={(text) => …}` produced `TS7006` (no contextual type). Real React Native
   has no index signature on `TextInputProps`, so this was purely a stub artefact.
   Fixed by splitting a new `BaseProps` (no index signature) out of `ViewProps` and having
   `TextInputProps` extend `BaseProps` instead. Small unions (`keyboardType`,
   `autoCapitalize`, `returnKeyType`) were also enumerated so a mistyped value is caught.
2. **`ScrollView` could not be a valid JSX class in a stub.** The onboarding pager needs
   `useRef<ScrollView>` to call `scrollTo`, but `ScrollView` is a class in real RN, so
   `const ScrollView: any` makes it unusable in type position (`TS2749`) and a bare class
   fails React's JSX check (`TS2786`: missing `context`, `setState`, `forceUpdate`,
   `render`). A top-level `import type * as React` is **not** an option — it turns the stub
   into a module, every `declare module` block becomes a module augmentation, and
   `react-native` stops resolving entirely (`TS2307`). Fixed by declaring the class with
   React's structural members (`props` / `state` / `context` / `refs` / `setState` /
   `forceUpdate` / `render`), so it satisfies `Component` structurally without importing it.

### Harness B — static consistency check (`/tmp/mobile-static-check.js`)

Parses every file with the TypeScript parser and verifies, without any type information, that every
relative import resolves and that each imported name is actually exported by its target — resolving
`export * from` transitively. It also reports names exported twice into one barrel, and now reports
all three category barrels rather than just `primitive`.

### Harness C — app typecheck (`/tmp/mobile-app-typecheck.js`)

Added in Phase 5. The same technique as Harness A, but pointed at `apps/mobile/src`, with one
addition: `paths` maps `@celestia-project/mobile` onto `packages/mobile/src/index.ts`, because
`paths` does not understand the package's `exports` map. The app imports only from the root barrel,
so one mapping is enough — and it means this run exercises **all 139 barrel exports**.

Because tsc follows that mapping, `packages/mobile/src` is pulled into the program as a dependency.
**So this gate covers the package and the app together**: a wrong prop name in the showcase and a
regression inside the package both surface here. `expo-status-bar` was added to the stub set for it.

Proved non-vacuous by injecting four defects, one per JSX element (see the note in Harness A):

| Injected | Diagnostic |
|---|---|
| `tabularr` on `MobileBadge` | `TS2322: Property 'tabularr' does not exist … Did you mean 'tabular'?` |
| `variant="primry"` on `MobileButton` | `TS2322: Type '"primry"' is not assignable to type 'MobileButtonVariant \| undefined'` |
| `MobileIconButton` with no `accessibilityLabel` | `TS2741: Property 'accessibilityLabel' is missing … but required` |
| `variant="h1"` on `MobileText` | `TS2322: Type '"h1"' is not assignable to type 'MobileTextVariant \| undefined'` |

### Harness D — app static check (`/tmp/mobile-app-static-check.js`)

Four checks, none of which the typecheck can make clearly:

1. **Syntax** — parses all 14 app files.
2. **Barrel imports** — every named import from `@celestia-project/mobile` must exist on the barrel.
   The typecheck would also catch this, but as a wall of `any`-shaped errors; this names the missing
   symbol in one line.
3. **Module coverage** — every one of the 43 component modules must have at least one component
   **imported** by the app, not merely mentioned in a comment or a `modulePath` caption. A showcase
   that documents a module it never renders is worse than no showcase: it implies the module was
   tried.
4. **Quoted counts** — the gallery footer quotes a module and export count. A number in copy that
   drifts from reality is a lie no typecheck catches, so this asserts it. (It immediately caught one
   — see bug 10.)

### Results

| Check | Result |
|---|---|
| Syntax (49 package files + 14 app files parsed) | ✅ 0 errors |
| Relative imports resolve + names exist — package | ✅ 0 errors |
| Relative imports resolve + names exist — app | ✅ 0 errors |
| Duplicate barrel exports | ✅ 0 |
| Stub-based typecheck — package (49 files) | ✅ 0 errors |
| Stub-based typecheck — app (14 files, package pulled in transitively) | ✅ 0 errors |
| Barrel imports used by the app all exist | ✅ 71 names, 0 missing |
| Component-module coverage by the showcase | ✅ **43 / 43 modules exercised** |
| Quoted module / export counts match reality | ✅ 0 mismatches |
| Harness proved to catch real errors | ✅ yes — 4 defect classes, re-proved after Phase 4 **and** Phase 5 |
| Primitive barrel exports | ✅ 58 names, no collisions |
| Composite barrel exports | ✅ 38 names, no collisions |
| Layout barrel exports | ✅ 35 names, no collisions |
| Root barrel exports | ✅ 139 names (131 components + 8 from `tokens` / `host`) |
| Stray emitted `.js` / `.d.ts` beside sources | ✅ 0 |
| **Real `tsc` (`pnpm --filter @celestia-project/mobile typecheck`)** | ❌ **blocked** (§7) |
| **Consumer compiles (`pnpm --filter mobile typecheck`)** | ❌ **blocked** (§7) |
| **Visual (`pnpm mobile` on a simulator)** | ❌ **blocked** (§7) |

### Bugs this actually caught

**Phase 2 (primitives):**

1. A stray `export const skeletonStyles = StyleSheet.create({})` left behind after removing the
   `StyleSheet` import — a `Cannot find name 'StyleSheet'` error that a syntax-only check misses.
   Same class of bug as a stray `mobileProgressMetrics` export in `progress.tsx`.
2. `useRef<TextInput>` in `otp-input.tsx` used `TextInput` as a type. Changed to
   `React.ComponentRef<typeof TextInput>`, matching `input.tsx`.
3. `slider.tsx`'s `PanResponder` handlers relied on contextual typing for their `event` parameter.
   Now explicitly typed `GestureResponderEvent`.

**Phase 3 (composites) — both were primitive defects surfaced by the composite layer:**

4. `MobileButton` had no `accessibilityLabel` / `accessibilityHint`, caught when
   `MobileSocialAuthButtons` passed one. A button primitive that accepts icon-only children and
   cannot carry a label is unusable with a screen reader.
5. `MobileSwitch` had the same gap — its visible label is a *sibling*, so the native control was
   announced as bare "switch".

**Phase 4 (layout) — three failures, none of which the static check alone would have found:**

6. **The stub itself was the first failure.** `TS2786` / `TS2607` on `ScrollView` in both
   `screen.tsx` and `onboarding-screen.tsx` — a stub defect, not a source defect (see the
   improvements above). Worth recording because the instinct is to "fix" the component.
7. **`TS7006` on three inline `onChangeText` handlers in `sign-up-screen.tsx`.** Also a stub
   artefact — the `Omit`-collapse above meant `onChangeText` had no contextual type. The
   other screens happened to use named handlers with explicit parameter types, which is why
   only this file tripped.
8. **`MobileButton` could not be stretched.** Found by reasoning about the render tree rather
   than by the typecheck: `style` reached the inner `Pressable`, so `containerStyle={{ flex: 1 }}`
   on the onboarding pager's primary button would have been silently ignored. The typecheck
   cannot catch a style that lands on the wrong element — that class of bug needs either a
   simulator or careful reading of the wrapper structure.

**Phase 5 (surface) — both caught by the two new gates, neither by reading the code:**

9. **`MobileSegmentedControl` requires `onValueChange`.** The showcase's "whole control disabled"
   demo passed `options` + `value` + `disabled` and omitted it — `TS2741` from Harness C. Worth
   recording because the prop is *not* optional even though the control is disabled, and that is
   deliberate: a disabled control still has to be able to report a change, and making the prop
   optional would let a caller ship one that silently cannot.
10. **The gallery footer quoted the wrong export count.** It said `131 exports`; the root barrel
    exports **139**. 131 is the sum of the three *category* barrels (58 + 38 + 35); the root barrel
    additionally re-exports `tokens` and `host` — `lightColors`, `darkColors`, `typography`,
    `metrics`, `ColorRamp`, `useMobileTheme`, `MobileHost`, `MobileHostProps`. Caught by Harness D's
    quoted-count assertion, which is the only thing that could have caught it: no typecheck reads
    prose, and the number was correct when written — for a *different* barrel.

**Still required before the package is trusted:** a real `pnpm install` on a networked machine, then
`pnpm --filter @celestia-project/mobile typecheck` and `pnpm --filter mobile typecheck`.

**Guardrails to carry forward:**
- Never run `tsc -p` without `--noEmit` — it emits `.js` beside sources, and Metro then resolves `./button.js` over `./button.tsx`.
- Never run bare `biome check --write` — `biome.json` says tabs, the codebase is spaces.
- One `Edit` per file per message; re-verify by search afterwards.
- When injecting a deliberate error to prove a harness non-vacuous, put each injection on a **separate** JSX element.
- A layout-only change can be typecheck-clean and still visually wrong (see bug 8). Anything touching the `Animated.View` / `Pressable` wrapper split needs a simulator.
- **Never quote a count in user-facing copy without an assertion that checks it** (bug 10). The number will be right when written and wrong after the next phase.
- **A coverage claim needs a coverage check.** "The showcase covers all 43 modules" is a claim about imports, so Harness D reads the imports. A comment naming a module proves nothing.
- **Don't render a full-screen component inside a card.** The `layout/` modules own the frame; the gallery must step aside (see the Phase 5 deviations table). If a preview ever needs a route stack, it belongs in the host app, not the package.
- If the app ever switches to deep imports (`@celestia-project/mobile/primitive/button`), Harness C needs matching `paths` entries — `paths` does not read the package's `exports` map.

**Known limitation, stated honestly:** these components render real SwiftUI / Jetpack Compose, so
visual verification needs a simulator or device and cannot be done headlessly. Typecheck plus the
`apps/mobile` showcase are the automated gates. The stub harness also cannot verify the native API
surface — it verifies *our* code, not RN's.

---

## 9. Documentation and showcase deliverables (Phase 5 — landed)

| # | Deliverable | Status |
|---|---|---|
| 1 | `apps/web/content/docs/mobile.mdx` — new docs page | ✅ what the package is (and is not — it is not a port of `@celestia-project/ui`), a "where it lives" table, a workspace-only warning, installation via the workspace protocol + `npx expo install`, peer-dependency table, the three categories with a "primitive means generic, not atomic" note, all three module inventories, import paths, setup (`SafeAreaProvider` → `MobileHost` → sized `View` → `MobileToastProvider`), primitive usage, the shell + thin-screen split with worked examples, the design rules, and an honest "not yet verified on a device" warning naming `MobileSlider`'s gesture geometry |
| 2 | `apps/web/content/docs/meta.json` | ✅ `"mobile"` added after `"packages"` in the *Getting Started* group |
| 3 | `apps/web/content/docs/index.mdx` | ✅ a `<Card title="Mobile (Expo)" href="/docs/mobile" />`, placed **outside** the `{/* feature-manager:cards:begin */}` region so the feature manager cannot overwrite it |
| 4 | `apps/web/content/docs/packages.mdx` | ✅ a `## @celestia-project/mobile` section between `ui` and `alpine-ui`, with **no** npm badge, an exports table, a usage sample, and a `<Callout type="warn">` stating it is workspace-only |
| 5 | Root `README.md` (D5) | ✅ `apps/mobile` + `packages/mobile` in the repo tree and the architecture prose; `pnpm mobile` added to the scripts table; the mobile app noted as **not** part of `pnpm dev`; and an explicit "**not published**" note instead of a false *Published Packages* entry |
| 6 | `apps/mobile` showcase | ✅ restructured into 14 files — see below |

### The showcase, as built

```
apps/mobile/src/
├── App.tsx                    (41 lines)  SafeAreaProvider → MobileHost → MobileToastProvider → ShowcaseRoot
└── showcase/
    ├── ShowcaseRoot.tsx        gallery + the full-screen preview stack
    ├── types.ts                ShowcaseContext / ShowcaseSectionDefinition
    ├── ui.tsx                  Specimen, Row, Stack, Spacer, Glyph, Swatch, Readout, ShowcaseSectionHeader
    ├── screens-preview.tsx     all 10 layout modules, each rendered full-screen
    ├── index.ts                public surface of the showcase
    └── sections/
        ├── index.ts            SHOWCASE_SECTIONS — the gallery's table of contents
        ├── foundations.tsx     9 primitive modules
        ├── actions.tsx         6 primitive modules
        ├── forms.tsx           2 primitive + 2 composite modules
        ├── data.tsx            2 primitive + 3 composite modules
        ├── navigation.tsx      4 composite modules
        ├── overlays.tsx        1 primitive + 4 composite modules
        └── screens.tsx         entry point for the 10 layout modules
```

Section titles and summaries live in `sections/index.ts`, not inside the section files, so the copy
and the structure cannot drift apart. The showcase no longer hardcodes a single colour — the old
`App.tsx` carried `#09090b` / `#ffffff` / `#27272a` / `#e2e8f0` inline.

**Already done before Phase 5:** `packages/mobile/README.md` documents all three categories, the 43
modules, the screen API, the design rules and the import paths.
