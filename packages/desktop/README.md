# Celestia Desktop (GPUI)

Native Rust desktop UI for the celestia-starter monorepo, built directly on
[GPUI](https://github.com/zed-industries/zed) (`gpui-pre` 0.3.6) plus the two
widget layers it wraps — `gpui-base` and `gpui-component` 0.6.6. There is no
facade crate in between: every import names the crate it actually comes from.
Modeled on the GetCat reference in `reference/GetCat/`.

```
crates/
├─ celestia-ui       # Reusable GPUI component library (the desktop analog of packages/ui)
│  ├─ theme.json     # Celestia light/dark token port (source: packages/ui/src/styles/globals.css)
│  ├─ theme.rs       # Theme install + contrast-pinning tests
│  ├─ theme/config.rs # AppTheme — the runtime globals.css equivalent (colors + radius per mode)
│  ├─ theme/book.rs  # Multi-theme: named light/dark families, register + select
│  ├─ palette.rs     # Semantic roles the Theme lacks (brand, charts) — raw hex lives only here
│  └─ components/    # ONE FILE PER COMPONENT, split by category (see below)
│     ├─ primitive/  # 40 self-contained widgets — Button, Badge, Input, Card, Dialog, …
│     │  ├─ button.rs / badge.rs    # Celestia wrappers: ButtonVariant/ButtonSize, BadgeVariant
│     │  ├─ card.rs / input.rs / select.rs / switch.rs / … (per-component files,
│     │  │   each doc comment maps the web file → desktop module)
│     │  └─ icon.rs                 # Phosphor / PhosphorIcon
│     └─ composite/  # 35 compositions built out of primitives + app chrome
│        ├─ sidebar_layout.rs       # app shell: SidebarLayout + header/nav/item/footer
│        ├─ h_stack.rs, v_stack.rs, z_stack.rs, spacer.rs, scroll_view.rs,
│        │   v_grid.rs, frame.rs, alignment.rs   # SwiftUI-style layout vocabulary
│        ├─ charts.rs               # chart + plot (generic API)
│        └─ section_heading.rs / text_editor.rs / code_editor.rs / …
└─ celestia-desktop  # The app binary (sidebar gallery window — uses SidebarLayout itself)
```

## Architecture

Same shape as the web package, one file per component: `packages/ui` wraps
Base UI primitives with celestia tokens — `celestia-ui` wraps the
gpui-component library the same way. Wrapper components carry a shadcn-shaped
prop surface:

```rust
use celestia_ui::components::primitive::button::{Button, ButtonSize, ButtonVariant};
use celestia_ui::components::primitive::icon::PhosphorIcon;

Button::new("save")
    .variant(ButtonVariant::Primary)
    .size(ButtonSize::Small)
    .leading_icon(PhosphorIcon::FloppyDisk)
    .label("Save")
    .on_click(|_, window, cx| { /* … */ })
```

`Button` is the widest of these: nine sizes (web's five height steps plus four
icon-only squares), ten variants (the web set plus desktop-only `success` /
`warning` / `info` status fills), typed `leading_icon` / `trailing_icon` slots, a
`Button::icon` constructor, and a `loading` state that swaps the leading slot for
a `Spinner`. `apps/web/content/docs/desktop.mdx` has the size table and the
GPUI-specific notes.

Components live under one of two category modules, mirroring
`packages/ui/src/components/{primitive,composite}`:

- **`primitive/`** — self-contained widgets that compose nothing but gpui
  elements and theme tokens (`button`, `badge`, `input`, `card`, `dialog`, …).
- **`composite/`** — components assembled from other components or carrying
  app-chrome structure (`sidebar_layout`, `list`, `menu`, `charts`, `h_stack`, …).

Everything else is a per-component re-export of gpui-component (each file's
doc comment records the web-file → desktop mapping, e.g. `drawer.tsx` →
`sheet`, `toast.tsx` → `toast.rs`, `file-tree.tsx` → `tree.rs`). Wrapper
types are flattened at `celestia_ui::components::*`; module-only components go
through their category-qualified path (`components::primitive::table::…`,
`components::composite::sidebar::…`). Raw hex only in `theme.json`/`palette.rs`;
call sites use `cx.theme()` / `palette(cx)`.

### Dependency layers

The `gpui-kit` facade has been **removed from the whole workspace**. `celestia-ui`
depends on the framework and its two widget layers directly, so every import
names the crate it actually comes from:

| Layer | Crate | Used for |
| --- | --- | --- |
| Framework | `gpui` (`gpui-pre`) | everything a component draws |
| Base | `gpui-base` | **the inner component library** (`Popover`, `Tree`, `Resizable`, `Table`, `VirtualList`, the motion stack, scroll). The free style helpers are crate-owned now: `traits.rs` provides `Size` / `Sizable` / `Disableable` / `Selectable` and `h_flex` / `v_flex` |
| Widgets | `gpui-component` | a thin styling layer *over* `gpui-base`; the styled controls a file still re-exports |

Components are being rewritten onto **raw gpui** one family at a time;
`crates/ui/src/components/mod.rs` tracks which are done. Rewritten so far:

- **Feedback** — `primitive/`: `alert`, `progress`, `skeleton`, `spinner`,
  `shimmer`, `icon`, `tooltip`; `composite/`: `loaders`, `notice`,
  `context_badge`.
- **Structural** — `primitive/`: `separator`, `kbd`, `link`, `breadcrumb`;
  `composite/`: `group_box`, `status_bar`, `title_bar`, `description_list`,
  `empty`.
- **Display** — `primitive/`: `badge`, `label`, `rating`, `avatar` (with its
  own `AvatarGroup` and the OkLCH identity ring).
- **Layout** — `primitive/`: `card`; `composite/`: `section_heading`,
  `sidebar_layout`, and the SwiftUI vocabulary `h_stack`, `v_stack`, `z_stack`,
  `spacer`, `scroll_view`, `v_grid`, `frame`, `alignment`.
- **Conversation** — `primitive/`: `bubble`; `composite/`: `message`, `marker`,
  `message_scroller` (one tolerated `gpui_base::motion` value-transition).
- **Controls** — `primitive/`: `button`, `checkbox`, `switch`, `radio`,
  `slider`; `composite/`: `stepper`, `pagination`; `primitive/`:
  `collapsible`. (`button` keeps two deliberate upstreams: the dropdown menu
  still rides `gpui-component`'s `PopupMenu`, and the value transition is
  `gpui_base::motion::transition`.)
- **Content** — `composite/`: `attachment`.

24 shims remain (the overlay family — `popover`, `dialog`, `sheet`, `hover_card`,
`menu`, `toast` — the text stack — `input`, `textarea`, `input_otp`,
`code_editor`, `text_editor`, `command` — and the heavy data widgets — `table`,
`tree`, `list`, `calendar`, `date_picker`, `carousel`, `charts`, `color_picker`,
`combobox`, `dock`, `sidebar`, `resizable`, `scroll_area`, plus the
`virtual_list` re-export). Everything else names at least one `gpui-base` module
directly, and the large ones close over ~45k upstream lines each — for those the
base layer is the next milestone, not another component batch. (`resizable` is
the one the analyzer cannot rank: it reports a zero because
`gpui_component::resizable` is an inline `pub mod` over `gpui-base` rather than a
file. A name that resolves to nothing is a red flag, not a cheap target.)

Two things make that measurement reproducible rather than remembered.
`scripts/ui-audit/gpui-migration-cost.py` resolves each shim's target module and
reports a **`gb1`** column — the `gpui-base` modules the target's *own* files
import, at depth 1. Read `gb1`, not the closure columns: a closure total
saturates at ~45k lines for nearly every shim *and* over-reaches (`stepper`'s
closure claims `markdown_ext`, `number_input` and `virtual_list`, which a stepper
plainly does not use). Depth 1 cannot be inflated transitively, so `gb1 == 0`
means a one-file port and nothing else does.

And a correction that reframes the whole remaining list: **`gpui-base` is not a
helper crate, it is the inner component library.** `gpui-component` is a thin
styling layer over it — upstream `checkbox.rs` is a struct holding
`base: gpui_base::Checkbox`, and `popover.rs` does
`use gpui_base::Popover as BasePopover`. Only the pure style helpers re-exported
through it (`h_flex` / `v_flex`, `StyledExt`, `RoleOverride`, `FocusableExt`,
`box_shadow`, `AxisExt`, `LengthExt`, `Edges`, `Placement`, `Side`, `Measure`)
are free to inline, which is why `title_bar` — zero of them — was cheap.

A raw-gpui file imports nothing but `gpui`. The recurring substitutions (the
left column is what the old facade exposed; the right is the origin crate):

| Was (`gpui-kit` facade) | Now |
| --- | --- |
| `use gpui_kit::{div, px, …}` | `use gpui::{div, px, …}` |
| `use gpui_kit::component::ActiveTheme` | `use crate::theme::ActiveTheme as _` |
| `gpui_kit::component::Icon` / `assets::IconName` | `crate::components::primitive::icon::{Phosphor, PhosphorIcon}` |
| `IconName::StarFill` | `Phosphor::new(PhosphorIcon::Star).weight(PhosphorWeight::Fill)` |
| `.refine_style(&style)` (gpui-base) | `el.style().refine(&style)` (core) |
| `h_flex()` / `v_flex()` (gpui-base) | `div().flex().flex_row()` / `div().flex().flex_col()`, **plus the cross-axis rule the helper supplied** — `h_flex()` is `.items_center()`, so a row that relied on it keeps an explicit `.items_center()` |
| `Tooltip::new(..).build(..)` | `.tooltip(\|_, cx\| cx.new(\|_\| MyHint).into())` |
| `Sizable` / `Size` (gpui-component) | a crate-local metric bucket, e.g. `DescriptionListSize`, `RatingSize`, `GpuiBadgeSize` |

Two traps worth knowing before starting a file: `ParentElement` must be imported
**by name** (not `as _`) if the file implements it, and `Styled` /
`InteractiveElement` / `Refineable` must be in scope or `h_4` / `child` / `id` /
`refine` silently fail to resolve. The full recipe — and how to pick the next
family by *transitive* cost rather than file size — lives in the module doc of
`crates/ui/src/components/mod.rs`.

The theme service (`cx.theme()`) is still `gpui-component`'s and is the last
piece scheduled to move; it is re-exported from `crate::theme` so component
files never name `gpui_component` directly.
The whole library re-themes at runtime through `celestia_ui::theme::AppTheme`
— one shadcn-style config (semantic colors per mode + one radius) applied
with `config.apply(cx)`; unset fields keep the `theme.json` defaults.
Multi-theme: `config.register("Nocturne", cx)` adds a named light/dark
family, `theme::select` / `theme::active` / `theme::families` switch and
list them.

The gallery (`pnpm desktop`) renders one section per family through the same
re-export layer an app would use: buttons/kbd/link, tags & badges, inputs &
selection, feedback, overlays (popover/tooltip/toast), the SwiftUI layout
vocabulary (HStack/VStack/ZStack/Spacer/VGrid — every alignment variant live,
plus an interactive playground), tabs/accordion/collapsible, palette swatches,
the two text editors, menus/dialogs/sheets, and pickers
(date / color / number). Usage examples follow `reference/gpui-kit` (the
upstream repo's `crates/story` — note it is v0.7.0; this workspace is pinned
to the published 0.6.x line, so verify signatures against the installed
source when they differ).

### Overlay layers (dialogs / sheets / toasts)

`Root::render()` does **not** draw the Dialog, Sheet or Notification layers —
the window's root view must mount them itself:

```rust
let dialog_layer = Root::render_dialog_layer(window, cx);
let sheet_layer = Root::render_sheet_layer(window, cx);
let notification_layer = Root::render_notification_layer(window, cx);
// ... .children(dialog_layer).children(sheet_layer).children(notification_layer)
```

Then open them with `WindowExt`: `window.open_dialog(cx, |dialog, _, _| …)`,
`window.open_sheet(cx, |sheet, _, _| …)`,
`window.push_notification(Notification::success("…"), cx)`.

### Text editors

- **`TextEditor`** — markdown editor: formatting toolbar (bold/italic/strike/
  code/link/heading/list/quote), auto-growing textarea, live word/char count.
  Entities, not `RenderOnce` elements, so counts refresh while typing.
- **`CodeEditor`** — highlighted code mode (the Monaco analog):
  `CodeEditor::new("rust", window, cx)`; languages come from the
  `tree-sitter-*` features enabled on `gpui-component` in the workspace
  `Cargo.toml`.

```rust
let editor = cx.new(|cx| TextEditor::new(window, cx));
editor.update(cx, |e, cx| e.set_text("# Hello", window, cx));
editor.update(cx, |e, cx| e.toggle_bold(window, cx));
```

## Commands

```bash
pnpm desktop                           # from the repo root: build & run the showcase window
cargo run -p celestia-desktop          # or directly from packages/desktop (⌘D / Ctrl+D toggles theme)
cargo test --workspace                 # unit + gpui TestAppContext tests
cargo fmt --all
cargo clippy --workspace --all-targets -- -D warnings
```

Requirements: Rust ≥ 1.97 (edition 2024). macOS needs no extra toolchain;
Linux needs Vulkan + Wayland/X11/fontconfig headers; Windows needs MSVC.
