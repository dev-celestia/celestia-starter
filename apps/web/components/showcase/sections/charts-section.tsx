"use client"

import * as React from "react"
import {
  ChartArea,
  ChartBar,
  ChartContainer,
  ChartLine,
  ChartPie,
  ChartRadar,
  ChartRadial,
  ChartSparkline,
  ChartTooltip,
  ChartTooltipContent,
  ChartConfig,
  Area,
  AreaChart,
  CartesianGrid,
  XAxis,
} from "@celestia-project/ui"
import { ShowcaseCard } from "../showcase-card"

const REVENUE_DATA = [
  { month: "Jan", revenue: 4200, expenses: 2400 },
  { month: "Feb", revenue: 5100, expenses: 2900 },
  { month: "Mar", revenue: 4800, expenses: 2700 },
  { month: "Apr", revenue: 6200, expenses: 3100 },
  { month: "May", revenue: 5900, expenses: 3300 },
  { month: "Jun", revenue: 7400, expenses: 3600 },
]

const PIE_DATA = [
  { name: "Direct", value: 300 },
  { name: "Organic", value: 220 },
  { name: "Referral", value: 140 },
  { name: "Social", value: 90 },
]

const RADAR_DATA = [
  { axis: "Accuracy", current: 92, previous: 78 },
  { axis: "Latency", current: 74, previous: 60 },
  { axis: "Uptime", current: 98, previous: 95 },
  { axis: "Throughput", current: 68, previous: 72 },
  { axis: "Developer UX", current: 85, previous: 70 },
]

const SPARK_DATA = [12, 18, 9, 22, 15, 27, 19, 31, 24]

const COMPOSED_DATA = [
  { month: "Jan", requests: 186, latency: 80 },
  { month: "Feb", requests: 305, latency: 65 },
  { month: "Mar", requests: 237, latency: 70 },
  { month: "Apr", requests: 730, latency: 45 },
  { month: "May", requests: 609, latency: 50 },
  { month: "Jun", requests: 814, latency: 40 },
]

const COMPOSED_CONFIG = {
  requests: {
    label: "API Requests",
    color: "var(--primary)",
  },
  latency: {
    label: "Latency (ms)",
    color: "var(--muted-foreground)",
  },
} satisfies ChartConfig

const CONTAINER_CODE = `import * as React from "react"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartConfig,
  AreaChart,
  Area,
  CartesianGrid,
  XAxis,
} from "@celestia-project/ui"

const data = [
  { month: "Jan", requests: 186 },
  { month: "Feb", requests: 305 },
  { month: "Mar", requests: 730 },
]

const config = {
  requests: { label: "API Requests", color: "var(--primary)" },
} satisfies ChartConfig

export function ChartDemo() {
  return (
    <ChartContainer config={config} className="h-36 w-full">
      <AreaChart data={data}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.3} />
        <XAxis dataKey="month" fontSize={10} />
        <ChartTooltip content={<ChartTooltipContent />} />
        <Area type="monotone" dataKey="requests" stroke="var(--color-requests)" fill="var(--color-requests)" fillOpacity={0.2} />
      </AreaChart>
    </ChartContainer>
  )
}`

const AREA_CODE = `import { ChartArea } from "@celestia-project/ui/composite/chart-area"

const data = [
  { month: "Jan", revenue: 4200, expenses: 2400 },
  { month: "Feb", revenue: 5100, expenses: 2900 },
  { month: "Mar", revenue: 4800, expenses: 2700 },
]

export function AreaDemo() {
  return <ChartArea data={data} xKey="month" showLegend className="h-56" />
}`

const LINE_CODE = `import { ChartLine } from "@celestia-project/ui/composite/chart-line"

const data = [
  { month: "Jan", revenue: 4200, expenses: 2400 },
  { month: "Feb", revenue: 5100, expenses: 2900 },
  { month: "Mar", revenue: 4800, expenses: 2700 },
]

export function LineDemo() {
  return (
    <ChartLine
      data={data}
      xKey="month"
      dots
      curveType="natural"
      showLegend
      className="h-56"
    />
  )
}`

const BAR_CODE = `import { ChartBar } from "@celestia-project/ui/composite/chart-bar"

const data = [
  { month: "Jan", revenue: 4200, expenses: 2400 },
  { month: "Feb", revenue: 5100, expenses: 2900 },
  { month: "Mar", revenue: 4800, expenses: 2700 },
]

export function BarDemo() {
  return <ChartBar data={data} xKey="month" stacked showLegend className="h-56" />
}`

const PIE_CODE = `import { ChartPie } from "@celestia-project/ui/composite/chart-pie"

const data = [
  { name: "Direct", value: 300 },
  { name: "Organic", value: 220 },
  { name: "Referral", value: 140 },
  { name: "Social", value: 90 },
]

export function PieDemo() {
  return (
    <ChartPie data={data} donut cornerRadius={4} className="max-w-56">
      <span className="text-2xl font-bold tabular-nums">750</span>
      <span className="text-xs text-muted-foreground">Visitors</span>
    </ChartPie>
  )
}`

const RADAR_CODE = `import { ChartRadar } from "@celestia-project/ui/composite/chart-radar"

const data = [
  { axis: "Accuracy", current: 92, previous: 78 },
  { axis: "Latency", current: 74, previous: 60 },
  { axis: "Uptime", current: 98, previous: 95 },
]

export function RadarDemo() {
  return (
    <ChartRadar data={data} xKey="axis" dots showLegend className="h-64" />
  )
}`

const RADIAL_CODE = `import { ChartRadial } from "@celestia-project/ui/composite/chart-radial"

export function GaugeDemo() {
  return <ChartRadial value={72} max={100} showValue />
}`

const SPARKLINE_CODE = `import { ChartSparkline } from "@celestia-project/ui/composite/chart-sparkline"

const data = [12, 18, 9, 22, 15, 27, 19, 31, 24]

export function SparklineDemo() {
  return (
    <div className="flex flex-col gap-3">
      <ChartSparkline data={data} variant="line" showDot />
      <ChartSparkline data={data} variant="area" />
      <ChartSparkline data={data} variant="bar" />
    </div>
  )
}`

export function ChartsSection() {
  return (
    <div id="charts" className="flex flex-col gap-6 pt-6 pb-16">
      <div className="flex items-center gap-2 border-b border-border pb-2">
        <h2 className="text-lg font-bold tracking-tight text-foreground sm:text-xl">
          Charts &amp; Data Viz
        </h2>
        <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
          8 components
        </span>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {/* 1. Chart Container (composed API) */}
        <ShowcaseCard
          id="chart"
          title="Chart Container"
          category="Charts"
          description="Responsive container injecting CSS variable colors from a ChartConfig, paired with themeable tooltip and legend — compose raw recharts primitives freely."
          docsSlug="chart"
          importSnippet={`import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@celestia-project/ui"`}
          codeExample={CONTAINER_CODE}
        >
          <div className="w-full max-w-sm">
            <ChartContainer config={COMPOSED_CONFIG} className="h-36 w-full">
              <AreaChart data={COMPOSED_DATA}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.3} />
                <XAxis dataKey="month" tickLine={false} axisLine={false} tickMargin={8} fontSize={10} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Area
                  type="monotone"
                  dataKey="requests"
                  stroke="var(--color-requests)"
                  fill="var(--color-requests)"
                  fillOpacity={0.2}
                />
              </AreaChart>
            </ChartContainer>
          </div>
        </ShowcaseCard>

        {/* 2. Area Chart */}
        <ShowcaseCard
          id="chart-area"
          title="Area Chart"
          category="Charts"
          description="Prefab area chart with gradient fills, grid, tooltip, and automatic series palette. Supports stacked series and curve types."
          docsSlug="chart"
          importSnippet={`import { ChartArea } from "@celestia-project/ui/composite/chart-area"`}
          codeExample={AREA_CODE}
        >
          <div className="w-full max-w-sm">
            <ChartArea data={REVENUE_DATA} xKey="month" showLegend className="h-56" />
          </div>
        </ShowcaseCard>

        {/* 3. Line Chart */}
        <ShowcaseCard
          id="chart-line"
          title="Line Chart"
          category="Charts"
          description="Prefab line chart with configurable interpolation (monotone, natural, linear, step), optional point dots, and series palette defaults."
          docsSlug="chart"
          importSnippet={`import { ChartLine } from "@celestia-project/ui/composite/chart-line"`}
          codeExample={LINE_CODE}
        >
          <div className="w-full max-w-sm">
            <ChartLine
              data={REVENUE_DATA}
              xKey="month"
              dots
              curveType="natural"
              showLegend
              className="h-56"
            />
          </div>
        </ShowcaseCard>

        {/* 4. Bar Chart */}
        <ShowcaseCard
          id="chart-bar"
          title="Bar Chart"
          category="Charts"
          description="Prefab bar chart with grouped, stacked, and horizontal layouts, rounded corners, and palette-driven series colors."
          docsSlug="chart"
          importSnippet={`import { ChartBar } from "@celestia-project/ui/composite/chart-bar"`}
          codeExample={BAR_CODE}
        >
          <div className="w-full max-w-sm">
            <ChartBar data={REVENUE_DATA} xKey="month" stacked showLegend className="h-56" />
          </div>
        </ShowcaseCard>

        {/* 5. Pie / Donut */}
        <ShowcaseCard
          id="chart-pie"
          title="Pie / Donut"
          category="Charts"
          description="Prefab pie chart with a donut mode, padded rounded slices, and a center slot for summary content."
          docsSlug="chart"
          importSnippet={`import { ChartPie } from "@celestia-project/ui/composite/chart-pie"`}
          codeExample={PIE_CODE}
        >
          <div className="flex justify-center">
            <ChartPie data={PIE_DATA} donut cornerRadius={4} className="max-w-56">
              <span className="text-2xl font-bold tabular-nums">750</span>
              <span className="text-xs text-muted-foreground">Visitors</span>
            </ChartPie>
          </div>
        </ShowcaseCard>

        {/* 6. Radar */}
        <ShowcaseCard
          id="chart-radar"
          title="Radar Chart"
          category="Charts"
          description="Prefab radar chart with polar grid, spoke labels, vertex dots, and multi-series polygons sharing the same palette."
          docsSlug="chart"
          importSnippet={`import { ChartRadar } from "@celestia-project/ui/composite/chart-radar"`}
          codeExample={RADAR_CODE}
        >
          <div className="flex justify-center">
            <ChartRadar data={RADAR_DATA} xKey="axis" dots showLegend className="h-64 max-w-sm" />
          </div>
        </ShowcaseCard>

        {/* 7. Radial Gauge */}
        <ShowcaseCard
          id="chart-radial"
          title="Radial Gauge"
          category="Charts"
          description="Single-value radial gauge with a fully rounded arc, muted track, and centered percentage. Angle props follow the recharts 3 convention (0° = 3 o'clock, counterclockwise-positive)."
          docsSlug="chart"
          importSnippet={`import { ChartRadial } from "@celestia-project/ui/composite/chart-radial"`}
          codeExample={RADIAL_CODE}
        >
          <ChartRadial value={72} max={100} showValue />
        </ShowcaseCard>

        {/* 8. Sparkline */}
        <ShowcaseCard
          id="chart-sparkline"
          title="Sparkline"
          category="Charts"
          description="Minimal axis-free trend line in three variants (line, area, bar), with an optional highlight dot on the last data point."
          docsSlug="chart"
          importSnippet={`import { ChartSparkline } from "@celestia-project/ui/composite/chart-sparkline"`}
          codeExample={SPARKLINE_CODE}
        >
          <div className="flex w-full max-w-sm flex-col gap-4">
            {(
              [
                { label: "Revenue", variant: "line", color: "var(--chart-1)" },
                { label: "Sessions", variant: "area", color: "var(--chart-3)" },
                { label: "Sign-ups", variant: "bar", color: "var(--chart-4)" },
              ] as const
            ).map((row) => (
              <div key={row.variant} className="flex items-center gap-3">
                <span className="w-16 shrink-0 text-xs text-muted-foreground">{row.label}</span>
                <ChartSparkline
                  data={SPARK_DATA}
                  variant={row.variant}
                  color={row.color}
                  className="h-10 flex-1"
                  showDot
                />
              </div>
            ))}
          </div>
        </ShowcaseCard>
      </div>
    </div>
  )
}
