import * as React from "react"
import { StyleSheet, View, type ViewStyle } from "react-native"
import {
  Bar,
  BarGroup,
  CartesianChart,
  StackedBar,
  useChartPressState,
} from "victory-native"
import { runOnJS, useAnimatedReaction } from "react-native-reanimated"
import * as Haptics from "expo-haptics"
import { useMobileTheme } from "../../host"
import { MobileText } from "../primitive/text"
import { chartColor, metrics } from "../../tokens"

const DEFAULT_SERIES = "Series 1"

/**
 * The flat row `CartesianChart` consumes. Like the scatter chart, every series
 * is collapsed into one `y` column so the domain is derived from the whole
 * table; the per-series split happens on the way out, inside the render prop.
 */
type ChartRow = {
  x: number
  y: number
  [key: string]: unknown
}

function defaultFormat(value: number): string {
  if (!Number.isFinite(value)) return "—"
  return String(Math.round(value * 100) / 100)
}

export interface MobileChartBarPoint {
  /** Category position along the horizontal axis. */
  x: number
  /** Bar height for this category. */
  y: number
  /** Series this bar belongs to. Bars that omit it share one series. */
  series?: string
}

export interface MobileChartBarProps {
  /**
   * One entry per bar. Entries whose `x` or `y` is not finite are dropped
   * rather than handed to the scale. When a series repeats an `x`, the values
   * are summed — a category holds one bar per series.
   */
  data: MobileChartBarPoint[]
  /**
   * Chart height in points. The width always fills the parent.
   * @default 220
   */
  height?: number
  /**
   * Series keys in draw order. Derived from `data` when omitted, in first-seen
   * order — so a series keeps its colour when the data is sorted.
   */
  series?: string[]
  /** Display names for the legend and the readout, keyed by series key. */
  seriesLabels?: Record<string, string>
  /** Rendered centred beneath the chart. */
  xLabel?: string
  /** Rendered left-aligned above the chart. */
  yLabel?: string
  /** Formats every number the chart prints. @default two decimal places */
  formatValue?: (value: number) => string
  /**
   * With more than one series, `true` draws the bars side by side and `false`
   * (the default) stacks them into a single column per category. A lone series
   * renders the same either way.
   * @default false
   */
  grouped?: boolean
  /** Optional style override. */
  style?: ViewStyle
  /** Test identifier. */
  testID?: string
}

/**
 * MobileChartBar
 *
 * A column chart rendered through Skia by `victory-native`.
 *
 * It shares the scatter chart's shape and for the same reasons: real scales,
 * UI-thread gestures and stacked geometry are not worth hand-rolling, so the
 * heavy lifting is delegated and the cost stays behind **optional** peer
 * dependencies. Two decisions are worth naming:
 *
 * 1. **Grouped vs. stacked is one switch, not two components.** `grouped` picks
 *    between `BarGroup` (side-by-side) and `StackedBar` (cumulative columns);
 *    a single series just uses `Bar`. The y-domain is computed to match — a
 *    stacked column reaches the *sum* of its parts, so the axis has to know
 *    that or the tallest bar would overflow the frame.
 * 2. **The readout is a fixed panel, not a bubble at the finger,** exactly as in
 *    the scatter chart: the numbers pin to the top-right where the thumb cannot
 *    cover them, and a haptic tick confirms the press.
 */
export function MobileChartBar({
  data,
  height = 220,
  series,
  seriesLabels,
  xLabel,
  yLabel,
  formatValue = defaultFormat,
  grouped = false,
  style,
  testID,
}: MobileChartBarProps) {
  const { colors } = useMobileTheme()
  const [pressed, setPressed] = React.useState<{ x: number; y: number } | null>(
    null
  )

  const points = React.useMemo(
    () => data.filter((p) => Number.isFinite(p.x) && Number.isFinite(p.y)),
    [data]
  )

  const rows: ChartRow[] = React.useMemo(
    () => points.map((p) => ({ x: p.x, y: p.y })),
    [points]
  )

  const seriesKeys = React.useMemo(() => {
    if (series && series.length > 0) return series
    const seen: string[] = []
    for (const point of points) {
      const key = point.series ?? DEFAULT_SERIES
      if (!seen.includes(key)) seen.push(key)
    }
    return seen.length > 0 ? seen : [DEFAULT_SERIES]
  }, [points, series])

  const multipleSeries = seriesKeys.length > 1
  const stacked = multipleSeries && !grouped

  // Pivot the flat points into one x -> summed-y map per series, plus the sorted
  // list of categories. Every series is then rebuilt against the *same* x slots,
  // which is what `BarGroup` and `StackedBar` need to align their columns.
  const pivot = React.useMemo(() => {
    const uniqueX: number[] = []
    const seenX = new Set<number>()
    for (const point of points) {
      if (!seenX.has(point.x)) {
        seenX.add(point.x)
        uniqueX.push(point.x)
      }
    }
    uniqueX.sort((a, b) => a - b)

    const map = new Map<string, Map<number, number>>()
    for (const key of seriesKeys) map.set(key, new Map())
    for (const point of points) {
      const key = point.series ?? DEFAULT_SERIES
      const cell = map.get(key)
      if (!cell) continue
      cell.set(point.x, (cell.get(point.x) ?? 0) + point.y)
    }
    return { uniqueX, map }
  }, [points, seriesKeys])

  // An explicit domain keeps bars inside the frame: the x axis gains half a slot
  // of padding at each edge (so the first and last columns are not bisected),
  // and the y axis reaches the stacked sum when stacking, or the tallest single
  // bar otherwise. Zero is always the baseline.
  const domain = React.useMemo(() => {
    const { uniqueX, map } = pivot
    if (uniqueX.length === 0) return undefined

    const xMin = uniqueX[0] as number
    const xMax = uniqueX[uniqueX.length - 1] as number
    let step = 1
    if (uniqueX.length > 1) {
      let minGap = Infinity
      for (let i = 1; i < uniqueX.length; i++) {
        const gap = (uniqueX[i] as number) - (uniqueX[i - 1] as number)
        if (gap > 0 && gap < minGap) minGap = gap
      }
      if (Number.isFinite(minGap)) step = minGap
    }

    let yLo = 0
    let yHi = 0
    if (stacked) {
      for (const x of uniqueX) {
        let positive = 0
        let negative = 0
        for (const key of seriesKeys) {
          const value = map.get(key)?.get(x) ?? 0
          if (value > 0) positive += value
          else negative += value
        }
        if (positive > yHi) yHi = positive
        if (negative < yLo) yLo = negative
      }
    } else {
      for (const key of seriesKeys) {
        const cell = map.get(key)
        if (!cell) continue
        for (const value of cell.values()) {
          if (value > yHi) yHi = value
          if (value < yLo) yLo = value
        }
      }
    }
    yHi = Math.max(yHi, 0)
    yLo = Math.min(yLo, 0)

    const headroom = (yHi - yLo) * 0.05
    return {
      x: [xMin - step / 2, xMax + step / 2] as [number, number],
      y: [yLo < 0 ? yLo - headroom : yLo, yHi + headroom] as [number, number],
    }
  }, [pivot, seriesKeys, stacked])

  const seriesColors = React.useMemo(
    () => seriesKeys.map((_, index) => chartColor(colors, index)),
    [seriesKeys, colors]
  )

  const labelFor = React.useCallback(
    (key: string) => seriesLabels?.[key] ?? key,
    [seriesLabels]
  )

  const { state, isActive } = useChartPressState({ x: 0, y: { y: 0 } })

  useAnimatedReaction(
    () => ({
      active: state.isActive.value,
      x: state.x.value.value,
      y: state.y.y.value.value,
    }),
    (current, previous) => {
      // Only re-render React when the *matched datum* changes, so a drag across
      // a column does not push a frame-by-frame update through the bridge.
      if (
        previous &&
        previous.active === current.active &&
        previous.x === current.x &&
        previous.y === current.y
      ) {
        return
      }
      runOnJS(setPressed)(current.active ? { x: current.x, y: current.y } : null)
    }
  )

  const pressedPoint = React.useMemo(() => {
    if (!pressed) return null
    return points.find((p) => p.x === pressed.x && p.y === pressed.y) ?? null
  }, [pressed, points])

  const lastReported = React.useRef<MobileChartBarPoint | null>(null)
  React.useEffect(() => {
    if (lastReported.current === pressedPoint) return
    lastReported.current = pressedPoint
    if (pressedPoint) Haptics.selectionAsync().catch(() => {})
  }, [pressedPoint])

  const summary = React.useMemo(() => {
    const count = points.length
    if (count === 0) return "Bar chart with no data"
    const kind = stacked ? "stacked" : grouped ? "grouped" : ""
    const prefix = kind ? `${kind} bar chart` : "Bar chart"
    if (!multipleSeries) return `${prefix} with ${pivot.uniqueX.length} categories`
    return `${prefix} with ${pivot.uniqueX.length} categories across ${seriesKeys.length} series: ${seriesKeys
      .map(labelFor)
      .join(", ")}`
  }, [
    points.length,
    pivot.uniqueX.length,
    stacked,
    grouped,
    multipleSeries,
    seriesKeys,
    labelFor,
  ])

  const empty = rows.length === 0

  return (
    <View testID={testID} style={style}>
      {yLabel ? (
        <MobileText variant="caption" color="muted" numberOfLines={1}>
          {yLabel}
        </MobileText>
      ) : null}

      {multipleSeries ? (
        <View style={styles.legend}>
          {seriesKeys.map((key, index) => (
            <View key={key} style={styles.legendItem}>
              <View
                style={[
                  styles.legendDot,
                  { backgroundColor: chartColor(colors, index) },
                ]}
              />
              <MobileText variant="caption" color="muted" numberOfLines={1}>
                {labelFor(key)}
              </MobileText>
            </View>
          ))}
        </View>
      ) : null}

      <View
        accessibilityRole="image"
        accessibilityLabel={summary}
        accessibilityHint="Press to read a bar's value"
        style={[styles.canvas, { height }]}
      >
        {empty || !domain ? (
          <View style={styles.empty}>
            <MobileText variant="caption" color="muted">
              No data
            </MobileText>
          </View>
        ) : (
          <>
            <CartesianChart
              data={rows}
              xKey="x"
              yKeys={["y"] as const}
              domain={domain}
              chartPressState={state}
              axisOptions={{
                font: null,
                lineColor: colors.border,
                labelColor: colors.muted,
                formatXLabel: (value: number) => formatValue(value),
                formatYLabel: (value: number) => formatValue(value),
              }}
            >
              {({ xScale, yScale, chartBounds }) => {
                const seriesPoints = seriesKeys.map((key) => {
                  const cell = pivot.map.get(key)
                  return pivot.uniqueX.map((x) => {
                    const value = cell?.get(x)
                    return {
                      x: xScale(x),
                      y: value == null ? null : yScale(value),
                      xValue: x,
                      yValue: value ?? null,
                    }
                  })
                })

                if (grouped && multipleSeries) {
                  return (
                    <BarGroup chartBounds={chartBounds}>
                      {seriesPoints.map((column, index) => (
                        <BarGroup.Bar
                          key={seriesKeys[index] ?? String(index)}
                          points={column}
                          color={seriesColors[index]}
                        />
                      ))}
                    </BarGroup>
                  )
                }

                if (stacked) {
                  return (
                    <StackedBar
                      points={seriesPoints}
                      chartBounds={chartBounds}
                      colors={seriesColors}
                    />
                  )
                }

                return (
                  <Bar
                    points={seriesPoints[0] ?? []}
                    chartBounds={chartBounds}
                    color={seriesColors[0]}
                  />
                )
              }}
            </CartesianChart>

            {pressedPoint ? (
              <View
                pointerEvents="none"
                style={[
                  styles.readout,
                  {
                    backgroundColor: colors.card,
                    borderColor: colors.cardBorder,
                  },
                ]}
              >
                <MobileText
                  variant="label"
                  tabular
                  numberOfLines={1}
                  style={{ color: colors.foreground }}
                >
                  {`${formatValue(pressedPoint.x)} · ${formatValue(pressedPoint.y)}`}
                </MobileText>
                {multipleSeries ? (
                  <MobileText variant="label" color="muted" numberOfLines={1}>
                    {labelFor(pressedPoint.series ?? DEFAULT_SERIES)}
                  </MobileText>
                ) : null}
              </View>
            ) : null}
          </>
        )}
      </View>

      {xLabel ? (
        <MobileText
          variant="caption"
          color="muted"
          align="center"
          numberOfLines={1}
          style={styles.xCaption}
        >
          {xLabel}
        </MobileText>
      ) : null}
    </View>
  )
}

const styles = StyleSheet.create({
  canvas: {
    width: "100%",
  },
  legend: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    columnGap: 14,
    rowGap: 6,
    paddingBottom: 10,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: metrics.radius.full,
  },
  readout: {
    position: "absolute",
    top: 0,
    right: 0,
    maxWidth: 160,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: metrics.radius.sm,
    borderWidth: 1,
  },
  empty: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  xCaption: {
    paddingTop: 6,
  },
})
