import * as React from "react"
import { View, type ViewStyle } from "react-native"
import { chunk } from "../../utils"

export interface MobileGridProps {
  /** Number of cells per row. Values below 1 are treated as 1. */
  columns: number
  /**
   * Gap between cells, in points. Implemented as `gap / 2` padding on every
   * cell, cancelled at the grid's outer edge by a matching negative margin, so
   * cells line up flush with surrounding content.
   * @default 0
   */
  gap?: number
  children: React.ReactNode
  style?: ViewStyle
}

/**
 * MobileGrid
 *
 * Row-wrap grid: children are chunked into rows of `columns` and each cell
 * takes an equal percentage slice. Chunking (rather than `flexWrap`) keeps
 * every row on the same baseline even when the last row is short.
 */
export function MobileGrid({
  columns,
  gap = 0,
  children,
  style,
}: MobileGridProps) {
  const cols = Math.max(1, Math.floor(columns))
  const items = React.Children.toArray(children)
  const rows = React.useMemo(() => chunk(items, cols), [items, cols])
  const cellWidth = `${100 / cols}%` as const

  return (
    <View style={[{ margin: -gap / 2 }, style]}>
      {rows.map((row, rowIndex) => (
        <View key={rowIndex} style={styles.row}>
          {row.map((child, cellIndex) => (
            <View
              key={cellIndex}
              style={{ width: cellWidth, padding: gap / 2 }}
            >
              {child}
            </View>
          ))}
        </View>
      ))}
    </View>
  )
}

const styles = {
  row: {
    flexDirection: "row",
  },
} as const
