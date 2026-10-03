"use client"

import * as React from "react"
import Link from "next/link"
import {
  ArrowRightIcon,
  CheckCircleIcon,
  DesktopIcon,
  InfoIcon,
  WarningIcon,
} from "@phosphor-icons/react"
import {
  Alert,
  AlertDescription,
  AlertTitle,
  Badge,
  Button,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@celestia-project/ui"
import { cn } from "@celestia-project/ui/lib/utils"

const DOCS_HREF = "/docs/desktop"

/* -------------------------------------------------------------------------- */
/* Layout helpers — same idioms as the mobile showcase surface                 */
/* -------------------------------------------------------------------------- */

function SectionHeader({
  id,
  eyebrow,
  title,
  description,
}: {
  id: string
  eyebrow: string
  title: string
  description: React.ReactNode
}) {
  return (
    <header
      id={id}
      className="flex scroll-mt-24 flex-col gap-2 pt-10 first:pt-0"
    >
      <p className="text-2xs font-semibold tracking-wider text-muted-foreground uppercase">
        {eyebrow}
      </p>
      <h2 className="text-xl font-bold tracking-tight sm:text-2xl">{title}</h2>
      <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">
        {description}
      </p>
    </header>
  )
}

const PANEL = "border border-border/70 ring-0"
const PANEL_XL = cn(PANEL, "rounded-xl sm:[--card-spacing:--spacing(5)]")
const PANEL_LG = cn(PANEL, "rounded-lg")
/** A `Card` that is nothing but a table — no padding of its own. */
const PANEL_FLUSH = cn(PANEL_XL, "gap-0 py-0")

const CALLOUT = "gap-3 rounded-xl px-4 py-4 has-[>svg]:gap-x-3"
const CALLOUT_SURFACE = {
  info: "border-border/70 bg-muted/40",
  warn: "border-warning/30 bg-warning/5",
  tip: "border-success/30 bg-success/5",
} as const
const CALLOUT_ICON = {
  info: "text-muted-foreground",
  warn: "text-warning",
  tip: "text-success",
} as const

function Command({ code, label }: { code: string; label: string }) {
  const [copied, setCopied] = React.useState(false)
  const timer = React.useRef<ReturnType<typeof setTimeout> | null>(null)

  React.useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current)
    },
    []
  )

  const copy = () => {
    navigator.clipboard.writeText(code).then(() => {
      setCopied(true)
      if (timer.current) clearTimeout(timer.current)
      timer.current = setTimeout(() => setCopied(false), 1600)
    })
  }

  return (
    <Card className={cn(PANEL_LG, "gap-0 bg-muted/40 py-0")}>
      <div className="flex items-center justify-between gap-2 border-b border-border/50 px-3 py-1.5">
        <span className="font-mono text-4xs tracking-wider text-muted-foreground uppercase">
          {label}
        </span>
        <Button
          type="button"
          variant="quiet"
          size="xs"
          onClick={copy}
          className="text-4xs"
        >
          {copied ? "Copied" : "Copy"}
        </Button>
      </div>
      <pre className="px-3 py-2.5">
        <code className="font-mono text-2xs leading-relaxed break-words whitespace-pre-wrap">
          {code}
        </code>
      </pre>
    </Card>
  )
}

/* -------------------------------------------------------------------------- */
/* Data                                                                        */
/* -------------------------------------------------------------------------- */

const FAMILIES = [
  {
    id: "actions",
    name: "actions",
    modules: "button.rs (wrapper) · kbd.rs · link.rs · command.rs · menu.rs",
    web: "button.tsx, kbd.tsx, link.tsx, command.tsx, dropdown/context/menubar",
  },
  {
    id: "inputs",
    name: "inputs",
    modules:
      "input.rs · textarea.rs · input_otp.rs · select.rs · combobox.rs · switch.rs · checkbox.rs · radio.rs · slider.rs · rating.rs · stepper.rs · label.rs · calendar.rs · date_picker.rs · color_picker.rs",
    web: "input.tsx, textarea.tsx, input-otp.tsx, select.tsx, switch.tsx, checkbox.tsx, radio-group.tsx, slider.tsx, calendar.tsx, label.tsx",
  },
  {
    id: "feedback",
    name: "feedback",
    modules:
      "alert.rs · toast.rs · progress.rs · spinner.rs · skeleton.rs · shimmer.rs · tooltip.rs",
    web: "alert.tsx, toast.tsx / sonner.tsx, progress.tsx, spinner.tsx, skeleton.tsx, tooltip.tsx",
  },
  {
    id: "overlays",
    name: "overlays",
    modules: "popover.rs · dialog.rs · sheet.rs · hover_card.rs",
    web: "popover.tsx, dialog.tsx, drawer.tsx / sheet.tsx, hover-card.tsx",
  },
  {
    id: "data_display",
    name: "data display",
    modules:
      "badge.rs (wrapper) · avatar.rs · breadcrumb.rs · table.rs · list.rs · tree.rs · pagination.rs · marker.rs · empty.rs · description_list.rs",
    web: "badge.tsx, avatar.tsx, breadcrumb.tsx, table.tsx, item.tsx, ai/file-tree.tsx, pagination.tsx, marker.tsx, empty.tsx",
  },
  {
    id: "layout",
    name: "layout",
    modules:
      "separator.rs · tabs.rs · accordion.rs · collapsible.rs · carousel.rs · resizable.rs · scroll_area.rs · group_box.rs · sidebar.rs · dock.rs · title_bar.rs · status_bar.rs",
    web: "separator.tsx, tabs.tsx, accordion.tsx / collapsible.tsx, carousel.tsx, resizable.tsx, scroll-area.tsx, sidebar.tsx — dock & window chrome are desktop-only",
  },
  {
    id: "chat",
    name: "chat",
    modules: "bubble.rs · message.rs · attachment.rs",
    web: "the ai/ family's bubble, chat-message, message-scroller, attachment",
  },
  {
    id: "editors",
    name: "editors",
    modules: "text_editor.rs · code_editor.rs",
    web: "text-editor.tsx / block-text-editor (markdown toolbar + tree-sitter code mode)",
  },
  {
    id: "charts",
    name: "charts",
    modules: "charts.rs (chart · plot)",
    web: "chart.tsx + the chart-*.tsx composites — series colors from palette(cx).chart(i)",
  },
]

const SWATCHES = [
  { label: "primary", css: "var(--primary)" },
  { label: "success", css: "var(--success)" },
  { label: "warning", css: "var(--warning)" },
  { label: "info", css: "var(--info)" },
  { label: "danger", css: "var(--danger)" },
  { label: "brand", css: "var(--brand)" },
  { label: "brand-deep", css: "var(--brand-deep)" },
  { label: "chart-1", css: "var(--chart-1)" },
  { label: "chart-5", css: "var(--chart-5)" },
] as const

/* -------------------------------------------------------------------------- */
/* Sections                                                                    */
/* -------------------------------------------------------------------------- */

function Hero() {
  const stats = [
    { label: "gpui modules surfaced", value: "~60" },
    { label: "primitive files", value: "40+" },
    { label: "themes (light/dark)", value: "2" },
    { label: "crates", value: "2" },
  ]

  return (
    <div className="flex flex-col gap-6 pt-2">
      <div className="flex flex-wrap items-center gap-2">
        <Badge variant="secondary" className="font-mono">
          celestia-ui (rust crate)
        </Badge>
        <Badge variant="outline" className="font-mono">
          gpui-kit 0.6
        </Badge>
        <Badge variant="outline" className="font-mono">
          Rust ≥ 1.97
        </Badge>
        <Badge variant="outline" className="font-mono">
          macOS · Linux · Windows
        </Badge>
      </div>

      <div className="flex flex-col gap-3">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          Desktop
        </h1>
        <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-base">
          Native Rust desktop components built on GPUI through{" "}
          <code className="rounded-md border border-border/70 bg-muted/60 px-1.5 py-0.5 font-mono text-xs">
            gpui-kit
          </code>{" "}
          — the desktop counterpart of{" "}
          <code className="rounded-md border border-border/70 bg-muted/60 px-1.5 py-0.5 font-mono text-xs">
            @celestia-project/ui
          </code>
          , drawing the same Celestia tokens as a compile-time theme. This
          surface shows the shape of the package; the{" "}
          <Link
            href={DOCS_HREF}
            className="font-medium text-foreground underline underline-offset-4"
          >
            reference docs
          </Link>{" "}
          carry the architecture, theming rules and the per-primitive component
          map.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {stats.map((stat) => (
          <Card
            key={stat.label}
            className={cn(PANEL, "rounded-xl [--card-spacing:--spacing(3)]")}
          >
            <CardContent className="flex flex-col gap-0.5">
              <span className="text-2xl font-bold tracking-tight tabular-nums">
                {stat.value}
              </span>
              <span className="text-2xs font-medium tracking-wide text-muted-foreground uppercase">
                {stat.label}
              </span>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Button render={<Link href={DOCS_HREF} />}>
          Read the docs
          <ArrowRightIcon className="size-3.5" />
        </Button>
        <Button variant="outline" render={<Link href="#run" />}>
          <DesktopIcon className="size-3.5" />
          Run the gallery window
        </Button>
      </div>
    </div>
  )
}

function Overview() {
  return (
    <section className="flex flex-col gap-4">
      <SectionHeader
        id="overview"
        eyebrow="Get started"
        title="What this package is"
        description="Two crates, one rule: colors come from roles, never from hex literals at a call site."
      />

      <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">
        <code className="font-mono text-2xs">packages/ui</code> wraps Base UI
        primitives with celestia tokens;{" "}
        <code className="font-mono text-2xs">celestia-ui</code> wraps the
        gpui-component library the same way — one file per primitive, so most
        web files map 1:1 onto a desktop file (
        <code className="font-mono text-2xs">drawer.tsx</code> →{" "}
        <code className="font-mono text-2xs">sheet.rs</code>,{" "}
        <code className="font-mono text-2xs">toast.tsx</code> →{" "}
        <code className="font-mono text-2xs">toast.rs</code>,{" "}
        <code className="font-mono text-2xs">file-tree.tsx</code> →{" "}
        <code className="font-mono text-2xs">tree.rs</code>). It is not a port —
        the web components assume a DOM; these draw straight into a GPU window.
        What they share is the taxonomy and the design tokens, plus
        shadcn-shaped wrappers (
        <code className="font-mono text-2xs">Button</code> and{" "}
        <code className="font-mono text-2xs">Badge</code> carry real{" "}
        <code className="font-mono text-2xs">Variant</code> props).
      </p>

      <div className="grid gap-3 sm:grid-cols-2">
        <Alert className={cn(CALLOUT, CALLOUT_SURFACE.info)}>
          <InfoIcon
            className={cn("mt-0.5 size-4 shrink-0", CALLOUT_ICON.info)}
            weight="duotone"
          />
          <AlertTitle className="text-xs font-semibold text-foreground">
            Invisible to pnpm and turbo
          </AlertTitle>
          <AlertDescription className="text-xs leading-relaxed text-muted-foreground">
            A self-contained Cargo workspace — no package.json, so turbo tasks
            never see it. Run <code className="font-mono text-2xs">cargo</code>{" "}
            directly inside{" "}
            <code className="font-mono text-2xs">packages/desktop</code>, or use
            the root <code className="font-mono text-2xs">pnpm desktop</code>{" "}
            script, which shells into cargo.
          </AlertDescription>
        </Alert>
        <Alert className={cn(CALLOUT, CALLOUT_SURFACE.tip)}>
          <CheckCircleIcon
            className={cn("mt-0.5 size-4 shrink-0", CALLOUT_ICON.tip)}
            weight="duotone"
          />
          <AlertTitle className="text-xs font-semibold text-foreground">
            One source of truth for tokens
          </AlertTitle>
          <AlertDescription className="text-xs leading-relaxed text-muted-foreground">
            <code className="font-mono text-2xs">theme.json</code> is the
            sRGB-hex port of{" "}
            <code className="font-mono text-2xs">globals.css</code> — the web
            file stays authoritative. Raw hex lives only in{" "}
            <code className="font-mono text-2xs">theme.json</code> and{" "}
            <code className="font-mono text-2xs">palette.rs</code>; tests pin
            the values so a stale re-port fails CI.
          </AlertDescription>
        </Alert>
      </div>
    </section>
  )
}

function Run() {
  return (
    <section className="flex flex-col gap-4">
      <SectionHeader
        id="run"
        eyebrow="Get started"
        title="Run the gallery"
        description="The showcase binary renders one Card section per family through the same re-export layer an app would use — buttons and badges, inputs and selection, alerts and toasts, a live popover/dialog/sheet, an accordion, date/color/number pickers, and both text editors (markdown toolbar + tree-sitter code mode). ⌘D / Ctrl+D toggles light/dark."
      />

      <div className="grid gap-3 lg:grid-cols-2">
        <Command code="pnpm desktop" label="from the repo root" />
        <Command
          code="cargo run -p celestia-desktop"
          label="from packages/desktop/"
        />
      </div>

      <Card className={PANEL_FLUSH}>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-40">Platform</TableHead>
              <TableHead>Toolchain</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell className="font-mono text-2xs">macOS</TableCell>
              <TableCell className="text-xs text-muted-foreground">
                None beyond Rust ≥ 1.97 (edition 2024)
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-mono text-2xs">Linux</TableCell>
              <TableCell className="text-xs text-muted-foreground">
                Vulkan + Wayland/X11/fontconfig headers
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-mono text-2xs">Windows</TableCell>
              <TableCell className="text-xs text-muted-foreground">
                MSVC
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </Card>

      <Command
        code={`cargo test --workspace                # unit + gpui TestAppContext tests (theme pins)\ncargo fmt --all\ncargo clippy --workspace --all-targets -- -D warnings`}
        label="quality gates — inside packages/desktop/"
      />
    </section>
  )
}

function Families() {
  return (
    <section className="flex flex-col gap-4">
      <SectionHeader
        id="families"
        eyebrow="Components"
        title="One file per primitive"
        description="Every primitive gets its own file mirroring packages/ui's primitive/*.tsx — Celestia wrappers (button.rs, badge.rs, card.rs, the editors) plus per-primitive re-exports of gpui-component, each with the web → desktop mapping in its doc comment."
      />

      <div className="grid gap-3 sm:grid-cols-2">
        {FAMILIES.map((family) => (
          <Card key={family.id} className={cn(PANEL_XL, "gap-2")}>
            <CardContent className="flex flex-col gap-2">
              <code className="font-mono text-xs font-semibold text-foreground">
                {family.name}
              </code>
              <p className="font-mono text-2xs leading-relaxed text-muted-foreground">
                {family.modules}
              </p>
              <p className="text-2xs leading-relaxed text-muted-foreground/80">
                web: {family.web}
              </p>
            </CardContent>
          </Card>
        ))}
        <Card className={cn(PANEL_XL, "gap-2")}>
          <CardContent className="flex flex-col gap-2">
            <code className="font-mono text-xs font-semibold text-foreground">
              card.rs · section_heading.rs
            </code>
            <p className="text-2xs leading-relaxed text-muted-foreground">
              Celestia-only builds — components gpui-component lacks, written
              against the token layer. SectionHeading ports the agency idiom
              (eyebrow + title + description). The wrappers{" "}
              <code className="font-mono text-2xs">button.rs</code> /{" "}
              <code className="font-mono text-2xs">badge.rs</code> add
              shadcn-shaped <code className="font-mono text-2xs">Variant</code>{" "}
              props on top of gpui primitives.
            </p>
          </CardContent>
        </Card>
      </div>
    </section>
  )
}

function Tokens() {
  return (
    <section className="flex flex-col gap-4">
      <SectionHeader
        id="tokens"
        eyebrow="Theming"
        title="The same tokens, compiled in"
        description="celestia_ui::init installs the light/dark palettes and replaces gpui-kit's defaults — Theme::change and system-appearance sync keep using them. The swatches below are the live web tokens; the native gallery renders the same roles from the ported theme."
      />

      <Card className={cn(PANEL_XL, "gap-3")}>
        <CardContent className="flex flex-wrap gap-3">
          {SWATCHES.map((swatch) => (
            <div key={swatch.label} className="flex w-20 flex-col gap-1">
              <div
                className="h-8 rounded border border-border"
                style={{ background: swatch.css }}
              />
              <span className="text-2xs text-muted-foreground">
                {swatch.label}
              </span>
            </div>
          ))}
        </CardContent>
      </Card>

      <p className="max-w-2xl text-xs leading-relaxed text-muted-foreground">
        Beyond the semantic roles,{" "}
        <code className="font-mono text-2xs">palette(cx)</code> carries the
        mode-independent product colors gpui's Theme has no slot for:{" "}
        <code className="font-mono text-2xs">brand</code> (#dc2626),{" "}
        <code className="font-mono text-2xs">brand_deep</code> (#b51230),{" "}
        <code className="font-mono text-2xs">brand_foreground</code> and the
        grayscale <code className="font-mono text-2xs">chart(0…4)</code> ramp —
        mirroring the web where these live once on{" "}
        <code className="font-mono text-2xs">:root</code> and never change in
        dark mode.
      </p>
    </section>
  )
}

function Bootstrap() {
  return (
    <section className="flex flex-col gap-4">
      <SectionHeader
        id="bootstrap"
        eyebrow="Apps"
        title="App bootstrap in three lines"
        description="Install the runtime + theme, open a window, wrap the root view in a gpui-kit Root — then mount the overlay layers yourself, because Root::render does not draw them."
      />
      <Command
        code={`gpui_kit::platform::application().run(|cx: &mut App| {
    celestia_ui::init(cx);                    // runtime + Celestia light/dark themes
    cx.open_window(WindowOptions { ..TitleBar::window_options() }, |window, cx| {
        let view = cx.new(|cx| MyApp::new(window, cx));
        cx.new(|cx| Root::new(view, window, cx))
    })?;
    cx.activate(true);
});`}
        label="rust — the full reference bootstrap lives in crates/celestia-desktop/src/main.rs"
      />
      <Command
        code={`// inside MyApp::render — dialogs, sheets and toasts are invisible until
// the root view mounts their layers:
let dialog_layer = Root::render_dialog_layer(window, cx);
let sheet_layer = Root::render_sheet_layer(window, cx);
let notification_layer = Root::render_notification_layer(window, cx);
div().child(self.content(cx))
    .children(dialog_layer)
    .children(sheet_layer)
    .children(notification_layer)`}
        label="rust — mount the overlay layers (WindowExt opens them: open_dialog / open_sheet / push_notification)"
      />
      <Alert className={cn(CALLOUT, CALLOUT_SURFACE.warn)}>
        <WarningIcon
          className={cn("mt-0.5 size-4 shrink-0", CALLOUT_ICON.warn)}
          weight="duotone"
        />
        <AlertTitle className="text-xs font-semibold text-foreground">
          GPUI first-contact gotchas
        </AlertTitle>
        <AlertDescription className="text-xs leading-relaxed text-muted-foreground">
          Custom primitives need both{" "}
          <code className="font-mono text-2xs">impl RenderOnce</code> and{" "}
          <code className="font-mono text-2xs">#[derive(IntoElement)]</code>;{" "}
          <code className="font-mono text-2xs">cx.theme().radius</code> is
          already a <code className="font-mono text-2xs">Pixels</code> value;
          the root element should hold focus with an id and a role; and{" "}
          <code className="font-mono text-2xs">Root::render</code> never draws
          the Dialog/Sheet/Notification layers — unmounted layers swallow{" "}
          <code className="font-mono text-2xs">push_notification</code>{" "}
          silently.
        </AlertDescription>
      </Alert>
    </section>
  )
}

export function DesktopPageContent() {
  return (
    <main className="mx-auto max-w-5xl px-5 pb-24 sm:px-8">
      <div className="flex flex-col gap-4 py-10 sm:py-14">
        <Hero />
        <Overview />
        <Run />
        <Families />
        <Tokens />
        <Bootstrap />
      </div>
    </main>
  )
}
