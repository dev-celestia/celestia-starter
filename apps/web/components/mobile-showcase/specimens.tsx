import * as React from "react"
import {
  BellIcon,
  CaretRightIcon,
  CheckIcon,
  InfoIcon,
  MagnifyingGlassIcon,
  PlusIcon,
  TrashIcon,
  WarningIcon,
  XIcon,
} from "@phosphor-icons/react/dist/ssr"
import { cn } from "@celestia-project/ui/lib/utils"
import { TabBarMark } from "./screens"

/**
 * A visual index of the mobile primitives and composites.
 *
 * Same contract as `screens.tsx`: HTML/CSS transcriptions of the native
 * components, drawn at the package's real metrics (44pt touch floor, the 32pt
 * control height and 6pt control radius, the 11/12/14/16px type steps) so
 * proportions are honest even though the native views are not running. See the
 * note above the gallery.
 */

/* -------------------------------------------------------------------------- */
/* Specimen shell                                                              */
/* -------------------------------------------------------------------------- */

function Specimen({
  title,
  modulePath,
  children,
  className,
}: {
  title: string
  modulePath: string
  children: React.ReactNode
  className?: string
}) {
  return (
    <div className="border-border/70 bg-card flex flex-col overflow-hidden rounded-xl border">
      <div className="border-border/50 flex items-baseline justify-between gap-3 border-b px-4 py-2.5">
        <h3 className="text-xs font-semibold tracking-tight">{title}</h3>
        <code className="text-muted-foreground shrink-0 font-mono text-4xs">
          {modulePath}
        </code>
      </div>
      <div className={cn("flex flex-1 flex-col gap-3 p-4", className)}>{children}</div>
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/* Marks                                                                       */
/* -------------------------------------------------------------------------- */

/**
 * The `MobileButton` transcription, drawn with the *web* button's own utility
 * classes.
 *
 * That is not a shortcut: the native component is a deliberate transcription of
 * `@celestia-project/ui`'s `Button`, so the two share a height (`h-8`), a radius
 * (`rounded-sm` = 6px), a type step (`text-xs/relaxed font-medium`) and the
 * `shadow-3d-*` bottom edge. Drawing it with those classes is the most accurate
 * picture of what the native control renders.
 *
 * `default` is outlined, not filled — a filled CTA is `secondary`.
 */
function MobileButton({
  children,
  variant = "default",
  size = "default",
  className,
}: {
  children: React.ReactNode
  variant?: "default" | "secondary" | "outline" | "destructive" | "ghost"
  size?: "sm" | "default" | "lg"
  className?: string
}) {
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-sm border font-medium whitespace-nowrap",
        size === "sm" && "h-6 gap-1 px-2.5 text-xs/relaxed",
        size === "default" && "h-8 gap-1.5 px-3 text-xs/relaxed",
        size === "lg" && "h-9 gap-1.5 px-3.5 text-xs/relaxed",
        variant === "default" &&
          "border-primary bg-background text-primary shadow-3d-primary",
        variant === "secondary" &&
          "border-secondary bg-secondary text-secondary-foreground shadow-3d",
        variant === "outline" &&
          "border-border bg-background text-foreground shadow-3d",
        variant === "destructive" &&
          "border-destructive bg-destructive text-destructive-foreground shadow-destructive-3d",
        variant === "ghost" && "border-transparent text-foreground",
        className
      )}
    >
      {children}
    </span>
  )
}

function Badge({
  children,
  variant = "default",
}: {
  children: React.ReactNode
  variant?: "default" | "secondary" | "outline" | "success" | "warning" | "info" | "destructive"
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2 py-0.5 text-4xs font-semibold",
        variant === "default" && "bg-primary text-primary-foreground",
        variant === "secondary" && "bg-secondary text-secondary-foreground",
        variant === "outline" && "border-border text-muted-foreground border",
        variant === "success" && "bg-success/15 text-success",
        variant === "warning" && "bg-warning/15 text-warning",
        variant === "info" && "bg-info/15 text-info",
        variant === "destructive" && "bg-destructive/15 text-destructive"
      )}
    >
      {children}
    </span>
  )
}

function SwitchMark({ on, disabled }: { on: boolean; disabled?: boolean }) {
  return (
    <span
      aria-hidden
      className={cn(
        "flex h-[31px] w-[51px] shrink-0 items-center rounded-full p-[2px]",
        on ? "bg-primary" : "bg-muted-foreground/35",
        disabled && "opacity-40"
      )}
    >
      <span
        className={cn(
          "bg-background size-[27px] rounded-full shadow-sm",
          on ? "translate-x-5" : "translate-x-0"
        )}
      />
    </span>
  )
}

function CheckboxMark({
  checked,
  error,
}: {
  checked: boolean
  error?: boolean
}) {
  return (
    <span
      className={cn(
        "flex size-[22px] shrink-0 items-center justify-center rounded-[6px] border",
        checked
          ? "border-primary bg-primary text-primary-foreground"
          : error
            ? "border-destructive bg-destructive/10"
            : "border-input bg-background"
      )}
    >
      {checked ? <CheckIcon className="size-3" weight="bold" /> : null}
    </span>
  )
}

function InputMark({
  value,
  placeholder,
  error,
  trailing,
}: {
  value?: string
  placeholder?: string
  error?: boolean
  trailing?: React.ReactNode
}) {
  return (
    <span
      className={cn(
        "flex min-h-11 items-center gap-2 rounded-md border px-3",
        error ? "border-destructive" : "border-input bg-background"
      )}
    >
      <span
        className={cn(
          "min-w-0 flex-1 truncate text-xs",
          value ? "text-foreground" : "text-muted-foreground"
        )}
      >
        {value ?? placeholder}
      </span>
      {trailing}
    </span>
  )
}

/* -------------------------------------------------------------------------- */
/* Specimens                                                                   */
/* -------------------------------------------------------------------------- */

const BUTTON_VARIANTS = ["default", "secondary", "outline", "destructive", "ghost"] as const

function ButtonsSpecimen() {
  return (
    <Specimen title="Buttons" modulePath="primitive/button">
      {BUTTON_VARIANTS.map((variant) => (
        <MobileButton key={variant} variant={variant} className="w-full">
          {variant === "default" ? "Continue" : variant.charAt(0).toUpperCase() + variant.slice(1)}
        </MobileButton>
      ))}
      <div className="mt-1 flex items-center gap-2">
        <MobileButton size="sm">sm</MobileButton>
        <MobileButton size="default">default</MobileButton>
        <MobileButton size="lg">lg</MobileButton>
      </div>
      <p className="text-muted-foreground text-2xs leading-relaxed">
        A 32px surface with a 6px radius and a hard 2px bottom edge — the web
        Button&rsquo;s own anatomy. The 44pt touch floor is met with hitSlop, not
        by inflating the box, and the press slides the surface down over the
        edge.
      </p>
    </Specimen>
  )
}

function IconButtonsSpecimen() {
  const variants = [
    { variant: "default" as const, Icon: PlusIcon, label: "Add" },
    { variant: "outline" as const, Icon: BellIcon, label: "Notifications" },
    { variant: "ghost" as const, Icon: MagnifyingGlassIcon, label: "Search" },
    { variant: "destructive" as const, Icon: TrashIcon, label: "Delete" },
  ]

  return (
    <Specimen title="Icon buttons" modulePath="primitive/icon-button">
      <div className="flex flex-wrap items-center gap-3">
        {variants.map(({ variant, Icon, label }) => (
          <span
            key={variant}
            className={cn(
              "flex size-11 items-center justify-center rounded-md",
              variant === "default" && "bg-primary text-primary-foreground",
              variant === "outline" && "border-border text-foreground border",
              variant === "ghost" && "text-foreground",
              variant === "destructive" && "bg-destructive text-destructive-foreground"
            )}
          >
            <Icon className="size-5" aria-hidden />
            <span className="sr-only">{label}</span>
          </span>
        ))}
      </div>
      <p className="text-muted-foreground text-2xs leading-relaxed">
        accessibilityLabel is a required prop, not an option.
      </p>
    </Specimen>
  )
}

function BadgesSpecimen() {
  const variants = [
    "default",
    "secondary",
    "outline",
    "success",
    "warning",
    "info",
    "destructive",
  ] as const

  return (
    <Specimen title="Badges" modulePath="primitive/badge">
      <div className="flex flex-wrap gap-1.5">
        {variants.map((variant) => (
          <Badge key={variant} variant={variant}>
            {variant}
          </Badge>
        ))}
      </div>
      <div className="flex items-center gap-2">
        <Badge variant="info">12</Badge>
        <Badge variant="destructive">99+</Badge>
        <span className="text-muted-foreground text-2xs">
          the tabular flag keeps changing counts from shifting
        </span>
      </div>
    </Specimen>
  )
}

function SwitchesSpecimen() {
  const rows = [
    { label: "Push notifications", description: "Native control via @expo/ui", on: true },
    { label: "Analytics", description: "Shares anonymous usage", on: false },
    { label: "Managed by policy", description: "Disabled", on: true, disabled: true },
  ]

  return (
    <Specimen title="Switches" modulePath="primitive/switch">
      {rows.map((row) => (
        <div key={row.label} className="flex min-h-11 items-center gap-3">
          <span className="flex min-w-0 flex-1 flex-col">
            <span className="truncate text-xs font-medium">{row.label}</span>
            <span className="text-muted-foreground truncate text-2xs">{row.description}</span>
          </span>
          <SwitchMark on={row.on} disabled={row.disabled} />
        </div>
      ))}
    </Specimen>
  )
}

function CheckboxesSpecimen() {
  const rows = [
    { label: "Keep me signed in", checked: true },
    { label: "Product updates", checked: false },
    { label: "Accept the terms", checked: false, error: true },
  ]

  return (
    <Specimen title="Checkboxes" modulePath="primitive/checkbox">
      {rows.map((row) => (
        <div key={row.label} className="flex min-h-11 items-center gap-3">
          <CheckboxMark checked={row.checked} error={row.error} />
          <span className="flex min-w-0 flex-1 flex-col">
            <span className="truncate text-xs font-medium">{row.label}</span>
            {row.error ? (
              <span className="text-destructive text-2xs">Select this to continue.</span>
            ) : null}
          </span>
        </div>
      ))}
    </Specimen>
  )
}

function InputsSpecimen() {
  return (
    <Specimen title="Text inputs" modulePath="primitive/input">
      <InputMark placeholder="Placeholder" />
      <InputMark value="ada@example.com" />
      <InputMark value="ada@example" error />
      <p className="text-muted-foreground text-2xs leading-relaxed">
        A 16px floor on the real control stops iOS zooming the viewport on focus.
      </p>
    </Specimen>
  )
}

function SegmentedSpecimen() {
  const options = ["Day", "Week", "Month"]

  return (
    <Specimen title="Segmented control" modulePath="composite/segmented-control">
      <div className="bg-muted flex gap-1 rounded-lg p-1">
        {options.map((option, index) => (
          <span
            key={option}
            className={cn(
              "flex min-h-9 flex-1 items-center justify-center rounded-md text-2xs font-semibold",
              index === 1
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground"
            )}
          >
            {option}
          </span>
        ))}
      </div>
      <p className="text-muted-foreground text-2xs leading-relaxed">
        A disabled segment stays visible, so the option set never changes shape.
      </p>
    </Specimen>
  )
}

function SearchSpecimen() {
  return (
    <Specimen title="Search bar" modulePath="composite/search-bar">
      <span className="border-input bg-muted/40 flex min-h-11 items-center gap-2 rounded-md border px-3">
        <MagnifyingGlassIcon className="text-muted-foreground size-4 shrink-0" />
        <span className="min-w-0 flex-1 truncate text-xs">atlas</span>
        <span className="bg-muted-foreground/40 text-background flex size-4 shrink-0 items-center justify-center rounded-full">
          <XIcon className="size-2.5" weight="bold" />
        </span>
      </span>
      <p className="text-muted-foreground text-2xs leading-relaxed">
        onSubmit is the commit; onClear fires after the value empties.
      </p>
    </Specimen>
  )
}

function SettingRowsSpecimen() {
  return (
    <Specimen title="Setting rows" modulePath="composite/setting-row">
      <div className="border-border/70 bg-background overflow-hidden rounded-lg border">
        <div className="relative flex min-h-11 items-center gap-2 px-3">
          <span className="flex-1 truncate text-xs">Profile</span>
          <CaretRightIcon className="text-muted-foreground/70 size-3.5" weight="bold" />
          <span aria-hidden className="bg-border/70 absolute inset-x-3 bottom-0 h-px" />
        </div>
        <div className="relative flex min-h-11 items-center gap-2 px-3">
          <span className="flex-1 truncate text-xs">Appearance</span>
          <span className="text-muted-foreground text-xs">Match system</span>
        </div>
      </div>
      <p className="text-muted-foreground text-2xs leading-relaxed">
        A row with onPress shows a chevron; a value row without one is a read-out.
      </p>
    </Specimen>
  )
}

function AlertsSpecimen() {
  const variants = [
    {
      variant: "info" as const,
      Icon: InfoIcon,
      title: "Export ready",
      body: "The archive holds 1,284 records.",
    },
    {
      variant: "success" as const,
      Icon: CheckIcon,
      title: "Payment received",
      body: "Your receipt is on its way.",
    },
    {
      variant: "warning" as const,
      Icon: WarningIcon,
      title: "Storage nearly full",
      body: "47 of 50 GB used.",
    },
    {
      variant: "destructive" as const,
      Icon: WarningIcon,
      title: "Something went wrong",
      body: "The request timed out.",
    },
  ]

  return (
    <Specimen title="Inline alerts" modulePath="composite/alert">
      {variants.map(({ variant, Icon, title, body }) => (
        <div
          key={variant}
          role={variant === "destructive" ? "alert" : undefined}
          className={cn(
            "flex gap-2.5 rounded-lg border p-3",
            variant === "info" && "border-info/30 bg-info/5",
            variant === "success" && "border-success/30 bg-success/5",
            variant === "warning" && "border-warning/30 bg-warning/5",
            variant === "destructive" && "border-destructive/30 bg-destructive/5"
          )}
        >
          <Icon
            className={cn(
              "mt-0.5 size-4 shrink-0",
              variant === "info" && "text-info",
              variant === "success" && "text-success",
              variant === "warning" && "text-warning",
              variant === "destructive" && "text-destructive"
            )}
            weight="duotone"
          />
          <span className="flex min-w-0 flex-col gap-0.5">
            <span className="text-2xs font-semibold">{title}</span>
            <span className="text-muted-foreground text-2xs leading-relaxed">{body}</span>
          </span>
        </div>
      ))}
      <p className="text-muted-foreground text-2xs leading-relaxed">
        No focus stealing — only the destructive variant announces itself as an alert.
      </p>
    </Specimen>
  )
}

function LoadingSpecimen() {
  return (
    <Specimen title="Loading surfaces" modulePath="skeleton · spinner · progress">
      <div className="flex flex-col gap-2">
        <span className="bg-muted h-3.5 w-[70%] animate-pulse rounded-full" />
        <span className="bg-muted h-3.5 w-[85%] animate-pulse rounded-full" />
        <span className="bg-muted h-3.5 w-[45%] animate-pulse rounded-full" />
      </div>
      <div className="mt-1 flex flex-col gap-2">
        <span className="text-muted-foreground text-2xs">Uploading 47 of 50 GB</span>
        <span className="bg-muted h-1.5 w-full overflow-hidden rounded-full">
          <span className="bg-primary block h-full w-[94%] rounded-full" />
        </span>
      </div>
      <p className="text-muted-foreground text-2xs leading-relaxed">
        Progress takes a 0–1 value and clamps it, so a caller cannot overflow the track.
      </p>
    </Specimen>
  )
}

function AvatarGroupSpecimen() {
  const people = ["AL", "RS", "MC"]

  return (
    <Specimen title="Avatar stack" modulePath="composite/avatar-group">
      <div className="flex items-center">
        {people.map((initials, index) => (
          <span
            key={initials}
            className={cn(
              "bg-muted text-foreground border-card flex size-10 items-center justify-center rounded-full border-2 text-2xs font-semibold",
              index > 0 && "-ms-3"
            )}
          >
            {initials}
          </span>
        ))}
        <span className="bg-secondary text-secondary-foreground border-card -ms-3 flex size-10 items-center justify-center rounded-full border-2 text-2xs font-semibold">
          +4
        </span>
      </div>
      <p className="text-muted-foreground text-2xs leading-relaxed">
        Overflow collapses into a +N chip once the list exceeds max.
      </p>
    </Specimen>
  )
}

function TabBarSpecimen() {
  return (
    <Specimen title="Tab bar" modulePath="composite/tab-bar" className="p-0">
      <div className="bg-background rounded-lg border border-border/70 overflow-hidden">
        <TabBarMark />
      </div>
      <p className="text-muted-foreground px-4 pb-4 text-2xs leading-relaxed">
        Badges accept a string or a number, so a count and a dot share one slot.
      </p>
    </Specimen>
  )
}

function EmptyStateSpecimen() {
  return (
    <Specimen title="Empty state" modulePath="composite/empty-state">
      <div className="flex flex-col items-center gap-2 py-2 text-center">
        <span className="bg-muted text-muted-foreground flex size-12 items-center justify-center rounded-2xl">
          <MagnifyingGlassIcon className="size-6" weight="duotone" />
        </span>
        <span className="text-xs font-semibold">No projects yet</span>
        <span className="text-muted-foreground max-w-[190px] text-2xs leading-relaxed">
          Projects group your documents, deployments and environments.
        </span>
        <MobileButton size="sm" className="mt-1">
          Create a project
        </MobileButton>
      </div>
      <p className="text-muted-foreground text-2xs leading-relaxed">
        title is required — an illustration with no explanation is not an empty state.
      </p>
    </Specimen>
  )
}

function SliderSpecimen() {
  return (
    <Specimen title="Slider" modulePath="primitive/slider">
      <div className="flex flex-col gap-2">
        <span className="text-xs font-medium">Volume</span>
        <span className="relative flex h-11 items-center">
          <span className="bg-muted absolute inset-x-0 h-1.5 rounded-full" />
          <span className="bg-primary absolute left-0 h-1.5 w-[62%] rounded-full" />
          <span className="bg-background border-border absolute left-[62%] size-6 -translate-x-1/2 rounded-full border shadow-sm" />
        </span>
        <span className="text-muted-foreground text-2xs tabular-nums">62</span>
      </div>
      <p className="text-muted-foreground text-2xs leading-relaxed">
        Built on PanResponder, so the package adds no new dependency. onSlidingComplete is the
        commit.
      </p>
    </Specimen>
  )
}

function RadioSpecimen() {
  const options = [
    { label: "Free", description: "1 project", selected: false },
    { label: "Pro", description: "Unlimited projects", selected: true },
    { label: "Team", description: "Seats and SSO", selected: false },
  ]

  return (
    <Specimen title="Radio group" modulePath="primitive/radio-group">
      {options.map((option) => (
        <div key={option.label} className="flex min-h-11 items-center gap-3">
          <span
            className={cn(
              "flex size-[22px] shrink-0 items-center justify-center rounded-full border",
              option.selected ? "border-primary" : "border-input"
            )}
          >
            {option.selected ? <span className="bg-primary size-2.5 rounded-full" /> : null}
          </span>
          <span className="flex min-w-0 flex-1 flex-col">
            <span className="truncate text-xs font-medium">{option.label}</span>
            <span className="text-muted-foreground truncate text-2xs">
              {option.description}
            </span>
          </span>
        </div>
      ))}
      <p className="text-muted-foreground text-2xs leading-relaxed">
        One disabled option does not disable the group.
      </p>
    </Specimen>
  )
}

function ToastSpecimen() {
  return (
    <Specimen title="Toast" modulePath="composite/toast">
      <div className="bg-foreground text-background flex items-center gap-2.5 rounded-lg px-3 py-2.5">
        <CheckIcon className="size-4 shrink-0" weight="bold" />
        <span className="min-w-0 flex-1 truncate text-2xs font-medium">
          Project “atlas” deployed
        </span>
        <span className="text-2xs font-semibold underline underline-offset-2">Undo</span>
      </div>
      <p className="text-muted-foreground text-2xs leading-relaxed">
        One toast owns the screen at a time — replacing rather than stacking. An action should
        use duration 0 so it cannot expire first.
      </p>
    </Specimen>
  )
}

/* -------------------------------------------------------------------------- */
/* Chart                                                                       */
/* -------------------------------------------------------------------------- */

/**
 * The mobile chart ramp, transcribed from `packages/mobile/src/tokens.ts`.
 *
 * Deliberately *not* `--chart-1…5`: those are the web chart slots and they are
 * neutral greys. The mobile ramp is a hue wheel anchored on the brand red,
 * because a 9pt dot needs far more separation than a filled band does.
 */
const MOBILE_CHART_SERIES = ["#d40c1a", "#b45309", "#0f766e"]

/** The plot box inside the SVG viewBox, in user units. */
const CHART_PLOT = { left: 34, top: 6, right: 312, bottom: 132 }
const CHART_TICKS = [0, 25, 50, 75, 100]

const chartPx = (value: number) =>
  CHART_PLOT.left +
  (value / 100) * (CHART_PLOT.right - CHART_PLOT.left)

const chartPy = (value: number) =>
  CHART_PLOT.bottom -
  (value / 100) * (CHART_PLOT.bottom - CHART_PLOT.top)

const CHART_SERIES_DATA = [
  {
    label: "Control",
    points: [
      [8, 18], [19, 26], [28, 23], [37, 39], [46, 42],
      [58, 51], [67, 55], [79, 64], [88, 73], [95, 81],
    ],
  },
  {
    label: "Variant A",
    points: [
      [10, 34], [21, 41], [31, 47], [42, 52], [53, 61],
      [64, 66], [75, 72], [86, 79], [94, 88],
    ],
  },
  {
    label: "Variant B",
    points: [
      [6, 9], [17, 14], [27, 12], [38, 21], [49, 26],
      [60, 31], [71, 36], [82, 44], [91, 49], [97, 57],
    ],
  },
]

function ChartSpecimen() {
  return (
    <Specimen title="Scatter plot" modulePath="composite/chart-scatter">
      <div className="flex flex-wrap items-center gap-x-3.5 gap-y-1.5">
        {CHART_SERIES_DATA.map((series, index) => (
          <span key={series.label} className="flex items-center gap-1.5">
            <span
              className="size-2.5 rounded-full"
              style={{ backgroundColor: MOBILE_CHART_SERIES[index] }}
            />
            <span className="text-muted-foreground text-2xs">{series.label}</span>
          </span>
        ))}
      </div>

      <div className="relative">
        <svg
          viewBox="0 0 320 148"
          className="w-full"
          role="img"
          aria-label="Scatter plot of three series"
        >
          {CHART_TICKS.map((tick) => (
            <line
              key={`grid-x-${tick}`}
              x1={chartPx(tick)}
              y1={CHART_PLOT.top}
              x2={chartPx(tick)}
              y2={CHART_PLOT.bottom}
              className="stroke-border"
              strokeWidth={1}
            />
          ))}
          {CHART_TICKS.map((tick) => (
            <line
              key={`grid-y-${tick}`}
              x1={CHART_PLOT.left}
              y1={chartPy(tick)}
              x2={CHART_PLOT.right}
              y2={chartPy(tick)}
              className="stroke-border"
              strokeWidth={1}
            />
          ))}

          {CHART_TICKS.map((tick) => (
            <text
              key={`label-y-${tick}`}
              x={CHART_PLOT.left - 5}
              y={chartPy(tick) + 3}
              textAnchor="end"
              className="fill-muted-foreground text-[9px] tabular-nums"
            >
              {tick}
            </text>
          ))}
          {CHART_TICKS.map((tick) => (
            <text
              key={`label-x-${tick}`}
              x={chartPx(tick)}
              y={CHART_PLOT.bottom + 13}
              textAnchor="middle"
              className="fill-muted-foreground text-[9px] tabular-nums"
            >
              {tick}
            </text>
          ))}

          {CHART_SERIES_DATA.map((series, seriesIndex) =>
            series.points.map(([x, y], pointIndex) => (
              <circle
                key={`${series.label}-${pointIndex}`}
                cx={chartPx(x)}
                cy={chartPy(y)}
                r={4.5}
                fill={MOBILE_CHART_SERIES[seriesIndex]}
              />
            ))
          )}

          {/* The selected point, marked the way the press state marks it. */}
          <circle
            cx={chartPx(58)}
            cy={chartPy(51)}
            r={9}
            fill="none"
            className="stroke-foreground"
            strokeWidth={2}
          />
        </svg>

        {/*
          Pinned, not following the finger. A bubble at the touch point sits
          under the thumb on a phone, which is why the native component puts the
          numbers in a fixed corner instead.
        */}
        <div className="bg-card border-border absolute end-0 top-0 rounded-sm border px-2 py-1">
          <div className="text-foreground text-[9px] font-semibold tabular-nums">
            58 · 51
          </div>
          <div className="text-muted-foreground text-[9px]">Control</div>
        </div>
      </div>

      <p className="text-muted-foreground text-2xs leading-relaxed">
        Rendered by victory-native over Skia, the one module in the package with dependencies —
        declared as optional peers. Series colours come from the chart ramp, and the readout is
        pinned rather than following the finger.
      </p>
    </Specimen>
  )
}

export const MOBILE_SPECIMENS = [
  ButtonsSpecimen,
  SwitchesSpecimen,
  InputsSpecimen,
  CheckboxesSpecimen,
  IconButtonsSpecimen,
  BadgesSpecimen,
  SegmentedSpecimen,
  SearchSpecimen,
  SettingRowsSpecimen,
  AlertsSpecimen,
  LoadingSpecimen,
  SliderSpecimen,
  RadioSpecimen,
  AvatarGroupSpecimen,
  EmptyStateSpecimen,
  ToastSpecimen,
  TabBarSpecimen,
  ChartSpecimen,
]
