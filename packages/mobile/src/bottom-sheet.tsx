import * as React from "react"
import { View, StyleSheet, type ViewStyle } from "react-native"
import {
  BottomSheet as ExpoUIBottomSheet,
  Host,
  type SnapPoint,
} from "@expo/ui"
import * as Haptics from "expo-haptics"
import { useMobileTheme } from "./host"

export interface MobileBottomSheetProps {
  /**
   * Whether the bottom sheet is currently visible.
   */
  isPresented: boolean
  /**
   * Called when the bottom sheet is dismissed by the user.
   */
  onDismiss: () => void
  /**
   * Heights the sheet can rest at ('half' | 'full' | { fraction: number } | { height: number }).
   * @default ['half', 'full']
   */
  snapPoints?: SnapPoint[]
  /**
   * Whether to show a drag indicator pill at the top of the sheet.
   * @default true
   */
  showDragIndicator?: boolean
  /**
   * Children content rendered inside the sheet.
   */
  children?: React.ReactNode
  /**
   * Optional container style override.
   */
  style?: ViewStyle
  /**
   * Test identifier.
   */
  testID?: string
}

/**
 * MobileBottomSheet
 *
 * Native slide-up sheet using `@expo/ui` Universal BottomSheet (SwiftUI / Compose native presentation).
 * Adheres to:
 * - `isPresented` and `onDismiss` state model (expo-ui)
 * - Light haptic feedback on sheet trigger (expo-animation)
 * - Semantic container color matching Celestia theme (better-colors)
 */
export function MobileBottomSheet({
  isPresented,
  onDismiss,
  snapPoints = ["half", "full"],
  showDragIndicator = true,
  children,
  style,
  testID,
}: MobileBottomSheetProps) {
  const { colors } = useMobileTheme()

  React.useEffect(() => {
    if (isPresented) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {})
    }
  }, [isPresented])

  return (
    <Host>
      <ExpoUIBottomSheet
        isPresented={isPresented}
        onDismiss={onDismiss}
        snapPoints={snapPoints}
        showDragIndicator={showDragIndicator}
        containerColor={colors.card}
        testID={testID}
      >
        <View style={[styles.content, { backgroundColor: colors.card }, style]}>
          {children}
        </View>
      </ExpoUIBottomSheet>
    </Host>
  )
}

const styles = StyleSheet.create({
  content: {
    padding: 16,
    flex: 1,
  },
})
