"use client"

import * as React from "react"
import Link from "next/link"
import {
  ArrowRightIcon,
  ArrowSquareOutIcon,
  CheckCircleIcon,
  DeviceMobileIcon,
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
  Separator,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@celestia-project/ui"
import { cn } from "@celestia-project/ui/lib/utils"
import { MobileNavSidebar } from "@/components/shared/nav-sidebar"
import { MobileSidebar, MOBILE_SIDEBAR_GROUPS } from "./mobile-sidebar"
import { MOBILE_SPECIMENS } from "./specimens"
import {
  MOBILE_CATEGORIES,
  MOBILE_ENTRY_POINTS,
  MOBILE_MODULE_TOTAL,
  MOBILE_PLATFORM,
  MOBILE_RULES,
  MOBILE_SECTIONS,
  MOBILE_UNIVERSAL_IMPLEMENTATIONS,
  MOBILE_WEB_CAVEATS,
  MOBILE_WEB_PACKAGES,
} from "@/lib/mobile-showcase"

const DOCS_HREF = "/docs/mobile"
const REPO_HREF = "https://github.com/dev-celestia/celestia-starter"

/* -------------------------------------------------------------------------- */
/* Layout helpers                                                              */
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

/* -------------------------------------------------------------------------- */
/* Panel and callout geometry                                                  */
/* -------------------------------------------------------------------------- */

/**
 * Panels on this surface are the library's `Card`, not a hand-rolled div.
 *
 * Two overrides hold the geometry the page already had: `Card` ships an 8px
 * radius and a 1px ring, where these panels are 12px with a `border-border/70`
 * border. Padding is left to `Card`'s own `--card-spacing` variable, which
 * drives `Card`'s vertical padding and `CardContent`'s horizontal padding from
 * one value — so a single override steps both axes at `sm`.
 */
const PANEL = "border border-border/70 ring-0"

/** The standard panel: 12px radius, 16px padding stepping to 20px at `sm`. */
const PANEL_XL = cn(PANEL, "rounded-xl sm:[--card-spacing:--spacing(5)]")

/** The smaller tiles: 8px radius, padding set per call site. */
const PANEL_LG = cn(PANEL, "rounded-lg")

/** A `Card` that is nothing but a table — no padding of its own. */
const PANEL_FLUSH = cn(PANEL_XL, "gap-0 py-0")

/**
 * `Alert` at this surface's callout geometry: 12px radius, 16px padding and a
 * 12px icon gutter (the library's `has-[>svg]` step is 6px).
 */
const CALLOUT = "gap-3 rounded-xl px-4 py-4 has-[>svg]:gap-x-3"

/**
 * Tone, as data rather than a bespoke component.
 *
 * The library's `Alert` variants tint the copy itself; these callouts tint the
 * surface and the icon and leave the text neutral. So the tone rides on the
 * class rather than on `variant`, and `variant` stays at its default.
 */
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

/**
 * A labelled, copyable shell command.
 *
 * There is no library equivalent — `CodeBlock` is a syntax-highlighted reader,
 * not a copy affordance — so this stays an app-level composite. It is built from
 * the library's parts: a `Card` for the surface, a `Button` for the copy action.
 */
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
      {/* A plain <pre>: a one-line shell command gains nothing from a syntax
          highlighter, and the shared CodeBlock carries a pre-existing
          server/client render mismatch that this surface should not inherit.
          Wraps rather than scrolls — a command you have to scroll to read is a
          command you cannot copy by eye. */}
      <pre className="px-3 py-2.5">
        <code className="font-mono text-2xs leading-relaxed break-words whitespace-pre-wrap">
          {code}
        </code>
      </pre>
    </Card>
  )
}

/* -------------------------------------------------------------------------- */
/* Sections                                                                    */
/* -------------------------------------------------------------------------- */

function Hero() {
  const stats = [
    { label: "Modules", value: MOBILE_MODULE_TOTAL },
    ...MOBILE_CATEGORIES.map((category) => ({
      label: category.name,
      value: category.count,
    })),
  ]

  return (
    <div className="flex flex-col gap-6 pt-2">
      <div className="flex flex-wrap items-center gap-2">
        <Badge variant="secondary" className="font-mono">
          @celestia-project/mobile
        </Badge>
        <Badge variant="outline" className="font-mono">
          Expo SDK 57
        </Badge>
        <Badge variant="outline" className="font-mono">
          iOS · Android · Web
        </Badge>
      </div>

      <div className="flex flex-col gap-3">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          Mobile
        </h1>
        <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-base">
          Native iOS and Android components built on{" "}
          <code className="rounded-md border border-border/70 bg-muted/60 px-1.5 py-0.5 font-mono text-xs">
            @expo/ui
          </code>{" "}
          — real SwiftUI and Jetpack Compose views, organised into primitives,
          composites, AI surfaces and layout screens. Web is served by the same
          components through{" "}
          <code className="rounded-md border border-border/70 bg-muted/60 px-1.5 py-0.5 font-mono text-xs">
            @expo/ui
          </code>
          &apos;s universal entry. This surface shows the shapes; the{" "}
          <Link
            href={DOCS_HREF}
            className="font-medium text-foreground underline underline-offset-4"
          >
            reference docs
          </Link>{" "}
          carry the install, the peer dependencies and the API.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
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
        <Button
          render={<Link href={DOCS_HREF} />}
        >
          Read the docs
          <ArrowRightIcon className="size-3.5" />
        </Button>
        <Button
          variant="outline"
          render={<Link href="#showcase" />}
        >
          <DeviceMobileIcon className="size-3.5" />
          Run it in Expo Go
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
        description="The native counterpart to @celestia-project/ui — and deliberately not a port of it."
      />

      <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">
        The web components assume a DOM, hover states and a CSS box model. These
        assume a thumb, a safe area and a touch-target floor. What the two
        packages share is the{" "}
        <span className="font-medium text-foreground">taxonomy</span> — the same
        primitive / composite / ai / layout split — and the{" "}
        <span className="font-medium text-foreground">design tokens</span>, so a
        component sits in the same mental bucket whichever library you are in.
        That shared taxonomy is also the escape hatch: when a screen needs a
        first-class web implementation rather than the universal entry&apos;s
        DOM rendering, it can be rebuilt on{" "}
        <code className="font-mono text-2xs">@celestia-project/ui</code> with
        the same names and the same tokens.
      </p>

      <div className="grid gap-3 sm:grid-cols-2">
        <Alert className={cn(CALLOUT, CALLOUT_SURFACE.info)}>
          <InfoIcon
            className={cn("mt-0.5 size-4 shrink-0", CALLOUT_ICON.info)}
            weight="duotone"
          />
          <AlertTitle className="text-xs font-semibold text-foreground">
            Routing- and data-agnostic by contract
          </AlertTitle>
          <AlertDescription className="text-xs leading-relaxed text-muted-foreground">
            Every component is presentational: props in, callbacks out. No
            navigation library, no data fetching, no auth client. The host app
            owns routing, data and session state — which is why the package has
            no dependency on{" "}
            <code className="font-mono text-2xs">apps/api</code> and drops into
            any Expo project.
          </AlertDescription>
        </Alert>
        <Alert className={cn(CALLOUT, CALLOUT_SURFACE.tip)}>
          <CheckCircleIcon
            className={cn("mt-0.5 size-4 shrink-0", CALLOUT_ICON.tip)}
            weight="duotone"
          />
          <AlertTitle className="text-xs font-semibold text-foreground">
            Published alongside the web library
          </AlertTitle>
          <AlertDescription className="text-xs leading-relaxed text-muted-foreground">
            Part of the npm publish set:{" "}
            <code className="font-mono text-2xs">publish.sh</code> ships{" "}
            <code className="font-mono text-2xs">@celestia-project/ui</code>,{" "}
            <code className="font-mono text-2xs">@celestia-project/create</code>{" "}
            and{" "}
            <code className="font-mono text-2xs">@celestia-project/mobile</code>
            . Inside the workspace it resolves from source through the workspace
            protocol.
          </AlertDescription>
        </Alert>
      </div>

      <Card className={PANEL_FLUSH}>
        <Table className="text-left">
          <TableHeader className="[&_tr]:border-border/60">
            <TableRow className="hover:bg-transparent">
              <TableHead className="h-auto px-4 py-2.5 font-medium text-muted-foreground">
                Path
              </TableHead>
              <TableHead className="h-auto px-4 py-2.5 font-medium text-muted-foreground">
                What it is
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow className="border-border/40 hover:bg-transparent">
              <TableCell mono className="px-4 py-2.5 text-2xs">
                packages/mobile
              </TableCell>
              <TableCell className="px-4 py-2.5 text-muted-foreground">
                The library (
                <code className="font-mono text-2xs">
                  @celestia-project/mobile
                </code>
                )
              </TableCell>
            </TableRow>
            <TableRow className="border-border/40 hover:bg-transparent">
              <TableCell mono className="px-4 py-2.5 text-2xs">
                apps/mobile
              </TableCell>
              <TableCell className="px-4 py-2.5 text-muted-foreground">
                The Expo showcase app that consumes it
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </Card>
    </section>
  )
}

function Showcase() {
  return (
    <section className="flex flex-col gap-4">
      <SectionHeader
        id="showcase"
        eyebrow="Get started"
        title="Run in Expo Go"
        description="Everything on this page is an HTML transcription. The running components — the real SwiftUI and Jetpack Compose views included — live in the Expo showcase app, and Expo Go runs it with no native build."
      />

      <div className="grid gap-3 sm:grid-cols-3">
        {[
          {
            step: "01",
            title: "Install Expo Go on your phone",
            detail:
              "The sandbox client from the App Store or Google Play. @expo/ui ships inside it, so the hosted native views work without a development build.",
          },
          {
            step: "02",
            title: "Start the Metro dev server",
            detail:
              "Run the command below from the repository root and leave the terminal open — it prints the QR code and keeps the bundle served.",
          },
          {
            step: "03",
            title: "Scan the QR code",
            detail:
              "With the Expo Go camera (iOS) or straight from the app (Android). The showcase opens on the device — pick a section from its root list.",
          },
        ].map((item) => (
          <Card key={item.step} className={PANEL_XL}>
            <CardContent className="flex gap-3">
              <span className="shrink-0 font-mono text-xs text-muted-foreground/60 tabular-nums">
                {item.step}
              </span>
              <span className="flex min-w-0 flex-col gap-1">
                <span className="text-xs font-semibold">{item.title}</span>
                <span className="text-2xs leading-relaxed text-muted-foreground">
                  {item.detail}
                </span>
              </span>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-3 lg:grid-cols-2">
        <div className="flex flex-col gap-2">
          <h3 className="text-xs font-semibold">On your phone</h3>
          <Command label="terminal" code="pnpm mobile" />
        </div>
        <div className="flex flex-col gap-2">
          <h3 className="text-xs font-semibold">On this machine instead</h3>
          <Command
            label="terminal"
            code={
              "pnpm --filter mobile web   # browser\npnpm --filter mobile ios   # simulator"
            }
          />
        </div>
      </div>

      <Alert className={cn(CALLOUT, CALLOUT_SURFACE.tip)}>
        <CheckCircleIcon
          className={cn("mt-0.5 size-4 shrink-0", CALLOUT_ICON.tip)}
          weight="duotone"
        />
        <AlertTitle className="text-xs font-semibold text-foreground">
          Why Expo Go is enough
        </AlertTitle>
        <AlertDescription className="text-xs leading-relaxed text-muted-foreground">
          <code className="font-mono text-2xs">@expo/ui</code> is bundled inside
          the Expo Go client, so the SwiftUI / Compose views run in the sandbox
          app with no Xcode, no Android SDK and no development build. A dev
          build (<code className="font-mono text-2xs">npx expo run:ios</code>)
          is only needed once you add native code of your own.
        </AlertDescription>
      </Alert>
    </section>
  )
}

function Specimens() {
  return (
    <section
      id="specimens"
      className="@container flex scroll-mt-24 flex-col gap-4 pt-8"
    >
      <div className="flex flex-col gap-2">
        <h3 className="text-sm font-semibold">In the hand</h3>
        <p className="max-w-2xl text-xs leading-relaxed text-muted-foreground">
          The primitives and composites, drawn at the package&apos;s real
          metrics — the 44pt touch floor, the 10pt control radius, the 11 / 12 /
          14 / 16px type steps. These are transcriptions rather than the running
          components — this page is a Next.js app and does not depend on the
          React Native library — so to interact with the real ones,{" "}
          <Link
            href="#showcase"
            className="font-medium text-foreground underline underline-offset-4"
          >
            run them in Expo Go
          </Link>
          .
        </p>
      </div>

      <div className="grid gap-3 @xl:grid-cols-2 @4xl:grid-cols-3">
        {MOBILE_SPECIMENS.map((Specimen) => (
          <Specimen key={Specimen.name} />
        ))}
      </div>
    </section>
  )
}

function Rules() {
  return (
    <section className="flex flex-col gap-4">
      <SectionHeader
        id="rules"
        eyebrow="Guidance"
        title="Design rules"
        description="Enforced by convention and review, not by a linter — which is exactly why they are worth knowing before adding a component."
      />

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {MOBILE_RULES.map((rule, index) => (
          <Card key={rule.title} className={PANEL_XL}>
            <CardContent className="flex gap-3">
              <span className="shrink-0 font-mono text-xs text-muted-foreground/60 tabular-nums">
                {String(index + 1).padStart(2, "0")}
              </span>
              <span className="flex min-w-0 flex-col gap-1">
                <span className="text-xs font-semibold">{rule.title}</span>
                <span className="text-2xs leading-relaxed text-muted-foreground">
                  {rule.detail}
                </span>
              </span>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  )
}

function Platform() {
  const mark = (state: "yes" | "no" | "partial") =>
    state === "yes" ? (
      <span className="text-xs text-success" aria-label="supported">
        ✓
      </span>
    ) : state === "partial" ? (
      <span className="text-xs text-warning" aria-label="partial">
        ~
      </span>
    ) : (
      <span
        className="text-xs text-muted-foreground/50"
        aria-label="not supported"
      >
        ✕
      </span>
    )

  return (
    <section className="flex flex-col gap-4">
      <SectionHeader
        id="platform"
        eyebrow="Guidance"
        title="Platform support"
        description="The library targets iOS, Android and web. The native platforms get real SwiftUI and Jetpack Compose views; web is served by @expo/ui's universal entry — which is what every component in this package imports."
      />

      <Card className={PANEL_FLUSH}>
        <Table className="min-w-[560px] text-left">
          <TableHeader className="[&_tr]:border-border/60">
            <TableRow className="hover:bg-transparent">
              <TableHead className="h-auto px-4 py-2.5 font-medium text-muted-foreground">
                Capability
              </TableHead>
              <TableHead className="h-auto w-16 px-4 py-2.5 text-center font-medium text-muted-foreground">
                iOS
              </TableHead>
              <TableHead className="h-auto w-20 px-4 py-2.5 text-center font-medium text-muted-foreground">
                Android
              </TableHead>
              <TableHead className="h-auto w-16 px-4 py-2.5 text-center font-medium text-muted-foreground">
                Web
              </TableHead>
              <TableHead className="h-auto px-4 py-2.5 font-medium text-muted-foreground">
                Note
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {MOBILE_PLATFORM.map((row) => (
              <TableRow
                key={row.capability}
                className="border-border/40 hover:bg-transparent"
              >
                <TableCell className="px-4 py-2.5">{row.capability}</TableCell>
                <TableCell className="px-4 py-2.5 text-center">
                  {mark(row.ios)}
                </TableCell>
                <TableCell className="px-4 py-2.5 text-center">
                  {mark(row.android)}
                </TableCell>
                <TableCell className="px-4 py-2.5 text-center">
                  {mark(row.web)}
                </TableCell>
                <TableCell className="px-4 py-2.5 text-2xs text-muted-foreground">
                  {row.note}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      {/* The entry point is the whole story, and the most misread thing here. */}
      <div className="flex flex-col gap-3">
        <h3 className="text-sm font-semibold">
          Which entry point you import decides whether web works
        </h3>
        <Card className={PANEL_FLUSH}>
          <Table className="min-w-[560px] text-left">
            <TableHeader className="[&_tr]:border-border/60">
              <TableRow className="hover:bg-transparent">
                <TableHead className="h-auto px-4 py-2.5 font-medium text-muted-foreground">
                  Import
                </TableHead>
                <TableHead className="h-auto px-4 py-2.5 font-medium text-muted-foreground">
                  Implementation
                </TableHead>
                <TableHead className="h-auto w-40 px-4 py-2.5 font-medium text-muted-foreground">
                  Platforms
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {MOBILE_ENTRY_POINTS.map((entry) => (
                <TableRow
                  key={entry.specifier}
                  className="border-border/40 hover:bg-transparent"
                >
                  <TableCell mono className="px-4 py-2.5 text-2xs">
                    {entry.specifier}
                  </TableCell>
                  <TableCell className="px-4 py-2.5 text-2xs text-muted-foreground">
                    {entry.implementation}
                  </TableCell>
                  <TableCell className="px-4 py-2.5 text-2xs text-muted-foreground">
                    {entry.platforms}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>

        <p className="max-w-3xl text-xs leading-relaxed text-muted-foreground">
          Every module in{" "}
          <code className="font-mono text-2xs">packages/mobile</code> imports
          from <code className="font-mono text-2xs">&quot;@expo/ui&quot;</code>{" "}
          — the universal entry — and never from{" "}
          <code className="font-mono text-2xs">/swift-ui</code> or{" "}
          <code className="font-mono text-2xs">/jetpack-compose</code>. The
          universal implementations are real rather than stubs:
        </p>

        <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
          {MOBILE_UNIVERSAL_IMPLEMENTATIONS.map((item) => (
            <Card
              key={item.module}
              className={cn(PANEL_LG, "[--card-spacing:--spacing(3)]")}
            >
              <CardContent className="flex flex-col gap-1">
                <code className="font-mono text-2xs font-medium">
                  {item.module}
                </code>
                <span className="text-2xs leading-relaxed text-muted-foreground">
                  {item.behaviour}
                </span>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <p className="max-w-3xl text-xs leading-relaxed text-muted-foreground">
        The rest of the chain is web-clean as well.{" "}
        <code className="font-mono text-2xs">
          react-native-safe-area-context
        </code>{" "}
        resolves through{" "}
        <code className="font-mono text-2xs">react-native-web</code>;{" "}
        <code className="font-mono text-2xs">expo-status-bar</code> ships{" "}
        <code className="font-mono text-2xs">StatusBar.web.js</code>; and{" "}
        <code className="font-mono text-2xs">react-native-svg</code>, which the
        showcase icons are drawn with, ships a web build. Each animation guards
        its driver with{" "}
        <code className="font-mono text-2xs">
          Platform.OS !== &quot;web&quot;
        </code>
        , and <code className="font-mono text-2xs">screen.tsx</code> puts the
        iOS-only keyboard padding behind a{" "}
        <code className="font-mono text-2xs">
          Platform.OS === &quot;ios&quot;
        </code>{" "}
        check.
      </p>

      <div className="grid gap-3 lg:grid-cols-2">
        <div className="flex flex-col gap-2">
          <h3 className="text-xs font-semibold">Enabling web in an app</h3>
          <Command label="expo install" code={MOBILE_WEB_PACKAGES} />
          <p className="text-2xs leading-relaxed text-muted-foreground">
            <code className="font-mono text-2xs">apps/mobile</code> also
            declares the web bundler in{" "}
            <code className="font-mono text-2xs">app.json</code>:{" "}
            <code className="font-mono text-2xs">
              {`"web": { "bundler": "metro", "output": "single" }`}
            </code>
            . Both are already in place, so{" "}
            <code className="font-mono text-2xs">pnpm --filter mobile web</code>{" "}
            serves the showcase in a browser.
          </p>
        </div>
        <div className="flex flex-col gap-3">
          {MOBILE_WEB_CAVEATS.map((caveat) => (
            <Alert
              key={caveat.title}
              className={cn(CALLOUT, CALLOUT_SURFACE.info)}
            >
              <InfoIcon
                className={cn("mt-0.5 size-4 shrink-0", CALLOUT_ICON.info)}
                weight="duotone"
              />
              <AlertTitle className="text-xs font-semibold text-foreground">
                {caveat.title}
              </AlertTitle>
              <AlertDescription className="text-xs leading-relaxed text-muted-foreground">
                {caveat.detail}
              </AlertDescription>
            </Alert>
          ))}
        </div>
      </div>

      <Alert className={cn(CALLOUT, CALLOUT_SURFACE.warn)}>
        <WarningIcon
          className={cn("mt-0.5 size-4 shrink-0", CALLOUT_ICON.warn)}
          weight="duotone"
        />
        <AlertTitle className="text-xs font-semibold text-foreground">
          Not yet verified on a device
        </AlertTitle>
        <AlertDescription className="text-xs leading-relaxed text-muted-foreground">
          The library is typechecked end to end and the showcase Metro-bundles
          into a working Hermes bundle, but it has not been run on a simulator
          or device in this workspace. Three things need one before this is
          trusted: the package end to end;{" "}
          <code className="font-mono text-2xs">MobileSlider</code>&apos;s
          gesture geometry in particular, since a{" "}
          <code className="font-mono text-2xs">PanResponder</code> cannot be
          validated by a typecheck; and the showcase icons, where optical size
          and stroke weight inside a 44pt control are not things a typecheck can
          see.
        </AlertDescription>
      </Alert>
    </section>
  )
}

function Install() {
  return (
    <section className="flex flex-col gap-4">
      <SectionHeader
        id="install"
        eyebrow="Guidance"
        title="Install"
        description="Inside a workspace app the package resolves from the workspace protocol; the native dependencies are peers and must be installed by the app."
      />

      <div className="grid gap-3 lg:grid-cols-2">
        <div className="flex flex-col gap-2">
          <h3 className="text-xs font-semibold">The package</h3>
          <Command
            label="workspace"
            code="pnpm --filter mobile add @celestia-project/mobile@workspace:*"
          />
        </div>
        <div className="flex flex-col gap-2">
          <h3 className="text-xs font-semibold">
            Native peers — autolinked by Expo
          </h3>
          <Command
            label="expo install"
            code="npx expo install @expo/ui expo-haptics react-native-safe-area-context"
          />
        </div>
      </div>

      <Card className={PANEL_XL}>
        <CardContent className="flex flex-col gap-2">
          <h3 className="text-xs font-semibold">
            Pin React Native to the SDK 57 pairing
          </h3>
          <p className="text-xs leading-relaxed text-muted-foreground">
            Use{" "}
            <code className="font-mono text-2xs">
              npx expo install react-native
            </code>{" "}
            so it resolves <code className="font-mono text-2xs">0.86.3</code>.
            Do not bump to <code className="font-mono text-2xs">^0.87</code> by
            hand — Expo 57&apos;s Metro tooling requires{" "}
            <code className="font-mono text-2xs">rn-get-polyfills</code>, which
            React Native 0.87 removed.
          </p>
        </CardContent>
      </Card>

      <div className="flex flex-wrap items-center gap-2 pt-1">
        <Button
          render={<Link href={DOCS_HREF} />}
        >
          Full reference — peer table, screens, icons
          <ArrowRightIcon className="size-3.5" />
        </Button>
        <Button
          variant="outline"
          render={<Link href={REPO_HREF} target="_blank" rel="noreferrer" />}
        >
          Source
          <ArrowSquareOutIcon className="size-3.5" />
        </Button>
      </div>
    </section>
  )
}

/* -------------------------------------------------------------------------- */
/* Page                                                                        */
/* -------------------------------------------------------------------------- */

export function MobilePageContent() {
  const [activeId, setActiveId] = React.useState<string>(
    MOBILE_SECTIONS[0]?.id ?? ""
  )

  React.useEffect(() => {
    const handleScroll = () => {
      const scrollPos = window.scrollY + 140
      for (let i = MOBILE_SECTIONS.length - 1; i >= 0; i--) {
        const section = MOBILE_SECTIONS[i]
        if (!section) continue
        const el = document.getElementById(section.id)
        if (el && el.offsetTop <= scrollPos) {
          setActiveId(section.id)
          return
        }
      }
      const first = MOBILE_SECTIONS[0]
      if (first) setActiveId(first.id)
    }

    window.addEventListener("scroll", handleScroll, { passive: true })
    handleScroll()
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id)
    if (!el) return
    const y = el.getBoundingClientRect().top + window.pageYOffset - 80
    window.scrollTo({ top: y, behavior: "smooth" })
    setActiveId(id)
  }

  return (
    <>
      {/* Below lg: a section switcher. Rendered as a sibling of the content
          column rather than inside the rail, so it can actually be sticky. */}
      <MobileNavSidebar
        groups={MOBILE_SIDEBAR_GROUPS}
        activeItemId={activeId}
        onSelectItem={(item) => scrollToSection(item.id)}
        stickyTopClass="top-0"
      />

      <div className="mx-auto max-w-7xl px-5 pt-5 pb-[calc(2rem+env(safe-area-inset-bottom,0px))] sm:px-8">
        <div className="flex gap-8 pb-6">
          {/* Sticky rail — same shape as the docs and /layout surfaces */}
          <aside className="sticky top-6 hidden h-[calc(100vh-3rem)] max-h-[calc(100vh-3rem)] w-64 shrink-0 self-start overflow-hidden pe-2 lg:flex lg:flex-col">
            <MobileSidebar activeId={activeId} onSelect={scrollToSection} />
          </aside>

          <main className="flex max-w-full min-w-0 flex-1 flex-col gap-2">
            <Hero />
            <Overview />
            <Showcase />
            <Specimens />
            <Rules />
            <Platform />
            <Install />

            <Separator className="mt-10" />

            <div className="flex flex-wrap items-center gap-2 pb-8 text-2xs text-muted-foreground">
              <DeviceMobileIcon className="size-3.5" aria-hidden />
              <span>
                Specimens transcribed from{" "}
                <code className="font-mono">packages/mobile/src</code> and{" "}
                <code className="font-mono">apps/mobile/src/showcase</code>.
              </span>
            </div>
          </main>
        </div>
      </div>
    </>
  )
}
