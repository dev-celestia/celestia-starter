"use client"

import * as React from "react"
import * as RechartsPrimitive from "recharts"

import { ChartContainer } from "@celestia-project/ui/composite/chart"
import { cn } from "@celestia-project/ui/lib/utils"

type ChartRadialProps = React.ComponentProps<"div"> & {
  /** Current value. */
  value: number
  /** Maximum value. Defaults to 100. */
  max?: number
  /** Arc color. Defaults to the first chart palette color. */
  color?: string
  /** Render the percentage in the center. */
  showValue?: boolean
  /** Start angle in degrees (0 = 3 o'clock, increasing counterclockwise). Defaults to 90 (12 o'clock). */
  startAngle?: number
  /** End angle in degrees. Defaults to -270 (one full clockwise turn from the top). */
  endAngle?: number
  /** Corner radius of the arc. Defaults to 9999 (fully rounded). */
  cornerRadius?: number | string
  /** Center content. Overrides the default percentage. */
  children?: React.ReactNode
}

function ChartRadial({
  value,
  max = 100,
  color = "var(--chart-1)",
  showValue = true,
  startAngle = 90,
  endAngle = -270,
  cornerRadius = 9999,
  className,
  children,
  ...props
}: ChartRadialProps) {
  const percent = max === 0 ? 0 : (value / max) * 100

  return (
    <div
      data-slot="chart-radial"
      className={cn("relative mx-auto aspect-square w-full max-w-56", className)}
      {...props}
    >
      <ChartContainer config={{ value: { label: "Value", color } }} className="aspect-square h-full w-full">
        <RechartsPrimitive.RadialBarChart
          data={[{ value, fill: color }]}
          innerRadius="72%"
          outerRadius="100%"
          startAngle={startAngle}
          endAngle={endAngle}
        >
          <RechartsPrimitive.PolarAngleAxis
            type="number"
            domain={[0, max]}
            tick={false}
          />
          <RechartsPrimitive.RadialBar
            dataKey="value"
            background={{ fill: "var(--muted)" }}
            cornerRadius={cornerRadius}
            isAnimationActive={false}
          />
        </RechartsPrimitive.RadialBarChart>
      </ChartContainer>
      {children ? (
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center">
          {children}
        </div>
      ) : showValue ? (
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <span className="font-heading text-4xl font-semibold tabular-nums">
            {Math.round(percent)}%
          </span>
        </div>
      ) : null}
    </div>
  )
}

export { ChartRadial, type ChartRadialProps }
