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

type ChartLineProps = Omit<
  React.ComponentProps<typeof ChartContainer>,
  "children" | "config"
> & {
  data: Record<string, unknown>[]
  /** Data key for the category axis. Defaults to the first non-numeric data key. */
  xKey?: string
  /** Series definitions. Defaults to every data key except `xKey`. */
  series?: ChartSeries[]
  /** Show a dot on every data point. */
  dots?: boolean
  /** Line interpolation. */
  curveType?: "monotone" | "natural" | "linear" | "step"
  showGrid?: boolean
  showTooltip?: boolean
  showLegend?: boolean
  /** Extra recharts elements (e.g. `<ReferenceLine />`) rendered inside the chart. */
  children?: React.ReactNode
}

function ChartLine({
  data,
  xKey,
  series,
  dots = false,
  curveType = "monotone",
  showGrid = true,
  showTooltip = true,
  showLegend = false,
  className,
  children,
  ...props
}: ChartLineProps) {
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
      <RechartsPrimitive.LineChart data={data}>
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
          <RechartsPrimitive.Line
            key={item.key}
            dataKey={item.key}
            name={item.label}
            type={curveType}
            strokeWidth={2}
            stroke={item.color}
            dot={dots ? { r: 3, strokeWidth: 0 } : false}
            activeDot={{ r: 4 }}
          />
        ))}
        {children}
      </RechartsPrimitive.LineChart>
    </ChartContainer>
  )
}

export { ChartLine, type ChartLineProps }
