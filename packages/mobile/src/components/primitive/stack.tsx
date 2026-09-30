import * as React from "react"
import { View, type ViewStyle } from "react-native"

export type MobileStackDirection = "row" | "column"
export type MobileStackAlign = "start" | "center" | "end" | "stretch"
export type MobileStackJustify =
  | "start"
  | "center"
  | "end"
  | "between"
  | "around"

const ALIGN_MAP: Record<MobileStackAlign, ViewStyle["alignItems"]> = {
  start: "flex-start",
  center: "center",
  end: "flex-end",
  stretch: "stretch",
}

const JUSTIFY_MAP: Record<MobileStackJustify, ViewStyle["justifyContent"]> = {
  start: "flex-start",
  center: "center",
  end: "flex-end",
  between: "space-between",
  around: "space-around",
}

export interface MobileStackProps {
  /**
   * Main axis.
   * @default 'column'
   */
  direction?: MobileStackDirection
  /** Gap between children, in points. */
  gap?: number
  /** Cross-axis alignment, mapped to `alignItems`. */
  align?: MobileStackAlign
  /** Main-axis distribution, mapped to `justifyContent`. */
  justify?: MobileStackJustify
  children: React.ReactNode
  style?: ViewStyle
}

/**
 * MobileStack
 *
 * One-dimensional layout primitive with a short vocabulary: `align` and
 * `justify` take the friendly names and map them onto the flexbox values, so
 * call sites never spell `flex-start` by hand.
 */
export function MobileStack({
  direction = "column",
  gap,
  align,
  justify,
  children,
  style,
}: MobileStackProps) {
  return (
    <View
      style={[
        {
          flexDirection: direction,
          gap,
          alignItems: align ? ALIGN_MAP[align] : undefined,
          justifyContent: justify ? JUSTIFY_MAP[justify] : undefined,
        },
        style,
      ]}
    >
      {children}
    </View>
  )
}

export interface MobileZStackProps {
  /**
   * The first child lays out normally and sizes the container; later children
   * are free to absolutely position themselves over it.
   */
  children: React.ReactNode
  style?: ViewStyle
}

/**
 * MobileZStack
 *
 * Stacking container: `position: "relative"` so non-first children can layer
 * over the base child with absolute positioning.
 */
export function MobileZStack({ children, style }: MobileZStackProps) {
  return <View style={[styles.zstack, style]}>{children}</View>
}

const styles = {
  zstack: {
    position: "relative",
  },
} as const
