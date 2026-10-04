# Desktop component audit — style, animation and effect parity

Scope: every file in `packages/desktop/crates/ui/src/components/` (68 component
files — `mod.rs` is the module index) audited against
`packages/ui/src/components/primitive/` (47 `.tsx` files).

The web package is the source of truth. Its motion vocabulary lives in two places:

- `packages/ui/src/styles/globals.css` → the `Motion` block in `@theme`
  (`--ease-out`, `--ease-in-out`, `--ease-drawer`, and the
  `--transition-duration-{instant,fast,normal,slow,slower}` scale).
- `packages/ui/src/components/primitive/*.tsx` → which utility each component
  actually uses (`duration-fast ease-out`, `active:scale-[0.97]`,
  `data-open:animate-in …`).

The desktop crate has **two kinds of file**, and the distinction decides what can
be fixed here at all:

| Kind | Count | Can be restyled in this crate? |
| --- | --- | --- |
| **Celestia wrapper** — a shadcn-shaped API rendering gpui-kit primitives under Celestia tokens | 16 | **Yes** |
| **Re-export shim** — `pub use gpui_kit::component::<x>::*` | 52 | No — the paint and motion live in gpui-kit 0.6.6 |

(The split is decided by content, not by name: a *wrapper* is any file that
declares its own `struct` / `enum` / `fn` / `impl` / `trait`; a *shim* is a file
whose entire body is `use` statements, however many lines the `pub use` list
wraps onto. Counted that way — `grep -E '^\s*(pub )?(struct|enum|fn|impl|trait) '`
over the 68 files — the boundary is 16 / 52.)

Re-export shims are still audited, because the crate *can* influence them
indirectly: they read `cx.theme()` (colors + `radius`) and
`cx.theme().motion_tokens()` (durations, easings, springs). Anything that moves
through `motion_tokens()` is fixable from `theme.rs` without touching gpui-kit.

---

## 1. Headline findings

1. **The desktop motion kit was ported from Zeron, not from the design system.**
   `motion.rs` carries `EASE_OUT_EXPO` `cubic-bezier(0.16, 1, 0.3, 1)` and the
   Zeron pulse clock, but **none** of the three curves the web primitives
   actually use — `--ease-out` `(0.23, 1, 0.32, 1)`, `--ease-in-out`
   `(0.77, 0, 0.175, 1)`, `--ease-drawer` `(0.32, 0.72, 0, 1)` — and none of the
   five duration tokens. Every `duration-fast ease-out` transition on the web
   has no desktop counterpart to name.
2. **gpui-kit's own motion scale is a *different* scale.** `MotionTokens::default()`
   is instant `0ms` / fast `120ms` / normal `180ms` / slow `280ms`, with
   `easing_enter` `(0.16, 1, 0.3, 1)`, `easing_exit` `(0.4, 0, 1, 1)`,
   `easing_move` `(0.2, 0, 0, 1)`. The web scale is `80 / 150 / 220 / 320 /
   500ms` with `(0.23, 1, 0.32, 1)`. `theme.json` has no motion key (the field is
   `#[serde(skip)]`), so **every re-exported component — switch, checkbox,
   slider, accordion, progress, carousel, `TabBar` — currently animates on
   gpui-kit's scale, not Celestia's.** This is the single highest-leverage gap:
   `Theme::global_mut(cx).motion` is a public field, so one assignment in
   `theme::install` re-times the whole library.
3. **The Celestia `Tabs` wrapper dropped the design system's signature effect.**
   Web tabs animate a *shared* indicator (`transition-[left,top,width,height]
   duration-normal cubic-bezier(0.23,1,0.32,1)`) and animate the panel in
   (`data-open:animate-in fade-in-0 zoom-in-[0.99]`). The desktop `TabsList`
   hand-rolls per-trigger styling with **no indicator and no entrance** — even
   though gpui-kit's own `TabBar` already implements a spring-driven sliding
   indicator. The wrapper does not use it.
4. **`active:scale-[0.97]` / `active:translate-y-[2px]` have no analogue on most
   wrappers.** `Button` is the exception and is already correct (spring-driven
   2px translation + shadow collapse). `TabsTrigger`, `SidebarNavItem` and
   `TableRow` press/hover instantly.
5. **Three colour-surface mismatches** (not motion, but the same "match the
   primitive" brief): `Card` paints `background` + `border` where web paints
   `card` + `ring-foreground/10`; `Badge`'s `destructive`/`success`/`warning`/
   `info` variants are **solid** where web uses a **10% tint**; `Avatar` has no
   size scale and no border ring.

---

## 2. Celestia wrappers — the actionable set

Legend for *Effect gap*: **✗ missing**, **~ partial**, **✓ parity**.

### `button.rs` → `button.tsx`

| | Web | Desktop now | Gap |
| --- | --- | --- | --- |
| Press | `active:translate-y-[2px] active:shadow-none active:transition-none` | spring `(900, 50, 1.0)` translating 0→2px, shadow collapses in step | ✓ (better than CSS) |
| Hover, `default` | `hover:bg-primary/10`, text stays `text-primary` | `hover:bg(primary)` solid, text flips to white | **✗ wrong effect** |
| Hover timing | `transition-all` (150ms default) | instant (`hover()` style swap) | ✗ |
| Focus | `focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring` | `track_focus` only — no visible ring | **✗ missing** |
| `link` | `hover:underline` | `text_decoration_1` on hover | ✓ |
| `destructive` | `hover:bg-destructive/90` | `danger.opacity(0.90)` | ✓ |
| `secondary` | `hover:bg-secondary/80` | `secondary.opacity(0.80)` | ✓ |

### `badge.rs` → `badge.tsx`

| | Web | Desktop now | Gap |
| --- | --- | --- | --- |
| Shape | `h-5 rounded-full px-2 py-0.5 text-3xs` | `Tag` `Size::Small` (half-radius, tighter) | ~ |
| `destructive` | `bg-destructive/10 text-destructive` | `Tag::danger()` — **solid fill** | **✗** |
| `success` / `warning` / `info` | `bg-<x>/10 text-<x>` | `Tag::success()/warning()/info()` — solid | **✗** |
| `outline` | `border-border bg-input/20 text-foreground` | `Tag::secondary().outline()` | ~ |
| `default` / `secondary` | solid fills | solid fills | ✓ |
| `ghost`, `link` | present | absent (`Brand` is desktop-only) | ✗ |
| Motion | `transition-all` | none (static chip) | n/a (no state) |

### `card.rs` → `card.tsx`

| | Web | Desktop now | Gap |
| --- | --- | --- | --- |
| Surface | `bg-card` (`#ffffff` light / `#171717` dark) | `bg(background)` (`#ffffff` / `#0a0a0a`) | **✗ dark is wrong** |
| Edge | `ring-1 ring-foreground/10` | `border_1 border_color(border)` | ~ (same value light, differs dark) |
| Text | `text-xs/relaxed text-card-foreground` | `text_sm` title / `text_xs` desc | ~ |
| Overflow | `overflow-hidden` (clips child images) | none | ✗ |
| Padding | `--card-spacing` 16px / 12px (`size=sm`) | 16px / 12px | ✓ |
| Footer | `[.border-t]:pt-…` — divider only when present | `border_t_1` only when `footer` set | ✓ |
| Motion | none | none | ✓ |

`theme.popover` is the exact port of web `--card` (light `#ffffff`, dark
`#171717`), so the fix needs no new token.

### `avatar.rs` → `avatar.tsx`

| | Web | Desktop now | Gap |
| --- | --- | --- | --- |
| Size | `size-8`, `lg:size-10`, `sm:size-6` | fixed 32px | ✗ |
| Ring | `after:border after:border-border` overlay | none | ✗ |
| Fallback | `bg-muted text-muted-foreground` | gpui-kit default | ~ |

### `tabs.rs` → `tabs.tsx`

| | Web | Desktop now | Gap |
| --- | --- | --- | --- |
| Indicator | shared element, `transition-[left,top,width,height] duration-normal cubic-bezier(0.23,1,0.32,1)` | none — per-trigger paint | **✗ missing** |
| Trigger hover | `transition-colors duration-fast ease-out hover:text-foreground` | instant `hover()` | ✗ |
| Trigger press | `active:scale-[0.97] active:duration-instant` | none | ✗ |
| Panel entrance | `data-open:animate-in fade-in-0 zoom-in-[0.99] duration-normal` | none | **✗ missing** |
| Trigger colour on select | fades in sync with the indicator (`data-active:text-foreground`) | instant | ✗ |
| Track | `bg-muted`, `p-[3px]`, `rounded-lg` | `bg(muted)`, `p(3)`, `radius` | ✓ |

### `table.rs` → `table.tsx`

| | Web | Desktop now | Gap |
| --- | --- | --- | --- |
| Table text | `text-xs` | `text_sm` | ✗ |
| Header fill | none — `[&_tr]:border-b` only | `bg(muted)` fill | **✗ extra fill** |
| `<th>` | `h-10 px-2 font-medium text-foreground` | `h-9 px-3 text_xs text-muted-foreground` | ✗ |
| `<td>` | `p-2`, `sm: py-1.5` | `px_3 py_2 min-h-36 text_sm` | ✗ |
| Row hover | `transition-colors hover:bg-muted/50` | `hover:bg(muted.opacity(0.5))`, instant | ~ (colour ✓, timing ✗) |
| Selected row | `data-[state=selected]:bg-muted` | absent | ✗ |
| Caption | `mt-4 text-xs` | `mt_3 text_xs` | ~ |

### `sidebar_layout.rs` → `composite/sidebar.tsx`

| | Web | Desktop now | Gap |
| --- | --- | --- | --- |
| Nav item hover | `hover:bg-sidebar-accent` with the sidebar's 200ms width/padding transition | `hover(|s| s.bg(sidebar_accent))`, instant | ~ |
| Selected | `bg-sidebar-accent text-sidebar-accent-foreground` | same + a 2.5px primary rail (desktop extra) | ✓ |
| Header/footer | `border-b` / `border-t` on `sidebar-border` | same | ✓ |

### Remaining wrappers

| File | Verdict |
| --- | --- |
| `section_heading.rs` | Static typography. No web primitive, no motion. ✓ |
| `swiftui.rs` | SwiftUI layout vocabulary — `HStack` / `VStack` / `ZStack` / `Spacer` / `ScrollView` / `VGrid` / `Frame` plus the alignment enums. Geometry only: no colour, no hover, no press, no transition. `ScrollView` is the sole interactive surface and scroll physics are the platform's, not ours to style. No web primitive to match. ✓ |
| `text_editor.rs`, `code_editor.rs` | Celestia-only chrome (Monaco/toolbar has no GPUI equivalent). Static surfaces; the toolbar buttons inherit `Button`. ✓ |
| `notice.rs`, `context_badge.rs` | Zeron ports, not web primitives. `context_badge` already has a 280ms hover-delay card + hover tint. ✓ |
| `loaders.rs` | Zeron loaders; already routed through `motion.rs` and the pulse clock. ✓ (but see finding 1 — `PULSE`/`GRADIENT_SPIN` are Zeron periods, deliberately not design-system tokens) |
| `virtual_list.rs`, `icon.rs` | Infrastructure. ✓ |

---

## 3. Re-export shims — audited, not restylable here

Each of these is `pub use gpui_kit::component::…`. The web primitive's motion is
recorded so the mapping is explicit; where the desktop's motion comes from
`motion_tokens()`, finding 2 fixes it globally.

| Desktop file | Web primitive | Web motion / effect | Desktop source of motion |
| --- | --- | --- | --- |
| `switch.rs` | `switch.tsx` | thumb `transition-[transform,width] duration-fast cubic-bezier(0.23,1,0.32,1)`; track `transition-[background-color,border-color,box-shadow] duration-fast` | `motion_tokens().spring_move` (gpui-kit `switch.rs`) |
| `checkbox.rs` | `checkbox.tsx` | indicator `transition-[transform,opacity] duration-fast cubic-bezier(0.23,1,0.32,1)`, `data-open:zoom-in-75` | `motion_tokens().spring_control` |
| `radio.rs` | `radio-group.tsx` | `transition-[color,box-shadow]`, `focus-visible:ring-2` | gpui-kit `radio.rs` |
| `slider.rs` | `slider.tsx` | thumb `transition-[color,box-shadow]`, `hover:ring-2 active:ring-2` | `motion_tokens().spring_control` |
| `progress.rs` | `progress.tsx` | bar `transition-all` | `transition(… duration_normal, easing_move)` |
| `skeleton.rs` | `skeleton.tsx` | `animate-pulse` (Tailwind 2s cubic-bezier(0.4,0,0.6,1)) | gpui-kit `skeleton.rs` `with_animation` |
| `spinner.rs` | `spinner.tsx` | `animate-spin` (1s linear infinite) | gpui-kit `spinner.rs` |
| `shimmer.rs` | `ai/shimmer.tsx` | gradient sweep | gpui-kit `shimmer.rs` |
| `accordion.rs` | `accordion.tsx` | `data-open:animate-accordion-down` / `animate-accordion-up` | `motion_tokens().spring_control` |
| `collapsible.rs` | `collapsible.tsx` | height transition | `motion_tokens().spring_control` |
| `carousel.rs` | `carousel.tsx` | snap `spring_move` | `motion_tokens().spring_move.with_epsilon(0.5)` |
| `dialog.rs` | `dialog.tsx` | overlay `duration-normal ease-out` fade; panel `animate-in fade-in-0 zoom-in-95` | gpui-kit `dialog.rs` `with_animation` |
| `sheet.rs` | `sheet.tsx` / `drawer.tsx` | overlay `duration-slow cubic-bezier(0.32,0.72,0,1)`; panel slide | gpui-kit `sheet.rs` |
| `popover.rs` | `popover.tsx` | `duration-fast ease-out`, `data-open:zoom-in-95` | gpui-kit `popover.rs` |
| `tooltip.rs` | `tooltip.tsx` | `duration-fast ease-out`, `zoom-in-95` | gpui-kit `tooltip.rs` |
| `hover_card.rs` | `hover-card.tsx` | same popup entrance + open/close delays | gpui-kit `hover_card.rs` |
| `menu.rs` | `dropdown-menu.tsx` / `context-menu.tsx` / `menubar.tsx` | item `focus:bg-accent`; popup `duration-fast ease-out` zoom | gpui-kit `menu/` |
| `command.rs` | `command.tsx` | dialog entrance + item highlight | gpui-kit `command/` |
| `toast.rs` | `toast.tsx` / `sonner.tsx` | `transition-opacity duration-normal ease-out`, `data-behind:opacity-0` | gpui-kit `notification.rs` |
| `alert.rs` | `alert.tsx` | static; links `hover:text-foreground` | n/a |
| `input.rs` | `input.tsx` | `transition-colors`, `focus-visible:border-ring focus-visible:ring-2` | gpui-kit `input/` |
| `textarea.rs` | `textarea.tsx` | `transition-colors`, `focus-visible:ring-2` | gpui-kit `input/` |
| `input_otp.rs` | `input-otp.tsx` | caret `animate-caret-blink duration-slower` | gpui-kit `input/` |
| `select.rs` | `select.tsx` | popup entrance, item `focus:bg-accent` | gpui-kit `select.rs` |
| `combobox.rs` | combobox composite | popup entrance + search | gpui-kit `combobox.rs` |
| `calendar.rs` / `date_picker.rs` | `calendar.tsx` | day cell `hover:bg-accent`, popover entrance | gpui-kit `time/` |
| `table.rs` (DataTable half) | `composite/data-table` | virtualized delegate | gpui-kit `table/` |
| `list.rs`, `tree.rs`, `pagination.rs`, `breadcrumb.rs`, `marker.rs`, `empty.rs`, `description_list.rs`, `kbd.rs`, `label.rs`, `separator.rs`, `link.rs`, `group_box.rs`, `scroll_area.rs`, `resizable.rs`, `sidebar.rs`, `status_bar.rs`, `title_bar.rs`, `dock.rs`, `charts.rs`, `attachment.rs`, `bubble.rs`, `message.rs`, `color_picker.rs`, `rating.rs`, `stepper.rs` | various | static chrome, or `transition-colors` on hover rows | gpui-kit |

`bubble.tsx` is a one-line re-export on the web too (30 bytes); `aspect-ratio.tsx`
and `direction.tsx` have no desktop counterpart and need none.

---

## 4. What this audit changes

Ordered by leverage. All eight landed; two premises were corrected on contact
with the source (items 2 and 8) and one constraint turned out to be a hard limit
of the renderer (see below).

1. **`motion.rs` + `theme::install`** — port the five duration tokens and the
   three curves, expose `MotionSpec`s and `Transition` helpers, and assign the
   Celestia `MotionTokens` to the theme global. Fixes finding 2 for all 52
   shims at once. `theme::motion` is `#[serde(skip)]`, so this is a direct
   assignment in `install()`; `apply_config` never touches the field, so it
   survives `Theme::change` and system-appearance switches.
2. **`tabs.rs`** — sliding indicator, panel entrance, trigger ink fade.
   `TabsList` now holds typed `TabsTrigger`s instead of `AnyElement`s, so it can
   read the selected index back off them (one source of truth, no parallel index
   to keep in sync) and push its `variant`/`size` down onto every trigger the
   way the web's `group/tabs-list` data attributes do. This is an API change:
   `TabsList::child` takes a `TabsTrigger`, and `TabsList` is no longer a
   `ParentElement`. Both call sites in the showcase are unaffected.
3. **`button.rs`** — focus ring, `hover:bg-primary/10` instead of a solid fill,
   150ms hover fade. Fixes finding 5's first item.
4. **`badge.rs`** — tinted status variants, `rounded-full`, `h-5`, and the two
   missing web variants (`ghost`, `link`). Composed from a plain `div`: gpui-kit's
   `Tag` paints solid status fills and bakes in a `hover:opacity(0.9)` dim the
   web badge does not have.
5. **`card.rs`** — `popover` surface, `foreground/10` edge, `overflow-hidden`.
6. **`avatar.rs`** — `sm`/`default`/`lg` (24/32/40). The box and the fallback
   type step are set from two sources on purpose: gpui-kit derives both from one
   `Size`, and its ladder gives 40px the 20px `size * 0.5` text, where the web
   wants 14px. `Sizable::with_size` picks the step, `Styled::size` pins the box,
   and gpui-kit applies its own refinement last so the box wins.
7. **`table.rs`** — `text-xs`, header without a fill, `h-10 px-2` head with
   `text-foreground`, `p-2`/`py-1.5` cells, `hover:bg-muted/50`, the selected
   row fill, and `mono` on `TableCell`. The row's fade is enabled only when the
   caller supplies a unique id (see non-goals).
8. **`sidebar_layout.rs`** — *the audit was wrong here.* The web's
   `SidebarMenuButton` carries `transition-[width,height,padding]` — geometry
   only. `hover:bg-sidebar-accent`, `active:bg-sidebar-accent` and
   `data-active:bg-sidebar-accent` all land in the same frame. The 220ms
   `duration-normal ease-linear` transition belongs to the *container's*
   `transition-[width]`, which drives the collapse-to-icon rail — and this row is
   fixed-width, so there is nothing for a duration to drive. Adding a colour fade
   would have been a new effect, not parity. What the row actually needed: the
   `text-xs` step (it rendered one step large at `text-sm`), the missing press
   tint, and `focus-visible:ring-2`.

### The hard limit: no element transform

`active:scale-[0.97]` on the tab trigger and `zoom-in-[0.99]` on the panel are
*transforms*, and GPUI has no element transform — only images and SVGs take a
`TransformationMatrix`. There is nothing to scale a subtree with. (gpui-component
documents the same constraint for the dropdown entrance in `popover.rs`.) The
panel's 1% zoom is approximated by a 2px rise, which reads the same on a panel
edge; the trigger's press keeps the web's *colour* behaviour — which is no colour
change beyond hover — and drops only the geometry.

### Deliberate non-goals

- **Not** restyling the 52 shims: that is gpui-kit's source, and forking it is a
  larger decision than this audit.
- **Not** animating `TableRow` on the default id: gpui animates a colour fade
  through keyed element state, and `TableRow`'s default id
  (`ElementId::Name("table-row")`) is shared by every row in a table, so keying
  a transition on it would make all rows animate together — worse than no fade.
  `TableRow::id` therefore opts a row into the fade; rows left on the default id
  keep the instant `.hover(...)` tint, which is at least correct per row.
- **Not** changing `PULSE` / `GRADIENT_SPIN`: those are Zeron loader periods
  with no web-primitive counterpart to match.
- **Not** removing the desktop `Table`'s outer border/radius: the web splits the
  chrome across a `<table>` and an `overflow-x-auto` wrapper, and the desktop has
  no `<table>` element to split them across, so the container carries both.
- **Not** adding `TableFooter`, or a `font-heading` stack for `CardTitle`: both
  are absences rather than mismatches, and neither is motion.
