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

type ChartBarProps = Omit<
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
  /** Render horizontal bars (categories on the Y axis). */
  horizontal?: boolean
  /** Fixed bar size in pixels. */
  barSize?: number
  showGrid?: boolean
  showTooltip?: boolean
  showLegend?: boolean
  /** Extra recharts elements (e.g. `<ReferenceLine />`) rendered inside the chart. */
  children?: React.ReactNode
}

function ChartBar({
  data,
  xKey,
  series,
  stacked = false,
  horizontal = false,
  barSize,
  showGrid = true,
  showTooltip = true,
  showLegend = false,
  className,
  children,
  ...props
}: ChartBarProps) {
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
      <RechartsPrimitive.BarChart
        data={data}
        layout={horizontal ? "vertical" : "horizontal"}
        margin={horizontal ? { left: 8, right: 12 } : undefined}
      >
        {showGrid && (
          <RechartsPrimitive.CartesianGrid
            vertical={horizontal}
            horizontal={!horizontal}
          />
        )}
        {horizontal ? (
          <>
            <RechartsPrimitive.XAxis
              type="number"
              tickLine={false}
              axisLine={false}
              hide
            />
            <RechartsPrimitive.YAxis
              type="category"
              dataKey={resolved.xKey}
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              width={88}
            />
          </>
        ) : (
          <>
            <RechartsPrimitive.XAxis
              dataKey={resolved.xKey}
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={0}
            />
            <RechartsPrimitive.YAxis
              tickLine={false}
              axisLine={false}
              tickMargin={4}
              width={44}
            />
          </>
        )}
        {showTooltip && (
          <ChartTooltip
            content={<ChartTooltipContent indicator="line" />}
            cursor={horizontal ? { fill: "var(--muted)" } : undefined}
          />
        )}
        {showLegend && <ChartLegend content={<ChartLegendContent />} />}
        {resolved.series.map((item) => (
          <RechartsPrimitive.Bar
            key={item.key}
            dataKey={item.key}
            name={item.label}
            fill={item.color}
            radius={horizontal ? [0, 4, 4, 0] : [4, 4, 0, 0]}
            stackId={stacked ? "stack" : undefined}
            barSize={barSize}
          />
        ))}
        {children}
      </RechartsPrimitive.BarChart>
    </ChartContainer>
  )
}

export { ChartBar, type ChartBarProps }
