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
import { Badge, Separator } from "@celestia-project/ui"
import { cn } from "@celestia-project/ui/lib/utils"
import { MobileNavSidebar } from "@/components/shared/nav-sidebar"
import { MobileSidebar, MOBILE_SIDEBAR_GROUPS } from "./mobile-sidebar"
import { DeviceFrame } from "./device-frame"
import { MOBILE_SCREEN_RENDERERS } from "./screens"
import { MOBILE_SPECIMENS } from "./specimens"
import {
  MOBILE_CATEGORIES,
  MOBILE_COLOR_TOKENS,
  MOBILE_ENTRY_POINTS,
  MOBILE_GROUPS,
  MOBILE_METRICS,
  MOBILE_MODULE_TOTAL,
  MOBILE_PLATFORM,
  MOBILE_RULES,
  MOBILE_SCREENS,
  MOBILE_SECTIONS,
  MOBILE_TYPE_SCALE,
  MOBILE_UNIVERSAL_IMPLEMENTATIONS,
  MOBILE_WEB_CAVEATS,
  MOBILE_WEB_PACKAGES,
  type MobileCategoryId,
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
    <header id={id} className="flex scroll-mt-24 flex-col gap-2 pt-10 first:pt-0">
      <p className="text-muted-foreground text-2xs font-semibold tracking-wider uppercase">
        {eyebrow}
      </p>
      <h2 className="text-xl font-bold tracking-tight sm:text-2xl">{title}</h2>
      <p className="text-muted-foreground max-w-2xl text-sm leading-relaxed">
        {description}
      </p>
    </header>
  )
}

function Panel({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <div
      className={cn(
        "border-border/70 bg-card rounded-xl border p-4 sm:p-5",
        className
      )}
    >
      {children}
    </div>
  )
}

function Callout({
  tone = "info",
  title,
  children,
}: {
  tone?: "info" | "warn" | "tip"
  title: string
  children: React.ReactNode
}) {
  const Icon = tone === "warn" ? WarningIcon : tone === "tip" ? CheckCircleIcon : InfoIcon

  return (
    <div
      className={cn(
        "flex gap-3 rounded-xl border p-4",
        tone === "warn" && "border-warning/30 bg-warning/5",
        tone === "tip" && "border-success/30 bg-success/5",
        tone === "info" && "border-border/70 bg-muted/40"
      )}
    >
      <Icon
        className={cn(
          "mt-0.5 size-4 shrink-0",
          tone === "warn" && "text-warning",
          tone === "tip" && "text-success",
          tone === "info" && "text-muted-foreground"
        )}
        weight="duotone"
      />
      <div className="flex min-w-0 flex-col gap-1">
        <p className="text-xs font-semibold">{title}</p>
        <div className="text-muted-foreground text-xs leading-relaxed">{children}</div>
      </div>
    </div>
  )
}

function CategoryBadge({ category }: { category: MobileCategoryId }) {
  const label =
    category === "primitive" ? "primitive" : category === "composite" ? "composite" : "layout"

  return (
    <Badge
      variant={category === "layout" ? "info" : category === "composite" ? "secondary" : "outline"}
      className="font-mono"
    >
      {label}
    </Badge>
  )
}

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
    <div className="border-border/70 bg-muted/40 overflow-hidden rounded-lg border">
      <div className="border-border/50 flex items-center justify-between gap-2 border-b px-3 py-1.5">
        <span className="text-muted-foreground font-mono text-4xs tracking-wider uppercase">
          {label}
        </span>
        <button
          type="button"
          onClick={copy}
          className="text-muted-foreground hover:text-foreground rounded-sm text-4xs font-medium transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
        >
          {copied ? "Copied" : "Copy"}
        </button>
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
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/* Sections                                                                    */
/* -------------------------------------------------------------------------- */

function Hero() {
  const stats = [
    { label: "Modules", value: MOBILE_MODULE_TOTAL },
    { label: "Primitives", value: 20 },
    { label: "Composites", value: 13 },
    { label: "Screens", value: 10 },
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
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Mobile</h1>
        <p className="text-muted-foreground max-w-2xl text-sm leading-relaxed sm:text-base">
          Native iOS and Android components built on{" "}
          <code className="rounded-md border border-border/70 bg-muted/60 px-1.5 py-0.5 font-mono text-xs">
            @expo/ui
          </code>{" "}
          — real SwiftUI and Jetpack Compose views, organised into primitives, composites and
          layout screens. Web is served by the same components through{" "}
          <code className="rounded-md border border-border/70 bg-muted/60 px-1.5 py-0.5 font-mono text-xs">
            @expo/ui
          </code>
          &apos;s universal entry. This surface shows the shapes; the{" "}
          <Link
            href={DOCS_HREF}
            className="text-foreground font-medium underline underline-offset-4"
          >
            reference docs
          </Link>{" "}
          carry the install, the peer dependencies and the API.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="border-border/70 bg-card flex flex-col gap-0.5 rounded-xl border p-3"
          >
            <span className="text-2xl font-bold tracking-tight tabular-nums">
              {stat.value}
            </span>
            <span className="text-muted-foreground text-2xs font-medium tracking-wide uppercase">
              {stat.label}
            </span>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Link
          href={DOCS_HREF}
          className="bg-primary text-primary-foreground inline-flex min-h-10 items-center gap-1.5 rounded-md px-4 text-xs font-semibold transition-opacity hover:opacity-90"
        >
          Read the docs
          <ArrowRightIcon className="size-3.5" />
        </Link>
        <Link
          href="#screens"
          className="border-border text-foreground inline-flex min-h-10 items-center gap-1.5 rounded-md border px-4 text-xs font-semibold transition-colors hover:bg-muted/60"
        >
          See the screens
        </Link>
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

      <p className="text-muted-foreground max-w-2xl text-sm leading-relaxed">
        The web components assume a DOM, hover states and a CSS box model. These assume a thumb,
        a safe area and a touch-target floor. What the two packages share is the{" "}
        <span className="text-foreground font-medium">taxonomy</span> — the same primitive /
        composite / layout split — and the{" "}
        <span className="text-foreground font-medium">design tokens</span>, so a component sits
        in the same mental bucket whichever library you are in. That shared taxonomy is also the
        escape hatch: when a screen needs a first-class web implementation rather than the
        universal entry&apos;s DOM rendering, it can be rebuilt on{" "}
        <code className="font-mono text-2xs">@celestia-project/ui</code> with the same names and
        the same tokens.
      </p>

      <div className="grid gap-3 sm:grid-cols-2">
        <Callout tone="info" title="Routing- and data-agnostic by contract">
          Every component is presentational: props in, callbacks out. No navigation library, no
          data fetching, no auth client. The host app owns routing, data and session state — which
          is why the package has no dependency on <code className="font-mono text-2xs">apps/api</code>{" "}
          and drops into any Expo project.
        </Callout>
        <Callout tone="tip" title="Published alongside the web library">
          Part of the npm publish set: <code className="font-mono text-2xs">publish.sh</code> ships{" "}
          <code className="font-mono text-2xs">@celestia-project/ui</code>,{" "}
          <code className="font-mono text-2xs">@celestia-project/create</code> and{" "}
          <code className="font-mono text-2xs">@celestia-project/mobile</code>. Inside the
          workspace it resolves from source through the workspace protocol.
        </Callout>
      </div>

      <Panel className="p-0">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-border/60 border-b">
              <th className="text-muted-foreground px-4 py-2.5 font-medium">Path</th>
              <th className="text-muted-foreground px-4 py-2.5 font-medium">What it is</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-border/40 border-b last:border-0">
              <td className="px-4 py-2.5 font-mono text-2xs">packages/mobile</td>
              <td className="text-muted-foreground px-4 py-2.5">
                The library (<code className="font-mono text-2xs">@celestia-project/mobile</code>)
              </td>
            </tr>
            <tr>
              <td className="px-4 py-2.5 font-mono text-2xs">apps/mobile</td>
              <td className="text-muted-foreground px-4 py-2.5">
                The Expo showcase app that consumes it
              </td>
            </tr>
          </tbody>
        </table>
      </Panel>
    </section>
  )
}

function Foundations() {
  return (
    <section className="flex flex-col gap-4">
      <SectionHeader
        id="foundations"
        eyebrow="Design system"
        title="Taxonomy and tokens"
        description="Components are grouped by role, not by atomicity — the same rule @celestia-project/ui uses, so the two libraries read the same way."
      />

      <div className="grid gap-3 sm:grid-cols-3">
        {MOBILE_CATEGORIES.map((category) => (
          <Panel key={category.id} className="flex flex-col gap-2">
            <div className="flex items-center justify-between gap-2">
              <h3 className="text-sm font-semibold">{category.name}</h3>
              <span className="text-muted-foreground text-xs tabular-nums">
                {category.count}
              </span>
            </div>
            <code className="text-muted-foreground font-mono text-3xs">
              {category.directory}
            </code>
            <p className="text-muted-foreground text-xs leading-relaxed">
              {category.belongs}
            </p>
            <p className="text-foreground mt-auto pt-1 text-2xs italic">
              “{category.rule}”
            </p>
          </Panel>
        ))}
      </div>

      <Callout tone="info" title="“Primitive” means generic, not atomic">
        <code className="font-mono text-2xs">MobileCard</code> ships{" "}
        <code className="font-mono text-2xs">MobileCardHeader</code>,{" "}
        <code className="font-mono text-2xs">MobileCardTitle</code> and three more slots — and is
        still a primitive, exactly as <code className="font-mono text-2xs">Card</code> is in the
        web library. A compound component is not automatically a composite; only an{" "}
        <em>opinionated</em> one is.
      </Callout>

      {/* Colour */}
      <div className="flex flex-col gap-3 pt-2">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h3 className="text-sm font-semibold">Semantic colour</h3>
          <p className="text-muted-foreground text-2xs">
            The complete <code className="font-mono">ColorRamp</code> — a closed set, which is what
            keeps the two themes from drifting apart.
          </p>
        </div>

        <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
          {MOBILE_COLOR_TOKENS.map((token) => (
            <div
              key={token.token}
              className="border-border/70 bg-card flex items-center gap-3 rounded-lg border p-2.5"
            >
              <span aria-hidden className="flex shrink-0 flex-col gap-0.5">
                <span
                  className="border-border block size-6 rounded-[5px] border"
                  style={{ backgroundColor: token.light }}
                />
                <span
                  className="border-border block size-6 rounded-[5px] border"
                  style={{ backgroundColor: token.dark }}
                />
              </span>
              <span className="flex min-w-0 flex-1 flex-col">
                <code className="truncate font-mono text-2xs font-medium">{token.token}</code>
                <span className="text-muted-foreground truncate text-3xs">{token.role}</span>
              </span>
              <span className="text-muted-foreground shrink-0 text-end font-mono text-4xs tabular-nums">
                <span className="block">{token.light}</span>
                <span className="block">{token.dark}</span>
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Type */}
      <div className="flex flex-col gap-3 pt-2">
        <h3 className="text-sm font-semibold">Type scale</h3>
        <Panel className="flex flex-col gap-0 p-0">
          {MOBILE_TYPE_SCALE.map((step, index) => (
            <div
              key={step.variant}
              className={cn(
                "flex flex-wrap items-baseline gap-x-4 gap-y-1 px-4 py-3",
                index < MOBILE_TYPE_SCALE.length - 1 && "border-border/40 border-b"
              )}
            >
              <code className="text-muted-foreground w-24 shrink-0 font-mono text-2xs">
                {step.variant}
              </code>
              <span
                className="min-w-0 flex-1 truncate"
                style={{
                  fontSize: step.size,
                  lineHeight: `${step.lineHeight}px`,
                  fontWeight: step.weight,
                  letterSpacing: step.tracking ? `${step.tracking}px` : undefined,
                }}
              >
                {step.sample}
              </span>
              <span className="text-muted-foreground shrink-0 font-mono text-3xs tabular-nums">
                {step.size}/{step.lineHeight} · {step.weight}
                {step.tracking ? ` · ${step.tracking}px` : ""}
              </span>
            </div>
          ))}
        </Panel>
      </div>

      {/* Metrics */}
      <div className="flex flex-col gap-3 pt-2">
        <h3 className="text-sm font-semibold">Metrics</h3>
        <div className="grid gap-3 sm:grid-cols-2">
          <Panel className="flex items-center gap-4">
            <span
              aria-hidden
              className="border-primary/40 bg-primary/5 text-primary flex size-11 shrink-0 items-center justify-center rounded-lg border text-2xs font-semibold tabular-nums"
            >
              44
            </span>
            <span className="flex min-w-0 flex-col gap-0.5">
              <span className="text-xs font-semibold">Minimum touch target</span>
              <span className="text-muted-foreground text-2xs leading-relaxed">
                44×44pt on every interactive element, exposed as{" "}
                <code className="font-mono text-3xs">metrics.minTouchTarget</code>.
              </span>
            </span>
          </Panel>
          <Panel className="flex flex-col gap-2">
            <span className="text-xs font-semibold">Corner radius</span>
            <div className="flex flex-col gap-1.5">
              {MOBILE_METRICS.radii.map((radius) => (
                <div key={radius.token} className="flex items-center gap-3">
                  <span
                    aria-hidden
                    className="bg-primary/15 border-primary/30 size-7 shrink-0 border"
                    style={{ borderRadius: radius.value }}
                  />
                  <code className="w-8 shrink-0 font-mono text-2xs">{radius.token}</code>
                  <span className="text-muted-foreground shrink-0 text-2xs tabular-nums">
                    {radius.value}pt
                  </span>
                  <span className="text-muted-foreground truncate text-2xs">{radius.use}</span>
                </div>
              ))}
            </div>
          </Panel>
        </div>
      </div>
    </section>
  )
}

function ComponentIndex() {
  return (
    <section className="flex flex-col gap-4">
      <SectionHeader
        id="components"
        eyebrow="Design system"
        title="Component index"
        description={
          <>
            All {MOBILE_MODULE_TOTAL} modules, grouped by what they are for rather than where they
            live. Deep imports mirror the folder split:{" "}
            <code className="rounded-md border border-border/70 bg-muted/60 px-1.5 py-0.5 font-mono text-2xs">
              @celestia-project/mobile/primitive/button
            </code>
            .
          </>
        }
      />

      <div className="flex flex-col gap-3">
        {MOBILE_GROUPS.map((group) => (
          <Panel key={group.id} className="flex flex-col gap-3">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <h3 className="text-sm font-semibold">{group.name}</h3>
              <span className="text-muted-foreground text-2xs tabular-nums">
                {group.modules.length} modules
              </span>
            </div>
            <p className="text-muted-foreground max-w-3xl text-xs leading-relaxed">
              {group.summary}
            </p>

            <div className="border-border/60 divide-border/40 flex flex-col divide-y overflow-hidden rounded-lg border">
              {group.modules.map((module) => (
                <div
                  key={module.modulePath}
                  className="flex flex-col gap-1 px-3 py-2.5 sm:flex-row sm:items-baseline sm:gap-4"
                >
                  <div className="flex shrink-0 items-center gap-2 sm:w-56">
                    <span className="truncate text-xs font-medium">{module.name}</span>
                    <CategoryBadge category={module.category} />
                  </div>
                  <code className="text-muted-foreground shrink-0 font-mono text-3xs sm:w-48">
                    {module.modulePath}
                  </code>
                  <span className="text-muted-foreground min-w-0 flex-1 text-2xs leading-relaxed">
                    {module.summary}
                  </span>
                </div>
              ))}
            </div>
          </Panel>
        ))}
      </div>
    </section>
  )
}

function Specimens() {
  return (
    <section id="specimens" className="flex scroll-mt-24 flex-col gap-4 pt-8">
      <div className="flex flex-col gap-2">
        <h3 className="text-sm font-semibold">In the hand</h3>
        <p className="text-muted-foreground max-w-2xl text-xs leading-relaxed">
          The primitives and composites, drawn at the package&apos;s real metrics — the 44pt touch
          floor, the 10pt control radius, the 11 / 12 / 14 / 16px type steps. These are
          transcriptions rather than the running components; the note under Screens explains why,
          and how to see the real thing.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {MOBILE_SPECIMENS.map((Specimen) => (
          <Specimen key={Specimen.name} />
        ))}
      </div>
    </section>
  )
}

function Screens() {
  return (
    <section className="flex flex-col gap-4">
      <SectionHeader
        id="screens"
        eyebrow="Design system"
        title="Screens"
        description="The ten full-screen modules own the whole frame — safe area, scrolling, keyboard avoidance, header, pinned footer — and take their content through slots."
      />

      <Callout tone="warn" title="Transcriptions, not the running components">
        The components <em>do</em> render on web — every module imports{" "}
        <code className="font-mono text-2xs">@expo/ui</code>&apos;s universal entry, which resolves
        to a DOM implementation in a browser. But this page is a Next.js app, not an Expo web
        build: it does not depend on{" "}
        <code className="font-mono text-2xs">@celestia-project/mobile</code>, and mounting the real
        components here would mean adding{" "}
        <code className="font-mono text-2xs">react-native-web</code>,{" "}
        <code className="font-mono text-2xs">react-dom</code> and{" "}
        <code className="font-mono text-2xs">@expo/metro-runtime</code> to{" "}
        <code className="font-mono text-2xs">apps/web</code>. So what is drawn below is an
        HTML/CSS transcription of the same arrangement at the same metrics. To see the real thing,{" "}
        <code className="font-mono text-2xs">pnpm --filter mobile web</code> for the browser, or{" "}
        <code className="font-mono text-2xs">pnpm --filter mobile ios</code> for a simulator.
      </Callout>

      <div className="grid justify-items-center gap-x-6 gap-y-8 sm:grid-cols-2 xl:grid-cols-3">
        {MOBILE_SCREENS.map((screen) => {
          const Render = MOBILE_SCREEN_RENDERERS[screen.id]
          return (
            <div key={screen.id} className="flex w-full flex-col items-center gap-3">
              <DeviceFrame
                label={`Recreation of the ${screen.title} screen from @celestia-project/mobile`}
                caption={screen.modulePath}
              >
                <Render />
              </DeviceFrame>
              <div className="flex max-w-[300px] flex-col gap-1">
                <h3 className="text-xs font-semibold">{screen.title}</h3>
                <p className="text-muted-foreground text-2xs leading-relaxed">
                  {screen.summary}
                </p>
              </div>
            </div>
          )
        })}
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
          <Panel key={rule.title} className="flex gap-3">
            <span className="text-muted-foreground/60 shrink-0 font-mono text-xs tabular-nums">
              {String(index + 1).padStart(2, "0")}
            </span>
            <span className="flex min-w-0 flex-col gap-1">
              <span className="text-xs font-semibold">{rule.title}</span>
              <span className="text-muted-foreground text-2xs leading-relaxed">
                {rule.detail}
              </span>
            </span>
          </Panel>
        ))}
      </div>
    </section>
  )
}

function Platform() {
  const mark = (state: "yes" | "no" | "partial") =>
    state === "yes" ? (
      <span className="text-success text-xs" aria-label="supported">
        ✓
      </span>
    ) : state === "partial" ? (
      <span className="text-warning text-xs" aria-label="partial">
        ~
      </span>
    ) : (
      <span className="text-muted-foreground/50 text-xs" aria-label="not supported">
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

      <Panel className="overflow-x-auto p-0">
        <table className="w-full min-w-[560px] text-left text-xs">
          <thead>
            <tr className="border-border/60 border-b">
              <th className="text-muted-foreground px-4 py-2.5 font-medium">Capability</th>
              <th className="text-muted-foreground w-16 px-4 py-2.5 text-center font-medium">
                iOS
              </th>
              <th className="text-muted-foreground w-20 px-4 py-2.5 text-center font-medium">
                Android
              </th>
              <th className="text-muted-foreground w-16 px-4 py-2.5 text-center font-medium">
                Web
              </th>
              <th className="text-muted-foreground px-4 py-2.5 font-medium">Note</th>
            </tr>
          </thead>
          <tbody>
            {MOBILE_PLATFORM.map((row) => (
              <tr key={row.capability} className="border-border/40 border-b last:border-0">
                <td className="px-4 py-2.5">{row.capability}</td>
                <td className="px-4 py-2.5 text-center">{mark(row.ios)}</td>
                <td className="px-4 py-2.5 text-center">{mark(row.android)}</td>
                <td className="px-4 py-2.5 text-center">{mark(row.web)}</td>
                <td className="text-muted-foreground px-4 py-2.5 text-2xs">{row.note}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Panel>

      {/* The entry point is the whole story, and the most misread thing here. */}
      <div className="flex flex-col gap-3">
        <h3 className="text-sm font-semibold">
          Which entry point you import decides whether web works
        </h3>
        <Panel className="overflow-x-auto p-0">
          <table className="w-full min-w-[560px] text-left text-xs">
            <thead>
              <tr className="border-border/60 border-b">
                <th className="text-muted-foreground px-4 py-2.5 font-medium">Import</th>
                <th className="text-muted-foreground px-4 py-2.5 font-medium">
                  Implementation
                </th>
                <th className="text-muted-foreground w-40 px-4 py-2.5 font-medium">
                  Platforms
                </th>
              </tr>
            </thead>
            <tbody>
              {MOBILE_ENTRY_POINTS.map((entry) => (
                <tr key={entry.specifier} className="border-border/40 border-b last:border-0">
                  <td className="px-4 py-2.5 font-mono text-2xs">{entry.specifier}</td>
                  <td className="text-muted-foreground px-4 py-2.5 text-2xs">
                    {entry.implementation}
                  </td>
                  <td className="text-muted-foreground px-4 py-2.5 text-2xs">
                    {entry.platforms}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Panel>

        <p className="text-muted-foreground max-w-3xl text-xs leading-relaxed">
          Every module in <code className="font-mono text-2xs">packages/mobile</code> imports from{" "}
          <code className="font-mono text-2xs">&quot;@expo/ui&quot;</code> — the universal entry —
          and never from <code className="font-mono text-2xs">/swift-ui</code> or{" "}
          <code className="font-mono text-2xs">/jetpack-compose</code>. The universal
          implementations are real rather than stubs:
        </p>

        <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
          {MOBILE_UNIVERSAL_IMPLEMENTATIONS.map((item) => (
            <div
              key={item.module}
              className="border-border/70 bg-card flex flex-col gap-1 rounded-lg border p-3"
            >
              <code className="font-mono text-2xs font-medium">{item.module}</code>
              <span className="text-muted-foreground text-2xs leading-relaxed">
                {item.behaviour}
              </span>
            </div>
          ))}
        </div>
      </div>

      <p className="text-muted-foreground max-w-3xl text-xs leading-relaxed">
        The rest of the chain is web-clean as well.{" "}
        <code className="font-mono text-2xs">react-native-safe-area-context</code> resolves through{" "}
        <code className="font-mono text-2xs">react-native-web</code>;{" "}
        <code className="font-mono text-2xs">expo-status-bar</code> ships{" "}
        <code className="font-mono text-2xs">StatusBar.web.js</code>; and{" "}
        <code className="font-mono text-2xs">react-native-svg</code>, which the showcase icons are
        drawn with, ships a web build. Each animation guards its driver with{" "}
        <code className="font-mono text-2xs">Platform.OS !== &quot;web&quot;</code>, and{" "}
        <code className="font-mono text-2xs">screen.tsx</code> puts the iOS-only keyboard padding
        behind a <code className="font-mono text-2xs">Platform.OS === &quot;ios&quot;</code> check.
      </p>

      <div className="grid gap-3 lg:grid-cols-2">
        <div className="flex flex-col gap-2">
          <h3 className="text-xs font-semibold">Enabling web in an app</h3>
          <Command label="expo install" code={MOBILE_WEB_PACKAGES} />
          <p className="text-muted-foreground text-2xs leading-relaxed">
            <code className="font-mono text-2xs">apps/mobile</code> also declares the web bundler
            in <code className="font-mono text-2xs">app.json</code>:{" "}
            <code className="font-mono text-2xs">
              {`"web": { "bundler": "metro", "output": "single" }`}
            </code>
            . Both are already in place, so{" "}
            <code className="font-mono text-2xs">pnpm --filter mobile web</code> serves the
            showcase in a browser.
          </p>
        </div>
        <div className="flex flex-col gap-3">
          {MOBILE_WEB_CAVEATS.map((caveat) => (
            <Callout key={caveat.title} tone="info" title={caveat.title}>
              {caveat.detail}
            </Callout>
          ))}
        </div>
      </div>

      <Callout tone="warn" title="Not yet verified on a device">
        The library is typechecked end to end and the showcase Metro-bundles into a working Hermes
        bundle, but it has not been run on a simulator or device in this workspace. Three things
        need one before this is trusted: the package end to end;{" "}
        <code className="font-mono text-2xs">MobileSlider</code>&apos;s gesture geometry in
        particular, since a <code className="font-mono text-2xs">PanResponder</code> cannot be
        validated by a typecheck; and the showcase icons, where optical size and stroke weight
        inside a 44pt control are not things a typecheck can see.
      </Callout>
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
          <Command label="workspace" code="pnpm --filter mobile add @celestia-project/mobile@workspace:*" />
        </div>
        <div className="flex flex-col gap-2">
          <h3 className="text-xs font-semibold">Native peers — autolinked by Expo</h3>
          <Command
            label="expo install"
            code="npx expo install @expo/ui expo-haptics react-native-safe-area-context"
          />
        </div>
      </div>

      <Panel className="flex flex-col gap-2">
        <h3 className="text-xs font-semibold">Pin React Native to the SDK 57 pairing</h3>
        <p className="text-muted-foreground text-xs leading-relaxed">
          Use <code className="font-mono text-2xs">npx expo install react-native</code> so it
          resolves <code className="font-mono text-2xs">0.86.3</code>. Do not bump to{" "}
          <code className="font-mono text-2xs">^0.87</code> by hand — Expo 57&apos;s Metro tooling
          requires <code className="font-mono text-2xs">rn-get-polyfills</code>, which React Native
          0.87 removed.
        </p>
      </Panel>

      <div className="flex flex-wrap items-center gap-2 pt-1">
        <Link
          href={DOCS_HREF}
          className="bg-primary text-primary-foreground inline-flex min-h-10 items-center gap-1.5 rounded-md px-4 text-xs font-semibold transition-opacity hover:opacity-90"
        >
          Full reference — peer table, screens, icons
          <ArrowRightIcon className="size-3.5" />
        </Link>
        <Link
          href={REPO_HREF}
          target="_blank"
          rel="noreferrer"
          className="border-border text-foreground inline-flex min-h-10 items-center gap-1.5 rounded-md border px-4 text-xs font-semibold transition-colors hover:bg-muted/60"
        >
          Source
          <ArrowSquareOutIcon className="size-3.5" />
        </Link>
      </div>
    </section>
  )
}

/* -------------------------------------------------------------------------- */
/* Page                                                                        */
/* -------------------------------------------------------------------------- */

export function MobilePageContent() {
  const [activeId, setActiveId] = React.useState<string>(MOBILE_SECTIONS[0]?.id ?? "")

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

          <main className="flex min-w-0 max-w-full flex-1 flex-col gap-2">
            <Hero />
            <Overview />
            <Foundations />
            <ComponentIndex />
            <Specimens />
            <Screens />
            <Rules />
            <Platform />
            <Install />

            <Separator className="mt-10" />

            <div className="text-muted-foreground flex flex-wrap items-center gap-2 pb-8 text-2xs">
              <DeviceMobileIcon className="size-3.5" aria-hidden />
              <span>
                Recreations transcribed from{" "}
                <code className="font-mono">packages/mobile/src</code>. Values shown verbatim
                from <code className="font-mono">tokens.ts</code> and{" "}
                <code className="font-mono">apps/mobile/src/showcase</code>.
              </span>
            </div>
          </main>
        </div>
      </div>
    </>
  )
}
