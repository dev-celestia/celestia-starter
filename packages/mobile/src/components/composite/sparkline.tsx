import * as React from "react"
import { StyleSheet, View, type ViewStyle } from "react-native"
import {
  Canvas,
  Circle,
  Path,
  Skia,
  type SkPath,
} from "@shopify/react-native-skia"
import { useMobileTheme } from "../../host"

export interface MobileSparklineProps {
  /**
   * Values plotted left to right in array order. Non-finite entries are
   * dropped. The line is normalised to the set's own min/max, so a sparkline
   * shows *shape*, not scale — there are no axes and no shared baseline across
   * instances.
   */
  data: number[]
  /**
   * Height in points. The width always fills the parent.
   * @default 40
   */
  height?: number
  /**
   * Stroke colour.
   * @default colors.primary
   */
  color?: string
  /**
   * Stroke width in points. The path is inset by this much so the stroke is not
   * clipped at the edges.
   * @default 2
   */
  strokeWidth?: number
  /**
   * Draws a filled dot on the final value — a quick "where are we now" marker.
   * @default false
   */
  showEndPoint?: boolean
  /** Optional style override. */
  style?: ViewStyle
  /** Test identifier. */
  testID?: string
}

interface Geometry {
  path: SkPath
  end: { x: number; y: number } | null
}

/**
 * MobileSparkline
 *
 * The smallest chart in the set: a single Skia polyline, no axes, no labels, no
 * gesture layer. It is meant to sit inside a row or a stat tile and answer "which
 * way is this trending" at a glance, which is why it normalises to its own
 * min/max rather than a shared domain — two sparklines side by side compare
 * *shape*, and flat data (all-equal values) collapses to a midline instead of
 * dividing by zero.
 *
 * The width is measured with `onLayout` because the path is built in pixels; the
 * canvas stays unmounted until the parent reports a real width.
 */
export function MobileSparkline({
  data,
  height = 40,
  color,
  strokeWidth = 2,
  showEndPoint = false,
  style,
  testID,
}: MobileSparklineProps) {
  const { colors } = useMobileTheme()
  const [width, setWidth] = React.useState(0)
  const stroke = color ?? colors.primary

  const values = React.useMemo(
    () => data.filter((value) => Number.isFinite(value)),
    [data]
  )

  const geometry = React.useMemo<Geometry | null>(() => {
    if (width <= 0 || height <= 0 || values.length === 0) return null

    const pad = strokeWidth
    const innerWidth = Math.max(0, width - pad * 2)
    const innerHeight = Math.max(0, height - pad * 2)
    const count = values.length
    const min = Math.min(...values)
    const max = Math.max(...values)
    // A flat series has no range to normalise against — pin it to the midline.
    const flat = max === min

    const xAt = (index: number) =>
      count === 1 ? pad + innerWidth / 2 : pad + (index / (count - 1)) * innerWidth
    const yAt = (value: number) =>
      flat
        ? pad + innerHeight / 2
        : pad + (1 - (value - min) / (max - min)) * innerHeight

    const builder = Skia.PathBuilder.Make()
    values.forEach((value, index) => {
      const x = xAt(index)
      const y = yAt(value)
      if (index === 0) builder.moveTo(x, y)
      else builder.lineTo(x, y)
    })

    return {
      path: builder.detach(),
      end:
        count > 0
          ? { x: xAt(count - 1), y: yAt(values[count - 1] as number) }
          : null,
    }
  }, [values, width, height, strokeWidth])

  const summary = React.useMemo(() => {
    if (values.length === 0) return "Sparkline with no data"
    const min = Math.min(...values)
    const max = Math.max(...values)
    return `Sparkline of ${values.length} values, ranging ${min} to ${max}`
  }, [values])

  return (
    <View
      testID={testID}
      accessibilityRole="image"
      accessibilityLabel={summary}
      onLayout={(event) => setWidth(event.nativeEvent.layout.width)}
      style={[style, styles.container, { height }]}
    >
      {geometry && width > 0 ? (
        <Canvas style={{ width, height }}>
          <Path
            path={geometry.path}
            style="stroke"
            color={stroke}
            strokeWidth={strokeWidth}
            strokeCap="round"
            strokeJoin="round"
          />
          {showEndPoint && geometry.end ? (
            <Circle
              cx={geometry.end.x}
              cy={geometry.end.y}
              r={Math.max(strokeWidth, 3)}
              color={stroke}
            />
          ) : null}
        </Canvas>
      ) : null}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
  },
})
