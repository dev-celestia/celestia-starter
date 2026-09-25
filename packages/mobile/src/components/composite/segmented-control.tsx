import * as React from "react"
import {
  Animated,
  Platform,
  Pressable,
  View,
  StyleSheet,
  type LayoutChangeEvent,
  type ViewStyle,
} from "react-native"
import * as Haptics from "expo-haptics"
import { useMobileTheme } from "../../host"
import { MobileText } from "../primitive/text"
import { metrics } from "../../tokens"

export interface MobileSegmentedControlOption {
  /**
   * Value reported through `onValueChange`.
   */
  value: string
  /**
   * Segment caption. Clamped to one line.
   */
  label: string
  /**
   * Disables this segment only.
   */
  disabled?: boolean
}

export interface MobileSegmentedControlProps {
  /**
   * Segments, rendered left to right at equal widths. 2–5 reads best.
   */
  options: MobileSegmentedControlOption[]
  /**
   * Currently selected value.
   */
  value: string
  /**
   * Called with the newly selected value.
   */
  onValueChange: (value: string) => void
  /**
   * Disables every segment.
   * @default false
   */
  disabled?: boolean
  /**
   * Optional style override.
   */
  style?: ViewStyle
  /**
   * Test identifier.
   */
  testID?: string
}

const INSET = 3

/**
 * MobileSegmentedControl
 *
 * Sliding-indicator segmented picker.
 *
 * The indicator animates `translateX` — a transform, so it runs on the native
 * driver and stays smooth while the JS thread is busy. That needs a measured
 * pixel width, which is why the track reports its own layout; until it has, the
 * indicator is simply not rendered rather than flashing at the wrong position.
 *
 * Selection is keyed on `value`, never the index.
 */
export function MobileSegmentedControl({
  options,
  value,
  onValueChange,
  disabled = false,
  style,
  testID,
}: MobileSegmentedControlProps) {
  const { colors } = useMobileTheme()
  const [trackWidth, setTrackWidth] = React.useState(0)
  const translateX = React.useRef(new Animated.Value(0)).current

  const count = options.length
  const segmentWidth =
    count > 0 && trackWidth > 0 ? (trackWidth - INSET * 2) / count : 0

  const activeIndex = Math.max(
    0,
    options.findIndex((option) => option.value === value)
  )

  React.useEffect(() => {
    if (segmentWidth === 0) return
    Animated.spring(translateX, {
      toValue: activeIndex * segmentWidth,
      damping: 18,
      mass: 1,
      stiffness: 220,
      useNativeDriver: Platform.OS !== "web",
    }).start()
  }, [activeIndex, segmentWidth, translateX])

  const handleLayout = (event: LayoutChangeEvent) => {
    setTrackWidth(event.nativeEvent.layout.width)
  }

  const handleSelect = (option: MobileSegmentedControlOption) => {
    if (disabled || option.disabled || option.value === value) return
    Haptics.selectionAsync().catch(() => {})
    onValueChange(option.value)
  }

  return (
    <View
      testID={testID}
      onLayout={handleLayout}
      accessibilityRole="tablist"
      style={[
        styles.container,
        {
          backgroundColor: colors.mutedBackground,
          borderColor: colors.border,
        },
        style,
      ]}
    >
      {segmentWidth > 0 ? (
        <Animated.View
          style={[
            styles.indicator,
            {
              width: segmentWidth,
              backgroundColor: colors.card,
              borderColor: colors.border,
              transform: [{ translateX }],
            },
          ]}
        />
      ) : null}

      <View style={styles.row}>
        {options.map((option) => {
          const isActive = option.value === value
          const isDisabled = disabled || option.disabled === true

          return (
            <Pressable
              key={option.value}
              onPress={() => handleSelect(option)}
              disabled={isDisabled}
              accessibilityRole="tab"
              accessibilityLabel={option.label}
              accessibilityState={{
                selected: isActive,
                disabled: isDisabled,
              }}
              style={styles.segment}
            >
              <MobileText
                variant="callout"
                numberOfLines={1}
                ellipsizeMode="tail"
                style={{
                  color: isDisabled
                    ? colors.muted
                    : isActive
                      ? colors.foreground
                      : colors.muted,
                  fontWeight: isActive ? "600" : "500",
                }}
              >
                {option.label}
              </MobileText>
            </Pressable>
          )
        })}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    padding: INSET,
    borderRadius: metrics.radius.md,
    borderWidth: 1,
  },
  indicator: {
    position: "absolute",
    top: INSET,
    bottom: INSET,
    left: INSET,
    borderRadius: metrics.radius.sm,
    borderWidth: 1,
  },
  row: {
    flexDirection: "row",
  },
  segment: {
    flex: 1,
    minHeight: 36,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 4,
  },
})
