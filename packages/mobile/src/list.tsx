import * as React from "react"
import {
  List as ExpoUIList,
  ListItem as ExpoUIListItem,
  Host,
  type ListProps as ExpoUIListProps,
  type ListItemProps as ExpoUIListItemProps,
} from "@expo/ui"
import * as Haptics from "expo-haptics"

export interface MobileListProps extends ExpoUIListProps {}

/**
 * MobileList
 *
 * Native grouped table container from `@expo/ui` (real SwiftUI List on iOS, Compose on Android).
 * Ideal for settings panels, form groups, and fixed navigation rows.
 */
export function MobileList({ children, onRefresh, testID }: MobileListProps) {
  return (
    <Host>
      <ExpoUIList onRefresh={onRefresh} testID={testID}>
        {children}
      </ExpoUIList>
    </Host>
  )
}

export interface MobileListItemProps extends ExpoUIListItemProps {
  /**
   * Optional whether to fire a light haptic tick on press.
   * @default true
   */
  hapticFeedback?: boolean
}

/**
 * MobileListItem
 *
 * Native row inside a `MobileList` with leading/trailing slot support and haptic feedback.
 */
export function MobileListItem({
  children,
  onPress,
  leading,
  trailing,
  supportingText,
  hapticFeedback = true,
  testID,
}: MobileListItemProps) {
  const handlePress = onPress
    ? () => {
        if (hapticFeedback) {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {})
        }
        onPress()
      }
    : undefined

  return (
    <ExpoUIListItem
      onPress={handlePress}
      leading={leading}
      trailing={trailing}
      supportingText={supportingText}
      testID={testID}
    >
      {children}
    </ExpoUIListItem>
  )
}
