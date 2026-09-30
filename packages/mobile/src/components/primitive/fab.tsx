import * as React from "react"
import {
  Animated,
  Pressable,
  StyleSheet,
  View,
} from "react-native"
import { useMobileTheme } from "../../host"
import { usePressSpring } from "../../motion"
import { MobileText } from "./text"
import { metrics } from "../../tokens"
import { hapticLight } from "../../utils"

/** Height of the hard bottom edge, in points — same silhouette as MobileButton. */
const EDGE_HEIGHT = 2

/** Diameter of the circular FAB; also the height of the extended pill. */
const FAB_SIZE = 56

export interface MobileFabProps {
  /** Icon node rendered centred (circle) or leading (pill). */
  icon?: React.ReactNode
  /**
   * Optional label. When present the FAB extends into a pill — the Material
   * extended-FAB shape — instead of a bare circle.
   */
  label?: string
  onPress: () => void
  /** Screen-reader label. Required when the FAB is icon-only. */
  accessibilityLabel?: string
}

/**
 * MobileFab
 *
 * Floating action button: a 56pt primary-filled circle carrying the same hard
 * 2pt `elevationEdge` bottom edge as `MobileButton`. Pressing slides the
 * surface down over the edge on a 90ms timing and springs it back with the
 * house spring, and the commit fires a light haptic. Positioning is the
 * caller's job — wrap it in an absolutely positioned container.
 */
export function MobileFab({
  icon,
  label,
  onPress,
  accessibilityLabel,
}: MobileFabProps) {
  const { colors } = useMobileTheme()
  const {
    value: translateAnim,
    onPressIn: handlePressIn,
    onPressOut: handlePressOut,
  } = usePressSpring(0, EDGE_HEIGHT)

  const extended = Boolean(label)
  const borderRadius = FAB_SIZE / 2

  const handlePress = () => {
    hapticLight()
    onPress()
  }

  return (
    <View
      style={[
        styles.stack,
        { height: FAB_SIZE + EDGE_HEIGHT },
        extended ? { width: undefined } : { width: FAB_SIZE },
      ]}
    >
      {/* Sits 2pt below the surface so only its bottom strip shows — the
          silhouette a `0 2px 0 0` box-shadow casts on web. */}
      <View
        pointerEvents="none"
        style={[
          styles.edge,
          {
            backgroundColor: colors.elevationEdge,
            borderRadius,
            width: extended ? undefined : FAB_SIZE,
            left: extended ? 0 : undefined,
            right: extended ? 0 : undefined,
          },
        ]}
      />

      <Animated.View style={{ transform: [{ translateY: translateAnim }] }}>
        <Pressable
          onPress={handlePress}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          accessibilityRole="button"
          accessibilityLabel={accessibilityLabel ?? label}
          style={[
            styles.surface,
            {
              height: FAB_SIZE,
              minWidth: FAB_SIZE,
              borderRadius,
              backgroundColor: colors.primary,
              paddingHorizontal: extended ? 16 : 0,
              gap: extended ? 8 : 0,
            },
          ]}
        >
          {icon}
          {label ? (
            <MobileText
              variant="callout"
              style={{ color: colors.primaryForeground, fontWeight: "600" }}
            >
              {label}
            </MobileText>
          ) : null}
        </Pressable>
      </Animated.View>
    </View>
  )
}

const styles = StyleSheet.create({
  stack: {
    position: "relative",
    alignSelf: "flex-start",
  },
  edge: {
    position: "absolute",
    top: EDGE_HEIGHT,
    left: 0,
    width: FAB_SIZE,
    height: FAB_SIZE,
  },
  surface: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
})
