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
import { SPRING_ENTRANCE, SPRING_EXIT, springTo } from "../../motion"
import { MobileText } from "../primitive/text"
import { MobileFab } from "../primitive/fab"
import { metrics } from "../../tokens"
import { hapticLight, hapticSelect, hitSlopFor } from "../../utils"

export interface MobileSpeedDialAction {
  /**
   * Optional icon node for the action circle. Falls back to the label's
   * first character.
   */
  icon?: React.ReactNode
  /**
   * Pill caption and screen-reader label.
   */
  label: string
  /**
   * Called on press; the dial closes itself afterwards.
   */
  onPress: () => void
}

export interface MobileSpeedDialProps {
  /**
   * Actions, rendered bottom-up above the FAB (first action nearest the FAB).
   */
  actions: MobileSpeedDialAction[]
  /**
   * Optional style override for the container.
   */
  style?: ViewStyle
}

const ACTION_SIZE = 40
/** Vertical offset of the action stack above the FAB's centre. */
const STACK_OFFSET = 72
const ACTION_GAP = 12
/** How far the oversized backdrop reaches beyond the container. */
const BACKDROP_REACH = 4000

/**
 * MobileSpeedDial
 *
 * A FAB that fans out into labelled action circles. Actions spring in
 * staggered (nearest first) so the fan reads as a sequence, not a pop; the
 * "+" glyph rotates 45° into an "×" off the same open progress value.
 *
 * The backdrop is deliberately oversized rather than screen-sized: this
 * component cannot know its parent's bounds, so it reaches far past them in
 * every direction to guarantee a tap outside the fan always closes it.
 */
export function MobileSpeedDial({ actions, style }: MobileSpeedDialProps) {
  const { colors } = useMobileTheme()
  const [open, setOpen] = React.useState(false)

  // One animated value per action drives its own opacity + translateY, so
  // the stagger is real per-item motion rather than one block fading.
  const anims = React.useRef<Animated.Value[]>([])
  if (anims.current.length !== actions.length) {
    anims.current = actions.map(() => new Animated.Value(0))
  }
  // The FAB glyph rotation shares one value; independent of the fan.
  const iconSpin = React.useRef(new Animated.Value(0)).current

  React.useEffect(() => {
    const values = anims.current
    if (open) {
      springTo(iconSpin, 1).start()
      // SPRING_ENTRANCE: underdamped, so each action pops into place with a
      // small overshoot.
      Animated.stagger(
        60,
        values.map((value) => springTo(value, 1, SPRING_ENTRANCE))
      ).start()
    } else {
      springTo(iconSpin, 0, SPRING_EXIT).start()
      // Reverse order on the way out: the outermost action leaves first, so
      // the fan folds back into the FAB instead of vanishing all at once.
      Animated.stagger(
        40,
        [...values].reverse().map((value) => springTo(value, 0, SPRING_EXIT))
      ).start()
    }
  }, [open, iconSpin])

  const close = () => {
    if (!open) return
    hapticSelect()
    setOpen(false)
  }

  const handleToggle = () => {
    hapticSelect()
    setOpen((prev) => !prev)
  }

  const handleAction = (action: MobileSpeedDialAction) => {
    hapticLight()
    action.onPress()
    close()
  }

  const rotate = iconSpin.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "45deg"],
  })

  return (
    <View
      style={[styles.container, style]}
      // While closed the fan is invisible; hiding it from assistive tech too
      // keeps focus off buttons that cannot be seen or reached.
      importantForAccessibility={open ? "auto" : "no"}
    >
      {open ? (
        <Pressable
          onPress={close}
          accessibilityRole="button"
          accessibilityLabel="Close actions"
          style={styles.backdrop}
        />
      ) : null}

      <View
        pointerEvents={open ? "auto" : "none"}
        style={[styles.stack, open ? undefined : styles.stackHidden]}
      >
        {actions.map((action, index) => {
          const value = anims.current[index]
          if (!value) return null
          return (
            <Animated.View
              key={`${action.label}-${index}`}
              style={[
                styles.action,
                {
                  opacity: value,
                  transform: [
                    {
                      translateY: value.interpolate({
                        inputRange: [0, 1],
                        outputRange: [16, 0],
                      }),
                    },
                  ],
                },
              ]}
            >
              <View
                style={[
                  styles.pill,
                  {
                    backgroundColor: colors.card,
                    borderColor: colors.cardBorder,
                  },
                ]}
              >
                <MobileText variant="caption" numberOfLines={1}>
                  {action.label}
                </MobileText>
              </View>

              <Pressable
                onPress={() => handleAction(action)}
                accessibilityRole="button"
                accessibilityLabel={action.label}
                hitSlop={hitSlopFor(ACTION_SIZE)}
                style={[
                  styles.circle,
                  {
                    backgroundColor: colors.primary,
                    shadowColor: colors.shadow,
                  },
                ]}
              >
                {action.icon ?? (
                  <MobileText
                    variant="callout"
                    style={{ color: colors.primaryForeground, fontWeight: "700" }}
                  >
                    {action.label.trim().charAt(0).toUpperCase()}
                  </MobileText>
                )}
              </Pressable>
            </Animated.View>
          )
        })}
      </View>

      <MobileFab
        onPress={handleToggle}
        icon={
          <Animated.View style={{ transform: [{ rotate }] }}>
            {/* The FAB is a filled primary surface in this design system, so
                the glyph borrows `primaryForeground` to stay legible on it. */}
            <MobileText variant="heading" style={styles.fabGlyph} color="primaryForeground">
              +
            </MobileText>
          </Animated.View>
        }
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    alignSelf: "flex-end",
    alignItems: "flex-end",
  },
  backdrop: {
    position: "absolute",
    left: -BACKDROP_REACH,
    right: -BACKDROP_REACH,
    top: -BACKDROP_REACH,
    bottom: 0,
  },
  stack: {
    position: "absolute",
    bottom: STACK_OFFSET,
    right: 0,
    alignItems: "flex-end",
    gap: ACTION_GAP,
  },
  stackHidden: {
    opacity: 0,
  },
  action: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  pill: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: metrics.radius.full,
    borderWidth: 1,
    ...Platform.select({
      ios: {
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  circle: {
    width: ACTION_SIZE,
    height: ACTION_SIZE,
    borderRadius: ACTION_SIZE / 2,
    alignItems: "center",
    justifyContent: "center",
    ...Platform.select({
      ios: {
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  fabGlyph: {
    fontWeight: "600",
    lineHeight: 28,
  },
})
