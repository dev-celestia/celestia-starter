import * as React from "react"
import { StyleSheet, View, type ViewStyle } from "react-native"
import { Circle, type SkFont } from "@shopify/react-native-skia"
import { CartesianChart, Scatter, useChartPressState } from "victory-native"
import {
  runOnJS,
  useAnimatedReaction,
} from "react-native-reanimated"
import * as Haptics from "expo-haptics"
import { useMobileTheme } from "../../host"
import { MobileText } from "../primitive/text"
import { chartColor, metrics } from "../../tokens"

const DEFAULT_SERIES = "Series 1"

/**
 * The row shape `CartesianChart` needs. It takes one flat table and derives the
 * domain from it, so every series is flattened into the same two columns — the
 * per-series split happens later, on the way out, not on the way in.
 */
interface ChartRow {
  x: number
  y: number
}

function defaultFormat(value: number): string {
  if (!Number.isFinite(value)) return "—"
  return String(Math.round(value * 100) / 100)
}

export interface MobileChartScatterPoint {
  /** Horizontal value. */
  x: number
  /** Vertical value. */
  y: number
  /** Series this point belongs to. Points that omit it share one series. */
  series?: string
}

export interface MobileChartScatterProps {
  /**
   * One entry per dot. Entries whose `x` or `y` is not finite are dropped
   * rather than handed to the scale.
   */
  data: MobileChartScatterPoint[]
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
  /**
   * The Skia font used for axis tick labels.
   *
   * **Required for any axis text to appear.** victory-native draws tick labels
   * through Skia rather than React Native, and renders none when this is null —
   * so a chart with no font still plots its dots, just unlabelled. Get one from
   * `useFont(require("./assets/Inter-Medium.ttf"), 11)`.
   *
   * It is a prop rather than a bundled asset on purpose: a design system that
   * ships its own `.ttf` forces every consumer to carry a font file it may not
   * want, and stops the chart from matching the app's own typeface.
   *
   * @default null
   */
  font?: SkFont | null
  /**
   * Target tick count per axis. victory-native treats this as an
   * approximation — the scale may return more or fewer.
   * @default 5
   */
  tickCount?: number
  /**
   * Grid lines behind the dots. The axis frame stays either way.
   * @default true
   */
  showGrid?: boolean
  /**
   * Only draws when there is more than one series — a legend for a single
   * series restates the axis.
   * @default true
   */
  showLegend?: boolean
  /**
   * Pressing the chart marks the nearest point and reads its coordinates out.
   * @default true
   */
  showTooltip?: boolean
  /**
   * Dot diameter in points.
   * @default 9
   */
  dotSize?: number
  /** Formats every number the chart prints. @default two decimal places */
  formatValue?: (value: number) => string
  /**
   * Fires when the inspected point changes, with `null` when the press ends.
   */
  onPointPress?: (point: MobileChartScatterPoint | null) => void
  /** Optional style override. */
  style?: ViewStyle
  /** Test identifier. */
  testID?: string
}

/**
 * MobileChartScatter
 *
 * A scatter plot rendered through Skia by `victory-native`.
 *
 * This is the one module in the package that is not dependency-free, and that
 * is a deliberate trade: real curve interpolation, UI-thread gestures and
 * pan/zoom are things a hand-rolled view tree cannot do well. The cost is
 * declared as **optional** peer dependencies in `package.json`, so an app that
 * never draws a chart installs none of them.
 *
 * Two things are worth knowing about the shape of this wrapper:
 *
 * 1. **One `Scatter` per series, not one wide table.** `CartesianChart` takes a
 *    single flat `data` array and derives the axis domain from it, which is what
 *    you want — every series must fit the same axes. But it also wants `yKeys`
 *    to be a column per series, and a scatter's series rarely share x values.
 *    So the data goes *in* flat (correct domain) and is split *out* here, by
 *    rebuilding a `PointsArray` per series from the scales the render function
 *    hands back.
 * 2. **The readout is a fixed panel, not a bubble at the finger.** A callout
 *    that follows the touch sits under the thumb on a phone. The selection ring
 *    marks the point on the canvas; the numbers appear in a panel pinned to the
 *    top-right, where the finger cannot cover them.
 */
export function MobileChartScatter({
  data,
  height = 220,
  series,
  seriesLabels,
  xLabel,
  yLabel,
  font = null,
  tickCount = 5,
  showGrid = true,
  showLegend = true,
  showTooltip = true,
  dotSize = 9,
  formatValue = defaultFormat,
  onPointPress,
  style,
  testID,
}: MobileChartScatterProps) {
  const { colors } = useMobileTheme()
  const [pressed, setPressed] = React.useState<{ x: number; y: number } | null>(
    null
  )
  const reported = React.useRef<MobileChartScatterPoint | null>(null)

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

  const groups = React.useMemo(
    () =>
      seriesKeys.map((key) =>
        points.filter((point) => (point.series ?? DEFAULT_SERIES) === key)
      ),
    [points, seriesKeys]
  )

  const labelFor = React.useCallback(
    (key: string) => seriesLabels?.[key] ?? key,
    [seriesLabels]
  )

  // `yKeys` is fixed to the single synthetic `y` column, so the press state
  // tracks that column. The per-series identity is resolved afterwards, from
  // the value pair.
  const { state, isActive } = useChartPressState({ x: 0, y: { y: 0 } })

  useAnimatedReaction(
    () => ({
      active: isActive.value,
      x: state.x.value.value,
      y: state.y.y.value.value,
    }),
    (current, previous) => {
      // The press state snaps to the nearest datum, so this only changes when
      // the *matched point* changes — which keeps a drag from pushing a React
      // re-render every frame.
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
    return (
      points.find((p) => p.x === pressed.x && p.y === pressed.y) ?? null
    )
  }, [pressed, points])

  React.useEffect(() => {
    if (reported.current === pressedPoint) return
    reported.current = pressedPoint
    if (pressedPoint) Haptics.selectionAsync().catch(() => {})
    onPointPress?.(pressedPoint)
  }, [pressedPoint, onPointPress])

  const summary = React.useMemo(() => {
    const count = points.length
    if (count === 0) return "Scatter chart with no data"
    if (!multipleSeries) return `Scatter chart with ${count} points`
    return `Scatter chart with ${count} points across ${seriesKeys.length} series: ${seriesKeys
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

      {showLegend && multipleSeries ? (
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
        accessibilityHint={
          showTooltip ? "Press to read the nearest point" : undefined
        }
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
              yKeys={["y"]}
              // Victory-native wants a little room so the extreme dots are not
              // bisected by the axis frame.
              domainPadding={{ top: dotSize, bottom: dotSize }}
              chartPressState={showTooltip ? state : undefined}
              axisOptions={{
                font,
                tickCount,
                lineColor: showGrid
                  ? colors.border
                  : { grid: "transparent", frame: colors.border },
                labelColor: colors.muted,
                formatXLabel: (value: number) => formatValue(value),
                formatYLabel: (value: number) => formatValue(value),
              }}
            >
              {({ xScale, yScale }) => (
                <>
                  {groups.map((group, index) => (
                    <Scatter
                      key={seriesKeys[index] ?? String(index)}
                      points={group.map((point) => ({
                        x: xScale(point.x),
                        y: yScale(point.y),
                        xValue: point.x,
                        yValue: point.y,
                      }))}
                      radius={dotSize / 2}
                      shape="circle"
                      color={chartColor(colors, index)}
                    />
                  ))}

                  {showTooltip && isActive ? (
                    <Circle
                      cx={state.x.position}
                      cy={state.y.y.position}
                      r={dotSize}
                      style="stroke"
                      strokeWidth={2}
                      color={colors.foreground}
                    />
                  ) : null}
                </>
              )}
            </CartesianChart>

            {showTooltip && pressedPoint ? (
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
