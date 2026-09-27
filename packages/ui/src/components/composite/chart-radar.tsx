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

type ChartRadarProps = Omit<
  React.ComponentProps<typeof ChartContainer>,
  "children" | "config"
> & {
  data: Record<string, unknown>[]
  /** Data key for the spoke labels. Defaults to the first non-numeric data key. */
  xKey?: string
  /** Series definitions. Defaults to every data key except `xKey`. */
  series?: ChartSeries[]
  /** Fill opacity of the radar polygons. */
  fillOpacity?: number
  /** Show a dot on every vertex. */
  dots?: boolean
  showTooltip?: boolean
  showLegend?: boolean
  /** Extra recharts elements rendered inside the chart. */
  children?: React.ReactNode
}

function ChartRadar({
  data,
  xKey,
  series,
  fillOpacity = 0.3,
  dots = false,
  showTooltip = true,
  showLegend = false,
  className,
  children,
  ...props
}: ChartRadarProps) {
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
      className={cn("aspect-square w-full", className)}
      {...props}
    >
      <RechartsPrimitive.RadarChart data={data}>
        <RechartsPrimitive.PolarGrid />
        <RechartsPrimitive.PolarAngleAxis
          dataKey={resolved.xKey}
          tick={{ fill: "var(--muted-foreground)" }}
        />
        <RechartsPrimitive.PolarRadiusAxis
          tick={false}
          axisLine={false}
        />
        {showTooltip && <ChartTooltip content={<ChartTooltipContent />} />}
        {showLegend && <ChartLegend content={<ChartLegendContent />} />}
        {resolved.series.map((item) => (
          <RechartsPrimitive.Radar
            key={item.key}
            dataKey={item.key}
            name={item.label}
            stroke={item.color}
            fill={item.color}
            fillOpacity={fillOpacity}
            strokeWidth={2}
            dot={dots ? { r: 3, strokeWidth: 0 } : false}
          />
        ))}
        {children}
      </RechartsPrimitive.RadarChart>
    </ChartContainer>
  )
}

export { ChartRadar, type ChartRadarProps }
