"use client"

import * as React from "react"
import * as RechartsPrimitive from "recharts"

import {
  chartColor,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@celestia-project/ui/composite/chart"
import { cn } from "@celestia-project/ui/lib/utils"

type ChartPieData = { name: string; value: number }

type ChartPieProps = React.ComponentProps<"div"> & {
  /** One row per slice, in draw order. */
  data: ChartPieData[]
  /** Render as a donut (hole in the middle). */
  donut?: boolean
  /** Hole size. Defaults to 60% when `donut` is set. */
  innerRadius?: number | string
  /** Outer size. Defaults to 100%. */
  outerRadius?: number | string
  /** Angle between slices in degrees. Defaults to 3 when `donut` is set. */
  paddingAngle?: number
  /** Corner radius of slices in pixels. */
  cornerRadius?: number
  showTooltip?: boolean
  showLegend?: boolean
  /** Center content (shown inside the donut hole). */
  children?: React.ReactNode
}

function ChartPie({
  data,
  donut = false,
  innerRadius,
  outerRadius = "100%",
  paddingAngle,
  cornerRadius = 3,
  showTooltip = true,
  showLegend = false,
  className,
  children,
  ...props
}: ChartPieProps) {
  const config = Object.fromEntries(
    data.map((row, index) => [
      row.name,
      { label: row.name, color: chartColor(index) },
    ])
  )

  return (
    <div
      data-slot="chart-pie"
      className={cn("relative h-72 w-full", className)}
      {...props}
    >
      <ChartContainer config={config} className="h-full w-full">
        <RechartsPrimitive.PieChart>
          {showTooltip && (
            <ChartTooltip
              content={<ChartTooltipContent nameKey="name" hideLabel />}
            />
          )}
          {showLegend && (
            <ChartLegend content={<ChartLegendContent nameKey="name" />} />
          )}
          <RechartsPrimitive.Pie
            data={data}
            dataKey="value"
            nameKey="name"
            innerRadius={innerRadius ?? (donut ? "60%" : 0)}
            outerRadius={outerRadius}
            paddingAngle={paddingAngle ?? (donut ? 3 : 0)}
            cornerRadius={cornerRadius}
            strokeWidth={2}
            stroke="var(--background)"
          >
            {data.map((row, index) => (
              <RechartsPrimitive.Cell
                key={row.name}
                fill={chartColor(index)}
              />
            ))}
          </RechartsPrimitive.Pie>
        </RechartsPrimitive.PieChart>
      </ChartContainer>
      {children ? (
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center">
          {children}
        </div>
      ) : null}
    </div>
  )
}

export { ChartPie, type ChartPieProps, type ChartPieData }
