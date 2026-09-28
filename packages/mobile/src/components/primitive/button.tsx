import * as React from "react"
import {
  Pressable,
  StyleSheet,
  View,
  type ViewStyle,
  Animated,
  Platform,
} from "react-native"
import * as Haptics from "expo-haptics"
import { useMobileTheme } from "../../host"
import { MobileText } from "./text"
import { metrics } from "../../tokens"
import { isTextChildren } from "../../utils"

export type MobileButtonVariant =
  | "default"
  | "destructive"
  | "outline"
  | "secondary"
  | "ghost"
export type MobileButtonSize = "sm" | "default" | "lg"

/** Height of the hard bottom edge, in points. Web draws the same 2px. */
const EDGE_HEIGHT = 2

/**
 * Nominal surface heights, transcribed from the web button's `size` variants
 * (`h-6` / `h-8` / `h-9`) along with their `px-*` and `gap-*` steps.
 *
 * The visible control is deliberately shorter than the 44pt touch target.
 * `hitSlop` closes that gap rather than the box, so the control keeps the web
 * button's proportions while staying thumb-sized.
 */
const SIZES: Record<
  MobileButtonSize,
  { minHeight: number; paddingHorizontal: number; gap: number }
> = {
  sm: { minHeight: 24, paddingHorizontal: 10, gap: 4 },
  default: { minHeight: 32, paddingHorizontal: 12, gap: 6 },
  lg: { minHeight: 36, paddingHorizontal: 14, gap: 6 },
}

export interface MobileButtonProps {
  /**
   * Button text label or React children.
   */
  children?: React.ReactNode
  /**
   * Visual variant matching Celestia UI design system.
   *
   * Note that `default` is an *outlined* button, not a filled one — the web
   * component's `default` is white with a primary border and label, and a
   * filled call to action is `secondary`. `destructive` is the one filled
   * red.
   * @default 'default'
   */
  variant?: MobileButtonVariant
  /**
   * Button size affecting height and padding.
   * @default 'default'
   */
  size?: MobileButtonSize
  /**
   * Called when the button is pressed.
   */
  onPress?: () => void
  /**
   * Whether the button is disabled.
   * @default false
   */
  disabled?: boolean
  /**
   * Optional custom style override for the pressable surface. Use this for
   * padding, background and border — anything that *is* the button.
   */
  style?: ViewStyle
  /**
   * Style for the animated wrapper around the pressable surface. Use this for
   * anything that positions the button as a box in a layout — `flex`, `margin`,
   * `alignSelf` — because the wrapper, not the surface, is the element the
   * parent lays out. Without it a button cannot be stretched inside a row.
   */
  containerStyle?: ViewStyle
  /**
   * Optional test ID for automation.
   */
  testID?: string
  /**
   * Screen-reader label. Effectively required whenever the button renders an
   * icon or any non-text child, since there is then no text to announce.
   */
  accessibilityLabel?: string
  /**
   * Screen-reader hint describing what pressing will do.
   */
  accessibilityHint?: string
}

/**
 * MobileButton
 *
 * The native transcription of `@celestia-project/ui`'s `Button`, so a screen
 * written against the web design system reads the same on iOS and Android.
 *
 * Three things make the web button recognisable, and all three are carried
 * over:
 *
 * 1. **A 32px surface.** The web button is `h-8`; so is this one. The 44pt
 *    minimum touch target is met with `hitSlop`, not by inflating the box —
 *    the visible control and the tappable control are different sizes on
 *    purpose, and only the tappable one is constrained.
 * 2. **A hard 2px bottom edge.** Web draws it as `shadow-3d-*` — a solid,
 *    zero-blur shadow offset 2px down. React Native has no such shadow, so the
 *    edge is a real layer behind the surface, and pressing slides the surface
 *    down over it. That is the same thing `active:translate-y-[2px]
 *    active:shadow-none` does.
 * 3. **The variant palette.** `default` is outlined, `secondary` is the filled
 *    neutral, `destructive` is the filled red, `ghost` has no chrome at all.
 *    This mirrors the web component, including the fact that web's own
 *    sign-in page submits with the outlined `default`.
 *
 * Haptics still fire on the causal commit frame — Light for a normal press,
 * Medium for a destructive one.
 */
export function MobileButton({
  children,
  variant = "default",
  size = "default",
  onPress,
  disabled = false,
  style,
  containerStyle,
  testID,
  accessibilityLabel,
  accessibilityHint,
}: MobileButtonProps) {
  const { colors } = useMobileTheme()
  const translateAnim = React.useRef(new Animated.Value(0)).current

  const handlePressIn = () => {
    if (disabled) return
    Animated.timing(translateAnim, {
      toValue: EDGE_HEIGHT,
      duration: 90,
      useNativeDriver: Platform.OS !== "web",
    }).start()
  }

  const handlePressOut = () => {
    if (disabled) return
    Animated.spring(translateAnim, {
      toValue: 0,
      damping: 18,
      mass: 1,
      stiffness: 320,
      useNativeDriver: Platform.OS !== "web",
    }).start()
  }

  const handlePress = () => {
    if (disabled || !onPress) return
    // Haptics fired on the causal commit frame (expo-animation)
    if (variant === "destructive") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {})
    } else {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {})
    }
    onPress()
  }

  const currentSize = SIZES[size]
  // `rounded-sm` on the web component resolves to 6px at the default
  // `--radius`, and every size inherits it.
  const borderRadius = metrics.radius.sm

  // Vertical only. A horizontal slop reaches into whatever sits beside the
  // button, and React Native resolves an overlap in favour of the sibling drawn
  // last — so widening a row of buttons sideways leaves its left neighbour
  // partly untappable. A labelled button is already at least 44pt wide.
  const hitSlop = Math.max(
    0,
    Math.ceil((metrics.minTouchTarget - currentSize.minHeight) / 2)
  )

  const getVariantStyles = (): {
    backgroundColor: string
    borderColor: string
    textColor: string
    /** `null` for `ghost`, which carries no edge on web either. */
    edgeColor: string | null
  } => {
    switch (variant) {
      case "destructive":
        return {
          backgroundColor: colors.destructive,
          borderColor: colors.destructive,
          textColor: colors.destructiveForeground,
          edgeColor: colors.destructiveEdge,
        }
      case "outline":
        return {
          backgroundColor: colors.background,
          borderColor: colors.border,
          textColor: colors.foreground,
          edgeColor: colors.elevationEdge,
        }
      case "secondary":
        return {
          backgroundColor: colors.secondary,
          borderColor: colors.secondary,
          textColor: colors.secondaryForeground,
          edgeColor: colors.elevationEdge,
        }
      case "ghost":
        return {
          backgroundColor: "transparent",
          borderColor: "transparent",
          textColor: colors.foreground,
          edgeColor: null,
        }
      case "default":
      default:
        return {
          backgroundColor: colors.background,
          borderColor: colors.primary,
          textColor: colors.primary,
          edgeColor: colors.primaryEdge,
        }
    }
  }

  const { backgroundColor, borderColor, textColor, edgeColor } =
    getVariantStyles()

  return (
    <Animated.View style={[styles.stack, containerStyle]}>
      {edgeColor ? (
        <View
          pointerEvents="none"
          style={[styles.edge, { backgroundColor: edgeColor, borderRadius }]}
        />
      ) : null}

      <Animated.View style={{ transform: [{ translateY: translateAnim }] }}>
        <Pressable
          onPress={handlePress}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          disabled={disabled}
          testID={testID}
          accessibilityRole="button"
          accessibilityLabel={accessibilityLabel}
          accessibilityHint={accessibilityHint}
          accessibilityState={{ disabled }}
          hitSlop={{ top: hitSlop, bottom: hitSlop, left: 0, right: 0 }}
          style={[
            styles.surface,
            {
              minHeight: currentSize.minHeight,
              paddingHorizontal: currentSize.paddingHorizontal,
              gap: currentSize.gap,
              borderRadius,
              backgroundColor,
              borderColor,
              opacity: disabled ? 0.5 : 1,
            },
            style,
          ]}
        >
          {isTextChildren(children) ? (
            <MobileText
              variant="caption"
              style={{
                color: textColor,
                // Web puts `text-xs/relaxed font-medium` on every size — 12px
                // at 19.5px leading, weight 500 — so the label never changes
                // step with the box.
                lineHeight: 20,
                fontWeight: "500",
              }}
            >
              {children}
            </MobileText>
          ) : (
            children
          )}
        </Pressable>
      </Animated.View>
    </Animated.View>
  )
}

const styles = StyleSheet.create({
  stack: {
    position: "relative",
  },
  // Sits behind the surface and 2pt lower, so only its bottom strip shows —
  // which is the silhouette a `0 2px 0 0` box-shadow casts. The surface slides
  // down over it on press.
  edge: {
    position: "absolute",
    left: 0,
    right: 0,
    top: EDGE_HEIGHT,
    bottom: -EDGE_HEIGHT,
  },
  surface: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
  },
})
