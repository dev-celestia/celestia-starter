import * as React from "react"
import { StyleSheet, View, type ViewStyle } from "react-native"
import { MobileSkeleton } from "../primitive/skeleton"
import { metrics } from "../../tokens"

export interface MobileSkeletonListProps {
  /**
   * Number of rows to draw.
   * @default 5
   */
  rows?: number
  /**
   * Prepends a circular avatar placeholder to each row — for contact- or
   * feed-style lists where a leading thumbnail is expected.
   * @default false
   */
  avatar?: boolean
  /** Optional style override. */
  style?: ViewStyle
  /** Test identifier. */
  testID?: string
}

/**
 * MobileSkeletonList
 *
 * A vertical stack of loading rows, each an optional avatar circle beside a
 * two-line text block. It composes the primitive `MobileSkeleton` and inherits
 * its decision to stay hidden from assistive technology — a screen reader
 * should hear the surrounding screen's loading state, not a pile of empty boxes
 * — so the assembly is marked `accessible={false}` and its descendants hidden.
 */
export function MobileSkeletonList({
  rows = 5,
  avatar = false,
  style,
  testID,
}: MobileSkeletonListProps) {
  const count = Math.max(0, Math.floor(rows))

  return (
    <View
      testID={testID}
      accessible={false}
      importantForAccessibility="no-hide-descendants"
      style={[style, styles.list]}
    >
      {Array.from({ length: count }, (_, index) => (
        <View key={index} style={styles.row}>
          {avatar ? (
            <MobileSkeleton
              width={40}
              height={40}
              radius={metrics.radius.full}
            />
          ) : null}
          <View style={styles.text}>
            <MobileSkeleton width="90%" height={12} />
            <MobileSkeleton width="60%" height={12} />
          </View>
        </View>
      ))}
    </View>
  )
}

const styles = StyleSheet.create({
  list: {
    gap: 16,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  text: {
    flex: 1,
    gap: 6,
  },
})
