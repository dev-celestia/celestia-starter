import * as React from "react"
import { View, type ViewStyle } from "react-native"

export interface MobileAspectRatioProps {
  /**
   * Width-to-height ratio (e.g. `16 / 9`). The box fills its parent's width
   * and derives its height from this.
   */
  ratio: number
  children: React.ReactNode
  style?: ViewStyle
}

/**
 * MobileAspectRatio
 *
 * Width-driven aspect box — the media-tile and chart-frame primitive. Keeping
 * the ratio in one place stops thumbnails of the same feed from drifting a
 * pixel apart when their sources differ.
 */
export function MobileAspectRatio({
  ratio,
  children,
  style,
}: MobileAspectRatioProps) {
  return <View style={[{ width: "100%", aspectRatio: ratio }, style]}>{children}</View>
}
