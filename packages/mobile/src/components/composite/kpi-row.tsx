import * as React from "react"
import { View, StyleSheet, type ViewStyle } from "react-native"
import { MobileText } from "../primitive/text"
import { MobileSurface } from "../primitive/surface"
import { MobileStack } from "../primitive/stack"

export interface MobileKpiRowProps {
  /**
   * Label/value pairs, laid out left to right at equal widths.
   */
  items: { label: string; value: string }[]
  /**
   * Optional style override for the outer container.
   */
  style?: ViewStyle
  /**
   * Test identifier.
   */
  testID?: string
}

/**
 * MobileKpiRow
 *
 * Equal-width label/value pairs sharing one surface — the compact alternative
 * to a row of `MobileStatCard`s when the numbers are glanceable context rather
 * than the point of the screen.
 *
 * Every cell is `flex: 1`, so columns stay equal no matter how wide a value
 * gets; values are tabular so digits align vertically across cells.
 */
export function MobileKpiRow({ items, style, testID }: MobileKpiRowProps) {
  return (
    <View testID={testID} style={style}>
      <MobileSurface variant="surface">
        <View style={styles.body}>
        <MobileStack direction="row" gap={12}>
          {items.map((item, index) => (
            <View key={`${item.label}-${index}`} style={styles.cell}>
              <MobileText
                variant="caption"
                color="muted"
                numberOfLines={1}
                ellipsizeMode="tail"
              >
                {item.label}
              </MobileText>
              <MobileText variant="title" tabular numberOfLines={1}>
                {item.value}
              </MobileText>
            </View>
          ))}
        </MobileStack>
        </View>
      </MobileSurface>
    </View>
  )
}

const styles = StyleSheet.create({
  body: {
    padding: 16,
  },
  cell: {
    flex: 1,
    gap: 2,
  },
})
