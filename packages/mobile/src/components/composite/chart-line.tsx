import * as React from "react"
import { StyleSheet, View, type ViewStyle } from "react-native"
import { Circle } from "@shopify/react-native-skia"
import {
  Area,
  CartesianChart,
  Line,
  useChartPressState,
  type CurveType,
} from "victory-native"
import { runOnJS, useAnimatedReaction } from "react-native-reanimated"
import * as Haptics from "expo-haptics"
import { useMobileTheme } from "../../host"
import { MobileText } from "../primitive/text"
import { chartColor, metrics } from "../../tokens"

const DEFAULT_SERIES = "Series 1"

/**
 * The flat row `CartesianChart` consumes. Every series is collapsed into one
 * `y` column so the domain spans the whole table; the per-series split happens
 * inside the render prop, on the way out.
 */
type ChartRow = {
  x: number
  y: number
  [key: string]: unknown
}

/** The subset of victory-native curves this wrapper exposes. */
export type MobileChartLineCurve = "linear" | "natural" | "monotoneX"

const CURVE_MAP: Record<MobileChartLineCurve, CurveType> = {
  linear: "linear",
  natural: "natural",
  monotoneX: "monotoneX",
}

function defaultFormat(value: number): string {
  if (!Number.isFinite(value)) return "—"
  return String(Math.round(value * 100) / 100)
}

export interface MobileChartLinePoint {
  /** Horizontal value. */
  x: number
  /** Vertical value. */
  y: number
  /** Series this point belongs to. Points that omit it share one series. */
  series?: string
}

export interface MobileChartLineProps {
  /**
   * One entry per vertex. Entries whose `x` or `y` is not finite are dropped
   * rather than handed to the scale. Each series is sorted by `x` before it is
   * drawn, so the line reads left-to-right however the data arrives.
   */
  data: MobileChartLinePoint[]
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
   * Fills the region between each line and the axis floor at low opacity. With
   * several series the fills overlap, so it reads best on one or two.
   * @default false
   */
  showArea?: boolean
  /**
   * Interpolation between vertices. `linear` connects with straight segments;
   * `natural` and `monotoneX` smooth the path, the latter without overshooting
   * the data (no invented peaks).
   * @default "linear"
   */
  curve?: MobileChartLineCurve
  /** Optional style override. */
  style?: ViewStyle
  /** Test identifier. */
  testID?: string
}

/**
 * MobileChartLine
 *
 * A line chart rendered through Skia by `victory-native`.
 *
 * It is the scatter chart's sibling: same optional peer dependencies, same
 * flat-in / split-out data pipeline, same fixed top-right readout with a haptic
 * tick. The differences are the mark and the interaction target.
 *
 * - **One `Line` per series,** rebuilt from the scales the render prop hands
 *   back so every series shares one axis domain. Vertices are sorted by `x`
 *   within a series — a line is order-sensitive in a way a cloud of dots is not.
 * - **`showArea` adds an `Area` under each line,** filled to the plot floor at
 *   low opacity. It is a fill, not a gradient, so it stays legible when two
 *   series cross.
 * - **The pressed vertex is marked on the canvas** with a dot, and its
 *   coordinates appear in the panel — the finger covers neither.
 */
export function MobileChartLine({
  data,
  height = 220,
  series,
  seriesLabels,
  xLabel,
  yLabel,
  formatValue = defaultFormat,
  showArea = false,
  curve = "linear",
  style,
  testID,
}: MobileChartLineProps) {
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

  // Each series drawn in x order; a line connects its points in sequence.
  const groups = React.useMemo(
    () =>
      seriesKeys.map((key) =>
        points
          .filter((point) => (point.series ?? DEFAULT_SERIES) === key)
          .slice()
          .sort((a, b) => a.x - b.x)
      ),
    [points, seriesKeys]
  )

  const labelFor = React.useCallback(
    (key: string) => seriesLabels?.[key] ?? key,
    [seriesLabels]
  )

  const curveType = CURVE_MAP[curve]

  const { state, isActive } = useChartPressState({ x: 0, y: { y: 0 } })

  useAnimatedReaction(
    () => ({
      active: state.isActive.value,
      x: state.x.value.value,
      y: state.y.y.value.value,
    }),
    (current, previous) => {
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

  const lastReported = React.useRef<MobileChartLinePoint | null>(null)
  React.useEffect(() => {
    if (lastReported.current === pressedPoint) return
    lastReported.current = pressedPoint
    if (pressedPoint) Haptics.selectionAsync().catch(() => {})
  }, [pressedPoint])

  const summary = React.useMemo(() => {
    const count = points.length
    if (count === 0) return "Line chart with no data"
    if (!multipleSeries) return `Line chart with ${count} points`
    return `Line chart with ${count} points across ${seriesKeys.length} series: ${seriesKeys
      .map(labelFor)
      .join(", ")}`
  }, [points.length, multipleSeries, seriesKeys, labelFor])

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
        accessibilityHint="Press to read the nearest point"
        style={[styles.canvas, { height }]}
      >
        {empty ? (
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
              chartPressState={state}
              axisOptions={{
                font: null,
                lineColor: colors.border,
                labelColor: colors.muted,
                formatXLabel: (value: number) => formatValue(value),
                formatYLabel: (value: number) => formatValue(value),
              }}
            >
              {({ xScale, yScale, chartBounds }) => (
                <>
                  {groups.map((group, index) => {
                    const color = chartColor(colors, index)
                    const linePoints = group.map((point) => ({
                      x: xScale(point.x),
                      y: yScale(point.y),
                      xValue: point.x,
                      yValue: point.y,
                    }))
                    return (
                      <React.Fragment key={seriesKeys[index] ?? String(index)}>
                        {showArea ? (
                          <Area
                            points={linePoints}
                            y0={chartBounds.bottom}
                            curveType={curveType}
                            color={color}
                            opacity={0.18}
                          />
                        ) : null}
                        <Line
                          points={linePoints}
                          curveType={curveType}
                          color={color}
                          strokeWidth={2}
                        />
                      </React.Fragment>
                    )
                  })}

                  {isActive ? (
                    <Circle
                      cx={state.x.position}
                      cy={state.y.y.position}
                      r={4}
                      color={colors.foreground}
                    />
                  ) : null}
                </>
              )}
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
