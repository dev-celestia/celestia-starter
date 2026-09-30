import {
  Animated,
  Pressable,
  StyleSheet,
  View,
  type ViewStyle,
} from "react-native"
import { useSpringValue } from "../../motion"
import { MobileText } from "../primitive/text"
import { MobileCheckbox } from "../primitive/checkbox"
import { metrics } from "../../tokens"

export interface MobileTaskRowProps {
  /**
   * Task title.
   */
  title: string
  /**
   * Optional secondary line (due date, list name).
   */
  subtitle?: string
  /**
   * Whether the task is complete.
   */
  done: boolean
  /**
   * Called with the next state when the row or the box is tapped.
   */
  onToggle: (done: boolean) => void
  /**
   * Optional style override.
   */
  style?: ViewStyle
}

/**
 * MobileTaskRow
 *
 * Checkbox + title + optional subtitle; the whole row is the touch target.
 *
 * The done state crossfades between two stacked copies of the title —
 * regular, and struck-through-muted — because `textDecorationLine` and
 * colour are not animatable properties. Two opaque layers on one spring
 * read as a single continuous fade, and stay on the native driver.
 */
export function MobileTaskRow({
  title,
  subtitle,
  done,
  onToggle,
  style,
}: MobileTaskRowProps) {
  // The done crossfade chases `done` with the house spring, seeded at the
  // current target so the first render never animates in from zero.
  const doneAnim = useSpringValue(done ? 1 : 0)

  const toggle = () => onToggle(!done)

  return (
    <Pressable
      onPress={toggle}
      accessibilityRole="checkbox"
      accessibilityState={{ checked: done }}
      accessibilityLabel={title}
      style={[styles.row, style]}
    >
      {/* The checkbox runs its own press handling and tick animation; nested
          pressables resolve to the innermost one, so both targets work. */}
      <MobileCheckbox checked={done} onCheckedChange={onToggle} />

      <View style={styles.text}>
        <View>
          <Animated.View
            style={{
              opacity: doneAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [1, 0],
              }),
            }}
          >
            <MobileText variant="body" numberOfLines={2}>
              {title}
            </MobileText>
          </Animated.View>
          <Animated.View
            pointerEvents="none"
            style={[
              StyleSheet.absoluteFill,
              { opacity: doneAnim },
            ]}
          >
            <MobileText
              variant="body"
              color="muted"
              numberOfLines={2}
              style={styles.struck}
            >
              {title}
            </MobileText>
          </Animated.View>
        </View>

        {subtitle ? (
          <MobileText
            variant="caption"
            color="muted"
            numberOfLines={1}
            style={styles.subtitle}
          >
            {subtitle}
          </MobileText>
        ) : null}
      </View>
    </Pressable>
  )
}

const styles = StyleSheet.create({
  row: {
    minHeight: metrics.minTouchTarget,
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 6,
    gap: 4,
  },
  text: {
    flex: 1,
    paddingVertical: 4,
  },
  struck: {
    textDecorationLine: "line-through",
  },
  subtitle: {
    marginTop: 2,
  },
})
