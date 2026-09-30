import * as React from "react"
import { StyleSheet, View, type ViewStyle } from "react-native"
import { Canvas, Path, Skia, type SkPath } from "@shopify/react-native-skia"
import { useMobileTheme } from "../../host"
import { MobileText } from "../primitive/text"
import { chartColor, metrics } from "../../tokens"

/** Slices start at 12 o'clock and sweep clockwise, in degrees. */
const START_ANGLE = -90

function defaultFormat(value: number): string {
  if (!Number.isFinite(value)) return "—"
  return String(Math.round(value * 100) / 100)
}

export interface MobileChartPieSlice {
  /** Legend text for this slice. */
  label: string
  /** Slice magnitude. Non-finite and negative values are dropped. */
  value: number
}

export interface MobileChartPieProps {
  /**
   * One entry per slice. Entries whose `value` is not finite or is negative are
   * dropped rather than distorting the angles; the percentages are computed
   * over what remains.
   */
  data: MobileChartPieSlice[]
  /**
   * Diameter of the pie's drawing area in points. The width always fills the
   * parent, and the circle is inscribed in the smaller of the two.
   * @default 220
   */
  height?: number
  /**
   * Punches out the centre to render a ring instead of a full pie.
   * @default false
   */
  donut?: boolean
  /** Formats the value shown beside each legend row. @default two decimal places */
  formatValue?: (value: number) => string
  /** Optional style override. */
  style?: ViewStyle
  /** Test identifier. */
  testID?: string
}

interface ResolvedSlice {
  key: string
  path: SkPath
  color: string
  label: string
  value: number
  percent: number
}

/**
 * MobileChartPie
 *
 * A pie (or donut) drawn directly with Skia.
 *
 * Unlike the cartesian charts this one is hand-built, and deliberately so:
 * victory-native's polar support on React Native is the shakiest corner of the
 * library, while Skia — already the house vector tool for every other chart —
 * draws an annular sector from two arcs with no fuss. The maths is the whole
 * component: each slice's sweep is its share of the total, and the path is a
 * wedge (pie) or a ring segment (donut) traced from those angles.
 *
 * It is **static by design.** A pie with a dozen thin slices does not benefit
 * from per-slice hit targets on a thumb, and the legend below already lists
 * every label, value and percentage, so nothing is hidden behind a tap. Slices
 * are read, not pressed.
 */
export function MobileChartPie({
  data,
  height = 220,
  donut = false,
  formatValue = defaultFormat,
  style,
  testID,
}: MobileChartPieProps) {
  const { colors } = useMobileTheme()
  const [width, setWidth] = React.useState(0)

  const slices = React.useMemo(
    () => data.filter((s) => Number.isFinite(s.value) && s.value >= 0),
    [data]
  )

  const total = React.useMemo(
    () => slices.reduce((sum, slice) => sum + slice.value, 0),
    [slices]
  )

  const resolved = React.useMemo<ResolvedSlice[]>(() => {
    if (width <= 0 || height <= 0 || total <= 0) return []

    const cx = width / 2
    const cy = height / 2
    const radius = Math.max(0, Math.min(width, height) / 2 - 2)
    const innerRadius = donut ? radius * 0.6 : 0

    const outer = {
      x: cx - radius,
      y: cy - radius,
      width: radius * 2,
      height: radius * 2,
    }
    const inner = {
      x: cx - innerRadius,
      y: cy - innerRadius,
      width: innerRadius * 2,
      height: innerRadius * 2,
    }

    let angle = START_ANGLE
    return slices.map((slice, index) => {
      const sweep = (slice.value / total) * 360
      const start = angle
      angle += sweep

      const builder = Skia.PathBuilder.Make()
      if (donut) {
        // Outer arc forward, then the inner arc back, then close: a ring segment.
        builder.arcToOval(outer, start, sweep, true)
        builder.arcToOval(inner, start + sweep, -sweep, false)
        builder.close()
      } else {
        // Centre, out to the arc, sweep, and back to the centre: a wedge.
        builder.moveTo(cx, cy)
        builder.arcToOval(outer, start, sweep, false)
        builder.close()
      }

      return {
        key: `${slice.label}-${index}`,
        path: builder.detach(),
        color: chartColor(colors, index),
        label: slice.label,
        value: slice.value,
        percent: (slice.value / total) * 100,
      }
    })
  }, [slices, total, width, height, donut, colors])

  const summary = React.useMemo(() => {
    if (resolved.length === 0) return "Pie chart with no data"
    return `${donut ? "Donut" : "Pie"} chart with ${resolved.length} slices: ${resolved
      .map((slice) => `${slice.label} ${Math.round(slice.percent)} percent`)
      .join(", ")}`
  }, [resolved, donut])

  const empty = slices.length === 0 || total <= 0

  return (
    <View testID={testID} style={style}>
      <View
        accessibilityRole="image"
        accessibilityLabel={summary}
        onLayout={(event) => setWidth(event.nativeEvent.layout.width)}
        style={[styles.canvas, { height }]}
      >
        {empty || width <= 0 ? (
          empty ? (
            <View style={styles.empty}>
              <MobileText variant="caption" color="muted">
                No data
              </MobileText>
            </View>
          ) : null
        ) : (
          <Canvas style={{ width, height }}>
            {resolved.map((slice) => (
              <Path key={slice.key} path={slice.path} color={slice.color} />
            ))}
          </Canvas>
        )}
      </View>

      {resolved.length > 0 ? (
        <View style={styles.legend}>
          {resolved.map((slice) => (
            <View key={slice.key} style={styles.legendRow}>
              <View
                style={[styles.legendDot, { backgroundColor: slice.color }]}
              />
              <MobileText
                variant="caption"
                color="muted"
                numberOfLines={1}
                style={styles.legendLabel}
              >
                {slice.label}
              </MobileText>
              <MobileText
                variant="caption"
                tabular
                numberOfLines={1}
                style={styles.legendValue}
              >
                {formatValue(slice.value)}
              </MobileText>
              <MobileText
                variant="caption"
                tabular
                numberOfLines={1}
                style={styles.legendPercent}
              >
                {`${Math.round(slice.percent)}%`}
              </MobileText>
            </View>
          ))}
        </View>
      ) : null}
    </View>
  )
}

const styles = StyleSheet.create({
  canvas: {
    width: "100%",
  },
  empty: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  legend: {
    paddingTop: 12,
    rowGap: 6,
  },
  legendRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: metrics.radius.full,
  },
  legendLabel: {
    flex: 1,
  },
  legendValue: {
    minWidth: 48,
    textAlign: "right",
  },
  legendPercent: {
    minWidth: 40,
    textAlign: "right",
  },
})
