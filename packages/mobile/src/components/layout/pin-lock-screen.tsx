import * as React from "react"
import { Animated, StyleSheet, View } from "react-native"
import { useMobileTheme } from "../../host"
import { hapticMedium } from "../../utils"
import { MobileButton } from "../primitive/button"
import { MobileText } from "../primitive/text"
import { MobilePinPad } from "../composite/pin-pad"
import { MobileScreen, type MobileScreenProps } from "./screen"

export interface MobilePinLockScreenProps extends Omit<
  MobileScreenProps,
  "children" | "footer" | "scroll" | "contentContainerStyle"
> {
  /** Headline above the dots. @default 'Enter your PIN' */
  title?: string
  /** Supporting copy, e.g. whose PIN this is. */
  message?: string
  /** Number of digits expected. @default 4 */
  pinLength?: number
  /** Called with the full PIN as soon as the last digit lands. */
  onComplete: (pin: string) => void
  /**
   * Called when the `error` prop flips to true — a hook for attempt counters
   * and lockout logic, fired once per failed attempt.
   */
  onError?: () => void
  /** Failure copy rendered above the dots, e.g. "Wrong PIN, try again". */
  errorMessage?: string
  /** Marks the current attempt as failed: destructive dots, shake, cleared PIN. */
  error?: boolean
  /** Renders the biometric affordance under the pad. */
  onBiometric?: () => void
  /** Biometric button label. @default 'Use Face ID' */
  biometricLabel?: string
  /** Disables the pad, e.g. during a lockout. */
  disabled?: boolean
}

/**
 * MobilePinLockScreen
 *
 * App-lock / wallet-unlock screen: a centred prompt, a row of PIN dots, a
 * numeric pad and an optional biometric shortcut.
 *
 * The PIN itself is the screen's own local state, exactly like the code in
 * `MobileOtpVerifyScreen` — it is transient secret material that the caller
 * only ever wants at the moment of completion, so it never round-trips through
 * props and is cleared on every failed attempt.
 *
 * Failure is expressed three ways at once because one is never enough: the dots
 * turn destructive (visual), the row shakes (motion), and a medium haptic fires
 * (touch) — the pattern the platform's own passcode entry uses.
 */
export function MobilePinLockScreen({
  title = "Enter your PIN",
  message,
  pinLength = 4,
  onComplete,
  onError,
  errorMessage,
  error = false,
  onBiometric,
  biometricLabel = "Use Face ID",
  disabled = false,
  ...screenProps
}: MobilePinLockScreenProps) {
  const { colors } = useMobileTheme()
  const [pin, setPin] = React.useState("")
  const shake = React.useRef(new Animated.Value(0)).current

  // A failed attempt: clear the dots so the user can retry immediately, buzz,
  // and shake. Driven off the `error` prop rather than a local flag because the
  // caller — not the screen — knows whether a completed PIN was wrong.
  React.useEffect(() => {
    if (!error) return
    setPin("")
    hapticMedium()
    onError?.()
    shake.setValue(0)
    Animated.sequence(
      [12, -12, 8, -8, 4, -4, 0].map((toValue) =>
        Animated.timing(shake, {
          toValue,
          duration: 45,
          useNativeDriver: true,
        })
      )
    ).start()
  }, [error, shake, onError])

  const handleKeyPress = (key: string) => {
    // The pad only emits digits, but the callback is typed `string` — guard so
    // a future key (say a letter shortcut) can never enter the secret.
    if (disabled || !/^\d$/.test(key) || pin.length >= pinLength) return
    const next = pin + key
    setPin(next)
    if (next.length === pinLength) {
      onComplete(next)
    }
  }

  const handleDelete = () => {
    if (disabled) return
    setPin((current) => current.slice(0, -1))
  }

  const dotColor = error ? colors.destructive : colors.primary
  const translateX = shake

  return (
    <MobileScreen {...screenProps} scroll={false}>
      <View style={styles.prompt}>
        <MobileText variant="heading" align="center" accessibilityRole="header">
          {title}
        </MobileText>
        {message ? (
          <MobileText
            variant="body"
            color="muted"
            align="center"
            style={styles.message}
          >
            {message}
          </MobileText>
        ) : null}
        {errorMessage && error ? (
          <MobileText
            variant="callout"
            color="destructive"
            align="center"
            accessibilityRole="alert"
            style={styles.message}
          >
            {errorMessage}
          </MobileText>
        ) : null}

        <Animated.View
          accessibilityLabel={`PIN entry, ${pin.length} of ${pinLength} digits entered`}
          style={[styles.dots, { transform: [{ translateX }] }]}
        >
          {Array.from({ length: pinLength }, (_, index) => (
            <View
              key={`pin-dot-${index}`}
              style={[
                styles.dot,
                index < pin.length
                  ? { backgroundColor: dotColor, borderColor: dotColor }
                  : {
                      backgroundColor: "transparent",
                      borderColor: error ? colors.destructive : colors.border,
                    },
              ]}
            />
          ))}
        </Animated.View>
      </View>

      <View style={styles.padBlock}>
        <MobilePinPad
          onKeyPress={handleKeyPress}
          onDelete={handleDelete}
          disabled={disabled}
        />
        {onBiometric ? (
          <MobileButton
            variant="ghost"
            onPress={onBiometric}
            disabled={disabled}
            containerStyle={styles.biometric}
            accessibilityHint="Unlocks with biometrics"
          >
            {biometricLabel}
          </MobileButton>
        ) : null}
      </View>
    </MobileScreen>
  )
}

const DOT_SIZE = 14

const styles = StyleSheet.create({
  prompt: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 32,
  },
  message: {
    marginTop: 8,
  },
  dots: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 18,
    marginTop: 32,
  },
  dot: {
    width: DOT_SIZE,
    height: DOT_SIZE,
    borderRadius: DOT_SIZE / 2,
    borderWidth: 2,
  },
  padBlock: {
    paddingHorizontal: 24,
    alignItems: "center",
    gap: 4,
  },
  biometric: {
    alignSelf: "center",
    marginTop: 8,
  },
})
