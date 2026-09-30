import * as React from "react"
import {
  Animated,
  Pressable,
  View,
  StyleSheet,
  type ViewStyle,
} from "react-native"
import * as Haptics from "expo-haptics"
import { useMobileTheme } from "../../host"
import { pressInTiming, springTo } from "../../motion"
import { MobileBottomSheet } from "../primitive/bottom-sheet"
import { MobileText } from "../primitive/text"
import { metrics } from "../../tokens"

export interface MobileActionSheetAction {
  /**
   * Stable identity for the action.
   */
  key: string
  /**
   * Action caption.
   */
  label: string
  /**
   * Called after the sheet has dismissed.
   */
  onPress?: () => void
  /**
   * Renders the action in the destructive colour.
   * @default false
   */
  destructive?: boolean
  /**
   * @default false
   */
  disabled?: boolean
}

export interface MobileActionSheetProps {
  /**
   * Whether the sheet is visible.
   */
  isPresented: boolean
  /**
   * Called when the sheet is dismissed, by gesture or by an action.
   */
  onDismiss: () => void
  /**
   * Optional heading.
   */
  title?: string
  /**
   * Optional explanatory line beneath the title.
   */
  message?: string
  /**
   * Actions, rendered top to bottom.
   */
  actions: MobileActionSheetAction[]
  /**
   * Cancel affordance caption.
   * @default 'Cancel'
   */
  cancelLabel?: string
  /**
   * Optional style override for the sheet body.
   */
  style?: ViewStyle
  /**
   * Test identifier.
   */
  testID?: string
}

/**
 * A sheet row with a press highlight: opacity dips on press-in and springs
 * back on release. The sheet's own slide-up/down and backdrop belong to the
 * native SwiftUI/Compose presentation (MobileBottomSheet), so this is the one
 * piece of motion the JS layer owns.
 */
function HighlightRow({
  children,
  onPressIn,
  onPressOut,
  ...pressableProps
}: Omit<React.ComponentProps<typeof Pressable>, "children"> & {
  children?: React.ReactNode
}) {
  const highlight = React.useRef(new Animated.Value(1)).current
  return (
    <Pressable
      {...pressableProps}
      onPressIn={(event) => {
        if (!pressableProps.disabled) {
          pressInTiming(highlight, 0.55).start()
        }
        onPressIn?.(event)
      }}
      onPressOut={(event) => {
        if (!pressableProps.disabled) {
          springTo(highlight, 1).start()
        }
        onPressOut?.(event)
      }}
    >
      <Animated.View style={[styles.rowInner, { opacity: highlight }]}>
        {children}
      </Animated.View>
    </Pressable>
  )
}

/**
 * MobileActionSheet
 *
 * List of choices in a native sheet, with a cancel affordance pinned last.
 *
 * Dismissal is ordered deliberately: the sheet closes **before** the action
 * runs, so an action that navigates or opens another sheet never fights the
 * dismissing animation for the same frame.
 *
 * A destructive action also changes the haptic weight, so the choice feels
 * different before it is read.
 */
export function MobileActionSheet({
  isPresented,
  onDismiss,
  title,
  message,
  actions,
  cancelLabel = "Cancel",
  style,
  testID,
}: MobileActionSheetProps) {
  const { colors } = useMobileTheme()

  const handleAction = (action: MobileActionSheetAction) => {
    if (action.disabled) return

    if (action.destructive) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {})
    } else {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {})
    }

    onDismiss()
    action.onPress?.()
  }

  const handleCancel = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {})
    onDismiss()
  }

  return (
    <MobileBottomSheet
      isPresented={isPresented}
      onDismiss={onDismiss}
      snapPoints={["half"]}
      testID={testID}
      style={style}
    >
      {title ? (
        <MobileText variant="title" align="center">
          {title}
        </MobileText>
      ) : null}

      {message ? (
        <MobileText
          variant="callout"
          color="muted"
          align="center"
          style={styles.message}
        >
          {message}
        </MobileText>
      ) : null}

      <View style={styles.actions}>
        {actions.map((action) => (
          <HighlightRow
            key={action.key}
            onPress={() => handleAction(action)}
            disabled={action.disabled === true}
            accessibilityRole="button"
            accessibilityState={{ disabled: action.disabled === true }}
            style={[
              styles.action,
              {
                borderColor: colors.border,
                opacity: action.disabled ? 0.45 : 1,
              },
            ]}
          >
            <MobileText
              variant="bodyMedium"
              align="center"
              style={{
                color: action.destructive
                  ? colors.destructive
                  : colors.foreground,
                fontWeight: "600",
              }}
            >
              {action.label}
            </MobileText>
          </HighlightRow>
        ))}
      </View>

      <HighlightRow
        onPress={handleCancel}
        accessibilityRole="button"
        style={[
          styles.action,
          styles.cancel,
          { borderColor: colors.border, backgroundColor: colors.mutedBackground },
        ]}
      >
        <MobileText
          variant="bodyMedium"
          align="center"
          style={{ fontWeight: "600" }}
        >
          {cancelLabel}
        </MobileText>
      </HighlightRow>
    </MobileBottomSheet>
  )
}

const styles = StyleSheet.create({
  message: {
    marginTop: 4,
  },
  actions: {
    marginTop: 16,
  },
  action: {
    minHeight: metrics.minTouchTarget,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 12,
    borderTopWidth: 1,
  },
  rowInner: {
    alignItems: "center",
    justifyContent: "center",
  },
  cancel: {
    marginTop: 12,
    borderWidth: 1,
    borderRadius: metrics.radius.md,
  },
})
