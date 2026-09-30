import * as React from "react"
import {
  View,
  StyleSheet,
  Animated,
  type ImageSourcePropType,
  type ViewStyle,
} from "react-native"
import { useMobileTheme } from "../../host"
import { SPRING_ENTRANCE, springTo } from "../../motion"
import {
  MobileAvatar,
  mobileAvatarSizes,
  type MobileAvatarSize,
} from "../primitive/avatar"
import { MobileText } from "../primitive/text"

export interface MobileAvatarGroupItem {
  /**
   * Image source for this member.
   */
  source?: ImageSourcePropType
  /**
   * Fallback initials when there is no image.
   */
  initials?: string
  /**
   * Screen-reader description.
   */
  accessibilityLabel?: string
}

export interface MobileAvatarGroupProps {
  /**
   * Members, rendered in order. All but the last `max` collapse into a `+N` chip.
   */
  avatars: MobileAvatarGroupItem[]
  /**
   * How many avatars to show before the overflow chip.
   * @default 4
   */
  max?: number
  /**
   * Diameter preset, shared with `MobileAvatar`.
   * @default 'md'
   */
  size?: MobileAvatarSize
  /**
   * Optional style override.
   */
  style?: ViewStyle
  /**
   * Test identifier.
   */
  testID?: string
}

const OVERLAP_RATIO = 0.3

/**
 * MobileAvatarGroup
 *
 * Overlapping stack of identities with a `+N` overflow chip.
 *
 * Overlap and ring size are derived from `mobileAvatarSizes` — the same map the
 * avatar itself uses — so the stack cannot drift out of proportion if the scale
 * is ever retuned. Each avatar carries a ring in the surrounding background
 * colour, which is what makes the overlap read as a stack instead of a smear.
 */
export function MobileAvatarGroup({
  avatars,
  max = 4,
  size = "md",
  style,
  testID,
}: MobileAvatarGroupProps) {
  const { colors } = useMobileTheme()

  const diameter = mobileAvatarSizes[size]
  const overlap = Math.round(diameter * OVERLAP_RATIO)

  const limit = Math.max(0, max)
  const visible = avatars.slice(0, limit)
  const overflowCount = avatars.length - visible.length

  const ring = {
    borderColor: colors.background,
    borderWidth: 2,
    borderRadius: (diameter + 4) / 2,
  }

  // One-time stagger scale-in on mount — cheap and makes the stack feel dealt
  // rather than dropped in. Values are created lazily per slot; anything added
  // after the entrance has run starts settled (scale 1).
  const enterAnims = React.useRef<Animated.Value[]>([])
  const hasEntered = React.useRef(false)
  const totalItems = visible.length + (overflowCount > 0 ? 1 : 0)
  for (let i = 0; i < totalItems; i++) {
    if (!enterAnims.current[i]) {
      enterAnims.current[i] = new Animated.Value(hasEntered.current ? 1 : 0)
    }
  }

  React.useEffect(() => {
    hasEntered.current = true
    Animated.stagger(
      55,
      enterAnims.current.map((anim) => springTo(anim, 1, SPRING_ENTRANCE))
    ).start()
    // Mount-only: the stagger is an entrance, not a reaction to prop changes.
  }, [])

  const scaleAt = (index: number) => ({
    transform: [{ scale: enterAnims.current[index] ?? 1 }],
  })

  return (
    <View
      testID={testID}
      style={[styles.container, style]}
      accessible={overflowCount > 0}
      accessibilityLabel={
        overflowCount > 0
          ? `${avatars.length} people, ${overflowCount} more`
          : `${avatars.length} people`
      }
    >
      {visible.map((avatar, index) => (
        // biome-ignore lint/suspicious/noArrayIndexKey: items carry no stable id; the list is a fixed slice
        <Animated.View
          key={`avatar-${index}`}
          style={[
            styles.item,
            ring,
            index > 0 ? { marginLeft: -overlap } : null,
            scaleAt(index),
          ]}
        >
          <MobileAvatar
            source={avatar.source}
            initials={avatar.initials}
            size={size}
            accessibilityLabel={avatar.accessibilityLabel}
          />
        </Animated.View>
      ))}

      {overflowCount > 0 ? (
        <Animated.View
          style={[
            styles.item,
            ring,
            { marginLeft: -overlap },
            scaleAt(visible.length),
          ]}
        >
          <View
            style={[
              styles.overflow,
              {
                width: diameter,
                height: diameter,
                borderRadius: diameter / 2,
                backgroundColor: colors.mutedBackground,
              },
            ]}
          >
            <MobileText
              variant="caption"
              color="muted"
              style={styles.overflowText}
            >
              {`+${overflowCount}`}
            </MobileText>
          </View>
        </Animated.View>
      ) : null}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
  },
  item: {
    backgroundColor: "transparent",
  },
  overflow: {
    alignItems: "center",
    justifyContent: "center",
  },
  overflowText: {
    fontWeight: "600",
  },
})
