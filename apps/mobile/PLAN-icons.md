# Plan — Icons in the mobile package & showcase

> **Status: proposed, not started.** Nothing in this document has been applied to the codebase.
> **Blocked on:** a networked machine. `pnpm install` cannot complete in this environment, so the
> dependency this plan needs cannot be installed, typechecked, or rendered here. See §5.

---

## 0. Read this first — the linked package cannot be used

`@phosphor-icons/react` (the package on [phosphoricons.com](https://phosphoricons.com)) is a
**web-only** library. It cannot run in React Native, and this is not a configuration problem:

| Evidence | Detail |
|---|---|
| `peerDependencies` | `react: ">= 16.8"` **and `react-dom: ">= 16.8"`** — it requires the DOM |
| Build output | `main: ./dist/index.cjs.js`, `module: ./dist/index.es.js` — web bundles |
| Rendering | it emits `<svg>` DOM elements |

React Native has no `react-dom` and no `<svg>` element. So "add `@phosphor-icons/react` to the mobile
app" has no working form.

It **is** already an established dependency in this repo — but only on the web side:

```
apps/web         @phosphor-icons/react@^2.1.10
packages/ui      @phosphor-icons/react@^2.1.10
apps/api         (none)
packages/mobile  (none)
apps/mobile      (none)
```

**What does work in React Native** is a different, *community* package:

```
phosphor-react-native  3.0.6  ·  published 2026-04-23  ·  MIT  ·  TypeScript types included
peerDependencies: { react: "*", react-native: "*", react-native-svg: "*" }
```

Two things to accept before choosing it:

1. **It is not official Phosphor.** It is a port by `duongdev`; the last release was ~5 months ago.
   The official `phosphor-icons` org publishes `react` (web) only.
2. **It requires `react-native-svg`**, a **native** module. That is a real cost — see §5.

---

## 1. What the showcase has today

The showcase deliberately uses **text glyphs** as icon stand-ins, because `packages/mobile` has a
hard design rule:

> **6. Icons arrive as props.** No icon dependency. Only structural marks (a tick, a chevron) may be
> drawn inline.

That is not an accident or a placeholder — it is what keeps the package usable with *any* icon set.
The current state is 27 glyph usages across 5 files, using 18 distinct characters:

| Glyph | Used in | Semantic meaning | Phosphor icon |
|---|---|---|---|
| `◉` | `forms.tsx`, `screens-preview.tsx` | Apple sign-in | `AppleLogoIcon` |
| `G` | `forms.tsx`, `screens-preview.tsx` | Google sign-in | `GoogleLogoIcon` |
| `◆` | `forms.tsx` | GitHub sign-in | `GithubLogoIcon` |
| `◍` | `forms.tsx` | WeChat sign-in | `WechatLogoIcon` |
| `◇` | `data.tsx`, `screens-preview.tsx` | empty state, "capture" | `NoteBlankIcon` |
| `▤` | `navigation.tsx`, `screens-preview.tsx` | list / archive, "organise" | `RowsIcon` |
| `◎` | `actions.tsx`, `screens-preview.tsx` | target, "share" | `TargetIcon` |
| `✓` | `data.tsx`, `forms.tsx` | success / done | `CheckIcon` |
| `⌫` | `actions.tsx`, `data.tsx` | delete / destructive | `TrashIcon` |
| `?` | `foundations.tsx` | avatar fallback | `UserIcon` |
| `⌂` | `navigation.tsx` | Home tab | `HouseIcon` |
| `⌕` | `navigation.tsx` | Search tab / action | `MagnifyingGlassIcon` |
| `✉` | `navigation.tsx` | Inbox tab | `EnvelopeIcon` |
| `⚙` | `navigation.tsx` | Settings tab | `GearSixIcon` |
| `≡` | `navigation.tsx` | menu | `ListIcon` |
| `＋` | `actions.tsx`, `navigation.tsx` | add / compose | `PlusIcon` |
| `★` | `actions.tsx` | star (icon-button variants) | `StarIcon` |
| `@` | `forms.tsx` | email field leading slot | `AtIcon` |

Every one has a clean Phosphor equivalent, so the swap is mechanical once the seam exists.

---

## 2. The fork — decide this before any code

| | Option A — **showcase only** *(recommended)* | Option B — package-wide | Option C — no new dependency |
|---|---|---|---|
| What changes | `apps/mobile` gains Phosphor; `packages/mobile` untouched | `packages/mobile` ships Phosphor icons | Keep text glyphs; optionally add `@expo/vector-icons` |
| Rule 6 ("icons arrive as props") | **preserved** | **broken** | preserved |
| Zero-new-dependency policy | preserved for the package | **broken** — every consumer inherits `react-native-svg` | preserved |
| Package consumers must install `react-native-svg` | no | **yes** — for an icon set they may not want | no |
| Showcase gets real icons | yes | yes | only if `@expo/vector-icons` |
| Native rebuild required | yes | yes | **no** (`@expo/vector-icons` is font-based) |
| Effort | ~1 phase | ~2 phases + docs rewrite + a semver-major story | trivial |

### Why A is recommended

The "icons arrive as props" rule is the reason `packages/mobile` has **zero** icon dependency and
works with any icon set. The showcase's text glyphs were always meant as *proof that the seam is
real* — a demo that the package renders whatever node you hand it.

Putting Phosphor in the **app** keeps that intact *and* makes the demonstration strictly better: a
real icon library arriving through the props seam is far stronger evidence than a `★` character. It
also means the showcase's icon choice is swappable in one file (§3.1), which is exactly the property
the package promises its consumers.

Option B should only be chosen if you specifically want the package to *own* a default icon set.
If so, it needs its own plan: a `MobileIcon` wrapper, an icon registry, `react-native-svg` added to
`peerDependencies`, and a documented breaking-change note — because it changes the install footprint
of every consumer of `@celestia-project/mobile`.

Option C is worth considering if the goal is "the showcase shouldn't look like it's missing icons"
rather than "it must be Phosphor". `@expo/vector-icons` is font-based, so it needs **no native
module and no rebuild** — it works in Expo Go. `expo@57.0.25` does not depend on it directly, so it
is still an explicit install, but a JS-only one. It is not Phosphor's icon set.

---

## 3. Recommended plan (Option A)

### Phase 0 — Install and preflight *(blocked here)*

```bash
# from the repo root
pnpm install --filter mobile

# Expo picks the SDK-57-compatible react-native-svg — do NOT hand-pick a version
cd apps/mobile && npx expo install react-native-svg
pnpm --filter mobile add phosphor-react-native
```

Because `react-native-svg` is a native module, the app must be **rebuilt**, not just reloaded:

```bash
pnpm mobile          # Metro
# then, in a second terminal
pnpm --filter mobile exec expo run:ios      # or: expo run:android
```

Expo Go will **not** work once a native module is added. Confirm `react-native-svg` resolves and a
trivial `<Svg />` renders before writing any icon code — otherwise every later failure is ambiguous.

### Phase 1 — One icon adapter module

New file: `apps/mobile/src/showcase/icons.tsx`

The showcase must not import Phosphor in 5 places. A single adapter means the icon set is swappable
in one file, and it is the only place that knows Phosphor's naming convention (`XIcon`).

```tsx
import {
  AppleLogoIcon,
  AtIcon,
  CheckIcon,
  EnvelopeIcon,
  GearSixIcon,
  GithubLogoIcon,
  GoogleLogoIcon,
  HouseIcon,
  ListIcon,
  MagnifyingGlassIcon,
  NoteBlankIcon,
  PlusIcon,
  RowsIcon,
  StarIcon,
  TargetIcon,
  TrashIcon,
  UserIcon,
  WechatLogoIcon,
  type IconProps,
} from "phosphor-react-native"

/** Every icon the showcase needs, by semantic name. */
export const SHOWCASE_ICONS = {
  "apple-logo": AppleLogoIcon,
  "google-logo": GoogleLogoIcon,
  "github-logo": GithubLogoIcon,
  "wechat-logo": WechatLogoIcon,
  at: AtIcon,
  check: CheckIcon,
  trash: TrashIcon,
  user: UserIcon,
  house: HouseIcon,
  search: MagnifyingGlassIcon,
  envelope: EnvelopeIcon,
  gear: GearSixIcon,
  menu: ListIcon,
  plus: PlusIcon,
  star: StarIcon,
  target: TargetIcon,
  rows: RowsIcon,
  "note-blank": NoteBlankIcon,
} as const

export type ShowcaseIconName = keyof typeof SHOWCASE_ICONS

export function ShowcaseIcon({ name, ...props }: { name: ShowcaseIconName } & IconProps) {
  const Icon = SHOWCASE_ICONS[name]
  return <Icon {...props} />
}
```

A semantic registry (not raw Phosphor names) is what keeps the sections readable and stops
`GearSixIcon` from leaking into a layout file — the same reason the package takes icons as props.

### Phase 2 — Theme-aware defaults via `IconContext`

Icons must **never** hardcode a colour — that is design rule 1, and it is what makes light mode work.
Phosphor's `IconContext.Provider` sets defaults for a subtree, so this is one component, not 27
`color=` props:

```tsx
// apps/mobile/src/showcase/icons.tsx
function ShowcaseIconTheme({ children }: { children: React.ReactNode }) {
  const { colors } = useMobileTheme()
  const value = React.useMemo(
    () => ({ color: colors.foreground, size: 20, weight: "regular" as const }),
    [colors.foreground],
  )
  return <IconContext.Provider value={value}>{children}</IconContext.Provider>
}
```

Mount it inside `MobileHost` (so `useMobileTheme()` resolves) in `apps/mobile/src/App.tsx`, wrapping
`ShowcaseRoot`. Two details that matter:

- **`weight`** — use `"regular"` for chrome and `"fill"` for a selected tab / active state. Phosphor's
  weights are the idiomatic way to express selection without a second colour.
- **`duotone`** needs `duotoneColor` set too, or it falls back to black and breaks in dark mode. If
  the showcase uses duotone anywhere, set both from the theme.

### Phase 3 — Replace the 27 glyphs

Mechanical, file by file, using the table in §1:

| File | Usages |
|---|---|
| `showcase/sections/navigation.tsx` | 8 |
| `showcase/sections/forms.tsx` | 6 |
| `showcase/sections/actions.tsx` | 4 |
| `showcase/screens-preview.tsx` | 5 |
| `showcase/sections/data.tsx` | 3 |
| `showcase/sections/foundations.tsx` | 1 |

Keep the `Glyph` helper in `showcase/ui.tsx` — do not delete it. Two reasons: it is still the right
tool for genuinely *structural* marks (the package's own rule allows a tick or a chevron drawn
inline), and `MobileAvatar`'s `fallback` slot is a legitimate place for a text glyph.

Sizing: pass `size` from the type scale rather than a magic number — 20 for `callout`-adjacent
chrome, 28 for `display`-adjacent media slots (the onboarding slides and `MobileEmptyState.icon`
currently pass `size="display"`).

Accessibility: Phosphor's `title` prop is the accessible name. Use it for **standalone** icons. Do
**not** add it where the icon sits inside an already-labelled control — `MobileIconButton` requires
`accessibilityLabel` and a second name on the child makes the control announce twice.

### Phase 4 — Documentation *(mandatory per `AGENTS.md`)*

1. `apps/web/content/docs/mobile.mdx` — the page currently states "Icons arrive as props" as a design
   rule. It must also record that the **showcase** uses `phosphor-react-native`, that
   `@phosphor-icons/react` is web-only, and that `react-native-svg` is a native module requiring a
   rebuild.
2. `packages/mobile/README.md` — add the same note, and be explicit that `packages/mobile` still has
   **no** icon dependency.
3. `apps/mobile/package.json` — the new deps, plus a note in `packages/mobile/PLAN.md`'s §5.4
   dependency policy that the *package* footprint did not change.

### Phase 5 — Verification

- Extend `/tmp/mobile-app-static-check.js`: the coverage check should assert the `SHOWCASE_ICONS`
  registry has no unused entries (an icon imported but never rendered is dead weight).
- Re-run all four gates — the app typecheck will need `phosphor-react-native` and `react-native-svg`
  stubs added to `/tmp/rn-stubs.d.ts`, or it will fail to resolve them.
- Visual check on a simulator. This is the phase that cannot be skipped: icon weight, optical size
  and vertical alignment inside `MobileIconButton`'s 44pt box are all things a typecheck cannot see.

---

## 4. Files this plan would touch

```
NEW   apps/mobile/src/showcase/icons.tsx          adapter + registry + IconContext provider
EDIT  apps/mobile/src/App.tsx                     mount the provider
EDIT  apps/mobile/src/showcase/ui.tsx             keep Glyph; add size tokens
EDIT  apps/mobile/src/showcase/sections/{navigation,forms,actions,data,foundations}.tsx
EDIT  apps/mobile/src/showcase/screens-preview.tsx
EDIT  apps/mobile/package.json                    + phosphor-react-native, + react-native-svg
EDIT  apps/web/content/docs/mobile.mdx            document the split
EDIT  packages/mobile/README.md                   note the package still ships no icon dep
NEW   /tmp/rn-stubs.d.ts additions                stub the two new externals
```

`packages/mobile` itself: **no source changes** under Option A.

---

## 5. The blocker, stated plainly

**This plan cannot be executed or verified in this environment.**

`pnpm install` fails here — the WorkBuddy broker denies the `react-native` tarball
(`ERR_PNPM_CODEBUDDY_BROKER_DENY`), and `react-native` is one of only two packages not already in the
local store. `phosphor-react-native` and `react-native-svg` are *also* not in the store, so they
would hit the same denial.

Consequences for this plan specifically:

- The two new packages cannot be installed, so the adapter cannot be typechecked against real types.
- `react-native-svg` is a **native** module, so it needs `expo run:ios` / `expo run:android` — a
  native build that needs a full toolchain and a device or simulator.
- Adding a native module **breaks Expo Go** for this app. That is a workflow change for anyone using
  it, and it is worth deciding deliberately rather than discovering it.

### One more risk to check on a networked machine

`phosphor-react-native`'s README recommends per-icon deep imports for tree-shaking, e.g.
`phosphor-react-native/src/icons/Star`. That path reaches into the package's **source**. Modern Metro
enforces a package's `exports` map, and if `phosphor-react-native` does not declare those subpaths,
the deep import will fail to resolve — leaving the barrel import as the only option, which may defeat
tree-shaking. Verify before committing to the deep-import pattern; the barrel import from the adapter
in §3.1 is the safe default.

---

## 6. What I need from you

1. **Option A, B, or C** from §2. A is recommended and is what §3 describes.
2. **Confirm the native rebuild is acceptable** — it rules out Expo Go for this app.
3. **Confirm you want a community port**, given `phosphor-react-native` is not published by the
   Phosphor team. If that is a problem, Option C (`@expo/vector-icons`, font-based, no rebuild) is the
   closest thing to a free lunch, at the cost of a different icon set.

Once those are settled I can do Phases 1–4 blind (they are all source-only), leaving Phase 0 and
Phase 5 for a networked machine.
