import * as React from "react"
import {
  StyleSheet,
  TextInput,
  View,
  Animated,
  type TextInputKeyPressEvent,
  type ViewStyle,
} from "react-native"
import * as Haptics from "expo-haptics"
import { useMobileTheme } from "../../host"
import { SPRING_SNAPPY, SPRING_SOFT, springTo } from "../../motion"
import { MobileText } from "./text"
import { metrics } from "../../tokens"

export interface MobileOtpInputProps {
  /**
   * Number of digits expected.
   * @default 6
   */
  length?: number
  /**
   * Current code. Digits only; non-numeric input is stripped.
   */
  value: string
  /**
   * Called on every edit with the sanitised, length-clamped value.
   */
  onValueChange: (value: string) => void
  /**
   * Called once when the code reaches `length` digits.
   */
  onComplete?: (value: string) => void
  /**
   * Focus the field as soon as it mounts.
   * @default false
   */
  autoFocus?: boolean
  /**
   * Whether the field is disabled.
   * @default false
   */
  disabled?: boolean
  /**
   * Masks entered digits, for one-time-password style secrets.
   * @default false
   */
  secure?: boolean
  /**
   * Error message, or `true` for a border-only error state.
   */
  error?: boolean | string
  /**
   * Optional style override for the cell row.
   */
  style?: ViewStyle
  /**
   * Test identifier.
   */
  testID?: string
}

/**
 * MobileOtpInput
 *
 * Fixed-length code entry (SMS / email verification, 2FA).
 *
 * Implementation note: this renders N presentational cells over **one** hidden
 * `TextInput` that fills the row and owns the real value. That is deliberate —
 * N independent inputs produce caret jumps, race conditions on paste, and broken
 * SMS autofill. A single field gets `textContentType="oneTimeCode"` so iOS and
 * Android can autofill the whole code in one tap.
 *
 * Tapping anywhere in the row focuses that field, and a light haptic fires each
 * time the code is completed.
 *
 * Animation: each cell pops with a spring scale whenever its character is
 * entered or removed, and the active cell's primary border is a stacked overlay
 * layer crossfaded in via opacity (colour strings are never interpolated).
 */
export function MobileOtpInput({
  length = 6,
  value,
  onValueChange,
  onComplete,
  autoFocus = false,
  disabled = false,
  secure = false,
  error,
  style,
  testID,
}: MobileOtpInputProps) {
  const { colors } = useMobileTheme()
  const inputRef = React.useRef<React.ComponentRef<typeof TextInput>>(null)
  const hasCompleted = React.useRef(false)

  const digits = React.useMemo(() => value.split(""), [value])
  const activeIndex = Math.min(value.length, length - 1)

  const borderColor = error
    ? colors.destructive
    : value.length === length
      ? colors.primary
      : colors.inputBorder

  const handleChangeText = (text: string) => {
    const cleaned = text.replace(/[^0-9]/g, "").slice(0, length)
    onValueChange(cleaned)

    if (cleaned.length === length) {
      if (!hasCompleted.current) {
        hasCompleted.current = true
        Haptics.notificationAsync(
          Haptics.NotificationFeedbackType.Success
        ).catch(() => {})
        onComplete?.(cleaned)
      }
    } else {
      hasCompleted.current = false
    }
  }

  const handleKeyPress = (event: TextInputKeyPressEvent) => {
    // Backspace on an empty field should clear the previous digit rather than
    // do nothing, which is what users expect from a code entry.
    if (event.nativeEvent.key === "Backspace" && value.length === 0) {
      onValueChange("")
    }
  }

  return (
    <View style={style}>
      <View
        style={styles.row}
        accessible={false}
        importantForAccessibility="no-hide-descendants"
      >
        {Array.from({ length }).map((_, index) => {
          const char = digits[index] ?? ""
          const isActive = index === activeIndex && !disabled

          return (
            // biome-ignore lint/suspicious/noArrayIndexKey: cells are generated from a fixed count and never reordered
            <OtpCell
              key={`otp-cell-${index}`}
              char={char}
              isActive={isActive}
              disabled={disabled}
              secure={secure}
              borderColor={borderColor}
              surfaceColor={colors.surface}
              primaryColor={colors.primary}
            />
          )
        })}
      </View>

      <TextInput
        ref={inputRef}
        testID={testID}
        value={value}
        onChangeText={handleChangeText}
        onKeyPress={handleKeyPress}
        editable={!disabled}
        autoFocus={autoFocus}
        maxLength={length}
        keyboardType="number-pad"
        textContentType="oneTimeCode"
        autoComplete="one-time-code"
        caretHidden
        accessibilityLabel={`${length}-digit verification code`}
        accessibilityValue={{ text: `${value.length} of ${length} digits entered` }}
        style={styles.hiddenInput}
      />

      {typeof error === "string" && error.length > 0 ? (
        <MobileText
          variant="caption"
          style={[styles.error, { color: colors.destructive }]}
        >
          {error}
        </MobileText>
      ) : null}
    </View>
  )
}

/**
 * A single presentational OTP cell.
 *
 * Animation: the cell "pops" (spring scale 1 → 1.15 → 1) whenever its
 * character is entered or removed, and the active-cell primary border is a
 * stacked overlay layer crossfaded in via an opacity spring — colour strings
 * are never interpolated. Disabled cells skip both animations.
 */
function OtpCell({
  char,
  isActive,
  disabled,
  secure,
  borderColor,
  surfaceColor,
  primaryColor,
}: {
  char: string
  isActive: boolean
  disabled: boolean
  secure: boolean
  borderColor: string
  surfaceColor: string
  primaryColor: string
}) {
  const popAnim = React.useRef(new Animated.Value(1)).current
  const focusAnim = React.useRef(new Animated.Value(isActive ? 1 : 0)).current
  const prevChar = React.useRef(char)

  React.useEffect(() => {
    if (prevChar.current === char) return
    prevChar.current = char
    if (disabled) return
    popAnim.setValue(1.15)
    springTo(popAnim, 1, SPRING_SNAPPY).start()
  }, [char, disabled, popAnim])

  React.useEffect(() => {
    if (disabled) {
      focusAnim.setValue(isActive ? 1 : 0)
      return
    }
    springTo(focusAnim, isActive ? 1 : 0, SPRING_SOFT).start()
  }, [isActive, disabled, focusAnim])

  return (
    <Animated.View
      style={[
        styles.cell,
        {
          borderColor,
          backgroundColor: surfaceColor,
          opacity: disabled ? 0.5 : 1,
          transform: [{ scale: popAnim }],
        },
      ]}
    >
      <Animated.View
        pointerEvents="none"
        style={[
          styles.cellFocusRing,
          { borderColor: primaryColor, opacity: focusAnim },
        ]}
      />
      {char ? (
        <MobileText variant="title">{secure ? "•" : char}</MobileText>
      ) : null}
    </Animated.View>
  )
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    gap: 8,
  },
  cell: {
    flex: 1,
    minHeight: metrics.minTouchTarget,
    borderWidth: 1,
    borderRadius: metrics.radius.md,
    alignItems: "center",
    justifyContent: "center",
  },
  // Sits exactly over the cell's 1px border (children are laid out inside the
  // border box, hence the -1 insets) and crossfades in on the active cell.
  cellFocusRing: {
    position: "absolute",
    top: -1,
    left: -1,
    right: -1,
    bottom: -1,
    borderWidth: 1,
    borderRadius: metrics.radius.md + 1,
  },
  hiddenInput: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    opacity: 0.01,
    fontSize: 16,
  },
  error: {
    marginTop: 6,
  },
})
