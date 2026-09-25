import * as React from "react"
import {
  Animated,
  Platform,
  Pressable,
  StyleSheet,
  View,
  type ViewStyle,
} from "react-native"
import { useMobileTheme } from "../../host"
import { MobileText } from "../primitive/text"
import { metrics } from "../../tokens"

export type MobileToastVariant = "info" | "success" | "warning" | "destructive"

export interface MobileToastAction {
  /**
   * Action caption.
   */
  label: string
  /**
   * Called on press. The toast dismisses itself immediately afterwards.
   */
  onPress: () => void
}

export interface MobileToastOptions {
  /**
   * Message text.
   */
  message: string
  /**
   * @default 'info'
   */
  variant?: MobileToastVariant
  /**
   * Auto-dismiss delay in ms. Pass `0` to keep the toast until `hide()` is
   * called — use that when the toast carries an action the user must be able to
   * reach.
   * @default 3000
   */
  duration?: number
  /**
   * Optional single action.
   */
  action?: MobileToastAction
}

export interface MobileToastProps extends MobileToastOptions {
  /**
   * Called when the toast is dismissed, by tap or by its action.
   */
  onDismiss?: () => void
  /**
   * Optional style override.
   */
  style?: ViewStyle
}

interface MobileToastContextValue {
  /**
   * Show a toast. Replaces any toast already on screen and restarts the timer.
   */
  show: (options: MobileToastOptions) => void
  /**
   * Dismiss the current toast immediately.
   */
  hide: () => void
}

const MobileToastContext = React.createContext<MobileToastContextValue | null>(
  null
)

const FADE_IN_MS = 180
const FADE_OUT_MS = 160

/**
 * MobileToast
 *
 * Presentational toast card. Rarely used directly — reach for
 * `MobileToastProvider` + `useMobileToast()` so one toast owns the screen at a
 * time.
 *
 * The tone is carried by a small accent dot plus a 12% overlay rather than by
 * colouring the text, so the message stays at full contrast in both themes.
 */
export function MobileToast({
  message,
  variant = "info",
  action,
  onDismiss,
  style,
}: MobileToastProps) {
  const { colors } = useMobileTheme()

  const accent =
    variant === "success"
      ? colors.success
      : variant === "warning"
        ? colors.warning
        : variant === "destructive"
          ? colors.destructive
          : colors.info

  const handleAction = () => {
    action?.onPress()
    onDismiss?.()
  }

  return (
    <View
      accessibilityRole="alert"
      accessibilityLiveRegion="polite"
      style={[
        styles.toast,
        { backgroundColor: colors.card, borderColor: colors.cardBorder },
        style,
      ]}
    >
      <View
        accessible={false}
        importantForAccessibility="no"
        style={[
          StyleSheet.absoluteFillObject,
          { backgroundColor: accent, opacity: 0.12 },
        ]}
      />

      <View style={styles.row}>
        <View
          accessible={false}
          importantForAccessibility="no"
          style={[styles.dot, { backgroundColor: accent }]}
        />

        <MobileText variant="callout" style={styles.message}>
          {message}
        </MobileText>

        {action ? (
          <Pressable
            onPress={handleAction}
            accessibilityRole="button"
            accessibilityLabel={action.label}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            style={styles.action}
          >
            <MobileText
              variant="callout"
              style={[styles.actionLabel, { color: colors.primary }]}
            >
              {action.label}
            </MobileText>
          </Pressable>
        ) : null}
      </View>
    </View>
  )
}

export interface MobileToastProviderProps {
  children?: React.ReactNode
  /**
   * Fallback auto-dismiss delay for toasts that do not set their own.
   * @default 3000
   */
  defaultDuration?: number
}

/**
 * MobileToastProvider
 *
 * Owns the single active toast and renders it above the app.
 *
 * **Place it inside a full-screen container** (your root `View` with `flex: 1`).
 * The overlay positions itself absolutely against its parent, so a provider
 * mounted outside a sized parent will have nowhere to anchor.
 *
 * Only one toast is shown at a time on purpose: stacking toasts on a phone
 * covers the content the user is trying to read, and a queue that outlives its
 * relevance is worse than a replaced message.
 */
export function MobileToastProvider({
  children,
  defaultDuration = 3000,
}: MobileToastProviderProps) {
  const [toast, setToast] = React.useState<MobileToastOptions | null>(null)
  const timer = React.useRef<ReturnType<typeof setTimeout> | null>(null)
  const opacity = React.useRef(new Animated.Value(0)).current

  const clearTimer = React.useCallback(() => {
    if (timer.current !== null) {
      clearTimeout(timer.current)
      timer.current = null
    }
  }, [])

  const hide = React.useCallback(() => {
    clearTimer()
    Animated.timing(opacity, {
      toValue: 0,
      duration: FADE_OUT_MS,
      useNativeDriver: Platform.OS !== "web",
    }).start(() => {
      setToast(null)
    })
  }, [clearTimer, opacity])

  const show = React.useCallback(
    (options: MobileToastOptions) => {
      clearTimer()
      setToast(options)
      opacity.setValue(0)
      Animated.timing(opacity, {
        toValue: 1,
        duration: FADE_IN_MS,
        useNativeDriver: Platform.OS !== "web",
      }).start()

      const duration = options.duration ?? defaultDuration
      if (duration > 0) {
        timer.current = setTimeout(() => {
          hide()
        }, duration)
      }
    },
    [clearTimer, defaultDuration, hide, opacity]
  )

  // A toast that outlives its screen is a leak; clear the timer on unmount.
  React.useEffect(() => clearTimer, [clearTimer])

  const value = React.useMemo<MobileToastContextValue>(
    () => ({ show, hide }),
    [show, hide]
  )

  return (
    <MobileToastContext.Provider value={value}>
      {children}

      {toast ? (
        <Animated.View
          pointerEvents="box-none"
          style={[styles.overlay, { opacity }]}
        >
          <MobileToast
            message={toast.message}
            variant={toast.variant}
            action={toast.action}
            onDismiss={hide}
          />
        </Animated.View>
      ) : null}
    </MobileToastContext.Provider>
  )
}

/**
 * useMobileToast
 *
 * Imperative toast API: `const toast = useMobileToast(); toast.show({ ... })`.
 * Throws when called outside a `MobileToastProvider`, because silently doing
 * nothing would make the missing provider very hard to find.
 */
export function useMobileToast(): MobileToastContextValue {
  const context = React.useContext(MobileToastContext)
  if (!context) {
    throw new Error(
      "useMobileToast must be used inside a <MobileToastProvider>."
    )
  }
  return context
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "flex-end",
    padding: 16,
  },
  toast: {
    width: "100%",
    borderRadius: metrics.radius.lg,
    borderWidth: 1,
    overflow: "hidden",
    ...Platform.select({
      ios: {
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.12,
        shadowRadius: 12,
      },
      android: {
        elevation: 6,
      },
    }),
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 12,
    paddingHorizontal: 14,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  message: {
    flex: 1,
  },
  action: {
    alignItems: "center",
    justifyContent: "center",
  },
  actionLabel: {
    fontWeight: "600",
  },
})
