import * as React from "react"
import {
  Pressable,
  ScrollView,
  StyleSheet,
  View,
  type ViewStyle,
} from "react-native"
import { useMobileTheme } from "../../host"
import { MobileText } from "../primitive/text"
import { metrics } from "../../tokens"
import { hapticLight, isTextChildren } from "../../utils"

export type MobileDataColumnAlign = "left" | "right" | "center"

export interface MobileDataColumn {
  /**
   * Cell lookup key into each row record.
   */
  key: string
  /**
   * Header caption.
   */
  label: string
  /**
   * Horizontal alignment of header and cells.
   * @default 'left'
   */
  align?: MobileDataColumnAlign
  /**
   * Column width in points. Fixed rather than fractional — the table lives
   * in a horizontal ScrollView, where percentage widths have nothing to
   * resolve against.
   * @default 120
   */
  width?: number
}

export interface MobileDataTableProps {
  /**
   * Column definitions, rendered left to right.
   */
  columns: MobileDataColumn[]
  /**
   * Row records keyed by column `key`. Values are nodes, so a cell can hold
   * a badge or an amount with its own typography.
   */
  rows: Record<string, React.ReactNode>[]
  /**
   * Called with the row index on press. Omit for a read-only table — rows
   * then render as plain views with no press affordance.
   */
  onRowPress?: (index: number) => void
  /**
   * Optional style override for the scroll container.
   */
  style?: ViewStyle
}

const DEFAULT_COLUMN_WIDTH = 120

const JUSTIFY: Record<MobileDataColumnAlign, ViewStyle["justifyContent"]> = {
  left: "flex-start",
  right: "flex-end",
  center: "center",
}

/**
 * MobileDataTable
 *
 * Horizontally scrollable table: muted label-row header, zebra body rows,
 * hairline separators. Zebra striping is what keeps a wide row readable
 * while it scrolls under the edge of the screen; the hairlines stay
 * hairlines (never 1px) so they don't thicken on high-density displays.
 */
export function MobileDataTable({
  columns,
  rows,
  onRowPress,
  style,
}: MobileDataTableProps) {
  const { colors } = useMobileTheme()

  const cellWidth = (column: MobileDataColumn) =>
    column.width ?? DEFAULT_COLUMN_WIDTH

  return (
    <ScrollView
      horizontal
      style={[
        styles.scroll,
        { borderColor: colors.cardBorder, backgroundColor: colors.card },
        style,
      ]}
    >
      <View>
        {/* Header */}
        <View
          style={[
            styles.row,
            {
              borderBottomWidth: StyleSheet.hairlineWidth,
              borderBottomColor: colors.border,
              backgroundColor: colors.mutedBackground,
            },
          ]}
        >
          {columns.map((column) => (
            <View
              key={column.key}
              style={[styles.cell, { width: cellWidth(column), justifyContent: JUSTIFY[column.align ?? "left"] }]}
            >
              <MobileText
                variant="label"
                color="muted"
                numberOfLines={1}
                style={{ textAlign: column.align ?? "left" }}
              >
                {column.label.toUpperCase()}
              </MobileText>
            </View>
          ))}
        </View>

        {/* Body */}
        {rows.map((row, index) => {
          const zebra =
            index % 2 === 1 ? colors.mutedBackground : "transparent"
          const rowStyle: ViewStyle = {
            borderBottomWidth: StyleSheet.hairlineWidth,
            borderBottomColor: colors.border,
            backgroundColor: zebra,
          }
          const cells = columns.map((column) => {
            const cell = row[column.key] ?? null
            return (
              <View
                key={column.key}
                style={[
                  styles.cell,
                  { width: cellWidth(column), justifyContent: JUSTIFY[column.align ?? "left"] },
                ]}
              >
                {isTextChildren(cell) ? (
                  <MobileText variant="callout" numberOfLines={1}>
                    {cell}
                  </MobileText>
                ) : (
                  cell
                )}
              </View>
            )
          })

          return onRowPress ? (
            <Pressable
              key={index}
              onPress={() => {
                hapticLight()
                onRowPress(index)
              }}
              accessibilityRole="button"
              accessibilityLabel={`Row ${index + 1}`}
              style={[styles.row, rowStyle]}
            >
              {cells}
            </Pressable>
          ) : (
            <View key={index} style={[styles.row, rowStyle]}>
              {cells}
            </View>
          )
        })}
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  scroll: {
    borderRadius: metrics.radius.lg,
    borderWidth: 1,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    minHeight: metrics.minTouchTarget,
  },
  cell: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    alignItems: "stretch",
  },
})
