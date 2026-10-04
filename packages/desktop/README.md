# Celestia Desktop (GPUI)

Native Rust desktop UI for the celestia-starter monorepo, built on
[GPUI Kit](https://github.com/longbridge/gpui-kit) 0.6 (the `gpui-kit` crate,
which pins the matching `gpui` / `gpui-component` versions). Modeled on the
GetCat reference in `reference/GetCat/`.

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
│     └─ composite/  # 28 compositions built out of primitives + app chrome
│        ├─ sidebar_layout.rs       # app shell: SidebarLayout + header/nav/item/footer
│        ├─ swiftui.rs              # SwiftUI-style layout: HStack/VStack/ZStack/Spacer/ScrollView/VGrid/Frame
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

Button::new("save")
    .variant(ButtonVariant::Primary)
    .size(ButtonSize::Small)
    .label("Save")
    .on_click(|_, window, cx| { /* … */ })
```

Components live under one of two category modules, mirroring
`packages/ui/src/components/{primitive,composite}`:

- **`primitive/`** — self-contained widgets that compose nothing but gpui
  elements and theme tokens (`button`, `badge`, `input`, `card`, `dialog`, …).
- **`composite/`** — components assembled from other components or carrying
  app-chrome structure (`sidebar_layout`, `list`, `menu`, `charts`, `swiftui`, …).

Everything else is a per-component re-export of gpui-component (each file's
doc comment records the web-file → desktop mapping, e.g. `drawer.tsx` →
`sheet`, `toast.tsx` → `toast.rs`, `file-tree.tsx` → `tree.rs`). Wrapper
types are flattened at `celestia_ui::components::*`; module-only components go
through their category-qualified path (`components::primitive::table::…`,
`components::composite::sidebar::…`). Raw hex only in `theme.json`/`palette.rs`;
call sites use `cx.theme()` / `palette(cx)`.

### Migrating off gpui-kit

`celestia-ui` depends on **both** `gpui-kit` and raw `gpui` (`gpui-pre`), pinned
to the same snapshot so the two name identical types. Components are being
rewritten off the facade one family at a time; `crates/ui/src/components/mod.rs`
tracks which are done. Migrated so far:

- **Feedback** — `primitive/`: `alert`, `progress`, `skeleton`, `spinner`,
  `shimmer`, `icon`; `composite/`: `loaders`, `notice`, `context_badge`.
- **Structural** — `primitive/`: `separator`, `kbd`, `link`, `breadcrumb`;
  `composite/`: `group_box`, `status_bar`, `description_list`, `empty`.
- **Display** — `primitive/`: `badge`, `label`, `rating`.

Pick the next family by **transitive cost, not file size** — a one-line
re-export whose target needs another unmigrated layer is not cheap. What remains
is mostly built on `gpui-base` state machines, so the base layer is the next
milestone.

A migrated file imports nothing from gpui-kit. The recurring substitutions:

| Was (gpui-kit) | Now (raw `gpui`) |
| --- | --- |
| `use gpui_kit::{div, px, …}` | `use gpui::{div, px, …}` |
| `use gpui_kit::component::ActiveTheme` | `use crate::theme::ActiveTheme as _` |
| `gpui_kit::component::Icon` / `assets::IconName` | `crate::components::primitive::icon::{Phosphor, PhosphorIcon}` |
| `IconName::StarFill` | `Phosphor::new(PhosphorIcon::Star).weight(PhosphorWeight::Fill)` |
| `.refine_style(&style)` (gpui-base) | `el.style().refine(&style)` (core) |
| `h_flex()` / `v_flex()` (gpui-base) | `div().flex().flex_row()` / `div().flex().flex_col()` |
| `Tooltip::new(..).build(..)` | `.tooltip(\|_, cx\| cx.new(\|_\| MyHint).into())` |
| `Sizable` / `Size` (gpui-component) | a crate-local metric bucket, e.g. `DescriptionListSize`, `RatingSize`, `GpuiBadgeSize` |

Two traps worth knowing before starting a file: `ParentElement` must be imported
**by name** (not `as _`) if the file implements it, and `Styled` /
`InteractiveElement` / `Refineable` must be in scope or `h_4` / `child` / `id` /
`refine` silently fail to resolve. The full recipe — and how to pick the next
family by *transitive* cost rather than file size — lives in the module doc of
`crates/ui/src/components/mod.rs`.

The theme service (`cx.theme()`) is still gpui-component's and is the last
piece scheduled to move; it is re-exported from `crate::theme` so component
files never name `gpui_kit` directly.
The whole library re-themes at runtime through `celestia_ui::theme::AppTheme`
— one shadcn-style config (semantic colors per mode + one radius) applied
with `config.apply(cx)`; unset fields keep the `theme.json` defaults.
Multi-theme: `config.register("Nocturne", cx)` adds a named light/dark
family, `theme::select` / `theme::active` / `theme::families` switch and
list them.

The gallery (`pnpm desktop`) renders one section per family through the same
re-export layer an app would use: buttons/kbd/link, tags & badges, inputs &
selection, feedback, overlays (popover/tooltip/toast), tabs, palette swatches,
the two text editors, menus/dialogs/sheets, accordion, and pickers
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
  `tree-sitter-*` features enabled on `gpui-kit` in the workspace `Cargo.toml`.

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
