"use client"

import * as React from "react"
import * as RechartsPrimitive from "recharts"

import { cn } from "@celestia-project/ui/lib/utils"

type ChartSparklineProps = React.ComponentProps<"div"> & {
  /** Plain numbers or rows keyed by `dataKey`. */
  data: number[] | Record<string, unknown>[]
  /** Data key used when rows are objects. Defaults to "value". */
  dataKey?: string
  /** Sparkline style. */
  variant?: "line" | "area" | "bar"
  /** Line/fill color. Defaults to the first chart palette color. */
  color?: string
  strokeWidth?: number
  /** Highlight the last data point with a dot. */
  showDot?: boolean
}

function ChartSparkline({
  data,
  dataKey = "value",
  variant = "line",
  color = "var(--chart-1)",
  strokeWidth = 1.5,
  showDot = false,
  className,
  ...props
}: ChartSparklineProps) {
  const gradientId = React.useId()
  const rows: Record<string, unknown>[] = React.useMemo(
    () =>
      data.every((row) => typeof row === "number")
        ? (data as number[]).map((value) => ({ [dataKey]: value }))
        : (data as Record<string, unknown>[]),
    [data, dataKey]
  )
  const lastIndex = rows.length - 1

  return (
    <div
      data-slot="chart-sparkline"
      className={cn("h-10 w-full", className)}
      {...props}
    >
      <RechartsPrimitive.ResponsiveContainer
        initialDimension={{ width: 120, height: 40 }}
      >
        {variant === "bar" ? (
          <RechartsPrimitive.BarChart
            data={rows}
            margin={{ top: 2, right: 0, bottom: 2, left: 0 }}
          >
            <RechartsPrimitive.XAxis dataKey={dataKey} hide />
            <RechartsPrimitive.YAxis hide domain={[0, "dataMax"]} />
            <RechartsPrimitive.Bar
              dataKey={dataKey}
              fill={color}
              radius={1}
              isAnimationActive={false}
            />
          </RechartsPrimitive.BarChart>
        ) : (
          <RechartsPrimitive.LineChart
            data={rows}
            margin={{ top: 2, right: 0, bottom: 2, left: 0 }}
          >
            {variant === "area" ? (
              <defs>
                <linearGradient
                  id={`${gradientId}-fill`}
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop offset="0%" stopColor={color} stopOpacity={0.3} />
                  <stop offset="100%" stopColor={color} stopOpacity={0.02} />
                </linearGradient>
              </defs>
            ) : null}
            <RechartsPrimitive.XAxis dataKey={dataKey} hide />
            <RechartsPrimitive.YAxis
              hide
              domain={["dataMin", "dataMax"]}
            />
            <RechartsPrimitive.Line
              dataKey={dataKey}
              type="monotone"
              stroke={color}
              strokeWidth={strokeWidth}
              fill={variant === "area" ? `url(#${gradientId}-fill)` : "none"}
              isAnimationActive={false}
              dot={
                showDot
                  ? (dotProps: { index?: number; cx?: number; cy?: number }) =>
                      dotProps.index === lastIndex &&
                      dotProps.cx != null &&
                      dotProps.cy != null ? (
                        <circle
                          key={dotProps.index}
                          cx={dotProps.cx}
                          cy={dotProps.cy}
                          r={3}
                          fill={color}
                          stroke="var(--background)"
                          strokeWidth={1.5}
                        />
                      ) : null
                  : false
              }
            />
          </RechartsPrimitive.LineChart>
        )}
      </RechartsPrimitive.ResponsiveContainer>
    </div>
  )
}

export { ChartSparkline, type ChartSparklineProps }
