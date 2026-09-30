import * as React from "react"
import {
  View,
  StyleSheet,
  type ViewStyle,
  Animated,
  Pressable,
} from "react-native"
import * as Haptics from "expo-haptics"
import { useMobileTheme } from "../../host"
import { springTo } from "../../motion"
import { MobileText } from "./text"
import { metrics } from "../../tokens"

/** Geometry of the drawn switch, in points. */
const TRACK_WIDTH = 51
const TRACK_HEIGHT = 31
const THUMB_SIZE = 25
const THUMB_MARGIN = 3
/** Distance the thumb travels between off and on. */
const TRAVEL = TRACK_WIDTH - THUMB_SIZE - THUMB_MARGIN * 2

export interface MobileSwitchProps {
  /**
   * Whether the switch is on.
   */
  value: boolean
  /**
   * Called when the user toggles the switch.
   */
  onValueChange: (value: boolean) => void
  /**
   * Optional text label displayed alongside the switch.
   */
  label?: string
  /**
   * Optional sub-label or description.
   */
  description?: string
  /**
   * Whether the switch is disabled.
   * @default false
   */
  disabled?: boolean
  /**
   * Optional style override for the container row.
   */
  style?: ViewStyle
  /**
   * Test identifier.
   */
  testID?: string
  /**
   * Screen-reader label for the switch itself. Falls back to `label` when
   * omitted — but the visible label is rendered as a *sibling*, so without this
   * an unlabelled switch is announced as just "switch".
   */
  accessibilityLabel?: string
  /**
   * Screen-reader hint describing what toggling will do.
   */
  accessibilityHint?: string
}

/**
 * MobileSwitch
 *
 * Toggle with selection haptics and a 44pt touch area.
 *
 * The switch is drawn rather than hosted as a native `@expo/ui` control, so it
 * can animate: the thumb travels on an `Animated.spring`, and the track colour
 * crossfades between two stacked off/on layers via opacity (colour strings are
 * never interpolated).
 */
export function MobileSwitch({
  value,
  onValueChange,
  label,
  description,
  disabled = false,
  style,
  testID,
  accessibilityLabel,
  accessibilityHint,
}: MobileSwitchProps) {
  const { colors } = useMobileTheme()
  const thumbAnim = React.useRef(new Animated.Value(value ? 1 : 0)).current

  React.useEffect(() => {
    if (disabled) {
      thumbAnim.setValue(value ? 1 : 0)
      return
    }
    springTo(thumbAnim, value ? 1 : 0).start()
  }, [value, disabled, thumbAnim])

  const handlePress = () => {
    if (disabled) return
    Haptics.selectionAsync().catch(() => {})
    onValueChange(!value)
  }

  // The track is 31pt tall; vertical slop closes the gap to the 44pt floor.
  const hitSlop = Math.ceil((metrics.minTouchTarget - TRACK_HEIGHT) / 2)

  const switchElement = (
    <Pressable
      onPress={handlePress}
      disabled={disabled}
      testID={testID}
      accessibilityRole="switch"
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityHint={accessibilityHint}
      accessibilityState={{ checked: value, disabled }}
      hitSlop={{ top: hitSlop, bottom: hitSlop, left: 0, right: 0 }}
      style={[styles.track, { opacity: disabled ? 0.5 : 1 }]}
    >
      <View
        style={[styles.trackLayer, { backgroundColor: colors.inputBorder }]}
      />
      <Animated.View
        pointerEvents="none"
        style={[
          styles.trackLayer,
          { backgroundColor: colors.primary, opacity: thumbAnim },
        ]}
      />
      <Animated.View
        pointerEvents="none"
        style={[
          styles.thumb,
          {
            backgroundColor: colors.background,
            transform: [
              {
                translateX: thumbAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, TRAVEL],
                }),
              },
            ],
          },
        ]}
      />
    </Pressable>
  )

  if (!label) {
    return <View style={[styles.standalone, style]}>{switchElement}</View>
  }

  return (
    <View style={[styles.container, style]}>
      <View style={styles.textContainer}>
        <MobileText variant="bodyMedium">{label}</MobileText>
        {description ? (
          <MobileText
            variant="caption"
            color="muted"
            style={styles.description}
          >
            {description}
          </MobileText>
        ) : null}
      </View>
      {switchElement}
    </View>
  )
}

const styles = StyleSheet.create({
  standalone: {
    minHeight: metrics.minTouchTarget,
    minWidth: metrics.minTouchTarget,
    alignItems: "center",
    justifyContent: "center",
  },
  container: {
    minHeight: metrics.minTouchTarget,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 8,
  },
  textContainer: {
    flex: 1,
    paddingRight: 16,
  },
  description: {
    marginTop: 2,
  },
  track: {
    width: TRACK_WIDTH,
    height: TRACK_HEIGHT,
    borderRadius: TRACK_HEIGHT / 2,
    justifyContent: "center",
  },
  trackLayer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: TRACK_HEIGHT / 2,
  },
  thumb: {
    position: "absolute",
    left: THUMB_MARGIN,
    width: THUMB_SIZE,
    height: THUMB_SIZE,
    borderRadius: THUMB_SIZE / 2,
  },
})
