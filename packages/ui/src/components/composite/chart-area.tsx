"use client"

import * as React from "react"
import * as RechartsPrimitive from "recharts"

import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  resolveChartSeries,
  type ChartSeries,
} from "@celestia-project/ui/composite/chart"
import { cn } from "@celestia-project/ui/lib/utils"

type ChartAreaProps = Omit<
  React.ComponentProps<typeof ChartContainer>,
  "children" | "config"
> & {
  data: Record<string, unknown>[]
  /** Data key for the category axis. Defaults to the first non-numeric data key. */
  xKey?: string
  /** Series definitions. Defaults to every data key except `xKey`. */
  series?: ChartSeries[]
  /** Stack all series into a single stack. */
  stacked?: boolean
  /** Line interpolation. */
  curveType?: "monotone" | "natural" | "linear" | "step"
  showGrid?: boolean
  showTooltip?: boolean
  showLegend?: boolean
  /** Extra recharts elements (e.g. `<ReferenceLine />`) rendered inside the chart. */
  children?: React.ReactNode
}

function ChartArea({
  data,
  xKey,
  series,
  stacked = false,
  curveType = "monotone",
  showGrid = true,
  showTooltip = true,
  showLegend = false,
  className,
  children,
  ...props
}: ChartAreaProps) {
  const gradientId = React.useId()
  const resolved = resolveChartSeries(data, xKey, series)
  const config = Object.fromEntries(
    resolved.series.map((item) => [
      item.key,
      { label: item.label, color: item.color },
    ])
  )

  return (
    <ChartContainer
      config={config}
      className={cn("h-72 w-full", className)}
      {...props}
    >
      <RechartsPrimitive.AreaChart data={data}>
        <defs>
          {resolved.series.map((item) => (
            <linearGradient
              key={item.key}
              id={`${gradientId}-${item.key}`}
              x1="0"
              y1="0"
              x2="0"
              y2="1"
            >
              <stop offset="0%" stopColor={item.color} stopOpacity={0.35} />
              <stop offset="100%" stopColor={item.color} stopOpacity={0.03} />
            </linearGradient>
          ))}
        </defs>
        {showGrid && <RechartsPrimitive.CartesianGrid vertical={false} />}
        <RechartsPrimitive.XAxis
          dataKey={resolved.xKey}
          tickLine={false}
          axisLine={false}
          tickMargin={8}
          minTickGap={16}
        />
        <RechartsPrimitive.YAxis
          tickLine={false}
          axisLine={false}
          tickMargin={4}
          width={44}
        />
        {showTooltip && (
          <ChartTooltip
            content={<ChartTooltipContent indicator="line" />}
            cursor={{ stroke: "var(--border)" }}
          />
        )}
        {showLegend && <ChartLegend content={<ChartLegendContent />} />}
        {resolved.series.map((item) => (
          <RechartsPrimitive.Area
            key={item.key}
            dataKey={item.key}
            name={item.label}
            type={curveType}
            strokeWidth={2}
            stroke={item.color}
            fill={`url(#${gradientId}-${item.key})`}
            stackId={stacked ? "stack" : undefined}
          />
        ))}
        {children}
      </RechartsPrimitive.AreaChart>
    </ChartContainer>
  )
}

export { ChartArea, type ChartAreaProps }
