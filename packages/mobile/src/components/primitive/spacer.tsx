import * as React from "react"
import { View, type ViewStyle } from "react-native"

export interface MobileSpacerProps {
  /**
   * Fixed gap in points along the parent's main axis (`flexBasis`, so the same
   * spacer works in rows and columns). When omitted, the spacer becomes a
   * `flex: 1` filler instead.
   */
  size?: number
  /**
   * Flex weight of the filler. Only used when `size` is omitted.
   * @default 1
   */
  flex?: number
  style?: ViewStyle
}

/**
 * MobileSpacer
 *
 * Layout gap: either a fixed-size spacer or a spring-y `flex: 1` filler that
 * pushes siblings apart. Filler is the default because that is the case a bare
 * `<MobileSpacer />` almost always means.
 */
export function MobileSpacer({ size, flex = 1, style }: MobileSpacerProps) {
  const computed: ViewStyle =
    size != null ? { flexGrow: 0, flexShrink: 0, flexBasis: size } : { flex }
  return <View style={[computed, style]} />
}
